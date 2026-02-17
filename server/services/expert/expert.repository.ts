import { getDb } from '../../db';
import {
  expertChatSessions,
  expertChatMessages,
  expertConsultations,
  expertPerformance,
  expertConversations,
  expertMemory,
  InsertExpertChatSession,
  InsertExpertChatMessage,
  InsertExpertConsultation,
  InsertExpertPerformance,
  InsertExpertConversation,
  InsertExpertMemory,
  ExpertChatSession,
  ExpertChatMessage,
  ExpertConsultation,
  ExpertPerformance,
  ExpertConversation,
  ExpertMemory,
} from '../../../drizzle/schema';
import { eq, and, desc, gte } from 'drizzle-orm';

/**
 * Expert Repository
 * 
 * Handles all database operations for AI expert services.
 */
export class ExpertRepository {
  // ===== Chat Sessions =====

  async createChatSession(data: InsertExpertChatSession): Promise<ExpertChatSession> {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const [session] = await db
      .insert(expertChatSessions)
      .values(data)
      .returning();

    return session;
  }

  async findChatSessionById(id: number, userId: number): Promise<ExpertChatSession | null> {
    const db = await getDb();
    if (!db) return null;

    const [session] = await db
      .select()
      .from(expertChatSessions)
      .where(
        and(
          eq(expertChatSessions.id, id),
          eq(expertChatSessions.userId, userId)
        )
      )
      .limit(1);

    return session || null;
  }

  async findChatSessionsByUserId(userId: number): Promise<ExpertChatSession[]> {
    const db = await getDb();
    if (!db) return [];

    return await db
      .select()
      .from(expertChatSessions)
      .where(eq(expertChatSessions.userId, userId))
      .orderBy(desc(expertChatSessions.updatedAt));
  }

  async findChatSessionsByExpertId(userId: number, expertId: string): Promise<ExpertChatSession[]> {
    const db = await getDb();
    if (!db) return [];

    return await db
      .select()
      .from(expertChatSessions)
      .where(
        and(
          eq(expertChatSessions.userId, userId),
          eq(expertChatSessions.expertId, expertId)
        )
      )
      .orderBy(desc(expertChatSessions.updatedAt));
  }

  async updateChatSession(
    id: number,
    userId: number,
    data: Partial<InsertExpertChatSession>
  ): Promise<ExpertChatSession | null> {
    const db = await getDb();
    if (!db) return null;

    const [updated] = await db
      .update(expertChatSessions)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(expertChatSessions.id, id),
          eq(expertChatSessions.userId, userId)
        )
      )
      .returning();

    return updated || null;
  }

  // ===== Chat Messages =====

  async createChatMessage(data: InsertExpertChatMessage): Promise<ExpertChatMessage> {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const [message] = await db
      .insert(expertChatMessages)
      .values(data)
      .returning();

    return message;
  }

  async findChatMessagesBySessionId(sessionId: number): Promise<ExpertChatMessage[]> {
    const db = await getDb();
    if (!db) return [];

    return await db
      .select()
      .from(expertChatMessages)
      .where(eq(expertChatMessages.sessionId, sessionId))
      .orderBy(expertChatMessages.createdAt);
  }

  // ===== Consultations =====

  async createConsultation(data: InsertExpertConsultation): Promise<ExpertConsultation> {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const [consultation] = await db
      .insert(expertConsultations)
      .values(data)
      .returning();

    return consultation;
  }

  async findConsultationById(id: number, userId: number): Promise<ExpertConsultation | null> {
    const db = await getDb();
    if (!db) return null;

    const [consultation] = await db
      .select()
      .from(expertConsultations)
      .where(
        and(
          eq(expertConsultations.id, id),
          eq(expertConsultations.userId, userId)
        )
      )
      .limit(1);

    return consultation || null;
  }

  async findConsultationsByUserId(userId: number): Promise<ExpertConsultation[]> {
    const db = await getDb();
    if (!db) return [];

    return await db
      .select()
      .from(expertConsultations)
      .where(eq(expertConsultations.userId, userId))
      .orderBy(desc(expertConsultations.createdAt));
  }

  async updateConsultation(
    id: number,
    userId: number,
    data: Partial<InsertExpertConsultation>
  ): Promise<ExpertConsultation | null> {
    const db = await getDb();
    if (!db) return null;

    const [updated] = await db
      .update(expertConsultations)
      .set(data)
      .where(
        and(
          eq(expertConsultations.id, id),
          eq(expertConsultations.userId, userId)
        )
      )
      .returning();

    return updated || null;
  }

  // ===== Performance =====

  async findOrCreatePerformance(
    userId: number,
    expertId: string
  ): Promise<ExpertPerformance> {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // Try to find existing
    const [existing] = await db
      .select()
      .from(expertPerformance)
      .where(
        and(
          eq(expertPerformance.userId, userId),
          eq(expertPerformance.expertId, expertId)
        )
      )
      .limit(1);

    if (existing) return existing;

    // Create new
    const [created] = await db
      .insert(expertPerformance)
      .values({
        userId,
        expertId,
        score: 80,
        projectsCompleted: 0,
        positiveFeedback: 0,
        negativeFeedback: 0,
        status: 'active',
      })
      .returning();

    return created;
  }

  async updatePerformance(
    userId: number,
    expertId: string,
    data: Partial<InsertExpertPerformance>
  ): Promise<ExpertPerformance | null> {
    const db = await getDb();
    if (!db) return null;

    const [updated] = await db
      .update(expertPerformance)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(expertPerformance.userId, userId),
          eq(expertPerformance.expertId, expertId)
        )
      )
      .returning();

    return updated || null;
  }

  async findAllPerformance(userId: number): Promise<ExpertPerformance[]> {
    const db = await getDb();
    if (!db) return [];

    return await db
      .select()
      .from(expertPerformance)
      .where(eq(expertPerformance.userId, userId))
      .orderBy(desc(expertPerformance.score));
  }

  // ===== Conversations =====

  async createConversation(data: InsertExpertConversation): Promise<ExpertConversation> {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const [conversation] = await db
      .insert(expertConversations)
      .values(data)
      .returning();

    return conversation;
  }

  async findConversationsByExpertId(
    userId: number,
    expertId: string,
    days: number = 30
  ): Promise<ExpertConversation[]> {
    const db = await getDb();
    if (!db) return [];

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return await db
      .select()
      .from(expertConversations)
      .where(
        and(
          eq(expertConversations.userId, userId),
          eq(expertConversations.expertId, expertId),
          gte(expertConversations.createdAt, cutoffDate)
        )
      )
      .orderBy(desc(expertConversations.createdAt));
  }

  // ===== Memory =====

  async createMemory(data: InsertExpertMemory): Promise<ExpertMemory> {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const [memory] = await db
      .insert(expertMemory)
      .values(data)
      .returning();

    return memory;
  }

  async findMemoriesByExpertId(
    userId: number,
    expertId: string
  ): Promise<ExpertMemory[]> {
    const db = await getDb();
    if (!db) return [];

    return await db
      .select()
      .from(expertMemory)
      .where(
        and(
          eq(expertMemory.userId, userId),
          eq(expertMemory.expertId, expertId)
        )
      )
      .orderBy(desc(expertMemory.importance), desc(expertMemory.createdAt));
  }

  async updateMemoryLastAccessed(id: number): Promise<void> {
    const db = await getDb();
    if (!db) return;

    await db
      .update(expertMemory)
      .set({ lastAccessed: new Date() })
      .where(eq(expertMemory.id, id));
  }
}
