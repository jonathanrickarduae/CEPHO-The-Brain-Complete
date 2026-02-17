/**
 * Chief of Staff Training System
 * 8 Training Modules to transform Digital Twin into autonomous Chief of Staff
 */

import { db } from '../db';
import {
  cosTrainingModules,
  cosModuleProgress,
  digitalTwinProfiles,
  digitalTwinGoals,
  digitalTwinPreferences,
} from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

// 8 Training Modules
export const TRAINING_MODULES = [
  {
    id: 'M1',
    name: 'Success DNA Capture',
    description: 'Learn your unique patterns, preferences, and decision-making style',
    duration: '2-3 weeks',
    objectives: [
      'Capture work patterns and habits',
      'Identify decision-making preferences',
      'Map communication style',
      'Document success factors',
    ],
    activities: [
      'Daily habit tracking',
      'Decision logging',
      'Communication analysis',
      'Success pattern identification',
    ],
    competencies: ['pattern_recognition', 'preference_mapping', 'style_analysis'],
  },
  {
    id: 'M2',
    name: 'Context Understanding',
    description: 'Understand your business, industry, and strategic objectives',
    duration: '2-3 weeks',
    objectives: [
      'Learn business model and operations',
      'Understand industry dynamics',
      'Map strategic objectives',
      'Identify key stakeholders',
    ],
    activities: [
      'Business model analysis',
      'Industry research',
      'Stakeholder mapping',
      'Strategic planning review',
    ],
    competencies: ['business_understanding', 'industry_knowledge', 'strategic_thinking'],
  },
  {
    id: 'M3',
    name: 'Task Management',
    description: 'Master your task prioritization and execution approach',
    duration: '1-2 weeks',
    objectives: [
      'Learn prioritization methods',
      'Understand task dependencies',
      'Master delegation approach',
      'Optimize workflow',
    ],
    activities: [
      'Task tracking',
      'Priority analysis',
      'Delegation pattern learning',
      'Workflow optimization',
    ],
    competencies: ['prioritization', 'delegation', 'workflow_management'],
  },
  {
    id: 'M4',
    name: 'Communication Mastery',
    description: 'Learn to communicate in your voice and style',
    duration: '2-3 weeks',
    objectives: [
      'Capture communication style',
      'Learn tone and language',
      'Master stakeholder communication',
      'Develop response patterns',
    ],
    activities: [
      'Email analysis',
      'Meeting observation',
      'Stakeholder interaction tracking',
      'Response pattern learning',
    ],
    competencies: ['communication_style', 'stakeholder_management', 'response_generation'],
  },
  {
    id: 'M5',
    name: 'Decision Support',
    description: 'Provide intelligent recommendations based on your decision patterns',
    duration: '2-3 weeks',
    objectives: [
      'Learn decision frameworks',
      'Understand risk tolerance',
      'Master option analysis',
      'Develop recommendation engine',
    ],
    activities: [
      'Decision tracking',
      'Risk assessment',
      'Option evaluation',
      'Recommendation practice',
    ],
    competencies: ['decision_analysis', 'risk_assessment', 'recommendation_generation'],
  },
  {
    id: 'M6',
    name: 'Proactive Intelligence',
    description: 'Anticipate needs and provide insights before being asked',
    duration: '3-4 weeks',
    objectives: [
      'Learn to anticipate needs',
      'Develop insight generation',
      'Master proactive alerts',
      'Build predictive models',
    ],
    activities: [
      'Need anticipation practice',
      'Insight generation',
      'Alert configuration',
      'Predictive modeling',
    ],
    competencies: ['anticipation', 'insight_generation', 'predictive_analytics'],
  },
  {
    id: 'M7',
    name: 'Continuous Learning',
    description: 'Adapt and improve through feedback and observation',
    duration: 'Ongoing',
    objectives: [
      'Implement feedback loops',
      'Track performance metrics',
      'Identify improvement areas',
      'Evolve capabilities',
    ],
    activities: [
      'Feedback collection',
      'Performance tracking',
      'Gap analysis',
      'Capability evolution',
    ],
    competencies: ['feedback_processing', 'self_improvement', 'adaptation'],
  },
  {
    id: 'M8',
    name: 'Autonomous Operation',
    description: 'Operate independently with minimal supervision',
    duration: '4-6 weeks',
    objectives: [
      'Achieve autonomous decision-making',
      'Master independent execution',
      'Develop self-correction',
      'Build trust and reliability',
    ],
    activities: [
      'Autonomous task execution',
      'Independent problem-solving',
      'Self-correction practice',
      'Trust building',
    ],
    competencies: ['autonomy', 'independent_execution', 'self_correction', 'reliability'],
  },
];

