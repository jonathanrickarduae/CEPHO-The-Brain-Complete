-- Database Optimization Migration
-- Phase 15: Performance improvements and index optimizations

-- Add composite indexes for common query patterns
-- These indexes improve query performance for frequently accessed data patterns

-- Innovation Hub workflow queries
CREATE INDEX IF NOT EXISTS "ihw_ideas_source_status_idx" ON "ihw_ideas" ("source_type", "status");
CREATE INDEX IF NOT EXISTS "ihw_ideas_created_at_desc_idx" ON "ihw_ideas" ("created_at" DESC);
CREATE INDEX IF NOT EXISTS "ihw_conversions_created_at_desc_idx" ON "ihw_conversions" ("created_at" DESC);

-- Digital Twin training queries
CREATE INDEX IF NOT EXISTS "dt_sessions_user_created_idx" ON "dt_training_sessions" ("user_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "dt_interactions_session_created_idx" ON "dt_training_interactions" ("session_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "dt_knowledge_confidence_idx" ON "dt_knowledge_entries" ("confidence_score" DESC) WHERE "is_validated" = true;
CREATE INDEX IF NOT EXISTS "dt_feedback_severity_idx" ON "dt_learning_feedback" ("severity", "created_at" DESC);

-- Chief of Staff training queries
CREATE INDEX IF NOT EXISTS "cos_sessions_user_created_idx" ON "cos_training_sessions" ("user_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "cos_decisions_user_created_idx" ON "cos_decision_tracking" ("user_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "cos_knowledge_success_idx" ON "cos_knowledge_base" ("success_rate" DESC) WHERE "is_active" = true;
CREATE INDEX IF NOT EXISTS "cos_feedback_severity_idx" ON "cos_learning_feedback" ("severity", "created_at" DESC);

-- User and authentication queries
CREATE INDEX IF NOT EXISTS "users_email_lower_idx" ON "users" (LOWER("email"));
CREATE INDEX IF NOT EXISTS "users_created_at_desc_idx" ON "users" ("createdAt" DESC);

-- Project queries
CREATE INDEX IF NOT EXISTS "projects_user_status_idx" ON "projects" ("userId", "status");
CREATE INDEX IF NOT EXISTS "projects_created_at_desc_idx" ON "projects" ("createdAt" DESC);

-- Expert consultation queries
CREATE INDEX IF NOT EXISTS "expert_consultations_user_created_idx" ON "expert_consultations" ("user_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "expert_consultations_expert_created_idx" ON "expert_consultations" ("expert_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "expert_consultations_rating_idx" ON "expert_consultations" ("rating" DESC) WHERE "rating" IS NOT NULL;

-- Mood tracking queries
CREATE INDEX IF NOT EXISTS "mood_entries_user_time_idx" ON "mood_entries" ("userId", "timeOfDay", "createdAt" DESC);

-- Conversation queries
CREATE INDEX IF NOT EXISTS "conversations_user_created_idx" ON "conversations" ("userId", "createdAt" DESC);

-- Task queries
CREATE INDEX IF NOT EXISTS "tasks_user_status_idx" ON "tasks" ("userId", "status");
CREATE INDEX IF NOT EXISTS "tasks_user_priority_idx" ON "tasks" ("userId", "priority" DESC);
CREATE INDEX IF NOT EXISTS "tasks_due_date_idx" ON "tasks" ("dueDate") WHERE "dueDate" IS NOT NULL;

-- Inbox queries
CREATE INDEX IF NOT EXISTS "inbox_items_user_status_idx" ON "inbox_items" ("userId", "status");
CREATE INDEX IF NOT EXISTS "inbox_items_user_priority_idx" ON "inbox_items" ("userId", "priority" DESC);

-- Audit log queries
CREATE INDEX IF NOT EXISTS "audit_log_user_created_idx" ON "audit_log" ("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "audit_log_action_created_idx" ON "audit_log" ("action", "createdAt" DESC);

-- Voice notes queries
CREATE INDEX IF NOT EXISTS "voice_notes_user_created_idx" ON "voice_notes" ("userId", "createdAt" DESC);

-- Expert memory queries
CREATE INDEX IF NOT EXISTS "expert_memories_expert_created_idx" ON "expert_memories" ("expertId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "expert_memories_importance_idx" ON "expert_memories" ("importanceScore" DESC);

-- Expert insights queries
CREATE INDEX IF NOT EXISTS "expert_insights_expert_created_idx" ON "expert_insights" ("expertId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "expert_insights_usage_idx" ON "expert_insights" ("usageCount" DESC);

-- Expert research tasks queries
CREATE INDEX IF NOT EXISTS "expert_research_tasks_expert_status_idx" ON "expert_research_tasks" ("expertId", "status");
CREATE INDEX IF NOT EXISTS "expert_research_tasks_priority_idx" ON "expert_research_tasks" ("priority" DESC, "createdAt" DESC);

-- SME team queries
CREATE INDEX IF NOT EXISTS "sme_teams_user_created_idx" ON "sme_teams" ("userId", "createdAt" DESC);

-- QA workflow queries
CREATE INDEX IF NOT EXISTS "task_qa_reviews_task_status_idx" ON "task_qa_reviews" ("taskId", "status");
CREATE INDEX IF NOT EXISTS "task_qa_reviews_reviewer_created_idx" ON "task_qa_reviews" ("reviewerId", "createdAt" DESC);

-- SME feedback queries
CREATE INDEX IF NOT EXISTS "sme_feedback_task_created_idx" ON "sme_feedback" ("taskId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "sme_feedback_sme_created_idx" ON "sme_feedback" ("smeId", "createdAt" DESC);

-- Library documents queries
CREATE INDEX IF NOT EXISTS "library_documents_user_type_idx" ON "library_documents" ("userId", "documentType");
CREATE INDEX IF NOT EXISTS "library_documents_created_at_desc_idx" ON "library_documents" ("createdAt" DESC);

-- Business plan review queries
CREATE INDEX IF NOT EXISTS "business_plan_review_versions_user_created_idx" ON "business_plan_review_versions" ("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "business_plan_review_versions_project_version_idx" ON "business_plan_review_versions" ("projectId", "versionNumber" DESC);

-- Collaborative review queries
CREATE INDEX IF NOT EXISTS "collaborative_review_sessions_owner_created_idx" ON "collaborative_review_sessions" ("ownerId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "collaborative_review_comments_session_created_idx" ON "collaborative_review_comments" ("sessionId", "createdAt" DESC);

-- Evening review queries
CREATE INDEX IF NOT EXISTS "evening_review_sessions_user_created_idx" ON "evening_review_sessions" ("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "signal_items_user_status_idx" ON "signal_items" ("userId", "status");
CREATE INDEX IF NOT EXISTS "signal_items_priority_idx" ON "signal_items" ("priority" DESC, "createdAt" DESC);

-- Add ANALYZE to update statistics for query planner
ANALYZE;

-- Comments for documentation
COMMENT ON INDEX "ihw_ideas_source_status_idx" IS 'Optimizes filtering ideas by source type and status';
COMMENT ON INDEX "dt_sessions_user_created_idx" IS 'Optimizes fetching user training sessions chronologically';
COMMENT ON INDEX "cos_knowledge_success_idx" IS 'Optimizes finding high-success active knowledge entries';
COMMENT ON INDEX "users_email_lower_idx" IS 'Case-insensitive email lookups for authentication';
COMMENT ON INDEX "tasks_due_date_idx" IS 'Optimizes due date queries for task management';
COMMENT ON INDEX "expert_insights_usage_idx" IS 'Optimizes finding most-used expert insights';
