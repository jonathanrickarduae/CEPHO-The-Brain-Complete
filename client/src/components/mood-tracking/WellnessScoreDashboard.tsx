import { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Minus, 
  Brain, Heart, Zap, Target,
  ChevronRight, Info, Share2
} from 'lucide-react';
import { 
  calculateWellnessScore, 
  getScoreLabel, 
  getScoreColor,
  type WellnessInputs,
  type WellnessOutput 
} from '@/lib/wellnessScore';
import { ShareableInsight, generateWellnessInsight } from '@/components/analytics/ShareableInsight';

interface WellnessScoreDashboardProps {
  compact?: boolean;
  onShare?: () => void;
}

export function WellnessScoreDashboard({ compact = false, onShare }: WellnessScoreDashboardProps) {
  const [wellnessData, setWellnessData] = useState<WellnessOutput | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);

  useEffect(() => {
    // In production, this would fetch real data from the API
    // For now, we'll use mock data based on localStorage
    const moodHistory = JSON.parse(localStorage.getItem('brain_mood_history') || '[]');
    const recentMoods = moodHistory.slice(-3).map((m: any) => m.score || 70); // 0-100 scale
    
    const mockInputs: WellnessInputs = {
      moodScores: recentMoods.length > 0 ? recentMoods : [70, 80, 70], // 0-100 scale
      moodTrend: 'stable',
      tasksCompleted: Math.floor(Math.random() * 8) + 3,
      tasksPlanned: 10,
      focusMinutes: Math.floor(Math.random() * 180) + 60,
      meetingMinutes: Math.floor(Math.random() * 120) + 30,
      calendarDensity: Math.random() * 0.5 + 0.3,
      backToBackMeetings: Math.floor(Math.random() * 3),
      averageScore: 72, // 0-100 scale
      streakDays: parseInt(localStorage.getItem('brain_streak_days') || '0'),
    };

    const result = calculateWellnessScore(mockInputs);
    setWellnessData(result);
  }, []);

  if (!wellnessData) {
    return (
      <div className="animate-pulse bg-gray-800 rounded-2xl p-6 h-48" />
    );
  }

  const TrendIcon = wellnessData.trend === 'improving' ? TrendingUp : 
                    wellnessData.trend === 'declining' ? TrendingDown : Minus;
  
  const trendColor = wellnessData.trend === 'improving' ? 'text-green-400' :
                     wellnessData.trend === 'declining' ? 'text-red-400' : 'text-foreground/70';

  if (compact) {
    return (
      <div 
        className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-2xl p-4 cursor-pointer hover:border-cyan-500/40 transition-colors"
        onClick={() => setShowDetails(true)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{wellnessData.score.toFixed(1)}</span>
            </div>
            <div>
              <div className="text-sm text-foreground/70">Wellness Score</div>
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${getScoreColor(wellnessData.score)}`}>
                  {getScoreLabel(wellnessData.score)}
                </span>
                <TrendIcon className={`w-4 h-4 ${trendColor}`} />
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-foreground/60" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-cyan-400" />
          Wellness Score
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowShareCard(true)}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <Share2 className="w-4 h-4 text-foreground/70" />
          </button>
          <button className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
            <Info className="w-4 h-4 text-foreground/70" />
          </button>
        </div>
      </div>

      {/* Main Score */}
      <div className="flex items-center gap-6 mb-6">
        <div className="relative">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-700"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${(wellnessData.score / 100) * 352} 352`}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-white">{Math.round(wellnessData.score)}</span>
            <span className="text-sm text-foreground/70">out of 100</span>
          </div>
        </div>

        <div className="flex-1">
          <div className={`text-xl font-semibold ${getScoreColor(wellnessData.score)} mb-2`}>
            {getScoreLabel(wellnessData.score)}
          </div>
          <div className={`flex items-center gap-2 ${trendColor} mb-4`}>
            <TrendIcon className="w-4 h-4" />
            <span className="text-sm">
              {wellnessData.trend === 'improving' ? 'Improving from yesterday' :
               wellnessData.trend === 'declining' ? 'Down from yesterday' :
               'Stable'}
            </span>
          </div>
          <p className="text-sm text-foreground/70">
            {wellnessData.insights[0] || "Keep up the great work!"}
          </p>
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Mood', value: wellnessData.breakdown.mood, icon: Heart, color: 'text-pink-400' },
          { label: 'Productivity', value: wellnessData.breakdown.productivity, icon: Zap, color: 'text-yellow-400' },
          { label: 'Balance', value: wellnessData.breakdown.balance, icon: Target, color: 'text-green-400' },
          { label: 'Momentum', value: wellnessData.breakdown.momentum, icon: TrendingUp, color: 'text-blue-400' },
        ].map((item) => (
          <div key={item.label} className="bg-gray-900 rounded-xl p-3 text-center">
            <item.icon className={`w-5 h-5 ${item.color} mx-auto mb-1`} />
            <div className="text-lg font-semibold text-white">{item.value.toFixed(1)}</div>
            <div className="text-xs text-foreground/60">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      {wellnessData.recommendations.length > 0 && (
        <div className="bg-gray-900 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-white mb-3">Recommendations</h4>
          <div className="space-y-2">
            {wellnessData.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-cyan-400">{index + 1}</span>
                </div>
                <p className="text-sm text-foreground/80">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full">
            <ShareableInsight
              {...generateWellnessInsight({
                score: wellnessData.score,
                trend: wellnessData.trend,
                moodAverage: wellnessData.breakdown.mood,
                recommendations: wellnessData.recommendations,
              })}
              onShare={() => {}}
            />
            <button
              onClick={() => setShowShareCard(false)}
              className="w-full mt-4 py-2 bg-gray-700 hover:bg-gray-600 text-foreground/80 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Mini wellness score for sidebar or header
export function WellnessScoreMini() {
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    // Quick calculation for mini display
    const moodHistory = JSON.parse(localStorage.getItem('brain_mood_history') || '[]');
    const recentMoods = moodHistory.slice(-3).map((m: any) => m.score || 70); // 0-100 scale
    const avgMood = recentMoods.length > 0 
      ? recentMoods.reduce((a: number, b: number) => a + b, 0) / recentMoods.length 
      : 70; // 0-100 scale
    setScore(Math.round(avgMood));
  }, []);

  if (score === null) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-full">
      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
        <span className="text-xs font-bold text-white">{score}</span>
      </div>
      <span className="text-xs text-foreground/70">Wellness</span>
    </div>
  );
}
