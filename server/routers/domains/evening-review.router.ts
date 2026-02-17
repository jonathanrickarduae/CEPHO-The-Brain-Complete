/**
 * Eveningreview Router
 * 
 * Auto-extracted from monolithic routers.ts
 * 
 * @module routers/domains/evening-review
 */

import { router } from "../../_core/trpc";
import { z } from "zod";
import { moodService } from "../../services/mood";

export const eveningReviewRouter = router({
    // Create a new review session
    createSession: protectedProcedure
      .input(z.object({
        mode: z.enum(['manual', 'auto_processed', 'delegated']).default('manual'),
      }))
      .mutation(async ({ ctx, input }) => {
        const now = new Date();
        const sessionId = await createEveningReviewSession({
          userId: ctx.user.id,
          reviewDate: now,
          startedAt: now,
          mode: input.mode,
        });
        return { sessionId };
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
        const now = new Date();
        
        // Update session with completion data
        const accepted = input.decisions.filter(d => d.decision === 'accepted').length;
        const deferred = input.decisions.filter(d => d.decision === 'deferred').length;
        const rejected = input.decisions.filter(d => d.decision === 'rejected').length;
        
        await updateEveningReviewSession(input.sessionId, {
          completedAt: now,
          tasksAccepted: accepted,
          tasksDeferred: deferred,
          tasksRejected: rejected,
          moodScore: input.moodScore,
          wentWellNotes: input.wentWellNotes,
          didntGoWellNotes: input.didntGoWellNotes,
        });
        
        // Save task decisions
        const taskDecisions = input.decisions.map(d => ({
          sessionId: input.sessionId,
          taskId: d.taskId,
          taskTitle: d.taskTitle,
          projectName: d.projectName,
          decision: d.decision,
          priority: d.priority,
          estimatedTime: d.estimatedTime,
          notes: d.notes,
        }));
        await createEveningReviewTaskDecisions(taskDecisions);
        
        // Update timing patterns for learning
        const startTime = now.toTimeString().slice(0, 5); // HH:MM
        const dayOfWeek = now.getDay();
        await updateReviewTimingPattern(
          ctx.user.id,
          dayOfWeek,
          startTime,
          15, // Default duration estimate
          false
        );
        
        // Generate signal items for morning brief
        const decisions = await getEveningReviewTaskDecisions(input.sessionId);
        const signalCount = await generateSignalItemsFromReview(
          ctx.user.id,
          input.sessionId,
          decisions,
          input.moodScore,
          { wentWell: input.wentWellNotes, didntGoWell: input.didntGoWellNotes }
        );
        
        // Update session with signal count
        await updateEveningReviewSession(input.sessionId, {
          signalItemsGenerated: signalCount,
        });
        
        return {
          success: true,
          stats: { accepted, deferred, rejected },
          signalItemsGenerated: signalCount,
        };
      }),

    // Get review history
    getHistory: protectedProcedure
      .input(z.object({
        limit: z.number().optional(),
        days: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        const options: { limit?: number; startDate?: Date } = {};
        if (input?.limit) options.limit = input.limit;
        if (input?.days) {
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - input.days);
          options.startDate = startDate;
        }
        return getEveningReviewSessions(ctx.user.id, options);
      }),

    // Get latest session
    getLatest: protectedProcedure.query(async ({ ctx }) => {
      return getLatestEveningReviewSession(ctx.user.id);
    }),

    // Get timing patterns (for learning)
    getTimingPatterns: protectedProcedure.query(async ({ ctx }) => {
      return getAllReviewTimingPatterns(ctx.user.id);
    }),

    // Get predicted review time for today
    getPredictedTime: protectedProcedure.query(async ({ ctx }) => {
      const dayOfWeek = new Date().getDay();
      const predicted = await getPredictedReviewTime(ctx.user.id, dayOfWeek);
      return { predictedTime: predicted };
    }),

    // Check if user has events during review window
    checkCalendarConflicts: protectedProcedure
      .input(z.object({
        windowStart: z.string(), // ISO date string
        windowEnd: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        const hasConflicts = await hasEventsInWindow(
          ctx.user.id,
          new Date(input.windowStart),
          new Date(input.windowEnd)
        );
        return { hasConflicts };
      }),
});
