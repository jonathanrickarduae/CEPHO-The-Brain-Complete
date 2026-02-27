// @ts-nocheck
import { invokeLLM } from "../_core/llm";

interface DeliverableGenerationContext {
  workflowType: string;
  phaseName: string;
  stepName: string;
  deliverableName: string;
  formData: Record<string, any>;
  previousStepsData?: Record<number, any>;
}

// Templates for different deliverable types
const DELIVERABLE_TEMPLATES: Record<string, string> = {
  "Market Research Report": `Generate a comprehensive Market Research Report with the following sections:
1. Executive Summary
2. Market Overview and Size
3. Target Market Analysis
4. Market Trends and Drivers
5. Competitive Landscape
6. Market Opportunities
7. Recommendations

Use the following information:
{context}`,

  "Competitor Analysis Matrix": `Create a detailed Competitor Analysis Matrix comparing key competitors across:
- Company Overview
- Products/Services
- Pricing Strategy
- Market Position
- Strengths
- Weaknesses
- Differentiation Opportunities

Based on:
{context}`,

  "Customer Personas": `Develop detailed Customer Personas including:
- Demographics
- Psychographics
- Goals and Motivations
- Pain Points
- Buying Behavior
- Preferred Channels
- Value Drivers

From the research:
{context}`,

  "Business Model Canvas": `Create a complete Business Model Canvas covering:
1. Customer Segments
2. Value Propositions
3. Channels
4. Customer Relationships
5. Revenue Streams
6. Key Resources
7. Key Activities
8. Key Partnerships
9. Cost Structure

Based on:
{context}`,

  "Value Proposition Canvas": `Design a Value Proposition Canvas with:
- Customer Jobs (functional, social, emotional)
- Customer Pains
- Customer Gains
- Products & Services
- Pain Relievers
- Gain Creators

Using:
{context}`,

  "Financial Projections Spreadsheet": `Generate 3-5 year Financial Projections including:
- Revenue Projections (by product/service line)
- Cost of Goods Sold (COGS)
- Operating Expenses
- EBITDA
- Net Income
- Cash Flow Statement
- Balance Sheet
- Key Financial Ratios
- Break-even Analysis
- Assumptions

Based on:
{context}`,

  "Go-to-Market Plan": `Create a comprehensive Go-to-Market Plan with:
1. Market Entry Strategy
2. Target Customer Segments
3. Positioning and Messaging
4. Marketing Channels and Tactics
5. Sales Strategy and Process
6. Pricing Strategy
7. Launch Timeline
8. Success Metrics
9. Budget and Resources
10. Risk Mitigation

From:
{context}`,

  "Marketing Plan": `Develop a detailed Marketing Plan including:
1. Marketing Objectives
2. Target Audience
3. Brand Positioning
4. Marketing Mix (4Ps)
5. Content Strategy
6. Channel Strategy
7. Campaign Calendar
8. Budget Allocation
9. KPIs and Metrics
10. Measurement and Optimization

Based on:
{context}`,
};

export async function generateDeliverable(context: DeliverableGenerationContext): Promise<string> {
  const template = DELIVERABLE_TEMPLATES[context.deliverableName];
  
  if (!template) {
    throw new Error(`No template found for deliverable: ${context.deliverableName}`);
  }

  // Build context from form data and previous steps
  const contextString = buildContextString(context);
  
  // Replace {context} placeholder with actual context
  const prompt = template.replace('{context}', contextString);

  // Add system instructions
  const systemPrompt = `You are an expert business analyst and consultant. Generate professional, detailed, and actionable deliverables for venture development projects. Use markdown formatting for structure and readability.`;

  // Generate deliverable using LLM
  const response = await invokeLLM({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 4000,
  });

  return response.content;
}

function buildContextString(context: DeliverableGenerationContext): string {
  const parts: string[] = [];

  // Add workflow and step context
  parts.push(`Workflow: ${context.workflowType}`);
  parts.push(`Phase: ${context.phaseName}`);
  parts.push(`Step: ${context.stepName}`);
  parts.push('');

  // Add current step form data
  if (context.formData && Object.keys(context.formData).length > 0) {
    parts.push('Current Step Data:');
    for (const [key, value] of Object.entries(context.formData)) {
      if (value) {
        parts.push(`- ${key}: ${value}`);
      }
    }
    parts.push('');
  }

  // Add previous steps data if available
  if (context.previousStepsData && Object.keys(context.previousStepsData).length > 0) {
    parts.push('Previous Steps Data:');
    for (const [stepNum, data] of Object.entries(context.previousStepsData)) {
      if (data && typeof data === 'object') {
        parts.push(`Step ${stepNum}:`);
        for (const [key, value] of Object.entries(data)) {
          if (value) {
            parts.push(`  - ${key}: ${value}`);
          }
        }
      }
    }
  }

  return parts.join('\n');
}

// Generate specific deliverable types with specialized logic
export async function generateMarketResearchReport(data: Record<string, any>): Promise<string> {
  return generateDeliverable({
    workflowType: 'project_genesis',
    phaseName: 'Discovery',
    stepName: 'Market Research',
    deliverableName: 'Market Research Report',
    formData: data,
  });
}

export async function generateBusinessModelCanvas(data: Record<string, any>): Promise<string> {
  return generateDeliverable({
    workflowType: 'project_genesis',
    phaseName: 'Definition',
    stepName: 'Business Model Canvas',
    deliverableName: 'Business Model Canvas',
    formData: data,
  });
}

export async function generateFinancialProjections(data: Record<string, any>): Promise<string> {
  return generateDeliverable({
    workflowType: 'project_genesis',
    phaseName: 'Definition',
    stepName: 'Financial Projections',
    deliverableName: 'Financial Projections Spreadsheet',
    formData: data,
  });
}

export async function generateGoToMarketPlan(data: Record<string, any>): Promise<string> {
  return generateDeliverable({
    workflowType: 'project_genesis',
    phaseName: 'Deployment',
    stepName: 'Go-to-Market Strategy',
    deliverableName: 'Go-to-Market Plan',
    formData: data,
  });
}
