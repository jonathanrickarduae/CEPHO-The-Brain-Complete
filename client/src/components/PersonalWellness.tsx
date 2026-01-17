import { useState } from 'react';
import { Heart, Brain, Wallet, TrendingUp, TrendingDown, Minus, Moon, Dumbbell, Apple, Battery, Target, Sparkles, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Personal Wellness Module
 * Health / Mental / Wealth tracking as a holistic personal dashboard
 */

// Types
interface PillarScore {
  current: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

interface WellnessData {
  health: PillarScore;
  mental: PillarScore;
  wealth: PillarScore;
  overallScore: number;
}

// Mock data - would come from API
const MOCK_WELLNESS_DATA: WellnessData = {
  health: { current: 7.2, trend: 'up', change: 0.5 },
  mental: { current: 6.8, trend: 'stable', change: 0.1 },
  wealth: { current: 8.1, trend: 'up', change: 0.8 },
  overallScore: 7.4,
};

// Health metrics
interface HealthMetric {
  id: string;
  label: string;
  value: string;
  icon: React.ElementType;
  status: 'good' | 'warning' | 'alert';
}

const HEALTH_METRICS: HealthMetric[] = [
  { id: 'sleep', label: 'Sleep', value: '7.2 hrs', icon: Moon, status: 'good' },
  { id: 'exercise', label: 'Exercise', value: '3/5 days', icon: Dumbbell, status: 'warning' },
  { id: 'nutrition', label: 'Nutrition', value: 'On track', icon: Apple, status: 'good' },
  { id: 'energy', label: 'Energy', value: 'High', icon: Battery, status: 'good' },
];

// Mental metrics
const MENTAL_METRICS: HealthMetric[] = [
  { id: 'mood', label: 'Mood', value: '70/100', icon: Heart, status: 'good' },
  { id: 'stress', label: 'Stress', value: 'Moderate', icon: AlertTriangle, status: 'warning' },
  { id: 'balance', label: 'Work-Life', value: '60/100', icon: Target, status: 'warning' },
  { id: 'focus', label: 'Focus', value: 'Sharp', icon: Brain, status: 'good' },
];

// Wealth metrics
const WEALTH_METRICS: HealthMetric[] = [
  { id: 'networth', label: 'Net Worth', value: '+2.3%', icon: TrendingUp, status: 'good' },
  { id: 'savings', label: 'Savings Rate', value: '28%', icon: Wallet, status: 'good' },
  { id: 'investments', label: 'Portfolio', value: '+5.1%', icon: TrendingUp, status: 'good' },
  { id: 'goals', label: 'Goals', value: '3/5 on track', icon: Target, status: 'warning' },
];

// Trend Icon Component
function TrendIcon({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
  if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
}

// Status Color
function getStatusColor(status: 'good' | 'warning' | 'alert') {
  if (status === 'good') return 'text-green-500 bg-green-500/10';
  if (status === 'warning') return 'text-amber-500 bg-amber-500/10';
  return 'text-red-500 bg-red-500/10';
}

// Score Ring Component
function ScoreRing({ score, size = 'md', label }: { score: number; size?: 'sm' | 'md' | 'lg'; label?: string }) {
  const percentage = score; // Score is already 0-100
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const getScoreColor = (s: number) => {
    if (s >= 80) return '#22c55e'; // green
    if (s >= 60) return '#eab308'; // yellow
    if (s >= 40) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  return (
    <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="50%"
          cy="50%"
          r="45%"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted/20"
        />
        <circle
          cx="50%"
          cy="50%"
          r="45%"
          fill="none"
          stroke={getScoreColor(score)}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-foreground">{score.toFixed(1)}</span>
        {label && <span className="text-xs text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
}

// Pillar Card Component
interface PillarCardProps {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  score: PillarScore;
  metrics: HealthMetric[];
  onExpand?: () => void;
}

function PillarCard({ title, icon: Icon, iconColor, iconBg, score, metrics, onExpand }: PillarCardProps) {
  return (
    <div className="bg-card/50 rounded-xl border border-border/50 p-4 hover:border-primary/30 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${iconBg} rounded-full flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{title}</h4>
            <div className="flex items-center gap-1 text-xs">
              <TrendIcon trend={score.trend} />
              <span className={score.trend === 'up' ? 'text-green-500' : score.trend === 'down' ? 'text-red-500' : 'text-muted-foreground'}>
                {score.change > 0 ? '+' : ''}{score.change.toFixed(1)} this week
              </span>
            </div>
          </div>
        </div>
        <ScoreRing score={score.current} size="sm" />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-2">
        {metrics.map((metric) => {
          const MetricIcon = metric.icon;
          return (
            <div 
              key={metric.id}
              className={`p-2 rounded-lg ${getStatusColor(metric.status)} flex items-center gap-2`}
            >
              <MetricIcon className="w-4 h-4" />
              <div className="min-w-0">
                <p className="text-xs opacity-70 truncate">{metric.label}</p>
                <p className="text-sm font-medium truncate">{metric.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expand Button */}
      {onExpand && (
        <Button variant="ghost" size="sm" className="w-full mt-3 text-xs" onClick={onExpand}>
          View Details
        </Button>
      )}
    </div>
  );
}

// AI Recommendation Component
interface AIRecommendation {
  id: string;
  pillar: 'health' | 'mental' | 'wealth';
  message: string;
  action?: string;
}

const AI_RECOMMENDATIONS: AIRecommendation[] = [
  {
    id: '1',
    pillar: 'mental',
    message: "You've had 3 high-stress days this week. Consider blocking 2 hours for deep work tomorrow.",
    action: 'Block Time'
  },
  {
    id: '2',
    pillar: 'health',
    message: "Your sleep has improved! Keep the 10:30 PM bedtime routine going.",
  },
  {
    id: '3',
    pillar: 'wealth',
    message: "Your savings rate is above target. Consider increasing investment contributions.",
    action: 'Review Portfolio'
  },
];

// Main Personal Wellness Dashboard
export function PersonalWellnessDashboard() {
  const [data] = useState<WellnessData>(MOCK_WELLNESS_DATA);
  const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'mental' | 'wealth'>('overview');

  return (
    <div className="space-y-6">
      {/* Header with Overall Score */}
      <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-2xl p-6 border border-primary/20">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Overall Score */}
          <div className="text-center">
            <ScoreRing score={data.overallScore} size="lg" label="Overall" />
            <p className="mt-2 text-sm text-muted-foreground">Your Wellness Score</p>
          </div>

          {/* Pillar Summary */}
          <div className="flex-1 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Heart className="w-4 h-4 text-rose-500" />
                <span className="text-sm font-medium">Health</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{data.health.current}</p>
              <div className="flex items-center justify-center gap-1">
                <TrendIcon trend={data.health.trend} />
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Brain className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium">Mental</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{data.mental.current}</p>
              <div className="flex items-center justify-center gap-1">
                <TrendIcon trend={data.mental.trend} />
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Wallet className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium">Wealth</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{data.wealth.current}</p>
              <div className="flex items-center justify-center gap-1">
                <TrendIcon trend={data.wealth.trend} />
              </div>
            </div>
          </div>

          {/* Goal */}
          <div className="text-center md:text-right">
            <p className="text-sm text-muted-foreground mb-1">Getting you to a</p>
            <p className="text-4xl font-bold text-primary">10</p>
            <p className="text-xs text-muted-foreground">
              {(10 - data.overallScore).toFixed(1)} points to go
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['overview', 'health', 'mental', 'wealth'] as const).map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab(tab)}
            className="capitalize"
          >
            {tab}
          </Button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PillarCard
            title="Health"
            icon={Heart}
            iconColor="text-rose-500"
            iconBg="bg-rose-100 dark:bg-rose-950"
            score={data.health}
            metrics={HEALTH_METRICS}
          />
          <PillarCard
            title="Mental"
            icon={Brain}
            iconColor="text-purple-500"
            iconBg="bg-purple-100 dark:bg-purple-950"
            score={data.mental}
            metrics={MENTAL_METRICS}
          />
          <PillarCard
            title="Wealth"
            icon={Wallet}
            iconColor="text-emerald-500"
            iconBg="bg-emerald-100 dark:bg-emerald-950"
            score={data.wealth}
            metrics={WEALTH_METRICS}
          />
        </div>
      )}

      {/* AI Recommendations */}
      <div className="bg-card/50 rounded-xl border border-border/50 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">AI Recommendations</h3>
        </div>
        <div className="space-y-3">
          {AI_RECOMMENDATIONS.map((rec) => {
            const pillarIcon = rec.pillar === 'health' ? Heart : rec.pillar === 'mental' ? Brain : Wallet;
            const pillarColor = rec.pillar === 'health' ? 'text-rose-500' : rec.pillar === 'mental' ? 'text-purple-500' : 'text-emerald-500';
            const PillarIcon = pillarIcon;
            
            return (
              <div key={rec.id} className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
                <PillarIcon className={`w-5 h-5 ${pillarColor} mt-0.5 flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{rec.message}</p>
                </div>
                {rec.action && (
                  <Button size="sm" variant="outline" className="flex-shrink-0">
                    {rec.action}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Compact Wellness Widget for Dashboard
export function WellnessWidget() {
  const [data] = useState<WellnessData>(MOCK_WELLNESS_DATA);

  return (
    <div className="bg-card/50 rounded-xl border border-border/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-foreground">Personal Wellness</h4>
        <span className="text-xs text-muted-foreground">Today</span>
      </div>
      
      <div className="flex items-center gap-4">
        <ScoreRing score={data.overallScore} size="sm" />
        
        <div className="flex-1 space-y-2">
          {/* Health */}
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500" />
            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-rose-500 rounded-full transition-all duration-500"
                style={{ width: `${(data.health.current / 10) * 100}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground w-8">{data.health.current}</span>
          </div>
          
          {/* Mental */}
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-500" />
            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${(data.mental.current / 10) * 100}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground w-8">{data.mental.current}</span>
          </div>
          
          {/* Wealth */}
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-500" />
            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${(data.wealth.current / 10) * 100}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground w-8">{data.wealth.current}</span>
          </div>
        </div>
      </div>

      {/* Quick insight */}
      <div className="mt-3 p-2 bg-primary/5 rounded-lg flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
        <p className="text-xs text-muted-foreground">Sleep improved +0.5 hrs this week</p>
      </div>
    </div>
  );
}
