import { useState, useRef, useEffect } from "react";
import { useSearch } from "wouter";
import { 
  Fingerprint, Mic, MicOff, Send,
  Sparkles, Activity, Trash2
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
import { GettingStartedChecklist } from "@/components/GettingStartedChecklist";
import { useDigitalTwinChat } from "@/hooks/useDigitalTwinChat";
import { useVoiceInput } from "@/hooks/useVoiceInput";

export default function DigitalTwin() {
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const initialMessage = searchParams.get('message');
  
  const [messageInput, setMessageInput] = useState(initialMessage || "");
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [rightPanelTab, setRightPanelTab] = useState<'learning' | 'behaviour' | 'patterns' | 'activity' | 'training' | 'guardian' | 'setup'>('setup');
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
  
  // Digital Twin chat hook with real API
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
      toast.info("Listening... speak to your Digital Twin");
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
    { label: "Show Daily Brief", action: () => toast.info("Opening Daily Brief...") },
    { label: "Check pending items", action: () => toast.info("5 items pending your review") },
    { label: "Schedule training", action: () => toast.info("Training session scheduled for 2:30 PM") },
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
              <div key={msg.id} className={`flex gap-3 ${msg.from === "user" ? "flex-row-reverse" : ""}`}>
                {/* Avatar */}
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  msg.from === "twin" 
                    ? "bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-500/30" 
                    : "bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border border-cyan-500/30"
                }`}>
                  {msg.from === "twin" ? (
                    <Fingerprint className="w-4 h-4 text-purple-400" />
                  ) : (
                    <span className="text-xs font-medium text-cyan-400">You</span>
                  )}
                </div>
                
                {/* Message */}
                <div className={`flex-1 max-w-[90%] sm:max-w-[85%] ${msg.from === "user" ? "flex flex-col items-end" : ""}`}>
                  <div className={`inline-block px-4 py-3 rounded-2xl ${
                    msg.from === "twin" 
                      ? "bg-card/60 border border-white/10 rounded-tl-sm" 
                      : "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 rounded-tr-sm"
                  }`}>
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed"
                       dangerouslySetInnerHTML={{ 
                         __html: msg.message
                           .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
                           .replace(/\n/g, '<br/>')
                       }} 
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 px-1">{msg.time}</p>
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-3">
                <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-500/30">
                  <Fingerprint className="w-4 h-4 text-purple-400" />
                </div>
                <div className="bg-card/60 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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

        {/* Input Area - Fixed at bottom */}
        <div className="shrink-0 border-t border-white/10 bg-card/80 backdrop-blur-xl px-4 py-3">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2">
              {/* Voice button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleRecording}
                className={`shrink-0 rounded-full ${
                  isListening 
                    ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" 
                    : "hover:bg-secondary"
                }`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>
              
              {/* Text input */}
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={messageInput}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Message your Digital Twin..."
                  rows={1}
                  className="w-full px-4 py-3 pr-12 bg-secondary/50 border border-white/10 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm placeholder:text-muted-foreground"
                  style={{ maxHeight: '120px' }}
                />
                
                {/* Send button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || isLoading}
                  className="absolute right-2 bottom-1.5 rounded-full hover:bg-purple-500/20 disabled:opacity-50"
                >
                  <Send className="w-4 h-4 text-purple-400" />
                </Button>
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
          {/* Panel Tabs */}
          <div className="flex flex-wrap border-b border-white/10">
            <button
              onClick={() => setRightPanelTab('learning')}
              className={`flex-1 px-2 py-2 text-xs font-medium transition-colors ${
                rightPanelTab === 'learning' 
                  ? 'text-purple-400 border-b-2 border-purple-400' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Learning
            </button>
            <button
              onClick={() => setRightPanelTab('behaviour')}
              className={`flex-1 px-2 py-2 text-xs font-medium transition-colors ${
                rightPanelTab === 'behaviour' 
                  ? 'text-cyan-400 border-b-2 border-cyan-400' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Behaviour
            </button>
            <button
              onClick={() => setRightPanelTab('patterns')}
              className={`flex-1 px-2 py-2 text-xs font-medium transition-colors ${
                rightPanelTab === 'patterns' 
                  ? 'text-amber-400 border-b-2 border-amber-400' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Patterns
            </button>
            <button
              onClick={() => setRightPanelTab('activity')}
              className={`flex-1 px-2 py-2 text-xs font-medium transition-colors ${
                rightPanelTab === 'activity' 
                  ? 'text-purple-400 border-b-2 border-purple-400' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Activity
            </button>
            <button
              onClick={() => setRightPanelTab('training')}
              className={`flex-1 px-2 py-2 text-xs font-medium transition-colors ${
                rightPanelTab === 'training' 
                  ? 'text-purple-400 border-b-2 border-purple-400' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Train
            </button>
            <button
              onClick={() => setRightPanelTab('guardian')}
              className={`flex-1 px-2 py-2 text-xs font-medium transition-colors ${
                rightPanelTab === 'guardian' 
                  ? 'text-fuchsia-400 border-b-2 border-fuchsia-400' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Guardian
            </button>
            <button
              onClick={() => setRightPanelTab('setup')}
              className={`flex-1 px-2 py-2 text-xs font-medium transition-colors ${
                rightPanelTab === 'setup' 
                  ? 'text-green-400 border-b-2 border-green-400' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Setup
            </button>
          </div>
          
          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {rightPanelTab === 'learning' && (
              <LearningPanel learningItems={notifications} />
            )}
            {rightPanelTab === 'behaviour' && (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl">
                  <h4 className="font-medium text-foreground mb-2">Communication Style</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tone</span>
                      <span className="text-cyan-400">Professional, Direct</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Response Length</span>
                      <span className="text-cyan-400">Concise</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Formality</span>
                      <span className="text-cyan-400">Business Casual</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl">
                  <h4 className="font-medium text-foreground mb-2">Decision Making</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Risk Tolerance</span>
                      <span className="text-cyan-400">Moderate</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Speed vs Accuracy</span>
                      <span className="text-cyan-400">Balanced</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl">
                  <h4 className="font-medium text-foreground mb-2">Work Preferences</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Peak Hours</span>
                      <span className="text-cyan-400">9am - 12pm</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Focus Time</span>
                      <span className="text-cyan-400">Mornings</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {rightPanelTab === 'patterns' && (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl">
                  <h4 className="font-medium text-foreground mb-2">Detected Patterns</h4>
                  <div className="space-y-3">
                    <div className="p-2 bg-background/50 rounded-lg">
                      <p className="text-sm text-foreground">Email triage priority</p>
                      <p className="text-xs text-muted-foreground">Investor emails flagged as urgent</p>
                    </div>
                    <div className="p-2 bg-background/50 rounded-lg">
                      <p className="text-sm text-foreground">Meeting scheduling</p>
                      <p className="text-xs text-muted-foreground">Prefers afternoon calls</p>
                    </div>
                    <div className="p-2 bg-background/50 rounded-lg">
                      <p className="text-sm text-foreground">Document review</p>
                      <p className="text-xs text-muted-foreground">Legal docs require extra attention</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl">
                  <h4 className="font-medium text-foreground mb-2">Response Templates</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Active Templates</span>
                      <span className="text-amber-400">12</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Auto-applied</span>
                      <span className="text-amber-400">8</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {rightPanelTab === 'activity' && (
              <ActivityLog />
            )}
            {rightPanelTab === 'training' && (
              <div className="space-y-4">
                <button
                  onClick={() => setShowTrainingModal(true)}
                  className="w-full p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl text-left hover:border-purple-500/50 transition-all"
                >
                  <h4 className="font-medium text-foreground mb-1">Training Accelerator</h4>
                  <p className="text-xs text-muted-foreground">Speed up your Chief of Staff's learning</p>
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
            {rightPanelTab === 'setup' && (
              <div className="space-y-4">
                <GettingStartedChecklist />
              </div>
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
    </div>
  );
}
