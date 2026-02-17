import { useState, useEffect, useRef } from 'react';
import {
  Search, X, FileText, MessageSquare, FolderKanban,
  Lock, Users, Calendar, Clock, ArrowRight, Command,
  Hash, Filter, Sparkles
} from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'document' | 'conversation' | 'project' | 'vault' | 'expert' | 'task' | 'event';
  title: string;
  excerpt?: string;
  path?: string;
  date?: Date;
  relevance: number;
}

interface SearchFilter {
  type: string | null;
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
}

export function GlobalSearch({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filters, setFilters] = useState<SearchFilter>({ type: null, dateRange: 'all' });
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Celadon project status',
    'Board meeting notes',
    'Sarah contact'
  ]);
  const inputRef = useRef<HTMLInputElement>(null);

  const typeConfig = {
    document: { icon: FileText, color: 'text-blue-400', label: 'Document' },
    conversation: { icon: MessageSquare, color: 'text-green-400', label: 'Conversation' },
    project: { icon: FolderKanban, color: 'text-purple-400', label: 'Project' },
    vault: { icon: Lock, color: 'text-red-400', label: 'Vault' },
    expert: { icon: Users, color: 'text-cyan-400', label: 'AI Expert' },
    task: { icon: Hash, color: 'text-orange-400', label: 'Task' },
    event: { icon: Calendar, color: 'text-yellow-400', label: 'Event' },
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        handleResultClick(results[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    setSelectedIndex(0);

    // Simulate search - in production this would query the backend
    const timer = setTimeout(() => {
      const mockResults: SearchResult[] = [
        { id: '1', type: 'project' as const, title: 'Celadon Project', excerpt: 'Main development project - 67% complete', relevance: 95 },
        { id: '2', type: 'document' as const, title: 'Board Meeting Notes - Jan 2026', excerpt: 'Q4 review and 2026 planning discussion...', date: new Date(Date.now() - 86400000), relevance: 88 },
        { id: '3', type: 'conversation' as const, title: 'Strategy discussion', excerpt: 'Chief of Staff training approach and timeline...', date: new Date(Date.now() - 172800000), relevance: 82 },
        { id: '4', type: 'expert' as const, title: 'Dr. Sarah Chen - Strategy', excerpt: 'AI Expert specialising in business strategy', relevance: 75 },
        { id: '5', type: 'task' as const, title: 'Review legal documents', excerpt: 'Pending approval - Celadon contract', date: new Date(), relevance: 70 },
        { id: '6', type: 'vault' as const, title: 'API Credentials', excerpt: 'Asana, Zoom, Teams integration keys', relevance: 65 },
        { id: '7', type: 'event' as const, title: 'Board Meeting', excerpt: 'Tomorrow 10:00 - Quarterly review', date: new Date(Date.now() + 86400000), relevance: 60 },
      ].filter(r => 
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.excerpt?.toLowerCase().includes(query.toLowerCase())
      );

      // Apply type filter
      const filtered = filters.type 
        ? mockResults.filter(r => r.type === filters.type)
        : mockResults;

      setResults(filtered.sort((a, b) => b.relevance - a.relevance));
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, filters]);

  const handleResultClick = (result: SearchResult) => {
    // Save to recent searches
    setRecentSearches(prev => [query, ...prev.filter(s => s !== query)].slice(0, 5));
    
    // Navigate based on type
    const paths: Record<string, string> = {
      document: '/library',
      conversation: '/digital-twin',
      project: '/workflow',
      vault: '/vault',
      expert: '/ai-experts',
      task: '/review-queue',
      event: '/daily-brief',
    };
    
    window.location.href = paths[result.type] || '/';
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Search Modal */}
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search everything..."
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-lg"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-700 rounded text-xs text-muted-foreground">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border overflow-x-auto">
          <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          {['all', 'document', 'project', 'conversation', 'task', 'vault'].map(type => (
            <button
              key={type}
              onClick={() => setFilters(prev => ({ ...prev, type: type === 'all' ? null : type }))}
              className={`px-2.5 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
                (type === 'all' && !filters.type) || filters.type === type
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-gray-700 text-muted-foreground hover:text-foreground'
              }`}
            >
              {type === 'all' ? 'All' : typeConfig[type as keyof typeof typeConfig]?.label || type}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-auto">
          {isSearching ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : query && results.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No results found</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Try different keywords</p>
            </div>
          ) : query ? (
            <div className="py-2">
              {results.map((result, index) => {
                const config = typeConfig[result.type];
                const Icon = config.icon;
                
                return (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className={`w-full px-4 py-3 flex items-start gap-3 transition-colors ${
                      index === selectedIndex ? 'bg-gray-800' : 'hover:bg-gray-800/50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground truncate">{result.title}</span>
                        <span className={`text-xs ${config.color}`}>{config.label}</span>
                      </div>
                      {result.excerpt && (
                        <p className="text-sm text-muted-foreground truncate">{result.excerpt}</p>
                      )}
                      {result.date && (
                        <p className="text-xs text-muted-foreground/70 mt-0.5">
                          {result.date.toLocaleDateString('en-GB')}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-2" />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-4">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="px-4 mb-4">
                  <p className="text-xs text-muted-foreground mb-2">Recent</p>
                  <div className="space-y-1">
                    {recentSearches.map((search, i) => (
                      <button
                        key={i}
                        onClick={() => setQuery(search)}
                        className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-800 rounded-lg transition-colors text-left"
                      >
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">{search}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="px-4">
                <p className="text-xs text-muted-foreground mb-2">Quick Actions</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'New task', icon: Hash, path: '/review-queue' },
                    { label: 'Ask Chief of Staff', icon: Sparkles, path: '/digital-twin' },
                    { label: 'View calendar', icon: Calendar, path: '/daily-brief' },
                    { label: 'Open vault', icon: Lock, path: '/vault' },
                  ].map(action => (
                    <button
                      key={action.label}
                      onClick={() => { window.location.href = action.path; onClose(); }}
                      className="px-3 py-2 flex items-center gap-2 bg-gray-800/50 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <action.icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 bg-gray-700 rounded">↑↓</span>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 bg-gray-700 rounded">↵</span>
              Open
            </span>
            <span className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 bg-gray-700 rounded">esc</span>
              Close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook to manage global search state
export function useGlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
