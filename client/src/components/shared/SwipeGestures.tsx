import { useState, useRef, ReactNode, TouchEvent } from 'react';
import { Check, X, Clock, Trash2 } from 'lucide-react';

interface SwipeableItemProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: {
    icon: ReactNode;
    color: string;
    label: string;
  };
  rightAction?: {
    icon: ReactNode;
    color: string;
    label: string;
  };
  threshold?: number;
  className?: string;
}

export function SwipeableItem({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction = { icon: <Check className="w-5 h-5" />, color: 'bg-green-500', label: 'Approve' },
  rightAction = { icon: <X className="w-5 h-5" />, color: 'bg-red-500', label: 'Reject' },
  threshold = 80,
  className = '',
}: SwipeableItemProps) {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);

  const handleTouchStart = (e: TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    
    currentXRef.current = e.touches[0].clientX;
    const diff = currentXRef.current - startXRef.current;
    
    // Limit the swipe distance
    const maxSwipe = 120;
    const limitedDiff = Math.max(-maxSwipe, Math.min(maxSwipe, diff));
    
    setTranslateX(limitedDiff);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    if (translateX > threshold && onSwipeRight) {
      onSwipeRight();
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    } else if (translateX < -threshold && onSwipeLeft) {
      onSwipeLeft();
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
    
    setTranslateX(0);
  };

  const leftOpacity = Math.min(1, translateX / threshold);
  const rightOpacity = Math.min(1, -translateX / threshold);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Left action background (swipe right) */}
      {onSwipeRight && (
        <div
          className={`absolute inset-y-0 left-0 flex items-center justify-start pl-4 ${leftAction.color}`}
          style={{ opacity: leftOpacity, width: Math.max(0, translateX) }}
        >
          <div className="flex items-center gap-2 text-white">
            {leftAction.icon}
            <span className="text-sm font-medium">{leftAction.label}</span>
          </div>
        </div>
      )}

      {/* Right action background (swipe left) */}
      {onSwipeLeft && (
        <div
          className={`absolute inset-y-0 right-0 flex items-center justify-end pr-4 ${rightAction.color}`}
          style={{ opacity: rightOpacity, width: Math.max(0, -translateX) }}
        >
          <div className="flex items-center gap-2 text-white">
            <span className="text-sm font-medium">{rightAction.label}</span>
            {rightAction.icon}
          </div>
        </div>
      )}

      {/* Main content */}
      <div
        className={`relative bg-card transition-transform ${isDragging ? '' : 'duration-200'}`}
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}

// Swipeable task item
interface SwipeableTaskProps {
  task: {
    id: string;
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
    dueDate?: Date;
  };
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDefer?: (id: string) => void;
}

export function SwipeableTask({ task, onApprove, onReject, onDefer }: SwipeableTaskProps) {
  const priorityColors = {
    low: 'border-l-blue-500',
    medium: 'border-l-yellow-500',
    high: 'border-l-red-500',
  };

  return (
    <SwipeableItem
      onSwipeRight={() => onApprove(task.id)}
      onSwipeLeft={() => onReject(task.id)}
      leftAction={{
        icon: <Check className="w-5 h-5" />,
        color: 'bg-green-500',
        label: 'Approve',
      }}
      rightAction={{
        icon: <X className="w-5 h-5" />,
        color: 'bg-red-500',
        label: 'Reject',
      }}
    >
      <div
        className={`p-4 border-l-4 ${
          task.priority ? priorityColors[task.priority] : 'border-l-gray-500'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-foreground">{task.title}</h4>
            {task.description && (
              <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
            )}
          </div>
          {onDefer && (
            <button
              onClick={() => onDefer(task.id)}
              className="p-2 text-muted-foreground hover:text-foreground"
            >
              <Clock className="w-4 h-4" />
            </button>
          )}
        </div>
        {task.dueDate && (
          <div className="text-xs text-muted-foreground mt-2">
            Due: {task.dueDate.toLocaleDateString('en-GB')}
          </div>
        )}
        <div className="text-xs text-muted-foreground mt-2 md:hidden">
          ← Swipe to approve/reject →
        </div>
      </div>
    </SwipeableItem>
  );
}

// Swipeable notification item
interface SwipeableNotificationProps {
  notification: {
    id: string;
    title: string;
    message: string;
    time: Date;
    read?: boolean;
  };
  onDismiss: (id: string) => void;
  onMarkRead: (id: string) => void;
}

export function SwipeableNotification({
  notification,
  onDismiss,
  onMarkRead,
}: SwipeableNotificationProps) {
  return (
    <SwipeableItem
      onSwipeRight={() => onMarkRead(notification.id)}
      onSwipeLeft={() => onDismiss(notification.id)}
      leftAction={{
        icon: <Check className="w-5 h-5" />,
        color: 'bg-blue-500',
        label: 'Read',
      }}
      rightAction={{
        icon: <Trash2 className="w-5 h-5" />,
        color: 'bg-red-500',
        label: 'Delete',
      }}
    >
      <div className={`p-4 ${notification.read ? 'opacity-60' : ''}`}>
        <div className="flex items-start gap-3">
          {!notification.read && (
            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
          )}
          <div className="flex-1">
            <h4 className="font-medium text-foreground">{notification.title}</h4>
            <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
            <div className="text-xs text-muted-foreground mt-2">
              {notification.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>
    </SwipeableItem>
  );
}

// Swipe hint indicator
export function SwipeHint({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-4 text-xs text-muted-foreground ${className}`}>
      <div className="flex items-center gap-1">
        <span>←</span>
        <X className="w-3 h-3 text-red-400" />
      </div>
      <span>Swipe to action</span>
      <div className="flex items-center gap-1">
        <Check className="w-3 h-3 text-green-400" />
        <span>→</span>
      </div>
    </div>
  );
}
