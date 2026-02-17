import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLocation } from 'wouter';
import { 
  Search, Command, ArrowRight, Sparkles, Calendar, FileText, 
  Brain, Users, Settings, Moon, Sun, Mic, CheckCircle2,
  Mail, Clock, Target, Zap, Home, BarChart3, Lock, BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandItem {
  id: string;
  title: string;
  description?: string;
  icon: React.ElementType;
  category: 'navigation' | 'action' | 'ai' | 'settings';
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [, setLocation] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Define all commands
  const commands: CommandItem[] = useMemo(() => [
    // Navigation
    { id: 'nav-dashboard', title: 'Go to Dashboard', icon: Home, category: 'navigation', shortcut: 'G D', action: () => { setLocation('/dashboard'); onClose(); } },
    { id: 'nav-daily-brief', title: 'Go to The Signal', icon: Calendar, category: 'navigation', shortcut: 'G B', action: () => { setLocation('/daily-brief'); onClose(); } },
    { id: 'nav-digital-twin', title: 'Go to Chief of Staff', icon: Brain, category: 'navigation', shortcut: 'G T', action: () => { setLocation('/digital-twin'); onClose(); } },
    { id: 'nav-ai-experts', title: 'Go to AI Experts', icon: Users, category: 'navigation', shortcut: 'G E', action: () => { setLocation('/ai-experts'); onClose(); } },
    { id: 'nav-workflow', title: 'Go to Workflow', icon: Target, category: 'navigation', shortcut: 'G W', action: () => { setLocation('/workflow'); onClose(); } },
    { id: 'nav-library', title: 'Go to Library', icon: BookOpen, category: 'navigation', shortcut: 'G L', action: () => { setLocation('/library'); onClose(); } },
    { id: 'nav-statistics', title: 'Go to Statistics', icon: BarChart3, category: 'navigation', shortcut: 'G S', action: () => { setLocation('/statistics'); onClose(); } },
    { id: 'nav-vault', title: 'Go to Vault', icon: Lock, category: 'navigation', shortcut: 'G V', action: () => { setLocation('/vault'); onClose(); } },
    { id: 'nav-settings', title: 'Go to Settings', icon: Settings, category: 'navigation', shortcut: 'G ,', action: () => { setLocation('/settings'); onClose(); } },
    
    // AI Actions
    { id: 'ai-ask', title: 'Ask Chief of Staff', description: 'Start a conversation with your AI assistant', icon: Brain, category: 'ai', shortcut: 'A T', action: () => { setLocation('/digital-twin?focus=input'); onClose(); } },
    { id: 'ai-draft', title: 'Draft with AI', description: 'Generate content using AI', icon: Sparkles, category: 'ai', shortcut: 'A D', action: () => { setLocation('/digital-twin?message=Help me draft'); onClose(); } },
    { id: 'ai-summarize', title: 'Summarize', description: 'Get AI summary of current context', icon: FileText, category: 'ai', shortcut: 'A S', action: () => { setLocation('/digital-twin?message=Summarize my day so far'); onClose(); } },
    { id: 'ai-schedule', title: 'Smart Schedule', description: 'Let AI optimize your schedule', icon: Calendar, category: 'ai', shortcut: 'A C', action: () => { setLocation('/digital-twin?message=Help me plan my schedule'); onClose(); } },
    { id: 'ai-voice', title: 'Voice Input', description: 'Speak to your Chief of Staff', icon: Mic, category: 'ai', shortcut: 'V', action: () => { setLocation('/digital-twin?voice=true'); onClose(); } },
    
    // Quick Actions
    { id: 'action-task', title: 'Create Task', description: 'Add a new task to your workflow', icon: CheckCircle2, category: 'action', shortcut: 'C T', action: () => { setLocation('/workflow?action=new-task'); onClose(); } },
    { id: 'action-email', title: 'Draft Email', description: 'Compose a new email with AI assistance', icon: Mail, category: 'action', shortcut: 'C E', action: () => { setLocation('/digital-twin?message=Help me draft an email'); onClose(); } },
    { id: 'action-meeting', title: 'Schedule Meeting', description: 'Set up a new meeting', icon: Clock, category: 'action', shortcut: 'C M', action: () => { setLocation('/digital-twin?message=Help me schedule a meeting'); onClose(); } },
    { id: 'action-focus', title: 'Start Focus Session', description: 'Block distractions and focus', icon: Zap, category: 'action', shortcut: 'F', action: () => { alert('Focus mode activated for 25 minutes'); onClose(); } },
    
    // Settings
    { id: 'settings-theme-dark', title: 'Switch to Dark Mode', icon: Moon, category: 'settings', action: () => { document.documentElement.classList.add('dark'); onClose(); } },
    { id: 'settings-theme-light', title: 'Switch to Light Mode', icon: Sun, category: 'settings', action: () => { document.documentElement.classList.remove('dark'); onClose(); } },
  ], [setLocation, onClose]);

  // Filter commands based on search
  const filteredCommands = useMemo(() => {
    if (!search) return commands;
    const lower = search.toLowerCase();
    return commands.filter(cmd => 
      cmd.title.toLowerCase().includes(lower) ||
      cmd.description?.toLowerCase().includes(lower) ||
      cmd.category.toLowerCase().includes(lower)
    );
  }, [commands, search]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {
      navigation: [],
      ai: [],
      action: [],
      settings: [],
    };
    filteredCommands.forEach(cmd => {
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }, [filteredCommands, selectedIndex, onClose]);

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    const selectedElement = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    selectedElement?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (!isOpen) return null;

  const categoryLabels: Record<string, string> = {
    navigation: 'Navigation',
    ai: 'AI Actions',
    action: 'Quick Actions',
    settings: 'Settings',
  };

  let flatIndex = 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Palette */}
      <div 
        className="relative w-full max-w-2xl bg-card border border-white/10 rounded-xl shadow-2xl overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm"
          />
          <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 bg-secondary/50 rounded text-xs text-muted-foreground">
            <Command className="w-3 h-3" />K
          </kbd>
        </div>

        {/* Command List */}
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No commands found</p>
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, items]) => {
              if (items.length === 0) return null;
              return (
                <div key={category} className="mb-4">
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {categoryLabels[category]}
                  </div>
                  {items.map((cmd) => {
                    const currentIndex = flatIndex++;
                    const isSelected = currentIndex === selectedIndex;
                    const Icon = cmd.icon;
                    
                    return (
                      <button
                        key={cmd.id}
                        data-index={currentIndex}
                        onClick={cmd.action}
                        onMouseEnter={() => setSelectedIndex(currentIndex)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                          isSelected ? 'bg-primary/20 text-foreground' : 'text-muted-foreground hover:bg-secondary/50'
                        )}
                      >
                        <div className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center',
                          isSelected ? 'bg-primary/30' : 'bg-secondary/50'
                        )}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{cmd.title}</div>
                          {cmd.description && (
                            <div className="text-xs text-muted-foreground truncate">{cmd.description}</div>
                          )}
                        </div>
                        {cmd.shortcut && (
                          <div className="flex items-center gap-1">
                            {cmd.shortcut.split(' ').map((key, i) => (
                              <kbd key={i} className="px-1.5 py-0.5 bg-secondary/50 rounded text-[10px] text-muted-foreground">
                                {key}
                              </kbd>
                            ))}
                          </div>
                        )}
                        {isSelected && (
                          <ArrowRight className="w-4 h-4 text-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1 bg-secondary/50 rounded">↑↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 bg-secondary/50 rounded">↵</kbd> Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 bg-secondary/50 rounded">Esc</kbd> Close
            </span>
          </div>
          <span className="text-primary">Powered by AI</span>
        </div>
      </div>
    </div>
  );
}

// Hook to manage command palette state
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
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
