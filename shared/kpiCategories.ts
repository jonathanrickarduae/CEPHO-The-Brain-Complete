/**
 * 50 KPI Categories for CEPHO.Ai Platform Assessment
 * 
 * Comprehensive framework covering all aspects of the business
 * Scored 0-100 (100% = world class, optimized for #1 position)
 * 
 * Assessed by: Chief of Staff, SME Expert Panels, Customer Focus Groups
 */

export interface KpiCategory {
  id: number;
  name: string;
  domain: KpiDomain;
  description: string;
  assessedBy: AssessorType[];
  scoringCriteria: ScoringCriteria;
  priority: 'critical' | 'high' | 'medium' | 'maintain';
}

export type KpiDomain = 
  | 'strategy'
  | 'technology'
  | 'product'
  | 'customer'
  | 'operations'
  | 'finance'
  | 'people'
  | 'governance'
  | 'innovation'
  | 'market';

export type AssessorType = 
  | 'chief_of_staff'
  | 'strategic_advisory'
  | 'technology_panel'
  | 'ux_design_panel'
  | 'finance_panel'
  | 'legal_panel'
  | 'operations_panel'
  | 'customer_focus_group';

export interface ScoringCriteria {
  excellent: string;  // 90-100
  good: string;       // 75-89
  adequate: string;   // 60-74
  developing: string; // 40-59
  critical: string;   // 0-39
}

