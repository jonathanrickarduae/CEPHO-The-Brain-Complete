import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';

interface ReviewContext {
  pendingTasks: number;
  activeProjects: number;
  upcomingMeetings: number;
  outstandingItems: number;
  lastReviewDate: Date | null;
  userTypicalReviewTime: string; // e.g., "19:00"
}

interface ChiefOfStaffState {
  isPromptVisible: boolean;
  promptType: 'evening_review' | 'morning_brief' | 'task_reminder' | null;
  context: ReviewContext | null;
  autoStartCountdown: number | null; // seconds until auto-start
  hasUserResponded: boolean;
}

const DEFAULT_REVIEW_TIME = '19:00'; // 7 PM
const AUTO_START_DELAY = 3600; // 1 hour after prompt (8 PM)
const PROMPT_CHECK_INTERVAL = 60000; // Check every minute

export function useChiefOfStaffAutomation() {
  const [, setLocation] = useLocation();
  const [state, setState] = useState<ChiefOfStaffState>({
    isPromptVisible: false,
    promptType: null,
    context: null,
    autoStartCountdown: null,
    hasUserResponded: false,
  });

  // Fetch user settings for preferred review time
  const { data: userSettings } = trpc.settings.get.useQuery();
  
  // Fetch tasks to count pending items
  const { data: taskItems } = trpc.tasks.list.useQuery();
  
  // Fetch projects
  const { data: projects } = trpc.projects.list.useQuery();

  // Calculate review context
  const getReviewContext = useCallback((): ReviewContext => {
    const pendingTasks = taskItems?.filter(
      (item: { status: string }) => item.status !== 'completed' && item.status !== 'cancelled'
    ).length || 0;
    
    const activeProjects = projects?.filter(
      (p: { status: string }) => p.status === 'in_progress'
    ).length || 0;
    
    // Outstanding items that need attention
    const outstandingItems = taskItems?.filter(
      (item: { status: string; priority: string | null }) => item.status === 'blocked' || item.priority === 'high'
    ).length || 0;

    return {
      pendingTasks,
      activeProjects,
      upcomingMeetings: 0, // Would integrate with calendar API
      outstandingItems,
      lastReviewDate: null, // Would fetch from database
      userTypicalReviewTime: userSettings?.eveningReviewTime || DEFAULT_REVIEW_TIME,
    };
  }, [taskItems, projects, userSettings]);

  // Check if it's time to show the Evening Review prompt
  const checkEveningReviewTrigger = useCallback(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    
    const reviewTime = userSettings?.eveningReviewTime || DEFAULT_REVIEW_TIME;
    const [reviewHour] = reviewTime.split(':').map(Number);
    
    // Check if we're within the review window (review time to review time + 1 hour)
    const isInReviewWindow = currentHour >= reviewHour && currentHour < reviewHour + 1;
    
    // Don't show if user has already responded today
    if (state.hasUserResponded) {
      return false;
    }
    
    // Check if we should show the prompt
    if (isInReviewWindow && !state.isPromptVisible) {
      const context = getReviewContext();
      
      // Only show if there are tasks to review
      if (context.pendingTasks > 0 || context.outstandingItems > 0) {
        setState(prev => ({
          ...prev,
          isPromptVisible: true,
          promptType: 'evening_review',
          context,
          autoStartCountdown: AUTO_START_DELAY,
        }));
        return true;
      }
    }
    
    return false;
  }, [userSettings, state.hasUserResponded, state.isPromptVisible, getReviewContext]);

  // Auto-start countdown
  useEffect(() => {
    if (state.autoStartCountdown === null || state.autoStartCountdown <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setState(prev => {
        if (prev.autoStartCountdown === null) return prev;
        
        const newCountdown = prev.autoStartCountdown - 1;
        
        if (newCountdown <= 0) {
          // Auto-start the evening review
          handleAutoStart();
          return {
            ...prev,
            autoStartCountdown: null,
            isPromptVisible: false,
          };
        }
        
        return {
          ...prev,
          autoStartCountdown: newCountdown,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.autoStartCountdown]);

  // Periodic check for triggers
  useEffect(() => {
    // Initial check
    checkEveningReviewTrigger();
    
    // Set up periodic checks
    const interval = setInterval(() => {
      checkEveningReviewTrigger();
    }, PROMPT_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [checkEveningReviewTrigger]);

  // Handle user accepting the prompt
  const handleAcceptPrompt = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPromptVisible: false,
      hasUserResponded: true,
      autoStartCountdown: null,
    }));
    
    // Navigate to Evening Review
    setLocation('/evening-review');
  }, [setLocation]);

  // Handle user dismissing the prompt (will auto-start later)
  const handleDismissPrompt = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPromptVisible: false,
      // Keep countdown running for auto-start
    }));
  }, []);

  // Handle auto-start (no user response)
  const handleAutoStart = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPromptVisible: false,
      hasUserResponded: true,
    }));
    
    // Navigate to Evening Review with auto-start flag
    setLocation('/evening-review?autostart=true');
  }, [setLocation]);

  // Handle user choosing to let Chief of Staff handle it
  const handleDelegateToChief = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPromptVisible: false,
      hasUserResponded: true,
      autoStartCountdown: null,
    }));
    
    // Navigate to Evening Review with delegate flag
    setLocation('/evening-review?delegate=true');
  }, [setLocation]);

  // Reset for new day
  const resetForNewDay = useCallback(() => {
    setState({
      isPromptVisible: false,
      promptType: null,
      context: null,
      autoStartCountdown: null,
      hasUserResponded: false,
    });
  }, []);

  // Format countdown for display
  const formatCountdown = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  }, []);

  return {
    ...state,
    handleAcceptPrompt,
    handleDismissPrompt,
    handleDelegateToChief,
    handleAutoStart,
    resetForNewDay,
    formatCountdown: state.autoStartCountdown 
      ? formatCountdown(state.autoStartCountdown) 
      : null,
    reviewContext: state.context,
  };
}

export type { ReviewContext, ChiefOfStaffState };
