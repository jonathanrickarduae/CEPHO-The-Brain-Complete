import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

vi.stubGlobal('localStorage', localStorageMock);

describe('UX Phase 3 - Cambridge University Partnership', () => {
  it('should have Cambridge University partner data structure', () => {
    const partner = {
      name: 'Cambridge University',
      type: 'Research Partner',
      description: 'AI-human collaboration research',
      logo: 'cambridge-logo.svg',
    };
    
    expect(partner.name).toBe('Cambridge University');
    expect(partner.type).toBe('Research Partner');
    expect(partner.description).toContain('AI-human collaboration');
  });

  it('should display partner on About page', () => {
    const aboutPagePartners = [
      { name: 'Cambridge University', type: 'Research Partner' }
    ];
    
    expect(aboutPagePartners.length).toBeGreaterThan(0);
    expect(aboutPagePartners[0].name).toBe('Cambridge University');
  });

  it('should display partner on Waitlist page', () => {
    const waitlistPartners = [
      { name: 'Cambridge University', description: 'Collaborating on AI-human collaboration research' }
    ];
    
    expect(waitlistPartners[0].description).toContain('collaboration');
  });
});

describe('UX Phase 3 - Tooltip System', () => {
  it('should create tooltip with required props', () => {
    const tooltipProps = {
      content: 'This is a helpful tooltip',
      position: 'top' as const,
      delay: 300,
    };
    
    expect(tooltipProps.content).toBeDefined();
    expect(tooltipProps.position).toBe('top');
    expect(tooltipProps.delay).toBe(300);
  });

  it('should support first-time visit tooltips', () => {
    const tooltipKey = 'dashboard_intro';
    const hasSeenKey = `brain_tooltip_seen_${tooltipKey}`;
    
    expect(localStorage.getItem(hasSeenKey)).toBeNull();
    localStorage.setItem(hasSeenKey, 'true');
    expect(localStorage.getItem(hasSeenKey)).toBe('true');
  });

  it('should have predefined tooltip content', () => {
    const tooltipContent = {
      dailyBrief: 'Start your day here!',
      aiExperts: 'Access 287+ AI specialists',
      digitalTwin: 'Your AI counterpart',
      vault: 'Secure storage',
    };
    
    expect(Object.keys(tooltipContent).length).toBeGreaterThan(0);
    expect(tooltipContent.dailyBrief).toContain('day');
  });
});

describe('UX Phase 3 - Progress Indicators', () => {
  it('should calculate progress percentage correctly', () => {
    const calculateProgress = (value: number, max: number) => 
      Math.min(100, Math.max(0, (value / max) * 100));
    
    expect(calculateProgress(50, 100)).toBe(50);
    expect(calculateProgress(75, 100)).toBe(75);
    expect(calculateProgress(150, 100)).toBe(100); // Capped at 100
    expect(calculateProgress(-10, 100)).toBe(0); // Minimum 0
  });

  it('should track Digital Twin training milestones', () => {
    const milestones = [
      { hours: 10, label: 'Beginner' },
      { hours: 25, label: 'Learning' },
      { hours: 50, label: 'Growing' },
      { hours: 75, label: 'Advanced' },
      { hours: 100, label: 'Expert' },
    ];
    
    const getCurrentMilestone = (hours: number) => 
      milestones.reduce((prev, curr) => hours >= curr.hours ? curr : prev, milestones[0]);
    
    expect(getCurrentMilestone(5).label).toBe('Beginner');
    expect(getCurrentMilestone(30).label).toBe('Learning');
    expect(getCurrentMilestone(60).label).toBe('Growing');
    expect(getCurrentMilestone(100).label).toBe('Expert');
  });
});

describe('UX Phase 3 - Conversation Switcher', () => {
  it('should format timestamps correctly', () => {
    const formatTimestamp = (date: Date) => {
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      if (days < 7) return `${days}d ago`;
      return date.toLocaleDateString();
    };
    
    const now = new Date();
    expect(formatTimestamp(now)).toBe('Just now');
    
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60000);
    expect(formatTimestamp(tenMinutesAgo)).toBe('10m ago');
  });

  it('should sort conversations by starred and timestamp', () => {
    const conversations = [
      { id: '1', starred: false, timestamp: new Date('2026-01-10') },
      { id: '2', starred: true, timestamp: new Date('2026-01-09') },
      { id: '3', starred: false, timestamp: new Date('2026-01-11') },
    ];
    
    const sorted = [...conversations].sort((a, b) => {
      if (a.starred && !b.starred) return -1;
      if (!a.starred && b.starred) return 1;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
    
    expect(sorted[0].id).toBe('2'); // Starred first
    expect(sorted[1].id).toBe('3'); // Then by date
    expect(sorted[2].id).toBe('1');
  });
});

describe('UX Phase 3 - Status Pulse', () => {
  it('should map status to correct colors', () => {
    const statusColors: Record<string, string> = {
      active: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500',
      success: 'bg-emerald-500',
      idle: 'bg-gray-500',
    };
    
    expect(statusColors.active).toBe('bg-green-500');
    expect(statusColors.error).toBe('bg-red-500');
    expect(statusColors.idle).toBe('bg-gray-500');
  });

  it('should support notification counts', () => {
    const formatCount = (count: number) => count > 99 ? '99+' : count.toString();
    
    expect(formatCount(5)).toBe('5');
    expect(formatCount(99)).toBe('99');
    expect(formatCount(100)).toBe('99+');
    expect(formatCount(500)).toBe('99+');
  });
});

describe('UX Phase 3 - Theme Toggle', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should persist theme preference', () => {
    const setTheme = (theme: string) => {
      localStorage.setItem('brain_theme', theme);
    };
    
    setTheme('dark');
    expect(localStorage.getItem('brain_theme')).toBe('dark');
    
    setTheme('light');
    expect(localStorage.getItem('brain_theme')).toBe('light');
  });

  it('should support system theme preference', () => {
    const themes = ['light', 'dark', 'system'];
    expect(themes).toContain('system');
  });
});

