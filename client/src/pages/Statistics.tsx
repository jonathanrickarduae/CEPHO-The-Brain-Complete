import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import {
  Activity,
  TrendingUp,
  Zap,
  Brain,
  Server,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Cpu,
  BarChart3,
  } from "lucide-react";
import { PersonalAnalytics } from "@/components/analytics/PersonalAnalytics";
import { CollapsibleSection } from "@/components/shared/CollapsibleSection";
import { PageShell } from "@/components/layout/PageShell";

export default function Statistics() {
  const { data: insights, isLoading: insightsLoading } =
    trpc.dashboard.getInsights.useQuery();
  const { data: agentsData } = trpc.aiAgentsMonitoring.getAllStatus.useQuery(
    undefined,
    { retry: false }
  );

  // Merge live data into KPI cards where available
  const liveTasksCompleted = insights?.taskSummary?.completed ?? null;
  const liveTasksTotal = insights?.taskSummary?.total ?? null;
  const liveActiveProjects = insights?.projectSummary?.active ?? null;
  const liveAiConversations =
    insights?.metrics?.find(m => m.id === "ai_conversations")?.value ?? null;
  const liveActiveAgents = agentsData?.activeAgents ?? null;

  const kpis = [
    {
      id: 1,
      label: "Productivity Score",
      value: insights ? `${insights.completionRate ?? 0}%` : "—",
      change: insights
        ? insights.completionRate >= 70
          ? "On Track"
          : "Needs Attention"
        : "Loading...",
      status: insights
        ? insights.completionRate >= 70
          ? "green"
          : "amber"
        : "green",
      icon: Activity,
    },
    {
      id: 2,
      label: "Task Completion",
      value:
        liveTasksCompleted !== null && liveTasksTotal !== null
          ? `${liveTasksCompleted}/${liveTasksTotal}`
          : "—",
      change: liveTasksTotal
        ? `${Math.round(((liveTasksCompleted ?? 0) / liveTasksTotal) * 100)}%`
        : "On Track",
      status: "green",
      icon: CheckCircle2,
    },
    {
      id: 3,
      label: "Active Projects",
      value: liveActiveProjects !== null ? String(liveActiveProjects) : "—",
      change:
        liveActiveProjects !== null
          ? `${liveActiveProjects} running`
          : "Loading...",
      status: "amber",
      icon: Clock,
    },
    {
      id: 4,
      label: "AI Conversations (30d)",
      value: liveAiConversations !== null ? String(liveAiConversations) : "—",
      change:
        liveActiveAgents !== null
          ? `${liveActiveAgents} agents active`
          : "Optimal",
      status: "green",
      icon: Zap,
    },
  ];

  const evolutionTasks = [
    {
      id: 1,
      title: "Upgrade Context Window",
      desc: "Expand memory to 128k tokens for deeper analysis.",
      cost: "High Compute",
      status: "Recommended",
    },
    {
      id: 2,
      title: "Integrate Bloomberg Terminal",
      desc: "Real-time financial data ingestion for better insights.",
      cost: "API Key Req",
      status: "Pending",
    },
    {
      id: 3,
      title: "Optimize Neural Pathways",
      desc: "Refine decision trees based on last week's feedback.",
      cost: "Auto-Scheduled",
      status: "In Progress",
    },
  ];

  if (insightsLoading) {
    return (
      <PageShell
        icon={BarChart3}
        iconClass="bg-green-500/15 text-green-400"
        title="Analytics"
        subtitle="Personal performance metrics and system evolution"
      >
        <div className="max-w-6xl mx-auto space-y-5">
          {/* KPI cards skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="p-6 rounded-xl bg-card/60 border border-white/10 space-y-3 animate-pulse"
              >
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-8 w-16 bg-muted rounded" />
                <div className="h-5 w-20 bg-muted rounded" />
              </div>
            ))}
          </div>
          {/* Charts skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-card/60 border border-white/10 rounded-xl p-6 space-y-3 animate-pulse">
                <div className="h-5 w-40 bg-muted rounded" />
                <div className="h-48 w-full bg-muted rounded" />
              </div>
            </div>
            <div className="bg-card/60 border border-white/10 rounded-xl p-6 space-y-4 animate-pulse">
              <div className="h-5 w-32 bg-muted rounded" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 rounded-lg bg-muted/40 space-y-2">
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-full bg-muted rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      icon={BarChart3}
      iconClass="bg-green-500/15 text-green-400"
      title="Analytics"
      subtitle="Personal performance metrics and system evolution"
    >
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Personal Analytics Section */}
        <CollapsibleSection
          title="Personal Analytics"
          icon={<Activity className="w-5 h-5" />}
          defaultOpen={true}
          className="mb-6"
        >
          <PersonalAnalytics
            variant="full"
            data={
              insights
                ? {
                    productivityScore: insights.completionRate ?? 0,
                    productivityTrend:
                      (insights.completionRate ?? 0) >= 70 ? "up" : "down",
                    twinTrainingHours: 0,
                    decisionsThisWeek: liveAiConversations ?? 0,
                    tasksCompleted: liveTasksCompleted ?? 0,
                    avgResponseTime: "< 1 min",
                    topExpertUsed: "Victoria (Chief of Staff)",
                    moodAverage: 0,
                    streakDays: 0,
                  }
                : undefined
            }
          />
        </CollapsibleSection>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: KPIs + Training */}
          <div className="lg:col-span-2 space-y-6">
            {/* KPI Grid */}
            <CollapsibleSection
              title="Key Performance Indicators"
              icon={<TrendingUp className="w-5 h-5" />}
              defaultOpen={true}
              className="mb-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {kpis.map(kpi => (
                  <div
                    key={kpi.id}
                    className="p-6 rounded-xl bg-card/60 border border-white/10 relative overflow-hidden group"
                  >
                    <div
                      className={`absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity ${
                        kpi.status === "green"
                          ? "text-green-500"
                          : "text-amber-500"
                      }`}
                    >
                      <kpi.icon className="w-12 h-12" />
                    </div>
                    <div className="relative z-10">
                      <p className="text-sm text-muted-foreground font-medium mb-1">
                        {kpi.label}
                      </p>
                      <h3 className="text-3xl font-bold font-display mb-2 text-foreground">
                        {kpi.value}
                      </h3>
                      <div
                        className={`inline-flex items-center text-xs font-bold px-2 py-1 rounded ${
                          kpi.status === "green"
                            ? "bg-green-500/10 text-green-500"
                            : "bg-amber-500/10 text-amber-500"
                        }`}
                      >
                        {kpi.change}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* Chief of Staff Training Progress */}
            <CollapsibleSection
              title="Chief of Staff Training"
              icon={<Brain className="w-5 h-5" />}
              defaultOpen={true}
            >
              <div className="p-6 rounded-xl bg-card/60 border border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-5 h-5 text-[var(--brain-cyan)]" />
                  <h3 className="font-display font-bold">
                    Chief of Staff Training
                  </h3>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-4 rounded-lg bg-secondary/30">
                    <p className="text-2xl font-bold text-foreground">42h</p>
                    <p className="text-xs text-muted-foreground">
                      Total Training
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-secondary/30">
                    <p className="text-2xl font-bold text-foreground">247</p>
                    <p className="text-xs text-muted-foreground">
                      Patterns Learned
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-secondary/30">
                    <p className="text-2xl font-bold text-foreground">35%</p>
                    <p className="text-xs text-muted-foreground">
                      Autonomy Level
                    </p>
                  </div>
                </div>

                {/* Progress to next level */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Progress to 50% Autonomy
                    </span>
                    <span className="text-primary">15h remaining</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-primary w-[70%] rounded-full" />
                  </div>
                </div>
              </div>
            </CollapsibleSection>
          </div>

          {/* Right Column: Self-Evolution */}
          <div className="lg:col-span-1">
            <div className="h-full rounded-xl bg-gradient-to-b from-purple-900/20 to-card/60 border border-purple-500/20 p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center animate-pulse">
                  <Brain className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">
                    Self-Evolution
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    System Upgrades
                  </p>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                {evolutionTasks.map(task => (
                  <div
                    key={task.id}
                    className="p-4 rounded-lg bg-card/40 border border-white/10 hover:border-purple-500/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-sm text-foreground">
                        {task.title}
                      </h4>
                      <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-muted-foreground">
                        {task.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      {task.desc}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-purple-400 flex items-center gap-1">
                        <Cpu className="w-3 h-3" /> {task.cost}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-xs hover:text-purple-400 min-h-0"
                      >
                        Approve <ArrowUpRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-white/10 text-center">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  <Server className="w-4 h-4 mr-2" /> Run System Diagnostics
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
