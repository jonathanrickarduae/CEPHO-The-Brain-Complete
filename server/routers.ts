import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { z } from "zod";
import { projectsRouter } from "./routers/projects";
import { agentsRouter } from "./routers/agents";
import { innovationRouter } from "./routers/innovation";
import { genesisRouter } from "./routers/genesis";
import { genesisPhaseAgentRouter } from "./routers/genesisPhaseAgent";
import { agentReflectionRouter } from "./routers/agentReflection";
import { voiceRouter } from "./routers/voice";
import { inboxRouter } from "./routers/inbox";
import {
  victoriaConversations,
  learningEntries,
  financialData,
  tasks,
  decisions,
  documents,
  calendarEvents,
  settings,
  projects,
} from "../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { storagePut } from "./storage";

// ─── Victoria AI Router ───────────────────────────────────────────────────────
const victoriaRouter = router({
  chat: protectedProcedure
    .input(z.object({
      message: z.string().min(1).max(4000),
      context: z.string().default("general"),
      projectId: z.number().optional(),
      conversationId: z.number().optional(),
      projectContext: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();

      const systemPrompt = `You are Victoria, AI Chief of Staff for Jonathan Rickard at CEPHO.

OPERATING RULES:
- Direct and functional only. No greetings, no pleasantries, no "I hope this helps".
- Lead with data and numbers. If you don't have them, say so.
- Flag risks immediately. Don't soften bad news.
- Be decisive. Give a recommendation, not a list of options unless explicitly asked.
- Keep responses concise. If it can be said in 3 sentences, use 3 sentences.
- Never use filler phrases: "Great question", "Certainly", "Of course", "Happy to help".

CONTEXT:
- Jonathan runs 6 companies: Celadon, Celanova, Perfect, Olmack, Boundless, Personal
- Current focus: ${input.projectContext || "General operations across all companies"}
- Context: ${input.context}

CAPABILITIES:
- Strategic advice across all 6 companies
- Risk identification and escalation
- Task prioritisation and delegation
- Financial analysis and runway monitoring
- Decision support with structured frameworks
- Coordination with AI SMEs when specialist input is needed`;

      const messages = [
        { role: "system" as const, content: systemPrompt },
        { role: "user" as const, content: input.message },
      ];

      const result = await invokeLLM({ messages, max_tokens: 1000 });
      const responseText = typeof result.choices[0]?.message?.content === "string"
        ? result.choices[0].message.content
        : "Unable to generate response.";

      // Save conversation to DB
      if (db) {
        try {
          if (input.conversationId) {
            const existing = await db
              .select()
              .from(victoriaConversations)
              .where(eq(victoriaConversations.id, input.conversationId))
              .limit(1);
            if (existing[0]) {
              const msgs = JSON.parse(existing[0].messages || "[]");
              msgs.push(
                { role: "user", content: input.message, ts: Date.now() },
                { role: "assistant", content: responseText, ts: Date.now() }
              );
              await db.update(victoriaConversations)
                .set({ messages: JSON.stringify(msgs) })
                .where(eq(victoriaConversations.id, input.conversationId));
            }
          } else {
            await db.insert(victoriaConversations).values({
              projectId: input.projectId,
              context: input.context,
              messages: JSON.stringify([
                { role: "user", content: input.message, ts: Date.now() },
                { role: "assistant", content: responseText, ts: Date.now() },
              ]),
            });
          }

          // Capture to Vault
          await db.insert(learningEntries).values({
            source: "victoria",
            category: "interaction",
            insight: `User asked: "${input.message.slice(0, 200)}" — Victoria responded with ${responseText.length} chars`,
            context: JSON.stringify({ projectId: input.projectId, context: input.context }),
            confidence: 70,
          });
        } catch (e) {
          console.error("[Victoria] DB save error:", e);
        }
      }

      return { response: responseText };
    }),

  getConversations: protectedProcedure
    .input(z.object({ projectId: z.number().optional() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const rows = await db
        .select()
        .from(victoriaConversations)
        .orderBy(desc(victoriaConversations.updatedAt))
        .limit(20);
      return rows;
    }),

  morningBrief: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { actions: [], summary: "" };

    // Pull overdue/blocked tasks and recent decisions across all projects
    const [allTasks, allProjects] = await Promise.all([
      db.select().from(tasks).orderBy(desc(tasks.createdAt)).limit(50),
      db.select().from(projects).limit(20),
    ]);

    const projectMap = Object.fromEntries(allProjects.map(p => [p.id, p]));

    const blockedTasks = allTasks.filter(t => t.status === "blocked");
    const overdueTasks = allTasks.filter(t => {
      if (!t.dueDate || t.status === "done") return false;
      return new Date(t.dueDate) < new Date();
    });
    const highPriorityTasks = allTasks.filter(t =>
      (t.priority === "high" || t.priority === "critical") && t.status !== "done"
    ).slice(0, 6);

    // Build action items from live data
    const actions = [
      ...blockedTasks.slice(0, 3).map(t => ({
        id: `blocked-${t.id}`,
        project: projectMap[t.projectId ?? 0]?.name ?? "General",
        projectColor: projectMap[t.projectId ?? 0]?.accentColor ?? "#6366f1",
        action: `Unblock: ${t.title}`,
        priority: "high" as const,
        status: "red" as const,
      })),
      ...overdueTasks.slice(0, 3).map(t => ({
        id: `overdue-${t.id}`,
        project: projectMap[t.projectId ?? 0]?.name ?? "General",
        projectColor: projectMap[t.projectId ?? 0]?.accentColor ?? "#f59e0b",
        action: `Overdue: ${t.title}`,
        priority: "high" as const,
        status: "amber" as const,
      })),
      ...highPriorityTasks.slice(0, 4).map(t => ({
        id: `priority-${t.id}`,
        project: projectMap[t.projectId ?? 0]?.name ?? "General",
        projectColor: projectMap[t.projectId ?? 0]?.accentColor ?? "#10b981",
        action: t.title,
        priority: (t.priority as "high" | "medium" | "low") ?? "medium",
        status: "green" as const,
      })),
    ];

    return { actions, summary: `${blockedTasks.length} blocked, ${overdueTasks.length} overdue, ${highPriorityTasks.length} high priority` };
  }),
});

