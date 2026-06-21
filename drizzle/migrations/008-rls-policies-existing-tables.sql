-- Row Level Security (RLS) Policies Migration
-- Implements comprehensive security policies for EXISTING tables only

-- ============================================================================
-- ENABLE RLS ON EXISTING TABLES
-- ============================================================================

-- Core tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Project Genesis tables
ALTER TABLE project_genesis ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_genesis_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_genesis_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_genesis_deliverables ENABLE ROW LEVEL SECURITY;

-- AI Agent tables
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_approval_requests ENABLE ROW LEVEL SECURITY;

-- Chief of Staff tables
ALTER TABLE chief_of_staff_actions ENABLE ROW LEVEL SECURITY;

-- QMS tables
ALTER TABLE qms_processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE qms_process_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE qms_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE qms_quality_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE qms_audit_log ENABLE ROW LEVEL SECURITY;

-- QA tables
ALTER TABLE qa_checklist_items ENABLE ROW LEVEL SECURITY;

-- CEPHO Workflow tables
ALTER TABLE cepho_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE cepho_workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE cepho_workflow_validations ENABLE ROW LEVEL SECURITY;

-- Financial tables
ALTER TABLE financial_model_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_model_formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE valuation_multiples ENABLE ROW LEVEL SECURITY;
ALTER TABLE industry_benchmarks ENABLE ROW LEVEL SECURITY;

-- Trading tables
ALTER TABLE trading_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_workflow_logs ENABLE ROW LEVEL SECURITY;

-- Integration tables
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_logs ENABLE ROW LEVEL SECURITY;

-- Other tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sme_escalation_triggers ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Users can only see their own profile
CREATE POLICY "users_select_own" ON users
  FOR SELECT
  USING (auth.uid()::text = id::text);

-- Users can update their own profile
CREATE POLICY "users_update_own" ON users
  FOR UPDATE
  USING (auth.uid()::text = id::text);

-- ============================================================================
-- PROJECTS TABLE POLICIES
-- ============================================================================

-- Users can view their own projects
CREATE POLICY "projects_select_own" ON projects
  FOR SELECT
  USING ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- Users can insert their own projects
CREATE POLICY "projects_insert_own" ON projects
  FOR INSERT
  WITH CHECK ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- Users can update their own projects
CREATE POLICY "projects_update_own" ON projects
  FOR UPDATE
  USING ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- Users can delete their own projects
CREATE POLICY "projects_delete_own" ON projects
  FOR DELETE
  USING ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- TASKS TABLE POLICIES
-- ============================================================================

CREATE POLICY "tasks_select_own" ON tasks
  FOR SELECT
  USING ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "tasks_insert_own" ON tasks
  FOR INSERT
  WITH CHECK ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "tasks_update_own" ON tasks
  FOR UPDATE
  USING ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "tasks_delete_own" ON tasks
  FOR DELETE
  USING ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- LIBRARY DOCUMENTS TABLE POLICIES (FIX FOR BLANK/TOO MUCH DATA)
-- ============================================================================

-- Users can view their own library documents
CREATE POLICY "library_documents_select_own" ON library_documents
  FOR SELECT
  USING ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- Users can insert their own library documents
CREATE POLICY "library_documents_insert_own" ON library_documents
  FOR INSERT
  WITH CHECK ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- Users can update their own library documents
CREATE POLICY "library_documents_update_own" ON library_documents
  FOR UPDATE
  USING ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- Users can delete their own library documents
CREATE POLICY "library_documents_delete_own" ON library_documents
  FOR DELETE
  USING ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- LIBRARY ITEMS TABLE POLICIES
-- ============================================================================

CREATE POLICY "library_items_select_own" ON library_items
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "library_items_insert_own" ON library_items
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "library_items_update_own" ON library_items
  FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "library_items_delete_own" ON library_items
  FOR DELETE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- LIBRARY CATEGORIES TABLE POLICIES
-- ============================================================================

CREATE POLICY "library_categories_select_own" ON library_categories
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "library_categories_insert_own" ON library_categories
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "library_categories_update_own" ON library_categories
  FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "library_categories_delete_own" ON library_categories
  FOR DELETE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- LIBRARY FAVORITES TABLE POLICIES
-- ============================================================================

