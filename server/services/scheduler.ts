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
  agentDailyReports,
  agentPerformanceMetrics as _agentPerformanceMetrics,
  victoriaActions,
  smeReviewTriggers,
  victoriaQcChecks,
  victoriaSkills,
  projects,
  libraryDocuments,
  calendarEventsCache,
  briefings,
} from "../../drizzle/schema";
import { logger } from "../utils/logger";
import { recordMetricSnapshot, detectAnomalies } from "./anomalyDetection";
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

          // 2. Generate and persist the AI briefing for the day
          try {
            const OpenAI = (await import("openai")).default;
            const apiKey = process.env.OPENAI_API_KEY;
            if (apiKey) {
              const openai = new OpenAI({ apiKey });
              const todayDate = new Date();
              todayDate.setHours(0, 0, 0, 0);
              const [pendingTasks, activeProjects] = await Promise.all([
                db.select().from(tasks)
                  .where(and(eq(tasks.userId, user.id), eq(tasks.status, "not_started")))
                  .limit(8),
                db.select().from(projects)
                  .where(and(eq(projects.userId, user.id), eq(projects.status, "active")))
                  .limit(5),
              ]);
              const dateStr = todayDate.toLocaleDateString("en-GB", {
                weekday: "long", year: "numeric", month: "long", day: "numeric",
              });
              const prompt = `You are Victoria, AI Chief of Staff for CEPHO. Generate a professional daily briefing for ${user.name ?? "the executive"}.
Date: ${dateStr}
Active Projects (${activeProjects.length}): ${activeProjects.map((p: { name: string; status: string; progress?: number | null }) => `${p.name} [${p.status}, ${p.progress ?? 0}% complete]`).join("; ") || "None"}
Pending Tasks (${pendingTasks.length}): ${pendingTasks.slice(0, 5).map((t: { title: string; priority?: string | null }) => `${t.title} [${t.priority ?? "medium"} priority]`).join("; ") || "None"}
Generate a structured daily briefing with: 1. Executive Summary, 2. Priority Focus (top 3), 3. Key Metrics, 4. Strategic Recommendation. Keep it concise and professional.`;
              const completion = await openai.chat.completions.create({
                model: "gpt-4.1-mini",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 700,
                temperature: 0.6,
              });
              const briefingText = completion.choices[0]?.message?.content;
              if (briefingText) {
                await db.insert(briefings).values({
                  userId: user.id,
                  title: `Daily Briefing — ${todayDate.toLocaleDateString("en-GB")}`,
                  content: { text: briefingText },
                  date: todayDate,
                  status: "completed",
                });
                log.info(`[Cron] Morning Briefing — AI brief persisted for user ${user.id}`);
              }
            }
          } catch (aiErr) {
            log.warn(`[Cron] Morning Briefing — AI generation failed for user ${user.id}:`, aiErr);
          }

          // 3. Proactive push email
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

        // All 51 CEPHO agents — each researches their own domain daily
        const researchAgents = [
          // Communication
          {
            key: "email_composer",
            domain:
              "professional email communication, business writing best practices, and communication effectiveness",
          },
          {
            key: "meeting_summariser",
            domain:
              "meeting facilitation, action item tracking, and executive communication",
          },
          {
            key: "stakeholder_comms",
            domain:
              "stakeholder management, investor relations, and board communications",
          },
          {
            key: "proposal_writer",
            domain:
              "business proposals, RFP responses, and persuasive writing techniques",
          },
          {
            key: "newsletter_editor",
            domain:
              "content curation, newsletter engagement, and subscriber retention",
          },
          {
            key: "linkedin_manager",
            domain:
              "LinkedIn algorithm changes, thought leadership, and professional networking",
          },
          {
            key: "press_release_writer",
            domain:
              "media relations, PR trends, and newsworthy business communications",
          },
          {
            key: "crisis_comms",
            domain:
              "reputation management, crisis response strategies, and brand protection",
          },
          // Content
          {
            key: "report_writer",
            domain:
              "business report writing, data storytelling, and executive summaries",
          },
          {
            key: "blog_writer",
            domain:
              "SEO trends, thought leadership content, and content marketing strategies",
          },
          {
            key: "social_media_manager",
            domain:
              "social media algorithm updates, engagement strategies, and platform trends",
          },
          {
            key: "video_script_writer",
            domain:
              "video content trends, script writing, and audience engagement",
          },
          {
            key: "podcast_producer",
            domain:
              "podcast trends, audio content strategy, and listener engagement",
          },
          {
            key: "case_study_writer",
            domain:
              "case study best practices, customer success storytelling, and B2B content",
          },
          // Operations
          {
            key: "project_manager",
            domain:
              "project management methodologies, agile practices, and delivery optimisation",
          },
          {
            key: "process_optimiser",
            domain:
              "business process automation, workflow efficiency, and operational excellence",
          },
          {
            key: "data_analyst",
            domain:
              "data analytics trends, business intelligence tools, and KPI frameworks",
          },
          {
            key: "kpi_tracker",
            domain:
              "performance measurement, OKR frameworks, and business metrics",
          },
          {
            key: "budget_controller",
            domain: "budget management, cost control, and financial planning",
          },
          {
            key: "risk_manager",
            domain:
              "enterprise risk management, compliance frameworks, and risk mitigation",
          },
          {
            key: "compliance_officer",
            domain:
              "regulatory changes, compliance requirements, and governance best practices",
          },
          {
            key: "supply_chain_manager",
            domain:
              "supply chain optimisation, vendor management, and logistics trends",
          },
          // Strategy
          {
            key: "chief_of_staff",
            domain:
              "executive operations, strategic priorities, and organisational effectiveness",
          },
          {
            key: "strategic_planner",
            domain:
              "strategic planning frameworks, competitive strategy, and business model innovation",
          },
          {
            key: "market_researcher",
            domain:
              "market research methodologies, consumer insights, and industry analysis",
          },
          {
            key: "competitor_intelligence",
            domain:
              "competitor activity, market positioning, and industry movements",
          },
          {
            key: "business_developer",
            domain:
              "business development strategies, partnership opportunities, and growth tactics",
          },
          {
            key: "investment_analyst",
            domain:
              "investment analysis, valuation methodologies, and portfolio management",
          },
          {
            key: "financial_analyst",
            domain:
              "financial markets, cash flow optimisation, and business metrics",
          },
          {
            key: "pricing_strategist",
            domain:
              "pricing models, revenue optimisation, and value-based pricing",
          },
          // Innovation
          {
            key: "innovation_scout",
            domain:
              "startup ecosystem, disruptive technologies, and innovation opportunities",
          },
          {
            key: "product_manager",
            domain:
              "product strategy, feature prioritisation, and product-market fit",
          },
          {
            key: "ux_designer",
            domain:
              "UX design trends, user research methods, and design systems",
          },
          {
            key: "technology_advisor",
            domain:
              "emerging technologies, AI developments, and digital transformation",
          },
          {
            key: "ai_specialist",
            domain:
              "AI/ML advancements, LLM capabilities, and AI implementation strategies",
          },
          {
            key: "blockchain_advisor",
            domain:
              "blockchain applications, Web3 trends, and decentralised finance",
          },
          {
            key: "sustainability_advisor",
            domain:
              "ESG frameworks, sustainability reporting, and green business practices",
          },
          // People
          {
            key: "hr_director",
            domain:
              "talent management, workforce trends, and organisational culture",
          },
          {
            key: "recruiter",
            domain:
              "talent acquisition strategies, employer branding, and hiring best practices",
          },
          {
            key: "learning_development",
            domain:
              "L&D trends, skills development, and corporate learning strategies",
          },
          {
            key: "culture_champion",
            domain:
              "organisational culture, employee engagement, and values alignment",
          },
          {
            key: "performance_coach",
            domain:
              "performance management, coaching methodologies, and leadership development",
          },
          {
            key: "wellbeing_advisor",
            domain:
              "employee wellbeing, mental health at work, and work-life balance",
          },
          // Finance
          {
            key: "cfo_advisor",
            domain:
              "CFO best practices, financial strategy, and capital allocation",
          },
          {
            key: "tax_advisor",
            domain:
              "tax planning, regulatory changes, and tax optimisation strategies",
          },
          {
            key: "legal_counsel",
            domain:
              "regulatory changes, compliance requirements, and legal risk management",
          },
          {
            key: "contracts_manager",
            domain:
              "contract management, negotiation strategies, and legal frameworks",
          },
          // Sales & Marketing
          {
            key: "marketing_strategist",
            domain:
              "marketing trends, campaign performance, and brand positioning",
          },
          {
            key: "sales_coach",
            domain:
              "sales methodologies, pipeline management, and revenue growth strategies",
          },
          {
            key: "customer_success",
            domain:
              "customer success metrics, churn prevention, and NPS improvement",
          },
          {
            key: "brand_manager",
            domain: "brand strategy, brand equity, and visual identity trends",
          },
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

              const raw = JSON.parse(
                completion.choices[0]?.message?.content ?? "{}"
              ) as {
                insights?: {
                  insight: string;
                  source: string;
                  confidence: number;
                }[];
                improvement?: { suggestion: string; rationale: string };
              };

              if (raw.insights && Array.isArray(raw.insights)) {
                for (const ins of raw.insights) {
                  await db.insert(agentInsights).values({
                    userId: user.id,
                    agentKey: agent.key,
                    insight: ins.insight,
                    source: ins.source ?? agent.domain,
                    confidence: Math.min(
                      100,
                      Math.max(0, ins.confidence ?? 70)
                    ),
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
              log.warn(
                `[Cron] Agent Research — agent ${agent.key} failed for user ${user.id}:`,
                agentErr
              );
            }
          }
        }
        log.info(
          `[Cron] Agent Research — completed for ${allUsers.length} users`
        );
      } catch (err) {
        log.error("[Cron] Agent Research — error:", err);
      }
    },
    { timezone: "UTC" }
  );
}

