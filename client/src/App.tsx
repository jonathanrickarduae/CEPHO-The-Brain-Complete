import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import NotFound from "@/pages/not-found";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Landing from "./pages/Landing";
import Dashboard from "@/pages/Dashboard";
import DigitalTwin from "@/pages/DigitalTwin";
import Workflow from "@/pages/Workflow";
import Library from "./pages/Library";
import Statistics from "./pages/Statistics";
import Vault from "./pages/Vault";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Landing} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/digital-twin" component={DigitalTwin} />
      <Route path="/workflow" component={Workflow} />
      <Route path={"/library"} component={Library} />
      <Route path={"/statistics"} component={Statistics} />
      <Route path={"/vault"} component={Vault} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <ErrorBoundary>
        <Router />
        <Toaster />
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
