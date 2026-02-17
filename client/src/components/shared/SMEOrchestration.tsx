import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, Users, CheckCircle2, XCircle, Loader2, 
  ChevronDown, ChevronUp, MessageSquare, Plus, 
  AlertTriangle, Lightbulb, FileText, ExternalLink
} from 'lucide-react';

interface Expert {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'selected' | 'working' | 'complete' | 'excluded';
  reason?: string;
  insight?: string;
  source?: string;
  confidence?: number;
}

interface OrchestrationProps {
  taskTitle?: string;
  taskDescription?: string;
  onAddExpert?: () => void;
  onAcceptSynthesis?: () => void;
  onChallenge?: (expertId: string) => void;
}

const DEMO_SELECTED_EXPERTS: Expert[] = [
  {
    id: '1',
    name: 'Marcus Chen',
    role: 'Private Equity Partner',
    avatar: '💼',
    status: 'complete',
    insight: 'Deal structure appears standard for this sector. However, the earnout provisions seem aggressive - typically see 20-30% tied to performance, this has 45%.',
    source: 'Industry benchmark data, 2024 PE Report',
    confidence: 87,
  },
  {
    id: '2',
    name: 'Dr. Sarah Mitchell',
    role: 'Energy Sector Analyst',
    avatar: '⚡',
    status: 'complete',
    insight: 'Market growing at 12% CAGR through 2030. Key risk: regulatory changes in EU could impact 40% of projected revenue. Recommend stress-testing against new EU directive.',
    source: 'Bloomberg Energy Outlook, EUR-Lex 2024/1847',
    confidence: 92,
  },
  {
    id: '3',
    name: 'James Okonkwo',
    role: 'Environmental Compliance Expert',
    avatar: '🌱',
    status: 'working',
    insight: 'Reviewing current permits against 2026 EU directive requirements...',
    confidence: 0,
  },
  {
    id: '4',
    name: 'Elena Vasquez',
    role: 'Financial Modeler',
    avatar: '📊',
    status: 'working',
    insight: 'Building DCF model with sensitivity analysis...',
    confidence: 0,
  },
];

const DEMO_EXCLUDED_EXPERTS: Expert[] = [
  {
    id: '5',
    name: 'Dr. Amanda Foster',
    role: 'Healthcare Policy Expert',
    avatar: '🏥',
    status: 'excluded',
    reason: 'Not relevant to energy-from-waste sector analysis',
  },
  {
    id: '6',
    name: 'Ryan Park',
    role: 'Social Media Strategist',
    avatar: '📱',
    status: 'excluded',
    reason: 'Marketing considerations premature at due diligence stage',
  },
];

