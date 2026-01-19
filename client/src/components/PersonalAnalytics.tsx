import { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Clock, 
  Target, 
  Zap,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalyticsData {
  productivityScore: number;
  productivityTrend: 'up' | 'down' | 'stable';
  twinTrainingHours: number;
  decisionsThisWeek: number;
  tasksCompleted: number;
  avgResponseTime: string;
  topExpertUsed: string;
  moodAverage: number;
  streakDays: number;
}

interface PersonalAnalyticsProps {
  data?: AnalyticsData;
  className?: string;
  variant?: 'full' | 'compact' | 'mini';
}

// Mock data for demonstration
const MOCK_DATA: AnalyticsData = {
  productivityScore: 87,
  productivityTrend: 'up',
  twinTrainingHours: 12.5,
  decisionsThisWeek: 34,
  tasksCompleted: 156,
  avgResponseTime: '2.3 min',
  topExpertUsed: 'Strategy Consultant',
  moodAverage: 7.2,
  streakDays: 14,
};

// Mini stat card
function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  trend,
  color = 'text-primary',
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'stable';
  color?: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-card/60 border border-white/10">
      <div className="flex items-center justify-between mb-2">
        <Icon className={cn('w-5 h-5', color)} />
        {trend && (
          <div className={cn(
            'flex items-center gap-1 text-xs',
            trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-muted-foreground'
          )}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : 
             trend === 'down' ? <TrendingDown className="w-3 h-3" /> : null}
            {trend === 'up' ? '+12%' : trend === 'down' ? '-5%' : ''}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      {subValue && <p className="text-xs text-primary mt-1">{subValue}</p>}
    </div>
  );
}

// Full analytics dashboard
export function PersonalAnalytics({
  data = MOCK_DATA,
  className,
  variant = 'full',
}: PersonalAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  if (variant === 'mini') {
    return (
      <div className={cn('flex items-center gap-4', className)}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{data.productivityScore}</p>
            <p className="text-xs text-muted-foreground">Productivity</p>
          </div>
        </div>
        <div className="h-8 w-px bg-border" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
            <Brain className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{data.twinTrainingHours}h</p>
            <p className="text-xs text-muted-foreground">Twin Training</p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-3', className)}>
        <StatCard
          icon={Zap}
          label="Productivity Score"
          value={data.productivityScore}
          trend={data.productivityTrend}
          color="text-primary"
        />
        <StatCard
          icon={Brain}
          label="Twin Training"
          value={`${data.twinTrainingHours}h`}
          color="text-cyan-400"
        />
        <StatCard
          icon={Target}
          label="Decisions"
          value={data.decisionsThisWeek}
          subValue="this week"
          color="text-purple-400"
        />
        <StatCard
          icon={Activity}
          label="Tasks Done"
          value={data.tasksCompleted}
          color="text-green-400"
        />
      </div>
    );
  }

  // Full variant
  return (
    <div className={cn('bg-card/60 backdrop-blur-xl border border-white/10 rounded-xl', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold">Personal Analytics</h3>
        </div>
        <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
          {(['week', 'month', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                timeRange === range
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Zap}
            label="Productivity Score"
            value={data.productivityScore}
            trend={data.productivityTrend}
            color="text-primary"
          />
          <StatCard
            icon={Brain}
            label="Twin Training"
            value={`${data.twinTrainingHours}h`}
            subValue="Total hours"
            color="text-cyan-400"
          />
          <StatCard
            icon={Target}
            label="Decisions Made"
            value={data.decisionsThisWeek}
            subValue="this week"
            color="text-purple-400"
          />
          <StatCard
            icon={Activity}
            label="Tasks Completed"
            value={data.tasksCompleted}
            trend="up"
            color="text-green-400"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg bg-secondary/30">
            <p className="text-xs text-muted-foreground mb-1">Avg Response Time</p>
            <p className="text-lg font-bold text-foreground">{data.avgResponseTime}</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/30">
            <p className="text-xs text-muted-foreground mb-1">Top Expert Used</p>
            <p className="text-lg font-bold text-foreground truncate">{data.topExpertUsed}</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/30">
            <p className="text-xs text-muted-foreground mb-1">Mood Average</p>
            <p className="text-lg font-bold text-foreground">{data.moodAverage}/100</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/30">
            <p className="text-xs text-muted-foreground mb-1">Active Streak</p>
            <p className="text-lg font-bold text-foreground">{data.streakDays} days</p>
          </div>
        </div>
      </div>

      {/* Mood Timeline (simplified visualization) */}
      <div className="p-4 border-t border-white/10">
        <p className="text-xs text-muted-foreground mb-3">Mood This Week</p>
        <div className="flex items-end gap-2 h-16">
          {[70, 80, 60, 70, 90, 80, 70].map((mood, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div 
                className="w-full rounded-t bg-primary/60 transition-all"
                style={{ height: `${mood}%` }}
              />
              <span className="text-[10px] text-muted-foreground">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Productivity ring component
export function ProductivityRing({
  score,
  size = 'md',
  className,
}: {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeConfig = {
    sm: { width: 60, stroke: 4, fontSize: 'text-sm' },
    md: { width: 100, stroke: 6, fontSize: 'text-xl' },
    lg: { width: 140, stroke: 8, fontSize: 'text-3xl' },
  };

  const config = sizeConfig[size];
  const radius = (config.width - config.stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={config.width} height={config.width} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={config.width / 2}
          cy={config.width / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.stroke}
          className="text-secondary"
        />
        {/* Progress circle */}
        <circle
          cx={config.width / 2}
          cy={config.width / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn('font-bold text-foreground', config.fontSize)}>{score}</span>
      </div>
    </div>
  );
}
