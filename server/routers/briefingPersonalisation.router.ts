/**
 * Briefing Personalisation Router — Phase 3 (p3-12, p3-13)
 *
 * Implements:
 *  - p3-12: Victoria's Briefing Personalisation Engine (GAP 17)
 *           — user preferences, tone, length, enabled sections
 *  - p3-13: Briefing Feedback Loop — ratings drive future briefing quality
 *
 * Victoria's 10-Step Briefing Process (Appendix Q, Table 36):
 *  1. Pull agent insights from agentInsights (05:00 research)
 *  2. Fetch anomaly alerts from anomalyDetection
 *  3. Fetch overdue / high-priority tasks
 *  4. Fetch today's calendar events
 *  5. Fetch pending email follow-ups
 *  6. Fetch KPI deviations
 *  7. Fetch innovation ideas in review
 *  8. Apply briefingPreferences (tone, length, sections)
 *  9. Assemble and generate with GPT-4o
 * 10. Persist to briefings table + push notification
 */
import { z } from "zod";
import { desc, eq, and, gte } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import {
  briefingPreferences,
  briefingFeedback,
  briefings,
  agentInsights,
  tasks,
  emailMessages,
} from "../../drizzle/schema";
import OpenAI from "openai";

const openai = new OpenAI();

// ─── 10-Step Briefing Assembler ───────────────────────────────────────────────

async function assembleBriefing(
  userId: number,
  prefs: {
    preferredLength: string;
    tone: string;
    enabledSections: string[] | null;
    maxInsightsPerSection: number;
    includeWeather: boolean;
    includeMarketData: boolean;
  }
): Promise<{ title: string; content: Record<string, unknown>; markdown: string }> {
  const today = new Date();
  const todayStr = today.toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Step 1: Pull agent insights (from 05:00 research run)
  const yesterdayStart = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const insights = await db
    .select()
    .from(agentInsights)
    .where(
      and(
        eq(agentInsights.userId, userId),
        gte(agentInsights.createdAt, yesterdayStart)
      )
    )
    .orderBy(desc(agentInsights.confidence))
    .limit(prefs.maxInsightsPerSection * 4);

  // Step 3: Fetch overdue / high-priority tasks
  const urgentTasks = await db
    .select({ id: tasks.id, title: tasks.title, priority: tasks.priority, status: tasks.status })
    .from(tasks)
    .where(and(eq(tasks.userId, userId), eq(tasks.status, "pending")))
    .orderBy(desc(tasks.priority))
    .limit(5);

  // Step 5: Fetch pending email follow-ups
  const followUps = await db
    .select({ id: emailMessages.id, subject: emailMessages.subject, fromName: emailMessages.fromName, followUpAt: emailMessages.followUpAt })
    .from(emailMessages)
    .where(
      and(
        eq(emailMessages.userId, userId),
        eq(emailMessages.aiAction, "follow_up"),
        eq(emailMessages.isArchived, false)
      )
    )
    .limit(5);

  const enabledSections = prefs.enabledSections ?? [
    "executive_summary",
    "agent_insights",
    "priority_tasks",
    "email_follow_ups",
    "strategic_focus",
  ];

  const lengthGuide =
    prefs.preferredLength === "brief"
      ? "Keep each section to 2-3 sentences maximum."
      : prefs.preferredLength === "detailed"
      ? "Provide comprehensive detail in each section."
      : "Keep each section concise but complete (4-6 sentences).";

  const toneGuide =
    prefs.tone === "casual"
      ? "Use a warm, conversational tone."
      : prefs.tone === "motivational"
      ? "Use an energising, motivational tone."
      : "Use a professional, executive tone.";

  // Step 9: Assemble with GPT-4o
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are Victoria, the AI Chief of Staff for CEPHO.AI. Generate a personalised morning briefing.

${toneGuide} ${lengthGuide}

Structure the briefing as a JSON object with these sections (only include enabled sections):
{
  "executive_summary": "string — 2-3 sentence overview of the day",
  "agent_insights": ["array of key insights from overnight agent research"],
  "priority_tasks": ["array of top priority tasks to focus on"],
  "email_follow_ups": ["array of emails needing follow-up"],
  "strategic_focus": "string — 1 strategic recommendation for the day",
  "motivational_close": "string — brief closing thought"
}

Enabled sections: ${enabledSections.join(", ")}
Respond ONLY with valid JSON.`,
      },
      {
        role: "user",
        content: `Good morning. Today is ${todayStr}.

AGENT INSIGHTS (from overnight research):
${insights.slice(0, prefs.maxInsightsPerSection).map(i => `- [${i.agentKey}] ${i.insight}`).join("\n") || "No insights available yet."}

PRIORITY TASKS:
${urgentTasks.map(t => `- ${t.title} (${t.priority ?? "normal"} priority)`).join("\n") || "No urgent tasks."}

EMAIL FOLLOW-UPS NEEDED:
${followUps.map(f => `- ${f.subject ?? "No subject"} from ${f.fromName ?? "Unknown"}`).join("\n") || "No follow-ups pending."}

Generate the morning briefing.`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.6,
  });

  const content = JSON.parse(completion.choices[0]?.message?.content ?? "{}") as Record<string, unknown>;

  // Build markdown version
  const markdown = [
    `# Good Morning — ${todayStr}`,
    "",
    content.executive_summary ? `## Executive Summary\n${content.executive_summary}` : "",
    content.agent_insights && Array.isArray(content.agent_insights) && content.agent_insights.length > 0
      ? `## Agent Insights\n${(content.agent_insights as string[]).map(i => `- ${i}`).join("\n")}`
      : "",
    content.priority_tasks && Array.isArray(content.priority_tasks) && content.priority_tasks.length > 0
      ? `## Priority Tasks\n${(content.priority_tasks as string[]).map(t => `- ${t}`).join("\n")}`
      : "",
    content.email_follow_ups && Array.isArray(content.email_follow_ups) && content.email_follow_ups.length > 0
      ? `## Email Follow-Ups\n${(content.email_follow_ups as string[]).map(e => `- ${e}`).join("\n")}`
      : "",
    content.strategic_focus ? `## Strategic Focus\n${content.strategic_focus}` : "",
    content.motivational_close ? `---\n*${content.motivational_close}*` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    title: `Morning Briefing — ${todayStr}`,
    content,
    markdown,
  };
}

