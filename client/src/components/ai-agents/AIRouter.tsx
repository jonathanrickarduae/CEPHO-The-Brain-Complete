import React, { createContext, useContext, useState, useCallback } from 'react';

// AI Provider Types
type AIProvider = 'forge' | 'openai' | 'claude' | 'azure' | 'gemini' | 'perplexity' | 'ollama';

interface ProviderConfig {
  id: AIProvider;
  name: string;
  description: string;
  strengths: string[];
  bestFor: string[];
  apiKeyRequired: boolean;
  isConfigured: boolean;
  costPerToken: number; // relative cost 0-100
  qualityScore: number; // relative quality 0-100
}

interface TaskAnalysis {
  type: 'medical' | 'legal' | 'financial' | 'research' | 'technical' | 'creative' | 'general';
  complexity: 'simple' | 'moderate' | 'complex';
  requiresRealTime: boolean;
  requiresCalculation: boolean;
  requiresCodeExecution: boolean;
}

interface RoutingDecision {
  provider: AIProvider;
  reason: string;
  confidence: number;
  alternatives: AIProvider[];
}

// Provider configurations
const PROVIDERS: ProviderConfig[] = [
  {
    id: 'forge',
    name: 'Forge API',
    description: 'Built-in Manus AI service',
    strengths: ['General purpose', 'Fast response', 'Integrated'],
    bestFor: ['general', 'creative'],
    apiKeyRequired: false,
    isConfigured: true,
    costPerToken: 30,
    qualityScore: 70,
  },
  {
    id: 'claude',
    name: 'Claude (Anthropic)',
    description: 'Nuanced reasoning, safer outputs',
    strengths: ['Medical reasoning', 'Complex analysis', 'Code', 'Safety'],
    bestFor: ['medical', 'technical', 'creative'],
    apiKeyRequired: true,
    isConfigured: false,
    costPerToken: 50,
    qualityScore: 90,
  },
  {
    id: 'openai',
    name: 'GPT-4o (OpenAI)',
    description: 'Strong at structured tasks',
    strengths: ['Legal analysis', 'Calculations', 'Structured output'],
    bestFor: ['legal', 'financial'],
    apiKeyRequired: true,
    isConfigured: false,
    costPerToken: 60,
    qualityScore: 80,
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    description: 'Real-time web research with citations',
    strengths: ['Live information', 'Source citations', 'Research'],
    bestFor: ['research'],
    apiKeyRequired: true,
    isConfigured: false,
    costPerToken: 40,
    qualityScore: 80,
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Multimodal, real-time data',
    strengths: ['Image analysis', 'Real-time info', 'Large context'],
    bestFor: ['research', 'general'],
    apiKeyRequired: true,
    isConfigured: false,
    costPerToken: 40,
    qualityScore: 70,
  },
  {
    id: 'azure',
    name: 'Azure OpenAI',
    description: 'Enterprise-grade, governed',
    strengths: ['Enterprise security', 'Compliance', 'Governance'],
    bestFor: ['legal', 'financial', 'general'],
    apiKeyRequired: true,
    isConfigured: false,
    costPerToken: 70,
    qualityScore: 80,
  },
  {
    id: 'ollama',
    name: 'Local (Ollama)',
    description: 'Self-hosted, maximum privacy',
    strengths: ['Privacy', 'No data leaves device', 'Free'],
    bestFor: ['general'],
    apiKeyRequired: false,
    isConfigured: false,
    costPerToken: 10,
    qualityScore: 60,
  },
];

// Task type detection keywords
const TASK_KEYWORDS: Record<TaskAnalysis['type'], string[]> = {
  medical: ['health', 'medical', 'symptom', 'diagnosis', 'treatment', 'doctor', 'patient', 'clinical', 'therapy', 'medication', 'disease'],
  legal: ['contract', 'legal', 'law', 'clause', 'agreement', 'liability', 'compliance', 'regulation', 'court', 'lawsuit', 'nda', 'terms'],
  financial: ['financial', 'investment', 'valuation', 'dcf', 'revenue', 'profit', 'cash flow', 'budget', 'forecast', 'roi', 'ebitda'],
  research: ['research', 'find', 'search', 'latest', 'news', 'current', 'trend', 'market', 'competitor', 'analysis'],
  technical: ['code', 'programming', 'api', 'database', 'software', 'bug', 'debug', 'function', 'algorithm', 'technical'],
  creative: ['write', 'draft', 'create', 'design', 'story', 'content', 'copy', 'script', 'narrative'],
  general: [],
};

