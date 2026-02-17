import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database module
vi.mock('../db', () => ({
  getDb: vi.fn(),
}));

describe('Calendar Sync Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCalendarIntegration', () => {
    it('should return null when database is not available', async () => {
      const { getDb } = await import('../db');
      vi.mocked(getDb).mockResolvedValue(null);

      const { getCalendarIntegration } = await import('./calendarSyncService');
      const result = await getCalendarIntegration(1, 'google');
      
      expect(result).toBeNull();
    });
  });

  describe('getCachedEvents', () => {
    it('should return empty array when database is not available', async () => {
      const { getDb } = await import('../db');
      vi.mocked(getDb).mockResolvedValue(null);

      const { getCachedEvents } = await import('./calendarSyncService');
      const result = await getCachedEvents(
        1,
        new Date('2026-01-17T00:00:00Z'),
        new Date('2026-01-17T23:59:59Z')
      );
      
      expect(result).toEqual([]);
    });
  });

  describe('hasEventsInTimeWindow', () => {
    it('should return false when no events exist', async () => {
      const { getDb } = await import('../db');
      vi.mocked(getDb).mockResolvedValue(null);

      const { hasEventsInTimeWindow } = await import('./calendarSyncService');
      const result = await hasEventsInTimeWindow(
        1,
        new Date('2026-01-17T19:00:00Z'),
        new Date('2026-01-17T21:00:00Z')
      );
      
      expect(result).toBe(false);
    });
  });

  describe('getNextFreeSlot', () => {
    it('should return immediate slot when no events exist', async () => {
      const { getDb } = await import('../db');
      vi.mocked(getDb).mockResolvedValue(null);

      const { getNextFreeSlot } = await import('./calendarSyncService');
      const startTime = new Date('2026-01-17T10:00:00Z');
      const result = await getNextFreeSlot(1, startTime, 30);
      
      expect(result).not.toBeNull();
      expect(result?.start).toEqual(startTime);
      expect(result?.end.getTime() - result?.start.getTime()).toBe(30 * 60000);
    });
  });

  describe('getTodayScheduleSummary', () => {
    it('should return empty summary when no events exist', async () => {
      const { getDb } = await import('../db');
      vi.mocked(getDb).mockResolvedValue(null);

      const { getTodayScheduleSummary } = await import('./calendarSyncService');
      const result = await getTodayScheduleSummary(1);
      
      expect(result.totalEvents).toBe(0);
      expect(result.busyHours).toBe(0);
      expect(result.nextEvent).toBeUndefined();
    });
  });

  describe('syncCalendarEvents', () => {
    it('should return error when database is not available', async () => {
      const { getDb } = await import('../db');
      vi.mocked(getDb).mockResolvedValue(null);

      const { syncCalendarEvents } = await import('./calendarSyncService');
      const result = await syncCalendarEvents(1, 'google');
      
      expect(result.error).toBe('Database not available');
      expect(result.eventsAdded).toBe(0);
    });

    it('should return error when no integration found', async () => {
      const { getDb } = await import('../db');
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const { syncCalendarEvents } = await import('./calendarSyncService');
      const result = await syncCalendarEvents(1, 'google');
      
      expect(result.error).toContain('No google calendar integration found');
    });
  });
});
