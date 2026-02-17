/**
 * Collaborativereview Router
 * 
 * Auto-extracted from monolithic routers.ts
 * 
 * @module routers/domains/collaborative-review
 */

import { router } from "../../_core/trpc";
import { z } from "zod";
import { reviewService } from "../../services/review";

export const collaborativeReviewRouter = router({
    // Create a new collaborative review session
    createSession: protectedProcedure
      .input(z.object({
        projectName: z.string(),
        templateId: z.string().optional(),
        reviewData: z.any().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const sessionId = await createCollaborativeReviewSession({
          ownerId: ctx.user.id,
          projectName: input.projectName,
          templateId: input.templateId,
          reviewData: input.reviewData,
        });
        return { sessionId };
      }),

    // Get user's collaborative review sessions
    getSessions: protectedProcedure.query(async ({ ctx }) => {
      return getCollaborativeReviewSessions(ctx.user.id);
    }),

    // Get a specific session with details
    getSession: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ ctx, input }) => {
        const isParticipant = await isSessionParticipant(input.sessionId, ctx.user.id);
        if (!isParticipant) {
          throw new Error('Not authorized to view this session');
        }
        return getCollaborativeReviewSessionWithDetails(input.sessionId);
      }),

    // Update session review data
    updateSession: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        status: z.enum(['active', 'completed', 'archived']).optional(),
        reviewData: z.any().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const role = await getParticipantRole(input.sessionId, ctx.user.id);
        if (role !== 'owner' && role !== 'reviewer') {
          throw new Error('Not authorized to update this session');
        }
        await updateCollaborativeReviewSession(input.sessionId, {
          status: input.status,
          reviewData: input.reviewData,
        });
        return { success: true };
      }),

    // Invite participant to session
    inviteParticipant: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        userId: z.number(),
        role: z.enum(['reviewer', 'viewer']),
      }))
      .mutation(async ({ ctx, input }) => {
        const myRole = await getParticipantRole(input.sessionId, ctx.user.id);
        if (myRole !== 'owner') {
          throw new Error('Only the owner can invite participants');
        }
        const participantId = await addCollaborativeReviewParticipant({
          sessionId: input.sessionId,
          userId: input.userId,
          role: input.role,
          invitedBy: ctx.user.id,
        });
        return { participantId };
      }),

    // Get participants for a session
    getParticipants: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ ctx, input }) => {
        const isParticipant = await isSessionParticipant(input.sessionId, ctx.user.id);
        if (!isParticipant) {
          throw new Error('Not authorized to view participants');
        }
        return getCollaborativeReviewParticipants(input.sessionId);
      }),

    // Join a session (mark as joined)
    joinSession: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const participants = await getCollaborativeReviewParticipants(input.sessionId);
        const myParticipant = participants.find(p => p.userId === ctx.user.id);
        if (!myParticipant) {
          throw new Error('You are not invited to this session');
        }
        await updateCollaborativeReviewParticipant(myParticipant.id, {
          joinedAt: new Date(),
          lastActiveAt: new Date(),
        });
        await logCollaborativeReviewActivity({
          sessionId: input.sessionId,
          userId: ctx.user.id,
          action: 'joined',
        });
        return { success: true };
      }),

    // Add comment to a section
    addComment: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        sectionId: z.string(),
        comment: z.string(),
        parentCommentId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const role = await getParticipantRole(input.sessionId, ctx.user.id);
        if (!role) {
          throw new Error('Not authorized to comment');
        }
        const commentId = await createCollaborativeReviewComment({
          sessionId: input.sessionId,
          userId: ctx.user.id,
          sectionId: input.sectionId,
          comment: input.comment,
          parentCommentId: input.parentCommentId,
        });
        await logCollaborativeReviewActivity({
          sessionId: input.sessionId,
          userId: ctx.user.id,
          action: 'commented',
          sectionId: input.sectionId,
        });
        return { commentId };
      }),

    // Get comments for a session
    getComments: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        sectionId: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const isParticipant = await isSessionParticipant(input.sessionId, ctx.user.id);
        if (!isParticipant) {
          throw new Error('Not authorized to view comments');
        }
        return getCollaborativeReviewComments(input.sessionId, input.sectionId);
      }),

    // Resolve a comment
    resolveComment: protectedProcedure
      .input(z.object({
        commentId: z.number(),
        sessionId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const role = await getParticipantRole(input.sessionId, ctx.user.id);
        if (role !== 'owner' && role !== 'reviewer') {
          throw new Error('Not authorized to resolve comments');
        }
        await updateCollaborativeReviewComment(input.commentId, { status: 'resolved' });
        return { success: true };
      }),

    // Log activity
    logActivity: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        action: z.enum(['viewed_section', 'reviewed_section', 'completed_review']),
        sectionId: z.string().optional(),
        metadata: z.any().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await logCollaborativeReviewActivity({
          sessionId: input.sessionId,
          userId: ctx.user.id,
          action: input.action,
          sectionId: input.sectionId,
          metadata: input.metadata,
        });
        // Update last active
        const participants = await getCollaborativeReviewParticipants(input.sessionId);
        const myParticipant = participants.find(p => p.userId === ctx.user.id);
        if (myParticipant) {
          await updateCollaborativeReviewParticipant(myParticipant.id, {
            lastActiveAt: new Date(),
          });
        }
        return { success: true };
      }),

    // Get activity for a session
    getActivity: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        limit: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const isParticipant = await isSessionParticipant(input.sessionId, ctx.user.id);
        if (!isParticipant) {
          throw new Error('Not authorized to view activity');
        }
        return getCollaborativeReviewActivity(input.sessionId, input.limit || 50);
      }),
});
