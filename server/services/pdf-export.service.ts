/**
 * PDF Export Service for CEPHO Branded Documents
 * 
 * Generates professional PDFs with CEPHO branding following CEPHO-BP-016 guidelines:
 * - Logo placement top-left
 * - Black, white, and grey colour palette
 * - Inter/Calibri typography
 * - Professional document structure
 * - Chief of Staff QA sign-off footer
 */

// import { BRAND_GUIDELINES, getScoreRating } from "./documentTemplateService";

// PDF generation using HTML to PDF conversion
// We'll use the built-in manus-md-to-pdf utility for actual PDF generation

export interface PDFExportOptions {
  title: string;
  subtitle?: string;
  documentId: string;
  classification: "public" | "internal" | "confidential" | "restricted";
  author?: string;
  date?: Date;
  qaApproved?: boolean;
  qaApprover?: string;
  qaDate?: Date;
}

export interface PDFSection {
  title: string;
  content: string;
  type: "text" | "table" | "scoring" | "appendix";
}

/**
 * Generate the CEPHO branded header for PDF documents
 */
export function generatePDFHeader(options: PDFExportOptions): string {
  const date = options.date || new Date();
  const formattedDate = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `
<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #333;">
  <div style="display: flex; align-items: center; gap: 16px;">
    <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #00D4FF, #FF00FF); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
      <span style="color: white; font-weight: bold; font-size: 18px;">C</span>
    </div>
    <div>
      <div style="font-family: Inter, sans-serif; font-size: 24px; font-weight: 700; color: #000;">CEPHO.AI</div>
      <div style="font-family: Inter, sans-serif; font-size: 12px; color: #666;">Cognitive Executive Processing Hub Operations</div>
    </div>
  </div>
  <div style="text-align: right;">
    <div style="font-family: Inter, sans-serif; font-size: 10px; color: #666;">Document ID</div>
    <div style="font-family: Inter, sans-serif; font-size: 12px; font-weight: 600; color: #000;">${options.documentId}</div>
    <div style="font-family: Inter, sans-serif; font-size: 10px; color: #666; margin-top: 4px;">${formattedDate}</div>
    <div style="font-family: Inter, sans-serif; font-size: 10px; padding: 2px 8px; background: ${getClassificationColor(options.classification)}; color: white; border-radius: 4px; display: inline-block; margin-top: 4px;">${options.classification.toUpperCase()}</div>
  </div>
</div>
`;
}

/**
 * Get classification badge colour
 */
function getClassificationColor(classification: string): string {
  switch (classification) {
    case "public": return "#22c55e";
    case "internal": return "#3b82f6";
    case "confidential": return "#f59e0b";
    case "restricted": return "#ef4444";
    default: return "#6b7280";
  }
}

/**
 * Generate the document title section
 */
export function generateTitleSection(options: PDFExportOptions): string {
  return `
<div style="margin-bottom: 40px;">
  <h1 style="font-family: Inter, sans-serif; font-size: 32px; font-weight: 700; color: #000; margin: 0 0 8px 0;">${options.title}</h1>
  ${options.subtitle ? `<p style="font-family: Inter, sans-serif; font-size: 16px; color: #666; margin: 0;">${options.subtitle}</p>` : ""}
</div>
`;
}

/**
 * Generate a scoring matrix table
 */
