/**
 * Expertconsultation Router
 * 
 * Auto-extracted from monolithic routers.ts
 * 
 * @module routers/domains/expert-consultation
 */

import { router, protectedProcedure } from "../../_core/trpc";
import { z } from "zod";
import { expertService } from "../../services/expert";

export const expertConsultationRouter = router({
    // Record a new consultation
    create: protectedProcedure
      .input(z.object({
        expertId: z.string(),
        expertName: z.string(),
        topic: z.string(),
        summary: z.string().optional(),
        recommendation: z.string().optional(),
        rating: z.number().min(1).max(5).optional(),
        projectId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return createExpertConsultation({
          userId: ctx.user.id,
          ...input,
        });
      }),

    // Get consultation history
    list: protectedProcedure
      .input(z.object({
        expertId: z.string().optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        return getExpertConsultationHistory(ctx.user.id, input);
      }),

    // Get consultation counts per expert
    counts: protectedProcedure
      .query(async ({ ctx }) => {
        return getExpertConsultationCounts(ctx.user.id);
      }),

    // Update consultation (add summary, rating, etc.)
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        summary: z.string().optional(),
        recommendation: z.string().optional(),
        rating: z.number().min(1).max(5).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateExpertConsultation(id, data);
        return { success: true };
      }),

    // Get expert usage statistics
    usageStats: protectedProcedure
      .query(async ({ ctx }) => {
        return getExpertUsageStats(ctx.user.id);
      }),

    // Get top rated experts
    topRated: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return getTopRatedExperts(ctx.user.id, input?.limit || 10);
      }),

    // Get most used experts
    mostUsed: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return getMostUsedExperts(ctx.user.id, input?.limit || 10);
      }),

    // Get consultation trends over time
    trends: protectedProcedure
      .input(z.object({ months: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return getExpertConsultationTrends(ctx.user.id, input?.months || 6);
      }),

    // Rate a consultation
    rate: protectedProcedure
      .input(z.object({
        consultationId: z.number(),
        rating: z.number().min(1).max(10),
        feedback: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await rateExpertConsultation(input.consultationId, input.rating, input.feedback);
        return { success: true };
      }),
});