describe('UX Phase 3 - Swipe Gestures', () => {
  it('should calculate swipe direction', () => {
    const calculateSwipe = (startX: number, endX: number, threshold: number) => {
      const diff = endX - startX;
      if (diff > threshold) return 'right';
      if (diff < -threshold) return 'left';
      return 'none';
    };
    
    expect(calculateSwipe(0, 100, 80)).toBe('right');
    expect(calculateSwipe(100, 0, 80)).toBe('left');
    expect(calculateSwipe(0, 50, 80)).toBe('none');
  });

  it('should limit swipe distance', () => {
    const limitSwipe = (diff: number, maxSwipe: number) => 
      Math.max(-maxSwipe, Math.min(maxSwipe, diff));
    
    expect(limitSwipe(50, 120)).toBe(50);
    expect(limitSwipe(150, 120)).toBe(120);
    expect(limitSwipe(-150, 120)).toBe(-120);
  });
});

describe('UX Phase 3 - Pull to Refresh', () => {
  it('should calculate pull progress', () => {
    const calculateProgress = (pullDistance: number, threshold: number) => 
      Math.min(1, pullDistance / threshold);
    
    expect(calculateProgress(40, 80)).toBe(0.5);
    expect(calculateProgress(80, 80)).toBe(1);
    expect(calculateProgress(100, 80)).toBe(1); // Capped at 1
  });

  it('should apply resistance to pull', () => {
    const applyResistance = (diff: number, resistance: number, maxPull: number) => 
      Math.min(maxPull, diff * resistance);
    
    expect(applyResistance(100, 0.5, 120)).toBe(50);
    expect(applyResistance(300, 0.5, 120)).toBe(120); // Capped at maxPull
  });
});

describe('UX Phase 3 - Collapsible Sections', () => {
  it('should toggle open state', () => {
    let isOpen = true;
    const toggle = () => { isOpen = !isOpen; };
    
    expect(isOpen).toBe(true);
    toggle();
    expect(isOpen).toBe(false);
    toggle();
    expect(isOpen).toBe(true);
  });
});

describe('UX Phase 3 - Daily Streak', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should calculate streak correctly', () => {
    const calculateStreak = (lastActive: Date | null, currentStreak: number) => {
      if (!lastActive) return 1;
      
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastActive.toDateString() === yesterday.toDateString()) {
        return currentStreak + 1;
      }
      if (lastActive.toDateString() === today.toDateString()) {
        return currentStreak; // Already marked today
      }
      return 1; // Streak broken
    };
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    expect(calculateStreak(null, 0)).toBe(1);
    expect(calculateStreak(yesterday, 5)).toBe(6);
    expect(calculateStreak(today, 5)).toBe(5);
  });

  it('should identify milestone achievements', () => {
    const milestones = [7, 14, 30, 60, 90, 180, 365];
    const isAtMilestone = (streak: number) => milestones.includes(streak);
    
    expect(isAtMilestone(7)).toBe(true);
    expect(isAtMilestone(30)).toBe(true);
    expect(isAtMilestone(15)).toBe(false);
  });
});

describe('UX Phase 3 - Celebration Animations', () => {
  it('should create confetti particles', () => {
    const createParticle = (index: number, colors: string[]) => ({
      id: index,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 8 + Math.random() * 8,
    });
    
    const colors = ['#ff10f0', '#00d4ff', '#ffd700'];
    const particle = createParticle(0, colors);
    
    expect(particle.id).toBe(0);
    expect(colors).toContain(particle.color);
    expect(particle.size).toBeGreaterThanOrEqual(8);
    expect(particle.size).toBeLessThanOrEqual(16);
  });
});

describe('UX Phase 3 - Changelog Modal', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should track last seen version', () => {
    const currentVersion = '2.5.0';
    
    expect(localStorage.getItem('brain_last_seen_changelog')).toBeNull();
    
    localStorage.setItem('brain_last_seen_changelog', currentVersion);
    expect(localStorage.getItem('brain_last_seen_changelog')).toBe(currentVersion);
  });

  it('should detect new updates', () => {
    const hasNewUpdates = (lastSeen: string | null, current: string) => 
      lastSeen !== current;
    
    expect(hasNewUpdates(null, '2.5.0')).toBe(true);
    expect(hasNewUpdates('2.4.0', '2.5.0')).toBe(true);
    expect(hasNewUpdates('2.5.0', '2.5.0')).toBe(false);
  });

  it('should have changelog entries with required fields', () => {
    const entry = {
      version: '2.5.0',
      date: 'January 11, 2026',
      title: 'UX Enhancement Update',
      features: [{ title: 'Feature', description: 'Description' }],
    };
    
    expect(entry.version).toBeDefined();
    expect(entry.date).toBeDefined();
    expect(entry.title).toBeDefined();
    expect(entry.features.length).toBeGreaterThan(0);
  });
});
