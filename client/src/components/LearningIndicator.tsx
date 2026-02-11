import { useState, useEffect } from 'react';
import { Brain, Sparkles, TrendingUp, MessageSquare, Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LearningItem {
  id: string;
  type: 'pattern' | 'preference' | 'vocabulary' | 'decision' | 'timing';
  message: string;
  timestamp: Date;
}

interface LearningIndicatorProps {
  className?: string;
  variant?: 'badge' | 'panel' | 'toast';
  learningItems?: LearningItem[];
}

const TYPE_CONFIG = {
  pattern: { icon: TrendingUp, label: 'Pattern', color: 'text-cyan-400' },
  preference: { icon: Sparkles, label: 'Preference', color: 'text-purple-400' },
  vocabulary: { icon: MessageSquare, label: 'Vocabulary', color: 'text-pink-400' },
  decision: { icon: Brain, label: 'Decision', color: 'text-amber-400' },
  timing: { icon: Clock, label: 'Timing', color: 'text-green-400' },
};

// Badge variant - small indicator that shows learning is happening
export function LearningBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg',
        'bg-cyan-500/10 border border-cyan-500/20',
        'text-xs text-cyan-400',
        className
      )}
    >
      <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
      <span>Learning...</span>
    </div>
  );
}

// Panel variant - shows recent learning items
export function LearningPanel({
  learningItems = [],
  className,
}: {
  learningItems?: LearningItem[];
  className?: string;
}) {
  // Mock data if none provided
  const items = learningItems.length > 0 ? learningItems : [
    { id: '1', type: 'pattern' as const, message: 'You prefer morning meetings', timestamp: new Date() },
    { id: '2', type: 'vocabulary' as const, message: 'Added "synergy" to your vocabulary', timestamp: new Date() },
    { id: '3', type: 'decision' as const, message: 'You usually approve marketing budgets', timestamp: new Date() },
  ];

  return (
    <div
      className={cn(
        'bg-card/60 backdrop-blur-xl border border-white/10 rounded-xl p-4',
        className
      )}
    >
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-cyan-400" />
        <h3 className="font-display font-bold text-sm">Chief of Staff Learning</h3>
        <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse ml-auto" />
      </div>

      <div className="space-y-3">
        {items.slice(0, 5).map((item) => {
          const config = TYPE_CONFIG[item.type];
          const Icon = config.icon;

          return (
            <div
              key={item.id}
              className="flex items-start gap-3 p-2 rounded-lg bg-secondary/30"
            >
              <div className={cn('p-1.5 rounded-md bg-secondary/50', config.color)}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{item.message}</p>
                <p className="text-xs text-muted-foreground">
                  {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Total patterns learned: 247</span>
          <span>Accuracy: 94%</span>
        </div>
      </div>
    </div>
  );
}

// Toast variant - shows when something is learned
export function LearningToast({
  message,
  type = 'pattern',
  onClose,
  className,
}: {
  message: string;
  type?: keyof typeof TYPE_CONFIG;
  onClose?: () => void;
  className?: string;
}) {
  const config = TYPE_CONFIG[type];
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={cn(
        'fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50',
        'flex items-center gap-3 p-4 rounded-xl',
        'bg-card/95 backdrop-blur-xl border border-cyan-500/30 shadow-lg shadow-cyan-500/10',
        'animate-in slide-in-from-bottom-4 duration-300',
        className
      )}
    >
      <div className={cn('p-2 rounded-lg bg-cyan-500/20', config.color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <Brain className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-medium text-cyan-400">Chief of Staff Learned</span>
        </div>
        <p className="text-sm text-foreground truncate">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-secondary/50 transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}

// Hook to manage learning notifications
export function useLearningNotifications() {
  const [notifications, setNotifications] = useState<LearningItem[]>([]);
  const [currentToast, setCurrentToast] = useState<LearningItem | null>(null);

  const addLearning = (item: Omit<LearningItem, 'id' | 'timestamp'>) => {
    const newItem: LearningItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };
    setNotifications(prev => [newItem, ...prev].slice(0, 50));
    setCurrentToast(newItem);
  };

  const dismissToast = () => {
    setCurrentToast(null);
  };

  return {
    notifications,
    currentToast,
    addLearning,
    dismissToast,
  };
}
