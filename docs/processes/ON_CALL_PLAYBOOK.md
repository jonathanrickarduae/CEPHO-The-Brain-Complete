# On-Call & Incident Management Playbook

This document defines the process for responding to and managing incidents on the CEPHO.AI platform.

## 1. On-Call Rotation

*   **Schedule:** A weekly on-call rotation will be established, with one primary and one secondary engineer on call at all times.
*   **Tool:** We will use **PagerDuty** to manage the on-call schedule and alerting.
*   **Responsibilities:** The on-call engineer is responsible for acknowledging alerts, assessing the impact, and either resolving the issue or escalating it.

## 2. Severity Levels (SEVs)

Incidents are classified into three severity levels:

| Level | Description | Response Time | Resolution Target |
| :--- | :--- | :--- | :--- |
| **SEV1** | Critical impact. Platform is down, major data loss, or security breach. | **< 5 minutes** | **< 1 hour** |
| **SEV2** | Major impact. A core feature is broken for a large number of users. | **< 15 minutes** | **< 4 hours** |
| **SEV3** | Minor impact. A non-critical feature is broken or a bug is affecting a small number of users. | **< 1 hour** | **< 24 hours** |

## 3. Incident Response Process

1.  **Alert:** An automated alert is triggered by our monitoring systems (e.g., Datadog, Grafana) and sent to PagerDuty.
2.  **Acknowledge:** The on-call engineer acknowledges the alert in PagerDuty.
3.  **Assess & Triage:** The engineer assesses the impact and declares a severity level (SEV1, SEV2, or SEV3).
4.  **Communicate:** A dedicated `#incidents` Slack channel is used for all communication. For SEV1 incidents, a status page is updated.
5.  **Resolve:** The engineer works to resolve the issue, escalating to the secondary on-call or other subject matter experts as needed.
6.  **Post-mortem:** For all SEV1 and SEV2 incidents, a blameless post-mortem is conducted within 48 hours. The post-mortem documents the root cause, impact, and action items to prevent recurrence.
