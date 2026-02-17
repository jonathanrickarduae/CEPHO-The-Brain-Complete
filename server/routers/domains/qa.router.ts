/**
 * Qa Router
 * 
 * Auto-extracted from monolithic routers.ts
 * 
 * @module routers/domains/qa
 */

import { router } from "../../_core/trpc";
import { z } from "zod";

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
      }),

    // Get all reviews for a task
    getTaskReviews: protectedProcedure
      .input(z.object({ taskId: z.number() }))
      .query(async ({ input }) => {
        return getTaskQaReviews(input.taskId);
      }),

    // Get tasks with QA status
    getTasksWithStatus: protectedProcedure
      .input(z.object({
        projectId: z.number().optional(),
        status: z.string().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        return getTasksWithQaStatus(ctx.user.id, input);
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
        const { reviewId, ...data } = input;
        await updateTaskQaReview(reviewId, data);
        return { success: true };
      }),
});
