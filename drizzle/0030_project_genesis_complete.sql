-- Project Genesis Complete Schema
-- Main project tracking table with all fields needed by frontend

CREATE TABLE IF NOT EXISTS project_genesis (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('investment', 'partnership', 'acquisition', 'joint_venture', 'other')),
  industry VARCHAR(255),
  description TEXT,
  "targetMarket" TEXT,
  "uniqueValue" TEXT,
  counterparty VARCHAR(255),
  "dealValue" DECIMAL(15,2),
  currency VARCHAR(10) DEFAULT 'USD',
  stage VARCHAR(50) DEFAULT 'discovery',
  status VARCHAR(50) DEFAULT 'active',
  "currentPhase" INTEGER DEFAULT 1,
  "completionPercentage" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project phases tracking
CREATE TABLE IF NOT EXISTS project_genesis_phases (
  id SERIAL PRIMARY KEY,
  "projectId" INTEGER NOT NULL REFERENCES project_genesis(id) ON DELETE CASCADE,
  "phaseNumber" INTEGER NOT NULL,
  "phaseName" VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'blocked')),
  "startedAt" TIMESTAMP,
  "completedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("projectId", "phaseNumber")
);

-- Project milestones
CREATE TABLE IF NOT EXISTS project_genesis_milestones (
  id SERIAL PRIMARY KEY,
  "projectId" INTEGER NOT NULL REFERENCES project_genesis(id) ON DELETE CASCADE,
  "phaseId" INTEGER REFERENCES project_genesis_phases(id) ON DELETE CASCADE,
  "milestoneName" VARCHAR(255) NOT NULL,
  description TEXT,
  "dueDate" DATE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  "completedAt" TIMESTAMP,
  "completedBy" INTEGER REFERENCES users(id),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project deliverables
CREATE TABLE IF NOT EXISTS project_genesis_deliverables (
  id SERIAL PRIMARY KEY,
  "projectId" INTEGER NOT NULL REFERENCES project_genesis(id) ON DELETE CASCADE,
  "phaseId" INTEGER REFERENCES project_genesis_phases(id) ON DELETE CASCADE,
  "deliverableName" VARCHAR(255) NOT NULL,
  "deliverableType" VARCHAR(100),
  description TEXT,
  "fileUrl" TEXT,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'rejected')),
  "reviewNotes" TEXT,
  "createdBy" INTEGER REFERENCES users(id),
  "reviewedBy" INTEGER REFERENCES users(id),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_genesis_user ON project_genesis("userId");
CREATE INDEX IF NOT EXISTS idx_project_genesis_status ON project_genesis(status);
CREATE INDEX IF NOT EXISTS idx_project_genesis_phases_project ON project_genesis_phases("projectId");
CREATE INDEX IF NOT EXISTS idx_project_genesis_milestones_project ON project_genesis_milestones("projectId");
CREATE INDEX IF NOT EXISTS idx_project_genesis_deliverables_project ON project_genesis_deliverables("projectId");

-- Add comments for documentation
COMMENT ON TABLE project_genesis IS 'Main Project Genesis tracking table for 6-phase venture development';
COMMENT ON TABLE project_genesis_phases IS 'Tracks progress through 6 phases: Initiation, Deep Dive, Business Plan, Expert Review, Quality Gate, Execution';
COMMENT ON TABLE project_genesis_milestones IS 'Key milestones within each phase';
COMMENT ON TABLE project_genesis_deliverables IS 'Documents and deliverables produced in each phase';
