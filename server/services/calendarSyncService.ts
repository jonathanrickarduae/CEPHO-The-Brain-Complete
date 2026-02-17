/**
 * Calendar Sync Service
 * 
 * Integrates with Google Calendar and Microsoft Outlook to sync events
 * for smart Evening Review prompting and schedule awareness.
 */

import { getDb } from "../db";
import { calendarEventsCache, integrations } from "../../drizzle/schema";
import { eq, and, gte, lte } from "drizzle-orm";

// Calendar provider types
export type CalendarProvider = "google" | "outlook" | "manual";

interface CalendarEvent {
  externalId: string;
  title: string;
  startTime: Date;
  endTime: Date;
  isAllDay: boolean;
  location?: string;
  attendees?: { email: string; name?: string; status?: string }[];
  metadata?: Record<string, any>;
}

interface SyncResult {
  provider: CalendarProvider;
  eventsAdded: number;
  eventsUpdated: number;
  eventsRemoved: number;
  lastSyncTime: Date;
  error?: string;
}

/**
 * Fetch events from Google Calendar API
 */
async function fetchGoogleCalendarEvents(
  accessToken: string,
  timeMin: Date,
  timeMax: Date
): Promise<CalendarEvent[]> {
  const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
  url.searchParams.set("timeMin", timeMin.toISOString());
  url.searchParams.set("timeMax", timeMax.toISOString());
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");
  url.searchParams.set("maxResults", "100");

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google Calendar API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  
  return (data.items || []).map((event: any) => ({
    externalId: event.id,
    title: event.summary || "Untitled Event",
    startTime: new Date(event.start?.dateTime || event.start?.date),
    endTime: new Date(event.end?.dateTime || event.end?.date),
    isAllDay: !event.start?.dateTime,
    location: event.location,
    attendees: event.attendees?.map((a: any) => ({
      email: a.email,
      name: a.displayName,
      status: a.responseStatus,
    })),
    metadata: {
      htmlLink: event.htmlLink,
      status: event.status,
      organizer: event.organizer,
      recurringEventId: event.recurringEventId,
    },
  }));
}

/**
 * Fetch events from Microsoft Outlook/Graph API
 */
async function fetchOutlookCalendarEvents(
  accessToken: string,
  timeMin: Date,
  timeMax: Date
): Promise<CalendarEvent[]> {
  const url = new URL("https://graph.microsoft.com/v1.0/me/calendarview");
  url.searchParams.set("startDateTime", timeMin.toISOString());
  url.searchParams.set("endDateTime", timeMax.toISOString());
  url.searchParams.set("$orderby", "start/dateTime");
  url.searchParams.set("$top", "100");
  url.searchParams.set("$select", "id,subject,start,end,isAllDay,location,attendees,webLink,organizer");

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Microsoft Graph API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  
  return (data.value || []).map((event: any) => ({
    externalId: event.id,
    title: event.subject || "Untitled Event",
    startTime: new Date(event.start?.dateTime + "Z"),
    endTime: new Date(event.end?.dateTime + "Z"),
    isAllDay: event.isAllDay || false,
    location: event.location?.displayName,
    attendees: event.attendees?.map((a: any) => ({
      email: a.emailAddress?.address,
      name: a.emailAddress?.name,
      status: a.status?.response,
    })),
    metadata: {
      webLink: event.webLink,
      organizer: event.organizer,
    },
  }));
}

/**
 * Get stored calendar integration for a user
 */
export async function getCalendarIntegration(
  userId: number,
  provider: CalendarProvider
): Promise<{ accessToken: string; refreshToken?: string; expiresAt?: Date } | null> {
  const db = await getDb();
  if (!db) return null;

  const providerName = provider === "google" ? "google" : "outlook";

  const result = await db
    .select()
    .from(integrations)
    .where(
      and(
        eq(integrations.userId, userId),
        eq(integrations.provider, providerName),
        eq(integrations.status, "active")
      )
    )
    .limit(1);

  if (result.length === 0) return null;

  const integration = result[0];

  return {
    accessToken: integration.accessToken || "",
    refreshToken: integration.refreshToken || undefined,
    expiresAt: integration.tokenExpiresAt || undefined,
  };
}

/**
 * Sync calendar events from a provider
 */
