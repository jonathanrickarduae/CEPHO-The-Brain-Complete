# Incident Response Process

**CEPHO.AI Platform**

*Version: 1.0*
*Status: Draft*
*Last Updated: 2026-03-01*

---

## 1. Overview

This document defines the process for responding to and managing security and operational incidents. The goal is to minimize impact, restore service quickly, and learn from every incident.

---

## 2. Incident Severity Levels

| Level | Name | Description | Response Time |
| :--- | :--- | :--- | :--- |
| **P1** | Critical | Site is down, data loss, security breach. | 15 minutes |
| **P2** | High | Core feature is broken for all users. | 1 hour |
| **P3** | Medium | Non-critical feature is broken, or a core feature is broken for a subset of users. | 8 hours |
| **P4** | Low | Minor bug, cosmetic issue. | 24 hours |

---

## 3. The Incident Lifecycle

### Step 1: Detection & Alerting

- Incidents are detected via:
  - Automated alerts from PagerDuty (via Sentry, metrics, health checks).
  - User reports via email or chat.
  - Internal discovery by an employee.
- The on-call engineer is automatically paged for P1 and P2 incidents.

### Step 2: Triage & Declaration

1. The on-call engineer is the **Incident Commander**.
2. They acknowledge the alert in PagerDuty.
3. They assess the impact and assign a severity level (P1-P4).
4. They create a dedicated Slack channel for the incident: `#incident-YYYY-MM-DD-<description>`.
5. They start a Google Meet for the incident response team.

### Step 3: Diagnosis & Resolution

1. The Incident Commander uses the `RUNBOOK.md` to diagnose the issue.
2. They delegate tasks to other engineers as needed (e.g., "check the database logs").
3. They provide regular updates in the Slack channel every 15 minutes.
4. Once the root cause is identified, they apply the fix (e.g., rollback deployment, disable feature flag, restart service).

### Step 4: Communication

1. For P1 and P2 incidents, the Incident Commander must update the public status page ([status.cepho.ai](https://status.cepho.ai)) at the start, middle, and end of the incident.
2. Customer support is notified to handle user inquiries.

### Step 5: Post-Mortem

1. For every P1 incident, a blameless post-mortem must be conducted within 5 business days.
2. The post-mortem document must include:
   - Timeline of the incident
   - Root cause analysis (the "Five Whys")
   - Impact on users and business
   - Action items to prevent recurrence, with owners and due dates.
3. The post-mortem is reviewed by the entire engineering team.

---

## 4. On-Call Responsibilities

- Acknowledge alerts within the defined response time.
- Act as Incident Commander.
- Follow the runbook procedures.
- Escalate to the secondary on-call if unable to resolve the issue within 1 hour.
- Hand over active incidents to the next on-call engineer at the end of your shift.
