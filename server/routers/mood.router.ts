/**
 * Mood Router — Real Implementation
 *
 * Tracks mood history and provides trend analysis.
 */
import { z } from "zod";
import { desc, eq, avg, count } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { moodHistory } from "../../drizzle/schema";

export const moodRouter = router({
  /**
   * Log a mood entry.
   */
  create: protectedProcedure
    .input(
      z.object({
        score: z.number().min(1).max(10),
        note: z.string().max(500).optional(),
        timeOfDay: z
          .enum(["morning", "afternoon", "evening", "night"])
          .default("morning"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [saved] = await db
        .insert(moodHistory)
        .values({
          userId: ctx.user.id,
          score: input.score,
          note: input.note ?? null,
          timeOfDay: input.timeOfDay,
        })
        .returning();

      return {
        id: saved.id,
        score: saved.score,
        note: saved.note,
        timeOfDay: saved.timeOfDay,
        recordedAt: saved.createdAt.toISOString(),
      };
    }),

  /**
   * Get mood history for the current user.
   */
  history: protectedProcedure
    .input(
      z.object({
        days: z.number().min(1).max(365).default(30),
      })
    )
    .query(async ({ input, ctx }) => {
      const rows = await db
        .select()
        .from(moodHistory)
        .where(eq(moodHistory.userId, ctx.user.id))
        .orderBy(desc(moodHistory.createdAt))
        .limit(input.days);

      return rows.map(r => ({
        id: r.id,
        score: r.score,
        note: r.note,
        timeOfDay: r.timeOfDay,
        date: r.createdAt.toISOString(),
      }));
    }),

  /**
   * Get mood trends and averages.
   */
  trends: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const [allTime, recentEntries] = await Promise.all([
      db
        .select({ avg: avg(moodHistory.score), count: count() })
        .from(moodHistory)
        .where(eq(moodHistory.userId, userId)),

      db
        .select()
        .from(moodHistory)
        .where(eq(moodHistory.userId, userId))
        .orderBy(desc(moodHistory.createdAt))
        .limit(14),
    ]);

    const avgAllTime = Number(allTime[0]?.avg ?? 0);
    const totalEntries = Number(allTime[0]?.count ?? 0);

    // Calculate 7-day vs 14-day trend
    const recent7 = recentEntries.slice(0, 7);
    const older7 = recentEntries.slice(7, 14);
    const avg7d =
      recent7.length > 0
        ? recent7.reduce((s, r) => s + r.score, 0) / recent7.length
        : 0;
    const avg14d =
      older7.length > 0
        ? older7.reduce((s, r) => s + r.score, 0) / older7.length
        : avg7d;

    const trend =
      avg7d > avg14d + 0.5
        ? "improving"
        : avg7d < avg14d - 0.5
          ? "declining"
          : "stable";

    return {
      averageAllTime: Math.round(avgAllTime * 10) / 10,
      average7Days: Math.round(avg7d * 10) / 10,
      trend,
      totalEntries,
      recentScores: recentEntries.slice(0, 7).map(r => ({
        score: r.score,
        date: r.createdAt.toISOString(),
      })),
    };
  }),
});
