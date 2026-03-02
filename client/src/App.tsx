// @ts-nocheck
import { Switch, Route } from "wouter";
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
const AIAgentsMonitoringPage = lazy(() => import("./pages/AIAgentsMonitoringPage"));
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

// ── Standalone ───────────────────────────────────────────────────────────────
const Vault = lazy(() => import("./pages/Vault"));
const Settings = lazy(() => import("./pages/Settings"));
const ExpertChatPage = lazy(() => import("./pages/ExpertChatPage"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const WarRoom = lazy(() => import("./pages/WarRoom"));

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
          <WithLayout><NexusDashboard /></WithLayout>
        </Route>
        <Route path="/nexus">
          <WithLayout><NexusDashboard /></WithLayout>
        </Route>

        {/* The Signal */}
        <Route path="/daily-brief">
          <WithLayout><DailyBrief /></WithLayout>
        </Route>
        <Route path="/evening-review">
          <WithLayout><EveningReview /></WithLayout>
        </Route>

        {/* Chief of Staff */}
        <Route path="/operations">
          <WithLayout><OperationsPage /></WithLayout>
        </Route>
        <Route path="/tasks">
          <WithLayout><ChiefOfStaff /></WithLayout>
        </Route>
        <Route path="/odyssey-management">
          <WithLayout><DevelopmentPathway /></WithLayout>
        </Route>
        <Route path="/twin-training">
          <WithLayout><COSTraining /></WithLayout>
        </Route>
        <Route path="/ai-agents">
          <WithLayout><AIAgentsPage /></WithLayout>
        </Route>
        <Route path="/ai-agents/:id">
          <WithLayout><AgentDetailPage /></WithLayout>
        </Route>
        <Route path="/ai-agents-monitoring">
          <WithLayout><AIAgentsMonitoringPage /></WithLayout>
        </Route>
        <Route path="/ai-experts">
          <WithLayout><AISMEsPage /></WithLayout>
        </Route>
        <Route path="/analytics">
          <WithLayout><Statistics /></WithLayout>
        </Route>
        <Route path="/documents">
          <WithLayout><DocumentLibrary /></WithLayout>
        </Route>

        {/* Odyssey Engine */}
        <Route path="/innovation-hub">
          <WithLayout><InnovationHub /></WithLayout>
        </Route>
        <Route path="/project-genesis">
          <WithLayout><ProjectGenesisPage /></WithLayout>
        </Route>
        <Route path="/workflow/project_genesis/new">
          <WithLayout><ProjectGenesisWizard /></WithLayout>
        </Route>
        <Route path="/workflow/project_genesis/:workflowId">
          <WithLayout><ProjectGenesisWizard /></WithLayout>
        </Route>
        <Route path="/workflows">
          <WithLayout><WorkflowsPage /></WithLayout>
        </Route>
        <Route path="/workflows/:id">
          <WithLayout><WorkflowDetailPage /></WithLayout>
        </Route>
        <Route path="/persephone">
          <WithLayout><PersephoneBoard /></WithLayout>
        </Route>

        {/* Standalone */}
        <Route path="/vault">
          <WithLayout><Vault /></WithLayout>
        </Route>
        <Route path="/war-room">
          <WithLayout><WarRoom /></WithLayout>
        </Route>
        <Route path="/settings">
          <WithLayout><Settings /></WithLayout>
        </Route>
        <Route path="/expert-chat/:expertId">
          <ExpertChatPage />
        </Route>

        {/* 404 */}
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
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
