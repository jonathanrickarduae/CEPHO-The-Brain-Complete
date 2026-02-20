-- Migration: Email Accounts and Emails
-- Description: Add tables for multi-account email aggregation
-- Date: 2026-02-20

-- Email Accounts table (stores OAuth credentials for each email account)
CREATE TABLE IF NOT EXISTS email_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email_address TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'gmail', -- 'gmail', 'outlook', 'imap'
  display_name TEXT,
  
  -- OAuth tokens (encrypted)
  oauth_access_token TEXT,
  oauth_refresh_token TEXT,
  oauth_token_expires_at TIMESTAMP,
  oauth_scope TEXT,
  
  -- Account metadata
  company TEXT, -- Which company/project this email belongs to
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Sync status
  last_sync_at TIMESTAMP,
  last_sync_status TEXT, -- 'success', 'failed', 'in_progress'
  last_sync_error TEXT,
  sync_enabled BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, email_address)
);

-- Emails table (stores aggregated emails from all accounts)
CREATE TABLE IF NOT EXISTS emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
  
  -- Email identifiers
  message_id TEXT NOT NULL, -- Gmail message ID or IMAP UID
  thread_id TEXT, -- Gmail thread ID
  
  -- Email metadata
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_emails TEXT[] NOT NULL,
  cc_emails TEXT[],
  bcc_emails TEXT[],
  reply_to TEXT,
  
  -- Content
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  snippet TEXT, -- Short preview
  
  -- Timestamps
  received_at TIMESTAMP NOT NULL,
  sent_at TIMESTAMP,
  
  -- Status flags
  is_read BOOLEAN DEFAULT false,
  is_starred BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  is_spam BOOLEAN DEFAULT false,
  is_draft BOOLEAN DEFAULT false,
  
  -- AI Analysis
  priority TEXT, -- 'urgent', 'high', 'normal', 'low'
  category TEXT, -- 'project', 'personal', 'finance', 'marketing', 'support', etc.
  sentiment TEXT, -- 'positive', 'neutral', 'negative'
  action_items TEXT[], -- Extracted action items
  ai_summary TEXT, -- AI-generated summary
  ai_analyzed_at TIMESTAMP,
  
  -- Attachments
  has_attachments BOOLEAN DEFAULT false,
  attachment_count INTEGER DEFAULT 0,
  attachment_names TEXT[],
  
  -- Labels/Tags
  labels TEXT[],
  
  -- Sync metadata
  synced_at TIMESTAMP DEFAULT NOW(),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(account_id, message_id)
);

-- Email Tasks table (links emails to created tasks)
CREATE TABLE IF NOT EXISTS email_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
  task_id UUID, -- References tasks table
  todoist_task_id TEXT, -- External Todoist task ID
  asana_task_id TEXT, -- External Asana task ID
  
  task_title TEXT NOT NULL,
  task_description TEXT,
  task_priority TEXT,
  task_due_date TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(email_id, task_id)
);

-- Email Threads table (for conversation tracking)
CREATE TABLE IF NOT EXISTS email_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  thread_id TEXT NOT NULL,
  
  subject TEXT,
  participants TEXT[],
  message_count INTEGER DEFAULT 0,
  
  first_message_at TIMESTAMP,
  last_message_at TIMESTAMP,
  
  is_read BOOLEAN DEFAULT false,
  is_starred BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, thread_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_accounts_user ON email_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_email_accounts_email ON email_accounts(email_address);
CREATE INDEX IF NOT EXISTS idx_email_accounts_active ON email_accounts(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_emails_user ON emails(user_id);
CREATE INDEX IF NOT EXISTS idx_emails_account ON emails(account_id);
CREATE INDEX IF NOT EXISTS idx_emails_received ON emails(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_emails_unread ON emails(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_emails_priority ON emails(user_id, priority) WHERE priority IN ('urgent', 'high');
CREATE INDEX IF NOT EXISTS idx_emails_category ON emails(user_id, category);
CREATE INDEX IF NOT EXISTS idx_emails_thread ON emails(thread_id);
CREATE INDEX IF NOT EXISTS idx_emails_from ON emails(from_email);

CREATE INDEX IF NOT EXISTS idx_email_tasks_email ON email_tasks(email_id);
CREATE INDEX IF NOT EXISTS idx_email_tasks_task ON email_tasks(task_id);

CREATE INDEX IF NOT EXISTS idx_email_threads_user ON email_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_email_threads_last_message ON email_threads(last_message_at DESC);

-- Row Level Security (RLS)
ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_threads ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY email_accounts_user_policy ON email_accounts
  FOR ALL
  USING (user_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY emails_user_policy ON emails
  FOR ALL
  USING (user_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY email_tasks_user_policy ON email_tasks
  FOR ALL
  USING (email_id IN (SELECT id FROM emails WHERE user_id = current_setting('app.current_user_id')::UUID));

CREATE POLICY email_threads_user_policy ON email_threads
  FOR ALL
  USING (user_id = current_setting('app.current_user_id')::UUID);

-- Comments
COMMENT ON TABLE email_accounts IS 'Stores OAuth credentials for multi-account email integration';
COMMENT ON TABLE emails IS 'Aggregated emails from all connected accounts with AI analysis';
COMMENT ON TABLE email_tasks IS 'Links emails to tasks created from action items';
COMMENT ON TABLE email_threads IS 'Email conversation threads for context';
