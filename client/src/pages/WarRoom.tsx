// @ts-nocheck
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  AlertTriangle,
  Zap,
  Target,
  Shield,
  Clock,
  Users,
  TrendingDown,
  CheckCircle2,
  Plus,
  Send,
  Brain,
} from "lucide-react";

const CRISIS_TYPES = [
  { id: "project_failure", label: "Project Failure", icon: TrendingDown, color: "text-red-500" },
  { id: "client_risk", label: "Client at Risk", icon: Users, color: "text-orange-500" },
  { id: "competitor_move", label: "Competitor Move", icon: Target, color: "text-yellow-500" },
  { id: "team_crisis", label: "Team Crisis", icon: Shield, color: "text-purple-500" },
  { id: "financial_risk", label: "Financial Risk", icon: TrendingDown, color: "text-red-600" },
  { id: "operational_outage", label: "Operational Outage", icon: AlertTriangle, color: "text-red-500" },
];

export default function WarRoom() {
  const [activeCrisis, setActiveCrisis] = useState<string | null>(null);
  const [crisisDescription, setCrisisDescription] = useState("");
  const [isActivated, setIsActivated] = useState(false);
  const [responseplan, setResponsePlan] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const executeMutation = trpc.autonomousExecution.execute.useMutation({
    onSuccess: (data) => {
      setResponsePlan(data.plan ?? "Response plan generated. Agents have been deployed.");
      setIsGenerating(false);
      toast.success("War Room activated. AI team deployed.");
    },
    onError: (err) => {
      setIsGenerating(false);
      toast.error("Failed to activate War Room: " + err.message);
    },
  });

  const handleActivate = () => {
    if (!activeCrisis || !crisisDescription.trim()) {
      toast.error("Please select a crisis type and describe the situation.");
      return;
    }
    setIsActivated(true);
    setIsGenerating(true);
    const crisisLabel = CRISIS_TYPES.find(c => c.id === activeCrisis)?.label ?? activeCrisis;
    executeMutation.mutate({
      goal: `WAR ROOM ACTIVATION — ${crisisLabel}: ${crisisDescription}. This is a critical situation requiring immediate autonomous response. Analyse all relevant data, identify risks, assign tasks to appropriate agents, and generate a rapid response plan.`,
      priority: "critical",
    });
  };

  const handleReset = () => {
    setActiveCrisis(null);
    setCrisisDescription("");
    setIsActivated(false);
    setResponsePlan(null);
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">War Room</h1>
            <p className="text-muted-foreground text-sm">
              Crisis management — activate your full AI team for rapid response
            </p>
          </div>
          {isActivated && (
            <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-red-500/20 border border-red-500/40 rounded-full">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-semibold text-red-400">ACTIVE</span>
            </div>
          )}
        </div>

        {!isActivated ? (
          <>
            {/* Crisis Type Selection */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-foreground mb-3">Select Crisis Type</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CRISIS_TYPES.map(crisis => {
                  const Icon = crisis.icon;
                  return (
                    <button
                      key={crisis.id}
                      onClick={() => setActiveCrisis(crisis.id)}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                        activeCrisis === crisis.id
                          ? "border-red-500 bg-red-500/10"
                          : "border-border bg-card hover:border-red-500/50"
                      }`}
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 ${crisis.color}`} />
                      <span className="text-sm font-medium text-foreground">{crisis.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Crisis Description */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-foreground mb-3">Describe the Situation</h2>
              <textarea
                value={crisisDescription}
                onChange={e => setCrisisDescription(e.target.value)}
                placeholder="Describe what has happened, who is affected, and what the immediate risk is..."
                rows={4}
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
              />
            </div>

            {/* Activate Button */}
            <button
              onClick={handleActivate}
              disabled={!activeCrisis || !crisisDescription.trim()}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-lg transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Zap className="w-6 h-6" />
              Activate War Room — Deploy AI Team
            </button>

            <p className="text-xs text-muted-foreground text-center mt-3">
              This will immediately deploy your full AI agent team to analyse the situation and generate a rapid response plan.
            </p>
          </>
        ) : (
          <>
            {/* Active War Room */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="font-bold text-foreground mb-1">
                    {CRISIS_TYPES.find(c => c.id === activeCrisis)?.label ?? "Crisis"} — Active
                  </h2>
                  <p className="text-sm text-muted-foreground">{crisisDescription}</p>
                </div>
              </div>
            </div>

            {/* Agent Status */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: "Chief of Staff", status: "Coordinating", icon: Brain },
                { label: "Risk Agent", status: "Analysing", icon: Shield },
                { label: "Strategy Agent", status: "Planning", icon: Target },
                { label: "Comms Agent", status: "Drafting", icon: Send },
              ].map(agent => {
                const Icon = agent.icon;
                return (
                  <div key={agent.label} className="bg-card border border-border rounded-xl p-4">
                    <Icon className="w-5 h-5 text-primary mb-2" />
                    <p className="text-xs font-semibold text-foreground">{agent.label}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-xs text-amber-500">{agent.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Response Plan */}
            <div className="bg-card border border-border rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-foreground">AI Response Plan</h2>
              </div>
              {isGenerating ? (
                <div className="flex items-center gap-3 py-8 justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                  <span className="text-muted-foreground text-sm">
                    Analysing situation and generating response plan...
                  </span>
                </div>
              ) : responseplan ? (
                <div className="prose prose-sm prose-invert max-w-none">
                  <p className="text-foreground whitespace-pre-wrap text-sm leading-relaxed">
                    {responseplan}
                  </p>
                </div>
              ) : null}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all"
              >
                Deactivate War Room
              </button>
              <button
                onClick={() => window.location.href = "/persephone"}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-all"
              >
                <Target className="w-4 h-4" />
                View on Persephone Board
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
