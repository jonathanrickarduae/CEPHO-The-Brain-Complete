import { useState } from 'react';

/**
 * Performance Boost - Simple wellness score display
 * Shows just the number, no gamification
 */

export function PerformanceBoost() {
  const [currentScore] = useState(6);

  return (
    <div className="bg-card/50 rounded-xl border border-border/50 p-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
          <span className="text-xl font-bold text-white">{currentScore}</span>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Wellness Score</p>
          <p className="font-semibold text-foreground text-lg">{currentScore}</p>
        </div>
      </div>
    </div>
  );
}

// Simple inline version
export function PerformanceBoostInline() {
  const [currentScore] = useState(6);

  return (
    <div className="flex items-center gap-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
      <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
        <span className="text-lg font-bold text-white">{currentScore}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">Wellness: {currentScore}</p>
      </div>
    </div>
  );
}
