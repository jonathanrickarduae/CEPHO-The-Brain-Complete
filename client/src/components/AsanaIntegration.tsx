import { useState, useEffect } from 'react';
import { 
  CheckSquare, Clock, Users, AlertTriangle, 
  ChevronRight, ExternalLink, RefreshCw, Filter,
  Calendar, Target, TrendingUp, BarChart3,
  FolderOpen, User, CheckCircle, Circle, Loader2
} from 'lucide-react';

// Asana data types
interface AsanaWorkspace {
  id: string;
  name: string;
  isOrganization: boolean;
}

interface AsanaProject {
  id: string;
  name: string;
  color: string;
  workspaceId: string;
  workspaceName: string;
  taskCount: number;
  completedCount: number;
  overdueCount: number;
  teamMembers: AsanaTeamMember[];
  dueDate?: Date;
  status: 'on_track' | 'at_risk' | 'off_track';
  lastUpdated: Date;
}

interface AsanaTask {
  id: string;
  name: string;
  projectId: string;
  projectName: string;
  assignee?: AsanaTeamMember;
  dueDate?: Date;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  tags: string[];
  subtasks: number;
  completedSubtasks: number;
}

interface AsanaTeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  tasksAssigned: number;
  tasksCompleted: number;
}

interface AsanaUpdate {
  id: string;
  projectId: string;
  projectName: string;
  type: 'task_completed' | 'task_created' | 'comment' | 'status_update' | 'due_date_changed';
  description: string;
  user: AsanaTeamMember;
  timestamp: Date;
}

// Mock data for demonstration
const MOCK_PROJECTS: AsanaProject[] = [
  {
    id: 'proj-celadon',
    name: 'Celadon Capital',
    color: '#10b981',
    workspaceId: 'ws-1',
    workspaceName: 'Celadon Workspace',
    taskCount: 47,
    completedCount: 32,
    overdueCount: 3,
    teamMembers: [
      { id: 'u1', name: 'Sarah Chen', email: 'sarah@celadon.com', tasksAssigned: 12, tasksCompleted: 8 },
      { id: 'u2', name: 'James Wilson', email: 'james@celadon.com', tasksAssigned: 15, tasksCompleted: 12 },
      { id: 'u3', name: 'Emily Brown', email: 'emily@celadon.com', tasksAssigned: 10, tasksCompleted: 7 },
    ],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    status: 'on_track',
    lastUpdated: new Date(),
  },
  {
    id: 'proj-sample',
    name: 'Boundless AI',
    color: '#8b5cf6',
    workspaceId: 'ws-1',
    workspaceName: 'Celadon Workspace',
    taskCount: 63,
    completedCount: 28,
    overdueCount: 8,
    teamMembers: [
      { id: 'u4', name: 'Michael Lee', email: 'michael@boundless.com', tasksAssigned: 20, tasksCompleted: 10 },
      { id: 'u5', name: 'Anna Smith', email: 'anna@boundless.com', tasksAssigned: 18, tasksCompleted: 9 },
    ],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    status: 'at_risk',
    lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 'proj-cepho',
    name: 'Cepho Development',
    color: '#f59e0b',
    workspaceId: 'ws-2',
    workspaceName: 'Personal Projects',
    taskCount: 89,
    completedCount: 67,
    overdueCount: 2,
    teamMembers: [
      { id: 'u6', name: 'Dev Team', email: 'dev@company.com', tasksAssigned: 45, tasksCompleted: 38 },
    ],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: 'on_track',
    lastUpdated: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: 'proj-marketing',
    name: 'Q1 Marketing Campaign',
    color: '#ec4899',
    workspaceId: 'ws-1',
    workspaceName: 'Celadon Workspace',
    taskCount: 34,
    completedCount: 8,
    overdueCount: 12,
    teamMembers: [
      { id: 'u7', name: 'Marketing Team', email: 'marketing@celadon.com', tasksAssigned: 34, tasksCompleted: 8 },
    ],
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    status: 'off_track',
    lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
];

const MOCK_TASKS: AsanaTask[] = [
  { id: 't1', name: 'Review investor deck', projectId: 'proj-celadon', projectName: 'Celadon Capital', assignee: MOCK_PROJECTS[0].teamMembers[0], dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), completed: false, priority: 'high', tags: ['urgent', 'investor'], subtasks: 5, completedSubtasks: 3 },
  { id: 't2', name: 'Finalize partnership agreement', projectId: 'proj-sample', projectName: 'Boundless AI', assignee: MOCK_PROJECTS[1].teamMembers[0], dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), completed: false, priority: 'high', tags: ['legal', 'overdue'], subtasks: 3, completedSubtasks: 1 },
  { id: 't3', name: 'Deploy v2.1 update', projectId: 'proj-cepho', projectName: 'Cepho Development', assignee: MOCK_PROJECTS[2].teamMembers[0], dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), completed: false, priority: 'medium', tags: ['development'], subtasks: 8, completedSubtasks: 6 },
  { id: 't4', name: 'Social media content calendar', projectId: 'proj-marketing', projectName: 'Q1 Marketing Campaign', dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), completed: false, priority: 'high', tags: ['marketing', 'overdue'], subtasks: 12, completedSubtasks: 2 },
  { id: 't5', name: 'Team standup notes', projectId: 'proj-celadon', projectName: 'Celadon Capital', assignee: MOCK_PROJECTS[0].teamMembers[1], dueDate: new Date(), completed: true, priority: 'low', tags: ['recurring'], subtasks: 0, completedSubtasks: 0 },
];

