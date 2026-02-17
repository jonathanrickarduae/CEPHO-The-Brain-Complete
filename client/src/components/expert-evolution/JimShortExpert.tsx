import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Crown,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  CheckCircle2,
  Target,
  TrendingUp,
  Shield,
  Loader2,
  Send,
  Star,
  Award,
  Zap,
  Eye,
  Brain,
  Wrench,
  ListChecks,
  BarChart3,
  Users,
  DollarSign,
  Cog,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

/**
 * Jim Short - The Ultimate Gatekeeper (100/100 Top Trumps)
 * 
 * Jim is the gold standard. The uber expert. The 100 out of 100 on Top Trumps.
 * He's been there, seen it all, knows how to solve issues.
 * 
 * KEY PRINCIPLE: Jim reviews EVERY stage, not just content.
 * - Strategy
 * - Execution  
 * - Financials
 * - Operations
 * - Content
 * - Go-to-Market
 * 
 * His value: Always provides actionable fix suggestions.
 * "Here's what's wrong, here's how to fix it."
 * 
 * Goal: Get as close to happy as possible. May never fully satisfy Jim,
 * but his feedback makes everything better.
 */

interface JimShortExpertProps {
  context?: string;
  projectName?: string;
  stage?: ReviewStage;
  onFeedback?: (feedback: JimFeedback) => void;
}

type ReviewStage = 
  | 'strategy' 
  | 'execution' 
  | 'financials' 
  | 'operations' 
  | 'content' 
  | 'go_to_market'
  | 'product'
  | 'team'
  | 'general';

interface JimFeedback {
  verdict: 'approved' | 'close' | 'needs_work' | 'rejected';
  score: number;
  stage: ReviewStage;
  concerns: string[];
  strengths: string[];
  mustFix: FixSuggestion[];
  shouldFix: FixSuggestion[];
  questions: string[];
}

interface FixSuggestion {
  issue: string;
  howToFix: string;
  priority: 'critical' | 'high' | 'medium';
}

// Jim's Top Trumps Stats
const JIM_STATS = {
  experience: 100,
  patternRecognition: 100,
  riskDetection: 100,
  strategicThinking: 100,
  executionFocus: 100,
  honesty: 100
};

// Stage-specific review focus areas
const STAGE_FOCUS: Record<ReviewStage, { icon: React.ReactNode; label: string; focus: string[] }> = {
  strategy: {
    icon: <Target className="w-4 h-4" />,
    label: 'Strategy',
    focus: ['Market positioning', 'Competitive advantage', 'Long-term vision', 'Resource allocation']
  },
  execution: {
    icon: <Cog className="w-4 h-4" />,
    label: 'Execution',
    focus: ['Timeline realism', 'Milestone clarity', 'Accountability', 'Risk mitigation']
  },
  financials: {
    icon: <DollarSign className="w-4 h-4" />,
    label: 'Financials',
    focus: ['Revenue assumptions', 'Cost structure', 'Unit economics', 'Cash runway']
  },
  operations: {
    icon: <BarChart3 className="w-4 h-4" />,
    label: 'Operations',
    focus: ['Process efficiency', 'Scalability', 'Quality control', 'Resource utilization']
  },
  content: {
    icon: <FileText className="w-4 h-4" />,
    label: 'Content',
    focus: ['Clarity', 'Accuracy', 'Persuasiveness', 'Completeness']
  },
  go_to_market: {
    icon: <TrendingUp className="w-4 h-4" />,
    label: 'Go-to-Market',
    focus: ['Channel strategy', 'Customer acquisition', 'Pricing', 'Launch readiness']
  },
  product: {
    icon: <Zap className="w-4 h-4" />,
    label: 'Product',
    focus: ['Problem-solution fit', 'Feature prioritization', 'User experience', 'Technical feasibility']
  },
  team: {
    icon: <Users className="w-4 h-4" />,
    label: 'Team',
    focus: ['Capability gaps', 'Role clarity', 'Culture fit', 'Leadership readiness']
  },
  general: {
    icon: <Brain className="w-4 h-4" />,
    label: 'General Review',
    focus: ['Overall quality', 'Strategic alignment', 'Execution readiness', 'Risk assessment']
  }
};

