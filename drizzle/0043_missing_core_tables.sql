-- Migration 0043: Create all missing core tables that exist in schema.ts but were never
-- added to the Drizzle journal. These tables were previously only in the manual
-- drizzle/migrations/ subfolder which is not run by the Drizzle migrator.
-- All statements use CREATE TABLE IF NOT EXISTS for idempotency.

-- ─── 1. Briefings ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS briefings (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  date TIMESTAMP NOT NULL,
  title VARCHAR(300) NOT NULL,
  content JSON,
  "pdfUrl" VARCHAR(500),
  "audioUrl" VARCHAR(500),
  "videoUrl" VARCHAR(500),
  status VARCHAR(20) DEFAULT 'pending' NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_briefings_userId ON briefings("userId");
CREATE INDEX IF NOT EXISTS idx_briefings_date ON briefings(date DESC);

-- ─── 2. Agent Daily Reports ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agent_daily_reports (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "agentId" VARCHAR(100) NOT NULL,
  "agentName" VARCHAR(200) NOT NULL,
  category VARCHAR(100) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  "tasksCompleted" JSONB DEFAULT '[]',
  achievements TEXT,
  challenges TEXT,
  "newLearnings" JSONB DEFAULT '[]',
  suggestions JSONB DEFAULT '[]',
  "capabilityRequest" JSONB,
  "approvalStatus" VARCHAR(20) DEFAULT 'pending',
  "approvedAt" TIMESTAMP,
  "approvedBy" INTEGER,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_agent_daily_reports_user_date ON agent_daily_reports("userId", date DESC);
CREATE INDEX IF NOT EXISTS idx_agent_daily_reports_agent_date ON agent_daily_reports("agentId", date DESC);

-- ─── 3. Agent Performance Metrics ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agent_performance_metrics (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "agentId" VARCHAR(100) NOT NULL,
  "agentName" VARCHAR(200) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  "tasksExecuted" INTEGER DEFAULT 0,
  "tasksSucceeded" INTEGER DEFAULT 0,
  "tasksFailed" INTEGER DEFAULT 0,
  "avgResponseMs" INTEGER DEFAULT 0,
  "totalTokensUsed" INTEGER DEFAULT 0,
  "userRating" REAL,
  "improvementCount" INTEGER DEFAULT 0,
  "learningScore" REAL DEFAULT 0,
  "overallScore" REAL DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_agent_perf_user_agent_date ON agent_performance_metrics("userId", "agentId", date);
CREATE INDEX IF NOT EXISTS idx_agent_perf_user_date ON agent_performance_metrics("userId", date DESC);

-- ─── 4. SME Review Triggers ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sme_review_triggers (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "triggerType" VARCHAR(50) NOT NULL,
  "sourceType" VARCHAR(50) NOT NULL,
  "sourceId" INTEGER NOT NULL,
  "sourceTitle" VARCHAR(500),
  "expertType" VARCHAR(50) NOT NULL,
  "expertIds" JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'pending',
  "reviewResult" JSONB,
  "reviewSummary" TEXT,
  recommendation VARCHAR(20),
  "triggeredAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "startedAt" TIMESTAMP,
  "completedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sme_triggers_user_status ON sme_review_triggers("userId", status);
CREATE INDEX IF NOT EXISTS idx_sme_triggers_source ON sme_review_triggers("sourceType", "sourceId");

-- ─── 5. Victoria Actions Log ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS victoria_actions (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "actionType" VARCHAR(100) NOT NULL,
  "actionTitle" VARCHAR(500) NOT NULL,
  description TEXT,
  "relatedEntityType" VARCHAR(50),
  "relatedEntityId" INTEGER,
  autonomous BOOLEAN DEFAULT TRUE,
  metadata JSONB,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_victoria_actions_user_date ON victoria_actions("userId", "createdAt" DESC);
