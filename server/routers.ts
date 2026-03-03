/**
 * Application Router
 *
 * All feature routers registered here.
 * Real implementations replace stubs as features are built.
 */
import { router } from "./_core/trpc";
import { systemRouter } from "./_core/systemRouter";
import { twoFactorRouter } from "./routers/twoFactor.router";
import {
  analyticsRouter,
  featureFlagsRouter,
} from "./routers/analytics.router";
import { brandKitRouter } from "./routers/brandKit.router";

// ─── Real Implementations ────────────────────────────────────────────────────
import { chatRouter } from "./routers/chat.router";
import { dashboardRouter } from "./routers/dashboard.router";
import { questionnaireRouter } from "./routers/questionnaire.router";
import { chiefOfStaffRouter } from "./routers/chiefOfStaff.router";
import { moodRouter } from "./routers/mood.router";
import { tasksRouter } from "./routers/tasks.router";
import { aiAgentsMonitoringRouter } from "./routers/aiAgentsMonitoring.router";
import { agentEngineRouter } from "./routers/agentEngine.router";
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
import {
  eveningReviewRouter,
  morningSignalRouter as morningSignalRealRouter,
} from "./routers/eveningReview.router";
import { partnershipsRouter as partnershipsRealRouter } from "./routers/partnerships.router";
import { voiceNotesRouter } from "./routers/voiceNotes.router";
import { subscriptionTrackerRouter as subscriptionTrackerRealRouter } from "./routers/subscriptionTracker.router";
import { projectGenesisRouter as projectGenesisRealRouter } from "./routers/projectGenesis.router";
import { documentLibraryRouter as documentLibraryRealRouter } from "./routers/documentLibrary.router";
import { workflowsRouter as workflowsRealRouter } from "./routers/workflows.router";
import { cosTrainingRouter } from "./routers/cosTraining.router";
import { digitalTwinRouter } from "./routers/digitalTwin.router";
import { voiceCommandRouter } from "./routers/voiceCommand.router";
import { cephoScoreRouter } from "./routers/cephoScore.router";
import { autonomousExecutionRouter } from "./routers/autonomousExecution.router";
import { documentTemplatingRouter } from "./routers/documentTemplating.router";
import { gdprRouter } from "./routers/gdpr.router";
import { agentRatingsRouter } from "./routers/agentRatings.router";
import { agentMemoryRouter } from "./routers/agentMemory.router";
import { apiKeysRouter } from "./routers/apiKeys.router";
import { auditLogRouter } from "./routers/auditLog.router";
import { adminRouter } from "./routers/admin.router";
import { nlCommandRouter } from "./routers/nlCommand.router";
import { kpiOkrRouter } from "./routers/kpiOkr.router";
import { dataIngestionRouter } from "./routers/dataIngestion.router";
import { emailIntelligenceRouter } from "./routers/emailIntelligence.router";
import { meetingIntelligenceRouter } from "./routers/meetingIntelligence.router";
import { briefingPersonalisationRouter } from "./routers/briefingPersonalisation.router";
import { humanApprovalGatesRouter } from "./routers/humanApprovalGates.router";
import { marketLaunchAutomationRouter } from "./routers/marketLaunchAutomation.router";
import { realWorldIntegrationRouter } from "./routers/realWorldIntegration.router";
import {
  businessPlanReviewRouter as businessPlanReviewRealRouter,
  collaborativeReviewRouter as collaborativeReviewRealRouter,
} from "./routers/businessPlanReview.router";
import {
  notionRouter,
  trelloRouter,
  calendlyRouter,
  zoomRouter,
  githubRouter,
  emailRouter,
  anthropicRouter,
  synthesiaRouter,
  todoistRouter,
  asanaRouter,
} from "./routers/externalIntegrations.router";
import {
  authRouter as authRealRouter,
  themeRouter as themeRealRouter,
  favoritesRouter as favoritesRealRouter,
  npsRouter as npsRealRouter,
  feedbackRouter as feedbackRealRouter,
  calendarRouter as calendarRealRouter,
  gmailRouter as gmailRealRouter,
  integrationsRouter as integrationsRealRouter,
  cosTasksRouter as cosTasksRealRouter,
  qaRouter as qaRealRouter,
  qualityGateRouter as qualityGateRealRouter,
  smeTeamRouter as smeTeamRealRouter,
  teamCapabilitiesRouter as teamCapabilitiesRealRouter,
  libraryRouter as libraryRealRouter,
  genesisRouter as genesisRealRouter,
  optimizationRouter as optimizationRealRouter,
  openClawRouter as openClawRealRouter,
  aiRouter as aiRealRouter,
} from "./routers/integrations.router";

// ─── Functional Stubs (kept for reference, real implementations used above) ──

