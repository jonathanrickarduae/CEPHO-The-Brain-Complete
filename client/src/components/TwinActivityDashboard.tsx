import { useState } from 'react';
import { Brain, BarChart3, Mail, FileText, Calendar, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Chief of Staff Activity Dashboard
 * Shows what your Chief of Staff has been working on
 * Inspired by Amporah's activity dashboard
 */

type TimeFilter = 'today' | 'week' | 'month' | 'all';

interface Activity {
  id: string;
  type: 'email' | 'document' | 'meeting' | 'task' | 'research';
  title: string;
  timestamp: string;
  status: 'completed' | 'in_progress' | 'pending';
}

const MOCK_ACTIVITIES: Activity[] = [
  { id: '1', type: 'email', title: 'Drafted response to investor inquiry', timestamp: '2 hours ago', status: 'completed' },
  { id: '2', type: 'document', title: 'Updated Q1 financial projections', timestamp: '4 hours ago', status: 'completed' },
  { id: '3', type: 'research', title: 'Competitor analysis for pitch deck', timestamp: '6 hours ago', status: 'completed' },
  { id: '4', type: 'meeting', title: 'Prepared briefing for board call', timestamp: 'Yesterday', status: 'completed' },
  { id: '5', type: 'task', title: 'Reviewing contract amendments', timestamp: 'Now', status: 'in_progress' },
];

const TYPE_ICONS = {
  email: Mail,
  document: FileText,
  meeting: Calendar,
  task: CheckCircle,
  research: Brain,
};

export function TwinActivityDashboard() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');
  const [viewMode, setViewMode] = useState<'brain' | 'chart'>('brain');

  return (
    <div className="bg-card/50 rounded-xl border border-border/50 p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">Good evening</p>
          <p className="font-semibold text-foreground">Here's what your Chief of Staff has been working on</p>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-2 mb-4">
        <Button
          size="sm"
          variant={viewMode === 'brain' ? 'default' : 'ghost'}
          className="h-8 w-8 p-0"
          onClick={() => setViewMode('brain')}
        >
          <Brain className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant={viewMode === 'chart' ? 'default' : 'ghost'}
          className="h-8 w-8 p-0"
          onClick={() => setViewMode('chart')}
        >
          <BarChart3 className="w-4 h-4" />
        </Button>
      </div>

      {/* Time Filters */}
      <div className="flex gap-1 mb-4 overflow-x-auto">
        {(['today', 'week', 'month', 'all'] as TimeFilter[]).map((filter) => (
          <Button
            key={filter}
            size="sm"
            variant={timeFilter === filter ? 'default' : 'outline'}
            className="text-xs capitalize"
            onClick={() => setTimeFilter(filter)}
          >
            {filter === 'week' ? 'This Week' : filter === 'month' ? 'This Month' : filter === 'all' ? 'All Time' : 'Today'}
          </Button>
        ))}
      </div>

      {/* Activity List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {MOCK_ACTIVITIES.map((activity) => {
          const Icon = TYPE_ICONS[activity.type];
          return (
            <div 
              key={activity.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                activity.status === 'in_progress' ? 'bg-amber-500/20 text-amber-500' : 'bg-green-500/20 text-green-500'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{activity.title}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{activity.timestamp}</span>
                  {activity.status === 'in_progress' && (
                    <span className="text-amber-500">• In progress</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border/50">
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">12</p>
          <p className="text-xs text-muted-foreground">Tasks Done</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">3.5h</p>
          <p className="text-xs text-muted-foreground">Time Saved</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">94%</p>
          <p className="text-xs text-muted-foreground">Accuracy</p>
        </div>
      </div>
    </div>
  );
}
