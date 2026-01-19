import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';

interface ReviewContext {
  pendingTasks: number;
  activeProjects: number;
  upcomingMeetings: number;
  outstandingItems: number;
  lastReviewDate: Date | null;
  userTypicalReviewTime: string; // e.g., "19:00"
  predictedReviewTime: string | null; // Learned from patterns
  hasCalendarConflict: boolean;
  conflictEndTime: Date | null;
}

interface TimingPattern {
  dayOfWeek: number;
  averageStartTime: string | null;
  averageDuration: number | null;
  completionRate: number | null;
  autoProcessRate: number | null;
  sampleCount: number;
}

interface ChiefOfStaffState {
  isPromptVisible: boolean;
  promptType: 'evening_review' | 'morning_brief' | 'task_reminder' | null;
  context: ReviewContext | null;
  autoStartCountdown: number | null; // seconds until auto-start
  hasUserResponded: boolean;
  isLearningEnabled: boolean;
  timingPatterns: TimingPattern[];
}

const DEFAULT_REVIEW_TIME = '19:00'; // 7 PM
const AUTO_START_DELAY = 3600; // 1 hour after prompt (8 PM)
const PROMPT_CHECK_INTERVAL = 60000; // Check every minute
const CALENDAR_CONFLICT_BUFFER = 15; // Minutes buffer after meeting

