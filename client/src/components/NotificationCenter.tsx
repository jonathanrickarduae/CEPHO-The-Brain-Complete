import { useState, useEffect, useCallback } from 'react';
import { Bell, X, Check, AlertCircle, Info, Calendar, FileText, Users, CheckCircle2, Zap, Brain, Trophy, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { trpc } from '@/lib/trpc';

interface Notification {
  id: number;
  type: 'info' | 'success' | 'warning' | 'error' | 'task_assigned' | 'task_completed' | 'project_update' | 'integration_alert' | 'security_alert' | 'digital_twin' | 'daily_brief' | 'reminder' | 'achievement';
  title: string;
  message: string;
  createdAt: Date;
  read: boolean;
  readAt?: Date;
  actionUrl?: string;
  actionLabel?: string;
}

// Hook for managing notifications with backend
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch notifications from backend
  const { data: backendNotifications, refetch, isError } = trpc.notifications.list.useQuery(
    { limit: 50 },
    { 
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  // Handle data changes
  useEffect(() => {
    if (backendNotifications) {
      setNotifications(backendNotifications.map((n) => ({
        ...n,
        read: n.read ?? false,
        actionUrl: n.actionUrl ?? undefined,
        actionLabel: n.actionLabel ?? undefined,
        createdAt: new Date(n.createdAt),
        readAt: n.readAt ? new Date(n.readAt) : undefined,
      })));
      setIsLoading(false);
    }
  }, [backendNotifications]);

  // Handle errors - fallback to sample data
  useEffect(() => {
    if (isError) {
      setNotifications(getSampleNotifications());
      setIsLoading(false);
    }
  }, [isError]);

  const markReadMutation = trpc.notifications.markRead.useMutation({
    onSuccess: () => refetch(),
  });

  const markAllReadMutation = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => refetch(),
  });

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const markAsRead = useCallback((id: number) => {
    markReadMutation.mutate({ id });
    // Optimistic update
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true, readAt: new Date() } : n
    ));
  }, [markReadMutation]);

  const markAllAsRead = useCallback(() => {
    markAllReadMutation.mutate();
    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, read: true, readAt: new Date() })));
  }, [markAllReadMutation]);

  const dismiss = useCallback((id: number) => {
    // Mark as read when dismissed
    markAsRead(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, [markAsRead]);

  return { notifications, unreadCount, markAsRead, markAllAsRead, dismiss, isLoading, refetch };
}

// Sample notifications for fallback
function getSampleNotifications(): Notification[] {
  return [
    {
      id: 1,
      type: 'project_update',
      title: 'Project Update Required',
      message: 'Celadon project has 3 overdue tasks that need attention.',
      createdAt: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
      actionUrl: '/workflow',
    },
    {
      id: 2,
      type: 'daily_brief',
      title: 'The Signal Ready',
      message: 'Your morning briefing is ready. 5 action items for today.',
      createdAt: new Date(Date.now() - 1000 * 60 * 15),
      read: false,
      actionUrl: '/daily-brief',
    },
    {
      id: 3,
      type: 'task_completed',
      title: 'Document Ready',
      message: 'NDA for TechFlow Solutions has been generated and is ready for review.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60),
      read: false,
      actionUrl: '/project-genesis',
    },
    {
      id: 4,
      type: 'digital_twin',
      title: 'Training Milestone',
      message: 'Chief of Staff has reached 85% confidence on NDA reviews.',
      createdAt: new Date(Date.now() - 1000 * 60 * 120),
      read: false,
      actionUrl: '/qa-dashboard',
    },
    {
      id: 5,
      type: 'achievement',
      title: 'Achievement Unlocked',
      message: 'You\'ve completed 10 projects with Cepho!',
      createdAt: new Date(Date.now() - 1000 * 60 * 180),
      read: true,
    },
    {
      id: 6,
      type: 'integration_alert',
      title: 'Calendar Sync',
      message: 'Your calendar has been synced. 3 meetings scheduled for today.',
      createdAt: new Date(Date.now() - 1000 * 60 * 240),
      read: true,
      actionUrl: '/daily-brief',
    },
  ];
}

// Notification icon component
const NotificationIcon = ({ type }: { type: Notification['type'] }) => {
  switch (type) {
    case 'error': 
    case 'security_alert':
      return <AlertCircle className="w-4 h-4 text-red-400" />;
    case 'warning':
    case 'integration_alert':
      return <Zap className="w-4 h-4 text-amber-400" />;
    case 'success':
    case 'task_completed':
      return <CheckCircle2 className="w-4 h-4 text-green-400" />;
    case 'daily_brief':
    case 'reminder':
      return <Calendar className="w-4 h-4 text-blue-400" />;
    case 'project_update':
    case 'task_assigned':
      return <FileText className="w-4 h-4 text-purple-400" />;
    case 'digital_twin':
      return <Brain className="w-4 h-4 text-fuchsia-400" />;
    case 'achievement':
      return <Trophy className="w-4 h-4 text-yellow-400" />;
    default: 
      return <Info className="w-4 h-4 text-foreground/70" />;
  }
};

// Get priority from type
const getPriority = (type: Notification['type']): 'high' | 'medium' | 'low' => {
  switch (type) {
    case 'error':
    case 'security_alert':
      return 'high';
    case 'warning':
    case 'task_assigned':
    case 'project_update':
    case 'daily_brief':
      return 'medium';
    default:
      return 'low';
  }
};

// Time ago formatter
const timeAgo = (date: Date): string => {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { notifications, markAsRead, markAllAsRead, dismiss, isLoading } = useNotifications();

  if (!isOpen) return null;

  const handleAction = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
    onClose();
  };

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  return (
    <div className="absolute right-0 top-12 w-96 max-h-[70vh] bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
          {unreadNotifications.length > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-primary/20 text-primary rounded-full">
              {unreadNotifications.length} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadNotifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Mark all read
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Notification List */}
      <div className="overflow-y-auto max-h-[calc(70vh-60px)]">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No notifications yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">We'll notify you when something important happens</p>
          </div>
        ) : (
          <>
            {/* Unread Section */}
            {unreadNotifications.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-secondary/20 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  New
                </div>
                {unreadNotifications.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onAction={handleAction}
                    onDismiss={dismiss}
                  />
                ))}
              </div>
            )}

            {/* Read Section */}
            {readNotifications.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-secondary/10 text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
                  Earlier
                </div>
                {readNotifications.slice(0, 5).map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onAction={handleAction}
                    onDismiss={dismiss}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-border bg-secondary/20">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-muted-foreground hover:text-foreground"
            onClick={() => {
              window.location.href = '/settings';
              onClose();
            }}
          >
            Notification Settings
          </Button>
        </div>
      )}
    </div>
  );
}

