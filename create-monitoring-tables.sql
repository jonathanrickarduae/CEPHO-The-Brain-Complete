-- API Usage Tracking Table
CREATE TABLE IF NOT EXISTS api_usage (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "skillType" VARCHAR(50) NOT NULL,
  provider VARCHAR(20) NOT NULL,
  "promptTokens" INTEGER NOT NULL DEFAULT 0,
  "completionTokens" INTEGER NOT NULL DEFAULT 0,
  "totalTokens" INTEGER NOT NULL DEFAULT 0,
  cost DECIMAL(10, 6) NOT NULL DEFAULT 0,
  "responseTime" INTEGER NOT NULL DEFAULT 0,
  cached BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_usage_user ON api_usage("userId");
CREATE INDEX IF NOT EXISTS idx_api_usage_created ON api_usage("createdAt");
CREATE INDEX IF NOT EXISTS idx_api_usage_skill ON api_usage("skillType");

-- API Errors Tracking Table
CREATE TABLE IF NOT EXISTS api_errors (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "skillType" VARCHAR(50) NOT NULL,
  provider VARCHAR(20) NOT NULL,
  "errorType" VARCHAR(50) NOT NULL,
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_errors_user ON api_errors("userId");
CREATE INDEX IF NOT EXISTS idx_api_errors_created ON api_errors("createdAt");

-- Conversation Summaries Table
CREATE TABLE IF NOT EXISTS conversation_summaries (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "skillType" VARCHAR(50) NOT NULL,
  summary TEXT NOT NULL,
  "messageCount" INTEGER NOT NULL DEFAULT 0,
  "keyPoints" TEXT, -- JSON array
  "actionItems" TEXT, -- JSON array
  decisions TEXT, -- JSON array
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conv_summaries_user ON conversation_summaries("userId");
CREATE INDEX IF NOT EXISTS idx_conv_summaries_skill ON conversation_summaries("skillType");
CREATE INDEX IF NOT EXISTS idx_conv_summaries_created ON conversation_summaries("createdAt");
