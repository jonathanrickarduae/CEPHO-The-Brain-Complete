import { ReactNode } from 'react';

interface StatusPulseProps {
  children: ReactNode;
  status?: 'active' | 'warning' | 'error' | 'success' | 'idle';
  showPulse?: boolean;
  count?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  size?: 'sm' | 'md' | 'lg';
}

export function StatusPulse({
  children,
  status = 'idle',
  showPulse = true,
  count,
  position = 'top-right',
  size = 'sm',
}: StatusPulseProps) {
  const statusColors = {
    active: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    success: 'bg-emerald-500',
    idle: 'bg-gray-500',
  };

  const positionClasses = {
    'top-right': '-top-1 -right-1',
    'top-left': '-top-1 -left-1',
    'bottom-right': '-bottom-1 -right-1',
    'bottom-left': '-bottom-1 -left-1',
  };

  const sizeClasses = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const countSizeClasses = {
    sm: 'w-4 h-4 text-[10px]',
    md: 'w-5 h-5 text-xs',
    lg: 'w-6 h-6 text-sm',
  };

  return (
    <div className="relative inline-flex">
      {children}
      {(showPulse || count !== undefined) && (
        <span className={`absolute ${positionClasses[position]}`}>
          {count !== undefined ? (
            <span
              className={`flex items-center justify-center ${countSizeClasses[size]} ${statusColors[status]} text-white font-bold rounded-full`}
            >
              {count > 99 ? '99+' : count}
            </span>
          ) : (
            <>
              {/* Pulse ring */}
              {status !== 'idle' && (
                <span
                  className={`absolute inset-0 ${sizeClasses[size]} ${statusColors[status]} rounded-full animate-ping opacity-75`}
                />
              )}
              {/* Solid dot */}
              <span
                className={`relative ${sizeClasses[size]} ${statusColors[status]} rounded-full block`}
              />
            </>
          )}
        </span>
      )}
    </div>
  );
}

// Sidebar icon with status indicator
interface SidebarIconStatusProps {
  icon: ReactNode;
  label: string;
  status?: 'active' | 'warning' | 'error' | 'success' | 'idle';
  notificationCount?: number;
  isActive?: boolean;
  onClick?: () => void;
}

export function SidebarIconStatus({
  icon,
  label,
  status = 'idle',
  notificationCount,
  isActive = false,
  onClick,
}: SidebarIconStatusProps) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
        isActive
          ? 'bg-primary/20 text-primary'
          : 'text-muted-foreground hover:bg-gray-800 hover:text-foreground'
      }`}
      title={label}
    >
      <StatusPulse
        status={status}
        showPulse={status !== 'idle'}
        count={notificationCount}
      >
        {icon}
      </StatusPulse>
      <span className="text-xs">{label}</span>
    </button>
  );
}

// Activity indicator for real-time status
interface ActivityIndicatorProps {
  isActive: boolean;
  label?: string;
  className?: string;
}

export function ActivityIndicator({
  isActive,
  label,
  className = '',
}: ActivityIndicatorProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        {isActive && (
          <span className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping opacity-75" />
        )}
        <span
          className={`relative w-2 h-2 rounded-full block ${
            isActive ? 'bg-green-500' : 'bg-gray-500'
          }`}
        />
      </div>
      {label && (
        <span className={`text-xs ${isActive ? 'text-green-400' : 'text-muted-foreground'}`}>
          {label}
        </span>
      )}
    </div>
  );
}

// Connection status indicator
interface ConnectionStatusProps {
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  showLabel?: boolean;
}

export function ConnectionStatus({ status, showLabel = true }: ConnectionStatusProps) {
  const statusConfig = {
    connected: { color: 'bg-green-500', label: 'Connected', pulse: false },
    connecting: { color: 'bg-yellow-500', label: 'Connecting...', pulse: true },
    disconnected: { color: 'bg-gray-500', label: 'Disconnected', pulse: false },
    error: { color: 'bg-red-500', label: 'Connection Error', pulse: true },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        {config.pulse && (
          <span className={`absolute inset-0 w-2 h-2 ${config.color} rounded-full animate-ping opacity-75`} />
        )}
        <span className={`relative w-2 h-2 ${config.color} rounded-full block`} />
      </div>
      {showLabel && (
        <span className="text-xs text-muted-foreground">{config.label}</span>
      )}
    </div>
  );
}

// Typing indicator for chat
export function TypingIndicator({ name }: { name?: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground text-sm">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      {name && <span>{name} is typing...</span>}
    </div>
  );
}

// Sync status indicator
interface SyncStatusProps {
  lastSynced?: Date;
  isSyncing?: boolean;
  error?: string;
}

export function SyncStatus({ lastSynced, isSyncing, error }: SyncStatusProps) {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-400 text-xs">
        <span className="w-2 h-2 bg-red-500 rounded-full" />
        Sync error
      </div>
    );
  }

  if (isSyncing) {
    return (
      <div className="flex items-center gap-2 text-yellow-400 text-xs">
        <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
        Syncing...
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-muted-foreground text-xs">
      <span className="w-2 h-2 bg-green-500 rounded-full" />
      {lastSynced ? `Synced ${formatTime(lastSynced)}` : 'Not synced'}
    </div>
  );
}
