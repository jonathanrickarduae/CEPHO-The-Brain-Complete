/**
 * PDF Export Service
 * Generates PDF documents from templates and data
 */

import { ENV } from '../_core/env';

export interface DocumentData {
  title: string;
  type: 'nda' | 'financial_model' | 'due_diligence' | 'investment_deck' | 'risk_register' | 'shareholder_agreement' | 'blueprint';
  projectName: string;
  content: Record<string, any>;
  generatedAt: Date;
  author?: string;
}

export interface PDFGenerationResult {
  success: boolean;
  pdfUrl?: string;
  pdfBase64?: string;
  filename: string;
  pageCount: number;
  error?: string;
}

/**
 * Generate PDF from document data
 */
export async function generatePDF(data: DocumentData): Promise<PDFGenerationResult> {
  const filename = `${data.type}_${data.projectName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
  
  try {
    // Generate HTML content based on document type
    const htmlContent = generateHTMLContent(data);
    
    // For now, return a placeholder - in production, use puppeteer or similar
    return {
      success: true,
      filename,
      pageCount: estimatePageCount(htmlContent),
      pdfBase64: Buffer.from(htmlContent).toString('base64'), // Placeholder
    };
  } catch (error) {
    return {
      success: false,
      filename,
      pageCount: 0,
      error: error instanceof Error ? error.message : 'PDF generation failed',
    };
  }
}

/**
 * Generate HTML content for different document types
 */
function generateHTMLContent(data: DocumentData): string {
  const styles = `
    <style>
      body { font-family: 'Inter', Arial, sans-serif; margin: 40px; color: #1a1a1a; }
      h1 { color: #7c3aed; border-bottom: 2px solid #7c3aed; padding-bottom: 10px; }
      h2 { color: #4c1d95; margin-top: 30px; }
      h3 { color: #6d28d9; }
      .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
      .logo { font-size: 24px; font-weight: bold; color: #7c3aed; }
      .meta { color: #666; font-size: 12px; }
      .section { margin: 20px 0; padding: 15px; background: #f9fafb; border-radius: 8px; }
      .highlight { background: #ede9fe; padding: 10px; border-left: 4px solid #7c3aed; margin: 15px 0; }
      table { width: 100%; border-collapse: collapse; margin: 15px 0; }
      th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; }
      th { background: #7c3aed; color: white; }
      .signature-block { margin-top: 50px; display: flex; justify-content: space-between; }
      .signature-line { width: 200px; border-top: 1px solid #000; margin-top: 50px; text-align: center; }
      .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #666; }
    </style>
  `;

  switch (data.type) {
    case 'nda':
      return generateNDAHTML(data, styles);
    case 'financial_model':
      return generateFinancialModelHTML(data, styles);
    case 'due_diligence':
      return generateDueDiligenceHTML(data, styles);
    case 'investment_deck':
      return generateInvestmentDeckHTML(data, styles);
    case 'risk_register':
      return generateRiskRegisterHTML(data, styles);
    case 'blueprint':
      return generateBlueprintHTML(data, styles);
    default:
      return generateGenericHTML(data, styles);
  }
}

function generateNDAHTML(data: DocumentData, styles: string): string {
  const { projectName, content } = data;
  return `
    <!DOCTYPE html>
    <html>
    <head><title>NDA - ${projectName}</title>${styles}</head>
    <body>
      <div class="header">
        <div class="logo">THE BRAIN</div>
        <div class="meta">Generated: ${new Date().toLocaleDateString()}</div>
      </div>
      
      <h1>NON-DISCLOSURE AGREEMENT</h1>
      
      <div class="section">
        <p>This Non-Disclosure Agreement ("Agreement") is entered into as of <strong>${content.effectiveDate || '[DATE]'}</strong></p>
        <p><strong>Between:</strong></p>
        <p>Party A: ${content.partyA || '[DISCLOSING PARTY]'}</p>
        <p>Party B: ${content.partyB || '[RECEIVING PARTY]'}</p>
      </div>
      
      <h2>1. Definition of Confidential Information</h2>
      <p>"Confidential Information" means any information disclosed by either party to the other party, either directly or indirectly, in writing, orally, or by inspection of tangible objects, which is designated as "Confidential," "Proprietary," or some similar designation, or which should reasonably be understood to be confidential given the nature of the information and the circumstances of disclosure.</p>
      
      <h2>2. Obligations of Receiving Party</h2>
      <p>The Receiving Party shall:</p>
      <ul>
        <li>Hold and maintain the Confidential Information in strict confidence</li>
        <li>Not use the Confidential Information for any purpose except as authorized</li>
        <li>Not disclose any Confidential Information to third parties without prior written consent</li>
        <li>Protect the Confidential Information using the same degree of care as for its own confidential information</li>
      </ul>
      
      <h2>3. Term</h2>
      <p>This Agreement shall remain in effect for a period of <strong>${content.termYears || '2'} years</strong> from the Effective Date.</p>
      
      <h2>4. Governing Law</h2>
      <p>This Agreement shall be governed by and construed in accordance with the laws of <strong>${content.jurisdiction || '[JURISDICTION]'}</strong>.</p>
      
      <div class="signature-block">
        <div>
          <div class="signature-line">Party A</div>
          <p>Name: _________________</p>
          <p>Date: _________________</p>
        </div>
        <div>
          <div class="signature-line">Party B</div>
          <p>Name: _________________</p>
          <p>Date: _________________</p>
        </div>
      </div>
      
      <div class="footer">
        <p>Document ID: NDA-${Date.now()} | Project: ${projectName} | Generated by The Brain</p>
      </div>
    </body>
    </html>
  `;
}

function generateFinancialModelHTML(data: DocumentData, styles: string): string {
  const { projectName, content } = data;
  return `
    <!DOCTYPE html>
    <html>
    <head><title>Financial Model - ${projectName}</title>${styles}</head>
    <body>
      <div class="header">
        <div class="logo">THE BRAIN</div>
        <div class="meta">Generated: ${new Date().toLocaleDateString()}</div>
      </div>
      
      <h1>FINANCIAL MODEL</h1>
      <h2>${projectName}</h2>
      
      <div class="highlight">
        <strong>Executive Summary:</strong> ${content.summary || 'Financial projections and analysis for the proposed investment.'}
      </div>
      
      <h2>Revenue Projections</h2>
      <table>
        <tr><th>Year</th><th>Revenue</th><th>Growth</th><th>EBITDA</th></tr>
        <tr><td>Year 1</td><td>${content.year1Revenue || '$0'}</td><td>-</td><td>${content.year1EBITDA || '$0'}</td></tr>
        <tr><td>Year 2</td><td>${content.year2Revenue || '$0'}</td><td>${content.year2Growth || '0%'}</td><td>${content.year2EBITDA || '$0'}</td></tr>
        <tr><td>Year 3</td><td>${content.year3Revenue || '$0'}</td><td>${content.year3Growth || '0%'}</td><td>${content.year3EBITDA || '$0'}</td></tr>
        <tr><td>Year 4</td><td>${content.year4Revenue || '$0'}</td><td>${content.year4Growth || '0%'}</td><td>${content.year4EBITDA || '$0'}</td></tr>
        <tr><td>Year 5</td><td>${content.year5Revenue || '$0'}</td><td>${content.year5Growth || '0%'}</td><td>${content.year5EBITDA || '$0'}</td></tr>
      </table>
      
      <h2>Key Assumptions</h2>
      <div class="section">
        <ul>
          <li>Market Size: ${content.marketSize || 'TBD'}</li>
          <li>Target Market Share: ${content.marketShare || 'TBD'}</li>
          <li>Customer Acquisition Cost: ${content.cac || 'TBD'}</li>
          <li>Lifetime Value: ${content.ltv || 'TBD'}</li>
          <li>Gross Margin: ${content.grossMargin || 'TBD'}</li>
        </ul>
      </div>
      
      <h2>Investment Requirements</h2>
      <div class="section">
        <p><strong>Total Funding Required:</strong> ${content.fundingRequired || 'TBD'}</p>
        <p><strong>Use of Funds:</strong></p>
        <ul>
          <li>Product Development: ${content.productDev || '40%'}</li>
          <li>Sales & Marketing: ${content.salesMarketing || '30%'}</li>
          <li>Operations: ${content.operations || '20%'}</li>
          <li>Working Capital: ${content.workingCapital || '10%'}</li>
        </ul>
      </div>
      
      <div class="footer">
        <p>Document ID: FM-${Date.now()} | Project: ${projectName} | Generated by The Brain</p>
        <p>Disclaimer: These projections are estimates based on assumptions and should not be considered guarantees of future performance.</p>
      </div>
    </body>
    </html>
  `;
}

function generateDueDiligenceHTML(data: DocumentData, styles: string): string {
  const { projectName, content } = data;
  return `
    <!DOCTYPE html>
    <html>
    <head><title>Due Diligence Checklist - ${projectName}</title>${styles}</head>
    <body>
      <div class="header">
        <div class="logo">THE BRAIN</div>
        <div class="meta">Generated: ${new Date().toLocaleDateString()}</div>
      </div>
      
      <h1>DUE DILIGENCE CHECKLIST</h1>
      <h2>${projectName}</h2>
      
      <h2>1. Corporate Documents</h2>
      <table>
        <tr><th>Item</th><th>Status</th><th>Notes</th></tr>
        <tr><td>Certificate of Incorporation</td><td>☐</td><td></td></tr>
        <tr><td>Bylaws/Articles of Association</td><td>☐</td><td></td></tr>
        <tr><td>Shareholder Agreements</td><td>☐</td><td></td></tr>
        <tr><td>Board Minutes (last 3 years)</td><td>☐</td><td></td></tr>
        <tr><td>Cap Table</td><td>☐</td><td></td></tr>
      </table>
      
      <h2>2. Financial Documents</h2>
      <table>
        <tr><th>Item</th><th>Status</th><th>Notes</th></tr>
        <tr><td>Audited Financial Statements (3 years)</td><td>☐</td><td></td></tr>
        <tr><td>Management Accounts (YTD)</td><td>☐</td><td></td></tr>
        <tr><td>Tax Returns (3 years)</td><td>☐</td><td></td></tr>
        <tr><td>Bank Statements (12 months)</td><td>☐</td><td></td></tr>
        <tr><td>Debt Schedule</td><td>☐</td><td></td></tr>
      </table>
      
      <h2>3. Legal Documents</h2>
      <table>
        <tr><th>Item</th><th>Status</th><th>Notes</th></tr>
        <tr><td>Material Contracts</td><td>☐</td><td></td></tr>
        <tr><td>IP Assignments</td><td>☐</td><td></td></tr>
        <tr><td>Employment Agreements</td><td>☐</td><td></td></tr>
        <tr><td>Litigation History</td><td>☐</td><td></td></tr>
        <tr><td>Regulatory Licenses</td><td>☐</td><td></td></tr>
      </table>
      
      <h2>4. Operational Documents</h2>
      <table>
        <tr><th>Item</th><th>Status</th><th>Notes</th></tr>
        <tr><td>Organizational Chart</td><td>☐</td><td></td></tr>
        <tr><td>Key Customer List</td><td>☐</td><td></td></tr>
        <tr><td>Supplier Agreements</td><td>☐</td><td></td></tr>
        <tr><td>Insurance Policies</td><td>☐</td><td></td></tr>
        <tr><td>IT Systems Overview</td><td>☐</td><td></td></tr>
      </table>
      
      <div class="footer">
        <p>Document ID: DD-${Date.now()} | Project: ${projectName} | Generated by The Brain</p>
      </div>
    </body>
    </html>
  `;
}

function generateInvestmentDeckHTML(data: DocumentData, styles: string): string {
  const { projectName, content } = data;
  return `
    <!DOCTYPE html>
    <html>
    <head><title>Investment Deck - ${projectName}</title>${styles}</head>
    <body>
      <div class="header">
        <div class="logo">THE BRAIN</div>
        <div class="meta">Generated: ${new Date().toLocaleDateString()}</div>
      </div>
      
      <h1>INVESTMENT OPPORTUNITY</h1>
      <h2>${projectName}</h2>
      
      <div class="highlight">
        <strong>Elevator Pitch:</strong> ${content.elevatorPitch || '[One-sentence description of the opportunity]'}
      </div>
      
      <h2>The Problem</h2>
      <div class="section">
        <p>${content.problem || '[Description of the problem being solved]'}</p>
      </div>
      
      <h2>The Solution</h2>
      <div class="section">
        <p>${content.solution || '[Description of the solution]'}</p>
      </div>
      
      <h2>Market Opportunity</h2>
      <div class="section">
        <ul>
          <li><strong>TAM:</strong> ${content.tam || 'TBD'}</li>
          <li><strong>SAM:</strong> ${content.sam || 'TBD'}</li>
          <li><strong>SOM:</strong> ${content.som || 'TBD'}</li>
        </ul>
      </div>
      
      <h2>Business Model</h2>
      <div class="section">
        <p>${content.businessModel || '[Description of how the company makes money]'}</p>
      </div>
      
      <h2>Competitive Advantage</h2>
      <div class="section">
        <p>${content.competitiveAdvantage || '[What makes this opportunity unique]'}</p>
      </div>
      
      <h2>Team</h2>
      <div class="section">
        <p>${content.team || '[Key team members and their backgrounds]'}</p>
      </div>
      
      <h2>The Ask</h2>
      <div class="highlight">
        <p><strong>Investment Sought:</strong> ${content.investmentSought || 'TBD'}</p>
        <p><strong>Use of Funds:</strong> ${content.useOfFunds || 'TBD'}</p>
        <p><strong>Expected Returns:</strong> ${content.expectedReturns || 'TBD'}</p>
      </div>
      
      <div class="footer">
        <p>Document ID: ID-${Date.now()} | Project: ${projectName} | Generated by The Brain</p>
        <p>CONFIDENTIAL - For intended recipient only</p>
      </div>
    </body>
    </html>
  `;
}

function generateRiskRegisterHTML(data: DocumentData, styles: string): string {
  const { projectName, content } = data;
  return `
    <!DOCTYPE html>
    <html>
    <head><title>Risk Register - ${projectName}</title>${styles}</head>
    <body>
      <div class="header">
        <div class="logo">THE BRAIN</div>
        <div class="meta">Generated: ${new Date().toLocaleDateString()}</div>
      </div>
      
      <h1>RISK REGISTER</h1>
      <h2>${projectName}</h2>
      
      <h2>Risk Summary</h2>
      <table>
        <tr><th>Risk Category</th><th>Risk</th><th>Likelihood</th><th>Impact</th><th>Mitigation</th></tr>
        <tr><td>Market</td><td>Competition increases</td><td>Medium</td><td>High</td><td>Differentiation strategy</td></tr>
        <tr><td>Financial</td><td>Cash flow constraints</td><td>Low</td><td>High</td><td>Working capital facility</td></tr>
        <tr><td>Operational</td><td>Key person dependency</td><td>Medium</td><td>Medium</td><td>Succession planning</td></tr>
        <tr><td>Legal</td><td>Regulatory changes</td><td>Low</td><td>Medium</td><td>Legal monitoring</td></tr>
        <tr><td>Technical</td><td>System failure</td><td>Low</td><td>High</td><td>Redundancy & backups</td></tr>
      </table>
      
      <h2>Risk Matrix</h2>
      <div class="section">
        <p>High Impact + High Likelihood = Critical (Immediate action required)</p>
        <p>High Impact + Low Likelihood = Important (Contingency plans needed)</p>
        <p>Low Impact + High Likelihood = Monitor (Regular review)</p>
        <p>Low Impact + Low Likelihood = Accept (Document and move on)</p>
      </div>
      
      <div class="footer">
        <p>Document ID: RR-${Date.now()} | Project: ${projectName} | Generated by The Brain</p>
      </div>
    </body>
    </html>
  `;
}

function generateBlueprintHTML(data: DocumentData, styles: string): string {
  const { projectName, content } = data;
  return `
    <!DOCTYPE html>
    <html>
    <head><title>Visual Blueprint - ${projectName}</title>${styles}</head>
    <body>
      <div class="header">
        <div class="logo">THE BRAIN</div>
        <div class="meta">Generated: ${new Date().toLocaleDateString()}</div>
      </div>
      
      <h1>VISUAL BLUEPRINT</h1>
      <h2>${projectName}</h2>
      
      <div class="highlight">
        <strong>Overview:</strong> Single-page architectural view of all project elements, processes, and dependencies.
      </div>
      
      <h2>Project Structure</h2>
      <div class="section">
        <h3>Stakeholders</h3>
        <p>${content.stakeholders || '[Key stakeholders and their roles]'}</p>
        
        <h3>Key Processes</h3>
        <p>${content.processes || '[Main business processes]'}</p>
        
        <h3>Dependencies</h3>
        <p>${content.dependencies || '[Critical dependencies and relationships]'}</p>
      </div>
      
      <h2>Quality Management System</h2>
      <div class="section">
        <ul>
          <li>Quality Standards: ${content.qualityStandards || 'ISO 9001 aligned'}</li>
          <li>Review Process: ${content.reviewProcess || 'Multi-stage approval'}</li>
          <li>Documentation: ${content.documentation || 'Comprehensive audit trail'}</li>
        </ul>
      </div>
      
      <h2>Deliverables Map</h2>
      <table>
        <tr><th>Phase</th><th>Deliverable</th><th>Owner</th><th>Status</th></tr>
        <tr><td>Discovery</td><td>Requirements Document</td><td>Project Lead</td><td>☐</td></tr>
        <tr><td>Analysis</td><td>Financial Model</td><td>Finance Expert</td><td>☐</td></tr>
        <tr><td>Legal</td><td>NDA & Contracts</td><td>Legal Expert</td><td>☐</td></tr>
        <tr><td>Due Diligence</td><td>DD Report</td><td>DD Team</td><td>☐</td></tr>
        <tr><td>Completion</td><td>Final Package</td><td>Project Lead</td><td>☐</td></tr>
      </table>
      
      <div class="footer">
        <p>Document ID: BP-${Date.now()} | Project: ${projectName} | Generated by The Brain</p>
      </div>
    </body>
    </html>
  `;
}

function generateGenericHTML(data: DocumentData, styles: string): string {
  const { title, projectName, content } = data;
  return `
    <!DOCTYPE html>
    <html>
    <head><title>${title} - ${projectName}</title>${styles}</head>
    <body>
      <div class="header">
        <div class="logo">THE BRAIN</div>
        <div class="meta">Generated: ${new Date().toLocaleDateString()}</div>
      </div>
      
      <h1>${title}</h1>
      <h2>${projectName}</h2>
      
      <div class="section">
        ${Object.entries(content).map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`).join('')}
      </div>
      
      <div class="footer">
        <p>Document ID: DOC-${Date.now()} | Project: ${projectName} | Generated by The Brain</p>
      </div>
    </body>
    </html>
  `;
}

function estimatePageCount(html: string): number {
  // Rough estimate: ~3000 characters per page
  return Math.max(1, Math.ceil(html.length / 3000));
}

/**
 * Export document to DOCX format (placeholder)
 */
export async function generateDOCX(data: DocumentData): Promise<PDFGenerationResult> {
  const filename = `${data.type}_${data.projectName.replace(/\s+/g, '_')}_${Date.now()}.docx`;
  
  // Placeholder - would use docx library in production
  return {
    success: true,
    filename,
    pageCount: 1,
  };
}
