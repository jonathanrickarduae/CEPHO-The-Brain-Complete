
## New Era — Phase 2

- [x] Live Victoria AI chat — tRPC route calling Forge LLM API with streaming
- [x] Victoria system prompt: direct, data-first, no greetings, no personality
- [x] Full Calendar page — day/week/month views, per-company colour coding
- [x] Calendar Victoria pre-brief before each meeting
- [x] Financial Pulse — editable real data inputs per company (cash, burn, revenue, runway)
- [x] Financial Pulse — persist data to database
- [x] Financial Pulse — Victoria alert logic based on real runway figures
- [x] AI SME live consultations — real LLM-powered expert chat
- [x] Tasks page — real task list with owners, deadlines, RAG status
- [x] Decisions Log — capture decisions with context and outcome
- [x] Secure Document Library — upload, organise, access documents per project (S3)
- [x] The Vault — Digital Twin scores and learning feed
- [x] Full Settings page — Account, Victoria AI, Integrations, Notifications, Appearance, Security
- [x] Victoria AI and Document Library added to nav
- [x] All routes wired in App.tsx
- [x] Database tables created: tasks, decisions, calendar_events, financial_data
- [x] Zero TypeScript errors

## Mobile Responsive Redesign

- [x] BrainLayout — bottom nav bar on mobile (iPhone), sidebar on desktop
- [x] BrainLayout — mobile header with black top banner, brain logo, section name
- [x] The Nexus — action-forcing cards with approve/delegate/escalate taps on mobile
- [x] Signal — swipeable action cards, one-tap approve email drafts on mobile
- [ ] Tasks — swipe to complete, swipe to reassign on mobile (future enhancement)
- [ ] Decisions — mobile-optimised capture form (future enhancement)
- [x] Projects Hub — mobile card stack, tap to open portal
- [x] Financial Pulse — mobile-optimised company cards
- [x] Floating Victoria FAB on mobile — quick-action sheet (ask, create task, log decision)
- [x] All pages — remove horizontal overflow, ensure touch targets min 44px
- [x] Victoria AI chat — full-screen on mobile, keyboard-aware layout
- [x] BrainLayout mobile bug fixed — SidebarProvider always wraps BrainLayoutContent
- [x] Settings page — responsive icon-only tabs on mobile

## Voice Capture

- [x] tRPC endpoint: voice.transcribe — accepts audio blob upload, calls Whisper, returns text
- [x] useVoiceRecorder hook — MediaRecorder API, hold-to-record, returns audio blob + duration
- [x] VoiceCapture component — hold-to-record mic button, animated waveform, transcription preview
- [x] Wire voice capture into Victoria chat input (mic button alongside send)
- [x] Wire voice capture into New Task dialog (dictate task title/description)
- [x] Wire voice capture into Decisions capture form (dictate decision context)
- [ ] Mobile: floating mic FAB on Signal page for quick voice note → Victoria (future)

## Phase 3 — Live Data + Missing Pages

- [x] Inbox page — Gmail MCP integration, email list + read view with search
- [x] Settings — persist to DB via tRPC
- [x] Nexus dashboard — live data from tasks/decisions/projects DB tables
- [x] Morning Signal — live morningBrief from Victoria LLM + DB
- [x] Projects Hub — live project list from DB (CRUD: add/edit/delete project)
- [x] Project Portal — live tasks/milestones/decisions/docs per project from DB
- [x] Innovation Hub — persist ideas to DB, add/edit/delete, link to projects
- [x] The Vault — persist learning entries to DB
- [x] Project Genesis — LLM assessment generation, save genesis to DB
- [x] Voice capture — mic button in Victoria, Tasks, Decisions (Whisper transcription)
- [ ] SME experts — persist custom experts to DB, allow adding new SMEs (future)

## Telegram Bot Integration

- [x] Single CEPHO Telegram bot — webhook endpoint in Express server
- [x] Bot commands: /celadon, /celanova, /perfect, /olmack, /boundless, /personal to set active project
- [x] Victoria classifies incoming messages as task, decision, document, or note
- [x] Voice notes transcribed via Whisper, then classified by Victoria
- [x] Photos/documents stored in S3, linked to project portal
- [x] Confirmation message sent back to Telegram with what was captured and where
- [x] Telegram bot token stored as secret (TELEGRAM_BOT_TOKEN)
- [ ] Settings page shows Telegram connection status and bot username (future)

## Project Portal Design

- [x] Each portal has its own identity accent colour (Celadon=cyan, Celanova=violet, Perfect=emerald, Olmack=amber, Boundless=rose, Personal=slate)
- [x] Manus-premium dark aesthetic — glowing accents, clean typography, data-dense but airy
- [x] Portal header: company name, initials badge, status indicator, accent colour glow
- [x] Tabs: Overview, Tasks, Decisions, Documents, Financial, Reports, Victoria
- [x] Overview tab: key metrics cards, milestone timeline, recent activity feed
- [x] Documents tab: upload from device to S3, list with download links
- [x] Reports tab: generate on demand (status, board pack, weekly brief, financial, custom), view in-app, download PDF
- [x] Startup mode: freeform uploads, bespoke AI docs, ad hoc tasks/decisions
- [ ] BAU mode (future): scheduled reports, recurring board packs, structured governance
- [ ] Telegram capture feeds into portal Inbox before Victoria files items (future)

