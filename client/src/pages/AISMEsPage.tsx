import { useState, useMemo, useEffect } from 'react';
import { useLocation } from "wouter";
import { 
  Users, Brain, Search, Star, MessageSquare, FileText,
  ChevronRight, Plus, Mic, MicOff, Send, Eye, CheckCircle2,
  Sparkles, Target, Clock, BarChart3, Filter, Grid, List, Trash2, Loader2,
  X, Activity, Trophy, TrendingUp, ArrowUpDown, SortAsc, SortDesc,
  Shield, Zap, AlertTriangle, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageHeader } from '@/components/layout/PageHeader';
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/useMobile";
import { trpc } from "@/lib/trpc";
import { 
  AI_EXPERTS, 
  categories as expertCategories, 
  searchExperts,
  getExpertsByCategory,
  TOTAL_EXPERTS,
  type AIExpert 
} from "@/data/ai-experts.data";
import {
  panelTypes,
  getExpertsByPanelType,
  getExpertPanelType,
  getPanelStats,
  getTopPerformersByPanel,
  type PanelType
} from "@/data/sme-panels.data";
import {
  expertTypes,
  getExpertsByType,
  getExpertTypeCounts,
  getSubcategoriesForType,
  getCorporatePartners,
  type ExpertType
} from "@/data/expert-types.data";
import { corporatePartners } from "@/data/ai-experts.data";
import { ExternalResources } from '@/components/shared/ExternalResources';

// Build categories from real expert data
const CATEGORIES = [
  { id: 'all', label: 'All Experts', count: TOTAL_EXPERTS },
  ...expertCategories.map(cat => {
    const count = AI_EXPERTS.filter(e => e.category === cat).length;
    return {
      id: cat.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      label: cat,
      count
    };
  })
];

// Sort options
type SortOption = 'performance' | 'name' | 'projects' | 'recent';

const SORT_OPTIONS: { id: SortOption; label: string; icon: typeof TrendingUp }[] = [
  { id: 'performance', label: 'Performance', icon: TrendingUp },
  { id: 'name', label: 'Name A-Z', icon: SortAsc },
  { id: 'projects', label: 'Projects', icon: BarChart3 },
  { id: 'recent', label: 'Recently Used', icon: Clock },
];

type ViewMode = 'browse' | 'leaderboard' | 'teams' | 'assemble' | 'external';

