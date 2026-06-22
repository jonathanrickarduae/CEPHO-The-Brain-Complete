# CEPHO.AI — Innovation Hub to Project Genesis: End-to-End Process Flow & Gap Analysis

**Document Version:** 1.0  
**Date:** June 2026  
**Classification:** Internal — Strategic  
**Prepared by:** Manus AI (Chief of Staff Analysis)

---

## Executive Summary

This document maps the complete process flow from the moment an idea enters the CEPHO Innovation Hub through to its execution inside Project Genesis. It identifies every step that is currently **built and automated**, every step that is **documented but still manual**, and every step that is **missing entirely** — with a clear recommendation for which agent or automated process should fill each gap.

The core finding is this: the **flywheel concept is sound and partially built**, but the connection between the Innovation Hub and Project Genesis is a one-way gate rather than a true flywheel. Once an idea is promoted to Genesis, the automated intelligence of the Innovation Hub (AI agents, SME triggers, assessment scoring) does not continue to drive the Genesis phases forward. The Genesis project sits in a command centre that requires entirely manual input to advance. This is the single most important gap to close.

---

## Part 1: The Intended Architecture

The CEPHO system is designed around a three-layer intelligence flywheel:

| Layer | System | Purpose |
|---|---|---|
| **Idea Generation** | Innovation Hub | Capture, score, and filter ideas from agents, users, and external signals |
| **Strategic Development** | Project Genesis | Transform validated ideas into investor-ready business plans and execution roadmaps |
| **Execution & Monitoring** | Project Command Centre | Track milestones, risks, finance, and team against the Genesis plan |

The flywheel is intended to be self-reinforcing: agents generate ideas, the best ideas are validated and promoted, Genesis turns them into plans, execution generates learnings, and those learnings feed back into the next generation of ideas. The Chief of Staff (Victoria) sits across all three layers, orchestrating the flow and ensuring quality.

---

## Part 2: Current State — What Is Built

### 2.1 Innovation Hub (Stages 1–5 + Promotion)

The Innovation Hub is the most complete part of the system. The following capabilities are **live and functional**:

| Stage | Name | What Is Automated |
|---|---|---|
| 1 | **Capture** | `captureIdea` mutation stores ideas; `backfillAgentIdeas` generates ideas from 10 specialist AI agents on demand; `analyzeArticle` extracts ideas from URLs |
| 2 | **Assess** | `runAssessment` invokes LLM to score ideas across five dimensions (risk, financial viability, competitive landscape, feasibility, market analysis) and stores results |
| 3 | **Consult** | `generateScenarios` produces three investment scenarios (bootstrap, budget, full); `assessForFunding` matches ideas to funding programmes |
| 4 | **Refine** | `advanceFlywheelStage` advances an idea through the six-stage flywheel and updates status |
| 5 | **Brief** | `generateBrief` produces a structured innovation brief document (as seen in `CEPHO-IB-MKI4N20B`) |
| → | **Promote** | `promoteToGenesis` creates a live Project Genesis record, seeds all six phases, marks the idea as promoted, and triggers a Persephone Board SME review record |

The flywheel stats endpoint (`getFlywheelStats`) provides a real-time dashboard view of ideas across all stages.

**What is missing at this layer:** There is no **scheduled agent job** running daily to automatically generate and assess ideas. The `backfillAgentIdeas` and `generateDailyIdeas` mutations exist but must be triggered manually. No heartbeat cron job has been registered to call them automatically.

### 2.2 Project Genesis (Phases 0–8 in Documentation; 6 Phases in Code)

The Genesis system has a significant gap between what the documentation describes and what the code implements.

**What is built:**

| Procedure | What It Does |
|---|---|
| `initiate` | Creates a project with name, type, description, and seeds six phases |
| `updatePhase` | Manually updates a phase's status, notes, and completion |
| `generatePresentationSlides` | LLM-generates slide content for up to 15 slide types |
| `toggleQualityCheck` | Marks individual quality gate checklist items as complete |
| `getProjectPhases` | Returns all phases with their completion status |
| `deleteProject` | Removes a project |

