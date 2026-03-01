# CEPHO Platform — Master Documentation

**Version:** 2.0
**Last Updated:** March 1, 2026
**Status:** Active Development — Remediation Phase Complete

> This is the single source of truth for the CEPHO platform. All other documentation files are either archived or supplementary.

---

## 1. Platform Overview

CEPHO is an AI-powered command centre designed to act as a digital Chief of Staff for executive decision-making. It combines a learning Digital Twin with a team of 50+ AI Subject Matter Experts (SMEs), a virtual board of 14 top AI leaders (the Persephone Board), and a full suite of operational tools.

| Property | Value |
|----------|-------|
| **Live URL** | https://cepho-the-brain-complete.onrender.com |
| **Repository** | https://github.com/jonathanrickarduae/CEPHO-The-Brain-Complete |
| **Stack** | React + TypeScript + tRPC + Drizzle ORM + MySQL (TiDB) |
| **Deployment** | Render (Node.js web service, auto-deploy from `main`) |

---

## 2. Architecture

### 2.1 Monorepo Structure

```
the-brain-main/
├── client/                    # React + Vite frontend
│   └── src/
│       ├── components/        # Shared and feature components
│       ├── pages/             # 26 route-level page components
│       ├── lib/               # tRPC client, utilities
│       ├── hooks/             # Custom React hooks
│       └── stores/            # Zustand state stores
├── server/                    # Express + tRPC backend
│   ├── _core/                 # tRPC setup, middleware, context
│   ├── routers/               # 28 tRPC routers
│   ├── routes/                # REST route handlers (agents)
│   ├── services/              # Business logic services
│   └── prompts/               # LLM system prompts
├── drizzle/                   # Database schema + migrations
└── docs/                      # Supplementary documentation
```

### 2.2 Key Technology Decisions

| Layer | Technology | Reason |
|-------|-----------|--------|
| Frontend | React 18 + TypeScript | Type safety, component model |
| Styling | TailwindCSS + shadcn/ui | Consistent design system |
| API | tRPC | End-to-end type safety |
| ORM | Drizzle | Lightweight, type-safe SQL |
| Database | TiDB (MySQL-compatible) | Serverless, scalable |
| Auth | Session-based PIN gate | Simple, secure for single-user |
| AI | OpenAI GPT-4o-mini | Cost-effective, capable |
| Deployment | Render | Simple, reliable, auto-deploy |

---

## 3. Pages & Routes

| Route | Page Component | Description |
|-------|---------------|-------------|
| `/` | `NexusDashboard` | Main command centre dashboard |
| `/daily-brief` | `DailyBrief` | AI-generated morning briefing |
| `/chief-of-staff` | `ChiefOfStaff` | Task management + QA scoring |
| `/ai-agents` | `AIAgentsPage` | Agent directory |
| `/ai-agents/:id` | `AgentDetailPage` | Individual agent detail |
| `/ai-agents/monitoring` | `AIAgentsMonitoringPage` | Agent performance monitoring |
| `/ai-smes` | `AISMEsPage` | SME consultation panel |
| `/ai-experts` | `AIExperts` | Expert chat interface |
| `/expert-chat` | `ExpertChatPage` | 1-on-1 expert chat |
| `/persephone-board` | `PersephoneBoard` | Virtual board of 14 AI leaders |
| `/innovation-hub` | `InnovationHub` | Idea capture and validation |
| `/project-genesis` | `ProjectGenesisPage` | Project creation dashboard |
| `/project-genesis/new` | `ProjectGenesisWizard` | Step-by-step project wizard |
| `/document-library` | `DocumentLibrary` | Document management |
| `/vault` | `Vault` | Secure document storage |
| `/workflows` | `WorkflowsPage` | Workflow management |
| `/workflows/:id` | `WorkflowDetailPage` | Workflow detail view |
| `/operations` | `OperationsPage` | Operations overview |
| `/development-pathway` | `DevelopmentPathway` | Learning and development |
| `/cos-training` | `COSTraining` | Chief of Staff training |
| `/statistics` | `Statistics` | Analytics and metrics |
| `/evening-review` | `EveningReview` | End-of-day review |
| `/settings` | `Settings` | Platform configuration |
| `/login` | `Login` | Authentication |

---

## 4. AI System

### 4.1 Persephone Board (14 Members)

Each board member has a full knowledge corpus in `server/routers/expertChat.router.ts`. Members can be consulted via live AI chat on the `/persephone-board` page.

