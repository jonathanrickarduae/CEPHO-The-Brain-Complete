/**
 * CEPHO.Ai Report Template Component
 * 
 * A reusable template for generating branded reports following
 * CEPHO Design Guidelines v1.0
 * 
 * Features:
 * - Branded header with logo
 * - Executive summary section
 * - Heat map score visualization
 * - SME expert scores with contact details
 * - Print-optimized styling
 */

import React from 'react';
import '../styles/cepho-report.css';

// Score color utility function
export function getScoreClass(score: number): string {
  if (score >= 80) return 'score-excellent';
  if (score >= 70) return 'score-good';
  if (score >= 60) return 'score-satisfactory';
  if (score >= 40) return 'score-attention';
  if (score >= 30) return 'score-critical';
  return 'score-severe';
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Satisfactory';
  if (score >= 40) return 'Needs Attention';
  if (score >= 30) return 'Critical';
  return 'Severe';
}

// Type definitions
export interface SMEExpertScore {
  expertId: string;
  expertName: string;
  specialty: string;
  avatarUrl?: string;
  score: number;
  notes?: string;
}

export interface KPICategory {
  id: string;
  name: string;
  domain: string;
  chiefOfStaffScore: number;
  smeScores: SMEExpertScore[];
  averageScore: number;
  variance: number;
}

export interface ReportMetadata {
  title: string;
  subtitle?: string;
  date: string;
  version: string;
  author?: string;
}

interface CephoReportTemplateProps {
  metadata: ReportMetadata;
  children: React.ReactNode;
}

// Main Report Template
export function CephoReportTemplate({ metadata, children }: CephoReportTemplateProps) {
  const formattedDate = new Date(metadata.date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="cepho-report">
      {/* Report Header */}
      <header className="cepho-report-header">
        <div className="logo-section">
          <img 
            src="/cepho-logo.png" 
            alt="CEPHO.Ai" 
            className="logo"
            onError={(e) => {
              // Fallback to text if logo not found
              e.currentTarget.style.display = 'none';
            }}
          />
          <span style={{ 
            fontWeight: 'bold', 
            fontSize: '24pt', 
            color: '#000',
            fontFamily: 'Calibri, sans-serif'
          }}>
            CEPHO.Ai
          </span>
        </div>
        <div className="document-info">
          <div>{formattedDate}</div>
          <div>Version {metadata.version}</div>
          {metadata.author && <div>Prepared by: {metadata.author}</div>}
        </div>
      </header>

      {/* Document Title */}
      <h1>{metadata.title}</h1>
      {metadata.subtitle && (
        <p className="secondary-text" style={{ marginTop: '-0.5rem', marginBottom: '2rem' }}>
          {metadata.subtitle}
        </p>
      )}

      {/* Report Content */}
      {children}

      {/* Report Footer */}
      <footer className="cepho-report-footer">
        CEPHO.Ai | Confidential | 100% Optimization Framework
      </footer>
    </div>
  );
}

// Executive Summary Component
interface ExecutiveSummaryProps {
  children: React.ReactNode;
}

export function ExecutiveSummary({ children }: ExecutiveSummaryProps) {
  return (
    <div className="executive-summary">
      <h3>Executive Summary</h3>
      {children}
    </div>
  );
}

// Metrics Grid Component
interface MetricCardProps {
  value: string | number;
  label: string;
  highlight?: boolean;
}

export function MetricCard({ value, label, highlight }: MetricCardProps) {
  return (
    <div className="metric-card">
      <div className={`metric-value ${highlight ? 'highlight' : ''}`}>
        {value}
      </div>
      <div className="metric-label">{label}</div>
    </div>
  );
}

interface MetricsGridProps {
  children: React.ReactNode;
}

export function MetricsGrid({ children }: MetricsGridProps) {
  return <div className="metrics-grid">{children}</div>;
}

// KPI Heat Map Table Component
interface KPIHeatMapTableProps {
  categories: KPICategory[];
  showSMEDetails?: boolean;
}