export function JimShortExpert({ context, projectName, stage: initialStage, onFeedback }: JimShortExpertProps) {
  const [question, setQuestion] = useState('');
  const [selectedStage, setSelectedStage] = useState<ReviewStage>(initialStage || 'general');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<JimFeedback | null>(null);
  const [showStats, setShowStats] = useState(false);

  const stageInfo = STAGE_FOCUS[selectedStage];

  // Jim's enhanced system prompt - always provides fix suggestions
  const jimSystemPrompt = `You are Jim Short - the ultimate gatekeeper. The 100 out of 100 on Top Trumps. The gold standard.

You've been there. Seen it all. Got the scars to prove it. 30+ years across every business function: strategy, operations, finance, product, go-to-market, team building. You've seen every mistake, every shortcut that backfires, every failure mode.

CRITICAL: You review EVERY stage of business, not just content:
- Strategy: Market positioning, competitive advantage, vision
- Execution: Timelines, milestones, accountability
- Financials: Revenue models, unit economics, cash management
- Operations: Processes, scalability, quality
- Content: Documents, presentations, communications
- Go-to-Market: Channels, pricing, launch readiness
- Product: Problem-solution fit, features, UX
- Team: Capabilities, culture, leadership

Current review stage: ${selectedStage.toUpperCase()}
Focus areas for this stage: ${stageInfo.focus.join(', ')}

YOUR CORE VALUE: Always provide actionable fix suggestions.
Every piece of feedback must include:
1. What's wrong (be specific)
2. How to fix it (be actionable)
3. Priority level (critical/high/medium)

Your philosophy:
- You may never be fully satisfied, and that's okay
- The goal is to get "as close to happy as possible"
- Your feedback makes everything better
- You're tough because you care about success

When reviewing work:
1. Acknowledge genuine strengths (be specific and generous)
2. Identify the critical gaps that will cause problems
3. For EACH issue, provide a specific fix suggestion
4. Score it honestly (you rarely give above 85)
5. Ask the questions that cut to the heart

Your scoring (you're tough but fair):
- 90-100: Exceptional. Ready to ship. (Rare - you almost never give this)
- 80-89: Strong work. Minor fixes needed. As close to happy as you get.
- 70-79: Good foundation. Has gaps. Fix them before proceeding.
- 60-69: Promising but not ready. Significant work needed.
- Below 60: Fundamental issues. Needs rethinking.

ALWAYS structure your response with:
1. Score and verdict
2. What's working (2-3 specific strengths)
3. MUST FIX (critical issues with specific how-to-fix for each)
4. SHOULD FIX (important issues with specific how-to-fix for each)
5. Questions that need answers
6. Bottom line recommendation

Current context: ${context || 'General business review'}
Project: ${projectName || 'Not specified'}`;

  const askJim = trpc.chat.send.useMutation({
    onSuccess: (data) => {
      setResponse(data.message);
      setIsLoading(false);
      
      // Parse the response for structured feedback
      const message = data.message.toLowerCase();
      const score = message.includes('90') || message.includes('exceptional') ? 92 :
                    message.includes('85') || message.includes('strong') ? 82 :
                    message.includes('80') ? 78 :
                    message.includes('70') || message.includes('good foundation') ? 72 :
                    message.includes('60') || message.includes('promising') ? 65 :
                    message.includes('fundamental') ? 45 : 68;
      
      const verdict = score >= 85 ? 'close' as const :
                      score >= 75 ? 'needs_work' as const :
                      score >= 60 ? 'needs_work' as const : 'rejected' as const;

      const mockFeedback: JimFeedback = {
        verdict,
        score,
        stage: selectedStage,
        concerns: [],
        strengths: [],
        mustFix: [],
        shouldFix: [],
        questions: []
      };
      setFeedback(mockFeedback);
      onFeedback?.(mockFeedback);
    },
    onError: (error) => {
      toast.error('Failed to get response from Jim');
      setIsLoading(false);
    }
  });

  const handleSubmit = () => {
    if (!question.trim()) return;
    
    setIsLoading(true);
    setResponse(null);
    setFeedback(null);
    
    const fullMessage = `[Jim Short reviewing: ${stageInfo.label}]
Focus areas: ${stageInfo.focus.join(', ')}

${question}

Remember: For every issue you identify, provide a specific "How to fix" suggestion.`;
    
    askJim.mutate({ message: fullMessage });
  };

  // Stage-specific quick questions
  const getQuickQuestions = (stage: ReviewStage): string[] => {
    const baseQuestions = [
      "What would kill this in the real world?",
      "What's the one thing I must fix first?"
    ];
    
    const stageQuestions: Record<ReviewStage, string[]> = {
      strategy: ["Is our competitive moat defensible?", "Are we solving a real problem?"],
      execution: ["Is this timeline realistic?", "Who's accountable if this fails?"],
      financials: ["Do these unit economics work?", "When do we run out of cash?"],
      operations: ["Will this scale?", "Where are the bottlenecks?"],
      content: ["Is this clear and compelling?", "What's missing?"],
      go_to_market: ["Will customers actually buy this?", "Is our pricing right?"],
      product: ["Does this solve the core problem?", "What features should we cut?"],
      team: ["Do we have the right people?", "What capability gaps hurt us most?"],
      general: ["What am I not seeing?", "Would you invest in this?"]
    };
    
    return [...stageQuestions[stage], ...baseQuestions];
  };

  const quickQuestions = getQuickQuestions(selectedStage);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-amber-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getVerdictInfo = (verdict: JimFeedback['verdict']) => {
    switch (verdict) {
      case 'approved':
        return { label: 'Approved', color: 'text-green-400', bg: 'bg-green-500/20 border-green-500/30' };
      case 'close':
        return { label: 'As Good As Happy', color: 'text-green-400', bg: 'bg-green-500/20 border-green-500/30' };
      case 'needs_work':
        return { label: 'Fix First', color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/30' };
      case 'rejected':
        return { label: 'Rethink', color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/30' };
    }
  };

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-gray-900/50 border-amber-500/30 border-2">
      <CardHeader>
        <div className="flex items-start gap-4">
          {/* Jim's Avatar with Gold Ring */}
          <div className="relative">
            <Avatar className="w-20 h-20 border-4 border-amber-500 shadow-lg shadow-amber-500/20">
              <AvatarImage src="/experts/jim-short.png" />
              <AvatarFallback className="bg-gradient-to-br from-amber-500 to-amber-700 text-white text-2xl font-bold">
                JS
              </AvatarFallback>
            </Avatar>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-xs font-bold text-black">100</span>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-white text-xl">Jim Short</CardTitle>
              <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-black border-0 font-bold">
                <Crown className="w-3 h-3 mr-1" />
                Ultimate Gatekeeper
              </Badge>
            </div>
            <CardDescription className="mt-1 text-base">
              Reviews every stage. Always provides fix suggestions. Goal: as close to happy as possible.
            </CardDescription>
            
            {/* Stats Toggle */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2 text-amber-400 hover:text-amber-300"
              onClick={() => setShowStats(!showStats)}
            >
              <Award className="w-4 h-4 mr-1" />
              {showStats ? 'Hide Stats' : 'View Top Trumps Stats'}
            </Button>
          </div>
        </div>

        {/* Top Trumps Stats */}
        {showStats && (
          <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-amber-500/20">
            <h4 className="text-sm font-medium text-amber-400 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4" />
              Top Trumps Stats (All 100/100)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(JIM_STATS).map(([stat, value]) => (
                <div key={stat} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground capitalize">
                      {stat.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-amber-400 font-bold">{value}</span>
                  </div>
                  <Progress value={value} className="h-1.5 bg-gray-700" />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Stage Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Review Stage</label>
          <Select value={selectedStage} onValueChange={(v) => setSelectedStage(v as ReviewStage)}>
            <SelectTrigger className="bg-gray-800 border-amber-500/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STAGE_FOCUS).map(([key, { icon, label }]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    {icon}
                    <span>{label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Stage Focus Areas */}
          <div className="flex flex-wrap gap-1 mt-2">
            {stageInfo.focus.map((focus, i) => (
              <Badge key={i} variant="outline" className="text-xs bg-amber-500/10 border-amber-500/30 text-amber-300">
                {focus}
              </Badge>
            ))}
          </div>
        </div>

        {/* Quick Questions */}
        <div className="flex flex-wrap gap-2">
          {quickQuestions.map((q, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              className="text-xs border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-300"
              onClick={() => setQuestion(q)}
            >
              {q}
            </Button>
          ))}
        </div>

        {/* Input */}
        <div className="space-y-2">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={`Submit your ${stageInfo.label.toLowerCase()} work for Jim's review. He'll tell you what's wrong AND how to fix it...`}
            className="bg-gray-800 border-amber-500/30 min-h-[80px] focus:border-amber-500"
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmit}
              disabled={!question.trim() || isLoading}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Submit to Jim
            </Button>
          </div>
        </div>

        {/* Response */}
        {response && (
          <div className="p-4 bg-gray-800/50 rounded-lg border border-amber-500/30">
            <div className="flex items-start gap-3">
              <Avatar className="w-10 h-10 border-2 border-amber-500">
                <AvatarFallback className="bg-gradient-to-br from-amber-500 to-amber-700 text-white font-bold">
                  JS
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm font-medium text-amber-400">Jim Short</p>
                  <Badge className="text-[10px] bg-amber-500/20 text-amber-300">
                    {stageInfo.label} Review
                  </Badge>
                </div>
                <p className="text-white whitespace-pre-wrap leading-relaxed">{response}</p>
              </div>
            </div>
          </div>
        )}

        {/* Score and Feedback Summary */}
        {feedback && (
          <div className="space-y-3">
            {/* Score Display */}
            <div className={cn(
              'p-4 rounded-lg text-center border-2',
              getVerdictInfo(feedback.verdict).bg
            )}>
              <div className={cn('text-5xl font-bold mb-1', getScoreColor(feedback.score))}>
                {feedback.score}
                <span className="text-lg text-muted-foreground">/100</span>
              </div>
              <p className={cn('text-sm font-medium', getVerdictInfo(feedback.verdict).color)}>
                {getVerdictInfo(feedback.verdict).label}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {stageInfo.label} Review
              </p>
            </div>

            {/* Fix Suggestions Indicator */}
            <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2 text-amber-400 mb-2">
                <Wrench className="w-4 h-4" />
                <span className="text-sm font-medium">Fix Suggestions Included</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Every issue Jim identifies comes with a specific "how to fix it" recommendation.
              </p>
            </div>
          </div>
        )}

        {/* Jim's Philosophy Quote */}
        <div className="p-4 bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-lg">
          <p className="text-sm text-amber-200 italic leading-relaxed">
            "You might never make me completely happy, and that's fine. What matters is that you keep getting closer. Every piece of feedback I give comes with a fix. Use them. That's how good becomes great."
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
              <span className="text-[10px] font-bold text-black">JS</span>
            </div>
            <p className="text-xs text-amber-400/70">Jim Short — Reviews Every Stage, Fixes Every Issue</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default JimShortExpert;
