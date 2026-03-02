# API Documentation

**CEPHO.AI tRPC API**

*Version: 1.0*
*Status: Draft*
*Last Updated: 2026-03-01*

---

## 1. Introduction

This document provides a reference for the CEPHO.AI tRPC API. It is intended for internal developers and future third-party integrators.

**Base URL:** `https://cepho-the-brain-complete.onrender.com/api/trpc`

**Authentication:** All requests must include a valid Supabase JWT in the `Authorization: Bearer <token>` header.

---

## 2. Routers

### 2.1. `victoriaBriefing`

Handles generation of Victoria's Morning Briefing.

#### `victoriaBriefing.generatePdf` (mutation)

Generates a PDF version of the latest briefing.

- **Input:** `{}` (no input)
- **Output:**
```json
{
  "pdfUrl": "https://storage.cepho.ai/briefs/brief-001.pdf"
}
```
- **Errors:**
  - `UNAUTHORIZED`: If the user is not authenticated.
  - `NOT_FOUND`: If no briefing exists for the current day.
  - `INTERNAL_SERVER_ERROR`: If PDF generation fails.

#### `victoriaBriefing.generateAudio` (mutation)

Generates an audio version of the latest briefing.

- **Input:** `{}` (no input)
- **Output:**
```json
{
  "audioUrl": "https://storage.cepho.ai/briefs/brief-001.mp3"
}
```

---

### 2.2. `projectGenesis`

Handles the Project Genesis wizard.

#### `projectGenesis.initiate` (mutation)

Starts a new project genesis session.

- **Input:**
```ts
{
  name: string;
  description: string;
}
```
- **Output:**
```json
{
  "projectId": "proj-003"
}
```

#### `projectGenesis.updatePhase` (mutation)

Updates the current phase of a project genesis session.

- **Input:**
```ts
{
  projectId: string;
  phase: "goals" | "budget" | "agents";
  data: any;
}
```
- **Output:**
```json
{
  "success": true
}
```

---

### 2.3. `agentEngine`

Handles AI agent execution.

#### `agentEngine.executeTask` (mutation)

Executes a task using the assigned AI agent.

- **Input:**
```ts
{
  taskId: string;
}
```
- **Output:**
```json
{
  "status": "completed",
  "result": "The analysis is complete. Key finding: ..."
}
```

---

## 3. Generating This Documentation

This documentation can be automatically regenerated from the source code using `trpc-openapi`.

1. Ensure all tRPC procedures have Zod input/output schemas and `.meta({ openapi: { ... } })` annotations.
2. Run the generation script:

```bash
npx tsx server/generate-openapi.ts
```

3. This will produce an `openapi.json` file, which can then be converted to Markdown using a tool like `widdershins`.

```bash
npx widdershins openapi.json -o docs/API_DOCS.md
```
