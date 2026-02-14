import { useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';

interface AgentDetail {
  id: string;
  name: string;
  category: string;
  specialization: string;
  description: string;
  status: 'active' | 'idle' | 'learning' | 'offline';
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
  status: 'pending' | 'approved' | 'rejected';
}

interface ApprovalRequest {
  id: string;
  requestType: string;
  description: string;
  benefitEstimate: string;
  costEstimate: number;
  riskLevel: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function AgentDetailPage() {
  const [, params] = useRoute('/agents/:id');
  const agentId = params?.id;

  const [agent, setAgent] = useState<AgentDetail | null>(null);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'approvals'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (agentId) {
      loadAgentDetails();
      loadReports();
      loadApprovals();
    }
  }, [agentId]);

  const loadAgentDetails = async () => {
    try {
      const response = await fetch(`/api/agents/${agentId}`);
      if (response.ok) {
        const data = await response.json();
        setAgent(data);
      }
    } catch (error) {
      console.error('Failed to load agent:', error);
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
    } catch (error) {
      console.error('Failed to load reports:', error);
    }
  };

  const loadApprovals = async () => {
    try {
      const response = await fetch(`/api/agents/${agentId}/approvals`);
      if (response.ok) {
        const data = await response.json();
        setApprovals(data);
      }
    } catch (error) {
      console.error('Failed to load approvals:', error);
    }
  };

  const approveReport = async (reportId: string) => {
    try {
      await fetch(`/api/agents/reports/${reportId}/approve`, { method: 'POST' });
      loadReports();
    } catch (error) {
      console.error('Failed to approve report:', error);
    }
  };

  const approveRequest = async (requestId: string) => {
    try {
      await fetch(`/api/agents/approvals/${requestId}/approve`, { method: 'POST' });
      loadApprovals();
    } catch (error) {
      console.error('Failed to approve request:', error);
    }
  };

  const rejectRequest = async (requestId: string) => {
    try {
      await fetch(`/api/agents/approvals/${requestId}/reject`, { method: 'POST' });
      loadApprovals();
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  };

  if (loading || !agent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading agent details...</div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'learning': return 'bg-blue-500';
      case 'idle': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link href="/agents">
        <button className="mb-4 text-blue-600 hover:text-blue-700">
          ← Back to All Agents
        </button>
      </Link>

      {/* Agent Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{agent.name}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">{agent.specialization}</p>
            <p className="text-sm text-gray-500">{agent.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full ${getStatusColor(agent.status)}`} />
            <span className="capitalize">{agent.status}</span>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Performance Rating</div>
            <div className="text-2xl font-bold text-blue-600">{agent.performanceRating}/100</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
            <div className="text-2xl font-bold text-green-600">{agent.successRate}%</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Tasks Completed</div>
            <div className="text-2xl font-bold">{agent.tasksCompleted}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</div>
            <div className="text-2xl font-bold">{agent.avgResponseTime}ms</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'overview'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'reports'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Daily Reports ({reports.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'approvals'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Approval Requests ({approvals.filter(a => a.status === 'pending').length})
          </button>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-2">Agent Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Category</div>
                    <div className="font-medium capitalize">{agent.category}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Created</div>
                    <div className="font-medium">{new Date(agent.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Last Active</div>
                    <div className="font-medium">{new Date(agent.lastActive).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              {reports.map(report => (
                <div key={report.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold">{new Date(report.date).toLocaleDateString()}</h4>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {report.tasksCompleted} tasks • {report.successRate}% success rate
                      </div>
                    </div>
                    {report.status === 'pending' && (
                      <button
                        onClick={() => approveReport(report.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Approve
                      </button>
                    )}
                    {report.status === 'approved' && (
                      <span className="text-green-600 font-medium">✓ Approved</span>
                    )}
                  </div>

                  {report.highlights.length > 0 && (
                    <div className="mb-3">
                      <div className="text-sm font-medium mb-1">Highlights:</div>
                      <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
                        {report.highlights.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {report.learnings.length > 0 && (
                    <div className="mb-3">
                      <div className="text-sm font-medium mb-1">Learnings:</div>
                      <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
                        {report.learnings.map((l, i) => (
                          <li key={i}>{l}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {report.improvements.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-1">Improvements:</div>
                      <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
                        {report.improvements.map((imp, i) => (
                          <li key={i}>{imp}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
              {reports.length === 0 && (
                <div className="text-center py-8 text-gray-500">No reports yet</div>
              )}
            </div>
          )}

          {/* Approvals Tab */}
          {activeTab === 'approvals' && (
            <div className="space-y-4">
              {approvals.map(approval => (
                <div key={approval.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold capitalize">{approval.requestType.replace('_', ' ')}</h4>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(approval.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    {approval.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => approveRequest(approval.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => rejectRequest(approval.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {approval.status === 'approved' && (
                      <span className="text-green-600 font-medium">✓ Approved</span>
                    )}
                    {approval.status === 'rejected' && (
                      <span className="text-red-600 font-medium">✗ Rejected</span>
                    )}
                  </div>

                  <p className="text-sm mb-3">{approval.description}</p>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">Benefit</div>
                      <div className="font-medium">{approval.benefitEstimate}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">Cost</div>
                      <div className="font-medium">${approval.costEstimate}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">Risk</div>
                      <div className={`font-medium capitalize ${getRiskColor(approval.riskLevel)}`}>
                        {approval.riskLevel}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {approvals.length === 0 && (
                <div className="text-center py-8 text-gray-500">No approval requests</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
