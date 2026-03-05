...(full v11 content)...

---

## Appendix AK: Page-by-Page Process Inventory

This appendix provides a comprehensive, page-by-page inventory of all processes, features, and workflows within the CEPHO.AI application. It is compiled from an audit of the live codebase, tRPC routers, and all available specification documents. Each entry details the user-facing features and the corresponding backend processes that power them.

...(full page-by-page process list content from previous read from previous turn)...


---

## Phase 8: Go Live Remediation Plan

This phase addresses all critical, high, and medium priority issues identified in the Independent Expert Panel Assessment of March 4, 2026. The goal is to systematically elevate the platform's stability, security, and quality to a production-ready state before go-live.

### Sprint 1: Stabilise (Week 1) — Target Grade: B-

The goal of Sprint 1 is to make the platform functional, secure, and observable. All P0 issues must be resolved before Sprint 1 is considered complete.

| Task ID | Issue | Owner | Est. Hours |
| :--- | :--- | :--- | :--- |
| S1-01 | Fix CSP to allow inline styles (P0.1) | Frontend | 1h |
| S1-02 | Implement lazy loading for Mermaid and Cytoscape (P0.1) | Frontend | 3h |
| S1-03 | Fix critical vulnerabilities via `pnpm audit --fix` and overrides (P0.2) | Full-Stack | 2h |
| S1-04 | Enable RLS on all 90 unprotected tables (P1.1) | Backend/DB | 6h |
| S1-05 | Configure Sentry DSN in Render environment variables (P1.3) | DevOps | 1h |
| S1-06 | Configure and activate the database backup workflow (P2.1) | DevOps | 3h |
| **Sprint 1 Total** | | | **~16 hours** |

### Sprint 2: Strengthen (Week 2) — Target Grade: B+

The goal of Sprint 2 is to address the fundamental database integrity issue and resolve the high-severity vulnerability backlog.

| Task ID | Issue | Owner | Est. Hours |
| :--- | :--- | :--- | :--- |
| S2-01 | Add FK constraints for core entities (users, projects, tasks, teams) (P1.2) | Backend/DB | 8h |
| S2-02 | Resolve all 24 high-severity vulnerabilities (P2.2) | Full-Stack | 6h |
| S2-03 | Consolidate duplicate `audit_log`/`audit_logs` tables (P3.1) | Backend/DB | 2h |
| S2-04 | Integrate Winston logger with a centralized log service (P1.3) | Backend | 4h |
| **Sprint 2 Total** | | | **~20 hours** |

### Sprint 3: Elevate (Week 3-4) — Target Grade: A-

The goal of Sprint 3 is to bring the platform to a world-class standard through comprehensive testing and UI quality improvements.

| Task ID | Issue | Owner | Est. Hours |
| :--- | :--- | :--- | :--- |
| S3-01 | Write unit tests for `server/services` to reach 60% coverage (P2.3) | Full-Stack | 16h |
| S3-02 | Write integration tests for critical tRPC routers (P2.3) | Full-Stack | 8h |
| S3-03 | Add FK constraints for remaining entity relationships (P1.2) | Backend/DB | 8h |
| S3-04 | Write Storybook stories for 20 core UI components (P3.2) | Frontend | 8h |
| S3-05 | Enforce 2FA for admin accounts (P1.3 follow-up) | Backend | 4h |
| **Sprint 3 Total** | | | **~44 hours** |

---

## Phase 10: Grade A Elevation

**Objective:** Elevate three domains identified by the independent expert panel re-audit from their current grades to a target grade of **A** in each.

| Domain | Current Grade | Target Grade |
|---|---|---|
| Observability & Reliability | C | A |
| Database Schema Design | C | A |
| Frontend Performance | C+ | A |

**Total Estimated Effort:** ~107 hours across 3 tracks

---

### Track 1: Observability & Reliability (C → A)

| Task ID | Task | Priority | Est. Hours |
|---|---|---|---|
| OR-1 | Set `SENTRY_DSN` in Render dashboard to activate production error monitoring | P0 | 0.5h |
| OR-2 | Integrate Winston with a centralised logging service (Logtail/BetterStack) | P1 | 4h |
| OR-3 | Build a `/admin/health` dashboard page showing all service statuses | P2 | 6h |
| OR-4 | Implement Prometheus metrics endpoint for key application events | P2 | 8h |
| OR-5 | Configure Sentry alerting rules for critical errors and performance regressions | P2 | 3h |
| **Track 1 Total** | | | **~21.5 hours** |

