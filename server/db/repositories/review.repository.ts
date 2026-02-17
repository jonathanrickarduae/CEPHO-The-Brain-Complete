/**
 * Review Repository
 * 
 * Handles all database operations related to reviews, quality management,
 * assessments, and collaborative review sessions.
 * 
 * @module db/repositories/review
 */

import { eq, and, desc, sql } from "drizzle-orm";
import { BaseRepository } from "./base.repository";
import { 
  eveningReviewSessions,
  eveningReviewTaskDecisions,
  collaborativeReviewSessions,
  collaborativeReviewComments,
  collaborativeReviewParticipants,
  collaborativeReviewActivity,
  businessPlanReviewVersions,
  qualityMetricsSnapshots,
  qualityTickets,
  outputQualityScores,
  taskQaReviews,
  assessmentOutliers,
  reviewTimingPatterns,
  type EveningReviewSession,
  type InsertEveningReviewSession,
  type CollaborativeReviewSession,
  type InsertCollaborativeReviewSession,
  type QualityTicket,
  type InsertQualityTicket
} from "../../../drizzle/schema";

/**
 * Repository for review and quality management operations
 */
export class ReviewRepository extends BaseRepository {
  constructor() {
    super("ReviewRepository");
  }

  // ==================== Evening Reviews ====================

  /**
   * Create an evening review session
   */
  async createEveningReviewSession(data: InsertEveningReviewSession): Promise<EveningReviewSession | null> {
    try {
      const db = await this.getDatabase();
      this.logOperation("createEveningReviewSession", { userId: data.userId });

      const [session] = await db
        .insert(eveningReviewSessions)
        .values(data)
        .returning();

      return session || null;
    } catch (error) {
      this.handleError("createEveningReviewSession", error as Error, { data });
    }
  }

  /**
   * Get evening review sessions for a user
   */
  async getEveningReviewSessions(userId: number, limit: number = 30): Promise<EveningReviewSession[]> {
    try {
      const db = await this.getDatabase();
      
      return await db
        .select()
        .from(eveningReviewSessions)
        .where(eq(eveningReviewSessions.userId, userId))
        .orderBy(desc(eveningReviewSessions.createdAt))
        .limit(limit);
    } catch (error) {
      this.handleError("getEveningReviewSessions", error as Error, { userId, limit });
    }
  }

  /**
   * Get latest evening review session
   */
  async getLatestEveningReviewSession(userId: number): Promise<EveningReviewSession | null> {
    try {
      const db = await this.getDatabase();
      
      const [session] = await db
        .select()
        .from(eveningReviewSessions)
        .where(eq(eveningReviewSessions.userId, userId))
        .orderBy(desc(eveningReviewSessions.createdAt))
        .limit(1);

      return session || null;
    } catch (error) {
      this.handleError("getLatestEveningReviewSession", error as Error, { userId });
    }
  }

  /**
   * Update an evening review session
   */
  async updateEveningReviewSession(id: number, data: Partial<InsertEveningReviewSession>): Promise<void> {
    try {
      const db = await this.getDatabase();
      this.logOperation("updateEveningReviewSession", { id });

      await db
        .update(eveningReviewSessions)
        .set(data)
        .where(eq(eveningReviewSessions.id, id));
    } catch (error) {
      this.handleError("updateEveningReviewSession", error as Error, { id, data });
    }
  }

  /**
   * Create evening review task decisions
   */
  async createEveningReviewTaskDecisions(sessionId: number, decisions: any): Promise<void> {
    try {
      const db = await this.getDatabase();
      this.logOperation("createEveningReviewTaskDecisions", { sessionId });

      await db
        .insert(eveningReviewTaskDecisions)
        .values({ sessionId, decisions });
    } catch (error) {
      this.handleError("createEveningReviewTaskDecisions", error as Error, { sessionId, decisions });
    }
  }

  /**
   * Get evening review task decisions
   */
  async getEveningReviewTaskDecisions(sessionId: number): Promise<any> {
    try {
      const db = await this.getDatabase();
      
      const [result] = await db
        .select()
        .from(eveningReviewTaskDecisions)
        .where(eq(eveningReviewTaskDecisions.sessionId, sessionId));

      return result?.decisions || null;
    } catch (error) {
      this.handleError("getEveningReviewTaskDecisions", error as Error, { sessionId });
    }
  }

  // ==================== Collaborative Reviews ====================

