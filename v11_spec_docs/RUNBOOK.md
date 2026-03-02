# Runbook

**CEPHO.AI Platform Operations**

*Version: 1.0*
*Status: Draft*
*Last Updated: 2026-03-01*

---

## 1. Introduction

This runbook provides step-by-step procedures for handling common operational incidents and alerts. The goal is to enable any on-call engineer to quickly diagnose and resolve issues, even without deep prior knowledge of the system.

---

## 2. On-Call Rotation

- **Primary On-Call:** [Name]
- **Secondary On-Call:** [Name]
- **Rotation Schedule:** Weekly, handover on Monday at 10:00 GMT.

---

## 3. Incident Response Flow

1. **Alert Received:** An alert fires in PagerDuty / Slack.
2. **Acknowledge:** The on-call engineer acknowledges the alert in PagerDuty within 15 minutes.
3. **Diagnose:** Use this runbook and the observability stack (Sentry, logs, metrics) to identify the root cause.
4. **Resolve:** Apply the appropriate runbook procedure to resolve the incident.
5. **Communicate:** Update the status page and notify stakeholders if the incident is user-facing.
6. **Post-Mortem:** For any critical incident (P1), a post-mortem must be conducted within 5 business days.

---

## 4. Runbook Procedures

### 4.1. P1: Site is Down (HTTP 5xx errors)

- **Symptom:** PagerDuty alert fires: "High 5xx Error Rate". Users report the site is inaccessible.
- **Diagnosis:**
  1. Check the Render dashboard for the `cepho-production` service. Is it crashing or restarting?
  2. Check Sentry for any new fatal errors in the last 30 minutes.
  3. Check the server logs in Render for any obvious error messages (`panic`, `unhandledRejection`).
- **Resolution:**
  1. **If the service is crash-looping:** Immediately roll back to the previous stable deployment via the Render dashboard.
  2. **If a specific tRPC procedure is failing:** Use the feature flag system (LaunchDarkly) to disable the associated feature.
  3. **If the database is down:** See Runbook 4.2.
  4. **If the issue is unclear:** Escalate to the secondary on-call engineer.

### 4.2. P1: Database is Down

- **Symptom:** PagerDuty alert fires: "Cannot connect to database". All API requests fail with a database connection error.
- **Diagnosis:**
  1. Check the Supabase status page: [status.supabase.com](https://status.supabase.com/). Is there a global outage?
  2. Check the Supabase dashboard for the project. Are there any alerts or performance issues?
  3. Can you connect to the database directly using `psql` from your local machine?
- **Resolution:**
  1. **If Supabase is having a global outage:** Update the status page to inform users and wait for Supabase to resolve the issue.
  2. **If the project-specific database is down:** Contact Supabase support immediately.
  3. **If the database credentials have been rotated and not updated in Render:** Update the `DATABASE_URL` environment variable in Render and redeploy.
  4. **If the connection pool is exhausted:** Restart the Render service to clear connections. Investigate the cause of the leak in a post-mortem.

### 4.3. P2: OpenAI API Key Exhausted or Invalid

- **Symptom:** PagerDuty alert fires: "High rate of OpenAI API errors". AI-powered features (briefings, agents) are failing.
- **Diagnosis:**
  1. Check the OpenAI dashboard: [platform.openai.com/usage](https://platform.openai.com/usage). Has the monthly budget been exhausted?
  2. Check Sentry for `401 Unauthorized` or `429 Rate Limit Exceeded` errors from the OpenAI API.
- **Resolution:**
  1. **If the budget is exhausted:** Increase the monthly budget in the OpenAI dashboard.
  2. **If the API key has been revoked or expired:** Generate a new API key in the OpenAI dashboard and update the `OPENAI_API_KEY` environment variable in Render. Redeploy the service.

### 4.4. P2: Daily Cron Jobs Failing

- **Symptom:** PagerDuty alert fires: "Cron Job [job_name] failed to run". Victoria's Briefing or Evening Review is not generated.
- **Diagnosis:**
  1. Check the logs for the specific cron job in the Render dashboard.
  2. Look for errors in the tRPC procedures called by the cron job (e.g., `victoriaBriefing.generatePdf`).
  3. Was there a deployment around the time the job was supposed to run?
- **Resolution:**
  1. **If the error is in the code:** A hotfix deployment is required. Escalate to the relevant developer.
  2. **If the job failed due to a transient issue (e.g., temporary API outage):** Manually trigger the job to run again via the internal admin dashboard (to be built in Phase 4).

### 4.5. P3: A Specific Feature is Broken

- **Symptom:** User reports a specific feature is not working as expected (e.g., "I can't connect my Notion account").
- **Diagnosis:**
  1. Attempt to reproduce the issue on the staging environment.
  2. Check Sentry for any related errors for that user or feature.
  3. Check the server logs for any relevant error messages.
- **Resolution:**
  1. **If the feature is critical:** Disable it using the feature flag system (LaunchDarkly).
  2. **If the feature is non-critical:** Create a high-priority bug ticket in Jira with all diagnostic information.
  3. Communicate the status and workaround (if any) to the user.
