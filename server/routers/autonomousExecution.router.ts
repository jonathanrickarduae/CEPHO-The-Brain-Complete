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
import OpenAI from "openai";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import {
  projects,
  tasks,
  digitalTwinProfile,
  activityFeed,
} from "../../drizzle/schema";

let _openaiClient: OpenAI | null = null;
function getOpenAIClient(): OpenAI {
  if (!_openaiClient) {
    _openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? "" });
  }
  return _openaiClient;
}

// ─── SME Agent definitions ────────────────────────────────────────────────────
const SME_AGENTS = [
  {
    id: "strategy",
    name: "Strategy Agent",
    domain: "strategic planning, market analysis, competitive intelligence",
  },
  {
    id: "finance",
    name: "Finance Agent",
    domain: "financial modelling, budgeting, ROI analysis",
  },
  {
    id: "operations",
    name: "Operations Agent",
    domain: "process design, workflow optimisation, resource allocation",
  },
  {
    id: "marketing",
    name: "Marketing Agent",
    domain: "brand strategy, go-to-market, customer acquisition",
  },
  {
    id: "technology",
    name: "Technology Agent",
    domain: "technical architecture, product roadmap, build vs buy decisions",
  },
  {
    id: "legal",
    name: "Legal Agent",
    domain: "contracts, compliance, risk assessment",
  },
  {
    id: "hr",
    name: "People Agent",
    domain: "talent, culture, organisational design",
  },
  {
    id: "innovation",
    name: "Innovation Agent",
    domain: "idea generation, R&D, emerging technologies",
  },
];

interface ExecutionPlan {
  projectName: string;
  projectDescription: string;
  estimatedDuration: string;
  phases: Array<{
    name: string;
    agent: string;
    tasks: Array<{
      title: string;
      description: string;
      priority: string;
      estimatedHours: number;
    }>;
  }>;
  risks: string[];
  successMetrics: string[];
}

