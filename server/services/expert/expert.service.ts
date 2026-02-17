import { ExpertRepository } from './expert.repository';
import {
  CreateExpertChatSessionDto,
  CreateExpertChatMessageDto,
  CreateExpertConsultationDto,
  CreateExpertMemoryDto,
  UpdateExpertPerformanceDto,
  ExpertChatSessionDto,
  ExpertChatMessageDto,
  ExpertConsultationDto,
  ExpertPerformanceDto,
  ExpertMemoryDto,
} from './expert.types';
import { logger } from '../../utils/logger';

const log = logger.module('ExpertService');

/**
 * Expert Service
 * 
 * Handles business logic for AI expert interactions:
 * - Chat sessions and messages
 * - Consultations
 * - Performance tracking
 * - Memory and learning
 */
export class ExpertService {
  constructor(private repository: ExpertRepository) {}

  // ===== Chat Sessions =====

  /**
   * Create a new expert chat session
   */
  async createChatSession(
    userId: number,
    data: CreateExpertChatSessionDto
  ): Promise<ExpertChatSessionDto> {
    this.validateExpertId(data.expertId);

    const session = await this.repository.createChatSession({
      userId,
      expertId: data.expertId,
      topic: data.topic || null,
      status: 'active',
    });

    log.info({ userId, expertId: data.expertId }, 'Expert chat session created');

    return this.toChatSessionDto(session);
  }

  /**
   * Get chat session by ID
   */
  async getChatSession(userId: number, sessionId: number): Promise<ExpertChatSessionDto | null> {
    const session = await this.repository.findChatSessionById(sessionId, userId);
    return session ? this.toChatSessionDto(session) : null;
  }

  /**
   * Get all chat sessions for a user
   */
  async getUserChatSessions(userId: number): Promise<ExpertChatSessionDto[]> {
    const sessions = await this.repository.findChatSessionsByUserId(userId);
    return sessions.map(s => this.toChatSessionDto(s));
  }

  /**
   * Get chat sessions for a specific expert
   */
  async getExpertChatSessions(
    userId: number,
    expertId: string
  ): Promise<ExpertChatSessionDto[]> {
    const sessions = await this.repository.findChatSessionsByExpertId(userId, expertId);
    return sessions.map(s => this.toChatSessionDto(s));
  }

  /**
   * Complete a chat session
   */
  async completeChatSession(userId: number, sessionId: number): Promise<ExpertChatSessionDto | null> {
    const updated = await this.repository.updateChatSession(sessionId, userId, {
      status: 'completed',
    });

    if (updated) {
      log.info({ userId, sessionId }, 'Expert chat session completed');
    }

    return updated ? this.toChatSessionDto(updated) : null;
  }

  // ===== Chat Messages =====

  /**
   * Add a message to a chat session
   */
  async addChatMessage(
    userId: number,
    data: CreateExpertChatMessageDto
  ): Promise<ExpertChatMessageDto> {
    // Verify session belongs to user
    const session = await this.repository.findChatSessionById(data.sessionId, userId);
    if (!session) {
      throw new Error('Chat session not found');
    }

    const message = await this.repository.createChatMessage({
      sessionId: data.sessionId,
      role: data.role,
      content: data.content,
      metadata: data.metadata || null,
    });

    // Update session timestamp
    await this.repository.updateChatSession(data.sessionId, userId, {
      updatedAt: new Date(),
    });

    log.info({ userId, sessionId: data.sessionId, role: data.role }, 'Chat message added');

    return this.toChatMessageDto(message);
  }

  /**
   * Get all messages for a chat session
   */
  async getChatMessages(userId: number, sessionId: number): Promise<ExpertChatMessageDto[]> {
    // Verify session belongs to user
    const session = await this.repository.findChatSessionById(sessionId, userId);
    if (!session) {
      throw new Error('Chat session not found');
    }

    const messages = await this.repository.findChatMessagesBySessionId(sessionId);
    return messages.map(m => this.toChatMessageDto(m));
  }

  // ===== Consultations =====

  /**
   * Create a new expert consultation
   */
  async createConsultation(
    userId: number,
    data: CreateExpertConsultationDto
  ): Promise<ExpertConsultationDto> {
    this.validateExpertId(data.expertId);

    const consultation = await this.repository.createConsultation({
      userId,
      expertId: data.expertId,
      topic: data.topic,
      description: data.description || null,
      status: 'pending',
      priority: data.priority || 'medium',
      startedAt: null,
      completedAt: null,
    });

    log.info({ userId, expertId: data.expertId, topic: data.topic }, 'Expert consultation created');

    return this.toConsultationDto(consultation);
  }

  /**
   * Start a consultation
   */
  async startConsultation(userId: number, consultationId: number): Promise<ExpertConsultationDto | null> {
    const updated = await this.repository.updateConsultation(consultationId, userId, {
      status: 'in_progress',
      startedAt: new Date(),
    });

    if (updated) {
      log.info({ userId, consultationId }, 'Expert consultation started');
    }

    return updated ? this.toConsultationDto(updated) : null;
  }

  /**
   * Complete a consultation
   */
  async completeConsultation(userId: number, consultationId: number): Promise<ExpertConsultationDto | null> {
    const updated = await this.repository.updateConsultation(consultationId, userId, {
      status: 'completed',
      completedAt: new Date(),
    });

    if (updated) {
      log.info({ userId, consultationId }, 'Expert consultation completed');
      
      // Update expert performance
      await this.incrementProjectsCompleted(userId, updated.expertId);
    }

    return updated ? this.toConsultationDto(updated) : null;
  }