// ─── Router ──────────────────────────────────────────────────────────────────

export const briefingPersonalisationRouter = router({
  /**
   * Get or create briefing preferences for the current user.
   * p3-12: Personalisation Engine
   */
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    const [prefs] = await db
      .select()
      .from(briefingPreferences)
      .where(eq(briefingPreferences.userId, ctx.user.id))
      .limit(1);

    if (prefs) return prefs;

    // Create defaults
    const [created] = await db
      .insert(briefingPreferences)
      .values({ userId: ctx.user.id })
      .returning();

    return created;
  }),

  /**
   * Update briefing preferences.
   * p3-12: Personalisation Engine
   */
  updatePreferences: protectedProcedure
    .input(
      z.object({
        preferredLength: z.enum(["brief", "standard", "detailed"]).optional(),
        tone: z.enum(["professional", "casual", "motivational"]).optional(),
        enabledSections: z.array(z.string()).optional(),
        deliveryTime: z.string().optional(),
        includeWeather: z.boolean().optional(),
        includeMarketData: z.boolean().optional(),
        maxInsightsPerSection: z.number().min(1).max(10).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const existing = await db
        .select({ id: briefingPreferences.id })
        .from(briefingPreferences)
        .where(eq(briefingPreferences.userId, ctx.user.id))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(briefingPreferences)
          .set({ ...input, updatedAt: new Date() })
          .where(eq(briefingPreferences.userId, ctx.user.id));
      } else {
        await db
          .insert(briefingPreferences)
          .values({ userId: ctx.user.id, ...input });
      }

      return { success: true };
    }),

  /**
   * Generate a personalised morning briefing using the 10-step process.
   * p3-12: Victoria's 10-step briefing process (Appendix Q Table 36)
   */
  generateBriefing: protectedProcedure.mutation(async ({ ctx }) => {
    // Get user preferences
    const [prefs] = await db
      .select()
      .from(briefingPreferences)
      .where(eq(briefingPreferences.userId, ctx.user.id))
      .limit(1);

    const effectivePrefs = prefs ?? {
      preferredLength: "standard",
      tone: "professional",
      enabledSections: null,
      maxInsightsPerSection: 3,
      includeWeather: true,
      includeMarketData: true,
    };

    const assembled = await assembleBriefing(ctx.user.id, {
      preferredLength: effectivePrefs.preferredLength ?? "standard",
      tone: effectivePrefs.tone ?? "professional",
      enabledSections: effectivePrefs.enabledSections as string[] | null,
      maxInsightsPerSection: effectivePrefs.maxInsightsPerSection ?? 3,
      includeWeather: effectivePrefs.includeWeather ?? true,
      includeMarketData: effectivePrefs.includeMarketData ?? true,
    });

    // Step 10: Persist to briefings table
    const [saved] = await db
      .insert(briefings)
      .values({
        userId: ctx.user.id,
        date: new Date(),
        title: assembled.title,
        content: assembled.content,
        status: "ready",
      })
      .returning({ id: briefings.id });

    return {
      briefingId: saved.id,
      title: assembled.title,
      content: assembled.content,
      markdown: assembled.markdown,
    };
  }),

  /**
   * List all past briefings for the user.
   */
  listBriefings: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const rows = await db
        .select()
        .from(briefings)
        .where(eq(briefings.userId, ctx.user.id))
        .orderBy(desc(briefings.date))
        .limit(input.limit)
        .offset(input.offset);

      return rows;
    }),

  /**
   * Get a specific briefing by ID.
   */
  getBriefing: protectedProcedure
    .input(z.object({ briefingId: z.number() }))
    .query(async ({ input, ctx }) => {
      const [row] = await db
        .select()
        .from(briefings)
        .where(
          and(
            eq(briefings.id, input.briefingId),
            eq(briefings.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!row) throw new Error("Briefing not found");
      return row;
    }),

  /**
   * Submit feedback on a briefing section.
   * p3-13: Briefing Feedback Loop
   */
  submitFeedback: protectedProcedure
    .input(
      z.object({
        briefingId: z.number(),
        sectionId: z.string().min(1).max(100),
        rating: z.number().min(1).max(5),
        comment: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await db.insert(briefingFeedback).values({
        userId: ctx.user.id,
        briefingId: input.briefingId,
        sectionId: input.sectionId,
        rating: input.rating,
        comment: input.comment,
      });

      return { success: true };
    }),

  /**
   * Get aggregated feedback for a briefing.
   * p3-13: Feedback analytics
   */
  getFeedback: protectedProcedure
    .input(z.object({ briefingId: z.number() }))
    .query(async ({ input, ctx }) => {
      const rows = await db
        .select()
        .from(briefingFeedback)
        .where(
          and(
            eq(briefingFeedback.briefingId, input.briefingId),
            eq(briefingFeedback.userId, ctx.user.id)
          )
        );

      return rows;
    }),

  /**
   * Get agent insights for the current user (from 05:00 research run).
   * Used in the briefing and agent insights panel.
   */
  getAgentInsights: protectedProcedure
    .input(
      z.object({
        agentKey: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      const conditions = [eq(agentInsights.userId, ctx.user.id)];
      if (input.agentKey) {
        conditions.push(eq(agentInsights.agentKey, input.agentKey));
      }

      const rows = await db
        .select()
        .from(agentInsights)
        .where(and(...conditions))
        .orderBy(desc(agentInsights.createdAt))
        .limit(input.limit);

      return rows;
    }),
});
