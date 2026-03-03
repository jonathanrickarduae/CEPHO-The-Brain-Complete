/**
 * DT-MOD-04: Dynamic Prompt Assembler
 *
 * Translates the Cognitive Model into real-time, context-aware system prompts
 * for every AI agent interaction. This is the bridge between the Digital Twin's
 * static model and the dynamic world of LLM interactions.
 *
 * Per Appendix Q of the Grand Master Plan v11.
 */

import { db } from "../db";
import { digitalTwinCognitiveModel, digitalTwinVocabulary, digitalTwinProfile } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export interface CognitiveModelSnapshot {
  communicationStyle: {
    formality: number;
    verbosity: number;
    humor: number;
    useEmoji: boolean;
  };
  riskTolerance: number;
  decisionHeuristics: string[];
  strategicPriorities: { priority: string; weight: number }[];
  values: string[];
  vocabulary: {
    preferredTerms: Record<string, string>;
    avoidedTerms: string[];
    commonPhrases: string[];
  };
  calibrationScore: number;
}

/**
 * Fetches the full cognitive model snapshot for a user.
 * Returns sensible defaults if no model exists yet.
 */
export async function getCognitiveModelSnapshot(userId: number): Promise<CognitiveModelSnapshot> {
  const [cogModel] = await db
    .select()
    .from(digitalTwinCognitiveModel)
    .where(eq(digitalTwinCognitiveModel.userId, userId))
    .limit(1);

  const [vocab] = await db
    .select()
    .from(digitalTwinVocabulary)
    .where(eq(digitalTwinVocabulary.userId, userId))
    .limit(1);

  return {
    communicationStyle: (cogModel?.communicationStyle as any) ?? {
      formality: 0.7,
      verbosity: 0.5,
      humor: 0.3,
      useEmoji: false,
    },
    riskTolerance: parseFloat(cogModel?.riskTolerance ?? "0.5"),
    decisionHeuristics: (cogModel?.decisionHeuristics as string[]) ?? [],
    strategicPriorities: (cogModel?.strategicPriorities as { priority: string; weight: number }[]) ?? [],
    values: (cogModel?.values as string[]) ?? [],
    vocabulary: {
      preferredTerms: (vocab?.preferredTerms as Record<string, string>) ?? {},
      avoidedTerms: (vocab?.avoidedTerms as string[]) ?? [],
      commonPhrases: (vocab?.commonPhrases as string[]) ?? [],
    },
    calibrationScore: cogModel?.calibrationScore ?? 0,
  };
}

/**
 * Assembles a Digital Twin personality injection string for LLM system prompts.
 * This is called before every LLM interaction to personalise the agent's behaviour.
 */
export async function assembleDTPersonalityInjection(userId: number): Promise<string> {
  const model = await getCognitiveModelSnapshot(userId);

  const parts: string[] = [];

  // Communication style
  const { formality, verbosity, humor, useEmoji } = model.communicationStyle;
  const formalityDesc = formality > 0.7 ? "formal" : formality > 0.4 ? "semi-formal" : "casual";
  const verbosityDesc = verbosity > 0.7 ? "detailed and thorough" : verbosity > 0.4 ? "balanced" : "concise and direct";
  const humorDesc = humor > 0.6 ? "occasionally use light humour where appropriate" : "maintain a professional tone without humour";
  const emojiNote = useEmoji ? "You may use emojis sparingly for emphasis." : "Do not use emojis.";

  parts.push(
    `Communication Style: Your responses must be ${formalityDesc} (formality: ${formality.toFixed(1)}) and ${verbosityDesc} (verbosity: ${verbosity.toFixed(1)}). ${humorDesc.charAt(0).toUpperCase() + humorDesc.slice(1)}. ${emojiNote}`
  );

  // Risk tolerance
  const riskDesc = model.riskTolerance > 0.7 ? "high risk tolerance — willing to explore bold, unconventional approaches" :
    model.riskTolerance > 0.4 ? "moderate risk tolerance — balance innovation with prudence" :
    "low risk tolerance — prioritise safe, well-validated approaches";
  parts.push(`Risk Profile: The user has ${riskDesc} (${model.riskTolerance.toFixed(2)}).`);

  // Values
  if (model.values.length > 0) {
    parts.push(`Core Values: The user's core values are: ${model.values.join(", ")}. Frame all recommendations with these values in mind.`);
  }

  // Strategic priorities
  if (model.strategicPriorities.length > 0) {
    const topPriorities = model.strategicPriorities
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3)
      .map(p => `'${p.priority}' (weight: ${p.weight.toFixed(2)})`)
      .join(", ");
    parts.push(`Strategic Priorities: The user's current top priorities are: ${topPriorities}. Ensure your response is aligned with these.`);
  }

  // Decision heuristics
  if (model.decisionHeuristics.length > 0) {
    parts.push(`Decision Style: The user typically ${model.decisionHeuristics.join(", ").replace(/_/g, " ")}.`);
  }

  // Vocabulary preferences
  const { preferredTerms, avoidedTerms } = model.vocabulary;
  const termSubstitutions = Object.entries(preferredTerms);
  if (termSubstitutions.length > 0) {
    const termList = termSubstitutions.map(([old, preferred]) => `instead of '${old}' use '${preferred}'`).join("; ");
    parts.push(`Vocabulary: ${termList}.`);
  }
  if (avoidedTerms.length > 0) {
    parts.push(`Avoid these terms entirely: ${avoidedTerms.join(", ")}.`);
  }

  // Calibration note
  if (model.calibrationScore < 30) {
    parts.push(`Note: The Digital Twin model is still being calibrated (${model.calibrationScore}% complete). Apply these preferences as guidelines, not strict rules.`);
  }

  if (parts.length === 0) {
    return "";
  }

  return `\n\n--- Digital Twin Personalisation ---\n${parts.join("\n")}\n--- End Personalisation ---`;
}

