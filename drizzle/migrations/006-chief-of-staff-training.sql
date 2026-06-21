-- Phase 6: Chief of Staff Training System
-- This migration adds comprehensive training and learning capabilities for the Chief of Staff

-- Chief of Staff Training Sessions - tracks all training interactions
CREATE TABLE IF NOT EXISTS "cos_training_sessions" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "session_type" VARCHAR(100) NOT NULL, -- 'decision_review', 'scenario_training', 'feedback_analysis', 'skill_building'
  "topic" VARCHAR(255) NOT NULL,
  "duration_seconds" INTEGER,
  "completion_status" VARCHAR(50) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned'
  "effectiveness_score" INTEGER, -- 1-10, how effective was the training
  "decisions_reviewed" INTEGER DEFAULT 0,
  "insights_generated" INTEGER DEFAULT 0,
  "notes" TEXT,
  "metadata" JSONB,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "completed_at" TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS "cos_training_sessions_user_id_idx" ON "cos_training_sessions" ("user_id");
CREATE INDEX IF NOT EXISTS "cos_training_sessions_type_idx" ON "cos_training_sessions" ("session_type");
CREATE INDEX IF NOT EXISTS "cos_training_sessions_created_at_idx" ON "cos_training_sessions" ("created_at");
CREATE INDEX IF NOT EXISTS "cos_training_sessions_user_created_idx" ON "cos_training_sessions" ("user_id", "created_at");

-- Chief of Staff Decision Tracking - enhanced decision logging with outcomes
CREATE TABLE IF NOT EXISTS "cos_decision_tracking" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "training_session_id" INTEGER, -- Link to training session if applicable
  "decision_type" VARCHAR(100) NOT NULL, -- 'strategic', 'operational', 'tactical', 'delegation', 'prioritization'
  "decision_context" TEXT NOT NULL,
  "decision_made" TEXT NOT NULL,
  "reasoning" TEXT NOT NULL,
  "confidence_level" REAL, -- 0-1, Chief of Staff's confidence in the decision
  "alternatives_considered" JSONB, -- Array of alternative options
  "factors_analyzed" JSONB, -- Key factors that influenced the decision
  "expected_outcome" TEXT,
  "actual_outcome" TEXT,
  "outcome_rating" INTEGER, -- 1-5, how well did the decision work out
  "outcome_notes" TEXT,
  "lessons_learned" TEXT,
  "would_decide_differently" BOOLEAN,
  "improvement_areas" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "outcome_recorded_at" TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "cos_decision_tracking_user_id_idx" ON "cos_decision_tracking" ("user_id");
CREATE INDEX IF NOT EXISTS "cos_decision_tracking_type_idx" ON "cos_decision_tracking" ("decision_type");
CREATE INDEX IF NOT EXISTS "cos_decision_tracking_session_idx" ON "cos_decision_tracking" ("training_session_id");
CREATE INDEX IF NOT EXISTS "cos_decision_tracking_created_at_idx" ON "cos_decision_tracking" ("created_at");
CREATE INDEX IF NOT EXISTS "cos_decision_tracking_outcome_idx" ON "cos_decision_tracking" ("outcome_rating");

-- Chief of Staff Knowledge Base - structured knowledge for decision-making
CREATE TABLE IF NOT EXISTS "cos_knowledge_base" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "knowledge_category" VARCHAR(100) NOT NULL, -- 'best_practice', 'pattern', 'principle', 'heuristic', 'lesson'
  "domain" VARCHAR(100) NOT NULL, -- 'strategy', 'operations', 'leadership', 'communication', etc.
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT NOT NULL,
  "applicability" TEXT, -- When/where this knowledge applies
  "confidence" REAL DEFAULT 0.5, -- 0-1, confidence in this knowledge
  "source" VARCHAR(100) NOT NULL, -- 'training', 'decision_outcome', 'user_feedback', 'expert_input'
  "source_reference" TEXT, -- Reference to the source (e.g., decision_id, session_id)
  "validation_count" INTEGER DEFAULT 0, -- How many times this has been validated
  "application_count" INTEGER DEFAULT 0, -- How many times this has been applied
  "success_rate" REAL, -- Success rate when applied (0-1)
  "last_applied_at" TIMESTAMP,
  "last_validated_at" TIMESTAMP,
  "metadata" JSONB,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS "cos_knowledge_base_user_id_idx" ON "cos_knowledge_base" ("user_id");
