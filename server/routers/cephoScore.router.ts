/**
 * CEPHO Score Router
 *
 * Computes the single, composite executive performance score (0-100)
 * updated daily by the scheduler. The score aggregates:
 * - Task completion rate (25%)
 * - Project health (25%)
 * - Digital Twin calibration (20%)
 * - Mood & energy trend (15%)
 * - Innovation pipeline activity (15%)
 */
import { eq, desc, gte, count, and } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import {
  tasks,
  projects,
  digitalTwinProfile,
  moodHistory,
  innovationIdeas,
} from "../../drizzle/schema";

async function computeScore(userId: number): Promise<{
  total: number;
  breakdown: {
    taskCompletion: number;
    projectHealth: number;
    digitalTwinCalibration: number;
    moodTrend: number;
    innovationActivity: number;
  };
}> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // 1. Task completion rate (25 points)
  const allTasks = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.userId, userId), gte(tasks.createdAt, thirtyDaysAgo)));
  const completedTasks = allTasks.filter(t => t.status === "done" || t.status === "completed");
  const taskScore = allTasks.length === 0
    ? 50
    : Math.round((completedTasks.length / allTasks.length) * 100);

  // 2. Project health (25 points)
  const activeProjects = await db
    .select()
    .from(projects)
    .where(and(eq(projects.userId, userId), eq(projects.status, "active")));
  const avgProgress = activeProjects.length === 0
    ? 50
    : Math.round(
        activeProjects.reduce((sum, p) => sum + (p.progress ?? 0), 0) /
          activeProjects.length
      );
  const blockedCount = activeProjects.filter(p => p.blockerDescription).length;
  const projectScore = Math.max(0, avgProgress - blockedCount * 10);

  // 3. Digital Twin calibration (20 points)
  const [twinProfile] = await db
    .select()
    .from(digitalTwinProfile)
    .where(eq(digitalTwinProfile.userId, userId))
    .limit(1);
  const twinScore = twinProfile?.questionnaireCompletion ?? 0;

  // 4. Mood trend (15 points)
  const recentMoods = await db
    .select()
    .from(moodHistory)
    .where(and(eq(moodHistory.userId, userId), gte(moodHistory.createdAt, sevenDaysAgo)))
    .orderBy(desc(moodHistory.createdAt))
    .limit(14);
  const moodScore = recentMoods.length === 0
    ? 50
    : Math.round(
        (recentMoods.reduce((sum, m) => sum + (m.score ?? 5), 0) /
          recentMoods.length) *
          10
      );

  // 5. Innovation activity (15 points)
  const recentIdeas = await db
    .select()
    .from(innovationIdeas)
    .where(and(eq(innovationIdeas.userId, userId), gte(innovationIdeas.createdAt, thirtyDaysAgo)));
  const innovationScore = Math.min(100, recentIdeas.length * 10);

  // Weighted composite
  const total = Math.round(
    taskScore * 0.25 +
    projectScore * 0.25 +
    twinScore * 0.20 +
    moodScore * 0.15 +
    innovationScore * 0.15
  );

  return {
    total,
    breakdown: {
      taskCompletion: taskScore,
      projectHealth: projectScore,
      digitalTwinCalibration: twinScore,
      moodTrend: moodScore,
      innovationActivity: innovationScore,
    },
  };
}

export const cephoScoreRouter = router({
  /**
   * Get the current CEPHO Score and breakdown.
   */
  get: protectedProcedure.query(async ({ ctx }) => {
    const score = await computeScore(ctx.user.id);
    return {
      ...score,
      grade: score.total >= 90 ? "A+" : score.total >= 80 ? "A" : score.total >= 70 ? "B" : score.total >= 60 ? "C" : "D",
      calculatedAt: new Date().toISOString(),
    };
  }),

  /**
   * Force a recalculation of the CEPHO Score.
   * Called by the scheduler daily and on-demand from the dashboard.
   */
  recalculate: protectedProcedure.mutation(async ({ ctx }) => {
    const score = await computeScore(ctx.user.id);
    return {
      ...score,
      grade: score.total >= 90 ? "A+" : score.total >= 80 ? "A" : score.total >= 70 ? "B" : score.total >= 60 ? "C" : "D",
      calculatedAt: new Date().toISOString(),
    };
  }),
});
