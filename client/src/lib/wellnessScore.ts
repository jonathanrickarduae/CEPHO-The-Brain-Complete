/**
 * Wellness Score Algorithm
 * 
 * Proprietary algorithm that calculates a user's daily wellness score (1-10)
 * based on multiple factors including mood, productivity, and patterns.
 */

export interface WellnessInputs {
  // Mood data (from mood checks)
  moodScores: number[]; // Array of mood scores (1-10) for the day
  moodTrend: 'improving' | 'stable' | 'declining';
  
  // Productivity data
  tasksCompleted: number;
  tasksPlanned: number;
  focusMinutes: number;
  meetingMinutes: number;
  
  // Calendar data
  calendarDensity: number; // 0-1, percentage of day booked
  backToBackMeetings: number;
  
  // Historical context
  averageScore: number; // User's historical average
  streakDays: number; // Days of consistent usage
  
  // Optional health data
  sleepHours?: number;
  exerciseMinutes?: number;
}

export interface WellnessOutput {
  score: number; // 1-10
  breakdown: {
    mood: number;
    productivity: number;
    balance: number;
    momentum: number;
  };
  insights: string[];
  recommendations: string[];
  trend: 'improving' | 'stable' | 'declining';
}

// Weights for different factors (proprietary tuning)
const WEIGHTS = {
  mood: 0.35,
  productivity: 0.30,
  balance: 0.20,
  momentum: 0.15,
};

// Optimal ranges for different metrics
const OPTIMAL = {
  focusMinutes: { min: 120, max: 300 }, // 2-5 hours
  meetingMinutes: { min: 30, max: 180 }, // 0.5-3 hours
  calendarDensity: { min: 0.3, max: 0.7 }, // 30-70% booked
  sleepHours: { min: 7, max: 9 },
  exerciseMinutes: { min: 20, max: 60 },
};

/**
 * Calculate mood component score
 */
function calculateMoodScore(inputs: WellnessInputs): number {
  if (inputs.moodScores.length === 0) return 5; // Default neutral
  
  // Average of mood scores
  const avgMood = inputs.moodScores.reduce((a, b) => a + b, 0) / inputs.moodScores.length;
  
  // Bonus for improving trend
  let trendBonus = 0;
  if (inputs.moodTrend === 'improving') trendBonus = 0.5;
  if (inputs.moodTrend === 'declining') trendBonus = -0.5;
  
  // Bonus for consistency (low variance)
  const variance = inputs.moodScores.length > 1
    ? inputs.moodScores.reduce((sum, score) => sum + Math.pow(score - avgMood, 2), 0) / inputs.moodScores.length
    : 0;
  const consistencyBonus = variance < 2 ? 0.3 : 0;
  
  return Math.min(10, Math.max(1, avgMood + trendBonus + consistencyBonus));
}

/**
 * Calculate productivity component score
 */
function calculateProductivityScore(inputs: WellnessInputs): number {
  // Task completion rate
  const completionRate = inputs.tasksPlanned > 0 
    ? inputs.tasksCompleted / inputs.tasksPlanned 
    : 0.5;
  
  // Focus time score (optimal is 2-5 hours)
  let focusScore = 5;
  if (inputs.focusMinutes >= OPTIMAL.focusMinutes.min && inputs.focusMinutes <= OPTIMAL.focusMinutes.max) {
    focusScore = 10;
  } else if (inputs.focusMinutes < OPTIMAL.focusMinutes.min) {
    focusScore = (inputs.focusMinutes / OPTIMAL.focusMinutes.min) * 10;
  } else {
    // Diminishing returns above optimal
    focusScore = 10 - ((inputs.focusMinutes - OPTIMAL.focusMinutes.max) / 60);
  }
  
  // Combine completion rate and focus time
  const rawScore = (completionRate * 6) + (focusScore * 0.4);
  
  return Math.min(10, Math.max(1, rawScore));
}

/**
 * Calculate work-life balance component score
 */
function calculateBalanceScore(inputs: WellnessInputs): number {
  let score = 10;
  
  // Calendar density penalty
  if (inputs.calendarDensity > OPTIMAL.calendarDensity.max) {
    score -= (inputs.calendarDensity - OPTIMAL.calendarDensity.max) * 10;
  } else if (inputs.calendarDensity < OPTIMAL.calendarDensity.min) {
    // Too empty can also be suboptimal
    score -= 1;
  }
  
  // Back-to-back meetings penalty
  score -= inputs.backToBackMeetings * 0.5;
  
  // Meeting overload penalty
  if (inputs.meetingMinutes > OPTIMAL.meetingMinutes.max) {
    score -= ((inputs.meetingMinutes - OPTIMAL.meetingMinutes.max) / 60) * 2;
  }
  
  // Sleep bonus (if available)
  if (inputs.sleepHours !== undefined) {
    if (inputs.sleepHours >= OPTIMAL.sleepHours.min && inputs.sleepHours <= OPTIMAL.sleepHours.max) {
      score += 1;
    } else if (inputs.sleepHours < 6) {
      score -= 2;
    }
  }
  
  // Exercise bonus (if available)
  if (inputs.exerciseMinutes !== undefined && inputs.exerciseMinutes >= OPTIMAL.exerciseMinutes.min) {
    score += 0.5;
  }
  
  return Math.min(10, Math.max(1, score));
}

