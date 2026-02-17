import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Users,
  Target,
  Lightbulb,
  MessageSquare,
  Calendar,
  ArrowRight,
  Download,
  RefreshCw,
  Building2,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Decision {
  id: string;
  title: string;
  description: string;
  decidedAt: Date;
  decidedBy: string;
  category: 'strategy' | 'product' | 'finance' | 'team' | 'operations';
  status: 'final' | 'pending_review' | 'superseded';
  rationale?: string;
}

interface Milestone {
  id: string;
  title: string;
  completedAt: Date;
  category: string;
  impact: 'high' | 'medium' | 'low';
}

interface OpenQuestion {
  id: string;
  question: string;
  raisedAt: Date;
  raisedBy: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  assignedTo?: string;
}

interface ProjectSummaryProps {
  projectId?: string;
  projectName?: string;
  decisions?: Decision[];
  milestones?: Milestone[];
  openQuestions?: OpenQuestion[];
  onRefresh?: () => void;
}

const categoryConfig = {
  strategy: { icon: Target, color: 'text-purple-400', bg: 'bg-purple-500/20' },
  product: { icon: Lightbulb, color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  finance: { icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/20' },
  team: { icon: Users, color: 'text-amber-400', bg: 'bg-amber-500/20' },
  operations: { icon: Building2, color: 'text-blue-400', bg: 'bg-blue-500/20' }
};

// Sample data for demonstration
const sampleDecisions: Decision[] = [
  {
    id: '1',
    title: 'Target B2B SaaS market first',
    description: 'Focus initial go-to-market on B2B SaaS companies with 50-500 employees',
    decidedAt: new Date('2026-01-15'),
    decidedBy: 'Strategy Team',
    category: 'strategy',
    status: 'final',
    rationale: 'Higher willingness to pay, faster sales cycles, better product-market fit'
  },
  {
    id: '2',
    title: 'Freemium pricing model',
    description: 'Offer free tier with upgrade path to Pro ($49/mo) and Enterprise (custom)',
    decidedAt: new Date('2026-01-16'),
    decidedBy: 'Finance Team',
    category: 'finance',
    status: 'final'
  },
  {
    id: '3',
    title: 'Hire VP of Sales Q2',
    description: 'Prioritize sales leadership hire after seed round closes',
    decidedAt: new Date('2026-01-17'),
    decidedBy: 'Leadership',
    category: 'team',
    status: 'pending_review'
  }
];

const sampleMilestones: Milestone[] = [
  { id: '1', title: 'MVP launched', completedAt: new Date('2026-01-10'), category: 'product', impact: 'high' },
  { id: '2', title: 'First 10 paying customers', completedAt: new Date('2026-01-14'), category: 'sales', impact: 'high' },
  { id: '3', title: 'Seed deck completed', completedAt: new Date('2026-01-16'), category: 'fundraising', impact: 'medium' },
  { id: '4', title: 'Brand identity finalized', completedAt: new Date('2026-01-17'), category: 'marketing', impact: 'low' }
];

const sampleQuestions: OpenQuestion[] = [
  { id: '1', question: 'Should we pursue enterprise customers in parallel?', raisedAt: new Date('2026-01-17'), raisedBy: 'Sales', priority: 'high' },
  { id: '2', question: 'What is our position on AI-generated content disclosure?', raisedAt: new Date('2026-01-16'), raisedBy: 'Legal', priority: 'medium' },
  { id: '3', question: 'Do we need SOC2 compliance for enterprise deals?', raisedAt: new Date('2026-01-15'), raisedBy: 'Security', priority: 'urgent', assignedTo: 'CTO' }
];

export function ProjectSummary({ 
  projectId, 
  projectName = 'Project',
  decisions = sampleDecisions,
  milestones = sampleMilestones,
  openQuestions = sampleQuestions,
  onRefresh
}: ProjectSummaryProps) {
  const [activeTab, setActiveTab] = useState('decisions');

  const stats = useMemo(() => ({
    totalDecisions: decisions.length,
    finalDecisions: decisions.filter(d => d.status === 'final').length,
    pendingDecisions: decisions.filter(d => d.status === 'pending_review').length,
    totalMilestones: milestones.length,
    highImpactMilestones: milestones.filter(m => m.impact === 'high').length,
    openQuestions: openQuestions.length,
    urgentQuestions: openQuestions.filter(q => q.priority === 'urgent').length
  }), [decisions, milestones, openQuestions]);

  const exportSummary = () => {
    const summary = {
      projectName,
      generatedAt: new Date().toISOString(),
      stats,
      decisions,
      milestones,
      openQuestions
    };
    
    const markdown = `# ${projectName} Summary
Generated: ${new Date().toLocaleDateString()}

## Key Stats
- **Decisions Made:** ${stats.totalDecisions} (${stats.finalDecisions} final, ${stats.pendingDecisions} pending)
- **Milestones Completed:** ${stats.totalMilestones} (${stats.highImpactMilestones} high impact)
- **Open Questions:** ${stats.openQuestions} (${stats.urgentQuestions} urgent)

## Decisions
${decisions.map(d => `### ${d.title}
- **Status:** ${d.status}
- **Category:** ${d.category}
- **Decided:** ${new Date(d.decidedAt).toLocaleDateString()} by ${d.decidedBy}
- **Description:** ${d.description}
${d.rationale ? `- **Rationale:** ${d.rationale}` : ''}
`).join('\n')}

## Milestones
${milestones.map(m => `- ✅ **${m.title}** (${m.category}) - ${new Date(m.completedAt).toLocaleDateString()}`).join('\n')}

## Open Questions
${openQuestions.map(q => `- [${q.priority.toUpperCase()}] ${q.question} (Raised by ${q.raisedBy}${q.assignedTo ? `, assigned to ${q.assignedTo}` : ''})`).join('\n')}
`;
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}-summary.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Summary exported');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#E91E8C]" />
                {projectName} Summary
              </CardTitle>
              <CardDescription>What's been built and decided at this point</CardDescription>
            </div>
            <div className="flex gap-2">
              {onRefresh && (
                <Button variant="outline" size="sm" onClick={onRefresh}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={exportSummary}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-sm text-muted-foreground">Decisions</span>
              </div>
              <div className="text-2xl font-bold text-white">{stats.totalDecisions}</div>
              <div className="text-xs text-muted-foreground">{stats.finalDecisions} final</div>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-muted-foreground">Milestones</span>
              </div>
              <div className="text-2xl font-bold text-white">{stats.totalMilestones}</div>
              <div className="text-xs text-muted-foreground">{stats.highImpactMilestones} high impact</div>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-muted-foreground">Open Questions</span>
              </div>
              <div className="text-2xl font-bold text-white">{stats.openQuestions}</div>
              <div className="text-xs text-muted-foreground">{stats.urgentQuestions} urgent</div>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-muted-foreground">Pending</span>
              </div>
              <div className="text-2xl font-bold text-white">{stats.pendingDecisions}</div>
              <div className="text-xs text-muted-foreground">need review</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-800/50">
          <TabsTrigger value="decisions">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Decisions ({decisions.length})
          </TabsTrigger>
          <TabsTrigger value="milestones">
            <TrendingUp className="w-4 h-4 mr-2" />
            Milestones ({milestones.length})
          </TabsTrigger>
          <TabsTrigger value="questions">
            <MessageSquare className="w-4 h-4 mr-2" />
            Open Questions ({openQuestions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="decisions" className="mt-4">
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {decisions.map(decision => {
                const config = categoryConfig[decision.category];
                const Icon = config.icon;
                
                return (
                  <Card key={decision.id} className="bg-gray-900/50 border-gray-800">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={cn('p-2 rounded-lg', config.bg)}>
                          <Icon className={cn('w-4 h-4', config.color)} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-white">{decision.title}</h4>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                decision.status === 'final' && 'bg-green-500/20 text-green-400 border-green-500/30',
                                decision.status === 'pending_review' && 'bg-amber-500/20 text-amber-400 border-amber-500/30',
                                decision.status === 'superseded' && 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                              )}
                            >
                              {decision.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{decision.description}</p>
                          {decision.rationale && (
                            <p className="text-xs text-muted-foreground mt-2 italic">
                              Rationale: {decision.rationale}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>{new Date(decision.decidedAt).toLocaleDateString()}</span>
                            <span>by {decision.decidedBy}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="milestones" className="mt-4">
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {milestones.map(milestone => (
                <div 
                  key={milestone.id}
                  className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg"
                >
                  <CheckCircle2 className={cn(
                    'w-5 h-5',
                    milestone.impact === 'high' && 'text-green-400',
                    milestone.impact === 'medium' && 'text-amber-400',
                    milestone.impact === 'low' && 'text-gray-400'
                  )} />
                  <div className="flex-1">
                    <p className="text-white font-medium">{milestone.title}</p>
                    <p className="text-xs text-muted-foreground">{milestone.category}</p>
                  </div>
                  <Badge variant="outline" className={cn(
                    milestone.impact === 'high' && 'border-green-500/30 text-green-400',
                    milestone.impact === 'medium' && 'border-amber-500/30 text-amber-400',
                    milestone.impact === 'low' && 'border-gray-500/30 text-gray-400'
                  )}>
                    {milestone.impact}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(milestone.completedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="questions" className="mt-4">
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {openQuestions.map(question => (
                <Card 
                  key={question.id} 
                  className={cn(
                    'bg-gray-900/50 border-gray-800',
                    question.priority === 'urgent' && 'border-red-500/50'
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className={cn(
                        'w-5 h-5 mt-0.5',
                        question.priority === 'urgent' && 'text-red-400',
                        question.priority === 'high' && 'text-amber-400',
                        question.priority === 'medium' && 'text-blue-400',
                        question.priority === 'low' && 'text-gray-400'
                      )} />
                      <div className="flex-1">
                        <p className="text-white">{question.question}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Raised by {question.raisedBy}</span>
                          <span>{new Date(question.raisedAt).toLocaleDateString()}</span>
                          {question.assignedTo && (
                            <Badge variant="outline" className="text-xs">
                              Assigned: {question.assignedTo}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          question.priority === 'urgent' && 'bg-red-500/20 text-red-400 border-red-500/30',
                          question.priority === 'high' && 'bg-amber-500/20 text-amber-400 border-amber-500/30',
                          question.priority === 'medium' && 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                          question.priority === 'low' && 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                        )}
                      >
                        {question.priority}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProjectSummary;
