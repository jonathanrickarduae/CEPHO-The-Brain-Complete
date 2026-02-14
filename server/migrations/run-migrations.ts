import { getDb } from '../db';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations(): Promise<void> {
  console.log('[Migrations] Starting database migrations...');
  
  try {
    const db = await getDb();
    if (!db) {
      console.error('[Migrations] Database not available');
      return;
    }

    // Read and execute monitoring tables migration
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '../../create-monitoring-tables.sql'),
      'utf-8'
    );

    // Split by semicolon and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      try {
        await db.execute(statement);
        console.log(`[Migrations] ✓ Executed: ${statement.substring(0, 50)}...`);
      } catch (error: any) {
        // Ignore "already exists" errors
        if (error.message?.includes('already exists')) {
          console.log(`[Migrations] ⊘ Skipped (exists): ${statement.substring(0, 50)}...`);
        } else {
          console.error(`[Migrations] ✗ Failed: ${statement.substring(0, 50)}...`);
          console.error(`[Migrations] Error: ${error.message}`);
        }
      }
    }

    console.log('[Migrations] ✅ Migrations complete');
  } catch (error: any) {
    console.error('[Migrations] Failed to run migrations:', error.message);
  }
}
