/**
 * Eveningreview Router
 * 
 * Auto-extracted from monolithic routers.ts
 * 
 * @module routers/domains/evening-review
 */

import { router, protectedProcedure } from "../../_core/trpc";
import { z } from "zod";
import { moodService } from "../../services/mood";
import { handleTRPCError } from "../../utils/error-handler";
import { reviewRepository } from "../../db/repositories";

export const eveningReviewRouter = router({
    // Create a new review session
    createSession: protectedProcedure
      .input(z.object({
        mode: z.enum(['manual', 'auto_processed', 'delegated']).default('manual'),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const now = new Date();
          const session = await reviewRepository.createEveningReviewSession({
            userId: ctx.user.id,
            reviewDate: now,
            startedAt: now,
            mode: input.mode,
          });
          return { sessionId: session?.id };
        } catch (error) {
          handleTRPCError(error, "EveningReviewCreateSession");
        }
      }),

    // Complete a review session
    completeSession: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        decisions: z.array(z.object({
          taskId: z.number().optional(),
          taskTitle: z.string(),
          projectName: z.string().optional(),
          decision: z.enum(['accepted', 'deferred', 'rejected']),
          priority: z.string().optional(),
          estimatedTime: z.string().optional(),
          notes: z.string().optional(),
        })),
        moodScore: z.number().min(0).max(100).optional(),
        wentWellNotes: z.string().optional(),
        didntGoWellNotes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const now = new Date();
          
          // Update session with completion data
          await reviewRepository.updateEveningReviewSession(input.sessionId, {
            completedAt: now,
            moodScore: input.moodScore,
            wentWellNotes: input.wentWellNotes,
            didntGoWellNotes: input.didntGoWellNotes,
            totalDecisions: input.decisions.length,
          });

          // Store decisions
          for (const decision of input.decisions) {
            await reviewRepository.createEveningReviewTaskDecision({
              sessionId: input.sessionId,
              userId: ctx.user.id,
              taskId: decision.taskId,
              taskTitle: decision.taskTitle,
              projectName: decision.projectName,
              decision: decision.decision,
              priority: decision.priority,
              estimatedTime: decision.estimatedTime,
              notes: decision.notes,
            });
          }

          // Update timing pattern for ML
          const duration = now.getTime() - new Date().getTime();
          await reviewRepository.updateReviewTimingPattern(ctx.user.id, {
            dayOfWeek: now.getDay(),
            averageDurationMs: duration,
            taskCount: input.decisions.length,
          });

          return { success: true };
        } catch (error) {
          handleTRPCError(error, "EveningReviewCompleteSession");
        }
      }),

    // Get latest session
    getLatest: protectedProcedure.query(async ({ ctx }) => {
      try {
        return await reviewRepository.getLatestEveningReviewSession(ctx.user.id);
      } catch (error) {
        handleTRPCError(error, "EveningReviewGetLatest");
      }
    }),

    // Get review history
    getHistory: protectedProcedure
      .input(z.object({
        limit: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        try {
          return await reviewRepository.getEveningReviewSessions(ctx.user.id, input.limit);
        } catch (error) {
          handleTRPCError(error, "EveningReviewGetHistory");
        }
      }),

    // Get task decisions for a session
    getSessionDecisions: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        try {
          return await reviewRepository.getEveningReviewTaskDecisions(input.sessionId);
        } catch (error) {
          handleTRPCError(error, "EveningReviewGetDecisions");
        }
      }),

    // Get predicted review time (ML-based)
    getPredictedTime: protectedProcedure.query(async ({ ctx }) => {
      try {
        const patterns = await reviewRepository.getAllReviewTimingPatterns(ctx.user.id);
        const today = new Date().getDay();
        const todayPattern = patterns.find(p => p.dayOfWeek === today);
        
        return {
          estimatedDurationMs: todayPattern?.averageDurationMs || 1800000, // Default 30 min
          confidence: todayPattern ? 0.8 : 0.3,
        };
      } catch (error) {
        handleTRPCError(error, "EveningReviewGetPredictedTime");
      }
    }),

    // Get timing patterns for analytics
    getTimingPatterns: protectedProcedure.query(async ({ ctx }) => {
      try {
        return await reviewRepository.getAllReviewTimingPatterns(ctx.user.id);
      } catch (error) {
        handleTRPCError(error, "EveningReviewGetTimingPatterns");
      }
    }),
});
