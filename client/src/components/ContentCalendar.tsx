import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  Linkedin,
  Twitter,
  FileText,
  Video,
  Image as ImageIcon,
  Mic,
  Target,
  TrendingUp,
  Copy
} from 'lucide-react';
import { toast } from 'sonner';

interface ContentItem {
  id: string;
  title: string;
  description: string;
  platform: 'linkedin' | 'twitter' | 'blog' | 'video' | 'podcast';
  contentType: 'thought_leadership' | 'case_study' | 'product_update' | 'industry_news' | 'tips';
  status: 'idea' | 'drafting' | 'review' | 'scheduled' | 'published';
  scheduledDate?: string;
  content?: string;
  hashtags?: string[];
}

const platforms = [
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-600' },
  { value: 'twitter', label: 'Twitter/X', icon: Twitter, color: 'text-sky-500' },
  { value: 'blog', label: 'Blog Post', icon: FileText, color: 'text-green-500' },
  { value: 'video', label: 'Video', icon: Video, color: 'text-red-500' },
  { value: 'podcast', label: 'Podcast', icon: Mic, color: 'text-purple-500' },
];

const contentTypes = [
  { value: 'thought_leadership', label: 'Thought Leadership' },
  { value: 'case_study', label: 'Case Study' },
  { value: 'product_update', label: 'Product Update' },
  { value: 'industry_news', label: 'Industry News' },
  { value: 'tips', label: 'Tips & How-To' },
];

const contentIdeas = [
  { platform: 'linkedin', title: 'AI in Healthcare Leadership', type: 'thought_leadership', description: 'Share insights on how AI is transforming healthcare executive decision-making' },
  { platform: 'twitter', title: 'Quick Tip Thread', type: 'tips', description: '5 ways CEOs can leverage AI assistants for better time management' },
  { platform: 'blog', title: 'Digital Twin Case Study', type: 'case_study', description: 'How CEPHO.Ai Digital Twin improved decision-making for a healthcare exec' },
  { platform: 'linkedin', title: 'Morning Signal Feature', type: 'product_update', description: 'Introducing our AI-powered morning briefing system' },
  { platform: 'video', title: 'Platform Demo', type: 'product_update', description: 'Walkthrough of CEPHO.Ai key features' },
];

