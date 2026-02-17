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

// Business type templates with section weights and expert focus
export const BUSINESS_TEMPLATES = [
  {
    id: 'saas',
    name: 'SaaS / Software',
    description: 'Software-as-a-Service and subscription-based software businesses',
    icon: '💻',
    sectionWeights: {
      'executive-summary': 1.0,
      'market-analysis': 1.0,
      'competitive-landscape': 1.2,
      'go-to-market': 1.1,
      'pricing-strategy': 1.3,
      'product-technology': 1.4,
      'financial-projections': 1.2,
      'team-operations': 1.0,
      'risk-assessment': 0.9,
      'funding-requirements': 1.0,
    },
    keyMetrics: ['MRR/ARR', 'Churn Rate', 'CAC/LTV Ratio', 'Net Revenue Retention', 'Gross Margin'],
    expertFocus: ['tech-001', 'inv-001', 'mkt-001'],
    guidance: {
      'pricing-strategy': 'Focus on subscription tiers, annual vs monthly pricing, and expansion revenue potential.',
      'financial-projections': 'Emphasize MRR growth, churn assumptions, and path to profitability.',
      'product-technology': 'Detail the tech stack, scalability architecture, and product roadmap.',
    }
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce / Retail',
    description: 'Online retail, D2C brands, and omnichannel commerce',
    icon: '🛒',
    sectionWeights: {
      'executive-summary': 1.0,
      'market-analysis': 1.1,
      'competitive-landscape': 1.2,
      'go-to-market': 1.3,
      'pricing-strategy': 1.1,
      'product-technology': 0.9,
      'financial-projections': 1.2,
      'team-operations': 1.3,
      'risk-assessment': 1.0,
      'funding-requirements': 1.0,
    },
    keyMetrics: ['AOV', 'Conversion Rate', 'Customer Acquisition Cost', 'Gross Margin', 'Inventory Turnover'],
    expertFocus: ['ops-001', 'mkt-001', 'sal-001'],
    guidance: {
      'go-to-market': 'Detail customer acquisition channels, influencer strategy, and brand positioning.',
      'team-operations': 'Focus on fulfillment, inventory management, and supply chain resilience.',
      'pricing-strategy': 'Address margin structure, promotional strategy, and competitive pricing.',
    }
  },
  {
    id: 'marketplace',
    name: 'Marketplace / Platform',
    description: 'Two-sided marketplaces and platform businesses',
    icon: '🔄',
    sectionWeights: {
      'executive-summary': 1.0,
      'market-analysis': 1.2,
      'competitive-landscape': 1.3,
      'go-to-market': 1.4,
      'pricing-strategy': 1.2,
      'product-technology': 1.1,
      'financial-projections': 1.1,
      'team-operations': 1.0,
      'risk-assessment': 1.1,
      'funding-requirements': 1.0,
    },
    keyMetrics: ['GMV', 'Take Rate', 'Liquidity', 'Supply/Demand Ratio', 'Repeat Transaction Rate'],
    expertFocus: ['str-001', 'mkt-001', 'tech-001'],
    guidance: {
      'go-to-market': 'Address the chicken-and-egg problem and initial liquidity strategy.',
      'competitive-landscape': 'Focus on network effects, switching costs, and winner-take-all dynamics.',
      'pricing-strategy': 'Detail take rate structure, pricing for both sides, and monetization timeline.',
    }
  },
  {
    id: 'fintech',
    name: 'FinTech / Financial Services',
    description: 'Financial technology and digital financial services',
    icon: '🏦',
    sectionWeights: {
      'executive-summary': 1.0,
      'market-analysis': 1.1,
      'competitive-landscape': 1.1,
      'go-to-market': 1.0,
      'pricing-strategy': 1.2,
      'product-technology': 1.2,
      'financial-projections': 1.3,
      'team-operations': 1.1,
      'risk-assessment': 1.5,
      'funding-requirements': 1.1,
    },
    keyMetrics: ['AUM', 'Transaction Volume', 'Default Rate', 'Regulatory Compliance', 'Customer Trust Score'],
    expertFocus: ['inv-001', 'inv-002', 'leg-001'],
    guidance: {
      'risk-assessment': 'Thoroughly address regulatory requirements, compliance framework, and risk management.',
      'financial-projections': 'Detail unit economics, capital requirements, and path to profitability.',
      'product-technology': 'Focus on security, data protection, and integration capabilities.',
    }
  },
  {
    id: 'healthcare',
    name: 'Healthcare / HealthTech',
    description: 'Healthcare technology, digital health, and medical devices',
    icon: '🏥',
    sectionWeights: {
      'executive-summary': 1.0,
      'market-analysis': 1.2,
      'competitive-landscape': 1.0,
      'go-to-market': 1.1,
      'pricing-strategy': 1.1,
      'product-technology': 1.3,
      'financial-projections': 1.1,
      'team-operations': 1.2,
      'risk-assessment': 1.5,
      'funding-requirements': 1.2,
    },
    keyMetrics: ['Patient Outcomes', 'Regulatory Approval Status', 'Reimbursement Rate', 'Clinical Evidence', 'Market Access'],
    expertFocus: ['leg-001', 'tech-001', 'ops-001'],
    guidance: {
      'risk-assessment': 'Address FDA/regulatory pathway, clinical trial requirements, and liability considerations.',
      'product-technology': 'Detail clinical validation, efficacy data, and integration with healthcare systems.',
      'team-operations': 'Emphasize clinical advisory board, regulatory expertise, and healthcare partnerships.',
    }
  },
  {
    id: 'b2b-services',
    name: 'B2B Services / Consulting',
    description: 'Professional services, consulting, and B2B service businesses',
    icon: '🤝',
    sectionWeights: {
      'executive-summary': 1.0,
      'market-analysis': 1.0,
      'competitive-landscape': 1.1,
      'go-to-market': 1.2,
      'pricing-strategy': 1.1,
      'product-technology': 0.8,
      'financial-projections': 1.1,
      'team-operations': 1.4,
      'risk-assessment': 1.0,
      'funding-requirements': 0.9,
    },
    keyMetrics: ['Utilization Rate', 'Average Contract Value', 'Client Retention', 'Revenue per Employee', 'Gross Margin'],
    expertFocus: ['sal-001', 'ops-001', 'str-001'],
    guidance: {
      'team-operations': 'Focus on talent acquisition, training, and scaling service delivery.',
      'go-to-market': 'Detail enterprise sales strategy, partnership channels, and thought leadership.',
      'pricing-strategy': 'Address pricing models, value-based pricing, and margin optimization.',
    }
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


// Chief of Staff expert team selection using LLM
export async function selectExpertTeam(
  businessPlanContent: string,
  availableExperts: typeof REVIEW_EXPERTS = REVIEW_EXPERTS
): Promise<{
  selectedExperts: string[];
  reasoning: string;
  teamComposition: { expertId: string; role: string; rationale: string }[];
}> {
  const expertDescriptions = availableExperts.map(e => 
    `- ${e.id}: ${e.name} (${e.category}) - ${e.specialty}`
  ).join('\n');

  const systemPrompt = `You are the Chief of Staff, responsible for assembling the optimal expert team to review a business plan. 

Available experts:
${expertDescriptions}

Your task is to analyze the business plan content and select the most relevant experts for a comprehensive review. Consider:
1. The industry/sector of the business
2. The stage of the business (startup, growth, mature)
3. Key challenges and opportunities identified
4. Areas that need the most scrutiny

Respond in JSON format:
{
  "selectedExperts": ["expert-id-1", "expert-id-2", ...],
  "reasoning": "Brief explanation of why this team composition was chosen",
  "teamComposition": [
    {
      "expertId": "expert-id",
      "role": "Lead Reviewer / Supporting Analyst / Specialist",
      "rationale": "Why this expert is essential for this review"
    }
  ]
}

Select at least 4 experts but no more than 8. Prioritize experts whose specialties align with the business plan's key areas.`;

  const userMessage = `Please analyze this business plan and select the optimal expert team for review:

${businessPlanContent || 'No specific content provided. Please select a balanced team covering all major business plan areas.'}`;

  try {
    const result = await invokeLLM({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'expert_team_selection',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              selectedExperts: { 
                type: 'array', 
                items: { type: 'string' },
                description: 'List of expert IDs to include in the review team'
              },
              reasoning: { 
                type: 'string', 
                description: 'Explanation of the team composition decision'
              },
              teamComposition: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    expertId: { type: 'string' },
                    role: { type: 'string' },
                    rationale: { type: 'string' }
                  },
                  required: ['expertId', 'role', 'rationale'],
                  additionalProperties: false
                },
                description: 'Detailed breakdown of each expert role'
              }
            },
            required: ['selectedExperts', 'reasoning', 'teamComposition'],
            additionalProperties: false
          }
        }
      }
    });

    const content = result.choices[0]?.message?.content;
    const selection = typeof content === 'string' ? JSON.parse(content) : content;

    // Validate that selected experts exist
    const validExperts = selection.selectedExperts.filter((id: string) => 
      availableExperts.some(e => e.id === id)
    );

    // Ensure at least 4 experts are selected
    if (validExperts.length < 4) {
      // Add default experts to reach minimum
      const defaultExperts = ['inv-001', 'str-001', 'mkt-001', 'tech-001'];
      for (const defaultId of defaultExperts) {
        if (!validExperts.includes(defaultId) && validExperts.length < 4) {
          validExperts.push(defaultId);
        }
      }
    }

    return {
      selectedExperts: validExperts,
      reasoning: selection.reasoning,
      teamComposition: selection.teamComposition.filter((tc: { expertId: string }) => 
        validExperts.includes(tc.expertId)
      )
    };
  } catch (error) {
    console.error('[BusinessPlanReview] Error selecting expert team:', error);
    
    // Return default balanced team
    return {
      selectedExperts: ['inv-001', 'str-001', 'mkt-001', 'sal-001', 'tech-001', 'ops-001'],
      reasoning: 'Default balanced team selected to cover all major business plan areas including finance, strategy, marketing, sales, technology, and operations.',
      teamComposition: [
        { expertId: 'inv-001', role: 'Lead Financial Reviewer', rationale: 'Essential for evaluating financial projections and funding requirements' },
        { expertId: 'str-001', role: 'Strategy Lead', rationale: 'Critical for assessing competitive positioning and strategic direction' },
        { expertId: 'mkt-001', role: 'Marketing Specialist', rationale: 'Key for evaluating go-to-market strategy and customer acquisition' },
        { expertId: 'sal-001', role: 'Revenue Analyst', rationale: 'Important for pricing strategy and sales scalability assessment' },
        { expertId: 'tech-001', role: 'Technology Reviewer', rationale: 'Necessary for product and technology feasibility analysis' },
        { expertId: 'ops-001', role: 'Operations Analyst', rationale: 'Required for operational plan and execution capability review' }
      ]
    };
  }
}
