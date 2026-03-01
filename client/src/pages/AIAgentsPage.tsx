// @ts-nocheck
import { useState } from "react";
import { Link } from "wouter";
import { Bot, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import AIAgentsVideo from "@/components/ai-agents/AIAgentsVideo";
import { trpc } from "@/lib/trpc";
import { PageShell } from "@/components/layout/PageShell";

export default function AIAgentsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "performance" | "tasks">("performance");

  const {
    data: agentsData,
    isLoading: agentsLoading,
    error: agentsError,
    refetch,
  } = trpc.aiAgentsMonitoring.getAllStatus.useQuery(undefined, { retry: false });

  const agents = agentsData?.agents || [];
  const stats = agentsData
    ? {
        totalAgents: agentsData.totalAgents,
        activeAgents: agentsData.activeAgents,
        avgPerformance:
          agents.length > 0
            ? agents.reduce((sum, a) => sum + a.performanceRating, 0) / agents.length
            : 0,
        totalTasksCompleted: agents.reduce((sum, a) => sum + a.tasksCompleted, 0),
        pendingReports: 0,
        pendingApprovals: 0,
      }
    : null;

  const categories = ["all", "communication", "content", "analysis", "operations", "strategy", "workflow", "learning"];

  const filteredAgents = agents
    .filter(agent => selectedCategory === "all" || agent.category === selectedCategory)
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "performance") return b.performanceRating - a.performanceRating;
      if (sortBy === "tasks") return b.tasksCompleted - a.tasksCompleted;
      return 0;
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":   return "bg-green-500";
      case "learning": return "bg-primary";
      case "idle":     return "bg-yellow-500";
      default:         return "bg-gray-500";
    }
  };

  const getPerformanceColor = (rating: number) => {
    if (rating >= 90) return "text-green-400";
    if (rating >= 75) return "text-blue-400";
    if (rating >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <PageShell
      icon={Bot}
      iconClass="bg-purple-500/15 text-purple-400"
      title="AI Agents Dashboard"
      subtitle={`${agents.length || 50} specialised agents · ${stats?.activeAgents ?? 0} active`}
      actions={
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </Button>
      }
    >
      {/* Loading skeleton */}
      {agentsLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-4 space-y-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="space-y-1 flex-1">
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                </div>
              </div>
              <div className="h-2 w-full bg-muted rounded-full" />
              <div className="h-3 w-2/3 bg-muted rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {agentsError && !agentsLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <div className="p-3 rounded-full bg-destructive/10">
            <Bot className="w-8 h-8 text-destructive" />
          </div>
          <p className="text-base font-medium text-foreground">Failed to load AI Agents</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            The AI Agents monitoring system is currently unavailable. This is usually resolved by refreshing.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5 mt-2">
            <RefreshCw className="w-3.5 h-3.5" />
            Try Again
          </Button>
        </div>
      )}

      {/* Content */}
      {!agentsLoading && !agentsError && (
        <div className="space-y-5">
          {/* Video */}
          <AIAgentsVideo />

          {/* Stats row */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: "Total Agents",      value: stats.totalAgents,                   color: "text-foreground" },
                { label: "Active",            value: stats.activeAgents,                  color: "text-green-400" },
                { label: "Avg Performance",   value: `${Math.round(stats.avgPerformance)}/100`, color: "text-blue-400" },
                { label: "Tasks Completed",   value: stats.totalTasksCompleted,           color: "text-foreground" },
                { label: "Pending Reports",   value: stats.pendingReports,                color: "text-yellow-400" },
                { label: "Pending Approvals", value: stats.pendingApprovals,              color: "text-orange-400" },
              ].map(s => (
                <div key={s.label} className="bg-card rounded-xl p-3 border border-border">
                  <div className="text-xs text-muted-foreground mb-1">{s.label}</div>
                  <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center bg-card rounded-xl p-3 border border-border">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="text-sm px-2 py-1.5 border border-border rounded-lg bg-background text-foreground"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-muted-foreground">Sort by</label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="text-sm px-2 py-1.5 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="performance">Performance</option>
                <option value="tasks">Tasks Completed</option>
                <option value="name">Name</option>
              </select>
            </div>
            <span className="ml-auto text-xs text-muted-foreground">{filteredAgents.length} agents</span>
          </div>

          {/* Agents grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAgents.map(agent => (
              <Link key={agent.id} href={`/agents/${agent.id}`}>
                <div className="bg-card rounded-xl p-4 border border-border hover:border-primary/40 hover:shadow-md transition-all cursor-pointer card-interactive">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground truncate">{agent.name}</h3>
                      <p className="text-xs text-muted-foreground truncate">{agent.specialization}</p>
                    </div>
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ml-2 ${getStatusColor(agent.status)}`} />
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-muted-foreground">Performance</span>
                      <span className={`text-xs font-bold ${getPerformanceColor(agent.performanceRating)}`}>
                        {agent.performanceRating}/100
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all"
                        style={{ width: `${agent.performanceRating}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">Success Rate</div>
                      <div className="font-semibold text-foreground">{agent.successRate}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Tasks Done</div>
                      <div className="font-semibold text-foreground">{agent.tasksCompleted}</div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-border/50">
                    <div className="text-xs text-muted-foreground">
                      Last active: {new Date(agent.lastActive).toLocaleString()}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filteredAgents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No agents found in this category
            </div>
          )}
        </div>
      )}
    </PageShell>
  );
}
