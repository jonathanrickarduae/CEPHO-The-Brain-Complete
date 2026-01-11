import { useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { TrendingUp, TrendingDown, Minus, Sun, Cloud, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MoodTimelineProps {
  days?: number;
  className?: string;
}

const MOOD_COLORS = {
  1: 'bg-red-500',
  2: 'bg-red-400',
  3: 'bg-orange-500',
  4: 'bg-orange-400',
  5: 'bg-yellow-500',
  6: 'bg-yellow-400',
  7: 'bg-lime-500',
  8: 'bg-green-400',
  9: 'bg-green-500',
  10: 'bg-emerald-500',
};

const MOOD_EMOJIS = ['😢', '😔', '😟', '😕', '😐', '🙂', '😊', '😄', '😁', '🤩'];

export function MoodTimeline({ days = 7, className }: MoodTimelineProps) {
  const { data: history, isLoading } = trpc.mood.history.useQuery(
    { days, limit: 100 },
    { staleTime: 1000 * 60 * 5 }
  );

  const { data: trends } = trpc.mood.trends.useQuery(
    { days },
    { staleTime: 1000 * 60 * 5 }
  );

  // Group mood entries by date
  const groupedByDate = useMemo(() => {
    if (!history) return [];
    
    const groups: Record<string, typeof history> = {};
    history.forEach(entry => {
      const date = new Date(entry.createdAt).toLocaleDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(entry);
    });
    
    return Object.entries(groups)
      .map(([date, entries]) => ({
        date,
        entries,
        average: entries.reduce((sum, e) => sum + e.score, 0) / entries.length,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [history]);

  if (isLoading) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="h-32 bg-secondary/50 rounded-xl" />
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className={cn('text-center py-8 text-muted-foreground', className)}>
        <p>No mood data yet. Start tracking your mood to see trends!</p>
      </div>
    );
  }

  const TrendIcon = trends?.trend === 'improving' ? TrendingUp 
    : trends?.trend === 'declining' ? TrendingDown 
    : Minus;

  const trendColor = trends?.trend === 'improving' ? 'text-green-400' 
    : trends?.trend === 'declining' ? 'text-red-400' 
    : 'text-yellow-400';

  return (
    <div className={cn('space-y-6', className)}>
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card/60 border border-white/10 rounded-xl p-4 text-center">
          <div className="text-3xl mb-1">{MOOD_EMOJIS[Math.round((trends?.averageScore || 5) - 1)]}</div>
          <div className="text-2xl font-bold text-foreground">{trends?.averageScore?.toFixed(1) || '-'}</div>
          <div className="text-xs text-muted-foreground">Average</div>
        </div>
        
        <div className="bg-card/60 border border-white/10 rounded-xl p-4 text-center">
          <TrendIcon className={cn('w-8 h-8 mx-auto mb-1', trendColor)} />
          <div className="text-sm font-medium text-foreground capitalize">{trends?.trend || 'Stable'}</div>
          <div className="text-xs text-muted-foreground">Trend</div>
        </div>
        
        <div className="bg-card/60 border border-white/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-foreground mb-1">{trends?.totalEntries || 0}</div>
          <div className="text-xs text-muted-foreground">Check-ins</div>
        </div>
      </div>

      {/* Time of Day Breakdown */}
      {trends?.moodByTimeOfDay && (
        <div className="bg-card/60 border border-white/10 rounded-xl p-4">
          <h4 className="text-sm font-medium text-foreground mb-4">Mood by Time of Day</h4>
          <div className="grid grid-cols-3 gap-4">
            {[
              { key: 'morning', label: 'Morning', icon: Sun, color: 'text-amber-400' },
              { key: 'afternoon', label: 'Afternoon', icon: Cloud, color: 'text-blue-400' },
              { key: 'evening', label: 'Evening', icon: Moon, color: 'text-purple-400' },
            ].map(({ key, label, icon: Icon, color }) => {
              const score = trends.moodByTimeOfDay[key] || 0;
              return (
                <div key={key} className="text-center">
                  <Icon className={cn('w-5 h-5 mx-auto mb-2', color)} />
                  <div className="text-lg font-bold text-foreground">
                    {score > 0 ? score.toFixed(1) : '-'}
                  </div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Timeline Chart */}
      <div className="bg-card/60 border border-white/10 rounded-xl p-4">
        <h4 className="text-sm font-medium text-foreground mb-4">Daily Mood Timeline</h4>
        
        {/* Bar Chart */}
        <div className="flex items-end gap-2 h-32">
          {groupedByDate.slice(-7).map((day, i) => {
            const height = (day.average / 10) * 100;
            const colorClass = MOOD_COLORS[Math.round(day.average) as keyof typeof MOOD_COLORS] || 'bg-gray-500';
            
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className={cn('w-full rounded-t-lg transition-all', colorClass)}
                  style={{ height: `${height}%` }}
                  title={`${day.date}: ${day.average.toFixed(1)}`}
                />
                <span className="text-[10px] text-muted-foreground">
                  {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Scale */}
        <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
          <span>1</span>
          <span>5</span>
          <span>10</span>
        </div>
      </div>

      {/* Recent Entries */}
      <div className="bg-card/60 border border-white/10 rounded-xl p-4">
        <h4 className="text-sm font-medium text-foreground mb-4">Recent Check-ins</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {history.slice(0, 10).map((entry) => {
            const colorClass = MOOD_COLORS[entry.score as keyof typeof MOOD_COLORS] || 'bg-gray-500';
            const TimeIcon = entry.timeOfDay === 'morning' ? Sun 
              : entry.timeOfDay === 'afternoon' ? Cloud 
              : Moon;
            
            return (
              <div 
                key={entry.id} 
                className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30"
              >
                <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold', colorClass)}>
                  {entry.score}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <TimeIcon className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground capitalize">{entry.timeOfDay}</span>
                  </div>
                  {entry.note && (
                    <p className="text-xs text-foreground/80 truncate">{entry.note}</p>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Compact version for dashboard
export function MoodTimelineCompact({ className }: { className?: string }) {
  const { data: trends } = trpc.mood.trends.useQuery(
    { days: 7 },
    { staleTime: 1000 * 60 * 5 }
  );

  if (!trends || trends.totalEntries === 0) {
    return null;
  }

  const TrendIcon = trends.trend === 'improving' ? TrendingUp 
    : trends.trend === 'declining' ? TrendingDown 
    : Minus;

  const trendColor = trends.trend === 'improving' ? 'text-green-400' 
    : trends.trend === 'declining' ? 'text-red-400' 
    : 'text-yellow-400';

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="text-2xl">{MOOD_EMOJIS[Math.round(trends.averageScore - 1)]}</div>
      <div>
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium text-foreground">{trends.averageScore.toFixed(1)}</span>
          <TrendIcon className={cn('w-3 h-3', trendColor)} />
        </div>
        <span className="text-xs text-muted-foreground">{trends.totalEntries} check-ins</span>
      </div>
    </div>
  );
}
