/**
 * Application Router
 *
 * Clean, minimal tRPC router — the foundation to build on.
 * Add feature routers here as they are implemented and tested.
 */
import { router } from "./_core/trpc";
import { systemRouter } from "./_core/systemRouter";
import { chatRouter } from "./routers/stubs/chat.router";
import { dashboardRouter } from "./routers/stubs/dashboard.router";
import { questionnaireRouter } from "./routers/stubs/questionnaire.router";

export const appRouter = router({
  system: systemRouter,
  // Stub routers — replace with real implementations as features are built
  chat: chatRouter,
  dashboard: dashboardRouter,
  questionnaire: questionnaireRouter,
});

export type AppRouter = typeof appRouter;
