# CEPHO Phase 2 Remediation Plan

**Date:** 2026-03-01  
**Based on:** Full live audit — GitHub, live site (every page/button), Supabase DB

---

## Audit Summary: What Is Actually Broken

### What Works ✅

- Login (PIN gate) and session persistence
- Nexus Dashboard — loads with real data (12 ideas, 47 consultations, 23 tasks, 3 projects)
- Victoria's Daily Briefing — loads and displays content
- Chief of Staff — active agents list loads
- QA Task Status — loads
- SME Team list — loads
- Expert Consultation counts — loads
- AI Agents Monitoring — loads
- Feature Flags — loads
- Project Genesis list — loads
- Settings — loads
- Subscription Tracker summary — loads

### What Is Broken ❌

#### CRITICAL — Pages crash or show nothing

| ID    | Page                        | Root Cause                                                                             |
| ----- | --------------------------- | -------------------------------------------------------------------------------------- |
| P2-01 | **Innovation Hub**          | `useMemo is not defined` runtime crash (fixed in latest deploy)                        |
| P2-02 | **Persephone Board**        | `useToast must be used within ToastProvider` crash (fixed in latest deploy)            |
| P2-03 | **AI Agents page**          | `useCallback` duplicate import crash (fixed in latest deploy)                          |
| P2-04 | **Sidebar/Dialog/Chart UI** | Missing `useMemo`/`useCallback` imports in core UI components (fixed in latest deploy) |

#### HIGH — Features exist but produce no output

| ID    | Feature                         | Root Cause                                                                                              |
| ----- | ------------------------------- | ------------------------------------------------------------------------------------------------------- |
| P2-05 | **Persephone Board chat**       | `expertChat.startSession` POST blocked by CSRF in browser (needs session cookie) — works once logged in |
| P2-06 | **Evening Review**              | `eveningReview.createSession` — no seed data; creates empty session but shows nothing                   |
| P2-07 | **Document Library**            | No documents seeded in DB — page loads but shows empty state                                            |
| P2-08 | **Innovation Hub ideas**        | Only 12 ideas seeded — page loads but most filter tabs show empty                                       |
| P2-09 | **Workflows page**              | No workflows in DB — page shows empty state                                                             |
| P2-10 | **Notifications**               | No notifications seeded — bell icon shows 0                                                             |
| P2-11 | **Subscription Tracker**        | No subscriptions seeded — shows empty state                                                             |
| P2-12 | **Victoria's Briefing actions** | "Generate Briefing" button calls mutation but no AI key configured for briefing generation              |
| P2-13 | **AI Agents detail page**       | REST `/api/agents/:id` returns mock data, not real agent metrics from DB                                |

#### MEDIUM — Pages load but have broken interactions

| ID    | Feature                          | Root Cause                                                                                |
| ----- | -------------------------------- | ----------------------------------------------------------------------------------------- |
| P2-14 | **Chief of Staff task creation** | `cosTasks.create` mutation — no form validation feedback on error                         |
| P2-15 | **Project Genesis wizard**       | Wizard steps work but `projectGenesis.initiate` creates project with no AI agent assigned |
| P2-16 | **AI SMEs consultation**         | `expertConsultation.create` works but no real AI response — returns stub                  |
| P2-17 | **Expert Recommendation**        | Returns static recommendations, not personalised to user context                          |
| P2-18 | **Analytics page**               | Feature flags load but charts show no real usage data                                     |
| P2-19 | **Settings — integrations**      | Integration status shows "Disconnected" for all — OAuth flows not implemented             |
| P2-20 | **Vault tab in Settings**        | Redirects correctly but the vault content is static mock data                             |

#### LOW — Minor UX issues

| ID    | Issue                     | Detail                                                              |
| ----- | ------------------------- | ------------------------------------------------------------------- |
| P2-21 | Sidebar nav `/vault` link | Still points to `/vault` not `/settings?tab=vault`                  |
| P2-22 | Theme picker              | Colour changes apply but don't persist on page refresh              |
| P2-23 | Mobile layout             | Several pages overflow on mobile viewport                           |
| P2-24 | Empty state messages      | Generic "No data" messages — need contextual empty states with CTAs |

---

## Phase 2 Execution Plan

### Sprint 1 — Make Every Page Show Real Data (Priority: CRITICAL)

**Goal:** No empty states on any page. Every page shows meaningful content.

| Task     | Action                                                                                                           | Effort |
| -------- | ---------------------------------------------------------------------------------------------------------------- | ------ |
| P2-S1-01 | Seed comprehensive demo data: 20 documents, 10 workflows, 15 notifications, 8 subscriptions, 30 innovation ideas | 2h     |
| P2-S1-02 | Seed evening review sessions (5 historical + 1 active)                                                           | 30m    |
| P2-S1-03 | Seed AI agent metrics in DB (tasks, success rates, response times)                                               | 1h     |
| P2-S1-04 | Replace all "No data" empty states with contextual messages + CTAs                                               | 2h     |

