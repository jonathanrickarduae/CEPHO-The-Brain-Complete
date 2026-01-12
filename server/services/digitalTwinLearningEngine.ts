/**
 * Digital Twin Learning Engine
 * Analyses interactions and extracts patterns to build your digital profile
 */

import { getDb } from '../db';
import { 
  digitalTwinProfile, 
  dtDecisionPatterns, 
  communicationPreferences, 
  learningEvents,
  autonomyLevels,
  profileAnswers
} from '../../drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';
import { invokeLLM, type InvokeResult } from '../_core/llm';

interface LearningInput {
  userId: number;
  source: string;
  sourceId?: string;
  content: string;
  context?: Record<string, unknown>;
}

interface ExtractedInsight {
  type: 'pattern' | 'preference' | 'value' | 'style';
  category: string;
  description: string;
  confidence: number;
  evidence: string;
}

/**
 * Record a learning event from any interaction
 */
export async function recordLearningEvent(input: LearningInput): Promise<void> {
  const { userId, source, sourceId, content, context } = input;
  
  // Store the raw learning event
  const db = await getDb();
  if (!db) return;
  
  await db.insert(learningEvents).values({
    userId,
    eventType: 'conversation',
    source,
    sourceId: sourceId || null,
    learningType: 'pattern_new',
    content,
    extractedInsights: context ? JSON.stringify(context) : null,
    isProcessed: false,
  });
}

/**
 * Process unprocessed learning events and extract insights
 */
export async function processLearningEvents(userId: number): Promise<void> {
  // Get unprocessed events
  const db = await getDb();
  if (!db) return;
  
  const events = await db.select()
    .from(learningEvents)
    .where(and(
      eq(learningEvents.userId, userId),
      eq(learningEvents.isProcessed, false)
    ))
    .limit(10);
  
  if (events.length === 0) return;
  
  // Get existing profile for context
  const profile = await getOrCreateProfile(userId);
  
  // Batch process events
  for (const event of events) {
    try {
      const insights = await extractInsights(event.content, profile);
      
      // Apply insights to profile
      for (const insight of insights) {
        await applyInsight(userId, insight, event.id);
      }
      
      // Mark as processed
      if (!db) continue;
      await db.update(learningEvents)
        .set({ 
          isProcessed: true, 
          processedAt: new Date(),
          extractedInsights: JSON.stringify(insights)
        })
        .where(eq(learningEvents.id, event.id));
        
    } catch (error) {
      console.error(`Failed to process learning event ${event.id}:`, error);
    }
  }
  
  // Update profile completeness
  await updateProfileCompleteness(userId);
}

/**
 * Extract insights from content using AI
 */
async function extractInsights(
  content: string, 
  profile: typeof digitalTwinProfile.$inferSelect | null
): Promise<ExtractedInsight[]> {
  const systemPrompt = `You are a Digital Twin Learning Engine. Analyse the following interaction and extract insights about the user's:
1. Decision-making patterns (how they approach decisions)
2. Communication preferences (tone, length, style)
3. Values and priorities (what matters to them)
4. Working style (how they like to operate)

Current profile context:
${profile ? JSON.stringify({
  communicationStyle: profile.communicationStyle,
  decisionSpeed: profile.decisionSpeed,
  riskTolerance: profile.riskTolerance,
  delegationStyle: profile.delegationStyle,
}) : 'No existing profile'}

Return a JSON array of insights. Each insight should have:
- type: "pattern" | "preference" | "value" | "style"
- category: specific category (e.g., "communication_tone", "decision_speed", "risk_approach")
- description: what you learned
- confidence: 0-100 how confident you are
- evidence: the specific text that led to this insight

Only extract clear, actionable insights. If nothing notable, return empty array.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyse this interaction:\n\n${content}` }
      ],
    }) as InvokeResult;
    
    // Parse JSON response
    const choice = response.choices?.[0];
    const text = typeof choice?.message?.content === 'string' 
      ? choice.message.content 
      : '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as ExtractedInsight[];
    }
    return [];
  } catch (error) {
    console.error('Failed to extract insights:', error);
    return [];
  }
}

