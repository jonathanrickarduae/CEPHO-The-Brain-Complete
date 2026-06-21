-- Migration 0042: Create email_messages table for Email Intelligence feature
-- The emailIntelligence router uses this table (not the old 'emails' table from migration 020)
CREATE TABLE IF NOT EXISTS email_messages (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(20) NOT NULL,
  "externalId" VARCHAR(200) NOT NULL,
  "threadId" VARCHAR(200),
  "fromAddress" VARCHAR(300),
  "fromName" VARCHAR(200),
  "toAddresses" JSONB DEFAULT '[]',
  subject VARCHAR(500),
  "bodyText" TEXT,
  "aiSummary" TEXT,
  "aiPriority" VARCHAR(20) DEFAULT 'normal',
  "aiAction" VARCHAR(50),
  "aiActionReason" TEXT,
  "isDraft" BOOLEAN DEFAULT false,
  "draftContent" TEXT,
  "followUpAt" TIMESTAMP,
  "isRead" BOOLEAN DEFAULT false,
  "isArchived" BOOLEAN DEFAULT false,
  "receivedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE("userId", "externalId")
);

CREATE INDEX IF NOT EXISTS idx_email_messages_user ON email_messages("userId");
CREATE INDEX IF NOT EXISTS idx_email_messages_priority ON email_messages("userId", "aiPriority");
CREATE INDEX IF NOT EXISTS idx_email_messages_received ON email_messages("receivedAt" DESC);
CREATE INDEX IF NOT EXISTS idx_email_messages_archived ON email_messages("userId", "isArchived");
