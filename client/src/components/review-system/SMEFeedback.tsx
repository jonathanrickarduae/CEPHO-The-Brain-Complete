import { useState } from 'react';
import { 
  Star, 
  Mic, 
  MicOff, 
  Send, 
  ThumbsUp, 
  ThumbsDown,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  Check,
  Brain
} from 'lucide-react';

interface SMEFeedbackProps {
  expertId: string;
  expertName: string;
  expertAvatar?: string;
  conversationId: string;
  onSubmit: (feedback: FeedbackData) => void;
  onSkip?: () => void;
}

interface FeedbackData {
  expertId: string;
  conversationId: string;
  rating: number;
  quickFeedback?: 'helpful' | 'not_helpful' | null;
  voiceNote?: Blob;
  textFeedback?: string;
  improvements?: string[];
  timestamp: Date;
}

const IMPROVEMENT_OPTIONS = [
  { id: 'more_specific', label: 'Be more specific' },
  { id: 'more_concise', label: 'Be more concise' },
  { id: 'better_sources', label: 'Better sources needed' },
  { id: 'more_challenging', label: 'Challenge me more' },
  { id: 'less_technical', label: 'Less technical jargon' },
  { id: 'more_examples', label: 'More examples' },
  { id: 'faster_response', label: 'Faster responses' },
  { id: 'deeper_analysis', label: 'Deeper analysis' },
];