/**
 * Assembles a full system prompt for an AI agent, injecting Digital Twin
 * personalisation on top of the agent's base system prompt.
 */
export async function assembleAgentSystemPrompt(
  userId: number,
  baseSystemPrompt: string
): Promise<string> {
  const injection = await assembleDTPersonalityInjection(userId);
  return baseSystemPrompt + injection;
}

/**
 * Updates the cognitive model from questionnaire responses.
 * Called after the Digital Twin questionnaire is completed.
 */
export async function updateCognitiveModelFromQuestionnaire(
  userId: number,
  responses: {
    riskTolerance?: number;
    values?: string[];
    communicationFormality?: number;
    communicationVerbosity?: number;
    decisionHeuristics?: string[];
    strategicPriorities?: { priority: string; weight: number }[];
  }
): Promise<void> {
  const existing = await db
    .select()
    .from(digitalTwinCognitiveModel)
    .where(eq(digitalTwinCognitiveModel.userId, userId))
    .limit(1);

  const currentStyle = (existing[0]?.communicationStyle as any) ?? {
    formality: 0.7,
    verbosity: 0.5,
    humor: 0.3,
    useEmoji: false,
  };

  const updatedStyle = {
    ...currentStyle,
    ...(responses.communicationFormality !== undefined && {
      formality: responses.communicationFormality / 10,
    }),
    ...(responses.communicationVerbosity !== undefined && {
      verbosity: responses.communicationVerbosity / 10,
    }),
  };

  const updateData: any = {
    communicationStyle: updatedStyle,
    updatedAt: new Date(),
  };

  if (responses.riskTolerance !== undefined) {
    updateData.riskTolerance = (responses.riskTolerance / 10).toFixed(2);
  }
  if (responses.values) {
    updateData.values = responses.values;
  }
  if (responses.decisionHeuristics) {
    updateData.decisionHeuristics = responses.decisionHeuristics;
  }
  if (responses.strategicPriorities) {
    updateData.strategicPriorities = responses.strategicPriorities;
  }

  // Increment calibration score
  const newCalibrationScore = Math.min(
    100,
    (existing[0]?.calibrationScore ?? 0) + 20
  );
  updateData.calibrationScore = newCalibrationScore;
  updateData.lastCalibratedAt = new Date();
  updateData.dataSourcesUsed = [
    ...((existing[0]?.dataSourcesUsed as string[]) ?? []),
    "questionnaire",
  ].filter((v, i, a) => a.indexOf(v) === i);

  if (existing.length === 0) {
    await db.insert(digitalTwinCognitiveModel).values({
      userId,
      ...updateData,
    });
  } else {
    await db
      .update(digitalTwinCognitiveModel)
      .set(updateData)
      .where(eq(digitalTwinCognitiveModel.userId, userId));
  }
}
