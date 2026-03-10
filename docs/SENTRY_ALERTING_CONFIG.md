# Sentry Alerting Configuration (OR-5)

This document defines the recommended Sentry alert rules for CEPHO production monitoring.
Configure these rules in the [Sentry dashboard](https://sentry.io) under **Alerts → Alert Rules**.

---

## 1. Critical Error Rate Alert

**Trigger:** Any new unhandled exception in production.

| Setting     | Value                         |
| ----------- | ----------------------------- |
| Environment | `production`                  |
| Condition   | `An event is seen`            |
| Filter      | `level: error`                |
| Action      | Email + Slack `#cepho-alerts` |
| Frequency   | `Notify once per issue`       |

---

## 2. Error Volume Spike Alert

**Trigger:** Error rate exceeds 10 events per minute (sustained spike).

| Setting     | Value                         |
| ----------- | ----------------------------- |
| Environment | `production`                  |
| Metric      | `Number of errors`            |
| Threshold   | `> 10 per minute`             |
| Time window | `5 minutes`                   |
| Action      | Email + Slack `#cepho-alerts` |

---

## 3. Performance Regression Alert

**Trigger:** p95 transaction duration exceeds 3 seconds.

| Setting     | Value                       |
| ----------- | --------------------------- |
| Environment | `production`                |
| Metric      | `p95(transaction.duration)` |
| Threshold   | `> 3000ms`                  |
| Time window | `10 minutes`                |
| Action      | Email                       |

---

## 4. Apdex Score Drop Alert

**Trigger:** Apdex score drops below 0.8 (user satisfaction degradation).

| Setting     | Value                         |
| ----------- | ----------------------------- |
| Environment | `production`                  |
| Metric      | `apdex(300)`                  |
| Threshold   | `< 0.8`                       |
| Time window | `15 minutes`                  |
| Action      | Email + Slack `#cepho-alerts` |

---

## 5. New Issue Alert (First Occurrence)

**Trigger:** A new issue type is seen for the first time.

| Setting     | Value                    |
| ----------- | ------------------------ |
| Environment | `production`             |
| Condition   | `A new issue is created` |
| Action      | Email                    |
| Frequency   | `Notify once per issue`  |

---

## 6. Regression Alert

**Trigger:** A previously resolved issue reappears.

| Setting     | Value                                                 |
| ----------- | ----------------------------------------------------- |
| Environment | `production`                                          |
| Condition   | `The issue changes state from resolved to unresolved` |
| Action      | Email + Slack `#cepho-alerts`                         |

---

## Setup Steps

1. Log in to [sentry.io](https://sentry.io) and navigate to your CEPHO project.
2. Go to **Alerts → Alert Rules → Create Alert Rule**.
3. Create each rule above using the settings specified.
4. Configure the Slack integration under **Settings → Integrations → Slack** and connect the `#cepho-alerts` channel.
5. Set `SENTRY_DSN` and `VITE_SENTRY_DSN` in the Render dashboard (see `render.yaml`).

---

## Sentry SDK Configuration Reference

The Sentry SDK is configured in `server/services/monitoring/error-tracker.service.ts`.

Key settings:

- `tracesSampleRate: 0.1` in production (10% of transactions sampled for performance monitoring)
- `ignoreErrors`: filters out non-actionable browser errors
- `beforeSend`: strips cookies and auth headers from error reports
