# CEPHO.AI — Master Project Context

> **Read this first.** This file is the single source of truth for the current state of the project. Any new session should read this file before taking any action.

---

## 1. What Is This Project?

CEPHO.AI is an autonomous AI Chief of Staff platform. It is designed to replicate and automate the core functions of a world-class Chief of Staff for a single executive user (Victoria). The platform uses a team of 55 specialist AI agents (SMEs), a Digital Twin of the user, and a self-reinforcing Innovation Flywheel to plan, execute, and learn from every task.

The ultimate end state is **One-Sentence Execution**: the user states a high-level goal in a single sentence, and the platform — orchestrated by the Chief of Staff agent and visualized on the Persephone Board — executes it from start to finish.

---

## 2. Current Platform State

| Area | Current Grade | Target Grade |
|---|---|---|
| Security | E (MOCK_ADMIN_USER bypass active) | A |
| AI Agents | D (most procedures are stubs) | A |
| Digital Twin | D (questionnaire exists, no real cognitive model) | A |
| Automation | E (all cron runs client-side only) | A |
| Settings | D (only Profile tab is wired) | A |
| Mobile UX | C (sidebar overlaps on mobile) | A |
| Innovation Hub | B (UI exists, flywheel partially wired) | A |
| Persephone Board | B (UI exists, hardcoded data) | A |
| Document Generation | C (PDF service exists, no templating engine) | A |
| Onboarding | E (no guided flow) | A |

---

## 3. The Grand Master Plan

The definitive blueprint for the entire build is:

**`docs/plan/CEPHO_Grand_Master_Plan_v10_FINAL.docx`**

This is the **only** document to work from. It contains all 8 phases, all appendices (A through W), and the complete specification for every component.

### Phase Summary

| Phase | Name | Core Focus | Grade |
|---|---|---|---|
| Phase 0 | Pre-Conditions & Toolchain | CI/CD, branch strategy, env vars, seed data, ADRs, toolchain setup | E → D |
| Phase 1 | Stabilise & Fix | All crashes, security holes, broken routes, orphaned tables | D → B |
| Phase 2 | Digital Twin & Intelligence | 4-module Digital Twin, vector DB, agent memory, Shadow Mode | B → A- |
| Phase 3 | Innovation, Voice & Automation | Innovation Hub, voice-first interface, push briefings, CEPHO Score | A- → A |
| Phase 4 | Flywheel, Scale & Teams | Innovation Flywheel engine, monetisation, multi-tenancy, teams | A → A+ |
| Phase 5 | Operational Excellence & Learning | Outcome tracking, runbook, alerting, audit log, pen testing, DR/BC | A+ → A+* |
| Phase 6 | Differentiated Intelligence | Agent performance dashboard, continuous learning, War Room | A+* → A+** |
| Phase 7 | Full Autonomy | Autonomous Execution Engine, Persephone Board, One-Sentence Execution | A+** → A+*** |
| Phase 8 | Admin & Governance | Admin dashboard, RBAC, settings engine, onboarding flow | A+*** → A+**** |

---

## 4. Development Toolchain

| Tool | Role | Status |
|---|---|---|
| **Manus AI** | Planning, architecture, code writing, execution, debugging | Active |
| **Snyk Code** | Automated security scanning in CI/CD pipeline | Token stored in GitHub Secrets as `SNYK_TOKEN` |
| **Claude Code** | Large-scale multi-file implementation sprints | API key stored in Render as `ANTHROPIC_API_KEY` |
| **GitHub** | Version control, CI/CD, and project memory | Repo: `jonathanrickarduae/CEPHO-The-Brain-Complete` |
| **Render** | Hosting and deployment | Production environment |
| **Supabase** | Database (PostgreSQL + pgvector) | Active |

---

## 5. Key Architectural Decisions

- **Framework:** TypeScript, React (Vite), tRPC, Drizzle ORM, TailwindCSS
- **Database:** Supabase (PostgreSQL). The main schema is at `drizzle/schema.ts` (168 tables defined).
- **AI:** Anthropic Claude via `server/services/anthropic.service.ts`
- **Voice:** ElevenLabs via `server/services/voice.service.ts`
- **Auth:** PIN-based login with JWT. The MOCK_ADMIN_USER bypass in `server/_core/context.ts` **must be removed in Phase 1.**
- **Agents:** 55 agents defined in `server/routes/agents.ts`
- **Stripe:** Products defined in `server/stripe/products.ts` (Free, Pro at £49/mo, Enterprise)

---

## 6. Key Files & Folders

| Path | Description |
|---|---|
| `docs/plan/CEPHO_Grand_Master_Plan_v10_FINAL.docx` | The definitive Grand Master Plan |
| `docs/CONTEXT.md` | This file — the master context |
| `docs/specs/digital_twin_spec.md` | Digital Twin architecture |
| `docs/specs/autonomous_execution_spec.md` | Autonomous Execution Engine & Persephone Board |
| `docs/specs/innovation_hub_spec.md` | Innovation Hub & Flywheel architecture |
| `docs/specs/final_gaps_spec.md` | The 5 final gaps and their solutions |
| `docs/plan-generation/gen_final_plan_v10.py` | Python script to regenerate the plan document |
| `server/routes/agents.ts` | All 55 agent definitions |
| `server/prompts/digital-twin.ts` | The Digital Twin system prompt |
| `server/stripe/products.ts` | Stripe pricing tiers |
| `drizzle/schema.ts` | The main database schema (168 tables) |
| `server/routers/stubs/remaining.router.ts` | All stubbed tRPC procedures to implement |

---

## 7. What To Do Next (Phase 0 Checklist)

- [ ] **P0-01:** Set up GitHub Actions CI/CD pipeline (`.github/workflows/ci.yml`)
- [ ] **P0-02:** Set up branch protection rules and PR template
- [ ] **P0-03:** Verify all 31 environment variables are set in Render (see Appendix E of the plan)
- [ ] **P0-04:** Write and run the database seed script (`scripts/seed.ts`)
- [ ] **P0-05:** Write Architecture Decision Records in `/docs/decisions/`
- [ ] **P0-06:** Add `SNYK_TOKEN` to GitHub Secrets and add Snyk step to CI pipeline
- [ ] **P0-07:** Write the full test strategy document (`docs/TESTING.md`)

---

## 8. Snyk Token

The Snyk API token has been provided and must be added to GitHub repository secrets as `SNYK_TOKEN`. This enables automated security scanning in the CI/CD pipeline.

---

*Last updated: March 2026 | Version: 10.0*
