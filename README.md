# CEPHO.AI — The Brain (v12)

**Version**: 12.2.0 | **Status**: Active Development — Phases 0–5 Complete  
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
- **Page-by-Page Process Inventory**: [`docs/PAGE_BY_PAGE_PROCESS_LIST.md`](./docs/PAGE_BY_PAGE_PROCESS_LIST.md)
- **Live Task Tracker**: [https://jonathanrickarduae.github.io/CEPHO-The-Brain-Complete/](https://jonathanrickarduae.github.io/CEPHO-The-Brain-Complete/)

### Current State (as of March 2026)

| Item                   | Status                   |
| :--------------------- | :----------------------- |
| Grand Master Plan v12  | **Finalised and locked** |
| Phases 0, 1, 2, 3      | **Complete**             |
| Phase 4                | **Complete & Audited**   |
| GitHub Pages dashboard | **Live and accurate**    |
| Phase 5 execution      | **In Progress**          |
| Code deployment        | **Live on Render**       |

### What Has Been Done

1. The Grand Master Plan v12 has been finalised, incorporating all spec documents, remediation plans, gap analysis, and the complete page-by-page process inventory.
2. The repository has been fully cleaned and restructured into a clear folder hierarchy.
3. A live interactive dashboard has been deployed to GitHub Pages tracking all tasks across all phases.
4. Phases 0 through 4 are fully complete, audited, and all known gaps have been remediated.

### Phase 4 Feature Summary (Post-Audit)

Phase 4 — "UX, Design System & Scale" — is now complete. All 24 tasks have been implemented and independently audited. All audit findings have been remediated.

| Feature Category               | Key Implementations                                                                                                                                                  |
| :----------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design System**              | `design-system.ts` (tokens, typography, spacing), `PageShell`, `PageGrid`, `PageSection` components                                                                  |
| **New Pages (10)**             | Email Accounts, Voice Notes, Subscription Tracker, Brand Kit, Analytics Deep Dive, Notifications Centre, Two-Factor Setup, Vault, AI Experts Directory, Agent Detail |
| **Pagination**                 | `usePagination` hook, `PaginationBar` component, `tasks.list` returns `{ tasks, total }` with offset/limit                                                           |
| **Caching (p4-5)**             | Redis-compatible cache service integrated into `tasks.list` and `projects.list` with TTL and auto-invalidation                                                       |
| **Multi-Workspace (p4-6)**     | `workspaces` schema tables, `workspaces.router.ts` (6 procedures), `WorkspaceSwitcher` UI component                                                                  |
| **Audit Logging (p4-7)**       | `writeAuditLog()` called on all sensitive mutations in tasks, settings, and auth routers                                                                             |
| **Rate Limiting (p4-8)**       | tRPC-level per-user rate limiting: `aiProcedure` (30/min), `rateLimitedProcedure` (60/min) applied to chat and CoS routers                                           |
| **Global Search (p4-9)**       | `globalSearch.router.ts` searches 5 entity types; `GlobalSearch.tsx` with Cmd+K shortcut                                                                             |
| **Push Notifications (p4-10)** | `web-push` package, VAPID key handling, `pushNotifications.router.ts`, `pushSubscriptions` schema table                                                              |
| **Accessibility (p4-11/12)**   | Skip-to-content link, `role="main"`, `aria-current`, `aria-label`, `aria-expanded` throughout                                                                        |
| **i18n + RTL (p4-13/14)**      | `i18n.ts` (EN/AR), `useI18n` hook, `LanguageSwitcher` component, `rtl.css` full RTL layout stylesheet                                                                |

### What To Do Next

**Continue Phase 6 — Enhancements, Agents & Innovation.** Key Phase 6 tasks include the agent ratings system, competitor intelligence engine, and the Innovation Hub.

Full detail for each task is on the [Live Dashboard](https://jonathanrickarduae.github.io/CEPHO-The-Brain-Complete/).

---

## Quick Links

| Resource                   | Link                                                                                                                             |
| :------------------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| **Grand Master Plan v12**  | [`docs/CEPHO_Grand_Master_Plan_v12_FINAL.md`](./docs/CEPHO_Grand_Master_Plan_v12_FINAL.md)                                       |
| **Page-by-Page Processes** | [`docs/PAGE_BY_PAGE_PROCESS_LIST.md`](./docs/PAGE_BY_PAGE_PROCESS_LIST.md)                                                       |
| **Live Dashboard**         | [https://jonathanrickarduae.github.io/CEPHO-The-Brain-Complete/](https://jonathanrickarduae.github.io/CEPHO-The-Brain-Complete/) |
| **Quality Grades**         | [`GRADES.md`](./GRADES.md)                                                                                                       |
| **Changelog**              | [`CHANGELOG.md`](./CHANGELOG.md)                                                                                                 |
| **Security Policy**        | [`SECURITY.md`](./SECURITY.md)                                                                                                   |
| **Phase 0 Spec**           | [`/docs/specs/phase0_preconditions.md`](./docs/specs/phase0_preconditions.md)                                                    |
| **Architecture**           | [`/docs/architecture/ARCHITECTURE.md`](./docs/architecture/ARCHITECTURE.md)                                                      |
| **Runbook**                | [`/docs/processes/RUNBOOK.md`](./docs/processes/RUNBOOK.md)                                                                      |

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

## Operations, Recovery & Credentials

All sensitive credentials, tokens, and environment-specific configurations are stored in `.env.local`. This file is **never** committed to Git. A template is available at `.env.example`.

| Item | Location | Notes |
| :--- | :--- | :--- |
| **GitHub PAT** | `.env.local` | `GITHUB_PAT` — for `git push` and API access |
| **Supabase Keys** | `.env.local` | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, etc. |
| **Database URL** | `.env.local` | `DATABASE_URL` for TiDB Cloud or Supabase Postgres |
| **OpenAI Key** | `.env.local` | `OPENAI_API_KEY` |
| **Sentry DSN** | `.env.local` | `SENTRY_DSN` (server) and `VITE_SENTRY_DSN` (client) |
| **Disaster Recovery** | `docs/specs/DISASTER_RECOVERY.md` | Full runbook for backups, restores, and migrations |
| **Live Dashboard** | `docs/dashboard/index.html` | The HTML file for the live project dashboard |
| **Grand Master Plan** | `docs/CEPHO_Grand_Master_Plan_v12_FINAL.md` | The single source of truth for the project plan |

---

## Development Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
cp .env.example .env
# Fill in all required values — see /docs/specs/DEVELOPER_ONBOARDING.md

# 3. Run database migrations
# Migrations now run automatically on server start (see server/migrations.ts)

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

| Phase       | Name                                 | Status          |
| :---------- | :----------------------------------- | :-------------- |
| **Phase 0** | Pre-Conditions & Foundation          | **Complete**    |
| **Phase 1** | Security, Stability & Code Cleanup   | **Complete**    |
| **Phase 2** | AI Agents, Memory & Digital Twin     | **Complete**    |
| **Phase 3** | Autonomous Operations & Intelligence | **Complete**    |
| **Phase 4** | UX, Design System & Scale            | **Complete**    |
| **Phase 5** | Ops Excellence & Observability       | **Complete**    |
| **Phase 6** | Enhancements, Agents & Innovation    | Not started     |
| **Phase 7** | Monetisation & Enterprise            | Not started     |

Full task breakdown for every phase is on the **[Live Dashboard](https://jonathanrickarduae.github.io/CEPHO-The-Brain-Complete/)**.

---

## Operations & Recovery

> **CRITICAL:** This section outlines how to manage credentials and recover the application. All files mentioned here contain sensitive information and are **gitignored**.

### The Master Recovery Document

The single source of truth for all credentials, API keys, and recovery procedures is the **Master Recovery Document**. This is the first place to look if you are locked out or need a password.

- **Location**: `docs/CEPHO_MASTER_RECOVERY_DOCUMENT.md`
- **Status**: **Gitignored**. It will never be committed to the repository.
- **Backup**: A copy is also maintained in the project's Google Drive.

### Environment Variables & Credentials

All environment variables for local development are stored in `.env.local`. This file is created by copying `.env.example` and filling in the values from the Master Recovery Document.

| File | Purpose |
| :--- | :--- |
| `.env.local` | Contains all 71+ environment variables for local development. **Gitignored**. |
| `.env.example` | A template file that lists all required environment variables. |
| `docs/CEPHO_MASTER_RECOVERY_DOCUMENT.md` | Contains the actual values for all credentials. **Gitignored**. |
| `scripts/restore_all_render.py` | Script to restore all Render & GitHub credentials. **Gitignored**. |

### How to Restore All Credentials (Render & GitHub)

Render occasionally loses environment variables. A script is provided to restore all 71+ variables to the Render service and all 14 secrets to the GitHub repository via their respective APIs.

**To run the restore script:**

1.  **Locate the script:** The script is at `scripts/restore_all_render.py`. It is gitignored.
2.  **Run from the project root:**

    ```bash
    # Run this from the /home/ubuntu/cepho-audit/ directory
    python3 scripts/restore_all_render.py
    ```

This script will:
- Read all credentials from its own source code.
- Update all 71+ environment variables on the Render production service (`cepho-the-brain-complete`).
- Update all 14 corresponding secrets in the GitHub repository for GitHub Actions.
- Automatically trigger a new deployment on Render.

> **Note:** The script uses the `RENDER_API_KEY` and `GITHUB_TOKEN` defined within it to authenticate. If these tokens expire, they must be updated in the script itself and in the Master Recovery Document.
