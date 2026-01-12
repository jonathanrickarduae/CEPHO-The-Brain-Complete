/**
 * Video Script Generator
 * 
 * AI-powered script generation for investor pitch videos.
 * Creates compelling 2-3 minute scripts from business intake data.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface BusinessData {
  // Core Info
  companyName: string;
  tagline?: string;
  industry: string;
  stage: 'idea' | 'mvp' | 'revenue' | 'growth' | 'mature';
  
  // Problem & Solution
  problem: string;
  solution: string;
  uniqueValue: string;
  
  // Market
  targetMarket: string;
  marketSize?: string;
  competitors?: string[];
  competitiveAdvantage?: string;
  
  // Traction
  currentRevenue?: string;
  customers?: string;
  growthRate?: string;
  keyMetrics?: string[];
  
  // Team
  founders?: Array<{
    name: string;
    role: string;
    background?: string;
  }>;
  teamSize?: number;
  keyHires?: string[];
  
  // Funding
  fundingTarget?: string;
  useOfFunds?: string;
  previousFunding?: string;
  
  // Vision
  vision?: string;
  milestones?: string[];
}

export interface ScriptSection {
  name: string;
  duration: number; // seconds
  content: string;
  visualSuggestions: string[];
  speakerNotes?: string;
}

export interface GeneratedScript {
  type: 'overview' | 'product' | 'team' | 'traction';
  title: string;
  targetDuration: number;
  totalWords: number;
  estimatedDuration: number;
  
  // Script Sections
  hook: ScriptSection;
  sections: ScriptSection[];
  callToAction: ScriptSection;
  
  // Full Script
  fullScript: string;
  
  // Production Notes
  tone: string;
  pace: string;
  visualTheme: string;
  musicSuggestion: string;
  
  // Key Messages
  keyMessages: string[];
}

export interface ScriptOptions {
  targetDuration?: number; // seconds, default 120
  tone?: 'professional' | 'casual' | 'energetic' | 'inspirational';
  pace?: 'slow' | 'moderate' | 'fast';
  includeStats?: boolean;
  includeTestimonials?: boolean;
  focusAreas?: string[];
}

// ============================================================================
// SCRIPT TEMPLATES
// ============================================================================

const HOOK_TEMPLATES = {
  problem: (data: BusinessData) => 
    `What if I told you that ${data.problem.toLowerCase()}? This is the reality for millions of ${data.targetMarket.toLowerCase()}.`,
  
  statistic: (data: BusinessData) =>
    `${data.marketSize || 'The market'} is massive, yet ${data.problem.toLowerCase()}. We're changing that.`,
  
  question: (data: BusinessData) =>
    `Have you ever wondered why ${data.problem.toLowerCase()}? We did too. And we built something about it.`,
  
  bold: (data: BusinessData) =>
    `${data.companyName} is revolutionizing ${data.industry.toLowerCase()}. Here's how.`,
  
  story: (data: BusinessData) =>
    `When we started ${data.companyName}, we saw a problem that everyone else was ignoring: ${data.problem.toLowerCase()}.`,
};

const CTA_TEMPLATES = {
  investment: (data: BusinessData) =>
    `We're raising ${data.fundingTarget || 'our next round'} to ${data.useOfFunds || 'accelerate growth'}. Join us in building the future of ${data.industry.toLowerCase()}.`,
  
  partnership: (data: BusinessData) =>
    `If you're as excited about transforming ${data.industry.toLowerCase()} as we are, let's talk. The opportunity is now.`,
  
  vision: (data: BusinessData) =>
    `This is just the beginning. With the right partners, ${data.companyName} will ${data.vision || 'change the industry'}. Are you in?`,
  
  urgency: (data: BusinessData) =>
    `The market is moving fast. ${data.companyName} is positioned to lead. Let's discuss how you can be part of this journey.`,
};

// ============================================================================
// SCRIPT GENERATORS
// ============================================================================

/**
 * Generate an Overview Script (2 minutes)
 * Covers: Problem, Solution, Market, Traction, Team, Ask
 */
