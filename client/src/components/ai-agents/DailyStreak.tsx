import { useState, useEffect, useCallback } from 'react';
import { Flame, Calendar, Trophy, Star, Zap } from 'lucide-react';
import { useCelebration } from '@/components/shared/CelebrationAnimations';

interface DailyStreakProps {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate?: Date;
  todayCompleted?: boolean;
  onStreakUpdate?: (streak: number) => void;
}

export function DailyStreak({
  currentStreak,
  longestStreak,
  lastActiveDate,
  todayCompleted = false,
  onStreakUpdate,
}: DailyStreakProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  // Check if streak is at risk (last active was yesterday)
  const isAtRisk = lastActiveDate && !todayCompleted && (() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return lastActiveDate.toDateString() === yesterday.toDateString();
  })();

  // Milestone check
  const milestones = [7, 14, 30, 60, 90, 180, 365];
  const nextMilestone = milestones.find(m => m > currentStreak) || currentStreak + 1;
  const isAtMilestone = milestones.includes(currentStreak);

  useEffect(() => {
    if (isAtMilestone) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStreak, isAtMilestone]);

  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isAtMilestone
                ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
                : currentStreak > 0
                ? 'bg-gradient-to-br from-orange-500/20 to-red-500/20'
                : 'bg-gray-700'
            } ${isAnimating ? 'animate-bounce' : ''}`}
          >
            <Flame
              className={`w-6 h-6 ${
                currentStreak > 0 ? 'text-orange-400' : 'text-foreground/60'
              }`}
            />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">{currentStreak}</span>
              <span className="text-sm text-muted-foreground">day streak</span>
            </div>
            {isAtRisk && (
              <span className="text-xs text-yellow-400 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Complete today to keep your streak!
              </span>
            )}
          </div>
        </div>
        
        {todayCompleted && (
          <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
            <Star className="w-3 h-3 fill-green-400" />
            Today done!
          </div>
        )}
      </div>

      {/* Progress to next milestone */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Progress to {nextMilestone} days</span>
          <span>{currentStreak}/{nextMilestone}</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
            style={{ width: `${(currentStreak / nextMilestone) * 100}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Trophy className="w-4 h-4 text-yellow-400" />
          <span>Best: {longestStreak} days</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>This week</span>
        </div>
      </div>

      {/* Milestone celebration */}
      {isAtMilestone && isAnimating && (
        <div className="mt-4 p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30 text-center">
          <Trophy className="w-6 h-6 text-yellow-400 mx-auto" />
          <p className="text-sm font-medium text-yellow-400 mt-1">
            Amazing! {currentStreak} day streak!
          </p>
        </div>
      )}
    </div>
  );
}

// Compact streak badge for header/sidebar
interface StreakBadgeProps {
  streak: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function StreakBadge({ streak, size = 'md', showLabel = true }: StreakBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  if (streak === 0) return null;

  return (
    <div
      className={`inline-flex items-center gap-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 rounded-full ${sizeClasses[size]}`}
    >
      <Flame className={iconSizes[size]} />
      <span className="font-bold">{streak}</span>
      {showLabel && <span className="text-orange-400/70">day{streak !== 1 ? 's' : ''}</span>}
    </div>
  );
}

// Weekly activity calendar
interface WeeklyActivityProps {
  activities: { date: Date; completed: boolean }[];
}

export function WeeklyActivity({ activities }: WeeklyActivityProps) {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  // Get last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const isCompleted = (date: Date) => {
    return activities.some(
      a => a.date.toDateString() === date.toDateString() && a.completed
    );
  };

  const isToday = (date: Date) => {
    return date.toDateString() === new Date().toDateString();
  };

  return (
    <div className="flex items-center gap-1">
      {last7Days.map((date, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <span className="text-[10px] text-muted-foreground">
            {days[date.getDay()]}
          </span>
          <div
            className={`w-6 h-6 rounded-md flex items-center justify-center text-xs ${
              isCompleted(date)
                ? 'bg-green-500 text-white'
                : isToday(date)
                ? 'bg-primary/20 text-primary border border-primary'
                : 'bg-gray-700 text-muted-foreground'
            }`}
          >
            {date.getDate()}
          </div>
        </div>
      ))}
    </div>
  );
}

// Hook for managing streak data
export function useStreak() {
  const { celebrate, showAchievement } = useCelebration();
  const [streak, setStreak] = useState({
    current: 0,
    longest: 0,
    lastActive: null as Date | null,
    todayCompleted: false,
    activities: [] as { date: Date; completed: boolean }[],
  });

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('brain_streak_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStreak({
          ...parsed,
          lastActive: parsed.lastActive ? new Date(parsed.lastActive) : null,
          activities: parsed.activities?.map((a: any) => ({
            ...a,
            date: new Date(a.date),
          })) || [],
        });
      } catch (e) {
        console.error('Failed to parse streak data:', e);
      }
    }
  }, []);

  const markTodayComplete = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let newCurrent = 1;
    
    // Check if continuing streak from yesterday
    if (streak.lastActive?.toDateString() === yesterday.toDateString()) {
      newCurrent = streak.current + 1;
    } else if (streak.lastActive?.toDateString() === today.toDateString()) {
      // Already marked today
      return;
    }

    const newStreak = {
      current: newCurrent,
      longest: Math.max(streak.longest, newCurrent),
      lastActive: today,
      todayCompleted: true,
      activities: [
        ...streak.activities.filter(
          a => a.date.toDateString() !== today.toDateString()
        ),
        { date: today, completed: true },
      ].slice(-30), // Keep last 30 days
    };

    setStreak(newStreak);
    localStorage.setItem('brain_streak_data', JSON.stringify(newStreak));

    // Trigger celebration only for meaningful milestones (not first day)
    const milestones = [7, 14, 30, 60, 90, 180, 365];
    if (milestones.includes(newCurrent)) {
      const milestoneNames: Record<number, string> = {
        7: 'Week Warrior',
        14: 'Fortnight Fighter',
        30: 'Monthly Master',
        60: 'Two Month Titan',
        90: 'Quarter Champion',
        180: 'Half Year Hero',
        365: 'Annual Legend',
      };
      showAchievement({
        title: milestoneNames[newCurrent] || `${newCurrent} Day Streak!`,
        description: `You've maintained a ${newCurrent}-day streak! Keep it up!`,
        icon: 'streak',
      });
    }
    // Note: Removed "Streak Started" toast for day 1 - too early in user journey
  };

  return { ...streak, markTodayComplete };
}
