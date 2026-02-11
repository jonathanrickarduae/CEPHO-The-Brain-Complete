/**
 * Haptic Feedback Utility
 * Provides tactile feedback on supported devices
 */

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

interface HapticOptions {
  pattern: HapticPattern;
  fallbackVibration?: boolean;
}

// Vibration patterns in milliseconds
const VIBRATION_PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
  success: [10, 50, 30], // Short-pause-long
  warning: [50, 30, 50], // Long-pause-long
  error: [100, 50, 100, 50, 100], // Three long pulses
  selection: 5,
};

/**
 * Check if haptic feedback is supported
 */
export function isHapticSupported(): boolean {
  return 'vibrate' in navigator;
}

/**
 * Trigger haptic feedback
 */
export function haptic(options: HapticOptions | HapticPattern = 'light'): void {
  const pattern = typeof options === 'string' ? options : options.pattern;
  const fallback = typeof options === 'object' ? options.fallbackVibration !== false : true;

  // Try native haptic feedback first (iOS)
  if ('haptics' in navigator) {
    try {
      // @ts-ignore - Experimental API
      navigator.haptics.play(pattern);
      return;
    } catch {
      // Fall through to vibration API
    }
  }

  // Use Vibration API as fallback
  if (fallback && isHapticSupported()) {
    try {
      const vibrationPattern = VIBRATION_PATTERNS[pattern];
      navigator.vibrate(vibrationPattern);
    } catch {
      // Silently fail if vibration not available
    }
  }
}

/**
 * Haptic feedback for common UI interactions
 */
export const haptics = {
  /** Light tap for selections and toggles */
  tap: () => haptic('light'),
  
  /** Medium feedback for button presses */
  press: () => haptic('medium'),
  
  /** Heavy feedback for important actions */
  impact: () => haptic('heavy'),
  
  /** Success pattern for completed actions */
  success: () => haptic('success'),
  
  /** Warning pattern for alerts */
  warning: () => haptic('warning'),
  
  /** Error pattern for failures */
  error: () => haptic('error'),
  
  /** Ultra-light for list selections */
  selection: () => haptic('selection'),
};

/**
 * Hook for haptic feedback with reduced motion support
 */
export function useHaptics() {
  const prefersReducedMotion = 
    typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // If user prefers reduced motion, disable haptics
  if (prefersReducedMotion) {
    return {
      tap: () => {},
      press: () => {},
      impact: () => {},
      success: () => {},
      warning: () => {},
      error: () => {},
      selection: () => {},
      isSupported: false,
    };
  }

  return {
    ...haptics,
    isSupported: isHapticSupported(),
  };
}

/**
 * Create a click handler with haptic feedback
 */
export function createHapticHandler<T extends (...args: any[]) => any>(
  handler: T | undefined,
  pattern: HapticPattern = 'light'
): T {
  return ((...args: Parameters<T>) => {
    haptic(pattern);
    return handler?.(...args);
  }) as T;
}
