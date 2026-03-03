# CEPHO.AI — The Brain (v11)

**Version**: 11.0.0 | **Status**: Active Development — Phase 0 Execution  
**Owner**: Jonathan Rickard  
**Live Dashboard**: [https://jonathanrickarduae.github.io/CEPHO-The-Brain-Complete/](https://jonathanrickarduae.github.io/CEPHO-The-Brain-Complete/)

---

## What Is This?

CEPHO.AI is an autonomous platform designed to replicate and automate the core functions of a world-class Chief of Staff. It provides strategic insights, manages projects, automates workflows, and learns continuously to enhance executive decision-making and operational efficiency.

The platform is built around **Victoria** — a personalised AI Chief of Staff — supported by a board of 50+ specialist AI agents (The Persephone Board), a Digital Twin of the user, and an Innovation Hub flywheel.

---

## CRITICAL: Read This First on Any Fresh Session

> **If you are starting a new session, this is your briefing. Do not ask what to do — read this document and the Grand Master Plan v11 first.**

### The Single Source of Truth

The **Grand Master Plan v11** is the definitive plan for this project. It is the only plan. Do not reference any other plan documents.

- **Plan Document**: [`CEPHO_Grand_Master_Plan_v11_FINAL.docx`](./CEPHO_Grand_Master_Plan_v11_FINAL.docx)
- **Live Task Tracker**: [https://jonathanrickarduae.github.io/CEPHO-The-Brain-Complete/](https://jonathanrickarduae.github.io/CEPHO-The-Brain-Complete/)

### Current State (as of March 2026)

| Item                   | Status                   |
| :--------------------- | :----------------------- |
| Grand Master Plan v11  | **Finalised and locked** |
| Repository cleanup     | **Complete**             |
| GitHub Pages dashboard | **Live**                 |
| Phase 0 execution      | **Next to begin**        |
| Code deployment        | **Not yet started**      |

### What Has Been Done

1. The Grand Master Plan v11 has been finalised, incorporating all spec documents, remediation plans, gap analysis, audit findings, Phase 5 autonomous execution design, and all appendices (A–AK).
2. The repository has been fully cleaned and restructured into a clear folder hierarchy.
3. A live interactive dashboard has been deployed to GitHub Pages tracking all 133 tasks across 8 phases (including 50 gap items).
4. All 20 gap analysis items have been integrated into the correct phases of the plan.

### What To Do Next

**Start Phase 0 — Pre-Conditions & Foundation.** Every task in Phase 0 must be completed before any Phase 1 work begins. The Phase 0 tasks are:

1. CI/CD pipeline setup (GitHub Actions)
2. Branch strategy: `main` / `develop` / `feature/*`
3. Environment variables fully documented in `.env.example`
4. Seed data scripts for all core tables
5. Architectural Decision Records (ADRs) directory created
6. Pre-commit hooks (lint + type-check)
7. Staging environment on Render configured
8. Testing strategy defined (unit, integration, E2E targets)
9. Security penetration testing plan (OWASP Top 10)

Full detail for each task is in [`/docs/specs/phase0_preconditions.md`](./docs/specs/phase0_preconditions.md).

---

## Quick Links

| Resource                  | Link                                                                                                                             |
| :------------------------ | :------------------------------------------------------------------------------------------------------------------------------- |
| **Grand Master Plan v11** | [`CEPHO_Grand_Master_Plan_v11_FINAL.docx`](./CEPHO_Grand_Master_Plan_v11_FINAL.docx)                                             |
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
| **Phase 0** | Pre-Conditions & Foundation          | Next to begin |
| **Phase 1** | Security, Stability & Code Cleanup   | Not started   |
| **Phase 2** | AI Agents, Memory & Digital Twin     | Not started   |
| **Phase 3** | Autonomous Operations & Intelligence | Not started   |
| **Phase 4** | UX, Design System & Scale            | Not started   |
| **Phase 5** | Ops Excellence & Observability       | Not started   |
| **Phase 6** | Enhancements, Agents & Innovation    | Not started   |
| **Phase 7** | Monetisation & Enterprise            | Not started   |

Full task breakdown for every phase is on the **[Live Dashboard](https://jonathanrickarduae.github.io/CEPHO-The-Brain-Complete/)**.
