import { useState } from 'react';
import { 
  CheckCircle, XCircle, Clock, MessageSquare, Mail, 
  Calendar, FileText, AlertTriangle, ChevronRight,
  Sparkles, Bot, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SwipeableItem, SwipeHint } from '@/components/SwipeGestures';
import { useIsMobile } from '@/hooks/useMobile';
import { PullToRefresh } from '@/components/PullToRefresh';

interface ReviewItem {
  id: string;
  type: 'email_draft' | 'meeting_action' | 'task_suggestion' | 'document_edit' | 'decision';
  title: string;
  description: string;
  source: 'digital_twin' | 'ai_expert';
  expertName?: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
  context?: string;
  suggestedAction?: string;
}

// Mock data for review items
const mockReviewItems: ReviewItem[] = [
  {
    id: '1',
    type: 'email_draft',
    title: 'Response to Client Proposal',
    description: 'Draft email accepting the revised timeline with conditions',
    source: 'digital_twin',
    priority: 'high',
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    context: 'Client sent revised proposal yesterday. Your Chief of Staff drafted a response based on your communication style.',
    suggestedAction: 'Send with minor edits',
  },
  {
    id: '2',
    type: 'meeting_action',
    title: 'Schedule Follow-up with Marketing',
    description: 'Book 30-min sync to discuss Q2 campaign results',
    source: 'ai_expert',
    expertName: 'Strategic Advisor',
    priority: 'medium',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    context: 'Based on your meeting notes, a follow-up was recommended.',
    suggestedAction: 'Schedule for next Tuesday',
  },
  {
    id: '3',
    type: 'task_suggestion',
    title: 'Prioritize Budget Review',
    description: 'Move budget review to top of today\'s tasks based on deadline',
    source: 'digital_twin',
    priority: 'high',
    createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    context: 'Budget submission deadline is tomorrow. Currently ranked 4th in your task list.',
    suggestedAction: 'Move to priority #1',
  },
  {
    id: '4',
    type: 'document_edit',
    title: 'Project Brief Updates',
    description: 'AI suggested improvements to executive summary section',
    source: 'ai_expert',
    expertName: 'Business Writer',
    priority: 'low',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    context: 'Document was flagged for clarity improvements.',
    suggestedAction: 'Review and apply edits',
  },
  {
    id: '5',
    type: 'decision',
    title: 'Vendor Selection Recommendation',
    description: 'Analysis complete: Vendor B recommended based on cost-benefit analysis',
    source: 'ai_expert',
    expertName: 'Financial Analyst',
    priority: 'medium',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    context: 'Compared 3 vendors across 12 criteria. Full report available.',
    suggestedAction: 'Approve Vendor B selection',
  },
];

const typeIcons: Record<ReviewItem['type'], typeof Mail> = {
  email_draft: Mail,
  meeting_action: Calendar,
  task_suggestion: CheckCircle,
  document_edit: FileText,
  decision: AlertTriangle,
};

const typeLabels: Record<ReviewItem['type'], string> = {
  email_draft: 'Email Draft',
  meeting_action: 'Meeting Action',
  task_suggestion: 'Task Suggestion',
  document_edit: 'Document Edit',
  decision: 'Decision',
};

const priorityColors: Record<ReviewItem['priority'], string> = {
  high: 'text-red-400 bg-red-500/10 border-red-500/20',
  medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  low: 'text-green-400 bg-green-500/10 border-green-500/20',
};

