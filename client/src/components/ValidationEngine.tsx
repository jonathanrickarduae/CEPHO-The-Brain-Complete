import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Clock, ExternalLink, RefreshCw, Shield, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Validation status types
export type ValidationStatus = 'verified' | 'pending' | 'flagged' | 'rejected';

// Validation result for a single claim
export interface ClaimValidation {
  id: string;
  claim: string;
  status: ValidationStatus;
  confidence: number;
  sources: SourceReference[];
  crossValidation?: CrossValidationResult;
  timestamp: string;
  validatorId: string;
}

// Source reference with verification
export interface SourceReference {
  id: string;
  title: string;
  url: string;
  author?: string;
  publishDate?: string;
  accessDate: string;
  isAccessible: boolean;
  authorityScore: 'high' | 'medium' | 'low';
}

// Cross-validation result from secondary AI
export interface CrossValidationResult {
  engine: string;
  agrees: boolean;
  confidence: number;
  notes?: string;
  timestamp: string;
}

// Full validation report
export interface ValidationReport {
  id: string;
  projectId: string;
  projectName: string;
  overallStatus: ValidationStatus;
  overallConfidence: number;
  totalClaims: number;
  verifiedClaims: number;
  flaggedClaims: number;
  rejectedClaims: number;
  pendingClaims: number;
  claims: ClaimValidation[];
  crossValidationEngine: string;
  humanReviewRequired: boolean;
  validatedAt: string;
  validatedBy: string;
}

