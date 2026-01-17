/**
 * Progressive Assessment Framework
 * 
 * Questions get deeper and more sophisticated as ideas progress through flywheel stages.
 * Multiple SME experts weigh in at different stages with their domain expertise.
 */

import { invokeLLM } from "../_core/llm";

// Progressive question depth by stage
export const PROGRESSIVE_QUESTIONS = {
  // Stage 1: Initial Capture - Basic validation questions
  stage1_initial: {
    name: "Initial Screening",
    description: "Quick validation to filter obvious non-starters",
    questions: [
      { id: "problem_clarity", question: "Is the problem being solved clearly defined?", weight: 10 },
      { id: "solution_fit", question: "Does the proposed solution address the problem?", weight: 10 },
      { id: "market_exists", question: "Is there evidence that a market exists for this?", weight: 9 },
      { id: "feasibility_basic", question: "Is this technically feasible with current technology?", weight: 8 },
      { id: "timing_relevance", question: "Is the timing right for this idea?", weight: 7 },
    ],
    passingScore: 50,
  },

  // Stage 2: Deep Assessment - More probing questions
  stage2_deep: {
    name: "Deep Assessment",
    description: "Thorough analysis of market, competition, and viability",
    questions: [
      { id: "tam_sam_som", question: "What is the Total Addressable Market (TAM), Serviceable Addressable Market (SAM), and Serviceable Obtainable Market (SOM)?", weight: 10 },
      { id: "customer_segments", question: "Who are the specific customer segments and what are their pain points?", weight: 9 },
      { id: "competitive_moat", question: "What sustainable competitive advantage can be built?", weight: 10 },
      { id: "unit_economics", question: "What are the projected unit economics (CAC, LTV, payback period)?", weight: 9 },
      { id: "go_to_market", question: "What is the go-to-market strategy and initial traction plan?", weight: 8 },
      { id: "team_capability", question: "What capabilities are needed and do we have them?", weight: 7 },
      { id: "regulatory_landscape", question: "What regulatory or compliance considerations exist?", weight: 7 },
    ],
    passingScore: 60,
  },

  // Stage 3: SME Consultation - Expert-specific deep dives
  stage3_expert: {
    name: "Expert Consultation",
    description: "Domain experts provide specialized analysis",
    questions: [
      { id: "sector_trends", question: "How does this align with current sector trends and where is the industry heading?", weight: 10 },
      { id: "technology_evolution", question: "How might technology evolution impact this opportunity?", weight: 8 },
      { id: "business_model_innovation", question: "Are there innovative business model approaches that could enhance this?", weight: 9 },
      { id: "partnership_ecosystem", question: "What partnerships or ecosystem plays could accelerate success?", weight: 7 },
      { id: "exit_potential", question: "What are the realistic exit scenarios and valuations?", weight: 8 },
      { id: "risk_mitigation", question: "What are the key risks and how can they be systematically mitigated?", weight: 9 },
    ],
    passingScore: 65,
  },

  // Stage 4: Refinement - Challenge assumptions
  stage4_refinement: {
    name: "Assumption Challenge",
    description: "Stress-test assumptions and refine the approach",
    questions: [
      { id: "assumption_validation", question: "What key assumptions have been validated vs. remain untested?", weight: 10 },
      { id: "pivot_scenarios", question: "What pivot options exist if primary approach fails?", weight: 8 },
      { id: "resource_optimization", question: "How can the approach be optimized for available resources?", weight: 9 },
      { id: "milestone_definition", question: "What are the key milestones and decision points?", weight: 8 },
      { id: "failure_modes", question: "What are the most likely failure modes and early warning signs?", weight: 9 },
      { id: "success_metrics", question: "What metrics will definitively prove success or failure?", weight: 8 },
    ],
    passingScore: 70,
  },

  // Stage 5: Final Brief - Synthesis and recommendation
  stage5_synthesis: {
    name: "Final Synthesis",
    description: "Comprehensive synthesis for decision-making",
    questions: [
      { id: "investment_thesis", question: "What is the core investment thesis in one paragraph?", weight: 10 },
      { id: "risk_reward_ratio", question: "What is the risk-reward ratio and expected value?", weight: 10 },
      { id: "resource_requirements", question: "What are the precise resource requirements for the first 12 months?", weight: 9 },
      { id: "go_no_go", question: "Based on all evidence, is this a go or no-go decision?", weight: 10 },
      { id: "next_steps", question: "If proceeding, what are the immediate next steps?", weight: 8 },
    ],
    passingScore: 75,
  },
};

