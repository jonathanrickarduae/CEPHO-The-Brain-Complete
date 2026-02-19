/**
 * BATCH 5 FINAL - ALL ROUTERS RESTORED
 */

import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { 
  createMoodEntry, getMoodHistory, getMoodTrends, getLastMoodCheck,
  createNotification, getNotifications, markNotificationRead, markAllNotificationsRead,
  createProject, getProjects, updateProject,
  getUserSettings, upsertUserSettings,
} from "./db/index";

// Batch 1: First 5 domain routers
import { chatRouter } from "./routers/domains/chat.router";
import { calendarRouter } from "./routers/domains/calendar.router";
import { genesisRouter } from "./routers/domains/genesis.router";
import { qaRouter } from "./routers/domains/qa.router";
import { libraryRouter } from "./routers/domains/library.router";
import { expertEvolutionRouter } from "./routers/domains/expert-evolution.router";
import { expertChatRouter } from "./routers/domains/expert-chat.router";
import { expertConsultationRouter } from "./routers/domains/expert-consultation.router";
import { expertRecommendationRouter } from "./routers/domains/expert-recommendation.router";
import { moodRouter } from "./routers/domains/mood.router";
import { businessPlanReviewRouter } from "./routers/domains/business-plan-review.router";
import { collaborativeReviewRouter } from "./routers/domains/collaborative-review.router";
import { documentLibraryRouter } from "./routers/domains/document-library.router";
import { eveningReviewRouter } from "./routers/domains/evening-review.router";
import { innovationRouter } from "./routers/domains/innovation.router";
import { subscriptionTrackerRouter } from "./routers/domains/subscription-tracker.router";
import { integrationsRouter } from "./routers/integrations.router";
import { projectGenesisRouter } from "./routers/project-genesis.router";
import { qualityGatesRouter } from "./routers/quality-gates.router";
import { blueprintRouter } from "./routers/blueprint.router";
import { smeRouter } from "./routers/sme.router";
import { digitalTwinRouter } from "./routers/digital-twin.router";
import { blueprintsRouter } from "./routers/blueprints.router";
import { chiefOfStaffRouter } from "./routers/chief-of-staff.router";
import { deepDiveRouter } from "./routers/deep-dive.router";
import { businessPlanRouter } from "./routers/business-plan.router";
import { debugRouter } from "./routers/debug.router";
import { cleanupRouter } from "./routers/cleanup.router";
import { asanaRouter } from "./routers/asana.router";
import { favoritesRouter } from "./routers/favorites";

export const appRouter = router({
  // Batch 1 domain routers
  chat: chatRouter,
  calendar: calendarRouter,
  genesis: genesisRouter,
  qa: qaRouter,
  library: libraryRouter,
  expertEvolution: expertEvolutionRouter,
  expertChat: expertChatRouter,
  expertConsultation: expertConsultationRouter,
  expertRecommendation: expertRecommendationRouter,
  moodDomain: moodRouter,
  businessPlanReview: businessPlanReviewRouter,
  collaborativeReview: collaborativeReviewRouter,
  documentLibrary: documentLibraryRouter,
  eveningReview: eveningReviewRouter,
  innovation: innovationRouter,
  subscriptionTracker: subscriptionTrackerRouter,
  integrations: integrationsRouter,
  projectGenesis: projectGenesisRouter,
  qualityGates: qualityGatesRouter,
  blueprint: blueprintRouter,
  sme: smeRouter,
  digitalTwin: digitalTwinRouter,
  blueprints: blueprintsRouter,
  chiefOfStaff: chiefOfStaffRouter,
  deepDive: deepDiveRouter,
  businessPlan: businessPlanRouter,
  debug: debugRouter,
  cleanup: cleanupRouter,
  asana: asanaRouter,
  favorites: favoritesRouter,

  // Core routers (from Phase 1)
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  
  health: publicProcedure.query(() => {
    return { status: "ok", timestamp: new Date().toISOString() };
  }),

  mood: router({
    create: protectedProcedure
      .input(z.object({
        score: z.number().min(0).max(100),
        timeOfDay: z.enum(['morning', 'afternoon', 'evening']),
        note: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const entry = await createMoodEntry({
          userId: ctx.user.id,
          score: input.score,
          timeOfDay: input.timeOfDay,
          note: input.note || null,
        });
        return entry;
      }),

    history: protectedProcedure
      .query(async ({ ctx }) => {
        return await getMoodHistory(ctx.user.id);
      }),

    trends: protectedProcedure
      .query(async ({ ctx }) => {
        return await getMoodTrends(ctx.user.id);
      }),

    lastCheck: protectedProcedure
      .query(async ({ ctx }) => {
        return await getLastMoodCheck(ctx.user.id);
      }),
  }),

  notifications: router({
    list: protectedProcedure
      .query(async ({ ctx }) => {
        return await getNotifications(ctx.user.id);
      }),

    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        message: z.string(),
        type: z.enum(['info', 'warning', 'error', 'success']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await createNotification({
          userId: ctx.user.id,
          title: input.title,
          message: input.message,
          type: input.type || 'info',
        });
      }),

    markRead: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return await markNotificationRead(input.id, ctx.user.id);
      }),

    markAllRead: protectedProcedure
      .mutation(async ({ ctx }) => {
        return await markAllNotificationsRead(ctx.user.id);
      }),
  }),

  projects: router({
    list: protectedProcedure
      .query(async ({ ctx }) => {
        return await getProjects(ctx.user.id);
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await createProject({
          userId: ctx.user.id,
          name: input.name,
          description: input.description || null,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await updateProject(input.id, ctx.user.id, {
          name: input.name,
          description: input.description,
        });
      }),
  }),

  settings: router({
    get: protectedProcedure
      .query(async ({ ctx }) => {
        return await getUserSettings(ctx.user.id);
      }),

    update: protectedProcedure
      .input(z.object({
        theme: z.enum(['light', 'dark', 'auto']).optional(),
        notifications: z.boolean().optional(),
        language: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await upsertUserSettings(ctx.user.id, input);
      }),
  }),
});

export type AppRouter = typeof appRouter;
