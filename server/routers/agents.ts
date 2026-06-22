import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { getDb } from "../db";
import { z } from "zod";
import { agents, agentRuns, tasks, projects } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

// ─── Agents Router ────────────────────────────────────────────────────────────
export const agentsRouter = router({
  list: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(agents).orderBy(desc(agents.createdAt));
  }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(128),
      role: z.string().min(1).max(128),
      description: z.string().optional(),
      capabilities: z.array(z.string()).default([]),
      accentColor: z.string().default("#6366f1"),
      projectId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const result = await db.insert(agents).values({
        name: input.name,
        role: input.role,
        description: input.description ?? "",
        capabilities: JSON.stringify(input.capabilities),
        accentColor: input.accentColor,
        projectId: input.projectId ?? null,
        status: "active",
        runCount: 0,
      });
      return { id: Number((result as any).insertId) };
    }),

  updateStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["active", "paused", "archived"]),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.update(agents).set({ status: input.status }).where(eq(agents.id, input.id));
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.delete(agents).where(eq(agents.id, input.id));
      return { success: true };
    }),

  listRuns: protectedProcedure
    .input(z.object({ limit: z.number().default(20), agentId: z.number().optional() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      if (input.agentId) {
        return db.select().from(agentRuns)
          .where(eq(agentRuns.agentId, input.agentId))
          .orderBy(desc(agentRuns.createdAt))
          .limit(input.limit);
      }
      return db.select().from(agentRuns).orderBy(desc(agentRuns.createdAt)).limit(input.limit);
    }),

  triggerRun: protectedProcedure
    .input(z.object({
      agentId: z.number(),
      prompt: z.string().min(1),
      projectId: z.number().optional(),
      taskId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      // Get agent details
      const agentRows = await db.select().from(agents).where(eq(agents.id, input.agentId)).limit(1);
      const agent = agentRows[0];
      if (!agent) throw new Error("Agent not found");

      // Get project context if provided
      let projectContext = "";
      if (input.projectId) {
        const projRows = await db.select().from(projects).where(eq(projects.id, input.projectId)).limit(1);
        const proj = projRows[0];
        if (proj) projectContext = `\nProject context: ${proj.name} — ${proj.description ?? ""}. ${proj.overview ?? ""}`;
      }

      // Insert run record as 'running'
      const insertResult = await db.insert(agentRuns).values({
        agentId: input.agentId,
        projectId: input.projectId ?? null,
        taskId: input.taskId ?? null,
        status: "running",
        prompt: input.prompt,
        startedAt: new Date(),
      });
      const runId = Number((insertResult as any).insertId);

      try {
        const capabilities = JSON.parse(agent.capabilities || "[]") as string[];
        const systemPrompt = `You are ${agent.name}, a ${agent.role} working for CEPHO.
${agent.description ? `\n${agent.description}` : ""}
${capabilities.length > 0 ? `\nCapabilities: ${capabilities.join(", ")}` : ""}
${projectContext}

OPERATING RULES:
- Execute the task directly. Return structured, actionable results.
- Be direct and factual. No pleasantries.
- If you create tasks or decisions, format them clearly.
- Flag blockers or missing information immediately.`;

        const response = await invokeLLM({
          messages: [
            { role: "system" as const, content: systemPrompt },
            { role: "user" as const, content: input.prompt },
          ],
          max_tokens: 2000,
        });

        const result = typeof response.choices[0]?.message?.content === "string"
          ? response.choices[0].message.content
          : "No result returned.";

        // Update run as completed
        await db.update(agentRuns).set({
          status: "completed",
          result,
          completedAt: new Date(),
        }).where(eq(agentRuns.id, runId));

        // Increment agent run count and update lastRunAt
        await db.update(agents).set({
          runCount: (agent.runCount ?? 0) + 1,
          lastRunAt: new Date(),
        }).where(eq(agents.id, input.agentId));

        // If a task is linked, update its status
        if (input.taskId) {
          await db.update(tasks).set({ status: "in_progress" }).where(eq(tasks.id, input.taskId));
        }

        return { id: runId, status: "completed", result };
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : "Unknown error";
        await db.update(agentRuns).set({
          status: "failed",
          errorMessage: errMsg,
          completedAt: new Date(),
        }).where(eq(agentRuns.id, runId));
        throw err;
      }
    }),
});
