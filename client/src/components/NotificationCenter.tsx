import { useState, useEffect, useCallback } from 'react';
import { Bell, X, Check, AlertCircle, Info, Calendar, FileText, Users } from 'lucide-react';
import { Button } from './ui/button';

interface Notification {
  id: string;
  type: 'alert' | 'info' | 'calendar' | 'document' | 'project' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  priority: 'high' | 'medium' | 'low';
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Load from localStorage
    const stored = localStorage.getItem('brain_notifications');
    if (stored) {
      const parsed = JSON.parse(stored);
      setNotifications(parsed.map((n: any) => ({ ...n, timestamp: new Date(n.timestamp) })));
    } else {
      // Initial sample notifications
      const initial: Notification[] = [
        {
          id: '1',
          type: 'project',
          title: 'Project Update Required',
          message: 'Celadon project has 3 overdue tasks.',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          read: false,
          actionUrl: '/workflow',
          priority: 'high'
        },
        {
          id: '2',
          type: 'calendar',
          title: 'Meeting in 1 hour',
          message: 'Board review call scheduled for 3:00 PM.',
          timestamp: new Date(Date.now() - 1000 * 60 * 15),
          read: false,
          priority: 'medium'
        },
        {
          id: '3',
          type: 'document',
          title: 'Document Ready',
          message: 'NDA for TechFlow Solutions is ready for signature.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
          read: false,
          actionUrl: '/project-genesis',
          priority: 'medium'
        },
        {
          id: '4',
          type: 'info',
          title: 'Training Progress',
          message: 'Digital Twin training: 127 hours completed.',
          timestamp: new Date(Date.now() - 1000 * 60 * 120),
          read: true,
          actionUrl: '/digital-twin',
          priority: 'low'
        }
      ];
      setNotifications(initial);
    }
  }, []);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
    localStorage.setItem('brain_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  return { notifications, unreadCount, markAsRead, markAllAsRead, dismiss, addNotification };
}

// Notification icon component
const NotificationIcon = ({ type }: { type: Notification['type'] }) => {
  switch (type) {
    case 'alert': return <AlertCircle className="w-4 h-4 text-red-400" />;
    case 'calendar': return <Calendar className="w-4 h-4 text-blue-400" />;
    case 'document': return <FileText className="w-4 h-4 text-green-400" />;
    case 'project': return <Users className="w-4 h-4 text-purple-400" />;
    default: return <Info className="w-4 h-4 text-gray-400" />;
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
  const { notifications, markAsRead, markAllAsRead, dismiss } = useNotifications();
  const [, setLocation] = useState('');

  if (!isOpen) return null;

  const handleAction = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
    onClose();
  };

  return (
    <div className="absolute right-0 top-12 w-96 max-h-[70vh] bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">Notifications</h3>
        <div className="flex items-center gap-2">
          {notifications.some(n => !n.read) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs text-gray-400 hover:text-white"
            >
              Mark all read
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Notification List */}
      <div className="overflow-y-auto max-h-[calc(70vh-60px)]">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No notifications
          </div>
        ) : (
          notifications.map(notification => (
            <div
              key={notification.id}
              className={`p-4 border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer transition-colors ${
                !notification.read ? 'bg-gray-800/30' : ''
              }`}
              onClick={() => handleAction(notification)}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-1 p-2 rounded-full ${
                  notification.priority === 'high' ? 'bg-red-500/20' :
                  notification.priority === 'medium' ? 'bg-yellow-500/20' : 'bg-gray-500/20'
                }`}>
                  <NotificationIcon type={notification.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`font-medium truncate ${!notification.read ? 'text-white' : 'text-gray-300'}`}>
                      {notification.title}
                    </p>
                    <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                      {timeAgo(notification.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    dismiss(notification.id);
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              {!notification.read && (
                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-fuchsia-500 rounded-full" />
              )}
            </div>
          ))
        )}
      </div>
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
        className="relative p-2"
      >
        <Bell className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-fuchsia-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>
      <NotificationCenter isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
