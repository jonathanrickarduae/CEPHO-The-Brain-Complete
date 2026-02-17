import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { platformIntelligence } from '@/lib/PlatformIntelligence';
import { Target, Users, BarChart3, Lightbulb, Plus, X } from 'lucide-react';

interface ContentPillar {
  id: string;
  name: string;
  percentage: number;
  examples: string[];
}

interface SocialMediaStrategyProps {
  onStrategyComplete?: (strategy: SocialMediaStrategyData) => void;
}

export interface SocialMediaStrategyData {
  businessObjective: string;
  targetAudience: {
    demographics: string;
    interests: string[];
    painPoints: string[];
  };
  platforms: string[];
  contentPillars: ContentPillar[];
  kpis: {
    metric: string;
    target: string;
    timeframe: string;
  }[];
  postingFrequency: Record<string, number>;
}

const defaultPillars: ContentPillar[] = [
  { id: '1', name: 'Educational', percentage: 40, examples: ['How to guides', 'Tips and tricks', 'Industry insights'] },
  { id: '2', name: 'Entertaining', percentage: 25, examples: ['Behind the scenes', 'Team moments', 'Trending content'] },
  { id: '3', name: 'Promotional', percentage: 20, examples: ['Product features', 'Customer testimonials', 'Offers'] },
  { id: '4', name: 'Inspirational', percentage: 15, examples: ['Success stories', 'Motivational quotes', 'Case studies'] },
];

