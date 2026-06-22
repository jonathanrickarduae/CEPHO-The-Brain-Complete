/**
 * Projects Router — Real Implementation
 *
 * Handles CRUD for projects plus auto-seeding the 6 default CEPHO portals
 * (Celadon, Celanova, Perfect, Olmack, Boundless, Personal) on first login.
 */
import { z } from "zod";
import { desc, eq, and } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { projects, activityFeed } from "../../drizzle/schema";
import { cache } from "../services/cache";

/** The 6 default CEPHO project portals */
const DEFAULT_PROJECTS = [
  {
    slug: "celadon",
    name: "Celadon Capital",
    description: "Investment management and capital allocation operations",
    accentColor: "#10B981",
    initials: "CC",
    overview: "Celadon Capital manages investment portfolios, capital deployment, and financial operations. This portal tracks all workstreams, team tasks, financial performance, and strategic initiatives.",
    status: "green" as const,
    priority: "high",
  },
  {
    slug: "celanova",
    name: "Celanova",
    description: "Pharmaceutical and healthcare innovation platform",
    accentColor: "#8B5CF6",
    initials: "CN",
    overview: "Celanova drives pharmaceutical innovation and healthcare product development. This portal manages R&D pipelines, regulatory milestones, team coordination, and go-to-market strategy.",
    status: "green" as const,
    priority: "high",
  },
  {
    slug: "perfect",
    name: "Perfect",
    description: "Consumer brand and product excellence",
    accentColor: "#F59E0B",
    initials: "PF",
    overview: "Perfect focuses on consumer product development, brand building, and market expansion. This portal tracks product launches, marketing campaigns, sales performance, and operational efficiency.",
    status: "green" as const,
    priority: "medium",
  },
  {
    slug: "olmack",
    name: "Olmack",
    description: "Technology and digital transformation",
    accentColor: "#3B82F6",
    initials: "OM",
    overview: "Olmack leads technology development and digital transformation initiatives. This portal manages engineering sprints, product roadmaps, technical debt, and innovation pipelines.",
    status: "green" as const,
    priority: "medium",
  },
  {
    slug: "boundless",
    name: "Boundless",
    description: "AI and emerging technology ventures",
    accentColor: "#EC4899",
    initials: "BL",
    overview: "Boundless explores AI-powered products and emerging technology opportunities. This portal tracks venture development, partnership negotiations, and technology scouting.",
    status: "amber" as const,
    priority: "medium",
  },
  {
    slug: "personal",
    name: "Personal",
    description: "Personal goals, learning, and development",
    accentColor: "#06B6D4",
    initials: "JR",
    overview: "Personal development, learning objectives, health goals, and life management. This portal tracks personal OKRs, learning milestones, and key life projects.",
    status: "green" as const,
    priority: "low",
  },
];

/** Invalidate all project list caches for a user */
async function invalidateProjectsCache(userId: number) {
  await cache.delPattern(`projects:${userId}:*`).catch(() => {});
}

export const projectsRouter = router({
  /**
   * List all projects for the current user.
   * Auto-seeds the 6 default portals if none exist yet.
   */
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
          // Auto-seed default projects if user has none
          const existing = await db
            .select({ id: projects.id })
            .from(projects)
            .where(eq(projects.userId, ctx.user.id))
            .limit(1);

          if (existing.length === 0) {
            await db.insert(projects).values(
              DEFAULT_PROJECTS.map(p => ({
                ...p,
                userId: ctx.user.id,
                progress: 0,
              }))
            );
          }

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
              slug: p.slug,
              name: p.name,
              description: p.description,
              status: p.status,
              priority: p.priority,
              progress: p.progress,
              accentColor: p.accentColor,
              initials: p.initials,
              dueDate: p.dueDate?.toISOString() ?? null,
              createdAt: p.createdAt.toISOString(),
            }));
        },
        60
      );
    }),

  /**
   * Get a single project by numeric ID.
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
        slug: p.slug,
        name: p.name,
        description: p.description,
        status: p.status,
        priority: p.priority,
        progress: p.progress,
        accentColor: p.accentColor,
        initials: p.initials,
        overview: p.overview,
        dueDate: p.dueDate?.toISOString() ?? null,
        createdAt: p.createdAt.toISOString(),
      };
    }),

  /**
   * Get a single project by slug (e.g. "celadon").
   */
  getBySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input, ctx }) => {
      const rows = await db
        .select()
        .from(projects)
        .where(and(eq(projects.slug, input.slug), eq(projects.userId, ctx.user.id)))
        .limit(1);
      if (rows.length === 0) return null;
      const p = rows[0];
      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        description: p.description,
        status: p.status,
        priority: p.priority,
        progress: p.progress,
        accentColor: p.accentColor,
        initials: p.initials,
        overview: p.overview,
        dueDate: p.dueDate?.toISOString() ?? null,
        createdAt: p.createdAt.toISOString(),
      };
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(200),
        description: z.string().optional(),
        status: z.string().default("green"),
        priority: z.string().default("medium"),
        dueDate: z.string().optional(),
        accentColor: z.string().optional(),
        initials: z.string().max(4).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const slug = input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 64);

      const [project] = await db
        .insert(projects)
        .values({
          userId: ctx.user.id,
          slug,
          name: input.name,
          description: input.description ?? null,
          status: (input.status as "green" | "amber" | "red") ?? "green",
          priority: input.priority,
          progress: 0,
          accentColor: input.accentColor ?? "#00D4FF",
          initials: input.initials ?? input.name.slice(0, 2).toUpperCase(),
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

      invalidateProjectsCache(ctx.user.id);
      return {
        id: project.id,
        slug: project.slug,
        name: project.name,
        status: project.status,
      };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        status: z.string().optional(),
        progress: z.number().min(0).max(100).optional(),
        overview: z.string().optional(),
        accentColor: z.string().optional(),
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
      invalidateProjectsCache(ctx.user.id);
      return { id: updated.id, status: updated.status };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await db
        .delete(projects)
        .where(
          and(eq(projects.id, input.id), eq(projects.userId, ctx.user.id))
        );
      invalidateProjectsCache(ctx.user.id);
      return { success: true, id: input.id };
    }),
});
