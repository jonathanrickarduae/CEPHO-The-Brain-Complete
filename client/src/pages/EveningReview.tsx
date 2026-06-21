import { useState, useEffect } from "react";
import { 
  Moon, Check, X, Clock, ChevronDown, ChevronUp,
  Mic, MicOff, Send, Play, Folder, Target,
  CheckCircle2, XCircle, ArrowRight, AlertCircle, Brain, Zap, Sparkles
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
  const [expandedProjects, setExpandedProjects] = useState<string[]>(OVERNIGHT_TASKS.map(p => p.projectId));
  const [currentMood, setCurrentMood] = useState([60]); // 0-100 scale
  const [isRecordingWentWell, setIsRecordingWentWell] = useState(false);
  const [isRecordingDidntGo, setIsRecordingDidntGo] = useState(false);
  const [wentWellText, setWentWellText] = useState("");
  const [didntGoText, setDidntGoText] = useState("");
  const [showReflection, setShowReflection] = useState(false);
  const [showStrategicFocus, setShowStrategicFocus] = useState(false);
  const [stopDoing, setStopDoing] = useState("");
  const [delegateTo, setDelegateTo] = useState("");
  const [focusMore, setFocusMore] = useState("");
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
      
      // Calculate cutoff time (8 PM today)
      const cutoff = new Date();
      cutoff.setHours(20, 0, 0, 0);
      
      // Calculate window start (7 PM today)
      const windowStart = new Date();
      windowStart.setHours(19, 0, 0, 0);
      
      // Calculate warning time (7:45 PM - 15 min before cutoff)
      const warningTime = new Date();
      warningTime.setHours(19, 45, 0, 0);
      
      const msUntilCutoff = cutoff.getTime() - now.getTime();
      
      // Determine review state
      if (isReadyToStart || autoProcessingStarted) {
        setReviewState('completed');
      } else if (now >= cutoff) {
        setReviewState('auto_processing');
        if (!autoProcessingStarted) {
          // Trigger auto-processing
          handleAutoStart();
        }
      } else if (now >= warningTime) {
        setReviewState('cutoff_warning');
      } else if (now >= windowStart) {
        setReviewState('in_window');
        // Show Chief of Staff prompt at 7 PM
        if (!chiefOfStaffPrompt) {
          setChiefOfStaffPrompt(true);
        }
      } else {
        setReviewState('before_window');
      }
      
      // Format countdown
      if (msUntilCutoff > 0) {
        const hours = Math.floor(msUntilCutoff / (1000 * 60 * 60));
        const minutes = Math.floor((msUntilCutoff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((msUntilCutoff % (1000 * 60)) / 1000);
        
        if (hours > 0) {
          setTimeUntilCutoff(`${hours}h ${minutes}m ${seconds}s`);
        } else if (minutes > 0) {
          setTimeUntilCutoff(`${minutes}m ${seconds}s`);
        } else {
          setTimeUntilCutoff(`${seconds}s`);
        }
      } else {
        setTimeUntilCutoff("Cutoff passed");
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isReadyToStart, autoProcessingStarted, chiefOfStaffPrompt]);

  // Handle URL parameters for auto-start or delegate mode
  useEffect(() => {
    if (isAutoStart || isDelegateMode) {
      // Skip the Chief of Staff prompt and go directly to processing
      setChiefOfStaffPrompt(false);
      
      if (isDelegateMode) {
        // Delegate mode: auto-accept all tasks immediately
        handleAutoStart();
        toast.success("Chief of Staff is handling your evening review");
      } else if (isAutoStart) {
        // Auto-start mode: show the review but skip the prompt
        toast.info("Evening review started automatically");
      }
    }
  }, []); // Only run once on mount

  const handleAutoStart = async () => {
    setAutoProcessingStarted(true);
    // Auto-accept all pending tasks
    OVERNIGHT_TASKS.forEach(project => {
      project.tasks.forEach(task => {
        const status = getTaskStatus(task.id);
        if (status === 'pending') {
          setTaskStatus(task.id, 'accepted');
        }
      });
    });
    
    // Save to database
    try {
      const mode = isDelegateMode ? 'delegated' : 'auto_processed';
      const { sessionId } = await createSession.mutateAsync({ mode });
      
      if (sessionId) {
        // All tasks auto-accepted
        const decisions = OVERNIGHT_TASKS.flatMap(project => 
          project.tasks.map(task => ({
            taskTitle: task.text,
            projectName: project.projectName,
            decision: 'accepted' as const,
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
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-foreground/50 bg-gray-50 border-gray-200';
    }
  };

  const getReviewStateColor = () => {
    switch (reviewState) {
      case 'before_window': return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'in_window': return 'bg-green-100 text-green-700 border-green-300';
      case 'cutoff_warning': return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'auto_processing': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
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

  // Chief of Staff prompt modal
  if (chiefOfStaffPrompt && !isReadyToStart && !autoProcessingStarted && reviewState !== 'completed') {
    return (
      <div className="h-full bg-background text-foreground flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-2 border-indigo-300 shadow-xl">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-indigo-100 flex items-center justify-center">
              <Brain className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Chief of Staff</h2>
            <p className="text-muted-foreground">
              It's {formatTime()}. Ready to start your Evening Review?
            </p>
            <p className="text-sm text-muted-foreground">
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
                className="w-full"
              >
                No, auto-process for me
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
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
      <div className="h-full bg-background text-foreground flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-2 border-green-300 shadow-xl">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              {autoProcessingStarted && !isReadyToStart ? 'Auto-Processing Started' : 'Evening Review Complete'}
            </h2>
            <div className="space-y-2 text-left bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tasks Accepted:</span>
                <span className="font-medium text-green-600">{stats.accepted}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tasks Deferred:</span>
                <span className="font-medium text-amber-600">{stats.deferred}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tasks Rejected:</span>
                <span className="font-medium text-red-600">{stats.rejected}</span>
              </div>
            </div>
            <div className="pt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="w-4 h-4 text-indigo-500" />
                <span>Chief of Staff is processing overnight tasks</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4 text-indigo-500" />
                <span>Signal briefing will be ready by 7:00 AM</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground pt-4">
              Rest well. Your morning Signal will include updates on all processed tasks.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full bg-background text-foreground overflow-auto pb-24">
      {/* Header with Countdown */}
      <div className="border-b border-border bg-gradient-to-r from-indigo-500/10 to-purple-500/10 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30">
                <Moon className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Evening Review</h1>
                <p className="text-sm text-muted-foreground">{formatDate()}</p>
              </div>
            </div>
            
            {/* Countdown Timer */}
            <div className="text-right">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${getReviewStateColor()}`}>
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">{timeUntilCutoff}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{getReviewStateText()}</p>
            </div>
          </div>
          
          {/* Stats Bar */}
          <div className="flex items-center gap-2 mt-3">
            <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">
              {stats.accepted} Accepted
            </Badge>
            <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
              {stats.deferred} Deferred
            </Badge>
            <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50">
              {stats.rejected} Rejected
            </Badge>
            <Badge variant="outline" className="text-foreground/50 border-gray-300 bg-gray-50">
              {stats.pending} Pending
            </Badge>
          </div>
        </div>
      </div>

      {/* Warning Banner for Cutoff */}
      {reviewState === 'cutoff_warning' && (
        <div className="bg-amber-500 text-white px-4 py-2">
          <div className="max-w-4xl mx-auto flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Less than 15 minutes until 8 PM cutoff!</span>
            <span className="text-amber-100">Chief of Staff will auto-process remaining tasks.</span>
          </div>
        </div>
      )}

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
            const projectStats = {
              total: project.tasks.length,
              accepted: project.tasks.filter(t => getTaskStatus(t.id) === 'accepted').length,
              pending: project.tasks.filter(t => getTaskStatus(t.id) === 'pending').length,
            };
            
            return (
              <Card key={project.projectId} className="border overflow-hidden">
                {/* Project Header */}
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleProject(project.projectId)}
                  style={{ borderLeft: `4px solid ${project.projectColor}` }}
                >
                  <div className="flex items-center gap-3">
                    <Folder className="w-5 h-5" style={{ color: project.projectColor }} />
                    <div>
                      <h3 className="font-semibold text-foreground">{project.projectName}</h3>
                      <p className="text-xs text-muted-foreground">
                        {projectStats.accepted}/{projectStats.total} accepted • {projectStats.pending} pending
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {projectStats.pending > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          acceptAll(project.projectId);
                        }}
                        className="text-xs"
                      >
                        Accept All
                      </Button>
                    )}
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
                
                {/* Tasks */}
                {isExpanded && (
                  <div className="border-t divide-y">
                    {project.tasks.map((task) => {
                      const status = getTaskStatus(task.id);
                      return (
                        <div 
                          key={task.id}
                          className={`p-4 flex items-center justify-between gap-4 ${
                            status === 'accepted' ? 'bg-green-50/50' :
                            status === 'rejected' ? 'bg-red-50/50' :
                            status === 'deferred' ? 'bg-amber-50/50' : ''
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${status !== 'pending' ? 'line-through opacity-60' : 'text-foreground'}`}>
                              {task.text}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
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
                              className={`h-8 w-8 p-0 ${status === 'accepted' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                              onClick={() => setTaskStatus(task.id, 'accepted')}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={status === 'deferred' ? 'default' : 'outline'}
                              className={`h-8 px-2 text-xs ${status === 'deferred' ? 'bg-amber-600 hover:bg-amber-700' : ''}`}
                              onClick={() => setTaskStatus(task.id, 'deferred')}
                            >
                              Defer
                            </Button>
                            <Button
                              size="sm"
                              variant={status === 'rejected' ? 'default' : 'outline'}
                              className={`h-8 w-8 p-0 ${status === 'rejected' ? 'bg-red-600 hover:bg-red-700' : ''}`}
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
        <Card className="border">
          <CardHeader 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => setShowReflection(!showReflection)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                Daily Reflection (Optional)
              </CardTitle>
              {showReflection ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </CardHeader>
          
          {showReflection && (
            <CardContent className="space-y-4">
              {/* What Went Well */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-green-700">What went well today?</label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={toggleRecordingWentWell}
                    className={isRecordingWentWell ? 'text-red-600' : 'text-muted-foreground'}
                  >
                    {isRecordingWentWell ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                </div>
                <Textarea
                  value={wentWellText}
                  onChange={(e) => setWentWellText(e.target.value)}
                  placeholder="Wins, achievements, positive moments..."
                  className="bg-green-50/50 border-green-200 min-h-[80px]"
                />
              </div>
              
              {/* What Didn't Go Well */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-amber-700">What didn't go well?</label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={toggleRecordingDidntGo}
                    className={isRecordingDidntGo ? 'text-red-600' : 'text-muted-foreground'}
                  >
                    {isRecordingDidntGo ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                </div>
                <Textarea
                  value={didntGoText}
                  onChange={(e) => setDidntGoText(e.target.value)}
                  placeholder="Challenges, blockers, lessons learned..."
                  className="bg-amber-50/50 border-amber-200 min-h-[80px]"
                />
              </div>
              
              {/* Mood Score */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-indigo-700">Today's mood score</label>
                  <span className="text-2xl font-bold text-indigo-600">{currentMood[0]}/100</span>
                </div>
                <Slider
                  value={currentMood}
                  onValueChange={setCurrentMood}
                  min={0}
                  max={100}
                  step={5}
                  className="py-2"
                />
              </div>
            </CardContent>
          )}
        </Card>

        {/* Strategic Focus Module */}
        <Card className="border border-fuchsia-200 bg-fuchsia-50/30">
          <CardHeader 
            className="cursor-pointer hover:bg-fuchsia-100/50 transition-colors"
            onClick={() => setShowStrategicFocus(!showStrategicFocus)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-fuchsia-600" />
                Strategic Focus (Weekly Review)
              </CardTitle>
              {showStrategicFocus ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </CardHeader>
          
          {showStrategicFocus && (
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Take a moment to reflect on your strategic priorities. What should change?
              </p>
              
              {/* What should I stop doing? */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-red-700 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  What should I STOP doing?
                </label>
                <Textarea
                  value={stopDoing}
                  onChange={(e) => setStopDoing(e.target.value)}
                  placeholder="Activities that drain energy without results, low-value tasks, distractions..."
                  className="bg-red-50/50 border-red-200 min-h-[80px]"
                />
              </div>
              
              {/* What should I delegate? */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-amber-700 flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  What should I DELEGATE?
                </label>
                <Textarea
                  value={delegateTo}
                  onChange={(e) => setDelegateTo(e.target.value)}
                  placeholder="Tasks others can do, things that don't require your unique skills..."
                  className="bg-amber-50/50 border-amber-200 min-h-[80px]"
                />
              </div>
              
              {/* What deserves more focus? */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-green-700 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  What deserves MORE focus?
                </label>
                <Textarea
                  value={focusMore}
                  onChange={(e) => setFocusMore(e.target.value)}
                  placeholder="High-impact activities, strategic priorities, things only you can do..."
                  className="bg-green-50/50 border-green-200 min-h-[80px]"
                />
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Your responses will be saved and reviewed by Chief of Staff
                </p>
                <Button 
                  size="sm" 
                  className="bg-fuchsia-600 hover:bg-fuchsia-700"
                  onClick={() => {
                    toast.success("Strategic focus saved! Chief of Staff will follow up.");
                    setShowStrategicFocus(false);
                  }}
                >
                  Save Focus Areas
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Ready to Start Button */}
        <div className="sticky bottom-4">
          <Button
            onClick={handleReadyToStart}
            disabled={!allDecided}
            className={`w-full h-14 text-lg font-semibold ${
              allDecided 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' 
                : 'bg-gray-300'
            }`}
          >
            {allDecided ? (
              <>
                <Play className="w-5 h-5 mr-2" />
                Ready to Start Overnight Tasks
              </>
            ) : (
              <>
                <Clock className="w-5 h-5 mr-2" />
                {stats.pending} tasks still pending review
              </>
            )}
          </Button>
          {!allDecided && (
            <p className="text-xs text-center text-muted-foreground mt-2">
              Review all tasks to enable overnight processing
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