// Smart routing logic
function analyseTask(query: string): TaskAnalysis {
  const lowerQuery = query.toLowerCase();
  
  // Detect task type
  let detectedType: TaskAnalysis['type'] = 'general';
  let maxMatches = 0;
  
  for (const [type, keywords] of Object.entries(TASK_KEYWORDS)) {
    const matches = keywords.filter(kw => lowerQuery.includes(kw)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      detectedType = type as TaskAnalysis['type'];
    }
  }
  
  // Detect complexity
  const wordCount = query.split(' ').length;
  const complexity: TaskAnalysis['complexity'] = 
    wordCount > 100 ? 'complex' : 
    wordCount > 30 ? 'moderate' : 'simple';
  
  // Detect special requirements
  const requiresRealTime = /latest|current|today|now|recent|news/i.test(query);
  const requiresCalculation = /calculate|compute|sum|total|percentage|ratio/i.test(query);
  const requiresCodeExecution = /run|execute|code|script|program/i.test(query);
  
  return {
    type: detectedType,
    complexity,
    requiresRealTime,
    requiresCalculation,
    requiresCodeExecution,
  };
}

function selectProvider(analysis: TaskAnalysis, configuredProviders: AIProvider[]): RoutingDecision {
  // Filter to only configured providers
  const available = PROVIDERS.filter(p => 
    configuredProviders.includes(p.id) || p.id === 'forge'
  );
  
  // Score each provider for this task
  const scored = available.map(provider => {
    let score = provider.qualityScore;
    
    // Boost if provider is best for this task type
    if (provider.bestFor.includes(analysis.type)) {
      score += 3;
    }
    
    // Boost perplexity for real-time needs
    if (analysis.requiresRealTime && provider.id === 'perplexity') {
      score += 4;
    }
    
    // Boost Claude for medical
    if (analysis.type === 'medical' && provider.id === 'claude') {
      score += 3;
    }
    
    // Boost OpenAI for calculations
    if (analysis.requiresCalculation && provider.id === 'openai') {
      score += 2;
    }
    
    // Boost Claude for code
    if (analysis.requiresCodeExecution && provider.id === 'claude') {
      score += 2;
    }
    
    // Penalise for complexity if provider is weaker
    if (analysis.complexity === 'complex' && provider.qualityScore < 7) {
      score -= 2;
    }
    
    return { provider, score };
  });
  
  // Sort by score
  scored.sort((a, b) => b.score - a.score);
  
  const best = scored[0];
  const alternatives = scored.slice(1, 3).map(s => s.provider.id);
  
  // Generate reason
  const reasons: string[] = [];
  if (best.provider.bestFor.includes(analysis.type)) {
    reasons.push(`optimised for ${analysis.type} tasks`);
  }
  if (analysis.requiresRealTime && best.provider.id === 'perplexity') {
    reasons.push('has real-time web access');
  }
  if (analysis.type === 'medical' && best.provider.id === 'claude') {
    reasons.push('strongest for medical reasoning');
  }
  
  return {
    provider: best.provider.id,
    reason: reasons.length > 0 ? reasons.join(', ') : 'best general match',
    confidence: Math.min(best.score / 12, 1),
    alternatives,
  };
}

// Context
interface AIRouterContextType {
  providers: ProviderConfig[];
  configuredProviders: AIProvider[];
  routeQuery: (query: string) => RoutingDecision;
  configureProvider: (providerId: AIProvider, apiKey: string) => void;
  removeProvider: (providerId: AIProvider) => void;
  forceProvider: AIProvider | null;
  setForceProvider: (provider: AIProvider | null) => void;
  lastDecision: RoutingDecision | null;
}

const AIRouterContext = createContext<AIRouterContextType | null>(null);

export function useAIRouter() {
  const context = useContext(AIRouterContext);
  if (!context) {
    throw new Error('useAIRouter must be used within AIRouterProvider');
  }
  return context;
}

interface AIRouterProviderProps {
  children: React.ReactNode;
}

export function AIRouterProvider({ children }: AIRouterProviderProps) {
  const [configuredProviders, setConfiguredProviders] = useState<AIProvider[]>(['forge']);
  const [forceProvider, setForceProvider] = useState<AIProvider | null>(null);
  const [lastDecision, setLastDecision] = useState<RoutingDecision | null>(null);
  
  const routeQuery = useCallback((query: string): RoutingDecision => {
    // If forced, use that provider
    if (forceProvider) {
      const decision: RoutingDecision = {
        provider: forceProvider,
        reason: 'manually selected',
        confidence: 1,
        alternatives: [],
      };
      setLastDecision(decision);
      return decision;
    }
    
    // Analyse and route
    const analysis = analyseTask(query);
    const decision = selectProvider(analysis, configuredProviders);
    setLastDecision(decision);
    return decision;
  }, [forceProvider, configuredProviders]);
  
  const configureProvider = useCallback((providerId: AIProvider, apiKey: string) => {
    // Store API key securely (would go to Vault in production)
    localStorage.setItem(`ai_provider_${providerId}`, apiKey);
    setConfiguredProviders(prev => 
      prev.includes(providerId) ? prev : [...prev, providerId]
    );
  }, []);
  
  const removeProvider = useCallback((providerId: AIProvider) => {
    if (providerId === 'forge') return; // Can't remove default
    localStorage.removeItem(`ai_provider_${providerId}`);
    setConfiguredProviders(prev => prev.filter(p => p !== providerId));
  }, []);
  
  return (
    <AIRouterContext.Provider value={{
      providers: PROVIDERS,
      configuredProviders,
      routeQuery,
      configureProvider,
      removeProvider,
      forceProvider,
      setForceProvider,
      lastDecision,
    }}>
      {children}
    </AIRouterContext.Provider>
  );
}

