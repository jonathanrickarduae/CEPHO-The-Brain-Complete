/**
 * Settings Router — Real Implementation
 */
import { z } from "zod";
import { eq } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { userSettings } from "../../drizzle/schema";

const DEFAULT_SETTINGS = {
  theme: "dark",
  governanceMode: "standard",
  dailyBriefTime: "07:00",
  eveningReviewTime: "18:00",
  twinAutonomyLevel: 1,
  notificationsEnabled: true,
  sidebarCollapsed: false,
  onboardingComplete: false,
};

export const settingsRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const rows = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, ctx.user.id))
      .limit(1);

    if (rows.length === 0) {
      // Create default settings
      const [created] = await db
        .insert(userSettings)
        .values({ userId: ctx.user.id, ...DEFAULT_SETTINGS })
        .returning();
      return created;
    }
    return rows[0];
  }),

  update: protectedProcedure
    .input(
      z.object({
        theme: z.string().optional(),
        governanceMode: z.string().optional(),
        dailyBriefTime: z.string().optional(),
        eveningReviewTime: z.string().optional(),
        twinAutonomyLevel: z.number().min(1).max(10).optional(),
        notificationsEnabled: z.boolean().optional(),
        sidebarCollapsed: z.boolean().optional(),
        onboardingComplete: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const existing = await db
        .select()
        .from(userSettings)
        .where(eq(userSettings.userId, ctx.user.id))
        .limit(1);

      if (existing.length === 0) {
        const [created] = await db
          .insert(userSettings)
          .values({ userId: ctx.user.id, ...DEFAULT_SETTINGS, ...input })
          .returning();
        return created;
      }

      const [updated] = await db
        .update(userSettings)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(userSettings.userId, ctx.user.id))
        .returning();
      return updated;
    }),
});
