import { BusinessPlanRepository } from './business-plan.repository';
import {
  CreateBusinessPlanReviewDto,
  UpdateBusinessPlanReviewDto,
  BusinessPlanReviewDto,
  BusinessPlanReviewSummaryDto,
} from './business-plan.types';
import { logger } from '../../utils/logger';

const log = logger.module('BusinessPlanService');

/**
 * Business Plan Service
 * 
 * Handles business logic for business plan reviews:
 * - Creating and managing review versions
 * - Tracking feedback and iterations
 * - Version history and comparisons
 */
export class BusinessPlanService {
  constructor(private repository: BusinessPlanRepository) {}

  /**
   * Create a new business plan review
   */
  async createReview(
    userId: number,
    data: CreateBusinessPlanReviewDto
  ): Promise<BusinessPlanReviewDto> {
    // Validation
    this.validateBusinessPlanContent(data.businessPlanContent);

    // Get next version number
    const versionNumber = await this.repository.getNextVersionNumber(userId);

    const review = await this.repository.create({
      userId,
      versionNumber,
      businessPlanContent: data.businessPlanContent,
      reviewNotes: data.notes || null,
      expertFeedback: null,
    });

    log.info({ userId, versionNumber }, 'Business plan review created');

    return this.toDto(review);
  }

  /**
   * Get review by ID
   */
  async getReview(userId: number, reviewId: number): Promise<BusinessPlanReviewDto | null> {
    const review = await this.repository.findById(reviewId, userId);
    return review ? this.toDto(review) : null;
  }

  /**
   * Get all reviews for a user
   */
  async getUserReviews(userId: number): Promise<BusinessPlanReviewDto[]> {
    const reviews = await this.repository.findByUserId(userId);
    return reviews.map(r => this.toDto(r));
  }

  /**
   * Get latest review
   */
  async getLatestReview(userId: number): Promise<BusinessPlanReviewDto | null> {
    const review = await this.repository.findLatest(userId);
    return review ? this.toDto(review) : null;
  }

  /**
   * Get review by version number
   */
  async getReviewByVersion(
    userId: number,
    versionNumber: number
  ): Promise<BusinessPlanReviewDto | null> {
    const review = await this.repository.findByVersion(userId, versionNumber);
    return review ? this.toDto(review) : null;
  }

  /**
   * Update review notes
   */
  async updateReviewNotes(
    userId: number,
    reviewId: number,
    notes: string
  ): Promise<BusinessPlanReviewDto | null> {
    const updated = await this.repository.update(reviewId, userId, {
      reviewNotes: notes,
    });

    if (updated) {
      log.info({ userId, reviewId }, 'Review notes updated');
    }

    return updated ? this.toDto(updated) : null;
  }

  /**
   * Add expert feedback to review
   */
  async addExpertFeedback(
    userId: number,
    reviewId: number,
    feedback: string
  ): Promise<BusinessPlanReviewDto | null> {
    this.validateFeedback(feedback);

    const updated = await this.repository.update(reviewId, userId, {
      expertFeedback: feedback,
    });

    if (updated) {
      log.info({ userId, reviewId }, 'Expert feedback added');
    }

    return updated ? this.toDto(updated) : null;
  }

  /**
   * Update review
   */
  async updateReview(
    userId: number,
    reviewId: number,
    data: UpdateBusinessPlanReviewDto
  ): Promise<BusinessPlanReviewDto | null> {
    if (data.expertFeedback) {
      this.validateFeedback(data.expertFeedback);
    }

    const updated = await this.repository.update(reviewId, userId, data);

    if (updated) {
      log.info({ userId, reviewId, updates: Object.keys(data) }, 'Review updated');
    }

    return updated ? this.toDto(updated) : null;
  }

  /**
   * Delete review
   */
  async deleteReview(userId: number, reviewId: number): Promise<boolean> {
    const deleted = await this.repository.delete(reviewId, userId);

    if (deleted) {
      log.info({ userId, reviewId }, 'Review deleted');
    }

    return deleted;
  }

  /**
   * Get review summary statistics
   */
  async getReviewSummary(userId: number): Promise<BusinessPlanReviewSummaryDto> {
    const totalReviews = await this.repository.countByUserId(userId);
    const latest = await this.repository.findLatest(userId);

    return {
      totalReviews,
      latestVersion: latest?.versionNumber || 0,
      lastReviewDate: latest?.createdAt || null,
      hasExpertFeedback: latest?.expertFeedback !== null,
    };
  }

  /**
   * Compare two review versions
   */
  async compareVersions(
    userId: number,
    version1: number,
    version2: number
  ): Promise<{
    version1: BusinessPlanReviewDto | null;
    version2: BusinessPlanReviewDto | null;
  }> {
    const [review1, review2] = await Promise.all([
      this.repository.findByVersion(userId, version1),
      this.repository.findByVersion(userId, version2),
    ]);

    return {
      version1: review1 ? this.toDto(review1) : null,
      version2: review2 ? this.toDto(review2) : null,
    };
  }

  /**
   * Get review history (all versions)
   */
  async getReviewHistory(userId: number): Promise<BusinessPlanReviewDto[]> {
    return this.getUserReviews(userId);
  }

  // Private helper methods

  private validateBusinessPlanContent(content: string): void {
    if (!content || content.trim().length === 0) {
      throw new Error('Business plan content is required');
    }
    if (content.length < 100) {
      throw new Error('Business plan content must be at least 100 characters');
    }
  }

  private validateFeedback(feedback: string): void {
    if (!feedback || feedback.trim().length === 0) {
      throw new Error('Feedback cannot be empty');
    }
  }

  private toDto(review: any): BusinessPlanReviewDto {
    return {
      id: review.id,
      userId: review.userId,
      versionNumber: review.versionNumber,
      businessPlanContent: review.businessPlanContent,
      reviewNotes: review.reviewNotes,
      expertFeedback: review.expertFeedback,
      createdAt: review.createdAt,
    };
  }
}

// Export singleton instance
import { BusinessPlanRepository as BusinessPlanRepo } from './business-plan.repository';
export const businessPlanService = new BusinessPlanService(new BusinessPlanRepo());
