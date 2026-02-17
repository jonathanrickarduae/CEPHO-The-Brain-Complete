// Expert Type Categorization for hierarchical filtering
import { AI_EXPERTS, corporatePartners, type AIExpert, type CorporatePartner } from './aiExperts';

// Expert types for hierarchical filtering
export type ExpertType = 'individuals' | 'corporate_roles' | 'field_experts' | 'celebrities' | 'companies';

export interface ExpertTypeConfig {
  id: ExpertType;
  name: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const expertTypes: Record<ExpertType, ExpertTypeConfig> = {
  individuals: {
    id: 'individuals',
    name: 'AI SMEs',
    description: 'Individual expert specialists',
    icon: '🧠',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
    borderColor: 'border-cyan-500/30'
  },
  corporate_roles: {
    id: 'corporate_roles',
    name: 'Corporate Roles',
    description: 'Business function experts',
    icon: '💼',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30'
  },
  field_experts: {
    id: 'field_experts',
    name: 'Field Experts',
    description: 'Industry specialists',
    icon: '🎯',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/30'
  },
  celebrities: {
    id: 'celebrities',
    name: 'Celebrities',
    description: 'Celebrity business minds',
    icon: '⭐',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/30'
  },
  companies: {
    id: 'companies',
    name: 'Companies',
    description: 'Corporate digital twins',
    icon: '🏢',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/30'
  }
};

// Corporate role categories (business functions)
export const corporateRoleCategories = [
  'Investment & Finance',
  'Legal & Compliance',
  'Tax & Accounting',
  'Marketing & Brand',
  'Operations & Supply Chain',
  'HR & Talent',
  'Government & Policy'
];

// Field expert categories (industry specialists)
export const fieldExpertCategories = [
  'Technology & AI',
  'Healthcare & Biotech',
  'Real Estate',
  'Energy & Sustainability',
  'Media & Entertainment',
  'Regional Specialists'
];

// Individual expert categories (strategic/entrepreneurial)
export const individualCategories = [
  'Entrepreneurship & Strategy',
  'Strategic Leadership',
  'Left Field'
];

// Get experts by type
export function getExpertsByType(type: ExpertType): AIExpert[] {
  switch (type) {
    case 'individuals':
      return AI_EXPERTS.filter(e => 
        individualCategories.includes(e.category) ||
        e.category === 'Left Field'
      );
    case 'corporate_roles':
      return AI_EXPERTS.filter(e => corporateRoleCategories.includes(e.category));
    case 'field_experts':
      return AI_EXPERTS.filter(e => fieldExpertCategories.includes(e.category));
    case 'celebrities':
      return AI_EXPERTS.filter(e => e.category === 'Celebrity Crossover');
    case 'companies':
      // Return corporate partners as AIExpert-like objects
      return [];
    default:
      return AI_EXPERTS;
  }
}

// Get corporate partners
export function getCorporatePartners(): CorporatePartner[] {
  return corporatePartners;
}

// Get counts by type
export function getExpertTypeCounts(): Record<ExpertType, number> {
  return {
    individuals: getExpertsByType('individuals').length,
    corporate_roles: getExpertsByType('corporate_roles').length,
    field_experts: getExpertsByType('field_experts').length,
    celebrities: getExpertsByType('celebrities').length,
    companies: corporatePartners.length
  };
}

// Get subcategories for a type
export function getSubcategoriesForType(type: ExpertType): string[] {
  switch (type) {
    case 'individuals':
      return individualCategories;
    case 'corporate_roles':
      return corporateRoleCategories;
    case 'field_experts':
      return fieldExpertCategories;
    case 'celebrities':
      return ['Celebrity Crossover'];
    case 'companies':
      return Array.from(new Set(corporatePartners.map(c => c.industry)));
    default:
      return [];
  }
}
