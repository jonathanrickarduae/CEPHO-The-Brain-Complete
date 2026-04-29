-- Migration 0046: SME Intelligence Layer
-- Creates two new tables for the AI SME agent intelligence system:
--   sme_idea_submissions — tracks enhancement ideas submitted by AI SME agents
--   sme_activity_log     — tracks SME agent scan activity and contribution stats
-- Uses IF NOT EXISTS for idempotency (safe to re-run).

CREATE TABLE IF NOT EXISTS "sme_idea_submissions" (
  "id"               SERIAL PRIMARY KEY,
  "userId"           INTEGER NOT NULL,
  "expertId"         VARCHAR(50) NOT NULL,
  "expertName"       VARCHAR(200) NOT NULL,
  "expertCategory"   VARCHAR(100) NOT NULL,
  "title"            VARCHAR(300) NOT NULL,
  "description"      TEXT NOT NULL,
  "sourceUrl"        TEXT,
  "sourceTitle"      VARCHAR(300),
  "cephoArea"        VARCHAR(100),
  "toolName"         VARCHAR(200),
  "toolUrl"          TEXT,
  "confidenceScore"  REAL,
  "status"           TEXT NOT NULL DEFAULT 'pending',
  "agent1Assessment" TEXT,
  "agent1Verdict"    TEXT,
  "agent1AssessedAt" TIMESTAMP,
  "promotedToIdeaId" INTEGER,
  "metadata"         JSON,
  "createdAt"        TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"        TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "sme_activity_log" (
  "id"              SERIAL PRIMARY KEY,
  "userId"          INTEGER NOT NULL,
  "expertId"        VARCHAR(50) NOT NULL,
  "expertName"      VARCHAR(200) NOT NULL,
  "activityType"    TEXT NOT NULL,
  "summary"         TEXT,
  "ideasSubmitted"  INTEGER NOT NULL DEFAULT 0,
  "ideasApproved"   INTEGER NOT NULL DEFAULT 0,
  "searchQueries"   JSON,
  "sourcesScanned"  JSON,
  "createdAt"       TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS "sme_idea_submissions_userId_idx"
  ON "sme_idea_submissions" ("userId");
CREATE INDEX IF NOT EXISTS "sme_idea_submissions_expertId_idx"
  ON "sme_idea_submissions" ("expertId");
CREATE INDEX IF NOT EXISTS "sme_idea_submissions_status_idx"
  ON "sme_idea_submissions" ("status");
CREATE INDEX IF NOT EXISTS "sme_idea_submissions_createdAt_idx"
  ON "sme_idea_submissions" ("createdAt");

CREATE INDEX IF NOT EXISTS "sme_activity_log_userId_idx"
  ON "sme_activity_log" ("userId");
CREATE INDEX IF NOT EXISTS "sme_activity_log_expertId_idx"
  ON "sme_activity_log" ("expertId");
CREATE INDEX IF NOT EXISTS "sme_activity_log_createdAt_idx"
  ON "sme_activity_log" ("createdAt");
