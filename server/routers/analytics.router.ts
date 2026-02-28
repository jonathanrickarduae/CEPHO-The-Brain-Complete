/**
 * Analytics Router (Remediation Task 6.1)
 * Feature Flags Router (Remediation Task 6.3)
 *
 * Lightweight PostHog alternative — no external account needed.
 * Tracks page views, feature usage, and user interactions.
 * Feature flags control rollout of new features.
 */

import { z } from "zod";
import { eq, desc, gte, sql, and } from "drizzle-orm";
import * as crypto from "crypto";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { db } from "../db";
import { analyticsEvents, featureFlags } from "../../drizzle/analytics-schema";

// ── Analytics Router ──────────────────────────────────────────────────────────

export const analyticsRouter = router({
  /**
   * Track an analytics event (page view, feature use, click, etc.)
   */
  track: publicProcedure
    .input(
      z.object({
        eventName: z.string().min(1).max(200),
        eventCategory: z
          .enum([
            "page_view",
            "feature_use",
            "ai_interaction",
            "navigation",
            "error",
            "general",
          ])
          .default("general"),
        properties: z.record(z.string(), z.unknown()).optional(),
        pagePath: z.string().max(500).optional(),
        sessionId: z.string().max(128).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Hash IP for privacy
      const ipHash = ctx.req
        ? crypto
            .createHash("sha256")
            .update(
              (ctx.req.headers["x-forwarded-for"] as string) ||
                ctx.req.socket?.remoteAddress ||
                "unknown"
            )
            .digest("hex")
        : null;

      await db.insert(analyticsEvents).values({
        userId: ctx.user?.id ?? null,
        sessionId: input.sessionId,
        eventName: input.eventName,
        eventCategory: input.eventCategory,
        properties: input.properties ?? {},
        pagePath: input.pagePath,
        userAgent: ctx.req?.headers["user-agent"] ?? null,
        ipHash,
      });

      return { tracked: true };
    }),

  /**
   * Get analytics summary for the dashboard
   */
  getSummary: protectedProcedure
    .input(
      z.object({
        days: z.number().int().min(1).max(90).default(30),
      })
    )
    .query(async ({ input }) => {
      const since = new Date();
      since.setDate(since.getDate() - input.days);

      const [totalEvents, topEvents, topPages, dailyActivity] =
        await Promise.all([
          // Total event count
          db
            .select({ count: sql<number>`count(*)` })
            .from(analyticsEvents)
            .where(gte(analyticsEvents.createdAt, since)),

          // Top 10 events by name
          db
            .select({
              eventName: analyticsEvents.eventName,
              count: sql<number>`count(*) as count`,
            })
            .from(analyticsEvents)
            .where(gte(analyticsEvents.createdAt, since))
            .groupBy(analyticsEvents.eventName)
            .orderBy(desc(sql`count`))
            .limit(10),

          // Top 10 pages
          db
            .select({
              pagePath: analyticsEvents.pagePath,
              count: sql<number>`count(*) as count`,
            })
            .from(analyticsEvents)
            .where(
              and(
                gte(analyticsEvents.createdAt, since),
                eq(analyticsEvents.eventCategory, "page_view")
              )
            )
            .groupBy(analyticsEvents.pagePath)
            .orderBy(desc(sql`count`))
            .limit(10),

          // Daily activity for the period
          db
            .select({
              date: sql<string>`date_trunc('day', ${analyticsEvents.createdAt})::date`,
              count: sql<number>`count(*) as count`,
            })
            .from(analyticsEvents)
            .where(gte(analyticsEvents.createdAt, since))
            .groupBy(sql`date_trunc('day', ${analyticsEvents.createdAt})`)
            .orderBy(sql`date_trunc('day', ${analyticsEvents.createdAt})`),
        ]);

      return {
        totalEvents: Number(totalEvents[0]?.count ?? 0),
        topEvents,
        topPages: topPages.filter(p => p.pagePath),
        dailyActivity,
        period: { days: input.days, since: since.toISOString() },
      };
    }),
});

// ── Feature Flags Router ──────────────────────────────────────────────────────

export const featureFlagsRouter = router({
  /**
   * Get all feature flags (admin only)
   */
  list: protectedProcedure.query(async () => {
    return db
      .select()
      .from(featureFlags)
      .orderBy(featureFlags.key);
  }),

  /**
   * Check if a specific feature flag is enabled for the current user
   */
  isEnabled: publicProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ ctx, input }) => {
      const [flag] = await db
        .select()
        .from(featureFlags)
        .where(eq(featureFlags.key, input.key))
        .limit(1);

      if (!flag) return { enabled: false };
      if (!flag.enabled) return { enabled: false };

      // 100% rollout — always enabled
      if (flag.rolloutPercentage >= 100) return { enabled: true };

      // Check specific user IDs
      const userIds = (flag.userIds as number[]) ?? [];
      if (ctx.user?.id && userIds.includes(ctx.user.id)) {
        return { enabled: true };
      }

      // Percentage rollout — deterministic based on user ID
      if (ctx.user?.id && flag.rolloutPercentage > 0) {
        const hash = crypto
          .createHash("sha256")
          .update(`${flag.key}:${ctx.user.id}`)
          .digest("hex");
        const bucket = parseInt(hash.slice(0, 8), 16) % 100;
        return { enabled: bucket < flag.rolloutPercentage };
      }

      return { enabled: false };
    }),

  /**
   * Get all enabled flags for the current user (bulk check)
   */
  getAll: publicProcedure.query(async ({ ctx }) => {
    const flags = await db.select().from(featureFlags);

    const result: Record<string, boolean> = {};

    for (const flag of flags) {
      if (!flag.enabled) {
        result[flag.key] = false;
        continue;
      }
      if (flag.rolloutPercentage >= 100) {
        result[flag.key] = true;
        continue;
      }
      const userIds = (flag.userIds as number[]) ?? [];
      if (ctx.user?.id && userIds.includes(ctx.user.id)) {
        result[flag.key] = true;
        continue;
      }
      if (ctx.user?.id && flag.rolloutPercentage > 0) {
        const hash = crypto
          .createHash("sha256")
          .update(`${flag.key}:${ctx.user.id}`)
          .digest("hex");
        const bucket = parseInt(hash.slice(0, 8), 16) % 100;
        result[flag.key] = bucket < flag.rolloutPercentage;
      } else {
        result[flag.key] = false;
      }
    }

    return result;
  }),

  /**
   * Update a feature flag (admin only)
   */
  update: protectedProcedure
    .input(
      z.object({
        key: z.string(),
        enabled: z.boolean().optional(),
        rolloutPercentage: z.number().int().min(0).max(100).optional(),
        userIds: z.array(z.number()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { key, ...updates } = input;

      const [updated] = await db
        .update(featureFlags)
        .set(updates)
        .where(eq(featureFlags.key, key))
        .returning();

      if (!updated) throw new Error(`Feature flag '${key}' not found`);
      return updated;
    }),
});
