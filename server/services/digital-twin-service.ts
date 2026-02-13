/**
 * Digital Twin / Chief of Staff Service
 * Implements personalized AI assistant with 8-module training program
 */

import { getDb } from '../db';
import { digitalTwins, cosTrainingProgress, decisionLog } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

// 8 Training Modules for Chief of Staff
export const TRAINING_MODULES = [
  {
    id: 1,
    title: 'Strategic Thinking & Business Acumen',
    objective: 'Develop ability to think strategically and understand business fundamentals',
    duration: 20, // hours
    topics: [
      'Strategic planning frameworks',
      'Business model analysis',
      'Competitive strategy',
      'Market dynamics',
      'Financial fundamentals',
    ],
    competencies: [
      'Can analyze business models',
      'Understands competitive positioning',
      'Can create strategic plans',
      'Evaluates market opportunities',
    ],
  },
  {
    id: 2,
    title: 'Executive Communication',
    objective: 'Master communication with C-suite executives and stakeholders',
    duration: 15,
    topics: [
      'Executive briefing formats',
      'Stakeholder management',
      'Persuasive communication',
      'Crisis communication',
      'Board presentations',
    ],
    competencies: [
      'Writes clear executive summaries',
      'Adapts communication style',
      'Handles difficult conversations',
      'Presents to boards',
    ],
  },
  {
    id: 3,
    title: 'Project & Program Management',
    objective: 'Lead complex initiatives from conception to completion',
    duration: 25,
    topics: [
      'Project planning & scoping',
      'Resource allocation',
      'Risk management',
      'Stakeholder coordination',
      'Agile methodologies',
    ],
    competencies: [
      'Manages multiple projects',
      'Identifies and mitigates risks',
      'Coordinates cross-functional teams',
      'Delivers on time and budget',
    ],
  },
  {
    id: 4,
    title: 'Decision Support & Analysis',
    objective: 'Provide data-driven insights for executive decision-making',
    duration: 18,
    topics: [
      'Data analysis techniques',
      'Decision frameworks',
      'Scenario planning',
      'Cost-benefit analysis',
      'Predictive modeling',
    ],
    competencies: [
      'Analyzes complex data',
      'Presents actionable insights',
      'Evaluates trade-offs',
      'Recommends decisions',
    ],
  },
  {
    id: 5,
    title: 'Organizational Dynamics',
    objective: 'Navigate organizational politics and culture',
    duration: 12,
    topics: [
      'Organizational behavior',
      'Change management',
      'Cultural dynamics',
      'Influence without authority',
      'Conflict resolution',
    ],
    competencies: [
      'Reads organizational dynamics',
      'Builds coalitions',
      'Manages change',
      'Resolves conflicts',
    ],
  },
  {
    id: 6,
    title: 'Industry & Market Intelligence',
    objective: 'Maintain deep understanding of industry trends and competitive landscape',
    duration: 16,
    topics: [
      'Market research methods',
      'Competitive intelligence',
      'Trend analysis',
      'Industry frameworks',
      'Expert networking',
    ],
    competencies: [
      'Conducts market research',
      'Tracks competitive moves',
      'Identifies trends',
      'Synthesizes intelligence',
    ],
  },
  {
    id: 7,
    title: 'Innovation & Problem Solving',
    objective: 'Drive innovation and solve complex business problems',
    duration: 14,
    topics: [
      'Design thinking',
      'Creative problem solving',
      'Innovation frameworks',
      'Experimentation methods',
      'Failure analysis',
    ],
    competencies: [
      'Applies design thinking',
      'Generates innovative solutions',
      'Tests hypotheses',
      'Learns from failures',
    ],
  },
  {
    id: 8,
    title: 'Personal Effectiveness & Leadership',
    objective: 'Develop personal leadership and effectiveness skills',
    duration: 10,
    topics: [
      'Time management',
      'Emotional intelligence',
      'Leadership styles',
      'Personal branding',
      'Continuous learning',
    ],
    competencies: [
      'Manages time effectively',
      'Demonstrates EQ',
      'Leads by example',
      'Continuously improves',
    ],
  },
];

/**
 * Create or get digital twin profile
 */
export async function getOrCreateProfile(userId: string) {
  // Check if profile exists
  let [profile] = await (await getDb()).select()
    .from(digitalTwins)
    .where(eq(digitalTwins.userId, userId));

  if (!profile) {
    // Create new profile
    [profile] = await (await getDb()).insert(digitalTwins).values({
      userId,
      name: 'Your Digital Twin',
      learningStyle: 'adaptive',
      competencyLevel: 0,
      preferences: {},
      successDNA: {},
    }).returning();
  }

  return profile;
}

/**
 * Get training progress
 */
export async function getTrainingProgress(userId: string) {
  const progress = await (await getDb()).select()
    .from(cosTrainingProgress)
    .where(eq(cosTrainingProgress.userId, userId))
    .orderBy(cosTrainingProgress.moduleId);

  return progress;
}

/**
 * Get module details
 */
export function getModule(moduleId: number) {
  return TRAINING_MODULES.find(m => m.id === moduleId);
}

/**
 * Start a training module
 */
