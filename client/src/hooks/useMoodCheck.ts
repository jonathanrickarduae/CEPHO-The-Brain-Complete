import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/lib/trpc';

// Map period names between frontend and backend
type FrontendPeriod = 'morning' | 'midday' | 'evening';
type BackendPeriod = 'morning' | 'afternoon' | 'evening';

const periodMap: Record<FrontendPeriod, BackendPeriod> = {
  morning: 'morning',
  midday: 'afternoon',
  evening: 'evening',
};

const reversePeriodMap: Record<BackendPeriod, FrontendPeriod> = {
  morning: 'morning',
  afternoon: 'midday',
  evening: 'evening',
};

interface MoodCheckState {
  shouldShowMoodCheck: boolean;
  currentPeriod: FrontendPeriod | null;
  isLoading: boolean;
}

function getCurrentPeriod(): FrontendPeriod | null {
  const hour = new Date().getHours();
  
  // Morning: 6 AM - 11:59 AM
  if (hour >= 6 && hour < 12) return 'morning';
  // Midday: 12 PM - 5:59 PM
  if (hour >= 12 && hour < 18) return 'midday';
  // Evening: 6 PM - 10 PM
  if (hour >= 18 && hour <= 22) return 'evening';
  
  return null;
}

export function useMoodCheck() {
  const [state, setState] = useState<MoodCheckState>({
    shouldShowMoodCheck: false,
    currentPeriod: null,
    isLoading: true,
  });

  const utils = trpc.useUtils();
  
  // Get mood history for today
  const { data: moodHistory, isLoading: historyLoading } = trpc.mood.history.useQuery(
    { days: 1 },
    { 
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    }
  );

  // Get mood trends
  const { data: moodTrends } = trpc.mood.trends.useQuery(
    { days: 30 },
    { 
      staleTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
    }
  );

  // Create mood entry mutation
  const createMoodMutation = trpc.mood.create.useMutation({
    onSuccess: () => {
      // Invalidate queries to refresh data
      utils.mood.history.invalidate();
      utils.mood.trends.invalidate();
    },
  });

  // Mood check disabled by user request
  useEffect(() => {
    const currentPeriod = getCurrentPeriod();
    
    setState({
      currentPeriod,
      shouldShowMoodCheck: false, // DISABLED
      isLoading: false,
    });
  }, [moodHistory, historyLoading]);

  const recordMoodCheck = useCallback(async (mood: number) => {
    const currentPeriod = getCurrentPeriod();
    if (!currentPeriod) return;

    const backendPeriod = periodMap[currentPeriod];
    
    try {
      await createMoodMutation.mutateAsync({
        score: mood,
        timeOfDay: backendPeriod,
      });
      
      setState(prev => ({
        ...prev,
        shouldShowMoodCheck: false,
      }));
    } catch (error) {
      console.error('Failed to record mood check:', error);
      // Fallback to localStorage if API fails
      const stored = localStorage.getItem('brain_mood_checks_fallback');
      const existing = stored ? JSON.parse(stored) : [];
      existing.push({
        timestamp: Date.now(),
        mood,
        period: currentPeriod,
      });
      localStorage.setItem('brain_mood_checks_fallback', JSON.stringify(existing));
      
      setState(prev => ({
        ...prev,
        shouldShowMoodCheck: false,
      }));
    }
  }, [createMoodMutation]);

  const dismissMoodCheck = useCallback(() => {
    setState(prev => ({ ...prev, shouldShowMoodCheck: false }));
  }, []);

  const getTodaysMoods = useCallback(() => {
    if (!moodHistory) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return moodHistory
      .filter(entry => new Date(entry.createdAt) >= today)
      .map(entry => ({
        timestamp: new Date(entry.createdAt).getTime(),
        mood: entry.score,
        period: reversePeriodMap[entry.timeOfDay as BackendPeriod],
      }));
  }, [moodHistory]);

  return {
    shouldShowMoodCheck: state.shouldShowMoodCheck,
    currentPeriod: state.currentPeriod,
    recordMoodCheck,
    dismissMoodCheck,
    getTodaysMoods,
    todaysMoods: getTodaysMoods(),
    moodTrends,
    isLoading: state.isLoading,
    isSaving: createMoodMutation.isPending,
  };
}
