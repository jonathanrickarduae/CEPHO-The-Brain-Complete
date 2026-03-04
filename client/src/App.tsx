// @ts-nocheck
import { Switch, Route } from "wouter";
import { useI18n } from "@/hooks/useI18n";
// Build version: 2026-02-28-v3-cleanup
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import BrainLayout from "@/components/ai-agents/BrainLayout";
import {
  GovernanceProvider,
  GovernanceModeChangeModal,
} from "./hooks/useGovernance";
import { AIRouterProvider } from "@/components/ai-agents/AIRouter";
import { usePageViewTracking } from "@/hooks/useAnalytics";
import { CelebrationProvider } from "@/components/shared/CelebrationAnimations";
import { DailyCycleProvider } from "@/components/ai-agents/DailyCycleProvider";
import { PageTransition } from "@/components/shared/PageTransition";
import { PinGate } from "@/components/PinGate";
import { KeyboardShortcutsGuide } from "@/components/project-management/KeyboardShortcutsGuide";
import { ChiefOfStaffNotification } from "@/components/communication/ChiefOfStaffNotification";

// Loading fallback
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

// ── Core pages ──────────────────────────────────────────────────────────────
const NotFound = lazy(() => import("@/pages/NotFound"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const NexusDashboard = lazy(() => import("@/pages/NexusDashboard"));

// ── The Signal ───────────────────────────────────────────────────────────────
const DailyBrief = lazy(() => import("./pages/DailyBrief"));
const EveningReview = lazy(() => import("./pages/EveningReview"));

// ── Chief of Staff ───────────────────────────────────────────────────────────
const OperationsPage = lazy(() => import("./pages/OperationsPage"));
const ChiefOfStaff = lazy(() => import("@/pages/ChiefOfStaff"));
const DevelopmentPathway = lazy(() => import("./pages/DevelopmentPathway"));
const COSTraining = lazy(() => import("./pages/COSTraining"));
const AIAgentsPage = lazy(() => import("./pages/AIAgentsPage"));
const AgentDetailPage = lazy(() => import("./pages/AgentDetailPage"));
const AIAgentsMonitoringPage = lazy(
  () => import("./pages/AIAgentsMonitoringPage")
);
const VictoriaTrackerPage = lazy(() => import("./pages/VictoriaTrackerPage"));
const AISMEsPage = lazy(() => import("./pages/AISMEsPage"));
const Statistics = lazy(() => import("./pages/Statistics"));
const DocumentLibrary = lazy(() => import("./pages/DocumentLibrary"));

// ── Odyssey Engine ───────────────────────────────────────────────────────────
const InnovationHub = lazy(() => import("./pages/InnovationHub"));
const ProjectGenesisPage = lazy(() => import("./pages/ProjectGenesisPage"));
const ProjectGenesisWizard = lazy(() => import("./pages/ProjectGenesisWizard"));
const WorkflowsPage = lazy(() => import("./pages/WorkflowsPage"));
const WorkflowDetailPage = lazy(() => import("./pages/WorkflowDetailPage"));
const PersephoneBoard = lazy(() => import("./pages/PersephoneBoard"));

// ── Phase 3: KPI & OKR Dashboard ────────────────────────────────────────────
const KpiOkrPage = lazy(() => import("./pages/KpiOkrPage"));

// ── Phase 2: Knowledge Base (P2-9, P2-10, P2-11) ─────────────────────────────
const KnowledgeBasePage = lazy(() => import("./pages/KnowledgeBasePage"));

// ── Phase 2: Integration Hub (P2-13) ───────────────────────────────────
const IntegrationHubPage = lazy(() => import("./pages/IntegrationHubPage"));

// ── Phase 3: Email Intelligence, Meeting Intelligence, Briefing Prefs ───
const EmailIntelligencePage = lazy(
  () => import("./pages/EmailIntelligencePage")
);
const MeetingIntelligencePage = lazy(
  () => import("./pages/MeetingIntelligencePage")
);
const BriefingPreferencesPage = lazy(
  () => import("./pages/BriefingPreferencesPage")
);

// ── Phase 4: New Pages ──────────────────────────────────────────────────────
const NotificationsCentrePage = lazy(
  () => import("./pages/NotificationsCentrePage")
);
const VoiceNotesPage = lazy(() => import("./pages/VoiceNotesPage"));
const SubscriptionTrackerPage = lazy(
  () => import("./pages/SubscriptionTrackerPage")
);
const TwoFactorSetupPage = lazy(() => import("./pages/TwoFactorSetupPage"));
const BrandKitPage = lazy(() => import("./pages/BrandKitPage"));
const AnalyticsDeepDivePage = lazy(
  () => import("./pages/AnalyticsDeepDivePage")
);
const EmailAccountsPage = lazy(() => import("./pages/EmailAccountsPage"));
const AICostTrackerPage = lazy(() => import("./pages/AICostTrackerPage"));

// ── Standalone ───────────────────────────────────────────────────────────────
const Vault = lazy(() => import("./pages/Vault"));
const Settings = lazy(() => import("./pages/Settings"));
const ExpertChatPage = lazy(() => import("./pages/ExpertChatPage"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const WarRoom = lazy(() => import("./pages/WarRoom"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminHealthPage = lazy(() => import("./pages/AdminHealthPage"));

// Wrapper: pages that need the sidebar layout
function WithLayout({ children }: { children: React.ReactNode }) {
  return (
    <BrainLayout>
      <PageTransition className="h-full">{children}</PageTransition>
    </BrainLayout>
  );
}

function Router() {
  usePageViewTracking();
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* Auth */}
        <Route path="/login" component={LandingPage} />
        <Route path="/onboarding">
          <Onboarding />
        </Route>

        {/* Root → Nexus */}
        <Route path="/" exact>
          <WithLayout>
            <NexusDashboard />
          </WithLayout>
        </Route>
        <Route path="/nexus">
          <WithLayout>
            <NexusDashboard />
          </WithLayout>
        </Route>

        {/* The Signal */}
        <Route path="/daily-brief">
          <WithLayout>
            <DailyBrief />
          </WithLayout>
        </Route>
        <Route path="/evening-review">
          <WithLayout>
            <EveningReview />
          </WithLayout>
        </Route>

        {/* Chief of Staff */}
        <Route path="/operations">
          <WithLayout>
            <OperationsPage />
          </WithLayout>
        </Route>
        <Route path="/tasks">
          <WithLayout>
            <ChiefOfStaff />
          </WithLayout>
        </Route>
        <Route path="/odyssey-management">
          <WithLayout>
            <DevelopmentPathway />
          </WithLayout>
        </Route>
        <Route path="/twin-training">
          <WithLayout>
            <COSTraining />
          </WithLayout>
        </Route>
        <Route path="/ai-agents">
          <WithLayout>
            <AIAgentsPage />
          </WithLayout>
        </Route>
        <Route path="/ai-agents/:id">
          <WithLayout>
            <AgentDetailPage />
          </WithLayout>
        </Route>
        <Route path="/ai-agents-monitoring">
          <WithLayout>
            <AIAgentsMonitoringPage />
          </WithLayout>
        </Route>
        <Route path="/victoria-tracker">
          <WithLayout>
            <VictoriaTrackerPage />
          </WithLayout>
        </Route>
        <Route path="/ai-experts">
          <WithLayout>
            <AISMEsPage />
          </WithLayout>
        </Route>
        <Route path="/analytics">
          <WithLayout>
            <Statistics />
          </WithLayout>
        </Route>
        <Route path="/documents">
          <WithLayout>
            <DocumentLibrary />
          </WithLayout>
        </Route>

        {/* Odyssey Engine */}
        <Route path="/innovation-hub">
          <WithLayout>
            <InnovationHub />
          </WithLayout>
        </Route>
        <Route path="/project-genesis">
          <WithLayout>
            <ProjectGenesisPage />
          </WithLayout>
        </Route>
        <Route path="/workflow/project_genesis/new">
          <WithLayout>
            <ProjectGenesisWizard />
          </WithLayout>
        </Route>
        <Route path="/workflow/project_genesis/:workflowId">
          <WithLayout>
            <ProjectGenesisWizard />
          </WithLayout>
        </Route>
        <Route path="/workflows">
          <WithLayout>
            <WorkflowsPage />
          </WithLayout>
        </Route>
        <Route path="/workflows/:id">
          <WithLayout>
            <WorkflowDetailPage />
          </WithLayout>
        </Route>
        <Route path="/persephone">
          <WithLayout>
            <PersephoneBoard />
          </WithLayout>
        </Route>

        {/* Integration Hub */}
        <Route path="/integrations">
          <WithLayout>
            <IntegrationHubPage />
          </WithLayout>
        </Route>
        {/* Knowledge Base */}
        <Route path="/knowledge-base">
          <WithLayout>
            <KnowledgeBasePage />
          </WithLayout>
        </Route>
        {/* KPI & OKR Dashboard */}
        <Route path="/kpis">
          <WithLayout>
            <KpiOkrPage />
          </WithLayout>
        </Route>

        {/* Phase 3: Email Intelligence */}
        <Route path="/email-intelligence">
          <WithLayout>
            <EmailIntelligencePage />
          </WithLayout>
        </Route>
        {/* Phase 3: Meeting Intelligence */}
        <Route path="/meeting-intelligence">
          <WithLayout>
            <MeetingIntelligencePage />
          </WithLayout>
        </Route>
        {/* Phase 3: Briefing Preferences */}
        <Route path="/briefing-preferences">
          <WithLayout>
            <BriefingPreferencesPage />
          </WithLayout>
        </Route>

        {/* Standalone */}
        <Route path="/vault">
          <WithLayout>
            <Vault />
          </WithLayout>
        </Route>
        <Route path="/war-room">
          <WithLayout>
            <WarRoom />
          </WithLayout>
        </Route>
        <Route path="/admin">
          <WithLayout>
            <AdminDashboard />
          </WithLayout>
        </Route>
        <Route path="/admin/health">
          <WithLayout>
            <AdminHealthPage />
          </WithLayout>
        </Route>
        <Route path="/settings">
          <WithLayout>
            <Settings />
          </WithLayout>
        </Route>
        <Route path="/expert-chat/:expertId">
          <ExpertChatPage />
        </Route>
        {/* Phase 4: New Pages */}
        <Route path="/notifications">
          <WithLayout>
            <NotificationsCentrePage />
          </WithLayout>
        </Route>
        <Route path="/voice-notes">
          <WithLayout>
            <VoiceNotesPage />
          </WithLayout>
        </Route>
        <Route path="/subscriptions">
          <WithLayout>
            <SubscriptionTrackerPage />
          </WithLayout>
        </Route>
        <Route path="/security/2fa">
          <WithLayout>
            <TwoFactorSetupPage />
          </WithLayout>
        </Route>
        <Route path="/brand-kit">
          <WithLayout>
            <BrandKitPage />
          </WithLayout>
        </Route>
        <Route path="/analytics/deep-dive">
          <WithLayout>
            <AnalyticsDeepDivePage />
          </WithLayout>
        </Route>
        <Route path="/email-accounts">
          <WithLayout>
            <EmailAccountsPage />
          </WithLayout>
        </Route>
        {/* p5-11: AI Cost Tracker */}
        <Route path="/ai-cost-tracker">
          <WithLayout>
            <AICostTrackerPage />
          </WithLayout>
        </Route>
        {/* 404 */}
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  // Initialise language/dir on mount — applies html[lang] and html[dir]
  useI18n();
  return (
    <PinGate>
      <ErrorBoundary>
        <ThemeProvider defaultTheme="dark" switchable>
          <GovernanceProvider>
            <AIRouterProvider>
              <DailyCycleProvider>
                <CelebrationProvider>
                  <TooltipProvider>
                    <Toaster />
                    <Router />
                    <GovernanceModeChangeModal />
                    <KeyboardShortcutsGuide />
                    <ChiefOfStaffNotification />
                  </TooltipProvider>
                </CelebrationProvider>
              </DailyCycleProvider>
            </AIRouterProvider>
          </GovernanceProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </PinGate>
  );
}

export default App;
