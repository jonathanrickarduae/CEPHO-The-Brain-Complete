import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Activity
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
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'at-risk':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'delayed':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'completed':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
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

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold text-foreground">{mockProjects.length}</p>
              </div>
              <Target className="w-8 h-8 text-cyan-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">On Track</p>
                <p className="text-2xl font-bold text-green-500">
                  {mockProjects.filter(p => p.status === 'on-track').length}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">At Risk</p>
                <p className="text-2xl font-bold text-yellow-500">
                  {mockProjects.filter(p => p.status === 'at-risk' || p.status === 'delayed').length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Performance</p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round(mockTeamMetrics.reduce((acc, t) => acc + t.performance, 0) / mockTeamMetrics.length)}%
                </p>
              </div>
              <Activity className="w-8 h-8 text-cyan-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Grid */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Project Status</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {mockProjects.map((project) => (
            <Card 
              key={project.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedProject === project.id ? 'ring-2 ring-cyan-500' : ''
              }`}
              onClick={() => setSelectedProject(project.id === selectedProject ? null : project.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(project.priority)}`} />
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={`${getStatusColor(project.status)} border`}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(project.status)}
                          {project.status.replace('-', ' ')}
                        </span>
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Updated {project.lastUpdate}
                      </span>
                    </div>
                  </div>
                  {project.asanaLink && (
                    <a
                      href={project.asanaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </a>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{project.team.length} teams</span>
                  </div>
                </div>

                {selectedProject === project.id && (
                  <div className="pt-4 border-t border-border space-y-2">
                    <p className="text-sm font-medium text-foreground">Teams Involved:</p>
                    <div className="flex flex-wrap gap-2">
                      {project.team.map((team) => (
                        <Badge key={team} variant="outline">
                          {team}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Team Performance */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Team Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockTeamMetrics.map((team) => (
            <Card key={team.name}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-foreground">{team.name}</h3>
                    {team.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                    {team.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                    {team.trend === 'stable' && <Activity className="w-4 h-4 text-gray-500" />}
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Performance</span>
                      <span className="font-medium text-foreground">{team.performance}%</span>
                    </div>
                    <Progress value={team.performance} className="h-2" />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {team.activeProjects} active project{team.activeProjects !== 1 ? 's' : ''}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
