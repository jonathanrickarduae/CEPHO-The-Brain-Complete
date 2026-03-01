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
} from "lucide-react";

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

  // Fetch all agents
  const {
    data: agentsData,
    isLoading,
    error,
    refetch,
  } = trpc.aiAgentsMonitoring.getAllStatus.useQuery(undefined, {
    retry: 2,
    onError: () => {
    },
  });

  // Fetch daily reports
  const { data: reportsData } =
    trpc.aiAgentsMonitoring.getDailyReports.useQuery({});

  const agents = agentsData?.agents || [];
  const reports = reportsData?.reports || [];

  // Filter agents by category and status
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
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-white flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-xl">Loading AI Agents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-white flex items-center justify-center">
        <div className="max-w-md bg-card/50 rounded-lg p-8 border border-red-500/50">
          <div className="flex items-center gap-3 mb-4">
            <XCircle className="w-8 h-8 text-red-400" />
            <h2 className="text-2xl font-bold text-red-400">
              Failed to load AI Agents
            </h2>
          </div>
          <p className="text-foreground/80 mb-4">
            The AI Agents monitoring system is currently unavailable.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Error: {error.message || "Unknown error"}
          </p>
          <button
            onClick={() => refetch()}
            className="w-full px-6 py-3 bg-blue-500 hover:bg-primary/90 rounded-lg font-semibold transition-colors"
          >
            Try Again
          </button>
          <p className="text-xs text-muted-foreground/70 mt-4 text-center">
            Please try again later or contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white">
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-4xl font-bold mb-2">AI Agents Monitoring</h1>
          <p className="text-muted-foreground">
            Monitor all 51 specialized AI agents - Performance, ratings, and
            daily reports
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card/50 rounded-lg p-6 border border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <p className="text-3xl font-bold">
                  {agentsData?.totalAgents || 0}
                </p>
                <p className="text-sm text-muted-foreground">Total Agents</p>
              </div>
            </div>
          </div>

          <div className="bg-card/50 rounded-lg p-6 border border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-3xl font-bold">
                  {agentsData?.activeAgents || 0}
                </p>
                <p className="text-sm text-muted-foreground">Active Now</p>
              </div>
            </div>
          </div>

          <div className="bg-card/50 rounded-lg p-6 border border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-3xl font-bold">
                  {agents.length > 0
                    ? (
                        agents.reduce(
                          (sum, a) => sum + a.performanceRating,
                          0
                        ) / agents.length
                      ).toFixed(1)
                    : "0"}
                </p>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
              </div>
            </div>
          </div>

          <div className="bg-card/50 rounded-lg p-6 border border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-3xl font-bold">
                  {agents.reduce(
                    (sum, a) => sum + a.tasksCompleted,
                    0
                  )}
                </p>
                <p className="text-sm text-muted-foreground">Tasks Completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card/50 rounded-lg p-6 mb-6 border border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Filters</h2>
          </div>

          <div className="flex flex-wrap gap-4">
            {/* Category Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm text-muted-foreground mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full bg-muted rounded px-4 py-2 text-sm"
              >
                {AGENT_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm text-muted-foreground mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full bg-muted rounded px-4 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="learning">Learning</option>
                <option value="idle">Idle</option>
                <option value="error">Error</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-end">
              <div className="bg-muted/50 rounded px-4 py-2">
                <p className="text-sm text-muted-foreground">Showing</p>
                <p className="text-xl font-bold">{filteredAgents.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {filteredAgents.map(agent => (
            <div
              key={agent.id}
              onClick={() => setSelectedAgent(agent.id)}
              className={`bg-card/50 rounded-lg p-4 cursor-pointer hover:bg-card/70 transition-all border ${
                selectedAgent === agent.id
                  ? "border-primary ring-2 ring-primary/50"
                  : "border-border/50"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1 text-sm">{agent.name}</h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${getStatusColor(agent.status)}`}
                  >
                    {agent.status}
                  </span>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Award className="w-3 h-3" />
                    <span className="text-sm font-semibold">
                      {agent.performanceRating}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                {agent.specialization}
              </p>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <p className="text-xs text-muted-foreground/70">Tasks</p>
                  <p className="text-sm font-semibold">
                    {agent.tasksCompleted}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground/70">Success</p>
                  <p className="text-sm font-semibold text-green-400">
                    {agent.successRate}%
                  </p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground/70 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTimestamp(agent.lastActive)}
              </p>
            </div>
          ))}
        </div>

        {/* Selected Agent Details */}
        {selectedAgentData && selectedAgentReport && (
          <div className="bg-card/50 rounded-lg p-6 border border-blue-500/50">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  {selectedAgentData.name}
                </h2>
                <p className="text-muted-foreground">
                  {selectedAgentData.specialization}
                </p>
                <p className="text-sm text-muted-foreground/70 mt-2">
                  Daily Report - {selectedAgentReport.date}
                </p>
              </div>
              <button
                onClick={() => setSelectedAgent(null)}
                className="text-muted-foreground hover:text-white transition-colors text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-muted/30 rounded p-3">
                <p className="text-xs text-muted-foreground mb-1">Rating</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {selectedAgentData.performanceRating}/100
                </p>
              </div>
              <div className="bg-muted/30 rounded p-3">
                <p className="text-xs text-muted-foreground mb-1">Tasks Completed</p>
                <p className="text-2xl font-bold">
                  {selectedAgentData.tasksCompleted}
                </p>
              </div>
              <div className="bg-muted/30 rounded p-3">
                <p className="text-xs text-muted-foreground mb-1">Success Rate</p>
                <p className="text-2xl font-bold text-green-400">
                  {selectedAgentData.successRate}%
                </p>
              </div>
              <div className="bg-muted/30 rounded p-3">
                <p className="text-xs text-muted-foreground mb-1">Response Time</p>
                <p className="text-2xl font-bold">
                  {selectedAgentData.avgResponseTime.toFixed(2)}
                  s
                </p>
              </div>
            </div>

            {/* Daily Report Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Improvements
                </h3>
                <ul className="space-y-2">
                  {selectedAgentReport.improvements.map((improvement, i) => (
                    <li
                      key={i}
                      className="text-sm text-foreground/80 flex items-start gap-2"
                    >
                      <span className="text-green-400 mt-1">•</span>
                      {improvement}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  New Learnings
                </h3>
                <ul className="space-y-2">
                  {selectedAgentReport.newLearnings.map((learning, i) => (
                    <li
                      key={i}
                      className="text-sm text-foreground/80 flex items-start gap-2"
                    >
                      <span className="text-primary mt-1">•</span>
                      {learning}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Suggestions</h3>
                <ul className="space-y-2">
                  {selectedAgentReport.suggestions.map((suggestion, i) => (
                    <li
                      key={i}
                      className="text-sm text-foreground/80 flex items-start gap-2"
                    >
                      <span className="text-yellow-400 mt-1">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Research Topics</h3>
                <ul className="space-y-2">
                  {selectedAgentReport.researchTopics.map((topic, i) => (
                    <li
                      key={i}
                      className="text-sm text-foreground/80 flex items-start gap-2"
                    >
                      <span className="text-purple-400 mt-1">•</span>
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Requests for Approval */}
            {selectedAgentReport.requestsForApproval.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">
                  Requests for Approval
                </h3>
                <div className="space-y-3">
                  {selectedAgentReport.requestsForApproval.map(request => (
                    <div
                      key={request.id}
                      className="bg-muted/50 rounded p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{request.type}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {request.description}
                          </p>
                          <p className="text-xs text-muted-foreground/70 mt-2">
                            {request.reasoning}
                          </p>
                          <p className="text-xs text-primary mt-1">
                            Impact: {request.estimatedImpact}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
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
                        <div className="flex gap-2 mt-3">
                          <button className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2 rounded transition-colors flex items-center justify-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                          <button className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm py-2 rounded transition-colors flex items-center justify-center gap-2">
                            <XCircle className="w-4 h-4" />
                            Deny
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