export function generateOverviewScript(
  data: BusinessData,
  options: ScriptOptions = {}
): GeneratedScript {
  const targetDuration = options.targetDuration || 120;
  const tone = options.tone || 'professional';
  const pace = options.pace || 'moderate';
  
  // Words per minute based on pace
  const wpm = pace === 'slow' ? 120 : pace === 'fast' ? 160 : 140;
  const targetWords = Math.round((targetDuration / 60) * wpm);
  
  // Generate hook
  const hookStyle = data.marketSize ? 'statistic' : 'problem';
  const hookContent = HOOK_TEMPLATES[hookStyle](data);
  
  const hook: ScriptSection = {
    name: 'Hook',
    duration: 10,
    content: hookContent,
    visualSuggestions: [
      'Dynamic opening shot or animation',
      'Problem visualization or statistics',
      'Company logo reveal'
    ],
    speakerNotes: 'Deliver with energy. This sets the tone.'
  };
  
  // Problem Section
  const problemSection: ScriptSection = {
    name: 'The Problem',
    duration: 20,
    content: `${data.problem}. ${data.targetMarket} face this challenge every day. Current solutions are ${data.competitors?.length ? 'fragmented and incomplete' : 'inadequate'}. The cost of inaction is enormous.`,
    visualSuggestions: [
      'Pain point visualization',
      'Statistics or data graphics',
      'Real-world footage of the problem'
    ],
    speakerNotes: 'Build empathy. Make the problem feel real and urgent.'
  };
  
  // Solution Section
  const solutionSection: ScriptSection = {
    name: 'Our Solution',
    duration: 25,
    content: `${data.companyName} ${data.solution}. ${data.uniqueValue}. We've built a ${data.stage === 'idea' ? 'vision' : 'platform'} that ${data.competitiveAdvantage || 'delivers results'}.`,
    visualSuggestions: [
      'Product demo or walkthrough',
      'Before/after comparison',
      'Key feature highlights',
      'User interface showcase'
    ],
    speakerNotes: 'Show, don\'t just tell. This is where visuals matter most.'
  };
  
  // Market Section
  const marketSection: ScriptSection = {
    name: 'The Market',
    duration: 15,
    content: `The ${data.industry} market ${data.marketSize ? `is worth ${data.marketSize}` : 'is growing rapidly'}. Our target: ${data.targetMarket}. ${data.competitors?.length ? `While competitors focus on ${data.competitors[0]}, we're taking a different approach.` : 'We\'re first movers in this space.'}`,
    visualSuggestions: [
      'Market size graphics',
      'Growth charts',
      'Competitive landscape diagram',
      'Target customer profiles'
    ],
    speakerNotes: 'Keep it simple. Big numbers, clear positioning.'
  };
  
  // Traction Section
  const tractionSection: ScriptSection = {
    name: 'Traction',
    duration: 20,
    content: data.currentRevenue || data.customers || data.keyMetrics?.length
      ? `We're not just talking – we're delivering. ${data.currentRevenue ? `${data.currentRevenue} in revenue.` : ''} ${data.customers ? `${data.customers} customers.` : ''} ${data.growthRate ? `Growing at ${data.growthRate}.` : ''} ${data.keyMetrics?.slice(0, 2).join('. ') || ''}`
      : `We're building momentum. Our early users are seeing ${data.uniqueValue.toLowerCase()}. The feedback has been exceptional, and we're ready to scale.`,
    visualSuggestions: [
      'Key metrics dashboard',
      'Growth charts',
      'Customer logos or testimonials',
      'Milestone timeline'
    ],
    speakerNotes: 'Proof points build credibility. Be specific.'
  };
  
  // Team Section
  const teamSection: ScriptSection = {
    name: 'The Team',
    duration: 15,
    content: data.founders?.length
      ? `We're led by ${data.founders.map(f => `${f.name}, ${f.role}${f.background ? ` with ${f.background}` : ''}`).join(', and ')}. ${data.teamSize ? `Our team of ${data.teamSize}` : 'We'} bring the expertise to execute.`
      : `Our team combines deep ${data.industry.toLowerCase()} expertise with proven execution ability. We've built and scaled before, and we're doing it again.`,
    visualSuggestions: [
      'Team photos or video',
      'Background credentials',
      'Previous company logos',
      'Advisor network'
    ],
    speakerNotes: 'Investors bet on people. Show confidence and credibility.'
  };
  
  // CTA
  const ctaStyle = data.fundingTarget ? 'investment' : 'partnership';
  const ctaContent = CTA_TEMPLATES[ctaStyle](data);
  
  const callToAction: ScriptSection = {
    name: 'Call to Action',
    duration: 15,
    content: ctaContent,
    visualSuggestions: [
      'Contact information',
      'Next steps graphic',
      'Company logo and tagline',
      'Website URL'
    ],
    speakerNotes: 'End strong. Clear ask, confident delivery.'
  };
  
  // Combine all sections
  const sections = [problemSection, solutionSection, marketSection, tractionSection, teamSection];
  
  // Generate full script
  const fullScript = [
    hook.content,
    ...sections.map(s => s.content),
    callToAction.content
  ].join('\n\n');
  
  // Calculate actual duration
  const totalWords = fullScript.split(/\s+/).length;
  const estimatedDuration = Math.round((totalWords / wpm) * 60);
  
  // Extract key messages
  const keyMessages = [
    `Problem: ${data.problem.substring(0, 100)}`,
    `Solution: ${data.solution.substring(0, 100)}`,
    `Unique Value: ${data.uniqueValue.substring(0, 100)}`,
    data.fundingTarget ? `Ask: ${data.fundingTarget}` : 'Partnership opportunity'
  ];
  
  return {
    type: 'overview',
    title: `${data.companyName} - Investor Overview`,
    targetDuration,
    totalWords,
    estimatedDuration,
    hook,
    sections,
    callToAction,
    fullScript,
    tone,
    pace,
    visualTheme: tone === 'energetic' ? 'Dynamic and bold' : 'Clean and professional',
    musicSuggestion: tone === 'inspirational' ? 'Uplifting orchestral' : 'Modern corporate ambient',
    keyMessages
  };
}

