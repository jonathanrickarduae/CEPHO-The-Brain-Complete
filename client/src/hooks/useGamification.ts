import { useState, useEffect, useCallback } from 'react';

// Gamification data types
interface UserStats {
  totalTasks: number;
  completedTasks: number;
  currentStreak: number;
  longestStreak: number;
  totalTrainingHours: number;
  decisionsThisWeek: number;
  lastActiveDate: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  progress: number;
  target: number;
  category: 'streak' | 'tasks' | 'training' | 'engagement';
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: 'trophy' | 'star' | 'flame' | 'zap';
  threshold: number;
  type: 'tasks' | 'streak' | 'training' | 'level';
}

const STORAGE_KEY = 'brain-gamification';

// Default achievements
const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-task',
    title: 'First Steps',
    description: 'Complete your first task',
    icon: '🎯',
    unlockedAt: null,
    progress: 0,
    target: 1,
    category: 'tasks',
  },
  {
    id: 'task-master-10',
    title: 'Task Master',
    description: 'Complete 10 tasks',
    icon: '✅',
    unlockedAt: null,
    progress: 0,
    target: 10,
    category: 'tasks',
  },
  {
    id: 'task-master-100',
    title: 'Centurion',
    description: 'Complete 100 tasks',
    icon: '💯',
    unlockedAt: null,
    progress: 0,
    target: 100,
    category: 'tasks',
  },
  {
    id: 'streak-3',
    title: 'Getting Started',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    unlockedAt: null,
    progress: 0,
    target: 3,
    category: 'streak',
  },
  {
    id: 'streak-7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🗓️',
    unlockedAt: null,
    progress: 0,
    target: 7,
    category: 'streak',
  },
  {
    id: 'streak-30',
    title: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    icon: '🏆',
    unlockedAt: null,
    progress: 0,
    target: 30,
    category: 'streak',
  },
  {
    id: 'training-1',
    title: 'Twin Trainer',
    description: 'Train your Chief of Staff for 1 hour',
    icon: '🧠',
    unlockedAt: null,
    progress: 0,
    target: 1,
    category: 'training',
  },
  {
    id: 'training-10',
    title: 'Neural Network',
    description: 'Train your Chief of Staff for 10 hours',
    icon: '🤖',
    unlockedAt: null,
    progress: 0,
    target: 10,
    category: 'training',
  },
  {
    id: 'training-50',
    title: 'Mind Meld',
    description: 'Train your Chief of Staff for 50 hours',
    icon: '🌟',
    unlockedAt: null,
    progress: 0,
    target: 50,
    category: 'training',
  },
  {
    id: 'early-bird',
    title: 'Early Bird',
    description: 'Complete a task before 7 AM',
    icon: '🌅',
    unlockedAt: null,
    progress: 0,
    target: 1,
    category: 'engagement',
  },
  {
    id: 'night-owl',
    title: 'Night Owl',
    description: 'Complete a task after 10 PM',
    icon: '🦉',
    unlockedAt: null,
    progress: 0,
    target: 1,
    category: 'engagement',
  },
];

// Milestones for celebrations
const MILESTONES: Milestone[] = [
  { id: 'tasks-10', title: '10 Tasks Completed!', description: 'You\'re on a roll!', icon: 'star', threshold: 10, type: 'tasks' },
  { id: 'tasks-50', title: '50 Tasks Completed!', description: 'Productivity champion!', icon: 'trophy', threshold: 50, type: 'tasks' },
  { id: 'tasks-100', title: '100 Tasks Completed!', description: 'Centurion status achieved!', icon: 'trophy', threshold: 100, type: 'tasks' },
  { id: 'streak-7', title: '7-Day Streak!', description: 'A full week of consistency!', icon: 'flame', threshold: 7, type: 'streak' },
  { id: 'streak-14', title: '2-Week Streak!', description: 'Unstoppable!', icon: 'flame', threshold: 14, type: 'streak' },
  { id: 'streak-30', title: '30-Day Streak!', description: 'Monthly master!', icon: 'trophy', threshold: 30, type: 'streak' },
  { id: 'training-10', title: '10 Hours Trained!', description: 'Your Twin is getting smarter!', icon: 'zap', threshold: 10, type: 'training' },
  { id: 'level-5', title: 'Level 5!', description: 'Rising star!', icon: 'star', threshold: 5, type: 'level' },
  { id: 'level-10', title: 'Level 10!', description: 'Brain power!', icon: 'trophy', threshold: 10, type: 'level' },
];

