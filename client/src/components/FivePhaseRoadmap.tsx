import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  Target,
  Rocket,
  Users,
  Building2,
  Globe,
  Zap,
  Brain,
  FileText,
  Shield,
  Briefcase,
  CreditCard,
  Bot,
  Sparkles
} from 'lucide-react';

interface PhaseProject {
  name: string;
  description: string;
  status: 'complete' | 'in_progress' | 'planned';
}

interface Phase {
  id: number;
  name: string;
  timeline: string;
  objective: string;
  status: 'current' | 'complete' | 'upcoming';
  progress: number;
  icon: any;
  color: string;
  deliverables: { name: string; status: 'complete' | 'in_progress' | 'planned'; description: string }[];
  projects: PhaseProject[];
  milestones: string[];
}

const PHASES: Phase[] = [
  {
    id: 1,
    name: 'Foundation',
    timeline: 'Q4 2025 to Q1 2026',
    objective: 'Establish core platform capabilities and validate product market fit',
    status: 'current',
    progress: 75,
    icon: Target,
    color: 'cyan',
    deliverables: [
      { name: 'Virtual Chief of Staff', status: 'complete', description: 'AI powered executive assistant with learning capability' },
      { name: 'AI SME Expert Panel', status: 'complete', description: 'Eight domain experts (Finance, Legal, Strategy, Operations, Marketing, People, Technology, Risk)' },
      { name: 'Morning Signal', status: 'complete', description: 'Daily executive briefing system' },
      { name: 'Document Generation', status: 'in_progress', description: 'Branded templates and automated report creation' },
      { name: 'Quality Assurance', status: 'complete', description: 'Jim Short review system for output validation' },
    ],
    projects: [
      { name: 'Founder Story Generator', status: 'complete', description: 'Business-centric narrative framework for investor pitches and stakeholder engagement' }
    ],
    milestones: ['Core platform operational', 'Initial user testing complete', 'Feedback loop established', 'Quality standards defined']
  },
  {
    id: 2,
    name: 'Enhancement',
    timeline: 'Q2 2026 to Q3 2026',
    objective: 'Expand capabilities and prepare for market launch',
    status: 'upcoming',
    progress: 0,
    icon: Zap,
    color: 'purple',
    deliverables: [
      { name: 'Voice Integration', status: 'planned', description: 'ElevenLabs integration for audio briefings and interaction' },
      { name: 'Digital Twin', status: 'planned', description: 'Simulation capability for scenario planning' },
      { name: 'Learning System', status: 'planned', description: 'Pattern recognition and preference modeling' },
      { name: 'Integration Framework', status: 'planned', description: 'Connections to external tools and data sources' },
      { name: 'Mobile Experience', status: 'planned', description: 'Responsive design and mobile optimization' },
    ],
    projects: [
      { name: 'Development Velocity Enhancement', status: 'planned', description: 'Accelerate speed of development and iteration cycles, master productivity tools at granular level' }
    ],
    milestones: ['Voice capability live', 'Digital Twin operational', 'First external integrations complete', 'Beta users onboarded']
  },
  {
    id: 3,
    name: 'Market Entry',
    timeline: 'Q4 2026 to Q1 2027',
    objective: 'Launch to market and acquire initial paying customers',
    status: 'upcoming',
    progress: 0,
    icon: Rocket,
    color: 'emerald',
    deliverables: [
      { name: 'Subscription System', status: 'planned', description: 'Stripe integration with tiered pricing' },
      { name: 'Customer Onboarding', status: 'planned', description: 'Guided setup and personalization flow' },
      { name: 'Support Infrastructure', status: 'planned', description: 'Help documentation and support channels' },
      { name: 'Marketing Launch', status: 'planned', description: 'Brand awareness campaign and content strategy' },
      { name: 'Sales Enablement', status: 'planned', description: 'Pitch materials and demo capability' },
    ],
    projects: [
      { name: 'AI SME Enhancement (IP Creation)', status: 'planned', description: 'Massive data absorption from real world experts to create deep, authentic SME personas' },
      { name: 'Quality Management System Integration', status: 'planned', description: 'Plug into company QMS to assess processes, identify gaps, generate KPI scorecards, and automate improvements' },
      { name: 'Persephone-AI: The AI Genius Board', status: 'planned', description: 'Virtual NED/Steering Committee of 14 AI leaders providing strategic oversight and growth accountability' }
    ],
    milestones: ['First paying customers', 'Subscription revenue initiated', 'Customer success metrics established', 'Market positioning validated']
  },
  {
    id: 4,
    name: 'Personal & Lifestyle',
    timeline: 'Q2 2027 to Q4 2027',
    objective: 'Expand into personal life management with lifestyle SME experts',
    status: 'upcoming',
    progress: 0,
    icon: Users,
    color: 'pink',
    deliverables: [
      { name: 'Lifestyle SME Experts', status: 'planned', description: 'Travel, Dining, Wellness, Home, Concierge specialists' },
      { name: 'Autonomous Booking', status: 'planned', description: 'Restaurant and service booking with full workflow' },
      { name: 'Agent to Agent Communication', status: 'planned', description: 'Chief of Staff interaction with external AI systems' },
      { name: 'Personal Calendar Integration', status: 'planned', description: 'Unified business and personal scheduling' },
      { name: 'Recommendation Engine', status: 'planned', description: 'Personalized suggestions based on preferences' },
    ],
    projects: [],
    milestones: ['Personal tier launched', 'Lifestyle experts operational', 'First autonomous bookings complete', 'Agent communication framework established']
  },
  {
    id: 5,
    name: 'In-house Productivity Apps',
    timeline: 'Q1 2028 to Q3 2028',
    objective: 'Build proprietary productivity tools to our own standards',
    status: 'upcoming',
    progress: 0,
    icon: Briefcase,
    color: 'amber',
    deliverables: [
      { name: 'Project Management', status: 'planned', description: 'CEPHO native project tracking and delivery' },
      { name: 'Document Collaboration', status: 'planned', description: 'Real time editing with AI assistance' },
      { name: 'Communication Hub', status: 'planned', description: 'Unified messaging with AI summarization' },
      { name: 'Analytics Dashboard', status: 'planned', description: 'Business intelligence and reporting' },
      { name: 'Workflow Automation', status: 'planned', description: 'Custom automation builder' },
    ],
    projects: [
      { name: 'Autonomous Job Application Management', status: 'planned', description: 'Chief of Staff handles entire job search pipeline: sourcing, applications, CV tailoring, communications, assessments, and interviews' }
    ],
    milestones: ['First productivity app launched', 'Integration with core platform complete', 'Enterprise pilot customers', 'Product suite defined']
  },
  {
    id: 6,
    name: 'Commercialization',
    timeline: 'Q4 2028 onwards',
    objective: 'Scale the business and prepare for exit',
    status: 'upcoming',
    progress: 0,
    icon: Globe,
    color: 'blue',
    deliverables: [
      { name: 'Enterprise Offering', status: 'planned', description: 'White label and API access for large organizations' },
      { name: 'Global Expansion', status: 'planned', description: 'Multi language and multi region deployment' },
      { name: 'Partnership Network', status: 'planned', description: 'Strategic alliances with complementary platforms' },
      { name: 'Exit Preparation', status: 'planned', description: 'Financial optimization and governance for exit' },
    ],
    projects: [
      { name: 'Digital Twin Management Agency', status: 'planned', description: 'B2B service helping companies create and manage their digital twins' }
    ],
    milestones: ['Enterprise customers acquired', 'International presence established', 'Strategic partnerships active', 'Exit readiness achieved']
  }
];