async function decomposeGoal(
  goal: string,
  twinProfile: {
    measurementDriven: number | null;
    automationPreference: number | null;
    structurePreference: number | null;
  } | null
): Promise<ExecutionPlan> {
  const twinContext = twinProfile
    ? `Executive profile: measurement-driven (${twinProfile.measurementDriven ?? 5}/10), automation preference (${twinProfile.automationPreference ?? 5}/10), structure preference (${twinProfile.structurePreference ?? 5}/10).`
    : "Executive profile: not yet calibrated, use balanced defaults.";

  const prompt = `You are CEPHO, an elite AI Chief of Staff. Decompose this executive goal into a complete, actionable project plan.

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
}`;

  const completion = await getOpenAIClient().chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error("No response from AI");

  return JSON.parse(text) as ExecutionPlan;
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
      try {
        // 1. Get Digital Twin profile for personalisation
        const [twinProfile] = await db
          .select()
          .from(digitalTwinProfile)
          .where(eq(digitalTwinProfile.userId, userId))
          .limit(1);

        // 2. Decompose the goal using OpenAI
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
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[War Room execute error]", msg);
        throw new Error(`War Room execution failed: ${msg}`);
      }
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
          agent: SME_AGENTS.find(a => a.id === p.agent) ?? {
            id: p.agent,
            name: p.agent,
            domain: "",
          },
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
      .filter(
        p =>
          (p.metadata as Record<string, unknown>)?.createdByAutonomousEngine ===
          true
      )
      .map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        progress: p.progress,
        originalGoal:
          ((p.metadata as Record<string, unknown>)?.originalGoal as string) ??
          "",
        createdAt: p.createdAt.toISOString(),
      }));
  }),

  /**
   * Get the list of available SME agents.
   */
  getAgents: protectedProcedure.query(async () => {
    return SME_AGENTS;
  }),

  /**
   * Parallel SME Execution — run multiple specialist agents simultaneously
   * on a single goal and aggregate their perspectives.
   * Phase 3 (p3-15): Appendix S Parallel Agent Orchestration
   */
  executeParallel: protectedProcedure
    .input(
      z.object({
        goal: z.string().min(5).max(500),
        agentIds: z.array(z.string()).min(2).max(8).optional(),
        saveResults: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI();

      const selectedAgents = input.agentIds
        ? SME_AGENTS.filter(a => (input.agentIds ?? []).includes(a.id))
        : SME_AGENTS;

      // Run all agents in parallel using Promise.all
      const agentResults = await Promise.all(
        selectedAgents.map(async agent => {
          try {
            const completion = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "system",
                  content: `You are the ${agent.name} for CEPHO.AI, specialising in ${agent.domain}. Provide your expert perspective on the given goal. Return JSON: { "analysis": string, "recommendations": string[], "risks": string[], "quick_wins": string[], "estimated_effort": string }`,
                },
                {
                  role: "user",
                  content: `Goal: ${input.goal}\n\nProvide your specialist analysis from a ${agent.domain} perspective.`,
                },
              ],
              response_format: { type: "json_object" },
              temperature: 0.6,
            });

            const raw = JSON.parse(
              completion.choices[0]?.message?.content ?? "{}"
            ) as {
              analysis?: string;
              recommendations?: string[];
              risks?: string[];
              quick_wins?: string[];
              estimated_effort?: string;
            };

            return {
              agentId: agent.id,
              agentName: agent.name,
              domain: agent.domain,
              analysis: raw.analysis ?? "",
              recommendations: raw.recommendations ?? [],
              risks: raw.risks ?? [],
              quickWins: raw.quick_wins ?? [],
              estimatedEffort: raw.estimated_effort ?? "Unknown",
              success: true,
            };
          } catch {
            return {
              agentId: agent.id,
              agentName: agent.name,
              domain: agent.domain,
              analysis: "Agent unavailable.",
              recommendations: [],
              risks: [],
              quickWins: [],
              estimatedEffort: "Unknown",
              success: false,
            };
          }
        })
      );

      // Synthesise a unified recommendation
      const allRecs = agentResults.flatMap(r => r.recommendations).slice(0, 15);
      const allRisks = agentResults.flatMap(r => r.risks).slice(0, 10);
      const allQuickWins = agentResults.flatMap(r => r.quickWins).slice(0, 8);

      const synthCompletion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are the Chief of Staff synthesising inputs from ${agentResults.length} specialist agents. Create a unified executive recommendation. Return JSON: { "executive_summary": string, "top_priorities": string[], "critical_risks": string[], "immediate_actions": string[] }`,
          },
          {
            role: "user",
            content: `Goal: ${input.goal}\n\nAgent Recommendations:\n${allRecs.map(r => `- ${r}`).join("\n")}\n\nRisks:\n${allRisks.map(r => `- ${r}`).join("\n")}\n\nQuick Wins:\n${allQuickWins.map(q => `- ${q}`).join("\n")}`,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.4,
      });

      const synthesis = JSON.parse(
        synthCompletion.choices[0]?.message?.content ?? "{}"
      ) as {
        executive_summary?: string;
        top_priorities?: string[];
        critical_risks?: string[];
        immediate_actions?: string[];
      };

      if (input.saveResults) {
        await db.insert(activityFeed).values({
          userId: ctx.user.id,
          actorType: "ai",
          action: "generated",
          targetType: "parallel_execution",
          targetName: `Parallel Analysis: ${input.goal.slice(0, 60)}`,
          metadata: {
            goal: input.goal,
            agentCount: agentResults.length,
            successCount: agentResults.filter(r => r.success).length,
          },
        });
      }

      return {
        goal: input.goal,
        agentResults,
        synthesis: {
          executiveSummary: synthesis.executive_summary ?? "",
          topPriorities: synthesis.top_priorities ?? [],
          criticalRisks: synthesis.critical_risks ?? [],
          immediateActions: synthesis.immediate_actions ?? [],
        },
        agentsConsulted: agentResults.length,
        successfulAgents: agentResults.filter(r => r.success).length,
      };
    }),
});
