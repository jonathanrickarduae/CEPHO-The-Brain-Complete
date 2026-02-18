/**
 * Collaborative Review Router
 * 
 * Handles collaborative review sessions using service layer
 * 
 * @module routers/domains/collaborative-review
 */

import { router, protectedProcedure } from "../../_core/trpc";
import { z } from "zod";
import { reviewService } from "../../services/review";
import { handleTRPCError, assertExists } from "../../utils/error-handler";

export const collaborativeReviewRouter = router({
    // Create a new collaborative review session
    createSession: protectedProcedure
      .input(z.object({
        projectName: z.string(),
        templateId: z.string().optional(),
        reviewData: z.any().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const sessionId = await reviewService.createCollaborativeReviewSession({
            ownerId: ctx.user.id,
            projectName: input.projectName,
            templateId: input.templateId,
            reviewData: input.reviewData,
          });
          return { sessionId };
        } catch (error) {
          handleTRPCError(error, 'CollaborativeReview.createSession');
        }
      }),

    // Get user's collaborative review sessions
    getSessions: protectedProcedure.query(async ({ ctx }) => {
      try {
        return await reviewService.getCollaborativeReviewSessions(ctx.user.id);
      } catch (error) {
        handleTRPCError(error, 'CollaborativeReview.getSessions');
      }
    }),

    // Get a specific session with details
    getSession: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ ctx, input }) => {
        try {
          const isParticipant = await reviewService.isSessionParticipant(input.sessionId, ctx.user.id);
          if (!isParticipant) {
            throw new Error('Not authorized to view this session');
          }
          
          const session = await reviewService.getCollaborativeReviewSessionWithDetails(input.sessionId);
          assertExists(session, 'Session', input.sessionId);
          
          return session;
        } catch (error) {
          handleTRPCError(error, 'CollaborativeReview.getSession');
        }
      }),

    // Update session review data
    updateSession: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        status: z.enum(['active', 'completed', 'archived']).optional(),
        reviewData: z.any().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const role = await reviewService.getParticipantRole(input.sessionId, ctx.user.id);
          if (role !== 'owner' && role !== 'reviewer') {
            throw new Error('Not authorized to update this session');
          }
          
          await reviewService.updateCollaborativeReviewSession(input.sessionId, {
            status: input.status,
            reviewData: input.reviewData,
          });
          
          return { success: true };
        } catch (error) {
          handleTRPCError(error, 'CollaborativeReview.updateSession');
        }
      }),

    // Invite participant to session
    inviteParticipant: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        userId: z.number(),
        role: z.enum(['reviewer', 'viewer']),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const myRole = await reviewService.getParticipantRole(input.sessionId, ctx.user.id);
          if (myRole !== 'owner') {
            throw new Error('Only the owner can invite participants');
          }
          
          const participantId = await reviewService.addCollaborativeReviewParticipant({
            sessionId: input.sessionId,
            userId: input.userId,
            role: input.role,
            invitedBy: ctx.user.id,
          });
          
          return { participantId };
        } catch (error) {
          handleTRPCError(error, 'CollaborativeReview.inviteParticipant');
        }
      }),

    // Get participants for a session
    getParticipants: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ ctx, input }) => {
        try {
          const isParticipant = await reviewService.isSessionParticipant(input.sessionId, ctx.user.id);
          if (!isParticipant) {
            throw new Error('Not authorized to view participants');
          }
          
          return await reviewService.getCollaborativeReviewParticipants(input.sessionId);
        } catch (error) {
          handleTRPCError(error, 'CollaborativeReview.getParticipants');
        }
      }),

    // Join a session (mark as joined)
    joinSession: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        try {
          const participants = await reviewService.getCollaborativeReviewParticipants(input.sessionId);
          const myParticipant = participants.find(p => p.userId === ctx.user.id);
          
          if (!myParticipant) {
            throw new Error('You are not invited to this session');
          }
          
          await reviewService.updateCollaborativeReviewParticipant(myParticipant.id, {
            joinedAt: new Date(),
            lastActiveAt: new Date(),
          });
          
          await reviewService.logCollaborativeReviewActivity({
            sessionId: input.sessionId,
            userId: ctx.user.id,
            action: 'joined',
          });
          
          return { success: true };
        } catch (error) {
          handleTRPCError(error, 'CollaborativeReview.joinSession');
        }
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
        try {
          const role = await reviewService.getParticipantRole(input.sessionId, ctx.user.id);
          if (!role) {
            throw new Error('Not authorized to comment');
          }
          
          const commentId = await reviewService.createCollaborativeReviewComment({
            sessionId: input.sessionId,
            userId: ctx.user.id,
            sectionId: input.sectionId,
            comment: input.comment,
            parentCommentId: input.parentCommentId,
          });
          
          await reviewService.logCollaborativeReviewActivity({
            sessionId: input.sessionId,
            userId: ctx.user.id,
            action: 'commented',
            sectionId: input.sectionId,
          });
          
          return { commentId };
        } catch (error) {
          handleTRPCError(error, 'CollaborativeReview.addComment');
        }
      }),

    // Get comments for a session
    getComments: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        sectionId: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        try {
          const isParticipant = await reviewService.isSessionParticipant(input.sessionId, ctx.user.id);
          if (!isParticipant) {
            throw new Error('Not authorized to view comments');
          }
          
          return await reviewService.getCollaborativeReviewComments(input.sessionId, input.sectionId);
        } catch (error) {
          handleTRPCError(error, 'CollaborativeReview.getComments');
        }
      }),

    // Resolve a comment
    resolveComment: protectedProcedure
      .input(z.object({
        commentId: z.number(),
        sessionId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const role = await reviewService.getParticipantRole(input.sessionId, ctx.user.id);
          if (role !== 'owner' && role !== 'reviewer') {
            throw new Error('Not authorized to resolve comments');
          }
          
          await reviewService.updateCollaborativeReviewComment(input.commentId, { status: 'resolved' });
          
          return { success: true };
        } catch (error) {
          handleTRPCError(error, 'CollaborativeReview.resolveComment');
        }
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
        try {
          await reviewService.logCollaborativeReviewActivity({
            sessionId: input.sessionId,
            userId: ctx.user.id,
            action: input.action,
            sectionId: input.sectionId,
            metadata: input.metadata,
          });
          
          // Update last active
          const participants = await reviewService.getCollaborativeReviewParticipants(input.sessionId);
          const myParticipant = participants.find(p => p.userId === ctx.user.id);
          
          if (myParticipant) {
            await reviewService.updateCollaborativeReviewParticipant(myParticipant.id, {
              lastActiveAt: new Date(),
            });
          }
          
          return { success: true };
        } catch (error) {
          handleTRPCError(error, 'CollaborativeReview.logActivity');
        }
      }),

    // Get activity for a session
    getActivity: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        limit: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        try {
          const isParticipant = await reviewService.isSessionParticipant(input.sessionId, ctx.user.id);
          if (!isParticipant) {
            throw new Error('Not authorized to view activity');
          }
          
          return await reviewService.getCollaborativeReviewActivity(input.sessionId, input.limit || 50);
        } catch (error) {
          handleTRPCError(error, 'CollaborativeReview.getActivity');
        }
      }),
});
