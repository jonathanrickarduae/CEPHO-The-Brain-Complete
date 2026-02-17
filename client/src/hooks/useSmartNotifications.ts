import { useState, useEffect, useCallback, useRef } from 'react';

// Notification types
type NotificationType = 'reminder' | 'insight' | 'achievement' | 'nudge' | 'alert';
type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

interface SmartNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  timestamp: Date;
  read: boolean;
  dismissed: boolean;
  actionLabel?: string;
  actionUrl?: string;
  icon?: string;
  expiresAt?: Date;
}

interface UserPattern {
  mostActiveHour: number;
  averageSessionLength: number;
  preferredNotificationTime: number[];
  dismissedTypes: NotificationType[];
  lastNotificationTime: Date | null;
}

const STORAGE_KEY = 'brain-notifications';
const PATTERNS_KEY = 'brain-notification-patterns';
const MIN_NOTIFICATION_INTERVAL = 30 * 60 * 1000; // 30 minutes

// Default user patterns
const DEFAULT_PATTERNS: UserPattern = {
  mostActiveHour: 9, // 9 AM
  averageSessionLength: 30, // minutes
  preferredNotificationTime: [9, 14, 18], // Morning, afternoon, evening
  dismissedTypes: [],
  lastNotificationTime: null,
};

// Load notifications from storage
function loadNotifications(): SmartNotification[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const notifications = JSON.parse(stored);
      return notifications.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp),
        expiresAt: n.expiresAt ? new Date(n.expiresAt) : undefined,
      }));
    }
  } catch {
    // Ignore
  }
  return [];
}

