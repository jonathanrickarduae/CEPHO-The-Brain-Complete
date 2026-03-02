# CEPHO Master Plan v2 (Audit-Enhanced)

**Date:** March 2, 2026
**Status:** This document supersedes all previous remediation plans. It is the single source of truth for all work, incorporating findings from the independent audit.

---

## 1. Guiding Principles (The "Brutally Honest" Methodology)

To ensure real, measurable progress, all work will be measured against the following principles. No task will be marked "complete" unless it meets these criteria:

1.  **Code is Not Enough:** A feature is not "done" when the code is written. It is done when it is live, stable, and functional.
2.  **Data is Mandatory:** A feature is not "done" if its underlying database table is empty. It must be seeded with realistic data.
3.  **Stubs are Not Features:** Code that returns hardcoded, fake, or placeholder data will be classified as a `STUB` and will not be counted as complete until it is wired to a real data source (DB or live API).
4.  **UI Must Be Professional:** A page is not "done" until it has proper loading states (skeletons preferred), error handling, and contextual empty states. It must also be responsive on mobile.

---

## 2. The Enhanced Execution Plan

This plan is organized into four sprints, prioritizing foundational stability, then fixing fake logic, then implementing AI, and finally polishing.

### Sprint 1: Data & Stability (The Foundation)
**Goal:** Every page loads gracefully and shows realistic data. No more empty states or jarring loading spinners.

| Task ID | Description | Status | Verification |
|---|---|---|---|
| S1-01 | **Seed All Empty Tables** | Not Started | - [ ] `voice_notes`, `partnerships`, `nps_responses`, `brand_kit`, `memory_bank`, and 5 other key tables have realistic seed data. |
| S1-02 | **Implement Skeleton Loading** | Not Started | - [ ] All 29 pages use `Skeleton` components during `isLoading` states. No more simple spinners. |
| S1-03 | **Implement Error Boundaries** | Not Started | - [ ] A global error boundary is implemented to prevent full-page crashes. |
| S1-04 | **Contextual Empty States** | Not Started | - [ ] All empty states are replaced with contextual messages and a clear Call to Action (CTA). |

### Sprint 2: Fix Stubs & Broken Interactions (Make it Real)
**Goal:** Eliminate all fake logic. Every button and data point is connected to a real, working backend.

| Task ID | Description | Status | Verification |
|---|---|---|---|
| S2-01 | **Rewrite `aiAgentsMonitoring`** | Not Started | - [ ] The hardcoded `getAgentMetrics` function is deleted. <br>- [ ] The router queries a new `agent_metrics` table in the DB. |
| S2-02 | **Fix `externalIntegrations`** | Not Started | - [ ] The router is rewritten to check for real OAuth tokens in the `integrations` table. <br>- [ ] Hardcoded `isConfigured: false` is removed. |
| S2-03 | **Fix Project Genesis Agent Assignment** | Not Started | - [ ] The wizard correctly assigns a real AI agent ID when a new project is created. |
| S2-04 | **Fix Theme Persistence** | Not Started | - [ ] The theme color selection is saved to the `user_settings` table via `settings.update` and persists on refresh. |
| S2-05 | **Fix Vault Sidebar Link** | Not Started | - [ ] The main sidebar link for "The Vault" correctly navigates to `/settings?tab=vault`. |

### Sprint 3: Real AI Everywhere
**Goal:** Every feature that claims to use AI is connected to a real large language model.

| Task ID | Description | Status | Verification |
|---|---|---|---|
| S3-01 | **Wire AI SME Consultation** | Not Started | - [ ] The `expertConsultation.create` mutation sends a real prompt to an LLM and returns a streaming response. |
| S3-02 | **Wire Victoria's Briefing Generation** | Not Started | - [ ] The "Generate Briefing" button uses an LLM to generate content based on user context. |
| S3-03 | **Wire Evening Review AI Summary** | Not Started | - [ ] The evening review session generates a real AI-powered summary of the day's events. |
| S3-04 | **Wire Memory Bank Population** | Not Started | - [ ] The `memory_bank` table is populated with key insights and facts derived from user interactions and documents. |

### Sprint 4: Integrations & Polish
**Goal:** Connect to the outside world and apply a final layer of professional polish.

| Task ID | Description | Status | Verification |
|---|---|---|---|
| S4-01 | **Implement Notion Integration** | Not Started | - [ ] Full OAuth 2.0 flow is implemented. <br>- [ ] Users can connect their Notion account and sync pages. |
| S4-02 | **Implement Google Calendar Integration** | Not Started | - [ ] Full OAuth 2.0 flow is implemented. <br>- [ ] Users can connect their calendar and see events. |
| S4-03 | **Fix All Mobile Overflow Issues** | Not Started | - [ ] All 29 pages are fully responsive and have no horizontal scroll on a standard mobile viewport. |

---

## 3. Completion Tracker

| Sprint | Tasks | Completed | % |
|---|---|---|---|
| Sprint 1: Data & Stability | 4 | 0 | 0% |
| Sprint 2: Fix Stubs | 5 | 0 | 0% |
| Sprint 3: Real AI | 4 | 0 | 0% |
| Sprint 4: Integrations & Polish | 3 | 0 | 0% |
| **Total** | **16** | **0** | **0%** |
