# Phase 6: Enhancements & Differentiation

**Grade Target: A → A+**
**Scope: 16 enhancement items across 4 categories**

---

## Category A: Platform Resilience (Quick Wins)

### ENH-01: Error Boundaries on Every Page

**Priority:** High | **Effort:** Low | **Grade Impact:** Frontend Stability D→B

**Current State:** Any React component crash causes the entire page to go blank with no message, no retry option, and no way for the user to recover without a full page refresh.

**Required Implementation:**

Create `client/src/components/ErrorBoundary.tsx`:

```tsx
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}
interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to Sentry
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <p className="text-red-400 font-semibold">
              Something went wrong on this page.
            </p>
            <button
              className="px-4 py-2 bg-purple-600 text-white rounded"
              onClick={() => this.setState({ hasError: false })}
            >
              Retry
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
```

Wrap every route in `App.tsx` with `<ErrorBoundary>`.

**Expected Outcome After Fix:** Any component crash shows a "Something went wrong — Retry" message instead of a blank screen. Users can recover without a full page refresh.

**Validation:** Navigate to `/documents` before the FE-01 crash fix is applied. The page should show the error boundary message, not a blank screen.

---

### ENH-02: Offline / Degraded Mode Banner

**Priority:** High | **Effort:** Low | **Grade Impact:** Frontend Stability, UX

**Current State:** If the server is unreachable, all tRPC queries silently fail and the app shows empty states. Users believe their data is gone.

**Required Implementation:**

Create `client/src/hooks/useOnlineStatus.ts`:

```ts
import { useEffect, useState } from "react";

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        await fetch("/api/health", { method: "HEAD" });
        setIsOnline(true);
      } catch {
        setIsOnline(false);
      }
    };
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  return isOnline;
}
```

Add to `BrainLayout.tsx`:

```tsx
const isOnline = useOnlineStatus();
// In the JSX, above the main content:
{
  !isOnline && (
    <div className="bg-red-900 text-red-100 text-sm text-center py-2 px-4">
      Connection lost — some features may be unavailable. Reconnecting...
    </div>
  );
}
```

**Expected Outcome After Fix:** A red banner appears at the top of the page when the server is unreachable. It disappears automatically when the connection is restored.

---

### ENH-03: Structured Logging

**Priority:** High | **Effort:** Medium | **Grade Impact:** Observability E→C

**Current State:** The server uses `console.log` statements inconsistently. There is no structured logging, no request IDs, and no way to trace a user's journey through the system in production.

**Required Implementation:**

Install `pino` and `pino-pretty`:

```bash
pnpm add pino pino-pretty
```

Create `server/_core/logger.ts`:

```ts
import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  base: { service: "cepho-brain" },
  transport:
    process.env.NODE_ENV === "development"
      ? { target: "pino-pretty" }
      : undefined,
});
```

Add request logging middleware in `server/setup-middleware.ts`:

```ts
app.use((req, res, next) => {
  const start = Date.now();
  const requestId = crypto.randomUUID();
  req.requestId = requestId;
  res.on("finish", () => {
    logger.info({
      requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs: Date.now() - start,
      userId: req.user?.id,
    });
  });
  next();
});
```

Replace all `console.log` calls in server code with `logger.info`, `logger.warn`, and `logger.error`.

**Expected Outcome After Fix:** Every API request is logged with a unique request ID, user ID, endpoint, duration, and status code. Logs are structured JSON in production, making them searchable in any log aggregation tool.

---

### ENH-04: Architecture Decision Records (ADRs)

**Priority:** Medium | **Effort:** Low | **Grade Impact:** Documentation C→B

**Current State:** No record of why key technical decisions were made. New developers cannot understand the reasoning behind the architecture.

**Required Implementation:**

Create `/docs/decisions/` folder with an ADR template:

