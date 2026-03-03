import { Client } from "pg";

export async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    return;
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : undefined,
  });

  try {
    await client.connect();

    // Create conversations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
        content TEXT NOT NULL,
        metadata JSONB,
        "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    // Create index for faster queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_conversations_userId 
      ON conversations("userId");
    `);

    // Create users table if needed
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        "openId" VARCHAR(64) NOT NULL UNIQUE,
        name TEXT,
        email VARCHAR(320),
        "loginMethod" VARCHAR(64),
        role VARCHAR(20) DEFAULT 'user' NOT NULL CHECK (role IN ('user', 'admin')),
        "themePreference" VARCHAR(20) DEFAULT 'dark' NOT NULL CHECK ("themePreference" IN ('light', 'dark', 'system')),
        "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
        "lastSignedIn" TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    // Phase 4: Workspaces
    await client.query(`
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
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_workspaces_userId ON workspaces("userId");
    `);

    // Phase 4: Workspace Members
    await client.query(`
      CREATE TABLE IF NOT EXISTS workspace_members (
        id SERIAL PRIMARY KEY,
        "workspaceId" INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
        "userId" INTEGER NOT NULL,
        role VARCHAR(20) DEFAULT 'member' NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
        "joinedAt" TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_workspace_members_unique ON workspace_members("workspaceId", "userId");
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_workspace_members_userId ON workspace_members("userId");
    `);

    // Phase 4: User Workspace Preferences
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_workspace_prefs (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL UNIQUE,
        "activeWorkspaceId" INTEGER REFERENCES workspaces(id) ON DELETE SET NULL,
        "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_workspace_prefs_userId ON user_workspace_prefs("userId");
    `);

    // Phase 4: Push Notification Subscriptions
    await client.query(`
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
    `);

    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_push_subscriptions_userId ON push_subscriptions("userId");
    `);
  } catch (error: unknown) {
    if (error instanceof Error) {
    } else {
    }
    // Don't throw - allow app to start even if migrations fail
  } finally {
    await client.end();
  }
}
