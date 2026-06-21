-- Create project_genesis table
CREATE TABLE IF NOT EXISTS project_genesis (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  name TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'other',
  industry TEXT DEFAULT '',
  stage VARCHAR(50) DEFAULT 'discovery',
  status VARCHAR(50) DEFAULT 'active',
  counterparty TEXT,
  "dealValue" DECIMAL(15, 2),
  currency VARCHAR(10) DEFAULT 'USD',
  description TEXT,
  "targetMarket" TEXT DEFAULT '',
  "uniqueValue" TEXT DEFAULT '',
  "currentPhase" INTEGER DEFAULT 1,
  "completionPercentage" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create index on userId for faster queries
CREATE INDEX IF NOT EXISTS idx_project_genesis_userId 
ON project_genesis("userId");

-- Create project_genesis_phases table
CREATE TABLE IF NOT EXISTS project_genesis_phases (
  id SERIAL PRIMARY KEY,
  "projectId" INTEGER NOT NULL REFERENCES project_genesis(id) ON DELETE CASCADE,
  "phaseNumber" INTEGER NOT NULL,
  "phaseName" TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'not_started',
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE("projectId", "phaseNumber")
);

-- Create project_genesis_milestones table
CREATE TABLE IF NOT EXISTS project_genesis_milestones (
  id SERIAL PRIMARY KEY,
  "projectId" INTEGER NOT NULL REFERENCES project_genesis(id) ON DELETE CASCADE,
  "phaseNumber" INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  "dueDate" TIMESTAMP,
  "completedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create project_genesis_deliverables table
CREATE TABLE IF NOT EXISTS project_genesis_deliverables (
  id SERIAL PRIMARY KEY,
  "projectId" INTEGER NOT NULL REFERENCES project_genesis(id) ON DELETE CASCADE,
  "phaseNumber" INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending',
  "fileUrl" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_genesis_phases_projectId 
ON project_genesis_phases("projectId");

CREATE INDEX IF NOT EXISTS idx_project_genesis_milestones_projectId 
ON project_genesis_milestones("projectId");

CREATE INDEX IF NOT EXISTS idx_project_genesis_deliverables_projectId 
ON project_genesis_deliverables("projectId");
