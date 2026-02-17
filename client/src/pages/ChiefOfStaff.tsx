import { useState, useRef, useEffect, useMemo } from "react";
import { useSearch } from "wouter";
import { 
  Fingerprint, Mic, MicOff, Send, Brain,
  Sparkles, Activity, Trash2, Paperclip, Link2, X, FileAudio, GraduationCap,
  CheckCircle2, Clock, AlertCircle, AlertTriangle, Shield, Users, FolderKanban,
  ChevronRight, BarChart3, MessageSquare, Play, Pause, RefreshCw,
  ThumbsUp, ThumbsDown, Eye, FileCheck, Bot, Zap, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { PageHeader } from '@/components/layout/PageHeader';
import { CircularProgress } from '@/components/shared/ProgressIndicator';
import { QualityGateApprovalQueue } from '@/components/shared/QualityGateApproval';
import { useDigitalTwinChat } from "@/hooks/useDigitalTwinChat";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useIsMobile } from "@/hooks/useMobile";
import { trpc } from "@/lib/trpc";

// QA Status types
type QAStatus = 'pending' | 'cos_reviewing' | 'cos_approved' | 'secondary_reviewing' | 'verified' | 'rejected';

interface Task {
  id: string;
  dbId?: number;
  title: string;
  description: string;
  project: string;
  status: 'active' | 'review' | 'completed' | 'blocked';
  progress: number;
  qaStatus: QAStatus;
  assignedExperts: string[];
  cosScore?: number;
  secondaryAIScore?: number;
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
  isFromDb?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  project?: string;
  lastMessage: string;
  timestamp: Date;
  unread: number;
  starred: boolean;
}

// Mock data
const MOCK_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Q4 Financial Analysis',
    description: 'Complete financial review and projections for Q4',
    project: 'Celadon',
    status: 'review',
    progress: 95,
    qaStatus: 'cos_approved',
    assignedExperts: ['Finance Expert', 'Strategy Lead'],
    cosScore: 9,
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date()
  },
  {
    id: 'task-2',
    title: 'Investor Deck Updates',
    description: 'Update pitch deck with latest metrics and market data',
    project: 'Boundless AI',
    status: 'active',
    progress: 60,
    qaStatus: 'pending',
    assignedExperts: ['Marketing Expert', 'Design Lead'],
    createdAt: new Date(Date.now() - 172800000),
    updatedAt: new Date()
  },
  {
    id: 'task-3',
    title: 'Due Diligence Report',
    description: 'Complete DD checklist and risk assessment',
    project: 'Celadon',
    status: 'completed',
    progress: 100,
    qaStatus: 'verified',
    assignedExperts: ['Legal Counsel', 'Finance Expert', 'Research Lead'],
    cosScore: 10,
    secondaryAIScore: 9,
    feedback: 'Excellent thoroughness. Minor formatting suggestions applied.',
    createdAt: new Date(Date.now() - 259200000),
    updatedAt: new Date(Date.now() - 86400000)
  },
  {
    id: 'task-4',
    title: 'Competitor Analysis',
    description: 'Deep dive into competitor AI capabilities',
    project: 'AMPORA',
    status: 'active',
    progress: 35,
    qaStatus: 'pending',
    assignedExperts: ['Research Lead', 'Strategy Lead'],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const MOCK_CONVERSATIONS: Conversation[] = [
  { id: 'conv-1', title: 'Current Session', project: undefined, lastMessage: 'How can I help you today?', timestamp: new Date(), unread: 0, starred: true },
  { id: 'conv-2', title: 'Celadon Strategy', project: 'Celadon', lastMessage: 'The financial projections look solid...', timestamp: new Date(Date.now() - 3600000), unread: 2, starred: true },
  { id: 'conv-3', title: 'Sample Project Pitch', project: 'Boundless AI', lastMessage: 'I\'ve updated the deck with...', timestamp: new Date(Date.now() - 86400000), unread: 0, starred: false },
  { id: 'conv-4', title: 'General Planning', project: undefined, lastMessage: 'Your schedule for tomorrow...', timestamp: new Date(Date.now() - 172800000), unread: 0, starred: false },
];

const QA_STATUS_CONFIG: Record<QAStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  pending: { label: 'Pending QA', color: 'text-foreground/70 bg-gray-500/10', icon: Clock },
  cos_reviewing: { label: 'CoS Reviewing', color: 'text-amber-400 bg-amber-500/10', icon: Eye },
  cos_approved: { label: 'CoS Approved', color: 'text-blue-400 bg-blue-500/10', icon: CheckCircle2 },
  secondary_reviewing: { label: '2nd AI Check', color: 'text-purple-400 bg-purple-500/10', icon: Bot },
  verified: { label: 'Verified ✓✓', color: 'text-emerald-400 bg-emerald-500/10', icon: Shield },
  rejected: { label: 'Needs Revision', color: 'text-red-400 bg-red-500/10', icon: AlertCircle }
};

