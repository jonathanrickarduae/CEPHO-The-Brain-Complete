import { 
  FolderOpen, FileText, Users, Inbox, Search, 
  Plus, Sparkles, Brain, Zap, Clock, Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type EmptyStateType = 
  | 'projects'
  | 'documents'
  | 'experts'
  | 'inbox'
  | 'search'
  | 'tasks'
  | 'insights'
  | 'training'
  | 'schedule'
  | 'goals';

interface EmptyStateConfig {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel?: string;
  secondaryActionLabel?: string;
  color: string;
  bgGradient: string;
}

const EMPTY_STATE_CONFIGS: Record<EmptyStateType, EmptyStateConfig> = {
  projects: {
    icon: FolderOpen,
    title: 'No projects yet',
    description: 'Start your first project and let your AI team help you bring it to life.',
    actionLabel: 'Create Project',
    secondaryActionLabel: 'Import from template',
    color: 'text-green-400',
    bgGradient: 'from-green-500/10 to-green-500/5',
  },
  documents: {
    icon: FileText,
    title: 'Your library is empty',
    description: 'Documents, research, and AI-generated content will appear here.',
    actionLabel: 'Upload Document',
    secondaryActionLabel: 'Generate with AI',
    color: 'text-pink-400',
    bgGradient: 'from-pink-500/10 to-pink-500/5',
  },
  experts: {
    icon: Users,
    title: 'No experts assigned',
    description: 'Assemble your AI expert team to tackle this project.',
    actionLabel: 'Browse Experts',
    color: 'text-cyan-400',
    bgGradient: 'from-cyan-500/10 to-cyan-500/5',
  },
  inbox: {
    icon: Inbox,
    title: 'All caught up!',
    description: 'No pending items require your attention. Your Chief of Staff is on it.',
    color: 'text-purple-400',
    bgGradient: 'from-purple-500/10 to-purple-500/5',
  },
  search: {
    icon: Search,
    title: 'No results found',
    description: 'Try adjusting your search terms or filters.',
    actionLabel: 'Clear filters',
    color: 'text-amber-400',
    bgGradient: 'from-amber-500/10 to-amber-500/5',
  },
  tasks: {
    icon: Zap,
    title: 'No tasks for today',
    description: 'Check your The Signal for new priorities, or create a task.',
    actionLabel: 'View The Signal',
    secondaryActionLabel: 'Add Task',
    color: 'text-amber-400',
    bgGradient: 'from-amber-500/10 to-amber-500/5',
  },
  insights: {
    icon: Sparkles,
    title: 'Insights coming soon',
    description: 'As you use Cepho more, your Chief of Staff will surface personalized insights here.',
    color: 'text-primary',
    bgGradient: 'from-primary/10 to-primary/5',
  },
  training: {
    icon: Brain,
    title: 'Start training your Twin',
    description: 'The more you interact, the smarter your Chief of Staff becomes. Start a conversation!',
    actionLabel: 'Talk to Twin',
    color: 'text-purple-400',
    bgGradient: 'from-purple-500/10 to-purple-500/5',
  },
  schedule: {
    icon: Clock,
    title: 'Nothing scheduled',
    description: 'Your calendar is clear. Add meetings or let your Twin manage your schedule.',
    actionLabel: 'Add Event',
    secondaryActionLabel: 'Sync Calendar',
    color: 'text-blue-400',
    bgGradient: 'from-blue-500/10 to-blue-500/5',
  },
  goals: {
    icon: Target,
    title: 'Set your first goal',
    description: 'Define what success looks like and let Cepho help you get there.',
    actionLabel: 'Create Goal',
    color: 'text-green-400',
    bgGradient: 'from-green-500/10 to-green-500/5',
  },
};

interface EmptyStateProps {
  type: EmptyStateType;
  onAction?: () => void;
  onSecondaryAction?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  customTitle?: string;
  customDescription?: string;
}

export function EmptyState({
  type,
  onAction,
  onSecondaryAction,
  className,
  size = 'md',
  customTitle,
  customDescription,
}: EmptyStateProps) {
  const config = EMPTY_STATE_CONFIGS[type];
  const Icon = config.icon;

  const sizeClasses = {
    sm: {
      container: 'py-8',
      icon: 'w-10 h-10',
      iconContainer: 'w-16 h-16',
      title: 'text-base',
      description: 'text-sm',
    },
    md: {
      container: 'py-12',
      icon: 'w-12 h-12',
      iconContainer: 'w-20 h-20',
      title: 'text-lg',
      description: 'text-sm',
    },
    lg: {
      container: 'py-16',
      icon: 'w-16 h-16',
      iconContainer: 'w-24 h-24',
      title: 'text-xl',
      description: 'text-base',
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center',
      sizes.container,
      className
    )}>
      {/* Animated icon container */}
      <div className={cn(
        'relative mb-6 rounded-2xl flex items-center justify-center',
        'bg-gradient-to-br border border-white/10',
        config.bgGradient,
        sizes.iconContainer
      )}>
        <Icon className={cn(sizes.icon, config.color, 'animate-pulse')} />
        
        {/* Decorative rings */}
        <div className={cn(
          'absolute inset-0 rounded-2xl border border-white/5 animate-ping',
          'animation-duration-[2s]'
        )} />
      </div>

      {/* Text */}
      <h3 className={cn('font-display font-bold text-foreground mb-2', sizes.title)}>
        {customTitle || config.title}
      </h3>
      <p className={cn('text-muted-foreground max-w-sm mb-6', sizes.description)}>
        {customDescription || config.description}
      </p>

      {/* Actions */}
      {(config.actionLabel || config.secondaryActionLabel) && (
        <div className="flex items-center gap-3">
          {config.actionLabel && onAction && (
            <Button onClick={onAction} className="gap-2">
              <Plus className="w-4 h-4" />
              {config.actionLabel}
            </Button>
          )}
          {config.secondaryActionLabel && onSecondaryAction && (
            <Button variant="outline" onClick={onSecondaryAction}>
              {config.secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Inline empty state for smaller sections
interface InlineEmptyStateProps {
  message: string;
  icon?: React.ComponentType<{ className?: string }>;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function InlineEmptyState({
  message,
  icon: Icon = Inbox,
  actionLabel,
  onAction,
  className,
}: InlineEmptyStateProps) {
  return (
    <div className={cn(
      'flex items-center justify-center gap-3 py-6 px-4',
      'text-muted-foreground text-sm',
      'bg-secondary/20 rounded-xl border border-dashed border-white/10',
      className
    )}>
      <Icon className="w-5 h-5 opacity-50" />
      <span>{message}</span>
      {actionLabel && onAction && (
        <Button variant="ghost" size="sm" onClick={onAction} className="ml-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

// Success state (opposite of empty - for completed items)
interface SuccessStateProps {
  title: string;
  description?: string;
  className?: string;
}

export function SuccessState({ title, description, className }: SuccessStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center py-12',
      className
    )}>
      <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
        <Sparkles className="w-8 h-8 text-green-400" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
      )}
    </div>
  );
}
