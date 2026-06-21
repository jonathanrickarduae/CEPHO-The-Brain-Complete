# CEPHO Project Remediation Plan

This document outlines the consolidated and prioritized tasks for the CEPHO project, integrating the latest expert-led remediation plan.

## 1. Code & Documentation Cleanup

**Objective:** To create a lean and understandable codebase by systematically removing all outdated, duplicated, and irrelevant files, code, and documentation.

- [ ] **CD-01: Remove Obsolete Features** (High Priority)
  - Details: Completely remove non-core features to reduce complexity, including Mood Tracking, Commercialization Features, and Personal Wellness. This involves deleting related components, services, and database schemas.
- [ ] **CD-02: Consolidate Documentation** (High Priority)
  - Details: Merge all relevant information from duplicated and conflicting documentation files (e.g., ARCHITECTURE.md, BACKEND_ARCHITECTURE.md) into a single, master documentation set.
- [ ] **CD-03: Unify Naming Conventions** (Medium Priority)
  - Details: Enforce the conventions laid out in `docs/NAMING_CONVENTIONS.md` across all files and folders to ensure clarity and consistency.
- [ ] **CD-04: Delete Duplicated Files** (High Priority)
  - Details: Conduct a full audit to remove all duplicated files (including many in `offline_package`) and establish a single source of truth.

## 2. API Cleanup & Integration

**Objective:** To fix the non-functional API integrations page, creating a clear and accurate representation of all connected services, and to add missing critical integrations.

- [ ] **API-01: Redesign Integrations Page** (High Priority)
  - Details: Redesign the broken `IntegrationWizard.tsx` component into a clear, list-based view that accurately reflects the connection status of each API.
- [ ] **API-02: Sync with Render & Reality** (High Priority)
  - Details: Connect the new integrations page to a backend service that queries Render and other sources to display the actual, real-time status of each integration.
- [ ] **API-03: Add Missing Integrations** (High Priority)
  - Details: Add critical APIs mentioned in `docs/connected_tools_integration.md` but missing from the UI, including Synthesia, ElevenLabs, Claude AI, Google Gemini, HeyGen, Zapier, and Trello.
- [ ] **API-04: Consolidate Integration Points** (Medium Priority)
  - Details: Merge the "Vault" concept into the main Settings/Integrations page, managing all API connections and credentials from a single, unified interface.

## 3. AI Agents Recovery & Mapping

**Objective:** To recover, map, and make fully operational the 50+ AI agents that are a core feature of the CEPHO system.

- [ ] **AI-01: Full Agent Audit & Recovery** (High Priority)
  - Details: Analyze git history and `client/src/data/aiExperts.ts` to recover any lost logic and create a definitive, consolidated list of all 50+ core agents.
- [ ] **AI-02: Create a Central Agent Directory** (High Priority)
  - Details: Create a new, clear UI at `/ai-agents` to display all available agents, their roles, statuses, and capabilities.
- [ ] **AI-03: Operationalize All Agents** (High Priority)
  - Details: Review, test, and make each of the 50+ agents fully functional by fixing underlying services (e.g., `agentService.ts`) and ensuring correct integration.

## 4. Fix Broken Pages & Routing

**Objective:** To ensure all pages within the application are functional and correctly routed.

- [ ] **PAGE-01: Full Routing Audit** (High Priority)
  - Details: Conduct a full review of all 50+ pages by auditing `client/src/App.tsx` and the `client/src/pages` directory to fix all routing issues and broken links.
- [ ] **PAGE-02: Fix Non-Functional Pages** (High Priority)
  - Details: Systematically debug and fix all non-working pages, ensuring all data dependencies and API calls are functioning correctly.

## 5. Mobile Responsiveness

**Objective:** To make the entire application fully responsive and usable on mobile devices, with a specific focus on a clean portrait mode experience.

- [ ] **MOB-01: Implement Mobile-First Layout** (High Priority)
  - Details: Refactor the main layout (`Layout.tsx`) and sidebar (`Sidebar.tsx`) to be fully responsive, replacing fixed-width elements with a flexible, grid-based layout.
- [ ] **MOB-02: Optimize for Portrait Mode** (High Priority)
  - Details: Test and optimize every page and component for a portrait mobile view, ensuring text is readable, buttons are tappable, and there is no horizontal scrolling.

## 6. UI/UX Redesign & Standardization

**Objective:** To create a slick, consistent, and action-oriented user experience by implementing a unified design system.

- [ ] **UI-01: Enforce a Single Design System** (High Priority)
  - Details: Update and strictly enforce the existing `client/src/styles/design-system.md`. Refactor all components to use standardized colors, typography, and button styles.
- [ ] **UI-02: Standardize Page Layouts** (High Priority)
  - Details: Redesign all pages to follow a consistent layout, standardizing the size and placement of banners, buttons, and content boxes.
- [ ] **UI-03: Improve Information Density** (Medium Priority)
  - Details: Redesign pages to be more "slick" and action-oriented with less scrolling by using more compact components and ensuring key information is always visible.

## 7. Persephone Board Training

**Objective:** To train the 14 Persephone Board AI agents to think, act, and communicate in a way that is authentically representative of their real-world counterparts.

- [ ] **PB-01: Create a Knowledge Corpus** (High Priority)
  - Details: For each of the 14 board members, programmatically gather all public writings, interviews, and presentations to create a massive knowledge corpus as outlined in `corporate/persephone-ai/DATA_COLLECTION_PLAN.md`.
- [ ] **PB-02: Implement a RAG System** (High Priority)
  - Details: Build a Retrieval-Augmented Generation (RAG) system to allow each agent to access its specific knowledge corpus in real-time, grounding its responses in factual data.
- [ ] **PB-03: Fine-Tune Agent Personas** (Medium Priority)
  - Details: Fine-tune the base language models for each agent using the collected data to capture the unique communication style, tone, and vocabulary of each board member.
