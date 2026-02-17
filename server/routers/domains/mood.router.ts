import { router, protectedProcedure } from "../../_core/trpc";
import { z } from "zod";
import {
  createMoodEntry,
  getMoodHistory,
  getMoodTrends,
  getLastMoodCheck,
} from "../../db";

export const moodRouter = router({
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
});
