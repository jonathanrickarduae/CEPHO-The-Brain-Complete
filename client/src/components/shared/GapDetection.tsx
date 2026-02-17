import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle,
  CheckCircle2,
  FileText,
  BarChart3,
  Users,
  DollarSign,
  Target,
  TrendingUp,
  Shield,
  Lightbulb,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type DocumentCategory = 
  | 'financials'
  | 'market_analysis'
  | 'competitive_analysis'
  | 'team_bios'
  | 'product_specs'
  | 'legal_docs'
  | 'customer_data'
  | 'projections'
  | 'risk_assessment'
  | 'go_to_market';

interface UploadedDocument {
  id: string;
  name: string;
  category: DocumentCategory;
  uploadedAt: Date;
}

interface Gap {
  category: DocumentCategory;
  severity: 'critical' | 'important' | 'nice_to_have';
  message: string;
  suggestion: string;
}

const categoryConfig: Record<DocumentCategory, {
  label: string;
  icon: typeof FileText;
  color: string;
  description: string;
}> = {
  financials: {
    label: 'Financials',
    icon: DollarSign,
    color: 'text-green-400',
    description: 'Financial statements, P&L, balance sheet'
  },
  market_analysis: {
    label: 'Market Analysis',
    icon: Target,
    color: 'text-blue-400',
    description: 'TAM/SAM/SOM, market research, trends'
  },
  competitive_analysis: {
    label: 'Competitive Analysis',
    icon: Users,
    color: 'text-purple-400',
    description: 'Competitor landscape, differentiation'
  },
  team_bios: {
    label: 'Team Bios',
    icon: Users,
    color: 'text-amber-400',
    description: 'Founder backgrounds, key hires'
  },
  product_specs: {
    label: 'Product Specs',
    icon: FileText,
    color: 'text-cyan-400',
    description: 'Technical specifications, roadmap'
  },
  legal_docs: {
    label: 'Legal Documents',
    icon: Shield,
    color: 'text-red-400',
    description: 'Incorporation, IP, contracts'
  },
  customer_data: {
    label: 'Customer Data',
    icon: TrendingUp,
    color: 'text-pink-400',
    description: 'Customer metrics, testimonials, case studies'
  },
  projections: {
    label: 'Projections',
    icon: BarChart3,
    color: 'text-emerald-400',
    description: 'Revenue forecasts, growth models'
  },
  risk_assessment: {
    label: 'Risk Assessment',
    icon: AlertTriangle,
    color: 'text-orange-400',
    description: 'Risk factors, mitigation strategies'
  },
  go_to_market: {
    label: 'Go-to-Market',
    icon: Lightbulb,
    color: 'text-yellow-400',
    description: 'GTM strategy, sales plan, marketing'
  }
};

// Define which categories are required for different contexts
const investorDeckRequirements: DocumentCategory[] = [
  'financials', 'market_analysis', 'competitive_analysis', 'team_bios', 'projections'
];

const dueDiligenceRequirements: DocumentCategory[] = [
  'financials', 'legal_docs', 'customer_data', 'team_bios', 'risk_assessment'
];

interface GapDetectionProps {
  documents: UploadedDocument[];
  context?: 'investor_deck' | 'due_diligence' | 'general';
  onAddDocument?: (category: DocumentCategory) => void;
}

