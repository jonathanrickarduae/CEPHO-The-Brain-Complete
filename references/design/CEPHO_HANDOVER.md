# CEPHO.ai — Full Handover Document
*Generated: June 2026 | For use in new chat sessions within the CEPHO.Ai project*

---

## 1. What CEPHO Is

CEPHO is a personal operating system for managing multiple businesses simultaneously. It is not a generic productivity app — it is built specifically for one user who runs 6 distinct businesses and needs a single place to:

- See the status of all projects at a glance (RAG: Red / Amber / Green)
- Get a morning briefing with emails drafted, tasks ready, overnight completions surfaced
- Manage each project in its own sub-portal (tasks, documents, decisions, AI context)
- Delegate to Victoria (AI Chief of Staff) and a team of AI SMEs
- Receive approval gates before anything is sent or actioned

---

## 2. The 6 Projects

| Project | Description | Accent Colour |
|---------|-------------|---------------|
| Celadon | Pharmacy operations & growth | #10B981 (green) |
| Celanova | Healthcare innovation | #8B5CF6 (purple) — **avoid blue/gold** |
| Perfect | PMO client engagement | #F59E0B (amber) |
| Olmack | Telecoms business | #3B82F6 (blue) |
| Boundless | Energy business | #EF4444 (red) |
| Personal | Personal workspace & goals | #EC4899 (pink) |

---

## 3. Victoria — AI Chief of Staff

- Victoria is the central AI persona. She is NOT called "Chief of Staff", "Digital Twin", or "AI Assistant" — she is always **Victoria**.
- She greets the user every morning, assesses all projects, surfaces what needs attention.
- She calls on AI SMEs (specialist agents) for deep work in specific domains.
- She proposes actions; the user approves before anything is sent or executed.
- She should improve herself over time using the best available AI tools (Manus, Claude, etc.).

---

## 4. Design System

| Token | Value | Purpose |
|-------|-------|---------|
| Primary | `oklch(0.78 0.18 195)` / `#00D4FF` | Electric cyan — main accent |
| Secondary | `oklch(0.58 0.26 340)` / `#FF2D78` | Neon pink — secondary accent |
| Background | `oklch(0.98 0 0)` | Near-white |
| Card | `oklch(1 0 0)` | Pure white cards |
| Foreground | `oklch(0.1 0 0)` | Near-black text |
| Border | `oklch(0.88 0 0)` | Light grey |
| Theme | Light (default) | NOT dark |

Fonts: Space Grotesk (body), Rajdhani (display/headings)

---

## 5. Navigation Structure (5 items only)

```
The Nexus    → /dashboard     (home — RAG overview + Victoria greeting)
Projects     → /projects      (all 6 project cards)
Signal       → /morning-signal (daily briefing)
Inbox        → /inbox         (multi-account email)
Settings     → /settings      (integrations, AI tools, approval gates)
```

Everything else is hidden (routes still exist, just not in sidebar).

---

## 6. What Has Been Built (Completed This Session)

### Files created/modified:
- `client/src/index.css` — light theme with cyan/pink palette
- `client/src/components/BrainLayout.tsx` — simplified 5-item sidebar with Victoria status indicator
- `client/src/pages/NexusDashboard.tsx` — home dashboard with Victoria greeting and RAG project cards
- `client/src/pages/ProjectsHub.tsx` — 6 project cards with RAG status, progress, next actions
- `client/src/pages/ProjectPortal.tsx` — project sub-portal with 5 tabs: Tasks, Overview, Documents, Decisions, Ask Victoria
- `client/src/App.tsx` — routes added: `/projects` and `/projects/:id`

### Current data state:
All project data is **static/mock** — hardcoded in the component files. It has NOT been wired to the database yet.

---

## 7. What Is NOT Yet Built (Next Priorities)

### Priority 1 — Morning Signal
- Real Victoria briefing based on actual data
- Emails drafted and ready to send
- Overnight task completions surfaced
- Per-project action list for the day

### Priority 2 — Inbox
- Multi-account email (personal + one company email per business)
- All accounts in one view, colour-coded by project
- Auto-routing of emails to the correct project

### Priority 3 — Unified Calendar
- Google Calendar + Outlook across all accounts
- Single view, colour-coded by business
- Events linked to the relevant project

### Priority 4 — Database wiring
- Move project data from static/mock to database
- Tasks, documents, decisions stored per project
- Victoria can read and update project state

---

## 8. Technical Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Tailwind 4 + shadcn/ui |
| Backend | Express 4 + tRPC 11 |
| Database | MySQL/TiDB via Drizzle ORM |
| Auth | Manus OAuth (already working) |
| AI | `invokeLLM()` helper — no API key needed |
| Storage | S3 via `storagePut()` helper |
| Voice | Whisper via `transcribeAudio()` helper |
| Project path | `/home/ubuntu/the-brain` |

---

## 9. Known Issues

### GitHub connector not working
- The `user_github` git remote is not configured in the sandbox
- `webdev_save_checkpoint` fails with re-authorisation error
- **Fix:** Go to Management UI → Settings → GitHub → link a repository
- If not available, raise at https://help.manus.im

### Project data is static
- All 6 projects have hardcoded mock data
- Tasks, status, issues are not real
- Must be wired to database before going live

---

## 10. First Actions in New Chat

1. Run `webdev_save_checkpoint` — attempt to save (may still fail if GitHub not fixed)
2. If checkpoint works, proceed to build Morning Signal
3. If checkpoint fails, continue building and note the issue
4. **Do not rebuild from scratch** — the infrastructure is solid, only the GitHub connector is broken

---

## 11. Key Rules

- Victoria is always the AI persona — never "Chief of Staff" or "Digital Twin" in UI labels
- Light theme only — do not revert to dark
- Navigation stays at 5 items — do not add more without explicit instruction
- Celadon: avoid blue/gold colour palette
- All AI calls go server-side via `invokeLLM()` — never expose API keys to frontend
- Approval gates required before Victoria sends emails or actions tasks

---

## 12. AI Agent Master Guide (Key Principles)

Uploaded by user. Key principles for Victoria's behaviour:
- Think in systems, not tasks
- Surface the most important thing first
- Propose, don't act — user approves before execution
- Learn from every interaction
- Use the best available tool for each job (Manus, Claude, etc.)
- Maintain context across all 6 projects simultaneously

Full guide saved at: `/home/ubuntu/the-brain/references/ai-agent-master-guide-notes.md`
