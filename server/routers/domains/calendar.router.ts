/**
 * Calendar Router
 * 
 * Auto-extracted from monolithic routers.ts
 * 
 * @module routers/domains/calendar
 */

import { router, protectedProcedure } from "../../_core/trpc";
import { z } from "zod";
import { calendarService } from "../../services/calendar";
import { handleTRPCError } from "../../utils/error-handler";

export const calendarRouter = router({
    // Sync calendar events from a provider
    sync: protectedProcedure
      .input(z.object({
        provider: z.enum(['google', 'outlook']),
        daysAhead: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          return await calendarService.syncEvents(ctx.user.id, input.provider, input.daysAhead);
        } catch (error) {
          handleTRPCError(error, "CalendarSync");
        }
      }),

    // Get cached events for a time range
    getEvents: protectedProcedure
      .input(z.object({
        startTime: z.string(),
        endTime: z.string(),
        provider: z.enum(['google', 'outlook', 'manual']).optional(),
      }))
      .query(async ({ ctx, input }) => {
        try {
          return await calendarService.getEvents(
            ctx.user.id,
            new Date(input.startTime),
            new Date(input.endTime),
            input.provider
          );
        } catch (error) {
          handleTRPCError(error, "CalendarGetEvents");
        }
      }),

    // Get today's schedule summary
    getTodaySummary: protectedProcedure.query(async ({ ctx }) => {
      try {
        return await calendarService.getTodaySummary(ctx.user.id);
      } catch (error) {
        handleTRPCError(error, "CalendarTodaySummary");
      }
    }),

    // Check for events in a time window
    hasConflicts: protectedProcedure
      .input(z.object({
        windowStart: z.string(),
        windowEnd: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        try {
          const hasConflicts = await calendarService.hasConflicts(
            ctx.user.id,
            new Date(input.windowStart),
            new Date(input.windowEnd)
          );
          return { hasConflicts };
        } catch (error) {
          handleTRPCError(error, "CalendarConflicts");
        }
      }),

    // Get next free time slot
    getNextFreeSlot: protectedProcedure
      .input(z.object({
        startFrom: z.string().optional(),
        durationMinutes: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        try {
          return await calendarService.getNextFreeSlot(
            ctx.user.id,
            input?.startFrom ? new Date(input.startFrom) : new Date(),
            input?.durationMinutes || 30
          );
        } catch (error) {
          handleTRPCError(error, "CalendarFreeSlot");
        }
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
        try {
          const eventId = await calendarService.addManualEvent(ctx.user.id, {
            title: input.title,
            startTime: new Date(input.startTime),
            endTime: new Date(input.endTime),
            isAllDay: input.isAllDay || false,
            location: input.location,
          });
          return { eventId };
        } catch (error) {
          handleTRPCError(error, "CalendarAddEvent");
        }
      }),

    // Get calendar integration status
    getIntegrationStatus: protectedProcedure.query(async ({ ctx }) => {
      try {
        return await calendarService.getIntegrationStatus(ctx.user.id);
      } catch (error) {
        handleTRPCError(error, "CalendarIntegrationStatus");
      }
    }),
});
