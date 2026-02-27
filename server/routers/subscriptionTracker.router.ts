/**
 * Subscription Tracker Router — Real Implementation
 *
 * Manages software subscriptions: CRUD, cost analysis, renewal tracking.
 */
import { z } from "zod";
import { desc, eq, and, gte } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { subscriptions } from "../../drizzle/schema";

const BILLING_CYCLES = ["monthly", "quarterly", "annual", "one_time"] as const;
const CATEGORIES = [
  "productivity",
  "communication",
  "development",
  "design",
  "marketing",
  "finance",
  "hr",
  "analytics",
  "infrastructure",
  "other",
] as const;
const STATUSES = ["active", "trial", "cancelled", "paused"] as const;

export const subscriptionTrackerRouter = router({
  /**
   * Get all subscriptions for the current user.
   */
  getAll: protectedProcedure
    .input(
      z.object({
        category: z.string().optional(),
        status: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const rows = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, ctx.user.id))
        .orderBy(desc(subscriptions.createdAt));

      return rows
        .filter(r => !input.category || r.category === input.category)
        .filter(r => !input.status || r.status === input.status)
        .map(s => ({
          id: s.id,
          name: s.name,
          provider: s.provider,
          description: s.description,
          category: s.category,
          cost: s.cost,
          billingCycle: s.billingCycle,
          currency: s.currency,
          status: s.status,
          startDate: s.startDate?.toISOString() ?? null,
          renewalDate: s.renewalDate?.toISOString() ?? null,
          trialEndDate: s.trialEndDate?.toISOString() ?? null,
          usagePercent: s.usagePercent,
          websiteUrl: s.websiteUrl,
          notes: s.notes,
          createdAt: s.createdAt.toISOString(),
        }));
    }),

  /**
   * Get summary stats: total cost, by category, upcoming renewals.
   */
  getSummary: protectedProcedure.query(async ({ ctx }) => {
    const rows = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, ctx.user.id),
          eq(subscriptions.status, "active")
        )
      );

    // Monthly cost calculation
    const totalMonthlyCost = rows.reduce((sum, s) => {
      const monthly =
        s.billingCycle === "monthly"
          ? s.cost
          : s.billingCycle === "quarterly"
            ? s.cost / 3
            : s.billingCycle === "annual"
              ? s.cost / 12
              : 0;
      return sum + monthly;
    }, 0);

    const byCategory = rows.reduce(
      (acc, s) => {
        const cat = s.category ?? "other";
        if (!acc[cat]) acc[cat] = 0;
        const monthly =
          s.billingCycle === "monthly"
            ? s.cost
            : s.billingCycle === "quarterly"
              ? s.cost / 3
              : s.billingCycle === "annual"
                ? s.cost / 12
                : 0;
        acc[cat] += monthly;
        return acc;
      },
      {} as Record<string, number>
    );

    // Upcoming renewals in next 30 days
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const upcomingRenewals = rows
      .filter(s => s.renewalDate && s.renewalDate <= thirtyDaysFromNow)
      .map(s => ({
        id: s.id,
        name: s.name,
        cost: s.cost,
        currency: s.currency,
        renewalDate: s.renewalDate!.toISOString(),
      }));

    return {
      totalMonthlyCost: Math.round(totalMonthlyCost * 100) / 100,
      totalAnnualCost: Math.round(totalMonthlyCost * 12 * 100) / 100,
      activeCount: rows.length,
      byCategory,
      upcomingRenewals,
      currency: "AED",
    };
  }),

  /**
   * Get cost history for the past N months.
   */
  getCostHistory: protectedProcedure
    .input(z.object({ months: z.number().min(1).max(24).default(12) }))
    .query(async ({ input, ctx }) => {
      const rows = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, ctx.user.id));

      // Build monthly history (simplified — uses current costs projected back)
      const history = Array.from({ length: input.months }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (input.months - 1 - i));
        const label = date.toLocaleDateString("en-GB", {
          month: "short",
          year: "2-digit",
        });
        const activeSubs = rows.filter(
          s => s.status === "active" && (!s.startDate || s.startDate <= date)
        );
        const cost = activeSubs.reduce((sum, s) => {
          const monthly =
            s.billingCycle === "monthly"
              ? s.cost
              : s.billingCycle === "quarterly"
                ? s.cost / 3
                : s.billingCycle === "annual"
                  ? s.cost / 12
                  : 0;
          return sum + monthly;
        }, 0);
        return { month: label, cost: Math.round(cost * 100) / 100 };
      });

      return { history };
    }),

  /**
   * Get renewal summary for the next 90 days.
   */
  getRenewalSummary: protectedProcedure.query(async ({ ctx }) => {
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

    const rows = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, ctx.user.id),
          eq(subscriptions.status, "active")
        )
      );

    const upcoming = rows
      .filter(s => s.renewalDate && s.renewalDate <= ninetyDaysFromNow)
      .sort(
        (a, b) =>
          (a.renewalDate?.getTime() ?? 0) - (b.renewalDate?.getTime() ?? 0)
      )
      .map(s => ({
        id: s.id,
        name: s.name,
        cost: s.cost,
        currency: s.currency,
        billingCycle: s.billingCycle,
        renewalDate: s.renewalDate!.toISOString(),
        daysUntilRenewal: Math.ceil(
          ((s.renewalDate?.getTime() ?? 0) - Date.now()) / (1000 * 60 * 60 * 24)
        ),
      }));

    return {
      upcoming,
      totalUpcomingCost: upcoming.reduce((sum, s) => sum + s.cost, 0),
    };
  }),

  /**
   * Create a new subscription.
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(200),
        provider: z.string().optional(),
        description: z.string().optional(),
        category: z.string().default("other"),
        cost: z.number().min(0),
        billingCycle: z.enum(BILLING_CYCLES),
        currency: z.string().default("AED"),
        status: z.enum(STATUSES).default("active"),
        startDate: z.string().optional(),
        renewalDate: z.string().optional(),
        trialEndDate: z.string().optional(),
        usagePercent: z.number().min(0).max(100).optional(),
        websiteUrl: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [sub] = await db
        .insert(subscriptions)
        .values({
          userId: ctx.user.id,
          name: input.name,
          provider: input.provider ?? null,
          description: input.description ?? null,
          category: input.category,
          cost: input.cost,
          billingCycle: input.billingCycle,
          currency: input.currency,
          status: input.status,
          startDate: input.startDate ? new Date(input.startDate) : null,
          renewalDate: input.renewalDate ? new Date(input.renewalDate) : null,
          trialEndDate: input.trialEndDate
            ? new Date(input.trialEndDate)
            : null,
          usagePercent: input.usagePercent ?? null,
          websiteUrl: input.websiteUrl ?? null,
          notes: input.notes ?? null,
        })
        .returning();

      return {
        id: sub.id,
        name: sub.name,
        cost: sub.cost,
        createdAt: sub.createdAt.toISOString(),
      };
    }),

  /**
   * Update a subscription.
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(200).optional(),
        cost: z.number().min(0).optional(),
        status: z.enum(STATUSES).optional(),
        usagePercent: z.number().min(0).max(100).optional(),
        renewalDate: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, renewalDate, ...rest } = input;
      await db
        .update(subscriptions)
        .set({
          ...rest,
          renewalDate: renewalDate ? new Date(renewalDate) : undefined,
          updatedAt: new Date(),
        })
        .where(
          and(eq(subscriptions.id, id), eq(subscriptions.userId, ctx.user.id))
        );

      return { success: true };
    }),

  /**
   * Delete a subscription.
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await db
        .delete(subscriptions)
        .where(
          and(
            eq(subscriptions.id, input.id),
            eq(subscriptions.userId, ctx.user.id)
          )
        );

      return { success: true };
    }),
});
