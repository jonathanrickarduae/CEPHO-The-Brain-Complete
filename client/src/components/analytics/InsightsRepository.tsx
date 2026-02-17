import { useState, useMemo } from 'react';
import { 
  Search, Filter, Tag, Calendar, User, Star, Bookmark,
  TrendingUp, Lightbulb, MessageSquare, FileText, Brain,
  ChevronDown, ChevronRight, ChevronUp, ExternalLink, Copy, Share2,
  ThumbsUp, ThumbsDown, MoreHorizontal, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

// Insight types
export type InsightType = 
  | 'market_trend' 
  | 'competitor_intel' 
  | 'customer_feedback' 
  | 'expert_recommendation' 
  | 'strategic_observation'
  | 'operational_learning'
  | 'risk_signal'
  | 'opportunity';

export type InsightSource = 
  | 'sme_consultation' 
  | 'customer_survey' 
  | 'market_research' 
  | 'internal_analysis'
  | 'chief_of_staff'
  | 'external_report'
  | 'conversation';

export interface Insight {
  id: string;
  title: string;
  content: string;
  type: InsightType;
  source: InsightSource;
  sourceDetail?: string;
  tags: string[];
  category: string;
  confidence: number; // 0-100
  relevanceScore: number; // 0-100
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  isBookmarked: boolean;
  upvotes: number;
  downvotes: number;
  relatedInsights: string[];
  actionItems?: string[];
  expiresAt?: Date;
}

// Mock insights data
const MOCK_INSIGHTS: Insight[] = [
  {
    id: 'ins-1',
    title: 'AI-First Companies Outperforming Traditional Competitors by 3x',
    content: 'Analysis of Q4 2025 data shows companies with AI-native operations achieving 3x revenue growth compared to traditional competitors in the same sectors. Key differentiators include automated decision-making, predictive analytics, and personalized customer experiences.',
    type: 'market_trend',
    source: 'market_research',
    sourceDetail: 'McKinsey Global AI Survey 2025',
    tags: ['AI', 'Growth', 'Competition', 'Strategy'],
    category: 'Market Intelligence',
    confidence: 92,
    relevanceScore: 95,
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-01-15'),
    createdBy: 'Chief of Staff',
    isBookmarked: true,
    upvotes: 12,
    downvotes: 0,
    relatedInsights: ['ins-3', 'ins-5'],
    actionItems: ['Review AI integration roadmap', 'Benchmark against AI-native competitors'],
  },
  {
    id: 'ins-2',
    title: 'Customer Preference Shift Toward Subscription Models',
    content: 'Survey of 500 enterprise customers reveals 78% prefer subscription-based pricing over perpetual licenses. Key drivers: predictable costs, continuous updates, and flexibility to scale.',
    type: 'customer_feedback',
    source: 'customer_survey',
    sourceDetail: 'Q4 2025 Customer Survey',
    tags: ['Pricing', 'Subscription', 'Customer Preference'],
    category: 'Customer Insights',
    confidence: 88,
    relevanceScore: 90,
    createdAt: new Date('2026-01-12'),
    updatedAt: new Date('2026-01-14'),
    createdBy: 'Victoria Stirling',
    isBookmarked: false,
    upvotes: 8,
    downvotes: 1,
    relatedInsights: ['ins-4'],
    actionItems: ['Evaluate subscription tier options', 'Model revenue impact'],
  },
  {
    id: 'ins-3',
    title: 'Regulatory Changes in EU AI Act Impact Assessment',
    content: 'The EU AI Act enforcement timeline has been accelerated. High-risk AI systems must comply by Q3 2026. Recommend immediate audit of AI systems for classification and compliance gaps.',
    type: 'risk_signal',
    source: 'external_report',
    sourceDetail: 'EU Commission Update',
    tags: ['Regulation', 'Compliance', 'EU', 'AI Act'],
    category: 'Regulatory',
    confidence: 95,
    relevanceScore: 88,
    createdAt: new Date('2026-01-10'),
    updatedAt: new Date('2026-01-10'),
    createdBy: 'Chief of Staff',
    isBookmarked: true,
    upvotes: 15,
    downvotes: 0,
    relatedInsights: ['ins-1'],
    actionItems: ['Conduct AI system audit', 'Engage compliance counsel', 'Create remediation timeline'],
  },
  {
    id: 'ins-4',
    title: 'Strategic Partnership Opportunity with CloudScale',
    content: 'CloudScale is actively seeking AI platform partners for their enterprise marketplace. Their customer base of 2,000+ enterprises aligns with our target market. Initial conversations indicate strong interest.',
    type: 'opportunity',
    source: 'sme_consultation',
    sourceDetail: 'Jay-Z (Strategic Partnerships SME)',
    tags: ['Partnership', 'Distribution', 'Enterprise'],
    category: 'Business Development',
    confidence: 75,
    relevanceScore: 92,
    createdAt: new Date('2026-01-08'),
    updatedAt: new Date('2026-01-16'),
    createdBy: 'Jay-Z',
    isBookmarked: true,
    upvotes: 6,
    downvotes: 2,
    relatedInsights: [],
    actionItems: ['Schedule discovery call', 'Prepare partnership proposal', 'Define integration requirements'],
  },
  {
    id: 'ins-5',
    title: 'Competitor X Launching Enterprise AI Assistant',
    content: 'Intelligence indicates Competitor X will announce their enterprise AI assistant at TechSummit 2026 (March). Features overlap with our Chief of Staff offering. Recommend accelerating differentiation strategy.',
    type: 'competitor_intel',
    source: 'internal_analysis',
    tags: ['Competition', 'Product', 'AI Assistant'],
    category: 'Competitive Intelligence',
    confidence: 70,
    relevanceScore: 85,
    createdAt: new Date('2026-01-05'),
    updatedAt: new Date('2026-01-05'),
    createdBy: 'Chief of Staff',
    isBookmarked: false,
    upvotes: 4,
    downvotes: 0,
    relatedInsights: ['ins-1'],
    actionItems: ['Analyze feature comparison', 'Identify unique differentiators', 'Update competitive positioning'],
  },
];

const TYPE_CONFIG: Record<InsightType, { label: string; color: string; icon: React.ReactNode }> = {
  market_trend: { label: 'Market Trend', color: 'bg-blue-500/20 text-blue-400', icon: <TrendingUp className="w-4 h-4" /> },
  competitor_intel: { label: 'Competitor Intel', color: 'bg-red-500/20 text-red-400', icon: <Search className="w-4 h-4" /> },
  customer_feedback: { label: 'Customer Feedback', color: 'bg-green-500/20 text-green-400', icon: <MessageSquare className="w-4 h-4" /> },
  expert_recommendation: { label: 'Expert Recommendation', color: 'bg-purple-500/20 text-purple-400', icon: <Brain className="w-4 h-4" /> },
  strategic_observation: { label: 'Strategic Observation', color: 'bg-orange-500/20 text-orange-400', icon: <Lightbulb className="w-4 h-4" /> },
  operational_learning: { label: 'Operational Learning', color: 'bg-cyan-500/20 text-cyan-400', icon: <FileText className="w-4 h-4" /> },
  risk_signal: { label: 'Risk Signal', color: 'bg-yellow-500/20 text-yellow-400', icon: <TrendingUp className="w-4 h-4" /> },
  opportunity: { label: 'Opportunity', color: 'bg-emerald-500/20 text-emerald-400', icon: <Star className="w-4 h-4" /> },
};

const SOURCE_LABELS: Record<InsightSource, string> = {
  sme_consultation: 'SME Consultation',
  customer_survey: 'Customer Survey',
  market_research: 'Market Research',
  internal_analysis: 'Internal Analysis',
  chief_of_staff: 'Chief of Staff',
  external_report: 'External Report',
  conversation: 'Conversation',
};

export function InsightsRepository() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'confidence'>('relevance');
  const [insights, setInsights] = useState<Insight[]>(MOCK_INSIGHTS);
  const [expandedInsights, setExpandedInsights] = useState<string[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newInsight, setNewInsight] = useState({
    title: '',
    content: '',
    type: 'strategic_observation' as InsightType,
    tags: '',
  });

  // Filter and sort insights
  const filteredInsights = useMemo(() => {
    let result = [...insights];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(query) ||
          i.content.toLowerCase().includes(query) ||
          i.tags.some((t) => t.toLowerCase().includes(query))
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      result = result.filter((i) => i.type === selectedType);
    }

    // Source filter
    if (selectedSource !== 'all') {
      result = result.filter((i) => i.source === selectedSource);
    }

    // Sort
    switch (sortBy) {
      case 'relevance':
        result.sort((a, b) => b.relevanceScore - a.relevanceScore);
        break;
      case 'date':
        result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'confidence':
        result.sort((a, b) => b.confidence - a.confidence);
        break;
    }

    return result;
  }, [insights, searchQuery, selectedType, selectedSource, sortBy]);

  const toggleExpand = (id: string) => {
    setExpandedInsights((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleBookmark = (id: string) => {
    setInsights((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isBookmarked: !i.isBookmarked } : i))
    );
    toast.success('Bookmark updated');
  };

  const handleVote = (id: string, type: 'up' | 'down') => {
    setInsights((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              upvotes: type === 'up' ? i.upvotes + 1 : i.upvotes,
              downvotes: type === 'down' ? i.downvotes + 1 : i.downvotes,
            }
          : i
      )
    );
    toast.success('Vote recorded');
  };

  const handleAddInsight = () => {
    if (!newInsight.title || !newInsight.content) {
      toast.error('Please fill in title and content');
      return;
    }

    const insight: Insight = {
      id: `ins-${Date.now()}`,
      title: newInsight.title,
      content: newInsight.content,
      type: newInsight.type,
      source: 'internal_analysis',
      tags: newInsight.tags.split(',').map((t) => t.trim()).filter(Boolean),
      category: 'User Added',
      confidence: 80,
      relevanceScore: 75,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'You',
      isBookmarked: false,
      upvotes: 0,
      downvotes: 0,
      relatedInsights: [],
    };

    setInsights((prev) => [insight, ...prev]);
    setShowAddDialog(false);
    setNewInsight({ title: '', content: '', type: 'strategic_observation', tags: '' });
    toast.success('Insight added to repository');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  // Stats
  const bookmarkedCount = insights.filter((i) => i.isBookmarked).length;
  const highConfidenceCount = insights.filter((i) => i.confidence >= 85).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-yellow-400" />
            Insights Repository
          </h2>
          <p className="text-muted-foreground mt-1">
            Searchable knowledge base from surveys, SME assessments, and expert conversations
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Insight
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Insight</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Input
                placeholder="Insight title"
                value={newInsight.title}
                onChange={(e) => setNewInsight({ ...newInsight, title: e.target.value })}
              />
              <Textarea
                placeholder="Insight content..."
                value={newInsight.content}
                onChange={(e) => setNewInsight({ ...newInsight, content: e.target.value })}
                rows={4}
              />
              <Select
                value={newInsight.type}
                onValueChange={(v) => setNewInsight({ ...newInsight, type: v as InsightType })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Tags (comma-separated)"
                value={newInsight.tags}
                onChange={(e) => setNewInsight({ ...newInsight, tags: e.target.value })}
              />
              <Button onClick={handleAddInsight} className="w-full">
                Add to Repository
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-card/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <FileText className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{insights.length}</p>
              <p className="text-sm text-muted-foreground">Total Insights</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <Bookmark className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{bookmarkedCount}</p>
              <p className="text-sm text-muted-foreground">Bookmarked</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{highConfidenceCount}</p>
              <p className="text-sm text-muted-foreground">High Confidence</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Brain className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{filteredInsights.length}</p>
              <p className="text-sm text-muted-foreground">Matching Filter</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search insights by title, content, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(TYPE_CONFIG).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedSource} onValueChange={setSelectedSource}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {Object.entries(SOURCE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Relevance</SelectItem>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="confidence">Confidence</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {filteredInsights.map((insight) => {
          const typeConfig = TYPE_CONFIG[insight.type];
          const isExpanded = expandedInsights.includes(insight.id);

          return (
            <Card key={insight.id} className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Type Icon */}
                  <div className={`p-2 rounded-lg ${typeConfig.color}`}>
                    {typeConfig.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-foreground">{insight.title}</h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Badge variant="outline" className={typeConfig.color}>
                            {typeConfig.label}
                          </Badge>
                          <span>•</span>
                          <span>{SOURCE_LABELS[insight.source]}</span>
                          <span>•</span>
                          <span>{insight.createdAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleBookmark(insight.id)}
                          className={insight.isBookmarked ? 'text-yellow-400' : ''}
                        >
                          <Bookmark className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(insight.content)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Preview/Full Content */}
                    <p className={`mt-2 text-muted-foreground ${isExpanded ? '' : 'line-clamp-2'}`}>
                      {insight.content}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {insight.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && insight.actionItems && insight.actionItems.length > 0 && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <h4 className="font-medium text-sm mb-2">Action Items</h4>
                        <ul className="space-y-1">
                          {insight.actionItems.map((item, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                              <ChevronRight className="h-3 w-3" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          Confidence: <span className="text-foreground font-medium">{insight.confidence}%</span>
                        </span>
                        <span className="text-muted-foreground">
                          Relevance: <span className="text-foreground font-medium">{insight.relevanceScore}%</span>
                        </span>
                        <span className="text-muted-foreground">
                          By: <span className="text-foreground">{insight.createdBy}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVote(insight.id, 'up')}
                          className="text-muted-foreground hover:text-green-400"
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          {insight.upvotes}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVote(insight.id, 'down')}
                          className="text-muted-foreground hover:text-red-400"
                        >
                          <ThumbsDown className="h-4 w-4 mr-1" />
                          {insight.downvotes}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpand(insight.id)}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredInsights.length === 0 && (
          <Card className="bg-card/50">
            <CardContent className="p-8 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground">No insights found</h3>
              <p className="text-muted-foreground mt-1">
                Try adjusting your search or filters
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default InsightsRepository;
