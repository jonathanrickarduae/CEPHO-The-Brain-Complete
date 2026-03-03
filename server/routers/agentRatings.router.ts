/**
 * Agent Ratings Router
 * Allows users to rate AI agents after interactions.
 * Powers the continuous learning loop and agent performance dashboard.
 * Phase 6 — Enhancements
 */
import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import { agentRatings } from "../../drizzle/schema";
import { eq, desc, avg, count, and } from "drizzle-orm";

export const agentRatingsRouter = router({
  /**
   * Submit a rating for an agent interaction
   */
  submitRating: protectedProcedure
    .input(
      z.object({
        agentId: z.string(),
        agentName: z.string(),
        sessionId: z.string().optional(),
        rating: z.number().int().min(1).max(5),
        feedback: z.string().optional(),
        taskType: z.string().optional(),
        wasHelpful: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [rating] = await db
        .insert(agentRatings)
        .values({
          userId: ctx.user.id,
          agentId: input.agentId,
          agentName: input.agentName,
          sessionId: input.sessionId,
          rating: input.rating,
          feedback: input.feedback,
          taskType: input.taskType,
          wasHelpful: input.wasHelpful,
        })
        .returning();

      return { success: true, rating };
    }),

  /**
   * Get all ratings for the current user
   */
  getMyRatings: protectedProcedure
    .input(
      z.object({
        agentId: z.string().optional(),
        limit: z.number().int().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(agentRatings.userId, ctx.user.id)];
      if (input.agentId) {
        conditions.push(eq(agentRatings.agentId, input.agentId));
      }

      const ratings = await db
        .select()
        .from(agentRatings)
        .where(and(...conditions))
        .orderBy(desc(agentRatings.createdAt))
        .limit(input.limit);

      return { ratings };
    }),

  /**
   * Get aggregated performance stats for all agents
   */
  getAgentPerformanceStats: protectedProcedure.query(async ({ ctx }) => {
    const stats = await db
      .select({
        agentId: agentRatings.agentId,
        agentName: agentRatings.agentName,
        averageRating: avg(agentRatings.rating),
        totalRatings: count(agentRatings.id),
      })
      .from(agentRatings)
      .where(eq(agentRatings.userId, ctx.user.id))
      .groupBy(agentRatings.agentId, agentRatings.agentName);

    return {
      stats: stats.map(s => ({
        ...s,
        averageRating: s.averageRating
          ? Number(s.averageRating).toFixed(1)
          : null,
        totalRatings: Number(s.totalRatings),
      })),
    };
  }),
});
