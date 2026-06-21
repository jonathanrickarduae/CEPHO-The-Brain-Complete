-- Migration: Fix agent_ratings table to match Drizzle schema
-- The original migration used snake_case columns; the schema uses camelCase.
-- This migration drops the old table and recreates with correct column names.

DROP TABLE IF EXISTS "agent_ratings" CASCADE;

CREATE TABLE IF NOT EXISTS "agent_ratings" (
  "id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "userId" integer NOT NULL,
  "agentId" varchar(100) NOT NULL,
  "agentName" varchar(200) NOT NULL,
  "sessionId" varchar(100),
  "rating" integer NOT NULL,
  "feedback" text,
  "taskType" varchar(100),
  "wasHelpful" boolean,
  "createdAt" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "agent_ratings_userId_idx" ON "agent_ratings" ("userId");
CREATE INDEX IF NOT EXISTS "agent_ratings_agentId_idx" ON "agent_ratings" ("agentId");

-- Also fix api_keys table if it has schema mismatch
DROP TABLE IF EXISTS "api_keys" CASCADE;

CREATE TABLE IF NOT EXISTS "api_keys" (
  "id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "userId" integer NOT NULL,
  "name" varchar(200) NOT NULL,
  "keyHash" varchar(64) NOT NULL,
  "keyPrefix" varchar(20) NOT NULL,
  "scopes" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "lastUsedAt" timestamp,
  "expiresAt" timestamp,
  "isActive" boolean DEFAULT true NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "revokedAt" timestamp
);

CREATE INDEX IF NOT EXISTS "api_keys_userId_idx" ON "api_keys" ("userId");
CREATE INDEX IF NOT EXISTS "api_keys_keyHash_idx" ON "api_keys" ("keyHash");

-- Fix audit_logs table to match schema
DROP TABLE IF EXISTS "audit_logs" CASCADE;

CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "userId" integer,
  "action" varchar(100) NOT NULL,
  "resourceType" varchar(50),
  "resourceId" varchar(100),
  "ipAddress" varchar(45),
  "userAgent" text,
  "metadata" json,
  "severity" text DEFAULT 'info' NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "audit_logs_userId_idx" ON "audit_logs" ("userId");
CREATE INDEX IF NOT EXISTS "audit_logs_severity_idx" ON "audit_logs" ("severity");
