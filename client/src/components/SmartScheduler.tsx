import { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, Clock, Zap, AlertTriangle, CheckCircle2, 
  ArrowRight, Brain, Target, Coffee, Moon, Sun,
  RefreshCw, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  duration: number; // minutes
  priority: 'high' | 'medium' | 'low';
  deadline?: Date;
  category: 'work' | 'personal' | 'health' | 'learning';
  scheduledTime?: Date;
  isFlexible: boolean;
}

interface TimeBlock {
  id: string;
  start: Date;
  end: Date;
  type: 'focus' | 'meeting' | 'break' | 'buffer';
  task?: Task;
}

interface SmartSchedulerProps {
  tasks: Task[];
  onScheduleGenerated?: (schedule: TimeBlock[]) => void;
  className?: string;
}

// AI-powered scheduling logic
function generateOptimalSchedule(tasks: Task[], preferences: SchedulePreferences): TimeBlock[] {
  const schedule: TimeBlock[] = [];
  const now = new Date();
  const workStart = new Date(now);
  workStart.setHours(preferences.workStartHour, 0, 0, 0);
  
  // Sort tasks by priority and deadline
  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    if (a.deadline && b.deadline) {
      return a.deadline.getTime() - b.deadline.getTime();
    }
    return 0;
  });

  let currentTime = workStart;
  
  // Add morning routine
  if (preferences.includeMorningRoutine) {
    schedule.push({
      id: 'morning-routine',
      start: new Date(currentTime),
      end: new Date(currentTime.getTime() + 30 * 60000),
      type: 'buffer',
    });
    currentTime = new Date(currentTime.getTime() + 30 * 60000);
  }

  // Schedule high-priority tasks during peak hours
  const peakHourStart = preferences.peakHoursStart;
  const peakHourEnd = preferences.peakHoursEnd;
  
  for (const task of sortedTasks) {
    // Add buffer between tasks
    if (schedule.length > 0 && preferences.addBuffers) {
      schedule.push({
        id: `buffer-${task.id}`,
        start: new Date(currentTime),
        end: new Date(currentTime.getTime() + 10 * 60000),
        type: 'buffer',
      });
      currentTime = new Date(currentTime.getTime() + 10 * 60000);
    }

    // Check if we need a break
    const hoursSinceStart = (currentTime.getTime() - workStart.getTime()) / (60 * 60000);
    if (hoursSinceStart > 0 && hoursSinceStart % 2 < 0.5 && preferences.includeBreaks) {
      schedule.push({
        id: `break-${schedule.length}`,
        start: new Date(currentTime),
        end: new Date(currentTime.getTime() + 15 * 60000),
        type: 'break',
      });
      currentTime = new Date(currentTime.getTime() + 15 * 60000);
    }

    // Schedule the task
    const taskEnd = new Date(currentTime.getTime() + task.duration * 60000);
    schedule.push({
      id: task.id,
      start: new Date(currentTime),
      end: taskEnd,
      type: 'focus',
      task,
    });
    currentTime = taskEnd;
  }

  return schedule;
}

interface SchedulePreferences {
  workStartHour: number;
  workEndHour: number;
  peakHoursStart: number;
  peakHoursEnd: number;
  includeMorningRoutine: boolean;
  includeBreaks: boolean;
  addBuffers: boolean;
  focusBlockDuration: number;
}

const DEFAULT_PREFERENCES: SchedulePreferences = {
  workStartHour: 9,
  workEndHour: 18,
  peakHoursStart: 9,
  peakHoursEnd: 12,
  includeMorningRoutine: true,
  includeBreaks: true,
  addBuffers: true,
  focusBlockDuration: 90,
};

