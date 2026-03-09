-- Migration 0044: Add missing columns to project_genesis_phases
-- The schema.ts has assignedTeam, deliverables, notes, metadata columns
-- but the original 0030 migration didn't include them.
-- Using IF NOT EXISTS pattern for idempotency.

ALTER TABLE project_genesis_phases
  ADD COLUMN IF NOT EXISTS "assignedTeam" JSON,
  ADD COLUMN IF NOT EXISTS "deliverables" JSON,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSON;