```markdown
# ADR-001: Use tRPC for API Layer

**Date:** 2026-03-01
**Status:** Accepted

## Context

We needed an API layer between the React frontend and the Node.js backend.

## Decision

We chose tRPC because it provides end-to-end type safety without requiring a separate schema definition language (like GraphQL SDL or OpenAPI YAML).

## Consequences

- Positive: Full TypeScript type safety from server to client. No runtime type errors from API mismatches.
- Negative: tRPC is not a standard REST API. Third-party clients cannot consume it directly without using the tRPC client library.
- Mitigation: We will add `trpc-openapi` to expose a REST-compatible API for third-party integrations in Phase 4.
```

Create one ADR for each major technical decision: tRPC, Supabase, Drizzle ORM, Render deployment, Vite, TailwindCSS.

---

## Category B: User Experience

### ENH-05: Onboarding Wizard

**Priority:** Critical | **Effort:** High | **Grade Impact:** UX E→C, Business Logic C→B

**Current State:** New users land on the dashboard with no guidance. There is no first-time user experience. Users do not know what to do or how to get value from the platform.

**Required Implementation:**

Create `client/src/pages/Onboarding.tsx` — a multi-step wizard:

- **Step 1: Welcome** — "Welcome to CEPHO.AI. Let's get you set up in 5 minutes."
- **Step 2: Connect Calendar** — Connect Google Calendar via OAuth.
- **Step 3: Connect Tools** — Connect at least one integration (Notion, Slack, etc.). Can be skipped.
- **Step 4: Set Briefing Time** — What time do you want your morning briefing? Default: 06:00.
- **Step 5: Meet Your Agents** — A brief introduction to the 49 AI agents and what they do.
- **Step 6: Run Your First Briefing** — Click "Generate My First Briefing" to trigger the briefing generation immediately.

Add a `hasCompletedOnboarding` boolean column to the `users` table. If `false`, redirect to `/onboarding` on login.

Add route in `App.tsx`:

```tsx
<Route path="/onboarding" element={<Onboarding />} />
```

**Expected Outcome After Fix:** New users are guided through a 6-step setup wizard on first login. They connect their tools, set their preferences, and see their first briefing before leaving the onboarding flow.

---

### ENH-06: In-App Notifications (Real-Time)

**Priority:** High | **Effort:** Medium | **Grade Impact:** Automation B→A

**Current State:** The notifications router exists but returns stub data. There is no real-time notification system. Users must manually check the platform to see if a briefing is ready or a task has been completed.

**Required Implementation:**

Use Supabase Realtime to push notifications to the client:

```ts
// In client/src/hooks/useRealtimeNotifications.ts
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useRealtimeNotifications(userId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `userId=eq.${userId}`,
        },
        payload => {
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
          // Show a toast notification
          toast(payload.new.message);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);
}
```

Trigger notifications from server-side procedures when:

- A briefing is ready (`victoriaBriefing.generate` completes)
- An agent completes a task
- A project phase changes
- An approval is required

**Expected Outcome After Fix:** Users receive real-time toast notifications when key events occur. The notification bell in the header shows an unread count that updates in real time.

---

## Category C: Enterprise Requirements

### ENH-07: Audit Log

**Priority:** Critical for Enterprise | **Effort:** Medium | **Grade Impact:** Compliance E→C

**Current State:** No audit log exists. There is no record of who did what, when. This is a non-negotiable requirement for enterprise clients in regulated industries.

**Required Implementation:**

Add `auditLogs` table to the Drizzle schema:

```ts
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  action: varchar("action").notNull(), // e.g., 'project.created', 'agent.executed'
  resourceType: varchar("resource_type"), // e.g., 'project', 'task'
  resourceId: varchar("resource_id"),
  metadata: jsonb("metadata"), // Additional context
  ipAddress: varchar("ip_address"),
  userAgent: varchar("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});
```

Create `server/_core/audit.ts`:

