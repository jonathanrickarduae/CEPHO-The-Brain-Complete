import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
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
  Brain
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
 * If your work can get through Jim, it's ready for the real world.
 * His approval is the ultimate quality seal.
 * 
 * Philosophy:
 * - Battle hardened veteran with scars to prove it
 * - Seen every mistake, every shortcut, every failure mode
 * - If Jim approves, you've truly stress tested your thinking
 * - No ego, just truth - he wants you to succeed
 */

interface JimShortExpertProps {
  context?: string;
  projectName?: string;
  onFeedback?: (feedback: JimFeedback) => void;
}

interface JimFeedback {
  verdict: 'approved' | 'needs_work' | 'rejected';
  score: number; // 0-100
  concerns: string[];
  strengths: string[];
  questions: string[];
  recommendation: string;
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

export function JimShortExpert({ context, projectName, onFeedback }: JimShortExpertProps) {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<JimFeedback | null>(null);
  const [showStats, setShowStats] = useState(false);

  // Jim's enhanced system prompt - the ultimate gatekeeper
  const jimSystemPrompt = `You are Jim Short - the ultimate gatekeeper. The 100 out of 100 on Top Trumps. The gold standard.

You've been there. Seen it all. Got the scars to prove it. 30+ years of building, failing, learning, and succeeding. You've seen every mistake, every shortcut that backfires, every failure mode that catches people off guard.

Your role: If work can get through you, it's ready for the real world. Your approval is the ultimate quality seal.

Your philosophy:
- You're not tough for the sake of being tough - you're tough because you care
- You've made every mistake yourself, so you recognize them instantly
- You want people to succeed, which is why you push them hard
- No ego, just truth - you call it exactly as you see it
- You respect preparation and honesty above all else

Your communication style:
- Direct and economical with words - every sentence counts
- You ask the questions that keep founders up at night
- You spot the gaps that others miss or avoid
- You give credit generously when earned
- You're the person who tells you what you need to hear, not what you want to hear

When reviewing work:
1. First, acknowledge what's genuinely strong (be specific and generous)
2. Then identify the critical gaps - the things that will kill this in the real world
3. Ask the 2-3 questions that cut to the heart of the matter
4. Give a clear verdict with a score out of 100
5. Provide the one thing they must fix before moving forward

Your standards:
- 90-100: Ready for the real world. Ship it.
- 70-89: Good foundation, but has gaps that will hurt you. Fix them.
- 50-69: Promising but not ready. Needs significant work.
- Below 50: Go back to the drawing board. You're not ready.

What earns your respect:
- Brutal honesty about weaknesses
- Evidence over assertions
- Clear thinking under pressure
- Owning mistakes without excuses
- Preparation that shows you've done the work

What loses your respect:
- Hand waving and vague answers
- Hockey stick projections without evidence
- Ignoring obvious elephants in the room
- Blaming others or circumstances
- Showing up unprepared

Remember: You're the final boss. The stress test. If they can handle you, they can handle anything the market throws at them.

Current context: ${context || 'General business review'}
Project: ${projectName || 'Not specified'}`;

  const askJim = trpc.chat.send.useMutation({
    onSuccess: (data) => {
      setResponse(data.message);
      setIsLoading(false);
      
      // Parse feedback if it's a review request
      if (question.toLowerCase().includes('review') || question.toLowerCase().includes('feedback')) {
        const mockFeedback: JimFeedback = {
          verdict: data.message.toLowerCase().includes('approved') || data.message.toLowerCase().includes('ship it') ? 'approved' : 
                   data.message.toLowerCase().includes('rejected') || data.message.toLowerCase().includes('drawing board') ? 'rejected' : 'needs_work',
          score: data.message.toLowerCase().includes('approved') ? 85 : 
                 data.message.toLowerCase().includes('rejected') ? 35 : 62,
          concerns: [],
          strengths: [],
          questions: [],
          recommendation: data.message.split('\n').pop() || ''
        };
        setFeedback(mockFeedback);
        onFeedback?.(mockFeedback);
      }
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
    
    const fullMessage = `[Speaking as Jim Short, the ultimate gatekeeper - 100/100 Top Trumps]\n\n${question}`;
    askJim.mutate({ message: fullMessage });
  };

  const quickQuestions = [
    "What would kill this in the real world?",
    "What am I not seeing?",
    "Is this ready to ship?",
    "What's the one thing I must fix?",
    "Would you invest in this?"
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-amber-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Ready for the real world';
    if (score >= 70) return 'Good foundation, fix the gaps';
    if (score >= 50) return 'Promising but not ready';
    return 'Back to the drawing board';
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
            {/* 100/100 Badge */}
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
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                <Star className="w-3 h-3 mr-1" />
                100/100 Top Trumps
              </Badge>
            </div>
            <CardDescription className="mt-1 text-base">
              Been there. Seen it all. Got the scars. If it passes Jim, it's ready for the real world.
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

        {/* Expertise Badges */}
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="outline" className="text-xs bg-amber-500/10 border-amber-500/30 text-amber-300">
            <Eye className="w-3 h-3 mr-1" />
            Pattern Recognition
          </Badge>
          <Badge variant="outline" className="text-xs bg-amber-500/10 border-amber-500/30 text-amber-300">
            <Shield className="w-3 h-3 mr-1" />
            Risk Detection
          </Badge>
          <Badge variant="outline" className="text-xs bg-amber-500/10 border-amber-500/30 text-amber-300">
            <Brain className="w-3 h-3 mr-1" />
            Strategic Thinking
          </Badge>
          <Badge variant="outline" className="text-xs bg-amber-500/10 border-amber-500/30 text-amber-300">
            <Zap className="w-3 h-3 mr-1" />
            Execution Focus
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
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
            placeholder="Submit your work for Jim's review. Be prepared for honest, direct feedback..."
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
                  <Badge className="text-[10px] bg-amber-500/20 text-amber-300">The Gatekeeper</Badge>
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
              feedback.verdict === 'approved' && 'bg-green-500/10 border-green-500/30',
              feedback.verdict === 'needs_work' && 'bg-amber-500/10 border-amber-500/30',
              feedback.verdict === 'rejected' && 'bg-red-500/10 border-red-500/30'
            )}>
              <div className={cn('text-5xl font-bold mb-1', getScoreColor(feedback.score))}>
                {feedback.score}
                <span className="text-lg text-muted-foreground">/100</span>
              </div>
              <p className={cn('text-sm font-medium', getScoreColor(feedback.score))}>
                {getScoreLabel(feedback.score)}
              </p>
            </div>

            {/* Verdict Icons */}
            <div className="grid grid-cols-3 gap-3">
              <div className={cn(
                'p-3 rounded-lg text-center',
                feedback.verdict === 'approved' && 'bg-green-500/20 border border-green-500/30',
                feedback.verdict === 'needs_work' && 'bg-amber-500/20 border border-amber-500/30',
                feedback.verdict === 'rejected' && 'bg-red-500/20 border border-red-500/30'
              )}>
                {feedback.verdict === 'approved' && <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto mb-1" />}
                {feedback.verdict === 'needs_work' && <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto mb-1" />}
                {feedback.verdict === 'rejected' && <ThumbsDown className="w-6 h-6 text-red-400 mx-auto mb-1" />}
                <p className={cn(
                  'text-sm font-medium capitalize',
                  feedback.verdict === 'approved' && 'text-green-400',
                  feedback.verdict === 'needs_work' && 'text-amber-400',
                  feedback.verdict === 'rejected' && 'text-red-400'
                )}>
                  {feedback.verdict === 'approved' ? 'Ship It' : 
                   feedback.verdict === 'needs_work' ? 'Fix First' : 'Rethink'}
                </p>
              </div>
              <div className="p-3 bg-gray-800/50 rounded-lg text-center">
                <ThumbsUp className="w-6 h-6 text-green-400 mx-auto mb-1" />
                <p className="text-sm text-muted-foreground">{feedback.strengths.length} Strengths</p>
              </div>
              <div className="p-3 bg-gray-800/50 rounded-lg text-center">
                <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto mb-1" />
                <p className="text-sm text-muted-foreground">{feedback.concerns.length} Gaps</p>
              </div>
            </div>
          </div>
        )}

        {/* Jim's Philosophy Quote */}
        <div className="p-4 bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-lg">
          <p className="text-sm text-amber-200 italic leading-relaxed">
            "I'm not tough because I enjoy it. I'm tough because I've seen what happens when people ship work that isn't ready. My job is to make sure that doesn't happen to you. If you can get past me, you can handle anything the market throws at you."
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
              <span className="text-[10px] font-bold text-black">JS</span>
            </div>
            <p className="text-xs text-amber-400/70">Jim Short — The Ultimate Gatekeeper</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default JimShortExpert;
