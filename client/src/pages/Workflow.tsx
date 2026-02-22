import { useState } from "react";
import { 
  Activity, AlertTriangle, CheckCircle2, Clock, ChevronRight,
  Filter, LayoutGrid, List, MoreHorizontal, Plus, ArrowUpRight, FolderKanban, Columns
} from "lucide-react";
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// Project data with brand colours
const projects = [
  {
    id: 'celadon',
    name: 'Project A',
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
    name: 'Project B',
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
    name: 'Project C',
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

// Helper to check if deadline is approaching or overdue
function getDeadlineWarning(dueDate: string): { type: 'overdue' | 'urgent' | 'soon' | null; label: string } {
  const today = new Date();
  const due = new Date(`${dueDate}, 2026`);
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { type: 'overdue', label: `${Math.abs(diffDays)}d overdue` };
  if (diffDays === 0) return { type: 'urgent', label: 'Due today!' };
  if (diffDays <= 2) return { type: 'urgent', label: `${diffDays}d left` };
  if (diffDays <= 7) return { type: 'soon', label: `${diffDays}d left` };
  return { type: null, label: '' };
}

export default function Workflow() {
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'blocked': return { dot: 'bg-red-500', text: 'text-red-400', bg: 'bg-red-500/10' };
      case 'at-risk': return { dot: 'bg-amber-500', text: 'text-amber-400', bg: 'bg-amber-500/10' };
      case 'on-track': return { dot: 'bg-green-500', text: 'text-green-400', bg: 'bg-green-500/10' };
      default: return { dot: 'bg-gray-500', text: 'text-foreground/70', bg: 'bg-gray-500/10' };
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
    <div className="h-[calc(100vh-56px)] md:h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
      {/* Header */}
      <PageHeader 
        icon={FolderKanban} 
        title="Workflow"
        subtitle="Track progress across all projects"
        iconColor="text-emerald-400"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white/5 border border-white/20 rounded-lg p-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-emerald-500/20 text-emerald-400' : 'text-foreground/70 hover:text-white'}`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-emerald-500/20 text-emerald-400' : 'text-foreground/70 hover:text-white'}`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded transition-colors ${viewMode === 'kanban' ? 'bg-emerald-500/20 text-emerald-400' : 'text-foreground/70 hover:text-white'}`}
              title="Kanban view"
            >
              <Columns className="w-4 h-4" />
            </button>
          </div>
          <Button size="sm" className="gap-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:opacity-90">
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </div>
      </PageHeader>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white/5 border-2 border-white/10 rounded-2xl p-4">
          <div className="text-3xl font-bold text-white">{stats.total}</div>
          <div className="text-sm text-foreground/70">Total Projects</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-2 border-emerald-500/30 rounded-2xl p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-3xl font-bold text-emerald-400">{stats.onTrack}</span>
          </div>
          <div className="text-sm text-foreground/70">On Track</div>
        </div>
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-2 border-amber-500/30 rounded-2xl p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-3xl font-bold text-amber-400">{stats.atRisk}</span>
          </div>
          <div className="text-sm text-foreground/70">At Risk</div>
        </div>
        <div className="bg-gradient-to-br from-red-500/10 to-rose-500/10 border-2 border-red-500/30 rounded-2xl p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-3xl font-bold text-red-400">{stats.blocked}</span>
          </div>
          <div className="text-sm text-foreground/70">Blocked</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {['all', 'on-track', 'at-risk', 'blocked'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filterStatus === status 
                ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white' 
                : 'bg-white/5 border border-white/10 text-foreground/70 hover:text-white hover:bg-white/10'
            }`}
          >
            {status === 'all' ? 'All' : getStatusLabel(status)}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      {viewMode === 'kanban' ? (
        /* Kanban View */
        <div className="grid grid-cols-4 gap-4">
          {['not-started', 'on-track', 'at-risk', 'blocked'].map(status => {
            const statusStyle = getStatusStyle(status);
            const statusProjects = filteredProjects.filter(p => p.status === status);
            return (
              <div key={status} className="bg-card/50 border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                  <div className={`w-2 h-2 rounded-full ${statusStyle.dot}`} />
                  <h3 className={`font-semibold ${statusStyle.text}`}>{getStatusLabel(status)}</h3>
                  <span className="text-xs text-muted-foreground ml-auto">{statusProjects.length}</span>
                </div>
                <div className="space-y-3">
                  {statusProjects.map(project => (
                    <div 
                      key={project.id}
                      className="bg-card border border-border rounded-lg p-3 cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-6 h-6 rounded flex items-center justify-center text-white font-semibold text-xs"
                          style={{ backgroundColor: project.color }}
                        >
                          {project.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </div>
                        <span className="font-medium text-sm text-foreground truncate">{project.name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">{project.phase}</div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-2">
                        <div 
                          className="h-full rounded-full"
                          style={{ width: `${project.progress}%`, backgroundColor: project.color }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{project.progress}%</span>
                        <span>{project.dueDate}</span>
                      </div>
                    </div>
                  ))}
                  {statusProjects.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground py-4">
                      No projects
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map(project => {
            const style = getStatusStyle(project.status);
            const deadline = getDeadlineWarning(project.dueDate);
            return (
              <div
                key={project.id}
                className={`bg-white/5 border-2 rounded-2xl p-5 hover:border-emerald-500/50 transition-all cursor-pointer group relative ${
                  deadline.type === 'overdue' ? 'border-red-500/50' : 
                  deadline.type === 'urgent' ? 'border-amber-500/50' : 'border-white/10'
                }`}
              >
                {/* Deadline Warning Badge */}
                {deadline.type && (
                  <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                    deadline.type === 'overdue' ? 'bg-red-500/20 text-red-400 animate-pulse' :
                    deadline.type === 'urgent' ? 'bg-amber-500/20 text-amber-400 animate-pulse' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    <Clock className="w-3 h-3" />
                    {deadline.label}
                  </div>
                )}
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
    </div>
  );
}
