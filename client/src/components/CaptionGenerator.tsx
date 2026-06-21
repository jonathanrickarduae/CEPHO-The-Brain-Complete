import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Loader2,
  Hash,
  AtSign,
  Smile
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface PlatformConfig {
  id: string;
  name: string;
  icon: typeof Linkedin;
  color: string;
  bgColor: string;
  maxLength: number;
  tone: string;
  hashtagStyle: 'inline' | 'end' | 'minimal';
  emojiLevel: 'none' | 'minimal' | 'moderate' | 'heavy';
  features: string[];
}

const platforms: PlatformConfig[] = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    maxLength: 3000,
    tone: 'Professional, insightful, thought-leadership focused',
    hashtagStyle: 'end',
    emojiLevel: 'minimal',
    features: ['Hook opening', 'Value-driven content', 'Call to engage', '3-5 hashtags at end']
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    icon: Twitter,
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/20',
    maxLength: 280,
    tone: 'Concise, witty, conversational',
    hashtagStyle: 'inline',
    emojiLevel: 'moderate',
    features: ['Punchy hook', 'Thread-worthy', '1-2 hashtags max', 'Engagement bait']
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/20',
    maxLength: 2200,
    tone: 'Authentic, visual-first, story-driven',
    hashtagStyle: 'end',
    emojiLevel: 'heavy',
    features: ['Emotional hook', 'Personal story', 'CTA', '20-30 hashtags in comment']
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    color: 'text-blue-500',
    bgColor: 'bg-blue-600/20',
    maxLength: 63206,
    tone: 'Friendly, community-focused, shareable',
    hashtagStyle: 'minimal',
    emojiLevel: 'moderate',
    features: ['Relatable opening', 'Story format', 'Question to engage', '1-3 hashtags']
  }
];

interface CaptionGeneratorProps {
  onGenerate?: (caption: string, platform: string) => void;
}

