import { ENV } from "../_core/env";

const CALENDLY_API_BASE = "https://api.calendly.com";

function getHeaders(apiKey?: string) {
  return {
    Authorization: `Bearer ${apiKey ?? ENV.calendlyApiKey}`,
    "Content-Type": "application/json",
  };
}

export interface CalendlyUser {
  uri: string;
  name: string;
  email: string;
  schedulingUrl: string;
  timezone: string;
}

export interface CalendlyEvent {
  uri: string;
  name: string;
  status: string;
  startTime: string;
  endTime: string;
  location: Record<string, unknown>;
  inviteesCounter: { total: number; active: number; limit: number };
  eventType: string;
}

export interface CalendlyInvitee {
  uri: string;
  email: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export class CalendlyService {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey ?? ENV.calendlyApiKey;
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /** Get current user info */
  async getCurrentUser(): Promise<CalendlyUser> {
    const res = await fetch(`${CALENDLY_API_BASE}/users/me`, {
      headers: getHeaders(this.apiKey),
    });
    if (!res.ok)
      throw new Error(`Calendly getCurrentUser failed: ${res.statusText}`);
    const data = await res.json();
    const u = data.resource;
    return {
      uri: u.uri,
      name: u.name,
      email: u.email,
      schedulingUrl: u.scheduling_url,
      timezone: u.timezone,
    };
  }

  /** List scheduled events for the user */
  async listEvents(
    userUri: string,
    options?: {
      minStartTime?: string;
      maxStartTime?: string;
      status?: "active" | "canceled";
      count?: number;
    }
  ): Promise<CalendlyEvent[]> {
    const params = new URLSearchParams({ user: userUri });
    if (options?.minStartTime)
      params.set("min_start_time", options.minStartTime);
    if (options?.maxStartTime)
      params.set("max_start_time", options.maxStartTime);
    if (options?.status) params.set("status", options.status);
    if (options?.count) params.set("count", String(options.count));

    const res = await fetch(
      `${CALENDLY_API_BASE}/scheduled_events?${params.toString()}`,
      { headers: getHeaders(this.apiKey) }
    );
    if (!res.ok)
      throw new Error(`Calendly listEvents failed: ${res.statusText}`);
    const data = await res.json();
    return (data.collection ?? []).map((e: Record<string, unknown>) => ({
      uri: e.uri as string,
      name: e.name as string,
      status: e.status as string,
      startTime: e.start_time as string,
      endTime: e.end_time as string,
      location: (e.location ?? {}) as Record<string, unknown>,
      inviteesCounter: e.invitees_counter as {
        total: number;
        active: number;
        limit: number;
      },
      eventType: e.event_type as string,
    }));
  }

  /** Get invitees for a specific event */
  async getEventInvitees(eventUri: string): Promise<CalendlyInvitee[]> {
    // Extract event UUID from URI
    const eventUuid = eventUri.split("/").pop();
    const res = await fetch(
      `${CALENDLY_API_BASE}/scheduled_events/${eventUuid}/invitees`,
      { headers: getHeaders(this.apiKey) }
    );
    if (!res.ok)
      throw new Error(`Calendly getEventInvitees failed: ${res.statusText}`);
    const data = await res.json();
    return (data.collection ?? []).map((i: Record<string, unknown>) => ({
      uri: i.uri as string,
      email: i.email as string,
      name: i.name as string,
      status: i.status as string,
      createdAt: i.created_at as string,
      updatedAt: i.updated_at as string,
    }));
  }

  /** List event types for the user */
  async listEventTypes(userUri: string) {
    const params = new URLSearchParams({ user: userUri });
    const res = await fetch(
      `${CALENDLY_API_BASE}/event_types?${params.toString()}`,
      { headers: getHeaders(this.apiKey) }
    );
    if (!res.ok)
      throw new Error(`Calendly listEventTypes failed: ${res.statusText}`);
    return res.json();
  }

  /** Get upcoming events for today */
  async getTodaysEvents(): Promise<CalendlyEvent[]> {
    const user = await this.getCurrentUser();
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    return this.listEvents(user.uri, {
      minStartTime: now.toISOString(),
      maxStartTime: endOfDay.toISOString(),
      status: "active",
    });
  }

  /** Test connection */
  async testConnection(): Promise<{
    ok: boolean;
    name?: string;
    email?: string;
    error?: string;
  }> {
    try {
      const user = await this.getCurrentUser();
      return { ok: true, name: user.name, email: user.email };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  }
}

export const calendlyService = new CalendlyService();
