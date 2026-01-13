import React from 'react';

interface SkeletonProps {
  className?: string;
  count?: number;
}

/**
 * Animated skeleton loader that matches content layout
 * Use this while data is loading to improve perceived performance
 */
export function Skeleton({ className = '', count = 1 }: SkeletonProps) {
  const skeletons = Array.from({ length: count });

  return (
    <>
      {skeletons.map((_, idx) => (
        <div
          key={idx}
          className={`bg-gradient-to-r from-secondary/50 via-secondary/30 to-secondary/50 animate-pulse rounded-lg ${className}`}
          style={{
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s infinite',
          }}
        />
      ))}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </>
  );
}

/**
 * Skeleton for text content
 */
export function TextSkeleton({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, idx) => (
        <Skeleton
          key={idx}
          className={`h-4 ${idx === lines - 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton for card layout
 */
export function CardSkeleton({ count = 3, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="bg-card border border-border rounded-lg p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-6 w-12" />
          </div>

          {/* Content */}
          <TextSkeleton lines={2} />

          {/* Footer */}
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for list items
 */
export function ListSkeleton({ count = 5, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
          {/* Avatar */}
          <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />

          {/* Content */}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>

          {/* Action */}
          <Skeleton className="h-8 w-20 rounded" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for dashboard grid
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-6 w-2/3" />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, idx) => (
          <Skeleton key={idx} className="h-32 rounded-lg" />
        ))}
      </div>

      {/* Bottom section */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-1/4" />
        <ListSkeleton count={3} />
      </div>
    </div>
  );
}

/**
 * Skeleton for expert card
 */
export function ExpertCardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="bg-card border border-border rounded-lg p-4 space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>

          {/* Bio */}
          <TextSkeleton lines={2} />

          {/* Rating */}
          <Skeleton className="h-4 w-1/3" />

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="h-8 flex-1" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for brief/article
 */
export function BriefSkeleton() {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      {/* Sections */}
      {Array.from({ length: 3 }).map((_, sectionIdx) => (
        <div key={sectionIdx} className="space-y-3">
          <Skeleton className="h-6 w-1/4" />
          <TextSkeleton lines={3} />
        </div>
      ))}

      {/* CTA */}
      <div className="flex gap-2 pt-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}