CREATE INDEX IF NOT EXISTS "cos_knowledge_base_category_idx" ON "cos_knowledge_base" ("knowledge_category");
CREATE INDEX IF NOT EXISTS "cos_knowledge_base_domain_idx" ON "cos_knowledge_base" ("domain");
CREATE INDEX IF NOT EXISTS "cos_knowledge_base_confidence_idx" ON "cos_knowledge_base" ("confidence");
CREATE INDEX IF NOT EXISTS "cos_knowledge_base_success_idx" ON "cos_knowledge_base" ("success_rate");

-- Chief of Staff Learning Feedback - feedback on recommendations and performance
CREATE TABLE IF NOT EXISTS "cos_learning_feedback" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "feedback_type" VARCHAR(100) NOT NULL, -- 'recommendation_quality', 'decision_support', 'communication', 'timing'
  "context" TEXT NOT NULL,
  "feedback_content" TEXT NOT NULL,
  "rating" INTEGER, -- 1-5, user's rating
  "severity" VARCHAR(50), -- 'minor', 'moderate', 'major', 'critical'
  "related_decision_id" INTEGER, -- Link to decision if applicable
  "related_knowledge_id" INTEGER, -- Link to knowledge entry if applicable
  "action_taken" TEXT, -- What action was taken based on this feedback
  "improvement_implemented" BOOLEAN DEFAULT false,
  "metadata" JSONB,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "processed_at" TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "cos_learning_feedback_user_id_idx" ON "cos_learning_feedback" ("user_id");
CREATE INDEX IF NOT EXISTS "cos_learning_feedback_type_idx" ON "cos_learning_feedback" ("feedback_type");
CREATE INDEX IF NOT EXISTS "cos_learning_feedback_rating_idx" ON "cos_learning_feedback" ("rating");
CREATE INDEX IF NOT EXISTS "cos_learning_feedback_created_at_idx" ON "cos_learning_feedback" ("created_at");

-- Chief of Staff Skill Progress - tracks improvement in specific skills
CREATE TABLE IF NOT EXISTS "cos_skill_progress" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "skill_name" VARCHAR(100) NOT NULL, -- 'strategic_thinking', 'prioritization', 'communication', etc.
  "previous_score" INTEGER NOT NULL, -- 0-100
  "new_score" INTEGER NOT NULL, -- 0-100
  "improvement_reason" TEXT,
  "evidence" TEXT, -- What evidence supports this improvement
  "training_session_id" INTEGER, -- Link to training session that caused improvement
  "decision_id" INTEGER, -- Link to decision that demonstrated improvement
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS "cos_skill_progress_user_id_idx" ON "cos_skill_progress" ("user_id");
CREATE INDEX IF NOT EXISTS "cos_skill_progress_skill_idx" ON "cos_skill_progress" ("skill_name");
CREATE INDEX IF NOT EXISTS "cos_skill_progress_created_at_idx" ON "cos_skill_progress" ("created_at");
CREATE INDEX IF NOT EXISTS "cos_skill_progress_user_skill_idx" ON "cos_skill_progress" ("user_id", "skill_name");

