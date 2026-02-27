/**
 * Evening Review & Morning Signal Router
 *
 * Powers the Evening Review session (task decisions, mood, notes)
 * and the Morning Signal (daily briefing from previous evening review).
 */
import { z } from "zod";
import { desc, eq, and, gte } from "drizzle-orm";
import OpenAI from "openai";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import {
  eveningReviewSessions,
  eveningReviewTaskDecisions,
  tasks,
  activityFeed,
} from "../../drizzle/schema";

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
      })
    )
    .mutation(async ({ input, ctx }) => {
      await db
        .update(eveningReviewSessions)
        .set({
          completedAt: new Date(),
          moodScore: input.moodScore ?? null,
          wentWellNotes: input.wentWellNotes ?? null,
          didntGoWellNotes: input.didntGoWellNotes ?? null,
          tasksAccepted: input.tasksAccepted,
          tasksDeferred: input.tasksDeferred,
          tasksRejected: input.tasksRejected,
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
        description: `Completed evening review: ${input.tasksAccepted} accepted, ${input.tasksDeferred} deferred, ${input.tasksRejected} rejected`,
      });

      return { success: true, completedAt: new Date().toISOString() };
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
    // In production this would generate a PDF from the morning briefing
    // For now return a success response with a placeholder URL
    return {
      success: true,
      pdfUrl: null,
      message: "Morning Signal PDF generation is being set up",
      generatedAt: new Date().toISOString(),
    };
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