export function SMEOrchestration({
  taskTitle = "Energy-from-Waste Investment Analysis",
  taskDescription = "Comprehensive due diligence on potential acquisition target",
  onAddExpert,
  onAcceptSynthesis,
  onChallenge,
}: OrchestrationProps) {
  const [selectedExperts, setSelectedExperts] = useState(DEMO_SELECTED_EXPERTS);
  const [excludedExperts] = useState(DEMO_EXCLUDED_EXPERTS);
  const [showExcluded, setShowExcluded] = useState(false);
  const [synthesisReady, setSynthesisReady] = useState(false);

  // Simulate experts completing their work
  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedExperts(prev => {
        const updated = prev.map(expert => {
          if (expert.status === 'working' && Math.random() > 0.7) {
            return {
              ...expert,
              status: 'complete' as const,
              insight: expert.id === '3' 
                ? 'Current permits valid until 2027. New EU directive requires additional certifications by 2026 - estimated compliance cost €2.3M. Recommend factoring into valuation.'
                : 'DCF valuation range: €45-58M. Key sensitivity: discount rate ±1% shifts value by €4M. Terminal growth assumption of 2% appears conservative given sector trends.',
              source: expert.id === '3' ? 'EU Environmental Agency, Company filings' : 'Company financials, Comparable transactions',
              confidence: Math.floor(75 + Math.random() * 20),
            };
          }
          return expert;
        });
        
        // Check if all complete
        if (updated.every(e => e.status === 'complete')) {
          setSynthesisReady(true);
        }
        
        return updated;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const completedCount = selectedExperts.filter(e => e.status === 'complete').length;
  const totalCount = selectedExperts.length;
  const overallProgress = (completedCount / totalCount) * 100;

  return (
    <div className="bg-card/50 border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-cyan-500/10 to-transparent">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{taskTitle}</h3>
              <p className="text-sm text-foreground/70">{taskDescription}</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
            {completedCount}/{totalCount} Experts Complete
          </Badge>
        </div>
        <Progress value={overallProgress} className="h-2" />
      </div>

      {/* Team Assembly Panel */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-foreground/70 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            Selected Experts ({selectedExperts.length})
          </h4>
          <Button variant="ghost" size="sm" onClick={onAddExpert} className="text-cyan-400 hover:text-cyan-300">
            <Plus className="w-4 h-4 mr-1" />
            Add Expert
          </Button>
        </div>

        <div className="space-y-3">
          {selectedExperts.map(expert => (
            <div 
              key={expert.id}
              className={`p-3 rounded-lg border transition-all ${
                expert.status === 'complete' 
                  ? 'bg-green-500/5 border-green-500/30' 
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{expert.avatar}</span>
                  <div>
                    <h5 className="font-medium text-white">{expert.name}</h5>
                    <p className="text-xs text-foreground/70">{expert.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {expert.status === 'working' && (
                    <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Working
                    </Badge>
                  )}
                  {expert.status === 'complete' && (
                    <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Complete
                    </Badge>
                  )}
                  {expert.confidence && expert.confidence > 0 && (
                    <span className="text-xs text-foreground/60">{expert.confidence}% confidence</span>
                  )}
                </div>
              </div>

              {expert.insight && (
                <div className="mt-2 p-2 bg-black/20 rounded-lg">
                  <p className="text-sm text-foreground/80">{expert.insight}</p>
                  {expert.source && (
                    <p className="text-xs text-foreground/60 mt-1 flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      Source: {expert.source}
                    </p>
                  )}
                </div>
              )}

              {expert.status === 'complete' && (
                <div className="mt-2 flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-foreground/70 hover:text-white"
                    onClick={() => onChallenge?.(expert.id)}
                  >
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Challenge
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs text-foreground/70 hover:text-white">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View Sources
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Excluded Experts */}
      <div className="p-4 border-b border-border">
        <button
          onClick={() => setShowExcluded(!showExcluded)}
          className="flex items-center justify-between w-full text-left"
        >
          <h4 className="text-sm font-medium text-foreground/60 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-foreground/60" />
            Considered but Excluded ({excludedExperts.length})
          </h4>
          {showExcluded ? <ChevronUp className="w-4 h-4 text-foreground/60" /> : <ChevronDown className="w-4 h-4 text-foreground/60" />}
        </button>

        {showExcluded && (
          <div className="mt-3 space-y-2">
            {excludedExperts.map(expert => (
              <div key={expert.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-lg opacity-50">{expert.avatar}</span>
                  <div>
                    <p className="text-sm text-foreground/70">{expert.name}</p>
                    <p className="text-xs text-foreground/60">{expert.role}</p>
                  </div>
                </div>
                <p className="text-xs text-foreground/60 max-w-[200px] text-right">{expert.reason}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Synthesis Section */}
      {synthesisReady && (
        <div className="p-4 bg-gradient-to-r from-fuchsia-500/10 to-purple-500/10">
          <div className="flex items-start gap-3 mb-4">
            <Brain className="w-6 h-6 text-fuchsia-400 mt-1" />
            <div>
              <h4 className="font-semibold text-white mb-2">Chief of Staff Synthesis</h4>
              <div className="text-sm text-foreground/80 space-y-2">
                <p>
                  <strong>Assessment:</strong> Based on input from 4 experts, this appears to be a viable investment with manageable risks.
                </p>
                <p>
                  <strong>Key Findings:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 text-foreground/70">
                  <li>Valuation range €45-58M is reasonable given market comparables</li>
                  <li>Earnout structure (45%) is aggressive - recommend negotiating to 30%</li>
                  <li>EU regulatory compliance requires €2.3M investment by 2026</li>
                  <li>Market fundamentals strong (12% CAGR) but regulatory risk material</li>
                </ul>
                <p className="mt-2">
                  <strong>Gap Identified:</strong> Technology due diligence not yet complete. Recommend adding Technical Expert to assess operational efficiency claims.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button className="bg-fuchsia-600 hover:bg-fuchsia-700" onClick={onAcceptSynthesis}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Accept Synthesis
            </Button>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Plus className="w-4 h-4 mr-2" />
              Add Technical Expert
            </Button>
            <Button variant="ghost" className="text-foreground/70 hover:text-white">
              <MessageSquare className="w-4 h-4 mr-2" />
              Deep Dive
            </Button>
          </div>
        </div>
      )}

      {/* Waiting for completion */}
      {!synthesisReady && (
        <div className="p-4 flex items-center justify-center gap-3 text-foreground/70">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Waiting for all experts to complete their analysis...</span>
        </div>
      )}
    </div>
  );
}

export default SMEOrchestration;
