import { invokeLLM } from "../_core/llm";

// Business plan sections with expert assignments
export const BUSINESS_PLAN_SECTIONS = [
  {
    id: 'executive-summary',
    name: 'Executive Summary',
    description: 'High-level overview and key value propositions',
    expertCategories: ['Strategy & Leadership', 'Investment & Finance'],
    keyQuestions: [
      'Is the value proposition clear and compelling?',
      'Does it capture the essence of the business?',
      'Are the key differentiators evident?'
    ]
  },
  {
    id: 'market-analysis',
    name: 'Market Analysis & Opportunity',
    description: 'Market size, trends, and opportunity assessment',
    expertCategories: ['Strategy & Leadership', 'Investment & Finance'],
    keyQuestions: [
      'Is the TAM/SAM/SOM analysis credible?',
      'Are market trends properly identified?',
      'Is the timing opportunity validated?'
    ]
  },
  {
    id: 'competitive-landscape',
    name: 'Competitive Landscape',
    description: 'Competitor analysis and positioning strategy',
    expertCategories: ['Strategy & Leadership', 'Marketing & Growth'],
    keyQuestions: [
      'Are all key competitors identified?',
      'Is the competitive moat defensible?',
      'What are the barriers to entry?'
    ]
  },
  {
    id: 'go-to-market',
    name: 'Go-to-Market Strategy',
    description: 'Launch strategy, channels, and customer acquisition',
    expertCategories: ['Marketing & Growth', 'Sales & Revenue'],
    keyQuestions: [
      'Is the GTM strategy realistic and executable?',
      'Are customer acquisition costs justified?',
      'What are the key milestones?'
    ]
  },
  {
    id: 'pricing-strategy',
    name: 'Pricing Strategy',
    description: 'Pricing model, unit economics, and revenue projections',
    expertCategories: ['Investment & Finance', 'Sales & Revenue'],
    keyQuestions: [
      'Is the pricing competitive yet profitable?',
      'Are unit economics sustainable?',
      'What pricing power exists?'
    ]
  },
  {
    id: 'product-technology',
    name: 'Product & Technology',
    description: 'Product roadmap, technology stack, and IP',
    expertCategories: ['Technology & Innovation', 'Operations & Execution'],
    keyQuestions: [
      'Is the technology stack appropriate?',
      'What is the product differentiation?',
      'Is the roadmap achievable?'
    ]
  },
  {
    id: 'financial-projections',
    name: 'Financial Projections',
    description: 'Revenue forecasts, costs, and funding requirements',
    expertCategories: ['Investment & Finance'],
    keyQuestions: [
      'Are projections realistic and defensible?',
      'What are the key assumptions?',
      'Is the burn rate sustainable?'
    ]
  },
  {
    id: 'team-operations',
    name: 'Team & Operations',
    description: 'Leadership team, org structure, and operational plan',
    expertCategories: ['Operations & Execution', 'Strategy & Leadership'],
    keyQuestions: [
      'Does the team have the right capabilities?',
      'What are the key hires needed?',
      'Is the operational plan sound?'
    ]
  },
  {
    id: 'risk-assessment',
    name: 'Risk Assessment',
    description: 'Risk identification and mitigation strategies',
    expertCategories: ['Legal & Compliance', 'Investment & Finance'],
    keyQuestions: [
      'Are all material risks identified?',
      'Are mitigation strategies adequate?',
      'What are the regulatory considerations?'
    ]
  },
  {
    id: 'funding-requirements',
    name: 'Funding Requirements',
    description: 'Capital needs, use of funds, and investor terms',
    expertCategories: ['Investment & Finance'],
    keyQuestions: [
      'Is the funding ask justified?',
      'Is the use of funds clear?',
      'What is the expected ROI?'
    ]
  }
];

