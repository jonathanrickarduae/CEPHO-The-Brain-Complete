import { useEffect, useState } from 'react';
import { X, Bell, Lightbulb, Trophy, Clock, AlertTriangle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { haptics } from '@/lib/haptics';

type NotificationType = 'reminder' | 'insight' | 'achievement' | 'nudge' | 'alert';
type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

interface NotificationToastProps {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  icon?: string;
  actionLabel?: string;
  actionUrl?: string;
  onDismiss: (id: string) => void;
  onAction?: () => void;
  autoDismiss?: boolean;
  autoDismissDelay?: number;
}

const TYPE_ICONS: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  reminder: Clock,
  insight: Lightbulb,
  achievement: Trophy,
  nudge: Bell,
  alert: AlertTriangle,
};

const TYPE_COLORS: Record<NotificationType, string> = {
  reminder: 'border-amber-500/30 bg-amber-500/10',
  insight: 'border-cyan-500/30 bg-cyan-500/10',
  achievement: 'border-purple-500/30 bg-purple-500/10',
  nudge: 'border-primary/30 bg-primary/10',
  alert: 'border-red-500/30 bg-red-500/10',
};

const PRIORITY_STYLES: Record<NotificationPriority, string> = {
  low: '',
  medium: '',
  high: 'ring-1 ring-primary/50',
  urgent: 'ring-2 ring-red-500 animate-pulse',
};

export function NotificationToast({
  id,
  type,
  title,
  message,
  priority,
  icon,
  actionLabel,
  actionUrl,
  onDismiss,
  onAction,
  autoDismiss = true,
  autoDismissDelay = 5000,
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const Icon = TYPE_ICONS[type];

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => setIsVisible(true));
    
    // Haptic feedback
    if (priority === 'urgent') {
      haptics.warning();
    } else if (priority === 'high') {
      haptics.press();
    } else {
      haptics.tap();
    }

    // Auto dismiss
    if (autoDismiss && priority !== 'urgent') {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoDismissDelay);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, autoDismissDelay, priority]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(id);
    }, 300);
  };

  const handleAction = () => {
    if (actionUrl) {
      window.location.href = actionUrl;
    }
    onAction?.();
    handleDismiss();
  };

  return (
    <div
      className={cn(
        'fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50',
        'w-[calc(100%-2rem)] md:w-96 max-w-sm',
        'transform transition-all duration-300 ease-out',
        isVisible && !isExiting
          ? 'translate-y-0 opacity-100'
          : 'translate-y-4 opacity-0'
      )}
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-xl border backdrop-blur-xl shadow-lg',
          TYPE_COLORS[type],
          PRIORITY_STYLES[priority]
        )}
      >
        {/* Progress bar for auto-dismiss */}
        {autoDismiss && priority !== 'urgent' && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/10">
            <div
              className="h-full bg-primary transition-all ease-linear"
              style={{
                width: '100%',
                animation: `shrink ${autoDismissDelay}ms linear forwards`,
              }}
            />
          </div>
        )}

        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={cn(
              'shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
              'bg-white/10'
            )}>
              {icon ? (
                <span className="text-xl">{icon}</span>
              ) : (
                <Icon className="w-5 h-5 text-foreground" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground text-sm mb-0.5">
                {title}
              </h4>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {message}
              </p>

              {/* Action button */}
              {actionLabel && (
                <button
                  onClick={handleAction}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  {actionLabel}
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Dismiss button */}
            <button
              onClick={handleDismiss}
              className="shrink-0 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Notification center component
interface NotificationCenterProps {
  notifications: Array<{
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    priority: NotificationPriority;
    timestamp: Date;
    read: boolean;
    icon?: string;
    actionLabel?: string;
    actionUrl?: string;
  }>;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
  onClearAll: () => void;
}

export function NotificationCenter({
  notifications,
  isOpen,
  onClose,
  onMarkAsRead,
  onDismiss,
  onClearAll,
}: NotificationCenterProps) {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:bg-transparent"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-card border-l border-white/10 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="shrink-0 px-6 py-4 border-b border-white/10 bg-card/95 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-primary" />
              <div>
                <h2 className="font-bold text-foreground">Notifications</h2>
                {unreadCount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {unreadCount} unread
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <Button variant="ghost" size="sm" onClick={onClearAll}>
                  Clear all
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <Bell className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No notifications</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                You're all caught up!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  {...notification}
                  onMarkAsRead={onMarkAsRead}
                  onDismiss={onDismiss}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Individual notification item
interface NotificationItemProps {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  icon?: string;
  actionLabel?: string;
  actionUrl?: string;
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
}

function NotificationItem({
  id,
  type,
  title,
  message,
  timestamp,
  read,
  icon,
  actionLabel,
  actionUrl,
  onMarkAsRead,
  onDismiss,
}: NotificationItemProps) {
  const Icon = TYPE_ICONS[type];

  const handleClick = () => {
    if (!read) {
      onMarkAsRead(id);
    }
    if (actionUrl) {
      window.location.href = actionUrl;
    }
  };

  const timeAgo = formatTimeAgo(timestamp);

  return (
    <div
      className={cn(
        'relative p-4 hover:bg-secondary/30 transition-colors cursor-pointer',
        !read && 'bg-primary/5'
      )}
      onClick={handleClick}
    >
      {/* Unread indicator */}
      {!read && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
      )}

      <div className="flex items-start gap-3 pl-4">
        {/* Icon */}
        <div className={cn(
          'shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
          TYPE_COLORS[type]
        )}>
          {icon ? (
            <span className="text-lg">{icon}</span>
          ) : (
            <Icon className="w-4 h-4" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={cn(
              'text-sm',
              read ? 'text-muted-foreground' : 'font-medium text-foreground'
            )}>
              {title}
            </h4>
            <span className="shrink-0 text-xs text-muted-foreground">
              {timeAgo}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {message}
          </p>
          {actionLabel && (
            <span className="inline-flex items-center gap-1 mt-1 text-xs text-primary">
              {actionLabel}
              <ChevronRight className="w-3 h-3" />
            </span>
          )}
        </div>

        {/* Dismiss */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(id);
          }}
          className="shrink-0 p-1 rounded text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString('en-GB');
}

// Add CSS for shrink animation
const style = document.createElement('style');
style.textContent = `
  @keyframes shrink {
    from { width: 100%; }
    to { width: 0%; }
  }
`;
if (typeof document !== 'undefined') {
  document.head.appendChild(style);
}
