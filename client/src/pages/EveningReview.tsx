import { useState } from "react";
import { 
  Moon, Check, X, Clock, ChevronDown, ChevronUp,
  Mic, MicOff, Send, Play, Folder, Target,
  CheckCircle2, XCircle, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// Mock overnight tasks organized by project
const OVERNIGHT_TASKS = [
  {
    projectId: 'proj-1',
    projectName: 'Boundless AI',
    projectColor: '#8B5CF6',
    tasks: [
      { id: 't1', text: 'Review investor deck feedback from Sarah', priority: 'high', estimatedTime: '15 min', status: 'pending' },
      { id: 't2', text: 'Prepare talking points for board call', priority: 'high', estimatedTime: '30 min', status: 'pending' },
      { id: 't3', text: 'Send NDA to potential partner', priority: 'medium', estimatedTime: '5 min', status: 'pending' },
    ]
  },
  {
    projectId: 'proj-2',
    projectName: 'Henderson Deal',
    projectColor: '#10B981',
    tasks: [
      { id: 't4', text: 'Finalize term sheet revisions', priority: 'high', estimatedTime: '45 min', status: 'pending' },
      { id: 't5', text: 'Schedule due diligence call', priority: 'medium', estimatedTime: '10 min', status: 'pending' },
    ]
  },
  {
    projectId: 'proj-3',
    projectName: 'CEPHO Platform',
    projectColor: '#EC4899',
    tasks: [
      { id: 't6', text: 'Review UX feedback from testing', priority: 'medium', estimatedTime: '20 min', status: 'pending' },
      { id: 't7', text: 'Approve new feature specifications', priority: 'low', estimatedTime: '15 min', status: 'pending' },
    ]
  },
  {
    projectId: 'proj-4',
    projectName: 'Celadon Ventures',
    projectColor: '#F59E0B',
    tasks: [
      { id: 't8', text: 'Review portfolio company updates', priority: 'medium', estimatedTime: '25 min', status: 'pending' },
    ]
  },
  {
    projectId: 'proj-5',
    projectName: 'Personal Development',
    projectColor: '#6366F1',
    tasks: [
      { id: 't9', text: 'Complete leadership course module', priority: 'low', estimatedTime: '30 min', status: 'pending' },
    ]
  }
];

type TaskStatus = 'pending' | 'accepted' | 'rejected' | 'deferred';

interface TaskDecision {
  taskId: string;
  status: TaskStatus;
}

export default function EveningReview() {
  const [taskDecisions, setTaskDecisions] = useState<TaskDecision[]>([]);
  const [expandedProjects, setExpandedProjects] = useState<string[]>(OVERNIGHT_TASKS.map(p => p.projectId));
  const [currentMood, setCurrentMood] = useState([6]);
  const [isRecordingWentWell, setIsRecordingWentWell] = useState(false);
  const [isRecordingDidntGo, setIsRecordingDidntGo] = useState(false);
  const [wentWellText, setWentWellText] = useState("");
  const [didntGoText, setDidntGoText] = useState("");
  const [showReflection, setShowReflection] = useState(false);
  const [isReadyToStart, setIsReadyToStart] = useState(false);

  const getTaskStatus = (taskId: string): TaskStatus => {
    const decision = taskDecisions.find(d => d.taskId === taskId);
    return decision?.status || 'pending';
  };

  const setTaskStatus = (taskId: string, status: TaskStatus) => {
    setTaskDecisions(prev => {
      const existing = prev.find(d => d.taskId === taskId);
      if (existing) {
        return prev.map(d => d.taskId === taskId ? { ...d, status } : d);
      }
      return [...prev, { taskId, status }];
    });
  };

  const toggleProject = (projectId: string) => {
    setExpandedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const acceptAll = (projectId: string) => {
    const project = OVERNIGHT_TASKS.find(p => p.projectId === projectId);
    if (project) {
      project.tasks.forEach(task => {
        setTaskStatus(task.id, 'accepted');
      });
      toast.success(`All ${project.projectName} tasks accepted`);
    }
  };

  const getTotalStats = () => {
    const allTasks = OVERNIGHT_TASKS.flatMap(p => p.tasks);
    const accepted = allTasks.filter(t => getTaskStatus(t.id) === 'accepted').length;
    const rejected = allTasks.filter(t => getTaskStatus(t.id) === 'rejected').length;
    const deferred = allTasks.filter(t => getTaskStatus(t.id) === 'deferred').length;
    const pending = allTasks.filter(t => getTaskStatus(t.id) === 'pending').length;
    return { total: allTasks.length, accepted, rejected, deferred, pending };
  };

  const stats = getTotalStats();
  const allDecided = stats.pending === 0;

  const toggleRecordingWentWell = () => {
    setIsRecordingWentWell(!isRecordingWentWell);
    if (!isRecordingWentWell) {
      toast.info("Recording...");
    } else {
      toast.success("Voice note captured");
      setWentWellText(prev => prev + (prev ? "\n" : "") + "[Voice note captured]");
    }
  };

  const toggleRecordingDidntGo = () => {
    setIsRecordingDidntGo(!isRecordingDidntGo);
    if (!isRecordingDidntGo) {
      toast.info("Recording...");
    } else {
      toast.success("Voice note captured");
      setDidntGoText(prev => prev + (prev ? "\n" : "") + "[Voice note captured]");
    }
  };

  const handleReadyToStart = () => {
    if (!allDecided) {
      toast.error("Please review all tasks before starting");
      return;
    }
    setIsReadyToStart(true);
    toast.success("Overnight tasks confirmed! Chief of Staff will process while you rest.");
  };

  const formatDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="h-full bg-background text-foreground overflow-auto pb-24">
      {/* Header */}
      <div className="border-b border-border bg-gradient-to-r from-indigo-500/10 to-purple-500/10 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30">
                <Moon className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Evening Review</h1>
                <p className="text-sm text-muted-foreground">{formatDate()} • 8:00 PM</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">
                {stats.accepted} Accepted
              </Badge>
              <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
                {stats.deferred} Deferred
              </Badge>
              <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50">
                {stats.rejected} Rejected
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Task Summary Header */}
        <Card className="border-2 border-indigo-200 bg-indigo-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-indigo-900">Overnight Task Summary</h2>
                <p className="text-sm text-indigo-700">
                  {stats.total} tasks across {OVERNIGHT_TASKS.length} projects • Review and validate each task
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-indigo-900">{stats.pending}</div>
                <div className="text-xs text-indigo-600">Pending Review</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects and Tasks */}
        <div className="space-y-4">
          {OVERNIGHT_TASKS.map((project) => {
            const isExpanded = expandedProjects.includes(project.projectId);
            const projectAccepted = project.tasks.filter(t => getTaskStatus(t.id) === 'accepted').length;
            const projectTotal = project.tasks.length;
            
            return (
              <Card key={project.projectId} className="overflow-hidden">
                {/* Project Header */}
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleProject(project.projectId)}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-10 rounded-full"
                      style={{ backgroundColor: project.projectColor }}
                    />
                    <div className="flex items-center gap-2">
                      <Folder className="w-5 h-5 text-muted-foreground" />
                      <span className="font-semibold text-foreground">{project.projectName}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {projectAccepted}/{projectTotal} tasks
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={(e) => { e.stopPropagation(); acceptAll(project.projectId); }}
                    >
                      Accept All
                    </Button>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                  </div>
                </div>

                {/* Tasks */}
                {isExpanded && (
                  <div className="border-t border-border">
                    {project.tasks.map((task) => {
                      const status = getTaskStatus(task.id);
                      return (
                        <div 
                          key={task.id}
                          className={`flex items-center justify-between p-4 border-b border-border last:border-b-0 transition-colors ${
                            status === 'accepted' ? 'bg-green-50/50' :
                            status === 'rejected' ? 'bg-red-50/50' :
                            status === 'deferred' ? 'bg-amber-50/50' : ''
                          }`}
                        >
                          <div className="flex-1 pr-4">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-sm font-medium ${
                                status === 'rejected' ? 'line-through text-muted-foreground' : 'text-foreground'
                              }`}>
                                {task.text}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </Badge>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {task.estimatedTime}
                              </span>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant={status === 'accepted' ? 'default' : 'outline'}
                              className={`h-8 w-8 p-0 ${status === 'accepted' ? 'bg-green-600 hover:bg-green-700' : 'hover:bg-green-50 hover:text-green-600 hover:border-green-300'}`}
                              onClick={() => setTaskStatus(task.id, 'accepted')}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={status === 'deferred' ? 'default' : 'outline'}
                              className={`h-8 w-8 p-0 ${status === 'deferred' ? 'bg-amber-600 hover:bg-amber-700' : 'hover:bg-amber-50 hover:text-amber-600 hover:border-amber-300'}`}
                              onClick={() => setTaskStatus(task.id, 'deferred')}
                            >
                              <Clock className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={status === 'rejected' ? 'default' : 'outline'}
                              className={`h-8 w-8 p-0 ${status === 'rejected' ? 'bg-red-600 hover:bg-red-700' : 'hover:bg-red-50 hover:text-red-600 hover:border-red-300'}`}
                              onClick={() => setTaskStatus(task.id, 'rejected')}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Reflection Section (Collapsible) */}
        <Card className="border border-border">
          <div 
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
            onClick={() => setShowReflection(!showReflection)}
          >
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-foreground">Daily Reflection</span>
            </div>
            {showReflection ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
          
          {showReflection && (
            <CardContent className="pt-0 space-y-4">
              {/* What Went Well */}
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-green-800">What Went Well Today</h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={`h-8 w-8 p-0 ${isRecordingWentWell ? 'text-red-600 animate-pulse' : 'text-green-600'}`}
                    onClick={toggleRecordingWentWell}
                  >
                    {isRecordingWentWell ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                </div>
                <Textarea
                  placeholder="What achievements or positive moments stood out today?"
                  value={wentWellText}
                  onChange={(e) => setWentWellText(e.target.value)}
                  className="bg-white border-green-200 text-green-900 placeholder:text-green-400 min-h-[80px]"
                />
              </div>

              {/* What Didn't Go Well */}
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-amber-800">What Didn't Go Well</h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={`h-8 w-8 p-0 ${isRecordingDidntGo ? 'text-red-600 animate-pulse' : 'text-amber-600'}`}
                    onClick={toggleRecordingDidntGo}
                  >
                    {isRecordingDidntGo ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                </div>
                <Textarea
                  placeholder="What challenges or setbacks occurred? What would you do differently?"
                  value={didntGoText}
                  onChange={(e) => setDidntGoText(e.target.value)}
                  className="bg-white border-amber-200 text-amber-900 placeholder:text-amber-400 min-h-[80px]"
                />
              </div>

              {/* Mood Score */}
              <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-indigo-800">Today's Mood Score</h3>
                  <span className="text-2xl font-bold text-indigo-600">{currentMood[0]}/10</span>
                </div>
                <Slider
                  value={currentMood}
                  onValueChange={setCurrentMood}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between mt-2 text-xs text-indigo-600">
                  <span>Challenging</span>
                  <span>Excellent</span>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Ready to Start Button */}
        <div className="sticky bottom-4 z-20">
          <Button
            size="lg"
            className={`w-full h-14 text-lg font-semibold shadow-lg ${
              isReadyToStart 
                ? 'bg-green-600 hover:bg-green-700' 
                : allDecided 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
            onClick={handleReadyToStart}
            disabled={!allDecided || isReadyToStart}
          >
            {isReadyToStart ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Overnight Tasks Confirmed
              </span>
            ) : allDecided ? (
              <span className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Ready to Start Overnight Tasks
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Review {stats.pending} Remaining Tasks
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
