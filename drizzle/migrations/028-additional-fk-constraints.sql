-- Migration 028: Additional FK Constraints (DB-3)
-- Phase 10 Grade A Elevation — Database Schema Design
-- Adds FK constraints for remaining entity relationships
-- All constraints use ON DELETE CASCADE or ON DELETE SET NULL as appropriate
-- Run: psql $DATABASE_URL -f drizzle/migrations/028-additional-fk-constraints.sql

BEGIN;

-- ── Audit logs ───────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_audit_logs_user_id'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE audit_logs
      ADD CONSTRAINT fk_audit_logs_user_id
      FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ── Notifications ────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_notifications_user_id'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE notifications
      ADD CONSTRAINT fk_notifications_user_id
      FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ── AI usage logs ────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_ai_usage_logs_user_id'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE ai_usage_logs
      ADD CONSTRAINT fk_ai_usage_logs_user_id
      FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ── Documents ────────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_documents_user_id'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE documents
      ADD CONSTRAINT fk_documents_user_id
      FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ── Workflows ────────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_workflows_user_id'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE workflows
      ADD CONSTRAINT fk_workflows_user_id
      FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ── KPI entries ──────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_kpi_entries_user_id'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE kpi_entries
      ADD CONSTRAINT fk_kpi_entries_user_id
      FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ── OKR entries ──────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_okr_entries_user_id'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE okr_entries
      ADD CONSTRAINT fk_okr_entries_user_id
      FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ── Agent sessions ───────────────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_agent_sessions_user_id'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE agent_sessions
      ADD CONSTRAINT fk_agent_sessions_user_id
      FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ── Memory bank ──────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_memory_bank_user_id'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE memory_bank
      ADD CONSTRAINT fk_memory_bank_user_id
      FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ── Report schedules ─────────────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_report_schedules_user_id'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE report_schedules
      ADD CONSTRAINT fk_report_schedules_user_id
      FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

COMMIT;

-- Verify
SELECT COUNT(*) as total_fk_constraints
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY'
AND table_schema = 'public';
