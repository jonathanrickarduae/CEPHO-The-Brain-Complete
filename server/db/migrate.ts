import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "../../drizzle/schema";

/**
 * Run database migrations
 * This script applies pending migrations to the database
 */
async function runMigrations() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error("❌ DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  console.log("🔄 Starting database migrations...");

  // Create migration client with single connection
  const migrationClient = postgres(connectionString, { max: 1 });
  const db = drizzle(migrationClient, { schema });

  try {
    await migrate(db, { migrationsFolder: "./drizzle/migrations" });
    console.log("✅ Migrations completed successfully");
    await migrationClient.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    await migrationClient.end();
    process.exit(1);
  }
}

runMigrations();
