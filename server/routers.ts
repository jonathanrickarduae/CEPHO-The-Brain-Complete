import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { createMoodEntry, getMoodHistory, getMoodTrends, getLastMoodCheck, saveConversation, getConversationHistory, clearConversationHistory } from "./db";
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
});

export type AppRouter = typeof appRouter;
