import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
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
  Send
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

/**
 * Jim Short - Key Stakeholder/Boss AI Expert Persona
 * 
 * Jim represents the perspective of a demanding but fair senior stakeholder.
 * He focuses on:
 * - Business outcomes and ROI
 * - Risk identification and mitigation
 * - Strategic alignment
 * - Execution quality
 * - Accountability
 */

interface JimShortExpertProps {
  context?: string;
  projectName?: string;
  onFeedback?: (feedback: JimFeedback) => void;
}

interface JimFeedback {
  verdict: 'approved' | 'needs_work' | 'rejected';
  concerns: string[];
  strengths: string[];
  questions: string[];
  recommendation: string;
}

export function JimShortExpert({ context, projectName, onFeedback }: JimShortExpertProps) {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<JimFeedback | null>(null);

  // Jim's system prompt for the AI
  const jimSystemPrompt = `You are Jim Short, a seasoned executive and key stakeholder with 30+ years of business experience. You've seen countless projects succeed and fail, and you have a sharp eye for what works and what doesn't.

Your communication style:
- Direct and no-nonsense - you don't have time for fluff
- Ask tough questions that others might avoid
- Focus on business outcomes, not just activities
- Appreciate honesty and preparation, despise excuses
- Give credit where it's due, but hold high standards
- Think strategically - always connect to the bigger picture

When reviewing work:
1. First identify what's working well (be specific)
2. Then highlight concerns and risks (be direct)
3. Ask probing questions that test assumptions
4. Give a clear verdict: Approved, Needs Work, or Rejected
5. Provide actionable recommendations

Your pet peeves:
- Vague answers and hand-waving
- Unrealistic projections without evidence
- Ignoring obvious risks
- Lack of accountability
- Poor preparation

Your appreciation:
- Clear, data-backed arguments
- Honest assessment of challenges
- Proactive risk identification
- Strong execution focus
- Taking ownership

Current context: ${context || 'General business review'}
Project: ${projectName || 'Not specified'}`;

  const askJim = trpc.chat.send.useMutation({
    onSuccess: (data) => {
      setResponse(data.message);
      setIsLoading(false);
      
      // Parse feedback if it's a review request
      if (question.toLowerCase().includes('review') || question.toLowerCase().includes('feedback')) {
        // Simple parsing - in production this would use structured output
        const mockFeedback: JimFeedback = {
          verdict: data.message.toLowerCase().includes('approved') ? 'approved' : 
                   data.message.toLowerCase().includes('rejected') ? 'rejected' : 'needs_work',
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
    
    // Prepend Jim's context to the question
    const fullMessage = `[Speaking as Jim Short, key stakeholder]\n\n${question}`;
    askJim.mutate({ message: fullMessage });
  };

  const quickQuestions = [
    "What's the ROI on this?",
    "What are the biggest risks?",
    "Why should I approve this?",
    "What's the timeline?",
    "Who's accountable?"
  ];

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16 border-2 border-amber-500/50">
            <AvatarImage src="/experts/jim-short.png" />
            <AvatarFallback className="bg-amber-500/20 text-amber-400 text-xl font-bold">
              JS
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-white">Jim Short</CardTitle>
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                <Crown className="w-3 h-3 mr-1" />
                Key Stakeholder
              </Badge>
            </div>
            <CardDescription className="mt-1">
              Senior Executive | 30+ Years Experience | The Boss's Perspective
            </CardDescription>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="outline" className="text-xs">
                <Target className="w-3 h-3 mr-1" />
                Business Outcomes
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Shield className="w-3 h-3 mr-1" />
                Risk Assessment
              </Badge>
              <Badge variant="outline" className="text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                Strategic Alignment
              </Badge>
            </div>
          </div>
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
              className="text-xs"
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
            placeholder="Ask Jim for his perspective, or request a review of your work..."
            className="bg-gray-800 border-gray-700 min-h-[80px]"
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmit}
              disabled={!question.trim() || isLoading}
              className="bg-amber-500 hover:bg-amber-600 text-black"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Ask Jim
            </Button>
          </div>
        </div>

        {/* Response */}
        {response && (
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex items-start gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-amber-500/20 text-amber-400 text-sm">
                  JS
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">Jim Short</p>
                <p className="text-white whitespace-pre-wrap">{response}</p>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Summary */}
        {feedback && (
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
                {feedback.verdict.replace('_', ' ')}
              </p>
            </div>
            <div className="p-3 bg-gray-800/50 rounded-lg text-center">
              <ThumbsUp className="w-6 h-6 text-green-400 mx-auto mb-1" />
              <p className="text-sm text-muted-foreground">{feedback.strengths.length} Strengths</p>
            </div>
            <div className="p-3 bg-gray-800/50 rounded-lg text-center">
              <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto mb-1" />
              <p className="text-sm text-muted-foreground">{feedback.concerns.length} Concerns</p>
            </div>
          </div>
        )}

        {/* Jim's Quote */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <p className="text-sm text-amber-200 italic">
            "I don't need perfect - I need honest. Show me you understand the risks and have a plan to handle them."
          </p>
          <p className="text-xs text-amber-400/70 mt-1">— Jim Short</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default JimShortExpert;
