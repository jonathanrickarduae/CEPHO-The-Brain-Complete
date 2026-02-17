import { router, protectedProcedure } from "../../_core/trpc";
import { z } from "zod";
import { moodService } from "../../services/mood";

export const moodRouter = router({
  // Create a new mood entry
  create: protectedProcedure
    .input(z.object({
      score: z.number().min(0).max(100),
      timeOfDay: z.enum(['morning', 'afternoon', 'evening']),
      note: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const entry = await moodService.recordMood(ctx.user.id, {
        score: input.score,
        timeOfDay: input.timeOfDay,
        note: input.note,
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
      return moodService.getMoodHistory(ctx.user.id, input?.limit, input?.days);
    }),

  // Get mood trends/analytics
  trends: protectedProcedure
    .input(z.object({
      days: z.number().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      return moodService.getMoodTrends(ctx.user.id, input?.days || 30);
    }),

  // Check if mood was already recorded for a time period today
  lastCheck: protectedProcedure
    .input(z.object({
      timeOfDay: z.enum(['morning', 'afternoon', 'evening']),
    }))
    .query(async ({ ctx, input }) => {
      return moodService.getLastMoodCheck(ctx.user.id, input.timeOfDay);
    }),
});
