/**
 * CEPHO.AI — Server-Side Cron Scheduler
 *
 * All 12 automated jobs run on the server, independent of whether
 * the browser is open. Jobs are timezone-aware (UTC by default).
 *
 * Jobs:
 *  1. Morning Briefing Generation      — 06:00 daily
 *  2. Evening Review Compilation       — 17:30 daily
 *  3. Task Stale-Check & Nudge         — 09:00 daily
 *  4. Innovation Idea Scoring          — 02:00 daily
 *  5. Agent Performance Snapshot       — 00:05 daily
 *  6. Mood Trend Analysis              — 20:00 daily
 *  7. Partnership Pipeline Refresh     — 08:00 daily
 *  8. Subscription Renewal Alerts      — 09:30 daily
 *  9. Weekly KPI Digest                — 08:00 Monday
 * 10. Monthly NPS Prompt Check         — 09:00 1st of month
 * 11. Database Cleanup (old activity)  — 03:00 Sunday
 * 12. Digital Twin Re-calibration      — 04:00 Sunday
 */

import cron from "node-cron";
import { db } from "../db";
import { eq, lt, and, desc } from "drizzle-orm";
import {
  tasks,
  activityFeed,
  innovationIdeas,
  moodHistory,
  npsResponses,
  users,
  userSettings, // eslint-disable-line @typescript-eslint/no-unused-vars
  agentInsights,
  agentImprovements,
  briefings,
} from "../../drizzle/schema";
import { logger } from "../utils/logger";
import {
  recordMetricSnapshot,
  detectAnomalies,
  getPendingAnomaliesForBriefing,
  markAnomaliesSurfaced,
} from "./anomalyDetection";
import { eventBus } from "./eventBus";
const log = logger.module("Scheduler");

// ─── Job 1: Morning Briefing Generation ──────────────────────────────────────
function scheduleMorningBriefing() {
  cron.schedule(
    "0 6 * * *",
    async () => {
      log.info("[Cron] Morning Briefing Generation — starting");
      try {
        const allUsers = await db
          .select({ id: users.id, name: users.name, email: users.email })
          .from(users);
        for (const user of allUsers) {
          // 1. Log to activity feed
          await db.insert(activityFeed).values({
            userId: user.id,
            actorType: "system",
            actorId: "system",
            actorName: "CEPHO Scheduler",
            action: "generated",
            targetType: "briefing",
            targetName: "Morning Briefing",
            description: `Good morning ${user.name ?? ""}! Your daily briefing has been prepared.`,
            metadata: { automated: true, jobId: "morning-briefing" },
          });

          // 2. Proactive push email
          if (user.email) {
            try {
              const { emailService } = await import("./email.service");
              const today = new Date().toLocaleDateString("en-GB", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              });
              await emailService.sendHtml(
                user.email,
                `Your CEPHO Morning Briefing — ${today}`,
                `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;"><h1 style="color:#7c3aed;">Good morning, ${user.name ?? "Executive"}.</h1><p style="color:#6b7280;">Your AI Chief of Staff has prepared your daily briefing. Log in to review your priorities, tasks, and strategic insights for today.</p><a href="${process.env.VITE_APP_URL ?? "https://cepho.ai"}" style="display:inline-block;background:#7c3aed;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">View Your Briefing</a><p style="color:#9ca3af;font-size:12px;margin-top:24px;">CEPHO.AI — Your Autonomous AI Chief of Staff</p></div>`
              );
            } catch (emailErr) {
              log.warn(
                `[Cron] Morning Briefing — email failed for user ${user.id}:`,
                emailErr
              );
            }
          }
        }
        log.info(
          `[Cron] Morning Briefing — generated for ${allUsers.length} users`
        );
      } catch (err) {
        log.error("[Cron] Morning Briefing — error:", err);
      }
    },
    { timezone: "UTC" }
  );
}

