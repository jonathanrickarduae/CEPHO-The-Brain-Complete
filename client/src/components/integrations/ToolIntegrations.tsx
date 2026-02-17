import { useState } from 'react';
import { 
  ExternalLink, Check, X, Loader2, RefreshCw, Settings, Unlink, 
  Trello, FileText, Calendar, CheckSquare, Zap, Video, Shield,
  Database, GitBranch, Clock, BarChart3, MessageSquare, Mic,
  Building2, Users, FolderOpen, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// Tool categories mapped to Value Chain phases
export type ValueChainPhase = 
  | 'ideation' 
  | 'innovation' 
  | 'development' 
  | 'go_to_market' 
  | 'operations' 
  | 'retention' 
  | 'exit';

export type ToolCategory = 
  | 'project_management'
  | 'ai_engines'
  | 'development'
  | 'automation'
  | 'content_creation'
  | 'communication'
  | 'business_crm'
  | 'security';

export interface ToolIntegration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: ToolCategory;
  phases: ValueChainPhase[];
  status: 'connected' | 'disconnected' | 'pending' | 'error';
  lastSync?: Date;
  accountName?: string;
  features: string[];
  apiEndpoint?: string;
  priority: 'high' | 'medium' | 'low';
}

// Phase colors and labels
const phaseConfig: Record<ValueChainPhase, { label: string; color: string; icon: string }> = {
  ideation: { label: 'Ideation', color: 'text-purple-400 bg-purple-500/20', icon: '💡' },
  innovation: { label: 'Innovation', color: 'text-blue-400 bg-blue-500/20', icon: '🚀' },
  development: { label: 'Development', color: 'text-orange-400 bg-orange-500/20', icon: '🔧' },
  go_to_market: { label: 'Go-to-Market', color: 'text-green-400 bg-green-500/20', icon: '🎯' },
  operations: { label: 'Operations', color: 'text-cyan-400 bg-cyan-500/20', icon: '⚙️' },
  retention: { label: 'Retention', color: 'text-pink-400 bg-pink-500/20', icon: '💎' },
  exit: { label: 'Exit', color: 'text-yellow-400 bg-yellow-500/20', icon: '🏆' },
};

