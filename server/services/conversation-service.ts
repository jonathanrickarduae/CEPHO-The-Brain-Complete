import { getDb, saveConversation, getConversationHistory as dbGetConversationHistory } from '../db';
import { conversations } from '../../drizzle/schema';
import { eq, desc } from 'drizzle-orm';

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: any;
}

export class ConversationService {
  async addMessage(userId: number, role: 'user' | 'assistant' | 'system', content: string, metadata?: any) {
    try {
      const result = await saveConversation({
        userId,
        role,
        content,
        metadata: metadata || null,
      });
      
      console.log('[Conversation] Message saved:', { userId, role });
      return result;
    } catch (error: any) {
      console.error('[Conversation] Error saving message:', error.message);
      throw error;
    }
  }

  async getConversationHistory(userId: number, limit: number = 10): Promise<ConversationMessage[]> {
    try {
      const history = await dbGetConversationHistory(userId, limit);
      
      const messages = history.map(row => ({
        role: row.role,
        content: row.content,
        metadata: row.metadata,
      }));
      
      console.log('[Conversation] Retrieved history:', { userId, count: messages.length });
      return messages;
    } catch (error: any) {
      console.error('[Conversation] Error retrieving history:', error.message);
      return [];
    }
  }

  async clearConversationHistory(userId: number) {
    try {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      await db.delete(conversations).where(eq(conversations.userId, userId));
      
      console.log('[Conversation] History cleared:', { userId });
    } catch (error: any) {
      console.error('[Conversation] Error clearing history:', error.message);
      throw error;
    }
  }

  async getConversationStats(userId: number) {
    try {
      const history = await dbGetConversationHistory(userId, 1000);
      
      const stats = {
        totalMessages: history.length,
        userMessages: history.filter(m => m.role === 'user').length,
        assistantMessages: history.filter(m => m.role === 'assistant').length,
        firstMessage: history.length > 0 ? history[0].createdAt : null,
        lastMessage: history.length > 0 ? history[history.length - 1].createdAt : null,
      };
      
      console.log('[Conversation] Stats retrieved:', { userId, stats });
      return stats;
    } catch (error: any) {
      console.error('[Conversation] Error retrieving stats:', error.message);
      return null;
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
