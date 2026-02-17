/**
 * COS Digital Twin Learning System
 * 
 * This module handles:
 * - Interaction logging and capture
 * - Pattern extraction from interactions
 * - User mental model building
 * - Learning metrics tracking
 * 
 * The COS learns from EVERY interaction to think like the user.
 */

import { getDb } from "./db";
import {
  cosInteractionLog,
  cosLearnedPatterns,
  cosUserMentalModel,
  cosLearningMetrics,
  cosTrainingProgress,
} from "../drizzle/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { invokeLLM } from "./_core/llm";

// =============================================================================
// INTERACTION LOGGING
// =============================================================================

export type InteractionType = 
  | "question"
  | "clarification"
  | "correction"
  | "approval"
  | "rejection"
  | "feedback"
  | "preference"
  | "instruction";

export interface LogInteractionInput {
  userId: number;
  interactionType: InteractionType;
  userInput: string;
  cosResponse?: string;
  context?: string;
  sessionId?: string;
}

/**
 * Log an interaction for COS learning
 */
export async function logInteraction(input: LogInteractionInput) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(cosInteractionLog).values({
    userId: input.userId,
    interactionType: input.interactionType,
    userInput: input.userInput,
    cosResponse: input.cosResponse,
    context: input.context,
    sessionId: input.sessionId,
    processed: false,
    appliedToModel: false,
  });
  
  return result.insertId;
}

/**
 * Get unprocessed interactions for learning extraction
 */
export async function getUnprocessedInteractions(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(cosInteractionLog)
    .where(
      and(
        eq(cosInteractionLog.userId, userId),
        eq(cosInteractionLog.processed, false)
      )
    )
    .orderBy(desc(cosInteractionLog.createdAt))
    .limit(limit);
}

// =============================================================================
// PATTERN EXTRACTION
// =============================================================================

export type PatternType =
  | "thinking_style"
  | "decision_pattern"
  | "communication_style"
  | "quality_standard"
  | "priority_pattern"
  | "workflow_pattern"
  | "format_preference"
  | "terminology"
  | "value"
  | "pet_peeve";

/**
 * Extract learning from an interaction using LLM
 */
export async function extractLearningFromInteraction(
  interaction: typeof cosInteractionLog.$inferSelect
) {
  const prompt = `Analyze this user interaction and extract any learnings about the user's preferences, thinking style, or standards.

INTERACTION TYPE: ${interaction.interactionType}
USER INPUT: ${interaction.userInput}
${interaction.cosResponse ? `COS RESPONSE: ${interaction.cosResponse}` : ""}
${interaction.context ? `CONTEXT: ${interaction.context}` : ""}

Based on this interaction, identify:
1. What can we learn about how this user thinks or works?
2. What preferences or standards are revealed?
3. What should the COS remember for future interactions?

Respond in JSON format:
{
  "learnings": [
    {
      "patternType": "thinking_style|decision_pattern|communication_style|quality_standard|priority_pattern|workflow_pattern|format_preference|terminology|value|pet_peeve",
      "patternName": "Brief name for this pattern",
      "patternDescription": "Detailed description of what was learned",
      "confidence": 0.0-1.0
    }
  ],
  "extractedLearning": "One sentence summary of what was learned",
  "learningCategory": "Category of the main learning"
}`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are a pattern extraction system that analyzes user interactions to understand their thinking style, preferences, and standards. Be specific and actionable in your extractions." },
        { role: "user", content: prompt }
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== 'string') return null;
    
    return JSON.parse(content);
  } catch (error) {
    console.error("Error extracting learning:", error);
    return null;
  }
}

/**
 * Save extracted patterns to database
 */
