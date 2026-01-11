import { useState, useEffect, useCallback } from 'react';

// Mood check times: Morning (8 AM), Midday (12 PM), Evening (6 PM)
const MOOD_CHECK_TIMES = [8, 12, 18];
const MOOD_CHECK_STORAGE_KEY = 'brain_mood_checks';

interface MoodEntry {
  timestamp: number;
  mood: number;
  period: 'morning' | 'midday' | 'evening';
}

interface MoodCheckState {
  lastChecks: MoodEntry[];
  shouldShowMoodCheck: boolean;
  currentPeriod: 'morning' | 'midday' | 'evening' | null;
}

function getCurrentPeriod(): 'morning' | 'midday' | 'evening' | null {
  const hour = new Date().getHours();
  
  // Morning: 6 AM - 11:59 AM
  if (hour >= 6 && hour < 12) return 'morning';
  // Midday: 12 PM - 5:59 PM
  if (hour >= 12 && hour < 18) return 'midday';
  // Evening: 6 PM - 10 PM
  if (hour >= 18 && hour <= 22) return 'evening';
  
  return null;
}

function getTodayStart(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

export function useMoodCheck() {
  const [state, setState] = useState<MoodCheckState>({
    lastChecks: [],
    shouldShowMoodCheck: false,
    currentPeriod: null,
  });

  // Load mood checks from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(MOOD_CHECK_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as MoodEntry[];
        const todayStart = getTodayStart();
        // Only keep today's checks
        const todayChecks = parsed.filter(entry => entry.timestamp >= todayStart);
        setState(prev => ({ ...prev, lastChecks: todayChecks }));
      } catch (e) {
        console.error('Failed to parse mood checks:', e);
      }
    }
  }, []);

  // Determine if we should show mood check
  useEffect(() => {
    const currentPeriod = getCurrentPeriod();
    const todayStart = getTodayStart();
    
    // Filter to only today's checks
    const todayChecks = state.lastChecks.filter(entry => entry.timestamp >= todayStart);
    
    // Check if we already have a check for the current period today
    const hasCheckedThisPeriod = currentPeriod && todayChecks.some(
      entry => entry.period === currentPeriod
    );
    
    setState(prev => ({
      ...prev,
      currentPeriod,
      shouldShowMoodCheck: currentPeriod !== null && !hasCheckedThisPeriod,
    }));
  }, [state.lastChecks]);

  const recordMoodCheck = useCallback((mood: number) => {
    const currentPeriod = getCurrentPeriod();
    if (!currentPeriod) return;

    const newEntry: MoodEntry = {
      timestamp: Date.now(),
      mood,
      period: currentPeriod,
    };

    setState(prev => {
      const todayStart = getTodayStart();
      const todayChecks = prev.lastChecks.filter(entry => entry.timestamp >= todayStart);
      const updatedChecks = [...todayChecks, newEntry];
      
      // Save to localStorage
      localStorage.setItem(MOOD_CHECK_STORAGE_KEY, JSON.stringify(updatedChecks));
      
      return {
        ...prev,
        lastChecks: updatedChecks,
        shouldShowMoodCheck: false,
      };
    });
  }, []);

  const dismissMoodCheck = useCallback(() => {
    setState(prev => ({ ...prev, shouldShowMoodCheck: false }));
  }, []);

  const getTodaysMoods = useCallback(() => {
    const todayStart = getTodayStart();
    return state.lastChecks.filter(entry => entry.timestamp >= todayStart);
  }, [state.lastChecks]);

  return {
    shouldShowMoodCheck: state.shouldShowMoodCheck,
    currentPeriod: state.currentPeriod,
    recordMoodCheck,
    dismissMoodCheck,
    getTodaysMoods,
    todaysMoods: getTodaysMoods(),
  };
}
