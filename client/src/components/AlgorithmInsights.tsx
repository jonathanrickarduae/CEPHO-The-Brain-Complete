import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { platformIntelligence, type PlatformData, type AlgorithmInsight } from '@/lib/PlatformIntelligence';
import { ChevronDown, ChevronUp, Clock, Lightbulb, Target, TrendingUp } from 'lucide-react';

interface AlgorithmInsightsProps {
  selectedPlatform?: string;
  onPlatformChange?: (platform: string) => void;
}

export function AlgorithmInsights({ selectedPlatform, onPlatformChange }: AlgorithmInsightsProps) {
  const [activePlatform, setActivePlatform] = useState(selectedPlatform || 'instagram');
  const [expandedFactors, setExpandedFactors] = useState<string[]>([]);

  const handlePlatformChange = (platform: string) => {
    setActivePlatform(platform);
    onPlatformChange?.(platform);
  };

  const toggleFactor = (factor: string) => {
    setExpandedFactors(prev =>
      prev.includes(factor) ? prev.filter(f => f !== factor) : [...prev, factor]
    );
  };

  const getWeightColor = (weight: string) => {
    switch (weight) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getWeightValue = (weight: string) => {
    switch (weight) {
      case 'high': return 100;
      case 'medium': return 60;
      case 'low': return 30;
      default: return 0;
    }
  };

  const platforms = Object.keys(platformIntelligence);
  const currentPlatform = platformIntelligence[activePlatform];

  if (!currentPlatform) return null;

  return (
    <div className="space-y-6">
      <Tabs value={activePlatform} onValueChange={handlePlatformChange}>
        <TabsList className="grid w-full grid-cols-4">
          {platforms.map(platform => (
            <TabsTrigger key={platform} value={platform} className="capitalize">
              <span className="mr-2">{platformIntelligence[platform].icon}</span>
              {platformIntelligence[platform].name}
            </TabsTrigger>
          ))}
        </TabsList>

        {platforms.map(platform => (
          <TabsContent key={platform} value={platform} className="space-y-6">
            <PlatformContent
              platform={platformIntelligence[platform]}
              expandedFactors={expandedFactors}
              toggleFactor={toggleFactor}
              getWeightColor={getWeightColor}
              getWeightValue={getWeightValue}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

interface PlatformContentProps {
  platform: PlatformData;
  expandedFactors: string[];
  toggleFactor: (factor: string) => void;
  getWeightColor: (weight: string) => string;
  getWeightValue: (weight: string) => number;
}

function PlatformContent({
  platform,
  expandedFactors,
  toggleFactor,
  getWeightColor,
  getWeightValue,
}: PlatformContentProps) {
  return (
    <>
      {/* Algorithm Factors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Algorithm Ranking Factors
          </CardTitle>
          <CardDescription>
            What {platform.name} rewards in the algorithm
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {platform.algorithmFactors.map((factor: AlgorithmInsight) => (
            <div key={factor.factor} className="border rounded-lg p-4">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleFactor(factor.factor)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-medium">{factor.factor}</span>
                    <Badge variant={factor.weight === 'high' ? 'default' : 'secondary'}>
                      {factor.weight} impact
                    </Badge>
                  </div>
                  <Progress value={getWeightValue(factor.weight)} className="h-2" />
                </div>
                {expandedFactors.includes(factor.factor) ? (
                  <ChevronUp className="h-5 w-5 ml-4" />
                ) : (
                  <ChevronDown className="h-5 w-5 ml-4" />
                )}
              </div>
              {expandedFactors.includes(factor.factor) && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-3">{factor.description}</p>
                  <div className="space-y-2">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      Tips to optimize:
                    </p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-6">
                      {factor.tips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Content Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Content Type Priority
          </CardTitle>
          <CardDescription>
            Which content formats perform best on {platform.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {platform.contentTypes.map((content, index) => (
              <div key={content.type} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{content.type}</p>
                  <p className="text-sm text-muted-foreground">{content.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Optimal Posting Times */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Optimal Posting Times
          </CardTitle>
          <CardDescription>
            Best times to post on {platform.name} for maximum reach
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {platform.optimalPostTimes.slice(0, 4).map(day => (
              <div key={day.day} className="text-center p-3 bg-muted rounded-lg">
                <p className="font-medium text-sm">{day.day}</p>
                <div className="mt-2 space-y-1">
                  {day.times.map((time, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {time}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Best Practices</CardTitle>
          <CardDescription>
            Key strategies for success on {platform.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {platform.bestPractices.map((practice, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span className="text-sm">{practice}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}

export default AlgorithmInsights;
