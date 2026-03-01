import { ENV } from "../_core/env";

const ZOOM_API_BASE = "https://api.zoom.us/v2";
const ZOOM_OAUTH_BASE = "https://zoom.us/oauth";

export interface ZoomMeeting {
  id: number;
  uuid: string;
  topic: string;
  type: number;
  status: string;
  startTime: string;
  duration: number;
  timezone: string;
  agenda: string;
  joinUrl: string;
  startUrl: string;
}

export interface ZoomUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  type: number;
  status: string;
  timezone: string;
}

export class ZoomService {
  private accountId: string;
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(accountId?: string, clientId?: string, clientSecret?: string) {
    this.accountId = accountId ?? ENV.zoomAccountId;
    this.clientId = clientId ?? ENV.zoomClientId;
    this.clientSecret = clientSecret ?? ENV.zoomClientSecret;
  }

  isConfigured(): boolean {
    return !!(this.accountId && this.clientId && this.clientSecret);
  }

  /** Get Server-to-Server OAuth access token */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const credentials = Buffer.from(
      `${this.clientId}:${this.clientSecret}`
    ).toString("base64");

    const res = await fetch(
      `${ZOOM_OAUTH_BASE}/token?grant_type=account_credentials&account_id=${this.accountId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (!res.ok) throw new Error(`Zoom token fetch failed: ${res.statusText}`);
    const data = await res.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    if (!this.accessToken) throw new Error("Zoom: failed to obtain access token");
    return this.accessToken;
  }

  private async authHeaders() {
    const token = await this.getAccessToken();
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  /** Get current user info */
  async getCurrentUser(): Promise<ZoomUser> {
    const res = await fetch(`${ZOOM_API_BASE}/users/me`, {
      headers: await this.authHeaders(),
    });
    if (!res.ok)
      throw new Error(`Zoom getCurrentUser failed: ${res.statusText}`);
    const u = await res.json();
    return {
      id: u.id,
      firstName: u.first_name,
      lastName: u.last_name,
      email: u.email,
      type: u.type,
      status: u.status,
      timezone: u.timezone,
    };
  }

  /** List meetings for the current user */
  async listMeetings(
    type: "scheduled" | "live" | "upcoming" = "upcoming"
  ): Promise<ZoomMeeting[]> {
    const res = await fetch(
      `${ZOOM_API_BASE}/users/me/meetings?type=${type}&page_size=50`,
      { headers: await this.authHeaders() }
    );
    if (!res.ok)
      throw new Error(`Zoom listMeetings failed: ${res.statusText}`);
    const data = await res.json();
    return (data.meetings ?? []).map((m: Record<string, unknown>) => ({
      id: m.id as number,
      uuid: m.uuid as string,
      topic: m.topic as string,
      type: m.type as number,
      status: m.status as string,
      startTime: m.start_time as string,
      duration: m.duration as number,
      timezone: m.timezone as string,
      agenda: (m.agenda as string) ?? "",
      joinUrl: m.join_url as string,
      startUrl: m.start_url as string,
    }));
  }

  /** Create a meeting */
  async createMeeting(options: {
    topic: string;
    startTime: string;
    duration: number;
    agenda?: string;
    timezone?: string;
    password?: string;
  }): Promise<ZoomMeeting> {
    const res = await fetch(`${ZOOM_API_BASE}/users/me/meetings`, {
      method: "POST",
      headers: await this.authHeaders(),
      body: JSON.stringify({
        topic: options.topic,
        type: 2, // Scheduled meeting
        start_time: options.startTime,
        duration: options.duration,
        agenda: options.agenda ?? "",
        timezone: options.timezone ?? "UTC",
        password: options.password,
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          waiting_room: true,
        },
      }),
    });
    if (!res.ok)
      throw new Error(`Zoom createMeeting failed: ${res.statusText}`);
    const m = await res.json();
    return {
      id: m.id,
      uuid: m.uuid,
      topic: m.topic,
      type: m.type,
      status: m.status,
      startTime: m.start_time,
      duration: m.duration,
      timezone: m.timezone,
      agenda: m.agenda ?? "",
      joinUrl: m.join_url,
      startUrl: m.start_url,
    };
  }

  /** Delete a meeting */
  async deleteMeeting(meetingId: number): Promise<void> {
    const res = await fetch(`${ZOOM_API_BASE}/meetings/${meetingId}`, {
      method: "DELETE",
      headers: await this.authHeaders(),
    });
    if (!res.ok)
      throw new Error(`Zoom deleteMeeting failed: ${res.statusText}`);
  }

  /** Test connection */
  async testConnection(): Promise<{ ok: boolean; email?: string; error?: string }> {
    try {
      const user = await this.getCurrentUser();
      return { ok: true, email: user.email };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  }
}

export const zoomService = new ZoomService();
