// Genesis Blueprint - Master Document Data Structure

export interface GenesisBlueprint {
  id: string;
  name: string;
  status: 'draft' | 'in_review' | 'approved' | 'needs_update';
  version: number;
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  approvedBy?: string;

  // Project Type Detection
  projectType: 'new_company' | 'existing_business' | 'specific_deliverable' | 'unknown';
  
  // Core Business Information
  businessInfo: {
    companyName: string;
    industry: string;
    subSector?: string;
    stage: 'idea' | 'pre_seed' | 'seed' | 'series_a' | 'series_b' | 'growth' | 'established';
    description: string;
    mission?: string;
    vision?: string;
    values?: string[];
  };

  // Strategic Objectives
  objectives: {
    primary: string;
    secondary: string[];
    timeframe: '3_months' | '6_months' | '1_year' | '3_years' | '5_years';
    successMetrics: SuccessMetric[];
  };

  // Market Analysis
  marketAnalysis: {
    tam: number; // Total Addressable Market
    sam: number; // Serviceable Addressable Market
    som: number; // Serviceable Obtainable Market
    marketTrends: string[];
    growthRate?: number;
    keyDrivers: string[];
  };

  // Competitive Landscape
  competitors: Competitor[];
  competitiveAdvantage: string[];
  
  // SWOT Analysis
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };

  // Target Audience
  targetAudience: {
    primaryPersonas: CustomerPersona[];
    secondaryPersonas: CustomerPersona[];
    painPoints: string[];
    desiredOutcomes: string[];
  };

  // Value Proposition
  valueProposition: {
    headline: string;
    subheadline: string;
    keyBenefits: string[];
    differentiators: string[];
  };

  // Revenue Model
  revenueModel: {
    type: 'subscription' | 'transactional' | 'freemium' | 'marketplace' | 'licensing' | 'hybrid';
    pricingStrategy: string;
    revenueStreams: RevenueStream[];
    projections: FinancialProjection[];
  };

  // Risk Assessment
  risks: Risk[];

  // Team & Resources
  team: {
    currentTeam: TeamMember[];
    requiredRoles: string[];
    advisors?: string[];
    capabilityGaps: string[];
  };

  // Timeline & Milestones
  timeline: {
    startDate: Date;
    targetLaunchDate?: Date;
    milestones: Milestone[];
  };

  // Keywords & Messaging
  keywords: {
    primary: string[];
    secondary: string[];
    avoidWords: string[];
    brandVoice: string;
    toneAttributes: string[];
  };

  // Uploaded Documents
  documents: UploadedDocument[];

  // SME Reviews & Approvals
  smeReviews: SMEReview[];

  // Linked Sub-Blueprints
  linkedBlueprints: LinkedBlueprint[];

  // Decision Log
  decisions: Decision[];

  // Chief of Staff Learning
  learnings: Learning[];
}

export interface SuccessMetric {
  name: string;
  target: string;
  currentValue?: string;
  measurementMethod: string;
}

export interface Competitor {
  name: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  marketShare?: number;
  pricing?: string;
  differentiator: string;
}

export interface CustomerPersona {
  name: string;
  role: string;
  demographics: string;
  goals: string[];
  frustrations: string[];
  preferredChannels: string[];
  decisionFactors: string[];
}

export interface RevenueStream {
  name: string;
  type: string;
  percentage: number;
  description: string;
}

export interface FinancialProjection {
  period: string;
  revenue: number;
  costs: number;
  profit: number;
  assumptions: string[];
}

export interface Risk {
  id: string;
  category: 'market' | 'financial' | 'operational' | 'regulatory' | 'competitive' | 'technical';
  description: string;
  likelihood: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
  owner?: string;
  status: 'identified' | 'mitigating' | 'resolved' | 'accepted';
}

export interface TeamMember {
  name: string;
  role: string;
  expertise: string[];
  allocation: number; // percentage
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  targetDate: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  dependencies: string[];
  deliverables: string[];
}

export interface UploadedDocument {
  id: string;
  name: string;
  type: 'strategic_plan' | 'pitch_deck' | 'business_plan' | 'financial_model' | 'market_research' | 'other';
  uploadedAt: Date;
  extractedInsights: string[];
  aiSummary?: string;
  url: string;
}

export interface SMEReview {
  id: string;
  expertId: string;
  expertName: string;
  expertAvatar: string;
  section: string;
  status: 'pending' | 'approved' | 'changes_requested' | 'in_progress';
  comments: string[];
  recommendations: string[];
  weight: number; // 1-10, how much authority on this topic
  reviewedAt?: Date;
}

export interface LinkedBlueprint {
  id: string;
  type: 'presentation' | 'social_media' | 'financial_model' | 'marketing' | 'operations';
  name: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'needs_update';
  inheritedFields: string[];
  lastSyncedAt?: Date;
}

