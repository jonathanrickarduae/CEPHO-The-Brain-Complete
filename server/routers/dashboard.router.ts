/**
 * Dashboard Router — Real Implementation
 *
 * Provides real-time metrics, activity feed, and insights
 * from the database for the Nexus Dashboard.
 */
import { desc, eq, count, and, gte } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import {
  tasks,
  projects,
  activityFeed,
  conversations,
  notifications,
} from "../../drizzle/schema";

export const dashboardRouter = router({
  /**
   * Get dashboard insights — metrics, recent activity, system stats.
   */
  getInsights: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Run queries in parallel for performance
    const [
      taskStats,
      projectStats,
      recentActivity,
      conversationCount,
      unreadNotifications,
    ] = await Promise.all([
      // Task metrics
      db
        .select({
          status: tasks.status,
          count: count(),
        })
        .from(tasks)
        .where(eq(tasks.userId, userId))
        .groupBy(tasks.status),

      // Project metrics
      db
        .select({
          status: projects.status,
          count: count(),
        })
        .from(projects)
        .where(eq(projects.userId, userId))
        .groupBy(projects.status),

      // Recent activity (last 10 items)
      db
        .select()
        .from(activityFeed)
        .where(eq(activityFeed.userId, userId))
        .orderBy(desc(activityFeed.createdAt))
        .limit(10),

      // Total AI conversations this month
      db
        .select({ count: count() })
        .from(conversations)
        .where(
          and(
            eq(conversations.userId, userId),
            gte(conversations.createdAt, thirtyDaysAgo)
          )
        ),

      // Unread notifications
      db
        .select({ count: count() })
        .from(notifications)
        .where(
          and(eq(notifications.userId, userId), eq(notifications.read, false))
        ),
    ]);

    // Aggregate task stats
    const taskSummary = {
      total: taskStats.reduce((sum, t) => sum + Number(t.count), 0),
      completed: Number(
        taskStats.find(t => t.status === "completed")?.count ?? 0
      ),
      inProgress: Number(
        taskStats.find(t => t.status === "in_progress")?.count ?? 0
      ),
      notStarted: Number(
        taskStats.find(t => t.status === "not_started")?.count ?? 0
      ),
    };

    // Aggregate project stats
    const projectSummary = {
      total: projectStats.reduce((sum, p) => sum + Number(p.count), 0),
      active: Number(projectStats.find(p => p.status === "active")?.count ?? 0),
      completed: Number(
        projectStats.find(p => p.status === "completed")?.count ?? 0
      ),
    };

    // Build metrics array for the dashboard
    const metrics = [
      {
        id: "tasks_total",
        label: "Total Tasks",
        value: taskSummary.total,
        change: null,
        trend: "neutral" as const,
      },
      {
        id: "tasks_completed",
        label: "Tasks Completed",
        value: taskSummary.completed,
        change: null,
        trend: "up" as const,
      },
      {
        id: "tasks_in_progress",
        label: "In Progress",
        value: taskSummary.inProgress,
        change: null,
        trend: "neutral" as const,
      },
      {
        id: "projects_active",
        label: "Active Projects",
        value: projectSummary.active,
        change: null,
        trend: "neutral" as const,
      },
      {
        id: "ai_conversations",
        label: "AI Conversations (30d)",
        value: Number(conversationCount[0]?.count ?? 0),
        change: null,
        trend: "up" as const,
      },
      {
        id: "notifications_unread",
        label: "Unread Notifications",
        value: Number(unreadNotifications[0]?.count ?? 0),
        change: null,
        trend: "neutral" as const,
      },
    ];

    // Format recent activity
    const activity = recentActivity.map(item => ({
      id: String(item.id),
      actorName: item.actorName ?? "System",
      actorType: item.actorType,
      action: item.action,
      targetType: item.targetType ?? "",
      targetName: item.targetName ?? "",
      description: item.description ?? "",
      timestamp: item.createdAt.toISOString(),
    }));

    // Completion rate
    const completionRate =
      taskSummary.total > 0
        ? Math.round((taskSummary.completed / taskSummary.total) * 100)
        : 0;

    return {
      summary: `${taskSummary.inProgress} tasks in progress, ${projectSummary.active} active projects, ${completionRate}% task completion rate`,
      metrics,
      activity,
      taskSummary,
      projectSummary,
      completionRate,
      lastUpdated: new Date().toISOString(),
    };
  }),
});
