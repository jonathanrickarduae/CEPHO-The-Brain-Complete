/**
 * CEPHO Document Templates
 * 
 * Branded document templates following CEPHO design guidelines:
 * - Black, white, and grey color palette
 * - Calibri font family
 * - Clear dividers and structure
 * - No page numbers (per user preference)
 * - No hyphens to avoid AI look
 * - No specific numbers unless requested
 */

// =============================================================================
// DESIGN CONSTANTS
// =============================================================================

export const CEPHO_DESIGN = {
  colors: {
    primary: "#E91E8C", // CEPHO Pink
    secondary: "#0D0D0D", // Near black
    text: "#000000",
    textLight: "#666666",
    background: "#FFFFFF",
    divider: "#E5E5E5",
    accent: "#F5F5F5"
  },
  fonts: {
    primary: "Calibri, Arial, sans-serif",
    heading: "Calibri, Arial, sans-serif"
  },
  spacing: {
    margin: "40px",
    padding: "24px",
    sectionGap: "32px"
  }
};

// =============================================================================
// BASE STYLES
// =============================================================================

const BASE_STYLES = `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: Calibri, 'Inter', Arial, sans-serif;
      color: ${CEPHO_DESIGN.colors.text};
      line-height: 1.6;
      background: ${CEPHO_DESIGN.colors.background};
    }
    
    .document {
      max-width: 800px;
      margin: 0 auto;
      padding: ${CEPHO_DESIGN.spacing.margin};
    }
    
    .header {
      border-bottom: 3px solid ${CEPHO_DESIGN.colors.primary};
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    .header-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }
    
    .header-logo img {
      height: 40px;
    }
    
    .header-title {
      font-size: 28px;
      font-weight: 700;
      color: ${CEPHO_DESIGN.colors.text};
      margin-bottom: 8px;
    }
    
    .header-subtitle {
      font-size: 14px;
      color: ${CEPHO_DESIGN.colors.textLight};
    }
    
    .header-meta {
      display: flex;
      gap: 24px;
      margin-top: 16px;
      font-size: 12px;
      color: ${CEPHO_DESIGN.colors.textLight};
    }
    
    .section {
      margin-bottom: ${CEPHO_DESIGN.spacing.sectionGap};
    }
    
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: ${CEPHO_DESIGN.colors.text};
      border-bottom: 2px solid ${CEPHO_DESIGN.colors.divider};
      padding-bottom: 8px;
      margin-bottom: 16px;
    }
    
    .section-content {
      font-size: 14px;
      color: ${CEPHO_DESIGN.colors.text};
    }
    
    .section-content p {
      margin-bottom: 12px;
    }
    
    .divider {
      border: none;
      border-top: 1px solid ${CEPHO_DESIGN.colors.divider};
      margin: 24px 0;
    }
    
    .highlight-box {
      background: ${CEPHO_DESIGN.colors.accent};
      border-left: 4px solid ${CEPHO_DESIGN.colors.primary};
      padding: 16px;
      margin: 16px 0;
    }
    
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin: 16px 0;
    }
    
    .kpi-card {
      background: ${CEPHO_DESIGN.colors.accent};
      padding: 16px;
      text-align: center;
      border-radius: 4px;
    }
    
    .kpi-value {
      font-size: 24px;
      font-weight: 700;
      color: ${CEPHO_DESIGN.colors.primary};
    }
    
    .kpi-label {
      font-size: 12px;
      color: ${CEPHO_DESIGN.colors.textLight};
      margin-top: 4px;
    }
    
    .table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
    }
    
    .table th {
      background: ${CEPHO_DESIGN.colors.accent};
      padding: 12px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid ${CEPHO_DESIGN.colors.divider};
    }
    
    .table td {
      padding: 12px;
      border-bottom: 1px solid ${CEPHO_DESIGN.colors.divider};
    }
    
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    
    .status-excellent { background: #D1FAE5; color: #059669; }
    .status-good { background: #DBEAFE; color: #2563EB; }
    .status-adequate { background: #FEF3C7; color: #D97706; }
    .status-needs-work { background: #FEE2E2; color: #DC2626; }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid ${CEPHO_DESIGN.colors.divider};
      font-size: 11px;
      color: ${CEPHO_DESIGN.colors.textLight};
      text-align: center;
    }
    
    @media print {
      .document {
        padding: 20px;
      }
    }
  </style>
`;

