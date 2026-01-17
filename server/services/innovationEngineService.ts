/**
 * Innovation Engine Service
 * 
 * Implements the 5-stage Innovation Flywheel:
 * 1. Capture - Idea intake from various sources
 * 2. Assess - Strategic framework evaluation
 * 3. Consult - SME expert feedback
 * 4. Refine - Iterate based on findings
 * 5. Brief - Generate actionable summary
 */

import { getDb } from "../db";
import { 
  innovationIdeas, 
  ideaAssessments, 
  ideaRefinements, 
  investmentScenarios,
  trendRepository 
} from "../../drizzle/schema";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

// Flywheel stages
export const FLYWHEEL_STAGES = {
  CAPTURE: 1,
  ASSESS: 2,
  CONSULT: 3,
  REFINE: 4,
  BRIEF: 5,
} as const;

// Strategic Framework Questions by Category
export const STRATEGIC_FRAMEWORK = {
  market_analysis: [
    { id: "market_size", question: "What is the estimated market size (TAM/SAM/SOM)?", weight: 10 },
    { id: "market_growth", question: "Is the market growing, stable, or declining?", weight: 8 },
    { id: "target_customer", question: "Who is the ideal customer and what problem does this solve for them?", weight: 9 },
    { id: "customer_willingness", question: "Are customers willing to pay for this solution?", weight: 9 },
    { id: "market_timing", question: "Is the timing right for this market entry?", weight: 7 },
  ],
  feasibility: [
    { id: "technical_complexity", question: "What is the technical complexity to build this?", weight: 8 },
    { id: "time_to_market", question: "How long would it take to launch an MVP?", weight: 7 },
    { id: "skills_required", question: "What skills/resources are needed that we don't have?", weight: 6 },
    { id: "regulatory_barriers", question: "Are there regulatory or legal barriers?", weight: 8 },
    { id: "scalability", question: "Can this scale without proportional cost increases?", weight: 7 },
  ],
  competitive_landscape: [
    { id: "existing_competitors", question: "Who are the main competitors and what's their market share?", weight: 9 },
    { id: "differentiation", question: "What makes this different/better than existing solutions?", weight: 10 },
    { id: "barriers_to_entry", question: "What barriers to entry exist or can be created?", weight: 7 },
    { id: "competitive_response", question: "How might competitors respond to this entry?", weight: 6 },
    { id: "moat_potential", question: "Can a sustainable competitive advantage be built?", weight: 8 },
  ],
  financial_viability: [
    { id: "revenue_model", question: "What is the revenue model and pricing strategy?", weight: 9 },
    { id: "unit_economics", question: "What are the unit economics (CAC, LTV, margins)?", weight: 10 },
    { id: "break_even", question: "When would this break even?", weight: 8 },
    { id: "funding_requirements", question: "How much capital is needed to reach profitability?", weight: 9 },
    { id: "roi_potential", question: "What is the realistic ROI potential?", weight: 8 },
  ],
  risk_assessment: [
    { id: "key_risks", question: "What are the top 3 risks that could kill this idea?", weight: 10 },
    { id: "mitigation_strategies", question: "How can these risks be mitigated?", weight: 8 },
    { id: "worst_case", question: "What's the worst-case scenario and its probability?", weight: 7 },
    { id: "pivot_options", question: "What pivot options exist if the initial approach fails?", weight: 6 },
    { id: "reversibility", question: "How reversible is this investment if it doesn't work?", weight: 7 },
  ],
};

// Investment scenario templates
export const INVESTMENT_TEMPLATES = {
  bootstrap: { name: "Bootstrap", amount: 500, description: "Minimal viable approach with personal funds" },
  seed: { name: "Seed", amount: 5000, description: "Small investment for initial validation" },
  growth: { name: "Growth", amount: 20000, description: "Significant investment for market entry" },
  scale: { name: "Scale", amount: 100000, description: "Major investment for rapid scaling" },
};

interface IdeaInput {
  title: string;
  description?: string;
  source?: "manual" | "article" | "trend" | "conversation" | "chief_of_staff" | "sme_suggestion";
  sourceUrl?: string;
  category?: string;
  tags?: string[];
}

