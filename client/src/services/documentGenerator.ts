// Document Generator Service
// Uses AI to generate project documents based on templates and project data

import { trpc } from '@/lib/trpc';

export interface ProjectContext {
  projectName: string;
  oneLineDescription: string;
  industry: string;
  jurisdiction: string;
  founders?: Array<{
    name: string;
    role: string;
    email: string;
    shareholding: number;
  }>;
  counterparty?: string;
  dealValue?: number;
  currency?: string;
  targetMarket?: string;
  revenueModel?: string;
  competitiveAdvantage?: string;
}

export interface GeneratedDocument {
  id: string;
  name: string;
  type: string;
  content: string;
  format: 'markdown' | 'html' | 'text';
  generatedAt: Date;
  qaStatus: {
    twinReviewed: boolean;
    twinApproved: boolean;
    twinNotes?: string;
  };
}

// Document templates with prompts for AI generation
const DOCUMENT_TEMPLATES = {
  nda: {
    name: 'Non-Disclosure Agreement',
    prompt: (ctx: ProjectContext) => `Generate a professional Non-Disclosure Agreement (NDA) for the following context:

Project: ${ctx.projectName}
Description: ${ctx.oneLineDescription}
Industry: ${ctx.industry}
Jurisdiction: ${ctx.jurisdiction}
${ctx.counterparty ? `Counterparty: ${ctx.counterparty}` : ''}

The NDA should:
1. Be mutual (bilateral) protecting both parties
2. Include standard confidentiality provisions
3. Specify a 2-year confidentiality period
4. Include exceptions for publicly known information
5. Be appropriate for ${ctx.jurisdiction} jurisdiction
6. Use professional legal language

Format the output in Markdown with clear sections.`,
  },

  teaser: {
    name: 'One-Page Teaser',
    prompt: (ctx: ProjectContext) => `Generate a compelling one-page investment teaser for:

Company: ${ctx.projectName}
Description: ${ctx.oneLineDescription}
Industry: ${ctx.industry}
${ctx.targetMarket ? `Target Market: ${ctx.targetMarket}` : ''}
${ctx.revenueModel ? `Revenue Model: ${ctx.revenueModel}` : ''}
${ctx.competitiveAdvantage ? `Competitive Advantage: ${ctx.competitiveAdvantage}` : ''}
${ctx.dealValue ? `Investment Sought: ${ctx.currency || 'USD'} ${ctx.dealValue.toLocaleString()}` : ''}

The teaser should include:
1. Executive Summary (2-3 sentences)
2. The Opportunity (problem being solved)
3. The Solution (how the company addresses it)
4. Market Size & Potential
5. Business Model
6. Team Highlights
7. Investment Highlights
8. Contact Information placeholder

Keep it concise, compelling, and professional. Format in Markdown.`,
  },

  financialModel: {
    name: 'Financial Model Structure',
    prompt: (ctx: ProjectContext) => `Create a detailed financial model structure for:

Company: ${ctx.projectName}
Industry: ${ctx.industry}
${ctx.revenueModel ? `Revenue Model: ${ctx.revenueModel}` : ''}

Generate a comprehensive financial model outline including:

1. **Revenue Model**
   - Revenue streams and pricing
   - Growth assumptions
   - Customer acquisition metrics

2. **Cost Structure**
   - Fixed costs
   - Variable costs
   - Unit economics

3. **P&L Projections (5 years)**
   - Revenue
   - COGS
   - Gross Margin
   - Operating Expenses
   - EBITDA
   - Net Income

4. **Cash Flow**
   - Operating cash flow
   - Investment requirements
   - Financing activities

5. **Key Metrics**
   - CAC, LTV, Payback Period
   - Burn rate
   - Runway

6. **Assumptions**
   - Market growth rate
   - Market share targets
   - Pricing evolution

Format as a detailed Markdown document with tables where appropriate.`,
  },

  ddChecklist: {
    name: 'Due Diligence Checklist',
    prompt: (ctx: ProjectContext) => `Generate a comprehensive due diligence checklist for:

Company: ${ctx.projectName}
Industry: ${ctx.industry}
Jurisdiction: ${ctx.jurisdiction}
Deal Type: Investment/Acquisition

Create a detailed checklist covering:

1. **Corporate & Legal**
   - Corporate documents
   - Shareholder agreements
   - Board minutes
   - Regulatory filings

2. **Financial**
   - Audited financials
   - Tax returns
   - Bank statements
   - Debt agreements

3. **Commercial**
   - Customer contracts
   - Supplier agreements
   - Revenue breakdown
   - Pipeline analysis

4. **Intellectual Property**
   - Patents and trademarks
   - IP assignments
   - Licensing agreements

5. **Employment**
   - Employment contracts
   - Equity plans
   - Key person insurance

6. **Technology**
   - Technology stack
   - Security audits
   - Data protection

7. **Regulatory & Compliance**
   - Industry licenses
   - Compliance certifications
   - Pending litigation

Format as a Markdown checklist with [ ] checkboxes for each item.`,
  },

  riskRegister: {
    name: 'Risk Register',
    prompt: (ctx: ProjectContext) => `Generate a comprehensive risk register for:

Company: ${ctx.projectName}
Industry: ${ctx.industry}
Jurisdiction: ${ctx.jurisdiction}

Create a risk register covering:

1. **Strategic Risks**
   - Market risks
   - Competitive risks
   - Technology disruption

2. **Operational Risks**
   - Key person dependency
   - Supply chain
   - Business continuity

3. **Financial Risks**
   - Funding risk
   - Currency exposure
   - Credit risk

4. **Legal & Regulatory Risks**
   - Compliance requirements
   - Litigation exposure
   - Regulatory changes

5. **Reputational Risks**
   - Brand damage
   - ESG concerns

For each risk, include:
- Risk description
- Likelihood (Low/Medium/High)
- Impact (Low/Medium/High)
- Mitigation strategy
- Owner/Responsible party

Format as a Markdown table.`,
  },

  investmentDeck: {
    name: 'Investment Deck Outline',
    prompt: (ctx: ProjectContext) => `Generate a detailed investment deck outline for:

Company: ${ctx.projectName}
Description: ${ctx.oneLineDescription}
Industry: ${ctx.industry}
${ctx.targetMarket ? `Target Market: ${ctx.targetMarket}` : ''}
${ctx.dealValue ? `Raising: ${ctx.currency || 'USD'} ${ctx.dealValue.toLocaleString()}` : ''}

Create a 15-20 slide deck outline with:

1. **Title Slide** - Company name, tagline, logo placeholder
2. **Executive Summary** - Key highlights
3. **The Problem** - Market pain point
4. **The Solution** - How you solve it
5. **Product/Service** - What you offer
6. **Market Opportunity** - TAM, SAM, SOM
7. **Business Model** - How you make money
8. **Traction** - Key metrics, milestones
9. **Competitive Landscape** - Positioning
10. **Go-to-Market Strategy** - Growth plan
11. **Team** - Key people and backgrounds
12. **Financials** - Revenue, projections
13. **The Ask** - Investment amount, use of funds
14. **Timeline** - Key milestones
15. **Appendix** - Additional details

For each slide, provide:
- Slide title
- Key points to include
- Suggested visuals/charts
- Speaker notes

Format in Markdown with clear slide separators.`,
  },

  shareholderAgreement: {
    name: 'Shareholder Agreement (Draft)',
    prompt: (ctx: ProjectContext) => `Generate a draft shareholder agreement outline for:

Company: ${ctx.projectName}
Jurisdiction: ${ctx.jurisdiction}
${ctx.founders ? `Founders: ${ctx.founders.map(f => `${f.name} (${f.shareholding}%)`).join(', ')}` : ''}

Create a comprehensive shareholder agreement covering:

1. **Definitions and Interpretation**
2. **Share Capital and Shareholdings**
3. **Board of Directors**
   - Composition
   - Meetings
   - Reserved matters
4. **Shareholder Rights**
   - Information rights
   - Voting rights
   - Dividend policy
5. **Transfer of Shares**
   - Pre-emption rights
   - Tag-along rights
   - Drag-along rights
   - Lock-up provisions
6. **Anti-Dilution Provisions**
7. **Founder Vesting**
   - Vesting schedule
   - Good/bad leaver provisions
8. **Non-Compete and Non-Solicit**
9. **Confidentiality**
10. **Dispute Resolution**
11. **Governing Law**

Note: This is a draft outline only. Legal review required before execution.

Format in Markdown with clear sections and subsections.`,
  },
};

