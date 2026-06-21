-- Migration: Add 2FA (TOTP) fields to users table
-- Remediation Task 1.9: 2FA for Admin Accounts

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "totpSecret" text,
  ADD COLUMN IF NOT EXISTS "totpEnabled" boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "totpVerifiedAt" timestamp,
  ADD COLUMN IF NOT EXISTS "backupCodes" text; -- JSON array of hashed backup codes