**Success Criteria:** Zero unmonitored production errors; all logs queryable in a centralised service; health dashboard visible in the app; Sentry alerts firing within 5 minutes of a critical error.

---

### Track 2: Database Schema Design (C → A)

| Task ID | Task | Priority | Est. Hours |
|---|---|---|---|
| DB-1 | Enable RLS on all 90 remaining unprotected tables with appropriate policies | P0 | 12h |
| DB-2 | Add B-tree indexes to all 18 FK columns currently missing them | P1 | 4h |
| DB-3 | Add FK constraints for all remaining logical entity relationships | P1 | 16h |
| DB-4 | Consolidate `user_settings` and `user_preferences` into a single `user_profile` table | P2 | 6h |
| DB-5 | Adopt `drizzle-kit` for formal, version-controlled migration management | P2 | 8h |
| **Track 2 Total** | | | **~46 hours** |

**Success Criteria:** 100% RLS coverage; all FK columns indexed; zero orphaned records possible; single canonical table for user preferences; all schema changes tracked as migration files.

---

### Track 3: Frontend Performance (C+ → A)

| Task ID | Task | Priority | Est. Hours |
|---|---|---|---|
| FE-1 | Replace Mermaid.js (1.7MB) with a lighter diagramming alternative | P1 | 12h |
| FE-2 | Implement WebP image optimization pipeline for all static assets | P2 | 8h |
| FE-3 | Profile and optimize main thread work during initial page load | P2 | 6h |
| FE-4 | Code-split the `ui-vendor` chunk (496KB) into granular sub-chunks | P3 | 5h |
| FE-5 | Implement a Workbox service worker for aggressive static asset caching | P3 | 8h |
| **Track 3 Total** | | | **~39 hours** |

**Success Criteria:** Total initial JS bundle under 2MB; Lighthouse Performance score above 85; TTFB under 1.5s; all static assets served with a service worker cache-hit on repeat visits.

---

## Phase 11: Mock Day Findings & Immediate Remediation

**Date:** 5 March 2026
**Run Type:** Full end-to-end mock 24-hour simulation by Chief of Staff AI
**Overall Stability Score:** 3.5 / 10

This phase documents the findings from the first formal CEPHO Mock Day simulation. The simulation tested every page, feature, and AI system on the live production platform at cepho.ai. All findings are honest — no shortcuts were taken and no failures were papered over.

### Critical Blocker (Must Fix Before Next Run)

| ID | Issue | Fix Required | Owner | Est. |
|---|---|---|---|---|
| P0-001 | `PIN_GATE_ONLY=true` not set on Render — entire authenticated layer blocked | Add env var in Render dashboard | DevOps | 5 min |

**This single missing environment variable is blocking Innovation Hub, Project Genesis (all 6 phases), Chief of Staff AI, War Room AI Response Plan, Persephone Board, Digital Twin Training, Daily Briefing PDF/Audio, and Email Intelligence.** Set `PIN_GATE_ONLY=true` in Render Environment before the next mock day run.

### Bugs Fixed in This Phase (commit `dad95e6`)

| ID | Bug | Fix Applied |
|---|---|---|
| BUG-003 | ClawBot panel always open on Nexus Dashboard | Made collapsible with toggle button |
| BUG-005 | War Room agent cards show "active" status even when no AI is running | Cards now show honest Standby/Working/Complete state |
| BUG-006 | Project Genesis shows no error when auth fails on Complete Blueprint | Now shows clear error message with instructions |
| BUG-007 | Voice redirect in BrainLayout navigates to dead `/chief-of-staff` route | Fixed to `/tasks` |
| P2-003 | Admin CEPHO Score shows "Loading..." indefinitely on auth failure | Now shows "Unavailable" on error, "Calculating..." while loading |
| GLOBAL | tRPC UNAUTHORIZED errors were silent — no user feedback | Global toast notification added via QueryCache + MutationCache |

### Remaining Open Bugs (Next Sprint)

