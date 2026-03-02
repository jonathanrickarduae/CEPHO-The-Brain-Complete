# CEPHO Master Plan (The Bible)

**Date:** March 2, 2026
**Status:** This document is the single source of truth for all CEPHO platform development. It supersedes and consolidates all previous plans and audit findings.

---

## 1. The Methodology (The Four Commandments)

To ensure real, measurable progress, all work will be measured against the following principles. No task will be marked "complete" unless it meets these criteria:

1.  **Code is Not Enough:** A feature is not "done" when the code is written. It is done when it is live, stable, and functional.
2.  **Data is Mandatory:** A feature is not "done" if its underlying database table is empty. It must be seeded with realistic data.
3.  **Stubs are Not Features:** Code that returns hardcoded, fake, or placeholder data will be classified as a `STUB` and will not be counted as complete until it is wired to a real data source (DB or live API).
4.  **UI Must Be Professional:** A page is not "done" until it has proper loading states (skeletons preferred), error handling, and contextual empty states. It must also be responsive on mobile.

---

## 2. The Master Execution Plan

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

---

## 4. Appendix: Original Plans (Archived)

*The following sections are preserved for historical context but are no longer the active plan.*

### 4.1. Original Remediation Master Plan (2026-02-28)

This plan was organized into 7 key remediation areas, with a detailed breakdown of tasks for each. The status of each task will be updated here as it is completed.

#### 4.1.1. Code & Documentation Cleanup

**Objective:** To create a lean and understandable codebase by systematically removing all outdated, duplicated, and irrelevant files, code, and documentation.

| Task ID | Description | Status | Verification |
|---|---|---|---|
| CD-01 | Remove Obsolete Features | Not Started | - [ ] Code removed from GitHub<br>- [ ] Live site audit confirms removal<br>- [ ] Supabase schema updated |
| CD-02 | Consolidate Documentation | Not Started | - [ ] Master docs created in GitHub<br>- [ ] All duplicates removed |
| CD-03 | Unify Naming Conventions | Not Started | - [ ] All files/folders renamed in GitHub |
| CD-04 | Delete Duplicated Files | Not Started | - [ ] Full audit confirms no duplicates remain |

#### 4.1.2. API Cleanup & Integration

**Objective:** To fix the non-functional API integrations page, creating a clear and accurate representation of all connected services, and to add missing critical integrations.

| Task ID | Description | Status | Verification |
|---|---|---|---|
| API-01 | Redesign Integrations Page | Not Started | - [ ] New page live on website<br>- [ ] All integrations listed |
| API-02 | Sync with Render & Reality | Not Started | - [ ] Live status is accurate on website |
| API-03 | Add Missing Integrations | Not Started | - [ ] All new APIs are on integrations page |
| API-04 | Consolidate Integration Points | Not Started | - [ ] Vault is merged into Settings page |

#### 4.1.3. AI Agents Recovery & Mapping

**Objective:** To recover, map, and make fully operational the 50+ AI agents that are a core feature of the CEPHO system.

| Task ID | Description | Status | Verification |
|---|---|---|---|
| AI-01 | Full Agent Audit & Recovery | Not Started | - [ ] All 50+ agents are in the codebase |
| AI-02 | Create a Central Agent Directory | Not Started | - [ ] `/ai-agents` page is live<br>- [ ] All agents are listed |
| AI-03 | Operationalize All Agents | Not Started | - [ ] All agents are functional on live site |

#### 4.1.4. Fix Broken Pages & Routing

**Objective:** To ensure all pages within the application are functional and correctly routed.

| Task ID | Description | Status | Verification |
|---|---|---|---|
| PAGE-01 | Full Routing Audit | Not Started | - [ ] All routes in `App.tsx` are correct |
| PAGE-02 | Fix Non-Functional Pages | Not Started | - [ ] All pages are functional on live site |

#### 4.1.5. Mobile Responsiveness

**Objective:** To make the entire application fully responsive and usable on mobile devices, with a specific focus on a clean portrait mode experience.

| Task ID | Description | Status | Verification |
|---|---|---|---|
| MOB-01 | Implement Mobile-First Layout | Not Started | - [ ] Layout is responsive on all devices |
| MOB-02 | Optimize for Portrait Mode | Not Started | - [ ] No horizontal scrolling on mobile |

