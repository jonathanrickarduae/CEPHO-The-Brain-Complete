/**
 * Calendar Router
 * 
 * Auto-extracted from monolithic routers.ts
 * 
 * @module routers/domains/calendar
 */

import { router } from "../_core/trpc";
import { z } from "zod";

export const calendarRouter = router({
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
});