export function SMEFeedbackRating({ 
  expertId, 
  expertName, 
  expertAvatar,
  conversationId, 
  onSubmit,
  onSkip 
}: SMEFeedbackProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [quickFeedback, setQuickFeedback] = useState<'helpful' | 'not_helpful' | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [textFeedback, setTextFeedback] = useState('');
  const [selectedImprovements, setSelectedImprovements] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceNote, setVoiceNote] = useState<Blob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRatingClick = (value: number) => {
    setRating(value);
    if (value <= 5) {
      setShowDetails(true);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const feedback: FeedbackData = {
      expertId,
      conversationId,
      rating,
      quickFeedback,
      voiceNote: voiceNote || undefined,
      textFeedback: textFeedback || undefined,
      improvements: selectedImprovements.length > 0 ? selectedImprovements : undefined,
      timestamp: new Date(),
    };

    await onSubmit(feedback);
    setIsSubmitting(false);
  };

  const toggleImprovement = (id: string) => {
    setSelectedImprovements(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setVoiceNote(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Auto-stop after 60 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          setIsRecording(false);
        }
      }, 60000);

      // Store reference to stop later
      (window as any).currentRecorder = mediaRecorder;
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  };

  const stopRecording = () => {
    const recorder = (window as any).currentRecorder;
    if (recorder && recorder.state === 'recording') {
      recorder.stop();
      setIsRecording(false);
    }
  };

  const getRatingLabel = (value: number) => {
    if (value <= 2) return 'Poor';
    if (value <= 4) return 'Below Average';
    if (value <= 6) return 'Average';
    if (value <= 8) return 'Good';
    return 'Excellent';
  };

  const getRatingColor = (value: number) => {
    if (value <= 3) return 'text-red-400';
    if (value <= 5) return 'text-amber-400';
    if (value <= 7) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {expertAvatar ? (
            <img src={expertAvatar} alt={expertName} className="w-10 h-10 rounded-full" />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
          )}
          <div>
            <h3 className="text-white font-medium">Rate this conversation</h3>
            <p className="text-sm text-foreground/70">with {expertName}</p>
          </div>
        </div>
        {onSkip && (
          <button 
            onClick={onSkip}
            className="text-foreground/60 hover:text-foreground/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Rating Slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-foreground/70">How helpful was this?</span>
          {rating > 0 && (
            <span className={`text-sm font-medium ${getRatingColor(rating)}`}>
              {rating}/10 - {getRatingLabel(rating)}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
            <button
              key={value}
              onClick={() => handleRatingClick(value)}
              onMouseEnter={() => setHoveredRating(value)}
              onMouseLeave={() => setHoveredRating(0)}
              className={`flex-1 h-8 rounded transition-all ${
                value <= (hoveredRating || rating)
                  ? value <= 3 ? 'bg-red-500' :
                    value <= 5 ? 'bg-amber-500' :
                    value <= 7 ? 'bg-yellow-500' :
                    'bg-green-500'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            />
          ))}
        </div>
        
        <div className="flex justify-between text-xs text-foreground/60 mt-1">
          <span>Not helpful</span>
          <span>Very helpful</span>
        </div>
      </div>

      {/* Quick Feedback Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setQuickFeedback(quickFeedback === 'helpful' ? null : 'helpful')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
            quickFeedback === 'helpful'
              ? 'bg-green-500/20 border-green-500 text-green-400'
              : 'bg-gray-800 border-gray-700 text-foreground/70 hover:border-gray-600'
          }`}
        >
          <ThumbsUp className="w-4 h-4" />
          <span>Helpful</span>
        </button>
        <button
          onClick={() => {
            setQuickFeedback(quickFeedback === 'not_helpful' ? null : 'not_helpful');
            if (quickFeedback !== 'not_helpful') setShowDetails(true);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
            quickFeedback === 'not_helpful'
              ? 'bg-red-500/20 border-red-500 text-red-400'
              : 'bg-gray-800 border-gray-700 text-foreground/70 hover:border-gray-600'
          }`}
        >
          <ThumbsDown className="w-4 h-4" />
          <span>Not Helpful</span>
        </button>
      </div>

      {/* Detailed Feedback (shown for low ratings or when requested) */}
      {showDetails && (
        <div className="space-y-4 mb-6 animate-in slide-in-from-top-2">
          {/* Improvement Tags */}
          <div>
            <label className="block text-sm text-foreground/70 mb-2">What could be improved?</label>
            <div className="flex flex-wrap gap-2">
              {IMPROVEMENT_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => toggleImprovement(option.id)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    selectedImprovements.includes(option.id)
                      ? 'bg-purple-500/30 border border-purple-500 text-purple-300'
                      : 'bg-gray-800 border border-gray-700 text-foreground/70 hover:border-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text Feedback */}
          <div>
            <label className="block text-sm text-foreground/70 mb-2">Additional feedback (optional)</label>
            <textarea
              value={textFeedback}
              onChange={(e) => setTextFeedback(e.target.value)}
              placeholder="Tell us more about your experience..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Voice Note */}
          <div>
            <label className="block text-sm text-foreground/70 mb-2">Or leave a voice note</label>
            <div className="flex items-center gap-3">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  isRecording
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-gray-800 border border-gray-700 text-foreground/70 hover:border-gray-600'
                }`}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    <span>Stop Recording</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    <span>Record Voice Note</span>
                  </>
                )}
              </button>
              {voiceNote && !isRecording && (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <Check className="w-4 h-4" />
                  <span>Voice note recorded</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toggle Details Button */}
      {!showDetails && rating > 5 && (
        <button
          onClick={() => setShowDetails(true)}
          className="w-full text-center text-sm text-foreground/60 hover:text-foreground/80 mb-4 transition-colors"
        >
          + Add detailed feedback
        </button>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={rating === 0 || isSubmitting}
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Submitting...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Submit Feedback</span>
          </>
        )}
      </button>

      {/* Chief of Staff Note */}
      <p className="text-center text-xs text-foreground/60 mt-4">
        Your feedback helps the Chief of Staff improve this expert overnight
      </p>
    </div>
  );
}

// Compact inline rating for quick feedback
export function SMEQuickRating({ 
  expertId, 
  expertName,
  onRate 
}: { 
  expertId: string; 
  expertName: string;
  onRate: (rating: number) => void;
}) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleRate = (value: number) => {
    setRating(value);
    setSubmitted(true);
    onRate(value);
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-400">
        <Check className="w-4 h-4" />
        <span>Thanks for your feedback!</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-foreground/70">Rate {expertName}:</span>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
          <button
            key={value}
            onClick={() => handleRate(value)}
            onMouseEnter={() => setHoveredRating(value)}
            onMouseLeave={() => setHoveredRating(0)}
            className={`w-5 h-5 rounded transition-all ${
              value <= (hoveredRating || rating)
                ? value <= 3 ? 'bg-red-500' :
                  value <= 5 ? 'bg-amber-500' :
                  value <= 7 ? 'bg-yellow-500' :
                  'bg-green-500'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// Expert Performance Card (for Chief of Staff dashboard)
export function ExpertPerformanceCard({
  expert,
  onAction
}: {
  expert: {
    id: string;
    name: string;
    avatar?: string;
    category: string;
    averageRating: number;
    totalConversations: number;
    trend: 'up' | 'down' | 'stable';
    recentFeedback: string[];
    status: 'active' | 'needs_improvement' | 'under_review' | 'suspended';
  };
  onAction: (action: 'enhance' | 'retrain' | 'demote' | 'promote' | 'suspend') => void;
}) {
  const getTrendIcon = () => {
    switch (expert.trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-400" />;
      default: return <Minus className="w-4 h-4 text-foreground/70" />;
    }
  };

  const getStatusBadge = () => {
    switch (expert.status) {
      case 'active':
        return <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">Active</span>;
      case 'needs_improvement':
        return <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">Needs Improvement</span>;
      case 'under_review':
        return <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">Under Review</span>;
      case 'suspended':
        return <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">Suspended</span>;
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating < 4) return 'text-red-400';
    if (rating < 6) return 'text-amber-400';
    if (rating < 8) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {expert.avatar ? (
            <img src={expert.avatar} alt={expert.name} className="w-10 h-10 rounded-full" />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
          )}
          <div>
            <h4 className="text-white font-medium">{expert.name}</h4>
            <p className="text-xs text-foreground/60">{expert.category}</p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="text-xs text-foreground/60 mb-1">Avg Rating</div>
          <div className={`text-xl font-bold ${getRatingColor(expert.averageRating)}`}>
            {expert.averageRating.toFixed(1)}
          </div>
        </div>
        <div>
          <div className="text-xs text-foreground/60 mb-1">Conversations</div>
          <div className="text-xl font-bold text-white">{expert.totalConversations}</div>
        </div>
        <div>
          <div className="text-xs text-foreground/60 mb-1">Trend</div>
          <div className="flex items-center gap-1">
            {getTrendIcon()}
            <span className={`text-sm ${
              expert.trend === 'up' ? 'text-green-400' :
              expert.trend === 'down' ? 'text-red-400' :
              'text-foreground/70'
            }`}>
              {expert.trend === 'up' ? '+0.5' : expert.trend === 'down' ? '-0.3' : '0.0'}
            </span>
          </div>
        </div>
      </div>

      {expert.recentFeedback.length > 0 && (
        <div className="mb-4">
          <div className="text-xs text-foreground/60 mb-2">Recent Feedback</div>
          <div className="space-y-1">
            {expert.recentFeedback.slice(0, 2).map((feedback, idx) => (
              <div key={idx} className="text-xs text-foreground/70 flex items-start gap-2">
                <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-1">{feedback}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {expert.status === 'needs_improvement' && (
          <>
            <button
              onClick={() => onAction('enhance')}
              className="flex-1 px-3 py-1.5 bg-blue-500/20 text-blue-400 text-xs rounded-lg hover:bg-blue-500/30 transition-colors"
            >
              Enhance
            </button>
            <button
              onClick={() => onAction('retrain')}
              className="flex-1 px-3 py-1.5 bg-purple-500/20 text-purple-400 text-xs rounded-lg hover:bg-purple-500/30 transition-colors"
            >
              Retrain
            </button>
          </>
        )}
        {expert.status === 'active' && expert.averageRating >= 8 && (
          <button
            onClick={() => onAction('promote')}
            className="flex-1 px-3 py-1.5 bg-green-500/20 text-green-400 text-xs rounded-lg hover:bg-green-500/30 transition-colors"
          >
            Promote
          </button>
        )}
        {expert.averageRating < 4 && (
          <button
            onClick={() => onAction('suspend')}
            className="flex-1 px-3 py-1.5 bg-red-500/20 text-red-400 text-xs rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Suspend
          </button>
        )}
      </div>
    </div>
  );
}

export default SMEFeedbackRating;