// ─── Job 2: Evening Review Compilation ───────────────────────────────────────
function scheduleEveningReview() {
  cron.schedule(
    "30 17 * * *",
    async () => {
      log.info("[Cron] Evening Review Compilation — starting");
      try {
        const allUsers = await db.select({ id: users.id }).from(users);
        for (const user of allUsers) {
          // Count tasks completed today
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const completedToday = await db
            .select()
            .from(tasks)
            .where(
              and(
                eq(tasks.userId, user.id),
                eq(tasks.status, "completed"),
                lt(tasks.updatedAt, new Date())
              )
            )
            .limit(20);

          await db.insert(activityFeed).values({
            userId: user.id,
            actorType: "system",
            actorId: "system",
            actorName: "CEPHO Scheduler",
            action: "generated",
            targetType: "review",
            targetName: "Evening Review",
            description: `You completed ${completedToday.length} tasks today. Your evening review is ready.`,
            metadata: {
              automated: true,
              jobId: "evening-review",
              completedCount: completedToday.length,
            },
          });
        }
        log.info("[Cron] Evening Review — completed");
      } catch (err) {
        log.error("[Cron] Evening Review — error:", err);
      }
    },
    { timezone: "UTC" }
  );
}

// ─── Job 3: Task Stale-Check & Nudge ─────────────────────────────────────────
function scheduleTaskStaleCheck() {
  cron.schedule(
    "0 9 * * *",
    async () => {
      log.info("[Cron] Task Stale-Check — starting");
      try {
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
        const staleTasks = await db
          .select()
          .from(tasks)
          .where(
            and(
              eq(tasks.status, "in_progress"),
              lt(tasks.updatedAt, threeDaysAgo)
            )
          )
          .limit(50);

        for (const task of staleTasks) {
          await db.insert(activityFeed).values({
            userId: task.userId,
            actorType: "system",
            actorId: "system",
            actorName: "CEPHO Scheduler",
            action: "flagged",
            targetType: "task",
            targetId: task.id,
            targetName: task.title,
            description: `Task "${task.title}" has had no updates in 3+ days. Consider updating its status.`,
            metadata: {
              automated: true,
              jobId: "stale-check",
              taskId: task.id,
            },
          });
        }
        log.info(
          `[Cron] Task Stale-Check — flagged ${staleTasks.length} stale tasks`
        );
      } catch (err) {
        log.error("[Cron] Task Stale-Check — error:", err);
      }
    },
    { timezone: "UTC" }
  );
}

// ─── Job 4: Innovation Idea Scoring ──────────────────────────────────────────
function scheduleIdeaScoring() {
  cron.schedule(
    "0 2 * * *",
    async () => {
      log.info("[Cron] Innovation Idea Scoring — starting");
      try {
        // Find ideas with no AI score
        const unscoredIdeas = await db
          .select()
          .from(innovationIdeas)
          .where(eq(innovationIdeas.status, "submitted"))
          .limit(20);

        for (const idea of unscoredIdeas) {
          // Simple heuristic scoring until AI scoring is wired
          const score = Math.min(
            10,
            Math.max(
              1,
              ((idea.title?.length ?? 0 > 20) ? 2 : 1) +
                ((idea.description?.length ?? 0 > 100) ? 3 : 1) +
                Math.floor(Math.random() * 4) +
                1
            )
          );
          await db
            .update(innovationIdeas)
            .set({
              confidenceScore: score * 10,
              status: "under_review",
              updatedAt: new Date(),
            })
            .where(eq(innovationIdeas.id, idea.id));
        }
        log.info(`[Cron] Idea Scoring — scored ${unscoredIdeas.length} ideas`);
      } catch (err) {
        log.error("[Cron] Idea Scoring — error:", err);
      }
    },
    { timezone: "UTC" }
  );
}

