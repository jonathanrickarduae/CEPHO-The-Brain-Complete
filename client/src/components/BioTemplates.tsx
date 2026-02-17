import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User,
  Copy,
  Check,
  Sparkles,
  Linkedin,
  Twitter,
  Globe,
  Mail,
  FileText,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface BioTemplate {
  id: string;
  name: string;
  platform: 'linkedin' | 'twitter' | 'website' | 'email' | 'pitch';
  maxLength: number;
  description: string;
  template: string;
  example: string;
}

const bioTemplates: BioTemplate[] = [
  {
    id: 'linkedin-headline',
    name: 'LinkedIn Headline',
    platform: 'linkedin',
    maxLength: 120,
    description: 'Your professional tagline that appears below your name',
    template: '[Role] at [Company] | [Key Achievement/Focus] | [Value Proposition]',
    example: 'CEO at TechStartup | Building AI tools for SMBs | Helping 10K+ businesses automate workflows'
  },
  {
    id: 'linkedin-about',
    name: 'LinkedIn About',
    platform: 'linkedin',
    maxLength: 2600,
    description: 'Your professional story and value proposition',
    template: `[Hook - Start with impact or question]

[Your Story - 2-3 sentences about your journey]

[What You Do Now - Current role and focus]

[Key Achievements - 3-4 bullet points]
• [Achievement 1]
• [Achievement 2]
• [Achievement 3]

[Call to Action - How to connect]`,
    example: `What if your business could run itself while you sleep?

I've spent 15 years helping companies transform chaos into clarity. From Fortune 500s to scrappy startups, I've seen what works—and what doesn't.

Now, as CEO of TechStartup, I'm building AI tools that give small businesses enterprise-level automation.

Key wins:
• Scaled previous company from $0 to $50M ARR
• Led digital transformation for 3 Fortune 500 companies
• Built and exited 2 successful startups

Let's connect if you're building something interesting or want to chat about AI, automation, or startup life.`
  },
  {
    id: 'twitter-bio',
    name: 'Twitter/X Bio',
    platform: 'twitter',
    maxLength: 160,
    description: 'Short, punchy bio for Twitter/X',
    template: '[Role] @[Company] | [What you do/build] | [Personal touch/interest]',
    example: 'Building @TechStartup 🚀 | AI for SMBs | Ex-Google | Dad of 2 | Coffee enthusiast ☕'
  },
  {
    id: 'website-bio',
    name: 'Website Bio',
    platform: 'website',
    maxLength: 500,
    description: 'Professional bio for your company website',
    template: `[Name] is the [Role] of [Company], where [he/she/they] [key responsibility].

With [X years] of experience in [industry], [Name] has [key achievements]. Prior to [Company], [he/she/they] [previous notable role/achievement].

[Name] holds a [degree] from [university] and is passionate about [relevant interests].`,
    example: `Sarah Chen is the CEO and Co-founder of TechStartup, where she leads the company's vision to democratize AI for small businesses.

With 15 years of experience in enterprise software, Sarah has helped hundreds of companies transform their operations. Prior to TechStartup, she was VP of Product at Google Cloud, where she launched three products serving 10M+ users.

Sarah holds an MBA from Stanford and a BS in Computer Science from MIT. She is passionate about making technology accessible to everyone.`
  },
  {
    id: 'email-signature',
    name: 'Email Signature',
    platform: 'email',
    maxLength: 200,
    description: 'Professional email signature',
    template: `[Name]
[Role] | [Company]
[Phone] | [Email]
[Website]`,
    example: `Sarah Chen
CEO | TechStartup
+1 (555) 123-4567 | sarah@techstartup.com
www.techstartup.com`
  },
  {
    id: 'pitch-intro',
    name: 'Pitch Introduction',
    platform: 'pitch',
    maxLength: 300,
    description: '30-second introduction for pitches and networking',
    template: `Hi, I'm [Name], [Role] at [Company]. We're building [one-line description of product]. 

[Problem you solve in one sentence]. 

We've [key traction/achievement], and we're looking to [goal/ask].`,
    example: `Hi, I'm Sarah, CEO at TechStartup. We're building AI-powered automation tools for small businesses.

Most SMBs can't afford enterprise software, so they waste hours on manual tasks.

We've helped 10,000 businesses save an average of 20 hours per week, and we're looking to partner with investors who understand the SMB market.`
  }
];

