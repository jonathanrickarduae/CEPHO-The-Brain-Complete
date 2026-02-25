import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ExternalLink, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Users,
  Target,
  Activity,
  ChevronRight
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  status: 'on-track' | 'at-risk' | 'delayed' | 'completed';
  progress: number;
  team: string[];
  deadline: string;
  asanaLink?: string;
  priority: 'high' | 'medium' | 'low';
  lastUpdate: string;
}

interface TeamMetric {
  name: string;
  performance: number;
  trend: 'up' | 'down' | 'stable';
  activeProjects: number;
}

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'CEPHO.AI Platform Launch',
    status: 'on-track',
    progress: 75,
    team: ['Engineering', 'Design', 'Marketing'],
    deadline: '2026-03-15',
    asanaLink: 'https://app.asana.com/0/project/1',
    priority: 'high',
    lastUpdate: '2 hours ago'
  },
  {
    id: '2',
    name: 'Q1 Marketing Campaign',
    status: 'at-risk',
    progress: 45,
    team: ['Marketing', 'Content'],
    deadline: '2026-03-31',
    asanaLink: 'https://app.asana.com/0/project/2',
    priority: 'high',
    lastUpdate: '1 day ago'
  },
  {
    id: '3',
    name: 'Customer Onboarding Optimization',
    status: 'on-track',
    progress: 60,
    team: ['Customer Success', 'Product'],
    deadline: '2026-04-10',
    asanaLink: 'https://app.asana.com/0/project/3',
    priority: 'medium',
    lastUpdate: '5 hours ago'
  },
  {
    id: '4',
    name: 'API Integration Framework',
    status: 'delayed',
    progress: 30,
    team: ['Engineering'],
    deadline: '2026-02-28',
    asanaLink: 'https://app.asana.com/0/project/4',
    priority: 'high',
    lastUpdate: '3 days ago'
  }
];

const mockTeamMetrics: TeamMetric[] = [
  { name: 'Engineering', performance: 92, trend: 'up', activeProjects: 3 },
  { name: 'Marketing', performance: 78, trend: 'down', activeProjects: 2 },
  { name: 'Design', performance: 88, trend: 'up', activeProjects: 2 },
  { name: 'Customer Success', performance: 95, trend: 'stable', activeProjects: 1 }
];

