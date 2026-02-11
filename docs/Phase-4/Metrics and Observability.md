
# Metrics and Observability
Phase: 4
Status: Draft

## 1. Measurement Philosophy

If you can't measure it, you can't improve it. In Phase 4, we will build a comprehensive, real-time view of the platform's performance, from high-level business goals to the fine-grained performance of individual AI models. This is the nervous system of our growth and optimisation engine.

## 2. The Metrics Hierarchy

We will structure our metrics in a pyramid, with each layer providing context for the one above it.

### 2.1. Level 1: North Star Metric

This is the single metric that best captures the core value we provide to our users.

- **North Star Metric:** `Weekly Active Users Performing a Core Action`
  - **Definition:** The number of unique users who, in a given week, successfully complete a core workflow (e.g., generate a report, create a collaborative workspace).
  - **Rationale:** This measures both reach (active users) and engagement (performing a core action). It is a direct proxy for the value users are getting from the platform.

### 2.2. Level 2: Key Business & Product Metrics

These are the high-level metrics that drive the North Star. They will be reviewed weekly by the leadership team.

| Category | Metric | Description |
|---|---|---|
| **Growth** | - `New User Signups`<br>- `Viral Coefficient (k)`<br>- `Customer Acquisition Cost (CAC)` | Are we growing, and is that growth efficient? |
| **Engagement** | - `Daily/Monthly Active Users (DAU/MAU)`<br>- `Session Duration`<br>- `Feature Adoption Rate` | Are users sticking around and using the product? |
| **Retention** | - `User Churn Rate`<br>- `Resurrection Rate` | Are we keeping the users we acquire? |
| **Commercial** | - `Monthly Recurring Revenue (MRR)`<br>- `Customer Lifetime Value (LTV)`<br>- `Expansion MRR` | Are we building a sustainable business? |

### 2.3. Level 3: AI Performance Metrics

This layer provides the granular data needed for the AI optimisation loops.

| Metric | Description | Use Case |
|---|---|---|
| **User Feedback Score** | Average explicit feedback rating (e.g., 1-5 stars) for each prompt/workflow. | Primary input for prompt A/B testing. |
| **Implicit Feedback Rate** | The rate of positive implicit actions (e.g., copy to clipboard) vs. negative ones (e.g., immediate re-run). | A proxy for user satisfaction when explicit feedback is not given. |
| **Correction Rate** | The percentage of AI outputs that are manually edited by the user. | A direct measure of the AI's accuracy and helpfulness. |
| **Model Cost Per Query** | The average cost of an AI model invocation for a specific workflow. | Input for cost-efficiency optimisations. |
| **Model Latency** | The time it takes for an AI model to return a response. | A key component of the user experience. |

## 3. Observability & Tooling

Metrics are only useful if they are visible and actionable.

- **Central Dashboard:** We will build a real-time, internal dashboard (using Cepho itself) that displays all key metrics. This will be the single source of truth for platform performance.
- **Alerting:** We will set up automated alerts for significant changes in key metrics (e.g., a sudden drop in user satisfaction scores, a spike in model latency).
- **Logging:** We will implement structured logging for all key events, from user actions to AI model requests. This will allow us to trace any issue from the high-level metric down to the individual request that caused it.

---
*Our metrics dashboard will be the heartbeat of the company. Every team member will have access to it, and it will be the foundation of our data-driven culture.* 