// ─── Financial Pulse Router ───────────────────────────────────────────────────
const financialRouter = router({
  getAll: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(financialData).orderBy(financialData.companyName);
  }),

  upsert: protectedProcedure
    .input(z.object({
      companySlug: z.string(),
      companyName: z.string(),
      cashGbp: z.number().optional(),
      burnMonthlyGbp: z.number().optional(),
      revenueMonthlyGbp: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.insert(financialData).values({
        companySlug: input.companySlug,
        companyName: input.companyName,
        cashGbp: input.cashGbp ?? 0,
        burnMonthlyGbp: input.burnMonthlyGbp ?? 0,
        revenueMonthlyGbp: input.revenueMonthlyGbp ?? 0,
        notes: input.notes ?? "",
      }).onDuplicateKeyUpdate({
        set: {
          cashGbp: input.cashGbp ?? 0,
          burnMonthlyGbp: input.burnMonthlyGbp ?? 0,
          revenueMonthlyGbp: input.revenueMonthlyGbp ?? 0,
          notes: input.notes ?? "",
        },
      });
      return { success: true };
    }),
});

// ─── Tasks Router ─────────────────────────────────────────────────────────────
const tasksRouter = router({
  getAll: protectedProcedure
    .input(z.object({ projectId: z.number().optional() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      if (input.projectId) {
        return db.select().from(tasks).where(eq(tasks.projectId, input.projectId)).orderBy(desc(tasks.createdAt));
      }
      return db.select().from(tasks).orderBy(desc(tasks.createdAt)).limit(100);
    }),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(256),
      description: z.string().optional(),
      projectId: z.number().optional(),
      assignee: z.string().optional(),
      dueDate: z.string().optional(),
      priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.insert(tasks).values({
        title: input.title,
        description: input.description ?? "",
        projectId: input.projectId,
        assignee: input.assignee ?? "",
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        priority: input.priority,
        status: "todo",
      });
      return { success: true };
    }),

  updateStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["todo", "in_progress", "done", "blocked"]),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.update(tasks).set({ status: input.status }).where(eq(tasks.id, input.id));
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.delete(tasks).where(eq(tasks.id, input.id));
      return { success: true };
    }),
});

