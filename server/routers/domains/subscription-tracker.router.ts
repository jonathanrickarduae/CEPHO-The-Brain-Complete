/**
 * Subscription Tracker Router
 * 
 * Handles subscription management with error handling
 * 
 * @module routers/domains/subscription-tracker
 */

import { router, protectedProcedure } from "../../_core/trpc";
import { z } from "zod";
import { integrationService } from "../../services/integration";
import { handleTRPCError, assertExists } from "../../utils/error-handler";

export const subscriptionTrackerRouter = router({
    // Get all subscriptions for user
    getAll: protectedProcedure
      .input(z.object({
        status: z.string().optional(),
        category: z.string().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        try {
          const { getSubscriptions } = await import('../../db');
          return await getSubscriptions(ctx.user.id, input);
        } catch (error) {
          handleTRPCError(error, 'SubscriptionTracker.getAll');
        }
      }),

    // Get subscription by ID
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        try {
          const { getSubscriptionById } = await import('../../db');
          const sub = await getSubscriptionById(input.id);
          
          assertExists(sub, 'Subscription', input.id);
          
          if (sub.userId !== ctx.user.id) {
            throw new Error('Not authorized to view this subscription');
          }
          
          return sub;
        } catch (error) {
          handleTRPCError(error, 'SubscriptionTracker.getById');
        }
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
        try {
          const { createSubscription } = await import('../../db');
          const id = await createSubscription({
            ...input,
            userId: ctx.user.id,
          });
          return { id };
        } catch (error) {
          handleTRPCError(error, 'SubscriptionTracker.create');
        }
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
        try {
          const { getSubscriptionById, updateSubscription } = await import('../../db');
          const sub = await getSubscriptionById(input.id);
          
          assertExists(sub, 'Subscription', input.id);
          
          if (sub.userId !== ctx.user.id) {
            throw new Error('Not authorized to update this subscription');
          }
          
          const { id, ...data } = input;
          await updateSubscription(id, data);
          return { success: true };
        } catch (error) {
          handleTRPCError(error, 'SubscriptionTracker.update');
        }
      }),

    // Delete a subscription
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        try {
          const { getSubscriptionById, deleteSubscription } = await import('../../db');
          const sub = await getSubscriptionById(input.id);
          
          assertExists(sub, 'Subscription', input.id);
          
          if (sub.userId !== ctx.user.id) {
            throw new Error('Not authorized to delete this subscription');
          }
          
          await deleteSubscription(input.id);
          return { success: true };
        } catch (error) {
          handleTRPCError(error, 'SubscriptionTracker.delete');
        }
      }),

    // Get subscription summary
    getSummary: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          const { getSubscriptionSummary } = await import('../../db');
          return await getSubscriptionSummary(ctx.user.id);
        } catch (error) {
          handleTRPCError(error, 'SubscriptionTracker.getSummary');
        }
      }),

    // Get cost history for trend chart
    getCostHistory: protectedProcedure
      .input(z.object({ months: z.number().min(1).max(24).default(12) }).optional())
      .query(async ({ ctx, input }) => {
        try {
          const { getSubscriptionCostHistory } = await import('../../db');
          return await getSubscriptionCostHistory(ctx.user.id, input?.months || 12);
        } catch (error) {
          handleTRPCError(error, 'SubscriptionTracker.getCostHistory');
        }
      }),

    // Get upcoming renewal reminders
    getUpcomingRenewals: protectedProcedure
      .input(z.object({ daysAhead: z.number().min(1).max(90).default(30) }).optional())
      .query(async ({ ctx, input }) => {
        try {
          const { getUpcomingRenewals } = await import('../../db');
          return await getUpcomingRenewals(ctx.user.id, input?.daysAhead || 30);
        } catch (error) {
          handleTRPCError(error, 'SubscriptionTracker.getUpcomingRenewals');
        }
      }),

    // Get renewal summary (count, total cost, next renewal)
    getRenewalSummary: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          const { getRenewalSummary } = await import('../../db');
          return await getRenewalSummary(ctx.user.id);
        } catch (error) {
          handleTRPCError(error, 'SubscriptionTracker.getRenewalSummary');
        }
      }),

    // Manually trigger reminder check and send notifications
    sendRenewalReminders: protectedProcedure
      .mutation(async ({ ctx }) => {
        try {
          const { checkAndSendReminders } = await import('../../db');
          return await checkAndSendReminders(ctx.user.id);
        } catch (error) {
          handleTRPCError(error, 'SubscriptionTracker.sendRenewalReminders');
        }
      }),
});
