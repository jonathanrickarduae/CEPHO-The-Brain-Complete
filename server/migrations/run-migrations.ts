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

    // Migration files to run
    const migrations = [
      { name: 'Monitoring Tables', file: '../../create-monitoring-tables.sql' },
      { name: 'Critical Indexes', file: '../../drizzle/migrations/add-critical-indexes.sql' }
    ];

    for (const migration of migrations) {
      try {
        const migrationPath = path.join(__dirname, migration.file);
        
        // Check if file exists
        if (!fs.existsSync(migrationPath)) {
          console.log(`[Migrations] ⊘ Skipped (not found): ${migration.name}`);
          continue;
        }

        const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
        
        // Split by semicolon and execute each statement
        const statements = migrationSQL
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0);

        console.log(`[Migrations] Running: ${migration.name} (${statements.length} statements)`);

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

        console.log(`[Migrations] ✅ Completed: ${migration.name}`);
      } catch (error: any) {
        console.error(`[Migrations] Failed to run ${migration.name}:`, error.message);
      }
    }

    console.log('[Migrations] ✅ Migrations complete');
  } catch (error: any) {
    console.error('[Migrations] Failed to run migrations:', error.message);
  }
}
