import Anthropic from '@anthropic-ai/sdk';

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  system?: string;
}

export class ClaudeClient {
  private client: Anthropic | null = null;
  private apiKey: string | undefined;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY;
    
    if (this.apiKey) {
      try {
        this.client = new Anthropic({
          apiKey: this.apiKey,
        });
        console.log('[Claude] Client initialized successfully');
      } catch (error) {
        console.error('[Claude] Failed to initialize client:', error);
      }
    } else {
      console.warn('[Claude] No API key provided, client not initialized');
    }
  }

  isAvailable(): boolean {
    return this.client !== null && this.apiKey !== undefined;
  }

  async chat(messages: ClaudeMessage[], options?: ClaudeOptions): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('Claude client not available - API key not configured');
    }

    try {
      const response = await this.client!.messages.create({
        model: options?.model || 'claude-3-5-sonnet-20241022',
        max_tokens: options?.maxTokens || 1500,
        temperature: options?.temperature || 0.7,
        system: options?.system,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
      });

      const content = response.content[0];
      if (content.type === 'text') {
        console.log('[Claude] Chat completion successful');
        return content.text;
      }

      throw new Error('Unexpected response format from Claude');
    } catch (error: any) {
      console.error('[Claude] Chat error:', error.message);
      throw new Error(`Claude API error: ${error.message}`);
    }
  }

  async streamChat(messages: ClaudeMessage[], options?: ClaudeOptions): Promise<AsyncIterable<string>> {
    if (!this.isAvailable()) {
      throw new Error('Claude client not available - API key not configured');
    }

    try {
      const stream = await this.client!.messages.create({
        model: options?.model || 'claude-3-5-sonnet-20241022',
        max_tokens: options?.maxTokens || 1500,
        temperature: options?.temperature || 0.7,
        system: options?.system,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        stream: true,
      });

      async function* generateChunks() {
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            yield event.delta.text;
          }
        }
      }

      return generateChunks();
    } catch (error: any) {
      console.error('[Claude] Stream error:', error.message);
      throw new Error(`Claude API error: ${error.message}`);
    }
  }
}

// Singleton instance
let claudeClientInstance: ClaudeClient | null = null;

export function getClaudeClient(apiKey?: string): ClaudeClient {
  if (!claudeClientInstance || apiKey) {
    claudeClientInstance = new ClaudeClient(apiKey);
  }
  return claudeClientInstance;
}
