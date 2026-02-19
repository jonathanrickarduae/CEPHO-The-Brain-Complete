/**
 * PHASE 1 ROUTER - Core inline routers
 * Safe routers that don't depend on complex domain services
 */

import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { 
  createMoodEntry, getMoodHistory, getMoodTrends, getLastMoodCheck,
  createNotification, getNotifications, markNotificationRead, markAllNotificationsRead,
  createProject, getProjects, updateProject,
  getUserSettings, upsertUserSettings,
} from "./db/index";

export const appRouter = router({
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
  
  health: publicProcedure.query(() => {
    return { status: "ok", timestamp: new Date().toISOString() };
  }),

  // Mood tracking API
  mood: router({
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

    trends: protectedProcedure
      .input(z.object({
        days: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        return getMoodTrends(ctx.user.id, input?.days || 30);
      }),

    lastCheck: protectedProcedure
      .input(z.object({
        timeOfDay: z.enum(['morning', 'afternoon', 'evening']),
      }))
      .query(async ({ ctx, input }) => {
        return getLastMoodCheck(ctx.user.id, input.timeOfDay);
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
        dueDate: z.date().optional(),
        assignedExperts: z.array(z.string()).optional(),
      }))
      .mutation(async ({ input }) => {
        await updateProject(input.id, input);
        return { success: true };
      }),
  }),

  // Settings API
  settings: router({
    get: protectedProcedure
      .query(async ({ ctx }) => {
        return getUserSettings(ctx.user.id);
      }),

    update: protectedProcedure
      .input(z.object({
        theme: z.enum(['light', 'dark', 'auto']).optional(),
        language: z.string().optional(),
        timezone: z.string().optional(),
        emailNotifications: z.boolean().optional(),
        pushNotifications: z.boolean().optional(),
        weeklyDigest: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return upsertUserSettings(ctx.user.id, input);
      }),
  }),
});

export type AppRouter = typeof appRouter;