// Save notifications to storage
function saveNotifications(notifications: SmartNotification[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch {
    // Ignore
  }
}

// Load user patterns
function loadPatterns(): UserPattern {
  if (typeof window === 'undefined') return DEFAULT_PATTERNS;
  
  try {
    const stored = localStorage.getItem(PATTERNS_KEY);
    if (stored) {
      const patterns = JSON.parse(stored);
      return {
        ...DEFAULT_PATTERNS,
        ...patterns,
        lastNotificationTime: patterns.lastNotificationTime 
          ? new Date(patterns.lastNotificationTime) 
          : null,
      };
    }
  } catch {
    // Ignore
  }
  return DEFAULT_PATTERNS;
}

// Save user patterns
function savePatterns(patterns: UserPattern): void {
  try {
    localStorage.setItem(PATTERNS_KEY, JSON.stringify(patterns));
  } catch {
    // Ignore
  }
}

/**
 * Smart notifications hook with pattern learning
 */
export function useSmartNotifications() {
  const [notifications, setNotifications] = useState<SmartNotification[]>(loadNotifications);
  const [patterns, setPatterns] = useState<UserPattern>(loadPatterns);
  const [activeNotification, setActiveNotification] = useState<SmartNotification | null>(null);
  const notificationQueue = useRef<SmartNotification[]>([]);

  // Save on change
  useEffect(() => {
    saveNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    savePatterns(patterns);
  }, [patterns]);

  // Clean up expired notifications
  useEffect(() => {
    const now = new Date();
    setNotifications(prev => 
      prev.filter(n => !n.expiresAt || n.expiresAt > now)
    );
  }, []);

  // Check if we should show a notification based on patterns
  const shouldShowNotification = useCallback((type: NotificationType, priority: NotificationPriority): boolean => {
    // Always show urgent notifications
    if (priority === 'urgent') return true;

    // Check if type is dismissed
    if (patterns.dismissedTypes.includes(type)) return false;

    // Check minimum interval
    if (patterns.lastNotificationTime) {
      const timeSinceLastNotification = Date.now() - patterns.lastNotificationTime.getTime();
      if (timeSinceLastNotification < MIN_NOTIFICATION_INTERVAL) {
        return priority === 'high'; // Only high priority can bypass interval
      }
    }

    // Check if current hour is in preferred times
    const currentHour = new Date().getHours();
    if (!patterns.preferredNotificationTime.includes(currentHour)) {
      return priority === 'high'; // Only high priority outside preferred times
    }

    return true;
  }, [patterns]);

  // Add a notification
  const addNotification = useCallback((
    notification: Omit<SmartNotification, 'id' | 'timestamp' | 'read' | 'dismissed'>
  ) => {
    const newNotification: SmartNotification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
      dismissed: false,
    };

    if (shouldShowNotification(notification.type, notification.priority)) {
      setNotifications(prev => [newNotification, ...prev]);
      
      // Queue for display
      notificationQueue.current.push(newNotification);
      
      // Update last notification time
      setPatterns(prev => ({
        ...prev,
        lastNotificationTime: new Date(),
      }));

      // Show if no active notification
      if (!activeNotification) {
        setActiveNotification(newNotification);
      }
    }
  }, [shouldShowNotification, activeNotification]);

  // Mark as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  // Dismiss notification
  const dismiss = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, dismissed: true } : n)
    );
    
    if (activeNotification?.id === id) {
      // Show next in queue
      const next = notificationQueue.current.shift();
      setActiveNotification(next || null);
    }
  }, [activeNotification]);

  // Dismiss all of a type (user preference)
  const dismissType = useCallback((type: NotificationType) => {
    setPatterns(prev => ({
      ...prev,
      dismissedTypes: [...prev.dismissedTypes, type],
    }));
    
    setNotifications(prev =>
      prev.map(n => n.type === type ? { ...n, dismissed: true } : n)
    );
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
    setActiveNotification(null);
    notificationQueue.current = [];
  }, []);

  // Update user patterns based on behavior
  const recordActivity = useCallback((hour: number) => {
    setPatterns(prev => ({
      ...prev,
      mostActiveHour: hour,
    }));
  }, []);

  // Smart notification generators
  const generateNudge = useCallback((context: {
    lastActivity?: Date;
    pendingTasks?: number;
    streakDays?: number;
  }) => {
    const { lastActivity, pendingTasks, streakDays } = context;
    const now = new Date();

    // Inactivity nudge
    if (lastActivity) {
      const hoursSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
      if (hoursSinceActivity > 24) {
        addNotification({
          type: 'nudge',
          title: 'We miss you!',
          message: 'Your Chief of Staff has been waiting. Check in to maintain your streak.',
          priority: 'medium',
          icon: '👋',
        });
        return;
      }
    }

    // Pending tasks reminder
    if (pendingTasks && pendingTasks > 5) {
      addNotification({
        type: 'reminder',
        title: `${pendingTasks} tasks pending`,
        message: 'Would you like to review your priorities for today?',
        priority: 'medium',
        actionLabel: 'View Tasks',
        actionUrl: '/daily-brief',
        icon: '📋',
      });
      return;
    }

    // Streak encouragement
    if (streakDays && streakDays > 0 && streakDays % 7 === 0) {
      addNotification({
        type: 'achievement',
        title: `${streakDays}-day streak! 🔥`,
        message: 'Amazing consistency! Keep it up to unlock new achievements.',
        priority: 'low',
        icon: '🏆',
      });
    }
  }, [addNotification]);

  // Generate insight notification
  const generateInsight = useCallback((insight: {
    title: string;
    message: string;
    actionUrl?: string;
  }) => {
    addNotification({
      type: 'insight',
      title: insight.title,
      message: insight.message,
      priority: 'low',
      actionLabel: insight.actionUrl ? 'Learn More' : undefined,
      actionUrl: insight.actionUrl,
      icon: '💡',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });
  }, [addNotification]);

  // Generate alert
  const generateAlert = useCallback((alert: {
    title: string;
    message: string;
    priority?: NotificationPriority;
  }) => {
    addNotification({
      type: 'alert',
      title: alert.title,
      message: alert.message,
      priority: alert.priority || 'high',
      icon: '⚠️',
    });
  }, [addNotification]);

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read && !n.dismissed).length;

  // Get visible notifications (not dismissed, not expired)
  const visibleNotifications = notifications.filter(n => 
    !n.dismissed && (!n.expiresAt || n.expiresAt > new Date())
  );

  return {
    notifications: visibleNotifications,
    activeNotification,
    unreadCount,
    patterns,
    addNotification,
    markAsRead,
    dismiss,
    dismissType,
    clearAll,
    recordActivity,
    generateNudge,
    generateInsight,
    generateAlert,
  };
}

/**
 * Hook for browser notifications permission
 */
export function useBrowserNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  });

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return 'denied';
    
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const showBrowserNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (permission !== 'granted') return null;
    
    return new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });
  }, [permission]);

  return {
    permission,
    requestPermission,
    showBrowserNotification,
    isSupported: typeof window !== 'undefined' && 'Notification' in window,
  };
}