**What the documentation describes but is not built:**

The `PROJECT_GENESIS_MASTER_PROCESS.md` defines **nine phases (Phase 0–8)**, each with a specific trigger, task list, SME team reference, and prompt to use. The code implements only **six generic phases** (Discovery & Validation, Business Model Design, Go-to-Market Strategy, Financial Projections, Team & Operations, Launch Preparation) with no automated triggers between them.

The nine documented phases and their automation status are as follows:

| Phase | Name | Trigger | Built? | Agent Gap |
|---|---|---|---|---|
| 0 | Voice Note Intake & Scope Alignment | User submits voice note or brief | Partial — text intake exists; voice transcription not wired to Genesis | **Agent should:** transcribe voice note, extract project parameters, pre-populate Genesis wizard |
| 1 | Expert Team Assembly & SWOT | Scope confirmed | Not built | **Agent should:** classify project type, select 12-person SME team from 287-expert directory, run SWOT, generate risk register |
| 2 | Deep Dive Research & Gap Identification | Team assembled | Not built | **Agent should:** dispatch parallel research tasks to each SME, aggregate findings, produce gap identification report |
| 3 | Triple Validation & Risk Mitigation | Research complete | Not built | **Agent should:** validate all claims at confidence thresholds (80–95%), run customer focus group survey against persona database, check Insights Repository for prior research |
| 4 | Master Report & Strategic Planning | Validation complete | Partial — slide generation exists | **Agent should:** compile full master report, generate KPI heat map, run individual SME scoring |
| 5 | McKinsey Business Plan Development | Report approved | Not built | **Agent should:** generate full 15-section business plan following McKinsey framework, apply 100% Optimisation Scorecard |
| 6 | Presentation & Funding Materials | Business plan complete | Partial — slide content generation exists; Gamma integration is a documented gap | **Agent should:** structure slide content, push to Gamma API for design, apply brand theme |
| 7 | Video & Stakeholder Communication | Presentation complete | Not built | **Agent should:** write explainer video script, generate voice note updates via ElevenLabs, create stakeholder communication plan |
| 8 | Execution & Monitoring | All materials complete | Partial — Project Command Centre handles this | **Agent should:** auto-generate weekly status reports, update risk register, send Telegram briefings to owner |

### 2.3 Project Command Centre

The Command Centre (`ProjectPortal`) is well-built for manual project management. It supports milestones, tasks, finance tracking, risk register, communications log, and automation rules. However, it operates independently of the Genesis phase system — there is no automatic creation of Command Centre milestones when a Genesis phase is completed, and no feedback loop from Command Centre data back into the Innovation Hub.

### 2.4 Victoria (Chief of Staff)

Victoria has the richest set of AI procedures: morning briefing, task scoring, agent report review, SME review triage, quality checks, project review, document review, task delegation, and meeting brief preparation. However, **none of these run automatically**. Every procedure is a `mutation` or `query` that must be called from the UI. There is no heartbeat job that runs Victoria's review cycle on a schedule.

---

## Part 3: Gap Analysis

### 3.1 Summary by Category

| Category | Completeness | Gap Priority |
|---|---|---|
| Idea Capture (manual + agent) | 85% | Low — works well, just needs scheduling |
| Idea Assessment & Scoring | 80% | Low — functional, needs daily automation |
| Innovation → Genesis Promotion | 90% | Low — works, Persephone trigger is passive |
| Genesis Phase Automation | 15% | **Critical** |
| SME Team Assembly | 0% | **Critical** |
| Deep Dive Research Pipeline | 0% | **Critical** |
| Triple Validation Engine | 0% | **Critical** |
| Business Plan Generation | 10% | High |
| Gamma Presentation Integration | 0% | High |
| ElevenLabs Voice Briefings | 0% | High |
| Victoria Scheduled Operations | 0% | **Critical** |
| Command Centre ↔ Genesis Sync | 0% | High |
| Insights Repository (learning loop) | 20% | Medium |

### 3.2 The Five Critical Gaps

**GAP-C1: No Scheduled Agent Operations**

