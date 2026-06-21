import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, CheckCircle2, AlertCircle, Loader2, Coffee, 
  ChevronDown, ChevronUp, Brain, Users, FileText
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  progress: number;
  stage: 'queued' | 'researching' | 'drafting' | 'qa_review' | 'complete' | 'blocked';
  estimatedMinutes: number;
  elapsedMinutes: number;
  assignedTo: 'chief_of_staff' | 'ai_sme' | 'expert_team';
  experts?: string[];
  confidence: number; // 0-100 confidence in estimate
}

interface TaskProgressTrackerProps {
  tasks?: Task[];
  onTaskClick?: (taskId: string) => void;
}

const STAGE_CONFIG = {
  queued: { label: 'Queued', color: 'bg-gray-500', icon: Clock },
  researching: { label: 'Researching', color: 'bg-blue-500', icon: Loader2 },
  drafting: { label: 'Drafting', color: 'bg-purple-500', icon: FileText },
  qa_review: { label: 'QA Review', color: 'bg-amber-500', icon: Brain },
  complete: { label: 'Complete', color: 'bg-green-500', icon: CheckCircle2 },
  blocked: { label: 'Blocked', color: 'bg-red-500', icon: AlertCircle },
};

const ASSIGNEE_CONFIG = {
  chief_of_staff: { label: 'Chief of Staff', icon: Brain, color: 'text-fuchsia-400' },
  ai_sme: { label: 'AI-SME', icon: Users, color: 'text-cyan-400' },
  expert_team: { label: 'Expert Team', icon: Users, color: 'text-amber-400' },
};

// Demo tasks for display
const DEMO_TASKS: Task[] = [
  {
    id: '1',
    title: 'Market Analysis Report',
    description: 'Comprehensive analysis of energy-from-waste sector',
    progress: 67,
    stage: 'drafting',
    estimatedMinutes: 25,
    elapsedMinutes: 17,
    assignedTo: 'expert_team',
    experts: ['Energy Analyst', 'Financial Modeler', 'PE Partner'],
    confidence: 85,
  },
  {
    id: '2',
    title: 'Competitor Landscape',
    description: 'Mapping key players and their positioning',
    progress: 34,
    stage: 'researching',
    estimatedMinutes: 15,
    elapsedMinutes: 5,
    assignedTo: 'ai_sme',
    experts: ['Strategy Consultant'],
    confidence: 72,
  },
  {
    id: '3',
    title: 'Email Draft: Board Update',
    description: 'Weekly progress summary for board members',
    progress: 89,
    stage: 'qa_review',
    estimatedMinutes: 8,
    elapsedMinutes: 7,
    assignedTo: 'chief_of_staff',
    confidence: 95,
  },
];