// =============================================================================
// TEMPLATE: CEO KPI SCORECARD
// =============================================================================

export interface CEOKPIData {
  companyName: string;
  reportDate: string;
  overallScore: number;
  previousScore?: number;
  categories: Array<{
    name: string;
    score: number;
    status: "excellent" | "good" | "adequate" | "needs_work";
    items: Array<{
      name: string;
      score: number;
      change?: number;
    }>;
  }>;
  executiveSummary: string;
  keyHighlights: string[];
  priorityActions: string[];
}

export function generateCEOKPIScorecard(data: CEOKPIData): string {
  const changeText = data.previousScore 
    ? `${data.overallScore > data.previousScore ? '+' : ''}${data.overallScore - data.previousScore} from previous`
    : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>CEO KPI Scorecard - ${data.companyName}</title>
  ${BASE_STYLES}
</head>
<body>
  <div class="document">
    <div class="header">
      <div class="header-logo">
        <span style="font-size: 24px; font-weight: bold; color: ${CEPHO_DESIGN.colors.primary};">CEPHO.Ai</span>
      </div>
      <div class="header-title">CEO KPI Scorecard</div>
      <div class="header-subtitle">${data.companyName}</div>
      <div class="header-meta">
        <span>Report Date: ${data.reportDate}</span>
        <span>Version 3.0</span>
      </div>
    </div>
    
    <div class="section">
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-value">${data.overallScore}</div>
          <div class="kpi-label">Overall Score</div>
          ${changeText ? `<div style="font-size: 11px; color: #059669; margin-top: 4px;">${changeText}</div>` : ''}
        </div>
        ${data.categories.slice(0, 2).map(cat => `
        <div class="kpi-card">
          <div class="kpi-value">${cat.score}</div>
          <div class="kpi-label">${cat.name}</div>
        </div>
        `).join('')}
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">Executive Summary</div>
      <div class="section-content">
        <p>${data.executiveSummary}</p>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">Key Highlights</div>
      <div class="highlight-box">
        ${data.keyHighlights.map(h => `<p>• ${h}</p>`).join('')}
      </div>
    </div>
    
    ${data.categories.map(category => `
    <div class="section">
      <div class="section-title">${category.name} <span class="status-badge status-${category.status.replace('_', '-')}">${category.score}/100</span></div>
      <table class="table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Score</th>
            <th>Status</th>
            <th>Change</th>
          </tr>
        </thead>
        <tbody>
          ${category.items.map(item => `
          <tr>
            <td>${item.name}</td>
            <td>${item.score}</td>
            <td><span class="status-badge status-${item.score >= 90 ? 'excellent' : item.score >= 75 ? 'good' : item.score >= 60 ? 'adequate' : 'needs-work'}">${item.score >= 90 ? 'Excellent' : item.score >= 75 ? 'Good' : item.score >= 60 ? 'Adequate' : 'Needs Work'}</span></td>
            <td style="color: ${(item.change || 0) >= 0 ? '#059669' : '#DC2626'}">${item.change ? (item.change > 0 ? '+' : '') + item.change : '—'}</td>
          </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    `).join('')}
    
    <div class="section">
      <div class="section-title">Priority Actions</div>
      <div class="section-content">
        ${data.priorityActions.map((action, i) => `<p><strong>${i + 1}.</strong> ${action}</p>`).join('')}
      </div>
    </div>
    
    <div class="footer">
      Generated by CEPHO.Ai | Confidential
    </div>
  </div>
</body>
</html>`;
}

// =============================================================================
// TEMPLATE: CHIEF OF STAFF BRIEFING PAPER
// =============================================================================

export interface BriefingPaperData {
  title: string;
  date: string;
  preparedFor: string;
  preparedBy: string;
  classification: "confidential" | "internal" | "public";
  executiveSummary: string;
  background: string;
  keyFindings: string[];
  recommendations: string[];
  nextSteps: string[];
  appendices?: string[];
}

export function generateBriefingPaper(data: BriefingPaperData): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${data.title}</title>
  ${BASE_STYLES}
</head>
<body>
  <div class="document">
    <div class="header">
      <div class="header-logo">
        <span style="font-size: 24px; font-weight: bold; color: ${CEPHO_DESIGN.colors.primary};">CEPHO.Ai</span>
      </div>
      <div class="header-title">${data.title}</div>
      <div class="header-subtitle">Chief of Staff Briefing Paper</div>
      <div class="header-meta">
        <span>Date: ${data.date}</span>
        <span>Prepared for: ${data.preparedFor}</span>
        <span>Classification: ${data.classification.toUpperCase()}</span>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">Executive Summary</div>
      <div class="highlight-box">
        <p>${data.executiveSummary}</p>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">Background</div>
      <div class="section-content">
        <p>${data.background}</p>
      </div>
    </div>
    
    <hr class="divider" />
    
    <div class="section">
      <div class="section-title">Key Findings</div>
      <div class="section-content">
        ${data.keyFindings.map((finding, i) => `<p><strong>${i + 1}.</strong> ${finding}</p>`).join('')}
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">Recommendations</div>
      <div class="section-content">
        ${data.recommendations.map((rec, i) => `<p><strong>${i + 1}.</strong> ${rec}</p>`).join('')}
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">Next Steps</div>
      <div class="highlight-box">
        ${data.nextSteps.map(step => `<p>• ${step}</p>`).join('')}
      </div>
    </div>
    
    ${data.appendices && data.appendices.length > 0 ? `
    <hr class="divider" />
    <div class="section">
      <div class="section-title">Appendices</div>
      <div class="section-content">
        ${data.appendices.map((app, i) => `<p><strong>Appendix ${String.fromCharCode(65 + i)}:</strong> ${app}</p>`).join('')}
      </div>
    </div>
    ` : ''}
    
    <div class="footer">
      Prepared by: ${data.preparedBy} | CEPHO.Ai Chief of Staff | ${data.classification.toUpperCase()}
    </div>
  </div>
</body>
</html>`;
}

// =============================================================================
// TEMPLATE: SME PANEL REVIEW REPORT
// =============================================================================

export interface SMEPanelReviewData {
  projectName: string;
  reviewDate: string;
  panelMembers: Array<{
    name: string;
    expertise: string;
    verdict: "approve" | "revise" | "reject";
  }>;
  overallVerdict: "approved" | "revisions_required" | "rejected";
  summary: string;
  strengthsIdentified: string[];
  areasForImprovement: string[];
  expertComments: Array<{
    expert: string;
    comment: string;
    priority: "high" | "medium" | "low";
  }>;
  nextReviewDate?: string;
}

export function generateSMEPanelReport(data: SMEPanelReviewData): string {
  const verdictColor = data.overallVerdict === "approved" ? "#059669" : data.overallVerdict === "revisions_required" ? "#D97706" : "#DC2626";
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>SME Panel Review - ${data.projectName}</title>
  ${BASE_STYLES}
</head>
<body>
  <div class="document">
    <div class="header">
      <div class="header-logo">
        <span style="font-size: 24px; font-weight: bold; color: ${CEPHO_DESIGN.colors.primary};">CEPHO.Ai</span>
      </div>
      <div class="header-title">SME Panel Review Report</div>
      <div class="header-subtitle">${data.projectName}</div>
      <div class="header-meta">
        <span>Review Date: ${data.reviewDate}</span>
        <span>Panel Size: ${data.panelMembers.length} experts</span>
      </div>
    </div>
    
    <div class="section">
      <div class="highlight-box" style="border-left-color: ${verdictColor};">
        <p style="font-size: 18px; font-weight: 600; color: ${verdictColor};">
          Overall Verdict: ${data.overallVerdict.replace('_', ' ').toUpperCase()}
        </p>
        <p style="margin-top: 8px;">${data.summary}</p>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">Panel Members</div>
      <table class="table">
        <thead>
          <tr>
            <th>Expert</th>
            <th>Expertise</th>
            <th>Verdict</th>
          </tr>
        </thead>
        <tbody>
          ${data.panelMembers.map(member => `
          <tr>
            <td>${member.name}</td>
            <td>${member.expertise}</td>
            <td><span class="status-badge status-${member.verdict === 'approve' ? 'excellent' : member.verdict === 'revise' ? 'adequate' : 'needs-work'}">${member.verdict.toUpperCase()}</span></td>
          </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    
    <div class="kpi-grid" style="grid-template-columns: 1fr 1fr;">
      <div class="section">
        <div class="section-title">Strengths Identified</div>
        <div class="section-content">
          ${data.strengthsIdentified.map(s => `<p>✓ ${s}</p>`).join('')}
        </div>
      </div>
      <div class="section">
        <div class="section-title">Areas for Improvement</div>
        <div class="section-content">
          ${data.areasForImprovement.map(a => `<p>• ${a}</p>`).join('')}
        </div>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">Expert Comments</div>
      ${data.expertComments.map(comment => `
      <div class="highlight-box" style="margin-bottom: 12px; border-left-color: ${comment.priority === 'high' ? '#DC2626' : comment.priority === 'medium' ? '#D97706' : '#666666'};">
        <p style="font-weight: 600; margin-bottom: 4px;">${comment.expert} <span style="font-size: 11px; color: ${CEPHO_DESIGN.colors.textLight};">[${comment.priority.toUpperCase()} PRIORITY]</span></p>
        <p>${comment.comment}</p>
      </div>
      `).join('')}
    </div>
    
    ${data.nextReviewDate ? `
    <div class="section">
      <div class="highlight-box">
        <p><strong>Next Review Scheduled:</strong> ${data.nextReviewDate}</p>
      </div>
    </div>
    ` : ''}
    
    <div class="footer">
      Generated by CEPHO.Ai SME Panel System | Confidential
    </div>
  </div>
</body>
</html>`;
}

// =============================================================================
// TEMPLATE: MORNING SIGNAL DAILY BRIEFING
// =============================================================================

export interface MorningSignalData {
  date: string;
  userName: string;
  wellnessScore: number;
  priorities: Array<{
    title: string;
    description: string;
    urgency: "high" | "medium" | "low";
  }>;
  calendar: Array<{
    time: string;
    title: string;
    duration: string;
  }>;
  insights: string[];
  overnightUpdates?: string[];
}

export function generateMorningSignalPDF(data: MorningSignalData): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Morning Signal - ${data.date}</title>
  ${BASE_STYLES}
</head>
<body>
  <div class="document">
    <div class="header" style="background: linear-gradient(135deg, ${CEPHO_DESIGN.colors.primary}, ${CEPHO_DESIGN.colors.secondary}); color: white; padding: 30px; margin: -40px -40px 30px -40px; border-bottom: none;">
      <div class="header-title" style="color: white;">Morning Signal</div>
      <div class="header-subtitle" style="color: rgba(255,255,255,0.9);">${data.date}</div>
      <div style="margin-top: 16px; display: inline-block; background: white; color: ${CEPHO_DESIGN.colors.primary}; padding: 8px 16px; border-radius: 20px; font-weight: 600;">
        Wellness Score: ${data.wellnessScore}/100
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">Today's Priorities</div>
      ${data.priorities.map((p, i) => `
      <div class="highlight-box" style="border-left-color: ${p.urgency === 'high' ? '#DC2626' : p.urgency === 'medium' ? '#D97706' : '#059669'};">
        <p style="font-weight: 600;">${i + 1}. ${p.title}</p>
        <p style="font-size: 13px; color: ${CEPHO_DESIGN.colors.textLight};">${p.description}</p>
      </div>
      `).join('')}
    </div>
    
    <div class="section">
      <div class="section-title">Schedule</div>
      <table class="table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Event</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          ${data.calendar.map(event => `
          <tr>
            <td style="font-weight: 600; color: ${CEPHO_DESIGN.colors.primary};">${event.time}</td>
            <td>${event.title}</td>
            <td>${event.duration}</td>
          </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    
    <div class="section">
      <div class="section-title">Insights</div>
      <div class="section-content">
        ${data.insights.map(insight => `<p>💡 ${insight}</p>`).join('')}
      </div>
    </div>
    
    ${data.overnightUpdates && data.overnightUpdates.length > 0 ? `
    <div class="section">
      <div class="section-title">Overnight Updates</div>
      <div class="section-content">
        ${data.overnightUpdates.map(update => `<p>🌙 ${update}</p>`).join('')}
      </div>
    </div>
    ` : ''}
    
    <div class="footer">
      Your Chief of Staff is here to support you throughout the day.
    </div>
  </div>
</body>
</html>`;
}

// =============================================================================
// TEMPLATE: INVESTOR UPDATE
// =============================================================================

export interface InvestorUpdateData {
  companyName: string;
  period: string;
  date: string;
  highlights: string[];
  metrics: Array<{
    name: string;
    value: string;
    change?: string;
    trend: "up" | "down" | "stable";
  }>;
  achievements: string[];
  challenges: string[];
  outlook: string;
  askFromInvestors?: string;
}

export function generateInvestorUpdate(data: InvestorUpdateData): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Investor Update - ${data.companyName} - ${data.period}</title>
  ${BASE_STYLES}
</head>
<body>
  <div class="document">
    <div class="header">
      <div class="header-logo">
        <span style="font-size: 24px; font-weight: bold; color: ${CEPHO_DESIGN.colors.primary};">${data.companyName}</span>
      </div>
      <div class="header-title">Investor Update</div>
      <div class="header-subtitle">${data.period}</div>
      <div class="header-meta">
        <span>Date: ${data.date}</span>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">Highlights</div>
      <div class="highlight-box">
        ${data.highlights.map(h => `<p>• ${h}</p>`).join('')}
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">Key Metrics</div>
      <div class="kpi-grid">
        ${data.metrics.map(metric => `
        <div class="kpi-card">
          <div class="kpi-value">${metric.value}</div>
          <div class="kpi-label">${metric.name}</div>
          ${metric.change ? `<div style="font-size: 11px; color: ${metric.trend === 'up' ? '#059669' : metric.trend === 'down' ? '#DC2626' : '#666666'}; margin-top: 4px;">${metric.change}</div>` : ''}
        </div>
        `).join('')}
      </div>
    </div>
    
    <div class="kpi-grid" style="grid-template-columns: 1fr 1fr;">
      <div class="section">
        <div class="section-title">Achievements</div>
        <div class="section-content">
          ${data.achievements.map(a => `<p>✓ ${a}</p>`).join('')}
        </div>
      </div>
      <div class="section">
        <div class="section-title">Challenges</div>
        <div class="section-content">
          ${data.challenges.map(c => `<p>• ${c}</p>`).join('')}
        </div>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">Outlook</div>
      <div class="section-content">
        <p>${data.outlook}</p>
      </div>
    </div>
    
    ${data.askFromInvestors ? `
    <div class="section">
      <div class="section-title">Ask from Investors</div>
      <div class="highlight-box">
        <p>${data.askFromInvestors}</p>
      </div>
    </div>
    ` : ''}
    
    <div class="footer">
      Confidential | For Investor Use Only
    </div>
  </div>
</body>
</html>`;
}

// =============================================================================
// TEMPLATE: STRATEGIC REVIEW
// =============================================================================

export interface StrategicReviewData {
  title: string;
  date: string;
  preparedBy: string;
  executiveSummary: string;
  currentState: string;
  swotAnalysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  strategicOptions: Array<{
    option: string;
    description: string;
    pros: string[];
    cons: string[];
    recommendation: "recommended" | "consider" | "not_recommended";
  }>;
  recommendation: string;
  implementationTimeline: Array<{
    phase: string;
    timeframe: string;
    actions: string[];
  }>;
}

export function generateStrategicReview(data: StrategicReviewData): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${data.title}</title>
  ${BASE_STYLES}
</head>
<body>
  <div class="document">
    <div class="header">
      <div class="header-logo">
        <span style="font-size: 24px; font-weight: bold; color: ${CEPHO_DESIGN.colors.primary};">CEPHO.Ai</span>
      </div>
      <div class="header-title">${data.title}</div>
      <div class="header-subtitle">Strategic Review</div>
      <div class="header-meta">
        <span>Date: ${data.date}</span>
        <span>Prepared by: ${data.preparedBy}</span>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">Executive Summary</div>
      <div class="highlight-box">
        <p>${data.executiveSummary}</p>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">Current State Assessment</div>
      <div class="section-content">
        <p>${data.currentState}</p>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">SWOT Analysis</div>
      <div class="kpi-grid" style="grid-template-columns: 1fr 1fr;">
        <div class="highlight-box" style="border-left-color: #059669;">
          <p style="font-weight: 600; color: #059669;">Strengths</p>
          ${data.swotAnalysis.strengths.map(s => `<p>• ${s}</p>`).join('')}
        </div>
        <div class="highlight-box" style="border-left-color: #DC2626;">
          <p style="font-weight: 600; color: #DC2626;">Weaknesses</p>
          ${data.swotAnalysis.weaknesses.map(w => `<p>• ${w}</p>`).join('')}
        </div>
        <div class="highlight-box" style="border-left-color: #2563EB;">
          <p style="font-weight: 600; color: #2563EB;">Opportunities</p>
          ${data.swotAnalysis.opportunities.map(o => `<p>• ${o}</p>`).join('')}
        </div>
        <div class="highlight-box" style="border-left-color: #D97706;">
          <p style="font-weight: 600; color: #D97706;">Threats</p>
          ${data.swotAnalysis.threats.map(t => `<p>• ${t}</p>`).join('')}
        </div>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">Strategic Options</div>
      ${data.strategicOptions.map((option, i) => `
      <div class="highlight-box" style="margin-bottom: 16px; border-left-color: ${option.recommendation === 'recommended' ? '#059669' : option.recommendation === 'consider' ? '#D97706' : '#DC2626'};">
        <p style="font-weight: 600;">Option ${i + 1}: ${option.option} <span class="status-badge status-${option.recommendation === 'recommended' ? 'excellent' : option.recommendation === 'consider' ? 'adequate' : 'needs-work'}">${option.recommendation.replace('_', ' ').toUpperCase()}</span></p>
        <p style="margin: 8px 0;">${option.description}</p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 12px;">
          <div>
            <p style="font-weight: 500; color: #059669;">Pros:</p>
            ${option.pros.map(p => `<p style="font-size: 13px;">+ ${p}</p>`).join('')}
          </div>
          <div>
            <p style="font-weight: 500; color: #DC2626;">Cons:</p>
            ${option.cons.map(c => `<p style="font-size: 13px;">- ${c}</p>`).join('')}
          </div>
        </div>
      </div>
      `).join('')}
    </div>
    
    <div class="section">
      <div class="section-title">Recommendation</div>
      <div class="highlight-box">
        <p>${data.recommendation}</p>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">Implementation Timeline</div>
      <table class="table">
        <thead>
          <tr>
            <th>Phase</th>
            <th>Timeframe</th>
            <th>Key Actions</th>
          </tr>
        </thead>
        <tbody>
          ${data.implementationTimeline.map(phase => `
          <tr>
            <td style="font-weight: 600;">${phase.phase}</td>
            <td>${phase.timeframe}</td>
            <td>${phase.actions.join('; ')}</td>
          </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    
    <div class="footer">
      Generated by CEPHO.Ai Strategic Planning | Confidential
    </div>
  </div>
</body>
</html>`;
}

// All functions and constants are exported inline above
