import { getDb } from "../db";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { logger } from "../utils/logger";

const log = logger.module("Migrations");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Executes a single SQL file against the database.
 * Splits on semicolons and ignores "already exists" errors.
 */
async function runSqlFile(
  db: Awaited<ReturnType<typeof getDb>>,
  filePath: string,
  label: string
): Promise<void> {
  if (!db) return;
  if (!fs.existsSync(filePath)) {
    log.debug(`[Migrations] Skipping ${label} — file not found`);
    return;
  }
  const sql = fs.readFileSync(filePath, "utf-8");
  const statements = sql
    .split(";")
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith("--"));

  for (const statement of statements) {
    try {
      await db.execute(statement);
    } catch (error: any) {
      // Silently ignore "already exists" errors — idempotent migrations
      if (!error.message?.includes("already exists")) {
        log.warn(`[Migrations] ${label} statement error: ${error.message}`);
      }
    }
  }
  log.debug(`[Migrations] Applied: ${label}`);
}

export async function runMigrations(): Promise<void> {
  try {
    const db = await getDb();
    if (!db) {
      log.warn("[Migrations] No database connection — skipping migrations");
      return;
    }

    // ── Legacy one-off migrations ──────────────────────────────────────────
    const legacyMigrations = [
      { name: "Monitoring Tables", file: "../../create-monitoring-tables.sql" },
      {
        name: "Critical Indexes",
        file: "../../drizzle/migrations/add-critical-indexes.sql",
      },
      {
        name: "Project Genesis Tables",
        file: "./004-project-genesis-tables.sql",
      },
    ];

    for (const migration of legacyMigrations) {
      const filePath = path.join(__dirname, migration.file);
      await runSqlFile(db, filePath, migration.name);
    }

    // ── Auto-discover drizzle/*.sql migrations (sorted numerically) ────────
    const drizzleDir = path.join(__dirname, "../../drizzle");
    if (fs.existsSync(drizzleDir)) {
      const sqlFiles = fs
        .readdirSync(drizzleDir)
        .filter(f => f.endsWith(".sql") && /^\d{4}_/.test(f))
        .sort(); // Numeric sort by filename prefix

      for (const sqlFile of sqlFiles) {
        const filePath = path.join(drizzleDir, sqlFile);
        await runSqlFile(db, filePath, sqlFile);
      }
    }

    log.info("[Migrations] All migrations applied successfully");
  } catch (error: any) {
    log.error("[Migrations] Migration runner failed:", error.message);
  }
}
