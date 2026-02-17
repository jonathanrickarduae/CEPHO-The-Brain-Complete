/**
 * Business Plan Service Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { businessPlanService } from './business-plan.service';
import * as businessPlanRepository from './business-plan.repository';

vi.mock('./business-plan.repository');

describe('BusinessPlanService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createReview', () => {
    it('should create a new business plan review', async () => {
      const mockReview = {
        id: 1,
        userId: 1,
        planId: 1,
        version: 1,
        content: 'Review content',
        createdAt: new Date(),
      };

      vi.spyOn(businessPlanRepository, 'createReview').mockResolvedValue(mockReview);

      const result = await businessPlanService.createReview(1, {
        planId: 1,
        version: 1,
        content: 'Review content',
      });

      expect(result).toEqual(mockReview);
    });
  });

  describe('getReviewHistory', () => {
    it('should return review history for a plan', async () => {
      const mockHistory = [
        { id: 1, version: 1, createdAt: new Date() },
        { id: 2, version: 2, createdAt: new Date() },
      ];

      vi.spyOn(businessPlanRepository, 'getReviewHistory').mockResolvedValue(mockHistory as any);

      const result = await businessPlanService.getReviewHistory(1);

      expect(result).toHaveLength(2);
    });
  });

  describe('compareVersions', () => {
    it('should compare two review versions', async () => {
      const mockReview1 = { id: 1, version: 1, content: 'V1' };
      const mockReview2 = { id: 2, version: 2, content: 'V2' };

      vi.spyOn(businessPlanRepository, 'getReviewByVersion')
        .mockResolvedValueOnce(mockReview1 as any)
        .mockResolvedValueOnce(mockReview2 as any);

      const result = await businessPlanService.compareVersions(1, 1, 2);

      expect(result).toHaveProperty('version1');
      expect(result).toHaveProperty('version2');
    });
  });
});
