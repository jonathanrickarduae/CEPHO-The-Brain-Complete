import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Test mood check frequency logic
describe('Mood Check Frequency', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should identify correct time period', () => {
    // Morning: 6 AM - 12 PM
    vi.setSystemTime(new Date('2026-01-11T08:00:00'));
    expect(getMoodPeriod(8)).toBe('morning');

    // Afternoon: 12 PM - 6 PM
    vi.setSystemTime(new Date('2026-01-11T14:00:00'));
    expect(getMoodPeriod(14)).toBe('afternoon');

    // Evening: 6 PM - 10 PM
    vi.setSystemTime(new Date('2026-01-11T20:00:00'));
    expect(getMoodPeriod(20)).toBe('evening');
  });

  it('should track mood checks per period', () => {
    const today = '2026-01-11';
    const moodHistory: Record<string, string[]> = {};
    
    // Record morning check
    recordMoodCheck(moodHistory, today, 'morning');
    expect(moodHistory[today]).toContain('morning');
    
    // Record afternoon check
    recordMoodCheck(moodHistory, today, 'afternoon');
    expect(moodHistory[today]).toContain('afternoon');
    expect(moodHistory[today].length).toBe(2);
  });

  it('should not prompt for already completed period', () => {
    const today = '2026-01-11';
    const moodHistory: Record<string, string[]> = {
      [today]: ['morning']
    };
    
    expect(shouldShowMoodCheck(moodHistory, today, 'morning')).toBe(false);
    expect(shouldShowMoodCheck(moodHistory, today, 'afternoon')).toBe(true);
  });
});

// Test keyboard shortcuts
describe('Keyboard Shortcuts', () => {
  it('should parse shortcut definitions correctly', () => {
    const shortcut = { key: 'd', ctrl: true, description: 'Dashboard' };
    expect(matchesShortcut(shortcut, { key: 'd', ctrlKey: true })).toBe(true);
    expect(matchesShortcut(shortcut, { key: 'd', ctrlKey: false })).toBe(false);
  });

  it('should handle shift modifier', () => {
    const shortcut = { key: '?', shift: true, description: 'Help' };
    expect(matchesShortcut(shortcut, { key: '?', shiftKey: true })).toBe(true);
    expect(matchesShortcut(shortcut, { key: '/', shiftKey: true })).toBe(true); // ? is Shift+/
  });
});

// Test learning indicator logic
describe('Learning Indicator', () => {
  it('should categorize learning types correctly', () => {
    expect(getLearningCategory('vocabulary')).toBe('Communication Style');
    expect(getLearningCategory('pattern')).toBe('Behavior Pattern');
    expect(getLearningCategory('preference')).toBe('Preference');
    expect(getLearningCategory('decision')).toBe('Decision Making');
  });

  it('should format learning notifications', () => {
    const notification = formatLearningNotification({
      type: 'vocabulary',
      message: 'Learned: You prefer formal language'
    });
    
    expect(notification.icon).toBeDefined();
    expect(notification.color).toBe('cyan');
  });
});

// Test activity log
describe('Activity Log', () => {
  it('should format timestamps correctly', () => {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    expect(formatActivityTime(fiveMinutesAgo)).toBe('5 minutes ago');
  });

  it('should categorize activities by type', () => {
    const activities = [
      { type: 'email', action: 'drafted' },
      { type: 'research', action: 'completed' },
      { type: 'email', action: 'sent' },
    ];
    
    const grouped = groupActivitiesByType(activities);
    expect(grouped.email.length).toBe(2);
    expect(grouped.research.length).toBe(1);
  });
});

// Helper functions (these would normally be imported from the actual hooks)
function getMoodPeriod(hour: number): 'morning' | 'afternoon' | 'evening' | null {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return null;
}

function recordMoodCheck(
  history: Record<string, string[]>, 
  date: string, 
  period: string
): void {
  if (!history[date]) {
    history[date] = [];
  }
  history[date].push(period);
}

function shouldShowMoodCheck(
  history: Record<string, string[]>,
  date: string,
  period: string
): boolean {
  return !history[date]?.includes(period);
}

function matchesShortcut(
  shortcut: { key: string; ctrl?: boolean; shift?: boolean },
  event: { key: string; ctrlKey?: boolean; shiftKey?: boolean }
): boolean {
  const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase() ||
    (shortcut.key === '?' && event.key === '/' && event.shiftKey);
  const ctrlMatches = shortcut.ctrl ? event.ctrlKey : !event.ctrlKey;
  const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
  
  return keyMatches && ctrlMatches && shiftMatches;
}

function getLearningCategory(type: string): string {
  const categories: Record<string, string> = {
    vocabulary: 'Communication Style',
    pattern: 'Behavior Pattern',
    preference: 'Preference',
    decision: 'Decision Making',
  };
  return categories[type] || 'General';
}

function formatLearningNotification(notification: { type: string; message: string }) {
  const colors: Record<string, string> = {
    vocabulary: 'cyan',
    pattern: 'purple',
    preference: 'green',
    decision: 'amber',
  };
  
  return {
    ...notification,
    icon: '🧠',
    color: colors[notification.type] || 'gray',
  };
}

function formatActivityTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffMins < 1) return 'just now';
  if (diffMins === 1) return '1 minute ago';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return '1 hour ago';
  return `${diffHours} hours ago`;
}

function groupActivitiesByType<T extends { type: string }>(
  activities: T[]
): Record<string, T[]> {
  return activities.reduce((acc, activity) => {
    if (!acc[activity.type]) {
      acc[activity.type] = [];
    }
    acc[activity.type].push(activity);
    return acc;
  }, {} as Record<string, T[]>);
}