| ID | Priority | Issue | Est. |
|---|---|---|---|
| BUG-001 | P1 | Daily Briefing PDF/Audio buttons non-functional (blocked by auth) | Resolved by P0-001 |
| BUG-002 | P1 | Digital Twin Training sidebar link is 404 | 30 min |
| BUG-004 | P1 | Digital Twin Training content is placeholder text | 4h |
| BUG-008 | P1 | War Room AI Response Plan never generates (blocked by auth) | Resolved by P0-001 |
| BUG-009 | P2 | SVG circle radius undefined in War Room agent status cards | 1h |
| BUG-010 | P2 | Chief of Staff AI returns generic error instead of helpful message | 1h |
| BUG-012 | P3 | Nexus Quick Access has 2 dead links (/the-signal, /library) | 30 min |
| BUG-013 | P3 | Evening Review mood entries not persisted between sessions | 2h |

### UX Issues Identified

| ID | Page | Issue | Priority |
|---|---|---|---|
| UX-001 | Nexus Dashboard | Quick Access button order does not reflect daily usage priority | P2 |
| UX-002 | Nexus Dashboard | 2 dead navigation links in Quick Access panel | P1 |
| UX-003 | Nexus Dashboard | ClawBot panel was always open, covering content | Fixed |
| UX-004 | War Room | Agent status cards showed fake activity before any AI ran | Fixed |
| UX-005 | All pages | Silent failures on auth — no user feedback | Fixed |
| UX-006 | Mobile | Bottom tab bar partially obscured on small screens | P2 |

---

## Phase 12: Mock Day Run 2 — Full AI Quality Assessment

**Prerequisite:** `PIN_GATE_ONLY=true` must be set on Render before this phase begins.

**Objective:** Run the full mock day simulation with all AI features unlocked. Assess AI quality across every system, complete all 6 Project Genesis phases autonomously, and produce a full set of formatted deliverables.

### Sprint 12A: Pre-Run Fixes

| Task ID | Task | Priority | Est. |
|---|---|---|---|
| MD2-01 | Set `PIN_GATE_ONLY=true` on Render | P0 | 5 min |
| MD2-02 | Fix Digital Twin Training sidebar link (BUG-002) | P1 | 30 min |
| MD2-03 | Fix War Room SVG circle radius error (BUG-009) | P2 | 1h |
| MD2-04 | Fix Chief of Staff error message UX (BUG-010) | P2 | 1h |
| MD2-05 | Fix Nexus dead links (BUG-012) | P3 | 30 min |

### Sprint 12B: Test Targets for Run 2

| System | Test | Success Criteria |
|---|---|---|
| Innovation Hub | Generate Daily Ideas, Analyse 5 URLs, run Flywheel | Ideas generated, scored, promoted to Genesis |
| Project Genesis | Complete all 6 phases autonomously with SME panel | All 6 phase deliverables produced as formatted docs |
| Chief of Staff AI | Strategic briefing, SME consultation, task creation | AI response quality score >= 4/5 |
| War Room | Competitor move scenario, full AI Response Plan | Response plan generated with 4+ agent outputs |
| Persephone Board | Board consultation on launch strategy | Strategic advice quality score >= 4/5 |
| Daily Briefing | PDF generation, Audio generation | Both files produced and downloadable |
| Digital Twin | Full training session, recalibration, learning summary | Learning summary produced with measurable insights |
| OpenClaw | Creative, strategic, and technical tasks | All 3 responses quality score >= 3.5/5 average |

### Sprint 12C: AI Quality Benchmarks

| System | Target Average Score |
|---|---|
| Chief of Staff AI | >= 4.0 |
| Project Genesis | >= 4.0 |
| War Room | >= 3.5 |
| Persephone Board | >= 4.0 |
| Innovation Hub | >= 3.5 |
| Digital Twin | >= 3.5 |
| OpenClaw | >= 3.5 |

### Sprint 12D: Deliverables from Mock Day Run 2

1. `mock-day-run-2-log.md` — Full timestamped simulation log
2. `project-genesis-all-phases.md` — All 6 phase deliverables
3. `project-genesis-presentation.pdf` — Final slide deck
4. `sme-consultation-transcript.md` — CoS + SME panel session
5. `war-room-response-plan.md` — Full AI Response Plan
6. `digital-twin-learning-summary.md` — What the twin learned
7. `ai-quality-scorecard.md` — Scores for all 13 AI outputs
8. `issues-and-gaps-report-run-2.md` — Updated bug list with regression check
9. `debrief-summary-run-2.md` — Executive summary with overall score

**Target Stability Score for Run 2:** >= 7.0 / 10

---

*Last updated: 5 March 2026 — Phase 11 and Phase 12 added following Mock Day Run 1*
