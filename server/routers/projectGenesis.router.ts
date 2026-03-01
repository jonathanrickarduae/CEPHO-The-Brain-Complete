/**
 * Project Genesis Router — Real Implementation
 *
 * Manages the 6-phase project genesis pipeline: discovery → validation →
 * business model → go-to-market → financial → launch.
 */
import { z } from "zod";
import { desc, eq, and, inArray } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { projectGenesis, projectGenesisPhases } from "../../drizzle/schema";

const GENESIS_PHASES = [
  { id: 1, name: "Discovery & Validation" },
  { id: 2, name: "Business Model Design" },
  { id: 3, name: "Go-to-Market Strategy" },
  { id: 4, name: "Financial Projections" },
  { id: 5, name: "Team & Operations" },
  { id: 6, name: "Launch Preparation" },
];

export const projectGenesisRouter = router({
  /**
   * List all genesis projects for the current user.
   */
  listProjects: protectedProcedure.query(async ({ ctx }) => {
    const projects = await db
      .select()
      .from(projectGenesis)
      .where(eq(projectGenesis.userId, ctx.user.id))
      .orderBy(desc(projectGenesis.createdAt));

    // Get phases for each project
    const projectIds = projects.map(p => p.id);
    const allPhases =
      projectIds.length > 0
        ? await db
            .select()
            .from(projectGenesisPhases)
            .where(
              inArray(projectGenesisPhases.projectId, projectIds)
            )
        : [];

    return projects.map(p => {
      const phases = allPhases.filter(ph => ph.projectId === p.id);
      const completedPhases = phases.filter(
        ph => ph.status === "completed"
      ).length;
      const currentPhase =
        phases.find(ph => ph.status === "in_progress")?.phaseNumber ?? 1;
      const completionPercentage =
        phases.length > 0
          ? Math.round((completedPhases / GENESIS_PHASES.length) * 100)
          : 0;

      return {
        id: p.id,
        name: p.name,
        type: p.type,
        stage: p.stage,
        status: p.status,
        industry:
          (p.metadata as Record<string, string> | null)?.industry ?? "General",
        description: p.description,
        currentPhase,
        completionPercentage,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      };
    });
  }),

  /**
   * Get a single genesis project with all phases.
   */
  getProject: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const rows = await db
        .select()
        .from(projectGenesis)
        .where(
          and(
            eq(projectGenesis.id, input.id),
            eq(projectGenesis.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (rows.length === 0) return null;
      const p = rows[0];

      const phases = await db
        .select()
        .from(projectGenesisPhases)
        .where(eq(projectGenesisPhases.projectId, p.id))
        .orderBy(projectGenesisPhases.phaseNumber);

      return {
        id: p.id,
        name: p.name,
        type: p.type,
        stage: p.stage,
        status: p.status,
        description: p.description,
        notes: p.notes,
        metadata: p.metadata,
        phases: phases.map(ph => ({
          id: ph.id,
          phaseNumber: ph.phaseNumber,
          phaseName: ph.phaseName,
          status: ph.status,
          startedAt: ph.startedAt?.toISOString() ?? null,
          completedAt: ph.completedAt?.toISOString() ?? null,
          deliverables: ph.deliverables,
          notes: ph.notes,
        })),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      };
    }),

  /**
   * Initiate a new genesis project with all 6 phases.
   */
  initiate: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(300),
        industry: z.string().optional(),
        description: z.string().optional(),
        targetMarket: z.string().optional(),
        uniqueValue: z.string().optional(),
        type: z.string().default("startup"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Create the project
      const [project] = await db
        .insert(projectGenesis)
        .values({
          userId: ctx.user.id,
          name: input.name,
          type: input.type,
          stage: "discovery",
          status: "active",
          description: input.description ?? null,
          metadata: {
            industry: input.industry ?? "General",
            targetMarket: input.targetMarket ?? "",
            uniqueValue: input.uniqueValue ?? "",
          },
        })
        .returning();

      // Create all 6 phases
      await db.insert(projectGenesisPhases).values(
        GENESIS_PHASES.map(phase => ({
          projectId: project.id,
          phaseNumber: phase.id,
          phaseName: phase.name,
          status: phase.id === 1 ? "in_progress" : "not_started",
          startedAt: phase.id === 1 ? new Date() : null,
        }))
      );

      return {
        id: project.id,
        name: project.name,
        status: project.status,
        createdAt: project.createdAt.toISOString(),
      };
    }),

  /**
   * Update the status of a phase.
   */
  updatePhase: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        phaseNumber: z.number().min(1).max(6),
        status: z.enum(["not_started", "in_progress", "completed", "blocked"]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify project belongs to user
      const projects = await db
        .select()
        .from(projectGenesis)
        .where(
          and(
            eq(projectGenesis.id, input.projectId),
            eq(projectGenesis.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (projects.length === 0) {
        throw new Error("Project not found");
      }

      await db
        .update(projectGenesisPhases)
        .set({
          status: input.status,
          notes: input.notes ?? null,
          completedAt: input.status === "completed" ? new Date() : null,
          startedAt: input.status === "in_progress" ? new Date() : undefined,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(projectGenesisPhases.projectId, input.projectId),
            eq(projectGenesisPhases.phaseNumber, input.phaseNumber)
          )
        );

      // If phase completed, advance to next phase
      if (input.status === "completed" && input.phaseNumber < 6) {
        await db
          .update(projectGenesisPhases)
          .set({ status: "in_progress", startedAt: new Date() })
          .where(
            and(
              eq(projectGenesisPhases.projectId, input.projectId),
              eq(projectGenesisPhases.phaseNumber, input.phaseNumber + 1)
            )
          );

        // Update project stage
        const stageMap: Record<number, string> = {
          1: "business_model",
          2: "go_to_market",
          3: "financial",
          4: "team",
          5: "launch",
          6: "launched",
        };
        await db
          .update(projectGenesis)
          .set({
            stage: stageMap[input.phaseNumber] ?? "discovery",
            updatedAt: new Date(),
          })
          .where(eq(projectGenesis.id, input.projectId));
      }

      return { success: true };
    }),

  /**
   * Delete a genesis project.
   */
  deleteProject: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await db
        .delete(projectGenesis)
        .where(
          and(
            eq(projectGenesis.id, input.id),
            eq(projectGenesis.userId, ctx.user.id)
          )
        );

      return { success: true };
    }),
});
