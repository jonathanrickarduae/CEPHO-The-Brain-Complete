# Handover to Phase 3

Phase: 2
Status: Consolidated Draft

---

## 1. What Phase 3 Will Build On

Phase 2 establishes the core enhancements and integrations necessary for a public beta. Phase 3 will build on this foundation to drive personalization, monetization, and deeper intelligence.

| Phase 2 Foundation | Phase 3 Evolution |
|---|---|
| **Agentic Framework** | **Autonomous Agents:** Phase 3 will evolve the agent framework to support more autonomous, long-running tasks that can be initiated by the system, not just the user. |
| **Two-Way Integrations** | **Proactive Actions:** With read/write access established, Phase 3 will focus on the AI taking proactive actions on the user's behalf (e.g., automatically scheduling a meeting in response to an email). |
| **User Preferences** | **Implicit Personalization:** Phase 3 will move beyond explicit preferences to implicit personalization, where the AI learns a user's habits and adapts its behavior automatically. |
| **Stripe Integration** | **Monetization Engine:** With financial data available, Phase 3 will introduce the monetization features of the platform, including subscription billing and usage-based pricing. |
| **Beta Readiness** | **Public Launch:** The stability, monitoring, and feedback loops established in Phase 2 are the direct prerequisites for a full public launch in Phase 3. |

## 2. Open Decisions

Several strategic and technical decisions have been intentionally deferred to Phase 3, pending the results and feedback from the Phase 2 beta.

| Decision | Context | Options for Phase 3 |
|---|---|---|
| **Monetization Model** | Should we pursue a subscription-based model, a usage-based model, or a hybrid? | The data collected from the Stripe integration and user behavior during the beta will inform a data-driven decision on the final pricing strategy. |
| **On-Premise vs. Cloud LLMs** | Is it more cost-effective and secure to host our own open-source LLMs versus relying on third-party APIs? | The cost and performance data from the Phase 2 model router will be used to conduct a total cost of ownership (TCO) analysis. |
| **Mobile Strategy** | Should we develop a native mobile app (iOS/Android) or focus on an enhanced Progressive Web App (PWA)? | User feedback from the beta on mobile usage of the web app will be the primary driver for this decision. |
| **Enterprise Features** | What features are required for an enterprise-grade offering (e.g., SAML/SSO, advanced user roles, team-level analytics)? | This will be guided by interest from larger teams during the beta and direct market research conducted in parallel with Phase 2 execution. |

## 3. Known Constraints

The Phase 3 team will inherit the following constraints from the work completed in Phases 1 and 2.

| Constraint | Description | Rationale |
|---|---|---|
| **Non-Breaking Data Migrations** | All database schema changes must continue to be non-breaking and backwards-compatible. | To ensure zero-downtime deployments and the ability to roll back releases without data loss. |
| **Modular Service Architecture** | New capabilities should be built as independent, modular services rather than being added to the existing monolith. | To maintain separation of concerns, improve scalability, and allow for independent development and deployment cycles. |
| **API Versioning** | Any breaking changes to existing APIs must be introduced as a new version (e.g., `/api/v3/...`), leaving the old version operational for a deprecation period. | To ensure that existing clients (including our own web app) do not break when new features are deployed. |
| **Compliance Framework** | All new features that handle personal data must adhere to the GDPR and CCPA compliance framework established in Phase 2. | To maintain legal and regulatory compliance as the platform scales. |
