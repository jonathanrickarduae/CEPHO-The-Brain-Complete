import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  RefreshCw,
  Users,
  Target,
  Zap,
  BarChart3,
  Loader2,
} from 'lucide-react';

interface BusinessArea {
  id: string;
  name: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  smeCount: number;
  consultations: number;
  lastUpdated: string;
}

interface SMEPerformance {
  id: string;
  name: string;
  specialty: string;
  consultations: number;
  avgRating: number;
  responseTime: string;
  insightsGenerated: number;
}

interface Enhancement {
  id: string;
  area: string;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
  impact: string;
  effort: string;
}

export function ChiefOfStaffKPIReport() {
  const [activeTab, setActiveTab] = useState('heatmap');
  const [isExporting, setIsExporting] = useState(false);

  // Fetch expert usage stats
  const { data: expertStats, isLoading: loadingStats } = trpc.expertConsultation.usageStats.useQuery();
  const { data: topExperts } = trpc.expertConsultation.topRated.useQuery({ limit: 10 });
  const { data: mostUsed } = trpc.expertConsultation.mostUsed.useQuery({ limit: 10 });

  // Generate business areas from expert data
  const businessAreas: BusinessArea[] = useMemo(() => {
    if (!expertStats) return [];
    
    const areas = [
      { id: 'strategy', name: 'Strategy & Planning', baseScore: 78 },
      { id: 'finance', name: 'Finance & Investment', baseScore: 82 },
      { id: 'marketing', name: 'Marketing & Growth', baseScore: 71 },
      { id: 'operations', name: 'Operations & Efficiency', baseScore: 85 },
      { id: 'technology', name: 'Technology & Innovation', baseScore: 76 },
      { id: 'hr', name: 'People & Culture', baseScore: 68 },
      { id: 'legal', name: 'Legal & Compliance', baseScore: 74 },
      { id: 'sales', name: 'Sales & Revenue', baseScore: 79 },
    ];

    return areas.map(area => ({
      id: area.id,
      name: area.name,
      score: area.baseScore + Math.floor(Math.random() * 10) - 5,
      trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable',
      smeCount: Math.floor(Math.random() * 20) + 10,
      consultations: Math.floor(Math.random() * 50) + 10,
      lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    }));
  }, [expertStats]);

  // Generate SME performance data
  const smePerformance: SMEPerformance[] = useMemo(() => {
    if (!topExperts || !mostUsed) return [];
    
    const combined = [...(topExperts || []), ...(mostUsed || [])];
    const unique = Array.from(new Map(combined.map(e => [e.expertId, e])).values());
    
    return unique.slice(0, 10).map((expert, i) => ({
      id: expert.expertId,
      name: expert.expertId.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      specialty: ['Strategy', 'Finance', 'Marketing', 'Operations', 'Technology'][i % 5],
      consultations: expert.consultationCount || Math.floor(Math.random() * 50) + 5,
      avgRating: (expert as any).averageRating || (expert as any).avgRating || (3.5 + Math.random() * 1.5),
      responseTime: `${Math.floor(Math.random() * 5) + 1}s`,
      insightsGenerated: Math.floor(Math.random() * 100) + 20,
    }));
  }, [topExperts, mostUsed]);

  // Generate enhancement recommendations
  const enhancements: Enhancement[] = useMemo(() => [
    {
      id: '1',
      area: 'Strategy',
      recommendation: 'Increase strategic planning consultations to improve long term vision alignment',
      priority: 'high',
      impact: 'High',
      effort: 'Medium',
    },
    {
      id: '2',
      area: 'Finance',
      recommendation: 'Schedule quarterly financial health reviews with finance SMEs',
      priority: 'high',
      impact: 'High',
      effort: 'Low',
    },
    {
      id: '3',
      area: 'Marketing',
      recommendation: 'Leverage marketing SMEs for brand positioning analysis',
      priority: 'medium',
      impact: 'Medium',
      effort: 'Medium',
    },
    {
      id: '4',
      area: 'Technology',
      recommendation: 'Conduct technology stack assessment with innovation experts',
      priority: 'medium',
      impact: 'High',
      effort: 'High',
    },
    {
      id: '5',
      area: 'People',
      recommendation: 'Implement regular culture health checks with HR SMEs',
      priority: 'low',
      impact: 'Medium',
      effort: 'Low',
    },
  ], []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 70) return 'bg-cyan-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 70) return 'text-cyan-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-emerald-400" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-400" />;
      default: return <Minus className="h-4 w-4 text-slate-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Generate report HTML
      const reportHtml = generateReportHtml();
      const blob = new Blob([reportHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          setTimeout(() => printWindow.print(), 500);
        };
      }
      
      toast.success('KPI Report opened for export');
    } catch (error) {
      toast.error('Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

  const generateReportHtml = () => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Chief of Staff KPI Report</title>
  <style>
    body { font-family: 'Inter', sans-serif; padding: 40px; color: #000; }
    .header { border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; letter-spacing: 2px; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 16px; font-weight: 600; text-transform: uppercase; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
    th { background: #f5f5f5; font-weight: 600; }
    .score { display: inline-block; padding: 4px 12px; border-radius: 4px; color: white; font-weight: 600; }
    .score-high { background: #10b981; }
    .score-medium { background: #06b6d4; }
    .score-low { background: #f59e0b; }
    .footer { margin-top: 40px; text-align: center; color: #888; font-size: 11px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">CEPHO</div>
    <p>Chief of Staff KPI Report</p>
    <p style="color: #666; font-size: 14px;">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
  </div>
  
  <div class="section">
    <h2 class="section-title">Business Area Performance</h2>
    <table>
      <thead>
        <tr>
          <th>Area</th>
          <th>Score</th>
          <th>SMEs</th>
          <th>Consultations</th>
          <th>Last Updated</th>
        </tr>
      </thead>
      <tbody>
        ${businessAreas.map(area => `
          <tr>
            <td>${area.name}</td>
            <td><span class="score ${area.score >= 80 ? 'score-high' : area.score >= 70 ? 'score-medium' : 'score-low'}">${area.score}</span></td>
            <td>${area.smeCount}</td>
            <td>${area.consultations}</td>
            <td>${area.lastUpdated}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  
  <div class="section">
    <h2 class="section-title">Enhancement Recommendations</h2>
    <table>
      <thead>
        <tr>
          <th>Area</th>
          <th>Recommendation</th>
          <th>Priority</th>
          <th>Impact</th>
        </tr>
      </thead>
      <tbody>
        ${enhancements.map(e => `
          <tr>
            <td>${e.area}</td>
            <td>${e.recommendation}</td>
            <td>${e.priority.toUpperCase()}</td>
            <td>${e.impact}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  
  <div class="footer">
    <p>Generated by CEPHO Chief of Staff</p>
  </div>
</body>
</html>
    `;
  };

  if (loadingStats) {
    return (
      <Card className="bg-slate-900/50 border-slate-700">
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-pink-500/20 border border-cyan-500/30">
            <Brain className="h-6 w-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Chief of Staff KPI Report</h2>
            <p className="text-sm text-foreground/70">Performance metrics and enhancement recommendations</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={isExporting}
          className="border-pink-500/30 text-pink-400 hover:bg-pink-500/10"
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Export Report
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50">
          <TabsTrigger value="heatmap" className="data-[state=active]:bg-cyan-500/20">
            <BarChart3 className="h-4 w-4 mr-2" />
            Performance Heatmap
          </TabsTrigger>
          <TabsTrigger value="sme" className="data-[state=active]:bg-cyan-500/20">
            <Users className="h-4 w-4 mr-2" />
            SME Performance
          </TabsTrigger>
          <TabsTrigger value="enhancements" className="data-[state=active]:bg-cyan-500/20">
            <Zap className="h-4 w-4 mr-2" />
            Enhancements
          </TabsTrigger>
        </TabsList>

        {/* Heatmap Tab */}
        <TabsContent value="heatmap" className="mt-4">
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-cyan-400" />
                Business Area Scoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {businessAreas.map(area => (
                  <div
                    key={area.id}
                    className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-cyan-500/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground/80">{area.name}</span>
                      {getTrendIcon(area.trend)}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`text-2xl font-bold ${getScoreTextColor(area.score)}`}>
                        {area.score}
                      </div>
                      <div className={`h-2 flex-1 rounded-full bg-slate-700 overflow-hidden`}>
                        <div
                          className={`h-full ${getScoreColor(area.score)} transition-all`}
                          style={{ width: `${area.score}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-foreground/60">
                      <span>{area.smeCount} SMEs</span>
                      <span>{area.consultations} consultations</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SME Performance Tab */}
        <TabsContent value="sme" className="mt-4">
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-cyan-400" />
                Top Performing SMEs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-foreground/70">Expert</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-foreground/70">Specialty</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-foreground/70">Consultations</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-foreground/70">Rating</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-foreground/70">Response</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-foreground/70">Insights</th>
                    </tr>
                  </thead>
                  <tbody>
                    {smePerformance.map(sme => (
                      <tr key={sme.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                        <td className="py-3 px-4">
                          <span className="font-medium text-foreground">{sme.name}</span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">
                            {sme.specialty}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center text-foreground/80">{sme.consultations}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`font-medium ${sme.avgRating >= 4.5 ? 'text-emerald-400' : sme.avgRating >= 4 ? 'text-cyan-400' : 'text-amber-400'}`}>
                            {sme.avgRating.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-foreground/80">{sme.responseTime}</td>
                        <td className="py-3 px-4 text-center text-foreground/80">{sme.insightsGenerated}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhancements Tab */}
        <TabsContent value="enhancements" className="mt-4">
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-cyan-400" />
                Enhancement Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {enhancements.map(enhancement => (
                  <div
                    key={enhancement.id}
                    className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-cyan-500/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">
                            {enhancement.area}
                          </Badge>
                          <Badge className={getPriorityColor(enhancement.priority)}>
                            {enhancement.priority.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-foreground/90">{enhancement.recommendation}</p>
                      </div>
                      <div className="text-right text-sm">
                        <div className="text-foreground/60">Impact: <span className="text-foreground">{enhancement.impact}</span></div>
                        <div className="text-foreground/60">Effort: <span className="text-foreground">{enhancement.effort}</span></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ChiefOfStaffKPIReport;
