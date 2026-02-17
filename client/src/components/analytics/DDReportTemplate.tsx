import { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

interface DDReportData {
  companyName: string;
  companyLogo?: string;
  reportType: string;
  author: string;
  date: string;
  preparedFor: string;
  version: string;
  confidentiality: string;
  executiveSummary: string;
  recommendation: 'proceed' | 'proceed_with_caution' | 'do_not_proceed';
  sections: {
    id: string;
    title: string;
    content: string;
    findings: string[];
    risks: { level: 'high' | 'medium' | 'low'; description: string; mitigation?: string }[];
  }[];
  valuation: {
    method: string;
    lowRange: number;
    midRange: number;
    highRange: number;
    currency: string;
  };
  questionsForManagement: string[];
  reviewedBy: { name: string; role: string; date: string }[];
}

interface DDReportTemplateProps {
  data: DDReportData;
  onExport?: (format: 'pdf' | 'word') => void;
}

export function DDReportTemplate({ data, onExport }: DDReportTemplateProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'proceed': return 'text-green-600 bg-green-50';
      case 'proceed_with_caution': return 'text-amber-600 bg-amber-50';
      case 'do_not_proceed': return 'text-red-600 bg-red-50';
      default: return 'text-muted-foreground bg-secondary';
    }
  };

  const getRecommendationText = (rec: string) => {
    switch (rec) {
      case 'proceed': return 'PROCEED';
      case 'proceed_with_caution': return 'PROCEED WITH CAUTION';
      case 'do_not_proceed': return 'DO NOT PROCEED';
      default: return 'UNDER REVIEW';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'high': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'medium': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'low': return <Minus className="w-4 h-4 text-blue-500" />;
      default: return null;
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Export Controls */}
      <div className="fixed top-4 right-4 flex gap-2 z-50 print:hidden">
        <button
          onClick={() => onExport?.('pdf')}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export PDF
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print
        </button>
      </div>

      {/* Report Content */}
      <div className="max-w-[210mm] mx-auto bg-white shadow-lg print:shadow-none">
        
        {/* Cover Page */}
        <div className="min-h-[297mm] p-12 flex flex-col relative page-break-after">
          {/* Header */}
          <div className="flex items-start justify-between mb-16">
            <div className="flex items-center gap-4">
              {data.companyLogo ? (
                <img src={data.companyLogo} alt="Company Logo" className="h-12 w-auto" />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <div className="text-sm text-foreground/60 font-medium">CEPHO</div>
                <div className="text-xs text-foreground/70">Due Diligence Report</div>
              </div>
            </div>
            <div className="text-right text-sm text-foreground/60">
              <div>Version {data.version}</div>
              <div className="text-xs uppercase tracking-wider text-red-600 font-semibold mt-1">
                {data.confidentiality}
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-4xl font-light text-gray-900 mb-4" style={{ fontFamily: 'Calibri, sans-serif' }}>
              Due Diligence Report
            </h1>
            <h2 className="text-5xl font-bold text-gray-900 mb-8" style={{ fontFamily: 'Calibri, sans-serif' }}>
              {data.companyName}
            </h2>
            <div className="text-xl text-muted-foreground" style={{ fontFamily: 'Calibri, sans-serif' }}>
              {data.reportType}
            </div>
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-gray-200">
            <div>
              <div className="text-sm text-foreground/60 mb-1">Prepared For</div>
              <div className="text-gray-900 font-medium" style={{ fontFamily: 'Calibri, sans-serif' }}>
                {data.preparedFor}
              </div>
            </div>
            <div>
              <div className="text-sm text-foreground/60 mb-1">Author</div>
              <div className="text-gray-900 font-medium" style={{ fontFamily: 'Calibri, sans-serif' }}>
                {data.author}
              </div>
            </div>
            <div>
              <div className="text-sm text-foreground/60 mb-1">Date</div>
              <div className="text-gray-900 font-medium" style={{ fontFamily: 'Calibri, sans-serif' }}>
                {data.date}
              </div>
            </div>
            <div>
              <div className="text-sm text-foreground/60 mb-1">Recommendation</div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getRecommendationColor(data.recommendation)}`}>
                {getRecommendationText(data.recommendation)}
              </div>
            </div>
          </div>

          {/* Page Number */}
          <div className="absolute bottom-8 right-12 text-sm text-foreground/70">
            Page 1
          </div>
        </div>

        {/* Table of Contents */}
        <div className="min-h-[297mm] p-12 relative page-break-after">
          <h2 className="text-2xl font-bold text-gray-900 mb-8" style={{ fontFamily: 'Calibri, sans-serif' }}>
            Contents
          </h2>
          
          <div className="space-y-4" style={{ fontFamily: 'Calibri, sans-serif' }}>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-900">1. Executive Summary</span>
              <span className="text-foreground/60">3</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-900">2. Recommendation</span>
              <span className="text-foreground/60">4</span>
            </div>
            {data.sections.map((section, idx) => (
              <div key={section.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-900">{idx + 3}. {section.title}</span>
                <span className="text-foreground/60">{idx + 5}</span>
              </div>
            ))}
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-900">{data.sections.length + 3}. Valuation Analysis</span>
              <span className="text-foreground/60">{data.sections.length + 5}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-900">{data.sections.length + 4}. Risk Register</span>
              <span className="text-foreground/60">{data.sections.length + 6}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-900">{data.sections.length + 5}. Questions for Management</span>
              <span className="text-foreground/60">{data.sections.length + 7}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-900">{data.sections.length + 6}. Sign-off & Approvals</span>
              <span className="text-foreground/60">{data.sections.length + 8}</span>
            </div>
          </div>

          <div className="absolute bottom-8 right-12 text-sm text-foreground/70">
            Page 2
          </div>
        </div>

        {/* Executive Summary */}
        <div className="min-h-[297mm] p-12 relative page-break-after">
          <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Calibri, sans-serif' }}>
            1. Executive Summary
          </h2>
          <div className="w-16 h-1 bg-purple-600 mb-8" />
          
          <div className="prose prose-gray max-w-none" style={{ fontFamily: 'Calibri, sans-serif' }}>
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {data.executiveSummary}
            </p>
          </div>

          {/* Key Metrics Box */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-foreground/60 mb-1">Valuation Range</div>
              <div className="text-xl font-bold text-gray-900">
                {formatCurrency(data.valuation.lowRange, data.valuation.currency)} - {formatCurrency(data.valuation.highRange, data.valuation.currency)}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-foreground/60 mb-1">Key Risks</div>
              <div className="text-xl font-bold text-gray-900">
                {data.sections.reduce((acc, s) => acc + s.risks.filter(r => r.level === 'high').length, 0)} High Priority
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-foreground/60 mb-1">Open Questions</div>
              <div className="text-xl font-bold text-gray-900">
                {data.questionsForManagement.length} Items
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 right-12 text-sm text-foreground/70">
            Page 3
          </div>
        </div>

        {/* Recommendation */}
        <div className="min-h-[297mm] p-12 relative page-break-after">
          <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Calibri, sans-serif' }}>
            2. Recommendation
          </h2>
          <div className="w-16 h-1 bg-purple-600 mb-8" />

          <div className={`p-8 rounded-xl ${getRecommendationColor(data.recommendation)} mb-8`}>
            <div className="flex items-center gap-4">
              {data.recommendation === 'proceed' && <CheckCircle className="w-12 h-12" />}
              {data.recommendation === 'proceed_with_caution' && <AlertTriangle className="w-12 h-12" />}
              {data.recommendation === 'do_not_proceed' && <AlertCircle className="w-12 h-12" />}
              <div>
                <div className="text-3xl font-bold">{getRecommendationText(data.recommendation)}</div>
                <div className="text-lg opacity-80 mt-1">Based on comprehensive due diligence analysis</div>
              </div>
            </div>
          </div>

          <div className="prose prose-gray max-w-none" style={{ fontFamily: 'Calibri, sans-serif' }}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rationale</h3>
            <p className="text-gray-700">
              Based on our analysis of {data.sections.length} key areas, review of documentation, 
              and open-source intelligence gathering, we recommend the above course of action.
            </p>
            
            <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-4">Key Considerations</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Financial performance and projections reviewed</li>
              <li>Legal and compliance status verified</li>
              <li>Operational capabilities assessed</li>
              <li>Market position and competitive landscape analyzed</li>
              <li>Management team evaluated</li>
              <li>Technology and IP reviewed</li>
            </ul>
          </div>

          <div className="absolute bottom-8 right-12 text-sm text-foreground/70">
            Page 4
          </div>
        </div>

        {/* Section Pages */}
        {data.sections.map((section, idx) => (
          <div key={section.id} className="min-h-[297mm] p-12 relative page-break-after">
            <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Calibri, sans-serif' }}>
              {idx + 3}. {section.title}
            </h2>
            <div className="w-16 h-1 bg-purple-600 mb-8" />

            <div className="prose prose-gray max-w-none mb-8" style={{ fontFamily: 'Calibri, sans-serif' }}>
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                {section.content}
              </p>
            </div>

            {section.findings.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Calibri, sans-serif' }}>
                  Key Findings
                </h3>
                <ul className="space-y-2">
                  {section.findings.map((finding, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3 text-gray-700" style={{ fontFamily: 'Calibri, sans-serif' }}>
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {section.risks.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Calibri, sans-serif' }}>
                  Identified Risks
                </h3>
                <div className="space-y-3">
                  {section.risks.map((risk, rIdx) => (
                    <div key={rIdx} className={`p-4 rounded-lg border ${
                      risk.level === 'high' ? 'bg-red-50 border-red-200' :
                      risk.level === 'medium' ? 'bg-amber-50 border-amber-200' :
                      'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {getRiskIcon(risk.level)}
                        <span className={`text-sm font-semibold uppercase ${
                          risk.level === 'high' ? 'text-red-600' :
                          risk.level === 'medium' ? 'text-amber-600' :
                          'text-blue-600'
                        }`}>
                          {risk.level} Risk
                        </span>
                      </div>
                      <p className="text-gray-700" style={{ fontFamily: 'Calibri, sans-serif' }}>{risk.description}</p>
                      {risk.mitigation && (
                        <p className="text-sm text-foreground/60 mt-2" style={{ fontFamily: 'Calibri, sans-serif' }}>
                          <strong>Mitigation:</strong> {risk.mitigation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="absolute bottom-8 right-12 text-sm text-foreground/70">
              Page {idx + 5}
            </div>
          </div>
        ))}

        {/* Valuation */}
        <div className="min-h-[297mm] p-12 relative page-break-after">
          <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Calibri, sans-serif' }}>
            {data.sections.length + 3}. Valuation Analysis
          </h2>
          <div className="w-16 h-1 bg-purple-600 mb-8" />

          <div className="bg-gray-50 rounded-xl p-8 mb-8">
            <div className="text-center mb-8">
              <div className="text-sm text-foreground/60 mb-2">Valuation Range ({data.valuation.method})</div>
              <div className="text-4xl font-bold text-gray-900">
                {formatCurrency(data.valuation.midRange, data.valuation.currency)}
              </div>
              <div className="text-foreground/60 mt-2">
                Range: {formatCurrency(data.valuation.lowRange, data.valuation.currency)} - {formatCurrency(data.valuation.highRange, data.valuation.currency)}
              </div>
            </div>

            <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="absolute h-full bg-gradient-to-r from-red-400 via-amber-400 to-green-400"
                style={{ width: '100%' }}
              />
              <div 
                className="absolute top-0 h-full w-1 bg-gray-900"
                style={{ left: '50%', transform: 'translateX(-50%)' }}
              />
            </div>
            <div className="flex justify-between text-sm text-foreground/60 mt-2">
              <span>Low</span>
              <span>Mid</span>
              <span>High</span>
            </div>
          </div>

          <div className="prose prose-gray max-w-none" style={{ fontFamily: 'Calibri, sans-serif' }}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Methodology</h3>
            <p className="text-gray-700">
              The valuation has been derived using {data.valuation.method} methodology, 
              cross-referenced with comparable transactions and market multiples.
            </p>
          </div>

          <div className="absolute bottom-8 right-12 text-sm text-foreground/70">
            Page {data.sections.length + 5}
          </div>
        </div>

        {/* Questions for Management */}
        <div className="min-h-[297mm] p-12 relative page-break-after">
          <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Calibri, sans-serif' }}>
            {data.sections.length + 5}. Questions for Management
          </h2>
          <div className="w-16 h-1 bg-purple-600 mb-8" />

          <p className="text-foreground/50 mb-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
            The following questions have been identified during the due diligence process 
            and require clarification from the target company's management team.
          </p>

          <div className="space-y-4">
            {data.questionsForManagement.map((question, idx) => (
              <div key={idx} className="flex gap-4 p-4 bg-gray-50 rounded-lg" style={{ fontFamily: 'Calibri, sans-serif' }}>
                <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                  {idx + 1}
                </div>
                <p className="text-gray-700">{question}</p>
              </div>
            ))}
          </div>

          <div className="absolute bottom-8 right-12 text-sm text-foreground/70">
            Page {data.sections.length + 7}
          </div>
        </div>

        {/* Sign-off Page */}
        <div className="min-h-[297mm] p-12 relative">
          <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Calibri, sans-serif' }}>
            {data.sections.length + 6}. Sign-off & Approvals
          </h2>
          <div className="w-16 h-1 bg-purple-600 mb-8" />

          <p className="text-foreground/50 mb-8" style={{ fontFamily: 'Calibri, sans-serif' }}>
            This report has been reviewed and approved by the following AI-SME experts:
          </p>

          <div className="space-y-6">
            {data.reviewedBy.map((reviewer, idx) => (
              <div key={idx} className="flex items-center justify-between p-6 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-semibold text-gray-900" style={{ fontFamily: 'Calibri, sans-serif' }}>
                    {reviewer.name}
                  </div>
                  <div className="text-sm text-foreground/60">{reviewer.role}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-foreground/60">Reviewed</div>
                  <div className="text-gray-900">{reviewer.date}</div>
                </div>
                <div className="w-32 h-12 border-b-2 border-gray-300" />
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-gray-50 rounded-lg">
            <div className="text-sm text-foreground/60 mb-2">Final Approval</div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900" style={{ fontFamily: 'Calibri, sans-serif' }}>
                  Chief of Staff
                </div>
                <div className="text-sm text-foreground/60">Quality Assurance Review</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-foreground/60">Date</div>
                  <div className="text-gray-900">{data.date}</div>
                </div>
                <div className="w-32 h-12 border-b-2 border-gray-300" />
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 right-12 text-sm text-foreground/70">
            Page {data.sections.length + 8}
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .page-break-after {
            page-break-after: always;
          }
          body {
            font-family: 'Calibri', sans-serif;
          }
        }
      `}</style>
    </div>
  );
}

export default DDReportTemplate;
