import { useState } from 'react';
import { 
  FileText, Plus, Copy, Edit, Trash2, ChevronRight, 
  Lightbulb, Rocket, Code, Target, Settings, Heart, Trophy,
  CheckCircle2, Clock, Users, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

// Value Chain Phase type
export type ValueChainPhase = 
  | 'ideation' 
  | 'innovation' 
  | 'development' 
  | 'go_to_market' 
  | 'operations' 
  | 'retention' 
  | 'exit';

// Blueprint status
export type BlueprintStatus = 'draft' | 'in_progress' | 'review' | 'approved' | 'archived';

// Blueprint template structure
export interface BlueprintSection {
  id: string;
  title: string;
  description: string;
  required: boolean;
  content?: string;
  completed: boolean;
}

export interface BlueprintTemplate {
  id: string;
  name: string;
  description: string;
  phase: ValueChainPhase;
  sections: BlueprintSection[];
  estimatedDuration: string;
  requiredExperts: string[];
  qualityChecks: string[];
}

export interface Blueprint {
  id: string;
  templateId: string;
  projectId: string;
  projectName: string;
  name: string;
  phase: ValueChainPhase;
  status: BlueprintStatus;
  sections: BlueprintSection[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  version: number;
}

// Phase configuration
const phaseConfig: Record<ValueChainPhase, { 
  label: string; 
  color: string; 
  icon: React.ReactNode;
  description: string;
}> = {
  ideation: { 
    label: 'Ideation', 
    color: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
    icon: <Lightbulb className="w-5 h-5" />,
    description: 'Capture and validate initial concepts'
  },
  innovation: { 
    label: 'Innovation', 
    color: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
    icon: <Rocket className="w-5 h-5" />,
    description: 'Develop business case and feasibility'
  },
  development: { 
    label: 'Development', 
    color: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
    icon: <Code className="w-5 h-5" />,
    description: 'Build and test the solution'
  },
  go_to_market: { 
    label: 'Go-to-Market', 
    color: 'text-green-400 bg-green-500/20 border-green-500/30',
    icon: <Target className="w-5 h-5" />,
    description: 'Launch and acquire customers'
  },
  operations: { 
    label: 'Operations', 
    color: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30',
    icon: <Settings className="w-5 h-5" />,
    description: 'Scale and optimize delivery'
  },
  retention: { 
    label: 'Retention', 
    color: 'text-pink-400 bg-pink-500/20 border-pink-500/30',
    icon: <Heart className="w-5 h-5" />,
    description: 'Maximize customer lifetime value'
  },
  exit: { 
    label: 'Exit', 
    color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
    icon: <Trophy className="w-5 h-5" />,
    description: 'Realize value through strategic exit'
  },
};

// Status configuration
const statusConfig: Record<BlueprintStatus, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: 'Draft', color: 'text-foreground/70 bg-gray-500/20', icon: <Edit className="w-3 h-3" /> },
  in_progress: { label: 'In Progress', color: 'text-blue-400 bg-blue-500/20', icon: <Clock className="w-3 h-3" /> },
  review: { label: 'In Review', color: 'text-yellow-400 bg-yellow-500/20', icon: <Users className="w-3 h-3" /> },
  approved: { label: 'Approved', color: 'text-green-400 bg-green-500/20', icon: <CheckCircle2 className="w-3 h-3" /> },
  archived: { label: 'Archived', color: 'text-foreground/60 bg-gray-600/20', icon: <FileText className="w-3 h-3" /> },
};