export function CaptionGenerator({ onGenerate }: CaptionGeneratorProps) {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('linkedin');
  const [tone, setTone] = useState('professional');
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [includeCTA, setIncludeCTA] = useState(true);
  const [generatedCaption, setGeneratedCaption] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentPlatform = platforms.find(p => p.id === platform);

  const generateCaption = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic or key message');
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generation - in production this would call the LLM
    setTimeout(() => {
      const platformConfig = platforms.find(p => p.id === platform);
      let caption = '';

      if (platform === 'linkedin') {
        caption = `${includeEmojis ? '💡 ' : ''}${topic}

Here's what I've learned after years in this space:

The most successful people don't just work hard—they work smart. They understand that:

1. Consistency beats intensity
2. Relationships matter more than transactions
3. Learning never stops

${includeCTA ? '\nWhat\'s your take? Drop your thoughts below 👇' : ''}

${includeHashtags ? '#Leadership #Growth #ProfessionalDevelopment #BusinessStrategy #CareerAdvice' : ''}`;
      } else if (platform === 'twitter') {
        caption = `${includeEmojis ? '🧵 ' : ''}${topic}

Here's the thing most people miss:

${includeCTA ? '\nRT if you agree, reply if you don\'t 👇' : ''}${includeHashtags ? ' #startup #growth' : ''}`;
      } else if (platform === 'instagram') {
        caption = `${includeEmojis ? '✨ ' : ''}${topic}

Let me tell you a story...

When I first started, I had no idea what I was doing. But I learned that the journey is just as important as the destination.

${includeEmojis ? '💪 ' : ''}Every setback is a setup for a comeback.

${includeCTA ? '\nDouble tap if this resonates! Save for later 📌' : ''}

${includeHashtags ? '.\n.\n.\n#motivation #entrepreneurlife #success #mindset #growth #inspiration #business #entrepreneur #goals #hustle #grind #nevergiveup #believe #dream #achieve #focus #determination #passion #lifestyle #blessed' : ''}`;
      } else if (platform === 'facebook') {
        caption = `${includeEmojis ? '🎯 ' : ''}${topic}

I've been thinking about this a lot lately...

And I realized something important that I want to share with you all.

${includeCTA ? '\nWhat do you think? Have you experienced something similar? Let me know in the comments!' : ''}

${includeHashtags ? '#motivation #community' : ''}`;
      }

      setGeneratedCaption(caption);
      setIsGenerating(false);
      onGenerate?.(caption, platform);
      toast.success('Caption generated!');
    }, 1500);
  };

  const copyCaption = () => {
    navigator.clipboard.writeText(generatedCaption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Caption copied!');
  };

  const regenerate = () => {
    generateCaption();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#E91E8C]" />
            AI Caption Generator
          </CardTitle>
          <CardDescription>
            Generate platform-optimized captions with the right tone and format
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-sm">Configure Your Caption</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Platform Selection */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Platform</Label>
              <div className="grid grid-cols-4 gap-2">
                {platforms.map(p => {
                  const Icon = p.icon;
                  return (
                    <Button
                      key={p.id}
                      variant={platform === p.id ? 'default' : 'outline'}
                      size="sm"
                      className={cn(
                        'flex-col h-auto py-3',
                        platform === p.id && p.bgColor
                      )}
                      onClick={() => setPlatform(p.id)}
                    >
                      <Icon className={cn('w-5 h-5 mb-1', platform !== p.id && p.color)} />
                      <span className="text-xs">{p.name}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Platform Info */}
            {currentPlatform && (
              <div className="p-3 bg-gray-800/50 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Max {currentPlatform.maxLength} chars
                  </Badge>
                  <Badge variant="outline" className="text-xs capitalize">
                    {currentPlatform.emojiLevel} emojis
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{currentPlatform.tone}</p>
              </div>
            )}

            {/* Topic Input */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Topic / Key Message</Label>
              <Textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="What do you want to post about? E.g., 'The importance of work-life balance for entrepreneurs'"
                className="bg-gray-800 border-gray-700 min-h-[100px]"
              />
            </div>

            {/* Options */}
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant={includeHashtags ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIncludeHashtags(!includeHashtags)}
                className={cn(includeHashtags && 'bg-purple-500/20 text-purple-400')}
              >
                <Hash className="w-4 h-4 mr-1" />
                Hashtags
              </Button>
              <Button
                variant={includeEmojis ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIncludeEmojis(!includeEmojis)}
                className={cn(includeEmojis && 'bg-amber-500/20 text-amber-400')}
              >
                <Smile className="w-4 h-4 mr-1" />
                Emojis
              </Button>
              <Button
                variant={includeCTA ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIncludeCTA(!includeCTA)}
                className={cn(includeCTA && 'bg-green-500/20 text-green-400')}
              >
                <AtSign className="w-4 h-4 mr-1" />
                CTA
              </Button>
            </div>

            <Button 
              onClick={generateCaption}
              disabled={isGenerating || !topic.trim()}
              className="w-full bg-gradient-to-r from-[#E91E8C] to-purple-500"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Generate Caption
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className={cn(
          'bg-gray-900/50 border-gray-800',
          generatedCaption && 'border-green-500/30'
        )}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-sm">Generated Caption</CardTitle>
              {generatedCaption && (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={regenerate}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={copyCaption}>
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {generatedCaption ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <p className="text-white whitespace-pre-wrap">{generatedCaption}</p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className={cn(
                    'text-muted-foreground',
                    currentPlatform && generatedCaption.length > currentPlatform.maxLength && 'text-red-400'
                  )}>
                    {generatedCaption.length} / {currentPlatform?.maxLength || 0} characters
                  </span>
                  {currentPlatform && generatedCaption.length > currentPlatform.maxLength && (
                    <Badge variant="destructive">Over limit!</Badge>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                <p className="text-sm">Your generated caption will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Platform Tips */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white text-sm">Platform-Specific Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {platforms.map(p => {
              const Icon = p.icon;
              return (
                <div key={p.id} className={cn('p-3 rounded-lg', p.bgColor)}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={cn('w-4 h-4', p.color)} />
                    <span className={cn('font-medium text-sm', p.color)}>{p.name}</span>
                  </div>
                  <ul className="space-y-1">
                    {p.features.map((feature, i) => (
                      <li key={i} className="text-xs text-muted-foreground">• {feature}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CaptionGenerator;
