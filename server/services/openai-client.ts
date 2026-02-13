import OpenAI from 'openai';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export class OpenAIClient {
  private client: OpenAI | null = null;
  private apiKey: string | undefined;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY;
    
    console.log('[OpenAI] Constructor called', {
      apiKeyProvided: !!apiKey,
      envKeyExists: !!process.env.OPENAI_API_KEY,
      envKeyLength: process.env.OPENAI_API_KEY?.length,
      finalKeyLength: this.apiKey?.length,
    });
    
    if (this.apiKey) {
      try {
        this.client = new OpenAI({
          apiKey: this.apiKey,
        });
        console.log('[OpenAI] Client initialized successfully');
      } catch (error) {
        console.error('[OpenAI] Failed to initialize client:', error);
      }
    } else {
      console.warn('[OpenAI] No API key provided, client not initialized');
    }
  }

  isAvailable(): boolean {
    return this.client !== null && this.apiKey !== undefined;
  }

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('OpenAI client not available - API key not configured');
    }

    try {
      const response = await this.client!.chat.completions.create({
        model: options?.model || 'gpt-4',
        messages: messages as any,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 1500,
      });

      const content = response.choices[0]?.message?.content || '';
      console.log('[OpenAI] Chat completion successful');
      return content;
    } catch (error: any) {
      console.error('[OpenAI] Chat error:', error.message);
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }

  async streamChat(messages: ChatMessage[], options?: ChatOptions): Promise<AsyncIterable<string>> {
    if (!this.isAvailable()) {
      throw new Error('OpenAI client not available - API key not configured');
    }

    try {
      const stream = await this.client!.chat.completions.create({
        model: options?.model || 'gpt-4',
        messages: messages as any,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 1500,
        stream: true,
      });

      async function* generateChunks() {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            yield content;
          }
        }
      }

      return generateChunks();
    } catch (error: any) {
      console.error('[OpenAI] Stream error:', error.message);
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }
}

// Singleton instance
let openAIClientInstance: OpenAIClient | null = null;

export function getOpenAIClient(apiKey?: string): OpenAIClient {
  if (!openAIClientInstance || apiKey) {
    openAIClientInstance = new OpenAIClient(apiKey);
  }
  return openAIClientInstance;
}
