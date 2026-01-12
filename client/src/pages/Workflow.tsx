import { useState } from "react";
import { 
  Activity, AlertTriangle, CheckCircle2, Clock, ArrowRight, 
  ChevronDown, ChevronRight, Users, Calendar, Flag, 
  TrendingUp, Zap, Filter, LayoutGrid, List, Search,
  AlertCircle, Pause, Play, MoreHorizontal
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isDemoModeEnabled, getDemoData } from "@/services/demoMode";

// Project data matching Library structure
// This will be connected to real data from Project Genesis and Review Queue
// For now, includes standard projects plus dynamic Project Genesis entries
const projects = [
  {
    id: 'celadon',
    name: 'Celadon Pharmaceuticals',
    icon: '💊',
    status: 'blocked',
    progress: 65,
    phase: 'Legal Review',
    dueDate: '2024-01-15',
    team: ['Alex Chen', 'Dr. Priya Sharma'],
    blockers: [
      { id: 1, issue: 'Legal review pending for 3 days', severity: 'critical', assignee: 'Legal Team' },
      { id: 2, issue: 'Awaiting compliance sign-off', severity: 'high', assignee: 'Sarah Mitchell' }
    ],
    tasks: { total: 24, completed: 16, inProgress: 5, blocked: 3 },
    lastUpdate: '2 hours ago',
    alerts: 2
  },
  {
    id: 'boundless',
    name: 'Boundless Telecom',
    icon: '📡',
    status: 'on-track',
    progress: 82,
    phase: 'Development',
    dueDate: '2024-01-20',
    team: ['Marcus Johnson', 'David Park'],
    blockers: [],
    tasks: { total: 18, completed: 15, inProgress: 3, blocked: 0 },
    lastUpdate: '30 minutes ago',
    alerts: 0
  },
  {
    id: 'perfect-dxb',
    name: 'Perfect DXB',
    icon: '🏗️',
    status: 'at-risk',
    progress: 45,
    phase: 'Planning',
    dueDate: '2024-01-25',
    team: ['Lisa Wang', 'Sarah Kim'],
    blockers: [
      { id: 1, issue: 'Budget approval delayed', severity: 'medium', assignee: 'Finance Team' }
    ],
    tasks: { total: 31, completed: 14, inProgress: 12, blocked: 5 },
    lastUpdate: '1 hour ago',
    alerts: 1
  },
  {
    id: 'ampora',
    name: 'Ampora',
    icon: '🌊',
    status: 'on-track',
    progress: 91,
    phase: 'Final Review',
    dueDate: '2024-01-12',
    team: ['Alex Chen', 'Marcus Johnson'],
    blockers: [],
    tasks: { total: 15, completed: 14, inProgress: 1, blocked: 0 },
    lastUpdate: '15 minutes ago',
    alerts: 0
  },
  {
    id: 'project-5',
    name: 'Project 5',
    icon: '🚀',
    status: 'on-track',
    progress: 55,
    phase: 'Research',
    dueDate: '2024-02-01',
    team: ['Dr. Priya Sharma'],
    blockers: [],
    tasks: { total: 9, completed: 5, inProgress: 4, blocked: 0 },
    lastUpdate: '3 hours ago',
    alerts: 0
  },
  {
    id: 'project-6',
    name: 'Project 6',
    icon: '⚡',
    status: 'not-started',
    progress: 0,
    phase: 'Not Started',
    dueDate: '2024-02-15',
    team: [],
    blockers: [],
    tasks: { total: 7, completed: 0, inProgress: 0, blocked: 0 },
    lastUpdate: 'Not started',
    alerts: 0
  }
];

// Chief of Staff alerts
const twinAlerts = [
  { id: 1, project: 'Celadon Pharmaceuticals', message: 'Legal review has been pending for 3 days. Recommend escalation.', priority: 'critical', time: '7:00 AM' },
  { id: 2, project: 'Perfect DXB', message: 'Budget approval delay may impact timeline. Finance team notified.', priority: 'warning', time: '6:45 AM' },
  { id: 3, project: 'Ampora', message: 'Project on track for early completion. Well done!', priority: 'success', time: '6:30 AM' },
];