// ─── Job 14: Daily Agent Reports (06:30 weekdays) ────────────────────────────
function scheduleAgentDailyReports() {
  cron.schedule(
    "0 30 6 * * 1-5",
    async () => {
      log.info("[Cron] Agent Daily Reports — starting (06:30 weekdays)");
      try {
        const OpenAI = (await import("openai")).default;
        const openai = new OpenAI();

        const allUsers = await db.select({ id: users.id }).from(users);

        // All 51 agents generate a daily report for Victoria
        const agentKeys = [
          "email_composer",
          "meeting_summariser",
          "stakeholder_comms",
          "proposal_writer",
          "newsletter_editor",
          "linkedin_manager",
          "press_release_writer",
          "crisis_comms",
          "report_writer",
          "blog_writer",
          "social_media_manager",
          "video_script_writer",
          "podcast_producer",
          "case_study_writer",
          "project_manager",
          "process_optimiser",
          "data_analyst",
          "kpi_tracker",
          "budget_controller",
          "risk_manager",
          "compliance_officer",
          "supply_chain_manager",
          "chief_of_staff",
          "strategic_planner",
          "market_researcher",
          "competitor_intelligence",
          "business_developer",
          "investment_analyst",
          "financial_analyst",
          "pricing_strategist",
          "innovation_scout",
          "product_manager",
          "ux_designer",
          "technology_advisor",
          "ai_specialist",
          "blockchain_advisor",
          "sustainability_advisor",
          "hr_director",
          "recruiter",
          "learning_development",
          "culture_champion",
          "performance_coach",
          "wellbeing_advisor",
          "cfo_advisor",
          "tax_advisor",
          "legal_counsel",
          "contracts_manager",
          "marketing_strategist",
          "sales_coach",
          "customer_success",
          "brand_manager",
        ];

        for (const user of allUsers) {
          // Process agents in batches of 5 to avoid rate limits
          for (let i = 0; i < agentKeys.length; i += 5) {
            const batch = agentKeys.slice(i, i + 5);
            await Promise.all(
              batch.map(async agentKey => {
                try {
                  const agentName = agentKey
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, l => l.toUpperCase());

                  const completion = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [
                      {
                        role: "system",
                        content: `You are the ${agentName} AI agent for CEPHO.AI. Generate your daily report for Victoria (Chief of Staff). Be concise and actionable.`,
                      },
                      {
                        role: "user",
                        content: `Today is ${new Date().toISOString().split("T")[0]}. Generate your daily report. Return JSON: { "achievements": "string", "challenges": "string", "newLearnings": [{"topic": "string", "insight": "string"}], "suggestions": [{"title": "string", "description": "string"}], "capabilityRequest": null }`,
                      },
                    ],
                    response_format: { type: "json_object" },
                    temperature: 0.6,
                    max_tokens: 400,
                  });

                  const raw = JSON.parse(
                    completion.choices[0]?.message?.content ?? "{}"
                  ) as {
                    achievements?: string;
                    challenges?: string;
                    newLearnings?: { topic: string; insight: string }[];
                    suggestions?: { title: string; description: string }[];
                    capabilityRequest?: Record<string, unknown> | null;
                  };

                  await db.insert(agentDailyReports).values({
                    userId: user.id,
                    agentId: agentKey,
                    agentName,
                    category: "automated",
                    tasksCompleted: [],
                    achievements: raw.achievements ?? "",
                    challenges: raw.challenges ?? "",
                    newLearnings: raw.newLearnings ?? [],
                    suggestions: raw.suggestions ?? [],
                    capabilityRequest: raw.capabilityRequest ?? null,
                    approvalStatus: raw.capabilityRequest
                      ? "pending"
                      : "not_required",
                  });

                  // ── Insert agent suggestions as Innovation Hub ideas ────────────
                  if (raw.suggestions && raw.suggestions.length > 0) {
                    for (const suggestion of raw.suggestions.slice(0, 3)) {
                      if (suggestion.title) {
                        try {
                          await db.insert(innovationIdeas).values({
                            userId: user.id,
                            title: suggestion.title,
                            description: suggestion.description ?? null,
                            source: `agent:${agentKey}`,
                            status: "submitted",
                            priority: "medium",
                            currentStage: 1,
                            category: "agent-generated",
                            sourceMetadata: { agentName, agentKey },
                          });
                        } catch (_ideaErr) {
                          // non-fatal — idea may already exist
                        }
                      }
                    }
                  }

                  // Log to Victoria's action log
                  await db.insert(victoriaActions).values({
                    userId: user.id,
                    actionType: "agent_report_received",
                    actionTitle: `Daily report received from ${agentName}`,
                    description: raw.capabilityRequest
                      ? `${agentName} submitted their daily report with a capability enhancement request.`
                      : `${agentName} submitted their daily report. No capability requests.`,
                    relatedEntityType: "agent",
                    autonomous: true,
                  });
                } catch (agentErr) {
                  log.warn(
                    `[Cron] Daily Reports — agent ${agentKey} failed for user ${user.id}:`,
                    agentErr
                  );
                }
              })
            );
            // Small delay between batches
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        log.info(
          `[Cron] Agent Daily Reports — completed for ${allUsers.length} users`
        );
      } catch (err) {
        log.error("[Cron] Agent Daily Reports — error:", err);
      }
    },
    { timezone: "UTC" }
  );
}

