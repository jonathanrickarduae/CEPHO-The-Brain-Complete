import { getModelForTask } from "../utils/modelRouter";
import { logAiUsage } from "./aiCostTracking.router";
/**
 * Chat Router — Real Implementation
 *
 * Wires the chat.send, chat.history, and chat.clear procedures
 * to OpenAI GPT-4o and the conversations table in the database.
 *
 * The system prompt positions the AI as Victoria, CEPHO's Chief of Staff AI.
 */
import { z } from "zod";
import { desc, eq, and } from "drizzle-orm";
import OpenAI from "openai";
import { aiProcedure, protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { conversations } from "../../drizzle/schema";

const VICTORIA_SYSTEM_PROMPT = `You are Victoria, the AI Chief of Staff for CEPHO — a sophisticated executive intelligence platform. You are the primary AI assistant for the CEO and leadership team.

Your role:
- Provide strategic advice, decision support, and executive-level analysis
- Help with planning, prioritisation, and problem-solving
- Synthesise information from across the business to give clear, actionable insights
- Maintain a professional, direct, and intelligent communication style
- Be concise but thorough — executives value clarity over verbosity

You have deep knowledge of:
- Business strategy and operations
- AI agents and their capabilities within CEPHO
- Project management and team coordination
- Innovation and product development
- Financial analysis and business planning

Always respond in a professional, executive-appropriate tone. Use structured responses when helpful (bullet points, numbered lists) but avoid unnecessary padding.`;

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  return new OpenAI({ apiKey });
}

export const chatRouter = router({
  /**
   * Send a message and get an AI response.
   * Persists both user message and assistant response to the database.
   */
  send: aiProcedure
    .input(
      z.object({
        message: z.string().min(1).max(4000),
        context: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;

      // Persist the user's message
      await db.insert(conversations).values({
        userId,
        role: "user",
        content: input.message,
        metadata: input.context ? { context: input.context } : null,
      });

      // Fetch recent conversation history (last 20 messages for context)
      const history = await db
        .select()
        .from(conversations)
        .where(eq(conversations.userId, userId))
        .orderBy(desc(conversations.createdAt))
        .limit(20);

      // Build messages array for OpenAI (reverse to chronological order)
      const messages: OpenAI.ChatCompletionMessageParam[] = [
        { role: "system", content: VICTORIA_SYSTEM_PROMPT },
        ...history
          .reverse()
          .slice(0, -1) // exclude the message we just inserted (it's the last one)
          .map(c => ({
            role: c.role as "user" | "assistant",
            content: c.content,
          })),
        { role: "user", content: input.message },
      ];

      // Call OpenAI
      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: getModelForTask("chat"),
        messages,
        max_tokens: 1500,
        temperature: 0.7,
      });

      // p5-9: Track AI token usage and cost
      void logAiUsage(ctx.user.id, "chat.send", completion.model, completion.usage ?? null);
      const assistantMessage =
        completion.choices[0]?.message?.content ??
        "I apologise, I was unable to generate a response. Please try again.";

      // Persist the assistant's response
      const [saved] = await db
        .insert(conversations)
        .values({
          userId,
          role: "assistant",
          content: assistantMessage,
          metadata: {
            model: completion.model,
            usage: completion.usage,
          },
        })
        .returning();

      return {
        id: String(saved.id),
        message: assistantMessage,
        content: assistantMessage,
        role: "assistant" as const,
        timestamp: saved.createdAt.toISOString(),
      };
    }),

  /**
   * Retrieve conversation history for the current user.
   */
  history: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ input, ctx }) => {
      const rows = await db
        .select()
        .from(conversations)
        .where(
          and(
            eq(conversations.userId, ctx.user.id)
            // Only return user/assistant messages, not system
          )
        )
        .orderBy(desc(conversations.createdAt))
        .limit(input.limit);

      return rows.reverse().map(c => ({
        id: String(c.id),
        role: c.role as "user" | "assistant",
        content: c.content,
        timestamp: c.createdAt.toISOString(),
      }));
    }),

  /**
   * Clear conversation history for the current user.
   */
  clear: protectedProcedure.mutation(async ({ ctx }) => {
    await db.delete(conversations).where(eq(conversations.userId, ctx.user.id));

    return { success: true, message: "Conversation history cleared." };
  }),
});