export function CommandCentre() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'on-track':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'at-risk':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'delayed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'on-track':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'at-risk':
        return <AlertCircle className="w-4 h-4" />;
      case 'delayed':
        return <Clock className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  const getPriorityBadge = (priority: Project['priority']) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">High Priority</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Low</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Overview Stats - Button Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Button
          variant="outline"
          className="h-auto p-6 flex-col items-start bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30 hover:border-cyan-500/50 transition-all"
        >
          <div className="flex items-center justify-between w-full mb-2">
            <Target className="w-8 h-8 text-cyan-400" />
            <ChevronRight className="w-5 h-5 text-cyan-400/50" />
          </div>
          <p className="text-sm text-muted-foreground">Active Projects</p>
          <p className="text-3xl font-bold text-cyan-400">{mockProjects.length}</p>
        </Button>

        <Button
          variant="outline"
          className="h-auto p-6 flex-col items-start bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30 hover:border-green-500/50 transition-all"
        >
          <div className="flex items-center justify-between w-full mb-2">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
            <ChevronRight className="w-5 h-5 text-green-400/50" />
          </div>
          <p className="text-sm text-muted-foreground">On Track</p>
          <p className="text-3xl font-bold text-green-400">
            {mockProjects.filter(p => p.status === 'on-track').length}
          </p>
        </Button>

        <Button
          variant="outline"
          className="h-auto p-6 flex-col items-start bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30 hover:border-yellow-500/50 transition-all"
        >
          <div className="flex items-center justify-between w-full mb-2">
            <AlertCircle className="w-8 h-8 text-yellow-400" />
            <ChevronRight className="w-5 h-5 text-yellow-400/50" />
          </div>
          <p className="text-sm text-muted-foreground">At Risk</p>
          <p className="text-3xl font-bold text-yellow-400">
            {mockProjects.filter(p => p.status === 'at-risk' || p.status === 'delayed').length}
          </p>
        </Button>

        <Button
          variant="outline"
          className="h-auto p-6 flex-col items-start bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 hover:border-purple-500/50 transition-all"
        >
          <div className="flex items-center justify-between w-full mb-2">
            <Activity className="w-8 h-8 text-purple-400" />
            <ChevronRight className="w-5 h-5 text-purple-400/50" />
          </div>
          <p className="text-sm text-muted-foreground">Avg Performance</p>
          <p className="text-3xl font-bold text-purple-400">
            {Math.round(mockTeamMetrics.reduce((acc, t) => acc + t.performance, 0) / mockTeamMetrics.length)}%
          </p>
        </Button>
      </div>

      {/* Projects Grid - Button Style Cards */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Target className="w-6 h-6 text-cyan-400" />
          Project Status
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {mockProjects.map((project) => (
            <Button
              key={project.id}
              variant="outline"
              className={`h-auto p-6 flex-col items-start text-left bg-gray-900/50 border-gray-700 hover:border-cyan-500/50 transition-all ${
                selectedProject === project.id ? 'ring-2 ring-cyan-500 border-cyan-500' : ''
              }`}
              onClick={() => setSelectedProject(project.id === selectedProject ? null : project.id)}
            >
              <div className="w-full space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between w-full">
                  <div className="flex-1 space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">{project.name}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      {getPriorityBadge(project.priority)}
                      <Badge className={`${getStatusColor(project.status)} border`}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(project.status)}
                          {project.status.replace('-', ' ')}
                        </span>
                      </Badge>
                    </div>
                  </div>
                  {project.asanaLink && (
                    <a
                      href={project.asanaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-cyan-500/10 rounded-lg transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-5 h-5 text-cyan-400" />
                    </a>
                  )}
                </div>

                {/* Progress */}
                <div className="w-full">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-bold text-cyan-400">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-3 bg-gray-800" />
                </div>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-sm w-full">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{project.team.length} teams</span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Updated {project.lastUpdate}
                </div>

                {/* Expanded Details */}
                {selectedProject === project.id && (
                  <div className="pt-4 border-t border-gray-700 space-y-3 w-full">
                    <p className="text-sm font-semibold text-foreground">Teams Involved:</p>
                    <div className="flex flex-wrap gap-2">
                      {project.team.map((team) => (
                        <Badge key={team} className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                          {team}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Team Performance - Button Style */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Users className="w-6 h-6 text-purple-400" />
          Team Performance
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {mockTeamMetrics.map((team) => (
            <Button
              key={team.name}
              variant="outline"
              className="h-auto p-6 flex-col items-start bg-gradient-to-br from-gray-900/80 to-gray-800/50 border-gray-700 hover:border-purple-500/50 transition-all"
            >
              <div className="w-full space-y-3">
                <div className="flex items-center justify-between w-full">
                  <h3 className="font-semibold text-foreground">{team.name}</h3>
                  {team.trend === 'up' && <TrendingUp className="w-5 h-5 text-green-400" />}
                  {team.trend === 'down' && <TrendingDown className="w-5 h-5 text-red-400" />}
                  {team.trend === 'stable' && <Activity className="w-5 h-5 text-gray-400" />}
                </div>
                <div className="w-full">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Performance</span>
                    <span className="font-bold text-purple-400">{team.performance}%</span>
                  </div>
                  <Progress value={team.performance} className="h-3 bg-gray-800" />
                </div>
                <div className="text-sm text-muted-foreground">
                  {team.activeProjects} active project{team.activeProjects !== 1 ? 's' : ''}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
