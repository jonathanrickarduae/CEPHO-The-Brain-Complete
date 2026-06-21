import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Presentation,
  Plus,
  GripVertical,
  Trash2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Download,
  Copy,
  Check,
  AlertTriangle,
  Target,
  TrendingUp,
  Users,
  DollarSign,
  Lightbulb,
  BarChart3,
  Rocket
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export type SlideType = 
  | 'title' 
  | 'problem' 
  | 'solution' 
  | 'market' 
  | 'traction' 
  | 'team' 
  | 'financials' 
  | 'ask' 
  | 'custom';

interface Slide {
  id: string;
  type: SlideType;
  title: string;
  content: string;
  notes?: string;
  hasGap?: boolean;
}

const slideTemplates: Record<SlideType, {
  label: string;
  icon: typeof Presentation;
  defaultTitle: string;
  placeholder: string;
  color: string;
}> = {
  title: {
    label: 'Title',
    icon: Presentation,
    defaultTitle: 'Company Name',
    placeholder: 'Tagline or one-liner that captures your value proposition',
    color: 'text-purple-400'
  },
  problem: {
    label: 'Problem',
    icon: AlertTriangle,
    defaultTitle: 'The Problem',
    placeholder: 'What pain point are you solving? Who experiences it? How big is it?',
    color: 'text-red-400'
  },
  solution: {
    label: 'Solution',
    icon: Lightbulb,
    defaultTitle: 'Our Solution',
    placeholder: 'How does your product/service solve the problem? What makes it unique?',
    color: 'text-green-400'
  },
  market: {
    label: 'Market',
    icon: Target,
    defaultTitle: 'Market Opportunity',
    placeholder: 'TAM, SAM, SOM. Market size, growth rate, and your target segment.',
    color: 'text-blue-400'
  },
  traction: {
    label: 'Traction',
    icon: TrendingUp,
    defaultTitle: 'Traction & Milestones',
    placeholder: 'Key metrics, growth, customers, partnerships, revenue.',
    color: 'text-cyan-400'
  },
  team: {
    label: 'Team',
    icon: Users,
    defaultTitle: 'The Team',
    placeholder: 'Key team members, their backgrounds, and why they are the right team.',
    color: 'text-amber-400'
  },
  financials: {
    label: 'Financials',
    icon: BarChart3,
    defaultTitle: 'Financial Projections',
    placeholder: 'Revenue model, unit economics, projections, key assumptions.',
    color: 'text-emerald-400'
  },
  ask: {
    label: 'The Ask',
    icon: DollarSign,
    defaultTitle: 'Investment Ask',
    placeholder: 'How much are you raising? What will you use it for? What milestones will it achieve?',
    color: 'text-pink-400'
  },
  custom: {
    label: 'Custom',
    icon: Plus,
    defaultTitle: 'Custom Slide',
    placeholder: 'Add your own content',
    color: 'text-gray-400'
  }
};

const standardDeckStructure: SlideType[] = [
  'title', 'problem', 'solution', 'market', 'traction', 'team', 'financials', 'ask'
];

interface SlideStructureGeneratorProps {
  onExport?: (slides: Slide[]) => void;
  initialSlides?: Slide[];
}

