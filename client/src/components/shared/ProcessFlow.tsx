import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  Users,
  FileText,
  Zap,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ProcessStep {
  id: string;
  title: string;
  description: string;
  owner: string;
  duration: string;
  inputs: string[];
  outputs: string[];
  tools: string[];
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  notes?: string;
}

interface ProcessFlowProps {
  title?: string;
  description?: string;
  steps?: ProcessStep[];
  onStepClick?: (step: ProcessStep) => void;
}

// Default Project Genesis process
const defaultSteps: ProcessStep[] = [
  {
    id: '1',
    title: 'Initial Consultation',
    description: 'Understand the business idea, goals, and constraints through structured conversation',
    owner: 'Chief of Staff',
    duration: '30-60 min',
    inputs: ['Business idea', 'Initial goals', 'Available resources'],
    outputs: ['Project brief', 'Initial requirements'],
    tools: ['Chief of Staff Chat', 'Questionnaire'],
    status: 'completed'
  },
  {
    id: '2',
    title: 'Market Research',
    description: 'Analyze market size, competition, and opportunity using AI SME experts',
    owner: 'Strategy SME',
    duration: '2-4 hours',
    inputs: ['Project brief', 'Industry context'],
    outputs: ['Market analysis report', 'Competitive landscape', 'TAM/SAM/SOM'],
    tools: ['Strategy Expert', 'Market Research Tools'],
    status: 'completed'
  },
  {
    id: '3',
    title: 'Business Model Design',
    description: 'Define value proposition, revenue model, and key metrics',
    owner: 'Finance SME',
    duration: '2-3 hours',
    inputs: ['Market analysis', 'Project brief'],
    outputs: ['Business model canvas', 'Revenue projections', 'Unit economics'],
    tools: ['Finance Expert', 'Financial Modeling'],
    status: 'in_progress'
  },
  {
    id: '4',
    title: 'Go-to-Market Strategy',
    description: 'Develop launch plan, channel strategy, and marketing approach',
    owner: 'Marketing SME',
    duration: '3-4 hours',
    inputs: ['Business model', 'Target customer profile'],
    outputs: ['GTM blueprint', 'Channel strategy', 'Launch timeline'],
    tools: ['Marketing Expert', 'GTM Blueprint'],
    status: 'not_started'
  },
  {
    id: '5',
    title: 'Financial Planning',
    description: 'Create detailed financial projections and funding requirements',
    owner: 'Finance SME',
    duration: '4-6 hours',
    inputs: ['Business model', 'GTM strategy'],
    outputs: ['Financial model', 'Funding requirements', 'Milestone plan'],
    tools: ['Finance Expert', 'Financial Templates'],
    status: 'not_started'
  },
  {
    id: '6',
    title: 'Pitch Deck Creation',
    description: 'Compile all insights into investor-ready presentation',
    owner: 'Chief of Staff',
    duration: '4-8 hours',
    inputs: ['All previous outputs'],
    outputs: ['Pitch deck', 'Executive summary', 'One-pager'],
    tools: ['Slide Generator', 'Document Templates'],
    status: 'not_started'
  },
  {
    id: '7',
    title: 'Review & Refinement',
    description: 'Expert review and iteration based on feedback',
    owner: 'Jim Short (Stakeholder)',
    duration: '2-4 hours',
    inputs: ['Complete deliverables'],
    outputs: ['Refined materials', 'Action items', 'Final approval'],
    tools: ['Jim Short Expert', 'Review Checklist'],
    status: 'not_started'
  }
];

const statusConfig = {
  not_started: { color: 'text-gray-400', bg: 'bg-gray-500/20', icon: Circle, label: 'Not Started' },
  in_progress: { color: 'text-amber-400', bg: 'bg-amber-500/20', icon: Clock, label: 'In Progress' },
  completed: { color: 'text-green-400', bg: 'bg-green-500/20', icon: CheckCircle2, label: 'Completed' },
  blocked: { color: 'text-red-400', bg: 'bg-red-500/20', icon: AlertTriangle, label: 'Blocked' }
};