export function ContentCalendar() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContent, setNewContent] = useState<Partial<ContentItem>>({
    platform: 'linkedin',
    contentType: 'thought_leadership',
    status: 'idea',
  });
  const [activeTab, setActiveTab] = useState('calendar');

  const addContent = () => {
    if (!newContent.title) {
      toast.error('Please add a title');
      return;
    }

    const item: ContentItem = {
      id: Date.now().toString(),
      title: newContent.title || '',
      description: newContent.description || '',
      platform: (newContent.platform as ContentItem['platform']) || 'linkedin',
      contentType: (newContent.contentType as ContentItem['contentType']) || 'thought_leadership',
      status: newContent.scheduledDate ? 'scheduled' : 'idea',
      scheduledDate: newContent.scheduledDate,
      content: newContent.content,
      hashtags: newContent.hashtags,
    };

    setContent([...content, item]);
    setNewContent({ platform: 'linkedin', contentType: 'thought_leadership', status: 'idea' });
    setShowAddForm(false);
    toast.success('Content added to calendar');
  };

  const addFromIdea = (idea: typeof contentIdeas[0]) => {
    const item: ContentItem = {
      id: Date.now().toString(),
      title: idea.title,
      description: idea.description,
      platform: idea.platform as ContentItem['platform'],
      contentType: idea.type as ContentItem['contentType'],
      status: 'idea',
    };
    setContent([...content, item]);
    toast.success('Added to content pipeline');
  };

  const updateStatus = (id: string, status: ContentItem['status']) => {
    setContent(content.map(c => c.id === id ? { ...c, status } : c));
    toast.success(`Status updated to ${status}`);
  };

  const deleteContent = (id: string) => {
    setContent(content.filter(c => c.id !== id));
    toast.success('Content removed');
  };

  const getPlatformIcon = (platform: string) => {
    const p = platforms.find(pl => pl.value === platform);
    if (!p) return FileText;
    return p.icon;
  };

  const getPlatformColor = (platform: string) => {
    const p = platforms.find(pl => pl.value === platform);
    return p?.color || 'text-gray-500';
  };

  const getStatusColor = (status: ContentItem['status']) => {
    switch (status) {
      case 'published': return 'bg-green-500/20 text-green-500';
      case 'scheduled': return 'bg-blue-500/20 text-blue-500';
      case 'review': return 'bg-purple-500/20 text-purple-500';
      case 'drafting': return 'bg-yellow-500/20 text-yellow-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  const stats = {
    total: content.length,
    published: content.filter(c => c.status === 'published').length,
    scheduled: content.filter(c => c.status === 'scheduled').length,
    inProgress: content.filter(c => ['drafting', 'review'].includes(c.status)).length,
  };

  const weeklyGoal = 5;
  const thisWeekPublished = stats.published; // Simplified - would need date logic

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Content</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">{stats.published}</div>
              <div className="text-sm text-muted-foreground">Published</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500">{stats.scheduled}</div>
              <div className="text-sm text-muted-foreground">Scheduled</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-500">{stats.inProgress}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Goal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-[#E91E8C]" />
            Weekly Publishing Goal
          </CardTitle>
          <CardDescription>Target: {weeklyGoal} posts per week across platforms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{thisWeekPublished} of {weeklyGoal} this week</span>
              <span>{Math.round((thisWeekPublished / weeklyGoal) * 100)}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#E91E8C] to-purple-500 transition-all"
                style={{ width: `${Math.min((thisWeekPublished / weeklyGoal) * 100, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="calendar">Content Pipeline</TabsTrigger>
          <TabsTrigger value="ideas">Content Ideas</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4 mt-4">
          {/* Add Content Form */}
          {showAddForm ? (
            <Card>
              <CardHeader>
                <CardTitle>Add New Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input
                      placeholder="Content title"
                      value={newContent.title || ''}
                      onChange={e => setNewContent({ ...newContent, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Platform</Label>
                    <Select
                      value={newContent.platform}
                      onValueChange={v => setNewContent({ ...newContent, platform: v as ContentItem['platform'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {platforms.map(p => (
                          <SelectItem key={p.value} value={p.value}>
                            <div className="flex items-center gap-2">
                              <p.icon className={`h-4 w-4 ${p.color}`} />
                              {p.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Content Type</Label>
                    <Select
                      value={newContent.contentType}
                      onValueChange={v => setNewContent({ ...newContent, contentType: v as ContentItem['contentType'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {contentTypes.map(t => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Scheduled Date</Label>
                    <Input
                      type="date"
                      value={newContent.scheduledDate || ''}
                      onChange={e => setNewContent({ ...newContent, scheduledDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Brief description of the content..."
                    value={newContent.description || ''}
                    onChange={e => setNewContent({ ...newContent, description: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={addContent} className="bg-[#E91E8C] hover:bg-[#E91E8C]/90">
                    Add Content
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button onClick={() => setShowAddForm(true)} className="w-full bg-[#E91E8C] hover:bg-[#E91E8C]/90">
              <Plus className="h-4 w-4 mr-2" />
              Add New Content
            </Button>
          )}

          {/* Content List */}
          <Card>
            <CardHeader>
              <CardTitle>Content Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {content.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No content scheduled yet. Add content above or pick from ideas.
                  </p>
                ) : (
                  content.map(item => {
                    const PlatformIcon = getPlatformIcon(item.platform);
                    return (
                      <div
                        key={item.id}
                        className="p-4 border rounded-lg hover:border-[#E91E8C]/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center ${getPlatformColor(item.platform)}`}>
                              <PlatformIcon className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="font-medium">{item.title}</div>
                              <div className="text-sm text-muted-foreground">{item.description}</div>
                              {item.scheduledDate && (
                                <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                  <Calendar className="h-3 w-3" />
                                  {item.scheduledDate}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                            <Badge variant="secondary">
                              {contentTypes.find(t => t.value === item.contentType)?.label}
                            </Badge>
                          </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                          {item.status === 'idea' && (
                            <Button size="sm" variant="outline" onClick={() => updateStatus(item.id, 'drafting')}>
                              Start Drafting
                            </Button>
                          )}
                          {item.status === 'drafting' && (
                            <Button size="sm" variant="outline" onClick={() => updateStatus(item.id, 'review')}>
                              Submit for Review
                            </Button>
                          )}
                          {item.status === 'review' && (
                            <Button size="sm" variant="outline" onClick={() => updateStatus(item.id, 'scheduled')}>
                              Approve & Schedule
                            </Button>
                          )}
                          {item.status === 'scheduled' && (
                            <Button size="sm" variant="outline" onClick={() => updateStatus(item.id, 'published')}>
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Mark Published
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteContent(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ideas" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Ideas Bank</CardTitle>
              <CardDescription>Quick-start content ideas based on your brand positioning</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contentIdeas.map((idea, i) => {
                  const PlatformIcon = getPlatformIcon(idea.platform);
                  return (
                    <div
                      key={i}
                      className="p-4 border rounded-lg hover:border-[#E91E8C]/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center ${getPlatformColor(idea.platform)}`}>
                            <PlatformIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium">{idea.title}</div>
                            <div className="text-sm text-muted-foreground">{idea.description}</div>
                            <Badge variant="secondary" className="mt-2">
                              {contentTypes.find(t => t.value === idea.type)?.label}
                            </Badge>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => addFromIdea(idea)} className="bg-[#E91E8C] hover:bg-[#E91E8C]/90">
                          <Plus className="h-4 w-4 mr-1" />
                          Add to Pipeline
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ContentCalendar;
