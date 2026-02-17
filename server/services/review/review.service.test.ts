/**
 * Review Service Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { reviewService } from './review.service';
import * as reviewRepository from './review.repository';

vi.mock('./review.repository');

describe('ReviewService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createReview', () => {
    it('should create a review', async () => {
      const mockReview = {
        id: 1,
        userId: 1,
        targetId: 1,
        targetType: 'project' as const,
        rating: 5,
        comment: 'Great!',
        createdAt: new Date(),
      };

      vi.spyOn(reviewRepository, 'createReview').mockResolvedValue(mockReview as any);

      const result = await reviewService.createReview(1, {
        targetId: 1,
        targetType: 'project',
        rating: 5,
        comment: 'Great!',
      });

      expect(result).toEqual(mockReview);
    });
  });

  describe('getReviews', () => {
    it('should return reviews for target', async () => {
      const mockReviews = [
        { id: 1, rating: 5 },
        { id: 2, rating: 4 },
      ];

      vi.spyOn(reviewRepository, 'getReviews').mockResolvedValue(mockReviews as any);

      const result = await reviewService.getReviews(1, 'project');

      expect(result).toHaveLength(2);
    });
  });
});
