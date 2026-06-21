-- Migration 023: Autonomous Agents & SME Review Triggers
-- Adds:
--   1. agent_daily_reports     — persisted daily reports for all 51 agents
--   2. agent_performance_metrics — real DB-backed performance tracking
--   3. sme_review_triggers     — automated SME/Persephone Board review queue
--   4. victoria_actions        — Victoria's autonomous action log

-- ─── 1. Agent Daily Reports ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agent_daily_reports (
  id                  SERIAL PRIMARY KEY,
  "userId"            INTEGER NOT NULL,
  "agentId"           VARCHAR(100) NOT NULL,
  "agentName"         VARCHAR(200) NOT NULL,
  category            VARCHAR(100) NOT NULL,
  date                DATE NOT NULL DEFAULT CURRENT_DATE,
  "tasksCompleted"    JSONB DEFAULT '[]',
  achievements        TEXT,
  challenges          TEXT,
  "newLearnings"      JSONB DEFAULT '[]',
  suggestions         JSONB DEFAULT '[]',
  "capabilityRequest" JSONB,
  "approvalStatus"    VARCHAR(20) DEFAULT 'pending',
  "approvedAt"        TIMESTAMP,
  "approvedBy"        INTEGER,
  "createdAt"         TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_daily_reports_user_date
  ON agent_daily_reports ("userId", date DESC);

CREATE INDEX IF NOT EXISTS idx_agent_daily_reports_agent_date
  ON agent_daily_reports ("agentId", date DESC);

-- RLS
ALTER TABLE agent_daily_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY agent_daily_reports_user_policy ON agent_daily_reports
  USING ("userId" = current_setting('app.current_user_id', true)::integer);

-- ─── 2. Agent Performance Metrics ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agent_performance_metrics (
  id                  SERIAL PRIMARY KEY,
  "userId"            INTEGER NOT NULL,
  "agentId"           VARCHAR(100) NOT NULL,
  "agentName"         VARCHAR(200) NOT NULL,
  date                DATE NOT NULL DEFAULT CURRENT_DATE,
  "tasksExecuted"     INTEGER DEFAULT 0,
  "tasksSucceeded"    INTEGER DEFAULT 0,
  "tasksFailed"       INTEGER DEFAULT 0,
  "avgResponseMs"     INTEGER DEFAULT 0,
  "totalTokensUsed"   INTEGER DEFAULT 0,
  "userRating"        REAL,
  "improvementCount"  INTEGER DEFAULT 0,
  "learningScore"     REAL DEFAULT 0,
  "overallScore"      REAL DEFAULT 0,
  "createdAt"         TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"         TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_agent_perf_user_agent_date
  ON agent_performance_metrics ("userId", "agentId", date);

CREATE INDEX IF NOT EXISTS idx_agent_perf_user_date
  ON agent_performance_metrics ("userId", date DESC);

ALTER TABLE agent_performance_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY agent_performance_metrics_user_policy ON agent_performance_metrics
  USING ("userId" = current_setting('app.current_user_id', true)::integer);

-- ─── 3. SME Review Triggers ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sme_review_triggers (
  id                  SERIAL PRIMARY KEY,
  "userId"            INTEGER NOT NULL,
  "triggerType"       VARCHAR(50) NOT NULL,  -- 'innovation_assess','innovation_brief','genesis_strategic','genesis_mid','genesis_final'
  "sourceType"        VARCHAR(50) NOT NULL,  -- 'innovation_idea' | 'project_genesis'
  "sourceId"          INTEGER NOT NULL,
  "sourceTitle"       VARCHAR(500),
  "expertType"        VARCHAR(50) NOT NULL,  -- 'ai_sme' | 'persephone_board'
  "expertIds"         JSONB DEFAULT '[]',    -- list of expert IDs to engage
  status              VARCHAR(20) DEFAULT 'pending', -- pending | in_progress | completed | skipped
  "reviewResult"      JSONB,
  "reviewSummary"     TEXT,
  "recommendation"    VARCHAR(20),           -- 'proceed' | 'revise' | 'reject'
  "triggeredAt"       TIMESTAMP NOT NULL DEFAULT NOW(),
  "startedAt"         TIMESTAMP,
  "completedAt"       TIMESTAMP,
  "createdAt"         TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sme_triggers_user_status
  ON sme_review_triggers ("userId", status);

CREATE INDEX IF NOT EXISTS idx_sme_triggers_source
  ON sme_review_triggers ("sourceType", "sourceId");

ALTER TABLE sme_review_triggers ENABLE ROW LEVEL SECURITY;
CREATE POLICY sme_review_triggers_user_policy ON sme_review_triggers
  USING ("userId" = current_setting('app.current_user_id', true)::integer);

-- ─── 4. Victoria Actions Log ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS victoria_actions (
  id                  SERIAL PRIMARY KEY,
  "userId"            INTEGER NOT NULL,
  "actionType"        VARCHAR(100) NOT NULL, -- 'briefing_generated','agent_report_reviewed','sme_triggered','task_delegated','approval_processed'
  "actionTitle"       VARCHAR(500) NOT NULL,
  description         TEXT,
  "relatedEntityType" VARCHAR(50),           -- 'task' | 'project' | 'agent' | 'idea' | 'briefing'
  "relatedEntityId"   INTEGER,
  "autonomous"        BOOLEAN DEFAULT TRUE,  -- true = Victoria did it herself, false = user-triggered
  metadata            JSONB,
  "createdAt"         TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_victoria_actions_user_date
  ON victoria_actions ("userId", "createdAt" DESC);

ALTER TABLE victoria_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY victoria_actions_user_policy ON victoria_actions
  USING ("userId" = current_setting('app.current_user_id', true)::integer);
