-- Create workflow tables in PostgreSQL
CREATE TABLE IF NOT EXISTS cepho_workflows (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  "skillType" VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'not_started',
  "currentPhase" VARCHAR(100),
  "currentStep" VARCHAR(100),
  data JSONB,
  metadata JSONB,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "completedAt" TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cepho_workflow_steps (
  id SERIAL PRIMARY KEY,
  "workflowId" INTEGER NOT NULL,
  "stepNumber" INTEGER NOT NULL,
  "stepName" VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  data JSONB,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "completedAt" TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cepho_workflow_validations (
  id SERIAL PRIMARY KEY,
  "workflowId" INTEGER NOT NULL,
  "stepId" INTEGER,
  "validationType" VARCHAR(100) NOT NULL,
  result VARCHAR(50) NOT NULL,
  message TEXT,
  details JSONB,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cepho_workflows_status ON cepho_workflows(status);
CREATE INDEX IF NOT EXISTS idx_cepho_workflows_skill_type ON cepho_workflows("skillType");
CREATE INDEX IF NOT EXISTS idx_cepho_workflow_steps_workflow_id ON cepho_workflow_steps("workflowId");
CREATE INDEX IF NOT EXISTS idx_cepho_workflow_validations_workflow_id ON cepho_workflow_validations("workflowId");
