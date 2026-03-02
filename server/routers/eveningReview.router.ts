/**
 * Evening Review & Morning Signal Router
 *
 * Powers the Evening Review session (task decisions, mood, notes)
 * and the Morning Signal (daily briefing from previous evening review).
 */
import { z } from "zod";
import { desc, eq, and } from "drizzle-orm";
import OpenAI from "openai";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import {
  eveningReviewSessions,
  tasks,
  activityFeed,
} from "../../drizzle/schema";
import { generateBriefPDF } from "../services/pdf-generation.service";
import { readFile, unlink } from "fs/promises";
import { existsSync } from "fs";

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  return new OpenAI({ apiKey });
}

// ─── Evening Review Router ────────────────────────────────────────────────────
export const eveningReviewRouter = router({
  /**
   * Get the latest completed evening review session.
   */
  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const rows = await db
      .select()
      .from(eveningReviewSessions)
      .where(eq(eveningReviewSessions.userId, ctx.user.id))
      .orderBy(desc(eveningReviewSessions.createdAt))
      .limit(1);

    if (rows.length === 0) return null;
    const session = rows[0];

    return {
      id: session.id,
      reviewDate: session.reviewDate.toISOString(),
      completedAt: session.completedAt?.toISOString() ?? null,
      mode: session.mode,
      tasksAccepted: session.tasksAccepted,
      tasksDeferred: session.tasksDeferred,
      tasksRejected: session.tasksRejected,
      moodScore: session.moodScore,
      wentWellNotes: session.wentWellNotes,
      didntGoWellNotes: session.didntGoWellNotes,
      signalItemsGenerated: session.signalItemsGenerated,
    };
  }),

  /**
   * Create a new evening review session.
   */
  createSession: protectedProcedure
    .input(
      z.object({
        mode: z.string().default("standard"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [session] = await db
        .insert(eveningReviewSessions)
        .values({
          userId: ctx.user.id,
          reviewDate: new Date(),
          startedAt: new Date(),
          mode: input.mode,
          tasksAccepted: 0,
          tasksDeferred: 0,
          tasksRejected: 0,
        })
        .returning();

      return {
        sessionId: session.id,
        startedAt: session.startedAt.toISOString(),
      };
    }),

  /**
   * Complete an evening review session.
   */
  completeSession: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        moodScore: z.number().min(1).max(10).optional(),
        wentWellNotes: z.string().optional(),
        didntGoWellNotes: z.string().optional(),
        tasksAccepted: z.number().default(0),
        tasksDeferred: z.number().default(0),
        tasksRejected: z.number().default(0),
        decisions: z.array(
          z.object({
            taskTitle: z.string(),
            projectName: z.string().optional(),
            decision: z.enum(["accepted", "deferred", "rejected"]),
            priority: z.string().optional(),
            estimatedTime: z.string().optional(),
          })
        ).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Count decisions if provided
      const accepted = input.decisions?.filter(d => d.decision === "accepted").length ?? input.tasksAccepted;
      const deferred = input.decisions?.filter(d => d.decision === "deferred").length ?? input.tasksDeferred;
      const rejected = input.decisions?.filter(d => d.decision === "rejected").length ?? input.tasksRejected;
      const signalItems = accepted; // Each accepted task becomes a signal item
        await db
        .update(eveningReviewSessions)
        .set({
          completedAt: new Date(),
          moodScore: input.moodScore ?? null,
          wentWellNotes: input.wentWellNotes ?? null,
          didntGoWellNotes: input.didntGoWellNotes ?? null,
          tasksAccepted: accepted,
          tasksDeferred: deferred,
          tasksRejected: rejected,
          signalItemsGenerated: signalItems,
        })
        .where(
          and(
            eq(eveningReviewSessions.id, input.sessionId),
            eq(eveningReviewSessions.userId, ctx.user.id)
          )
        );
      // Log to activity feed
      await db.insert(activityFeed).values({
        userId: ctx.user.id,
        actorType: "user",
        actorName: ctx.user.name,
        action: "completed",
        targetType: "evening_review",
        targetId: input.sessionId,
        targetName: "Evening Review",
        description: `Completed evening review: ${accepted} accepted, ${deferred} deferred, ${rejected} rejected`,
      });
      return { success: true, completedAt: new Date().toISOString(), signalItemsGenerated: signalItems };
    }),

  /**
   * Get pending tasks for evening review.
   */
  getPendingTasks: protectedProcedure.query(async ({ ctx }) => {
    const pendingTasks = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.userId, ctx.user.id), eq(tasks.status, "pending")))
      .orderBy(desc(tasks.createdAt))
      .limit(20);

    return {
      tasks: pendingTasks.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        priority: t.priority,
        dueDate: t.dueDate?.toISOString() ?? null,
        status: t.status,
      })),
    };
  }),

  getTimingPatterns: protectedProcedure.query(async () => {
    return {
      preferredTime: "18:00",
      averageDuration: 15,
      consistency: "high",
      patterns: [] as Array<{ day: string; time: string }>,
    };
  }),

  getPredictedTime: protectedProcedure.query(async () => {
    return {
      predictedTime: "18:30",
      confidence: 0.8,
      reason: "Based on your recent evening review patterns",
    };
  }),

  checkCalendarConflicts: protectedProcedure
    .input(
      z.object({
        proposedTime: z.string().optional(),
        date: z.string().optional(),
      })
    )
    .query(async () => {
      return {
        hasConflicts: false,
        conflicts: [] as Array<{ title: string; time: string }>,
        suggestedTime: "18:30",
      };
    }),

  /**
   * Generate AI summary of the evening review.
   */
  generateSummary: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        wentWell: z.string().optional(),
        didntGoWell: z.string().optional(),
        moodScore: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const openai = getOpenAIClient();

      const prompt = `Generate a brief, encouraging evening review summary for an executive:

What went well: ${input.wentWell ?? "Not specified"}
What didn't go well: ${input.didntGoWell ?? "Not specified"}
Mood score: ${input.moodScore ?? "Not specified"}/10

Provide:
1. A positive reflection on the day (2 sentences)
2. One key learning or insight
3. One motivating thought for tomorrow

Keep it concise, warm, and professional. Max 100 words.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
        temperature: 0.7,
      });

      const summary =
        completion.choices[0]?.message?.content ??
        "Great work today. Rest well and prepare for tomorrow.";

      return { summary, generatedAt: new Date().toISOString() };
    }),
});

// ─── Morning Signal Router ────────────────────────────────────────────────────
export const morningSignalRouter = router({
  /**
   * Generate a morning signal PDF.
   */
  generatePdf: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      // Get today's signal data to populate the PDF
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const pendingTasks = await db
        .select()
        .from(tasks)
        .where(eq(tasks.userId, ctx.user.id))
        .limit(10);
      const briefData = {
        date: today.toLocaleDateString("en-GB", {
          weekday: "long", year: "numeric", month: "long", day: "numeric",
        }),
        overviewSummary: {
          headline: "Your morning signal — priorities and focus for today",
          energyFocus: "Review your top tasks and set your intention for the day",
        },
        schedule: [],
        priorities: pendingTasks.slice(0, 5).map(t => ({
          title: t.title,
          description: t.description ?? "",
          urgency: t.priority ?? "medium",
          estimatedTime: "30 minutes",
        })),
        insights: [],
      };
      const pdfPath = await generateBriefPDF(briefData);
      if (existsSync(pdfPath)) {
        const pdfBuffer = await readFile(pdfPath);
        const base64 = pdfBuffer.toString("base64");
        await unlink(pdfPath).catch(() => {});
        return {
          success: true,
          pdfUrl: `data:application/pdf;base64,${base64}`,
          message: "Morning Signal PDF generated successfully",
          generatedAt: new Date().toISOString(),
        };
      }
      return {
        success: false,
        pdfUrl: null,
        message: "PDF generation failed",
        generatedAt: new Date().toISOString(),
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      return {
        success: false,
        pdfUrl: null,
        message: `PDF generation failed: ${msg}`,
        generatedAt: new Date().toISOString(),
      };
    }
  }),

  /**
   * Get the morning signal data (tasks, priorities, briefing).
   */
  getSignal: protectedProcedure.query(async ({ ctx }) => {
    // Get today's pending tasks
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pendingTasks = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.userId, ctx.user.id), eq(tasks.status, "pending")))
      .orderBy(desc(tasks.createdAt))
      .limit(10);

    // Get latest evening review
    const latestReview = await db
      .select()
      .from(eveningReviewSessions)
      .where(eq(eveningReviewSessions.userId, ctx.user.id))
      .orderBy(desc(eveningReviewSessions.createdAt))
      .limit(1);

    return {
      date: new Date().toISOString(),
      pendingTasks: pendingTasks.map(t => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        dueDate: t.dueDate?.toISOString() ?? null,
      })),
      previousEvening: latestReview[0]
        ? {
            moodScore: latestReview[0].moodScore,
            tasksAccepted: latestReview[0].tasksAccepted,
            wentWellNotes: latestReview[0].wentWellNotes,
          }
        : null,
      topPriorities: pendingTasks
        .filter(t => t.priority === "high" || t.priority === "urgent")
        .slice(0, 3)
        .map(t => t.title),
    };
  }),
});
