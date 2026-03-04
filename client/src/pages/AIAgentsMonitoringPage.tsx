// @ts-nocheck
/**
 * AI Agents Monitoring Page - All 51 Specialized Agents
 * Monitor performance, ratings, and daily reports for all AI agents
 */
import React, { useState } from "react";
import { trpc } from "../lib/trpc";
import {
  Activity,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Users,
  Brain,
  RefreshCw,
  Zap,
  BarChart3,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/layout/PageShell";

const AGENT_CATEGORIES = [
  "All",
  "Communication & Correspondence",
  "Content Creation",
  "Analysis & Intelligence",
  "Daily Operations",
  "Strategy & Planning",
  "Workflow & Process",
  "Learning & Improvement",
];

export default function AIAgentsMonitoringPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const {
    data: agentsData,
    isLoading,
    error,
    refetch,
  } = trpc.aiAgentsMonitoring.getAllStatus.useQuery(undefined, { retry: 2 });

  const { data: reportsData } =
    trpc.aiAgentsMonitoring.getDailyReports.useQuery({});
  const { data: victoriaLog } = trpc.victoria.getActionLog.useQuery({
    limit: 10,
  });
  const { data: activityFeedData, refetch: refetchFeed } =
    trpc.aiAgentsMonitoring.getLiveActivityFeed.useQuery(
      { limit: 20 },
      { refetchInterval: 30000 }
    );
  const { data: perfMetricsData } =
    trpc.aiAgentsMonitoring.getPerformanceMetrics.useQuery(
      { agentId: selectedAgent ?? undefined },
      { enabled: true }
    );
  const utils = trpc.useUtils();
  const reviewRequest = trpc.aiAgentsMonitoring.reviewRequest.useMutation({
    onSuccess: () => {
      utils.aiAgentsMonitoring.getDailyReports.invalidate();
    },
  });

  const agents = agentsData?.agents || [];
  const reports = reportsData?.reports || [];

  const filteredAgents = agents.filter(agent => {
    const categoryMatch =
      selectedCategory === "All" ||
      agent.specialization.includes(selectedCategory);
    const statusMatch = statusFilter === "all" || agent.status === statusFilter;
    return categoryMatch && statusMatch;
  });

  const selectedAgentData = agents.find(a => a.id === selectedAgent);
  const selectedAgentReport = reports.find(r => r.agentId === selectedAgent);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400";
      case "learning":
        return "bg-primary/20 text-primary";
      case "idle":
        return "bg-gray-500/20 text-muted-foreground";
      case "error":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-muted-foreground";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <PageShell
      icon={Activity}
      iconClass="bg-green-500/15 text-green-400"
      title="AI Agents Monitoring"
      subtitle="51 specialised agents — performance, ratings, daily reports"
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </Button>
      }
    >
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-4">
          {/* Stats skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 animate-pulse"
              >
                <div className="h-6 w-6 rounded bg-muted shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-6 w-12 bg-muted rounded" />
                  <div className="h-3 w-20 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
          {/* Agents grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl p-4 space-y-3 animate-pulse"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-3/4 bg-muted rounded" />
                    <div className="h-3 w-16 bg-muted rounded" />
                  </div>
                  <div className="h-5 w-10 bg-muted rounded ml-2" />
                </div>
                <div className="h-3 w-full bg-muted rounded" />
                <div className="h-3 w-4/5 bg-muted rounded" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-8 bg-muted rounded" />
                  <div className="h-8 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <div className="p-3 rounded-full bg-destructive/10">
            <XCircle className="w-8 h-8 text-destructive" />
          </div>
          <p className="text-base font-medium">Failed to load AI Agents</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            {error.message || "The monitoring system is currently unavailable."}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-1.5 mt-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try Again
          </Button>
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && (
        <div className="space-y-5">
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                icon: Users,
                color: "text-primary",
                label: "Total Agents",
                value: agentsData?.totalAgents || 0,
              },
              {
                icon: Activity,
                color: "text-green-400",
                label: "Active Now",
                value: agentsData?.activeAgents || 0,
              },
              {
                icon: Award,
                color: "text-yellow-400",
                label: "Avg Rating",
                value:
                  agents.length > 0
                    ? (
                        agents.reduce((s, a) => s + a.performanceRating, 0) /
                        agents.length
                      ).toFixed(1)
                    : "0",
              },
              {
                icon: TrendingUp,
                color: "text-purple-400",
                label: "Tasks Completed",
                value: agents.reduce((s, a) => s + a.tasksCompleted, 0),
              },
            ].map(s => (
              <div
                key={s.label}
                className="bg-card rounded-xl p-4 border border-border flex items-center gap-3"
              >
                <s.icon className={`w-6 h-6 shrink-0 ${s.color}`} />
                <div>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-card rounded-xl p-4 border border-border flex flex-wrap gap-4 items-end">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                Filters
              </span>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="bg-muted rounded-lg px-3 py-1.5 text-sm border border-border"
              >
                {AGENT_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-muted rounded-lg px-3 py-1.5 text-sm border border-border"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="learning">Learning</option>
                <option value="idle">Idle</option>
                <option value="error">Error</option>
              </select>
            </div>
            <span className="ml-auto text-xs text-muted-foreground">
              {filteredAgents.length} agents
            </span>
          </div>

          {/* Agents grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredAgents.map(agent => (
              <div
                key={agent.id}
                onClick={() =>
                  setSelectedAgent(agent.id === selectedAgent ? null : agent.id)
                }
                className={`bg-card rounded-xl p-4 cursor-pointer transition-all border card-interactive ${
                  selectedAgent === agent.id
                    ? "border-primary ring-1 ring-primary/40"
                    : "border-border"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">
                      {agent.name}
                    </h3>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full ${getStatusColor(agent.status)}`}
                    >
                      {agent.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400 shrink-0 ml-2">
                    <Award className="w-3 h-3" />
                    <span className="text-sm font-semibold">
                      {agent.performanceRating}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  {agent.specialization}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                  <div>
                    <p className="text-muted-foreground">Tasks</p>
                    <p className="font-semibold">{agent.tasksCompleted}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Success</p>
                    <p className="font-semibold text-green-400">
                      {agent.successRate}%
                    </p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTimestamp(agent.lastActive)}
                </p>
              </div>
            ))}
          </div>

          {/* Selected Agent Detail Panel */}
          {selectedAgentData && (
            <div className="bg-card rounded-xl border border-primary/30 p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-base font-bold">
                    {selectedAgentData.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedAgentData.specialization}
                  </p>
                  {selectedAgentReport && (
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Daily Report — {selectedAgentReport.date}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
                >
                  ✕
                </button>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  {
                    label: "Rating",
                    value: `${selectedAgentData.performanceRating}/100`,
                    color: "text-yellow-400",
                  },
                  {
                    label: "Tasks Done",
                    value: selectedAgentData.tasksCompleted,
                    color: "text-foreground",
                  },
                  {
                    label: "Success Rate",
                    value: `${selectedAgentData.successRate}%`,
                    color: "text-green-400",
                  },
                  {
                    label: "Response",
                    value: `${selectedAgentData.avgResponseTime.toFixed(2)}s`,
                    color: "text-blue-400",
                  },
                ].map(m => (
                  <div key={m.label} className="bg-muted/40 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">
                      {m.label}
                    </p>
                    <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
                  </div>
                ))}
              </div>

              {/* Report details */}
              {selectedAgentReport && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      title: "Improvements",
                      items: selectedAgentReport.improvements,
                      color: "text-green-400",
                      icon: TrendingUp,
                    },
                    {
                      title: "New Learnings",
                      items: selectedAgentReport.newLearnings,
                      color: "text-primary",
                      icon: Brain,
                    },
                    {
                      title: "Suggestions",
                      items: selectedAgentReport.suggestions,
                      color: "text-yellow-400",
                      icon: Award,
                    },
                    {
                      title: "Research Topics",
                      items: selectedAgentReport.researchTopics,
                      color: "text-purple-400",
                      icon: Activity,
                    },
                  ].map(section => (
                    <div key={section.title}>
                      <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                        <section.icon className={`w-4 h-4 ${section.color}`} />
                        {section.title}
                      </h3>
                      <ul className="space-y-1.5">
                        {section.items.map((item, i) => (
                          <li
                            key={i}
                            className="text-xs text-foreground/80 flex items-start gap-1.5"
                          >
                            <span className={`${section.color} mt-0.5`}>•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Approval requests */}
              {selectedAgentReport?.requestsForApproval?.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold mb-3">
                    Requests for Approval
                  </h3>
                  <div className="space-y-3">
                    {selectedAgentReport.requestsForApproval.map(request => (
                      <div
                        key={request.id}
                        className="bg-muted/40 rounded-lg p-3"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">
                              {request.type}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {request.description}
                            </p>
                            <p className="text-xs text-muted-foreground/70 mt-1">
                              {request.reasoning}
                            </p>
                            <p className="text-xs text-primary mt-1">
                              Impact: {request.estimatedImpact}
                            </p>
                          </div>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                              request.status === "pending"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : request.status === "approved"
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {request.status}
                          </span>
                        </div>
                        {request.status === "pending" && (
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-1.5"
                              disabled={reviewRequest.isPending}
                              onClick={() =>
                                reviewRequest.mutate({
                                  requestId: request.id,
                                  agentId: selectedAgent!,
                                  decision: "approved",
                                })
                              }
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="flex-1 gap-1.5"
                              disabled={reviewRequest.isPending}
                              onClick={() =>
                                reviewRequest.mutate({
                                  requestId: request.id,
                                  agentId: selectedAgent!,
                                  decision: "denied",
                                })
                              }
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Deny
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Performance Metrics Panel */}
          {perfMetricsData && (
            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold">
                  {selectedAgent
                    ? `${selectedAgent} — Performance Metrics`
                    : "Overall Agent Performance Metrics"}
                </h3>
                <span className="text-xs text-muted-foreground ml-auto">
                  {perfMetricsData.metrics?.length ?? 0} agents tracked
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(perfMetricsData.metrics ?? []).slice(0, 8).map((m, i) => (
                  <div key={i} className="bg-muted/40 rounded-lg p-3 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3 h-3 text-yellow-400" />
                      <span className="text-xs font-medium truncate">
                        {m.agentName}
                      </span>
                    </div>
                    <div className="text-lg font-bold text-foreground">
                      {Number(m.avgRating ?? 0).toFixed(1)}
                      <span className="text-xs text-muted-foreground font-normal">
                        /5
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {m.totalRatings} ratings &middot; {m.totalReports} reports
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live Activity Feed */}
          {activityFeedData && activityFeedData.activities.length > 0 && (
            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold">Live Activity Feed</h3>
                <span className="text-xs text-muted-foreground ml-auto">
                  Auto-refreshes every 30s
                </span>
                <button
                  onClick={() => refetchFeed()}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-1"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {activityFeedData.activities.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <span className="text-xs text-muted-foreground mt-0.5 shrink-0 w-16">
                      {formatTimestamp(item.createdAt)}
                    </span>
                    <span className="shrink-0 text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      {item.targetType}
                    </span>
                    <span className="text-foreground/80 flex-1">
                      {item.description ?? item.action}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Victoria Action Log */}
          {victoriaLog &&
            victoriaLog.actions &&
            victoriaLog.actions.length > 0 && (
              <div className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-semibold">
                    Victoria — Recent Actions
                  </h3>
                  <span className="text-xs text-muted-foreground ml-auto">
                    Autonomous Chief of Staff
                  </span>
                </div>
                <div className="space-y-2">
                  {victoriaLog.actions.slice(0, 5).map((action, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <span className="text-xs text-muted-foreground mt-0.5 shrink-0 w-16">
                        {formatTimestamp(action.createdAt)}
                      </span>
                      <span className="text-foreground/80">
                        {action.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      )}
    </PageShell>
  );
}
