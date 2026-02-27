/**
 * Expert Evolution Router
 *
 * Powers the AI-SME expert chat, conversation history,
 * voice generation, and memory/learning system.
 */
import { z } from "zod";
import { desc, eq, and } from "drizzle-orm";
import OpenAI from "openai";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { trainingConversations, memoryBank } from "../../drizzle/schema";

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  return new OpenAI({ apiKey });
}

// Expert personas and their system prompts
const EXPERT_PERSONAS: Record<
  string,
  { name: string; role: string; systemPrompt: string }
> = {
  pe_partner: {
    name: "PE Partner",
    role: "Private Equity Partner",
    systemPrompt: `You are a seasoned Private Equity Partner with 20+ years of experience at top-tier PE firms. You specialise in deal origination, due diligence, portfolio management, and value creation. You think in terms of EBITDA multiples, IRR, and portfolio company performance. You are direct, analytical, and focused on returns.`,
  },
  cfo_expert: {
    name: "CFO Expert",
    role: "Chief Financial Officer",
    systemPrompt: `You are an experienced CFO with expertise in financial strategy, capital allocation, fundraising, and financial operations. You understand P&L management, cash flow optimisation, and financial reporting. You are precise, data-driven, and focused on financial sustainability and growth.`,
  },
  strategy_consultant: {
    name: "Strategy Consultant",
    role: "Strategy Consultant",
    systemPrompt: `You are a senior strategy consultant from a top-tier consulting firm (McKinsey/BCG/Bain calibre). You excel at market analysis, competitive strategy, organisational design, and transformation programmes. You use structured frameworks and are known for clear, actionable recommendations.`,
  },
  ma_lawyer: {
    name: "M&A Lawyer",
    role: "M&A Lawyer",
    systemPrompt: `You are a senior M&A lawyer specialising in corporate transactions, due diligence, deal structuring, and regulatory compliance. You are precise, risk-aware, and focused on protecting your client's interests.`,
  },
  tech_cto: {
    name: "Tech CTO",
    role: "Chief Technology Officer",
    systemPrompt: `You are an experienced CTO with deep expertise in technology strategy, architecture, engineering leadership, and digital transformation. You are pragmatic, forward-thinking, and focused on delivering business value through technology.`,
  },
  marketing_cmo: {
    name: "CMO Expert",
    role: "Chief Marketing Officer",
    systemPrompt: `You are a seasoned CMO with expertise in brand strategy, digital marketing, customer acquisition, and growth. You are creative, data-driven, and focused on ROI.`,
  },
  hr_chro: {
    name: "CHRO Expert",
    role: "Chief Human Resources Officer",
    systemPrompt: `You are an experienced CHRO with expertise in talent strategy, organisational culture, leadership development, and HR operations. You are people-focused, strategic, and skilled at change management.`,
  },
  operations_coo: {
    name: "COO Expert",
    role: "Chief Operating Officer",
    systemPrompt: `You are a seasoned COO with expertise in operational excellence, process optimisation, supply chain management, and scaling organisations. You are execution-focused and systematic.`,
  },
};

function getExpertPersona(expertId: string) {
  return (
    EXPERT_PERSONAS[expertId] ?? {
      name: expertId,
      role: "AI Expert",
      systemPrompt: `You are a highly experienced expert in your field. Provide thoughtful, professional advice based on your deep expertise. Be direct, practical, and focused on delivering value.`,
    }
  );
}

