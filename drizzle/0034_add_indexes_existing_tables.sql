-- Add Performance Indexes for Existing Tables Only
-- Priority 2 - DB-02: Add Missing Indexes

-- Projects table indexes
CREATE INDEX IF NOT EXISTS projects_user_id_idx ON projects(user_id);
CREATE INDEX IF NOT EXISTS projects_status_idx ON projects(status);
CREATE INDEX IF NOT EXISTS projects_created_at_idx ON projects(created_at);
CREATE INDEX IF NOT EXISTS projects_user_status_idx ON projects(user_id, status);

-- Library documents indexes
CREATE INDEX IF NOT EXISTS library_documents_user_id_idx ON library_documents(user_id);
CREATE INDEX IF NOT EXISTS library_documents_type_idx ON library_documents(type);
CREATE INDEX IF NOT EXISTS library_documents_created_at_idx ON library_documents(created_at);
CREATE INDEX IF NOT EXISTS library_documents_user_type_idx ON library_documents(user_id, type);

-- Generated documents indexes
CREATE INDEX IF NOT EXISTS generated_documents_user_id_idx ON generated_documents("userId");
CREATE INDEX IF NOT EXISTS generated_documents_type_idx ON generated_documents(type);
CREATE INDEX IF NOT EXISTS generated_documents_qa_status_idx ON generated_documents("qaStatus");
CREATE INDEX IF NOT EXISTS generated_documents_created_at_idx ON generated_documents("createdAt");
CREATE INDEX IF NOT EXISTS generated_documents_user_type_idx ON generated_documents("userId", type);

-- Training documents indexes
CREATE INDEX IF NOT EXISTS training_documents_user_id_idx ON training_documents(user_id);
CREATE INDEX IF NOT EXISTS training_documents_created_at_idx ON training_documents(created_at);

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

-- Vault access log indexes
CREATE INDEX IF NOT EXISTS vault_access_log_user_id_idx ON vault_access_log(user_id);
CREATE INDEX IF NOT EXISTS vault_access_log_created_at_idx ON vault_access_log(created_at);

-- AI agents indexes
CREATE INDEX IF NOT EXISTS ai_agents_user_id_idx ON ai_agents(user_id);
CREATE INDEX IF NOT EXISTS ai_agents_status_idx ON ai_agents(status);
CREATE INDEX IF NOT EXISTS ai_agents_created_at_idx ON ai_agents(created_at);

-- Agent tasks indexes
CREATE INDEX IF NOT EXISTS agent_tasks_agent_id_idx ON agent_tasks(agent_id);
CREATE INDEX IF NOT EXISTS agent_tasks_status_idx ON agent_tasks(status);
CREATE INDEX IF NOT EXISTS agent_tasks_due_date_idx ON agent_tasks(due_date);

-- Agent daily reports indexes
CREATE INDEX IF NOT EXISTS agent_daily_reports_agent_id_idx ON agent_daily_reports(agent_id);
CREATE INDEX IF NOT EXISTS agent_daily_reports_date_idx ON agent_daily_reports(date);

-- Project Genesis indexes
CREATE INDEX IF NOT EXISTS project_genesis_user_id_idx ON project_genesis(user_id);
CREATE INDEX IF NOT EXISTS project_genesis_status_idx ON project_genesis(status);
CREATE INDEX IF NOT EXISTS project_genesis_created_at_idx ON project_genesis(created_at);

-- Workflows indexes
CREATE INDEX IF NOT EXISTS workflows_user_id_idx ON workflows(user_id);
CREATE INDEX IF NOT EXISTS workflows_status_idx ON workflows(status);
CREATE INDEX IF NOT EXISTS workflows_created_at_idx ON workflows(created_at);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON tasks(user_id);
CREATE INDEX IF NOT EXISTS tasks_status_idx ON tasks(status);
CREATE INDEX IF NOT EXISTS tasks_due_date_idx ON tasks(due_date);
CREATE INDEX IF NOT EXISTS tasks_user_status_idx ON tasks(user_id, status);

-- Email accounts indexes
CREATE INDEX IF NOT EXISTS email_accounts_user_id_idx ON email_accounts(user_id);
CREATE INDEX IF NOT EXISTS email_accounts_email_idx ON email_accounts(email);

-- Emails indexes
CREATE INDEX IF NOT EXISTS emails_account_id_idx ON emails(account_id);
CREATE INDEX IF NOT EXISTS emails_thread_id_idx ON emails(thread_id);
CREATE INDEX IF NOT EXISTS emails_received_at_idx ON emails(received_at);

-- QMS documents indexes
CREATE INDEX IF NOT EXISTS qms_documents_user_id_idx ON qms_documents(user_id);
CREATE INDEX IF NOT EXISTS qms_documents_status_idx ON qms_documents(status);
CREATE INDEX IF NOT EXISTS qms_documents_created_at_idx ON qms_documents(created_at);

-- Trading signals indexes
CREATE INDEX IF NOT EXISTS trading_signals_user_id_idx ON trading_signals(user_id);
CREATE INDEX IF NOT EXISTS trading_signals_symbol_idx ON trading_signals(symbol);
CREATE INDEX IF NOT EXISTS trading_signals_created_at_idx ON trading_signals(created_at);

-- Dashboard metrics indexes
CREATE INDEX IF NOT EXISTS dashboard_metrics_user_id_idx ON dashboard_metrics(user_id);
CREATE INDEX IF NOT EXISTS dashboard_metrics_date_idx ON dashboard_metrics(date);
CREATE INDEX IF NOT EXISTS dashboard_metrics_user_date_idx ON dashboard_metrics(user_id, date);
