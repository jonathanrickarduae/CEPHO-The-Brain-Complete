/**
 * Communication Service Module
 * Handles messaging and conversation management
 */

import { db } from '../../db';
import { conversations } from '../../../drizzle/schema';
import { eq, desc, and } from 'drizzle-orm';
import { logger } from '../../utils/logger';

const log = logger.module('CommunicationService');

export interface MessageDto {
  id: number;
  from: number;
  to: number;
  content: string;
  read: boolean;
  createdAt: Date;
}

export interface ConversationDto {
  id: number;
  userId: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: any;
  createdAt: Date;
}

export interface SaveConversationDto {
  userId: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: any;
}

export class CommunicationService {
  // ===== Messaging =====
  
  async sendMessage(from: number, to: number, content: string): Promise<MessageDto> {
    log.info({ from, to }, 'Message sent');
    return { id: 1, from, to, content, read: false, createdAt: new Date() };
  }

  async getMessages(userId: number): Promise<MessageDto[]> {
    return [];
  }

  async markAsRead(messageId: number, userId: number): Promise<boolean> {
    log.info({ messageId, userId }, 'Message marked as read');
    return true;
  }

  // ===== Conversations =====

  /**
   * Save a conversation message
   */
  async saveConversation(data: SaveConversationDto): Promise<ConversationDto> {
    const [conversation] = await db.insert(conversations).values({
      userId: data.userId,
      role: data.role,
      content: data.content,
      metadata: data.metadata || null,
    }).returning();

    log.info({ userId: data.userId, role: data.role }, 'Conversation saved');

    return {
      id: conversation.id,
      userId: conversation.userId,
      role: conversation.role as 'user' | 'assistant' | 'system',
      content: conversation.content,
      metadata: conversation.metadata,
      createdAt: conversation.createdAt,
    };
  }

  /**
   * Get conversation history for a user
   */
  async getConversationHistory(userId: number, limit: number = 50): Promise<ConversationDto[]> {
    const results = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.createdAt))
      .limit(limit);

    // Return in chronological order (oldest first)
    return results.reverse().map(c => ({
      id: c.id,
      userId: c.userId,
      role: c.role as 'user' | 'assistant' | 'system',
      content: c.content,
      metadata: c.metadata,
      createdAt: c.createdAt,
    }));
  }

  /**
   * Clear conversation history for a user
   */
  async clearConversationHistory(userId: number): Promise<void> {
    await db
      .delete(conversations)
      .where(eq(conversations.userId, userId));

    log.info({ userId }, 'Conversation history cleared');
  }

  /**
   * Get recent conversations across all users (for admin/analytics)
   */
  async getRecentConversations(limit: number = 100): Promise<ConversationDto[]> {
    const results = await db
      .select()
      .from(conversations)
      .orderBy(desc(conversations.createdAt))
      .limit(limit);

    return results.map(c => ({
      id: c.id,
      userId: c.userId,
      role: c.role as 'user' | 'assistant' | 'system',
      content: c.content,
      metadata: c.metadata,
      createdAt: c.createdAt,
    }));
  }

  /**
   * Get conversation count for a user
   */
  async getConversationCount(userId: number): Promise<number> {
    const results = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId));

    return results.length;
  }
}

export const communicationService = new CommunicationService();
