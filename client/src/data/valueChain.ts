/**
 * Value Chain Phases - Based on Productivity Engine Framework
 * 
 * The seven-phase value chain represents the complete lifecycle
 * of a business initiative from ideation through exit.
 */

export interface ValueChainPhase {
  id: number;
  name: string;
  shortName: string;
  description: string;
  objectives: string[];
  keyActivities: string[];
  deliverables: string[];
  qualityGateChecks: string[];
  recommendedExperts: string[]; // Expert categories
  estimatedDuration: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const valueChainPhases: ValueChainPhase[] = [
  {
    id: 1,
    name: 'Ideation',
    shortName: 'Ideate',
    description: 'Generate and capture initial business ideas, concepts, and opportunities',
    objectives: [
      'Identify market opportunities and gaps',
      'Generate diverse solution concepts',
      'Capture and document initial ideas',
      'Preliminary feasibility assessment'
    ],
    keyActivities: [
      'Market research and trend analysis',
      'Brainstorming sessions with AI-SME panels',
      'Competitive landscape mapping',
      'Initial problem-solution fit validation',
      'Voice note capture and AI extraction'
    ],
    deliverables: [
      'Idea canvas document',
      'Initial market assessment',
      'Competitive analysis summary',
      'Opportunity scoring matrix'
    ],
    qualityGateChecks: [
      'Market opportunity validated',
      'Problem clearly defined',
      'Initial solution concept documented',
      'Key assumptions identified'
    ],
    recommendedExperts: ['Entrepreneurship & Strategy', 'Investment & Finance', 'Technology & AI'],
    estimatedDuration: '1-2 weeks',
    icon: '💡',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30'
  },
  {
    id: 2,
    name: 'Innovation',
    shortName: 'Innovate',
    description: 'Develop and refine the concept into a viable business proposition',
    objectives: [
      'Validate problem-solution fit',
      'Develop unique value proposition',
      'Create initial business model',
      'Identify key differentiators'
    ],
    keyActivities: [
      'Customer discovery interviews',
      'Value proposition design',
      'Business model canvas development',
      'IP and patent landscape review',
      'Technical feasibility assessment'
    ],
    deliverables: [
      'Value proposition document',
      'Business model canvas',
      'Customer persona profiles',
      'Technical feasibility report',
      'IP strategy outline'
    ],
    qualityGateChecks: [
      'Value proposition validated with customers',
      'Business model economics viable',
      'Technical approach confirmed',
      'IP position assessed'
    ],
    recommendedExperts: ['Entrepreneurship & Strategy', 'Legal & Compliance', 'Technology & AI', 'Marketing & Brand'],
    estimatedDuration: '2-4 weeks',
    icon: '🚀',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30'
  },
  {
    id: 3,
    name: 'Development',
    shortName: 'Develop',
    description: 'Build the product/service and establish operational foundations',
    objectives: [
      'Develop MVP or initial product',
      'Establish core team and processes',
      'Set up operational infrastructure',
      'Create quality management systems'
    ],
    keyActivities: [
      'Product development sprints',
      'Team recruitment and onboarding',
      'Process documentation',
      'Quality system implementation',
      'Supplier/partner negotiations'
    ],
    deliverables: [
      'MVP or initial product',
      'Operations manual',
      'Quality management system',
      'Team structure and roles',
      'Partner agreements'
    ],
    qualityGateChecks: [
      'MVP meets core requirements',
      'Quality systems operational',
      'Team capacity confirmed',
      'Key partnerships secured'
    ],
    recommendedExperts: ['Technology & AI', 'Operations & Supply Chain', 'HR & Talent', 'Legal & Compliance'],
    estimatedDuration: '4-12 weeks',
    icon: '🔧',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30'
  },
  {
    id: 4,
    name: 'Go-to-Market',
    shortName: 'GTM',
    description: 'Launch the product/service and acquire initial customers',
    objectives: [
      'Execute market launch strategy',
      'Acquire first customers',
      'Establish brand presence',
      'Validate product-market fit'
    ],
    keyActivities: [
      'Marketing campaign execution',
      'Sales process development',
      'Customer onboarding optimization',
      'Brand building activities',
      'PR and media outreach'
    ],
    deliverables: [
      'Go-to-market plan',
      'Marketing collateral suite',
      'Sales playbook',
      'Customer success framework',
      'Launch metrics dashboard'
    ],
    qualityGateChecks: [
      'Launch metrics achieved',
      'Customer acquisition cost validated',
      'Initial customer feedback positive',
      'Sales pipeline established'
    ],
    recommendedExperts: ['Marketing & Brand', 'Media & Entertainment', 'Entrepreneurship & Strategy', 'Regional Specialists'],
    estimatedDuration: '4-8 weeks',
    icon: '🎯',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30'
  },
  {
    id: 5,
    name: 'Operations',
    shortName: 'Operate',
    description: 'Scale operations and optimize for efficiency and growth',
    objectives: [
      'Scale operational capacity',
      'Optimize unit economics',
      'Build sustainable processes',
      'Establish performance metrics'
    ],
    keyActivities: [
      'Process optimization',
      'Automation implementation',
      'Performance monitoring',
      'Capacity planning',
      'Cost optimization'
    ],
    deliverables: [
      'Operational KPI dashboard',
      'Process improvement roadmap',
      'Automation strategy',
      'Capacity plan',
      'Cost optimization report'
    ],
    qualityGateChecks: [
      'Unit economics positive',
      'Operational metrics on target',
      'Scalability validated',
      'Quality maintained at scale'
    ],
    recommendedExperts: ['Operations & Supply Chain', 'Technology & AI', 'Tax & Accounting', 'HR & Talent'],
    estimatedDuration: 'Ongoing',
    icon: '⚙️',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30'
  },
  {
    id: 6,
    name: 'Retention',
    shortName: 'Retain',
    description: 'Maximize customer value and build long-term relationships',
    objectives: [
      'Reduce customer churn',
      'Increase customer lifetime value',
      'Build customer advocacy',
      'Develop expansion revenue'
    ],
    keyActivities: [
      'Customer success programs',
      'Loyalty and rewards initiatives',
      'Upsell/cross-sell campaigns',
      'Community building',
      'Customer feedback loops'
    ],
    deliverables: [
      'Customer retention strategy',
      'Loyalty program design',
      'Customer health scoring',
      'Expansion revenue plan',
      'NPS improvement roadmap'
    ],
    qualityGateChecks: [
      'Churn rate within target',
      'NPS/CSAT scores improving',
      'Expansion revenue growing',
      'Customer advocacy established'
    ],
    recommendedExperts: ['Marketing & Brand', 'Operations & Supply Chain', 'Technology & AI', 'Entrepreneurship & Strategy'],
    estimatedDuration: 'Ongoing',
    icon: '💎',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30'
  },
  {
    id: 7,
    name: 'Exit',
    shortName: 'Exit',
    description: 'Prepare for and execute strategic exit or transition',
    objectives: [
      'Maximize enterprise value',
      'Prepare for due diligence',
      'Execute exit strategy',
      'Ensure smooth transition'
    ],
    keyActivities: [
      'Financial audit and cleanup',
      'Legal documentation review',
      'Due diligence preparation',
      'Buyer/investor identification',
      'Negotiation and deal structuring'
    ],
    deliverables: [
      'Exit readiness assessment',
      'Data room preparation',
      'Valuation analysis',
      'Deal documentation',
      'Transition plan'
    ],
    qualityGateChecks: [
      'Financials audited and clean',
      'Legal compliance verified',
      'Data room complete',
      'Valuation validated'
    ],
    recommendedExperts: ['Investment & Finance', 'Legal & Compliance', 'Tax & Accounting', 'Entrepreneurship & Strategy'],
    estimatedDuration: '3-12 months',
    icon: '🏆',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30'
  }
];

// Quality Gate Levels
export interface QualityGateLevel {
  level: number;
  name: string;
  description: string;
  approver: string;
  criteria: string[];
}

export const qualityGateLevels: QualityGateLevel[] = [
  {
    level: 1,
    name: 'Automated Check',
    description: 'System-validated completeness and consistency checks',
    approver: 'System',
    criteria: [
      'All required fields completed',
      'Document formatting correct',
      'Cross-references validated',
      'Data consistency verified'
    ]
  },
  {
    level: 2,
    name: 'Expert Panel Review',
    description: 'AI-SME panel validation of content and approach',
    approver: 'Blue Team + Red Team',
    criteria: [
      'Technical accuracy verified',
      'Market assumptions validated',
      'Risk assessment complete',
      'Recommendations actionable'
    ]
  },
  {
    level: 3,
    name: 'Strategic Review',
    description: 'Chief of Staff strategic alignment assessment',
    approver: 'Chief of Staff',
    criteria: [
      'Aligned with strategic objectives',
      'Resource requirements feasible',
      'Timeline realistic',
      'Dependencies identified'
    ]
  },
  {
    level: 4,
    name: 'Final Decision',
    description: 'Executive approval for phase transition',
    approver: 'Decision Maker',
    criteria: [
      'All previous gates passed',
      'Budget approved',
      'Go/No-Go decision made',
      'Next phase resources allocated'
    ]
  }
];

// Helper functions
export function getPhaseById(id: number): ValueChainPhase | undefined {
  return valueChainPhases.find(p => p.id === id);
}

export function getNextPhase(currentPhaseId: number): ValueChainPhase | undefined {
  const nextId = currentPhaseId + 1;
  return valueChainPhases.find(p => p.id === nextId);
}

export function getPreviousPhase(currentPhaseId: number): ValueChainPhase | undefined {
  const prevId = currentPhaseId - 1;
  return valueChainPhases.find(p => p.id === prevId);
}

export function calculatePhaseProgress(completedChecks: string[], phase: ValueChainPhase): number {
  if (phase.qualityGateChecks.length === 0) return 0;
  const completed = phase.qualityGateChecks.filter(check => completedChecks.includes(check)).length;
  return Math.round((completed / phase.qualityGateChecks.length) * 100);
}

// Project status based on phase
export type ProjectPhaseStatus = 'not_started' | 'in_progress' | 'pending_review' | 'approved' | 'blocked';

export interface ProjectPhaseProgress {
  phaseId: number;
  status: ProjectPhaseStatus;
  completedChecks: string[];
  startedAt?: Date;
  completedAt?: Date;
  blockedReason?: string;
}

export function getOverallProgress(phases: ProjectPhaseProgress[]): number {
  const totalPhases = valueChainPhases.length;
  const completedPhases = phases.filter(p => p.status === 'approved').length;
  const inProgressPhase = phases.find(p => p.status === 'in_progress');
  
  let progress = (completedPhases / totalPhases) * 100;
  
  if (inProgressPhase) {
    const phase = getPhaseById(inProgressPhase.phaseId);
    if (phase) {
      const phaseProgress = calculatePhaseProgress(inProgressPhase.completedChecks, phase);
      progress += (phaseProgress / totalPhases);
    }
  }
  
  return Math.round(progress);
}
