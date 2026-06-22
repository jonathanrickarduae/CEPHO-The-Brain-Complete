import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { getDb } from "../db";
import { z } from "zod";
import {
  projects,
  milestones,
  tasks,
  decisions,
  documents,
  financialData,
  generatedReports,
  signalActions,
} from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { storagePut } from "../storage";

// ─── Projects Router ──────────────────────────────────────────────────────────
export const projectsRouter = router({
  // List all projects
  list: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(projects).orderBy(projects.name);
  }),

  // Get a single project by slug
  get: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const rows = await db.select().from(projects).where(eq(projects.slug, input.slug)).limit(1);
      return rows[0] ?? null;
    }),

  // Get a single project by ID
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const rows = await db.select().from(projects).where(eq(projects.id, input.id)).limit(1);
      return rows[0] ?? null;
    }),

  // Create a new project
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(128),
      slug: z.string().min(1).max(64),
      description: z.string().optional(),
      accentColor: z.string().default("#00D4FF"),
      initials: z.string().min(1).max(4),
      overview: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const result = await db.insert(projects).values({
        name: input.name,
        slug: input.slug,
        description: input.description ?? "",
        accentColor: input.accentColor,
        initials: input.initials,
        overview: input.overview ?? "",
        status: "green",
      });
      return { id: Number((result as any).insertId) };
    }),

  // Update a project
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      status: z.enum(["red", "amber", "green"]).optional(),
      accentColor: z.string().optional(),
      overview: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      const { id, ...rest } = input;
      const updateSet: Record<string, unknown> = {};
      if (rest.name !== undefined) updateSet.name = rest.name;
      if (rest.description !== undefined) updateSet.description = rest.description;
      if (rest.status !== undefined) updateSet.status = rest.status;
      if (rest.accentColor !== undefined) updateSet.accentColor = rest.accentColor;
      if (rest.overview !== undefined) updateSet.overview = rest.overview;
      await db.update(projects).set(updateSet as any).where(eq(projects.id, id));
      return { success: true };
    }),

  // Delete a project
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.delete(projects).where(eq(projects.id, input.id));
      return { success: true };
    }),

  // List all projects with live task counts and last-activity for the hub
  listWithStats: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const allProjects = await db.select().from(projects).orderBy(projects.name);
    const allTasks = await db.select().from(tasks);
    const allDecisions = await db.select().from(decisions);

    return allProjects.map(p => {
      const pTasks = allTasks.filter(t => t.projectId === p.id);
      const tasksTotal = pTasks.length;
      const tasksComplete = pTasks.filter(t => t.status === "done").length;
      const tasksActive = pTasks.filter(t => t.status !== "done" && t.status !== "blocked").length;
      const blocked = pTasks.filter(t => t.status === "blocked").length;
      // Last activity: most recent task or decision update
      const allDates = [
        ...pTasks.map(t => t.updatedAt ? new Date(t.updatedAt).getTime() : 0),
        ...allDecisions.filter(d => d.projectId === p.id).map(d => d.createdAt ? new Date(d.createdAt).getTime() : 0),
      ].filter(Boolean);
      const lastActivityMs = allDates.length ? Math.max(...allDates) : null;
      const lastActivity = lastActivityMs
        ? (() => {
            const diff = Date.now() - lastActivityMs;
            if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`;
            if (diff < 86400000) return `${Math.round(diff / 3600000)}h ago`;
            return `${Math.round(diff / 86400000)}d ago`;
          })()
        : "No activity";
      return { ...p, tasksTotal, tasksComplete, tasksActive, blocked, lastActivity };
    });
  }),

  // Get full portal data for a project (tasks, decisions, docs, milestones, financial)
  getPortalData: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { tasks: [], decisions: [], documents: [], milestones: [], financial: null };

      // First get the project to find its slug for financial matching
      const projectRow = await db.select().from(projects).where(eq(projects.id, input.projectId)).limit(1);
      const projectSlug = projectRow[0]?.slug ?? "";

      const [projectTasks, projectDecisions, projectDocs, projectMilestones, projectFinancial] = await Promise.all([
        db.select().from(tasks).where(eq(tasks.projectId, input.projectId)).orderBy(desc(tasks.createdAt)).limit(50),
        db.select().from(decisions).where(eq(decisions.projectId, input.projectId)).orderBy(desc(decisions.createdAt)).limit(50),
        db.select().from(documents).where(eq(documents.projectId, input.projectId)).orderBy(desc(documents.createdAt)).limit(50),
        db.select().from(milestones).where(eq(milestones.projectId, input.projectId)).orderBy(milestones.dueDate),
        projectSlug ? db.select().from(financialData).where(eq(financialData.companySlug, projectSlug)).limit(1) : Promise.resolve([]),
      ]);

      return {
        tasks: projectTasks,
        decisions: projectDecisions,
        documents: projectDocs,
        milestones: projectMilestones,
        financial: projectFinancial[0] ?? null,
      };
    }),

  // ─── Milestones ──────────────────────────────────────────────────────────────
  milestones: router({
    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        return db.select().from(milestones).where(eq(milestones.projectId, input.projectId)).orderBy(milestones.dueDate);
      }),

    create: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        title: z.string().min(1).max(256),
        description: z.string().optional(),
        dueDate: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("DB unavailable");
        const result = await db.insert(milestones).values({
          projectId: input.projectId,
          title: input.title,
          description: input.description ?? "",
          dueDate: input.dueDate,
          status: "pending",
        });
        return { id: Number((result as any).insertId) };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        dueDate: z.date().optional(),
        status: z.enum(["pending", "in_progress", "complete", "overdue"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { success: false };
        const { id, ...rest } = input;
        const updateSet: Record<string, unknown> = {};
        if (rest.title !== undefined) updateSet.title = rest.title;
        if (rest.description !== undefined) updateSet.description = rest.description;
        if (rest.dueDate !== undefined) updateSet.dueDate = rest.dueDate;
        if (rest.status !== undefined) updateSet.status = rest.status;
        await db.update(milestones).set(updateSet as any).where(eq(milestones.id, id));
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { success: false };
        await db.delete(milestones).where(eq(milestones.id, input.id));
        return { success: true };
      }),
  }),

  // ─── Report Generation ────────────────────────────────────────────────────────
  reports: router({
    list: protectedProcedure
      .input(z.object({ projectId: z.number().optional() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        if (input.projectId) {
          return db.select().from(generatedReports)
            .where(eq(generatedReports.projectId, input.projectId))
            .orderBy(desc(generatedReports.createdAt))
            .limit(20);
        }
        return db.select().from(generatedReports).orderBy(desc(generatedReports.createdAt)).limit(20);
      }),

    generate: protectedProcedure
      .input(z.object({
        projectId: z.number().optional(),
        reportType: z.enum(["status", "board_pack", "weekly_brief", "financial", "custom"]),
        customPrompt: z.string().optional(),
        projectName: z.string(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("DB unavailable");

        // Gather context data
        let contextData = "";
        if (input.projectId && db) {
          const [projectTasks, projectDecisions, projectDocs, projectMilestones] = await Promise.all([
            db.select().from(tasks).where(eq(tasks.projectId, input.projectId)).orderBy(desc(tasks.createdAt)).limit(20),
            db.select().from(decisions).where(eq(decisions.projectId, input.projectId)).orderBy(desc(decisions.createdAt)).limit(10),
            db.select().from(documents).where(eq(documents.projectId, input.projectId)).orderBy(desc(documents.createdAt)).limit(10),
            db.select().from(milestones).where(eq(milestones.projectId, input.projectId)).orderBy(milestones.dueDate),
          ]);

          contextData = `
PROJECT: ${input.projectName}

TASKS (${projectTasks.length} total):
${projectTasks.map(t => `- [${t.status}] ${t.title} (${t.priority} priority, due: ${t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "no date"})`).join("\n")}

DECISIONS (${projectDecisions.length} total):
${projectDecisions.map(d => `- ${d.title}: ${d.rationale}`).join("\n")}

MILESTONES (${projectMilestones.length} total):
${projectMilestones.map(m => `- [${m.status}] ${m.title} (due: ${m.dueDate ? new Date(m.dueDate).toLocaleDateString() : "no date"})`).join("\n")}

DOCUMENTS: ${projectDocs.map(d => d.name).join(", ")}
`;
        }

        const reportPrompts: Record<string, string> = {
          status: `Generate a concise project status report for ${input.projectName}. Include: executive summary, RAG status, key achievements this period, risks and blockers, upcoming milestones, and recommended actions. Use professional business language. No hyphens. Black/white/grey document style.`,
          board_pack: `Generate a board pack update for ${input.projectName}. Include: strategic progress, financial summary, key decisions made, risks requiring board attention, and forward plan. Tone: factual, non-emotive, suitable for serious investors. No hyphens.`,
          weekly_brief: `Generate a weekly brief for ${input.projectName}. Include: what was accomplished this week, what is planned for next week, blockers requiring attention, and one key metric or insight. Keep it under one page. Direct and functional.`,
          financial: `Generate a financial summary for ${input.projectName}. Include: current financial position, burn rate, revenue trajectory, key financial risks, and recommended actions. Use AED as primary currency. Factual and data-driven.`,
          custom: input.customPrompt ?? `Generate a comprehensive report for ${input.projectName}.`,
        };

        const systemPrompt = `You are Victoria, AI Chief of Staff for Jonathan Rickard at CEPHO. Generate a professional business report. Rules: direct language, no hyphens, no filler phrases, black/white/grey document style, no page numbers, professional business tone suitable for serious investors.`;

        const userPrompt = `${reportPrompts[input.reportType]}\n\nCONTEXT DATA:\n${contextData || "No live data available — generate based on project name and type."}`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        });

        const content = response.choices[0]?.message?.content ?? "Report generation failed.";
        const title = `${input.projectName} — ${input.reportType.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())} — ${new Date().toLocaleDateString("en-GB")}`;

        // Save to DB
        const insertData: Record<string, unknown> = {
          reportType: input.reportType,
          title,
          content,
        };
        if (input.projectId !== undefined) insertData.projectId = input.projectId;
        const result = await db.insert(generatedReports).values(insertData as any);

        return {
          id: Number((result as any).insertId),
          title,
          content,
        };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { success: false };
        await db.delete(generatedReports).where(eq(generatedReports.id, input.id));
        return { success: true };
      }),
  }),
});
