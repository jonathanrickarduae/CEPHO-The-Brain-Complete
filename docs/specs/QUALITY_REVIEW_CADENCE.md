# Quality Review Cadence

**CEPHO.AI Platform**

_Version: 1.0_
_Status: Draft_
_Last Updated: 2026-03-01_

---

## 1. Overview

This document defines the schedule and process for all recurring quality assurance activities. The goal is to proactively identify and remediate issues rather than waiting for them to become incidents.

---

## 2. Review Cadence Summary

| Cadence       | Review Activity           | Owner               |
| :------------ | :------------------------ | :------------------ |
| **Weekly**    | Code Review Meeting       | Engineering Lead    |
| **Monthly**   | Security Audit            | Security Lead       |
| **Monthly**   | Dependency Audit          | Engineering Lead    |
| **Quarterly** | Disaster Recovery Test    | On-Call Engineer    |
| **Quarterly** | Performance & Cost Review | Engineering Lead    |
| **Annually**  | External Penetration Test | Head of Engineering |

---

## 3. Detailed Processes

### 3.1. Weekly Code Review Meeting

- **When:** Every Friday at 15:00 GMT.
- **Who:** All engineers.
- **Process:**
  1. The Engineering Lead selects 2-3 significant or complex Pull Requests merged during the week.
  2. The original author walks through the code, explaining the approach and trade-offs.
  3. The team discusses alternative approaches and establishes best practices.
  4. This is a learning session, not a gate. The goal is to share knowledge and improve consistency.

### 3.2. Monthly Security Audit

- **When:** The first Monday of every month.
- **Who:** The designated Security Lead.
- **Process:**
  1. Run `pnpm audit --audit-level=high`. Create Jira tickets for any high or critical vulnerabilities.
  2. Run `trufflehog` on the entire repository to scan for any accidentally committed secrets.
  3. Review Supabase access logs for any suspicious activity.
  4. Review Render audit logs for any unauthorized changes.
  5. Document findings in `docs/audits/security/YYYY-MM.md`.

### 3.3. Monthly Dependency Audit

- **When:** The first Monday of every month (can be combined with the security audit).
- **Who:** The Engineering Lead.
- **Process:**
  1. Run `pnpm outdated` to identify stale dependencies.
  2. For any major version updates, create a Jira ticket to investigate and perform the upgrade.
  3. Check for any dependencies that are no longer maintained or have been deprecated.

### 3.4. Quarterly Disaster Recovery Test

- **When:** The first week of each quarter (Jan, Apr, Jul, Oct).
- **Who:** The on-call engineer for that week.
- **Process:**
  1. Follow the `RUNBOOK.md` procedure for restoring a database backup.
  2. Create a temporary new Supabase project.
  3. Restore the latest daily backup to this new project.
  4. Verify the restored data is complete and consistent.
  5. Document the test, including time taken and any issues encountered, in `docs/audits/dr/YYYY-Q_`.md`.
  6. Destroy the temporary Supabase project.

### 3.5. Quarterly Performance & Cost Review

- **When:** The second week of each quarter.
- **Who:** The Engineering Lead.
- **Process:**
  1. Review the metrics dashboard for the previous quarter.
  2. Identify the top 5 slowest API endpoints and top 5 most frequently called endpoints.
  3. Analyze database query performance and identify slow queries.
  4. Review OpenAI API usage and costs. Identify any opportunities for prompt optimization or caching.
  5. Review Render and Supabase costs.
  6. Create Jira tickets for any required performance optimizations.

### 3.6. Annual External Penetration Test

- **When:** Every year in July.
- **Who:** The Head of Engineering.
- **Process:**
  1. Engage a reputable third-party security firm to conduct a full penetration test of the platform.
  2. Provide them with a dedicated test environment and user accounts.
  3. Receive the report from the firm.
  4. Create Jira tickets for all identified vulnerabilities, prioritized by severity.
  5. Ensure all critical and high vulnerabilities are remediated within 30 days.
