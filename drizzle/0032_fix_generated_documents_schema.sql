-- Migration: Fix generated_documents table schema
-- Renames old table and creates new one with correct schema for Document Library

-- Step 1: Rename old table to preserve data
ALTER TABLE IF EXISTS generated_documents RENAME TO generated_documents_old;

-- Step 2: Create new table with correct schema
CREATE TABLE generated_documents (
  id SERIAL PRIMARY KEY,
  "documentId" VARCHAR(100) UNIQUE NOT NULL,
  "userId" INTEGER NOT NULL,
  title VARCHAR(500) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('innovation_brief', 'project_genesis', 'report', 'other')),
  content TEXT,
  classification VARCHAR(50) NOT NULL DEFAULT 'internal' CHECK (classification IN ('public', 'internal', 'confidential', 'restricted')),
  "qaStatus" VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK ("qaStatus" IN ('pending', 'approved', 'rejected')),
  "qaApprovedBy" VARCHAR(200),
  "qaApprovedAt" TIMESTAMP,
  "qaNotes" TEXT,
  "markdownUrl" TEXT,
  "htmlUrl" TEXT,
  "pdfUrl" TEXT,
  "relatedIdeaId" INTEGER,
  "deletedProjectId" INTEGER,
  metadata JSONB,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Step 3: Create indexes for performance
CREATE INDEX idx_generated_documents_user ON generated_documents("userId");
CREATE INDEX idx_generated_documents_type ON generated_documents(type);
CREATE INDEX idx_generated_documents_qa_status ON generated_documents("qaStatus");
CREATE INDEX idx_generated_documents_created_at ON generated_documents("createdAt");

-- Step 4: Create trigger for updatedAt
CREATE OR REPLACE FUNCTION update_generated_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_generated_documents_updated_at
  BEFORE UPDATE ON generated_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_generated_documents_updated_at();

-- Step 5: Add comment
COMMENT ON TABLE generated_documents IS 'AI-generated documents with QA workflow for Document Library feature';
