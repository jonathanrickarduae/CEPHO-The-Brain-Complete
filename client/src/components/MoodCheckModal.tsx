import { useState } from 'react';
import { X, Sun, CloudSun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MoodCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (mood: number) => void;
  period: 'morning' | 'midday' | 'evening' | null;
}

const PERIOD_CONFIG = {
  morning: {
    icon: Sun,
    greeting: 'Good Morning',
    question: 'How are you feeling as you start your day?',
    color: 'text-amber-400',
  },
  midday: {
    icon: CloudSun,
    greeting: 'Good Afternoon',
    question: 'How is your day going so far?',
    color: 'text-cyan-400',
  },
  evening: {
    icon: Moon,
    greeting: 'Good Evening',
    question: 'How are you feeling as the day winds down?',
    color: 'text-purple-400',
  },
};

// No labels - just the number

export function MoodCheckModal({ isOpen, onClose, onSubmit, period }: MoodCheckModalProps) {
  const [selectedMood, setSelectedMood] = useState<number>(50); // 0-100 scale

  if (!isOpen || !period) return null;

  const config = PERIOD_CONFIG[period];
  const PeriodIcon = config.icon;

  const handleSubmit = () => {
    onSubmit(selectedMood);
    setSelectedMood(50);
  };

  // Calculate gradient position based on mood
  const gradientPosition = (selectedMood / 100) * 100; // 0-100 scale

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary/50 transition-colors z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Header */}
          <div className="p-6 pb-4 text-center">
            <div className={cn('inline-flex items-center gap-2 mb-3', config.color)}>
              <PeriodIcon className="w-6 h-6" />
              <span className="text-lg font-display font-bold">{config.greeting}</span>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              How are you today?
            </h2>
          </div>

          {/* Mood Slider */}
          <div className="px-8 pb-6">
            {/* Current Value Display */}
            <div className="text-center mb-6">
              <div className="text-6xl font-bold text-foreground">
                {selectedMood}
              </div>
            </div>

            {/* Slider Track */}
            <div className="relative">
              {/* Background track */}
              <div className="h-2 rounded-full bg-secondary/50 relative overflow-hidden">
                {/* Gradient fill */}
                <div 
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-150"
                  style={{
                    width: `${gradientPosition}%`,
                    background: `linear-gradient(90deg, 
                      rgb(239, 68, 68) 0%, 
                      rgb(249, 115, 22) 25%, 
                      rgb(234, 179, 8) 50%, 
                      rgb(34, 197, 94) 75%, 
                      rgb(255, 16, 240) 100%
                    )`,
                  }}
                />
              </div>

              {/* Range Input */}
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={selectedMood}
                onChange={(e) => setSelectedMood(parseInt(e.target.value))}
                className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
                style={{ margin: 0 }}
              />

              {/* Custom Thumb */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white shadow-lg border-2 border-primary pointer-events-none transition-all duration-150"
                style={{ 
                  left: `calc(${gradientPosition}% - 12px)`,
                }}
              />
            </div>

            {/* Scale Labels */}
            <div className="flex justify-between mt-3 text-xs text-muted-foreground">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 pt-2 flex gap-3">
            <Button
              variant="ghost"
              onClick={onClose}
              className="flex-1"
            >
              Skip
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              Log
            </Button>
          </div>

          {/* Learning indicator */}
          <div className="px-6 pb-4">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" />
              <span>Chief of Staff is learning your patterns</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
