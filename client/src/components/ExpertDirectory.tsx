import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useFavorites } from "./MyBoard";
import { 
  Search, Users, Star, MessageSquare, Video, 
  Filter, ChevronRight, Brain, Sparkles,
  TrendingUp, Award, BookOpen
} from "lucide-react";
import { 
  AI_EXPERTS, 
  categories, 
  searchExperts,
  TOTAL_EXPERTS,
  type AIExpert
} from "@/data/aiExperts";
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
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

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

  // Get unique categories with counts
  const categoryStats = useMemo(() => {
    const stats = new Map<string, number>();
    AI_EXPERTS.forEach(expert => {
      stats.set(expert.category, (stats.get(expert.category) || 0) + 1);
    });
    return Array.from(stats.entries()).sort((a, b) => b[1] - a[1]);
  }, []);

  const handleChatWithExpert = (expert: AIExpert) => {
    // Navigate to Chief of Staff with expert context
    setLocation(`/digital-twin?expert=${expert.id}&name=${encodeURIComponent(expert.name)}`);
  };

  const handleVideoMeeting = (expert: AIExpert) => {
    // Navigate to video studio with expert
    setLocation(`/video-studio?expert=${expert.id}&name=${encodeURIComponent(expert.name)}`);
  };

  // Expert Profile View
  if (selectedExpert) {
    return (
      <div className="h-full bg-background">
        {/* Header */}
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
            {/* Expert Header */}
            <div className="flex items-start gap-6 mb-8">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center text-4xl">
                {selectedExpert.avatar}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground mb-1">{selectedExpert.name}</h1>
                <p className="text-lg text-primary mb-2">{selectedExpert.specialty}</p>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{selectedExpert.category}</Badge>
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-0">
                    <Star className="w-3 h-3 mr-1" />
                    {selectedExpert.performanceScore}% Performance
                  </Badge>
                  <Badge className={
                    selectedExpert.status === 'active' ? "bg-green-500/20 text-green-400 border-0" :
                    selectedExpert.status === 'training' ? "bg-blue-500/20 text-blue-400 border-0" :
                    "bg-gray-500/20 text-gray-400 border-0"
                  }>
                    {selectedExpert.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
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

            {/* Bio */}
            <Card className="mb-6 bg-card/60 border-border">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  About
                </h2>
                <p className="text-muted-foreground leading-relaxed">{selectedExpert.bio}</p>
              </CardContent>
            </Card>

            {/* Composite Of */}
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

            {/* Strengths & Weaknesses */}
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

            {/* Thinking Style */}
            <Card className="mb-6 bg-card/60 border-border">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-cyan-400" />
                  Thinking Style
                </h2>
                <p className="text-muted-foreground">{selectedExpert.thinkingStyle}</p>
              </CardContent>
            </Card>

            {/* Stats */}
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
                <p className="text-sm text-muted-foreground">{TOTAL_EXPERTS} AI experts available</p>
              </div>
            </div>
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search experts by name, specialty, or skill..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-secondary/50"
                />
              </div>
            </div>
          </div>

          {/* Category Filter */}
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
        </div>
      </div>

      {/* Expert Grid */}
      <ScrollArea className="h-[calc(100%-160px)]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredExperts.map((expert) => (
              <Card 
                key={expert.id}
                className="bg-card/60 border-border hover:border-primary/50 transition-all cursor-pointer group"
                onClick={() => setSelectedExpert(expert)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center text-2xl flex-shrink-0">
                      {expert.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
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

          {filteredExperts.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No experts found matching your search.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export default ExpertDirectory;
