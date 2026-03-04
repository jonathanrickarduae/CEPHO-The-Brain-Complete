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
