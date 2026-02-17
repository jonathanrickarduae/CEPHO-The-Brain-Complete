/**
 * Analytics Service Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { analyticsService } from './analytics.service';
import * as analyticsRepository from './analytics.repository';

vi.mock('./analytics.repository');

describe('AnalyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDashboardMetrics', () => {
    it('should return dashboard metrics', async () => {
      const mockMetrics = {
        totalRevenue: 10000,
        qualityScore: 85,
        learningHours: 120,
        engagement: 75,
      };

      vi.spyOn(analyticsRepository, 'getDashboardMetrics').mockResolvedValue(mockMetrics);

      const result = await analyticsService.getDashboardMetrics(1);

      expect(result).toEqual(mockMetrics);
    });
  });

  describe('getMetricsByPeriod', () => {
    it('should return metrics for a specific period', async () => {
      const mockData = [
        { date: new Date(), value: 100 },
        { date: new Date(), value: 150 },
      ];

      vi.spyOn(analyticsRepository, 'getMetricsByPeriod').mockResolvedValue(mockData as any);

      const result = await analyticsService.getMetricsByPeriod(1, 'week');

      expect(result).toHaveLength(2);
    });
  });

  describe('generateReport', () => {
    it('should generate analytics report', async () => {
      const mockReport = {
        summary: 'Report summary',
        metrics: {},
        recommendations: [],
      };

      vi.spyOn(analyticsRepository, 'generateReport').mockResolvedValue(mockReport as any);

      const result = await analyticsService.generateReport(1, {
        startDate: new Date(),
        endDate: new Date(),
      });

      expect(result).toHaveProperty('summary');
    });
  });
});