// Default templates for each phase
export const defaultTemplates: BlueprintTemplate[] = [
  // Phase 1: Ideation
  {
    id: 'ideation-concept',
    name: 'Concept Capture',
    description: 'Document initial idea with problem statement and proposed solution',
    phase: 'ideation',
    sections: [
      { id: 's1', title: 'Problem Statement', description: 'What problem are we solving?', required: true, completed: false },
      { id: 's2', title: 'Target Audience', description: 'Who experiences this problem?', required: true, completed: false },
      { id: 's3', title: 'Proposed Solution', description: 'How will we solve it?', required: true, completed: false },
      { id: 's4', title: 'Initial Assumptions', description: 'What assumptions are we making?', required: true, completed: false },
      { id: 's5', title: 'Success Metrics', description: 'How will we measure success?', required: false, completed: false },
    ],
    estimatedDuration: '1-2 days',
    requiredExperts: ['Strategy & Innovation', 'Market Research'],
    qualityChecks: ['Problem clearly defined', 'Target audience identified', 'Solution addresses problem'],
  },
  {
    id: 'ideation-validation',
    name: 'Idea Validation',
    description: 'Validate concept with market research and expert feedback',
    phase: 'ideation',
    sections: [
      { id: 's1', title: 'Market Research Summary', description: 'What does the market data tell us?', required: true, completed: false },
      { id: 's2', title: 'Competitive Analysis', description: 'Who else is solving this?', required: true, completed: false },
      { id: 's3', title: 'Expert Panel Feedback', description: 'What do SMEs say?', required: true, completed: false },
      { id: 's4', title: 'Risk Assessment', description: 'What could go wrong?', required: true, completed: false },
      { id: 's5', title: 'Go/No-Go Recommendation', description: 'Should we proceed?', required: true, completed: false },
    ],
    estimatedDuration: '3-5 days',
    requiredExperts: ['Market Research', 'Risk Assessment', 'Industry Expert'],
    qualityChecks: ['Market size validated', 'Competition mapped', 'Risks identified'],
  },

  // Phase 2: Innovation
  {
    id: 'innovation-business-case',
    name: 'Business Case',
    description: 'Comprehensive business case with financial projections',
    phase: 'innovation',
    sections: [
      { id: 's1', title: 'Executive Summary', description: 'High-level overview', required: true, completed: false },
      { id: 's2', title: 'Value Proposition', description: 'Unique value we deliver', required: true, completed: false },
      { id: 's3', title: 'Financial Projections', description: '3-5 year financial model', required: true, completed: false },
      { id: 's4', title: 'Resource Requirements', description: 'Team, budget, timeline', required: true, completed: false },
      { id: 's5', title: 'Risk Mitigation Plan', description: 'How we address key risks', required: true, completed: false },
      { id: 's6', title: 'Implementation Roadmap', description: 'Key milestones and phases', required: true, completed: false },
    ],
    estimatedDuration: '1-2 weeks',
    requiredExperts: ['Financial Analysis', 'Strategy', 'Operations'],
    qualityChecks: ['ROI calculated', 'Resources identified', 'Timeline realistic'],
  },
  {
    id: 'innovation-pre-mortem',
    name: 'Pre-Mortem Analysis',
    description: 'Proactive failure analysis with Red Team review',
    phase: 'innovation',
    sections: [
      { id: 's1', title: 'Failure Scenarios', description: 'How could this fail?', required: true, completed: false },
      { id: 's2', title: 'Root Cause Analysis', description: 'Why would each failure occur?', required: true, completed: false },
      { id: 's3', title: 'Prevention Strategies', description: 'How do we prevent failures?', required: true, completed: false },
      { id: 's4', title: 'Contingency Plans', description: 'What if prevention fails?', required: true, completed: false },
      { id: 's5', title: 'Red Team Challenges', description: 'Devil\'s advocate perspective', required: true, completed: false },
    ],
    estimatedDuration: '3-5 days',
    requiredExperts: ['Risk Assessment', 'Red Team Panel', 'Operations'],
    qualityChecks: ['All major risks identified', 'Mitigations documented', 'Red Team signed off'],
  },

  // Phase 3: Development
  {
    id: 'development-technical-spec',
    name: 'Technical Specification',
    description: 'Detailed technical requirements and architecture',
    phase: 'development',
    sections: [
      { id: 's1', title: 'System Architecture', description: 'High-level system design', required: true, completed: false },
      { id: 's2', title: 'Technical Requirements', description: 'Functional and non-functional requirements', required: true, completed: false },
      { id: 's3', title: 'Data Model', description: 'Database schema and data flows', required: true, completed: false },
      { id: 's4', title: 'API Specifications', description: 'Interface definitions', required: false, completed: false },
      { id: 's5', title: 'Security Requirements', description: 'Security controls and compliance', required: true, completed: false },
      { id: 's6', title: 'Testing Strategy', description: 'Test plan and coverage', required: true, completed: false },
    ],
    estimatedDuration: '1-2 weeks',
    requiredExperts: ['Technology & AI', 'Security', 'Architecture'],
    qualityChecks: ['Architecture reviewed', 'Security approved', 'Test plan complete'],
  },
  {
    id: 'development-sprint-plan',
    name: 'Sprint Planning',
    description: 'Agile sprint planning and task breakdown',
    phase: 'development',
    sections: [
      { id: 's1', title: 'Sprint Goals', description: 'What will we achieve?', required: true, completed: false },
      { id: 's2', title: 'User Stories', description: 'Detailed user stories with acceptance criteria', required: true, completed: false },
      { id: 's3', title: 'Task Breakdown', description: 'Individual tasks and estimates', required: true, completed: false },
      { id: 's4', title: 'Dependencies', description: 'External dependencies and blockers', required: true, completed: false },
      { id: 's5', title: 'Definition of Done', description: 'Completion criteria', required: true, completed: false },
    ],
    estimatedDuration: '1 day',
    requiredExperts: ['Project Management', 'Technology'],
    qualityChecks: ['Stories estimated', 'Dependencies mapped', 'Team capacity confirmed'],
  },

  // Phase 4: Go-to-Market
  {
    id: 'gtm-launch-plan',
    name: 'Launch Plan',
    description: 'Comprehensive go-to-market launch strategy',
    phase: 'go_to_market',
    sections: [
      { id: 's1', title: 'Launch Timeline', description: 'Key dates and milestones', required: true, completed: false },
      { id: 's2', title: 'Target Segments', description: 'Initial customer segments', required: true, completed: false },
      { id: 's3', title: 'Messaging & Positioning', description: 'Key messages and value props', required: true, completed: false },
      { id: 's4', title: 'Channel Strategy', description: 'Marketing and sales channels', required: true, completed: false },
      { id: 's5', title: 'Launch Metrics', description: 'Success KPIs', required: true, completed: false },
      { id: 's6', title: 'Risk Contingencies', description: 'Launch risk mitigation', required: true, completed: false },
    ],
    estimatedDuration: '1-2 weeks',
    requiredExperts: ['Marketing', 'Sales', 'Product'],
    qualityChecks: ['Timeline approved', 'Messaging tested', 'Channels ready'],
  },
  {
    id: 'gtm-sales-playbook',
    name: 'Sales Playbook',
    description: 'Sales process and objection handling guide',
    phase: 'go_to_market',
    sections: [
      { id: 's1', title: 'Ideal Customer Profile', description: 'Who to target', required: true, completed: false },
      { id: 's2', title: 'Sales Process', description: 'Step-by-step sales flow', required: true, completed: false },
      { id: 's3', title: 'Objection Handling', description: 'Common objections and responses', required: true, completed: false },
      { id: 's4', title: 'Competitive Positioning', description: 'How to win against competitors', required: true, completed: false },
      { id: 's5', title: 'Pricing & Packaging', description: 'Pricing strategy and tiers', required: true, completed: false },
    ],
    estimatedDuration: '1 week',
    requiredExperts: ['Sales', 'Marketing', 'Product'],
    qualityChecks: ['ICP validated', 'Process documented', 'Team trained'],
  },

  // Phase 5: Operations
  {
    id: 'ops-runbook',
    name: 'Operations Runbook',
    description: 'Standard operating procedures and escalation paths',
    phase: 'operations',
    sections: [
      { id: 's1', title: 'Daily Operations', description: 'Routine tasks and checks', required: true, completed: false },
      { id: 's2', title: 'Incident Response', description: 'How to handle issues', required: true, completed: false },
      { id: 's3', title: 'Escalation Matrix', description: 'Who to contact when', required: true, completed: false },
      { id: 's4', title: 'SLA Definitions', description: 'Service level agreements', required: true, completed: false },
      { id: 's5', title: 'Monitoring & Alerts', description: 'What to monitor and alert on', required: true, completed: false },
    ],
    estimatedDuration: '1 week',
    requiredExperts: ['Operations', 'Technology', 'Customer Success'],
    qualityChecks: ['Procedures documented', 'Escalations defined', 'SLAs agreed'],
  },

  // Phase 6: Retention
  {
    id: 'retention-success-plan',
    name: 'Customer Success Plan',
    description: 'Customer retention and expansion strategy',
    phase: 'retention',
    sections: [
      { id: 's1', title: 'Health Score Model', description: 'How to measure customer health', required: true, completed: false },
      { id: 's2', title: 'Engagement Playbook', description: 'Touchpoint strategy', required: true, completed: false },
      { id: 's3', title: 'Expansion Opportunities', description: 'Upsell and cross-sell paths', required: true, completed: false },
      { id: 's4', title: 'Churn Prevention', description: 'Early warning signs and interventions', required: true, completed: false },
      { id: 's5', title: 'Renewal Process', description: 'Renewal timeline and approach', required: true, completed: false },
    ],
    estimatedDuration: '1 week',
    requiredExperts: ['Customer Success', 'Sales', 'Product'],
    qualityChecks: ['Health model validated', 'Playbook tested', 'Team trained'],
  },

  // Phase 7: Exit
  {
    id: 'exit-preparation',
    name: 'Exit Preparation',
    description: 'Strategic exit planning and preparation',
    phase: 'exit',
    sections: [
      { id: 's1', title: 'Exit Strategy Options', description: 'M&A, IPO, or other paths', required: true, completed: false },
      { id: 's2', title: 'Valuation Analysis', description: 'Current and target valuation', required: true, completed: false },
      { id: 's3', title: 'Due Diligence Readiness', description: 'Documentation and compliance', required: true, completed: false },
      { id: 's4', title: 'Potential Acquirers', description: 'Target buyer list', required: false, completed: false },
      { id: 's5', title: 'Timeline & Milestones', description: 'Exit preparation roadmap', required: true, completed: false },
    ],
    estimatedDuration: '2-4 weeks',
    requiredExperts: ['M&A', 'Legal', 'Finance'],
    qualityChecks: ['Strategy defined', 'Valuation validated', 'Documents ready'],
  },
];

