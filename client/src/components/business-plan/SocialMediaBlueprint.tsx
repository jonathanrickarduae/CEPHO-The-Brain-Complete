import { useState } from 'react';
import { 
  Instagram, Youtube, Music2, Linkedin, Twitter, Facebook,
  Target, Calendar, Sparkles, TrendingUp, Clock, Users,
  FileText, Image, Video, Mic, BarChart3, CheckCircle2,
  ChevronRight, ChevronDown, Play, Pause, RefreshCw,
  AlertCircle, Zap, Globe, Hash, Heart, MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PLATFORM_INTELLIGENCE, type PlatformIntelligence, type PostingWindow } from '@/data/platform-intelligence.data';

interface ContentItem {
  id: string;
  type: 'image' | 'video' | 'carousel' | 'story' | 'reel' | 'short' | 'post' | 'article';
  platform: string;
  title: string;
  description: string;
  status: 'draft' | 'scheduled' | 'published' | 'generating';
  scheduledFor?: string;
  engagement?: { likes: number; comments: number; shares: number };
}

interface CampaignGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  unit: string;
}

export function SocialMediaBlueprint() {
  const [activeTab, setActiveTab] = useState<'strategy' | 'platforms' | 'content' | 'schedule' | 'analytics'>('strategy');
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Campaign goals from Project Genesis
  const [campaignGoals] = useState<CampaignGoal[]>([
    { id: 'followers', name: 'Total Followers', target: 100000, current: 12500, unit: 'followers' },
    { id: 'engagement', name: 'Engagement Rate', target: 5, current: 3.2, unit: '%' },
    { id: 'reach', name: 'Monthly Reach', target: 500000, current: 89000, unit: 'impressions' },
    { id: 'conversions', name: 'Website Conversions', target: 1000, current: 234, unit: 'conversions' },
  ]);
  
  // Content queue
  const [contentQueue] = useState<ContentItem[]>([
    { id: '1', type: 'reel', platform: 'instagram', title: 'Behind the Scenes: Product Launch', description: 'Quick 30s tour of our new facility', status: 'scheduled', scheduledFor: '2024-01-15 10:00' },
    { id: '2', type: 'carousel', platform: 'instagram', title: '5 Tips for Entrepreneurs', description: 'Educational carousel with actionable tips', status: 'draft' },
    { id: '3', type: 'video', platform: 'youtube', title: 'Deep Dive: Market Analysis 2024', description: '15-minute analysis video', status: 'generating' },
    { id: '4', type: 'article', platform: 'linkedin', title: 'The Future of AI in Business', description: 'Thought leadership article', status: 'published', engagement: { likes: 234, comments: 45, shares: 67 } },
    { id: '5', type: 'short', platform: 'youtube', title: 'Quick Tip: Productivity Hack', description: '60s vertical video', status: 'scheduled', scheduledFor: '2024-01-16 14:00' },
  ]);
  
  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'from-pink-500 to-purple-500', followers: 5200 },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'from-red-500 to-red-600', followers: 3400 },
    { id: 'tiktok', name: 'TikTok', icon: Music2, color: 'from-black to-gray-800', followers: 8900 },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'from-blue-600 to-blue-700', followers: 2100 },
    { id: 'twitter', name: 'X (Twitter)', icon: Twitter, color: 'from-gray-800 to-black', followers: 1800 },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'from-blue-500 to-blue-600', followers: 4200 },
  ];
  
  const getPlatformIntel = (platformId: string): PlatformIntelligence | undefined => {
    return PLATFORM_INTELLIGENCE.find(p => p.id === platformId);
  };
  
  const handleGenerateContent = async () => {
    setIsGenerating(true);
    // Simulate content generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsGenerating(false);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'scheduled': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'generating': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-foreground/70 border-gray-500/30';
    }
  };
  
  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'image': case 'carousel': return Image;
      case 'video': case 'reel': case 'short': return Video;
      case 'article': case 'post': return FileText;
      default: return FileText;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Social Media Blueprint</h2>
          <p className="text-sm text-muted-foreground mt-1">
            End-to-end social media strategy powered by Project Genesis
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Linked to Genesis
          </Badge>
          <Button 
            onClick={handleGenerateContent}
            disabled={isGenerating}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Content
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-card/50 rounded-lg border border-white/10">
        {[
          { id: 'strategy', label: 'Strategy', icon: Target },
          { id: 'platforms', label: 'Platforms', icon: Globe },
          { id: 'content', label: 'Content Factory', icon: Sparkles },
          { id: 'schedule', label: 'Schedule', icon: Calendar },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-foreground border border-purple-500/30'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Strategy Tab */}
      {activeTab === 'strategy' && (
        <div className="space-y-6">
          {/* Campaign Goals */}
          <div className="p-4 bg-card/50 rounded-xl border border-white/10">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              Campaign Goals (from Project Genesis)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {campaignGoals.map(goal => (
                <div key={goal.id} className="p-4 bg-black/20 rounded-lg border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{goal.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {Math.round((goal.current / goal.target) * 100)}%
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-2">
                    {goal.current.toLocaleString()} <span className="text-sm text-muted-foreground">/ {goal.target.toLocaleString()} {goal.unit}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                      style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Strategy Overview */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-card/50 rounded-xl border border-white/10">
              <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                Target Audience
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Entrepreneurs & Founders (25-45)</li>
                <li>• Tech-savvy professionals</li>
                <li>• Decision makers in SMBs</li>
                <li>• Innovation-focused executives</li>
              </ul>
            </div>
            <div className="p-4 bg-card/50 rounded-xl border border-white/10">
              <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <Hash className="w-4 h-4 text-pink-400" />
                Content Pillars
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Thought Leadership (40%)</li>
                <li>• Educational Content (30%)</li>
                <li>• Behind the Scenes (15%)</li>
                <li>• Community & Engagement (15%)</li>
              </ul>
            </div>
            <div className="p-4 bg-card/50 rounded-xl border border-white/10">
              <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Key Metrics
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Engagement Rate: 3.2% → 5%</li>
                <li>• Follower Growth: +15%/month</li>
                <li>• Click-through Rate: 2.5%</li>
                <li>• Share of Voice: 12%</li>
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* Platforms Tab */}
      {activeTab === 'platforms' && (
        <div className="space-y-4">
          {platforms.map(platform => {
            const intel = getPlatformIntel(platform.id);
            const isExpanded = expandedPlatform === platform.id;
            const Icon = platform.icon;
            
            return (
              <div key={platform.id} className="bg-card/50 rounded-xl border border-white/10 overflow-hidden">
                <button
                  onClick={() => setExpandedPlatform(isExpanded ? null : platform.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-foreground">{platform.name}</h4>
                      <p className="text-sm text-muted-foreground">{platform.followers.toLocaleString()} followers</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {intel && (
                      <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">
                        Algorithm Intel Available
                      </Badge>
                    )}
                    {isExpanded ? <ChevronDown className="w-5 h-5 text-muted-foreground" /> : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
                  </div>
                </button>
                
                {isExpanded && intel && (
                  <div className="p-4 border-t border-white/10 bg-black/20">
                    <div className="grid grid-cols-2 gap-6">
                      {/* Algorithm Insights */}
                      <div>
                        <h5 className="font-medium text-foreground mb-3 flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-400" />
                          Algorithm Insights
                        </h5>
                        <ul className="space-y-2">
                          {intel.keySignals.slice(0, 5).map((signal, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <span className="text-purple-400 mt-1">•</span>
                              <span className="text-muted-foreground">{signal.name}: {signal.description}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Best Practices */}
                      <div>
                        <h5 className="font-medium text-foreground mb-3 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          Best Practices
                        </h5>
                        <ul className="space-y-2">
                          {intel.engagementTactics.slice(0, 5).map((tactic, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <span className="text-emerald-400 mt-1">•</span>
                              <span className="text-muted-foreground">{tactic}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Optimal Posting Times */}
                      <div>
                        <h5 className="font-medium text-foreground mb-3 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-cyan-400" />
                          Optimal Posting Times
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {intel.optimalPostingTimes.map((window: PostingWindow, i: number) => (
                            <Badge key={i} variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
                              {window.day}: {window.times.join(', ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {/* Content Types */}
                      <div>
                        <h5 className="font-medium text-foreground mb-3 flex items-center gap-2">
                          <Video className="w-4 h-4 text-pink-400" />
                          Recommended Content Types
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {intel.contentFormats.map((format, i: number) => (
                            <Badge key={i} variant="outline" className="bg-pink-500/10 text-pink-400 border-pink-500/30">
                              {format.type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {/* Content Factory Tab */}
      {activeTab === 'content' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Content Queue</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Image className="w-4 h-4 mr-2" />
                New Image
              </Button>
              <Button variant="outline" size="sm">
                <Video className="w-4 h-4 mr-2" />
                New Video
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                New Article
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            {contentQueue.map(item => {
              const Icon = getContentTypeIcon(item.type);
              const platform = platforms.find(p => p.id === item.platform);
              const PlatformIcon = platform?.icon || Globe;
              
              return (
                <div key={item.id} className="p-4 bg-card/50 rounded-xl border border-white/10 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-foreground">{item.title}</h4>
                      <Badge variant="outline" className={getStatusColor(item.status)}>
                        {item.status === 'generating' && <RefreshCw className="w-3 h-3 mr-1 animate-spin" />}
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    {item.scheduledFor && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Scheduled: {item.scheduledFor}
                      </p>
                    )}
                    {item.engagement && (
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {item.engagement.likes}</span>
                        <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {item.engagement.comments}</span>
                        <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3" /> {item.engagement.shares}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${platform?.color || 'from-gray-500 to-gray-600'} flex items-center justify-center`}>
                      <PlatformIcon className="w-4 h-4 text-white" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {item.type}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="p-8 bg-card/50 rounded-xl border border-white/10 text-center">
          <Calendar className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Content Calendar</h3>
          <p className="text-muted-foreground mb-4">
            Visual calendar view with drag-and-drop scheduling not yet implemented.
            <br />
            Optimal posting times are automatically suggested based on platform intelligence.
          </p>
          <Button variant="outline">
            View Schedule
          </Button>
        </div>
      )}
      
      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-card/50 rounded-xl border border-white/10">
            <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Performance Overview
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Reach</span>
                <span className="font-semibold text-foreground">89,234</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Engagement Rate</span>
                <span className="font-semibold text-emerald-400">3.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">New Followers (7d)</span>
                <span className="font-semibold text-foreground">+1,234</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Content Published</span>
                <span className="font-semibold text-foreground">24 posts</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-card/50 rounded-xl border border-white/10">
            <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              Top Performing Content
            </h4>
            <div className="space-y-3">
              {[
                { title: 'AI in Business Article', platform: 'LinkedIn', engagement: '5.2%' },
                { title: 'Product Launch Reel', platform: 'Instagram', engagement: '4.8%' },
                { title: 'Quick Tips Short', platform: 'YouTube', engagement: '4.1%' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-black/20 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.platform}</p>
                  </div>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                    {item.engagement}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
