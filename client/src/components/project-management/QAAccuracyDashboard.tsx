import React, { useState } from 'react';
import { 
  TrendingUp, TrendingDown, Minus, Award, Target, 
  Brain, CheckCircle2, XCircle, AlertTriangle, 
  BarChart3, LineChart, Clock, Zap, Shield
} from 'lucide-react';

interface QAMetrics {
  totalReviews: number;
  approvedFirstPass: number;
  revisionsRequested: number;
  averageRevisions: number;
  accuracyRate: number;
  trend: 'improving' | 'stable' | 'declining';
  confidenceLevel: number; // 0-100
  autonomyRecommendation: 'not_ready' | 'limited' | 'moderate' | 'high';
}

interface DeliverableTypeMetrics {
  type: string;
  displayName: string;
  totalReviews: number;
  approvalRate: number;
  avgRevisions: number;
  confidenceScore: number;
  lastReviewDate?: Date;
  commonCorrections: string[];
}

interface LearningProgress {
  date: string;
  accuracyRate: number;
  reviewCount: number;
}

// Sample data - in production, this would come from the API
const SAMPLE_METRICS: QAMetrics = {
  totalReviews: 47,
  approvedFirstPass: 38,
  revisionsRequested: 9,
  averageRevisions: 1.2,
  accuracyRate: 80.9,
  trend: 'improving',
  confidenceLevel: 72,
  autonomyRecommendation: 'limited',
};

const SAMPLE_DELIVERABLE_METRICS: DeliverableTypeMetrics[] = [
  {
    type: 'nda',
    displayName: 'Non-Disclosure Agreement',
    totalReviews: 12,
    approvalRate: 91.7,
    avgRevisions: 0.8,
    confidenceScore: 85,
    lastReviewDate: new Date('2026-01-10'),
    commonCorrections: ['Jurisdiction clause', 'Confidentiality period'],
  },
  {
    type: 'financial_model',
    displayName: 'Financial Model',
    totalReviews: 8,
    approvalRate: 75.0,
    avgRevisions: 1.5,
    confidenceScore: 65,
    lastReviewDate: new Date('2026-01-09'),
    commonCorrections: ['Revenue assumptions', 'Growth rate projections', 'Unit economics'],
  },
  {
    type: 'dd_checklist',
    displayName: 'Due Diligence Checklist',
    totalReviews: 10,
    approvalRate: 90.0,
    avgRevisions: 0.9,
    confidenceScore: 82,
    lastReviewDate: new Date('2026-01-11'),
    commonCorrections: ['Industry-specific items', 'Regulatory requirements'],
  },
  {
    type: 'investment_deck',
    displayName: 'Investment Deck',
    totalReviews: 6,
    approvalRate: 66.7,
    avgRevisions: 1.8,
    confidenceScore: 55,
    lastReviewDate: new Date('2026-01-08'),
    commonCorrections: ['Market sizing', 'Competitive positioning', 'Financial projections'],
  },
  {
    type: 'risk_register',
    displayName: 'Risk Register',
    totalReviews: 7,
    approvalRate: 85.7,
    avgRevisions: 1.0,
    confidenceScore: 78,
    lastReviewDate: new Date('2026-01-10'),
    commonCorrections: ['Risk severity ratings', 'Mitigation strategies'],
  },
  {
    type: 'shareholder_agreement',
    displayName: 'Shareholder Agreement',
    totalReviews: 4,
    approvalRate: 50.0,
    avgRevisions: 2.2,
    confidenceScore: 42,
    lastReviewDate: new Date('2026-01-07'),
    commonCorrections: ['Vesting terms', 'Drag-along provisions', 'Board composition'],
  },
];

const SAMPLE_LEARNING_PROGRESS: LearningProgress[] = [
  { date: '2025-12-15', accuracyRate: 45, reviewCount: 3 },
  { date: '2025-12-22', accuracyRate: 52, reviewCount: 5 },
  { date: '2025-12-29', accuracyRate: 61, reviewCount: 8 },
  { date: '2026-01-05', accuracyRate: 72, reviewCount: 15 },
  { date: '2026-01-11', accuracyRate: 81, reviewCount: 16 },
];