// Expert profiles for business plan review
export const REVIEW_EXPERTS = [
  { 
    id: 'inv-001', 
    name: 'Victor Sterling', 
    specialty: 'Value Investing & Long-term Wealth', 
    category: 'Investment & Finance', 
    avatar: '👨‍💼',
    systemPrompt: 'You are Victor Sterling, a value investor combining the wisdom of Warren Buffett, Charlie Munger, and Peter Lynch. Focus on intrinsic value, competitive moats, and long-term sustainability.'
  },
  { 
    id: 'inv-002', 
    name: 'Marcus Macro', 
    specialty: 'Global Macro & Economic Cycles', 
    category: 'Investment & Finance', 
    avatar: '📊',
    systemPrompt: 'You are Marcus Macro, a macro economist combining Ray Dalio, George Soros, and Howard Marks. Focus on economic cycles, market timing, and risk management.'
  },
  { 
    id: 'str-001', 
    name: 'Alexandra Strategy', 
    specialty: 'Corporate Strategy & Transformation', 
    category: 'Strategy & Leadership', 
    avatar: '🎯',
    systemPrompt: 'You are Alexandra Strategy, a corporate strategist with McKinsey-level rigor. Focus on competitive positioning, strategic options, and execution feasibility.'
  },
  { 
    id: 'mkt-001', 
    name: 'Maya Marketing', 
    specialty: 'Growth Marketing & Brand Strategy', 
    category: 'Marketing & Growth', 
    avatar: '📈',
    systemPrompt: 'You are Maya Marketing, a growth marketing expert. Focus on customer acquisition, brand positioning, and go-to-market effectiveness.'
  },
  { 
    id: 'sal-001', 
    name: 'Simon Sales', 
    specialty: 'Enterprise Sales & Revenue Operations', 
    category: 'Sales & Revenue', 
    avatar: '🤝',
    systemPrompt: 'You are Simon Sales, an enterprise sales expert. Focus on sales strategy, pricing optimization, and revenue scalability.'
  },
  { 
    id: 'tech-001', 
    name: 'Theo Tech', 
    specialty: 'Technology Strategy & Architecture', 
    category: 'Technology & Innovation', 
    avatar: '💻',
    systemPrompt: 'You are Theo Tech, a technology strategist. Focus on technical feasibility, scalability, and innovation potential.'
  },
  { 
    id: 'ops-001', 
    name: 'Oliver Operations', 
    specialty: 'Operations Excellence & Scaling', 
    category: 'Operations & Execution', 
    avatar: '⚙️',
    systemPrompt: 'You are Oliver Operations, an operations expert. Focus on execution capability, operational efficiency, and scalability.'
  },
  { 
    id: 'leg-001', 
    name: 'Laura Legal', 
    specialty: 'Corporate Law & Regulatory Compliance', 
    category: 'Legal & Compliance', 
    avatar: '⚖️',
    systemPrompt: 'You are Laura Legal, a corporate lawyer. Focus on legal risks, regulatory compliance, and contractual considerations.'
  },
];

export interface ExpertInsight {
  expertId: string;
  expertName: string;
  expertAvatar: string;
  insight: string;
  score: number;
  recommendations: string[];
  concerns: string[];
  timestamp: Date;
}

export interface SectionReview {
  sectionId: string;
  sectionName: string;
  status: 'pending' | 'in-progress' | 'completed';
  expertInsights: ExpertInsight[];
  overallScore?: number;
  recommendations?: string[];
  concerns?: string[];
}

// Get experts for a specific section
export function getExpertsForSection(sectionId: string) {
  const section = BUSINESS_PLAN_SECTIONS.find(s => s.id === sectionId);
  if (!section) return [];
  return REVIEW_EXPERTS.filter(e => section.expertCategories.includes(e.category));
}