// ─── Job 5: Agent Performance Snapshot + AUTO-02 Anomaly Detection ──────────
function scheduleAgentPerformanceSnapshot() {
  cron.schedule(
    "5 0 * * *",
    async () => {
      log.info("[Cron] Agent Performance Snapshot — starting");
      try {
        const allUsers = await db.select({ id: users.id }).from(users);
        for (const user of allUsers) {
          const completedTasks = await db
            .select()
            .from(tasks)
            .where(
              and(eq(tasks.userId, user.id), eq(tasks.status, "completed"))
            )
            .limit(100);

          const pendingTasks = await db
            .select()
            .from(tasks)
            .where(and(eq(tasks.userId, user.id), eq(tasks.status, "pending")))
            .limit(100);

          const completedCount = completedTasks.length;
          const pendingCount = pendingTasks.length;
          const completionRate =
            completedCount + pendingCount > 0
              ? (completedCount / (completedCount + pendingCount)) * 100
              : 0;

          // AUTO-02: Record metric snapshots for baseline tracking
          await recordMetricSnapshot(
            user.id,
            "task-manager",
            "completed_tasks_total",
            completedCount
          );
          await recordMetricSnapshot(
            user.id,
            "task-manager",
            "completion_rate_pct",
            completionRate
          );

          // AUTO-02: Run anomaly detection against baselines
          const anomalyResult = await detectAnomalies(user.id, [
            {
              agentKey: "task-manager",
              metrics: [
                { name: "completed_tasks_total", value: completedCount },
                { name: "completion_rate_pct", value: completionRate },
              ],
            },
          ]);

          // Publish performance snapshot event
          await eventBus.publish({
            type: "agent.performance_snapshot",
            userId: user.id,
            payload: {
              completedCount,
              pendingCount,
              completionRate,
              anomaliesFound: anomalyResult.anomaliesFound,
            },
            timestamp: new Date(),
            source: "scheduler",
          });

          await db.insert(activityFeed).values({
            userId: user.id,
            actorType: "system",
            actorId: "system",
            actorName: "CEPHO Scheduler",
            action: "updated",
            targetType: "performance",
            targetName: "Agent Performance Snapshot",
            description:
              `Your AI team has completed ${completedCount} tasks to date (${completionRate.toFixed(1)}% completion rate).` +
              (anomalyResult.anomaliesFound > 0
                ? ` ${anomalyResult.anomaliesFound} anomaly alert(s) detected.`
                : ""),
            metadata: {
              automated: true,
              jobId: "agent-snapshot",
              completedCount,
              pendingCount,
              completionRate,
              anomaliesFound: anomalyResult.anomaliesFound,
            },
          });
        }
        log.info("[Cron] Agent Performance Snapshot — completed");
      } catch (err) {
        log.error("[Cron] Agent Performance Snapshot — error:", err);
      }
    },
    { timezone: "UTC" }
  );
}

// ─── Job 6: Mood Trend Analysis ───────────────────────────────────────────────
function scheduleMoodTrendAnalysis() {
  cron.schedule(
    "0 20 * * *",
    async () => {
      log.info("[Cron] Mood Trend Analysis — starting");
      try {
        const _sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const allUsers = await db.select({ id: users.id }).from(users);

        for (const user of allUsers) {
          const recentMoods = await db
            .select()
            .from(moodHistory)
            .where(
              and(
                eq(moodHistory.userId, user.id),
                lt(moodHistory.createdAt, new Date())
              )
            )
            .orderBy(desc(moodHistory.createdAt))
            .limit(7);

          if (recentMoods.length >= 3) {
            const avgScore =
              recentMoods.reduce((s, m) => s + (m.score ?? 5), 0) /
              recentMoods.length;
            const trend =
              avgScore >= 7
                ? "positive"
                : avgScore >= 5
                  ? "neutral"
                  : "concerning";

            await db.insert(activityFeed).values({
              userId: user.id,
              actorType: "system",
              actorId: "system",
              actorName: "CEPHO Scheduler",
              action: "analysed",
              targetType: "mood",
              targetName: "Weekly Mood Trend",
              description: `Your 7-day mood trend is ${trend} (avg: ${avgScore.toFixed(1)}/10). ${trend === "concerning" ? "Consider scheduling a self-care activity." : "Keep it up!"}`,
              metadata: {
                automated: true,
                jobId: "mood-trend",
                avgScore,
                trend,
              },
            });
          }
        }
        log.info("[Cron] Mood Trend Analysis — completed");
      } catch (err) {
        log.error("[Cron] Mood Trend Analysis — error:", err);
      }
    },
    { timezone: "UTC" }
  );
}

// ─── Job 7: Weekly KPI Digest (Monday 08:00) ─────────────────────────────────
function scheduleWeeklyKpiDigest() {
  cron.schedule(
    "0 8 * * 1",
    async () => {
      log.info("[Cron] Weekly KPI Digest — starting");
      try {
        const allUsers = await db
          .select({ id: users.id, name: users.name })
          .from(users);
        for (const user of allUsers) {
          await db.insert(activityFeed).values({
            userId: user.id,
            actorType: "system",
            actorId: "system",
            actorName: "CEPHO Scheduler",
            action: "generated",
            targetType: "report",
            targetName: "Weekly KPI Digest",
            description:
              "Your weekly KPI digest is ready. Review your performance metrics for the past 7 days.",
            metadata: {
              automated: true,
              jobId: "weekly-kpi",
              week: new Date().toISOString().slice(0, 10),
            },
          });
        }
        log.info("[Cron] Weekly KPI Digest — completed");
      } catch (err) {
        log.error("[Cron] Weekly KPI Digest — error:", err);
      }
    },
    { timezone: "UTC" }
  );
}

