/**
 * Model Router — P2-2
 *
 * Centralised model selection utility for all AI calls in CEPHO.
 *
 * Strategy:
 * - PRIMARY:  gpt-4.1-mini  (fast, cost-efficient, good for most tasks)
 * - ADVANCED: gpt-4.1       (for complex reasoning, document generation, scoring)
 * - NANO:     gpt-4.1-nano  (for simple classification, short completions)
 *
 * Usage:
 *   import { getModel, ModelTier } from "../utils/modelRouter";
 *   const model = getModel("advanced"); // "gpt-4.1"
 */

export type ModelTier = "nano" | "standard" | "advanced";

/** Map of tier → model name */
const MODEL_MAP: Record<ModelTier, string> = {
  nano: "gpt-4.1-nano",
  standard: "gpt-4.1-mini",
  advanced: "gpt-4.1-mini", // gpt-4.1 when available; mini is the current best available
};

/**
 * Returns the appropriate model name for a given tier.
 * Falls back to standard if the tier is unknown.
 */
export function getModel(tier: ModelTier = "standard"): string {
  return MODEL_MAP[tier] ?? MODEL_MAP.standard;
}

/**
 * Task-based model selection — maps common task types to appropriate tiers.
 */
export type TaskType =
  | "chat" // Real-time expert chat
  | "score" // AI scoring (innovation, tasks)
  | "generate" // Document / brief generation
  | "summarise" // Meeting / content summarisation
  | "classify" // Short classification tasks
  | "embed" // Embedding generation (always uses text-embedding-3-small)
  | "analyse" // Deep analysis (Digital Twin, evening review)
  | "voice"; // Voice command transcription

const TASK_TIER_MAP: Record<TaskType, ModelTier> = {
  chat: "standard",
  score: "advanced",
  generate: "advanced",
  summarise: "standard",
  classify: "nano",
  embed: "standard", // Not used for chat completions
  analyse: "advanced",
  voice: "nano",
};

/**
 * Returns the model name appropriate for a given task type.
 */
export function getModelForTask(task: TaskType): string {
  const tier = TASK_TIER_MAP[task] ?? "standard";
  return getModel(tier);
}

/**
 * Returns the embedding model (always fixed).
 */
export function getEmbeddingModel(): string {
  return "text-embedding-3-small";
}

/**
 * Default max tokens per tier.
 */
export const DEFAULT_MAX_TOKENS: Record<ModelTier, number> = {
  nano: 512,
  standard: 1024,
  advanced: 2048,
};

export function getMaxTokens(tier: ModelTier = "standard"): number {
  return DEFAULT_MAX_TOKENS[tier];
}
