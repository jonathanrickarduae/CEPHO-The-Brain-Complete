import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calculator, 
  Zap, 
  Brain, 
  DollarSign, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Info,
  Sparkles
} from 'lucide-react';

// API Provider pricing (per 1M tokens, as of 2024)
interface ProviderPricing {
  id: string;
  name: string;
  logo: string;
  inputPrice: number;  // per 1M tokens
  outputPrice: number; // per 1M tokens
  strengths: string[];
  bestFor: string[];
  freeAllowance?: number; // free tokens per month
  color: string;
}

const providers: ProviderPricing[] = [
  {
    id: 'claude',
    name: 'Claude (Anthropic)',
    logo: '🟣',
    inputPrice: 3.00,
    outputPrice: 15.00,
    strengths: ['Scientific reasoning', 'Safety-critical analysis', 'Long context', 'Nuanced writing'],
    bestFor: ['Medical/Pharmaceutical', 'Legal', 'Research', 'Complex analysis'],
    color: 'bg-purple-500'
  },
  {
    id: 'gpt4',
    name: 'GPT-4 (OpenAI)',
    logo: '🟢',
    inputPrice: 10.00,
    outputPrice: 30.00,
    strengths: ['General intelligence', 'Code generation', 'Broad knowledge', 'Creative tasks'],
    bestFor: ['Software development', 'Creative writing', 'General queries'],
    color: 'bg-green-500'
  },
  {
    id: 'gpt4-turbo',
    name: 'GPT-4 Turbo',
    logo: '🟢',
    inputPrice: 10.00,
    outputPrice: 30.00,
    strengths: ['Faster than GPT-4', 'Updated knowledge', 'Vision capable'],
    bestFor: ['Time-sensitive tasks', 'Image analysis'],
    color: 'bg-emerald-500'
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro (Google)',
    logo: '🔵',
    inputPrice: 0.50,
    outputPrice: 1.50,
    strengths: ['Cost-effective', 'Good reasoning', 'Multimodal'],
    bestFor: ['Budget-conscious tasks', 'Document processing'],
    freeAllowance: 1000000, // 1M tokens free
    color: 'bg-blue-500'
  },
  {
    id: 'gemini-ultra',
    name: 'Gemini Ultra',
    logo: '🔵',
    inputPrice: 7.00,
    outputPrice: 21.00,
    strengths: ['Top-tier performance', 'Complex reasoning', 'Multimodal'],
    bestFor: ['Complex tasks requiring Google\'s best'],
    color: 'bg-indigo-500'
  },
  {
    id: 'mistral-large',
    name: 'Mistral Large',
    logo: '🟠',
    inputPrice: 4.00,
    outputPrice: 12.00,
    strengths: ['European hosting', 'Good performance/cost', 'Multilingual'],
    bestFor: ['EU compliance needs', 'Cost-effective premium'],
    color: 'bg-orange-500'
  },
  {
    id: 'llama-70b',
    name: 'Llama 3 70B (Self-hosted)',
    logo: '🦙',
    inputPrice: 0.00,
    outputPrice: 0.00,
    strengths: ['No API costs', 'Full control', 'Privacy'],
    bestFor: ['High volume', 'Sensitive data', 'Cost elimination'],
    color: 'bg-amber-500'
  }
];

// Usage profiles
interface UsageProfile {
  id: string;
  name: string;
  description: string;
  queriesPerDay: number;
  avgInputTokens: number;
  avgOutputTokens: number;
}

const usageProfiles: UsageProfile[] = [
  { id: 'light', name: 'Light', description: '10-20 queries/day, basic tasks', queriesPerDay: 15, avgInputTokens: 500, avgOutputTokens: 1000 },
  { id: 'moderate', name: 'Moderate', description: '50-100 queries/day, regular use', queriesPerDay: 75, avgInputTokens: 1000, avgOutputTokens: 2000 },
  { id: 'heavy', name: 'Heavy', description: '200+ queries/day, power user', queriesPerDay: 250, avgInputTokens: 1500, avgOutputTokens: 3000 },
  { id: 'enterprise', name: 'Enterprise', description: '500+ queries/day, team use', queriesPerDay: 500, avgInputTokens: 2000, avgOutputTokens: 4000 },
];

