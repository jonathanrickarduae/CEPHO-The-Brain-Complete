import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import BrainLayout from "./components/BrainLayout";
import Landing from "./pages/Landing";
import Dashboard from "@/pages/Dashboard";
import DigitalTwin from "@/pages/DigitalTwin";
import Workflow from "@/pages/Workflow";
import Library from "./pages/Library";
import Statistics from "./pages/Statistics";
import Vault from "./pages/Vault";
import DailyBrief from "./pages/DailyBrief";
import AIExperts from "./pages/AIExperts";
import EveningReview from "./pages/EveningReview";
import AITeam from "./pages/AITeam";
import Waitlist from "./pages/Waitlist";
import Settings from "./pages/Settings";
import Commercialization from "./pages/Commercialization";
import GoLive from "./pages/GoLive";
import About from "./pages/About";
import ReviewQueue from "./pages/ReviewQueue";
import { GovernanceProvider, GovernanceModeChangeModal } from "./hooks/useGovernance";

// Wrapper component for pages that need the sidebar layout
function WithLayout({ children }: { children: React.ReactNode }) {
  return <BrainLayout>{children}</BrainLayout>;
}

function Router() {
  return (
    <Switch>
      {/* Root goes directly to Dashboard - no landing page friction */}
      <Route path="/">
        <WithLayout><Dashboard /></WithLayout>
      </Route>
      
      {/* Waitlist page without sidebar */}
      <Route path="/waitlist" component={Waitlist} />
      
      {/* Dashboard pages with sidebar */}
      <Route path="/dashboard">
        <WithLayout><Dashboard /></WithLayout>
      </Route>
      <Route path="/digital-twin">
        <WithLayout><DigitalTwin /></WithLayout>
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
        <WithLayout><AIExperts /></WithLayout>
      </Route>
      <Route path="/evening-review">
        <WithLayout><EveningReview /></WithLayout>
      </Route>
      <Route path="/ai-team">
        <WithLayout><AITeam /></WithLayout>
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
          <TooltipProvider>
            <Toaster />
            <Router />
            <GovernanceModeChangeModal />
          </TooltipProvider>
        </GovernanceProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
