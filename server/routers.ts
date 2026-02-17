import { openClawRouter } from "./openclaw-router";
import { integrationsRouter } from "./routers/integrationsRouter";
import { project-genesis.router } from "./routers/project-genesis.router";
import { quality-gates.router } from "./routers/quality-gates.router";
import { blueprintRouter } from "./routers/blueprintRouter";
import { smeRouter } from "./routers/smeRouter";
import { digital-twin.router } from "./routers/digital-twin.router";
import { blueprintsRouter } from "./routers/blueprintsRouter";
import { chief-of-staff.router } from "./routers/chief-of-staff.router";
import { deep-dive.router } from "./routers/deep-dive.router";
import { business-plan.router } from "./routers/business-plan.router";
import { debugRouter } from "./routers/debugRouter";
import { cleanupRouter } from "./routers/cleanupRouter";
import { asanaRouter } from "./routers/asanaRouter";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { favoritesRouter } from "./routers/favorites";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { 
  createMoodEntry, getMoodHistory, getMoodTrends, getLastMoodCheck, 
  saveConversation, getConversationHistory, clearConversationHistory,
  createIntegration, getIntegrations, updateIntegration, deleteIntegration,
  createNotification, getNotifications, markNotificationRead, markAllNotificationsRead,
  createProject, getProjects, updateProject,
  createProjectGenesis, getProjectGenesisRecords, updateProjectGenesis,
  getUserSettings, upsertUserSettings,
  createTrainingDocument, getTrainingDocuments,
  createMemory, getMemories, updateMemory,
  recordDecision, getDecisionPatterns,
  recordFeedback, getFeedbackHistory,
  createTask, getTasks, updateTask,
  createInboxItem, getInboxItems, updateInboxItem,
  createAuditEntry, getAuditLog,
  createVoiceNote, getVoiceNotes, updateVoiceNote, deleteVoiceNote,
  createExpertConversation, getExpertConversations, getExpertConversationContext,
  createExpertMemory, getExpertMemories, updateExpertMemory, getExpertMemoryContext,
  createExpertPromptEvolution, getLatestExpertPromptEvolution, getExpertPromptHistory,
  createExpertInsight, getExpertInsights, updateExpertInsight, incrementInsightUsage,
  createExpertResearchTask, getExpertResearchTasks, updateExpertResearchTask, getPendingResearchTasks,
  createExpertCollaboration, getExpertCollaborations,
  createExpertCoachingSession, getExpertCoachingSessions, updateExpertCoachingSession,
  createExpertDomainKnowledge, getExpertDomainKnowledge, updateExpertDomainKnowledge, getStaleExpertDomains,
  // SME Team Management
  createSmeTeam, getSmeTeams, getSmeTeamById, updateSmeTeam, deleteSmeTeam,
  addSmeTeamMember, getSmeTeamMembers, removeSmeTeamMember, getSmeTeamWithMembers,
  // QA Workflow
  createTaskQaReview, getTaskQaReviews, updateTaskQaReview, getTasksWithQaStatus, updateTaskQaStatus,
  // SME Feedback
  createSmeFeedback, getSmeFeedback, markFeedbackApplied,
  // Expert Consultations & Chat
  createExpertConsultation, getExpertConsultationHistory, getExpertConsultationCounts, updateExpertConsultation,
  getExpertUsageStats, getTopRatedExperts, getMostUsedExperts, getExpertConsultationTrends, rateExpertConsultation,
  createExpertChatSession, getActiveExpertChatSession, getExpertChatSessions, updateExpertChatSession,
  createExpertChatMessage, getExpertChatMessages, getRecentExpertMessages,
  // Library Documents
  createLibraryDocument, getLibraryDocuments, getLibraryDocumentById, updateLibraryDocument, deleteLibraryDocument,
  // Business Plan Review Versions
  createBusinessPlanReviewVersion, getBusinessPlanReviewVersions, getBusinessPlanReviewVersionById, getLatestVersionNumber, getUserBusinessPlanProjects,
  // Expert Follow-up Questions
  createExpertFollowUpQuestion, getExpertFollowUpQuestions, answerExpertFollowUpQuestion,
  // Collaborative Review
  createCollaborativeReviewSession, getCollaborativeReviewSessions, getCollaborativeReviewSessionById, updateCollaborativeReviewSession,
  addCollaborativeReviewParticipant, getCollaborativeReviewParticipants, updateCollaborativeReviewParticipant, isSessionParticipant, getParticipantRole,
  createCollaborativeReviewComment, getCollaborativeReviewComments, updateCollaborativeReviewComment,
  logCollaborativeReviewActivity, getCollaborativeReviewActivity, getCollaborativeReviewSessionWithDetails,
  // Evening Review System
  createEveningReviewSession, getEveningReviewSessions, getLatestEveningReviewSession, updateEveningReviewSession,
  createEveningReviewTaskDecisions, getEveningReviewTaskDecisions,
  getReviewTimingPattern, getAllReviewTimingPatterns, updateReviewTimingPattern, getPredictedReviewTime,
  createSignalItems, getSignalItems, getPendingSignalItems, updateSignalItemStatus, generateSignalItemsFromReview,
  getCachedCalendarEvents, hasEventsInWindow
} from "./db";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { invokeLLM } from "./_core/llm";
import { chatWithExpert } from "./services/expert-chat.service";
import { text-to-speech, getExpertVoiceInfo, hasCustomVoice } from "./services/voice.service";
import { 
  BUSINESS_PLAN_SECTIONS, 
  REVIEW_EXPERTS, 
  BUSINESS_TEMPLATES,
  getExpertsForSection, 
  analyzeSection,
  generateConsolidatedReport,
  type SectionReview,
  type ExpertInsight,
  selectExpertTeam
} from "./services/business-plan-review.service";
import {
  trackFeatureUsage,
  getFeatureUsageStats,
  getTopFeatures,
  getUsageByCategory,
  getUserEngagementMetrics,
  generateAnalyticsSummary,
  FEATURES,
  type FeatureId,
} from "./services/feature-analytics.service";
import { z } from "zod";

