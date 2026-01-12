/**
 * Project Genesis - QMS Blueprint Library
 * 
 * Comprehensive blueprints for each project type, crafted with SME expertise from:
 * - McKinsey (strategic frameworks, structured problem-solving)
 * - Top VCs (investment criteria, due diligence standards)
 * - Serial Entrepreneurs (practical execution, speed to market)
 * - CFOs (financial modeling, capital structure)
 * - Legal/Compliance (governance, risk management)
 * - Product Leaders (go-to-market, user research)
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface IntakeQuestion {
  id: string;
  question: string;
  type: 'yes_no' | 'choice' | 'text' | 'number' | 'file_upload' | 'multi_select' | 'scale';
  required: boolean;
  options?: { value: string; label: string; description?: string }[];
  conditionalOn?: { questionId: string; answer: string | string[] };
  helpText?: string;
  validationRules?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  smeSource?: string; // Which expert perspective this question comes from
}

export interface ProcessStep {
  id: string;
  name: string;
  description: string;
  estimatedDuration: string; // e.g., "2-4 hours", "1-2 days"
  assignedSMEs: string[]; // Expert IDs
  inputs: string[]; // What's needed to start
  outputs: string[]; // What gets produced
  qaGate?: QAGate;
  dependencies: string[]; // Step IDs that must complete first
  automationLevel: 'manual' | 'assisted' | 'automated';
}

export interface QAGate {
  id: string;
  name: string;
  criteria: string[];
  approvers: string[]; // 'user' | 'digital_twin' | specific SME IDs
  tripleAIValidation: boolean;
  signOffRequired: boolean;
}

export interface Deliverable {
  id: string;
  name: string;
  type: 'document' | 'spreadsheet' | 'presentation' | 'data' | 'analysis' | 'report';
  format: string; // e.g., 'PDF', 'XLSX', 'PPTX', 'JSON'
  description: string;
  template?: string; // Template ID if applicable
  qualityStandard: string; // e.g., "Investment-grade", "Board-ready"
}

export interface ProjectBlueprint {
  id: string;
  name: string;
  description: string;
  category: 'capital' | 'strategy' | 'operations' | 'compliance' | 'research' | 'custom';
  estimatedDuration: string;
  complexity: 'low' | 'medium' | 'high' | 'very_high';
  
  // Intake Phase
  intakeQuestions: IntakeQuestion[];
  dataRequirements: {
    required: string[];
    optional: string[];
    sources: string[];
  };
  
  // Process Phase
  processSteps: ProcessStep[];
  
  // Output Phase
  deliverables: Deliverable[];
  
  // SME Configuration
  recommendedTeam: {
    lead: string; // Primary SME
    core: string[]; // Essential team members
    specialists: string[]; // Called in as needed
  };
  
  // Quality Management
  qaGates: QAGate[];
  successCriteria: string[];
}

// ============================================================================
// SME EXPERT DEFINITIONS (Referenced in blueprints)
// ============================================================================

export const SME_EXPERTS = {
  // Strategic Consultants
  mckinsey_strategist: {
    id: 'mckinsey_strategist',
    name: 'McKinsey Strategic Advisor',
    expertise: ['Strategy frameworks', 'Market sizing', 'Competitive analysis', 'Operating models'],
    thinkingStyle: 'Hypothesis-driven, MECE, structured problem-solving',
  },
  bcg_growth: {
    id: 'bcg_growth',
    name: 'BCG Growth Specialist',
    expertise: ['Growth strategy', 'Digital transformation', 'Innovation'],
    thinkingStyle: 'Data-driven insights, scenario planning',
  },
  
  // Finance & Investment
  vc_partner: {
    id: 'vc_partner',
    name: 'Venture Capital Partner',
    expertise: ['Investment thesis', 'Due diligence', 'Term sheets', 'Portfolio management'],
    thinkingStyle: 'Risk-adjusted returns, market timing, founder assessment',
  },
  pe_director: {
    id: 'pe_director',
    name: 'Private Equity Director',
    expertise: ['LBO modeling', 'Value creation', 'Exit planning', 'Operational improvement'],
    thinkingStyle: 'Value creation levers, multiple expansion, debt optimization',
  },
  cfo_expert: {
    id: 'cfo_expert',
    name: 'CFO / Financial Controller',
    expertise: ['Financial modeling', 'Cash flow', 'Capital structure', 'Reporting'],
    thinkingStyle: 'Conservative assumptions, sensitivity analysis, audit-ready',
  },
  investment_banker: {
    id: 'investment_banker',
    name: 'Investment Banking MD',
    expertise: ['M&A', 'Capital raising', 'Valuations', 'Deal structuring'],
    thinkingStyle: 'Market comps, precedent transactions, optimal timing',
  },
  
  // Legal & Compliance
  corporate_lawyer: {
    id: 'corporate_lawyer',
    name: 'Corporate Lawyer',
    expertise: ['Corporate structure', 'Contracts', 'Governance', 'Regulatory'],
    thinkingStyle: 'Risk mitigation, compliance-first, documentation',
  },
  tax_specialist: {
    id: 'tax_specialist',
    name: 'Tax Specialist',
    expertise: ['Tax structuring', 'Transfer pricing', 'Incentives', 'Compliance'],
    thinkingStyle: 'Tax efficiency, jurisdiction optimization, audit defense',
  },
  
  // Operations & Execution
  serial_entrepreneur: {
    id: 'serial_entrepreneur',
    name: 'Serial Entrepreneur',
    expertise: ['Startup execution', 'Pivoting', 'Fundraising', 'Team building'],
    thinkingStyle: 'Speed over perfection, customer obsession, lean methodology',
  },
  coo_expert: {
    id: 'coo_expert',
    name: 'Chief Operating Officer',
    expertise: ['Operations', 'Process design', 'Scaling', 'Team management'],
    thinkingStyle: 'Systems thinking, efficiency, measurable outcomes',
  },
  
  // Product & Market
  product_leader: {
    id: 'product_leader',
    name: 'Chief Product Officer',
    expertise: ['Product strategy', 'User research', 'Roadmapping', 'Launch'],
    thinkingStyle: 'User-centric, data-informed, iterative development',
  },
  gtm_specialist: {
    id: 'gtm_specialist',
    name: 'Go-to-Market Specialist',
    expertise: ['Market entry', 'Channel strategy', 'Pricing', 'Sales enablement'],
    thinkingStyle: 'Market segmentation, competitive positioning, revenue optimization',
  },
  
  // Research & Analysis
  market_analyst: {
    id: 'market_analyst',
    name: 'Market Research Analyst',
    expertise: ['Market sizing', 'Trends', 'Competitive intelligence', 'Customer insights'],
    thinkingStyle: 'Primary + secondary research, triangulation, actionable insights',
  },
  data_scientist: {
    id: 'data_scientist',
    name: 'Data Scientist',
    expertise: ['Data analysis', 'Modeling', 'Visualization', 'Insights'],
    thinkingStyle: 'Statistical rigor, pattern recognition, predictive modeling',
  },
};

// ============================================================================
// BLUEPRINT 1: NEW BUSINESS / REVENUE GENERATION
// ============================================================================

export const NEW_BUSINESS_BLUEPRINT: ProjectBlueprint = {
  id: 'new_business',
  name: 'New Business / Revenue Generation',
  description: 'Complete framework for launching a new revenue-generating business, from concept validation through to operational launch.',
  category: 'capital',
  estimatedDuration: '4-8 weeks',
  complexity: 'very_high',
  
  intakeQuestions: [
    // Business Concept
    {
      id: 'business_concept',
      question: 'Describe your business concept in 2-3 sentences',
      type: 'text',
      required: true,
      helpText: 'What problem are you solving and for whom?',
      smeSource: 'serial_entrepreneur',
    },
    {
      id: 'existing_materials',
      question: 'Do you have any existing materials to review?',
      type: 'yes_no',
      required: true,
      helpText: 'Business plans, pitch decks, financial models, market research',
      smeSource: 'vc_partner',
    },
    {
      id: 'materials_upload',
      question: 'Upload your existing materials',
      type: 'file_upload',
      required: false,
      conditionalOn: { questionId: 'existing_materials', answer: 'yes' },
    },
    
    // Market & Competition
    {
      id: 'target_market',
      question: 'What is your target market?',
      type: 'choice',
      required: true,
      options: [
        { value: 'b2b_enterprise', label: 'B2B Enterprise', description: 'Large corporations, long sales cycles' },
        { value: 'b2b_smb', label: 'B2B SMB', description: 'Small-medium businesses' },
        { value: 'b2c_mass', label: 'B2C Mass Market', description: 'Consumer products/services' },
        { value: 'b2c_premium', label: 'B2C Premium', description: 'High-end consumer' },
        { value: 'b2b2c', label: 'B2B2C', description: 'Platform/marketplace model' },
        { value: 'government', label: 'Government/Public Sector', description: 'Public contracts' },
      ],
      smeSource: 'mckinsey_strategist',
    },
    {
      id: 'market_size_known',
      question: 'Do you know your Total Addressable Market (TAM)?',
      type: 'yes_no',
      required: true,
      smeSource: 'market_analyst',
    },
    {
      id: 'tam_value',
      question: 'What is your estimated TAM?',
      type: 'text',
      required: false,
      conditionalOn: { questionId: 'market_size_known', answer: 'yes' },
      helpText: 'e.g., £500M UK market, $2B global',
    },
    {
      id: 'competition_level',
      question: 'How competitive is your market?',
      type: 'choice',
      required: true,
      options: [
        { value: 'blue_ocean', label: 'Blue Ocean', description: 'Little to no direct competition' },
        { value: 'emerging', label: 'Emerging', description: 'Few competitors, market forming' },
        { value: 'growing', label: 'Growing', description: 'Multiple competitors, expanding market' },
        { value: 'mature', label: 'Mature', description: 'Established players, market share battle' },
        { value: 'disrupting', label: 'Disrupting', description: 'Challenging incumbents with new model' },
      ],
      smeSource: 'bcg_growth',
    },
    
    // Business Model
    {
      id: 'revenue_model',
      question: 'What is your primary revenue model?',
      type: 'multi_select',
      required: true,
      options: [
        { value: 'subscription', label: 'Subscription/SaaS' },
        { value: 'transaction', label: 'Transaction fees' },
        { value: 'licensing', label: 'Licensing' },
        { value: 'product_sales', label: 'Product sales' },
        { value: 'services', label: 'Professional services' },
        { value: 'advertising', label: 'Advertising' },
        { value: 'marketplace', label: 'Marketplace commission' },
      ],
      smeSource: 'serial_entrepreneur',
    },
    {
      id: 'unit_economics_known',
      question: 'Do you have unit economics defined?',
      type: 'yes_no',
      required: true,
      helpText: 'CAC, LTV, margins, payback period',
      smeSource: 'cfo_expert',
    },
    
    // Team & Resources
    {
      id: 'team_in_place',
      question: 'Do you have a founding team in place?',
      type: 'choice',
      required: true,
      options: [
        { value: 'solo', label: 'Solo founder' },
        { value: 'cofounders', label: 'Co-founders (2-3)' },
        { value: 'team', label: 'Full founding team (4+)' },
        { value: 'hiring', label: 'Currently hiring' },
      ],
      smeSource: 'vc_partner',
    },
    {
      id: 'existing_traction',
      question: 'Do you have any existing traction?',
      type: 'choice',
      required: true,
      options: [
        { value: 'idea', label: 'Idea stage only' },
        { value: 'prototype', label: 'Prototype/MVP built' },
        { value: 'beta', label: 'Beta users/pilot customers' },
        { value: 'revenue', label: 'Generating revenue' },
        { value: 'scaling', label: 'Scaling with product-market fit' },
      ],
      smeSource: 'serial_entrepreneur',
    },
    
    // Capital Requirements
    {
      id: 'funding_needed',
      question: 'How much capital do you need to raise?',
      type: 'choice',
      required: true,
      options: [
        { value: 'bootstrap', label: 'Bootstrapping (£0-50K)' },
        { value: 'pre_seed', label: 'Pre-seed (£50K-250K)' },
        { value: 'seed', label: 'Seed (£250K-2M)' },
        { value: 'series_a', label: 'Series A (£2M-15M)' },
        { value: 'growth', label: 'Growth (£15M+)' },
        { value: 'debt', label: 'Debt financing' },
        { value: 'grants', label: 'Grants/Non-dilutive' },
      ],
      smeSource: 'investment_banker',
    },
    {
      id: 'funding_timeline',
      question: 'When do you need the capital?',
      type: 'choice',
      required: true,
      options: [
        { value: 'urgent', label: 'Urgent (< 1 month)' },
        { value: 'soon', label: 'Soon (1-3 months)' },
        { value: 'planned', label: 'Planned (3-6 months)' },
        { value: 'future', label: 'Future (6+ months)' },
      ],
      smeSource: 'cfo_expert',
    },
    {
      id: 'equity_to_give',
      question: 'How much equity are you willing to give up?',
      type: 'choice',
      required: true,
      options: [
        { value: 'minimal', label: 'Minimal (< 10%)' },
        { value: 'standard', label: 'Standard (10-20%)' },
        { value: 'significant', label: 'Significant (20-30%)' },
        { value: 'flexible', label: 'Flexible based on terms' },
        { value: 'no_equity', label: 'No equity (debt only)' },
      ],
      smeSource: 'vc_partner',
    },
    
    // Location & Structure
    {
      id: 'business_location',
      question: 'Where will the business be headquartered?',
      type: 'choice',
      required: true,
      options: [
        { value: 'uk', label: 'United Kingdom' },
        { value: 'uae', label: 'UAE' },
        { value: 'us', label: 'United States' },
        { value: 'eu', label: 'European Union' },
        { value: 'singapore', label: 'Singapore' },
        { value: 'other', label: 'Other' },
      ],
      smeSource: 'tax_specialist',
    },
    {
      id: 'corporate_structure',
      question: 'Do you have a corporate structure in place?',
      type: 'choice',
      required: true,
      options: [
        { value: 'none', label: 'Not yet incorporated' },
        { value: 'ltd', label: 'Limited company' },
        { value: 'llp', label: 'LLP' },
        { value: 'holding', label: 'Holding structure' },
        { value: 'complex', label: 'Multi-jurisdiction' },
      ],
      smeSource: 'corporate_lawyer',
    },
  ],
  
  dataRequirements: {
    required: [
      'Business concept description',
      'Target market definition',
      'Revenue model outline',
    ],
    optional: [
      'Existing pitch deck',
      'Financial projections',
      'Market research',
      'Competitive analysis',
      'Customer interviews/feedback',
      'Product mockups/prototypes',
    ],
    sources: [
      'Founder input',
      'Market databases (Statista, IBISWorld)',
      'Competitor websites and filings',
      'Industry reports',
    ],
  },
  
  processSteps: [
    {
      id: 'step_1_discovery',
      name: 'Discovery & Data Gathering',
      description: 'Collect all existing materials, conduct founder interview, identify gaps',
      estimatedDuration: '2-4 hours',
      assignedSMEs: ['serial_entrepreneur', 'mckinsey_strategist'],
      inputs: ['Intake questionnaire responses', 'Uploaded materials'],
      outputs: ['Discovery report', 'Gap analysis', 'Research priorities'],
      dependencies: [],
      automationLevel: 'assisted',
      qaGate: {
        id: 'qa_discovery',
        name: 'Discovery Complete',
        criteria: [
          'All intake questions answered',
          'Materials reviewed and catalogued',
          'Key gaps identified',
          'Research plan approved',
        ],
        approvers: ['user'],
        tripleAIValidation: false,
        signOffRequired: true,
      },
    },
    {
      id: 'step_2_market_analysis',
      name: 'Market Analysis Deep Dive',
      description: 'TAM/SAM/SOM sizing, competitive landscape, market trends',
      estimatedDuration: '1-2 days',
      assignedSMEs: ['market_analyst', 'mckinsey_strategist', 'bcg_growth'],
      inputs: ['Discovery report', 'Market data sources'],
      outputs: ['Market sizing model', 'Competitive matrix', 'Trend analysis'],
      dependencies: ['step_1_discovery'],
      automationLevel: 'assisted',
      qaGate: {
        id: 'qa_market',
        name: 'Market Analysis Validated',
        criteria: [
          'TAM/SAM/SOM calculated with sources',
          'Top 10 competitors profiled',
          'Market trends identified',
          'Assumptions documented',
        ],
        approvers: ['digital_twin', 'mckinsey_strategist'],
        tripleAIValidation: true,
        signOffRequired: true,
      },
    },
    {
      id: 'step_3_business_model',
      name: 'Business Model Design',
      description: 'Revenue model, pricing strategy, unit economics, go-to-market',
      estimatedDuration: '1-2 days',
      assignedSMEs: ['serial_entrepreneur', 'cfo_expert', 'gtm_specialist'],
      inputs: ['Market analysis', 'Founder input on pricing'],
      outputs: ['Business model canvas', 'Unit economics model', 'Pricing strategy'],
      dependencies: ['step_2_market_analysis'],
      automationLevel: 'assisted',
    },
    {
      id: 'step_4_financial_model',
      name: 'Financial Model Build',
      description: '3-5 year projections, scenarios, funding requirements',
      estimatedDuration: '2-3 days',
      assignedSMEs: ['cfo_expert', 'investment_banker'],
      inputs: ['Business model', 'Market sizing', 'Unit economics'],
      outputs: ['Financial model (Excel)', 'Scenario analysis', 'Funding requirements'],
      dependencies: ['step_3_business_model'],
      automationLevel: 'assisted',
      qaGate: {
        id: 'qa_financial',
        name: 'Financial Model Validated',
        criteria: [
          'Model is internally consistent',
          'Assumptions are reasonable and documented',
          'Scenarios tested (base, bull, bear)',
          'Cash flow and runway calculated',
        ],
        approvers: ['cfo_expert', 'vc_partner'],
        tripleAIValidation: true,
        signOffRequired: true,
      },
    },
    {
      id: 'step_5_capital_strategy',
      name: 'Capital Strategy Development',
      description: 'Funding options analysis, investor targeting, terms optimization',
      estimatedDuration: '1-2 days',
      assignedSMEs: ['investment_banker', 'vc_partner', 'tax_specialist'],
      inputs: ['Financial model', 'Funding requirements', 'Location/structure'],
      outputs: ['Capital strategy memo', 'Investor target list', 'Term sheet guidance'],
      dependencies: ['step_4_financial_model'],
      automationLevel: 'assisted',
    },
    {
      id: 'step_6_legal_structure',
      name: 'Legal & Corporate Structure',
      description: 'Optimal structure, governance, founder agreements',
      estimatedDuration: '1-2 days',
      assignedSMEs: ['corporate_lawyer', 'tax_specialist'],
      inputs: ['Capital strategy', 'Location preference', 'Team structure'],
      outputs: ['Structure recommendation', 'Governance framework', 'Document checklist'],
      dependencies: ['step_5_capital_strategy'],
      automationLevel: 'assisted',
    },
    {
      id: 'step_7_pitch_materials',
      name: 'Pitch Materials Creation',
      description: 'Investor deck, executive summary, data room preparation',
      estimatedDuration: '2-3 days',
      assignedSMEs: ['serial_entrepreneur', 'vc_partner', 'investment_banker'],
      inputs: ['All previous outputs', 'Brand guidelines if any'],
      outputs: ['Pitch deck (15-20 slides)', 'Executive summary (2 pages)', 'Data room index'],
      dependencies: ['step_4_financial_model', 'step_5_capital_strategy'],
      automationLevel: 'assisted',
      qaGate: {
        id: 'qa_pitch',
        name: 'Pitch Materials Investment-Ready',
        criteria: [
          'Deck tells compelling story',
          'Numbers match financial model',
          'Ask is clear and justified',
          'Design is professional',
        ],
        approvers: ['user', 'vc_partner'],
        tripleAIValidation: true,
        signOffRequired: true,
      },
    },
    {
      id: 'step_8_final_review',
      name: 'Final Package Review',
      description: 'Complete review, consistency check, final sign-off',
      estimatedDuration: '4-8 hours',
      assignedSMEs: ['mckinsey_strategist', 'vc_partner', 'cfo_expert'],
      inputs: ['All deliverables'],
      outputs: ['Final package', 'Executive briefing', 'Next steps roadmap'],
      dependencies: ['step_6_legal_structure', 'step_7_pitch_materials'],
      automationLevel: 'manual',
      qaGate: {
        id: 'qa_final',
        name: 'Package Ready for Market',
        criteria: [
          'All deliverables complete',
          'Cross-document consistency verified',
          'Triple AI validation passed',
          'User final approval',
        ],
        approvers: ['user', 'digital_twin'],
        tripleAIValidation: true,
        signOffRequired: true,
      },
    },
  ],
  
  deliverables: [
    {
      id: 'del_market_analysis',
      name: 'Market Analysis Report',
      type: 'report',
      format: 'PDF',
      description: 'Comprehensive market sizing, competitive landscape, and trend analysis',
      qualityStandard: 'McKinsey-grade',
    },
    {
      id: 'del_business_model',
      name: 'Business Model Canvas',
      type: 'document',
      format: 'PDF',
      description: 'Visual business model with unit economics',
      qualityStandard: 'Board-ready',
    },
    {
      id: 'del_financial_model',
      name: 'Financial Model',
      type: 'spreadsheet',
      format: 'XLSX',
      description: '3-5 year projections with scenarios and assumptions',
      qualityStandard: 'Investment-grade',
    },
    {
      id: 'del_pitch_deck',
      name: 'Investor Pitch Deck',
      type: 'presentation',
      format: 'PPTX',
      description: '15-20 slide deck for investor meetings',
      qualityStandard: 'VC-ready',
    },
    {
      id: 'del_exec_summary',
      name: 'Executive Summary',
      type: 'document',
      format: 'PDF',
      description: '2-page investment teaser',
      qualityStandard: 'Investment-grade',
    },
    {
      id: 'del_capital_strategy',
      name: 'Capital Strategy Memo',
      type: 'document',
      format: 'PDF',
      description: 'Funding options, investor targets, timeline',
      qualityStandard: 'Board-ready',
    },
    {
      id: 'del_data_room',
      name: 'Data Room Index',
      type: 'document',
      format: 'PDF',
      description: 'Organized index of all due diligence materials',
      qualityStandard: 'Investment-grade',
    },
  ],
  
  recommendedTeam: {
    lead: 'serial_entrepreneur',
    core: ['cfo_expert', 'mckinsey_strategist', 'vc_partner'],
    specialists: ['corporate_lawyer', 'tax_specialist', 'market_analyst', 'investment_banker'],
  },
  
  qaGates: [
    {
      id: 'gate_discovery',
      name: 'Discovery Complete',
      criteria: ['All inputs gathered', 'Gaps identified', 'Plan approved'],
      approvers: ['user'],
      tripleAIValidation: false,
      signOffRequired: true,
    },
    {
      id: 'gate_analysis',
      name: 'Analysis Validated',
      criteria: ['Market sizing complete', 'Model validated', 'Assumptions documented'],
      approvers: ['digital_twin', 'cfo_expert'],
      tripleAIValidation: true,
      signOffRequired: true,
    },
    {
      id: 'gate_materials',
      name: 'Materials Ready',
      criteria: ['Deck complete', 'Numbers consistent', 'Design approved'],
      approvers: ['user', 'vc_partner'],
      tripleAIValidation: true,
      signOffRequired: true,
    },
    {
      id: 'gate_final',
      name: 'Launch Ready',
      criteria: ['All deliverables complete', 'Final review passed', 'User sign-off'],
      approvers: ['user'],
      tripleAIValidation: true,
      signOffRequired: true,
    },
  ],
  
  successCriteria: [
    'Complete investment package ready for market',
    'Financial model stress-tested and validated',
    'Pitch materials professionally designed',
    'Capital strategy aligned with business needs',
    'Legal structure optimized for fundraising',
  ],
};

// ============================================================================
// BLUEPRINT 2: DUE DILIGENCE
// ============================================================================

export const DUE_DILIGENCE_BLUEPRINT: ProjectBlueprint = {
  id: 'due_diligence',
  name: 'Due Diligence',
  description: 'Comprehensive due diligence framework for evaluating investment opportunities, acquisitions, or partnerships.',
  category: 'research',
  estimatedDuration: '2-4 weeks',
  complexity: 'high',
  
  intakeQuestions: [
    {
      id: 'dd_type',
      question: 'What type of due diligence is this?',
      type: 'choice',
      required: true,
      options: [
        { value: 'investment', label: 'Investment DD', description: 'Evaluating an investment opportunity' },
        { value: 'acquisition', label: 'Acquisition DD', description: 'M&A target evaluation' },
        { value: 'partnership', label: 'Partnership DD', description: 'JV or strategic partner evaluation' },
        { value: 'vendor', label: 'Vendor DD', description: 'Supplier or service provider evaluation' },
        { value: 'customer', label: 'Customer DD', description: 'Major customer creditworthiness' },
      ],
      smeSource: 'vc_partner',
    },
    {
      id: 'data_room_access',
      question: 'Do you have access to a data room?',
      type: 'yes_no',
      required: true,
      helpText: 'Virtual data room with company documents',
      smeSource: 'pe_director',
    },
    {
      id: 'data_room_url',
      question: 'Provide data room access details',
      type: 'text',
      required: false,
      conditionalOn: { questionId: 'data_room_access', answer: 'yes' },
      helpText: 'URL and login credentials (will be stored securely in Vault)',
    },
    {
      id: 'materials_available',
      question: 'What materials do you have available?',
      type: 'multi_select',
      required: true,
      options: [
        { value: 'financials', label: 'Financial statements (3+ years)' },
        { value: 'projections', label: 'Financial projections' },
        { value: 'contracts', label: 'Key contracts' },
        { value: 'legal', label: 'Legal documents (articles, agreements)' },
        { value: 'ip', label: 'IP documentation' },
        { value: 'hr', label: 'HR/Team information' },
        { value: 'customers', label: 'Customer data' },
        { value: 'tech', label: 'Technology documentation' },
      ],
      smeSource: 'pe_director',
    },
    {
      id: 'upload_materials',
      question: 'Upload available materials',
      type: 'file_upload',
      required: false,
      helpText: 'Upload any documents you have access to',
    },
    {
      id: 'deal_size',
      question: 'What is the potential deal size?',
      type: 'choice',
      required: true,
      options: [
        { value: 'small', label: 'Small (< £500K)' },
        { value: 'medium', label: 'Medium (£500K - £5M)' },
        { value: 'large', label: 'Large (£5M - £50M)' },
        { value: 'major', label: 'Major (£50M+)' },
      ],
      smeSource: 'investment_banker',
    },
    {
      id: 'timeline',
      question: 'What is your DD timeline?',
      type: 'choice',
      required: true,
      options: [
        { value: 'urgent', label: 'Urgent (< 1 week)' },
        { value: 'standard', label: 'Standard (2-4 weeks)' },
        { value: 'thorough', label: 'Thorough (4-8 weeks)' },
        { value: 'flexible', label: 'Flexible' },
      ],
      smeSource: 'pe_director',
    },
    {
      id: 'focus_areas',
      question: 'What are your primary focus areas?',
      type: 'multi_select',
      required: true,
      options: [
        { value: 'financial', label: 'Financial DD' },
        { value: 'commercial', label: 'Commercial DD' },
        { value: 'legal', label: 'Legal DD' },
        { value: 'tax', label: 'Tax DD' },
        { value: 'technical', label: 'Technical DD' },
        { value: 'hr', label: 'HR/People DD' },
        { value: 'operational', label: 'Operational DD' },
        { value: 'esg', label: 'ESG DD' },
      ],
      smeSource: 'mckinsey_strategist',
    },
    {
      id: 'red_flags_known',
      question: 'Are there any known concerns or red flags?',
      type: 'yes_no',
      required: true,
      smeSource: 'vc_partner',
    },
    {
      id: 'red_flags_detail',
      question: 'Describe the known concerns',
      type: 'text',
      required: false,
      conditionalOn: { questionId: 'red_flags_known', answer: 'yes' },
    },
  ],
  
  dataRequirements: {
    required: [
      'DD type and scope',
      'Available materials list',
      'Timeline and budget',
    ],
    optional: [
      'Data room access',
      'Management presentations',
      'Third-party reports',
      'Customer references',
      'Site visit access',
    ],
    sources: [
      'Data room documents',
      'Public filings',
      'Industry databases',
      'Expert network calls',
      'Management interviews',
    ],
  },
  
  processSteps: [
    {
      id: 'dd_step_1',
      name: 'Scope Definition & Planning',
      description: 'Define DD scope, create workplan, assign workstreams',
      estimatedDuration: '4-8 hours',
      assignedSMEs: ['pe_director', 'mckinsey_strategist'],
      inputs: ['Intake responses', 'Available materials'],
      outputs: ['DD workplan', 'Information request list', 'Timeline'],
      dependencies: [],
      automationLevel: 'assisted',
      qaGate: {
        id: 'qa_dd_scope',
        name: 'Scope Approved',
        criteria: ['Workplan complete', 'IRLs sent', 'Team assigned'],
        approvers: ['user'],
        tripleAIValidation: false,
        signOffRequired: true,
      },
    },
    {
      id: 'dd_step_2',
      name: 'Document Review & Analysis',
      description: 'Systematic review of all data room materials',
      estimatedDuration: '3-7 days',
      assignedSMEs: ['cfo_expert', 'corporate_lawyer', 'market_analyst'],
      inputs: ['Data room access', 'IRLs'],
      outputs: ['Document summary', 'Gap analysis', 'Initial findings'],
      dependencies: ['dd_step_1'],
      automationLevel: 'assisted',
    },
    {
      id: 'dd_step_3',
      name: 'Financial Analysis',
      description: 'Quality of earnings, working capital, debt analysis',
      estimatedDuration: '2-4 days',
      assignedSMEs: ['cfo_expert', 'pe_director'],
      inputs: ['Financial statements', 'Projections'],
      outputs: ['QoE analysis', 'Working capital analysis', 'Debt schedule'],
      dependencies: ['dd_step_2'],
      automationLevel: 'assisted',
      qaGate: {
        id: 'qa_dd_financial',
        name: 'Financial DD Complete',
        criteria: ['QoE validated', 'Adjustments identified', 'Normalized EBITDA calculated'],
        approvers: ['cfo_expert', 'pe_director'],
        tripleAIValidation: true,
        signOffRequired: true,
      },
    },
    {
      id: 'dd_step_4',
      name: 'Commercial Analysis',
      description: 'Market position, customer analysis, competitive dynamics',
      estimatedDuration: '2-4 days',
      assignedSMEs: ['mckinsey_strategist', 'market_analyst', 'bcg_growth'],
      inputs: ['Customer data', 'Market research'],
      outputs: ['Commercial DD report', 'Customer concentration analysis', 'Market position assessment'],
      dependencies: ['dd_step_2'],
      automationLevel: 'assisted',
    },
    {
      id: 'dd_step_5',
      name: 'Legal & Tax Review',
      description: 'Contract review, litigation, tax structure analysis',
      estimatedDuration: '2-4 days',
      assignedSMEs: ['corporate_lawyer', 'tax_specialist'],
      inputs: ['Legal documents', 'Tax filings'],
      outputs: ['Legal DD report', 'Tax DD report', 'Risk register'],
      dependencies: ['dd_step_2'],
      automationLevel: 'assisted',
    },
    {
      id: 'dd_step_6',
      name: 'Risk Assessment & Red Flags',
      description: 'Consolidate findings, identify deal-breakers, quantify risks',
      estimatedDuration: '1-2 days',
      assignedSMEs: ['pe_director', 'vc_partner', 'mckinsey_strategist'],
      inputs: ['All DD workstream outputs'],
      outputs: ['Risk matrix', 'Red flag summary', 'Mitigation strategies'],
      dependencies: ['dd_step_3', 'dd_step_4', 'dd_step_5'],
      automationLevel: 'assisted',
      qaGate: {
        id: 'qa_dd_risks',
        name: 'Risk Assessment Validated',
        criteria: ['All risks identified', 'Severity assessed', 'Mitigations proposed'],
        approvers: ['digital_twin', 'pe_director'],
        tripleAIValidation: true,
        signOffRequired: true,
      },
    },
    {
      id: 'dd_step_7',
      name: 'Valuation & Deal Terms',
      description: 'Valuation analysis, deal structure recommendations',
      estimatedDuration: '1-2 days',
      assignedSMEs: ['investment_banker', 'pe_director', 'cfo_expert'],
      inputs: ['Financial analysis', 'Risk assessment'],
      outputs: ['Valuation analysis', 'Deal structure memo', 'Term recommendations'],
      dependencies: ['dd_step_6'],
      automationLevel: 'assisted',
    },
    {
      id: 'dd_step_8',
      name: 'Final DD Report',
      description: 'Comprehensive DD report with recommendations',
      estimatedDuration: '1-2 days',
      assignedSMEs: ['pe_director', 'mckinsey_strategist'],
      inputs: ['All workstream outputs'],
      outputs: ['DD Report', 'Executive Summary', 'Investment Memo'],
      dependencies: ['dd_step_7'],
      automationLevel: 'assisted',
      qaGate: {
        id: 'qa_dd_final',
        name: 'DD Report Approved',
        criteria: ['All sections complete', 'Recommendations clear', 'Triple AI validated'],
        approvers: ['user', 'digital_twin'],
        tripleAIValidation: true,
        signOffRequired: true,
      },
    },
  ],
  
  deliverables: [
    {
      id: 'dd_report',
      name: 'Due Diligence Report',
      type: 'report',
      format: 'PDF',
      description: 'Comprehensive DD findings across all workstreams',
      qualityStandard: 'Investment-grade',
    },
    {
      id: 'dd_exec_summary',
      name: 'Executive Summary',
      type: 'document',
      format: 'PDF',
      description: '2-3 page summary for decision-makers',
      qualityStandard: 'Board-ready',
    },
    {
      id: 'dd_risk_matrix',
      name: 'Risk Matrix',
      type: 'spreadsheet',
      format: 'XLSX',
      description: 'Categorized risks with severity and mitigations',
      qualityStandard: 'Investment-grade',
    },
    {
      id: 'dd_valuation',
      name: 'Valuation Analysis',
      type: 'spreadsheet',
      format: 'XLSX',
      description: 'DCF, comps, and precedent transactions',
      qualityStandard: 'Investment-grade',
    },
    {
      id: 'dd_investment_memo',
      name: 'Investment Memo',
      type: 'document',
      format: 'PDF',
      description: 'Investment committee-ready recommendation',
      qualityStandard: 'IC-ready',
    },
  ],
  
  recommendedTeam: {
    lead: 'pe_director',
    core: ['cfo_expert', 'corporate_lawyer', 'mckinsey_strategist'],
    specialists: ['tax_specialist', 'market_analyst', 'investment_banker'],
  },
  
  qaGates: [
    {
      id: 'gate_dd_scope',
      name: 'Scope Approved',
      criteria: ['Workplan finalized', 'Resources allocated'],
      approvers: ['user'],
      tripleAIValidation: false,
      signOffRequired: true,
    },
    {
      id: 'gate_dd_analysis',
      name: 'Analysis Complete',
      criteria: ['All workstreams complete', 'Findings documented'],
      approvers: ['digital_twin'],
      tripleAIValidation: true,
      signOffRequired: true,
    },
    {
      id: 'gate_dd_final',
      name: 'Report Approved',
      criteria: ['Report complete', 'Recommendations clear', 'User sign-off'],
      approvers: ['user'],
      tripleAIValidation: true,
      signOffRequired: true,
    },
  ],
  
  successCriteria: [
    'All material risks identified and quantified',
    'Clear investment recommendation provided',
    'Valuation supported by analysis',
    'Deal terms optimized based on findings',
  ],
};

// ============================================================================
// BLUEPRINT 3: INVESTOR PRESENTATION
// ============================================================================

export const INVESTOR_PRESENTATION_BLUEPRINT: ProjectBlueprint = {
  id: 'investor_presentation',
  name: 'Investor Presentation',
  description: 'Create compelling investor materials including pitch deck, executive summary, and supporting documents.',
  category: 'capital',
  estimatedDuration: '1-2 weeks',
  complexity: 'medium',
  
  intakeQuestions: [
    {
      id: 'existing_deck',
      question: 'Do you have an existing pitch deck to review?',
      type: 'yes_no',
      required: true,
      smeSource: 'vc_partner',
    },
    {
      id: 'deck_upload',
      question: 'Upload your existing deck',
      type: 'file_upload',
      required: false,
      conditionalOn: { questionId: 'existing_deck', answer: 'yes' },
    },
    {
      id: 'presentation_purpose',
      question: 'What is the primary purpose of this presentation?',
      type: 'choice',
      required: true,
      options: [
        { value: 'seed', label: 'Seed fundraise' },
        { value: 'series_a', label: 'Series A' },
        { value: 'series_b_plus', label: 'Series B+' },
        { value: 'strategic', label: 'Strategic investor' },
        { value: 'pe', label: 'Private equity' },
        { value: 'debt', label: 'Debt financing' },
        { value: 'grant', label: 'Grant application' },
      ],
      smeSource: 'investment_banker',
    },
    {
      id: 'target_raise',
      question: 'How much are you looking to raise?',
      type: 'text',
      required: true,
      helpText: 'e.g., £2M, $5M',
      smeSource: 'vc_partner',
    },
    {
      id: 'valuation_set',
      question: 'Do you have a target valuation?',
      type: 'yes_no',
      required: true,
      smeSource: 'investment_banker',
    },
    {
      id: 'valuation_amount',
      question: 'What is your target valuation?',
      type: 'text',
      required: false,
      conditionalOn: { questionId: 'valuation_set', answer: 'yes' },
    },
    {
      id: 'financial_model_exists',
      question: 'Do you have a financial model?',
      type: 'yes_no',
      required: true,
      smeSource: 'cfo_expert',
    },
    {
      id: 'model_upload',
      question: 'Upload your financial model',
      type: 'file_upload',
      required: false,
      conditionalOn: { questionId: 'financial_model_exists', answer: 'yes' },
    },
    {
      id: 'traction_metrics',
      question: 'What traction metrics can you share?',
      type: 'multi_select',
      required: true,
      options: [
        { value: 'revenue', label: 'Revenue' },
        { value: 'users', label: 'Users/Customers' },
        { value: 'growth', label: 'Growth rate' },
        { value: 'retention', label: 'Retention/Churn' },
        { value: 'unit_economics', label: 'Unit economics' },
        { value: 'partnerships', label: 'Key partnerships' },
        { value: 'none', label: 'Pre-traction' },
      ],
      smeSource: 'vc_partner',
    },
    {
      id: 'brand_guidelines',
      question: 'Do you have brand guidelines?',
      type: 'yes_no',
      required: true,
      helpText: 'Logo, colors, fonts, etc.',
    },
    {
      id: 'brand_upload',
      question: 'Upload brand assets',
      type: 'file_upload',
      required: false,
      conditionalOn: { questionId: 'brand_guidelines', answer: 'yes' },
    },
  ],
  
  dataRequirements: {
    required: [
      'Business description',
      'Funding amount and use of funds',
      'Key metrics/traction',
    ],
    optional: [
      'Existing pitch deck',
      'Financial model',
      'Brand guidelines',
      'Team bios and photos',
      'Product screenshots/demos',
      'Customer testimonials',
    ],
    sources: [
      'Founder input',
      'Company materials',
      'Market research',
    ],
  },
  
  processSteps: [
    {
      id: 'ip_step_1',
      name: 'Materials Review & Story Development',
      description: 'Review existing materials, develop narrative arc',
      estimatedDuration: '4-8 hours',
      assignedSMEs: ['serial_entrepreneur', 'vc_partner'],
      inputs: ['Existing deck', 'Company info'],
      outputs: ['Story outline', 'Key messages', 'Slide structure'],
      dependencies: [],
      automationLevel: 'assisted',
    },
    {
      id: 'ip_step_2',
      name: 'Content Development',
      description: 'Write slide content, develop talking points',
      estimatedDuration: '1-2 days',
      assignedSMEs: ['serial_entrepreneur', 'mckinsey_strategist'],
      inputs: ['Story outline', 'Metrics', 'Market data'],
      outputs: ['Slide content', 'Talking points', 'Appendix content'],
      dependencies: ['ip_step_1'],
      automationLevel: 'assisted',
      qaGate: {
        id: 'qa_ip_content',
        name: 'Content Approved',
        criteria: ['Story is compelling', 'Numbers are accurate', 'Ask is clear'],
        approvers: ['user', 'vc_partner'],
        tripleAIValidation: true,
        signOffRequired: true,
      },
    },
    {
      id: 'ip_step_3',
      name: 'Design & Visualization',
      description: 'Professional design, charts, graphics',
      estimatedDuration: '1-2 days',
      assignedSMEs: ['product_leader'],
      inputs: ['Approved content', 'Brand guidelines'],
      outputs: ['Designed deck', 'Charts/graphics'],
      dependencies: ['ip_step_2'],
      automationLevel: 'assisted',
    },
    {
      id: 'ip_step_4',
      name: 'Executive Summary & Supporting Docs',
      description: 'Create 2-pager, FAQ, appendix',
      estimatedDuration: '4-8 hours',
      assignedSMEs: ['investment_banker', 'serial_entrepreneur'],
      inputs: ['Final deck content'],
      outputs: ['Executive summary', 'FAQ document', 'Appendix'],
      dependencies: ['ip_step_2'],
      automationLevel: 'assisted',
    },
    {
      id: 'ip_step_5',
      name: 'Final Review & Polish',
      description: 'Final review, consistency check, presentation prep',
      estimatedDuration: '4-8 hours',
      assignedSMEs: ['vc_partner', 'serial_entrepreneur'],
      inputs: ['All materials'],
      outputs: ['Final deck', 'Presentation notes', 'Objection handling guide'],
      dependencies: ['ip_step_3', 'ip_step_4'],
      automationLevel: 'manual',
      qaGate: {
        id: 'qa_ip_final',
        name: 'Materials Investment-Ready',
        criteria: ['Design polished', 'Numbers verified', 'Story compelling'],
        approvers: ['user'],
        tripleAIValidation: true,
        signOffRequired: true,
      },
    },
  ],
  
  deliverables: [
    {
      id: 'ip_deck',
      name: 'Investor Pitch Deck',
      type: 'presentation',
      format: 'PPTX',
      description: '15-20 slide investor deck',
      qualityStandard: 'VC-ready',
    },
    {
      id: 'ip_exec_summary',
      name: 'Executive Summary',
      type: 'document',
      format: 'PDF',
      description: '2-page investment teaser',
      qualityStandard: 'Investment-grade',
    },
    {
      id: 'ip_faq',
      name: 'Investor FAQ',
      type: 'document',
      format: 'PDF',
      description: 'Anticipated questions and answers',
      qualityStandard: 'Board-ready',
    },
    {
      id: 'ip_appendix',
      name: 'Appendix Slides',
      type: 'presentation',
      format: 'PPTX',
      description: 'Detailed backup slides',
      qualityStandard: 'Investment-grade',
    },
  ],
  
  recommendedTeam: {
    lead: 'serial_entrepreneur',
    core: ['vc_partner', 'investment_banker'],
    specialists: ['mckinsey_strategist', 'cfo_expert'],
  },
  
  qaGates: [
    {
      id: 'gate_ip_story',
      name: 'Story Approved',
      criteria: ['Narrative compelling', 'Key messages clear'],
      approvers: ['user'],
      tripleAIValidation: false,
      signOffRequired: true,
    },
    {
      id: 'gate_ip_final',
      name: 'Materials Ready',
      criteria: ['All materials complete', 'Design polished', 'Numbers verified'],
      approvers: ['user'],
      tripleAIValidation: true,
      signOffRequired: true,
    },
  ],
  
  successCriteria: [
    'Deck tells compelling investment story',
    'Numbers are accurate and defensible',
    'Design is professional and on-brand',
    'Materials ready for investor meetings',
  ],
};

// ============================================================================
// BLUEPRINT 4: STRATEGIC INVESTMENT
// ============================================================================

export const STRATEGIC_INVESTMENT_BLUEPRINT: ProjectBlueprint = {
  id: 'strategic_investment',
  name: 'Strategic Investment',
  description: 'Evaluate and structure strategic investments, JVs, or corporate partnerships.',
  category: 'strategy',
  estimatedDuration: '2-4 weeks',
  complexity: 'high',
  
  intakeQuestions: [
    {
      id: 'investment_type',
      question: 'What type of strategic investment is this?',
      type: 'choice',
      required: true,
      options: [
        { value: 'minority', label: 'Minority stake acquisition' },
        { value: 'majority', label: 'Majority stake acquisition' },
        { value: 'jv', label: 'Joint venture' },
        { value: 'strategic_partner', label: 'Strategic partnership' },
        { value: 'corporate_vc', label: 'Corporate venture investment' },
      ],
      smeSource: 'pe_director',
    },
    {
      id: 'strategic_rationale',
      question: 'What is the strategic rationale?',
      type: 'multi_select',
      required: true,
      options: [
        { value: 'market_access', label: 'Market access' },
        { value: 'technology', label: 'Technology/IP acquisition' },
        { value: 'talent', label: 'Talent acquisition' },
        { value: 'vertical', label: 'Vertical integration' },
        { value: 'horizontal', label: 'Horizontal expansion' },
        { value: 'diversification', label: 'Diversification' },
        { value: 'financial', label: 'Financial returns' },
      ],
      smeSource: 'mckinsey_strategist',
    },
    {
      id: 'target_identified',
      question: 'Have you identified a specific target?',
      type: 'yes_no',
      required: true,
      smeSource: 'investment_banker',
    },
    {
      id: 'target_details',
      question: 'Provide target company details',
      type: 'text',
      required: false,
      conditionalOn: { questionId: 'target_identified', answer: 'yes' },
    },
    {
      id: 'investment_size',
      question: 'What is the expected investment size?',
      type: 'choice',
      required: true,
      options: [
        { value: 'small', label: '< £1M' },
        { value: 'medium', label: '£1M - £10M' },
        { value: 'large', label: '£10M - £50M' },
        { value: 'major', label: '£50M+' },
      ],
      smeSource: 'pe_director',
    },
    {
      id: 'governance_requirements',
      question: 'What governance rights are important?',
      type: 'multi_select',
      required: true,
      options: [
        { value: 'board_seat', label: 'Board seat' },
        { value: 'veto_rights', label: 'Veto rights' },
        { value: 'info_rights', label: 'Information rights' },
        { value: 'anti_dilution', label: 'Anti-dilution protection' },
        { value: 'exit_rights', label: 'Exit/liquidity rights' },
        { value: 'operational', label: 'Operational involvement' },
      ],
      smeSource: 'corporate_lawyer',
    },
  ],
  
  dataRequirements: {
    required: [
      'Strategic rationale',
      'Investment parameters',
      'Governance requirements',
    ],
    optional: [
      'Target company information',
      'Market analysis',
      'Synergy estimates',
      'Comparable transactions',
    ],
    sources: [
      'Internal strategy documents',
      'Market research',
      'Target company materials',
      'Advisor input',
    ],
  },
  
  processSteps: [
    {
      id: 'si_step_1',
      name: 'Strategic Framework Development',
      description: 'Define investment thesis, screening criteria, target profile',
      estimatedDuration: '1-2 days',
      assignedSMEs: ['mckinsey_strategist', 'bcg_growth'],
      inputs: ['Strategic rationale', 'Business context'],
      outputs: ['Investment thesis', 'Screening criteria', 'Target profile'],
      dependencies: [],
      automationLevel: 'assisted',
    },
    {
      id: 'si_step_2',
      name: 'Target Screening & Analysis',
      description: 'Identify and evaluate potential targets',
      estimatedDuration: '2-4 days',
      assignedSMEs: ['market_analyst', 'investment_banker'],
      inputs: ['Screening criteria'],
      outputs: ['Target longlist', 'Shortlist analysis', 'Ranking matrix'],
      dependencies: ['si_step_1'],
      automationLevel: 'assisted',
    },
    {
      id: 'si_step_3',
      name: 'Synergy Analysis',
      description: 'Quantify strategic and financial synergies',
      estimatedDuration: '2-3 days',
      assignedSMEs: ['mckinsey_strategist', 'cfo_expert'],
      inputs: ['Target analysis', 'Business data'],
      outputs: ['Synergy model', 'Integration roadmap'],
      dependencies: ['si_step_2'],
      automationLevel: 'assisted',
      qaGate: {
        id: 'qa_si_synergy',
        name: 'Synergy Analysis Validated',
        criteria: ['Synergies quantified', 'Assumptions documented', 'Risks identified'],
        approvers: ['digital_twin', 'mckinsey_strategist'],
        tripleAIValidation: true,
        signOffRequired: true,
      },
    },
    {
      id: 'si_step_4',
      name: 'Valuation & Deal Structure',
      description: 'Develop valuation and optimal deal structure',
      estimatedDuration: '2-3 days',
      assignedSMEs: ['investment_banker', 'pe_director', 'cfo_expert'],
      inputs: ['Synergy analysis', 'Target financials'],
      outputs: ['Valuation analysis', 'Deal structure options', 'Term sheet draft'],
      dependencies: ['si_step_3'],
      automationLevel: 'assisted',
    },
    {
      id: 'si_step_5',
      name: 'Governance & Legal Framework',
      description: 'Design governance structure and legal framework',
      estimatedDuration: '1-2 days',
      assignedSMEs: ['corporate_lawyer', 'tax_specialist'],
      inputs: ['Deal structure', 'Governance requirements'],
      outputs: ['Governance framework', 'Legal structure memo', 'Key terms'],
      dependencies: ['si_step_4'],
      automationLevel: 'assisted',
    },
    {
      id: 'si_step_6',
      name: 'Investment Committee Pack',
      description: 'Prepare IC-ready materials',
      estimatedDuration: '1-2 days',
      assignedSMEs: ['pe_director', 'mckinsey_strategist'],
      inputs: ['All previous outputs'],
      outputs: ['IC memo', 'Presentation', 'Risk assessment'],
      dependencies: ['si_step_5'],
      automationLevel: 'assisted',
      qaGate: {
        id: 'qa_si_final',
        name: 'IC Pack Approved',
        criteria: ['All sections complete', 'Recommendation clear', 'Risks addressed'],
        approvers: ['user'],
        tripleAIValidation: true,
        signOffRequired: true,
      },
    },
  ],
  
  deliverables: [
    {
      id: 'si_thesis',
      name: 'Investment Thesis',
      type: 'document',
      format: 'PDF',
      description: 'Strategic rationale and investment criteria',
      qualityStandard: 'Board-ready',
    },
    {
      id: 'si_target_analysis',
      name: 'Target Analysis',
      type: 'report',
      format: 'PDF',
      description: 'Detailed analysis of shortlisted targets',
      qualityStandard: 'Investment-grade',
    },
    {
      id: 'si_valuation',
      name: 'Valuation & Synergy Model',
      type: 'spreadsheet',
      format: 'XLSX',
      description: 'Detailed valuation with synergy quantification',
      qualityStandard: 'Investment-grade',
    },
    {
      id: 'si_ic_memo',
      name: 'Investment Committee Memo',
      type: 'document',
      format: 'PDF',
      description: 'IC-ready recommendation document',
      qualityStandard: 'IC-ready',
    },
  ],
  
  recommendedTeam: {
    lead: 'pe_director',
    core: ['mckinsey_strategist', 'investment_banker', 'cfo_expert'],
    specialists: ['corporate_lawyer', 'tax_specialist', 'market_analyst'],
  },
  
  qaGates: [
    {
      id: 'gate_si_thesis',
      name: 'Thesis Approved',
      criteria: ['Strategic rationale clear', 'Criteria defined'],
      approvers: ['user'],
      tripleAIValidation: false,
      signOffRequired: true,
    },
    {
      id: 'gate_si_analysis',
      name: 'Analysis Complete',
      criteria: ['Targets evaluated', 'Synergies quantified'],
      approvers: ['digital_twin'],
      tripleAIValidation: true,
      signOffRequired: true,
    },
    {
      id: 'gate_si_final',
      name: 'IC Pack Ready',
      criteria: ['All materials complete', 'Recommendation clear'],
      approvers: ['user'],
      tripleAIValidation: true,
      signOffRequired: true,
    },
  ],
  
  successCriteria: [
    'Clear strategic rationale documented',
    'Targets identified and evaluated',
    'Synergies quantified and validated',
    'Deal structure optimized',
    'IC-ready materials prepared',
  ],
};

// ============================================================================
// BLUEPRINT 5: GO-TO-MARKET STRATEGY
// ============================================================================

export const GO_TO_MARKET_BLUEPRINT: ProjectBlueprint = {
  id: 'go_to_market',
  name: 'Go-to-Market Strategy',
  description: 'Develop comprehensive go-to-market strategy for new products, services, or market entry.',
  category: 'strategy',
  estimatedDuration: '2-3 weeks',
  complexity: 'high',
  
  intakeQuestions: [
    {
      id: 'gtm_type',
      question: 'What type of GTM is this?',
      type: 'choice',
      required: true,
      options: [
        { value: 'new_product', label: 'New product launch' },
        { value: 'new_market', label: 'New market entry' },
        { value: 'expansion', label: 'Geographic expansion' },
        { value: 'pivot', label: 'Product pivot' },
        { value: 'relaunch', label: 'Product relaunch' },
      ],
      smeSource: 'gtm_specialist',
    },
    {
      id: 'product_description',
      question: 'Describe your product/service',
      type: 'text',
      required: true,
      smeSource: 'product_leader',
    },
    {
      id: 'target_segment',
      question: 'Who is your target customer?',
      type: 'text',
      required: true,
      helpText: 'Be as specific as possible',
      smeSource: 'gtm_specialist',
    },
    {
      id: 'competitive_advantage',
      question: 'What is your key competitive advantage?',
      type: 'text',
      required: true,
      smeSource: 'mckinsey_strategist',
    },
    {
      id: 'pricing_set',
      question: 'Do you have pricing defined?',
      type: 'yes_no',
      required: true,
      smeSource: 'gtm_specialist',
    },
    {
      id: 'pricing_details',
      question: 'What is your pricing model?',
      type: 'text',
      required: false,
      conditionalOn: { questionId: 'pricing_set', answer: 'yes' },
    },
    {
      id: 'channels',
      question: 'What sales/distribution channels will you use?',
      type: 'multi_select',
      required: true,
      options: [
        { value: 'direct_sales', label: 'Direct sales team' },
        { value: 'inside_sales', label: 'Inside sales' },
        { value: 'self_serve', label: 'Self-serve/PLG' },
        { value: 'partners', label: 'Channel partners' },
        { value: 'marketplace', label: 'Marketplace' },
        { value: 'retail', label: 'Retail' },
        { value: 'ecommerce', label: 'E-commerce' },
      ],
      smeSource: 'gtm_specialist',
    },
    {
      id: 'budget',
      question: 'What is your GTM budget?',
      type: 'choice',
      required: true,
      options: [
        { value: 'bootstrap', label: '< £50K' },
        { value: 'seed', label: '£50K - £250K' },
        { value: 'growth', label: '£250K - £1M' },
        { value: 'scale', label: '£1M+' },
      ],
      smeSource: 'cfo_expert',
    },
    {
      id: 'timeline',
      question: 'When do you want to launch?',
      type: 'choice',
      required: true,
      options: [
        { value: 'asap', label: 'ASAP (< 1 month)' },
        { value: 'quarter', label: 'This quarter' },
        { value: 'half', label: 'This half' },
        { value: 'year', label: 'This year' },
      ],
      smeSource: 'product_leader',
    },
  ],
  
  dataRequirements: {
    required: [
      'Product/service description',
      'Target customer definition',
      'Competitive positioning',
    ],
    optional: [
      'Market research',
      'Customer interviews',
      'Competitor analysis',
      'Pricing research',
      'Channel analysis',
    ],
    sources: [
      'Product team input',
      'Customer research',
      'Market data',
      'Competitor intelligence',
    ],
  },
  
  processSteps: [
    {
      id: 'gtm_step_1',
      name: 'Market & Customer Analysis',
      description: 'Deep dive on target market and customer segments',
      estimatedDuration: '2-3 days',
      assignedSMEs: ['market_analyst', 'gtm_specialist'],
      inputs: ['Product description', 'Target segment'],
      outputs: ['Market sizing', 'Customer personas', 'Segment prioritization'],
      dependencies: [],
      automationLevel: 'assisted',
    },
    {
      id: 'gtm_step_2',
      name: 'Competitive Positioning',
      description: 'Develop positioning and messaging framework',
      estimatedDuration: '1-2 days',
      assignedSMEs: ['mckinsey_strategist', 'gtm_specialist'],
      inputs: ['Market analysis', 'Competitive advantage'],
      outputs: ['Positioning statement', 'Messaging framework', 'Differentiation map'],
      dependencies: ['gtm_step_1'],
      automationLevel: 'assisted',
      qaGate: {
        id: 'qa_gtm_positioning',
        name: 'Positioning Approved',
        criteria: ['Positioning is differentiated', 'Messaging resonates', 'Competitive'],
        approvers: ['user'],
        tripleAIValidation: true,
        signOffRequired: true,
      },
    },
    {
      id: 'gtm_step_3',
      name: 'Pricing Strategy',
      description: 'Develop pricing model and strategy',
      estimatedDuration: '1-2 days',
      assignedSMEs: ['gtm_specialist', 'cfo_expert'],
      inputs: ['Positioning', 'Market data', 'Cost structure'],
      outputs: ['Pricing model', 'Pricing tiers', 'Competitive pricing analysis'],
      dependencies: ['gtm_step_2'],
      automationLevel: 'assisted',
    },
    {
      id: 'gtm_step_4',
      name: 'Channel Strategy',
      description: 'Design channel mix and partner strategy',
      estimatedDuration: '1-2 days',
      assignedSMEs: ['gtm_specialist', 'serial_entrepreneur'],
      inputs: ['Target segments', 'Budget', 'Timeline'],
      outputs: ['Channel strategy', 'Partner criteria', 'Sales model'],
      dependencies: ['gtm_step_2'],
      automationLevel: 'assisted',
    },
    {
      id: 'gtm_step_5',
      name: 'Marketing Plan',
      description: 'Develop marketing strategy and campaign plan',
      estimatedDuration: '2-3 days',
      assignedSMEs: ['gtm_specialist', 'product_leader'],
      inputs: ['Positioning', 'Channels', 'Budget'],
      outputs: ['Marketing strategy', 'Campaign plan', 'Content calendar'],
      dependencies: ['gtm_step_3', 'gtm_step_4'],
      automationLevel: 'assisted',
    },
    {
      id: 'gtm_step_6',
      name: 'Sales Enablement',
      description: 'Create sales tools and enablement materials',
      estimatedDuration: '2-3 days',
      assignedSMEs: ['gtm_specialist', 'serial_entrepreneur'],
      inputs: ['Positioning', 'Pricing', 'Competitive analysis'],
      outputs: ['Sales playbook', 'Battle cards', 'Demo scripts'],
      dependencies: ['gtm_step_3'],
      automationLevel: 'assisted',
    },
    {
      id: 'gtm_step_7',
      name: 'Launch Plan & Metrics',
      description: 'Finalize launch plan and success metrics',
      estimatedDuration: '1-2 days',
      assignedSMEs: ['product_leader', 'gtm_specialist', 'cfo_expert'],
      inputs: ['All previous outputs'],
      outputs: ['Launch plan', 'KPI dashboard', 'Milestone tracker'],
      dependencies: ['gtm_step_5', 'gtm_step_6'],
      automationLevel: 'assisted',
      qaGate: {
        id: 'qa_gtm_final',
        name: 'GTM Plan Approved',
        criteria: ['Plan is comprehensive', 'Metrics defined', 'Resources allocated'],
        approvers: ['user'],
        tripleAIValidation: true,
        signOffRequired: true,
      },
    },
  ],
  
  deliverables: [
    {
      id: 'gtm_strategy',
      name: 'GTM Strategy Document',
      type: 'document',
      format: 'PDF',
      description: 'Comprehensive go-to-market strategy',
      qualityStandard: 'Board-ready',
    },
    {
      id: 'gtm_positioning',
      name: 'Positioning & Messaging',
      type: 'document',
      format: 'PDF',
      description: 'Positioning statement and messaging framework',
      qualityStandard: 'Marketing-ready',
    },
    {
      id: 'gtm_pricing',
      name: 'Pricing Strategy',
      type: 'spreadsheet',
      format: 'XLSX',
      description: 'Pricing model with competitive analysis',
      qualityStandard: 'Board-ready',
    },
    {
      id: 'gtm_sales_playbook',
      name: 'Sales Playbook',
      type: 'document',
      format: 'PDF',
      description: 'Sales process, scripts, and battle cards',
      qualityStandard: 'Sales-ready',
    },
    {
      id: 'gtm_launch_plan',
      name: 'Launch Plan',
      type: 'document',
      format: 'PDF',
      description: 'Detailed launch timeline and checklist',
      qualityStandard: 'Execution-ready',
    },
  ],
  
  recommendedTeam: {
    lead: 'gtm_specialist',
    core: ['product_leader', 'mckinsey_strategist'],
    specialists: ['market_analyst', 'cfo_expert', 'serial_entrepreneur'],
  },
  
  qaGates: [
    {
      id: 'gate_gtm_positioning',
      name: 'Positioning Approved',
      criteria: ['Differentiated', 'Resonates with target'],
      approvers: ['user'],
      tripleAIValidation: true,
      signOffRequired: true,
    },
    {
      id: 'gate_gtm_final',
      name: 'GTM Plan Ready',
      criteria: ['All elements complete', 'Resources allocated'],
      approvers: ['user'],
      tripleAIValidation: true,
      signOffRequired: true,
    },
  ],
  
  successCriteria: [
    'Clear positioning and differentiation',
    'Pricing strategy validated',
    'Channel strategy defined',
    'Sales team enabled',
    'Launch plan executable',
  ],
};

// ============================================================================
// BLUEPRINT 6: DEEP RESEARCH
// ============================================================================

export const DEEP_RESEARCH_BLUEPRINT: ProjectBlueprint = {
  id: 'deep_research',
  name: 'Deep Research',
  description: 'Comprehensive research and analysis on any topic, market, or opportunity.',
  category: 'research',
  estimatedDuration: '1-2 weeks',
  complexity: 'medium',
  
  intakeQuestions: [
    {
      id: 'research_topic',
      question: 'What is the research topic or question?',
      type: 'text',
      required: true,
      smeSource: 'market_analyst',
    },
    {
      id: 'research_type',
      question: 'What type of research is this?',
      type: 'choice',
      required: true,
      options: [
        { value: 'market', label: 'Market research' },
        { value: 'competitive', label: 'Competitive intelligence' },
        { value: 'technology', label: 'Technology landscape' },
        { value: 'regulatory', label: 'Regulatory analysis' },
        { value: 'customer', label: 'Customer research' },
        { value: 'industry', label: 'Industry deep dive' },
        { value: 'custom', label: 'Custom research' },
      ],
      smeSource: 'market_analyst',
    },
    {
      id: 'research_depth',
      question: 'What depth of research is needed?',
      type: 'choice',
      required: true,
      options: [
        { value: 'quick', label: 'Quick scan (1-2 days)' },
        { value: 'standard', label: 'Standard (3-5 days)' },
        { value: 'deep', label: 'Deep dive (1-2 weeks)' },
        { value: 'comprehensive', label: 'Comprehensive (2+ weeks)' },
      ],
      smeSource: 'mckinsey_strategist',
    },
    {
      id: 'key_questions',
      question: 'What are the key questions to answer?',
      type: 'text',
      required: true,
      helpText: 'List 3-5 specific questions',
      smeSource: 'market_analyst',
    },
    {
      id: 'existing_knowledge',
      question: 'Do you have existing research or knowledge to share?',
      type: 'yes_no',
      required: true,
    },
    {
      id: 'knowledge_upload',
      question: 'Upload existing materials',
      type: 'file_upload',
      required: false,
      conditionalOn: { questionId: 'existing_knowledge', answer: 'yes' },
    },
    {
      id: 'output_format',
      question: 'What format do you need the output in?',
      type: 'multi_select',
      required: true,
      options: [
        { value: 'report', label: 'Written report' },
        { value: 'presentation', label: 'Presentation' },
        { value: 'data', label: 'Data/spreadsheet' },
        { value: 'brief', label: 'Executive brief' },
        { value: 'dashboard', label: 'Dashboard/visualization' },
      ],
      smeSource: 'mckinsey_strategist',
    },
  ],
  
  dataRequirements: {
    required: [
      'Research topic/question',
      'Key questions to answer',
      'Output format requirements',
    ],
    optional: [
      'Existing research',
      'Specific sources to include',
      'Competitors to analyze',
      'Geographic focus',
    ],
    sources: [
      'Industry databases',
      'Academic research',
      'News and publications',
      'Expert interviews',
      'Public filings',
    ],
  },
  
  processSteps: [
    {
      id: 'dr_step_1',
      name: 'Scope & Research Plan',
      description: 'Define scope, methodology, and research plan',
      estimatedDuration: '2-4 hours',
      assignedSMEs: ['market_analyst', 'mckinsey_strategist'],
      inputs: ['Research topic', 'Key questions'],
      outputs: ['Research plan', 'Source list', 'Timeline'],
      dependencies: [],
      automationLevel: 'assisted',
    },
    {
      id: 'dr_step_2',
      name: 'Data Collection',
      description: 'Gather data from primary and secondary sources',
      estimatedDuration: '2-5 days',
      assignedSMEs: ['market_analyst', 'data_scientist'],
      inputs: ['Research plan', 'Source list'],
      outputs: ['Raw data', 'Source documents', 'Interview notes'],
      dependencies: ['dr_step_1'],
      automationLevel: 'assisted',
    },
    {
      id: 'dr_step_3',
      name: 'Analysis & Synthesis',
      description: 'Analyze data and synthesize findings',
      estimatedDuration: '2-4 days',
      assignedSMEs: ['market_analyst', 'mckinsey_strategist', 'data_scientist'],
      inputs: ['Raw data', 'Key questions'],
      outputs: ['Analysis', 'Key findings', 'Insights'],
      dependencies: ['dr_step_2'],
      automationLevel: 'assisted',
      qaGate: {
        id: 'qa_dr_analysis',
        name: 'Analysis Validated',
        criteria: ['Questions answered', 'Sources cited', 'Insights actionable'],
        approvers: ['digital_twin'],
        tripleAIValidation: true,
        signOffRequired: true,
      },
    },
    {
      id: 'dr_step_4',
      name: 'Report Development',
      description: 'Create final deliverables',
      estimatedDuration: '1-2 days',
      assignedSMEs: ['market_analyst', 'mckinsey_strategist'],
      inputs: ['Analysis', 'Output format requirements'],
      outputs: ['Final report', 'Presentation', 'Data files'],
      dependencies: ['dr_step_3'],
      automationLevel: 'assisted',
      qaGate: {
        id: 'qa_dr_final',
        name: 'Deliverables Approved',
        criteria: ['All questions answered', 'Format correct', 'Quality validated'],
        approvers: ['user'],
        tripleAIValidation: true,
        signOffRequired: true,
      },
    },
  ],
  
  deliverables: [
    {
      id: 'dr_report',
      name: 'Research Report',
      type: 'report',
      format: 'PDF',
      description: 'Comprehensive research findings',
      qualityStandard: 'McKinsey-grade',
    },
    {
      id: 'dr_exec_summary',
      name: 'Executive Summary',
      type: 'document',
      format: 'PDF',
      description: '2-3 page summary of key findings',
      qualityStandard: 'Board-ready',
    },
    {
      id: 'dr_data',
      name: 'Supporting Data',
      type: 'spreadsheet',
      format: 'XLSX',
      description: 'Raw data and analysis',
      qualityStandard: 'Analysis-ready',
    },
  ],
  
  recommendedTeam: {
    lead: 'market_analyst',
    core: ['mckinsey_strategist', 'data_scientist'],
    specialists: ['bcg_growth'],
  },
  
  qaGates: [
    {
      id: 'gate_dr_plan',
      name: 'Plan Approved',
      criteria: ['Scope clear', 'Sources identified'],
      approvers: ['user'],
      tripleAIValidation: false,
      signOffRequired: true,
    },
    {
      id: 'gate_dr_final',
      name: 'Research Complete',
      criteria: ['Questions answered', 'Quality validated'],
      approvers: ['user'],
      tripleAIValidation: true,
      signOffRequired: true,
    },
  ],
  
  successCriteria: [
    'All key questions answered',
    'Sources credible and cited',
    'Insights actionable',
    'Format meets requirements',
  ],
};

// ============================================================================
// BLUEPRINT 7: FINANCIAL MODEL
// ============================================================================

export const FINANCIAL_MODEL_BLUEPRINT: ProjectBlueprint = {
  id: 'financial_model',
  name: 'Financial Model',
  description: 'Build comprehensive financial models for business planning, fundraising, or valuation.',
  category: 'capital',
  estimatedDuration: '1-2 weeks',
  complexity: 'high',
  
  intakeQuestions: [
    {
      id: 'model_purpose',
      question: 'What is the primary purpose of this model?',
      type: 'choice',
      required: true,
      options: [
        { value: 'fundraising', label: 'Fundraising' },
        { value: 'planning', label: 'Business planning' },
        { value: 'valuation', label: 'Valuation' },
        { value: 'budgeting', label: 'Budgeting' },
        { value: 'scenario', label: 'Scenario analysis' },
        { value: 'acquisition', label: 'M&A / Acquisition' },
      ],
      smeSource: 'cfo_expert',
    },
    {
      id: 'existing_model',
      question: 'Do you have an existing financial model?',
      type: 'yes_no',
      required: true,
      smeSource: 'cfo_expert',
    },
    {
      id: 'model_upload',
      question: 'Upload your existing model',
      type: 'file_upload',
      required: false,
      conditionalOn: { questionId: 'existing_model', answer: 'yes' },
    },
    {
      id: 'historical_data',
      question: 'How much historical data do you have?',
      type: 'choice',
      required: true,
      options: [
        { value: 'none', label: 'Pre-revenue / No history' },
        { value: 'partial', label: '< 1 year' },
        { value: 'one_year', label: '1 year' },
        { value: 'two_years', label: '2 years' },
        { value: 'three_plus', label: '3+ years' },
      ],
      smeSource: 'cfo_expert',
    },
    {
      id: 'financials_upload',
      question: 'Upload historical financials',
      type: 'file_upload',
      required: false,
      helpText: 'P&L, Balance Sheet, Cash Flow',
    },
    {
      id: 'projection_period',
      question: 'What projection period do you need?',
      type: 'choice',
      required: true,
      options: [
        { value: 'one_year', label: '1 year' },
        { value: 'three_years', label: '3 years' },
        { value: 'five_years', label: '5 years' },
        { value: 'ten_years', label: '10 years' },
      ],
      smeSource: 'investment_banker',
    },
    {
      id: 'granularity',
      question: 'What granularity do you need?',
      type: 'choice',
      required: true,
      options: [
        { value: 'annual', label: 'Annual only' },
        { value: 'quarterly', label: 'Quarterly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'monthly_annual', label: 'Monthly Y1, Annual thereafter' },
      ],
      smeSource: 'cfo_expert',
    },
    {
      id: 'business_model',
      question: 'What is your business model?',
      type: 'choice',
      required: true,
      options: [
        { value: 'saas', label: 'SaaS / Subscription' },
        { value: 'ecommerce', label: 'E-commerce' },
        { value: 'marketplace', label: 'Marketplace' },
        { value: 'services', label: 'Professional services' },
        { value: 'manufacturing', label: 'Manufacturing' },
        { value: 'retail', label: 'Retail' },
        { value: 'other', label: 'Other' },
      ],
      smeSource: 'cfo_expert',
    },
  ],
  
  dataRequirements: {
    required: [
      'Business model description',
      'Revenue drivers',
      'Cost structure',
    ],
    optional: [
      'Historical financials',
      'Existing model',
      'Unit economics',
      'Headcount plan',
      'Capex requirements',
    ],
    sources: [
      'Company financials',
      'Industry benchmarks',
      'Comparable companies',
    ],
  },
  
  processSteps: [
    {
      id: 'fm_step_1',
      name: 'Model Architecture Design',
      description: 'Design model structure, tabs, and logic flow',
      estimatedDuration: '4-8 hours',
      assignedSMEs: ['cfo_expert', 'investment_banker'],
      inputs: ['Model purpose', 'Business model', 'Granularity'],
      outputs: ['Model architecture', 'Tab structure', 'Formula logic'],
      dependencies: [],
      automationLevel: 'assisted',
    },
    {
      id: 'fm_step_2',
      name: 'Historical Analysis',
      description: 'Analyze historical data and establish baseline',
      estimatedDuration: '1-2 days',
      assignedSMEs: ['cfo_expert'],
      inputs: ['Historical financials'],
      outputs: ['Historical analysis', 'Trend analysis', 'Baseline metrics'],
      dependencies: ['fm_step_1'],
      automationLevel: 'assisted',
    },
    {
      id: 'fm_step_3',
      name: 'Assumptions Development',
      description: 'Develop and document key assumptions',
      estimatedDuration: '1-2 days',
      assignedSMEs: ['cfo_expert', 'mckinsey_strategist'],
      inputs: ['Historical analysis', 'Business plan'],
      outputs: ['Assumptions sheet', 'Driver documentation'],
      dependencies: ['fm_step_2'],
      automationLevel: 'assisted',
      qaGate: {
        id: 'qa_fm_assumptions',
        name: 'Assumptions Validated',
        criteria: ['Assumptions reasonable', 'Sources documented', 'Sensitivities identified'],
        approvers: ['user', 'cfo_expert'],
        tripleAIValidation: true,
        signOffRequired: true,
      },
    },
    {
      id: 'fm_step_4',
      name: 'Model Build',
      description: 'Build the financial model',
      estimatedDuration: '2-4 days',
      assignedSMEs: ['cfo_expert'],
      inputs: ['Architecture', 'Assumptions'],
      outputs: ['Working model', 'P&L', 'Balance Sheet', 'Cash Flow'],
      dependencies: ['fm_step_3'],
      automationLevel: 'assisted',
    },
    {
      id: 'fm_step_5',
      name: 'Scenario Analysis',
      description: 'Build scenarios and sensitivity analysis',
      estimatedDuration: '1-2 days',
      assignedSMEs: ['cfo_expert', 'investment_banker'],
      inputs: ['Working model'],
      outputs: ['Scenario analysis', 'Sensitivity tables', 'Charts'],
      dependencies: ['fm_step_4'],
      automationLevel: 'assisted',
    },
    {
      id: 'fm_step_6',
      name: 'Model Audit & Documentation',
      description: 'Audit formulas, document model, create user guide',
      estimatedDuration: '1-2 days',
      assignedSMEs: ['cfo_expert'],
      inputs: ['Complete model'],
      outputs: ['Audited model', 'Documentation', 'User guide'],
      dependencies: ['fm_step_5'],
      automationLevel: 'assisted',
      qaGate: {
        id: 'qa_fm_final',
        name: 'Model Validated',
        criteria: ['Formulas correct', 'Model balances', 'Documentation complete'],
        approvers: ['user', 'cfo_expert'],
        tripleAIValidation: true,
        signOffRequired: true,
      },
    },
  ],
  
  deliverables: [
    {
      id: 'fm_model',
      name: 'Financial Model',
      type: 'spreadsheet',
      format: 'XLSX',
      description: 'Complete financial model with scenarios',
      qualityStandard: 'Investment-grade',
    },
    {
      id: 'fm_assumptions',
      name: 'Assumptions Document',
      type: 'document',
      format: 'PDF',
      description: 'Documented assumptions and sources',
      qualityStandard: 'Audit-ready',
    },
    {
      id: 'fm_summary',
      name: 'Financial Summary',
      type: 'presentation',
      format: 'PPTX',
      description: 'Key outputs and charts',
      qualityStandard: 'Board-ready',
    },
  ],
  
  recommendedTeam: {
    lead: 'cfo_expert',
    core: ['investment_banker'],
    specialists: ['mckinsey_strategist', 'pe_director'],
  },
  
  qaGates: [
    {
      id: 'gate_fm_assumptions',
      name: 'Assumptions Approved',
      criteria: ['Reasonable', 'Documented'],
      approvers: ['user'],
      tripleAIValidation: true,
      signOffRequired: true,
    },
    {
      id: 'gate_fm_final',
      name: 'Model Validated',
      criteria: ['Formulas correct', 'Balances', 'Documented'],
      approvers: ['user'],
      tripleAIValidation: true,
      signOffRequired: true,
    },
  ],
  
  successCriteria: [
    'Model is accurate and balances',
    'Assumptions are reasonable and documented',
    'Scenarios provide useful insights',
    'Model is user-friendly and maintainable',
  ],
};

// ============================================================================
// BLUEPRINT 8: LEGAL/COMPLIANCE PACK
// ============================================================================

export const LEGAL_COMPLIANCE_BLUEPRINT: ProjectBlueprint = {
  id: 'legal_compliance',
  name: 'Legal/Compliance Pack',
  description: 'Prepare legal documentation and compliance frameworks for business operations or transactions.',
  category: 'compliance',
  estimatedDuration: '1-3 weeks',
  complexity: 'high',
  
  intakeQuestions: [
    {
      id: 'pack_type',
      question: 'What type of legal pack do you need?',
      type: 'choice',
      required: true,
      options: [
        { value: 'formation', label: 'Company formation' },
        { value: 'fundraising', label: 'Fundraising documents' },
        { value: 'employment', label: 'Employment/HR' },
        { value: 'commercial', label: 'Commercial contracts' },
        { value: 'ip', label: 'IP protection' },
        { value: 'compliance', label: 'Regulatory compliance' },
        { value: 'transaction', label: 'Transaction documents' },
      ],
      smeSource: 'corporate_lawyer',
    },
    {
      id: 'jurisdiction',
      question: 'What jurisdiction(s) apply?',
      type: 'multi_select',
      required: true,
      options: [
        { value: 'uk', label: 'United Kingdom' },
        { value: 'uae', label: 'UAE' },
        { value: 'us_de', label: 'US (Delaware)' },
        { value: 'us_other', label: 'US (Other)' },
        { value: 'eu', label: 'European Union' },
        { value: 'singapore', label: 'Singapore' },
        { value: 'other', label: 'Other' },
      ],
      smeSource: 'corporate_lawyer',
    },
    {
      id: 'existing_docs',
      question: 'Do you have existing legal documents to review?',
      type: 'yes_no',
      required: true,
      smeSource: 'corporate_lawyer',
    },
    {
      id: 'docs_upload',
      question: 'Upload existing documents',
      type: 'file_upload',
      required: false,
      conditionalOn: { questionId: 'existing_docs', answer: 'yes' },
    },
    {
      id: 'urgency',
      question: 'What is the urgency?',
      type: 'choice',
      required: true,
      options: [
        { value: 'urgent', label: 'Urgent (< 1 week)' },
        { value: 'standard', label: 'Standard (1-2 weeks)' },
        { value: 'planned', label: 'Planned (2-4 weeks)' },
      ],
      smeSource: 'corporate_lawyer',
    },
    {
      id: 'specific_requirements',
      question: 'Any specific requirements or concerns?',
      type: 'text',
      required: false,
      smeSource: 'corporate_lawyer',
    },
  ],
  
  dataRequirements: {
    required: [
      'Pack type',
      'Jurisdiction',
      'Business context',
    ],
    optional: [
      'Existing documents',
      'Specific requirements',
      'Stakeholder information',
    ],
    sources: [
      'Company records',
      'Existing agreements',
      'Regulatory requirements',
    ],
  },
  
  processSteps: [
    {
      id: 'lc_step_1',
      name: 'Requirements Analysis',
      description: 'Analyze requirements and create document checklist',
      estimatedDuration: '4-8 hours',
      assignedSMEs: ['corporate_lawyer'],
      inputs: ['Pack type', 'Jurisdiction', 'Context'],
      outputs: ['Requirements analysis', 'Document checklist', 'Timeline'],
      dependencies: [],
      automationLevel: 'assisted',
    },
    {
      id: 'lc_step_2',
      name: 'Existing Document Review',
      description: 'Review and assess existing documents',
      estimatedDuration: '1-3 days',
      assignedSMEs: ['corporate_lawyer'],
      inputs: ['Existing documents'],
      outputs: ['Gap analysis', 'Risk assessment', 'Update recommendations'],
      dependencies: ['lc_step_1'],
      automationLevel: 'assisted',
    },
    {
      id: 'lc_step_3',
      name: 'Document Drafting',
      description: 'Draft required documents',
      estimatedDuration: '3-7 days',
      assignedSMEs: ['corporate_lawyer', 'tax_specialist'],
      inputs: ['Requirements', 'Gap analysis'],
      outputs: ['Draft documents', 'Explanatory notes'],
      dependencies: ['lc_step_2'],
      automationLevel: 'assisted',
      qaGate: {
        id: 'qa_lc_drafts',
        name: 'Drafts Reviewed',
        criteria: ['Legally sound', 'Jurisdiction-appropriate', 'Business-aligned'],
        approvers: ['corporate_lawyer'],
        tripleAIValidation: true,
        signOffRequired: true,
      },
    },
    {
      id: 'lc_step_4',
      name: 'Compliance Check',
      description: 'Verify regulatory compliance',
      estimatedDuration: '1-2 days',
      assignedSMEs: ['corporate_lawyer', 'tax_specialist'],
      inputs: ['Draft documents'],
      outputs: ['Compliance checklist', 'Risk register'],
      dependencies: ['lc_step_3'],
      automationLevel: 'assisted',
    },
    {
      id: 'lc_step_5',
      name: 'Final Review & Sign-off',
      description: 'Final review and preparation for execution',
      estimatedDuration: '1-2 days',
      assignedSMEs: ['corporate_lawyer'],
      inputs: ['All documents', 'Compliance check'],
      outputs: ['Final documents', 'Execution checklist', 'Filing requirements'],
      dependencies: ['lc_step_4'],
      automationLevel: 'manual',
      qaGate: {
        id: 'qa_lc_final',
        name: 'Documents Approved',
        criteria: ['All documents complete', 'Compliance verified', 'Ready for execution'],
        approvers: ['user'],
        tripleAIValidation: true,
        signOffRequired: true,
      },
    },
  ],
  
  deliverables: [
    {
      id: 'lc_docs',
      name: 'Legal Document Pack',
      type: 'document',
      format: 'PDF',
      description: 'Complete set of legal documents',
      qualityStandard: 'Execution-ready',
    },
    {
      id: 'lc_checklist',
      name: 'Compliance Checklist',
      type: 'document',
      format: 'PDF',
      description: 'Regulatory compliance verification',
      qualityStandard: 'Audit-ready',
    },
    {
      id: 'lc_risk',
      name: 'Risk Register',
      type: 'spreadsheet',
      format: 'XLSX',
      description: 'Legal and compliance risks',
      qualityStandard: 'Board-ready',
    },
  ],
  
  recommendedTeam: {
    lead: 'corporate_lawyer',
    core: ['tax_specialist'],
    specialists: [],
  },
  
  qaGates: [
    {
      id: 'gate_lc_drafts',
      name: 'Drafts Approved',
      criteria: ['Legally sound', 'Business-aligned'],
      approvers: ['corporate_lawyer'],
      tripleAIValidation: true,
      signOffRequired: true,
    },
    {
      id: 'gate_lc_final',
      name: 'Pack Complete',
      criteria: ['All documents ready', 'Compliance verified'],
      approvers: ['user'],
      tripleAIValidation: true,
      signOffRequired: true,
    },
  ],
  
  successCriteria: [
    'All required documents prepared',
    'Regulatory compliance verified',
    'Risks identified and mitigated',
    'Documents ready for execution',
  ],
};

// ============================================================================
// BLUEPRINT 9: CUSTOM PROJECT
// ============================================================================

export const CUSTOM_PROJECT_BLUEPRINT: ProjectBlueprint = {
  id: 'custom',
  name: 'Custom Project',
  description: 'Flexible framework for custom projects that don\'t fit standard templates.',
  category: 'custom',
  estimatedDuration: 'Variable',
  complexity: 'medium',
  
  intakeQuestions: [
    {
      id: 'project_description',
      question: 'Describe your project in detail',
      type: 'text',
      required: true,
    },
    {
      id: 'desired_outcome',
      question: 'What is the desired outcome?',
      type: 'text',
      required: true,
    },
    {
      id: 'deliverables_needed',
      question: 'What deliverables do you need?',
      type: 'text',
      required: true,
    },
    {
      id: 'timeline',
      question: 'What is your timeline?',
      type: 'choice',
      required: true,
      options: [
        { value: 'urgent', label: 'Urgent (< 1 week)' },
        { value: 'standard', label: 'Standard (1-2 weeks)' },
        { value: 'extended', label: 'Extended (2-4 weeks)' },
        { value: 'flexible', label: 'Flexible' },
      ],
    },
    {
      id: 'existing_materials',
      question: 'Do you have existing materials to share?',
      type: 'yes_no',
      required: true,
    },
    {
      id: 'materials_upload',
      question: 'Upload your materials',
      type: 'file_upload',
      required: false,
      conditionalOn: { questionId: 'existing_materials', answer: 'yes' },
    },
    {
      id: 'expertise_needed',
      question: 'What expertise do you think is needed?',
      type: 'multi_select',
      required: false,
      options: [
        { value: 'strategy', label: 'Strategy' },
        { value: 'finance', label: 'Finance' },
        { value: 'legal', label: 'Legal' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'operations', label: 'Operations' },
        { value: 'technology', label: 'Technology' },
        { value: 'research', label: 'Research' },
      ],
    },
  ],
  
  dataRequirements: {
    required: [
      'Project description',
      'Desired outcome',
      'Deliverables needed',
    ],
    optional: [
      'Existing materials',
      'Specific requirements',
      'Constraints',
    ],
    sources: [
      'User input',
      'Uploaded materials',
    ],
  },
  
  processSteps: [
    {
      id: 'custom_step_1',
      name: 'Project Scoping',
      description: 'Define scope, approach, and team',
      estimatedDuration: '2-4 hours',
      assignedSMEs: ['mckinsey_strategist'],
      inputs: ['Project description', 'Desired outcome'],
      outputs: ['Project scope', 'Approach', 'Team recommendation'],
      dependencies: [],
      automationLevel: 'assisted',
      qaGate: {
        id: 'qa_custom_scope',
        name: 'Scope Approved',
        criteria: ['Scope clear', 'Approach agreed', 'Team assigned'],
        approvers: ['user'],
        tripleAIValidation: false,
        signOffRequired: true,
      },
    },
    {
      id: 'custom_step_2',
      name: 'Execution',
      description: 'Execute project according to agreed approach',
      estimatedDuration: 'Variable',
      assignedSMEs: ['mckinsey_strategist'],
      inputs: ['Approved scope'],
      outputs: ['Work products'],
      dependencies: ['custom_step_1'],
      automationLevel: 'assisted',
    },
    {
      id: 'custom_step_3',
      name: 'Review & Delivery',
      description: 'Final review and delivery',
      estimatedDuration: '4-8 hours',
      assignedSMEs: ['mckinsey_strategist'],
      inputs: ['Work products'],
      outputs: ['Final deliverables'],
      dependencies: ['custom_step_2'],
      automationLevel: 'manual',
      qaGate: {
        id: 'qa_custom_final',
        name: 'Deliverables Approved',
        criteria: ['Meets requirements', 'Quality validated'],
        approvers: ['user'],
        tripleAIValidation: true,
        signOffRequired: true,
      },
    },
  ],
  
  deliverables: [
    {
      id: 'custom_deliverables',
      name: 'Custom Deliverables',
      type: 'document',
      format: 'Variable',
      description: 'As defined in project scope',
      qualityStandard: 'As agreed',
    },
  ],
  
  recommendedTeam: {
    lead: 'mckinsey_strategist',
    core: [],
    specialists: [],
  },
  
  qaGates: [
    {
      id: 'gate_custom_scope',
      name: 'Scope Approved',
      criteria: ['Clear scope', 'Agreed approach'],
      approvers: ['user'],
      tripleAIValidation: false,
      signOffRequired: true,
    },
    {
      id: 'gate_custom_final',
      name: 'Project Complete',
      criteria: ['Deliverables complete', 'Quality approved'],
      approvers: ['user'],
      tripleAIValidation: true,
      signOffRequired: true,
    },
  ],
  
  successCriteria: [
    'Deliverables meet requirements',
    'User satisfied with outcome',
  ],
};

// ============================================================================
// CAPITAL MATCHING ENGINE
// ============================================================================

export interface InvestorProfile {
  id: string;
  name: string;
  type: 'angel' | 'hnwi' | 'family_office' | 'vc' | 'pe' | 'bank' | 'government' | 'strategic';
  ticketSize: {
    min: number;
    max: number;
    currency: string;
  };
  sectors: string[];
  stages: string[];
  geographies: string[];
  dealTypes: string[];
  contactInfo?: {
    name?: string;
    email?: string;
    linkedin?: string;
  };
  notes?: string;
}

export interface CapitalMatchCriteria {
  amount: number;
  currency: string;
  equityOffered?: number;
  valuation?: number;
  location: string;
  sector: string;
  stage: string;
  dealType: 'equity' | 'debt' | 'convertible' | 'grant' | 'jv';
  timeline: string;
  useOfFunds: string[];
}

export const INVESTOR_CATEGORIES = {
  angel: {
    name: 'Angel Networks',
    ticketRange: '£10K - £100K',
    description: 'Individual investors and angel networks for early-stage funding',
    bestFor: ['Pre-seed', 'Seed', 'First-time founders'],
  },
  hnwi: {
    name: 'High Net Worth Individuals',
    ticketRange: '£100K - £1M',
    description: 'Wealthy individuals investing personal capital',
    bestFor: ['Seed', 'Series A', 'Sector expertise'],
  },
  family_office: {
    name: 'Family Offices',
    ticketRange: '£1M - £10M',
    description: 'Private wealth management firms',
    bestFor: ['Series A+', 'Patient capital', 'Long-term partnerships'],
  },
  vc: {
    name: 'Venture Capital',
    ticketRange: '£500K - £50M',
    description: 'Institutional venture capital funds',
    bestFor: ['High-growth', 'Scalable businesses', 'Exit-focused'],
  },
  pe: {
    name: 'Private Equity',
    ticketRange: '£5M - £500M',
    description: 'Buyout and growth equity funds',
    bestFor: ['Established businesses', 'Buyouts', 'Growth capital'],
  },
  bank: {
    name: 'Banks & Debt Providers',
    ticketRange: 'Variable',
    description: 'Traditional lending, asset-backed, bridging',
    bestFor: ['Working capital', 'Asset purchases', 'Non-dilutive'],
  },
  government: {
    name: 'Government & Grants',
    ticketRange: '£10K - £10M',
    description: 'Innovation grants, regional development, R&D tax credits',
    bestFor: ['R&D', 'Innovation', 'Job creation'],
  },
  strategic: {
    name: 'Strategic Partners',
    ticketRange: 'Variable',
    description: 'Corporate venture, JVs, strategic investments',
    bestFor: ['Market access', 'Technology', 'Distribution'],
  },
};

export function matchInvestors(criteria: CapitalMatchCriteria): {
  category: string;
  reasoning: string;
  nextSteps: string[];
}[] {
  const matches: { category: string; reasoning: string; nextSteps: string[] }[] = [];
  
  // Amount-based routing
  if (criteria.amount <= 100000) {
    matches.push({
      category: 'angel',
      reasoning: `For raises under £100K, angel networks are typically the best fit. They offer quick decisions and often provide mentorship.`,
      nextSteps: [
        'Identify relevant angel networks in your sector',
        'Prepare a concise pitch deck',
        'Practice your 2-minute pitch',
        'Apply to angel network events',
      ],
    });
  }
  
  if (criteria.amount >= 100000 && criteria.amount <= 1000000) {
    matches.push({
      category: 'hnwi',
      reasoning: `HNWIs are ideal for £100K-£1M raises. They can move quickly and often bring sector expertise.`,
      nextSteps: [
        'Map your network for potential HNWIs',
        'Identify sector-specific investors',
        'Prepare detailed investment memo',
        'Set up warm introductions',
      ],
    });
  }
  
  if (criteria.amount >= 500000 && criteria.amount <= 50000000) {
    matches.push({
      category: 'vc',
      reasoning: `VCs are appropriate for £500K-£50M raises with high-growth potential and clear exit path.`,
      nextSteps: [
        'Research VCs active in your sector/stage',
        'Prepare VC-ready pitch deck',
        'Build financial model with scenarios',
        'Identify warm intro paths',
      ],
    });
  }
  
  if (criteria.amount >= 1000000 && criteria.amount <= 10000000) {
    matches.push({
      category: 'family_office',
      reasoning: `Family offices suit £1M-£10M raises, especially for patient capital and long-term partnerships.`,
      nextSteps: [
        'Research family offices in your geography',
        'Understand their investment thesis',
        'Prepare for longer relationship building',
        'Highlight alignment with their values',
      ],
    });
  }
  
  // Deal type routing
  if (criteria.dealType === 'debt') {
    matches.push({
      category: 'bank',
      reasoning: `Debt financing is non-dilutive and suitable for businesses with assets or predictable cash flows.`,
      nextSteps: [
        'Prepare detailed financial statements',
        'Document assets for collateral',
        'Research lending criteria',
        'Compare rates across providers',
      ],
    });
  }
  
  if (criteria.dealType === 'grant') {
    matches.push({
      category: 'government',
      reasoning: `Government grants are non-dilutive and ideal for R&D, innovation, or job creation.`,
      nextSteps: [
        'Research available grant programs',
        'Check eligibility criteria',
        'Prepare grant application',
        'Document innovation/R&D activities',
      ],
    });
  }
  
  if (criteria.dealType === 'jv') {
    matches.push({
      category: 'strategic',
      reasoning: `Strategic partners can provide capital plus market access, technology, or distribution.`,
      nextSteps: [
        'Identify potential strategic partners',
        'Develop partnership value proposition',
        'Prepare JV structure options',
        'Initiate business development outreach',
      ],
    });
  }
  
  return matches;
}

// ============================================================================
// BLUEPRINT REGISTRY
// ============================================================================

export const PROJECT_BLUEPRINTS: Record<string, ProjectBlueprint> = {
  new_business: NEW_BUSINESS_BLUEPRINT,
  due_diligence: DUE_DILIGENCE_BLUEPRINT,
  investor_presentation: INVESTOR_PRESENTATION_BLUEPRINT,
  strategic_investment: STRATEGIC_INVESTMENT_BLUEPRINT,
  go_to_market: GO_TO_MARKET_BLUEPRINT,
  deep_research: DEEP_RESEARCH_BLUEPRINT,
  financial_model: FINANCIAL_MODEL_BLUEPRINT,
  legal_compliance: LEGAL_COMPLIANCE_BLUEPRINT,
  custom: CUSTOM_PROJECT_BLUEPRINT,
};

export const BLUEPRINT_CATEGORIES = [
  {
    id: 'capital',
    name: 'Capital & Fundraising',
    description: 'Raise money, prepare investor materials, structure deals',
    blueprints: ['new_business', 'investor_presentation', 'financial_model'],
  },
  {
    id: 'strategy',
    name: 'Strategy & Growth',
    description: 'Strategic planning, market entry, growth initiatives',
    blueprints: ['strategic_investment', 'go_to_market'],
  },
  {
    id: 'research',
    name: 'Research & Analysis',
    description: 'Deep research, due diligence, market intelligence',
    blueprints: ['due_diligence', 'deep_research'],
  },
  {
    id: 'compliance',
    name: 'Legal & Compliance',
    description: 'Legal documentation, regulatory compliance, governance',
    blueprints: ['legal_compliance'],
  },
  {
    id: 'custom',
    name: 'Custom Projects',
    description: 'Flexible framework for unique requirements',
    blueprints: ['custom'],
  },
];

export function getBlueprintById(id: string): ProjectBlueprint | undefined {
  return PROJECT_BLUEPRINTS[id];
}

export function getBlueprintsByCategory(category: string): ProjectBlueprint[] {
  const categoryConfig = BLUEPRINT_CATEGORIES.find(c => c.id === category);
  if (!categoryConfig) return [];
  return categoryConfig.blueprints.map(id => PROJECT_BLUEPRINTS[id]).filter(Boolean);
}