interface AssessmentInput {
  ideaId: number;
  assessmentType: keyof typeof STRATEGIC_FRAMEWORK | "sme_consultation";
  stage: number;
  assessorType?: "chief_of_staff" | "sme_expert" | "framework" | "user";
  assessorId?: string;
  questions?: { question: string; answer: string; score: number }[];
  findings?: string;
}

/**
 * Capture a new idea into the flywheel
 */
export async function captureIdea(userId: number, input: IdeaInput) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(innovationIdeas).values({
    userId,
    title: input.title,
    description: input.description,
    source: input.source || "manual",
    sourceUrl: input.sourceUrl,
    category: input.category,
    tags: input.tags,
    status: "captured",
    currentStage: FLYWHEEL_STAGES.CAPTURE,
    priority: "medium",
  });

  return { id: result[0].insertId, stage: FLYWHEEL_STAGES.CAPTURE };
}

/**
 * Get all ideas for a user
 */
export async function getIdeas(userId: number, filters?: { status?: string; stage?: number; limit?: number }) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(innovationIdeas.userId, userId)];
  
  if (filters?.status) {
    conditions.push(eq(innovationIdeas.status, filters.status as any));
  }
  if (filters?.stage) {
    conditions.push(eq(innovationIdeas.currentStage, filters.stage));
  }

  const ideas = await db
    .select()
    .from(innovationIdeas)
    .where(and(...conditions))
    .orderBy(desc(innovationIdeas.updatedAt))
    .limit(filters?.limit || 50);

  return ideas;
}

/**
 * Get a single idea with all its assessments
 */
export async function getIdeaWithAssessments(ideaId: number) {
  const db = await getDb();
  if (!db) return null;

  const [idea] = await db
    .select()
    .from(innovationIdeas)
    .where(eq(innovationIdeas.id, ideaId))
    .limit(1);

  if (!idea) return null;

  const assessments = await db
    .select()
    .from(ideaAssessments)
    .where(eq(ideaAssessments.ideaId, ideaId))
    .orderBy(desc(ideaAssessments.createdAt));

  const refinements = await db
    .select()
    .from(ideaRefinements)
    .where(eq(ideaRefinements.ideaId, ideaId))
    .orderBy(desc(ideaRefinements.createdAt));

  const scenarios = await db
    .select()
    .from(investmentScenarios)
    .where(eq(investmentScenarios.ideaId, ideaId))
    .orderBy(investmentScenarios.investmentAmount);

  return { idea, assessments, refinements, scenarios };
}

/**
 * Run strategic framework assessment on an idea
 */
