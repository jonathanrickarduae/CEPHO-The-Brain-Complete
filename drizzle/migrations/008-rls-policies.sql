-- Row Level Security (RLS) Policies Migration
-- Implements comprehensive security policies for all tables

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

-- Core tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbox_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Expert system tables
ALTER TABLE expert_consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_research_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sme_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE sme_feedback ENABLE ROW LEVEL SECURITY;

-- Innovation Hub tables
ALTER TABLE ihw_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ihw_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ihw_statistics ENABLE ROW LEVEL SECURITY;

-- Digital Twin Training tables
ALTER TABLE dt_training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dt_training_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dt_knowledge_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE dt_learning_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE dt_competency_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE dt_training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE dt_module_completions ENABLE ROW LEVEL SECURITY;

-- Chief of Staff Training tables
ALTER TABLE cos_training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cos_decision_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE cos_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE cos_learning_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE cos_skill_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE cos_training_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE cos_scenario_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cos_learning_metrics ENABLE ROW LEVEL SECURITY;

-- Business planning tables
ALTER TABLE business_plan_review_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborative_review_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborative_review_comments ENABLE ROW LEVEL SECURITY;

-- Evening review tables
ALTER TABLE evening_review_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE signal_items ENABLE ROW LEVEL SECURITY;

-- QA workflow tables
ALTER TABLE task_qa_reviews ENABLE ROW LEVEL SECURITY;

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
-- MOOD ENTRIES TABLE POLICIES
-- ============================================================================

CREATE POLICY "mood_entries_select_own" ON mood_entries
  FOR SELECT
  USING ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "mood_entries_insert_own" ON mood_entries
  FOR INSERT
  WITH CHECK ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "mood_entries_update_own" ON mood_entries
  FOR UPDATE
  USING ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- INBOX ITEMS TABLE POLICIES
-- ============================================================================

CREATE POLICY "inbox_items_select_own" ON inbox_items
  FOR SELECT
  USING ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "inbox_items_insert_own" ON inbox_items
  FOR INSERT
  WITH CHECK ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "inbox_items_update_own" ON inbox_items
  FOR UPDATE
  USING ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "inbox_items_delete_own" ON inbox_items
  FOR DELETE
  USING ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- VOICE NOTES TABLE POLICIES
-- ============================================================================

CREATE POLICY "voice_notes_select_own" ON voice_notes
  FOR SELECT
  USING ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "voice_notes_insert_own" ON voice_notes
  FOR INSERT
  WITH CHECK ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "voice_notes_delete_own" ON voice_notes
  FOR DELETE
  USING ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- AUDIT LOG TABLE POLICIES
-- ============================================================================

CREATE POLICY "audit_log_select_own" ON audit_log
  FOR SELECT
  USING ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "audit_log_insert_own" ON audit_log
  FOR INSERT
  WITH CHECK ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- EXPERT CONSULTATIONS TABLE POLICIES
-- ============================================================================

CREATE POLICY "expert_consultations_select_own" ON expert_consultations
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "expert_consultations_insert_own" ON expert_consultations
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "expert_consultations_update_own" ON expert_consultations
  FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- EXPERT MEMORIES TABLE POLICIES
-- ============================================================================

CREATE POLICY "expert_memories_select_own" ON expert_memories
  FOR SELECT
  USING ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "expert_memories_insert_own" ON expert_memories
  FOR INSERT
  WITH CHECK ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "expert_memories_update_own" ON expert_memories
  FOR UPDATE
  USING ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- EXPERT INSIGHTS TABLE POLICIES
-- ============================================================================

CREATE POLICY "expert_insights_select_own" ON expert_insights
  FOR SELECT
  USING ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "expert_insights_insert_own" ON expert_insights
  FOR INSERT
  WITH CHECK ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "expert_insights_update_own" ON expert_insights
  FOR UPDATE
  USING ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- EXPERT RESEARCH TASKS TABLE POLICIES
-- ============================================================================

