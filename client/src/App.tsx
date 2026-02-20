import { Route, Switch } from "wouter";
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import { ThemeProvider } from "./contexts/ThemeContext";
import BrainLayout from '@/components/ai-agents/BrainLayout';
import { GovernanceProvider, GovernanceModeChangeModal } from "./hooks/useGovernance";
import { AIRouterProvider } from '@/components/ai-agents/AIRouter';
import { CelebrationProvider } from '@/components/shared/CelebrationAnimations';
import { DailyCycleProvider } from '@/components/ai-agents/DailyCycleProvider';
import { PageTransition } from '@/components/shared/PageTransition';
import { KeyboardShortcutsGuide } from '@/components/project-management/KeyboardShortcutsGuide';
import { ChiefOfStaffNotification } from '@/components/communication/ChiefOfStaffNotification';

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

// Lazy load all page components for better code splitting
const NotFound = lazy(() => import("@/pages/NotFound"));
const Landing = lazy(() => import("./pages/Landing"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const NexusDashboard = lazy(() => import("@/pages/NexusDashboard"));
const DigitalTwin = lazy(() => import("@/pages/DigitalTwin"));
const ChiefOfStaff = lazy(() => import("@/pages/ChiefOfStaff"));
const Workflow = lazy(() => import("@/pages/Workflow"));
const Library = lazy(() => import("./pages/Library"));
const Statistics = lazy(() => import("./pages/Statistics"));
const Vault = lazy(() => import("./pages/Vault"));
const DailyBrief = lazy(() => import("./pages/DailyBrief"));
const AIExperts = lazy(() => import("./pages/AIExperts"));
const AISMEsPage = lazy(() => import("./pages/AISMEsPage"));
const EveningReview = lazy(() => import("./pages/EveningReview"));
const MorningSignal = lazy(() => import("./pages/MorningSignal"));
const AITeam = lazy(() => import("./pages/AITeam"));
const Waitlist = lazy(() => import("./pages/Waitlist"));
const Login = lazy(() => import("./pages/Login"));
const Settings = lazy(() => import("./pages/Settings"));
const Commercialization = lazy(() => import("./pages/Commercialization"));
const GoLive = lazy(() => import("./pages/GoLive"));
const About = lazy(() => import("./pages/About"));
const ReviewQueue = lazy(() => import("./pages/ReviewQueue"));
const ProjectGenesisPage = lazy(() => import("./pages/ProjectGenesisPage"));
const InboxPage = lazy(() => import("./pages/InboxPage"));
const VideoStudioPage = lazy(() => import("./pages/VideoStudioPage"));
const QADashboardPage = lazy(() => import("./pages/QADashboardPage"));
const VoiceNotepadPage = lazy(() => import("./pages/VoiceNotepadPage"));
const IntegrationsPage = lazy(() => import("./pages/IntegrationsPage"));
const PodcastPage = lazy(() => import("./pages/PodcastPage"));
const WellnessPage = lazy(() => import("./pages/WellnessPage"));
const ChiefOfStaffRole = lazy(() => import("./pages/ChiefOfStaffRole"));
const ReferenceLibrary = lazy(() => import("./pages/ReferenceLibrary"));
const DueDiligencePage = lazy(() => import("./pages/DueDiligencePage"));
const CentralHub = lazy(() => import("./pages/CentralHub"));
const ExpertChatPage = lazy(() => import("./pages/ExpertChatPage"));
const InnovationHub = lazy(() => import("./pages/InnovationHub"));
const DocumentLibrary = lazy(() => import("./pages/DocumentLibrary"));
const DevelopmentPathway = lazy(() => import("./pages/DevelopmentPathway"));
const COSTraining = lazy(() => import("./pages/COSTraining"));
const PortfolioCommandCenter = lazy(() => import("./pages/PortfolioCommandCenter"));
const RevenueDashboard = lazy(() => import("./pages/RevenueDashboard"));
const KpiDashboard = lazy(() => import("./pages/KpiDashboard"));
const OperationsPage = lazy(() => import("./pages/OperationsPage"));
const GrowthPage = lazy(() => import("./pages/GrowthPage"));
const AIAgentsPage = lazy(() => import("./pages/AIAgentsPage"));
const AgentDetailPage = lazy(() => import("./pages/AgentDetailPage"));
const WorkflowsPage = lazy(() => import("./pages/WorkflowsPage"));
const WorkflowDetailPage = lazy(() => import("./pages/WorkflowDetailPage"));
const SocialMediaBlueprint = lazy(() => import("./pages/SocialMediaBlueprint"));
const BusinessModelPage = lazy(() => import("./pages/BusinessModelPage"));
const QuestionnaireOnline = lazy(() => import("./pages/QuestionnaireOnline"));
const StrategicFrameworkQuestionnaire = lazy(() => import("./pages/StrategicFrameworkQuestionnaire"));
const AgentsMonitoring = lazy(() => import("./pages/AgentsMonitoring"));

// Wrapper component for pages that need the sidebar layout with page transitions
function WithLayout({ children }: { children: React.ReactNode }) {
  return (
    <BrainLayout>
      <PageTransition className="h-full">
        {children}
      </PageTransition>
    </BrainLayout>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* Root goes directly to Dashboard - no landing page friction */}
        <Route path="/">
          <WithLayout><NexusDashboard /></WithLayout>
        </Route>
        
        {/* Waitlist page without sidebar */}
        <Route path="/waitlist" component={Waitlist} />
        
        {/* Login page without sidebar */}
        <Route path="/login" component={Login} />
        
        {/* Dashboard pages with sidebar */}
        <Route path="/dashboard">
          <WithLayout><NexusDashboard /></WithLayout>
        </Route>
        <Route path="/digital-twin">
          <WithLayout><ChiefOfStaff /></WithLayout>
        </Route>
        <Route path="/chief-of-staff">
          <WithLayout><ChiefOfStaff /></WithLayout>
        </Route>
        <Route path="/chief-of-staff-role">
          <WithLayout><ChiefOfStaffRole /></WithLayout>
        </Route>
        <Route path="/workflow">
          <WithLayout><Workflow /></WithLayout>
        </Route>
        <Route path="/library">
          <WithLayout><Library /></WithLayout>
        </Route>
        <Route path="/statistics">
          <WithLayout><Statistics /></WithLayout>
        </Route>
        <Route path="/vault">
          <WithLayout><Vault /></WithLayout>
        </Route>
        <Route path="/daily-brief">
          <WithLayout><DailyBrief /></WithLayout>
        </Route>
        <Route path="/ai-experts">
          <WithLayout><AISMEsPage /></WithLayout>
        </Route>
        <Route path="/expert-chat/:expertId">
          <ExpertChatPage />
        </Route>
        <Route path="/evening-review">
          <WithLayout><EveningReview /></WithLayout>
        </Route>
        <Route path="/morning-signal">
          <WithLayout><MorningSignal /></WithLayout>
        </Route>
        <Route path="/ai-team">
          <WithLayout><AITeam /></WithLayout>
        </Route>
        <Route path="/agents">
          <WithLayout><AIAgentsPage /></WithLayout>
        </Route>
        <Route path="/agents/:id">
          <WithLayout><AgentDetailPage /></WithLayout>
        </Route>
        <Route path="/agents-monitoring">
          <WithLayout><AgentsMonitoring /></WithLayout>
        </Route>
        <Route path="/settings">
          <WithLayout><Settings /></WithLayout>
        </Route>
        <Route path="/commercialization">
          <WithLayout><Commercialization /></WithLayout>
        </Route>
        <Route path="/go-live">
          <WithLayout><GoLive /></WithLayout>
        </Route>
        <Route path="/about">
          <WithLayout><About /></WithLayout>
        </Route>
        <Route path="/review-queue">
          <WithLayout><ReviewQueue /></WithLayout>
        </Route>
        <Route path="/project-genesis">
          <WithLayout><ProjectGenesisPage /></WithLayout>
        </Route>
        <Route path="/innovation-hub">
          <WithLayout><InnovationHub /></WithLayout>
        </Route>
        <Route path="/documents">
          <WithLayout><DocumentLibrary /></WithLayout>
        </Route>
        <Route path="/development-pathway">
          <WithLayout><DevelopmentPathway /></WithLayout>
        </Route>
        <Route path="/cos-training">
          <WithLayout><COSTraining /></WithLayout>
        </Route>
        <Route path="/questionnaire">
          <WithLayout><QuestionnaireOnline /></WithLayout>
        </Route>
        <Route path="/strategic-framework">
          <StrategicFrameworkQuestionnaire />
        </Route>
        <Route path="/portfolio">
          <WithLayout><PortfolioCommandCenter /></WithLayout>
        </Route>
        <Route path="/revenue">
          <WithLayout><RevenueDashboard /></WithLayout>
        </Route>
        <Route path="/kpi-dashboard">
          <WithLayout><KpiDashboard /></WithLayout>
        </Route>
        <Route path="/operations">
          <WithLayout><OperationsPage /></WithLayout>
        </Route>
        <Route path="/growth">
          <WithLayout><GrowthPage /></WithLayout>
        </Route>
        <Route path="/social-media-blueprint">
          <WithLayout><SocialMediaBlueprint /></WithLayout>
        </Route>
        <Route path="/business-model">
          <WithLayout><BusinessModelPage /></WithLayout>
        </Route>
        <Route path="/due-diligence">
          <WithLayout><DueDiligencePage /></WithLayout>
        </Route>
        <Route path="/inbox">
          <WithLayout><InboxPage /></WithLayout>
        </Route>
        
        <Route path="/video-studio">
          <WithLayout><VideoStudioPage /></WithLayout>
        </Route>
        <Route path="/qa-dashboard">
          <WithLayout><QADashboardPage /></WithLayout>
        </Route>
        <Route path="/voice-notepad">
          <WithLayout><VoiceNotepadPage /></WithLayout>
        </Route>
        <Route path="/integrations">
          <WithLayout><IntegrationsPage /></WithLayout>
        </Route>
        <Route path="/central-hub">
          <WithLayout><CentralHub /></WithLayout>
        </Route>
        <Route path="/podcast">
          <WithLayout><PodcastPage /></WithLayout>
        </Route>
        <Route path="/wellness">
          <WithLayout><WellnessPage /></WithLayout>
        </Route>
        <Route path="/reference-library">
          <WithLayout><ReferenceLibrary /></WithLayout>
        </Route>
        <Route path="/workflows/:id">
          <WithLayout><WorkflowDetailPage /></WithLayout>
        </Route>
        <Route path="/workflows">
          <WithLayout><WorkflowsPage /></WithLayout>
        </Route>
        
        {/* Fallback */}
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
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
  );
}

export default App;
