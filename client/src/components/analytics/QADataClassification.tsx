import { useState } from 'react';
import { 
  CheckCircle2, AlertTriangle, HelpCircle, FileQuestion,
  Shield, Link2, Clock, User, ThumbsUp, ThumbsDown,
  Eye, Edit3, RefreshCw, ExternalLink, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export type DataClassification = 
  | 'verified_fact'      // Confirmed with source reference
  | 'estimate'           // Calculated/projected value with methodology
  | 'assumption'         // Reasonable assumption, needs validation
  | 'needs_input'        // Requires user decision/input
  | 'ai_generated'       // AI-generated content, not verified
  | 'user_provided';     // Data provided by user

export interface ClassifiedData {
  id: string;
  content: string;
  classification: DataClassification;
  source?: string;
  sourceUrl?: string;
  confidence: number; // 0-100
  methodology?: string;
  verifiedBy?: 'digital_twin' | 'user' | 'sme' | 'external';
  verifiedAt?: string;
  notes?: string;
}

interface QADataClassificationProps {
  data: ClassifiedData;
  onClassificationChange?: (id: string, newClassification: DataClassification) => void;
  onVerify?: (id: string) => void;
  onRequestSource?: (id: string) => void;
  compact?: boolean;
}

const classificationConfig: Record<DataClassification, {
  label: string;
  icon: typeof CheckCircle2;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}> = {
  verified_fact: {
    label: 'Verified Fact',
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    description: 'Confirmed with source reference'
  },
  estimate: {
    label: 'Estimate',
    icon: AlertTriangle,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    description: 'Calculated value with methodology'
  },
  assumption: {
    label: 'Assumption',
    icon: HelpCircle,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    description: 'Reasonable assumption, needs validation'
  },
  needs_input: {
    label: 'Needs Your Input',
    icon: FileQuestion,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    description: 'Requires your decision'
  },
  ai_generated: {
    label: 'AI Generated',
    icon: RefreshCw,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    description: 'AI-generated, not independently verified'
  },
  user_provided: {
    label: 'User Provided',
    icon: User,
    color: 'text-foreground/70',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/30',
    description: 'Data provided by you'
  }
};

export function QADataClassificationBadge({ 
  classification, 
  confidence,
  compact = false 
}: { 
  classification: DataClassification; 
  confidence?: number;
  compact?: boolean;
}) {
  const config = classificationConfig[classification];
  const Icon = config.icon;
  
  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs ${config.bgColor} ${config.color} ${config.borderColor} border`}>
        <Icon className="w-3 h-3" />
        {confidence !== undefined && <span>{confidence}%</span>}
      </span>
    );
  }
  
  return (
    <Badge variant="outline" className={`${config.bgColor} ${config.color} ${config.borderColor}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
      {confidence !== undefined && <span className="ml-1 opacity-75">({confidence}%)</span>}
    </Badge>
  );
}