## Victoria Cross-Portfolio Intelligence

- [ ] Victoria portal chat is context-aware: knows current project + draws on all 6 companies
- [ ] learningEntries table used as cross-portfolio knowledge store
- [ ] Victoria system prompt includes recent learnings from all projects when responding
- [ ] Each portal Victoria chat saves insights back to learningEntries with projectId tag
- [ ] Victoria can be asked cross-company questions: "how does this compare to Celadon?"

## Navigation Restructure

- [x] Move AI Agents and AI SMEs to top of sidebar (Intelligence Layer group)
- [x] Intelligence Layer: Victoria, AI Agents, AI SMEs, Innovation Hub
- [x] Command Centre: Nexus, Signal, Calendar, Inbox
- [x] Projects: Projects Hub (home screen)
- [x] Operations: Tasks, Decisions, Documents, Financial Pulse
- [x] Build: Project Genesis, The Vault
- [x] Settings at bottom
- [x] Update mobile bottom nav to reflect new priority order
- [x] AI Agents page — built with agent library, runs management, project assignment

## AI Agents

- [x] DB table: agents (id, name, role, description, capabilities, status, projectId, createdAt)
- [x] DB table: agent_runs (id, agentId, projectId, taskId, status, prompt, result, startedAt, completedAt)
- [x] tRPC: agents.list, agents.create, agents.update, agents.delete
- [x] tRPC: agentRuns.list, agentRuns.trigger, agentRuns.getResult
- [x] AI Agents page: agent library cards, create agent modal, assign to project
- [x] Agent run view: live status, result output, link to task/portal
- [ ] Agent run triggers task creation in assigned project portal (future)
- [ ] Agent results surface in Signal morning brief (future)

## Portal Document Upload

- [x] Documents tab — file picker button (opens device files)
- [x] Upload selected file to S3 via tRPC documents.upload mutation
- [x] Show upload progress bar / spinner during upload
- [x] File stored against projectId in documents table
- [x] Supports PDF, DOC, DOCX, XLS, XLSX, PNG, JPG (max 16MB)
- [x] Display file list with name, type badge, size, uploader, download link
- [x] Delete document from portal (removes DB record)

## AI Agents UX Design

- [ ] Agent cards: avatar with role icon, name, status pill (idle/running/paused), assigned project badge
- [ ] Create agent flow: step 1 name + role, step 2 capabilities checklist, step 3 assign project — wizard not modal
- [ ] Agent run view: live status indicator, animated progress, result rendered as markdown
- [ ] Empty state: illustrated prompt to create first agent with clear CTA
- [ ] Mobile: full-screen agent detail sheet, swipe to dismiss
- [ ] Micro-interactions: agent card pulse when running, success flash on completion
- [ ] Colour coding: each agent type has its own accent (Research=cyan, Finance=amber, Compliance=violet, Operations=emerald)
- [ ] Quick-trigger: one-tap "Run Now" button on each agent card
- [ ] Run history: collapsible timeline per agent showing last 5 runs with status + result preview

## Simplification Principles (apply everywhere)

- [ ] Replace verbose status labels with traffic light dots (red/amber/green) + one word max
- [ ] Replace priority dropdowns with coloured dot selectors (tap to cycle: low→medium→high→critical)
- [ ] Remove all description text that repeats what the label already says
- [ ] Replace text-heavy empty states with a single icon + one-line prompt + CTA button
- [ ] Agent roles: icon only on card, full label only on hover/expand
- [ ] Task list: no borders between items, just spacing — cleaner scan
- [ ] Decisions: title + impact dot only in list view, expand for rationale
- [ ] Reports: type badge + date only in list — no body text preview
- [ ] Portal header stats: number + label only, no sub-label
- [ ] Remove all "optional" labels from form fields — placeholder text is enough

## Backend API Audit

- [x] Victoria router: chat, morningBrief, getConversations — verified
- [x] Financial router: getAll, upsert — verified
- [x] Tasks router: list, create, update, delete — verified
- [x] Decisions router: list, create, update — verified
- [x] Documents router: list, upload, delete — verified S3 + DB
- [x] Calendar router: list, create, update, delete — verified
- [x] Vault router: getLearnings, getStats — verified
- [x] Settings router: get, update — verified persistence to DB
- [x] SME router: consult — verified LLM integration
- [x] Projects router: all procedures — fixed financial data bug (match by slug)
- [x] Agents router: migrated to Drizzle ORM — verified
- [x] Innovation router: migrated to Drizzle ORM — verified
- [x] Genesis router: list, save, assess — verified
- [x] Stale Vite error resolved — AgentsPage file exists, 0 TypeScript errors
- [x] Full TypeScript check: 0 errors confirmed

## Session Resume — Checkpoint Build

- [x] VaultPage — add learning form (category selector, insight, context) + delete buttons (hover-reveal trash icon)
- [x] vault.add and vault.delete procedures added to server/routers.ts
- [x] ProjectsHub — edit/delete buttons on project cards (3-dot DropdownMenu, hover-reveal)
- [x] ProjectsHub — edit dialog with name, description, accent colour, status fields
- [x] ProjectsHub — delete confirmation dialog
- [x] ProjectsHub — wired to trpc.projects.update and trpc.projects.delete mutations
- [x] TypeScript check: 0 errors confirmed
