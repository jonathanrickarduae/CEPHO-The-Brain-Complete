
# Cost Efficiency
Phase: 4
Status: Draft

## 1. Mandate

In an AI-powered platform, compute and model usage are primary components of our Cost of Goods Sold (COGS). Uncontrolled, these costs can scale linearly (or worse, super-linearly) with usage, destroying our unit economics. The mandate of Phase 4 is to ensure that our costs scale sub-linearly with our revenue. We must build a platform that gets more efficient as it grows.

## 2. Infrastructure Cost Controls

This is about managing the costs of our own servers and services.

| Strategy | Description | Metric |
|---|---|---|
| **Autoscaling** | All services will be containerised and deployed on an orchestrated platform (e.g., Kubernetes) with aggressive autoscaling policies. We will scale to zero where possible. | `Idle Compute Hours` |
| **Spot Instances** | For stateless and fault-tolerant workloads (e.g., batch processing, model inference), we will heavily utilise spot instances to reduce compute costs by up to 90%. | `Spot Instance Utilisation %` |
| **Data Tiering** | We will implement a data lifecycle policy, automatically moving older, less-frequently accessed data from expensive, high-performance storage (e.g., SSDs) to cheaper, archival storage (e.g., AWS S3 Glacier). | `Data Storage Cost per GB` |

## 3. Model Usage Optimisation

This is the most critical and unique aspect of our cost structure. We will treat model calls as a finite resource to be used as efficiently as possible.

| Strategy | Description | Trade-off |
|---|---|---|
| **Model Cascade** | As defined in `ai-optimisation.md`, we will route queries to the cheapest possible model that can deliver the required quality. | Increased complexity in our application logic. |
| **Intelligent Caching** | For non-personalised, deterministic queries, we will implement a caching layer. If the same query is made by two different users, the result from the AI model will be cached and served instantly for subsequent requests. | We must be careful not to cache user-specific or sensitive data. |
| **Request Batching** | For high-throughput, low-latency tasks, we will batch multiple user requests into a single call to the AI model, reducing the overhead of individual API calls. | Can slightly increase latency for the first user in a batch. |
| **Prompt Engineering for Brevity** | We will actively engineer our prompts to be as concise as possible. Since most models charge based on input and output tokens, shorter prompts and responses directly translate to lower costs. | Overly short prompts can sometimes lack the context needed for a high-quality response. This will be balanced via A/B testing. |

## 4. Financial Governance

We will build financial discipline into our engineering culture.

- **Cost Allocation Tagging:** Every single resource (server, database, model call) will be tagged with the feature and team that owns it. This allows us to precisely attribute costs and understand the COGS of each part of our platform.
- **Budget Alerts:** We will set budgets for each team and feature. Automated alerts will be triggered when costs are projected to exceed their budget.
- **Cost as a Feature Metric:** When we launch a new feature, we will not only define its success metrics but also its cost budget. The cost-efficiency of a feature will be a key factor in deciding whether to invest further in it.

---
*Cost is a feature. A cheaper, more efficient platform allows us to offer more value to our users at a lower price, creating a powerful competitive advantage.* 