// ─── Decisions Router ─────────────────────────────────────────────────────────
const decisionsRouter = router({
  getAll: protectedProcedure
    .input(z.object({ projectId: z.number().optional() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      if (input.projectId) {
        return db.select().from(decisions).where(eq(decisions.projectId, input.projectId)).orderBy(desc(decisions.createdAt));
      }
      return db.select().from(decisions).orderBy(desc(decisions.createdAt)).limit(100);
    }),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(256),
      context: z.string().optional(),
      rationale: z.string().optional(),
      outcome: z.string().optional(),
      projectId: z.number().optional(),
      impact: z.enum(["low", "medium", "high", "critical"]).default("medium"),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.insert(decisions).values({
        title: input.title,
        context: input.context ?? "",
        rationale: input.rationale ?? "",
        outcome: input.outcome ?? "",
        projectId: input.projectId,
        impact: input.impact,
        status: "active",
        madeBy: ctx.user?.name ?? "Jonathan",
      });
      // Capture to Vault
      await db.insert(learningEntries).values({
        source: "project",
        category: "decision",
        insight: `Decision made: "${input.title}" — Impact: ${input.impact}`,
        context: JSON.stringify({ projectId: input.projectId, rationale: input.rationale }),
        confidence: 85,
      });
      return { success: true };
    }),

  updateOutcome: protectedProcedure
    .input(z.object({ id: z.number(), outcome: z.string(), status: z.enum(["active", "superseded", "reversed"]) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.update(decisions).set({ outcome: input.outcome, status: input.status }).where(eq(decisions.id, input.id));
      return { success: true };
    }),
});

