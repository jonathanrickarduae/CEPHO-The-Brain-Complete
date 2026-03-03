-- Migration 0041: Phase 4 tables
-- Adds workspaces, workspace_members, user_workspace_prefs, push_subscriptions

-- Workspaces
CREATE TABLE IF NOT EXISTS workspaces (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  "isPersonal" BOOLEAN DEFAULT FALSE NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_workspaces_userId ON workspaces("userId");

-- Workspace Members
CREATE TABLE IF NOT EXISTS workspace_members (
  id SERIAL PRIMARY KEY,
  "workspaceId" INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  "userId" INTEGER NOT NULL,
  role VARCHAR(20) DEFAULT 'member' NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  "joinedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_workspace_members_unique ON workspace_members("workspaceId", "userId");
CREATE INDEX IF NOT EXISTS idx_workspace_members_userId ON workspace_members("userId");

-- User Workspace Preferences (tracks active workspace per user)
CREATE TABLE IF NOT EXISTS user_workspace_prefs (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL UNIQUE,
  "activeWorkspaceId" INTEGER REFERENCES workspaces(id) ON DELETE SET NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_workspace_prefs_userId ON user_workspace_prefs("userId");

-- Push Notification Subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  endpoint TEXT NOT NULL,
  "p256dhKey" TEXT NOT NULL,
  "authKey" TEXT NOT NULL,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_userId ON push_subscriptions("userId");