// Individual notification item
function NotificationItem({ 
  notification, 
  onAction, 
  onDismiss 
}: { 
  notification: Notification; 
  onAction: (n: Notification) => void;
  onDismiss: (id: number) => void;
}) {
  const priority = getPriority(notification.type);

  return (
    <div
      className={`group relative p-4 border-b border-border/50 hover:bg-secondary/30 cursor-pointer transition-colors ${
        !notification.read ? 'bg-primary/5' : ''
      }`}
      onClick={() => onAction(notification)}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 p-2 rounded-lg ${
          priority === 'high' ? 'bg-red-500/20' :
          priority === 'medium' ? 'bg-amber-500/20' : 'bg-secondary'
        }`}>
          <NotificationIcon type={notification.type} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className={`font-medium text-sm truncate ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
              {notification.title}
            </p>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {timeAgo(notification.createdAt)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {notification.message}
          </p>
          {notification.actionLabel && (
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 mt-2 text-xs text-primary"
            >
              {notification.actionLabel} →
            </Button>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(notification.id);
          }}
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
      {!notification.read && (
        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
      )}
    </div>
  );
}

// Bell button for header
export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount } = useNotifications();

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-secondary"
      >
        <Bell className={`w-5 h-5 transition-colors ${unreadCount > 0 ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>
      <NotificationCenter isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
