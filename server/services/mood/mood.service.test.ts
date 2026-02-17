/**
 * Mood Service Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { moodService } from './mood.service';
import * as moodRepository from './mood.repository';

// Mock the repository
vi.mock('./mood.repository');

describe('MoodService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('recordMood', () => {
    it('should record a mood entry successfully', async () => {
      const mockEntry = {
        id: 1,
        userId: 1,
        score: 75,
        timeOfDay: 'morning' as const,
        note: 'Feeling good',
        createdAt: new Date(),
      };

      vi.spyOn(moodRepository, 'createMoodEntry').mockResolvedValue(mockEntry);

      const result = await moodService.recordMood(1, {
        score: 75,
        timeOfDay: 'morning',
        note: 'Feeling good',
      });

      expect(result).toEqual(mockEntry);
      expect(moodRepository.createMoodEntry).toHaveBeenCalledWith({
        userId: 1,
        score: 75,
        timeOfDay: 'morning',
        note: 'Feeling good',
      });
    });

    it('should throw error for invalid score', async () => {
      await expect(
        moodService.recordMood(1, {
          score: 150, // Invalid score
          timeOfDay: 'morning',
        })
      ).rejects.toThrow('Score must be between 0 and 100');
    });

    it('should throw error for invalid time of day', async () => {
      await expect(
        moodService.recordMood(1, {
          score: 75,
          timeOfDay: 'midnight' as any, // Invalid time
        })
      ).rejects.toThrow('Invalid time of day');
    });
  });

  describe('getMoodHistory', () => {
    it('should return mood history for user', async () => {
      const mockHistory = [
        {
          id: 1,
          userId: 1,
          score: 75,
          timeOfDay: 'morning' as const,
          note: null,
          createdAt: new Date(),
        },
        {
          id: 2,
          userId: 1,
          score: 80,
          timeOfDay: 'afternoon' as const,
          note: null,
          createdAt: new Date(),
        },
      ];

      vi.spyOn(moodRepository, 'getMoodHistory').mockResolvedValue(mockHistory);

      const result = await moodService.getMoodHistory(1, 10, 7);

      expect(result).toEqual(mockHistory);
      expect(moodRepository.getMoodHistory).toHaveBeenCalledWith(1, {
        limit: 10,
        startDate: expect.any(Date),
      });
    });

    it('should return empty array when no history exists', async () => {
      vi.spyOn(moodRepository, 'getMoodHistory').mockResolvedValue([]);

      const result = await moodService.getMoodHistory(1);

      expect(result).toEqual([]);
    });
  });

  describe('getMoodTrends', () => {
    it('should calculate mood trends correctly', async () => {
      const mockHistory = [
        { score: 70, createdAt: new Date('2024-01-01') },
        { score: 75, createdAt: new Date('2024-01-02') },
        { score: 80, createdAt: new Date('2024-01-03') },
      ];

      vi.spyOn(moodRepository, 'getMoodHistory').mockResolvedValue(mockHistory as any);

      const result = await moodService.getMoodTrends(1, 30);

      expect(result).toHaveProperty('average');
      expect(result).toHaveProperty('trend');
      expect(result.average).toBe(75); // (70 + 75 + 80) / 3
    });

    it('should return null when no data available', async () => {
      vi.spyOn(moodRepository, 'getMoodHistory').mockResolvedValue([]);

      const result = await moodService.getMoodTrends(1, 30);

      expect(result).toBeNull();
    });
  });

  describe('getLastMoodCheck', () => {
    it('should return last mood check for time of day', async () => {
      const mockEntry = {
        id: 1,
        userId: 1,
        score: 75,
        timeOfDay: 'morning' as const,
        note: null,
        createdAt: new Date(),
      };

      vi.spyOn(moodRepository, 'getLastMoodCheck').mockResolvedValue(mockEntry);

      const result = await moodService.getLastMoodCheck(1, 'morning');

      expect(result).toEqual(mockEntry);
      expect(moodRepository.getLastMoodCheck).toHaveBeenCalledWith(1, 'morning');
    });

    it('should return null when no check exists', async () => {
      vi.spyOn(moodRepository, 'getLastMoodCheck').mockResolvedValue(null);

      const result = await moodService.getLastMoodCheck(1, 'evening');

      expect(result).toBeNull();
    });
  });
});