The entire system depends on users manually triggering every AI action. The Innovation Hub agents do not generate ideas daily. Victoria does not run her morning review. SME triggers sit in the database as `pending` indefinitely. The heartbeat infrastructure exists (`server/_core/heartbeat.ts`) but no jobs have been registered. This is the single change that would make the biggest difference to the flywheel — registering three daily cron jobs: (1) agent idea generation, (2) Victoria morning briefing, and (3) SME trigger processing.

**GAP-C2: SME Team Assembly is Not Implemented**

The documentation describes a 287-expert AI-SME directory with team templates for every project type. The `persephoneRag.router.ts` has a RAG corpus for Persephone Board members (Altman, Huang, Amodei, Hassabis) but the broader SME directory is not wired into Genesis. When a project is initiated, no expert team is assembled, no SWOT is run, and no research tasks are assigned. A user who promotes an idea to Genesis arrives at an empty project with six blank phases and no guidance on what to do next.

**GAP-C3: The Genesis Phases Do Not Drive Themselves**

Each Genesis phase has a documented trigger (the completion of the previous phase), a task list, an SME team reference, and a prompt to use. None of this is automated. The `updatePhase` mutation simply stores whatever the user types. There is no agent that, upon a phase being marked complete, automatically: assembles the next phase's SME team, runs the required research, validates the outputs, and presents a structured result for the user to review and approve. This is the core of the flywheel — and it is entirely absent.

**GAP-C4: No Voice Note → Genesis Pipeline**

The documentation (Blueprint V2, Implementation Guide) describes voice note intake as the primary way to start a project. The Whisper transcription API is integrated. But there is no UI flow that takes a voice note, transcribes it, extracts project parameters, and pre-populates the Genesis wizard. Users must type everything manually.

**GAP-C5: No Feedback Loop from Execution to Innovation**

When a project in the Command Centre hits a milestone, generates a financial result, or encounters a risk, none of that information flows back to the Innovation Hub as a learning signal. The Insights Repository concept is documented but not implemented. This means the flywheel has no return path — learnings from execution never improve the next generation of ideas.

---

## Part 4: Target Process Flow — Innovation Hub to Genesis

The following describes the **target automated flow** for each stage, with the responsible agent clearly identified.

### Gate 0: Idea Origination

**Flow direction: downward**

```
┌─────────────────────────────────────────────────────────────────┐
│                    IDEA ORIGINATION                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │ 10 AI Agents│  │  User Input │  │  Article / URL Analysis │ │
│  │ (Daily Cron)│  │ (Voice/Text)│  │  (On-demand)            │ │
│  └──────┬──────┘  └──────┬──────┘  └────────────┬────────────┘ │
│         └────────────────┼─────────────────────┘              │
│                          ▼                                      │
│              Innovation Hub — Stage 1: CAPTURE                  │
│         [AGENT: Daily Idea Generator — 06:00 UTC]               │
└─────────────────────────────────────────────────────────────────┘
```

**Agent responsible:** Daily Idea Generator (heartbeat cron, 06:00 UTC). Calls `backfillAgentIdeas` for all 10 specialist agents. Stores ideas with `status: submitted`.

---

### Gate 1: Assessment & Scoring

