/**
 * KPI & OKR Router — AUTO-05
 *
 * Manages AI-generated KPIs and OKR tracking.
 * Agents can suggest KPIs; users can accept, edit, and track them.
 * OKRs are structured as Objective + Key Results with progress tracking.
 */

import { z } from "zod";
import OpenAI from "openai";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { kpis, okrs, okrKeyResults, tasks } from "../../drizzle/schema";
import { eq, and, desc, asc } from "drizzle-orm";
import { logger } from "../utils/logger";
const log = logger.module("kpiOkr");
import { eventBus } from "../services/eventBus";

function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  return new OpenAI({ apiKey });
}

// ─── KPI Router ───────────────────────────────────────────────────────────────

const kpiRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        includeInactive: z.boolean().optional().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(kpis.userId, ctx.user.id)];
      if (!input.includeInactive) {
        conditions.push(eq(kpis.isActive, true));
      }
      return db
        .select()
        .from(kpis)
        .where(and(...conditions))
        .orderBy(desc(kpis.createdAt));
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(200),
        description: z.string().optional(),
        unit: z.string().optional(),
        targetValue: z.string().optional(),
        currentValue: z.string().optional(),
        category: z.string().optional(),
        suggestedByAgent: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [kpi] = await db
        .insert(kpis)
        .values({
          userId: ctx.user.id,
          ...input,
          status: "on_track",
          trend: "stable",
          isActive: true,
        })
        .returning();
      log.info(`[KPI] Created KPI "${input.name}" for user ${ctx.user.id}`);
      return kpi;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        currentValue: z.string().optional(),
        targetValue: z.string().optional(),
        status: z
          .enum(["on_track", "at_risk", "behind", "achieved"])
          .optional(),
        trend: z.enum(["up", "down", "stable"]).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;
      const [kpi] = await db
        .update(kpis)
        .set({ ...updates, lastTrackedAt: new Date(), updatedAt: new Date() })
        .where(and(eq(kpis.id, id), eq(kpis.userId, ctx.user.id)))
        .returning();

      // Check if KPI breached threshold
      if (
        kpi &&
        kpi.targetValue &&
        kpi.currentValue &&
        (kpi.status === "behind" || kpi.status === "at_risk")
      ) {
        await eventBus.publish({
          type: "kpi.threshold_breached",
          userId: ctx.user.id,
          payload: {
            kpiName: kpi.name,
            currentValue: kpi.currentValue,
            targetValue: kpi.targetValue,
            status: kpi.status,
          },
          timestamp: new Date(),
          source: "kpi-update",
        });
      }

      return kpi;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .update(kpis)
        .set({ isActive: false, updatedAt: new Date() })
        .where(and(eq(kpis.id, input.id), eq(kpis.userId, ctx.user.id)));
      return { success: true };
    }),

  /**
   * Ask the AI to suggest KPIs based on the user's current tasks and projects.
   */
  suggestFromContext: protectedProcedure.mutation(async ({ ctx }) => {
    const openai = getOpenAI();

    // Get recent tasks for context
    const recentTasks = await db
      .select({
        title: tasks.title,
        status: tasks.status,
        priority: tasks.priority,
      })
      .from(tasks)
      .where(eq(tasks.userId, ctx.user.id))
      .orderBy(desc(tasks.createdAt))
      .limit(20);

    const taskSummary = recentTasks
      .map(t => `- ${t.title} (${t.status}, ${t.priority})`)
      .join("\n");

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `You are CEPHO's KPI advisor. Based on the user's tasks, suggest 3-5 meaningful KPIs they should track.
Return ONLY valid JSON array:
[
  {
    "name": "KPI name",
    "description": "Why this matters",
    "unit": "£ / % / count / hours / etc",
    "targetValue": "suggested target",
    "category": "financial|operational|growth|quality|team",
    "suggestedByAgent": "kpi-advisor"
  }
]`,
        },
        {
          role: "user",
          content: `My recent tasks:\n${taskSummary || "No tasks yet."}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 800,
    });

    const content = response.choices[0]?.message?.content ?? "{}";
    let suggestions: Array<{
      name: string;
      description?: string;
      unit?: string;
      targetValue?: string;
      category?: string;
      suggestedByAgent?: string;
    }> = [];

    try {
      const parsed = JSON.parse(content);
      suggestions = Array.isArray(parsed) ? parsed : (parsed.kpis ?? []);
    } catch {
      suggestions = [];
    }

    return { suggestions };
  }),
});

// ─── OKR Router ───────────────────────────────────────────────────────────────

const okrRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        quarter: z.string().optional(),
        status: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(okrs.userId, ctx.user.id)];
      if (input.quarter) conditions.push(eq(okrs.quarter, input.quarter));
      if (input.status) conditions.push(eq(okrs.status, input.status));

      const okrList = await db
        .select()
        .from(okrs)
        .where(and(...conditions))
        .orderBy(desc(okrs.createdAt));

      // Fetch key results for each OKR
      const okrIds = okrList.map(o => o.id);
      const allKeyResults =
        okrIds.length > 0
          ? await db
              .select()
              .from(okrKeyResults)
              .where(eq(okrKeyResults.userId, ctx.user.id))
              .orderBy(asc(okrKeyResults.id))
          : [];

      return okrList.map(okr => ({
        ...okr,
        keyResults: allKeyResults.filter(kr => kr.okrId === okr.id),
      }));
    }),

  create: protectedProcedure
    .input(
      z.object({
        objective: z.string().min(1).max(500),
        quarter: z.string().min(1).max(10),
        suggestedByAgent: z.string().optional(),
        keyResults: z
          .array(
            z.object({
              title: z.string().min(1),
              targetValue: z.string().optional(),
              unit: z.string().optional(),
            })
          )
          .optional()
          .default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [okr] = await db
        .insert(okrs)
        .values({
          userId: ctx.user.id,
          objective: input.objective,
          quarter: input.quarter,
          status: "active",
          overallProgress: 0,
          suggestedByAgent: input.suggestedByAgent,
        })
        .returning();

      const insertedKrs = [];
      for (const kr of input.keyResults) {
        const [keyResult] = await db
          .insert(okrKeyResults)
          .values({
            okrId: okr.id,
            userId: ctx.user.id,
            title: kr.title,
            targetValue: kr.targetValue,
            unit: kr.unit,
            progress: 0,
            status: "active",
          })
          .returning();
        insertedKrs.push(keyResult);
      }

      log.info(
        `[OKR] Created OKR "${input.objective}" for user ${ctx.user.id}`
      );
      return { ...okr, keyResults: insertedKrs };
    }),

  updateKeyResult: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        currentValue: z.string().optional(),
        progress: z.number().min(0).max(100).optional(),
        status: z.enum(["active", "completed", "cancelled"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;
      const [kr] = await db
        .update(okrKeyResults)
        .set({ ...updates, updatedAt: new Date() })
        .where(
          and(eq(okrKeyResults.id, id), eq(okrKeyResults.userId, ctx.user.id))
        )
        .returning();

      // Recalculate OKR overall progress
      if (kr) {
        const allKrs = await db
          .select()
          .from(okrKeyResults)
          .where(eq(okrKeyResults.okrId, kr.okrId));

        const avgProgress =
          allKrs.length > 0
            ? Math.round(
                allKrs.reduce((sum, k) => sum + (k.progress ?? 0), 0) /
                  allKrs.length
              )
            : 0;

        await db
          .update(okrs)
          .set({ overallProgress: avgProgress, updatedAt: new Date() })
          .where(eq(okrs.id, kr.okrId));

        // Publish OKR progress event
        await eventBus.publish({
          type: "okr.progress_updated",
          userId: ctx.user.id,
          payload: { okrId: kr.okrId, keyResultId: id, progress: avgProgress },
          timestamp: new Date(),
          source: "okr-update",
        });
      }

      return kr;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .update(okrs)
        .set({ status: "cancelled", updatedAt: new Date() })
        .where(and(eq(okrs.id, input.id), eq(okrs.userId, ctx.user.id)));
      return { success: true };
    }),

  /**
   * Ask the AI to suggest OKRs for the next quarter.
   */
  suggestForQuarter: protectedProcedure
    .input(z.object({ quarter: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const openai = getOpenAI();

      const recentTasks = await db
        .select({ title: tasks.title, status: tasks.status })
        .from(tasks)
        .where(eq(tasks.userId, ctx.user.id))
        .orderBy(desc(tasks.createdAt))
        .limit(15);

      const taskSummary = recentTasks
        .map(t => `- ${t.title} (${t.status})`)
        .join("\n");

      const response = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: `You are CEPHO's OKR advisor. Suggest 2-3 OKRs for ${input.quarter} based on the user's work.
Return ONLY valid JSON:
{
  "okrs": [
    {
      "objective": "Objective statement",
      "quarter": "${input.quarter}",
      "keyResults": [
        { "title": "Key result 1", "targetValue": "target", "unit": "unit" }
      ]
    }
  ]
}`,
          },
          {
            role: "user",
            content: `My recent work:\n${taskSummary || "No tasks yet."}`,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content ?? "{}";
      let suggestions: Array<{
        objective: string;
        quarter: string;
        keyResults: Array<{
          title: string;
          targetValue?: string;
          unit?: string;
        }>;
      }> = [];

      try {
        const parsed = JSON.parse(content);
        suggestions = parsed.okrs ?? [];
      } catch {
        suggestions = [];
      }

      return { suggestions, quarter: input.quarter };
    }),
});

// ─── Combined Router ──────────────────────────────────────────────────────────

export const kpiOkrRouter = router({
  kpi: kpiRouter,
  okr: okrRouter,
});
