import { useState } from 'react';
import { X, Smile, Frown, Meh, Sun, CloudSun, Moon } from 'lucide-react';
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

const MOOD_LEVELS = [
  { value: 1, emoji: '😫', label: 'Struggling', color: 'bg-red-500/20 border-red-500/50 hover:bg-red-500/30' },
  { value: 2, emoji: '😔', label: 'Low', color: 'bg-orange-500/20 border-orange-500/50 hover:bg-orange-500/30' },
  { value: 3, emoji: '😐', label: 'Okay', color: 'bg-yellow-500/20 border-yellow-500/50 hover:bg-yellow-500/30' },
  { value: 4, emoji: '🙂', label: 'Good', color: 'bg-lime-500/20 border-lime-500/50 hover:bg-lime-500/30' },
  { value: 5, emoji: '😊', label: 'Great', color: 'bg-green-500/20 border-green-500/50 hover:bg-green-500/30' },
  { value: 6, emoji: '😄', label: 'Excellent', color: 'bg-emerald-500/20 border-emerald-500/50 hover:bg-emerald-500/30' },
  { value: 7, emoji: '🤩', label: 'Amazing', color: 'bg-cyan-500/20 border-cyan-500/50 hover:bg-cyan-500/30' },
  { value: 8, emoji: '🔥', label: 'On Fire', color: 'bg-blue-500/20 border-blue-500/50 hover:bg-blue-500/30' },
  { value: 9, emoji: '💪', label: 'Unstoppable', color: 'bg-purple-500/20 border-purple-500/50 hover:bg-purple-500/30' },
  { value: 10, emoji: '🚀', label: 'At a 10!', color: 'bg-primary/20 border-primary/50 hover:bg-primary/30' },
];

export function MoodCheckModal({ isOpen, onClose, onSubmit, period }: MoodCheckModalProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);

  if (!isOpen || !period) return null;

  const config = PERIOD_CONFIG[period];
  const PeriodIcon = config.icon;

  const handleSubmit = () => {
    if (selectedMood !== null) {
      onSubmit(selectedMood);
      setSelectedMood(null);
    }
  };

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
              Quick Check-In
            </h2>
            <p className="text-muted-foreground text-sm">
              {config.question}
            </p>
          </div>

          {/* Mood Grid */}
          <div className="px-6 pb-4">
            <div className="grid grid-cols-5 gap-2">
              {MOOD_LEVELS.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => setSelectedMood(mood.value)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-3 rounded-xl border transition-all duration-200',
                    mood.color,
                    selectedMood === mood.value && 'ring-2 ring-primary scale-105'
                  )}
                >
                  <span className="text-2xl">{mood.emoji}</span>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {mood.value}
                  </span>
                </button>
              ))}
            </div>

            {/* Selected mood label */}
            {selectedMood !== null && (
              <div className="mt-4 text-center animate-in fade-in duration-200">
                <span className="text-lg font-bold text-foreground">
                  {MOOD_LEVELS.find(m => m.value === selectedMood)?.label}
                </span>
              </div>
            )}
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
              disabled={selectedMood === null}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              Log Mood
            </Button>
          </div>

          {/* Learning indicator */}
          <div className="px-6 pb-4">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              <span>Chief of Staff is learning your patterns</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