CREATE POLICY "expert_research_tasks_select_own" ON expert_research_tasks
  FOR SELECT
  USING ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "expert_research_tasks_insert_own" ON expert_research_tasks
  FOR INSERT
  WITH CHECK ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "expert_research_tasks_update_own" ON expert_research_tasks
  FOR UPDATE
  USING ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- SME TEAMS TABLE POLICIES
-- ============================================================================

CREATE POLICY "sme_teams_select_own" ON sme_teams
  FOR SELECT
  USING ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "sme_teams_insert_own" ON sme_teams
  FOR INSERT
  WITH CHECK ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "sme_teams_update_own" ON sme_teams
  FOR UPDATE
  USING ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- SME FEEDBACK TABLE POLICIES
-- ============================================================================

CREATE POLICY "sme_feedback_select_own" ON sme_feedback
  FOR SELECT
  USING ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "sme_feedback_insert_own" ON sme_feedback
  FOR INSERT
  WITH CHECK ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- INNOVATION HUB WORKFLOW TABLE POLICIES
-- ============================================================================

CREATE POLICY "ihw_ideas_select_own" ON ihw_ideas
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "ihw_ideas_insert_own" ON ihw_ideas
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "ihw_ideas_update_own" ON ihw_ideas
  FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "ihw_conversions_select_own" ON ihw_conversions
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "ihw_conversions_insert_own" ON ihw_conversions
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "ihw_statistics_select_own" ON ihw_statistics
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "ihw_statistics_insert_own" ON ihw_statistics
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- DIGITAL TWIN TRAINING TABLE POLICIES
-- ============================================================================

CREATE POLICY "dt_training_sessions_select_own" ON dt_training_sessions
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "dt_training_sessions_insert_own" ON dt_training_sessions
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "dt_training_sessions_update_own" ON dt_training_sessions
  FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "dt_training_interactions_select_own" ON dt_training_interactions
  FOR SELECT
  USING (session_id IN (SELECT id FROM dt_training_sessions WHERE user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text)));

CREATE POLICY "dt_training_interactions_insert_own" ON dt_training_interactions
  FOR INSERT
  WITH CHECK (session_id IN (SELECT id FROM dt_training_sessions WHERE user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text)));

CREATE POLICY "dt_knowledge_entries_select_own" ON dt_knowledge_entries
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "dt_knowledge_entries_insert_own" ON dt_knowledge_entries
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "dt_knowledge_entries_update_own" ON dt_knowledge_entries
  FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "dt_learning_feedback_select_own" ON dt_learning_feedback
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "dt_learning_feedback_insert_own" ON dt_learning_feedback
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "dt_competency_progress_select_own" ON dt_competency_progress
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "dt_competency_progress_insert_own" ON dt_competency_progress
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "dt_competency_progress_update_own" ON dt_competency_progress
  FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- Training modules are global (all users can read)
CREATE POLICY "dt_training_modules_select_all" ON dt_training_modules
  FOR SELECT
  USING (true);

CREATE POLICY "dt_module_completions_select_own" ON dt_module_completions
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "dt_module_completions_insert_own" ON dt_module_completions
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "dt_module_completions_update_own" ON dt_module_completions
  FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- CHIEF OF STAFF TRAINING TABLE POLICIES
-- ============================================================================

CREATE POLICY "cos_training_sessions_select_own" ON cos_training_sessions
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "cos_training_sessions_insert_own" ON cos_training_sessions
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "cos_training_sessions_update_own" ON cos_training_sessions
  FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "cos_decision_tracking_select_own" ON cos_decision_tracking
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "cos_decision_tracking_insert_own" ON cos_decision_tracking
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "cos_decision_tracking_update_own" ON cos_decision_tracking
  FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "cos_knowledge_base_select_own" ON cos_knowledge_base
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "cos_knowledge_base_insert_own" ON cos_knowledge_base
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "cos_knowledge_base_update_own" ON cos_knowledge_base
  FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "cos_learning_feedback_select_own" ON cos_learning_feedback
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "cos_learning_feedback_insert_own" ON cos_learning_feedback
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "cos_skill_progress_select_own" ON cos_skill_progress
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "cos_skill_progress_insert_own" ON cos_skill_progress
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "cos_skill_progress_update_own" ON cos_skill_progress
  FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- Training scenarios are global (all users can read)
