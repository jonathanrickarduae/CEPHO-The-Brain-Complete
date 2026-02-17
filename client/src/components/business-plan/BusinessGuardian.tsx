import { useState, useEffect } from 'react';
import { 
  Shield, AlertTriangle, TrendingUp, Zap, Eye, 
  CheckCircle2, XCircle, Clock, RefreshCw, 
  Lightbulb, Target, ArrowUpRight, ArrowDownRight,
  Link2, Unplug, Activity, Bell, ChevronRight,
  Brain, Sparkles, Lock, Globe, Server
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// Types
interface Threat {
  id: string;
  type: 'security' | 'financial' | 'operational' | 'competitive' | 'regulatory';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  source: string;
  detectedAt: Date;
  status: 'active' | 'monitoring' | 'resolved';
  recommendedAction?: string;
}

interface Opportunity {
  id: string;
  type: 'market' | 'partnership' | 'efficiency' | 'innovation' | 'expansion';
  potential: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  source: string;
  detectedAt: Date;
  expiresAt?: Date;
  estimatedValue?: string;
}

interface BusinessStrength {
  id: string;
  category: 'operations' | 'finance' | 'marketing' | 'technology' | 'talent' | 'strategy';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  timeframe: string;
  status: 'suggested' | 'in_progress' | 'completed' | 'dismissed';
}

interface IntegrationHealth {
  id: string;
  name: string;
  type: 'api' | 'database' | 'service' | 'webhook';
  status: 'healthy' | 'degraded' | 'down' | 'unknown';
  lastChecked: Date;
  uptime: number;
  responseTime?: number;
  issues: string[];
  icon: string;
}

// Sample data generators
const generateThreats = (): Threat[] => [
  {
    id: 'threat-1',
    type: 'competitive',
    severity: 'high',
    title: 'Competitor Product Launch',
    description: 'TechFlow Solutions announced a competing product targeting the same market segment. Expected launch in Q2.',
    source: 'Market Intelligence',
    detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    status: 'active',
    recommendedAction: 'Accelerate feature roadmap and strengthen unique value proposition'
  },
  {
    id: 'threat-2',
    type: 'regulatory',
    severity: 'medium',
    title: 'GDPR Compliance Gap',
    description: 'New data retention requirements may affect current storage practices. Review needed within 30 days.',
    source: 'Compliance Scanner',
    detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    status: 'monitoring',
    recommendedAction: 'Schedule compliance review with legal team'
  },
  {
    id: 'threat-3',
    type: 'financial',
    severity: 'low',
    title: 'Currency Fluctuation Risk',
    description: 'GBP/USD volatility may impact Q3 revenue projections by 2-3%.',
    source: 'Financial Analysis',
    detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    status: 'monitoring'
  }
];

const generateOpportunities = (): Opportunity[] => [
  {
    id: 'opp-1',
    type: 'partnership',
    potential: 'high',
    title: 'Strategic Partnership with DataCorp',
    description: 'DataCorp is seeking AI integration partners. Their 50K enterprise customer base aligns with our target market.',
    source: 'Network Analysis',
    detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
    estimatedValue: '£2.5M ARR potential'
  },
  {
    id: 'opp-2',
    type: 'market',
    potential: 'medium',
    title: 'Healthcare Vertical Expansion',
    description: 'NHS Digital is accepting vendor applications for their new AI procurement framework.',
    source: 'Government Tenders',
    detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    estimatedValue: '£500K-1M contract value'
  },
  {
    id: 'opp-3',
    type: 'efficiency',
    potential: 'medium',
    title: 'Process Automation Savings',
    description: 'Analysis shows 40% of document review tasks could be automated, saving 15 hours/week.',
    source: 'Workflow Analysis',
    detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    estimatedValue: '£45K annual savings'
  }
];

const generateStrengthSuggestions = (): BusinessStrength[] => [
  {
    id: 'strength-1',
    category: 'operations',
    title: 'Implement Automated QA Pipeline',
    description: 'Set up automated testing for all AI outputs to reduce manual review time by 60%.',
    impact: 'high',
    effort: 'medium',
    timeframe: '2-3 weeks',
    status: 'suggested'
  },
  {
    id: 'strength-2',
    category: 'marketing',
    title: 'Launch Customer Success Stories',
    description: 'Document and publish 3 case studies showcasing ROI achieved by existing clients.',
    impact: 'high',
    effort: 'low',
    timeframe: '1-2 weeks',
    status: 'suggested'
  },
  {
    id: 'strength-3',
    category: 'technology',
    title: 'Enable Multi-Region Deployment',
    description: 'Deploy to EU and US regions to reduce latency and meet data residency requirements.',
    impact: 'medium',
    effort: 'high',
    timeframe: '4-6 weeks',
    status: 'in_progress'
  },
  {
    id: 'strength-4',
    category: 'talent',
    title: 'Cross-Train Team on AI Tools',
    description: 'Upskill 5 team members on prompt engineering to reduce dependency on specialists.',
    impact: 'medium',
    effort: 'low',
    timeframe: '2 weeks',
    status: 'suggested'
  },
  {
    id: 'strength-5',
    category: 'finance',
    title: 'Optimize Cloud Spending',
    description: 'Switch to reserved instances and implement auto-scaling to reduce cloud costs by 25%.',
    impact: 'medium',
    effort: 'medium',
    timeframe: '1 week',
    status: 'suggested'
  }
];

const generateIntegrationHealth = (): IntegrationHealth[] => [
  {
    id: 'int-1',
    name: 'Claude API',
    type: 'api',
    status: 'healthy',
    lastChecked: new Date(),
    uptime: 99.9,
    responseTime: 245,
    issues: [],
    icon: '🧠'
  },
  {
    id: 'int-2',
    name: 'iDeals Dataroom',
    type: 'api',
    status: 'healthy',
    lastChecked: new Date(),
    uptime: 99.5,
    responseTime: 380,
    issues: [],
    icon: '📁'
  },
  {
    id: 'int-3',
    name: 'Calendar Sync',
    type: 'service',
    status: 'degraded',
    lastChecked: new Date(Date.now() - 1000 * 60 * 5),
    uptime: 97.2,
    responseTime: 1200,
    issues: ['High latency detected', 'Sync delay of 15 minutes'],
    icon: '📅'
  },
  {
    id: 'int-4',
    name: 'NordVPN Security',
    type: 'service',
    status: 'healthy',
    lastChecked: new Date(),
    uptime: 100,
    issues: [],
    icon: '🔒'
  },
  {
    id: 'int-5',
    name: 'Database',
    type: 'database',
    status: 'healthy',
    lastChecked: new Date(),
    uptime: 99.99,
    responseTime: 12,
    issues: [],
    icon: '💾'
  },
  {
    id: 'int-6',
    name: 'Webhook Endpoints',
    type: 'webhook',
    status: 'unknown',
    lastChecked: new Date(Date.now() - 1000 * 60 * 60),
    uptime: 95.0,
    issues: ['Last health check failed'],
    icon: '🔗'
  }
];

// Utility functions
const getSeverityColor = (severity: Threat['severity']) => {
  switch (severity) {
    case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/30';
    case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
    case 'medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
    case 'low': return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
  }
};

const getPotentialColor = (potential: Opportunity['potential']) => {
  switch (potential) {
    case 'high': return 'text-green-500 bg-green-500/10 border-green-500/30';
    case 'medium': return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
    case 'low': return 'text-foreground/60 bg-gray-500/10 border-gray-500/30';
  }
};

const getStatusColor = (status: IntegrationHealth['status']) => {
  switch (status) {
    case 'healthy': return 'text-green-500';
    case 'degraded': return 'text-amber-500';
    case 'down': return 'text-red-500';
    case 'unknown': return 'text-foreground/60';
  }
};

const getStatusIcon = (status: IntegrationHealth['status']) => {
  switch (status) {
    case 'healthy': return <CheckCircle2 className="w-4 h-4" />;
    case 'degraded': return <AlertTriangle className="w-4 h-4" />;
    case 'down': return <XCircle className="w-4 h-4" />;
    case 'unknown': return <Clock className="w-4 h-4" />;
  }
};

const timeAgo = (date: Date): string => {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

// Main Component
export function BusinessGuardian() {
  const [activeTab, setActiveTab] = useState<'threats' | 'opportunities' | 'strengthen' | 'integrations'>('threats');
  const [threats, setThreats] = useState<Threat[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [strengths, setStrengths] = useState<BusinessStrength[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationHealth[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<Date>(new Date());

  // Initialize data
  useEffect(() => {
    setThreats(generateThreats());
    setOpportunities(generateOpportunities());
    setStrengths(generateStrengthSuggestions());
    setIntegrations(generateIntegrationHealth());
  }, []);

  // Simulate scanning
  const runScan = () => {
    setIsScanning(true);
    toast.info('Chief of Staff scanning for threats and opportunities...');
    
    setTimeout(() => {
      setThreats(generateThreats());
      setOpportunities(generateOpportunities());
      setIntegrations(generateIntegrationHealth());
      setLastScan(new Date());
      setIsScanning(false);
      toast.success('Scan complete! Business intelligence updated.');
    }, 2000);
  };

  // Handle strength suggestion actions
  const handleStrengthAction = (id: string, action: 'start' | 'complete' | 'dismiss') => {
    setStrengths(prev => prev.map(s => {
      if (s.id !== id) return s;
      switch (action) {
        case 'start': return { ...s, status: 'in_progress' as const };
        case 'complete': return { ...s, status: 'completed' as const };
        case 'dismiss': return { ...s, status: 'dismissed' as const };
        default: return s;
      }
    }));
    
    const actionMessages = {
      start: 'Started working on improvement',
      complete: 'Marked as completed',
      dismiss: 'Suggestion dismissed'
    };
    toast.success(actionMessages[action]);
  };

  // Check integration health
  const checkIntegration = (id: string) => {
    setIntegrations(prev => prev.map(i => 
      i.id === id ? { ...i, lastChecked: new Date(), status: 'healthy' as const, issues: [] } : i
    ));
    toast.success('Integration health check completed');
  };

  const activeThreats = threats.filter(t => t.status === 'active').length;
  const highPotentialOpps = opportunities.filter(o => o.potential === 'high').length;
  const pendingStrengths = strengths.filter(s => s.status === 'suggested').length;
  const unhealthyIntegrations = integrations.filter(i => i.status !== 'healthy').length;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-fuchsia-500/10 to-purple-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-fuchsia-500/20 rounded-lg">
              <Shield className="w-5 h-5 text-fuchsia-400" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Business Guardian</h3>
              <p className="text-xs text-muted-foreground">
                Last scan: {timeAgo(lastScan)}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={runScan}
            disabled={isScanning}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scanning...' : 'Scan Now'}
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          <button
            onClick={() => setActiveTab('threats')}
            className={`p-2 rounded-lg text-center transition-all ${
              activeTab === 'threats' 
                ? 'bg-red-500/20 border border-red-500/30' 
                : 'bg-secondary/50 hover:bg-secondary'
            }`}
          >
            <div className="text-lg font-bold text-red-400">{activeThreats}</div>
            <div className="text-xs text-muted-foreground">Threats</div>
          </button>
          <button
            onClick={() => setActiveTab('opportunities')}
            className={`p-2 rounded-lg text-center transition-all ${
              activeTab === 'opportunities' 
                ? 'bg-green-500/20 border border-green-500/30' 
                : 'bg-secondary/50 hover:bg-secondary'
            }`}
          >
            <div className="text-lg font-bold text-green-400">{highPotentialOpps}</div>
            <div className="text-xs text-muted-foreground">Opportunities</div>
          </button>
          <button
            onClick={() => setActiveTab('strengthen')}
            className={`p-2 rounded-lg text-center transition-all ${
              activeTab === 'strengthen' 
                ? 'bg-blue-500/20 border border-blue-500/30' 
                : 'bg-secondary/50 hover:bg-secondary'
            }`}
          >
            <div className="text-lg font-bold text-blue-400">{pendingStrengths}</div>
            <div className="text-xs text-muted-foreground">Suggestions</div>
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`p-2 rounded-lg text-center transition-all ${
              activeTab === 'integrations' 
                ? 'bg-amber-500/20 border border-amber-500/30' 
                : 'bg-secondary/50 hover:bg-secondary'
            }`}
          >
            <div className={`text-lg font-bold ${unhealthyIntegrations > 0 ? 'text-amber-400' : 'text-green-400'}`}>
              {integrations.length - unhealthyIntegrations}/{integrations.length}
            </div>
            <div className="text-xs text-muted-foreground">Healthy</div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-h-[400px] overflow-y-auto">
        {/* Threats Tab */}
        {activeTab === 'threats' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium">Active Threats & Risks</span>
            </div>
            {threats.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No active threats detected</p>
              </div>
            ) : (
              threats.map(threat => (
                <div 
                  key={threat.id}
                  className={`p-3 rounded-lg border ${getSeverityColor(threat.severity)}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs capitalize">
                          {threat.type}
                        </Badge>
                        <Badge variant="outline" className={`text-xs capitalize ${getSeverityColor(threat.severity)}`}>
                          {threat.severity}
                        </Badge>
                      </div>
                      <h4 className="font-medium text-sm">{threat.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{threat.description}</p>
                      {threat.recommendedAction && (
                        <div className="mt-2 p-2 bg-secondary/50 rounded text-xs">
                          <span className="text-muted-foreground">Recommended: </span>
                          <span>{threat.recommendedAction}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">{timeAgo(threat.detectedAt)}</div>
                      <Badge variant="outline" className="text-xs mt-1 capitalize">
                        {threat.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Opportunities Tab */}
        {activeTab === 'opportunities' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium">Detected Opportunities</span>
            </div>
            {opportunities.map(opp => (
              <div 
                key={opp.id}
                className={`p-3 rounded-lg border ${getPotentialColor(opp.potential)}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs capitalize">
                        {opp.type}
                      </Badge>
                      <Badge variant="outline" className={`text-xs capitalize ${getPotentialColor(opp.potential)}`}>
                        {opp.potential} potential
                      </Badge>
                    </div>
                    <h4 className="font-medium text-sm">{opp.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{opp.description}</p>
                    {opp.estimatedValue && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-green-400">
                        <ArrowUpRight className="w-3 h-3" />
                        {opp.estimatedValue}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">{timeAgo(opp.detectedAt)}</div>
                    {opp.expiresAt && (
                      <div className="text-xs text-amber-400 mt-1">
                        Expires in {Math.ceil((opp.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))}d
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="text-xs h-7">
                    Investigate
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs h-7">
                    Assign to Team
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Strengthen Tab */}
        {activeTab === 'strengthen' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium">Business Strengthening Suggestions</span>
            </div>
            {strengths.filter(s => s.status !== 'dismissed').map(strength => (
              <div 
                key={strength.id}
                className={`p-3 rounded-lg border border-border ${
                  strength.status === 'completed' ? 'bg-green-500/5' : 
                  strength.status === 'in_progress' ? 'bg-blue-500/5' : 'bg-secondary/30'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs capitalize">
                        {strength.category}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          strength.impact === 'high' ? 'text-green-400 border-green-400/30' :
                          strength.impact === 'medium' ? 'text-blue-400 border-blue-400/30' :
                          'text-foreground/70 border-gray-400/30'
                        }`}
                      >
                        {strength.impact} impact
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          strength.effort === 'low' ? 'text-green-400 border-green-400/30' :
                          strength.effort === 'medium' ? 'text-amber-400 border-amber-400/30' :
                          'text-red-400 border-red-400/30'
                        }`}
                      >
                        {strength.effort} effort
                      </Badge>
                    </div>
                    <h4 className="font-medium text-sm">{strength.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{strength.description}</p>
                    <div className="text-xs text-muted-foreground mt-2">
                      <Clock className="w-3 h-3 inline mr-1" />
                      Estimated: {strength.timeframe}
                    </div>
                  </div>
                  {strength.status === 'completed' && (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  )}
                </div>
                {strength.status === 'suggested' && (
                  <div className="flex gap-2 mt-3">
                    <Button 
                      size="sm" 
                      variant="default" 
                      className="text-xs h-7"
                      onClick={() => handleStrengthAction(strength.id, 'start')}
                    >
                      Start
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs h-7"
                      onClick={() => handleStrengthAction(strength.id, 'dismiss')}
                    >
                      Dismiss
                    </Button>
                  </div>
                )}
                {strength.status === 'in_progress' && (
                  <div className="flex gap-2 mt-3">
                    <Button 
                      size="sm" 
                      variant="default" 
                      className="text-xs h-7 bg-green-600 hover:bg-green-700"
                      onClick={() => handleStrengthAction(strength.id, 'complete')}
                    >
                      Mark Complete
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Integrations Tab */}
        {activeTab === 'integrations' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Link2 className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium">Integration Health Monitor</span>
            </div>
            {integrations.map(integration => (
              <div 
                key={integration.id}
                className={`p-3 rounded-lg border border-border ${
                  integration.status === 'healthy' ? 'bg-green-500/5' :
                  integration.status === 'degraded' ? 'bg-amber-500/5' :
                  integration.status === 'down' ? 'bg-red-500/5' : 'bg-secondary/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{integration.icon}</span>
                    <div>
                      <h4 className="font-medium text-sm">{integration.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className={getStatusColor(integration.status)}>
                          {getStatusIcon(integration.status)}
                        </span>
                        <span className="capitalize">{integration.status}</span>
                        <span>•</span>
                        <span>{integration.uptime}% uptime</span>
                        {integration.responseTime && (
                          <>
                            <span>•</span>
                            <span>{integration.responseTime}ms</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">
                      Checked {timeAgo(integration.lastChecked)}
                    </div>
                    {integration.status !== 'healthy' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-xs h-6 mt-1"
                        onClick={() => checkIntegration(integration.id)}
                      >
                        Recheck
                      </Button>
                    )}
                  </div>
                </div>
                {integration.issues.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {integration.issues.map((issue, idx) => (
                      <div key={idx} className="text-xs text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {issue}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Compact widget for Dashboard
export function BusinessGuardianWidget() {
  const [threats] = useState(generateThreats());
  const [opportunities] = useState(generateOpportunities());
  const [integrations] = useState(generateIntegrationHealth());

  const activeThreats = threats.filter(t => t.status === 'active').length;
  const highPotentialOpps = opportunities.filter(o => o.potential === 'high').length;
  const unhealthyIntegrations = integrations.filter(i => i.status !== 'healthy').length;

  return (
    <div className="p-3 bg-gradient-to-br from-fuchsia-500/10 to-purple-500/10 rounded-lg border border-fuchsia-500/20">
      <div className="flex items-center gap-2 mb-2">
        <Shield className="w-4 h-4 text-fuchsia-400" />
        <span className="text-sm font-medium">Business Guardian</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className={`text-lg font-bold ${activeThreats > 0 ? 'text-red-400' : 'text-green-400'}`}>
            {activeThreats}
          </div>
          <div className="text-xs text-muted-foreground">Threats</div>
        </div>
        <div>
          <div className="text-lg font-bold text-green-400">{highPotentialOpps}</div>
          <div className="text-xs text-muted-foreground">Opportunities</div>
        </div>
        <div>
          <div className={`text-lg font-bold ${unhealthyIntegrations > 0 ? 'text-amber-400' : 'text-green-400'}`}>
            {unhealthyIntegrations > 0 ? unhealthyIntegrations : '✓'}
          </div>
          <div className="text-xs text-muted-foreground">Issues</div>
        </div>
      </div>
    </div>
  );
}

export default BusinessGuardian;
