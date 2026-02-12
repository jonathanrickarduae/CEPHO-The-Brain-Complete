/**
 * SME (Subject Matter Expert) Router
 * Endpoints for managing 323 AI experts and consultations
 */

import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import * as smeService from "../services/sme-service";

export const smeRouter = router({
  /**
   * Load all 323 experts into database (admin operation)
   */
  loadExperts: protectedProcedure
    .mutation(async () => {
      return await smeService.loadExperts();
    }),

  /**
   * Get all experts
   */
  listExperts: publicProcedure
    .query(async () => {
      return await smeService.getAllExperts();
    }),

  /**
   * Get single expert by ID
   */
  getExpert: publicProcedure
    .input(z.object({
      expertId: z.string(),
    }))
    .query(async ({ input }) => {
      return await smeService.getExpert(input.expertId);
    }),

  /**
   * Get experts by category
   */
  getByCategory: publicProcedure
    .input(z.object({
      category: z.string(),
    }))
    .query(async ({ input }) => {
      return await smeService.getExpertsByCategory(input.category);
    }),

  /**
   * Search experts
   */
  search: publicProcedure
    .input(z.object({
      query: z.string(),
    }))
    .query(async ({ input }) => {
      return await smeService.searchExperts(input.query);
    }),

  /**
   * Assemble expert panel
   */
  assemblePanel: protectedProcedure
    .input(z.object({
      projectType: z.string(),
      panelType: z.enum(['blue_team', 'left_field', 'red_team']),
      size: z.number().default(5),
    }))
    .query(async ({ input }) => {
      return await smeService.assemblePanel(
        input.projectType,
        input.panelType,
        input.size
      );
    }),

  /**
   * Request consultation with an expert
   */
  requestConsultation: protectedProcedure
    .input(z.object({
      expertId: z.string(),
      question: z.string(),
      context: z.any().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return await smeService.requestConsultation(
        ctx.user.id,
        input.expertId,
        input.question,
        input.context
      );
    }),

  /**
   * Get consultation history
   */
  getHistory: protectedProcedure
    .input(z.object({
      limit: z.number().default(20),
    }))
    .query(async ({ input, ctx }) => {
      return await smeService.getConsultationHistory(ctx.user.id, input.limit);
    }),

  /**
   * Submit feedback for consultation
   */
  submitFeedback: protectedProcedure
    .input(z.object({
      consultationId: z.string(),
      rating: z.number().min(1).max(5),
      comment: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return await smeService.submitFeedback(
        input.consultationId,
        input.rating,
        input.comment
      );
    }),

  /**
   * Get expert statistics
   */
  getStats: publicProcedure
    .query(async () => {
      return await smeService.getExpertStats();
    }),
});
