import { useState } from 'react';
import { 
  Search, BookOpen, CheckCircle2, AlertCircle, ExternalLink,
  TrendingUp, Building2, Lightbulb, FileText, Quote, Copy, Check
} from 'lucide-react';
import { 
  McKinseyInsights, 
  McKinseyInsight, 
  FactCheckResult,
  InsightCategory 
} from '@/lib/mckinseyInsights';

// ==================== TYPES ====================

interface McKinseyInsightsPanelProps {
  mode?: 'search' | 'factcheck' | 'research';
  initialQuery?: string;
  industry?: string;
  onInsightSelect?: (insight: McKinseyInsight) => void;
  onCitationCopy?: (citation: string) => void;
}

// ==================== CATEGORY ICONS ====================

const categoryIcons: Record<InsightCategory, typeof TrendingUp> = {
  strategy: TrendingUp,
  operations: Building2,
  technology: Lightbulb,
  organization: Building2,
  marketing: TrendingUp,
  sustainability: Lightbulb,
  risk: AlertCircle,
  growth: TrendingUp,
  transformation: Lightbulb,
  talent: Building2,
  finance: TrendingUp,
  supply_chain: Building2
};

const categoryColors: Record<InsightCategory, string> = {
  strategy: 'text-blue-500 bg-blue-500/10',
  operations: 'text-green-500 bg-green-500/10',
  technology: 'text-purple-500 bg-purple-500/10',
  organization: 'text-orange-500 bg-orange-500/10',
  marketing: 'text-pink-500 bg-pink-500/10',
  sustainability: 'text-emerald-500 bg-emerald-500/10',
  risk: 'text-red-500 bg-red-500/10',
  growth: 'text-cyan-500 bg-cyan-500/10',
  transformation: 'text-indigo-500 bg-indigo-500/10',
  talent: 'text-amber-500 bg-amber-500/10',
  finance: 'text-teal-500 bg-teal-500/10',
  supply_chain: 'text-lime-500 bg-lime-500/10'
};

// ==================== MAIN COMPONENT ====================

export default function McKinseyInsightsPanel({
  mode = 'search',
  initialQuery = '',
  industry,
  onInsightSelect,
  onCitationCopy
}: McKinseyInsightsPanelProps) {
  const [query, setQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<McKinseyInsight[]>([]);
  const [factCheckResult, setFactCheckResult] = useState<FactCheckResult | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<InsightCategory | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    
    // Simulate async search
    setTimeout(() => {
      if (mode === 'factcheck') {
        const result = McKinseyInsights.factCheck(query);
        setFactCheckResult(result);
        setSearchResults([]);
      } else {
        const results = McKinseyInsights.search(query, {
          category: selectedCategory || undefined,
          industry,
          limit: 10
        });
        setSearchResults(results);
        setFactCheckResult(null);
      }
      setIsSearching(false);
    }, 500);
  };

  const handleCopyCitation = (insight: McKinseyInsight) => {
    const citation = McKinseyInsights.formatCitation({
      title: insight.title,
      url: insight.url,
      publishDate: insight.publishDate,
      relevantExcerpt: insight.summary,
      credibilityScore: 95
    }, 'apa');
    
    navigator.clipboard.writeText(citation);
    setCopiedId(insight.id);
    onCitationCopy?.(citation);
    
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories: InsightCategory[] = [
    'strategy', 'technology', 'finance', 'operations', 
    'marketing', 'sustainability', 'risk', 'transformation'
  ];

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-blue-500/10 to-purple-500/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">McKinsey Insights</h3>
            <p className="text-xs text-muted-foreground">
              {mode === 'factcheck' ? 'Fact-check claims against research' : 'Search credible business intelligence'}
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={mode === 'factcheck' ? 'Enter a claim to verify...' : 'Search McKinsey research...'}
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {isSearching ? 'Searching...' : mode === 'factcheck' ? 'Verify' : 'Search'}
          </button>
        </div>

        {/* Category Filters */}
        {mode === 'search' && (
          <div className="flex flex-wrap gap-2 mt-3">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="max-h-[500px] overflow-y-auto">
        {/* Fact Check Result */}
        {factCheckResult && (
          <div className="p-4 border-b border-border">
            <div className={`p-4 rounded-lg ${
              factCheckResult.verified 
                ? 'bg-green-500/10 border border-green-500/30' 
                : 'bg-amber-500/10 border border-amber-500/30'
            }`}>
              <div className="flex items-start gap-3">
                {factCheckResult.verified ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-semibold ${
                      factCheckResult.verified ? 'text-green-600' : 'text-amber-600'
                    }`}>
                      {factCheckResult.verified ? 'Supported by Research' : 'Limited Evidence'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {factCheckResult.confidence}% confidence
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    "{factCheckResult.claim}"
                  </p>
                  
                  {factCheckResult.sources.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-foreground">Supporting Sources:</p>
                      {factCheckResult.sources.map((source, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs">
                          <FileText className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div>
                            <a 
                              href={source.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {source.title}
                            </a>
                            <p className="text-muted-foreground mt-0.5">
                              "{source.relevantExcerpt}"
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {factCheckResult.alternativePerspectives && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        {factCheckResult.alternativePerspectives[0]}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="divide-y divide-border">
            {searchResults.map(insight => {
              const CategoryIcon = categoryIcons[insight.category];
              const colorClass = categoryColors[insight.category];
              
              return (
                <div 
                  key={insight.id}
                  className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => onInsightSelect?.(insight)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <CategoryIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium text-foreground line-clamp-2">
                          {insight.title}
                        </h4>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyCitation(insight);
                            }}
                            className="p-1.5 rounded hover:bg-muted transition-colors"
                            title="Copy citation"
                          >
                            {copiedId === insight.id ? (
                              <Check className="w-3.5 h-3.5 text-green-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                            )}
                          </button>
                          <a
                            href={insight.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded hover:bg-muted transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                          </a>
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {insight.summary}
                      </p>
                      
                      {insight.keyFindings && insight.keyFindings.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {insight.keyFindings.slice(0, 2).map((finding, idx) => (
                            <div key={idx} className="flex items-start gap-1.5">
                              <Quote className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {finding}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${colorClass}`}>
                          {insight.category.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(insight.publishDate).toLocaleDateString()}
                        </span>
                        {insight.industry && (
                          <span className="text-[10px] text-muted-foreground">
                            • {insight.industry}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!factCheckResult && searchResults.length === 0 && (
          <div className="p-8 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {mode === 'factcheck' 
                ? 'Enter a business claim to verify against McKinsey research'
                : 'Search for insights on strategy, technology, finance, and more'}
            </p>
            <p className="text-xs text-muted-foreground/70 mt-2">
              Powered by McKinsey Global Institute research
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border bg-muted/30">
        <p className="text-[10px] text-muted-foreground text-center">
          Sources: McKinsey & Company, McKinsey Global Institute • For reference only
        </p>
      </div>
    </div>
  );
}
