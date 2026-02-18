/**
 * QA Router
 * 
 * Handles task quality assurance reviews
 * 
 * @module routers/domains/qa
 */

import { router, protectedProcedure } from "../../_core/trpc";
import { z } from "zod";
import { analyticsService } from "../../services/analytics";
import { handleTRPCError } from "../../utils/error-handler";

export const qaRouter = router({
    // Submit Chief of Staff review
    submitCoSReview: protectedProcedure
      .input(z.object({
        taskId: z.number(),
        score: z.number().min(0).max(100),
        feedback: z.string().optional(),
        status: z.enum(['approved', 'rejected', 'needs_revision']),
        improvements: z.array(z.string()).optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const { createTaskQaReview, updateTaskQaStatus } = await import('../../db');
          
          // Create the review record
          const review = await createTaskQaReview({
            taskId: input.taskId,
            reviewType: 'cos_review',
            reviewerId: 'chief_of_staff',
            score: input.score,
            feedback: input.feedback,
            status: input.status,
            improvements: input.improvements,
          });

          // Update task QA status
          if (input.status === 'approved') {
            await updateTaskQaStatus(input.taskId, 'cos_reviewed', input.score);
          } else if (input.status === 'rejected') {
            await updateTaskQaStatus(input.taskId, 'rejected', input.score);
          }

          return review;
        } catch (error) {
          handleTRPCError(error, 'QA.submitCoSReview');
        }
      }),

    // Submit Secondary AI verification
    submitSecondaryReview: protectedProcedure
      .input(z.object({
        taskId: z.number(),
        score: z.number().min(0).max(100),
        feedback: z.string().optional(),
        status: z.enum(['approved', 'rejected', 'needs_revision']),
        improvements: z.array(z.string()).optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const { createTaskQaReview, updateTaskQaStatus } = await import('../../db');
          
          // Create the review record
          const review = await createTaskQaReview({
            taskId: input.taskId,
            reviewType: 'secondary_ai',
            reviewerId: 'secondary_ai_verifier',
            score: input.score,
            feedback: input.feedback,
            status: input.status,
            improvements: input.improvements,
          });

          // Update task QA status - if both CoS and Secondary AI approved, mark as fully approved
          if (input.status === 'approved') {
            await updateTaskQaStatus(input.taskId, 'approved', undefined, input.score);
          } else if (input.status === 'rejected') {
            await updateTaskQaStatus(input.taskId, 'rejected', undefined, input.score);
          }

          return review;
        } catch (error) {
          handleTRPCError(error, 'QA.submitSecondaryReview');
        }
      }),

    // Get all reviews for a task
    getTaskReviews: protectedProcedure
      .input(z.object({ taskId: z.number() }))
      .query(async ({ input }) => {
        try {
          const { getTaskQaReviews } = await import('../../db');
          return await getTaskQaReviews(input.taskId);
        } catch (error) {
          handleTRPCError(error, 'QA.getTaskReviews');
        }
      }),

    // Get tasks with QA status
    getTasksWithStatus: protectedProcedure
      .input(z.object({
        projectId: z.number().optional(),
        status: z.string().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        try {
          const { getTasksWithQaStatus } = await import('../../db');
          return await getTasksWithQaStatus(ctx.user.id, input);
        } catch (error) {
          handleTRPCError(error, 'QA.getTasksWithStatus');
        }
      }),

    // Update QA review
    updateReview: protectedProcedure
      .input(z.object({
        reviewId: z.number(),
        score: z.number().min(1).max(10).optional(),
        feedback: z.string().optional(),
        status: z.enum(['pending', 'approved', 'rejected', 'needs_revision']).optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const { updateTaskQaReview } = await import('../../db');
          const { reviewId, ...data } = input;
          await updateTaskQaReview(reviewId, data);
          return { success: true };
        } catch (error) {
          handleTRPCError(error, 'QA.updateReview');
        }
      }),
});
