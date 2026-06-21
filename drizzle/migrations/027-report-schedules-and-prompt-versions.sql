-- Migration 027: report_schedules and prompt_versions
-- Fixes p6-4 (scheduled reports in-memory store) and p6-12 (prompt version history in-memory store)

-- ─── report_schedules ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "report_schedules" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL,
  "name" varchar(255) NOT NULL,
  "report_type" varchar(100) NOT NULL,
  "frequency" varchar(50) NOT NULL DEFAULT 'weekly',
  "day_of_week" integer,
  "hour_utc" integer NOT NULL DEFAULT 8,
  "recipients" json NOT NULL DEFAULT '[]',
  "filters" json,
  "is_active" boolean NOT NULL DEFAULT true,
  "last_run_at" timestamp,
  "next_run_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "report_schedules_user_idx" ON "report_schedules" ("user_id");
CREATE INDEX IF NOT EXISTS "report_schedules_active_idx" ON "report_schedules" ("is_active", "next_run_at");

-- ─── prompt_versions ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "prompt_versions" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL,
  "prompt_key" varchar(255) NOT NULL,
  "version" integer NOT NULL DEFAULT 1,
  "content" text NOT NULL,
  "description" varchar(500),
  "is_active" boolean NOT NULL DEFAULT false,
  "created_by" varchar(255),
  "parent_version_id" integer,
  "token_count" integer,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "prompt_versions_user_key_idx" ON "prompt_versions" ("user_id", "prompt_key");
CREATE INDEX IF NOT EXISTS "prompt_versions_active_idx" ON "prompt_versions" ("user_id", "prompt_key", "is_active");
CREATE UNIQUE INDEX IF NOT EXISTS "prompt_versions_unique_active" ON "prompt_versions" ("user_id", "prompt_key") WHERE "is_active" = true;