/**
 * Apply an insight to the user's profile
 */
async function applyInsight(
  userId: number, 
  insight: ExtractedInsight, 
  eventId: number
): Promise<void> {
  if (insight.type === 'pattern') {
    // Check if similar pattern exists
    const db = await getDb();
    if (!db) return;
    
    const existing = await db.select()
      .from(dtDecisionPatterns)
      .where(and(
        eq(dtDecisionPatterns.userId, userId),
        eq(dtDecisionPatterns.patternName, insight.description.slice(0, 200))
      ))
      .limit(1);
    
    if (existing.length > 0) {
      // Reinforce existing pattern
      await db.update(dtDecisionPatterns)
        .set({
          confidence: Math.min(100, existing[0].confidence! + 10),
          occurrences: existing[0].occurrences! + 1,
          lastObserved: new Date(),
        })
        .where(eq(dtDecisionPatterns.id, existing[0].id));
    } else {
      // Create new pattern
      const categoryMap: Record<string, string> = {
        'decision_speed': 'strategic',
        'risk_approach': 'risk',
        'financial': 'financial',
        'people': 'people',
        'creative': 'creative',
        'technical': 'technical',
      };
      
      await db.insert(dtDecisionPatterns).values({
        userId,
        category: (categoryMap[insight.category] || 'operational') as any,
        patternName: insight.description.slice(0, 200),
        patternDescription: insight.evidence,
        confidence: insight.confidence,
        occurrences: 1,
        learnedFrom: JSON.stringify([eventId]),
      });
    }
  } else if (insight.type === 'preference') {
    // Store communication preference
    const db = await getDb();
    if (!db) return;
    
    const prefTypeMap: Record<string, string> = {
      'communication_tone': 'tone',
      'communication_length': 'length',
      'communication_format': 'format',
      'timing': 'timing',
    };
    
    await db.insert(communicationPreferences).values({
      userId,
      preferenceType: (prefTypeMap[insight.category] || 'tone') as any,
      preference: insight.description.slice(0, 200),
      preferenceDetails: insight.evidence,
      confidence: insight.confidence,
    });
  }
}

/**
 * Get or create a user's Digital Twin profile
 */
export async function getOrCreateProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const existing = await db.select()
    .from(digitalTwinProfile)
    .where(eq(digitalTwinProfile.userId, userId))
    .limit(1);
  
  if (existing.length > 0) {
    return existing[0];
  }
  
  // Create new profile
  await db.insert(digitalTwinProfile).values({
    userId,
    profileCompleteness: 0,
  });
  
  const created = await db.select()
    .from(digitalTwinProfile)
    .where(eq(digitalTwinProfile.userId, userId))
    .limit(1);
  
  return created[0] || null;
}

/**
 * Update profile completeness score
 */
async function updateProfileCompleteness(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  const profile = await db.select()
    .from(digitalTwinProfile)
    .where(eq(digitalTwinProfile.userId, userId))
    .limit(1);
  
  if (profile.length === 0) return;
  
  const p = profile[0];
  let completeness = 0;
  
  // Check each field
  if (p.communicationStyle) completeness += 10;
  if (p.decisionSpeed) completeness += 10;
  if (p.riskTolerance) completeness += 10;
  if (p.preferredWorkHours) completeness += 10;
  if (p.focusAreas) completeness += 10;
  if (p.delegationStyle) completeness += 10;
  if (p.personalityTraits) completeness += 15;
  if (p.coreValues) completeness += 15;
  if (p.thinkingFrameworks) completeness += 10;
  
  await db.update(digitalTwinProfile)
    .set({ 
      profileCompleteness: completeness,
      lastProfileUpdate: new Date(),
    })
    .where(eq(digitalTwinProfile.userId, userId));
}

/**
 * Get the full Digital Twin context for AI interactions
 */
