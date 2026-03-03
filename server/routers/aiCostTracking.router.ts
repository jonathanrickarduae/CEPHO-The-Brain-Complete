/**
 * p5-9/10/11: AI Cost Tracking Router
 *
 * Provides:
 *  - logUsage: called internally by any procedure that uses an LLM
 *  - getSummary: total tokens + cost for the current user (last 30 days)
 *  - getByFeature: breakdown by feature/procedure
 *  - getHistory: paginated raw log for the admin cost report
 *
 * Pricing constants (USD per 1k tokens) are kept here so they can be
 * updated in one place when OpenAI changes its pricing.
 */
import { z } from "zod";
import { desc, eq, gte, sql } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { aiUsageLogs } from "../../drizzle/schema";

// ── Pricing table (USD per 1k tokens) ────────────────────────────────────────
const PRICING: Record<string, { prompt: number; completion: number }> = {
  "gpt-4o": { prompt: 0.005, completion: 0.015 },
  "gpt-4o-mini": { prompt: 0.00015, completion: 0.0006 },
  "gpt-4.1": { prompt: 0.002, completion: 0.008 },
  "gpt-4.1-mini": { prompt: 0.0004, completion: 0.0016 },
  "gpt-4.1-nano": { prompt: 0.0001, completion: 0.0004 },
  "gemini-2.5-flash": { prompt: 0.000075, completion: 0.0003 },
  // Fallback for unknown models
  default: { prompt: 0.001, completion: 0.002 },
};

export function estimateCost(
  model: string,
  promptTokens: number,
  completionTokens: number
): number {
  const pricing = PRICING[model] ?? PRICING.default;
  return (
    (promptTokens / 1000) * pricing.prompt +
    (completionTokens / 1000) * pricing.completion
  );
}

// ── Router ────────────────────────────────────────────────────────────────────
export const aiCostTrackingRouter = router({
  /**
   * Log a single LLM call. Called internally by AI procedures.
   * Also exported as a standalone helper: `logAiUsage(ctx, ...)`.
   */
  logUsage: protectedProcedure
    .input(
      z.object({
        feature: z.string().max(128),
        model: z.string().max(64),
        promptTokens: z.number().int().min(0),
        completionTokens: z.number().int().min(0),
        errorCode: z.string().max(64).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const totalTokens = input.promptTokens + input.completionTokens;
      const estimatedCostUsd = estimateCost(
        input.model,
        input.promptTokens,
        input.completionTokens
      );
      await db.insert(aiUsageLogs).values({
        userId: ctx.user.id,
        feature: input.feature,
        model: input.model,
        promptTokens: input.promptTokens,
        completionTokens: input.completionTokens,
        totalTokens,
        estimatedCostUsd,
        errorCode: input.errorCode ?? null,
      });
      return { logged: true, estimatedCostUsd };
    }),

  /**
   * Aggregated summary for the current user over the last N days.
   */
  getSummary: protectedProcedure
    .input(z.object({ days: z.number().int().min(1).max(365).default(30) }))
    .query(async ({ ctx, input }) => {
      const since = new Date();
      since.setDate(since.getDate() - input.days);

      const rows = await db
        .select({
          totalCalls: sql<number>`count(*)`,
          totalTokens: sql<number>`sum(${aiUsageLogs.totalTokens})`,
          totalCostUsd: sql<number>`sum(${aiUsageLogs.estimatedCostUsd})`,
          promptTokens: sql<number>`sum(${aiUsageLogs.promptTokens})`,
          completionTokens: sql<number>`sum(${aiUsageLogs.completionTokens})`,
        })
        .from(aiUsageLogs)
        .where(
          sql`${aiUsageLogs.userId} = ${ctx.user.id} AND ${aiUsageLogs.createdAt} >= ${since}`
        );

      return {
        days: input.days,
        totalCalls: Number(rows[0]?.totalCalls ?? 0),
        totalTokens: Number(rows[0]?.totalTokens ?? 0),
        promptTokens: Number(rows[0]?.promptTokens ?? 0),
        completionTokens: Number(rows[0]?.completionTokens ?? 0),
        totalCostUsd: Number(rows[0]?.totalCostUsd ?? 0).toFixed(4),
      };
    }),

  /**
   * Cost breakdown by feature (procedure name).
   */
  getByFeature: protectedProcedure
    .input(z.object({ days: z.number().int().min(1).max(365).default(30) }))
    .query(async ({ ctx, input }) => {
      const since = new Date();
      since.setDate(since.getDate() - input.days);

      const rows = await db
        .select({
          feature: aiUsageLogs.feature,
          calls: sql<number>`count(*)`,
          tokens: sql<number>`sum(${aiUsageLogs.totalTokens})`,
          costUsd: sql<number>`sum(${aiUsageLogs.estimatedCostUsd})`,
        })
        .from(aiUsageLogs)
        .where(
          sql`${aiUsageLogs.userId} = ${ctx.user.id} AND ${aiUsageLogs.createdAt} >= ${since}`
        )
        .groupBy(aiUsageLogs.feature)
        .orderBy(desc(sql`sum(${aiUsageLogs.estimatedCostUsd})`));

      return rows.map(r => ({
        feature: r.feature,
        calls: Number(r.calls),
        tokens: Number(r.tokens),
        costUsd: Number(r.costUsd).toFixed(4),
      }));
    }),

  /**
   * Paginated raw log for admin cost report.
   */
  getHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const rows = await db
        .select()
        .from(aiUsageLogs)
        .where(eq(aiUsageLogs.userId, ctx.user.id))
        .orderBy(desc(aiUsageLogs.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return rows.map(r => ({
        id: r.id,
        feature: r.feature,
        model: r.model,
        promptTokens: r.promptTokens,
        completionTokens: r.completionTokens,
        totalTokens: r.totalTokens,
        estimatedCostUsd: r.estimatedCostUsd.toFixed(6),
        errorCode: r.errorCode,
        createdAt: r.createdAt.toISOString(),
      }));
    }),
});

/**
 * Standalone helper — call this from any server-side procedure that uses an LLM.
 *
 * Usage:
 *   import { logAiUsage } from "./aiCostTracking.router";
 *   await logAiUsage(ctx.user.id, "voiceNotes.create", "gpt-4o-mini", usage);
 */
export async function logAiUsage(
  userId: number,
  feature: string,
  model: string,
  usage: { prompt_tokens?: number; completion_tokens?: number },
  errorCode?: string
) {
  const promptTokens = usage.prompt_tokens ?? 0;
  const completionTokens = usage.completion_tokens ?? 0;
  const totalTokens = promptTokens + completionTokens;
  const estimatedCostUsd = estimateCost(model, promptTokens, completionTokens);
  try {
    await db.insert(aiUsageLogs).values({
      userId,
      feature,
      model,
      promptTokens,
      completionTokens,
      totalTokens,
      estimatedCostUsd,
      errorCode: errorCode ?? null,
    });
  } catch {
    // Non-fatal — never let cost logging break the main request
  }
}