export default function Workflow() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'blocked': return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', bar: 'bg-red-500' };
      case 'at-risk': return { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', bar: 'bg-amber-500' };
      case 'on-track': return { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', bar: 'bg-green-500' };
      case 'not-started': return { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30', bar: 'bg-gray-500' };
      default: return { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30', bar: 'bg-gray-500' };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'blocked': return 'BLOCKED';
      case 'at-risk': return 'AT RISK';
      case 'on-track': return 'ON TRACK';
      case 'not-started': return 'NOT STARTED';
      default: return status.toUpperCase();
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
    totalBlockers: projects.reduce((acc, p) => acc + p.blockers.length, 0)
  };

  return (
    <div className="min-h-screen bg-black text-white p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30">
            <Activity className="w-8 h-8 text-red-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
              Workflow Dashboard
            </h1>
            <p className="text-gray-400">ERP-style project visibility across all initiatives</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white/10' : ''}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white/10' : ''}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{stats.total}</div>
          <div className="text-sm text-gray-400">Total Projects</div>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-green-400">{stats.onTrack}</div>
          <div className="text-sm text-green-400/70">On Track</div>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-400">{stats.atRisk}</div>
          <div className="text-sm text-amber-400/70">At Risk</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-red-400">{stats.blocked}</div>
          <div className="text-sm text-red-400/70">Blocked</div>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-400">{stats.totalBlockers}</div>
          <div className="text-sm text-purple-400/70">Active Blockers</div>
        </div>
      </div>

      {/* Chief of Staff Alerts */}
      {twinAlerts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-400" />
            Chief of Staff Alerts
          </h2>
          <div className="space-y-2">
            {twinAlerts.map(alert => (
              <div 
                key={alert.id}
                className={`flex items-center gap-4 p-3 rounded-lg border ${
                  alert.priority === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                  alert.priority === 'warning' ? 'bg-amber-500/10 border-amber-500/30' :
                  'bg-green-500/10 border-green-500/30'
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  alert.priority === 'critical' ? 'bg-red-500/20' :
                  alert.priority === 'warning' ? 'bg-amber-500/20' :
                  'bg-green-500/20'
                }`}>
                  {alert.priority === 'critical' ? <AlertTriangle className="w-4 h-4 text-red-400" /> :
                   alert.priority === 'warning' ? <AlertCircle className="w-4 h-4 text-amber-400" /> :
                   <CheckCircle2 className="w-4 h-4 text-green-400" />}
                </div>
                <div className="flex-1">
                  <span className="font-medium text-white">{alert.project}</span>
                  <span className="text-gray-400 mx-2">—</span>
                  <span className="text-gray-300">{alert.message}</span>
                </div>
                <span className="text-xs text-gray-500">{alert.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-1">
          {['all', 'on-track', 'at-risk', 'blocked'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === status 
                  ? 'bg-white/10 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {status === 'all' ? 'All Projects' : getStatusLabel(status)}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-3 gap-4' : 'space-y-4'}>
        {filteredProjects.map(project => {
          const colors = getStatusColor(project.status);
          return (
            <div
              key={project.id}
              className={`bg-white/5 border ${colors.border} rounded-xl overflow-hidden hover:bg-white/10 transition-all cursor-pointer`}
              onClick={() => setSelectedProject(selectedProject === project.id ? null : project.id)}
            >
              {/* Status Bar */}
              <div className={`h-1 ${colors.bar}`} />
              
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{project.icon}</span>
                    <div>
                      <h3 className="font-semibold text-white">{project.name}</h3>
                      <p className="text-sm text-gray-400">{project.phase}</p>
                    </div>
                  </div>
                  <Badge className={`${colors.bg} ${colors.text} ${colors.border}`}>
                    {getStatusLabel(project.status)}
                  </Badge>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white font-medium">{project.progress}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${colors.bar} transition-all`} style={{ width: `${project.progress}%` }} />
                  </div>
                </div>

                {/* Tasks Summary */}
                <div className="grid grid-cols-4 gap-2 mb-4 text-center">
                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="text-lg font-bold text-white">{project.tasks.total}</div>
                    <div className="text-xs text-gray-500">Total</div>
                  </div>
                  <div className="bg-green-500/10 rounded-lg p-2">
                    <div className="text-lg font-bold text-green-400">{project.tasks.completed}</div>
                    <div className="text-xs text-green-400/70">Done</div>
                  </div>
                  <div className="bg-blue-500/10 rounded-lg p-2">
                    <div className="text-lg font-bold text-blue-400">{project.tasks.inProgress}</div>
                    <div className="text-xs text-blue-400/70">Active</div>
                  </div>
                  <div className="bg-red-500/10 rounded-lg p-2">
                    <div className="text-lg font-bold text-red-400">{project.tasks.blocked}</div>
                    <div className="text-xs text-red-400/70">Blocked</div>
                  </div>
                </div>

                {/* Blockers */}
                {project.blockers.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {project.blockers.map(blocker => (
                      <div key={blocker.id} className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <AlertTriangle className={`w-4 h-4 shrink-0 ${
                          blocker.severity === 'critical' ? 'text-red-400' :
                          blocker.severity === 'high' ? 'text-orange-400' :
                          'text-amber-400'
                        }`} />
                        <span className="text-sm text-gray-300 flex-1">{blocker.issue}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Due {project.dueDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{project.lastUpdate}</span>
                  </div>
                </div>

                {/* Team */}
                {project.team.length > 0 && (
                  <div className="flex items-center gap-2 mt-3">
                    <Users className="w-4 h-4 text-gray-500" />
                    <div className="flex -space-x-2">
                      {project.team.slice(0, 3).map((member, i) => (
                        <div 
                          key={i}
                          className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-black flex items-center justify-center text-[10px] font-medium"
                          title={member}
                        >
                          {member.split(' ').map(n => n[0]).join('')}
                        </div>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">{project.team.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pipeline View */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          Pipeline Overview
        </h2>
        <div className="grid grid-cols-5 gap-4">
          {['Not Started', 'Planning', 'In Progress', 'Review', 'Complete'].map((stage, index) => (
            <div key={stage} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-400">{stage}</h3>
                <Badge variant="outline" className="text-xs">
                  {projects.filter(p => 
                    stage === 'Not Started' ? p.phase === 'Not Started' :
                    stage === 'Planning' ? p.phase === 'Planning' || p.phase === 'Research' :
                    stage === 'In Progress' ? p.phase === 'Development' || p.phase === 'Legal Review' :
                    stage === 'Review' ? p.phase === 'Final Review' :
                    p.progress === 100
                  ).length}
                </Badge>
              </div>
              <div className="space-y-2 min-h-[200px] bg-white/5 rounded-xl p-3 border border-white/10">
                {projects.filter(p => 
                  stage === 'Not Started' ? p.phase === 'Not Started' :
                  stage === 'Planning' ? p.phase === 'Planning' || p.phase === 'Research' :
                  stage === 'In Progress' ? p.phase === 'Development' || p.phase === 'Legal Review' :
                  stage === 'Review' ? p.phase === 'Final Review' :
                  p.progress === 100
                ).map(project => {
                  const colors = getStatusColor(project.status);
                  return (
                    <div 
                      key={project.id}
                      className={`p-3 rounded-lg border ${colors.border} ${colors.bg} cursor-pointer hover:scale-[1.02] transition-transform`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span>{project.icon}</span>
                        <span className="text-sm font-medium text-white truncate">{project.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <Progress value={project.progress} className="h-1 flex-1 mr-2" />
                        <span className="text-xs text-gray-400">{project.progress}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
