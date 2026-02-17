import { useState } from 'react';
import { 
  Shield, ShieldCheck, ShieldAlert, ShieldQuestion,
  AlertTriangle, CheckCircle, XCircle, HelpCircle,
  MessageSquare, FileText, Brain, Fingerprint,
  ChevronDown, ChevronUp, Sparkles, Scale,
  Eye, ThumbsUp, ThumbsDown, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  type Insight, 
  type ConfidenceLevel,
  type VerificationStatus,
  CONFIDENCE_INDICATORS,
  TRUTH_VERIFICATION_PROMPT,
  EXPERT_VALIDATION_PROMPT,
  QA_CHALLENGE_PROMPTS,
} from '@/lib/insightValidation';
import { ConfidenceBadge, VerificationBadge } from '@/components/analytics/InsightValidation';

// ============================================================================
// TRUTH CLASSIFICATION TYPES
// ============================================================================

export type StatementClassification = 'fact' | 'analysis' | 'opinion' | 'speculation' | 'unknown';

export interface ClassifiedStatement {
  id: string;
  content: string;
  classification: StatementClassification;
  confidence: ConfidenceLevel;
  reasoning: string;
  requiredSources: string[];
  potentialIssues: string[];
  expertId: string;
  expertName: string;
}

// ============================================================================
// CLASSIFICATION BADGES
// ============================================================================

const CLASSIFICATION_CONFIG = {
  fact: {
    label: 'Fact',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    icon: CheckCircle,
    description: 'Objectively verifiable, backed by data/documents',
  },
  analysis: {
    label: 'Analysis',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    icon: Brain,
    description: 'Logical conclusion from facts, requires reasoning chain',
  },
  opinion: {
    label: 'Opinion',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    icon: MessageSquare,
    description: 'Professional judgment, may vary between experts',
  },
  speculation: {
    label: 'Speculation',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    icon: HelpCircle,
    description: 'Forward-looking, uncertain, based on assumptions',
  },
  unknown: {
    label: 'Unknown',
    color: 'text-foreground/60',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/30',
    icon: ShieldQuestion,
    description: 'Cannot be classified without more information',
  },
};

interface ClassificationBadgeProps {
  classification: StatementClassification;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ClassificationBadge({ classification, showLabel = true, size = 'md' }: ClassificationBadgeProps) {
  const config = CLASSIFICATION_CONFIG[classification];
  const Icon = config.icon;
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
      <Icon className="w-3 h-3 mr-1" />
      {showLabel && config.label}
    </Badge>
  );
}

// ============================================================================
// STATEMENT VERIFICATION CARD
// ============================================================================

interface StatementVerificationCardProps {
  statement: ClassifiedStatement;
  onClassify: (id: string, classification: StatementClassification) => void;
  onSetConfidence: (id: string, confidence: ConfidenceLevel) => void;
  onAddSource: (id: string, source: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onChallenge: (id: string, question: string) => void;
}

export function StatementVerificationCard({
  statement,
  onClassify,
  onSetConfidence,
  onAddSource,
  onApprove,
  onReject,
  onChallenge,
}: StatementVerificationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showChallengeForm, setShowChallengeForm] = useState(false);
  const [challengeQuestion, setChallengeQuestion] = useState('');
  const [newSource, setNewSource] = useState('');
  
  const handleChallenge = () => {
    if (challengeQuestion.trim()) {
      onChallenge(statement.id, challengeQuestion);
      setChallengeQuestion('');
      setShowChallengeForm(false);
    }
  };
  
  const handleAddSource = () => {
    if (newSource.trim()) {
      onAddSource(statement.id, newSource);
      setNewSource('');
    }
  };
  
