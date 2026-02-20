/**
 * AI Agents Store
 * State management for AI agents monitoring and performance
 */

import { create } from 'zustand';

// Agent status
export type AgentStatus = 'active' | 'idle' | 'training' | 'error' | 'offline';

// Agent type
export type AgentType = 'digital-twin' | 'chief-of-staff' | 'sme' | 'expert';

// Agent interface
export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  rating: number; // 0-5
  tasksCompleted: number;
  accuracy: number; // 0-100
  lastActive: number; // timestamp
  currentTask?: string;
  performance: {
    responseTime: number; // ms
    successRate: number; // 0-100
    userSatisfaction: number; // 0-5
  };
  training: {
    level: number;
    progress: number; // 0-100
    modulesCompleted: number;
    totalModules: number;
  };
  dailyReport?: {
    date: string;
    activities: string[];
    improvements: string[];
    suggestions: string[];
    requestsForApproval: Array<{
      id: string;
      type: string;
      description: string;
      status: 'pending' | 'approved' | 'denied';
    }>;
  };
}

// Store interface
interface AgentsStoreState {
  // Agents data
  agents: Agent[];
  selectedAgent: string | null;
  
  // Actions
  setAgents: (agents: Agent[]) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  selectAgent: (id: string | null) => void;
  
  // Performance tracking
  trackPerformance: (agentId: string, metric: 'responseTime' | 'successRate' | 'userSatisfaction', value: number) => void;
  rateAgent: (agentId: string, rating: number) => void;
  
  // Training
  updateTraining: (agentId: string, progress: Partial<Agent['training']>) => void;
  
  // Daily reports
  addDailyReport: (agentId: string, report: Agent['dailyReport']) => void;
  approveRequest: (agentId: string, requestId: string) => void;
  denyRequest: (agentId: string, requestId: string) => void;
  
  // Filters and sorting
  filters: {
    type: AgentType | 'all';
    status: AgentStatus | 'all';
    minRating: number;
  };
  setFilters: (filters: Partial<AgentsStoreState['filters']>) => void;
  sortBy: 'name' | 'rating' | 'performance' | 'lastActive';
  setSortBy: (sortBy: AgentsStoreState['sortBy']) => void;
  
  // Computed values
  getFilteredAgents: () => Agent[];
  getAgentById: (id: string) => Agent | undefined;
  getAgentsByType: (type: AgentType) => Agent[];
  getTopPerformers: (limit?: number) => Agent[];
}

// Create store
export const useAgentsStore = create<AgentsStoreState>((set, get) => ({
  // Initial state
  agents: [],
  selectedAgent: null,
  filters: {
    type: 'all',
    status: 'all',
    minRating: 0,
  },
  sortBy: 'rating',
  
  // Actions
  setAgents: (agents) => set({ agents }),
  
  updateAgent: (id, updates) =>
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === id ? { ...agent, ...updates } : agent
      ),
    })),
  
  selectAgent: (id) => set({ selectedAgent: id }),
  
  // Performance tracking
  trackPerformance: (agentId, metric, value) =>
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === agentId
          ? {
              ...agent,
              performance: {
                ...agent.performance,
                [metric]: value,
              },
            }
          : agent
      ),
    })),
  
  rateAgent: (agentId, rating) =>
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === agentId ? { ...agent, rating } : agent
      ),
    })),
  
  // Training
  updateTraining: (agentId, progress) =>
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === agentId
          ? {
              ...agent,
              training: {
                ...agent.training,
                ...progress,
              },
            }
          : agent
      ),
    })),
  
  // Daily reports
  addDailyReport: (agentId, report) =>
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === agentId ? { ...agent, dailyReport: report } : agent
      ),
    })),
  
  approveRequest: (agentId, requestId) =>
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === agentId && agent.dailyReport
          ? {
              ...agent,
              dailyReport: {
                ...agent.dailyReport,
                requestsForApproval: agent.dailyReport.requestsForApproval.map((req) =>
                  req.id === requestId ? { ...req, status: 'approved' as const } : req
                ),
              },
            }
          : agent
      ),
    })),
  
  denyRequest: (agentId, requestId) =>
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === agentId && agent.dailyReport
          ? {
              ...agent,
              dailyReport: {
                ...agent.dailyReport,
                requestsForApproval: agent.dailyReport.requestsForApproval.map((req) =>
                  req.id === requestId ? { ...req, status: 'denied' as const } : req
                ),
              },
            }
          : agent
      ),
    })),
  
  // Filters and sorting
  setFilters: (filters) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...filters,
      },
    })),
  
  setSortBy: (sortBy) => set({ sortBy }),
  
  // Computed values
  getFilteredAgents: () => {
    const { agents, filters, sortBy } = get();
    
    let filtered = agents.filter((agent) => {
      if (filters.type !== 'all' && agent.type !== filters.type) return false;
      if (filters.status !== 'all' && agent.status !== filters.status) return false;
      if (agent.rating < filters.minRating) return false;
      return true;
    });
    
    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return b.rating - a.rating;
        case 'performance':
          return b.performance.successRate - a.performance.successRate;
        case 'lastActive':
          return b.lastActive - a.lastActive;
        default:
          return 0;
      }
    });
    
    return filtered;
  },
  
  getAgentById: (id) => {
    return get().agents.find((agent) => agent.id === id);
  },
  
  getAgentsByType: (type) => {
    return get().agents.filter((agent) => agent.type === type);
  },
  
  getTopPerformers: (limit = 5) => {
    return [...get().agents]
      .sort((a, b) => b.performance.successRate - a.performance.successRate)
      .slice(0, limit);
  },
}));

// Selectors
export const selectAgents = (state: AgentsStoreState) => state.agents;
export const selectSelectedAgent = (state: AgentsStoreState) => 
  state.agents.find(a => a.id === state.selectedAgent);
export const selectFilters = (state: AgentsStoreState) => state.filters;
export const selectSortBy = (state: AgentsStoreState) => state.sortBy;