CREATE POLICY "library_favorites_select_own" ON library_favorites
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "library_favorites_insert_own" ON library_favorites
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "library_favorites_delete_own" ON library_favorites
  FOR DELETE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- LIBRARY VERSIONS TABLE POLICIES
-- ============================================================================

CREATE POLICY "library_versions_select_own" ON library_versions
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "library_versions_insert_own" ON library_versions
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- LIBRARY PERMISSIONS TABLE POLICIES
-- ============================================================================

CREATE POLICY "library_permissions_select_own" ON library_permissions
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text) 
    OR shared_with_user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "library_permissions_insert_own" ON library_permissions
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "library_permissions_update_own" ON library_permissions
  FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "library_permissions_delete_own" ON library_permissions
  FOR DELETE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- CONVERSATIONS TABLE POLICIES
-- ============================================================================

CREATE POLICY "conversations_select_own" ON conversations
  FOR SELECT
  USING ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "conversations_insert_own" ON conversations
  FOR INSERT
  WITH CHECK ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "conversations_delete_own" ON conversations
  FOR DELETE
  USING ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- NOTIFICATIONS TABLE POLICIES
-- ============================================================================

CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "notifications_insert_own" ON notifications
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "notifications_delete_own" ON notifications
  FOR DELETE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- USER NOTIFICATIONS TABLE POLICIES
-- ============================================================================

CREATE POLICY "user_notifications_select_own" ON user_notifications
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "user_notifications_insert_own" ON user_notifications
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "user_notifications_update_own" ON user_notifications
  FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "user_notifications_delete_own" ON user_notifications
  FOR DELETE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- USER SETTINGS TABLE POLICIES
-- ============================================================================

CREATE POLICY "user_settings_select_own" ON user_settings
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "user_settings_insert_own" ON user_settings
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "user_settings_update_own" ON user_settings
  FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- PROJECT GENESIS TABLE POLICIES
-- ============================================================================

CREATE POLICY "project_genesis_select_own" ON project_genesis
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "project_genesis_insert_own" ON project_genesis
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "project_genesis_update_own" ON project_genesis
  FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "project_genesis_delete_own" ON project_genesis
  FOR DELETE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- PROJECT GENESIS PHASES TABLE POLICIES
-- ============================================================================

CREATE POLICY "project_genesis_phases_select_own" ON project_genesis_phases
  FOR SELECT
  USING (project_genesis_id IN (SELECT id FROM project_genesis WHERE user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text)));

CREATE POLICY "project_genesis_phases_insert_own" ON project_genesis_phases
  FOR INSERT
  WITH CHECK (project_genesis_id IN (SELECT id FROM project_genesis WHERE user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text)));

CREATE POLICY "project_genesis_phases_update_own" ON project_genesis_phases
  FOR UPDATE
  USING (project_genesis_id IN (SELECT id FROM project_genesis WHERE user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text)));

CREATE POLICY "project_genesis_phases_delete_own" ON project_genesis_phases
  FOR DELETE
  USING (project_genesis_id IN (SELECT id FROM project_genesis WHERE user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text)));

-- ============================================================================
-- PROJECT GENESIS MILESTONES TABLE POLICIES
-- ============================================================================

CREATE POLICY "project_genesis_milestones_select_own" ON project_genesis_milestones
  FOR SELECT
  USING (project_genesis_id IN (SELECT id FROM project_genesis WHERE user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text)));

CREATE POLICY "project_genesis_milestones_insert_own" ON project_genesis_milestones
  FOR INSERT
  WITH CHECK (project_genesis_id IN (SELECT id FROM project_genesis WHERE user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text)));

CREATE POLICY "project_genesis_milestones_update_own" ON project_genesis_milestones
  FOR UPDATE
  USING (project_genesis_id IN (SELECT id FROM project_genesis WHERE user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text)));

CREATE POLICY "project_genesis_milestones_delete_own" ON project_genesis_milestones
  FOR DELETE
  USING (project_genesis_id IN (SELECT id FROM project_genesis WHERE user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text)));

-- ============================================================================
-- PROJECT GENESIS DELIVERABLES TABLE POLICIES
-- ============================================================================