export function SmartScheduler({ tasks, onScheduleGenerated, className }: SmartSchedulerProps) {
  const [schedule, setSchedule] = useState<TimeBlock[]>([]);
  const [preferences, setPreferences] = useState<SchedulePreferences>(DEFAULT_PREFERENCES);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  const generateSchedule = useCallback(() => {
    setIsGenerating(true);
    // Simulate AI processing time
    setTimeout(() => {
      const newSchedule = generateOptimalSchedule(tasks, preferences);
      setSchedule(newSchedule);
      onScheduleGenerated?.(newSchedule);
      setIsGenerating(false);
    }, 1000);
  }, [tasks, preferences, onScheduleGenerated]);

  // Auto-generate on mount
  useEffect(() => {
    if (tasks.length > 0) {
      generateSchedule();
    }
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const getBlockColor = (type: TimeBlock['type']) => {
    switch (type) {
      case 'focus': return 'bg-purple-500/20 border-purple-500/30';
      case 'meeting': return 'bg-blue-500/20 border-blue-500/30';
      case 'break': return 'bg-green-500/20 border-green-500/30';
      case 'buffer': return 'bg-gray-500/20 border-gray-500/30';
    }
  };

  const getBlockIcon = (type: TimeBlock['type']) => {
    switch (type) {
      case 'focus': return <Zap className="w-4 h-4 text-purple-400" />;
      case 'meeting': return <Calendar className="w-4 h-4 text-blue-400" />;
      case 'break': return <Coffee className="w-4 h-4 text-green-400" />;
      case 'buffer': return <Clock className="w-4 h-4 text-foreground/70" />;
    }
  };

  const totalFocusTime = schedule
    .filter(b => b.type === 'focus')
    .reduce((sum, b) => sum + (b.end.getTime() - b.start.getTime()) / 60000, 0);

  const atRiskTasks = tasks.filter(t => {
    if (!t.deadline) return false;
    const scheduledBlock = schedule.find(b => b.task?.id === t.id);
    return scheduledBlock && scheduledBlock.end > t.deadline;
  });

  return (
    <div className={cn('bg-card/60 border border-white/10 rounded-xl overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-cyan-400" />
          <h3 className="font-medium text-foreground">Smart Scheduler</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreferences(!showPreferences)}
            className="text-xs"
          >
            Preferences
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={generateSchedule}
            disabled={isGenerating}
            className="text-xs"
          >
            {isGenerating ? (
              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <Sparkles className="w-3 h-3 mr-1" />
            )}
            Optimize
          </Button>
        </div>
      </div>

      {/* Preferences Panel */}
      {showPreferences && (
        <div className="px-4 py-3 border-b border-white/10 bg-secondary/20 grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Work Hours</label>
            <div className="flex items-center gap-2">
              <select
                value={preferences.workStartHour}
                onChange={(e) => setPreferences(p => ({ ...p, workStartHour: parseInt(e.target.value) }))}
                className="bg-secondary/50 border border-white/10 rounded px-2 py-1 text-xs"
              >
                {Array.from({ length: 12 }, (_, i) => i + 6).map(h => (
                  <option key={h} value={h}>{h}:00</option>
                ))}
              </select>
              <span className="text-muted-foreground">to</span>
              <select
                value={preferences.workEndHour}
                onChange={(e) => setPreferences(p => ({ ...p, workEndHour: parseInt(e.target.value) }))}
                className="bg-secondary/50 border border-white/10 rounded px-2 py-1 text-xs"
              >
                {Array.from({ length: 12 }, (_, i) => i + 12).map(h => (
                  <option key={h} value={h}>{h}:00</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Peak Hours</label>
            <div className="flex items-center gap-2">
              <select
                value={preferences.peakHoursStart}
                onChange={(e) => setPreferences(p => ({ ...p, peakHoursStart: parseInt(e.target.value) }))}
                className="bg-secondary/50 border border-white/10 rounded px-2 py-1 text-xs"
              >
                {Array.from({ length: 12 }, (_, i) => i + 6).map(h => (
                  <option key={h} value={h}>{h}:00</option>
                ))}
              </select>
              <span className="text-muted-foreground">to</span>
              <select
                value={preferences.peakHoursEnd}
                onChange={(e) => setPreferences(p => ({ ...p, peakHoursEnd: parseInt(e.target.value) }))}
                className="bg-secondary/50 border border-white/10 rounded px-2 py-1 text-xs"
              >
                {Array.from({ length: 12 }, (_, i) => i + 12).map(h => (
                  <option key={h} value={h}>{h}:00</option>
                ))}
              </select>
            </div>
          </div>
          <div className="col-span-2 flex flex-wrap gap-3">
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={preferences.includeMorningRoutine}
                onChange={(e) => setPreferences(p => ({ ...p, includeMorningRoutine: e.target.checked }))}
                className="rounded"
              />
              Morning routine
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={preferences.includeBreaks}
                onChange={(e) => setPreferences(p => ({ ...p, includeBreaks: e.target.checked }))}
                className="rounded"
              />
              Include breaks
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={preferences.addBuffers}
                onChange={(e) => setPreferences(p => ({ ...p, addBuffers: e.target.checked }))}
                className="rounded"
              />
              Add buffers
            </label>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-secondary/20 border-b border-white/10">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-purple-400" />
            <span className="text-muted-foreground">{Math.round(totalFocusTime / 60)}h focus time</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="w-3 h-3 text-cyan-400" />
            <span className="text-muted-foreground">{tasks.length} tasks scheduled</span>
          </div>
        </div>
        {atRiskTasks.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-amber-400">
            <AlertTriangle className="w-3 h-3" />
            {atRiskTasks.length} at risk
          </div>
        )}
      </div>

      {/* Schedule Timeline */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {schedule.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No tasks to schedule</p>
            <p className="text-xs">Add tasks to generate an optimized schedule</p>
          </div>
        ) : (
          <div className="space-y-2">
            {schedule.map((block, index) => (
              <div
                key={block.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border transition-colors hover:bg-secondary/30',
                  getBlockColor(block.type)
                )}
              >
                <div className="flex-shrink-0 w-16 text-xs text-muted-foreground">
                  {formatTime(block.start)}
                </div>
                
                <div className="flex-shrink-0">
                  {getBlockIcon(block.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-foreground truncate">
                    {block.task?.title || (block.type === 'break' ? 'Break' : block.type === 'buffer' ? 'Buffer' : 'Time Block')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round((block.end.getTime() - block.start.getTime()) / 60000)} min
                    {block.task?.priority && (
                      <span className={cn(
                        'ml-2 px-1.5 py-0.5 rounded text-[10px]',
                        block.task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                        block.task.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-gray-500/20 text-foreground/70'
                      )}>
                        {block.task.priority}
                      </span>
                    )}
                  </div>
                </div>

                {block.task?.deadline && block.end > block.task.deadline && (
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                )}
                
                {index < schedule.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/10 bg-secondary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sun className="w-3 h-3" />
            <span>Peak: {preferences.peakHoursStart}:00 - {preferences.peakHoursEnd}:00</span>
          </div>
          <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Apply Schedule
          </Button>
        </div>
      </div>
    </div>
  );
}

// Demo tasks for testing
export const DEMO_TASKS: Task[] = [
  { id: '1', title: 'Review quarterly report', duration: 60, priority: 'high', category: 'work', isFlexible: false },
  { id: '2', title: 'Team standup meeting', duration: 30, priority: 'high', category: 'work', isFlexible: false },
  { id: '3', title: 'Email inbox zero', duration: 45, priority: 'medium', category: 'work', isFlexible: true },
  { id: '4', title: 'Project planning session', duration: 90, priority: 'high', category: 'work', isFlexible: false },
  { id: '5', title: 'Exercise', duration: 30, priority: 'medium', category: 'health', isFlexible: true },
  { id: '6', title: 'Read industry news', duration: 20, priority: 'low', category: 'learning', isFlexible: true },
];