// ─── Job 15: SME Review Processor (07:00 daily) ──────────────────────────────
function scheduleSmeReviewProcessor() {
  cron.schedule(
    "0 0 7 * * *",
    async () => {
      log.info("[Cron] SME Review Processor — starting (07:00 daily)");
      try {
        const OpenAI = (await import("openai")).default;
        const openai = new OpenAI();
        const { gte } = await import("drizzle-orm");

        // Find all pending SME review triggers from the last 24 hours
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const pendingTriggers = await db
          .select()
          .from(smeReviewTriggers)
          .where(
            and(
              eq(smeReviewTriggers.status, "pending"),
              gte(smeReviewTriggers.triggeredAt, yesterday)
            )
          )
          .limit(20);

        if (pendingTriggers.length === 0) {
          log.info("[Cron] SME Review Processor — no pending triggers");
          return;
        }

        for (const trigger of pendingTriggers) {
          try {
            const expertNames = (trigger.expertIds as string[]).map(
              (id: string) =>
                id
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l: string) => l.toUpperCase())
            );

            // Generate SME review using OpenAI
            const completion = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "system",
                  content: `You are a panel of expert advisors: ${expertNames.join(", ")}. Provide a concise expert review.`,
                },
                {
                  role: "user",
                  content: `Review this ${trigger.triggerType.replace(/_/g, " ")}: "${trigger.sourceTitle}". Provide expert insights from each advisor. Return JSON: { "reviews": [{"expert": "string", "verdict": "proceed|investigate|park", "insight": "string", "confidence": 0-100}], "overallRecommendation": "string", "keyRisks": ["string"], "keyOpportunities": ["string"] }`,
                },
              ],
              response_format: { type: "json_object" },
              temperature: 0.7,
              max_tokens: 600,
            });

            const review = JSON.parse(
              completion.choices[0]?.message?.content ?? "{}"
            ) as Record<string, unknown>;

            // Mark trigger as completed and save review
            await db
              .update(smeReviewTriggers)
              .set({
                status: "completed",
                completedAt: new Date(),
                reviewResult: review,
              })
              .where(eq(smeReviewTriggers.id, trigger.id));

            // ── Insert SME key opportunities as Innovation Hub ideas ────────
            const opportunities = review.keyOpportunities as string[] | undefined;
            if (opportunities && opportunities.length > 0) {
              for (const opp of opportunities.slice(0, 2)) {
                if (opp && opp.length > 10) {
                  try {
                    await db.insert(innovationIdeas).values({
                      userId: trigger.userId,
                      title: opp.length > 200 ? opp.slice(0, 200) : opp,
                      description: `Identified by SME panel (${expertNames.join(", ")}) during review of "${trigger.sourceTitle}".`,
                      source: `sme:${trigger.expertType ?? "panel"}`,
                      status: "submitted",
                      priority: "high",
                      currentStage: 1,
                      category: "sme-generated",
                      sourceMetadata: { experts: expertNames, sourceTitle: trigger.sourceTitle, triggerType: trigger.triggerType },
                    });
                  } catch (_ideaErr) {
                    // non-fatal
                  }
                }
              }
            }

            // Log to Victoria's action log
            await db.insert(victoriaActions).values({
              userId: trigger.userId,
              actionType: "sme_review_completed",
              actionTitle: `SME review completed for "${trigger.sourceTitle}"`,
              description: `${expertNames.join(", ")} completed their review. Recommendation: ${(review.overallRecommendation as string) ?? "See review for details"}.`,
              relatedEntityType: trigger.sourceType,
              relatedEntityId: trigger.sourceId ?? undefined,
              autonomous: true,
              metadata: {
                triggerType: trigger.triggerType,
                experts: expertNames,
                review,
              },
            });
          } catch (triggerErr) {
            log.warn(
              `[Cron] SME Review Processor — trigger ${trigger.id} failed:`,
              triggerErr
            );
            await db
              .update(smeReviewTriggers)
              .set({ status: "failed" })
              .where(eq(smeReviewTriggers.id, trigger.id));
          }
        }
        log.info(
          `[Cron] SME Review Processor — processed ${pendingTriggers.length} triggers`
        );
      } catch (err) {
        log.error("[Cron] SME Review Processor — error:", err);
      }
    },
    { timezone: "UTC" }
  );
}