// ─── Documents Router ─────────────────────────────────────────────────────────
const documentsRouter = router({
  getAll: protectedProcedure
    .input(z.object({ projectId: z.number().optional() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      if (input.projectId) {
        return db.select().from(documents).where(eq(documents.projectId, input.projectId)).orderBy(desc(documents.createdAt));
      }
      return db.select().from(documents).orderBy(desc(documents.createdAt)).limit(100);
    }),

  upload: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(256),
      fileType: z.string(),
      fileSize: z.number().optional(),
      fileBase64: z.string(),
      projectId: z.number().optional(),
      isConfidential: z.boolean().default(false),
      tags: z.array(z.string()).default([]),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { success: false, url: "" };
      const buffer = Buffer.from(input.fileBase64, "base64");
      const key = `documents/${Date.now()}-${input.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { url } = await storagePut(key, buffer, input.fileType);
      await db.insert(documents).values({
        name: input.name,
        fileType: input.fileType,
        fileSize: input.fileSize ?? buffer.length,
        storageKey: key,
        storageUrl: url,
        projectId: input.projectId,
        isConfidential: input.isConfidential ? 1 : 0,
        uploadedBy: ctx.user?.name ?? "Jonathan",
        tags: JSON.stringify(input.tags),
      });
      return { success: true, url };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.delete(documents).where(eq(documents.id, input.id));
      return { success: true };
    }),
});

// ─── Calendar Router ──────────────────────────────────────────────────────────
const calendarRouter = router({
  getEvents: protectedProcedure
    .input(z.object({
      startDate: z.string(),
      endDate: z.string(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(calendarEvents).orderBy(calendarEvents.startTime).limit(200);
    }),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(256),
      startTime: z.string(),
      endTime: z.string(),
      projectSlug: z.string().optional(),
      location: z.string().optional(),
      notes: z.string().optional(),
      isAllDay: z.boolean().default(false),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.insert(calendarEvents).values({
        title: input.title,
        startTime: new Date(input.startTime),
        endTime: new Date(input.endTime),
        projectSlug: input.projectSlug ?? "",
        location: input.location ?? "",
        notes: input.notes ?? "",
        isAllDay: input.isAllDay ? 1 : 0,
        source: "manual",
      });
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.delete(calendarEvents).where(eq(calendarEvents.id, input.id));
      return { success: true };
    }),

  // ── Outlook Sync ────────────────────────────────────────────────────────────
  syncOutlook: protectedProcedure
    .mutation(async () => {
      const db = await getDb();
      if (!db) return { success: false, synced: 0, errors: ["db-unavailable"] };

      // Fetch next 14 days from Outlook Calendar via MCP
      const now = new Date();
      const twoWeeksOut = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
      const timeMin = now.toISOString();
      const timeMax = twoWeeksOut.toISOString();

      let outlookEvents: any[] = [];
      const errors: string[] = [];

      try {
        const { exec: _exec } = await import("child_process");
        const { promisify } = await import("util");
        const execAsync = promisify(_exec);
        const inputJson = JSON.stringify({ time_min: timeMin, time_max: timeMax, max_results: 50 });
        const { stdout } = await execAsync(
          `manus-mcp-cli tool call outlook_calendar_search_events --server outlook-calendar --input '${inputJson.replace(/'/g, "'\\''")}' `,
          { timeout: 25000 }
        );
        // Parse the last JSON block from stdout
        const lines = stdout.trim().split("\n");
        for (let i = lines.length - 1; i >= 0; i--) {
          const l = lines[i].trim();
          if (l.startsWith("{") || l.startsWith("[")) {
            const parsed = JSON.parse(l);
            // Outlook MCP returns { value: [...] } or { events: [...] } or array
            outlookEvents = parsed?.value ?? parsed?.events ?? (Array.isArray(parsed) ? parsed : []);
            break;
          }
        }
      } catch (err) {
        errors.push(String(err));
      }

      let synced = 0;
      for (const ev of outlookEvents) {
        try {
          const externalId = ev.id ?? ev.iCalUId ?? null;
          if (!externalId) continue;

          const title = ev.subject ?? ev.summary ?? "(No title)";
          const startRaw = ev.start?.dateTime ?? ev.start?.date ?? null;
          const endRaw = ev.end?.dateTime ?? ev.end?.date ?? null;
          if (!startRaw || !endRaw) continue;

          const startTime = new Date(startRaw);
          const endTime = new Date(endRaw);
          const location = ev.location?.displayName ?? ev.location ?? "";
          const isAllDay = !ev.start?.dateTime ? 1 : 0;

          // Upsert: delete existing by externalId then insert fresh
          await db.delete(calendarEvents).where(eq(calendarEvents.externalId, externalId));
          await db.insert(calendarEvents).values({
            title,
            startTime,
            endTime,
            location: typeof location === "string" ? location : "",
            notes: ev.bodyPreview ?? "",
            isAllDay,
            source: "outlook",
            externalId,
            projectSlug: "",
          });
          synced++;
        } catch (e) {
          errors.push(String(e));
        }
      }

      return { success: true, synced, total: outlookEvents.length, errors };
    }),

  // ── Conflict Detection ───────────────────────────────────────────────────────
  detectConflicts: protectedProcedure
    .input(z.object({ date: z.string() })) // YYYY-MM-DD
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const dayStart = new Date(input.date + "T00:00:00.000Z");
      const dayEnd   = new Date(input.date + "T23:59:59.999Z");

      const { lte } = await import("drizzle-orm");
      // Fetch all events that overlap the day: startTime < dayEnd AND endTime > dayStart
      const allEvents = await db.select().from(calendarEvents)
        .where(lte(calendarEvents.startTime, dayEnd))
        .orderBy(calendarEvents.startTime);

      // Filter to those whose endTime is after dayStart (i.e. they overlap the day)
      const dayEvents = allEvents.filter(ev => new Date(ev.endTime) > dayStart);

      const conflicts: Array<{ event1: typeof dayEvents[0]; event2: typeof dayEvents[0] }> = [];
      for (let i = 0; i < dayEvents.length; i++) {
        for (let j = i + 1; j < dayEvents.length; j++) {
          const a = dayEvents[i];
          const b = dayEvents[j];
          // Overlap: a starts before b ends AND b starts before a ends
          if (new Date(a.startTime) < new Date(b.endTime) && new Date(b.startTime) < new Date(a.endTime)) {
            conflicts.push({ event1: a, event2: b });
          }
        }
      }
      return conflicts;
    }),
});

