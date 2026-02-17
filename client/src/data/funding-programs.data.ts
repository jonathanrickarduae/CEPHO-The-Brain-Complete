// Government Funding Programs Database
// UAE and UK funding opportunities for startups and innovation

export interface FundingProgram {
  id: string;
  name: string;
  country: 'UAE' | 'UK';
  type: 'grant' | 'loan' | 'tax_credit' | 'guarantee' | 'equity_scheme';
  provider: string;
  description: string;
  maxAmount: string;
  currency: string;
  equityRequired: boolean;
  eligibility: {
    minAge?: number;
    maxTradingMonths?: number;
    minTradingMonths?: number;
    requiresUKResident?: boolean;
    requiresUAEPresence?: boolean;
    requiresRevenue?: boolean;
    maxEmployees?: number;
    maxTurnover?: string;
    sectors?: string[];
    excludedSectors?: string[];
    requiresInnovation?: boolean;
    requiresRnD?: boolean;
  };
  applicationProcess: string[];
  timeline: string;
  benefits: string[];
  requiredDocuments: string[];
  website: string;
  contactInfo?: string;
}

export const FUNDING_PROGRAMS: FundingProgram[] = [
  // UAE Programs
  {
    id: 'mbrif-accelerator',
    name: 'MBRIF Accelerator',
    country: 'UAE',
    type: 'grant',
    provider: 'Mohammed Bin Rashid Innovation Fund',
    description: 'Non-financial support program providing mentorship, services, and access to global experts without equity dilution.',
    maxAmount: 'Non-financial support',
    currency: 'AED',
    equityRequired: false,
    eligibility: {
      requiresUAEPresence: true,
      requiresInnovation: true,
      sectors: ['Technology', 'Education', 'Renewable Energy', 'Water', 'Transport', 'Health', 'Space'],
    },
    applicationProcess: [
      'Register and submit online application',
      'Light due diligence review',
      'Heavy due diligence (innovation, commercial analysis)',
      'Advisory & Decision Committee review',
      'Final decision communicated'
    ],
    timeline: '10 business weeks',
    benefits: [
      'Tailored services and collaboration',
      'World-class mentorship',
      'Access to global experts',
      'Zero fees, no equity dilution'
    ],
    requiredDocuments: [
      'Business registration documents',
      'Innovation description',
      'Business plan',
      'Financial projections',
      'Team profiles'
    ],
    website: 'https://mbrif.ae'
  },
  {
    id: 'mbrif-guarantee',
    name: 'MBRIF Guarantee Scheme',
    country: 'UAE',
    type: 'guarantee',
    provider: 'Mohammed Bin Rashid Innovation Fund',
    description: 'Government-backed credit guarantee providing access to financing without equity dilution.',
    maxAmount: 'Varies by project',
    currency: 'AED',
    equityRequired: false,
    eligibility: {
      requiresUAEPresence: true,
      requiresRevenue: true,
      requiresInnovation: true,
      sectors: ['Technology', 'Education', 'Renewable Energy', 'Water', 'Transport', 'Health', 'Space'],
    },
    applicationProcess: [
      'Submit online application under Guarantee Scheme',
      'Light due diligence (eligibility check)',
      'Heavy due diligence (innovation, credit risk analysis)',
      'Committee review',
      'Letter of Intent if approved',
      'Lender assessment and fund disbursement'
    ],
    timeline: '10 business weeks',
    benefits: [
      'Flexible financing terms',
      'No equity dilution',
      'Government-backed guarantee',
      'Reduced risk for lenders'
    ],
    requiredDocuments: [
      'UAE trade license',
      'Financial statements (2 years)',
      'Revenue documentation',
      'Business plan',
      'Innovation documentation',
      'Team profiles'
    ],
    website: 'https://mbrif.ae/guarantee-scheme-2/'
  },
  {
    id: 'khalifa-fund',
    name: 'Khalifa Fund Microfinance',
    country: 'UAE',
    type: 'loan',
    provider: 'Khalifa Fund for Enterprise Development',
    description: 'Microfinance loans for new entrepreneurs and SMEs in the UAE.',
    maxAmount: 'Up to AED 250,000',
    currency: 'AED',
    equityRequired: false,
    eligibility: {
      requiresUAEPresence: true,
      minAge: 21,
    },
    applicationProcess: [
      'Submit application with required documents',
      'Initial screening',
      'Business plan review',
      'Committee approval',
      'Loan disbursement'
    ],
    timeline: '4-8 weeks',
    benefits: [
      'Competitive interest rates',
      'Business support services',
      'Mentorship programs',
      'Networking opportunities'
    ],
    requiredDocuments: [
      'Valid passport copy',
      'Valid Emirates ID',
      'Family Book (for UAE nationals)',
      'Security clearance form',
      'Business plan',
      'Financial projections'
    ],
    website: 'https://www.khalifafund.ae'
  },
  {
    id: 'hub71-incentives',
    name: 'Hub71 Incentives Program',
    country: 'UAE',
    type: 'grant',
    provider: 'Hub71 (Abu Dhabi)',
    description: 'Startup ecosystem support including funding, office space, and access to investors.',
    maxAmount: 'Up to AED 1,000,000 in incentives',
    currency: 'AED',
    equityRequired: false,
    eligibility: {
      requiresUAEPresence: true,
      requiresInnovation: true,
      sectors: ['Technology', 'FinTech', 'HealthTech', 'AI', 'CleanTech'],
    },
    applicationProcess: [
      'Online application submission',
      'Screening and evaluation',
      'Pitch to selection committee',
      'Due diligence',
      'Acceptance and onboarding'
    ],
    timeline: '6-12 weeks',
    benefits: [
      'Housing subsidies',
      'Office space',
      'Cloud credits',
      'Access to investors',
      'Mentorship'
    ],
    requiredDocuments: [
      'Pitch deck',
      'Business plan',
      'Financial model',
      'Team profiles',
      'Product demo'
    ],
    website: 'https://hub71.com'
  },

  // UK Programs
  {
    id: 'uk-rd-tax-credits',
    name: 'R&D Tax Credits (Merged Scheme)',
    country: 'UK',
    type: 'tax_credit',
    provider: 'HMRC',
    description: 'Corporation Tax relief for qualifying R&D expenditure. Merged scheme for accounting periods from April 2024.',
    maxAmount: 'Up to 186% deduction + payable credits',
    currency: 'GBP',
    equityRequired: false,
    eligibility: {
      requiresUKResident: true,
      maxEmployees: 500,
      maxTurnover: '€100 million',
      requiresRnD: true,
      excludedSectors: ['Arts', 'Humanities', 'Social Sciences', 'Economics'],
    },
    applicationProcess: [
      'Identify qualifying R&D activities',
      'Calculate qualifying expenditure',
      'Complete R&D claim in Corporation Tax return',
      'Submit additional information form',
      'HMRC review and approval'
    ],
    timeline: 'Annual claim with Corporation Tax return',
    benefits: [
      '186% total deduction on qualifying costs',
      'Payable tax credit for loss-making companies',
      '14.5% enhanced rate for R&D intensive companies',
      'Advance assurance available'
    ],
    requiredDocuments: [
      'Technical narrative of R&D projects',
      'Breakdown of qualifying expenditure',
      'Staff costs analysis',
      'Subcontractor costs',
      'Consumables and materials'
    ],
    website: 'https://www.gov.uk/guidance/corporation-tax-research-and-development-tax-relief-for-small-and-medium-sized-enterprises'
  },
  {
    id: 'innovate-uk-smart',
    name: 'Innovate UK Smart Grants',
    country: 'UK',
    type: 'grant',
    provider: 'Innovate UK (UKRI)',
    description: 'Competitive funding for game-changing and disruptive innovation projects.',
    maxAmount: '£100,000 - £1,000,000',
    currency: 'GBP',
    equityRequired: false,
    eligibility: {
      requiresUKResident: true,
      requiresInnovation: true,
    },
    applicationProcess: [
      'Check competition is open',
      'Register on Innovation Funding Service',
      'Complete application form',
      'Submit by deadline',
      'Assessment and interview',
      'Funding decision'
    ],
    timeline: '19-24 months project duration',
    benefits: [
      'Non-dilutive funding',
      'Up to 70% of project costs for SMEs',
      'Access to Innovate UK network',
      'Credibility boost'
    ],
    requiredDocuments: [
      'Project description',
      'Innovation narrative',
      'Market opportunity analysis',
      'Delivery plan',
      'Financial projections',
      'Team capabilities'
    ],
    website: 'https://www.ukri.org/councils/innovate-uk/'
  },
  {
    id: 'bbb-startup-loans',
    name: 'British Business Bank Start Up Loans',
    country: 'UK',
    type: 'loan',
    provider: 'British Business Bank',
    description: 'Government-backed personal loans for starting or growing a business.',
    maxAmount: '£25,000 per person (£100,000 per business)',
    currency: 'GBP',
    equityRequired: false,
    eligibility: {
      requiresUKResident: true,
      minAge: 18,
      maxTradingMonths: 36,
      excludedSectors: ['Weapons', 'Gambling', 'Property Investment', 'Banking/Money Transfer'],
    },
    applicationProcess: [
      'Check eligibility',
      'Prepare business plan',
      'Create cash flow forecast',
      'Complete personal survival budget',
      'Submit application',
      'Credit check and assessment',
      'Loan decision (2 working days)'
    ],
    timeline: '2-4 weeks',
    benefits: [
      'Fixed interest rate (6% p.a.)',
      'Unsecured loan',
      '1-5 year repayment terms',
      '12 months free mentoring',
      'No early repayment fees'
    ],
    requiredDocuments: [
      'Business plan',
      'Cash flow forecast',
      'Personal survival budget',
      'Proof of identity',
      'Proof of address',
      'Bank statements'
    ],
    website: 'https://www.startuploans.co.uk'
  },
  {
    id: 'uk-eis',
    name: 'Enterprise Investment Scheme (EIS)',
    country: 'UK',
    type: 'equity_scheme',
    provider: 'HMRC',
    description: 'Tax relief scheme encouraging investment in early-stage companies.',
    maxAmount: '£5 million per year (company can raise)',
    currency: 'GBP',
    equityRequired: true,
    eligibility: {
      requiresUKResident: true,
      maxEmployees: 250,
      maxTurnover: '£15 million gross assets',
      maxTradingMonths: 84, // 7 years
    },
    applicationProcess: [
      'Apply for advance assurance',
      'Raise investment from qualifying investors',
      'Issue shares to investors',
      'Submit compliance statement',
      'HMRC issues EIS certificates'
    ],
    timeline: '4-6 weeks for advance assurance',
    benefits: [
      '30% income tax relief for investors',
      'Capital gains tax exemption',
      'Loss relief available',
      'Attracts angel investors'
    ],
    requiredDocuments: [
      'Business plan',
      'Financial projections',
      'Share structure',
      'Use of funds',
      'Company accounts'
    ],
    website: 'https://www.gov.uk/guidance/venture-capital-schemes-apply-for-the-enterprise-investment-scheme'
  },
  {
    id: 'uk-seis',
    name: 'Seed Enterprise Investment Scheme (SEIS)',
    country: 'UK',
    type: 'equity_scheme',
    provider: 'HMRC',
    description: 'Higher tax relief scheme for very early-stage seed investments.',
    maxAmount: '£250,000 (company can raise)',
    currency: 'GBP',
    equityRequired: true,
    eligibility: {
      requiresUKResident: true,
      maxEmployees: 25,
      maxTurnover: '£350,000 gross assets',
      maxTradingMonths: 36, // 3 years
    },
    applicationProcess: [
      'Apply for advance assurance',
      'Raise seed investment',
      'Issue shares to investors',
      'Submit compliance statement',
      'HMRC issues SEIS certificates'
    ],
    timeline: '4-6 weeks for advance assurance',
    benefits: [
      '50% income tax relief for investors',
      'Capital gains tax exemption',
      'CGT reinvestment relief',
      'Attracts early-stage investors'
    ],
    requiredDocuments: [
      'Business plan',
      'Financial projections',
      'Share structure',
      'Use of funds',
      'Founder details'
    ],
    website: 'https://www.gov.uk/guidance/venture-capital-schemes-apply-for-the-seed-enterprise-investment-scheme'
  },
  {
    id: 'uk-patent-box',
    name: 'Patent Box',
    country: 'UK',
    type: 'tax_credit',
    provider: 'HMRC',
    description: 'Reduced Corporation Tax rate on profits from patented inventions.',
    maxAmount: 'Effective 10% tax rate (vs 25% standard)',
    currency: 'GBP',
    equityRequired: false,
    eligibility: {
      requiresUKResident: true,
      requiresRnD: true,
    },
    applicationProcess: [
      'Identify qualifying patents',
      'Calculate qualifying profits',
      'Elect into Patent Box regime',
      'Include in Corporation Tax return'
    ],
    timeline: 'Annual election',
    benefits: [
      '10% effective tax rate on patent profits',
      'Significant tax savings',
      'Encourages UK-based R&D'
    ],
    requiredDocuments: [
      'Patent documentation',
      'R&D expenditure records',
      'Profit allocation calculations',
      'Development history'
    ],
    website: 'https://www.gov.uk/guidance/corporation-tax-the-patent-box'
  }
];