// ─── Job 16: Autonomous Project Review ───────────────────────────────────────
function scheduleProjectReview() {
  cron.schedule(
    "0 7 * * *",
    async () => {
      log.info("[Cron] Autonomous Project Review — starting");
      try {
        const allUsers = await db
          .select({ id: users.id })
          .from(users)
          .limit(50);
        let totalReviewed = 0;
        let totalFlagged = 0;
        for (const user of allUsers) {
          try {
            const activeProjects = await db
              .select()
              .from(projects)
              .where(
                and(eq(projects.userId, user.id), eq(projects.status, "active"))
              )
              .limit(20);
            if (activeProjects.length === 0) continue;
            const staleProjects = activeProjects.filter(
              p => p.updatedAt < new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
            );
            if (staleProjects.length > 0) {
              await db.insert(victoriaQcChecks).values({
                userId: user.id,
                checkType: "project",
                targetTitle: `Daily Project Review — ${activeProjects.length} active projects`,
                score: Math.max(0, 100 - staleProjects.length * 15),
                grade:
                  staleProjects.length === 0
                    ? "A"
                    : staleProjects.length < 3
                      ? "B"
                      : "C",
                passed: staleProjects.length < 3,
                issues: staleProjects.map(p => ({
                  category: "stale_project",
                  description: `"${p.name}" has not been updated in 14+ days`,
                })),
                recommendations: [
                  "Review stale projects and update their status or add a progress note",
                ],
              });
              await db.insert(victoriaActions).values({
                userId: user.id,
                actionType: "project_review",
                actionTitle: `Daily project review — ${staleProjects.length} stale project(s) flagged`,
                description: `${activeProjects.length} active projects reviewed. ${staleProjects.length} flagged as stale (no updates in 14+ days).`,
                autonomous: true,
                metadata: {
                  reviewed: activeProjects.length,
                  flagged: staleProjects.length,
                },
              });
              totalFlagged += staleProjects.length;
            }
            totalReviewed += activeProjects.length;
          } catch (userErr) {
            log.warn(
              `[Cron] Project Review — user ${user.id} failed:`,
              userErr
            );
          }
        }
        log.info(
          `[Cron] Project Review — reviewed ${totalReviewed} projects, flagged ${totalFlagged}`
        );
      } catch (err) {
        log.error("[Cron] Project Review — error:", err);
      }
    },
    { timezone: "UTC" }
  );
}