export function generateScoringTable(
  assessments: Array<{ category: string; score: number; rating?: string }>
): string {
  const rows = assessments.map(a => {
    const rating = a.rating || getScoreRating(a.score).rating;
    const color = getScoreColor(a.score);
    return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-family: Inter, sans-serif;">${a.category}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; font-family: Inter, sans-serif; font-weight: 600; color: ${color};">${a.score}/100</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-family: Inter, sans-serif;">${rating}</td>
      </tr>
    `;
  }).join("");

  return `
<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
  <thead>
    <tr style="background: #f3f4f6;">
      <th style="padding: 12px; text-align: left; font-family: Inter, sans-serif; font-weight: 600; border-bottom: 2px solid #333;">Assessment Category</th>
      <th style="padding: 12px; text-align: center; font-family: Inter, sans-serif; font-weight: 600; border-bottom: 2px solid #333;">Score</th>
      <th style="padding: 12px; text-align: left; font-family: Inter, sans-serif; font-weight: 600; border-bottom: 2px solid #333;">Rating</th>
    </tr>
  </thead>
  <tbody>
    ${rows}
  </tbody>
</table>
`;
}

/**
 * Get colour based on score
 */
function getScoreColor(score: number): string {
  if (score >= 86) return "#22c55e"; // Green
  if (score >= 71) return "#84cc16"; // Lime
  if (score >= 51) return "#f59e0b"; // Amber
  if (score >= 31) return "#f97316"; // Orange
  return "#ef4444"; // Red
}

/**
 * Generate Chief of Staff QA sign-off footer
 */
export function generateQAFooter(options: PDFExportOptions): string {
  if (!options.qaApproved) {
    return `
<div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
  <div style="font-family: Inter, sans-serif; font-size: 10px; color: #f59e0b;">
    ⚠ This document is pending Chief of Staff QA approval
  </div>
</div>
`;
  }

  const qaDate = options.qaDate || new Date();
  const formattedQaDate = qaDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `
<div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #333;">
  <div style="display: flex; justify-content: space-between; align-items: center;">
    <div>
      <div style="font-family: Inter, sans-serif; font-size: 12px; font-weight: 600; color: #000;">Chief of Staff QA Approval</div>
      <div style="font-family: Inter, sans-serif; font-size: 10px; color: #666;">Quality assured and approved for distribution</div>
    </div>
    <div style="text-align: right;">
      <div style="font-family: Inter, sans-serif; font-size: 10px; color: #666;">Approved by: ${options.qaApprover || "Chief of Staff"}</div>
      <div style="font-family: Inter, sans-serif; font-size: 10px; color: #666;">Date: ${formattedQaDate}</div>
      <div style="font-family: Inter, sans-serif; font-size: 10px; padding: 2px 8px; background: #22c55e; color: white; border-radius: 4px; display: inline-block; margin-top: 4px;">✓ QA APPROVED</div>
    </div>
  </div>
</div>
`;
}

/**
 * Generate full PDF HTML document
 */
export function generatePDFDocument(
  options: PDFExportOptions,
  sections: PDFSection[]
): string {
  const header = generatePDFHeader(options);
  const title = generateTitleSection(options);
  const footer = generateQAFooter(options);

  const sectionContent = sections.map(section => {
    if (section.type === "scoring") {
      return `
        <div style="margin-bottom: 30px;">
          <h2 style="font-family: Inter, sans-serif; font-size: 18px; font-weight: 600; color: #000; margin-bottom: 16px;">${section.title}</h2>
          ${section.content}
        </div>
      `;
    }
    
    if (section.type === "appendix") {
      return `
        <div style="page-break-before: always; margin-top: 40px;">
          <h2 style="font-family: Inter, sans-serif; font-size: 20px; font-weight: 700; color: #000; border-bottom: 2px solid #333; padding-bottom: 8px; margin-bottom: 20px;">Appendix: ${section.title}</h2>
          <div style="font-family: Inter, sans-serif; font-size: 11px; line-height: 1.6; color: #333;">
            ${section.content}
          </div>
        </div>
      `;
    }

    return `
      <div style="margin-bottom: 24px;">
        <h2 style="font-family: Inter, sans-serif; font-size: 16px; font-weight: 600; color: #000; margin-bottom: 12px;">${section.title}</h2>
        <div style="font-family: Inter, sans-serif; font-size: 12px; line-height: 1.7; color: #333;">
          ${section.content}
        </div>
      </div>
    `;
  }).join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${options.title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * {
      box-sizing: border-box;
    }
    
    body {
      font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
      margin: 0;
      padding: 40px;
      background: white;
      color: #000;
      line-height: 1.6;
    }
    
    @page {
      margin: 20mm;
      size: A4;
    }
    
    @media print {
      body {
        padding: 0;
      }
    }
  </style>
</head>
<body>
  ${header}
  ${title}
  ${sectionContent}
  ${footer}
</body>
</html>
`;
}

/**
 * Convert markdown content to PDF-ready HTML
 */
export function markdownToHTML(markdown: string): string {
  // Basic markdown to HTML conversion
  let html = markdown
    // Headers
    .replace(/^### (.*$)/gm, '<h3 style="font-family: Inter, sans-serif; font-size: 14px; font-weight: 600; color: #000; margin: 16px 0 8px 0;">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 style="font-family: Inter, sans-serif; font-size: 16px; font-weight: 600; color: #000; margin: 20px 0 12px 0;">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 style="font-family: Inter, sans-serif; font-size: 20px; font-weight: 700; color: #000; margin: 24px 0 16px 0;">$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Lists
    .replace(/^\- (.*$)/gm, '<li style="margin: 4px 0;">$1</li>')
    .replace(/^\* (.*$)/gm, '<li style="margin: 4px 0;">$1</li>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p style="margin: 12px 0;">')
    // Line breaks
    .replace(/\n/g, '<br>');

  // Wrap in paragraph tags
  html = `<p style="margin: 12px 0;">${html}</p>`;
  
  // Wrap list items in ul
  html = html.replace(/(<li.*?<\/li>)+/g, '<ul style="margin: 12px 0; padding-left: 24px;">$&</ul>');

  return html;
}

/**
 * Generate Innovation Brief PDF
 */
export async function generateInnovationBriefPDF(
  idea: {
    title: string;
    description: string;
    category?: string;
    confidenceScore?: number;
  },
  assessments: Array<{
    type: string;
    score: number;
    findings: string;
  }>,
  scenarios: Array<{
    name: string;
    amount: number;
    projectedReturn: string;
    riskLevel: string;
    timeline: string;
    isRecommended?: boolean;
  }>,
  recommendation: {
    decision: "proceed" | "refine" | "pivot" | "reject";
    rationale: string;
    nextSteps: string[];
  },
  options: {
    documentId: string;
    classification: "public" | "internal" | "confidential" | "restricted";
    qaApproved?: boolean;
    qaApprover?: string;
  }
): Promise<{ html: string; markdown: string }> {
  // Generate scoring table
  const scoringData = assessments.map(a => ({
    category: a.type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
    score: a.score,
  }));
  const scoringTable = generateScoringTable(scoringData);

  // Generate investment scenarios table
  const scenarioRows = scenarios.map(s => `
    <tr${s.isRecommended ? ' style="background: #f0fdf4;"' : ''}>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-family: Inter, sans-serif;">${s.name}${s.isRecommended ? ' <span style="color: #22c55e; font-weight: 600;">★ RECOMMENDED</span>' : ''}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-family: Inter, sans-serif; text-align: right;">£${s.amount.toLocaleString()}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-family: Inter, sans-serif;">${s.projectedReturn}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-family: Inter, sans-serif;">${s.riskLevel}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-family: Inter, sans-serif;">${s.timeline}</td>
    </tr>
  `).join("");

  const scenarioTable = `
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <thead>
        <tr style="background: #f3f4f6;">
          <th style="padding: 12px; text-align: left; font-family: Inter, sans-serif; font-weight: 600; border-bottom: 2px solid #333;">Scenario</th>
          <th style="padding: 12px; text-align: right; font-family: Inter, sans-serif; font-weight: 600; border-bottom: 2px solid #333;">Investment</th>
          <th style="padding: 12px; text-align: left; font-family: Inter, sans-serif; font-weight: 600; border-bottom: 2px solid #333;">Projected Return</th>
          <th style="padding: 12px; text-align: left; font-family: Inter, sans-serif; font-weight: 600; border-bottom: 2px solid #333;">Risk Level</th>
          <th style="padding: 12px; text-align: left; font-family: Inter, sans-serif; font-weight: 600; border-bottom: 2px solid #333;">Timeline</th>
        </tr>
      </thead>
      <tbody>
        ${scenarioRows}
      </tbody>
    </table>
  `;

  // Decision badge
  const decisionColors: Record<string, string> = {
    proceed: "#22c55e",
    refine: "#f59e0b",
    pivot: "#f97316",
    reject: "#ef4444",
  };
  const decisionLabels: Record<string, string> = {
    proceed: "PROCEED TO PROJECT GENESIS",
    refine: "REFINE AND REASSESS",
    pivot: "PIVOT APPROACH",
    reject: "DO NOT PROCEED",
  };

  const sections: PDFSection[] = [
    {
      title: "Executive Summary",
      content: `
        <p style="margin: 12px 0;">${idea.description}</p>
        <p style="margin: 12px 0;"><strong>Category:</strong> ${idea.category || "General"}</p>
        <p style="margin: 12px 0;"><strong>Overall Confidence Score:</strong> ${idea.confidenceScore?.toFixed(0) || "N/A"}/100</p>
      `,
      type: "text",
    },
    {
      title: "Assessment Scores",
      content: scoringTable,
      type: "scoring",
    },
    {
      title: "Investment Scenarios",
      content: scenarioTable,
      type: "table",
    },
    {
      title: "Recommendation",
      content: `
        <div style="padding: 20px; background: #f9fafb; border-radius: 8px; margin: 16px 0;">
          <div style="display: inline-block; padding: 8px 16px; background: ${decisionColors[recommendation.decision]}; color: white; font-weight: 600; border-radius: 4px; margin-bottom: 16px;">
            ${decisionLabels[recommendation.decision]}
          </div>
          <p style="margin: 12px 0;">${recommendation.rationale}</p>
          <div style="margin-top: 16px;">
            <strong>Next Steps:</strong>
            <ul style="margin: 8px 0; padding-left: 24px;">
              ${recommendation.nextSteps.map(step => `<li style="margin: 4px 0;">${step}</li>`).join("")}
            </ul>
          </div>
        </div>
      `,
      type: "text",
    },
    {
      title: "Detailed Assessment Findings",
      content: assessments.map(a => `
        <div style="margin-bottom: 16px;">
          <h4 style="font-family: Inter, sans-serif; font-size: 13px; font-weight: 600; color: #000; margin: 0 0 8px 0;">
            ${a.type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())} (Score: ${a.score}/100)
          </h4>
          <p style="margin: 0; font-size: 11px; color: #333;">${a.findings}</p>
        </div>
      `).join(""),
      type: "appendix",
    },
  ];

  const html = generatePDFDocument(
    {
      title: `Innovation Brief: ${idea.title}`,
      subtitle: "Pre-Project Genesis Assessment",
      documentId: options.documentId,
      classification: options.classification,
      qaApproved: options.qaApproved,
      qaApprover: options.qaApprover,
    },
    sections
  );

  // Also generate markdown version
  const markdown = `# Innovation Brief: ${idea.title}

**Document ID:** ${options.documentId}  
**Classification:** ${options.classification.toUpperCase()}  
**Date:** ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}

---

## Executive Summary

${idea.description}

**Category:** ${idea.category || "General"}  
**Overall Confidence Score:** ${idea.confidenceScore?.toFixed(0) || "N/A"}/100

---

## Assessment Scores

| Category | Score | Rating |
|----------|-------|--------|
${assessments.map(a => `| ${a.type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())} | ${a.score}/100 | ${getScoreRating(a.score).rating} |`).join("\n")}

---

## Investment Scenarios

| Scenario | Investment | Projected Return | Risk Level | Timeline |
|----------|------------|------------------|------------|----------|
${scenarios.map(s => `| ${s.name}${s.isRecommended ? " ★" : ""} | £${s.amount.toLocaleString()} | ${s.projectedReturn} | ${s.riskLevel} | ${s.timeline} |`).join("\n")}

---

## Recommendation

**Decision:** ${decisionLabels[recommendation.decision]}

${recommendation.rationale}

**Next Steps:**
${recommendation.nextSteps.map(step => `- ${step}`).join("\n")}

---

## Appendix: Detailed Assessment Findings

${assessments.map(a => `### ${a.type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())} (Score: ${a.score}/100)

${a.findings}
`).join("\n")}

---

${options.qaApproved ? `**Chief of Staff QA Approval:** ✓ Approved by ${options.qaApprover || "Chief of Staff"}` : "⚠ Pending Chief of Staff QA approval"}
`;

  return { html, markdown };
}
