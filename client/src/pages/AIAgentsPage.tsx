// @ts-nocheck
import { useState } from "react";
import { Link } from "wouter";
import {
  Bot,
} from "lucide-react";
import AIAgentsVideo from "@/components/ai-agents/AIAgentsVideo";
import { trpc } from "@/lib/trpc";


export default function AIAgentsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "performance" | "tasks">(
    "performance"
  );

  // Use tRPC to fetch agents and stats with error handling
  const {
    data: agentsData,
    isLoading: agentsLoading,
    error: agentsError,
  } = trpc.aiAgentsMonitoring.getAllStatus.useQuery(undefined, {
    retry: false,
  });

  const agents = agentsData?.agents || [];
  const stats = agentsData
    ? {
        totalAgents: agentsData.totalAgents,
        activeAgents: agentsData.activeAgents,
        avgPerformance:
          agents.length > 0
            ? agents.reduce((sum, a) => sum + a.performanceRating, 0) /
              agents.length
            : 0,
        totalTasksCompleted: agents.reduce(
          (sum, a) => sum + a.tasksCompleted,
          0
        ),
        pendingReports: 0,
        pendingApprovals: 0,
      }
    : null;
  const loading = agentsLoading;
  const hasError = agentsError;

  const categories = [
    "all",
    "communication",
    "content",
    "analysis",
    "operations",
    "strategy",
    "workflow",
    "learning",
  ];

  const filteredAgents = agents
    .filter(
      agent => selectedCategory === "all" || agent.category === selectedCategory
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "performance")
        return b.performanceRating - a.performanceRating;
      if (sortBy === "tasks") return b.tasksCompleted - a.tasksCompleted;
      return 0;
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "learning":
        return "bg-primary";
      case "idle":
        return "bg-yellow-500";
      case "offline":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPerformanceColor = (rating: number) => {
    if (rating >= 90) return "text-green-400";
    if (rating >= 75) return "text-blue-400";
    if (rating >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-9 w-32 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-4 space-y-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="space-y-1 flex-1">
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                </div>
              </div>
              <div className="h-3 w-full bg-muted rounded" />
              <div className="h-3 w-2/3 bg-muted rounded" />
              <div className="flex gap-2 pt-1">
                <div className="h-6 w-16 bg-muted rounded-full" />
                <div className="h-6 w-20 bg-muted rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-xl text-destructive mb-4">
            Failed to load AI Agents
          </div>
          <p className="text-muted-foreground">
            The AI Agents monitoring system is currently unavailable.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Please try again later or contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border px-4 sm:px-6 py-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
          <Bot className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" />
          AI Agents Dashboard
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Monitor and manage your 50 specialized AI agents
        </p>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Educational Video Section */}
        <AIAgentsVideo />

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-card rounded-lg p-4 border border-border">
              <div className="text-sm text-muted-foreground">Total Agents</div>
              <div className="text-2xl font-bold text-foreground">{stats.totalAgents}</div>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border">
              <div className="text-sm text-muted-foreground">Active</div>
              <div className="text-2xl font-bold text-green-400">{stats.activeAgents}</div>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border">
              <div className="text-sm text-muted-foreground">Avg Performance</div>
              <div className="text-2xl font-bold text-blue-400">
                {Math.round(stats.avgPerformance)}/100
              </div>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border">
              <div className="text-sm text-muted-foreground">Tasks Completed</div>
              <div className="text-2xl font-bold text-foreground">{stats.totalTasksCompleted}</div>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border">
              <div className="text-sm text-muted-foreground">Pending Reports</div>
              <div className="text-2xl font-bold text-yellow-400">{stats.pendingReports}</div>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border">
              <div className="text-sm text-muted-foreground">Pending Approvals</div>
              <div className="text-2xl font-bold text-orange-400">{stats.pendingApprovals}</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="text-sm font-medium text-foreground mr-2">Category:</label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mr-2">Sort by:</label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as "name" | "performance" | "tasks")}
                className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="performance">Performance</option>
                <option value="tasks">Tasks Completed</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredAgents.map(agent => (
            <Link key={agent.id} href={`/agents/${agent.id}`}>
              <div className="bg-card rounded-lg p-6 border border-border hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer">
                {/* Agent Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground mb-1">{agent.name}</h3>
                    <p className="text-sm text-muted-foreground">{agent.specialization}</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`} />
                </div>

                {/* Performance Rating */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-foreground">Performance</span>
                    <span className={`text-sm font-bold ${getPerformanceColor(agent.performanceRating)}`}>
                      {agent.performanceRating}/100
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${agent.performanceRating}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Success Rate</div>
                    <div className="font-bold text-foreground">{agent.successRate}%</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Tasks Done</div>
                    <div className="font-bold text-foreground">{agent.tasksCompleted}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Avg Response</div>
                    <div className="font-bold text-foreground">{agent.avgResponseTime}ms</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Category</div>
                    <div className="font-bold text-foreground capitalize">{agent.category}</div>
                  </div>
                </div>

                {/* Last Active */}
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="text-xs text-muted-foreground">
                    Last active: {new Date(agent.lastActive).toLocaleString()}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredAgents.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            No agents found in this category
          </div>
        )}
      </div>
    </div>
  );
}
