import { router, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import {
    tasks,
  projects,
  moodHistory,
  activityFeed,
  innovationIdeas,
  agentRatings,
  apiKeys,
} from "../../drizzle/schema";
import { sql, count, avg, desc } from "drizzle-orm";

export const adminRouter = router({
  // ─── Platform Overview Stats ─────────────────────────────────────────────
  getPlatformStats: protectedProcedure.query(async ({ ctx: _ctx }) => {
    const [
      totalTasksResult,
      completedTasksResult,
      totalProjectsResult,
      totalIdeasResult,
      totalRatingsResult,
      totalApiKeysResult,
      avgMoodResult,
    ] = await Promise.all([
      db.select({ count: count() }).from(tasks),
      db
        .select({ count: count() })
        .from(tasks)
        .where(sql`status = 'completed'`),
      db.select({ count: count() }).from(projects),
      db.select({ count: count() }).from(innovationIdeas),
      db.select({ count: count() }).from(agentRatings),
      db
        .select({ count: count() })
        .from(apiKeys)
        .where(sql`is_active = true`),
      db.select({ avg: avg(moodHistory.score) }).from(moodHistory),
    ]);

    const totalTasks = totalTasksResult[0]?.count ?? 0;
    const completedTasks = completedTasksResult[0]?.count ?? 0;
    const taskCompletionRate =
      totalTasks > 0
        ? Math.round((Number(completedTasks) / Number(totalTasks)) * 100)
        : 0;

    return {
      totalTasks: Number(totalTasks),
      completedTasks: Number(completedTasks),
      taskCompletionRate,
      totalProjects: Number(totalProjectsResult[0]?.count ?? 0),
      totalIdeas: Number(totalIdeasResult[0]?.count ?? 0),
      totalAgentRatings: Number(totalRatingsResult[0]?.count ?? 0),
      activeApiKeys: Number(totalApiKeysResult[0]?.count ?? 0),
      avgMoodScore: Number(avgMoodResult[0]?.avg ?? 0).toFixed(1),
    };
  }),

  // ─── Recent Activity Feed ─────────────────────────────────────────────────
  getRecentActivity: protectedProcedure.query(async ({ ctx: _ctx }) => {
    const activities = await db
      .select()
      .from(activityFeed)
      .orderBy(desc(activityFeed.createdAt))
      .limit(20);

    return { activities };
  }),

  // ─── Agent Performance Summary ────────────────────────────────────────────
  getAgentPerformance: protectedProcedure.query(async ({ ctx: _ctx }) => {
    const ratings = await db
      .select({
        agentName: agentRatings.agentName,
        avgRating: avg(agentRatings.rating),
        totalRatings: count(),
      })
      .from(agentRatings)
      .groupBy(agentRatings.agentName)
      .orderBy(desc(avg(agentRatings.rating)))
      .limit(10);

    return {
      agents: ratings.map(r => ({
        name: r.agentName,
        avgRating: Number(r.avgRating ?? 0).toFixed(1),
        totalRatings: Number(r.totalRatings),
      })),
    };
  }),

  // ─── System Health ────────────────────────────────────────────────────────
  getSystemHealth: protectedProcedure.query(async () => {
    const checks = {
      database: false,
      openai: !!process.env.OPENAI_API_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      elevenlabs: !!process.env.ELEVENLABS_API_KEY,
      supabase: !!process.env.SUPABASE_URL,
      trello: !!process.env.TRELLO_API_KEY,
      todoist: !!process.env.TODOIST_API_KEY,
      synthesia: !!process.env.SYNTHESIA_API_KEY,
    };

    // Test DB connection
    try {
      await db.select({ count: count() }).from(tasks);
      checks.database = true;
    } catch {
      checks.database = false;
    }

    const healthyCount = Object.values(checks).filter(Boolean).length;
    const totalCount = Object.keys(checks).length;
    const overallHealth = Math.round((healthyCount / totalCount) * 100);

    return {
      checks,
      overallHealth,
      status:
        overallHealth >= 90
          ? "healthy"
          : overallHealth >= 70
            ? "degraded"
            : "critical",
    };
  }),

  // ─── Innovation Pipeline Summary ─────────────────────────────────────────
  getInnovationSummary: protectedProcedure.query(async () => {
    const byStage = await db
      .select({
        stage: innovationIdeas.currentStage,
        count: count(),
      })
      .from(innovationIdeas)
      .groupBy(innovationIdeas.currentStage);

    return { byStage };
  }),
});
