import { useState, useRef, useEffect } from 'react';
import { ChevronDown, MessageSquare, Clock, Star, Search, Plus, Brain } from 'lucide-react';

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  starred?: boolean;
  expertId?: string;
  expertName?: string;
}

interface ConversationSwitcherProps {
  conversations: Conversation[];
  currentConversationId?: string;
  onSelect: (conversationId: string) => void;
  onNewConversation: () => void;
}

export function ConversationSwitcher({
  conversations,
  currentConversationId,
  onSelect,
  onNewConversation,
}: ConversationSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentConversation = conversations.find(c => c.id === currentConversationId);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort: starred first, then by timestamp
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    if (a.starred && !b.starred) return -1;
    if (!a.starred && b.starred) return 1;
    return b.timestamp.getTime() - a.timestamp.getTime();
  });

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-GB');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors w-full max-w-xs"
      >
        <MessageSquare className="w-4 h-4 text-primary flex-shrink-0" />
        <div className="flex-1 text-left truncate">
          <span className="text-sm text-foreground">
            {currentConversation?.title || 'Select conversation'}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Search */}
          <div className="p-3 border-b border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* New conversation button */}
          <button
            onClick={() => {
              onNewConversation();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors border-b border-gray-700"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Plus className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-primary">New Conversation</span>
          </button>

          {/* Conversation list */}
          <div className="max-h-80 overflow-y-auto">
            {sortedConversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No conversations found
              </div>
            ) : (
              sortedConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    onSelect(conv.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-800 transition-colors text-left ${
                    conv.id === currentConversationId ? 'bg-gray-800' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0">
                    {conv.expertName ? (
                      <Brain className="w-4 h-4 text-pink-500" />
                    ) : (
                      <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">
                        {conv.title}
                      </span>
                      {conv.starred && (
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                      )}
                    </div>
                    {conv.expertName && (
                      <div className="text-xs text-primary truncate">
                        with {conv.expertName}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground truncate mt-0.5">
                      {conv.lastMessage}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    {formatTimestamp(conv.timestamp)}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-gray-700 bg-gray-800/50">
            <div className="text-xs text-center text-muted-foreground">
              {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Hook for managing conversation history
export function useConversationHistory() {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('brain_conversations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConversations(parsed.map((c: any) => ({
          ...c,
          timestamp: new Date(c.timestamp),
        })));
      } catch (e) {
        console.error('Failed to parse conversations:', e);
      }
    }
  }, []);

  const addConversation = (conv: Omit<Conversation, 'id' | 'timestamp'>) => {
    const newConv: Conversation = {
      ...conv,
      id: `conv_${Date.now()}`,
      timestamp: new Date(),
    };
    setConversations(prev => {
      const updated = [newConv, ...prev];
      localStorage.setItem('brain_conversations', JSON.stringify(updated));
      return updated;
    });
    return newConv.id;
  };

  const updateConversation = (id: string, updates: Partial<Conversation>) => {
    setConversations(prev => {
      const updated = prev.map(c => 
        c.id === id ? { ...c, ...updates, timestamp: new Date() } : c
      );
      localStorage.setItem('brain_conversations', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleStar = (id: string) => {
    setConversations(prev => {
      const updated = prev.map(c => 
        c.id === id ? { ...c, starred: !c.starred } : c
      );
      localStorage.setItem('brain_conversations', JSON.stringify(updated));
      return updated;
    });
  };

  return { conversations, addConversation, updateConversation, toggleStar };
}