export const KPI_CATEGORIES: KpiCategory[] = [
  // STRATEGY DOMAIN (1-6)
  {
    id: 1,
    name: 'Vision and Mission Clarity',
    domain: 'strategy',
    description: 'Clarity and communication of company vision, mission, and strategic direction',
    assessedBy: ['chief_of_staff', 'strategic_advisory', 'customer_focus_group'],
    scoringCriteria: {
      excellent: 'Vision is compelling, widely understood, and drives all decisions',
      good: 'Vision is clear and communicated but not fully embedded',
      adequate: 'Vision exists but lacks clarity or consistent communication',
      developing: 'Vision is vague or inconsistently articulated',
      critical: 'No clear vision or mission defined'
    },
    priority: 'critical'
  },
  {
    id: 2,
    name: 'Strategic Positioning',
    domain: 'strategy',
    description: 'Market positioning, competitive differentiation, and unique value proposition',
    assessedBy: ['chief_of_staff', 'strategic_advisory', 'customer_focus_group'],
    scoringCriteria: {
      excellent: 'Clear market leadership position with defensible differentiation',
      good: 'Strong positioning with clear differentiation',
      adequate: 'Positioning defined but differentiation not fully clear',
      developing: 'Weak positioning with limited differentiation',
      critical: 'No clear market positioning'
    },
    priority: 'critical'
  },
  {
    id: 3,
    name: 'Business Model Viability',
    domain: 'strategy',
    description: 'Sustainability and scalability of the core business model',
    assessedBy: ['chief_of_staff', 'strategic_advisory', 'finance_panel'],
    scoringCriteria: {
      excellent: 'Proven, scalable model with multiple revenue streams',
      good: 'Viable model with clear path to scale',
      adequate: 'Model works but scalability uncertain',
      developing: 'Model unproven with significant risks',
      critical: 'Business model fundamentally flawed'
    },
    priority: 'critical'
  },
  {
    id: 4,
    name: 'Go to Market Strategy',
    domain: 'strategy',
    description: 'Effectiveness of market entry and expansion strategies',
    assessedBy: ['chief_of_staff', 'strategic_advisory', 'operations_panel'],
    scoringCriteria: {
      excellent: 'GTM strategy delivering consistent results above targets',
      good: 'GTM strategy effective with room for optimization',
      adequate: 'GTM strategy defined but execution inconsistent',
      developing: 'GTM strategy unclear or poorly executed',
      critical: 'No coherent GTM strategy'
    },
    priority: 'high'
  },
  {
    id: 5,
    name: 'Partnership and Alliance Strategy',
    domain: 'strategy',
    description: 'Strategic partnerships, alliances, and ecosystem development',
    assessedBy: ['chief_of_staff', 'strategic_advisory', 'legal_panel'],
    scoringCriteria: {
      excellent: 'Strong ecosystem of strategic partnerships driving growth',
      good: 'Key partnerships in place with clear value',
      adequate: 'Some partnerships but not strategically aligned',
      developing: 'Limited partnerships with unclear value',
      critical: 'No partnership strategy'
    },
    priority: 'high'
  },
  {
    id: 6,
    name: 'Exit Strategy Readiness',
    domain: 'strategy',
    description: 'Preparation for IPO, acquisition, or strategic sale within 24 months',
    assessedBy: ['chief_of_staff', 'strategic_advisory', 'finance_panel', 'legal_panel'],
    scoringCriteria: {
      excellent: 'Exit ready with multiple interested parties',
      good: 'Clear exit path with preparation underway',
      adequate: 'Exit strategy defined but preparation limited',
      developing: 'Exit strategy vague with no preparation',
      critical: 'No exit strategy consideration'
    },
    priority: 'critical'
  },

  // TECHNOLOGY DOMAIN (7-14)
  {
    id: 7,
    name: 'Platform Architecture',
    domain: 'technology',
    description: 'Technical architecture quality, scalability, and maintainability',
    assessedBy: ['chief_of_staff', 'technology_panel'],
    scoringCriteria: {
      excellent: 'World class architecture, highly scalable and maintainable',
      good: 'Solid architecture with good scalability',
      adequate: 'Architecture functional but technical debt present',
      developing: 'Architecture has significant limitations',
      critical: 'Architecture fundamentally flawed'
    },
    priority: 'critical'
  },
  {
    id: 8,
    name: 'AI and Machine Learning Capability',
    domain: 'technology',
    description: 'Sophistication and effectiveness of AI/ML implementations',
    assessedBy: ['chief_of_staff', 'technology_panel'],
    scoringCriteria: {
      excellent: 'Cutting edge AI delivering measurable business value',
      good: 'Effective AI implementation with clear benefits',
      adequate: 'Basic AI features functional',
      developing: 'AI capabilities limited or experimental',
      critical: 'No meaningful AI capability'
    },
    priority: 'critical'
  },
  {
    id: 9,
    name: 'Security and Compliance',
    domain: 'technology',
    description: 'Data security, privacy protection, and regulatory compliance',
    assessedBy: ['chief_of_staff', 'technology_panel', 'legal_panel'],
    scoringCriteria: {
      excellent: 'Industry leading security with full compliance',
      good: 'Strong security posture with compliance maintained',
      adequate: 'Basic security measures in place',
      developing: 'Security gaps identified',
      critical: 'Significant security vulnerabilities'
    },
    priority: 'critical'
  },
  {
    id: 10,
    name: 'System Reliability and Uptime',
    domain: 'technology',
    description: 'Platform stability, availability, and performance',
    assessedBy: ['chief_of_staff', 'technology_panel', 'customer_focus_group'],
    scoringCriteria: {
      excellent: '99.9%+ uptime with excellent performance',
      good: '99.5%+ uptime with good performance',
      adequate: '99%+ uptime with acceptable performance',
      developing: 'Frequent issues affecting availability',
      critical: 'Unreliable system with major outages'
    },
    priority: 'high'
  },
  {
    id: 11,
    name: 'Integration Capabilities',
    domain: 'technology',
    description: 'API quality, third party integrations, and ecosystem connectivity',
    assessedBy: ['chief_of_staff', 'technology_panel'],
    scoringCriteria: {
      excellent: 'Comprehensive API with rich integration ecosystem',
      good: 'Good API coverage with key integrations',
      adequate: 'Basic integrations available',
      developing: 'Limited integration capabilities',
      critical: 'No integration capabilities'
    },
    priority: 'high'
  },
  {
    id: 12,
    name: 'Development Velocity',
    domain: 'technology',
    description: 'Speed and efficiency of feature development and deployment',
    assessedBy: ['chief_of_staff', 'technology_panel'],
    scoringCriteria: {
      excellent: 'Rapid iteration with continuous deployment',
      good: 'Good development pace with regular releases',
      adequate: 'Acceptable velocity with some delays',
      developing: 'Slow development with frequent delays',
      critical: 'Development severely constrained'
    },
    priority: 'high'
  },
  {
    id: 13,
    name: 'Technical Documentation',
    domain: 'technology',
    description: 'Quality of technical documentation, API docs, and knowledge base',
    assessedBy: ['chief_of_staff', 'technology_panel'],
    scoringCriteria: {
      excellent: 'Comprehensive, up to date documentation',
      good: 'Good documentation with minor gaps',
      adequate: 'Basic documentation available',
      developing: 'Documentation incomplete or outdated',
      critical: 'No meaningful documentation'
    },
    priority: 'medium'
  },
  {
    id: 14,
    name: 'Technical Debt Management',
    domain: 'technology',
    description: 'Management and reduction of technical debt',
    assessedBy: ['chief_of_staff', 'technology_panel'],
    scoringCriteria: {
      excellent: 'Technical debt actively managed and minimal',
      good: 'Technical debt tracked with reduction plan',
      adequate: 'Some technical debt acknowledged',
      developing: 'Significant technical debt accumulating',
      critical: 'Technical debt severely impacting development'
    },
    priority: 'medium'
  },

  // PRODUCT DOMAIN (15-22)
  {
    id: 15,
    name: 'Product Market Fit',
    domain: 'product',
    description: 'Alignment between product offering and market needs',
    assessedBy: ['chief_of_staff', 'strategic_advisory', 'customer_focus_group'],
    scoringCriteria: {
      excellent: 'Strong PMF with high retention and organic growth',
      good: 'Good PMF with positive user feedback',
      adequate: 'PMF emerging with validation needed',
      developing: 'PMF unclear, pivots may be needed',
      critical: 'No evidence of PMF'
    },
    priority: 'critical'
  },
  {
    id: 16,
    name: 'User Experience Quality',
    domain: 'product',
    description: 'Overall quality of user interface and user experience',
    assessedBy: ['chief_of_staff', 'ux_design_panel', 'customer_focus_group'],
    scoringCriteria: {
      excellent: 'Exceptional UX that delights users',
      good: 'Good UX with positive feedback',
      adequate: 'Functional UX with improvement areas',
      developing: 'UX issues affecting adoption',
      critical: 'Poor UX severely limiting usage'
    },
    priority: 'critical'
  },
  {
    id: 17,
    name: 'Feature Completeness',
    domain: 'product',
    description: 'Completeness of core features relative to market expectations',
    assessedBy: ['chief_of_staff', 'technology_panel', 'customer_focus_group'],
    scoringCriteria: {
      excellent: 'Feature complete with innovative additions',
      good: 'Core features complete with roadmap for enhancements',
      adequate: 'Most core features available',
      developing: 'Significant feature gaps',
      critical: 'Missing critical features'
    },
    priority: 'high'
  },
  {
    id: 18,
    name: 'Product Differentiation',
    domain: 'product',
    description: 'Unique features and capabilities vs competitors',
    assessedBy: ['chief_of_staff', 'strategic_advisory', 'customer_focus_group'],
    scoringCriteria: {
      excellent: 'Clear unique capabilities that competitors cannot match',
      good: 'Strong differentiation in key areas',
      adequate: 'Some differentiation but not compelling',
      developing: 'Limited differentiation',
      critical: 'No meaningful differentiation'
    },
    priority: 'high'
  },
  {
    id: 19,
    name: 'Mobile Experience',
    domain: 'product',
    description: 'Quality of mobile app and responsive experience',
    assessedBy: ['chief_of_staff', 'ux_design_panel', 'customer_focus_group'],
    scoringCriteria: {
      excellent: 'Best in class mobile experience',
      good: 'Good mobile experience with minor issues',
      adequate: 'Functional mobile experience',
      developing: 'Mobile experience needs significant work',
      critical: 'No viable mobile experience'
    },
    priority: 'high'
  },
  {
    id: 20,
    name: 'Accessibility Compliance',
    domain: 'product',
    description: 'WCAG compliance and accessibility for all users',
    assessedBy: ['chief_of_staff', 'ux_design_panel', 'legal_panel'],
    scoringCriteria: {
      excellent: 'WCAG AAA compliant with inclusive design',
      good: 'WCAG AA compliant',
      adequate: 'Basic accessibility features',
      developing: 'Accessibility gaps identified',
      critical: 'Not accessible'
    },
    priority: 'medium'
  },
  {
    id: 21,
    name: 'Product Roadmap Clarity',
    domain: 'product',
    description: 'Clarity and communication of product roadmap',
    assessedBy: ['chief_of_staff', 'strategic_advisory', 'customer_focus_group'],
    scoringCriteria: {
      excellent: 'Clear roadmap aligned with customer needs',
      good: 'Roadmap defined with regular updates',
      adequate: 'Basic roadmap exists',
      developing: 'Roadmap unclear or not communicated',
      critical: 'No product roadmap'
    },
    priority: 'medium'
  },
  {
    id: 22,
    name: 'Onboarding Experience',
    domain: 'product',
    description: 'Quality of new user onboarding and time to value',
    assessedBy: ['chief_of_staff', 'ux_design_panel', 'customer_focus_group'],
    scoringCriteria: {
      excellent: 'Seamless onboarding with rapid time to value',
      good: 'Good onboarding with clear guidance',
      adequate: 'Functional onboarding process',
      developing: 'Onboarding confusing or lengthy',
      critical: 'No onboarding support'
    },
    priority: 'high'
  },

  // CUSTOMER DOMAIN (23-30)
  {
    id: 23,
    name: 'Customer Satisfaction',
    domain: 'customer',
    description: 'Overall customer satisfaction and NPS scores',
    assessedBy: ['chief_of_staff', 'customer_focus_group'],
    scoringCriteria: {
      excellent: 'NPS 70+ with high satisfaction',
      good: 'NPS 50-69 with good satisfaction',
      adequate: 'NPS 30-49 with acceptable satisfaction',
      developing: 'NPS 0-29 with concerns',
      critical: 'Negative NPS with major issues'
    },
    priority: 'critical'
  },
  {
    id: 24,
    name: 'Customer Retention',
    domain: 'customer',
    description: 'Customer retention rates and churn management',
    assessedBy: ['chief_of_staff', 'operations_panel', 'customer_focus_group'],
    scoringCriteria: {
      excellent: '95%+ annual retention',
      good: '90-94% annual retention',
      adequate: '85-89% annual retention',
      developing: '75-84% annual retention',
      critical: 'Below 75% retention'
    },
    priority: 'critical'
  },
  {
    id: 25,
    name: 'Customer Support Quality',
    domain: 'customer',
    description: 'Quality and responsiveness of customer support',
    assessedBy: ['chief_of_staff', 'operations_panel', 'customer_focus_group'],
    scoringCriteria: {
      excellent: 'World class support with rapid resolution',
      good: 'Good support with timely responses',
      adequate: 'Adequate support with some delays',
      developing: 'Support issues affecting satisfaction',
      critical: 'Poor support causing churn'
    },
    priority: 'high'
  },
  {
    id: 26,
    name: 'Customer Success Programs',
    domain: 'customer',
    description: 'Proactive customer success and value realization',
    assessedBy: ['chief_of_staff', 'operations_panel', 'customer_focus_group'],
    scoringCriteria: {
      excellent: 'Comprehensive CS driving expansion',
      good: 'Good CS programs in place',
      adequate: 'Basic CS activities',
      developing: 'Limited CS resources',
      critical: 'No customer success function'
    },
    priority: 'high'
  },
  {
    id: 27,
    name: 'Customer Feedback Integration',
    domain: 'customer',
    description: 'Collection and integration of customer feedback into product',
    assessedBy: ['chief_of_staff', 'ux_design_panel', 'customer_focus_group'],
    scoringCriteria: {
      excellent: 'Systematic feedback driving product decisions',
      good: 'Regular feedback collection and action',
      adequate: 'Some feedback mechanisms in place',
      developing: 'Ad hoc feedback collection',
      critical: 'No feedback mechanisms'
    },
    priority: 'high'
  },
  {
    id: 28,
    name: 'Customer Segmentation',
    domain: 'customer',
    description: 'Understanding and targeting of customer segments',
    assessedBy: ['chief_of_staff', 'strategic_advisory', 'customer_focus_group'],
    scoringCriteria: {
      excellent: 'Deep segment understanding driving strategy',
      good: 'Clear segmentation with targeted approaches',
      adequate: 'Basic segmentation defined',
      developing: 'Limited segment understanding',
      critical: 'No customer segmentation'
    },
    priority: 'medium'
  },
  {
    id: 29,
    name: 'Customer Advocacy',
    domain: 'customer',
    description: 'Customer references, case studies, and advocacy programs',
    assessedBy: ['chief_of_staff', 'strategic_advisory', 'customer_focus_group'],
    scoringCriteria: {
      excellent: 'Strong advocate community driving referrals',
      good: 'Good references and case studies',
      adequate: 'Some customer references available',
      developing: 'Limited customer advocacy',
      critical: 'No customer advocates'
    },
    priority: 'medium'
  },
  {
    id: 30,
    name: 'Customer Education',
    domain: 'customer',
    description: 'Training, documentation, and educational resources',
    assessedBy: ['chief_of_staff', 'operations_panel', 'customer_focus_group'],
    scoringCriteria: {
      excellent: 'Comprehensive education driving adoption',
      good: 'Good training and documentation',
      adequate: 'Basic educational resources',
      developing: 'Limited educational content',
      critical: 'No customer education'
    },
    priority: 'medium'
  },

  // OPERATIONS DOMAIN (31-36)
  {
    id: 31,
    name: 'Process Efficiency',
    domain: 'operations',
    description: 'Efficiency and optimization of core business processes',
    assessedBy: ['chief_of_staff', 'operations_panel'],
    scoringCriteria: {
      excellent: 'Highly optimized processes with automation',
      good: 'Efficient processes with continuous improvement',
      adequate: 'Functional processes with some inefficiencies',
      developing: 'Process inefficiencies causing issues',
      critical: 'Chaotic or undefined processes'
    },
    priority: 'high'
  },
  {
    id: 32,
    name: 'Quality Assurance',
    domain: 'operations',
    description: 'Quality control and assurance across all outputs',
    assessedBy: ['chief_of_staff', 'technology_panel', 'operations_panel'],
    scoringCriteria: {
      excellent: 'Comprehensive QA with near zero defects',
      good: 'Strong QA with low defect rates',
      adequate: 'Basic QA processes in place',
      developing: 'QA gaps causing quality issues',
      critical: 'No QA processes'
    },
    priority: 'high'
  },
  {
    id: 33,
    name: 'Vendor Management',
    domain: 'operations',
    description: 'Management of vendors, suppliers, and third parties',
    assessedBy: ['chief_of_staff', 'operations_panel', 'legal_panel'],
    scoringCriteria: {
      excellent: 'Strategic vendor relationships driving value',
      good: 'Good vendor management practices',
      adequate: 'Basic vendor oversight',
      developing: 'Vendor issues affecting operations',
      critical: 'No vendor management'
    },
    priority: 'medium'
  },
  {
    id: 34,
    name: 'Scalability Readiness',
    domain: 'operations',
    description: 'Ability to scale operations with growth',
    assessedBy: ['chief_of_staff', 'operations_panel', 'technology_panel'],
    scoringCriteria: {
      excellent: 'Fully scalable operations ready for 10x growth',
      good: 'Operations can scale with some investment',
      adequate: 'Basic scalability but constraints exist',
      developing: 'Significant scaling challenges',
      critical: 'Operations cannot scale'
    },
    priority: 'high'
  },
  {
    id: 35,
    name: 'Business Continuity',
    domain: 'operations',
    description: 'Disaster recovery and business continuity planning',
    assessedBy: ['chief_of_staff', 'technology_panel', 'operations_panel'],
    scoringCriteria: {
      excellent: 'Comprehensive BCP with tested recovery',
      good: 'Good BCP with documented procedures',
      adequate: 'Basic continuity planning',
      developing: 'Limited continuity planning',
      critical: 'No business continuity plan'
    },
    priority: 'medium'
  },
  {
    id: 36,
    name: 'Data Management',
    domain: 'operations',
    description: 'Data quality, governance, and management practices',
    assessedBy: ['chief_of_staff', 'technology_panel', 'legal_panel'],
    scoringCriteria: {
      excellent: 'Excellent data quality with strong governance',
      good: 'Good data management practices',
      adequate: 'Basic data management',
      developing: 'Data quality issues present',
      critical: 'Poor data management'
    },
    priority: 'high'
  },

  // FINANCE DOMAIN (37-42)
  {
    id: 37,
    name: 'Revenue Growth',
    domain: 'finance',
    description: 'Revenue growth trajectory and sustainability',
    assessedBy: ['chief_of_staff', 'finance_panel', 'strategic_advisory'],
    scoringCriteria: {
      excellent: '100%+ YoY growth with clear path to profitability',
      good: '50-99% YoY growth',
      adequate: '25-49% YoY growth',
      developing: '0-24% YoY growth',
      critical: 'Declining revenue'
    },
    priority: 'critical'
  },
  {
    id: 38,
    name: 'Unit Economics',
    domain: 'finance',
    description: 'LTV:CAC ratio and unit economics health',
    assessedBy: ['chief_of_staff', 'finance_panel'],
    scoringCriteria: {
      excellent: 'LTV:CAC 5:1+ with improving trends',
      good: 'LTV:CAC 3:1 to 5:1',
      adequate: 'LTV:CAC 2:1 to 3:1',
      developing: 'LTV:CAC 1:1 to 2:1',
      critical: 'LTV:CAC below 1:1'
    },
    priority: 'critical'
  },
  {
    id: 39,
    name: 'Cash Flow Management',
    domain: 'finance',
    description: 'Cash flow health and runway management',
    assessedBy: ['chief_of_staff', 'finance_panel'],
    scoringCriteria: {
      excellent: 'Cash flow positive with strong reserves',
      good: '18+ months runway with clear path to profitability',
      adequate: '12-18 months runway',
      developing: '6-12 months runway',
      critical: 'Less than 6 months runway'
    },
    priority: 'critical'
  },
  {
    id: 40,
    name: 'Financial Reporting',
    domain: 'finance',
    description: 'Quality and timeliness of financial reporting',
    assessedBy: ['chief_of_staff', 'finance_panel'],
    scoringCriteria: {
      excellent: 'Audit ready financials with real time dashboards',
      good: 'Accurate monthly reporting with good visibility',
      adequate: 'Basic financial reporting',
      developing: 'Financial reporting gaps',
      critical: 'Unreliable financial data'
    },
    priority: 'high'
  },
  {
    id: 41,
    name: 'Pricing Strategy',
    domain: 'finance',
    description: 'Pricing model effectiveness and optimization',
    assessedBy: ['chief_of_staff', 'finance_panel', 'customer_focus_group'],
    scoringCriteria: {
      excellent: 'Optimized pricing maximizing value capture',
      good: 'Effective pricing with room for optimization',
      adequate: 'Functional pricing model',
      developing: 'Pricing issues affecting growth',
      critical: 'Pricing fundamentally broken'
    },
    priority: 'high'
  },
  {
    id: 42,
    name: 'Investor Relations',
    domain: 'finance',
    description: 'Quality of investor communications and relationships',
    assessedBy: ['chief_of_staff', 'finance_panel', 'strategic_advisory'],
    scoringCriteria: {
      excellent: 'Strong investor relationships with active support',
      good: 'Good investor communications',
      adequate: 'Basic investor reporting',
      developing: 'Limited investor engagement',
      critical: 'Poor investor relations'
    },
    priority: 'high'
  },

  // PEOPLE DOMAIN (43-46)
  {
    id: 43,
    name: 'Team Capability',
    domain: 'people',
    description: 'Skills, experience, and capability of the team',
    assessedBy: ['chief_of_staff', 'strategic_advisory'],
    scoringCriteria: {
      excellent: 'World class team with deep expertise',
      good: 'Strong team with key capabilities',
      adequate: 'Capable team with some gaps',
      developing: 'Significant capability gaps',
      critical: 'Team lacks critical skills'
    },
    priority: 'critical'
  },
  {
    id: 44,
    name: 'Leadership Effectiveness',
    domain: 'people',
    description: 'Quality and effectiveness of leadership team',
    assessedBy: ['chief_of_staff', 'strategic_advisory'],
    scoringCriteria: {
      excellent: 'Exceptional leadership driving results',
      good: 'Effective leadership with clear direction',
      adequate: 'Adequate leadership',
      developing: 'Leadership challenges present',
      critical: 'Leadership crisis'
    },
    priority: 'critical'
  },
  {
    id: 45,
    name: 'Culture and Values',
    domain: 'people',
    description: 'Strength of company culture and values alignment',
    assessedBy: ['chief_of_staff', 'strategic_advisory'],
    scoringCriteria: {
      excellent: 'Strong culture driving performance',
      good: 'Positive culture with clear values',
      adequate: 'Culture developing',
      developing: 'Culture challenges present',
      critical: 'Toxic or absent culture'
    },
    priority: 'high'
  },
  {
    id: 46,
    name: 'Talent Acquisition',
    domain: 'people',
    description: 'Ability to attract and hire top talent',
    assessedBy: ['chief_of_staff', 'operations_panel'],
    scoringCriteria: {
      excellent: 'Strong employer brand attracting top talent',
      good: 'Good hiring with quality candidates',
      adequate: 'Adequate hiring capabilities',
      developing: 'Hiring challenges affecting growth',
      critical: 'Cannot attract needed talent'
    },
    priority: 'high'
  },

  // GOVERNANCE DOMAIN (47-48)
  {
    id: 47,
    name: 'Corporate Governance',
    domain: 'governance',
    description: 'Board effectiveness and governance practices',
    assessedBy: ['chief_of_staff', 'legal_panel', 'strategic_advisory'],
    scoringCriteria: {
      excellent: 'Best practice governance with engaged board',
      good: 'Good governance with effective oversight',
      adequate: 'Basic governance in place',
      developing: 'Governance gaps identified',
      critical: 'Poor governance'
    },
    priority: 'high'
  },
  {
    id: 48,
    name: 'Legal and Regulatory Compliance',
    domain: 'governance',
    description: 'Compliance with all legal and regulatory requirements',
    assessedBy: ['chief_of_staff', 'legal_panel'],
    scoringCriteria: {
      excellent: 'Full compliance with proactive risk management',
      good: 'Compliant with good practices',
      adequate: 'Basic compliance maintained',
      developing: 'Compliance gaps identified',
      critical: 'Non compliant with significant risks'
    },
    priority: 'critical'
  },

  // INNOVATION DOMAIN (49)
  {
    id: 49,
    name: 'Innovation Pipeline',
    domain: 'innovation',
    description: 'Quality and depth of innovation pipeline',
    assessedBy: ['chief_of_staff', 'technology_panel', 'strategic_advisory'],
    scoringCriteria: {
      excellent: 'Rich pipeline with breakthrough innovations',
      good: 'Strong pipeline with regular innovations',
      adequate: 'Some innovation activity',
      developing: 'Limited innovation',
      critical: 'No innovation pipeline'
    },
    priority: 'high'
  },

  // MARKET DOMAIN (50)
  {
    id: 50,
    name: 'Market Position and Share',
    domain: 'market',
    description: 'Current market position and competitive standing',
    assessedBy: ['chief_of_staff', 'strategic_advisory', 'customer_focus_group'],
    scoringCriteria: {
      excellent: 'Market leader or clear path to leadership',
      good: 'Strong market position with growth',
      adequate: 'Established market presence',
      developing: 'Building market presence',
      critical: 'Weak or declining market position'
    },
    priority: 'critical'
  }
];