  /**
   * Get all consultations for a user
   */
  async getUserConsultations(userId: number): Promise<ExpertConsultationDto[]> {
    const consultations = await this.repository.findConsultationsByUserId(userId);
    return consultations.map(c => this.toConsultationDto(c));
  }

  // ===== Performance =====

  /**
   * Get expert performance metrics
   */
  async getExpertPerformance(userId: number, expertId: string): Promise<ExpertPerformanceDto> {
    const performance = await this.repository.findOrCreatePerformance(userId, expertId);
    return this.toPerformanceDto(performance);
  }

  /**
   * Get all expert performance metrics for a user
   */
  async getAllExpertPerformance(userId: number): Promise<ExpertPerformanceDto[]> {
    const performances = await this.repository.findAllPerformance(userId);
    return performances.map(p => this.toPerformanceDto(p));
  }

  /**
   * Update expert performance
   */
  async updateExpertPerformance(
    userId: number,
    expertId: string,
    data: UpdateExpertPerformanceDto
  ): Promise<ExpertPerformanceDto | null> {
    const updated = await this.repository.updatePerformance(userId, expertId, data);
    
    if (updated) {
      log.info({ userId, expertId, updates: data }, 'Expert performance updated');
    }

    return updated ? this.toPerformanceDto(updated) : null;
  }

  /**
   * Record positive feedback for an expert
   */
  async recordPositiveFeedback(userId: number, expertId: string): Promise<void> {
    const performance = await this.repository.findOrCreatePerformance(userId, expertId);
    
    await this.repository.updatePerformance(userId, expertId, {
      positiveFeedback: performance.positiveFeedback + 1,
      score: Math.min(100, performance.score + 2), // Increase score by 2, max 100
      lastUsed: new Date(),
    });

    log.info({ userId, expertId }, 'Positive feedback recorded');
  }

  /**
   * Record negative feedback for an expert
   */
  async recordNegativeFeedback(userId: number, expertId: string): Promise<void> {
    const performance = await this.repository.findOrCreatePerformance(userId, expertId);
    
    await this.repository.updatePerformance(userId, expertId, {
      negativeFeedback: performance.negativeFeedback + 1,
      score: Math.max(0, performance.score - 5), // Decrease score by 5, min 0
      lastUsed: new Date(),
    });

    log.warn({ userId, expertId }, 'Negative feedback recorded');
  }

  // ===== Memory =====

  /**
   * Create expert memory
   */
  async createMemory(userId: number, data: CreateExpertMemoryDto): Promise<ExpertMemoryDto> {
    this.validateExpertId(data.expertId);

    const memory = await this.repository.createMemory({
      userId,
      expertId: data.expertId,
      memoryType: data.memoryType,
      content: data.content,
      context: data.context || null,
      importance: data.importance || 5,
      lastAccessed: null,
    });

    log.info({ userId, expertId: data.expertId, memoryType: data.memoryType }, 'Expert memory created');

    return this.toMemoryDto(memory);
  }

  /**
   * Get expert memories
   */
  async getExpertMemories(userId: number, expertId: string): Promise<ExpertMemoryDto[]> {
    const memories = await this.repository.findMemoriesByExpertId(userId, expertId);
    
    // Update last accessed for all retrieved memories
    for (const memory of memories) {
      await this.repository.updateMemoryLastAccessed(memory.id);
    }

    return memories.map(m => this.toMemoryDto(m));
  }

  // ===== Private Helper Methods =====

  private async incrementProjectsCompleted(userId: number, expertId: string): Promise<void> {
    const performance = await this.repository.findOrCreatePerformance(userId, expertId);
    
    await this.repository.updatePerformance(userId, expertId, {
      projectsCompleted: performance.projectsCompleted + 1,
      lastUsed: new Date(),
    });
  }

  private validateExpertId(expertId: string): void {
    if (!expertId || expertId.trim().length === 0) {
      throw new Error('Expert ID is required');
    }
  }

  private toChatSessionDto(session: any): ExpertChatSessionDto {
    return {
      id: session.id,
      userId: session.userId,
      expertId: session.expertId,
      topic: session.topic,
      status: session.status,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  }

  private toChatMessageDto(message: any): ExpertChatMessageDto {
    return {
      id: message.id,
      sessionId: message.sessionId,
      role: message.role,
      content: message.content,
      metadata: message.metadata,
      createdAt: message.createdAt,
    };
  }

  private toConsultationDto(consultation: any): ExpertConsultationDto {
    return {
      id: consultation.id,
      userId: consultation.userId,
      expertId: consultation.expertId,
      topic: consultation.topic,
      description: consultation.description,
      status: consultation.status,
      priority: consultation.priority,
      startedAt: consultation.startedAt,
      completedAt: consultation.completedAt,
      createdAt: consultation.createdAt,
    };
  }

  private toPerformanceDto(performance: any): ExpertPerformanceDto {
    return {
      id: performance.id,
      userId: performance.userId,
      expertId: performance.expertId,
      score: performance.score,
      projectsCompleted: performance.projectsCompleted,
      positiveFeedback: performance.positiveFeedback,
      negativeFeedback: performance.negativeFeedback,
      lastUsed: performance.lastUsed,
      status: performance.status,
      notes: performance.notes,
    };
  }

  private toMemoryDto(memory: any): ExpertMemoryDto {
    return {
      id: memory.id,
      userId: memory.userId,
      expertId: memory.expertId,
      memoryType: memory.memoryType,
      content: memory.content,
      context: memory.context,
      importance: memory.importance,
      lastAccessed: memory.lastAccessed,
      createdAt: memory.createdAt,
    };
  }
}

// Export singleton instance
import { ExpertRepository as ExpertRepo } from './expert.repository';
export const expertService = new ExpertService(new ExpertRepo());
