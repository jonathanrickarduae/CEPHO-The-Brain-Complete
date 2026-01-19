import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const SHORTCUTS: Shortcut[] = [
  // Navigation
  { keys: ['Cmd', 'K'], description: 'Open command palette', category: 'Navigation' },
  { keys: ['Cmd', '/'], description: 'Show keyboard shortcuts', category: 'Navigation' },
  { keys: ['Escape'], description: 'Close modal or cancel action', category: 'Navigation' },
  { keys: ['Tab'], description: 'Navigate between elements', category: 'Navigation' },
  { keys: ['Shift', 'Tab'], description: 'Navigate backwards', category: 'Navigation' },

  // Dashboard
  { keys: ['Cmd', 'D'], description: 'Go to Dashboard', category: 'Dashboard' },
  { keys: ['Cmd', 'B'], description: 'Open Daily Brief', category: 'Dashboard' },
  { keys: ['Cmd', 'E'], description: 'Open AI Experts', category: 'Dashboard' },
  { keys: ['Cmd', 'T'], description: 'Open Chief of Staff', category: 'Dashboard' },

  // Actions
  { keys: ['Cmd', 'Enter'], description: 'Submit message or form', category: 'Actions' },
  { keys: ['Cmd', 'S'], description: 'Save current work', category: 'Actions' },
  { keys: ['Cmd', 'Z'], description: 'Undo last action', category: 'Actions' },
  { keys: ['Cmd', 'Shift', 'Z'], description: 'Redo last action', category: 'Actions' },

  // Voice
  { keys: ['V'], description: 'Start voice recording', category: 'Voice' },
  { keys: ['Space'], description: 'Hold to record (when focused)', category: 'Voice' },

  // Productivity
  { keys: ['Cmd', 'N'], description: 'Create new task', category: 'Productivity' },
  { keys: ['Cmd', 'M'], description: 'Schedule meeting', category: 'Productivity' },
  { keys: ['Cmd', 'Shift', 'E'], description: 'Send email', category: 'Productivity' },

  // Quick Navigation
  { keys: ['G', 'H'], description: 'Go to Home/Dashboard', category: 'Quick Navigation' },
  { keys: ['G', 'S'], description: 'Go to Morning Signal', category: 'Quick Navigation' },
  { keys: ['G', 'E'], description: 'Go to AI Experts', category: 'Quick Navigation' },
  { keys: ['G', 'C'], description: 'Go to Chief of Staff', category: 'Quick Navigation' },
  { keys: ['G', 'W'], description: 'Go to Workflow', category: 'Quick Navigation' },
  { keys: ['G', 'L'], description: 'Go to Library', category: 'Quick Navigation' },
  { keys: ['G', 'V'], description: 'Go to Vault', category: 'Quick Navigation' },

  // Data & Export
  { keys: ['Cmd', 'Shift', 'S'], description: 'Export current view', category: 'Data & Export' },
  { keys: ['Cmd', 'P'], description: 'Print current page', category: 'Data & Export' },
  { keys: ['Cmd', 'Shift', 'C'], description: 'Copy selected text', category: 'Data & Export' },
];

const CATEGORIES = Array.from(new Set(SHORTCUTS.map((s) => s.category)));

export function KeyboardShortcutsGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Listen for Cmd+/ to open shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const filteredShortcuts = SHORTCUTS.filter((shortcut) => {
    const matchesSearch =
      shortcut.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shortcut.keys.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = !selectedCategory || shortcut.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const groupedShortcuts = CATEGORIES.reduce(
    (acc, category) => {
      acc[category] = filteredShortcuts.filter((s) => s.category === category);
      return acc;
    },
    {} as Record<string, Shortcut[]>
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50 transition-opacity" onClick={() => setIsOpen(false)} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col animate-in fade-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">Keyboard Shortcuts</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-secondary rounded-md transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search shortcuts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-secondary/50 border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Category filters */}
          <div className="flex gap-2 p-4 border-b border-border overflow-x-auto">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                !selectedCategory
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
              }`}
            >
              All
            </button>
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Shortcuts list */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {Object.entries(groupedShortcuts).map(([category, shortcuts]) => {
              if (shortcuts.length === 0) return null;

              return (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-foreground mb-3">{category}</h3>
                  <div className="space-y-2">
                    {shortcuts.map((shortcut, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border hover:border-primary/30 transition-colors">
                        <span className="text-sm text-muted-foreground">{shortcut.description}</span>
                        <div className="flex gap-1">
                          {shortcut.keys.map((key, keyIdx) => (
                            <span key={keyIdx}>
                              <kbd className="px-2 py-1 text-xs font-medium bg-background border border-border rounded text-foreground">
                                {key}
                              </kbd>
                              {keyIdx < shortcut.keys.length - 1 && <span className="mx-1 text-muted-foreground">+</span>}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {filteredShortcuts.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No shortcuts found matching your search.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border bg-secondary/20 flex items-center justify-between text-xs text-muted-foreground">
            <p>Press <kbd className="px-2 py-1 bg-background border border-border rounded">Cmd</kbd> + <kbd className="px-2 py-1 bg-background border border-border rounded">/</kbd> to toggle this guide</p>
            <Button size="sm" variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
