import postgres from "postgres";
import { readFileSync } from "fs";

const DATABASE_URL =
  "postgresql://postgres.xgoxduebjnlsrljzksvd:8Y9K8vfPWwsyu5GH@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

const sql = readFileSync(
  "./drizzle/migrations/031-agent1-personal-ai.sql",
  "utf-8"
);

async function run() {
  const client = postgres(DATABASE_URL, { max: 1 });
  try {
    console.log("Running Agent1 migration...");
    await client.unsafe(sql);
    console.log("✅ Agent1 migration completed successfully");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
