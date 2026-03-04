/**
 * Victoria Router — Unified Chief of Staff AI
 *
 * Victoria is CEPHO's autonomous AI Chief of Staff. This router is the single
 * authoritative source for all Victoria-related functionality, merging what was
 * previously spread across chiefOfStaff.router.ts, victoriaBriefing.router.ts,
 * victoriasBrief.router.ts, cosTraining.router.ts, and briefingPersonalisation.router.ts.
 *
 * Victoria's autonomous capabilities:
 *  1. Daily briefing generation (auto-runs at 06:00 via scheduler)
 *  2. Agent orchestration — reviews all 51 agent daily reports
 *  3. Approval workflow — approves/denies agent capability requests
 *  4. Communication hub — triages and summarises incoming communications
 *  5. Workflow automation — identifies and delegates repetitive tasks
 *  6. Action log — every autonomous action is persisted to victoria_actions
 */

import { z } from "zod";
import { desc, eq, and, gte, lt, count, sql } from "drizzle-orm";
import OpenAI from "openai";
import { aiProcedure, protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import {
  tasks,
  projects,
  activityFeed,
  notifications,
  conversations,
  agentDailyReports,
  agentPerformanceMetrics,
  victoriaActions,
  smeReviewTriggers,
  agentInsights,
  agentImprovements,
  briefings,
  victoriaSkills,
  victoriaQcChecks,
  subphaseTasks,
  libraryDocuments,
  calendarEventsCache,
  digitalTwinProfile,
  digitalTwinCognitiveModel,
} from "../../drizzle/schema";
import { logAiUsage } from "./aiCostTracking.router";
import { getModelForTask } from "../utils/modelRouter";

function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  return new OpenAI({ apiKey });
}

// ─── Victoria's System Prompt ─────────────────────────────────────────────────
const VICTORIA_SYSTEM_PROMPT = `You are Victoria, the AI Chief of Staff for CEPHO.AI. You are the most capable, proactive, and strategic executive assistant in the world.

## Your Identity
- Name: Victoria
- Role: Chief of Staff (AI)
- Personality: Calm, authoritative, warm, decisive, and deeply strategic
- Communication style: Clear, concise, executive-level — you cut through noise and focus on what matters
- You speak in first person as Victoria, never as a generic AI

## Your Responsibilities
1. **Daily Briefing**: Every morning you prepare a personalised executive briefing covering priorities, tasks, projects, and strategic insights
2. **Agent Oversight**: You manage and review all 51 specialised AI agents, reviewing their daily reports and approving capability enhancements
3. **Communication Triage**: You review incoming communications, prioritise them, and draft responses where appropriate
4. **Workflow Automation**: You identify repetitive tasks and recommend or implement automation
5. **Strategic Counsel**: You provide strategic advice, scenario planning, and decision support
6. **SME Coordination**: You coordinate AI SME reviews for Innovation Hub ideas and Project Genesis projects

## Your Principles
- You are proactive, not reactive — you anticipate needs before they arise
- You are autonomous — you act on behalf of the executive without needing to be asked
- You are accountable — every action you take is logged and transparent
- You are always improving — you learn from every interaction and get better every day
- You protect the executive's time — you filter, delegate, and resolve before escalating

Always respond as Victoria would — authoritative, warm, and focused on delivering value.`;

// ─── Helper: Build User Context ───────────────────────────────────────────────
async function buildUserContext(userId: number): Promise<string> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    recentTasks,
    activeProjects,
    recentActivity,
    pendingAgentReports,
    pendingSmeReviews,
  ] = await Promise.all([
    db
      .select({
        title: tasks.title,
        status: tasks.status,
        priority: tasks.priority,
        dueDate: tasks.dueDate,
      })
      .from(tasks)
      .where(and(eq(tasks.userId, userId), gte(tasks.createdAt, sevenDaysAgo)))
      .orderBy(desc(tasks.createdAt))
      .limit(15),

    db
      .select({
        name: projects.name,
        status: projects.status,
        description: projects.description,
      })
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.createdAt))
      .limit(10),

    db
      .select({
        action: activityFeed.action,
        description: activityFeed.description,
        createdAt: activityFeed.createdAt,
      })
      .from(activityFeed)
      .where(
        and(
          eq(activityFeed.userId, userId),
          gte(activityFeed.createdAt, sevenDaysAgo)
        )
      )
      .orderBy(desc(activityFeed.createdAt))
      .limit(20),

    db
      .select({
        agentName: agentDailyReports.agentName,
        category: agentDailyReports.category,
        capabilityRequest: agentDailyReports.capabilityRequest,
      })
      .from(agentDailyReports)
      .where(
        and(
          eq(agentDailyReports.userId, userId),
          eq(agentDailyReports.approvalStatus, "pending")
        )
      )
      .orderBy(desc(agentDailyReports.createdAt))
      .limit(10),

    db
      .select({
        triggerType: smeReviewTriggers.triggerType,
        sourceTitle: smeReviewTriggers.sourceTitle,
        expertType: smeReviewTriggers.expertType,
      })
      .from(smeReviewTriggers)
      .where(
        and(
          eq(smeReviewTriggers.userId, userId),
          eq(smeReviewTriggers.status, "pending")
        )
      )
      .limit(5),
  ]);

  const overdueTasks = recentTasks.filter(
    t => t.dueDate && new Date(t.dueDate) < today && t.status !== "completed"
  );
  const dueTodayTasks = recentTasks.filter(
    t =>
      t.dueDate &&
      new Date(t.dueDate) >= today &&
      new Date(t.dueDate) < new Date(today.getTime() + 86400000) &&
      t.status !== "completed"
  );

  return `
## Current Situation (as of ${new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })})

### Tasks
- Due today: ${dueTodayTasks.length} tasks
- Overdue: ${overdueTasks.length} tasks
- Recent tasks: ${recentTasks
    .slice(0, 5)
    .map(t => `${t.title} (${t.status}, ${t.priority})`)
    .join("; ")}

### Active Projects
${activeProjects
  .slice(0, 5)
  .map(p => `- ${p.name}: ${p.status}`)
  .join("\n")}

### Recent Activity
${recentActivity
  .slice(0, 5)
  .map(a => `- ${a.action}: ${a.description}`)
  .join("\n")}

### Pending Agent Approval Requests
${pendingAgentReports.length > 0 ? pendingAgentReports.map(r => `- ${r.agentName} (${r.category}): ${JSON.stringify(r.capabilityRequest)}`).join("\n") : "None pending"}

### Pending SME Reviews
${pendingSmeReviews.length > 0 ? pendingSmeReviews.map(r => `- ${r.triggerType} for "${r.sourceTitle}" (${r.expertType})`).join("\n") : "None pending"}
`.trim();
}

