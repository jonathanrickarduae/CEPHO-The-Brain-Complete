/**
 * TEST - Library router only
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

import { libraryRouter } from "./routers/domains/library.router";

export const appRouter = router({
  library: libraryRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  
  health: publicProcedure.query(() => {
    return { status: "ok", timestamp: new Date().toISOString() };
  }),

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

    history: protectedProcedure.query(async ({ ctx }) => await getMoodHistory(ctx.user.id)),
    trends: protectedProcedure.query(async ({ ctx }) => await getMoodTrends(ctx.user.id)),
    lastCheck: protectedProcedure.query(async ({ ctx }) => await getLastMoodCheck(ctx.user.id)),
  }),

  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => await getNotifications(ctx.user.id)),
    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        message: z.string(),
        type: z.enum(['info', 'warning', 'error', 'success']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await createNotification({
          userId: ctx.user.id,
          title: input.title,
          message: input.message,
          type: input.type || 'info',
        });
      }),
    markRead: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => await markNotificationRead(input.id, ctx.user.id)),
    markAllRead: protectedProcedure.mutation(async ({ ctx }) => await markAllNotificationsRead(ctx.user.id)),
  }),

  projects: router({
    list: protectedProcedure.query(async ({ ctx }) => await getProjects(ctx.user.id)),
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await createProject({
          userId: ctx.user.id,
          name: input.name,
          description: input.description || null,
        });
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await updateProject(input.id, ctx.user.id, {
          name: input.name,
          description: input.description,
        });
      }),
  }),

  settings: router({
    get: protectedProcedure.query(async ({ ctx }) => await getUserSettings(ctx.user.id)),
    update: protectedProcedure
      .input(z.object({
        theme: z.enum(['light', 'dark', 'auto']).optional(),
        notifications: z.boolean().optional(),
        language: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => await upsertUserSettings(ctx.user.id, input)),
  }),
});

export type AppRouter = typeof appRouter;
