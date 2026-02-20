/**
 * AI Agents Monitoring Page
 * Monitor AI agent performance, ratings, and daily reports
 */

import React, { useEffect } from 'react';
import { useAgentsStore, selectAgents, selectFilters, selectSortBy, AgentType, AgentStatus } from '../store/useAgentsStore';
import { Activity, TrendingUp, Award, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function AgentsMonitoring() {
  const agents = useAgentsStore((state) => state.getFilteredAgents());
  const filters = useAgentsStore(selectFilters);
  const sortBy = useAgentsStore(selectSortBy);
  const setFilters = useAgentsStore((state) => state.setFilters);
  const setSortBy = useAgentsStore((state) => state.setSortBy);
  const selectAgent = useAgentsStore((state) => state.selectAgent);
  const selectedAgent = useAgentsStore((state) => 
    state.agents.find(a => a.id === state.selectedAgent)
  );
  const approveRequest = useAgentsStore((state) => state.approveRequest);
  const denyRequest = useAgentsStore((state) => state.denyRequest);
  
  // Mock data for demonstration (in production, fetch from API)
  useEffect(() => {
    const mockAgents = [
      {
        id: 'dt-1',
        name: 'Digital Twin',
        type: 'digital-twin' as AgentType,
        status: 'active' as AgentStatus,
        rating: 4.8,
        tasksCompleted: 1247,
        accuracy: 94.5,
        lastActive: Date.now() - 1000 * 60 * 5,
        currentTask: 'Analyzing user preferences',
        performance: {
          responseTime: 245,
          successRate: 94.5,
          userSatisfaction: 4.8,
        },
        training: {
          level: 12,
          progress: 67,
          modulesCompleted: 8,
          totalModules: 12,
        },
        dailyReport: {
          date: new Date().toISOString().split('T')[0],
          activities: [
            'Processed 47 user interactions',
            'Learned 12 new user preferences',
            'Updated decision-making model',
          ],
          improvements: [
            'Improved response accuracy by 2.3%',
            'Reduced average response time by 15ms',
          ],
          suggestions: [
            'Implement new NLP model for better context understanding',
            'Add sentiment analysis for mood tracking',
          ],
          requestsForApproval: [
            {
              id: 'req-1',
              type: 'model-update',
              description: 'Upgrade to GPT-4.1 for improved reasoning',
              status: 'pending',
            },
          ],
        },
      },
      {
        id: 'cos-1',
        name: 'Chief of Staff',
        type: 'chief-of-staff' as AgentType,
        status: 'active' as AgentStatus,
        rating: 4.9,
        tasksCompleted: 892,
        accuracy: 96.2,
        lastActive: Date.now() - 1000 * 60 * 2,
        currentTask: 'Reviewing project priorities',
        performance: {
          responseTime: 312,
          successRate: 96.2,
          userSatisfaction: 4.9,
        },
        training: {
          level: 15,
          progress: 89,
          modulesCompleted: 13,
          totalModules: 15,
        },
        dailyReport: {
          date: new Date().toISOString().split('T')[0],
          activities: [
            'Coordinated 23 project tasks',
            'Generated 5 strategic recommendations',
            'Facilitated 8 team collaborations',
          ],
          improvements: [
            'Enhanced decision-making framework',
            'Improved task prioritization algorithm',
          ],
          suggestions: [
            'Integrate calendar API for better scheduling',
            'Add predictive analytics for project timelines',
          ],
          requestsForApproval: [
            {
              id: 'req-2',
              type: 'integration',
              description: 'Connect to Asana API for task synchronization',
              status: 'pending',
            },
          ],
        },
      },
      {
        id: 'sme-1',
        name: 'SME Network Coordinator',
        type: 'sme' as AgentType,
        status: 'training' as AgentStatus,
        rating: 4.6,
        tasksCompleted: 534,
        accuracy: 91.8,
        lastActive: Date.now() - 1000 * 60 * 10,
        currentTask: 'Training on new industry data',
        performance: {
          responseTime: 428,
          successRate: 91.8,
          userSatisfaction: 4.6,
        },
        training: {
          level: 8,
          progress: 45,
          modulesCompleted: 4,
          totalModules: 10,
        },
      },
    ];
    
    useAgentsStore.getState().setAgents(mockAgents);
  }, []);
  
  const getStatusColor = (status: AgentStatus) => {
    const colors = {
      active: 'text-green-400 bg-green-500/10',
      idle: 'text-gray-400 bg-gray-500/10',
      training: 'text-blue-400 bg-blue-500/10',
      error: 'text-red-400 bg-red-500/10',
      offline: 'text-gray-600 bg-gray-700/10',
    };
    return colors[status];
  };
  
  const formatTimestamp = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 1000 / 60);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">AI Agents Monitoring</h1>
          <p className="text-gray-400">Monitor performance, ratings, and daily reports</p>
        </div>
        
        {/* Filters */}
        <div className="bg-gray-800/50 rounded-lg p-4 mb-6 flex flex-wrap gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Agent Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ type: e.target.value as AgentType | 'all' })}
              className="bg-gray-700 rounded px-3 py-2 text-sm"
            >
              <option value="all">All Types</option>
              <option value="digital-twin">Digital Twin</option>
              <option value="chief-of-staff">Chief of Staff</option>
              <option value="sme">SME Network</option>
              <option value="expert">Expert</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ status: e.target.value as AgentStatus | 'all' })}
              className="bg-gray-700 rounded px-3 py-2 text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="idle">Idle</option>
              <option value="training">Training</option>
              <option value="error">Error</option>
              <option value="offline">Offline</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Min Rating</label>
            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={filters.minRating}
              onChange={(e) => setFilters({ minRating: parseFloat(e.target.value) })}
              className="bg-gray-700 rounded px-3 py-2 text-sm w-24"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-gray-700 rounded px-3 py-2 text-sm"
            >
              <option value="rating">Rating</option>
              <option value="performance">Performance</option>
              <option value="name">Name</option>
              <option value="lastActive">Last Active</option>
            </select>
          </div>
        </div>
        
        {/* Agents Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
          {agents.map((agent) => (
            <div
              key={agent.id}
              onClick={() => selectAgent(agent.id)}
              className="bg-gray-800/50 rounded-lg p-6 cursor-pointer hover:bg-gray-800/70 transition-colors border border-gray-700/50"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold mb-1">{agent.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(agent.status)}`}>
                    {agent.status}
                  </span>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Award className="w-4 h-4" />
                    <span className="font-semibold">{agent.rating.toFixed(1)}</span>
                  </div>
                  <p className="text-xs text-gray-400">{agent.tasksCompleted} tasks</p>
                </div>
              </div>
              
              {agent.currentTask && (
                <p className="text-sm text-gray-400 mb-4 italic">
                  <Activity className="w-3 h-3 inline mr-1" />
                  {agent.currentTask}
                </p>
              )}
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-400">Accuracy</p>
                  <p className="text-lg font-semibold text-green-400">{agent.accuracy}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Response Time</p>
                  <p className="text-lg font-semibold">{agent.performance.responseTime}ms</p>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Training Progress</span>
                  <span>{agent.training.progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${agent.training.progress}%` }}
                  />
                </div>
              </div>
              
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Last active {formatTimestamp(agent.lastActive)}
              </p>
            </div>
          ))}
        </div>
        
        {/* Selected Agent Details */}
        {selectedAgent && selectedAgent.dailyReport && (
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">{selectedAgent.name} - Daily Report</h2>
                <p className="text-gray-400">{selectedAgent.dailyReport.date}</p>
              </div>
              <button
                onClick={() => selectAgent(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  Activities
                </h3>
                <ul className="space-y-2">
                  {selectedAgent.dailyReport.activities.map((activity, i) => (
                    <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Improvements
                </h3>
                <ul className="space-y-2">
                  {selectedAgent.dailyReport.improvements.map((improvement, i) => (
                    <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-green-400 mt-1">•</span>
                      {improvement}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Suggestions</h3>
                <ul className="space-y-2">
                  {selectedAgent.dailyReport.suggestions.map((suggestion, i) => (
                    <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-yellow-400 mt-1">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Requests for Approval</h3>
                <div className="space-y-3">
                  {selectedAgent.dailyReport.requestsForApproval.map((request) => (
                    <div key={request.id} className="bg-gray-700/50 rounded p-3">
                      <p className="text-sm font-medium mb-1">{request.type}</p>
                      <p className="text-xs text-gray-400 mb-3">{request.description}</p>
                      {request.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => approveRequest(selectedAgent.id, request.id)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs py-2 rounded transition-colors flex items-center justify-center gap-1"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Approve
                          </button>
                          <button
                            onClick={() => denyRequest(selectedAgent.id, request.id)}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs py-2 rounded transition-colors flex items-center justify-center gap-1"
                          >
                            <XCircle className="w-3 h-3" />
                            Deny
                          </button>
                        </div>
                      ) : (
                        <span className={`text-xs px-2 py-1 rounded ${
                          request.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {request.status}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
