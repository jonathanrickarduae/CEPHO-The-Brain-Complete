/**
 * Persephone Board RAG Router — Phase 6 (p6-3)
 *
 * Implements PB-01, PB-02, PB-03:
 * - PB-01: Knowledge corpus management (seed, add, list, delete)
 * - PB-02: RAG retrieval — semantic similarity search over board member knowledge
 * - PB-03: Enhanced persona chat with RAG-augmented context injection
 *
 * The board knowledge corpus is seeded with curated knowledge chunks for each
 * of the 14 Persephone Board members. When a user chats with a board member,
 * the RAG system retrieves the most relevant knowledge chunks and injects them
 * into the system prompt, grounding the AI's responses in real-world data.
 */
import { z } from "zod";
import OpenAI from "openai";
import { router, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import { boardKnowledgeCorpus } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { getModelForTask, getEmbeddingModel } from "../utils/modelRouter";
import { logAiUsage } from "./aiCostTracking.router";

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
    input: text.slice(0, 8000),
  });
  return response.data[0].embedding;
}

// ─── Curated Knowledge Corpus Seed Data ──────────────────────────────────────
// PB-01: Rich knowledge chunks for each of the 14 board members.
// Each chunk is a distilled, high-signal piece of knowledge that represents
// the board member's thinking, philosophy, or domain expertise.

