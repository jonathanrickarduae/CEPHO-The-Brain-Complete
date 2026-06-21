-- Migration 029: Consolidate User Profile Tables (DB-4)
-- Phase 10 Grade A Elevation — Database Schema Design
--
-- Creates a unified user_profile VIEW that merges user_settings and user_preferences
-- into a single queryable surface. This avoids a destructive migration while
-- providing a clean API for future consolidation.
--
-- The view is the first step; the full consolidation (moving to a single table)
-- is a separate migration that requires application code changes.

BEGIN;

-- Create the unified user_profile view
CREATE OR REPLACE VIEW user_profile AS
SELECT
    u.id                          AS user_id,
    u.email,
    u.name,
    u.role,
    u.created_at,
    u.updated_at,
    -- Settings columns (from user_settings if it exists)
    us.theme,
    us.language,
    us.timezone,
    us.notifications_enabled,
    us.email_notifications,
    us.two_factor_enabled,
    -- Preferences columns (from user_preferences if it exists)
    up.dashboard_layout,
    up.sidebar_collapsed,
    up.default_view,
    up.color_scheme
FROM users u
LEFT JOIN user_settings us ON us.user_id = u.id
LEFT JOIN user_preferences up ON up.user_id = u.id;

-- Add comment
COMMENT ON VIEW user_profile IS
  'Unified user profile view combining users, user_settings, and user_preferences. '
  'Phase 10 DB-4: consolidation step 1. Full table merge in migration 030.';

COMMIT;