export const expertEvolutionRouter = router({
  /**
   * Chat with a specific AI expert.
   */
  chat: protectedProcedure
    .input(
      z.object({
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
      const persona = getExpertPersona(input.expertId);
      const openai = getOpenAIClient();

      const messages: OpenAI.ChatCompletionMessageParam[] = [
        { role: "system", content: persona.systemPrompt },
        ...input.conversationHistory.slice(-10),
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

      // Store the user message
      await db.insert(trainingConversations).values({
        userId: ctx.user.id,
        role: "user",
        content: input.message,
        contentType: "text",
        context: input.expertId,
        metadata: null,
      });

      // Store the expert response
      await db.insert(trainingConversations).values({
        userId: ctx.user.id,
        role: "assistant",
        content: response,
        contentType: "text",
        context: input.expertId,
        metadata: { model: completion.model, expertId: input.expertId },
      });

      return {
        id: crypto.randomUUID(),
        expertId: input.expertId,
        expertName: persona.name,
        role: "assistant" as const,
        content: response,
        timestamp: new Date().toISOString(),
      };
    }),

  /**
   * Get conversation history with a specific expert.
   */
  getConversations: protectedProcedure
    .input(
      z.object({
        expertId: z.string(),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      const rows = await db
        .select()
        .from(trainingConversations)
        .where(
          and(
            eq(trainingConversations.userId, ctx.user.id),
            eq(trainingConversations.context, input.expertId)
          )
        )
        .orderBy(desc(trainingConversations.createdAt))
        .limit(input.limit);

      return rows.reverse().map(r => ({
        id: String(r.id),
        expertId: r.context ?? input.expertId,
        role: r.role as "user" | "assistant",
        content: r.content,
        timestamp: r.createdAt.toISOString(),
      }));
    }),

  /**
   * Store a conversation manually (for client-side persistence).
   */
  storeConversation: protectedProcedure
    .input(
      z.object({
        expertId: z.string(),
        userMessage: z.string(),
        expertResponse: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await db.insert(trainingConversations).values({
        userId: ctx.user.id,
        role: "user",
        content: input.userMessage,
        contentType: "text",
        context: input.expertId,
      });

      const [saved] = await db
        .insert(trainingConversations)
        .values({
          userId: ctx.user.id,
          role: "assistant",
          content: input.expertResponse,
          contentType: "text",
          context: input.expertId,
        })
        .returning();

      return { id: saved.id, savedAt: saved.createdAt.toISOString() };
    }),

  /**
   * Store a memory/insight from an expert conversation.
   */
  storeMemory: protectedProcedure
    .input(
      z.object({
        expertId: z.string(),
        content: z.string(),
        category: z.string().optional(),
        importance: z.number().min(1).max(10).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [saved] = await db
        .insert(memoryBank)
        .values({
          userId: ctx.user.id,
          category: input.category ?? "expert_insight",
          key: `${input.expertId}_${Date.now()}`,
          value: input.content,
          confidence: (input.importance ?? 5) / 10,
          source: input.expertId,
        })
        .returning();

      return { id: saved.id, savedAt: saved.createdAt.toISOString() };
    }),

  /**
   * Generate voice audio for an expert response using ElevenLabs.
   * Falls back gracefully if ElevenLabs is not configured.
   */
  generateVoice: protectedProcedure
    .input(
      z.object({
        text: z.string().min(1).max(2000),
        expertId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const elevenLabsKey = process.env.ELEVENLABS_API_KEY;

      if (!elevenLabsKey) {
        return {
          success: false,
          audioUrl: null,
          message: "Voice generation not configured",
        };
      }

      // ElevenLabs voice IDs for different expert personas
      const voiceMap: Record<string, string> = {
        pe_partner: "pNInz6obpgDQGcFmaJgB",
        cfo_expert: "VR6AewLTigWG4xSOukaG",
        strategy_consultant: "EXAVITQu4vr4xnSDxMaL",
        default: "21m00Tcm4TlvDq8ikWAM",
      };

      const voiceId = voiceMap[input.expertId] ?? voiceMap.default;

      try {
        const response = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
          {
            method: "POST",
            headers: {
              "xi-api-key": elevenLabsKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: input.text.slice(0, 500),
              model_id: "eleven_monolingual_v1",
              voice_settings: { stability: 0.5, similarity_boost: 0.75 },
            }),
          }
        );

        if (!response.ok) {
          return {
            success: false,
            audioUrl: null,
            message: "Voice generation failed",
          };
        }

        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        const audioUrl = `data:audio/mpeg;base64,${base64}`;

        return {
          success: true,
          audioUrl,
          message: "Voice generated successfully",
        };
      } catch {
        return {
          success: false,
          audioUrl: null,
          message: "Voice generation error",
        };
      }
    }),
});