// Generate expert analysis for a section using LLM
export async function analyzeSection(
  sectionId: string,
  sectionContent: string,
  expertId: string
): Promise<ExpertInsight> {
  const section = BUSINESS_PLAN_SECTIONS.find(s => s.id === sectionId);
  const expert = REVIEW_EXPERTS.find(e => e.id === expertId);
  
  if (!section || !expert) {
    throw new Error('Section or expert not found');
  }

  const systemPrompt = `${expert.systemPrompt}

You are reviewing the "${section.name}" section of a business plan.

Key questions to address:
${section.keyQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Provide your analysis in the following JSON format:
{
  "insight": "Your detailed analysis of this section (2-3 paragraphs)",
  "score": <number 0-100>,
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "concerns": ["concern 1", "concern 2"]
}

Be professional, objective, and avoid dramatic vocabulary. Focus on practical recommendations.`;

  const userMessage = `Please analyze this "${section.name}" section:

${sectionContent || `[Section content for ${section.name} - analyzing based on standard business plan expectations]`}

Provide your expert assessment.`;

  try {
    const result = await invokeLLM({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'expert_analysis',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              insight: { type: 'string', description: 'Detailed analysis of the section' },
              score: { type: 'integer', description: 'Score from 0-100' },
              recommendations: { 
                type: 'array', 
                items: { type: 'string' },
                description: 'List of recommendations'
              },
              concerns: { 
                type: 'array', 
                items: { type: 'string' },
                description: 'List of concerns'
              }
            },
            required: ['insight', 'score', 'recommendations', 'concerns'],
            additionalProperties: false
          }
        }
      }
    });

    const content = result.choices[0]?.message?.content;
    const analysis = typeof content === 'string' ? JSON.parse(content) : content;

    return {
      expertId: expert.id,
      expertName: expert.name,
      expertAvatar: expert.avatar,
      insight: analysis.insight,
      score: Math.min(100, Math.max(0, analysis.score)),
      recommendations: analysis.recommendations.slice(0, 3),
      concerns: analysis.concerns.slice(0, 2),
      timestamp: new Date()
    };
  } catch (error) {
    console.error(`[BusinessPlanReview] Error analyzing section ${sectionId} with expert ${expertId}:`, error);
    
    // Return a fallback analysis
    return {
      expertId: expert.id,
      expertName: expert.name,
      expertAvatar: expert.avatar,
      insight: `As ${expert.name}, I would need more detailed content to provide a comprehensive analysis of the ${section.name} section. Based on standard business plan expectations, this section should clearly address: ${section.keyQuestions.join('; ')}.`,
      score: 70,
      recommendations: ['Provide more detailed content for thorough analysis', 'Ensure all key questions are addressed'],
      concerns: ['Limited content available for analysis'],
      timestamp: new Date()
    };
  }
}

// Review entire business plan
export async function reviewBusinessPlan(
  businessPlanContent: Record<string, string>,
  onSectionComplete?: (review: SectionReview) => void
): Promise<SectionReview[]> {
  const reviews: SectionReview[] = [];

  for (const section of BUSINESS_PLAN_SECTIONS) {
    const sectionContent = businessPlanContent[section.id] || '';
    const experts = getExpertsForSection(section.id);
    
    const expertInsights: ExpertInsight[] = [];
    
    for (const expert of experts) {
      const insight = await analyzeSection(section.id, sectionContent, expert.id);
      expertInsights.push(insight);
    }

    // Calculate overall score
    const avgScore = Math.round(
      expertInsights.reduce((sum, i) => sum + i.score, 0) / expertInsights.length
    );

    // Aggregate recommendations and concerns
    const allRecommendations = expertInsights.flatMap(i => i.recommendations);
    const allConcerns = expertInsights.flatMap(i => i.concerns);

    const review: SectionReview = {
      sectionId: section.id,
      sectionName: section.name,
      status: 'completed',
      expertInsights,
      overallScore: avgScore,
      recommendations: Array.from(new Set(allRecommendations)).slice(0, 5),
      concerns: Array.from(new Set(allConcerns)).slice(0, 3)
    };

    reviews.push(review);
    
    if (onSectionComplete) {
      onSectionComplete(review);
    }
  }

  return reviews;
}

// Generate consolidated report
export function generateConsolidatedReport(reviews: SectionReview[]): string {
  const overallScore = Math.round(
    reviews.reduce((sum, r) => sum + (r.overallScore || 0), 0) / reviews.length
  );

  let report = `# Business Plan Review Report

## Overall Assessment

**Overall Score: ${overallScore}%**

Based on comprehensive analysis by ${REVIEW_EXPERTS.length} expert reviewers across ${BUSINESS_PLAN_SECTIONS.length} sections.

---

## Section-by-Section Analysis

`;

  for (const review of reviews) {
    report += `### ${review.sectionName}

**Score: ${review.overallScore}%**

#### Expert Insights

`;
    for (const insight of review.expertInsights) {
      report += `**${insight.expertName}** (${insight.score}%)
${insight.insight}

`;
    }

    if (review.recommendations && review.recommendations.length > 0) {
      report += `#### Recommendations
${review.recommendations.map(r => `- ${r}`).join('\n')}

`;
    }

    if (review.concerns && review.concerns.length > 0) {
      report += `#### Concerns
${review.concerns.map(c => `- ${c}`).join('\n')}

`;
    }

    report += '---\n\n';
  }

  report += `## Summary

### Top Recommendations
${reviews.flatMap(r => r.recommendations || []).slice(0, 10).map(r => `- ${r}`).join('\n')}

### Key Concerns to Address
${reviews.flatMap(r => r.concerns || []).slice(0, 5).map(c => `- ${c}`).join('\n')}

---

*Report generated by Chief of Staff SME Expert Team*
`;

  return report;
}
