import { useState } from 'react';
import { Brain, Check, X, Plus, Mail, FileText, Calendar, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * Twin Break Approval
 * Chief of Staff proposes what it will do while you take a break
 * You approve, reject, or add tasks
 */

interface ProposedTask {
  id: string;
  icon: React.ElementType;
  task: string;
  approved: boolean;
}

const INITIAL_TASKS: ProposedTask[] = [
  { id: '1', icon: Mail, task: 'Draft response to investor inquiry', approved: true },
  { id: '2', icon: FileText, task: 'Review contract amendments', approved: true },
  { id: '3', icon: Calendar, task: 'Prep notes for your 3pm call', approved: true },
];

export function TwinBreakApproval({ onApprove, onCancel }: { onApprove?: () => void; onCancel?: () => void }) {
  const [tasks, setTasks] = useState<ProposedTask[]>(INITIAL_TASKS);
  const [newTask, setNewTask] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, approved: !t.approved } : t));
  };

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, {
        id: Date.now().toString(),
        icon: Sparkles,
        task: newTask.trim(),
        approved: true,
      }]);
      setNewTask('');
      setShowAddInput(false);
    }
  };

  const approvedCount = tasks.filter(t => t.approved).length;

  return (
    <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-xl border border-primary/20 p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-semibold text-foreground">While you take 15 mins, I'll:</p>
          <p className="text-xs text-muted-foreground">{approvedCount} tasks ready to go</p>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2 mb-4">
        {tasks.map((task) => {
          const Icon = task.icon;
          return (
            <div 
              key={task.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer ${
                task.approved 
                  ? 'bg-green-500/10 border border-green-500/20' 
                  : 'bg-secondary/30 border border-transparent opacity-50'
              }`}
              onClick={() => toggleTask(task.id)}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                task.approved ? 'bg-green-500 text-white' : 'bg-secondary'
              }`}>
                {task.approved ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              </div>
              <Icon className="w-4 h-4 text-muted-foreground" />
              <span className={`text-sm flex-1 ${task.approved ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
                {task.task}
              </span>
            </div>
          );
        })}
      </div>

      {/* Add Task */}
      {showAddInput ? (
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Add a task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            className="flex-1"
            autoFocus
          />
          <Button size="sm" onClick={addTask}>Add</Button>
          <Button size="sm" variant="ghost" onClick={() => setShowAddInput(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mb-4"
          onClick={() => setShowAddInput(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add something else
        </Button>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button 
          className="flex-1" 
          onClick={onApprove}
          disabled={approvedCount === 0}
        >
          <Check className="w-4 h-4 mr-2" />
          Yes, do it
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Not now
        </Button>
      </div>
    </div>
  );
}

// Compact inline version for dashboard
export function TwinBreakPrompt({ onExpand }: { onExpand?: () => void }) {
  return (
    <div 
      className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20 cursor-pointer hover:bg-primary/15 transition-colors"
      onClick={onExpand}
    >
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
        <Brain className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">Take 15 mins?</p>
        <p className="text-xs text-muted-foreground">I have 3 tasks ready while you're away</p>
      </div>
      <Button size="sm">View</Button>
    </div>
  );
}