/**
 * Generate a Product Deep-Dive Script (2-3 minutes)
 * Focuses on: How it works, Features, Demo, Use cases
 */
export function generateProductScript(
  data: BusinessData,
  options: ScriptOptions = {}
): GeneratedScript {
  const targetDuration = options.targetDuration || 150;
  const tone = options.tone || 'professional';
  const pace = options.pace || 'moderate';
  
  const wpm = pace === 'slow' ? 120 : pace === 'fast' ? 160 : 140;
  
  const hook: ScriptSection = {
    name: 'Hook',
    duration: 8,
    content: `Let me show you exactly how ${data.companyName} ${data.solution.toLowerCase()}.`,
    visualSuggestions: [
      'Product interface reveal',
      'Quick montage of key features'
    ],
    speakerNotes: 'Get straight to the product. Viewers clicked for this.'
  };
  
  const howItWorksSection: ScriptSection = {
    name: 'How It Works',
    duration: 40,
    content: `${data.companyName} works in three simple steps. First, ${data.targetMarket.toLowerCase()} connect their existing workflow. Second, our ${data.industry.toLowerCase()} intelligence analyzes their needs. Third, they get ${data.uniqueValue.toLowerCase()}. It's that simple.`,
    visualSuggestions: [
      'Step-by-step walkthrough',
      'Screen recording with highlights',
      'Animated process diagram',
      'User journey visualization'
    ],
    speakerNotes: 'Keep it simple. Three steps max. Show the product.'
  };
  
  const featuresSection: ScriptSection = {
    name: 'Key Features',
    duration: 45,
    content: `What makes us different? ${data.competitiveAdvantage || 'Our approach is fundamentally different'}. We've built features that ${data.targetMarket.toLowerCase()} actually need: intelligent automation, seamless integration, and real-time insights. Every feature is designed with one goal: ${data.uniqueValue.toLowerCase()}.`,
    visualSuggestions: [
      'Feature showcase with callouts',
      'Side-by-side comparisons',
      'Interactive demo clips',
      'Dashboard overview'
    ],
    speakerNotes: 'Focus on benefits, not just features. What does this mean for the user?'
  };
  
  const useCasesSection: ScriptSection = {
    name: 'Use Cases',
    duration: 35,
    content: `Here's how real ${data.targetMarket.toLowerCase()} use ${data.companyName}. ${data.customers ? `Companies like ${data.customers}` : 'Our users'} are seeing ${data.keyMetrics?.[0] || 'significant improvements'}. Whether you're ${data.stage === 'growth' ? 'scaling rapidly' : 'just getting started'}, ${data.companyName} adapts to your needs.`,
    visualSuggestions: [
      'Customer testimonial clips',
      'Results dashboards',
      'Before/after scenarios',
      'Industry-specific examples'
    ],
    speakerNotes: 'Social proof is powerful. Let results speak.'
  };
  
  const callToAction: ScriptSection = {
    name: 'Call to Action',
    duration: 12,
    content: `Ready to see ${data.companyName} in action? Let's schedule a personalized demo. Visit our website or reach out directly. The future of ${data.industry.toLowerCase()} is here.`,
    visualSuggestions: [
      'Demo booking CTA',
      'Contact information',
      'Website URL prominent',
      'QR code for mobile'
    ],
    speakerNotes: 'Clear next step. Make it easy to take action.'
  };
  
  const sections = [howItWorksSection, featuresSection, useCasesSection];
  
  const fullScript = [
    hook.content,
    ...sections.map(s => s.content),
    callToAction.content
  ].join('\n\n');
  
  const totalWords = fullScript.split(/\s+/).length;
  const estimatedDuration = Math.round((totalWords / wpm) * 60);
  
  return {
    type: 'product',
    title: `${data.companyName} - Product Deep Dive`,
    targetDuration,
    totalWords,
    estimatedDuration,
    hook,
    sections,
    callToAction,
    fullScript,
    tone,
    pace,
    visualTheme: 'Product-focused with clean UI shots',
    musicSuggestion: 'Subtle tech ambient',
    keyMessages: [
      'Simple 3-step process',
      `Key differentiator: ${data.competitiveAdvantage || data.uniqueValue}`,
      'Real results from real users',
      'Easy to get started'
    ]
  };
}

