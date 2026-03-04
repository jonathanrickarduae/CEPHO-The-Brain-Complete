# Database Migration Workflow (DB-5)

CEPHO uses **Drizzle ORM** with **drizzle-kit** for version-controlled schema migrations.
All schema changes MUST be made through migration files — never directly in the database.

---

## Migration File Naming Convention

```
drizzle/migrations/{NNN}-{description}.sql
```

Where `NNN` is a zero-padded 3-digit sequence number (e.g., `028`, `029`, `030`).

---

## Creating a New Migration

### Option A: Auto-generate from schema changes (recommended)

```bash
# 1. Edit drizzle/schema.ts with your changes
# 2. Generate the migration SQL
DATABASE_URL="your-connection-string" npx drizzle-kit generate

# 3. Review the generated SQL in drizzle/migrations/
# 4. Apply to the database
DATABASE_URL="your-connection-string" npx drizzle-kit migrate
```

### Option B: Write a manual migration

```bash
# 1. Create a new SQL file with the next sequence number
touch drizzle/migrations/030-your-description.sql

# 2. Write your SQL (use BEGIN/COMMIT, use DO $$ IF NOT EXISTS blocks)
# 3. Apply manually
psql $DATABASE_URL -f drizzle/migrations/030-your-description.sql
```

---

## Running Migrations in CI/CD

The CI pipeline runs migrations automatically on every push to `main`:

```yaml
# In .github/workflows/ci.yml
- name: Run database migrations
  run: DATABASE_URL=${{ secrets.DATABASE_URL }} npx drizzle-kit migrate
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

---

## Migration Best Practices

1. **Always use transactions** — wrap all DDL in `BEGIN; ... COMMIT;`
2. **Use idempotent checks** — use `IF NOT EXISTS` / `DO $$ BEGIN ... END $$` blocks
3. **Never drop columns immediately** — mark as deprecated first, drop in a later migration
4. **Test locally first** — run against a local Postgres instance before pushing
5. **One concern per migration** — keep migrations focused and reversible
6. **Document the purpose** — add a comment block at the top of each migration file

---

## Current Migration History

| # | File | Description |
|---|---|---|
| 004 | `004-innovation-hub-workflow.sql` | Innovation Hub + Workflow tables |
| 005 | `005-digital-twin-training.sql` | Digital Twin Training tables |
| 006 | `006-chief-of-staff-training.sql` | Chief of Staff Training tables |
| 007 | `007-database-optimizations.sql` | Indexes and performance improvements |
| 008 | `008-rls-policies.sql` | Row Level Security policies |
| 020 | `020-email-accounts-and-emails.sql` | Email accounts and email storage |
| 021 | `021-agent-memory-embeddings.sql` | pgvector memory bank |
| 022 | `022-ai-usage-logs.sql` | AI token usage tracking |
| 023 | `023-autonomous-agents-and-sme-triggers.sql` | Autonomous agent framework |
| 024 | `024-victoria-skills-and-qc.sql` | Victoria skills and QC tables |
| 025 | `025-venture-execution-framework.sql` | Venture execution tables |
| 026 | `026-persephone-board-knowledge-corpus.sql` | Persephone board tables |
| 027 | `027-report-schedules-and-prompt-versions.sql` | Report scheduling |
| 028 | `028-additional-fk-constraints.sql` | Additional FK constraints (Phase 10 DB-3) |
| 029 | `029-consolidate-user-profile.sql` | User profile view (Phase 10 DB-4) |

---

## Rollback Strategy

drizzle-kit does not support automatic rollbacks. For each migration, maintain a
corresponding rollback script in `drizzle/rollbacks/`:

```
drizzle/rollbacks/028-rollback.sql
```

Rollback scripts should reverse all changes made in the corresponding migration.
