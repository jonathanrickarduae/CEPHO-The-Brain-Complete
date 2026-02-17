import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { useFavorites } from "@/components/project-management/MyBoard";
import { DirectExpertChat } from "@/components/expert-evolution/DirectExpertChat";
import { CorporatePartnerChat } from "@/components/ai-agents/CorporatePartnerChat";
import { 
  Search, Users, Star, MessageSquare, Video, 
  Filter, ChevronRight, Brain, Sparkles,
  TrendingUp, Award, BookOpen, Building2, Target, Zap, Loader2
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { 
  AI_EXPERTS, 
  categories, 
  searchExperts,
  TOTAL_EXPERTS,
  corporatePartners,
  type AIExpert,
  type CorporatePartner
} from "@/data/ai-experts.data";
import { getAvatarUrl } from "@/data/avatar-mappings.data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ExpertDirectoryProps {
  onSelectExpert?: (expert: AIExpert) => void;
  onBack?: () => void;
}

export function ExpertDirectory({ onSelectExpert, onBack }: ExpertDirectoryProps) {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedExpert, setSelectedExpert] = useState<AIExpert | null>(null);
  const [chatExpertId, setChatExpertId] = useState<string | null>(null);
  const [chatPartnerId, setChatPartnerId] = useState<string | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<CorporatePartner | null>(null);
  const [showPartnersOnly, setShowPartnersOnly] = useState(false);
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  // Fetch personalized recommendations
  const { data: recommendations, isLoading: recommendationsLoading } = trpc.expertRecommendation.getRecommendations.useQuery(
    { limit: 5 },
    { staleTime: 5 * 60 * 1000 } // Cache for 5 minutes
  );

  // Filter experts based on search and category
  const filteredExperts = useMemo(() => {
    let results = AI_EXPERTS;
    
    if (searchQuery.trim()) {
      results = searchExperts(searchQuery);
    }
    
    if (selectedCategory) {
      results = results.filter(e => e.category === selectedCategory);
    }
    
    return results.sort((a, b) => b.performanceScore - a.performanceScore);
  }, [searchQuery, selectedCategory]);

  // Filter corporate partners based on search
  const filteredPartners = useMemo(() => {
    if (!searchQuery.trim()) return corporatePartners;
    const query = searchQuery.toLowerCase();
    return corporatePartners.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.industry.toLowerCase().includes(query) ||
      p.methodology.toLowerCase().includes(query) ||
      p.strengths.some(s => s.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  // Get unique categories with counts
  const categoryStats = useMemo(() => {
    const stats = new Map<string, number>();
    AI_EXPERTS.forEach(expert => {
      stats.set(expert.category, (stats.get(expert.category) || 0) + 1);
    });
    return Array.from(stats.entries()).sort((a, b) => b[1] - a[1]);
  }, []);

  const handleChatWithExpert = (expert: AIExpert) => {
    setChatExpertId(expert.id);
  };

  const handleChatWithPartner = (partner: CorporatePartner) => {
    setChatPartnerId(partner.id);
  };

  const handleVideoMeeting = (expert: AIExpert) => {
    setLocation(`/video-studio?expert=${expert.id}&name=${encodeURIComponent(expert.name)}`);
  };

  // Corporate Partner Chat View
  if (chatPartnerId) {
    return (
      <CorporatePartnerChat 
        partnerId={chatPartnerId} 
        onClose={() => setChatPartnerId(null)} 
      />
    );
  }

  // Direct Chat View
  if (chatExpertId) {
    return (
      <DirectExpertChat 
        expertId={chatExpertId} 
        onClose={() => setChatExpertId(null)} 
      />
    );
  }

  // Corporate Partner Profile View
  if (selectedPartner) {
    return (
      <div className="h-full bg-background">
        <div className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedPartner(null)}
              className="mb-2"
            >
              ← Back to Directory
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[calc(100%-80px)]">
          <div className="max-w-4xl mx-auto px-4 py-6">
            {/* Partner Header */}
            <div className="flex items-start gap-6 mb-8">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center text-5xl">
                {selectedPartner.logo}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-1">{selectedPartner.name}</h1>
                <p className="text-lg text-blue-400 mb-2">{selectedPartner.industry}</p>
                <div className="flex items-center gap-3">
                  <Badge className="bg-blue-500/20 text-blue-400 border-0">
                    Corporate Partner
                  </Badge>
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-0">
                    <Star className="w-3 h-3 mr-1" />
                    {selectedPartner.performanceScore}% Performance
                  </Badge>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex gap-3 mb-8">
              <Button 
                onClick={() => handleChatWithPartner(selectedPartner)}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat with {selectedPartner.name}
              </Button>
            </div>

            {/* Methodology */}
            <Card className="mb-6 bg-card/60 border-border">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  Methodology
                </h2>
                <p className="text-muted-foreground leading-relaxed">{selectedPartner.methodology}</p>
              </CardContent>
            </Card>

            {/* Thinking Framework */}
            {selectedPartner.thinkingFramework && (
              <Card className="mb-6 bg-card/60 border-border">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-cyan-400" />
                    Thinking Framework
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">{selectedPartner.thinkingFramework}</p>
                </CardContent>
              </Card>
            )}

            {/* Frameworks */}
            <Card className="mb-6 bg-card/60 border-border">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  Frameworks & Tools
                </h2>
                <div className="flex flex-wrap gap-2">
                  {selectedPartner.frameworks.map((framework, idx) => (
                    <Badge key={idx} variant="outline" className="text-sm py-1 px-3">
                      {framework}
                    </Badge>
                  ))}
                  {selectedPartner.signatureTools?.map((tool, idx) => (
                    <Badge key={`tool-${idx}`} className="bg-blue-500/10 text-blue-400 border-0 text-sm py-1 px-3">
                      {tool}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Strengths & Key Principles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card className="bg-card/60 border-border">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    Strengths
                  </h2>
                  <ul className="space-y-2">
                    {selectedPartner.strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {selectedPartner.keyPrinciples && (
                <Card className="bg-card/60 border-border">
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5 text-amber-400" />
                      Key Principles
                    </h2>
                    <ul className="space-y-2">
                      {selectedPartner.keyPrinciples.map((principle, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          {principle}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Stats */}
            <Card className="bg-card/60 border-border">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Performance Stats</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-secondary/30 rounded-xl">
                    <p className="text-2xl font-bold text-foreground">{selectedPartner.projectsCompleted}</p>
                    <p className="text-sm text-muted-foreground">Projects</p>
                  </div>
                  <div className="text-center p-4 bg-secondary/30 rounded-xl">
                    <p className="text-2xl font-bold text-foreground">{selectedPartner.performanceScore}%</p>
                    <p className="text-sm text-muted-foreground">Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Expert Profile View
  if (selectedExpert) {
    return (
      <div className="h-full bg-background">
        <div className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedExpert(null)}
              className="mb-2"
            >
              ← Back to Directory
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[calc(100%-80px)]">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-start gap-6 mb-8">
              {selectedExpert.avatarUrl ? (
                <img alt="Expert profile" 
                  src={selectedExpert.avatarUrl} 
                  alt={selectedExpert.name}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-cyan-500/30"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center text-4xl">
                  {selectedExpert.avatar}
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-1">{selectedExpert.name}</h1>
                <p className="text-lg text-primary mb-2">{selectedExpert.specialty}</p>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{selectedExpert.category}</Badge>
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-0">
                    <Star className="w-3 h-3 mr-1" />
                    {selectedExpert.performanceScore}% Performance
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mb-8">
              <Button 
                onClick={() => handleChatWithExpert(selectedExpert)}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat with {selectedExpert.name.split(' ')[0]}
              </Button>
              <Button 
                onClick={() => handleVideoMeeting(selectedExpert)}
                variant="outline"
                className="flex-1"
              >
                <Video className="w-4 h-4 mr-2" />
                Video Meeting
              </Button>
            </div>

            <Card className="mb-6 bg-card/60 border-border">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  About
                </h2>
                <p className="text-muted-foreground leading-relaxed">{selectedExpert.bio}</p>
              </CardContent>
            </Card>

            <Card className="mb-6 bg-card/60 border-border">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  Modeled After
                </h2>
                <div className="flex flex-wrap gap-2">
                  {selectedExpert.compositeOf.map((person, idx) => (
                    <Badge key={idx} variant="outline" className="text-sm py-1 px-3">
                      {person}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card className="bg-card/60 border-border">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    Strengths
                  </h2>
                  <ul className="space-y-2">
                    {selectedExpert.strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-card/60 border-border">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    Areas to Note
                  </h2>
                  <ul className="space-y-2">
                    {selectedExpert.weaknesses.map((weakness, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-6 bg-card/60 border-border">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-cyan-400" />
                  Thinking Style
                </h2>
                <p className="text-muted-foreground">{selectedExpert.thinkingStyle}</p>
              </CardContent>
            </Card>

            <Card className="bg-card/60 border-border">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Performance Stats</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-secondary/30 rounded-xl">
                    <p className="text-2xl font-bold text-foreground">{selectedExpert.projectsCompleted}</p>
                    <p className="text-sm text-muted-foreground">Projects</p>
                  </div>
                  <div className="text-center p-4 bg-secondary/30 rounded-xl">
                    <p className="text-2xl font-bold text-foreground">{selectedExpert.insightsGenerated}</p>
                    <p className="text-sm text-muted-foreground">Insights</p>
                  </div>
                  <div className="text-center p-4 bg-secondary/30 rounded-xl">
                    <p className="text-2xl font-bold text-foreground">{selectedExpert.performanceScore}%</p>
                    <p className="text-sm text-muted-foreground">Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Directory View
  return (
    <div className="h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 mb-4">
            {onBack && (
              <Button variant="ghost" onClick={onBack} className="mr-2">
                ← Action Engine
              </Button>
            )}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Expert Directory</h1>
                <p className="text-sm text-muted-foreground">{TOTAL_EXPERTS} AI experts + {corporatePartners.length} Corporate Partners</p>
              </div>
            </div>
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search experts, partners, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-secondary/50"
                />
              </div>
            </div>
          </div>

          {/* Tab Toggle: Partners vs Experts */}
          <div className="flex gap-2 mb-3">
            <Button
              variant={!showPartnersOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowPartnersOnly(false)}
              className="whitespace-nowrap"
            >
              <Users className="w-4 h-4 mr-1" />
              AI Experts ({TOTAL_EXPERTS})
            </Button>
            <Button
              variant={showPartnersOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowPartnersOnly(true)}
              className={`whitespace-nowrap ${showPartnersOnly ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
            >
              <Building2 className="w-4 h-4 mr-1" />
              Corporate Partners ({corporatePartners.length})
            </Button>
          </div>

          {/* Category Filter (only for experts) */}
          {!showPartnersOnly && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="whitespace-nowrap"
              >
                All ({TOTAL_EXPERTS})
              </Button>
              {categoryStats.map(([category, count]) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap"
                >
                  {category} ({count})
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="h-[calc(100%-180px)]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          
          {/* Corporate Partners Section */}
          {showPartnersOnly ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPartners.map((partner) => (
                <Card 
                  key={partner.id}
                  className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/20 hover:border-blue-500/50 transition-all cursor-pointer group"
                  onClick={() => setSelectedPartner(partner)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center text-3xl flex-shrink-0">
                        {partner.logo}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-foreground group-hover:text-blue-400 transition-colors">
                          {partner.name}
                        </h3>
                        <p className="text-sm text-blue-400/80">{partner.industry}</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {partner.methodology}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {partner.frameworks.slice(0, 3).map((framework, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {framework}
                        </Badge>
                      ))}
                      {partner.frameworks.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{partner.frameworks.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-yellow-500/10 text-yellow-400 border-0 text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          {partner.performanceScore}%
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {partner.projectsCompleted} projects
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleChatWithPartner(partner);
                        }}
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Chat
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {/* Recommended For You Section - Made More Prominent */}
              {!selectedCategory && !searchQuery && recommendations && recommendations.length > 0 && (
                <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-fuchsia-500/10 via-purple-500/5 to-pink-500/10 border-2 border-fuchsia-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-fuchsia-500/20 animate-pulse">
                        <Zap className="w-6 h-6 text-fuchsia-400" />
                      </div>
                      <span>Recommended For You</span>
                      <Badge className="bg-fuchsia-500/20 text-fuchsia-400 border-0 ml-2">AI-Powered</Badge>
                    </h2>
                    <span className="text-sm text-muted-foreground">Based on your consultation history</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {recommendations.map((rec) => {
                      // Find the actual expert from AI_EXPERTS
                      const expert = AI_EXPERTS.find(e => 
                        e.id === rec.expertId || 
                        e.name.toLowerCase().replace(/\s+/g, '-') === rec.expertId
                      );
                      
                      return (
                        <Card 
                          key={rec.expertId}
                          className="bg-gradient-to-br from-fuchsia-500/5 to-purple-500/5 border-fuchsia-500/20 hover:border-fuchsia-500/50 transition-all cursor-pointer group"
                          onClick={() => {
                            if (expert) {
                              setSelectedExpert(expert);
                            } else {
                              // Navigate to chat directly if expert not in local data
                              setChatExpertId(rec.expertId);
                            }
                          }}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start gap-3 mb-2">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-purple-500/20 border border-fuchsia-500/30 flex items-center justify-center text-xl flex-shrink-0">
                                {rec.avatar}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm text-foreground group-hover:text-fuchsia-400 transition-colors truncate">
                                  {rec.expertName}
                                </h3>
                                <p className="text-xs text-muted-foreground truncate">{rec.specialty}</p>
                              </div>
                            </div>
                            <p className="text-xs text-fuchsia-400/80 line-clamp-2 mb-2">
                              {rec.reason}
                            </p>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">{rec.category}</Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-xs text-fuchsia-400 hover:text-fuchsia-300 hover:bg-fuchsia-500/10 h-7 px-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (expert) {
                                    handleChatWithExpert(expert);
                                  } else {
                                    setChatExpertId(rec.expertId);
                                  }
                                }}
                              >
                                <MessageSquare className="w-3 h-3 mr-1" />
                                Chat
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Loading state for recommendations */}
              {!selectedCategory && !searchQuery && recommendationsLoading && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Loader2 className="w-5 h-5 text-fuchsia-400 animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading recommendations...</span>
                  </div>
                </div>
              )}

              {/* Featured Corporate Partners Banner (when viewing experts) */}
              {!selectedCategory && !searchQuery && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-blue-400" />
                      Corporate Partners
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPartnersOnly(true)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      View All
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {corporatePartners.slice(0, 5).map((partner) => (
                      <Card 
                        key={partner.id}
                        className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/20 hover:border-blue-500/50 transition-all cursor-pointer group"
                        onClick={() => setSelectedPartner(partner)}
                      >
                        <CardContent className="p-3 text-center">
                          <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center text-2xl mb-2">
                            {partner.logo}
                          </div>
                          <h3 className="font-semibold text-sm text-foreground group-hover:text-blue-400 transition-colors truncate">
                            {partner.name}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">{partner.industry}</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="mt-2 w-full text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleChatWithPartner(partner);
                            }}
                          >
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Chat
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Expert Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredExperts.map((expert) => (
                  <Card 
                    key={expert.id}
                    className="bg-card/60 border-border hover:border-primary/50 transition-all cursor-pointer group"
                    onClick={() => setSelectedExpert(expert)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="relative w-12 h-12 flex-shrink-0">
                          {expert.avatarUrl && (
                            <img alt="Expert avatar" 
                              src={expert.avatarUrl} 
                              alt={expert.name}
                              className="absolute inset-0 w-12 h-12 rounded-xl object-cover border border-cyan-500/30"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                          <div 
                            className={`w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center text-2xl ${expert.avatarUrl ? 'opacity-0' : ''}`}
                          >
                            {expert.avatar}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white truncate group-hover:text-primary transition-colors">
                            {expert.name}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">{expert.specialty}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="text-xs">{expert.category}</Badge>
                        <Badge className="bg-yellow-500/10 text-yellow-400 border-0 text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          {expert.performanceScore}%
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {expert.bio.substring(0, 100)}...
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          {expert.compositeOf.slice(0, 2).map((person, idx) => (
                            <span key={idx} className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded">
                              {person.split(' ')[0]}
                            </span>
                          ))}
                          {expert.compositeOf.length > 2 && (
                            <span className="text-xs text-muted-foreground">+{expert.compositeOf.length - 2}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isFavorite(expert.id)) {
                                removeFavorite(expert.id);
                              } else {
                                addFavorite(expert.id);
                              }
                            }}
                            className="p-1 hover:bg-primary/10 rounded transition-colors"
                            title={isFavorite(expert.id) ? "Remove from board" : "Add to board"}
                          >
                            <Star className={`w-4 h-4 transition-colors ${
                              isFavorite(expert.id)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground hover:text-yellow-400'
                            }`} />
                          </button>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {filteredExperts.length === 0 && !showPartnersOnly && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No experts found matching your search.</p>
            </div>
          )}

          {filteredPartners.length === 0 && showPartnersOnly && (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No corporate partners found matching your search.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export default ExpertDirectory;
