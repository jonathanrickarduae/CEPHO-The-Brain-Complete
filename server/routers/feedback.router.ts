/**
 * Feedback Router
 *
 * Handles user feedback submission, retrieval, and NPS scores.
 * Wired to the feedbackHistory table in the database.
 */
import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import { feedbackHistory } from "../../drizzle/schema";
import { desc, eq } from "drizzle-orm";

export const feedbackRouter = router({
  /**
   * Submit feedback (used by the global FeedbackWidget)
   */
  submit: protectedProcedure
    .input(
      z.object({
        type: z.enum(["bug", "feature", "praise", "general"]),
        message: z.string().min(1).max(2000),
        rating: z.number().min(1).max(5).optional(),
        page: z.string().optional(), // current page path
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [record] = await db
        .insert(feedbackHistory)
        .values({
          userId: ctx.user.id,
          feedbackType: input.type,
          feedbackText: input.message,
          rating: input.rating ?? null,
          // Store page in originalOutput field as context
          originalOutput: input.page ? `Page: ${input.page}` : null,
        })
        .returning({ id: feedbackHistory.id });

      return { success: true, id: record.id };
    }),

  /**
   * Legacy record procedure (for expert feedback)
   */
  record: protectedProcedure
    .input(
      z.object({
        type: z.string(),
        rating: z.number().optional(),
        comment: z.string().optional(),
        targetId: z.string().optional(),
        expertId: z.string().optional(),
        projectId: z.string().optional(),
        originalOutput: z.string().optional(),
        correctedOutput: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [record] = await db
        .insert(feedbackHistory)
        .values({
          userId: ctx.user.id,
          expertId: input.expertId ?? input.targetId ?? null,
          projectId: input.projectId ?? null,
          feedbackType: input.type,
          feedbackText: input.comment ?? null,
          rating: input.rating ?? null,
          originalOutput: input.originalOutput ?? null,
          correctedOutput: input.correctedOutput ?? null,
        })
        .returning({ id: feedbackHistory.id });

      return { success: true, id: record.id };
    }),

  /**
   * Get feedback history for the current user
   */
  getHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      const records = await db
        .select()
        .from(feedbackHistory)
        .where(eq(feedbackHistory.userId, ctx.user.id))
        .orderBy(desc(feedbackHistory.createdAt))
        .limit(input.limit);

      return records;
    }),

  /**
   * Get aggregated feedback stats (admin use)
   */
  getStats: protectedProcedure.query(async () => {
    const all = await db
      .select({
        feedbackType: feedbackHistory.feedbackType,
        rating: feedbackHistory.rating,
      })
      .from(feedbackHistory)
      .orderBy(desc(feedbackHistory.createdAt))
      .limit(1000);

    const byType = all.reduce(
      (acc, item) => {
        acc[item.feedbackType] = (acc[item.feedbackType] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const ratings = all
      .filter(r => r.rating !== null)
      .map(r => r.rating as number);

    const avgRating =
      ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : null;

    return {
      total: all.length,
      byType,
      averageRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
    };
  }),
});
