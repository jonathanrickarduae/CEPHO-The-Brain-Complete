/**
 * GDPR Compliance Router
 * Provides data export (right of access) and account deletion (right to erasure) endpoints.
 * Phase 5 — Operational Excellence
 */
import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import {
  users,
  tasks,
  projects,
  moodHistory,
  voiceNotes,
  activityFeed,
  notifications,
  userSettings,
  digitalTwinProfile,
  innovationIdeas,
  npsResponses,
  feedbackHistory,
} from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const gdprRouter = router({
  /**
   * Export all data for the current user (GDPR Article 20 — Right to Data Portability)
   */
  exportMyData: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const [
      userRecord,
      userTasks,
      userProjects,
      userMood,
      userVoiceNotes,
      userActivity,
      userNotifications,
      userSettingsData,
      userTwinProfile,
      userIdeas,
      userNps,
      userFeedback,
    ] = await Promise.all([
      db.select().from(users).where(eq(users.id, userId)).limit(1),
      db.select().from(tasks).where(eq(tasks.userId, userId)),
      db.select().from(projects).where(eq(projects.userId, userId)),
      db.select().from(moodHistory).where(eq(moodHistory.userId, userId)),
      db.select().from(voiceNotes).where(eq(voiceNotes.userId, userId)),
      db.select().from(activityFeed).where(eq(activityFeed.userId, userId)),
      db.select().from(notifications).where(eq(notifications.userId, userId)),
      db.select().from(userSettings).where(eq(userSettings.userId, userId)),
      db.select().from(digitalTwinProfile).where(eq(digitalTwinProfile.userId, userId)),
      db.select().from(innovationIdeas).where(eq(innovationIdeas.userId, userId)),
      db.select().from(npsResponses).where(eq(npsResponses.userId, userId)),
      db.select().from(feedbackHistory).where(eq(feedbackHistory.userId, userId)),
    ]);

    return {
      exportedAt: new Date().toISOString(),
      userId,
      data: {
        profile: userRecord[0] ?? null,
        settings: userSettingsData[0] ?? null,
        digitalTwinProfile: userTwinProfile[0] ?? null,
        tasks: userTasks,
        projects: userProjects,
        moodHistory: userMood,
        voiceNotes: userVoiceNotes,
        activityFeed: userActivity,
        notifications: userNotifications,
        innovationIdeas: userIdeas,
        npsResponses: userNps,
        feedbackHistory: userFeedback,
      },
    };
  }),

  /**
   * Delete all data for the current user (GDPR Article 17 — Right to Erasure)
   * Requires explicit confirmation string.
   */
  deleteMyAccount: protectedProcedure
    .input(
      z.object({
        confirmationPhrase: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.confirmationPhrase !== "DELETE MY ACCOUNT") {
        throw new Error(
          "Invalid confirmation phrase. Please type DELETE MY ACCOUNT to confirm."
        );
      }

      const userId = ctx.user.id;

      // Delete all user data in dependency order
      await db.delete(npsResponses).where(eq(npsResponses.userId, userId));
      await db.delete(feedbackHistory).where(eq(feedbackHistory.userId, userId));
      await db.delete(notifications).where(eq(notifications.userId, userId));
      await db.delete(activityFeed).where(eq(activityFeed.userId, userId));
      await db.delete(voiceNotes).where(eq(voiceNotes.userId, userId));
      await db.delete(moodHistory).where(eq(moodHistory.userId, userId));
      await db.delete(innovationIdeas).where(eq(innovationIdeas.userId, userId));
      await db.delete(tasks).where(eq(tasks.userId, userId));
      await db.delete(projects).where(eq(projects.userId, userId));
      await db.delete(userSettings).where(eq(userSettings.userId, userId));
      await db.delete(digitalTwinProfile).where(eq(digitalTwinProfile.userId, userId));
      await db.delete(users).where(eq(users.id, userId));

      return {
        success: true,
        message:
          "All your data has been permanently deleted. Your account has been closed.",
        deletedAt: new Date().toISOString(),
      };
    }),
});
