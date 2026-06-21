-- Add Performance Indexes for Priority 2
-- Improves query performance for frequently accessed tables

-- Projects table indexes
CREATE INDEX IF NOT EXISTS projects_user_id_idx ON projects(user_id);
CREATE INDEX IF NOT EXISTS projects_status_idx ON projects(status);
CREATE INDEX IF NOT EXISTS projects_created_at_idx ON projects(created_at);
CREATE INDEX IF NOT EXISTS projects_user_status_idx ON projects(user_id, status);

-- Daily brief items indexes
CREATE INDEX IF NOT EXISTS daily_brief_items_user_id_idx ON daily_brief_items(user_id);
CREATE INDEX IF NOT EXISTS daily_brief_items_date_idx ON daily_brief_items(date);
CREATE INDEX IF NOT EXISTS daily_brief_items_user_date_idx ON daily_brief_items(user_id, date);

-- Library documents indexes
CREATE INDEX IF NOT EXISTS library_documents_user_id_idx ON library_documents(user_id);
CREATE INDEX IF NOT EXISTS library_documents_type_idx ON library_documents(type);
CREATE INDEX IF NOT EXISTS library_documents_created_at_idx ON library_documents(created_at);
CREATE INDEX IF NOT EXISTS library_documents_user_type_idx ON library_documents(user_id, type);

-- Generated documents indexes (if table exists)
CREATE INDEX IF NOT EXISTS generated_documents_user_id_idx ON generated_documents(user_id);
CREATE INDEX IF NOT EXISTS generated_documents_type_idx ON generated_documents(type);
CREATE INDEX IF NOT EXISTS generated_documents_qa_status_idx ON generated_documents(qa_status);
CREATE INDEX IF NOT EXISTS generated_documents_created_at_idx ON generated_documents(created_at);
CREATE INDEX IF NOT EXISTS generated_documents_user_type_idx ON generated_documents(user_id, type);

-- Training documents indexes
CREATE INDEX IF NOT EXISTS training_documents_user_id_idx ON training_documents(user_id);
CREATE INDEX IF NOT EXISTS training_documents_created_at_idx ON training_documents(created_at);

-- Memory bank indexes
CREATE INDEX IF NOT EXISTS memory_bank_user_id_idx ON memory_bank(user_id);
CREATE INDEX IF NOT EXISTS memory_bank_type_idx ON memory_bank(type);
CREATE INDEX IF NOT EXISTS memory_bank_created_at_idx ON memory_bank(created_at);
CREATE INDEX IF NOT EXISTS memory_bank_user_type_idx ON memory_bank(user_id, type);

-- Integrations indexes
CREATE INDEX IF NOT EXISTS integrations_user_id_idx ON integrations(user_id);
CREATE INDEX IF NOT EXISTS integrations_type_idx ON integrations(type);
CREATE INDEX IF NOT EXISTS integrations_status_idx ON integrations(status);
CREATE INDEX IF NOT EXISTS integrations_user_type_idx ON integrations(user_id, type);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON notifications(read);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at);
CREATE INDEX IF NOT EXISTS notifications_user_read_idx ON notifications(user_id, read);

-- Audit log indexes
CREATE INDEX IF NOT EXISTS audit_log_user_id_idx ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS audit_log_action_idx ON audit_log(action);
CREATE INDEX IF NOT EXISTS audit_log_created_at_idx ON audit_log(created_at);
CREATE INDEX IF NOT EXISTS audit_log_user_action_idx ON audit_log(user_id, action);

-- Expert performance indexes
CREATE INDEX IF NOT EXISTS expert_performance_expert_id_idx ON expert_performance(expert_id);
CREATE INDEX IF NOT EXISTS expert_performance_created_at_idx ON expert_performance(created_at);

-- Competitors indexes
CREATE INDEX IF NOT EXISTS competitors_user_id_idx ON competitors(user_id);
CREATE INDEX IF NOT EXISTS competitors_created_at_idx ON competitors(created_at);

-- Strategy recommendations indexes
CREATE INDEX IF NOT EXISTS strategy_recommendations_user_id_idx ON strategy_recommendations(user_id);
CREATE INDEX IF NOT EXISTS strategy_recommendations_priority_idx ON strategy_recommendations(priority);
CREATE INDEX IF NOT EXISTS strategy_recommendations_created_at_idx ON strategy_recommendations(created_at);

-- Commercialization tasks indexes
CREATE INDEX IF NOT EXISTS commercialization_tasks_user_id_idx ON commercialization_tasks(user_id);
CREATE INDEX IF NOT EXISTS commercialization_tasks_status_idx ON commercialization_tasks(status);
CREATE INDEX IF NOT EXISTS commercialization_tasks_due_date_idx ON commercialization_tasks(due_date);

-- Vault access log indexes
CREATE INDEX IF NOT EXISTS vault_access_log_user_id_idx ON vault_access_log(user_id);
CREATE INDEX IF NOT EXISTS vault_access_log_created_at_idx ON vault_access_log(created_at);

-- Vault sessions indexes
CREATE INDEX IF NOT EXISTS vault_sessions_user_id_idx ON vault_sessions(user_id);
CREATE INDEX IF NOT EXISTS vault_sessions_expires_at_idx ON vault_sessions(expires_at);

-- Credit transactions indexes
CREATE INDEX IF NOT EXISTS credit_transactions_user_id_idx ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS credit_transactions_type_idx ON credit_transactions(type);
CREATE INDEX IF NOT EXISTS credit_transactions_created_at_idx ON credit_transactions(created_at);
CREATE INDEX IF NOT EXISTS credit_transactions_user_type_idx ON credit_transactions(user_id, type);
