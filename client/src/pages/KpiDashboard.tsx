import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { KPI_CATEGORIES, KPI_DOMAINS, getCategoriesByDomain, getScoreColor, getScoreLabel, type KpiCategory, type KpiDomain } from "@shared/kpiCategories";
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, Filter, Download, RefreshCw } from "lucide-react";

// Mock data for demonstration - in production this would come from tRPC
const generateMockScores = (): Record<string, { score: number; trend: number; lastUpdated: string }> => {
  const scores: Record<string, { score: number; trend: number; lastUpdated: string }> = {};
  KPI_CATEGORIES.forEach((cat) => {
    const baseScore = Math.floor(Math.random() * 60) + 30; // 30-90 range
    scores[cat.id] = {
      score: baseScore,
      trend: Math.floor(Math.random() * 20) - 10, // -10 to +10
      lastUpdated: new Date().toISOString(),
    };
  });
  return scores;
};

const mockScores = generateMockScores();

// Perspective mock data
const perspectives = [
  { id: "cos", name: "Chief of Staff", color: "bg-fuchsia-500" },
  { id: "sme", name: "SME Experts", color: "bg-cyan-500" },
  { id: "customer", name: "Customer Groups", color: "bg-amber-500" },
];

export default function KpiDashboard() {
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [selectedPerspective, setSelectedPerspective] = useState<string>("cos");
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set(KPI_DOMAINS.map(d => d.domain)));
  const [sortBy, setSortBy] = useState<"score" | "trend" | "name">("score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Calculate domain averages
  const domainAverages = useMemo(() => {
    const averages: Record<string, number> = {};
    KPI_DOMAINS.forEach((d) => {
      const categories = getCategoriesByDomain(d.domain);
      const total = categories.reduce((sum, cat) => sum + (mockScores[cat.id]?.score || 0), 0);
      averages[d.domain] = Math.round(total / categories.length);
    });
    return averages;
  }, []);

  // Calculate overall score
  const overallScore = useMemo(() => {
    const total = Object.values(mockScores).reduce((sum, s) => sum + s.score, 0);
    return Math.round(total / Object.keys(mockScores).length);
  }, []);

  // Filter and sort categories
  const filteredCategories = useMemo(() => {
    let categories = selectedDomain === "all" 
      ? KPI_CATEGORIES 
      : getCategoriesByDomain(selectedDomain as KpiDomain);
    
    return [...categories].sort((a, b) => {
      const scoreA = mockScores[a.id]?.score || 0;
      const scoreB = mockScores[b.id]?.score || 0;
      const trendA = mockScores[a.id]?.trend || 0;
      const trendB = mockScores[b.id]?.trend || 0;
      
      let comparison = 0;
      if (sortBy === "score") comparison = scoreA - scoreB;
      else if (sortBy === "trend") comparison = trendA - trendB;
      else comparison = a.name.localeCompare(b.name);
      
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [selectedDomain, sortBy, sortOrder]);

  // Find weak spots (below 50)
  const weakSpots = useMemo(() => {
    return KPI_CATEGORIES.filter(cat => (mockScores[cat.id]?.score || 0) < 50)
      .sort((a, b) => (mockScores[a.id]?.score || 0) - (mockScores[b.id]?.score || 0));
  }, []);

  // Find strong areas (above 80)
  const strongAreas = useMemo(() => {
    return KPI_CATEGORIES.filter(cat => (mockScores[cat.id]?.score || 0) >= 80)
      .sort((a, b) => (mockScores[b.id]?.score || 0) - (mockScores[a.id]?.score || 0));
  }, []);

  const toggleDomain = (domainId: string) => {
    const newExpanded = new Set(expandedDomains);
    if (newExpanded.has(domainId)) {
      newExpanded.delete(domainId);
    } else {
      newExpanded.add(domainId);
    }
    setExpandedDomains(newExpanded);
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 2) return <TrendingUp className="h-4 w-4 text-emerald-500" />;
    if (trend < -2) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-foreground/70" />;
  };

  const renderHeatMapCell = (category: KpiCategory) => {
    const data = mockScores[category.id];
    const score = data?.score || 0;
    const trend = data?.trend || 0;
    const colorClass = getScoreColor(score);
    
    return (
      <div
        key={category.id}
        className={`${colorClass} p-3 rounded-lg cursor-pointer transition-all hover:scale-105 hover:shadow-lg`}
        title={`${category.name}: ${score}/100`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-white/90 truncate max-w-[120px]">
            {category.name}
          </span>
          {getTrendIcon(trend)}
        </div>
        <div className="text-2xl font-bold text-white">{score}</div>
        <div className="text-xs text-white/70">{getScoreLabel(score)}</div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Black Top Banner */}
      <div className="bg-black text-white py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-cyan-500 flex items-center justify-center">
            <span className="text-lg font-bold">C</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">CEPHO</h1>
            <p className="text-xs text-foreground/70">KPI Scorecard</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="border-fuchsia-500 text-fuchsia-400">
            Stage 1: Project Genesis
          </Badge>
          <span className="text-sm text-foreground/70">
            Last updated: {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        {/* Overall Score Card */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="md:col-span-1 bg-gradient-to-br from-fuchsia-900/20 to-cyan-900/20 border-fuchsia-500/30">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-6xl font-bold text-fuchsia-400">{overallScore}</div>
                <div className="text-sm text-muted-foreground mt-2">Overall Score</div>
                <Progress value={overallScore} className="mt-4 h-2" />
                <div className="text-xs text-muted-foreground mt-2">
                  Target: 100% Optimization
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-500">Weak Spots</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {weakSpots.slice(0, 3).map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between text-sm">
                    <span className="truncate max-w-[150px]">{cat.name}</span>
                    <Badge variant="destructive" className="text-xs">
                      {mockScores[cat.id]?.score}
                    </Badge>
                  </div>
                ))}
                {weakSpots.length === 0 && (
                  <p className="text-sm text-muted-foreground">No weak spots detected</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-emerald-500">Strong Areas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {strongAreas.slice(0, 3).map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between text-sm">
                    <span className="truncate max-w-[150px]">{cat.name}</span>
                    <Badge className="bg-emerald-500 text-xs">
                      {mockScores[cat.id]?.score}
                    </Badge>
                  </div>
                ))}
                {strongAreas.length === 0 && (
                  <p className="text-sm text-muted-foreground">Keep improving!</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-2xl font-bold">{KPI_CATEGORIES.length}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{KPI_DOMAINS.length}</div>
                  <div className="text-xs text-muted-foreground">Domains</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-500">{weakSpots.length}</div>
                  <div className="text-xs text-muted-foreground">Below 50</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-500">{strongAreas.length}</div>
                  <div className="text-xs text-muted-foreground">Above 80</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Perspective Tabs */}
        <Tabs value={selectedPerspective} onValueChange={setSelectedPerspective}>
          <div className="flex items-center justify-between">
            <TabsList>
              {perspectives.map((p) => (
                <TabsTrigger key={p.id} value={p.id} className="gap-2">
                  <div className={`w-2 h-2 rounded-full ${p.color}`} />
                  {p.name}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex items-center gap-2">
              <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by domain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Domains</SelectItem>
                  {KPI_DOMAINS.map((domain) => (
                    <SelectItem key={domain.domain} value={domain.domain}>
                      {domain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(v) => setSortBy(v as "score" | "trend" | "name")}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">Score</SelectItem>
                  <SelectItem value="trend">Trend</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              >
                {sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>

              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>

              <Button variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {perspectives.map((perspective) => (
            <TabsContent key={perspective.id} value={perspective.id} className="mt-6">
              {/* Heat Map Grid View */}
              {selectedDomain === "all" ? (
                <div className="space-y-6">
                  {KPI_DOMAINS.map((domain) => {
                    const categories = getCategoriesByDomain(domain.domain);
                    const avgScore = domainAverages[domain.domain];
                    const isExpanded = expandedDomains.has(domain.domain);

                    return (
                      <Card key={domain.domain} className="overflow-hidden">
                        <CardHeader
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => toggleDomain(domain.domain)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <CardTitle className="text-lg">{domain.name}</CardTitle>
                              <Badge variant="outline">{categories.length} categories</Badge>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Avg:</span>
                                <span className={`text-lg font-bold ${avgScore >= 70 ? 'text-emerald-500' : avgScore >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                                  {avgScore}
                                </span>
                              </div>
                              <Progress value={avgScore} className="w-24 h-2" />
                              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                            </div>
                          </div>
                        </CardHeader>
                        {isExpanded && (
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                              {categories.map(renderHeatMapCell)}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {KPI_DOMAINS.find(d => d.domain === selectedDomain)?.name} Categories
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      {filteredCategories.map(renderHeatMapCell)}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Score Legend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Score Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-emerald-500" />
                <span className="text-sm">90-100: Excellent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-emerald-400" />
                <span className="text-sm">80-89: Strong</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-lime-500" />
                <span className="text-sm">70-79: Good</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-yellow-500" />
                <span className="text-sm">60-69: Fair</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-amber-500" />
                <span className="text-sm">50-59: Needs Work</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-orange-500" />
                <span className="text-sm">40-49: Weak</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-red-500" />
                <span className="text-sm">30-39: Critical</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-red-700" />
                <span className="text-sm">0-29: Severe</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
