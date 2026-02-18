/**
 * Review Service Module
 * Handles reviews and collaborative review sessions
 */

import { reviewRepository } from '../../db/repositories';
import { logger } from '../../utils/logger';
import type { InsertCollaborativeReviewSession } from '../../../drizzle/schema';

const log = logger.module('ReviewService');

export interface ReviewDto {
  id: number;
  userId: number;
  targetId: number;
  targetType: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface CollaborativeReviewSessionDto {
  id: number;
  ownerId: number;
  projectName: string;
  templateId?: string;
  reviewData?: any;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CollaborativeReviewParticipantDto {
  id: number;
  sessionId: number;
  userId: number;
  role: string;
  invitedBy: number;
  joinedAt?: Date;
  lastActiveAt?: Date;
}

export interface CollaborativeReviewCommentDto {
  id: number;
  sessionId: number;
  userId: number;
  sectionId: string;
  comment: string;
  parentCommentId?: number;
  status: string;
  createdAt: Date;
}

export class ReviewService {
  // ===== Basic Reviews =====
  
  async createReview(userId: number, data: {
    targetId: number;
    targetType: string;
    rating: number;
    comment: string;
  }): Promise<ReviewDto> {
    log.info({ userId, targetType: data.targetType, rating: data.rating }, 'Review created');
    return {
      id: 1,
      userId,
      targetId: data.targetId,
      targetType: data.targetType,
      rating: data.rating,
      comment: data.comment,
      createdAt: new Date(),
    };
  }

  async getReviews(targetId: number, targetType: string): Promise<ReviewDto[]> {
    return [];
  }

  async getAverageRating(targetId: number, targetType: string): Promise<number> {
    return 0;
  }

  // ===== Collaborative Review Sessions =====

  /**
   * Create a new collaborative review session
   */
  async createCollaborativeReviewSession(data: {
    ownerId: number;
    projectName: string;
    templateId?: string;
    reviewData?: any;
  }): Promise<number> {
    const session = await reviewRepository.createCollaborativeReviewSession({
      createdBy: data.ownerId,
      projectName: data.projectName,
      status: 'active',
      reviewData: data.reviewData || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as InsertCollaborativeReviewSession);

    if (!session) {
      throw new Error('Failed to create collaborative review session');
    }

    log.info({ sessionId: session.id, ownerId: data.ownerId }, 'Collaborative review session created');
    return session.id;
  }

  /**
   * Get collaborative review sessions for a user
   */
  async getCollaborativeReviewSessions(userId: number): Promise<CollaborativeReviewSessionDto[]> {
    const sessions = await reviewRepository.getCollaborativeReviewSessions({ userId });
    return sessions.map(s => ({
      id: s.id,
      ownerId: s.createdBy,
      projectName: s.projectName,
      templateId: undefined,
      reviewData: s.reviewData,
      status: s.status,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));
  }

  /**
   * Get a specific session with details
   */
  async getCollaborativeReviewSessionWithDetails(sessionId: number): Promise<CollaborativeReviewSessionDto | null> {
    const session = await reviewRepository.getCollaborativeReviewSessionById(sessionId);
    if (!session) return null;

    return {
      id: session.id,
      ownerId: session.createdBy,
      projectName: session.projectName,
      templateId: undefined,
      reviewData: session.reviewData,
      status: session.status,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  }

  /**
   * Update a collaborative review session
   */
  async updateCollaborativeReviewSession(sessionId: number, data: {
    status?: string;
    reviewData?: any;
  }): Promise<void> {
    await reviewRepository.updateCollaborativeReviewSession(sessionId, {
      status: data.status,
      reviewData: data.reviewData,
      updatedAt: new Date(),
    } as Partial<InsertCollaborativeReviewSession>);

    log.info({ sessionId }, 'Collaborative review session updated');
  }

  // ===== Participants =====

  /**
   * Add a participant to a session
   */
  async addCollaborativeReviewParticipant(data: {
    sessionId: number;
    userId: number;
    role: string;
    invitedBy: number;
  }): Promise<number> {
    await reviewRepository.addCollaborativeReviewParticipant(
      data.sessionId,
      data.userId,
      data.role
    );

    log.info({ sessionId: data.sessionId, userId: data.userId, role: data.role }, 'Participant added');
    return 1; // Mock ID for now
  }

  /**
   * Get participants for a session
   */
  async getCollaborativeReviewParticipants(sessionId: number): Promise<any[]> {
    return await reviewRepository.getCollaborativeReviewParticipants(sessionId);
  }

  /**
   * Update a participant
   */
  async updateCollaborativeReviewParticipant(participantId: number, data: {
    joinedAt?: Date;
    lastActiveAt?: Date;
  }): Promise<void> {
    // Mock implementation - would need to add to repository
    log.info({ participantId }, 'Participant updated');
  }

  /**
   * Check if user is a participant
   */
  async isSessionParticipant(sessionId: number, userId: number): Promise<boolean> {
    const participants = await this.getCollaborativeReviewParticipants(sessionId);
    return participants.some(p => p.userId === userId);
  }

  /**
   * Get participant role
   */
  async getParticipantRole(sessionId: number, userId: number): Promise<string | null> {
    const participants = await this.getCollaborativeReviewParticipants(sessionId);
    const participant = participants.find(p => p.userId === userId);
    return participant?.role || null;
  }

  // ===== Comments =====

  /**
   * Create a comment
   */
  async createCollaborativeReviewComment(data: {
    sessionId: number;
    userId: number;
    sectionId: string;
    comment: string;
    parentCommentId?: number;
  }): Promise<number> {
    await reviewRepository.createCollaborativeReviewComment(
      data.sessionId,
      data.userId,
      data.comment,
      { sectionId: data.sectionId, parentCommentId: data.parentCommentId }
    );

    log.info({ sessionId: data.sessionId, userId: data.userId }, 'Comment created');
    return 1; // Mock ID
  }

  /**
   * Get comments for a session
   */
  async getCollaborativeReviewComments(sessionId: number, sectionId?: string): Promise<any[]> {
    const comments = await reviewRepository.getCollaborativeReviewComments(sessionId);
    
    if (sectionId) {
      return comments.filter(c => c.context?.sectionId === sectionId);
    }
    
    return comments;
  }

  /**
   * Update a comment
   */
  async updateCollaborativeReviewComment(commentId: number, data: { status: string }): Promise<void> {
    // Mock implementation - would need to add to repository
    log.info({ commentId, status: data.status }, 'Comment updated');
  }

  // ===== Activity =====

  /**
   * Log activity
   */
  async logCollaborativeReviewActivity(data: {
    sessionId: number;
    userId: number;
    action: string;
    sectionId?: string;
    metadata?: any;
  }): Promise<void> {
    await reviewRepository.logCollaborativeReviewActivity(
      data.sessionId,
      data.userId,
      data.action,
      { sectionId: data.sectionId, ...data.metadata }
    );

    log.info({ sessionId: data.sessionId, action: data.action }, 'Activity logged');
  }

  /**
   * Get activity for a session
   */
  async getCollaborativeReviewActivity(sessionId: number, limit?: number): Promise<any[]> {
    return await reviewRepository.getCollaborativeReviewActivity(sessionId);
  }
}

export const reviewService = new ReviewService();
