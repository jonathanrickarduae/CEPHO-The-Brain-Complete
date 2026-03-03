# CEPHO.AI — Disaster Recovery & Migration Runbook

**Version:** 1.0 (p5-12/13)
**Owner:** Engineering Lead
**Last Updated:** 2026-03-04
**Classification:** Internal — Engineering

---

## 1. Overview

This document defines the Disaster Recovery (DR) plan and database migration procedures for CEPHO.AI. It covers:

- Recovery objectives (RTO / RPO)
- Automated backup strategy
- Step-by-step recovery procedures for common failure scenarios
- Database migration runbook (Drizzle ORM)
- Environment promotion (staging → production)

---

## 2. Recovery Objectives

| Metric | Target | Notes |
|--------|--------|-------|
| **RTO** (Recovery Time Objective) | ≤ 4 hours | Time to restore full service after a major incident |
| **RPO** (Recovery Point Objective) | ≤ 24 hours | Maximum acceptable data loss window |
| **MTTR** (Mean Time to Recover) | ≤ 2 hours | Target for routine incidents |
| **Availability SLA** | 99.5% | ~3.6 hours downtime/month |

---

## 3. Infrastructure Map

```
┌─────────────────────────────────────────────────────────────┐
│  Production Environment                                      │
│                                                             │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │  Render.com  │    │  TiDB Cloud  │    │  Cloudflare   │  │
│  │  (API + SSR) │◄──►│  (Database)  │    │  (CDN / DNS)  │  │
│  └─────────────┘    └──────────────┘    └───────────────┘  │
│         │                  │                                 │
│         ▼                  ▼                                 │
│  ┌─────────────┐    ┌──────────────┐                        │
│  │  GitHub     │    │  Supabase    │                        │
│  │  (CI/CD)    │    │  (Auth)      │                        │
│  └─────────────┘    └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Automated Backup Strategy

### 4.1 Database Backups

CEPHO uses TiDB Cloud which provides:

- **Automated daily snapshots** — retained for 14 days (TiDB Cloud default)
- **Point-in-time recovery (PITR)** — available on Dedicated tier for up to 7 days
- **Manual snapshots** — triggered via GitHub Actions workflow (`.github/workflows/db-backup.yml`)

The `db-backup.yml` workflow runs daily at 02:00 UTC and:
1. Triggers a TiDB Cloud snapshot via the API
2. Exports a logical dump (SQL) to an S3-compatible bucket
3. Sends a Slack notification on success/failure

### 4.2 Application State Backups

| Asset | Backup Method | Frequency | Retention |
|-------|--------------|-----------|-----------|
| Database (TiDB) | Automated snapshot + logical dump | Daily | 14 days |
| Environment variables | Render.com encrypted secrets | On change | Permanent |
| File uploads (S3) | S3 versioning enabled | Continuous | 90 days |
| Auth sessions (Supabase) | Supabase managed | N/A | Rolling |
| GitHub repository | GitHub + local mirrors | Continuous | Permanent |

---

## 5. Failure Scenarios & Recovery Procedures

### Scenario A: API Server Down (Render.com)

**Symptoms:** 502/503 errors, health check at `/api/health` fails.

**Steps:**
1. Check Render.com dashboard → Services → CEPHO API → Logs
2. If OOM: increase RAM tier in Render settings
3. If crash loop: roll back to previous deploy via Render "Rollback" button
4. If infra issue: check Render status page (status.render.com)
5. Escalate to Render support if no resolution within 30 minutes

**Estimated RTO:** 15–30 minutes

---

### Scenario B: Database Unavailable (TiDB Cloud)

**Symptoms:** `ECONNREFUSED` or `ER_ACCESS_DENIED` errors in server logs.

**Steps:**
1. Check TiDB Cloud console → Cluster status
2. If cluster is paused (free tier auto-pause): resume via console or API
3. If connection string changed: update `DATABASE_URL` in Render environment variables
4. If data corruption suspected: restore from latest snapshot (see §6)
5. Check TiDB Cloud status page for platform-wide incidents

**Estimated RTO:** 5–60 minutes depending on cause

---

### Scenario C: Auth Service Down (Supabase)

**Symptoms:** Login fails, `/api/auth/me` returns 401 for all users.

**Steps:**
1. Check Supabase dashboard → Project health
2. Check Supabase status page (status.supabase.com)
3. If JWT secret rotated: update `SUPABASE_JWT_SECRET` in Render env vars and redeploy
4. If Supabase is down: enable maintenance mode (set `MAINTENANCE_MODE=true` in env)
5. Communicate ETA to users via status page

**Estimated RTO:** 15–45 minutes

---

### Scenario D: Full Data Loss / Catastrophic Failure

**Steps:**
1. Declare incident — notify all engineering team members
2. Spin up a new TiDB Cloud cluster from latest snapshot (see §6)
3. Update `DATABASE_URL` in Render environment variables
4. Run pending migrations: `pnpm db:migrate`
5. Verify data integrity with smoke tests
6. Re-enable traffic and monitor error rates for 30 minutes
7. Conduct post-mortem within 48 hours

**Estimated RTO:** 2–4 hours

---

## 6. Database Restore Procedure

### 6.1 Restore from TiDB Cloud Snapshot

```bash
# 1. Log into TiDB Cloud console
# 2. Navigate to: Clusters → CEPHO Production → Backups
# 3. Select the desired snapshot → "Restore"
# 4. Choose "Restore to new cluster" (safer than overwrite)
# 5. Wait for restore to complete (~10–30 minutes)
# 6. Update DATABASE_URL in Render to point to the new cluster
# 7. Redeploy the API service
```

### 6.2 Restore from Logical Dump (S3)

```bash
# Download the dump from S3
aws s3 cp s3://cepho-backups/db-dumps/latest.sql.gz ./restore.sql.gz
gunzip restore.sql.gz

