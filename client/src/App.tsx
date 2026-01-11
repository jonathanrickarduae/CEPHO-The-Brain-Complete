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

// Wrapper component for pages that need the sidebar layout
function WithLayout({ children }: { children: React.ReactNode }) {
  return <BrainLayout>{children}</BrainLayout>;
}

function Router() {
  return (
    <Switch>
      {/* Landing page without sidebar */}
      <Route path={"/"} component={Landing} />
      
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
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
