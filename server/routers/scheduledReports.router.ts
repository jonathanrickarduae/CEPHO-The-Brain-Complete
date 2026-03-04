/**
 * Scheduled Reports Router — Phase 6 (p6-4)
 *
 * Manages user-configurable scheduled reports delivered by Victoria:
 * - createSchedule: Create a new report schedule (daily/weekly/monthly)
 * - listSchedules: List all report schedules for the user
 * - updateSchedule: Update frequency, recipients, or report type
 * - deleteSchedule: Remove a schedule
 * - generateReport: On-demand report generation for any report type
 * - getReportHistory: Paginated history of generated reports
 *
 * Report types:
 * - "executive_summary": Daily KPI + activity digest
 * - "agent_performance": All 51 agents' performance + ratings
 * - "competitive_intelligence": Latest competitor analysis
 * - "innovation_pipeline": Innovation Hub flywheel status
 * - "financial_overview": Subscription + cost tracking
 * - "custom": User-defined prompt-driven report
 */
import { z } from "zod";
import OpenAI from "openai";
import { router, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import {
  agentDailyReports,
  agentRatings,
  activityFeed,
} from "../../drizzle/schema";
import { eq, desc, count, avg } from "drizzle-orm";
import { getModelForTask } from "../utils/modelRouter";
import { logAiUsage } from "./aiCostTracking.router";

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  return new OpenAI({ apiKey });
}

// ─── In-memory schedule store (production would use a DB table) ──────────────
// For Phase 6, schedules are stored in-memory per user session.
// A future migration will add a `report_schedules` table.
const scheduleStore = new Map<
  number,
  Array<{
    id: string;
    userId: number;
    reportType: string;
    frequency: string;
    recipients: string[];
    isActive: boolean;
    lastRunAt: string | null;
    nextRunAt: string;
    customPrompt: string | null;
    createdAt: string;
  }>
>();

function getUserSchedules(userId: number) {
  if (!scheduleStore.has(userId)) {
    scheduleStore.set(userId, []);
  }
  // Safe: we just set it above if it didn't exist
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return scheduleStore.get(userId)!;
}

function getNextRunAt(frequency: string): string {
  const now = new Date();
  if (frequency === "daily") {
    now.setDate(now.getDate() + 1);
    now.setHours(7, 0, 0, 0);
  } else if (frequency === "weekly") {
    now.setDate(now.getDate() + 7);
    now.setHours(7, 0, 0, 0);
  } else if (frequency === "monthly") {
    now.setMonth(now.getMonth() + 1);
    now.setDate(1);
    now.setHours(7, 0, 0, 0);
  }
  return now.toISOString();
}

