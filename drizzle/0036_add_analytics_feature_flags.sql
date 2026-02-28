-- Migration: Add analytics and feature flags tables
-- Remediation Tasks 6.1 (Analytics) and 6.3 (Feature Flags)

-- Analytics events table (lightweight PostHog alternative)
CREATE TABLE IF NOT EXISTS "analytics_events" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer REFERENCES "users"("id") ON DELETE SET NULL,
  "session_id" varchar(128),
  "event_name" varchar(200) NOT NULL,
  "event_category" varchar(100) NOT NULL DEFAULT 'general',
  "properties" jsonb DEFAULT '{}',
  "page_path" varchar(500),
  "referrer" varchar(500),
  "user_agent" varchar(500),
  "ip_hash" varchar(64), -- SHA-256 of IP for privacy
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "analytics_events_user_id_idx" ON "analytics_events"("user_id");
CREATE INDEX IF NOT EXISTS "analytics_events_event_name_idx" ON "analytics_events"("event_name");
CREATE INDEX IF NOT EXISTS "analytics_events_created_at_idx" ON "analytics_events"("created_at");
CREATE INDEX IF NOT EXISTS "analytics_events_session_idx" ON "analytics_events"("session_id");

-- Feature flags table
CREATE TABLE IF NOT EXISTS "feature_flags" (
  "id" serial PRIMARY KEY NOT NULL,
  "key" varchar(200) NOT NULL UNIQUE,
  "name" varchar(200) NOT NULL,
  "description" text,
  "enabled" boolean NOT NULL DEFAULT false,
  "rollout_percentage" integer NOT NULL DEFAULT 0, -- 0-100
  "user_ids" jsonb DEFAULT '[]', -- specific user IDs to enable for
  "conditions" jsonb DEFAULT '{}', -- arbitrary conditions
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "feature_flags_key_idx" ON "feature_flags"("key");

-- Seed default feature flags
INSERT INTO "feature_flags" ("key", "name", "description", "enabled", "rollout_percentage")
VALUES
  ('ai_chat', 'AI Chat', 'Enable AI chat across the platform', true, 100),
  ('digital_twin', 'Digital Twin', 'Enable Digital Twin / Chief of Staff AI', true, 100),
  ('voice_notes', 'Voice Notes', 'Enable voice note recording and transcription', true, 100),
  ('innovation_hub', 'Innovation Hub', 'Enable Innovation Hub with AI idea generation', true, 100),
  ('evening_review', 'Evening Review', 'Enable AI-powered evening review sessions', true, 100),
  ('two_factor_auth', 'Two-Factor Authentication', 'Enable 2FA setup for users', true, 100),
  ('feedback_widget', 'Feedback Widget', 'Show the global feedback widget', true, 100),
  ('storybook', 'Storybook', 'Enable Storybook component library link in dev', false, 0)
ON CONFLICT ("key") DO NOTHING;
