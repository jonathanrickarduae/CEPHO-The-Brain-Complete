import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  KPI_CATEGORIES, 
  KPI_DOMAINS, 
  getHeatMapColor, 
  getScoreLabel,
  type KpiDomain 
} from '@shared/kpiCategories';
import { TrendingUp, TrendingDown, Minus, MessageSquare, AlertTriangle, ChevronRight } from 'lucide-react';

export interface CategoryScore {
  categoryId: number;
  score: number;
  previousScore?: number;
  assessorType: 'chief_of_staff' | 'sme_panel' | 'customer_group';
  assessorName?: string;
  rationale?: string;
  timestamp?: Date;
}

export interface ExpertScore {
  expertId: string;
  expertName: string;
  panel: string;
  categoryId: number;
  score: number;
  rationale?: string;
}

export interface KpiHeatMapProps {
  categoryScores: CategoryScore[];
  expertScores?: ExpertScore[];
  customerScores?: CategoryScore[];
  onCellClick?: (categoryId: number, assessorType: string) => void;
  onExpertConversation?: (expertId: string, categoryId: number) => void;
  defaultPerspective?: 'chief_of_staff' | 'sme_experts' | 'customer_groups' | 'comparative';
}

export function KpiHeatMap({
  categoryScores,
  expertScores = [],
  customerScores = [],
  onCellClick,
  onExpertConversation,
  defaultPerspective = 'chief_of_staff'
}: KpiHeatMapProps) {
  const [perspective, setPerspective] = useState(defaultPerspective);
  const [selectedDomain, setSelectedDomain] = useState<KpiDomain | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showOutliersOnly, setShowOutliersOnly] = useState(false);

  const scoresByCategory = useMemo(() => {
    const map = new Map<number, { cos: number; sme: number; customer: number; average: number }>();
    
    KPI_CATEGORIES.forEach(cat => {
      const cosScore = categoryScores.find(s => s.categoryId === cat.id && s.assessorType === 'chief_of_staff')?.score ?? 0;
      const smeScoresForCat = expertScores.filter(s => s.categoryId === cat.id);
      const smeAvg = smeScoresForCat.length > 0 
        ? smeScoresForCat.reduce((sum, s) => sum + s.score, 0) / smeScoresForCat.length 
        : 0;
      const custScore = customerScores.find(s => s.categoryId === cat.id)?.score ?? 0;
      const validScores = [cosScore, smeAvg, custScore].filter(s => s > 0);
      const average = validScores.length > 0 
        ? validScores.reduce((sum, s) => sum + s, 0) / validScores.length 
        : 0;
      
      map.set(cat.id, { cos: cosScore, sme: smeAvg, customer: custScore, average });
    });
    
    return map;
  }, [categoryScores, expertScores, customerScores]);

  const outliers = useMemo(() => {
    const result: { expertId: string; expertName: string; categoryId: number; score: number; average: number; deviation: number }[] = [];
    
    expertScores.forEach(es => {
      const catScores = expertScores.filter(s => s.categoryId === es.categoryId);
      if (catScores.length < 2) return;
      
      const avg = catScores.reduce((sum, s) => sum + s.score, 0) / catScores.length;
      const deviation = Math.abs(es.score - avg);
      
      if (deviation > 20) {
        result.push({
          expertId: es.expertId,
          expertName: es.expertName,
          categoryId: es.categoryId,
          score: es.score,
          average: avg,
          deviation
        });
      }
    });
    
    return result.sort((a, b) => b.deviation - a.deviation);
  }, [expertScores]);

  const filteredCategories = useMemo(() => {
    if (selectedDomain === 'all') return KPI_CATEGORIES;
    return KPI_CATEGORIES.filter(cat => cat.domain === selectedDomain);
  }, [selectedDomain]);

  const getDisplayScore = (categoryId: number): number => {
    const scores = scoresByCategory.get(categoryId);
    if (!scores) return 0;
    
    switch (perspective) {
      case 'chief_of_staff': return scores.cos;
      case 'sme_experts': return scores.sme;
      case 'customer_groups': return scores.customer;
      case 'comparative': return scores.average;
      default: return scores.average;
    }
  };

  const getTrendIndicator = (categoryId: number) => {
    const current = categoryScores.find(s => s.categoryId === categoryId);
    if (!current?.previousScore) return null;
    
    const diff = current.score - current.previousScore;
    if (diff > 5) return <TrendingUp className="w-3 h-3 text-green-500" />;
    if (diff < -5) return <TrendingDown className="w-3 h-3 text-red-500" />;
    return <Minus className="w-3 h-3 text-foreground/70" />;
  };

  const hasOutlier = (categoryId: number) => {
    return outliers.some(o => o.categoryId === categoryId);
  };

  const overallStats = useMemo(() => {
    const scores = Array.from(scoresByCategory.values()).map(s => s.average).filter(s => s > 0);
    if (scores.length === 0) return { average: 0, excellent: 0, critical: 0 };
    
    return {
      average: Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length),
      excellent: scores.filter(s => s >= 90).length,
      critical: scores.filter(s => s < 40).length
    };
  }, [scoresByCategory]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{overallStats.average}%</div>
            <div className="text-sm text-muted-foreground">Overall Score</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-500">{overallStats.excellent}</div>
            <div className="text-sm text-muted-foreground">Excellent (90%+)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-500">{overallStats.critical}</div>
            <div className="text-sm text-muted-foreground">Critical (&lt;40%)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-orange-500">{outliers.length}</div>
            <div className="text-sm text-muted-foreground">Score Outliers</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between gap-4">
        <Tabs value={perspective} onValueChange={(v) => setPerspective(v as typeof perspective)}>
          <TabsList>
            <TabsTrigger value="chief_of_staff">Chief of Staff</TabsTrigger>
            <TabsTrigger value="sme_experts">SME Experts</TabsTrigger>
            <TabsTrigger value="customer_groups">Customer Groups</TabsTrigger>
            <TabsTrigger value="comparative">Comparative</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-4">
          <Select value={selectedDomain} onValueChange={(v) => setSelectedDomain(v as KpiDomain | 'all')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Domains" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Domains</SelectItem>
              {KPI_DOMAINS.map(d => (
                <SelectItem key={d.domain} value={d.domain}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            variant={showOutliersOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowOutliersOnly(!showOutliersOnly)}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Outliers Only
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>KPI Heat Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {KPI_DOMAINS.filter(d => selectedDomain === 'all' || d.domain === selectedDomain).map(domain => {
              const domainCategories = filteredCategories.filter(c => c.domain === domain.domain);
              if (domainCategories.length === 0) return null;
              
              const displayCategories = showOutliersOnly 
                ? domainCategories.filter(c => hasOutlier(c.id))
                : domainCategories;
              
              if (displayCategories.length === 0) return null;

              return (
                <div key={domain.domain}>
                  <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                    {domain.name}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {displayCategories.map(category => {
                      const score = getDisplayScore(category.id);
                      const isSelected = selectedCategory === category.id;
                      const hasOutlierFlag = hasOutlier(category.id);
                      
                      return (
                        <TooltipProvider key={category.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => {
                                  setSelectedCategory(isSelected ? null : category.id);
                                  onCellClick?.(category.id, perspective);
                                }}
                                className={`
                                  relative p-3 rounded-lg text-left transition-all
                                  ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
                                  hover:opacity-90
                                `}
                                style={{ backgroundColor: getHeatMapColor(score) }}
                              >
                                <div className="flex items-start justify-between">
                                  <span className="text-xs font-medium text-white/90 line-clamp-2">
                                    {category.id}. {category.name}
                                  </span>
                                  {hasOutlierFlag && (
                                    <AlertTriangle className="w-3 h-3 text-white flex-shrink-0" />
                                  )}
                                </div>
                                <div className="mt-2 flex items-center justify-between">
                                  <span className="text-lg font-bold text-white">
                                    {Math.round(score)}%
                                  </span>
                                  {getTrendIndicator(category.id)}
                                </div>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="max-w-xs">
                              <div className="space-y-2">
                                <div className="font-semibold">{category.name}</div>
                                <div className="text-xs text-muted-foreground">{category.description}</div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{getScoreLabel(score)}</Badge>
                                  <Badge variant={category.priority === 'critical' ? 'destructive' : 'secondary'}>
                                    {category.priority}
                                  </Badge>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedCategory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{KPI_CATEGORIES.find(c => c.id === selectedCategory)?.name}</span>
              <Button variant="ghost" size="sm" onClick={() => setSelectedCategory(null)}>Close</Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {(['cos', 'sme', 'customer'] as const).map(type => {
                  const scores = scoresByCategory.get(selectedCategory);
                  const score = scores?.[type] ?? 0;
                  const label = type === 'cos' ? 'Chief of Staff' : type === 'sme' ? 'SME Average' : 'Customer Group';
                  
                  return (
                    <div key={type} className="text-center p-4 rounded-lg" style={{ backgroundColor: getHeatMapColor(score) + '20' }}>
                      <div className="text-2xl font-bold" style={{ color: getHeatMapColor(score) }}>
                        {Math.round(score)}%
                      </div>
                      <div className="text-sm text-muted-foreground">{label}</div>
                    </div>
                  );
                })}
              </div>

              {perspective === 'sme_experts' && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Individual Expert Scores</h4>
                  <div className="space-y-2">
                    {expertScores
                      .filter(es => es.categoryId === selectedCategory)
                      .sort((a, b) => b.score - a.score)
                      .map(es => {
                        const isOutlier = outliers.some(o => o.expertId === es.expertId && o.categoryId === es.categoryId);
                        
                        return (
                          <div 
                            key={es.expertId}
                            className={`flex items-center justify-between p-3 rounded-lg border ${isOutlier ? 'border-orange-500 bg-orange-50' : ''}`}
                          >
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                                style={{ backgroundColor: getHeatMapColor(es.score) }}
                              >
                                {es.score}
                              </div>
                              <div>
                                <div className="font-medium">{es.expertName}</div>
                                <div className="text-xs text-muted-foreground">{es.panel}</div>
                              </div>
                              {isOutlier && (
                                <Badge variant="outline" className="text-orange-600 border-orange-600">Outlier</Badge>
                              )}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => onExpertConversation?.(es.expertId, selectedCategory)}
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Discuss
                            </Button>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-semibold">Scoring Criteria</h4>
                <div className="text-sm space-y-1">
                  {(() => {
                    const cat = KPI_CATEGORIES.find(c => c.id === selectedCategory);
                    if (!cat) return null;
                    return (
                      <>
                        <div className="flex gap-2"><span className="text-green-600 font-medium">90-100:</span> {cat.scoringCriteria.excellent}</div>
                        <div className="flex gap-2"><span className="text-lime-600 font-medium">75-89:</span> {cat.scoringCriteria.good}</div>
                        <div className="flex gap-2"><span className="text-yellow-600 font-medium">60-74:</span> {cat.scoringCriteria.adequate}</div>
                        <div className="flex gap-2"><span className="text-orange-600 font-medium">40-59:</span> {cat.scoringCriteria.developing}</div>
                        <div className="flex gap-2"><span className="text-red-600 font-medium">0-39:</span> {cat.scoringCriteria.critical}</div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {outliers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Score Outliers Requiring Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {outliers.slice(0, 10).map((outlier, idx) => {
                const category = KPI_CATEGORIES.find(c => c.id === outlier.categoryId);
                
                return (
                  <div 
                    key={`${outlier.expertId}-${outlier.categoryId}-${idx}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-orange-200 bg-orange-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold" style={{ color: getHeatMapColor(outlier.score) }}>
                          {outlier.score}
                        </div>
                        <div className="text-xs text-muted-foreground">vs avg {Math.round(outlier.average)}</div>
                      </div>
                      <div>
                        <div className="font-medium">{outlier.expertName}</div>
                        <div className="text-sm text-muted-foreground">{category?.name}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-orange-600">
                        {outlier.score > outlier.average ? '+' : ''}{Math.round(outlier.deviation)} deviation
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onExpertConversation?.(outlier.expertId, outlier.categoryId)}
                      >
                        Investigate
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: getHeatMapColor(95) }} />
          <span>Excellent (90+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: getHeatMapColor(80) }} />
          <span>Good (75-89)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: getHeatMapColor(65) }} />
          <span>Adequate (60-74)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: getHeatMapColor(50) }} />
          <span>Developing (40-59)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: getHeatMapColor(30) }} />
          <span>Critical (&lt;40)</span>
        </div>
      </div>
    </div>
  );
}

export default KpiHeatMap;