  /**
   * Create a collaborative review session
   */
  async createCollaborativeReviewSession(data: InsertCollaborativeReviewSession): Promise<CollaborativeReviewSession | null> {
    try {
      const db = await this.getDatabase();
      this.logOperation("createCollaborativeReviewSession", { createdBy: data.createdBy });

      const [session] = await db
        .insert(collaborativeReviewSessions)
        .values(data)
        .returning();

      return session || null;
    } catch (error) {
      this.handleError("createCollaborativeReviewSession", error as Error, { data });
    }
  }

  /**
   * Get collaborative review sessions
   */
  async getCollaborativeReviewSessions(filters?: { userId?: number; projectId?: number }): Promise<CollaborativeReviewSession[]> {
    try {
      const db = await this.getDatabase();
      
      let query = db.select().from(collaborativeReviewSessions);

      if (filters?.projectId) {
        query = query.where(eq(collaborativeReviewSessions.projectId, filters.projectId)) as any;
      }

      return await query.orderBy(desc(collaborativeReviewSessions.createdAt));
    } catch (error) {
      this.handleError("getCollaborativeReviewSessions", error as Error, { filters });
    }
  }

  /**
   * Get collaborative review session by ID
   */
  async getCollaborativeReviewSessionById(id: number): Promise<CollaborativeReviewSession | null> {
    try {
      const db = await this.getDatabase();
      
      const [session] = await db
        .select()
        .from(collaborativeReviewSessions)
        .where(eq(collaborativeReviewSessions.id, id));

      return session || null;
    } catch (error) {
      this.handleError("getCollaborativeReviewSessionById", error as Error, { id });
    }
  }

  /**
   * Update collaborative review session
   */
  async updateCollaborativeReviewSession(id: number, data: Partial<InsertCollaborativeReviewSession>): Promise<void> {
    try {
      const db = await this.getDatabase();
      this.logOperation("updateCollaborativeReviewSession", { id });

      await db
        .update(collaborativeReviewSessions)
        .set(data)
        .where(eq(collaborativeReviewSessions.id, id));
    } catch (error) {
      this.handleError("updateCollaborativeReviewSession", error as Error, { id, data });
    }
  }

  /**
   * Add participant to collaborative review
   */
  async addCollaborativeReviewParticipant(sessionId: number, userId: number, role: string): Promise<void> {
    try {
      const db = await this.getDatabase();
      this.logOperation("addCollaborativeReviewParticipant", { sessionId, userId, role });

      await db
        .insert(collaborativeReviewParticipants)
        .values({ sessionId, userId, role });
    } catch (error) {
      this.handleError("addCollaborativeReviewParticipant", error as Error, { sessionId, userId, role });
    }
  }

  /**
   * Get collaborative review participants
   */
  async getCollaborativeReviewParticipants(sessionId: number): Promise<any[]> {
    try {
      const db = await this.getDatabase();
      
      return await db
        .select()
        .from(collaborativeReviewParticipants)
        .where(eq(collaborativeReviewParticipants.sessionId, sessionId));
    } catch (error) {
      this.handleError("getCollaborativeReviewParticipants", error as Error, { sessionId });
    }
  }

  /**
   * Create collaborative review comment
   */
  async createCollaborativeReviewComment(sessionId: number, userId: number, comment: string, context?: any): Promise<void> {
    try {
      const db = await this.getDatabase();
      this.logOperation("createCollaborativeReviewComment", { sessionId, userId });

      await db
        .insert(collaborativeReviewComments)
        .values({ sessionId, userId, comment, context });
    } catch (error) {
      this.handleError("createCollaborativeReviewComment", error as Error, { sessionId, userId, comment });
    }
  }

  /**
   * Get collaborative review comments
   */
  async getCollaborativeReviewComments(sessionId: number): Promise<any[]> {
    try {
      const db = await this.getDatabase();
      
      return await db
        .select()
        .from(collaborativeReviewComments)
        .where(eq(collaborativeReviewComments.sessionId, sessionId))
        .orderBy(desc(collaborativeReviewComments.createdAt));
    } catch (error) {
      this.handleError("getCollaborativeReviewComments", error as Error, { sessionId });
    }
  }

  /**
   * Log collaborative review activity
   */
  async logCollaborativeReviewActivity(sessionId: number, userId: number, activityType: string, details?: any): Promise<void> {
    try {
      const db = await this.getDatabase();
      
      await db
        .insert(collaborativeReviewActivity)
        .values({ sessionId, userId, activityType, details });
    } catch (error) {
      this.handleError("logCollaborativeReviewActivity", error as Error, { sessionId, userId, activityType });
    }
  }

