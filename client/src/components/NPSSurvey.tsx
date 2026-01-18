import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface NPSSurveyProps {
  touchpoint?: string;
  onComplete?: () => void;
  compact?: boolean;
}

export function NPSSurvey({ touchpoint = 'general', onComplete, compact = false }: NPSSurveyProps) {
  const [score, setScore] = useState<number>(8);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = trpc.nps.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success('Thank you for your feedback');
      onComplete?.();
    },
    onError: () => {
      toast.error('Failed to submit feedback');
    },
  });

  const getScoreLabel = (s: number) => {
    if (s >= 9) return 'Promoter';
    if (s >= 7) return 'Passive';
    return 'Detractor';
  };

  const getScoreColor = (s: number) => {
    if (s >= 9) return 'text-green-500';
    if (s >= 7) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (submitted) {
    return (
      <Card className={compact ? 'border-0 shadow-none bg-transparent' : ''}>
        <CardContent className="py-8 text-center">
          <div className="text-4xl mb-4">✓</div>
          <p className="text-muted-foreground">Thank you for your feedback</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={compact ? 'border-0 shadow-none bg-transparent' : ''}>
      {!compact && (
        <CardHeader>
          <CardTitle className="text-lg">How likely are you to recommend us?</CardTitle>
        </CardHeader>
      )}
      <CardContent className={compact ? 'p-0' : ''}>
        <div className="space-y-6">
          {/* Score Display */}
          <div className="text-center">
            <div className={`text-5xl font-bold ${getScoreColor(score)}`}>{score}</div>
            <div className={`text-sm mt-1 ${getScoreColor(score)}`}>{getScoreLabel(score)}</div>
          </div>

          {/* Slider */}
          <div className="px-2">
            <Slider
              value={[score]}
              onValueChange={(v) => setScore(v[0])}
              min={0}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>0 - Not likely</span>
              <span>10 - Very likely</span>
            </div>
          </div>

          {/* Feedback */}
          <div>
            <Textarea
              placeholder="What's the primary reason for your score? (optional)"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Submit */}
          <Button
            onClick={() => submitMutation.mutate({ score, feedback: feedback || undefined, touchpoint })}
            disabled={submitMutation.isPending}
            className="w-full bg-[#E91E8C] hover:bg-[#E91E8C]/90"
          >
            {submitMutation.isPending ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// NPS Stats Dashboard Component
export function NPSStatsDashboard() {
  const { data: stats, isLoading } = trpc.nps.getStats.useQuery();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-pulse">Loading NPS data...</div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const npsColor = stats.npsScore >= 50 ? 'text-green-500' : stats.npsScore >= 0 ? 'text-yellow-500' : 'text-red-500';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">NPS Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {/* NPS Score */}
          <div className="col-span-2 md:col-span-1 text-center p-4 bg-muted/50 rounded-lg">
            <div className={`text-4xl font-bold ${npsColor}`}>{stats.npsScore}</div>
            <div className="text-xs text-muted-foreground mt-1">NPS Score</div>
          </div>

          {/* Promoters */}
          <div className="text-center p-4 bg-green-500/10 rounded-lg">
            <div className="text-2xl font-bold text-green-500">{stats.promoters}</div>
            <div className="text-xs text-muted-foreground mt-1">Promoters (9-10)</div>
          </div>

          {/* Passives */}
          <div className="text-center p-4 bg-yellow-500/10 rounded-lg">
            <div className="text-2xl font-bold text-yellow-500">{stats.passives}</div>
            <div className="text-xs text-muted-foreground mt-1">Passives (7-8)</div>
          </div>

          {/* Detractors */}
          <div className="text-center p-4 bg-red-500/10 rounded-lg">
            <div className="text-2xl font-bold text-red-500">{stats.detractors}</div>
            <div className="text-xs text-muted-foreground mt-1">Detractors (0-6)</div>
          </div>

          {/* Total */}
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold">{stats.totalResponses}</div>
            <div className="text-xs text-muted-foreground mt-1">Total Responses</div>
          </div>
        </div>

        {/* Visual Bar */}
        {stats.totalResponses > 0 && (
          <div className="mt-6">
            <div className="flex h-4 rounded-full overflow-hidden">
              <div
                className="bg-green-500"
                style={{ width: `${(stats.promoters / stats.totalResponses) * 100}%` }}
              />
              <div
                className="bg-yellow-500"
                style={{ width: `${(stats.passives / stats.totalResponses) * 100}%` }}
              />
              <div
                className="bg-red-500"
                style={{ width: `${(stats.detractors / stats.totalResponses) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>{Math.round((stats.promoters / stats.totalResponses) * 100)}% Promoters</span>
              <span>{Math.round((stats.passives / stats.totalResponses) * 100)}% Passives</span>
              <span>{Math.round((stats.detractors / stats.totalResponses) * 100)}% Detractors</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
