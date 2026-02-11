import { invokeLLM } from "../_core/llm";
import { getDb } from "../db";
import { fundingPrograms, fundingAssessments, innovationIdeas } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

// UAE Funding Programs
const UAE_FUNDING_PROGRAMS = [
  {
    programId: "mbrif-accelerator",
    name: "MBRIF Innovation Accelerator",
    country: "UAE" as const,
    region: "Dubai",
    type: "accelerator" as const,
    provider: "Mohammed Bin Rashid Innovation Fund",
    description: "Government-backed accelerator providing funding, mentorship, and market access for innovative startups in the UAE.",
    fundingMin: 367000, // 100,000 AED
    fundingMax: 3670000, // 1,000,000 AED
    equityRequired: 0,
    interestRate: 0,
    eligibilityCriteria: [
      "UAE-based or willing to establish UAE presence",
      "Innovative technology or business model",
      "Scalable business with growth potential",
      "Committed founding team",
      "Product/service addresses real market need",
      "Minimum viable product (MVP) or prototype"
    ],
    requiredDocuments: [
      "Business plan",
      "Financial projections (3-5 years)",
      "Pitch deck",
      "Team CVs",
      "Trade license (or commitment to obtain)",
      "Product demo or prototype documentation"
    ],
    applicationProcess: [
      "Online application submission",
      "Initial screening (2-3 weeks)",
      "Pitch presentation to selection committee",
      "Due diligence review",
      "Final selection and onboarding"
    ],
    sectors: ["Technology", "Healthcare", "Education", "Sustainability", "FinTech", "AI/ML"],
    stages: ["pre-seed", "seed", "early-stage"],
    websiteUrl: "https://mbrif.ae",
    applicationUrl: "https://mbrif.ae/program-selection-2/",
    successRate: 15,
    averageProcessingDays: 60
  },
  {
    programId: "khalifa-fund",
    name: "Khalifa Fund for Enterprise Development",
    country: "UAE" as const,
    region: "Abu Dhabi",
    type: "loan" as const,
    provider: "Khalifa Fund",
    description: "Provides financing and support services to UAE nationals and residents to establish and develop SMEs.",
    fundingMin: 183500, // 50,000 AED
    fundingMax: 11010000, // 3,000,000 AED
    equityRequired: 0,
    interestRate: 0, // Interest-free for UAE nationals
    repaymentTerms: "Up to 7 years repayment period with grace period",
    eligibilityCriteria: [
      "UAE national or resident",
      "Age 21-60 years",
      "Valid business idea or existing SME",
      "No existing loans from other government programs",
      "Commitment to manage the business",
      "Good conduct certificate"
    ],
    requiredDocuments: [
      "Emirates ID",
      "Passport copy",
      "Business plan",
      "Financial statements (if existing business)",
      "Trade license (if applicable)",
      "Bank statements (6 months)"
    ],
    applicationProcess: [
      "Register on Khalifa Fund portal",
      "Submit business plan",
      "Initial assessment",
      "Business plan evaluation",
      "Site visit (if applicable)",
      "Approval and disbursement"
    ],
    sectors: ["All sectors", "Manufacturing", "Services", "Trading", "Agriculture"],
    stages: ["idea", "pre-seed", "seed", "growth"],
    websiteUrl: "https://khalifafund.ae",
    applicationUrl: "https://khalifafund.ae/en/apply",
    successRate: 25,
    averageProcessingDays: 45
  },
  {
    programId: "dubai-sme",
    name: "Dubai SME - Mohammed Bin Rashid Fund",
    country: "UAE" as const,
    region: "Dubai",
    type: "loan" as const,
    provider: "Dubai SME",
    description: "Provides soft loans and business support to UAE nationals for establishing or expanding SMEs in Dubai.",
    fundingMin: 183500, // 50,000 AED
    fundingMax: 7340000, // 2,000,000 AED
    equityRequired: 0,
    interestRate: 0,
    repaymentTerms: "Up to 6 years with 1 year grace period",
    eligibilityCriteria: [
      "UAE national",
      "Age 21+",
      "Valid business idea",
      "Business to be established in Dubai",
      "No previous defaults on government loans",
      "Attend mandatory training programs"
    ],
    requiredDocuments: [
      "Emirates ID",
      "Family book",
      "Business plan",
      "Financial projections",
      "Training completion certificate",
      "Good conduct certificate"
    ],
    applicationProcess: [
      "Attend Dubai SME orientation",
      "Complete business planning workshop",
      "Submit application online",
      "Business plan review",
      "Committee approval",
      "Contract signing and disbursement"
    ],
    sectors: ["Technology", "Tourism", "Healthcare", "Education", "Creative Industries"],
    stages: ["idea", "pre-seed", "seed"],
    websiteUrl: "https://sme.ae",
    applicationUrl: "https://sme.ae/en/financing",
    successRate: 30,
    averageProcessingDays: 30
  },
  {
    programId: "hub71",
    name: "Hub71 Incentive Program",
    country: "UAE" as const,
    region: "Abu Dhabi",
    type: "grant" as const,
    provider: "Hub71 / Mubadala",
    description: "Tech startup ecosystem offering subsidized housing, office space, and direct funding for qualifying startups.",
    fundingMin: 367000, // 100,000 AED
    fundingMax: 1835000, // 500,000 AED (in credits/subsidies)
    equityRequired: 0,
    interestRate: 0,
    eligibilityCriteria: [
      "Technology-focused startup",
      "Scalable business model",
      "Strong founding team",
      "Willing to relocate to Abu Dhabi",
      "Less than 5 years old",
      "Raised less than $5M in funding"
    ],
    requiredDocuments: [
      "Pitch deck",
      "Business plan",
      "Financial model",
      "Team profiles",
      "Product demo",
      "Cap table"
    ],
    applicationProcess: [
      "Online application",
      "Initial screening",
      "Interview with Hub71 team",
      "Selection committee review",
      "Offer and onboarding"
    ],
    sectors: ["FinTech", "HealthTech", "AI/ML", "Enterprise Software", "CleanTech"],
    stages: ["seed", "early-stage", "growth"],
    websiteUrl: "https://hub71.com",
    applicationUrl: "https://hub71.com/join-us",
    successRate: 20,
    averageProcessingDays: 45
  }
];

