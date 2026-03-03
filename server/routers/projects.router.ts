/**
 * Projects Router — Real Implementation
 */
import { z } from "zod";
import { desc, eq, and } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { projects, activityFeed } from "../../drizzle/schema";
import { cache } from "../services/cache";

/** Invalidate all project list caches for a user */
async function invalidateProjectsCache(userId: number) {
  await cache.delPattern(`projects:${userId}:*`).catch(() => {});
}

export const projectsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        status: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ input, ctx }) => {
      const cacheKey = `projects:${ctx.user.id}:${input.status ?? "all"}:${input.limit}`;
      return cache.wrap(
        cacheKey,
        async () => {
          const rows = await db
            .select()
            .from(projects)
            .where(eq(projects.userId, ctx.user.id))
            .orderBy(desc(projects.createdAt))
            .limit(input.limit);

          return rows
            .filter(p => !input.status || p.status === input.status)
            .map(p => ({
              id: p.id,
              name: p.name,
              description: p.description,
              status: p.status,
              priority: p.priority,
              progress: p.progress,
              dueDate: p.dueDate?.toISOString() ?? null,
              createdAt: p.createdAt.toISOString(),
            }));
        },
        60 // 60-second TTL
      );
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(200),
        description: z.string().optional(),
        status: z.string().default("active"),
        priority: z.string().default("medium"),
        dueDate: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [project] = await db
        .insert(projects)
        .values({
          userId: ctx.user.id,
          name: input.name,
          description: input.description ?? null,
          status: input.status,
          priority: input.priority,
          progress: 0,
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
        })
        .returning();

      await db.insert(activityFeed).values({
        userId: ctx.user.id,
        actorType: "user",
        actorName: ctx.user.name,
        action: "created",
        targetType: "project",
        targetId: project.id,
        targetName: project.name,
        description: `Created project: ${project.name}`,
      });

      // Invalidate cache
      invalidateProjectsCache(ctx.user.id);

      return { id: project.id, name: project.name, status: project.status };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        status: z.string().optional(),
        progress: z.number().min(0).max(100).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...updates } = input;
      const [updated] = await db
        .update(projects)
        .set({ ...updates, updatedAt: new Date() })
        .where(and(eq(projects.id, id), eq(projects.userId, ctx.user.id)))
        .returning();

      if (!updated) throw new Error("Project not found or access denied");

      // Invalidate cache
      invalidateProjectsCache(ctx.user.id);

      return { id: updated.id, status: updated.status };
    }),

  /**
   * Get a single project by ID.
   */
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const rows = await db
        .select()
        .from(projects)
        .where(and(eq(projects.id, input.id), eq(projects.userId, ctx.user.id)))
        .limit(1);
      if (rows.length === 0) return null;
      const p = rows[0];
      return {
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        priority: p.priority,
        progress: p.progress,
        dueDate: p.dueDate?.toISOString() ?? null,
        createdAt: p.createdAt.toISOString(),
      };
    }),

  /**
   * Delete a project.
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await db
        .delete(projects)
        .where(
          and(eq(projects.id, input.id), eq(projects.userId, ctx.user.id))
        );

      // Invalidate cache
      invalidateProjectsCache(ctx.user.id);

      return { success: true, id: input.id };
    }),
});
