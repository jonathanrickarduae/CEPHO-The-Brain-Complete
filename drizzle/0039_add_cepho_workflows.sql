-- Migration: Add cepho_workflows and cepho_workflow_steps tables
-- Used by the REST /api/workflows route and WorkflowsPage

CREATE TABLE IF NOT EXISTS "cepho_workflows" (
  "id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "userId" integer NOT NULL,
  "name" varchar(300) NOT NULL,
  "description" text,
  "skillType" varchar(100) NOT NULL DEFAULT 'custom',
  "status" varchar(50) NOT NULL DEFAULT 'active',
  "currentPhase" integer NOT NULL DEFAULT 1,
  "currentStep" integer NOT NULL DEFAULT 1,
  "totalPhases" integer NOT NULL DEFAULT 1,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "cepho_workflow_steps" (
  "id" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "workflowId" integer NOT NULL REFERENCES "cepho_workflows"("id") ON DELETE CASCADE,
  "phase" integer NOT NULL DEFAULT 1,
  "step" integer NOT NULL DEFAULT 1,
  "title" varchar(300) NOT NULL,
  "description" text,
  "status" varchar(50) NOT NULL DEFAULT 'pending',
  "guidance" text,
  "completedAt" timestamp,
  "createdAt" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "cepho_workflows_userId_idx" ON "cepho_workflows" ("userId");
CREATE INDEX IF NOT EXISTS "cepho_workflows_status_idx" ON "cepho_workflows" ("status");
CREATE INDEX IF NOT EXISTS "cepho_workflow_steps_workflowId_idx" ON "cepho_workflow_steps" ("workflowId");