const MOCK_UPDATES: AsanaUpdate[] = [
  { id: 'upd1', projectId: 'proj-celadon', projectName: 'Celadon Capital', type: 'task_completed', description: 'Completed "Quarterly report draft"', user: MOCK_PROJECTS[0].teamMembers[1], timestamp: new Date(Date.now() - 15 * 60 * 1000) },
  { id: 'upd2', projectId: 'proj-sample', projectName: 'Boundless AI', type: 'status_update', description: 'Project status changed to "At Risk"', user: MOCK_PROJECTS[1].teamMembers[0], timestamp: new Date(Date.now() - 45 * 60 * 1000) },
  { id: 'upd3', projectId: 'proj-cepho', projectName: 'Cepho Development', type: 'task_created', description: 'Created "Add Asana integration"', user: MOCK_PROJECTS[2].teamMembers[0], timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
  { id: 'upd4', projectId: 'proj-marketing', projectName: 'Q1 Marketing Campaign', type: 'due_date_changed', description: 'Due date extended for "Launch campaign"', user: MOCK_PROJECTS[3].teamMembers[0], timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) },
  { id: 'upd5', projectId: 'proj-celadon', projectName: 'Celadon Capital', type: 'comment', description: 'Commented on "Review investor deck"', user: MOCK_PROJECTS[0].teamMembers[2], timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) },
];

interface AsanaIntegrationProps {
  onConnect?: () => void;
}