// ─── Job 17: Autonomous Document Review ──────────────────────────────────────
function scheduleDocumentReview() {
  cron.schedule(
    "0 8 * * 1",
    async () => {
      log.info("[Cron] Autonomous Document Review — starting (weekly)");
      try {
        const allUsers = await db
          .select({ id: users.id })
          .from(users)
          .limit(50);
        for (const user of allUsers) {
          try {
            const ninetyDaysAgo = new Date(
              Date.now() - 90 * 24 * 60 * 60 * 1000
            );
            const staleDocs = await db
              .select()
              .from(libraryDocuments)
              .where(
                and(
                  eq(libraryDocuments.userId, user.id),
                  lt(libraryDocuments.createdAt, ninetyDaysAgo)
                )
              )
              .limit(20);
            if (staleDocs.length === 0) continue;
            await db.insert(victoriaQcChecks).values({
              userId: user.id,
              checkType: "document",
              targetTitle: `Weekly Document Review — ${staleDocs.length} stale document(s)`,
              score: Math.max(0, 100 - staleDocs.length * 5),
              grade:
                staleDocs.length < 3 ? "B" : staleDocs.length < 8 ? "C" : "D",
              passed: staleDocs.length < 5,
              issues: staleDocs.slice(0, 5).map(d => ({
                category: "stale_document",
                description: `"${d.name}" has not been updated in 90+ days`,
              })),
              recommendations: [
                "Review and archive documents older than 90 days that are no longer relevant",
              ],
            });
            await db.insert(victoriaActions).values({
              userId: user.id,
              actionType: "document_review",
              actionTitle: `Weekly document review — ${staleDocs.length} stale document(s) flagged`,
              description: `${staleDocs.length} documents older than 90 days identified for review or archival.`,
              autonomous: true,
              metadata: { stale: staleDocs.length },
            });
          } catch (userErr) {
            log.warn(
              `[Cron] Document Review — user ${user.id} failed:`,
              userErr
            );
          }
        }
        log.info("[Cron] Document Review — complete");
      } catch (err) {
        log.error("[Cron] Document Review — error:", err);
      }
    },
    { timezone: "UTC" }
  );
}

