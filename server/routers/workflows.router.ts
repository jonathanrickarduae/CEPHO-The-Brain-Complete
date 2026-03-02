/**
 * Workflows Router — Database-Persisted Implementation
 *
 * P1-BUG-03: Replaced in-memory workflowCache (Map) with database persistence.
 * Step form data is now stored in projectGenesisPhases.metadata so it survives
 * server restarts. Progress (currentStep) is stored in projectGenesis.metadata.
 *
 * Manages multi-step wizard workflows for Project Genesis.
 * Persists step progress, form data, and generates deliverables via OpenAI.
 */
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import OpenAI from "openai";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { projectGenesis, projectGenesisPhases } from "../../drizzle/schema";

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  return new OpenAI({ apiKey });
}

export const workflowsRouter = router({
  /**
   * List all workflows (project genesis records) for the current user.
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const rows = await db
      .select()
      .from(projectGenesis)
      .where(eq(projectGenesis.userId, ctx.user.id))
      .orderBy(projectGenesis.createdAt);
    return rows.map(r => {
      const meta = (r.metadata ?? {}) as Record<string, unknown>;
      return {
        id: String(r.id),
        name: r.name,
        skillType: (meta.skillType as string) ?? "custom",
        status: r.status ?? "active",
        currentPhase: (meta.currentPhase as number) ?? 1,
        currentStep: (meta.currentStep as number) ?? 1,
        createdAt: r.createdAt?.toISOString() ?? new Date().toISOString(),
        updatedAt: r.updatedAt?.toISOString() ?? new Date().toISOString(),
      };
    });
  }),

  /**
   * Get a workflow by ID (maps to a project genesis record).
   * Step form data is read from projectGenesisPhases.metadata (DB-persisted).
   */
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const projectId = parseInt(input.id, 10);
      if (isNaN(projectId)) return null;

      const projectRows = await db
        .select()
        .from(projectGenesis)
        .where(
          and(
            eq(projectGenesis.id, projectId),
            eq(projectGenesis.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (projectRows.length === 0) return null;
      const project = projectRows[0];

      const phases = await db
        .select()
        .from(projectGenesisPhases)
        .where(eq(projectGenesisPhases.projectId, projectId))
        .orderBy(projectGenesisPhases.phaseNumber);

      const currentPhase =
        phases.find(p => p.status === "in_progress")?.phaseNumber ?? 1;

      // Read currentStep from project metadata (DB-persisted)
      const projectMeta = (project.metadata ?? {}) as Record<string, unknown>;
      const currentStep = (projectMeta.currentStep as number) ?? 1;

      return {
        id: input.id,
        projectId,
        name: project.name,
        currentPhase,
        currentStep,
        status: project.status,
        steps: phases.map(p => {
          // Read formData from phase metadata (DB-persisted)
          const phaseMeta = (p.metadata ?? {}) as Record<string, unknown>;
          return {
            phaseNumber: p.phaseNumber,
            phaseName: p.phaseName,
            status: p.status,
            formData: (phaseMeta.formData as Record<string, unknown>) ?? null,
            completedAt: p.completedAt?.toISOString() ?? null,
          };
        }),
      };
    }),

  /**
   * Update a step's form data — persisted to projectGenesisPhases.metadata.
   */
  updateStep: protectedProcedure
    .input(
      z.object({
        workflowId: z.string(),
        stepNumber: z.number(),
        formData: z.record(z.string(), z.unknown()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const projectId = parseInt(input.workflowId, 10);
      if (isNaN(projectId)) return { success: false };

      // Verify ownership
      const projectRows = await db
        .select()
        .from(projectGenesis)
        .where(
          and(
            eq(projectGenesis.id, projectId),
            eq(projectGenesis.userId, ctx.user.id)
          )
        )
        .limit(1);
      if (projectRows.length === 0) return { success: false };

      // Find the phase row for this step number
      const phaseRows = await db
        .select()
        .from(projectGenesisPhases)
        .where(
          and(
            eq(projectGenesisPhases.projectId, projectId),
            eq(projectGenesisPhases.phaseNumber, input.stepNumber)
          )
        )
        .limit(1);

      if (phaseRows.length > 0) {
        const existingMeta = (phaseRows[0].metadata ?? {}) as Record<string, unknown>;
        await db
          .update(projectGenesisPhases)
          .set({
            metadata: { ...existingMeta, formData: input.formData },
            updatedAt: new Date(),
          })
          .where(eq(projectGenesisPhases.id, phaseRows[0].id));
      }

      return { success: true };
    }),

  /**
   * Update workflow progress (current phase and step) — persisted to DB.
   */
  updateProgress: protectedProcedure
    .input(
      z.object({
        workflowId: z.string(),
        currentPhase: z.number(),
        currentStep: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const projectId = parseInt(input.workflowId, 10);
      if (isNaN(projectId)) return { success: false };

      const projectRows = await db
        .select()
        .from(projectGenesis)
        .where(
          and(
            eq(projectGenesis.id, projectId),
            eq(projectGenesis.userId, ctx.user.id)
          )
        )
        .limit(1);
      if (projectRows.length === 0) return { success: false };

      const existingMeta = (projectRows[0].metadata ?? {}) as Record<string, unknown>;
      await db
        .update(projectGenesis)
        .set({
          metadata: {
            ...existingMeta,
            currentPhase: input.currentPhase,
            currentStep: input.currentStep,
          },
          updatedAt: new Date(),
        })
        .where(eq(projectGenesis.id, projectId));

      return { success: true };
    }),

  /**
   * Complete a step and advance to the next — persisted to DB.
   */
  completeStep: protectedProcedure
    .input(
      z.object({
        workflowId: z.string(),
        stepNumber: z.number(),
        formData: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const projectId = parseInt(input.workflowId, 10);
      if (isNaN(projectId)) return { success: false, nextStep: 1 };

      const projectRows = await db
        .select()
        .from(projectGenesis)
        .where(
          and(
            eq(projectGenesis.id, projectId),
            eq(projectGenesis.userId, ctx.user.id)
          )
        )
        .limit(1);
      if (projectRows.length === 0) return { success: false, nextStep: 1 };

      // Mark the phase as completed and persist form data
      const phaseRows = await db
        .select()
        .from(projectGenesisPhases)
        .where(
          and(
            eq(projectGenesisPhases.projectId, projectId),
            eq(projectGenesisPhases.phaseNumber, input.stepNumber)
          )
        )
        .limit(1);

      if (phaseRows.length > 0) {
        const existingMeta = (phaseRows[0].metadata ?? {}) as Record<string, unknown>;
        await db
          .update(projectGenesisPhases)
          .set({
            status: "completed",
            completedAt: new Date(),
            metadata: {
              ...existingMeta,
              ...(input.formData ? { formData: input.formData } : {}),
              completedAt: new Date().toISOString(),
            },
            updatedAt: new Date(),
          })
          .where(eq(projectGenesisPhases.id, phaseRows[0].id));
      }

      return { success: true, nextStep: input.stepNumber + 1 };
    }),

  /**
   * Generate a deliverable for a workflow step using OpenAI.
   */
  generateDeliverable: protectedProcedure
    .input(
      z.object({
        workflowId: z.string(),
        deliverableType: z.string(),
        deliverableName: z.string(),
        context: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const openai = getOpenAIClient();

      const prompt = `Generate a professional ${input.deliverableType} deliverable titled "${input.deliverableName}" for a startup project.
${input.context ? `Context: ${JSON.stringify(input.context, null, 2)}` : ""}

Provide a comprehensive, well-structured document in Markdown format suitable for executive review.
Include relevant sections, analysis, and actionable recommendations.
Keep it concise but thorough — maximum 800 words.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1200,
        temperature: 0.7,
      });

      const content =
        completion.choices[0]?.message?.content ??
        `# ${input.deliverableName}\n\nDeliverable generation failed. Please try again.`;

      return {
        deliverableName: input.deliverableName,
        deliverableType: input.deliverableType,
        content,
        generatedAt: new Date().toISOString(),
      };
    }),

  /**
   * Start a workflow (set status to in_progress).
   */
  start: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const projectId = parseInt(input.id, 10);
      if (isNaN(projectId)) return { success: false };
      await db
        .update(projectGenesis)
        .set({ status: "in_progress", updatedAt: new Date() })
        .where(
          and(
            eq(projectGenesis.id, projectId),
            eq(projectGenesis.userId, ctx.user.id)
          )
        );
      return { success: true };
    }),

  /**
   * Pause a workflow.
   */
  pause: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const projectId = parseInt(input.id, 10);
      if (isNaN(projectId)) return { success: false };
      await db
        .update(projectGenesis)
        .set({ status: "paused", updatedAt: new Date() })
        .where(
          and(
            eq(projectGenesis.id, projectId),
            eq(projectGenesis.userId, ctx.user.id)
          )
        );
      return { success: true };
    }),

  /**
   * Resume a paused workflow.
   */
  resume: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const projectId = parseInt(input.id, 10);
      if (isNaN(projectId)) return { success: false };
      await db
        .update(projectGenesis)
        .set({ status: "in_progress", updatedAt: new Date() })
        .where(
          and(
            eq(projectGenesis.id, projectId),
            eq(projectGenesis.userId, ctx.user.id)
          )
        );
      return { success: true };
    }),

  /**
   * Get AI guidance for a specific workflow step.
   */
  getStepGuidance: protectedProcedure
    .input(z.object({ workflowId: z.string(), stepNumber: z.number() }))
    .query(async ({ input }) => {
      const openai = getOpenAIClient();
      const prompt = `You are an expert workflow advisor for CEPHO. Provide concise guidance for step ${input.stepNumber} of workflow ${input.workflowId}.

Provide:
1. A brief guidance paragraph (2-3 sentences)
2. Three key recommendations
3. Two expected deliverables

Respond in JSON: { "guidance": string, "recommendations": string[], "deliverables": string[] }`;
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4.1-mini",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 400,
          temperature: 0.5,
          response_format: { type: "json_object" },
        });
        const parsed = JSON.parse(completion.choices[0]?.message?.content ?? "{}");
        return {
          guidance: parsed.guidance ?? "Follow the workflow steps carefully.",
          recommendations: parsed.recommendations ?? [],
          deliverables: parsed.deliverables ?? [],
        };
      } catch {
        return {
          guidance: "Complete this step according to the workflow requirements.",
          recommendations: ["Review requirements", "Gather necessary information", "Document your progress"],
          deliverables: ["Completed step documentation", "Progress report"],
        };
      }
    }),
});