```ts
export async function logAuditEvent(
  ctx: Context,
  action: string,
  resourceType: string,
  resourceId: string,
  metadata?: object
) {
  await db.insert(auditLogs).values({
    id: `audit-${Date.now()}`,
    userId: ctx.user.id,
    action,
    resourceType,
    resourceId,
    metadata,
    ipAddress: ctx.req.ip,
    userAgent: ctx.req.headers["user-agent"],
  });
}
```

Call `logAuditEvent` in every mutation procedure that modifies data.

Add an Audit Log tab to the Settings page that shows the last 100 audit events for the current user.

**Expected Outcome After Fix:** Every action taken in the system is logged. Enterprise clients can see a complete audit trail of all activity.

---

### ENH-08: Data Export (GDPR Right to Portability)

**Priority:** High | **Effort:** Medium | **Grade Impact:** Compliance E→C

**Current State:** No data export functionality exists. This is required under GDPR.

**Required Implementation:**

Add `dataExport.export` mutation to the server:

```ts
export const dataExportRouter = router({
  export: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.user.id;
    const [userRecord, briefings, tasks, projects, ideas] = await Promise.all([
      db.select().from(users).where(eq(users.id, userId)),
      db.select().from(briefings).where(eq(briefings.userId, userId)),
      db.select().from(tasks).where(eq(tasks.userId, userId)),
      db.select().from(projects).where(eq(projects.userId, userId)),
      db
        .select()
        .from(innovationIdeas)
        .where(eq(innovationIdeas.userId, userId)),
    ]);

    const exportData = {
      user: userRecord[0],
      briefings,
      tasks,
      projects,
      ideas,
    };
    const json = JSON.stringify(exportData, null, 2);
    // Upload to S3 and return a signed download URL
    const url = await uploadToS3(`exports/${userId}-${Date.now()}.json`, json);
    return { downloadUrl: url };
  }),
});
```

Add an "Export My Data" button to the Settings > Profile tab.

**Expected Outcome After Fix:** Users can download all their data as a JSON file from the Settings page. The download link is valid for 1 hour.

---

### ENH-09: GDPR Data Deletion (Right to Erasure)

**Priority:** High | **Effort:** Medium | **Grade Impact:** Compliance E→C

**Current State:** No data deletion functionality exists. Users cannot delete their account or data. This is required under GDPR.

**Required Implementation:**

Add `account.deleteAccount` mutation:

```ts
deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
  const userId = ctx.user.id;
  // Delete all user data in order (respect foreign keys)
  await db.delete(auditLogs).where(eq(auditLogs.userId, userId));
  await db.delete(notifications).where(eq(notifications.userId, userId));
  await db.delete(tasks).where(eq(tasks.userId, userId));
  await db.delete(projects).where(eq(projects.userId, userId));
  await db.delete(briefings).where(eq(briefings.userId, userId));
  await db.delete(users).where(eq(users.id, userId));
  // Delete from Supabase Auth
  await supabaseAdmin.auth.admin.deleteUser(userId);
  return { success: true };
}),
```

Add a "Delete My Account" button to Settings > Profile, behind a confirmation dialog that requires the user to type "DELETE" to confirm.

**Expected Outcome After Fix:** Users can permanently delete their account and all associated data. The deletion is irreversible and removes the user from both the application database and Supabase Auth.

---

## Category D: Strategic Differentiation

### ENH-10: Agent Performance Rating System

**Priority:** Critical | **Effort:** High | **Grade Impact:** AI Agents D→A, Business Logic D→A

**Current State:** Agents execute tasks but there is no feedback loop. Victoria cannot rate the quality of an agent's output. Agents never improve. This is the core learning loop that makes CEPHO.AI genuinely intelligent.

**Required Implementation:**

Add `agentRatings` table to the schema:

```ts
export const agentRatings = pgTable("agent_ratings", {
  id: varchar("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  agentKey: varchar("agent_key").notNull(),
  taskId: varchar("task_id").references(() => tasks.id),
  rating: integer("rating").notNull(), // 1-5
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow(),
});
```

