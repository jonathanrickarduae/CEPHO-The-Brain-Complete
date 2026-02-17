import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import BrainLayout from "./components/BrainLayout";
import Landing from "./pages/Landing";
import Dashboard from "@/pages/Dashboard";
import NexusDashboard from "@/pages/NexusDashboard";
import DigitalTwin from "@/pages/DigitalTwin";
import ChiefOfStaff from "@/pages/ChiefOfStaff";
import Workflow from "@/pages/Workflow";
import Library from "./pages/Library";
import Statistics from "./pages/Statistics";
import Vault from "./pages/Vault";
import DailyBrief from "./pages/DailyBrief";
import AIExperts from "./pages/AIExperts";
import AISMEsPage from "./pages/AISMEsPage";
import EveningReview from "./pages/EveningReview";
import MorningSignal from "./pages/MorningSignal";
import AITeam from "./pages/AITeam";
import Waitlist from "./pages/Waitlist";
import Settings from "./pages/Settings";
import Commercialization from "./pages/Commercialization";
import GoLive from "./pages/GoLive";
import About from "./pages/About";
import ReviewQueue from "./pages/ReviewQueue";
import ProjectGenesisPage from "./pages/ProjectGenesisPage";
import InboxPage from "./pages/InboxPage";
import VideoStudioPage from "./pages/VideoStudioPage";
import QADashboardPage from "./pages/QADashboardPage";
import VoiceNotepadPage from "./pages/VoiceNotepadPage";
import IntegrationsPage from "./pages/IntegrationsPage";
import PodcastPage from "./pages/PodcastPage";
import WellnessPage from "./pages/WellnessPage";
import ChiefOfStaffRole from "./pages/ChiefOfStaffRole";
import ReferenceLibrary from "./pages/ReferenceLibrary";
import DueDiligencePage from "./pages/DueDiligencePage";
import CentralHub from "./pages/CentralHub";
import ExpertChatPage from "./pages/ExpertChatPage";
import InnovationHub from "./pages/InnovationHub";
import DocumentLibrary from "./pages/DocumentLibrary";
import DevelopmentPathway from "./pages/DevelopmentPathway";
import COSTraining from "./pages/COSTraining";
import PortfolioCommandCenter from "./pages/PortfolioCommandCenter";
import RevenueDashboard from "./pages/RevenueDashboard";
import KpiDashboard from "./pages/KpiDashboard";
import OperationsPage from "./pages/OperationsPage";
import GrowthPage from "./pages/GrowthPage";
import AIAgentsPage from "./pages/AIAgentsPage";
import AgentDetailPage from "./pages/AgentDetailPage";
import WorkflowsPage from "./pages/WorkflowsPage";
import WorkflowDetailPage from "./pages/WorkflowDetailPage";
import SocialMediaBlueprint from "./pages/SocialMediaBlueprint";
import BusinessModelPage from "./pages/BusinessModelPage";
import QuestionnaireOnline from "./pages/QuestionnaireOnline";
import StrategicFrameworkQuestionnaire from "./pages/StrategicFrameworkQuestionnaire";
import { GovernanceProvider, GovernanceModeChangeModal } from "./hooks/useGovernance";
import { AIRouterProvider } from "./components/AIRouter";
import { CelebrationProvider } from "./components/CelebrationAnimations";
import { DailyCycleProvider } from "./components/DailyCycleProvider";
import { PageTransition } from "./components/PageTransition";
import { KeyboardShortcutsGuide } from "./components/KeyboardShortcutsGuide";
import { ChiefOfStaffNotification } from "./components/ChiefOfStaffNotification";

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
    <Switch>
      {/* Root goes directly to Dashboard - no landing page friction */}
      <Route path="/">
        <WithLayout><NexusDashboard /></WithLayout>
      </Route>
      
      {/* Waitlist page without sidebar */}
      <Route path="/waitlist" component={Waitlist} />
      
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
