import { getPool } from "../db-pool";
import { logger } from "../utils/logger";
const log = logger.module("ConversationService");

export interface ConversationMessage {
  role: "user" | "assistant" | "system";
  content: string;
  metadata?: Record<string, unknown>;
}

export class ConversationService {
  async addMessage(
    userId: number,
    role: "user" | "assistant" | "system",
    content: string,
    metadata?: Record<string, unknown>
  ) {
    try {
      const pool = getPool();

      const result = await pool.query(
        `INSERT INTO conversations ("userId", role, content, metadata, "createdAt") 
         VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
        [userId, role, content, metadata ? JSON.stringify(metadata) : null]
      );

      log.debug("[Conversation] Message saved:", { userId, role });
      return result.rows[0];
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      log.error("[Conversation] Error saving message:", msg);
      throw error;
    }
  }

  async getConversationHistory(
    userId: number,
    limit: number = 10
  ): Promise<ConversationMessage[]> {
    try {
      const pool = getPool();

      const result = await pool.query(
        `SELECT role, content, metadata, "createdAt" 
         FROM conversations 
         WHERE "userId" = $1 
         ORDER BY "createdAt" DESC 
         LIMIT $2`,
        [userId, limit]
      );

      // Reverse to get chronological order (oldest first)
      const messages: ConversationMessage[] = result.rows
        .reverse()
        .map((row: { role: string; content: string; metadata: unknown }) => ({
          role: row.role as "user" | "assistant" | "system",
          content: String(row.content),
          metadata: row.metadata as Record<string, unknown> | undefined,
        }));

      log.debug("[Conversation] Retrieved history:", {
        userId,
        count: messages.length,
      });
      return messages;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      log.error("[Conversation] Error retrieving history:", msg);
      return [];
    }
  }

  async clearConversationHistory(userId: number) {
    try {
      const pool = getPool();

      await pool.query(`DELETE FROM conversations WHERE "userId" = $1`, [
        userId,
      ]);

      log.debug("[Conversation] History cleared:", { userId });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      log.error("[Conversation] Error clearing history:", msg);
      throw error;
    }
  }

  async getConversationStats(userId: number) {
    try {
      const pool = getPool();

      const result = await pool.query(
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
      log.debug("[Conversation] Stats retrieved:", { userId, stats });
      return stats;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      log.error("[Conversation] Error retrieving stats:", msg);
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