export function QADataClassification({ 
  data, 
  onClassificationChange, 
  onVerify,
  onRequestSource,
  compact = false 
}: QADataClassificationProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = classificationConfig[data.classification];
  const Icon = config.icon;
  
  if (compact) {
    return (
      <div className="inline-flex items-center gap-2">
        <QADataClassificationBadge classification={data.classification} confidence={data.confidence} compact />
        {data.source && (
          <a 
            href={data.sourceUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <Link2 className="w-3 h-3" />
            Source
          </a>
        )}
      </div>
    );
  }
  
  return (
    <div className={`p-3 rounded-lg border ${config.borderColor} ${config.bgColor}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Icon className={`w-4 h-4 ${config.color}`} />
            <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
            <span className="text-xs text-muted-foreground">• {data.confidence}% confidence</span>
          </div>
          <p className="text-sm text-foreground">{data.content}</p>
          
          {/* Source Reference */}
          {data.source && (
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <BookOpen className="w-3 h-3" />
              <span>Source: {data.source}</span>
              {data.sourceUrl && (
                <a 
                  href={data.sourceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  View
                </a>
              )}
            </div>
          )}
          
          {/* Methodology for estimates */}
          {data.methodology && (
            <div className="mt-2 text-xs text-muted-foreground">
              <span className="font-medium">Methodology:</span> {data.methodology}
            </div>
          )}
          
          {/* Verification info */}
          {data.verifiedBy && (
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="w-3 h-3" />
              <span>
                Verified by {data.verifiedBy === 'digital_twin' ? 'Chief of Staff' : 
                            data.verifiedBy === 'user' ? 'You' : 
                            data.verifiedBy === 'sme' ? 'SME' : 'External Source'}
              </span>
              {data.verifiedAt && (
                <>
                  <Clock className="w-3 h-3 ml-2" />
                  <span>{data.verifiedAt}</span>
                </>
              )}
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex flex-col gap-1">
          {data.classification !== 'verified_fact' && onVerify && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onVerify(data.id)}
              className="h-7 text-xs"
            >
              <ThumbsUp className="w-3 h-3 mr-1" />
              Verify
            </Button>
          )}
          {!data.source && onRequestSource && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onRequestSource(data.id)}
              className="h-7 text-xs"
            >
              <Link2 className="w-3 h-3 mr-1" />
              Get Source
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// QA Summary Panel - shows overview of data quality in a document/section
interface QASummaryProps {
  items: ClassifiedData[];
  title?: string;
}

export function QASummary({ items, title = 'Data Quality Summary' }: QASummaryProps) {
  const counts = items.reduce((acc, item) => {
    acc[item.classification] = (acc[item.classification] || 0) + 1;
    return acc;
  }, {} as Record<DataClassification, number>);
  
  const avgConfidence = items.length > 0 
    ? Math.round(items.reduce((sum, item) => sum + item.confidence, 0) / items.length)
    : 0;
  
  const verifiedCount = items.filter(i => i.classification === 'verified_fact').length;
  const needsAttention = items.filter(i => 
    i.classification === 'needs_input' || 
    i.classification === 'assumption' ||
    i.confidence < 70
  ).length;
  
  return (
    <div className="p-4 bg-card/50 rounded-xl border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-foreground flex items-center gap-2">
          <Shield className="w-4 h-4 text-purple-400" />
          {title}
        </h4>
        <Badge variant="outline" className={
          avgConfidence >= 80 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
          avgConfidence >= 60 ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
          'bg-red-500/10 text-red-400 border-red-500/30'
        }>
          {avgConfidence}% avg confidence
        </Badge>
      </div>
      
      {/* Classification breakdown */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {(Object.keys(classificationConfig) as DataClassification[]).map(classification => {
          const config = classificationConfig[classification];
          const count = counts[classification] || 0;
          const Icon = config.icon;
          
          return (
            <div 
              key={classification}
              className={`p-2 rounded-lg ${config.bgColor} border ${config.borderColor}`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${config.color}`} />
                <span className="text-lg font-bold text-foreground">{count}</span>
              </div>
              <span className="text-xs text-muted-foreground">{config.label}</span>
            </div>
          );
        })}
      </div>
      
      {/* Status indicators */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-muted-foreground">
            {verifiedCount}/{items.length} verified
          </span>
        </div>
        {needsAttention > 0 && (
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400">
              {needsAttention} need attention
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Financial Data Validator - special component for financial numbers
interface FinancialDataProps {
  value: number;
  label: string;
  classification: DataClassification;
  source?: string;
  methodology?: string;
  currency?: string;
}

export function FinancialDataValidator({ 
  value, 
  label, 
  classification, 
  source, 
  methodology,
  currency = 'USD' 
}: FinancialDataProps) {
  const config = classificationConfig[classification];
  const Icon = config.icon;
  
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };
  
  return (
    <div className={`p-3 rounded-lg border ${config.borderColor} ${config.bgColor}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="flex items-center gap-1">
          <Icon className={`w-3 h-3 ${config.color}`} />
          <span className={`text-xs ${config.color}`}>{config.label}</span>
        </div>
      </div>
      <div className="text-2xl font-bold text-foreground">
        {formatCurrency(value)}
      </div>
      {source && (
        <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
          <Link2 className="w-3 h-3" />
          {source}
        </div>
      )}
      {methodology && classification === 'estimate' && (
        <div className="mt-1 text-xs text-amber-400/80">
          Est: {methodology}
        </div>
      )}
    </div>
  );
}
