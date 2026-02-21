import { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Users, Brain, FileText, 
  Activity, Target, Zap, Clock, CheckCircle2, 
  AlertCircle, BarChart3, PieChart, ArrowUpRight,
  ArrowDownRight, Calendar, Sparkles, Award
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: React.ReactNode;
  trend: 'up' | 'down' | 'neutral';
}

interface ActivityItem {
  id: string;
  type: 'expert_consultation' | 'document_generated' | 'project_created' | 'insight_generated';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
}

export function DashboardEnhanced() {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('week');

  // Real-time metrics (would come from API)
  const metrics: MetricCard[] = [
    {
      title: 'Expert Consultations',
      value: 1247,
      change: 12.5,
      changeLabel: 'vs last week',
      icon: <Users className="w-4 h-4" />,
      trend: 'up',
    },
    {
      title: 'Documents Generated',
      value: 89,
      change: 8.2,
      changeLabel: 'vs last week',
      icon: <FileText className="w-4 h-4" />,
      trend: 'up',
    },
    {
      title: 'Active Projects',
      value: 23,
      change: -3.1,
      changeLabel: 'vs last week',
      icon: <Target className="w-4 h-4" />,
      trend: 'down',
    },
    {
      title: 'Insights Generated',
      value: 456,
      change: 15.8,
      changeLabel: 'vs last week',
      icon: <Sparkles className="w-4 h-4" />,
      trend: 'up',
    },
  ];

  // Recent activity
  const recentActivity: ActivityItem[] = [
    {
      id: '1',
      type: 'expert_consultation',
      title: 'Consulted Victor Sterling',
      description: 'Investment strategy analysis for Q2 2026',
      timestamp: '2 hours ago',
      icon: <Brain className="w-4 h-4 text-blue-500" />,
    },
    {
      id: '2',
      type: 'document_generated',
      title: 'Innovation Brief Generated',
      description: 'AI Integration Opportunities - Q1 2026',
      timestamp: '4 hours ago',
      icon: <FileText className="w-4 h-4 text-green-500" />,
    },
    {
      id: '3',
      type: 'project_created',
      title: 'New Project Created',
      description: 'Customer Portal Redesign Initiative',
      timestamp: '6 hours ago',
      icon: <Target className="w-4 h-4 text-purple-500" />,
    },
    {
      id: '4',
      type: 'insight_generated',
      title: 'Market Insight Generated',
      description: 'Emerging technology trends in fintech',
      timestamp: '8 hours ago',
      icon: <Sparkles className="w-4 h-4 text-amber-500" />,
    },
    {
      id: '5',
      type: 'expert_consultation',
      title: 'Consulted Alexandra Strategy',
      description: 'Corporate strategy positioning review',
      timestamp: '1 day ago',
      icon: <Brain className="w-4 h-4 text-blue-500" />,
    },
  ];

  // Performance metrics
  const performanceMetrics = {
    expertAccuracy: 94,
    responseTime: 87,
    userSatisfaction: 96,
    systemUptime: 99.8,
  };

  // Top performing experts
  const topExperts = [
    { name: 'Victor Sterling', consultations: 67, score: 94 },
    { name: 'Alexandra Strategy', consultations: 67, score: 95 },
    { name: 'Phil Knight', consultations: 67, score: 96 },
    { name: 'Franz Precision', consultations: 42, score: 96 },
    { name: 'Jensen AI', consultations: 37, score: 94 },
  ];

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    if (trend === 'up') return <ArrowUpRight className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <ArrowDownRight className="w-4 h-4 text-red-500" />;
    return null;
  };

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground mt-2">
            Overview of your CEPHO platform activity
          </p>
        </div>
        <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, idx) => (
          <Card key={idx}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg">
                {metric.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center gap-1 mt-1">
                {getTrendIcon(metric.trend)}
                <span className={`text-xs font-medium ${getTrendColor(metric.trend)}`}>
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </span>
                <span className="text-xs text-muted-foreground ml-1">
                  {metric.changeLabel}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              System Performance
            </CardTitle>
            <CardDescription>
              Key performance indicators for the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Expert Accuracy</span>
                <span className="text-muted-foreground">{performanceMetrics.expertAccuracy}%</span>
              </div>
              <Progress value={performanceMetrics.expertAccuracy} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Response Time</span>
                <span className="text-muted-foreground">{performanceMetrics.responseTime}%</span>
              </div>
              <Progress value={performanceMetrics.responseTime} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">User Satisfaction</span>
                <span className="text-muted-foreground">{performanceMetrics.userSatisfaction}%</span>
              </div>
              <Progress value={performanceMetrics.userSatisfaction} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">System Uptime</span>
                <span className="text-muted-foreground">{performanceMetrics.systemUptime}%</span>
              </div>
              <Progress value={performanceMetrics.systemUptime} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Experts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Top Performing Experts
            </CardTitle>
            <CardDescription>
              Most consulted experts this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topExperts.map((expert, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{expert.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {expert.consultations} consultations
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {expert.score}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Your latest interactions and generated content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                <div className="p-2 bg-muted rounded-lg">
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total AI Experts</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">311</div>
            <p className="text-xs text-muted-foreground">
              Across all categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents Library</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">
              Generated documents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Integrations</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14</div>
            <p className="text-xs text-muted-foreground">
              Connected services
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