/**
 * Generate a Team & Vision Script (2 minutes)
 * Focuses on: Founders, Team, Culture, Vision, Why now
 */
export function generateTeamScript(
  data: BusinessData,
  options: ScriptOptions = {}
): GeneratedScript {
  const targetDuration = options.targetDuration || 120;
  const tone = options.tone || 'inspirational';
  const pace = options.pace || 'moderate';
  
  const wpm = pace === 'slow' ? 120 : pace === 'fast' ? 160 : 140;
  
  const hook: ScriptSection = {
    name: 'Hook',
    duration: 10,
    content: `Behind every great company is a team with a mission. At ${data.companyName}, we're not just building a product – we're building the future of ${data.industry.toLowerCase()}.`,
    visualSuggestions: [
      'Team montage',
      'Office or workspace shots',
      'Candid team moments'
    ],
    speakerNotes: 'Personal and authentic. This is about people.'
  };
  
  const foundersSection: ScriptSection = {
    name: 'The Founders',
    duration: 35,
    content: data.founders?.length
      ? `${data.companyName} was founded by ${data.founders.map(f => {
          const intro = `${f.name}`;
          const role = f.role ? `, our ${f.role}` : '';
          const bg = f.background ? `. ${f.name.split(' ')[0]} brings ${f.background}` : '';
          return intro + role + bg;
        }).join('. ')}. Together, we've seen the problem firsthand and built the solution the market needs.`
      : `Our founding team brings decades of combined experience in ${data.industry.toLowerCase()}. We've seen the problem from every angle – as operators, as customers, as innovators. That's why we know we can solve it.`,
    visualSuggestions: [
      'Founder interviews or headshots',
      'Previous company logos',
      'Educational credentials',
      'Speaking engagements or press'
    ],
    speakerNotes: 'Credibility matters. Show why this team can win.'
  };
  
  const teamSection: ScriptSection = {
    name: 'The Team',
    duration: 25,
    content: `We've assembled ${data.teamSize ? `a team of ${data.teamSize}` : 'an exceptional team'} across engineering, product, and go-to-market. ${data.keyHires?.length ? `Recent additions include ${data.keyHires.slice(0, 2).join(' and ')}.` : ''} Every person here shares one belief: ${data.targetMarket} deserve better.`,
    visualSuggestions: [
      'Team photos or video',
      'Department breakdowns',
      'Culture moments',
      'Team growth timeline'
    ],
    speakerNotes: 'Show the depth. Investors want to see a complete team.'
  };
  
  const visionSection: ScriptSection = {
    name: 'Our Vision',
    duration: 30,
    content: `${data.vision || `We envision a world where ${data.problem.toLowerCase()} is a thing of the past`}. ${data.milestones?.length ? `In the next 12 months, we're targeting ${data.milestones[0]}. By year three, ${data.milestones[1] || 'we\'ll be the market leader'}.` : 'We\'re building for the long term, with clear milestones along the way.'} This isn't just a business – it's a movement.`,
    visualSuggestions: [
      'Vision statement graphic',
      'Roadmap visualization',
      'Future product concepts',
      'Market leadership imagery'
    ],
    speakerNotes: 'Paint the picture. Make them see the future.'
  };
  
  const callToAction: ScriptSection = {
    name: 'Call to Action',
    duration: 15,
    content: `We're looking for partners who share our vision. ${data.fundingTarget ? `We're raising ${data.fundingTarget} to accelerate this journey.` : ''} If you believe in what we're building, let's talk. Together, we can transform ${data.industry.toLowerCase()}.`,
    visualSuggestions: [
      'Team together shot',
      'Contact information',
      'Partnership invitation',
      'Company logo finale'
    ],
    speakerNotes: 'Invite them to join the journey. Make it personal.'
  };
  
  const sections = [foundersSection, teamSection, visionSection];
  
  const fullScript = [
    hook.content,
    ...sections.map(s => s.content),
    callToAction.content
  ].join('\n\n');
  
  const totalWords = fullScript.split(/\s+/).length;
  const estimatedDuration = Math.round((totalWords / wpm) * 60);
  
  return {
    type: 'team',
    title: `${data.companyName} - Team & Vision`,
    targetDuration,
    totalWords,
    estimatedDuration,
    hook,
    sections,
    callToAction,
    fullScript,
    tone,
    pace,
    visualTheme: 'Personal and authentic',
    musicSuggestion: 'Inspirational piano or acoustic',
    keyMessages: [
      'Experienced founding team',
      'Complete team in place',
      'Clear vision and roadmap',
      'Mission-driven culture'
    ]
  };
}

