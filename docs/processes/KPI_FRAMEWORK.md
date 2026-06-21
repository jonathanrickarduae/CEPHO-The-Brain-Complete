# Product Metrics & KPI Framework

This document defines the key metrics and Key Performance Indicators (KPIs) that will be used to measure the success of the CEPHO.AI platform.

## 1. North Star Metric

Our North Star Metric is **Weekly Active Users (WAU)**. An active user is defined as any user who logs in and completes at least one meaningful action (e.g., processes an email, completes a task, generates a document) within a 7-day period.

## 2. Key Performance Indicators (KPIs)

Our success will be measured by the following KPIs, which are direct inputs to our North Star Metric.

| Category         | KPI                      | Definition                                                                                                     | Target  |
| :--------------- | :----------------------- | :------------------------------------------------------------------------------------------------------------- | :------ |
| **Activation**   | New User Activation Rate | % of new signups who complete the onboarding flow and perform one meaningful action within their first 3 days. | 60%     |
| **Engagement**   | Task Completion Rate     | % of tasks created that are marked as "Done".                                                                  | 80%     |
| **Engagement**   | AI Agent Usage           | Average number of AI agent interactions per active user per week.                                              | 5       |
| **Retention**    | Week 1 Retention         | % of new users who return in their second week.                                                                | 40%     |
| **Retention**    | Month 1 Retention        | % of new users who are still active after 30 days.                                                             | 25%     |
| **Monetisation** | Conversion to Paid       | % of free trial users who convert to a paid plan.                                                              | 10%     |
| **Performance**  | API P95 Latency          | The 95th percentile latency for all API requests.                                                              | < 200ms |
| **Performance**  | Uptime                   | % of time the platform is available and responsive.                                                            | 99.95%  |

## 3. Analytics Infrastructure

- **Tool:** We will use **PostHog** for product analytics. It provides a full suite of tools (event tracking, funnels, retention analysis, session replay) and can be self-hosted for data privacy.
- **Implementation:** A `trackEvent` function will be added to our shared library. This function will be called for every meaningful user action, sending the event data to PostHog.
- **Dashboards:** A dedicated "Product KPIs" dashboard will be created in PostHog to track all the metrics defined in this document in real time.
