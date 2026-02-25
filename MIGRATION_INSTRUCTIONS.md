# Database Migration Instructions

## Issue
The Document Library page is failing because the `generated_documents` table doesn't exist in the production database.

## Solution
Run the migration script to create the table.

## Steps to Fix

### Option 1: Run Migration Script (Recommended)
```bash
# Set DATABASE_URL environment variable (get from Render dashboard)
export DATABASE_URL="your_database_url_here"

# Run the migration
./run-migration.sh
```

### Option 2: Manual SQL Execution
1. Connect to your production database
2. Execute the SQL in `drizzle/0031_add_generated_documents.sql`

### Option 3: Use Drizzle Kit (If configured)
```bash
pnpm db:push
# or
pnpm drizzle-kit push:mysql
```

## Migration File
- **File:** `drizzle/0031_add_generated_documents.sql`
- **Purpose:** Creates the `generated_documents` table with proper schema
- **Columns:** Uses production column names (qaApprovedBy, deletedProjectId)

## Verification
After running the migration, the Document Library page should load without errors.

## Notes
- The table uses MySQL syntax (AUTO_INCREMENT, enum types)
- The schema matches the production database expectations
- All columns are properly defined with constraints and defaults
