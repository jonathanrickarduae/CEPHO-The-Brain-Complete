/**
 * Autonomous Execution Engine Router
 *
 * The core of the CEPHO.AI platform. Takes a single sentence goal,
 * consults the Digital Twin, decomposes it into a full project plan,
 * and delegates tasks to the appropriate specialist AI agents.
 *
 * This is the "rocket plan" — one sentence, full execution.
 */
import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import Anthropic from "@anthropic-ai/sdk";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import {
  projects,
  tasks,
  digitalTwinProfile,
  activityFeed,
} from "../../drizzle/schema";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});

// ─── SME Agent definitions ────────────────────────────────────────────────────
const SME_AGENTS = [
  { id: "strategy", name: "Strategy Agent", domain: "strategic planning, market analysis, competitive intelligence" },
  { id: "finance", name: "Finance Agent", domain: "financial modelling, budgeting, ROI analysis" },
  { id: "operations", name: "Operations Agent", domain: "process design, workflow optimisation, resource allocation" },
  { id: "marketing", name: "Marketing Agent", domain: "brand strategy, go-to-market, customer acquisition" },
  { id: "technology", name: "Technology Agent", domain: "technical architecture, product roadmap, build vs buy decisions" },
  { id: "legal", name: "Legal Agent", domain: "contracts, compliance, risk assessment" },
  { id: "hr", name: "People Agent", domain: "talent, culture, organisational design" },
  { id: "innovation", name: "Innovation Agent", domain: "idea generation, R&D, emerging technologies" },
];

interface ExecutionPlan {
  projectName: string;
  projectDescription: string;
  estimatedDuration: string;
  phases: Array<{
    name: string;
    agent: string;
    tasks: Array<{ title: string; description: string; priority: string; estimatedHours: number }>;
  }>;
  risks: string[];
  successMetrics: string[];
}

