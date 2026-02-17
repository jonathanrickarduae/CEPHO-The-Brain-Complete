import { useState, useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShortcutItem {
  keys: string[];
  description: string;
  category?: string;
}

const SHORTCUTS: ShortcutItem[] = [
  // Navigation
  { keys: ['⌘/Ctrl', 'D'], description: 'Go to Dashboard', category: 'Navigation' },
  { keys: ['⌘/Ctrl', 'B'], description: 'Go to The Signal', category: 'Navigation' },
  { keys: ['⌘/Ctrl', 'E'], description: 'Go to AI Experts', category: 'Navigation' },
  { keys: ['⌘/Ctrl', 'T'], description: 'Go to Chief of Staff', category: 'Navigation' },
  { keys: ['⌘/Ctrl', 'W'], description: 'Go to Workflow', category: 'Navigation' },
  { keys: ['⌘/Ctrl', 'L'], description: 'Go to Library', category: 'Navigation' },
  { keys: ['⌘/Ctrl', 'V'], description: 'Go to Vault', category: 'Navigation' },
  { keys: ['⌘/Ctrl', 'R'], description: 'Go to Evening Review', category: 'Navigation' },
  
  // Actions
  { keys: ['⌘/Ctrl', '/'], description: 'Focus search/voice input', category: 'Actions' },
  { keys: ['Esc'], description: 'Close modal/dialog', category: 'Actions' },
  { keys: ['Shift', '?'], description: 'Show keyboard shortcuts', category: 'Actions' },
  
  // Quick Actions
  { keys: ['Space'], description: 'Start/stop voice recording (when focused)', category: 'Quick Actions' },
  { keys: ['Enter'], description: 'Submit/confirm action', category: 'Quick Actions' },
];

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Group shortcuts by category
  const groupedShortcuts = SHORTCUTS.reduce((acc, shortcut) => {
    const category = shortcut.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(shortcut);
    return acc;
  }, {} as Record<string, ShortcutItem[]>);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-primary" />
              <h2 className="font-display font-bold text-lg">Keyboard Shortcuts</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-secondary/50 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Shortcuts List */}
          <div className="p-4 max-h-[60vh] overflow-y-auto">
            {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
              <div key={category} className="mb-6 last:mb-0">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  {category}
                </h3>
                <div className="space-y-2">
                  {shortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/30"
                    >
                      <span className="text-sm text-foreground">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <span key={keyIndex} className="flex items-center">
                            <kbd className="px-2 py-1 text-xs font-mono bg-secondary rounded border border-white/10 text-muted-foreground">
                              {key}
                            </kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="mx-1 text-muted-foreground/50">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 bg-secondary/20">
            <p className="text-xs text-muted-foreground text-center">
              Press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-secondary rounded border border-white/10">Shift</kbd> + <kbd className="px-1.5 py-0.5 text-xs font-mono bg-secondary rounded border border-white/10">?</kbd> anytime to show this help
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// Hook to manage keyboard shortcuts help visibility
export function useKeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Shift + ? to toggle help
      if (e.shiftKey && e.key === '?') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(prev => !prev),
  };
}