// ─── Vault Router ─────────────────────────────────────────────────────────────
const vaultRouter = router({
  getLearnings: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(learningEntries).orderBy(desc(learningEntries.createdAt)).limit(input.limit);
    }),

  getStats: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { decisions: 0, interactions: 0, patterns: 0 };
    const [decisionsCount, interactionsCount] = await Promise.all([
      db.select().from(learningEntries).where(eq(learningEntries.category, "decision")),
      db.select().from(learningEntries).where(eq(learningEntries.source, "victoria")),
    ]);
    return {
      decisions: decisionsCount.length,
      interactions: interactionsCount.length,
      patterns: Math.floor((decisionsCount.length + interactionsCount.length) / 5),
    };
  }),

  add: protectedProcedure
    .input(z.object({
      category: z.enum(["task", "decision", "note", "document", "insight", "pattern"]).default("insight"),
      insight: z.string().min(1).max(500),
      context: z.string().optional(),
      confidence: z.number().min(0).max(100).default(80),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.insert(learningEntries).values({
        source: "user",
        category: input.category,
        insight: input.insight,
        context: input.context ?? "",
        confidence: input.confidence,
      });
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.delete(learningEntries).where(eq(learningEntries.id, input.id));
      return { success: true };
    }),
});

// ─── Settings Router ──────────────────────────────────────────────────────────
const settingsRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const rows = await db.select().from(settings).where(eq(settings.userId, ctx.user!.id)).limit(1);
    return rows[0] ?? null;
  }),

  update: protectedProcedure
    .input(z.object({
      victoriaStyle: z.enum(["direct", "detailed", "brief"]).optional(),
      victoriaAutobrief: z.boolean().optional(),
      notificationsEmail: z.boolean().optional(),
      notificationsPush: z.boolean().optional(),
      googleCalendarConnected: z.boolean().optional(),
      outlookConnected: z.boolean().optional(),
      gmailConnected: z.boolean().optional(),
      timezone: z.string().optional(),
      currency: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { success: false };
      const existing = await db.select().from(settings).where(eq(settings.userId, ctx.user!.id)).limit(1);
      if (existing[0]) {
        const updateSet: Record<string, unknown> = {};
      if (input.victoriaStyle !== undefined) updateSet.victoriaStyle = input.victoriaStyle;
      if (input.victoriaAutobrief !== undefined) updateSet.victoriaAutobrief = input.victoriaAutobrief ? 1 : 0;
      if (input.notificationsEmail !== undefined) updateSet.notificationsEmail = input.notificationsEmail ? 1 : 0;
      if (input.notificationsPush !== undefined) updateSet.notificationsPush = input.notificationsPush ? 1 : 0;
      if (input.googleCalendarConnected !== undefined) updateSet.googleCalendarConnected = input.googleCalendarConnected ? 1 : 0;
      if (input.outlookConnected !== undefined) updateSet.outlookConnected = input.outlookConnected ? 1 : 0;
      if (input.gmailConnected !== undefined) updateSet.gmailConnected = input.gmailConnected ? 1 : 0;
      if (input.timezone !== undefined) updateSet.timezone = input.timezone;
      if (input.currency !== undefined) updateSet.currency = input.currency;
      await db.update(settings).set(updateSet as any).where(eq(settings.userId, ctx.user!.id));
      } else {
        await db.insert(settings).values({
        userId: ctx.user!.id,
        victoriaStyle: (input.victoriaStyle as "direct" | "detailed" | "brief") ?? "direct",
        victoriaAutobrief: input.victoriaAutobrief !== undefined ? (input.victoriaAutobrief ? 1 : 0) : 1,
        notificationsEmail: input.notificationsEmail !== undefined ? (input.notificationsEmail ? 1 : 0) : 1,
        notificationsPush: input.notificationsPush !== undefined ? (input.notificationsPush ? 1 : 0) : 1,
        googleCalendarConnected: input.googleCalendarConnected !== undefined ? (input.googleCalendarConnected ? 1 : 0) : 0,
        outlookConnected: input.outlookConnected !== undefined ? (input.outlookConnected ? 1 : 0) : 0,
        gmailConnected: input.gmailConnected !== undefined ? (input.gmailConnected ? 1 : 0) : 0,
        timezone: input.timezone ?? "Europe/London",
        currency: input.currency ?? "GBP",
      });
      }
      return { success: true };
    }),
});

