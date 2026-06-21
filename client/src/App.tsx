// CEPHO.ai — The Brain
// Design: Meridian Light — white bg, electric cyan primary, neon pink secondary
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { lazy, Suspense } from "react";
import BrainLayout from "./components/BrainLayout";
import { DashboardLayoutSkeleton } from "./components/DashboardLayoutSkeleton";

// Core pages
const NexusDashboard = lazy(() => import("@/pages/NexusDashboard"));
const ProjectsHub = lazy(() => import("@/pages/ProjectsHub"));
const ProjectPortal = lazy(() => import("@/pages/ProjectPortal"));
const MorningSignal = lazy(() => import("@/pages/MorningSignal"));
const InboxPage = lazy(() => import("@/pages/InboxPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const CalendarPage = lazy(() => import("@/pages/CalendarPage"));
const TasksPage = lazy(() => import("@/pages/TasksPage"));
const DecisionsPage = lazy(() => import("@/pages/DecisionsPage"));

// Intelligence pages
const GenesisPage = lazy(() => import("@/pages/GenesisPage"));
const InnovationPage = lazy(() => import("@/pages/InnovationPage"));
const SMEPage = lazy(() => import("@/pages/SMEPage"));
const FinancialPage = lazy(() => import("@/pages/FinancialPage"));
const VaultPage = lazy(() => import("@/pages/VaultPage"));
const DocumentLibraryPage = lazy(() => import("@/pages/DocumentLibraryPage"));
const VictoriaChat = lazy(() => import("@/pages/VictoriaChat"));

const AIAgentsPage = lazy(() => import("@/pages/AIAgentsPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function PageLoader() {
  return <DashboardLayoutSkeleton />;
}

function Router() {
  return (
    <BrainLayout>
      <Suspense fallback={<PageLoader />}>
        <Switch>
          {/* Operations */}
          <Route path="/" component={NexusDashboard} />
          <Route path="/dashboard" component={NexusDashboard} />
          <Route path="/projects" component={ProjectsHub} />
          <Route path="/projects/:id" component={ProjectPortal} />
          <Route path="/morning-signal" component={MorningSignal} />
          <Route path="/inbox" component={InboxPage} />
          <Route path="/calendar" component={CalendarPage} />
          <Route path="/tasks" component={TasksPage} />
          <Route path="/decisions" component={DecisionsPage} />
          {/* Intelligence */}
          <Route path="/genesis" component={GenesisPage} />
          <Route path="/innovation" component={InnovationPage} />
          <Route path="/sme" component={SMEPage} />
          <Route path="/financial" component={FinancialPage} />
          <Route path="/vault" component={VaultPage} />
          <Route path="/documents" component={DocumentLibraryPage} />
          <Route path="/victoria" component={VictoriaChat} />
          <Route path="/agents" component={AIAgentsPage} />
          {/* Settings */}
          <Route path="/settings" component={SettingsPage} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </BrainLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
