import { getOpenAIClient } from './openai-client';
import { getDb } from '../db';

export interface ConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ConversationSummary {
  id?: number;
  userId: number;
  skillType: string;
  summary: string;
  messageCount: number;
  keyPoints: string[];
  actionItems: string[];
  decisions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class ConversationSummarizerService {
  private static instance: ConversationSummarizerService | null = null;
  private readonly MAX_MESSAGES_BEFORE_SUMMARY = 10;

  static getInstance(): ConversationSummarizerService {
    if (!ConversationSummarizerService.instance) {
      ConversationSummarizerService.instance = new ConversationSummarizerService();
    }
    return ConversationSummarizerService.instance;
  }

  async shouldSummarize(messageCount: number): Promise<boolean> {
    return messageCount > this.MAX_MESSAGES_BEFORE_SUMMARY;
  }

  async summarizeConversation(
    userId: number,
    skillType: string,
    messages: ConversationMessage[]
  ): Promise<ConversationSummary> {
    try {
      console.log(`[Summarizer] Summarizing ${messages.length} messages for user ${userId}`);

      // Filter out system messages for summarization
      const userMessages = messages.filter(m => m.role !== 'system');

      // Create summarization prompt
      const conversationText = userMessages
        .map(m => `${m.role.toUpperCase()}: ${m.content}`)
        .join('\n\n');

      const prompt = `Analyze the following conversation and provide a structured summary:

${conversationText}

Please provide:
1. A concise summary (2-3 sentences) of the main topics discussed
2. Key points or insights (bullet points)
3. Action items or next steps mentioned (bullet points)
4. Decisions made or conclusions reached (bullet points)

Format your response as JSON:
{
  "summary": "...",
  "keyPoints": ["...", "..."],
  "actionItems": ["...", "..."],
  "decisions": ["...", "..."]
}`;

      const client = getOpenAIClient();
      if (!client.isAvailable()) {
        throw new Error('OpenAI not configured for summarization');
      }

      const response = await client.chat([
        { role: 'system', content: 'You are an expert at summarizing business conversations. Always respond with valid JSON.' },
        { role: 'user', content: prompt }
      ], {
        model: 'gpt-4-turbo',
        temperature: 0.3,
        maxTokens: 1000,
      });

      // Parse the JSON response
      let summaryData;
      try {
        summaryData = JSON.parse(response);
      } catch (parseError) {
        // If JSON parsing fails, create a basic summary
        summaryData = {
          summary: response.substring(0, 500),
          keyPoints: [],
          actionItems: [],
          decisions: [],
        };
      }

      const summary: ConversationSummary = {
        userId,
        skillType,
        summary: summaryData.summary || 'Conversation summary unavailable',
        messageCount: messages.length,
        keyPoints: Array.isArray(summaryData.keyPoints) ? summaryData.keyPoints : [],
        actionItems: Array.isArray(summaryData.actionItems) ? summaryData.actionItems : [],
        decisions: Array.isArray(summaryData.decisions) ? summaryData.decisions : [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save to database
      await this.saveSummary(summary);

      console.log(`[Summarizer] Summary created successfully`);
      return summary;
    } catch (error: any) {
      console.error('[Summarizer] Failed to summarize conversation:', error.message);
      throw error;
    }
  }

  async saveSummary(summary: ConversationSummary): Promise<void> {
    try {
      const db = await getDb();
      if (!db) {
        console.error('[Summarizer] Database not available');
        return;
      }

      await db.execute(
        `INSERT INTO conversation_summaries 
         (userId, skillType, summary, messageCount, keyPoints, actionItems, decisions, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          summary.userId,
          summary.skillType,
          summary.summary,
          summary.messageCount,
          JSON.stringify(summary.keyPoints),
          JSON.stringify(summary.actionItems),
          JSON.stringify(summary.decisions),
        ]
      );

      console.log('[Summarizer] Summary saved to database');
    } catch (error: any) {
      console.error('[Summarizer] Failed to save summary:', error.message);
    }
  }

  async getRecentSummaries(userId: number, skillType: string, limit: number = 5): Promise<ConversationSummary[]> {
    try {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const result: any = await db.execute(
        `SELECT * FROM conversation_summaries 
         WHERE userId = ? AND skillType = ? 
         ORDER BY createdAt DESC 
         LIMIT ?`,
        [userId, skillType, limit]
      );

      const rows = result.rows || [];
      return rows.map((row: any) => ({
        id: row.id,
        userId: row.userId,
        skillType: row.skillType,
        summary: row.summary,
        messageCount: row.messageCount,
        keyPoints: JSON.parse(row.keyPoints || '[]'),
        actionItems: JSON.parse(row.actionItems || '[]'),
        decisions: JSON.parse(row.decisions || '[]'),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }));
    } catch (error: any) {
      console.error('[Summarizer] Failed to get summaries:', error.message);
      return [];
    }
  }

  async getContextWithSummaries(
    userId: number,
    skillType: string,
    recentMessages: ConversationMessage[],
    maxSummaries: number = 2
  ): Promise<{ summaries: ConversationSummary[]; messages: ConversationMessage[] }> {
    // Get recent summaries to provide context
    const summaries = await this.getRecentSummaries(userId, skillType, maxSummaries);

    // Return summaries + recent messages for context
    return {
      summaries,
      messages: recentMessages,
    };
  }

  async buildContextString(userId: number, skillType: string, recentMessages: ConversationMessage[]): Promise<string> {
    const context = await this.getContextWithSummaries(userId, skillType, recentMessages, 2);

    let contextString = '';

    // Add summaries as context
    if (context.summaries.length > 0) {
      contextString += '=== Previous Conversation Context ===\n\n';
      for (const summary of context.summaries) {
        contextString += `Summary (${summary.messageCount} messages):\n${summary.summary}\n\n`;
        if (summary.keyPoints.length > 0) {
          contextString += `Key Points:\n${summary.keyPoints.map(p => `- ${p}`).join('\n')}\n\n`;
        }
        if (summary.actionItems.length > 0) {
          contextString += `Action Items:\n${summary.actionItems.map(a => `- ${a}`).join('\n')}\n\n`;
        }
      }
      contextString += '=== End of Previous Context ===\n\n';
    }

    return contextString;
  }
}

export function getConversationSummarizer(): ConversationSummarizerService {
  return ConversationSummarizerService.getInstance();
}
