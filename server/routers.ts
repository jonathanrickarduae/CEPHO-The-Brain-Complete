/**
 * Application Router
 *
 * All feature routers registered here.
 * Real implementations replace stubs as features are built.
 */
import { router } from "./_core/trpc";
import { systemRouter } from "./_core/systemRouter";

// ─── Real Implementations ────────────────────────────────────────────────────
import { chatRouter } from "./routers/chat.router";
import { dashboardRouter } from "./routers/dashboard.router";
import { questionnaireRouter } from "./routers/questionnaire.router";
import { chiefOfStaffRouter } from "./routers/chiefOfStaff.router";
import { moodRouter } from "./routers/mood.router";
import { tasksRouter } from "./routers/tasks.router";
import { aiAgentsMonitoringRouter } from "./routers/aiAgentsMonitoring.router";
import { expertEvolutionRouter } from "./routers/expertEvolution.router";
import { expertRecommendationRouter } from "./routers/expertRecommendation.router";
import { expertChatRouter } from "./routers/expertChat.router";
import { expertConsultationRouter } from "./routers/expertConsultation.router";
import { settingsRouter } from "./routers/settings.router";
import { notificationsRouter } from "./routers/notifications.router";
import { projectsRouter } from "./routers/projects.router";
import {
  victoriaBriefingRouter,
  victoriasBriefRouter,
} from "./routers/victoriaBriefing.router";
import { innovationRouter } from "./routers/innovation.router";
import { eveningReviewRouter, morningSignalRouter as morningSignalRealRouter } from "./routers/eveningReview.router";
import { partnershipsRouter as partnershipsRealRouter } from "./routers/partnerships.router";

// ─── Functional Stubs ────────────────────────────────────────────────────────
import {
  authRouter,
  themeRouter,
  favoritesRouter,
  feedbackRouter,
  npsRouter,
  voiceNotesRouter,
  calendarRouter,
  gmailRouter,
  integrationsRouter,
  workflowsRouter,
  cosTasksRouter,
  qaRouter,
  qualityGateRouter,
  smeTeamRouter,
  teamCapabilitiesRouter,

  documentLibraryRouter,
  libraryRouter,
  subscriptionTrackerRouter,
  collaborativeReviewRouter,
  businessPlanReviewRouter,

  genesisRouter,
  projectGenesisRouter,
  optimizationRouter,
  openClawRouter,
  aiRouter,
} from "./routers/stubs/remaining.router";

export const appRouter = router({
  system: systemRouter,

  // ─── AI & Chat ──────────────────────────────────────────────────────────
  chat: chatRouter,
  ai: aiRouter,
  openClaw: openClawRouter,

  // ─── Dashboard & Analytics ──────────────────────────────────────────────
  dashboard: dashboardRouter,

  // ─── Chief of Staff / Digital Twin ──────────────────────────────────────
  chiefOfStaff: chiefOfStaffRouter,

  // ─── Questionnaire / Digital Twin Profile ───────────────────────────────
  questionnaire: questionnaireRouter,

  // ─── AI Agents Monitoring ───────────────────────────────────────────────
  aiAgentsMonitoring: aiAgentsMonitoringRouter,

  // ─── Expert System ──────────────────────────────────────────────────────
  expertEvolution: expertEvolutionRouter,
  expertRecommendation: expertRecommendationRouter,
  expertChat: expertChatRouter,
  expertConsultation: expertConsultationRouter,

  // ─── Victoria Briefing ──────────────────────────────────────────────────
  victoriaBriefing: victoriaBriefingRouter,
  victoriasBrief: victoriasBriefRouter,

  // ─── Core Data ──────────────────────────────────────────────────────────
  tasks: tasksRouter,
  projects: projectsRouter,
  mood: moodRouter,
  notifications: notificationsRouter,
  settings: settingsRouter,

  // ─── Auth & User ────────────────────────────────────────────────────────
  auth: authRouter,
  theme: themeRouter,
  favorites: favoritesRouter,
  feedback: feedbackRouter,

  // ─── Communication ──────────────────────────────────────────────────────
  calendar: calendarRouter,
  gmail: gmailRouter,
  voiceNotes: voiceNotesRouter,
  nps: npsRouter,

  // ─── Integrations ───────────────────────────────────────────────────────
  integrations: integrationsRouter,

  // ─── Workflows & Operations ─────────────────────────────────────────────
  workflows: workflowsRouter,
  cosTasks: cosTasksRouter,
  qa: qaRouter,
  qualityGate: qualityGateRouter,
  smeTeam: smeTeamRouter,
  teamCapabilities: teamCapabilitiesRouter,
  eveningReview: eveningReviewRouter,
  morningSignal: morningSignalRealRouter,

  // ─── Documents & Library ────────────────────────────────────────────────
  documentLibrary: documentLibraryRouter,
  library: libraryRouter,

  // ─── Business Tools ─────────────────────────────────────────────────────
  subscriptionTracker: subscriptionTrackerRouter,
  collaborativeReview: collaborativeReviewRouter,
  businessPlanReview: businessPlanReviewRouter,
  partnerships: partnershipsRealRouter,
  innovation: innovationRouter,
  genesis: genesisRouter,
  projectGenesis: projectGenesisRouter,
  optimization: optimizationRouter,
});

export type AppRouter = typeof appRouter;