// UK Funding Programs
const UK_FUNDING_PROGRAMS = [
  {
    programId: "uk-rd-tax-credit-sme",
    name: "UK R&D Tax Credits (SME Scheme)",
    country: "UK" as const,
    region: "United Kingdom",
    type: "tax_credit" as const,
    provider: "HMRC",
    description: "Tax relief scheme allowing SMEs to claim back up to 33% of qualifying R&D expenditure.",
    fundingMin: 0,
    fundingMax: 0, // Depends on R&D spend
    equityRequired: 0,
    interestRate: 0,
    eligibilityCriteria: [
      "UK limited company",
      "Fewer than 500 employees",
      "Annual turnover under €100m or balance sheet under €86m",
      "Undertaking qualifying R&D activities",
      "Seeking advance in science or technology",
      "Overcoming scientific/technological uncertainty"
    ],
    requiredDocuments: [
      "Company accounts",
      "R&D project descriptions",
      "Technical narratives",
      "Cost breakdowns",
      "Staff time records",
      "Subcontractor agreements"
    ],
    applicationProcess: [
      "Identify qualifying R&D projects",
      "Calculate qualifying expenditure",
      "Prepare technical report",
      "Submit claim with Corporation Tax return",
      "HMRC review and approval"
    ],
    sectors: ["All sectors with R&D activities"],
    stages: ["all stages"],
    websiteUrl: "https://www.gov.uk/guidance/corporation-tax-research-and-development-tax-relief-for-small-and-medium-sized-enterprises",
    applicationUrl: "https://www.gov.uk/guidance/corporation-tax-research-and-development-tax-relief-for-small-and-medium-sized-enterprises",
    successRate: 85,
    averageProcessingDays: 28
  },
  {
    programId: "innovate-uk-smart",
    name: "Innovate UK Smart Grants",
    country: "UK" as const,
    region: "United Kingdom",
    type: "grant" as const,
    provider: "Innovate UK",
    description: "Funding for game-changing and disruptive ideas that could lead to new products, processes, or services.",
    fundingMin: 92000, // £25,000 (~92,000 AED)
    fundingMax: 1840000, // £500,000 (~1.84M AED)
    equityRequired: 0,
    interestRate: 0,
    eligibilityCriteria: [
      "UK-based business",
      "Innovative project with commercial potential",
      "Project addresses a significant market need",
      "Strong team capability",
      "Clear route to market",
      "Additionality (wouldn't happen without funding)"
    ],
    requiredDocuments: [
      "Business plan",
      "Project proposal",
      "Financial forecasts",
      "Market analysis",
      "Team CVs",
      "Letters of support"
    ],
    applicationProcess: [
      "Check eligibility on Innovation Funding Service",
      "Submit application online",
      "Independent assessor review",
      "Panel assessment",
      "Due diligence",
      "Grant offer and project start"
    ],
    sectors: ["All sectors", "Technology", "Manufacturing", "Healthcare", "Clean Growth"],
    stages: ["seed", "early-stage", "growth"],
    websiteUrl: "https://www.ukri.org/councils/innovate-uk/",
    applicationUrl: "https://apply-for-innovation-funding.service.gov.uk/",
    successRate: 12,
    averageProcessingDays: 90
  },
  {
    programId: "uk-startup-loans",
    name: "Start Up Loans",
    country: "UK" as const,
    region: "United Kingdom",
    type: "loan" as const,
    provider: "British Business Bank",
    description: "Government-backed personal loans for individuals starting or growing a business in the UK.",
    fundingMin: 1840, // £500 (~1,840 AED)
    fundingMax: 92000, // £25,000 (~92,000 AED)
    equityRequired: 0,
    interestRate: 6, // 6% fixed
    repaymentTerms: "1-5 years repayment period",
    eligibilityCriteria: [
      "UK resident aged 18+",
      "Starting or growing a UK business",
      "Business trading for less than 36 months",
      "Viable business plan",
      "No previous Start Up Loan",
      "Pass credit and affordability checks"
    ],
    requiredDocuments: [
      "Business plan",
      "Cash flow forecast (12 months)",
      "Personal survival budget",
      "ID verification",
      "Proof of address",
      "Bank statements"
    ],
    applicationProcess: [
      "Online application",
      "Business plan review",
      "Interview with advisor",
      "Credit check",
      "Loan offer",
      "Disbursement and mentoring"
    ],
    sectors: ["All sectors"],
    stages: ["idea", "pre-seed", "seed"],
    websiteUrl: "https://www.startuploans.co.uk",
    applicationUrl: "https://www.startuploans.co.uk/apply",
    successRate: 40,
    averageProcessingDays: 21
  },
  {
    programId: "uk-seis",
    name: "Seed Enterprise Investment Scheme (SEIS)",
    country: "UK" as const,
    region: "United Kingdom",
    type: "equity" as const,
    provider: "HMRC",
    description: "Tax relief scheme for investors in early-stage companies, making it easier to raise equity funding.",
    fundingMin: 0,
    fundingMax: 920000, // £250,000 (~920,000 AED) per year
    equityRequired: 100, // Equity investment
    interestRate: 0,
    eligibilityCriteria: [
      "UK company",
      "Fewer than 25 employees",
      "Gross assets under £350,000",
      "Trading for less than 3 years",
      "Qualifying trade",
      "Not controlled by another company"
    ],
    requiredDocuments: [
      "Company registration documents",
      "Business plan",
      "Financial statements",
      "Cap table",
      "Advance assurance application",
      "Compliance statement"
    ],
    applicationProcess: [
      "Apply for advance assurance (optional)",
      "Raise investment from qualifying investors",
      "Issue shares",
      "Submit compliance statement to HMRC",
      "Receive SEIS certificates",
      "Investors claim tax relief"
    ],
    sectors: ["Most trading activities (excluding property, financial services)"],
    stages: ["pre-seed", "seed"],
    websiteUrl: "https://www.gov.uk/guidance/venture-capital-schemes-apply-to-use-the-seed-enterprise-investment-scheme",
    applicationUrl: "https://www.gov.uk/guidance/venture-capital-schemes-apply-to-use-the-seed-enterprise-investment-scheme",
    successRate: 75,
    averageProcessingDays: 30
  },
  {
    programId: "uk-eis",
    name: "Enterprise Investment Scheme (EIS)",
    country: "UK" as const,
    region: "United Kingdom",
    type: "equity" as const,
    provider: "HMRC",
    description: "Tax relief scheme for investors in higher-risk small companies, enabling larger equity raises.",
    fundingMin: 0,
    fundingMax: 4600000, // £1.25M (~4.6M AED) per year
    equityRequired: 100,
    interestRate: 0,
    eligibilityCriteria: [
      "UK company",
      "Fewer than 250 employees",
      "Gross assets under £15m before investment",
      "Less than 7 years since first commercial sale",
      "Qualifying trade",
      "Not listed on stock exchange"
    ],
    requiredDocuments: [
      "Company registration documents",
      "Business plan",
      "Financial statements",
      "Cap table",
      "Advance assurance application",
      "Compliance statement"
    ],
    applicationProcess: [
      "Apply for advance assurance (recommended)",
      "Raise investment from qualifying investors",
      "Issue shares",
      "Submit compliance statement to HMRC",
      "Receive EIS certificates",
      "Investors claim tax relief"
    ],
    sectors: ["Most trading activities (excluding property, financial services)"],
    stages: ["seed", "early-stage", "growth"],
    websiteUrl: "https://www.gov.uk/guidance/venture-capital-schemes-apply-for-the-enterprise-investment-scheme",
    applicationUrl: "https://www.gov.uk/guidance/venture-capital-schemes-apply-for-the-enterprise-investment-scheme",
    successRate: 70,
    averageProcessingDays: 30
  }
];

