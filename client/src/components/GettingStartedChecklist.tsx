import { useState, useEffect } from 'react';
import { 
  CheckCircle2, Circle, ChevronRight, Sparkles, 
  Brain, MessageSquare, Calendar, Shield, Zap,
  X, Trophy
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useCelebration } from './CelebrationAnimations';

interface ChecklistItemData {
  id: string;
  title: string;
  description: string;
  iconName: string;
  action?: string; // Navigation path
  completed: boolean;
}

interface ChecklistItem extends ChecklistItemData {
  icon: React.ReactNode;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  brain: <Brain className="w-5 h-5" />,
  message: <MessageSquare className="w-5 h-5" />,
  calendar: <Calendar className="w-5 h-5" />,
  shield: <Shield className="w-5 h-5" />,
  zap: <Zap className="w-5 h-5" />,
};

const DEFAULT_ITEMS: ChecklistItemData[] = [
  {
    id: 'profile',
    title: 'Complete your profile',
    description: 'Add your name and preferences',
    iconName: 'brain',
    action: '/settings',
    completed: false,
  },
  {
    id: 'digital-twin',
    title: 'Chat with your Chief of Staff',
    description: 'Have your first conversation',
    iconName: 'message',
    action: '/digital-twin',
    completed: false,
  },
  {
    id: 'calendar',
    title: 'Connect your calendar',
    description: 'Sync Google or Outlook calendar',
    iconName: 'calendar',
    action: '/settings',
    completed: false,
  },
  {
    id: 'vault',
    title: 'Add something to the Vault',
    description: 'Store your first secure item',
    iconName: 'shield',
    action: '/vault',
    completed: false,
  },
  {
    id: 'review',
    title: 'Review a pending item',
    description: 'Approve or reject an AI suggestion',
    iconName: 'zap',
    action: '/review-queue',
    completed: false,
  },
];

interface GettingStartedChecklistProps {
  onDismiss?: () => void;
  compact?: boolean;
}

export function GettingStartedChecklist({ onDismiss, compact = false }: GettingStartedChecklistProps) {
  const [, setLocation] = useLocation();
  const { showAchievement } = useCelebration();
  const [itemsData, setItemsData] = useState<ChecklistItemData[]>(() => {
    const saved = localStorage.getItem('brain_onboarding_checklist');
    if (saved) {
      return JSON.parse(saved);
    }
    return DEFAULT_ITEMS;
  });

  // Convert data to items with icons
  const items: ChecklistItem[] = itemsData.map(item => ({
    ...item,
    icon: ICON_MAP[item.iconName] || <Zap className="w-5 h-5" />,
  }));

  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem('brain_onboarding_dismissed') === 'true';
  });

  // Save to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('brain_onboarding_checklist', JSON.stringify(itemsData));
  }, [itemsData]);

  const completedCount = items.filter(i => i.completed).length;
  const progress = (completedCount / items.length) * 100;
  const allCompleted = completedCount === items.length;

  const toggleItem = (id: string) => {
    setItemsData(prev => {
      const newItems = prev.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      );
      
      // Check if this completion triggers all done
      const newCompletedCount = newItems.filter(i => i.completed).length;
      if (newCompletedCount === newItems.length && completedCount < newItems.length) {
        showAchievement({
          title: 'Onboarding Complete!',
          description: 'You\'ve completed all getting started tasks!',
          icon: '🎉',
        });
      }
      
      return newItems;
    });
  };

  const handleItemClick = (item: ChecklistItem) => {
    if (item.action) {
      setLocation(item.action);
    }
    if (!item.completed) {
      toggleItem(item.id);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('brain_onboarding_dismissed', 'true');
    onDismiss?.();
  };

  if (dismissed && !compact) return null;

  // Compact version for sidebar or header
  if (compact) {
    return (
      <button
        onClick={() => setDismissed(false)}
        className="flex items-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
      >
        <div className="relative">
          <Sparkles className="w-4 h-4 text-primary" />
          {!allCompleted && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
          )}
        </div>
        <span className="text-sm text-foreground">{completedCount}/{items.length}</span>
      </button>
    );
  }

  return (
    <div className="bg-gradient-to-br from-primary/10 via-card to-purple-500/10 rounded-xl border border-primary/20 p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
      
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-lg transition-colors"
      >
        <X className="w-4 h-4 text-muted-foreground" />
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
          {allCompleted ? (
            <Trophy className="w-5 h-5 text-white" />
          ) : (
            <Sparkles className="w-5 h-5 text-white" />
          )}
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
            {allCompleted ? 'All Done!' : 'Getting Started'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {allCompleted 
              ? 'You\'ve completed the onboarding!' 
              : `${completedCount} of ${items.length} tasks completed`
            }
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
              item.completed 
                ? 'bg-green-500/10 hover:bg-green-500/20' 
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            {/* Checkbox */}
            <div className={`flex-shrink-0 ${item.completed ? 'text-green-400' : 'text-muted-foreground'}`}>
              {item.completed ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <Circle className="w-5 h-5" />
              )}
            </div>

            {/* Icon */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
              item.completed ? 'bg-green-500/20 text-green-400' : 'bg-primary/20 text-primary'
            }`}>
              {item.icon}
            </div>

            {/* Content */}
            <div className="flex-1 text-left">
              <p className={`font-medium ${item.completed ? 'text-green-400 line-through' : 'text-foreground'}`}>
                {item.title}
              </p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>

            {/* Arrow */}
            {!item.completed && item.action && (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        ))}
      </div>

      {/* Footer */}
      {allCompleted && (
        <div className="mt-4 pt-4 border-t border-white/10 text-center">
          <button
            onClick={handleDismiss}
            className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors text-sm"
          >
            Dismiss Checklist
          </button>
        </div>
      )}
    </div>
  );
}

// Hook to check if onboarding is complete
export function useOnboardingStatus() {
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeProjects, setActiveProjects] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('brain_onboarding_checklist');
    if (saved) {
      const items = JSON.parse(saved);
      const completed = items.filter((i: any) => i.completed).length;
      setProgress((completed / items.length) * 100);
      setIsComplete(completed === items.length);
    }
    
    // Get active projects count from localStorage
    const projects = localStorage.getItem('active_projects');
    if (projects) {
      setActiveProjects(parseInt(projects, 10));
    }
  }, []);

  return { isComplete, progress, activeProjects };
}