CREATE POLICY "project_genesis_deliverables_select_own" ON project_genesis_deliverables
  FOR SELECT
  USING (project_genesis_id IN (SELECT id FROM project_genesis WHERE user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text)));

CREATE POLICY "project_genesis_deliverables_insert_own" ON project_genesis_deliverables
  FOR INSERT
  WITH CHECK (project_genesis_id IN (SELECT id FROM project_genesis WHERE user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text)));

CREATE POLICY "project_genesis_deliverables_update_own" ON project_genesis_deliverables
  FOR UPDATE
  USING (project_genesis_id IN (SELECT id FROM project_genesis WHERE user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text)));

CREATE POLICY "project_genesis_deliverables_delete_own" ON project_genesis_deliverables
  FOR DELETE
  USING (project_genesis_id IN (SELECT id FROM project_genesis WHERE user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text)));

-- ============================================================================
-- AI AGENTS TABLE POLICIES (GLOBAL READ ACCESS)
-- ============================================================================

-- All authenticated users can read AI agents
CREATE POLICY "ai_agents_select_all" ON ai_agents
  FOR SELECT
  USING (true);

-- ============================================================================
-- AGENT CAPABILITIES TABLE POLICIES (GLOBAL READ ACCESS)
-- ============================================================================

CREATE POLICY "agent_capabilities_select_all" ON agent_capabilities
  FOR SELECT
  USING (true);

-- ============================================================================
-- AGENT TASKS TABLE POLICIES
-- ============================================================================

CREATE POLICY "agent_tasks_select_own" ON agent_tasks
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "agent_tasks_insert_own" ON agent_tasks
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "agent_tasks_update_own" ON agent_tasks
  FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- AGENT DAILY REPORTS TABLE POLICIES
-- ============================================================================

CREATE POLICY "agent_daily_reports_select_own" ON agent_daily_reports
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "agent_daily_reports_insert_own" ON agent_daily_reports
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- AGENT APPROVAL REQUESTS TABLE POLICIES
-- ============================================================================

CREATE POLICY "agent_approval_requests_select_own" ON agent_approval_requests
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "agent_approval_requests_insert_own" ON agent_approval_requests
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "agent_approval_requests_update_own" ON agent_approval_requests
  FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- CHIEF OF STAFF ACTIONS TABLE POLICIES
-- ============================================================================

CREATE POLICY "chief_of_staff_actions_select_own" ON chief_of_staff_actions
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "chief_of_staff_actions_insert_own" ON chief_of_staff_actions
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "chief_of_staff_actions_update_own" ON chief_of_staff_actions
  FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- QMS PROCESSES TABLE POLICIES
-- ============================================================================

CREATE POLICY "qms_processes_select_own" ON qms_processes
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "qms_processes_insert_own" ON qms_processes
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "qms_processes_update_own" ON qms_processes
  FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "qms_processes_delete_own" ON qms_processes
  FOR DELETE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- QMS PROCESS STEPS TABLE POLICIES
-- ============================================================================

CREATE POLICY "qms_process_steps_select_own" ON qms_process_steps
  FOR SELECT
  USING (process_id IN (SELECT id FROM qms_processes WHERE user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text)));

CREATE POLICY "qms_process_steps_insert_own" ON qms_process_steps
  FOR INSERT
  WITH CHECK (process_id IN (SELECT id FROM qms_processes WHERE user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text)));

CREATE POLICY "qms_process_steps_update_own" ON qms_process_steps
  FOR UPDATE
  USING (process_id IN (SELECT id FROM qms_processes WHERE user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text)));

CREATE POLICY "qms_process_steps_delete_own" ON qms_process_steps
  FOR DELETE
  USING (process_id IN (SELECT id FROM qms_processes WHERE user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text)));

-- ============================================================================
-- QMS DOCUMENTS TABLE POLICIES
-- ============================================================================

CREATE POLICY "qms_documents_select_own" ON qms_documents
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "qms_documents_insert_own" ON qms_documents
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "qms_documents_update_own" ON qms_documents
  FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "qms_documents_delete_own" ON qms_documents
  FOR DELETE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- QMS QUALITY REVIEWS TABLE POLICIES
-- ============================================================================