| ID | Name | Company | Expertise |
|----|------|---------|-----------|
| `altman` | Sam Altman | OpenAI | AGI Development & AI Safety |
| `huang` | Jensen Huang | NVIDIA | AI Hardware & Computing Infrastructure |
| `amodei` | Dario Amodei | Anthropic | Constitutional AI & Safety Research |
| `hassabis` | Sir Demis Hassabis | Google DeepMind | AI Research & Nobel Prize Winner |
| `pichai` | Sundar Pichai | Alphabet/Google | AI Integration & Product Strategy |
| `musk` | Elon Musk | xAI | AI Innovation & Grok Development |
| `lecun` | Yann LeCun | Meta | Deep Learning & Neural Networks |
| `hinton` | Geoffrey Hinton | Independent | Neural Networks & AI Safety Advocacy |
| `ng` | Andrew Ng | DeepLearning.AI | AI Education & Democratization |
| `li` | Fei-Fei Li | Stanford HAI | Computer Vision & Human-Centered AI |
| `nadella` | Satya Nadella | Microsoft | AI Enterprise Integration |
| `srinivas` | Aravind Srinivas | Perplexity AI | AI Search & Information Retrieval |
| `jassy` | Andy Jassy | Amazon | AI Cloud Infrastructure |
| `cook` | Tim Cook | Apple | AI Privacy & On-Device Intelligence |

### 4.2 AI SME Panel

50+ specialised AI agents defined in `client/src/data/ai-experts.data.ts`. Accessible via `/ai-smes` and `/ai-experts`.

---

## 5. Design System

### 5.1 Page Layout Standard

```tsx
<div className="min-h-screen bg-background">
  <div className="border-b border-border px-4 sm:px-6 py-4">
    <h1 className="text-xl sm:text-2xl font-bold text-foreground">Title</h1>
    <p className="text-sm text-muted-foreground mt-1">Subtitle</p>
  </div>
  <div className="p-4 sm:p-6 space-y-6">
    {/* content */}
  </div>
</div>
```

### 5.2 Rules

- Use `text-foreground` for content text (never `text-white`)
- Use `bg-card` for card backgrounds (never `bg-white dark:bg-card`)
- Use `bg-primary` for primary action buttons
- Use CSS variables for colours (never hardcoded hex)
- Use `text-muted-foreground` for secondary text

---

## 6. Remediation Status

| Item | Description | Status |
|------|-------------|--------|
| CD-01 | Remove obsolete features | ✅ Done |
| CD-02 | Consolidate documentation | ✅ Done |
| CD-03 | Unify naming conventions | ✅ Done |
| CD-04 | Delete duplicated files | ✅ Done |
| API-01 | Redesign Integrations page | ✅ Done |
| API-02 | Sync with Render & reality | ✅ Done |
| API-03 | Add missing integrations | ✅ Done |
| API-04 | Merge Vault into Settings | 🔄 In Progress |
| AI-01 | Full agent audit | ✅ Done |
| AI-02 | Central agent directory | ✅ Done |
| AI-03 | Operationalize agents | ✅ Done |
| PAGE-01 | Full routing audit | ✅ Done |
| PAGE-02 | Fix non-functional pages | ✅ Done |
| MOB-01 | Mobile-first layout | ✅ Done |
| MOB-02 | Portrait mode optimization | ✅ Done |
| UI-01 | Enforce design system | ✅ Done |
| UI-02 | Standardize page layouts | ✅ Done |
| UI-03 | Improve information density | ✅ Done |
| PB-01 | Persephone Board knowledge corpora | ✅ Done |
| PB-02 | Live consultation system | ✅ Done |
| PB-03 | Fine-tuned personas | ✅ Done |
| TS-01 | TypeScript errors | ✅ Done |
| DATA-01 | tRPC shape mismatches | ✅ Done |
| PERF-01 | React performance | ✅ Done |
| SEC-01 | Auth guards | ✅ Done |
| TEST-01 | Unit tests | ✅ Done |

---

## 7. Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `DATABASE_URL` | TiDB connection string | Yes |
| `OPENAI_API_KEY` | OpenAI API access | Yes |
| `SESSION_SECRET` | Session signing secret | Yes |
| `CSRF_SECRET` | CSRF token secret | Yes |
| `NODE_ENV` | `production` on Render | Yes |
| `NOTION_API_KEY` | Notion integration | Optional |
| `GITHUB_TOKEN` | GitHub integration | Optional |
| `ANTHROPIC_API_KEY` | Anthropic/Claude | Optional |
| `SYNTHESIA_API_KEY` | Synthesia video | Optional |

---

## 8. Development

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server (frontend + backend)
npx tsc --noEmit      # TypeScript check
npx vitest run        # Run tests
```

Push to `main` → Render auto-deploys. Build: `pnpm build`. Start: `node dist/server/index.js`.

---

*For supplementary documentation, see the `/docs` directory.*