// All available tool integrations
export const toolIntegrations: ToolIntegration[] = [
  // Project Management & Productivity
  {
    id: 'trello',
    name: 'Trello',
    description: 'Project management with boards, lists, and cards',
    icon: <Trello className="w-5 h-5 text-blue-400" />,
    category: 'project_management',
    phases: ['ideation', 'development'],
    status: 'disconnected',
    features: [
      'Sync boards with Project Genesis',
      'Create cards from blueprints',
      'Track sprint progress',
      'Automated status updates',
    ],
    priority: 'high',
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Knowledge base and documentation',
    icon: <FileText className="w-5 h-5 text-foreground/80" />,
    category: 'project_management',
    phases: ['ideation', 'innovation', 'exit'],
    status: 'disconnected',
    features: [
      'Sync blueprints to Notion pages',
      'Import knowledge base content',
      'Document version control',
      'Team collaboration',
    ],
    priority: 'high',
  },
  {
    id: 'todoist',
    name: 'Todoist',
    description: 'Task management and to-do lists',
    icon: <CheckSquare className="w-5 h-5 text-red-400" />,
    category: 'project_management',
    phases: ['operations'],
    status: 'disconnected',
    features: [
      'Sync tasks with Workflow',
      'Priority alignment',
      'Due date tracking',
      'Project organization',
    ],
    priority: 'medium',
  },
  {
    id: 'toggl',
    name: 'Toggl Track',
    description: 'Time tracking and analytics',
    icon: <Clock className="w-5 h-5 text-pink-400" />,
    category: 'project_management',
    phases: ['operations'],
    status: 'disconnected',
    features: [
      'Track time per project',
      'Analytics dashboard',
      'Team time reports',
      'Billable hours tracking',
    ],
    priority: 'medium',
  },
  
  // AI Engines
  {
    id: 'claude',
    name: 'Claude AI',
    description: 'Advanced AI assistant for analysis',
    icon: <MessageSquare className="w-5 h-5 text-orange-400" />,
    category: 'ai_engines',
    phases: ['ideation', 'innovation'],
    status: 'disconnected',
    features: [
      'SME Panel integration',
      'Document analysis',
      'Strategic recommendations',
      'Pre-mortem analysis',
    ],
    priority: 'high',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Google AI for multimodal analysis',
    icon: <MessageSquare className="w-5 h-5 text-blue-400" />,
    category: 'ai_engines',
    phases: ['ideation', 'innovation'],
    status: 'disconnected',
    features: [
      'SME Panel integration',
      'Image and document analysis',
      'Research synthesis',
      'Market intelligence',
    ],
    priority: 'high',
  },
  {
    id: 'copilot',
    name: 'Microsoft Copilot',
    description: 'AI assistant for productivity',
    icon: <MessageSquare className="w-5 h-5 text-cyan-400" />,
    category: 'ai_engines',
    phases: ['ideation', 'innovation'],
    status: 'disconnected',
    features: [
      'SME Panel integration',
      'Office document generation',
      'Email drafting',
      'Meeting summaries',
    ],
    priority: 'high',
  },
  
  // Development
  {
    id: 'github',
    name: 'GitHub',
    description: 'Code repository and version control',
    icon: <GitBranch className="w-5 h-5 text-foreground/80" />,
    category: 'development',
    phases: ['development'],
    status: 'disconnected',
    features: [
      'Repository sync',
      'Issue tracking',
      'PR notifications',
      'Code review integration',
    ],
    priority: 'medium',
  },
  
  // Automation
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Workflow automation',
    icon: <Zap className="w-5 h-5 text-orange-400" />,
    category: 'automation',
    phases: ['operations', 'retention'],
    status: 'disconnected',
    features: [
      'Automated workflows',
      'Cross-app triggers',
      'Data sync',
      'Custom automations',
    ],
    priority: 'high',
  },
  
  // Content Creation
  {
    id: 'canva',
    name: 'Canva',
    description: 'Design and graphics creation',
    icon: <BarChart3 className="w-5 h-5 text-cyan-400" />,
    category: 'content_creation',
    phases: ['go_to_market'],
    status: 'disconnected',
    features: [
      'Marketing asset creation',
      'Brand kit sync',
      'Template library',
      'Team collaboration',
    ],
    priority: 'medium',
  },
  {
    id: 'loom',
    name: 'Loom',
    description: 'Video recording and sharing',
    icon: <Video className="w-5 h-5 text-purple-400" />,
    category: 'content_creation',
    phases: ['go_to_market'],
    status: 'disconnected',
    features: [
      'Demo video creation',
      'Screen recording',
      'Video library',
      'Analytics tracking',
    ],
    priority: 'medium',
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    description: 'AI voice generation',
    icon: <Mic className="w-5 h-5 text-green-400" />,
    category: 'content_creation',
    phases: ['go_to_market'],
    status: 'connected',
    accountName: 'Cepho API',
    lastSync: new Date(),
    features: [
      'Voice synthesis',
      'Audio content creation',
      'Podcast generation',
      'Multilingual support',
    ],
    priority: 'medium',
  },
  
  // Business & CRM
  {
    id: 'lightfield',
    name: 'Lightfield CRM',
    description: 'Customer relationship management',
    icon: <Users className="w-5 h-5 text-blue-400" />,
    category: 'business_crm',
    phases: ['go_to_market', 'operations', 'retention'],
    status: 'disconnected',
    features: [
      'Pipeline management',
      'Customer health scores',
      'Deal tracking',
      'Renewal management',
    ],
    priority: 'high',
  },
  {
    id: 'calendly',
    name: 'Calendly',
    description: 'Meeting scheduling',
    icon: <Calendar className="w-5 h-5 text-blue-400" />,
    category: 'business_crm',
    phases: ['go_to_market', 'operations', 'retention'],
    status: 'disconnected',
    features: [
      'Meeting scheduling',
      'Calendar sync',
      'Booking pages',
      'Team scheduling',
    ],
    priority: 'high',
  },
  {
    id: 'ideals',
    name: 'iDeals VDR',
    description: 'Virtual data room for deals',
    icon: <FolderOpen className="w-5 h-5 text-green-400" />,
    category: 'business_crm',
    phases: ['exit'],
    status: 'disconnected',
    features: [
      'Secure document sharing',
      'Due diligence management',
      'Audit trails',
      'Access controls',
    ],
    priority: 'high',
  },
  
  // Security
  {
    id: 'bitwarden',
    name: 'Bitwarden',
    description: 'Password management',
    icon: <Lock className="w-5 h-5 text-blue-400" />,
    category: 'security',
    phases: ['operations'],
    status: 'disconnected',
    features: [
      'Secure credential storage',
      'Team password sharing',
      'Audit logging',
      'Two-factor auth',
    ],
    priority: 'medium',
  },
];

