-- Migration 025: Autonomous Venture Execution Framework
-- Phase 5 Appendix AL — Ventures, Workflows, Orchestrator, Credentials Vault

-- ─── Ventures ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ventures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  -- draft | active | paused | launched | archived
  stage VARCHAR(50) NOT NULL DEFAULT 'ideation',
  -- ideation | validation | build | launch | growth
  industry VARCHAR(255),
  target_market TEXT,
  business_model TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Autonomous Workflows ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS autonomous_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id UUID NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  -- market_research | competitor_analysis | content_creation | market_launch | etc.
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  -- pending | in_progress | awaiting_approval | completed | failed | paused
  current_step INTEGER NOT NULL DEFAULT 0,
  total_steps INTEGER NOT NULL DEFAULT 0,
  steps JSONB NOT NULL DEFAULT '[]',
  result JSONB,
  error TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Workflow Approval Gates ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workflow_approval_gates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES autonomous_workflows(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  step_name VARCHAR(255) NOT NULL,
  step_index INTEGER NOT NULL,
  description TEXT NOT NULL,
  proposed_action TEXT NOT NULL,
  -- The exact action the system wants to take
  impact_level VARCHAR(20) NOT NULL DEFAULT 'medium',
  -- low | medium | high | critical
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  -- pending | approved | denied
  user_decision VARCHAR(20),
  user_notes TEXT,
  decided_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Credentials Vault ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS credentials_vault (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_name VARCHAR(255) NOT NULL,
  -- stripe | aws | sendgrid | twilio | etc.
  display_name VARCHAR(255) NOT NULL,
  credential_type VARCHAR(50) NOT NULL DEFAULT 'api_key',
  -- api_key | oauth | webhook | password | certificate
  encrypted_value TEXT NOT NULL,
  -- AES-256 encrypted credential value
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_verified_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, service_name)
);

-- ─── Orchestrator Jobs ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orchestrator_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES autonomous_workflows(id) ON DELETE SET NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agent_id VARCHAR(100) NOT NULL,
  task_type VARCHAR(100) NOT NULL,
  input JSONB NOT NULL DEFAULT '{}',
  output JSONB,
  status VARCHAR(50) NOT NULL DEFAULT 'queued',
  -- queued | running | completed | failed | cancelled
  priority INTEGER NOT NULL DEFAULT 5,
  -- 1 (highest) to 10 (lowest)
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  error TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Market Launch Checklist ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS market_launch_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venture_id UUID NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  -- pending | in_progress | completed | failed
  steps JSONB NOT NULL DEFAULT '[]',
  launched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── System Kill Switch ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS system_kill_switch (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT false,
  -- true = all autonomous actions halted
  reason TEXT,
  activated_at TIMESTAMPTZ,
  deactivated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert a default kill switch record (inactive)
INSERT INTO system_kill_switch (id, user_id, is_active, reason)
SELECT 
  gen_random_uuid(),
  id,
  false,
  'System initialized'
FROM users
LIMIT 1
ON CONFLICT DO NOTHING;

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ventures_user_id ON ventures(user_id);
CREATE INDEX IF NOT EXISTS idx_ventures_status ON ventures(status);
CREATE INDEX IF NOT EXISTS idx_autonomous_workflows_venture_id ON autonomous_workflows(venture_id);
CREATE INDEX IF NOT EXISTS idx_autonomous_workflows_status ON autonomous_workflows(status);
CREATE INDEX IF NOT EXISTS idx_workflow_approval_gates_workflow_id ON workflow_approval_gates(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_approval_gates_status ON workflow_approval_gates(status);
CREATE INDEX IF NOT EXISTS idx_credentials_vault_user_id ON credentials_vault(user_id);
CREATE INDEX IF NOT EXISTS idx_orchestrator_jobs_status ON orchestrator_jobs(status);
CREATE INDEX IF NOT EXISTS idx_orchestrator_jobs_workflow_id ON orchestrator_jobs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_market_launch_checklists_venture_id ON market_launch_checklists(venture_id);
