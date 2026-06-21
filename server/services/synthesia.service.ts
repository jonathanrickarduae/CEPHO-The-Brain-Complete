import { ENV } from "../_core/env";

const SYNTHESIA_API_BASE = "https://api.synthesia.io/v2";

function getHeaders(apiKey?: string) {
  return {
    Authorization: apiKey ?? ENV.synthesiaApiKey,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

export interface SynthesiaAvatar {
  id: string;
  name: string;
  visibility: string;
  createdAt: string;
}

export interface SynthesiaVideo {
  id: string;
  title: string;
  status: "in_progress" | "complete" | "failed";
  duration: number | null;
  downloadUrl: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVideoOptions {
  title: string;
  description?: string;
  visibility?: "public" | "private";
  test?: boolean;
  input: Array<{
    avatarId?: string;
    avatarSettings?: {
      horizontalAlign?: "left" | "center" | "right";
      scale?: number;
      style?: "rectangular" | "circle" | "square";
      seamless?: boolean;
    };
    backgroundId?: string;
    backgroundColor?: string;
    voiceId?: string;
    voiceStyle?: string;
    script: string;
    scriptType?: "text" | "ssml";
  }>;
}

export class SynthesiaService {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey ?? ENV.synthesiaApiKey;
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /** List available avatars */
  async listAvatars(): Promise<SynthesiaAvatar[]> {
    const res = await fetch(`${SYNTHESIA_API_BASE}/avatars`, {
      headers: getHeaders(this.apiKey),
    });
    if (!res.ok)
      throw new Error(`Synthesia listAvatars failed: ${res.statusText}`);
    const data = await res.json();
    return (data.avatars ?? []).map((a: Record<string, unknown>) => ({
      id: a.id as string,
      name: a.name as string,
      visibility: a.visibility as string,
      createdAt: a.createdAt as string,
    }));
  }

  /** Create a video */
  async createVideo(options: CreateVideoOptions): Promise<SynthesiaVideo> {
    const res = await fetch(`${SYNTHESIA_API_BASE}/videos`, {
      method: "POST",
      headers: getHeaders(this.apiKey),
      body: JSON.stringify(options),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Synthesia createVideo failed: ${res.status} ${err}`);
    }
    return this.mapVideo(await res.json());
  }

  /** Get video status */
  async getVideo(videoId: string): Promise<SynthesiaVideo> {
    const res = await fetch(`${SYNTHESIA_API_BASE}/videos/${videoId}`, {
      headers: getHeaders(this.apiKey),
    });
    if (!res.ok)
      throw new Error(`Synthesia getVideo failed: ${res.statusText}`);
    return this.mapVideo(await res.json());
  }

  /** List all videos */
  async listVideos(): Promise<SynthesiaVideo[]> {
    const res = await fetch(`${SYNTHESIA_API_BASE}/videos`, {
      headers: getHeaders(this.apiKey),
    });
    if (!res.ok)
      throw new Error(`Synthesia listVideos failed: ${res.statusText}`);
    const data = await res.json();
    return (data.videos ?? []).map((v: Record<string, unknown>) =>
      this.mapVideo(v)
    );
  }

  /** Delete a video */
  async deleteVideo(videoId: string): Promise<void> {
    const res = await fetch(`${SYNTHESIA_API_BASE}/videos/${videoId}`, {
      method: "DELETE",
      headers: getHeaders(this.apiKey),
    });
    if (!res.ok)
      throw new Error(`Synthesia deleteVideo failed: ${res.statusText}`);
  }

  private mapVideo(v: Record<string, unknown>): SynthesiaVideo {
    return {
      id: v.id as string,
      title: v.title as string,
      status: v.status as "in_progress" | "complete" | "failed",
      duration: (v.duration as number) ?? null,
      downloadUrl: (v.download as string) ?? null,
      thumbnailUrl: (v.thumbnail as string) ?? null,
      createdAt: v.createdAt as string,
      updatedAt: v.updatedAt as string,
    };
  }

  /** Test connection by listing avatars */
  async testConnection(): Promise<{
    ok: boolean;
    avatarCount?: number;
    error?: string;
  }> {
    try {
      const avatars = await this.listAvatars();
      return { ok: true, avatarCount: avatars.length };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  }
}

export const synthesiaService = new SynthesiaService();
