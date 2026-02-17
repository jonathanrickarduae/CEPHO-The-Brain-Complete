/**
 * Settings Service Module
 */

import { logger } from '../../utils/logger';
const log = logger.module('SettingsService');

export interface UserSettingsDto {
  userId: number;
  theme: string;
  notifications: boolean;
  language: string;
  timezone: string;
}

export class SettingsService {
  async getSettings(userId: number): Promise<UserSettingsDto> {
    return {
      userId,
      theme: 'light',
      notifications: true,
      language: 'en',
      timezone: 'UTC',
    };
  }

  async updateSettings(userId: number, settings: Partial<UserSettingsDto>): Promise<UserSettingsDto> {
    log.info({ userId, updates: Object.keys(settings) }, 'Settings updated');
    return this.getSettings(userId);
  }
}

export const settingsService = new SettingsService();
