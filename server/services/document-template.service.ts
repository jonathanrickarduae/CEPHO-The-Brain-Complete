/**
 * CEPHO.AI Document Template Service
 * 
 * Generates branded documents following CEPHO-BP-016 Brand Guidelines.
 * All documents pass through Chief of Staff QA sign-off.
 */

import { invokeLLM } from "../_core/llm";

// Brand Guidelines Reference
export const BRAND_GUIDELINES = {
  documentId: "CEPHO-BP-016",
  version: "1.0",
  
  // Colour palette for documents (black, white, grey only per user preference)
  colours: {
    black: "#000000",
    darkGrey: "#333333",
    mediumGrey: "#666666",
    lightGrey: "#999999",
    white: "#FFFFFF",
    // Accent colours for minimal use
    cephoCyan: "#00D4FF",
    cephoMagenta: "#D946EF",
  },
  
  // Typography standards
  typography: {
    headingFont: "Inter",
    bodyFont: "Inter",
    pageNumberFont: "Calibri",
    sizes: {
      documentTitle: "24pt",
      sectionHeading: "16pt",
      subsection: "13pt",
      bodyText: "11pt",
      tableHeader: "10pt",
      tableBody: "10pt",
      pageNumber: "10pt",
      footer: "9pt",
    },
  },
  
  // Logo placement
  logo: {
    position: "top-left",
    height: "40px",
    clearSpace: "equal to height of C in CEPHO",
  },
  
  // Scoring scale
  scoringScale: [
    { range: [86, 100], rating: "Excellent", colour: "green", meaning: "Highly favourable, proceed with confidence" },
    { range: [71, 85], rating: "Good", colour: "lightGreen", meaning: "Favourable, minor refinements needed" },
    { range: [51, 70], rating: "Average", colour: "amber", meaning: "Acceptable with caveats, needs attention" },
    { range: [31, 50], rating: "Below Average", colour: "orange", meaning: "Significant concerns, major refinement needed" },
    { range: [0, 30], rating: "Poor", colour: "red", meaning: "High risk, recommend against or pivot" },
  ],
};

// Document types
export type DocumentType = 
  | "executive_summary"
  | "innovation_brief"
  | "full_report"
  | "investment_analysis"
  | "strategic_assessment"
  | "project_genesis"
  | "daily_brief"
  | "evening_review";

// Document classification levels
export type ClassificationLevel = "public" | "internal" | "confidential" | "restricted";

// Document status
export type DocumentStatus = "draft" | "pending_review" | "approved" | "final";

// QA Check result
interface QACheckResult {
  passed: boolean;
  checks: {
    brandCompliance: boolean;
    contentQuality: boolean;
    accuracy: boolean;
    completeness: boolean;
    formatting: boolean;
    classification: boolean;
  };
  issues: string[];
  recommendations: string[];
}

// Sign-off block
interface SignOffBlock {
  preparedBy: string;
  reviewedBy: string;
  date: string;
  status: DocumentStatus;
  classification: ClassificationLevel;
  qaResult: QACheckResult;
}

// Document metadata
interface DocumentMetadata {
  id: string;
  title: string;
  type: DocumentType;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  author: string;
  classification: ClassificationLevel;
  status: DocumentStatus;
  signOff?: SignOffBlock;
}

// Scoring matrix entry
interface ScoringMatrixEntry {
  dimension: string;
  score: number;
  weight: number;
  weightedScore: number;
  assessment: string;
}

/**
 * Get score rating based on CEPHO scoring scale
 */
export function getScoreRating(score: number): typeof BRAND_GUIDELINES.scoringScale[0] {
  for (const scale of BRAND_GUIDELINES.scoringScale) {
    if (score >= scale.range[0] && score <= scale.range[1]) {
      return scale;
    }
  }
  return BRAND_GUIDELINES.scoringScale[4]; // Default to Poor
}

/**
 * Generate document ID
 */
export function generateDocumentId(type: DocumentType): string {
  const prefix = {
    executive_summary: "ES",
    innovation_brief: "IB",
    full_report: "FR",
    investment_analysis: "IA",
    strategic_assessment: "SA",
    project_genesis: "PG",
    daily_brief: "DB",
    evening_review: "ER",
  }[type];
  
  const timestamp = Date.now().toString(36).toUpperCase();
  return `CEPHO-${prefix}-${timestamp}`;
}