CREATE POLICY "qms_quality_reviews_select_own" ON qms_quality_reviews
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "qms_quality_reviews_insert_own" ON qms_quality_reviews
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "qms_quality_reviews_update_own" ON qms_quality_reviews
  FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- QMS AUDIT LOG TABLE POLICIES
-- ============================================================================

CREATE POLICY "qms_audit_log_select_own" ON qms_audit_log
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "qms_audit_log_insert_own" ON qms_audit_log
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- QA CHECKLIST ITEMS TABLE POLICIES
-- ============================================================================

CREATE POLICY "qa_checklist_items_select_own" ON qa_checklist_items
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "qa_checklist_items_insert_own" ON qa_checklist_items
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "qa_checklist_items_update_own" ON qa_checklist_items
  FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "qa_checklist_items_delete_own" ON qa_checklist_items
  FOR DELETE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- CEPHO WORKFLOWS TABLE POLICIES
-- ============================================================================

CREATE POLICY "cepho_workflows_select_own" ON cepho_workflows
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "cepho_workflows_insert_own" ON cepho_workflows
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "cepho_workflows_update_own" ON cepho_workflows
  FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "cepho_workflows_delete_own" ON cepho_workflows
  FOR DELETE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- CEPHO WORKFLOW STEPS TABLE POLICIES
-- ============================================================================

CREATE POLICY "cepho_workflow_steps_select_own" ON cepho_workflow_steps
  FOR SELECT
  USING (workflow_id IN (SELECT id FROM cepho_workflows WHERE user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text)));

CREATE POLICY "cepho_workflow_steps_insert_own" ON cepho_workflow_steps
  FOR INSERT
  WITH CHECK (workflow_id IN (SELECT id FROM cepho_workflows WHERE user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text)));

CREATE POLICY "cepho_workflow_steps_update_own" ON cepho_workflow_steps
  FOR UPDATE
  USING (workflow_id IN (SELECT id FROM cepho_workflows WHERE user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text)));

CREATE POLICY "cepho_workflow_steps_delete_own" ON cepho_workflow_steps
  FOR DELETE
  USING (workflow_id IN (SELECT id FROM cepho_workflows WHERE user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text)));

-- ============================================================================
-- CEPHO WORKFLOW VALIDATIONS TABLE POLICIES
-- ============================================================================

CREATE POLICY "cepho_workflow_validations_select_own" ON cepho_workflow_validations
  FOR SELECT
  USING (workflow_id IN (SELECT id FROM cepho_workflows WHERE user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text)));

CREATE POLICY "cepho_workflow_validations_insert_own" ON cepho_workflow_validations
  FOR INSERT
  WITH CHECK (workflow_id IN (SELECT id FROM cepho_workflows WHERE user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text)));

CREATE POLICY "cepho_workflow_validations_update_own" ON cepho_workflow_validations
  FOR UPDATE
  USING (workflow_id IN (SELECT id FROM cepho_workflows WHERE user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text)));

CREATE POLICY "cepho_workflow_validations_delete_own" ON cepho_workflow_validations
  FOR DELETE
  USING (workflow_id IN (SELECT id FROM cepho_workflows WHERE user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text)));

-- ============================================================================
-- FINANCIAL MODEL TEMPLATES TABLE POLICIES (GLOBAL READ ACCESS)
-- ============================================================================

CREATE POLICY "financial_model_templates_select_all" ON financial_model_templates
  FOR SELECT
  USING (true);

-- ============================================================================
-- FINANCIAL MODEL FORMULAS TABLE POLICIES (GLOBAL READ ACCESS)
-- ============================================================================

CREATE POLICY "financial_model_formulas_select_all" ON financial_model_formulas
  FOR SELECT
  USING (true);

-- ============================================================================
-- FINANCIAL WORKFLOW STEPS TABLE POLICIES
-- ============================================================================

CREATE POLICY "financial_workflow_steps_select_own" ON financial_workflow_steps
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "financial_workflow_steps_insert_own" ON financial_workflow_steps
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "financial_workflow_steps_update_own" ON financial_workflow_steps
  FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- VALUATION MULTIPLES TABLE POLICIES (GLOBAL READ ACCESS)
-- ============================================================================

CREATE POLICY "valuation_multiples_select_all" ON valuation_multiples
  FOR SELECT
  USING (true);

