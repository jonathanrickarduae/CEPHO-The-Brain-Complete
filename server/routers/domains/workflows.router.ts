import { z } from "zod";
import { router, protectedProcedure } from "../../_core/trpc.js";
import { db } from "../../db";
import { workflows, workflowSteps } from "../../db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// Import workflow definitions
// Note: These workflows export classes, not constants
// import { PROJECT_GENESIS_WORKFLOW } from "../../workflows/project-genesis-workflow";
// import { QUALITY_GATES_WORKFLOW } from "../../workflows/quality-gates-workflow";
// import { DIGITAL_TWIN_WORKFLOW } from "../../workflows/digital-twin-workflow";
// import { AI_SME_WORKFLOW } from "../../workflows/ai-sme-workflow";
import { generateDeliverable } from "../../services/deliverable-generation.service";

// Workflow definitions will be loaded dynamically
const WORKFLOW_DEFINITIONS: Record<string, any> = {
  // project_genesis: PROJECT_GENESIS_WORKFLOW,
  // quality_gates: QUALITY_GATES_WORKFLOW,
  // digital_twin: DIGITAL_TWIN_WORKFLOW,
  // ai_sme: AI_SME_WORKFLOW,
};

export const workflowsRouter = router({
  // Get all workflows for current user
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(['all', 'not_started', 'in_progress', 'paused', 'completed', 'failed']).optional(),
        type: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      let query = db
        .select()
        .from(workflows)
        .where(eq(workflows.userId, userId))
        .orderBy(desc(workflows.updatedAt));

      const results = await query;

      // Filter by status if provided
      let filtered = results;
      if (input.status && input.status !== 'all') {
        filtered = results.filter(w => w.status === input.status);
      }

      // Filter by type if provided
      if (input.type) {
        filtered = filtered.filter(w => w.type === input.type);
      }

      return filtered;
    }),

  // Get single workflow by ID
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const workflow = await db
        .select()
        .from(workflows)
        .where(and(eq(workflows.id, input.id), eq(workflows.userId, userId)))
        .limit(1);

      if (!workflow || workflow.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workflow not found',
        });
      }

      // Get workflow steps
      const steps = await db
        .select()
        .from(workflowSteps)
        .where(eq(workflowSteps.workflowId, input.id))
        .orderBy(workflowSteps.stepNumber);

      return {
        ...workflow[0],
        steps,
      };
    }),

  // Create new workflow
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        type: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const workflowDef = WORKFLOW_DEFINITIONS[input.type];

      if (!workflowDef) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Unknown workflow type: ${input.type}`,
        });
      }

      // Create workflow
      const [workflow] = await db
        .insert(workflows)
        .values({
          userId,
          name: input.name,
          type: input.type,
          description: input.description || workflowDef.description,
          status: 'not_started',
          currentPhase: 1,
          currentStep: 1,
          totalPhases: workflowDef.phases.length,
          totalSteps: workflowDef.phases.reduce((sum: number, p: any) => sum + p.steps.length, 0),
          progress: 0,
          metadata: {},
        })
        .returning();

      // Create workflow steps
      let stepNumber = 1;
      for (const phase of workflowDef.phases) {
        for (const step of phase.steps) {
          await db.insert(workflowSteps).values({
            workflowId: workflow.id,
            phaseNumber: phase.phaseNumber,
            phaseName: phase.phaseName,
            stepNumber,
            stepName: step.stepName,
            description: step.description,
            status: 'pending',
            formData: {},
            deliverables: step.deliverables || [],
            validations: step.validations || [],
          });
          stepNumber++;
        }
      }

      return workflow;
    }),

  // Update workflow progress
  updateProgress: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        currentPhase: z.number(),
        currentStep: z.number(),
        progress: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const [updated] = await db
        .update(workflows)
        .set({
          currentPhase: input.currentPhase,
          currentStep: input.currentStep,
          progress: input.progress,
          updatedAt: new Date(),
        })
        .where(and(eq(workflows.id, input.id), eq(workflows.userId, userId)))
        .returning();

      if (!updated) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workflow not found',
        });
      }

      return updated;
    }),

  // Update workflow step
  updateStep: protectedProcedure
    .input(
      z.object({
        workflowId: z.string(),
        stepNumber: z.number(),
        formData: z.record(z.any()),
        status: z.enum(['pending', 'in_progress', 'completed', 'skipped']).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify workflow belongs to user
      const workflow = await db
        .select()
        .from(workflows)
        .where(and(eq(workflows.id, input.workflowId), eq(workflows.userId, userId)))
        .limit(1);

      if (!workflow || workflow.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workflow not found',
        });
      }

      // Update step
      const [updated] = await db
        .update(workflowSteps)
        .set({
          formData: input.formData,
          status: input.status || 'in_progress',
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(workflowSteps.workflowId, input.workflowId),
            eq(workflowSteps.stepNumber, input.stepNumber)
          )
        )
        .returning();

      if (!updated) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workflow step not found',
        });
      }

      return updated;
    }),

  // Complete workflow step
  completeStep: protectedProcedure
    .input(
      z.object({
        workflowId: z.string(),
        stepNumber: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify workflow belongs to user
      const workflow = await db
        .select()
        .from(workflows)
        .where(and(eq(workflows.id, input.workflowId), eq(workflows.userId, userId)))
        .limit(1);

      if (!workflow || workflow.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workflow not found',
        });
      }

      // Mark step as completed
      await db
        .update(workflowSteps)
        .set({
          status: 'completed',
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(workflowSteps.workflowId, input.workflowId),
            eq(workflowSteps.stepNumber, input.stepNumber)
          )
        );

      // Calculate progress
      const allSteps = await db
        .select()
        .from(workflowSteps)
        .where(eq(workflowSteps.workflowId, input.workflowId));

      const completedSteps = allSteps.filter(s => s.status === 'completed').length;
      const progress = Math.round((completedSteps / allSteps.length) * 100);

      // Update workflow progress
      await db
        .update(workflows)
        .set({
          progress,
          updatedAt: new Date(),
        })
        .where(eq(workflows.id, input.workflowId));

      return { progress, completedSteps, totalSteps: allSteps.length };
    }),

  // Update workflow status
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(['not_started', 'in_progress', 'paused', 'completed', 'failed']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const [updated] = await db
        .update(workflows)
        .set({
          status: input.status,
          updatedAt: new Date(),
        })
        .where(and(eq(workflows.id, input.id), eq(workflows.userId, userId)))
        .returning();

      if (!updated) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workflow not found',
        });
      }

      return updated;
    }),

  // Delete workflow
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Delete workflow steps first
      await db
        .delete(workflowSteps)
        .where(eq(workflowSteps.workflowId, input.id));

      // Delete workflow
      const deleted = await db
        .delete(workflows)
        .where(and(eq(workflows.id, input.id), eq(workflows.userId, userId)))
        .returning();

      if (!deleted || deleted.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workflow not found',
        });
      }

      return { success: true };
    }),

  // Generate deliverable using AI
  generateDeliverable: protectedProcedure
    .input(
      z.object({
        workflowId: z.string(),
        stepNumber: z.number(),
        deliverableName: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get workflow
      const workflow = await db
        .select()
        .from(workflows)
        .where(and(eq(workflows.id, input.workflowId), eq(workflows.userId, userId)))
        .limit(1);

      if (!workflow || workflow.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workflow not found',
        });
      }

      // Get step
      const step = await db
        .select()
        .from(workflowSteps)
        .where(
          and(
            eq(workflowSteps.workflowId, input.workflowId),
            eq(workflowSteps.stepNumber, input.stepNumber)
          )
        )
        .limit(1);

      if (!step || step.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workflow step not found',
        });
      }

      // Get all previous steps for context
      const previousSteps = await db
        .select()
        .from(workflowSteps)
        .where(
          and(
            eq(workflowSteps.workflowId, input.workflowId),
            // @ts-ignore
            sql`${workflowSteps.stepNumber} < ${input.stepNumber}`
          )
        );

      const previousStepsData: Record<number, any> = {};
      previousSteps.forEach(s => {
        previousStepsData[s.stepNumber] = s.formData;
      });

      // Generate deliverable
      const content = await generateDeliverable({
        workflowType: workflow[0].type,
        phaseName: step[0].phaseName,
        stepName: step[0].stepName,
        deliverableName: input.deliverableName,
        formData: step[0].formData || {},
        previousStepsData,
      });

      // Save generated deliverable
      const generatedDeliverables = step[0].generatedDeliverables || [];
      generatedDeliverables.push({
        name: input.deliverableName,
        url: '', // TODO: Save to S3 or file storage
        generatedAt: new Date(),
      });

      await db
        .update(workflowSteps)
        .set({
          generatedDeliverables,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(workflowSteps.workflowId, input.workflowId),
            eq(workflowSteps.stepNumber, input.stepNumber)
          )
        );

      return {
        deliverableName: input.deliverableName,
        content,
        generatedAt: new Date(),
      };
    }),
});