export const scheduledReportsRouter = router({
  /**
   * Create a new report schedule
   */
  createSchedule: protectedProcedure
    .input(
      z.object({
        reportType: z.enum([
          "executive_summary",
          "agent_performance",
          "competitive_intelligence",
          "innovation_pipeline",
          "financial_overview",
          "custom",
        ]),
        frequency: z.enum(["daily", "weekly", "monthly"]),
        recipients: z.array(z.string().email()).default([]),
        customPrompt: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const schedules = getUserSchedules(ctx.user.id);
      const schedule = {
        id: `sched_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        userId: ctx.user.id,
        reportType: input.reportType,
        frequency: input.frequency,
        recipients: input.recipients,
        isActive: true,
        lastRunAt: null,
        nextRunAt: getNextRunAt(input.frequency),
        customPrompt: input.customPrompt ?? null,
        createdAt: new Date().toISOString(),
      };
      schedules.push(schedule);
      return { success: true, schedule };
    }),

  /**
   * List all report schedules for the current user
   */
  listSchedules: protectedProcedure.query(async ({ ctx }) => {
    const schedules = getUserSchedules(ctx.user.id);
    return { schedules, total: schedules.length };
  }),

  /**
   * Update a report schedule
   */
  updateSchedule: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        frequency: z.enum(["daily", "weekly", "monthly"]).optional(),
        recipients: z.array(z.string().email()).optional(),
        isActive: z.boolean().optional(),
        customPrompt: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const schedules = getUserSchedules(ctx.user.id);
      const idx = schedules.findIndex(s => s.id === input.id);
      if (idx === -1) throw new Error("Schedule not found");
      const schedule = schedules[idx];
      if (input.frequency) {
        schedule.frequency = input.frequency;
        schedule.nextRunAt = getNextRunAt(input.frequency);
      }
      if (input.recipients !== undefined)
        schedule.recipients = input.recipients;
      if (input.isActive !== undefined) schedule.isActive = input.isActive;
      if (input.customPrompt !== undefined)
        schedule.customPrompt = input.customPrompt;
      return { success: true, schedule };
    }),

  /**
   * Delete a report schedule
   */
  deleteSchedule: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const schedules = getUserSchedules(ctx.user.id);
      const idx = schedules.findIndex(s => s.id === input.id);
      if (idx === -1) throw new Error("Schedule not found");
      schedules.splice(idx, 1);
      return { success: true };
    }),

  /**
   * Generate an on-demand report
   */
  generateReport: protectedProcedure
    .input(
      z.object({
        reportType: z.enum([
          "executive_summary",
          "agent_performance",
          "competitive_intelligence",
          "innovation_pipeline",
          "financial_overview",
          "custom",
        ]),
        customPrompt: z.string().optional(),
        periodDays: z.number().int().min(1).max(90).default(7),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const openai = getOpenAIClient();
      const since = new Date();
      since.setDate(since.getDate() - input.periodDays);

      // Gather context data based on report type
      let contextData = "";

      if (
        input.reportType === "agent_performance" ||
        input.reportType === "executive_summary"
      ) {
        // Get agent daily reports
        const reports = await db
          .select({
            agentName: agentDailyReports.agentName,
            category: agentDailyReports.category,
            achievements: agentDailyReports.achievements,
            capabilityRequest: agentDailyReports.capabilityRequest,
            approvalStatus: agentDailyReports.approvalStatus,
          })
          .from(agentDailyReports)
          .where(eq(agentDailyReports.userId, ctx.user.id))
          .orderBy(desc(agentDailyReports.date))
          .limit(20);

        // Get agent ratings summary
        const ratingsStats = await db
          .select({
            agentName: agentRatings.agentName,
            avgRating: avg(agentRatings.rating),
            totalRatings: count(agentRatings.id),
          })
          .from(agentRatings)
          .where(eq(agentRatings.userId, ctx.user.id))
          .groupBy(agentRatings.agentName);

        contextData = `
Agent Daily Reports (last ${input.periodDays} days, ${reports.length} reports):
${reports
  .map(
    r =>
      `- ${r.agentName} (${r.category}): ${r.achievements ?? "No achievements"} ${r.capabilityRequest ? `[APPROVAL REQUEST: ${JSON.stringify(r.capabilityRequest)}]` : ""}`
  )
  .join("\n")}

Agent Ratings Summary:
${ratingsStats
  .map(
    s =>
      `- ${s.agentName}: ${Number(s.avgRating ?? 0).toFixed(1)}/5 (${s.totalRatings} ratings)`
  )
  .join("\n")}`;
      }

      if (
        input.reportType === "executive_summary" ||
        input.reportType === "innovation_pipeline"
      ) {
        // Get recent activity
        const activities = await db
          .select({
            action: activityFeed.action,
            targetType: activityFeed.targetType,
            description: activityFeed.description,
          })
          .from(activityFeed)
          .where(eq(activityFeed.userId, ctx.user.id))
          .orderBy(desc(activityFeed.createdAt))
          .limit(15);

        contextData += `\n\nRecent Activity (last ${activities.length} items):\n${activities
          .map(a => `- [${a.targetType}] ${a.action}: ${a.description}`)
          .join("\n")}`;
      }

      // Build the report prompt
      const reportTypeLabel = input.reportType.replace(/_/g, " ").toUpperCase();
      const systemPrompt = `You are Victoria, Chief of Staff for CEPHO.AI. Generate a professional, executive-grade ${reportTypeLabel} report.

The report should be:
1. Concise but comprehensive — written for a busy CEO/founder
2. Data-driven where data is available
3. Action-oriented — every section should end with clear next steps
4. Formatted in clean Markdown with headers, tables where appropriate, and bullet points
5. Honest about gaps or missing data

Report Period: Last ${input.periodDays} days
Generated: ${new Date().toISOString()}`;

      const userPrompt =
        input.reportType === "custom" && input.customPrompt
          ? input.customPrompt
          : `Generate a comprehensive ${reportTypeLabel} report based on the following data:\n\n${contextData || "No data available for this period — provide a template report with placeholder sections."}`;

      const completion = await openai.chat.completions.create({
        model: getModelForTask("generate"),
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 2000,
        temperature: 0.3,
      });

      void logAiUsage(
        ctx.user.id,
        "scheduledReports.generateReport",
        completion.model,
        completion.usage
      );

      const report =
        completion.choices[0]?.message?.content ??
        "Unable to generate report. Please try again.";

      return {
        success: true,
        reportType: input.reportType,
        report,
        periodDays: input.periodDays,
        generatedAt: new Date().toISOString(),
        wordCount: report.split(/\s+/).length,
      };
    }),

  /**
   * Get report generation history (activity feed entries)
   */
  getReportHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const history = await db
        .select()
        .from(activityFeed)
        .where(eq(activityFeed.userId, ctx.user.id))
        .orderBy(desc(activityFeed.createdAt))
        .limit(input.limit);

      return {
        history: history.filter(
          h =>
            h.targetType === "scheduled_report" ||
            h.action === "report_generated"
        ),
        total: history.length,
      };
    }),
});
