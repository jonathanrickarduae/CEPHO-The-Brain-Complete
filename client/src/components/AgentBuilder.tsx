import { useState, useCallback } from 'react';
import { 
  Bot, Plus, Play, Pause, Settings2, Trash2, 
  CheckCircle2, Clock, AlertTriangle, Zap, Mail,
  Calendar, FileText, MessageSquare, ArrowRight,
  ChevronDown, ChevronRight, Eye, Edit2, Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AgentAction {
  id: string;
  type: 'email' | 'schedule' | 'document' | 'message' | 'custom';
  name: string;
  description: string;
  config: Record<string, unknown>;
}

interface AgentTrigger {
  id: string;
  type: 'time' | 'event' | 'condition' | 'manual';
  name: string;
  config: Record<string, unknown>;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'active' | 'paused' | 'draft';
  trigger: AgentTrigger;
  actions: AgentAction[];
  autonomyLevel: 'observe' | 'suggest' | 'act';
  stats: {
    runsTotal: number;
    runsToday: number;
    successRate: number;
    lastRun?: Date;
  };
}

interface PendingAction {
  id: string;
  agentId: string;
  agentName: string;
  action: AgentAction;
  preview: string;
  createdAt: Date;
  status: 'pending' | 'approved' | 'rejected';
}

const AGENT_TEMPLATES: Partial<Agent>[] = [
  {
    name: 'Email Auto-Responder',
    description: 'Automatically draft responses to common emails',
    icon: '📧',
    trigger: { id: '1', type: 'event', name: 'New email received', config: {} },
    actions: [{ id: '1', type: 'email', name: 'Draft response', description: 'Generate contextual reply', config: {} }],
  },
  {
    name: 'Meeting Prep Assistant',
    description: 'Prepare briefings before calendar meetings',
    icon: '📅',
    trigger: { id: '1', type: 'time', name: '30 min before meeting', config: {} },
    actions: [{ id: '1', type: 'document', name: 'Create briefing', description: 'Research attendees and topics', config: {} }],
  },
  {
    name: 'Daily Digest Creator',
    description: 'Compile daily summary of activities and priorities',
    icon: '📋',
    trigger: { id: '1', type: 'time', name: 'Every morning at 8 AM', config: {} },
    actions: [{ id: '1', type: 'document', name: 'Generate digest', description: 'Summarize yesterday and plan today', config: {} }],
  },
  {
    name: 'Task Follow-up Bot',
    description: 'Send reminders for overdue or at-risk tasks',
    icon: '⏰',
    trigger: { id: '1', type: 'condition', name: 'Task overdue', config: {} },
    actions: [{ id: '1', type: 'message', name: 'Send reminder', description: 'Notify about pending tasks', config: {} }],
  },
];

interface AgentBuilderProps {
  className?: string;
}

export function AgentBuilder({ className }: AgentBuilderProps) {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: '1',
      name: 'Email Auto-Responder',
      description: 'Automatically draft responses to common emails',
      icon: '📧',
      status: 'active',
      trigger: { id: '1', type: 'event', name: 'New email received', config: {} },
      actions: [{ id: '1', type: 'email', name: 'Draft response', description: 'Generate contextual reply', config: {} }],
      autonomyLevel: 'suggest',
      stats: { runsTotal: 127, runsToday: 8, successRate: 94, lastRun: new Date() },
    },
    {
      id: '2',
      name: 'Meeting Prep Assistant',
      description: 'Prepare briefings before calendar meetings',
      icon: '📅',
      status: 'active',
      trigger: { id: '1', type: 'time', name: '30 min before meeting', config: {} },
      actions: [{ id: '1', type: 'document', name: 'Create briefing', description: 'Research attendees and topics', config: {} }],
      autonomyLevel: 'act',
      stats: { runsTotal: 45, runsToday: 2, successRate: 98, lastRun: new Date() },
    },
  ]);

  const [pendingActions, setPendingActions] = useState<PendingAction[]>([
    {
      id: '1',
      agentId: '1',
      agentName: 'Email Auto-Responder',
      action: { id: '1', type: 'email', name: 'Draft response', description: '', config: {} },
      preview: 'Thank you for your email. I\'ve reviewed the proposal and have a few questions...',
      createdAt: new Date(),
      status: 'pending',
    },
  ]);

  const [activeTab, setActiveTab] = useState<'agents' | 'queue' | 'templates'>('agents');
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const toggleAgentStatus = useCallback((id: string) => {
    setAgents(prev => prev.map(a => 
      a.id === id ? { ...a, status: a.status === 'active' ? 'paused' : 'active' } : a
    ));
  }, []);

  const deleteAgent = useCallback((id: string) => {
    setAgents(prev => prev.filter(a => a.id !== id));
  }, []);

  const approveAction = useCallback((id: string) => {
    setPendingActions(prev => prev.map(a => 
      a.id === id ? { ...a, status: 'approved' } : a
    ));
    // Remove after animation
    setTimeout(() => {
      setPendingActions(prev => prev.filter(a => a.id !== id));
    }, 500);
  }, []);

  const rejectAction = useCallback((id: string) => {
    setPendingActions(prev => prev.map(a => 
      a.id === id ? { ...a, status: 'rejected' } : a
    ));
    setTimeout(() => {
      setPendingActions(prev => prev.filter(a => a.id !== id));
    }, 500);
  }, []);

  const createAgentFromTemplate = useCallback((template: Partial<Agent>) => {
    const newAgent: Agent = {
      id: `agent-${Date.now()}`,
      name: template.name || 'New Agent',
      description: template.description || '',
      icon: template.icon || '🤖',
      status: 'draft',
      trigger: template.trigger || { id: '1', type: 'manual', name: 'Manual trigger', config: {} },
      actions: template.actions || [],
      autonomyLevel: 'suggest',
      stats: { runsTotal: 0, runsToday: 0, successRate: 0 },
    };
    setAgents(prev => [newAgent, ...prev]);
    setActiveTab('agents');
    setExpandedAgent(newAgent.id);
  }, []);

  const getActionIcon = (type: AgentAction['type']) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'schedule': return <Calendar className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      case 'message': return <MessageSquare className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'paused': return 'text-amber-400';
      case 'draft': return 'text-foreground/70';
    }
  };

  const getAutonomyColor = (level: Agent['autonomyLevel']) => {
    switch (level) {
      case 'observe': return 'bg-gray-500/20 text-foreground/70';
      case 'suggest': return 'bg-amber-500/20 text-amber-400';
      case 'act': return 'bg-green-500/20 text-green-400';
    }
  };

  return (
    <div className={cn('bg-card/60 border border-white/10 rounded-xl overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-r from-orange-500/10 to-red-500/10">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-orange-400" />
          <h3 className="font-medium text-foreground">Agent Builder</h3>
        </div>
        <div className="flex items-center gap-2">
          {pendingActions.filter(a => a.status === 'pending').length > 0 && (
            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full text-xs">
              {pendingActions.filter(a => a.status === 'pending').length} pending
            </span>
          )}
          <Button
            size="sm"
            onClick={() => setActiveTab('templates')}
            className="bg-orange-600 hover:bg-orange-700 text-white text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            New Agent
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {[
          { id: 'agents', label: 'My Agents', count: agents.length },
          { id: 'queue', label: 'Approval Queue', count: pendingActions.filter(a => a.status === 'pending').length },
          { id: 'templates', label: 'Templates' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm transition-colors',
              activeTab === tab.id
                ? 'text-foreground border-b-2 border-orange-500 bg-orange-500/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30'
            )}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="px-1.5 py-0.5 bg-secondary rounded text-xs">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 max-h-[500px] overflow-y-auto">
        {/* Agents Tab */}
        {activeTab === 'agents' && (
          <div className="space-y-3">
            {agents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No agents yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('templates')}
                  className="mt-2"
                >
                  Create your first agent
                </Button>
              </div>
            ) : (
              agents.map(agent => (
                <div
                  key={agent.id}
                  className="border border-white/10 rounded-lg overflow-hidden"
                >
                  {/* Agent Header */}
                  <div
                    className="flex items-center gap-3 p-3 bg-secondary/20 cursor-pointer hover:bg-secondary/30"
                    onClick={() => setExpandedAgent(expandedAgent === agent.id ? null : agent.id)}
                  >
                    <span className="text-2xl">{agent.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{agent.name}</span>
                        <span className={cn('text-xs', getStatusColor(agent.status))}>
                          {agent.status === 'active' ? '● Active' : agent.status === 'paused' ? '● Paused' : '○ Draft'}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{agent.description}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn('px-2 py-0.5 rounded text-xs', getAutonomyColor(agent.autonomyLevel))}>
                        {agent.autonomyLevel}
                      </span>
                      {expandedAgent === agent.id ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedAgent === agent.id && (
                    <div className="p-3 border-t border-white/10 space-y-3">
                      {/* Workflow */}
                      <div className="flex items-center gap-2 text-sm">
                        <div className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {agent.trigger.name}
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        {agent.actions.map((action, i) => (
                          <div key={action.id} className="flex items-center gap-2">
                            <div className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg flex items-center gap-2">
                              {getActionIcon(action.type)}
                              {action.name}
                            </div>
                            {i < agent.actions.length - 1 && (
                              <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="p-2 bg-secondary/30 rounded">
                          <div className="text-lg font-bold text-foreground">{agent.stats.runsTotal}</div>
                          <div className="text-[10px] text-muted-foreground">Total Runs</div>
                        </div>
                        <div className="p-2 bg-secondary/30 rounded">
                          <div className="text-lg font-bold text-foreground">{agent.stats.runsToday}</div>
                          <div className="text-[10px] text-muted-foreground">Today</div>
                        </div>
                        <div className="p-2 bg-secondary/30 rounded">
                          <div className="text-lg font-bold text-green-400">{agent.stats.successRate}%</div>
                          <div className="text-[10px] text-muted-foreground">Success</div>
                        </div>
                        <div className="p-2 bg-secondary/30 rounded">
                          <div className="text-xs font-medium text-foreground">
                            {agent.stats.lastRun ? 'Just now' : 'Never'}
                          </div>
                          <div className="text-[10px] text-muted-foreground">Last Run</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleAgentStatus(agent.id)}
                          className="text-xs"
                        >
                          {agent.status === 'active' ? (
                            <><Pause className="w-3 h-3 mr-1" /> Pause</>
                          ) : (
                            <><Play className="w-3 h-3 mr-1" /> Activate</>
                          )}
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs">
                          <Edit2 className="w-3 h-3 mr-1" /> Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs">
                          <Eye className="w-3 h-3 mr-1" /> Test
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteAgent(agent.id)}
                          className="text-xs text-red-400 hover:text-red-300 ml-auto"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Queue Tab */}
        {activeTab === 'queue' && (
          <div className="space-y-3">
            {pendingActions.filter(a => a.status === 'pending').length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No pending actions</p>
                <p className="text-xs">Your agents are running smoothly</p>
              </div>
            ) : (
              pendingActions.filter(a => a.status === 'pending').map(action => (
                <div
                  key={action.id}
                  className="p-4 border border-white/10 rounded-lg bg-secondary/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-orange-400" />
                      <span className="font-medium text-sm text-foreground">{action.agentName}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Just now</span>
                  </div>
                  
                  <div className="p-3 bg-secondary/30 rounded-lg mb-3">
                    <div className="text-xs text-muted-foreground mb-1">{action.action.name}</div>
                    <p className="text-sm text-foreground">{action.preview}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => approveAction(action.id)}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs"
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => rejectAction(action.id)}
                      className="text-xs"
                    >
                      Reject
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs ml-auto">
                      <Edit2 className="w-3 h-3 mr-1" /> Edit
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="grid gap-3">
            {AGENT_TEMPLATES.map((template, i) => (
              <div
                key={i}
                className="p-4 border border-white/10 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors cursor-pointer group"
                onClick={() => createAgentFromTemplate(template)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{template.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{template.name}</div>
                    <div className="text-xs text-muted-foreground">{template.description}</div>
                  </div>
                  <Button
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-orange-600 hover:bg-orange-700 text-white text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Use
                  </Button>
                </div>
              </div>
            ))}

            {/* Custom Agent */}
            <div
              className="p-4 border-2 border-dashed border-white/20 rounded-lg text-center hover:border-orange-500/50 transition-colors cursor-pointer"
              onClick={() => createAgentFromTemplate({ name: 'Custom Agent', icon: '🤖' })}
            >
              <Plus className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <div className="text-sm text-foreground">Create Custom Agent</div>
              <div className="text-xs text-muted-foreground">Build from scratch</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
