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
