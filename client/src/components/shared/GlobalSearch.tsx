import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import {
  Search,
  X,
  FileText,
  FolderKanban,
  Mic,
  Hash,
  Calendar,
  Command,
  Filter,
  Loader2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

type ResultType = "task" | "project" | "briefing" | "voice_note";

interface SearchResult {
  id: string;
  type: ResultType;
  title: string;
  excerpt: string;
  path: string;
  createdAt: string;
}

const TYPE_CONFIG: Record<
  ResultType,
  { icon: React.ElementType; color: string; label: string }
> = {
  task: { icon: Hash, color: "text-orange-400", label: "Task" },
  project: { icon: FolderKanban, color: "text-purple-400", label: "Project" },
  briefing: { icon: Calendar, color: "text-blue-400", label: "Briefing" },
  voice_note: { icon: Mic, color: "text-green-400", label: "Voice Note" },
};

const FILTER_TYPES: Array<{ value: ResultType | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "task", label: "Tasks" },
  { value: "project", label: "Projects" },
  { value: "briefing", label: "Briefings" },
  { value: "voice_note", label: "Voice Notes" },
];

export function GlobalSearch({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [typeFilter, setTypeFilter] = useState<ResultType | "all">("all");
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setDebouncedQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // tRPC search query
  const { data, isFetching } = trpc.globalSearch.search.useQuery(
    {
      query: debouncedQuery,
      types: typeFilter === "all" ? undefined : [typeFilter],
      limit: 20,
    },
    {
      enabled: debouncedQuery.trim().length >= 1,
    }
  );

  const results: SearchResult[] = data?.results ?? [];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && results[selectedIndex]) {
        handleResultClick(results[selectedIndex]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, results, selectedIndex, onClose]);

  const handleResultClick = (result: SearchResult) => {
    setLocation(result.path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Global search"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Search Modal */}
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
          {isFetching ? (
            <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-muted-foreground" />
          )}
          <input
            ref={inputRef}
            type="text"
            role="searchbox"
            aria-label="Search tasks, projects, briefings, and voice notes"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search everything..."
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-lg"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="p-1 hover:bg-muted rounded transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs text-muted-foreground">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </div>

        {/* Type Filters */}
        <div
          className="flex items-center gap-2 px-4 py-2 border-b border-border overflow-x-auto"
          role="group"
          aria-label="Filter by type"
        >
          <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          {FILTER_TYPES.map(f => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              aria-pressed={typeFilter === f.value}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                typeFilter === f.value
                  ? "bg-accent text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Results */}
        <div
          className="max-h-[400px] overflow-y-auto"
          role="listbox"
          aria-label="Search results"
        >
          {debouncedQuery.trim().length === 0 ? (
            <div className="px-4 py-8 text-center text-muted-foreground text-sm">
              <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p>Start typing to search across all your data</p>
              <p className="text-xs mt-1 opacity-60">
                Tasks · Projects · Briefings · Voice Notes
              </p>
            </div>
          ) : results.length === 0 && !isFetching ? (
            <div className="px-4 py-8 text-center text-muted-foreground text-sm">
              <FileText className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p>No results found for &ldquo;{debouncedQuery}&rdquo;</p>
            </div>
          ) : (
            <ul>
              {results.map((result, index) => {
                const config = TYPE_CONFIG[result.type];
                const Icon = config.icon;
                return (
                  <li
                    key={result.id}
                    role="option"
                    aria-selected={index === selectedIndex}
                    onClick={() => handleResultClick(result)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      "flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors",
                      index === selectedIndex
                        ? "bg-accent/10"
                        : "hover:bg-muted/40"
                    )}
                  >
                    <div
                      className={cn(
                        "mt-0.5 p-1.5 rounded-lg bg-muted flex-shrink-0",
                        config.color
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-foreground truncate">
                          {result.title}
                        </span>
                        <span
                          className={cn(
                            "text-xs px-1.5 py-0.5 rounded-full bg-muted flex-shrink-0",
                            config.color
                          )}
                        >
                          {config.label}
                        </span>
                      </div>
                      {result.excerpt && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {result.excerpt}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-border text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="px-1.5 py-0.5 bg-muted rounded">↑↓</span>
            Navigate
          </span>
          <span className="flex items-center gap-1">
            <span className="px-1.5 py-0.5 bg-muted rounded">↵</span>
            Open
          </span>
          <span className="flex items-center gap-1">
            <span className="px-1.5 py-0.5 bg-muted rounded">esc</span>
            Close
          </span>
          {data && (
            <span className="ml-auto opacity-60">
              {data.total} result{data.total !== 1 ? "s" : ""}
            </span>
          )}
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
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(prev => !prev),
  };
}
