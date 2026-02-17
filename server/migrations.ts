import { Client } from 'pg';

export async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    console.log('[Migrations] No DATABASE_URL, skipping migrations');
    return;
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  });

  try {
    await client.connect();
    console.log('[Migrations] Connected to PostgreSQL database');

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
    console.log('[Migrations] ✓ conversations table ready');

    // Create index for faster queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_conversations_userId 
      ON conversations("userId");
    `);
    console.log('[Migrations] ✓ conversations index ready');

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
    console.log('[Migrations] ✓ users table ready');

    console.log('[Migrations] ✅ All migrations completed successfully!');
  } catch (error: any) {
    console.error('[Migrations] Error running migrations:', error.message);
    // Don't throw - allow app to start even if migrations fail
  } finally {
    await client.end();
  }
}