// Expert category recommendations
interface CategoryRecommendation {
  category: string;
  recommended: string;
  alternative: string;
  rationale: string;
}

const categoryRecommendations: CategoryRecommendation[] = [
  { category: 'Healthcare & Biotech', recommended: 'claude', alternative: 'gpt4', rationale: 'Claude excels at scientific reasoning and safety-critical medical analysis' },
  { category: 'Legal & Compliance', recommended: 'claude', alternative: 'gpt4', rationale: 'Precise language interpretation and conservative reasoning' },
  { category: 'Finance & Investment', recommended: 'gpt4', alternative: 'claude', rationale: 'Strong quantitative analysis and financial modeling' },
  { category: 'Technology & Engineering', recommended: 'gpt4', alternative: 'claude', rationale: 'Superior code generation and technical documentation' },
  { category: 'Marketing & Sales', recommended: 'gpt4-turbo', alternative: 'gemini-pro', rationale: 'Creative content and fast iteration' },
  { category: 'Operations & Supply Chain', recommended: 'gemini-pro', alternative: 'mistral-large', rationale: 'Cost-effective for high-volume operational queries' },
  { category: 'Strategy & Consulting', recommended: 'claude', alternative: 'gpt4', rationale: 'Nuanced strategic analysis and long-form reasoning' },
  { category: 'Real Estate', recommended: 'gemini-pro', alternative: 'gpt4-turbo', rationale: 'Good balance of capability and cost for property analysis' },
  { category: 'Energy & Sustainability', recommended: 'claude', alternative: 'gemini-pro', rationale: 'Technical accuracy for energy and environmental topics' },
  { category: 'Corporate Partners', recommended: 'gpt4', alternative: 'claude', rationale: 'Broad knowledge of corporate practices and frameworks' },
];