export async function syncCalendarEvents(
  userId: number,
  provider: CalendarProvider,
  daysAhead: number = 7
): Promise<SyncResult> {
  const db = await getDb();
  if (!db) {
    return {
      provider,
      eventsAdded: 0,
      eventsUpdated: 0,
      eventsRemoved: 0,
      lastSyncTime: new Date(),
      error: "Database not available",
    };
  }

  // Get integration credentials
  const integration = await getCalendarIntegration(userId, provider);
  if (!integration) {
    return {
      provider,
      eventsAdded: 0,
      eventsUpdated: 0,
      eventsRemoved: 0,
      lastSyncTime: new Date(),
      error: `No ${provider} calendar integration found`,
    };
  }

  const now = new Date();
  const timeMin = new Date(now);
  timeMin.setHours(0, 0, 0, 0);
  const timeMax = new Date(now);
  timeMax.setDate(timeMax.getDate() + daysAhead);
  timeMax.setHours(23, 59, 59, 999);

  let events: CalendarEvent[] = [];
  
  try {
    if (provider === "google") {
      events = await fetchGoogleCalendarEvents(integration.accessToken, timeMin, timeMax);
    } else if (provider === "outlook") {
      events = await fetchOutlookCalendarEvents(integration.accessToken, timeMin, timeMax);
    }
  } catch (error) {
    console.error(`Failed to fetch ${provider} calendar events:`, error);
    return {
      provider,
      eventsAdded: 0,
      eventsUpdated: 0,
      eventsRemoved: 0,
      lastSyncTime: new Date(),
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  // Get existing events for this user and provider
  const existingEvents = await db
    .select()
    .from(calendarEventsCache)
    .where(
      and(
        eq(calendarEventsCache.userId, userId),
        eq(calendarEventsCache.source, provider)
      )
    );

  const existingMap = new Map(existingEvents.map(e => [e.externalId, e]));
  const newEventIds = new Set(events.map(e => e.externalId));

  let eventsAdded = 0;
  let eventsUpdated = 0;
  let eventsRemoved = 0;

  // Upsert events
  for (const event of events) {
    const existing = existingMap.get(event.externalId);
    
    if (existing) {
      // Update existing event
      await db
        .update(calendarEventsCache)
        .set({
          title: event.title,
          startTime: event.startTime,
          endTime: event.endTime,
          isAllDay: event.isAllDay,
          location: event.location,
          attendees: event.attendees,
          metadata: event.metadata,
          syncedAt: new Date(),
        })
        .where(eq(calendarEventsCache.id, existing.id));
      eventsUpdated++;
    } else {
      // Insert new event
      await db.insert(calendarEventsCache).values({
        userId,
        externalId: event.externalId,
        title: event.title,
        startTime: event.startTime,
        endTime: event.endTime,
        isAllDay: event.isAllDay,
        location: event.location,
        attendees: event.attendees,
        source: provider,
        metadata: event.metadata,
        syncedAt: new Date(),
      });
      eventsAdded++;
    }
  }

  // Remove events that no longer exist in the calendar
  for (const existing of existingEvents) {
    if (existing.externalId && !newEventIds.has(existing.externalId)) {
      await db
        .delete(calendarEventsCache)
        .where(eq(calendarEventsCache.id, existing.id));
      eventsRemoved++;
    }
  }

  return {
    provider,
    eventsAdded,
    eventsUpdated,
    eventsRemoved,
    lastSyncTime: new Date(),
  };
}

/**
 * Get cached calendar events for a time range
 */
export async function getCachedEvents(
  userId: number,
  startTime: Date,
  endTime: Date,
  provider?: CalendarProvider
): Promise<CalendarEvent[]> {
  const db = await getDb();
  if (!db) return [];

  const conditions = [
    eq(calendarEventsCache.userId, userId),
    gte(calendarEventsCache.startTime, startTime),
    lte(calendarEventsCache.endTime, endTime),
  ];

  if (provider) {
    conditions.push(eq(calendarEventsCache.source, provider));
  }

  const events = await db
    .select()
    .from(calendarEventsCache)
    .where(and(...conditions))
    .orderBy(calendarEventsCache.startTime);

  return events.map(e => ({
    externalId: e.externalId || "",
    title: e.title,
    startTime: e.startTime,
    endTime: e.endTime,
    isAllDay: e.isAllDay,
    location: e.location || undefined,
    attendees: e.attendees as any,
    metadata: e.metadata as any,
  }));
}

/**
 * Check if user has any events during a time window
 */
export async function hasEventsInTimeWindow(
  userId: number,
  windowStart: Date,
  windowEnd: Date
): Promise<boolean> {
  const events = await getCachedEvents(userId, windowStart, windowEnd);
  return events.length > 0;
}

/**
 * Get the next free time slot for a user
 */
export async function getNextFreeSlot(
  userId: number,
  startFrom: Date,
  durationMinutes: number = 30
): Promise<{ start: Date; end: Date } | null> {
  const endSearch = new Date(startFrom);
  endSearch.setDate(endSearch.getDate() + 7); // Search up to 7 days ahead

  const events = await getCachedEvents(userId, startFrom, endSearch);
  
  if (events.length === 0) {
    return {
      start: startFrom,
      end: new Date(startFrom.getTime() + durationMinutes * 60000),
    };
  }

  // Sort events by start time
  events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  // Check if there's a slot before the first event
  if (events[0].startTime.getTime() - startFrom.getTime() >= durationMinutes * 60000) {
    return {
      start: startFrom,
      end: new Date(startFrom.getTime() + durationMinutes * 60000),
    };
  }

  // Check gaps between events
  for (let i = 0; i < events.length - 1; i++) {
    const gapStart = events[i].endTime;
    const gapEnd = events[i + 1].startTime;
    const gapDuration = gapEnd.getTime() - gapStart.getTime();

    if (gapDuration >= durationMinutes * 60000) {
      return {
        start: gapStart,
        end: new Date(gapStart.getTime() + durationMinutes * 60000),
      };
    }
  }

  // Check after the last event
  const lastEventEnd = events[events.length - 1].endTime;
  if (lastEventEnd < endSearch) {
    return {
      start: lastEventEnd,
      end: new Date(lastEventEnd.getTime() + durationMinutes * 60000),
    };
  }

  return null;
}

/**
 * Get today's schedule summary for a user
 */
export async function getTodayScheduleSummary(userId: number): Promise<{
  totalEvents: number;
  busyHours: number;
  nextEvent?: { title: string; startTime: Date; location?: string };
  freeSlots: { start: Date; end: Date }[];
}> {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const events = await getCachedEvents(userId, startOfDay, endOfDay);
  
  // Calculate busy hours
  let busyMinutes = 0;
  for (const event of events) {
    if (!event.isAllDay) {
      const duration = event.endTime.getTime() - event.startTime.getTime();
      busyMinutes += duration / 60000;
    }
  }

  // Find next event
  const upcomingEvents = events.filter(e => e.startTime > now);
  const nextEvent = upcomingEvents.length > 0
    ? {
        title: upcomingEvents[0].title,
        startTime: upcomingEvents[0].startTime,
        location: upcomingEvents[0].location,
      }
    : undefined;

  // Find free slots (simplified - just gaps between events)
  const freeSlots: { start: Date; end: Date }[] = [];
  const sortedEvents = events.filter(e => !e.isAllDay).sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  
  let currentTime = now;
  for (const event of sortedEvents) {
    if (event.startTime > currentTime) {
      freeSlots.push({ start: currentTime, end: event.startTime });
    }
    currentTime = event.endTime > currentTime ? event.endTime : currentTime;
  }
  
  // Add remaining time until end of day
  if (currentTime < endOfDay) {
    freeSlots.push({ start: currentTime, end: endOfDay });
  }

  return {
    totalEvents: events.length,
    busyHours: Math.round(busyMinutes / 60 * 10) / 10,
    nextEvent,
    freeSlots: freeSlots.slice(0, 5), // Limit to 5 slots
  };
}

/**
 * Add a manual calendar event (for users without calendar integration)
 */
export async function addManualEvent(
  userId: number,
  event: Omit<CalendarEvent, "externalId">
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const externalId = `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const result = await db.insert(calendarEventsCache).values({
    userId,
    externalId,
    title: event.title,
    startTime: event.startTime,
    endTime: event.endTime,
    isAllDay: event.isAllDay,
    location: event.location,
    attendees: event.attendees,
    source: "manual",
    metadata: event.metadata,
    syncedAt: new Date(),
  });

  return result[0].insertId;
}
