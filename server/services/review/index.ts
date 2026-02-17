/**
 * Review Service Module
 */

import { logger } from '../../utils/logger';
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

export class ReviewService {
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
}

export const reviewService = new ReviewService();