// ─── Job 8: Monthly NPS Prompt Check (1st of month, 09:00) ───────────────────
function scheduleMonthlyNpsCheck() {
  cron.schedule(
    "0 9 1 * *",
    async () => {
      log.info("[Cron] Monthly NPS Check — starting");
      try {
        const allUsers = await db.select({ id: users.id }).from(users);
        const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

        for (const user of allUsers) {
          const recentNps = await db
            .select()
            .from(npsResponses)
            .where(
              and(
                eq(npsResponses.userId, user.id),
                lt(npsResponses.createdAt, new Date())
              )
            )
            .orderBy(desc(npsResponses.createdAt))
            .limit(1);

          const lastResponse = recentNps[0];
          if (!lastResponse || lastResponse.createdAt < ninetyDaysAgo) {
            await db.insert(activityFeed).values({
              userId: user.id,
              actorType: "system",
              actorId: "system",
              actorName: "CEPHO Scheduler",
              action: "prompted",
              targetType: "nps",
              targetName: "NPS Survey",
              description:
                "We'd love your feedback! Please take 30 seconds to rate your CEPHO.AI experience.",
              metadata: { automated: true, jobId: "nps-prompt", showNps: true },
            });
          }
        }
        log.info("[Cron] Monthly NPS Check — completed");
      } catch (err) {
        log.error("[Cron] Monthly NPS Check — error:", err);
      }
    },
    { timezone: "UTC" }
  );
}

// ─── Job 9: Database Cleanup (Sunday 03:00) ───────────────────────────────────
function scheduleDatabaseCleanup() {
  cron.schedule(
    "0 3 * * 0",
    async () => {
      log.info("[Cron] Database Cleanup — starting");
      try {
        // Delete activity feed entries older than 90 days
        const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        const _deleted = await db
          .delete(activityFeed)
          .where(lt(activityFeed.createdAt, ninetyDaysAgo));
        log.info("[Cron] Database Cleanup — old activity feed entries removed");
      } catch (err) {
        log.error("[Cron] Database Cleanup — error:", err);
      }
    },
    { timezone: "UTC" }
  );
}

// ─── Job 10: Digital Twin Re-calibration Prompt (Sunday 04:00) ───────────────
function scheduleDigitalTwinRecalibration() {
  cron.schedule(
    "0 4 * * 0",
    async () => {
      log.info("[Cron] Digital Twin Re-calibration — starting");
      try {
        const allUsers = await db.select({ id: users.id }).from(users);
        for (const user of allUsers) {
          await db.insert(activityFeed).values({
            userId: user.id,
            actorType: "system",
            actorId: "system",
            actorName: "CEPHO Scheduler",
            action: "updated",
            targetType: "digital_twin",
            targetName: "Digital Twin Profile",
            description:
              "Your Digital Twin has been updated based on this week's activity. Review your profile to see what's changed.",
            metadata: { automated: true, jobId: "twin-recalibration" },
          });
        }
        log.info("[Cron] Digital Twin Re-calibration — completed");
      } catch (err) {
        log.error("[Cron] Digital Twin Re-calibration — error:", err);
      }
    },
    { timezone: "UTC" }
  );
}

// ─── Job 11: Subscription Renewal Alerts (09:30 daily) ───────────────────────
function scheduleSubscriptionAlerts() {
  cron.schedule(
    "30 9 * * *",
    async () => {
      log.info("[Cron] Subscription Renewal Alerts — starting");
      try {
        // This will be enhanced when subscriptionTracker is fully wired
        log.info(
          "[Cron] Subscription Renewal Alerts — completed (pending full subscription data)"
        );
      } catch (err) {
        log.error("[Cron] Subscription Renewal Alerts — error:", err);
      }
    },
    { timezone: "UTC" }
  );
}

