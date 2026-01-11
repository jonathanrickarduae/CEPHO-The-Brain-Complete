import { useState, useRef, useEffect } from "react";
import { 
  Fingerprint, Brain, Mic, MicOff, Send, ChevronRight,
  Sparkles, Clock, CheckCircle2, Circle, ArrowUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Conversation history with Digital Twin
const INITIAL_CONVERSATIONS = [
  { 
    id: 1, 
    from: "twin", 
    message: "Good morning! I've been working overnight and have a few things ready for you:\n\n• **3 emails drafted** for your review\n• **Market analysis** on renewable energy completed\n• **Potential issue**: The Celadon project has a blocker - legal review pending\n\nWould you like me to walk you through the priorities for today?", 
    time: "7:00 AM" 
  },
  { 
    id: 2, 
    from: "user", 
    message: "Yes, let's start with the Celadon blocker. What's the status?", 
    time: "7:02 AM" 
  },
  { 
    id: 3, 
    from: "twin", 
    message: "The Celadon legal review has been pending for 3 days. I've already:\n\n1. Sent a follow-up to the legal team yesterday\n2. Flagged it in today's Daily Brief\n3. Prepared an escalation email to the General Counsel\n\n**My recommendation**: Should I send the escalation email now, or would you prefer to call them directly? I can set up a call for 9 AM.", 
    time: "7:03 AM" 
  },
];

export default function DigitalTwin() {
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [messageInput, setMessageInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations]);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  // Toggle voice recording
  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast.info("Listening... speak to your Digital Twin");
      // Simulate voice capture after 3 seconds
      setTimeout(() => {
        setIsRecording(false);
        const voiceMessage = {
          id: conversations.length + 1,
          from: "user" as const,
          message: "Send the escalation email to the General Counsel. Also, what's the status on the renewable energy opportunities we discussed?",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setConversations(prev => [...prev, voiceMessage]);
        
        // Twin response
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          const twinResponse = {
            id: conversations.length + 2,
            from: "twin" as const,
            message: "Done! I've sent the escalation email to Sarah Mitchell (General Counsel) with a request for response by EOD.\n\n**Renewable Energy Update:**\nThe Research team identified 3 promising opportunities:\n\n1. **SolarTech Partnership** - 85% match with your criteria\n2. **GreenGrid Acquisition** - Smaller but strategic\n3. **CleanEnergy Fund** - Investment opportunity, $2M minimum\n\nI've prepared a detailed brief on each. Should I add this to your Daily Brief, or would you like to review now?",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setConversations(prev => [...prev, twinResponse]);
        }, 2000);
      }, 3000);
    } else {
      setIsRecording(false);
      toast.success("Voice captured");
    }
  };

  // Send text message
  const sendMessage = () => {
    if (!messageInput.trim()) return;
    
    const newMessage = {
      id: conversations.length + 1,
      from: "user" as const,
      message: messageInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setConversations(prev => [...prev, newMessage]);
    setMessageInput("");
    
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
    
    // Simulate twin response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const twinResponse = {
        id: conversations.length + 2,
        from: "twin" as const,
        message: "I understand. I'll take care of that right away and update you once it's done. Is there anything else you'd like me to prioritize today?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setConversations(prev => [...prev, twinResponse]);
    }, 1500);
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Quick action buttons
  const quickActions = [
    { label: "Show Daily Brief", action: () => toast.info("Opening Daily Brief...") },
    { label: "Check pending items", action: () => toast.info("5 items pending your review") },
    { label: "Schedule training", action: () => toast.info("Training session scheduled for 2:30 PM") },
  ];

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-black">
      {/* Header - Compact */}
      <div className="shrink-0 border-b border-white/10 bg-black/80 backdrop-blur-xl px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                <Fingerprint className="w-5 h-5 text-purple-400" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">Digital Twin</h1>
              <p className="text-xs text-gray-400">Online • 42h trained • 35% autonomous</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">
              <Sparkles className="w-3 h-3 mr-1" />
              5 pending
            </Badge>
          </div>
        </div>
      </div>

      {/* Messages Area - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {conversations.map((msg) => (
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
              <div className={`flex-1 max-w-[85%] ${msg.from === "user" ? "flex flex-col items-end" : ""}`}>
                <div className={`inline-block px-4 py-3 rounded-2xl ${
                  msg.from === "twin" 
                    ? "bg-white/5 border border-white/10 rounded-tl-sm" 
                    : "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 rounded-tr-sm"
                }`}>
                  <p className="text-sm text-white whitespace-pre-wrap leading-relaxed"
                     dangerouslySetInnerHTML={{ 
                       __html: msg.message
                         .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                         .replace(/\n/g, '<br/>')
                     }} 
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 px-1">{msg.time}</p>
              </div>
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-3">
              <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-500/30">
                <Fingerprint className="w-4 h-4 text-purple-400" />
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
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
      <div className="shrink-0 border-t border-white/5 bg-black/50 px-4 py-2">
        <div className="max-w-3xl mx-auto flex gap-2 overflow-x-auto pb-1">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="shrink-0 px-3 py-1.5 text-xs text-gray-400 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area - Fixed at bottom (Manus-style) */}
      <div className="shrink-0 border-t border-white/10 bg-black/90 backdrop-blur-xl px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-3">
            {/* Text Input */}
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={messageInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Message your Digital Twin..."
                rows={1}
                className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 resize-none focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
              {messageInput.trim() && (
                <button
                  onClick={sendMessage}
                  className="absolute right-2 bottom-2 p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white hover:opacity-90 transition-opacity"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {/* Voice Button - Right side for thumb access */}
            <button
              onClick={toggleRecording}
              className={`shrink-0 p-4 rounded-2xl transition-all ${
                isRecording 
                  ? "bg-red-500 text-white animate-pulse" 
                  : "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-400 hover:border-purple-500/50"
              }`}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          </div>
          
          {/* Recording indicator */}
          {isRecording && (
            <div className="flex items-center justify-center gap-2 mt-3 text-red-400 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Listening... tap to stop
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
