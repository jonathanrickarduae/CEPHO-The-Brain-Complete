import { useState, useRef, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: string | ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  showOnFirstVisit?: boolean;
  tooltipKey?: string;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 300,
  showOnFirstVisit = false,
  tooltipKey,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check if this is a first-time visit tooltip
  useEffect(() => {
    if (showOnFirstVisit && tooltipKey) {
      const hasSeenKey = `brain_tooltip_seen_${tooltipKey}`;
      const hasSeen = localStorage.getItem(hasSeenKey);
      if (!hasSeen) {
        setIsVisible(true);
        localStorage.setItem(hasSeenKey, 'true');
        setTimeout(() => setIsVisible(false), 5000);
      }
    }
  }, [showOnFirstVisit, tooltipKey]);

  const calculatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = rect.top + scrollY - 8;
        left = rect.left + scrollX + rect.width / 2;
        break;
      case 'bottom':
        top = rect.bottom + scrollY + 8;
        left = rect.left + scrollX + rect.width / 2;
        break;
      case 'left':
        top = rect.top + scrollY + rect.height / 2;
        left = rect.left + scrollX - 8;
        break;
      case 'right':
        top = rect.top + scrollY + rect.height / 2;
        left = rect.right + scrollX + 8;
        break;
    }

    setCoords({ top, left });
  };

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      calculatePosition();
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const positionClasses = {
    top: '-translate-x-1/2 -translate-y-full',
    bottom: '-translate-x-1/2',
    left: '-translate-x-full -translate-y-1/2',
    right: '-translate-y-1/2',
  };

  const arrowClasses = {
    top: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-t-gray-800 border-x-transparent border-b-transparent',
    bottom: 'top-0 left-1/2 -translate-x-1/2 -translate-y-full border-b-gray-800 border-x-transparent border-t-transparent',
    left: 'right-0 top-1/2 translate-x-full -translate-y-1/2 border-l-gray-800 border-y-transparent border-r-transparent',
    right: 'left-0 top-1/2 -translate-x-full -translate-y-1/2 border-r-gray-800 border-y-transparent border-l-transparent',
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </div>
      {isVisible &&
        createPortal(
          <div
            className={`fixed z-[9999] px-3 py-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg max-w-xs animate-in fade-in duration-200 ${positionClasses[position]}`}
            style={{ top: coords.top, left: coords.left }}
          >
            {content}
            <div
              className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`}
            />
          </div>,
          document.body
        )}
    </>
  );
}

// First-time user contextual tooltips
export const tooltipContent = {
  dailyBrief: "Start your day here! Get a summary of priorities, tasks, and AI insights tailored to you.",
  aiExperts: "Access 287+ AI specialists. Ask questions, get blueprints, and assemble expert teams.",
  digitalTwin: "Your AI counterpart that learns your patterns. Train it through conversations and feedback.",
  vault: "Secure storage for sensitive data. Protected with 2FA email verification.",
  moodCheck: "Track your mood 3x daily. Cepho uses this to optimize your productivity.",
  workflow: "Manage projects and tasks. See what's blocked, at-risk, or on-track.",
  library: "Store and organize documents, blueprints, and AI-generated content.",
  statistics: "View your productivity metrics, wellness score, and learning progress.",
  voiceInput: "Click to speak. Voice commands work throughout the app.",
  commandPalette: "Press ⌘K to open the command palette for quick actions.",
};

// Hook for managing first-time tooltips
export function useFirstTimeTooltips() {
  const [showTooltips, setShowTooltips] = useState(false);

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('brain_onboarding_complete');
    const hasSeenTooltips = localStorage.getItem('brain_first_tooltips_shown');
    
    if (hasCompletedOnboarding && !hasSeenTooltips) {
      setShowTooltips(true);
      localStorage.setItem('brain_first_tooltips_shown', 'true');
      
      // Auto-hide after 10 seconds
      setTimeout(() => setShowTooltips(false), 10000);
    }
  }, []);

  return showTooltips;
}
