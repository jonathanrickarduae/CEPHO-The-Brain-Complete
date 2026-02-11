import { useState, useEffect } from 'react';
import {
  Lightbulb, Calendar, Clock, TrendingUp, AlertCircle,
  ChevronRight, X, Bell, Zap, Target, BarChart3,
  FolderKanban, Users, FileText, Settings, ArrowRight
} from 'lucide-react';

interface Nudge {
  id: string;
  type: 'insight' | 'reminder' | 'suggestion' | 'alert' | 'opportunity';
  priority: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  context?: string;
  actionLabel?: string;
  actionPath?: string;
  dismissable: boolean;
  createdAt: Date;
  expiresAt?: Date;
  source: string;
}

// Nudge display component - subtle card style
function NudgeCard({ nudge, onDismiss, onAction }: { 
  nudge: Nudge; 
  onDismiss: () => void;
  onAction: () => void;
}) {
  const typeConfig = {
    insight: { icon: Lightbulb, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
    reminder: { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    suggestion: { icon: Target, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    alert: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    opportunity: { icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  };

  const config = typeConfig[nudge.type];
  const Icon = config.icon;

  return (
    <div className={`${config.bg} ${config.border} border rounded-xl p-4 transition-all hover:scale-[1.01]`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-foreground text-sm">{nudge.title}</h4>
            {nudge.dismissable && (
              <button 
                onClick={onDismiss}
                className="p-1 hover:bg-gray-700 rounded transition-colors flex-shrink-0"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{nudge.message}</p>
          {nudge.context && (
            <p className="text-xs text-muted-foreground/70 mt-1 italic">{nudge.context}</p>
          )}
          {nudge.actionLabel && (
            <button 
              onClick={onAction}
              className={`mt-3 text-xs ${config.color} hover:underline flex items-center gap-1`}
            >
              {nudge.actionLabel}
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Insights panel for Dashboard
export function InsightsPanel() {
  const [nudges, setNudges] = useState<Nudge[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    // Generate contextual nudges based on user activity
    const generatedNudges: Nudge[] = [
      {
        id: 'n1',
        type: 'reminder',
        priority: 'medium',
        title: 'Board meeting tomorrow 10:00',
        message: 'Briefing notes can be prepared. Action required.',
        context: 'Calendar',
        actionLabel: 'Prepare briefing',
        actionPath: '/digital-twin',
        dismissable: true,
        createdAt: new Date(),
        source: 'calendar'
      },
      {
        id: 'n2',
        type: 'insight',
        priority: 'low',
        title: 'Celadon: No updates for 3 days',
        message: 'Last activity: task completion by Sarah. Review recommended.',
        context: 'Asana',
        actionLabel: 'View project',
        actionPath: '/workflow',
        dismissable: true,
        createdAt: new Date(Date.now() - 3600000),
        source: 'asana'
      },
      {
        id: 'n3',
        type: 'suggestion',
        priority: 'low',
        title: 'Zoom: 28% feature utilisation',
        message: 'AI meeting summaries not enabled. Potential time saving available.',
        context: 'Usage analysis',
        actionLabel: 'View integrations',
        actionPath: '/settings',
        dismissable: true,
        createdAt: new Date(Date.now() - 7200000),
        source: 'integration-monitor'
      },
      {
        id: 'n4',
        type: 'opportunity',
        priority: 'medium',
        title: 'Chief of Staff: 67% confidence',
        message: '15-minute training session available. Improves accuracy.',
        actionLabel: 'Start training',
        actionPath: '/digital-twin',
        dismissable: true,
        createdAt: new Date(Date.now() - 14400000),
        source: 'digital-twin'
      }
    ];

    setNudges(generatedNudges);
  }, []);

  const dismissNudge = (id: string) => {
    setNudges(nudges.filter(n => n.id !== id));
    // Save dismissed nudge to localStorage to prevent re-showing
    const dismissed = JSON.parse(localStorage.getItem('dismissed_nudges') || '[]');
    dismissed.push({ id, dismissedAt: new Date().toISOString() });
    localStorage.setItem('dismissed_nudges', JSON.stringify(dismissed));
  };

  const handleAction = (nudge: Nudge) => {
    if (nudge.actionPath) {
      window.location.href = nudge.actionPath;
    }
  };

  if (nudges.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-yellow-400" />
          <span className="font-medium text-foreground text-sm">Insights</span>
          <span className="text-xs px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full">
            {nudges.length}
          </span>
        </div>
        <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {nudges.slice(0, 4).map(nudge => (
            <NudgeCard
              key={nudge.id}
              nudge={nudge}
              onDismiss={() => dismissNudge(nudge.id)}
              onAction={() => handleAction(nudge)}
            />
          ))}
          {nudges.length > 4 && (
            <button className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              View all {nudges.length} insights
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Inline nudge for specific contexts (e.g., in Chief of Staff page)
export function InlineNudge({ 
  type, 
  message, 
  actionLabel,
  onAction,
  onDismiss 
}: {
  type: Nudge['type'];
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
}) {
  const typeConfig = {
    insight: { icon: Lightbulb, color: 'text-yellow-400', bg: 'bg-yellow-500/5', border: 'border-yellow-500/20' },
    reminder: { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/5', border: 'border-blue-500/20' },
    suggestion: { icon: Target, color: 'text-purple-400', bg: 'bg-purple-500/5', border: 'border-purple-500/20' },
    alert: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/5', border: 'border-red-500/20' },
    opportunity: { icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/5', border: 'border-green-500/20' },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className={`${config.bg} ${config.border} border rounded-lg px-3 py-2 flex items-center gap-2`}>
      <Icon className={`w-4 h-4 ${config.color} flex-shrink-0`} />
      <span className="text-sm text-muted-foreground flex-1">{message}</span>
      {actionLabel && onAction && (
        <button 
          onClick={onAction}
          className={`text-xs ${config.color} hover:underline whitespace-nowrap`}
        >
          {actionLabel}
        </button>
      )}
      {onDismiss && (
        <button onClick={onDismiss} className="p-1 hover:bg-gray-700 rounded">
          <X className="w-3 h-3 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}

// Nudge engine - generates contextual nudges
export function useNudgeEngine() {
  const [nudges, setNudges] = useState<Nudge[]>([]);

  const generateNudge = (data: Partial<Nudge>) => {
    const newNudge: Nudge = {
      id: `nudge-${Date.now()}`,
      type: 'insight',
      priority: 'low',
      title: '',
      message: '',
      dismissable: true,
      createdAt: new Date(),
      source: 'system',
      ...data,
    } as Nudge;

    setNudges(prev => [newNudge, ...prev]);
    return newNudge;
  };

  const dismissNudge = (id: string) => {
    setNudges(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNudges([]);
  };

  // Check for stale projects
  const checkProjectStaleness = (projects: { name: string; lastUpdated: Date }[]) => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    
    projects.forEach(project => {
      if (project.lastUpdated < threeDaysAgo) {
        const daysSinceUpdate = Math.floor((Date.now() - project.lastUpdated.getTime()) / (24 * 60 * 60 * 1000));
        generateNudge({
          type: 'insight',
          priority: 'medium',
          title: 'Project activity',
          message: `${project.name} hasn't been updated in ${daysSinceUpdate} days.`,
          actionLabel: 'View project',
          actionPath: '/workflow',
          source: 'project-monitor'
        });
      }
    });
  };

  // Check calendar for upcoming events
  const checkUpcomingEvents = (events: { title: string; time: Date }[]) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    events.forEach(event => {
      if (event.time >= tomorrow && event.time < dayAfter) {
        generateNudge({
          type: 'reminder',
          priority: 'medium',
          title: 'Prepare for tomorrow',
          message: `You have "${event.title}" scheduled. Would you like to prepare?`,
          context: 'Based on your calendar',
          actionLabel: 'Prepare briefing',
          actionPath: '/digital-twin',
          source: 'calendar'
        });
      }
    });
  };

  return {
    nudges,
    generateNudge,
    dismissNudge,
    clearAll,
    checkProjectStaleness,
    checkUpcomingEvents
  };
}

// Notification preferences for nudges
export function NudgePreferences() {
  const [preferences, setPreferences] = useState({
    projectUpdates: true,
    calendarReminders: true,
    integrationInsights: true,
    trainingOpportunities: true,
    frequency: 'balanced' as 'minimal' | 'balanced' | 'all',
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-foreground mb-4">Insight Preferences</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Control what types of insights and suggestions you receive.
        </p>
      </div>

      <div className="space-y-4">
        {[
          { key: 'projectUpdates', label: 'Project Updates', desc: 'Notifications about stale or blocked projects' },
          { key: 'calendarReminders', label: 'Calendar Reminders', desc: 'Preparation suggestions for upcoming events' },
          { key: 'integrationInsights', label: 'Integration Insights', desc: 'Tips for using your connected tools better' },
          { key: 'trainingOpportunities', label: 'Training Opportunities', desc: 'Suggestions to improve your Chief of Staff' },
        ].map(item => (
          <div key={item.key} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
            <div>
              <h4 className="font-medium text-foreground">{item.label}</h4>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
            <button
              onClick={() => setPreferences(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
              className={`w-12 h-6 rounded-full transition-colors ${
                preferences[item.key as keyof typeof preferences] ? 'bg-primary' : 'bg-gray-600'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                preferences[item.key as keyof typeof preferences] ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-border">
        <h4 className="font-medium text-foreground mb-3">Frequency</h4>
        <div className="flex gap-2">
          {[
            { value: 'minimal', label: 'Minimal', desc: 'Only important alerts' },
            { value: 'balanced', label: 'Balanced', desc: 'Recommended' },
            { value: 'all', label: 'All', desc: 'Everything' },
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setPreferences(prev => ({ ...prev, frequency: option.value as any }))}
              className={`flex-1 p-3 rounded-xl border transition-colors ${
                preferences.frequency === option.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-gray-600'
              }`}
            >
              <div className="font-medium text-foreground text-sm">{option.label}</div>
              <div className="text-xs text-muted-foreground">{option.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
