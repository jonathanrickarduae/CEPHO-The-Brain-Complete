/**
 * Chief of Staff Learning Service
 * 
 * Handles pattern analysis, learning extraction, and preference modeling
 * to continuously improve COS personalization.
 */

import { invokeLLM } from "../_core/llm";

// =============================================================================
// TYPES
// =============================================================================

export interface InteractionContext {
  type: "question" | "command" | "feedback" | "correction" | "approval" | "rejection" | "clarification_request" | "preference_update";
  userInput: string;
  cosResponse: string;
  context: string;
  wasHelpful?: boolean;
  userSatisfaction?: number;
  requiredClarification?: boolean;
  wasCorrection?: boolean;
}

export interface LearnedLesson {
  type: "preference" | "correction" | "pattern" | "exception" | "context_rule" | "communication_style";
  title: string;
  description: string;
  triggerPattern: string;
  learnedBehavior: string;
  category: string;
  tags: string[];
  confidence: number;
}

export interface UserPreferenceProfile {
  communicationStyle: {
    tone: "formal" | "professional" | "casual" | "direct";
    length: "brief" | "moderate" | "detailed";
    format: "bullet_points" | "paragraphs" | "mixed";
  };
  workingStyle: {
    preferredHours: { start: string; end: string };
    focusTimes: string[];
    meetingPreferences: string[];
  };
  decisionStyle: {
    riskTolerance: "conservative" | "moderate" | "aggressive";
    speed: "deliberate" | "balanced" | "quick";
    delegationStyle: "hands_on" | "balanced" | "hands_off";
  };
  contentPreferences: {
    reportDetail: "executive_summary" | "standard" | "comprehensive";
    dataVisualization: "minimal" | "moderate" | "rich";
  };
}

export interface PatternAnalysisResult {
  patternType: "time_based" | "context_based" | "content_based" | "decision_based" | "communication_based";
  patternName: string;
  description: string;
  confidence: number;
  applicableContexts: string[];
  actionableInsight: string;
}

export interface ApprovalPrediction {
  wouldApprove: boolean;
  confidence: number;
  reasoning: string;
  suggestedModifications?: string[];
}

// =============================================================================
// LEARNING EXTRACTION
// =============================================================================

/**
 * Extract lessons from a single interaction
 */
export async function extractLessonsFromInteraction(
  interaction: InteractionContext,
  existingLessons: LearnedLesson[] = []
): Promise<LearnedLesson[]> {
  const systemPrompt = `You are an AI learning system that extracts actionable lessons from user interactions.

Your goal is to identify:
1. User preferences (how they like things done)
2. Corrections (what they changed or rejected)
3. Patterns (recurring behaviors or requests)
4. Exceptions (special cases or edge conditions)
5. Context rules (when certain behaviors apply)
6. Communication style preferences

For each lesson, provide:
- A clear, specific title
- A description of what was learned
- The trigger pattern (what situation activates this lesson)
- The learned behavior (how to respond)
- A category and tags for searchability
- A confidence score (0-100)

Only extract lessons that are actionable and specific. Avoid generic observations.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Analyze this interaction and extract any lessons:

Interaction Type: ${interaction.type}
User Input: ${interaction.userInput}
COS Response: ${interaction.cosResponse}
Context: ${interaction.context}
Was Helpful: ${interaction.wasHelpful ?? "unknown"}
User Satisfaction: ${interaction.userSatisfaction ?? "not rated"}
Required Clarification: ${interaction.requiredClarification}
Was Correction: ${interaction.wasCorrection}

Existing lessons to avoid duplicating:
${existingLessons.slice(0, 10).map(l => `- ${l.title}`).join("\n")}

Return as JSON array of lessons. Return empty array if no new lessons.`
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "lessons_extraction",
          strict: true,
          schema: {
            type: "object",
            properties: {
              lessons: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string", enum: ["preference", "correction", "pattern", "exception", "context_rule", "communication_style"] },
                    title: { type: "string" },
                    description: { type: "string" },
                    triggerPattern: { type: "string" },
                    learnedBehavior: { type: "string" },
                    category: { type: "string" },
                    tags: { type: "array", items: { type: "string" } },
                    confidence: { type: "number" }
                  },
                  required: ["type", "title", "description", "triggerPattern", "learnedBehavior", "category", "tags", "confidence"],
                  additionalProperties: false
                }
              }
            },
            required: ["lessons"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0]?.message?.content;
    if (content && typeof content === "string") {
      const parsed = JSON.parse(content);
      return parsed.lessons as LearnedLesson[];
    }
  } catch (error) {
    console.error("Error extracting lessons:", error);
  }

  return [];
}

