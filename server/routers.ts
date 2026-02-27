/**
 * Application Router
 *
 * All feature routers registered here.
 * Stubs replaced with real implementations as features are built.
 */
import { router } from "./_core/trpc";
import { systemRouter } from "./_core/systemRouter";

// Real implementations
import { chatRouter } from "./routers/chat.router";
import { dashboardRouter } from "./routers/dashboard.router";
import { questionnaireRouter } from "./routers/questionnaire.router";
import { chiefOfStaffRouter } from "./routers/chiefOfStaff.router";
import { moodRouter } from "./routers/mood.router";
import { tasksRouter } from "./routers/tasks.router";

export const appRouter = router({
  system: systemRouter,

  // AI & Chat
  chat: chatRouter,

  // Dashboard & Analytics
  dashboard: dashboardRouter,

  // Chief of Staff / Digital Twin
  chiefOfStaff: chiefOfStaffRouter,

  // Questionnaire / Digital Twin Profile
  questionnaire: questionnaireRouter,

  // Mood Tracking
  mood: moodRouter,

  // Tasks
  tasks: tasksRouter,
});

export type AppRouter = typeof appRouter;
