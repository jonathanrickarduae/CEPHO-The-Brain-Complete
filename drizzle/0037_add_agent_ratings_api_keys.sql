-- Migration: Add agentRatings and apiKeys tables
-- Phase 6: Agent Ratings and Public API Key Management

CREATE TABLE IF NOT EXISTS "agent_ratings" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" varchar NOT NULL,
  "agent_name" varchar NOT NULL,
  "rating" integer NOT NULL,
  "feedback" text,
  "task_context" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "api_keys" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" varchar NOT NULL,
  "name" varchar NOT NULL,
  "key_hash" varchar NOT NULL,
  "key_prefix" varchar NOT NULL,
  "scopes" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "last_used_at" timestamp,
  "expires_at" timestamp,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "agent_ratings_user_id_idx" ON "agent_ratings" ("user_id");
CREATE INDEX IF NOT EXISTS "agent_ratings_agent_name_idx" ON "agent_ratings" ("agent_name");
CREATE INDEX IF NOT EXISTS "api_keys_user_id_idx" ON "api_keys" ("user_id");
CREATE INDEX IF NOT EXISTS "api_keys_key_hash_idx" ON "api_keys" ("key_hash");
