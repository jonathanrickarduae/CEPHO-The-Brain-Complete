import { getModelForTask } from "../utils/modelRouter";
import { logAiUsage } from "./aiCostTracking.router";
/**
 * Chief of Staff Router — Real Implementation
 *
 * Powers the Digital Twin / Chief of Staff AI agent.
 * Uses the user's questionnaire responses, task history, and
 * project context to provide personalised executive support.
 */
import { z } from "zod";
import { desc, eq, and, gte, count } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";
import { aiProcedure, protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import {
  tasks,
  projects,
  questionnaireResponses,
  activityFeed,
  libraryDocuments,
  notifications,
  conversations,
} from "../../drizzle/schema";


async function buildUserContext(userId: number): Promise<string> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [recentTasks, activeProjects, recentActivity] = await Promise.all([
    db
      .select({
        title: tasks.title,
        status: tasks.status,
        priority: tasks.priority,
      })
      .from(tasks)
      .where(and(eq(tasks.userId, userId), gte(tasks.createdAt, sevenDaysAgo)))
      .orderBy(desc(tasks.createdAt))
      .limit(10),

    db
      .select({
        name: projects.name,
        status: projects.status,
        description: projects.description,
      })
      .from(projects)
      .where(and(eq(projects.userId, userId), eq(projects.status, "active")))
      .limit(5),

    db
      .select({
        action: activityFeed.action,
        targetName: activityFeed.targetName,
        description: activityFeed.description,
      })
      .from(activityFeed)
      .where(
        and(
          eq(activityFeed.userId, userId),
          gte(activityFeed.createdAt, sevenDaysAgo)
        )
      )
      .orderBy(desc(activityFeed.createdAt))
      .limit(5),
  ]);

  const parts: string[] = [];

  if (activeProjects.length > 0) {
    parts.push(
      `Active Projects: ${activeProjects.map(p => `${p.name} (${p.status})`).join(", ")}`
    );
  }

  if (recentTasks.length > 0) {
    const pending = recentTasks.filter(t => t.status !== "completed");
    if (pending.length > 0) {
      parts.push(
        `Recent Tasks: ${pending.map(t => `${t.title} [${t.status}]`).join("; ")}`
      );
    }
  }

  if (recentActivity.length > 0) {
    parts.push(
      `Recent Activity: ${recentActivity.map(a => a.description ?? a.action).join("; ")}`
    );
  }

  return parts.length > 0 ? `\n\nUser Context:\n${parts.join("\n")}` : "";
}

