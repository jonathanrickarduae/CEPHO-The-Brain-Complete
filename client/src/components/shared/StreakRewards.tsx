import { useState, useEffect } from 'react';
import { Flame, Trophy, Star, Crown, Zap, Gift, Lock, Check } from 'lucide-react';
import { useCelebration } from '@/components/shared/CelebrationAnimations';

interface Reward {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  streakRequired: number;
  type: 'badge' | 'theme' | 'feature';
  unlocked: boolean;
  color: string;
}

interface StreakRewardsProps {
  currentStreak: number;
  onRewardClaim?: (rewardId: string) => void;
}

export function StreakRewards({ currentStreak, onRewardClaim }: StreakRewardsProps) {
  const { showAchievement } = useCelebration();
  const [claimedRewards, setClaimedRewards] = useState<string[]>(() => {
    const saved = localStorage.getItem('brain_claimed_rewards');
    return saved ? JSON.parse(saved) : [];
  });

  const rewards: Reward[] = [
    {
      id: 'week-warrior',
      name: 'Week Warrior',
      description: 'Unlock the Flame badge for your profile',
      icon: <Flame className="w-6 h-6" />,
      streakRequired: 7,
      type: 'badge',
      unlocked: currentStreak >= 7,
      color: 'from-orange-500 to-red-500',
    },
    {
      id: 'fortnight-fighter',
      name: 'Fortnight Fighter',
      description: 'Unlock the Midnight Purple theme',
      icon: <Star className="w-6 h-6" />,
      streakRequired: 14,
      type: 'theme',
      unlocked: currentStreak >= 14,
      color: 'from-purple-500 to-indigo-500',
    },
    {
      id: 'monthly-master',
      name: 'Monthly Master',
      description: 'Unlock the Gold Crown badge',
      icon: <Crown className="w-6 h-6" />,
      streakRequired: 30,
      type: 'badge',
      unlocked: currentStreak >= 30,
      color: 'from-yellow-500 to-amber-500',
    },
    {
      id: 'two-month-titan',
      name: 'Two Month Titan',
      description: 'Unlock the Neon Glow theme',
      icon: <Zap className="w-6 h-6" />,
      streakRequired: 60,
      type: 'theme',
      unlocked: currentStreak >= 60,
      color: 'from-cyan-500 to-blue-500',
    },
    {
      id: 'quarter-champion',
      name: 'Quarter Champion',
      description: 'Unlock priority AI response queue',
      icon: <Trophy className="w-6 h-6" />,
      streakRequired: 90,
      type: 'feature',
      unlocked: currentStreak >= 90,
      color: 'from-emerald-500 to-green-500',
    },
    {
      id: 'annual-legend',
      name: 'Annual Legend',
      description: 'Unlock the Legendary status & all themes',
      icon: <Gift className="w-6 h-6" />,
      streakRequired: 365,
      type: 'feature',
      unlocked: currentStreak >= 365,
      color: 'from-pink-500 to-rose-500',
    },
  ];

  const claimReward = (reward: Reward) => {
    if (!reward.unlocked || claimedRewards.includes(reward.id)) return;
    
    const newClaimed = [...claimedRewards, reward.id];
    setClaimedRewards(newClaimed);
    localStorage.setItem('brain_claimed_rewards', JSON.stringify(newClaimed));
    
    showAchievement({
      title: `${reward.name} Claimed!`,
      description: reward.description,
      icon: '🎁',
    });
    
    onRewardClaim?.(reward.id);
  };

  const getRewardStatus = (reward: Reward) => {
    if (claimedRewards.includes(reward.id)) return 'claimed';
    if (reward.unlocked) return 'available';
    return 'locked';
  };

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Streak Rewards</h3>
            <p className="text-sm text-muted-foreground">
              {currentStreak} day streak • {rewards.filter(r => r.unlocked).length}/{rewards.length} unlocked
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {rewards.map((reward) => {
          const status = getRewardStatus(reward);
          return (
            <button
              key={reward.id}
              onClick={() => claimReward(reward)}
              disabled={status !== 'available'}
              className={`relative p-4 rounded-xl border transition-all ${
                status === 'claimed'
                  ? 'bg-green-500/10 border-green-500/30'
                  : status === 'available'
                  ? 'bg-gradient-to-br ' + reward.color + '/10 border-primary/30 hover:border-primary/50 cursor-pointer'
                  : 'bg-gray-800/50 border-gray-700 opacity-60'
              }`}
            >
              {/* Status indicator */}
              <div className="absolute top-2 right-2">
                {status === 'claimed' ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : status === 'locked' ? (
                  <Lock className="w-4 h-4 text-foreground/60" />
                ) : (
                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse block" />
                )}
              </div>

              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${reward.color} flex items-center justify-center mb-3 mx-auto ${
                status === 'locked' ? 'opacity-40 grayscale' : ''
              }`}>
                {reward.icon}
              </div>

              {/* Info */}
              <h4 className="font-medium text-sm text-foreground mb-1">{reward.name}</h4>
              <p className="text-xs text-muted-foreground mb-2">{reward.streakRequired} days</p>
              
              {/* Progress or status */}
              {status === 'locked' ? (
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full bg-gradient-to-r ${reward.color}`}
                    style={{ width: `${Math.min(100, (currentStreak / reward.streakRequired) * 100)}%` }}
                  />
                </div>
              ) : status === 'available' ? (
                <span className="text-xs text-primary font-medium">Tap to claim!</span>
              ) : (
                <span className="text-xs text-green-400 font-medium">Claimed ✓</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Type legend */}
      <div className="mt-6 pt-4 border-t border-border flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-orange-500" /> Badges
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-purple-500" /> Themes
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500" /> Features
        </span>
      </div>
    </div>
  );
}

// Compact badge display for profile/header
interface StreakBadgesProps {
  currentStreak: number;
  showAll?: boolean;
}

export function StreakBadges({ currentStreak, showAll = false }: StreakBadgesProps) {
  const badges = [
    { streak: 7, icon: '🔥', label: 'Week' },
    { streak: 14, icon: '⭐', label: '2 Weeks' },
    { streak: 30, icon: '👑', label: 'Month' },
    { streak: 60, icon: '⚡', label: '2 Months' },
    { streak: 90, icon: '🏆', label: 'Quarter' },
    { streak: 365, icon: '🎁', label: 'Year' },
  ];

  const earnedBadges = badges.filter(b => currentStreak >= b.streak);
  const displayBadges = showAll ? badges : earnedBadges;

  if (displayBadges.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      {displayBadges.map((badge) => (
        <span
          key={badge.streak}
          className={`text-lg ${currentStreak >= badge.streak ? '' : 'opacity-30 grayscale'}`}
          title={`${badge.label} streak ${currentStreak >= badge.streak ? 'earned!' : `(${badge.streak} days needed)`}`}
        >
          {badge.icon}
        </span>
      ))}
    </div>
  );
}