  /**
   * Get collaborative review activity
   */
  async getCollaborativeReviewActivity(sessionId: number): Promise<any[]> {
    try {
      const db = await this.getDatabase();
      
      return await db
        .select()
        .from(collaborativeReviewActivity)
        .where(eq(collaborativeReviewActivity.sessionId, sessionId))
        .orderBy(desc(collaborativeReviewActivity.createdAt));
    } catch (error) {
      this.handleError("getCollaborativeReviewActivity", error as Error, { sessionId });
    }
  }

  // ==================== Quality Management ====================

  /**
   * Create quality ticket
   */
  async createQualityTicket(data: InsertQualityTicket): Promise<QualityTicket | null> {
    try {
      const db = await this.getDatabase();
      this.logOperation("createQualityTicket", { userId: data.userId });

      const [ticket] = await db
        .insert(qualityTickets)
        .values(data)
        .returning();

      return ticket || null;
    } catch (error) {
      this.handleError("createQualityTicket", error as Error, { data });
    }
  }

  /**
   * Update quality ticket
   */
  async updateQualityTicket(id: number, data: Partial<InsertQualityTicket>): Promise<void> {
    try {
      const db = await this.getDatabase();
      this.logOperation("updateQualityTicket", { id });

      await db
        .update(qualityTickets)
        .set(data)
        .where(eq(qualityTickets.id, id));
    } catch (error) {
      this.handleError("updateQualityTicket", error as Error, { id, data });
    }
  }

  /**
   * Get open quality tickets
   */
  async getOpenQualityTickets(userId?: number): Promise<QualityTicket[]> {
    try {
      const db = await this.getDatabase();
      
      let query = db
        .select()
        .from(qualityTickets)
        .where(eq(qualityTickets.status, "open"));

      if (userId) {
        query = query.where(and(
          eq(qualityTickets.status, "open"),
          eq(qualityTickets.userId, userId)
        )) as any;
      }

      return await query.orderBy(desc(qualityTickets.createdAt));
    } catch (error) {
      this.handleError("getOpenQualityTickets", error as Error, { userId });
    }
  }

  /**
   * Create quality metrics snapshot
   */
  async createQualityMetricsSnapshot(userId: number, metrics: any): Promise<void> {
    try {
      const db = await this.getDatabase();
      this.logOperation("createQualityMetricsSnapshot", { userId });

      await db
        .insert(qualityMetricsSnapshots)
        .values({ userId, metrics });
    } catch (error) {
      this.handleError("createQualityMetricsSnapshot", error as Error, { userId, metrics });
    }
  }

  /**
   * Get quality metrics history
   */
  async getQualityMetricsHistory(userId: number, limit: number = 30): Promise<any[]> {
    try {
      const db = await this.getDatabase();
      
      return await db
        .select()
        .from(qualityMetricsSnapshots)
        .where(eq(qualityMetricsSnapshots.userId, userId))
        .orderBy(desc(qualityMetricsSnapshots.createdAt))
        .limit(limit);
    } catch (error) {
      this.handleError("getQualityMetricsHistory", error as Error, { userId, limit });
    }
  }

  /**
   * Create output quality score
   */
  async createOutputQualityScore(outputId: number, score: number, feedback?: string): Promise<void> {
    try {
      const db = await this.getDatabase();
      this.logOperation("createOutputQualityScore", { outputId, score });

      await db
        .insert(outputQualityScores)
        .values({ outputId, score, feedback });
    } catch (error) {
      this.handleError("createOutputQualityScore", error as Error, { outputId, score, feedback });
    }
  }

  /**
   * Get output quality scores
   */
  async getOutputQualityScores(outputId: number): Promise<any[]> {
    try {
      const db = await this.getDatabase();
      
      return await db
        .select()
        .from(outputQualityScores)
        .where(eq(outputQualityScores.outputId, outputId))
        .orderBy(desc(outputQualityScores.createdAt));
    } catch (error) {
      this.handleError("getOutputQualityScores", error as Error, { outputId });
    }
  }

  /**
   * Get low quality outputs
   */
  async getLowQualityOutputs(threshold: number = 3, limit: number = 20): Promise<any[]> {
    try {
      const db = await this.getDatabase();
      
      return await db
        .select()
        .from(outputQualityScores)
        .where(sql`${outputQualityScores.score} < ${threshold}`)
        .orderBy(desc(outputQualityScores.createdAt))
        .limit(limit);
    } catch (error) {
      this.handleError("getLowQualityOutputs", error as Error, { threshold, limit });
    }
  }

  // ==================== Task QA Reviews ====================

