import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Building2, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  FileText,
  ExternalLink,
  Sparkles,
  Target,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  RefreshCw
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface FundingProgram {
  programId: string;
  name: string;
  country: "UAE" | "UK";
  type: string;
  provider: string;
  description: string;
  fundingMin: number;
  fundingMax: number;
  eligibilityCriteria: string[];
  websiteUrl: string;
  applicationUrl?: string;
  successRate?: number;
  averageProcessingDays?: number;
}

interface AssessmentResult {
  assessmentId: string;
  eligibilityScore: number;
  eligibilityStatus: string;
  criteriaResults: {
    criterion: string;
    met: boolean;
    score: number;
    notes: string;
  }[];
  strengths: string[];
  gaps: string[];
  recommendations: string[];
  estimatedFunding: number;
  applicationReadiness: number;
}

interface IdeaAssessment {
  ideaId: number;
  ideaTitle: string;
  assessments: {
    program: FundingProgram;
    result: AssessmentResult | null;
    isAssessing: boolean;
  }[];
}

export default function FundingAssessment() {
  const [selectedCountry, setSelectedCountry] = useState<"UAE" | "UK" | "all">("all");
  const [expandedIdeas, setExpandedIdeas] = useState<Set<number>>(new Set());
  const [assessingIdeas, setAssessingIdeas] = useState<Set<number>>(new Set());
  const [assessmentResults, setAssessmentResults] = useState<Map<string, AssessmentResult>>(new Map());

  // Fetch ideas from Innovation Hub
  const { data: ideas, isLoading: ideasLoading } = trpc.innovation.getIdeas.useQuery({});
  
  // Fetch funding programs
  const { data: programs, isLoading: programsLoading } = trpc.innovation.getFundingPrograms.useQuery(
    selectedCountry === "all" ? {} : { country: selectedCountry }
  );

  // Assessment mutation
  const assessMutation = trpc.innovation.assessForFunding.useMutation({
    onSuccess: (result, variables) => {
      const key = `${variables.ideaId}-${variables.programId}`;
      setAssessmentResults(prev => new Map(prev).set(key, result));
    },
  });

  const toggleIdeaExpanded = (ideaId: number) => {
    setExpandedIdeas(prev => {
      const next = new Set(prev);
      if (next.has(ideaId)) {
        next.delete(ideaId);
      } else {
        next.add(ideaId);
      }
      return next;
    });
  };

  const assessIdeaForAllPrograms = async (ideaId: number) => {
    if (!programs) return;
    
    setAssessingIdeas(prev => new Set(prev).add(ideaId));
    
    // Assess against top 3 programs for each country
    const uaePrograms = programs.filter(p => p.country === "UAE").slice(0, 3);
    const ukPrograms = programs.filter(p => p.country === "UK").slice(0, 3);
    const programsToAssess = [...uaePrograms, ...ukPrograms];
    
    for (const program of programsToAssess) {
      try {
        await assessMutation.mutateAsync({
          ideaId,
          programId: program.programId,
        });
      } catch (error) {
        console.error(`Failed to assess ${program.name}:`, error);
      }
    }
    
    setAssessingIdeas(prev => {
      const next = new Set(prev);
      next.delete(ideaId);
      return next;
    });
    
    // Expand the idea to show results
    setExpandedIdeas(prev => new Set(prev).add(ideaId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "highly_eligible": return "text-emerald-400 bg-emerald-500/20";
      case "eligible": return "text-cyan-400 bg-cyan-500/20";
      case "partially_eligible": return "text-amber-400 bg-amber-500/20";
      default: return "text-red-400 bg-red-500/20";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "highly_eligible": return "Highly Eligible";
      case "eligible": return "Eligible";
      case "partially_eligible": return "Partially Eligible";
      default: return "Not Eligible";
    }
  };

  const formatCurrency = (amount: number, currency: string = "AED") => {
    if (amount === 0) return "Varies";
    return new Intl.NumberFormat('en-GB', { 
      style: 'currency', 
      currency: currency === "AED" ? "AED" : "GBP",
      maximumFractionDigits: 0 
    }).format(amount);
  };

  const getIdeaAssessments = (ideaId: number): { program: FundingProgram; result: AssessmentResult | null }[] => {
    if (!programs) return [];
    
    return programs.map(program => ({
      program,
      result: assessmentResults.get(`${ideaId}-${program.programId}`) || null,
    })).filter(a => a.result !== null);
  };

  const getBestMatch = (ideaId: number) => {
    const assessments = getIdeaAssessments(ideaId);
    if (assessments.length === 0) return null;
    
    return assessments.reduce((best, current) => {
      if (!best.result) return current;
      if (!current.result) return best;
      return current.result.eligibilityScore > best.result.eligibilityScore ? current : best;
    });
  };

  if (ideasLoading || programsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  const validIdeas = ideas?.filter(i => i.status !== "archived") || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                AI-Powered Funding Assessment
              </CardTitle>
              <CardDescription>
                Automatically assess your ideas against government funding programmes
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={selectedCountry === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCountry("all")}
                className={selectedCountry === "all" ? "bg-gray-700" : "border-gray-700"}
              >
                All
              </Button>
              <Button
                variant={selectedCountry === "UAE" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCountry("UAE")}
                className={selectedCountry === "UAE" ? "bg-emerald-600" : "border-gray-700"}
              >
                🇦🇪 UAE
              </Button>
              <Button
                variant={selectedCountry === "UK" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCountry("UK")}
                className={selectedCountry === "UK" ? "bg-blue-600" : "border-gray-700"}
              >
                🇬🇧 UK
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Ideas with Assessment */}
      {validIdeas.length === 0 ? (
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="py-12 text-center">
            <Lightbulb className="w-12 h-12 text-foreground/50 mx-auto mb-4" />
            <p className="text-foreground/70 mb-4">No ideas to assess yet</p>
            <p className="text-sm text-foreground/60">
              Add ideas in the Innovation Hub to assess their funding eligibility
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {validIdeas.map(idea => {
            const isExpanded = expandedIdeas.has(idea.id);
            const isAssessing = assessingIdeas.has(idea.id);
            const assessments = getIdeaAssessments(idea.id);
            const bestMatch = getBestMatch(idea.id);
            
            return (
              <Card key={idea.id} className="bg-gray-900/50 border-gray-800">
                <Collapsible open={isExpanded} onOpenChange={() => toggleIdeaExpanded(idea.id)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                          <Lightbulb className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg">{idea.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <Badge variant="outline" className="border-gray-700 text-xs">
                              {idea.category}
                            </Badge>
                            {bestMatch?.result && (
                              <Badge className={`${getStatusColor(bestMatch.result.eligibilityStatus)} text-xs`}>
                                Best: {bestMatch.result.eligibilityScore}% match
                              </Badge>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {assessments.length > 0 && (
                          <span className="text-sm text-foreground/60">
                            {assessments.length} assessment{assessments.length !== 1 ? 's' : ''}
                          </span>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            assessIdeaForAllPrograms(idea.id);
                          }}
                          disabled={isAssessing}
                          className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                        >
                          {isAssessing ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Assessing...
                            </>
                          ) : assessments.length > 0 ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Re-assess
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Assess Eligibility
                            </>
                          )}
                        </Button>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-foreground/70" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-foreground/70" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      {assessments.length === 0 ? (
                        <div className="p-6 bg-gray-800/30 rounded-lg text-center">
                          <Target className="w-8 h-8 text-foreground/50 mx-auto mb-2" />
                          <p className="text-foreground/70 text-sm">
                            Click "Assess Eligibility" to analyse this idea against funding programmes
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Best Match Highlight */}
                          {bestMatch?.result && (
                            <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-lg border border-emerald-500/20">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                  <span className="font-medium text-white">Best Match: {bestMatch.program.name}</span>
                                </div>
                                <Badge className={getStatusColor(bestMatch.result.eligibilityStatus)}>
                                  {bestMatch.result.eligibilityScore}% Match
                                </Badge>
                              </div>
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="text-foreground/70">Estimated Funding:</span>
                                  <p className="text-white font-medium">
                                    {formatCurrency(bestMatch.result.estimatedFunding)}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-foreground/70">Application Readiness:</span>
                                  <p className="text-white font-medium">{bestMatch.result.applicationReadiness}%</p>
                                </div>
                                <div>
                                  <span className="text-foreground/70">Provider:</span>
                                  <p className="text-white font-medium">{bestMatch.program.provider}</p>
                                </div>
                              </div>
                              {bestMatch.result.recommendations.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-emerald-500/20">
                                  <p className="text-sm text-foreground/70 mb-1">Top Recommendation:</p>
                                  <p className="text-sm text-emerald-300">{bestMatch.result.recommendations[0]}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* All Assessments */}
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium text-foreground/70">All Assessments</h4>
                            {assessments
                              .sort((a, b) => (b.result?.eligibilityScore || 0) - (a.result?.eligibilityScore || 0))
                              .map(({ program, result }) => (
                                <div 
                                  key={program.programId}
                                  className="p-3 bg-gray-800/50 rounded-lg"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <span className="text-lg">
                                        {program.country === "UAE" ? "🇦🇪" : "🇬🇧"}
                                      </span>
                                      <div>
                                        <span className="text-white font-medium">{program.name}</span>
                                        <p className="text-xs text-foreground/60">{program.provider}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      {result && (
                                        <>
                                          <div className="text-right">
                                            <p className="text-sm text-foreground/70">Score</p>
                                            <p className="text-lg font-bold text-white">{result.eligibilityScore}%</p>
                                          </div>
                                          <Badge className={getStatusColor(result.eligibilityStatus)}>
                                            {getStatusLabel(result.eligibilityStatus)}
                                          </Badge>
                                        </>
                                      )}
                                      <a 
                                        href={program.websiteUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-foreground/70 hover:text-cyan-400"
                                      >
                                        <ExternalLink className="w-4 h-4" />
                                      </a>
                                    </div>
                                  </div>
                                  
                                  {result && (
                                    <div className="mt-3 pt-3 border-t border-gray-700">
                                      <div className="flex gap-6">
                                        {/* Strengths */}
                                        {result.strengths.length > 0 && (
                                          <div className="flex-1">
                                            <p className="text-xs text-emerald-400 mb-1 flex items-center gap-1">
                                              <CheckCircle2 className="w-3 h-3" /> Strengths
                                            </p>
                                            <ul className="text-xs text-foreground/70 space-y-0.5">
                                              {result.strengths.slice(0, 2).map((s, i) => (
                                                <li key={i}>• {s}</li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                        
                                        {/* Gaps */}
                                        {result.gaps.length > 0 && (
                                          <div className="flex-1">
                                            <p className="text-xs text-amber-400 mb-1 flex items-center gap-1">
                                              <AlertCircle className="w-3 h-3" /> Gaps
                                            </p>
                                            <ul className="text-xs text-foreground/70 space-y-0.5">
                                              {result.gaps.slice(0, 2).map((g, i) => (
                                                <li key={i}>• {g}</li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      )}

      {/* Programs Overview */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            Available Funding Programmes
          </CardTitle>
          <CardDescription>
            {programs?.length || 0} programmes available for assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {/* UAE Programs */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="text-2xl">🇦🇪</span> UAE Programs
              </h3>
              <div className="space-y-2">
                {programs?.filter(p => p.country === "UAE").slice(0, 4).map((program) => (
                  <div key={program.programId} className="p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">{program.name}</span>
                      <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 capitalize">
                        {program.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground/70 mt-1">
                      {program.fundingMax > 0 
                        ? `Up to ${formatCurrency(program.fundingMax)}`
                        : program.description.slice(0, 50) + '...'
                      }
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* UK Programs */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="text-2xl">🇬🇧</span> UK Programs
              </h3>
              <div className="space-y-2">
                {programs?.filter(p => p.country === "UK").slice(0, 4).map((program) => (
                  <div key={program.programId} className="p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">{program.name}</span>
                      <Badge variant="outline" className="border-blue-500/50 text-blue-400 capitalize">
                        {program.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground/70 mt-1">
                      {program.fundingMax > 0 
                        ? `Up to ${formatCurrency(program.fundingMax, "GBP")}`
                        : program.description.slice(0, 50) + '...'
                      }
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
