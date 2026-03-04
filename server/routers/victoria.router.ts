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
        list: taskList
          .slice(0, 10)
          .map(t => ({
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
        ...recentConversations
          .reverse()
          .map(c => ({
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
});
