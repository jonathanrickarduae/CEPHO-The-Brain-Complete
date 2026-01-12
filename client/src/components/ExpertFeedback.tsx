import { useState } from 'react';
import { ThumbsUp, ThumbsDown, X, Send, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface ExpertFeedbackProps {
  expertId: string;
  expertName: string;
  responseContent: string;
  projectId?: number;
  onFeedbackSubmitted?: (rating: 'positive' | 'negative', feedback?: string) => void;
}

/**
 * Optional Yes/No feedback component for expert responses
 * Non-intrusive - only shows when user wants to provide feedback
 */
export function ExpertFeedback({ 
  expertId, 
  expertName, 
  responseContent,
  projectId,
  onFeedbackSubmitted 
}: ExpertFeedbackProps) {
  const [rating, setRating] = useState<'positive' | 'negative' | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const recordFeedback = trpc.feedback.record.useMutation();
  const storeMemory = trpc.expertEvolution.storeMemory.useMutation();

  const handleRating = async (newRating: 'positive' | 'negative') => {
    setRating(newRating);
    
    if (newRating === 'negative') {
      setShowFeedbackModal(true);
    } else {
      await submitFeedback(newRating);
    }
  };

  const submitFeedback = async (feedbackRating: 'positive' | 'negative', details?: string) => {
    setIsSubmitting(true);
    
    try {
      await recordFeedback.mutateAsync({
        expertId,
        projectId: projectId?.toString(),
        rating: feedbackRating === 'positive' ? 5 : 1,
        feedbackType: feedbackRating,
        feedbackText: details,
        originalOutput: responseContent.slice(0, 500),
      });

      if (feedbackRating === 'negative' && details) {
        await storeMemory.mutateAsync({
          expertId,
          memoryType: 'correction',
          key: `Correction: ${new Date().toISOString().split('T')[0]}`,
          value: details,
          confidence: 0.9,
          source: 'user_feedback',
        });
      }

      toast.success(
        feedbackRating === 'positive' 
          ? 'Thanks for the feedback' 
          : 'Noted - Chief of Staff will learn from this'
      );
      
      onFeedbackSubmitted?.(feedbackRating, details);
      setShowFeedbackModal(false);
      setFeedbackText('');
      
    } catch (error) {
      console.error('Feedback submission error:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitNegativeFeedback = () => {
    submitFeedback('negative', feedbackText || 'Not useful');
  };

  if (rating && !showFeedbackModal) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {rating === 'positive' ? (
          <ThumbsUp className="w-3 h-3 text-green-500" />
        ) : (
          <ThumbsDown className="w-3 h-3 text-amber-500" />
        )}
      </div>
    );
  }

  return (
    <>
      {/* Subtle rating buttons - non-intrusive */}
      <div className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
        <button
          onClick={() => handleRating('positive')}
          className="p-1.5 hover:bg-green-500/10 rounded text-muted-foreground hover:text-green-500 transition-colors"
          disabled={isSubmitting}
          title="Useful"
        >
          <ThumbsUp className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => handleRating('negative')}
          className="p-1.5 hover:bg-amber-500/10 rounded text-muted-foreground hover:text-amber-500 transition-colors"
          disabled={isSubmitting}
          title="Not useful"
        >
          <ThumbsDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Feedback Modal - only for negative */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold text-foreground">Quick feedback</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowFeedbackModal(false);
                  setRating(null);
                }}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Optional: What could {expertName} do better?
            </p>

            <div className="space-y-3">
              {/* Quick tags */}
              <div className="flex flex-wrap gap-2">
                {['Too long', 'Missed the point', 'Not actionable', 'Wrong approach'].map(option => (
                  <button
                    key={option}
                    onClick={() => setFeedbackText(option)}
                    className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                      feedbackText === option 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-gray-800 hover:bg-gray-700 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Or type your own feedback..."
                className="w-full h-20 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm resize-none"
              />

              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setRating(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitNegativeFeedback}
                  disabled={isSubmitting}
                  className="bg-primary text-primary-foreground"
                >
                  {isSubmitting ? 'Saving...' : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Minimal inline feedback for chat - just icons
 */
export function InlineExpertFeedback({ 
  expertId, 
  responseContent,
  onFeedbackSubmitted 
}: { expertId: string; responseContent: string; onFeedbackSubmitted?: (rating: 'positive' | 'negative') => void }) {
  const [rated, setRated] = useState<'positive' | 'negative' | null>(null);
  const recordFeedback = trpc.feedback.record.useMutation();

  const handleQuickRating = async (rating: 'positive' | 'negative') => {
    setRated(rating);
    
    try {
      await recordFeedback.mutateAsync({
        expertId,
        rating: rating === 'positive' ? 5 : 2,
        feedbackType: rating,
        originalOutput: responseContent.slice(0, 200),
      });
      onFeedbackSubmitted?.(rating);
    } catch (error) {
      console.error('Quick rating error:', error);
    }
  };

  if (rated) {
    return (
      <span className="text-xs text-muted-foreground">
        {rated === 'positive' ? '✓' : '✗'}
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={() => handleQuickRating('positive')}
        className="p-1 hover:bg-green-500/10 rounded text-muted-foreground hover:text-green-500"
      >
        <ThumbsUp className="w-3 h-3" />
      </button>
      <button
        onClick={() => handleQuickRating('negative')}
        className="p-1 hover:bg-amber-500/10 rounded text-muted-foreground hover:text-amber-500"
      >
        <ThumbsDown className="w-3 h-3" />
      </button>
    </div>
  );
}

export default ExpertFeedback;
