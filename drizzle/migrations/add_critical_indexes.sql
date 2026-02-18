-- Add Critical Indexes for Performance
-- Based on common query patterns in repositories

-- Expert Chat Sessions (queried by userId frequently)
CREATE INDEX IF NOT EXISTS expert_chat_sessions_user_id_idx ON "expertChatSessions" (user_id);
CREATE INDEX IF NOT EXISTS expert_chat_sessions_created_at_idx ON "expertChatSessions" (created_at);
CREATE INDEX IF NOT EXISTS expert_chat_sessions_user_created_idx ON "expertChatSessions" (user_id, created_at);

-- Expert Chat Messages (queried by sessionId frequently)
CREATE INDEX IF NOT EXISTS expert_chat_messages_session_id_idx ON "expertChatMessages" (session_id);

-- Expert Consultations (queried by userId frequently)
CREATE INDEX IF NOT EXISTS expert_consultations_user_id_idx ON "expertConsultations" (user_id);
CREATE INDEX IF NOT EXISTS expert_consultations_created_at_idx ON "expertConsultations" (created_at);

-- Business Plan Review Versions (queried by userId frequently)
CREATE INDEX IF NOT EXISTS business_plan_review_versions_user_id_idx ON "businessPlanReviewVersions" (user_id);
CREATE INDEX IF NOT EXISTS business_plan_review_versions_created_at_idx ON "businessPlanReviewVersions" (created_at);

-- Library Documents (queried by userId, category, fileType frequently)
CREATE INDEX IF NOT EXISTS library_documents_user_id_idx ON "libraryDocuments" (user_id);
CREATE INDEX IF NOT EXISTS library_documents_category_idx ON "libraryDocuments" (category);
CREATE INDEX IF NOT EXISTS library_documents_file_type_idx ON "libraryDocuments" (file_type);
CREATE INDEX IF NOT EXISTS library_documents_user_category_idx ON "libraryDocuments" (user_id, category);

-- Revenue Metrics Snapshots (queried by userId frequently)
CREATE INDEX IF NOT EXISTS revenue_metrics_snapshots_user_id_idx ON "revenueMetricsSnapshots" (user_id);
CREATE INDEX IF NOT EXISTS revenue_metrics_snapshots_created_at_idx ON "revenueMetricsSnapshots" (created_at);

-- Quality Metrics Snapshots (queried by userId frequently)
CREATE INDEX IF NOT EXISTS quality_metrics_snapshots_user_id_idx ON "qualityMetricsSnapshots" (user_id);
CREATE INDEX IF NOT EXISTS quality_metrics_snapshots_created_at_idx ON "qualityMetricsSnapshots" (created_at);

-- COS Learning Metrics (queried by userId frequently)
CREATE INDEX IF NOT EXISTS cos_learning_metrics_user_id_idx ON "cosLearningMetrics" (user_id);
CREATE INDEX IF NOT EXISTS cos_learning_metrics_created_at_idx ON "cosLearningMetrics" (created_at);

-- Projects (queried by userId, status frequently)
CREATE INDEX IF NOT EXISTS projects_user_id_idx ON "projects" (user_id);
CREATE INDEX IF NOT EXISTS projects_status_idx ON "projects" (status);
CREATE INDEX IF NOT EXISTS projects_user_status_idx ON "projects" (user_id, status);
CREATE INDEX IF NOT EXISTS projects_created_at_idx ON "projects" (created_at);

-- Expert Memory (queried by expertId, userId frequently)
CREATE INDEX IF NOT EXISTS expert_memory_expert_id_idx ON "expertMemory" (expert_id);
CREATE INDEX IF NOT EXISTS expert_memory_user_id_idx ON "expertMemory" (user_id);
CREATE INDEX IF NOT EXISTS expert_memory_expert_user_idx ON "expertMemory" (expert_id, user_id);

-- Composite indexes for common join patterns
CREATE INDEX IF NOT EXISTS expert_consultations_user_expert_idx ON "expertConsultations" (user_id, expert_id);
CREATE INDEX IF NOT EXISTS expert_chat_sessions_user_expert_idx ON "expertChatSessions" (user_id, expert_id);