export interface Decision {
  id: string;
  timestamp: Date;
  section: string;
  question: string;
  options: string[];
  selectedOption: string;
  decidedBy: 'user' | 'digital_twin' | 'sme';
  smeId?: string;
  reasoning: string;
  confidence: number; // 0-100
  userOverride?: boolean;
}

export interface Learning {
  id: string;
  timestamp: Date;
  type: 'preference' | 'pattern' | 'correction' | 'feedback';
  context: string;
  insight: string;
  appliedTo: string[];
}

// Wizard Question Types
export interface WizardQuestion {
  id: string;
  section: string;
  question: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'yesno' | 'scale' | 'upload';
  options?: string[];
  placeholder?: string;
  required: boolean;
  helpText?: string;
  dependsOn?: {
    questionId: string;
    value: string | string[];
  };
  skipIf?: {
    documentType: string;
    field: string;
  };
  smeRelevant?: string[]; // Which SME categories should review this
  weight?: number; // Importance for downstream blueprints
}

// Initial wizard questions for adaptive flow
export const genesisWizardQuestions: WizardQuestion[] = [
  // Entry Point
  {
    id: 'project_goal',
    section: 'entry',
    question: 'What are you trying to achieve?',
    type: 'select',
    options: [
      'Build a completely new company from scratch',
      'Develop strategy for an existing business',
      'Create a specific deliverable (presentation, pitch deck, etc.)',
      'Explore an idea and validate the opportunity'
    ],
    required: true,
    helpText: 'This helps us tailor the process to your needs'
  },
  {
    id: 'has_documents',
    section: 'entry',
    question: 'Do you have existing strategic documents to upload?',
    type: 'yesno',
    required: true,
    helpText: 'Business plans, pitch decks, market research - we can extract key info automatically'
  },
  {
    id: 'document_upload',
    section: 'entry',
    question: 'Upload your documents',
    type: 'upload',
    required: false,
    dependsOn: { questionId: 'has_documents', value: 'yes' },
    helpText: 'We\'ll analyze these and pre-fill relevant sections'
  },

  // Business Basics
  {
    id: 'company_name',
    section: 'business',
    question: 'What is the company/project name?',
    type: 'text',
    placeholder: 'e.g., Sample Project AI',
    required: true,
    skipIf: { documentType: 'pitch_deck', field: 'companyName' }
  },
  {
    id: 'industry',
    section: 'business',
    question: 'What industry are you in?',
    type: 'select',
    options: [
      'Technology', 'Healthcare', 'Finance', 'Media & Entertainment', 
      'E-commerce', 'Education', 'Real Estate', 'Energy', 'Manufacturing',
      'Professional Services', 'Consumer Goods', 'Transportation', 'Other'
    ],
    required: true,
    smeRelevant: ['sector_specialist']
  },
  {
    id: 'stage',
    section: 'business',
    question: 'What stage is the business at?',
    type: 'select',
    options: [
      'Just an idea', 'Pre-seed (building MVP)', 'Seed (early traction)',
      'Series A (scaling)', 'Series B+ (growth)', 'Established business'
    ],
    required: true,
    smeRelevant: ['investment_expert', 'strategy_expert']
  },
  {
    id: 'description',
    section: 'business',
    question: 'Describe what the business does in 2-3 sentences',
    type: 'textarea',
    placeholder: 'We help [target customer] achieve [outcome] by [how we do it differently]...',
    required: true,
    smeRelevant: ['strategy_expert', 'marketing_expert']
  },

  // Objectives
  {
    id: 'primary_objective',
    section: 'objectives',
    question: 'What is your primary objective right now?',
    type: 'select',
    options: [
      'Raise investment', 'Launch product/service', 'Grow revenue',
      'Expand to new markets', 'Build brand awareness', 'Acquire customers',
      'Develop partnerships', 'Prepare for exit', 'Other'
    ],
    required: true,
    smeRelevant: ['strategy_expert', 'investment_expert']
  },
  {
    id: 'timeframe',
    section: 'objectives',
    question: 'What timeframe are you working towards?',
    type: 'select',
    options: ['3 months', '6 months', '1 year', '3 years', '5 years'],
    required: true
  },
  {
    id: 'success_definition',
    section: 'objectives',
    question: 'How will you measure success?',
    type: 'textarea',
    placeholder: 'e.g., $1M ARR, 10,000 users, Series A closed...',
    required: true,
    smeRelevant: ['data_scientist', 'strategy_expert']
  },

  // Market
  {
    id: 'target_customer',
    section: 'market',
    question: 'Who is your ideal customer?',
    type: 'textarea',
    placeholder: 'Describe your target customer in detail...',
    required: true,
    smeRelevant: ['marketing_expert', 'sector_specialist']
  },
  {
    id: 'problem_solved',
    section: 'market',
    question: 'What problem do you solve for them?',
    type: 'textarea',
    placeholder: 'The key pain point or frustration you address...',
    required: true,
    smeRelevant: ['strategy_expert', 'sector_specialist']
  },
  {
    id: 'competitors_known',
    section: 'market',
    question: 'Do you know your main competitors?',
    type: 'yesno',
    required: true
  },
  {
    id: 'competitor_names',
    section: 'market',
    question: 'List your main competitors',
    type: 'textarea',
    placeholder: 'Company 1, Company 2, Company 3...',
    dependsOn: { questionId: 'competitors_known', value: 'yes' },
    required: false,
    smeRelevant: ['competitive_intelligence', 'sector_specialist']
  },

  // Differentiation
  {
    id: 'unique_advantage',
    section: 'differentiation',
    question: 'What makes you different from competitors?',
    type: 'textarea',
    placeholder: 'Your unique value proposition or competitive advantage...',
    required: true,
    smeRelevant: ['strategy_expert', 'marketing_expert']
  },
  {
    id: 'moat',
    section: 'differentiation',
    question: 'What is your defensible moat?',
    type: 'multiselect',
    options: [
      'Proprietary technology', 'Network effects', 'Brand', 'Data advantage',
      'Regulatory/licensing', 'Switching costs', 'Cost advantages', 'Talent',
      'First mover', 'Partnerships', 'Not sure yet'
    ],
    required: true,
    smeRelevant: ['strategy_expert', 'investment_expert']
  },

  // Revenue
  {
    id: 'revenue_model',
    section: 'revenue',
    question: 'How do you make money?',
    type: 'select',
    options: [
      'Subscription (recurring)', 'Transaction fees', 'Freemium',
      'Marketplace commission', 'Licensing', 'One-time purchase',
      'Advertising', 'Hybrid', 'Still figuring it out'
    ],
    required: true,
    smeRelevant: ['finance_expert', 'strategy_expert']
  },
  {
    id: 'pricing',
    section: 'revenue',
    question: 'What is your pricing strategy?',
    type: 'textarea',
    placeholder: 'e.g., $99/month per user, 2.5% transaction fee...',
    required: false,
    smeRelevant: ['finance_expert', 'marketing_expert']
  },

  // Resources
  {
    id: 'team_size',
    section: 'resources',
    question: 'How many people are on the team?',
    type: 'select',
    options: ['Just me', '2-5', '6-10', '11-25', '26-50', '50+'],
    required: true
  },
  {
    id: 'funding_status',
    section: 'resources',
    question: 'What is your current funding status?',
    type: 'select',
    options: [
      'Bootstrapped', 'Friends & family', 'Angel funded', 'Seed funded',
      'Series A+', 'Profitable/self-sustaining', 'Looking to raise'
    ],
    required: true,
    smeRelevant: ['investment_expert', 'finance_expert']
  },
  {
    id: 'key_challenges',
    section: 'resources',
    question: 'What are your biggest challenges right now?',
    type: 'multiselect',
    options: [
      'Funding', 'Hiring', 'Product development', 'Customer acquisition',
      'Market validation', 'Competition', 'Regulatory', 'Operations',
      'Technology', 'Partnerships', 'Strategy clarity'
    ],
    required: true,
    smeRelevant: ['strategy_expert']
  }
];

// SME mapping for auto-engagement
export const smeMapping: Record<string, string[]> = {
  'sector_specialist': ['Technology', 'Healthcare', 'Finance', 'Media & Entertainment'],
  'strategy_expert': ['objectives', 'differentiation', 'market'],
  'investment_expert': ['revenue', 'resources', 'objectives'],
  'marketing_expert': ['differentiation', 'market', 'business'],
  'finance_expert': ['revenue', 'resources'],
  'data_scientist': ['objectives', 'market'],
  'competitive_intelligence': ['market', 'differentiation'],
  'legal_expert': ['resources', 'risks'],
  'operations_expert': ['resources', 'timeline']
};

// Corporate partner mapping by industry
export const corporatePartnerMapping: Record<string, string[]> = {
  'Technology': ['NVIDIA', 'Meta', 'Tesla'],
  'Healthcare': ['McKinsey & Company', 'PwC'],
  'Finance': ['BlackRock', 'Morgan Stanley', 'PwC'],
  'Media & Entertainment': ['Netflix', 'Meta'],
  'E-commerce': ['Meta', 'McKinsey & Company'],
  'Professional Services': ['McKinsey & Company', 'PwC'],
  'Aerospace': ['NASA', 'Tesla']
};