const getStatusBadge = (status: 'complete' | 'in_progress' | 'planned') => {
  switch (status) {
    case 'complete':
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Complete</Badge>;
    case 'in_progress':
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">In Progress</Badge>;
    case 'planned':
      return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Planned</Badge>;
  }
};

const getPhaseStatusBadge = (status: 'current' | 'complete' | 'upcoming') => {
  switch (status) {
    case 'current':
      return <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">Current Phase</Badge>;
    case 'complete':
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Complete</Badge>;
    case 'upcoming':
      return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Upcoming</Badge>;
  }
};

const getColorClasses = (color: string) => {
  const colors: Record<string, { bg: string; border: string; text: string; gradient: string }> = {
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', gradient: 'from-cyan-500/20 to-cyan-500/5' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', gradient: 'from-purple-500/20 to-purple-500/5' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', gradient: 'from-emerald-500/20 to-emerald-500/5' },
    pink: { bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-400', gradient: 'from-pink-500/20 to-pink-500/5' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', gradient: 'from-amber-500/20 to-amber-500/5' },
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', gradient: 'from-blue-500/20 to-blue-500/5' },
  };
  return colors[color] || colors.cyan;
};

export function FivePhaseRoadmap() {
  const [expandedPhases, setExpandedPhases] = useState<number[]>([1]); // Default: show current phase

  const togglePhase = (phaseId: number) => {
    setExpandedPhases(prev =>
      prev.includes(phaseId)
        ? prev.filter(id => id !== phaseId)
        : [...prev, phaseId]
    );
  };

  const expandAll = () => setExpandedPhases(PHASES.map(p => p.id));
  const collapseAll = () => setExpandedPhases([]);

  // Calculate overall progress
  const totalDeliverables = PHASES.reduce((acc, p) => acc + p.deliverables.length, 0);
  const completedDeliverables = PHASES.reduce((acc, p) => acc + p.deliverables.filter(d => d.status === 'complete').length, 0);
  const overallProgress = Math.round((completedDeliverables / totalDeliverables) * 100);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">6</div>
              <div className="text-sm text-muted-foreground">Total Phases</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400">1</div>
              <div className="text-sm text-muted-foreground">Current Phase</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{completedDeliverables}</div>
              <div className="text-sm text-muted-foreground">Deliverables Complete</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">{overallProgress}%</div>
              <div className="text-sm text-muted-foreground">Overall Progress</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#E91E8C]" />
              Development Roadmap Progress
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={expandAll} className="border-gray-700 hover:bg-gray-800">
                Expand All
              </Button>
              <Button variant="outline" size="sm" onClick={collapseAll} className="border-gray-700 hover:bg-gray-800">
                Collapse All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{completedDeliverables} of {totalDeliverables} deliverables complete</span>
              <span className="text-white">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Collapsible Phases */}
      <div className="space-y-4">
        {PHASES.map((phase) => {
          const isExpanded = expandedPhases.includes(phase.id);
          const colorClasses = getColorClasses(phase.color);
          const PhaseIcon = phase.icon;

          return (
            <Card 
              key={phase.id} 
              className={`bg-gradient-to-r ${colorClasses.gradient} ${colorClasses.border} border transition-all duration-300`}
            >
              {/* Phase Header - Always Visible */}
              <div 
                className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => togglePhase(phase.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${colorClasses.bg} ${colorClasses.border} border flex items-center justify-center`}>
                      <PhaseIcon className={`h-6 w-6 ${colorClasses.text}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-white">Phase {phase.id}: {phase.name}</h3>
                        {getPhaseStatusBadge(phase.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{phase.timeline}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {phase.status === 'current' && (
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Progress</div>
                        <div className={`text-lg font-bold ${colorClasses.text}`}>{phase.progress}%</div>
                      </div>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Expandable Content */}
              {isExpanded && (
                <CardContent className="pt-0 pb-6 px-6 border-t border-white/10">
                  <div className="space-y-6 mt-4">
                    {/* Objective */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Objective</h4>
                      <p className="text-white">{phase.objective}</p>
                    </div>

                    {/* Deliverables */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">Key Deliverables</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {phase.deliverables.map((deliverable, idx) => (
                          <div key={idx} className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                {deliverable.status === 'complete' ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                                ) : deliverable.status === 'in_progress' ? (
                                  <Clock className="h-4 w-4 text-blue-400 flex-shrink-0" />
                                ) : (
                                  <Target className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                )}
                                <span className="text-sm font-medium text-white">{deliverable.name}</span>
                              </div>
                              {getStatusBadge(deliverable.status)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 ml-6">{deliverable.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Key Projects */}
                    {phase.projects.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-3">Key Projects</h4>
                        <div className="space-y-3">
                          {phase.projects.map((project, idx) => (
                            <div key={idx} className={`p-4 rounded-lg border ${colorClasses.bg} ${colorClasses.border}`}>
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <Brain className={`h-5 w-5 ${colorClasses.text} flex-shrink-0`} />
                                  <span className="font-medium text-white">{project.name}</span>
                                </div>
                                {getStatusBadge(project.status)}
                              </div>
                              <p className="text-sm text-muted-foreground mt-2 ml-7">{project.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Milestones */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">Key Milestones</h4>
                      <div className="flex flex-wrap gap-2">
                        {phase.milestones.map((milestone, idx) => (
                          <Badge key={idx} variant="outline" className="border-gray-600 text-gray-300">
                            {milestone}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default FivePhaseRoadmap;
