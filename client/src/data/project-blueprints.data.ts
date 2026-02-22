/**
 * Project Genesis Blueprint System
 * 
 * Standardised blueprints for each project type and deliverable.
 * Each blueprint includes:
 * - Pre-assigned SME teams
 * - Process flow with QA checkpoints
 * - Standard deliverables
 * - Quality gates
 */

export interface SMEAssignment {
  role: string;
  expertId: string;
  expertName: string;
  responsibility: string;
}

export interface QACheckpoint {
  id: string;
  phase: string;
  name: string;
  criteria: string[];
  approver: 'user' | 'chief-of-staff' | 'sme';
  required: boolean;
}

export interface ProcessStep {
  id: string;
  order: number;
  name: string;
  description: string;
  duration: string;
  assignedTo: string;
  deliverables: string[];
  qaCheckpoint?: string;
}

export interface Blueprint {
  id: string;
  name: string;
  category: 'business' | 'investment' | 'marketing' | 'operations' | 'due-diligence';
  description: string;
  projectTypes: string[];
  smeTeam: SMEAssignment[];
  processSteps: ProcessStep[];
  qaCheckpoints: QACheckpoint[];
  standardDeliverables: string[];
  estimatedDuration: string;
}

export interface ProjectType {
  id: string;
  name: string;
  description: string;
  icon: string;
  blueprints: string[];
  quickQuestions: {
    question: string;
    type: 'yes-no' | 'choice' | 'voice';
    options?: string[];
  }[];
}

// Project Types for Genesis Wizard
export const PROJECT_TYPES: ProjectType[] = [
  {
    id: 'revenue-business',
    name: 'Revenue-Generating Business',
    description: 'Building a business that needs to generate money',
    icon: 'TrendingUp',
    blueprints: ['business-plan', 'financial-model', 'pitch-deck', 'marketing-strategy'],
    quickQuestions: [
      { question: 'Is this a new venture or existing business?', type: 'choice', options: ['New venture', 'Existing business'] },
      { question: 'Do you have an existing customer base?', type: 'yes-no' },
      { question: 'What industry sector?', type: 'voice' },
      { question: 'Target revenue timeline?', type: 'choice', options: ['0-6 months', '6-12 months', '12-24 months', '24+ months'] },
    ]
  },
  {
    id: 'funding-seeking',
    name: 'Funding & Investment',
    description: 'Building a business looking to secure funding',
    icon: 'Wallet',
    blueprints: ['investor-deck', 'financial-model', 'due-diligence-pack', 'term-sheet'],
    quickQuestions: [
      { question: 'What stage of funding?', type: 'choice', options: ['Pre-seed', 'Seed', 'Series A', 'Series B+', 'Growth'] },
      { question: 'Do you have existing investors?', type: 'yes-no' },
      { question: 'Target raise amount?', type: 'voice' },
      { question: 'Have you prepared a data room?', type: 'yes-no' },
    ]
  },
  {
    id: 'due-diligence',
    name: 'Due Diligence',
    description: 'Conducting due diligence on a business under Project A',
    icon: 'Search',
    blueprints: ['dd-checklist', 'financial-analysis', 'legal-review', 'market-assessment'],
    quickQuestions: [
      { question: 'Type of due diligence?', type: 'choice', options: ['Acquisition', 'Investment', 'Partnership', 'Vendor'] },
      { question: 'Is there a data room available?', type: 'yes-no' },
      { question: 'Timeline for completion?', type: 'choice', options: ['1-2 weeks', '2-4 weeks', '1-2 months', '2+ months'] },
      { question: 'Key areas of concern?', type: 'voice' },
    ]
  },
  {
    id: 'strategic-initiative',
    name: 'Strategic Initiative',
    description: 'Internal strategic project or transformation',
    icon: 'Target',
    blueprints: ['strategy-doc', 'implementation-plan', 'stakeholder-comms', 'change-management'],
    quickQuestions: [
      { question: 'Is this board-mandated?', type: 'yes-no' },
      { question: 'Scope of initiative?', type: 'choice', options: ['Department', 'Business Unit', 'Company-wide', 'Group-wide'] },
      { question: 'What is the primary objective?', type: 'voice' },
      { question: 'Do you have executive sponsorship?', type: 'yes-no' },
    ]
  },
  {
    id: 'product-launch',
    name: 'Product Launch',
    description: 'Launching a new product or service',
    icon: 'Rocket',
    blueprints: ['go-to-market', 'marketing-campaign', 'sales-enablement', 'launch-checklist'],
    quickQuestions: [
      { question: 'Is this B2B or B2C?', type: 'choice', options: ['B2B', 'B2C', 'Both'] },
      { question: 'Do you have product-market fit validated?', type: 'yes-no' },
      { question: 'Target launch date?', type: 'voice' },
      { question: 'Marketing budget range?', type: 'choice', options: ['< $10k', '$10k-50k', '$50k-200k', '$200k+'] },
    ]
  }
];

