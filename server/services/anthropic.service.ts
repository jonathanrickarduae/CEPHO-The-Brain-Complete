import { ENV } from "../_core/env";

const ANTHROPIC_API_BASE = "https://api.anthropic.com/v1";
const ANTHROPIC_VERSION = "2023-06-01";
const DEFAULT_MODEL = "claude-3-5-sonnet-20241022";

function getHeaders(apiKey?: string) {
  return {
    "x-api-key": apiKey ?? ENV.anthropicApiKey,
    "anthropic-version": ANTHROPIC_VERSION,
    "content-type": "application/json",
  };
}

export interface AnthropicMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AnthropicResponse {
  id: string;
  model: string;
  content: string;
  inputTokens: number;
  outputTokens: number;
  stopReason: string;
}

export class AnthropicService {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey ?? ENV.anthropicApiKey;
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /** Send a message to Claude */
  async complete(
    messages: AnthropicMessage[],
    options?: {
      model?: string;
      system?: string;
      maxTokens?: number;
      temperature?: number;
    }
  ): Promise<AnthropicResponse> {
    const body = {
      model: options?.model ?? DEFAULT_MODEL,
      max_tokens: options?.maxTokens ?? 1024,
      temperature: options?.temperature ?? 0.7,
      ...(options?.system ? { system: options.system } : {}),
      messages,
    };

    const res = await fetch(`${ANTHROPIC_API_BASE}/messages`, {
      method: "POST",
      headers: getHeaders(this.apiKey),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Anthropic API error ${res.status}: ${err}`);
    }

    const data = await res.json();
    return {
      id: data.id,
      model: data.model,
      content: data.content?.[0]?.text ?? "",
      inputTokens: data.usage?.input_tokens ?? 0,
      outputTokens: data.usage?.output_tokens ?? 0,
      stopReason: data.stop_reason ?? "end_turn",
    };
  }

  /** Simple single-turn completion */
  async ask(
    prompt: string,
    systemPrompt?: string,
    model?: string
  ): Promise<string> {
    const response = await this.complete([{ role: "user", content: prompt }], {
      system: systemPrompt,
      model,
    });
    return response.content;
  }

  /** Stream a response (returns async generator) */
  async *stream(
    messages: AnthropicMessage[],
    options?: {
      model?: string;
      system?: string;
      maxTokens?: number;
    }
  ): AsyncGenerator<string> {
    const body = {
      model: options?.model ?? DEFAULT_MODEL,
      max_tokens: options?.maxTokens ?? 1024,
      ...(options?.system ? { system: options.system } : {}),
      messages,
      stream: true,
    };

    const res = await fetch(`${ANTHROPIC_API_BASE}/messages`, {
      method: "POST",
      headers: getHeaders(this.apiKey),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Anthropic stream error ${res.status}: ${err}`);
    }

    const reader = res.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6).trim();
          if (data === "[DONE]") return;
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === "content_block_delta") {
              yield parsed.delta?.text ?? "";
            }
          } catch {
            // skip malformed lines
          }
        }
      }
    }
  }

  /** Test connection */
  async testConnection(): Promise<{
    ok: boolean;
    model?: string;
    error?: string;
  }> {
    try {
      const response = await this.complete(
        [{ role: "user", content: "Say 'ok' in one word." }],
        { maxTokens: 10 }
      );
      return { ok: true, model: response.model };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  }
}

export const anthropicService = new AnthropicService();