// XP calculation
function calculateLevel(xp: number): { level: number; xpToNextLevel: number } {
  // XP required per level increases: 100, 200, 300, etc.
  let level = 1;
  let totalXpRequired = 0;
  
  while (totalXpRequired + level * 100 <= xp) {
    totalXpRequired += level * 100;
    level++;
  }
  
  const xpToNextLevel = (level * 100) - (xp - totalXpRequired);
  return { level, xpToNextLevel };
}

// Load gamification data
function loadGamificationData(): { stats: UserStats; achievements: Achievement[] } {
  if (typeof window === 'undefined') {
    return {
      stats: getDefaultStats(),
      achievements: DEFAULT_ACHIEVEMENTS,
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return {
        stats: { ...getDefaultStats(), ...data.stats },
        achievements: data.achievements || DEFAULT_ACHIEVEMENTS,
      };
    }
  } catch {
    // Ignore parse errors
  }

  return {
    stats: getDefaultStats(),
    achievements: DEFAULT_ACHIEVEMENTS,
  };
}

function getDefaultStats(): UserStats {
  return {
    totalTasks: 0,
    completedTasks: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalTrainingHours: 0,
    decisionsThisWeek: 0,
    lastActiveDate: '',
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
  };
}

// Save gamification data
function saveGamificationData(stats: UserStats, achievements: Achievement[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ stats, achievements }));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Main gamification hook
 */
