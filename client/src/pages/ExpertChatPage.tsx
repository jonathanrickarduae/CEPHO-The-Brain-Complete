import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { 
  ArrowLeft, Send, Mic, MicOff, Volume2, VolumeX, 
  Sparkles, Clock, Star, MessageSquare, Loader2,
  User, Bot, ChevronDown, Download, FileText, BookOpen, Check
} from "lucide-react";
import { toast } from "sonner";
import { useVoiceInput, useVoiceWaveform } from "@/hooks/useVoiceInput";
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
  const [speakingMessageIndex, setSpeakingMessageIndex] = useState<number | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(() => {
    // Load TTS preference from localStorage
    const saved = localStorage.getItem('expertChat_ttsEnabled');
    return saved ? JSON.parse(saved) : false;
  });
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
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
  
  // Voice input
  const {
    isListening,
    isSupported: voiceSupported,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceInput({
    continuous: true,
    onResult: (text, isFinal) => {
      if (isFinal) {
        setMessage(prev => prev + text + ' ');
      }
    },
  });
  
  const { audioLevel, waveformData, startWaveform, stopWaveform } = useVoiceWaveform();
  
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
  
  // Text-to-speech handler
  const handleSpeak = useCallback((text: string, messageIndex: number) => {
    // Cancel any ongoing speech
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      if (speakingMessageIndex === messageIndex) {
        setSpeakingMessageIndex(null);
        setIsSpeaking(false);
        return;
      }
    }
    
    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Try to use a natural-sounding voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.name.includes('Google') || 
      v.name.includes('Natural') || 
      v.name.includes('Premium')
    ) || voices.find(v => v.lang.startsWith('en'));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.onstart = () => {
      setSpeakingMessageIndex(messageIndex);
      setIsSpeaking(true);
    };
    
    utterance.onend = () => {
      setSpeakingMessageIndex(null);
      setIsSpeaking(false);
    };
    
    utterance.onerror = () => {
      setSpeakingMessageIndex(null);
      setIsSpeaking(false);
      toast.error('Text-to-speech failed');
    };
    
    speechSynthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [speakingMessageIndex]);
  
  // Stop speaking when component unmounts
  useEffect(() => {
    return () => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);
  
  // Toggle TTS preference
  const toggleTts = () => {
    const newValue = !ttsEnabled;
    setTtsEnabled(newValue);
    localStorage.setItem('expertChat_ttsEnabled', JSON.stringify(newValue));
    if (!newValue && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setSpeakingMessageIndex(null);
      setIsSpeaking(false);
    }
    toast.success(newValue ? 'Text-to-speech enabled' : 'Text-to-speech disabled');
  };
  
  // Voice recording toggle
  const toggleVoiceRecording = () => {
    if (isListening) {
      stopListening();
      stopWaveform();
      setIsRecording(false);
    } else {
      startListening();
      startWaveform();
      setIsRecording(true);
    }
  };
  
  // Toast notifications via sonner
  
  // Export to library mutation
  const exportToLibraryMutation = trpc.library.exportExpertChat.useMutation();
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Export chat to markdown (download)
  const handleExportDownload = async () => {
    if (!expert || messages.length === 0) return;
    
    const timestamp = new Date().toISOString().split('T')[0];
    const markdown = `# Expert Consultation: ${expert.name}

**Date:** ${timestamp}
**Expert:** ${expert.name}
**Specialty:** ${expert.specialty}
**Category:** ${expert.category}

## Expert Profile

${expert.bio}

**Inspired By:** ${expert.compositeOf.join(', ')}

**Strengths:** ${expert.strengths.join(', ')}

**Thinking Style:** ${expert.thinkingStyle}

---

## Conversation Transcript

${messages.map(msg => {
  if (msg.role === 'user') return `### You:\n${msg.content}\n`;
  if (msg.role === 'expert') return `### ${expert.name}:\n${msg.content}\n`;
  return `### System:\n${msg.content}\n`;
}).join('\n')}

---

*Exported from CEPHO AI SME Consultation*
`;
    
    // Create blob and download
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consultation-${expert.name.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
    
    toast.success("Conversation exported to markdown file");
  };
  
  // Export chat to library
  const handleExportToLibrary = async () => {
    if (!expert || messages.length === 0) return;
    setIsExporting(true);
    
    try {
      const result = await exportToLibraryMutation.mutateAsync({
        expertId: expert.id,
        expertName: expert.name,
        expertSpecialty: expert.specialty,
        expertCategory: expert.category,
        expertBio: expert.bio,
        compositeOf: expert.compositeOf,
        strengths: expert.strengths,
        thinkingStyle: expert.thinkingStyle,
        messages: messages,
      });
      
      setShowExportMenu(false);
      toast.success(`Saved to Library: ${result.documentName}`);
    } catch (error) {
      console.error('Failed to export to library:', error);
      toast.error("Could not save to library. Please try again.");
    } finally {
      setIsExporting(false);
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
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTts}
              className={`text-white/70 hover:text-white hover:bg-white/10 ${ttsEnabled ? 'bg-fuchsia-500/20 text-fuchsia-300' : ''}`}
              title={ttsEnabled ? 'Disable text-to-speech' : 'Enable text-to-speech'}
            >
              {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
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
                {/* Text-to-speech button for expert messages */}
                {msg.role === 'expert' && (
                  <div className="mt-2 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSpeak(msg.content, index)}
                      className={`text-xs h-7 px-2 ${
                        speakingMessageIndex === index
                          ? 'text-fuchsia-300 bg-fuchsia-500/20'
                          : 'text-white/50 hover:text-white/80 hover:bg-white/10'
                      }`}
                    >
                      {speakingMessageIndex === index ? (
                        <>
                          <VolumeX className="w-3 h-3 mr-1" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3 mr-1" />
                          Listen
                        </>
                      )}
                    </Button>
                  </div>
                )}
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
            {/* Voice Input Button */}
            {voiceSupported && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleVoiceRecording}
                className={`relative ${isRecording ? 'bg-red-500/20 text-red-400' : 'text-white/60 hover:text-white'} hover:bg-white/10`}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-5 h-5" />
                    {/* Waveform indicator */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  </>
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </Button>
            )}
            
            {/* Export Button with Dropdown */}
            {messages.length > 0 && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="text-white/60 hover:text-white hover:bg-white/10"
                  title="Export conversation"
                >
                  {isExporting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                </Button>
                
                {/* Export Dropdown Menu */}
                {showExportMenu && (
                  <div className="absolute bottom-full mb-2 right-0 bg-slate-800 border border-white/20 rounded-lg shadow-xl py-1 min-w-[180px] z-50">
                    <button
                      onClick={handleExportDownload}
                      className="w-full px-4 py-2 text-left text-white/80 hover:bg-white/10 flex items-center gap-2 text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download as Markdown
                    </button>
                    <button
                      onClick={handleExportToLibrary}
                      disabled={isExporting}
                      className="w-full px-4 py-2 text-left text-white/80 hover:bg-white/10 flex items-center gap-2 text-sm disabled:opacity-50"
                    >
                      <BookOpen className="w-4 h-4" />
                      Save to Library
                    </button>
                  </div>
                )}
              </div>
            )}
            
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