export function KPIHeatMapTable({ categories, showSMEDetails = false }: KPIHeatMapTableProps) {
  return (
    <table>
      <thead>
        <tr>
          <th>Domain</th>
          <th>KPI Category</th>
          <th>Chief of Staff Score</th>
          <th>SME Average</th>
          <th>Variance</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {categories.map((category) => (
          <React.Fragment key={category.id}>
            <tr>
              <td>{category.domain}</td>
              <td>{category.name}</td>
              <td>
                <span className={`score-cell ${getScoreClass(category.chiefOfStaffScore)}`}>
                  {category.chiefOfStaffScore}
                </span>
              </td>
              <td>
                <span className={`score-cell ${getScoreClass(category.averageScore)}`}>
                  {category.averageScore.toFixed(0)}
                </span>
              </td>
              <td style={{ 
                color: Math.abs(category.variance) > 10 ? '#ff006e' : '#666666',
                fontWeight: Math.abs(category.variance) > 10 ? 'bold' : 'normal'
              }}>
                {category.variance > 0 ? '+' : ''}{category.variance.toFixed(1)}
              </td>
              <td>{getScoreLabel(category.averageScore)}</td>
            </tr>
            {showSMEDetails && category.smeScores.length > 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '0.5rem 1rem', backgroundColor: '#fafafa' }}>
                  <SMEScoreBreakdown scores={category.smeScores} />
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
}

// SME Score Breakdown Component
interface SMEScoreBreakdownProps {
  scores: SMEExpertScore[];
}

export function SMEScoreBreakdown({ scores }: SMEScoreBreakdownProps) {
  return (
    <div style={{ fontSize: '9pt' }}>
      <strong style={{ color: '#666' }}>Individual SME Scores:</strong>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
        {scores.map((sme) => (
          <div 
            key={sme.expertId}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '2px 8px',
              backgroundColor: '#fff',
              border: '1px solid #e5e5e5',
              borderRadius: '4px'
            }}
          >
            <span>{sme.expertName}</span>
            <span className={`score-cell ${getScoreClass(sme.score)}`} style={{ fontSize: '9pt', padding: '1px 4px' }}>
              {sme.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// SME Expert Detail Table Component
interface SMEExpertDetailTableProps {
  experts: SMEExpertScore[];
  categoryName: string;
}

export function SMEExpertDetailTable({ experts, categoryName }: SMEExpertDetailTableProps) {
  // Sort by score descending
  const sortedExperts = [...experts].sort((a, b) => b.score - a.score);
  const avgScore = experts.reduce((sum, e) => sum + e.score, 0) / experts.length;

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h4>{categoryName} - SME Expert Scores</h4>
      <p className="secondary-text">
        Average Score: <span className={`score-cell ${getScoreClass(avgScore)}`}>{avgScore.toFixed(0)}</span>
        {' | '}Experts Assessed: {experts.length}
      </p>
      <table>
        <thead>
          <tr>
            <th>Expert Name</th>
            <th>Specialty</th>
            <th>Score</th>
            <th>Variance from Avg</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {sortedExperts.map((expert) => {
            const variance = expert.score - avgScore;
            const isOutlier = Math.abs(variance) > 15;
            return (
              <tr key={expert.expertId}>
                <td>
                  <div className="sme-expert-row" style={{ border: 'none', padding: 0 }}>
                    {expert.avatarUrl && (
                      <img 
                        src={expert.avatarUrl} 
                        alt={expert.expertName}
                        className="expert-avatar"
                        style={{ width: '32px', height: '32px', marginRight: '0.5rem' }}
                      />
                    )}
                    <span className="expert-name">{expert.expertName}</span>
                  </div>
                </td>
                <td className="secondary-text">{expert.specialty}</td>
                <td>
                  <span className={`score-cell ${getScoreClass(expert.score)}`}>
                    {expert.score}
                  </span>
                </td>
                <td style={{ 
                  color: isOutlier ? '#ff006e' : '#666',
                  fontWeight: isOutlier ? 'bold' : 'normal'
                }}>
                  {variance > 0 ? '+' : ''}{variance.toFixed(1)}
                  {isOutlier && ' ⚠️'}
                </td>
                <td className="secondary-text">{expert.notes || '-'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Callout Box Component
interface CalloutProps {
  type: 'info' | 'warning' | 'critical' | 'success';
  title?: string;
  children: React.ReactNode;
}

export function Callout({ type, title, children }: CalloutProps) {
  return (
    <div className={`callout callout-${type}`}>
      {title && <strong>{title}</strong>}
      {children}
    </div>
  );
}

// Section Divider Component
interface SectionDividerProps {
  variant?: 'default' | 'thick' | 'accent';
}

export function SectionDivider({ variant = 'default' }: SectionDividerProps) {
  const className = variant === 'default' ? '' : variant;
  return <hr className={className} />;
}

// Export all components
export default CephoReportTemplate;