// SME Expert Panel Configuration
export const SME_EXPERT_PANEL = {
  // Stage 1: Chief of Staff only
  stage1: [
    { 
      id: "chief_of_staff", 
      name: "Chief of Staff", 
      role: "Initial Screening",
      expertise: ["strategic_overview", "resource_allocation", "priority_assessment"],
      perspective: "Executive assistant perspective focused on feasibility and priority fit",
    },
  ],

  // Stage 2: Core business experts
  stage2: [
    { 
      id: "market_analyst", 
      name: "Market Analyst", 
      role: "Market Assessment",
      expertise: ["market_research", "competitive_analysis", "customer_insights"],
      perspective: "Data-driven market analysis with focus on opportunity sizing",
    },
    { 
      id: "financial_strategist", 
      name: "Financial Strategist", 
      role: "Financial Viability",
      expertise: ["financial_modeling", "unit_economics", "investment_analysis"],
      perspective: "Numbers-focused analysis of profitability and capital requirements",
    },
  ],

  // Stage 3: Domain specialists
  stage3: [
    { 
      id: "industry_expert", 
      name: "Industry Expert", 
      role: "Sector Analysis",
      expertise: ["industry_trends", "regulatory_landscape", "competitive_dynamics"],
      perspective: "Deep sector knowledge with insider perspective on industry dynamics",
    },
    { 
      id: "technology_advisor", 
      name: "Technology Advisor", 
      role: "Technical Feasibility",
      expertise: ["technology_assessment", "build_vs_buy", "scalability"],
      perspective: "Technical perspective on implementation and technology risks",
    },
    { 
      id: "growth_strategist", 
      name: "Growth Strategist", 
      role: "Go-to-Market",
      expertise: ["growth_hacking", "customer_acquisition", "channel_strategy"],
      perspective: "Growth-focused analysis of market entry and scaling strategies",
    },
  ],

  // Stage 4: Challenge panel
  stage4: [
    { 
      id: "devils_advocate", 
      name: "Devil's Advocate", 
      role: "Critical Analysis",
      expertise: ["risk_assessment", "assumption_testing", "failure_analysis"],
      perspective: "Deliberately contrarian view to stress-test assumptions",
    },
    { 
      id: "operations_expert", 
      name: "Operations Expert", 
      role: "Operational Feasibility",
      expertise: ["operations", "supply_chain", "process_optimization"],
      perspective: "Practical operational perspective on execution challenges",
    },
  ],

  // Stage 5: Senior synthesis panel
  stage5: [
    { 
      id: "investment_committee", 
      name: "Investment Committee", 
      role: "Final Decision",
      expertise: ["investment_decision", "portfolio_fit", "risk_management"],
      perspective: "Senior investment perspective synthesizing all inputs",
    },
    { 
      id: "strategic_advisor", 
      name: "Strategic Advisor", 
      role: "Strategic Fit",
      expertise: ["strategic_planning", "portfolio_management", "opportunity_cost"],
      perspective: "High-level strategic view on fit with overall objectives",
    },
  ],
};

