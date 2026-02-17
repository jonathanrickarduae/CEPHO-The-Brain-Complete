import { Star, TrendingUp, CheckCircle2, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ExpertPerformanceData {
  rating: number; // 1-5 stars
  successRate: number; // 0-100%
  qualityScore: number; // 0-100
  reviewCount: number;
  isMostPopular?: boolean;
}

interface ExpertPerformanceRatingProps {
  expert: {
    id: string;
    name: string;
  };
  performance: ExpertPerformanceData;
  compact?: boolean; // Compact view for grid display
}

export function ExpertPerformanceRating({ expert, performance, compact = false }: ExpertPerformanceRatingProps) {
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < Math.floor(rating)
                ? 'fill-amber-400 text-amber-400'
                : i < rating
                ? 'fill-amber-400/50 text-amber-400'
                : 'text-border'
            }`}
          />
        ))}
        <span className="text-xs font-medium text-foreground ml-1">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  const getQualityBadge = (score: number) => {
    if (score >= 90) return { label: 'Excellent', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
    if (score >= 75) return { label: 'Good', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
    if (score >= 60) return { label: 'Fair', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
    return { label: 'Needs Work', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
  };

  const qualityBadge = getQualityBadge(performance.qualityScore);

  if (compact) {
    return (
      <div className="space-y-2">
        {/* Star rating */}
        {renderStars(performance.rating)}

        {/* Success rate */}
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          <span className="text-xs text-muted-foreground">
            {performance.successRate}% success rate
          </span>
        </div>

        {/* Quality score badge */}
        <Badge variant="outline" className={`text-xs ${qualityBadge.color}`}>
          {qualityBadge.label} ({performance.qualityScore}%)
        </Badge>

        {/* Review count */}
        <p className="text-xs text-muted-foreground">
          {performance.reviewCount} reviews
        </p>

        {/* Most popular badge */}
        {performance.isMostPopular && (
          <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs gap-1">
            <Award className="w-3 h-3" />
            Most Popular
          </Badge>
        )}
      </div>
    );
  }

  // Full view
  return (
    <div className="space-y-4">
      {/* Header with star rating */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">{expert.name}</h3>
        {performance.isMostPopular && (
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 gap-1">
            <Award className="w-3 h-3" />
            Most Popular
          </Badge>
        )}
      </div>

      {/* Star rating */}
      <div className="flex items-center gap-2">
        {renderStars(performance.rating)}
        <span className="text-xs text-muted-foreground">
          ({performance.reviewCount} reviews)
        </span>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Success rate */}
        <div className="bg-secondary/30 rounded-lg p-3 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-xs font-medium text-muted-foreground">Success Rate</span>
          </div>
          <p className="text-lg font-bold text-foreground">{performance.successRate}%</p>
        </div>

        {/* Quality score */}
        <div className="bg-secondary/30 rounded-lg p-3 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-medium text-muted-foreground">Quality</span>
          </div>
          <p className="text-lg font-bold text-foreground">{performance.qualityScore}%</p>
        </div>
      </div>

      {/* Quality badge */}
      <Badge variant="outline" className={`w-full justify-center py-2 ${qualityBadge.color}`}>
        {qualityBadge.label}
      </Badge>

      {/* Performance trend */}
      <div className="text-xs text-muted-foreground bg-secondary/20 rounded-lg p-3 border border-border">
        <p>
          This expert has helped {performance.reviewCount} users with an average success rate of{' '}
          <span className="font-medium text-foreground">{performance.successRate}%</span> and quality score of{' '}
          <span className="font-medium text-foreground">{performance.qualityScore}%</span>.
        </p>
      </div>
    </div>
  );
}

// Mock data generator for demo
export function generateMockPerformance(): ExpertPerformanceData {
  return {
    rating: 3.5 + Math.random() * 1.5,
    successRate: 70 + Math.floor(Math.random() * 30),
    qualityScore: 65 + Math.floor(Math.random() * 35),
    reviewCount: 50 + Math.floor(Math.random() * 450),
    isMostPopular: Math.random() > 0.85,
  };
}
