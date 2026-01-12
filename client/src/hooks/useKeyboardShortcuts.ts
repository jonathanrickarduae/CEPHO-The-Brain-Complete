import { useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

// Global keyboard shortcuts
const GLOBAL_SHORTCUTS: ShortcutConfig[] = [
  { key: 'd', ctrl: true, action: () => {}, description: 'Go to Dashboard' },
  { key: 'b', ctrl: true, action: () => {}, description: 'Go to The Signal' },
  { key: 'e', ctrl: true, action: () => {}, description: 'Go to AI Experts' },
  { key: 't', ctrl: true, action: () => {}, description: 'Go to Chief of Staff' },
  { key: 'w', ctrl: true, action: () => {}, description: 'Go to Workflow' },
  { key: 'l', ctrl: true, action: () => {}, description: 'Go to Library' },
  { key: 'v', ctrl: true, action: () => {}, description: 'Go to Vault' },
  { key: 'r', ctrl: true, action: () => {}, description: 'Go to Evening Review' },
  { key: '/', ctrl: true, action: () => {}, description: 'Focus search/voice input' },
  { key: 'Escape', action: () => {}, description: 'Close modal/dialog' },
  { key: '?', shift: true, action: () => {}, description: 'Show keyboard shortcuts' },
];

export function useKeyboardShortcuts(customShortcuts?: ShortcutConfig[]) {
  const [, setLocation] = useLocation();

  // Navigation shortcuts with actual navigation
  const navigationShortcuts: ShortcutConfig[] = [
    { key: 'd', ctrl: true, action: () => setLocation('/dashboard'), description: 'Go to Dashboard' },
    { key: 'b', ctrl: true, action: () => setLocation('/daily-brief'), description: 'Go to The Signal' },
    { key: 'e', ctrl: true, action: () => setLocation('/ai-experts'), description: 'Go to AI Experts' },
    { key: 't', ctrl: true, action: () => setLocation('/digital-twin'), description: 'Go to Chief of Staff' },
    { key: 'w', ctrl: true, action: () => setLocation('/workflow'), description: 'Go to Workflow' },
    { key: 'l', ctrl: true, action: () => setLocation('/library'), description: 'Go to Library' },
    { key: 'v', ctrl: true, action: () => setLocation('/vault'), description: 'Go to Vault' },
    { key: 'r', ctrl: true, action: () => setLocation('/evening-review'), description: 'Go to Evening Review' },
  ];

  const allShortcuts = [...navigationShortcuts, ...(customShortcuts || [])];

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in input fields
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      // Only allow Escape in input fields
      if (event.key !== 'Escape') return;
    }

    for (const shortcut of allShortcuts) {
      const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey;
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const altMatch = shortcut.alt ? event.altKey : !event.altKey;
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

      if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
        event.preventDefault();
        shortcut.action();
        return;
      }
    }
  }, [allShortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    shortcuts: allShortcuts,
  };
}

// Hook to get all available shortcuts for display
export function useShortcutsList() {
  return GLOBAL_SHORTCUTS.map(s => ({
    key: s.key,
    modifiers: [
      s.ctrl && '⌘/Ctrl',
      s.shift && 'Shift',
      s.alt && 'Alt',
    ].filter(Boolean).join('+'),
    description: s.description,
  }));
}