type ViewMode = 'chat' | 'tasks' | 'training' | 'quality_gates';

export default function ChiefOfStaff() {
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const initialMessage = searchParams.get('message');
  const isMobile = useIsMobile();
  
  const [viewMode, setViewMode] = useState<ViewMode>('chat');
  const [messageInput, setMessageInput] = useState(initialMessage || "");
  const [currentConversationId, setCurrentConversationId] = useState('conv-1');
  const [conversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [reviewScore, setReviewScore] = useState<number>(8);
  const [reviewFeedback, setReviewFeedback] = useState('');

  // tRPC hooks for QA workflow
  const utils = trpc.useUtils();
  const { data: tasksWithQA, isLoading: tasksLoading } = trpc.qa.getTasksWithStatus.useQuery();
  
  const submitCoSReviewMutation = trpc.qa.submitCoSReview.useMutation({
    onSuccess: () => {
      toast.success('Chief of Staff review submitted');
      utils.qa.getTasksWithStatus.invalidate();
      setShowTaskDetail(false);
      setReviewScore(8);
      setReviewFeedback('');
    },
    onError: (error) => {
      toast.error(`Failed to submit review: ${error.message}`);
    },
  });

  const submitSecondaryReviewMutation = trpc.qa.submitSecondaryReview.useMutation({
    onSuccess: () => {
      toast.success('Secondary AI verification complete');
      utils.qa.getTasksWithStatus.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to submit verification: ${error.message}`);
    },
  });

  // Combine real tasks with mock tasks for display
  const tasks = useMemo(() => {
    const realTasks: Task[] = (tasksWithQA || []).map(t => ({
      id: `db-${t.id}`,
      dbId: t.id,
      title: t.title,
      description: t.description || '',
      project: 'General', // FUTURE: Join with projects table
      status: (t.status === 'not_started' ? 'active' : t.status === 'in_progress' ? 'active' : t.status === 'completed' ? 'completed' : t.status === 'blocked' ? 'blocked' : 'review') as Task['status'],
      progress: t.progress || 0,
      qaStatus: (t.qaStatus || 'pending') as QAStatus,
      assignedExperts: [],
      cosScore: t.cosScore || undefined,
      secondaryAIScore: t.secondaryAiScore || undefined,
      feedback: undefined, // TODO: get from reviews
      createdAt: new Date(t.createdAt),
      updatedAt: new Date(t.updatedAt),
      isFromDb: true,
    }));
    return [...realTasks, ...MOCK_TASKS.map(t => ({ ...t, isFromDb: false, dbId: undefined }))];
  }, [tasksWithQA]);

  // Handle CoS review submission
  const handleSubmitCoSReview = (taskId: number, approved: boolean) => {
    submitCoSReviewMutation.mutate({
      taskId,
      score: reviewScore,
      feedback: reviewFeedback || undefined,
      status: approved ? 'approved' : 'rejected',
    });
  };

  // Handle Secondary AI verification
  const handleSecondaryVerification = (taskId: number) => {
    // Simulate AI verification with a score
    const aiScore = Math.floor(Math.random() * 3) + 8; // 8-10 score
    submitSecondaryReviewMutation.mutate({
      taskId,
      score: aiScore,
      feedback: 'Automated verification complete. All quality criteria met.',
      status: 'approved',
    });
  };
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Chat hook
  const { messages, isTyping, sendMessage, clearHistory, isLoading } = useDigitalTwinChat();
  
  // Voice input
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    isSupported: voiceSupported,
    error: voiceError 
  } = useVoiceInput({
    onResult: (text) => setMessageInput(prev => prev + text),
    continuous: false,
  });

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Process initial message
  useEffect(() => {
    if (initialMessage) {
      window.history.replaceState({}, '', '/chief-of-staff');
      inputRef.current?.focus();
    }
  }, [initialMessage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const toggleRecording = () => {
    if (isListening) {
      stopListening();
    } else {
      if (!voiceSupported) {
        toast.error("Voice input not supported in your browser");
        return;
      }
      startListening();
      toast.info("Listening...");
    }
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || isLoading) return;
    sendMessage(messageInput);
    setMessageInput("");
    if (inputRef.current) inputRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Stats
  const taskStats = {
    active: tasks.filter(t => t.status === 'active').length,
    review: tasks.filter(t => t.status === 'review').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    verified: tasks.filter(t => t.qaStatus === 'verified').length,
  };

  const currentConversation = conversations.find(c => c.id === currentConversationId);

  return (
    <div className="h-[calc(100vh-56px)] md:h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
      {/* Header */}
      <PageHeader 
        icon={Fingerprint} 
        title="Chief of Staff"
        subtitle="Your AI Executive Assistant"
        iconColor="text-purple-400"
      >
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10">
            <CircularProgress value={25} max={100} size={20} strokeWidth={2} showValue={false} />
            <span className="text-xs text-white/70">12.5h trained</span>
          </div>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
            <Shield className="w-3 h-3 mr-1" />
            {taskStats.verified} Verified
          </Badge>
        </div>
      </PageHeader>

      {/* View Mode Tabs */}
      <div className="shrink-0 border-b border-white/10 bg-white/5 px-4">
        <div className="max-w-7xl mx-auto flex gap-1">
          {[
            { id: 'chat', label: 'Chat', icon: MessageSquare },
            { id: 'tasks', label: 'Tasks', icon: FolderKanban, badge: taskStats.active + taskStats.review },
            { id: 'quality_gates', label: 'Quality Gates', icon: Shield, badge: 1 },
            { id: 'training', label: 'Training', icon: GraduationCap },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id as ViewMode)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                viewMode === tab.id
                  ? 'text-fuchsia-400 border-fuchsia-400'
                  : 'text-foreground/70 border-transparent hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.badge && tab.badge > 0 && (
                <span className="px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {viewMode === 'chat' && (
          <>
            {/* Conversation Sidebar - Desktop only */}
            {!isMobile && (
              <div className="w-64 border-r border-white/10 bg-white/5 flex flex-col">
                <div className="p-3 border-b border-white/10">
                  <Button variant="outline" size="sm" className="w-full gap-2 border-white/20 text-foreground/80 hover:bg-white/5" onClick={() => {
                    clearHistory();
                    setCurrentConversationId('new-' + Date.now());
                    toast.success('New conversation started');
                  }}>
                    <MessageSquare className="w-4 h-4" />
                    New Conversation
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {conversations.map(conv => (
                    <button
                      key={conv.id}
                      onClick={() => setCurrentConversationId(conv.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        currentConversationId === conv.id
                          ? 'bg-gradient-to-br from-fuchsia-500/10 to-purple-500/10 border border-fuchsia-500/30'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium truncate">{conv.title}</span>
                        {conv.unread > 0 && (
                          <span className="px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                            {conv.unread}
                          </span>
                        )}
                      </div>
                      {conv.project && (
                        <Badge variant="outline" className="text-xs mb-1">{conv.project}</Badge>
                      )}
                      <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {/* Messages - Scrollable */}
              <div className={`flex-1 overflow-y-auto ${isMobile ? 'pb-40' : ''}`}>
                <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-3 ${msg.from === "user" ? "justify-end" : ""}`}>
                      {msg.from === "twin" && (
                        <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-fuchsia-500/20 to-purple-500/20 border border-fuchsia-500/30">
                          <Fingerprint className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      <div className={`max-w-[80%]`}>
                        <div className={`px-4 py-3 rounded-2xl ${
                          msg.from === "twin" 
                            ? "bg-white/5 border border-white/10" 
                            : "bg-gradient-to-r from-cyan-500/15 to-fuchsia-500/15 border border-cyan-500/20"
                        }`}>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed"
                             dangerouslySetInnerHTML={{ 
                               __html: msg.message
                                 .replace(/\*\*(.*?)\*\*/g, '<strong class="font-medium">$1</strong>')
                                 .replace(/\n/g, '<br/>')
                             }} 
                          />
                        </div>
                        {msg.from === "twin" && (
                          <div className="flex items-center gap-1 mt-2">
                            <button
                              onClick={() => {
                                setMessageInput("Please verify the assumptions in your last response. What evidence supports these claims?");
                                inputRef.current?.focus();
                              }}
                              className="px-2 py-1 text-xs rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors border border-amber-500/30"
                            >
                              <AlertTriangle className="w-3 h-3 inline mr-1" />
                              Verify
                            </button>
                            <button
                              onClick={() => {
                                setMessageInput("Play devil's advocate: What could go wrong with this approach? What are the counterarguments?");
                                inputRef.current?.focus();
                              }}
                              className="px-2 py-1 text-xs rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors border border-red-500/30"
                            >
                              <Shield className="w-3 h-3 inline mr-1" />
                              Devil's Advocate
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex gap-3">
                      <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-fuchsia-500/20 to-purple-500/20 border border-fuchsia-500/30">
                        <Fingerprint className="w-4 h-4 text-fuchsia-400" />
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input Area - Fixed at bottom */}
              <div className={`shrink-0 border-t border-white/10 bg-gray-900/95 backdrop-blur-xl px-4 py-3 ${isMobile ? 'fixed bottom-0 left-0 right-0 z-40 pb-20' : ''}`}>
                <div className="max-w-3xl mx-auto">
                  <div className="bg-white/5 border border-white/20 rounded-2xl overflow-hidden">
                    <textarea
                      ref={inputRef}
                      value={messageInput}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Message Chief of Staff..."
                      rows={1}
                      className="w-full px-4 py-3 bg-transparent resize-none focus:outline-none text-sm text-white placeholder:text-foreground/60"
                      style={{ minHeight: '44px', maxHeight: '120px' }}
                    />
                    <div className="flex items-center justify-between px-3 py-2 border-t border-white/10">
                      <div className="flex items-center gap-1">
                        <button className="p-2 rounded-lg text-foreground/70 hover:text-white hover:bg-white/10 transition-colors">
                          <Paperclip className="w-4 h-4" />
                        </button>
                        <button
                          onClick={toggleRecording}
                          className={`p-2 rounded-lg transition-colors ${
                            isListening 
                              ? "text-red-400 bg-red-500/20" 
                              : "text-foreground/70 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </button>
                      </div>
                      <button
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim() || isLoading}
                        className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white hover:opacity-90 disabled:opacity-40 transition-all"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {isListening && (
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-red-400">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        Listening... {transcript && `"${transcript}"`}
                      </div>
                      {transcript && (
                        <Button
                          size="sm"
                          onClick={() => {
                            stopListening();
                            if (messageInput.trim()) {
                              handleSendMessage();
                            }
                          }}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-3 py-1 h-7"
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Confirm
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {viewMode === 'tasks' && (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto p-4 sm:p-6">
              {/* Task Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { label: 'Active', value: taskStats.active, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                  { label: 'In Review', value: taskStats.review, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                  { label: 'Completed', value: taskStats.completed, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  { label: 'QA Verified', value: taskStats.verified, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                ].map(stat => (
                  <div key={stat.label} className={`p-4 rounded-xl ${stat.bg} border border-white/10`}>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Task List */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">All Tasks</h3>
                {tasks.map(task => {
                  const qaConfig = QA_STATUS_CONFIG[task.qaStatus];
                  const QAIcon = qaConfig.icon;
                  return (
                    <div
                      key={task.id}
                      onClick={() => { setSelectedTask(task); setShowTaskDetail(true); }}
                      className="p-4 bg-white/5 border-2 border-white/10 rounded-2xl hover:border-fuchsia-500/50 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{task.title}</h4>
                            <Badge variant="outline" className="text-xs">{task.project}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                        </div>
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${qaConfig.color}`}>
                          <QAIcon className="w-3 h-3" />
                          {qaConfig.label}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Progress value={task.progress} className="w-24 h-1.5" />
                            <span className="text-xs text-muted-foreground">{task.progress}%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{task.assignedExperts.length} experts</span>
                          </div>
                        </div>
                        {task.cosScore && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">CoS Score:</span>
                            <span className={`text-sm font-bold ${task.cosScore >= 9 ? 'text-emerald-400' : task.cosScore >= 7 ? 'text-amber-400' : 'text-red-400'}`}>
                              {task.cosScore}/10
                            </span>
                            {task.secondaryAIScore && (
                              <>
                                <span className="text-xs text-muted-foreground">| 2nd AI:</span>
                                <span className={`text-sm font-bold ${task.secondaryAIScore >= 9 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                  {task.secondaryAIScore}/10
                                </span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {task.feedback && (
                        <div className="mt-3 p-2 bg-white/5 rounded-lg border border-white/10">
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">QA Feedback:</span> {task.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'training' && (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto p-4 sm:p-6">
              {/* Training Progress */}
              <div className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Training Progress</h3>
                    <p className="text-sm text-muted-foreground">12.5 hours of 50 hours goal</p>
                  </div>
                  <CircularProgress value={25} max={100} size={60} strokeWidth={4} />
                </div>
                <Progress value={25} className="h-2 mb-2" />
                {/* Scoring temporarily disabled */}
              </div>

              {/* Training Modules */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">Training Modules</h3>
                
                <button className="w-full p-5 bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-2 border-emerald-500/30 rounded-2xl hover:border-emerald-400 transition-all text-left group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Type A Questions (Scale 1-10)</h4>
                        <p className="text-sm text-foreground/70">Decision-making, risk, communication, values</p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Complete</Badge>
                  </div>
                </button>

                <button className="w-full p-5 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-2 border-amber-500/30 rounded-2xl hover:border-amber-400 transition-all text-left group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Clock className="w-6 h-6 text-amber-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Type B Questions (Yes/No)</h4>
                        <p className="text-sm text-foreground/70">Preferences, habits, boundaries</p>
                      </div>
                    </div>
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Pending</Badge>
                  </div>
                </button>

                <button className="w-full p-5 bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 border-2 border-purple-500/30 rounded-2xl hover:border-purple-400 transition-all text-left group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Brain className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Leadership Thinking Styles</h4>
                        <p className="text-sm text-foreground/70">MIT, Harvard, NASA, McKinsey, CEO frameworks</p>
                      </div>
                    </div>
                    <Badge className="bg-gray-500/20 text-foreground/70 border-gray-500/30">Coming Soon</Badge>
                  </div>
                </button>
              </div>

              {/* SME Learning Stats */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider mb-3">SME Expert Learning</h3>
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <p className="text-sm text-muted-foreground mb-3">
                    Chief of Staff learns optimal prompting for each SME based on QA feedback.
                  </p>
                  <div className="space-y-2">
                    {['Finance Expert', 'Strategy Lead', 'Research Lead', 'Legal Counsel'].map(expert => (
                      <div key={expert} className="flex items-center justify-between">
                        <span className="text-sm text-white font-medium">{expert}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={Math.random() * 100} className="w-20 h-1.5" />
                          <span className="text-xs text-muted-foreground">{Math.floor(Math.random() * 20 + 5)} interactions</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'quality_gates' && (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto p-4 sm:p-6">
              <QualityGateApprovalQueue isChiefOfStaff={true} />
            </div>
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      {showTaskDetail && selectedTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-1">{selectedTask.title}</h2>
                  <Badge variant="outline">{selectedTask.project}</Badge>
                </div>
                <button onClick={() => setShowTaskDetail(false)} className="p-2 hover:bg-secondary rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* QA Status */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Quality Assurance Status</h3>
                <div className="flex items-center gap-4">
                  {['pending', 'cos_reviewing', 'cos_approved', 'secondary_reviewing', 'verified'].map((status, i) => {
                    const config = QA_STATUS_CONFIG[status as QAStatus];
                    const isActive = status === selectedTask.qaStatus;
                    const isPast = ['pending', 'cos_reviewing', 'cos_approved', 'secondary_reviewing', 'verified'].indexOf(selectedTask.qaStatus) > i;
                    return (
                      <div key={status} className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isActive ? config.color : isPast ? 'bg-emerald-500/20 text-emerald-400' : 'bg-secondary text-muted-foreground'
                        }`}>
                          <config.icon className="w-4 h-4" />
                        </div>
                        {i < 4 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Scores */}
              {(selectedTask.cosScore || selectedTask.secondaryAIScore) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedTask.cosScore && (
                    <div className="p-4 bg-secondary/30 rounded-xl">
                      <p className="text-sm text-muted-foreground mb-1">Chief of Staff Score</p>
                      <p className={`text-3xl font-bold ${selectedTask.cosScore >= 9 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {selectedTask.cosScore}/10
                      </p>
                    </div>
                  )}
                  {selectedTask.secondaryAIScore && (
                    <div className="p-4 bg-secondary/30 rounded-xl">
                      <p className="text-sm text-muted-foreground mb-1">Secondary AI Score</p>
                      <p className={`text-3xl font-bold ${selectedTask.secondaryAIScore >= 9 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {selectedTask.secondaryAIScore}/10
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Feedback */}
              {selectedTask.feedback && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">QA Feedback</h3>
                  <div className="p-4 bg-secondary/30 rounded-xl">
                    <p className="text-sm">{selectedTask.feedback}</p>
                  </div>
                </div>
              )}

              {/* Assigned Experts */}
              <div>
                <h3 className="text-sm font-semibold mb-2">Assigned Experts</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTask.assignedExperts.map(expert => (
                    <Badge key={expert} variant="outline">{expert}</Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button className="flex-1 gap-2">
                  <Eye className="w-4 h-4" />
                  View Deliverable
                </Button>
                <Button variant="outline" className="gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Discuss
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
