import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import {
  Bell, X, Check, AlertTriangle, Info, CheckCircle,
  Clock, Calendar, FileText, FolderKanban, Settings,
  ChevronRight, Trash2, MoreHorizontal
} from 'lucide-react';

type NotificationType = 'info' | 'success' | 'warning' | 'action' | 'reminder';
type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message?: string;
  actionLabel?: string;
  actionPath?: string;
  timestamp: Date;
  read: boolean;
  category?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'notif-1',
      type: 'action',
      priority: 'high',
      title: '3 items require review',
      message: 'Review Queue has pending approvals',
      actionLabel: 'Review',
      actionPath: '/review-queue',
      timestamp: new Date(),
      read: false,
      category: 'tasks'
    },
    {
      id: 'notif-2',
      type: 'reminder',
      priority: 'normal',
      title: 'Board meeting tomorrow',
      message: '10:00 - Quarterly review',
      actionLabel: 'View',
      actionPath: '/daily-brief',
      timestamp: new Date(Date.now() - 3600000),
      read: false,
      category: 'calendar'
    },
    {
      id: 'notif-3',
      type: 'info',
      priority: 'low',
      title: 'WasteGen project created',
      message: 'Initial analysis complete',
      actionLabel: 'Open',
      actionPath: '/workflow',
      timestamp: new Date(Date.now() - 7200000),
      read: true,
      category: 'projects'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAll
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

// Notification Bell Component
export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const typeConfig: Record<NotificationType, { icon: typeof Info; color: string }> = {
    info: { icon: Info, color: 'text-blue-400' },
    success: { icon: CheckCircle, color: 'text-green-400' },
    warning: { icon: AlertTriangle, color: 'text-yellow-400' },
    action: { icon: Clock, color: 'text-orange-400' },
    reminder: { icon: Calendar, color: 'text-purple-400' },
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString('en-GB');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-700 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-96 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-primary hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-full text-xs transition-colors ${
                    filter === 'all'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-gray-700 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-3 py-1 rounded-full text-xs transition-colors ${
                    filter === 'unread'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-gray-700 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-auto">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredNotifications.map(notification => {
                    const config = typeConfig[notification.type];
                    const Icon = config.icon;

                    return (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-800/50 transition-colors ${
                          !notification.read ? 'bg-primary/5' : ''
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex gap-3">
                          <div className={`w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`w-4 h-4 ${config.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                  {notification.title}
                                </p>
                                {notification.message && (
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {notification.message}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeNotification(notification.id);
                                }}
                                className="p-1 hover:bg-gray-700 rounded transition-colors"
                              >
                                <X className="w-3 h-3 text-muted-foreground" />
                              </button>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-muted-foreground">
                                {formatTime(notification.timestamp)}
                              </span>
                              {notification.actionLabel && (
                                <a
                                  href={notification.actionPath}
                                  className="text-xs text-primary hover:underline flex items-center gap-1"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {notification.actionLabel}
                                  <ChevronRight className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-border">
              <a
                href="/settings"
                className="block text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Notification settings
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Toast Notification Component
export function ToastNotification({ 
  notification,
  onDismiss 
}: { 
  notification: Notification;
  onDismiss: () => void;
}) {
  const typeConfig: Record<NotificationType, { icon: typeof Info; bgColor: string }> = {
    info: { icon: Info, bgColor: 'bg-blue-500/10 border-blue-500/30' },
    success: { icon: CheckCircle, bgColor: 'bg-green-500/10 border-green-500/30' },
    warning: { icon: AlertTriangle, bgColor: 'bg-yellow-500/10 border-yellow-500/30' },
    action: { icon: Clock, bgColor: 'bg-orange-500/10 border-orange-500/30' },
    reminder: { icon: Calendar, bgColor: 'bg-purple-500/10 border-purple-500/30' },
  };

  const config = typeConfig[notification.type];
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className={`p-4 rounded-xl border ${config.bgColor} shadow-lg flex items-start gap-3 animate-slide-in`}>
      <Icon className="w-5 h-5 text-foreground flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{notification.title}</p>
        {notification.message && (
          <p className="text-xs text-muted-foreground mt-0.5">{notification.message}</p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="p-1 hover:bg-gray-700 rounded transition-colors"
      >
        <X className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  );
}