### Sprint 2 — Fix All Broken Interactions (Priority: HIGH)

**Goal:** Every button does something real.

| Task     | Action                                                                               | Effort |
| -------- | ------------------------------------------------------------------------------------ | ------ |
| P2-S2-01 | Wire Victoria's Briefing "Generate" button to OpenAI (use existing `OPENAI_API_KEY`) | 2h     |
| P2-S2-02 | Wire AI SME consultation to real OpenAI responses (each SME has a system prompt)     | 3h     |
| P2-S2-03 | Wire Expert Recommendation to use user's project/task context                        | 2h     |
| P2-S2-04 | Fix Project Genesis wizard — assign AI agent on project creation                     | 1h     |
| P2-S2-05 | Fix Chief of Staff task creation form — add proper validation + success feedback     | 1h     |
| P2-S2-06 | Fix theme persistence — save theme to DB via `settings.update`                       | 1h     |

### Sprint 3 — Real AI Responses Everywhere (Priority: HIGH)

**Goal:** Every AI-powered feature returns real AI output.

| Task     | Action                                                                           | Effort |
| -------- | -------------------------------------------------------------------------------- | ------ |
| P2-S3-01 | Persephone Board — verify live chat works end-to-end in browser (CSRF + session) | 1h     |
| P2-S3-02 | Evening Review — wire AI summary generation using OpenAI                         | 2h     |
| P2-S3-03 | Chief of Staff — wire AI task prioritisation using OpenAI                        | 2h     |
| P2-S3-04 | Innovation Hub — wire AI idea scoring/validation                                 | 2h     |
| P2-S3-05 | Document Library — wire AI document summarisation                                | 2h     |

### Sprint 4 — Integration Connectivity (Priority: MEDIUM)

**Goal:** At least 3 integrations are live and pulling real data.

| Task     | Action                                                      | Effort |
| -------- | ----------------------------------------------------------- | ------ |
| P2-S4-01 | Notion integration — OAuth flow + real page sync            | 3h     |
| P2-S4-02 | GitHub integration — OAuth flow + repo/issue sync           | 3h     |
| P2-S4-03 | Google Calendar integration — OAuth flow + event sync       | 3h     |
| P2-S4-04 | Fix sidebar `/vault` link to point to `/settings?tab=vault` | 15m    |

### Sprint 5 — Polish & Mobile (Priority: LOW)

**Goal:** Professional finish on all devices.

| Task     | Action                                                                                                                 | Effort |
| -------- | ---------------------------------------------------------------------------------------------------------------------- | ------ |
| P2-S5-01 | Fix mobile overflow on 6 pages (PersephoneBoard, AIAgents, DocumentLibrary, Analytics, ProjectGenesis, WorkflowDetail) | 3h     |
| P2-S5-02 | Add loading skeletons to all pages (currently show blank while loading)                                                | 2h     |
| P2-S5-03 | Add error boundary components to prevent full-page crashes                                                             | 2h     |
| P2-S5-04 | Improve empty state designs with illustrations and CTAs                                                                | 2h     |

---

## Root Cause Analysis

### Why "nothing works" despite code being complete

1. **No seed data in production DB** — The database was empty. All pages that query the DB show empty states. Fixed for core tables; needs comprehensive seeding for all features.

2. **Missing React hook imports** — The PERF-01 work added `useMemo`/`useCallback` calls to components without adding them to imports. This caused runtime crashes on 4+ pages. Fixed in `commit f322858`.

3. **AI features are wired to stubs** — Most AI-powered features (SME consultation, Victoria's briefing, evening review) call the server but the server returns static/stub responses rather than real OpenAI calls. The `OPENAI_API_KEY` is set on Render but the code paths that use it are not connected to the UI mutations.

4. **OAuth integrations not implemented** — The integrations page shows 10 services but none have real OAuth flows. They show "Connected" or "Disconnected" based on DB flags, not actual API connectivity.

5. **CSRF protection blocking mutations** — All POST mutations require a CSRF token. This works correctly in the browser (the client sends it automatically) but was causing confusion during API testing.

---

## Immediate Next Steps (do now)

1. **Run Sprint 1** — seed all demo data (30 min of work, makes every page look alive)
2. **Run Sprint 2, Task P2-S2-01** — wire Victoria's Briefing to OpenAI (highest-visibility feature)
3. **Run Sprint 2, Task P2-S2-02** — wire AI SME consultation to OpenAI (core product feature)
4. **Fix sidebar vault link** (5 min)