export function QAAccuracyDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [metrics] = useState<QAMetrics>(SAMPLE_METRICS);
  const [deliverableMetrics] = useState<DeliverableTypeMetrics[]>(SAMPLE_DELIVERABLE_METRICS);
  const [learningProgress] = useState<LearningProgress[]>(SAMPLE_LEARNING_PROGRESS);

  const getTrendIcon = (trend: QAMetrics['trend']) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-foreground/60" />;
    }
  };

  const getAutonomyBadge = (recommendation: QAMetrics['autonomyRecommendation']) => {
    const badges = {
      not_ready: { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Not Ready', icon: <XCircle className="w-3 h-3" /> },
      limited: { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: 'Limited Autonomy', icon: <AlertTriangle className="w-3 h-3" /> },
      moderate: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Moderate Autonomy', icon: <Shield className="w-3 h-3" /> },
      high: { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'High Autonomy', icon: <CheckCircle2 className="w-3 h-3" /> },
    };
    const badge = badges[recommendation];
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
        {badge.icon}
        {badge.label}
      </span>
    );
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const getConfidenceBarColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-500" />
            Chief of Staff QA Accuracy
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track learning progress and quality assurance performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(['7d', '30d', '90d', 'all'] as const).map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                selectedPeriod === period
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80 text-muted-foreground'
              }`}
            >
              {period === 'all' ? 'All Time' : period}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Accuracy Rate */}
        <div className="p-4 bg-card border border-border rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Accuracy Rate</span>
            {getTrendIcon(metrics.trend)}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">{metrics.accuracyRate}%</span>
            <span className="text-sm text-green-500">+8.2%</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {metrics.approvedFirstPass} of {metrics.totalReviews} approved first pass
          </p>
        </div>

        {/* Confidence Level */}
        <div className="p-4 bg-card border border-border rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Confidence Level</span>
            <Target className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${getConfidenceColor(metrics.confidenceLevel)}`}>
              {metrics.confidenceLevel}%
            </span>
          </div>
          <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className={`h-full ${getConfidenceBarColor(metrics.confidenceLevel)} transition-all`}
              style={{ width: `${metrics.confidenceLevel}%` }}
            />
          </div>
        </div>

        {/* Average Revisions */}
        <div className="p-4 bg-card border border-border rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Avg. Revisions</span>
            <BarChart3 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">{metrics.averageRevisions}</span>
            <span className="text-sm text-muted-foreground">per document</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {metrics.revisionsRequested} total revisions requested
          </p>
        </div>

        {/* Autonomy Status */}
        <div className="p-4 bg-card border border-border rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Autonomy Status</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-1">
            {getAutonomyBadge(metrics.autonomyRecommendation)}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Reach 85% confidence for moderate autonomy
          </p>
        </div>
      </div>

      {/* Learning Progress Chart */}
      <div className="p-4 bg-card border border-border rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <LineChart className="w-5 h-5 text-primary" />
            Learning Progress Over Time
          </h3>
        </div>
        <div className="h-48 flex items-end gap-2">
          {learningProgress.map((point, index) => (
            <div key={point.date} className="flex-1 flex flex-col items-center gap-2">
              <div className="relative w-full flex flex-col items-center">
                <span className="text-xs text-muted-foreground mb-1">{point.accuracyRate}%</span>
                <div 
                  className="w-full bg-gradient-to-t from-primary to-purple-500 rounded-t transition-all hover:opacity-80"
                  style={{ height: `${point.accuracyRate * 1.5}px` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(point.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Deliverable Type Breakdown */}
      <div className="p-4 bg-card border border-border rounded-xl">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          Performance by Deliverable Type
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-muted-foreground border-b border-border">
                <th className="pb-3 font-medium">Deliverable Type</th>
                <th className="pb-3 font-medium text-center">Reviews</th>
                <th className="pb-3 font-medium text-center">Approval Rate</th>
                <th className="pb-3 font-medium text-center">Avg. Revisions</th>
                <th className="pb-3 font-medium text-center">Confidence</th>
                <th className="pb-3 font-medium">Common Corrections</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {deliverableMetrics
                .sort((a, b) => b.confidenceScore - a.confidenceScore)
                .map(dm => (
                  <tr key={dm.type} className="text-sm">
                    <td className="py-3">
                      <span className="font-medium text-foreground">{dm.displayName}</span>
                    </td>
                    <td className="py-3 text-center text-muted-foreground">{dm.totalReviews}</td>
                    <td className="py-3 text-center">
                      <span className={`font-medium ${
                        dm.approvalRate >= 80 ? 'text-green-500' :
                        dm.approvalRate >= 60 ? 'text-amber-500' :
                        'text-red-500'
                      }`}>
                        {dm.approvalRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 text-center text-muted-foreground">{dm.avgRevisions.toFixed(1)}</td>
                    <td className="py-3">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getConfidenceBarColor(dm.confidenceScore)}`}
                            style={{ width: `${dm.confidenceScore}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${getConfidenceColor(dm.confidenceScore)}`}>
                          {dm.confidenceScore}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1">
                        {dm.commonCorrections.slice(0, 2).map((correction, i) => (
                          <span 
                            key={i}
                            className="text-xs px-2 py-0.5 bg-secondary rounded text-muted-foreground"
                          >
                            {correction}
                          </span>
                        ))}
                        {dm.commonCorrections.length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{dm.commonCorrections.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations */}
      <div className="p-4 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl">
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-500" />
          AI Recommendations
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-card/50 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">NDA documents ready for limited autonomy</p>
              <p className="text-xs text-muted-foreground mt-1">
                With 91.7% approval rate and 85% confidence, the Chief of Staff can handle routine NDA reviews with minimal oversight.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-card/50 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Investment Decks need more training</p>
              <p className="text-xs text-muted-foreground mt-1">
                At 55% confidence, continue providing detailed feedback on market sizing and competitive positioning.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-card/50 rounded-lg">
            <Target className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Focus area: Shareholder Agreements</p>
              <p className="text-xs text-muted-foreground mt-1">
                Lowest confidence at 42%. Provide more examples of vesting terms and drag-along provisions you prefer.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QAAccuracyDashboard;
