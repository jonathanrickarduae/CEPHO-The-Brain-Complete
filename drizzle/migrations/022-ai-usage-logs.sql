-- Migration: 022-ai-usage-logs
-- p5-9: AI cost tracking table
-- Tracks every LLM call: model, tokens, cost, feature, user

CREATE TABLE IF NOT EXISTS "ai_usage_logs" (
  "id" serial PRIMARY KEY,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "feature" varchar(128) NOT NULL,
  "model" varchar(64) NOT NULL,
  "prompt_tokens" integer NOT NULL DEFAULT 0,
  "completion_tokens" integer NOT NULL DEFAULT 0,
  "total_tokens" integer NOT NULL DEFAULT 0,
  "cost_usd" numeric(10, 6) NOT NULL DEFAULT 0,
  "latency_ms" integer,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "ai_usage_logs_user_id_idx" ON "ai_usage_logs" ("user_id");
CREATE INDEX IF NOT EXISTS "ai_usage_logs_created_at_idx" ON "ai_usage_logs" ("created_at");
CREATE INDEX IF NOT EXISTS "ai_usage_logs_feature_idx" ON "ai_usage_logs" ("feature");

-- RLS: users can only see their own usage logs
ALTER TABLE "ai_usage_logs" ENABLE ROW LEVEL SECURITY;