export function ProcessFlow({ 
  title = 'Project Genesis Process',
  description = 'Visual guide to the end-to-end project development workflow',
  steps = defaultSteps,
  onStepClick
}: ProcessFlowProps) {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const progress = Math.round((completedSteps / steps.length) * 100);

  const exportFlow = () => {
    const markdown = `# ${title}

${description}

## Progress: ${completedSteps}/${steps.length} steps (${progress}%)

${steps.map((step, index) => `
### Step ${index + 1}: ${step.title}
**Status:** ${statusConfig[step.status].label}
**Owner:** ${step.owner}
**Duration:** ${step.duration}

${step.description}

**Inputs:**
${step.inputs.map(i => `- ${i}`).join('\n')}

**Outputs:**
${step.outputs.map(o => `- ${o}`).join('\n')}

**Tools:**
${step.tools.map(t => `- ${t}`).join('\n')}
${step.notes ? `\n**Notes:** ${step.notes}` : ''}
`).join('\n---\n')}
`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'process-flow.md';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Process flow exported');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#E91E8C]" />
                {title}
              </CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={exportFlow}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="text-white">{completedSteps}/{steps.length} steps ({progress}%)</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#E91E8C] to-purple-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Process Steps */}
      <div className="relative">
        {/* Connecting Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-700" />

        <div className="space-y-4">
          {steps.map((step, index) => {
            const config = statusConfig[step.status];
            const Icon = config.icon;
            const isExpanded = expandedStep === step.id;
            const isLast = index === steps.length - 1;

            return (
              <div key={step.id} className="relative">
                {/* Step Number Circle */}
                <div className={cn(
                  'absolute left-0 w-12 h-12 rounded-full flex items-center justify-center z-10',
                  config.bg
                )}>
                  <Icon className={cn('w-6 h-6', config.color)} />
                </div>

                {/* Step Card */}
                <Card 
                  className={cn(
                    'ml-16 bg-gray-900/50 border-gray-800 cursor-pointer transition-all',
                    isExpanded && 'border-[#E91E8C]/50'
                  )}
                  onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Step {index + 1}</span>
                          <Badge variant="outline" className={cn(config.bg, config.color, 'border-0')}>
                            {config.label}
                          </Badge>
                        </div>
                        <CardTitle className="text-white text-lg mt-1">{step.title}</CardTitle>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <CardDescription>{step.description}</CardDescription>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {/* Meta Info */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Owner:</span>
                            <span className="text-white">{step.owner}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Duration:</span>
                            <span className="text-white">{step.duration}</span>
                          </div>
                        </div>

                        {/* Tools */}
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Tools:</p>
                          <div className="flex flex-wrap gap-2">
                            {step.tools.map((tool, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {tool}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Inputs & Outputs */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="p-3 bg-gray-800/50 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-2">Inputs:</p>
                          <ul className="space-y-1">
                            {step.inputs.map((input, i) => (
                              <li key={i} className="text-sm text-white flex items-center gap-2">
                                <ArrowRight className="w-3 h-3 text-cyan-400" />
                                {input}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="p-3 bg-gray-800/50 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-2">Outputs:</p>
                          <ul className="space-y-1">
                            {step.outputs.map((output, i) => (
                              <li key={i} className="text-sm text-white flex items-center gap-2">
                                <FileText className="w-3 h-3 text-green-400" />
                                {output}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {step.notes && (
                        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                          <p className="text-sm text-amber-200">{step.notes}</p>
                        </div>
                      )}

                      <Button 
                        className="mt-4 w-full"
                        variant={step.status === 'completed' ? 'outline' : 'default'}
                        onClick={(e) => {
                          e.stopPropagation();
                          onStepClick?.(step);
                        }}
                      >
                        {step.status === 'completed' ? 'View Details' : 'Start This Step'}
                      </Button>
                    </CardContent>
                  )}
                </Card>

                {/* Arrow to next step */}
                {!isLast && (
                  <div className="absolute left-6 -bottom-2 transform -translate-x-1/2">
                    <ArrowRight className="w-4 h-4 text-gray-600 rotate-90" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ProcessFlow;