After every agent task execution, show a rating widget (1-5 stars + optional text feedback) in the AI Agents dashboard.

Add a `agentEngine.rateTask` mutation that saves the rating and triggers a prompt adjustment:

```ts
rateTask: protectedProcedure
  .input(z.object({ taskId: z.string(), rating: z.number().min(1).max(5), feedback: z.string().optional() }))
  .mutation(async ({ ctx, input }) => {
    await db.insert(agentRatings).values({ ... });
    // If rating <= 2, flag the agent for prompt review
    if (input.rating <= 2) {
      await db.update(aiAgents)
        .set({ flaggedForReview: true, lastLowRatingAt: new Date() })
        .where(eq(aiAgents.key, agentKey));
    }
    return { success: true };
  }),
```

Add an Agent Performance dashboard in the AI Agents page showing: average rating per agent, rating trend over time, flagged agents, and improvement suggestions.

**Expected Outcome After Fix:** Victoria can rate every agent output. Low-rated agents are flagged for review. The Chief of Staff receives a daily report on agent performance. This is the mechanism by which CEPHO.AI becomes genuinely intelligent over time.

---

### ENH-11: Competitor Intelligence Module

**Priority:** High | **Effort:** High | **Grade Impact:** Business Logic C→A

**Current State:** No competitor tracking exists. Victoria has no automated way to monitor what competitors are doing.

**Required Implementation:**

Add a `competitorIntelligence` agent to the AGENT_REGISTRY:

```ts
competitor_intelligence: {
  name: 'Competitor Intelligence Analyst',
  role: 'Tracks competitor activity and surfaces strategic insights',
  schedule: '0 0 7 * * 1-5', // 07:00 every weekday
  capabilities: ['web_search', 'news_monitoring', 'report_generation'],
}
```

The agent's daily task:

1. Search for news about configured competitors (set in Settings > Competitors).
2. Check competitor websites for new product pages, pricing changes, or blog posts.
3. Generate a "Competitor Intelligence Report" and store it in the `generatedDocuments` table.
4. Surface the top 3 insights in Victoria's Morning Briefing.

Add a "Competitors" tab to Settings where Victoria can add competitor names and URLs to track.

**Expected Outcome After Fix:** Victoria receives daily competitor intelligence in her morning briefing. She can also view the full report in the Document Library.

---

### ENH-12: Board Report Generator

**Priority:** High | **Effort:** Medium | **Grade Impact:** Business Logic C→A

**Current State:** No board report functionality exists. Victoria must manually compile reports.

**Required Implementation:**

Add a "Generate Board Report" button to the Operations Dashboard.

Add `boardReport.generate` mutation:

```ts
generate: protectedProcedure
  .input(z.object({ periodStart: z.string(), periodEnd: z.string() }))
  .mutation(async ({ ctx, input }) => {
    // Gather data from all relevant tables
    const [projects, tasks, briefings, ideas] = await Promise.all([...]);
    // Generate report using OpenAI
    const report = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{
        role: 'system',
        content: 'You are a Chief of Staff preparing a board report. Generate a professional, concise board report in Markdown format.'
      }, {
        role: 'user',
        content: `Generate a board report for the period ${input.periodStart} to ${input.periodEnd} based on this data: ${JSON.stringify({ projects, tasks, briefings, ideas })}`
      }]
    });
    // Generate PDF and store in S3
    const pdfUrl = await generatePDF(report.choices[0].message.content);
    // Store in generatedDocuments table
    await db.insert(generatedDocuments).values({ ... });
    return { pdfUrl };
  }),
```

**Expected Outcome After Fix:** Victoria clicks "Generate Board Report", selects a date range, and receives a formatted PDF board report covering projects, KPIs, risks, and recommendations.

---

### ENH-13: Feature Flags (LaunchDarkly)

**Priority:** High | **Effort:** Medium | **Grade Impact:** Operational Excellence D→B

**Current State:** No feature flag system exists. The only way to disable a broken feature in production is a full rollback deployment.

