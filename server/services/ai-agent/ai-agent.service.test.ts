/**
 * AI Agent Service Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { aiAgentService } from './ai-agent.service';
import * as aiAgentRepository from './ai-agent.repository';

vi.mock('./ai-agent.repository');

describe('AIAgentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('submitDailyReport', () => {
    it('should submit agent daily report', async () => {
      const mockReport = {
        id: 1,
        agentId: 'cto',
        date: new Date(),
        activities: ['Research', 'Development'],
        improvements: ['New feature'],
        createdAt: new Date(),
      };

      vi.spyOn(aiAgentRepository, 'submitReport').mockResolvedValue(mockReport as any);

      const result = await aiAgentService.submitDailyReport({
        agentId: 'cto',
        date: new Date(),
        activities: ['Research', 'Development'],
        improvements: ['New feature'],
        suggestions: [],
      });

      expect(result).toEqual(mockReport);
    });
  });

  describe('requestApproval', () => {
    it('should create approval request', async () => {
      const mockRequest = {
        id: 1,
        agentId: 'cto',
        type: 'feature' as const,
        description: 'New feature request',
        status: 'pending' as const,
        createdAt: new Date(),
      };

      vi.spyOn(aiAgentRepository, 'createApprovalRequest').mockResolvedValue(mockRequest as any);

      const result = await aiAgentService.requestApproval({
        agentId: 'cto',
        type: 'feature',
        description: 'New feature request',
      });

      expect(result).toEqual(mockRequest);
    });
  });

  describe('getAgentPerformance', () => {
    it('should return agent performance metrics', async () => {
      const mockPerformance = {
        agentId: 'cto',
        rating: 4.5,
        totalReports: 30,
        approvedRequests: 15,
      };

      vi.spyOn(aiAgentRepository, 'getPerformanceMetrics').mockResolvedValue(mockPerformance as any);

      const result = await aiAgentService.getAgentPerformance('cto');

      expect(result).toHaveProperty('rating');
      expect(result.rating).toBe(4.5);
    });
  });
});
