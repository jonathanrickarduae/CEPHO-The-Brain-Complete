import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { MorningBrief } from './MorningBrief';
import { EndOfDayWashUp } from './EndOfDayWashUp';
import { 
  startDailyCycle, 
  stopDailyCycle, 
  onMorningBrief, 
  onEndOfDay,
  triggerMorningBrief,
  triggerEndOfDay,
  getNextScheduledTimes
} from '@/services/dailyCycle';

interface DailyCycleContextType {
  showMorningBrief: boolean;
  showEndOfDay: boolean;
  triggerMorningBriefManually: () => void;
  triggerEndOfDayManually: () => void;
  nextMorningBrief: Date | null;
  nextEndOfDay: Date | null;
}

const DailyCycleContext = createContext<DailyCycleContextType | null>(null);

export function useDailyCycle() {
  const context = useContext(DailyCycleContext);
  if (!context) {
    throw new Error('useDailyCycle must be used within DailyCycleProvider');
  }
  return context;
}

interface DailyCycleProviderProps {
  children: ReactNode;
}

export function DailyCycleProvider({ children }: DailyCycleProviderProps) {
  const [showMorningBrief, setShowMorningBrief] = useState(false);
  const [showEndOfDay, setShowEndOfDay] = useState(false);
  const [nextTimes, setNextTimes] = useState<{ morningBrief: Date; endOfDay: Date } | null>(null);

  useEffect(() => {
    // Set up callbacks
    onMorningBrief(() => {
      setShowMorningBrief(true);
    });

    onEndOfDay(() => {
      setShowEndOfDay(true);
    });

    // Start the daily cycle
    startDailyCycle();

    // Get next scheduled times
    setNextTimes(getNextScheduledTimes());

    return () => {
      stopDailyCycle();
    };
  }, []);

  const handleMorningBriefDismiss = () => {
    setShowMorningBrief(false);
    setNextTimes(getNextScheduledTimes());
  };

  const handleEndOfDayComplete = (_rating: number, _tomorrowPriorities: string[]) => {
    // End of day data is saved through the evening review system
    setShowEndOfDay(false);
    setNextTimes(getNextScheduledTimes());
  };

  const triggerMorningBriefManually = () => {
    triggerMorningBrief();
  };

  const triggerEndOfDayManually = () => {
    triggerEndOfDay();
  };

  return (
    <DailyCycleContext.Provider value={{
      showMorningBrief,
      showEndOfDay,
      triggerMorningBriefManually,
      triggerEndOfDayManually,
      nextMorningBrief: nextTimes?.morningBrief || null,
      nextEndOfDay: nextTimes?.endOfDay || null
    }}>
      {children}
      
      {/* Morning Brief Modal */}
      <MorningBrief 
        isOpen={showMorningBrief} 
        onDismiss={handleMorningBriefDismiss} 
      />
      
      {/* End of Day Wash-Up Modal */}
      <EndOfDayWashUp 
        isOpen={showEndOfDay} 
        onComplete={handleEndOfDayComplete} 
      />
    </DailyCycleContext.Provider>
  );
}

export default DailyCycleProvider;