/**
 * Calculate momentum component score
 */
function calculateMomentumScore(inputs: WellnessInputs): number {
  let score = 5; // Start neutral
  
  // Streak bonus
  if (inputs.streakDays >= 7) score += 2;
  else if (inputs.streakDays >= 3) score += 1;
  
  // Above average bonus
  const currentEstimate = (calculateMoodScore(inputs) + calculateProductivityScore(inputs)) / 2;
  if (currentEstimate > inputs.averageScore) {
    score += Math.min(2, (currentEstimate - inputs.averageScore) * 0.5);
  } else {
    score -= Math.min(2, (inputs.averageScore - currentEstimate) * 0.3);
  }
  
  return Math.min(10, Math.max(1, score));
}

/**
 * Generate insights based on the data
 */
function generateInsights(inputs: WellnessInputs, breakdown: WellnessOutput['breakdown']): string[] {
  const insights: string[] = [];
  
  if (breakdown.mood >= 8) {
    insights.push("Your mood has been excellent today! Keep up the positive energy.");
  } else if (breakdown.mood <= 4) {
    insights.push("Your mood seems lower than usual. Consider taking a short break.");
  }
  
  if (inputs.tasksPlanned > 0 && inputs.tasksCompleted / inputs.tasksPlanned >= 0.8) {
    insights.push(`Great productivity! You completed ${inputs.tasksCompleted} of ${inputs.tasksPlanned} tasks.`);
  }
  
  if (inputs.focusMinutes >= 180) {
    insights.push(`You achieved ${Math.round(inputs.focusMinutes / 60)} hours of deep focus time.`);
  }
  
  if (inputs.backToBackMeetings >= 3) {
    insights.push("You had several back-to-back meetings. Consider scheduling buffer time.");
  }
  
  if (inputs.streakDays >= 7) {
    insights.push(`Amazing! You're on a ${inputs.streakDays}-day streak of using The Brain.`);
  }
  
  return insights;
}

/**
 * Generate recommendations based on the data
 */
function generateRecommendations(inputs: WellnessInputs, breakdown: WellnessOutput['breakdown']): string[] {
  const recommendations: string[] = [];
  
  if (breakdown.balance < 6) {
    recommendations.push("Try to protect some focus time tomorrow by blocking your calendar.");
  }
  
  if (breakdown.mood < 6 && inputs.moodTrend === 'declining') {
    recommendations.push("Your mood has been declining. Consider scheduling something enjoyable.");
  }
  
  if (inputs.focusMinutes < 60) {
    recommendations.push("Aim for at least 2 hours of uninterrupted focus time tomorrow.");
  }
  
  if (inputs.calendarDensity > 0.8) {
    recommendations.push("Your calendar is very full. Consider declining or rescheduling some meetings.");
  }
  
  if (inputs.sleepHours !== undefined && inputs.sleepHours < 6) {
    recommendations.push("Prioritize sleep tonight. Aim for 7-8 hours for optimal performance.");
  }
  
  if (breakdown.productivity < 6 && inputs.tasksPlanned > 5) {
    recommendations.push("Consider planning fewer tasks tomorrow to increase completion rate.");
  }
  
  return recommendations.slice(0, 3); // Max 3 recommendations
}

/**
 * Determine overall trend
 */
function determineTrend(inputs: WellnessInputs, score: number): WellnessOutput['trend'] {
  const diff = score - inputs.averageScore;
  if (diff > 0.5) return 'improving';
  if (diff < -0.5) return 'declining';
  return 'stable';
}

/**
 * Main wellness score calculation function
 */
export function calculateWellnessScore(inputs: WellnessInputs): WellnessOutput {
  const breakdown = {
    mood: calculateMoodScore(inputs),
    productivity: calculateProductivityScore(inputs),
    balance: calculateBalanceScore(inputs),
    momentum: calculateMomentumScore(inputs),
  };
  
  // Weighted average
  const rawScore = 
    breakdown.mood * WEIGHTS.mood +
    breakdown.productivity * WEIGHTS.productivity +
    breakdown.balance * WEIGHTS.balance +
    breakdown.momentum * WEIGHTS.momentum;
  
  // Round to one decimal place
  const score = Math.round(rawScore * 10) / 10;
  
  return {
    score: Math.min(10, Math.max(1, score)),
    breakdown,
    insights: generateInsights(inputs, breakdown),
    recommendations: generateRecommendations(inputs, breakdown),
    trend: determineTrend(inputs, score),
  };
}

/**
 * Get a human-readable label for the score
 */
export function getScoreLabel(score: number): string {
  if (score >= 9) return "Exceptional";
  if (score >= 8) return "Excellent";
  if (score >= 7) return "Very Good";
  if (score >= 6) return "Good";
  if (score >= 5) return "Moderate";
  if (score >= 4) return "Fair";
  if (score >= 3) return "Needs Attention";
  return "Challenging";
}

/**
 * Get color for score display
 */
export function getScoreColor(score: number): string {
  if (score >= 8) return "text-green-500";
  if (score >= 6) return "text-blue-500";
  if (score >= 4) return "text-yellow-500";
  return "text-red-500";
}
