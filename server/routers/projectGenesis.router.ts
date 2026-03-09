import { getModelForTask } from "../utils/modelRouter";
/**
 * Project Genesis Router — Real Implementation
 *
 * Manages the 6-phase project genesis pipeline: discovery → validation →
 * business model → go-to-market → financial → launch.
 */
import { z } from "zod";
import { desc, eq, and, inArray } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { createNotification } from "./notifications.router";
import { db } from "../db";
import { projectGenesis, projectGenesisPhases } from "../../drizzle/schema";
import OpenAI from "openai";

let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

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
            .where(inArray(projectGenesisPhases.projectId, projectIds))
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
      // Auto-assign an AI agent based on industry
      const INDUSTRY_AGENTS: Record<
        string,
        { id: string; name: string; role: string }
      > = {
        Technology: { id: "tech_advisor", name: "Ethan", role: "Tech Advisor" },
        Finance: {
          id: "financial_analyst",
          name: "Leo",
          role: "Financial Analyst",
        },
        Healthcare: {
          id: "research_analyst",
          name: "Aria",
          role: "Research Director",
        },
        Marketing: {
          id: "marketing_strategist",
          name: "Luna",
          role: "Marketing Strategist",
        },
        Legal: {
          id: "legal_advisor",
          name: "Marcus",
          role: "Strategy Advisor",
        },
        Creative: {
          id: "brand_voice_guardian",
          name: "Sophia",
          role: "Innovation Lead",
        },
        Operations: {
          id: "project_manager",
          name: "Victoria",
          role: "Chief of Staff",
        },
      };
      const industry = input.industry ?? "Technology";
      const assignedAgent =
        INDUSTRY_AGENTS[industry] ?? INDUSTRY_AGENTS["Technology"];
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
            industry,
            targetMarket: input.targetMarket ?? "",
            uniqueValue: input.uniqueValue ?? "",
            assignedAgent,
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

      // Notify user that project was created (non-blocking)
      createNotification({
        userId: ctx.user.id,
        type: "genesis",
        title: "Project Created",
        message: `"${project.name}" has been created and is ready for Phase 1: Discovery & Validation.`,
        actionUrl: "/project-genesis",
        actionLabel: "View Project",
      }).catch(() => {});

      return {
        id: project.id,
        name: project.name,
        status: project.status,
        createdAt: project.createdAt.toISOString(),
        assignedAgent,
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

      // Notify on phase completion (non-blocking)
      if (input.status === "completed") {
        const phaseName =
          GENESIS_PHASES.find(p => p.id === input.phaseNumber)?.name ??
          `Phase ${input.phaseNumber}`;
        createNotification({
          userId: ctx.user.id,
          type: "genesis",
          title: "Phase Completed",
          message: `${phaseName} has been completed for project "${projects[0].name}".`,
          actionUrl: "/project-genesis",
          actionLabel: "View Project",
        }).catch(() => {});
      }

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

  /**
   * Generate AI-powered presentation slide content for a genesis project.
   */
  generatePresentationSlides: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        slideTypes: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify project belongs to user
      const rows = await db
        .select()
        .from(projectGenesis)
        .where(
          and(
            eq(projectGenesis.id, input.projectId),
            eq(projectGenesis.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (rows.length === 0) throw new Error("Project not found");
      const project = rows[0];
      const meta = project.metadata as Record<string, string> | null;

      const prompt = `You are a startup pitch deck expert. Generate concise, compelling slide content for a ${project.type} project.

Project: ${project.name}
Description: ${project.description ?? "Not provided"}
Industry: ${meta?.industry ?? "General"}
Target Market: ${meta?.targetMarket ?? "Not specified"}
Unique Value: ${meta?.uniqueValue ?? "Not specified"}

Generate content for these slides: ${input.slideTypes.join(", ")}

Return a JSON object where each key is a slide type and the value is an object with:
- content: the main slide text (2-4 sentences)
- aiSuggestions: array of 3 brief improvement tips

Return ONLY valid JSON, no markdown.`;

      const response = await getOpenAI().chat.completions.create({
        model: getModelForTask("generate"),
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 1500,
      });

      const raw = response.choices[0]?.message?.content ?? "{}";
      let slides: Record<string, { content: string; aiSuggestions: string[] }> =
        {};
      try {
        slides = JSON.parse(raw);
      } catch {
        slides = {};
      }

      return { slides };
    }),

  /**
   * Toggle a single quality gate check on/off for a phase.
   * Stores completedChecks in the phase's metadata JSON column.
   */
  toggleQualityCheck: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        phaseNumber: z.number().min(1).max(6),
        checkLabel: z.string(),
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
      if (projects.length === 0) throw new Error("Project not found");

      // Get current phase row
      const phases = await db
        .select()
        .from(projectGenesisPhases)
        .where(
          and(
            eq(projectGenesisPhases.projectId, input.projectId),
            eq(projectGenesisPhases.phaseNumber, input.phaseNumber)
          )
        )
        .limit(1);
      if (phases.length === 0) throw new Error("Phase not found");

      const phase = phases[0];
      const meta = (phase.metadata as Record<string, unknown>) ?? {};
      const completedChecks: string[] = Array.isArray(meta.completedChecks)
        ? (meta.completedChecks as string[])
        : [];

      // Toggle: add if not present, remove if present
      const idx = completedChecks.indexOf(input.checkLabel);
      if (idx === -1) {
        completedChecks.push(input.checkLabel);
      } else {
        completedChecks.splice(idx, 1);
      }

      await db
        .update(projectGenesisPhases)
        .set({
          metadata: { ...meta, completedChecks },
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(projectGenesisPhases.projectId, input.projectId),
            eq(projectGenesisPhases.phaseNumber, input.phaseNumber)
          )
        );

      return { completedChecks };
    }),

  /**
   * Get all phases with completedChecks for a project (for the ValueChainProgress component).
   */
  getProjectPhases: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
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
      if (projects.length === 0) throw new Error("Project not found");

      const phases = await db
        .select()
        .from(projectGenesisPhases)
        .where(eq(projectGenesisPhases.projectId, input.projectId))
        .orderBy(projectGenesisPhases.phaseNumber);

      return phases.map(ph => ({
        phaseNumber: ph.phaseNumber,
        status: ph.status,
        completedChecks: Array.isArray(
          (ph.metadata as Record<string, unknown> | null)?.completedChecks
        )
          ? ((ph.metadata as Record<string, unknown>)
              .completedChecks as string[])
          : [],
        startedAt: ph.startedAt?.toISOString() ?? null,
        completedAt: ph.completedAt?.toISOString() ?? null,
      }));
    }),
});