export async function saveLearnedPattern(
  userId: number,
  pattern: {
    patternType: PatternType;
    patternName: string;
    patternDescription: string;
    confidence: number;
  },
  sourceInteractionId: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if similar pattern exists
  const existing = await db
    .select()
    .from(cosLearnedPatterns)
    .where(
      and(
        eq(cosLearnedPatterns.userId, userId),
        eq(cosLearnedPatterns.patternType, pattern.patternType),
        eq(cosLearnedPatterns.patternName, pattern.patternName)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Reinforce existing pattern
    const existingPattern = existing[0];
    const newConfidence = Math.min(
      1,
      existingPattern.confidenceScore + pattern.confidence * 0.1
    );
    const sourceIds = (existingPattern.sourceInteractionIds as number[]) || [];
    
    await db
      .update(cosLearnedPatterns)
      .set({
        confidenceScore: newConfidence,
        occurrenceCount: (existingPattern.occurrenceCount || 0) + 1,
        sourceInteractionIds: [...sourceIds, sourceInteractionId],
        updatedAt: new Date(),
      })
      .where(eq(cosLearnedPatterns.id, existingPattern.id));
    
    return existingPattern.id;
  } else {
    // Create new pattern
    const [result] = await db.insert(cosLearnedPatterns).values({
      userId,
      patternType: pattern.patternType,
      patternName: pattern.patternName,
      patternDescription: pattern.patternDescription,
      confidenceScore: pattern.confidence,
      sourceInteractionIds: [sourceInteractionId],
      active: true,
    });
    
    return result.insertId;
  }
}

/**
 * Process unprocessed interactions and extract learnings
 */
export async function processInteractionsForLearning(userId: number) {
  const db = await getDb();
  if (!db) return { processedCount: 0, patternsLearned: 0 };
  
  const interactions = await getUnprocessedInteractions(userId);
  
  let processedCount = 0;
  let patternsLearned = 0;
  
  for (const interaction of interactions) {
    const extraction = await extractLearningFromInteraction(interaction);
    
    if (extraction) {
      // Update interaction with extracted learning
      await db
        .update(cosInteractionLog)
        .set({
          extractedLearning: extraction.extractedLearning,
          learningCategory: extraction.learningCategory,
          processed: true,
        })
        .where(eq(cosInteractionLog.id, interaction.id));
      
      // Save each learned pattern
      for (const learning of extraction.learnings) {
        if (learning.confidence >= 0.3) {
          await saveLearnedPattern(
            userId,
            learning as any,
            interaction.id
          );
          patternsLearned++;
        }
      }
      
      processedCount++;
    }
  }
  
  return { processedCount, patternsLearned };
}

// =============================================================================
// USER MENTAL MODEL
// =============================================================================

/**
 * Get or create user mental model
 */
export async function getUserMentalModel(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const existing = await db
    .select()
    .from(cosUserMentalModel)
    .where(eq(cosUserMentalModel.userId, userId))
    .limit(1);
  
  if (existing.length > 0) {
    return existing[0];
  }
  
  // Create new mental model
  await db.insert(cosUserMentalModel).values({
    userId,
    overallConfidence: 0.2,
    interactionsProcessed: 0,
  });
  
  const [newModel] = await db
    .select()
    .from(cosUserMentalModel)
    .where(eq(cosUserMentalModel.userId, userId))
    .limit(1);
  
  return newModel;
}

/**
 * Get all learned patterns for a user
 */
export async function getLearnedPatterns(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(cosLearnedPatterns)
    .where(
      and(
        eq(cosLearnedPatterns.userId, userId),
        eq(cosLearnedPatterns.active, true)
      )
    )
    .orderBy(desc(cosLearnedPatterns.confidenceScore));
}

/**
 * Update user mental model based on learned patterns
 */
export async function updateUserMentalModel(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  // Get all active patterns
  const patterns = await getLearnedPatterns(userId);
  
  if (patterns.length === 0) {
    return null;
  }
  
  // Group patterns by type
  const patternsByType: Record<string, typeof patterns> = {};
  for (const pattern of patterns) {
    if (!patternsByType[pattern.patternType]) {
      patternsByType[pattern.patternType] = [];
    }
    patternsByType[pattern.patternType].push(pattern);
  }
  
  // Build mental model summary using LLM
  const patternSummary = Object.entries(patternsByType)
    .map(([type, typePatterns]) => 
      `${type.toUpperCase()}:\n${typePatterns.map(p => `- ${p.patternName}: ${p.patternDescription} (confidence: ${p.confidenceScore})`).join('\n')}`
    )
    .join('\n\n');
  
  const prompt = `Based on these learned patterns about a user, create a comprehensive mental model summary.

PATTERNS BY TYPE:
${patternSummary}

Create a mental model with:
1. thinkingStyle - How this user approaches problems
2. communicationStyle - How they prefer to communicate
3. decisionMakingStyle - How they make decisions
4. topPriorities - What matters most to them (array of strings)
5. coreValues - Their guiding values (array of strings)
6. qualityStandards - What "good" looks like to them (array of strings)
7. petPeeves - Things that annoy them (array of strings)

Respond in JSON format.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are building a mental model of a user based on observed patterns. Be specific and actionable." },
        { role: "user", content: prompt }
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== 'string') return null;
    
    const model = JSON.parse(content);
    
    // Calculate confidence based on pattern count and confidence scores
    const avgConfidence = patterns.reduce((sum, p) => sum + p.confidenceScore, 0) / patterns.length;
    const patternCountFactor = Math.min(1, patterns.length / 50);
    const overallConfidence = avgConfidence * 0.6 + patternCountFactor * 0.4;
    
    // Update mental model
    await db
      .update(cosUserMentalModel)
      .set({
        thinkingStyle: model.thinkingStyle,
        communicationStyle: model.communicationStyle,
        decisionMakingStyle: model.decisionMakingStyle,
        topPriorities: model.topPriorities,
        coreValues: model.coreValues,
        qualityStandards: model.qualityStandards,
        petPeeves: model.petPeeves,
        overallConfidence,
        lastMajorUpdate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(cosUserMentalModel.userId, userId));
    
    return model;
  } catch (error) {
    console.error("Error updating mental model:", error);
    return null;
  }
}

// =============================================================================
// COS TRAINING PROGRESS
// =============================================================================

/**
 * Get or create training progress
 */
export async function getTrainingProgress(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const existing = await db
    .select()
    .from(cosTrainingProgress)
    .where(eq(cosTrainingProgress.userId, userId))
    .limit(1);
  
  if (existing.length > 0) {
    return existing[0];
  }
  
  // Create new progress
  await db.insert(cosTrainingProgress).values({
    userId,
    currentLevel: 1,
    trainingPercentage: 20,
    completedModules: [],
  });
  
  const [newProgress] = await db
    .select()
    .from(cosTrainingProgress)
    .where(eq(cosTrainingProgress.userId, userId))
    .limit(1);
  
  return newProgress;
}

/**
 * Calculate COS training weight multiplier
 * Until COS is at 100%, all scores are weighted down
 */
export function calculateTrainingWeight(trainingPercentage: number): number {
  return trainingPercentage / 100;
}

/**
 * Apply training weight to a score
 */
export function applyTrainingWeight(
  score: number,
  trainingPercentage: number
): number {
  const weight = calculateTrainingWeight(trainingPercentage);
  return Math.round(score * weight);
}

// =============================================================================
// LEARNING METRICS
// =============================================================================

/**
 * Record daily learning metrics
 */
export async function recordLearningMetrics(userId: number) {
  const db = await getDb();
  if (!db) return;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Count today's interactions
  const interactionCounts = await db
    .select({
      total: sql<number>`COUNT(*)`,
      corrections: sql<number>`SUM(CASE WHEN interactionType = 'correction' THEN 1 ELSE 0 END)`,
      approvals: sql<number>`SUM(CASE WHEN interactionType = 'approval' THEN 1 ELSE 0 END)`,
    })
    .from(cosInteractionLog)
    .where(
      and(
        eq(cosInteractionLog.userId, userId),
        sql`DATE(createdAt) = DATE(${today})`
      )
    );
  
  const counts = interactionCounts[0];
  
  // Calculate accuracy (approvals / (approvals + corrections))
  const totalFeedback = (counts?.approvals || 0) + (counts?.corrections || 0);
  const accuracyScore = totalFeedback > 0 
    ? (counts?.approvals || 0) / totalFeedback 
    : null;
  
  // Save metrics
  await db.insert(cosLearningMetrics).values({
    userId,
    metricDate: today,
    periodType: "daily",
    totalInteractions: counts?.total || 0,
    correctionsReceived: counts?.corrections || 0,
    approvalsReceived: counts?.approvals || 0,
    accuracyScore,
  });
}

// =============================================================================
// EXPORTS FOR TRPC ROUTES
// =============================================================================

export const cosLearningService = {
  logInteraction,
  getUnprocessedInteractions,
  extractLearningFromInteraction,
  saveLearnedPattern,
  processInteractionsForLearning,
  getUserMentalModel,
  getLearnedPatterns,
  updateUserMentalModel,
  getTrainingProgress,
  calculateTrainingWeight,
  applyTrainingWeight,
  recordLearningMetrics,
};