// Template Card Component
interface TemplateCardProps {
  template: BlueprintTemplate;
  onUseTemplate: (template: BlueprintTemplate) => void;
}

function TemplateCard({ template, onUseTemplate }: TemplateCardProps) {
  const phase = phaseConfig[template.phase];
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-colors">
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${phase.color}`}>
              {phase.icon}
            </div>
            <div>
              <h4 className="font-medium text-white">{template.name}</h4>
              <p className="text-sm text-foreground/70 mt-1">{template.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={`${phase.color} border-0 text-xs`}>
                  {phase.label}
                </Badge>
                <span className="text-xs text-foreground/60">
                  {template.sections.length} sections • {template.estimatedDuration}
                </span>
              </div>
            </div>
          </div>
          <ChevronRight className={`w-5 h-5 text-foreground/70 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Sections */}
          <div>
            <h5 className="text-sm font-medium text-white mb-2">Sections</h5>
            <div className="space-y-1">
              {template.sections.map(section => (
                <div key={section.id} className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${section.required ? 'bg-cyan-400' : 'bg-gray-500'}`} />
                  <span className="text-foreground/80">{section.title}</span>
                  {section.required && <span className="text-xs text-cyan-400">(required)</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Required Experts */}
          <div>
            <h5 className="text-sm font-medium text-white mb-2">Required Experts</h5>
            <div className="flex flex-wrap gap-1">
              {template.requiredExperts.map(expert => (
                <Badge key={expert} variant="outline" className="text-xs border-white/20 text-foreground/80">
                  {expert}
                </Badge>
              ))}
            </div>
          </div>

          {/* Quality Checks */}
          <div>
            <h5 className="text-sm font-medium text-white mb-2">Quality Checks</h5>
            <div className="space-y-1">
              {template.qualityChecks.map((check, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-foreground/70">
                  <CheckCircle2 className="w-3 h-3 text-green-400" />
                  {check}
                </div>
              ))}
            </div>
          </div>

          <Button 
            onClick={() => onUseTemplate(template)}
            className="w-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:opacity-90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Use This Template
          </Button>
        </div>
      )}
    </div>
  );
}

// Blueprint Templates Dashboard
interface BlueprintTemplatesDashboardProps {
  projectId?: string;
  projectName?: string;
  currentPhase?: number;
  onSelectTemplate?: (template: BlueprintTemplate) => void;
  onCreateBlueprint?: (template: BlueprintTemplate, projectId: string) => void;
}

export function BlueprintTemplatesDashboard({ 
  projectId,
  projectName,
  currentPhase,
  onSelectTemplate,
  onCreateBlueprint 
}: BlueprintTemplatesDashboardProps) {
  const [selectedPhase, setSelectedPhase] = useState<ValueChainPhase | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<BlueprintTemplate | null>(null);

  const filteredTemplates = defaultTemplates.filter(template => {
    if (selectedPhase !== 'all' && template.phase !== selectedPhase) return false;
    if (searchQuery && !template.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleUseTemplate = (template: BlueprintTemplate) => {
    setSelectedTemplate(template);
    if (onSelectTemplate) {
      onSelectTemplate(template);
    }
    setShowCreateModal(true);
  };

  const handleCreateBlueprint = () => {
    if (selectedTemplate && onCreateBlueprint) {
      onCreateBlueprint(selectedTemplate, projectId || 'default-project');
      toast.success(`Blueprint created from "${selectedTemplate.name}" template`);
    }
    setShowCreateModal(false);
    setSelectedTemplate(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Blueprint Templates</h2>
          <p className="text-sm text-foreground/70">
            {projectName 
              ? `Select templates for ${projectName} (Phase ${currentPhase || 1})`
              : 'Standardized process documents for each Value Chain phase'
            }
          </p>
        </div>
        <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
          {defaultTemplates.length} templates
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-64 bg-white/5 border-white/10 text-white placeholder:text-foreground/60"
        />
        <select 
          value={selectedPhase}
          onChange={(e) => setSelectedPhase(e.target.value as ValueChainPhase | 'all')}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
        >
          <option value="all">All Phases</option>
          {Object.entries(phaseConfig).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>
      </div>

      {/* Phase Overview */}
      <div className="grid grid-cols-7 gap-2">
        {Object.entries(phaseConfig).map(([key, config]) => {
          const count = defaultTemplates.filter(t => t.phase === key).length;
          return (
            <button
              key={key}
              onClick={() => setSelectedPhase(key as ValueChainPhase)}
              className={`p-3 rounded-xl border transition-all ${
                selectedPhase === key 
                  ? `${config.color} border-current` 
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                {config.icon}
                <span className="text-xs text-white">{config.label}</span>
                <span className="text-xs text-foreground/60">{count} templates</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map(template => (
          <TemplateCard
            key={template.id}
            template={template}
            onUseTemplate={handleUseTemplate}
          />
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12 text-foreground/70">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No templates found for the selected filters.</p>
        </div>
      )}

      {/* Create Blueprint Modal */}
      {showCreateModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl border border-white/10 max-w-lg w-full p-6">
            <h3 className="text-lg font-bold text-white mb-4">Create Blueprint</h3>
            <p className="text-foreground/70 mb-4">
              Create a new blueprint from the "{selectedTemplate.name}" template.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-foreground/70 mb-1 block">Blueprint Name</label>
                <Input 
                  defaultValue={selectedTemplate.name}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-foreground/70 mb-1 block">Project</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white">
                  <option value="boundless">Sample Project AI</option>
                  <option value="celadon">Project A</option>
                  <option value="perfect-dxb">Perfect DXB</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 border-white/20 text-foreground/80"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateBlueprint}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:opacity-90"
              >
                Create Blueprint
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BlueprintTemplatesDashboard;
