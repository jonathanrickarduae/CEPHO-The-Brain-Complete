import { cn } from '@/lib/utils';

// Base skeleton with shimmer animation
interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-white/10',
        'relative overflow-hidden',
        'after:absolute after:inset-0',
        'after:translate-x-[-100%]',
        'after:animate-[shimmer_2s_infinite]',
        'after:bg-gradient-to-r after:from-transparent after:via-white/10 after:to-transparent',
        className
      )}
    />
  );
}

// Card skeleton for dashboard boxes
export function CardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn(
      'p-4 md:p-5 rounded-xl bg-card/60 border border-white/10',
      className
    )}>
      <div className="flex items-start gap-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    </div>
  );
}

// Dashboard grid skeleton
export function DashboardSkeleton() {
  return (
    <div className="h-full flex flex-col p-4 md:p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-8 w-32 rounded-full" />
        <Skeleton className="h-6 w-20" />
      </div>

      {/* Title */}
      <div className="mb-4 text-center">
        <Skeleton className="h-10 w-64 mx-auto mb-2" />
        <Skeleton className="h-4 w-96 mx-auto" />
      </div>

      {/* Grid */}
      <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-4 max-w-5xl mx-auto w-full">
        {[...Array(6)].map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>

      {/* Input */}
      <div className="max-w-3xl mx-auto w-full">
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
    </div>
  );
}

// Chat message skeleton
export function MessageSkeleton({ isUser = false }: { isUser?: boolean }) {
  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
      <div className={cn('flex-1 max-w-[85%]', isUser && 'flex flex-col items-end')}>
        <Skeleton className={cn(
          'h-20 rounded-2xl',
          isUser ? 'w-48 rounded-tr-sm' : 'w-64 rounded-tl-sm'
        )} />
        <Skeleton className="h-3 w-12 mt-1" />
      </div>
    </div>
  );
}

// Chat skeleton
export function ChatSkeleton() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-1">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-6">
        <MessageSkeleton />
        <MessageSkeleton isUser />
        <MessageSkeleton />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-white/10 px-4 py-4">
        <Skeleton className="h-12 w-full rounded-2xl" />
      </div>
    </div>
  );
}

// List item skeleton
export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg">
      <Skeleton className="w-10 h-10 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="w-16 h-6 rounded-full" />
    </div>
  );
}

// List skeleton
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {[...Array(count)].map((_, i) => (
        <ListItemSkeleton key={i} />
      ))}
    </div>
  );
}

// Stats card skeleton
export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="p-4 rounded-xl bg-card/60 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="w-12 h-4 rounded" />
          </div>
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

// Table skeleton
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="flex gap-4 p-4 bg-secondary/30 border-b border-white/10">
        {[...Array(cols)].map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 p-4 border-b border-white/5 last:border-0">
          {[...Array(cols)].map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Timeline skeleton
export function TimelineSkeleton({ items = 4 }: { items?: number }) {
  return (
    <div className="space-y-4">
      {[...Array(items)].map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="flex flex-col items-center">
            <Skeleton className="w-3 h-3 rounded-full" />
            {i < items - 1 && <Skeleton className="w-0.5 h-12 mt-1" />}
          </div>
          <div className="flex-1 pb-4">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Brief card skeleton (for The Signal)
export function BriefCardSkeleton() {
  return (
    <div className="p-4 rounded-xl bg-card/60 border border-white/10 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="w-16 h-6 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}

// Full page loading skeleton
export function PageSkeleton({ type = 'default' }: { type?: 'default' | 'dashboard' | 'chat' | 'list' }) {
  switch (type) {
    case 'dashboard':
      return <DashboardSkeleton />;
    case 'chat':
      return <ChatSkeleton />;
    case 'list':
      return (
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
          <ListSkeleton count={8} />
        </div>
      );
    default:
      return (
        <div className="p-6 space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      );
  }
}