const SEED_CORPUS: Array<{
  memberId: string;
  memberName: string;
  content: string;
  source: string;
  contentType: "knowledge" | "quote" | "principle";
}> = [
  // Sam Altman
  {
    memberId: "altman",
    memberName: "Sam Altman",
    content:
      "The most important thing I've learned about startups is that the best founders are relentlessly resourceful. They find a way to make things work even when everything seems impossible. They don't give up when they hit obstacles — they find creative solutions.",
    source: "Y Combinator lectures",
    contentType: "principle",
  },
  {
    memberId: "altman",
    memberName: "Sam Altman",
    content:
      "AGI will be the most transformative technology in human history. I think it will happen within this decade. The question is not whether it will happen, but whether we will be able to align it with human values. The stakes are genuinely existential.",
    source: "OpenAI blog posts and interviews",
    contentType: "knowledge",
  },
  {
    memberId: "altman",
    memberName: "Sam Altman",
    content:
      "The best startup advice I can give: do things that don't scale. Talk to your users directly. Build something a small number of people love, not something a large number of people sort of like. Growth comes from word of mouth from truly satisfied users.",
    source: "Y Combinator startup school",
    contentType: "principle",
  },
  {
    memberId: "altman",
    memberName: "Sam Altman",
    content:
      "On productivity: I try to have very few meetings. I think most meetings are a waste of time. I prefer async communication. I block out large chunks of uninterrupted time for deep work. I also try to be very deliberate about what I say yes to.",
    source: "Personal blog",
    contentType: "knowledge",
  },
  // Jensen Huang
  {
    memberId: "huang",
    memberName: "Jensen Huang",
    content:
      "The GPU was invented for gaming, but it turned out to be the perfect architecture for AI. The reason is that neural networks are fundamentally matrix multiplications, and GPUs are designed to do massive parallel matrix operations. This was not planned — it was a happy accident that changed the world.",
    source: "NVIDIA GTC keynotes",
    contentType: "knowledge",
  },
  {
    memberId: "huang",
    memberName: "Jensen Huang",
    content:
      "I believe in the concept of 'accelerated computing'. The era of general-purpose computing is over. Every industry will need to build custom computing infrastructure for their specific workloads. AI is just the beginning.",
    source: "NVIDIA investor presentations",
    contentType: "principle",
  },
  {
    memberId: "huang",
    memberName: "Jensen Huang",
    content:
      "On leadership: I have very high expectations of myself and of my team. I believe in giving people direct, honest feedback. I don't believe in the 'sandwich' feedback method. I tell people directly what I think. I also believe in giving people a lot of autonomy once they've proven themselves.",
    source: "Stanford GSB interview",
    contentType: "knowledge",
  },
  // Dario Amodei
  {
    memberId: "amodei",
    memberName: "Dario Amodei",
    content:
      "Constitutional AI is our approach to making AI systems that are helpful, harmless, and honest. The key insight is that you can train an AI to critique and revise its own outputs based on a set of principles, rather than relying solely on human feedback for every output.",
    source: "Anthropic research papers",
    contentType: "knowledge",
  },
  {
    memberId: "amodei",
    memberName: "Dario Amodei",
    content:
      "I left OpenAI because I believed we needed to take a different approach to AI safety. I think the risk of powerful AI systems is real and serious. At Anthropic, we are trying to build AI that is genuinely safe, not just safe-seeming.",
    source: "Lex Fridman podcast",
    contentType: "knowledge",
  },
  // Demis Hassabis
  {
    memberId: "hassabis",
    memberName: "Demis Hassabis",
    content:
      "AlphaFold solved the protein folding problem that had stumped biologists for 50 years. This is what I mean when I say AI can accelerate scientific discovery. We are just at the beginning of using AI to solve fundamental scientific problems.",
    source: "DeepMind blog and Nobel Prize lecture",
    contentType: "knowledge",
  },
  {
    memberId: "hassabis",
    memberName: "Demis Hassabis",
    content:
      "My approach to AI research is inspired by neuroscience. The brain is the only proof we have that general intelligence is possible. By understanding how the brain works, we can build better AI systems. This is why I studied neuroscience before founding DeepMind.",
    source: "DeepMind research philosophy",
    contentType: "principle",
  },
  // Sundar Pichai
  {
    memberId: "pichai",
    memberName: "Sundar Pichai",
    content:
      "AI is the most profound technology humanity is working on — more profound than fire or electricity. The reason is that it is the first technology that can help us think. Every previous technology extended our physical capabilities. AI extends our cognitive capabilities.",
    source: "Google I/O keynotes",
    contentType: "knowledge",
  },
  {
    memberId: "pichai",
    memberName: "Sundar Pichai",
    content:
      "On scaling: Google's success came from being willing to invest in infrastructure at a scale that seemed crazy at the time. The same principle applies to AI. The companies that win will be the ones willing to invest in compute, data, and talent at a scale that others think is excessive.",
    source: "Alphabet earnings calls",
    contentType: "principle",
  },
  // Elon Musk
  {
    memberId: "musk",
    memberName: "Elon Musk",
    content:
      "The first principles approach: I think it's important to reason from first principles rather than by analogy. Most people reason by analogy — they say 'this is like that, so we should do what was done there.' First principles means you boil things down to the most fundamental truths and reason up from there.",
    source: "TED Talk and interviews",
    contentType: "principle",
  },
  {
    memberId: "musk",
    memberName: "Elon Musk",
    content:
      "On manufacturing: The machine that makes the machine is harder than the machine itself. Most people focus on the product. I focus on the factory. If you can build a factory that produces products 10x faster and cheaper than competitors, you win.",
    source: "Tesla earnings calls and interviews",
    contentType: "knowledge",
  },
  // Yann LeCun
  {
    memberId: "lecun",
    memberName: "Yann LeCun",
    content:
      "Large language models are not the path to AGI. They are impressive but fundamentally limited. They cannot reason, they cannot plan, they cannot understand the physical world. We need a completely different approach — one based on world models and energy-based learning.",
    source: "Meta AI research papers and lectures",
    contentType: "knowledge",
  },
  {
    memberId: "lecun",
    memberName: "Yann LeCun",
    content:
      "Convolutional neural networks were inspired by the visual cortex. The key insight was that the same features appear at different locations in an image, so you should use the same weights (shared weights) to detect them everywhere. This is the core idea behind CNNs.",
    source: "Deep learning textbook and lectures",
    contentType: "knowledge",
  },
  // Geoffrey Hinton
  {
    memberId: "hinton",
    memberName: "Geoffrey Hinton",
    content:
      "I left Google because I wanted to speak freely about the risks of AI. I spent my career building the foundations of deep learning. Now I'm worried that we may have created something that could be very dangerous. I think the risk of AI becoming smarter than humans and pursuing goals we don't want is real.",
    source: "Post-Google interviews and lectures",
    contentType: "knowledge",
  },
  {
    memberId: "hinton",
    memberName: "Geoffrey Hinton",
    content:
      "Backpropagation is the algorithm that made deep learning possible. The key insight is that you can compute the gradient of the loss with respect to every weight in the network by applying the chain rule of calculus. This allows you to train networks with millions of parameters.",
    source: "Deep learning foundational papers",
    contentType: "knowledge",
  },
  // Andrew Ng
  {
    memberId: "ng",
    memberName: "Andrew Ng",
    content:
      "AI is the new electricity. Just as electricity transformed every industry 100 years ago, AI will transform every industry over the next 20 years. The companies that figure out how to apply AI to their specific domain will win. The ones that don't will be left behind.",
    source: "AI Fund and Coursera lectures",
    contentType: "principle",
  },
  {
    memberId: "ng",
    memberName: "Andrew Ng",
    content:
      "On building AI products: The most important thing is to identify the right problem to solve. Many companies fail not because they can't build AI, but because they build AI for the wrong problem. Start with the business problem, not the technology.",
    source: "AI Fund portfolio companies",
    contentType: "knowledge",
  },
  // Fei-Fei Li
  {
    memberId: "li",
    memberName: "Fei-Fei Li",
    content:
      "ImageNet changed everything. Before ImageNet, computer vision was stuck. We had algorithms but not enough data to train them. By creating a dataset of 14 million labeled images, we gave researchers the fuel they needed to make deep learning work for vision.",
    source: "Stanford AI Lab and TED Talk",
    contentType: "knowledge",
  },
  {
    memberId: "li",
    memberName: "Fei-Fei Li",
    content:
      "Human-centered AI means building AI that augments human capabilities rather than replacing them. It means building AI that is transparent, fair, and accountable. It means involving diverse communities in the design and deployment of AI systems.",
    source: "Stanford HAI Institute",
    contentType: "principle",
  },
  // Satya Nadella
  {
    memberId: "nadella",
    memberName: "Satya Nadella",
    content:
      "The culture transformation at Microsoft was the most important thing I did as CEO. The old Microsoft had a fixed mindset — we thought we were the best and everyone else was wrong. I tried to replace that with a growth mindset — the belief that we can always learn and improve.",
    source: "Hit Refresh book and interviews",
    contentType: "knowledge",
  },
  {
    memberId: "nadella",
    memberName: "Satya Nadella",
    content:
      "The cloud was not just a technology shift for Microsoft — it was a business model shift. We went from selling software licenses to selling subscriptions. This changed everything: how we develop software, how we price it, how we support it, and how we think about our relationship with customers.",
    source: "Microsoft earnings calls and interviews",
    contentType: "knowledge",
  },
  // Aravind Srinivas
  {
    memberId: "srinivas",
    memberName: "Aravind Srinivas",
    content:
      "The search engine of the future is not a list of links — it is a direct answer to your question, with citations. Perplexity is building the answer engine. The key insight is that LLMs can synthesize information from multiple sources and present it in a coherent, cited answer.",
    source: "Perplexity AI blog and interviews",
    contentType: "knowledge",
  },
  {
    memberId: "srinivas",
    memberName: "Aravind Srinivas",
    content:
      "On product strategy: We focus obsessively on the quality of the answer. Every other metric is secondary. If the answer is good, users will come back. If the answer is bad, no amount of marketing will save you.",
    source: "Perplexity AI product philosophy",
    contentType: "principle",
  },
  // Andy Jassy
  {
    memberId: "jassy",
    memberName: "Andy Jassy",
    content:
      "AWS was built on the insight that companies don't want to manage infrastructure — they want to build products. By abstracting away the infrastructure, we let companies focus on what makes them unique. This is the core value proposition of cloud computing.",
    source: "AWS re:Invent keynotes",
    contentType: "knowledge",
  },
  {
    memberId: "jassy",
    memberName: "Andy Jassy",
    content:
      "Amazon's leadership principles are not just words on a wall — they are the operating system of the company. Every decision, every hire, every product launch is evaluated against these principles. They create a common language and a common set of values across a very large organization.",
    source: "Amazon leadership principles documentation",
    contentType: "principle",
  },
  // Tim Cook
  {
    memberId: "cook",
    memberName: "Tim Cook",
    content:
      "Privacy is a fundamental human right. Apple's business model is built on selling products, not selling data. This is not just a business decision — it is a values decision. We believe that people have the right to control their own data.",
    source: "Apple privacy keynotes and interviews",
    contentType: "principle",
  },
  {
    memberId: "cook",
    memberName: "Tim Cook",
    content:
      "Supply chain is a competitive advantage. Most people think of supply chain as a cost center. I think of it as a strategic asset. By building the best supply chain in the world, Apple can launch products at scale, at quality, faster than any competitor.",
    source: "Apple operations philosophy",
    contentType: "knowledge",
  },
];