export function TaskProgressTracker({ tasks = DEMO_TASKS, onTaskClick }: TaskProgressTrackerProps) {
  const [expanded, setExpanded] = useState(true);
  const [activeTasks, setActiveTasks] = useState(tasks);

  // Simulate progress updates
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTasks(prev => prev.map(task => {
        if (task.stage === 'complete' || task.stage === 'blocked') return task;
        
        const newProgress = Math.min(task.progress + Math.random() * 2, 100);
        const newElapsed = task.elapsedMinutes + 0.1;
        
        let newStage: Task['stage'] = task.stage;
        if (newProgress >= 100) newStage = 'complete';
        else if (newProgress >= 80) newStage = 'qa_review';
        else if (newProgress >= 40) newStage = 'drafting';
        else if (newProgress >= 10) newStage = 'researching';
        
        return {
          ...task,
          progress: newProgress,
          elapsedMinutes: newElapsed,
          stage: newStage,
        };
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const inProgressTasks = activeTasks.filter(t => t.stage !== 'complete' && t.stage !== 'queued');
  const nextCompletion = inProgressTasks.length > 0 
    ? Math.min(...inProgressTasks.map(t => t.estimatedMinutes - t.elapsedMinutes))
    : 0;

  const totalEstimated = inProgressTasks.reduce((sum, t) => sum + (t.estimatedMinutes - t.elapsedMinutes), 0);

  return (
    <div className="bg-card/50 border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-fuchsia-500/20 to-purple-500/20 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-fuchsia-400 animate-spin" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Active Tasks</h3>
            <p className="text-sm text-foreground/70">
              {inProgressTasks.length} in progress • Next ready in ~{Math.ceil(nextCompletion)} min
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {totalEstimated > 10 && (
            <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg">
              <Coffee className="w-4 h-4" />
              <span>~{Math.ceil(totalEstimated)} min until all complete</span>
            </div>
          )}
          {expanded ? <ChevronUp className="w-5 h-5 text-foreground/70" /> : <ChevronDown className="w-5 h-5 text-foreground/70" />}
        </div>
      </div>

      {/* Task List */}
      {expanded && (
        <div className="border-t border-border">
          {activeTasks.map((task, index) => {
            const StageIcon = STAGE_CONFIG[task.stage].icon;
            const AssigneeIcon = ASSIGNEE_CONFIG[task.assignedTo].icon;
            const remaining = Math.max(0, task.estimatedMinutes - task.elapsedMinutes);

            return (
              <div 
                key={task.id}
                className={`p-4 ${index > 0 ? 'border-t border-border/50' : ''} hover:bg-white/5 cursor-pointer transition-colors`}
                onClick={() => onTaskClick?.(task.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-white">{task.title}</h4>
                      <Badge 
                        variant="outline" 
                        className={`${STAGE_CONFIG[task.stage].color} bg-opacity-20 text-white border-0 text-xs`}
                      >
                        <StageIcon className={`w-3 h-3 mr-1 ${task.stage === 'researching' ? 'animate-spin' : ''}`} />
                        {STAGE_CONFIG[task.stage].label}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground/70">{task.description}</p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-lg font-semibold text-white">
                      {task.stage === 'complete' ? '✓' : `~${Math.ceil(remaining)} min`}
                    </div>
                    <div className="text-xs text-foreground/60">
                      {task.confidence}% confidence
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-foreground/70 mb-1">
                    <span>{Math.round(task.progress)}% complete</span>
                    <span>{Math.round(task.elapsedMinutes)} / {task.estimatedMinutes} min</span>
                  </div>
                  <Progress value={task.progress} className="h-2" />
                </div>

                {/* Assigned To */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AssigneeIcon className={`w-4 h-4 ${ASSIGNEE_CONFIG[task.assignedTo].color}`} />
                    <span className={`text-sm ${ASSIGNEE_CONFIG[task.assignedTo].color}`}>
                      {ASSIGNEE_CONFIG[task.assignedTo].label}
                    </span>
                    {task.experts && task.experts.length > 0 && (
                      <span className="text-xs text-foreground/60">
                        ({task.experts.join(', ')})
                      </span>
                    )}
                  </div>
                  {task.stage !== 'complete' && task.stage !== 'blocked' && (
                    <Button variant="ghost" size="sm" className="text-xs text-foreground/70 hover:text-white">
                      View Details
                    </Button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Chief of Staff Recommendation */}
          {totalEstimated > 5 && (
            <div className="p-4 border-t border-border bg-gradient-to-r from-fuchsia-500/10 to-transparent">
              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-fuchsia-400 mt-0.5" />
                <div>
                  <p className="text-sm text-white font-medium">Chief of Staff Recommendation</p>
                  <p className="text-sm text-foreground/70 mt-1">
                    {totalEstimated > 15 
                      ? `These tasks will take approximately ${Math.ceil(totalEstimated)} minutes. Consider taking a break or reviewing your inbox while I complete them.`
                      : `Next item ready for your review in ~${Math.ceil(nextCompletion)} minutes. I'll notify you when it's ready.`
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TaskProgressTracker;
