import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { createMoodEntry, getMoodHistory, getMoodTrends, getLastMoodCheck } from "./db";
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
});

export type AppRouter = typeof appRouter;