export default function ReviewQueue() {
  const [items, setItems] = useState<ReviewItem[]>(mockReviewItems);
  const [filter, setFilter] = useState<'all' | 'digital_twin' | 'ai_expert'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const filteredItems = items.filter(item => 
    filter === 'all' || item.source === filter
  );

  const handleApprove = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    // In production, this would call an API to execute the action
  };

  const handleReject = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    // In production, this would call an API to reject/dismiss
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString('en-GB');
  };

  const handleRefresh = async () => {
    // Simulate data refresh - in production would refetch review items
    await new Promise(resolve => setTimeout(resolve, 1000));
    setItems(mockReviewItems); // Reset to mock data for demo
  };

  return (
    <PullToRefresh onRefresh={handleRefresh} disabled={!isMobile}>
    <div className="h-full flex flex-col p-4 md:p-6 overflow-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Review Queue</h1>
        </div>
        <p className="text-muted-foreground">Items awaiting your approval from Chief of Staff and AI Experts</p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card/50 rounded-xl p-4 border border-border/50">
          <div className="text-2xl font-bold text-foreground">{items.length}</div>
          <div className="text-sm text-muted-foreground">Pending Items</div>
        </div>
        <div className="bg-card/50 rounded-xl p-4 border border-border/50">
          <div className="text-2xl font-bold text-red-400">
            {items.filter(i => i.priority === 'high').length}
          </div>
          <div className="text-sm text-muted-foreground">High Priority</div>
        </div>
        <div className="bg-card/50 rounded-xl p-4 border border-border/50">
          <div className="text-2xl font-bold text-primary">
            {items.filter(i => i.source === 'digital_twin').length}
          </div>
          <div className="text-sm text-muted-foreground">From Twin</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <div className="flex gap-2">
          {(['all', 'digital_twin', 'ai_expert'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card/50 text-muted-foreground hover:bg-card'
              )}
            >
              {f === 'all' ? 'All' : f === 'digital_twin' ? 'Chief of Staff' : 'AI Experts'}
            </button>
          ))}
        </div>
      </div>

      {/* Swipe hint for mobile */}
      {isMobile && filteredItems.length > 0 && (
        <SwipeHint className="mb-4" />
      )}

      {/* Review Items */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">All caught up!</h3>
            <p className="text-muted-foreground">No items waiting for your review.</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const Icon = typeIcons[item.type];
            const isExpanded = expandedId === item.id;
            
            const itemContent = (
              <div
                className={cn(
                  'bg-card/50 rounded-xl border border-border/50 overflow-hidden transition-all',
                  isExpanded && 'ring-1 ring-primary/30'
                )}
              >
                {/* Main Row */}
                <div
                  className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                      item.source === 'digital_twin' 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-cyan-500/20 text-cyan-400'
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          'px-2 py-0.5 rounded text-xs font-medium border',
                          priorityColors[item.priority]
                        )}>
                          {item.priority}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {typeLabels[item.type]}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(item.createdAt)}
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-foreground mb-1 truncate">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {item.description}
                      </p>
                      
                      {/* Source */}
                      <div className="flex items-center gap-2 mt-2">
                        {item.source === 'digital_twin' ? (
                          <div className="flex items-center gap-1 text-xs text-primary">
                            <Bot className="w-3 h-3" />
                            <span>Chief of Staff</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-xs text-cyan-400">
                            <Sparkles className="w-3 h-3" />
                            <span>{item.expertName}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expand Arrow */}
                    <ChevronRight className={cn(
                      'w-5 h-5 text-muted-foreground transition-transform',
                      isExpanded && 'rotate-90'
                    )} />
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-border/50 pt-4">
                    {item.context && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Context</h4>
                        <p className="text-sm text-foreground">{item.context}</p>
                      </div>
                    )}
                    
                    {item.suggestedAction && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Suggested Action</h4>
                        <p className="text-sm text-primary font-medium">{item.suggestedAction}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprove(item.id);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReject(item.id);
                        }}
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                      <Button variant="ghost" className="ml-auto">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Discuss
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
            
            // Wrap with SwipeableItem on mobile
            if (isMobile) {
              return (
                <SwipeableItem
                  key={item.id}
                  onSwipeRight={() => handleApprove(item.id)}
                  onSwipeLeft={() => handleReject(item.id)}
                  leftAction={{
                    icon: <CheckCircle className="w-5 h-5" />,
                    color: 'bg-green-500',
                    label: 'Approve',
                  }}
                  rightAction={{
                    icon: <XCircle className="w-5 h-5" />,
                    color: 'bg-red-500',
                    label: 'Reject',
                  }}
                  threshold={80}
                >
                  {itemContent}
                </SwipeableItem>
              );
            }
            
            return <div key={item.id}>{itemContent}</div>;
          })
        )}
      </div>
    </div>
    </PullToRefresh>
  );
}