// =============================================================================
// PATTERN ANALYSIS
// =============================================================================

/**
 * Analyze patterns across multiple interactions
 */
export async function analyzePatterns(
  interactions: InteractionContext[],
  existingPatterns: PatternAnalysisResult[] = []
): Promise<PatternAnalysisResult[]> {
  if (interactions.length < 3) {
    return []; // Need minimum interactions for pattern detection
  }

  const systemPrompt = `You are a pattern analysis system that identifies recurring behaviors and preferences from user interactions.

Look for:
1. Time-based patterns (when user prefers certain activities)
2. Context-based patterns (how context affects preferences)
3. Content-based patterns (what types of content user prefers)
4. Decision-based patterns (how user makes decisions)
5. Communication-based patterns (preferred communication styles)

For each pattern, provide:
- Pattern type
- Clear name
- Description
- Confidence score (0-100)
- Applicable contexts
- Actionable insight (how COS should use this pattern)

Only identify patterns with strong evidence (multiple occurrences).`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Analyze these ${interactions.length} interactions for patterns:

${interactions.slice(0, 20).map((i, idx) => `
[${idx + 1}] Type: ${i.type}
Input: ${i.userInput.substring(0, 200)}
Context: ${i.context}
Helpful: ${i.wasHelpful ?? "unknown"}
`).join("\n")}

Existing patterns to avoid duplicating:
${existingPatterns.map(p => `- ${p.patternName}`).join("\n")}

Return as JSON array of patterns. Return empty array if no clear patterns.`
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "pattern_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              patterns: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    patternType: { type: "string", enum: ["time_based", "context_based", "content_based", "decision_based", "communication_based"] },
                    patternName: { type: "string" },
                    description: { type: "string" },
                    confidence: { type: "number" },
                    applicableContexts: { type: "array", items: { type: "string" } },
                    actionableInsight: { type: "string" }
                  },
                  required: ["patternType", "patternName", "description", "confidence", "applicableContexts", "actionableInsight"],
                  additionalProperties: false
                }
              }
            },
            required: ["patterns"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0]?.message?.content;
    if (content && typeof content === "string") {
      const parsed = JSON.parse(content);
      return parsed.patterns as PatternAnalysisResult[];
    }
  } catch (error) {
    console.error("Error analyzing patterns:", error);
  }

  return [];
}

// =============================================================================
// APPROVAL PREDICTION
// =============================================================================

/**
 * Predict whether user would approve a proposed action
 */
export async function predictUserApproval(
  proposedAction: string,
  actionType: string,
  userPreferences: Partial<UserPreferenceProfile>,
  recentLessons: LearnedLesson[]
): Promise<ApprovalPrediction> {
  const systemPrompt = `You are a prediction system that determines whether a user would approve a proposed action.

Based on the user's known preferences and learned lessons, predict:
1. Would the user approve this action? (yes/no)
2. Confidence level (0-100)
3. Reasoning for the prediction
4. Suggested modifications if approval is uncertain

Be conservative - when in doubt, recommend seeking user approval.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Predict user approval for this action:

Proposed Action: ${proposedAction}
Action Type: ${actionType}

User Preferences:
${JSON.stringify(userPreferences, null, 2)}

Recent Lessons Learned:
${recentLessons.slice(0, 10).map(l => `- ${l.title}: ${l.learnedBehavior}`).join("\n")}

Return prediction as JSON.`
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "approval_prediction",
          strict: true,
          schema: {
            type: "object",
            properties: {
              wouldApprove: { type: "boolean" },
              confidence: { type: "number" },
              reasoning: { type: "string" },
              suggestedModifications: { type: "array", items: { type: "string" } }
            },
            required: ["wouldApprove", "confidence", "reasoning"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0]?.message?.content;
    if (content && typeof content === "string") {
      return JSON.parse(content) as ApprovalPrediction;
    }
  } catch (error) {
    console.error("Error predicting approval:", error);
  }

  // Default to seeking approval when uncertain
  return {
    wouldApprove: false,
    confidence: 0,
    reasoning: "Unable to predict - recommending user approval",
    suggestedModifications: []
  };
}

// =============================================================================
// PREFERENCE PROFILE BUILDING
// =============================================================================

/**
 * Build or update user preference profile from lessons and patterns
 */
export async function buildPreferenceProfile(
  lessons: LearnedLesson[],
  patterns: PatternAnalysisResult[],
  existingProfile?: Partial<UserPreferenceProfile>
): Promise<UserPreferenceProfile> {
  const systemPrompt = `You are a profile building system that synthesizes user preferences from lessons and patterns.

Build a comprehensive preference profile covering:
1. Communication style (tone, length, format)
2. Working style (hours, focus times, meeting preferences)
3. Decision style (risk tolerance, speed, delegation)
4. Content preferences (report detail, data visualization)

Use the lessons and patterns as evidence. When evidence is lacking, use sensible defaults.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Build user preference profile from this data:

Lessons Learned:
${lessons.map(l => `- [${l.type}] ${l.title}: ${l.learnedBehavior}`).join("\n")}

Patterns Identified:
${patterns.map(p => `- [${p.patternType}] ${p.patternName}: ${p.actionableInsight}`).join("\n")}

Existing Profile:
${existingProfile ? JSON.stringify(existingProfile, null, 2) : "None"}

Return complete profile as JSON.`
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "preference_profile",
          strict: true,
          schema: {
            type: "object",
            properties: {
              communicationStyle: {
                type: "object",
                properties: {
                  tone: { type: "string", enum: ["formal", "professional", "casual", "direct"] },
                  length: { type: "string", enum: ["brief", "moderate", "detailed"] },
                  format: { type: "string", enum: ["bullet_points", "paragraphs", "mixed"] }
                },
                required: ["tone", "length", "format"],
                additionalProperties: false
              },
              workingStyle: {
                type: "object",
                properties: {
                  preferredHours: {
                    type: "object",
                    properties: {
                      start: { type: "string" },
                      end: { type: "string" }
                    },
                    required: ["start", "end"],
                    additionalProperties: false
                  },
                  focusTimes: { type: "array", items: { type: "string" } },
                  meetingPreferences: { type: "array", items: { type: "string" } }
                },
                required: ["preferredHours", "focusTimes", "meetingPreferences"],
                additionalProperties: false
              },
              decisionStyle: {
                type: "object",
                properties: {
                  riskTolerance: { type: "string", enum: ["conservative", "moderate", "aggressive"] },
                  speed: { type: "string", enum: ["deliberate", "balanced", "quick"] },
                  delegationStyle: { type: "string", enum: ["hands_on", "balanced", "hands_off"] }
                },
                required: ["riskTolerance", "speed", "delegationStyle"],
                additionalProperties: false
              },
              contentPreferences: {
                type: "object",
                properties: {
                  reportDetail: { type: "string", enum: ["executive_summary", "standard", "comprehensive"] },
                  dataVisualization: { type: "string", enum: ["minimal", "moderate", "rich"] }
                },
                required: ["reportDetail", "dataVisualization"],
                additionalProperties: false
              }
            },
            required: ["communicationStyle", "workingStyle", "decisionStyle", "contentPreferences"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0]?.message?.content;
    if (content && typeof content === "string") {
      return JSON.parse(content) as UserPreferenceProfile;
    }
  } catch (error) {
    console.error("Error building preference profile:", error);
  }

  // Return default profile
  return {
    communicationStyle: {
      tone: "professional",
      length: "moderate",
      format: "mixed"
    },
    workingStyle: {
      preferredHours: { start: "09:00", end: "18:00" },
      focusTimes: ["morning"],
      meetingPreferences: ["afternoon"]
    },
    decisionStyle: {
      riskTolerance: "moderate",
      speed: "balanced",
      delegationStyle: "balanced"
    },
    contentPreferences: {
      reportDetail: "standard",
      dataVisualization: "moderate"
    }
  };
}

// =============================================================================
// TRAINING LEVEL CALCULATION
// =============================================================================

/**
 * Calculate COS training level based on metrics
 */
export function calculateTrainingLevel(
  totalInteractions: number,
  correctPredictions: number,
  userCorrections: number,
  lessonsCount: number,
  patternsCount: number
): "novice" | "learning" | "proficient" | "expert" | "master" {
  const accuracy = totalInteractions > 0 ? correctPredictions / totalInteractions : 0;
  const correctionRate = totalInteractions > 0 ? userCorrections / totalInteractions : 1;
  
  // Calculate composite score
  const interactionScore = Math.min(totalInteractions / 100, 1) * 20; // Max 20 points
  const accuracyScore = accuracy * 30; // Max 30 points
  const correctionPenalty = correctionRate * 10; // Max 10 points penalty
  const knowledgeScore = Math.min((lessonsCount + patternsCount) / 50, 1) * 20; // Max 20 points
  
  const totalScore = interactionScore + accuracyScore - correctionPenalty + knowledgeScore;
  
  if (totalScore >= 55) return "master";
  if (totalScore >= 45) return "expert";
  if (totalScore >= 30) return "proficient";
  if (totalScore >= 15) return "learning";
  return "novice";
}

// All functions are exported inline above