export function SlideStructureGenerator({ onExport, initialSlides }: SlideStructureGeneratorProps) {
  const [slides, setSlides] = useState<Slide[]>(initialSlides || []);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addSlide = (type: SlideType) => {
    const template = slideTemplates[type];
    const newSlide: Slide = {
      id: generateId(),
      type,
      title: template.defaultTitle,
      content: '',
      notes: ''
    };
    setSlides([...slides, newSlide]);
  };

  const generateStandardDeck = () => {
    const newSlides = standardDeckStructure.map(type => {
      const template = slideTemplates[type];
      return {
        id: generateId(),
        type,
        title: template.defaultTitle,
        content: '',
        notes: ''
      };
    });
    setSlides(newSlides);
    toast.success('Standard pitch deck structure generated');
  };

  const removeSlide = (id: string) => {
    setSlides(slides.filter(s => s.id !== id));
  };

  const moveSlide = (id: string, direction: 'up' | 'down') => {
    const index = slides.findIndex(s => s.id === id);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= slides.length) return;
    
    const newSlides = [...slides];
    [newSlides[index], newSlides[newIndex]] = [newSlides[newIndex], newSlides[index]];
    setSlides(newSlides);
  };

  const updateSlide = (id: string, updates: Partial<Slide>) => {
    setSlides(slides.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const detectGaps = () => {
    const presentTypes = new Set(slides.map(s => s.type));
    const missingTypes = standardDeckStructure.filter(t => !presentTypes.has(t));
    
    if (missingTypes.length > 0) {
      toast.warning(`Missing slides: ${missingTypes.map(t => slideTemplates[t].label).join(', ')}`);
    } else {
      toast.success('All standard pitch deck sections are covered');
    }
    
    // Mark slides with empty content as having gaps
    setSlides(slides.map(s => ({
      ...s,
      hasGap: !s.content.trim()
    })));
  };

  const copySlideContent = (slide: Slide) => {
    const content = `# ${slide.title}\n\n${slide.content}${slide.notes ? `\n\n---\nNotes: ${slide.notes}` : ''}`;
    navigator.clipboard.writeText(content);
    setCopiedId(slide.id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Slide content copied');
  };

  const exportDeck = () => {
    if (onExport) {
      onExport(slides);
    } else {
      const content = slides.map((s, i) => 
        `## Slide ${i + 1}: ${s.title}\n\n${s.content}\n${s.notes ? `\nNotes: ${s.notes}` : ''}`
      ).join('\n\n---\n\n');
      
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pitch-deck-structure.md';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Deck structure exported');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Presentation className="w-5 h-5 text-[#E91E8C]" />
            Slide Structure Generator
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Build your pitch deck with the standard investor deck structure
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={detectGaps}
            disabled={slides.length === 0}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Detect Gaps
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={exportDeck}
            disabled={slides.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={generateStandardDeck}
              className="bg-gradient-to-r from-[#E91E8C] to-purple-500"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Standard Deck
            </Button>
            <div className="flex-1" />
            {Object.entries(slideTemplates).map(([type, config]) => (
              <Button
                key={type}
                variant="outline"
                size="sm"
                onClick={() => addSlide(type as SlideType)}
                className="border-gray-700"
              >
                <config.icon className={cn('w-4 h-4 mr-1', config.color)} />
                {config.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Slides List */}
      {slides.length === 0 ? (
        <Card className="bg-gray-900/50 border-gray-800 border-dashed">
          <CardContent className="py-12 text-center">
            <Presentation className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No slides yet. Generate a standard deck or add slides manually.</p>
            <Button onClick={generateStandardDeck}>
              <Rocket className="w-4 h-4 mr-2" />
              Get Started
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {slides.map((slide, index) => {
            const config = slideTemplates[slide.type];
            const Icon = config.icon;
            
            return (
              <Card 
                key={slide.id} 
                className={cn(
                  'bg-gray-900/50 border-gray-800',
                  slide.hasGap && 'border-amber-500/50'
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveSlide(slide.id, 'up')}
                        disabled={index === 0}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveSlide(slide.id, 'down')}
                        disabled={index === slides.length - 1}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </div>
                    <Badge variant="outline" className={cn('border-gray-700', config.color)}>
                      <Icon className="w-3 h-3 mr-1" />
                      {config.label}
                    </Badge>
                    <span className="text-sm text-muted-foreground">Slide {index + 1}</span>
                    {slide.hasGap && (
                      <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Needs Content
                      </Badge>
                    )}
                    <div className="flex-1" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => copySlideContent(slide)}
                    >
                      {copiedId === slide.id ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:text-red-300"
                      onClick={() => removeSlide(slide.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    value={slide.title}
                    onChange={(e) => updateSlide(slide.id, { title: e.target.value })}
                    placeholder="Slide title"
                    className="bg-gray-800 border-gray-700 text-lg font-medium"
                  />
                  <Textarea
                    value={slide.content}
                    onChange={(e) => updateSlide(slide.id, { content: e.target.value, hasGap: false })}
                    placeholder={config.placeholder}
                    className="bg-gray-800 border-gray-700 min-h-[100px]"
                  />
                  <Input
                    value={slide.notes || ''}
                    onChange={(e) => updateSlide(slide.id, { notes: e.target.value })}
                    placeholder="Speaker notes (optional)"
                    className="bg-gray-800/50 border-gray-700 text-sm"
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SlideStructureGenerator;
