/**
 * Chief of Staff Learning System Schema
 * 
 * Tracks COS training progress, interaction patterns, and learned preferences
 * to continuously improve personalization and response quality.
 */

import { mysqlTable, int, varchar, text, timestamp, boolean, json, mysqlEnum } from "drizzle-orm/mysql-core";
import { users } from "./schema";

// =============================================================================
// COS TRAINING PROGRESS
// =============================================================================

/**
 * Tracks overall training progress for each user's Chief of Staff
 */
export const cosTrainingProgress = mysqlTable("cos_training_progress", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull().references(() => users.id),
  
  // Training metrics
  totalInteractions: int("total_interactions").default(0),
  correctPredictions: int("correct_predictions").default(0),
  userCorrections: int("user_corrections").default(0),
  
  // Learning milestones
  communicationStyleLearned: boolean("communication_style_learned").default(false),
  priorityPatternsLearned: boolean("priority_patterns_learned").default(false),
  workingHoursLearned: boolean("working_hours_learned").default(false),
  decisionPatternsLearned: boolean("decision_patterns_learned").default(false),
  
  // Confidence scores (0-100)
  overallConfidence: int("overall_confidence").default(0),
  taskPredictionConfidence: int("task_prediction_confidence").default(0),
  communicationConfidence: int("communication_confidence").default(0),
  prioritizationConfidence: int("prioritization_confidence").default(0),
  
  // Training level
  trainingLevel: mysqlEnum("training_level", ["novice", "learning", "proficient", "expert", "master"]).default("novice"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// =============================================================================
// INTERACTION LOGGING
// =============================================================================

/**
 * Logs every interaction for pattern analysis
 */
export const cosInteractionLog = mysqlTable("cos_interaction_log", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull().references(() => users.id),
  
  // Interaction details
  interactionType: mysqlEnum("interaction_type", [
    "question",
    "command",
    "feedback",
    "correction",
    "approval",
    "rejection",
    "clarification_request",
    "preference_update"
  ]).notNull(),
  
  // Content
  userInput: text("user_input"),
  cosResponse: text("cos_response"),
  
  // Context
  context: varchar("context", { length: 100 }), // e.g., "morning_signal", "task_review", "document_generation"
  relatedEntityType: varchar("related_entity_type", { length: 50 }), // e.g., "task", "document", "project"
  relatedEntityId: varchar("related_entity_id", { length: 100 }),
  
  // Outcome
  wasHelpful: boolean("was_helpful"),
  userSatisfaction: int("user_satisfaction"), // 1-5 rating if provided
  requiredClarification: boolean("required_clarification").default(false),
  wasCorrection: boolean("was_correction").default(false),
  
  // Timing
  responseTimeMs: int("response_time_ms"),
  
  // Metadata
  metadata: json("metadata"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// =============================================================================
// USER PREFERENCES MODEL
// =============================================================================

/**
 * Stores learned user preferences and working style
 */
export const cosUserPreferences = mysqlTable("cos_user_preferences", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull().references(() => users.id),
  
  // Communication preferences
  preferredTone: mysqlEnum("preferred_tone", ["formal", "professional", "casual", "direct"]).default("professional"),
  preferredLength: mysqlEnum("preferred_length", ["brief", "moderate", "detailed"]).default("moderate"),
  preferredFormat: mysqlEnum("preferred_format", ["bullet_points", "paragraphs", "mixed"]).default("mixed"),
  
  // Working style
  workingHoursStart: varchar("working_hours_start", { length: 10 }), // e.g., "09:00"
  workingHoursEnd: varchar("working_hours_end", { length: 10 }), // e.g., "18:00"
  preferredMeetingTimes: json("preferred_meeting_times"), // Array of time slots
  focusTimePreferences: json("focus_time_preferences"), // When user prefers deep work
  
  // Priority patterns
  priorityWeights: json("priority_weights"), // How user weighs different factors
  urgencyThresholds: json("urgency_thresholds"), // What triggers "urgent" classification
  
  // Decision patterns
  riskTolerance: mysqlEnum("risk_tolerance", ["conservative", "moderate", "aggressive"]).default("moderate"),
  decisionSpeed: mysqlEnum("decision_speed", ["deliberate", "balanced", "quick"]).default("balanced"),
  delegationStyle: mysqlEnum("delegation_style", ["hands_on", "balanced", "hands_off"]).default("balanced"),
  
  // Content preferences
  reportDetailLevel: mysqlEnum("report_detail_level", ["executive_summary", "standard", "comprehensive"]).default("standard"),
  dataVisualizationPreference: mysqlEnum("data_viz_preference", ["minimal", "moderate", "rich"]).default("moderate"),
  
  // Learned patterns (JSON for flexibility)
  learnedPatterns: json("learned_patterns"),
  
  // Confidence in each preference (0-100)
  confidenceScores: json("confidence_scores"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// =============================================================================
// LESSONS LEARNED REPOSITORY
// =============================================================================

/**
 * Stores specific lessons learned from interactions
 */
export const cosLessonsLearned = mysqlTable("cos_lessons_learned", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull().references(() => users.id),
  
  // Lesson details
  lessonType: mysqlEnum("lesson_type", [
    "preference",
    "correction",
    "pattern",
    "exception",
    "context_rule",
    "communication_style"
  ]).notNull(),
  
  // What was learned
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  
  // The trigger and response
  triggerPattern: text("trigger_pattern"), // What situation triggers this lesson
  learnedBehavior: text("learned_behavior"), // How COS should respond
  
  // Context
  category: varchar("category", { length: 50 }), // e.g., "tasks", "communication", "scheduling"
  tags: json("tags"), // Searchable tags
  
  // Validation
  timesApplied: int("times_applied").default(0),
  timesSuccessful: int("times_successful").default(0),
  lastApplied: timestamp("last_applied"),
  
  // Status
  isActive: boolean("is_active").default(true),
  confidence: int("confidence").default(50), // 0-100
  
  // Source interaction
  sourceInteractionId: int("source_interaction_id").references(() => cosInteractionLog.id),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// =============================================================================
// PATTERN ANALYSIS
// =============================================================================

/**
 * Stores identified patterns from user behavior
 */
export const cosPatternAnalysis = mysqlTable("cos_pattern_analysis", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull().references(() => users.id),
  
  // Pattern identification
  patternType: mysqlEnum("pattern_type", [
    "time_based",
    "context_based",
    "content_based",
    "decision_based",
    "communication_based"
  ]).notNull(),
  
  patternName: varchar("pattern_name", { length: 200 }).notNull(),
  patternDescription: text("pattern_description"),
  
  // Pattern data
  patternData: json("pattern_data"), // Structured pattern information
  
  // Frequency and confidence
  occurrences: int("occurrences").default(1),
  confidence: int("confidence").default(50), // 0-100
  
  // When pattern applies
  applicableContexts: json("applicable_contexts"),
  
  // Status
  isValidated: boolean("is_validated").default(false),
  validatedAt: timestamp("validated_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// =============================================================================
// APPROVAL CHECK LOG
// =============================================================================

/**
 * Logs "Would user approve this?" checks and outcomes
 */
export const cosApprovalCheckLog = mysqlTable("cos_approval_check_log", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull().references(() => users.id),
  
  // The proposed action
  proposedAction: text("proposed_action").notNull(),
  actionType: varchar("action_type", { length: 50 }).notNull(),
  
  // COS prediction
  predictedApproval: boolean("predicted_approval").notNull(),
  predictionConfidence: int("prediction_confidence").notNull(), // 0-100
  predictionReasoning: text("prediction_reasoning"),
  
  // Actual outcome
  actualApproval: boolean("actual_approval"),
  userFeedback: text("user_feedback"),
  
  // Learning
  predictionCorrect: boolean("prediction_correct"),
  lessonExtracted: text("lesson_extracted"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// =============================================================================
// IMPROVEMENT TRACKING
// =============================================================================

/**
 * Tracks COS self-improvement actions
 */
export const cosImprovementLog = mysqlTable("cos_improvement_log", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull().references(() => users.id),
  
  // Improvement details
  improvementType: mysqlEnum("improvement_type", [
    "prompt_refinement",
    "pattern_update",
    "preference_adjustment",
    "behavior_correction",
    "knowledge_expansion"
  ]).notNull(),
  
  description: text("description").notNull(),
  
  // Before and after
  previousBehavior: text("previous_behavior"),
  newBehavior: text("new_behavior"),
  
  // Trigger
  triggeredBy: varchar("triggered_by", { length: 50 }), // e.g., "user_feedback", "pattern_analysis", "self_review"
  sourceInteractionId: int("source_interaction_id").references(() => cosInteractionLog.id),
  
  // Impact
  expectedImpact: text("expected_impact"),
  actualImpact: text("actual_impact"),
  impactScore: int("impact_score"), // -100 to 100
  
  createdAt: timestamp("created_at").defaultNow(),
});

export type CosTrainingProgress = typeof cosTrainingProgress.$inferSelect;
export type CosInteractionLog = typeof cosInteractionLog.$inferSelect;
export type CosUserPreferences = typeof cosUserPreferences.$inferSelect;
export type CosLessonsLearned = typeof cosLessonsLearned.$inferSelect;
export type CosPatternAnalysis = typeof cosPatternAnalysis.$inferSelect;
export type CosApprovalCheckLog = typeof cosApprovalCheckLog.$inferSelect;
export type CosImprovementLog = typeof cosImprovementLog.$inferSelect;