export function SocialMediaStrategy({ onStrategyComplete }: SocialMediaStrategyProps) {
  const [step, setStep] = useState(1);
  const [strategy, setStrategy] = useState<SocialMediaStrategyData>({
    businessObjective: '',
    targetAudience: {
      demographics: '',
      interests: [],
      painPoints: [],
    },
    platforms: [],
    contentPillars: defaultPillars,
    kpis: [
      { metric: 'Follower Growth', target: '', timeframe: '3 months' },
      { metric: 'Engagement Rate', target: '', timeframe: '3 months' },
      { metric: 'Website Traffic', target: '', timeframe: '3 months' },
    ],
    postingFrequency: {},
  });

  const [newInterest, setNewInterest] = useState('');
  const [newPainPoint, setNewPainPoint] = useState('');

  const platforms = Object.keys(platformIntelligence);

  const handlePlatformToggle = (platform: string) => {
    setStrategy(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform],
    }));
  };

  const addInterest = () => {
    if (newInterest.trim()) {
      setStrategy(prev => ({
        ...prev,
        targetAudience: {
          ...prev.targetAudience,
          interests: [...prev.targetAudience.interests, newInterest.trim()],
        },
      }));
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setStrategy(prev => ({
      ...prev,
      targetAudience: {
        ...prev.targetAudience,
        interests: prev.targetAudience.interests.filter(i => i !== interest),
      },
    }));
  };

  const addPainPoint = () => {
    if (newPainPoint.trim()) {
      setStrategy(prev => ({
        ...prev,
        targetAudience: {
          ...prev.targetAudience,
          painPoints: [...prev.targetAudience.painPoints, newPainPoint.trim()],
        },
      }));
      setNewPainPoint('');
    }
  };

  const removePainPoint = (painPoint: string) => {
    setStrategy(prev => ({
      ...prev,
      targetAudience: {
        ...prev.targetAudience,
        painPoints: prev.targetAudience.painPoints.filter(p => p !== painPoint),
      },
    }));
  };

  const updatePillarPercentage = (id: string, percentage: number) => {
    setStrategy(prev => ({
      ...prev,
      contentPillars: prev.contentPillars.map(p =>
        p.id === id ? { ...p, percentage } : p
      ),
    }));
  };

  const updateKPI = (index: number, field: string, value: string) => {
    setStrategy(prev => ({
      ...prev,
      kpis: prev.kpis.map((kpi, i) =>
        i === index ? { ...kpi, [field]: value } : kpi
      ),
    }));
  };

  const updatePostingFrequency = (platform: string, frequency: number) => {
    setStrategy(prev => ({
      ...prev,
      postingFrequency: { ...prev.postingFrequency, [platform]: frequency },
    }));
  };

  const handleComplete = () => {
    onStrategyComplete?.(strategy);
  };

  const totalPillarPercentage = strategy.contentPillars.reduce((sum, p) => sum + p.percentage, 0);

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4].map(s => (
          <div key={s} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                s <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              {s}
            </div>
            {s < 4 && (
              <div className={`w-20 h-1 ${s < step ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Business Objective */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Business Objective
            </CardTitle>
            <CardDescription>
              What are you trying to achieve with social media?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Primary Objective</Label>
              <Select
                value={strategy.businessObjective}
                onValueChange={v => setStrategy(prev => ({ ...prev, businessObjective: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your main goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brand_awareness">Build Brand Awareness</SelectItem>
                  <SelectItem value="lead_generation">Generate Leads</SelectItem>
                  <SelectItem value="sales">Drive Sales</SelectItem>
                  <SelectItem value="community">Build Community</SelectItem>
                  <SelectItem value="thought_leadership">Establish Thought Leadership</SelectItem>
                  <SelectItem value="customer_support">Customer Support</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Select Platforms</Label>
              <div className="grid grid-cols-2 gap-3">
                {platforms.map(platform => (
                  <div
                    key={platform}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      strategy.platforms.includes(platform)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handlePlatformToggle(platform)}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox checked={strategy.platforms.includes(platform)} />
                      <span className="text-lg">{platformIntelligence[platform].icon}</span>
                      <span className="font-medium">{platformIntelligence[platform].name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={() => setStep(2)}
              disabled={!strategy.businessObjective || strategy.platforms.length === 0}
              className="w-full"
            >
              Continue
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Target Audience */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Target Audience
            </CardTitle>
            <CardDescription>
              Define who you want to reach
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Demographics</Label>
              <Textarea
                placeholder="e.g., Business owners aged 30 to 50, based in UAE, interested in technology"
                value={strategy.targetAudience.demographics}
                onChange={e =>
                  setStrategy(prev => ({
                    ...prev,
                    targetAudience: { ...prev.targetAudience, demographics: e.target.value },
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Interests</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add an interest"
                  value={newInterest}
                  onChange={e => setNewInterest(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && addInterest()}
                />
                <Button onClick={addInterest} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {strategy.targetAudience.interests.map(interest => (
                  <Badge key={interest} variant="secondary" className="gap-1">
                    {interest}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeInterest(interest)} />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Pain Points</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a pain point"
                  value={newPainPoint}
                  onChange={e => setNewPainPoint(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && addPainPoint()}
                />
                <Button onClick={addPainPoint} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {strategy.targetAudience.painPoints.map(painPoint => (
                  <Badge key={painPoint} variant="outline" className="gap-1">
                    {painPoint}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removePainPoint(painPoint)} />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!strategy.targetAudience.demographics}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Content Pillars */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Content Pillars
            </CardTitle>
            <CardDescription>
              Define your content mix (should total 100%)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {strategy.contentPillars.map(pillar => (
              <div key={pillar.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{pillar.name}</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={pillar.percentage}
                      onChange={e => updatePillarPercentage(pillar.id, parseInt(e.target.value) || 0)}
                      className="w-20 text-center"
                    />
                    <span>%</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {pillar.examples.map((example, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {example}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}

            <div className={`text-center font-medium ${totalPillarPercentage === 100 ? 'text-green-500' : 'text-red-500'}`}>
              Total: {totalPillarPercentage}%
              {totalPillarPercentage !== 100 && ' (should be 100%)'}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button
                onClick={() => setStep(4)}
                disabled={totalPillarPercentage !== 100}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: KPIs & Frequency */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              KPIs & Posting Schedule
            </CardTitle>
            <CardDescription>
              Set your targets and posting frequency
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>Key Performance Indicators</Label>
              {strategy.kpis.map((kpi, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <span className="w-32 text-sm">{kpi.metric}</span>
                  <Input
                    placeholder="Target"
                    value={kpi.target}
                    onChange={e => updateKPI(index, 'target', e.target.value)}
                    className="flex-1"
                  />
                  <Select
                    value={kpi.timeframe}
                    onValueChange={v => updateKPI(index, 'timeframe', v)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1 month">1 month</SelectItem>
                      <SelectItem value="3 months">3 months</SelectItem>
                      <SelectItem value="6 months">6 months</SelectItem>
                      <SelectItem value="1 year">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <Label>Posting Frequency (posts per week)</Label>
              {strategy.platforms.map(platform => (
                <div key={platform} className="flex items-center gap-4">
                  <span className="w-32 flex items-center gap-2">
                    <span>{platformIntelligence[platform].icon}</span>
                    {platformIntelligence[platform].name}
                  </span>
                  <Input
                    type="number"
                    min="1"
                    max="21"
                    value={strategy.postingFrequency[platform] || 3}
                    onChange={e => updatePostingFrequency(platform, parseInt(e.target.value) || 1)}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">per week</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                Back
              </Button>
              <Button onClick={handleComplete} className="flex-1">
                Complete Strategy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default SocialMediaStrategy;