export async function runStrategicAssessment(
  ideaId: number,
  assessmentType: keyof typeof STRATEGIC_FRAMEWORK
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [idea] = await db
    .select()
    .from(innovationIdeas)
    .where(eq(innovationIdeas.id, ideaId))
    .limit(1);

  if (!idea) throw new Error("Idea not found");

  const questions = STRATEGIC_FRAMEWORK[assessmentType];
  
  // Use LLM to assess each question
  const assessedQuestions = await Promise.all(
    questions.map(async (q) => {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are a strategic business analyst. Assess the following business idea against this specific question. 
            Provide a concise answer (2-3 sentences) and a score from 0-100 where:
            - 0-30: Poor/High Risk
            - 31-50: Below Average/Moderate Risk
            - 51-70: Average/Acceptable
            - 71-85: Good/Favorable
            - 86-100: Excellent/Very Favorable
            
            Respond in JSON format: { "answer": "...", "score": number }`
          },
          {
            role: "user",
            content: `Idea: ${idea.title}\n\nDescription: ${idea.description || "No description provided"}\n\nQuestion: ${q.question}`
          }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "assessment_response",
            strict: true,
            schema: {
              type: "object",
              properties: {
                answer: { type: "string" },
                score: { type: "number" }
              },
              required: ["answer", "score"],
              additionalProperties: false
            }
          }
        }
      });

      const content = typeof response.choices[0].message.content === 'string' ? response.choices[0].message.content : '{}';
  const parsed = JSON.parse(content);
      return {
        question: q.question,
        answer: parsed.answer || "Unable to assess",
        score: parsed.score || 50,
        weight: q.weight,
      };
    })
  );

  // Calculate weighted average score
  const totalWeight = assessedQuestions.reduce((sum, q) => sum + q.weight, 0);
  const weightedScore = assessedQuestions.reduce((sum, q) => sum + (q.score * q.weight), 0) / totalWeight;

  // Determine recommendation based on score
  let recommendation: "proceed" | "refine" | "pivot" | "reject" | "needs_more_info" = "needs_more_info";
  if (weightedScore >= 75) recommendation = "proceed";
  else if (weightedScore >= 55) recommendation = "refine";
  else if (weightedScore >= 35) recommendation = "pivot";
  else recommendation = "reject";

  // Generate findings summary
  const findingsResponse = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Summarize the assessment findings in 2-3 paragraphs. Highlight key strengths, weaknesses, and actionable recommendations."
      },
      {
        role: "user",
        content: `Assessment Type: ${assessmentType}\nIdea: ${idea.title}\n\nQuestions and Answers:\n${assessedQuestions.map(q => `Q: ${q.question}\nA: ${q.answer} (Score: ${q.score})`).join("\n\n")}`
      }
    ]
  });

  const findingsContent = findingsResponse.choices[0].message.content;
  const findings = typeof findingsContent === 'string' ? findingsContent : '';

  // Store assessment
  const result = await db.insert(ideaAssessments).values({
    ideaId,
    assessmentType,
    stage: idea.currentStage,
    assessorType: "framework",
    questions: assessedQuestions,
    findings,
    score: weightedScore,
    recommendation,
    refinementSuggestions: recommendation === "refine" ? await generateRefinementSuggestions(idea, assessedQuestions) : null,
  });

  // Update idea status if in capture stage
  if (idea.currentStage === FLYWHEEL_STAGES.CAPTURE) {
    await db.update(innovationIdeas)
      .set({ 
        status: "assessing", 
        currentStage: FLYWHEEL_STAGES.ASSESS,
        confidenceScore: weightedScore,
      })
      .where(eq(innovationIdeas.id, ideaId));
  }

  return {
    assessmentId: result[0].insertId,
    score: weightedScore,
    recommendation,
    findings,
    questions: assessedQuestions,
  };
}

/**
 * Generate refinement suggestions based on assessment
 */
async function generateRefinementSuggestions(
  idea: any,
  assessedQuestions: { question: string; answer: string; score: number; weight: number }[]
) {
  const lowScoreQuestions = assessedQuestions.filter(q => q.score < 60);
  
  if (lowScoreQuestions.length === 0) return [];

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Generate 3-5 specific, actionable refinement suggestions to improve the weak areas of this business idea. Return as JSON array of strings."
      },
      {
        role: "user",
        content: `Idea: ${idea.title}\n\nWeak Areas:\n${lowScoreQuestions.map(q => `- ${q.question}: ${q.answer} (Score: ${q.score})`).join("\n")}`
      }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "suggestions",
        strict: true,
        schema: {
          type: "object",
          properties: {
            suggestions: { type: "array", items: { type: "string" } }
          },
          required: ["suggestions"],
          additionalProperties: false
        }
      }
    }
  });

  const content = typeof response.choices[0].message.content === 'string' ? response.choices[0].message.content : '{}';
  const parsed = JSON.parse(content);
  return parsed.suggestions || [];
}

/**
 * Advance idea to next flywheel stage
 */
export async function advanceToNextStage(ideaId: number, rationale?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [idea] = await db
    .select()
    .from(innovationIdeas)
    .where(eq(innovationIdeas.id, ideaId))
    .limit(1);

  if (!idea) throw new Error("Idea not found");
  if (idea.currentStage >= FLYWHEEL_STAGES.BRIEF) {
    throw new Error("Idea is already at final stage");
  }

  const nextStage = idea.currentStage + 1;
  const statusMap: Record<number, string> = {
    2: "assessing",
    3: "refining",
    4: "refining",
    5: "validated",
  };

  await db.update(innovationIdeas)
    .set({ 
      currentStage: nextStage,
      status: (statusMap[nextStage] || "assessing") as any,
    })
    .where(eq(innovationIdeas.id, ideaId));

  // Record the stage transition
  await db.insert(ideaRefinements).values({
    ideaId,
    fromStage: idea.currentStage,
    toStage: nextStage,
    refinementType: "scope_change",
    rationale: rationale || `Advanced from stage ${idea.currentStage} to ${nextStage}`,
    triggeredBy: "user_input",
  });

  return { newStage: nextStage };
}

/**
 * Generate investment scenarios for an idea
 */
export async function generateInvestmentScenarios(ideaId: number, budgets: number[] = [500, 5000, 20000]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [idea] = await db
    .select()
    .from(innovationIdeas)
    .where(eq(innovationIdeas.id, ideaId))
    .limit(1);

  if (!idea) throw new Error("Idea not found");

  const scenarios = await Promise.all(
    budgets.map(async (budget) => {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are a financial analyst. Create a realistic investment scenario for a business idea with a budget of £${budget.toLocaleString()}.
            
            Consider:
            - Website/tech costs
            - Marketing and customer acquisition
            - Operations and overhead
            - Legal and compliance
            - Contingency
            
            Provide realistic projections based on the budget level. Return JSON with this structure:
            {
              "scenarioName": "string",
              "breakdown": { "website": number, "marketing": number, "operations": number, "legal": number, "contingency": number },
              "projectedRevenue": { "month3": number, "month6": number, "year1": number },
              "projectedProfit": { "month3": number, "month6": number, "year1": number },
              "timeToBreakeven": number (months),
              "riskLevel": "low" | "medium" | "high" | "very_high",
              "keyAssumptions": ["string"],
              "recommendations": "string"
            }`
          },
          {
            role: "user",
            content: `Business Idea: ${idea.title}\n\nDescription: ${idea.description || "No description"}\n\nBudget: £${budget.toLocaleString()}`
          }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "investment_scenario",
            strict: true,
            schema: {
              type: "object",
              properties: {
                scenarioName: { type: "string" },
                breakdown: {
                  type: "object",
                  properties: {
                    website: { type: "number" },
                    marketing: { type: "number" },
                    operations: { type: "number" },
                    legal: { type: "number" },
                    contingency: { type: "number" }
                  },
                  required: ["website", "marketing", "operations", "legal", "contingency"],
                  additionalProperties: false
                },
                projectedRevenue: {
                  type: "object",
                  properties: {
                    month3: { type: "number" },
                    month6: { type: "number" },
                    year1: { type: "number" }
                  },
                  required: ["month3", "month6", "year1"],
                  additionalProperties: false
                },
                projectedProfit: {
                  type: "object",
                  properties: {
                    month3: { type: "number" },
                    month6: { type: "number" },
                    year1: { type: "number" }
                  },
                  required: ["month3", "month6", "year1"],
                  additionalProperties: false
                },
                timeToBreakeven: { type: "number" },
                riskLevel: { type: "string" },
                keyAssumptions: { type: "array", items: { type: "string" } },
                recommendations: { type: "string" }
              },
              required: ["scenarioName", "breakdown", "projectedRevenue", "projectedProfit", "timeToBreakeven", "riskLevel", "keyAssumptions", "recommendations"],
              additionalProperties: false
            }
          }
        }
      });

      const content = typeof response.choices[0].message.content === 'string' ? response.choices[0].message.content : '{}';
  const parsed = JSON.parse(content);
      
      return {
        ideaId,
        scenarioName: parsed.scenarioName || `£${budget.toLocaleString()} Scenario`,
        investmentAmount: budget,
        currency: "GBP",
        breakdown: parsed.breakdown,
        projectedRevenue: parsed.projectedRevenue,
        projectedProfit: parsed.projectedProfit,
        timeToBreakeven: parsed.timeToBreakeven,
        riskLevel: parsed.riskLevel as any,
        keyAssumptions: parsed.keyAssumptions,
        recommendations: parsed.recommendations,
        isRecommended: false,
      };
    })
  );

  // Find the recommended scenario (best ROI to risk ratio)
  const riskMultipliers: Record<string, number> = { low: 1, medium: 0.8, high: 0.5, very_high: 0.3 };
  const recommendedIndex = scenarios.reduce((best, scenario, index) => {
    const roi = (scenario.projectedProfit?.year1 || 0) / scenario.investmentAmount;
    const riskMultiplier = riskMultipliers[scenario.riskLevel as string] || 0.5;
    const score = roi * riskMultiplier;
    
    const bestRoi = (scenarios[best].projectedProfit?.year1 || 0) / scenarios[best].investmentAmount;
    const bestRiskMultiplier = riskMultipliers[scenarios[best].riskLevel as string] || 0.5;
    const bestScore = bestRoi * bestRiskMultiplier;
    
    return score > bestScore ? index : best;
  }, 0);

  scenarios[recommendedIndex].isRecommended = true;

  // Store scenarios
  for (const scenario of scenarios) {
    await db.insert(investmentScenarios).values(scenario);
  }

  return scenarios;
}

