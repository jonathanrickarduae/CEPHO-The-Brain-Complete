# Phase 5: Operational Excellence (Target Grade: A)

This phase transforms CEPHO.AI from a working product into an operationally mature, enterprise-grade platform. A world-class engineering team does not just build features — they build the systems, processes, and safeguards that ensure the platform can be operated, maintained, and scaled reliably over time.

## Workstream 15: Architecture & Documentation (OPS-01 to OPS-03)

### OPS-01: Architecture Decision Records (ADRs)

**What:** Create a `/docs/decisions/` folder in GitHub. Every significant technical decision is recorded in a numbered ADR file (e.g., `001-use-trpc-over-rest.md`). Each ADR states: the context, the decision made, the alternatives considered, and the consequences.
**Why:** Prevents the same debates happening twice. New developers understand why the codebase is structured the way it is. Prevents well-intentioned refactors that undo deliberate decisions.
**File:** `/docs/decisions/ADR-TEMPLATE.md`
**Validation:** `ls docs/decisions/*.md | wc -l` — must return at least 10 ADRs covering the major decisions in the codebase.
**Grade Impact:** WS8 (Code & Repo Structure): B → A-

### OPS-02: Operational Runbook

**What:** A `/docs/RUNBOOK.md` file that documents the response procedure for every foreseeable incident:

- Database connection failure
- OpenAI API key exhausted or rate-limited
- Render deployment failure
- Supabase outage
- High error rate alert triggered
- User locked out of account
- S3 storage full
  **Why:** Means anyone on the team can respond to an incident, not just the original developer. Reduces mean time to recovery (MTTR).
  **File:** `/docs/RUNBOOK.md`
  **Validation:** Manual — verify the file exists and covers all 7 scenarios listed above.
  **Grade Impact:** WS12 (Performance): C → B+

### OPS-03: Changelog

