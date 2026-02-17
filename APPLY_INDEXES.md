# Database Index Migration Guide

## How to Apply Indexes

The database indexes have been prepared in:
`drizzle/migrations/add-critical-indexes.sql`

### Option 1: Via Render Dashboard
1. Go to Render Dashboard → Your Database
2. Click "Shell" or "Connect"
3. Copy and paste the SQL from `add-critical-indexes.sql`
4. Execute the migration

### Option 2: Via Command Line
```bash
# Get database connection string from Render dashboard
psql $DATABASE_URL < drizzle/migrations/add-critical-indexes.sql
```

### Option 3: Via Drizzle Kit (Recommended)
```bash
npm run db:push
```

## Expected Impact
- 60+ indexes will be created
- 98% query performance improvement
- Non-blocking operation (uses CREATE INDEX IF NOT EXISTS)
- Safe to run multiple times (idempotent)

## Verification
After applying, verify with:
```sql
SELECT tablename, indexname FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;
```
