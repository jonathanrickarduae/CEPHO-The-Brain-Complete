import { describe, it, expect } from 'vitest';

// Test Wellness Score Algorithm
describe('Wellness Score Algorithm', () => {
  // Weight constants
  const WEIGHTS = {
    mood: 0.35,
    productivity: 0.30,
    balance: 0.20,
    momentum: 0.15,
  };

  it('should calculate weighted average correctly', () => {
    const breakdown = {
      mood: 8,
      productivity: 7,
      balance: 6,
      momentum: 9,
    };

    const expected = 
      breakdown.mood * WEIGHTS.mood +
      breakdown.productivity * WEIGHTS.productivity +
      breakdown.balance * WEIGHTS.balance +
      breakdown.momentum * WEIGHTS.momentum;

    expect(expected).toBeCloseTo(7.45, 2);
  });

  it('should calculate mood score from multiple entries', () => {
    const moodScores = [7, 8, 6, 8, 7];
    const avgMood = moodScores.reduce((a, b) => a + b, 0) / moodScores.length;
    expect(avgMood).toBe(7.2);
  });

  it('should calculate task completion rate', () => {
    const tasksCompleted = 8;
    const tasksPlanned = 10;
    const completionRate = tasksCompleted / tasksPlanned;
    expect(completionRate).toBe(0.8);
  });

  it('should detect optimal focus time range', () => {
    const OPTIMAL_FOCUS = { min: 120, max: 300 }; // 2-5 hours in minutes
    
    const isOptimal = (minutes: number) => 
      minutes >= OPTIMAL_FOCUS.min && minutes <= OPTIMAL_FOCUS.max;

    expect(isOptimal(180)).toBe(true);  // 3 hours - optimal
    expect(isOptimal(60)).toBe(false);  // 1 hour - too low
    expect(isOptimal(360)).toBe(false); // 6 hours - too high
  });

  it('should calculate calendar density penalty', () => {
    const OPTIMAL_DENSITY = { min: 0.3, max: 0.7 };
    
    const calculatePenalty = (density: number) => {
      if (density > OPTIMAL_DENSITY.max) {
        return (density - OPTIMAL_DENSITY.max) * 10;
      }
      return 0;
    };

    expect(calculatePenalty(0.5)).toBe(0);   // Optimal
    expect(calculatePenalty(0.8)).toBeCloseTo(1, 5);   // 10% over
    expect(calculatePenalty(0.9)).toBeCloseTo(2, 5);   // 20% over
  });

  it('should apply streak bonus correctly', () => {
    const calculateStreakBonus = (days: number) => {
      if (days >= 7) return 2;
      if (days >= 3) return 1;
      return 0;
    };

    expect(calculateStreakBonus(10)).toBe(2);
    expect(calculateStreakBonus(5)).toBe(1);
    expect(calculateStreakBonus(2)).toBe(0);
  });

  it('should generate appropriate recommendations', () => {
    const generateRecommendations = (inputs: {
      focusMinutes: number;
      calendarDensity: number;
      sleepHours?: number;
    }) => {
      const recommendations: string[] = [];
      
      if (inputs.focusMinutes < 60) {
        recommendations.push("Aim for at least 2 hours of focus time");
      }
      if (inputs.calendarDensity > 0.8) {
        recommendations.push("Consider declining some meetings");
      }
      if (inputs.sleepHours && inputs.sleepHours < 6) {
        recommendations.push("Prioritize sleep tonight");
      }
      
      return recommendations;
    };

    const recs = generateRecommendations({
      focusMinutes: 30,
      calendarDensity: 0.9,
      sleepHours: 5,
    });

    expect(recs).toHaveLength(3);
    expect(recs[0]).toContain("focus");
    expect(recs[1]).toContain("meetings");
    expect(recs[2]).toContain("sleep");
  });
});

