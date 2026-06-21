# CEPHO.AI — System Architecture

**Version**: 3.0 (v11)
**Last Updated**: March 2, 2026
**Status**: Final

---

## 1. Overview

CEPHO.AI is an autonomous platform designed to replicate and automate the core functions of a world-class Chief of Staff. It provides strategic insights, manages projects, automates workflows, and learns continuously to enhance executive decision-making and operational efficiency.

This document outlines the definitive architecture for the v11 release, reflecting all remediation work and strategic enhancements defined in the **Grand Master Plan v11**.

## 2. Technology Stack

| Layer          | Technology                         | Description                                            |
| :------------- | :--------------------------------- | :----------------------------------------------------- |
| **Backend**    | Node.js 22, TypeScript, Express.js | Core server environment.                               |
| **API**        | tRPC                               | End-to-end typesafe APIs between client and server.    |
| **Database**   | Supabase (PostgreSQL)              | Primary data store.                                    |
| **ORM**        | Drizzle ORM                        | Typesafe SQL query builder.                            |
| **Frontend**   | React 18, TypeScript, Vite         | Modern, fast, and scalable UI development.             |
| **Styling**    | TailwindCSS, Radix UI              | Utility-first CSS and accessible, unstyled components. |
| **State Mgmt** | TanStack Query (React Query)       | Server state management and caching.                   |
| **Deployment** | Render                             | Managed hosting for web services and databases.        |
| **AI**         | OpenAI GPT-4                       | Foundation model for all agent capabilities.           |
| **Auth**       | Supabase Auth (JWT, RLS)           | Secure user authentication and row-level security.     |

## 3. Project Structure (Post-Cleanup)

```
/ (root)
├── README.md                          # Single entry point to the project
├── CEPHO_Grand_Master_Plan_v11_FINAL.docx  # The single source of truth for the project
├── GRADES.md                          # Live quality tracker, updated on every deploy
├── CHANGELOG.md                       # Live changelog, updated on every PR
├── SECURITY.md                        # Security policy and vulnerability reporting
├── render.yaml                        # Render deployment configuration
├── .env.example                       # Environment variable template
├── docs/                              # All project documentation
│   ├── plan/
│   │   └── CEPHO_Grand_Master_Plan_v11_FINAL.docx  # Copy of the master plan for easy access
│   ├── specs/                         # All 41+ individual spec documents (PRD, API, etc.)
│   ├── processes/                     # All process docs (RUNBOOK, RELEASE_PROCESS, etc.)
│   ├── architecture/                  # This file, diagrams, and ADRs
│   └── archive/                       # All historical/outdated documents
├── client/                            # Frontend React application (54 pages)
├── server/                            # Backend Node.js application (19 services)
├── shared/                            # Code shared between client and server
├── drizzle/                           # Drizzle ORM schema and migrations (20 active tables)
├── scripts/                           # Automation and utility scripts
└── .github/                           # CI/CD workflows and PR templates
```

## 4. Database Architecture

- **Schema:** The database schema is now consolidated to **20 active tables**, with 105 orphaned tables removed. The definitive schema is documented in `docs/specs/DATA_DICTIONARY.md`.
- **Security:** All tables are protected by **Row-Level Security (RLS)** policies, ensuring users can only access their own data. This is a critical remediation from the previous architecture.
- **Migrations:** Database migrations are managed by Drizzle Kit. Changes are made in `drizzle/schema.ts` and pushed to the database via `pnpm drizzle-kit push:pg`.

## 5. API Architecture

- **tRPC:** The API is built entirely on tRPC, providing end-to-end type safety. All 55+ tRPC procedures are now fully implemented (no more stubs).
- **Authentication:** All procedures use `protectedProcedure` by default, requiring a valid Supabase JWT. The `MOCK_ADMIN_USER` bypass has been removed.
- **Routers:** Routers are organized by domain in `server/routers/`. Key routers include `auth`, `projects`, `tasks`, `briefings`, and `agentEngine`.

## 6. Frontend Architecture

- **Component-Based:** The frontend is built with reusable React components, organized by feature in `client/src/components/` and `client/src/pages/`.
- **Mobile-First:** The entire application is now fully responsive, following a mobile-first design approach. The layout adapts to all screen sizes, and the mobile hamburger menu is fully functional.
- **Design System:** A single, consistent design system is enforced, documented in `client/src/styles/design-system.md`. All components use standardized colors, typography, and button styles.

## 7. Autonomous Execution Layer (Phase 5)

This is the core innovation of v11, enabling the platform to execute complex, multi-step ventures with minimal human intervention.

- **Orchestrator:** A central service that manages the lifecycle of `AutonomousWorkflows`.
- **Agent Teams:** The Orchestrator assembles teams of specialist AI agents (e.g., Market Analyst, Financial Analyst) to execute different stages of a workflow.
- **Human Approval Gates:** Mandatory, non-bypassable checkpoints where the workflow halts and requires explicit user approval before proceeding with high-stakes actions.
- **Real-World Integration Layer:** Allows agents to interact with external services (e.g., sending emails, posting to social media) via secure, sandboxed APIs.

## 8. CI/CD & Deployment

- **CI/CD:** A full CI/CD pipeline is implemented in `.github/workflows/ci.yml`. It runs on every PR, performing type checking, linting, testing, and building.
- **Deployment:** The `main` branch is automatically deployed to production on Render. The `develop` branch is deployed to a staging environment.
- **Release Process:** All releases follow a strict process defined in `docs/processes/RELEASE_PROCESS.md`, including mandatory PR templates, code reviews, and updates to `CHANGELOG.md` and `GRADES.md`.