  return (
    <Card className={`transition-all ${
      statement.potentialIssues.length > 0 
        ? 'border-orange-500/50 bg-orange-500/5' 
        : 'border-border bg-card/60'
    }`}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              {statement.expertName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ClassificationBadge classification={statement.classification} size="sm" />
            <ConfidenceBadge confidence={statement.confidence} size="sm" showLabel={false} />
          </div>
        </div>
        
        {/* Content */}
        <p className="text-foreground mb-3">{statement.content}</p>
        
        {/* Classification Reasoning */}
        {statement.reasoning && (
          <div className="text-sm text-muted-foreground mb-3 p-2 rounded bg-secondary/30">
            <span className="font-medium">Reasoning:</span> {statement.reasoning}
          </div>
        )}
        
        {/* Issues */}
        {statement.potentialIssues.length > 0 && (
          <div className="mb-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-orange-500">Potential Issues</span>
            </div>
            <ul className="space-y-1">
              {statement.potentialIssues.map((issue, idx) => (
                <li key={idx} className="text-xs text-orange-400 flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Required Sources */}
        {statement.requiredSources.length > 0 && (
          <div className="mb-3">
            <span className="text-xs text-muted-foreground block mb-1">Required Sources:</span>
            <div className="flex flex-wrap gap-1">
              {statement.requiredSources.map((source, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  <FileText className="w-3 h-3 mr-1" />
                  {source}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Expanded Controls */}
        <button 
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-3"
        >
          <Scale className="w-4 h-4" />
          Verification Controls
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {expanded && (
          <div className="space-y-4 p-3 rounded-lg bg-secondary/30 border border-border">
            {/* Classification Selector */}
            <div>
              <span className="text-xs text-muted-foreground block mb-2">Classify as:</span>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(CLASSIFICATION_CONFIG) as StatementClassification[]).map(cls => (
                  (() => {
                    const Icon = CLASSIFICATION_CONFIG[cls].icon;
                    return (
                      <Button
                        key={cls}
                        variant={statement.classification === cls ? "default" : "outline"}
                        size="sm"
                        onClick={() => onClassify(statement.id, cls)}
                        className={statement.classification === cls ? CLASSIFICATION_CONFIG[cls].bgColor : ''}
                      >
                        <Icon className="w-3 h-3 mr-1" />
                        {CLASSIFICATION_CONFIG[cls].label}
                      </Button>
                    );
                  })()
                ))}
              </div>
            </div>
            
            {/* Confidence Selector */}
            <div>
              <span className="text-xs text-muted-foreground block mb-2">Confidence Level:</span>
              <div className="flex flex-wrap gap-2">
                {(['high', 'medium', 'low', 'speculative'] as ConfidenceLevel[]).map(conf => (
                  <Button
                    key={conf}
                    variant={statement.confidence === conf ? "default" : "outline"}
                    size="sm"
                    onClick={() => onSetConfidence(statement.id, conf)}
                    className={statement.confidence === conf ? CONFIDENCE_INDICATORS[conf].bgColor : ''}
                  >
                    {CONFIDENCE_INDICATORS[conf].icon} {CONFIDENCE_INDICATORS[conf].label}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Add Source */}
            <div>
              <span className="text-xs text-muted-foreground block mb-2">Add Source:</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  placeholder="Source document or reference..."
                  className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-secondary/50 border border-border focus:border-primary focus:outline-none"
                />
                <Button size="sm" onClick={handleAddSource}>
                  Add
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-border mt-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowChallengeForm(!showChallengeForm)}
          >
            <Fingerprint className="w-4 h-4 mr-1" />
            Challenge
          </Button>
          <div className="flex-1" />
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onReject(statement.id)}
            className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
          >
            <XCircle className="w-4 h-4 mr-1" />
            Reject
          </Button>
          <Button 
            size="sm"
            onClick={() => onApprove(statement.id)}
            className="bg-green-500 hover:bg-green-600"
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Approve
          </Button>
        </div>
        
        {/* Challenge Form */}
        {showChallengeForm && (
          <div className="mt-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
            <div className="mb-2">
              <span className="text-sm font-medium text-foreground">Challenge this statement</span>
            </div>
            
            {/* Suggested Questions */}
            <div className="flex flex-wrap gap-1 mb-2">
              {QA_CHALLENGE_PROMPTS.hallucination_detection.slice(0, 2).map((q, idx) => (
                <Badge 
                  key={idx}
                  variant="outline" 
                  className="text-xs cursor-pointer hover:bg-purple-500/20"
                  onClick={() => setChallengeQuestion(q)}
                >
                  {q.substring(0, 35)}...
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
              <Button size="sm" onClick={handleChallenge} className="bg-purple-500 hover:bg-purple-600">
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
// BATCH VERIFICATION PANEL
// ============================================================================

interface BatchVerificationPanelProps {
  statements: ClassifiedStatement[];
  onVerifyAll: () => void;
  onRejectAll: () => void;
  onClassifyStatement: (id: string, classification: StatementClassification) => void;
  onSetConfidence: (id: string, confidence: ConfidenceLevel) => void;
  onApproveStatement: (id: string) => void;
  onRejectStatement: (id: string) => void;
  onChallengeStatement: (id: string, question: string) => void;
  onAddSource: (id: string, source: string) => void;
}

export function BatchVerificationPanel({
  statements,
  onVerifyAll,
  onRejectAll,
  onClassifyStatement,
  onSetConfidence,
  onApproveStatement,
  onRejectStatement,
  onChallengeStatement,
  onAddSource,
}: BatchVerificationPanelProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'single' | 'list'>('single');
  
  const approvedCount = statements.filter(s => s.confidence === 'high').length;
  const pendingCount = statements.filter(s => s.confidence !== 'high').length;
  const issueCount = statements.filter(s => s.potentialIssues.length > 0).length;
  
  const progress = (approvedCount / Math.max(statements.length, 1)) * 100;
  
  return (
    <Card className="bg-card/60 border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Truth Verification
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'single' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('single')}
            >
              Single
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Verification Progress</span>
            <span className="font-medium">{approvedCount} / {statements.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 rounded-lg bg-green-500/10">
            <div className="text-lg font-bold text-green-500">{approvedCount}</div>
            <div className="text-xs text-muted-foreground">Verified</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-yellow-500/10">
            <div className="text-lg font-bold text-yellow-500">{pendingCount}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-orange-500/10">
            <div className="text-lg font-bold text-orange-500">{issueCount}</div>
            <div className="text-xs text-muted-foreground">Issues</div>
          </div>
        </div>
        
        {/* Single View */}
        {viewMode === 'single' && statements.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(prev => prev - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} of {statements.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentIndex === statements.length - 1}
                onClick={() => setCurrentIndex(prev => prev + 1)}
              >
                Next
              </Button>
            </div>
            
            <StatementVerificationCard
              statement={statements[currentIndex]}
              onClassify={onClassifyStatement}
              onSetConfidence={onSetConfidence}
              onAddSource={onAddSource}
              onApprove={(id) => {
                onApproveStatement(id);
                if (currentIndex < statements.length - 1) {
                  setCurrentIndex(prev => prev + 1);
                }
              }}
              onReject={(id) => {
                onRejectStatement(id);
                if (currentIndex < statements.length - 1) {
                  setCurrentIndex(prev => prev + 1);
                }
              }}
              onChallenge={onChallengeStatement}
            />
          </div>
        )}
        
        {/* List View */}
        {viewMode === 'list' && (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {statements.map((statement, idx) => (
              <StatementVerificationCard
                key={statement.id}
                statement={statement}
                onClassify={onClassifyStatement}
                onSetConfidence={onSetConfidence}
                onAddSource={onAddSource}
                onApprove={onApproveStatement}
                onReject={onRejectStatement}
                onChallenge={onChallengeStatement}
              />
            ))}
          </div>
        )}
        
        {/* Batch Actions */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <Button 
            variant="outline"
            className="flex-1"
            onClick={onRejectAll}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Request Revision
          </Button>
          <Button 
            className="flex-1 bg-green-500 hover:bg-green-600"
            onClick={onVerifyAll}
            disabled={issueCount > 0}
          >
            <ShieldCheck className="w-4 h-4 mr-2" />
            Verify All ({approvedCount})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// EXPERT VALIDATION REQUEST
// ============================================================================

interface ExpertValidationRequestProps {
  expertName: string;
  specialty: string;
  statements: ClassifiedStatement[];
  onRequestValidation: () => void;
}

export function ExpertValidationRequest({
  expertName,
  specialty,
  statements,
  onRequestValidation,
}: ExpertValidationRequestProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  
  const validationPrompt = EXPERT_VALIDATION_PROMPT(expertName, specialty);
  
  return (
    <Card className="bg-purple-500/5 border-purple-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Fingerprint className="w-5 h-5 text-purple-400" />
          Expert Self-Validation Request
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Request {expertName} to validate their {statements.length} statements by explicitly 
          classifying each as fact, analysis, opinion, or speculation with confidence levels.
        </p>
        
        <button
          onClick={() => setShowPrompt(!showPrompt)}
          className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          {showPrompt ? 'Hide' : 'View'} Validation Prompt
          {showPrompt ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {showPrompt && (
          <div className="p-3 rounded-lg bg-secondary/30 border border-border">
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
              {validationPrompt}
            </pre>
          </div>
        )}
        
        <Button 
          onClick={onRequestValidation}
          className="w-full bg-purple-500 hover:bg-purple-600"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Request Expert Validation
        </Button>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// TRUTH VERIFICATION SUMMARY
// ============================================================================

interface TruthVerificationSummaryProps {
  statements: ClassifiedStatement[];
}

export function TruthVerificationSummary({ statements }: TruthVerificationSummaryProps) {
  const byClassification = {
    fact: statements.filter(s => s.classification === 'fact').length,
    analysis: statements.filter(s => s.classification === 'analysis').length,
    opinion: statements.filter(s => s.classification === 'opinion').length,
    speculation: statements.filter(s => s.classification === 'speculation').length,
    unknown: statements.filter(s => s.classification === 'unknown').length,
  };
  
  const byConfidence = {
    high: statements.filter(s => s.confidence === 'high').length,
    medium: statements.filter(s => s.confidence === 'medium').length,
    low: statements.filter(s => s.confidence === 'low').length,
    speculative: statements.filter(s => s.confidence === 'speculative').length,
  };
  
  const withIssues = statements.filter(s => s.potentialIssues.length > 0).length;
  const needingSources = statements.filter(s => s.requiredSources.length > 0).length;
  
  return (
    <Card className="bg-card/60 border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Scale className="w-5 h-5 text-primary" />
          Truth Verification Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* By Classification */}
        <div>
          <span className="text-sm font-medium text-foreground mb-2 block">By Classification</span>
          <div className="grid grid-cols-5 gap-2">
            {(Object.entries(byClassification) as [StatementClassification, number][]).map(([cls, count]) => (
              <div key={cls} className={`text-center p-2 rounded-lg ${CLASSIFICATION_CONFIG[cls].bgColor}`}>
                <div className={`text-lg font-bold ${CLASSIFICATION_CONFIG[cls].color}`}>{count}</div>
                <div className="text-xs text-muted-foreground">{CLASSIFICATION_CONFIG[cls].label}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* By Confidence */}
        <div>
          <span className="text-sm font-medium text-foreground mb-2 block">By Confidence</span>
          <div className="grid grid-cols-4 gap-2">
            {(Object.entries(byConfidence) as [ConfidenceLevel, number][]).map(([conf, count]) => (
              <div key={conf} className={`text-center p-2 rounded-lg ${CONFIDENCE_INDICATORS[conf].bgColor}`}>
                <div className={`text-lg font-bold ${CONFIDENCE_INDICATORS[conf].color}`}>{count}</div>
                <div className="text-xs text-muted-foreground">{CONFIDENCE_INDICATORS[conf].label}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Issues */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-foreground">Statements with issues</span>
          </div>
          <Badge variant="outline" className="text-orange-500">{withIssues}</Badge>
        </div>
        
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-foreground">Needing source references</span>
          </div>
          <Badge variant="outline" className="text-yellow-500">{needingSources}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
