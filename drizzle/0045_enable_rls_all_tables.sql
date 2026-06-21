-- Migration 0045: Enable RLS on all user-data tables that were missing it
-- Uses DO blocks with existence checks since CREATE POLICY IF NOT EXISTS is not supported.
-- Pattern mirrors existing protected tables (project_genesis, etc.)

-- ─── Helper function to create policy if it doesn't exist ────────────────────
CREATE OR REPLACE FUNCTION _create_policy_if_not_exists(
  p_name TEXT, p_table TEXT, p_cmd TEXT, p_role TEXT,
  p_using TEXT DEFAULT NULL, p_with_check TEXT DEFAULT NULL
) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = p_table AND policyname = p_name
  ) THEN
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR %s TO %s %s %s',
      p_name, p_table, p_cmd, p_role,
      CASE WHEN p_using IS NOT NULL THEN 'USING (' || p_using || ')' ELSE '' END,
      CASE WHEN p_with_check IS NOT NULL THEN 'WITH CHECK (' || p_with_check || ')' ELSE '' END
    );
  END IF;
END;
$$;

-- ─── TABLES WITH "userId" COLUMN ─────────────────────────────────────────────
DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'anomaly_alerts','briefings','email_accounts','email_messages',
    'expert_collaboration','expert_follow_up_questions','expert_memory',
    'external_research_references','favorite_contacts','focus_group_sessions',
    'funding_assessments','innovation_validation_checkpoints','insight_usage_log',
    'insights_repository','kpi_snapshots','kpis','lessons_learned',
    'manus_delegation_log','meeting_notes','okr_key_results','okrs',
    'output_quality_scores','panel_assessment_aggregations','pii_detection_log',
    'pipeline_opportunities','pre_mortem_sessions','pricing_tiers',
    'prior_research_checks','proactive_recommendations','push_subscriptions',
    'quality_gates','quality_improvement_tickets','quality_metrics_snapshots',
    'reminders','revenue_forecasts','revenue_metrics_snapshots','revenue_streams',
    'revenue_transactions','review_timing_patterns','signatures','sme_feedback_log',
    'sme_individual_assessments','sme_panels','streaks','tool_integrations',
    'training_documents','trend_repository','trusted_devices','universal_inbox',
    'user_activity_tracking','user_credits','user_workspace_prefs','vault_access_log',
    'vault_sessions','vault_verification_codes','victoria_qc_checks','victoria_skills',
    'wellness_scores','workflow_patterns','workspace_members','workspaces'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY;', t);
    PERFORM _create_policy_if_not_exists('service_role_all_' || t, t, 'ALL', 'service_role', 'true', 'true');
    PERFORM _create_policy_if_not_exists('user_select_own_' || t, t, 'SELECT', 'authenticated', '("userId")::text = (auth.uid())::text', NULL);
    PERFORM _create_policy_if_not_exists('user_insert_own_' || t, t, 'INSERT', 'authenticated', NULL, '("userId")::text = (auth.uid())::text');
    PERFORM _create_policy_if_not_exists('user_update_own_' || t, t, 'UPDATE', 'authenticated', '("userId")::text = (auth.uid())::text', '("userId")::text = (auth.uid())::text');
    PERFORM _create_policy_if_not_exists('user_delete_own_' || t, t, 'DELETE', 'authenticated', '("userId")::text = (auth.uid())::text', NULL);
  END LOOP;
END $$;

-- ─── TABLES WITH "user_id" COLUMN ────────────────────────────────────────────
DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'integration_credentials','integration_logs','nps_responses','rag_contexts'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY;', t);
    PERFORM _create_policy_if_not_exists('service_role_all_' || t, t, 'ALL', 'service_role', 'true', 'true');
    PERFORM _create_policy_if_not_exists('user_select_own_' || t, t, 'SELECT', 'authenticated', '(user_id::text) = (auth.uid())::text', NULL);
    PERFORM _create_policy_if_not_exists('user_insert_own_' || t, t, 'INSERT', 'authenticated', NULL, '(user_id::text) = (auth.uid())::text');
    PERFORM _create_policy_if_not_exists('user_update_own_' || t, t, 'UPDATE', 'authenticated', '(user_id::text) = (auth.uid())::text', '(user_id::text) = (auth.uid())::text');
    PERFORM _create_policy_if_not_exists('user_delete_own_' || t, t, 'DELETE', 'authenticated', '(user_id::text) = (auth.uid())::text', NULL);
  END LOOP;
END $$;

-- ─── TABLES WITH "createdBy" COLUMN ──────────────────────────────────────────
DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'expert_prompt_evolution','project_genesis_deliverables'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY;', t);
    PERFORM _create_policy_if_not_exists('service_role_all_' || t, t, 'ALL', 'service_role', 'true', 'true');
    PERFORM _create_policy_if_not_exists('user_select_own_' || t, t, 'SELECT', 'authenticated', '("createdBy")::text = (auth.uid())::text', NULL);
    PERFORM _create_policy_if_not_exists('user_insert_own_' || t, t, 'INSERT', 'authenticated', NULL, '("createdBy")::text = (auth.uid())::text');
    PERFORM _create_policy_if_not_exists('user_update_own_' || t, t, 'UPDATE', 'authenticated', '("createdBy")::text = (auth.uid())::text', '("createdBy")::text = (auth.uid())::text');
    PERFORM _create_policy_if_not_exists('user_delete_own_' || t, t, 'DELETE', 'authenticated', '("createdBy")::text = (auth.uid())::text', NULL);
  END LOOP;
END $$;

-- ─── SYSTEM/LOOKUP TABLES (no user ownership — service_role + authenticated read) ─
DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'expert_domain_knowledge','expert_panel_assignments','expert_teams',
    'feature_comparison','funding_programs','idea_assessments','idea_refinements',
    'investment_scenarios','knowledge_topics','kpi_categories','market_position_history',
    'partnerships','process_playbooks','project_genesis_milestones',
    'qms_audit_trail','qms_compliance_checks','quality_gate_criteria',
    'quality_gate_results','regulatory_landscape','sme_panel_types',
    'sme_team_members','strategy_recommendations','subphase_tasks',
    'team_capabilities','value_chain_phases','waitlist'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY;', t);
    PERFORM _create_policy_if_not_exists('service_role_all_' || t, t, 'ALL', 'service_role', 'true', 'true');
    PERFORM _create_policy_if_not_exists('authenticated_read_' || t, t, 'SELECT', 'authenticated', 'true', NULL);
  END LOOP;
END $$;

-- Clean up the helper function
DROP FUNCTION IF EXISTS _create_policy_if_not_exists(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);
