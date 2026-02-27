/**
 * Workflows Router — Real Implementation
 *
 * Manages multi-step wizard workflows for Project Genesis.
 * Persists step progress, form data, and generates deliverables via OpenAI.
 */
import { z } from "zod";
import { eq } from "drizzle-orm";
import OpenAI from "openai";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { projectGenesis, projectGenesisPhases } from "../../drizzle/schema";

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  return new OpenAI({ apiKey });
}

// In-memory workflow state (backed by projectGenesis metadata)
// In production this would be a dedicated workflows table
const workflowCache = new Map<string, Record<string, unknown>>();

export const workflowsRouter = router({
  /**
   * Get a workflow by ID (maps to a project genesis record).
   */
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      // Try to parse as numeric project ID
      const projectId = parseInt(input.id, 10);
      if (isNaN(projectId)) return null;

      const projects = await db
        .select()
        .from(projectGenesis)
        .where(eq(projectGenesis.id, projectId))
        .limit(1);

      if (projects.length === 0) return null;
      const project = projects[0];

      const phases = await db
        .select()
        .from(projectGenesisPhases)
        .where(eq(projectGenesisPhases.projectId, projectId))
        .orderBy(projectGenesisPhases.phaseNumber);

      const currentPhase =
        phases.find(p => p.status === "in_progress")?.phaseNumber ?? 1;

      // Get cached step data
      const cached = workflowCache.get(input.id) ?? {};

      return {
        id: input.id,
        projectId,
        name: project.name,
        currentPhase,
        currentStep: (cached.currentStep as number) ?? 1,
        status: project.status,
        steps: phases.map(p => ({
          phaseNumber: p.phaseNumber,
          phaseName: p.phaseName,
          status: p.status,
          formData:
            (cached[`step_${p.phaseNumber}`] as Record<string, unknown>) ??
            null,
          completedAt: p.completedAt?.toISOString() ?? null,
        })),
      };
    }),

  /**
   * Update a step's form data.
   */
  updateStep: protectedProcedure
    .input(
      z.object({
        workflowId: z.string(),
        stepNumber: z.number(),
        formData: z.record(z.string(), z.unknown()),
      })
    )
    .mutation(async ({ input }) => {
      const cached = workflowCache.get(input.workflowId) ?? {};
      cached[`step_${input.stepNumber}`] = input.formData;
      workflowCache.set(input.workflowId, cached);

      return { success: true };
    }),

  /**
   * Update workflow progress (current phase and step).
   */
  updateProgress: protectedProcedure
    .input(
      z.object({
        workflowId: z.string(),
        currentPhase: z.number(),
        currentStep: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const cached = workflowCache.get(input.workflowId) ?? {};
      cached.currentPhase = input.currentPhase;
      cached.currentStep = input.currentStep;
      workflowCache.set(input.workflowId, cached);

      return { success: true };
    }),

  /**
   * Complete a step and advance to the next.
   */
  completeStep: protectedProcedure
    .input(
      z.object({
        workflowId: z.string(),
        stepNumber: z.number(),
        formData: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const cached = workflowCache.get(input.workflowId) ?? {};
      if (input.formData) {
        cached[`step_${input.stepNumber}`] = input.formData;
      }
      cached[`step_${input.stepNumber}_completed`] = true;
      workflowCache.set(input.workflowId, cached);

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
        model: "gpt-4o-mini",
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
});