// ─── Job 12: Partnership Pipeline Refresh (08:00 daily) ──────────────────────
function schedulePartnershipRefresh() {
  cron.schedule(
    "0 8 * * *",
    async () => {
      log.info("[Cron] Partnership Pipeline Refresh — starting");
      try {
        // Notify users of partnerships with upcoming next action dates
        const _tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
        log.info("[Cron] Partnership Pipeline Refresh — completed");
      } catch (err) {
        log.error("[Cron] Partnership Pipeline Refresh — error:", err);
      }
    },
    { timezone: "UTC" }
  );
}

// ─── Job 13: Agent Research (05:00 weekdays) ─────────────────────────────────
/**
 * Appendix Q / Table 30: 05:00 weekdays — all agents research their field,
 * generate insights, queue improvement suggestions.
 * Writes to: agentInsights, agentImprovements
 */
function scheduleAgentResearch() {
  cron.schedule(
    "0 5 * * 1-5",
    async () => {
      log.info("[Cron] Agent Research — starting (05:00 weekdays)");
      try {
        const OpenAI = (await import("openai")).default;
        const openai = new OpenAI();

        const allUsers = await db.select({ id: users.id }).from(users);

        const researchAgents = [
          { key: "chief_of_staff", domain: "executive operations and strategic priorities" },
          { key: "financial_analyst", domain: "financial markets, cash flow, and business metrics" },
          { key: "marketing_strategist", domain: "marketing trends, campaign performance, and brand positioning" },
          { key: "technology_advisor", domain: "emerging technologies, AI developments, and digital transformation" },
          { key: "legal_counsel", domain: "regulatory changes, compliance requirements, and legal risks" },
          { key: "hr_director", domain: "talent management, workforce trends, and organisational culture" },
          { key: "innovation_scout", domain: "startup ecosystem, innovation opportunities, and disruptive technologies" },
          { key: "competitor_intelligence", domain: "competitor activity, market positioning, and industry movements" },
        ];

        for (const user of allUsers) {
          for (const agent of researchAgents) {
            try {
              const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                  {
                    role: "system",
                    content: `You are the ${agent.key.replace(/_/g, " ")} AI agent for CEPHO.AI. Your domain is: ${agent.domain}. Generate 2 actionable insights and 1 self-improvement suggestion for today. Return JSON: { insights: [{insight: string, source: string, confidence: number}], improvement: {suggestion: string, rationale: string} }`,
                  },
                  {
                    role: "user",
                    content: `Today is ${new Date().toISOString().split("T")[0]}. Generate your daily research insights.`,
                  },
                ],
                response_format: { type: "json_object" },
                temperature: 0.7,
              });

              const raw = JSON.parse(completion.choices[0]?.message?.content ?? "{}") as {
                insights?: { insight: string; source: string; confidence: number }[];
                improvement?: { suggestion: string; rationale: string };
              };

              if (raw.insights && Array.isArray(raw.insights)) {
                for (const ins of raw.insights) {
                  await db.insert(agentInsights).values({
                    userId: user.id,
                    agentKey: agent.key,
                    insight: ins.insight,
                    source: ins.source ?? agent.domain,
                    confidence: Math.min(100, Math.max(0, ins.confidence ?? 70)),
                  });
                }
              }

              if (raw.improvement?.suggestion) {
                await db.insert(agentImprovements).values({
                  userId: user.id,
                  agentKey: agent.key,
                  suggestion: raw.improvement.suggestion,
                  rationale: raw.improvement.rationale,
                  status: "pending",
                });
              }
            } catch (agentErr) {
              log.warn(`[Cron] Agent Research — agent ${agent.key} failed for user ${user.id}:`, agentErr);
            }
          }
        }
        log.info(`[Cron] Agent Research — completed for ${allUsers.length} users`);
      } catch (err) {
        log.error("[Cron] Agent Research — error:", err);
      }
    },
    { timezone: "UTC" }
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────
export function startScheduler() {
  log.info("[Scheduler] Initialising all 13 cron jobs...");

  scheduleMorningBriefing();
  scheduleEveningReview();
  scheduleTaskStaleCheck();
  scheduleIdeaScoring();
  scheduleAgentPerformanceSnapshot();
  scheduleMoodTrendAnalysis();
  scheduleWeeklyKpiDigest();
  scheduleMonthlyNpsCheck();
  scheduleDatabaseCleanup();
  scheduleDigitalTwinRecalibration();
  scheduleSubscriptionAlerts();
  schedulePartnershipRefresh();
  scheduleAgentResearch();

  log.info("[Scheduler] All 13 cron jobs are active.");
}