#### 4.1.6. UI/UX Redesign & Standardization

**Objective:** To create a slick, consistent, and action-oriented user experience by implementing a unified design system.

| Task ID | Description | Status | Verification |
|---|---|---|---|
| UI-01 | Enforce a Single Design System | Not Started | - [ ] All components use the design system |
| UI-02 | Standardize Page Layouts | Not Started | - [ ] All pages have a consistent layout |
| UI-03 | Improve Information Density | Not Started | - [ ] Pages are more compact and action-oriented |

#### 4.1.7. Persephone Board Training

**Objective:** To train the 14 Persephone Board AI agents to think, act, and communicate in a way that is authentically representative of their real-world counterparts.

| Task ID | Description | Status | Verification |
|---|---|---|---|
| PB-01 | Create a Knowledge Corpus | Not Started | - [ ] All 14 corpora are created |
| PB-02 | Implement a RAG System | Not Started | - [ ] RAG system is functional |
| PB-03 | Fine-Tune Agent Personas | Not Started | - [ ] All 14 agents have unique personas |

### 4.2. Original Phase 2 Remediation Plan (2026-03-01)

This plan was created after the initial live audit and identified 24 specific issues to be addressed.

#### 4.2.1. Audit Summary: What Was Actually Broken

##### CRITICAL — Pages crash or show nothing
| ID | Page | Root Cause |
|----|------|-----------|
| P2-01 | **Innovation Hub** | `useMemo is not defined` runtime crash (fixed in latest deploy) |
| P2-02 | **Persephone Board** | `useToast must be used within ToastProvider` crash (fixed in latest deploy) |
| P2-03 | **AI Agents page** | `useCallback` duplicate import crash (fixed in latest deploy) |
| P2-04 | **Sidebar/Dialog/Chart UI** | Missing `useMemo`/`useCallback` imports in core UI components (fixed in latest deploy) |

##### HIGH — Features exist but produce no output
| ID | Feature | Root Cause |
|----|---------|-----------|
| P2-05 | **Persephone Board chat** | `expertChat.startSession` POST blocked by CSRF in browser (needs session cookie) — works once logged in |
| P2-06 | **Evening Review** | `eveningReview.createSession` — no seed data; creates empty session but shows nothing |
| P2-07 | **Document Library** | No documents seeded in DB — page loads but shows empty state |
| P2-08 | **Innovation Hub ideas** | Only 12 ideas seeded — page loads but most filter tabs show empty |
| P2-09 | **Workflows page** | No workflows in DB — page shows empty state |
| P2-10 | **Notifications** | No notifications seeded — bell icon shows 0 |
| P2-11 | **Subscription Tracker** | No subscriptions seeded — shows empty state |
| P2-12 | **Victoria's Briefing actions** | "Generate Briefing" button calls mutation but no AI key configured for briefing generation |
| P2-13 | **AI Agents detail page** | REST `/api/agents/:id` returns mock data, not real agent metrics from DB |

##### MEDIUM — Pages load but have broken interactions
| ID | Feature | Root Cause |
|----|---------|-----------|
| P2-14 | **Chief of Staff task creation** | `cosTasks.create` mutation — no form validation feedback on error |
| P2-15 | **Project Genesis wizard** | Wizard steps work but `projectGenesis.initiate` creates project with no AI agent assigned |
| P2-16 | **AI SMEs consultation** | `expertConsultation.create` works but no real AI response — returns stub |
| P2-17 | **Expert Recommendation** | Returns static recommendations, not personalised to user context |
| P2-18 | **Analytics page** | Feature flags load but charts show no real usage data |
| P2-19 | **Settings — integrations** | Integration status shows "Disconnected" for all — OAuth flows not implemented |
| P2-20 | **Vault tab in Settings** | Redirects correctly but the vault content is static mock data |

##### LOW — Minor UX issues
| ID | Issue | Detail |
|----|-------|--------|
| P2-21 | Sidebar nav `/vault` link | Still points to `/vault` not `/settings?tab=vault` |
| P2-22 | Theme picker | Colour changes apply but don't persist on page refresh |
| P2-23 | Mobile layout | Several pages overflow on mobile viewport |
| P2-24 | Empty state messages | Generic "No data" messages — need contextual empty states with CTAs |