export function AsanaIntegration({ onConnect }: AsanaIntegrationProps) {
  const [isConnected, setIsConnected] = useState(true); // Mock connected state
  const [isConnecting, setIsConnecting] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'projects' | 'tasks' | 'updates'>('dashboard');
  const [selectedProject, setSelectedProject] = useState<AsanaProject | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'on_track' | 'at_risk' | 'off_track'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    // Simulate OAuth flow
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsConnected(true);
    setIsConnecting(false);
    onConnect?.();
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  const filteredProjects = MOCK_PROJECTS.filter(p => 
    filterStatus === 'all' || p.status === filterStatus
  );

  const totalTasks = MOCK_PROJECTS.reduce((sum, p) => sum + p.taskCount, 0);
  const completedTasks = MOCK_PROJECTS.reduce((sum, p) => sum + p.completedCount, 0);
  const overdueTasks = MOCK_PROJECTS.reduce((sum, p) => sum + p.overdueCount, 0);
  const atRiskProjects = MOCK_PROJECTS.filter(p => p.status !== 'on_track').length;

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `${days} days left`;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString('en-GB');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return 'text-green-400 bg-green-500/20';
      case 'at_risk': return 'text-yellow-400 bg-yellow-500/20';
      case 'off_track': return 'text-red-400 bg-red-500/20';
      default: return 'text-foreground/70 bg-gray-500/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-blue-400 bg-blue-500/20';
      default: return 'text-foreground/70 bg-gray-500/20';
    }
  };

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'task_completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'task_created': return <Circle className="w-4 h-4 text-blue-400" />;
      case 'status_update': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'due_date_changed': return <Calendar className="w-4 h-4 text-purple-400" />;
      default: return <CheckSquare className="w-4 h-4 text-foreground/70" />;
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-card rounded-xl border border-border p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-4">
          <CheckSquare className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Connect Asana</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Connect your Asana account to sync projects, track tasks, and get real-time updates across all your workspaces.
        </p>
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 mx-auto"
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <ExternalLink className="w-4 h-4" />
              Connect with Asana
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500/20 via-red-500/20 to-pink-500/20 p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <CheckSquare className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Asana Projects</h2>
              <p className="text-sm text-muted-foreground">
                {MOCK_PROJECTS.length} projects • Last synced {formatTimeAgo(new Date())}
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 text-muted-foreground ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-black/20 rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Target className="w-4 h-4" />
              <span className="text-xs">Total Tasks</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalTasks}</p>
            <p className="text-xs text-green-400">{completedTasks} completed</p>
          </div>

          <div className="bg-black/20 rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs">Overdue</span>
            </div>
            <p className="text-2xl font-bold text-red-400">{overdueTasks}</p>
            <p className="text-xs text-muted-foreground">tasks need attention</p>
          </div>

          <div className="bg-black/20 rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <FolderOpen className="w-4 h-4" />
              <span className="text-xs">Projects</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{MOCK_PROJECTS.length}</p>
            <p className="text-xs text-yellow-400">{atRiskProjects} at risk</p>
          </div>

          <div className="bg-black/20 rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">Completion</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {Math.round((completedTasks / totalTasks) * 100)}%
            </p>
            <p className="text-xs text-muted-foreground">overall progress</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {(['dashboard', 'projects', 'tasks', 'updates'] as const).map(view => (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className={`flex-1 px-4 py-3 text-sm font-medium capitalize transition-colors ${
              activeView === view
                ? 'text-orange-400 border-b-2 border-orange-400'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {view}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {activeView === 'dashboard' && (
          <div className="space-y-6">
            {/* At Risk Projects Alert */}
            {atRiskProjects > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  <h3 className="font-semibold text-yellow-400">Projects Needing Attention</h3>
                </div>
                <div className="space-y-2">
                  {MOCK_PROJECTS.filter(p => p.status !== 'on_track').map(project => (
                    <div key={project.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: project.color }}
                        />
                        <span className="text-foreground">{project.name}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(project.status)}`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Updates */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Recent Activity</h3>
              <div className="space-y-3">
                {MOCK_UPDATES.slice(0, 5).map(update => (
                  <div key={update.id} className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                    {getUpdateIcon(update.type)}
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{update.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {update.user.name} • {update.projectName} • {formatTimeAgo(update.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Urgent Tasks */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Urgent Tasks</h3>
              <div className="space-y-2">
                {MOCK_TASKS.filter(t => !t.completed && t.priority === 'high').map(task => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Circle className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-foreground">{task.name}</p>
                        <p className="text-xs text-muted-foreground">{task.projectName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <p className={`text-xs mt-1 ${task.dueDate && task.dueDate < new Date() ? 'text-red-400' : 'text-muted-foreground'}`}>
                        {task.dueDate ? formatDate(task.dueDate) : 'No due date'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeView === 'projects' && (
          <div className="space-y-4">
            {/* Filter */}
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-foreground"
              >
                <option value="all">All Projects</option>
                <option value="on_track">On Track</option>
                <option value="at_risk">At Risk</option>
                <option value="off_track">Off Track</option>
              </select>
            </div>

            {/* Project Cards */}
            {filteredProjects.map(project => (
              <div 
                key={project.id}
                className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-gray-600 transition-colors cursor-pointer"
                onClick={() => setSelectedProject(project)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded" 
                      style={{ backgroundColor: project.color }}
                    />
                    <div>
                      <h4 className="font-medium text-foreground">{project.name}</h4>
                      <p className="text-xs text-muted-foreground">{project.workspaceName}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(project.status)}`}>
                    {project.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-foreground">
                      {project.completedCount}/{project.taskCount} tasks
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all"
                      style={{ 
                        width: `${(project.completedCount / project.taskCount) * 100}%`,
                        backgroundColor: project.color
                      }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-3 h-3" />
                      {project.teamMembers.length}
                    </span>
                    {project.overdueCount > 0 && (
                      <span className="flex items-center gap-1 text-red-400">
                        <AlertTriangle className="w-3 h-3" />
                        {project.overdueCount} overdue
                      </span>
                    )}
                  </div>
                  {project.dueDate && (
                    <span className="text-muted-foreground">
                      {formatDate(project.dueDate)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeView === 'tasks' && (
          <div className="space-y-3">
            {MOCK_TASKS.map(task => (
              <div 
                key={task.id}
                className={`p-4 bg-gray-800/50 border border-gray-700 rounded-xl ${
                  task.completed ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <button className="mt-0.5">
                    {task.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                    )}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {task.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">{task.projectName}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      {task.assignee && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <User className="w-3 h-3" />
                          {task.assignee.name}
                        </span>
                      )}
                      {task.dueDate && (
                        <span className={`flex items-center gap-1 ${
                          !task.completed && task.dueDate < new Date() ? 'text-red-400' : 'text-muted-foreground'
                        }`}>
                          <Calendar className="w-3 h-3" />
                          {formatDate(task.dueDate)}
                        </span>
                      )}
                      {task.subtasks > 0 && (
                        <span className="text-muted-foreground">
                          {task.completedSubtasks}/{task.subtasks} subtasks
                        </span>
                      )}
                    </div>

                    {task.tags.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {task.tags.map(tag => (
                          <span key={tag} className="text-xs px-2 py-0.5 bg-gray-700 rounded text-muted-foreground">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeView === 'updates' && (
          <div className="space-y-3">
            {MOCK_UPDATES.map(update => (
              <div key={update.id} className="flex items-start gap-3 p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                  {getUpdateIcon(update.type)}
                </div>
                <div className="flex-1">
                  <p className="text-foreground">{update.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{update.user.name}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-primary">{update.projectName}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{formatTimeAgo(update.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Compact widget for Dashboard
export function AsanaWidget() {
  const urgentTasks = MOCK_TASKS.filter(t => !t.completed && t.priority === 'high').length;
  const atRiskProjects = MOCK_PROJECTS.filter(p => p.status !== 'on_track').length;

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <CheckSquare className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-semibold text-foreground">Asana</h3>
        </div>
        <a href="/settings" className="text-xs text-primary hover:underline">View All</a>
      </div>

      <div className="space-y-3">
        {urgentTasks > 0 && (
          <div className="flex items-center justify-between p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
            <span className="text-sm text-red-400">{urgentTasks} urgent tasks</span>
            <ChevronRight className="w-4 h-4 text-red-400" />
          </div>
        )}
        
        {atRiskProjects > 0 && (
          <div className="flex items-center justify-between p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <span className="text-sm text-yellow-400">{atRiskProjects} projects at risk</span>
            <ChevronRight className="w-4 h-4 text-yellow-400" />
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center">
          {MOCK_PROJECTS.length} projects • {MOCK_TASKS.filter(t => !t.completed).length} open tasks
        </div>
      </div>
    </div>
  );
}
