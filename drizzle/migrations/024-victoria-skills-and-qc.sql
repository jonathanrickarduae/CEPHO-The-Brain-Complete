-- Migration 024: Victoria Skills Framework & Quality Control Enhancements
-- Adds the victoria_skills table for repeatable SOPs and a victoria_qc_checks
-- table for logging all quality control checks Victoria performs.

-- Victoria Skills: Standard Operating Procedures (SOPs) that Victoria can execute
CREATE TABLE IF NOT EXISTS victoria_skills (
  id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "userId"    INTEGER NOT NULL,
  name        VARCHAR(200) NOT NULL,
  category    VARCHAR(100) NOT NULL, -- 'project_review', 'email', 'calendar', 'document', 'delegation', 'qc'
  description TEXT,
  trigger     VARCHAR(100) NOT NULL, -- 'manual', 'daily', 'hourly', 'on_event'
  steps       JSONB NOT NULL DEFAULT '[]', -- Array of step objects
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  last_run_at TIMESTAMP,
  run_count   INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Victoria QC Checks: Every quality control check Victoria performs
CREATE TABLE IF NOT EXISTS victoria_qc_checks (
  id              INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "userId"        INTEGER NOT NULL,
  check_type      VARCHAR(100) NOT NULL, -- 'agent_output', 'document', 'project', 'email_draft', 'sme_review'
  target_id       VARCHAR(200),          -- ID of the item being checked
  target_title    VARCHAR(300),
  score           INTEGER,               -- 0-100
  grade           VARCHAR(2),            -- A, B, C, D, F
  passed          BOOLEAN NOT NULL DEFAULT TRUE,
  issues          JSONB DEFAULT '[]',    -- Array of issue objects
  recommendations JSONB DEFAULT '[]',   -- Array of recommendation strings
  auto_fixed      BOOLEAN NOT NULL DEFAULT FALSE,
  fix_description TEXT,
  "checkedAt"     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Sub-phase task tracker: tracks the status of every DT-COS task
CREATE TABLE IF NOT EXISTS subphase_tasks (
  id           INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  task_id      VARCHAR(50) NOT NULL UNIQUE, -- e.g. 'DT-COS-01'
  domain       VARCHAR(100) NOT NULL,
  title        TEXT NOT NULL,
  description  TEXT,
  status       VARCHAR(50) NOT NULL DEFAULT 'not_started', -- 'not_started', 'in_progress', 'complete', 'blocked'
  commit_sha   VARCHAR(50),
  evidence     TEXT,
  started_at   TIMESTAMP,
  completed_at TIMESTAMP,
  "createdAt"  TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Seed the 13 DT-COS tasks
INSERT INTO subphase_tasks (task_id, domain, title, description, status) VALUES
  ('DT-COS-01', 'Identity', 'Unified Victoria Identity', 'Merge Digital Twin + CoS persona into one authoritative victoria.router.ts', 'complete'),
  ('DT-COS-02', 'Quality Control', 'Quality Control Engine', 'Victoria inspects all AI inputs/outputs and logs QC checks to victoria_qc_checks', 'in_progress'),
  ('DT-COS-03', 'Calendar', 'Calendar Router Enhancement', 'Add createEvent, updateEvent, deleteEvent, and AI meeting pre-brief procedures', 'in_progress'),
  ('DT-COS-04', 'Projects', 'Autonomous Project Review', 'Victoria reviews all active projects daily and flags risks', 'in_progress'),
  ('DT-COS-05', 'Email', 'Autonomous Email Management', 'Victoria triages inbox, drafts replies, archives non-essential mail', 'in_progress'),
  ('DT-COS-06', 'Meetings', 'Autonomous Meeting Pre-Briefs', 'Victoria checks calendar and generates pre-briefs for upcoming meetings', 'in_progress'),
  ('DT-COS-07', 'Documents', 'Autonomous Document Cleanup', 'Victoria scans document library and flags stale/low-quality documents', 'in_progress'),
  ('DT-COS-08', 'Delegation', 'Autonomous Task Delegation', 'Victoria assigns unassigned tasks to the best-suited AI agent', 'in_progress'),
  ('DT-COS-09', 'Workflows', 'Autonomous Workflow Orchestration', 'Victoria executes multi-step workflows autonomously', 'in_progress'),
  ('DT-COS-10', 'Skills', 'Repeatable Skills Framework', 'victoria_skills table and SOPs for all standard Victoria operations', 'in_progress'),
  ('DT-COS-11', 'Scheduler', 'Scheduler Updates', 'Add all new autonomous procedures to the daily/hourly cron schedule', 'not_started'),
  ('DT-COS-12', 'Dashboard', 'Sub-Phase Tracker Dashboard', 'New page at /victoria-tracker showing live status of all DT-COS tasks', 'in_progress'),
  ('DT-COS-13', 'Deployment', 'Commit, Push, Verify, Deliver', 'Final commit, push to main, health check, and delivery report', 'not_started')
ON CONFLICT (task_id) DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_victoria_skills_user ON victoria_skills ("userId");
CREATE INDEX IF NOT EXISTS idx_victoria_qc_checks_user ON victoria_qc_checks ("userId");
CREATE INDEX IF NOT EXISTS idx_victoria_qc_checks_type ON victoria_qc_checks (check_type);
CREATE INDEX IF NOT EXISTS idx_subphase_tasks_status ON subphase_tasks (status);
