# GitHub Audit Findings

## Key observations:
- 404 commits, main branch, 2 tags
- Last commit: 9cbc3e6 (28 mins ago) - PB-01/02/03 + UI-03 + CD-02/03 + API-04
- README says: Database = Supabase (PostgreSQL), Auth = JWT + OAuth 2.0
- BUT codebase uses: TiDB (MySQL), session-based PIN auth
- README says routing = React Router v6, BUT codebase uses wouter
- 2 FAILED deployments visible in sidebar (red X icons)
- 178 total deployments shown
- .env.backup file committed to repo (security risk)
- DATABASE_URL in .env.example = postgresql:// (Supabase) but actual DB is TiDB MySQL

## Critical discrepancy:
README/docs say Supabase PostgreSQL but actual server code uses TiDB MySQL via Drizzle.
This means either:
1. The database was migrated from Supabase to TiDB but docs not updated
2. Or the app is trying to connect to the wrong database type

## Deployment failures:
2 red X deployments visible - need to check what failed

## Deployment Audit:
- Production last deployed: Feb 15, 2026 (2 weeks ago!) - NOT the latest code
- 180 deployments total, ALL marked as "Failed to deploy to Preview" via Vercel
- The deployments are going to VERCEL (https://the-brain-8cxhrldk3-jonathans-projects-1efbeb08.vercel.app)
- But README says Render.com is the host
- CRITICAL: The GitHub Actions/Vercel integration is broken - all 180 preview deploys failed
- Production environment on Vercel last deployed Feb 15 - means the live site is 2 weeks behind
- The Render auto-deploy from main may be working separately but GitHub shows Vercel integration
