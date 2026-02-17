/**
 * Settings Service Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { settingsService } from './settings.service';
import * as settingsRepository from './settings.repository';

vi.mock('./settings.repository');

describe('SettingsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('updateSettings', () => {
    it('should update user settings', async () => {
      const mockSettings = {
        userId: 1,
        theme: 'dark' as const,
        notifications: true,
        language: 'en',
      };

      vi.spyOn(settingsRepository, 'updateSettings').mockResolvedValue(mockSettings as any);

      const result = await settingsService.updateSettings(1, {
        theme: 'dark',
        notifications: true,
      });

      expect(result.theme).toBe('dark');
    });
  });

  describe('getSettings', () => {
    it('should return user settings', async () => {
      const mockSettings = {
        userId: 1,
        theme: 'light' as const,
        notifications: false,
      };

      vi.spyOn(settingsRepository, 'getSettings').mockResolvedValue(mockSettings as any);

      const result = await settingsService.getSettings(1);

      expect(result).toEqual(mockSettings);
    });
  });
});