const platformConfig = {
  linkedin: { icon: Linkedin, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  twitter: { icon: Twitter, color: 'text-sky-400', bg: 'bg-sky-500/20' },
  website: { icon: Globe, color: 'text-green-400', bg: 'bg-green-500/20' },
  email: { icon: Mail, color: 'text-amber-400', bg: 'bg-amber-500/20' },
  pitch: { icon: FileText, color: 'text-purple-400', bg: 'bg-purple-500/20' }
};

interface BioTemplatesProps {
  onGenerate?: (template: BioTemplate, inputs: Record<string, string>) => Promise<string>;
}

export function BioTemplates({ onGenerate }: BioTemplatesProps) {
  const [activeTemplate, setActiveTemplate] = useState<string>('linkedin-headline');
  const [generatedBio, setGeneratedBio] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [inputs, setInputs] = useState<Record<string, string>>({
    name: '',
    role: '',
    company: '',
    achievement: '',
    focus: ''
  });

  const currentTemplate = bioTemplates.find(t => t.id === activeTemplate);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Copied to clipboard');
  };

  const handleGenerate = async () => {
    if (!currentTemplate) return;
    
    setIsGenerating(true);
    try {
      if (onGenerate) {
        const result = await onGenerate(currentTemplate, inputs);
        setGeneratedBio(result);
      } else {
        // Simple template replacement
        let bio = currentTemplate.template;
        Object.entries(inputs).forEach(([key, value]) => {
          bio = bio.replace(new RegExp(`\\[${key}\\]`, 'gi'), value || `[${key}]`);
        });
        setGeneratedBio(bio);
      }
      toast.success('Bio generated');
    } catch (error) {
      toast.error('Failed to generate bio');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="w-5 h-5 text-[#E91E8C]" />
            Bio Templates & Guidelines
          </CardTitle>
          <CardDescription>
            Professional bio templates optimized for each platform
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Template Selection */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {bioTemplates.map(template => {
          const config = platformConfig[template.platform];
          const Icon = config.icon;
          
          return (
            <Button
              key={template.id}
              variant={activeTemplate === template.id ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'flex-shrink-0',
                activeTemplate === template.id && 'bg-gradient-to-r from-[#E91E8C] to-purple-500'
              )}
              onClick={() => setActiveTemplate(template.id)}
            >
              <Icon className={cn('w-4 h-4 mr-2', activeTemplate !== template.id && config.color)} />
              {template.name}
            </Button>
          );
        })}
      </div>

      {currentTemplate && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Template Info & Inputs */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                {(() => {
                  const config = platformConfig[currentTemplate.platform];
                  const Icon = config.icon;
                  return (
                    <div className={cn('p-2 rounded-lg', config.bg)}>
                      <Icon className={cn('w-5 h-5', config.color)} />
                    </div>
                  );
                })()}
                <div>
                  <CardTitle className="text-white text-lg">{currentTemplate.name}</CardTitle>
                  <CardDescription>{currentTemplate.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">Max {currentTemplate.maxLength} chars</Badge>
                <Badge variant="outline" className="capitalize">{currentTemplate.platform}</Badge>
              </div>

              {/* Template Structure */}
              <div className="p-3 bg-gray-800/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">Template Structure:</p>
                <p className="text-sm text-white font-mono whitespace-pre-wrap">{currentTemplate.template}</p>
              </div>

              {/* Input Fields */}
              <div className="space-y-3">
                <Label className="text-sm text-muted-foreground">Your Information</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Your Name"
                    value={inputs.name}
                    onChange={(e) => setInputs({ ...inputs, name: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  />
                  <Input
                    placeholder="Your Role"
                    value={inputs.role}
                    onChange={(e) => setInputs({ ...inputs, role: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  />
                  <Input
                    placeholder="Company Name"
                    value={inputs.company}
                    onChange={(e) => setInputs({ ...inputs, company: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  />
                  <Input
                    placeholder="Key Achievement"
                    value={inputs.achievement}
                    onChange={(e) => setInputs({ ...inputs, achievement: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <Input
                  placeholder="Your Focus/Value Proposition"
                  value={inputs.focus}
                  onChange={(e) => setInputs({ ...inputs, focus: e.target.value })}
                  className="bg-gray-800 border-gray-700"
                />
              </div>

              <Button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-[#E91E8C] to-purple-500"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Generate Bio
              </Button>
            </CardContent>
          </Card>

          {/* Example & Generated */}
          <div className="space-y-4">
            {/* Example */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-sm">Example</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(currentTemplate.example, 'example')}
                  >
                    {copiedId === 'example' ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-white whitespace-pre-wrap">{currentTemplate.example}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {currentTemplate.example.length} / {currentTemplate.maxLength} characters
                </p>
              </CardContent>
            </Card>

            {/* Generated Bio */}
            {generatedBio && (
              <Card className="bg-green-500/10 border-green-500/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-green-400 text-sm">Your Generated Bio</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(generatedBio, 'generated')}
                    >
                      {copiedId === 'generated' ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={generatedBio}
                    onChange={(e) => setGeneratedBio(e.target.value)}
                    className="bg-gray-800 border-gray-700 min-h-[150px]"
                  />
                  <p className={cn(
                    'text-xs mt-2',
                    generatedBio.length > currentTemplate.maxLength ? 'text-red-400' : 'text-muted-foreground'
                  )}>
                    {generatedBio.length} / {currentTemplate.maxLength} characters
                    {generatedBio.length > currentTemplate.maxLength && ' (over limit!)'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Guidelines */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white text-sm">Bio Writing Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p className="text-green-400 font-medium">✓ Do:</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• Lead with your most impressive credential</li>
                <li>• Use numbers and specific achievements</li>
                <li>• Include a clear value proposition</li>
                <li>• Match tone to the platform</li>
                <li>• Update regularly with new achievements</li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="text-red-400 font-medium">✗ Don't:</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• Use buzzwords without substance</li>
                <li>• Write in third person on social media</li>
                <li>• Include irrelevant personal details</li>
                <li>• Use the same bio everywhere</li>
                <li>• Forget to proofread</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default BioTemplates;
