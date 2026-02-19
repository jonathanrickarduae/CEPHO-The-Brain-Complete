/**
 * Expertevolution Router
 * 
 * Auto-extracted from monolithic routers.ts
 * 
 * @module routers/domains/expert-evolution
 */

import { router, protectedProcedure } from "../../_core/trpc";
import { z } from "zod";
import { expertService } from "../../services/expert";
import { handleTRPCError } from "../../utils/error-handler";

export const expertEvolutionRouter = router({
    // Store a conversation with an expert
    storeConversation: protectedProcedure
      .input(z.object({
        expertId: z.string(),
        role: z.enum(['user', 'expert', 'system']),
        content: z.string(),
        projectId: z.number().optional(),
        taskId: z.string().optional(),
        sentiment: z.enum(['positive', 'neutral', 'negative']).optional(),
        qualityScore: z.number().min(1).max(10).optional(),
        metadata: z.any().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return createExpertConversation({
          userId: ctx.user.id,
          ...input,
        });
      }),

    // Get conversation history with an expert
    getConversations: protectedProcedure
      .input(z.object({
        expertId: z.string(),
        projectId: z.number().optional(),
        limit: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        return getExpertConversations(ctx.user.id, input.expertId, {
          projectId: input.projectId,
          limit: input.limit,
        });
      }),

    // Get formatted conversation context for prompt injection
    getConversationContext: protectedProcedure
      .input(z.object({
        expertId: z.string(),
        limit: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        return getExpertConversationContext(ctx.user.id, input.expertId, input.limit);
      }),

    // Store a memory/learning about the user
    storeMemory: protectedProcedure
      .input(z.object({
        expertId: z.string(),
        memoryType: z.enum(['preference', 'fact', 'style', 'context', 'correction']),
        key: z.string(),
        value: z.string(),
        confidence: z.number().min(0).max(1).optional(),
        source: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return createExpertMemory({
          userId: ctx.user.id,
          ...input,
        });
      }),

    // Get memories for an expert
    getMemories: protectedProcedure
      .input(z.object({
        expertId: z.string(),
        memoryType: z.string().optional(),
        limit: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        return getExpertMemories(ctx.user.id, input.expertId, {
          memoryType: input.memoryType,
          limit: input.limit,
        });
      }),

    // Get formatted memory context for prompt injection
    getMemoryContext: protectedProcedure
      .input(z.object({
        expertId: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        return getExpertMemoryContext(ctx.user.id, input.expertId);
      }),

    // Update a memory (e.g., increase confidence, mark as used)
    updateMemory: protectedProcedure
      .input(z.object({
        id: z.number(),
        value: z.string().optional(),
        confidence: z.number().min(0).max(1).optional(),
      }))
      .mutation(async ({ input }) => {
        await updateExpertMemory(input.id, input);
        return { success: true };
      }),

    // Record a prompt evolution (when expert improves)
    recordPromptEvolution: protectedProcedure
      .input(z.object({
        expertId: z.string(),
        version: z.number(),
        promptAdditions: z.string().optional(),
        communicationStyle: z.string().optional(),
        strengthAdjustments: z.any().optional(),
        weaknessAdjustments: z.any().optional(),
        reason: z.string().optional(),
        performanceBefore: z.number().optional(),
        performanceAfter: z.number().optional(),
        createdBy: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return createExpertPromptEvolution(input);
      }),

    // Get latest prompt evolution for an expert
    getLatestPromptEvolution: protectedProcedure
      .input(z.object({ expertId: z.string() }))
      .query(async ({ input }) => {
        return getLatestExpertPromptEvolution(input.expertId);
      }),

    // Get prompt evolution history
    getPromptHistory: protectedProcedure
      .input(z.object({
        expertId: z.string(),
        limit: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return getExpertPromptHistory(input.expertId, input.limit);
      }),

    // Create an insight from an expert
    createInsight: protectedProcedure
      .input(z.object({
        expertId: z.string(),
        category: z.string(),
        title: z.string(),
        insight: z.string(),
        evidence: z.string().optional(),
        confidence: z.number().min(0).max(1).optional(),
        tags: z.array(z.string()).optional(),
        projectId: z.number().optional(),
        relatedExpertIds: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return createExpertInsight({
          userId: ctx.user.id,
          ...input,
        });
      }),

    // Get insights (can filter by expert, category, project)
    getInsights: protectedProcedure
      .input(z.object({
        expertId: z.string().optional(),
        category: z.string().optional(),
        projectId: z.number().optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        return getExpertInsights(ctx.user.id, input);
      }),

    // Update an insight (validate, archive, etc.)
    updateInsight: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['draft', 'validated', 'outdated', 'archived']).optional(),
        validatedBy: z.array(z.string()).optional(),
      }))
      .mutation(async ({ input }) => {
        await updateExpertInsight(input.id, input);
        return { success: true };
      }),

    // Record insight usage (when another expert references it)
    recordInsightUsage: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await incrementInsightUsage(input.id);
        return { success: true };
      }),

    // Create a research task for an expert
    createResearchTask: protectedProcedure
      .input(z.object({
        expertId: z.string(),
        topic: z.string(),
        description: z.string().optional(),
        priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
        scheduledFor: z.date().optional(),
        assignedBy: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return createExpertResearchTask(input);
      }),

    // Get research tasks for an expert
    getResearchTasks: protectedProcedure
      .input(z.object({
        expertId: z.string(),
        status: z.string().optional(),
        limit: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return getExpertResearchTasks(input.expertId, input);
      }),

    // Update research task (complete, add findings, etc.)
    updateResearchTask: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['pending', 'in_progress', 'completed', 'failed']).optional(),
        findings: z.string().optional(),
        sourcesUsed: z.array(z.string()).optional(),
        insightsGenerated: z.array(z.number()).optional(),
        completedAt: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        await updateExpertResearchTask(input.id, input);
        return { success: true };
      }),

    // Get pending research tasks across all experts
    getPendingResearch: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return getPendingResearchTasks(input?.limit);
      }),

    // Record a collaboration between experts
    recordCollaboration: protectedProcedure
      .input(z.object({
        initiatorExpertId: z.string(),
        collaboratorExpertIds: z.array(z.string()),
        projectId: z.number().optional(),
        taskDescription: z.string(),
        outcome: z.string().optional(),
        qualityScore: z.number().min(1).max(10).optional(),
        lessonsLearned: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return createExpertCollaboration({
          userId: ctx.user.id,
          ...input,
        });
      }),

    // Get collaboration history
    getCollaborations: protectedProcedure
      .input(z.object({
        expertId: z.string().optional(),
        projectId: z.number().optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        return getExpertCollaborations(ctx.user.id, input);
      }),

    // Create a coaching session
    createCoachingSession: protectedProcedure
      .input(z.object({
        expertId: z.string(),
        coachType: z.enum(['chief_of_staff', 'peer_expert', 'user']),
        coachId: z.string().optional(),
        focusArea: z.string(),
        feedbackGiven: z.string(),
        improvementPlan: z.string().optional(),
        metricsBeforeCoaching: z.any().optional(),
        scheduledAt: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        return createExpertCoachingSession(input);
      }),

    // Get coaching sessions for an expert
    getCoachingSessions: protectedProcedure
      .input(z.object({
        expertId: z.string(),
        status: z.string().optional(),
        limit: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return getExpertCoachingSessions(input.expertId, input);
      }),

    // Update coaching session (complete, add metrics, etc.)
    updateCoachingSession: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['scheduled', 'in_progress', 'completed', 'follow_up_needed']).optional(),
        metricsAfterCoaching: z.any().optional(),
        completedAt: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        await updateExpertCoachingSession(input.id, input);
        return { success: true };
      }),

    // Add domain knowledge for an expert
    addDomainKnowledge: protectedProcedure
      .input(z.object({
        expertId: z.string(),
        domain: z.string(),
        subDomain: z.string().optional(),
        knowledgeLevel: z.enum(['basic', 'intermediate', 'advanced', 'expert']).optional(),
        updateFrequency: z.string().optional(),
        sources: z.array(z.string()).optional(),
        keyFrameworks: z.array(z.string()).optional(),
        recentDevelopments: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return createExpertDomainKnowledge(input);
      }),

    // Get domain knowledge for an expert
    getDomainKnowledge: protectedProcedure
      .input(z.object({ expertId: z.string() }))
      .query(async ({ input }) => {
        return getExpertDomainKnowledge(input.expertId);
      }),

    // Update domain knowledge
    updateDomainKnowledge: protectedProcedure
      .input(z.object({
        id: z.number(),
        knowledgeLevel: z.enum(['basic', 'intermediate', 'advanced', 'expert']).optional(),
        recentDevelopments: z.string().optional(),
        sources: z.array(z.string()).optional(),
      }))
      .mutation(async ({ input }) => {
        await updateExpertDomainKnowledge(input.id, input);
        return { success: true };
      }),

    // Get stale domains that need updating
    getStaleDomains: protectedProcedure
      .input(z.object({ daysOld: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return getStaleExpertDomains(input?.daysOld);
      }),

    // Get full expert context (conversations + memories) for enhanced prompts
    getFullExpertContext: protectedProcedure
      .input(z.object({
        expertId: z.string(),
        conversationLimit: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const [conversationContext, memoryContext, promptEvolution, domainKnowledge] = await Promise.all([
          getExpertConversationContext(ctx.user.id, input.expertId, input.conversationLimit || 10),
          getExpertMemoryContext(ctx.user.id, input.expertId),
          getLatestExpertPromptEvolution(input.expertId),
          getExpertDomainKnowledge(input.expertId),
        ]);

        return {
          conversationContext,
          memoryContext,
          promptEvolution,
          domainKnowledge,
        };
      }),

    // Chat with an expert - real AI backend
    chat: protectedProcedure
      .input(z.object({
        expertId: z.string(),
        message: z.string(),
        expertData: z.object({
          name: z.string(),
          specialty: z.string(),
          bio: z.string(),
          compositeOf: z.array(z.string()),
          strengths: z.array(z.string()),
          weaknesses: z.array(z.string()),
          thinkingStyle: z.string(),
        }).optional(),
        conversationHistory: z.array(z.object({
          role: z.enum(['user', 'assistant', 'system']),
          content: z.string(),
        })).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const response = await chatWithExpert({
          expertId: input.expertId,
          expertData: input.expertData,
          message: input.message,
          conversationHistory: input.conversationHistory,
        });

        // Store the conversation for learning
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

    // Generate voice audio for expert response
    generateVoice: protectedProcedure
      .input(z.object({
        text: z.string(),
        expertId: z.string(),
      }))
      .mutation(async ({ input }) => {
        try {
          const result = await text-to-speech({
            text: input.text,
            expertId: input.expertId,
          });
          
          // Return base64 encoded audio
          return {
            audio: result.audioBuffer.toString('base64'),
            contentType: result.contentType,
            voiceName: result.voiceName,
          };
        } catch (error) {
          console.error('Voice generation error:', error);
          throw new Error('Failed to generate voice audio');
        }
      }),

    // Check if expert has custom voice
    hasVoice: publicProcedure
      .input(z.object({ expertId: z.string() }))
      .query(({ input }) => {
        return {
          hasVoice: hasCustomVoice(input.expertId),
          voiceInfo: getExpertVoiceInfo(input.expertId),
        };
      }),
});