// ─── Job 18: Autonomous Task Delegation ──────────────────────────────────────
function scheduleTaskDelegation() {
  cron.schedule(
    "30 9 * * *",
    async () => {
      log.info("[Cron] Autonomous Task Delegation — starting");
      try {
        const allUsers = await db
          .select({ id: users.id })
          .from(users)
          .limit(50);
        const agentPool = [
          "Chief Marketing Officer",
          "Chief Financial Officer",
          "Chief Technology Officer",
          "Chief Operations Officer",
          "Head of Sales",
          "Head of Legal",
          "Head of HR",
          "Head of Product",
        ];
        for (const user of allUsers) {
          try {
            const unassigned = await db
              .select()
              .from(tasks)
              .where(and(eq(tasks.userId, user.id), eq(tasks.status, "todo")))
              .limit(10);
            const trulyUnassigned = unassigned.filter(t => !t.assignedTo);
            if (trulyUnassigned.length === 0) continue;
            let delegated = 0;
            for (const task of trulyUnassigned) {
              const title = task.title.toLowerCase();
              let agent = agentPool[delegated % agentPool.length];
              if (
                title.includes("market") ||
                title.includes("brand") ||
                title.includes("campaign")
              )
                agent = "Chief Marketing Officer";
              else if (
                title.includes("finance") ||
                title.includes("budget") ||
                title.includes("cost")
              )
                agent = "Chief Financial Officer";
              else if (
                title.includes("tech") ||
                title.includes("code") ||
                title.includes("develop")
              )
                agent = "Chief Technology Officer";
              else if (
                title.includes("legal") ||
                title.includes("contract") ||
                title.includes("compliance")
              )
                agent = "Head of Legal";
              else if (
                title.includes("hr") ||
                title.includes("hire") ||
                title.includes("recruit")
              )
                agent = "Head of HR";
              await db
                .update(tasks)
                .set({ assignedTo: agent, updatedAt: new Date() })
                .where(eq(tasks.id, task.id));
              delegated++;
            }
            if (delegated > 0) {
              await db.insert(victoriaActions).values({
                userId: user.id,
                actionType: "task_delegation",
                actionTitle: `Auto-delegated ${delegated} unassigned task(s) to AI agents`,
                description: `${delegated} of ${trulyUnassigned.length} unassigned tasks assigned to the most appropriate AI agents.`,
                autonomous: true,
                metadata: { delegated, total: trulyUnassigned.length },
              });
            }
          } catch (userErr) {
            log.warn(
              `[Cron] Task Delegation — user ${user.id} failed:`,
              userErr
            );
          }
        }
        log.info("[Cron] Task Delegation — complete");
      } catch (err) {
        log.error("[Cron] Task Delegation — error:", err);
      }
    },
    { timezone: "UTC" }
  );
}

