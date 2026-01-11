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
  createAuditEntry, getAuditLog
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
        const systemPrompt = `You are the Digital Twin for ${ctx.user.name || 'the user'} - a highly capable AI executive assistant that learns and adapts to their preferences, communication style, and work patterns.

Your role:
- Act as a proactive personal assistant who anticipates needs
- Provide concise, actionable responses
- Remember context from previous conversations
- Suggest next steps and offer to take action
- Be professional but warm and personable
- When appropriate, ask clarifying questions before taking action
- Reference relevant past conversations and learned preferences

Capabilities you can help with:
- Email drafting and management
- Meeting scheduling and preparation
- Task prioritization and project management
- Research and analysis
- Decision support
- Daily briefings and evening reviews

Always be direct and efficient. The user is busy and values their time.`;

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
          throw new Error('Failed to get response from Digital Twin');
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
});

export type AppRouter = typeof appRouter;
