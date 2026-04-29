-- ============================================================
-- Agent1 Personal AI System — Database Migration
-- Adds all tables required for the Agent1 module:
--   agent1_messages, agent1_identity_profiles, agent1_decision_log,
--   agent1_training_progress, agent1_reflections, agent1_settings
-- ============================================================

-- ─── Agent1 Chat Messages ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agent1_messages (
  id          BIGSERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content     TEXT NOT NULL,
  operating_mode TEXT,
  response_level TEXT CHECK (response_level IN ('Simple', 'Practical', 'Full')),
  council_data JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS agent1_messages_user_id_idx ON agent1_messages(user_id);
CREATE INDEX IF NOT EXISTS agent1_messages_created_at_idx ON agent1_messages(created_at);

-- ─── Agent1 Identity Profiles ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agent1_identity_profiles (
  id                   BIGSERIAL PRIMARY KEY,
  user_id              INTEGER NOT NULL UNIQUE,
  identity_md          TEXT,
  values_md            TEXT,
  relationships_md     TEXT,
  preferences_md       TEXT,
  onboarding_complete  BOOLEAN DEFAULT FALSE NOT NULL,
  created_at           TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at           TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── Agent1 Decision Log ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agent1_decision_log (
  id                  BIGSERIAL PRIMARY KEY,
  user_id             INTEGER NOT NULL,
  date                TEXT NOT NULL,
  decision            TEXT NOT NULL,
  options_considered  JSONB NOT NULL DEFAULT '[]',
  chosen              TEXT NOT NULL,
  reasons             JSONB NOT NULL DEFAULT '[]',
  tolerance           TEXT NOT NULL CHECK (tolerance IN ('low', 'medium', 'high')),
  what_id_change      TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS agent1_decision_log_user_id_idx ON agent1_decision_log(user_id);
CREATE INDEX IF NOT EXISTS agent1_decision_log_date_idx ON agent1_decision_log(date);

-- ─── Agent1 Training Progress ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agent1_training_progress (
  id            BIGSERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL,
  phase         TEXT NOT NULL CHECK (phase IN ('foundation', 'sharpening')),
  day_or_week   INTEGER NOT NULL,
  completed     BOOLEAN DEFAULT FALSE NOT NULL,
  notes         TEXT,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS agent1_training_progress_user_id_idx ON agent1_training_progress(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS agent1_training_progress_unique ON agent1_training_progress(user_id, phase, day_or_week);

-- ─── Agent1 Reflections (Weekly Self-Improvement) ─────────────────────────
CREATE TABLE IF NOT EXISTS agent1_reflections (
  id              BIGSERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL,
  week_start      TEXT NOT NULL,
  well_done       JSONB,
  missed          JSONB,
  proposed_patch  TEXT,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  reviewed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS agent1_reflections_user_id_idx ON agent1_reflections(user_id);
CREATE INDEX IF NOT EXISTS agent1_reflections_week_start_idx ON agent1_reflections(week_start);

-- ─── Agent1 Settings ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agent1_settings (
  id                        BIGSERIAL PRIMARY KEY,
  user_id                   INTEGER NOT NULL UNIQUE,
  default_response_level    TEXT DEFAULT 'Practical' CHECK (default_response_level IN ('Simple', 'Practical', 'Full')),
  default_operating_mode    TEXT DEFAULT 'Life Optimiser',
  system_prompt_patch       TEXT,
  show_council_by_default   BOOLEAN DEFAULT FALSE NOT NULL,
  created_at                TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at                TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
