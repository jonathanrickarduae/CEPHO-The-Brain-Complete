import { useState } from 'react';
import { Link } from 'wouter';
import AIAgentsVideo from '@/components/ai-agents/AIAgentsVideo';
import { trpc } from '@/lib/trpc';

interface AIAgent {
  id: string;
  name: string;
  category: string;
  specialization: string;
  status: 'active' | 'idle' | 'learning' | 'offline';
  performanceRating: number;
  successRate: number;
  tasksCompleted: number;
  avgResponseTime: number;
  lastActive: string;
}

interface AgentStats {
  totalAgents: number;
  activeAgents: number;
  avgPerformance: number;
  totalTasksCompleted: number;
  pendingReports: number;
  pendingApprovals: number;
}

export default function AIAgentsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'performance' | 'tasks'>('performance');
  
  // Use tRPC to fetch agents and stats
  const { data: agentsData, isLoading: agentsLoading } = trpc.aiAgentsMonitoring.getAgents.useQuery();
  const { data: statsData, isLoading: statsLoading } = trpc.aiAgentsMonitoring.getStats.useQuery();
  
  const agents = agentsData?.agents || [];
  const stats = statsData?.stats || null;
  const loading = agentsLoading || statsLoading;

  const categories = [
    'all',
    'communication',
    'content',
    'analysis',
    'operations',
    'strategy',
    'workflow',
    'learning'
  ];



  const filteredAgents = agents
    .filter(agent => selectedCategory === 'all' || agent.category === selectedCategory)
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'performance') return b.performanceRating - a.performanceRating;
      if (sortBy === 'tasks') return b.tasksCompleted - a.tasksCompleted;
      return 0;
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'learning': return 'bg-blue-500';
      case 'idle': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPerformanceColor = (rating: number) => {
    if (rating >= 90) return 'text-green-600';
    if (rating >= 75) return 'text-blue-600';
    if (rating >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading AI Agents...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">AI Agents Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor and manage your 50 specialized AI agents
        </p>
      </div>

      {/* Educational Video Section */}
      <div className="mb-8">
        <AIAgentsVideo />
      </div>

      <div className="mb-8" style={{display: 'none'}}>
        <h1 className="text-4xl font-bold mb-2">AI Agents Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor and manage your 50 specialized AI agents
        </p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Agents</div>
            <div className="text-2xl font-bold">{stats.totalAgents}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
            <div className="text-2xl font-bold text-green-600">{stats.activeAgents}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Performance</div>
            <div className="text-2xl font-bold text-blue-600">{stats.avgPerformance}/100</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="text-sm text-gray-600 dark:text-gray-400">Tasks Completed</div>
            <div className="text-2xl font-bold">{stats.totalTasksCompleted}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="text-sm text-gray-600 dark:text-gray-400">Pending Reports</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingReports}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="text-sm text-gray-600 dark:text-gray-400">Pending Approvals</div>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingApprovals}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="text-sm font-medium mr-2">Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mr-2">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="performance">Performance</option>
              <option value="tasks">Tasks Completed</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map(agent => (
          <Link key={agent.id} href={`/agents/${agent.id}`}>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow hover:shadow-lg transition-shadow cursor-pointer">
              {/* Agent Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-1">{agent.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{agent.specialization}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`} />
              </div>

              {/* Performance Rating */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Performance</span>
                  <span className={`text-sm font-bold ${getPerformanceColor(agent.performanceRating)}`}>
                    {agent.performanceRating}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${agent.performanceRating}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Success Rate</div>
                  <div className="font-bold">{agent.successRate}%</div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Tasks Done</div>
                  <div className="font-bold">{agent.tasksCompleted}</div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Avg Response</div>
                  <div className="font-bold">{agent.avgResponseTime}ms</div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400">Category</div>
                  <div className="font-bold capitalize">{agent.category}</div>
                </div>
              </div>

              {/* Last Active */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500">
                  Last active: {new Date(agent.lastActive).toLocaleString()}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No agents found in this category
        </div>
      )}
    </div>
  );
}
