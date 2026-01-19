/**
 * Simulation Mode Tests
 * 
 * Tests for the simulation data service that enables
 * Project Genesis to run end-to-end without live OAuth integrations.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  isSimulationMode,
  setSimulationMode,
  getSimulatedCalendarEvents,
  getSimulatedEmails,
  getSimulatedNotionPages,
  getSimulatedTasks,
  getSimulationSummary,
  buildGenesisContext,
} from './services/simulationDataService';

describe('Simulation Data Service', () => {
  beforeEach(() => {
    // Reset simulation mode to enabled before each test
    setSimulationMode(true);
  });

  describe('Simulation Mode Toggle', () => {
    it('should default to enabled', () => {
      expect(isSimulationMode()).toBe(true);
    });

    it('should toggle simulation mode off', () => {
      setSimulationMode(false);
      expect(isSimulationMode()).toBe(false);
    });

    it('should toggle simulation mode on', () => {
      setSimulationMode(false);
      setSimulationMode(true);
      expect(isSimulationMode()).toBe(true);
    });
  });

  describe('Calendar Events', () => {
    it('should return simulated calendar events', () => {
      const events = getSimulatedCalendarEvents();
      expect(Array.isArray(events)).toBe(true);
      expect(events.length).toBeGreaterThan(0);
    });

    it('should have required fields on calendar events', () => {
      const events = getSimulatedCalendarEvents();
      const event = events[0];
      
      expect(event).toHaveProperty('id');
      expect(event).toHaveProperty('calendarId');
      expect(event).toHaveProperty('title');
      expect(event).toHaveProperty('startTime');
      expect(event).toHaveProperty('endTime');
      expect(event).toHaveProperty('isAllDay');
      expect(event).toHaveProperty('attendees');
      expect(event).toHaveProperty('status');
      expect(event).toHaveProperty('source');
    });

    it('should have simulation as source', () => {
      const events = getSimulatedCalendarEvents();
      events.forEach(event => {
        expect(event.source).toBe('simulation');
      });
    });

    it('should have valid timestamps', () => {
      const events = getSimulatedCalendarEvents();
      events.forEach(event => {
        expect(typeof event.startTime).toBe('number');
        expect(typeof event.endTime).toBe('number');
        expect(event.endTime).toBeGreaterThan(event.startTime);
      });
    });
  });

  describe('Emails', () => {
    it('should return simulated emails', () => {
      const emails = getSimulatedEmails();
      expect(Array.isArray(emails)).toBe(true);
      expect(emails.length).toBeGreaterThan(0);
    });

    it('should have required fields on emails', () => {
      const emails = getSimulatedEmails();
      const email = emails[0];
      
      expect(email).toHaveProperty('id');
      expect(email).toHaveProperty('threadId');
      expect(email).toHaveProperty('from');
      expect(email).toHaveProperty('to');
      expect(email).toHaveProperty('subject');
      expect(email).toHaveProperty('snippet');
      expect(email).toHaveProperty('receivedAt');
      expect(email).toHaveProperty('isRead');
      expect(email).toHaveProperty('importance');
    });

    it('should have valid importance levels', () => {
      const emails = getSimulatedEmails();
      const validImportance = ['high', 'normal', 'low'];
      emails.forEach(email => {
        expect(validImportance).toContain(email.importance);
      });
    });

    it('should include high priority emails', () => {
      const emails = getSimulatedEmails();
      const highPriority = emails.filter(e => e.importance === 'high');
      expect(highPriority.length).toBeGreaterThan(0);
    });
  });

  describe('Notion Pages', () => {
    it('should return simulated Notion pages', () => {
      const pages = getSimulatedNotionPages();
      expect(Array.isArray(pages)).toBe(true);
      expect(pages.length).toBeGreaterThan(0);
    });

    it('should have required fields on pages', () => {
      const pages = getSimulatedNotionPages();
      const page = pages[0];
      
      expect(page).toHaveProperty('id');
      expect(page).toHaveProperty('title');
      expect(page).toHaveProperty('parentType');
      expect(page).toHaveProperty('createdAt');
      expect(page).toHaveProperty('updatedAt');
      expect(page).toHaveProperty('content');
      expect(page).toHaveProperty('url');
    });

    it('should have valid parent types', () => {
      const pages = getSimulatedNotionPages();
      const validTypes = ['workspace', 'page', 'database'];
      pages.forEach(page => {
        expect(validTypes).toContain(page.parentType);
      });
    });
  });

  describe('Tasks', () => {
    it('should return simulated tasks', () => {
      const tasks = getSimulatedTasks();
      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks.length).toBeGreaterThan(0);
    });

    it('should have required fields on tasks', () => {
      const tasks = getSimulatedTasks();
      const task = tasks[0];
      
      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('boardId');
      expect(task).toHaveProperty('boardName');
      expect(task).toHaveProperty('columnId');
      expect(task).toHaveProperty('columnName');
      expect(task).toHaveProperty('title');
      expect(task).toHaveProperty('assignees');
      expect(task).toHaveProperty('labels');
      expect(task).toHaveProperty('createdAt');
      expect(task).toHaveProperty('updatedAt');
    });

    it('should have tasks from multiple boards', () => {
      const tasks = getSimulatedTasks();
      const boardNames = new Set(tasks.map(t => t.boardName));
      expect(boardNames.size).toBeGreaterThan(1);
    });
  });

  describe('Simulation Summary', () => {
    it('should return aggregated summary', () => {
      const summary = getSimulationSummary();
      
      expect(summary).toHaveProperty('calendar');
      expect(summary).toHaveProperty('email');
      expect(summary).toHaveProperty('notion');
      expect(summary).toHaveProperty('tasks');
    });

    it('should have calendar metrics', () => {
      const summary = getSimulationSummary();
      
      expect(typeof summary.calendar.todayMeetings).toBe('number');
      expect(typeof summary.calendar.thisWeekMeetings).toBe('number');
      expect(typeof summary.calendar.focusTimeBlocked).toBe('number');
    });

    it('should have email metrics', () => {
      const summary = getSimulationSummary();
      
      expect(typeof summary.email.unreadCount).toBe('number');
      expect(typeof summary.email.highPriorityCount).toBe('number');
      expect(Array.isArray(summary.email.actionRequired)).toBe(true);
    });

    it('should have task metrics', () => {
      const summary = getSimulationSummary();
      
      expect(typeof summary.tasks.overdueCount).toBe('number');
      expect(typeof summary.tasks.dueTodayCount).toBe('number');
      expect(typeof summary.tasks.dueThisWeekCount).toBe('number');
      expect(typeof summary.tasks.inProgressCount).toBe('number');
    });
  });

  describe('Genesis Context', () => {
    it('should build context for Project Genesis', () => {
      const context = buildGenesisContext();
      
      expect(context).toHaveProperty('businessContext');
      expect(context).toHaveProperty('currentPriorities');
      expect(context).toHaveProperty('upcomingDeadlines');
      expect(context).toHaveProperty('keyMetrics');
      expect(context).toHaveProperty('teamCapacity');
      expect(context).toHaveProperty('fundingStatus');
    });

    it('should have non-empty business context', () => {
      const context = buildGenesisContext();
      expect(context.businessContext.length).toBeGreaterThan(0);
    });

    it('should have priorities array', () => {
      const context = buildGenesisContext();
      expect(Array.isArray(context.currentPriorities)).toBe(true);
      expect(context.currentPriorities.length).toBeGreaterThan(0);
    });

    it('should have deadlines with title and date', () => {
      const context = buildGenesisContext();
      expect(Array.isArray(context.upcomingDeadlines)).toBe(true);
      context.upcomingDeadlines.forEach(deadline => {
        expect(deadline).toHaveProperty('title');
        expect(deadline).toHaveProperty('date');
      });
    });

    it('should have metrics with name and value', () => {
      const context = buildGenesisContext();
      expect(Array.isArray(context.keyMetrics)).toBe(true);
      context.keyMetrics.forEach(metric => {
        expect(metric).toHaveProperty('name');
        expect(metric).toHaveProperty('value');
      });
    });
  });
});