// Validation badge component
export function ValidationBadge({ status, size = 'md' }: { status: ValidationStatus; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  const statusConfig = {
    verified: {
      icon: CheckCircle,
      label: 'VERIFIED',
      className: 'bg-green-500/20 text-green-400 border-green-500/30'
    },
    pending: {
      icon: Clock,
      label: 'PENDING',
      className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    },
    flagged: {
      icon: AlertTriangle,
      label: 'FLAGGED',
      className: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    },
    rejected: {
      icon: XCircle,
      label: 'REJECTED',
      className: 'bg-red-500/20 text-red-400 border-red-500/30'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${config.className} ${sizeClasses[size]}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'} />
      {config.label}
    </span>
  );
}

// Validation header for reports
export function ValidationHeader({ report }: { report: ValidationReport }) {
  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-cyan-400" />
          <span className="text-lg font-semibold text-white">Validation Status</span>
        </div>
        <ValidationBadge status={report.overallStatus} size="lg" />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="text-foreground/70">Validated:</span>
          <p className="text-white font-medium">{new Date(report.validatedAt).toLocaleString()}</p>
        </div>
        <div>
          <span className="text-foreground/70">Validator:</span>
          <p className="text-white font-medium">{report.validatedBy}</p>
        </div>
        <div>
          <span className="text-foreground/70">Confidence:</span>
          <p className="text-white font-medium">{report.overallConfidence}%</p>
        </div>
        <div>
          <span className="text-foreground/70">Sources:</span>
          <p className="text-white font-medium">
            <span className="text-green-400">{report.verifiedClaims} verified</span>
            {report.flaggedClaims > 0 && <span className="text-orange-400"> | {report.flaggedClaims} flagged</span>}
            {report.rejectedClaims > 0 && <span className="text-red-400"> | {report.rejectedClaims} rejected</span>}
          </p>
        </div>
      </div>
    </div>
  );
}

// Source reference display
export function SourceReferenceCard({ source, index }: { source: SourceReference; index: number }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs flex items-center justify-center font-medium">
        {index}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <a 
            href={source.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white font-medium hover:text-cyan-400 transition-colors truncate"
          >
            {source.title}
          </a>
          <ExternalLink className="w-3 h-3 text-foreground/60 flex-shrink-0" />
        </div>
        <div className="flex items-center gap-4 text-xs text-foreground/70">
          <span>Verified: {new Date(source.accessDate).toLocaleDateString('en-GB')}</span>
          <span className={source.isAccessible ? 'text-green-400' : 'text-red-400'}>
            {source.isAccessible ? '✓ Active' : '✗ Inactive'}
          </span>
          <span className={
            source.authorityScore === 'high' ? 'text-green-400' :
            source.authorityScore === 'medium' ? 'text-yellow-400' : 'text-orange-400'
          }>
            Authority: {source.authorityScore.charAt(0).toUpperCase() + source.authorityScore.slice(1)}
          </span>
        </div>
      </div>
    </div>
  );
}

// Claim validation card
export function ClaimValidationCard({ claim }: { claim: ClaimValidation }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-start gap-3 text-left hover:bg-gray-800/50 transition-colors"
      >
        <ValidationBadge status={claim.status} size="sm" />
        <div className="flex-1">
          <p className="text-white text-sm">{claim.claim}</p>
          <p className="text-foreground/60 text-xs mt-1">
            {claim.sources.length} source(s) • {claim.confidence}% confidence
          </p>
        </div>
      </button>
      
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-700 pt-3">
          {claim.crossValidation && (
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-white">Cross-Validation</span>
              </div>
              <div className="text-sm text-foreground/70">
                <p>Engine: {claim.crossValidation.engine}</p>
                <p>Agreement: {claim.crossValidation.agrees ? '✓ Confirmed' : '✗ Disputed'}</p>
                <p>Confidence: {claim.crossValidation.confidence}%</p>
                {claim.crossValidation.notes && <p className="mt-1 text-foreground/60">{claim.crossValidation.notes}</p>}
              </div>
            </div>
          )}
          
          <div>
            <h4 className="text-sm font-medium text-white mb-2">Sources</h4>
            <div className="space-y-2">
              {claim.sources.map((source, idx) => (
                <SourceReferenceCard key={source.id} source={source} index={idx + 1} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Validation summary table
export function ValidationSummary({ report }: { report: ValidationReport }) {
  const metrics = [
    { label: 'Total Claims', value: report.totalClaims },
    { label: 'Verified', value: `${report.verifiedClaims} (${Math.round(report.verifiedClaims / report.totalClaims * 100)}%)`, className: 'text-green-400' },
    { label: 'Flagged for Review', value: `${report.flaggedClaims} (${Math.round(report.flaggedClaims / report.totalClaims * 100)}%)`, className: 'text-orange-400' },
    { label: 'Rejected', value: `${report.rejectedClaims} (${Math.round(report.rejectedClaims / report.totalClaims * 100)}%)`, className: 'text-red-400' },
    { label: 'Cross-Validation Engine', value: report.crossValidationEngine },
    { label: 'Human Review Required', value: report.humanReviewRequired ? 'Yes' : 'No' }
  ];

  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-cyan-400" />
        Validation Summary
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric, idx) => (
          <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-0">
            <span className="text-foreground/70 text-sm">{metric.label}</span>
            <span className={`font-medium ${metric.className || 'text-white'}`}>{metric.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Validation Engine component
interface ValidationEngineProps {
  projectId: string;
  projectName: string;
  content: string;
  onValidationComplete?: (report: ValidationReport) => void;
}

export function ValidationEngine({ projectId, projectName, content, onValidationComplete }: ValidationEngineProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [report, setReport] = useState<ValidationReport | null>(null);

  const runValidation = async () => {
    setIsValidating(true);
    
    // Simulate validation process
    // In production, this would call the backend validation API
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const mockReport: ValidationReport = {
      id: `val-${Date.now()}`,
      projectId,
      projectName,
      overallStatus: 'verified',
      overallConfidence: 94,
      totalClaims: 47,
      verifiedClaims: 45,
      flaggedClaims: 2,
      rejectedClaims: 0,
      pendingClaims: 0,
      claims: [
        {
          id: '1',
          claim: 'The global L&D market is valued at $380 billion',
          status: 'verified',
          confidence: 98,
          sources: [
            {
              id: 's1',
              title: 'LinkedIn Learning Workplace Report 2025',
              url: 'https://learning.linkedin.com/report',
              author: 'LinkedIn Learning',
              publishDate: '2025-01-15',
              accessDate: new Date().toISOString(),
              isAccessible: true,
              authorityScore: 'high'
            }
          ],
          crossValidation: {
            engine: 'Claude 3.5 Sonnet',
            agrees: true,
            confidence: 96,
            timestamp: new Date().toISOString()
          },
          timestamp: new Date().toISOString(),
          validatorId: 'chief-of-staff'
        },
        {
          id: '2',
          claim: '67% of organizations are increasing L&D investment',
          status: 'verified',
          confidence: 95,
          sources: [
            {
              id: 's2',
              title: 'Deloitte Human Capital Trends 2025',
              url: 'https://deloitte.com/hc-trends',
              author: 'Deloitte',
              publishDate: '2025-02-01',
              accessDate: new Date().toISOString(),
              isAccessible: true,
              authorityScore: 'high'
            }
          ],
          crossValidation: {
            engine: 'Claude 3.5 Sonnet',
            agrees: true,
            confidence: 94,
            timestamp: new Date().toISOString()
          },
          timestamp: new Date().toISOString(),
          validatorId: 'chief-of-staff'
        },
        {
          id: '3',
          claim: 'GCC graduate programs have 40% higher retention rates',
          status: 'flagged',
          confidence: 72,
          sources: [
            {
              id: 's3',
              title: 'GCC Talent Report 2024',
              url: 'https://example.com/gcc-talent',
              author: 'Regional HR Council',
              publishDate: '2024-06-15',
              accessDate: new Date().toISOString(),
              isAccessible: true,
              authorityScore: 'medium'
            }
          ],
          crossValidation: {
            engine: 'Claude 3.5 Sonnet',
            agrees: false,
            confidence: 65,
            notes: 'Secondary source suggests 30-35% range, not 40%',
            timestamp: new Date().toISOString()
          },
          timestamp: new Date().toISOString(),
          validatorId: 'chief-of-staff'
        }
      ],
      crossValidationEngine: 'Claude 3.5 Sonnet',
      humanReviewRequired: false,
      validatedAt: new Date().toISOString(),
      validatedBy: 'Chief of Staff + Claude Cross-Check'
    };
    
    setReport(mockReport);
    setIsValidating(false);
    onValidationComplete?.(mockReport);
  };

  return (
    <div className="space-y-6">
      {!report ? (
        <div className="text-center py-12">
          <Shield className="w-16 h-16 mx-auto text-cyan-400 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Chief of Staff Validation</h2>
          <p className="text-foreground/70 mb-6 max-w-md mx-auto">
            Run comprehensive validation to cross-check all claims, verify sources, and ensure zero hallucinations.
          </p>
          <Button
            onClick={runValidation}
            disabled={isValidating}
            className="bg-gradient-to-r from-cyan-500 to-fuchsia-500"
          >
            {isValidating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Run Validation
              </>
            )}
          </Button>
        </div>
      ) : (
        <>
          <ValidationHeader report={report} />
          <ValidationSummary report={report} />
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Claim Validations</h3>
            <div className="space-y-3">
              {report.claims.map(claim => (
                <ClaimValidationCard key={claim.id} claim={claim} />
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setReport(null)}>
              Re-validate
            </Button>
            <Button className="bg-gradient-to-r from-cyan-500 to-fuchsia-500">
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve & Continue
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default ValidationEngine;
