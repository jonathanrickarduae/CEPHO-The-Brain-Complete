/**
 * Expert Repository
 * 
 * Handles all database operations related to AI experts, conversations, memories, and learning.
 * 
 * @module db/repositories/expert
 */

import { eq, and, desc, sql } from "drizzle-orm";
import { BaseRepository } from "./base.repository";
import { 
  expertConversations,
  memoryBank,
  decisionPatterns,
  feedbackHistory,
  type ExpertConversation,
  type InsertExpertConversation,
  type MemoryBank,
  type InsertMemoryBank,
  type DecisionPattern,
  type InsertDecisionPattern,
  type FeedbackHistory,
  type InsertFeedbackHistory
} from "../../../drizzle/schema";

/**
 * Repository for AI expert-related database operations
 */
export class ExpertRepository extends BaseRepository {
  constructor() {
    super("ExpertRepository");
  }

  // ==================== Conversations ====================

  /**
   * Create an expert conversation entry
   */
  async createConversation(entry: InsertExpertConversation): Promise<ExpertConversation | null> {
    try {
      const db = await this.getDatabase();
      this.logOperation("createConversation", { expertId: entry.expertId, userId: entry.userId });

      const [conversation] = await db
        .insert(expertConversations)
        .values(entry)
        .returning();

      return conversation || null;
    } catch (error) {
      this.handleError("createConversation", error as Error, { entry });
    }
  }

  /**
   * Get conversation history
   */
  async getConversations(
    userId: number,
    options?: { expertId?: string; projectId?: number; limit?: number }
  ): Promise<ExpertConversation[]> {
    try {
      const db = await this.getDatabase();
      
      let query = db
        .select()
        .from(expertConversations)
        .where(eq(expertConversations.userId, userId));

      if (options?.expertId) {
        query = query.where(and(
          eq(expertConversations.userId, userId),
          eq(expertConversations.expertId, options.expertId)
        )) as any;
      }

      if (options?.projectId) {
        query = query.where(and(
          eq(expertConversations.userId, userId),
          eq(expertConversations.projectId, options.projectId)
        )) as any;
      }

      query = query.orderBy(desc(expertConversations.createdAt)) as any;

      if (options?.limit) {
        query = query.limit(options.limit) as any;
      }

      return await query;
    } catch (error) {
      this.handleError("getConversations", error as Error, { userId, options });
    }
  }

  // ==================== Memory Bank ====================

  /**
   * Create a memory entry
   */
  async createMemory(data: InsertMemoryBank): Promise<MemoryBank | null> {
    try {
      const db = await this.getDatabase();
      this.logOperation("createMemory", { userId: data.userId, category: data.category });

      const [memory] = await db
        .insert(memoryBank)
        .values(data)
        .returning();

      return memory || null;
    } catch (error) {
      this.handleError("createMemory", error as Error, { data });
    }
  }

  /**
   * Get memories for a user
   */
  async getMemories(userId: number, category?: string): Promise<MemoryBank[]> {
    try {
      const db = await this.getDatabase();
      
      let query = db
        .select()
        .from(memoryBank)
        .where(eq(memoryBank.userId, userId));

      if (category) {
        query = query.where(and(
          eq(memoryBank.userId, userId),
          eq(memoryBank.category, category)
        )) as any;
      }

      return await query.orderBy(desc(memoryBank.createdAt));
    } catch (error) {
      this.handleError("getMemories", error as Error, { userId, category });
    }
  }

  /**
   * Update a memory entry
   */
  async updateMemory(id: number, data: Partial<InsertMemoryBank>): Promise<void> {
    try {
      const db = await this.getDatabase();
      this.logOperation("updateMemory", { id });

      await db
        .update(memoryBank)
        .set(data)
        .where(eq(memoryBank.id, id));
    } catch (error) {
      this.handleError("updateMemory", error as Error, { id, data });
    }
  }

  // ==================== Decision Patterns ====================

  /**
   * Record a decision pattern
   */
  async recordDecision(data: InsertDecisionPattern): Promise<DecisionPattern | null> {
    try {
      const db = await this.getDatabase();
      this.logOperation("recordDecision", { userId: data.userId });

      const [decision] = await db
        .insert(decisionPatterns)
        .values(data)
        .returning();

      return decision || null;
    } catch (error) {
      this.handleError("recordDecision", error as Error, { data });
    }
  }

  /**
   * Get decision patterns for a user
   */
  async getDecisionPatterns(userId: number, limit: number = 100): Promise<DecisionPattern[]> {
    try {
      const db = await this.getDatabase();
      
      return await db
        .select()
        .from(decisionPatterns)
        .where(eq(decisionPatterns.userId, userId))
        .orderBy(desc(decisionPatterns.createdAt))
        .limit(limit);
    } catch (error) {
      this.handleError("getDecisionPatterns", error as Error, { userId, limit });
    }
  }

  // ==================== Feedback History ====================

  /**
   * Record feedback
   */
  async recordFeedback(data: InsertFeedbackHistory): Promise<FeedbackHistory | null> {
    try {
      const db = await this.getDatabase();
      this.logOperation("recordFeedback", { userId: data.userId, expertId: data.expertId });

      const [feedback] = await db
        .insert(feedbackHistory)
        .values(data)
        .returning();

      return feedback || null;
    } catch (error) {
      this.handleError("recordFeedback", error as Error, { data });
    }
  }

  /**
   * Get feedback history
   */
  async getFeedbackHistory(
    userId: number,
    options?: { expertId?: string; limit?: number }
  ): Promise<FeedbackHistory[]> {
    try {
      const db = await this.getDatabase();
      
      let query = db
        .select()
        .from(feedbackHistory)
        .where(eq(feedbackHistory.userId, userId));

      if (options?.expertId) {
        query = query.where(and(
          eq(feedbackHistory.userId, userId),
          eq(feedbackHistory.expertId, options.expertId)
        )) as any;
      }

      query = query.orderBy(desc(feedbackHistory.createdAt)) as any;

      if (options?.limit) {
        query = query.limit(options.limit) as any;
      }

      return await query;
    } catch (error) {
      this.handleError("getFeedbackHistory", error as Error, { userId, options });
    }
  }
}

// Export singleton instance
export const expertRepository = new ExpertRepository();