  /**
   * Create task QA review
   */
  async createTaskQaReview(taskId: number, reviewerId: number, status: string, feedback?: string): Promise<void> {
    try {
      const db = await this.getDatabase();
      this.logOperation("createTaskQaReview", { taskId, reviewerId, status });

      await db
        .insert(taskQaReviews)
        .values({ taskId, reviewerId, status, feedback });
    } catch (error) {
      this.handleError("createTaskQaReview", error as Error, { taskId, reviewerId, status });
    }
  }

  /**
   * Get task QA reviews
   */
  async getTaskQaReviews(taskId: number): Promise<any[]> {
    try {
      const db = await this.getDatabase();
      
      return await db
        .select()
        .from(taskQaReviews)
        .where(eq(taskQaReviews.taskId, taskId))
        .orderBy(desc(taskQaReviews.createdAt));
    } catch (error) {
      this.handleError("getTaskQaReviews", error as Error, { taskId });
    }
  }

  /**
   * Update task QA review
   */
  async updateTaskQaReview(id: number, status: string, feedback?: string): Promise<void> {
    try {
      const db = await this.getDatabase();
      this.logOperation("updateTaskQaReview", { id, status });

      await db
        .update(taskQaReviews)
        .set({ status, feedback })
        .where(eq(taskQaReviews.id, id));
    } catch (error) {
      this.handleError("updateTaskQaReview", error as Error, { id, status });
    }
  }

  // ==================== Assessment Outliers ====================

  /**
   * Create assessment outlier
   */
  async createAssessmentOutlier(assessmentId: number, metric: string, expectedValue: number, actualValue: number): Promise<void> {
    try {
      const db = await this.getDatabase();
      this.logOperation("createAssessmentOutlier", { assessmentId, metric });

      await db
        .insert(assessmentOutliers)
        .values({ assessmentId, metric, expectedValue, actualValue });
    } catch (error) {
      this.handleError("createAssessmentOutlier", error as Error, { assessmentId, metric });
    }
  }

  /**
   * Get unresolved outliers
   */
  async getUnresolvedOutliers(limit: number = 20): Promise<any[]> {
    try {
      const db = await this.getDatabase();
      
      return await db
        .select()
        .from(assessmentOutliers)
        .where(eq(assessmentOutliers.resolved, false))
        .orderBy(desc(assessmentOutliers.createdAt))
        .limit(limit);
    } catch (error) {
      this.handleError("getUnresolvedOutliers", error as Error, { limit });
    }
  }

  /**
   * Resolve outlier
   */
  async resolveOutlier(id: number, resolution: string): Promise<void> {
    try {
      const db = await this.getDatabase();
      this.logOperation("resolveOutlier", { id });

      await db
        .update(assessmentOutliers)
        .set({ resolved: true, resolution })
        .where(eq(assessmentOutliers.id, id));
    } catch (error) {
      this.handleError("resolveOutlier", error as Error, { id, resolution });
    }
  }

  // ==================== Review Timing Patterns ====================

  /**
   * Update review timing pattern
   */
  async updateReviewTimingPattern(userId: number, pattern: any): Promise<void> {
    try {
      const db = await this.getDatabase();
      this.logOperation("updateReviewTimingPattern", { userId });

      await db
        .insert(reviewTimingPatterns)
        .values({ userId, pattern })
        .onConflictDoUpdate({
          target: reviewTimingPatterns.userId,
          set: { pattern, updatedAt: new Date() }
        });
    } catch (error) {
      this.handleError("updateReviewTimingPattern", error as Error, { userId, pattern });
    }
  }

  /**
   * Get review timing pattern
   */
  async getReviewTimingPattern(userId: number): Promise<any | null> {
    try {
      const db = await this.getDatabase();
      
      const [result] = await db
        .select()
        .from(reviewTimingPatterns)
        .where(eq(reviewTimingPatterns.userId, userId));

      return result?.pattern || null;
    } catch (error) {
      this.handleError("getReviewTimingPattern", error as Error, { userId });
    }
  }

  /**
   * Get all review timing patterns
   */
  async getAllReviewTimingPatterns(): Promise<any[]> {
    try {
      const db = await this.getDatabase();
      
      return await db
        .select()
        .from(reviewTimingPatterns);
    } catch (error) {
      this.handleError("getAllReviewTimingPatterns", error as Error);
    }
  }

  /**
   * Get predicted review time
   */
  async getPredictedReviewTime(userId: number): Promise<number | null> {
    try {
      const pattern = await this.getReviewTimingPattern(userId);
      
      if (!pattern || !pattern.averageTime) {
        return null;
      }

      return pattern.averageTime;
    } catch (error) {
      this.handleError("getPredictedReviewTime", error as Error, { userId });
    }
  }
}

// Export singleton instance
export const reviewRepository = new ReviewRepository();
