-- Phase 5: Digital Twin Training System
-- This migration adds comprehensive training and learning capabilities for the Digital Twin

-- Training Sessions - tracks all training interactions
CREATE TABLE IF NOT EXISTS "training_sessions" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "digital_twin_id" INTEGER NOT NULL,
  "session_type" VARCHAR(100) NOT NULL, -- 'onboarding', 'skill_building', 'decision_review', 'feedback'
  "topic" VARCHAR(255) NOT NULL,
  "duration_seconds" INTEGER,
  "completion_status" VARCHAR(50) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned'
  "effectiveness_score" INTEGER, -- 1-10, how effective was the training
  "notes" TEXT,
  "metadata" JSONB,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "completed_at" TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS "training_sessions_user_id_idx" ON "training_sessions" ("user_id");
CREATE INDEX IF NOT EXISTS "training_sessions_digital_twin_id_idx" ON "training_sessions" ("digital_twin_id");
CREATE INDEX IF NOT EXISTS "training_sessions_session_type_idx" ON "training_sessions" ("session_type");
CREATE INDEX IF NOT EXISTS "training_sessions_created_at_idx" ON "training_sessions" ("created_at");
CREATE INDEX IF NOT EXISTS "training_sessions_user_created_idx" ON "training_sessions" ("user_id", "created_at");

