/**
 * Simulation Context Hook
 * 
 * Provides simulation data for Project Genesis to run end-to-end
 * without requiring live OAuth integrations.
 */

import { trpc } from '@/lib/trpc';

export interface SimulationCalendarEvent {
  id: string;
  calendarId: string;
  title: string;
  description?: string;
  startTime: number;
  endTime: number;
  location?: string;
  isAllDay: boolean;
  attendees: {
    email: string;
    name?: string;
    responseStatus: 'accepted' | 'declined' | 'tentative' | 'needsAction';
  }[];
  status: 'confirmed' | 'tentative' | 'cancelled';
  source: 'google' | 'outlook' | 'simulation';
}

export interface SimulationEmail {
  id: string;
  threadId: string;
  from: { email: string; name?: string };
  to: { email: string; name?: string }[];
  cc?: { email: string; name?: string }[];
  subject: string;
  snippet: string;
  bodyPlain?: string;
  receivedAt: number;
  isRead: boolean;
  isStarred: boolean;
  labels: string[];
  attachments: { filename: string; mimeType: string; size: number }[];
  importance: 'high' | 'normal' | 'low';
}

export interface SimulationNotionPage {
  id: string;
  title: string;
  parentId?: string;
  parentType: 'workspace' | 'page' | 'database';
  createdAt: number;
  updatedAt: number;
  content: string;
  icon?: string;
  url: string;
}

export interface SimulationTask {
  id: string;
  boardId: string;
  boardName: string;
  columnId: string;
  columnName: string;
  title: string;
  description?: string;
  dueDate?: number;
  assignees: string[];
  labels: { name: string; color: string }[];
  checklists: { name: string; items: { text: string; isComplete: boolean }[] }[];
  createdAt: number;
  updatedAt: number;
}

export interface SimulationSummary {
  calendar: {
    todayMeetings: number;
    thisWeekMeetings: number;
    nextMeeting?: SimulationCalendarEvent;
    focusTimeBlocked: number;
  };
  email: {
    unreadCount: number;
    highPriorityCount: number;
    actionRequired: SimulationEmail[];
  };
  notion: {
    recentlyUpdated: SimulationNotionPage[];
    activeOKRs: string[];
  };
  tasks: {
    overdueCount: number;
    dueTodayCount: number;
    dueThisWeekCount: number;
    inProgressCount: number;
    blockedDeals: SimulationTask[];
  };
}

export interface GenesisContext {
  businessContext: string;
  currentPriorities: string[];
  upcomingDeadlines: { title: string; date: string }[];
  keyMetrics: { name: string; value: string }[];
  teamCapacity: string;
  fundingStatus: string;
}

export function useSimulationContext() {
  // Get simulation mode status
  const { data: statusData, isLoading: statusLoading } = trpc.simulation.getStatus.useQuery();
  
  // Get simulation summary
  const { data: summaryData, isLoading: summaryLoading } = trpc.simulation.getSummary.useQuery(
    undefined,
    { enabled: statusData?.enabled }
  );
  
  // Get Genesis context
  const { data: contextData, isLoading: contextLoading } = trpc.simulation.getGenesisContext.useQuery(
    undefined,
    { enabled: statusData?.enabled }
  );
  
  // Get calendar events
  const { data: calendarData } = trpc.simulation.getCalendarEvents.useQuery(
    undefined,
    { enabled: statusData?.enabled }
  );
  
  // Get emails
  const { data: emailData } = trpc.simulation.getEmails.useQuery(
    undefined,
    { enabled: statusData?.enabled }
  );
  
  // Get tasks
  const { data: taskData } = trpc.simulation.getTasks.useQuery(
    undefined,
    { enabled: statusData?.enabled }
  );
  
  // Toggle simulation mode
  const toggleMutation = trpc.simulation.setStatus.useMutation();
  
  const toggleSimulationMode = async (enabled: boolean) => {
    await toggleMutation.mutateAsync({ enabled });
  };
  
  return {
    // Status
    isSimulationMode: statusData?.enabled ?? true,
    isLoading: statusLoading || summaryLoading || contextLoading,
    
    // Data
    summary: summaryData?.summary as SimulationSummary | null,
    genesisContext: contextData?.context as GenesisContext | null,
    calendarEvents: calendarData?.events as SimulationCalendarEvent[] ?? [],
    emails: emailData?.emails as SimulationEmail[] ?? [],
    tasks: taskData?.tasks as SimulationTask[] ?? [],
    
    // Actions
    toggleSimulationMode,
    
    // Helpers for Project Genesis
    getBusinessInsights: () => {
      const context = contextData?.context as GenesisContext | null;
      if (!context) return null;
      
      return {
        context: context.businessContext,
        priorities: context.currentPriorities,
        deadlines: context.upcomingDeadlines,
        metrics: context.keyMetrics,
        capacity: context.teamCapacity,
        funding: context.fundingStatus,
      };
    },
    
    getTodaySnapshot: () => {
      const summary = summaryData?.summary as SimulationSummary | null;
      if (!summary) return null;
      
      return {
        meetingsToday: summary.calendar.todayMeetings,
        nextMeeting: summary.calendar.nextMeeting,
        unreadEmails: summary.email.unreadCount,
        urgentEmails: summary.email.highPriorityCount,
        tasksOverdue: summary.tasks.overdueCount,
        tasksDueToday: summary.tasks.dueTodayCount,
        focusTimeAvailable: summary.calendar.focusTimeBlocked,
      };
    },
    
    getProjectContext: () => {
      const summary = summaryData?.summary as SimulationSummary | null;
      const context = contextData?.context as GenesisContext | null;
      if (!summary || !context) return null;
      
      return {
        activeOKRs: summary.notion.activeOKRs,
        recentDocuments: summary.notion.recentlyUpdated.map(p => p.title),
        openDeals: summary.tasks.blockedDeals.map(t => ({
          name: t.title,
          board: t.boardName,
          status: t.columnName,
        })),
        teamCapacity: context.teamCapacity,
        fundingStatus: context.fundingStatus,
      };
    },
  };
}

// Export types for use in components
export type UseSimulationContextReturn = ReturnType<typeof useSimulationContext>;
