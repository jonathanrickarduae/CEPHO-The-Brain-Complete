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
import { synthesiaService } from "../services/synthesia.service";
import { generateBriefPDF } from "../services/pdf-generation.service";
import { readFile, unlink } from "fs/promises";
import { existsSync } from "fs";

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
      model: "gpt-4.1-mini",
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
    .mutation(async ({ input }) => {
      try {
        const briefDate = input.date ?? new Date().toLocaleDateString("en-GB", {
          weekday: "long", year: "numeric", month: "long", day: "numeric",
        });
        const content = input.content ?? {};
        // Build BriefData from whatever content was passed
        const briefData = {
          date: briefDate,
          overviewSummary: {
            headline: content.overviewSummary?.headline ?? "Your daily executive brief",
            energyFocus: content.overviewSummary?.energyFocus ?? "Stay focused on high-impact priorities",
          },
          schedule: content.schedule ?? [],
          priorities: (content.keyThings ?? []).map((k: any) => ({
            title: k.title ?? "Priority",
            description: k.description ?? "",
            urgency: k.priority ?? "medium",
            estimatedTime: "30 minutes",
          })),
          insights: (content.intelligence ?? []).map((i: any) => ({
            category: i.source ?? "Intelligence",
            message: i.summary ?? i.title ?? "",
          })),
          emails: content.emailSummary ? {
            unread: content.emailSummary.unread ?? 0,
            requireResponse: content.emailSummary.requiresResponse ?? 0,
            highPriority: content.emailSummary.highPriority ?? 0,
            urgent: content.emailSummary.urgent ?? [],
          } : undefined,
        };
        const pdfPath = await generateBriefPDF(briefData);
        // Read the PDF and return as base64 data URL
        if (existsSync(pdfPath)) {
          const pdfBuffer = await readFile(pdfPath);
          const base64 = pdfBuffer.toString("base64");
          await unlink(pdfPath).catch(() => {});
          return {
            success: true,
            message: "PDF generated successfully",
            pdfUrl: `data:application/pdf;base64,${base64}`,
            downloadUrl: `data:application/pdf;base64,${base64}`,
          };
        }
        return {
          success: false,
          message: "PDF generation failed — file not created",
          pdfUrl: null as string | null,
          downloadUrl: null as string | null,
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        return {
          success: false,
          message: `PDF generation failed: ${msg}`,
          pdfUrl: null as string | null,
          downloadUrl: null as string | null,
        };
      }
    }),

  generateVideo: protectedProcedure
    .input(z.object({ script: z.string().optional(), avatarId: z.string().optional(), content: z.string().optional() }))
    .mutation(async ({ input }) => {
      if (!synthesiaService.isConfigured()) {
        return {
          success: false,
          message: "Video generation not configured — SYNTHESIA_API_KEY is missing",
          videoUrl: null as string | null,
          videoId: null as string | null,
          status: "error" as string,
        };
      }
      try {
        const script = input.script ?? input.content ?? "Good morning. Your CEPHO briefing is ready.";
        const video = await synthesiaService.createVideo({
          title: `CEPHO Briefing — ${new Date().toLocaleDateString()}`,
          test: true, // Use test mode to avoid billing during development
          input: [{
            avatarId: input.avatarId ?? "anna_costume1_cameraA",
            script: script.slice(0, 1500), // Synthesia limit
            backgroundColor: "#0f172a",
          }],
        });
        return {
          success: true,
          message: "Video generation started. Check status with getVideoStatus.",
          videoUrl: video.downloadUrl,
          videoId: video.id,
          status: video.status as string,
        };
      } catch (err) {
        return {
          success: false,
          message: err instanceof Error ? err.message : "Video generation failed",
          videoUrl: null as string | null,
          videoId: null as string | null,
          status: "error" as string,
        };
      }
    }),

  getVideoStatus: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .query(async ({ input }) => {
      if (!synthesiaService.isConfigured()) {
        return { status: "error", downloadUrl: null, thumbnailUrl: null, duration: null };
      }
      try {
        const video = await synthesiaService.getVideo(input.videoId);
        return {
          status: video.status,
          downloadUrl: video.downloadUrl,
          thumbnailUrl: video.thumbnailUrl,
          duration: video.duration,
        };
      } catch {
        return { status: "error", downloadUrl: null, thumbnailUrl: null, duration: null };
      }
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