interface SelectedExpert {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export default function AISMEsPage() {
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<ViewMode>('browse');
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedExpertType, setSelectedExpertType] = useState<ExpertType | 'all'>('all');
  const [expandedTypes, setExpandedTypes] = useState<ExpertType[]>(['individuals']);
  const [selectedPanel, setSelectedPanel] = useState<PanelType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExperts, setSelectedExperts] = useState<SelectedExpert[]>([]);
  const [showExpertDetail, setShowExpertDetail] = useState<string | null>(null);
  const [taskDescription, setTaskDescription] = useState('');
  const [viewStyle, setViewStyle] = useState<'grid' | 'list'>('grid');
  const [teamName, setTeamName] = useState('');
  const [teamPurpose, setTeamPurpose] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('performance');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [compareExperts, setCompareExperts] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [favoriteExperts, setFavoriteExperts] = useState<string[]>(() => {
    const saved = localStorage.getItem('favoriteExperts');
    return saved ? JSON.parse(saved) : [];
  });

  // tRPC hooks for team management
  const utils = trpc.useUtils();
  const { data: savedTeams, isLoading: teamsLoading } = trpc.smeTeam.list.useQuery();
  
  // Consultation history
  const { data: consultationHistory } = trpc.expertConsultation.list.useQuery({ limit: 10 });
  const { data: consultationCounts } = trpc.expertConsultation.counts.useQuery();
  
  // Expert recommendations
  const { data: recommendations } = trpc.expertRecommendation.getRecommendations.useQuery({ limit: 5 });
  
  const createTeamMutation = trpc.smeTeam.create.useMutation({
    onSuccess: async (team) => {
      if (team) {
        for (const expert of selectedExperts) {
          await addMemberMutation.mutateAsync({
            teamId: team.id,
            expertId: expert.id,
            role: expert.role,
          });
        }
        toast.success(`Team "${team.name}" created with ${selectedExperts.length} members`);
        setSelectedExperts([]);
        setTeamName('');
        setTeamPurpose('');
        setTaskDescription('');
        setViewMode('teams');
        utils.smeTeam.list.invalidate();
      }
    },
    onError: (error) => {
      toast.error(`Failed to create team: ${error.message}`);
    },
  });

  const addMemberMutation = trpc.smeTeam.addMember.useMutation();
  
  const deleteTeamMutation = trpc.smeTeam.delete.useMutation({
    onSuccess: () => {
      toast.success('Team deleted');
      utils.smeTeam.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to delete team: ${error.message}`);
    },
  });

  // Get panel statistics
  const panelStats = useMemo(() => getPanelStats(), []);

  // Filter and sort experts
  const filteredExperts = useMemo(() => {
    let experts = AI_EXPERTS;
    
    // Filter by panel type
    if (selectedPanel !== 'all') {
      experts = getExpertsByPanelType(selectedPanel);
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      const selectedCat = CATEGORIES.find(c => c.id === selectedCategory);
      if (selectedCat) {
        experts = experts.filter(exp => exp.category === selectedCat.label);
      }
    }
    
    // Filter by search
    if (searchQuery) {
      const searchResults = searchExperts(searchQuery);
      const expertIds = new Set(experts.map(e => e.id));
      experts = searchResults.filter(e => expertIds.has(e.id));
    }
    
    // Sort
    experts = [...experts].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'performance':
          comparison = b.performanceScore - a.performanceScore;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'projects':
          comparison = b.projectsCompleted - a.projectsCompleted;
          break;
        case 'recent':
          comparison = new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
          break;
      }
      return sortDirection === 'desc' ? comparison : -comparison;
    });
    
    return experts;
  }, [selectedCategory, selectedPanel, searchQuery, sortBy, sortDirection]);

  // Toggle expert selection
  const toggleExpertSelection = (expert: AIExpert) => {
    const isSelected = selectedExperts.some(e => e.id === expert.id);
    if (isSelected) {
      setSelectedExperts(prev => prev.filter(e => e.id !== expert.id));
    } else {
      setSelectedExperts(prev => [...prev, { 
        id: expert.id, 
        name: expert.name, 
        role: expert.specialty, 
        avatar: expert.avatar 
      }]);
    }
  };

  // Toggle comparison selection (max 3)
  const toggleCompareExpert = (expertId: string) => {
    setCompareExperts(prev => {
      if (prev.includes(expertId)) {
        return prev.filter(id => id !== expertId);
      }
      if (prev.length >= 3) {
        toast.error("Maximum 3 experts for comparison");
        return prev;
      }
      return [...prev, expertId];
    });
  };

  // Toggle favorite expert
  const toggleFavorite = (expertId: string) => {
    setFavoriteExperts(prev => {
      const newFavorites = prev.includes(expertId)
        ? prev.filter(id => id !== expertId)
        : [...prev, expertId];
      localStorage.setItem('favoriteExperts', JSON.stringify(newFavorites));
      toast.success(prev.includes(expertId) ? 'Removed from favorites' : 'Added to favorites');
      return newFavorites;
    });
  };

  // Submit task to team
  const submitTaskToTeam = () => {
    if (!teamName.trim()) {
      toast.error("Please enter a team name");
      return;
    }
    if (selectedExperts.length === 0) {
      toast.error("Please select at least one expert");
      return;
    }
    
    createTeamMutation.mutate({
      name: teamName,
      description: taskDescription,
      purpose: teamPurpose || taskDescription,
    });
  };

  // Delete a team
  const handleDeleteTeam = (teamId: number) => {
    if (confirm('Are you sure you want to delete this team?')) {
      deleteTeamMutation.mutate({ teamId });
    }
  };

  const selectedExpert = showExpertDetail ? AI_EXPERTS.find(e => e.id === showExpertDetail) : null;
  const compareExpertData = compareExperts.map(id => AI_EXPERTS.find(e => e.id === id)).filter(Boolean) as typeof AI_EXPERTS;

  // Format date to UK format
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="h-[calc(100vh-56px)] md:h-screen flex flex-col bg-background">
      {/* Header */}
      <PageHeader 
        icon={Users} 
        title="AI-SMEs"
        subtitle={`${TOTAL_EXPERTS} Expert Specialists`}
        iconColor="text-cyan-400"
      >
        <div className="flex items-center gap-2">
          {compareExperts.length > 0 && (
            <Button 
              size="sm" 
              onClick={() => setShowCompareModal(true)}
              className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500"
            >
              <BarChart3 className="w-4 h-4" />
              Compare ({compareExperts.length})
            </Button>
          )}
          {selectedExperts.length > 0 && (
            <Badge className="bg-primary/20 text-primary">
              {selectedExperts.length} selected
            </Badge>
          )}
        </div>
      </PageHeader>

      {/* View Mode Tabs */}
      <div className="shrink-0 border-b border-white/10 bg-white/5 px-4 overflow-x-auto scrollbar-hide">
        <div className="max-w-7xl mx-auto flex gap-1">
          {[
            { id: 'browse', label: 'Browse', icon: Search },
            { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
            { id: 'teams', label: 'My Teams', icon: Users },
            { id: 'assemble', label: 'Assemble', icon: Plus },
            { id: 'external', label: 'External SMEs', icon: Globe },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id as ViewMode)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                viewMode === tab.id
                  ? 'text-cyan-400 border-cyan-400'
                  : 'text-foreground/70 border-transparent hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Panel Type Filter Bar */}
      <div className="shrink-0 border-b border-white/10 bg-white/5 px-4 py-2 overflow-x-auto scrollbar-hide">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <span className="text-xs text-foreground/70 mr-2 shrink-0">Panel:</span>
          <button
            onClick={() => setSelectedPanel('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0 ${
              selectedPanel === 'all'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-white/5 text-foreground/70 hover:bg-white/10'
            }`}
          >
            All Panels ({TOTAL_EXPERTS})
          </button>
          {(Object.keys(panelTypes) as PanelType[]).map(panelKey => {
            const panel = panelTypes[panelKey];
            const stats = panelStats[panelKey];
            return (
              <button
                key={panelKey}
                onClick={() => setSelectedPanel(panelKey)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0 ${
                  selectedPanel === panelKey
                    ? `${panel.bgColor} ${panel.color} border ${panel.borderColor}`
                    : 'bg-white/5 text-foreground/70 hover:bg-white/10'
                }`}
              >
                <span>{panel.icon}</span>
                <span>{panel.name}</span>
                <span className="opacity-70">({stats.count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Browse View */}
        {viewMode === 'browse' && (
          <>
            {/* Hierarchical Category Sidebar - Desktop */}
            {!isMobile && (
              <div className="w-64 border-r border-white/10 bg-white/5 overflow-y-auto">
                <div className="p-3">
                  {/* Recent Consultations */}
                  {consultationHistory && consultationHistory.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-xs font-semibold text-foreground/70 uppercase tracking-wider mb-2">Recent Chats</h3>
                      <div className="space-y-1">
                        {consultationHistory.slice(0, 3).map(consultation => {
                          const expert = AI_EXPERTS.find(e => e.id === consultation.expertId);
                          if (!expert) return null;
                          return (
                            <button
                              key={consultation.id}
                              onClick={() => setLocation(`/expert-chat/${expert.id}`)}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm hover:bg-white/5 text-foreground/70 hover:text-white transition-colors"
                            >
                              <span className="text-lg">{expert.avatar}</span>
                              <div className="flex-1 text-left truncate">
                                <div className="truncate">{expert.name}</div>
                                <div className="text-xs text-foreground/60">
                                  {formatDate(consultation.updatedAt.toString())}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Expert Types - Hierarchical */}
                  <h3 className="text-xs font-semibold text-foreground/70 uppercase tracking-wider mb-2">Browse By Type</h3>
                  <div className="space-y-1">
                    {/* All Experts */}
                    <button
                      onClick={() => { setSelectedExpertType('all'); setSelectedCategory('all'); }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${
                        selectedExpertType === 'all'
                          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30'
                          : 'hover:bg-white/5 text-foreground/70 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>🌐</span>
                        <span>All Experts</span>
                      </span>
                      <span className="text-xs">{TOTAL_EXPERTS + corporatePartners.length}</span>
                    </button>
                    
                    {/* Expert Type Categories */}
                    {(Object.keys(expertTypes) as ExpertType[]).map(typeKey => {
                      const typeConfig = expertTypes[typeKey];
                      const counts = getExpertTypeCounts();
                      const isExpanded = expandedTypes.includes(typeKey);
                      const subcategories = getSubcategoriesForType(typeKey);
                      
                      return (
                        <div key={typeKey}>
                          <button
                            onClick={() => {
                              setSelectedExpertType(typeKey);
                              setSelectedCategory('all');
                              setExpandedTypes(prev => 
                                prev.includes(typeKey) 
                                  ? prev.filter(t => t !== typeKey)
                                  : [...prev, typeKey]
                              );
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${
                              selectedExpertType === typeKey
                                ? `${typeConfig.bgColor} ${typeConfig.color} border ${typeConfig.borderColor}`
                                : 'hover:bg-white/5 text-foreground/70 hover:text-white'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span>{typeConfig.icon}</span>
                              <span>{typeConfig.name}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="text-xs">{counts[typeKey]}</span>
                              <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                            </span>
                          </button>
                          
                          {/* Subcategories */}
                          {isExpanded && subcategories.length > 0 && (
                            <div className="ml-4 mt-1 space-y-0.5 border-l border-white/10 pl-2">
                              {subcategories.map(subcat => {
                                const subcatId = subcat.toLowerCase().replace(/[^a-z0-9]/g, '-');
                                const subcatCount = typeKey === 'companies' 
                                  ? corporatePartners.filter(c => c.industry === subcat).length
                                  : AI_EXPERTS.filter(e => e.category === subcat).length;
                                return (
                                  <button
                                    key={subcatId}
                                    onClick={() => setSelectedCategory(subcatId)}
                                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors ${
                                      selectedCategory === subcatId
                                        ? 'bg-white/10 text-white'
                                        : 'text-foreground/60 hover:text-foreground/80 hover:bg-white/5'
                                    }`}
                                  >
                                    <span className="truncate">{subcat}</span>
                                    <span className="text-xs opacity-60">{subcatCount}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Expert Grid */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 sm:p-6">
                {/* Search and Sort Controls */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search experts by name or specialty..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-foreground/70">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white"
                    >
                      {SORT_OPTIONS.map(opt => (
                        <option key={opt.id} value={opt.id} className="bg-gray-900">{opt.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => setSortDirection(d => d === 'asc' ? 'desc' : 'asc')}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      {sortDirection === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  {/* View Style Toggle */}
                  <div className="flex items-center gap-1 border border-white/20 rounded-lg p-1">
                    <button
                      onClick={() => setViewStyle('grid')}
                      className={`p-2 rounded ${viewStyle === 'grid' ? 'bg-cyan-500/20 text-cyan-400' : 'text-foreground/70'}`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewStyle('list')}
                      className={`p-2 rounded ${viewStyle === 'list' ? 'bg-cyan-500/20 text-cyan-400' : 'text-foreground/70'}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Mobile Categories */}
                {isMobile && (
                  <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-4 px-4 scrollbar-hide">
                    {CATEGORIES.slice(0, 8).map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          selectedCategory === cat.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-muted-foreground'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Results Count */}
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-foreground/70">
                    Showing {filteredExperts.length} expert{filteredExperts.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Expert Cards */}
                <div className={viewStyle === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
                  : "space-y-2"
                }>
                  {filteredExperts.map(expert => {
                    const isSelected = selectedExperts.some(e => e.id === expert.id);
                    const isAvailable = expert.status === 'active';
                    const isInCompare = compareExperts.includes(expert.id);
                    const expertPanel = getExpertPanelType(expert);
                    const panelInfo = panelTypes[expertPanel];
                    
                    return (
                      <div
                        key={expert.id}
                        className={`p-4 bg-white/5 border-2 rounded-2xl transition-all cursor-pointer group relative ${
                          isInCompare
                            ? 'border-purple-500/50 bg-gradient-to-br from-purple-500/10 to-pink-500/10'
                            : isSelected 
                              ? 'border-cyan-500/50 bg-gradient-to-br from-cyan-500/10 to-blue-500/10' 
                              : 'border-white/10 hover:border-cyan-500/30'
                        } ${viewStyle === 'list' ? 'flex items-center gap-4' : ''}`}
                        onClick={() => setShowExpertDetail(expert.id)}
                      >
                        {/* Panel Badge */}
                        <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-medium ${panelInfo.bgColor} ${panelInfo.color} border ${panelInfo.borderColor}`}>
                          {panelInfo.icon} {panelInfo.name}
                        </div>
                        
                        <div className={`flex items-center gap-3 ${viewStyle === 'grid' ? 'mb-3 mt-6' : ''}`}>
                          <div className={`relative w-12 h-12 rounded-xl overflow-hidden group-hover:scale-110 transition-transform ${!isAvailable ? 'opacity-50' : ''}`}>
                            {expert.avatarUrl ? (
                              <img alt="SME expert profile" 
                                src={expert.avatarUrl} 
                                alt={expert.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div 
                              className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center text-lg"
                              style={{ display: expert.avatarUrl ? 'none' : 'flex' }}
                            >
                              {expert.avatar}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium truncate">{expert.name}</h4>
                              {!isAvailable && (
                                <Badge variant="outline" className="text-xs">{expert.status}</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{expert.category}</p>
                          </div>
                          {viewStyle === 'list' && (
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Activity className="w-4 h-4 text-cyan-400" />
                                <span className="text-sm">{expert.performanceScore}%</span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExpertSelection(expert);
                                }}
                                className={`p-2 rounded-lg transition-colors ${
                                  isSelected ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' : 'bg-white/10 hover:bg-white/20 text-foreground/70'
                                }`}
                              >
                                {isSelected ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {/* Favorite and Compare buttons */}
                        <div className="absolute top-2 right-2 flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(expert.id);
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${
                              favoriteExperts.includes(expert.id)
                                ? 'bg-yellow-500/20 text-yellow-400' 
                                : 'bg-white/10 hover:bg-white/20 text-foreground/70 opacity-0 group-hover:opacity-100'
                            }`}
                            title={favoriteExperts.includes(expert.id) ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            <Star className={`w-3 h-3 ${favoriteExperts.includes(expert.id) ? 'fill-current' : ''}`} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCompareExpert(expert.id);
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isInCompare 
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                                : 'bg-white/10 hover:bg-white/20 text-foreground/70 opacity-0 group-hover:opacity-100'
                            }`}
                            title="Add to comparison"
                          >
                            <BarChart3 className="w-3 h-3" />
                          </button>
                        </div>
                        
                        {viewStyle === 'grid' && (
                          <>
                            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{expert.specialty}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Activity className="w-3 h-3 text-cyan-400" />
                                  {expert.performanceScore}%
                                </span>
                                <span>{expert.projectsCompleted} projects</span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExpertSelection(expert);
                                }}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  isSelected ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' : 'bg-white/10 hover:bg-white/20 text-foreground/70'
                                }`}
                              >
                                {isSelected ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Leaderboard View */}
        {viewMode === 'leaderboard' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Recommended For You Section */}
              {recommendations && recommendations.length > 0 && (
                <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-2 border-pink-500/30 rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-pink-400">Recommended For You</h3>
                      <p className="text-xs text-foreground/70">Based on your consultation history</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {recommendations.slice(0, 5).map((rec: any) => {
                      const expert = AI_EXPERTS.find(e => e.id === rec.expertId);
                      if (!expert) return null;
                      return (
                        <div 
                          key={rec.expertId}
                          className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
                          onClick={() => setLocation(`/expert-chat/${expert.id}`)}
                        >
                          <div className="w-10 h-10 rounded-xl overflow-hidden">
                            {expert.avatarUrl ? (
                              <img src={expert.avatarUrl} alt={expert.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center text-lg">
                                {expert.avatar}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{expert.name}</h4>
                            <p className="text-xs text-pink-400 truncate">{rec.reason}</p>
                          </div>
                          <Button size="sm" variant="ghost" className="shrink-0">
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Overall Leaderboard - Top 10 */}
              <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-b border-cyan-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-semibold">Top 10 Overall Performers</h3>
                  </div>
                  <Badge className="bg-cyan-500/20 text-cyan-400">All Panels</Badge>
                </div>
                <div className="divide-y divide-white/10">
                  {AI_EXPERTS
                    .sort((a, b) => b.performanceScore - a.performanceScore)
                    .slice(0, 10)
                    .map((expert, index) => {
                      const expertPanel = getExpertPanelType(expert);
                      const panelInfo = panelTypes[expertPanel];
                      return (
                        <div 
                          key={expert.id}
                          className="flex items-center gap-4 p-4 hover:bg-white/5 cursor-pointer transition-colors"
                          onClick={() => setShowExpertDetail(expert.id)}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                            index === 1 ? 'bg-gray-400/20 text-foreground/80' :
                            index === 2 ? 'bg-amber-600/20 text-amber-500' :
                            'bg-white/10 text-foreground/70'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="w-10 h-10 rounded-xl overflow-hidden">
                            {expert.avatarUrl ? (
                              <img src={expert.avatarUrl} alt={expert.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center text-lg">
                                {expert.avatar}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{expert.name}</h4>
                            <p className="text-sm text-foreground/70 truncate">{expert.specialty}</p>
                          </div>
                          <div className={`px-2 py-0.5 rounded-full text-[10px] ${panelInfo.bgColor} ${panelInfo.color}`}>
                            {panelInfo.icon} {panelInfo.name}
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-cyan-400">{expert.performanceScore}%</div>
                            <div className="text-xs text-foreground/70">{expert.projectsCompleted} projects</div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Panel Stats Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(Object.keys(panelTypes) as PanelType[]).map(panelKey => {
                  const panel = panelTypes[panelKey];
                  const stats = panelStats[panelKey];
                  return (
                    <div 
                      key={panelKey}
                      className={`p-4 rounded-2xl ${panel.bgColor} border ${panel.borderColor}`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{panel.icon}</span>
                        <div>
                          <h3 className={`font-semibold ${panel.color}`}>{panel.name}</h3>
                          <p className="text-xs text-foreground/70">{panel.description}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold">{stats.count}</div>
                          <div className="text-xs text-foreground/70">Experts</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{stats.avgScore}%</div>
                          <div className="text-xs text-foreground/70">Avg Score</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Top Performers by Panel */}
              {(Object.keys(panelTypes) as PanelType[]).map(panelKey => {
                const panel = panelTypes[panelKey];
                const topExperts = getTopPerformersByPanel(panelKey, 5);
                
                return (
                  <div key={panelKey} className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                    <div className={`px-4 py-3 ${panel.bgColor} border-b ${panel.borderColor} flex items-center gap-2`}>
                      <Trophy className={`w-5 h-5 ${panel.color}`} />
                      <h3 className="font-semibold">{panel.name} Leaderboard</h3>
                    </div>
                    <div className="divide-y divide-white/10">
                      {topExperts.map((expert, index) => (
                        <div 
                          key={expert.id}
                          className="flex items-center gap-4 p-4 hover:bg-white/5 cursor-pointer transition-colors"
                          onClick={() => setShowExpertDetail(expert.id)}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                            index === 1 ? 'bg-gray-400/20 text-foreground/80' :
                            index === 2 ? 'bg-amber-600/20 text-amber-500' :
                            'bg-white/10 text-foreground/70'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center text-lg">
                            {expert.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{expert.name}</h4>
                            <p className="text-sm text-foreground/70 truncate">{expert.specialty}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-cyan-400">{expert.performanceScore}%</div>
                            <div className="text-xs text-foreground/70">{expert.projectsCompleted} projects</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Teams View */}
        {viewMode === 'teams' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
              {teamsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 animate-pulse">
                      <div className="flex items-center justify-between mb-3">
                        <div className="space-y-2">
                          <div className="h-5 w-40 bg-white/10 rounded" />
                          <div className="h-3 w-64 bg-white/10 rounded" />
                        </div>
                        <div className="h-6 w-16 bg-white/10 rounded-full" />
                      </div>
                      <div className="flex gap-2">
                        {Array.from({ length: 4 }).map((_, j) => (
                          <div key={j} className="w-10 h-10 rounded-full bg-white/10" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : savedTeams && savedTeams.length > 0 ? (
                <div className="space-y-4">
                  {savedTeams.map(team => (
                    <div key={team.id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{team.name}</h3>
                          <p className="text-sm text-foreground/70">{team.purpose || team.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-emerald-500/10 text-emerald-400">Active</Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTeam(team.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-xs text-foreground/60">
                        Created: {formatDate(team.createdAt.toString())}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto mb-4 text-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">No Teams Yet</h3>
                  <p className="text-foreground/70 mb-4">Assemble your first expert team to get started</p>
                  <Button onClick={() => setViewMode('assemble')} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Assemble Team
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Assemble View */}
        {viewMode === 'assemble' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-4">Assemble Expert Team</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Team Name</label>
                    <Input
                      placeholder="e.g., Due Diligence Team"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Purpose</label>
                    <Input
                      placeholder="What will this team work on?"
                      value={teamPurpose}
                      onChange={(e) => setTeamPurpose(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Selected Experts ({selectedExperts.length})
                    </label>
                    {selectedExperts.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedExperts.map(expert => (
                          <div 
                            key={expert.id}
                            className="flex items-center gap-2 px-3 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full"
                          >
                            <span>{expert.avatar}</span>
                            <span className="text-sm">{expert.name}</span>
                            <button
                              onClick={() => setSelectedExperts(prev => prev.filter(e => e.id !== expert.id))}
                              className="text-foreground/70 hover:text-white"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-foreground/70">
                        Go to Browse tab to select experts
                      </p>
                    )}
                  </div>
                  
                  <Button 
                    onClick={submitTaskToTeam}
                    disabled={!teamName.trim() || selectedExperts.length === 0 || createTeamMutation.isPending}
                    className="w-full gap-2"
                  >
                    {createTeamMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Create Team
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* External Resources View */}
        {viewMode === 'external' && (
          <div className="flex-1 overflow-hidden">
            <ExternalResources />
          </div>
        )}
      </div>

      {/* Expert Detail Modal */}
      {showExpertDetail && selectedExpert && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/20 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center text-xl">
                  {selectedExpert.avatar}
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{selectedExpert.name}</h2>
                  <p className="text-sm text-foreground/70">{selectedExpert.category}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowExpertDetail(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Panel Badge */}
              {(() => {
                const expertPanel = getExpertPanelType(selectedExpert);
                const panelInfo = panelTypes[expertPanel];
                return (
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-4 ${panelInfo.bgColor} ${panelInfo.color} border ${panelInfo.borderColor}`}>
                    <span>{panelInfo.icon}</span>
                    <span>{panelInfo.name}</span>
                  </div>
                );
              })()}
              
              <p className="text-sm text-foreground/80 mb-4">{selectedExpert.bio}</p>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-white/5 rounded-xl">
                  <div className="text-2xl font-bold text-cyan-400">{selectedExpert.performanceScore}%</div>
                  <div className="text-xs text-foreground/70">Performance</div>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-xl">
                  <div className="text-2xl font-bold">{selectedExpert.projectsCompleted}</div>
                  <div className="text-xs text-foreground/70">Projects</div>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-xl">
                  <div className="text-2xl font-bold">{selectedExpert.insightsGenerated}</div>
                  <div className="text-xs text-foreground/70">Insights</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs text-foreground/70 uppercase tracking-wider mb-2">Specialty</h4>
                  <p className="text-sm">{selectedExpert.specialty}</p>
                </div>
                
                <div>
                  <h4 className="text-xs text-foreground/70 uppercase tracking-wider mb-2">Strengths</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedExpert.strengths.map((strength, i) => (
                      <Badge key={i} variant="outline" className="text-xs bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xs text-foreground/70 uppercase tracking-wider mb-2">Weaknesses</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedExpert.weaknesses.map((weakness, i) => (
                      <Badge key={i} variant="outline" className="text-xs bg-red-500/10 border-red-500/30 text-red-400">
                        {weakness}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xs text-foreground/70 uppercase tracking-wider mb-2">Thinking Style</h4>
                  <p className="text-sm">{selectedExpert.thinkingStyle}</p>
                </div>
                
                <div>
                  <h4 className="text-xs text-foreground/70 uppercase tracking-wider mb-2">Inspired By</h4>
                  <p className="text-sm text-purple-400">{selectedExpert.compositeOf.join(' + ')}</p>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <Badge className={selectedExpert.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}>
                    {selectedExpert.status === 'active' ? 'Available' : selectedExpert.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">Last used: {formatDate(selectedExpert.lastUsed)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 p-4 border-t border-white/10">
              <Button 
                className="flex-1 gap-2"
                onClick={() => {
                  toggleExpertSelection(selectedExpert);
                  setShowExpertDetail(null);
                }}
              >
                {selectedExperts.some(e => e.id === selectedExpert.id) ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Selected
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add to Team
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => {
                  setShowExpertDetail(null);
                  setLocation(`/expert-chat/${selectedExpert.id}`);
                }}
              >
                <MessageSquare className="w-4 h-4" />
                Chat
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Expert Comparison Modal */}
      {showCompareModal && compareExpertData.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/20 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Expert Comparison</h2>
                  <p className="text-sm text-foreground/70">Comparing {compareExpertData.length} experts</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowCompareModal(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className={`grid gap-4 ${compareExpertData.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {compareExpertData.map(expert => {
                  const expertPanel = getExpertPanelType(expert);
                  const panelInfo = panelTypes[expertPanel];
                  
                  return (
                    <div key={expert.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center text-2xl">
                          {expert.avatar}
                        </div>
                        <div>
                          <h3 className="font-semibold">{expert.name}</h3>
                          <p className="text-sm text-foreground/70">{expert.category}</p>
                          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] mt-1 ${panelInfo.bgColor} ${panelInfo.color}`}>
                            {panelInfo.icon} {panelInfo.name}
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-foreground/70">Performance</span>
                          <span className="text-sm font-semibold text-cyan-400">{expert.performanceScore}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                            style={{ width: `${expert.performanceScore}%` }}
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-xs text-foreground/70 uppercase tracking-wider mb-2">Strengths</h4>
                        <div className="flex flex-wrap gap-1">
                          {expert.strengths.slice(0, 4).map((strength, i) => (
                            <Badge key={i} variant="outline" className="text-xs bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                              {strength}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-center pt-4 border-t border-white/10">
                        <div>
                          <div className="text-lg font-semibold">{expert.projectsCompleted}</div>
                          <div className="text-xs text-foreground/70">Projects</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold">{expert.performanceScore}</div>
                          <div className="text-xs text-foreground/70">Rating</div>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                        <Button 
                          size="sm" 
                          className="flex-1 gap-1"
                          onClick={() => toggleExpertSelection(expert)}
                        >
                          {selectedExperts.some(e => e.id === expert.id) ? (
                            <><CheckCircle2 className="w-3 h-3" /> Selected</>
                          ) : (
                            <><Plus className="w-3 h-3" /> Add</>
                          )}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="gap-1"
                          onClick={() => {
                            setShowCompareModal(false);
                            setLocation(`/expert-chat/${expert.id}`);
                          }}
                        >
                          <MessageSquare className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border-t border-white/10 bg-white/5">
              <Button 
                variant="ghost" 
                onClick={() => setCompareExperts([])}
                className="text-foreground/70"
              >
                Clear All
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowCompareModal(false)}>
                  Close
                </Button>
                {selectedExperts.length > 0 && (
                  <Button 
                    className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-500"
                    onClick={() => {
                      setShowCompareModal(false);
                      setViewMode('assemble');
                    }}
                  >
                    <Users className="w-4 h-4" />
                    Assemble Team ({selectedExperts.length})
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