-- Training Interactions - detailed log of all training exchanges
CREATE TABLE IF NOT EXISTS "training_interactions" (
  "id" SERIAL PRIMARY KEY,
  "session_id" INTEGER NOT NULL,
  "user_id" INTEGER NOT NULL,
  "interaction_type" VARCHAR(100) NOT NULL, -- 'question', 'answer', 'feedback', 'correction', 'example'
  "content" TEXT NOT NULL,
  "context" TEXT, -- Additional context about the interaction
  "confidence_score" REAL, -- 0-1, Digital Twin's confidence in its response
  "user_satisfaction" INTEGER, -- 1-5, user's satisfaction with the interaction
  "learning_value" INTEGER, -- 1-10, how valuable was this for learning
  "metadata" JSONB,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS "training_interactions_session_id_idx" ON "training_interactions" ("session_id");
CREATE INDEX IF NOT EXISTS "training_interactions_user_id_idx" ON "training_interactions" ("user_id");
CREATE INDEX IF NOT EXISTS "training_interactions_type_idx" ON "training_interactions" ("interaction_type");
CREATE INDEX IF NOT EXISTS "training_interactions_created_at_idx" ON "training_interactions" ("created_at");

-- Knowledge Entries - structured knowledge accumulated by the Digital Twin
CREATE TABLE IF NOT EXISTS "knowledge_entries" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "digital_twin_id" INTEGER NOT NULL,
  "knowledge_type" VARCHAR(100) NOT NULL, -- 'preference', 'skill', 'pattern', 'fact', 'relationship'
  "category" VARCHAR(100) NOT NULL, -- 'communication', 'decision_making', 'work_style', 'goals', etc.
  "key" VARCHAR(255) NOT NULL, -- Unique identifier for this knowledge
  "value" TEXT NOT NULL, -- The actual knowledge content
  "confidence" REAL DEFAULT 0.5, -- 0-1, confidence in this knowledge
  "source" VARCHAR(100) NOT NULL, -- 'training', 'observation', 'explicit', 'inferred'
  "source_reference" TEXT, -- Reference to the source (e.g., session_id, interaction_id)
  "validation_count" INTEGER DEFAULT 0, -- How many times this has been validated
  "contradiction_count" INTEGER DEFAULT 0, -- How many times this has been contradicted
  "last_validated_at" TIMESTAMP,
  "metadata" JSONB,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS "knowledge_entries_user_id_idx" ON "knowledge_entries" ("user_id");
CREATE INDEX IF NOT EXISTS "knowledge_entries_digital_twin_id_idx" ON "knowledge_entries" ("digital_twin_id");
CREATE INDEX IF NOT EXISTS "knowledge_entries_type_idx" ON "knowledge_entries" ("knowledge_type");
CREATE INDEX IF NOT EXISTS "knowledge_entries_category_idx" ON "knowledge_entries" ("category");
CREATE INDEX IF NOT EXISTS "knowledge_entries_key_idx" ON "knowledge_entries" ("key");
CREATE INDEX IF NOT EXISTS "knowledge_entries_confidence_idx" ON "knowledge_entries" ("confidence");
CREATE INDEX IF NOT EXISTS "knowledge_entries_user_key_idx" ON "knowledge_entries" ("user_id", "key");

-- Learning Feedback - tracks feedback on Digital Twin's performance
CREATE TABLE IF NOT EXISTS "learning_feedback" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "digital_twin_id" INTEGER NOT NULL,
  "feedback_type" VARCHAR(100) NOT NULL, -- 'correction', 'validation', 'suggestion', 'praise', 'criticism'
  "context" TEXT NOT NULL, -- What was the Digital Twin doing
  "feedback_content" TEXT NOT NULL, -- The actual feedback
  "severity" VARCHAR(50), -- 'minor', 'moderate', 'major', 'critical'
  "action_taken" TEXT, -- What action was taken based on this feedback
  "related_knowledge_id" INTEGER, -- Link to knowledge entry if applicable
  "related_session_id" INTEGER, -- Link to training session if applicable
  "metadata" JSONB,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "processed_at" TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "learning_feedback_user_id_idx" ON "learning_feedback" ("user_id");
CREATE INDEX IF NOT EXISTS "learning_feedback_digital_twin_id_idx" ON "learning_feedback" ("digital_twin_id");
CREATE INDEX IF NOT EXISTS "learning_feedback_type_idx" ON "learning_feedback" ("feedback_type");
CREATE INDEX IF NOT EXISTS "learning_feedback_severity_idx" ON "learning_feedback" ("severity");
CREATE INDEX IF NOT EXISTS "learning_feedback_created_at_idx" ON "learning_feedback" ("created_at");

-- Competency Progress - tracks improvement in specific competencies over time
CREATE TABLE IF NOT EXISTS "competency_progress" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "digital_twin_id" INTEGER NOT NULL,
  "competency_name" VARCHAR(100) NOT NULL, -- matches competency fields in digital_twins table
  "previous_score" INTEGER NOT NULL, -- 0-100
  "new_score" INTEGER NOT NULL, -- 0-100
  "improvement_reason" TEXT, -- Why did the score change
  "evidence" TEXT, -- What evidence supports this change
  "training_session_id" INTEGER, -- Link to training session that caused improvement
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS "competency_progress_user_id_idx" ON "competency_progress" ("user_id");
CREATE INDEX IF NOT EXISTS "competency_progress_digital_twin_id_idx" ON "competency_progress" ("digital_twin_id");
CREATE INDEX IF NOT EXISTS "competency_progress_competency_idx" ON "competency_progress" ("competency_name");
CREATE INDEX IF NOT EXISTS "competency_progress_created_at_idx" ON "competency_progress" ("created_at");
CREATE INDEX IF NOT EXISTS "competency_progress_user_competency_idx" ON "competency_progress" ("user_id", "competency_name");

-- Training Modules - structured training content for the Digital Twin
CREATE TABLE IF NOT EXISTS "training_modules" (
  "id" SERIAL PRIMARY KEY,
  "module_name" VARCHAR(255) NOT NULL UNIQUE,
  "module_type" VARCHAR(100) NOT NULL, -- 'core', 'advanced', 'specialized'
  "competency_focus" VARCHAR(100) NOT NULL, -- Which competency this module improves
  "description" TEXT NOT NULL,
  "content" JSONB NOT NULL, -- Structured training content
  "prerequisites" JSONB, -- Array of prerequisite module IDs
  "estimated_duration_minutes" INTEGER,
  "difficulty_level" INTEGER, -- 1-10
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS "training_modules_type_idx" ON "training_modules" ("module_type");
CREATE INDEX IF NOT EXISTS "training_modules_competency_idx" ON "training_modules" ("competency_focus");
CREATE INDEX IF NOT EXISTS "training_modules_active_idx" ON "training_modules" ("is_active");

-- Module Completions - tracks which modules have been completed
CREATE TABLE IF NOT EXISTS "module_completions" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "digital_twin_id" INTEGER NOT NULL,
  "module_id" INTEGER NOT NULL,
  "training_session_id" INTEGER,
  "completion_status" VARCHAR(50) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'failed'
  "score" INTEGER, -- 0-100, performance on the module
  "time_spent_minutes" INTEGER,
  "attempts" INTEGER DEFAULT 1,
  "notes" TEXT,
  "started_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "completed_at" TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "module_completions_user_id_idx" ON "module_completions" ("user_id");
CREATE INDEX IF NOT EXISTS "module_completions_digital_twin_id_idx" ON "module_completions" ("digital_twin_id");
CREATE INDEX IF NOT EXISTS "module_completions_module_id_idx" ON "module_completions" ("module_id");
CREATE INDEX IF NOT EXISTS "module_completions_status_idx" ON "module_completions" ("completion_status");
CREATE INDEX IF NOT EXISTS "module_completions_user_module_idx" ON "module_completions" ("user_id", "module_id");

-- Comments
COMMENT ON TABLE "training_sessions" IS 'Tracks all training interactions with the Digital Twin';
COMMENT ON TABLE "training_interactions" IS 'Detailed log of all exchanges during training sessions';
COMMENT ON TABLE "knowledge_entries" IS 'Structured knowledge accumulated by the Digital Twin about the user';
COMMENT ON TABLE "learning_feedback" IS 'User feedback on Digital Twin performance for continuous improvement';
COMMENT ON TABLE "competency_progress" IS 'Tracks improvement in specific competencies over time';
COMMENT ON TABLE "training_modules" IS 'Structured training content for Digital Twin skill development';
COMMENT ON TABLE "module_completions" IS 'Tracks completion of training modules by Digital Twins';