// Expert viewpoint generation
export async function generateExpertViewpoint(
  expert: typeof SME_EXPERT_PANEL.stage1[0],
  idea: { title: string; description: string },
  previousAssessments: any[],
  stage: number
): Promise<{
  expertId: string;
  expertName: string;
  role: string;
  viewpoint: string;
  score: number;
  keyInsights: string[];
  concerns: string[];
  recommendation: "strongly_support" | "support" | "neutral" | "concern" | "strongly_oppose";
}> {
  const stageQuestions = Object.values(PROGRESSIVE_QUESTIONS)[stage - 1];
  
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are ${expert.name}, a ${expert.role} with expertise in ${expert.expertise.join(", ")}.
        
Your perspective: ${expert.perspective}

Analyze this business idea from your unique professional viewpoint. Be specific, practical, and honest.
Consider the stage ${stage} questions: ${stageQuestions.questions.map(q => q.question).join("; ")}

Previous assessments to build upon:
${previousAssessments.map(a => `${a.assessorType}: Score ${a.score}/100 - ${a.findings?.substring(0, 200) || "No findings"}`).join("\n")}

Respond in JSON format with:
- viewpoint: Your 2-3 paragraph expert analysis
- score: Your confidence score 0-100
- keyInsights: Array of 3-5 key insights from your expertise
- concerns: Array of 2-4 concerns from your perspective
- recommendation: One of "strongly_support", "support", "neutral", "concern", "strongly_oppose"`
      },
      {
        role: "user",
        content: `Idea: ${idea.title}\n\nDescription: ${idea.description}`
      }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "expert_viewpoint",
        strict: true,
        schema: {
          type: "object",
          properties: {
            viewpoint: { type: "string" },
            score: { type: "number" },
            keyInsights: { type: "array", items: { type: "string" } },
            concerns: { type: "array", items: { type: "string" } },
            recommendation: { 
              type: "string",
              enum: ["strongly_support", "support", "neutral", "concern", "strongly_oppose"]
            }
          },
          required: ["viewpoint", "score", "keyInsights", "concerns", "recommendation"],
          additionalProperties: false
        }
      }
    }
  });

  const content = typeof response.choices[0].message.content === 'string' 
    ? response.choices[0].message.content 
    : '{}';
  const parsed = JSON.parse(content);

  return {
    expertId: expert.id,
    expertName: expert.name,
    role: expert.role,
    viewpoint: parsed.viewpoint || "Unable to generate viewpoint",
    score: parsed.score || 50,
    keyInsights: parsed.keyInsights || [],
    concerns: parsed.concerns || [],
    recommendation: parsed.recommendation || "neutral",
  };
}

// Synthesize multiple expert viewpoints into consensus
export async function synthesizeExpertConsensus(
  expertViewpoints: Awaited<ReturnType<typeof generateExpertViewpoint>>[],
  idea: { title: string; description: string }
): Promise<{
  consensusScore: number;
  consensusRecommendation: string;
  synthesizedAnalysis: string;
  agreementLevel: "strong_consensus" | "moderate_consensus" | "mixed_views" | "significant_disagreement";
  keyThemes: string[];
  unresolvedConcerns: string[];
}> {
  const scores = expertViewpoints.map(v => v.score);
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const scoreVariance = Math.sqrt(scores.reduce((sum, s) => sum + Math.pow(s - avgScore, 2), 0) / scores.length);

  let agreementLevel: "strong_consensus" | "moderate_consensus" | "mixed_views" | "significant_disagreement";
  if (scoreVariance < 10) agreementLevel = "strong_consensus";
  else if (scoreVariance < 20) agreementLevel = "moderate_consensus";
  else if (scoreVariance < 30) agreementLevel = "mixed_views";
  else agreementLevel = "significant_disagreement";

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are synthesizing multiple expert viewpoints into a cohesive analysis.
        
The experts have varying levels of agreement (${agreementLevel}).

Create a balanced synthesis that:
1. Highlights areas of consensus
2. Acknowledges areas of disagreement
3. Provides a clear recommendation path forward
4. Identifies unresolved concerns that need attention

Respond in JSON format.`
      },
      {
        role: "user",
        content: `Idea: ${idea.title}

Expert Viewpoints:
${expertViewpoints.map(v => `
${v.expertName} (${v.role}):
Score: ${v.score}/100
Recommendation: ${v.recommendation}
Key Insights: ${v.keyInsights.join("; ")}
Concerns: ${v.concerns.join("; ")}
`).join("\n---\n")}`
      }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "consensus_synthesis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            synthesizedAnalysis: { type: "string" },
            consensusRecommendation: { type: "string" },
            keyThemes: { type: "array", items: { type: "string" } },
            unresolvedConcerns: { type: "array", items: { type: "string" } }
          },
          required: ["synthesizedAnalysis", "consensusRecommendation", "keyThemes", "unresolvedConcerns"],
          additionalProperties: false
        }
      }
    }
  });

  const content = typeof response.choices[0].message.content === 'string' 
    ? response.choices[0].message.content 
    : '{}';
  const parsed = JSON.parse(content);

  return {
    consensusScore: avgScore,
    consensusRecommendation: parsed.consensusRecommendation || "Further analysis needed",
    synthesizedAnalysis: parsed.synthesizedAnalysis || "Unable to synthesize",
    agreementLevel,
    keyThemes: parsed.keyThemes || [],
    unresolvedConcerns: parsed.unresolvedConcerns || [],
  };
}

// Get experts for a given stage
export function getExpertsForStage(stage: number): typeof SME_EXPERT_PANEL.stage1 {
  switch (stage) {
    case 1: return SME_EXPERT_PANEL.stage1;
    case 2: return SME_EXPERT_PANEL.stage2;
    case 3: return SME_EXPERT_PANEL.stage3;
    case 4: return SME_EXPERT_PANEL.stage4;
    case 5: return SME_EXPERT_PANEL.stage5;
    default: return SME_EXPERT_PANEL.stage1;
  }
}

// Get questions for a given stage
export function getQuestionsForStage(stage: number) {
  switch (stage) {
    case 1: return PROGRESSIVE_QUESTIONS.stage1_initial;
    case 2: return PROGRESSIVE_QUESTIONS.stage2_deep;
    case 3: return PROGRESSIVE_QUESTIONS.stage3_expert;
    case 4: return PROGRESSIVE_QUESTIONS.stage4_refinement;
    case 5: return PROGRESSIVE_QUESTIONS.stage5_synthesis;
    default: return PROGRESSIVE_QUESTIONS.stage1_initial;
  }
}
