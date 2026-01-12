import { useState } from "react";
import { 
  Activity, AlertTriangle, CheckCircle2, Clock, ChevronRight,
  Filter, LayoutGrid, List, MoreHorizontal, Plus, ArrowUpRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// Project data with brand colours
const projects = [
  {
    id: 'celadon',
    name: 'Celadon Pharmaceuticals',
    color: '#10B981',
    status: 'blocked',
    progress: 65,
    phase: 'Legal Review',
    dueDate: 'Jan 15',
    tasks: { total: 24, completed: 16, blocked: 3 },
    lastUpdate: '2h ago',
  },
  {
    id: 'boundless',
    name: 'Boundless Telecom',
    color: '#3B82F6',
    status: 'on-track',
    progress: 82,
    phase: 'Development',
    dueDate: 'Jan 20',
    tasks: { total: 18, completed: 15, blocked: 0 },
    lastUpdate: '30m ago',
  },
  {
    id: 'perfect-dxb',
    name: 'Perfect DXB',
    color: '#F59E0B',
    status: 'at-risk',
    progress: 45,
    phase: 'Planning',
    dueDate: 'Jan 25',
    tasks: { total: 31, completed: 14, blocked: 5 },
    lastUpdate: '1h ago',
  },
  {
    id: 'ampora',
    name: 'Ampora',
    color: '#06B6D4',
    status: 'on-track',
    progress: 91,
    phase: 'Final Review',
    dueDate: 'Jan 12',
    tasks: { total: 15, completed: 14, blocked: 0 },
    lastUpdate: '15m ago',
  },
  {
    id: 'project-5',
    name: 'Project 5',
    color: '#8B5CF6',
    status: 'on-track',
    progress: 55,
    phase: 'Research',
    dueDate: 'Feb 1',
    tasks: { total: 9, completed: 5, blocked: 0 },
    lastUpdate: '3h ago',
  },
  {
    id: 'project-6',
    name: 'Project 6',
    color: '#EC4899',
    status: 'not-started',
    progress: 0,
    phase: 'Not Started',
    dueDate: 'Feb 15',
    tasks: { total: 7, completed: 0, blocked: 0 },
    lastUpdate: '-',
  }
];

export default function Workflow() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'blocked': return { dot: 'bg-red-500', text: 'text-red-400', bg: 'bg-red-500/10' };
      case 'at-risk': return { dot: 'bg-amber-500', text: 'text-amber-400', bg: 'bg-amber-500/10' };
      case 'on-track': return { dot: 'bg-green-500', text: 'text-green-400', bg: 'bg-green-500/10' };
      default: return { dot: 'bg-gray-500', text: 'text-gray-400', bg: 'bg-gray-500/10' };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'blocked': return 'Blocked';
      case 'at-risk': return 'At Risk';
      case 'on-track': return 'On Track';
      case 'not-started': return 'Not Started';
      default: return status;
    }
  };

  const filteredProjects = filterStatus === 'all' 
    ? projects 
    : projects.filter(p => p.status === filterStatus);

  const stats = {
    total: projects.length,
    onTrack: projects.filter(p => p.status === 'on-track').length,
    atRisk: projects.filter(p => p.status === 'at-risk').length,
    blocked: projects.filter(p => p.status === 'blocked').length,
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Workflow</h1>
          <p className="text-muted-foreground text-sm mt-1">Track progress across all projects</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-card border border-border rounded-lg p-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <Button size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-3xl font-bold text-foreground">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total Projects</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-3xl font-bold text-green-400">{stats.onTrack}</span>
          </div>
          <div className="text-sm text-muted-foreground">On Track</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-3xl font-bold text-amber-400">{stats.atRisk}</span>
          </div>
          <div className="text-sm text-muted-foreground">At Risk</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-3xl font-bold text-red-400">{stats.blocked}</span>
          </div>
          <div className="text-sm text-muted-foreground">Blocked</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {['all', 'on-track', 'at-risk', 'blocked'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterStatus === status 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            {status === 'all' ? 'All' : getStatusLabel(status)}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map(project => {
            const style = getStatusStyle(project.status);
            return (
              <div
                key={project.id}
                className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all cursor-pointer group"
              >
                {/* Project Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm"
                      style={{ backgroundColor: project.color }}
                    >
                      {project.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">{project.phase}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">{project.progress}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ width: `${project.progress}%`, backgroundColor: project.color }}
                    />
                  </div>
                </div>

                {/* Status & Meta */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${style.dot}`} />
                    <span className={`text-sm font-medium ${style.text}`}>
                      {getStatusLabel(project.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {project.tasks.completed}/{project.tasks.total}
                    </span>
                    {project.tasks.blocked > 0 && (
                      <span className="flex items-center gap-1 text-red-400">
                        <AlertTriangle className="w-3 h-3" />
                        {project.tasks.blocked}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Project</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Phase</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Progress</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Due</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Tasks</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map(project => {
                const style = getStatusStyle(project.status);
                return (
                  <tr 
                    key={project.id} 
                    className="border-b border-border last:border-0 hover:bg-secondary/50 cursor-pointer transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold text-xs"
                          style={{ backgroundColor: project.color }}
                        >
                          {project.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </div>
                        <span className="font-medium text-foreground">{project.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{project.phase}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3 min-w-[120px]">
                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full"
                            style={{ width: `${project.progress}%`, backgroundColor: project.color }}
                          />
                        </div>
                        <span className="text-sm font-medium text-foreground w-10">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${style.dot}`} />
                        <span className={`text-sm ${style.text}`}>{getStatusLabel(project.status)}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{project.dueDate}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">{project.tasks.completed}/{project.tasks.total}</span>
                        {project.tasks.blocked > 0 && (
                          <span className="text-red-400 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {project.tasks.blocked}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ArrowUpRight className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