/**
 * Initialize Training Program
 */
export async function initializeTraining(userId: string): Promise<any> {
  // Create or get digital twin profile
  let profile = await db.select()
    .from(digitalTwinProfiles)
    .where(eq(digitalTwinProfiles.userId, userId))
    .limit(1);
  
  if (!profile || profile.length === 0) {
    const [newProfile] = await db.insert(digitalTwinProfiles).values({
      userId,
      successDNA: {},
      learningStyle: 'adaptive',
      communicationPreferences: {},
      workingStyle: {},
    }).returning();
    
    profile = [newProfile];
  }
  
  // Create training module records
  for (const module of TRAINING_MODULES) {
    // Check if module already exists
    const existing = await db.select()
      .from(cosTrainingModules)
      .where(and(
        eq(cosTrainingModules.profileId, profile[0].id),
        eq(cosTrainingModules.moduleId, module.id)
      ))
      .limit(1);
    
    if (existing.length === 0) {
      await db.insert(cosTrainingModules).values({
        profileId: profile[0].id,
        moduleId: module.id,
        moduleName: module.name,
        description: module.description,
        status: module.id === 'M1' ? 'in_progress' : 'not_started',
        progress: 0,
        objectives: module.objectives,
        competencies: module.competencies,
      });
    }
  }
  
  return {
    profile: profile[0],
    modules: TRAINING_MODULES,
    currentModule: 'M1',
  };
}

/**
 * Get Training Progress
 */
export async function getTrainingProgress(userId: string): Promise<any> {
  const profile = await db.select()
    .from(digitalTwinProfiles)
    .where(eq(digitalTwinProfiles.userId, userId))
    .limit(1);
  
  if (!profile || profile.length === 0) {
    return null;
  }
  
  const modules = await db.select()
    .from(cosTrainingModules)
    .where(eq(cosTrainingModules.profileId, profile[0].id))
    .orderBy(cosTrainingModules.moduleId);
  
  // Calculate overall progress
  const totalProgress = modules.reduce((sum, m) => sum + (m.progress || 0), 0);
  const overallProgress = Math.round(totalProgress / modules.length);
  
  // Get current module
  const currentModule = modules.find(m => m.status === 'in_progress');
  
  return {
    profile: profile[0],
    modules,
    overallProgress,
    currentModule,
    completedModules: modules.filter(m => m.status === 'completed').length,
    totalModules: modules.length,
  };
}

/**
 * Update Module Progress
 */
export async function updateModuleProgress(data: {
  userId: string;
  moduleId: string;
  progress: number;
  activities: any[];
  insights: any[];
}): Promise<any> {
  const profile = await db.select()
    .from(digitalTwinProfiles)
    .where(eq(digitalTwinProfiles.userId, data.userId))
    .limit(1);
  
  if (!profile || profile.length === 0) {
    throw new Error('Profile not found');
  }
  
  // Update module
  const updated = await db.update(cosTrainingModules)
    .set({
      progress: data.progress,
      status: data.progress >= 100 ? 'completed' : 'in_progress',
      completedAt: data.progress >= 100 ? new Date() : undefined,
      updatedAt: new Date(),
    })
    .where(and(
      eq(cosTrainingModules.profileId, profile[0].id),
      eq(cosTrainingModules.moduleId, data.moduleId)
    ))
    .returning();
  
  // Record progress entry
  await db.insert(cosModuleProgress).values({
    moduleId: updated[0].id,
    progress: data.progress,
    activities: data.activities,
    insights: data.insights,
  });
  
  // If module completed, start next module
  if (data.progress >= 100) {
    const moduleIndex = TRAINING_MODULES.findIndex(m => m.id === data.moduleId);
    if (moduleIndex < TRAINING_MODULES.length - 1) {
      const nextModule = TRAINING_MODULES[moduleIndex + 1];
      
      await db.update(cosTrainingModules)
        .set({
          status: 'in_progress',
          startedAt: new Date(),
        })
        .where(and(
          eq(cosTrainingModules.profileId, profile[0].id),
          eq(cosTrainingModules.moduleId, nextModule.id)
        ));
    }
  }
  
  return updated[0];
}

/**
 * Capture Success DNA
 * Module 1: Learn user's patterns and preferences
 */
