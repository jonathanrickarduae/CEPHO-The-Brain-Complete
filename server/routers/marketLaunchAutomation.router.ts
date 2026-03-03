/**
 * Market Launch Automation Router
 *
 * Orchestrates the end-to-end automated launch sequence for a new product or
 * venture. Coordinates across marketing, content, social media, and analytics
 * agents to execute a go-to-market plan with human approval gates at critical
 * decision points.
 *
 * Phase 3 deliverable — spec: docs/specs/MarketLaunchAutomation.md
 */
import { z } from "zod";
import { eq, desc, and } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { marketLaunchCampaigns } from "../../drizzle/schema";

const LAUNCH_STAGES = [
  "pre_launch",
  "soft_launch",
  "full_launch",
  "post_launch",
] as const;

export const marketLaunchAutomationRouter = router({
  /**
   * Create a new market launch campaign.
   */
  createCampaign: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        productName: z.string().min(1),
        targetAudience: z.string(),
        launchDate: z.string().optional(),
        budget: z.number().optional(),
        channels: z
          .array(
            z.enum([
              "email",
              "social",
              "paid_ads",
              "pr",
              "content",
              "influencer",
            ])
          )
          .default(["email", "social"]),
        goals: z.array(z.string()).default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [campaign] = await db
        .insert(marketLaunchCampaigns)
        .values({
          userId: ctx.user.id,
          name: input.name,
          productName: input.productName,
          targetAudience: input.targetAudience,
          launchDate: input.launchDate ? new Date(input.launchDate) : null,
          budget: input.budget ?? null,
          channels: JSON.stringify(input.channels),
          goals: JSON.stringify(input.goals),
          stage: "pre_launch",
          status: "draft",
        })
        .returning();

      return campaign;
    }),

  /**
   * List all campaigns for the current user.
   */
  listCampaigns: protectedProcedure.query(async ({ ctx }) => {
    return db
      .select()
      .from(marketLaunchCampaigns)
      .where(eq(marketLaunchCampaigns.userId, ctx.user.id))
      .orderBy(desc(marketLaunchCampaigns.createdAt));
  }),

  /**
   * Get a single campaign by ID.
   */
  getCampaign: protectedProcedure
    .input(z.object({ campaignId: z.number() }))
    .query(async ({ ctx, input }) => {
      const [campaign] = await db
        .select()
        .from(marketLaunchCampaigns)
        .where(
          and(
            eq(marketLaunchCampaigns.id, input.campaignId),
            eq(marketLaunchCampaigns.userId, ctx.user.id)
          )
        );
      if (!campaign) throw new Error("Campaign not found.");
      return campaign;
    }),

  /**
   * Advance a campaign to the next launch stage.
   * Requires a human approval gate before advancing to full_launch.
   */
  advanceStage: protectedProcedure
    .input(
      z.object({
        campaignId: z.number(),
        approvalId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [campaign] = await db
        .select()
        .from(marketLaunchCampaigns)
        .where(
          and(
            eq(marketLaunchCampaigns.id, input.campaignId),
            eq(marketLaunchCampaigns.userId, ctx.user.id)
          )
        );
      if (!campaign) throw new Error("Campaign not found.");

      const stageIndex = LAUNCH_STAGES.indexOf(
        campaign.stage as (typeof LAUNCH_STAGES)[number]
      );
      if (stageIndex === LAUNCH_STAGES.length - 1) {
        throw new Error("Campaign is already at the final stage.");
      }

      const nextStage = LAUNCH_STAGES[stageIndex + 1];

      // Full launch requires a human approval gate
      if (nextStage === "full_launch" && !input.approvalId) {
        throw new Error(
          "A human approval gate is required before advancing to full launch. Create an approval request first."
        );
      }

      const [updated] = await db
        .update(marketLaunchCampaigns)
        .set({ stage: nextStage, updatedAt: new Date() })
        .where(eq(marketLaunchCampaigns.id, input.campaignId))
        .returning();

      return updated;
    }),

  /**
   * Update campaign status (draft, active, paused, completed).
   */
  updateStatus: protectedProcedure
    .input(
      z.object({
        campaignId: z.number(),
        status: z.enum(["draft", "active", "paused", "completed"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [updated] = await db
        .update(marketLaunchCampaigns)
        .set({ status: input.status, updatedAt: new Date() })
        .where(
          and(
            eq(marketLaunchCampaigns.id, input.campaignId),
            eq(marketLaunchCampaigns.userId, ctx.user.id)
          )
        )
        .returning();
      if (!updated) throw new Error("Campaign not found.");
      return updated;
    }),
});