-- ============================================================================
-- INDUSTRY BENCHMARKS TABLE POLICIES (GLOBAL READ ACCESS)
-- ============================================================================

CREATE POLICY "industry_benchmarks_select_all" ON industry_benchmarks
  FOR SELECT
  USING (true);

-- ============================================================================
-- TRADING SIGNALS TABLE POLICIES
-- ============================================================================

CREATE POLICY "trading_signals_select_own" ON trading_signals
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "trading_signals_insert_own" ON trading_signals
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "trading_signals_update_own" ON trading_signals
  FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- TRADING POSITIONS TABLE POLICIES
-- ============================================================================

CREATE POLICY "trading_positions_select_own" ON trading_positions
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "trading_positions_insert_own" ON trading_positions
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "trading_positions_update_own" ON trading_positions
  FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- TRADING PERFORMANCE TABLE POLICIES
-- ============================================================================

CREATE POLICY "trading_performance_select_own" ON trading_performance
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "trading_performance_insert_own" ON trading_performance
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- TRADING WORKFLOW LOGS TABLE POLICIES
-- ============================================================================

CREATE POLICY "trading_workflow_logs_select_own" ON trading_workflow_logs
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "trading_workflow_logs_insert_own" ON trading_workflow_logs
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- INTEGRATIONS TABLE POLICIES
-- ============================================================================

CREATE POLICY "integrations_select_own" ON integrations
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "integrations_insert_own" ON integrations
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "integrations_update_own" ON integrations
  FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "integrations_delete_own" ON integrations
  FOR DELETE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- INTEGRATION CREDENTIALS TABLE POLICIES
-- ============================================================================

CREATE POLICY "integration_credentials_select_own" ON integration_credentials
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "integration_credentials_insert_own" ON integration_credentials
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "integration_credentials_update_own" ON integration_credentials
  FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "integration_credentials_delete_own" ON integration_credentials
  FOR DELETE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- INTEGRATION LOGS TABLE POLICIES
-- ============================================================================

CREATE POLICY "integration_logs_select_own" ON integration_logs
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "integration_logs_insert_own" ON integration_logs
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- PRODUCTS TABLE POLICIES
-- ============================================================================

CREATE POLICY "products_select_own" ON products
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "products_insert_own" ON products
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "products_update_own" ON products
  FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "products_delete_own" ON products
  FOR DELETE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- GENERATED DOCUMENTS TABLE POLICIES
-- ============================================================================

CREATE POLICY "generated_documents_select_own" ON generated_documents
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "generated_documents_insert_own" ON generated_documents
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "generated_documents_update_own" ON generated_documents
  FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "generated_documents_delete_own" ON generated_documents
  FOR DELETE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- TRAINING DOCUMENTS TABLE POLICIES
-- ============================================================================

CREATE POLICY "training_documents_select_own" ON training_documents
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "training_documents_insert_own" ON training_documents
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "training_documents_update_own" ON training_documents
  FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "training_documents_delete_own" ON training_documents
  FOR DELETE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- DASHBOARD METRICS TABLE POLICIES
-- ============================================================================

CREATE POLICY "dashboard_metrics_select_own" ON dashboard_metrics
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "dashboard_metrics_insert_own" ON dashboard_metrics
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- AUTOMATION LOGS TABLE POLICIES
-- ============================================================================

CREATE POLICY "automation_logs_select_own" ON automation_logs
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "automation_logs_insert_own" ON automation_logs
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- SME ESCALATION TRIGGERS TABLE POLICIES
-- ============================================================================

CREATE POLICY "sme_escalation_triggers_select_own" ON sme_escalation_triggers
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "sme_escalation_triggers_insert_own" ON sme_escalation_triggers
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "sme_escalation_triggers_update_own" ON sme_escalation_triggers
  FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "sme_escalation_triggers_delete_own" ON sme_escalation_triggers
  FOR DELETE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- COMMENTS AND DOCUMENTATION
-- ============================================================================

COMMENT ON POLICY "library_documents_select_own" ON library_documents IS 'Users can only view their own library documents - fixes blank/too much data issues';
COMMENT ON POLICY "projects_select_own" ON projects IS 'Users can only view their own projects';
COMMENT ON POLICY "tasks_select_own" ON tasks IS 'Users can only view their own tasks';
