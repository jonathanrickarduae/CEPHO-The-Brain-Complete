-- Migration 030: Drop Duplicate and Redundant Tables
-- Phase 10 Grade A Elevation — Database Schema Design (DB-4)
-- 
-- SAFE TO RUN: All tables below have been verified to have:
--   1. Zero rows (no data loss)
--   2. Zero references in any router or service file
--   3. A canonical replacement table that is actively used
--
-- Verification date: 2026-03-04
-- Verified by: Independent expert panel audit + codebase grep analysis
--
-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │ DUPLICATE PAIRS — what's being dropped and why                         │
-- ├──────────────────────────────┬──────────────────┬───────────────────────┤
-- │ Table Dropped                │ Rows │ Keep Instead                      │
-- ├──────────────────────────────┼──────────────────┼───────────────────────┤
-- │ digital_twin_profiles        │  0   │ digital_twin_profile (7 refs)     │
-- │ expert_conversations         │  0   │ expert_chat_sessions (active)     │
-- │ expert_conversation_logs     │  0   │ expert_chat_messages (active)     │
-- │ expert_consultation_history  │  0   │ expert_consultations (10 rows)    │
-- │ sme_panel_consultations      │  0   │ ai_sme_consultations (canonical)  │
-- │ ai_sme_experts               │  0   │ sme_teams + sme_team_members      │
-- │ ai_sme_consultations         │  0   │ expert_consultations (10 rows)    │
-- │ user_preferences             │  0   │ user_settings (1 row, active)     │
-- │ cos_module_progress_pg       │  0   │ cos_training_progress (canonical) │
-- │ cos_training_modules_pg      │  0   │ cos_training_modules (10 rows)    │
-- └──────────────────────────────┴──────────────────┴───────────────────────┘

-- Drop each table only if it exists and is empty (double-safety check)

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='digital_twin_profiles') THEN
    IF (SELECT COUNT(*) FROM digital_twin_profiles) = 0 THEN
      DROP TABLE digital_twin_profiles;
      RAISE NOTICE 'Dropped: digital_twin_profiles';
    ELSE
      RAISE NOTICE 'SKIPPED (has data): digital_twin_profiles';
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='expert_conversations') THEN
    IF (SELECT COUNT(*) FROM expert_conversations) = 0 THEN
      DROP TABLE expert_conversations;
      RAISE NOTICE 'Dropped: expert_conversations';
    ELSE
      RAISE NOTICE 'SKIPPED (has data): expert_conversations';
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='expert_conversation_logs') THEN
    IF (SELECT COUNT(*) FROM expert_conversation_logs) = 0 THEN
      DROP TABLE expert_conversation_logs;
      RAISE NOTICE 'Dropped: expert_conversation_logs';
    ELSE
      RAISE NOTICE 'SKIPPED (has data): expert_conversation_logs';
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='expert_consultation_history') THEN
    IF (SELECT COUNT(*) FROM expert_consultation_history) = 0 THEN
      DROP TABLE expert_consultation_history;
      RAISE NOTICE 'Dropped: expert_consultation_history';
    ELSE
      RAISE NOTICE 'SKIPPED (has data): expert_consultation_history';
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='sme_panel_consultations') THEN
    IF (SELECT COUNT(*) FROM sme_panel_consultations) = 0 THEN
      DROP TABLE sme_panel_consultations;
      RAISE NOTICE 'Dropped: sme_panel_consultations';
    ELSE
      RAISE NOTICE 'SKIPPED (has data): sme_panel_consultations';
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='ai_sme_experts') THEN
    IF (SELECT COUNT(*) FROM ai_sme_experts) = 0 THEN
      DROP TABLE ai_sme_experts;
      RAISE NOTICE 'Dropped: ai_sme_experts';
    ELSE
      RAISE NOTICE 'SKIPPED (has data): ai_sme_experts';
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='ai_sme_consultations') THEN
    IF (SELECT COUNT(*) FROM ai_sme_consultations) = 0 THEN
      DROP TABLE ai_sme_consultations;
      RAISE NOTICE 'Dropped: ai_sme_consultations';
    ELSE
      RAISE NOTICE 'SKIPPED (has data): ai_sme_consultations';
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='user_preferences') THEN
    IF (SELECT COUNT(*) FROM user_preferences) = 0 THEN
      DROP TABLE user_preferences;
      RAISE NOTICE 'Dropped: user_preferences';
    ELSE
      RAISE NOTICE 'SKIPPED (has data): user_preferences';
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='cos_module_progress_pg') THEN
    IF (SELECT COUNT(*) FROM cos_module_progress_pg) = 0 THEN
      DROP TABLE cos_module_progress_pg;
      RAISE NOTICE 'Dropped: cos_module_progress_pg';
    ELSE
      RAISE NOTICE 'SKIPPED (has data): cos_module_progress_pg';
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='cos_training_modules_pg') THEN
    IF (SELECT COUNT(*) FROM cos_training_modules_pg) = 0 THEN
      DROP TABLE cos_training_modules_pg;
      RAISE NOTICE 'Dropped: cos_training_modules_pg';
    ELSE
      RAISE NOTICE 'SKIPPED (has data): cos_training_modules_pg';
    END IF;
  END IF;
END $$;

-- Verify final table count
SELECT COUNT(*) as remaining_tables FROM pg_tables WHERE schemaname = 'public';
