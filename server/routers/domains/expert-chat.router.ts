/**
 * Expertchat Router
 * 
 * Auto-extracted from monolithic routers.ts
 * 
 * @module routers/domains/expert-chat
 */

import { router, protectedProcedure } from "../../_core/trpc";
import { z } from "zod";
import { expertService } from "../../services/expert";
import { 
  getActiveExpertChatSession,
  createExpertChatSession,
  getExpertChatSessions,
  getExpertChatMessages,
  createExpertChatMessage,
  updateExpertChatSession,
  getRecentExpertMessages,
  createExpertConversation
} from "../../db";
import { chatWithExpert } from "../../services/expert-chat.service";

export const expertChatRouter = router({
    // Start or get active chat session
    startSession: protectedProcedure
      .input(z.object({
        expertId: z.string(),
        expertName: z.string(),
        systemPrompt: z.string(),
        projectId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check for existing active session
        const existing = await getActiveExpertChatSession(ctx.user.id, input.expertId);
        if (existing) {
          return existing;
        }
        
        // Create new session
        return createExpertChatSession({
          userId: ctx.user.id,
          expertId: input.expertId,
          expertName: input.expertName,
          systemPrompt: input.systemPrompt,
          projectId: input.projectId,
          status: 'active',
        });
      }),

    // Get all sessions for user
    listSessions: protectedProcedure
      .input(z.object({
        expertId: z.string().optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        return getExpertChatSessions(ctx.user.id, input);
      }),

    // Get messages for a session
    getMessages: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        limit: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return getExpertChatMessages(input.sessionId, { limit: input.limit });
      }),

    // Send a message and get AI response
    sendMessage: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        expertId: z.string(),
        expertData: z.any(),
        message: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Store user message
        await createExpertChatMessage({
          sessionId: input.sessionId,
          role: 'user',
          content: input.message,
        });

        // Get recent messages for context
        const recentMessages = await getExpertChatMessages(input.sessionId, { limit: 20 });
        const conversationHistory = recentMessages.map(m => ({
          role: m.role as 'user' | 'assistant' | 'system',
          content: m.content,
        }));

        // Get AI response
        const response = await chatWithExpert({
          expertId: input.expertId,
          expertData: input.expertData,
          message: input.message,
          conversationHistory,
        });

        // Store expert message
        await createExpertChatMessage({
          sessionId: input.sessionId,
          role: 'expert',
          content: response.response,
        });

        // Also store in expert evolution system for learning
        await createExpertConversation({
          userId: ctx.user.id,
          expertId: input.expertId,
          role: 'user',
          content: input.message,
        });
        await createExpertConversation({
          userId: ctx.user.id,
          expertId: input.expertId,
          role: 'expert',
          content: response.response,
        });

        return response;
      }),

    // End a chat session
    endSession: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        summary: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await updateExpertChatSession(input.sessionId, {
          status: 'completed',
          summary: input.summary,
        });
        return { success: true };
      }),

    // Get recent messages across all sessions for an expert (for context)
    getRecentContext: protectedProcedure
      .input(z.object({
        expertId: z.string(),
        limit: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        return getRecentExpertMessages(ctx.user.id, input.expertId, input.limit || 20);
      }),
});
