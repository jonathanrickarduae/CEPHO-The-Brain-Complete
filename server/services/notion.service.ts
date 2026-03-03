import { ENV } from "../_core/env";

const NOTION_API_BASE = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

function getHeaders(apiKey?: string) {
  return {
    Authorization: `Bearer ${apiKey ?? ENV.notionApiKey}`,
    "Content-Type": "application/json",
    "Notion-Version": NOTION_VERSION,
  };
}

export interface NotionPage {
  id: string;
  title: string;
  url: string;
  createdTime: string;
  lastEditedTime: string;
  archived: boolean;
}

export interface NotionDatabase {
  id: string;
  title: string;
  url: string;
  createdTime: string;
  lastEditedTime: string;
}

export class NotionService {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey ?? ENV.notionApiKey;
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /** Search pages and databases */
  async search(query?: string, filter?: "page" | "database") {
    const body: Record<string, unknown> = {};
    if (query) body.query = query;
    if (filter) body.filter = { value: filter, property: "object" };

    const res = await fetch(`${NOTION_API_BASE}/search`, {
      method: "POST",
      headers: getHeaders(this.apiKey),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Notion search failed: ${res.statusText}`);
    return res.json();
  }

  /** List all databases the integration has access to */
  async listDatabases(): Promise<NotionDatabase[]> {
    const data = await this.search(undefined, "database");
    return (data.results ?? []).map((db: Record<string, unknown>) => ({
      id: db.id as string,
      title:
        (db.title as Array<{ plain_text: string }>)?.[0]?.plain_text ??
        "Untitled",
      url: db.url as string,
      createdTime: db.created_time as string,
      lastEditedTime: db.last_edited_time as string,
    }));
  }

  /** Query a database */
  async queryDatabase(
    databaseId: string,
    filter?: Record<string, unknown>,
    sorts?: Record<string, unknown>[]
  ) {
    const body: Record<string, unknown> = {};
    if (filter) body.filter = filter;
    if (sorts) body.sorts = sorts;

    const res = await fetch(
      `${NOTION_API_BASE}/databases/${databaseId}/query`,
      {
        method: "POST",
        headers: getHeaders(this.apiKey),
        body: JSON.stringify(body),
      }
    );
    if (!res.ok) throw new Error(`Notion query failed: ${res.statusText}`);
    return res.json();
  }

  /** Get a page */
  async getPage(pageId: string) {
    const res = await fetch(`${NOTION_API_BASE}/pages/${pageId}`, {
      headers: getHeaders(this.apiKey),
    });
    if (!res.ok) throw new Error(`Notion getPage failed: ${res.statusText}`);
    return res.json();
  }

  /** Create a page in a database */
  async createPage(
    databaseId: string,
    properties: Record<string, unknown>,
    children?: Record<string, unknown>[]
  ) {
    const body: Record<string, unknown> = {
      parent: { database_id: databaseId },
      properties,
    };
    if (children) body.children = children;

    const res = await fetch(`${NOTION_API_BASE}/pages`, {
      method: "POST",
      headers: getHeaders(this.apiKey),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Notion createPage failed: ${res.statusText}`);
    return res.json();
  }

  /** Update page properties */
  async updatePage(pageId: string, properties: Record<string, unknown>) {
    const res = await fetch(`${NOTION_API_BASE}/pages/${pageId}`, {
      method: "PATCH",
      headers: getHeaders(this.apiKey),
      body: JSON.stringify({ properties }),
    });
    if (!res.ok) throw new Error(`Notion updatePage failed: ${res.statusText}`);
    return res.json();
  }

  /** Get page blocks (content) */
  async getBlocks(blockId: string) {
    const res = await fetch(`${NOTION_API_BASE}/blocks/${blockId}/children`, {
      headers: getHeaders(this.apiKey),
    });
    if (!res.ok) throw new Error(`Notion getBlocks failed: ${res.statusText}`);
    return res.json();
  }

  /** Test connection */
  async testConnection(): Promise<{
    ok: boolean;
    user?: string;
    error?: string;
  }> {
    try {
      const res = await fetch(`${NOTION_API_BASE}/users/me`, {
        headers: getHeaders(this.apiKey),
      });
      if (!res.ok) return { ok: false, error: res.statusText };
      const data = await res.json();
      return { ok: true, user: data.name ?? data.id };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  }
}

export const notionService = new NotionService();