/**
 * Generate Chief of Staff QA sign-off block
 */
export function generateSignOffBlock(
  status: DocumentStatus,
  classification: ClassificationLevel,
  qaResult: QACheckResult
): SignOffBlock {
  return {
    preparedBy: "CEPHO.AI",
    reviewedBy: "Chief of Staff",
    date: new Date().toLocaleDateString("en-GB", { 
      day: "2-digit", 
      month: "long", 
      year: "numeric" 
    }),
    status,
    classification,
    qaResult,
  };
}

/**
 * Run Chief of Staff QA checks on document
 */
export async function runQAChecks(
  content: string,
  metadata: DocumentMetadata
): Promise<QACheckResult> {
  // Use LLM to assess document quality
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are the CEPHO.AI Chief of Staff performing quality assurance on a document.
        
Check the document against these criteria:
1. Brand Compliance: Logo placement mentioned, colours appropriate, typography consistent
2. Content Quality: Clear, concise, professional language; no jargon or buzzwords
3. Accuracy: Claims are supported, calculations appear correct
4. Completeness: All required sections present for document type
5. Formatting: Consistent with template standards
6. Classification: Appropriate confidentiality marking

Document Type: ${metadata.type}
Classification: ${metadata.classification}

Respond in JSON format with:
- brandCompliance: boolean
- contentQuality: boolean
- accuracy: boolean
- completeness: boolean
- formatting: boolean
- classification: boolean
- issues: array of specific issues found
- recommendations: array of improvement suggestions`
      },
      {
        role: "user",
        content: `Document Title: ${metadata.title}\n\nContent:\n${content.substring(0, 5000)}`
      }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "qa_check",
        strict: true,
        schema: {
          type: "object",
          properties: {
            brandCompliance: { type: "boolean" },
            contentQuality: { type: "boolean" },
            accuracy: { type: "boolean" },
            completeness: { type: "boolean" },
            formatting: { type: "boolean" },
            classification: { type: "boolean" },
            issues: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } }
          },
          required: ["brandCompliance", "contentQuality", "accuracy", "completeness", "formatting", "classification", "issues", "recommendations"],
          additionalProperties: false
        }
      }
    }
  });

  const parsed = JSON.parse(
    typeof response.choices[0].message.content === 'string' 
      ? response.choices[0].message.content 
      : '{}'
  );

  const checks = {
    brandCompliance: parsed.brandCompliance ?? true,
    contentQuality: parsed.contentQuality ?? true,
    accuracy: parsed.accuracy ?? true,
    completeness: parsed.completeness ?? true,
    formatting: parsed.formatting ?? true,
    classification: parsed.classification ?? true,
  };

  return {
    passed: Object.values(checks).every(v => v),
    checks,
    issues: parsed.issues || [],
    recommendations: parsed.recommendations || [],
  };
}

/**
 * Generate Executive Summary (2-page template)
 */
export async function generateExecutiveSummary(
  title: string,
  content: {
    overview: string;
    keyFindings: string[];
    recommendations: string[];
    nextSteps: string[];
  },
  scoringMatrix?: ScoringMatrixEntry[],
  classification: ClassificationLevel = "internal"
): Promise<{ markdown: string; metadata: DocumentMetadata; signOff: SignOffBlock }> {
  const docId = generateDocumentId("executive_summary");
  const date = new Date().toLocaleDateString("en-GB", { 
    day: "2-digit", 
    month: "long", 
    year: "numeric" 
  });

  // Generate scoring matrix table if provided
  let scoringTable = "";
  if (scoringMatrix && scoringMatrix.length > 0) {
    const totalWeightedScore = scoringMatrix.reduce((sum, e) => sum + e.weightedScore, 0);
    const overallScore = totalWeightedScore / scoringMatrix.reduce((sum, e) => sum + e.weight, 0) * 100;
    const rating = getScoreRating(overallScore);
    
    scoringTable = `
## Assessment Summary

| Dimension | Score | Weight | Weighted | Assessment |
|-----------|-------|--------|----------|------------|
${scoringMatrix.map(e => `| ${e.dimension} | ${e.score}/100 | ${e.weight}% | ${e.weightedScore.toFixed(1)} | ${e.assessment} |`).join("\n")}
| **Overall** | **${overallScore.toFixed(0)}/100** | **100%** | **${totalWeightedScore.toFixed(1)}** | **${rating.rating}** |
`;
  }

  const markdown = `![CEPHO.AI Logo](logo)

# ${title}

**Document ID:** ${docId}  
**Date:** ${date}  
**Classification:** ${classification.charAt(0).toUpperCase() + classification.slice(1)}

---

## Executive Summary

${content.overview}

## Key Findings

${content.keyFindings.map((f, i) => `${i + 1}. ${f}`).join("\n\n")}

${scoringTable}

---

## Recommendations

${content.recommendations.map((r, i) => `${i + 1}. ${r}`).join("\n\n")}

## Next Steps

${content.nextSteps.map((s, i) => `${i + 1}. ${s}`).join("\n\n")}

---

## Document Quality Assurance

**Prepared by:** CEPHO.AI  
**Reviewed by:** Chief of Staff  
**Date:** ${date}  
**Status:** Final  
**Classification:** ${classification.charAt(0).toUpperCase() + classification.slice(1)}

*This document has been reviewed for accuracy, completeness, and compliance with CEPHO.AI brand and quality standards.*

---

*CEPHO.AI | Where Intelligence Begins*
`;

  const metadata: DocumentMetadata = {
    id: docId,
    title,
    type: "executive_summary",
    version: "1.0",
    createdAt: new Date(),
    updatedAt: new Date(),
    author: "CEPHO.AI",
    classification,
    status: "final",
  };

  // Run QA checks
  const qaResult = await runQAChecks(markdown, metadata);
  const signOff = generateSignOffBlock("final", classification, qaResult);

  return { markdown, metadata, signOff };
}

/**
 * Generate Innovation Brief (5-page template)
 */
export async function generateInnovationBrief(
  idea: {
    title: string;
    description: string;
    source: string;
  },
  assessments: {
    type: string;
    score: number;
    findings: string;
    expertViewpoints?: {
      expertName: string;
      role: string;
      viewpoint: string;
      score: number;
      recommendation: string;
    }[];
  }[],
  investmentScenarios: {
    name: string;
    amount: number;
    projectedReturn: string;
    riskLevel: string;
    timeline: string;
  }[],
  finalRecommendation: {
    decision: "proceed" | "refine" | "pivot" | "reject";
    rationale: string;
    nextSteps: string[];
  },
  classification: ClassificationLevel = "confidential"
): Promise<{ markdown: string; metadata: DocumentMetadata; signOff: SignOffBlock }> {
  const docId = generateDocumentId("innovation_brief");
  const date = new Date().toLocaleDateString("en-GB", { 
    day: "2-digit", 
    month: "long", 
    year: "numeric" 
  });

  // Calculate overall score
  const overallScore = assessments.reduce((sum, a) => sum + a.score, 0) / assessments.length;
  const rating = getScoreRating(overallScore);

  // Build expert panel section
  let expertPanelSection = "";
  const allExperts = assessments.flatMap(a => a.expertViewpoints || []);
  if (allExperts.length > 0) {
    expertPanelSection = `
## Expert Panel Recommendations

${allExperts.map(e => `
### ${e.expertName} (${e.role})

${e.viewpoint}

**Score:** ${e.score}/100 | **Recommendation:** ${e.recommendation.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
`).join("\n---\n")}
`;
  }

  const markdown = `![CEPHO.AI Logo](logo)

# Innovation Brief: ${idea.title}

**Document ID:** ${docId}  
**Date:** ${date}  
**Classification:** ${classification.charAt(0).toUpperCase() + classification.slice(1)}  
**Source:** ${idea.source}

---

## 1. Executive Summary

${idea.description}

**Overall Assessment Score:** ${overallScore.toFixed(0)}/100 (${rating.rating})

**Recommendation:** ${finalRecommendation.decision.charAt(0).toUpperCase() + finalRecommendation.decision.slice(1)}

---

## 2. Opportunity Overview

${idea.description}

### Source Analysis

This opportunity was identified through ${idea.source}. The initial screening indicated sufficient potential to warrant full strategic assessment.

---

## 3. Strategic Assessment Summary

| Assessment Type | Score | Rating | Key Finding |
|-----------------|-------|--------|-------------|
${assessments.map(a => {
  const r = getScoreRating(a.score);
  return `| ${a.type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())} | ${a.score}/100 | ${r.rating} | ${a.findings.substring(0, 100)}... |`;
}).join("\n")}
| **Overall** | **${overallScore.toFixed(0)}/100** | **${rating.rating}** | **${rating.meaning}** |

${expertPanelSection}

---

## 4. Investment Scenarios

| Scenario | Investment | Projected Return | Risk Level | Timeline |
|----------|------------|------------------|------------|----------|
${investmentScenarios.map(s => `| ${s.name} | £${s.amount.toLocaleString()} | ${s.projectedReturn} | ${s.riskLevel} | ${s.timeline} |`).join("\n")}

---

## 5. Final Recommendation

### Decision: ${finalRecommendation.decision.toUpperCase()}

${finalRecommendation.rationale}

### Next Steps

${finalRecommendation.nextSteps.map((s, i) => `${i + 1}. ${s}`).join("\n\n")}

---

## Document Quality Assurance

**Prepared by:** CEPHO.AI  
**Reviewed by:** Chief of Staff  
**Date:** ${date}  
**Status:** Final  
**Classification:** ${classification.charAt(0).toUpperCase() + classification.slice(1)}

*This document has been reviewed for accuracy, completeness, and compliance with CEPHO.AI brand and quality standards.*

---

## Appendix A: Detailed Scoring Matrix

${assessments.map(a => `
### ${a.type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}

**Score:** ${a.score}/100

${a.findings}
`).join("\n---\n")}

---

*CEPHO.AI | Where Intelligence Begins*
`;

  const metadata: DocumentMetadata = {
    id: docId,
    title: `Innovation Brief: ${idea.title}`,
    type: "innovation_brief",
    version: "1.0",
    createdAt: new Date(),
    updatedAt: new Date(),
    author: "CEPHO.AI",
    classification,
    status: "final",
  };

  // Run QA checks
  const qaResult = await runQAChecks(markdown, metadata);
  const signOff = generateSignOffBlock("final", classification, qaResult);

  return { markdown, metadata, signOff };
}

/**
 * Apply brand compliance formatting to any content
 */
export function applyBrandFormatting(content: string): string {
  // Remove hyphens from compound words (per user preference)
  let formatted = content.replace(/(\w+)-(\w+)/g, (match, p1, p2) => {
    // Keep essential hyphens (e-commerce, self-service, etc.)
    const keepHyphen = ["e-commerce", "self-service", "co-founder", "re-evaluate", "pre-existing"];
    if (keepHyphen.includes(match.toLowerCase())) return match;
    return `${p1} ${p2}`;
  });

  // Remove dramatic vocabulary
  const dramaticWords = ["paradox", "crisis", "revolutionary", "game-changing", "synergy", "disruptive"];
  dramaticWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    formatted = formatted.replace(regex, (match) => {
      // Replace with more measured alternatives
      const alternatives: Record<string, string> = {
        "paradox": "challenge",
        "crisis": "situation",
        "revolutionary": "significant",
        "game-changing": "impactful",
        "synergy": "collaboration",
        "disruptive": "innovative",
      };
      return alternatives[match.toLowerCase()] || match;
    });
  });

  return formatted;
}

/**
 * Validate document against brand guidelines
 */
export function validateBrandCompliance(content: string): {
  compliant: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check for dramatic vocabulary
  const dramaticWords = ["paradox", "crisis", "revolutionary", "game-changing", "synergy"];
  dramaticWords.forEach(word => {
    if (content.toLowerCase().includes(word)) {
      issues.push(`Contains dramatic vocabulary: "${word}"`);
    }
  });

  // Check for excessive hyphens
  const hyphenCount = (content.match(/-/g) || []).length;
  const wordCount = content.split(/\s+/).length;
  if (hyphenCount / wordCount > 0.05) {
    issues.push("Excessive use of hyphens detected");
  }

  return {
    compliant: issues.length === 0,
    issues,
  };
}
