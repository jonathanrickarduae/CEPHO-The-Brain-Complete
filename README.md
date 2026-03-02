# CEPHO.AI — The Brain (v11)

**Version**: 11.0.0
**Status**: Production Ready

---

CEPHO.AI is an autonomous platform designed to replicate and automate the core functions of a world-class Chief of Staff. It provides strategic insights, manages projects, automates workflows, and learns continuously to enhance executive decision-making and operational efficiency.

This repository contains the complete source code and documentation for the CEPHO.AI platform.

## Quick Links

- **The Grand Master Plan v11:** [`./CEPHO_Grand_Master_Plan_v11_FINAL.docx`](./CEPHO_Grand_Master_Plan_v11_FINAL.docx)
- **Live Quality Grades:** [`./GRADES.md`](./GRADES.md)
- **Changelog:** [`./CHANGELOG.md`](./CHANGELOG.md)
- **Security Policy:** [`./SECURITY.md`](./SECURITY.md)

## Documentation Hub

All project documentation is now consolidated in the `/docs` directory.

| Category | Path | Description |
| :--- | :--- | :--- |
| **The Plan** | [`/docs/plan/`](./docs/plan/) | Contains a copy of the Grand Master Plan v11. |
| **Specifications** | [`/docs/specs/`](./docs/specs/) | Contains all 41+ individual specification documents (PRD, Data Dictionary, API Docs, etc.). |
| **Processes** | [`/docs/processes/`](./docs/processes/) | Contains all process and governance documents (Runbook, Release Process, Governance, etc.). |
| **Architecture** | [`/docs/architecture/`](./docs/architecture/) | Contains the System Architecture, diagrams, and Architectural Decision Records (ADRs). |
| **Archive** | [`/docs/archive/`](./docs/archive/) | Contains all historical and outdated documents from previous versions. |

## Development

### Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
cp .env.example .env

# 3. Run database migrations
pnpm drizzle-kit push:pg

# 4. Start the development server
pnpm dev
```

### Key Scripts

- `pnpm dev`: Start the development server for client and server.
- `pnpm build`: Build the project for production.
- `pnpm test:unit`: Run all unit tests.
- `pnpm check`: Run TypeScript type checking.
- `pnpm db:studio`: Open Drizzle Studio to view the database.

## Deployment

The `main` branch is automatically deployed to production on Render. The `develop` branch is deployed to a staging environment. All deployments are configured in `render.yaml`.
