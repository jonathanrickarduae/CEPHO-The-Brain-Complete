/**
 * Subscriptiontracker Router
 * 
 * Auto-extracted from monolithic routers.ts
 * 
 * @module routers/domains/subscription-tracker
 */

import { router } from "../../_core/trpc";
import { z } from "zod";

export const subscriptionTrackerRouter = router({
    // Get all subscriptions for user
    getAll: protectedProcedure
      .input(z.object({
        status: z.string().optional(),
        category: z.string().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        const { getSubscriptions } = await import('../../db');
        return getSubscriptions(ctx.user.id, input);
      }),

    // Get subscription by ID
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const { getSubscriptionById } = await import('../../db');
        const sub = await getSubscriptionById(input.id);
        if (!sub || sub.userId !== ctx.user.id) {
          throw new Error('Subscription not found');
        }
        return sub;
      }),

    // Create a new subscription
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        provider: z.string().optional(),
        description: z.string().optional(),
        category: z.enum(['ai_ml', 'productivity', 'development', 'marketing', 'design', 'communication', 'storage', 'analytics', 'finance', 'security', 'other']).default('other'),
        cost: z.number().positive(),
        billingCycle: z.enum(['monthly', 'quarterly', 'annual', 'one_time', 'usage_based']).default('monthly'),
        currency: z.string().default('GBP'),
        status: z.enum(['active', 'paused', 'cancelled', 'trial']).default('active'),
        startDate: z.date().optional(),
        renewalDate: z.date().optional(),
        trialEndDate: z.date().optional(),
        usagePercent: z.number().min(0).max(100).optional(),
        websiteUrl: z.string().optional(),
        logoUrl: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createSubscription } = await import('../../db');
        const id = await createSubscription({
          ...input,
          userId: ctx.user.id,
        });
        return { id };
      }),

    // Update a subscription
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        provider: z.string().optional(),
        description: z.string().optional(),
        category: z.enum(['ai_ml', 'productivity', 'development', 'marketing', 'design', 'communication', 'storage', 'analytics', 'finance', 'security', 'other']).optional(),
        cost: z.number().positive().optional(),
        billingCycle: z.enum(['monthly', 'quarterly', 'annual', 'one_time', 'usage_based']).optional(),
        currency: z.string().optional(),
        status: z.enum(['active', 'paused', 'cancelled', 'trial']).optional(),
        startDate: z.date().optional(),
        renewalDate: z.date().optional(),
        trialEndDate: z.date().optional(),
        usagePercent: z.number().min(0).max(100).optional(),
        websiteUrl: z.string().optional(),
        logoUrl: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getSubscriptionById, updateSubscription } = await import('../../db');
        const sub = await getSubscriptionById(input.id);
        if (!sub || sub.userId !== ctx.user.id) {
          throw new Error('Subscription not found');
        }
        const { id, ...data } = input;
        await updateSubscription(id, data);
        return { success: true };
      }),

    // Delete a subscription
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { getSubscriptionById, deleteSubscription } = await import('../../db');
        const sub = await getSubscriptionById(input.id);
        if (!sub || sub.userId !== ctx.user.id) {
          throw new Error('Subscription not found');
        }
        await deleteSubscription(input.id);
        return { success: true };
      }),

    // Get subscription summary
    getSummary: protectedProcedure
      .query(async ({ ctx }) => {
        const { getSubscriptionSummary } = await import('../../db');
        return getSubscriptionSummary(ctx.user.id);
      }),

    // Get cost history for trend chart
    getCostHistory: protectedProcedure
      .input(z.object({ months: z.number().min(1).max(24).default(12) }).optional())
      .query(async ({ ctx, input }) => {
        const { getSubscriptionCostHistory } = await import('../../db');
        return getSubscriptionCostHistory(ctx.user.id, input?.months || 12);
      }),

    // Get upcoming renewal reminders
    getUpcomingRenewals: protectedProcedure
      .input(z.object({ daysAhead: z.number().min(1).max(90).default(30) }).optional())
      .query(async ({ ctx, input }) => {
// //         const { getUpcomingRenewals } = await import('../../services/subscriptionReminderService');
        return getUpcomingRenewals(ctx.user.id, input?.daysAhead || 30);
      }),

    // Get renewal summary (count, total cost, next renewal)
    getRenewalSummary: protectedProcedure
      .query(async ({ ctx }) => {
//         const { getRenewalSummary } = await import('../../services/subscriptionReminderService');
        return getRenewalSummary(ctx.user.id);
      }),

    // Manually trigger reminder check and send notifications
    sendRenewalReminders: protectedProcedure
      .mutation(async ({ ctx }) => {
//         const { checkAndSendReminders } = await import('../../services/subscriptionReminderService');
        return checkAndSendReminders(ctx.user.id);
      }),
});
