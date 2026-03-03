import { useState } from "react";
import { useRoute, Link } from "wouter";
import { Bot, ArrowLeft, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AgentDetailPage() {
  const [, params] = useRoute("/agents/:id");
  const agentId = params?.id ?? "";
  const [activeTab, setActiveTab] = useState<
    "overview" | "reports" | "approvals"
  >("overview");

  // Fetch all agents from tRPC and find the one matching agentId
  const {
    data: agentsData,
    isLoading,
    refetch,
  } = trpc.aiAgentsMonitoring.getAllStatus.useQuery();
  const agent = agentsData?.agents?.find(a => a.id === agentId) ?? null;

  // Fetch daily reports for this agent
  const { data: reportsData, refetch: refetchReports } =
    trpc.aiAgentsMonitoring.getDailyReports.useQuery(
      { agentId },
      { enabled: !!agentId }
    );

  const reviewMutation = trpc.aiAgentsMonitoring.reviewRequest.useMutation({
    onSuccess: () => {
      toast.success("Decision recorded");
      refetch();
      refetchReports();
    },
    onError: () => toast.error("Failed to process decision"),
  });

  const handleReview = async (
    requestId: string,
    decision: "approved" | "denied"
  ) => {
    await reviewMutation.mutateAsync({ requestId, agentId, decision });
  };

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-6xl mb-4">🤖</div>
          <div className="text-xl text-foreground mb-2">Agent Not Found</div>
          <div className="text-muted-foreground mb-6">
            Agent &quot;{agentId}&quot; was not found in the system.
          </div>
          <Link
            href="/ai-agents"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Back to Agents
          </Link>
        </div>
      </div>
    );
  }

  const reports = reportsData?.reports ?? [];
  const pendingReports = reports.filter(r => r.requestsForApproval.length > 0);
  const allApprovals = reports.flatMap(r => r.requestsForApproval);

  return (
    <PageShell
      icon={Bot}
      title={agent.name}
      subtitle={agent.specialization}
      actions={
        <Link href="/ai-agents">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Agents
          </button>
        </Link>
      }
      fillHeight
    >
      <div className="space-y-6">
        {/* Agent Header Card */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-lg text-muted-foreground mb-1">
                {agent.specialization}
              </p>
              <p className="text-sm text-muted-foreground/70">
                {agent.description}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-4 h-4 rounded-full ${getStatusColor(agent.status)}`}
              />
              <span className="capitalize text-foreground text-sm">
                {agent.status}
              </span>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div>
              <div className="text-sm text-muted-foreground">
                Performance Rating
              </div>
              <div className="text-2xl font-bold text-blue-400">
                {agent.performanceRating}/100
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
              <div className="text-2xl font-bold text-green-400">
                {agent.successRate}%
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">
                Tasks Completed
              </div>
              <div className="text-2xl font-bold text-foreground">
                {agent.tasksCompleted}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">
                Avg Response Time
              </div>
              <div className="text-2xl font-bold text-foreground">
                {agent.avgResponseTime}ms
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-card rounded-lg border border-border">
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === "overview"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === "reports"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Daily Reports ({pendingReports.length})
            </button>
            <button
              onClick={() => setActiveTab("approvals")}
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === "approvals"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Approvals ({allApprovals.length})
            </button>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    Agent Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Category
                      </div>
                      <div className="font-medium text-foreground capitalize">
                        {agent.category}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Last Active
                      </div>
                      <div className="font-medium text-foreground">
                        {new Date(agent.lastActive).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Improvement Requests
                      </div>
                      <div className="font-medium text-foreground">
                        {agent.improvementRequests}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === "reports" && (
              <div className="space-y-4">
                {reports.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No reports available.
                  </p>
                ) : (
                  reports.map(report => (
                    <div
                      key={report.agentId + report.date}
                      className="border border-border rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-foreground">
                            {report.date}
                          </h4>
                          <div className="text-sm text-muted-foreground">
                            {report.tasksCompleted} tasks ·{" "}
                            {report.performanceRating}/100 rating
                          </div>
                        </div>
                      </div>
                      {report.improvements.length > 0 && (
                        <div className="mb-3">
                          <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                            Improvements
                          </div>
                          <ul className="space-y-1">
                            {report.improvements.map((h: string, i: number) => (
                              <li
                                key={i}
                                className="text-sm text-foreground/80 flex gap-2"
                              >
                                <span className="text-green-400">•</span>
                                {h}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {report.suggestions.length > 0 && (
                        <div>
                          <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                            Suggestions
                          </div>
                          <ul className="space-y-1">
                            {report.suggestions.map((c: string, i: number) => (
                              <li
                                key={i}
                                className="text-sm text-foreground/80 flex gap-2"
                              >
                                <span className="text-yellow-400">•</span>
                                {c}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Approvals Tab */}
            {activeTab === "approvals" && (
              <div className="space-y-4">
                {allApprovals.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No pending approval requests.
                  </p>
                ) : (
                  allApprovals.map(req => (
                    <div
                      key={req.id}
                      className="border border-border rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-foreground">
                            {req.type}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {req.description}
                          </p>
                        </div>
                        <span className="text-xs font-semibold uppercase text-yellow-400">
                          pending
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-muted-foreground">
                          Impact: {req.estimatedImpact}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReview(req.id, "approved")}
                            disabled={reviewMutation.isPending}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm disabled:opacity-50"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReview(req.id, "denied")}
                            disabled={reviewMutation.isPending}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