```
┌─────────────────────────────────────────────────────────────────┐
│                  STAGE 2: ASSESS                                 │
│                                                                  │
│  For each new idea (status = submitted):                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 1. Risk Assessment (LLM)                                 │  │
│  │ 2. Financial Viability (LLM)                             │  │
│  │ 3. Competitive Landscape (LLM)                           │  │
│  │ 4. Feasibility (LLM)                                     │  │
│  │ 5. Market Analysis (LLM)                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│         [AGENT: Assessment Runner — triggered on capture]        │
│                          ▼                                       │
│              Overall Score calculated (0–100)                    │
│                                                                  │
│  Score < 50 → REJECTED (archived)                               │
│  Score 50–69 → REFINE (returned to user with gaps)              │
│  Score 70+ → ADVANCE to Stage 3                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Gap:** Assessment is not auto-triggered on capture. It requires a manual button press. **Agent should:** listen for new `status: submitted` ideas and automatically run all five assessments, then advance or reject based on score threshold.

---

### Gate 2: Consultation & Scenario Generation

```
┌─────────────────────────────────────────────────────────────────┐
│                  STAGE 3: CONSULT                                │
│                                                                  │
│  ┌─────────────────────┐   ┌──────────────────────────────┐    │
│  │ Investment Scenarios│   │ Funding Programme Matching   │    │
│  │ (Bootstrap/Budget/  │   │ (assessForFunding)           │    │
│  │  Full — LLM)        │   │                              │    │
│  └─────────────────────┘   └──────────────────────────────┘    │
│         [AGENT: Scenario Generator — auto-runs at Stage 3]       │
│                          ▼                                       │
│         Three investment scenarios stored in DB                  │
│         Funding matches identified                               │
└─────────────────────────────────────────────────────────────────┘
```

**Gap:** Scenario generation is not auto-triggered when an idea reaches Stage 3. **Agent should:** auto-run `generateScenarios` and `assessForFunding` when `currentStage` advances to 3.

---

### Gate 3: Brief Generation & Promotion Decision

```
┌─────────────────────────────────────────────────────────────────┐
│               STAGES 4–5: REFINE & BRIEF                        │
│                                                                  │
│  Stage 4: User reviews scenarios, provides refinement input     │
│  Stage 5: Brief auto-generated (generateBrief)                  │
│                                                                  │
│  Brief Score ≥ 70 AND User Confirms →                           │
│         [AGENT: Promotion Agent triggers promoteToGenesis]       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Project Genesis record created                           │  │
│  │ 6 phases seeded (status: not_started except Phase 1)     │  │
│  │ Persephone Board SME review trigger inserted (pending)   │  │
│  │ Victoria action logged                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  [GAP: Persephone Board trigger sits as 'pending' forever —     │
│   no agent processes it. Must be consumed by Victoria cron]      │
└─────────────────────────────────────────────────────────────────┘
```

---

### Gate 4: Genesis Phase 0 — Voice/Text Intake & Scope Alignment

```
┌─────────────────────────────────────────────────────────────────┐
│           GENESIS PHASE 0: SCOPE ALIGNMENT                      │
│                                                                  │
│  Input: Innovation Brief + User voice note or text              │
│                                                                  │
│  [AGENT: Scope Alignment Agent]                                  │
│  1. Transcribe voice note (Whisper API) — if provided           │
│  2. Extract: objective, audience, timeline, budget, format       │
│  3. Generate scope alignment summary                             │
│  4. Produce 3-minute voice note playback (ElevenLabs)           │
│     [GAP: ElevenLabs not integrated]                             │
│  5. User confirms or adjusts scope                               │
│  6. Phase 0 marked complete → Phase 1 auto-triggered             │
└─────────────────────────────────────────────────────────────────┘
```

---

### Gate 5: Genesis Phase 1 — Expert Team Assembly & SWOT

```
┌─────────────────────────────────────────────────────────────────┐
│           GENESIS PHASE 1: EXPERT TEAM ASSEMBLY                 │
│                                                                  │
│  [AGENT: Team Assembly Agent — auto-triggered on Phase 0 complete]│
│                                                                  │
│  1. Classify project type (Telecom/Tech/Healthcare/Retail/etc.) │
│  2. Select 12-person team from 287-expert SME directory          │
│     using project keywords and category matching                 │
│  3. Assign Project Lead based on project type                    │
│  4. Include Digital Twin (Chief of Staff) as position 6          │
│  5. Run SWOT analysis (LLM with assembled team perspectives)     │
│  6. Generate initial risk register                               │
│  7. Assign research tasks to each expert                         │
│                                                                  │
│  [GAP: SME directory not wired to Genesis — CRITICAL]            │
│  [GAP: SWOT not automated — CRITICAL]                            │
│                                                                  │
│  Output: Team roster, SWOT, risk register, research task list   │
│  Phase 1 marked complete → Phase 2 auto-triggered               │
└─────────────────────────────────────────────────────────────────┘
```

---

### Gate 6: Genesis Phase 2 — Deep Dive Research

```
┌─────────────────────────────────────────────────────────────────┐
│           GENESIS PHASE 2: DEEP DIVE RESEARCH                   │
│                                                                  │
│  [AGENT: Research Coordinator — parallel dispatch]               │
│                                                                  │
│  For each expert in the assembled team:                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Market SME → TAM/SAM/SOM analysis                          │ │
│  │ Competition SME → Competitive landscape                    │ │
│  │ Technology SME → Platform/tech validation                  │ │
│  │ Financial SME → Model audit, unit economics                │ │
│  │ Legal SME → Regulatory, compliance, IP                     │ │
│  │ Operations SME → Execution feasibility                     │ │
│  │ Due Diligence SME → Partner/team background                │ │
│  └────────────────────────────────────────────────────────────┘ │
│                          ▼                                       │
│  Coordinator aggregates findings                                 │
│  Gap identification report generated                             │
│  Research task tracker updated                                   │
│                                                                  │
│  [GAP: Entire phase not built — CRITICAL]                        │
│                                                                  │
│  Output: Integrated analysis, gap report, follow-up questions   │
│  Phase 2 marked complete → Phase 3 auto-triggered               │
└─────────────────────────────────────────────────────────────────┘
```

---

### Gate 7: Genesis Phase 3 — Triple Validation

```
┌─────────────────────────────────────────────────────────────────┐
│           GENESIS PHASE 3: TRIPLE VALIDATION                    │
│                                                                  │
│  [AGENT: Validation Engine]                                      │
│                                                                  │
│  For each claim from Phase 2 research:                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Primary validation: Domain SME review                      │ │
│  │ Secondary validation: Cross-check via second LLM engine    │ │
│  │ Tertiary validation: Third perspective check               │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Confidence thresholds:                                          │
│  Market claims: 80%+ | Financial: 85%+ | Technical: 90%+        │
│  Legal: 95%+ | Partner: 90%+ | Customer: 75%+                   │
│                                                                  │
│  Customer Focus Group:                                           │
│  Select relevant personas from 100+ persona database            │
│  Deploy concept survey → aggregate feedback                      │
│  [GAP: Persona database not wired to validation — HIGH]          │
│                                                                  │
│  Prior Research Check:                                           │
│  Query Insights Repository for existing relevant research        │
│  [GAP: Insights Repository not implemented — MEDIUM]             │
│                                                                  │
│  Output: Validation report with confidence scores, risk register │
│  Phase 3 marked complete → Phase 4 auto-triggered               │
└─────────────────────────────────────────────────────────────────┘
```

---

### Gate 8: Genesis Phase 4 — Master Report & KPI Framework

```
┌─────────────────────────────────────────────────────────────────┐
│           GENESIS PHASE 4: MASTER REPORT                        │
│                                                                  │
│  [AGENT: Report Compiler]                                        │
│                                                                  │
│  1. Compile all Phase 1–3 outputs into master report            │
│  2. Apply 100% Optimisation Scorecard                            │
│  3. Generate 50-category KPI heat map                            │
│  4. Run individual SME scoring for each expert                   │
│  5. Produce strategic planning recommendations                   │
│                                                                  │
│  [GAP: KPI heat map component exists in schema but not wired     │
│   to Genesis phase output — MEDIUM]                              │
│                                                                  │
│  Output: Master report PDF, KPI heat map, SME score cards       │
│  Phase 4 marked complete → Phase 5 auto-triggered               │
└─────────────────────────────────────────────────────────────────┘
```

---

### Gate 9: Genesis Phase 5 — Business Plan Development

```
┌─────────────────────────────────────────────────────────────────┐
│           GENESIS PHASE 5: BUSINESS PLAN                        │
│                                                                  │
│  [AGENT: Business Plan Writer — McKinsey Framework]              │
│                                                                  │
│  15 sections generated sequentially:                             │
│  Executive Summary → Problem/Opportunity → Solution →           │
│  Market Analysis → Business Model → Competitive Advantage →     │
│  Go-to-Market → Team → Financial Projections → Use of Funds →   │
│  Milestones → Risk Mitigation → Exit Strategy →                 │
│  Investment Highlights → Appendix                               │
│                                                                  │
│  [GAP: Only slide content generation exists; full 15-section    │
│   business plan document not generated — HIGH]                   │
│                                                                  │
│  Output: Full business plan document (PDF/MD)                   │
│  Phase 5 marked complete → Phase 6 auto-triggered               │
└─────────────────────────────────────────────────────────────────┘
```

---

### Gate 10: Genesis Phase 6 — Presentation & Funding Materials

```
┌─────────────────────────────────────────────────────────────────┐
│           GENESIS PHASE 6: PRESENTATION MATERIALS               │
│                                                                  │
│  [AGENT: Presentation Builder]                                   │
│                                                                  │
│  1. Structure content for 15+ slide deck                        │
│  2. Generate slide content via LLM (generatePresentationSlides) │
│     [BUILT — partial]                                            │
│  3. Push structured content to Gamma API for design             │
│     [GAP: Gamma integration not built — HIGH]                    │
│  4. Apply CEPHO brand theme                                      │
│  5. Export PDF (full deck, handout, speaker notes)              │
│  6. Generate executive summary (2 pages)                         │
│  7. Generate one-pager                                           │
│                                                                  │
│  Output: Investor deck PDF, executive summary, one-pager        │
│  Phase 6 marked complete → Phase 7 auto-triggered               │
└─────────────────────────────────────────────────────────────────┘
```

---

### Gate 11: Genesis Phase 7 — Video & Stakeholder Communication

```
┌─────────────────────────────────────────────────────────────────┐
│           GENESIS PHASE 7: VIDEO & COMMUNICATIONS               │
│                                                                  │
│  [AGENT: Communications Agent]                                   │
│                                                                  │
│  1. Write 3–5 minute explainer video script                     │
│  2. Generate voice note status updates (ElevenLabs)             │
│     [GAP: ElevenLabs not integrated — HIGH]                      │
│  3. Create stakeholder communication plan                        │
│  4. Schedule investor meetings (Outlook Calendar integration)    │
│     [PARTIAL — Outlook Calendar MCP available]                   │
│  5. Send Telegram briefing to owner                              │
│     [GAP: Telegram owner chat ID not set — LOW]                  │
│                                                                  │
│  Output: Video script, voice updates, comms plan, meeting schedule│
│  Phase 7 marked complete → Phase 8 auto-triggered               │
└─────────────────────────────────────────────────────────────────┘
```

---

### Gate 12: Genesis Phase 8 — Execution & Monitoring

```
┌─────────────────────────────────────────────────────────────────┐
│           GENESIS PHASE 8: EXECUTION & MONITORING               │
│                                                                  │
│  [AGENT: Victoria — Chief of Staff (scheduled cron)]             │
│                                                                  │
│  Weekly (Monday 08:00 UTC):                                      │
│  1. Generate project status report                               │
│  2. Update risk register from Command Centre data               │
│  3. Check KPI dashboard vs targets                               │
│  4. Identify overdue tasks and escalate                          │
│  5. Send Telegram briefing to owner                              │
│                                                                  │
│  Monthly:                                                        │
│  6. Full risk register review                                    │
│  7. Financial burn rate analysis                                 │
│  8. Milestone completion rate report                             │
│                                                                  │
│  [GAP: Victoria runs no scheduled jobs — CRITICAL]               │
│  [GAP: Command Centre data not fed back to Innovation Hub]       │
│                                                                  │
│  Output: Weekly status reports, escalation log, KPI dashboard   │
└─────────────────────────────────────────────────────────────────┘
```

---

### Gate 13: The Return Path — Execution Learnings → Innovation Hub

```
┌─────────────────────────────────────────────────────────────────┐
│           THE FLYWHEEL RETURN PATH                               │
│                                                                  │
│  [AGENT: Insights Harvester — monthly cron]                      │
│                                                                  │
│  From Command Centre:                                            │
│  - What worked (completed milestones, positive KPI trends)      │
│  - What failed (overdue tasks, budget overruns, high risks)     │
│  - Market signals (competitor moves, customer feedback)          │
│                          ▼                                       │
│  Insights Repository updated                                     │
│                          ▼                                       │
│  Innovation Hub agents informed:                                 │
│  "Avoid ideas in X category — similar project failed at Phase 3" │
│  "Prioritise ideas in Y category — strong execution track record"│
│                                                                  │
│  [GAP: Entire return path not built — MEDIUM priority]           │
│  [This is what makes it a flywheel rather than a pipeline]       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 5: Prioritised Build Roadmap

