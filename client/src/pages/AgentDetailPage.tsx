import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { Bot, ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";

interface AgentDetail {
  id: string;
  name: string;
  category: string;
  specialization: string;
  description: string;
  status: "active" | "idle" | "learning" | "offline";
  performanceRating: number;
  successRate: number;
  tasksCompleted: number;
  avgResponseTime: number;
  lastActive: string;
  createdAt: string;
}

interface DailyReport {
  id: string;
  date: string;
  tasksCompleted: number;
  successRate: number;
  learnings: string[];
  improvements: string[];
  highlights: string[];
  concerns: string[];
  status: "pending" | "approved" | "rejected";
}

interface ApprovalRequest {
  id: string;
  requestType: string;
  description: string;
  benefitEstimate: string;
  costEstimate: number;
  riskLevel: "low" | "medium" | "high";
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export default function AgentDetailPage() {
  const [, params] = useRoute("/agents/:id");
  const agentId = params?.id;

  const [agent, setAgent] = useState<AgentDetail | null>(null);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [activeTab, setActiveTab] = useState<
    "overview" | "reports" | "approvals"
  >("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (agentId) {
      loadAgentDetails();
      loadReports();
      loadApprovals();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId]);

  const loadAgentDetails = async () => {
    try {
      const response = await fetch(`/api/agents/${agentId}`);
      if (response.ok) {
        const data = await response.json();
        setAgent(data);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    try {
      const response = await fetch(`/api/agents/${agentId}/reports`);
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch {
    }
  };

  const loadApprovals = async () => {
    try {
      const response = await fetch(`/api/agents/${agentId}/approvals`);
      if (response.ok) {
        const data = await response.json();
        setApprovals(data);
      }
    } catch {
    }
  };

  const approveReport = async (reportId: string) => {
    try {
      await fetch(`/api/agents/reports/${reportId}/approve`, {
        method: "POST",
      });
      loadReports();
    } catch {
    }
  };

  const approveRequest = async (requestId: string) => {
    try {
      await fetch(`/api/agents/approvals/${requestId}/approve`, {
        method: "POST",
      });
      loadApprovals();
    } catch {
    }
  };

  const rejectRequest = async (requestId: string) => {
    try {
      await fetch(`/api/agents/approvals/${requestId}/reject`, {
        method: "POST",
      });
      loadApprovals();
    } catch {
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl text-muted-foreground">Loading agent details...</div>
        </div>
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
            This agent may not be available yet or the database is not connected.
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "learning": return "bg-primary";
      case "idle": return "bg-yellow-500";
      case "offline": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low": return "text-green-400";
      case "medium": return "text-yellow-400";
      case "high": return "text-red-400";
      default: return "text-muted-foreground";
    }
  };

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
              <p className="text-lg text-muted-foreground mb-1">{agent.specialization}</p>
              <p className="text-sm text-muted-foreground/70">{agent.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full ${getStatusColor(agent.status)}`} />
              <span className="capitalize text-foreground text-sm">{agent.status}</span>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div>
              <div className="text-sm text-muted-foreground">Performance Rating</div>
              <div className="text-2xl font-bold text-blue-400">{agent.performanceRating}/100</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
              <div className="text-2xl font-bold text-green-400">{agent.successRate}%</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Tasks Completed</div>
              <div className="text-2xl font-bold text-foreground">{agent.tasksCompleted}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Avg Response Time</div>
              <div className="text-2xl font-bold text-foreground">{agent.avgResponseTime}ms</div>
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
              Daily Reports ({reports.filter(r => r.status === "pending").length})
            </button>
            <button
              onClick={() => setActiveTab("approvals")}
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === "approvals"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Approvals ({approvals.filter(a => a.status === "pending").length})
            </button>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Agent Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Category</div>
                      <div className="font-medium text-foreground capitalize">{agent.category}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Created</div>
                      <div className="font-medium text-foreground">
                        {new Date(agent.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Last Active</div>
                      <div className="font-medium text-foreground">
                        {new Date(agent.lastActive).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === "reports" && (
              <div className="space-y-4">
                {reports.map(report => (
                  <div key={report.id} className="border border-border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-foreground">
                          {new Date(report.date).toLocaleDateString()}
                        </h4>
                        <div className="text-sm text-muted-foreground">
                          {report.tasksCompleted} tasks · {report.successRate}% success rate
                        </div>
                      </div>
                      {report.status === "pending" && (
                        <button
                          onClick={() => approveReport(report.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                          Approve
                        </button>
                      )}
                      {report.status === "approved" && (
                        <span className="text-green-400 font-medium text-sm">✓ Approved</span>
                      )}
                    </div>

                    {report.highlights.length > 0 && (
                      <div className="mb-3">
                        <div className="text-sm font-medium text-foreground mb-1">Highlights:</div>
                        <ul className="list-disc list-inside text-sm text-foreground/80">
                          {report.highlights.map((h, i) => <li key={i}>{h}</li>)}
                        </ul>
                      </div>
                    )}

                    {report.learnings.length > 0 && (
                      <div className="mb-3">
                        <div className="text-sm font-medium text-foreground mb-1">Learnings:</div>
                        <ul className="list-disc list-inside text-sm text-foreground/80">
                          {report.learnings.map((l, i) => <li key={i}>{l}</li>)}
                        </ul>
                      </div>
                    )}

                    {report.improvements.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-foreground mb-1">Improvements:</div>
                        <ul className="list-disc list-inside text-sm text-foreground/80">
                          {report.improvements.map((imp, i) => <li key={i}>{imp}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
                {reports.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">No reports yet</div>
                )}
              </div>
            )}

            {/* Approvals Tab */}
            {activeTab === "approvals" && (
              <div className="space-y-4">
                {approvals.map(approval => (
                  <div key={approval.id} className="border border-border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-foreground capitalize">
                          {approval.requestType.replace("_", " ")}
                        </h4>
                        <div className="text-sm text-muted-foreground">
                          {new Date(approval.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      {approval.status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => approveRequest(approval.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectRequest(approval.id)}
                            className="px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 text-sm"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {approval.status === "approved" && (
                        <span className="text-green-400 font-medium text-sm">✓ Approved</span>
                      )}
                      {approval.status === "rejected" && (
                        <span className="text-destructive font-medium text-sm">✗ Rejected</span>
                      )}
                    </div>

                    <p className="text-sm text-foreground/80 mb-3">{approval.description}</p>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Benefit</div>
                        <div className="font-medium text-foreground">{approval.benefitEstimate}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Cost</div>
                        <div className="font-medium text-foreground">${approval.costEstimate}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Risk</div>
                        <div className={`font-medium capitalize ${getRiskColor(approval.riskLevel)}`}>
                          {approval.riskLevel}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {approvals.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">No approval requests</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
