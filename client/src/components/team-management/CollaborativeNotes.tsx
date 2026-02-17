import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  FileText, Sparkles, User, Bot, Check, X, 
  RefreshCw, History, Eye, EyeOff, Lightbulb,
  ChevronDown, Copy, Download, PenLine, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc';

interface NoteSuggestion {
  id: string;
  type: 'expand' | 'clarify' | 'format' | 'add';
  original: string;
  suggestion: string;
  confidence: number;
  status: 'pending' | 'accepted' | 'rejected';
}

interface NoteVersion {
  id: string;
  content: string;
  timestamp: Date;
  author: 'user' | 'ai' | 'collaborative';
}

interface CollaborativeNotesProps {
  initialContent?: string;
  onSave?: (content: string) => void;
  className?: string;
}

export function CollaborativeNotes({ initialContent = '', onSave, className }: CollaborativeNotesProps) {
  const [content, setContent] = useState(initialContent);
  const [suggestions, setSuggestions] = useState<NoteSuggestion[]>([]);
  const [versions, setVersions] = useState<NoteVersion[]>([]);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [aiContribution, setAiContribution] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const chatMutation = trpc.chat.send.useMutation();

  // Auto-save version on significant changes
  useEffect(() => {
    if (content && content !== initialContent) {
      const lastVersion = versions[versions.length - 1];
      if (!lastVersion || content.length - lastVersion.content.length > 50) {
        setVersions(prev => [...prev, {
          id: `v-${Date.now()}`,
          content,
          timestamp: new Date(),
          author: 'user',
        }]);
      }
    }
  }, [content, initialContent, versions]);

  // Generate AI suggestions as user types
  const generateSuggestions = useCallback(async (text: string) => {
    if (text.length < 20) return;
    
    try {
      const result = await chatMutation.mutateAsync({
        message: `Analyze this note and provide 2-3 brief suggestions to improve it. Format each suggestion as:
TYPE: [expand/clarify/format/add]
ORIGINAL: [relevant excerpt]
SUGGESTION: [your improvement]
CONFIDENCE: [0.0-1.0]

Note content:
${text}`,
        context: 'note_enhancement',
      });

      // Parse suggestions from response
      const suggestionMatches = Array.from(result.message.matchAll(
        /TYPE:\s*(\w+)\s*\nORIGINAL:\s*(.+?)\s*\nSUGGESTION:\s*(.+?)\s*\nCONFIDENCE:\s*([\d.]+)/gi
      ));

      const newSuggestions: NoteSuggestion[] = [];
      for (const match of suggestionMatches) {
        newSuggestions.push({
          id: `s-${Date.now()}-${newSuggestions.length}`,
          type: match[1].toLowerCase() as NoteSuggestion['type'],
          original: match[2],
          suggestion: match[3],
          confidence: parseFloat(match[4]),
          status: 'pending',
        });
      }

      if (newSuggestions.length > 0) {
        setSuggestions(newSuggestions);
      }
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    }
  }, [chatMutation]);

  // Debounced suggestion generation
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      generateSuggestions(newContent);
    }, 2000);
  }, [generateSuggestions]);

  // Accept a suggestion
  const acceptSuggestion = useCallback((suggestion: NoteSuggestion) => {
    let newContent = content;
    
    if (suggestion.type === 'add') {
      newContent = content + '\n\n' + suggestion.suggestion;
    } else {
      newContent = content.replace(suggestion.original, suggestion.suggestion);
    }
    
    setContent(newContent);
    setSuggestions(prev => prev.map(s => 
      s.id === suggestion.id ? { ...s, status: 'accepted' } : s
    ));
    
    // Track AI contribution
    const aiChars = suggestion.suggestion.length;
    const totalChars = newContent.length;
    setAiContribution(prev => Math.min(100, prev + (aiChars / totalChars) * 100));
    
    // Save version
    setVersions(prev => [...prev, {
      id: `v-${Date.now()}`,
      content: newContent,
      timestamp: new Date(),
      author: 'collaborative',
    }]);
  }, [content]);

  // Reject a suggestion
  const rejectSuggestion = useCallback((id: string) => {
    setSuggestions(prev => prev.map(s => 
      s.id === id ? { ...s, status: 'rejected' } : s
    ));
  }, []);

  // Full AI enhancement
  const enhanceWithAI = useCallback(async () => {
    setIsEnhancing(true);
    try {
      const result = await chatMutation.mutateAsync({
        message: `Enhance and improve this note while preserving the original meaning and voice. Make it clearer, better organized, and more professional. Return only the enhanced note, no explanations.

Original note:
${content}`,
        context: 'note_enhancement',
      });

      const enhanced = result.message;
      setContent(enhanced);
      setVersions(prev => [...prev, {
        id: `v-${Date.now()}`,
        content: enhanced,
        timestamp: new Date(),
        author: 'ai',
      }]);
      setAiContribution(100);
    } catch (error) {
      console.error('Enhancement failed:', error);
    } finally {
      setIsEnhancing(false);
    }
  }, [content, chatMutation]);

  // Restore a version
  const restoreVersion = useCallback((version: NoteVersion) => {
    setContent(version.content);
    setShowHistory(false);
  }, []);

  const getSuggestionIcon = (type: NoteSuggestion['type']) => {
    const iconClass = 'w-4 h-4';
    switch (type) {
      case 'expand': return <PenLine className={iconClass} />;
      case 'clarify': return <Lightbulb className={iconClass} />;
      case 'format': return <Sparkles className={iconClass} />;
      case 'add': return <Plus className={iconClass} />;
    }
  };

  const getAuthorIcon = (author: NoteVersion['author']) => {
    switch (author) {
      case 'user': return <User className="w-3 h-3" />;
      case 'ai': return <Bot className="w-3 h-3" />;
      case 'collaborative': return <Sparkles className="w-3 h-3" />;
    }
  };

  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');

  return (
    <div className={cn('bg-card/60 border border-white/10 rounded-xl overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-r from-teal-500/10 to-cyan-500/10">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-teal-400" />
          <h3 className="font-medium text-foreground">Collaborative Notes</h3>
        </div>
        <div className="flex items-center gap-2">
          {/* AI Contribution Indicator */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <User className="w-3 h-3" />
            <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-teal-500 to-cyan-500"
                style={{ width: `${100 - aiContribution}%` }}
              />
            </div>
            <Bot className="w-3 h-3" />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs"
          >
            <History className="w-3 h-3 mr-1" />
            History
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Main Editor */}
        <div className="flex-1 p-4">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Start writing... AI will suggest improvements as you type."
            className="w-full h-64 p-3 bg-secondary/30 border border-white/10 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-sm placeholder:text-muted-foreground"
          />

          {/* Action Bar */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={enhanceWithAI}
                disabled={isEnhancing || !content}
                className="text-xs"
              >
                {isEnhancing ? (
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3 mr-1" />
                )}
                Enhance with AI
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="text-xs"
              >
                {showSuggestions ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                Suggestions
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigator.clipboard.writeText(content)}
                className="text-xs"
              >
                <Copy className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                onClick={() => onSave?.(content)}
                className="bg-teal-600 hover:bg-teal-700 text-white text-xs"
              >
                Save Note
              </Button>
            </div>
          </div>
        </div>

        {/* Suggestions Panel */}
        {showSuggestions && pendingSuggestions.length > 0 && (
          <div className="w-72 border-l border-white/10 p-4 bg-secondary/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                Suggestions
              </div>
              <span className="text-xs text-muted-foreground">{pendingSuggestions.length}</span>
            </div>

            <div className="space-y-3">
              {pendingSuggestions.map(suggestion => (
                <div
                  key={suggestion.id}
                  className="p-3 bg-secondary/30 rounded-lg border border-white/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">
                      {getSuggestionIcon(suggestion.type)} {suggestion.type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(suggestion.confidence * 100)}%
                    </span>
                  </div>
                  
                  {suggestion.original && (
                    <div className="text-xs text-muted-foreground mb-1 line-through">
                      {suggestion.original.substring(0, 50)}...
                    </div>
                  )}
                  
                  <div className="text-xs text-foreground mb-2">
                    {suggestion.suggestion.substring(0, 100)}...
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => acceptSuggestion(suggestion)}
                      className="flex-1 h-7 text-xs bg-teal-600 hover:bg-teal-700"
                    >
                      <Check className="w-3 h-3 mr-1" /> Accept
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => rejectSuggestion(suggestion.id)}
                      className="h-7 text-xs"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History Panel */}
        {showHistory && (
          <div className="w-72 border-l border-white/10 p-4 bg-secondary/10">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
              <History className="w-4 h-4" />
              Version History
            </div>

            <div className="space-y-2">
              {versions.length === 0 ? (
                <div className="text-xs text-muted-foreground text-center py-4">
                  No versions yet
                </div>
              ) : (
                [...versions].reverse().map(version => (
                  <button
                    key={version.id}
                    onClick={() => restoreVersion(version)}
                    className="w-full p-2 bg-secondary/30 rounded-lg border border-white/10 text-left hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1 text-xs">
                        {getAuthorIcon(version.author)}
                        <span className="capitalize text-muted-foreground">{version.author}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {version.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-xs text-foreground truncate">
                      {version.content.substring(0, 50)}...
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="px-4 py-2 border-t border-white/10 bg-secondary/20 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>{content.length} characters</span>
          <span>{content.split(/\s+/).filter(Boolean).length} words</span>
        </div>
        <div className="flex items-center gap-1">
          <span>AI contribution:</span>
          <span className={cn(
            aiContribution > 50 ? 'text-cyan-400' : 'text-teal-400'
          )}>
            {Math.round(aiContribution)}%
          </span>
        </div>
      </div>
    </div>
  );
}
