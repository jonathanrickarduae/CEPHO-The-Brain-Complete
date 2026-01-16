import { useState, useEffect } from "react";
import { 
  Users, Brain, Search, Star, MessageSquare, FileText,
  ChevronRight, Plus, Mic, MicOff, Send, Eye, CheckCircle2,
  Sparkles, Target, Clock, BarChart3, Filter, Grid, List, Trash2, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/useMobile";
import { trpc } from "@/lib/trpc";

// Expert categories
const CATEGORIES = [
  { id: 'all', label: 'All Experts', count: 287 },
  { id: 'strategy', label: 'Strategy', count: 42 },
  { id: 'finance', label: 'Finance', count: 38 },
  { id: 'legal', label: 'Legal', count: 25 },
  { id: 'marketing', label: 'Marketing', count: 35 },
  { id: 'technology', label: 'Technology', count: 52 },
  { id: 'operations', label: 'Operations', count: 31 },
  { id: 'research', label: 'Research', count: 28 },
  { id: 'hr', label: 'HR & People', count: 18 },
  { id: 'design', label: 'Design', count: 18 },
];

// Sample experts
const EXPERTS = [
  { id: 'exp-1', name: 'Alex Chen', role: 'Strategy Lead', category: 'strategy', rating: 4.9, interactions: 156, avatar: 'AC', specialty: 'M&A, Market Entry, Competitive Analysis', available: true },
  { id: 'exp-2', name: 'Sarah Kim', role: 'Finance Expert', category: 'finance', rating: 4.8, interactions: 203, avatar: 'SK', specialty: 'Financial Modeling, Valuation, Due Diligence', available: true },
  { id: 'exp-3', name: 'Marcus Johnson', role: 'Marketing Lead', category: 'marketing', rating: 4.7, interactions: 89, avatar: 'MJ', specialty: 'Brand Strategy, Growth Marketing, GTM', available: true },
  { id: 'exp-4', name: 'Elena Rodriguez', role: 'Legal Counsel', category: 'legal', rating: 4.9, interactions: 124, avatar: 'ER', specialty: 'Contracts, Compliance, IP Law', available: false },
  { id: 'exp-5', name: 'David Park', role: 'Tech Architect', category: 'technology', rating: 4.8, interactions: 178, avatar: 'DP', specialty: 'System Design, AI/ML, Cloud Architecture', available: true },
  { id: 'exp-6', name: 'Dr. Priya Sharma', role: 'Research Lead', category: 'research', rating: 4.9, interactions: 92, avatar: 'PS', specialty: 'Market Research, Data Analysis, Insights', available: true },
  { id: 'exp-7', name: 'James Miller', role: 'Operations Expert', category: 'operations', rating: 4.6, interactions: 67, avatar: 'JM', specialty: 'Process Optimization, Supply Chain, Scaling', available: true },
  { id: 'exp-8', name: 'Lisa Wang', role: 'Design Lead', category: 'design', rating: 4.8, interactions: 145, avatar: 'LW', specialty: 'UX/UI, Product Design, Design Systems', available: true },
];

// Active teams
const ACTIVE_TEAMS = [
  { id: 'team-1', name: 'Celadon Due Diligence', members: ['Alex Chen', 'Sarah Kim', 'Elena Rodriguez'], status: 'active', task: 'Financial analysis review' },
  { id: 'team-2', name: 'Boundless GTM Strategy', members: ['Marcus Johnson', 'Dr. Priya Sharma'], status: 'pending_review', task: 'Market entry plan' },
];

type ViewMode = 'browse' | 'teams' | 'assemble';

interface SelectedExpert {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export default function AISMEsPage() {
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<ViewMode>('browse');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExperts, setSelectedExperts] = useState<SelectedExpert[]>([]);
  const [showExpertDetail, setShowExpertDetail] = useState<string | null>(null);
  const [taskDescription, setTaskDescription] = useState('');
  const [viewStyle, setViewStyle] = useState<'grid' | 'list'>('grid');
  const [teamName, setTeamName] = useState('');
  const [teamPurpose, setTeamPurpose] = useState('');

  // tRPC hooks for team management
  const utils = trpc.useUtils();
  const { data: savedTeams, isLoading: teamsLoading } = trpc.smeTeam.list.useQuery();
  
  const createTeamMutation = trpc.smeTeam.create.useMutation({
    onSuccess: async (team) => {
      if (team) {
        // Add members to the team
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

  const removeMemberMutation = trpc.smeTeam.removeMember.useMutation({
    onSuccess: () => {
      utils.smeTeam.list.invalidate();
    },
  });

  // Combine saved teams with static teams for display
  const allTeams = [
    ...(savedTeams || []).map(team => ({
      id: `db-${team.id}`,
      dbId: team.id,
      name: team.name,
      members: [] as string[], // Will be populated from team members query
      status: 'active' as const,
      task: team.purpose || team.description || 'No task assigned',
      isFromDb: true as const,
    })),
    ...ACTIVE_TEAMS.map(t => ({ ...t, dbId: undefined as number | undefined, isFromDb: false as const })),
  ];

  // Filter experts
  const filteredExperts = EXPERTS.filter(exp => {
    const matchesCategory = selectedCategory === 'all' || exp.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Toggle expert selection
  const toggleExpertSelection = (expert: typeof EXPERTS[0]) => {
    const isSelected = selectedExperts.some(e => e.id === expert.id);
    if (isSelected) {
      setSelectedExperts(prev => prev.filter(e => e.id !== expert.id));
    } else {
      setSelectedExperts(prev => [...prev, { id: expert.id, name: expert.name, role: expert.role, avatar: expert.avatar }]);
    }
  };

  // Start team assembly
  const startTeamAssembly = () => {
    if (selectedExperts.length === 0) {
      toast.error("Select at least one expert");
      return;
    }
    setViewMode('assemble');
  };

  // Submit task to team - now creates a real team in the database
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

  const selectedExpert = showExpertDetail ? EXPERTS.find(e => e.id === showExpertDetail) : null;

  return (
    <div className="h-[calc(100vh-56px)] md:h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
      {/* Header */}
      <PageHeader 
        icon={Users} 
        title="AI-SMEs"
        subtitle="287 Expert Specialists"
        iconColor="text-cyan-400"
      >
        <div className="flex items-center gap-2">
          {selectedExperts.length > 0 && (
            <Badge className="bg-primary/20 text-primary">
              {selectedExperts.length} selected
            </Badge>
          )}
        </div>
      </PageHeader>

      {/* View Mode Tabs */}
      <div className="shrink-0 border-b border-white/10 bg-white/5 px-4">
        <div className="max-w-7xl mx-auto flex gap-1">
          {[
            { id: 'browse', label: 'Browse Experts', icon: Search },
            { id: 'teams', label: 'My Teams', icon: Users, badge: ACTIVE_TEAMS.length },
            { id: 'assemble', label: 'Assemble Team', icon: Plus },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id as ViewMode)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                viewMode === tab.id
                  ? 'text-cyan-400 border-cyan-400'
                  : 'text-gray-400 border-transparent hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.badge && (
                <span className="px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {viewMode === 'browse' && (
          <>
            {/* Category Sidebar - Desktop */}
            {!isMobile && (
              <div className="w-56 border-r border-white/10 bg-white/5 overflow-y-auto">
                <div className="p-3">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Categories</h3>
                  <div className="space-y-1">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${
                          selectedCategory === cat.id
                            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30'
                            : 'hover:bg-white/5 text-gray-400 hover:text-white'
                        }`}
                      >
                        <span>{cat.label}</span>
                        <span className="text-xs">{cat.count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Expert Grid */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 sm:p-6">
                {/* Search and Filters */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search experts by name or specialty..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex items-center gap-1 border border-white/20 rounded-lg p-1">
                    <button
                      onClick={() => setViewStyle('grid')}
                      className={`p-2 rounded ${viewStyle === 'grid' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400'}`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewStyle('list')}
                      className={`p-2 rounded ${viewStyle === 'list' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400'}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Mobile Categories */}
                {isMobile && (
                  <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-4 px-4">
                    {CATEGORIES.slice(0, 6).map(cat => (
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

                {/* Expert Cards */}
                <div className={viewStyle === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
                  : "space-y-2"
                }>
                  {filteredExperts.map(expert => {
                    const isSelected = selectedExperts.some(e => e.id === expert.id);
                    return (
                      <div
                        key={expert.id}
                        className={`p-4 bg-white/5 border-2 rounded-2xl transition-all cursor-pointer group ${
                          isSelected 
                            ? 'border-cyan-500/50 bg-gradient-to-br from-cyan-500/10 to-blue-500/10' 
                            : 'border-white/10 hover:border-cyan-500/30'
                        } ${viewStyle === 'list' ? 'flex items-center gap-4' : ''}`}
                        onClick={() => setShowExpertDetail(expert.id)}
                      >
                        <div className={`flex items-center gap-3 ${viewStyle === 'grid' ? 'mb-3' : ''}`}>
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center text-sm font-bold text-white group-hover:scale-110 transition-transform ${!expert.available ? 'opacity-50' : ''}`}>
                            {expert.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium truncate">{expert.name}</h4>
                              {!expert.available && (
                                <Badge variant="outline" className="text-xs">Busy</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{expert.role}</p>
                          </div>
                          {viewStyle === 'list' && (
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                <span className="text-sm">{expert.rating}</span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExpertSelection(expert);
                                }}
                                className={`p-2 rounded-lg transition-colors ${
                                  isSelected ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' : 'bg-white/10 hover:bg-white/20 text-gray-400'
                                }`}
                              >
                                {isSelected ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {viewStyle === 'grid' && (
                          <>
                            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{expert.specialty}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                  {expert.rating}
                                </span>
                                <span>{expert.interactions} tasks</span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExpertSelection(expert);
                                }}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  isSelected ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' : 'bg-white/10 hover:bg-white/20 text-gray-400'
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

        {viewMode === 'teams' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Active Teams</h3>
                {teamsLoading && <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />}
              </div>
              
              {allTeams.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No active teams</h3>
                  <p className="text-muted-foreground mb-4">Assemble a team to get started</p>
                  <Button onClick={() => setViewMode('browse')}>Browse Experts</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {allTeams.map(team => (
                    <div key={team.id} className="p-5 bg-white/5 border-2 border-white/10 rounded-2xl hover:border-cyan-500/30 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{team.name}</h4>
                            {team.isFromDb && (
                              <Badge variant="outline" className="text-xs text-cyan-400 border-cyan-400/30">Saved</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{team.task}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={team.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}>
                            {team.status === 'active' ? 'Active' : 'Pending Review'}
                          </Badge>
                          {team.isFromDb && team.dbId && (
                            <button
                              onClick={() => handleDeleteTeam(team.dbId!)}
                              className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                              title="Delete team"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Team:</span>
                        {team.members.length > 0 ? (
                          team.members.map((member: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">{member}</Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Members loading...</span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline" className="gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Chat
                        </Button>
                        <Button size="sm" variant="outline" className="gap-2">
                          <Eye className="w-4 h-4" />
                          View Work
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {viewMode === 'assemble' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold mb-4">Assemble Your Team</h3>
              
              {/* Team Name */}
              <div className="mb-6">
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Team Name *</label>
                <Input
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g., Celadon Due Diligence Team"
                  className="bg-secondary/30"
                />
              </div>

              {/* Team Purpose */}
              <div className="mb-6">
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Team Purpose</label>
                <Input
                  value={teamPurpose}
                  onChange={(e) => setTeamPurpose(e.target.value)}
                  placeholder="e.g., Financial analysis and risk assessment"
                  className="bg-secondary/30"
                />
              </div>
              
              {/* Selected Experts */}
              <div className="mb-6">
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Selected Experts ({selectedExperts.length})</label>
                {selectedExperts.length === 0 ? (
                  <div className="p-4 border border-dashed border-border rounded-xl text-center">
                    <p className="text-sm text-muted-foreground">No experts selected</p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => setViewMode('browse')}>
                      Browse Experts
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedExperts.map(expert => (
                      <div key={expert.id} className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/30 rounded-full">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                          {expert.avatar}
                        </div>
                        <span className="text-sm">{expert.name}</span>
                        <button
                          onClick={() => setSelectedExperts(prev => prev.filter(e => e.id !== expert.id))}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setViewMode('browse')}
                      className="flex items-center gap-1 px-3 py-2 border border-dashed border-border rounded-full text-sm text-muted-foreground hover:text-foreground"
                    >
                      <Plus className="w-4 h-4" />
                      Add more
                    </button>
                  </div>
                )}
              </div>

              {/* Task Description */}
              <div className="mb-6">
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Task Description</label>
                <textarea
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Describe what you need the team to work on..."
                  className="w-full p-4 bg-secondary/30 border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                  rows={4}
                />
              </div>

              {/* Document Upload */}
              <div className="mb-6">
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Attach Documents (Optional)</label>
                <div className="p-4 border border-dashed border-border rounded-xl text-center">
                  <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Drop files here or click to upload</p>
                </div>
              </div>

              {/* Submit */}
              <Button 
                className="w-full gap-2" 
                size="lg"
                disabled={selectedExperts.length === 0 || !teamName.trim() || createTeamMutation.isPending}
                onClick={submitTaskToTeam}
              >
                {createTeamMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {createTeamMutation.isPending ? 'Creating Team...' : 'Create Team & Assign Task'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Selected Experts Footer - when browsing */}
      {viewMode === 'browse' && selectedExperts.length > 0 && (
        <div className="shrink-0 border-t border-border bg-card/90 backdrop-blur-xl px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{selectedExperts.length} experts selected</span>
              <div className="flex -space-x-2">
                {selectedExperts.slice(0, 5).map(exp => (
                  <div key={exp.id} className="w-8 h-8 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-xs font-bold">
                    {exp.avatar}
                  </div>
                ))}
                {selectedExperts.length > 5 && (
                  <div className="w-8 h-8 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-xs">
                    +{selectedExperts.length - 5}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedExperts([])}>
                Clear
              </Button>
              <Button size="sm" onClick={startTeamAssembly}>
                Assemble Team
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Expert Detail Modal */}
      {showExpertDetail && selectedExpert && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowExpertDetail(null)}>
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center text-xl font-bold">
                  {selectedExpert.avatar}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{selectedExpert.name}</h2>
                  <p className="text-muted-foreground">{selectedExpert.role}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Specialty</h3>
                  <p className="text-sm">{selectedExpert.specialty}</p>
                </div>

                <div className="flex gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Rating</h3>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="font-medium">{selectedExpert.rating}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Tasks Completed</h3>
                    <span className="font-medium">{selectedExpert.interactions}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                    <Badge className={selectedExpert.available ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}>
                      {selectedExpert.available ? 'Available' : 'Busy'}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
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
                  <Button variant="outline" className="gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Chat
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