-- Chief of Staff Training Scenarios - predefined training scenarios
CREATE TABLE IF NOT EXISTS "cos_training_scenarios" (
  "id" SERIAL PRIMARY KEY,
  "scenario_name" VARCHAR(255) NOT NULL UNIQUE,
  "scenario_type" VARCHAR(100) NOT NULL, -- 'decision_making', 'crisis_management', 'prioritization', 'delegation'
  "difficulty_level" INTEGER, -- 1-10
  "description" TEXT NOT NULL,
  "scenario_data" JSONB NOT NULL, -- Structured scenario content
  "learning_objectives" JSONB, -- Array of learning objectives
  "success_criteria" JSONB, -- How to evaluate success
  "estimated_duration_minutes" INTEGER,
  "prerequisites" JSONB, -- Array of prerequisite scenario IDs
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS "cos_training_scenarios_type_idx" ON "cos_training_scenarios" ("scenario_type");
CREATE INDEX IF NOT EXISTS "cos_training_scenarios_difficulty_idx" ON "cos_training_scenarios" ("difficulty_level");
CREATE INDEX IF NOT EXISTS "cos_training_scenarios_active_idx" ON "cos_training_scenarios" ("is_active");

-- Chief of Staff Scenario Completions - tracks scenario completion
CREATE TABLE IF NOT EXISTS "cos_scenario_completions" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "scenario_id" INTEGER NOT NULL,
  "training_session_id" INTEGER,
  "completion_status" VARCHAR(50) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'failed'
  "score" INTEGER, -- 0-100, performance on the scenario
  "time_spent_minutes" INTEGER,
  "decisions_made" INTEGER,
  "quality_score" INTEGER, -- 1-10, quality of decisions made
  "feedback" TEXT,
  "notes" TEXT,
  "started_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "completed_at" TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "cos_scenario_completions_user_id_idx" ON "cos_scenario_completions" ("user_id");
CREATE INDEX IF NOT EXISTS "cos_scenario_completions_scenario_id_idx" ON "cos_scenario_completions" ("scenario_id");
CREATE INDEX IF NOT EXISTS "cos_scenario_completions_status_idx" ON "cos_scenario_completions" ("completion_status");
CREATE INDEX IF NOT EXISTS "cos_scenario_completions_user_scenario_idx" ON "cos_scenario_completions" ("user_id", "scenario_id");

-- Chief of Staff Performance Metrics - aggregate performance tracking
CREATE TABLE IF NOT EXISTS "cos_performance_metrics" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "metric_date" DATE NOT NULL,
  "decisions_made" INTEGER DEFAULT 0,
  "avg_decision_quality" REAL, -- Average outcome rating
  "avg_confidence" REAL, -- Average confidence level
  "knowledge_entries_added" INTEGER DEFAULT 0,
  "training_sessions_completed" INTEGER DEFAULT 0,
  "scenarios_completed" INTEGER DEFAULT 0,
  "feedback_received" INTEGER DEFAULT 0,
  "avg_feedback_rating" REAL,
  "skills_improved" INTEGER DEFAULT 0,
  "metadata" JSONB,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS "cos_performance_metrics_user_id_idx" ON "cos_performance_metrics" ("user_id");
CREATE INDEX IF NOT EXISTS "cos_performance_metrics_date_idx" ON "cos_performance_metrics" ("metric_date");
CREATE INDEX IF NOT EXISTS "cos_performance_metrics_user_date_idx" ON "cos_performance_metrics" ("user_id", "metric_date");

-- Comments
COMMENT ON TABLE "cos_training_sessions" IS 'Tracks all training interactions for Chief of Staff';
COMMENT ON TABLE "cos_decision_tracking" IS 'Enhanced decision logging with outcomes and lessons learned';
COMMENT ON TABLE "cos_knowledge_base" IS 'Structured knowledge base for Chief of Staff decision-making';
COMMENT ON TABLE "cos_learning_feedback" IS 'User feedback on Chief of Staff performance';
COMMENT ON TABLE "cos_skill_progress" IS 'Tracks improvement in Chief of Staff skills over time';
COMMENT ON TABLE "cos_training_scenarios" IS 'Predefined training scenarios for skill development';
COMMENT ON TABLE "cos_scenario_completions" IS 'Tracks completion of training scenarios';
COMMENT ON TABLE "cos_performance_metrics" IS 'Aggregate performance metrics for Chief of Staff';
