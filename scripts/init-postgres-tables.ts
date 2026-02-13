import { Client } from 'pg';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.production') });

async function initTables() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');

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
    console.log('✓ conversations table created');

    // Create index for faster queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_conversations_userId 
      ON conversations("userId");
    `);
    console.log('✓ conversations index created');

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
    console.log('✓ users table created');

    console.log('\n✅ All tables initialized successfully!');
  } catch (error) {
    console.error('Error initializing tables:', error);
    throw error;
  } finally {
    await client.end();
  }
}

initTables().catch(console.error);
