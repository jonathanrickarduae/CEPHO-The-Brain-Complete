/**
 * Project Genesis Blueprint System
 * Standardised blueprints for each project type and deliverable.
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
    description: 'Conducting due diligence on a business under Celadon',
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
  },
  {
    id: 'deep-research',
    name: 'Deep Research Report',
    category: 'business',
    description: 'In-depth research and analysis on a specific topic',
    projectTypes: ['strategic-initiative', 'due-diligence'],
    smeTeam: [
      { role: 'Lead', expertId: 'research-001', expertName: 'Research Analyst', responsibility: 'Research design and synthesis' },
      { role: 'Data', expertId: 'data-001', expertName: 'Data Analyst', responsibility: 'Data collection and analysis' },
      { role: 'Subject Expert', expertId: 'sme-001', expertName: 'Domain Expert', responsibility: 'Subject matter expertise' },
    ],
    processSteps: [
      { id: 'dr-1', order: 1, name: 'Research Brief', description: 'Define research questions and scope', duration: '1-2 hours', assignedTo: 'Lead', deliverables: ['Research brief'], qaCheckpoint: 'qa-brief' },
      { id: 'dr-2', order: 2, name: 'Data Collection', description: 'Gather primary and secondary data', duration: '4-8 hours', assignedTo: 'Data', deliverables: ['Data set', 'Source log'] },
      { id: 'dr-3', order: 3, name: 'Analysis', description: 'Analyse data and identify insights', duration: '4-6 hours', assignedTo: 'Lead', deliverables: ['Analysis notes'], qaCheckpoint: 'qa-analysis' },
      { id: 'dr-4', order: 4, name: 'Expert Review', description: 'Validate findings with domain expert', duration: '2-3 hours', assignedTo: 'Subject Expert', deliverables: ['Expert feedback'] },
      { id: 'dr-5', order: 5, name: 'Report Writing', description: 'Compile final research report', duration: '3-4 hours', assignedTo: 'Lead', deliverables: ['Research report'], qaCheckpoint: 'qa-report' },
    ],
    qaCheckpoints: [
      { id: 'qa-brief', phase: 'Brief', name: 'Brief Approval', criteria: ['Questions clear', 'Scope defined', 'Sources identified'], approver: 'user', required: true },
      { id: 'qa-analysis', phase: 'Analysis', name: 'Analysis Review', criteria: ['Data validated', 'Methodology sound', 'Insights actionable'], approver: 'chief-of-staff', required: true },
      { id: 'qa-report', phase: 'Report', name: 'Report Approval', criteria: ['Findings clear', 'Recommendations actionable', 'Sources cited'], approver: 'user', required: true },
    ],
    standardDeliverables: ['Research report', 'Executive summary', 'Data appendix', 'Source bibliography'],
    estimatedDuration: '3-5 days'
  },
  {
    id: 'social-media',
    name: 'Social Media Campaign',
    category: 'marketing',
    description: 'Social media content strategy and campaign execution',
    projectTypes: ['product-launch', 'revenue-business'],
    smeTeam: [
      { role: 'Lead', expertId: 'social-001', expertName: 'Social Media Strategist', responsibility: 'Campaign strategy and oversight' },
      { role: 'Content', expertId: 'content-001', expertName: 'Content Creator', responsibility: 'Content creation and copywriting' },
      { role: 'Design', expertId: 'lf-design-001', expertName: 'Alessandro Luxe', responsibility: 'Visual content and brand consistency' },
      { role: 'Analytics', expertId: 'analytics-001', expertName: 'Analytics SME', responsibility: 'Performance tracking and optimisation' },
    ],
    processSteps: [
      { id: 'sm-1', order: 1, name: 'Audience Analysis', description: 'Define target audience and platforms', duration: '2-3 hours', assignedTo: 'Lead', deliverables: ['Audience personas', 'Platform strategy'], qaCheckpoint: 'qa-audience' },
      { id: 'sm-2', order: 2, name: 'Content Calendar', description: 'Plan content themes and schedule', duration: '2-3 hours', assignedTo: 'Content', deliverables: ['Content calendar'] },
      { id: 'sm-3', order: 3, name: 'Content Creation', description: 'Create posts, graphics, and copy', duration: '6-8 hours', assignedTo: 'Content', deliverables: ['Content assets'], qaCheckpoint: 'qa-content' },
      { id: 'sm-4', order: 4, name: 'Visual Design', description: 'Design graphics and templates', duration: '4-6 hours', assignedTo: 'Design', deliverables: ['Design assets', 'Templates'] },
      { id: 'sm-5', order: 5, name: 'Launch & Monitor', description: 'Execute campaign and track performance', duration: 'Ongoing', assignedTo: 'Analytics', deliverables: ['Performance reports'], qaCheckpoint: 'qa-performance' },
    ],
    qaCheckpoints: [
      { id: 'qa-audience', phase: 'Planning', name: 'Strategy Approval', criteria: ['Audience defined', 'Platforms selected', 'Goals set'], approver: 'user', required: true },
      { id: 'qa-content', phase: 'Content', name: 'Content Review', criteria: ['On brand', 'Engaging', 'Compliant'], approver: 'user', required: true },
      { id: 'qa-performance', phase: 'Execution', name: 'Performance Review', criteria: ['KPIs met', 'Engagement positive', 'ROI tracked'], approver: 'chief-of-staff', required: false },
    ],
    standardDeliverables: ['Content calendar', 'Post templates', 'Graphics pack', 'Performance dashboard', 'Monthly reports'],
    estimatedDuration: 'Ongoing (setup: 1 week)'
  }
];

export function getBlueprint(id: string): Blueprint | undefined {
  return BLUEPRINTS.find(b => b.id === id);
}

export function getBlueprintsForProjectType(projectTypeId: string): Blueprint[] {
  const projectType = PROJECT_TYPES.find(pt => pt.id === projectTypeId);
  if (!projectType) return [];
  return BLUEPRINTS.filter(b => projectType.blueprints.includes(b.id) || b.projectTypes.includes(projectTypeId));
}

export function getProjectType(id: string): ProjectType | undefined {
  return PROJECT_TYPES.find(pt => pt.id === id);
}


// Additional Blueprints for comprehensive coverage

export const ADDITIONAL_BLUEPRINTS: Blueprint[] = [
  {
    id: 'business-plan',
    name: 'Business Plan',
    category: 'business',
    description: 'Comprehensive business plan document',
    projectTypes: ['revenue-business', 'funding-seeking'],
    smeTeam: [
      { role: 'Lead', expertId: 'strat-001', expertName: 'Strategy SME', responsibility: 'Overall strategy and structure' },
      { role: 'Financial', expertId: 'inv-003', expertName: 'Ray Dalio Composite', responsibility: 'Financial planning and projections' },
      { role: 'Operations', expertId: 'ops-001', expertName: 'Operations SME', responsibility: 'Operational planning' },
      { role: 'Market', expertId: 'mkt-001', expertName: 'Marketing Strategist', responsibility: 'Market analysis and go-to-market' },
    ],
    processSteps: [
      { id: 'bp-1', order: 1, name: 'Executive Summary', description: 'Draft executive summary and vision', duration: '2-3 hours', assignedTo: 'Lead', deliverables: ['Executive summary draft'], qaCheckpoint: 'qa-exec' },
      { id: 'bp-2', order: 2, name: 'Market Analysis', description: 'Research market size, trends, competition', duration: '4-6 hours', assignedTo: 'Market', deliverables: ['Market analysis section'] },
      { id: 'bp-3', order: 3, name: 'Business Model', description: 'Define revenue model and unit economics', duration: '3-4 hours', assignedTo: 'Financial', deliverables: ['Business model canvas', 'Unit economics'], qaCheckpoint: 'qa-model' },
      { id: 'bp-4', order: 4, name: 'Operations Plan', description: 'Define operational requirements', duration: '3-4 hours', assignedTo: 'Operations', deliverables: ['Operations plan'] },
      { id: 'bp-5', order: 5, name: 'Financial Projections', description: 'Build 3-5 year financial projections', duration: '4-6 hours', assignedTo: 'Financial', deliverables: ['Financial projections'], qaCheckpoint: 'qa-financials' },
      { id: 'bp-6', order: 6, name: 'Final Assembly', description: 'Compile and polish final document', duration: '2-3 hours', assignedTo: 'Lead', deliverables: ['Complete business plan'], qaCheckpoint: 'qa-final' },
    ],
    qaCheckpoints: [
      { id: 'qa-exec', phase: 'Executive', name: 'Vision Alignment', criteria: ['Vision clear', 'Value proposition defined', 'Target market identified'], approver: 'user', required: true },
      { id: 'qa-model', phase: 'Model', name: 'Business Model Review', criteria: ['Revenue model viable', 'Unit economics positive', 'Scalability clear'], approver: 'chief-of-staff', required: true },
      { id: 'qa-financials', phase: 'Financial', name: 'Financial Review', criteria: ['Assumptions documented', 'Projections realistic', 'Funding needs clear'], approver: 'user', required: true },
      { id: 'qa-final', phase: 'Final', name: 'Final Approval', criteria: ['All sections complete', 'Narrative coherent', 'Professional quality'], approver: 'user', required: true },
    ],
    standardDeliverables: ['Business plan document', 'Executive summary', 'Financial model', 'Appendices'],
    estimatedDuration: '1-2 weeks'
  },
  {
    id: 'website-build',
    name: 'Website Build',
    category: 'marketing',
    description: 'Design and build a professional website',
    projectTypes: ['revenue-business', 'product-launch'],
    smeTeam: [
      { role: 'Lead', expertId: 'tech-001', expertName: 'Technical Lead', responsibility: 'Technical architecture and build' },
      { role: 'Design', expertId: 'lf-design-001', expertName: 'Alessandro Luxe', responsibility: 'Visual design and UX' },
      { role: 'Content', expertId: 'content-001', expertName: 'Content Strategist', responsibility: 'Copywriting and content' },
      { role: 'SEO', expertId: 'seo-001', expertName: 'SEO Specialist', responsibility: 'Search optimisation' },
    ],
    processSteps: [
      { id: 'wb-1', order: 1, name: 'Requirements & Sitemap', description: 'Define requirements and site structure', duration: '2-3 hours', assignedTo: 'Lead', deliverables: ['Requirements doc', 'Sitemap'], qaCheckpoint: 'qa-req' },
      { id: 'wb-2', order: 2, name: 'Wireframes', description: 'Create page wireframes', duration: '3-4 hours', assignedTo: 'Design', deliverables: ['Wireframes'], qaCheckpoint: 'qa-wireframes' },
      { id: 'wb-3', order: 3, name: 'Visual Design', description: 'Design visual mockups', duration: '4-6 hours', assignedTo: 'Design', deliverables: ['Design mockups'], qaCheckpoint: 'qa-design' },
      { id: 'wb-4', order: 4, name: 'Content Creation', description: 'Write all page content', duration: '4-6 hours', assignedTo: 'Content', deliverables: ['Page content'] },
      { id: 'wb-5', order: 5, name: 'Development', description: 'Build the website', duration: '8-16 hours', assignedTo: 'Lead', deliverables: ['Working website'] },
      { id: 'wb-6', order: 6, name: 'SEO & Launch', description: 'Optimise and launch', duration: '2-3 hours', assignedTo: 'SEO', deliverables: ['SEO report', 'Live website'], qaCheckpoint: 'qa-launch' },
    ],
    qaCheckpoints: [
      { id: 'qa-req', phase: 'Planning', name: 'Requirements Approval', criteria: ['Goals clear', 'Pages defined', 'Features listed'], approver: 'user', required: true },
      { id: 'qa-wireframes', phase: 'Design', name: 'Wireframe Review', criteria: ['User flow logical', 'Key pages covered', 'Mobile considered'], approver: 'user', required: true },
      { id: 'qa-design', phase: 'Design', name: 'Design Approval', criteria: ['Brand consistent', 'Visually appealing', 'Responsive design'], approver: 'user', required: true },
      { id: 'qa-launch', phase: 'Launch', name: 'Launch Checklist', criteria: ['All pages working', 'Forms tested', 'SEO implemented', 'Analytics installed'], approver: 'user', required: true },
    ],
    standardDeliverables: ['Live website', 'Design files', 'Content document', 'SEO report', 'Analytics setup'],
    estimatedDuration: '2-4 weeks'
  },
  {
    id: 'legal-documents',
    name: 'Legal Document Pack',
    category: 'operations',
    description: 'Standard legal documents and contracts',
    projectTypes: ['revenue-business', 'funding-seeking'],
    smeTeam: [
      { role: 'Lead', expertId: 'legal-001', expertName: 'Legal SME', responsibility: 'Legal review and drafting' },
      { role: 'Commercial', expertId: 'strat-001', expertName: 'Strategy SME', responsibility: 'Commercial terms alignment' },
    ],
    processSteps: [
      { id: 'ld-1', order: 1, name: 'Requirements', description: 'Identify required documents', duration: '1-2 hours', assignedTo: 'Lead', deliverables: ['Document list'], qaCheckpoint: 'qa-req' },
      { id: 'ld-2', order: 2, name: 'Drafting', description: 'Draft all documents', duration: '4-8 hours', assignedTo: 'Lead', deliverables: ['Draft documents'] },
      { id: 'ld-3', order: 3, name: 'Commercial Review', description: 'Review commercial terms', duration: '2-3 hours', assignedTo: 'Commercial', deliverables: ['Reviewed documents'], qaCheckpoint: 'qa-commercial' },
      { id: 'ld-4', order: 4, name: 'Final Review', description: 'Legal final review', duration: '2-3 hours', assignedTo: 'Lead', deliverables: ['Final documents'], qaCheckpoint: 'qa-final' },
    ],
    qaCheckpoints: [
      { id: 'qa-req', phase: 'Planning', name: 'Scope Approval', criteria: ['Documents identified', 'Jurisdictions confirmed', 'Timeline agreed'], approver: 'user', required: true },
      { id: 'qa-commercial', phase: 'Review', name: 'Commercial Terms Review', criteria: ['Terms competitive', 'Risks acceptable', 'Aligned with strategy'], approver: 'user', required: true },
      { id: 'qa-final', phase: 'Final', name: 'Legal Sign-off', criteria: ['Legally sound', 'Compliant', 'Ready for use'], approver: 'user', required: true },
    ],
    standardDeliverables: ['Terms of Service', 'Privacy Policy', 'NDA template', 'Service Agreement', 'Employment contracts'],
    estimatedDuration: '1-2 weeks'
  },
  {
    id: 'investor-deck',
    name: 'Investor Data Room',
    category: 'investment',
    description: 'Complete investor data room setup',
    projectTypes: ['funding-seeking'],
    smeTeam: [
      { role: 'Lead', expertId: 'inv-001', expertName: 'Warren Buffett Composite', responsibility: 'Data room structure and narrative' },
      { role: 'Financial', expertId: 'inv-003', expertName: 'Ray Dalio Composite', responsibility: 'Financial documentation' },
      { role: 'Legal', expertId: 'legal-001', expertName: 'Legal SME', responsibility: 'Legal documentation' },
      { role: 'Operations', expertId: 'ops-001', expertName: 'Operations SME', responsibility: 'Operational documentation' },
    ],
    processSteps: [
      { id: 'dr-1', order: 1, name: 'Structure Setup', description: 'Create data room structure', duration: '1-2 hours', assignedTo: 'Lead', deliverables: ['Folder structure', 'Index'], qaCheckpoint: 'qa-structure' },
      { id: 'dr-2', order: 2, name: 'Financial Docs', description: 'Prepare financial documentation', duration: '4-6 hours', assignedTo: 'Financial', deliverables: ['Financial statements', 'Projections', 'Cap table'] },
      { id: 'dr-3', order: 3, name: 'Legal Docs', description: 'Prepare legal documentation', duration: '3-4 hours', assignedTo: 'Legal', deliverables: ['Corporate docs', 'Contracts', 'IP docs'] },
      { id: 'dr-4', order: 4, name: 'Operations Docs', description: 'Prepare operational documentation', duration: '3-4 hours', assignedTo: 'Operations', deliverables: ['Team bios', 'Product docs', 'Customer data'] },
      { id: 'dr-5', order: 5, name: 'Final Assembly', description: 'Assemble and quality check', duration: '2-3 hours', assignedTo: 'Lead', deliverables: ['Complete data room'], qaCheckpoint: 'qa-final' },
    ],
    qaCheckpoints: [
      { id: 'qa-structure', phase: 'Setup', name: 'Structure Approval', criteria: ['Logical organisation', 'All sections covered', 'Access controls set'], approver: 'user', required: true },
      { id: 'qa-final', phase: 'Final', name: 'Data Room Review', criteria: ['All documents uploaded', 'Quality checked', 'Ready for investors'], approver: 'user', required: true },
    ],
    standardDeliverables: ['Complete data room', 'Document index', 'Executive summary', 'FAQ document'],
    estimatedDuration: '1-2 weeks'
  },
  {
    id: 'go-to-market',
    name: 'Go-to-Market Strategy',
    category: 'marketing',
    description: 'Comprehensive go-to-market plan for product launch',
    projectTypes: ['product-launch', 'revenue-business'],
    smeTeam: [
      { role: 'Lead', expertId: 'strat-001', expertName: 'Strategy SME', responsibility: 'Overall GTM strategy' },
      { role: 'Sales', expertId: 'sales-001', expertName: 'Sales Strategist', responsibility: 'Sales strategy and enablement' },
      { role: 'Marketing', expertId: 'mkt-001', expertName: 'Marketing Strategist', responsibility: 'Marketing and demand gen' },
      { role: 'Product', expertId: 'prod-001', expertName: 'Product Manager', responsibility: 'Product positioning' },
    ],
    processSteps: [
      { id: 'gtm-1', order: 1, name: 'Market Segmentation', description: 'Define target segments and ICP', duration: '3-4 hours', assignedTo: 'Lead', deliverables: ['Segment analysis', 'ICP document'], qaCheckpoint: 'qa-segments' },
      { id: 'gtm-2', order: 2, name: 'Positioning', description: 'Define product positioning', duration: '2-3 hours', assignedTo: 'Product', deliverables: ['Positioning statement', 'Messaging framework'] },
      { id: 'gtm-3', order: 3, name: 'Channel Strategy', description: 'Define sales and marketing channels', duration: '3-4 hours', assignedTo: 'Sales', deliverables: ['Channel plan'], qaCheckpoint: 'qa-channels' },
      { id: 'gtm-4', order: 4, name: 'Demand Gen Plan', description: 'Create demand generation plan', duration: '3-4 hours', assignedTo: 'Marketing', deliverables: ['Demand gen plan', 'Campaign calendar'] },
      { id: 'gtm-5', order: 5, name: 'Sales Enablement', description: 'Create sales materials', duration: '4-6 hours', assignedTo: 'Sales', deliverables: ['Sales deck', 'Battle cards', 'Objection handling'] },
      { id: 'gtm-6', order: 6, name: 'Launch Plan', description: 'Finalise launch timeline', duration: '2-3 hours', assignedTo: 'Lead', deliverables: ['Launch plan', 'Success metrics'], qaCheckpoint: 'qa-launch' },
    ],
    qaCheckpoints: [
      { id: 'qa-segments', phase: 'Strategy', name: 'Segment Approval', criteria: ['Segments validated', 'ICP clear', 'TAM/SAM/SOM defined'], approver: 'user', required: true },
      { id: 'qa-channels', phase: 'Channels', name: 'Channel Review', criteria: ['Channels appropriate', 'Budget allocated', 'Resources identified'], approver: 'user', required: true },
      { id: 'qa-launch', phase: 'Launch', name: 'Launch Approval', criteria: ['Timeline realistic', 'Dependencies mapped', 'Success metrics defined'], approver: 'user', required: true },
    ],
    standardDeliverables: ['GTM strategy document', 'Sales playbook', 'Marketing plan', 'Launch checklist', 'Success metrics dashboard'],
    estimatedDuration: '2-3 weeks'
  },
  {
    id: 'board-presentation',
    name: 'Board Presentation',
    category: 'business',
    description: 'Professional board meeting presentation',
    projectTypes: ['strategic-initiative', 'revenue-business'],
    smeTeam: [
      { role: 'Lead', expertId: 'strat-001', expertName: 'Strategy SME', responsibility: 'Narrative and structure' },
      { role: 'Financial', expertId: 'inv-003', expertName: 'Ray Dalio Composite', responsibility: 'Financial reporting' },
      { role: 'Design', expertId: 'lf-design-001', expertName: 'Alessandro Luxe', responsibility: 'Visual presentation' },
    ],
    processSteps: [
      { id: 'board-1', order: 1, name: 'Agenda Setting', description: 'Define board meeting agenda', duration: '1-2 hours', assignedTo: 'Lead', deliverables: ['Agenda'], qaCheckpoint: 'qa-agenda' },
      { id: 'board-2', order: 2, name: 'Financial Pack', description: 'Prepare financial reporting', duration: '3-4 hours', assignedTo: 'Financial', deliverables: ['Financial pack'] },
      { id: 'board-3', order: 3, name: 'Strategic Updates', description: 'Compile strategic updates', duration: '2-3 hours', assignedTo: 'Lead', deliverables: ['Strategic update'] },
      { id: 'board-4', order: 4, name: 'Design & Polish', description: 'Design presentation', duration: '2-3 hours', assignedTo: 'Design', deliverables: ['Board deck'], qaCheckpoint: 'qa-final' },
    ],
    qaCheckpoints: [
      { id: 'qa-agenda', phase: 'Planning', name: 'Agenda Approval', criteria: ['Key topics covered', 'Time allocated', 'Materials identified'], approver: 'user', required: true },
      { id: 'qa-final', phase: 'Final', name: 'Board Pack Review', criteria: ['All sections complete', 'Data accurate', 'Professionally presented'], approver: 'user', required: true },
    ],
    standardDeliverables: ['Board presentation', 'Financial pack', 'Appendix materials', 'Pre-read document'],
    estimatedDuration: '3-5 days'
  },
];

// Merge all blueprints
export const ALL_BLUEPRINTS = [...BLUEPRINTS, ...ADDITIONAL_BLUEPRINTS];

export function getAllBlueprints(): Blueprint[] {
  return ALL_BLUEPRINTS;
}

export function getBlueprintsByCategory(category: Blueprint['category']): Blueprint[] {
  return ALL_BLUEPRINTS.filter(b => b.category === category);
}