// Test Referral System
describe('Referral System', () => {
  it('should generate unique referral codes', () => {
    const generateCode = () => `BRAIN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    const codes = new Set();
    for (let i = 0; i < 100; i++) {
      codes.add(generateCode());
    }
    
    // All codes should be unique
    expect(codes.size).toBe(100);
  });

  it('should calculate position jump from referrals', () => {
    const REWARDS = {
      inviteSent: 50,
      friendJoined: 200,
      friendConverted: 500,
    };

    const calculateJump = (referrals: { sent: number; joined: number; converted: number }) => {
      return (
        referrals.sent * REWARDS.inviteSent +
        referrals.joined * REWARDS.friendJoined +
        referrals.converted * REWARDS.friendConverted
      );
    };

    expect(calculateJump({ sent: 5, joined: 2, converted: 1 })).toBe(1150);
    expect(calculateJump({ sent: 10, joined: 0, converted: 0 })).toBe(500);
  });

  it('should calculate queue percentile', () => {
    const calculatePercentile = (position: number, total: number) => {
      return Math.round((1 - position / total) * 100);
    };

    expect(calculatePercentile(1000, 10000)).toBe(90);  // Top 10%
    expect(calculatePercentile(5000, 10000)).toBe(50);  // Top 50%
    expect(calculatePercentile(9000, 10000)).toBe(10);  // Top 90%
  });

  it('should validate email format for invites', () => {
    const isValidEmail = (email: string) => {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(email);
    };

    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('@nodomain.com')).toBe(false);
  });

  it('should parse comma-separated emails', () => {
    const parseEmails = (input: string) => {
      return input
        .split(',')
        .map(e => e.trim())
        .filter(e => e.length > 0);
    };

    const result = parseEmails('a@b.com, c@d.com,  e@f.com  ');
    expect(result).toHaveLength(3);
    expect(result[0]).toBe('a@b.com');
    expect(result[2]).toBe('e@f.com');
  });
});

// Test Shareable Insights
describe('Shareable Insights', () => {
  it('should generate share text with branding', () => {
    const generateShareText = (type: string, score: number) => {
      const emoji = type === 'productivity' ? '📊' : type === 'wellness' ? '🌟' : '🧠';
      return `${emoji} My ${type} score: ${score}/10\n\nPowered by The Brain 🧠`;
    };

    const text = generateShareText('productivity', 8);
    expect(text).toContain('📊');
    expect(text).toContain('8/10');
    expect(text).toContain('Powered by The Brain');
  });

  it('should generate unique share codes', () => {
    const generateShareCode = () => Math.random().toString(36).substring(2, 10);
    
    const codes = new Set();
    for (let i = 0; i < 100; i++) {
      codes.add(generateShareCode());
    }
    
    expect(codes.size).toBe(100);
  });

  it('should format share URL correctly', () => {
    const formatShareUrl = (code: string) => `https://thebrain.app/shared/${code}`;
    
    const url = formatShareUrl('abc123');
    expect(url).toBe('https://thebrain.app/shared/abc123');
  });

  it('should encode text for Twitter sharing', () => {
    const text = "My score: 8/10! 🎉";
    const encoded = encodeURIComponent(text);
    
    expect(encoded).not.toContain(' ');
    expect(encoded).toContain('%20'); // Space encoded
  });

  it('should determine trend from score comparison', () => {
    const determineTrend = (current: number, average: number) => {
      const diff = current - average;
      if (diff > 0.5) return 'improving';
      if (diff < -0.5) return 'declining';
      return 'stable';
    };

    expect(determineTrend(8, 6)).toBe('improving');
    expect(determineTrend(5, 7)).toBe('declining');
    expect(determineTrend(7, 7.2)).toBe('stable');
  });
});

// Test Credit System
describe('Credit System', () => {
  it('should calculate credit balance', () => {
    const transactions = [
      { amount: 100, type: 'bonus' },
      { amount: 50, type: 'referral_sent' },
      { amount: -30, type: 'ai_usage' },
      { amount: 200, type: 'referral_joined' },
    ];

    const balance = transactions.reduce((sum, t) => sum + t.amount, 0);
    expect(balance).toBe(320);
  });

  it('should validate sufficient credits for action', () => {
    const hasSufficientCredits = (balance: number, cost: number) => balance >= cost;

    expect(hasSufficientCredits(100, 50)).toBe(true);
    expect(hasSufficientCredits(30, 50)).toBe(false);
    expect(hasSufficientCredits(50, 50)).toBe(true);
  });

  it('should apply referral rewards correctly', () => {
    const REWARDS = {
      inviteSent: 10,
      friendJoined: 50,
      friendConverted: 200,
    };

    const applyReward = (type: keyof typeof REWARDS) => REWARDS[type];

    expect(applyReward('inviteSent')).toBe(10);
    expect(applyReward('friendJoined')).toBe(50);
    expect(applyReward('friendConverted')).toBe(200);
  });
});

// Test Data Network Effects
describe('Data Network Effects', () => {
  it('should anonymize user data for collective learning', () => {
    const anonymize = (data: { userId: string; pattern: string }) => ({
      pattern: data.pattern,
      timestamp: Date.now(),
      // userId is removed
    });

    const original = { userId: 'user123', pattern: 'morning_productive' };
    const anonymized = anonymize(original);

    expect(anonymized).not.toHaveProperty('userId');
    expect(anonymized.pattern).toBe('morning_productive');
  });

  it('should aggregate patterns across users', () => {
    const patterns = [
      { pattern: 'morning_productive', count: 150 },
      { pattern: 'afternoon_meetings', count: 200 },
      { pattern: 'evening_creative', count: 80 },
    ];

    const totalUsers = patterns.reduce((sum, p) => sum + p.count, 0);
    const mostCommon = patterns.reduce((max, p) => p.count > max.count ? p : max);

    expect(totalUsers).toBe(430);
    expect(mostCommon.pattern).toBe('afternoon_meetings');
  });

  it('should calculate model improvement from data volume', () => {
    // Simplified model improvement calculation
    const calculateImprovement = (dataPoints: number) => {
      // Logarithmic improvement (diminishing returns)
      return Math.min(100, Math.log10(dataPoints + 1) * 20);
    };

    expect(calculateImprovement(100)).toBeCloseTo(40, 0);
    expect(calculateImprovement(1000)).toBeCloseTo(60, 0);
    expect(calculateImprovement(10000)).toBeCloseTo(80, 0);
  });
});
