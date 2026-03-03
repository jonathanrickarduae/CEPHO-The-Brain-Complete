# CEPHO.AI — The Brain (v12)

**Version**: 12.1.0 | **Status**: Active Development — Phases 0–4 Complete, Phase 5 In Progress  
**Owner**: Jonathan Rickard  
**Live Dashboard**: [https://jonathanrickarduae.github.io/CEPHO-The-Brain-Complete/](https://jonathanrickarduae.github.io/CEPHO-The-Brain-Complete/)

---

## What Is This?

CEPHO.AI is an autonomous platform designed to replicate and automate the core functions of a world-class Chief of Staff. It provides strategic insights, manages projects, automates workflows, and learns continuously to enhance executive decision-making and operational efficiency.

The platform is built around **Victoria** — a personalised AI Chief of Staff — supported by a board of 50+ specialist AI agents (The Persephone Board), a Digital Twin of the user, and an Innovation Hub flywheel.

---

## CRITICAL: Read This First on Any Fresh Session

> **If you are starting a new session, this is your briefing. Do not ask what to do — read this document and the Grand Master Plan v12 first.**

### The Single Source of Truth

The **Grand Master Plan v12** is the definitive plan for this project. It is the only plan. Do not reference any other plan documents. v12 adds the complete page-by-page process inventory with all processes explicitly mapped and assigned to phases.

- **Plan Document (v12)**: [`docs/CEPHO_Grand_Master_Plan_v12_FINAL.md`](./docs/CEPHO_Grand_Master_Plan_v12_FINAL.md)
- **Plan Document (v11 — archive)**: [`CEPHO_Grand_Master_Plan_v11_FINAL.docx`](./CEPHO_Grand_Master_Plan_v11_FINAL.docx)
- **Page-by-Page Process Inventory**: [`docs/PAGE_BY_PAGE_PROCESS_LIST.md`](./docs/PAGE_BY_PAGE_PROCESS_LIST.md)
- **Live Task Tracker**: [https://jonathanrickarduae.github.io/CEPHO-The-Brain-Complete/](https://jonathanrickarduae.github.io/CEPHO-The-Brain-Complete/)

### Current State (as of March 2026)

| Item                   | Status                   |
| :--------------------- | :----------------------- |
| Grand Master Plan v12  | **Finalised and locked** |
| Phases 0, 1, 2, 3      | **Complete**             |
| Phase 4                | **Complete**             |
| GitHub Pages dashboard | **Live**                 |
| Phase 5 execution      | **In Progress**          |
| Code deployment        | **Live on Render**       |

### What Has Been Done

1. The Grand Master Plan v12 has been finalised, incorporating all spec documents, remediation plans, gap analysis, audit findings, and the complete page-by-page process inventory.
2. The repository has been fully cleaned and restructured into a clear folder hierarchy.
3. A live interactive dashboard has been deployed to GitHub Pages tracking all tasks across all phases.
4. Phases 0 through 4 are fully complete and verified.

### Phase 4 Feature Summary

Phase 4 — "UX, Design System & Scale" — is now complete. All 24 tasks have been implemented and independently audited.

| Feature Category | Key Implementations |
| :--- | :--- |
| **Design System** | `design-system.ts` (tokens, typography, spacing), `PageShell`, `PageGrid`, `PageSection` components |
| **New Pages (10)** | Email Accounts, Voice Notes, Subscription Tracker, Brand Kit, Analytics Deep Dive, Notifications Centre, Two-Factor Setup, Vault, AI Experts Directory, Agent Detail |
| **Pagination** | `usePagination` hook, `PaginationBar` component, `tasks.list` returns `{ tasks, total }` with offset/limit |
| **Caching (p4-5)** | Redis-compatible cache service integrated into `tasks.list` and `projects.list` with TTL and auto-invalidation |
| **Multi-Workspace (p4-6)** | `workspaces` schema tables, `workspaces.router.ts` (6 procedures), `WorkspaceSwitcher` UI component |
| **Audit Logging (p4-7)** | `writeAuditLog()` called on all sensitive mutations in tasks and settings routers |
| **Rate Limiting (p4-8)** | tRPC-level per-user rate limiting: `aiProcedure` (30/min), `rateLimitedProcedure` (60/min) |
| **Global Search (p4-9)** | `globalSearch.router.ts` searches 5 entity types; `GlobalSearch.tsx` with Cmd+K shortcut |
| **Push Notifications (p4-10)** | `web-push` package, VAPID key handling, `pushNotifications.router.ts`, `pushSubscriptions` schema table |
| **Accessibility (p4-11/12)** | Skip-to-content link, `role="main"`, `aria-current`, `aria-label`, `aria-expanded` throughout |
| **i18n + RTL (p4-13/14)** | `i18n.ts` (EN/AR), `useI18n` hook, `LanguageSwitcher` component, `rtl.css` full RTL layout stylesheet |

### What To Do Next

**Continue Phase 5 — Ops Excellence & Observability.** Key Phase 5 tasks include Sentry integration, onboarding wizard, offline PWA support, structured logging, AI cost tracking, and performance budgets.

Full detail for each task is on the [Live Dashboard](https://jonathanrickarduae.github.io/CEPHO-The-Brain-Complete/).

---

## Quick Links

| Resource                  | Link                                                                                                                             |
| :------------------------ | :------------------------------------------------------------------------------------------------------------------------------- |
| **Grand Master Plan v12** | [`docs/CEPHO_Grand_Master_Plan_v12_FINAL.md`](./docs/CEPHO_Grand_Master_Plan_v12_FINAL.md)                                         |
| **Grand Master Plan v11** | [`CEPHO_Grand_Master_Plan_v11_FINAL.docx`](./CEPHO_Grand_Master_Plan_v11_FINAL.docx) *(archive)*                                   |
| **Page-by-Page Processes** | [`docs/PAGE_BY_PAGE_PROCESS_LIST.md`](./docs/PAGE_BY_PAGE_PROCESS_LIST.md)                                                        |
| **Live Dashboard**        | [https://jonathanrickarduae.github.io/CEPHO-The-Brain-Complete/](https://jonathanrickarduae.github.io/CEPHO-The-Brain-Complete/) |
| **Quality Grades**        | [`GRADES.md`](./GRADES.md)                                                                                                       |
| **Changelog**             | [`CHANGELOG.md`](./CHANGELOG.md)                                                                                                 |
| **Security Policy**       | [`SECURITY.md`](./SECURITY.md)                                                                                                   |
| **Phase 0 Spec**          | [`/docs/specs/phase0_preconditions.md`](./docs/specs/phase0_preconditions.md)                                                    |
| **Architecture**          | [`/docs/architecture/ARCHITECTURE.md`](./docs/architecture/ARCHITECTURE.md)                                                      |
| **Runbook**               | [`/docs/processes/RUNBOOK.md`](./docs/processes/RUNBOOK.md)                                                                      |

---

## Documentation Structure

All project documentation lives in `/docs`:

| Folder                                        | Contents                                                                                                     |
| :-------------------------------------------- | :----------------------------------------------------------------------------------------------------------- |
| [`/docs/plan/`](./docs/plan/)                 | Copy of the Grand Master Plan v11                                                                            |
| [`/docs/specs/`](./docs/specs/)               | All 41+ individual specification documents (PRD, Data Dictionary, API Docs, Phase specs, Gap Analysis, etc.) |
| [`/docs/processes/`](./docs/processes/)       | Runbook, Release Process, Incident Response, Governance, Developer Onboarding, Quality Review Cadence        |
| [`/docs/architecture/`](./docs/architecture/) | System Architecture, Security Configuration, Process Flow Diagrams, ADRs                                     |
| [`/docs/archive/`](./docs/archive/)           | All historical documents from previous versions (v1–v10)                                                     |

---

## Tech Stack

| Layer          | Technology                              |
| :------------- | :-------------------------------------- |
| **Frontend**   | React 18, TypeScript, Vite, TailwindCSS |
| **Backend**    | Node.js, Express, TypeScript            |
| **Database**   | PostgreSQL (Supabase), Drizzle ORM      |
| **Auth**       | Supabase Auth (JWT + RLS)               |
| **AI**         | OpenAI GPT-4o / GPT-4o-mini, pgvector   |
| **Deployment** | Render (production + staging)           |
| **CI/CD**      | GitHub Actions                          |
| **Monitoring** | Sentry (planned)                        |

---

## Development Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
cp .env.example .env
# Fill in all required values — see /docs/specs/DEVELOPER_ONBOARDING.md

# 3. Run database migrations
pnpm drizzle-kit push:pg

# 4. Start the development server
pnpm dev
```

### Key Scripts

| Command          | Purpose                                    |
| :--------------- | :----------------------------------------- |
| `pnpm dev`       | Start development server (client + server) |
| `pnpm build`     | Build for production                       |
| `pnpm test:unit` | Run unit tests                             |
| `pnpm check`     | TypeScript type checking                   |
| `pnpm db:studio` | Open Drizzle Studio                        |

---

## Deployment

- **Production**: `main` branch → auto-deploys to Render
- **Staging**: `develop` branch → auto-deploys to Render staging
- **Dashboard**: GitHub Pages → auto-deploys on every push to `main`
- All deployment config is in `render.yaml`

---

## Branch Strategy

| Branch      | Purpose                                         |
| :---------- | :---------------------------------------------- |
| `main`      | Production — protected, requires PR + review    |
| `develop`   | Staging — integration branch                    |
| `feature/*` | Feature branches — branch from `develop`        |
| `fix/*`     | Bug fix branches                                |
| `hotfix/*`  | Emergency production fixes — branch from `main` |

---

## Project Phases Overview

| Phase       | Name                                 | Status        |
| :---------- | :----------------------------------- | :------------ |
| **Phase 0** | Pre-Conditions & Foundation          | **Complete**       |
| **Phase 1** | Security, Stability & Code Cleanup   | **Complete**       |
| **Phase 2** | AI Agents, Memory & Digital Twin     | **Complete**       |
| **Phase 3** | Autonomous Operations & Intelligence | **Complete**       |
| **Phase 4** | UX, Design System & Scale            | **Complete**       |
| **Phase 5** | Ops Excellence & Observability       | **In Progress**    |
| **Phase 6** | Enhancements, Agents & Innovation    | Not started        |
| **Phase 7** | Monetisation & Enterprise            | Not started        |

Full task breakdown for every phase is on the **[Live Dashboard](https://jonathanrickarduae.github.io/CEPHO-The-Brain-Complete/)**.
