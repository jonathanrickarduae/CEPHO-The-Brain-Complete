import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { platformIntelligence } from '@/lib/PlatformIntelligence';
import { 
  Wand2, 
  Copy, 
  Download, 
  RefreshCw, 
  Image, 
  Video, 
  FileText,
  Calendar,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

interface ContentPiece {
  id: string;
  platform: string;
  type: string;
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
  scheduledFor?: Date;
  status: 'draft' | 'scheduled' | 'published';
}

interface ContentFactoryProps {
  onContentCreate?: (content: ContentPiece) => void;
}

const contentTemplates = {
  educational: [
    { hook: 'Did you know that [surprising fact]?', body: 'Here is why this matters for your business...', cta: 'Save this for later!' },
    { hook: '[Number] mistakes you are making with [topic]', body: 'Let me break down each one...', cta: 'Which one surprised you most?' },
    { hook: 'The secret to [desired outcome] is simpler than you think', body: 'Here is the framework I use...', cta: 'Try this and let me know how it goes!' },
  ],
  entertaining: [
    { hook: 'POV: You just [relatable situation]', body: '[Humorous take on the situation]', cta: 'Tag someone who does this!' },
    { hook: 'Behind the scenes of [process/day]', body: '[Authentic glimpse into your world]', cta: 'What do you want to see next?' },
    { hook: 'When [common scenario] happens...', body: '[Funny or relatable response]', cta: 'Drop a [emoji] if this is you!' },
  ],
  promotional: [
    { hook: 'Introducing [product/service]', body: 'Here is how it solves [problem]...', cta: 'Link in bio to learn more!' },
    { hook: '[Customer name] achieved [result] with our help', body: 'Here is their story...', cta: 'Ready for your transformation?' },
    { hook: 'Limited time: [offer details]', body: 'Here is what you get...', cta: 'DM "OFFER" to claim yours!' },
  ],
  inspirational: [
    { hook: 'From [starting point] to [achievement]', body: 'Here is what I learned along the way...', cta: 'What is your journey?' },
    { hook: 'The moment everything changed for me', body: '[Story of transformation]', cta: 'Share your turning point below!' },
    { hook: 'If I could tell my past self one thing...', body: '[Wisdom gained from experience]', cta: 'What would you tell yours?' },
  ],
};

export function ContentFactory({ onContentCreate }: ContentFactoryProps) {
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [contentType, setContentType] = useState('educational');
  const [content, setContent] = useState<Partial<ContentPiece>>({
    hook: '',
    body: '',
    cta: '',
    hashtags: [],
  });
  const [hashtagInput, setHashtagInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const platforms = Object.keys(platformIntelligence);

  const handleTemplateSelect = (template: typeof contentTemplates.educational[0]) => {
    setContent({
      ...content,
      hook: template.hook,
      body: template.body,
      cta: template.cta,
    });
  };

  const addHashtag = () => {
    if (hashtagInput.trim()) {
      const tag = hashtagInput.startsWith('#') ? hashtagInput : `#${hashtagInput}`;
      setContent(prev => ({
        ...prev,
        hashtags: [...(prev.hashtags || []), tag.toLowerCase().replace(/\s/g, '')],
      }));
      setHashtagInput('');
    }
  };

  const removeHashtag = (tag: string) => {
    setContent(prev => ({
      ...prev,
      hashtags: prev.hashtags?.filter(h => h !== tag) || [],
    }));
  };

  const generateContent = async () => {
    setIsGenerating(true);
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const templates = contentTemplates[contentType as keyof typeof contentTemplates];
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    
    setContent({
      ...content,
      hook: randomTemplate.hook,
      body: randomTemplate.body,
      cta: randomTemplate.cta,
    });
    
    setIsGenerating(false);
    toast.success('Content generated! Customize it to match your voice.');
  };

  const copyToClipboard = () => {
    const fullContent = `${content.hook}\n\n${content.body}\n\n${content.cta}\n\n${content.hashtags?.join(' ')}`;
    navigator.clipboard.writeText(fullContent);
    toast.success('Content copied to clipboard!');
  };

  const saveContent = () => {
    const newContent: ContentPiece = {
      id: Date.now().toString(),
      platform: selectedPlatform,
      type: contentType,
      hook: content.hook || '',
      body: content.body || '',
      cta: content.cta || '',
      hashtags: content.hashtags || [],
      status: 'draft',
    };
    onContentCreate?.(newContent);
    toast.success('Content saved to drafts!');
  };

  const getCharacterCount = () => {
    const total = (content.hook?.length || 0) + (content.body?.length || 0) + (content.cta?.length || 0);
    const limits: Record<string, number> = {
      instagram: 2200,
      youtube: 5000,
      tiktok: 2200,
      linkedin: 3000,
    };
    return { current: total, limit: limits[selectedPlatform] || 2200 };
  };

  const charCount = getCharacterCount();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Content Factory
          </CardTitle>
          <CardDescription>
            Create platform optimized content with AI assistance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Platform & Type Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map(platform => (
                    <SelectItem key={platform} value={platform}>
                      <span className="flex items-center gap-2">
                        {platformIntelligence[platform].icon}
                        {platformIntelligence[platform].name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Content Type</Label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="educational">Educational</SelectItem>
                  <SelectItem value="entertaining">Entertaining</SelectItem>
                  <SelectItem value="promotional">Promotional</SelectItem>
                  <SelectItem value="inspirational">Inspirational</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Templates */}
          <div className="space-y-2">
            <Label>Quick Templates</Label>
            <div className="flex flex-wrap gap-2">
              {contentTemplates[contentType as keyof typeof contentTemplates].map((template, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  onClick={() => handleTemplateSelect(template)}
                >
                  Template {i + 1}
                </Button>
              ))}
              <Button
                variant="secondary"
                size="sm"
                onClick={generateContent}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                AI Generate
              </Button>
            </div>
          </div>

          {/* Content Editor */}
          <Tabs defaultValue="write" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="write">Write</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="write" className="space-y-4">
              <div className="space-y-2">
                <Label>Hook (First Line)</Label>
                <Textarea
                  placeholder="Grab attention with your opening line..."
                  value={content.hook}
                  onChange={e => setContent({ ...content, hook: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Body</Label>
                <Textarea
                  placeholder="Deliver your main message..."
                  value={content.body}
                  onChange={e => setContent({ ...content, body: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Call to Action</Label>
                <Textarea
                  placeholder="What do you want them to do?"
                  value={content.cta}
                  onChange={e => setContent({ ...content, cta: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Hashtags</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add hashtag"
                    value={hashtagInput}
                    onChange={e => setHashtagInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && addHashtag()}
                  />
                  <Button onClick={addHashtag}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {content.hashtags?.map(tag => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeHashtag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div className={`text-sm ${charCount.current > charCount.limit ? 'text-red-500' : 'text-muted-foreground'}`}>
                {charCount.current} / {charCount.limit} characters
              </div>
            </TabsContent>

            <TabsContent value="preview">
              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    {platformIntelligence[selectedPlatform].icon}
                  </div>
                  <div>
                    <p className="font-medium">Your Brand</p>
                    <p className="text-xs text-muted-foreground">@yourbrand</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">{content.hook || 'Your hook will appear here...'}</p>
                  <p className="text-muted-foreground whitespace-pre-wrap">{content.body || 'Your body content...'}</p>
                  <p className="font-medium">{content.cta || 'Your call to action...'}</p>
                  <p className="text-primary text-sm">{content.hashtags?.join(' ')}</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={copyToClipboard} className="flex-1">
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button onClick={saveContent} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content Format Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle>Suggested Formats for {platformIntelligence[selectedPlatform].name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {platformIntelligence[selectedPlatform].contentTypes.slice(0, 3).map((type, i) => (
              <div key={i} className="text-center p-4 border rounded-lg">
                {type.type.includes('Video') || type.type.includes('Reel') || type.type.includes('Short') ? (
                  <Video className="h-8 w-8 mx-auto mb-2 text-primary" />
                ) : type.type.includes('Image') || type.type.includes('Carousel') ? (
                  <Image className="h-8 w-8 mx-auto mb-2 text-primary" />
                ) : (
                  <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
                )}
                <p className="font-medium">{type.type}</p>
                <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ContentFactory;
