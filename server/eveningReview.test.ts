import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as db from './db';

// Mock the database functions
vi.mock('./db', async () => {
  const actual = await vi.importActual('./db');
  return {
    ...actual,
    getDb: vi.fn().mockResolvedValue({}),
    createEveningReviewSession: vi.fn(),
    getEveningReviewSessions: vi.fn(),
    getLatestEveningReviewSession: vi.fn(),
    updateEveningReviewSession: vi.fn(),
    createEveningReviewTaskDecisions: vi.fn(),
    getEveningReviewTaskDecisions: vi.fn(),
    getReviewTimingPattern: vi.fn(),
    getAllReviewTimingPatterns: vi.fn(),
    updateReviewTimingPattern: vi.fn(),
    getPredictedReviewTime: vi.fn(),
    createSignalItems: vi.fn(),
    getSignalItems: vi.fn(),
    getPendingSignalItems: vi.fn(),
    updateSignalItemStatus: vi.fn(),
    generateSignalItemsFromReview: vi.fn(),
    getCachedCalendarEvents: vi.fn(),
    hasEventsInWindow: vi.fn(),
  };
});

describe('Evening Review System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Session Management', () => {
    it('should create a new evening review session', async () => {
      const mockSessionId = 123;
      vi.mocked(db.createEveningReviewSession).mockResolvedValue(mockSessionId);

      const result = await db.createEveningReviewSession({
        userId: 1,
        reviewDate: new Date(),
        startedAt: new Date(),
        mode: 'manual',
      });

      expect(result).toBe(mockSessionId);
      expect(db.createEveningReviewSession).toHaveBeenCalledTimes(1);
    });

    it('should get evening review sessions for a user', async () => {
      const mockSessions = [
        { id: 1, userId: 1, mode: 'manual', tasksAccepted: 5 },
        { id: 2, userId: 1, mode: 'delegated', tasksAccepted: 3 },
      ];
      vi.mocked(db.getEveningReviewSessions).mockResolvedValue(mockSessions as any);

      const result = await db.getEveningReviewSessions(1, { limit: 10 });

      expect(result).toEqual(mockSessions);
      expect(db.getEveningReviewSessions).toHaveBeenCalledWith(1, { limit: 10 });
    });

    it('should get the latest evening review session', async () => {
      const mockSession = { id: 1, userId: 1, mode: 'manual' };
      vi.mocked(db.getLatestEveningReviewSession).mockResolvedValue(mockSession as any);

      const result = await db.getLatestEveningReviewSession(1);

      expect(result).toEqual(mockSession);
    });
  });

  describe('Task Decisions', () => {
    it('should create task decisions for a review session', async () => {
      const decisions = [
        { sessionId: 1, taskTitle: 'Task 1', decision: 'accepted' as const },
        { sessionId: 1, taskTitle: 'Task 2', decision: 'deferred' as const },
      ];

      await db.createEveningReviewTaskDecisions(decisions);

      expect(db.createEveningReviewTaskDecisions).toHaveBeenCalledWith(decisions);
    });

    it('should get task decisions for a session', async () => {
      const mockDecisions = [
        { id: 1, sessionId: 1, taskTitle: 'Task 1', decision: 'accepted' },
        { id: 2, sessionId: 1, taskTitle: 'Task 2', decision: 'deferred' },
      ];
      vi.mocked(db.getEveningReviewTaskDecisions).mockResolvedValue(mockDecisions as any);

      const result = await db.getEveningReviewTaskDecisions(1);

      expect(result).toEqual(mockDecisions);
    });
  });

  describe('Timing Patterns (Learning)', () => {
    it('should get timing pattern for a specific day', async () => {
      const mockPattern = {
        id: 1,
        userId: 1,
        dayOfWeek: 1,
        averageStartTime: '19:30',
        sampleCount: 5,
      };
      vi.mocked(db.getReviewTimingPattern).mockResolvedValue(mockPattern as any);

      const result = await db.getReviewTimingPattern(1, 1);

      expect(result).toEqual(mockPattern);
      expect(db.getReviewTimingPattern).toHaveBeenCalledWith(1, 1);
    });

    it('should get all timing patterns for a user', async () => {
      const mockPatterns = [
        { dayOfWeek: 0, averageStartTime: '19:00', sampleCount: 3 },
        { dayOfWeek: 1, averageStartTime: '19:30', sampleCount: 5 },
      ];
      vi.mocked(db.getAllReviewTimingPatterns).mockResolvedValue(mockPatterns as any);

      const result = await db.getAllReviewTimingPatterns(1);

      expect(result).toEqual(mockPatterns);
    });

    it('should update timing pattern with new review data', async () => {
      await db.updateReviewTimingPattern(1, 1, '19:45', 20, false);

      expect(db.updateReviewTimingPattern).toHaveBeenCalledWith(1, 1, '19:45', 20, false);
    });

    it('should get predicted review time for a day', async () => {
      vi.mocked(db.getPredictedReviewTime).mockResolvedValue('19:30');

      const result = await db.getPredictedReviewTime(1, 1);

      expect(result).toBe('19:30');
    });
  });

  describe('Signal Items (Morning Brief)', () => {
    it('should create signal items', async () => {
      const items = [
        { userId: 1, sourceType: 'evening_review' as const, category: 'task_summary' as const, title: 'Summary', targetDate: new Date() },
      ];

      await db.createSignalItems(items);

      expect(db.createSignalItems).toHaveBeenCalledWith(items);
    });

    it('should get signal items for a date', async () => {
      const mockItems = [
        { id: 1, title: 'Task Summary', category: 'task_summary' },
        { id: 2, title: 'Reflection', category: 'reflection' },
      ];
      vi.mocked(db.getSignalItems).mockResolvedValue(mockItems as any);

      const result = await db.getSignalItems(1, new Date());

      expect(result).toEqual(mockItems);
    });

    it('should get pending signal items', async () => {
      const mockItems = [
        { id: 1, title: 'Pending Item', status: 'pending' },
      ];
      vi.mocked(db.getPendingSignalItems).mockResolvedValue(mockItems as any);

      const result = await db.getPendingSignalItems(1);

      expect(result).toEqual(mockItems);
    });

    it('should update signal item status', async () => {
      await db.updateSignalItemStatus(1, 'delivered');

      expect(db.updateSignalItemStatus).toHaveBeenCalledWith(1, 'delivered');
    });

    it('should generate signal items from review', async () => {
      vi.mocked(db.generateSignalItemsFromReview).mockResolvedValue(3);

      const decisions = [
        { id: 1, sessionId: 1, taskTitle: 'Task 1', decision: 'accepted' as const },
      ];

      const result = await db.generateSignalItemsFromReview(1, 1, decisions as any, 7);

      expect(result).toBe(3);
    });
  });

  describe('Calendar Integration', () => {
    it('should check for events in a time window', async () => {
      vi.mocked(db.hasEventsInWindow).mockResolvedValue(true);

      const result = await db.hasEventsInWindow(1, new Date(), new Date());

      expect(result).toBe(true);
    });

    it('should return false when no events in window', async () => {
      vi.mocked(db.hasEventsInWindow).mockResolvedValue(false);

      const result = await db.hasEventsInWindow(1, new Date(), new Date());

      expect(result).toBe(false);
    });

    it('should get cached calendar events', async () => {
      const mockEvents = [
        { id: 1, title: 'Meeting', startTime: new Date() },
      ];
      vi.mocked(db.getCachedCalendarEvents).mockResolvedValue(mockEvents as any);

      const result = await db.getCachedCalendarEvents(1, new Date(), new Date());

      expect(result).toEqual(mockEvents);
    });
  });
});
