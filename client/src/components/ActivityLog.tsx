import { useState } from 'react';
import { 
  Activity, 
  Brain, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Undo2, 
  Filter,
  ChevronDown,
  Bot,
  User,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  type: 'twin_action' | 'user_action' | 'learning' | 'decision' | 'automation';
  title: string;
  description?: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'undone';
  canUndo?: boolean;
  metadata?: Record<string, any>;
}

interface ActivityLogProps {
  activities?: ActivityItem[];
  onUndo?: (id: string) => void;
  className?: string;
  maxItems?: number;
}

const TYPE_CONFIG = {
  twin_action: { 
    icon: Bot, 
    label: 'Chief of Staff', 
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
  },
  user_action: { 
    icon: User, 
    label: 'You', 
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
  },
  learning: { 
    icon: Brain, 
    label: 'Learning', 
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/20',
  },
  decision: { 
    icon: CheckCircle2, 
    label: 'Decision', 
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
  },
  automation: { 
    icon: Zap, 
    label: 'Automation', 
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
  },
};

// Mock activities for demonstration
const MOCK_ACTIVITIES: ActivityItem[] = [
  {
    id: '1',
    type: 'twin_action',
    title: 'Scheduled meeting with Sarah',
    description: 'Based on your preference for morning meetings',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    status: 'completed',
    canUndo: true,
  },
  {
    id: '2',
    type: 'learning',
    title: 'Learned new communication pattern',
    description: 'You prefer concise emails under 100 words',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    status: 'completed',
    canUndo: false,
  },
  {
    id: '3',
    type: 'decision',
    title: 'Approved marketing budget',
    description: 'Q1 2026 marketing spend - $50,000',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    status: 'completed',
    canUndo: true,
  },
  {
    id: '4',
    type: 'automation',
    title: 'Generated daily brief',
    description: '12 items summarized, 3 action items identified',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    status: 'completed',
    canUndo: false,
  },
  {
    id: '5',
    type: 'twin_action',
    title: 'Drafted response to investor inquiry',
    description: 'Awaiting your review before sending',
    timestamp: new Date(Date.now() - 1000 * 60 * 90),
    status: 'pending',
    canUndo: true,
  },
];

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return date.toLocaleDateString('en-GB');
}

export function ActivityLog({
  activities = MOCK_ACTIVITIES,
  onUndo,
  className,
  maxItems = 10,
}: ActivityLogProps) {
  const [filter, setFilter] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredActivities = filter
    ? activities.filter(a => a.type === filter)
    : activities;

  const displayedActivities = isExpanded
    ? filteredActivities
    : filteredActivities.slice(0, maxItems);

  return (
    <div className={cn('bg-card/60 backdrop-blur-xl border border-white/10 rounded-xl', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold">Activity Log</h3>
          <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
            {activities.length}
          </span>
        </div>

        {/* Filter dropdown */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-xs"
            onClick={() => setFilter(filter ? null : 'twin_action')}
          >
            <Filter className="w-3.5 h-3.5" />
            {filter ? TYPE_CONFIG[filter as keyof typeof TYPE_CONFIG]?.label : 'All'}
            <ChevronDown className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-white/5">
        {displayedActivities.map((activity) => {
          const config = TYPE_CONFIG[activity.type];
          const Icon = config.icon;

          return (
            <div
              key={activity.id}
              className={cn(
                'flex items-start gap-3 p-4 transition-colors',
                activity.status === 'pending' && 'bg-amber-500/5'
              )}
            >
              <div className={cn('p-2 rounded-lg', config.bgColor, config.color)}>
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={cn('text-xs font-medium', config.color)}>
                    {config.label}
                  </span>
                  {activity.status === 'pending' && (
                    <span className="text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">
                      Pending
                    </span>
                  )}
                  {activity.status === 'undone' && (
                    <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">
                      Undone
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground font-medium">{activity.title}</p>
                {activity.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{activity.description}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
              </div>

              {activity.canUndo && activity.status !== 'undone' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => onUndo?.(activity.id)}
                >
                  <Undo2 className="w-3.5 h-3.5 mr-1" />
                  Undo
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Show More */}
      {filteredActivities.length > maxItems && (
        <div className="p-3 border-t border-white/10">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Show Less' : `Show ${filteredActivities.length - maxItems} More`}
          </Button>
        </div>
      )}
    </div>
  );
}

// Compact inline activity indicator
export function ActivityIndicator({
  count = 3,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg',
        'bg-secondary/50 border border-white/10',
        'text-xs text-muted-foreground',
        className
      )}
    >
      <Activity className="w-3.5 h-3.5" />
      <span>{count} actions today</span>
    </div>
  );
}