export type DocumentType = keyof typeof DOCUMENT_TEMPLATES;

// Generate a document using AI
export async function generateDocument(
  type: DocumentType,
  context: ProjectContext
): Promise<GeneratedDocument> {
  const template = DOCUMENT_TEMPLATES[type];
  if (!template) {
    throw new Error(`Unknown document type: ${type}`);
  }

  const prompt = template.prompt(context);

  // Use the chat API to generate the document
  // In a real implementation, this would call a dedicated document generation endpoint
  // For now, we'll simulate the response structure
  
  const id = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id,
    name: template.name,
    type,
    content: `# ${template.name}\n\n*Generated for ${context.projectName}*\n\n---\n\n[Document content would be generated by AI based on the prompt]\n\nPrompt used:\n\`\`\`\n${prompt}\n\`\`\``,
    format: 'markdown',
    generatedAt: new Date(),
    qaStatus: {
      twinReviewed: false,
      twinApproved: false,
    },
  };
}

// Get available document types for an engagement type
export function getDocumentTypesForEngagement(engagementType: string): DocumentType[] {
  switch (engagementType) {
    case 'full_genesis':
      return ['nda', 'teaser', 'financialModel', 'ddChecklist', 'riskRegister', 'investmentDeck', 'shareholderAgreement'];
    case 'financial_review':
      return ['financialModel', 'riskRegister'];
    case 'due_diligence':
      return ['ddChecklist', 'riskRegister', 'nda'];
    case 'legal_docs':
      return ['nda', 'shareholderAgreement'];
    case 'strategic_review':
      return ['teaser', 'investmentDeck'];
    default:
      return ['nda', 'teaser'];
  }
}

// Export document to different formats
export function exportDocument(doc: GeneratedDocument, format: 'md' | 'html' | 'txt'): string {
  switch (format) {
    case 'html':
      // Simple markdown to HTML conversion
      return `<!DOCTYPE html>
<html>
<head>
  <title>${doc.name}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
    h1 { color: #1f2937; }
    h2 { color: #374151; margin-top: 2rem; }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
    th, td { border: 1px solid #d1d5db; padding: 0.5rem; text-align: left; }
    th { background: #f3f4f6; }
  </style>
</head>
<body>
${doc.content}
</body>
</html>`;
    case 'txt':
      // Strip markdown formatting
      return doc.content
        .replace(/#{1,6}\s/g, '')
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/`{1,3}/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    default:
      return doc.content;
  }
}
