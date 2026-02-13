import { Client } from 'pg';

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: any;
}

async function getClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not configured');
  }
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();
  return client;
}

export class ConversationService {
  async addMessage(userId: number, role: 'user' | 'assistant' | 'system', content: string, metadata?: any) {
    let client;
    try {
      client = await getClient();
      
      const result = await client.query(
        `INSERT INTO conversations ("userId", role, content, metadata, "createdAt") 
         VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
        [userId, role, content, metadata ? JSON.stringify(metadata) : null]
      );
      
      console.log('[Conversation] Message saved:', { userId, role });
      return result.rows[0];
    } catch (error: any) {
      console.error('[Conversation] Error saving message:', error.message);
      throw error;
    } finally {
      if (client) await client.end();
    }
  }

  async getConversationHistory(userId: number, limit: number = 10): Promise<ConversationMessage[]> {
    let client;
    try {
      client = await getClient();
      
      const result = await client.query(
        `SELECT role, content, metadata, "createdAt" 
         FROM conversations 
         WHERE "userId" = $1 
         ORDER BY "createdAt" DESC 
         LIMIT $2`,
        [userId, limit]
      );
      
      // Reverse to get chronological order (oldest first)
      const messages = result.rows.reverse().map((row: any) => ({
        role: row.role,
        content: row.content,
        metadata: row.metadata,
      }));
      
      console.log('[Conversation] Retrieved history:', { userId, count: messages.length });
      return messages;
    } catch (error: any) {
      console.error('[Conversation] Error retrieving history:', error.message);
      return [];
    } finally {
      if (client) await client.end();
    }
  }

  async clearConversationHistory(userId: number) {
    let client;
    try {
      client = await getClient();
      
      await client.query(
        `DELETE FROM conversations WHERE "userId" = $1`,
        [userId]
      );
      
      console.log('[Conversation] History cleared:', { userId });
    } catch (error: any) {
      console.error('[Conversation] Error clearing history:', error.message);
      throw error;
    } finally {
      if (client) await client.end();
    }
  }

  async getConversationStats(userId: number) {
    let client;
    try {
      client = await getClient();
      
      const result = await client.query(
        `SELECT 
          COUNT(*) as "totalMessages",
          SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as "userMessages",
          SUM(CASE WHEN role = 'assistant' THEN 1 ELSE 0 END) as "assistantMessages",
          MIN("createdAt") as "firstMessage",
          MAX("createdAt") as "lastMessage"
         FROM conversations 
         WHERE "userId" = $1`,
        [userId]
      );
      
      const stats = result.rows[0] || {};
      console.log('[Conversation] Stats retrieved:', { userId, stats });
      return stats;
    } catch (error: any) {
      console.error('[Conversation] Error retrieving stats:', error.message);
      return null;
    } finally {
      if (client) await client.end();
    }
  }
}

// Singleton instance
let conversationServiceInstance: ConversationService | null = null;

export function getConversationService(): ConversationService {
  if (!conversationServiceInstance) {
    conversationServiceInstance = new ConversationService();
  }
  return conversationServiceInstance;
}
