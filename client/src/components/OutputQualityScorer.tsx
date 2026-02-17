import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Star, ThumbsUp, ThumbsDown, AlertCircle } from 'lucide-react';

export interface OutputQualityScore {
  outputType: string;
  outputId: string;
  outputTitle: string;
  score: number; // 0-100 scale
  issueCategory?: string;
  issueDescription?: string;
  responsibleArea?: string;
}

interface OutputQualityScorerProps {
  outputType: 'report' | 'document' | 'analysis' | 'presentation' | 'email_draft' | 'summary' | 'recommendation' | 'visualization' | 'other';
  outputId: string;
  outputTitle: string;
  onScoreSubmit: (score: OutputQualityScore) => void;
  compact?: boolean;
}

const ISSUE_CATEGORIES = [
  { value: 'template_issue', label: 'Template Issue' },
  { value: 'formatting_problem', label: 'Formatting Problem' },
  { value: 'design_flaw', label: 'Design Flaw' },
  { value: 'content_inaccuracy', label: 'Content Inaccuracy' },
  { value: 'missing_information', label: 'Missing Information' },
  { value: 'wrong_tone', label: 'Wrong Tone' },
  { value: 'too_long', label: 'Too Long' },
  { value: 'too_short', label: 'Too Short' },
  { value: 'unclear', label: 'Unclear' },
  { value: 'other', label: 'Other' },
];

const RESPONSIBLE_AREAS = [
  { value: 'ai_generation', label: 'AI Generation' },
  { value: 'template_design', label: 'Template Design' },
  { value: 'data_quality', label: 'Data Quality' },
  { value: 'user_input', label: 'User Input' },
  { value: 'system_bug', label: 'System Bug' },
  { value: 'unknown', label: 'Unknown' },
];

export function OutputQualityScorer({
  outputType,
  outputId,
  outputTitle,
  onScoreSubmit,
  compact = false
}: OutputQualityScorerProps) {
  const [score, setScore] = useState<number>(75); // Default to 75 on 0-100 scale
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [issueCategory, setIssueCategory] = useState<string>('');
  const [issueDescription, setIssueDescription] = useState('');
  const [responsibleArea, setResponsibleArea] = useState<string>('');
  const [hasScored, setHasScored] = useState(false);

  const handleScoreChange = (value: number[]) => {
    setScore(value[0]);
  };

  const handleQuickScore = (quickScore: number) => {
    setScore(quickScore);
    if (quickScore < 40) {
      setShowFeedbackDialog(true);
    } else {
      submitScore(quickScore);
    }
  };

  const submitScore = (finalScore?: number) => {
    const scoreToSubmit = finalScore ?? score;
    
    onScoreSubmit({
      outputType,
      outputId,
      outputTitle,
      score: scoreToSubmit,
      issueCategory: scoreToSubmit < 40 ? issueCategory : undefined,
      issueDescription: scoreToSubmit < 40 ? issueDescription : undefined,
      responsibleArea: scoreToSubmit < 40 ? responsibleArea : undefined,
    });
    
    setHasScored(true);
    setShowFeedbackDialog(false);
    setIssueCategory('');
    setIssueDescription('');
    setResponsibleArea('');
  };

  // Color coding based on 100% Optimization Framework
  const getScoreColor = (s: number) => {
    if (s >= 90) return 'text-green-500';
    if (s >= 75) return 'text-lime-500';
    if (s >= 60) return 'text-yellow-500';
    if (s >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreLabel = (s: number) => {
    if (s >= 90) return 'Excellent';
    if (s >= 75) return 'Good';
    if (s >= 60) return 'Adequate';
    if (s >= 40) return 'Needs Work';
    return 'Critical';
  };

  if (hasScored) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <ThumbsUp className="w-4 h-4 text-green-500" />
        <span>Scored: {score}/100</span>
        <Button variant="ghost" size="sm" onClick={() => setHasScored(false)}>
          Update
        </Button>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Rate:</span>
        <div className="flex gap-1">
          {[20, 40, 60, 80, 100].map(s => (
            <Button
              key={s}
              variant="ghost"
              size="sm"
              className={`w-10 h-8 p-0 ${score === s ? getScoreColor(s) : ''}`}
              onClick={() => handleQuickScore(s)}
            >
              {s}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <Card className="border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Star className="w-4 h-4" />
            Rate This Output
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Quality Score</span>
              <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
                {score}/100
              </span>
            </div>
            <Slider
              value={[score]}
              onValueChange={handleScoreChange}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Critical (0)</span>
              <span className={getScoreColor(score)}>{getScoreLabel(score)}</span>
              <span>Perfect (100)</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                if (score < 40) {
                  setShowFeedbackDialog(true);
                } else {
                  submitScore();
                }
              }}
            >
              {score < 40 ? (
                <>
                  <ThumbsDown className="w-4 h-4 mr-2" />
                  Report Issue
                </>
              ) : (
                <>
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Submit Score
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              What went wrong?
            </DialogTitle>
            <DialogDescription>
              Score below 40 requires feedback. Help us improve by describing the issue.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Issue Category</label>
              <Select value={issueCategory} onValueChange={setIssueCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select issue type" />
                </SelectTrigger>
                <SelectContent>
                  {ISSUE_CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Responsible Area</label>
              <Select value={responsibleArea} onValueChange={setResponsibleArea}>
                <SelectTrigger>
                  <SelectValue placeholder="What needs fixing?" />
                </SelectTrigger>
                <SelectContent>
                  {RESPONSIBLE_AREAS.map(area => (
                    <SelectItem key={area.value} value={area.value}>
                      {area.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Describe what was wrong and how it should be improved..."
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowFeedbackDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => submitScore()}>
                Submit Feedback
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default OutputQualityScorer;