export function GapDetection({ documents, context = 'general', onAddDocument }: GapDetectionProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analysis = useMemo(() => {
    const uploadedCategories = new Set(documents.map(d => d.category));
    const requirements = context === 'investor_deck' 
      ? investorDeckRequirements 
      : context === 'due_diligence'
        ? dueDiligenceRequirements
        : Object.keys(categoryConfig) as DocumentCategory[];

    const gaps: Gap[] = [];
    const covered: DocumentCategory[] = [];

    requirements.forEach(category => {
      if (uploadedCategories.has(category)) {
        covered.push(category);
      } else {
        const config = categoryConfig[category];
        let severity: Gap['severity'] = 'nice_to_have';
        let message = `Missing ${config.label.toLowerCase()}`;
        let suggestion = `Upload ${config.description.toLowerCase()}`;

        // Determine severity based on context
        if (context === 'investor_deck') {
          if (['financials', 'market_analysis', 'team_bios'].includes(category)) {
            severity = 'critical';
            message = `Critical: No ${config.label.toLowerCase()} uploaded`;
            suggestion = `Investors will expect ${config.description.toLowerCase()}`;
          } else if (['competitive_analysis', 'projections'].includes(category)) {
            severity = 'important';
          }
        } else if (context === 'due_diligence') {
          if (['financials', 'legal_docs'].includes(category)) {
            severity = 'critical';
            message = `Critical: ${config.label} required for due diligence`;
          } else if (['customer_data', 'risk_assessment'].includes(category)) {
            severity = 'important';
          }
        }

        gaps.push({ category, severity, message, suggestion });
      }
    });

    const completeness = requirements.length > 0 
      ? Math.round((covered.length / requirements.length) * 100)
      : 100;

    return { gaps, covered, completeness, requirements };
  }, [documents, context]);

  const runAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 1000);
  };

  const criticalGaps = analysis.gaps.filter(g => g.severity === 'critical');
  const importantGaps = analysis.gaps.filter(g => g.severity === 'important');
  const niceToHaveGaps = analysis.gaps.filter(g => g.severity === 'nice_to_have');

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Document Gap Analysis
              </CardTitle>
              <CardDescription>
                {context === 'investor_deck' && 'Analyzing for investor pitch deck requirements'}
                {context === 'due_diligence' && 'Analyzing for due diligence requirements'}
                {context === 'general' && 'General document completeness check'}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={runAnalysis} disabled={isAnalyzing}>
              <RefreshCw className={cn('w-4 h-4 mr-2', isAnalyzing && 'animate-spin')} />
              Analyze
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Completeness Score */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Document Completeness</span>
              <span className={cn(
                'font-medium',
                analysis.completeness >= 80 ? 'text-green-400' :
                analysis.completeness >= 50 ? 'text-amber-400' : 'text-red-400'
              )}>
                {analysis.completeness}%
              </span>
            </div>
            <Progress 
              value={analysis.completeness} 
              className={cn(
                'h-2',
                analysis.completeness >= 80 ? '[&>div]:bg-green-500' :
                analysis.completeness >= 50 ? '[&>div]:bg-amber-500' : '[&>div]:bg-red-500'
              )}
            />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-gray-800/50 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-400">{analysis.covered.length}</div>
              <div className="text-xs text-muted-foreground">Covered</div>
            </div>
            <div className="p-3 bg-gray-800/50 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-400">{criticalGaps.length}</div>
              <div className="text-xs text-muted-foreground">Critical Gaps</div>
            </div>
            <div className="p-3 bg-gray-800/50 rounded-lg text-center">
              <div className="text-2xl font-bold text-amber-400">{importantGaps.length}</div>
              <div className="text-xs text-muted-foreground">Important Gaps</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Gaps */}
      {criticalGaps.length > 0 && (
        <Card className="bg-red-500/10 border-red-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-400 text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Critical Gaps ({criticalGaps.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {criticalGaps.map(gap => {
              const config = categoryConfig[gap.category];
              const Icon = config.icon;
              return (
                <div key={gap.category} className="flex items-start gap-3 p-3 bg-gray-900/50 rounded-lg">
                  <Icon className={cn('w-5 h-5 mt-0.5', config.color)} />
                  <div className="flex-1">
                    <p className="text-white font-medium">{gap.message}</p>
                    <p className="text-sm text-muted-foreground mt-1">{gap.suggestion}</p>
                  </div>
                  {onAddDocument && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onAddDocument(gap.category)}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                    >
                      Add
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Important Gaps */}
      {importantGaps.length > 0 && (
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-amber-400 text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Important Gaps ({importantGaps.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {importantGaps.map(gap => {
              const config = categoryConfig[gap.category];
              const Icon = config.icon;
              return (
                <div key={gap.category} className="flex items-start gap-3 p-3 bg-gray-900/50 rounded-lg">
                  <Icon className={cn('w-5 h-5 mt-0.5', config.color)} />
                  <div className="flex-1">
                    <p className="text-white font-medium">{gap.message}</p>
                    <p className="text-sm text-muted-foreground mt-1">{gap.suggestion}</p>
                  </div>
                  {onAddDocument && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onAddDocument(gap.category)}
                    >
                      Add
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Covered Categories */}
      {analysis.covered.length > 0 && (
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-400 text-base flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Covered ({analysis.covered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analysis.covered.map(category => {
                const config = categoryConfig[category];
                const Icon = config.icon;
                return (
                  <Badge 
                    key={category}
                    variant="outline" 
                    className="bg-green-500/10 border-green-500/30 text-green-400"
                  >
                    <Icon className="w-3 h-3 mr-1" />
                    {config.label}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Complete */}
      {analysis.gaps.length === 0 && (
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="py-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <p className="text-green-400 font-medium">All required documents are present</p>
            <p className="text-sm text-muted-foreground mt-1">Your document set is complete for this context</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default GapDetection;
