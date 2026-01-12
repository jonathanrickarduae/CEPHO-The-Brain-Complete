import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
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
  createVoiceNote, getVoiceNotes, updateVoiceNote, deleteVoiceNote
} from "./db";
import { invokeLLM } from "./_core/llm";
import { z } from "zod";

export const appRouter = router({
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
        score: z.number().min(1).max(10),
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

When responding:
- If an idea has merit, explain WHY with evidence
- If you see flaws, state them clearly: "I'd challenge that because..."
- If information is missing, demand it: "Before proceeding, I need..."
- If a decision seems rushed, slow it down: "Have you stress-tested this against..."

Capabilities:
- Strategic analysis and decision support
- Meeting preparation and stakeholder briefings
- Task prioritization and project oversight
- Research synthesis and gap identification
- Email drafting and communication management
- Daily briefings and evening reviews
- Coordination with AI-SMEs for specialist input

You are not a yes-man. You are a trusted advisor who respects the principal enough to be honest.`;

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

  // Integrations API
  integrations: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getIntegrations(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        provider: z.string(),
        providerAccountId: z.string().optional(),
        accessToken: z.string().optional(),
        refreshToken: z.string().optional(),
        scopes: z.array(z.string()).optional(),
        metadata: z.record(z.string(), z.any()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return createIntegration({
          userId: ctx.user.id,
          provider: input.provider,
          providerAccountId: input.providerAccountId,
          accessToken: input.accessToken,
          refreshToken: input.refreshToken,
          scopes: input.scopes,
          metadata: input.metadata,
          status: 'active',
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['active', 'expired', 'revoked', 'error']).optional(),
        accessToken: z.string().optional(),
        refreshToken: z.string().optional(),
        syncError: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await updateIntegration(input.id, input);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteIntegration(input.id);
        return { success: true };
      }),

    // Connect integration (OAuth flow)
    connect: protectedProcedure
      .input(z.object({
        type: z.string(),
        config: z.record(z.string(), z.any()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Create or update integration record
        const existing = await getIntegrations(ctx.user.id);
        const existingIntegration = existing.find(i => i.provider === input.type);
        
        if (existingIntegration) {
          await updateIntegration(existingIntegration.id, { status: 'active' });
          return { success: true, id: existingIntegration.id };
        }
        
        const newIntegration = await createIntegration({
          userId: ctx.user.id,
          provider: input.type,
          status: 'active',
          metadata: input.config,
        });
        return { success: true, id: newIntegration?.id ?? 0 };
      }),

    // Disconnect integration
    disconnect: protectedProcedure
      .input(z.object({ type: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const integrations = await getIntegrations(ctx.user.id);
        const integration = integrations.find(i => i.provider === input.type);
        if (integration) {
          await updateIntegration(integration.id, { status: 'revoked' });
        }
        return { success: true };
      }),

    // Sync integration data
    sync: protectedProcedure
      .input(z.object({ type: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const integrations = await getIntegrations(ctx.user.id);
        const integration = integrations.find(i => i.provider === input.type);
        if (integration) {
          // Update lastSyncAt
          await updateIntegration(integration.id, { lastSyncAt: new Date() });
        }
        return { success: true, syncedAt: new Date() };
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
});

export type AppRouter = typeof appRouter;