export async function captureSuccessDNA(data: {
  userId: string;
  patterns: any;
  preferences: any;
  decisions: any[];
}): Promise<void> {
  const profile = await db.select()
    .from(digitalTwinProfiles)
    .where(eq(digitalTwinProfiles.userId, data.userId))
    .limit(1);
  
  if (profile.length > 0) {
    // Update success DNA
    const currentDNA = profile[0].successDNA || {};
    const updatedDNA = {
      ...currentDNA,
      patterns: { ...(currentDNA.patterns || {}), ...data.patterns },
      preferences: { ...(currentDNA.preferences || {}), ...data.preferences },
      decisions: [...(currentDNA.decisions || []), ...data.decisions],
    };
    
    await db.update(digitalTwinProfiles)
      .set({
        successDNA: updatedDNA,
        updatedAt: new Date(),
      })
      .where(eq(digitalTwinProfiles.id, profile[0].id));
  }
}

/**
 * Set Goals
 */
export async function setGoals(data: {
  userId: string;
  goals: Array<{
    title: string;
    description: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
    targetDate?: Date;
  }>;
}): Promise<any[]> {
  const profile = await db.select()
    .from(digitalTwinProfiles)
    .where(eq(digitalTwinProfiles.userId, data.userId))
    .limit(1);
  
  if (!profile || profile.length === 0) {
    throw new Error('Profile not found');
  }
  
  const createdGoals = [];
  
  for (const goal of data.goals) {
    const [created] = await db.insert(digitalTwinGoals).values({
      profileId: profile[0].id,
      title: goal.title,
      description: goal.description,
      category: goal.category,
      priority: goal.priority,
      targetDate: goal.targetDate,
      status: 'active',
    }).returning();
    
    createdGoals.push(created);
  }
  
  return createdGoals;
}

/**
 * Get Daily Briefing
 */
export async function generateDailyBriefing(userId: string): Promise<any> {
  const profile = await db.select()
    .from(digitalTwinProfiles)
    .where(eq(digitalTwinProfiles.userId, userId))
    .limit(1);
  
  if (!profile || profile.length === 0) {
    return null;
  }
  
  // Get active goals
  const goals = await db.select()
    .from(digitalTwinGoals)
    .where(and(
      eq(digitalTwinGoals.profileId, profile[0].id),
      eq(digitalTwinGoals.status, 'active')
    ));
  
  // Generate briefing based on profile and goals
  const briefing = {
    date: new Date().toISOString(),
    greeting: `Good morning! Ready to make today count?`,
    summary: `You have ${goals.length} active goals and a productive day ahead.`,
    priorities: goals.slice(0, 3).map(g => ({
      goal: g.title,
      action: 'Make progress on this today',
    })),
    insights: [
      'Your energy peaks in the morning - schedule important tasks early',
      'You have 3 meetings today - prepare talking points',
      'Review yesterday\'s progress before starting new work',
    ],
    recommendations: [
      'Block 2 hours for deep work',
      'Delegate routine tasks',
      'Schedule tomorrow\'s priorities',
    ],
  };
  
  return briefing;
}

/**
 * Assess Competency Level
 */
export async function assessCompetency(userId: string): Promise<any> {
  const profile = await db.select()
    .from(digitalTwinProfiles)
    .where(eq(digitalTwinProfiles.userId, userId))
    .limit(1);
  
  if (!profile || profile.length === 0) {
    return null;
  }
  
  const modules = await db.select()
    .from(cosTrainingModules)
    .where(eq(cosTrainingModules.profileId, profile[0].id));
  
  // Calculate competency scores
  const competencies: Record<string, number> = {};
  
  for (const module of modules) {
    if (module.competencies) {
      for (const comp of module.competencies) {
        if (!competencies[comp]) {
          competencies[comp] = 0;
        }
        competencies[comp] += (module.progress || 0) / 100;
      }
    }
  }
  
  // Normalize scores
  const competencyScores = Object.entries(competencies).map(([name, score]) => ({
    name,
    score: Math.min(100, Math.round((score / modules.length) * 100)),
    level: score >= 0.8 ? 'expert' : score >= 0.6 ? 'proficient' : score >= 0.4 ? 'intermediate' : 'beginner',
  }));
  
  return {
    overallLevel: calculateOverallLevel(competencyScores),
    competencies: competencyScores,
    readinessScore: Math.round(competencyScores.reduce((sum, c) => sum + c.score, 0) / competencyScores.length),
  };
}

function calculateOverallLevel(competencies: any[]): string {
  const avgScore = competencies.reduce((sum, c) => sum + c.score, 0) / competencies.length;
  
  if (avgScore >= 80) return 'autonomous';
  if (avgScore >= 60) return 'advanced';
  if (avgScore >= 40) return 'intermediate';
  return 'beginner';
}
