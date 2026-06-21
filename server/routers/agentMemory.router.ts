import { getEmbeddingModel } from "../utils/modelRouter";
/**
 * Agent Memory Router
 *
 * P2-1 / P2-5: Implements real agent memory persistence with:
 * - store: Save a memory entry with OpenAI text-embedding-3-small vector
 * - retrieve: Semantic similarity search over stored memories
 * - list: Paginated list of memories for a user/category
 * - forget: Delete a specific memory entry
 *
 * Embeddings are stored as JSON arrays (portable, no pgvector extension required).
 * Cosine similarity is computed in-process for retrieval.
 */
import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import OpenAI from "openai";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { memoryBank } from "../../drizzle/schema";

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  return new OpenAI({ apiKey });
}

/**
 * Compute cosine similarity between two numeric vectors.
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

/**
 * Generate an embedding for a text string using OpenAI.
 */
async function embed(text: string): Promise<number[]> {
  const openai = getOpenAIClient();
  const response = await openai.embeddings.create({
    model: getEmbeddingModel(),
    input: text.slice(0, 8000), // Stay within token limit
  });
  return response.data[0].embedding;
}

export const agentMemoryRouter = router({
  /**
   * Store a memory entry with an embedding vector.
   * Upserts on (userId, category, key) to avoid duplicates.
   */
  store: protectedProcedure
    .input(
      z.object({
        category: z.string().min(1).max(100),
        key: z.string().min(1).max(200),
        value: z.string().min(1),
        confidence: z.number().min(0).max(1).default(1.0),
        source: z.string().max(100).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Generate embedding for semantic search
      const embedding = await embed(`${input.key}: ${input.value}`);

      // Check if a memory with this key already exists
      const existing = await db
        .select({ id: memoryBank.id })
        .from(memoryBank)
        .where(
          and(
            eq(memoryBank.userId, ctx.user.id),
            eq(memoryBank.category, input.category),
            eq(memoryBank.key, input.key)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        // Update existing memory
        await db
          .update(memoryBank)
          .set({
            value: input.value,
            confidence: input.confidence,
            source: input.source ?? null,
            embedding: embedding as unknown as null,
            updatedAt: new Date(),
          })
          .where(eq(memoryBank.id, existing[0].id));
        return { id: existing[0].id, action: "updated" as const };
      }

      // Insert new memory
      const [inserted] = await db
        .insert(memoryBank)
        .values({
          userId: ctx.user.id,
          category: input.category,
          key: input.key,
          value: input.value,
          confidence: input.confidence,
          source: input.source ?? null,
          embedding: embedding as unknown as null,
        })
        .returning({ id: memoryBank.id });

      return { id: inserted.id, action: "created" as const };
    }),

  /**
   * Semantic similarity search over the user's memory bank.
   * Returns the top-k most relevant memories for a query string.
   */
  retrieve: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
        category: z.string().optional(),
        topK: z.number().int().min(1).max(20).default(5),
        minSimilarity: z.number().min(0).max(1).default(0.3),
      })
    )
    .query(async ({ input, ctx }) => {
      // Generate query embedding
      const queryEmbedding = await embed(input.query);

      // Fetch all memories for this user (optionally filtered by category)
      const conditions = [eq(memoryBank.userId, ctx.user.id)];
      if (input.category) {
        conditions.push(eq(memoryBank.category, input.category));
      }

      const memories = await db
        .select()
        .from(memoryBank)
        .where(and(...conditions))
        .orderBy(desc(memoryBank.updatedAt))
        .limit(500); // Cap to avoid excessive processing

      // Compute cosine similarity for each memory that has an embedding
      const scored = memories
        .map(m => {
          const emb = m.embedding as unknown as number[] | null;
          const similarity =
            emb && Array.isArray(emb)
              ? cosineSimilarity(queryEmbedding, emb)
              : 0;
          return { ...m, similarity };
        })
        .filter(m => m.similarity >= input.minSimilarity)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, input.topK);

      // Update lastAccessed timestamp for retrieved memories
      if (scored.length > 0) {
        const ids = scored.map(m => m.id);
        await Promise.all(
          ids.map(id =>
            db
              .update(memoryBank)
              .set({ lastAccessed: new Date() })
              .where(eq(memoryBank.id, id))
          )
        );
      }

      return scored.map(m => ({
        id: m.id,
        category: m.category,
        key: m.key,
        value: m.value,
        confidence: m.confidence,
        source: m.source,
        similarity: Math.round(m.similarity * 100) / 100,
        lastAccessed: m.lastAccessed?.toISOString() ?? null,
        createdAt: m.createdAt.toISOString(),
      }));
    }),

  /**
   * List all memories for the current user, paginated.
   */
  list: protectedProcedure
    .input(
      z.object({
        category: z.string().optional(),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const conditions = [eq(memoryBank.userId, ctx.user.id)];
      if (input.category) {
        conditions.push(eq(memoryBank.category, input.category));
      }

      const memories = await db
        .select({
          id: memoryBank.id,
          category: memoryBank.category,
          key: memoryBank.key,
          value: memoryBank.value,
          confidence: memoryBank.confidence,
          source: memoryBank.source,
          lastAccessed: memoryBank.lastAccessed,
          createdAt: memoryBank.createdAt,
        })
        .from(memoryBank)
        .where(and(...conditions))
        .orderBy(desc(memoryBank.updatedAt))
        .limit(input.limit)
        .offset(input.offset);

      return memories.map(m => ({
        ...m,
        lastAccessed: m.lastAccessed?.toISOString() ?? null,
        createdAt: m.createdAt.toISOString(),
      }));
    }),

  /**
   * Delete a specific memory entry.
   */
  forget: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input, ctx }) => {
      await db
        .delete(memoryBank)
        .where(
          and(eq(memoryBank.id, input.id), eq(memoryBank.userId, ctx.user.id))
        );
      return { success: true };
    }),
});
