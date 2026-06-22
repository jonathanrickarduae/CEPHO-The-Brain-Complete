/**
 * Project Command Center Router
 * PMO-style hub for each project: milestones, team, finance, risks, comms, automation
 */
import { z } from "zod";
import { desc, eq, and } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import {
  projectMilestones,
  projectTeamMembers,
  projectFinance,
  projectRisks,
  projectComms,
  projectAutomation,
  tasks,
  projects,
} from "../../drizzle/schema";

export const projectCommandCenterRouter = router({
  // ─── Overview ──────────────────────────────────────────────────────────────
  getOverview: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      const [milestoneRows, taskRows, riskRows, teamRows, financeRows] = await Promise.all([
        db.select().from(projectMilestones).where(eq(projectMilestones.projectId, input.projectId)).orderBy(projectMilestones.dueDate),
        db.select().from(tasks).where(eq(tasks.projectId, input.projectId)).orderBy(desc(tasks.createdAt)).limit(200),
        db.select().from(projectRisks).where(eq(projectRisks.projectId, input.projectId)),
        db.select().from(projectTeamMembers).where(eq(projectTeamMembers.projectId, input.projectId)),
        db.select().from(projectFinance).where(eq(projectFinance.projectId, input.projectId)),
      ]);

      const totalBudgeted = financeRows.reduce((s, r) => s + (r.budgeted ?? 0), 0);
      const totalActual = financeRows.reduce((s, r) => s + (r.actual ?? 0), 0);
      const openTasks = taskRows.filter(t => t.status !== "done" && t.status !== "completed").length;
      const overdueTasks = taskRows.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done").length;
      const completedMilestones = milestoneRows.filter(m => m.status === "completed").length;
      const highRisks = riskRows.filter(r => r.impact === "high" || r.likelihood === "high").length;

      return {
        totalTasks: taskRows.length,
        openTasks,
        overdueTasks,
        completedMilestones,
        totalMilestones: milestoneRows.length,
        teamSize: teamRows.length,
        highRisks,
        totalBudgeted,
        totalActual,
        budgetVariance: totalBudgeted - totalActual,
        recentTasks: taskRows.slice(0, 5),
        upcomingMilestones: milestoneRows.filter(m => m.status !== "completed").slice(0, 5),
      };
    }),

  // ─── Milestones / Timeline ─────────────────────────────────────────────────
  getMilestones: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      return db.select().from(projectMilestones)
        .where(eq(projectMilestones.projectId, input.projectId))
        .orderBy(projectMilestones.dueDate);
    }),

  createMilestone: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      title: z.string().min(1).max(256),
      description: z.string().optional(),
      dueDate: z.string().optional(),
      owner: z.string().optional(),
      phase: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const [row] = await db.insert(projectMilestones).values({
        projectId: input.projectId,
        title: input.title,
        description: input.description ?? "",
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        owner: input.owner ?? "",
        phase: input.phase ?? "",
        status: "pending",
      }).returning();
      return row;
    }),

  updateMilestone: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      status: z.string().optional(),
      completedAt: z.string().optional(),
      dueDate: z.string().optional(),
      owner: z.string().optional(),
      phase: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      const setData: Record<string, unknown> = { updatedAt: new Date() };
      if (updates.title) setData.title = updates.title;
      if (updates.status) setData.status = updates.status;
      if (updates.owner !== undefined) setData.owner = updates.owner;
      if (updates.phase !== undefined) setData.phase = updates.phase;
      if (updates.dueDate) setData.dueDate = new Date(updates.dueDate);
      if (updates.completedAt) setData.completedAt = new Date(updates.completedAt);
      if (updates.status === "completed" && !updates.completedAt) setData.completedAt = new Date();
      const [row] = await db.update(projectMilestones).set(setData).where(eq(projectMilestones.id, id)).returning();
      return row;
    }),

  deleteMilestone: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(projectMilestones).where(eq(projectMilestones.id, input.id));
      return { success: true };
    }),

  // ─── Team Members ──────────────────────────────────────────────────────────
  getTeam: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      return db.select().from(projectTeamMembers)
        .where(eq(projectTeamMembers.projectId, input.projectId))
        .orderBy(projectTeamMembers.name);
    }),

  addTeamMember: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      name: z.string().min(1).max(128),
      role: z.string().min(1).max(128),
      email: z.string().optional(),
      department: z.string().optional(),
      isExternal: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const [row] = await db.insert(projectTeamMembers).values({
        projectId: input.projectId,
        name: input.name,
        role: input.role,
        email: input.email ?? "",
        department: input.department ?? "",
        isExternal: input.isExternal ?? false,
        status: "active",
      }).returning();
      return row;
    }),

  removeTeamMember: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(projectTeamMembers).where(eq(projectTeamMembers.id, input.id));
      return { success: true };
    }),

  // ─── Finance ───────────────────────────────────────────────────────────────
  getFinance: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      const rows = await db.select().from(projectFinance)
        .where(eq(projectFinance.projectId, input.projectId))
        .orderBy(projectFinance.category, projectFinance.lineItem);
      const byCategory: Record<string, typeof rows> = {};
      for (const row of rows) {
        if (!byCategory[row.category]) byCategory[row.category] = [];
        byCategory[row.category].push(row);
      }
      const totalBudgeted = rows.reduce((s, r) => s + (r.budgeted ?? 0), 0);
      const totalActual = rows.reduce((s, r) => s + (r.actual ?? 0), 0);
      const totalForecast = rows.reduce((s, r) => s + (r.forecast ?? 0), 0);
      return { rows, byCategory, totalBudgeted, totalActual, totalForecast };
    }),

  upsertFinanceLine: protectedProcedure
    .input(z.object({
      id: z.number().optional(),
      projectId: z.number(),
      category: z.string().min(1).max(64),
      lineItem: z.string().min(1).max(256),
      budgeted: z.number().optional(),
      actual: z.number().optional(),
      forecast: z.number().optional(),
      currency: z.string().optional(),
      period: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      if (input.id) {
        const { id, projectId: _pid, ...updates } = input;
        const [row] = await db.update(projectFinance)
          .set({ ...updates, updatedAt: new Date() })
          .where(eq(projectFinance.id, id))
          .returning();
        return row;
      }
      const [row] = await db.insert(projectFinance).values({
        projectId: input.projectId,
        category: input.category,
        lineItem: input.lineItem,
        budgeted: input.budgeted ?? 0,
        actual: input.actual ?? 0,
        forecast: input.forecast ?? 0,
        currency: input.currency ?? "BRL",
        period: input.period ?? "",
        notes: input.notes ?? "",
      }).returning();
      return row;
    }),

  deleteFinanceLine: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(projectFinance).where(eq(projectFinance.id, input.id));
      return { success: true };
    }),

  // ─── Risks ─────────────────────────────────────────────────────────────────
  getRisks: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      return db.select().from(projectRisks)
        .where(eq(projectRisks.projectId, input.projectId))
        .orderBy(desc(projectRisks.createdAt));
    }),

  upsertRisk: protectedProcedure
    .input(z.object({
      id: z.number().optional(),
      projectId: z.number(),
      title: z.string().min(1).max(256),
      description: z.string().optional(),
      likelihood: z.enum(["low", "medium", "high"]).optional(),
      impact: z.enum(["low", "medium", "high"]).optional(),
      status: z.string().optional(),
      owner: z.string().optional(),
      mitigation: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      if (input.id) {
        const { id, projectId: _pid, ...updates } = input;
        const [row] = await db.update(projectRisks)
          .set({ ...updates, updatedAt: new Date() })
          .where(eq(projectRisks.id, id))
          .returning();
        return row;
      }
      const [row] = await db.insert(projectRisks).values({
        projectId: input.projectId,
        title: input.title,
        description: input.description ?? "",
        likelihood: input.likelihood ?? "medium",
        impact: input.impact ?? "medium",
        status: input.status ?? "open",
        owner: input.owner ?? "",
        mitigation: input.mitigation ?? "",
      }).returning();
      return row;
    }),

  deleteRisk: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(projectRisks).where(eq(projectRisks.id, input.id));
      return { success: true };
    }),

  // ─── Comms ─────────────────────────────────────────────────────────────────
  getComms: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      return db.select().from(projectComms)
        .where(eq(projectComms.projectId, input.projectId))
        .orderBy(desc(projectComms.createdAt));
    }),

  createComm: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      type: z.string().optional(),
      subject: z.string().min(1).max(256),
      body: z.string().optional(),
      from: z.string().optional(),
      to: z.string().optional(),
      status: z.string().optional(),
      dueDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const [row] = await db.insert(projectComms).values({
        projectId: input.projectId,
        type: input.type ?? "note",
        subject: input.subject,
        body: input.body ?? "",
        from: input.from ?? "",
        to: input.to ?? "",
        status: input.status ?? "open",
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
      }).returning();
      return row;
    }),

  updateCommStatus: protectedProcedure
    .input(z.object({ id: z.number(), status: z.string() }))
    .mutation(async ({ input }) => {
      const [row] = await db.update(projectComms)
        .set({ status: input.status, updatedAt: new Date() })
        .where(eq(projectComms.id, input.id))
        .returning();
      return row;
    }),

  // ─── Automation ────────────────────────────────────────────────────────────
  getAutomation: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      return db.select().from(projectAutomation)
        .where(eq(projectAutomation.projectId, input.projectId))
        .orderBy(desc(projectAutomation.createdAt));
    }),

  upsertAutomation: protectedProcedure
    .input(z.object({
      id: z.number().optional(),
      projectId: z.number(),
      title: z.string().min(1).max(256),
      description: z.string().optional(),
      area: z.string().optional(),
      estimatedSaving: z.string().optional(),
      complexity: z.enum(["low", "medium", "high"]).optional(),
      status: z.string().optional(),
      priority: z.enum(["low", "medium", "high", "critical"]).optional(),
    }))
    .mutation(async ({ input }) => {
      if (input.id) {
        const { id, projectId: _pid, ...updates } = input;
        const [row] = await db.update(projectAutomation)
          .set({ ...updates, updatedAt: new Date() })
          .where(eq(projectAutomation.id, id))
          .returning();
        return row;
      }
      const [row] = await db.insert(projectAutomation).values({
        projectId: input.projectId,
        title: input.title,
        description: input.description ?? "",
        area: input.area ?? "operations",
        estimatedSaving: input.estimatedSaving ?? "",
        complexity: input.complexity ?? "medium",
        status: input.status ?? "idea",
        priority: input.priority ?? "medium",
      }).returning();
      return row;
    }),

  deleteAutomation: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(projectAutomation).where(eq(projectAutomation.id, input.id));
      return { success: true };
    }),

  // ─── All Tasks for project (all assignees) ─────────────────────────────────
  getAllTasks: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      status: z.string().optional(),
      assignee: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const rows = await db.select().from(tasks)
        .where(eq(tasks.projectId, input.projectId))
        .orderBy(tasks.dueDate, desc(tasks.createdAt));
      return rows
        .filter(t => !input.status || t.status === input.status)
        .filter(t => !input.assignee || t.assignee === input.assignee);
    }),
});
