# Changelog

All notable changes to CEPHO.AI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Phase 0 — Pre-Conditions (In Progress)

- [ ] P0-01: GitHub Actions CI/CD pipeline
- [ ] P0-02: Branch strategy and PR template
- [ ] P0-03: Secrets management migration
- [ ] P0-04: Database seed script
- [ ] P0-05: API contract tests
- [ ] P0-06: Performance budgets
- [ ] P0-07: Feature flag system
- [ ] P0-08: Agent learning loop architecture
- [ ] P0-09: Multi-user workspace architecture decision
- [ ] P0-10: Disaster recovery testing

### Phase 1 — Stabilise & Fix (Pending)

- [ ] SEC-01: Remove MOCK_ADMIN_USER auth bypass
- [ ] SEC-02: Remove hardcoded PIN 1111
- [ ] SEC-03: Fix CSRF token flow
- [ ] SEC-04: Centralise all env vars in render.yaml
- [ ] DB-01: Delete 105 orphaned database tables
- [ ] DB-02: Fix migration process
- [ ] DB-03: Harden database connection
- [ ] DB-04: Implement Row-Level Security
- [ ] API-01: Fix Victoria's Briefing PDF/Video/Audio null URL
- [ ] API-02: Replace in-memory workflow cache with database
- [ ] API-03: Implement all 26+ stubbed tRPC procedures
- [ ] FE-01: Fix Document Library crash (TypeError: C?.filter)
- [ ] FE-02: Fix Development Pathway crash (TypeError: C?.filter)
- [ ] FE-03: Rewrite Workflows page to use tRPC
- [ ] FE-04: Fix all broken routes

---

## [0.1.0] — 2026-03-01

### Added

- Initial platform deployment on Render
- Victoria's Briefing page (partial implementation)
- Evening Review page (partial implementation)
- Project Genesis wizard (partial implementation)
- Innovation Hub (partial implementation)
- AI Agents page with 49 agent registry
- Digital Twin Training page
- Persephone Board (AI-SME consultation)
- Document Library (partial — crashes on load)
- Development Pathway (partial — crashes on load)
- Settings page with 19 tabs (mostly stubbed)
- Workflows page (in-memory only, no persistence)
- Analytics page
- Operations dashboard

### Known Issues (to be fixed in Phase 1)

- CRITICAL: All visitors have admin access (MOCK_ADMIN_USER bypass active)
- CRITICAL: Hardcoded PIN 1111 accepts any login
- CRITICAL: Document Library crashes with TypeError on load
- CRITICAL: Development Pathway crashes with TypeError on load
- HIGH: Victoria's Briefing PDF/Video/Audio buttons navigate to /null
- HIGH: 105 orphaned database tables consuming storage
- HIGH: Workflows data lost on server restart (in-memory cache)
- HIGH: No CI/CD pipeline — manual deployments only
- MEDIUM: No mobile hamburger menu — sidebar overlaps content on mobile
- MEDIUM: 26+ tRPC procedures return stub data only
