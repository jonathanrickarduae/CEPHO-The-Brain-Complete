/**
 * Expert Chat Router
 *
 * Session-based expert chat for the ExpertChatPage.
 * Uses OpenAI with expert persona system prompts.
 */
import { z } from "zod";
import OpenAI from "openai";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { trainingConversations } from "../../drizzle/schema";

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  return new OpenAI({ apiKey });
}

const EXPERT_SYSTEM_PROMPTS: Record<string, string> = {
  pe_partner: `You are a seasoned Private Equity Partner with 20+ years at top-tier PE firms. You specialise in deal origination, due diligence, portfolio management, and value creation. You think in terms of EBITDA multiples, IRR, and portfolio company performance. Be direct, analytical, and focused on returns.`,
  cfo_expert: `You are an experienced CFO with expertise in financial strategy, capital allocation, fundraising, and financial operations. Be precise, data-driven, and focused on financial sustainability.`,
  strategy_consultant: `You are a senior strategy consultant (McKinsey/BCG/Bain calibre). Excel at market analysis, competitive strategy, and transformation. Use structured frameworks and provide clear, actionable recommendations.`,
  ma_lawyer: `You are a senior M&A lawyer specialising in corporate transactions, due diligence, and deal structuring. Be precise, risk-aware, and focused on protecting your client's interests.`,
  tech_cto: `You are an experienced CTO with deep expertise in technology strategy, architecture, and digital transformation. Be pragmatic, forward-thinking, and focused on business value.`,
  default: `You are a highly experienced business expert. Provide thoughtful, professional advice. Be direct, practical, and focused on delivering value.`,
};

export const expertChatRouter = router({
  /**
   * Start a new expert chat session.
   */
  startSession: protectedProcedure
    .input(
      z.object({
        expertId: z.string(),
        expertName: z.string().optional(),
        initialContext: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const sessionId = Date.now();

      // Log session start
      await db.insert(trainingConversations).values({
        userId: ctx.user.id,
        role: "system",
        content: `Session started with ${input.expertName ?? input.expertId}${input.initialContext ? `. Context: ${input.initialContext}` : ""}`,
        contentType: "session_start",
        context: input.expertId,
      });

      return {
        sessionId,
        expertId: input.expertId,
        expertName: input.expertName ?? input.expertId,
        startedAt: new Date().toISOString(),
        greeting: `Hello, I'm your ${input.expertName ?? "AI Expert"}. How can I help you today?`,
      };
    }),

  /**
   * Send a message in an expert chat session.
   */
  sendMessage: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        expertId: z.string(),
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
      })
    )
    .mutation(async ({ input, ctx }) => {
      const openai = getOpenAIClient();
      const systemPrompt =
        EXPERT_SYSTEM_PROMPTS[input.expertId] ?? EXPERT_SYSTEM_PROMPTS.default;

      const messages: OpenAI.ChatCompletionMessageParam[] = [
        { role: "system", content: systemPrompt },
        ...input.conversationHistory.slice(-12),
        { role: "user", content: input.message },
      ];

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 1200,
        temperature: 0.7,
      });

      const response =
        completion.choices[0]?.message?.content ??
        "I apologise, I was unable to generate a response. Please try again.";

      // Persist both messages
      await db.insert(trainingConversations).values({
        userId: ctx.user.id,
        role: "user",
        content: input.message,
        contentType: "text",
        context: input.expertId,
      });

      await db.insert(trainingConversations).values({
        userId: ctx.user.id,
        role: "assistant",
        content: response,
        contentType: "text",
        context: input.expertId,
        metadata: { sessionId: input.sessionId, model: completion.model },
      });

      return {
        id: crypto.randomUUID(),
        role: "expert" as const,
        content: response,
        timestamp: new Date().toISOString(),
      };
    }),
});
