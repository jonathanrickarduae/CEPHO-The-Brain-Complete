import { ReactNode } from 'react';
import { 
  Inbox, FolderOpen, FileText, Users, Calendar, 
  MessageSquare, Bell, Mic, Brain, Sparkles,
  Plus, ArrowRight, Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  tip?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  tip,
  className,
  size = 'md',
}: EmptyStateProps) {
  const sizeClasses = {
    sm: 'py-6 px-4',
    md: 'py-12 px-6',
    lg: 'py-16 px-8',
  };

  const iconSizes = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center',
      sizeClasses[size],
      className
    )}>
      {/* Icon */}
      {icon && (
        <div className={cn(
          'rounded-full bg-primary/10 flex items-center justify-center mb-4',
          iconSizes[size]
        )}>
          <div className="text-primary">{icon}</div>
        </div>
      )}

      {/* Title & Description */}
      <h3 className={cn(
        'font-semibold text-foreground mb-2',
        size === 'sm' ? 'text-base' : size === 'md' ? 'text-lg' : 'text-xl'
      )}>
        {title}
      </h3>
      <p className={cn(
        'text-muted-foreground max-w-sm',
        size === 'sm' ? 'text-xs' : 'text-sm'
      )}>
        {description}
      </p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3 mt-6">
          {secondaryAction && (
            <Button variant="ghost" size={size === 'sm' ? 'sm' : 'default'} onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
          {action && (
            <Button size={size === 'sm' ? 'sm' : 'default'} onClick={action.onClick}>
              {action.icon || <Plus className="w-4 h-4 mr-2" />}
              {action.label}
            </Button>
          )}
        </div>
      )}

      {/* Tip */}
      {tip && (
        <div className="flex items-center gap-2 mt-6 text-xs text-muted-foreground bg-secondary/30 px-3 py-2 rounded-full">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          {tip}
        </div>
      )}
    </div>
  );
}

// Pre-built empty states for common scenarios
export function EmptyInbox({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={<Inbox className="w-8 h-8" />}
      title="Inbox Zero!"
      description="You're all caught up. New items from email, integrations, and AI suggestions will appear here."
      action={onAction ? { label: 'Check Integrations', onClick: onAction } : undefined}
      tip="Connect your email to automatically capture action items"
    />
  );
}

export function EmptyProjects({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={<FolderOpen className="w-8 h-8" />}
      title="No projects yet"
      description="Start your first project with Project Genesis to see it here. Your AI team is ready to help."
      action={onAction ? { label: 'Start Project Genesis', onClick: onAction, icon: <Sparkles className="w-4 h-4 mr-2" /> } : undefined}
      tip="Projects created through Project Genesis include automatic deliverables"
    />
  );
}

export function EmptyDocuments({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={<FileText className="w-8 h-8" />}
      title="No documents"
      description="Upload documents to train your Chief of Staff or store in the Library for easy access."
      action={onAction ? { label: 'Upload Document', onClick: onAction } : undefined}
    />
  );
}

export function EmptyTeam({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={<Users className="w-8 h-8" />}
      title="No team assembled"
      description="Select AI Experts to form your project team. Each expert brings unique skills and perspectives."
      action={onAction ? { label: 'Browse Experts', onClick: onAction } : undefined}
    />
  );
}

export function EmptyCalendar({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={<Calendar className="w-8 h-8" />}
      title="No events scheduled"
      description="Connect your calendar to see meetings and deadlines, or create events directly."
      action={onAction ? { label: 'Connect Calendar', onClick: onAction } : undefined}
      tip="Your Chief of Staff can prepare briefings before meetings"
    />
  );
}

export function EmptyConversations({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={<MessageSquare className="w-8 h-8" />}
      title="Start a conversation"
      description="Chat with your Chief of Staff to get things done. It learns from every interaction."
      action={onAction ? { label: 'Say Hello', onClick: onAction, icon: <ArrowRight className="w-4 h-4 mr-2" /> } : undefined}
    />
  );
}

export function EmptyNotifications() {
  return (
    <EmptyState
      icon={<Bell className="w-8 h-8" />}
      title="No notifications"
      description="You're all caught up! Notifications about projects, tasks, and AI activity will appear here."
      size="sm"
    />
  );
}

export function EmptyVoiceNotes({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={<Mic className="w-8 h-8" />}
      title="No voice notes yet"
      description="Capture thoughts throughout your day. Your Chief of Staff uses these for context."
      action={onAction ? { label: 'Record Note', onClick: onAction } : undefined}
      tip="Voice notes are automatically categorized and searchable"
    />
  );
}

export function EmptyTrainingData({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={<Brain className="w-8 h-8" />}
      title="Train your Chief of Staff"
      description="Upload documents, complete interviews, or chat to help your Twin learn your preferences and style."
      action={onAction ? { label: 'Start Training', onClick: onAction } : undefined}
      tip="More training data = more accurate and autonomous responses"
    />
  );
}

export function EmptySearchResults({ query, onClear }: { query: string; onClear?: () => void }) {
  return (
    <EmptyState
      icon={<Sparkles className="w-8 h-8" />}
      title={`No results for "${query}"`}
      description="Try different keywords or check your filters. Your Chief of Staff can help find what you're looking for."
      action={onClear ? { label: 'Clear Search', onClick: onClear } : undefined}
      size="sm"
    />
  );
}