CREATE POLICY "cos_training_scenarios_select_all" ON cos_training_scenarios
  FOR SELECT
  USING (true);

CREATE POLICY "cos_scenario_completions_select_own" ON cos_scenario_completions
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "cos_scenario_completions_insert_own" ON cos_scenario_completions
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "cos_scenario_completions_update_own" ON cos_scenario_completions
  FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "cos_learning_metrics_select_own" ON cos_learning_metrics
  FOR SELECT
  USING ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "cos_learning_metrics_insert_own" ON cos_learning_metrics
  FOR INSERT
  WITH CHECK ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- BUSINESS PLANNING TABLE POLICIES
-- ============================================================================

CREATE POLICY "business_plan_review_versions_select_own" ON business_plan_review_versions
  FOR SELECT
  USING ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "business_plan_review_versions_insert_own" ON business_plan_review_versions
  FOR INSERT
  WITH CHECK ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "business_plan_review_versions_update_own" ON business_plan_review_versions
  FOR UPDATE
  USING ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "collaborative_review_sessions_select_own" ON collaborative_review_sessions
  FOR SELECT
  USING ("ownerId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "collaborative_review_sessions_insert_own" ON collaborative_review_sessions
  FOR INSERT
  WITH CHECK ("ownerId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "collaborative_review_sessions_update_own" ON collaborative_review_sessions
  FOR UPDATE
  USING ("ownerId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "collaborative_review_comments_select_own" ON collaborative_review_comments
  FOR SELECT
  USING ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "collaborative_review_comments_insert_own" ON collaborative_review_comments
  FOR INSERT
  WITH CHECK ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- EVENING REVIEW TABLE POLICIES
-- ============================================================================

CREATE POLICY "evening_review_sessions_select_own" ON evening_review_sessions
  FOR SELECT
  USING ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "evening_review_sessions_insert_own" ON evening_review_sessions
  FOR INSERT
  WITH CHECK ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "evening_review_sessions_update_own" ON evening_review_sessions
  FOR UPDATE
  USING ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "signal_items_select_own" ON signal_items
  FOR SELECT
  USING ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "signal_items_insert_own" ON signal_items
  FOR INSERT
  WITH CHECK ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "signal_items_update_own" ON signal_items
  FOR UPDATE
  USING ("userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- QA WORKFLOW TABLE POLICIES
-- ============================================================================

CREATE POLICY "task_qa_reviews_select_own" ON task_qa_reviews
  FOR SELECT
  USING ("reviewerId" = (SELECT id FROM users WHERE auth.uid()::text = id::text) 
    OR "taskId" IN (SELECT id FROM tasks WHERE "userId" = (SELECT id FROM users WHERE auth.uid()::text = id::text)));

CREATE POLICY "task_qa_reviews_insert_own" ON task_qa_reviews
  FOR INSERT
  WITH CHECK ("reviewerId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

CREATE POLICY "task_qa_reviews_update_own" ON task_qa_reviews
  FOR UPDATE
  USING ("reviewerId" = (SELECT id FROM users WHERE auth.uid()::text = id::text));

-- ============================================================================
-- COMMENTS AND DOCUMENTATION
-- ============================================================================

COMMENT ON POLICY "library_documents_select_own" ON library_documents IS 'Users can only view their own library documents - fixes blank/too much data issues';
COMMENT ON POLICY "projects_select_own" ON projects IS 'Users can only view their own projects';
COMMENT ON POLICY "tasks_select_own" ON tasks IS 'Users can only view their own tasks';

-- ============================================================================
-- GRANT PERMISSIONS TO AUTHENTICATED USERS
-- ============================================================================

-- Note: Supabase automatically handles authenticated role
-- These policies will apply to authenticated users via auth.uid()
