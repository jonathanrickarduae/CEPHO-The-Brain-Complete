import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.xgoxduebjnlsrljzksvd:DSKmnudqR4sP6giA@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres';

export default defineConfig({
  schema: "./drizzle/schema_pg.ts",
  out: "./drizzle/migrations-pg",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