/**
 * Generate a Traction & Metrics Script (2 minutes)
 * Focuses on: Growth, Revenue, Customers, Milestones, Projections
 */
export function generateTractionScript(
  data: BusinessData,
  options: ScriptOptions = {}
): GeneratedScript {
  const targetDuration = options.targetDuration || 120;
  const tone = options.tone || 'professional';
  const pace = options.pace || 'moderate';
  
  const wpm = pace === 'slow' ? 120 : pace === 'fast' ? 160 : 140;
  
  const hook: ScriptSection = {
    name: 'Hook',
    duration: 8,
    content: `Numbers don't lie. Here's the traction that proves ${data.companyName} is ready to scale.`,
    visualSuggestions: [
      'Key metric animation',
      'Growth chart reveal',
      'Counter animation'
    ],
    speakerNotes: 'Lead with your strongest number. Grab attention.'
  };
  
  const revenueSection: ScriptSection = {
    name: 'Revenue & Growth',
    duration: 30,
    content: data.currentRevenue
      ? `We've achieved ${data.currentRevenue} in revenue. ${data.growthRate ? `Growing at ${data.growthRate}.` : ''} Our unit economics are strong, with ${data.keyMetrics?.[0] || 'healthy margins and improving efficiency'}. This isn't just growth – it's sustainable, scalable growth.`
      : `While we're pre-revenue, our leading indicators are exceptional. ${data.keyMetrics?.slice(0, 2).join('. ') || 'User engagement and retention exceed industry benchmarks'}. We're building the foundation for explosive growth.`,
    visualSuggestions: [
      'Revenue chart',
      'MoM/YoY growth visualization',
      'Unit economics breakdown',
      'Cohort analysis'
    ],
    speakerNotes: 'Be specific. Investors want to see the numbers.'
  };
  
  const customersSection: ScriptSection = {
    name: 'Customers & Market',
    duration: 30,
    content: data.customers
      ? `${data.customers} trust ${data.companyName}. From ${data.targetMarket.split(',')[0]} to enterprise, we're proving product-market fit across segments. Customer feedback has been overwhelmingly positive, with ${data.keyMetrics?.find(m => m.toLowerCase().includes('nps') || m.toLowerCase().includes('satisfaction')) || 'strong retention and referral rates'}.`
      : `We're gaining traction with ${data.targetMarket}. Early adopters are validating our thesis, and word-of-mouth is driving organic growth. The market is responding.`,
    visualSuggestions: [
      'Customer logos',
      'Testimonial quotes',
      'NPS or satisfaction scores',
      'Customer growth chart'
    ],
    speakerNotes: 'Social proof builds confidence. Show who trusts you.'
  };
  
  const milestonesSection: ScriptSection = {
    name: 'Milestones & Roadmap',
    duration: 30,
    content: `Here's what we've accomplished: ${data.milestones?.slice(0, 3).join(', ') || 'product launch, initial customers, and key partnerships'}. Looking ahead, ${data.fundingTarget ? `with ${data.fundingTarget}` : 'with the right resources'}, we'll ${data.milestones?.[3] || 'accelerate customer acquisition, expand our team, and enter new markets'}. The path to ${data.vision || 'market leadership'} is clear.`,
    visualSuggestions: [
      'Timeline infographic',
      'Milestone checkmarks',
      'Roadmap visualization',
      'Projection charts'
    ],
    speakerNotes: 'Show progress and momentum. Clear path forward.'
  };
  
  const callToAction: ScriptSection = {
    name: 'Call to Action',
    duration: 15,
    content: `The traction is real. The opportunity is now. ${data.fundingTarget ? `We're raising ${data.fundingTarget} to capture this market.` : ''} Let's discuss how you can be part of ${data.companyName}'s growth story.`,
    visualSuggestions: [
      'Key metrics summary',
      'Investment opportunity',
      'Contact information',
      'Next steps'
    ],
    speakerNotes: 'Confident close. The numbers speak for themselves.'
  };
  
  const sections = [revenueSection, customersSection, milestonesSection];
  
  const fullScript = [
    hook.content,
    ...sections.map(s => s.content),
    callToAction.content
  ].join('\n\n');
  
  const totalWords = fullScript.split(/\s+/).length;
  const estimatedDuration = Math.round((totalWords / wpm) * 60);
  
  return {
    type: 'traction',
    title: `${data.companyName} - Traction & Metrics`,
    targetDuration,
    totalWords,
    estimatedDuration,
    hook,
    sections,
    callToAction,
    fullScript,
    tone,
    pace,
    visualTheme: 'Data-driven with clean charts',
    musicSuggestion: 'Confident corporate',
    keyMessages: [
      data.currentRevenue ? `Revenue: ${data.currentRevenue}` : 'Strong leading indicators',
      data.customers ? `Customers: ${data.customers}` : 'Growing customer base',
      data.growthRate ? `Growth: ${data.growthRate}` : 'Accelerating momentum',
      'Clear path to scale'
    ]
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate all four script types for a complete pitch pack
 */
export function generateFullPitchPack(
  data: BusinessData,
  options: ScriptOptions = {}
): {
  overview: GeneratedScript;
  product: GeneratedScript;
  team: GeneratedScript;
  traction: GeneratedScript;
} {
  return {
    overview: generateOverviewScript(data, options),
    product: generateProductScript(data, options),
    team: generateTeamScript(data, { ...options, tone: 'inspirational' }),
    traction: generateTractionScript(data, options),
  };
}

/**
 * Calculate reading time for a script
 */
export function calculateReadingTime(script: string, pace: 'slow' | 'moderate' | 'fast' = 'moderate'): number {
  const wpm = pace === 'slow' ? 120 : pace === 'fast' ? 160 : 140;
  const words = script.split(/\s+/).length;
  return Math.round((words / wpm) * 60);
}

/**
 * Format script for teleprompter
 */
export function formatForTeleprompter(script: GeneratedScript): string {
  const lines: string[] = [];
  
  lines.push(`=== ${script.title.toUpperCase()} ===`);
  lines.push(`Target Duration: ${Math.floor(script.targetDuration / 60)}:${(script.targetDuration % 60).toString().padStart(2, '0')}`);
  lines.push(`Estimated Duration: ${Math.floor(script.estimatedDuration / 60)}:${(script.estimatedDuration % 60).toString().padStart(2, '0')}`);
  lines.push('');
  
  // Hook
  lines.push(`--- HOOK (${script.hook.duration}s) ---`);
  lines.push(script.hook.content);
  lines.push('');
  
  // Sections
  script.sections.forEach(section => {
    lines.push(`--- ${section.name.toUpperCase()} (${section.duration}s) ---`);
    lines.push(section.content);
    lines.push('');
  });
  
  // CTA
  lines.push(`--- CALL TO ACTION (${script.callToAction.duration}s) ---`);
  lines.push(script.callToAction.content);
  
  return lines.join('\n');
}

/**
 * Export script as production brief
 */
export function exportProductionBrief(script: GeneratedScript): string {
  const brief: string[] = [];
  
  brief.push(`# ${script.title}`);
  brief.push(`## Production Brief`);
  brief.push('');
  brief.push(`**Type:** ${script.type.charAt(0).toUpperCase() + script.type.slice(1)} Video`);
  brief.push(`**Target Duration:** ${Math.floor(script.targetDuration / 60)}:${(script.targetDuration % 60).toString().padStart(2, '0')}`);
  brief.push(`**Tone:** ${script.tone}`);
  brief.push(`**Pace:** ${script.pace}`);
  brief.push(`**Visual Theme:** ${script.visualTheme}`);
  brief.push(`**Music:** ${script.musicSuggestion}`);
  brief.push('');
  
  brief.push('## Key Messages');
  script.keyMessages.forEach(msg => brief.push(`- ${msg}`));
  brief.push('');
  
  brief.push('## Script Breakdown');
  brief.push('');
  
  // Hook
  brief.push(`### Hook (${script.hook.duration}s)`);
  brief.push(`**Script:** ${script.hook.content}`);
  brief.push('**Visuals:**');
  script.hook.visualSuggestions.forEach(v => brief.push(`- ${v}`));
  if (script.hook.speakerNotes) brief.push(`**Notes:** ${script.hook.speakerNotes}`);
  brief.push('');
  
  // Sections
  script.sections.forEach(section => {
    brief.push(`### ${section.name} (${section.duration}s)`);
    brief.push(`**Script:** ${section.content}`);
    brief.push('**Visuals:**');
    section.visualSuggestions.forEach(v => brief.push(`- ${v}`));
    if (section.speakerNotes) brief.push(`**Notes:** ${section.speakerNotes}`);
    brief.push('');
  });
  
  // CTA
  brief.push(`### Call to Action (${script.callToAction.duration}s)`);
  brief.push(`**Script:** ${script.callToAction.content}`);
  brief.push('**Visuals:**');
  script.callToAction.visualSuggestions.forEach(v => brief.push(`- ${v}`));
  if (script.callToAction.speakerNotes) brief.push(`**Notes:** ${script.callToAction.speakerNotes}`);
  brief.push('');
  
  brief.push('## Full Script');
  brief.push('```');
  brief.push(script.fullScript);
  brief.push('```');
  
  return brief.join('\n');
}
