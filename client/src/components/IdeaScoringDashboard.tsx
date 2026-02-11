import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ThumbsUp, ThumbsDown, MessageSquare, Star, 
  ChevronUp, ChevronDown, Filter, Check, X,
  Sparkles, Brain, Users, Clock, AlertTriangle,
  TrendingUp, Award, Lightbulb, Target
} from 'lucide-react';

interface Idea {
  id: string;
  title: string;
  description: string;
  source: string;
  sourceType: 'sme' | 'leadership' | 'research' | 'user';
  category: string;
  scores: {
    expertId: string;
    expertName: string;
    score: number;
    comment?: string;
    votedAt: Date;
  }[];
  status: 'pending' | 'approved' | 'rejected' | 'deferred';
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: number;
  estimatedEffort: number;
  createdAt: Date;
}

interface IdeaScoringDashboardProps {
  projectId: string;
  projectName: string;
  onComplete: (approvedIdeas: Idea[]) => void;
  onBack: () => void;
}

const MOCK_IDEAS: Idea[] = [
  {
    id: '1',
    title: 'Mentorship Matching Algorithm',
    description: 'Use AI to match graduates with mentors based on career goals, personality, and expertise alignment',
    source: 'Dr. Sarah Chen',
    sourceType: 'sme',
    category: 'Technology',
    scores: [
      { expertId: '1', expertName: 'Strategy Lead', score: 90, comment: 'High impact, differentiator', votedAt: new Date() },
      { expertId: '2', expertName: 'GCC Cultural', score: 80, comment: 'Culturally appropriate', votedAt: new Date() },
    ],
    status: 'pending',
    priority: 'high',
    estimatedImpact: 9,
    estimatedEffort: 7,
    createdAt: new Date()
  },
  {
    id: '2',
    title: 'Leadership Leaderboard',
    description: 'Gamified ranking system showing top performing graduates across cohorts',
    source: 'Marcus Johnson',
    sourceType: 'sme',
    category: 'Engagement',
    scores: [
      { expertId: '1', expertName: 'Strategy Lead', score: 60, votedAt: new Date() },
      { expertId: '3', expertName: 'Western Perspective', score: 80, comment: 'Works well in Western contexts', votedAt: new Date() },
    ],
    status: 'pending',
    priority: 'medium',
    estimatedImpact: 6,
    estimatedEffort: 4,
    createdAt: new Date()
  },
  {
    id: '3',
    title: 'Cultural Immersion Rotations',
    description: 'Mandatory rotations across different GCC countries to build regional understanding',
    source: 'Fatima Al-Rashid',
    sourceType: 'leadership',
    category: 'Program Design',
    scores: [
      { expertId: '2', expertName: 'GCC Cultural', score: 100, comment: 'Essential for regional success', votedAt: new Date() },
      { expertId: '4', expertName: 'Operations', score: 70, comment: 'Logistically complex but doable', votedAt: new Date() },
    ],
    status: 'pending',
    priority: 'high',
    estimatedImpact: 9,
    estimatedEffort: 8,
    createdAt: new Date()
  },
  {
    id: '4',
    title: 'Virtual Reality Onboarding',
    description: 'Immersive VR experience for day one orientation and company culture introduction',
    source: 'Deep Research',
    sourceType: 'research',
    category: 'Technology',
    scores: [
      { expertId: '5', expertName: 'Gen Z Voice', score: 90, comment: 'Would love this!', votedAt: new Date() },
    ],
    status: 'pending',
    priority: 'medium',
    estimatedImpact: 7,
    estimatedEffort: 9,
    createdAt: new Date()
  },
  {
    id: '5',
    title: 'Executive Shadowing Program',
    description: 'One week shadowing C-suite executives to understand strategic decision making',
    source: 'Leadership Team',
    sourceType: 'leadership',
    category: 'Program Design',
    scores: [],
    status: 'pending',
    priority: 'high',
    estimatedImpact: 8,
    estimatedEffort: 5,
    createdAt: new Date()
  }
];