// Helper function to assess eligibility
export function assessFundingEligibility(
  program: FundingProgram,
  ideaData: {
    country?: string;
    sector?: string;
    tradingMonths?: number;
    hasRevenue?: boolean;
    employeeCount?: number;
    isInnovative?: boolean;
    hasRnD?: boolean;
    founderAge?: number;
  }
): { eligible: boolean; score: number; reasons: string[]; missingCriteria: string[] } {
  const reasons: string[] = [];
  const missingCriteria: string[] = [];
  let score = 0;
  let maxScore = 0;

  const { eligibility } = program;

  // Check country/residence requirements
  if (eligibility.requiresUKResident) {
    maxScore += 20;
    if (ideaData.country === 'UK') {
      score += 20;
      reasons.push('UK-based business');
    } else {
      missingCriteria.push('Must be UK resident/registered');
    }
  }

  if (eligibility.requiresUAEPresence) {
    maxScore += 20;
    if (ideaData.country === 'UAE') {
      score += 20;
      reasons.push('UAE-based business');
    } else {
      missingCriteria.push('Must have UAE presence');
    }
  }

  // Check sector eligibility
  if (eligibility.sectors && eligibility.sectors.length > 0) {
    maxScore += 15;
    if (ideaData.sector && eligibility.sectors.some(s => 
      ideaData.sector?.toLowerCase().includes(s.toLowerCase())
    )) {
      score += 15;
      reasons.push(`Sector aligned: ${ideaData.sector}`);
    } else {
      missingCriteria.push(`Must be in priority sectors: ${eligibility.sectors.join(', ')}`);
    }
  }

  // Check excluded sectors
  if (eligibility.excludedSectors && ideaData.sector) {
    maxScore += 10;
    if (!eligibility.excludedSectors.some(s => 
      ideaData.sector?.toLowerCase().includes(s.toLowerCase())
    )) {
      score += 10;
      reasons.push('Sector not excluded');
    } else {
      missingCriteria.push(`Sector excluded: ${ideaData.sector}`);
    }
  }

  // Check trading duration
  if (eligibility.maxTradingMonths !== undefined) {
    maxScore += 15;
    if (ideaData.tradingMonths !== undefined && ideaData.tradingMonths <= eligibility.maxTradingMonths) {
      score += 15;
      reasons.push(`Trading duration eligible (${ideaData.tradingMonths} months)`);
    } else if (ideaData.tradingMonths === undefined) {
      score += 7; // Partial score if unknown
      missingCriteria.push(`Must be trading less than ${eligibility.maxTradingMonths} months`);
    } else {
      missingCriteria.push(`Trading too long (max ${eligibility.maxTradingMonths} months)`);
    }
  }

  // Check revenue requirement
  if (eligibility.requiresRevenue) {
    maxScore += 15;
    if (ideaData.hasRevenue) {
      score += 15;
      reasons.push('Revenue generating');
    } else {
      missingCriteria.push('Must be generating revenue');
    }
  }

  // Check employee count
  if (eligibility.maxEmployees !== undefined) {
    maxScore += 10;
    if (ideaData.employeeCount !== undefined && ideaData.employeeCount <= eligibility.maxEmployees) {
      score += 10;
      reasons.push(`Employee count eligible (${ideaData.employeeCount})`);
    } else if (ideaData.employeeCount === undefined) {
      score += 5;
    } else {
      missingCriteria.push(`Too many employees (max ${eligibility.maxEmployees})`);
    }
  }

  // Check innovation requirement
  if (eligibility.requiresInnovation) {
    maxScore += 15;
    if (ideaData.isInnovative) {
      score += 15;
      reasons.push('Innovative business model');
    } else {
      missingCriteria.push('Must demonstrate innovation');
    }
  }

  // Check R&D requirement
  if (eligibility.requiresRnD) {
    maxScore += 15;
    if (ideaData.hasRnD) {
      score += 15;
      reasons.push('R&D activities present');
    } else {
      missingCriteria.push('Must have qualifying R&D activities');
    }
  }

  // Check age requirement
  if (eligibility.minAge !== undefined) {
    maxScore += 5;
    if (ideaData.founderAge !== undefined && ideaData.founderAge >= eligibility.minAge) {
      score += 5;
      reasons.push('Founder age eligible');
    } else if (ideaData.founderAge === undefined) {
      score += 2;
    } else {
      missingCriteria.push(`Founder must be at least ${eligibility.minAge} years old`);
    }
  }

  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 50;
  const eligible = percentage >= 60 && missingCriteria.length <= 2;

  return {
    eligible,
    score: percentage,
    reasons,
    missingCriteria
  };
}

// Get programs by country
export function getProgramsByCountry(country: 'UAE' | 'UK'): FundingProgram[] {
  return FUNDING_PROGRAMS.filter(p => p.country === country);
}

// Get programs by type
export function getProgramsByType(type: FundingProgram['type']): FundingProgram[] {
  return FUNDING_PROGRAMS.filter(p => p.type === type);
}
