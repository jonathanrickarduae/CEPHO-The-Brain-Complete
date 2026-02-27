// @ts-nocheck
import { useState, useEffect } from "react";
import { 
  Moon, Check, X, Clock, ChevronDown, ChevronUp,
  Mic, MicOff, Send, Play, Folder, Target,
  CheckCircle2, XCircle, ArrowRight, AlertCircle, Brain, Zap, Sparkles, Smile, Meh, Frown
} from "lucide-react";
import { trpc } from "@/lib/trpc";
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
    projectName: 'Project B',
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
    projectName: 'Project A Ventures',
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
type ReviewState = 'before_window' | 'in_window' | 'cutoff_warning' | 'auto_processing' | 'completed';

interface TaskDecision {
  taskId: string;
  status: TaskStatus;
}

export default function EveningReview() {
  // Check for URL parameters (autostart or delegate mode)
  const urlParams = new URLSearchParams(window.location.search);
  const isAutoStart = urlParams.get('autostart') === 'true';
  const isDelegateMode = urlParams.get('delegate') === 'true';
  
  const [taskDecisions, setTaskDecisions] = useState<TaskDecision[]>([]);
  const [expandedProjects, setExpandedProjects] = useState<string[]>([]);
  const [currentMood, setCurrentMood] = useState([60]); // 0-100 scale
  const [isRecordingWentWell, setIsRecordingWentWell] = useState(false);
  const [isRecordingDidntGo, setIsRecordingDidntGo] = useState(false);
  const [wentWellText, setWentWellText] = useState("");
  const [didntGoText, setDidntGoText] = useState("");
  const [isReadyToStart, setIsReadyToStart] = useState(false);
  const [chiefOfStaffPrompt, setChiefOfStaffPrompt] = useState(false);
  const [autoProcessingStarted, setAutoProcessingStarted] = useState(false);
  
  // Time tracking
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeUntilCutoff, setTimeUntilCutoff] = useState<string>("");
  const [reviewState, setReviewState] = useState<ReviewState>('before_window');

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      const hours = now.getHours();
      const minutes = now.getMinutes();
      
      // Review window: 7:00 PM - 8:00 PM
      if (hours === 19) {
        if (minutes >= 45) {
          setReviewState('cutoff_warning');
          const minutesLeft = 60 - minutes;
          setTimeUntilCutoff(`${minutesLeft} min until cutoff`);
        } else {
          setReviewState('in_window');
          const minutesLeft = 60 - minutes;
          setTimeUntilCutoff(`${minutesLeft} min remaining`);
        }
      } else if (hours < 19) {
        setReviewState('before_window');
        const hoursLeft = 18 - hours;
        const minutesLeft = 60 - minutes;
        setTimeUntilCutoff(`Opens in ${hoursLeft}h ${minutesLeft}m`);
      } else if (hours >= 20) {
        if (!autoProcessingStarted && !isReadyToStart) {
          handleAutoStart();
        }
        setReviewState('auto_processing');
        setTimeUntilCutoff('Auto-processing');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [autoProcessingStarted, isReadyToStart]);

  // Auto-start prompt at 7 PM
  useEffect(() => {
    if (reviewState === 'in_window' && !chiefOfStaffPrompt && !isReadyToStart && !autoProcessingStarted) {
      const timer = setTimeout(() => {
        setChiefOfStaffPrompt(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [reviewState]);

  // Handle auto-start at 8 PM
  const handleAutoStart = async () => {
    setAutoProcessingStarted(true);
    
    // Auto-accept all pending tasks
    const allTasks = OVERNIGHT_TASKS.flatMap(p => p.tasks);
    allTasks.forEach(task => {
      if (getTaskStatus(task.id) === 'pending') {
        setTaskStatus(task.id, 'accepted');
      }
    });
    
    // Save to database
    try {
      const createSession = trpc.eveningReview.createSession.useMutation();
      const completeSession = trpc.eveningReview.completeSession.useMutation();
      
      const { sessionId } = await createSession.mutateAsync({ mode: 'auto' });
      
      if (sessionId) {
        const decisions = OVERNIGHT_TASKS.flatMap(project => 
          project.tasks.map(task => ({
            taskTitle: task.text,
            projectName: project.projectName,
            decision: getTaskStatus(task.id) as 'accepted' | 'deferred' | 'rejected',
            priority: task.priority,
            estimatedTime: task.estimatedTime,
          }))
        );
        
        await completeSession.mutateAsync({
          sessionId,
          decisions,
        });
      }
    } catch (error) {
      console.error('Failed to save auto-processed session:', error);
    }
    
    toast.info("8 PM cutoff reached. Chief of Staff is auto-processing remaining tasks.");
  };

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

  // API mutations for saving review session
  const createSession = trpc.eveningReview.createSession.useMutation();
  const completeSession = trpc.eveningReview.completeSession.useMutation();

  const handleReadyToStart = async () => {
    if (!allDecided) {
      toast.error("Please review all tasks before starting");
      return;
    }
    
    try {
      // Create session
      const { sessionId } = await createSession.mutateAsync({ mode: 'manual' });
      
      if (sessionId) {
        // Prepare decisions for API
        const decisions = OVERNIGHT_TASKS.flatMap(project => 
          project.tasks.map(task => ({
            taskTitle: task.text,
            projectName: project.projectName,
            decision: getTaskStatus(task.id) as 'accepted' | 'deferred' | 'rejected',
            priority: task.priority,
            estimatedTime: task.estimatedTime,
          }))
        );
        
        // Complete session with decisions
        const result = await completeSession.mutateAsync({
          sessionId,
          decisions,
          moodScore: currentMood[0],
          wentWellNotes: wentWellText || undefined,
          didntGoWellNotes: didntGoText || undefined,
        });
        
        if (result.signalItemsGenerated > 0) {
          toast.success(`${result.signalItemsGenerated} items prepared for your morning Signal`);
        }
      }
      
      setIsReadyToStart(true);
      toast.success("Overnight tasks confirmed! Chief of Staff will process while you rest.");
    } catch (error) {
      console.error('Failed to save review session:', error);
      // Still allow completion even if API fails
      setIsReadyToStart(true);
      toast.success("Overnight tasks confirmed! Chief of Staff will process while you rest.");
    }
  };

  const formatDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getReviewStateColor = () => {
    switch (reviewState) {
      case 'before_window': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'in_window': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cutoff_warning': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'auto_processing': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getReviewStateText = () => {
    switch (reviewState) {
      case 'before_window': return 'Review window opens at 7:00 PM';
      case 'in_window': return 'Review window open';
      case 'cutoff_warning': return 'Less than 15 minutes until cutoff!';
      case 'auto_processing': return 'Auto-processing by Chief of Staff';
      case 'completed': return 'Review completed';
      default: return '';
    }
  };

  const getMoodIcon = () => {
    if (currentMood[0] >= 70) return <Smile className="w-5 h-5 text-green-400" />;
    if (currentMood[0] >= 40) return <Meh className="w-5 h-5 text-amber-400" />;
    return <Frown className="w-5 h-5 text-red-400" />;
  };

  // Chief of Staff prompt modal
  if (chiefOfStaffPrompt && !isReadyToStart && !autoProcessingStarted && reviewState !== 'completed') {
    return (
      <div className="h-full bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-900 text-foreground flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-2 border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.3)] bg-black/80 backdrop-blur-xl">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-indigo-500/20 flex items-center justify-center">
              <Brain className="w-8 h-8 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Chief of Staff</h2>
            <p className="text-gray-300">
              It's {formatTime()}. Ready to start your Evening Review?
            </p>
            <p className="text-sm text-gray-400">
              You have {stats.total} tasks across {OVERNIGHT_TASKS.length} projects to review.
            </p>
            <div className="flex flex-col gap-2 pt-4">
              <Button 
                onClick={() => setChiefOfStaffPrompt(false)}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                Yes, let's review
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setChiefOfStaffPrompt(false);
                  handleAutoStart();
                }}
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                No, auto-process for me
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Auto-processing will start at 8:00 PM if no action is taken
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Completed state
  if (isReadyToStart || autoProcessingStarted) {
    return (
      <div className="h-full bg-gradient-to-br from-gray-900 via-gray-900 to-green-900 text-foreground flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-2 border-green-500/30 shadow-[0_0_50px_rgba(34,197,94,0.3)] bg-black/80 backdrop-blur-xl">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {autoProcessingStarted && !isReadyToStart ? 'Auto-Processing Started' : 'Evening Review Complete'}
            </h2>
            <div className="space-y-2 text-left bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Tasks Accepted:</span>
                <span className="font-medium text-green-400">{stats.accepted}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Tasks Deferred:</span>
                <span className="font-medium text-amber-400">{stats.deferred}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Tasks Rejected:</span>
                <span className="font-medium text-red-400">{stats.rejected}</span>
              </div>
            </div>
            <div className="pt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Zap className="w-4 h-4 text-indigo-400" />
                <span>Chief of Staff is processing overnight tasks</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>Signal briefing will be ready by 7:00 AM</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Have a restful evening!</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4 border-white/20 text-white hover:bg-white/10"
              onClick={() => window.location.href = '/nexus'}
            >
              Return to Nexus
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-900 text-white overflow-auto">
      {/* Compact Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Moon className="h-8 w-8 text-indigo-400" />
                Evening Review
              </h1>
              <p className="text-gray-400 mt-1 text-sm">
                {formatDate()} • {stats.total} tasks across {OVERNIGHT_TASKS.length} projects
              </p>
            </div>
            
            {/* Compact Stats + Timer */}
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">{stats.accepted} ✓</Badge>
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">{stats.deferred} ⏸</Badge>
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">{stats.rejected} ✕</Badge>
                <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">{stats.pending} ⋯</Badge>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getReviewStateColor()}`}>
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">{timeUntilCutoff}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Banner for Cutoff */}
      {reviewState === 'cutoff_warning' && (
        <div className="bg-amber-500/20 border-b border-amber-500/30 px-6 py-2">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-amber-400">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Less than 15 minutes until 8 PM cutoff!</span>
            <span className="text-amber-300/70">Chief of Staff will auto-process remaining tasks.</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Tasks (2/3 width) */}
          <div className="lg:col-span-2 space-y-4">
            {OVERNIGHT_TASKS.map((project) => {
              const isExpanded = expandedProjects.includes(project.projectId);
              const projectStats = {
                total: project.tasks.length,
                accepted: project.tasks.filter(t => getTaskStatus(t.id) === 'accepted').length,
                pending: project.tasks.filter(t => getTaskStatus(t.id) === 'pending').length,
              };
              
              return (
                <Card key={project.projectId} className="border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
                  {/* Project Header */}
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => toggleProject(project.projectId)}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: project.projectColor }}
                      />
                      <div>
                        <h3 className="font-semibold text-white">{project.projectName}</h3>
                        <p className="text-xs text-gray-400">
                          {projectStats.accepted}/{projectStats.total} accepted
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {projectStats.pending > 0 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            acceptAll(project.projectId);
                          }}
                          className="text-xs text-green-400 hover:bg-green-500/10"
                        >
                          Accept All
                        </Button>
                      )}
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </div>
                  </div>

                  {/* Tasks List */}
                  {isExpanded && (
                    <div className="border-t border-white/10 divide-y divide-white/10">
                      {project.tasks.map((task) => {
                        const status = getTaskStatus(task.id);
                        return (
                          <div key={task.id} className="p-3 hover:bg-white/5 transition-colors">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm ${status === 'rejected' ? 'line-through text-gray-500' : 'text-white'}`}>
                                  {task.text}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                                    {task.priority}
                                  </Badge>
                                  <span className="text-xs text-gray-500">{task.estimatedTime}</span>
                                </div>
                              </div>
                              <div className="flex gap-1 shrink-0">
                                <Button
                                  size="sm"
                                  variant={status === 'accepted' ? 'default' : 'ghost'}
                                  onClick={() => setTaskStatus(task.id, 'accepted')}
                                  className={status === 'accepted' ? 'bg-green-600 hover:bg-green-700' : 'hover:bg-green-500/10 text-green-400'}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant={status === 'deferred' ? 'default' : 'ghost'}
                                  onClick={() => setTaskStatus(task.id, 'deferred')}
                                  className={status === 'deferred' ? 'bg-amber-600 hover:bg-amber-700' : 'hover:bg-amber-500/10 text-amber-400'}
                                >
                                  <Clock className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant={status === 'rejected' ? 'default' : 'ghost'}
                                  onClick={() => setTaskStatus(task.id, 'rejected')}
                                  className={status === 'rejected' ? 'bg-red-600 hover:bg-red-700' : 'hover:bg-red-500/10 text-red-400'}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
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

          {/* Right Column - Reflection (1/3 width) */}
          <div className="space-y-4">
            {/* Mood Tracker */}
            <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  {getMoodIcon()}
                  How was your day?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Slider
                  value={currentMood}
                  onValueChange={setCurrentMood}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Challenging</span>
                  <span>Great</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Notes */}
            <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-green-400" />
                  What went well?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Textarea
                  placeholder="Quick notes..."
                  value={wentWellText}
                  onChange={(e) => setWentWellText(e.target.value)}
                  className="min-h-[60px] bg-white/5 border-white/10 text-white resize-none"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleRecordingWentWell}
                  className={`w-full ${isRecordingWentWell ? 'bg-red-500/20 text-red-400' : 'text-gray-400'}`}
                >
                  {isRecordingWentWell ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                  {isRecordingWentWell ? 'Stop Recording' : 'Voice Note'}
                </Button>
              </CardContent>
            </Card>

            <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  What could improve?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Textarea
                  placeholder="Quick notes..."
                  value={didntGoText}
                  onChange={(e) => setDidntGoText(e.target.value)}
                  className="min-h-[60px] bg-white/5 border-white/10 text-white resize-none"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleRecordingDidntGo}
                  className={`w-full ${isRecordingDidntGo ? 'bg-red-500/20 text-red-400' : 'text-gray-400'}`}
                >
                  {isRecordingDidntGo ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                  {isRecordingDidntGo ? 'Stop Recording' : 'Voice Note'}
                </Button>
              </CardContent>
            </Card>

            {/* Complete Button */}
            <Button
              onClick={handleReadyToStart}
              disabled={!allDecided}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {allDecided ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Complete Review
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 mr-2" />
                  Review {stats.pending} Pending Tasks
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
