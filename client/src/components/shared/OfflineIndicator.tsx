import { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);
  const [pendingActions, setPendingActions] = useState(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      // Hide reconnected message after 3 seconds
      setTimeout(() => setShowReconnected(false), 3000);
      // Process pending actions
      processPendingActions();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check for pending actions in localStorage
  useEffect(() => {
    const checkPending = () => {
      const pending = localStorage.getItem('brain-pending-actions');
      if (pending) {
        try {
          const actions = JSON.parse(pending);
          setPendingActions(Array.isArray(actions) ? actions.length : 0);
        } catch {
          setPendingActions(0);
        }
      }
    };

    checkPending();
    window.addEventListener('storage', checkPending);
    return () => window.removeEventListener('storage', checkPending);
  }, []);

  const processPendingActions = async () => {
    const pending = localStorage.getItem('brain-pending-actions');
    if (!pending) return;

    try {
      const actions = JSON.parse(pending);
      // Process each action (in real implementation, this would call APIs)
      // Clear pending actions after processing
      localStorage.removeItem('brain-pending-actions');
      setPendingActions(0);
    } catch (error) {
      console.error('Error processing pending actions:', error);
    }
  };

  // Don't show anything if online and no reconnected message
  if (isOnline && !showReconnected) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom duration-300">
      <div
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-full shadow-lg backdrop-blur-sm',
          'border transition-colors duration-300',
          isOnline
            ? 'bg-green-500/10 border-green-500/30 text-green-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        )}
      >
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4" />
            <span className="text-sm font-medium">Back online</span>
            {pendingActions > 0 && (
              <span className="flex items-center gap-1 text-xs">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Syncing {pendingActions} action{pendingActions > 1 ? 's' : ''}
              </span>
            )}
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">You're offline</span>
            {pendingActions > 0 && (
              <span className="text-xs opacity-80">
                {pendingActions} action{pendingActions > 1 ? 's' : ''} queued
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Utility to queue actions when offline
export function queueOfflineAction(action: { type: string; payload: any }) {
  if (navigator.onLine) return false;

  const pending = localStorage.getItem('brain-pending-actions');
  const actions = pending ? JSON.parse(pending) : [];
  actions.push({
    ...action,
    timestamp: Date.now(),
  });
  localStorage.setItem('brain-pending-actions', JSON.stringify(actions));
  
  // Trigger storage event for indicator update
  window.dispatchEvent(new Event('storage'));
  
  return true;
}

// Hook for offline-aware mutations
export function useOfflineAction() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const execute = async <T,>(
    onlineAction: () => Promise<T>,
    offlineAction: { type: string; payload: any }
  ): Promise<T | null> => {
    if (isOnline) {
      return onlineAction();
    } else {
      queueOfflineAction(offlineAction);
      return null;
    }
  };

  return { isOnline, execute, queueOfflineAction };
}
