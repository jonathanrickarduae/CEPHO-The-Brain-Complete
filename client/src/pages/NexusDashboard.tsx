import React, { useState, useRef } from "react";
import { useLocation } from "wouter";
import { PageShell } from "@/components/layout/PageShell";
import {
  Sun,
  Users,
  User,
  BookOpen,
  Brain,
  LayoutDashboard,
  Shield,
  ShieldCheck,
  Rocket,
  TrendingUp,
  CheckCircle2,
  Lightbulb,
  Settings as SettingsIcon,
} from "lucide-react";
import { useGovernance } from "@/hooks/useGovernance";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import OpenClawChat from "@/components/ai-agents/OpenClawChat";

// RAG Status Indicator Component
function RAGStatus({
  status,
  label,
  count,
}: {
  status: "red" | "amber" | "green";
  label: string;
  count?: number;
}) {
  const colors = {
    red: "bg-red-500/20 border-red-500/50 text-red-400",
    amber: "bg-amber-500/20 border-amber-500/50 text-amber-400",
    green: "bg-emerald-500/20 border-emerald-500/50 text-emerald-400",
  };

  const dotColors = {
    red: "bg-red-500",
    amber: "bg-amber-500",
    green: "bg-emerald-500",
  };

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 ${colors[status]}`}
    >
      <div
        className={`w-2 h-2 rounded-full ${dotColors[status]} ${status === "green" ? "animate-pulse" : ""}`}
      />
      <span className="text-sm font-medium">{label}</span>
      {count !== undefined && (
        <span className="text-xs opacity-70">({count})</span>
      )}
    </div>
  );
}

// Metric Card Component
function MetricCard({
  icon: Icon,
  label,
  value,
  trend,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  trend?: "up" | "down" | "stable";
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-4 rounded-xl border-2 border-border bg-card hover:bg-card/80 hover:border-primary/50 transition-all duration-200 text-left w-full"
    >
      <div className="p-2 rounded-lg bg-primary/20">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
      {trend && (
        <TrendingUp
          className={`w-4 h-4 ${trend === "up" ? "text-emerald-500" : "text-muted-foreground"}`}
        />
      )}
    </button>
  );
}

// Activity Item Component
function ActivityItem({
  icon: Icon,
  title,
  subtitle,
  time,
  status,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  time: string;
  status?: "active" | "complete" | "pending";
}) {
  const statusColors = {
    active: "text-primary",
    complete: "text-emerald-400",
    pending: "text-amber-400",
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-card/50 transition-colors">
      <div
        className={`p-2 rounded-lg bg-primary/10 ${status ? statusColors[status] : ""}`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {time}
      </span>
    </div>
  );
}

export default function NexusDashboard() {
  const [, setLocation] = useLocation();
  const [inputValue, setInputValue] = useState("");
  const [clawOpen, setClawOpen] = useState(false);
  const _inputRef = useRef<HTMLTextAreaElement>(null); // reserved for future textarea binding
  const { mode, requestModeChange } = useGovernance();

  // Dashboard insights from API
  const { data: _insightsData, isLoading: _insightsLoading } =
    trpc.dashboard.getInsights.useQuery();

  // CEPHO Score — the single executive performance metric
  const { data: cephoScoreData } = trpc.cephoScore.get.useQuery();

  // Real task and project counts
  const { data: tasksData } = trpc.tasks.list.useQuery({ limit: 100 });
  const { data: projectsData } = trpc.projects.list.useQuery({});
  const { data: flywheelStats } = trpc.innovation.getFlywheelStats.useQuery();

  const completedTasks = (tasksData?.tasks ?? []).filter(
    t => t.status === "completed"
  ).length;
  const activeProjects = (projectsData ?? []).filter(
    p => p.status === "active"
  ).length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalIdeas = (flywheelStats as any)?.total ?? 0;

  // Voice input
  const {
    isListening,
    transcript: _transcript,
    startListening,
    stopListening,
    isSupported: voiceSupported,
  } = useVoiceInput({
    onResult: text => setInputValue(prev => prev + text),
    continuous: false,
  });

  const _toggleRecording = () => {
    if (isListening) {
      stopListening();
    } else {
      if (!voiceSupported) {
        toast.error("Voice input not supported");
        return;
      }
      startListening();
      toast.info("Listening...");
    }
  };

  const handleSubmit = () => {
    if (inputValue.trim()) {
      setLocation(`/digital-twin?message=${encodeURIComponent(inputValue)}`);
    }
  };

  const _handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const _handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
  };

  // Quick Access Skill Buttons — ordered by daily workflow priority
  const skillButtons = [
    {
      label: "Chief of Staff",
      icon: User,
      path: "/tasks",
      gradient: "from-emerald-500/20 to-teal-500/20",
      border: "border-emerald-500/50 hover:border-emerald-400",
    },
    {
      label: "Daily Briefing",
      icon: Sun,
      path: "/daily-brief",
      gradient: "from-amber-500/20 to-orange-500/20",
      border: "border-amber-500/50 hover:border-amber-400",
    },
    {
      label: "Innovation Hub",
      icon: Lightbulb,
      path: "/innovation-hub",
      gradient: "from-yellow-500/20 to-amber-500/20",
      border: "border-yellow-500/50 hover:border-yellow-400",
    },
    {
      label: "Project Genesis",
      icon: Rocket,
      path: "/project-genesis",
      gradient: "from-purple-500/20 to-pink-500/20",
      border: "border-purple-500/50 hover:border-purple-400",
    },
    {
      label: "AI-SME Experts",
      icon: Brain,
      path: "/ai-experts",
      gradient: "from-cyan-500/20 to-blue-500/20",
      border: "border-cyan-500/50 hover:border-cyan-400",
    },
    {
      label: "Digital Twin",
      icon: Users,
      path: "/twin-training",
      gradient: "from-blue-500/20 to-indigo-500/20",
      border: "border-blue-500/50 hover:border-blue-400",
    },
    {
      label: "Knowledge Base",
      icon: BookOpen,
      path: "/knowledge-base",
      gradient: "from-indigo-500/20 to-purple-500/20",
      border: "border-indigo-500/50 hover:border-indigo-400",
    },
  ];

  return (
    <PageShell
      icon={LayoutDashboard}
      title="The Nexus"
      subtitle="Command Center"
      actions={
        <div className="hidden sm:flex flex-wrap items-center gap-2 sm:gap-4">
          {/* Governance Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                requestModeChange(mode === "omni" ? "governed" : "omni")
              }
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg border-2 transition-all duration-300 ${
                mode === "governed"
                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                  : "bg-amber-500/20 border-amber-500/50 text-amber-400"
              } hover:scale-105 active:scale-95`}
              title={
                mode === "governed"
                  ? "Governed Mode: Only approved tools"
                  : "Everything Mode: All tools available"
              }
            >
              {mode === "governed" ? (
                <>
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm font-semibold">
                    GOVERNED
                  </span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm font-semibold">
                    EVERYTHING
                  </span>
                </>
              )}
            </button>
            <button
              onClick={() => setLocation("/settings")}
              className="p-2 rounded-lg border border-border hover:bg-card/50 transition-colors"
              title="Manage governance settings"
            >
              <SettingsIcon className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-foreground/70 font-mono">ONLINE</span>
          </div>
        </div>
      }
      fillHeight
    >
      {/* Main Content - Single Column Layout */}
      <div className="flex-1 flex flex-col gap-4 sm:gap-4 p-3 sm:p-4 md:p-6 pb-6 overflow-auto">
        {/* Top Section - Dashboard Info */}
        <div className="flex flex-col gap-4">
          {/* RAG Status Row */}
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">
              SYSTEM STATUS
            </h2>
            <div className="flex flex-wrap gap-3">
              <RAGStatus status="green" label="Integrations" count={5} />
              <RAGStatus status="green" label="AI Services" count={3} />
              <RAGStatus status="green" label="Database" />
              <RAGStatus status="amber" label="Pending Approvals" count={2} />
            </div>
          </div>

          {/* Quick Access Skills */}
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">
              QUICK ACCESS
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
              {skillButtons.map((skill, idx) => (
                <button
                  key={idx}
                  onClick={() => setLocation(skill.path)}
                  className={`flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-4 rounded-xl border-2 ${skill.border} bg-gradient-to-br ${skill.gradient} hover:scale-105 active:scale-95 transition-all duration-200`}
                >
                  <skill.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="text-[0.65rem] sm:text-xs font-medium text-center leading-tight">
                    {skill.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Key Metrics */}
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">
              KEY METRICS
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <MetricCard
                icon={Lightbulb}
                label="Innovation Ideas"
                value={totalIdeas}
                trend="up"
                onClick={() => setLocation("/innovation-hub")}
              />
              <MetricCard
                icon={Brain}
                label="CEPHO Score"
                value={
                  cephoScoreData?.total ? `${cephoScoreData.total}/100` : "--"
                }
                trend="stable"
                onClick={() => setLocation("/statistics")}
              />
              <MetricCard
                icon={CheckCircle2}
                label="Tasks Completed"
                value={completedTasks}
                trend="stable"
                onClick={() => setLocation("/chief-of-staff")}
              />
              <MetricCard
                icon={Rocket}
                label="Active Projects"
                value={activeProjects}
                trend="stable"
                onClick={() => setLocation("/project-genesis")}
              />
            </div>
          </div>
        </div>

        {/* OpenClaw AI Assistant - Moved to fixed bottom-right */}

        {/* Bottom Section - Activity Feed (Scrollable) */}
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">
            RECENT ACTIVITY
          </h2>
          <div className="border-2 border-border rounded-xl bg-card p-4 space-y-2">
            <ActivityItem
              icon={Brain}
              title="AI-SME: Dr. Sarah Chen"
              subtitle="Completed analysis on market trends"
              time="5m ago"
              status="complete"
            />
            <ActivityItem
              icon={Lightbulb}
              title="Innovation Hub"
              subtitle="New idea generated from TechCrunch article"
              time="12m ago"
              status="active"
            />
            <ActivityItem
              icon={User}
              title="Chief of Staff"
              subtitle="3 tasks require your attention"
              time="1h ago"
              status="pending"
            />
            <ActivityItem
              icon={Sun}
              title="Morning Signal"
              subtitle="Daily brief ready for review"
              time="2h ago"
              status="complete"
            />
            <ActivityItem
              icon={Rocket}
              title="Project Genesis"
              subtitle="Blueprint updated: CEPHO Platform"
              time="3h ago"
              status="active"
            />
          </div>
        </div>
      </div>

      {/* OpenClaw AI Assistant - Collapsible Fixed Bottom Right (Desktop only) */}
      <div className="hidden lg:block fixed bottom-6 right-6 z-50">
        {clawOpen && (
          <div className="mb-3 w-96 h-[500px] border-2 border-cyan-400/50 rounded-xl overflow-hidden bg-card/95 backdrop-blur-lg shadow-[0_0_30px_rgba(0,212,255,0.3)]">
            <OpenClawChat />
          </div>
        )}
        <button
          onClick={() => setClawOpen(o => !o)}
          className="ml-auto flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-cyan-400/50 bg-card/95 backdrop-blur-lg shadow-[0_0_20px_rgba(0,212,255,0.2)] text-cyan-400 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] transition-all duration-200"
          title={clawOpen ? "Close ClawBot" : "Open ClawBot"}
        >
          <Brain className="w-5 h-5" />
          <span className="text-sm font-semibold">
            {clawOpen ? "Close" : "ClawBot"}
          </span>
        </button>
      </div>
    </PageShell>
  );
}
