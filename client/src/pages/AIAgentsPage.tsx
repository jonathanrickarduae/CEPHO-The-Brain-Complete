// @ts-nocheck
import { useState } from "react";
import { Link } from "wouter";
import {
  Bot,
  RefreshCw,
  Brain,
  CheckCircle2,
  Clock,
  Cpu,
  FileText,
  Lightbulb,
  Play,
  Search,
  Shield,
  Star,
  TrendingUp,
  Users,
  Zap,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Activity,
  Award,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AIAgentsVideo from "@/components/ai-agents/AIAgentsVideo";
import { trpc } from "@/lib/trpc";
import { PageShell } from "@/components/layout/PageShell";

const CATEGORY_COLORS: Record<string, string> = {
  communication: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  content: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  analysis: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  operations: "bg-green-500/10 text-green-400 border-green-500/20",
  strategy: "bg-red-500/10 text-red-400 border-red-500/20",
  workflow: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  learning: "bg-pink-500/10 text-pink-400 border-pink-500/20",
};

export default function AIAgentsPage() {
  const [activeTab, setActiveTab] = useState("monitoring");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "performance" | "tasks">(
    "performance"
  );
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [taskInput, setTaskInput] = useState("");
  const [taskContext, setTaskContext] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [taskResult, setTaskResult] = useState<string | null>(null);
  const [reportResult, setReportResult] = useState<Record<
    string,
    unknown
  > | null>(null);

  // ── Monitoring query (existing) ───────────────────────────────────────────
  const {
    data: agentsData,
    isLoading: agentsLoading,
    error: agentsError,
    refetch,
  } = trpc.aiAgentsMonitoring.getAllStatus.useQuery(undefined, {
    retry: false,
  });

  const agents = agentsData?.agents ?? [];
  const stats = agentsData
    ? {
        totalAgents: agentsData.totalAgents,
        activeAgents: agentsData.activeAgents,
        avgPerformance:
          agents.length > 0
            ? agents.reduce((s, a) => s + a.performanceRating, 0) /
              agents.length
            : 0,
        totalTasksCompleted: agents.reduce((s, a) => s + a.tasksCompleted, 0),
      }
    : null;

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
    .filter(a => selectedCategory === "all" || a.category === selectedCategory)
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "performance")
        return b.performanceRating - a.performanceRating;
      if (sortBy === "tasks") return b.tasksCompleted - a.tasksCompleted;
      return 0;
    });

  // ── Agent Engine queries (new) ────────────────────────────────────────────
  const { data: knowledgeMap, isLoading: loadingMap } =
    trpc.agentEngine.getKnowledgeMap.useQuery();
  const {
    data: approvalQueue,
    isLoading: loadingApprovals,
    refetch: refetchApprovals,
  } = trpc.agentEngine.getApprovalQueue.useQuery();
  const { data: leaderboard, isLoading: loadingLeaderboard } =
    trpc.agentEngine.getLeaderboard.useQuery();
  const { data: learningFeed } = trpc.agentEngine.getLearningFeed.useQuery();

  // ── Mutations ─────────────────────────────────────────────────────────────
  const executeTask = trpc.agentEngine.executeTask.useMutation({
    onSuccess: d => setTaskResult(d.result),
  });
  const generateReport = trpc.agentEngine.generateDailyReport.useMutation({
    onSuccess: d => setReportResult(d),
  });
  const processApproval = trpc.agentEngine.processApproval.useMutation({
    onSuccess: () => refetchApprovals(),
  });

  // ── Helpers ───────────────────────────────────────────────────────────────
  const engineAgents =
    knowledgeMap?.agents.filter(agent => {
      const matchSearch =
        !searchQuery ||
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.specialization
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        agent.capabilities.some(c =>
          c.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchCat =
        filterCategory === "all" || agent.category === filterCategory;
      return matchSearch && matchCat;
    }) ?? [];

  const selectedAgentData = selectedAgent
    ? knowledgeMap?.agents.find(a => a.id === selectedAgent)
    : null;

  const getStatusColor = (s: string) =>
    s === "active"
      ? "bg-green-500"
      : s === "learning"
        ? "bg-primary"
        : s === "idle"
          ? "bg-yellow-500"
          : "bg-gray-500";
  const getPerfColor = (r: number) =>
    r >= 90
      ? "text-green-400"
      : r >= 75
        ? "text-blue-400"
        : r >= 60
          ? "text-yellow-400"
          : "text-red-400";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <PageShell
      icon={Bot}
      iconClass="bg-purple-500/15 text-purple-400"
      title="AI Agents"
      subtitle={`${agentsData?.totalAgents ?? knowledgeMap?.totalAgents ?? 51} agents · ${agentsData?.activeAgents ?? 0} active`}
      actions={
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="text-green-400 border-green-500/30 bg-green-500/10"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5 animate-pulse inline-block" />
            All Systems Active
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
          {(approvalQueue?.pendingCount ?? 0) > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActiveTab("approvals")}
              className="gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" />
              Approvals
              <Badge className="bg-amber-500 text-white text-xs px-1.5 py-0 ml-1">
                {approvalQueue?.pendingCount}
              </Badge>
            </Button>
          )}
        </div>
      }
    >
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50 border border-border/50 flex-wrap h-auto gap-1">
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Map</TabsTrigger>
          <TabsTrigger value="execute">Execute Task</TabsTrigger>
          <TabsTrigger value="reports">Daily Reports</TabsTrigger>
          <TabsTrigger value="approvals">
            Approvals
            {(approvalQueue?.pendingCount ?? 0) > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {approvalQueue?.pendingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        {/* ── MONITORING (existing) ─────────────────────────────────────── */}
        <TabsContent value="monitoring" className="space-y-5">
          {agentsLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border bg-card p-4 space-y-3 animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted" />
                    <div className="space-y-1 flex-1">
                      <div className="h-4 w-3/4 bg-muted rounded" />
                      <div className="h-3 w-1/2 bg-muted rounded" />
                    </div>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full" />
                </div>
              ))}
            </div>
          )}
          {agentsError && !agentsLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <div className="p-3 rounded-full bg-destructive/10">
                <Bot className="w-8 h-8 text-destructive" />
              </div>
              <p className="text-base font-medium text-foreground">
                Failed to load AI Agents
              </p>
              <p className="text-sm text-muted-foreground max-w-sm">
                The AI Agents monitoring system is currently unavailable.
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
          {!agentsLoading && !agentsError && (
            <div className="space-y-5">
              <AIAgentsVideo />
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    {
                      label: "Total Agents",
                      value: stats.totalAgents,
                      color: "text-foreground",
                    },
                    {
                      label: "Active",
                      value: stats.activeAgents,
                      color: "text-green-400",
                    },
                    {
                      label: "Avg Performance",
                      value: `${Math.round(stats.avgPerformance)}/100`,
                      color: "text-blue-400",
                    },
                    {
                      label: "Tasks Done",
                      value: stats.totalTasksCompleted,
                      color: "text-foreground",
                    },
                  ].map(s => (
                    <div
                      key={s.label}
                      className="bg-card rounded-xl p-3 border border-border"
                    >
                      <div className="text-xs text-muted-foreground mb-1">
                        {s.label}
                      </div>
                      <div className={`text-xl font-bold ${s.color}`}>
                        {s.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-3 items-center bg-card rounded-xl p-3 border border-border">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="text-sm px-2 py-1.5 border border-border rounded-lg bg-background text-foreground"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Sort by
                  </label>
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
                <span className="ml-auto text-xs text-muted-foreground">
                  {filteredAgents.length} agents
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAgents.map(agent => (
                  <Link key={agent.id} href={`/agents/${agent.id}`}>
                    <div className="bg-card rounded-xl p-4 border border-border hover:border-primary/40 hover:shadow-md transition-all cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-foreground truncate">
                            {agent.name}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">
                            {agent.specialization}
                          </p>
                        </div>
                        <div
                          className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ml-2 ${getStatusColor(agent.status)}`}
                        />
                      </div>
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-muted-foreground">
                            Performance
                          </span>
                          <span
                            className={`text-xs font-bold ${getPerfColor(agent.performanceRating)}`}
                          >
                            {agent.performanceRating}/100
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5">
                          <div
                            className="bg-primary h-1.5 rounded-full"
                            style={{ width: `${agent.performanceRating}%` }}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="text-muted-foreground">
                            Success Rate
                          </div>
                          <div className="font-semibold text-foreground">
                            {agent.successRate}%
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">
                            Tasks Done
                          </div>
                          <div className="font-semibold text-foreground">
                            {agent.tasksCompleted}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                        Last active:{" "}
                        {new Date(agent.lastActive).toLocaleString()}
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
        </TabsContent>

        {/* ── KNOWLEDGE MAP ─────────────────────────────────────────────── */}
        <TabsContent value="knowledge" className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search agents or capabilities..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted/30 border-border/50"
              />
            </div>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="px-3 py-2 rounded-md bg-muted/30 border border-border/50 text-sm text-foreground"
            >
              <option value="all">All Categories</option>
              {knowledgeMap?.categories.map(cat => (
                <option key={cat.name} value={cat.name}>
                  {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)} (
                  {cat.count})
                </option>
              ))}
            </select>
          </div>

          {/* Category overview cards */}
          {!loadingMap && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {knowledgeMap?.categories.map(cat => (
                <Card
                  key={cat.name}
                  className="bg-card border-border/50 cursor-pointer hover:border-primary/40 transition-colors"
                  onClick={() => setFilterCategory(cat.name)}
                >
                  <CardContent className="p-4">
                    <div
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border mb-2 ${CATEGORY_COLORS[cat.name] ?? "bg-muted text-muted-foreground"}`}
                    >
                      {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {cat.count}
                    </div>
                    <div className="text-xs text-muted-foreground">agents</div>
                    <div className="mt-2 text-xs text-muted-foreground line-clamp-2">
                      {cat.agents.slice(0, 2).join(", ")}
                      {cat.agents.length > 2
                        ? ` +${cat.agents.length - 2}`
                        : ""}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Agent grid */}
          {loadingMap ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="h-40 rounded-lg bg-muted/30 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {engineAgents.map(agent => (
                <Card
                  key={agent.id}
                  className={`bg-card border-border/50 cursor-pointer transition-all hover:border-primary/40 ${selectedAgent === agent.id ? "border-primary ring-1 ring-primary/30" : ""}`}
                  onClick={() =>
                    setSelectedAgent(
                      agent.id === selectedAgent ? null : agent.id
                    )
                  }
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-medium text-foreground text-sm">
                          {agent.name}
                        </div>
                        <div
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs mt-1 border ${CATEGORY_COLORS[agent.category] ?? "bg-muted"}`}
                        >
                          {agent.category}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedAgent(agent.id);
                          setActiveTab("execute");
                        }}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Run
                      </Button>
                    </div>
                    <div className="space-y-1">
                      {agent.capabilities.slice(0, 3).map(cap => (
                        <div
                          key={cap}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground"
                        >
                          <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0" />
                          {cap}
                        </div>
                      ))}
                      {agent.capabilities.length > 3 && (
                        <div className="text-xs text-muted-foreground ml-4">
                          +{agent.capabilities.length - 3} more
                        </div>
                      )}
                    </div>
                    {selectedAgent === agent.id && (
                      <div className="mt-3 pt-3 border-t border-border/30">
                        <div className="text-xs font-medium text-foreground mb-1.5">
                          Daily Tasks:
                        </div>
                        {agent.dailyTasks.map(task => (
                          <div
                            key={task}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1"
                          >
                            <Clock className="w-3 h-3 text-primary flex-shrink-0" />
                            {task}
                          </div>
                        ))}
                        <Button
                          size="sm"
                          className="w-full mt-2 h-7 text-xs"
                          onClick={e => {
                            e.stopPropagation();
                            generateReport.mutate({ agentId: agent.id });
                            setActiveTab("reports");
                          }}
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          Generate Daily Report
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {engineAgents.length === 0 && !loadingMap && (
            <div className="text-center py-12 text-muted-foreground">
              <Bot className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No agents match your search.</p>
            </div>
          )}

          {/* Learning Feed */}
          {learningFeed && (
            <Card className="bg-card border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Live Learning Feed
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {learningFeed.learningItems.map(item => (
                  <div
                    key={item.agentId}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full animate-pulse ${item.status === "researching" ? "bg-blue-400" : "bg-green-400"}`}
                      />
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {item.agentName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.researchTopic}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── EXECUTE TASK ──────────────────────────────────────────────── */}
        <TabsContent value="execute" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Play className="w-4 h-4 text-primary" />
                  Execute Agent Task
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">
                    Select Agent
                  </label>
                  <select
                    value={selectedAgent ?? ""}
                    onChange={e => setSelectedAgent(e.target.value || null)}
                    className="w-full px-3 py-2 rounded-md bg-muted/30 border border-border/50 text-sm text-foreground"
                  >
                    <option value="">Choose an agent...</option>
                    {knowledgeMap?.categories.map(cat => (
                      <optgroup
                        key={cat.name}
                        label={
                          cat.name.charAt(0).toUpperCase() + cat.name.slice(1)
                        }
                      >
                        {cat.agents.map(agentName => {
                          const a = knowledgeMap.agents.find(
                            x => x.name === agentName
                          );
                          return a ? (
                            <option key={a.id} value={a.id}>
                              {a.name}
                            </option>
                          ) : null;
                        })}
                      </optgroup>
                    ))}
                  </select>
                </div>
                {selectedAgentData && (
                  <div
                    className={`p-2 rounded-lg text-xs border ${CATEGORY_COLORS[selectedAgentData.category] ?? "bg-muted"}`}
                  >
                    <div className="font-medium mb-1">
                      {selectedAgentData.name}
                    </div>
                    <div className="opacity-80">
                      Capabilities:{" "}
                      {selectedAgentData.capabilities.slice(0, 3).join(", ")}
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">
                    Task Description *
                  </label>
                  <Textarea
                    placeholder="Describe what you want this agent to do..."
                    value={taskInput}
                    onChange={e => setTaskInput(e.target.value)}
                    className="bg-muted/30 border-border/50 min-h-[100px] text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">
                    Context (optional)
                  </label>
                  <Textarea
                    placeholder="Provide any relevant context..."
                    value={taskContext}
                    onChange={e => setTaskContext(e.target.value)}
                    className="bg-muted/30 border-border/50 min-h-[60px] text-sm"
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    if (selectedAgent && taskInput.trim()) {
                      executeTask.mutate({
                        agentId: selectedAgent,
                        taskDescription: taskInput,
                        context: taskContext || undefined,
                      });
                    }
                  }}
                  disabled={
                    !selectedAgent || !taskInput.trim() || executeTask.isPending
                  }
                >
                  {executeTask.isPending ? (
                    <>
                      <Cpu className="w-4 h-4 mr-2 animate-spin" />
                      Agent Working...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Execute Task
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Agent Output
                </CardTitle>
              </CardHeader>
              <CardContent>
                {executeTask.isPending ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Cpu className="w-8 h-8 animate-spin mb-3 text-primary" />
                    <p className="text-sm">Agent is processing your task...</p>
                  </div>
                ) : taskResult ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        <span className="text-xs font-medium text-green-400">
                          Task Completed
                        </span>
                      </div>
                      <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {taskResult}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setTaskResult(null);
                        setTaskInput("");
                        setTaskContext("");
                      }}
                    >
                      Clear & Run Another Task
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Bot className="w-8 h-8 mb-3 opacity-30" />
                    <p className="text-sm">
                      Select an agent and describe a task to get started.
                    </p>
                  </div>
                )}
                {executeTask.isError && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400 mt-3">
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    {executeTask.error?.message ?? "Task execution failed"}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── DAILY REPORTS ─────────────────────────────────────────────── */}
        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Generate Daily Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">
                    Select Agent
                  </label>
                  <select
                    value={selectedAgent ?? ""}
                    onChange={e => setSelectedAgent(e.target.value || null)}
                    className="w-full px-3 py-2 rounded-md bg-muted/30 border border-border/50 text-sm text-foreground"
                  >
                    <option value="">Choose an agent...</option>
                    {knowledgeMap?.agents.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.category})
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  className="w-full"
                  onClick={() =>
                    selectedAgent &&
                    generateReport.mutate({ agentId: selectedAgent })
                  }
                  disabled={!selectedAgent || generateReport.isPending}
                >
                  {generateReport.isPending ? (
                    <>
                      <Cpu className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Today's Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  Report Output
                </CardTitle>
              </CardHeader>
              <CardContent>
                {generateReport.isPending ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Cpu className="w-8 h-8 animate-spin mb-3 text-primary" />
                    <p className="text-sm">Generating AI report...</p>
                  </div>
                ) : reportResult ? (
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">
                        {reportResult.agentName as string}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {reportResult.date as string}
                      </Badge>
                    </div>
                    {Array.isArray(reportResult.tasksCompleted) && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">
                          Tasks Completed
                        </div>
                        {(reportResult.tasksCompleted as string[]).map(
                          (t, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-1.5 text-xs text-foreground mb-1"
                            >
                              <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0" />
                              {t}
                            </div>
                          )
                        )}
                      </div>
                    )}
                    {reportResult.achievements && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">
                          Achievements
                        </div>
                        <p className="text-xs text-foreground">
                          {reportResult.achievements as string}
                        </p>
                      </div>
                    )}
                    {Array.isArray(reportResult.suggestions) && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">
                          Suggestions
                        </div>
                        {(reportResult.suggestions as string[]).map((s, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-1.5 text-xs text-foreground mb-1"
                          >
                            <Lightbulb className="w-3 h-3 text-amber-400 flex-shrink-0" />
                            {s}
                          </div>
                        ))}
                      </div>
                    )}
                    {(reportResult.capabilityRequest as any)?.title && (
                      <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <div className="text-xs font-medium text-amber-400 mb-1">
                          Capability Request (Pending CoS Approval)
                        </div>
                        <div className="text-xs text-foreground">
                          {(reportResult.capabilityRequest as any).title}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <FileText className="w-8 h-8 mb-3 opacity-30" />
                    <p className="text-sm">
                      Select an agent to generate their daily report.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── APPROVALS ─────────────────────────────────────────────────── */}
        <TabsContent value="approvals" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                label: "Pending",
                value: approvalQueue?.pendingCount ?? 0,
                icon: <Shield className="w-4 h-4" />,
                color: "text-amber-400",
              },
              {
                label: "Approved Today",
                value: approvalQueue?.approvedToday ?? 0,
                icon: <ThumbsUp className="w-4 h-4" />,
                color: "text-green-400",
              },
              {
                label: "Recent Decisions",
                value: approvalQueue?.recentHistory?.length ?? 0,
                icon: <Activity className="w-4 h-4" />,
                color: "text-blue-400",
              },
            ].map(s => (
              <Card key={s.label} className="bg-card border-border/50">
                <CardContent className="p-4">
                  <div className={`${s.color} mb-1`}>{s.icon}</div>
                  <div className="text-2xl font-bold text-foreground">
                    {s.value}
                  </div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {loadingApprovals ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded-lg bg-muted/30 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {approvalQueue?.pendingRequests.map(req => (
                <Card key={req.id} className="bg-card border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-foreground text-sm">
                            {req.agentName}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${CATEGORY_COLORS[req.category] ?? ""}`}
                          >
                            {req.category}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-xs ${req.priority === "high" ? "text-red-400 border-red-500/30" : req.priority === "medium" ? "text-amber-400 border-amber-500/30" : "text-muted-foreground"}`}
                          >
                            {req.priority}
                          </Badge>
                        </div>
                        <div className="text-sm font-medium text-foreground mb-1">
                          {req.title}
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          {req.description}
                        </div>
                        <div className="text-xs text-green-400">
                          <TrendingUp className="w-3 h-3 inline mr-1" />
                          {req.estimatedImpact}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white h-8 px-3"
                          onClick={() =>
                            processApproval.mutate({
                              requestId: req.id,
                              agentId: req.agentId,
                              decision: "approved",
                            })
                          }
                          disabled={processApproval.isPending}
                        >
                          <ThumbsUp className="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10 h-8 px-3"
                          onClick={() =>
                            processApproval.mutate({
                              requestId: req.id,
                              agentId: req.agentId,
                              decision: "denied",
                            })
                          }
                          disabled={processApproval.isPending}
                        >
                          <ThumbsDown className="w-3 h-3 mr-1" />
                          Deny
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(approvalQueue?.pendingRequests.length ?? 0) === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-green-400 opacity-50" />
                  <p>All caught up! No pending approvals.</p>
                </div>
              )}
              {(approvalQueue?.recentHistory.length ?? 0) > 0 && (
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2 mt-4">
                    Recent Decisions
                  </div>
                  {approvalQueue?.recentHistory.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30 mb-2"
                    >
                      <div className="text-sm text-foreground">{h.notes}</div>
                      <Badge
                        variant="outline"
                        className={`text-xs ${h.decision === "approved" ? "text-green-400 border-green-500/30" : "text-red-400 border-red-500/30"}`}
                      >
                        {h.decision}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* ── LEADERBOARD ───────────────────────────────────────────────── */}
        <TabsContent value="leaderboard" className="space-y-4">
          {loadingLeaderboard ? (
            <div className="space-y-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 rounded-lg bg-muted/30 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <>
              {leaderboard?.topPerformer && (
                <Card className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-amber-500/30">
                  <CardContent className="p-4 flex items-center gap-4">
                    <Award className="w-8 h-8 text-amber-400 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-amber-400 font-medium mb-0.5">
                        Top Performer
                      </div>
                      <div className="font-semibold text-foreground">
                        {leaderboard.topPerformer.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {leaderboard.topPerformer.specialization}
                      </div>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="text-2xl font-bold text-amber-400">
                        {leaderboard.topPerformer.rating.toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        rating
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              <div className="space-y-2">
                {leaderboard?.leaderboard.map((agent, index) => (
                  <div
                    key={agent.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/30"
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${index === 0 ? "bg-amber-500 text-white" : index === 1 ? "bg-slate-400 text-white" : index === 2 ? "bg-amber-700 text-white" : "bg-muted text-muted-foreground"}`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground truncate">
                          {agent.name}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-xs flex-shrink-0 ${CATEGORY_COLORS[agent.category] ?? ""}`}
                        >
                          {agent.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <Progress
                          value={agent.successRate}
                          className="h-1 flex-1 max-w-[120px]"
                        />
                        <span className="text-xs text-muted-foreground">
                          {agent.successRate}% success
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-bold text-foreground">
                        {agent.rating.toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {agent.tasksCompleted} tasks
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