async function decomposeGoal(
  goal: string,
  twinProfile: { measurementDriven: number | null; automationPreference: number | null; structurePreference: number | null } | null
): Promise<ExecutionPlan> {
  const twinContext = twinProfile
    ? `Executive profile: measurement-driven (${twinProfile.measurementDriven ?? 5}/10), automation preference (${twinProfile.automationPreference ?? 5}/10), structure preference (${twinProfile.structurePreference ?? 5}/10).`
    : "Executive profile: not yet calibrated, use balanced defaults.";

  const message = await anthropic.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `You are CEPHO, an elite AI Chief of Staff. Decompose this executive goal into a complete, actionable project plan.

Goal: "${goal}"
${twinContext}

Available specialist agents: ${SME_AGENTS.map(a => `${a.name} (${a.domain})`).join(", ")}.

Respond ONLY with valid JSON matching this exact structure:
{
  "projectName": "short name",
  "projectDescription": "one sentence description",
  "estimatedDuration": "e.g. 6 weeks",
  "phases": [
    {
      "name": "phase name",
      "agent": "agent id from: strategy|finance|operations|marketing|technology|legal|hr|innovation",
      "tasks": [
        { "title": "task title", "description": "what to do", "priority": "high|medium|low", "estimatedHours": 4 }
      ]
    }
  ],
  "risks": ["risk 1", "risk 2"],
  "successMetrics": ["metric 1", "metric 2"]
}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type from AI");

  return JSON.parse(content.text) as ExecutionPlan;
}

export const autonomousExecutionRouter = router({
  /**
   * Execute a goal from a single sentence.
   * Creates a project and all tasks in the database.
   */
  execute: protectedProcedure
    .input(
      z.object({
        goal: z.string().min(5).max(500),
        autoApprove: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;

      // 1. Get Digital Twin profile for personalisation
      const [twinProfile] = await db
        .select()
        .from(digitalTwinProfile)
        .where(eq(digitalTwinProfile.userId, userId))
        .limit(1);

      // 2. Decompose the goal using Claude
      const plan = await decomposeGoal(input.goal, twinProfile ?? null);

      // 3. Create the project
      const [project] = await db
        .insert(projects)
        .values({
          userId,
          name: plan.projectName,
          description: plan.projectDescription,
          status: "active",
          priority: "high",
          progress: 0,
          metadata: {
            originalGoal: input.goal,
            estimatedDuration: plan.estimatedDuration,
            risks: plan.risks,
            successMetrics: plan.successMetrics,
            createdByAutonomousEngine: true,
            phases: plan.phases.map(p => p.name),
          },
        })
        .returning();

      // 4. Create all tasks from the plan
      const createdTasks = [];
      for (const phase of plan.phases) {
        for (const task of phase.tasks) {
          const [created] = await db
            .insert(tasks)
            .values({
              userId,
              projectId: project.id,
              title: task.title,
              description: task.description,
              status: "not_started",
              priority: task.priority as "high" | "medium" | "low",
              progress: 0,
              metadata: {
                phase: phase.name,
                assignedAgent: phase.agent,
                estimatedHours: task.estimatedHours,
                createdByAutonomousEngine: true,
              },
            })
            .returning();
          createdTasks.push(created);
        }
      }

      // 5. Log to activity feed
      await db.insert(activityFeed).values({
        userId,
        actorType: "ai",
        action: "created",
        targetType: "project",
        targetId: project.id,
        targetName: plan.projectName,
        metadata: {
          originalGoal: input.goal,
          tasksCreated: createdTasks.length,
          phasesCreated: plan.phases.length,
        },
      });

      return {
        success: true,
        project,
        tasksCreated: createdTasks.length,
        phasesCreated: plan.phases.length,
        plan: {
          estimatedDuration: plan.estimatedDuration,
          risks: plan.risks,
          successMetrics: plan.successMetrics,
          phases: plan.phases.map(p => ({
            name: p.name,
            agent: SME_AGENTS.find(a => a.id === p.agent)?.name ?? p.agent,
            taskCount: p.tasks.length,
          })),
        },
      };
    }),

  /**
   * Preview a goal decomposition without creating anything in the database.
   * Used for the "preview before execute" flow on the Persephone Board.
   */
  preview: protectedProcedure
    .input(z.object({ goal: z.string().min(5).max(500) }))
    .mutation(async ({ input, ctx }) => {
      const [twinProfile] = await db
        .select()
        .from(digitalTwinProfile)
        .where(eq(digitalTwinProfile.userId, ctx.user.id))
        .limit(1);

      const plan = await decomposeGoal(input.goal, twinProfile ?? null);

      return {
        plan,
        agentAssignments: plan.phases.map(p => ({
          phase: p.name,
          agent: SME_AGENTS.find(a => a.id === p.agent) ?? { id: p.agent, name: p.agent, domain: "" },
          taskCount: p.tasks.length,
        })),
        totalTasks: plan.phases.reduce((sum, p) => sum + p.tasks.length, 0),
        totalEstimatedHours: plan.phases.reduce(
          (sum, p) => sum + p.tasks.reduce((s, t) => s + t.estimatedHours, 0),
          0
        ),
      };
    }),

  /**
   * Get recent autonomous executions for the Persephone Board.
   */
  getRecentExecutions: protectedProcedure.query(async ({ ctx }) => {
    const recentProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.userId, ctx.user.id))
      .orderBy(desc(projects.createdAt))
      .limit(10);

    return recentProjects
      .filter(p => (p.metadata as Record<string, unknown>)?.createdByAutonomousEngine === true)
      .map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        progress: p.progress,
        originalGoal: (p.metadata as Record<string, unknown>)?.originalGoal as string ?? "",
        createdAt: p.createdAt.toISOString(),
      }));
  }),

  /**
   * Get the list of available SME agents.
   */
  getAgents: protectedProcedure.query(async () => {
    return SME_AGENTS;
  }),
});
