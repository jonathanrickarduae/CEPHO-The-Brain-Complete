import { useState } from 'react';
import { 
  Target, TrendingUp, TrendingDown, AlertTriangle,
  Building2, Users, DollarSign, Zap, Globe,
  BarChart3, PieChart, ArrowUpRight, ArrowDownRight,
  RefreshCw, FileText, ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface Competitor {
  id: string;
  name: string;
  logo?: string;
  marketShare: number;
  marketShareChange: number;
  strengths: string[];
  weaknesses: string[];
  recentMoves: string[];
  threatLevel: 'low' | 'medium' | 'high';
}

interface MarketInsight {
  id: string;
  type: 'opportunity' | 'threat' | 'trend';
  title: string;
  description: string;
  source: string;
  confidence: number;
  extractedFrom?: string;
  timestamp: string;
}

interface CompetitivePosition {
  category: string;
  yourScore: number;
  avgCompetitorScore: number;
  leader: string;
}

// Mock data
const MOCK_COMPETITORS: Competitor[] = [
  {
    id: 'c1',
    name: 'TechCorp AI',
    marketShare: 28,
    marketShareChange: 2.3,
    strengths: ['Strong R&D', 'Enterprise clients', 'Brand recognition'],
    weaknesses: ['High pricing', 'Slow innovation', 'Poor UX'],
    recentMoves: ['Acquired startup X', 'Launched new product line', 'Expanded to APAC'],
    threatLevel: 'high'
  },
  {
    id: 'c2',
    name: 'InnovateLabs',
    marketShare: 18,
    marketShareChange: -1.5,
    strengths: ['Innovative features', 'Developer community', 'API-first'],
    weaknesses: ['Limited enterprise features', 'Small team', 'Funding concerns'],
    recentMoves: ['Series B funding', 'New CTO hire', 'Open-sourced core'],
    threatLevel: 'medium'
  },
  {
    id: 'c3',
    name: 'DataMind',
    marketShare: 15,
    marketShareChange: 0.8,
    strengths: ['Data analytics', 'ML capabilities', 'Vertical focus'],
    weaknesses: ['Narrow scope', 'Integration issues', 'Support quality'],
    recentMoves: ['Partnership with cloud provider', 'New pricing model'],
    threatLevel: 'medium'
  }
];

const MOCK_INSIGHTS: MarketInsight[] = [
  {
    id: 'i1',
    type: 'opportunity',
    title: 'Underserved SMB Segment',
    description: 'Analysis of competitor pricing shows a gap in the £500-2000/month range for mid-market companies.',
    source: 'Document Analysis',
    confidence: 85,
    extractedFrom: 'Market_Analysis_Q4.pdf',
    timestamp: '2 hours ago'
  },
  {
    id: 'i2',
    type: 'threat',
    title: 'TechCorp AI Price Reduction',
    description: 'Competitor announced 30% price cut for enterprise tier, potentially impacting our pipeline.',
    source: 'News Monitoring',
    confidence: 95,
    timestamp: '1 day ago'
  },
  {
    id: 'i3',
    type: 'trend',
    title: 'Shift to Vertical AI Solutions',
    description: 'Industry moving towards specialized AI for specific verticals rather than general-purpose tools.',
    source: 'Research Reports',
    confidence: 78,
    extractedFrom: 'Gartner_AI_Trends_2024.pdf',
    timestamp: '3 days ago'
  }
];

const MOCK_POSITIONS: CompetitivePosition[] = [
  { category: 'Product Features', yourScore: 85, avgCompetitorScore: 72, leader: 'You' },
  { category: 'Pricing', yourScore: 70, avgCompetitorScore: 65, leader: 'InnovateLabs' },
  { category: 'Customer Support', yourScore: 90, avgCompetitorScore: 68, leader: 'You' },
  { category: 'Brand Recognition', yourScore: 45, avgCompetitorScore: 75, leader: 'TechCorp AI' },
  { category: 'Integration Ecosystem', yourScore: 60, avgCompetitorScore: 70, leader: 'TechCorp AI' }
];

export function CompetitiveIntelligence() {
  const [competitors] = useState<Competitor[]>(MOCK_COMPETITORS);
  const [insights] = useState<MarketInsight[]>(MOCK_INSIGHTS);
  const [positions] = useState<CompetitivePosition[]>(MOCK_POSITIONS);
  const [activeTab, setActiveTab] = useState<'overview' | 'competitors' | 'insights' | 'position'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return { icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/20' };
      case 'threat': return { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/20' };
      default: return { icon: BarChart3, color: 'text-blue-400', bg: 'bg-blue-500/20' };
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRefreshing(false);
    toast.success('Competitive intelligence updated');
  };

  const totalMarketShare = competitors.reduce((sum, c) => sum + c.marketShare, 0);
  const yourMarketShare = 100 - totalMarketShare; // Implied

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-card/60 border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Competitive Intelligence</h2>
                <p className="text-sm text-muted-foreground">AI-powered market and competitor analysis</p>
              </div>
            </div>
            <Button onClick={handleRefresh} disabled={isRefreshing}>
              {isRefreshing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'overview', label: 'Overview', icon: PieChart },
          { id: 'competitors', label: 'Competitors', icon: Building2 },
          { id: 'insights', label: 'Insights', icon: Zap },
          { id: 'position', label: 'Position', icon: BarChart3 }
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-card/60 border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{yourMarketShare}%</div>
              <div className="text-sm text-muted-foreground">Your Market Share</div>
              <div className="flex items-center justify-center gap-1 mt-1 text-sm text-green-400">
                <ArrowUpRight className="w-3 h-3" />
                +3.2% vs last quarter
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/60 border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{competitors.length}</div>
              <div className="text-sm text-muted-foreground">Tracked Competitors</div>
              <div className="flex items-center justify-center gap-1 mt-1 text-sm text-yellow-400">
                <AlertTriangle className="w-3 h-3" />
                {competitors.filter(c => c.threatLevel === 'high').length} high threat
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/60 border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{insights.length}</div>
              <div className="text-sm text-muted-foreground">Active Insights</div>
              <div className="flex items-center justify-center gap-1 mt-1 text-sm text-green-400">
                {insights.filter(i => i.type === 'opportunity').length} opportunities
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/60 border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">
                {positions.filter(p => p.leader === 'You').length}/{positions.length}
              </div>
              <div className="text-sm text-muted-foreground">Categories Led</div>
              <div className="flex items-center justify-center gap-1 mt-1 text-sm text-blue-400">
                Competitive advantage
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Competitors Tab */}
      {activeTab === 'competitors' && (
        <div className="space-y-3">
          {competitors.map((competitor) => (
            <Card key={competitor.id} className="bg-card/60 border-border">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center text-lg font-bold text-foreground">
                      {competitor.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{competitor.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{competitor.marketShare}% market share</span>
                        <span className={competitor.marketShareChange > 0 ? 'text-green-400' : 'text-red-400'}>
                          {competitor.marketShareChange > 0 ? '+' : ''}{competitor.marketShareChange}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className={getThreatColor(competitor.threatLevel)}>
                    {competitor.threatLevel} threat
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <h4 className="text-xs font-medium text-green-400 mb-1">Strengths</h4>
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                      {competitor.strengths.map((s, i) => (
                        <li key={i}>• {s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-red-400 mb-1">Weaknesses</h4>
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                      {competitor.weaknesses.map((w, i) => (
                        <li key={i}>• {w}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xs font-medium text-foreground mb-1">Recent Moves</h4>
                  <div className="flex flex-wrap gap-1">
                    {competitor.recentMoves.map((move, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {move}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-3">
          {insights.map((insight) => {
            const { icon: InsightIcon, color, bg } = getInsightIcon(insight.type);
            return (
              <Card key={insight.id} className="bg-card/60 border-border">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                      <InsightIcon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-foreground">{insight.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {insight.confidence}% confidence
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{insight.source}</span>
                        {insight.extractedFrom && (
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {insight.extractedFrom}
                          </span>
                        )}
                        <span>{insight.timestamp}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Position Tab */}
      {activeTab === 'position' && (
        <Card className="bg-card/60 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground">Competitive Position Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {positions.map((pos) => (
              <div key={pos.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{pos.category}</span>
                  <Badge variant={pos.leader === 'You' ? 'default' : 'secondary'} className="text-xs">
                    Leader: {pos.leader}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-16">You</span>
                    <Progress value={pos.yourScore} className="flex-1 h-2" />
                    <span className="text-xs font-medium text-foreground w-8">{pos.yourScore}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-16">Avg Comp</span>
                    <Progress value={pos.avgCompetitorScore} className="flex-1 h-2 [&>div]:bg-gray-500" />
                    <span className="text-xs font-medium text-muted-foreground w-8">{pos.avgCompetitorScore}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default CompetitiveIntelligence;