The following table orders the gaps by impact on the flywheel, not by implementation effort.

| Priority | Gap | Agent to Build | Estimated Effort |
|---|---|---|---|
| 1 | **Scheduled cron jobs** — daily idea generation, Victoria morning review, SME trigger processing | Heartbeat registration (3 jobs) | 2 hours |
| 2 | **Auto-assessment on capture** — run all 5 assessments when idea is captured, auto-advance or reject | Assessment Runner (event-driven) | 4 hours |
| 3 | **SME Team Assembly in Genesis** — classify project, select team, run SWOT, assign research tasks | Team Assembly Agent | 8 hours |
| 4 | **Deep Dive Research Pipeline** — parallel SME research dispatch and aggregation | Research Coordinator Agent | 12 hours |
| 5 | **Voice Note → Genesis intake** — transcribe, extract parameters, pre-populate wizard | Scope Alignment Agent | 6 hours |
| 6 | **Triple Validation Engine** — confidence scoring, claim validation, customer persona survey | Validation Engine Agent | 10 hours |
| 7 | **Full Business Plan Generation** — 15-section McKinsey framework document | Business Plan Writer Agent | 8 hours |
| 8 | **Gamma Presentation Integration** — push structured content to Gamma API | Presentation Builder Agent | 6 hours |
| 9 | **ElevenLabs Voice Briefings** — milestone updates and scope playback | Communications Agent | 4 hours |
| 10 | **Insights Repository & Return Path** — harvest execution learnings, feed back to Innovation Hub | Insights Harvester Agent | 10 hours |