// Tool Integration Card Component
interface ToolCardProps {
  tool: ToolIntegration;
  onConnect: () => void;
  onDisconnect: () => void;
  onSync: () => void;
  isConnecting?: boolean;
  isSyncing?: boolean;
}

export function ToolCard({ 
  tool, 
  onConnect, 
  onDisconnect, 
  onSync,
  isConnecting,
  isSyncing 
}: ToolCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className={`p-4 border rounded-xl transition-all ${
      tool.status === 'connected' 
        ? 'border-green-500/30 bg-green-500/5' 
        : tool.status === 'error'
        ? 'border-red-500/30 bg-red-500/5'
        : 'border-white/10 bg-white/5 hover:border-white/20'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-lg ${
            tool.status === 'connected' ? 'bg-green-500/20' : 'bg-white/10'
          }`}>
            {tool.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-white">{tool.name}</h4>
              {tool.status === 'connected' && (
                <span className="flex items-center gap-1 text-xs text-green-400">
                  <Check className="w-3 h-3" />
                  Connected
                </span>
              )}
              {tool.status === 'error' && (
                <span className="flex items-center gap-1 text-xs text-red-400">
                  <X className="w-3 h-3" />
                  Error
                </span>
              )}
              <Badge variant="outline" className={`text-xs ${
                tool.priority === 'high' ? 'border-cyan-500/50 text-cyan-400' :
                tool.priority === 'medium' ? 'border-yellow-500/50 text-yellow-400' :
                'border-gray-500/50 text-foreground/70'
              }`}>
                {tool.priority}
              </Badge>
            </div>
            <p className="text-sm text-foreground/70 mt-0.5">{tool.description}</p>
            
            {/* Phase badges */}
            <div className="flex flex-wrap gap-1 mt-2">
              {tool.phases.map(phase => (
                <span 
                  key={phase}
                  className={`text-xs px-2 py-0.5 rounded-full ${phaseConfig[phase].color}`}
                >
                  {phaseConfig[phase].icon} {phaseConfig[phase].label}
                </span>
              ))}
            </div>
            
            {tool.status === 'connected' && tool.accountName && (
              <p className="text-xs text-foreground/60 mt-2">
                Account: {tool.accountName}
              </p>
            )}
            {tool.status === 'connected' && tool.lastSync && (
              <p className="text-xs text-foreground/60">
                Last synced: {new Date(tool.lastSync).toLocaleString('en-GB')}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {tool.status === 'connected' ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={onSync}
                disabled={isSyncing}
                className="h-8 text-foreground/70 hover:text-white"
              >
                {isSyncing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="h-8 text-foreground/70 hover:text-white"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDisconnect}
                className="h-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Unlink className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={onConnect}
              disabled={isConnecting}
              className="h-8 bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:opacity-90"
            >
              {isConnecting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <ExternalLink className="w-4 h-4 mr-2" />
              )}
              Connect
            </Button>
          )}
        </div>
      </div>

      {/* Features list */}
      {showDetails && tool.status === 'connected' && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <h5 className="text-sm font-medium text-white mb-2">Features enabled:</h5>
          <ul className="space-y-1">
            {tool.features.map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-foreground/70">
                <Check className="w-3 h-3 text-green-400" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Tool Integrations Dashboard
interface ToolIntegrationsDashboardProps {
  filterPhase?: ValueChainPhase;
  filterCategory?: ToolCategory;
}

export function ToolIntegrationsDashboard({ filterPhase, filterCategory }: ToolIntegrationsDashboardProps) {
  const [tools, setTools] = useState(toolIntegrations);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<ValueChainPhase | 'all'>(filterPhase || 'all');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all'>(filterCategory || 'all');

  const filteredTools = tools.filter(tool => {
    if (selectedPhase !== 'all' && !tool.phases.includes(selectedPhase)) return false;
    if (selectedCategory !== 'all' && tool.category !== selectedCategory) return false;
    return true;
  });

  const handleConnect = (toolId: string) => {
    setConnectingId(toolId);
    // Simulate OAuth flow
    toast.info('Opening authentication window...');
    setTimeout(() => {
      setTools(prev => prev.map(t => 
        t.id === toolId 
          ? { ...t, status: 'connected' as const, lastSync: new Date(), accountName: 'Connected Account' }
          : t
      ));
      setConnectingId(null);
      toast.success('Integration connected successfully!');
    }, 2000);
  };

  const handleDisconnect = (toolId: string) => {
    setTools(prev => prev.map(t => 
      t.id === toolId 
        ? { ...t, status: 'disconnected' as const, lastSync: undefined, accountName: undefined }
        : t
    ));
    toast.success('Integration disconnected');
  };

  const handleSync = (toolId: string) => {
    setSyncingId(toolId);
    setTimeout(() => {
      setTools(prev => prev.map(t => 
        t.id === toolId 
          ? { ...t, lastSync: new Date() }
          : t
      ));
      setSyncingId(null);
      toast.success('Sync completed');
    }, 1500);
  };

  const connectedCount = tools.filter(t => t.status === 'connected').length;
  const totalCount = tools.length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="text-2xl font-bold text-white">{connectedCount}</div>
          <div className="text-sm text-foreground/70">Connected</div>
        </div>
        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="text-2xl font-bold text-white">{totalCount - connectedCount}</div>
          <div className="text-sm text-foreground/70">Available</div>
        </div>
        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="text-2xl font-bold text-cyan-400">
            {tools.filter(t => t.priority === 'high').length}
          </div>
          <div className="text-sm text-foreground/70">High Priority</div>
        </div>
        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="text-2xl font-bold text-green-400">
            {Math.round((connectedCount / totalCount) * 100)}%
          </div>
          <div className="text-sm text-foreground/70">Integration Coverage</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="text-sm text-foreground/70 mb-2 block">Filter by Phase</label>
          <select 
            value={selectedPhase}
            onChange={(e) => setSelectedPhase(e.target.value as ValueChainPhase | 'all')}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="all">All Phases</option>
            {Object.entries(phaseConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.icon} {config.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-foreground/70 mb-2 block">Filter by Category</label>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as ToolCategory | 'all')}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="all">All Categories</option>
            <option value="project_management">Project Management</option>
            <option value="ai_engines">AI Engines</option>
            <option value="development">Development</option>
            <option value="automation">Automation</option>
            <option value="content_creation">Content Creation</option>
            <option value="business_crm">Business & CRM</option>
            <option value="security">Security</option>
          </select>
        </div>
      </div>

      {/* Tool Cards */}
      <div className="space-y-3">
        {filteredTools.map(tool => (
          <ToolCard
            key={tool.id}
            tool={tool}
            onConnect={() => handleConnect(tool.id)}
            onDisconnect={() => handleDisconnect(tool.id)}
            onSync={() => handleSync(tool.id)}
            isConnecting={connectingId === tool.id}
            isSyncing={syncingId === tool.id}
          />
        ))}
      </div>

      {filteredTools.length === 0 && (
        <div className="text-center py-12 text-foreground/70">
          No integrations found for the selected filters.
        </div>
      )}
    </div>
  );
}

export default ToolIntegrationsDashboard;
