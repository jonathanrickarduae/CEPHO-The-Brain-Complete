import { useState } from 'react';
import { 
  Activity, TrendingUp, TrendingDown, AlertTriangle,
  Clock, Zap, Target, BarChart3, ArrowRight,
  CheckCircle2, XCircle, Lightbulb, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface WorkflowPattern {
  id: string;
  name: string;
  type: 'efficiency' | 'bottleneck' | 'success' | 'risk';
  description: string;
  frequency: string;
  impact: 'high' | 'medium' | 'low';
  trend: 'improving' | 'stable' | 'declining';
  occurrences: number;
  lastSeen: string;
  affectedProjects: string[];
  recommendation?: string;
}

interface AnomalyAlert {
  id: string;
  title: string;
  severity: 'critical' | 'warning' | 'info';
  description: string;
  detectedAt: string;
  source: string;
  status: 'new' | 'investigating' | 'resolved';
}

interface ProjectComparison {
  project: string;
  successScore: number;
  avgDuration: string;
  blockers: string[];
  successFactors: string[];
}

// Mock data
const MOCK_PATTERNS: WorkflowPattern[] = [
  {
    id: 'p1',
    name: 'Morning Deep Work Sessions',
    type: 'success',
    description: 'High-value tasks completed 40% faster when scheduled before 11am',
    frequency: 'Daily',
    impact: 'high',
    trend: 'improving',
    occurrences: 45,
    lastSeen: 'Today',
    affectedProjects: ['Project A', 'Project B'],
    recommendation: 'Block 9-11am for strategic work'
  },
  {
    id: 'p2',
    name: 'Document Review Bottleneck',
    type: 'bottleneck',
    description: 'Legal document reviews consistently delay deal progression by 3-5 days',
    frequency: 'Per deal',
    impact: 'high',
    trend: 'stable',
    occurrences: 12,
    lastSeen: '2 days ago',
    affectedProjects: ['Project A', 'Perfect DXB', 'Project C'],
    recommendation: 'Pre-schedule legal review slots or add parallel review capacity'
  },
  {
    id: 'p3',
    name: 'Meeting Overload Fridays',
    type: 'risk',
    description: 'Fridays with 4+ meetings correlate with 60% lower task completion',
    frequency: 'Weekly',
    impact: 'medium',
    trend: 'declining',
    occurrences: 8,
    lastSeen: 'Last Friday',
    affectedProjects: ['All'],
    recommendation: 'Implement "Focus Friday" policy with max 2 meetings'
  },
  {
    id: 'p4',
    name: 'Quick Response Wins',
    type: 'efficiency',
    description: 'Investor queries answered within 2 hours have 3x higher conversion',
    frequency: 'Per inquiry',
    impact: 'high',
    trend: 'improving',
    occurrences: 23,
    lastSeen: 'Yesterday',
    affectedProjects: ['Project A', 'Project B'],
    recommendation: 'Set up auto-alerts for investor communications'
  }
];

const MOCK_ANOMALIES: AnomalyAlert[] = [
  {
    id: 'a1',
    title: 'Unusual login pattern detected',
    severity: 'warning',
    description: 'Login from new location (Singapore) at unusual time',
    detectedAt: '2 hours ago',
    source: 'Security Monitor',
    status: 'investigating'
  },
  {
    id: 'a2',
    title: 'Deal velocity spike',
    severity: 'info',
    description: 'Project A progressing 50% faster than baseline',
    detectedAt: '1 day ago',
    source: 'Deal Analytics',
    status: 'resolved'
  }
];

const MOCK_PROJECT_COMPARISONS: ProjectComparison[] = [
  {
    project: 'Project A',
    successScore: 85,
    avgDuration: '4.2 months',
    blockers: ['Legal review delays', 'Stakeholder alignment'],
    successFactors: ['Strong sponsor', 'Clear timeline', 'Dedicated resources']
  },
  {
    project: 'Project B',
    successScore: 72,
    avgDuration: '6.1 months',
    blockers: ['Scope creep', 'Resource constraints'],
    successFactors: ['Market timing', 'Team expertise']
  },
  {
    project: 'Perfect DXB',
    successScore: 68,
    avgDuration: '5.5 months',
    blockers: ['Regulatory complexity', 'Time zone challenges'],
    successFactors: ['Local partnerships', 'Clear governance']
  },
  {
    project: 'Project C',
    successScore: 91,
    avgDuration: '3.8 months',
    blockers: ['Initial due diligence'],
    successFactors: ['Experienced team', 'Strong documentation', 'Proactive communication']
  }
];

export function WorkflowPatternDetection() {
  const [activeTab, setActiveTab] = useState<'patterns' | 'anomalies' | 'compare'>('patterns');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    toast.info('Running pattern analysis...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsAnalyzing(false);
    toast.success('Analysis complete! 2 new patterns detected.');
  };

  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle2;
      case 'bottleneck': return XCircle;
      case 'risk': return AlertTriangle;
      case 'efficiency': return Zap;
      default: return Activity;
    }
  };

  const getPatternColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-400 bg-green-500/20';
      case 'bottleneck': return 'text-red-400 bg-red-500/20';
      case 'risk': return 'text-orange-400 bg-orange-500/20';
      case 'efficiency': return 'text-cyan-400 bg-cyan-500/20';
      default: return 'text-foreground/70 bg-gray-500/20';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-400" />;
      default: return <ArrowRight className="w-4 h-4 text-foreground/70" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'warning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-card/60 border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Workflow Intelligence</h2>
              <p className="text-sm text-muted-foreground">AI-powered pattern detection and optimization</p>
            </div>
            <Button onClick={handleRunAnalysis} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4 mr-2" />
                  Run Analysis
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'patterns', label: 'Patterns', icon: BarChart3 },
          { id: 'anomalies', label: 'Anomalies', icon: AlertTriangle },
          { id: 'compare', label: 'Compare Projects', icon: Target }
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Patterns Tab */}
      {activeTab === 'patterns' && (
        <div className="space-y-3">
          {MOCK_PATTERNS.map((pattern) => {
            const PatternIcon = getPatternIcon(pattern.type);
            return (
              <Card key={pattern.id} className="bg-card/60 border-border">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getPatternColor(pattern.type)}`}>
                      <PatternIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-foreground">{pattern.name}</h3>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(pattern.trend)}
                          <Badge variant="outline" className={`text-xs ${
                            pattern.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                            pattern.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {pattern.impact} impact
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{pattern.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {pattern.frequency}
                        </span>
                        <span>{pattern.occurrences} occurrences</span>
                        <span>Last: {pattern.lastSeen}</span>
                      </div>
                      {pattern.recommendation && (
                        <div className="flex items-start gap-2 p-2 bg-primary/10 rounded text-sm">
                          <Lightbulb className="w-4 h-4 text-primary mt-0.5" />
                          <span className="text-foreground">{pattern.recommendation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Anomalies Tab */}
      {activeTab === 'anomalies' && (
        <div className="space-y-3">
          {MOCK_ANOMALIES.map((anomaly) => (
            <Card key={anomaly.id} className="bg-card/60 border-border">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={getSeverityColor(anomaly.severity)}>
                        {anomaly.severity}
                      </Badge>
                      <h3 className="font-medium text-foreground">{anomaly.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{anomaly.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{anomaly.detectedAt}</span>
                      <span>Source: {anomaly.source}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className={
                    anomaly.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                    anomaly.status === 'investigating' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }>
                    {anomaly.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Compare Projects Tab */}
      {activeTab === 'compare' && (
        <div className="space-y-3">
          {MOCK_PROJECT_COMPARISONS.map((project) => (
            <Card key={project.project} className="bg-card/60 border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-foreground">{project.project}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Success Score:</span>
                    <span className={`font-bold ${
                      project.successScore >= 80 ? 'text-green-400' :
                      project.successScore >= 60 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>{project.successScore}%</span>
                  </div>
                </div>
                <Progress value={project.successScore} className="h-2 mb-3" />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-foreground mb-1 flex items-center gap-1">
                      <XCircle className="w-3 h-3 text-red-400" />
                      Blockers
                    </h4>
                    <ul className="text-muted-foreground">
                      {project.blockers.map((b, i) => (
                        <li key={i}>• {b}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-green-400" />
                      Success Factors
                    </h4>
                    <ul className="text-muted-foreground">
                      {project.successFactors.map((f, i) => (
                        <li key={i}>• {f}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Avg. Duration: {project.avgDuration}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default WorkflowPatternDetection;
