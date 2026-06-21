import { useState, useRef, useEffect } from "react";
import { useSearch } from "wouter";
import { 
  Fingerprint, Mic, MicOff, Send,
  Sparkles, Activity, Trash2, Paperclip, Link2, Check, X, FileAudio, GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { LearningPanel, LearningToast, useLearningNotifications } from "@/components/LearningIndicator";
import { ActivityLog } from "@/components/ActivityLog";
import { ProgressBar, CircularProgress, DigitalTwinTrainingProgress } from "@/components/ProgressIndicator";
import { ConversationSwitcher } from "@/components/ConversationSwitcher";
import { DigitalTwinAccelerator } from "@/components/DigitalTwinAccelerator";
import { BusinessGuardian } from "@/components/BusinessGuardian";
import { DigitalTwinDevelopment } from "@/components/DigitalTwinDevelopment";
import { BusinessPlanReview } from "@/components/BusinessPlanReview";
import { useDigitalTwinChat } from "@/hooks/useDigitalTwinChat";
import { useVoiceInput } from "@/hooks/useVoiceInput";

export default function DigitalTwin() {
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const initialMessage = searchParams.get('message');
  
  const [messageInput, setMessageInput] = useState(initialMessage || "");
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [rightPanelTab, setRightPanelTab] = useState<'learning' | 'activity' | 'training' | 'guardian' | 'growth' | 'review'>('training');
  const [showBusinessPlanReview, setShowBusinessPlanReview] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState('current');
  
  // Mock conversation history for ConversationSwitcher
  const mockConversations = [
    { id: 'current', title: 'Current Session', lastMessage: 'How can I help you today?', timestamp: new Date(), starred: true },
    { id: 'conv-1', title: 'Project Planning', lastMessage: 'Let me break down the timeline...', timestamp: new Date(Date.now() - 3600000) },
    { id: 'conv-2', title: 'Email Drafts', lastMessage: 'Here\'s the revised version...', timestamp: new Date(Date.now() - 86400000), starred: true },
    { id: 'conv-3', title: 'Meeting Prep', lastMessage: 'Key points to cover...', timestamp: new Date(Date.now() - 172800000) },
  ];
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Chief of Staff chat hook with real API
  const { messages, isTyping, sendMessage, clearHistory, isLoading } = useDigitalTwinChat();
  
  // Voice input hook
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    isSupported: voiceSupported,
    error: voiceError 
  } = useVoiceInput({
    onResult: (text) => {
      setMessageInput(prev => prev + text);
    },
    continuous: false,
  });
  
  // Learning notifications
  const { notifications, currentToast, addLearning, dismissToast } = useLearningNotifications();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Process initial message from URL
  useEffect(() => {
    if (initialMessage) {
      window.history.replaceState({}, '', '/digital-twin');
      inputRef.current?.focus();
    }
  }, [initialMessage]);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  // Toggle voice recording
  const toggleRecording = () => {
    if (isListening) {
      stopListening();
    } else {
      if (!voiceSupported) {
        toast.error("Voice input is not supported in your browser");
        return;
      }
      startListening();
      toast.info("Listening... speak to your Chief of Staff");
    }
  };

  // Send text message
  const handleSendMessage = () => {
    if (!messageInput.trim() || isLoading) return;
    
    sendMessage(messageInput);
    setMessageInput("");
    
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
    
    // Add learning notification for patterns
    if (messageInput.toLowerCase().includes('priority') || messageInput.toLowerCase().includes('urgent')) {
      addLearning({
        type: 'pattern',
        message: 'Noted: This topic is high priority for you',
      });
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Quick action buttons
  const quickActions = [
    { label: "Show The Signal", action: () => toast.info("Opening The Signal...") },
    { label: "Check pending items", action: () => toast.info("5 items pending your review") },
    { label: "Review Business Plan", action: () => setShowBusinessPlanReview(true) },
    { label: "View activity log", action: () => { setShowRightPanel(true); setRightPanelTab('activity'); } },
  ];

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row bg-background">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header - Compact */}
        <div className="shrink-0 border-b border-white/10 bg-card/80 backdrop-blur-xl px-3 sm:px-4 py-2 sm:py-3">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                  <Fingerprint className="w-5 h-5 text-purple-400" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-semibold text-foreground">Chief of Staff</h1>
                <p className="text-xs text-muted-foreground">Online • AI-Powered • Learning from you</p>
              </div>
              {/* Conversation Switcher */}
              <div className="hidden md:block ml-4">
                <ConversationSwitcher
                  conversations={mockConversations}
                  currentConversationId={currentConversationId}
                  onSelect={(id) => {
                    setCurrentConversationId(id);
                    toast.info(`Switched to: ${mockConversations.find(c => c.id === id)?.title}`);
                  }}
                  onNewConversation={() => {
                    clearHistory();
                    setCurrentConversationId('new-' + Date.now());
                    toast.success('Started new conversation');
                  }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Training Button */}
              <button
                onClick={() => { setShowRightPanel(true); setRightPanelTab('training'); }}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-colors"
              >
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-emerald-400 font-medium">Training</span>
              </button>
              {/* Training Progress Mini Badge */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20">
                <CircularProgress value={25} max={100} size={24} strokeWidth={3} showValue={false} />
                <span className="text-xs text-muted-foreground">12.5h trained</span>
              </div>
              <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">
                <Sparkles className="w-3 h-3 mr-1" />
                {messages.length} messages
              </Badge>
              <button
                onClick={() => {
                  if (confirm('Clear all conversation history?')) {
                    clearHistory();
                    toast.success('Conversation cleared');
                  }
                }}
                className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                title="Clear history"
              >
                <Trash2 className="w-4 h-4 text-muted-foreground" />
              </button>
              <button
                onClick={() => setShowRightPanel(!showRightPanel)}
                className="p-2 rounded-lg hover:bg-secondary/50 transition-colors hidden md:flex"
              >
                <Activity className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.from === "user" ? "justify-end" : ""}`}>
                {/* Avatar - only for assistant */}
                {msg.from === "twin" && (
                  <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-primary/20 border border-primary/30">
                    <Fingerprint className="w-3.5 h-3.5 text-primary" />
                  </div>
                )}
                
                {/* Message */}
                <div className={`max-w-[80%] ${msg.from === "user" ? "" : ""}`}>
                  <div className={`px-4 py-2.5 rounded-2xl ${
                    msg.from === "twin" 
                      ? "bg-card/40 border border-white/5" 
                      : "bg-primary/15 border border-primary/20"
                  }`}>
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed"
                       dangerouslySetInnerHTML={{ 
                         __html: msg.message
                           .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-medium">$1</strong>')
                           .replace(/\n/g, '<br/>')
                       }} 
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground/60 mt-1 px-2">{msg.time}</p>
                </div>
              </div>
            ))}
            
            {/* Enhanced Typing/Thinking indicator */}
            {isTyping && (
              <div className="flex gap-3 items-start">
                <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-primary/30 to-fuchsia-500/30 border border-primary/40 animate-pulse">
                  <Fingerprint className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-card/60 border border-primary/20 rounded-2xl px-4 py-3 shadow-lg shadow-primary/5">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-muted-foreground animate-pulse">Chief of Staff is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="shrink-0 border-t border-white/5 bg-card/30 px-4 py-2">
          <div className="max-w-3xl mx-auto flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={action.action}
                className="shrink-0 px-3 py-1.5 text-xs font-medium text-muted-foreground bg-secondary/50 hover:bg-secondary rounded-full transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area - Fixed at bottom - Manus style */}
        <div className="shrink-0 border-t border-white/10 bg-card/90 backdrop-blur-xl px-4 py-3">
          <div className="max-w-3xl mx-auto">
            {/* Input container */}
            <div className="bg-secondary/30 border border-white/10 rounded-2xl overflow-hidden">
              {/* Typing indicator */}
              {isTyping && (
                <div className="px-4 py-2 border-b border-white/5 flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-muted-foreground">Chief of Staff is thinking...</span>
                </div>
              )}
              {/* Text input - increased height for better UX */}
              <textarea
                ref={inputRef}
                value={messageInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Message Chief of Staff..."
                rows={2}
                className="w-full px-4 py-4 bg-transparent resize-none focus:outline-none text-sm placeholder:text-muted-foreground/60"
                style={{ minHeight: '60px', maxHeight: '120px' }}
              />
              
              {/* Action bar */}
              <div className="flex items-center justify-between px-3 py-2 border-t border-white/5">
                {/* Left actions */}
                <div className="flex items-center gap-1">
                  <button
                    className="p-2 rounded-lg text-primary/70 hover:text-primary hover:bg-primary/10 transition-colors"
                    title="Add files"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 rounded-lg text-primary/70 hover:text-primary hover:bg-primary/10 transition-colors"
                    title="Connect apps"
                  >
                    <Link2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={toggleRecording}
                    className={`p-3 rounded-xl transition-all ${
                      isListening 
                        ? "text-red-400 bg-red-500/20 animate-pulse scale-110" 
                        : "text-primary hover:text-primary hover:bg-primary/20 hover:scale-105"
                    }`}
                    title={isListening ? "Stop recording" : "Voice input"}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                  <button
                    className="p-2 rounded-lg text-primary/70 hover:text-primary hover:bg-primary/10 transition-colors"
                    title="Transcribe audio"
                  >
                    <FileAudio className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Right actions */}
                <div className="flex items-center gap-1">
                  {messageInput.trim() && (
                    <button
                      onClick={() => setMessageInput('')}
                      className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Clear"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || isLoading}
                    className="p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Send"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Voice status */}
            {isListening && (
              <div className="mt-2 flex items-center gap-2 text-xs text-red-400">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Listening... {transcript && `"${transcript}"`}
              </div>
            )}
            
            {voiceError && (
              <p className="mt-2 text-xs text-red-400">{voiceError}</p>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Learning & Activity */}
      {showRightPanel && (
        <div className="w-80 border-l border-white/10 bg-card/50 hidden md:flex flex-col">
          {/* Panel Header */}
          <div className="px-4 py-3 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-400" />
                <h3 className="font-semibold text-foreground">Training Center</h3>
              </div>
              <button
                onClick={() => setShowRightPanel(false)}
                className="p-1 rounded hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
          {/* Panel Tabs */}
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setRightPanelTab('learning')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                rightPanelTab === 'learning' 
                  ? 'text-purple-400 border-b-2 border-purple-400' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Learning
            </button>
            <button
              onClick={() => setRightPanelTab('activity')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                rightPanelTab === 'activity' 
                  ? 'text-purple-400 border-b-2 border-purple-400' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Activity
            </button>
            <button
              onClick={() => setRightPanelTab('training')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                rightPanelTab === 'training' 
                  ? 'text-purple-400 border-b-2 border-purple-400 flex items-center justify-center gap-2' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Train
            </button>
            <button
              onClick={() => setRightPanelTab('guardian')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                rightPanelTab === 'guardian' 
                  ? 'text-fuchsia-400 border-b-2 border-fuchsia-400 flex items-center justify-center gap-2' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Guardian
            </button>
            <button
              onClick={() => setRightPanelTab('growth')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                rightPanelTab === 'growth' 
                  ? 'text-emerald-400 border-b-2 border-emerald-400' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Growth
            </button>
          </div>
          
          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {rightPanelTab === 'learning' && (
              <LearningPanel learningItems={notifications} />
            )}
            {rightPanelTab === 'activity' && (
              <ActivityLog />
            )}
            {rightPanelTab === 'training' && (
              <div className="space-y-4">
                <button
                  onClick={() => setShowTrainingModal(true)}
                  className="w-full p-4 bg-gradient-to-br from-purple-600/30 to-pink-600/30 border-2 border-purple-500/50 rounded-xl text-left hover:border-purple-400 hover:from-purple-600/40 hover:to-pink-600/40 transition-all shadow-lg shadow-purple-500/10"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-purple-300" />
                    <h4 className="font-semibold text-white">Training Accelerator</h4>
                  </div>
                  <p className="text-sm text-purple-200">Speed up your Chief of Staff's learning</p>
                </button>
                <DigitalTwinTrainingProgress 
                  hoursLogged={127}
                  conversationsCount={45}
                  feedbackCount={23}
                  accuracyScore={78}
                />
              </div>
            )}
            {rightPanelTab === 'guardian' && (
              <BusinessGuardian />
            )}
            {rightPanelTab === 'growth' && (
              <DigitalTwinDevelopment />
            )}
          </div>
        </div>
      )}

      {/* Learning Toast */}
      {currentToast && (
        <LearningToast message={currentToast.message} type={currentToast.type} onClose={dismissToast} />
      )}

      {/* Training Accelerator Modal */}
      {showTrainingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
            <div className="relative">
              <button
                onClick={() => setShowTrainingModal(false)}
                className="absolute top-4 right-4 z-10 p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
              >
                <span className="text-xl text-muted-foreground">×</span>
              </button>
              <DigitalTwinAccelerator onComplete={() => setShowTrainingModal(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Business Plan Review Modal */}
      {showBusinessPlanReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-5xl h-[90vh] m-4 bg-card rounded-xl border border-white/10 overflow-hidden">
            <div className="relative h-full">
              <button
                onClick={() => setShowBusinessPlanReview(false)}
                className="absolute top-4 right-4 z-10 p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
              >
                <span className="text-xl text-muted-foreground">×</span>
              </button>
              <BusinessPlanReview 
                projectName="Current Business Plan"
                onComplete={(reviews) => {
                  toast.success('Business plan review complete!');
                  console.log('Reviews:', reviews);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