export const ALL_FUNDING_PROGRAMS = [...UAE_FUNDING_PROGRAMS, ...UK_FUNDING_PROGRAMS];

/**
 * Seed funding programs to database
 */
export async function seedFundingPrograms() {
  const db = await getDb();
  if (!db) {
    console.warn("[FundingAssessment] Database not available for seeding");
    return;
  }
  
  for (const program of ALL_FUNDING_PROGRAMS) {
    try {
      // For now, just log - actual seeding would need proper schema
      console.log(`[FundingAssessment] Would seed program: ${program.name}`);
    } catch (error) {
      console.warn(`[FundingAssessment] Error seeding ${program.name}:`, error);
    }
  }
}

/**
 * Assess an idea's eligibility for a specific funding program
 */
export async function assessIdeaForProgram(
  userId: number,
  ideaId: number,
  programId: string
): Promise<{
  assessmentId: string;
  eligibilityScore: number;
  eligibilityStatus: string;
  criteriaResults: any[];
  strengths: string[];
  gaps: string[];
  recommendations: string[];
  estimatedFunding: number;
  applicationReadiness: number;
}> {
  // Get the idea details from innovation service
  const { getIdeaWithAssessments } = await import('./innovationEngineService');
  const ideaData = await getIdeaWithAssessments(ideaId);
  const idea = ideaData?.idea;
  
  if (!idea) {
    throw new Error("Idea not found");
  }
  
  // Get the funding program
  const program = ALL_FUNDING_PROGRAMS.find(p => p.programId === programId);
  if (!program) {
    throw new Error("Funding program not found");
  }
  
  // Use LLM to assess eligibility
  const assessmentPrompt = `You are a government funding assessment expert. Analyze this business idea against the funding program criteria.

## Business Idea
Title: ${idea.title}
Description: ${idea.description || "Not specified"}
Category: ${idea.category || "General"}
Stage: ${idea.currentStage || 1}
Estimated Investment: ${JSON.stringify(idea.estimatedInvestment) || "Not specified"} AED

## Funding Program
Name: ${program.name}
Type: ${program.type}
Provider: ${program.provider}
Country: ${program.country}
Funding Range: ${program.fundingMin} - ${program.fundingMax} AED
Description: ${program.description}

## Eligibility Criteria
${program.eligibilityCriteria.map((c, i) => `${i + 1}. ${c}`).join("\n")}

## Required Documents
${program.requiredDocuments.map((d, i) => `${i + 1}. ${d}`).join("\n")}

## Eligible Sectors
${(program.sectors as string[]).join(", ")}

## Eligible Stages
${(program.stages as string[]).join(", ")}

Provide a detailed assessment in the following JSON format:
{
  "eligibilityScore": <0-100 score>,
  "eligibilityStatus": "<highly_eligible|eligible|partially_eligible|not_eligible>",
  "criteriaResults": [
    {
      "criterion": "<criterion text>",
      "met": <true|false>,
      "score": <0-100>,
      "notes": "<explanation>"
    }
  ],
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "gaps": ["<gap 1>", "<gap 2>", ...],
  "recommendations": ["<recommendation 1>", "<recommendation 2>", ...],
  "estimatedFunding": <estimated funding amount in AED based on idea scope>,
  "applicationReadiness": <0-100 how ready to apply>
}

Be thorough and specific in your assessment.`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: "You are a government funding assessment expert. Always respond with valid JSON." },
      { role: "user", content: assessmentPrompt }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "funding_assessment",
        strict: true,
        schema: {
          type: "object",
          properties: {
            eligibilityScore: { type: "number" },
            eligibilityStatus: { type: "string" },
            criteriaResults: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  criterion: { type: "string" },
                  met: { type: "boolean" },
                  score: { type: "number" },
                  notes: { type: "string" }
                },
                required: ["criterion", "met", "score", "notes"],
                additionalProperties: false
              }
            },
            strengths: { type: "array", items: { type: "string" } },
            gaps: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            estimatedFunding: { type: "number" },
            applicationReadiness: { type: "number" }
          },
          required: ["eligibilityScore", "eligibilityStatus", "criteriaResults", "strengths", "gaps", "recommendations", "estimatedFunding", "applicationReadiness"],
          additionalProperties: false
        }
      }
    }
  });
  
  const content = response.choices[0].message.content;
  const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
  const assessment = JSON.parse(contentStr || "{}");
  
  // Generate assessment ID
  const assessmentId = `FA-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  
  // Save to database
  const db = await getDb();
  if (db) {
    try {
      await db.insert(fundingAssessments).values({
        assessmentId,
        userId,
        ideaId,
        programId,
        eligibilityScore: assessment.eligibilityScore,
        eligibilityStatus: assessment.eligibilityStatus,
        criteriaResults: assessment.criteriaResults,
        strengths: assessment.strengths,
        gaps: assessment.gaps,
        recommendations: assessment.recommendations,
        estimatedFunding: assessment.estimatedFunding,
        applicationReadiness: assessment.applicationReadiness
      });
      console.log(`[FundingAssessment] Saved assessment ${assessmentId}`);
    } catch (error) {
      console.warn(`[FundingAssessment] Error saving assessment:`, error);
    }
  }
  
  return {
    assessmentId,
    ...assessment
  };
}

/**
 * Get all funding assessments for an idea
 */
export async function getIdeaFundingAssessments(ideaId: number) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const assessments = await db.select().from(fundingAssessments).where(eq(fundingAssessments.ideaId, ideaId));
    return assessments;
  } catch (error) {
    console.warn(`[FundingAssessment] Error fetching assessments:`, error);
    return [];
  }
}

/**
 * Get eligible programs for an idea based on category and stage
 */
export function getEligiblePrograms(category: string, stage: string, country?: string) {
  return ALL_FUNDING_PROGRAMS.filter(program => {
    // Filter by country if specified
    if (country && program.country !== country) {
      return false;
    }
    
    // Check if stage matches
    const stages = program.stages as string[];
    if (!stages.includes("all stages") && !stages.includes(stage)) {
      return false;
    }
    
    // Check if sector matches (simplified matching)
    const sectors = program.sectors as string[];
    if (!sectors.includes("All sectors") && !sectors.some(s => 
      s.toLowerCase().includes(category.toLowerCase()) ||
      category.toLowerCase().includes(s.toLowerCase())
    )) {
      // Still include if it's a general program
      if (!sectors.includes("All sectors with R&D activities")) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Generate application documents for a funding program
 */
export async function generateApplicationDocuments(
  ideaId: number,
  programId: string,
  documentTypes: string[]
): Promise<{ documentType: string; content: string }[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get idea from innovation service instead
  const { getIdeaWithAssessments } = await import('./innovationEngineService');
  const ideaData = await getIdeaWithAssessments(ideaId);
  const idea = ideaData?.idea;
  
  if (!idea) {
    throw new Error("Idea not found");
  }
  
  const program = ALL_FUNDING_PROGRAMS.find(p => p.programId === programId);
  if (!program) {
    throw new Error("Funding program not found");
  }
  
  const documents: { documentType: string; content: string }[] = [];
  
  for (const docType of documentTypes) {
    const prompt = `Generate a ${docType} for the following business idea applying to ${program.name}.

## Business Idea
Title: ${idea.title}
Description: ${idea.description || "Not specified"}
Category: ${idea.category || "General"}
Stage: ${idea.currentStage || 1}

## Funding Program
${program.name} (${program.provider})
${program.description}

Generate a professional ${docType} that would be suitable for this funding application. Use AED for all financial figures.`;

    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are a professional business writer specializing in funding applications." },
        { role: "user", content: prompt }
      ]
    });
    
    const docContent = response.choices[0].message.content;
    documents.push({
      documentType: docType,
      content: typeof docContent === 'string' ? docContent : JSON.stringify(docContent) || ""
    });
  }
  
  return documents;
}
