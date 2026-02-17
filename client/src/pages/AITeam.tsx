import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, Building2, Search, Star, AlertTriangle, TrendingUp, 
  Mic, ChevronRight, X, MessageSquare, Zap, Target, Brain,
  Filter, SortAsc, Grid3X3, List
} from 'lucide-react';
import { allExperts, corporatePartners, categories, getTopPerformers, getExpertsNeedingReview, getLeftFieldExperts, getCelebrityExperts, AIExpert, CorporatePartner } from '@/data/aiExperts';

export default function AITeam() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedExpert, setSelectedExpert] = useState<AIExpert | null>(null);
  const [selectedCorporate, setSelectedCorporate] = useState<CorporatePartner | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [feedbackNote, setFeedbackNote] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const filteredExperts = allExperts.filter(expert => {
    const matchesSearch = expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         expert.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || expert.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const topPerformers = getTopPerformers(5);
  const needsReview = getExpertsNeedingReview();

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 85) return 'bg-green-500/20 border-green-500/30';
    if (score >= 70) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  const handleStartProject = (expert: AIExpert) => {
    setLocation(`/ai-experts?mission=${encodeURIComponent(`Work with ${expert.name} on ${expert.specialty}`)}`);
  };

  const handleSendForTraining = (expert: AIExpert) => {
    alert(`${expert.name} has been sent for overnight training. They will be enhanced by morning.`);
    setSelectedExpert(null);
  };

  const handleFireExpert = (expert: AIExpert) => {
    if (confirm(`Are you sure you want to replace ${expert.name}? A new expert will be generated.`)) {
      alert(`${expert.name} has been replaced. A new ${expert.specialty} expert is being generated.`);
      setSelectedExpert(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-fuchsia-500 bg-clip-text text-transparent">
            AI Expert Team
          </h1>
          <p className="text-foreground/70 mt-1">287 AI Experts (250 Core + 25 Left Field + 5 Celebrity + 7 Corporate)</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-fuchsia-500/20 text-fuchsia-400' : 'text-foreground/70'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-fuchsia-500/20 text-fuchsia-400' : 'text-foreground/70'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Users className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-cyan-400">{allExperts.length}</p>
              <p className="text-xs text-foreground/70">Individual Experts</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-fuchsia-500/10 to-fuchsia-500/5 border border-fuchsia-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-fuchsia-500/20 rounded-lg">
              <Building2 className="w-5 h-5 text-fuchsia-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-fuchsia-400">{corporatePartners.length}</p>
              <p className="text-xs text-foreground/70">Corporate Partners</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Star className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{topPerformers.length}</p>
              <p className="text-xs text-foreground/70">Top Performers</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-400">{needsReview.length}</p>
              <p className="text-xs text-foreground/70">Needs Review</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="individuals" className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="individuals" className="data-[state=active]:bg-fuchsia-500/20">
            <Users className="w-4 h-4 mr-2" />
            Individual Experts ({allExperts.length})
          </TabsTrigger>
          <TabsTrigger value="corporate" className="data-[state=active]:bg-fuchsia-500/20">
            <Building2 className="w-4 h-4 mr-2" />
            Corporate Partners ({corporatePartners.length})
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-fuchsia-500/20">
            <TrendingUp className="w-4 h-4 mr-2" />
            Performance Review
          </TabsTrigger>
        </TabsList>

        {/* Individual Experts Tab */}
        <TabsContent value="individuals" className="space-y-6">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/70" />
              <Input
                placeholder="Search experts by name or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10"
              />
            </div>
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="bg-white/5 border border-white/10 rounded-lg px-4 text-sm"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Expert Grid */}
          <div className={viewMode === 'grid' ? 'grid grid-cols-4 gap-4' : 'space-y-3'}>
            {filteredExperts.slice(0, 50).map(expert => (
              <div
                key={expert.id}
                onClick={() => setSelectedExpert(expert)}
                className={`cursor-pointer transition-all hover:scale-[1.02] ${
                  viewMode === 'grid' 
                    ? 'bg-white/5 border border-white/10 rounded-xl p-4 hover:border-fuchsia-500/50'
                    : 'bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4 hover:border-fuchsia-500/50'
                }`}
              >
                <div className={viewMode === 'grid' ? 'text-center' : 'flex items-center gap-4 flex-1'}>
                  <div className={`text-4xl ${viewMode === 'list' ? '' : 'mb-3'}`}>{expert.avatar}</div>
                  <div className={viewMode === 'list' ? 'flex-1' : ''}>
                    <h3 className="font-semibold text-white">{expert.name}</h3>
                    <p className="text-xs text-foreground/70 mt-1">{expert.specialty}</p>
                    {viewMode === 'list' && (
                      <p className="text-xs text-foreground/60">{expert.category}</p>
                    )}
                  </div>
                </div>
                <div className={`flex items-center justify-between ${viewMode === 'grid' ? 'mt-3' : ''}`}>
                  <Badge variant="outline" className={`${getScoreBg(expert.performanceScore)} ${getScoreColor(expert.performanceScore)} border`}>
                    {expert.performanceScore}%
                  </Badge>
                  {viewMode === 'list' && (
                    <div className="flex items-center gap-4 text-xs text-foreground/70">
                      <span>{expert.projectsCompleted} projects</span>
                      <span>{expert.insightsGenerated} insights</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {filteredExperts.length > 50 && (
            <p className="text-center text-foreground/70 text-sm">
              Showing 50 of {filteredExperts.length} experts. Use search to find specific experts.
            </p>
          )}
        </TabsContent>

        {/* Corporate Partners Tab */}
        <TabsContent value="corporate" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {corporatePartners.map(partner => (
              <div
                key={partner.id}
                onClick={() => setSelectedCorporate(partner)}
                className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6 cursor-pointer hover:border-fuchsia-500/50 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="text-5xl">{partner.logo}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">{partner.name}</h3>
                    <p className="text-sm text-foreground/70">{partner.industry}</p>
                    <p className="text-xs text-foreground/60 mt-2">{partner.methodology}</p>
                  </div>
                  <Badge variant="outline" className={`${getScoreBg(partner.performanceScore)} ${getScoreColor(partner.performanceScore)} border`}>
                    {partner.performanceScore}%
                  </Badge>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {partner.strengths.slice(0, 4).map(strength => (
                    <Badge key={strength} variant="secondary" className="bg-white/5 text-foreground/80 text-xs">
                      {strength}
                    </Badge>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-foreground/70">{partner.projectsCompleted} projects completed</span>
                  <Button size="sm" variant="outline" className="border-fuchsia-500/50 text-fuchsia-400 hover:bg-fuchsia-500/10">
                    Start Project
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Performance Review Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Top Performers */}
            <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-green-400 flex items-center gap-2 mb-4">
                <Star className="w-5 h-5" />
                Top Performers
              </h3>
              <div className="space-y-3">
                {topPerformers.map((expert, index) => (
                  <div key={expert.id} className="flex items-center gap-3 bg-black/20 rounded-lg p-3">
                    <span className="text-2xl font-bold text-green-400/50">#{index + 1}</span>
                    <span className="text-2xl">{expert.avatar}</span>
                    <div className="flex-1">
                      <p className="font-medium text-white">{expert.name}</p>
                      <p className="text-xs text-foreground/70">{expert.specialty}</p>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      {expert.performanceScore}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Needs Review */}
            <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-orange-400 flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5" />
                Needs Review ({needsReview.length})
              </h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {needsReview.slice(0, 10).map(expert => (
                  <div key={expert.id} className="flex items-center gap-3 bg-black/20 rounded-lg p-3">
                    <span className="text-2xl">{expert.avatar}</span>
                    <div className="flex-1">
                      <p className="font-medium text-white">{expert.name}</p>
                      <p className="text-xs text-foreground/70">{expert.specialty}</p>
                    </div>
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                      {expert.performanceScore}%
                    </Badge>
                    <Button size="sm" variant="ghost" className="text-orange-400 hover:bg-orange-500/10">
                      Review
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chief of Staff Assessment */}
          <div className="bg-gradient-to-br from-fuchsia-500/10 to-cyan-500/10 border border-fuchsia-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-fuchsia-400 flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5" />
              Chief of Staff Team Assessment
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-black/20 rounded-lg p-4">
                <p className="text-sm text-foreground/70">Average Performance</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {Math.round(allExperts.reduce((acc, e) => acc + e.performanceScore, 0) / allExperts.length)}%
                </p>
                <Progress value={Math.round(allExperts.reduce((acc, e) => acc + e.performanceScore, 0) / allExperts.length)} className="mt-2" />
              </div>
              <div className="bg-black/20 rounded-lg p-4">
                <p className="text-sm text-foreground/70">Total Projects</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {allExperts.reduce((acc, e) => acc + e.projectsCompleted, 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-black/20 rounded-lg p-4">
                <p className="text-sm text-foreground/70">Insights Generated</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {allExperts.reduce((acc, e) => acc + e.insightsGenerated, 0).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-black/20 rounded-lg">
              <p className="text-sm text-foreground/80">
                <span className="text-fuchsia-400 font-medium">Chief of Staff Assessment:</span> Your team is performing well overall. 
                {needsReview.length > 0 && ` ${needsReview.length} experts need attention - consider sending them for overnight training.`}
                {' '}Top performers are excelling in Investment & Finance and Technology categories.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Expert Detail Modal */}
      {selectedExpert && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="text-6xl">{selectedExpert.avatar}</div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedExpert.name}</h2>
                    <p className="text-foreground/70">{selectedExpert.specialty}</p>
                    <Badge variant="outline" className="mt-2">{selectedExpert.category}</Badge>
                  </div>
                </div>
                <button onClick={() => setSelectedExpert(null)} className="text-foreground/70 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Performance Score */}
              <div className={`rounded-xl p-4 mb-6 ${getScoreBg(selectedExpert.performanceScore)} border`}>
                <div className="flex items-center justify-between">
                  <span className="text-foreground/80">Performance Score</span>
                  <span className={`text-3xl font-bold ${getScoreColor(selectedExpert.performanceScore)}`}>
                    {selectedExpert.performanceScore}%
                  </span>
                </div>
                <Progress value={selectedExpert.performanceScore} className="mt-2" />
              </div>

              {/* Bio */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-foreground/70 mb-2">Background</h3>
                <p className="text-foreground/80">{selectedExpert.bio}</p>
              </div>

              {/* Composite Of */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-foreground/70 mb-2">Composite Influences</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedExpert.compositeOf.map(influence => (
                    <Badge key={influence} variant="secondary" className="bg-fuchsia-500/10 text-fuchsia-300">
                      {influence}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-green-400 mb-2">Strengths</h3>
                  <ul className="space-y-1">
                    {selectedExpert.strengths.map(s => (
                      <li key={s} className="text-sm text-foreground/80 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-orange-400 mb-2">Weaknesses</h3>
                  <ul className="space-y-1">
                    {selectedExpert.weaknesses.map(w => (
                      <li key={w} className="text-sm text-foreground/80 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Thinking Style */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-foreground/70 mb-2">Thinking Style</h3>
                <p className="text-foreground/80 italic">"{selectedExpert.thinkingStyle}"</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-cyan-400">{selectedExpert.projectsCompleted}</p>
                  <p className="text-xs text-foreground/70">Projects</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-fuchsia-400">{selectedExpert.insightsGenerated}</p>
                  <p className="text-xs text-foreground/70">Insights</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <p className="text-sm font-medium text-foreground/80">{selectedExpert.lastUsed}</p>
                  <p className="text-xs text-foreground/70">Last Used</p>
                </div>
              </div>

              {/* Development Plan / Feedback */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-foreground/70 mb-2">Development Plan (Voice Note)</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type feedback or use voice..."
                    value={feedbackNote}
                    onChange={(e) => setFeedbackNote(e.target.value)}
                    className="flex-1 bg-white/5 border-white/10"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsRecording(!isRecording)}
                    className={isRecording ? 'bg-red-500/20 border-red-500 text-red-400' : 'border-white/20'}
                  >
                    <Mic className={`w-4 h-4 ${isRecording ? 'animate-pulse' : ''}`} />
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button 
                  onClick={() => handleStartProject(selectedExpert)}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:opacity-90"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Start Project
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleSendForTraining(selectedExpert)}
                  className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Send for Training
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleFireExpert(selectedExpert)}
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  <X className="w-4 h-4 mr-2" />
                  Replace
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Corporate Partner Detail Modal */}
      {selectedCorporate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-white/10 rounded-2xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="text-6xl">{selectedCorporate.logo}</div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedCorporate.name}</h2>
                    <p className="text-foreground/70">{selectedCorporate.industry}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedCorporate(null)} className="text-foreground/70 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className={`rounded-xl p-4 mb-6 ${getScoreBg(selectedCorporate.performanceScore)} border`}>
                <div className="flex items-center justify-between">
                  <span className="text-foreground/80">Performance Score</span>
                  <span className={`text-3xl font-bold ${getScoreColor(selectedCorporate.performanceScore)}`}>
                    {selectedCorporate.performanceScore}%
                  </span>
                </div>
                <Progress value={selectedCorporate.performanceScore} className="mt-2" />
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-foreground/70 mb-2">Methodology</h3>
                <p className="text-foreground/80">{selectedCorporate.methodology}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-foreground/70 mb-2">Strengths</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCorporate.strengths.map(s => (
                    <Badge key={s} variant="secondary" className="bg-green-500/10 text-green-300">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-foreground/70 mb-2">Frameworks</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCorporate.frameworks.map(f => (
                    <Badge key={f} variant="secondary" className="bg-fuchsia-500/10 text-fuchsia-300">
                      {f}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button className="flex-1 bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:opacity-90">
                  <Zap className="w-4 h-4 mr-2" />
                  Start Project with {selectedCorporate.name}
                </Button>
                <Button variant="outline" className="border-fuchsia-500/50 text-fuchsia-400 hover:bg-fuchsia-500/10">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Compare vs My Team
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
