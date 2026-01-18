import { cn } from '@/lib/utils';
import { 
  CheckCircle, Clock, AlertCircle, XCircle, 
  Pause, Play, Loader2, Circle
} from 'lucide-react';

type StatusType = 
  | 'completed' | 'done' | 'success' | 'approved'
  | 'in_progress' | 'active' | 'running' | 'processing'
  | 'pending' | 'waiting' | 'queued'
  | 'paused' | 'on_hold'
  | 'failed' | 'error' | 'rejected'
  | 'warning' | 'attention'
  | 'draft' | 'new';

interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  pulse?: boolean;
  className?: string;
}

const statusConfig: Record<string, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  colors: string;
  iconColors: string;
}> = {
  // Success states
  completed: { label: 'Completed', icon: CheckCircle, colors: 'bg-green-500/10 text-green-400 border-green-500/30', iconColors: 'text-green-400' },
  done: { label: 'Done', icon: CheckCircle, colors: 'bg-green-500/10 text-green-400 border-green-500/30', iconColors: 'text-green-400' },
  success: { label: 'Success', icon: CheckCircle, colors: 'bg-green-500/10 text-green-400 border-green-500/30', iconColors: 'text-green-400' },
  approved: { label: 'Approved', icon: CheckCircle, colors: 'bg-green-500/10 text-green-400 border-green-500/30', iconColors: 'text-green-400' },
  
  // Active states
  in_progress: { label: 'In Progress', icon: Loader2, colors: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30', iconColors: 'text-cyan-400' },
  active: { label: 'Active', icon: Play, colors: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30', iconColors: 'text-cyan-400' },
  running: { label: 'Running', icon: Loader2, colors: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30', iconColors: 'text-cyan-400' },
  processing: { label: 'Processing', icon: Loader2, colors: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30', iconColors: 'text-cyan-400' },
  
  // Pending states
  pending: { label: 'Pending', icon: Clock, colors: 'bg-amber-500/10 text-amber-400 border-amber-500/30', iconColors: 'text-amber-400' },
  waiting: { label: 'Waiting', icon: Clock, colors: 'bg-amber-500/10 text-amber-400 border-amber-500/30', iconColors: 'text-amber-400' },
  queued: { label: 'Queued', icon: Clock, colors: 'bg-amber-500/10 text-amber-400 border-amber-500/30', iconColors: 'text-amber-400' },
  
  // Paused states
  paused: { label: 'Paused', icon: Pause, colors: 'bg-gray-500/10 text-foreground/70 border-gray-500/30', iconColors: 'text-foreground/70' },
  on_hold: { label: 'On Hold', icon: Pause, colors: 'bg-gray-500/10 text-foreground/70 border-gray-500/30', iconColors: 'text-foreground/70' },
  
  // Error states
  failed: { label: 'Failed', icon: XCircle, colors: 'bg-red-500/10 text-red-400 border-red-500/30', iconColors: 'text-red-400' },
  error: { label: 'Error', icon: XCircle, colors: 'bg-red-500/10 text-red-400 border-red-500/30', iconColors: 'text-red-400' },
  rejected: { label: 'Rejected', icon: XCircle, colors: 'bg-red-500/10 text-red-400 border-red-500/30', iconColors: 'text-red-400' },
  
  // Warning states
  warning: { label: 'Warning', icon: AlertCircle, colors: 'bg-amber-500/10 text-amber-400 border-amber-500/30', iconColors: 'text-amber-400' },
  attention: { label: 'Attention', icon: AlertCircle, colors: 'bg-amber-500/10 text-amber-400 border-amber-500/30', iconColors: 'text-amber-400' },
  
  // Draft states
  draft: { label: 'Draft', icon: Circle, colors: 'bg-gray-500/10 text-foreground/70 border-gray-500/30', iconColors: 'text-foreground/70' },
  new: { label: 'New', icon: Circle, colors: 'bg-purple-500/10 text-purple-400 border-purple-500/30', iconColors: 'text-purple-400' },
};

export function StatusBadge({
  status,
  label,
  size = 'md',
  showIcon = true,
  pulse = false,
  className,
}: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_');
  const config = statusConfig[normalizedStatus] || {
    label: status,
    icon: Circle,
    colors: 'bg-gray-500/10 text-foreground/70 border-gray-500/30',
    iconColors: 'text-foreground/70',
  };

  const Icon = config.icon;
  const displayLabel = label || config.label;
  
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  const isAnimated = ['in_progress', 'running', 'processing'].includes(normalizedStatus);

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        config.colors,
        sizeClasses[size],
        pulse && 'animate-pulse',
        className
      )}
    >
      {showIcon && (
        <Icon 
          className={cn(
            iconSizes[size],
            config.iconColors,
            isAnimated && 'animate-spin'
          )} 
        />
      )}
      {displayLabel}
    </span>
  );
}

// Health badge for project health indicators
type HealthType = 'green' | 'yellow' | 'red' | 'gray';

interface HealthBadgeProps {
  health: HealthType;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const healthConfig: Record<HealthType, { label: string; colors: string; dotColor: string }> = {
  green: { label: 'Healthy', colors: 'bg-green-500/10 text-green-400 border-green-500/30', dotColor: 'bg-green-400' },
  yellow: { label: 'At Risk', colors: 'bg-amber-500/10 text-amber-400 border-amber-500/30', dotColor: 'bg-amber-400' },
  red: { label: 'Critical', colors: 'bg-red-500/10 text-red-400 border-red-500/30', dotColor: 'bg-red-400' },
  gray: { label: 'Unknown', colors: 'bg-gray-500/10 text-foreground/70 border-gray-500/30', dotColor: 'bg-gray-400' },
};

export function HealthBadge({
  health,
  label,
  size = 'md',
  className,
}: HealthBadgeProps) {
  const config = healthConfig[health];
  const displayLabel = label || config.label;

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        config.colors,
        sizeClasses[size],
        className
      )}
    >
      <span className={cn('rounded-full', config.dotColor, dotSizes[size])} />
      {displayLabel}
    </span>
  );
}

// Priority badge
type PriorityType = 'urgent' | 'high' | 'medium' | 'low';

interface PriorityBadgeProps {
  priority: PriorityType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const priorityConfig: Record<PriorityType, { label: string; colors: string }> = {
  urgent: { label: 'Urgent', colors: 'bg-red-500/10 text-red-400 border-red-500/30' },
  high: { label: 'High', colors: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  medium: { label: 'Medium', colors: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
  low: { label: 'Low', colors: 'bg-gray-500/10 text-foreground/70 border-gray-500/30' },
};

export function PriorityBadge({
  priority,
  size = 'md',
  className,
}: PriorityBadgeProps) {
  const config = priorityConfig[priority];

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        config.colors,
        sizeClasses[size],
        className
      )}
    >
      {config.label}
    </span>
  );
}
