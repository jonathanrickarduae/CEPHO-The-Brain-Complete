'''

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-22

### Added

- **Comprehensive Documentation:** Added `README.md`, `ARCHITECTURE.md`, `FEATURES.md`, `SETUP.md`, and `QMS.md` to the repository.
- **Persephone Board:** Implemented the Persephone Board feature with the top 14 AI industry leaders.
- **Navigation for Persephone Board:** Added navigation links and breadcrumbs for the Persephone Board.

### Fixed

- **Critical Build Failure:** Fixed a critical build failure caused by a syntax error in `DailyBrief.tsx`.
- **Database Schema:** Corrected the database schema by copying `drizzle/schema.ts` to `server/db/schema.ts`.
- **Database Exports:** Fixed database exports in `server/db.ts` and `server/db/connection.ts`.
- **Service Imports:** Corrected service imports to use `aiSmeExperts` instead of `experts` in 3 services.
- **`DailyBrief.tsx` Syntax:** Fixed a syntax error in `DailyBrief.tsx` related to mismatched HTML tags.
- **README.md:** Updated the `README.md` with current information about the project.
- **ARCHITECTURE.md:** Updated the `ARCHITECTURE.md` with current information about the project architecture.

### Changed

- **Persephone Board Content:** Changed the content of the Persephone Board from business experts to the top 14 AI leaders.

## [1.1.0] - 2026-03-02

### Changed

- **`chiefOfStaff.getContext`:** Reshaped return value to match `EnhancedChiefOfStaff` component expectations — now returns real `emails`, `tasks`, `projects`, `documents`, `alerts`, and `aiConversations` counts from the database.
- **`SubscriptionManager`:** Wired to `trpc.subscriptionTracker.getAll` and `getSummary`; demo data used only when no subscriptions exist.
- **`Statistics.tsx`:** `PersonalAnalytics` and all four KPI cards now use live data from `dashboard.getInsights` and `aiAgentsMonitoring.getAllStatus`.
- **`ChiefOfStaff.tsx`:** Mock tasks suppressed when real tasks exist; only shown during empty onboarding state.
- **`EveningReview.tsx`:** Pending tasks fetched via `trpc.eveningReview.getPendingTasks`; `OVERNIGHT_TASKS` used as fallback only.

### Fixed

- Duplicate `count` import in `chiefOfStaff.router.ts` merged into single `drizzle-orm` import.
- TypeScript: 0 errors across full codebase.

## [1.2.0] — Session 5 — Raw-Fetch Elimination & tRPC Wiring

### Server — New tRPC Procedures

- `workflows.list` — query returning all user workflows with phase progress.
- `workflows.start` / `workflows.pause` / `workflows.resume` — mutations to update workflow status in `projectGenesis`.
- `workflows.getStepGuidance` — AI-powered per-step guidance using `gpt-4.1-mini` (JSON mode).

### Frontend — Raw `fetch()` → tRPC

- **`WorkflowsPage`** — replaced `fetch('/api/workflows')` with `trpc.workflows.list`.
- **`WorkflowDetailPage`** — all five raw `fetch` calls replaced with `workflows.get`, `workflows.start/pause/resume`, and `workflows.getStepGuidance`.
- **`AgentDetailPage`** — all six raw `fetch` calls replaced with `aiAgentsMonitoring.getAllStatus`, `getDailyReports`, and `reviewRequest`.
- **`AIExperts`** — `MOCK_PENDING_TASKS` replaced by `trpc.cosTasks.getTasks({ status: 'pending' })` on load; mock data retained as empty-state fallback.

### Quality

- Only two legitimate `fetch()` calls remain: `Login.tsx` (auth) and `main.tsx` (CSRF bootstrap).
- TypeScript: 0 errors.

## [1.3.0] — Session 6 — CRUD Completeness & Loading States

### Server — New tRPC Endpoints

- `tasks.get(id)` — fetch a single task by ID (user-scoped).
- `tasks.delete(id)` — delete a task (user-scoped).
- `projects.get(id)` — fetch a single project by ID (user-scoped).
- `projects.delete(id)` — delete a project (user-scoped).

### Frontend — Loading States & UX Hardening

- **`Statistics.tsx`** — full-page spinner while `dashboard.getInsights` loads.
- **`EveningReview.tsx`** — `isLoading` wired to `eveningReview.getPendingTasks`.
- **`AdminDashboard.tsx`** — `isLoading` wired to `admin.getPlatformStats`.
- **`COSTraining.tsx`** — `isLoading` wired to `cosTraining.getProgress`.
- **`ChiefOfStaff.tsx`** — conversation sidebar now reads from `chat.history` tRPC query; falls back to mock only when history is empty.
- **`CommandCentre.tsx`** — fixed task status filter values (`not_started` / `in_progress` / `completed` instead of incorrect `pending`).

### TypeScript: 0 errors

'''