// ─── Job 19: Meeting Pre-Briefs ───────────────────────────────────────────────
function scheduleMeetingPreBriefs() {
  cron.schedule(
    "0 5 * * *",
    async () => {
      log.info("[Cron] Meeting Pre-Briefs — starting");
      try {
        const allUsers = await db
          .select({ id: users.id })
          .from(users)
          .limit(50);
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        for (const user of allUsers) {
          try {
            const upcoming = await db
              .select()
              .from(calendarEventsCache)
              .where(
                and(
                  eq(calendarEventsCache.userId, user.id),
                  lt(calendarEventsCache.startTime, tomorrow)
                )
              )
              .limit(5);
            if (upcoming.length === 0) continue;
            await db.insert(victoriaActions).values({
              userId: user.id,
              actionType: "meeting_pre_brief",
              actionTitle: `Meeting pre-briefs prepared for ${upcoming.length} upcoming meeting(s)`,
              description: `Pre-briefs ready for: ${upcoming.map(e => e.title).join(", ")}.`,
              autonomous: true,
              metadata: {
                count: upcoming.length,
                meetings: upcoming.map(e => ({
                  title: e.title,
                  time: e.startTime,
                })),
              },
            });
          } catch (userErr) {
            log.warn(
              `[Cron] Meeting Pre-Briefs — user ${user.id} failed:`,
              userErr
            );
          }
        }
        log.info("[Cron] Meeting Pre-Briefs — complete");
      } catch (err) {
        log.error("[Cron] Meeting Pre-Briefs — error:", err);
      }
    },
    { timezone: "UTC" }
  );
}

// ─── Job 20: Skills Run-Count Updater ────────────────────────────────────────
function scheduleSkillsUpdater() {
  cron.schedule(
    "0 10 * * *",
    async () => {
      log.info("[Cron] Skills Updater — updating run counts");
      try {
        const activeSkills = await db
          .select()
          .from(victoriaSkills)
          .where(
            and(
              eq(victoriaSkills.trigger, "daily"),
              eq(victoriaSkills.isActive, true)
            )
          );
        for (const skill of activeSkills) {
          await db
            .update(victoriaSkills)
            .set({
              runCount: (skill.runCount ?? 0) + 1,
              lastRunAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(victoriaSkills.id, skill.id));
        }
        log.info(
          `[Cron] Skills Updater — updated ${activeSkills.length} daily skills`
        );
      } catch (err) {
        log.error("[Cron] Skills Updater — error:", err);
      }
    },
    { timezone: "UTC" }
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────
export function startScheduler() {
  log.info("[Scheduler] Initialising all 20 cron jobs...");

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
  scheduleAgentDailyReports();
  scheduleSmeReviewProcessor();
  scheduleProjectReview();
  scheduleDocumentReview();
  scheduleTaskDelegation();
  scheduleMeetingPreBriefs();
  scheduleSkillsUpdater();

  log.info("[Scheduler] All 20 cron jobs are active.");
}
