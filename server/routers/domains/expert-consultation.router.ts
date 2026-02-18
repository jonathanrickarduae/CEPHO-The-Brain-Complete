/**
 * Expert Consultation Router
 * 
 * Handles expert consultations using service layer
 * 
 * @module routers/domains/expert-consultation
 */

import { router, protectedProcedure } from "../../_core/trpc";
import { z } from "zod";
import { expertService } from "../../services/expert";
import { handleTRPCError } from "../../utils/error-handler";

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
        try {
          return await expertService.createConsultation(ctx.user.id, {
            expertId: input.expertId,
            topic: input.topic,
            summary: input.summary,
            recommendation: input.recommendation,
            rating: input.rating,
            projectId: input.projectId,
          });
        } catch (error) {
          handleTRPCError(error, 'ExpertConsultation.create');
        }
      }),

    // Get consultation history
    list: protectedProcedure
      .input(z.object({
        expertId: z.string().optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        try {
          if (input?.expertId) {
            return await expertService.getExpertConsultations(ctx.user.id, input.expertId);
          }
          return await expertService.getUserConsultations(ctx.user.id);
        } catch (error) {
          handleTRPCError(error, 'ExpertConsultation.list');
        }
      }),

    // Get consultation counts per expert
    counts: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          const consultations = await expertService.getUserConsultations(ctx.user.id);
          
          // Group by expertId and count
          const counts = consultations.reduce((acc, c) => {
            acc[c.expertId] = (acc[c.expertId] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          return counts;
        } catch (error) {
          handleTRPCError(error, 'ExpertConsultation.counts');
        }
      }),

    // Update consultation (add summary, rating, etc.)
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        summary: z.string().optional(),
        recommendation: z.string().optional(),
        rating: z.number().min(1).max(5).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const { id, ...data } = input;
          
          // Update consultation
          if (data.rating) {
            await expertService.rateConsultation(ctx.user.id, id, data.rating);
          }
          
          if (data.summary || data.recommendation) {
            const consultation = await expertService.getConsultation(ctx.user.id, id);
            if (consultation) {
              await expertService.completeConsultation(ctx.user.id, id);
            }
          }
          
          return { success: true };
        } catch (error) {
          handleTRPCError(error, 'ExpertConsultation.update');
        }
      }),

    // Get expert usage statistics
    usageStats: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          const consultations = await expertService.getUserConsultations(ctx.user.id);
          
          return {
            total: consultations.length,
            byExpert: consultations.reduce((acc, c) => {
              acc[c.expertId] = (acc[c.expertId] || 0) + 1;
              return acc;
            }, {} as Record<string, number>),
            averageRating: consultations.reduce((sum, c) => sum + (c.rating || 0), 0) / consultations.length || 0,
          };
        } catch (error) {
          handleTRPCError(error, 'ExpertConsultation.usageStats');
        }
      }),

    // Get top rated experts
    topRated: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        try {
          const consultations = await expertService.getUserConsultations(ctx.user.id);
          
          // Calculate average rating per expert
          const expertRatings = consultations.reduce((acc, c) => {
            if (!acc[c.expertId]) {
              acc[c.expertId] = { total: 0, count: 0, expertId: c.expertId };
            }
            if (c.rating) {
              acc[c.expertId].total += c.rating;
              acc[c.expertId].count++;
            }
            return acc;
          }, {} as Record<string, { total: number; count: number; expertId: string }>);
          
          // Sort by average rating
          const sorted = Object.values(expertRatings)
            .map(e => ({
              expertId: e.expertId,
              averageRating: e.count > 0 ? e.total / e.count : 0,
              consultationCount: e.count,
            }))
            .sort((a, b) => b.averageRating - a.averageRating)
            .slice(0, input?.limit || 10);
          
          return sorted;
        } catch (error) {
          handleTRPCError(error, 'ExpertConsultation.topRated');
        }
      }),

    // Get most used experts
    mostUsed: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        try {
          const consultations = await expertService.getUserConsultations(ctx.user.id);
          
          // Count consultations per expert
          const expertCounts = consultations.reduce((acc, c) => {
            acc[c.expertId] = (acc[c.expertId] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          // Sort by count
          const sorted = Object.entries(expertCounts)
            .map(([expertId, count]) => ({ expertId, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, input?.limit || 10);
          
          return sorted;
        } catch (error) {
          handleTRPCError(error, 'ExpertConsultation.mostUsed');
        }
      }),

    // Get consultation trends over time
    trends: protectedProcedure
      .input(z.object({ months: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        try {
          const consultations = await expertService.getUserConsultations(ctx.user.id);
          const months = input?.months || 6;
          
          // Filter to last N months
          const cutoffDate = new Date();
          cutoffDate.setMonth(cutoffDate.getMonth() - months);
          
          const recentConsultations = consultations.filter(c => 
            new Date(c.createdAt) >= cutoffDate
          );
          
          // Group by month
          const byMonth = recentConsultations.reduce((acc, c) => {
            const month = new Date(c.createdAt).toISOString().slice(0, 7); // YYYY-MM
            acc[month] = (acc[month] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          return byMonth;
        } catch (error) {
          handleTRPCError(error, 'ExpertConsultation.trends');
        }
      }),

    // Rate a consultation
    rate: protectedProcedure
      .input(z.object({
        consultationId: z.number(),
        rating: z.number().min(1).max(10),
        feedback: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          await expertService.rateConsultation(
            ctx.user.id,
            input.consultationId,
            input.rating
          );
          
          return { success: true };
        } catch (error) {
          handleTRPCError(error, 'ExpertConsultation.rate');
        }
      }),
});
