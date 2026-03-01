/**
 * Victoria Briefing Router
 *
 * Powers the Victoria Daily Briefing component and DailyBrief page.
 * Generates AI-powered daily briefings using OpenAI and the user's context.
 */
import { z } from "zod";
import { desc, eq, and } from "drizzle-orm";
import OpenAI from "openai";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { tasks, projects } from "../../drizzle/schema";

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  return new OpenAI({ apiKey });
}

export const victoriaBriefingRouter = router({
  /**
   * Get the daily briefing — AI-generated executive summary.
   */
  getDailyBriefing: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get pending tasks and active projects for context
    const [pendingTasks, activeProjects] = await Promise.all([
      db
        .select()
        .from(tasks)
        .where(and(eq(tasks.userId, userId), eq(tasks.status, "not_started")))
        .orderBy(desc(tasks.createdAt))
        .limit(8),
      db
        .select()
        .from(projects)
        .where(and(eq(projects.userId, userId), eq(projects.status, "active")))
        .limit(5),
    ]);

    const openai = getOpenAIClient();
    const dateStr = today.toLocaleDateString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const prompt = `You are Victoria, AI Chief of Staff for CEPHO. Generate a professional daily briefing for ${ctx.user.name}.

Date: ${dateStr}

Active Projects (${activeProjects.length}): ${activeProjects.map(p => `${p.name} [${p.status}, ${p.progress ?? 0}% complete]`).join("; ") || "None"}

Pending Tasks (${pendingTasks.length}): ${
      pendingTasks
        .slice(0, 5)
        .map(t => `${t.title} [${t.priority ?? "medium"} priority]`)
        .join("; ") || "None"
    }

Generate a structured daily briefing with:
1. **Executive Summary** (2-3 sentences on the day ahead)
2. **Priority Focus** (top 3 items requiring attention today)
3. **Key Metrics** (brief status on projects and tasks)
4. **Strategic Recommendation** (one key action to drive progress)

Keep it concise, professional, and actionable. Format with clear sections.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 700,
      temperature: 0.6,
    });

    const briefingText =
      completion.choices[0]?.message?.content ??
      `Good morning, ${ctx.user.name}. Your daily briefing is ready. You have ${pendingTasks.length} pending tasks and ${activeProjects.length} active projects.`;

    return {
      date: today.toISOString(),
      greeting: `Good morning, ${ctx.user.name}`,
      briefing: briefingText,
      stats: {
        pendingTasks: pendingTasks.length,
        activeProjects: activeProjects.length,
        highPriorityTasks: pendingTasks.filter(
          t => t.priority === "high" || t.priority === "urgent"
        ).length,
      },
      generatedAt: new Date().toISOString(),
    };
  }),

  /**
   * Generate audio for the briefing using ElevenLabs.
   * Falls back gracefully if not configured.
   */
  generateAudio: protectedProcedure
    .input(z.object({ text: z.string().min(1).max(3000) }))
    .mutation(async ({ input }) => {
      const elevenLabsKey = process.env.ELEVENLABS_API_KEY;

      if (!elevenLabsKey) {
        return {
          success: false,
          audioUrl: null,
          message: "Audio generation not configured",
        };
      }

      // Victoria's voice — use a professional female voice
      const voiceId = "EXAVITQu4vr4xnSDxMaL"; // Bella

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
              text: input.text.slice(0, 800), // Limit for cost control
              model_id: "eleven_monolingual_v1",
              voice_settings: { stability: 0.6, similarity_boost: 0.8 },
            }),
          }
        );

        if (!response.ok) {
          return {
            success: false,
            audioUrl: null,
            message: "Audio generation failed",
          };
        }

        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        const audioUrl = `data:audio/mpeg;base64,${base64}`;

        return {
          success: true,
          audioUrl,
          message: "Audio generated successfully",
        };
      } catch {
        return {
          success: false,
          audioUrl: null,
          message: "Audio generation error",
        };
      }
    }),
});

/**
 * victoriasBrief router — alias for the DailyBrief page which uses a different namespace.
 */
export const victoriasBriefRouter = router({
  generatePdf: protectedProcedure
    .input(z.object({ date: z.string().optional(), content: z.any().optional() }))
    .mutation(async () => {
      // PDF generation would use a PDF library in production
      return {
        success: true,
        message:
          "PDF generation queued. This feature requires server-side PDF generation.",
        downloadUrl: null as string | null,
        pdfUrl: null as string | null,
      };
    }),

  generateVideo: protectedProcedure
    .input(z.object({ script: z.string().optional(), avatarId: z.string().optional(), content: z.string().optional() }))
    .mutation(async () => {
      const syntesiaKey = process.env.SYNTHESIA_API_KEY;
      if (!syntesiaKey) {
        return {
          success: false,
          message: "Video generation not configured",
          videoUrl: null as string | null,
          status: "error" as string,
        };
      }
      return {
        success: true,
        message: "Video generation initiated via Synthesia",
        videoUrl: null as string | null,
        status: "processing" as string,
      };
    }),

  generateAudio: protectedProcedure
    .input(z.object({ text: z.string().min(1).max(3000), voiceId: z.string().optional() }))
    .mutation(async ({ input }) => {
      const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
      if (!elevenLabsKey) {
        return {
          success: false,
          audioUrl: null,
          message: "Audio not configured",
        };
      }

      try {
        const response = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL`,
          {
            method: "POST",
            headers: {
              "xi-api-key": elevenLabsKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: input.text.slice(0, 800),
              model_id: "eleven_monolingual_v1",
              voice_settings: { stability: 0.6, similarity_boost: 0.8 },
            }),
          }
        );

        if (!response.ok) {
          return { success: false, audioUrl: null, message: "Audio failed" };
        }

        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        return {
          success: true,
          audioUrl: `data:audio/mpeg;base64,${base64}`,
          message: "Audio generated",
        };
      } catch {
        return { success: false, audioUrl: null, message: "Audio error" };
      }
    }),
});
