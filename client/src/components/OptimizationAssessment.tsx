import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  XCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  FileText,
  Plug,
  CreditCard,
  ListTodo,
  Database,
  Sparkles,
  Target,
  DollarSign
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

interface OptimizationCategory {
  name: string;
  score: number;
  maxScore: number;
  percentage: number;
  status: 'excellent' | 'good' | 'needs-attention' | 'critical';
  findings: string[];
  recommendations: string[];
}

interface OptimizationAssessmentData {
  overallScore: number;
  overallPercentage: number;
  overallStatus: 'excellent' | 'good' | 'needs-attention' | 'critical';
  categories: OptimizationCategory[];
  summary: string;
  topPriorities: string[];
  generatedAt: string;
}

const statusConfig = {
  excellent: {
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500/50',
    icon: CheckCircle2,
    label: 'Excellent'
  },
  good: {
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
    borderColor: 'border-cyan-500/50',
    icon: CheckCircle2,
    label: 'Good'
  },
  'needs-attention': {
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/50',
    icon: AlertTriangle,
    label: 'Needs Attention'
  },
  critical: {
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/50',
    icon: XCircle,
    label: 'Critical'
  }
};

const categoryIcons: Record<string, React.ElementType> = {
  'Innovation Pipeline': Lightbulb,
  'Document Management': FileText,
  'Integration Health': Plug,
  'Subscription Optimization': CreditCard,
  'Workflow Management': ListTodo,
  'Data Quality & Engagement': Database,
  'Revenue Infrastructure': DollarSign
};

function ScoreGauge({ percentage, status }: { percentage: number; status: string }) {
  const config = statusConfig[status as keyof typeof statusConfig];
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-gray-800"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={config.color}
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-4xl font-bold", config.color)}>{percentage}%</span>
        <span className="text-xs text-foreground/60 mt-1">Optimized</span>
      </div>
    </div>
  );
}

function CategoryCard({ category, isExpanded, onToggle }: { 
  category: OptimizationCategory; 
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const config = statusConfig[category.status];
  const Icon = categoryIcons[category.name] || Target;
  const StatusIcon = config.icon;
  
  return (
    <div className={cn(
      "border rounded-lg transition-all duration-200",
      config.borderColor,
      "bg-gray-900/50"
    )}>
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", config.bgColor)}>
            <Icon className={cn("w-5 h-5", config.color)} />
          </div>
          <div>
            <h4 className="text-white font-medium">{category.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={category.percentage} className="w-24 h-1.5" />
              <span className={cn("text-sm font-medium", config.color)}>
                {category.percentage}%
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={cn(config.bgColor, config.color, "border-0")}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {config.label}
          </Badge>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-foreground/60" />
          ) : (
            <ChevronDown className="w-5 h-5 text-foreground/60" />
          )}
        </div>
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-800 pt-4">
          {/* Findings */}
          {category.findings.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-foreground/70 mb-2">Findings</h5>
              <ul className="space-y-1">
                {category.findings.map((finding, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                    <CheckCircle2 className="w-4 h-4 text-foreground/60 mt-0.5 shrink-0" />
                    {finding}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Recommendations */}
          {category.recommendations.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-amber-400 mb-2">Recommendations</h5>
              <ul className="space-y-1">
                {category.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                    <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function OptimizationAssessment() {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  const { data: assessment, isLoading, refetch, isFetching } = trpc.optimization.getAssessment.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
  
  const toggleCategory = (name: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };
  
  if (isLoading) {
    return (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center">
            <Brain className="w-12 h-12 text-cyan-400 animate-pulse mb-4" />
            <p className="text-foreground/70">Chief of Staff is analysing your system...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!assessment) {
    return (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center">
            <AlertCircle className="w-12 h-12 text-amber-400 mb-4" />
            <p className="text-foreground/70">Unable to generate assessment</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => refetch()}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const config = statusConfig[assessment.overallStatus];
  
  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <Card className="bg-gray-900/50 border-gray-800 overflow-hidden">
        <div className={cn("absolute top-0 left-0 right-0 h-1", config.bgColor.replace('/20', ''))} />
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", config.bgColor)}>
                <Brain className={cn("w-6 h-6", config.color)} />
              </div>
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  System Optimization Assessment
                  <Badge className={cn(config.bgColor, config.color, "border-0")}>
                    {config.label}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Chief of Staff analysis of your CEPHO.AI configuration
                </CardDescription>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="border-gray-700"
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", isFetching && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            {/* Score Gauge */}
            <div className="flex flex-col items-center justify-center">
              <ScoreGauge percentage={assessment.overallPercentage} status={assessment.overallStatus} />
            </div>
            
            {/* Summary */}
            <div className="col-span-2 space-y-4">
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" />
                  <p className="text-foreground/80 text-sm leading-relaxed">{assessment.summary}</p>
                </div>
              </div>
              
              {/* Top Priorities */}
              {assessment.topPriorities.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-amber-400" />
                    Top Priorities
                  </h4>
                  <ul className="space-y-2">
                    {assessment.topPriorities.slice(0, 3).map((priority, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium shrink-0",
                          i === 0 ? "bg-red-500/20 text-red-400" :
                          i === 1 ? "bg-amber-500/20 text-amber-400" :
                          "bg-cyan-500/20 text-cyan-400"
                        )}>
                          {i + 1}
                        </span>
                        <span className="text-foreground/80">{priority}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Category Breakdown */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Category Breakdown</CardTitle>
          <CardDescription>Detailed analysis of each system component</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {assessment.categories.map((category) => (
            <CategoryCard
              key={category.name}
              category={category}
              isExpanded={expandedCategories.has(category.name)}
              onToggle={() => toggleCategory(category.name)}
            />
          ))}
        </CardContent>
      </Card>
      
      {/* Footer */}
      <p className="text-xs text-foreground/60 text-center">
        Assessment generated at {new Date(assessment.generatedAt).toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </p>
    </div>
  );
}