**Total estimated effort to close all critical gaps: approximately 70 hours of development.**

The first two items (scheduled crons + auto-assessment) would transform the system from a manual tool into a genuinely autonomous flywheel with minimal code changes, as the underlying procedures already exist.

---

## Part 6: Immediate Next Steps (This Sprint)

The following three actions will have the highest immediate impact and can be implemented within the existing codebase:

**Step 1 — Register Three Heartbeat Cron Jobs**

Register the following jobs in `server/_core/index.ts` on startup:
- `daily-idea-generation`: 06:00 UTC daily → calls `innovation.backfillAgentIdeas`
- `victoria-morning-briefing`: 07:00 UTC daily → calls `victoria.generateMorningBriefing`
- `sme-trigger-processor`: 08:00 UTC daily → queries `smeReviewTriggers` where `status = pending`, runs Persephone Board review via `persephoneRag.ragChat`, updates trigger to `completed`

**Step 2 — Auto-Assessment on Idea Capture**

Modify `captureIdea` in `innovation.router.ts` to immediately enqueue an assessment after inserting the idea. Since the assessment is async and can take 10–30 seconds, run it as a background promise (non-blocking) and update the idea's status from `captured` to `assessing` immediately, then to `validated` or `rejected` when complete.

**Step 3 — Genesis Phase Progression Agent**

Add a `runPhaseAgent` mutation to `projectGenesis.router.ts` that, given a `projectId` and `phaseNumber`, looks up the phase definition, assembles the appropriate SME team context from the Persephone RAG corpus, runs the phase's required LLM tasks, and returns structured output for the user to review and approve. This is the core engine of the Genesis flywheel and the single most impactful feature to build.

---

*This document should be reviewed and updated after each sprint. The target state is a system where Jonathan can record a voice note describing an idea, and within 24 hours receive a fully validated innovation brief, an assembled expert team, a deep dive research report, and a draft business plan — with no manual intervention required.*
