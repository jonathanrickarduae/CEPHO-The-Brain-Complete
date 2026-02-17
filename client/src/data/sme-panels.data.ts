/**
 * SME Panel System - Based on Productivity Engine Framework
 * 
 * Three Panel Types:
 * 1. Blue Team (Primary) - Builds the case, provides core expertise
 * 2. Left-Field Panel - Cross-sector perspectives, unexpected insights
 * 3. Red Team (Devil's Advocate) - Challenges assumptions, finds flaws
 */

import { AIExpert, allExperts, getExpertsByCategory } from './ai-experts.data';

// Panel type definitions
export type PanelType = 'blue_team' | 'left_field' | 'red_team';

export interface PanelTypeInfo {
  code: PanelType;
  name: string;
  description: string;
  role: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const panelTypes: Record<PanelType, PanelTypeInfo> = {
  blue_team: {
    code: 'blue_team',
    name: 'Blue Team',
    description: 'Primary expert panel that builds the case',
    role: 'Core expertise, analysis, and recommendations. These experts provide the foundational work and primary deliverables.',
    icon: '🔵',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30'
  },
  left_field: {
    code: 'left_field',
    name: 'Left-Field Panel',
    description: 'Cross-sector perspectives and unexpected insights',
    role: 'Bring diverse viewpoints from other industries, creative thinking, and unconventional approaches that the Blue Team might miss.',
    icon: '🟣',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30'
  },
  red_team: {
    code: 'red_team',
    name: 'Red Team',
    description: "Devil's Advocate - challenges and stress-tests",
    role: 'Challenge assumptions, identify risks, find flaws in logic, and stress-test proposals. Essential for pre-mortems and quality gates.',
    icon: '🔴',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30'
  }
};

// Category to panel type mapping
// This determines which panel type each expert category naturally fits into
const categoryPanelMapping: Record<string, PanelType> = {
  // Blue Team - Core business expertise
  'Investment & Finance': 'blue_team',
  'Entrepreneurship & Strategy': 'blue_team',
  'Legal & Compliance': 'blue_team',
  'Tax & Accounting': 'blue_team',
  'Operations & Supply Chain': 'blue_team',
  'Technology & AI': 'blue_team',
  'Healthcare & Biotech': 'blue_team',
  'Real Estate': 'blue_team',
  'Energy & Sustainability': 'blue_team',
  'HR & Talent': 'blue_team',
  
  // Left-Field - Diverse perspectives
  'Left Field': 'left_field',
  'Celebrity Crossover': 'left_field',
  'Media & Entertainment': 'left_field',
  'Regional Specialists': 'left_field',
  
  // Red Team - Challenge and critique
  'Government & Policy': 'red_team',
  'Marketing & Brand': 'blue_team', // Can also serve as Red Team for market validation
};

// Experts who are particularly suited for Red Team work (regardless of category)
const redTeamSuitedExperts = [
  'inv-002', // Marcus Macro - Risk management focus
  'inv-003', // Aurora Disrupt - Contrarian
  'inv-006', // Petra Private - Due diligence
  'inv-007', // Reginald Risk - Risk assessment
  'ent-002', // Diana Disruptor - Challenges status quo
  'ent-005', // Fiona Failure - Failure analysis
  'leg-001', // Lawrence Litigation - Legal challenges
  'leg-003', // Clara Compliance - Regulatory risks
  'leg-005', // Priya Privacy - Privacy risks
  'leg-006', // Ingrid IP - IP protection
  'gov-001', // Patricia Policy - Policy risks
  'gov-002', // Rashid Regulator - Regulatory challenges
  'gov-003', // Dmitri Defense - Security risks
];

// Get experts by panel type
export function getExpertsByPanelType(panelType: PanelType): AIExpert[] {
  if (panelType === 'red_team') {
    // Red Team includes specifically suited experts plus Government & Policy
    const redTeamExperts = allExperts.filter(expert => 
      redTeamSuitedExperts.includes(expert.id) || 
      expert.category === 'Government & Policy'
    );
    return redTeamExperts;
  }
  
  return allExperts.filter(expert => {
    const assignedPanel = categoryPanelMapping[expert.category];
    return assignedPanel === panelType;
  });
}

// Get panel type for an expert
export function getExpertPanelType(expert: AIExpert): PanelType {
  // Check if expert is Red Team suited
  if (redTeamSuitedExperts.includes(expert.id)) {
    return 'red_team';
  }
  
  // Otherwise use category mapping
  return categoryPanelMapping[expert.category] || 'blue_team';
}

// Get all panel types for an expert (some can serve multiple roles)
export function getExpertPanelTypes(expert: AIExpert): PanelType[] {
  const panels: PanelType[] = [];
  
  // Primary panel based on category
  const primaryPanel = categoryPanelMapping[expert.category] || 'blue_team';
  panels.push(primaryPanel);
  
  // Red Team suited experts can also serve on Red Team
  if (redTeamSuitedExperts.includes(expert.id) && primaryPanel !== 'red_team') {
    panels.push('red_team');
  }
  
  // Left Field and Celebrity can serve as Left-Field
  if (['Left Field', 'Celebrity Crossover'].includes(expert.category) && !panels.includes('left_field')) {
    panels.push('left_field');
  }
  
  return panels;
}

// Assemble a panel for a specific purpose
export interface PanelAssemblyOptions {
  topic: string;
  panelType: PanelType;
  size?: number;
  requiredCategories?: string[];
  excludeExperts?: string[];
}

export function assemblePanelForTopic(options: PanelAssemblyOptions): AIExpert[] {
  const { topic, panelType, size = 5, requiredCategories = [], excludeExperts = [] } = options;
  
  // Get all experts eligible for this panel type
  let eligibleExperts = getExpertsByPanelType(panelType)
    .filter(e => !excludeExperts.includes(e.id));
  
  // Score experts by relevance to topic
  const scoredExperts = eligibleExperts.map(expert => {
    let score = expert.performanceScore;
    
    // Boost if topic matches specialty
    if (expert.specialty.toLowerCase().includes(topic.toLowerCase())) {
      score += 20;
    }
    
    // Boost if topic matches bio
    if (expert.bio.toLowerCase().includes(topic.toLowerCase())) {
      score += 10;
    }
    
    // Boost if in required category
    if (requiredCategories.includes(expert.category)) {
      score += 15;
    }
    
    return { expert, score };
  });
  
  // Sort by score and take top performers
  scoredExperts.sort((a, b) => b.score - a.score);
  
  // Ensure diversity by category
  const panel: AIExpert[] = [];
  const usedCategories = new Set<string>();
  
  // First pass: one expert per category
  for (const { expert } of scoredExperts) {
    if (panel.length >= size) break;
    if (!usedCategories.has(expert.category)) {
      panel.push(expert);
      usedCategories.add(expert.category);
    }
  }
  
  // Second pass: fill remaining slots with highest scorers
  for (const { expert } of scoredExperts) {
    if (panel.length >= size) break;
    if (!panel.includes(expert)) {
      panel.push(expert);
    }
  }
  
  return panel;
}

// Assemble a complete three-panel review team
export interface ThreePanelTeam {
  blueTeam: AIExpert[];
  leftField: AIExpert[];
  redTeam: AIExpert[];
}

export function assembleThreePanelTeam(topic: string, teamSize: number = 3): ThreePanelTeam {
  const usedExperts: string[] = [];
  
  // Blue Team first (primary expertise)
  const blueTeam = assemblePanelForTopic({
    topic,
    panelType: 'blue_team',
    size: teamSize,
    excludeExperts: usedExperts
  });
  usedExperts.push(...blueTeam.map(e => e.id));
  
  // Left-Field second (diverse perspectives)
  const leftField = assemblePanelForTopic({
    topic,
    panelType: 'left_field',
    size: Math.max(2, Math.floor(teamSize / 2)),
    excludeExperts: usedExperts
  });
  usedExperts.push(...leftField.map(e => e.id));
  
  // Red Team last (challenge and critique)
  const redTeam = assemblePanelForTopic({
    topic,
    panelType: 'red_team',
    size: Math.max(2, Math.floor(teamSize / 2)),
    excludeExperts: usedExperts
  });
  
  return { blueTeam, leftField, redTeam };
}

// Get panel statistics
export function getPanelStats(): Record<PanelType, { count: number; avgScore: number }> {
  const stats: Record<PanelType, { count: number; totalScore: number }> = {
    blue_team: { count: 0, totalScore: 0 },
    left_field: { count: 0, totalScore: 0 },
    red_team: { count: 0, totalScore: 0 }
  };
  
  allExperts.forEach(expert => {
    const panelType = getExpertPanelType(expert);
    stats[panelType].count++;
    stats[panelType].totalScore += expert.performanceScore;
  });
  
  return {
    blue_team: {
      count: stats.blue_team.count,
      avgScore: stats.blue_team.count > 0 ? Math.round(stats.blue_team.totalScore / stats.blue_team.count) : 0
    },
    left_field: {
      count: stats.left_field.count,
      avgScore: stats.left_field.count > 0 ? Math.round(stats.left_field.totalScore / stats.left_field.count) : 0
    },
    red_team: {
      count: stats.red_team.count,
      avgScore: stats.red_team.count > 0 ? Math.round(stats.red_team.totalScore / stats.red_team.count) : 0
    }
  };
}

// Get top performers by panel type
export function getTopPerformersByPanel(panelType: PanelType, limit: number = 5): AIExpert[] {
  return getExpertsByPanelType(panelType)
    .sort((a, b) => b.performanceScore - a.performanceScore)
    .slice(0, limit);
}

// Get recently used experts by panel type
export function getRecentlyUsedByPanel(panelType: PanelType, limit: number = 5): AIExpert[] {
  return getExpertsByPanelType(panelType)
    .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
    .slice(0, limit);
}

// Value Chain Phase to recommended panel composition
export const phaseRecommendedPanels: Record<number, { primary: PanelType; secondary: PanelType[] }> = {
  1: { primary: 'blue_team', secondary: ['left_field'] }, // Ideation
  2: { primary: 'blue_team', secondary: ['red_team', 'left_field'] }, // Innovation
  3: { primary: 'blue_team', secondary: ['red_team'] }, // Development
  4: { primary: 'blue_team', secondary: ['left_field', 'red_team'] }, // Go-to-Market
  5: { primary: 'blue_team', secondary: ['red_team'] }, // Operations
  6: { primary: 'blue_team', secondary: ['left_field', 'red_team'] }, // Retention
  7: { primary: 'red_team', secondary: ['blue_team'] }, // Exit (due diligence focus)
};

// Get recommended panel composition for a phase
export function getRecommendedPanelsForPhase(phase: number): { primary: PanelType; secondary: PanelType[] } {
  return phaseRecommendedPanels[phase] || { primary: 'blue_team', secondary: [] };
}