export const appRouter = router({
  system: systemRouter,

  // ─── AI & Chat ──────────────────────────────────────────────────────────
  chat: chatRouter,
  ai: aiRealRouter,
  openClaw: openClawRealRouter,

  // ─── Dashboard & Analytics ──────────────────────────────────────────────
  dashboard: dashboardRouter,
  analytics: analyticsRouter,
  brandKit: brandKitRouter,
  featureFlags: featureFlagsRouter,

  // ─── Chief of Staff / Digital Twin ──────────────────────────────────────
  chiefOfStaff: chiefOfStaffRouter,

  // ─── Questionnaire / Digital Twin Profile ───────────────────────────────
  questionnaire: questionnaireRouter,

  // ─── AI Agents Monitoring ───────────────────────────────────────────────
  aiAgentsMonitoring: aiAgentsMonitoringRouter,
  agentEngine: agentEngineRouter,

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
  twoFactor: twoFactorRouter,
  auth: authRealRouter,
  theme: themeRealRouter,
  favorites: favoritesRealRouter,

  // ─── Communication ──────────────────────────────────────────────────────
  calendar: calendarRealRouter,
  gmail: gmailRealRouter,
  voiceNotes: voiceNotesRouter,
  nps: npsRealRouter,
  feedback: feedbackRealRouter,

  // ─── Integrations ───────────────────────────────────────────────────────
  integrations: integrationsRealRouter,

  // ─── Workflows & Operations ─────────────────────────────────────────────
  workflows: workflowsRealRouter,
  cosTasks: cosTasksRealRouter,
  qa: qaRealRouter,
  qualityGate: qualityGateRealRouter,
  smeTeam: smeTeamRealRouter,
  teamCapabilities: teamCapabilitiesRealRouter,
  eveningReview: eveningReviewRouter,
  morningSignal: morningSignalRealRouter,

  // ─── Documents & Library ────────────────────────────────────────────────
  documentLibrary: documentLibraryRealRouter,
  library: libraryRealRouter,

  // ─── External API Integrations ─────────────────────────────────────────
  notion: notionRouter,
  trello: trelloRouter,
  calendly: calendlyRouter,
  zoom: zoomRouter,
  github: githubRouter,
  email: emailRouter,
  anthropic: anthropicRouter,
  synthesia: synthesiaRouter,
  todoist: todoistRouter,
  asana: asanaRouter,

  // ─── Business Tools ─────────────────────────────────────────────────────
  subscriptionTracker: subscriptionTrackerRealRouter,
  collaborativeReview: collaborativeReviewRealRouter,
  businessPlanReview: businessPlanReviewRealRouter,
  partnerships: partnershipsRealRouter,
  innovation: innovationRouter,
  genesis: genesisRealRouter,
  projectGenesis: projectGenesisRealRouter,
  optimization: optimizationRealRouter,
  cosTraining: cosTrainingRouter,

  // ─── Digital Twin ────────────────────────────────────────────────────────
  digitalTwin: digitalTwinRouter,

  // ─── Voice Command (Talk to CEPHO) ───────────────────────────────────────
  voiceCommand: voiceCommandRouter,

  // ─── CEPHO Score ─────────────────────────────────────────────────────────
  cephoScore: cephoScoreRouter,

  // ─── Autonomous Execution Engine ────────────────────────────────────────────
  autonomousExecution: autonomousExecutionRouter,

  // ─── Document Templating Engine ──────────────────────────────────────────────
  documentTemplating: documentTemplatingRouter,

  // ─── GDPR Compliance ─────────────────────────────────────────────────────────
  gdpr: gdprRouter,
  // ─── Agent Ratings ───────────────────────────────────────────────────────────
  agentRatings: agentRatingsRouter,
  // ─── Agent Memory Bank ───────────────────────────────────────────────────────
  agentMemory: agentMemoryRouter,
  // ─── Public API Keys ─────────────────────────────────────────────────────────
  apiKeys: apiKeysRouter,
  //  // ─── Audit Log ───────────────────────────────────────────────────────────
  auditLog: auditLogRouter,
  // ─── Admin & Governance ──────────────────────────────────────────────────────
  admin: adminRouter,
  // ─── Natural Language Command Bar (AUTO-03) ──────────────────────────────────
  nlCommand: nlCommandRouter,
  // ─── KPI & OKR Tracking (AUTO-05) ────────────────────────────────────────────
  kpiOkr: kpiOkrRouter,
  // ─── Data Ingestion Pipeline (P2-9/10/11) ───────────────────────────────────
  dataIngestion: dataIngestionRouter,
  // ─── Email Intelligence (P3-6/7/8) ──────────────────────────────────────────
  emailIntelligence: emailIntelligenceRouter,
  // ─── Meeting Intelligence (P3-9/10/11) ──────────────────────────────────────
  meetingIntelligence: meetingIntelligenceRouter,
  // ─── Briefing Personalisation (P3-12/13) ────────────────────────────────────
  briefingPersonalisation: briefingPersonalisationRouter,
  // ─── Human Approval Gates (P3 deliverable) ──────────────────────────────────
  humanApprovalGates: humanApprovalGatesRouter,
  // ─── Market Launch Automation (P3 deliverable) ──────────────────────────────
  marketLaunchAutomation: marketLaunchAutomationRouter,
  // ─── Real-World Integration Layer (P3 deliverable) ──────────────────────────
  realWorldIntegration: realWorldIntegrationRouter,
});

export type AppRouter = typeof appRouter;