// Domain groupings for heat map organization
export const KPI_DOMAINS: { domain: KpiDomain; name: string; categoryIds: number[] }[] = [
  { domain: 'strategy', name: 'Strategy', categoryIds: [1, 2, 3, 4, 5, 6] },
  { domain: 'technology', name: 'Technology', categoryIds: [7, 8, 9, 10, 11, 12, 13, 14] },
  { domain: 'product', name: 'Product', categoryIds: [15, 16, 17, 18, 19, 20, 21, 22] },
  { domain: 'customer', name: 'Customer', categoryIds: [23, 24, 25, 26, 27, 28, 29, 30] },
  { domain: 'operations', name: 'Operations', categoryIds: [31, 32, 33, 34, 35, 36] },
  { domain: 'finance', name: 'Finance', categoryIds: [37, 38, 39, 40, 41, 42] },
  { domain: 'people', name: 'People', categoryIds: [43, 44, 45, 46] },
  { domain: 'governance', name: 'Governance', categoryIds: [47, 48] },
  { domain: 'innovation', name: 'Innovation', categoryIds: [49] },
  { domain: 'market', name: 'Market', categoryIds: [50] }
];

// Color scale for heat map (0-100)
export const getHeatMapColor = (score: number): string => {
  if (score >= 90) return '#22c55e'; // Bright green
  if (score >= 75) return '#84cc16'; // Lime green
  if (score >= 60) return '#eab308'; // Yellow
  if (score >= 40) return '#f97316'; // Orange
  return '#ef4444'; // Red
};

export const getHeatMapColorClass = (score: number): string => {
  if (score >= 90) return 'bg-green-500';
  if (score >= 75) return 'bg-lime-500';
  if (score >= 60) return 'bg-yellow-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
};

export const getScoreLabel = (score: number): string => {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Adequate';
  if (score >= 40) return 'Developing';
  return 'Critical';
};


// Helper function to get categories by domain
export const getCategoriesByDomain = (domain: KpiDomain): KpiCategory[] => {
  return KPI_CATEGORIES.filter(cat => cat.domain === domain);
};

// Alias for backward compatibility
export const getScoreColor = getHeatMapColorClass;
