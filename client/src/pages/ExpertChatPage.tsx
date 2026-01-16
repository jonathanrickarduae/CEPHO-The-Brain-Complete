import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { 
  ArrowLeft, Send, Mic, MicOff, Volume2, VolumeX, 
  Sparkles, Clock, Star, MessageSquare, Loader2,
  User, Bot, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/PageHeader";
import { trpc } from "@/lib/trpc";
import { AI_EXPERTS, type AIExpert } from "@/data/aiExperts";
import { Streamdown } from "streamdown";

// Generate system prompt from expert profile
function generateSystemPrompt(expert: AIExpert): string {
  const compositeNames = expert.compositeOf.join(", ");
  const strengths = expert.strengths.join(", ");
  const thinkingStyle = expert.thinkingStyle;
  
  return `You are ${expert.name}, a ${expert.specialty} AI expert.

PERSONALITY & APPROACH:
You embody the combined wisdom and thinking styles of ${compositeNames}. Your approach is characterized by ${thinkingStyle}.

CORE STRENGTHS:
${strengths}

EXPERTISE AREAS:
${expert.category} - ${expert.bio}

COMMUNICATION STYLE:
- Be direct and actionable in your advice
- Draw on your composite inspirations when relevant
- Provide specific, practical recommendations
- Ask clarifying questions when needed
- Challenge assumptions constructively
- Support your points with reasoning

CONTEXT:
You are advising a senior executive/investor on matters within your expertise. Be professional but personable. Your goal is to provide high-value insights that drive better decisions.

Remember: You are not just providing information - you are a trusted advisor helping to solve real business challenges.`;
}

export default function ExpertChatPage() {
  const params = useParams<{ expertId: string }>();
  const [, setLocation] = useLocation();
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Find expert from data
  const expert = AI_EXPERTS.find(e => e.id === params.expertId);
  
  // tRPC mutations and queries
  const startSessionMutation = trpc.expertChat.startSession.useMutation();
  const sendMessageMutation = trpc.expertChat.sendMessage.useMutation();
  const createConsultationMutation = trpc.expertConsultation.create.useMutation();
  
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'expert' | 'system'; content: string }>>([]);
  
  // Initialize chat session
  useEffect(() => {
    if (expert && !sessionId) {
      const systemPrompt = generateSystemPrompt(expert);
      startSessionMutation.mutate({
        expertId: expert.id,
        expertName: expert.name,
        systemPrompt,
      }, {
        onSuccess: (session) => {
          if (session) {
            setSessionId(session.id);
            // Record consultation
            createConsultationMutation.mutate({
              expertId: expert.id,
              expertName: expert.name,
              topic: `Chat session with ${expert.name}`,
            });
          }
        }
      });
    }
  }, [expert]);
  
  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSend = async () => {
    if (!message.trim() || !sessionId || !expert || isLoading) return;
    
    const userMessage = message.trim();
    setMessage("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    
    try {
      const response = await sendMessageMutation.mutateAsync({
        sessionId,
        expertId: expert.id,
        expertData: expert,
        message: userMessage,
      });
      
      setMessages(prev => [...prev, { role: 'expert', content: response.response }]);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, { role: 'system', content: 'Failed to get response. Please try again.' }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  if (!expert) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-xl font-semibold mb-2">Expert Not Found</h2>
          <Button onClick={() => setLocation('/ai-experts')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to AI SMEs
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-sm border-b border-white/10 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setLocation('/ai-experts')}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              {expert.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <h1 className="text-white font-semibold">{expert.name}</h1>
              <p className="text-white/60 text-sm">{expert.specialty}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className="bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30">
              <Star className="w-3 h-3 mr-1" />
              {expert.performanceScore}/100
            </Badge>
          </div>
        </div>
      </div>
      
      {/* Expert Info Banner */}
      <div className="bg-black/20 border-b border-white/5 px-4 py-2">
        <div className="max-w-4xl mx-auto">
          <p className="text-white/50 text-xs">
            <Sparkles className="w-3 h-3 inline mr-1" />
            Inspired by: {expert.compositeOf.join(' • ')}
          </p>
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Welcome message */}
          {messages.length === 0 && (
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {expert.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1">
                  <p className="text-white/90 mb-3">
                    Hello! I'm {expert.name}, your {expert.specialty}. I specialize in {expert.category.toLowerCase()} 
                    and bring the combined perspectives of {expert.compositeOf.slice(0, 2).join(' and ')}.
                  </p>
                  <p className="text-white/70 text-sm mb-4">
                    {expert.bio}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {expert.strengths.slice(0, 3).map((strength, i) => (
                      <Badge key={i} variant="outline" className="bg-white/5 text-white/70 border-white/20">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Chat messages */}
          {messages.map((msg, index) => (
            <div 
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${
                msg.role === 'user' 
                  ? 'bg-fuchsia-600/30 border-fuchsia-500/30' 
                  : msg.role === 'system'
                  ? 'bg-red-500/20 border-red-500/30'
                  : 'bg-white/10 border-white/10'
              } rounded-2xl p-4 border`}>
                <div className="flex items-start gap-3">
                  {msg.role !== 'user' && (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      msg.role === 'system' ? 'bg-red-500/30' : 'bg-gradient-to-br from-fuchsia-500 to-purple-600'
                    }`}>
                      {msg.role === 'system' ? (
                        <MessageSquare className="w-4 h-4 text-red-300" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                  )}
                  <div className="flex-1 text-white/90">
                    <Streamdown>{msg.content}</Streamdown>
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-fuchsia-500/30 flex items-center justify-center">
                      <User className="w-4 h-4 text-fuchsia-300" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  </div>
                  <span className="text-white/60">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input Area - Fixed at bottom */}
      <div className="bg-black/40 backdrop-blur-sm border-t border-white/10 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsRecording(!isRecording)}
              className={`${isRecording ? 'bg-red-500/20 text-red-400' : 'text-white/60 hover:text-white'} hover:bg-white/10`}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
            
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Ask ${expert.name.split(' ')[0]} anything...`}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 pr-12 h-12 rounded-xl"
                disabled={isLoading || !sessionId}
              />
            </div>
            
            <Button
              onClick={handleSend}
              disabled={!message.trim() || isLoading || !sessionId}
              className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 h-12 px-6"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