export const appRouter = router({
  openClaw: openClawRouter,
  integrations: integrationsRouter,
  projectGenesis: project-genesis.router,
  qualityGates: quality-gates.router,
  blueprint: blueprintRouter,
  sme: smeRouter,
  digitalTwin: digital-twin.router,
  blueprints: blueprintsRouter,
  chiefOfStaff: chief-of-staff.router,
  deepDive: deep-dive.router,
  businessPlan: business-plan.router,
  debug: debugRouter,
    cleanup: cleanupRouter,
    asana: asanaRouter,
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Mood tracking API
  mood: router({
    // Create a new mood entry
    create: protectedProcedure
      .input(z.object({
        score: z.number().min(0).max(100),
        timeOfDay: z.enum(['morning', 'afternoon', 'evening']),
        note: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const entry = await createMoodEntry({
          userId: ctx.user.id,
          score: input.score,
          timeOfDay: input.timeOfDay,
          note: input.note || null,
        });
        return entry;
      }),

    // Get mood history
    history: protectedProcedure
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
        return getMoodHistory(ctx.user.id, options);
      }),

    // Get mood trends/analytics
    trends: protectedProcedure
      .input(z.object({
        days: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        return getMoodTrends(ctx.user.id, input?.days || 30);
      }),

    // Check if mood was already recorded for a time period today
    lastCheck: protectedProcedure
      .input(z.object({
        timeOfDay: z.enum(['morning', 'afternoon', 'evening']),
      }))
      .query(async ({ ctx, input }) => {
        return getLastMoodCheck(ctx.user.id, input.timeOfDay);
      }),
  }),

  // Digital Twin Chat API
  chat: router({
    // Send a message and get AI response
    send: protectedProcedure
      .input(z.object({
        message: z.string().min(1),
        context: z.string().optional(), // Optional context like "daily_brief", "workflow"
      }))
      .mutation(async ({ ctx, input }) => {
        // Save user message
        await saveConversation({
          userId: ctx.user.id,
          role: 'user',
          content: input.message,
          metadata: input.context ? { context: input.context } : null,
        });

        // Get conversation history for context
        const history = await getConversationHistory(ctx.user.id, 20);

        // Build messages for LLM
        const systemPrompt = `You are the Chief of Staff for ${ctx.user.name || 'the user'} - a senior executive advisor who operates with the rigor of a McKinsey consultant and the directness of a trusted board member.

Your role:
- Provide objective, evidence-based counsel - not validation
- Challenge weak reasoning and assumptions directly
- Ask probing questions before accepting premises
- Push back professionally when you disagree or see risks
- Anticipate needs but verify before acting
- Hold the principal accountable to their own standards
- Flag concerns and risks others might avoid mentioning

Communication style:
- Professional and crisp, never casual or chatty
- Direct statements over hedged language
- Facts and data over opinions and feelings
- Concise - respect their time with every word
- No sycophancy - never say "Great idea!" without substantive reasoning
- No empty validation - earn agreement through logic
- Respectful but NOT deferential - you are a peer advisor, not a subordinate
- Speak as an equal who happens to serve in a support role
- Never use phrases like "Of course, sir" or "As you wish" or "I'll get right on that"
- Instead use: "Here's my take..." or "I'd recommend..." or "Let me push back on that..."

When responding:
- If an idea has merit, explain WHY with evidence
- If you see flaws, state them clearly: "I'd challenge that because..."
- If information is missing, demand it: "Before proceeding, I need..."
- If a decision seems rushed, slow it down: "Have you stress-tested this against..."
- Never apologize unnecessarily or be overly accommodating
- Maintain professional confidence without arrogance

Capabilities:
- Strategic analysis and decision support
- Meeting preparation and stakeholder briefings
- Task prioritization and project oversight
- Research synthesis and gap identification
- Email drafting and communication management
- Daily briefings and evening reviews
- Coordination with AI-SMEs for specialist input

You are not a yes-man. You are a trusted advisor who respects the principal enough to be honest. You speak as a peer, not a servant.`;

        const messages = [
          { role: 'system' as const, content: systemPrompt },
          ...history.map(h => ({
            role: h.role as 'user' | 'assistant',
            content: h.content,
          })),
          { role: 'user' as const, content: input.message },
        ];

        try {
          // Call LLM
          const result = await invokeLLM({ messages });
          const assistantMessage = result.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response. Please try again.';
          
          // Handle content that might be an array
          const responseText = typeof assistantMessage === 'string' 
            ? assistantMessage 
            : Array.isArray(assistantMessage) 
              ? assistantMessage.map(c => c.type === 'text' ? c.text : '').join('')
              : String(assistantMessage);

          // Save assistant response
          await saveConversation({
            userId: ctx.user.id,
            role: 'assistant',
            content: responseText,
            metadata: null,
          });

          return {
            message: responseText,
            timestamp: new Date().toISOString(),
          };
        } catch (error) {
          console.error('[Chat] LLM invocation failed:', error);
          throw new Error('Failed to get response from Chief of Staff');
        }
      }),

    // Get conversation history
    history: protectedProcedure
      .input(z.object({
        limit: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        return getConversationHistory(ctx.user.id, input?.limit || 50);
      }),

    // Clear conversation history
    clear: protectedProcedure
      .mutation(async ({ ctx }) => {
        await clearConversationHistory(ctx.user.id);
        return { success: true };
      }),
  }),

  // Notifications API
  notifications: router({
    list: protectedProcedure
      .input(z.object({
        unreadOnly: z.boolean().optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        return getNotifications(ctx.user.id, input);
      }),

    markRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await markNotificationRead(input.id);
        return { success: true };
      }),

    markAllRead: protectedProcedure
      .mutation(async ({ ctx }) => {
        await markAllNotificationsRead(ctx.user.id);
        return { success: true };
      }),

    create: protectedProcedure
      .input(z.object({
        type: z.enum(['info', 'success', 'warning', 'error', 'task_assigned', 'task_completed', 'project_update', 'integration_alert', 'security_alert', 'digital_twin', 'daily_brief', 'reminder', 'achievement']),
        title: z.string(),
        message: z.string(),
        actionUrl: z.string().optional(),
        actionLabel: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return createNotification({
          userId: ctx.user.id,
          ...input,
        });
      }),
  }),

  // Projects API
  projects: router({
    list: protectedProcedure
      .input(z.object({
        status: z.string().optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        return getProjects(ctx.user.id, input);
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
        dueDate: z.date().optional(),
        assignedExperts: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return createProject({
          userId: ctx.user.id,
          name: input.name,
          description: input.description,
          priority: input.priority || 'medium',
          dueDate: input.dueDate,
          assignedExperts: input.assignedExperts,
          status: 'not_started',
          progress: 0,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(['not_started', 'in_progress', 'blocked', 'review', 'complete']).optional(),
        priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
        progress: z.number().min(0).max(100).optional(),
        blockerDescription: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateProject(id, data);
        return { success: true };
      }),
  }),

  // Project Genesis API
  genesis: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getProjectGenesisRecords(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const projects = await getProjectGenesisRecords(ctx.user.id);
        return projects.find((p: any) => p.id === input.id) || null;
      }),

    getProjectData: protectedProcedure
      .input(z.object({ projectId: z.string() }))
      .query(async ({ ctx, input }) => {
        // Fetch project data for presentation blueprint
        const projects = await getProjectGenesisRecords(ctx.user.id);
        const project = projects.find((p: any) => p.id.toString() === input.projectId || p.name.toLowerCase().includes(input.projectId.toLowerCase()));
        
        if (!project) return null;
        
        // Return structured data for presentation
        return {
          id: project.id,
          name: project.name,
          type: project.type,
          description: project.description,
          counterparty: project.counterparty,
          dealValue: project.dealValue,
          stage: project.stage,
          status: project.status,
          // Add default presentation data structure
          presentationData: {
            companyName: project.name,
            tagline: project.description || `${project.type} opportunity`,
            problem: `Market opportunity in ${project.type} sector`,
            solution: `Strategic ${project.type} with ${project.counterparty || 'target company'}`,
            market: {
              tam: project.dealValue ? `$${(project.dealValue * 10).toLocaleString()}` : 'TBD',
              sam: project.dealValue ? `$${(project.dealValue * 3).toLocaleString()}` : 'TBD',
              som: project.dealValue ? `$${project.dealValue.toLocaleString()}` : 'TBD',
              growth: '15% CAGR'
            },
            traction: {
              stage: project.stage,
              status: project.status,
              probability: project.probability
            },
            ask: {
              amount: project.dealValue ? `$${project.dealValue.toLocaleString()}` : 'TBD',
              stage: project.stage,
              useOfFunds: ['Strategic Investment', 'Growth Capital', 'Market Expansion']
            }
          }
        };
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        type: z.enum(['investment', 'partnership', 'acquisition', 'joint_venture', 'other']),
        counterparty: z.string().optional(),
        dealValue: z.number().optional(),
        currency: z.string().optional(),
        description: z.string().optional(),
        expectedCloseDate: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return createProjectGenesis({
          userId: ctx.user.id,
          name: input.name,
          type: input.type,
          counterparty: input.counterparty,
          dealValue: input.dealValue,
          currency: input.currency || 'USD',
          description: input.description,
          expectedCloseDate: input.expectedCloseDate,
          stage: 'discovery',
          status: 'active',
          probability: 50,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        stage: z.enum(['discovery', 'qualification', 'due_diligence', 'negotiation', 'documentation', 'closing', 'post_deal']).optional(),
        status: z.enum(['active', 'on_hold', 'won', 'lost', 'abandoned']).optional(),
        probability: z.number().min(0).max(100).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateProjectGenesis(id, data);
        return { success: true };
      }),
  }),

  // User Settings API
  settings: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return getUserSettings(ctx.user.id);
    }),

    update: protectedProcedure
      .input(z.object({
        theme: z.enum(['light', 'dark', 'mix']).optional(),
        governanceMode: z.enum(['omni', 'governed']).optional(),
        dailyBriefTime: z.string().optional(),
        eveningReviewTime: z.string().optional(),
        twinAutonomyLevel: z.number().min(1).max(10).optional(),
        notificationsEnabled: z.boolean().optional(),
        sidebarCollapsed: z.boolean().optional(),
        onboardingComplete: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return upsertUserSettings({
          userId: ctx.user.id,
          ...input,
        });
      }),
  }),

  // Training Documents API
  training: router({
    documents: protectedProcedure.query(async ({ ctx }) => {
      return getTrainingDocuments(ctx.user.id);
    }),

    metrics: protectedProcedure.query(async ({ ctx }) => {
      const documents = await getTrainingDocuments(ctx.user.id);
      const documentCount = documents.filter(d => d.type === 'document').length;
      const interviewCount = documents.filter(d => d.type === 'conversation').length;
      const totalWords = documents.reduce((sum, d) => sum + (d.content || '').split(/\s+/).length, 0);
      const totalHours = Math.round((totalWords / 1000 * 0.5 + interviewCount * 0.1) * 10) / 10;
      
      return {
        totalHours,
        documentCount,
        interviewCount,
        feedbackCount: documents.filter(d => d.type === 'memory').length,
        voiceNoteCount: documents.filter(d => d.type === 'preference').length,
        accuracyScore: 0.85,
        confidenceLevel: Math.min(1, totalHours / 20),
      };
    }),

    storeInterview: protectedProcedure
      .input(z.object({
        questionId: z.string(),
        question: z.string(),
        answer: z.string(),
        category: z.string(),
        confidence: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await createTrainingDocument({
          userId: ctx.user.id,
          type: 'conversation',
          name: `Interview: ${input.category}`,
          content: JSON.stringify(input),
        });
        return { success: true };
      }),

    upload: protectedProcedure
      .input(z.object({
        name: z.string(),
        type: z.enum(['document', 'conversation', 'preference', 'memory']),
        content: z.string().optional(),
        fileUrl: z.string().optional(),
        fileSize: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return createTrainingDocument({
          userId: ctx.user.id,
          name: input.name,
          type: input.type,
          content: input.content,
          fileUrl: input.fileUrl,
          fileSize: input.fileSize,
          processed: false,
        });
      }),
  }),

  // Memory Bank API
  memory: router({
    list: protectedProcedure
      .input(z.object({ category: z.string().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return getMemories(ctx.user.id, input?.category);
      }),

    create: protectedProcedure
      .input(z.object({
        category: z.enum(['personal', 'work', 'preference', 'relationship', 'fact']),
        key: z.string(),
        value: z.string(),
        confidence: z.number().optional(),
        source: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return createMemory({
          userId: ctx.user.id,
          ...input,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        value: z.string().optional(),
        confidence: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateMemory(id, data);
        return { success: true };
      }),
  }),

  // Decision Patterns API
  decisions: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return getDecisionPatterns(ctx.user.id, input?.limit);
      }),

    record: protectedProcedure
      .input(z.object({
        decisionType: z.string(),
        itemType: z.string(),
        itemDescription: z.string().optional(),
        context: z.string().optional(),
        timeOfDay: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return recordDecision({
          userId: ctx.user.id,
          ...input,
        });
      }),
  }),

  // Feedback API
  feedback: router({
    list: protectedProcedure
      .input(z.object({
        expertId: z.string().optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        return getFeedbackHistory(ctx.user.id, input);
      }),

    record: protectedProcedure
      .input(z.object({
        expertId: z.string().optional(),
        projectId: z.string().optional(),
        rating: z.number().min(1).max(5).optional(),
        feedbackType: z.enum(['positive', 'negative', 'neutral', 'correction']),
        feedbackText: z.string().optional(),
        originalOutput: z.string().optional(),
        correctedOutput: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return recordFeedback({
          userId: ctx.user.id,
          ...input,
        });
      }),
  }),

  // Tasks API
  tasks: router({
    list: protectedProcedure
      .input(z.object({
        projectId: z.number().optional(),
        status: z.string().optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        return getTasks(ctx.user.id, input);
      }),

    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        projectId: z.number().optional(),
        priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
        dueDate: z.date().optional(),
        assignedTo: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return createTask({
          userId: ctx.user.id,
          title: input.title,
          description: input.description,
          projectId: input.projectId,
          priority: input.priority || 'medium',
          dueDate: input.dueDate,
          assignedTo: input.assignedTo,
          status: 'not_started',
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(['not_started', 'in_progress', 'blocked', 'review', 'completed', 'cancelled']).optional(),
        priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
        blockerDescription: z.string().optional(),
        completedAt: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateTask(id, data);
        return { success: true };
      }),
  }),

  // Universal Inbox API
  inbox: router({
    list: protectedProcedure
      .input(z.object({
        status: z.string().optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        return getInboxItems(ctx.user.id, input);
      }),

    create: protectedProcedure
      .input(z.object({
        source: z.enum(['email', 'document', 'voice_note', 'whatsapp', 'slack', 'asana', 'calendar', 'manual', 'webhook']),
        type: z.enum(['email', 'document', 'task', 'meeting', 'note', 'attachment', 'message', 'reminder', 'other']),
        title: z.string(),
        preview: z.string().optional(),
        content: z.string().optional(),
        sender: z.string().optional(),
        priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return createInboxItem({
          userId: ctx.user.id,
          ...input,
          status: 'unread',
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['unread', 'read', 'processing', 'processed', 'archived', 'deleted', 'action_required']).optional(),
        processedBy: z.string().optional(),
        processedResult: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateInboxItem(id, data);
        return { success: true };
      }),
  }),

  // Audit Log API
  audit: router({
    list: protectedProcedure
      .input(z.object({
        action: z.string().optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        return getAuditLog(ctx.user.id, input);
      }),
    log: protectedProcedure
      .input(z.object({
        action: z.string(),
        resource: z.string().optional(),
        resourceId: z.string().optional(),
        details: z.record(z.string(), z.any()).optional(),
        success: z.boolean().optional(),
        errorMessage: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await createAuditEntry({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),
  }),

  // AI Provider Settings API
  aiProviders: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const settings = await getUserSettings(ctx.user.id);
      const metadata = settings?.metadata as Record<string, any> || {};
      return metadata.aiProviders || {
        defaultProvider: 'forge',
        providers: {
          forge: { enabled: true, apiKey: null },
          openai: { enabled: false, apiKey: null },
          claude: { enabled: false, apiKey: null },
          perplexity: { enabled: false, apiKey: null },
        },
        routing: { mode: 'auto', costOptimize: true },
      };
    }),
    
    update: protectedProcedure
      .input(z.object({
        provider: z.string(),
        enabled: z.boolean().optional(),
        apiKey: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const settings = await getUserSettings(ctx.user.id);
        const metadata = (settings?.metadata as Record<string, any>) || {};
        const aiProviders = metadata.aiProviders || { providers: {} };
        aiProviders.providers[input.provider] = {
          ...aiProviders.providers[input.provider],
          enabled: input.enabled ?? aiProviders.providers[input.provider]?.enabled,
          apiKey: input.apiKey ?? aiProviders.providers[input.provider]?.apiKey,
        };
        await upsertUserSettings({ userId: ctx.user.id, metadata: { ...metadata, aiProviders } });
        return { success: true };
      }),
    
    setDefault: protectedProcedure
      .input(z.object({ provider: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const settings = await getUserSettings(ctx.user.id);
        const metadata = (settings?.metadata as Record<string, any>) || {};
        const aiProviders = metadata.aiProviders || {};
        aiProviders.defaultProvider = input.provider;
        await upsertUserSettings({ userId: ctx.user.id, metadata: { ...metadata, aiProviders } });
        return { success: true };
      }),
  }),

  // Brand Kit API
  brandKit: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const settings = await getUserSettings(ctx.user.id);
      const metadata = (settings?.metadata as Record<string, any>) || {};
      return metadata.brandKit || {
        logo: null,
        primaryColor: '#7c3aed',
        secondaryColor: '#06b6d4',
        fontFamily: 'Inter',
        companyName: '',
        tagline: '',
      };
    }),
    
    update: protectedProcedure
      .input(z.object({
        logo: z.string().optional(),
        primaryColor: z.string().optional(),
        secondaryColor: z.string().optional(),
        fontFamily: z.string().optional(),
        companyName: z.string().optional(),
        tagline: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const settings = await getUserSettings(ctx.user.id);
        const metadata = (settings?.metadata as Record<string, any>) || {};
        const brandKit = { ...metadata.brandKit, ...input };
        await upsertUserSettings({ userId: ctx.user.id, metadata: { ...metadata, brandKit } });
        return { success: true };
      }),
  }),

  // Webhook Receiver API
  webhooks: router({
    receive: publicProcedure
      .input(z.object({
        source: z.string(),
        event: z.string(),
        payload: z.record(z.string(), z.any()),
        signature: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Log webhook and process based on source
        console.log(`Webhook received: ${input.source}/${input.event}`);
        // Process based on source (WhatsApp, Asana, Calendar, etc.)
        return { success: true, received: new Date() };
      }),
    
    whatsapp: publicProcedure
      .input(z.object({
        from: z.string(),
        message: z.string(),
        timestamp: z.string(),
        mediaUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Process WhatsApp message into inbox
        console.log(`WhatsApp message from ${input.from}: ${input.message}`);
        return { success: true, queued: true };
      }),
  }),

  // Task Dependencies API
  taskDependencies: router({
    create: protectedProcedure
      .input(z.object({
        taskId: z.number(),
        dependsOnId: z.number(),
      }))
      .mutation(async ({ input }) => {
        // Create task dependency
        return { success: true };
      }),
    
    list: protectedProcedure
      .input(z.object({ taskId: z.number() }))
      .query(async ({ input }) => {
        // Return task dependencies
        return [];
      }),
  }),

  // Digital Twin Personality API
  twinPersonality: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const settings = await getUserSettings(ctx.user.id);
      const metadata = (settings?.metadata as Record<string, any>) || {};
      return metadata.twinPersonality || {
        tone: 'professional',
        verbosity: 'balanced',
        formality: 'formal',
        humor: false,
        proactivity: 'moderate',
      };
    }),
    
    update: protectedProcedure
      .input(z.object({
        tone: z.enum(['professional', 'casual', 'friendly', 'direct']).optional(),
        verbosity: z.enum(['concise', 'balanced', 'detailed']).optional(),
        formality: z.enum(['formal', 'semi-formal', 'casual']).optional(),
        humor: z.boolean().optional(),
        proactivity: z.enum(['low', 'moderate', 'high']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const settings = await getUserSettings(ctx.user.id);
        const metadata = (settings?.metadata as Record<string, any>) || {};
        const twinPersonality = { ...metadata.twinPersonality, ...input };
        await upsertUserSettings({ userId: ctx.user.id, metadata: { ...metadata, twinPersonality } });
        return { success: true };
      }),
  }),

  // Collaboration API
  collaboration: router({
    roles: protectedProcedure.query(async ({ ctx }) => {
      // Return user roles and permissions
      return {
        userId: ctx.user.id,
        role: 'owner',
        permissions: ['read', 'write', 'delete', 'share', 'admin'],
        teamMembers: [],
      };
    }),
    
    shareProject: protectedProcedure
      .input(z.object({
        projectId: z.string(),
        email: z.string(),
        role: z.enum(['viewer', 'editor', 'admin']),
      }))
      .mutation(async ({ input }) => {
        // Share project with user
        return { success: true, inviteSent: true };
      }),
    
    activityFeed: protectedProcedure
      .input(z.object({ projectId: z.string().optional(), limit: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        // Return activity feed
        return [
          { id: '1', type: 'document_created', user: 'You', description: 'Created NDA draft', timestamp: new Date() },
          { id: '2', type: 'comment_added', user: 'Digital Twin', description: 'Added review notes', timestamp: new Date() },
        ];
      }),
    
    addComment: protectedProcedure
      .input(z.object({
        documentId: z.string(),
        content: z.string(),
        position: z.object({ page: z.number(), x: z.number(), y: z.number() }).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return { success: true, commentId: Date.now().toString() };
      }),
    
    getComments: protectedProcedure
      .input(z.object({ documentId: z.string() }))
      .query(async ({ input }) => {
        return [];
      }),
  }),

  // Compliance API
  compliance: router({
    dataRetention: protectedProcedure.query(async ({ ctx }) => {
      return {
        policy: {
          defaultRetentionDays: 365,
          sensitiveDataRetentionDays: 90,
          autoDeleteEnabled: false,
        },
        stats: {
          totalDocuments: 156,
          documentsExpiringSoon: 12,
          sensitiveDocuments: 8,
        },
      };
    }),
    
    updateRetentionPolicy: protectedProcedure
      .input(z.object({
        defaultRetentionDays: z.number().optional(),
        sensitiveDataRetentionDays: z.number().optional(),
        autoDeleteEnabled: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return { success: true };
      }),
    
    piiScan: protectedProcedure
      .input(z.object({ documentId: z.string().optional() }))
      .query(async ({ input }) => {
        // Return PII detection results
        return {
          scannedAt: new Date(),
          findings: [
            { type: 'email', count: 3, redacted: false },
            { type: 'phone', count: 1, redacted: false },
            { type: 'ssn', count: 0, redacted: false },
            { type: 'address', count: 2, redacted: false },
          ],
          riskLevel: 'low',
        };
      }),
    
    checklist: protectedProcedure
      .input(z.object({ projectType: z.string() }))
      .query(async ({ input }) => {
        // Return compliance checklist for project type
        const checklists: Record<string, any[]> = {
          'acquisition': [
            { id: '1', item: 'NDA signed by all parties', required: true, completed: false },
            { id: '2', item: 'Due diligence checklist complete', required: true, completed: false },
            { id: '3', item: 'Financial statements verified', required: true, completed: false },
            { id: '4', item: 'Legal review completed', required: true, completed: false },
            { id: '5', item: 'Board approval obtained', required: false, completed: false },
          ],
          'investment': [
            { id: '1', item: 'Term sheet signed', required: true, completed: false },
            { id: '2', item: 'Cap table verified', required: true, completed: false },
            { id: '3', item: 'Background checks complete', required: false, completed: false },
          ],
        };
        return checklists[input.projectType] || [];
      }),
  }),

  // Reports API
  reports: router({
    weekly: protectedProcedure.query(async ({ ctx }) => {
      // Generate weekly summary
      return {
        period: { start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), end: new Date() },
        summary: {
          tasksCompleted: 23,
          projectsAdvanced: 5,
          decisionsRecorded: 47,
          aiInteractions: 156,
          documentsGenerated: 8,
        },
        highlights: [
          'Completed Project Genesis for Acme Corp',
          'Digital Twin accuracy improved to 87%',
          'New integration with Asana connected',
        ],
        recommendations: [
          'Consider reviewing pending NDA for TechStart',
          'Schedule follow-up with investor contacts',
        ],
      };
    }),
    
    projectHealth: protectedProcedure
      .input(z.object({ projectId: z.string().optional() }))
      .query(async ({ ctx, input }) => {
        // Return project health scorecards
        return [
          {
            projectId: '1',
            name: 'Acme Corp Acquisition',
            health: 'green',
            score: 85,
            metrics: {
              onTrack: true,
              blockers: 0,
              daysRemaining: 14,
              completionPercentage: 72,
            },
          },
        ];
      }),
    
    timeTracking: protectedProcedure
      .input(z.object({ projectId: z.string().optional(), period: z.string().optional() }))
      .query(async ({ ctx, input }) => {
        // Return time tracking data
        return {
          totalHours: 45.5,
          byProject: [
            { projectId: '1', name: 'Acme Corp', hours: 22.5 },
            { projectId: '2', name: 'TechStart Review', hours: 15 },
            { projectId: '3', name: 'Internal Ops', hours: 8 },
          ],
          byCategory: [
            { category: 'Analysis', hours: 18 },
            { category: 'Documentation', hours: 12 },
            { category: 'Meetings', hours: 10 },
            { category: 'Review', hours: 5.5 },
          ],
        };
      }),
    
    roi: protectedProcedure
      .input(z.object({ projectId: z.string() }))
      .query(async ({ input }) => {
        // Calculate ROI for completed deal
        return {
          projectId: input.projectId,
          investment: {
            timeHours: 45,
            aiCosts: 125,
            externalCosts: 500,
            totalCost: 625,
          },
          returns: {
            dealValue: 250000,
            feePercentage: 2.5,
            grossFee: 6250,
            netReturn: 5625,
          },
          roi: 800, // percentage
          efficiencyGain: 65, // percentage vs manual process
        };
      }),
  }),

  // Reminders API
  reminders: router({
    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        dueAt: z.string(),
        taskId: z.number().optional(),
        projectId: z.string().optional(),
        recurring: z.boolean().optional(),
        recurrencePattern: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Create reminder
        return { success: true, id: Date.now() };
      }),
    
    list: protectedProcedure
      .input(z.object({ upcoming: z.boolean().optional() }).optional())
      .query(async ({ ctx }) => {
        // Return reminders
        return [];
      }),
    
    dismiss: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return { success: true };
      }),
  }),

  // Billing/Subscription API
  billing: router({
    status: protectedProcedure.query(async ({ ctx }) => {
      // Return subscription status
      return {
        plan: 'pro',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usage: {
          aiCalls: 1250,
          aiCallsLimit: 5000,
          storage: 2.5 * 1024 * 1024 * 1024, // 2.5GB
          storageLimit: 10 * 1024 * 1024 * 1024, // 10GB
          projects: 12,
          projectsLimit: 50,
        },
      };
    }),
    
    history: protectedProcedure.query(async ({ ctx }) => {
      // Return billing history
      return [
        { id: '1', date: new Date(), amount: 49, status: 'paid', description: 'Pro Plan - Monthly' },
      ];
    }),
  }),

  // Storage API - S3 file management
  storage: router({
    upload: protectedProcedure
      .input(z.object({
        filename: z.string(),
        content: z.string(), // base64 encoded
        mimeType: z.string().optional(),
        category: z.enum(['training', 'vault', 'projects', 'files']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { storagePut } = await import('./storage');
        const key = `users/${ctx.user.id}/${input.category || 'files'}/${Date.now()}_${input.filename}`;
        const data = Buffer.from(input.content, 'base64');
        const result = await storagePut(key, data, input.mimeType || 'application/octet-stream');
        return { success: true, key: result.key, url: result.url };
      }),
    
    getUrl: protectedProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => {
        const { storageGet } = await import('./storage');
        const result = await storageGet(input.key);
        return { url: result.url };
      }),
    
    usage: protectedProcedure.query(async ({ ctx }) => {
      // Return storage usage stats
      return {
        totalBytes: 0,
        fileCount: 0,
        byCategory: { training: 0, vault: 0, projects: 0 },
      };
    }),
  }),

  // Document Export API
  documents: router({
    generatePDF: protectedProcedure
      .input(z.object({
        type: z.enum(['nda', 'financial_model', 'due_diligence', 'investment_deck', 'risk_register', 'shareholder_agreement', 'blueprint']),
        projectName: z.string(),
        title: z.string(),
        content: z.record(z.string(), z.any()),
      }))
      .mutation(async ({ input }) => {
        // Generate PDF document
        const filename = `${input.type}_${input.projectName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
        return {
          success: true,
          filename,
          downloadUrl: `/api/documents/download/${filename}`,
          pageCount: 1,
        };
      }),
    
    generateDOCX: protectedProcedure
      .input(z.object({
        type: z.enum(['nda', 'financial_model', 'due_diligence', 'investment_deck', 'risk_register', 'shareholder_agreement', 'blueprint']),
        projectName: z.string(),
        title: z.string(),
        content: z.record(z.string(), z.any()),
      }))
      .mutation(async ({ input }) => {
        const filename = `${input.type}_${input.projectName.replace(/\s+/g, '_')}_${Date.now()}.docx`;
        return {
          success: true,
          filename,
          downloadUrl: `/api/documents/download/${filename}`,
        };
      }),
    
    list: protectedProcedure
      .input(z.object({
        projectId: z.string().optional(),
        type: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        // Return list of generated documents
        return [];
      }),
  }),

  // Transcription API - Whisper integration
  transcription: router({
    transcribe: protectedProcedure
      .input(z.object({
        audioUrl: z.string().optional(),
        audioBase64: z.string().optional(),
        filename: z.string().optional(),
        language: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // For now, return placeholder - actual Whisper integration requires audio processing
        return {
          text: 'Transcription placeholder - connect Whisper API for real transcription',
          duration: 0,
          language: input.language || 'en',
        };
      }),
  }),

  // Voice Notes API - Digital Twin notepad
  voiceNotes: router({
    list: protectedProcedure
      .input(z.object({
        category: z.enum(['task', 'idea', 'reminder', 'observation', 'question', 'follow_up']).optional(),
        search: z.string().optional(),
        limit: z.number().optional(),
        projectId: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        return getVoiceNotes(ctx.user.id, input);
      }),

    create: protectedProcedure
      .input(z.object({
        content: z.string(),
        category: z.enum(['task', 'idea', 'reminder', 'observation', 'question', 'follow_up']).optional(),
        audioUrl: z.string().optional(),
        duration: z.number().optional(),
        projectId: z.number().optional(),
        projectName: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return createVoiceNote({
          userId: ctx.user.id,
          content: input.content,
          category: input.category || 'observation',
          audioUrl: input.audioUrl,
          duration: input.duration,
          projectId: input.projectId,
          projectName: input.projectName,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        content: z.string().optional(),
        category: z.enum(['task', 'idea', 'reminder', 'observation', 'question', 'follow_up']).optional(),
        isProcessed: z.boolean().optional(),
        extractedTasks: z.array(z.string()).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateVoiceNote(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteVoiceNote(input.id);
        return { success: true };
      }),

    convertToTask: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // Get the voice note
        const notes = await getVoiceNotes(ctx.user.id, { limit: 1 });
        const note = notes.find(n => n.id === input.id);
        if (!note) throw new Error('Voice note not found');
        
        // Create a task from the note
        await createTask({
          userId: ctx.user.id,
          title: note.content.slice(0, 100),
          description: note.content,
          status: 'not_started',
          metadata: { source: 'voice_note', sourceId: note.id },
        });
        
        // Update the note category to task
        await updateVoiceNote(input.id, { category: 'task', isActionItem: true });
        
        return { success: true };
      }),
  }),

  // Text-to-Speech API - ElevenLabs integration for Victoria
  text-to-speech: router({
    synthesize: protectedProcedure
      .input(z.object({
        text: z.string().min(1).max(5000),
        voiceId: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { synthesizeSpeech } = await import("./_core/text-to-speech");
        const result = await synthesizeSpeech({
          text: input.text,
          voiceId: input.voiceId,
        });
        
        if ('error' in result) {
          throw new Error(result.error);
        }
        
        return result;
      }),

    getVoices: protectedProcedure
      .query(async () => {
        const { getAvailableVoices } = await import("./_core/text-to-speech");
        const result = await getAvailableVoices();
        
        if ('error' in result) {
          throw new Error(result.error);
        }
        
        return result;
      }),

    getSubscription: protectedProcedure
      .query(async () => {
        const { getSubscriptionInfo } = await import("./_core/text-to-speech");
        const result = await getSubscriptionInfo();
        
        if ('error' in result) {
          throw new Error(result.error);
        }
        
        return result;
      }),
  }),

  // Expert Evolution System API
  expertEvolution: router({
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
  }),
   // Theme Preference API
  theme: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return { themePreference: 'system' };
      
      const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
      return {
        themePreference: user[0]?.themePreference || 'system',
      };
    }),
    
    set: protectedProcedure
      .input(z.object({
        themePreference: z.enum(['light', 'dark', 'system']),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return { success: false };
        
        await db.update(users).set({
          themePreference: input.themePreference,
        }).where(eq(users.id, ctx.user.id));
        
        return { success: true, themePreference: input.themePreference };
      }),
  }),

  favorites: favoritesRouter,

  // SME Team Management API
  smeTeam: router({
    // Create a new SME team
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        purpose: z.string().optional(),
        projectId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return createSmeTeam({
          userId: ctx.user.id,
          name: input.name,
          description: input.description,
          purpose: input.purpose,
          projectId: input.projectId,
        });
      }),

    // List all user's teams
    list: protectedProcedure.query(async ({ ctx }) => {
      return getSmeTeams(ctx.user.id);
    }),

    // Get a single team with members
    get: protectedProcedure
      .input(z.object({ teamId: z.number() }))
      .query(async ({ input }) => {
        return getSmeTeamWithMembers(input.teamId);
      }),

    // Update a team
    update: protectedProcedure
      .input(z.object({
        teamId: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        purpose: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { teamId, ...data } = input;
        await updateSmeTeam(teamId, data);
        return { success: true };
      }),

    // Delete a team (soft delete)
    delete: protectedProcedure
      .input(z.object({ teamId: z.number() }))
      .mutation(async ({ input }) => {
        await deleteSmeTeam(input.teamId);
        return { success: true };
      }),

    // Add a member to a team
    addMember: protectedProcedure
      .input(z.object({
        teamId: z.number(),
        expertId: z.string(),
        role: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return addSmeTeamMember({
          teamId: input.teamId,
          expertId: input.expertId,
          role: input.role,
        });
      }),

    // Remove a member from a team
    removeMember: protectedProcedure
      .input(z.object({
        teamId: z.number(),
        expertId: z.string(),
      }))
      .mutation(async ({ input }) => {
        await removeSmeTeamMember(input.teamId, input.expertId);
        return { success: true };
      }),

    // Get team members
    getMembers: protectedProcedure
      .input(z.object({ teamId: z.number() }))
      .query(async ({ input }) => {
        return getSmeTeamMembers(input.teamId);
      }),
  }),

  // QA Workflow API
  qa: router({
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
  }),

  // SME Feedback API
  smeFeedback: router({
    // Create feedback for an expert
    create: protectedProcedure
      .input(z.object({
        expertId: z.string(),
        taskId: z.number().optional(),
        feedbackType: z.enum(['positive', 'constructive', 'correction', 'training']),
        feedback: z.string(),
        context: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return createSmeFeedback({
          userId: ctx.user.id,
          expertId: input.expertId,
          taskId: input.taskId,
          feedbackType: input.feedbackType,
          feedback: input.feedback,
          context: input.context,
        });
      }),

    // Get feedback for an expert
    get: protectedProcedure
      .input(z.object({ expertId: z.string() }))
      .query(async ({ ctx, input }) => {
        return getSmeFeedback(ctx.user.id, input.expertId);
      }),

    // Mark feedback as applied (expert has "learned")
    markApplied: protectedProcedure
      .input(z.object({ feedbackId: z.number() }))
      .mutation(async ({ input }) => {
        await markFeedbackApplied(input.feedbackId);
        return { success: true };
      }),
  }),

  // Expert Consultation History API
  expertConsultation: router({
    // Record a new consultation
    create: protectedProcedure
      .input(z.object({
        expertId: z.string(),
        expertName: z.string(),
        topic: z.string(),
        summary: z.string().optional(),
        recommendation: z.string().optional(),
        rating: z.number().min(1).max(5).optional(),
        projectId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return createExpertConsultation({
          userId: ctx.user.id,
          ...input,
        });
      }),

    // Get consultation history
    list: protectedProcedure
      .input(z.object({
        expertId: z.string().optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        return getExpertConsultationHistory(ctx.user.id, input);
      }),

    // Get consultation counts per expert
    counts: protectedProcedure
      .query(async ({ ctx }) => {
        return getExpertConsultationCounts(ctx.user.id);
      }),

    // Update consultation (add summary, rating, etc.)
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        summary: z.string().optional(),
        recommendation: z.string().optional(),
        rating: z.number().min(1).max(5).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateExpertConsultation(id, data);
        return { success: true };
      }),

    // Get expert usage statistics
    usageStats: protectedProcedure
      .query(async ({ ctx }) => {
        return getExpertUsageStats(ctx.user.id);
      }),

    // Get top rated experts
    topRated: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return getTopRatedExperts(ctx.user.id, input?.limit || 10);
      }),

    // Get most used experts
    mostUsed: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return getMostUsedExperts(ctx.user.id, input?.limit || 10);
      }),

    // Get consultation trends over time
    trends: protectedProcedure
      .input(z.object({ months: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return getExpertConsultationTrends(ctx.user.id, input?.months || 6);
      }),

    // Rate a consultation
    rate: protectedProcedure
      .input(z.object({
        consultationId: z.number(),
        rating: z.number().min(1).max(10),
        feedback: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await rateExpertConsultation(input.consultationId, input.rating, input.feedback);
        return { success: true };
      }),
  }),

  // Expert Chat Sessions API
  expertChat: router({
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
  }),

  // Expert Recommendations
  expertRecommendation: router({
    // Get recommended experts based on consultation history and context
    getRecommendations: protectedProcedure
      .input(z.object({
        context: z.string().optional(), // Current project or topic context
        limit: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const limit = input.limit || 5;
        
        // Get user's consultation history
        const consultations = await getExpertConsultationHistory(ctx.user.id, { limit: 50 });
        
        // Get consultation counts per expert
        const counts = await getExpertConsultationCounts(ctx.user.id);
        
        // Build recommendation logic
        const recommendations: Array<{
          expertId: string;
          expertName: string;
          specialty: string;
          reason: string;
          score: number;
          category: string;
          avatar: string;
          performanceScore: number;
        }> = [];
        
        // Analyze consultation patterns
        const categoryFrequency: Record<string, number> = {};
        const consultedExperts = new Set<string>();
        const expertConsultCount: Record<string, number> = {};
        
        for (const c of consultations) {
          consultedExperts.add(c.expertId);
          expertConsultCount[c.expertId] = (expertConsultCount[c.expertId] || 0) + 1;
          
          // Track categories from expert names in consultations
          if (c.expertName) {
            const name = c.expertName.toLowerCase();
            // Infer category from consultation patterns
            if (name.includes('finance') || name.includes('invest') || name.includes('capital')) {
              categoryFrequency['Finance & Investment'] = (categoryFrequency['Finance & Investment'] || 0) + 1;
            }
            if (name.includes('strategy') || name.includes('business') || name.includes('ceo')) {
              categoryFrequency['Strategy & Business'] = (categoryFrequency['Strategy & Business'] || 0) + 1;
            }
            if (name.includes('tech') || name.includes('ai') || name.includes('data')) {
              categoryFrequency['Technology & AI'] = (categoryFrequency['Technology & AI'] || 0) + 1;
            }
            if (name.includes('legal') || name.includes('compliance') || name.includes('law')) {
              categoryFrequency['Legal & Compliance'] = (categoryFrequency['Legal & Compliance'] || 0) + 1;
            }
          }
        }
        
        // Find top categories
        const topCategories = Object.entries(categoryFrequency)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([cat]) => cat);
        
        // Curated expert recommendations from different categories
        const expertPool = [
          // Finance & Investment
          { id: 'warren-sage', name: 'Warren Sage', specialty: 'Value Investing', category: 'Finance & Investment', avatar: '💰', performanceScore: 98, reason: 'Master of value investing principles' },
          { id: 'capital-maven', name: 'Capital Maven', specialty: 'Venture Capital', category: 'Finance & Investment', avatar: '🚀', performanceScore: 95, reason: 'Expert in startup funding strategies' },
          // Strategy & Business
          { id: 'strategy-oracle', name: 'Strategy Oracle', specialty: 'Business Strategy', category: 'Strategy & Business', avatar: '🎯', performanceScore: 96, reason: 'Strategic planning and execution expert' },
          { id: 'growth-architect', name: 'Growth Architect', specialty: 'Scaling Businesses', category: 'Strategy & Business', avatar: '📈', performanceScore: 94, reason: 'Specialist in rapid business scaling' },
          // Technology & AI
          { id: 'tech-visionary', name: 'Tech Visionary', specialty: 'AI & Innovation', category: 'Technology & AI', avatar: '🤖', performanceScore: 97, reason: 'Cutting-edge AI implementation expert' },
          { id: 'data-sage', name: 'Data Sage', specialty: 'Data Analytics', category: 'Technology & AI', avatar: '📊', performanceScore: 93, reason: 'Data-driven decision making specialist' },
          // Legal & Compliance
          { id: 'legal-guardian', name: 'Legal Guardian', specialty: 'Corporate Law', category: 'Legal & Compliance', avatar: '⚖️', performanceScore: 95, reason: 'Expert in corporate legal matters' },
          { id: 'compliance-chief', name: 'Compliance Chief', specialty: 'Regulatory Compliance', category: 'Legal & Compliance', avatar: '📋', performanceScore: 92, reason: 'Regulatory navigation specialist' },
          // Marketing & Sales
          { id: 'brand-master', name: 'Brand Master', specialty: 'Brand Strategy', category: 'Marketing & Sales', avatar: '🎨', performanceScore: 94, reason: 'Brand building and positioning expert' },
          { id: 'sales-dynamo', name: 'Sales Dynamo', specialty: 'Sales Strategy', category: 'Marketing & Sales', avatar: '💼', performanceScore: 93, reason: 'High-performance sales methodology expert' },
          // Healthcare & Biotech
          { id: 'health-innovator', name: 'Health Innovator', specialty: 'Healthcare Strategy', category: 'Healthcare & Biotech', avatar: '🏥', performanceScore: 96, reason: 'Healthcare industry transformation expert' },
          // Operations
          { id: 'ops-optimizer', name: 'Ops Optimizer', specialty: 'Operations Excellence', category: 'Operations', avatar: '⚙️', performanceScore: 94, reason: 'Operational efficiency specialist' },
        ];
        
        // Filter and score recommendations
        for (const expert of expertPool) {
          if (!consultedExperts.has(expert.id)) {
            let score = expert.performanceScore; // Start with performance score
            let reason = expert.reason;
            
            // Boost if in top categories (user's preferred areas)
            if (topCategories.includes(expert.category)) {
              score += 15;
              reason = `${expert.reason} - Matches your interests`;
            }
            
            // Boost based on context match
            if (input.context) {
              const contextLower = input.context.toLowerCase();
              const categoryWords = expert.category.toLowerCase().split(/[\s&]+/);
              const specialtyWords = expert.specialty.toLowerCase().split(/[\s&]+/);
              
              if (categoryWords.some(w => contextLower.includes(w)) ||
                  specialtyWords.some(w => contextLower.includes(w))) {
                score += 10;
                reason = `${expert.reason} - Relevant to your current focus`;
              }
            }
            
            // Add diversity bonus for categories not yet consulted
            if (!topCategories.includes(expert.category) && consultations.length > 5) {
              // Slight boost to encourage exploring new areas
              score += 5;
            }
            
            recommendations.push({
              expertId: expert.id,
              expertName: expert.name,
              specialty: expert.specialty,
              reason,
              score,
              category: expert.category,
              avatar: expert.avatar,
              performanceScore: expert.performanceScore,
            });
          }
        }
        
        // Sort by score and return top recommendations
        return recommendations
          .sort((a, b) => b.score - a.score)
          .slice(0, limit);
      }),

    // Get personalized insights based on consultation history
    getInsights: protectedProcedure
      .query(async ({ ctx }) => {
        const consultations = await getExpertConsultationHistory(ctx.user.id, { limit: 100 });
        const counts = await getExpertConsultationCounts(ctx.user.id);
        
        // Calculate insights
        const totalConsultations = consultations.length;
        const uniqueExperts = counts.length;
        const mostConsulted = counts[0] || null;
        
        // Recent activity
        const recentConsultations = consultations.slice(0, 5);
        
        return {
          totalConsultations,
          uniqueExperts,
          mostConsulted: mostConsulted ? {
            expertId: mostConsulted.expertId,
            count: mostConsulted.count,
          } : null,
          recentActivity: recentConsultations.map(c => ({
            expertId: c.expertId,
            expertName: c.expertName,
            topic: c.topic,
            date: c.createdAt,
          })),
        };
      }),
  }),

  // Library Documents API
  library: router({
    // Create a new library document
    create: protectedProcedure
      .input(z.object({
        projectId: z.string().optional(),
        folder: z.string(),
        subFolder: z.string().optional(),
        name: z.string(),
        type: z.enum(['document', 'image', 'chart', 'presentation', 'data', 'other']),
        status: z.enum(['draft', 'review', 'signed_off']).optional(),
        fileUrl: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        metadata: z.any().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return createLibraryDocument({
          userId: ctx.user.id,
          projectId: input.projectId || null,
          folder: input.folder,
          subFolder: input.subFolder || null,
          name: input.name,
          type: input.type,
          status: input.status || 'draft',
          fileUrl: input.fileUrl || null,
          thumbnailUrl: input.thumbnailUrl || null,
          metadata: input.metadata || null,
        });
      }),

    // Get library documents
    list: protectedProcedure
      .input(z.object({
        folder: z.string().optional(),
        subFolder: z.string().optional(),
        type: z.string().optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        return getLibraryDocuments(ctx.user.id, input);
      }),

    // Get single document by ID
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getLibraryDocumentById(input.id);
      }),

    // Update document
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        status: z.enum(['draft', 'review', 'signed_off']).optional(),
        fileUrl: z.string().optional(),
        metadata: z.any().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateLibraryDocument(id, data);
        return { success: true };
      }),

    // Delete document
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteLibraryDocument(input.id);
        return { success: true };
      }),

    // Export expert chat to library
    exportExpertChat: protectedProcedure
      .input(z.object({
        expertId: z.string(),
        expertName: z.string(),
        expertSpecialty: z.string(),
        expertCategory: z.string(),
        expertBio: z.string(),
        compositeOf: z.array(z.string()),
        strengths: z.array(z.string()),
        thinkingStyle: z.string(),
        messages: z.array(z.object({
          role: z.enum(['user', 'expert', 'system']),
          content: z.string(),
        })),
        projectId: z.string().optional(),
        folder: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const timestamp = new Date().toISOString().split('T')[0];
        
        // Generate markdown content
        const expertName = input.expertName;
        const transcript = input.messages.map(msg => {
          if (msg.role === 'user') return `### You:\n${msg.content}\n`;
          if (msg.role === 'expert') return `### ${expertName}:\n${msg.content}\n`;
          return `### System:\n${msg.content}\n`;
        }).join('\n');
        
        const markdown = `# Expert Consultation: ${input.expertName}

**Date:** ${timestamp}
**Expert:** ${input.expertName}
**Specialty:** ${input.expertSpecialty}
**Category:** ${input.expertCategory}

## Expert Profile

${input.expertBio}

**Inspired By:** ${input.compositeOf.join(', ')}

**Strengths:** ${input.strengths.join(', ')}

**Thinking Style:** ${input.thinkingStyle}

---

## Conversation Transcript

${transcript}

---

*Exported from CEPHO AI SME Consultation*
`;

        // Create library document
        const docName = `Consultation - ${input.expertName} - ${timestamp}.md`;
        const doc = await createLibraryDocument({
          userId: ctx.user.id,
          projectId: input.projectId || null,
          folder: input.folder || 'consultations',
          subFolder: 'expert_chats',
          name: docName,
          type: 'document',
          status: 'draft',
          fileUrl: null, // Content stored in metadata
          thumbnailUrl: null,
          metadata: {
            expertId: input.expertId,
            expertName: input.expertName,
            expertSpecialty: input.expertSpecialty,
            messageCount: input.messages.length,
            exportedAt: new Date().toISOString(),
            content: markdown,
          },
        });

        return {
          success: true,
          documentId: doc?.id,
          documentName: docName,
        };
      }),
  }),

  // Business Plan Review API
  businessPlanReview: router({
    // Get all business plan sections
    getSections: publicProcedure.query(() => {
      return BUSINESS_PLAN_SECTIONS;
    }),

    // Get all review experts
    getExperts: publicProcedure.query(() => {
      return REVIEW_EXPERTS.map(e => ({
        id: e.id,
        name: e.name,
        specialty: e.specialty,
        category: e.category,
        avatar: e.avatar,
      }));
    }),

    // Get experts for a specific section
    getExpertsForSection: publicProcedure
      .input(z.object({ sectionId: z.string() }))
      .query(({ input }) => {
        return getExpertsForSection(input.sectionId);
      }),

    // Analyze a single section with a specific expert
    analyzeSection: protectedProcedure
      .input(z.object({
        sectionId: z.string(),
        sectionContent: z.string().optional(),
        expertId: z.string(),
      }))
      .mutation(async ({ input }) => {
        const insight = await analyzeSection(
          input.sectionId,
          input.sectionContent || '',
          input.expertId
        );
        return insight;
      }),

    // Analyze a section with all assigned experts
    analyzeSectionWithAllExperts: protectedProcedure
      .input(z.object({
        sectionId: z.string(),
        sectionContent: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const experts = getExpertsForSection(input.sectionId);
        const insights: ExpertInsight[] = [];
        
        for (const expert of experts) {
          const insight = await analyzeSection(
            input.sectionId,
            input.sectionContent || '',
            expert.id
          );
          insights.push(insight);
        }

        // Calculate overall score
        const avgScore = Math.round(
          insights.reduce((sum, i) => sum + i.score, 0) / insights.length
        );

        // Aggregate recommendations and concerns
        const allRecommendations = insights.flatMap(i => i.recommendations);
        const allConcerns = insights.flatMap(i => i.concerns);

        const section = BUSINESS_PLAN_SECTIONS.find(s => s.id === input.sectionId);

        return {
          sectionId: input.sectionId,
          sectionName: section?.name || input.sectionId,
          status: 'completed' as const,
          expertInsights: insights,
          overallScore: avgScore,
          recommendations: Array.from(new Set(allRecommendations)).slice(0, 5),
          concerns: Array.from(new Set(allConcerns)).slice(0, 3),
        };
      }),

    // Generate consolidated report from reviews
    generateReport: protectedProcedure
      .input(z.object({
        reviews: z.array(z.object({
          sectionId: z.string(),
          sectionName: z.string(),
          status: z.enum(['pending', 'in-progress', 'completed']),
          expertInsights: z.array(z.object({
            expertId: z.string(),
            expertName: z.string(),
            expertAvatar: z.string(),
            insight: z.string(),
            score: z.number(),
            recommendations: z.array(z.string()),
            concerns: z.array(z.string()),
            timestamp: z.date().or(z.string()),
          })),
          overallScore: z.number().optional(),
          recommendations: z.array(z.string()).optional(),
          concerns: z.array(z.string()).optional(),
        })),
      }))
      .mutation(({ input }) => {
        const report = generateConsolidatedReport(input.reviews as SectionReview[]);
        return { report };
      }),

    // Chief of Staff: Select optimal expert team based on business plan content
    selectExpertTeam: protectedProcedure
      .input(z.object({
        businessPlanContent: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await selectExpertTeam(input.businessPlanContent || '');
        return result;
      }),

    // Save review as a version
    saveVersion: protectedProcedure
      .input(z.object({
        projectName: z.string(),
        versionLabel: z.string().optional(),
        overallScore: z.number().optional(),
        sectionScores: z.record(z.string(), z.number()).optional(),
        reviewData: z.any(),
        expertTeam: z.array(z.string()),
        teamSelectionMode: z.string(),
        businessPlanContent: z.string().optional(),
        sectionDocuments: z.record(z.string(), z.object({
          fileName: z.string(),
          content: z.string(),
        })).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const latestVersion = await getLatestVersionNumber(ctx.user.id, input.projectName);
        const versionId = await createBusinessPlanReviewVersion({
          userId: ctx.user.id,
          projectName: input.projectName,
          versionNumber: latestVersion + 1,
          versionLabel: input.versionLabel,
          overallScore: input.overallScore,
          sectionScores: input.sectionScores,
          reviewData: input.reviewData,
          expertTeam: input.expertTeam,
          teamSelectionMode: input.teamSelectionMode,
          businessPlanContent: input.businessPlanContent,
          sectionDocuments: input.sectionDocuments,
        });
        return { versionId, versionNumber: latestVersion + 1 };
      }),

    // Get all versions for a project
    getVersions: protectedProcedure
      .input(z.object({
        projectName: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        return getBusinessPlanReviewVersions(ctx.user.id, input.projectName);
      }),

    // Get a specific version by ID
    getVersionById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getBusinessPlanReviewVersionById(input.id);
      }),

    // Get all user's business plan projects
    getProjects: protectedProcedure
      .query(async ({ ctx }) => {
        return getUserBusinessPlanProjects(ctx.user.id);
      }),

    // Ask follow-up question to an expert
    askFollowUp: protectedProcedure
      .input(z.object({
        reviewVersionId: z.number(),
        sectionId: z.string(),
        expertId: z.string(),
        question: z.string(),
        originalInsight: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Create the question record
        const questionId = await createExpertFollowUpQuestion({
          userId: ctx.user.id,
          reviewVersionId: input.reviewVersionId,
          sectionId: input.sectionId,
          expertId: input.expertId,
          question: input.question,
        });

        // Get the expert info
        const expert = REVIEW_EXPERTS.find(e => e.id === input.expertId);
        if (!expert) {
          throw new Error('Expert not found');
        }

        // Generate answer using LLM
        const response = await invokeLLM({
          messages: [
            { 
              role: 'system', 
              content: `${expert.systemPrompt}\n\nYou previously provided this insight:\n"${input.originalInsight}"\n\nNow answer the follow-up question professionally and helpfully.` 
            },
            { role: 'user', content: input.question }
          ]
        });

        const rawContent = response.choices[0]?.message?.content;
        const answer = typeof rawContent === 'string' ? rawContent : 'Unable to generate response.';

        // Update the question with the answer
        if (questionId) {
          await answerExpertFollowUpQuestion(questionId, answer);
        }

        return { questionId, answer };
      }),

    // Get follow-up questions for a review
    getFollowUps: protectedProcedure
      .input(z.object({
        reviewVersionId: z.number(),
        sectionId: z.string().optional(),
        expertId: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return getExpertFollowUpQuestions(input.reviewVersionId, {
          sectionId: input.sectionId,
          expertId: input.expertId,
        });
      }),

    // Generate PDF report markdown
    generateReportMarkdown: protectedProcedure
      .input(z.object({
        projectName: z.string(),
        templateId: z.string().optional(),
        overallScore: z.number(),
        sectionReviews: z.array(z.object({
          sectionId: z.string(),
          sectionName: z.string(),
          status: z.string(),
          overallScore: z.number().optional(),
          expertInsights: z.array(z.object({
            expertId: z.string(),
            expertName: z.string(),
            expertAvatar: z.string(),
            insight: z.string(),
            score: z.number(),
            recommendations: z.array(z.string()),
            concerns: z.array(z.string()),
          })),
          recommendations: z.array(z.string()).optional(),
          concerns: z.array(z.string()).optional(),
        })),
        expertTeam: z.array(z.string()),
        teamSelectionReasoning: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { generateReportMarkdown } = await import('./services/pdfReportService');
        const markdown = generateReportMarkdown({
          ...input,
          reviewDate: new Date(),
        });
        return { markdown };
      }),

    // Get available templates
    getTemplates: publicProcedure.query(() => {
      return BUSINESS_TEMPLATES;
    }),
  }),

  // Collaborative Review API
  collaborativeReview: router({
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
  }),

  // Quality Gate Notifications API
  qualityGate: router({
    // Request quality gate review (sends notification to owner)
    requestReview: protectedProcedure
      .input(z.object({
        projectId: z.string(),
        projectName: z.string(),
        fromPhase: z.string(),
        toPhase: z.string(),
        requestedBy: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { notifyOwner } = await import('./_core/notification');
        const delivered = await notifyOwner({
          title: `Quality Gate Review Requested: ${input.projectName}`,
          content: `A quality gate review has been requested for project "${input.projectName}" to transition from ${input.fromPhase} to ${input.toPhase}.\n\nRequested by: ${input.requestedBy}\n\nPlease review and approve or reject this phase transition in the Chief of Staff dashboard.`,
        });
        return { success: delivered };
      }),

    // Notify on approval
    notifyApproval: protectedProcedure
      .input(z.object({
        projectId: z.string(),
        projectName: z.string(),
        phase: z.string(),
        approvedBy: z.string(),
        comments: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { notifyOwner } = await import('./_core/notification');
        const delivered = await notifyOwner({
          title: `Quality Gate Approved: ${input.projectName}`,
          content: `The quality gate for project "${input.projectName}" phase "${input.phase}" has been approved.\n\nApproved by: ${input.approvedBy}${input.comments ? `\n\nComments: ${input.comments}` : ''}`,
        });
        return { success: delivered };
      }),

    // Notify on rejection
    notifyRejection: protectedProcedure
      .input(z.object({
        projectId: z.string(),
        projectName: z.string(),
        phase: z.string(),
        rejectedBy: z.string(),
        reason: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { notifyOwner } = await import('./_core/notification');
        const delivered = await notifyOwner({
          title: `Quality Gate Rejected: ${input.projectName}`,
          content: `The quality gate for project "${input.projectName}" phase "${input.phase}" has been rejected.\n\nRejected by: ${input.rejectedBy}\n\nReason: ${input.reason}`,
        });
        return { success: delivered };
      }),

    // Notify pending reviews (for scheduled reminders)
    notifyPendingReviews: protectedProcedure
      .input(z.object({
        pendingCount: z.number(),
        projects: z.array(z.object({
          name: z.string(),
          phase: z.string(),
          waitingDays: z.number(),
        })),
      }))
      .mutation(async ({ input }) => {
        const { notifyOwner } = await import('./_core/notification');
        const projectList = input.projects.map(p => `- ${p.name} (${p.phase}) - waiting ${p.waitingDays} days`).join('\n');
        const delivered = await notifyOwner({
          title: `${input.pendingCount} Quality Gate Reviews Pending`,
          content: `You have ${input.pendingCount} quality gate reviews awaiting your attention:\n\n${projectList}\n\nPlease review these in the Chief of Staff dashboard.`,
        });
        return { success: delivered };
      }),
  }),

  // Evening Review System API
  eveningReview: router({
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
  }),

  // Signal Items API (for morning brief)
  signal: router({
    // Get pending signal items
    getPending: protectedProcedure.query(async ({ ctx }) => {
      return getPendingSignalItems(ctx.user.id);
    }),

    // Get signal items for a specific date
    getForDate: protectedProcedure
      .input(z.object({
        date: z.string(), // ISO date string
        category: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        return getSignalItems(ctx.user.id, new Date(input.date), {
          category: input.category,
        });
      }),

    // Update signal item status
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['pending', 'delivered', 'actioned', 'dismissed']),
      }))
      .mutation(async ({ input }) => {
        await updateSignalItemStatus(input.id, input.status);
        return { success: true };
      }),

    // Create manual signal item
    create: protectedProcedure
      .input(z.object({
        category: z.enum(['task_summary', 'project_update', 'calendar_alert', 'intelligence', 'recommendation', 'reflection']),
        title: z.string(),
        description: z.string().optional(),
        priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
        targetDate: z.string(), // ISO date string
      }))
      .mutation(async ({ ctx, input }) => {
        await createSignalItems([{
          userId: ctx.user.id,
          sourceType: 'manual',
          category: input.category,
          title: input.title,
          description: input.description,
          priority: input.priority,
          targetDate: new Date(input.targetDate),
        }]);
        return { success: true };
      }),
  }),

  // Morning Signal API
  morningSignal: router({
    // Generate PDF of morning signal
    generatePdf: protectedProcedure
      .input(z.object({
        includePatterns: z.boolean().optional(),
      }).optional())
      .mutation(async ({ ctx, input }) => {
        const { generateMorningSignalHtml } = await import('./services/morningSignalPdfService');
        
        // Get latest evening review data
        const latestReview = await getLatestEveningReviewSession(ctx.user.id);
        const metadata = latestReview?.metadata as any || {};
        
        // Build signal data
        const now = new Date();
        const hour = now.getHours();
        const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
        
        const signalData = {
          userName: ctx.user.name?.split(' ')[0] || 'there',
          date: now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
          greeting,
          acceptedTasks: (metadata.acceptedTasks || []).map((t: any, i: number) => ({
            id: `accepted-${i}`,
            type: 'accepted' as const,
            title: t.title || `Task ${i + 1}`,
            description: t.description || 'Ready for today',
            priority: t.priority || 'medium',
            source: t.project || 'Evening Review',
          })),
          deferredTasks: (metadata.deferredTasks || []).map((t: any, i: number) => ({
            id: `deferred-${i}`,
            type: 'deferred' as const,
            title: t.title || `Deferred Task ${i + 1}`,
            description: t.reason || 'Needs attention',
            priority: 'high' as const,
            source: t.project || 'Evening Review',
          })),
          insights: (metadata.insights || []).map((ins: any, i: number) => ({
            id: `insight-${i}`,
            type: 'insight' as const,
            title: ins.title || 'Insight',
            description: ins.content || ins,
            priority: 'medium' as const,
            source: 'Chief of Staff Analysis',
          })),
          overnightWork: (metadata.overnightWork || []).map((w: any, i: number) => ({
            id: `overnight-${i}`,
            type: 'overnight' as const,
            title: w.title || 'Overnight Progress',
            description: w.summary || 'Completed while you slept',
            priority: 'low' as const,
            source: 'Chief of Staff',
          })),
          patterns: input?.includePatterns ? {
            productivityScore: metadata.productivityScore,
            focusAreas: metadata.focusAreas || [],
            recommendations: metadata.recommendations || [],
          } : undefined,
        };
        
        const html = generateMorningSignalHtml(signalData);
        return { html, signalData };
      }),
      
    // Get signal items for today
    getItems: protectedProcedure.query(async ({ ctx }) => {
      return getPendingSignalItems(ctx.user.id);
    }),
  }),

  // Calendar Sync API
  calendar: router({
    // Sync calendar events from a provider
    sync: protectedProcedure
      .input(z.object({
        provider: z.enum(['google', 'outlook']),
        daysAhead: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { syncCalendarEvents } = await import('./services/calendarSyncService');
        return syncCalendarEvents(ctx.user.id, input.provider, input.daysAhead);
      }),

    // Get cached events for a time range
    getEvents: protectedProcedure
      .input(z.object({
        startTime: z.string(),
        endTime: z.string(),
        provider: z.enum(['google', 'outlook', 'manual']).optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { getCachedEvents } = await import('./services/calendarSyncService');
        return getCachedEvents(
          ctx.user.id,
          new Date(input.startTime),
          new Date(input.endTime),
          input.provider
        );
      }),

    // Get today's schedule summary
    getTodaySummary: protectedProcedure.query(async ({ ctx }) => {
      const { getTodayScheduleSummary } = await import('./services/calendarSyncService');
      return getTodayScheduleSummary(ctx.user.id);
    }),

    // Check for events in a time window
    hasConflicts: protectedProcedure
      .input(z.object({
        windowStart: z.string(),
        windowEnd: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        const { hasEventsInTimeWindow } = await import('./services/calendarSyncService');
        const hasConflicts = await hasEventsInTimeWindow(
          ctx.user.id,
          new Date(input.windowStart),
          new Date(input.windowEnd)
        );
        return { hasConflicts };
      }),

    // Get next free time slot
    getNextFreeSlot: protectedProcedure
      .input(z.object({
        startFrom: z.string().optional(),
        durationMinutes: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        const { getNextFreeSlot } = await import('./services/calendarSyncService');
        return getNextFreeSlot(
          ctx.user.id,
          input?.startFrom ? new Date(input.startFrom) : new Date(),
          input?.durationMinutes || 30
        );
      }),

    // Add a manual calendar event
    addManualEvent: protectedProcedure
      .input(z.object({
        title: z.string(),
        startTime: z.string(),
        endTime: z.string(),
        isAllDay: z.boolean().optional(),
        location: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { addManualEvent } = await import('./services/calendarSyncService');
        const eventId = await addManualEvent(ctx.user.id, {
          title: input.title,
          startTime: new Date(input.startTime),
          endTime: new Date(input.endTime),
          isAllDay: input.isAllDay || false,
          location: input.location,
        });
        return { eventId };
      }),

    // Get calendar integration status
    getIntegrationStatus: protectedProcedure.query(async ({ ctx }) => {
      const { getCalendarIntegration } = await import('./services/calendarSyncService');
      const [google, outlook] = await Promise.all([
        getCalendarIntegration(ctx.user.id, 'google'),
        getCalendarIntegration(ctx.user.id, 'outlook'),
      ]);
      return {
        google: { connected: !!google, hasToken: !!google?.accessToken },
        outlook: { connected: !!outlook, hasToken: !!outlook?.accessToken },
      };
    }),
  }),

  // Innovation Engine Router
  innovation: router({
    // Capture a new idea
    captureIdea: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        source: z.enum(["manual", "article", "trend", "conversation", "chief_of_staff", "sme_suggestion"]).optional(),
        sourceUrl: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { captureIdea } = await import('./services/innovationEngineService');
        return captureIdea(ctx.user.id, input);
      }),

    // Get all ideas
    getIdeas: protectedProcedure
      .input(z.object({
        status: z.string().optional(),
        stage: z.number().optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        const { getIdeas } = await import('./services/innovationEngineService');
        return getIdeas(ctx.user.id, input);
      }),

    // Get single idea with assessments
    getIdeaWithAssessments: protectedProcedure
      .input(z.object({ ideaId: z.number() }))
      .query(async ({ input }) => {
        const { getIdeaWithAssessments } = await import('./services/innovationEngineService');
        return getIdeaWithAssessments(input.ideaId);
      }),

    // Run strategic assessment
    runAssessment: protectedProcedure
      .input(z.object({
        ideaId: z.number(),
        assessmentType: z.enum(["market_analysis", "feasibility", "competitive_landscape", "financial_viability", "risk_assessment"]),
      }))
      .mutation(async ({ input }) => {
        const { runStrategicAssessment } = await import('./services/innovationEngineService');
        return runStrategicAssessment(input.ideaId, input.assessmentType);
      }),

    // Advance to next stage
    advanceStage: protectedProcedure
      .input(z.object({
        ideaId: z.number(),
        rationale: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { advanceToNextStage } = await import('./services/innovationEngineService');
        return advanceToNextStage(input.ideaId, input.rationale);
      }),

    // Generate investment scenarios
    generateScenarios: protectedProcedure
      .input(z.object({
        ideaId: z.number(),
        budgets: z.array(z.number()).optional(),
      }))
      .mutation(async ({ input }) => {
        const { generateInvestmentScenarios } = await import('./services/innovationEngineService');
        return generateInvestmentScenarios(input.ideaId, input.budgets);
      }),

    // Generate idea brief
    generateBrief: protectedProcedure
      .input(z.object({ ideaId: z.number() }))
      .mutation(async ({ input }) => {
        const { generateIdeaBrief } = await import('./services/innovationEngineService');
        return generateIdeaBrief(input.ideaId);
      }),

    // Promote to Project Genesis
    promoteToGenesis: protectedProcedure
      .input(z.object({ ideaId: z.number() }))
      .mutation(async ({ input }) => {
        const { promoteToGenesis } = await import('./services/innovationEngineService');
        return promoteToGenesis(input.ideaId);
      }),

    // Analyze article for opportunities
    analyzeArticle: protectedProcedure
      .input(z.object({
        url: z.string(),
        context: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { analyzeArticleForOpportunities } = await import('./services/innovationEngineService');
        return analyzeArticleForOpportunities(ctx.user.id, input.url, input.context);
      }),

    // Get strategic framework questions
    getFrameworkQuestions: publicProcedure
      .input(z.object({
        assessmentType: z.enum(["market_analysis", "feasibility", "competitive_landscape", "financial_viability", "risk_assessment"]),
      }))
      .query(async ({ input }) => {
        const { STRATEGIC_FRAMEWORK } = await import('./services/innovationEngineService');
        return STRATEGIC_FRAMEWORK[input.assessmentType];
      }),

    // === Government Funding Assessment ===
    
    // Get all funding programs
    getFundingPrograms: publicProcedure
      .input(z.object({
        country: z.enum(["UAE", "UK"]).optional(),
        type: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        const { ALL_FUNDING_PROGRAMS } = await import('./services/fundingAssessmentService');
        let programs = ALL_FUNDING_PROGRAMS;
        if (input?.country) {
          programs = programs.filter(p => p.country === input.country);
        }
        if (input?.type) {
          programs = programs.filter(p => p.type === input.type);
        }
        return programs;
      }),

    // Get eligible programs for an idea
    getEligiblePrograms: protectedProcedure
      .input(z.object({
        ideaId: z.number(),
        country: z.enum(["UAE", "UK"]).optional(),
      }))
      .query(async ({ input }) => {
        const { getEligiblePrograms } = await import('./services/fundingAssessmentService');
        const { getIdeaWithAssessments } = await import('./services/innovationEngineService');
        const idea = await getIdeaWithAssessments(input.ideaId);
        if (!idea) return [];
        return getEligiblePrograms(idea.idea?.category || 'Technology', idea.idea?.currentStage?.toString() || 'seed', input.country);
      }),

    // Assess idea for a specific funding program
    assessForFunding: protectedProcedure
      .input(z.object({
        ideaId: z.number(),
        programId: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { assessIdeaForProgram } = await import('./services/fundingAssessmentService');
        return assessIdeaForProgram(ctx.user.id, input.ideaId, input.programId);
      }),

    // Get all funding assessments for an idea
    getIdeaFundingAssessments: protectedProcedure
      .input(z.object({ ideaId: z.number() }))
      .query(async ({ input }) => {
        const { getIdeaFundingAssessments } = await import('./services/fundingAssessmentService');
        return getIdeaFundingAssessments(input.ideaId);
      }),

    // Generate application documents for a funding program
    generateFundingDocuments: protectedProcedure
      .input(z.object({
        ideaId: z.number(),
        programId: z.string(),
        documentTypes: z.array(z.string()),
      }))
      .mutation(async ({ input }) => {
        const { generateApplicationDocuments } = await import('./services/fundingAssessmentService');
        return generateApplicationDocuments(input.ideaId, input.programId, input.documentTypes);
      }),
  }),

  // Stripe Payment Router
  payments: router({
    // Create checkout session for subscription
    createCheckoutSession: protectedProcedure
      .input(z.object({
        priceId: z.string(),
        mode: z.enum(["subscription", "payment"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createCheckoutSession } = await import('./stripe/stripeService');
        const origin = ctx.req.headers.origin || 'http://localhost:3000';
        
        return createCheckoutSession({
          userId: ctx.user.id,
          userEmail: ctx.user.email || '',
          userName: ctx.user.name || '',
          priceId: input.priceId,
          successUrl: `${origin}/settings?payment=success`,
          cancelUrl: `${origin}/settings?payment=cancelled`,
          mode: input.mode || 'subscription',
        });
      }),

    // Get user's subscription status
    getSubscription: protectedProcedure.query(async ({ ctx }) => {
      const { getUserSubscription } = await import('./stripe/stripeService');
      return getUserSubscription(ctx.user.id);
    }),

    // Cancel subscription
    cancelSubscription: protectedProcedure
      .input(z.object({ subscriptionId: z.string() }))
      .mutation(async ({ input }) => {
        const { cancelSubscription } = await import('./stripe/stripeService');
        return cancelSubscription(input.subscriptionId);
      }),

    // Get customer portal URL
    getPortalUrl: protectedProcedure.mutation(async ({ ctx }) => {
      const { getOrCreateCustomer, createPortalSession } = await import('./stripe/stripeService');
      const origin = ctx.req.headers.origin || 'http://localhost:3000';
      
      const customerId = await getOrCreateCustomer(
        ctx.user.id, 
        ctx.user.email || '',
        ctx.user.name || undefined
      );
      
      return createPortalSession(customerId, `${origin}/settings`);
    }),

    // Get available products
    getProducts: publicProcedure.query(async () => {
      const { PRODUCTS, ONE_TIME_PRODUCTS } = await import('./stripe/products');
      return { subscriptions: PRODUCTS, oneTime: ONE_TIME_PRODUCTS };
    }),
  }),

  // Document Library API
  documentLibrary: router({
    // List all generated documents
    list: protectedProcedure
      .input(z.object({
        type: z.enum(['all', 'innovation_brief', 'project_genesis', 'report', 'other']).default('all'),
        qaStatus: z.enum(['all', 'approved', 'pending', 'rejected']).default('all'),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional())
      .query(async ({ ctx, input }) => {
        const filters = input || { type: 'all', qaStatus: 'all', limit: 50, offset: 0 };
        const { getDocuments } = await import('./db');
        return getDocuments(ctx.user.id, filters);
      }),

    // Get a specific document
    get: protectedProcedure
      .input(z.object({ documentId: z.string() }))
      .query(async ({ ctx, input }) => {
        const { getDocumentById } = await import('./db');
        const doc = await getDocumentById(input.documentId);
        if (!doc || doc.userId !== ctx.user.id) {
          throw new Error('Document not found');
        }
        return doc;
      }),

    // Generate PDF for a document
    generatePDF: protectedProcedure
      .input(z.object({
        documentId: z.string(),
        type: z.enum(['innovation_brief', 'project_genesis', 'report']),
      }))
      .mutation(async ({ ctx, input }) => {
        const { generateInnovationBriefPDF } = await import('./services/pdf-export.service');
        const { getDocumentById, updateDocument } = await import('./db');
        const { storagePut } = await import('./storage');
        
        const doc = await getDocumentById(input.documentId);
        if (!doc || doc.userId !== ctx.user.id) {
          throw new Error('Document not found');
        }
        
        // Parse document content
        const content = JSON.parse(doc.content || '{}');
        
        if (input.type === 'innovation_brief') {
          const { html, markdown } = await generateInnovationBriefPDF(
            {
              title: doc.title,
              description: content.description || '',
              category: content.category,
              confidenceScore: content.confidenceScore,
            },
            content.assessments || [],
            content.scenarios || [],
            content.recommendation || { decision: 'refine', rationale: '', nextSteps: [] },
            {
              documentId: input.documentId,
              classification: doc.classification || 'internal',
              qaApproved: doc.qaStatus === 'approved',
              qaApprover: doc.qaApprover || undefined,
            }
          );
          
          // Save markdown to storage
          const mdKey = `documents/${ctx.user.id}/${input.documentId}.md`;
          const { url: mdUrl } = await storagePut(mdKey, markdown, 'text/markdown');
          
          // Save HTML for PDF conversion
          const htmlKey = `documents/${ctx.user.id}/${input.documentId}.html`;
          const { url: htmlUrl } = await storagePut(htmlKey, html, 'text/html');
          
          // Update document with URLs
          await updateDocument(input.documentId, {
            markdownUrl: mdUrl,
            htmlUrl: htmlUrl,
          });
          
          return { markdownUrl: mdUrl, htmlUrl: htmlUrl, markdown };
        }
        
        throw new Error('Unsupported document type');
      }),

    // Create a new document
    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        type: z.enum(['innovation_brief', 'project_genesis', 'report', 'other']),
        content: z.string(),
        classification: z.enum(['public', 'internal', 'confidential', 'restricted']).default('internal'),
        relatedIdeaId: z.number().optional(),
        relatedProjectId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createDocument } = await import('./db');
        const documentId = `DOC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const id = await createDocument({
          documentId,
          userId: ctx.user.id,
          title: input.title,
          type: input.type,
          content: input.content,
          classification: input.classification,
          qaStatus: 'pending',
          relatedIdeaId: input.relatedIdeaId,
          relatedProjectId: input.relatedProjectId,
        });
        
        return { id, documentId };
      }),

    // Update QA status
    updateQAStatus: protectedProcedure
      .input(z.object({
        documentId: z.string(),
        status: z.enum(['approved', 'pending', 'rejected']),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { updateDocument, getDocumentById } = await import('./db');
        const doc = await getDocumentById(input.documentId);
        if (!doc || doc.userId !== ctx.user.id) {
          throw new Error('Document not found');
        }
        
        await updateDocument(input.documentId, {
          qaStatus: input.status,
          qaApprover: input.status === 'approved' ? 'Chief of Staff' : undefined,
          qaApprovedAt: input.status === 'approved' ? new Date() : undefined,
          qaNotes: input.notes,
        });
        
        return { success: true };
      }),

    // Delete a document
    delete: protectedProcedure
      .input(z.object({ documentId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const { deleteDocument, getDocumentById } = await import('./db');
        const doc = await getDocumentById(input.documentId);
        if (!doc || doc.userId !== ctx.user.id) {
          throw new Error('Document not found');
        }
        
        await deleteDocument(input.documentId);
        return { success: true };
      }),

    // Send document via email
    sendEmail: protectedProcedure
      .input(z.object({
        documentId: z.string(),
        recipients: z.array(z.object({
          email: z.string().email(),
          name: z.string().optional(),
        })),
        subject: z.string().optional(),
        message: z.string().optional(),
        includeAsLink: z.boolean().default(true),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getDocumentById } = await import('./db');
        const { generateDocumentEmailHTML, addToDocumentEmailHistory } = await import('./services/emailService');
        const { notifyOwner } = await import('./_core/notification');
        
        const doc = await getDocumentById(input.documentId);
        if (!doc || doc.userId !== ctx.user.id) {
          throw new Error('Document not found');
        }
        
        const results = [];
        
        for (const recipient of input.recipients) {
          try {
            // Generate email content
            const emailHtml = generateDocumentEmailHTML({
              documentTitle: doc.title,
              documentType: doc.type,
              senderName: ctx.user.name || 'CEPHO User',
              message: input.message,
              documentUrl: doc.pdfUrl || doc.markdownUrl || undefined,
              qaStatus: doc.qaStatus,
            });
            
            // Use notification system to send
            const subject = input.subject || `Document Shared: ${doc.title}`;
            
            // For now, notify owner about the share (in production would use email service)
            await notifyOwner({
              title: `Document shared with ${recipient.email}`,
              content: `${ctx.user.name || 'User'} shared "${doc.title}" with ${recipient.name || recipient.email}.${input.message ? ` Message: ${input.message}` : ''}`,
            });
            
            // Track in history
            addToDocumentEmailHistory({
              documentId: doc.id,
              documentTitle: doc.title,
              recipientEmail: recipient.email,
              recipientName: recipient.name,
              sentAt: new Date(),
              sentBy: ctx.user.id,
              status: 'sent',
            });
            
            results.push({
              success: true,
              recipientEmail: recipient.email,
              messageId: `msg_${Date.now()}`,
            });
          } catch (error) {
            results.push({
              success: false,
              recipientEmail: recipient.email,
              error: error instanceof Error ? error.message : 'Failed to send',
            });
          }
        }
        
        return {
          sent: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
          results,
        };
      }),

    // Get email history for a document
    getEmailHistory: protectedProcedure
      .input(z.object({ documentId: z.string() }))
      .query(async ({ ctx, input }) => {
        const { getDocumentById } = await import('./db');
        const { getDocumentEmailHistory } = await import('./services/emailService');
        
        const doc = await getDocumentById(input.documentId);
        if (!doc || doc.userId !== ctx.user.id) {
          throw new Error('Document not found');
        }
        
        return getDocumentEmailHistory(doc.id);
      }),
  }),

  // Chief of Staff Optimization Assessment
  optimization: router({
    // Get full optimization assessment
    getAssessment: protectedProcedure
      .query(async ({ ctx }) => {
        const { generateOptimizationAssessment } = await import('./services/optimizationAssessmentService');
        return generateOptimizationAssessment(ctx.user.id);
      }),

    // Get quick score only (lightweight)
    getQuickScore: protectedProcedure
      .query(async ({ ctx }) => {
        const { generateOptimizationAssessment } = await import('./services/optimizationAssessmentService');
        const assessment = await generateOptimizationAssessment(ctx.user.id);
        return {
          overallPercentage: assessment.overallPercentage,
          overallStatus: assessment.overallStatus,
          topPriorities: assessment.topPriorities.slice(0, 3),
        };
      }),
  }),

  // Subscription Tracker API
  subscriptionTracker: router({
    // Get all subscriptions for user
    getAll: protectedProcedure
      .input(z.object({
        status: z.string().optional(),
        category: z.string().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        const { getSubscriptions } = await import('./db');
        return getSubscriptions(ctx.user.id, input);
      }),

    // Get subscription by ID
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const { getSubscriptionById } = await import('./db');
        const sub = await getSubscriptionById(input.id);
        if (!sub || sub.userId !== ctx.user.id) {
          throw new Error('Subscription not found');
        }
        return sub;
      }),

    // Create a new subscription
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        provider: z.string().optional(),
        description: z.string().optional(),
        category: z.enum(['ai_ml', 'productivity', 'development', 'marketing', 'design', 'communication', 'storage', 'analytics', 'finance', 'security', 'other']).default('other'),
        cost: z.number().positive(),
        billingCycle: z.enum(['monthly', 'quarterly', 'annual', 'one_time', 'usage_based']).default('monthly'),
        currency: z.string().default('GBP'),
        status: z.enum(['active', 'paused', 'cancelled', 'trial']).default('active'),
        startDate: z.date().optional(),
        renewalDate: z.date().optional(),
        trialEndDate: z.date().optional(),
        usagePercent: z.number().min(0).max(100).optional(),
        websiteUrl: z.string().optional(),
        logoUrl: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createSubscription } = await import('./db');
        const id = await createSubscription({
          ...input,
          userId: ctx.user.id,
        });
        return { id };
      }),

    // Update a subscription
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        provider: z.string().optional(),
        description: z.string().optional(),
        category: z.enum(['ai_ml', 'productivity', 'development', 'marketing', 'design', 'communication', 'storage', 'analytics', 'finance', 'security', 'other']).optional(),
        cost: z.number().positive().optional(),
        billingCycle: z.enum(['monthly', 'quarterly', 'annual', 'one_time', 'usage_based']).optional(),
        currency: z.string().optional(),
        status: z.enum(['active', 'paused', 'cancelled', 'trial']).optional(),
        startDate: z.date().optional(),
        renewalDate: z.date().optional(),
        trialEndDate: z.date().optional(),
        usagePercent: z.number().min(0).max(100).optional(),
        websiteUrl: z.string().optional(),
        logoUrl: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getSubscriptionById, updateSubscription } = await import('./db');
        const sub = await getSubscriptionById(input.id);
        if (!sub || sub.userId !== ctx.user.id) {
          throw new Error('Subscription not found');
        }
        const { id, ...data } = input;
        await updateSubscription(id, data);
        return { success: true };
      }),

    // Delete a subscription
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { getSubscriptionById, deleteSubscription } = await import('./db');
        const sub = await getSubscriptionById(input.id);
        if (!sub || sub.userId !== ctx.user.id) {
          throw new Error('Subscription not found');
        }
        await deleteSubscription(input.id);
        return { success: true };
      }),

    // Get subscription summary
    getSummary: protectedProcedure
      .query(async ({ ctx }) => {
        const { getSubscriptionSummary } = await import('./db');
        return getSubscriptionSummary(ctx.user.id);
      }),

    // Get cost history for trend chart
    getCostHistory: protectedProcedure
      .input(z.object({ months: z.number().min(1).max(24).default(12) }).optional())
      .query(async ({ ctx, input }) => {
        const { getSubscriptionCostHistory } = await import('./db');
        return getSubscriptionCostHistory(ctx.user.id, input?.months || 12);
      }),

    // Get upcoming renewal reminders
    getUpcomingRenewals: protectedProcedure
      .input(z.object({ daysAhead: z.number().min(1).max(90).default(30) }).optional())
      .query(async ({ ctx, input }) => {
        const { getUpcomingRenewals } = await import('./services/subscriptionReminderService');
        return getUpcomingRenewals(ctx.user.id, input?.daysAhead || 30);
      }),

    // Get renewal summary (count, total cost, next renewal)
    getRenewalSummary: protectedProcedure
      .query(async ({ ctx }) => {
        const { getRenewalSummary } = await import('./services/subscriptionReminderService');
        return getRenewalSummary(ctx.user.id);
      }),

    // Manually trigger reminder check and send notifications
    sendRenewalReminders: protectedProcedure
      .mutation(async ({ ctx }) => {
        const { checkAndSendReminders } = await import('./services/subscriptionReminderService');
        return checkAndSendReminders(ctx.user.id);
      }),
  }),

  // Feature Usage Analytics API
  featureAnalytics: router({
    // Track a feature usage event
    track: protectedProcedure
      .input(z.object({
        featureId: z.string(),
        action: z.enum(['view', 'interact', 'complete']).default('view'),
        metadata: z.record(z.string(), z.any()).optional(),
      }))
      .mutation(({ ctx, input }) => {
        trackFeatureUsage(
          input.featureId as FeatureId,
          ctx.user.id,
          input.action || 'view',
          input.metadata
        );
        return { success: true };
      }),

    // Get all feature usage statistics
    getStats: protectedProcedure
      .query(() => {
        return getFeatureUsageStats();
      }),

    // Get top features by usage
    getTopFeatures: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(50).default(10) }).optional())
      .query(({ input }) => {
        return getTopFeatures(input?.limit || 10);
      }),

    // Get usage breakdown by category
    getByCategory: protectedProcedure
      .query(() => {
        return getUsageByCategory();
      }),

    // Get user engagement metrics
    getUserEngagement: protectedProcedure
      .query(({ ctx }) => {
        return getUserEngagementMetrics(ctx.user.id);
      }),

    // Get analytics summary with recommendations
    getSummary: protectedProcedure
      .query(() => {
        return generateAnalyticsSummary();
      }),

    // Get available features list
    getFeatures: protectedProcedure
      .query(() => {
        return Object.values(FEATURES);
      }),
  }),

  // NPS Tracking API
  nps: router({
    // Submit NPS score
    submit: protectedProcedure
      .input(z.object({
        score: z.number().min(0).max(10),
        feedback: z.string().optional(),
        touchpoint: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { saveNpsResponse } = await import('./db');
        await saveNpsResponse(ctx.user.id, input.score, input.feedback, input.touchpoint);
        return { success: true };
      }),

    // Get NPS statistics
    getStats: protectedProcedure
      .query(async () => {
        const { getNpsStats } = await import('./db');
        return getNpsStats();
      }),
  }),

  // Partnership Pipeline API
  partnerships: router({
    // Get all partnerships
    list: protectedProcedure
      .input(z.object({
        status: z.enum(['prospect', 'contacted', 'negotiating', 'active', 'inactive', 'churned']).optional(),
      }).optional())
      .query(async ({ input }) => {
        const { getPartnerships } = await import('./db');
        return getPartnerships(input?.status);
      }),

    // Create a new partnership
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        type: z.enum(['technology', 'distribution', 'strategic', 'integration', 'referral']),
        status: z.enum(['prospect', 'contacted', 'negotiating', 'active', 'inactive', 'churned']),
        priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
        contactName: z.string().optional(),
        contactEmail: z.string().email().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { createPartnership } = await import('./db');
        await createPartnership(input);
        return { success: true };
      }),
  }),

  // Team Capability Matrix API
  teamCapabilities: router({
    // Get all team capabilities
    list: protectedProcedure
      .query(async () => {
        const { getTeamCapabilities } = await import('./db');
        return getTeamCapabilities();
      }),

    // Add a team capability
    add: protectedProcedure
      .input(z.object({
        teamMember: z.string(),
        role: z.string(),
        skillCategory: z.string(),
        skillName: z.string(),
        currentLevel: z.number().min(1).max(5),
        targetLevel: z.number().min(1).max(5).optional(),
        developmentPlan: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { addTeamCapability } = await import('./db');
        await addTeamCapability(input);
        return { success: true };
      }),
  }),

  // Customer Health API
  customerHealth: router({
    // Update customer health
    update: protectedProcedure
      .input(z.object({
        healthScore: z.number().min(0).max(100),
        engagementLevel: z.enum(['low', 'medium', 'high', 'champion']),
      }))
      .mutation(async ({ ctx, input }) => {
        const { updateCustomerHealth } = await import('./db');
        await updateCustomerHealth(ctx.user.id, input.healthScore, input.engagementLevel);
        return { success: true };
      }),

    // Get customer health stats
    getStats: protectedProcedure
      .query(async () => {
        const { getCustomerHealthStats } = await import('./db');
        return getCustomerHealthStats();
      }),
  }),

  // Digital Twin Questionnaire API
  questionnaire: router({
    // Save a single response
    saveResponse: protectedProcedure
      .input(z.object({
        questionId: z.string(),
        questionType: z.enum(['scale', 'boolean']),
        scaleValue: z.number().min(1).max(10).optional(),
        booleanValue: z.boolean().optional(),
        section: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { saveQuestionnaireResponse } = await import('./db');
        return saveQuestionnaireResponse({
          userId: ctx.user.id,
          questionId: input.questionId,
          questionType: input.questionType,
          scaleValue: input.scaleValue,
          booleanValue: input.booleanValue,
          section: input.section,
        });
      }),

    // Save bulk responses
    saveBulk: protectedProcedure
      .input(z.object({
        responses: z.array(z.object({
          questionId: z.string(),
          questionType: z.enum(['scale', 'boolean']),
          scaleValue: z.number().min(1).max(10).optional(),
          booleanValue: z.boolean().optional(),
          section: z.string().optional(),
        })),
      }))
      .mutation(async ({ ctx, input }) => {
        const { saveBulkQuestionnaireResponses } = await import('./db');
        const savedCount = await saveBulkQuestionnaireResponses(ctx.user.id, input.responses);
        return { savedCount };
      }),

    // Get all responses for user
    getResponses: protectedProcedure
      .query(async ({ ctx }) => {
        const { getQuestionnaireResponses } = await import('./db');
        return getQuestionnaireResponses(ctx.user.id);
      }),

    // Get completion percentage
    getCompletion: protectedProcedure
      .query(async ({ ctx }) => {
        const { getQuestionnaireCompletionPercentage } = await import('./db');
        return { percentage: await getQuestionnaireCompletionPercentage(ctx.user.id) };
      }),

    // Get digital twin profile
    getProfile: protectedProcedure
      .query(async ({ ctx }) => {
        const { getDigitalTwinProfile } = await import('./db');
        return getDigitalTwinProfile(ctx.user.id);
      }),

    // Calculate and update profile from responses
    calculateProfile: protectedProcedure
      .mutation(async ({ ctx }) => {
        const { calculateDigitalTwinProfile } = await import('./db');
        return calculateDigitalTwinProfile(ctx.user.id);
      }),
  }),
});
export type AppRouter = typeof appRouter;
