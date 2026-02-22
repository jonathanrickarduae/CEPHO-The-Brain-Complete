// External SME Resources - Real company connections and expert portals

export interface ExternalSMEResource {
  id: string;
  name: string;
  category: 'consulting' | 'research' | 'media' | 'ai_platform' | 'training' | 'data';
  description: string;
  logoUrl: string;
  portalUrl: string;
  hasApi: boolean;
  apiStatus: 'connected' | 'available' | 'coming_soon' | 'none';
  specializations: string[];
  accessType: 'free' | 'subscription' | 'enterprise';
  features: string[];
}

export const EXTERNAL_SME_RESOURCES: ExternalSMEResource[] = [
  // Consulting Firms
  {
    id: 'mckinsey',
    name: 'McKinsey & Company',
    category: 'consulting',
    description: 'Global management consulting with deep industry expertise and proprietary research.',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/McKinsey_and_Company_Logo_1.svg/1200px-McKinsey_and_Company_Logo_1.svg.png',
    portalUrl: 'https://www.mckinsey.com/capabilities/mckinsey-digital/how-we-help-clients',
    hasApi: false,
    apiStatus: 'none',
    specializations: ['Strategy', 'Digital Transformation', 'Operations', 'M&A', 'Organization'],
    accessType: 'enterprise',
    features: ['Industry Reports', 'Expert Consultations', 'Benchmarking Data', 'Transformation Frameworks']
  },
  {
    id: 'bcg',
    name: 'Boston Consulting Group',
    category: 'consulting',
    description: 'Strategic advisory with expertise in innovation, growth, and digital transformation.',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Boston_Consulting_Group_2020_logo.svg/1200px-Boston_Consulting_Group_2020_logo.svg.png',
    portalUrl: 'https://www.bcg.com/capabilities',
    hasApi: false,
    apiStatus: 'none',
    specializations: ['Growth Strategy', 'Innovation', 'Technology', 'Sustainability', 'People & Organization'],
    accessType: 'enterprise',
    features: ['Strategy Frameworks', 'Industry Insights', 'Digital Consulting', 'Change Management']
  },
  {
    id: 'bain',
    name: 'Bain & Company',
    category: 'consulting',
    description: 'Results-focused consulting with expertise in private equity and customer strategy.',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Bain_and_Company_Logo_1.svg/1200px-Bain_and_Company_Logo_1.svg.png',
    portalUrl: 'https://www.bain.com/consulting-services/',
    hasApi: false,
    apiStatus: 'none',
    specializations: ['Private Equity', 'Customer Strategy', 'Performance Improvement', 'M&A', 'Digital'],
    accessType: 'enterprise',
    features: ['NPS Methodology', 'PE Due Diligence', 'Customer Insights', 'Operational Excellence']
  },
  {
    id: 'pwc',
    name: 'PwC',
    category: 'consulting',
    description: 'Professional services network with audit, tax, and advisory capabilities.',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/PricewaterhouseCoopers_Logo.svg/1200px-PricewaterhouseCoopers_Logo.svg.png',
    portalUrl: 'https://www.pwc.com/gx/en/services/consulting.html',
    hasApi: false,
    apiStatus: 'none',
    specializations: ['Audit', 'Tax', 'Advisory', 'Risk', 'Technology'],
    accessType: 'enterprise',
    features: ['Financial Advisory', 'Tax Planning', 'Risk Management', 'Digital Solutions']
  },
  {
    id: 'deloitte',
    name: 'Deloitte',
    category: 'consulting',
    description: 'Largest professional services network with comprehensive business advisory.',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Deloitte.svg/1200px-Deloitte.svg.png',
    portalUrl: 'https://www2.deloitte.com/global/en/services/consulting-deloitte.html',
    hasApi: false,
    apiStatus: 'none',
    specializations: ['Audit', 'Consulting', 'Tax', 'Risk Advisory', 'Financial Advisory'],
    accessType: 'enterprise',
    features: ['Industry Solutions', 'Technology Implementation', 'Human Capital', 'Analytics']
  },

  // Research & Media
  {
    id: 'economist',
    name: 'The Economist',
    category: 'media',
    description: 'Global news and analysis with deep economic and political intelligence.',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/The_Economist_Logo.svg/1200px-The_Economist_Logo.svg.png',
    portalUrl: 'https://www.economist.com/intelligence',
    hasApi: true,
    apiStatus: 'available',
    specializations: ['Economics', 'Politics', 'Business', 'Finance', 'Technology'],
    accessType: 'subscription',
    features: ['Economic Analysis', 'Country Reports', 'Industry Forecasts', 'Political Risk Assessment']
  },
  {
    id: 'ft',
    name: 'Financial Times',
    category: 'media',
    description: 'Premier business and financial news with market intelligence and analysis.',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Financial_Times_corporate_logo_%28no_background%29.svg/1200px-Financial_Times_corporate_logo_%28no_background%29.svg.png',
    portalUrl: 'https://www.ft.com/',
    hasApi: true,
    apiStatus: 'available',
    specializations: ['Finance', 'Markets', 'Business', 'Economics', 'Technology'],
    accessType: 'subscription',
    features: ['Market Data', 'Company Analysis', 'Industry News', 'Opinion & Analysis']
  },
  {
    id: 'bloomberg',
    name: 'Bloomberg',
    category: 'media',
    description: 'Financial data, analytics, and news platform for professionals.',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/New_Bloomberg_Logo.svg/1200px-New_Bloomberg_Logo.svg.png',
    portalUrl: 'https://www.bloomberg.com/professional/',
    hasApi: true,
    apiStatus: 'available',
    specializations: ['Financial Data', 'Markets', 'News', 'Analytics', 'Trading'],
    accessType: 'enterprise',
    features: ['Terminal Access', 'Real-time Data', 'Analytics', 'News Feed']
  },
  {
    id: 'hbr',
    name: 'Harvard Business Review',
    category: 'research',
    description: 'Leading management thinking and business strategy insights.',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Harvard_Business_Review_Logo.svg/1200px-Harvard_Business_Review_Logo.svg.png',
    portalUrl: 'https://hbr.org/',
    hasApi: false,
    apiStatus: 'none',
    specializations: ['Management', 'Leadership', 'Strategy', 'Innovation', 'Marketing'],
    accessType: 'subscription',
    features: ['Case Studies', 'Research Articles', 'Leadership Insights', 'Strategy Frameworks']
  },

  // AI Platforms
  {
    id: 'delphi',
    name: 'Delphi.ai',
    category: 'ai_platform',
    description: 'Create AI clones of experts and thought leaders for scalable knowledge sharing.',
    logoUrl: 'https://delphi.ai/logo.png',
    portalUrl: 'https://www.delphi.ai/',
    hasApi: true,
    apiStatus: 'available',
    specializations: ['AI Clones', 'Knowledge Scaling', 'Expert Access', 'Coaching', 'Training'],
    accessType: 'subscription',
    features: ['Expert AI Clones', 'Conversational AI', 'Knowledge Base', 'Coaching Bots']
  },
  {
    id: 'perplexity',
    name: 'Perplexity AI',
    category: 'ai_platform',
    description: 'AI-powered research assistant with real-time web search and citations.',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Perplexity_AI_logo.png',
    portalUrl: 'https://www.perplexity.ai/',
    hasApi: true,
    apiStatus: 'connected',
    specializations: ['Research', 'Search', 'Analysis', 'Citations', 'Fact-checking'],
    accessType: 'free',
    features: ['Real-time Search', 'Source Citations', 'Research Synthesis', 'Follow-up Questions']
  },
  {
    id: 'anthropic',
    name: 'Anthropic (Claude)',
    category: 'ai_platform',
    description: 'Advanced AI assistant with strong reasoning and analysis capabilities.',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Anthropic_logo.svg/1200px-Anthropic_logo.svg.png',
    portalUrl: 'https://www.anthropic.com/',
    hasApi: true,
    apiStatus: 'connected',
    specializations: ['Analysis', 'Writing', 'Coding', 'Research', 'Strategy'],
    accessType: 'subscription',
    features: ['Long Context', 'Document Analysis', 'Code Generation', 'Strategic Thinking']
  },
  {
    id: 'openai',
    name: 'OpenAI (GPT)',
    category: 'ai_platform',
    description: 'Leading AI models for text, code, and multimodal applications.',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/OpenAI_Logo.svg/1200px-OpenAI_Logo.svg.png',
    portalUrl: 'https://openai.com/',
    hasApi: true,
    apiStatus: 'connected',
    specializations: ['General AI', 'Code', 'Vision', 'Voice', 'Reasoning'],
    accessType: 'subscription',
    features: ['GPT-4', 'DALL-E', 'Whisper', 'Assistants API']
  },

  // Data & Research Platforms
  {
    id: 'statista',
    name: 'Statista',
    category: 'data',
    description: 'Statistics, market data, and industry reports from 22,500+ sources.',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Statista_Logo.svg/1200px-Statista_Logo.svg.png',
    portalUrl: 'https://www.statista.com/',
    hasApi: true,
    apiStatus: 'available',
    specializations: ['Statistics', 'Market Data', 'Industry Reports', 'Consumer Insights', 'Forecasts'],
    accessType: 'subscription',
    features: ['Data Downloads', 'Industry Reports', 'Infographics', 'Market Forecasts']
  },
  {
    id: 'gartner',
    name: 'Gartner',
    category: 'research',
    description: 'Technology research and advisory for enterprise decision-making.',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Gartner_logo.svg/1200px-Gartner_logo.svg.png',
    portalUrl: 'https://www.gartner.com/',
    hasApi: false,
    apiStatus: 'none',
    specializations: ['Technology', 'IT Strategy', 'Digital Business', 'Supply Chain', 'Marketing'],
    accessType: 'enterprise',
    features: ['Magic Quadrant', 'Research Reports', 'Peer Insights', 'Expert Calls']
  },
  {
    id: 'forrester',
    name: 'Forrester',
    category: 'research',
    description: 'Customer-obsessed research and advisory for business and technology.',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Forrester_Research_logo.svg/1200px-Forrester_Research_logo.svg.png',
    portalUrl: 'https://www.forrester.com/',
    hasApi: false,
    apiStatus: 'none',
    specializations: ['Customer Experience', 'Technology', 'Marketing', 'Sales', 'Product'],
    accessType: 'enterprise',
    features: ['Wave Reports', 'Research', 'Consulting', 'Events']
  },
  {
    id: 'cbinsights',
    name: 'CB Insights',
    category: 'data',
    description: 'Market intelligence on emerging technology and venture capital.',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/CB_Insights_logo.svg/1200px-CB_Insights_logo.svg.png',
    portalUrl: 'https://www.cbinsights.com/',
    hasApi: true,
    apiStatus: 'available',
    specializations: ['Startups', 'VC', 'Emerging Tech', 'Market Maps', 'Company Data'],
    accessType: 'enterprise',
    features: ['Company Database', 'Market Maps', 'Trend Analysis', 'VC Tracking']
  },

  // Training & Development
  {
    id: 'linkedin_learning',
    name: 'LinkedIn Learning',
    category: 'training',
    description: 'Professional development courses from industry experts.',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/LinkedIn_Logo.svg/1200px-LinkedIn_Logo.svg.png',
    portalUrl: 'https://www.linkedin.com/learning/',
    hasApi: true,
    apiStatus: 'available',
    specializations: ['Business', 'Technology', 'Creative', 'Leadership', 'Marketing'],
    accessType: 'subscription',
    features: ['Video Courses', 'Certificates', 'Learning Paths', 'Skill Assessments']
  },
  {
    id: 'coursera',
    name: 'Coursera',
    category: 'training',
    description: 'University courses and professional certificates from top institutions.',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Coursera-Logo_600x600.svg/1200px-Coursera-Logo_600x600.svg.png',
    portalUrl: 'https://www.coursera.org/',
    hasApi: false,
    apiStatus: 'none',
    specializations: ['Business', 'Data Science', 'Technology', 'Health', 'Arts'],
    accessType: 'subscription',
    features: ['University Courses', 'Degrees', 'Certificates', 'Specializations']
  },
  {
    id: 'masterclass',
    name: 'MasterClass',
    category: 'training',
    description: 'Learn from world-renowned experts in their fields.',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/MasterClass_logo.svg/1200px-MasterClass_logo.svg.png',
    portalUrl: 'https://www.masterclass.com/',
    hasApi: false,
    apiStatus: 'none',
    specializations: ['Business', 'Writing', 'Leadership', 'Arts', 'Wellness'],
    accessType: 'subscription',
    features: ['Celebrity Instructors', 'Video Lessons', 'Workbooks', 'Community']
  }
];

export const RESOURCE_CATEGORIES = [
  { id: 'all', name: 'All Resources', icon: 'Grid' },
  { id: 'consulting', name: 'Consulting Firms', icon: 'Briefcase' },
  { id: 'research', name: 'Research & Analysis', icon: 'Search' },
  { id: 'media', name: 'News & Media', icon: 'Newspaper' },
  { id: 'ai_platform', name: 'AI Platforms', icon: 'Brain' },
  { id: 'data', name: 'Data & Intelligence', icon: 'Database' },
  { id: 'training', name: 'Training & Development', icon: 'GraduationCap' }
];

export const API_STATUS_LABELS = {
  connected: { label: 'Connected', color: 'text-green-600 bg-green-50 border-green-200' },
  available: { label: 'API Available', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  not_implemented: { label: 'Not Implemented', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  none: { label: 'Manual Access', color: 'text-gray-600 bg-gray-50 border-gray-200' }
};

export const ACCESS_TYPE_LABELS = {
  free: { label: 'Free', color: 'text-green-600' },
  subscription: { label: 'Subscription', color: 'text-blue-600' },
  enterprise: { label: 'Enterprise', color: 'text-purple-600' }
};
