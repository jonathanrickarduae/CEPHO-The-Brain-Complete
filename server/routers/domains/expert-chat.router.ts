/**
 * Expert Chat Router
 * 
 * Handles expert chat sessions and messages using service layer
 * 
 * @module routers/domains/expert-chat
 */

import { router, protectedProcedure } from "../../_core/trpc";
import { z } from "zod";
import { expertService } from "../../services/expert";
import { handleTRPCError, assertExists } from "../../utils/error-handler";
import { chatWithExpert } from "../../services/expert-chat.service";
import { createExpertConversation } from "../../db";

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
        try {
          // Check for existing active session
          const existingSessions = await expertService.getExpertChatSessions(
            ctx.user.id,
            input.expertId
          );
          
          const activeSession = existingSessions.find(s => s.status === 'active');
          if (activeSession) {
            return activeSession;
          }
          
          // Create new session
          return await expertService.createChatSession(ctx.user.id, {
            expertId: input.expertId,
            topic: input.expertName,
          });
        } catch (error) {
          handleTRPCError(error, 'ExpertChat.startSession');
        }
      }),

    // Get all sessions for user
    listSessions: protectedProcedure
      .input(z.object({
        expertId: z.string().optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        try {
          if (input?.expertId) {
            return await expertService.getExpertChatSessions(ctx.user.id, input.expertId);
          }
          return await expertService.getUserChatSessions(ctx.user.id);
        } catch (error) {
          handleTRPCError(error, 'ExpertChat.listSessions');
        }
      }),

    // Get messages for a session
    getMessages: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        limit: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        try {
          const messages = await expertService.getChatMessages(ctx.user.id, input.sessionId);
          
          // Apply limit if specified
          if (input.limit) {
            return messages.slice(-input.limit);
          }
          
          return messages;
        } catch (error) {
          handleTRPCError(error, 'ExpertChat.getMessages');
        }
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
        try {
          // Verify session exists and belongs to user
          const session = await expertService.getChatSession(ctx.user.id, input.sessionId);
          assertExists(session, 'Chat session', input.sessionId);

          // Store user message
          await expertService.addChatMessage(ctx.user.id, {
            sessionId: input.sessionId,
            role: 'user',
            content: input.message,
          });

          // Get recent messages for context
          const recentMessages = await expertService.getChatMessages(ctx.user.id, input.sessionId);
          const conversationHistory = recentMessages.slice(-20).map(m => ({
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
          await expertService.addChatMessage(ctx.user.id, {
            sessionId: input.sessionId,
            role: 'assistant',
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
        } catch (error) {
          handleTRPCError(error, 'ExpertChat.sendMessage');
        }
      }),

    // End a chat session
    endSession: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        summary: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const session = await expertService.completeChatSession(ctx.user.id, input.sessionId);
          assertExists(session, 'Chat session', input.sessionId);
          
          return { success: true };
        } catch (error) {
          handleTRPCError(error, 'ExpertChat.endSession');
        }
      }),

    // Get recent messages across all sessions for an expert (for context)
    getRecentContext: protectedProcedure
      .input(z.object({
        expertId: z.string(),
        limit: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        try {
          const sessions = await expertService.getExpertChatSessions(ctx.user.id, input.expertId);
          const allMessages: any[] = [];
          
          // Get messages from all sessions
          for (const session of sessions) {
            const messages = await expertService.getChatMessages(ctx.user.id, session.id);
            allMessages.push(...messages);
          }
          
          // Sort by timestamp and limit
          const sorted = allMessages.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          
          return sorted.slice(0, input.limit || 20);
        } catch (error) {
          handleTRPCError(error, 'ExpertChat.getRecentContext');
        }
      }),
});