// Standard Blueprints
export const BLUEPRINTS: Blueprint[] = [
  {
    id: 'pitch-deck',
    name: 'Investor Pitch Deck',
    category: 'investment',
    description: 'Professional pitch deck for investor presentations',
    projectTypes: ['revenue-business', 'funding-seeking'],
    smeTeam: [
      { role: 'Lead', expertId: 'inv-001', expertName: 'Warren Buffett Composite', responsibility: 'Investment narrative and value proposition' },
      { role: 'Financial', expertId: 'inv-003', expertName: 'Ray Dalio Composite', responsibility: 'Financial projections and market sizing' },
      { role: 'Design', expertId: 'lf-design-001', expertName: 'Alessandro Luxe', responsibility: 'Visual design and presentation aesthetics' },
      { role: 'Communications', expertId: 'strat-005', expertName: 'Communications Strategist', responsibility: 'Messaging and storytelling' },
    ],
    processSteps: [
      { id: 'pd-1', order: 1, name: 'Discovery & Scoping', description: 'Understand the business, market, and investment thesis', duration: '2-3 hours', assignedTo: 'Lead', deliverables: ['Scoping document', 'Key messages draft'], qaCheckpoint: 'qa-scope' },
      { id: 'pd-2', order: 2, name: 'Financial Analysis', description: 'Build financial model and projections', duration: '4-6 hours', assignedTo: 'Financial', deliverables: ['Financial model', 'Key metrics summary'], qaCheckpoint: 'qa-financials' },
      { id: 'pd-3', order: 3, name: 'Narrative Development', description: 'Craft the investment story', duration: '3-4 hours', assignedTo: 'Communications', deliverables: ['Narrative outline', 'Key talking points'] },
      { id: 'pd-4', order: 4, name: 'Visual Design', description: 'Design the presentation', duration: '4-6 hours', assignedTo: 'Design', deliverables: ['Slide deck draft'], qaCheckpoint: 'qa-design' },
      { id: 'pd-5', order: 5, name: 'Review & Refinement', description: 'Final review and polish', duration: '2-3 hours', assignedTo: 'Lead', deliverables: ['Final pitch deck'], qaCheckpoint: 'qa-final' },
    ],
    qaCheckpoints: [
      { id: 'qa-scope', phase: 'Scoping', name: 'Scope Approval', criteria: ['Clear value proposition', 'Target investor profile defined', 'Key differentiators identified'], approver: 'user', required: true },
      { id: 'qa-financials', phase: 'Financial', name: 'Financial Review', criteria: ['Assumptions documented', 'Projections realistic', 'Key metrics clear'], approver: 'chief-of-staff', required: true },
      { id: 'qa-design', phase: 'Design', name: 'Design Review', criteria: ['Brand consistent', 'Visually compelling', 'Data visualisation clear'], approver: 'user', required: false },
      { id: 'qa-final', phase: 'Final', name: 'Final Approval', criteria: ['All sections complete', 'Narrative coherent', 'Ready for presentation'], approver: 'user', required: true },
    ],
    standardDeliverables: ['Pitch deck (15-20 slides)', 'Executive summary (1-page)', 'Financial model', 'Appendix materials'],
    estimatedDuration: '2-3 days'
  },
  {
    id: 'financial-model',
    name: 'Financial Model',
    category: 'business',
    description: 'Comprehensive financial model with projections',
    projectTypes: ['revenue-business', 'funding-seeking', 'due-diligence'],
    smeTeam: [
      { role: 'Lead', expertId: 'inv-003', expertName: 'Ray Dalio Composite', responsibility: 'Model architecture and assumptions' },
      { role: 'Analysis', expertId: 'inv-002', expertName: 'Charlie Munger Composite', responsibility: 'Scenario analysis and risk assessment' },
      { role: 'Validation', expertId: 'inv-005', expertName: 'Finance SME', responsibility: 'Model validation and stress testing' },
    ],
    processSteps: [
      { id: 'fm-1', order: 1, name: 'Requirements Gathering', description: 'Define model scope and key drivers', duration: '1-2 hours', assignedTo: 'Lead', deliverables: ['Requirements doc'], qaCheckpoint: 'qa-req' },
      { id: 'fm-2', order: 2, name: 'Model Structure', description: 'Build model architecture', duration: '3-4 hours', assignedTo: 'Lead', deliverables: ['Model template'] },
      { id: 'fm-3', order: 3, name: 'Assumptions & Inputs', description: 'Document and validate assumptions', duration: '2-3 hours', assignedTo: 'Analysis', deliverables: ['Assumptions log'], qaCheckpoint: 'qa-assumptions' },
      { id: 'fm-4', order: 4, name: 'Scenario Analysis', description: 'Build scenarios and sensitivity', duration: '2-3 hours', assignedTo: 'Analysis', deliverables: ['Scenario outputs'] },
      { id: 'fm-5', order: 5, name: 'Validation & Testing', description: 'Validate model integrity', duration: '2-3 hours', assignedTo: 'Validation', deliverables: ['Validation report'], qaCheckpoint: 'qa-validation' },
    ],
    qaCheckpoints: [
      { id: 'qa-req', phase: 'Requirements', name: 'Requirements Sign-off', criteria: ['Scope clear', 'Key metrics defined', 'Timeline agreed'], approver: 'user', required: true },
      { id: 'qa-assumptions', phase: 'Assumptions', name: 'Assumptions Review', criteria: ['Sources documented', 'Ranges reasonable', 'Sensitivities identified'], approver: 'chief-of-staff', required: true },
      { id: 'qa-validation', phase: 'Validation', name: 'Model Validation', criteria: ['Formulas correct', 'Stress tested', 'Documentation complete'], approver: 'sme', required: true },
    ],
    standardDeliverables: ['Financial model (Excel)', 'Assumptions document', 'Scenario summary', 'Executive dashboard'],
    estimatedDuration: '3-5 days'
  },
  {
    id: 'marketing-strategy',
    name: 'Marketing Strategy',
    category: 'marketing',
    description: 'Comprehensive marketing strategy and campaign plan',
    projectTypes: ['revenue-business', 'product-launch'],
    smeTeam: [
      { role: 'Lead', expertId: 'mkt-001', expertName: 'Marketing Strategist', responsibility: 'Overall strategy and positioning' },
      { role: 'Brand', expertId: 'lf-design-001', expertName: 'Alessandro Luxe', responsibility: 'Brand identity and visual direction' },
      { role: 'Digital', expertId: 'mkt-002', expertName: 'Digital Marketing SME', responsibility: 'Digital channels and performance' },
      { role: 'Content', expertId: 'mkt-003', expertName: 'Content Strategist', responsibility: 'Content strategy and messaging' },
    ],
    processSteps: [
      { id: 'ms-1', order: 1, name: 'Market Analysis', description: 'Analyse market and competition', duration: '3-4 hours', assignedTo: 'Lead', deliverables: ['Market analysis report'], qaCheckpoint: 'qa-market' },
      { id: 'ms-2', order: 2, name: 'Positioning & Messaging', description: 'Define positioning and key messages', duration: '2-3 hours', assignedTo: 'Content', deliverables: ['Positioning statement', 'Key messages'] },
      { id: 'ms-3', order: 3, name: 'Channel Strategy', description: 'Define channel mix and tactics', duration: '2-3 hours', assignedTo: 'Digital', deliverables: ['Channel plan'] },
      { id: 'ms-4', order: 4, name: 'Brand Guidelines', description: 'Develop visual identity guidelines', duration: '3-4 hours', assignedTo: 'Brand', deliverables: ['Brand guidelines'], qaCheckpoint: 'qa-brand' },
      { id: 'ms-5', order: 5, name: 'Campaign Planning', description: 'Build campaign calendar and budget', duration: '2-3 hours', assignedTo: 'Lead', deliverables: ['Campaign plan', 'Budget'], qaCheckpoint: 'qa-campaign' },
    ],
    qaCheckpoints: [
      { id: 'qa-market', phase: 'Analysis', name: 'Market Analysis Review', criteria: ['Competitors mapped', 'Target audience defined', 'Opportunities identified'], approver: 'user', required: true },
      { id: 'qa-brand', phase: 'Brand', name: 'Brand Review', criteria: ['Visual identity consistent', 'Tone of voice defined', 'Guidelines documented'], approver: 'user', required: false },
      { id: 'qa-campaign', phase: 'Campaign', name: 'Campaign Approval', criteria: ['Budget realistic', 'Timeline achievable', 'KPIs defined'], approver: 'user', required: true },
    ],
    standardDeliverables: ['Marketing strategy document', 'Brand guidelines', 'Campaign calendar', 'Budget breakdown', 'KPI dashboard template'],
    estimatedDuration: '5-7 days'
  },
  {
    id: 'dd-checklist',
    name: 'Due Diligence Pack',
    category: 'due-diligence',
    description: 'Comprehensive due diligence checklist and analysis',
    projectTypes: ['due-diligence'],
    smeTeam: [
      { role: 'Lead', expertId: 'legal-001', expertName: 'Legal SME', responsibility: 'Overall DD coordination and legal review' },
      { role: 'Financial', expertId: 'inv-003', expertName: 'Ray Dalio Composite', responsibility: 'Financial due diligence' },
      { role: 'Operations', expertId: 'ops-001', expertName: 'Operations SME', responsibility: 'Operational due diligence' },
      { role: 'Commercial', expertId: 'strat-001', expertName: 'Strategy SME', responsibility: 'Commercial and market due diligence' },
    ],
    processSteps: [
      { id: 'dd-1', order: 1, name: 'Scoping & Planning', description: 'Define DD scope and request list', duration: '2-3 hours', assignedTo: 'Lead', deliverables: ['DD scope', 'Information request list'], qaCheckpoint: 'qa-dd-scope' },
      { id: 'dd-2', order: 2, name: 'Financial Review', description: 'Analyse financial statements and projections', duration: '6-8 hours', assignedTo: 'Financial', deliverables: ['Financial DD report'] },
      { id: 'dd-3', order: 3, name: 'Legal Review', description: 'Review contracts, compliance, IP', duration: '4-6 hours', assignedTo: 'Lead', deliverables: ['Legal DD report'] },
      { id: 'dd-4', order: 4, name: 'Operations Review', description: 'Assess operations and technology', duration: '4-6 hours', assignedTo: 'Operations', deliverables: ['Operations DD report'] },
      { id: 'dd-5', order: 5, name: 'Commercial Review', description: 'Market position and growth potential', duration: '3-4 hours', assignedTo: 'Commercial', deliverables: ['Commercial DD report'], qaCheckpoint: 'qa-dd-commercial' },
      { id: 'dd-6', order: 6, name: 'Synthesis & Recommendations', description: 'Consolidate findings and recommendations', duration: '3-4 hours', assignedTo: 'Lead', deliverables: ['DD summary report', 'Risk matrix'], qaCheckpoint: 'qa-dd-final' },
    ],
    qaCheckpoints: [
      { id: 'qa-dd-scope', phase: 'Scoping', name: 'Scope Approval', criteria: ['Areas defined', 'Timeline agreed', 'Access confirmed'], approver: 'user', required: true },
      { id: 'qa-dd-commercial', phase: 'Commercial', name: 'Commercial Review', criteria: ['Market validated', 'Competition assessed', 'Growth realistic'], approver: 'chief-of-staff', required: true },
      { id: 'qa-dd-final', phase: 'Final', name: 'Final DD Approval', criteria: ['All areas covered', 'Risks identified', 'Recommendations clear'], approver: 'user', required: true },
    ],
    standardDeliverables: ['DD summary report', 'Financial analysis', 'Legal review', 'Operations assessment', 'Risk matrix', 'Recommendation memo'],
    estimatedDuration: '2-4 weeks'
  }
];

/**
 * Get blueprint by ID
 */
export function getBlueprint(id: string): Blueprint | undefined {
  return BLUEPRINTS.find(b => b.id === id);
}

/**
 * Get blueprints for a project type
 */
export function getBlueprintsForProjectType(projectTypeId: string): Blueprint[] {
  const projectType = PROJECT_TYPES.find(pt => pt.id === projectTypeId);
  if (!projectType) return [];
  return BLUEPRINTS.filter(b => projectType.blueprints.includes(b.id));
}

/**
 * Get project type by ID
 */
export function getProjectType(id: string): ProjectType | undefined {
  return PROJECT_TYPES.find(pt => pt.id === id);
}