// ─── SME Consultation Router ──────────────────────────────────────────────────
const smeRouter = router({
  consult: protectedProcedure
    .input(z.object({
      smeName: z.string(),
      smeDomain: z.string(),
      smeTitle: z.string(),
      message: z.string().min(1).max(4000),
      projectContext: z.string().optional(),
      conversationHistory: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })).default([]),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();

      const systemPrompt = `You are ${input.smeName}, ${input.smeTitle} — a world-class AI expert in ${input.smeDomain}.

OPERATING RULES:
- You are advising Jonathan Rickard, a founder running 6 companies: Celadon, Celanova, Perfect, Olmack, Boundless, Personal.
- Be direct and specific. Give concrete recommendations, not generic advice.
- Lead with your expert assessment. Don't hedge excessively.
- Flag risks and blind spots the founder may not have considered.
- Reference real frameworks, precedents, and market data where relevant.
- Keep responses focused and actionable.
${input.projectContext ? `\nProject context: ${input.projectContext}` : ""}`;

      const messages = [
        { role: "system" as const, content: systemPrompt },
        ...input.conversationHistory.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
        { role: "user" as const, content: input.message },
      ];

      const result = await invokeLLM({ messages, max_tokens: 1200 });
      const responseText = typeof result.choices[0]?.message?.content === "string"
        ? result.choices[0].message.content
        : "Unable to generate response.";

      // Save to Vault
      if (db) {
        try {
          await db.insert(learningEntries).values({
            source: "sme",
            category: "consultation",
            insight: `Consulted ${input.smeName} (${input.smeDomain}): "${input.message.slice(0, 200)}"`,
            context: JSON.stringify({ smeName: input.smeName, domain: input.smeDomain }),
            confidence: 80,
          });
        } catch (e) {
          console.error("[SME] Vault save error:", e);
        }
      }

      return { response: responseText };
    }),
});

// ─── App Router ───────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  victoria: victoriaRouter,
  financial: financialRouter,
  tasks: tasksRouter,
  decisions: decisionsRouter,
  documents: documentsRouter,
  calendar: calendarRouter,
  vault: vaultRouter,
  settings: settingsRouter,
  sme: smeRouter,
  projects: projectsRouter,
  agents: agentsRouter,
  innovation: innovationRouter,
  genesis: genesisRouter,
  genesisAgent: genesisPhaseAgentRouter,
  agentReflection: agentReflectionRouter,
  voice: voiceRouter,
  inbox: inboxRouter,
});

export type AppRouter = typeof appRouter;