**Required Implementation:**

Install LaunchDarkly SDK:

```bash
pnpm add @launchdarkly/node-server-sdk @launchdarkly/react-client-sdk
```

Add `LAUNCHDARKLY_SDK_KEY` to environment variables.

Create `server/_core/featureFlags.ts`:

```ts
import { init } from "@launchdarkly/node-server-sdk";

const ldClient = init(process.env.LAUNCHDARKLY_SDK_KEY!);

export async function isFeatureEnabled(
  flagKey: string,
  userId: string
): Promise<boolean> {
  await ldClient.waitForInitialization();
  return ldClient.variation(flagKey, { key: userId }, false);
}
```

Define flags for every major feature: `victoria-briefing-pdf`, `project-genesis`, `ai-agents`, `competitor-intelligence`, etc.

**Expected Outcome After Fix:** Any feature can be disabled instantly from the LaunchDarkly dashboard without a deployment. New features can be rolled out to a percentage of users for A/B testing.

---

### ENH-14: Public API (REST via trpc-openapi)

**Priority:** Medium | **Effort:** High | **Grade Impact:** Platform Maturity D→B

**Current State:** No public API exists. Enterprise clients cannot integrate CEPHO.AI data into their own systems.

**Required Implementation:**

Install `trpc-openapi`:

```bash
pnpm add trpc-openapi
```

Add `.meta({ openapi: { method: 'GET', path: '/briefings/latest' } })` to key tRPC procedures.

Generate the OpenAPI spec:

```ts
// server/generate-openapi.ts
import { generateOpenApiDocument } from "trpc-openapi";
import { appRouter } from "./routers";

const openApiDocument = generateOpenApiDocument(appRouter, {
  title: "CEPHO.AI API",
  version: "1.0.0",
  baseUrl: "https://cepho-the-brain-complete.onrender.com/api",
});
```

Serve the OpenAPI spec at `/api/openapi.json` and a Swagger UI at `/api/docs`.

**Expected Outcome After Fix:** Enterprise clients can access a documented REST API at `/api/docs`. They can retrieve briefings, tasks, and project data programmatically.

---

### ENH-15: Multi-Workspace Support

**Priority:** Medium | **Effort:** High | **Grade Impact:** Platform Maturity D→B

**Current State:** Every user has a single workspace. There is no concept of a team, organisation, or multiple workspaces. This blocks agencies, consultants, and executives who manage multiple businesses.

**Required Implementation:**

Add `workspaces` and `workspaceMembers` tables to the schema. Add a `workspaceId` foreign key to all data tables (`projects`, `tasks`, `briefings`, etc.). Add a workspace switcher to the sidebar. Update all tRPC procedures to filter by `workspaceId` instead of `userId`.

---

### ENH-16: Status Page

**Priority:** Medium | **Effort:** Low | **Grade Impact:** Operational Excellence D→B

**Current State:** No status page exists. Enterprise clients have no way to check if the platform is experiencing issues.

**Required Implementation:**

Create a public status page using Instatus or Atlassian Statuspage. Configure automated uptime monitoring to check the `/api/health` endpoint every minute. Integrate with PagerDuty so incidents automatically update the status page. Add a link to the status page in the app footer and in the error boundary component.

**Expected Outcome After Fix:** Enterprise clients can check [status.cepho.ai](https://status.cepho.ai) at any time to see the current status of all platform components and the history of past incidents.

---

## Phase 6 Grade Impact Summary

| Workstream                   | Before Phase 6 | After Phase 6 |
| :--------------------------- | :------------: | :-----------: |
| Frontend Stability           |       B        |       A       |
| AI Agents & Automation       |       A-       |      A+       |
| Business Logic Completeness  |       A-       |      A+       |
| Compliance & Data Governance |       C        |       A       |
| Operational Excellence       |       B        |      A+       |
| Platform Maturity            |       C        |       A       |
| **Overall**                  |     **A-**     |    **A+**     |
