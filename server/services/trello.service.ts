import { ENV } from "../_core/env";

const TRELLO_API_BASE = "https://api.trello.com/1";

export interface TrelloBoard {
  id: string;
  name: string;
  desc: string;
  url: string;
  closed: boolean;
}

export interface TrelloList {
  id: string;
  name: string;
  closed: boolean;
  idBoard: string;
}

export interface TrelloCard {
  id: string;
  name: string;
  desc: string;
  url: string;
  idList: string;
  idBoard: string;
  due: string | null;
  closed: boolean;
  labels: Array<{ id: string; name: string; color: string }>;
}

export class TrelloService {
  private apiKey: string;
  private apiToken: string;

  constructor(apiKey?: string, apiToken?: string) {
    this.apiKey = apiKey ?? ENV.trelloApiKey;
    // The "secret" in Trello context is actually the user OAuth token
    this.apiToken = apiToken ?? ENV.trelloApiSecret;
  }

  isConfigured(): boolean {
    return !!(this.apiKey && this.apiToken);
  }

  private authParams(): string {
    return `key=${this.apiKey}&token=${this.apiToken}`;
  }

  /** Get all boards for the authenticated member */
  async getBoards(): Promise<TrelloBoard[]> {
    const res = await fetch(
      `${TRELLO_API_BASE}/members/me/boards?${this.authParams()}&fields=id,name,desc,url,closed`
    );
    if (!res.ok) throw new Error(`Trello getBoards failed: ${res.statusText}`);
    return res.json();
  }

  /** Get lists on a board */
  async getLists(boardId: string): Promise<TrelloList[]> {
    const res = await fetch(
      `${TRELLO_API_BASE}/boards/${boardId}/lists?${this.authParams()}`
    );
    if (!res.ok) throw new Error(`Trello getLists failed: ${res.statusText}`);
    return res.json();
  }

  /** Get cards on a board */
  async getCards(boardId: string): Promise<TrelloCard[]> {
    const res = await fetch(
      `${TRELLO_API_BASE}/boards/${boardId}/cards?${this.authParams()}&fields=id,name,desc,url,idList,idBoard,due,closed,labels`
    );
    if (!res.ok) throw new Error(`Trello getCards failed: ${res.statusText}`);
    return res.json();
  }

  /** Get cards in a specific list */
  async getCardsInList(listId: string): Promise<TrelloCard[]> {
    const res = await fetch(
      `${TRELLO_API_BASE}/lists/${listId}/cards?${this.authParams()}`
    );
    if (!res.ok)
      throw new Error(`Trello getCardsInList failed: ${res.statusText}`);
    return res.json();
  }

  /** Create a card */
  async createCard(
    listId: string,
    name: string,
    desc?: string,
    due?: string
  ): Promise<TrelloCard> {
    const params = new URLSearchParams({
      idList: listId,
      name,
      ...(desc ? { desc } : {}),
      ...(due ? { due } : {}),
      key: this.apiKey,
      token: this.apiToken,
    });
    const res = await fetch(`${TRELLO_API_BASE}/cards`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    if (!res.ok) throw new Error(`Trello createCard failed: ${res.statusText}`);
    return res.json();
  }

  /** Update a card */
  async updateCard(
    cardId: string,
    updates: Partial<{ name: string; desc: string; due: string; closed: boolean; idList: string }>
  ): Promise<TrelloCard> {
    const params = new URLSearchParams({
      ...Object.fromEntries(
        Object.entries(updates).map(([k, v]) => [k, String(v)])
      ),
      key: this.apiKey,
      token: this.apiToken,
    });
    const res = await fetch(`${TRELLO_API_BASE}/cards/${cardId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    if (!res.ok) throw new Error(`Trello updateCard failed: ${res.statusText}`);
    return res.json();
  }

  /** Archive (close) a card */
  async archiveCard(cardId: string): Promise<TrelloCard> {
    return this.updateCard(cardId, { closed: true });
  }

  /** Test connection */
  async testConnection(): Promise<{ ok: boolean; username?: string; error?: string }> {
    try {
      const res = await fetch(
        `${TRELLO_API_BASE}/members/me?${this.authParams()}&fields=username,fullName`
      );
      if (!res.ok) return { ok: false, error: res.statusText };
      const data = await res.json();
      return { ok: true, username: data.username ?? data.fullName };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  }
}

export const trelloService = new TrelloService();
