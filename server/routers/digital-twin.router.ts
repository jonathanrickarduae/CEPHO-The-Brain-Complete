/**
 * Digital Twin / Chief of Staff Router
 * Endpoints for personalized AI assistant and training
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import * as digitalTwinService from "../services/digital-twin-service";

export const digital-twin.router = router({
  /**
   * Get or create digital twin profile
   */
  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
      return await digitalTwinService.getOrCreateProfile(ctx.user.id);
    }),

  /**
   * Get training progress
   */
  getTrainingProgress: protectedProcedure
    .query(async ({ ctx }) => {
      return await digitalTwinService.getTrainingProgress(ctx.user.id);
    }),

  /**
   * List all training modules
   */
  listModules: protectedProcedure
    .query(async () => {
      return digitalTwinService.TRAINING_MODULES;
    }),

  /**
   * Get specific module details
   */
  getModule: protectedProcedure
    .input(z.object({
      moduleId: z.number(),
    }))
    .query(async ({ input }) => {
      return digitalTwinService.getModule(input.moduleId);
    }),

  /**
   * Start a training module
   */
  startModule: protectedProcedure
    .input(z.object({
      moduleId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      return await digitalTwinService.startModule(ctx.user.id, input.moduleId);
    }),

  /**
   * Complete a training module
   */
  completeModule: protectedProcedure
    .input(z.object({
      moduleId: z.number(),
      assessmentScore: z.number().min(0).max(100),
    }))
    .mutation(async ({ input, ctx }) => {
      return await digitalTwinService.completeModule(
        ctx.user.id,
        input.moduleId,
        input.assessmentScore
      );
    }),

  /**
   * Record a decision for learning
   */
  recordDecision: protectedProcedure
    .input(z.object({
      context: z.string(),
      options: z.array(z.string()),
      selectedOption: z.string(),
      reasoning: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      return await digitalTwinService.recordDecision(
        ctx.user.id,
        input.context,
        input.options,
        input.selectedOption,
        input.reasoning
      );
    }),

  /**
   * Get AI suggestion
   */
  getSuggestion: protectedProcedure
    .input(z.object({
      context: z.string(),
      options: z.array(z.string()),
    }))
    .query(async ({ input, ctx }) => {
      return await digitalTwinService.getSuggestion(
        ctx.user.id,
        input.context,
        input.options
      );
    }),

  /**
   * Get decision history
   */
  getDecisionHistory: protectedProcedure
    .input(z.object({
      limit: z.number().default(50),
    }))
    .query(async ({ input, ctx }) => {
      return await digitalTwinService.getDecisionHistory(ctx.user.id, input.limit);
    }),

  /**
   * Get competency score
   */
  getCompetencyScore: protectedProcedure
    .query(async ({ ctx }) => {
      return await digitalTwinService.getCompetencyScore(ctx.user.id);
    }),

  /**
   * Update learning style
   */
  updateLearningStyle: protectedProcedure
    .input(z.object({
      learningStyle: z.enum(['visual', 'auditory', 'kinesthetic', 'reading', 'adaptive']),
    }))
    .mutation(async ({ input, ctx }) => {
      return await digitalTwinService.updateLearningStyle(ctx.user.id, input.learningStyle);
    }),

  /**
   * Record user preference
   */
  recordPreference: protectedProcedure
    .input(z.object({
      category: z.string(),
      preference: z.any(),
    }))
    .mutation(async ({ input, ctx }) => {
      return await digitalTwinService.recordPreference(
        ctx.user.id,
        input.category,
        input.preference
      );
    }),
});