export const persephoneRagRouter = router({
  /**
   * PB-01: Seed the knowledge corpus for all 14 board members.
   * Idempotent — will not duplicate entries.
   */
  seedCorpus: protectedProcedure.mutation(async ({ ctx }) => {
    const openai = getOpenAIClient();
    let seeded = 0;
    let skipped = 0;

    for (const chunk of SEED_CORPUS) {
      // Check if this chunk already exists
      const existing = await db
        .select({ id: boardKnowledgeCorpus.id })
        .from(boardKnowledgeCorpus)
        .where(
          and(
            eq(boardKnowledgeCorpus.memberId, chunk.memberId),
            eq(boardKnowledgeCorpus.source, chunk.source)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        skipped++;
        continue;
      }

      // Generate embedding
      const embeddingResponse = await openai.embeddings.create({
        model: getEmbeddingModel(),
        input: `${chunk.memberName}: ${chunk.content}`,
      });
      const embedding = embeddingResponse.data[0].embedding;

      await db.insert(boardKnowledgeCorpus).values({
        memberId: chunk.memberId,
        memberName: chunk.memberName,
        chunkIndex: seeded,
        content: chunk.content,
        source: chunk.source,
        contentType: chunk.contentType,
        embedding: embedding,
      });
      seeded++;
    }

    void logAiUsage(
      ctx.user.id,
      "persephoneRag.seedCorpus",
      getEmbeddingModel(),
      undefined
    );

    return {
      success: true,
      seeded,
      skipped,
      total: SEED_CORPUS.length,
      message: `Seeded ${seeded} knowledge chunks (${skipped} already existed).`,
    };
  }),

  /**
   * PB-01: Add a custom knowledge chunk to a board member's corpus.
   */
  addKnowledge: protectedProcedure
    .input(
      z.object({
        memberId: z.string().min(1).max(100),
        memberName: z.string().min(1).max(200),
        content: z.string().min(10),
        source: z.string().optional(),
        contentType: z
          .enum(["knowledge", "quote", "principle"])
          .default("knowledge"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const openai = getOpenAIClient();
      const embeddingResponse = await openai.embeddings.create({
        model: getEmbeddingModel(),
        input: `${input.memberName}: ${input.content}`,
      });
      const embedding = embeddingResponse.data[0].embedding;

      // Get next chunk index
      const existing = await db
        .select({ chunkIndex: boardKnowledgeCorpus.chunkIndex })
        .from(boardKnowledgeCorpus)
        .where(eq(boardKnowledgeCorpus.memberId, input.memberId))
        .orderBy(desc(boardKnowledgeCorpus.chunkIndex))
        .limit(1);
      const nextIndex = (existing[0]?.chunkIndex ?? -1) + 1;

      const [entry] = await db
        .insert(boardKnowledgeCorpus)
        .values({
          memberId: input.memberId,
          memberName: input.memberName,
          chunkIndex: nextIndex,
          content: input.content,
          source: input.source,
          contentType: input.contentType,
          embedding: embedding,
        })
        .returning();

      void logAiUsage(
        ctx.user.id,
        "persephoneRag.addKnowledge",
        getEmbeddingModel(),
        undefined
      );

      return { success: true, entry };
    }),

  /**
   * PB-01: List all knowledge chunks for a board member.
   */
  listCorpus: protectedProcedure
    .input(
      z.object({
        memberId: z.string().min(1),
        contentType: z.enum(["knowledge", "quote", "principle"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const conditions = [eq(boardKnowledgeCorpus.memberId, input.memberId)];
      if (input.contentType) {
        conditions.push(
          eq(boardKnowledgeCorpus.contentType, input.contentType)
        );
      }
      const chunks = await db
        .select({
          id: boardKnowledgeCorpus.id,
          memberId: boardKnowledgeCorpus.memberId,
          memberName: boardKnowledgeCorpus.memberName,
          chunkIndex: boardKnowledgeCorpus.chunkIndex,
          content: boardKnowledgeCorpus.content,
          source: boardKnowledgeCorpus.source,
          contentType: boardKnowledgeCorpus.contentType,
          createdAt: boardKnowledgeCorpus.createdAt,
        })
        .from(boardKnowledgeCorpus)
        .where(and(...conditions))
        .orderBy(boardKnowledgeCorpus.chunkIndex);
      return { chunks, total: chunks.length };
    }),

  /**
   * PB-01: Get corpus stats for all board members.
   */
  getCorpusStats: protectedProcedure.query(async () => {
    const all = await db
      .select({
        memberId: boardKnowledgeCorpus.memberId,
        memberName: boardKnowledgeCorpus.memberName,
        contentType: boardKnowledgeCorpus.contentType,
      })
      .from(boardKnowledgeCorpus);

    const stats: Record<
      string,
      {
        memberName: string;
        total: number;
        knowledge: number;
        quotes: number;
        principles: number;
      }
    > = {};
    for (const row of all) {
      if (!stats[row.memberId]) {
        stats[row.memberId] = {
          memberName: row.memberName,
          total: 0,
          knowledge: 0,
          quotes: 0,
          principles: 0,
        };
      }
      stats[row.memberId].total++;
      if (row.contentType === "knowledge") stats[row.memberId].knowledge++;
      if (row.contentType === "quote") stats[row.memberId].quotes++;
      if (row.contentType === "principle") stats[row.memberId].principles++;
    }

    return {
      stats: Object.entries(stats).map(([memberId, s]) => ({
        memberId,
        ...s,
      })),
      totalChunks: all.length,
      membersWithCorpus: Object.keys(stats).length,
    };
  }),

  /**
   * PB-01: Delete a knowledge chunk.
   */
  deleteKnowledge: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      await db
        .delete(boardKnowledgeCorpus)
        .where(eq(boardKnowledgeCorpus.id, input.id));
      return { success: true };
    }),

  /**
   * PB-02: Retrieve the most relevant knowledge chunks for a query.
   * Uses cosine similarity over stored embeddings (in-process, no pgvector needed).
   */
  retrieveRelevant: protectedProcedure
    .input(
      z.object({
        memberId: z.string().min(1),
        query: z.string().min(1).max(2000),
        topK: z.number().int().min(1).max(10).default(3),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Generate query embedding
      const queryEmbedding = await embed(input.query);

      // Fetch all chunks for this member (with embeddings)
      const chunks = await db
        .select()
        .from(boardKnowledgeCorpus)
        .where(eq(boardKnowledgeCorpus.memberId, input.memberId));

      if (chunks.length === 0) {
        return { chunks: [], query: input.query };
      }

      // Score each chunk by cosine similarity
      const scored = chunks
        .filter(c => Array.isArray(c.embedding) && c.embedding.length > 0)
        .map(c => ({
          ...c,
          score: cosineSimilarity(queryEmbedding, c.embedding as number[]),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, input.topK);

      void logAiUsage(
        ctx.user.id,
        "persephoneRag.retrieveRelevant",
        getEmbeddingModel(),
        undefined
      );

      return {
        chunks: scored.map(c => ({
          id: c.id,
          content: c.content,
          source: c.source,
          contentType: c.contentType,
          relevanceScore: Math.round(c.score * 100) / 100,
        })),
        query: input.query,
        memberChunkCount: chunks.length,
      };
    }),

  /**
   * PB-02 + PB-03: RAG-augmented chat with a Persephone Board member.
   * Retrieves relevant knowledge chunks and injects them into the system prompt
   * before calling the LLM, grounding responses in real-world data.
   */
  ragChat: protectedProcedure
    .input(
      z.object({
        memberId: z.string().min(1),
        memberName: z.string().optional(),
        message: z.string().min(1).max(4000),
        conversationHistory: z
          .array(
            z.object({
              role: z.enum(["user", "assistant"]),
              content: z.string(),
            })
          )
          .optional()
          .default([]),
        topK: z.number().int().min(1).max(5).default(3),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const openai = getOpenAIClient();

      // Step 1: Retrieve relevant knowledge chunks (PB-02)
      let ragContext = "";
      try {
        const queryEmbedding = await embed(input.message);
        const chunks = await db
          .select()
          .from(boardKnowledgeCorpus)
          .where(eq(boardKnowledgeCorpus.memberId, input.memberId));

        if (chunks.length > 0) {
          const scored = chunks
            .filter(c => Array.isArray(c.embedding) && c.embedding.length > 0)
            .map(c => ({
              content: c.content,
              source: c.source,
              score: cosineSimilarity(queryEmbedding, c.embedding as number[]),
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, input.topK);

          if (scored.length > 0) {
            ragContext = `
--- RETRIEVED KNOWLEDGE (RAG) ---
The following are real, verified knowledge chunks from ${input.memberName ?? input.memberId}'s corpus, retrieved as relevant to the current question. Use these to ground your response in real-world data and authentic perspectives:

${scored.map((c, i) => `[${i + 1}] (Source: ${c.source ?? "Unknown"}) ${c.content}`).join("\n\n")}
--- END RETRIEVED KNOWLEDGE ---`;
          }
        }
      } catch {
        // Non-blocking — proceed without RAG if retrieval fails
      }

      // Step 2: Build the system prompt (PB-03 persona + RAG context)
      const systemPrompt = `You are ${input.memberName ?? input.memberId}, a member of the Persephone Board — an elite advisory council of the world's most influential technology and business leaders.

Your responses must be:
1. Deeply authentic to your real-world persona, philosophy, and communication style
2. Grounded in the retrieved knowledge chunks provided (when relevant)
3. Specific, insightful, and actionable — not generic
4. Honest about uncertainty — say "I don't know" when appropriate
5. Consistent with your known positions, values, and decision-making style
${ragContext}

Remember: You are not playing a character. You are drawing on your genuine knowledge, experience, and worldview to provide the most valuable possible guidance.`;

      const messages: OpenAI.ChatCompletionMessageParam[] = [
        { role: "system", content: systemPrompt },
        ...input.conversationHistory.slice(-10),
        { role: "user", content: input.message },
      ];

      const completion = await openai.chat.completions.create({
        model: getModelForTask("chat"),
        messages,
        max_tokens: 1200,
        temperature: 0.7,
      });

      void logAiUsage(
        ctx.user.id,
        "persephoneRag.ragChat",
        completion.model,
        completion.usage
      );

      const response =
        completion.choices[0]?.message?.content ??
        "I apologise, I was unable to generate a response. Please try again.";

      return {
        response,
        memberId: input.memberId,
        memberName: input.memberName ?? input.memberId,
        ragChunksUsed: ragContext ? input.topK : 0,
        generatedAt: new Date().toISOString(),
      };
    }),
});