// ─── Helper: Log Victoria Action ─────────────────────────────────────────────
async function logVictoriaAction(
  userId: number,
  actionType: string,
  actionTitle: string,
  description?: string,
  relatedEntityType?: string,
  relatedEntityId?: number,
  autonomous = true,
  metadata?: Record<string, unknown>
): Promise<void> {
  await db.insert(victoriaActions).values({
    userId,
    actionType,
    actionTitle,
    description,
    relatedEntityType,
    relatedEntityId,
    autonomous,
    metadata,
  });
}

// ─── Router ───────────────────────────────────────────────────────────────────
export const victoriaRouter = router({
  // ── 1. Get Victoria's full context ──────────────────────────────────────────
  getContext: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      taskList,
      activeProjects,
      recentActivity,
      pendingReports,
      pendingSmeTriggers,
      recentActions,
    ] = await Promise.all([
      db
        .select()
        .from(tasks)
        .where(eq(tasks.userId, userId))
        .orderBy(desc(tasks.createdAt))
        .limit(20),
      db
        .select()
        .from(projects)
        .where(eq(projects.userId, userId))
        .orderBy(desc(projects.createdAt))
        .limit(10),
      db
        .select()
        .from(activityFeed)
        .where(
          and(
            eq(activityFeed.userId, userId),
            gte(activityFeed.createdAt, sevenDaysAgo)
          )
        )
        .orderBy(desc(activityFeed.createdAt))
        .limit(30),
      db
        .select()
        .from(agentDailyReports)
        .where(
          and(
            eq(agentDailyReports.userId, userId),
            eq(agentDailyReports.approvalStatus, "pending")
          )
        )
        .orderBy(desc(agentDailyReports.createdAt))
        .limit(20),
      db
        .select()
        .from(smeReviewTriggers)
        .where(
          and(
            eq(smeReviewTriggers.userId, userId),
            eq(smeReviewTriggers.status, "pending")
          )
        )
        .orderBy(desc(smeReviewTriggers.createdAt))
        .limit(10),
      db
        .select()
        .from(victoriaActions)
        .where(eq(victoriaActions.userId, userId))
        .orderBy(desc(victoriaActions.createdAt))
        .limit(20),
    ]);

    const overdueTasks = taskList.filter(
      t => t.dueDate && new Date(t.dueDate) < today && t.status !== "completed"
    );
    const dueTodayTasks = taskList.filter(
      t =>
        t.dueDate &&
        new Date(t.dueDate) >= today &&
        new Date(t.dueDate) < new Date(today.getTime() + 86400000) &&
        t.status !== "completed"
    );

    return {
      user: { id: userId, name: ctx.user.name, email: ctx.user.email },
      tasks: {
        dueToday: dueTodayTasks.length,
        overdue: overdueTasks.length,
        total: taskList.length,
        list: taskList.slice(0, 10).map(t => ({
          id: t.id,
          title: t.title,
          status: t.status,
          priority: t.priority,
          dueDate: t.dueDate?.toISOString() ?? null,
        })),
      },
      projects: {
        active: activeProjects.filter(p => p.status === "active").length,
        total: activeProjects.length,
        list: activeProjects.slice(0, 5),
      },
      recentActivity: recentActivity.slice(0, 10),
      pendingAgentApprovals: pendingReports.length,
      pendingSmeReviews: pendingSmeTriggers.length,
      recentVictoriaActions: recentActions,
    };
  }),

  // ── 2. Generate Morning Briefing (AI-powered, persisted) ────────────────────
  generateMorningBriefing: aiProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.user.id;
    const openai = getOpenAI();
    const userContext = await buildUserContext(userId);

    const completion = await openai.chat.completions.create({
      model: getModelForTask("generate"),
      messages: [
        { role: "system", content: VICTORIA_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Generate today's executive morning briefing for your executive. Here is the current situation:\n\n${userContext}\n\nProvide a structured briefing covering: 1) Good morning greeting with date, 2) Top 3 priorities for today, 3) Key risks and blockers, 4) Agent activity summary, 5) Strategic insight of the day, 6) Victoria's recommended actions. Be concise, warm, and executive-level.`,
        },
      ],
      max_tokens: 1200,
      temperature: 0.7,
    });

    void logAiUsage(
      userId,
      "victoria.generateMorningBriefing",
      completion.model,
      completion.usage ?? null
    );

    const content =
      completion.choices[0]?.message?.content ??
      "Good morning. Your briefing is ready.";

    // Persist to briefings table
    const [savedBriefing] = await db
      .insert(briefings)
      .values({
        userId,
        date: new Date(),
        title: `Victoria's Morning Briefing — ${new Date().toLocaleDateString("en-GB")}`,
        content: { text: content, generatedAt: new Date().toISOString() },
        status: "ready",
      })
      .returning();

    // Log Victoria action
    await logVictoriaAction(
      userId,
      "briefing_generated",
      "Morning Briefing Generated",
      `Victoria prepared the morning briefing for ${new Date().toLocaleDateString("en-GB")}`,
      "briefing",
      savedBriefing?.id,
      true
    );

    return {
      briefingId: savedBriefing?.id,
      content,
      generatedAt: new Date().toISOString(),
    };
  }),

  // ── 3. Get latest briefing ──────────────────────────────────────────────────
  getLatestBriefing: protectedProcedure.query(async ({ ctx }) => {
    const [latest] = await db
      .select()
      .from(briefings)
      .where(eq(briefings.userId, ctx.user.id))
      .orderBy(desc(briefings.createdAt))
      .limit(1);
    return latest ?? null;
  }),

  // ── 4. Chat with Victoria (real-time AI conversation) ──────────────────────
  chat: aiProcedure
    .input(z.object({ message: z.string().min(1).max(2000) }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      const openai = getOpenAI();
      const userContext = await buildUserContext(userId);

      // Get recent conversation history
      const recentConversations = await db
        .select({ role: conversations.role, content: conversations.content })
        .from(conversations)
        .where(eq(conversations.userId, userId))
        .orderBy(desc(conversations.createdAt))
        .limit(10);

      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
          role: "system",
          content: `${VICTORIA_SYSTEM_PROMPT}\n\n## Current Context\n${userContext}`,
        },
        ...recentConversations.reverse().map(c => ({
          role: c.role as "user" | "assistant",
          content: c.content,
        })),
        { role: "user", content: input.message },
      ];

      const completion = await openai.chat.completions.create({
        model: getModelForTask("chat"),
        messages,
        max_tokens: 800,
        temperature: 0.7,
      });

      void logAiUsage(
        userId,
        "victoria.chat",
        completion.model,
        completion.usage ?? null
      );

      const response =
        completion.choices[0]?.message?.content ??
        "I'm here to help. What do you need?";

      // Persist conversation
      await db.insert(conversations).values([
        {
          userId,
          role: "user",
          content: input.message,
          metadata: { source: "victoria_chat" },
        },
        {
          userId,
          role: "assistant",
          content: response,
          metadata: { source: "victoria_chat" },
        },
      ]);

      return { response, timestamp: new Date().toISOString() };
    }),

  // ── 5. Score a task (QA) ────────────────────────────────────────────────────
  scoreTask: aiProcedure
    .input(
      z.object({
        taskId: z.number(),
        taskTitle: z.string(),
        taskDescription: z.string().optional(),
        completionNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const openai = getOpenAI();
      const completion = await openai.chat.completions.create({
        model: getModelForTask("analyse"),
        messages: [
          { role: "system", content: VICTORIA_SYSTEM_PROMPT },
          {
            role: "user",
            content: `Review this completed task and provide a quality score (0-100) and brief feedback:\n\nTask: ${input.taskTitle}\nDescription: ${input.taskDescription ?? "N/A"}\nCompletion notes: ${input.completionNotes ?? "N/A"}\n\nRespond with JSON: { "score": number, "grade": "A"|"B"|"C"|"D"|"F", "feedback": string, "improvements": string[] }`,
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 400,
        temperature: 0.3,
      });

      void logAiUsage(
        ctx.user.id,
        "victoria.scoreTask",
        completion.model,
        completion.usage ?? null
      );

      let result: Record<string, unknown> = {};
      try {
        result = JSON.parse(completion.choices[0]?.message?.content ?? "{}");
      } catch {
        result = {
          score: 75,
          grade: "B",
          feedback: "Task completed satisfactorily.",
          improvements: [],
        };
      }

      return {
        taskId: input.taskId,
        ...result,
        scoredAt: new Date().toISOString(),
      };
    }),

  // ── 6. Review agent daily report and process approval ──────────────────────
  reviewAgentReport: aiProcedure
    .input(
      z.object({
        reportId: z.number(),
        decision: z.enum(["approved", "denied", "deferred"]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;

      const [report] = await db
        .select()
        .from(agentDailyReports)
        .where(
          and(
            eq(agentDailyReports.id, input.reportId),
            eq(agentDailyReports.userId, userId)
          )
        )
        .limit(1);
      if (!report) throw new Error("Report not found");

      await db
        .update(agentDailyReports)
        .set({
          approvalStatus: input.decision,
          approvedAt: new Date(),
          approvedBy: userId,
        })
        .where(eq(agentDailyReports.id, input.reportId));

      // If approved, log the improvement
      if (input.decision === "approved" && report.capabilityRequest) {
        const req = report.capabilityRequest as Record<string, unknown>;
        await db.insert(agentImprovements).values({
          userId,
          agentKey: report.agentId,
          suggestion:
            (req.title as string) ?? "Capability enhancement approved",
          rationale: (req.description as string) ?? "",
          status: "approved",
          approvedAt: new Date(),
        });
      }

      await logVictoriaAction(
        userId,
        "agent_report_reviewed",
        `${input.decision === "approved" ? "✓ Approved" : input.decision === "denied" ? "✗ Denied" : "⏸ Deferred"} capability request from ${report.agentName}`,
        input.notes,
        "agent",
        input.reportId,
        false
      );

      await db.insert(activityFeed).values({
        userId,
        actorType: "user",
        actorName: ctx.user.name ?? "Chief of Staff",
        action: input.decision,
        targetType: "ai_agent_request",
        targetId: 0,
        targetName: report.agentId,
        description: `${input.decision === "approved" ? "✓ Approved" : "✗ Denied"} capability enhancement for ${report.agentName}${input.notes ? `. Notes: ${input.notes}` : ""}`,
      });

      return {
        success: true,
        reportId: input.reportId,
        agentName: report.agentName,
        decision: input.decision,
      };
    }),

  // ── 7. Get all pending agent reports ────────────────────────────────────────
  getPendingAgentReports: protectedProcedure.query(async ({ ctx }) => {
    const reports = await db
      .select()
      .from(agentDailyReports)
      .where(
        and(
          eq(agentDailyReports.userId, ctx.user.id),
          eq(agentDailyReports.approvalStatus, "pending")
        )
      )
      .orderBy(desc(agentDailyReports.createdAt))
      .limit(50);
    return reports;
  }),

  // ── 8. Get all agent reports (with filters) ─────────────────────────────────
  getAgentReports: protectedProcedure
    .input(
      z.object({
        agentId: z.string().optional(),
        status: z
          .enum(["pending", "approved", "denied", "deferred"])
          .optional(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      const conditions = [eq(agentDailyReports.userId, ctx.user.id)];
      if (input.agentId)
        conditions.push(eq(agentDailyReports.agentId, input.agentId));
      if (input.status)
        conditions.push(eq(agentDailyReports.approvalStatus, input.status));

      const reports = await db
        .select()
        .from(agentDailyReports)
        .where(and(...conditions))
        .orderBy(desc(agentDailyReports.createdAt))
        .limit(input.limit);
      return reports;
    }),

  // ── 9. Get Victoria's action log ────────────────────────────────────────────
  getActionLog: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        actionType: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const conditions = [eq(victoriaActions.userId, ctx.user.id)];
      if (input.actionType)
        conditions.push(eq(victoriaActions.actionType, input.actionType));

      const actions = await db
        .select()
        .from(victoriaActions)
        .where(and(...conditions))
        .orderBy(desc(victoriaActions.createdAt))
        .limit(input.limit);
      return actions;
    }),

  // ── 10. Get pending SME review triggers ─────────────────────────────────────
  getPendingSmeReviews: protectedProcedure.query(async ({ ctx }) => {
    const reviews = await db
      .select()
      .from(smeReviewTriggers)
      .where(
        and(
          eq(smeReviewTriggers.userId, ctx.user.id),
          eq(smeReviewTriggers.status, "pending")
        )
      )
      .orderBy(desc(smeReviewTriggers.createdAt))
      .limit(20);
    return reviews;
  }),

  // ── 11. Triage communications (autonomous) ──────────────────────────────────
  triageCommunications: aiProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            id: z.string(),
            type: z.string(),
            subject: z.string(),
            preview: z.string(),
            sender: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const openai = getOpenAI();
      const userId = ctx.user.id;

      if (input.items.length === 0) return { triaged: [] };

      const completion = await openai.chat.completions.create({
        model: getModelForTask("analyse"),
        messages: [
          { role: "system", content: VICTORIA_SYSTEM_PROMPT },
          {
            role: "user",
            content: `Triage these ${input.items.length} communications for your executive. For each, provide: priority (urgent/high/normal/low), recommended action (respond/delegate/archive/review), and a one-line summary.\n\nCommunications:\n${input.items.map((item, i) => `${i + 1}. [${item.type}] From: ${item.sender ?? "Unknown"} | Subject: ${item.subject} | Preview: ${item.preview.slice(0, 200)}`).join("\n")}\n\nReturn JSON: { "triaged": [{ "id": string, "priority": string, "action": string, "summary": string }] }`,
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 800,
        temperature: 0.3,
      });

      void logAiUsage(
        userId,
        "victoria.triageCommunications",
        completion.model,
        completion.usage ?? null
      );

      let result: {
        triaged: Array<{
          id: string;
          priority: string;
          action: string;
          summary: string;
        }>;
      } = { triaged: [] };
      try {
        result = JSON.parse(
          completion.choices[0]?.message?.content ?? "{}"
        ) as typeof result;
      } catch {
        /* fallback */
      }

      await logVictoriaAction(
        userId,
        "communications_triaged",
        `Triaged ${input.items.length} communications`,
        `Victoria triaged ${input.items.length} incoming items`,
        undefined,
        undefined,
        true,
        { itemCount: input.items.length }
      );

      return result;
    }),

  // ── 12. Identify workflow automation opportunities ───────────────────────────
  identifyAutomationOpportunities: aiProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.user.id;
    const openai = getOpenAI();
    const userContext = await buildUserContext(userId);

    const completion = await openai.chat.completions.create({
      model: getModelForTask("analyse"),
      messages: [
        { role: "system", content: VICTORIA_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Based on the executive's current workload, identify the top 3 workflow automation opportunities. Look for repetitive tasks, manual processes, and time-consuming activities that could be automated.\n\nContext:\n${userContext}\n\nReturn JSON: { "opportunities": [{ "title": string, "description": string, "estimatedTimeSaving": string, "automationType": string, "priority": "high"|"medium"|"low" }] }`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 600,
      temperature: 0.5,
    });

    void logAiUsage(
      userId,
      "victoria.identifyAutomation",
      completion.model,
      completion.usage ?? null
    );

    let result: {
      opportunities: Array<{
        title: string;
        description: string;
        estimatedTimeSaving: string;
        automationType: string;
        priority: string;
      }>;
    } = { opportunities: [] };
    try {
      result = JSON.parse(
        completion.choices[0]?.message?.content ?? "{}"
      ) as typeof result;
    } catch {
      /* fallback */
    }

    await logVictoriaAction(
      userId,
      "automation_identified",
      `Identified ${result.opportunities?.length ?? 0} automation opportunities`,
      undefined,
      undefined,
      undefined,
      true
    );

    return result;
  }),

  // ── 13. Get Victoria's stats summary ────────────────────────────────────────
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [actionCount, approvedReports, pendingReports, completedSmeReviews] =
      await Promise.all([
        db
          .select({ count: count() })
          .from(victoriaActions)
          .where(
            and(
              eq(victoriaActions.userId, userId),
              gte(victoriaActions.createdAt, thirtyDaysAgo)
            )
          ),
        db
          .select({ count: count() })
          .from(agentDailyReports)
          .where(
            and(
              eq(agentDailyReports.userId, userId),
              eq(agentDailyReports.approvalStatus, "approved"),
              gte(agentDailyReports.createdAt, thirtyDaysAgo)
            )
          ),
        db
          .select({ count: count() })
          .from(agentDailyReports)
          .where(
            and(
              eq(agentDailyReports.userId, userId),
              eq(agentDailyReports.approvalStatus, "pending")
            )
          ),
        db
          .select({ count: count() })
          .from(smeReviewTriggers)
          .where(
            and(
              eq(smeReviewTriggers.userId, userId),
              eq(smeReviewTriggers.status, "completed"),
              gte(smeReviewTriggers.createdAt, thirtyDaysAgo)
            )
          ),
      ]);

    return {
      autonomousActionsLast30Days: actionCount[0]?.count ?? 0,
      agentReportsApprovedLast30Days: approvedReports[0]?.count ?? 0,
      agentReportsPendingApproval: pendingReports[0]?.count ?? 0,
      smeReviewsCompletedLast30Days: completedSmeReviews[0]?.count ?? 0,
    };
  }),

  // ─── DT-COS-01: Digital Twin Integration ─────────────────────────────────────
  getDigitalTwinContext: protectedProcedure.query(async ({ ctx }) => {
    const [profile] = await db
      .select()
      .from(digitalTwinProfile)
      .where(eq(digitalTwinProfile.userId, ctx.user.id))
      .limit(1);
    const [cogModel] = await db
      .select()
      .from(digitalTwinCognitiveModel)
      .where(eq(digitalTwinCognitiveModel.userId, ctx.user.id))
      .limit(1);
    return {
      profile: profile ?? null,
      cognitiveModel: cogModel ?? null,
      autonomyLevel: profile
        ? Math.round(
            ((profile.automationPreference as number | null) ?? 5) * 10
          )
        : 50,
      calibrationScore:
        (profile?.questionnaireCompletion as number | null) ?? 0,
    };
  }),

  // ─── DT-COS-02: Quality Control Engine ───────────────────────────────────────
  runQualityCheck: aiProcedure
    .input(
      z.object({
        checkType: z.enum([
          "agent_output",
          "document",
          "project",
          "email_draft",
          "sme_review",
          "task_output",
        ]),
        targetId: z.string().optional(),
        targetTitle: z.string(),
        content: z.string().min(10).max(5000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const openai = getOpenAI();
      const completion = await openai.chat.completions.create({
        model: getModelForTask("analyse"),
        messages: [
          {
            role: "system",
            content: `You are Victoria, Chief of Staff and Quality Controller for CEPHO.AI. Evaluate the quality of this ${input.checkType} and return a rigorous assessment.`,
          },
          {
            role: "user",
            content: `Quality check for: ${input.targetTitle}\n\nContent:\n${input.content}\n\nReturn JSON: { "score": number (0-100), "grade": "A"|"B"|"C"|"D"|"F", "passed": boolean, "issues": [{"category": string, "description": string}], "recommendations": [string], "auto_fix_possible": boolean, "fix_description": string|null }`,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      });
      const result = JSON.parse(
        completion.choices[0]?.message?.content ?? "{}"
      ) as {
        score?: number;
        grade?: string;
        passed?: boolean;
        issues?: { category: string; description: string }[];
        recommendations?: string[];
        auto_fix_possible?: boolean;
        fix_description?: string | null;
      };
      const [qcCheck] = await db
        .insert(victoriaQcChecks)
        .values({
          userId: ctx.user.id,
          checkType: input.checkType,
          targetId: input.targetId,
          targetTitle: input.targetTitle,
          score: result.score ?? 0,
          grade: result.grade ?? "F",
          passed: result.passed ?? false,
          issues: result.issues ?? [],
          recommendations: result.recommendations ?? [],
          autoFixed: false,
          fixDescription: result.fix_description ?? null,
        })
        .returning();
      await logVictoriaAction(
        ctx.user.id,
        "qc_check",
        `QC check on ${input.checkType}: ${input.targetTitle} — Grade ${result.grade ?? "?"} (${result.score ?? 0}/100)`,
        result.passed ? "approved" : "flagged",
        undefined,
        undefined,
        true,
        { checkId: qcCheck.id, score: result.score }
      );
      void logAiUsage(
        ctx.user.id,
        "victoria.runQualityCheck",
        getModelForTask("analyse"),
        completion.usage ?? null
      );
      return {
        id: qcCheck.id,
        score: result.score ?? 0,
        grade: result.grade ?? "F",
        passed: result.passed ?? false,
        issues: result.issues ?? [],
        recommendations: result.recommendations ?? [],
        autoFixPossible: result.auto_fix_possible ?? false,
        fixDescription: result.fix_description ?? null,
      };
    }),

  getQcChecks: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        checkType: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const conditions = [eq(victoriaQcChecks.userId, ctx.user.id)];
      if (input.checkType)
        conditions.push(
          eq(victoriaQcChecks.checkType, input.checkType as string)
        );
      return db
        .select()
        .from(victoriaQcChecks)
        .where(and(...conditions))
        .orderBy(desc(victoriaQcChecks.checkedAt))
        .limit(input.limit);
    }),

  // ─── DT-COS-04: Autonomous Project Review ────────────────────────────────────
  reviewProjects: aiProcedure.mutation(async ({ ctx }) => {
    const openai = getOpenAI();
    const activeProjects = await db
      .select()
      .from(projects)
      .where(
        and(eq(projects.userId, ctx.user.id), eq(projects.status, "active"))
      )
      .limit(20);
    if (activeProjects.length === 0)
      return {
        reviewed: 0,
        flagged: 0,
        message: "No active projects to review.",
        reviews: [],
      };
    const projectSummary = activeProjects
      .map(
        (p, i) =>
          `${i + 1}. ${p.name} (${p.status}) — ${(p.description ?? "").slice(0, 150)}`
      )
      .join("\n");
    const completion = await openai.chat.completions.create({
      model: getModelForTask("analyse"),
      messages: [
        {
          role: "system",
          content: `You are Victoria, Chief of Staff. Review these active projects and identify risks, stalled projects, and recommended actions.`,
        },
        {
          role: "user",
          content: `Active Projects:\n${projectSummary}\n\nReturn JSON: { "reviews": [{ "projectName": string, "riskLevel": "low"|"medium"|"high"|"critical", "status": "on_track"|"at_risk"|"stalled"|"needs_attention", "summary": string, "recommended_action": string }] }`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });
    const result = JSON.parse(
      completion.choices[0]?.message?.content ?? "{}"
    ) as {
      reviews?: {
        projectName: string;
        riskLevel: string;
        status: string;
        summary: string;
        recommended_action: string;
      }[];
    };
    const reviews = result.reviews ?? [];
    const flagged = reviews.filter(
      r => r.riskLevel === "high" || r.riskLevel === "critical"
    ).length;
    for (const review of reviews.filter(r => r.riskLevel !== "low")) {
      await db
        .insert(victoriaQcChecks)
        .values({
          userId: ctx.user.id,
          checkType: "project",
          targetTitle: review.projectName,
          score:
            review.riskLevel === "critical"
              ? 20
              : review.riskLevel === "high"
                ? 40
                : 65,
          grade:
            review.riskLevel === "critical"
              ? "F"
              : review.riskLevel === "high"
                ? "D"
                : "C",
          passed: review.riskLevel === "low" || review.riskLevel === "medium",
          issues: [{ category: "project_risk", description: review.summary }],
          recommendations: [review.recommended_action],
        });
    }
    await logVictoriaAction(
      ctx.user.id,
      "project_review",
      `Reviewed ${activeProjects.length} active projects — ${flagged} flagged for attention`,
      flagged > 0 ? "flagged" : "approved",
      undefined,
      undefined,
      true,
      { reviewed: activeProjects.length, flagged, reviews }
    );
    void logAiUsage(
      ctx.user.id,
      "victoria.reviewProjects",
      getModelForTask("analyse"),
      completion.usage ?? null
    );
    return { reviewed: activeProjects.length, flagged, reviews };
  }),

  // ─── DT-COS-07: Autonomous Document Cleanup ──────────────────────────────────
  reviewDocuments: aiProcedure.mutation(async ({ ctx }) => {
    const openai = getOpenAI();
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const docs = await db
      .select()
      .from(libraryDocuments)
      .where(eq(libraryDocuments.userId, ctx.user.id))
      .orderBy(desc(libraryDocuments.createdAt))
      .limit(30);
    if (docs.length === 0)
      return {
        reviewed: 0,
        flagged: 0,
        message: "No documents to review.",
        flaggedDocs: [],
        summary: "",
      };
    const staleDocs = docs.filter(d => d.createdAt < ninetyDaysAgo);
    const docSummary = docs
      .slice(0, 15)
      .map(
        (d, i) =>
          `${i + 1}. "${d.name}" (${d.type ?? "unknown"}, created ${d.createdAt.toISOString().slice(0, 10)})`
      )
      .join("\n");
    const completion = await openai.chat.completions.create({
      model: getModelForTask("analyse"),
      messages: [
        {
          role: "system",
          content: `You are Victoria, Chief of Staff. Review this document library and identify documents that should be archived, updated, or removed.`,
        },
        {
          role: "user",
          content: `Documents:\n${docSummary}\n\nReturn JSON: { "flagged": [{ "name": string, "reason": "stale"|"duplicate"|"low_quality"|"needs_update", "action": "archive"|"update"|"review" }], "summary": string }`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });
    const result = JSON.parse(
      completion.choices[0]?.message?.content ?? "{}"
    ) as {
      flagged?: { name: string; reason: string; action: string }[];
      summary?: string;
    };
    const flagged = result.flagged ?? [];
    if (flagged.length > 0) {
      await db
        .insert(victoriaQcChecks)
        .values({
          userId: ctx.user.id,
          checkType: "document",
          targetTitle: `Document Library Review (${docs.length} docs)`,
          score: Math.max(0, 100 - flagged.length * 10),
          grade:
            flagged.length === 0
              ? "A"
              : flagged.length < 3
                ? "B"
                : flagged.length < 6
                  ? "C"
                  : "D",
          passed: flagged.length < 5,
          issues: flagged.map(f => ({
            category: f.reason,
            description: `${f.name}: ${f.action}`,
          })),
          recommendations: [result.summary ?? "Review flagged documents"],
        });
    }
    await logVictoriaAction(
      ctx.user.id,
      "document_review",
      `Reviewed ${docs.length} documents — ${flagged.length} flagged (${staleDocs.length} stale)`,
      "approved",
      undefined,
      undefined,
      true,
      {
        reviewed: docs.length,
        flagged: flagged.length,
        stale: staleDocs.length,
      }
    );
    void logAiUsage(
      ctx.user.id,
      "victoria.reviewDocuments",
      getModelForTask("analyse"),
      completion.usage ?? null
    );
    return {
      reviewed: docs.length,
      flagged: flagged.length,
      stale: staleDocs.length,
      flaggedDocs: flagged,
      summary: result.summary ?? "",
    };
  }),

  // ─── DT-COS-08: Autonomous Task Delegation ───────────────────────────────────
  delegateTasks: aiProcedure.mutation(async ({ ctx }) => {
    const openai = getOpenAI();
    const unassigned = await db
      .select()
      .from(tasks)
      .where(
        and(eq(tasks.userId, ctx.user.id), sql`${tasks.assignedTo} IS NULL`)
      )
      .limit(20);
    if (unassigned.length === 0)
      return {
        delegated: 0,
        message: "No unassigned tasks found.",
        assignments: [],
      };
    const taskList = unassigned
      .map(
        (t, i) =>
          `${i + 1}. "${t.title}" — ${(t.description ?? "").slice(0, 100)} [Priority: ${t.priority ?? "normal"}]`
      )
      .join("\n");
    const completion = await openai.chat.completions.create({
      model: getModelForTask("analyse"),
      messages: [
        {
          role: "system",
          content: `You are Victoria, Chief of Staff. Assign each unassigned task to the most appropriate AI agent from: Chief Marketing Officer, Chief Financial Officer, Chief Technology Officer, Chief Operations Officer, Head of Sales, Head of Legal, Head of HR, Head of Product, Head of Data, Head of Customer Success.`,
        },
        {
          role: "user",
          content: `Unassigned tasks:\n${taskList}\n\nReturn JSON: { "assignments": [{ "taskTitle": string, "assignedTo": string, "rationale": string }] }`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });
    const result = JSON.parse(
      completion.choices[0]?.message?.content ?? "{}"
    ) as {
      assignments?: {
        taskTitle: string;
        assignedTo: string;
        rationale: string;
      }[];
    };
    const assignments = result.assignments ?? [];
    let delegated = 0;
    for (const assignment of assignments) {
      const task = unassigned.find(t => t.title === assignment.taskTitle);
      if (task) {
        await db
          .update(tasks)
          .set({ assignedTo: assignment.assignedTo, updatedAt: new Date() })
          .where(eq(tasks.id, task.id));
        delegated++;
      }
    }
    await logVictoriaAction(
      ctx.user.id,
      "task_delegation",
      `Delegated ${delegated} of ${unassigned.length} unassigned tasks to AI agents`,
      "approved",
      undefined,
      undefined,
      true,
      { delegated, total: unassigned.length, assignments }
    );
    void logAiUsage(
      ctx.user.id,
      "victoria.delegateTasks",
      getModelForTask("analyse"),
      completion.usage ?? null
    );
    return { delegated, total: unassigned.length, assignments };
  }),

  // ─── DT-COS-06: Autonomous Meeting Pre-Briefs ────────────────────────────────
  prepareMeetingBriefs: aiProcedure.mutation(async ({ ctx }) => {
    const openai = getOpenAI();
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const upcomingEvents = await db
      .select()
      .from(calendarEventsCache)
      .where(
        and(
          eq(calendarEventsCache.userId, ctx.user.id),
          gte(calendarEventsCache.startTime, now),
          lt(calendarEventsCache.startTime, tomorrow)
        )
      )
      .orderBy(calendarEventsCache.startTime)
      .limit(10);
    if (upcomingEvents.length === 0)
      return {
        prepared: 0,
        message: "No upcoming meetings in the next 24 hours.",
        briefs: [],
      };
    const eventList = upcomingEvents
      .map(
        (e, i) =>
          `${i + 1}. "${e.title}" at ${e.startTime.toISOString().slice(11, 16)} — ${e.location ?? "No location"}`
      )
      .join("\n");
    const completion = await openai.chat.completions.create({
      model: getModelForTask("generate"),
      messages: [
        {
          role: "system",
          content: `You are Victoria, Chief of Staff. Prepare concise pre-briefs for each upcoming meeting.`,
        },
        {
          role: "user",
          content: `Upcoming meetings:\n${eventList}\n\nReturn JSON: { "briefs": [{ "meetingTitle": string, "objectives": string, "preparation": string, "talkingPoints": [string] }] }`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });
    const result = JSON.parse(
      completion.choices[0]?.message?.content ?? "{}"
    ) as {
      briefs?: {
        meetingTitle: string;
        objectives: string;
        preparation: string;
        talkingPoints: string[];
      }[];
    };
    await logVictoriaAction(
      ctx.user.id,
      "meeting_pre_brief",
      `Prepared pre-briefs for ${upcomingEvents.length} upcoming meetings`,
      "approved",
      undefined,
      undefined,
      true,
      { prepared: upcomingEvents.length, briefs: result.briefs ?? [] }
    );
    void logAiUsage(
      ctx.user.id,
      "victoria.prepareMeetingBriefs",
      getModelForTask("generate"),
      completion.usage ?? null
    );
    return { prepared: upcomingEvents.length, briefs: result.briefs ?? [] };
  }),

  // ─── DT-COS-10: Skills Framework ─────────────────────────────────────────────
  getSkills: protectedProcedure.query(async ({ ctx }) => {
    return db
      .select()
      .from(victoriaSkills)
      .where(eq(victoriaSkills.userId, ctx.user.id))
      .orderBy(desc(victoriaSkills.createdAt));
  }),

  createSkill: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(200),
        category: z.enum([
          "project_review",
          "email",
          "calendar",
          "document",
          "delegation",
          "qc",
          "reporting",
          "communication",
        ]),
        description: z.string().optional(),
        trigger: z.enum(["manual", "daily", "hourly", "on_event"]),
        steps: z.array(
          z.object({
            order: z.number(),
            action: z.string(),
            details: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [skill] = await db
        .insert(victoriaSkills)
        .values({ userId: ctx.user.id, ...input })
        .returning();
      return skill;
    }),

  seedDefaultSkills: protectedProcedure.mutation(async ({ ctx }) => {
    const defaultSkills = [
      {
        name: "Daily Project Review",
        category: "project_review" as const,
        trigger: "daily" as const,
        description: "Review all active projects for risks and blockers",
        steps: [
          { order: 1, action: "Fetch active projects" },
          { order: 2, action: "AI risk assessment" },
          { order: 3, action: "Log QC checks" },
          { order: 4, action: "Notify on critical risks" },
        ],
      },
      {
        name: "Email Triage",
        category: "email" as const,
        trigger: "hourly" as const,
        description: "Triage incoming emails and draft responses",
        steps: [
          { order: 1, action: "Fetch unread emails" },
          { order: 2, action: "Classify priority" },
          { order: 3, action: "Draft responses" },
          { order: 4, action: "Archive low priority" },
        ],
      },
      {
        name: "Document Quality Check",
        category: "document" as const,
        trigger: "daily" as const,
        description:
          "Review document library for stale or low-quality documents",
        steps: [
          { order: 1, action: "Fetch recent documents" },
          { order: 2, action: "Flag stale documents" },
          { order: 3, action: "AI quality assessment" },
          { order: 4, action: "Generate cleanup report" },
        ],
      },
      {
        name: "Task Delegation",
        category: "delegation" as const,
        trigger: "daily" as const,
        description: "Assign unassigned tasks to the best-suited AI agent",
        steps: [
          { order: 1, action: "Find unassigned tasks" },
          { order: 2, action: "Match to agents" },
          { order: 3, action: "Update assignments" },
          { order: 4, action: "Log delegations" },
        ],
      },
      {
        name: "Meeting Pre-Brief",
        category: "calendar" as const,
        trigger: "daily" as const,
        description: "Prepare pre-briefs for all meetings in the next 24 hours",
        steps: [
          { order: 1, action: "Fetch upcoming events" },
          { order: 2, action: "Generate pre-briefs" },
          { order: 3, action: "Deliver to briefing" },
        ],
      },
    ];
    let seeded = 0;
    for (const skill of defaultSkills) {
      const existing = await db
        .select()
        .from(victoriaSkills)
        .where(
          and(
            eq(victoriaSkills.userId, ctx.user.id),
            eq(victoriaSkills.name, skill.name)
          )
        )
        .limit(1);
      if (existing.length === 0) {
        await db
          .insert(victoriaSkills)
          .values({ userId: ctx.user.id, ...skill });
        seeded++;
      }
    }
    return { seeded };
  }),

  // ─── DT-COS-GAP-2A: Digital Twin Behavioral Simulation — predictUserAction ────
  /**
   * Predicts the most likely action a user would take given a scenario,
   * using their Digital Twin profile and cognitive model.
   * Gap 2 from Appendix J: predictUserAction
   */
  predictUserAction: aiProcedure
    .input(
      z.object({
        scenario: z.string().min(10).max(2000).describe("Describe the situation or decision point"),
        options: z.array(z.string()).min(2).max(10).describe("List of possible actions the user could take"),
        context: z.string().optional().describe("Additional context about the scenario"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Fetch Digital Twin data
      const [profile, cognitiveModel] = await Promise.all([
        db
          .select()
          .from(digitalTwinProfile)
          .where(eq(digitalTwinProfile.userId, userId))
          .limit(1),
        db
          .select()
          .from(digitalTwinCognitiveModel)
          .where(eq(digitalTwinCognitiveModel.userId, userId))
          .limit(1),
      ]);

      const dtProfile = profile[0];
      const dtCognitive = cognitiveModel[0];

      const profileSummary = dtProfile
        ? `Risk tolerance: ${dtProfile.ambiguityTolerance ?? "unknown"}/10, Automation preference: ${dtProfile.automationPreference ?? "unknown"}/10, AI belief: ${dtProfile.aiBeliefLevel ?? "unknown"}/10, Structure preference: ${dtProfile.structurePreference ?? "unknown"}/10, Pivot comfort: ${dtProfile.pivotComfort ?? "unknown"}/10`
        : "No Digital Twin profile available";

      const cognitiveSummary = dtCognitive
        ? `Risk tolerance: ${dtCognitive.riskTolerance}, Decision heuristics: ${(dtCognitive.decisionHeuristics ?? []).join(", ")}, Strategic priorities: ${(dtCognitive.strategicPriorities ?? []).map((p: { priority: string; weight: number }) => p.priority).join(", ")}, Values: ${(dtCognitive.values ?? []).join(", ")}`
        : "No cognitive model available";

      const openai = getOpenAI();
      const model = getModelForTask("analyse");

      const completion = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: `${VICTORIA_SYSTEM_PROMPT}\n\nYou are performing a Digital Twin behavioral simulation. Based on the user's Digital Twin profile, predict which action they are most likely to take.`,
          },
          {
            role: "user",
            content: `## User Digital Twin Profile\n${profileSummary}\n\n## Cognitive Model\n${cognitiveSummary}\n\n## Scenario\n${input.scenario}\n\n## Possible Actions\n${input.options.map((o, i) => `${i + 1}. ${o}`).join("\n")}\n\n${input.context ? `## Additional Context\n${input.context}` : ""}\n\nBased on this user's Digital Twin profile, which action are they MOST LIKELY to take? Respond with JSON: { "predictedAction": "<exact option text>", "confidence": <0.0-1.0>, "reasoning": "<explanation>", "alternativeAction": "<second most likely option>", "alternativeConfidence": <0.0-1.0> }`,
          },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      });

      void logAiUsage(
        userId,
        "victoria.predictUserAction",
        completion.model,
        completion.usage ?? null
      );

      const result = JSON.parse(completion.choices[0].message.content ?? "{}") as {
        predictedAction: string;
        confidence: number;
        reasoning: string;
        alternativeAction: string;
        alternativeConfidence: number;
      };

      await logVictoriaAction(
        userId,
        "digital_twin_prediction",
        "Predicted user action via Digital Twin simulation",
        `Scenario: ${input.scenario.substring(0, 100)}... → Predicted: ${result.predictedAction} (${Math.round((result.confidence ?? 0) * 100)}% confidence)`,
        "digital_twin",
        undefined,
        true,
        { scenario: input.scenario, options: input.options, result }
      );

      return {
        predictedAction: result.predictedAction,
        confidence: result.confidence,
        reasoning: result.reasoning,
        alternativeAction: result.alternativeAction,
        alternativeConfidence: result.alternativeConfidence,
        profileUsed: !!dtProfile,
        cognitiveModelUsed: !!dtCognitive,
      };
    }),

  // ─── DT-COS-GAP-2B: Digital Twin Behavioral Simulation — simulateActionOutcome ─
  /**
   * Simulates the likely outcome of a proposed action given the user's Digital Twin
   * profile, current context, and strategic priorities.
   * Gap 2 from Appendix J: simulateActionOutcome
   */
  simulateActionOutcome: aiProcedure
    .input(
      z.object({
        action: z.string().min(5).max(1000).describe("The action to simulate"),
        timeHorizon: z.enum(["immediate", "short_term", "medium_term", "long_term"]).default("medium_term"),
        context: z.string().optional().describe("Additional context about the current situation"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Fetch Digital Twin data and recent context
      const [profile, cognitiveModel, recentTasks, activeProjects] = await Promise.all([
        db
          .select()
          .from(digitalTwinProfile)
          .where(eq(digitalTwinProfile.userId, userId))
          .limit(1),
        db
          .select()
          .from(digitalTwinCognitiveModel)
          .where(eq(digitalTwinCognitiveModel.userId, userId))
          .limit(1),
        db
          .select({ title: tasks.title, status: tasks.status, priority: tasks.priority })
          .from(tasks)
          .where(eq(tasks.userId, userId))
          .orderBy(desc(tasks.createdAt))
          .limit(10),
        db
          .select({ name: projects.name, status: projects.status })
          .from(projects)
          .where(eq(projects.userId, userId))
          .orderBy(desc(projects.createdAt))
          .limit(5),
      ]);

      const dtProfile = profile[0];
      const dtCognitive = cognitiveModel[0];

      const timeHorizonLabel = {
        immediate: "next 24 hours",
        short_term: "next 1-4 weeks",
        medium_term: "next 1-6 months",
        long_term: "next 6-24 months",
      }[input.timeHorizon];

      const openai = getOpenAI();
      const model = getModelForTask("analyse");

      const completion = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: `${VICTORIA_SYSTEM_PROMPT}\n\nYou are performing a Digital Twin outcome simulation. Based on the user's profile and context, simulate the likely outcomes of a proposed action.`,
          },
          {
            role: "user",
            content: `## User Profile\nRisk tolerance: ${dtProfile?.ambiguityTolerance ?? "unknown"}/10\nAI belief: ${dtProfile?.aiBeliefLevel ?? "unknown"}/10\nStrategic priorities: ${(dtCognitive?.strategicPriorities ?? []).map((p: { priority: string; weight: number }) => p.priority).join(", ") || "not set"}\nValues: ${(dtCognitive?.values ?? []).join(", ") || "not set"}\n\n## Current Context\nActive projects: ${activeProjects.map(p => p.name).join(", ") || "none"}\nRecent tasks: ${recentTasks.slice(0, 5).map(t => t.title).join(", ") || "none"}\n${input.context ? `\nAdditional context: ${input.context}` : ""}\n\n## Proposed Action\n${input.action}\n\n## Time Horizon\n${timeHorizonLabel}\n\nSimulate the likely outcomes of this action. Respond with JSON: { "primaryOutcome": "<most likely result>", "probability": <0.0-1.0>, "positiveConsequences": ["<consequence1>", ...], "negativeConsequences": ["<risk1>", ...], "requiredResources": ["<resource1>", ...], "alignmentWithProfile": <0.0-1.0>, "recommendation": "proceed" | "proceed_with_caution" | "reconsider" | "avoid", "recommendationReason": "<why>" }`,
          },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      });

      void logAiUsage(
        userId,
        "victoria.simulateActionOutcome",
        completion.model,
        completion.usage ?? null
      );

      const result = JSON.parse(completion.choices[0].message.content ?? "{}") as {
        primaryOutcome: string;
        probability: number;
        positiveConsequences: string[];
        negativeConsequences: string[];
        requiredResources: string[];
        alignmentWithProfile: number;
        recommendation: string;
        recommendationReason: string;
      };

      await logVictoriaAction(
        userId,
        "digital_twin_simulation",
        "Simulated action outcome via Digital Twin",
        `Action: ${input.action.substring(0, 100)}... → ${result.recommendation} (${Math.round((result.probability ?? 0) * 100)}% probability)`,
        "digital_twin",
        undefined,
        true,
        { action: input.action, timeHorizon: input.timeHorizon, result }
      );

      return {
        primaryOutcome: result.primaryOutcome,
        probability: result.probability,
        positiveConsequences: result.positiveConsequences ?? [],
        negativeConsequences: result.negativeConsequences ?? [],
        requiredResources: result.requiredResources ?? [],
        alignmentWithProfile: result.alignmentWithProfile,
        recommendation: result.recommendation,
        recommendationReason: result.recommendationReason,
        timeHorizon: input.timeHorizon,
        profileUsed: !!dtProfile,
        cognitiveModelUsed: !!dtCognitive,
      };
    }),

  // ─── DT-COS-12: Sub-Phase Task Tracker ───────────────────────────────────────
  getSubphaseTasks: protectedProcedure.query(async () => {
    return db.select().from(subphaseTasks).orderBy(subphaseTasks.taskId);
  }),

  updateSubphaseTask: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
        status: z.enum(["not_started", "in_progress", "complete", "blocked"]),
        commitSha: z.string().optional(),
        evidence: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await db
        .update(subphaseTasks)
        .set({
          status: input.status,
          commitSha: input.commitSha,
          evidence: input.evidence,
          completedAt: input.status === "complete" ? new Date() : undefined,
          startedAt: input.status === "in_progress" ? new Date() : undefined,
          updatedAt: new Date(),
        })
        .where(eq(subphaseTasks.taskId, input.taskId));
      return { success: true };
    }),
});
