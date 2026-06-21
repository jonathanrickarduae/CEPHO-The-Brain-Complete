-- Critical Database Indexes Migration
-- Adds indexes to the 15 most frequently queried tables

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Mood History indexes
CREATE INDEX IF NOT EXISTS idx_mood_history_user_id ON mood_history(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_history_created_at ON mood_history(created_at);
CREATE INDEX IF NOT EXISTS idx_mood_history_user_created ON mood_history(user_id, created_at DESC);

-- Expert Chat Sessions indexes
CREATE INDEX IF NOT EXISTS idx_expert_chat_sessions_user_id ON expert_chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_expert_chat_sessions_expert_id ON expert_chat_sessions(expert_id);
CREATE INDEX IF NOT EXISTS idx_expert_chat_sessions_status ON expert_chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_expert_chat_sessions_created_at ON expert_chat_sessions(created_at);

-- Expert Chat Messages indexes
CREATE INDEX IF NOT EXISTS idx_expert_chat_messages_session_id ON expert_chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_expert_chat_messages_created_at ON expert_chat_messages(created_at);

-- Expert Conversations indexes
CREATE INDEX IF NOT EXISTS idx_expert_conversations_user_id ON expert_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_expert_conversations_expert_id ON expert_conversations(expert_id);
CREATE INDEX IF NOT EXISTS idx_expert_conversations_created_at ON expert_conversations(created_at);

-- Expert Consultations indexes
CREATE INDEX IF NOT EXISTS idx_expert_consultations_user_id ON expert_consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_expert_consultations_expert_id ON expert_consultations(expert_id);
CREATE INDEX IF NOT EXISTS idx_expert_consultations_status ON expert_consultations(status);

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_priority ON projects(priority);
CREATE INDEX IF NOT EXISTS idx_projects_due_date ON projects(due_date);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);

-- Business Plan Reviews indexes
CREATE INDEX IF NOT EXISTS idx_business_plan_reviews_user_id ON business_plan_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_business_plan_reviews_plan_id ON business_plan_reviews(plan_id);
CREATE INDEX IF NOT EXISTS idx_business_plan_reviews_version ON business_plan_reviews(version);
CREATE INDEX IF NOT EXISTS idx_business_plan_reviews_created_at ON business_plan_reviews(created_at);

-- Documents indexes
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_is_public ON documents(is_public);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);

-- Document Tags indexes (for full-text search)
CREATE INDEX IF NOT EXISTS idx_document_tags_document_id ON document_tags(document_id);
CREATE INDEX IF NOT EXISTS idx_document_tags_tag ON document_tags(tag);

-- Sessions indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Analytics Events indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_mood_history_user_time ON mood_history(user_id, time_of_day, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_expert_chat_sessions_user_expert ON expert_chat_sessions(user_id, expert_id, status);
CREATE INDEX IF NOT EXISTS idx_projects_user_status ON projects(user_id, status, priority);
CREATE INDEX IF NOT EXISTS idx_documents_user_category ON documents(user_id, category, is_public);
