/**
 * Innovation Hub Workflow Router
 * Manages idea suggestions from AI agents, SMEs, Chief of Staff, and Digital Twin
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { innovationHubWorkflowService } from "../services/innovation-hub-workflow.service";

export const innovationHubWorkflowRouter = router({
  /**
   * Submit an idea suggestion (used by AI agents, SMEs, etc.)
   */
  submitSuggestion: protectedProcedure
    .input(z.object({
      sourceType: z.enum(['sme', 'ai_agent', 'chief_of_staff', 'digital_twin']),
      sourceId: z.string(),
      sourceName: z.string(),
      title: z.string().min(1),
      description: z.string().min(1),
      rationale: z.string().min(1),
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      confidence: z.number().min(0).max(100).optional(),
      supportingData: z.any().optional(),
    }))
    .mutation(async ({ input }) => {
      return await innovationHubWorkflowService.submitIdeaSuggestion(
        input.sourceType,
        input.sourceId,
        input.sourceName,
        {
          title: input.title,
          description: input.description,
          rationale: input.rationale,
          category: input.category,
          tags: input.tags,
          priority: input.priority,
          confidence: input.confidence,
          supportingData: input.supportingData,
        }
      );
    }),

  /**
   * Get all pending suggestions
   */
  getPendingSuggestions: protectedProcedure
    .query(async () => {
      return await innovationHubWorkflowService.getPendingSuggestions();
    }),

  /**
   * Get suggestions by source
   */
  getSuggestionsBySource: protectedProcedure
    .input(z.object({
      sourceType: z.string(),
      sourceId: z.string().optional(),
    }))
    .query(async ({ input }) => {
      return await innovationHubWorkflowService.getSuggestionsBySource(
        input.sourceType,
        input.sourceId
      );
    }),

  /**
   * Review a suggestion
   */
  reviewSuggestion: protectedProcedure
    .input(z.object({
      suggestionId: z.string(),
      status: z.enum(['accepted', 'rejected']),
      rejectionReason: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return await innovationHubWorkflowService.reviewSuggestion(
        input.suggestionId,
        input.status,
        ctx.user.id,
        input.rejectionReason
      );
    }),

  /**
   * Convert accepted suggestion to Innovation Hub idea
   */
  convertToIdea: protectedProcedure
    .input(z.object({
      suggestionId: z.string(),
      additionalContext: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return await innovationHubWorkflowService.convertToIdea(
        input.suggestionId,
        ctx.user.id,
        input.additionalContext
      );
    }),

  /**
   * Get suggestion statistics
   */
  getStats: protectedProcedure
    .query(async () => {
      return await innovationHubWorkflowService.getSuggestionStats();
    }),

  /**
   * Get conversion history
   */
  getConversionHistory: protectedProcedure
    .input(z.object({
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      return await innovationHubWorkflowService.getConversionHistory(input.limit);
    }),
});
