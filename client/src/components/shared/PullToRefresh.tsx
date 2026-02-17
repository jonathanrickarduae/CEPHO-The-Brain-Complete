import { useState, useRef, ReactNode, TouchEvent, useEffect } from 'react';
import { RefreshCw, ArrowDown } from 'lucide-react';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
  maxPull?: number;
  className?: string;
  disabled?: boolean;
}

export function PullToRefresh({
  children,
  onRefresh,
  threshold = 80,
  maxPull = 120,
  className = '',
  disabled = false,
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const scrollTopRef = useRef(0);

  const handleTouchStart = (e: TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    scrollTopRef.current = container.scrollTop;
    
    // Only start pull if at top of scroll
    if (scrollTopRef.current <= 0) {
      startYRef.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isPulling || disabled || isRefreshing) return;
    
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) {
      setIsPulling(false);
      setPullDistance(0);
      return;
    }

    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;
    
    if (diff > 0) {
      // Apply resistance to pull
      const resistance = 0.5;
      const distance = Math.min(maxPull, diff * resistance);
      setPullDistance(distance);
      
      // Prevent default scroll when pulling
      e.preventDefault();
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling || disabled) return;
    
    setIsPulling(false);
    
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(threshold);
      
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  const progress = Math.min(1, pullDistance / threshold);
  const shouldTrigger = pullDistance >= threshold;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className="absolute left-0 right-0 flex items-center justify-center z-10 overflow-hidden transition-all duration-200"
        style={{
          height: pullDistance,
          top: 0,
        }}
      >
        <div
          className={`flex flex-col items-center gap-2 transition-all duration-200 ${
            shouldTrigger ? 'text-primary' : 'text-muted-foreground'
          }`}
          style={{
            opacity: progress,
            transform: `scale(${0.5 + progress * 0.5})`,
          }}
        >
          {isRefreshing ? (
            <RefreshCw className="w-6 h-6 animate-spin" />
          ) : shouldTrigger ? (
            <RefreshCw
              className="w-6 h-6 transition-transform"
              style={{ transform: `rotate(${progress * 180}deg)` }}
            />
          ) : (
            <ArrowDown
              className="w-6 h-6 transition-transform"
              style={{ transform: `rotate(${progress * 180}deg)` }}
            />
          )}
          <span className="text-xs font-medium">
            {isRefreshing
              ? 'Refreshing...'
              : shouldTrigger
              ? 'Release to refresh'
              : 'Pull to refresh'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        className="transition-transform duration-200"
        style={{
          transform: `translateY(${pullDistance}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Hook for managing refresh state
export function useRefresh(refreshFn: () => Promise<void>) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshFn();
      setLastRefreshed(new Date());
    } finally {
      setIsRefreshing(false);
    }
  };

  return { isRefreshing, lastRefreshed, refresh };
}

// Refresh indicator for header
interface RefreshIndicatorProps {
  isRefreshing: boolean;
  lastRefreshed?: Date | null;
  onRefresh: () => void;
}

export function RefreshIndicator({
  isRefreshing,
  lastRefreshed,
  onRefresh,
}: RefreshIndicatorProps) {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <button
      onClick={onRefresh}
      disabled={isRefreshing}
      className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
    >
      <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      {lastRefreshed && !isRefreshing && (
        <span className="text-xs">Updated {formatTime(lastRefreshed)}</span>
      )}
      {isRefreshing && <span className="text-xs">Refreshing...</span>}
    </button>
  );
}

// Auto-refresh hook
export function useAutoRefresh(
  refreshFn: () => Promise<void>,
  intervalMs: number = 60000,
  enabled: boolean = true
) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshFn();
      setLastRefreshed(new Date());
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!enabled) return;

    // Initial refresh
    refresh();

    // Set up interval
    const interval = setInterval(refresh, intervalMs);
    return () => clearInterval(interval);
  }, [enabled, intervalMs]);

  return { isRefreshing, lastRefreshed, refresh };
}