export function IdeaScoringDashboard({ projectId, projectName, onComplete, onBack }: IdeaScoringDashboardProps) {
  const [ideas, setIdeas] = useState<Idea[]>(MOCK_IDEAS);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [filterStatus, setFilterStatus] = useState<Idea['status'] | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<Idea['priority'] | 'all'>('all');
  const [sortBy, setSortBy] = useState<'score' | 'impact' | 'recent'>('score');
  const [userScore, setUserScore] = useState<number>(50); // 0-100 scale
  const [userComment, setUserComment] = useState('');

  // Calculate average score
  const getAverageScore = (idea: Idea) => {
    if (idea.scores.length === 0) return 0;
    return idea.scores.reduce((sum, s) => sum + s.score, 0) / idea.scores.length;
  };

  // Filter and sort ideas
  const filteredIdeas = ideas
    .filter(idea => filterStatus === 'all' || idea.status === filterStatus)
    .filter(idea => filterPriority === 'all' || idea.priority === filterPriority)
    .sort((a, b) => {
      switch (sortBy) {
        case 'score': return getAverageScore(b) - getAverageScore(a);
        case 'impact': return b.estimatedImpact - a.estimatedImpact;
        case 'recent': return b.createdAt.getTime() - a.createdAt.getTime();
        default: return 0;
      }
    });

  // Update idea status
  const updateIdeaStatus = (ideaId: string, status: Idea['status']) => {
    setIdeas(prev => prev.map(idea => 
      idea.id === ideaId ? { ...idea, status } : idea
    ));
    setSelectedIdea(null);
  };

  // Submit score
  const submitScore = () => {
    if (!selectedIdea) return;
    
    const newScore = {
      expertId: 'user',
      expertName: 'You',
      score: userScore,
      comment: userComment || undefined,
      votedAt: new Date()
    };
    
    setIdeas(prev => prev.map(idea => 
      idea.id === selectedIdea.id 
        ? { ...idea, scores: [...idea.scores, newScore] }
        : idea
    ));
    
    setUserScore(50);
    setUserComment('');
  };

  // Get status color
  const getStatusColor = (status: Idea['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'deferred': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-white/10 text-foreground/70 border-white/20';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: Idea['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  // Get source icon
  const getSourceIcon = (sourceType: Idea['sourceType']) => {
    switch (sourceType) {
      case 'sme': return <Brain className="w-4 h-4" />;
      case 'leadership': return <Award className="w-4 h-4" />;
      case 'research': return <Target className="w-4 h-4" />;
      case 'user': return <Lightbulb className="w-4 h-4" />;
    }
  };

  const approvedIdeas = ideas.filter(i => i.status === 'approved');
  const pendingIdeas = ideas.filter(i => i.status === 'pending');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Idea Scoring Dashboard</h1>
              <p className="text-foreground/70">{projectName} • Leadership Team Review</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-foreground/70">Progress</p>
              <p className="text-lg font-semibold text-white">
                {ideas.filter(i => i.status !== 'pending').length} / {ideas.length} reviewed
              </p>
            </div>
            <Button
              onClick={() => onComplete(approvedIdeas)}
              disabled={pendingIdeas.length > 0}
              className="bg-gradient-to-r from-cyan-500 to-fuchsia-500"
            >
              Complete Review
              <Check className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{ideas.length}</p>
                  <p className="text-xs text-foreground/70">Total Ideas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{pendingIdeas.length}</p>
                  <p className="text-xs text-foreground/70">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{approvedIdeas.length}</p>
                  <p className="text-xs text-foreground/70">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-fuchsia-500/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-fuchsia-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {ideas.length > 0 ? (ideas.reduce((sum, i) => sum + getAverageScore(i), 0) / ideas.length).toFixed(1) : '0'}
                  </p>
                  <p className="text-xs text-foreground/70">Avg Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-foreground/70" />
            <span className="text-sm text-foreground/70">Filter:</span>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as Idea['status'] | 'all')}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="deferred">Deferred</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as Idea['priority'] | 'all')}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
          >
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground/70">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'score' | 'impact' | 'recent')}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
            >
              <option value="score">Highest Score</option>
              <option value="impact">Highest Impact</option>
              <option value="recent">Most Recent</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Ideas List */}
          <div className="col-span-2 space-y-4">
            {filteredIdeas.map(idea => {
              const avgScore = getAverageScore(idea);
              return (
                <Card 
                  key={idea.id}
                  className={`bg-white/5 border-white/10 cursor-pointer transition-all hover:border-fuchsia-500/50 ${
                    selectedIdea?.id === idea.id ? 'border-fuchsia-500' : ''
                  }`}
                  onClick={() => setSelectedIdea(idea)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-4">
                      {/* Score Circle */}
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${
                        avgScore >= 8 ? 'bg-green-500/20 text-green-400' :
                        avgScore >= 5 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        <span className="text-xl font-bold">{avgScore.toFixed(1)}</span>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-white">{idea.title}</h3>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge variant="outline" className={getPriorityColor(idea.priority)}>
                              {idea.priority}
                            </Badge>
                            <Badge variant="outline" className={getStatusColor(idea.status)}>
                              {idea.status}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-foreground/70 mb-3">{idea.description}</p>
                        <div className="flex items-center gap-4 text-xs text-foreground/60">
                          <span className="flex items-center gap-1">
                            {getSourceIcon(idea.sourceType)}
                            {idea.source}
                          </span>
                          <span>•</span>
                          <span>{idea.category}</span>
                          <span>•</span>
                          <span>{idea.scores.length} votes</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Detail Panel */}
          <div className="space-y-4">
            {selectedIdea ? (
              <>
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">{selectedIdea.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-foreground/70 text-sm">{selectedIdea.description}</p>
                    
                    {/* Impact/Effort Matrix */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-xs text-foreground/60 mb-1">Impact</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${selectedIdea.estimatedImpact * 10}%` }}
                            />
                          </div>
                          <span className="text-white font-medium text-sm">{selectedIdea.estimatedImpact}/10</span>
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-xs text-foreground/60 mb-1">Effort</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: `${selectedIdea.estimatedEffort * 10}%` }}
                            />
                          </div>
                          <span className="text-white font-medium text-sm">{selectedIdea.estimatedEffort}/10</span>
                        </div>
                      </div>
                    </div>

                    {/* Expert Scores */}
                    {selectedIdea.scores.length > 0 && (
                      <div>
                        <p className="text-xs text-foreground/60 mb-2">Expert Scores</p>
                        <div className="space-y-2">
                          {selectedIdea.scores.map((score, i) => (
                            <div key={i} className="bg-white/5 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-white">{score.expertName}</span>
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                  <span className="text-white font-medium">{score.score}</span>
                                </div>
                              </div>
                              {score.comment && (
                                <p className="text-xs text-foreground/70">{score.comment}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Your Score */}
                    <div className="border-t border-white/10 pt-4">
                      <p className="text-xs text-foreground/60 mb-2">Your Score</p>
                      <div className="flex items-center gap-2 mb-3">
                        {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(n => (
                          <button
                            key={n}
                            onClick={() => setUserScore(n)}
                            className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                              userScore >= n 
                                ? 'bg-fuchsia-500 text-white' 
                                : 'bg-white/5 text-foreground/70 hover:bg-white/10'
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={userComment}
                        onChange={(e) => setUserComment(e.target.value)}
                        placeholder="Add a comment (optional)"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-foreground/60 resize-none"
                        rows={2}
                      />
                      <Button 
                        onClick={submitScore}
                        className="w-full mt-2 bg-fuchsia-500/20 text-fuchsia-400 hover:bg-fuchsia-500/30"
                      >
                        Submit Score
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Decision Buttons */}
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="pt-4">
                    <p className="text-xs text-foreground/60 mb-3">Leadership Decision</p>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        onClick={() => updateIdeaStatus(selectedIdea.id, 'approved')}
                        className="bg-green-500/20 text-green-400 hover:bg-green-500/30"
                      >
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => updateIdeaStatus(selectedIdea.id, 'deferred')}
                        className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                      >
                        <Clock className="w-4 h-4 mr-1" />
                        Defer
                      </Button>
                      <Button
                        onClick={() => updateIdeaStatus(selectedIdea.id, 'rejected')}
                        className="bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      >
                        <ThumbsDown className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-foreground/60" />
                  </div>
                  <p className="text-foreground/70">Select an idea to review and score</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={onBack} className="border-white/20 text-foreground/80">
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}

export default IdeaScoringDashboard;