# Connect to TiDB and restore
mysql -h <TIDB_HOST> -P 4000 -u root -p cepho_prod < restore.sql

# Verify row counts
mysql -h <TIDB_HOST> -P 4000 -u root -p cepho_prod \
  -e "SELECT table_name, table_rows FROM information_schema.tables WHERE table_schema='cepho_prod' ORDER BY table_rows DESC LIMIT 20;"
```

---

## 7. Database Migration Runbook (Drizzle ORM)

### 7.1 Standard Migration Flow

```bash
# 1. Make schema changes in drizzle/schema.ts

# 2. Generate migration files
pnpm db:generate
# This creates a new file in drizzle/migrations/

# 3. Review the generated SQL
cat drizzle/migrations/<timestamp>_<name>.sql

# 4. Apply to staging first
DATABASE_URL=$STAGING_DB_URL pnpm db:migrate

# 5. Smoke test staging

# 6. Apply to production
DATABASE_URL=$PROD_DB_URL pnpm db:migrate

# 7. Verify
pnpm db:studio  # Opens Drizzle Studio for visual inspection
```

### 7.2 Rollback a Migration

Drizzle does not auto-generate rollback scripts. For each migration, maintain a manual rollback:

```bash
# Example: rollback adding a column
mysql -h <TIDB_HOST> -P 4000 -u root -p cepho_prod \
  -e "ALTER TABLE ai_usage_logs DROP COLUMN IF EXISTS error_code;"

# Then delete the migration file from drizzle/migrations/
# and update drizzle/meta/_journal.json to remove the entry
```

### 7.3 Emergency Schema Fix (Zero-Downtime)

For critical production fixes that cannot wait for a full deploy:

```bash
# 1. Connect directly to TiDB
mysql -h <TIDB_HOST> -P 4000 -u root -p cepho_prod

# 2. Apply the fix (example: add missing index)
ALTER TABLE tasks ADD INDEX idx_tasks_user_status (userId, status);

# 3. Document the manual change in a migration file retroactively
# 4. Ensure the migration file matches what was applied manually
```

---

## 8. Environment Promotion (Staging → Production)

```bash
# 1. Ensure all tests pass on staging
gh run list --repo jonathanrickarduae/CEPHO-The-Brain-Complete --limit 5

# 2. Tag the release
git tag v1.x.x -m "Release v1.x.x"
git push origin v1.x.x

# 3. Render auto-deploys from main branch
# OR manually trigger via Render dashboard → Deploy

# 4. Run post-deploy smoke tests
curl -f https://cepho.ai/api/health
curl -f https://cepho.ai/api/trpc/system.ping

# 5. Monitor error rates for 30 minutes via Sentry
```

---

## 9. Incident Communication Template

```
[INCIDENT] CEPHO.AI Service Degradation — <date>

Status: Investigating / Identified / Monitoring / Resolved
Impact: <describe what is affected>
Start Time: <UTC>
Estimated Resolution: <UTC or "TBD">

What happened:
<brief description>

What we are doing:
<current actions>

Next update in: <X minutes>

— CEPHO Engineering Team
```

---

## 10. Post-Incident Review Checklist

- [ ] Timeline documented (detection → resolution)
- [ ] Root cause identified
- [ ] Immediate fix applied and verified
- [ ] Long-term fix planned and ticketed
- [ ] Monitoring/alerting improved to catch this earlier
- [ ] Runbook updated if procedure was unclear
- [ ] Stakeholders notified of resolution
- [ ] Post-mortem doc published within 48 hours

---

## 11. Key Contacts & Escalation

| Role | Responsibility | Contact |
|------|---------------|---------|
| Engineering Lead | Primary incident commander | Internal |
| Database Admin | TiDB / schema issues | Internal |
| DevOps | Render / infra issues | Internal |
| Supabase Support | Auth platform issues | support.supabase.com |
| TiDB Cloud Support | Database platform issues | tidbcloud.com/support |
| Render Support | Hosting platform issues | render.com/support |

---

*This document is a living runbook. Update it after every incident and every major infrastructure change.*