export function useChiefOfStaffAutomation() {
  const [, setLocation] = useLocation();
  const [state, setState] = useState<ChiefOfStaffState>({
    isPromptVisible: false,
    promptType: null,
    context: null,
    autoStartCountdown: null,
    hasUserResponded: false,
    isLearningEnabled: true,
    timingPatterns: [],
  });

  // Fetch user settings for preferred review time
  const { data: userSettings } = trpc.settings.get.useQuery();
  
  // Fetch tasks to count pending items
  const { data: taskItems } = trpc.tasks.list.useQuery();
  
  // Fetch projects
  const { data: projects } = trpc.projects.list.useQuery();

  // Fetch timing patterns for learning
  const { data: timingPatterns } = trpc.eveningReview.getTimingPatterns.useQuery();

  // Fetch predicted review time
  const { data: predictedTimeData } = trpc.eveningReview.getPredictedTime.useQuery();

  // Get latest review session
  const { data: latestReview } = trpc.eveningReview.getLatest.useQuery();

  // Calculate review window for calendar conflict check
  const reviewWindow = useMemo(() => {
    const now = new Date();
    const reviewTime = userSettings?.eveningReviewTime || DEFAULT_REVIEW_TIME;
    const [reviewHour, reviewMinute] = reviewTime.split(':').map(Number);
    
    const windowStart = new Date(now);
    windowStart.setHours(reviewHour, reviewMinute || 0, 0, 0);
    
    const windowEnd = new Date(windowStart);
    windowEnd.setHours(windowEnd.getHours() + 2); // 2 hour window
    
    return {
      start: windowStart.toISOString(),
      end: windowEnd.toISOString(),
    };
  }, [userSettings?.eveningReviewTime]);

  // Check for calendar conflicts
  const { data: calendarConflicts } = trpc.eveningReview.checkCalendarConflicts.useQuery({
    windowStart: reviewWindow.start,
    windowEnd: reviewWindow.end,
  });

  // Calculate smart review time based on patterns and calendar
  const getSmartReviewTime = useCallback((): { time: string; reason: string } => {
    const baseTime = userSettings?.eveningReviewTime || DEFAULT_REVIEW_TIME;
    const predictedTime = predictedTimeData?.predictedTime;
    const dayOfWeek = new Date().getDay();
    
    // Find pattern for today
    const todayPattern = timingPatterns?.find(p => p.dayOfWeek === dayOfWeek);
    
    // If we have a learned pattern with good sample size, use it
    if (todayPattern && todayPattern.sampleCount >= 3 && todayPattern.averageStartTime) {
      // If user usually auto-processes on this day, suggest earlier time
      if ((todayPattern.autoProcessRate || 0) > 0.5) {
        return {
          time: todayPattern.averageStartTime,
          reason: 'Based on your pattern, you often delegate reviews on this day',
        };
      }
      return {
        time: todayPattern.averageStartTime,
        reason: `You typically start reviews at ${todayPattern.averageStartTime} on this day`,
      };
    }
    
    // Use predicted time if available
    if (predictedTime) {
      return {
        time: predictedTime,
        reason: 'Based on your recent review patterns',
      };
    }
    
    // Fall back to user setting
    return {
      time: baseTime,
      reason: 'Your configured review time',
    };
  }, [userSettings, predictedTimeData, timingPatterns]);

  // Calculate review context with enhanced data
  const getReviewContext = useCallback((): ReviewContext => {
    const pendingTasks = taskItems?.filter(
      (item: { status: string }) => item.status !== 'completed' && item.status !== 'cancelled'
    ).length || 0;
    
    const activeProjects = projects?.filter(
      (p: { status: string }) => p.status === 'in_progress'
    ).length || 0;
    
    // Outstanding items that need attention
    const outstandingItems = taskItems?.filter(
      (item: { status: string; priority: string | null }) => item.status === 'blocked' || item.priority === 'high' || item.priority === 'critical'
    ).length || 0;

    const smartTime = getSmartReviewTime();

    return {
      pendingTasks,
      activeProjects,
      upcomingMeetings: 0, // Would integrate with calendar API
      outstandingItems,
      lastReviewDate: latestReview?.reviewDate ? new Date(latestReview.reviewDate) : null,
      userTypicalReviewTime: userSettings?.eveningReviewTime || DEFAULT_REVIEW_TIME,
      predictedReviewTime: smartTime.time,
      hasCalendarConflict: calendarConflicts?.hasConflicts || false,
      conflictEndTime: null, // Would be set from calendar data
    };
  }, [taskItems, projects, userSettings, latestReview, calendarConflicts, getSmartReviewTime]);

  // Check if it's time to show the Evening Review prompt
  const checkEveningReviewTrigger = useCallback(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    const smartTime = getSmartReviewTime();
    const [reviewHour, reviewMinute] = smartTime.time.split(':').map(Number);
    
    // Check if we're within the review window (review time to review time + 1 hour)
    const isInReviewWindow = 
      (currentHour > reviewHour || (currentHour === reviewHour && currentMinute >= (reviewMinute || 0))) &&
      currentHour < reviewHour + 1;
    
    // Don't show if user has already responded today
    if (state.hasUserResponded) {
      return false;
    }

    // Check if we already did a review today
    if (latestReview?.reviewDate) {
      const lastReviewDate = new Date(latestReview.reviewDate);
      const today = new Date();
      if (
        lastReviewDate.getDate() === today.getDate() &&
        lastReviewDate.getMonth() === today.getMonth() &&
        lastReviewDate.getFullYear() === today.getFullYear()
      ) {
        return false;
      }
    }

    // Check for calendar conflicts - delay prompt if user is busy
    if (calendarConflicts?.hasConflicts) {
      // Don't show prompt during meetings, will check again later
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
          timingPatterns: timingPatterns || [],
        }));
        return true;
      }
    }
    
    return false;
  }, [userSettings, state.hasUserResponded, state.isPromptVisible, getReviewContext, getSmartReviewTime, latestReview, calendarConflicts, timingPatterns]);

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
      isLearningEnabled: true,
      timingPatterns: [],
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

  // Get learning insights for display
  const getLearningInsights = useCallback(() => {
    if (!timingPatterns || timingPatterns.length === 0) {
      return null;
    }

    const dayOfWeek = new Date().getDay();
    const todayPattern = timingPatterns.find(p => p.dayOfWeek === dayOfWeek);
    
    if (!todayPattern || todayPattern.sampleCount < 2) {
      return null;
    }

    const insights: string[] = [];
    
    if (todayPattern.averageStartTime) {
      insights.push(`You typically start reviews at ${todayPattern.averageStartTime}`);
    }
    
    if (todayPattern.averageDuration) {
      insights.push(`Average review duration: ${todayPattern.averageDuration} minutes`);
    }
    
    if ((todayPattern.completionRate || 0) > 0.8) {
      insights.push('You usually complete reviews manually on this day');
    } else if ((todayPattern.autoProcessRate || 0) > 0.5) {
      insights.push('You often delegate reviews on this day');
    }

    return insights.length > 0 ? insights : null;
  }, [timingPatterns]);

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
    smartReviewTime: getSmartReviewTime(),
    learningInsights: getLearningInsights(),
    hasCalendarConflict: calendarConflicts?.hasConflicts || false,
  };
}

export type { ReviewContext, ChiefOfStaffState, TimingPattern };
