import { Calendar, Mail, CheckSquare, AlertCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  action: () => void;
}

interface QuickActionsPanelProps {
  onScheduleMeeting?: () => void;
  onSendEmail?: () => void;
  onCreateTask?: () => void;
  onEscalate?: () => void;
}

export function QuickActionsPanel({
  onScheduleMeeting,
  onSendEmail,
  onCreateTask,
  onEscalate,
}: QuickActionsPanelProps) {
  const [expandedAction, setExpandedAction] = useState<string | null>(null);

  const actions: QuickAction[] = [
    {
      id: 'schedule',
      label: 'Schedule Meeting',
      icon: <Calendar className="w-5 h-5" />,
      description: 'Open calendar with auto-filled time slot',
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30',
      action: onScheduleMeeting || (() => {}),
    },
    {
      id: 'email',
      label: 'Send Email',
      icon: <Mail className="w-5 h-5" />,
      description: 'Draft email with suggested recipients',
      color: 'bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30',
      action: onSendEmail || (() => {}),
    },
    {
      id: 'task',
      label: 'Create Task',
      icon: <CheckSquare className="w-5 h-5" />,
      description: 'Add to task list with suggested priority',
      color: 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30',
      action: onCreateTask || (() => {}),
    },
    {
      id: 'escalate',
      label: 'Escalate Issue',
      icon: <AlertCircle className="w-5 h-5" />,
      description: 'Notify relevant expert immediately',
      color: 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30',
      action: onEscalate || (() => {}),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-sm font-semibold text-foreground">Quick Actions</h3>
        <span className="text-xs text-muted-foreground">({actions.length} available)</span>
      </div>

      {/* Grid of action buttons */}
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => {
              setExpandedAction(expandedAction === action.id ? null : action.id);
              action.action();
            }}
            className={`p-3 rounded-lg border-2 transition-all text-left group ${action.color}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 bg-current/10 rounded-md">
                {action.icon}
              </div>
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xs font-medium">{action.label}</p>
            <p className="text-xs opacity-75 mt-1">{action.description}</p>
          </button>
        ))}
      </div>

      {/* Expanded action details */}
      {expandedAction && (
        <div className="bg-secondary/30 rounded-lg p-4 border border-border animate-in fade-in slide-in-from-top-2">
          {(() => {
            const action = actions.find((a) => a.id === expandedAction);
            if (!action) return null;

            switch (action.id) {
              case 'schedule':
                return (
                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground">Schedule Meeting</h4>
                    <p className="text-sm text-muted-foreground">
                      Calendar will open with a 1-hour slot at your next available time.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Cancel
                      </Button>
                      <Button size="sm">Open Calendar</Button>
                    </div>
                  </div>
                );
              case 'email':
                return (
                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground">Send Email</h4>
                    <p className="text-sm text-muted-foreground">
                      Email draft will be created with suggested recipients based on context.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Cancel
                      </Button>
                      <Button size="sm">Create Draft</Button>
                    </div>
                  </div>
                );
              case 'task':
                return (
                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground">Create Task</h4>
                    <p className="text-sm text-muted-foreground">
                      Task will be added to your list with priority based on urgency.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Cancel
                      </Button>
                      <Button size="sm">Add Task</Button>
                    </div>
                  </div>
                );
              case 'escalate':
                return (
                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground">Escalate Issue</h4>
                    <p className="text-sm text-muted-foreground">
                      This will notify the relevant expert team immediately.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Cancel
                      </Button>
                      <Button size="sm" className="bg-red-500/20 text-red-400 hover:bg-red-500/30">
                        Escalate Now
                      </Button>
                    </div>
                  </div>
                );
              default:
                return null;
            }
          })()}
        </div>
      )}

      {/* Tip */}
      <div className="bg-primary/5 rounded-lg p-3 border border-primary/20 text-xs text-muted-foreground">
        <p>
          <span className="font-medium text-foreground">Tip:</span> These quick actions learn from your patterns and
          adapt over time.
        </p>
      </div>
    </div>
  );
}