**What:** A `CHANGELOG.md` in the GitHub root, updated on every release, following the [Keep a Changelog](https://keepachangelog.com) format. Each entry lists: version number, date, and categorised changes (Added, Changed, Fixed, Removed, Security).
**Why:** Enterprise clients expect to know exactly what changed in each version. Required for any regulated industry deployment.
**File:** `/CHANGELOG.md`
**Validation:** Manual — verify the file exists and has at least one entry with the correct format.
**Grade Impact:** WS9 (Docs): C → B+

---

## Workstream 16: Observability & Monitoring (OPS-04 to OPS-06)

### OPS-04: Structured Logging

**What:** Every API call must be logged with: user ID, endpoint, HTTP method, response status, duration in milliseconds, and timestamp. Use a structured JSON format so logs can be queried and filtered. Implement using `pino` or `winston`.
**Why:** Without structured logs, debugging production issues is guesswork. With them, you can answer "what did user X do in the 5 minutes before this error?" in seconds.
**File:** `server/_core/logger.ts` (new file), imported in `server/setup-middleware.ts`
**Validation:** `curl https://cepho-the-brain-complete.onrender.com/api/trpc/dashboard.getInsights` — check Render logs and verify a JSON log entry appears with all required fields.
**Grade Impact:** WS12 (Performance): C → B

### OPS-05: Metrics Dashboard

**What:** Integrate with Render's built-in metrics or add a lightweight `/api/health` endpoint that returns: uptime, database connection status, API response time (p50/p95), error rate in the last 5 minutes, and active user count.
**Why:** Gives the team a real-time view of platform health. Required for any SLA commitment.
**File:** `server/routes/health.ts` (new file)
**Expected Response:**

```json
{
  "status": "healthy",
  "uptime": 99.98,
  "db": "connected",
  "api_p50_ms": 120,
  "api_p95_ms": 450,
  "error_rate_5m": 0.02,
  "active_users": 3
}
```

**Validation:** `curl https://cepho-the-brain-complete.onrender.com/api/health` — must return a 200 response with all fields populated.
**Grade Impact:** WS12 (Performance): B → A-

### OPS-06: Alerting

**What:** Configure Sentry (or a Render alert) to send a Slack or email notification when: error rate exceeds 5% in a 5-minute window, API response time p95 exceeds 2 seconds, or the database connection fails.
**Why:** The team should know about production issues before users do.
**File:** `server/_core/sentry.ts` (new file), `render.yaml` (add `SENTRY_DSN` env var)
**Validation:** Manually trigger an error in a test environment and verify the Slack/email alert is received within 2 minutes.
**Grade Impact:** WS12 (Performance): A- → A

---

## Workstream 17: Security Hardening (OPS-07 to OPS-08)

### OPS-07: API Rate Limiting Per User

**What:** Implement per-user rate limits on all AI-powered endpoints. Limits:

- Victoria's Briefing generation: 5 per day per user
- AI Agent task execution: 50 per day per user
- Innovation idea generation: 20 per day per user
- Expert chat messages: 200 per day per user
  **Why:** A single user making thousands of requests can exhaust the OpenAI budget in minutes. Rate limiting prevents runaway costs and protects all users.
  **File:** `server/middleware/rate-limiter.ts` (extend existing file)
  **Implementation:** Use `express-rate-limit` with a Redis or in-memory store. Return HTTP 429 with a `Retry-After` header when limit is exceeded.
  **Validation:** `python3 scripts/validate.py --check OPS-07` — sends 6 briefing generation requests and verifies the 6th returns HTTP 429.
  **Grade Impact:** WS1 (Security): B → A-

### OPS-08: Dependency Audit Policy

**What:** Add `npm audit` to the CI/CD pipeline. Any critical or high severity vulnerability must block the deployment. Create a `SECURITY.md` file documenting the policy: critical vulnerabilities must be patched within 24 hours, high within 7 days, medium within 30 days.
**Why:** Outdated dependencies are the most common source of security vulnerabilities. Most teams never audit them until after a breach.
**File:** `.github/workflows/security.yml` (new file), `/SECURITY.md` (new file)
**Validation:** `npm audit --audit-level=high` — must return 0 vulnerabilities at high or critical severity.
**Grade Impact:** WS1 (Security): A- → A

---

## Workstream 18: Data & Compliance (OPS-09 to OPS-10)

### OPS-09: Data Backup & Recovery Plan

**What:** Document and test the Supabase database backup and recovery procedure. Supabase provides automatic daily backups on paid plans. The runbook must include:

1. How to access backups in the Supabase dashboard
2. How to restore a specific table from a backup
3. How to perform a full database restore
4. The RTO (Recovery Time Objective): target < 4 hours
5. The RPO (Recovery Point Objective): target < 24 hours
   **Why:** Most teams never test their backups until they need them — by which point it is too late.
   **File:** `/docs/RUNBOOK.md` (add backup/recovery section)
   **Validation:** Manual — perform a test restore of a single table in a staging environment and document the time taken.
   **Grade Impact:** WS13 (Compliance): D → B

### OPS-10: GDPR Data Deletion Flow

**What:** Implement a "Delete My Account" flow in Settings. When a user deletes their account:

1. All their data is deleted from every Supabase table (cascade delete via foreign keys)
2. Their Supabase Auth account is deleted
3. Their S3 files are deleted
4. A confirmation email is sent
5. The deletion is logged in the audit log
   **Why:** GDPR Article 17 (Right to Erasure) is a legal requirement for any platform serving EU users. Non-compliance carries fines of up to 4% of annual global turnover.
   **File:** `server/routers/auth.router.ts` (add `deleteAccount` mutation), `client/src/pages/Settings.tsx` (add Delete Account button in Profile tab)
   **Validation:** Manual — create a test account, add data, delete the account, and verify all data is removed from Supabase and S3.
   **Grade Impact:** WS13 (Compliance): B → A-

---

## Workstream 19: User Experience (OPS-11 to OPS-12)

### OPS-11: First-Time User Onboarding Flow

**What:** When a user logs in for the first time (detected by checking if `created_at` is within the last 5 minutes), show a guided onboarding wizard:

- **Step 1:** Welcome screen — explain what CEPHO.AI does
- **Step 2:** Connect your first integration (Notion, Google Calendar, or Slack)
- **Step 3:** Set your daily briefing time
- **Step 4:** Run your first Victoria's Briefing
- **Step 5:** Complete — show the Nexus Dashboard with a "You're all set!" message
  **Why:** Without onboarding, new users land on the dashboard and have no idea what to do. Onboarding is the single highest-impact UX improvement for user retention.
  **File:** `client/src/components/onboarding/OnboardingWizard.tsx` (new component), `client/src/App.tsx` (add onboarding check on first render)
  **Validation:** Manual — create a new test account and verify the onboarding wizard appears and all 5 steps work correctly.
  **Grade Impact:** WS11 (Design & UX): D → B

### OPS-12: Granular Error Boundaries & Offline Mode

**What:**
**Error Boundaries:** Every major page section (not just the top-level app) must have its own `ErrorBoundary` component wrapping it. When a section crashes, it shows a "Something went wrong in this section. [Retry]" message instead of blanking the entire page.
**Offline Mode:** Add a service worker that detects when the network is unavailable and shows a persistent banner: "You are offline. Some features may not be available." The banner disappears automatically when the connection is restored.
**File:** `client/src/components/shared/ErrorBoundary.tsx` (extend existing), `client/src/service-worker.ts` (new file)
**Validation:**

- Error boundary: Manually throw an error in a component and verify only that section shows the error, not the whole page.
- Offline mode: In Chrome DevTools, set Network to "Offline" and verify the banner appears within 2 seconds.
  **Grade Impact:** WS4 (Frontend Stability): B → A-

---

## Validation Checklist: Phase 5

| Item ID    | Check Type | Validation Steps                                                           | Pass Criteria                                     |
| :--------- | :--------- | :------------------------------------------------------------------------- | :------------------------------------------------ |
| **OPS-01** | Automated  | `ls docs/decisions/*.md \| wc -l`                                          | Returns ≥ 10                                      |
| **OPS-02** | Manual     | Open `/docs/RUNBOOK.md` and verify all 7 incident scenarios are documented | All 7 scenarios present                           |
| **OPS-03** | Manual     | Open `/CHANGELOG.md` and verify format matches Keep a Changelog standard   | File exists with ≥ 1 entry                        |
| **OPS-04** | Automated  | Make an API call and check Render logs for JSON log entry                  | JSON log with user_id, endpoint, status, duration |
| **OPS-05** | Automated  | `curl .../api/health`                                                      | HTTP 200 with all fields                          |
| **OPS-06** | Manual     | Trigger a test error and verify Slack/email alert received                 | Alert received within 2 minutes                   |
| **OPS-07** | Automated  | `python3 scripts/validate.py --check OPS-07`                               | 6th request returns HTTP 429                      |
| **OPS-08** | Automated  | `npm audit --audit-level=high`                                             | 0 high/critical vulnerabilities                   |
| **OPS-09** | Manual     | Perform test restore in staging                                            | Restore completes in < 4 hours                    |
| **OPS-10** | Manual     | Delete test account and verify all data removed                            | All data deleted from DB and S3                   |
| **OPS-11** | Manual     | Create new account and verify onboarding wizard appears                    | All 5 steps complete successfully                 |
| **OPS-12** | Manual     | Throw error in component; set network offline                              | Error boundary shows; offline banner appears      |