export async function getDigitalTwinContext(userId: number): Promise<string> {
  const db = await getDb();
  if (!db) return '';
  
  const profile = await getOrCreateProfile(userId);
  
  // Get recent patterns
  const patterns = await db.select()
    .from(dtDecisionPatterns)
    .where(eq(dtDecisionPatterns.userId, userId))
    .orderBy(desc(dtDecisionPatterns.confidence))
    .limit(10);
  
  // Get communication preferences
  const prefs = await db.select()
    .from(communicationPreferences)
    .where(eq(communicationPreferences.userId, userId))
    .limit(10);
  
  // Get autonomy levels
  const autonomy = await db.select()
    .from(autonomyLevels)
    .where(eq(autonomyLevels.userId, userId));
  
  // Build context string
  let context = `## Digital Twin Profile\n\n`;
  
  if (profile) {
    context += `**Communication Style:** ${profile.communicationStyle || 'Not yet determined'}\n`;
    context += `**Decision Speed:** ${profile.decisionSpeed || 'Not yet determined'}\n`;
    context += `**Risk Tolerance:** ${profile.riskTolerance || 'Not yet determined'}\n`;
    context += `**Delegation Style:** ${profile.delegationStyle || 'Not yet determined'}\n`;
    
    if (profile.coreValues) {
      context += `**Core Values:** ${JSON.stringify(profile.coreValues)}\n`;
    }
    if (profile.focusAreas) {
      context += `**Focus Areas:** ${JSON.stringify(profile.focusAreas)}\n`;
    }
  }
  
  if (patterns.length > 0) {
    context += `\n## Decision Patterns\n\n`;
    for (const p of patterns) {
      context += `- **${p.patternName}** (${p.confidence}% confidence, ${p.occurrences} occurrences)\n`;
    }
  }
  
  if (prefs.length > 0) {
    context += `\n## Communication Preferences\n\n`;
    for (const pref of prefs) {
      context += `- **${pref.preferenceType}:** ${pref.preference}\n`;
    }
  }
  
  if (autonomy.length > 0) {
    context += `\n## Autonomy Levels\n\n`;
    for (const a of autonomy) {
      context += `- **${a.domain}:** Level ${a.currentLevel}/5 (Trust: ${a.trustScore}%)\n`;
    }
  }
  
  return context;
}

/**
 * Update autonomy level for a domain based on feedback
 */
export async function updateAutonomyLevel(
  userId: number,
  domain: string,
  wasSuccessful: boolean
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  const existing = await db.select()
    .from(autonomyLevels)
    .where(and(
      eq(autonomyLevels.userId, userId),
      eq(autonomyLevels.domain, domain)
    ))
    .limit(1);
  
  if (existing.length === 0) {
    // Create new autonomy tracking
    await db.insert(autonomyLevels).values({
      userId,
      domain,
      currentLevel: 1,
      targetLevel: 3,
      successfulActions: wasSuccessful ? 1 : 0,
      correctedActions: wasSuccessful ? 0 : 1,
      trustScore: wasSuccessful ? 10 : 0,
    });
    return;
  }
  
  const current = existing[0];
  const newSuccessful = current.successfulActions! + (wasSuccessful ? 1 : 0);
  const newCorrected = current.correctedActions! + (wasSuccessful ? 0 : 1);
  const total = newSuccessful + newCorrected;
  const newTrustScore = Math.round((newSuccessful / total) * 100);
  
  // Determine if level should change
  let newLevel = current.currentLevel;
  if (newTrustScore >= 90 && newSuccessful >= 10 && newLevel < 5) {
    newLevel = Math.min(5, newLevel + 1);
  } else if (newTrustScore < 50 && newLevel > 1) {
    newLevel = Math.max(1, newLevel - 1);
  }
  
  await db.update(autonomyLevels)
    .set({
      successfulActions: newSuccessful,
      correctedActions: newCorrected,
      trustScore: newTrustScore,
      currentLevel: newLevel,
      lastLevelChange: newLevel !== current.currentLevel ? new Date() : current.lastLevelChange,
    })
    .where(eq(autonomyLevels.id, current.id));
}
