import { useState } from 'react';
import { Share2, Copy, Check, Twitter, Linkedin, Download, Eye, BarChart3, Heart, Star, Trophy, Lightbulb, Brain } from 'lucide-react';

interface ShareableInsightProps {
  type: 'productivity' | 'mood' | 'wellness' | 'achievement' | 'consultation';
  title: string;
  data: {
    score?: number;
    trend?: string;
    highlights?: string[];
    period?: string;
    expertName?: string;
  };
  onShare?: (platform: string) => void;
}

export function ShareableInsight({ type, title, data, onShare }: ShareableInsightProps) {
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const generateShareUrl = () => {
    // In production, this would create a unique shareable link
    const shareCode = Math.random().toString(36).substring(7);
    return `${window.location.origin}/shared/${shareCode}`;
  };

  const generateShareText = () => {
    switch (type) {
      case 'productivity':
        return `My productivity score this ${data.period || 'week'}: ${data.score}/100\n\n${data.highlights?.join('\n') || ''}\n\nPowered by Cepho`;
      case 'mood':
        return `My mood trend is ${data.trend}\n\n${data.highlights?.join('\n') || ''}\n\nTracking my wellness with Cepho`;
      case 'wellness':
        return `Wellness Score: ${data.score}/100\n\n${data.highlights?.join('\n') || ''}\n\nGetting to 100 with Cepho`;
      case 'achievement':
        return `${title}\n\n${data.highlights?.join('\n') || ''}\n\nAchieved with Cepho`;
      case 'consultation':
        return `Just consulted with ${data.expertName} on Cepho\n\nKey insight: ${data.highlights?.[0] || ''}\n\nAI-SMEs at Cepho`;
      default:
        return `${title}\n\nPowered by Cepho`;
    }
  };

  const copyToClipboard = async () => {
    const text = generateShareText();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onShare?.('copy');
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(generateShareText());
    const url = encodeURIComponent(generateShareUrl());
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    onShare?.('twitter');
  };

  const shareToLinkedIn = () => {
    const url = encodeURIComponent(generateShareUrl());
    const title = encodeURIComponent(generateShareText().split('\n')[0]);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}`, '_blank');
    onShare?.('linkedin');
  };

  const downloadAsImage = () => {
    // In production, this would generate an image of the insight card
    onShare?.('download');
  };

  const getTypeIcon = () => {
    const iconClass = 'w-5 h-5';
    switch (type) {
      case 'productivity': return <BarChart3 className={iconClass} />;
      case 'mood': return <Heart className={iconClass} />;
      case 'wellness': return <Star className={iconClass} />;
      case 'achievement': return <Trophy className={iconClass} />;
      case 'consultation': return <Lightbulb className={iconClass} />;
      default: return <Brain className={iconClass} />;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'productivity': return 'from-blue-500 to-cyan-500';
      case 'mood': return 'from-pink-500 to-rose-500';
      case 'wellness': return 'from-green-500 to-emerald-500';
      case 'achievement': return 'from-yellow-500 to-orange-500';
      case 'consultation': return 'from-purple-500 to-violet-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  return (
    <div className="relative">
      {/* Insight Card */}
      <div className={`rounded-2xl bg-gradient-to-br ${getTypeColor()} p-1`}>
        <div className="bg-gray-900 rounded-xl p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/20">{getTypeIcon()}</div>
              <div>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                {data.period && (
                  <p className="text-sm text-foreground/70">{data.period}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Share2 className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Score Display */}
          {data.score !== undefined && (
            <div className="flex items-center gap-4 mb-4">
              <div className="text-5xl font-bold text-white">
                {data.score}
                <span className="text-2xl text-foreground/70">/10</span>
              </div>
              {data.trend && (
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  data.trend === 'improving' ? 'bg-green-500/20 text-green-400' :
                  data.trend === 'declining' ? 'bg-red-500/20 text-red-400' :
                  'bg-gray-500/20 text-foreground/70'
                }`}>
                  {data.trend === 'improving' ? '↑ Improving' :
                   data.trend === 'declining' ? '↓ Declining' :
                   '→ Stable'}
                </div>
              )}
            </div>
          )}

          {/* Highlights */}
          {data.highlights && data.highlights.length > 0 && (
            <div className="space-y-2 mb-4">
              {data.highlights.map((highlight, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <p className="text-foreground/80 text-sm">{highlight}</p>
                </div>
              ))}
            </div>
          )}

          {/* Branding */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-700">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-pink-500" />
              <span className="text-sm text-foreground/70">Powered by Cepho</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-foreground/60">
              <Eye className="w-4 h-4" />
              <span>Public insight</span>
            </div>
          </div>
        </div>
      </div>

      {/* Share Menu */}
      {showShareMenu && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-50">
          <button
            onClick={copyToClipboard}
            className="w-full flex items-center gap-3 px-4 py-3 text-left text-foreground/80 hover:bg-gray-700 transition-colors"
          >
            {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
            <span>{copied ? 'Copied!' : 'Copy text'}</span>
          </button>
          <button
            onClick={shareToTwitter}
            className="w-full flex items-center gap-3 px-4 py-3 text-left text-foreground/80 hover:bg-gray-700 transition-colors"
          >
            <Twitter className="w-5 h-5" />
            <span>Share on X</span>
          </button>
          <button
            onClick={shareToLinkedIn}
            className="w-full flex items-center gap-3 px-4 py-3 text-left text-foreground/80 hover:bg-gray-700 transition-colors"
          >
            <Linkedin className="w-5 h-5" />
            <span>Share on LinkedIn</span>
          </button>
          <button
            onClick={downloadAsImage}
            className="w-full flex items-center gap-3 px-4 py-3 text-left text-foreground/80 hover:bg-gray-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>Download image</span>
          </button>
        </div>
      )}
    </div>
  );
}

// Compact version for embedding in other components
export function ShareButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 text-sm text-foreground/70 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
    >
      <Share2 className="w-4 h-4" />
      <span>Share</span>
    </button>
  );
}

// Generate shareable card data
export function generateProductivityInsight(data: {
  tasksCompleted: number;
  focusHours: number;
  streak: number;
  period: string;
}): ShareableInsightProps {
  const score = Math.min(100, Math.round((data.tasksCompleted / 10 + data.focusHours / 4 + data.streak / 7) * 33)); // 0-100 scale
  
  return {
    type: 'productivity',
    title: 'Productivity Report',
    data: {
      score,
      period: data.period,
      trend: score >= 70 ? 'improving' : score >= 50 ? 'stable' : 'declining',
      highlights: [
        `Completed ${data.tasksCompleted} tasks`,
        `${data.focusHours} hours of deep focus`,
        `${data.streak}-day streak`,
      ],
    },
  };
}

export function generateWellnessInsight(data: {
  score: number;
  trend: string;
  moodAverage: number;
  recommendations: string[];
}): ShareableInsightProps {
  return {
    type: 'wellness',
    title: 'Wellness Score',
    data: {
      score: data.score,
      trend: data.trend as 'improving' | 'stable' | 'declining',
      highlights: [
        `Average mood: ${Math.round(data.moodAverage)}/100`,
        ...data.recommendations.slice(0, 2),
      ],
    },
  };
}
