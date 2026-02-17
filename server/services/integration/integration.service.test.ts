/**
 * Integration Service Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { integrationService } from './integration.service';
import * as integrationRepository from './integration.repository';

vi.mock('./integration.repository');

describe('IntegrationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createIntegration', () => {
    it('should create a new integration', async () => {
      const mockIntegration = {
        id: 1,
        userId: 1,
        name: 'Test API',
        type: 'api' as const,
        config: {},
        isActive: true,
        createdAt: new Date(),
      };

      vi.spyOn(integrationRepository, 'createIntegration').mockResolvedValue(mockIntegration);

      const result = await integrationService.createIntegration(1, {
        name: 'Test API',
        type: 'api',
        config: {},
      });

      expect(result).toEqual(mockIntegration);
    });
  });

  describe('testConnection', () => {
    it('should test integration connection', async () => {
      vi.spyOn(integrationRepository, 'testConnection').mockResolvedValue(true);

      const result = await integrationService.testConnection(1);

      expect(result).toBe(true);
    });
  });

  describe('getActiveIntegrations', () => {
    it('should return active integrations', async () => {
      const mockIntegrations = [
        { id: 1, isActive: true },
        { id: 2, isActive: true },
      ];

      vi.spyOn(integrationRepository, 'getActiveIntegrations').mockResolvedValue(mockIntegrations as any);

      const result = await integrationService.getActiveIntegrations(1);

      expect(result).toHaveLength(2);
    });
  });
});