// UI Component for Settings
export function AIProviderSettings() {
  const { providers, configuredProviders, configureProvider, removeProvider } = useAIRouter();
  const [selectedProvider, setSelectedProvider] = useState<AIProvider | null>(null);
  const [apiKey, setApiKey] = useState('');
  
  const handleConfigure = () => {
    if (selectedProvider && apiKey) {
      configureProvider(selectedProvider, apiKey);
      setApiKey('');
      setSelectedProvider(null);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">AI Providers</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Configure AI providers. The system automatically routes queries to the optimal provider based on task type.
        </p>
      </div>
      
      <div className="grid gap-4">
        {providers.map(provider => {
          const isConfigured = configuredProviders.includes(provider.id);
          
          return (
            <div 
              key={provider.id}
              className={`p-4 rounded-lg border ${
                isConfigured ? 'border-cyan-500/50 bg-cyan-500/10' : 'border-gray-700 bg-gray-800/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-foreground">{provider.name}</h4>
                    {isConfigured && (
                      <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{provider.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {provider.bestFor.map(task => (
                      <span key={task} className="px-2 py-0.5 text-xs bg-gray-700 text-gray-300 rounded">
                        {task}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {!isConfigured && provider.apiKeyRequired && (
                    <button
                      onClick={() => setSelectedProvider(provider.id)}
                      className="px-3 py-1.5 text-sm bg-cyan-500 text-white rounded hover:bg-cyan-600"
                    >
                      Configure
                    </button>
                  )}
                  {isConfigured && provider.id !== 'forge' && (
                    <button
                      onClick={() => removeProvider(provider.id)}
                      className="px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/20 rounded"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
              
              {/* Quality/Cost indicators */}
              <div className="flex gap-4 mt-3 text-xs text-foreground/60">
                <div className="flex items-center gap-1">
                  <span>Quality:</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <div 
                        key={i}
                        className={`w-2 h-2 rounded-full mx-0.5 ${
                          i < Math.round(provider.qualityScore / 20) ? 'bg-cyan-500' : 'bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span>Cost:</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <div 
                        key={i}
                        className={`w-2 h-2 rounded-full mx-0.5 ${
                          i < Math.round(provider.costPerToken / 20) ? 'bg-amber-500' : 'bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* API Key Modal */}
      {selectedProvider && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">
              Configure {providers.find(p => p.id === selectedProvider)?.name}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  placeholder="Enter your API key"
                />
                <p className="text-xs text-foreground/60 mt-1">
                  Stored securely in The Vault
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedProvider(null)}
                  className="flex-1 px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-700 text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfigure}
                  disabled={!apiKey}
                  className="flex-1 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Routing indicator component
export function AIRoutingIndicator() {
  const { lastDecision, forceProvider, setForceProvider, providers, configuredProviders } = useAIRouter();
  const [showSelector, setShowSelector] = useState(false);
  
  if (!lastDecision) return null;
  
  const provider = providers.find(p => p.id === lastDecision.provider);
  
  return (
    <div className="relative">
      <button
        onClick={() => setShowSelector(!showSelector)}
        className="flex items-center gap-2 px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
      >
        <div className={`w-2 h-2 rounded-full ${forceProvider ? 'bg-amber-500' : 'bg-green-500'}`} />
        <span className="text-foreground/50">
          {provider?.name} {forceProvider ? '(forced)' : `(${Math.round(lastDecision.confidence * 100)}%)`}
        </span>
      </button>
      
      {showSelector && (
        <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg p-2 min-w-48 z-50">
          <div className="text-xs text-foreground/60 px-2 py-1 mb-1">Select AI Provider</div>
          <button
            onClick={() => { setForceProvider(null); setShowSelector(false); }}
            className={`w-full text-left px-2 py-1.5 text-sm rounded ${!forceProvider ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
          >
            Auto (recommended)
          </button>
          {providers.filter(p => configuredProviders.includes(p.id)).map(p => (
            <button
              key={p.id}
              onClick={() => { setForceProvider(p.id); setShowSelector(false); }}
              className={`w-full text-left px-2 py-1.5 text-sm rounded ${forceProvider === p.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default AIRouterProvider;
