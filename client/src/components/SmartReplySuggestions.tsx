import { useState } from 'react';
import { 
  MessageSquare, Sparkles, Send, Clock, 
  ThumbsUp, ThumbsDown, Edit2, Copy, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface SmartReply {
  id: string;
  text: string;
  tone: 'professional' | 'friendly' | 'brief' | 'detailed';
  confidence: number;
  estimatedReadTime: string;
}

interface SmartReplySuggestionsProps {
  context?: string;
  recipientName?: string;
  onSelect?: (reply: string) => void;
  onEdit?: (reply: string) => void;
}

// Generate contextual smart replies
function generateSmartReplies(context?: string, recipientName?: string): SmartReply[] {
  // In production, this would call the AI API
  const name = recipientName || 'there';
  
  return [
    {
      id: '1',
      text: `Hi ${name}, thanks for reaching out. I've reviewed the details and would be happy to discuss further. When works best for a quick call?`,
      tone: 'professional',
      confidence: 92,
      estimatedReadTime: '10s'
    },
    {
      id: '2',
      text: `Thanks for this! Let me take a closer look and get back to you by end of day.`,
      tone: 'brief',
      confidence: 88,
      estimatedReadTime: '5s'
    },
    {
      id: '3',
      text: `Hi ${name}! Great to hear from you. I've gone through everything and have a few thoughts to share. Would love to set up some time to walk through my feedback in detail. Does tomorrow afternoon work for you?`,
      tone: 'friendly',
      confidence: 85,
      estimatedReadTime: '15s'
    },
    {
      id: '4',
      text: `Thank you for sending this over. I've completed my review and have compiled detailed feedback on each section. Here are my key observations:\n\n1. The overall approach is solid\n2. I'd suggest reconsidering the timeline\n3. Budget allocation looks appropriate\n\nHappy to discuss any of these points further.`,
      tone: 'detailed',
      confidence: 78,
      estimatedReadTime: '30s'
    }
  ];
}

export function SmartReplySuggestions({ 
  context, 
  recipientName, 
  onSelect, 
  onEdit 
}: SmartReplySuggestionsProps) {
  const [replies] = useState(() => generateSmartReplies(context, recipientName));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'up' | 'down'>>({});

  const handleSelect = (reply: SmartReply) => {
    setSelectedId(reply.id);
    onSelect?.(reply.text);
    toast.success('Reply selected');
  };

  const handleCopy = async (reply: SmartReply) => {
    await navigator.clipboard.writeText(reply.text);
    setCopiedId(reply.id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Copied to clipboard');
  };

  const handleEdit = (reply: SmartReply) => {
    onEdit?.(reply.text);
    toast.info('Opening editor...');
  };

  const handleFeedback = (replyId: string, type: 'up' | 'down') => {
    setFeedbackGiven(prev => ({ ...prev, [replyId]: type }));
    toast.success('Thanks for your feedback!');
  };

  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'professional': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'friendly': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'brief': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'detailed': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-foreground/70 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="w-4 h-4 text-primary" />
        <span>AI-suggested replies</span>
      </div>
      
      <div className="space-y-2">
        {replies.map((reply) => (
          <div 
            key={reply.id}
            className={`p-3 rounded-lg border transition-colors cursor-pointer ${
              selectedId === reply.id 
                ? 'bg-primary/10 border-primary' 
                : 'bg-background/50 border-border hover:border-primary/30'
            }`}
            onClick={() => handleSelect(reply)}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`${getToneColor(reply.tone)} text-xs`}>
                  {reply.tone}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {reply.estimatedReadTime}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {reply.confidence}% match
              </span>
            </div>
            
            <p className="text-sm text-foreground whitespace-pre-line line-clamp-3">
              {reply.text}
            </p>
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFeedback(reply.id, 'up');
                  }}
                  disabled={!!feedbackGiven[reply.id]}
                >
                  <ThumbsUp className={`w-3 h-3 ${feedbackGiven[reply.id] === 'up' ? 'text-green-400' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFeedback(reply.id, 'down');
                  }}
                  disabled={!!feedbackGiven[reply.id]}
                >
                  <ThumbsDown className={`w-3 h-3 ${feedbackGiven[reply.id] === 'down' ? 'text-red-400' : ''}`} />
                </Button>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(reply);
                  }}
                >
                  {copiedId === reply.id ? (
                    <Check className="w-3 h-3 text-green-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(reply);
                  }}
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(reply);
                  }}
                >
                  <Send className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <Button variant="outline" size="sm" className="w-full">
        <Sparkles className="w-4 h-4 mr-2" />
        Generate More Options
      </Button>
    </div>
  );
}

// Compact inline version for quick replies
interface QuickRepliesProps {
  replies?: string[];
  onSelect?: (reply: string) => void;
}

export function QuickReplies({ 
  replies = ['Sounds good!', 'Let me check and get back to you', 'Can we schedule a call?', 'Thanks for the update'],
  onSelect 
}: QuickRepliesProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {replies.map((reply, i) => (
        <Button
          key={i}
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => {
            onSelect?.(reply);
            toast.success('Reply inserted');
          }}
        >
          {reply}
        </Button>
      ))}
    </div>
  );
}

export default SmartReplySuggestions;
