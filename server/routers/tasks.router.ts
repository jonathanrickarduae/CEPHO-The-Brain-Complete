/**
 * Tasks Router — Real Implementation
 *
 * Full CRUD for tasks with status management.
 */
import { z } from "zod";
import { desc, eq, and, asc, count } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { tasks, activityFeed } from "../../drizzle/schema";
import { createNotification } from "./notifications.router";

export const tasksRouter = router({
  /**
   * List tasks for the current user.
   */
  list: protectedProcedure
    .input(
      z.object({
        status: z
          .enum(["not_started", "in_progress", "completed", "blocked"])
          .optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const conditions = [eq(tasks.userId, ctx.user.id)];
      if (input.status) {
        conditions.push(eq(tasks.status, input.status));
      }

      const [totalResult, rows] = await Promise.all([
        db
          .select({ total: count() })
          .from(tasks)
          .where(and(...conditions))
          .then(r => r[0]?.total ?? 0),
        db
          .select()
          .from(tasks)
          .where(and(...conditions))
          .orderBy(asc(tasks.dueDate), desc(tasks.createdAt))
          .limit(input.limit)
          .offset(input.offset),
      ]);

      return {
        tasks: rows.map(t => ({
          id: t.id,
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          progress: t.progress,
          dueDate: t.dueDate?.toISOString() ?? null,
          assignedTo: t.assignedTo,
          createdAt: t.createdAt.toISOString(),
        })),
        total: totalResult,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  /**
   * Create a new task.
   */
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(500),
        description: z.string().optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        dueDate: z.string().optional(),
        projectId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [task] = await db
        .insert(tasks)
        .values({
          userId: ctx.user.id,
          title: input.title,
          description: input.description ?? null,
          priority: input.priority ?? "medium",
          status: "not_started",
          progress: 0,
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
          projectId: input.projectId ?? null,
        })
        .returning();

      // Log to activity feed
      await db.insert(activityFeed).values({
        userId: ctx.user.id,
        actorType: "user",
        actorName: ctx.user.name,
        action: "created",
        targetType: "task",
        targetId: task.id,
        targetName: task.title,
        description: `Created task: ${task.title}`,
      });

      return { id: task.id, title: task.title, status: task.status };
    }),

  /**
   * Update task status or progress.
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z
          .enum(["not_started", "in_progress", "completed", "blocked"])
          .optional(),
        progress: z.number().min(0).max(100).optional(),
        title: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...updates } = input;

      const [updated] = await db
        .update(tasks)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(and(eq(tasks.id, id), eq(tasks.userId, ctx.user.id)))
        .returning();

      if (!updated) {
        throw new Error("Task not found or access denied");
      }

      // Notify on task completion (non-blocking)
      if (input.status === "completed") {
        createNotification({
          userId: ctx.user.id,
          type: "task",
          title: "Task Completed",
          message: `"${updated.title}" has been marked as completed.`,
          actionUrl: "/tasks",
          actionLabel: "View Tasks",
        }).catch(() => {});
      }

      return {
        id: updated.id,
        status: updated.status,
        progress: updated.progress,
      };
    }),

  /**
   * Get a single task by ID.
   */
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const rows = await db
        .select()
        .from(tasks)
        .where(and(eq(tasks.id, input.id), eq(tasks.userId, ctx.user.id)))
        .limit(1);
      if (rows.length === 0) return null;
      const t = rows[0];
      return {
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        progress: t.progress,
        dueDate: t.dueDate?.toISOString() ?? null,
        assignedTo: t.assignedTo,
        createdAt: t.createdAt.toISOString(),
      };
    }),

  /**
   * Delete a task.
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await db
        .delete(tasks)
        .where(and(eq(tasks.id, input.id), eq(tasks.userId, ctx.user.id)));
      return { success: true, id: input.id };
    }),
});
