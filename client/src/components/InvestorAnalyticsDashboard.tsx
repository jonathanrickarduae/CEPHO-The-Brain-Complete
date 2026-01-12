import { useState } from 'react';
import { 
  Eye, Clock, Download, TrendingUp, Users, Play, 
  BarChart3, Calendar, ArrowUpRight, ArrowDownRight,
  FileText, Video, Mail, ExternalLink, Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InvestorEngagement {
  id: string;
  investorName: string;
  company: string;
  email: string;
  totalViews: number;
  uniqueVisits: number;
  totalWatchTime: number; // in seconds
  documentsDownloaded: string[];
  videosWatched: { videoId: string; title: string; watchTime: number; completionRate: number }[];
  lastVisit: Date;
  engagementScore: number; // 0-100
  status: 'hot' | 'warm' | 'cold';
}

interface AnalyticsOverview {
  totalViews: number;
  uniqueVisitors: number;
  avgWatchTime: number;
  totalDownloads: number;
  conversionRate: number;
  viewsTrend: number; // percentage change
  engagementTrend: number;
}

// Mock data for demonstration
const mockOverview: AnalyticsOverview = {
  totalViews: 247,
  uniqueVisitors: 89,
  avgWatchTime: 142, // seconds
  totalDownloads: 34,
  conversionRate: 12.4,
  viewsTrend: 23,
  engagementTrend: 15,
};

const mockInvestors: InvestorEngagement[] = [
  {
    id: '1',
    investorName: 'Sarah Chen',
    company: 'Sequoia Capital',
    email: 'schen@sequoia.com',
    totalViews: 12,
    uniqueVisits: 5,
    totalWatchTime: 480,
    documentsDownloaded: ['Pitch Deck', 'Financial Model'],
    videosWatched: [
      { videoId: '1', title: 'Company Overview', watchTime: 120, completionRate: 100 },
      { videoId: '2', title: 'Product Demo', watchTime: 180, completionRate: 85 },
    ],
    lastVisit: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    engagementScore: 92,
    status: 'hot',
  },
  {
    id: '2',
    investorName: 'Michael Roberts',
    company: 'Andreessen Horowitz',
    email: 'mroberts@a16z.com',
    totalViews: 8,
    uniqueVisits: 3,
    totalWatchTime: 320,
    documentsDownloaded: ['Pitch Deck'],
    videosWatched: [
      { videoId: '1', title: 'Company Overview', watchTime: 120, completionRate: 100 },
      { videoId: '3', title: 'Team Introduction', watchTime: 90, completionRate: 75 },
    ],
    lastVisit: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    engagementScore: 78,
    status: 'warm',
  },
  {
    id: '3',
    investorName: 'Emma Thompson',
    company: 'Index Ventures',
    email: 'ethompson@indexventures.com',
    totalViews: 3,
    uniqueVisits: 2,
    totalWatchTime: 90,
    documentsDownloaded: [],
    videosWatched: [
      { videoId: '1', title: 'Company Overview', watchTime: 60, completionRate: 50 },
    ],
    lastVisit: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    engagementScore: 35,
    status: 'cold',
  },
  {
    id: '4',
    investorName: 'David Park',
    company: 'Lightspeed Venture Partners',
    email: 'dpark@lsvp.com',
    totalViews: 15,
    uniqueVisits: 6,
    totalWatchTime: 540,
    documentsDownloaded: ['Pitch Deck', 'Financial Model', 'Market Analysis'],
    videosWatched: [
      { videoId: '1', title: 'Company Overview', watchTime: 120, completionRate: 100 },
      { videoId: '2', title: 'Product Demo', watchTime: 210, completionRate: 100 },
      { videoId: '4', title: 'Traction & Metrics', watchTime: 150, completionRate: 90 },
    ],
    lastVisit: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
    engagementScore: 98,
    status: 'hot',
  },
];

function formatWatchTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function getStatusColor(status: 'hot' | 'warm' | 'cold'): string {
  switch (status) {
    case 'hot': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'warm': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'cold': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  }
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  subtitle 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ComponentType<{ className?: string }>; 
  trend?: number;
  subtitle?: string;
}) {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            {trend !== undefined && (
              <div className={`flex items-center gap-1 text-xs ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(trend)}%
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InvestorRow({ investor }: { investor: InvestorEngagement }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="border-b border-border/50 last:border-0">
      <div 
        className="p-4 hover:bg-white/5 cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-purple-500/30 flex items-center justify-center text-sm font-bold">
              {investor.investorName.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <p className="font-medium">{investor.investorName}</p>
              <p className="text-sm text-muted-foreground">{investor.company}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-sm font-medium">{investor.totalViews}</p>
              <p className="text-xs text-muted-foreground">Views</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">{formatWatchTime(investor.totalWatchTime)}</p>
              <p className="text-xs text-muted-foreground">Watch Time</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">{investor.documentsDownloaded.length}</p>
              <p className="text-xs text-muted-foreground">Downloads</p>
            </div>
            <div className="w-24">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Score</span>
                <span className="text-xs font-medium">{investor.engagementScore}</span>
              </div>
              <Progress value={investor.engagementScore} className="h-1.5" />
            </div>
            <Badge className={getStatusColor(investor.status)}>
              {investor.status.toUpperCase()}
            </Badge>
            <span className="text-xs text-muted-foreground w-16 text-right">
              {formatTimeAgo(investor.lastVisit)}
            </span>
          </div>
        </div>
      </div>
      
      {expanded && (
        <div className="px-4 pb-4 bg-white/5">
          <div className="grid grid-cols-2 gap-6 pt-4">
            {/* Videos Watched */}
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Video className="w-4 h-4 text-primary" />
                Videos Watched
              </h4>
              <div className="space-y-2">
                {investor.videosWatched.map((video) => (
                  <div key={video.videoId} className="flex items-center justify-between p-2 bg-black/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Play className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm">{video.title}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{formatWatchTime(video.watchTime)}</span>
                      <Badge variant="outline" className="text-xs">
                        {video.completionRate}%
                      </Badge>
                    </div>
                  </div>
                ))}
                {investor.videosWatched.length === 0 && (
                  <p className="text-sm text-muted-foreground">No videos watched yet</p>
                )}
              </div>
            </div>
            
            {/* Documents Downloaded */}
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Documents Downloaded
              </h4>
              <div className="space-y-2">
                {investor.documentsDownloaded.map((doc, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-black/20 rounded-lg">
                    <Download className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm">{doc}</span>
                  </div>
                ))}
                {investor.documentsDownloaded.length === 0 && (
                  <p className="text-sm text-muted-foreground">No documents downloaded yet</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/50">
            <Button size="sm" variant="outline" className="gap-2">
              <Mail className="w-4 h-4" />
              Send Follow-up
            </Button>
            <Button size="sm" variant="outline" className="gap-2">
              <Calendar className="w-4 h-4" />
              Schedule Call
            </Button>
            <Button size="sm" variant="ghost" className="gap-2 ml-auto">
              <ExternalLink className="w-4 h-4" />
              View Full Profile
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface InvestorAnalyticsDashboardProps {
  pitchPackId?: string;
}

export default function InvestorAnalyticsDashboard({ pitchPackId }: InvestorAnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState('7d');
  const [statusFilter, setStatusFilter] = useState<'all' | 'hot' | 'warm' | 'cold'>('all');
  
  const filteredInvestors = mockInvestors.filter(inv => 
    statusFilter === 'all' || inv.status === statusFilter
  );
  
  const hotCount = mockInvestors.filter(i => i.status === 'hot').length;
  const warmCount = mockInvestors.filter(i => i.status === 'warm').length;
  const coldCount = mockInvestors.filter(i => i.status === 'cold').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Investor Engagement</h2>
          <p className="text-muted-foreground">Track how investors interact with your pitch materials</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>
      
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          title="Total Views" 
          value={mockOverview.totalViews} 
          icon={Eye}
          trend={mockOverview.viewsTrend}
        />
        <StatCard 
          title="Unique Visitors" 
          value={mockOverview.uniqueVisitors} 
          icon={Users}
          trend={12}
        />
        <StatCard 
          title="Avg. Watch Time" 
          value={formatWatchTime(mockOverview.avgWatchTime)} 
          icon={Clock}
          trend={mockOverview.engagementTrend}
        />
        <StatCard 
          title="Documents Downloaded" 
          value={mockOverview.totalDownloads} 
          icon={Download}
          subtitle={`${mockOverview.conversionRate}% conversion`}
        />
      </div>
      
      {/* Engagement Funnel */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Investor Pipeline
          </CardTitle>
          <CardDescription>Engagement status of all investors who viewed your pitch</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setStatusFilter('hot')}
              className={`flex-1 p-4 rounded-xl border transition-all ${statusFilter === 'hot' ? 'border-red-500 bg-red-500/10' : 'border-border/50 hover:border-red-500/50'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-red-400 font-medium">Hot</span>
                <Badge className="bg-red-500/20 text-red-400">{hotCount}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">High engagement, ready to follow up</p>
            </button>
            
            <button 
              onClick={() => setStatusFilter('warm')}
              className={`flex-1 p-4 rounded-xl border transition-all ${statusFilter === 'warm' ? 'border-amber-500 bg-amber-500/10' : 'border-border/50 hover:border-amber-500/50'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-amber-400 font-medium">Warm</span>
                <Badge className="bg-amber-500/20 text-amber-400">{warmCount}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Moderate interest, nurture needed</p>
            </button>
            
            <button 
              onClick={() => setStatusFilter('cold')}
              className={`flex-1 p-4 rounded-xl border transition-all ${statusFilter === 'cold' ? 'border-blue-500 bg-blue-500/10' : 'border-border/50 hover:border-blue-500/50'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-400 font-medium">Cold</span>
                <Badge className="bg-blue-500/20 text-blue-400">{coldCount}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Low engagement, may need re-approach</p>
            </button>
            
            <button 
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg transition-all ${statusFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-white/5 hover:bg-white/10'}`}
            >
              All
            </button>
          </div>
        </CardContent>
      </Card>
      
      {/* Investor List */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Investor Activity
            </CardTitle>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {filteredInvestors.length} investor{filteredInvestors.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/50">
            {filteredInvestors.map((investor) => (
              <InvestorRow key={investor.id} investor={investor} />
            ))}
            {filteredInvestors.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No investors found matching the selected filter
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