export async function startModule(userId: string, moduleId: number) {
  const module = getModule(moduleId);
  if (!module) throw new Error('Module not found');

  // Check if already started
  const [existing] = await (await getDb()).select()
    .from(cosTrainingProgress)
    .where(
      and(
        eq(cosTrainingProgress.userId, userId),
        eq(cosTrainingProgress.moduleId, moduleId)
      )
    );

  if (existing) {
    return existing;
  }

  // Create progress record
  const [progress] = await (await getDb()).insert(cosTrainingProgress).values({
    userId,
    moduleId,
    moduleTitle: module.title,
    status: 'in_progress',
    progress: 0,
    startedAt: new Date(),
  }).returning();

  return progress;
}

/**
 * Complete a training module
 */
export async function completeModule(
  userId: string,
  moduleId: number,
  assessmentScore: number
) {
  const module = getModule(moduleId);
  if (!module) throw new Error('Module not found');

  // Update progress
  await (await getDb()).update(cosTrainingProgress)
    .set({
      status: 'completed',
      progress: 100,
      assessmentScore,
      completedAt: new Date(),
    })
    .where(
      and(
        eq(cosTrainingProgress.userId, userId),
        eq(cosTrainingProgress.moduleId, moduleId)
      )
    );

  // Update digital twin competency level
  const allProgress = await getTrainingProgress(userId);
  const completedModules = allProgress.filter(p => p.status === 'completed');
  const averageScore = completedModules.reduce((sum, p) => sum + (p.assessmentScore || 0), 0) / completedModules.length;
  const competencyLevel = (completedModules.length / TRAINING_MODULES.length) * 100;

  await (await getDb()).update(digitalTwins)
    .set({
      competencyLevel,
      averageScore,
    })
    .where(eq(digitalTwins.userId, userId));

  return {
    moduleCompleted: true,
    competencyLevel,
    averageScore,
    completedModules: completedModules.length,
    totalModules: TRAINING_MODULES.length,
  };
}

/**
 * Record a decision for learning
 */
export async function recordDecision(
  userId: string,
  context: string,
  options: string[],
  selectedOption: string,
  reasoning: string
) {
  const [decision] = await (await getDb()).insert(decisionLog).values({
    userId,
    context,
    options,
    selectedOption,
    reasoning,
    timestamp: new Date(),
  }).returning();

  // Update digital twin with learning
  const profile = await getOrCreateProfile(userId);
  const preferences = profile.preferences as any || {};
  
  // Extract patterns from decision
  const decisionPattern = {
    context,
    preference: selectedOption,
    reasoning,
  };

  // Update preferences
  preferences.decisionPatterns = preferences.decisionPatterns || [];
  preferences.decisionPatterns.push(decisionPattern);

  await (await getDb()).update(digitalTwins)
    .set({ preferences })
    .where(eq(digitalTwins.userId, userId));

  return decision;
}

/**
 * Get AI suggestion based on learned preferences
 */
export async function getSuggestion(userId: string, context: string, options: string[]) {
  const profile = await getOrCreateProfile(userId);
  const preferences = profile.preferences as any || {};
  const decisionPatterns = preferences.decisionPatterns || [];

  // Find similar past decisions
  const similarDecisions = decisionPatterns.filter((p: any) => 
    p.context.toLowerCase().includes(context.toLowerCase()) ||
    context.toLowerCase().includes(p.context.toLowerCase())
  );

  if (similarDecisions.length > 0) {
    // Return suggestion based on past patterns
    const mostCommon = similarDecisions[0];
    return {
      suggestion: mostCommon.preference,
      confidence: similarDecisions.length / decisionPatterns.length,
      reasoning: `Based on ${similarDecisions.length} similar past decisions: ${mostCommon.reasoning}`,
      alternatives: options.filter(o => o !== mostCommon.preference),
    };
  }

  // No pattern found, return neutral suggestion
  return {
    suggestion: options[0],
    confidence: 0.3,
    reasoning: 'No similar past decisions found. This is a neutral suggestion.',
    alternatives: options.slice(1),
  };
}

/**
 * Get decision history
 */
export async function getDecisionHistory(userId: string, limit: number = 50) {
  const decisions = await (await getDb()).select()
    .from(decisionLog)
    .where(eq(decisionLog.userId, userId))
    .orderBy(decisionLog.timestamp)
    .limit(limit);

  return decisions;
}

/**
 * Calculate overall competency score
 */
export async function getCompetencyScore(userId: string) {
  const progress = await getTrainingProgress(userId);
  const profile = await getOrCreateProfile(userId);

  const completedModules = progress.filter(p => p.status === 'completed');
  const totalScore = completedModules.reduce((sum, p) => sum + (p.assessmentScore || 0), 0);
  const averageScore = completedModules.length > 0 ? totalScore / completedModules.length : 0;

  return {
    overallScore: profile.competencyLevel,
    averageAssessmentScore: averageScore,
    completedModules: completedModules.length,
    totalModules: TRAINING_MODULES.length,
    moduleScores: completedModules.map(p => ({
      moduleId: p.moduleId,
      moduleTitle: p.moduleTitle,
      score: p.assessmentScore,
    })),
  };
}

/**
 * Update learning style preference
 */
export async function updateLearningStyle(
  userId: string,
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading' | 'adaptive'
) {
  await (await getDb()).update(digitalTwins)
    .set({ learningStyle })
    .where(eq(digitalTwins.userId, userId));

  return true;
}

/**
 * Record user preference
 */
export async function recordPreference(
  userId: string,
  category: string,
  preference: any
) {
  const profile = await getOrCreateProfile(userId);
  const preferences = profile.preferences as any || {};

  preferences[category] = preference;

  await (await getDb()).update(digitalTwins)
    .set({ preferences })
    .where(eq(digitalTwins.userId, userId));

  return true;
}