export function APICostCalculator() {
  const [selectedProfile, setSelectedProfile] = useState<string>('moderate');
  const [customQueries, setCustomQueries] = useState<number>(75);
  const [useCustom, setUseCustom] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState<string[]>(['claude', 'gpt4', 'gemini-pro']);

  const profile = usageProfiles.find(p => p.id === selectedProfile) || usageProfiles[1];
  const queriesPerDay = useCustom ? customQueries : profile.queriesPerDay;
  const queriesPerMonth = queriesPerDay * 30;

  const calculateMonthlyCost = (provider: ProviderPricing) => {
    const inputTokensPerMonth = queriesPerMonth * profile.avgInputTokens;
    const outputTokensPerMonth = queriesPerMonth * profile.avgOutputTokens;
    
    // Apply free allowance if available
    const effectiveInputTokens = provider.freeAllowance 
      ? Math.max(0, inputTokensPerMonth - provider.freeAllowance / 2)
      : inputTokensPerMonth;
    const effectiveOutputTokens = provider.freeAllowance
      ? Math.max(0, outputTokensPerMonth - provider.freeAllowance / 2)
      : outputTokensPerMonth;
    
    const inputCost = (effectiveInputTokens / 1000000) * provider.inputPrice;
    const outputCost = (effectiveOutputTokens / 1000000) * provider.outputPrice;
    
    return inputCost + outputCost;
  };

  const costComparison = useMemo(() => {
    return providers
      .filter(p => selectedProviders.includes(p.id))
      .map(provider => ({
        ...provider,
        monthlyCost: calculateMonthlyCost(provider),
        annualCost: calculateMonthlyCost(provider) * 12
      }))
      .sort((a, b) => a.monthlyCost - b.monthlyCost);
  }, [selectedProviders, queriesPerDay, profile]);

  const cheapestProvider = costComparison[0];
  const mostExpensive = costComparison[costComparison.length - 1];
  const potentialSavings = mostExpensive ? mostExpensive.annualCost - (cheapestProvider?.annualCost || 0) : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            API Cost Calculator
          </CardTitle>
          <CardDescription>
            Estimate your monthly AI API costs based on usage patterns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Usage Profile Selection */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Usage Profile</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {usageProfiles.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedProfile(p.id);
                    setUseCustom(false);
                  }}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedProfile === p.id && !useCustom
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Usage */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Switch
                checked={useCustom}
                onCheckedChange={setUseCustom}
              />
              <Label>Custom queries per day</Label>
            </div>
            {useCustom && (
              <div className="space-y-2">
                <Slider
                  value={[customQueries]}
                  onValueChange={([v]) => setCustomQueries(v)}
                  min={1}
                  max={1000}
                  step={1}
                />
                <div className="text-sm text-muted-foreground">
                  {customQueries} queries/day = {customQueries * 30} queries/month
                </div>
              </div>
            )}
          </div>

          {/* Provider Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Compare Providers</Label>
            <div className="flex flex-wrap gap-2">
              {providers.map((provider) => (
                <Badge
                  key={provider.id}
                  variant={selectedProviders.includes(provider.id) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedProviders(prev =>
                      prev.includes(provider.id)
                        ? prev.filter(p => p !== provider.id)
                        : [...prev, provider.id]
                    );
                  }}
                >
                  {provider.logo} {provider.name}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Comparison Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Monthly Cost Estimate
          </CardTitle>
          <CardDescription>
            Based on {queriesPerMonth.toLocaleString()} queries/month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {costComparison.map((provider, index) => (
              <div
                key={provider.id}
                className={`p-4 rounded-lg border ${
                  index === 0 ? 'border-green-500 bg-green-500/10' : 'border-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{provider.logo}</span>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {provider.name}
                        {index === 0 && (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Best Value
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {provider.strengths.slice(0, 2).join(' • ')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      ${provider.monthlyCost.toFixed(2)}
                      <span className="text-sm font-normal text-muted-foreground">/mo</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ${provider.annualCost.toFixed(0)}/year
                    </div>
                  </div>
                </div>
                {provider.freeAllowance && (
                  <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Includes {(provider.freeAllowance / 1000000).toFixed(1)}M free tokens/month
                  </div>
                )}
              </div>
            ))}
          </div>

          {potentialSavings > 100 && (
            <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-center gap-2 text-amber-600">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">
                  Potential annual savings: ${potentialSavings.toFixed(0)}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                By choosing {cheapestProvider?.name} over {mostExpensive?.name}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Expert Category Recommendations
          </CardTitle>
          <CardDescription>
            Optimal AI backend for each expert category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {categoryRecommendations.map((rec) => {
              const recommended = providers.find(p => p.id === rec.recommended);
              const alternative = providers.find(p => p.id === rec.alternative);
              
              return (
                <div key={rec.category} className="p-3 rounded-lg border border-border">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{rec.category}</div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className={recommended?.color}>
                        {recommended?.logo} {recommended?.name.split(' ')[0]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">or</span>
                      <Badge variant="outline">
                        {alternative?.logo} {alternative?.name.split(' ')[0]}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {rec.rationale}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Getting Started
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <div className="font-medium">Claude (Anthropic)</div>
                <div className="text-sm text-muted-foreground">
                  Sign up at <a href="https://console.anthropic.com" target="_blank" className="text-primary hover:underline">console.anthropic.com</a>
                  {' '}• Best for medical, legal, and complex analysis
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <div className="font-medium">GPT-4 (OpenAI)</div>
                <div className="text-sm text-muted-foreground">
                  Sign up at <a href="https://platform.openai.com" target="_blank" className="text-primary hover:underline">platform.openai.com</a>
                  {' '}• Best for code, creative, and general tasks
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <div className="font-medium">Gemini (Google)</div>
                <div className="text-sm text-muted-foreground">
                  Sign up at <a href="https://ai.google.dev" target="_blank" className="text-primary hover:underline">ai.google.dev</a>
                  {' '}• Free tier available, good for budget-conscious use
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-muted">
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span className="font-medium">Recommendation:</span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Start with <strong>Claude</strong> for pharmaceutical/medical work and <strong>Gemini Pro</strong> for general queries to balance quality and cost. Add GPT-4 later for specialized code or creative tasks.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default APICostCalculator;
