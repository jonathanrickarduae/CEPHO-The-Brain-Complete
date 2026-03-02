# Observability Strategy

This document outlines the strategy for observing and monitoring the health of the CEPHO.AI platform.

## 1. The FOUR Golden Signals

We will monitor the four golden signals for every service:

*   **Latency:** The time it takes to serve a request.
*   **Traffic:** The amount of demand being placed on the system.
*   **Errors:** The rate of requests that fail.
*   **Saturation:** How "full" the service is (e.g., CPU, memory).

## 2. Service Level Objectives (SLOs)

We will define and track the following SLOs:

| SLO | Target | Time Window |
| :--- | :--- | :--- |
| **Availability** | 99.95% | 30 days |
| **API P95 Latency** | < 200ms | 30 days |
| **API Error Rate** | < 0.1% | 30 days |

## 3. Tooling

*   **Metrics & Dashboards:** We will use **Datadog** as our primary observability platform. It will be used to collect metrics, create dashboards, and set up alerts.
*   **Logging:** All services will emit structured logs (JSON) to stdout. These logs will be collected and indexed by Datadog.
*   **Tracing:** We will use OpenTelemetry to generate distributed traces for all API requests, allowing us to trace a request as it flows through our system.

## 4. Dashboards

We will create the following dashboards in Datadog:

*   **Service Health:** A high-level overview of the four golden signals for each service.
*   **API Performance:** A detailed breakdown of latency and error rates for each API endpoint.
*   **Database Performance:** Key metrics for our Supabase Postgres database (CPU, memory, query performance).
*   **Business KPIs:** A dashboard tracking our key product metrics (WAU, activation, retention).
