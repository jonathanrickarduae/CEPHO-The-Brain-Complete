/**
 * Calendar Service
 *
 * Handles calendar event synchronization and management using the
 * calendar_events_cache table as the backing store.
 */
import { db } from "../../db";
import { calendarEventsCache, integrations } from "../../../drizzle/schema";
import { and, eq, gte, lte, lt } from "drizzle-orm";

export const calendarService = {
  async syncEvents(
    userId: number,
    provider: "google" | "outlook",
    _daysAhead?: number
  ) {
    // Update the integration's lastSyncAt timestamp
    await db
      .update(integrations)
      .set({ lastSyncAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(integrations.userId, userId),
          eq(integrations.provider, provider)
        )
      );
    return {
      success: true,
      eventsSynced: 0,
      message: `${provider} calendar sync timestamp updated. OAuth token required for live event fetch.`,
    };
  },

  async getEvents(
    userId: number,
    startTime: Date,
    endTime: Date,
    provider?: "google" | "outlook" | "manual"
  ) {
    const conditions = [
      eq(calendarEventsCache.userId, userId),
      gte(calendarEventsCache.startTime, startTime),
      lte(calendarEventsCache.startTime, endTime),
    ];
    if (provider) {
      conditions.push(eq(calendarEventsCache.source, provider));
    }
    return db
      .select()
      .from(calendarEventsCache)
      .where(and(...conditions))
      .orderBy(calendarEventsCache.startTime);
  },

  async getTodaySummary(userId: number) {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const endOfDay = new Date(startOfDay.getTime() + 86400000);

    const events = await db
      .select()
      .from(calendarEventsCache)
      .where(
        and(
          eq(calendarEventsCache.userId, userId),
          gte(calendarEventsCache.startTime, startOfDay),
          lt(calendarEventsCache.startTime, endOfDay)
        )
      )
      .orderBy(calendarEventsCache.startTime);

    const nextEvent = events.find(e => e.startTime > now) ?? null;
    return {
      totalEvents: events.length,
      nextEvent: nextEvent
        ? {
            title: nextEvent.title,
            startTime: nextEvent.startTime.toISOString(),
            location: nextEvent.location ?? null,
          }
        : null,
      freeTime: [],
    };
  },

  async hasConflicts(userId: number, windowStart: Date, windowEnd: Date) {
    const events = await db
      .select()
      .from(calendarEventsCache)
      .where(
        and(
          eq(calendarEventsCache.userId, userId),
          lte(calendarEventsCache.startTime, windowEnd),
          gte(calendarEventsCache.endTime, windowStart)
        )
      )
      .limit(1);
    return events.length > 0;
  },

  async getNextFreeSlot(
    userId: number,
    startFrom: Date,
    durationMinutes: number
  ) {
    const endSearch = new Date(startFrom.getTime() + 7 * 86400000); // search 7 days ahead
    const events = await db
      .select()
      .from(calendarEventsCache)
      .where(
        and(
          eq(calendarEventsCache.userId, userId),
          gte(calendarEventsCache.startTime, startFrom),
          lte(calendarEventsCache.startTime, endSearch)
        )
      )
      .orderBy(calendarEventsCache.startTime);

    let candidate = new Date(startFrom);
    for (const event of events) {
      const slotEnd = new Date(candidate.getTime() + durationMinutes * 60000);
      if (slotEnd <= event.startTime) break; // fits before this event
      // Move candidate to after this event
      if (event.endTime > candidate) {
        candidate = new Date(event.endTime);
      }
    }
    return {
      startTime: candidate,
      endTime: new Date(candidate.getTime() + durationMinutes * 60000),
    };
  },

  async addManualEvent(
    userId: number,
    event: {
      title: string;
      startTime: Date;
      endTime: Date;
      isAllDay: boolean;
      location?: string;
    }
  ) {
    const [row] = await db
      .insert(calendarEventsCache)
      .values({
        userId,
        title: event.title,
        startTime: event.startTime,
        endTime: event.endTime,
        isAllDay: event.isAllDay,
        location: event.location,
        source: "manual",
        syncedAt: new Date(),
      })
      .returning();
    return String(row.id);
  },

  async getIntegrationStatus(userId: number) {
    const rows = await db
      .select()
      .from(integrations)
      .where(
        and(
          eq(integrations.userId, userId)
          // provider in ('google', 'outlook')
        )
      );
    const google = rows.find(r => r.provider === "google");
    const outlook = rows.find(r => r.provider === "outlook");
    return {
      google: {
        connected: google?.status === "active",
        hasToken: !!google?.accessToken,
      },
      outlook: {
        connected: outlook?.status === "active",
        hasToken: !!outlook?.accessToken,
      },
    };
  },
};
