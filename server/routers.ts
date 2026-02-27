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
import { voiceNotesRouter } from "./routers/voiceNotes.router";
import { subscriptionTrackerRouter as subscriptionTrackerRealRouter } from "./routers/subscriptionTracker.router";
import { projectGenesisRouter as projectGenesisRealRouter } from "./routers/projectGenesis.router";
import { documentLibraryRouter as documentLibraryRealRouter } from "./routers/documentLibrary.router";
import { workflowsRouter as workflowsRealRouter } from "./routers/workflows.router";

// ─── Functional Stubs ────────────────────────────────────────────────────────
import {
  authRouter,
  themeRouter,
  favoritesRouter,
  feedbackRouter,
  npsRouter,

  calendarRouter,
  gmailRouter,
  integrationsRouter,

  cosTasksRouter,
  qaRouter,
  qualityGateRouter,
  smeTeamRouter,
  teamCapabilitiesRouter,


  libraryRouter,

  collaborativeReviewRouter,
  businessPlanReviewRouter,

  genesisRouter,

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
  workflows: workflowsRealRouter,
  cosTasks: cosTasksRouter,
  qa: qaRouter,
  qualityGate: qualityGateRouter,
  smeTeam: smeTeamRouter,
  teamCapabilities: teamCapabilitiesRouter,
  eveningReview: eveningReviewRouter,
  morningSignal: morningSignalRealRouter,

  // ─── Documents & Library ────────────────────────────────────────────────
  documentLibrary: documentLibraryRealRouter,
  library: libraryRouter,

  // ─── Business Tools ─────────────────────────────────────────────────────
  subscriptionTracker: subscriptionTrackerRealRouter,
  collaborativeReview: collaborativeReviewRouter,
  businessPlanReview: businessPlanReviewRouter,
  partnerships: partnershipsRealRouter,
  innovation: innovationRouter,
  genesis: genesisRouter,
  projectGenesis: projectGenesisRealRouter,
  optimization: optimizationRouter,
});

export type AppRouter = typeof appRouter;
