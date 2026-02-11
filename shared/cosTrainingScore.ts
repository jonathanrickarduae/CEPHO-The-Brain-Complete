/**
 * COS (Chief of Staff) Training Score System
 * 
 * The COS training level affects ALL assessment scores.
 * Until COS reaches 100%, all scores are weighted down proportionally.
 * 
 * Philosophy: "Getting You to 100" - The COS must be fully trained
 * to provide accurate assessments. Untrained COS = unreliable scores.
 */

export interface COSTrainingLevel {
  level: number;           // 1-5 (Novice to Expert)
  name: string;
  percentage: number;      // 0-100 training completion
  description: string;
  capabilities: string[];
  weightMultiplier: number; // Applied to all scores
}

export const COS_TRAINING_LEVELS: COSTrainingLevel[] = [
  {
    level: 1,
    name: "Novice",
    percentage: 20,
    description: "Basic understanding of CEPHO systems",
    capabilities: [
      "Basic task management",
      "Simple queries",
      "Standard responses"
    ],
    weightMultiplier: 0.60  // Scores weighted at 60%
  },
  {
    level: 2,
    name: "Learning",
    percentage: 40,
    description: "Developing knowledge of processes and SME panels",
    capabilities: [
      "SME panel coordination",
      "Basic workflow management",
      "Document organization",
      "Morning/Evening signals"
    ],
    weightMultiplier: 0.70  // Scores weighted at 70%
  },
  {
    level: 3,
    name: "Competent",
    percentage: 60,
    description: "Solid understanding of all core systems",
    capabilities: [
      "Full SME panel management",
      "Project Genesis coordination",
      "Quality gate oversight",
      "KPI assessment support",
      "Innovation Hub facilitation"
    ],
    weightMultiplier: 0.80  // Scores weighted at 80%
  },
  {
    level: 4,
    name: "Proficient",
    percentage: 80,
    description: "Advanced capabilities with strategic insight",
    capabilities: [
      "Strategic advisory support",
      "Cross-domain coordination",
      "Proactive recommendations",
      "Risk identification",
      "Resource optimization"
    ],
    weightMultiplier: 0.90  // Scores weighted at 90%
  },
  {
    level: 5,
    name: "Expert",
    percentage: 100,
    description: "Full mastery - COS operates at peak efficiency",
    capabilities: [
      "Autonomous decision support",
      "Predictive insights",
      "Full quality assurance",
      "Executive-level briefings",
      "Continuous improvement"
    ],
    weightMultiplier: 1.00  // Full score weight
  }
];

/**
 * Calculate the weighted score based on COS training level
 * @param rawScore The original assessment score (0-100)
 * @param cosTrainingPercentage The COS training completion (0-100)
 * @returns Weighted score adjusted for COS training level
 */
export function calculateWeightedScore(
  rawScore: number, 
  cosTrainingPercentage: number
): number {
  const level = getCOSLevel(cosTrainingPercentage);
  const weightedScore = rawScore * level.weightMultiplier;
  return Math.round(weightedScore * 10) / 10; // Round to 1 decimal
}

/**
 * Get the COS training level based on percentage
 */
export function getCOSLevel(percentage: number): COSTrainingLevel {
  if (percentage >= 100) return COS_TRAINING_LEVELS[4];
  if (percentage >= 80) return COS_TRAINING_LEVELS[3];
  if (percentage >= 60) return COS_TRAINING_LEVELS[2];
  if (percentage >= 40) return COS_TRAINING_LEVELS[1];
  return COS_TRAINING_LEVELS[0];
}

/**
 * Calculate overall assessment score with COS weight applied
 * @param categoryScores Array of raw category scores
 * @param cosTrainingPercentage COS training completion
 * @returns Object with raw average, weighted average, and COS impact
 */
export function calculateOverallScore(
  categoryScores: number[],
  cosTrainingPercentage: number
): {
  rawAverage: number;
  weightedAverage: number;
  cosLevel: COSTrainingLevel;
  cosImpact: number;
  message: string;
} {
  const rawAverage = categoryScores.reduce((a, b) => a + b, 0) / categoryScores.length;
  const cosLevel = getCOSLevel(cosTrainingPercentage);
  const weightedAverage = rawAverage * cosLevel.weightMultiplier;
  const cosImpact = rawAverage - weightedAverage;
  
  let message = '';
  if (cosLevel.level < 5) {
    message = `Score reduced by ${cosImpact.toFixed(1)} points due to COS training at ${cosTrainingPercentage}%. Complete COS training to unlock full score potential.`;
  } else {
    message = 'COS fully trained - scores at full weight.';
  }
  
  return {
    rawAverage: Math.round(rawAverage * 10) / 10,
    weightedAverage: Math.round(weightedAverage * 10) / 10,
    cosLevel,
    cosImpact: Math.round(cosImpact * 10) / 10,
    message
  };
}

/**
 * Get training progress to next level
 */
export function getProgressToNextLevel(currentPercentage: number): {
  currentLevel: COSTrainingLevel;
  nextLevel: COSTrainingLevel | null;
  progressToNext: number;
  percentageNeeded: number;
} {
  const currentLevel = getCOSLevel(currentPercentage);
  const nextLevelIndex = COS_TRAINING_LEVELS.findIndex(l => l.level === currentLevel.level) + 1;
  const nextLevel = nextLevelIndex < COS_TRAINING_LEVELS.length 
    ? COS_TRAINING_LEVELS[nextLevelIndex] 
    : null;
  
  if (!nextLevel) {
    return {
      currentLevel,
      nextLevel: null,
      progressToNext: 100,
      percentageNeeded: 0
    };
  }
  
  const rangeStart = currentLevel.percentage;
  const rangeEnd = nextLevel.percentage;
  const progressInRange = ((currentPercentage - rangeStart) / (rangeEnd - rangeStart)) * 100;
  
  return {
    currentLevel,
    nextLevel,
    progressToNext: Math.max(0, Math.min(100, progressInRange)),
    percentageNeeded: nextLevel.percentage - currentPercentage
  };
}
