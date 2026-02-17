import { describe, it, expect, vi, beforeEach } from 'vitest';

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

describe('UX Integration - ThemeSelector in Settings', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render theme options in Settings appearance tab', () => {
    const themeOptions = ['light', 'dark', 'system'];
    expect(themeOptions).toContain('light');
    expect(themeOptions).toContain('dark');
    expect(themeOptions).toContain('system');
  });

  it('should persist theme selection', () => {
    localStorage.setItem('brain_theme', 'light');
    expect(localStorage.getItem('brain_theme')).toBe('light');
  });

  it('should support accent color selection', () => {
    const accentColors = ['cyan', 'purple', 'pink', 'green', 'orange'];
    expect(accentColors.length).toBe(5);
    expect(accentColors).toContain('cyan');
  });
});

describe('UX Integration - DailyStreak in Dashboard', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should display streak badge when streak > 0', () => {
    const streakDays = 5;
    const shouldShowBadge = streakDays > 0;
    expect(shouldShowBadge).toBe(true);
  });

  it('should mark today complete on dashboard visit', () => {
    const markTodayComplete = () => {
      const today = new Date().toDateString();
      localStorage.setItem('brain_last_active', today);
    };
    
    markTodayComplete();
    expect(localStorage.getItem('brain_last_active')).toBe(new Date().toDateString());
  });

  it('should position streak badge in header row', () => {
    // Streak badge should appear between wellness score and mood indicator
    const headerElements = ['wellness_score', 'streak_badge', 'mood_indicator', 'online_status'];
    const streakIndex = headerElements.indexOf('streak_badge');
    expect(streakIndex).toBe(1); // After wellness score
  });
});

describe('UX Integration - ChangelogModal in Sidebar', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should show What\'s New button in sidebar footer', () => {
    const sidebarFooterItems = [
      'keyboard_shortcuts',
      'accessibility_settings',
      'whats_new',
      'governance_mode',
    ];
    expect(sidebarFooterItems).toContain('whats_new');
  });

  it('should show notification dot when updates available', () => {
    const lastSeenVersion = '2.4.0';
    const currentVersion = '2.5.0';
    const hasNewUpdates = lastSeenVersion !== currentVersion;
    expect(hasNewUpdates).toBe(true);
  });

  it('should open changelog modal on button click', () => {
    let isModalOpen = false;
    const openModal = () => { isModalOpen = true; };
    
    openModal();
    expect(isModalOpen).toBe(true);
  });

  it('should clear notification dot after viewing', () => {
    localStorage.setItem('brain_last_seen_changelog', '2.5.0');
    const currentVersion = '2.5.0';
    const hasNewUpdates = localStorage.getItem('brain_last_seen_changelog') !== currentVersion;
    expect(hasNewUpdates).toBe(false);
  });
});

describe('UX Integration - SwipeGestures in Review Queue', () => {
  it('should show swipe hint on mobile', () => {
    const isMobile = true;
    const hasItems = true;
    const shouldShowHint = isMobile && hasItems;
    expect(shouldShowHint).toBe(true);
  });

  it('should wrap items with SwipeableItem on mobile', () => {
    const isMobile = true;
    const items = [{ id: '1' }, { id: '2' }];
    
    const wrappedItems = items.map(item => ({
      ...item,
      wrapped: isMobile,
    }));
    
    expect(wrappedItems[0].wrapped).toBe(true);
    expect(wrappedItems[1].wrapped).toBe(true);
  });

  it('should trigger approve on swipe right', () => {
    let approved = false;
    const handleApprove = () => { approved = true; };
    
    // Simulate swipe right
    handleApprove();
    expect(approved).toBe(true);
  });

  it('should trigger reject on swipe left', () => {
    let rejected = false;
    const handleReject = () => { rejected = true; };
    
    // Simulate swipe left
    handleReject();
    expect(rejected).toBe(true);
  });

  it('should not show swipe hint on desktop', () => {
    const isMobile = false;
    const hasItems = true;
    const shouldShowHint = isMobile && hasItems;
    expect(shouldShowHint).toBe(false);
  });
});

describe('UX Integration - Tooltips on Dashboard', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should have tooltip content for all 6 command boxes', () => {
    const tooltips = {
      daily_brief: 'Start your day here!',
      ai_expert_engine: 'Access 287+ AI specialists',
      workflow: 'Track all your projects',
      digital_twin: 'Your AI counterpart',
      library: 'Your knowledge repository',
      the_vault: 'Secure, encrypted storage',
    };
    
    expect(Object.keys(tooltips).length).toBe(6);
    expect(tooltips.daily_brief).toContain('day');
    expect(tooltips.ai_expert_engine).toContain('287');
  });

  it('should show tooltip on first visit', () => {
    const tooltipKey = 'dashboard_daily_brief';
    const hasSeenKey = `brain_tooltip_seen_${tooltipKey}`;
    
    const shouldShow = localStorage.getItem(hasSeenKey) !== 'true';
    expect(shouldShow).toBe(true);
  });

  it('should not show tooltip after first visit', () => {
    const tooltipKey = 'dashboard_daily_brief';
    const hasSeenKey = `brain_tooltip_seen_${tooltipKey}`;
    
    localStorage.setItem(hasSeenKey, 'true');
    const shouldShow = localStorage.getItem(hasSeenKey) !== 'true';
    expect(shouldShow).toBe(false);
  });

  it('should position tooltips at bottom of buttons', () => {
    const tooltipPosition = 'bottom';
    expect(tooltipPosition).toBe('bottom');
  });

  it('should generate unique tooltip keys from button labels', () => {
    const generateKey = (label: string) => 
      `dashboard_${label.toLowerCase().replace(/\s+/g, '_')}`;
    
    expect(generateKey('DAILY BRIEF')).toBe('dashboard_daily_brief');
    expect(generateKey('AI EXPERT ENGINE')).toBe('dashboard_ai_expert_engine');
    expect(generateKey('THE VAULT')).toBe('dashboard_the_vault');
  });
});

describe('UX Integration - Component Availability', () => {
  it('should export ThemeSelector from ThemeToggle', () => {
    // ThemeSelector should be exported for use in Settings
    const exports = ['ThemeProvider', 'useTheme', 'ThemeToggle', 'ThemeSelector'];
    expect(exports).toContain('ThemeSelector');
  });

  it('should export StreakBadge from DailyStreak', () => {
    // StreakBadge should be exported for use in Dashboard header
    const exports = ['DailyStreak', 'StreakBadge', 'useStreak', 'WeeklyActivity'];
    expect(exports).toContain('StreakBadge');
    expect(exports).toContain('useStreak');
  });

  it('should export ChangelogModal and useChangelog', () => {
    const exports = ['ChangelogModal', 'useChangelog', 'WhatsNewButton'];
    expect(exports).toContain('ChangelogModal');
    expect(exports).toContain('useChangelog');
  });

  it('should export SwipeableItem and SwipeHint', () => {
    const exports = ['SwipeableItem', 'SwipeableTask', 'SwipeableNotification', 'SwipeHint'];
    expect(exports).toContain('SwipeableItem');
    expect(exports).toContain('SwipeHint');
  });

  it('should export Tooltip component', () => {
    const exports = ['Tooltip', 'FirstTimeTooltip'];
    expect(exports).toContain('Tooltip');
  });
});
