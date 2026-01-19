import { useState } from 'react';
import { 
  Shield, ShieldCheck, ShieldAlert, ShieldQuestion,
  AlertTriangle, CheckCircle, XCircle, HelpCircle,
  MessageSquare, FileText, Link2, ExternalLink,
  ChevronDown, ChevronUp, Fingerprint, Brain,
  BookOpen, Quote, Scale, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { 
  type Insight, 
  type Challenge, 
  type Reference,
  type Citation,
  type ValidationResult,
  type ConfidenceLevel,
  type VerificationStatus,
  CONFIDENCE_INDICATORS,
  VERIFICATION_STATUS_LABELS,
  SOURCE_TYPE_LABELS,
  generateChallengeQuestions,
  validateInsight,
  formatCitationFootnote,
} from '@/lib/insightValidation';

// ============================================================================
// CONFIDENCE BADGE
// ============================================================================

interface ConfidenceBadgeProps {
  confidence: ConfidenceLevel;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ConfidenceBadge({ confidence, showLabel = true, size = 'md' }: ConfidenceBadgeProps) {
  const config = CONFIDENCE_INDICATORS[confidence];
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  };
  
  return (
    <Badge 
      className={`${config.bgColor} ${config.color} border ${config.borderColor} ${sizeClasses[size]}`}
      title={config.description}
    >
      <span className="mr-1">{config.icon}</span>
      {showLabel && config.label}
    </Badge>
  );
}

// ============================================================================
// VERIFICATION STATUS BADGE
// ============================================================================

interface VerificationBadgeProps {
  status: VerificationStatus;
  showLabel?: boolean;
}

export function VerificationBadge({ status, showLabel = true }: VerificationBadgeProps) {
  const config = VERIFICATION_STATUS_LABELS[status];
  
  return (
    <Badge variant="outline" className={config.color}>
      <span className="mr-1">{config.icon}</span>
      {showLabel && config.label}
    </Badge>
  );
}

// ============================================================================
// INSIGHT CARD WITH VALIDATION
// ============================================================================

interface InsightCardProps {
  insight: Insight;
  references: Reference[];
  onChallenge?: (challenge: Challenge) => void;
  onAddCitation?: (insightId: string) => void;
  onVerify?: (insightId: string) => void;
  showValidation?: boolean;
}

export function InsightCard({ 
  insight, 
  references,
  onChallenge,
  onAddCitation,
  onVerify,
  showValidation = true 
}: InsightCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showChallengeForm, setShowChallengeForm] = useState(false);
  const [challengeQuestion, setChallengeQuestion] = useState('');
  
  const validation = showValidation ? validateInsight(insight) : null;
  const suggestedQuestions = generateChallengeQuestions(insight);
  
  const typeIcons = {
    fact: <CheckCircle className="w-4 h-4 text-blue-500" />,
    opinion: <MessageSquare className="w-4 h-4 text-purple-500" />,
    recommendation: <Sparkles className="w-4 h-4 text-yellow-500" />,
    analysis: <Brain className="w-4 h-4 text-cyan-500" />,
    prediction: <HelpCircle className="w-4 h-4 text-orange-500" />,
  };
  
  const handleSubmitChallenge = () => {
    if (!challengeQuestion.trim() || !onChallenge) return;
    
    const challenge: Challenge = {
      id: `challenge-${Date.now()}`,
      insightId: insight.id,
      challengerId: 'digital_twin',
      challengerName: 'Chief of Staff',
      question: challengeQuestion,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    
    onChallenge(challenge);
    setChallengeQuestion('');
    setShowChallengeForm(false);
  };
  
  return (
    <Card className={`transition-all ${
      validation && !validation.isValid 
        ? 'border-orange-500/50 bg-orange-500/5' 
        : 'border-border bg-card/60'
    }`}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-secondary/50">
              {typeIcons[insight.type]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{insight.expertName}</span>
                <Badge variant="outline" className="text-xs capitalize">{insight.type}</Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                {SOURCE_TYPE_LABELS[insight.sourceType].label}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <ConfidenceBadge confidence={insight.confidence} size="sm" />
            <VerificationBadge status={insight.verificationStatus} showLabel={false} />
          </div>
        </div>
        
        {/* Content */}
        <p className="text-foreground mb-3">{insight.content}</p>
        
        {/* Citations */}
        {insight.citations.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {insight.citations.map((citation, idx) => {
              const ref = references.find(r => r.id === citation.referenceId);
              if (!ref) return null;
              
              return (
                <Badge 
                  key={citation.id}
                  variant="outline" 
                  className="text-xs cursor-pointer hover:bg-secondary"
                  title={formatCitationFootnote(citation, ref)}
                >
                  <FileText className="w-3 h-3 mr-1" />
                  [{idx + 1}] {ref.title.substring(0, 30)}...
                </Badge>
              );
            })}
          </div>
        )}
        
        {/* Validation Issues */}
        {validation && validation.issues.length > 0 && (
          <div className="mb-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-orange-500">Validation Issues</span>
            </div>
            <ul className="space-y-1">
              {validation.issues.map((issue, idx) => (
                <li key={idx} className="text-xs text-orange-400 flex items-start gap-2">
                  <span className={`mt-0.5 ${
                    issue.severity === 'critical' ? 'text-red-500' : 
                    issue.severity === 'warning' ? 'text-orange-500' : 'text-yellow-500'
                  }`}>•</span>
                  {issue.message}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Challenges */}
        {insight.challenges.length > 0 && (
          <div className="mb-3">
            <button 
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Fingerprint className="w-4 h-4" />
              {insight.challenges.length} Chief of Staff Challenge{insight.challenges.length > 1 ? 's' : ''}
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {expanded && (
              <div className="mt-2 space-y-2">
                {insight.challenges.map(challenge => (
                  <div 
                    key={challenge.id}
                    className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Fingerprint className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-medium text-purple-400">
                        {challenge.challengerName}
                      </span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {challenge.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground mb-2">{challenge.question}</p>
                    {challenge.response && (
                      <div className="mt-2 p-2 rounded bg-secondary/50">
                        <p className="text-sm text-muted-foreground">{challenge.response}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowChallengeForm(!showChallengeForm)}
          >
            <Fingerprint className="w-4 h-4 mr-1" />
            Challenge
          </Button>
          
          {onAddCitation && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onAddCitation(insight.id)}
            >
              <Link2 className="w-4 h-4 mr-1" />
              Add Citation
            </Button>
          )}
          
          {onVerify && insight.verificationStatus !== 'verified' && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onVerify(insight.id)}
            >
              <ShieldCheck className="w-4 h-4 mr-1" />
              Verify
            </Button>
          )}
        </div>
        
        {/* Challenge Form */}
        {showChallengeForm && (
          <div className="mt-3 p-3 rounded-lg bg-secondary/30 border border-border">
            <div className="mb-2">
              <span className="text-sm font-medium text-foreground">Challenge this insight</span>
              <p className="text-xs text-muted-foreground">
                The Chief of Staff will question the expert to verify accuracy
              </p>
            </div>
            
            {/* Suggested Questions */}
            <div className="flex flex-wrap gap-1 mb-2">
              {suggestedQuestions.slice(0, 3).map((q, idx) => (
                <Badge 
                  key={idx}
                  variant="outline" 
                  className="text-xs cursor-pointer hover:bg-primary/20"
                  onClick={() => setChallengeQuestion(q)}
                >
                  {q.substring(0, 40)}...
                </Badge>
              ))}
            </div>
            
            <Textarea
              value={challengeQuestion}
              onChange={(e) => setChallengeQuestion(e.target.value)}
              placeholder="Enter your challenge question..."
              className="mb-2 text-sm"
              rows={2}
            />
            
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSubmitChallenge}>
                Submit Challenge
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowChallengeForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// REFERENCE TABLE COMPONENT
// ============================================================================

interface ReferenceTableProps {
  references: Reference[];
  onVerify?: (referenceId: string) => void;
  onView?: (referenceId: string) => void;
}

export function ReferenceTable({ references, onVerify, onView }: ReferenceTableProps) {
  const typeIcons = {
    financial_model: '📊',
    contract: '📜',
    quote: '💬',
    research_paper: '📄',
    legal_document: '⚖️',
    data_source: '🗃️',
    expert_statement: '👤',
    other: '📎',
  };
  
  return (
    <Card className="bg-card/60 border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <BookOpen className="w-5 h-5 text-primary" />
          Reference Library
          <Badge className="ml-2">{references.length} sources</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">#</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Title</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Type</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Source</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Status</th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {references.map((ref, index) => (
                <tr key={ref.id} className="border-b border-border/50 hover:bg-secondary/30">
                  <td className="py-2 px-3 text-muted-foreground">{index + 1}</td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <span>{typeIcons[ref.type]}</span>
                      <span className="font-medium text-foreground">{ref.title}</span>
                    </div>
                    {ref.excerpt && (
                      <p className="text-xs text-muted-foreground mt-1 truncate max-w-xs">
                        "{ref.excerpt}"
                      </p>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    <Badge variant="outline" className="text-xs capitalize">
                      {ref.type.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="py-2 px-3 text-muted-foreground">
                    {ref.organization || ref.author || 'Unknown'}
                  </td>
                  <td className="py-2 px-3">
                    <VerificationBadge status={ref.verificationStatus} />
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex gap-1">
                      {onView && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onView(ref.id)}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                      {onVerify && ref.verificationStatus !== 'verified' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onVerify(ref.id)}
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {references.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No references added yet. Add citations to build your reference library.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// VALIDATION SUMMARY PANEL
// ============================================================================

interface ValidationSummaryProps {
  insights: Insight[];
  references: Reference[];
}

export function ValidationSummary({ insights, references }: ValidationSummaryProps) {
  const validatedCount = insights.filter(i => i.verificationStatus === 'verified').length;
  const pendingCount = insights.filter(i => i.verificationStatus === 'pending').length;
  const challengedCount = insights.filter(i => i.challenges.length > 0).length;
  const citedCount = insights.filter(i => i.citations.length > 0).length;
  
  const verifiedRefs = references.filter(r => r.verificationStatus === 'verified').length;
  
  const overallHealth = validatedCount / Math.max(insights.length, 1);
  const healthColor = overallHealth > 0.7 ? 'text-green-500' : overallHealth > 0.4 ? 'text-yellow-500' : 'text-red-500';
  
  return (
    <Card className="bg-card/60 border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Shield className="w-5 h-5 text-primary" />
          Validation Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-secondary/30">
            <div className="text-2xl font-bold text-green-500">{validatedCount}</div>
            <div className="text-xs text-muted-foreground">Verified</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary/30">
            <div className="text-2xl font-bold text-yellow-500">{pendingCount}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary/30">
            <div className="text-2xl font-bold text-purple-500">{challengedCount}</div>
            <div className="text-xs text-muted-foreground">Challenged</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary/30">
            <div className="text-2xl font-bold text-cyan-500">{citedCount}</div>
            <div className="text-xs text-muted-foreground">With Citations</div>
          </div>
        </div>
        
        <div className="mt-4 p-3 rounded-lg bg-secondary/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Overall Validation Health</span>
            <span className={`text-lg font-bold ${healthColor}`}>
              {Math.round(overallHealth * 100)}%
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className={`h-full ${
                overallHealth > 0.7 ? 'bg-green-500' : 
                overallHealth > 0.4 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${overallHealth * 100}%` }}
            />
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {verifiedRefs} of {references.length} references verified
          </span>
          <Badge variant="outline">
            {insights.length} total insights
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// chief of staff QA PANEL
// ============================================================================

interface DigitalTwinQAProps {
  insight: Insight;
  onSubmitChallenge: (question: string) => void;
  onAcceptInsight: () => void;
  onRejectInsight: () => void;
}

export function DigitalTwinQA({ 
  insight, 
  onSubmitChallenge,
  onAcceptInsight,
  onRejectInsight 
}: DigitalTwinQAProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [customQuestion, setCustomQuestion] = useState('');
  
  const suggestedQuestions = generateChallengeQuestions(insight);
  
  const handleChallenge = () => {
    const question = selectedQuestion || customQuestion;
    if (question) {
      onSubmitChallenge(question);
      setSelectedQuestion(null);
      setCustomQuestion('');
    }
  };
  
  return (
    <Card className="bg-purple-500/5 border-purple-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Fingerprint className="w-5 h-5 text-purple-400" />
          Chief of Staff QA Review
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Insight Preview */}
        <div className="p-3 rounded-lg bg-secondary/30 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-foreground">{insight.expertName}</span>
            <ConfidenceBadge confidence={insight.confidence} size="sm" />
          </div>
          <p className="text-sm text-foreground">{insight.content}</p>
        </div>
        
        {/* Challenge Questions */}
        <div>
          <span className="text-sm font-medium text-foreground mb-2 block">
            Challenge with a question:
          </span>
          <div className="space-y-2">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedQuestion(q)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedQuestion === q 
                    ? 'bg-purple-500/20 border-purple-500/50' 
                    : 'bg-secondary/30 border-border hover:border-purple-500/30'
                }`}
              >
                <span className="text-sm text-foreground">{q}</span>
              </button>
            ))}
          </div>
          
          <div className="mt-3">
            <Textarea
              value={customQuestion}
              onChange={(e) => {
                setCustomQuestion(e.target.value);
                setSelectedQuestion(null);
              }}
              placeholder="Or write your own challenge question..."
              className="text-sm"
              rows={2}
            />
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            onClick={handleChallenge}
            disabled={!selectedQuestion && !customQuestion}
            className="bg-purple-500 hover:bg-purple-600"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Challenge Expert
          </Button>
          <Button 
            variant="outline"
            onClick={onAcceptInsight}
            className="border-green-500/50 text-green-500 hover:bg-green-500/10"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Accept
          </Button>
          <Button 
            variant="outline"
            onClick={onRejectInsight}
            className="border-red-500/50 text-red-500 hover:bg-red-500/10"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
