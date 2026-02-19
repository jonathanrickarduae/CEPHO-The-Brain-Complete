import { openClawRouter } from "./openclaw-router";
import { integrationsRouter } from "./routers/integrations.router";
import { projectGenesisRouter } from "./routers/project-genesis.router";
import { qualityGatesRouter } from "./routers/quality-gates.router";
import { blueprintRouter } from "./routers/blueprint.router";
import { smeRouter } from "./routers/sme.router";
import { digitalTwinRouter } from "./routers/digital-twin.router";
import { digitalTwinTrainingRouter } from "./routers/digital-twin-training.router";
import { blueprintsRouter } from "./routers/blueprints.router";
import { chiefOfStaffRouter } from "./routers/chief-of-staff.router";
import { deepDiveRouter } from "./routers/deep-dive.router";
import { businessPlanRouter } from "./routers/business-plan.router";
import { debugRouter } from "./routers/debug.router";
import { cleanupRouter } from "./routers/cleanup.router";
import { asanaRouter } from "./routers/asana.router";
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
} from "./db/index";
import { getDb } from "./db/index";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { invokeLLM } from "./_core/llm";
import { chatWithExpert } from "./services/expert-chat.service";
import { textToSpeech, getExpertVoiceInfo, hasCustomVoice } from "./services/voice.service";
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

// Extracted domain routers
import { expertEvolutionRouter } from "./routers/domains/expert-evolution.router";
import { businessPlanReviewRouter } from "./routers/domains/business-plan-review.router";
import { documentLibraryRouter } from "./routers/domains/document-library.router";
import { collaborativeReviewRouter } from "./routers/domains/collaborative-review.router";
import { innovationRouter } from "./routers/domains/innovation.router";
import { innovationHubWorkflowRouter } from "./routers/innovation-hub-workflow.router";
import { expertRecommendationRouter } from "./routers/domains/expert-recommendation.router";
import { libraryRouter } from "./routers/domains/library.router";
import { eveningReviewRouter } from "./routers/domains/evening-review.router";
import { subscriptionTrackerRouter } from "./routers/domains/subscription-tracker.router";
import { expertChatRouter } from "./routers/domains/expert-chat.router";
import { chatRouter } from "./routers/domains/chat.router";
import { calendarRouter } from "./routers/domains/calendar.router";
import { genesisRouter } from "./routers/domains/genesis.router";
import { qaRouter } from "./routers/domains/qa.router";
import { expertConsultationRouter } from "./routers/domains/expert-consultation.router";


export const appRouter = router({
  expertEvolution: expertEvolutionRouter,
  businessPlanReview: businessPlanReviewRouter,
  documentLibrary: documentLibraryRouter,
  collaborativeReview: collaborativeReviewRouter,
  innovation: innovationRouter,
  innovationHubWorkflow: innovationHubWorkflowRouter,
  digitalTwinTraining: digitalTwinTrainingRouter,
  expertRecommendation: expertRecommendationRouter,
  library: libraryRouter,
  eveningReview: eveningReviewRouter,
  subscriptionTracker: subscriptionTrackerRouter,
  expertChat: expertChatRouter,
  chat: chatRouter,
  calendar: calendarRouter,
  genesis: genesisRouter,
  qa: qaRouter,
  expertConsultation: expertConsultationRouter,
  openClaw: openClawRouter,
  integrations: integrationsRouter,
  projectGenesis: projectGenesisRouter,
  qualityGates: qualityGatesRouter,
  blueprint: blueprintRouter,
  sme: smeRouter,
  digitalTwin: digitalTwinRouter,
  blueprints: blueprintsRouter,
  chiefOfStaff: chiefOfStaffRouter,
  deepDive: deepDiveRouter,
  businessPlan: businessPlanRouter,
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
  textToSpeech: router({
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

  // Expert Chat Sessions API

  // Expert Recommendations

  // Library Documents API

  // Business Plan Review API

  // Collaborative Review API

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
        //         const { generateMorningSignalHtml } = await import('./services/morningSignalPdfService');
        
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

  // Innovation Engine Router

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

  // Chief of Staff Optimization Assessment
  optimization: router({
    // Get full optimization assessment
    getAssessment: protectedProcedure
      .query(async ({ ctx }) => {
        //         //         const { generateOptimizationAssessment } = await import('./services/optimizationAssessmentService');
        return generateOptimizationAssessment(ctx.user.id);
      }),

    // Get quick score only (lightweight)
    getQuickScore: protectedProcedure
      .query(async ({ ctx }) => {
        //         const { generateOptimizationAssessment } = await import('./services/optimizationAssessmentService');
        const assessment = await generateOptimizationAssessment(ctx.user.id);
        return {
          overallPercentage: assessment.overallPercentage,
          overallStatus: assessment.overallStatus,
          topPriorities: assessment.topPriorities.slice(0, 3),
        };
      }),
  }),

  // Subscription Tracker API

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