export function useGamification() {
  const [stats, setStats] = useState<UserStats>(() => loadGamificationData().stats);
  const [achievements, setAchievements] = useState<Achievement[]>(() => loadGamificationData().achievements);
  const [pendingMilestone, setPendingMilestone] = useState<Milestone | null>(null);
  const [pendingAchievement, setPendingAchievement] = useState<Achievement | null>(null);

  // Save on change
  useEffect(() => {
    saveGamificationData(stats, achievements);
  }, [stats, achievements]);

  // Check for milestones
  const checkMilestones = useCallback((newStats: UserStats) => {
    for (const milestone of MILESTONES) {
      let value = 0;
      switch (milestone.type) {
        case 'tasks':
          value = newStats.completedTasks;
          break;
        case 'streak':
          value = newStats.currentStreak;
          break;
        case 'training':
          value = newStats.totalTrainingHours;
          break;
        case 'level':
          value = newStats.level;
          break;
      }

      // Check if milestone just reached
      if (value === milestone.threshold) {
        setPendingMilestone(milestone);
        break;
      }
    }
  }, []);

  // Check for achievements
  const checkAchievements = useCallback((newStats: UserStats) => {
    setAchievements(prev => {
      const updated = prev.map(achievement => {
        if (achievement.unlockedAt) return achievement;

        let progress = 0;
        switch (achievement.category) {
          case 'tasks':
            progress = newStats.completedTasks;
            break;
          case 'streak':
            progress = newStats.currentStreak;
            break;
          case 'training':
            progress = newStats.totalTrainingHours;
            break;
        }

        const newAchievement = { ...achievement, progress };

        // Check if just unlocked
        if (progress >= achievement.target && !achievement.unlockedAt) {
          newAchievement.unlockedAt = new Date().toISOString();
          setPendingAchievement(newAchievement);
        }

        return newAchievement;
      });

      return updated;
    });
  }, []);

  // Add XP
  const addXP = useCallback((amount: number) => {
    setStats(prev => {
      const newXP = prev.xp + amount;
      const { level, xpToNextLevel } = calculateLevel(newXP);
      
      const newStats = {
        ...prev,
        xp: newXP,
        level,
        xpToNextLevel,
      };

      checkMilestones(newStats);
      return newStats;
    });
  }, [checkMilestones]);

  // Complete task
  const completeTask = useCallback(() => {
    setStats(prev => {
      const today = new Date().toISOString().split('T')[0];
      const lastActive = prev.lastActiveDate;
      
      let newStreak = prev.currentStreak;
      if (lastActive !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (lastActive === yesterdayStr) {
          newStreak = prev.currentStreak + 1;
        } else if (lastActive !== today) {
          newStreak = 1;
        }
      }

      const newStats = {
        ...prev,
        completedTasks: prev.completedTasks + 1,
        totalTasks: prev.totalTasks + 1,
        currentStreak: newStreak,
        longestStreak: Math.max(prev.longestStreak, newStreak),
        lastActiveDate: today,
      };

      checkMilestones(newStats);
      checkAchievements(newStats);
      return newStats;
    });

    // Award XP for task completion
    addXP(10);
  }, [addXP, checkMilestones, checkAchievements]);

  // Add training time
  const addTrainingTime = useCallback((hours: number) => {
    setStats(prev => {
      const newStats = {
        ...prev,
        totalTrainingHours: prev.totalTrainingHours + hours,
      };

      checkMilestones(newStats);
      checkAchievements(newStats);
      return newStats;
    });

    // Award XP for training
    addXP(Math.round(hours * 5));
  }, [addXP, checkMilestones, checkAchievements]);

  // Record decision
  const recordDecision = useCallback(() => {
    setStats(prev => ({
      ...prev,
      decisionsThisWeek: prev.decisionsThisWeek + 1,
    }));
    addXP(5);
  }, [addXP]);

  // Dismiss milestone
  const dismissMilestone = useCallback(() => {
    setPendingMilestone(null);
  }, []);

  // Dismiss achievement
  const dismissAchievement = useCallback(() => {
    setPendingAchievement(null);
  }, []);

  // Get progress percentage to next level
  const levelProgress = ((stats.level * 100 - stats.xpToNextLevel) / (stats.level * 100)) * 100;

  return {
    stats,
    achievements,
    pendingMilestone,
    pendingAchievement,
    levelProgress,
    completeTask,
    addTrainingTime,
    recordDecision,
    addXP,
    dismissMilestone,
    dismissAchievement,
    unlockedAchievements: achievements.filter(a => a.unlockedAt),
    lockedAchievements: achievements.filter(a => !a.unlockedAt),
  };
}

/**
 * Hook for streak tracking
 */
interface StreakData {
  current: number;
  longest: number;
  lastDate: string;
}

export function useStreak() {
  const [streak, setStreak] = useState<StreakData>(() => {
    if (typeof window === 'undefined') return { current: 0, longest: 0, lastDate: '' };
    
    try {
      const stored = localStorage.getItem('brain-streak');
      if (stored) return JSON.parse(stored) as StreakData;
    } catch {
      // Ignore
    }
    return { current: 0, longest: 0, lastDate: '' };
  });

  const checkIn = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    
    setStreak(prev => {
      if (prev.lastDate === today) return prev;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newCurrent = 1;
      if (prev.lastDate === yesterdayStr) {
        newCurrent = prev.current + 1;
      }

      const newStreak = {
        current: newCurrent,
        longest: Math.max(prev.longest, newCurrent),
        lastDate: today,
      };

      localStorage.setItem('brain-streak', JSON.stringify(newStreak));
      return newStreak;
    });
  }, []);

  return {
    currentStreak: streak.current,
    longestStreak: streak.longest,
    checkIn,
  };
}
