import { useState, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, Users, Clock, 
  Star, MessageSquare, Video, Award,
  BarChart3, PieChart, Activity, Zap,
  ThumbsUp, ThumbsDown, Target, Brain
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { allExperts, categories, type AIExpert } from '@/data/ai-experts.data';
import { useFavorites } from '@/components/project-management/MyBoard';

interface ExpertInteraction {
  expertId: string;
  type: 'chat' | 'video' | 'warroom';
  duration: number; // minutes
  satisfaction: number; // 1-5
  timestamp: Date;
}

interface ExpertStats {
  expertId: string;
  totalInteractions: number;
  totalMinutes: number;
  avgSatisfaction: number;
  lastInteraction: Date | null;
  trend: 'up' | 'down' | 'stable';
}

export function ExpertAnalytics() {
  const { favorites } = useFavorites();
  
  // Mock interaction data - in production, this would come from the database
  const [interactions] = useState<ExpertInteraction[]>(() => {
    // Generate mock data for demo
    const mockData: ExpertInteraction[] = [];
    const now = new Date();
    
    // Generate interactions for some experts
    allExperts.slice(0, 30).forEach((expert, idx) => {
      const numInteractions = Math.floor(Math.random() * 10) + 1;
      for (let i = 0; i < numInteractions; i++) {
        mockData.push({
          expertId: expert.id,
          type: ['chat', 'video', 'warroom'][Math.floor(Math.random() * 3)] as 'chat' | 'video' | 'warroom',
          duration: Math.floor(Math.random() * 45) + 5,
          satisfaction: Math.floor(Math.random() * 2) + 4, // 4-5 mostly
          timestamp: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Last 30 days
        });
      }
    });
    
    return mockData;
  });

  // Calculate expert stats
  const expertStats = useMemo(() => {
    const stats = new Map<string, ExpertStats>();
    
    interactions.forEach(interaction => {
      const existing = stats.get(interaction.expertId) || {
        expertId: interaction.expertId,
        totalInteractions: 0,
        totalMinutes: 0,
        avgSatisfaction: 0,
        lastInteraction: null,
        trend: 'stable' as const
      };
      
      existing.totalInteractions++;
      existing.totalMinutes += interaction.duration;
      existing.avgSatisfaction = (existing.avgSatisfaction * (existing.totalInteractions - 1) + interaction.satisfaction) / existing.totalInteractions;
      
      if (!existing.lastInteraction || interaction.timestamp > existing.lastInteraction) {
        existing.lastInteraction = interaction.timestamp;
      }
      
      stats.set(interaction.expertId, existing);
    });
    
    // Calculate trends
    stats.forEach((stat, id) => {
      const recentInteractions = interactions.filter(
        i => i.expertId === id && 
        i.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length;
      const olderInteractions = interactions.filter(
        i => i.expertId === id && 
        i.timestamp <= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) &&
        i.timestamp > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      ).length;
      
      if (recentInteractions > olderInteractions) stat.trend = 'up';
      else if (recentInteractions < olderInteractions) stat.trend = 'down';
    });
    
    return Array.from(stats.values()).sort((a, b) => b.totalInteractions - a.totalInteractions);
  }, [interactions]);

  // Top performers
  const topExperts = expertStats.slice(0, 5);

  // Category breakdown
  const categoryStats = useMemo(() => {
    const stats: Record<string, { count: number; minutes: number }> = {};
    
    interactions.forEach(interaction => {
      const expert = allExperts.find(e => e.id === interaction.expertId);
      if (expert) {
        if (!stats[expert.category]) {
          stats[expert.category] = { count: 0, minutes: 0 };
        }
        stats[expert.category].count++;
        stats[expert.category].minutes += interaction.duration;
      }
    });
    
    return Object.entries(stats)
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.count - a.count);
  }, [interactions]);

  // Recommended experts (not yet used but highly rated)
  const recommendedExperts = useMemo(() => {
    const usedExpertIds = new Set(expertStats.map(s => s.expertId));
    return allExperts
      .filter(e => !usedExpertIds.has(e.id))
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .slice(0, 6);
  }, [expertStats]);

  // Overall stats
  const totalInteractions = interactions.length;
  const totalMinutes = interactions.reduce((sum, i) => sum + i.duration, 0);
  const avgSatisfaction = interactions.reduce((sum, i) => sum + i.satisfaction, 0) / interactions.length || 0;
  const uniqueExperts = new Set(interactions.map(i => i.expertId)).size;

  const getExpert = (id: string) => allExperts.find(e => e.id === id);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
          <BarChart3 className="w-8 h-8 text-blue-400" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold">Expert Analytics</h2>
          <p className="text-muted-foreground">Track your expert interactions and performance</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-primary mb-2">
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm font-medium">Total Sessions</span>
            </div>
            <div className="text-3xl font-bold">{totalInteractions}</div>
            <div className="text-xs text-muted-foreground mt-1">Last 30 days</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-500 mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Time Invested</span>
            </div>
            <div className="text-3xl font-bold">{Math.round(totalMinutes / 60)}h</div>
            <div className="text-xs text-muted-foreground mt-1">{totalMinutes} minutes total</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-500 mb-2">
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">Avg Satisfaction</span>
            </div>
            <div className="text-3xl font-bold">{avgSatisfaction.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground mt-1">Out of 5.0</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-purple-500 mb-2">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Experts Used</span>
            </div>
            <div className="text-3xl font-bold">{uniqueExperts}</div>
            <div className="text-xs text-muted-foreground mt-1">of {allExperts.length} available</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card className="bg-card/60 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="w-5 h-5 text-yellow-500" />
              Most Used Experts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topExperts.map((stat, idx) => {
                const expert = getExpert(stat.expertId);
                if (!expert) return null;
                
                return (
                  <div key={stat.expertId} className="flex items-center gap-3">
                    <div className="w-6 text-center font-bold text-muted-foreground">
                      {idx + 1}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg">
                      {expert.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{expert.name}</span>
                        {stat.trend === 'up' && <TrendingUp className="w-3 h-3 text-green-500" />}
                        {stat.trend === 'down' && <TrendingDown className="w-3 h-3 text-red-500" />}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {stat.totalInteractions} sessions • {stat.totalMinutes} min
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">{stat.avgSatisfaction.toFixed(1)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="bg-card/60 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <PieChart className="w-5 h-5 text-blue-500" />
              Category Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryStats.slice(0, 6).map(stat => {
                const maxCount = categoryStats[0]?.count || 1;
                const percentage = (stat.count / maxCount) * 100;
                
                return (
                  <div key={stat.category} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{stat.category}</span>
                      <span className="text-muted-foreground">{stat.count} sessions</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommended Experts */}
      <Card className="bg-card/60 border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="w-5 h-5 text-orange-500" />
            Recommended for You
            <Badge variant="secondary" className="ml-2">New</Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            High-performing experts you haven't tried yet
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {recommendedExperts.map(expert => (
              <div
                key={expert.id}
                className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer text-center"
              >
                <div className="text-3xl mb-2">{expert.avatar}</div>
                <div className="font-medium text-sm truncate">{expert.name}</div>
                <div className="text-xs text-muted-foreground truncate">{expert.specialty}</div>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs">{expert.performanceScore}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Interaction Types */}
      <Card className="bg-card/60 border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="w-5 h-5 text-green-500" />
            Interaction Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {(['chat', 'video', 'warroom'] as const).map(type => {
              const typeInteractions = interactions.filter(i => i.type === type);
              const count = typeInteractions.length;
              const minutes = typeInteractions.reduce((sum, i) => sum + i.duration, 0);
              
              const icons = {
                chat: MessageSquare,
                video: Video,
                warroom: Users
              };
              const Icon = icons[type];
              
              return (
                <div key={type} className="text-center p-4 rounded-lg bg-secondary/30">
                  <Icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm text-muted-foreground capitalize">{type === 'warroom' ? 'War Room' : type} Sessions</div>
                  <div className="text-xs text-muted-foreground mt-1">{minutes} min total</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
