import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, Brain, MessageSquare, Check, AlertCircle,
  ChevronDown, ChevronUp, Sparkles, ThumbsUp, ThumbsDown,
  RotateCcw, Send
} from 'lucide-react';
import { AIExpert, CorporatePartner } from '@/data/aiExperts';

interface SMEContribution {
  id: string;
  expertId: string;
  section: string;
  type: 'insight' | 'recommendation' | 'question' | 'concern' | 'approval';
  content: string;
  timestamp: Date;
  weight: number; // 1-10 authority on this topic
  userFeedback?: 'accepted' | 'rejected' | 'modified';
  modifiedContent?: string;
}

interface ActiveSME {
  expert: AIExpert | CorporatePartner;
  isCorporate: boolean;
  status: 'listening' | 'thinking' | 'contributing' | 'awaiting_response';
  contributions: SMEContribution[];
  weight: number; // Overall authority weight
}

interface SMEPanelProps {
  activeSMEs: ActiveSME[];
  currentSection: string;
  onAcceptContribution: (contributionId: string) => void;
  onRejectContribution: (contributionId: string) => void;
  onModifyContribution: (contributionId: string, newContent: string) => void;
  onRequestClarification: (expertId: string, question: string) => void;
}

export function SMEPanel({
  activeSMEs,
  currentSection,
  onAcceptContribution,
  onRejectContribution,
  onModifyContribution,
  onRequestClarification
}: SMEPanelProps) {
  const [expandedExperts, setExpandedExperts] = useState<string[]>([]);
  const [clarificationInput, setClarificationInput] = useState<Record<string, string>>({});

  const toggleExpanded = (expertId: string) => {
    setExpandedExperts(prev => 
      prev.includes(expertId) 
        ? prev.filter(id => id !== expertId)
        : [...prev, expertId]
    );
  };

  const getStatusColor = (status: ActiveSME['status']) => {
    switch (status) {
      case 'contributing': return 'text-green-400 border-green-500/30';
      case 'thinking': return 'text-yellow-400 border-yellow-500/30';
      case 'awaiting_response': return 'text-fuchsia-400 border-fuchsia-500/30';
      default: return 'text-foreground/70 border-white/20';
    }
  };

  const getStatusLabel = (status: ActiveSME['status']) => {
    switch (status) {
      case 'contributing': return '💬 Contributing';
      case 'thinking': return '🤔 Analyzing';
      case 'awaiting_response': return '❓ Needs Input';
      default: return '👂 Listening';
    }
  };

  const getContributionIcon = (type: SMEContribution['type']) => {
    switch (type) {
      case 'insight': return <Sparkles className="w-3 h-3 text-cyan-400" />;
      case 'recommendation': return <ThumbsUp className="w-3 h-3 text-green-400" />;
      case 'question': return <MessageSquare className="w-3 h-3 text-yellow-400" />;
      case 'concern': return <AlertCircle className="w-3 h-3 text-orange-400" />;
      case 'approval': return <Check className="w-3 h-3 text-green-400" />;
    }
  };

  const getContributionBg = (type: SMEContribution['type']) => {
    switch (type) {
      case 'insight': return 'bg-cyan-500/10 border-cyan-500/20';
      case 'recommendation': return 'bg-green-500/10 border-green-500/20';
      case 'question': return 'bg-yellow-500/10 border-yellow-500/20';
      case 'concern': return 'bg-orange-500/10 border-orange-500/20';
      case 'approval': return 'bg-green-500/10 border-green-500/20';
    }
  };

  const relevantSMEs = activeSMEs.filter(sme => 
    sme.contributions.some(c => c.section === currentSection) || 
    sme.status !== 'listening'
  );

  const pendingContributions = activeSMEs.flatMap(sme => 
    sme.contributions.filter(c => !c.userFeedback && c.section === currentSection)
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-fuchsia-400" />
          <h3 className="font-semibold text-white">Expert Panel</h3>
          <Badge variant="outline" className="border-white/20 text-foreground/70 text-xs">
            {activeSMEs.length} active
          </Badge>
        </div>
        {pendingContributions.length > 0 && (
          <Badge className="bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30">
            {pendingContributions.length} pending review
          </Badge>
        )}
      </div>

      {/* Active Experts */}
      <div className="space-y-3">
        {activeSMEs.map(sme => {
          const isExpanded = expandedExperts.includes(sme.expert.id);
          const sectionContributions = sme.contributions.filter(c => c.section === currentSection);
          const hasUnreviewed = sectionContributions.some(c => !c.userFeedback);

          return (
            <div 
              key={sme.expert.id}
              className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
            >
              {/* Expert Header */}
              <button
                onClick={() => toggleExpanded(sme.expert.id)}
                className="w-full p-3 flex items-center gap-3 hover:bg-white/5 transition-colors"
              >
                <span className="text-2xl">
                  {sme.isCorporate 
                    ? (sme.expert as CorporatePartner).logo 
                    : (sme.expert as AIExpert).avatar}
                </span>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white truncate">
                      {sme.expert.name}
                    </p>
                    {sme.isCorporate && (
                      <Badge variant="outline" className="text-[10px] border-fuchsia-500/30 text-fuchsia-400">
                        Corporate
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-foreground/70 truncate">
                    {sme.isCorporate 
                      ? (sme.expert as CorporatePartner).methodology 
                      : (sme.expert as AIExpert).specialty}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] ${getStatusColor(sme.status)}`}
                  >
                    {getStatusLabel(sme.status)}
                  </Badge>
                  {hasUnreviewed && (
                    <div className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse" />
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-foreground/70" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-foreground/70" />
                  )}
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-white/10 p-3 space-y-3">
                  {/* Weight Indicator */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-foreground/60">Authority on this topic:</span>
                    <div className="flex gap-0.5">
                      {[...Array(10)].map((_, i) => (
                        <div 
                          key={i}
                          className={`w-2 h-2 rounded-sm ${
                            i < sme.weight ? 'bg-fuchsia-500' : 'bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-fuchsia-400">{sme.weight}/10</span>
                  </div>

                  {/* Contributions */}
                  {sectionContributions.length > 0 ? (
                    <div className="space-y-2">
                      {sectionContributions.map(contribution => (
                        <div 
                          key={contribution.id}
                          className={`p-3 rounded-lg border ${getContributionBg(contribution.type)} ${
                            contribution.userFeedback === 'rejected' ? 'opacity-50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {getContributionIcon(contribution.type)}
                            <div className="flex-1">
                              <p className="text-sm text-gray-200">
                                {contribution.userFeedback === 'modified' 
                                  ? contribution.modifiedContent 
                                  : contribution.content}
                              </p>
                              <p className="text-[10px] text-foreground/60 mt-1">
                                {new Date(contribution.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>

                          {/* Feedback Actions */}
                          {!contribution.userFeedback && (
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onAcceptContribution(contribution.id)}
                                className="h-7 text-xs text-green-400 hover:text-green-300 hover:bg-green-500/10"
                              >
                                <Check className="w-3 h-3 mr-1" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onRejectContribution(contribution.id)}
                                className="h-7 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              >
                                <ThumbsDown className="w-3 h-3 mr-1" />
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs text-foreground/70 hover:text-white hover:bg-white/10"
                              >
                                <RotateCcw className="w-3 h-3 mr-1" />
                                Modify
                              </Button>
                            </div>
                          )}

                          {/* Feedback Status */}
                          {contribution.userFeedback && (
                            <div className="mt-2 pt-2 border-t border-white/10">
                              <Badge 
                                variant="outline" 
                                className={`text-[10px] ${
                                  contribution.userFeedback === 'accepted' 
                                    ? 'border-green-500/30 text-green-400'
                                    : contribution.userFeedback === 'rejected'
                                    ? 'border-red-500/30 text-red-400'
                                    : 'border-yellow-500/30 text-yellow-400'
                                }`}
                              >
                                {contribution.userFeedback === 'accepted' && '✓ Accepted'}
                                {contribution.userFeedback === 'rejected' && '✗ Rejected'}
                                {contribution.userFeedback === 'modified' && '✎ Modified'}
                              </Badge>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-foreground/60 text-center py-2">
                      No contributions for this section yet
                    </p>
                  )}

                  {/* Ask for Clarification */}
                  <div className="pt-2 border-t border-white/10">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={clarificationInput[sme.expert.id] || ''}
                        onChange={(e) => setClarificationInput(prev => ({
                          ...prev,
                          [sme.expert.id]: e.target.value
                        }))}
                        placeholder="Ask for clarification..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-fuchsia-500/50"
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          if (clarificationInput[sme.expert.id]) {
                            onRequestClarification(sme.expert.id, clarificationInput[sme.expert.id]);
                            setClarificationInput(prev => ({ ...prev, [sme.expert.id]: '' }));
                          }
                        }}
                        className="h-7 bg-fuchsia-500/20 hover:bg-fuchsia-500/30 text-fuchsia-300"
                      >
                        <Send className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {activeSMEs.length === 0 && (
        <div className="text-center py-8">
          <Brain className="w-12 h-12 mx-auto text-foreground/50 mb-3" />
          <p className="text-foreground/70 text-sm">
            Experts will automatically join based on your answers
          </p>
          <p className="text-foreground/60 text-xs mt-1">
            They'll provide insights, recommendations, and quality checks
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="pt-3 border-t border-white/10">
        <p className="text-[10px] text-foreground/60 mb-2">Contribution Types:</p>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1 text-[10px] text-foreground/70">
            <Sparkles className="w-3 h-3 text-cyan-400" /> Insight
          </div>
          <div className="flex items-center gap-1 text-[10px] text-foreground/70">
            <ThumbsUp className="w-3 h-3 text-green-400" /> Recommendation
          </div>
          <div className="flex items-center gap-1 text-[10px] text-foreground/70">
            <MessageSquare className="w-3 h-3 text-yellow-400" /> Question
          </div>
          <div className="flex items-center gap-1 text-[10px] text-foreground/70">
            <AlertCircle className="w-3 h-3 text-orange-400" /> Concern
          </div>
        </div>
      </div>
    </div>
  );
}