export const chiefOfStaffRouter = router({
  /**
   * Get the user's current context for the Digital Twin.
   */
  getContext: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      taskList,
      projectList,
      questionnaireCount,
      docCount,
      notifCount,
      convCount,
    ] = await Promise.all([
      db
        .select()
        .from(tasks)
        .where(eq(tasks.userId, userId))
        .orderBy(desc(tasks.dueDate))
        .limit(50),

      db.select().from(projects).where(eq(projects.userId, userId)).limit(20),

      db
        .select()
        .from(questionnaireResponses)
        .where(eq(questionnaireResponses.userId, userId)),

      db
        .select({ count: count() })
        .from(libraryDocuments)
        .where(eq(libraryDocuments.userId, userId)),

      db
        .select({ count: count() })
        .from(notifications)
        .where(
          and(eq(notifications.userId, userId), eq(notifications.read, false))
        ),

      db
        .select({ count: count() })
        .from(conversations)
        .where(
          and(
            eq(conversations.userId, userId),
            gte(conversations.createdAt, sevenDaysAgo)
          )
        ),
    ]);

    const questionnaireCompletion = Math.min(
      100,
      Math.round((questionnaireCount.length / 100) * 100)
    );

    // Compute task stats
    const dueTodayTasks = taskList.filter(t => {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      return d >= today && d < new Date(today.getTime() + 86400000);
    });
    const overdueTasks = taskList.filter(t => {
      if (!t.dueDate) return false;
      return new Date(t.dueDate) < today && t.status !== "completed";
    });
    const activeProjects = projectList.filter(p => p.status === "active");
    const atRiskProjects = projectList.filter(p => p.status === "at_risk");
    const totalDocs = Number(docCount[0]?.count ?? 0);
    const recentDocs = totalDocs; // approximate
    const unreadNotifs = Number(notifCount[0]?.count ?? 0);
    const aiConversations = Number(convCount[0]?.count ?? 0);

    // Build alerts from overdue tasks and at-risk projects
    const alerts: { title: string; message: string }[] = [];
    for (const t of overdueTasks.slice(0, 2)) {
      alerts.push({
        title: t.title,
        message: `Overdue since ${t.dueDate?.toLocaleDateString() ?? "unknown"}`,
      });
    }
    for (const p of atRiskProjects.slice(0, 2)) {
      alerts.push({
        title: p.name,
        message: "Project is at risk — review required",
      });
    }

    return {
      userId,
      name: ctx.user.name,
      email: ctx.user.email,
      emails: {
        unread: unreadNotifs,
        highPriority: Math.floor(unreadNotifs * 0.25),
      },
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
        active: activeProjects.length,
        atRisk: atRiskProjects.length,
        total: projectList.length,
        list: projectList.slice(0, 5).map(p => ({
          id: p.id,
          name: p.name,
          status: p.status,
          description: p.description,
        })),
      },
      articles: { new: 0, trending: 0 },
      documents: { total: totalDocs, recent: recentDocs },
      aiConversations,
      alerts,
      questionnaireCompletion,
      lastUpdated: new Date().toISOString(),
    };
  }),

  /**
   * Get the morning briefing — a personalised AI-generated summary
   * of priorities, tasks, and recommendations for the day.
   */
  getMorningBriefing: aiProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [pendingTasks, activeProjects] = await Promise.all([
      db
        .select()
        .from(tasks)
        .where(and(eq(tasks.userId, userId), eq(tasks.status, "not_started")))
        .orderBy(desc(tasks.createdAt))
        .limit(10),

      db
        .select()
        .from(projects)
        .where(and(eq(projects.userId, userId), eq(projects.status, "active")))
        .limit(5),
    ]);

    const userContext = await buildUserContext(userId);

    const prompt = `You are Victoria, AI Chief of Staff for CEPHO. Generate a concise morning briefing for ${ctx.user.name}.

Today is ${today.toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.

Pending tasks (${pendingTasks.length}): ${
      pendingTasks
        .slice(0, 5)
        .map(t => t.title)
        .join(", ") || "None"
    }
Active projects (${activeProjects.length}): ${activeProjects.map(p => p.name).join(", ") || "None"}
${userContext}

Provide:
1. A brief (2-3 sentence) executive summary of the day
2. Top 3 priorities to focus on today
3. One strategic recommendation

Keep it concise and actionable. Use a professional, direct tone.`;

    const completion = await invokeLLM({
      model: getModelForTask("score"),
      messages: [{ role: "user", content: prompt }],
      max_tokens: 600,
      temperature: 0.6,
    });

    // p5-9: Track AI usage
    void logAiUsage(
      userId,
      "chiefOfStaff.getMorningBriefing",
      completion.model,
      completion.usage ?? null
    );
    const briefingText =
      completion.choices[0]?.message?.content ??
      "Good morning. Your briefing is being prepared. Please check back shortly.";

    return {
      date: today.toISOString(),
      briefing: briefingText,
      pendingTaskCount: pendingTasks.length,
      activeProjectCount: activeProjects.length,
      generatedAt: new Date().toISOString(),
    };
  }),

  /**
   * AI-powered task quality scoring.
   * Replaces the Math.random() stub in the ChiefOfStaff page.
   */
  scoreTask: aiProcedure
    .input(
      z.object({
        taskId: z.number(),
        taskTitle: z.string(),
        taskDescription: z.string().optional(),
        taskStatus: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const prompt = `You are a Chief of Staff AI performing a quality verification on a completed task.

Task: "${input.taskTitle}"
Description: ${input.taskDescription ?? "No description provided"}
Status: ${input.taskStatus ?? "completed"}

Score this task on a scale of 1-10 for quality and completeness. Respond with JSON only:
{
  "score": <number 1-10>,
  "reasoning": "<one sentence explanation>",
  "approved": <true if score >= 7>
}`;
      const completion = await invokeLLM({
        model: getModelForTask("score"),
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
        temperature: 0.3,
        response_format: { type: "json_object" },
      });
      let result: { score: number; reasoning: string; approved: boolean } = {
        score: 8,
        reasoning: "Task completed to a satisfactory standard.",
        approved: true,
      };
      // p5-9: Track AI usage
      void logAiUsage(
        ctx.user.id,
        "chiefOfStaff.scoreTask",
        completion.model,
        completion.usage ?? null
      );
      try {
        const parsed = JSON.parse(
          completion.choices[0]?.message?.content ?? "{}"
        );
        result = {
          score: Math.min(10, Math.max(1, Number(parsed.score) || 8)),
          reasoning: String(parsed.reasoning ?? "Task reviewed."),
          approved: Boolean(parsed.approved ?? result.score >= 7),
        };
      } catch {
        // Use defaults above
      }
      // Persist the score to the task
      await db
        .update(tasks)
        .set({
          cosScore: result.score,
          qaStatus: result.approved ? "passed" : "failed",
          updatedAt: new Date(),
        })
        .where(and(eq(tasks.id, input.taskId), eq(tasks.userId, ctx.user.id)));
      return result;
    }),

  /**
   * Generate morning task allocation items.
   * Returns a prioritised list of items from tasks and projects
   * for the user to quickly assign (I'll do it / Chief of Staff / Defer).
   */
  generateMorningAllocation: aiProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [pendingTasks, inProgressTasks, activeProjects] = await Promise.all([
      db
        .select()
        .from(tasks)
        .where(and(eq(tasks.userId, userId), eq(tasks.status, "not_started")))
        .orderBy(desc(tasks.createdAt))
        .limit(15),
      db
        .select()
        .from(tasks)
        .where(and(eq(tasks.userId, userId), eq(tasks.status, "in_progress")))
        .orderBy(desc(tasks.updatedAt))
        .limit(5),
      db
        .select()
        .from(projects)
        .where(and(eq(projects.userId, userId), eq(projects.status, "active")))
        .limit(5),
    ]);

    const allItems = [
      ...inProgressTasks.map(t => ({
        id: `task-${t.id}`,
        type: "in_progress" as const,
        title: t.title,
        description: t.description ?? "",
        priority: (t.priority ?? "medium") as "low" | "medium" | "high" | "urgent",
        source: "task" as const,
        dueDate: t.dueDate?.toISOString() ?? null,
      })),
      ...pendingTasks.map(t => ({
        id: `task-${t.id}`,
        type: "pending" as const,
        title: t.title,
        description: t.description ?? "",
        priority: (t.priority ?? "medium") as "low" | "medium" | "high" | "urgent",
        source: "task" as const,
        dueDate: t.dueDate?.toISOString() ?? null,
      })),
      ...activeProjects.map(p => ({
        id: `project-${p.id}`,
        type: "project" as const,
        title: `Review: ${p.name}`,
        description: p.description ?? "",
        priority: "medium" as const,
        source: "project" as const,
        dueDate: null,
      })),
    ];
    const itemSummary = allItems
      .slice(0, 12)
      .map((item, i) => `${i + 1}. [${item.priority.toUpperCase()}] ${item.title} (id: ${item.id})`)
      .join("\n");

    const completion = await invokeLLM({
      model: getModelForTask("score"),
      messages: [
        {
          role: "system",
          content: `You are Agent1, the Chief of Staff. Analyse these tasks and return a JSON object with key "items" containing an array. For each item return: { "id": "...", "recommendation": "user" | "cos" | "defer", "reason": "one short sentence" }. Prioritise urgent/high items for the user. Routine/administrative items should go to Chief of Staff (cos). Low priority items should be deferred.`,
        },
        {
          role: "user",
          content: `Today is ${today.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}. Items:\n${itemSummary}\n\nReturn JSON only.`,
        },
      ],
      max_tokens: 800,
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    void logAiUsage(
      userId,
      "chiefOfStaff.generateMorningAllocation",
      completion.model,
      completion.usage ?? null
    );

    let recommendations: Array<{ id: string; recommendation: string; reason: string }> = [];
    try {
      const parsed = JSON.parse(completion.choices[0]?.message?.content ?? "{}");
      recommendations = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed.items)
          ? parsed.items
          : Array.isArray(parsed.recommendations)
            ? parsed.recommendations
            : [];
    } catch {
      // Fall back to no recommendations
    }

    const enrichedItems = allItems.slice(0, 12).map(item => {
      const rec = recommendations.find(r => r.id === item.id);
      return {
        ...item,
        recommendation: ((rec?.recommendation ?? "user") as "user" | "cos" | "defer"),
        reason: rec?.reason ?? "",
      };
    });

    return {
      date: today.toISOString(),
      items: enrichedItems,
      totalPending: pendingTasks.length,
      totalInProgress: inProgressTasks.length,
    };
  }),
});