/**
 * Generate idea brief document using CEPHO branded templates
 * All briefs pass through Chief of Staff QA sign-off
 */
export async function generateIdeaBrief(ideaId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const ideaData = await getIdeaWithAssessments(ideaId);
  if (!ideaData) throw new Error("Idea not found");

  const { idea, assessments, scenarios } = ideaData;
  
  // Import branded template services
  const { generateInnovationBrief, applyBrandFormatting } = await import("./documentTemplateService");
  const { processDocumentQA } = await import("./chiefOfStaffQAService");

  // Prepare assessment data for branded template
  const assessmentData = assessments.map(a => ({
    type: a.assessmentType,
    score: a.score || 0,
    findings: a.findings || "Assessment pending",
    // Expert viewpoints would be stored in metadata if available
  }));

  // Prepare investment scenarios
  const investmentData = scenarios.map(s => ({
    name: s.scenarioName,
    amount: s.investmentAmount,
    projectedReturn: s.projectedProfit ? `£${(s.projectedProfit as number).toLocaleString()} projected profit` : "TBD",
    riskLevel: s.riskLevel || "Medium",
    timeline: `${s.timeToBreakeven || 12} months to break even`,
  }));

  // Determine final recommendation
  const avgScore = assessments.reduce((sum, a) => sum + (a.score || 0), 0) / (assessments.length || 1);
  let decision: "proceed" | "refine" | "pivot" | "reject" = "refine";
  if (avgScore >= 75) decision = "proceed";
  else if (avgScore >= 50) decision = "refine";
  else if (avgScore >= 30) decision = "pivot";
  else decision = "reject";

  // Generate branded Innovation Brief
  const { markdown: briefDocument, metadata, signOff } = await generateInnovationBrief(
    {
      title: idea.title,
      description: idea.description || "No description provided",
      source: idea.source || "manual",
    },
    assessmentData,
    investmentData,
    {
      decision,
      rationale: `Based on an overall assessment score of ${avgScore.toFixed(0)}/100, this idea ${decision === "proceed" ? "shows strong potential and is recommended for progression to Project Genesis" : decision === "refine" ? "has merit but requires further refinement before proceeding" : decision === "pivot" ? "needs significant changes to the core approach" : "does not meet minimum viability thresholds"}.`,
      nextSteps: decision === "proceed" 
        ? ["Initiate Project Genesis workflow", "Assign project lead and resources", "Develop detailed implementation plan"]
        : decision === "refine"
        ? ["Address identified gaps in assessment", "Conduct additional market research", "Re-run through Innovation Flywheel"]
        : ["Archive idea with learnings", "Consider alternative approaches", "Monitor market for changes"],
    },
    "confidential"
  );

  // Process through Chief of Staff QA
  const qaResult = await processDocumentQA(
    metadata.id,
    "innovation_brief",
    `Innovation Brief: ${idea.title}`,
    briefDocument,
    "confidential"
  );

  // Use QA-approved content
  const finalBrief = qaResult.approved ? qaResult.finalContent : briefDocument;

  // Update idea with brief
  await db.update(innovationIdeas)
    .set({ 
      briefDocument: finalBrief,
      currentStage: FLYWHEEL_STAGES.BRIEF,
      status: "validated",
    })
    .where(eq(innovationIdeas.id, ideaId));

  // Also save to Document Library
  const { createDocument } = await import("../db");
  const documentId = `DOC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  await createDocument({
    documentId,
    userId: idea.userId,
    title: `Innovation Brief: ${idea.title}`,
    type: "innovation_brief",
    content: JSON.stringify({
      description: idea.description,
      category: idea.category,
      confidenceScore: avgScore,
      assessments: assessmentData,
      scenarios: investmentData,
      recommendation: {
        decision,
        rationale: `Based on an overall assessment score of ${avgScore.toFixed(0)}/100`,
        nextSteps: decision === "proceed" 
          ? ["Initiate Project Genesis workflow", "Assign project lead and resources", "Develop detailed implementation plan"]
          : decision === "refine"
          ? ["Address identified gaps in assessment", "Conduct additional market research", "Re-run through Innovation Flywheel"]
          : ["Archive idea with learnings", "Consider alternative approaches", "Monitor market for changes"],
      },
    }),
    classification: "confidential",
    qaStatus: qaResult.approved ? "approved" : "pending",
    qaApprover: qaResult.approved ? "Chief of Staff AI" : undefined,
    qaApprovedAt: qaResult.approved ? new Date() : undefined,
    qaNotes: qaResult.commentary,
    relatedIdeaId: ideaId,
  });

  return { 
    briefDocument: finalBrief,
    qaApproved: qaResult.approved,
    qaCommentary: qaResult.commentary,
    metadata,
    signOff,
  };
}

/**
 * Promote idea to Project Genesis
 */
export async function promoteToGenesis(ideaId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [idea] = await db
    .select()
    .from(innovationIdeas)
    .where(eq(innovationIdeas.id, ideaId))
    .limit(1);

  if (!idea) throw new Error("Idea not found");

  await db.update(innovationIdeas)
    .set({ status: "promoted_to_genesis" })
    .where(eq(innovationIdeas.id, ideaId));

  return { 
    success: true, 
    message: "Idea promoted to Project Genesis. Create a new project with this idea as the foundation.",
    ideaTitle: idea.title,
    briefDocument: idea.briefDocument,
  };
}

/**
 * Analyze an article/URL for opportunities
 */
export async function analyzeArticleForOpportunities(userId: number, url: string, context?: string) {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a strategic opportunity analyst. Analyze the given article/content and identify potential business opportunities.
        
        For each opportunity found, provide:
        1. Title (concise name)
        2. Description (2-3 sentences)
        3. Category (business, product, investment, trend, etc.)
        4. Potential score (0-100)
        5. Key tags
        
        Return as JSON array of opportunities.`
      },
      {
        role: "user",
        content: `URL: ${url}\n\nAdditional Context: ${context || "None provided"}\n\nAnalyze this for business opportunities.`
      }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "opportunities",
        strict: true,
        schema: {
          type: "object",
          properties: {
            opportunities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  category: { type: "string" },
                  potentialScore: { type: "number" },
                  tags: { type: "array", items: { type: "string" } }
                },
                required: ["title", "description", "category", "potentialScore", "tags"],
                additionalProperties: false
              }
            }
          },
          required: ["opportunities"],
          additionalProperties: false
        }
      }
    }
  });

  const content = typeof response.choices[0].message.content === 'string' ? response.choices[0].message.content : '{}';
  const parsed = JSON.parse(content);
  const opportunities = parsed.opportunities || [];

  // Capture each opportunity as an idea
  const capturedIds = [];
  for (const opp of opportunities) {
    const result = await captureIdea(userId, {
      title: opp.title,
      description: opp.description,
      source: "article",
      sourceUrl: url,
      category: opp.category,
      tags: opp.tags,
    });
    capturedIds.push(result.id);
  }

  return { opportunities, capturedIds };
}
