/**
 * Ventures Router — Autonomous Venture Execution Framework
 *
 * Gap 3 from Appendix J / Appendix AL: Autonomous Ventures data model + Orchestrator.
 *
 * This router manages the full lifecycle of business ventures within CEPHO,
 * from ideation through launch. Victoria orchestrates multi-step AI workflows
 * for each venture, with mandatory human approval gates before irreversible actions.
 *
 * Key capabilities:
 *  1. Venture CRUD — create, list, get, update, archive ventures
 *  2. Workflow orchestration — start, advance, pause, resume AI-driven workflows
 *  3. Approval gates — human checkpoints before high-impact autonomous actions
 *  4. Orchestrator jobs — track individual agent task executions
 *  5. Market launch — staged go-to-market execution with AI orchestration
 *  6. Kill switch — emergency halt for all autonomous venture actions
 */

import { z } from "zod";
import { desc, eq, and } from "drizzle-orm";
import OpenAI from "openai";
import { aiProcedure, protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import {
  ventures,
  autonomousWorkflows,
  workflowApprovalGates,
  orchestratorJobs,
  systemKillSwitch,
  victoriaActions,
  notifications,
} from "../../drizzle/schema";
import { logAiUsage } from "./aiCostTracking.router";
import { getModelForTask } from "../utils/modelRouter";

function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  return new OpenAI({ apiKey });
}

// ─── Helper: Check Kill Switch ────────────────────────────────────────────────
async function isKillSwitchActive(userId: number): Promise<boolean> {
  const ks = await db
    .select()
    .from(systemKillSwitch)
    .where(
      and(
        eq(systemKillSwitch.userId, userId),
        eq(systemKillSwitch.isActive, true)
      )
    )
    .limit(1);
  return ks.length > 0;
}

// ─── Helper: Log Victoria Action ─────────────────────────────────────────────
async function logAction(
  userId: number,
  actionType: string,
  title: string,
  description?: string
): Promise<void> {
  await db.insert(victoriaActions).values({
    userId,
    actionType,
    actionTitle: title,
    description,
    autonomous: true,
  });
}

// ─── Workflow Type Definitions ────────────────────────────────────────────────
const WORKFLOW_TYPES = {
  market_research: {
    name: "Market Research",
    steps: [
      "Define research scope and target market",
      "Analyse competitor landscape",
      "Identify customer pain points",
      "Synthesise findings into report",
      "Generate strategic recommendations",
    ],
  },
  competitor_analysis: {
    name: "Competitor Analysis",
    steps: [
      "Identify top 5-10 competitors",
      "Analyse product features and pricing",
      "Map competitive positioning",
      "Identify gaps and opportunities",
      "Produce competitive intelligence report",
    ],
  },
  content_creation: {
    name: "Content Creation",
    steps: [
      "Define content strategy and goals",
      "Research target audience",
      "Draft content calendar",
      "Generate initial content pieces",
      "Review and refine for brand voice",
    ],
  },
  market_launch: {
    name: "Market Launch",
    steps: [
      "Pre-launch preparation checklist",
      "Soft launch to early adopters",
      "Gather initial feedback",
      "Full public launch",
      "Post-launch monitoring and optimisation",
    ],
    requiresApproval: [1, 3], // Steps requiring human approval (0-indexed)
  },
  business_plan: {
    name: "Business Plan",
    steps: [
      "Executive summary",
      "Market analysis",
      "Product/service description",
      "Financial projections",
      "Go-to-market strategy",
    ],
  },
  fundraising: {
    name: "Fundraising Preparation",
    steps: [
      "Investor research and targeting",
      "Pitch deck creation",
      "Financial model preparation",
      "Due diligence documentation",
      "Investor outreach strategy",
    ],
    requiresApproval: [3], // Financial model requires approval
  },
} as const;

type WorkflowType = keyof typeof WORKFLOW_TYPES;

// ─── Router ───────────────────────────────────────────────────────────────────
export const venturesRouter = router({
  // ── 1. Create a new venture ──────────────────────────────────────────────────
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(255),
        description: z.string().optional(),
        industry: z.string().optional(),
        targetMarket: z.string().optional(),
        businessModel: z.string().optional(),
        stage: z
          .enum(["ideation", "validation", "build", "launch", "growth"])
          .default("ideation"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const [venture] = await db
        .insert(ventures)
        .values({
          userId,
          name: input.name,
          description: input.description,
          industry: input.industry,
          targetMarket: input.targetMarket,
          businessModel: input.businessModel,
          stage: input.stage,
          status: "draft",
        })
        .returning();

      await logAction(
        userId,
        "venture_created",
        `New venture created: ${input.name}`,
        `Stage: ${input.stage}, Industry: ${input.industry ?? "not specified"}`
      );

      return venture;
    }),

  // ── 2. List all ventures ─────────────────────────────────────────────────────
  list: protectedProcedure
    .input(
      z.object({
        status: z
          .enum(["draft", "active", "paused", "launched", "archived", "all"])
          .default("all"),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const query = db
        .select()
        .from(ventures)
        .where(
          input.status === "all"
            ? eq(ventures.userId, userId)
            : and(
                eq(ventures.userId, userId),
                eq(ventures.status, input.status)
              )
        )
        .orderBy(desc(ventures.createdAt));
      return query;
    }),

  // ── 3. Get a single venture with its workflows ────────────────────────────────
  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const [venture] = await db
        .select()
        .from(ventures)
        .where(and(eq(ventures.id, input.id), eq(ventures.userId, userId)))
        .limit(1);

      if (!venture) throw new Error("Venture not found");

      const workflows = await db
        .select()
        .from(autonomousWorkflows)
        .where(eq(autonomousWorkflows.ventureId, input.id))
        .orderBy(desc(autonomousWorkflows.createdAt));

      return { ...venture, workflows };
    }),

  // ── 4. Update a venture ──────────────────────────────────────────────────────
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(2).max(255).optional(),
        description: z.string().optional(),
        status: z
          .enum(["draft", "active", "paused", "launched", "archived"])
          .optional(),
        stage: z
          .enum(["ideation", "validation", "build", "launch", "growth"])
          .optional(),
        industry: z.string().optional(),
        targetMarket: z.string().optional(),
        businessModel: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const { id, ...updates } = input;
      const [updated] = await db
        .update(ventures)
        .set({ ...updates, updatedAt: new Date() })
        .where(and(eq(ventures.id, id), eq(ventures.userId, userId)))
        .returning();

      if (!updated) throw new Error("Venture not found");
      return updated;
    }),

  // ── 5. Start an autonomous workflow for a venture ─────────────────────────────
  startWorkflow: aiProcedure
    .input(
      z.object({
        ventureId: z.string().uuid(),
        workflowType: z.enum([
          "market_research",
          "competitor_analysis",
          "content_creation",
          "market_launch",
          "business_plan",
          "fundraising",
        ]),
        customName: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Check kill switch
      if (await isKillSwitchActive(userId)) {
        throw new Error(
          "System kill switch is active. All autonomous actions are halted."
        );
      }

      // Verify venture ownership
      const [venture] = await db
        .select()
        .from(ventures)
        .where(
          and(eq(ventures.id, input.ventureId), eq(ventures.userId, userId))
        )
        .limit(1);

      if (!venture) throw new Error("Venture not found");

      const wfConfig = WORKFLOW_TYPES[input.workflowType as WorkflowType];
      const steps = wfConfig.steps.map((stepName, index) => ({
        index,
        name: stepName,
        status: "pending",
        output: null,
        startedAt: null,
        completedAt: null,
      }));

      const [workflow] = await db
        .insert(autonomousWorkflows)
        .values({
          ventureId: input.ventureId,
          userId,
          name: input.customName ?? wfConfig.name,
          type: input.workflowType,
          status: "in_progress",
          currentStep: 0,
          totalSteps: steps.length,
          steps,
          startedAt: new Date(),
        })
        .returning();

      // Create the first orchestrator job
      await db.insert(orchestratorJobs).values({
        workflowId: workflow.id,
        userId,
        agentId: "victoria",
        taskType: `${input.workflowType}_step_0`,
        input: {
          venture: {
            name: venture.name,
            description: venture.description,
            industry: venture.industry,
            targetMarket: venture.targetMarket,
          },
          step: steps[0],
          workflowType: input.workflowType,
        },
        status: "queued",
        priority: 3,
      });

      await logAction(
        userId,
        "workflow_started",
        `Started ${wfConfig.name} workflow for ${venture.name}`,
        `Workflow ID: ${workflow.id}, Steps: ${steps.length}`
      );

      return workflow;
    }),

  // ── 6. Execute the next step in a workflow (AI-powered) ──────────────────────
  executeWorkflowStep: aiProcedure
    .input(
      z.object({
        workflowId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      if (await isKillSwitchActive(userId)) {
        throw new Error("System kill switch is active.");
      }

      const [workflow] = await db
        .select()
        .from(autonomousWorkflows)
        .where(
          and(
            eq(autonomousWorkflows.id, input.workflowId),
            eq(autonomousWorkflows.userId, userId)
          )
        )
        .limit(1);

      if (!workflow) throw new Error("Workflow not found");
      if (workflow.status === "completed")
        throw new Error("Workflow already completed");
      if (workflow.status === "awaiting_approval")
        throw new Error("Workflow is awaiting human approval");

      const [venture] = await db
        .select()
        .from(ventures)
        .where(eq(ventures.id, workflow.ventureId))
        .limit(1);

      const steps = workflow.steps as Array<{
        index: number;
        name: string;
        status: string;
        output: string | null;
      }>;
      const currentStepData = steps[workflow.currentStep];
      if (!currentStepData) throw new Error("No more steps to execute");

      // Check if this step requires approval
      const wfConfig = WORKFLOW_TYPES[workflow.type as WorkflowType];
      const requiresApproval =
        "requiresApproval" in wfConfig &&
        (wfConfig.requiresApproval as unknown as number[]).includes(
          workflow.currentStep
        );

      if (requiresApproval) {
        // Create approval gate and pause workflow
        await db.insert(workflowApprovalGates).values({
          workflowId: workflow.id,
          userId,
          stepName: currentStepData.name,
          stepIndex: workflow.currentStep,
          description: `Victoria is about to execute: "${currentStepData.name}" for venture "${venture?.name ?? "Unknown"}"`,
          proposedAction: `Execute step ${workflow.currentStep + 1} of ${workflow.totalSteps}: ${currentStepData.name}`,
          impactLevel: "high",
          status: "pending",
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        });

        await db
          .update(autonomousWorkflows)
          .set({ status: "awaiting_approval", updatedAt: new Date() })
          .where(eq(autonomousWorkflows.id, workflow.id));

        // Notify user
        await db.insert(notifications).values({
          userId,
          type: "approval_required",
          title: "Approval Required",
          message: `Victoria needs your approval to proceed with "${currentStepData.name}" in the ${workflow.name} workflow.`,
          metadata: {
            workflowId: workflow.id,
            stepIndex: workflow.currentStep,
          },
        });

        return {
          status: "awaiting_approval",
          stepName: currentStepData.name,
          message: "Human approval required before proceeding",
        };
      }

      // Execute the step with AI
      const openai = getOpenAI();
      const model = getModelForTask("generate");

      const completion = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: `You are Victoria, CEPHO's AI Chief of Staff, executing an autonomous workflow step for a business venture. Produce high-quality, actionable output for this step.`,
          },
          {
            role: "user",
            content: `## Venture
Name: ${venture?.name ?? "Unknown"}
Description: ${venture?.description ?? "Not provided"}
Industry: ${venture?.industry ?? "Not specified"}
Target Market: ${venture?.targetMarket ?? "Not specified"}
Stage: ${venture?.stage ?? "ideation"}

## Workflow: ${workflow.name} (${workflow.type})
Step ${workflow.currentStep + 1} of ${workflow.totalSteps}: ${currentStepData.name}

## Previous Steps Output
${
  steps
    .filter(s => s.index < workflow.currentStep && s.output)
    .map(s => `### Step ${s.index + 1}: ${s.name}\n${s.output}`)
    .join("\n\n") || "This is the first step."
}

## Task
Execute this step and produce detailed, actionable output. Be specific, data-driven, and strategic. Format your response in clear sections with headers.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      void logAiUsage(
        userId,
        "ventures.executeWorkflowStep",
        completion.model,
        completion.usage ?? null
      );

      const stepOutput =
        completion.choices[0]?.message?.content ?? "Step completed.";

      // Update the step output
      const updatedSteps = steps.map(s =>
        s.index === workflow.currentStep
          ? {
              ...s,
              status: "completed",
              output: stepOutput,
              completedAt: new Date().toISOString(),
            }
          : s
      );

      const isLastStep = workflow.currentStep >= workflow.totalSteps - 1;
      const nextStep = isLastStep
        ? workflow.currentStep
        : workflow.currentStep + 1;

      await db
        .update(autonomousWorkflows)
        .set({
          steps: updatedSteps,
          currentStep: nextStep,
          status: isLastStep ? "completed" : "in_progress",
          completedAt: isLastStep ? new Date() : undefined,
          updatedAt: new Date(),
          result: isLastStep
            ? { summary: stepOutput, completedAt: new Date().toISOString() }
            : undefined,
        })
        .where(eq(autonomousWorkflows.id, workflow.id));

      // Update orchestrator job
      await db
        .update(orchestratorJobs)
        .set({
          status: "completed",
          output: { result: stepOutput },
          completedAt: new Date(),
        })
        .where(
          and(
            eq(orchestratorJobs.workflowId, workflow.id),
            eq(orchestratorJobs.status, "queued")
          )
        );

      await logAction(
        userId,
        "workflow_step_completed",
        `Completed step: ${currentStepData.name}`,
        `Workflow: ${workflow.name}, Step ${workflow.currentStep + 1}/${workflow.totalSteps}`
      );

      return {
        status: isLastStep ? "completed" : "in_progress",
        stepName: currentStepData.name,
        stepOutput,
        nextStep: isLastStep ? null : updatedSteps[nextStep]?.name,
        progress: Math.round(
          ((workflow.currentStep + 1) / workflow.totalSteps) * 100
        ),
      };
    }),

  // ── 7. Approve or deny a workflow approval gate ───────────────────────────────
  resolveApprovalGate: protectedProcedure
    .input(
      z.object({
        gateId: z.string().uuid(),
        decision: z.enum(["approved", "denied"]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      const [gate] = await db
        .select()
        .from(workflowApprovalGates)
        .where(
          and(
            eq(workflowApprovalGates.id, input.gateId),
            eq(workflowApprovalGates.userId, userId)
          )
        )
        .limit(1);

      if (!gate) throw new Error("Approval gate not found");
      if (gate.status !== "pending") throw new Error("Gate already resolved");

      await db
        .update(workflowApprovalGates)
        .set({
          status: input.decision,
          userDecision: input.decision,
          userNotes: input.notes,
          decidedAt: new Date(),
        })
        .where(eq(workflowApprovalGates.id, input.gateId));

      // Resume or cancel the workflow
      const newStatus =
        input.decision === "approved" ? "in_progress" : "paused";
      await db
        .update(autonomousWorkflows)
        .set({ status: newStatus, updatedAt: new Date() })
        .where(eq(autonomousWorkflows.id, gate.workflowId));

      await logAction(
        userId,
        "approval_gate_resolved",
        `Approval gate ${input.decision}: ${gate.stepName}`,
        input.notes
      );

      return {
        success: true,
        decision: input.decision,
        workflowStatus: newStatus,
      };
    }),

  // ── 8. List pending approval gates ───────────────────────────────────────────
  listPendingApprovals: protectedProcedure.query(async ({ ctx }) => {
    return db
      .select()
      .from(workflowApprovalGates)
      .where(
        and(
          eq(workflowApprovalGates.userId, ctx.user.id),
          eq(workflowApprovalGates.status, "pending")
        )
      )
      .orderBy(desc(workflowApprovalGates.createdAt));
  }),

  // ── 9. Get orchestrator job queue ─────────────────────────────────────────────
  getJobQueue: protectedProcedure
    .input(
      z.object({
        status: z
          .enum([
            "queued",
            "running",
            "completed",
            "failed",
            "cancelled",
            "all",
          ])
          .default("all"),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      return db
        .select()
        .from(orchestratorJobs)
        .where(
          input.status === "all"
            ? eq(orchestratorJobs.userId, userId)
            : and(
                eq(orchestratorJobs.userId, userId),
                eq(orchestratorJobs.status, input.status)
              )
        )
        .orderBy(desc(orchestratorJobs.createdAt))
        .limit(50);
    }),

  // ── 10. Generate AI-powered venture strategy ──────────────────────────────────
  generateStrategy: aiProcedure
    .input(
      z.object({
        ventureId: z.string().uuid(),
        focusArea: z
          .enum([
            "go_to_market",
            "product_roadmap",
            "funding_strategy",
            "competitive_positioning",
            "growth_hacking",
          ])
          .default("go_to_market"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      const [venture] = await db
        .select()
        .from(ventures)
        .where(
          and(eq(ventures.id, input.ventureId), eq(ventures.userId, userId))
        )
        .limit(1);

      if (!venture) throw new Error("Venture not found");

      const openai = getOpenAI();
      const model = getModelForTask("generate");

      const focusLabels: Record<string, string> = {
        go_to_market: "Go-to-Market Strategy",
        product_roadmap: "Product Roadmap",
        funding_strategy: "Funding Strategy",
        competitive_positioning: "Competitive Positioning",
        growth_hacking: "Growth Hacking Playbook",
      };

      const completion = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: `You are Victoria, CEPHO's AI Chief of Staff. You are a world-class strategic advisor helping entrepreneurs build successful ventures. Produce a comprehensive, actionable strategy document.`,
          },
          {
            role: "user",
            content: `## Venture Details
Name: ${venture.name}
Description: ${venture.description ?? "Not provided"}
Industry: ${venture.industry ?? "Not specified"}
Target Market: ${venture.targetMarket ?? "Not specified"}
Business Model: ${venture.businessModel ?? "Not specified"}
Current Stage: ${venture.stage}

## Request
Generate a comprehensive ${focusLabels[input.focusArea]} for this venture. Include:
1. Executive summary (2-3 sentences)
2. Key strategic priorities (3-5 priorities)
3. Detailed action plan with timelines
4. Success metrics and KPIs
5. Potential risks and mitigation strategies
6. Resource requirements

Be specific, actionable, and tailored to the venture's stage and industry.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 3000,
      });

      void logAiUsage(
        userId,
        "ventures.generateStrategy",
        completion.model,
        completion.usage ?? null
      );

      const strategy = completion.choices[0]?.message?.content ?? "";

      await logAction(
        userId,
        "strategy_generated",
        `Generated ${focusLabels[input.focusArea]} for ${venture.name}`,
        `Focus: ${input.focusArea}`
      );

      return {
        ventureId: input.ventureId,
        ventureName: venture.name,
        focusArea: input.focusArea,
        strategy,
        generatedAt: new Date().toISOString(),
      };
    }),

  // ── 11. Get/set kill switch status ────────────────────────────────────────────
  getKillSwitchStatus: protectedProcedure.query(async ({ ctx }) => {
    const ks = await db
      .select()
      .from(systemKillSwitch)
      .where(eq(systemKillSwitch.userId, ctx.user.id))
      .orderBy(desc(systemKillSwitch.createdAt))
      .limit(1);
    return ks[0] ?? { isActive: false };
  }),

  setKillSwitch: protectedProcedure
    .input(
      z.object({
        isActive: z.boolean(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Check if a kill switch record exists
      const existing = await db
        .select()
        .from(systemKillSwitch)
        .where(eq(systemKillSwitch.userId, userId))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(systemKillSwitch)
          .set({
            isActive: input.isActive,
            reason: input.reason,
            activatedAt: input.isActive ? new Date() : existing[0].activatedAt,
            deactivatedAt: !input.isActive ? new Date() : undefined,
          })
          .where(eq(systemKillSwitch.userId, userId));
      } else {
        await db.insert(systemKillSwitch).values({
          userId,
          isActive: input.isActive,
          reason: input.reason,
          activatedAt: input.isActive ? new Date() : undefined,
        });
      }

      await logAction(
        userId,
        input.isActive ? "kill_switch_activated" : "kill_switch_deactivated",
        input.isActive
          ? "🛑 System kill switch ACTIVATED — all autonomous actions halted"
          : "✅ System kill switch deactivated — autonomous actions resumed",
        input.reason
      );

      return { success: true, isActive: input.isActive };
    }),
});
