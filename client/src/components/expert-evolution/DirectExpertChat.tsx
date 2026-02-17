import { useState, useRef, useEffect, useCallback } from 'react';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';
import { 
  Send, Mic, MicOff, X, ArrowLeft, 
  Video, Phone, MoreVertical, Paperclip,
  Image, Smile, ThumbsUp, Copy, Share2,
  Volume2, VolumeX, Pause, Play, History, Trash2, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { allExperts, type AIExpert } from '@/data/ai-experts.data';

interface Message {
  id: string;
  role: 'user' | 'expert';
  content: string;
  timestamp: Date;
  type: 'text' | 'voice';
  voiceDuration?: number;
  isPlaying?: boolean;
  isGeneratingVoice?: boolean;
  audioUrl?: string;
  dbId?: number;
}

interface DirectExpertChatProps {
  expertId: string;
  onClose: () => void;
}

export function DirectExpertChat({ expertId, onClose }: DirectExpertChatProps) {
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const expert = allExperts.find(e => e.id === expertId);

  // Load conversation history from database
  const { data: conversationHistory } = trpc.expertEvolution.getConversations.useQuery(
    { expertId, limit: 50 },
    { enabled: !!expertId }
  );

  // Store conversation mutation
  const storeConversationMutation = trpc.expertEvolution.storeConversation.useMutation();

  // Voice generation mutation
  const generateVoiceMutation = trpc.expertEvolution.generateVoice.useMutation({
    onSuccess: (data, variables) => {
      // Create audio URL from base64
      const audioBlob = new Blob(
        [Uint8Array.from(atob(data.audio), c => c.charCodeAt(0))],
        { type: data.contentType }
      );
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Update message with audio URL
      setMessages(prev => prev.map(msg => {
        if (msg.content === variables.text && msg.role === 'expert') {
          return { ...msg, audioUrl, isGeneratingVoice: false };
        }
        return msg;
      }));
      
      // Auto-play if not muted
      if (!isMuted) {
        playAudio(audioUrl, variables.text);
      }
    },
    onError: (error) => {
      console.error('Voice generation error:', error);
      // Remove generating state on error
      setMessages(prev => prev.map(msg => ({
        ...msg,
        isGeneratingVoice: false
      })));
    }
  });

  // Play audio
  const playAudio = useCallback((audioUrl: string, messageContent: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    
    // Find message ID by content
    const messageId = messages.find(m => m.content === messageContent)?.id;
    if (messageId) {
      setCurrentlyPlayingId(messageId);
    }
    
    audio.onended = () => {
      setCurrentlyPlayingId(null);
    };
    
    audio.play().catch(err => {
      console.error('Audio playback error:', err);
      setCurrentlyPlayingId(null);
    });
  }, [messages]);

  // Stop audio
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setCurrentlyPlayingId(null);
  }, []);

  // Generate voice for a message
  const generateVoice = useCallback((messageId: string, content: string) => {
    if (!expert) return;
    
    // Mark message as generating voice
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isGeneratingVoice: true } : msg
    ));
    
    generateVoiceMutation.mutate({
      text: content,
      expertId: expert.id,
    });
  }, [expert, generateVoiceMutation]);

  // Load history on mount
  useEffect(() => {
    if (conversationHistory && isLoadingHistory) {
      const loadedMessages: Message[] = conversationHistory.map((conv: { id: number; role: string; content: string; createdAt: Date }) => ({
        id: `db-${conv.id}`,
        role: conv.role === 'user' ? 'user' as const : 'expert' as const,
        content: conv.content,
        timestamp: new Date(conv.createdAt),
        type: 'text' as const,
        dbId: conv.id,
      }));
      
      if (loadedMessages.length > 0) {
        setMessages(loadedMessages);
      } else if (expert) {
        // No history, show greeting
        const greeting = getExpertGreeting(expert);
        setMessages([{
          id: `greeting-${Date.now()}`,
          role: 'expert',
          content: greeting,
          timestamp: new Date(),
          type: 'text'
        }]);
        // Store greeting in database
        storeConversationMutation.mutate({
          expertId,
          role: 'expert',
          content: greeting,
        });
      }
      setIsLoadingHistory(false);
    }
  }, [conversationHistory, isLoadingHistory, expert, expertId, storeConversationMutation]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Get expert-specific greeting
  const getExpertGreeting = (expert: AIExpert): string => {
    const greetings: Record<string, string> = {
      'cel-001': "What's good? Jay here. Let's talk business, ownership, and building something that lasts. What's on your mind?",
      'cel-002': "Hey there! Jessica here. I'm all about building with purpose and authenticity. What can I help you figure out today?",
      'cel-003': "Hey! Ryan here. Look, I've got about 47 things going on, but let's make this fun. What are we working on?",
    };
    return greetings[expert.id] || `Hey, I'm ${expert.name}. ${expert.bio.split('.')[0]}. What would you like to discuss?`;
  };

  // Generate expert response based on their personality (fallback)
  const generateExpertResponse = (expert: AIExpert, userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Jay-Z responses
    if (expert.id === 'cel-001') {
      if (lowerMessage.includes('business') || lowerMessage.includes('start')) {
        return "Listen, the key is ownership. I learned early - don't just work for the check, own the thing. When I started Roc-A-Fella, everyone said I was crazy. But I knew - you either own the masters or the masters own you. What are you trying to build?";
      }
      if (lowerMessage.includes('invest') || lowerMessage.includes('money')) {
        return "I don't chase money, I chase value. Look at what I did with Tidal, with D'Ussé. I find things I believe in, things that speak to culture, and I put my name and my money behind them. But more importantly - I put my time. What's the opportunity you're looking at?";
      }
      if (lowerMessage.includes('brand') || lowerMessage.includes('market')) {
        return "Your brand is your reputation, and your reputation is everything. I spent 20 years building mine. Every move, every partnership, every deal - it all adds to the story. What story are you trying to tell?";
      }
      return "Real talk - success isn't about one big moment. It's about showing up every day, making smart moves, and playing the long game. I've been doing this for decades. What's your long-term vision?";
    }
    
    // Jessica Alba responses
    if (expert.id === 'cel-002') {
      if (lowerMessage.includes('business') || lowerMessage.includes('start')) {
        return "When I started Honest Company, everyone told me to just put my name on something and collect a check. But that wasn't the point. I wanted to solve a real problem - safe products for families. What problem are you passionate about solving?";
      }
      if (lowerMessage.includes('purpose') || lowerMessage.includes('mission')) {
        return "Purpose isn't just marketing - it has to be real. Consumers can tell when you're faking it. My mission came from being a mom and wanting better for my kids. That authenticity is what built trust. What's your genuine 'why'?";
      }
      if (lowerMessage.includes('product') || lowerMessage.includes('consumer')) {
        return "I learned that you have to obsess over the product. Every ingredient, every detail. Your customers are trusting you. At Honest, we reformulated products dozens of times until they were right. Are you willing to do that?";
      }
      return "Building a company is hard - like, really hard. There were so many times I wanted to quit. But when you're building something that matters, something that helps people, you find a way to keep going. What's keeping you motivated?";
    }
    
    // Ryan Reynolds responses
    if (expert.id === 'cel-003') {
      if (lowerMessage.includes('market') || lowerMessage.includes('advertis')) {
        return "Okay, here's the thing about marketing - everyone's trying to be clever, but they forget to be human. At Maximum Effort, we make ads that we'd actually want to watch. We move fast, we make fun of ourselves, and we don't take it too seriously. What are you selling?";
      }
      if (lowerMessage.includes('business') || lowerMessage.includes('start')) {
        return "Look, I've started a few things - Aviation Gin, Mint Mobile, a Welsh football club (long story). The secret? Find something you genuinely love, make it fun, and don't be afraid to be the face of it. What gets you excited?";
      }
      if (lowerMessage.includes('sell') || lowerMessage.includes('exit')) {
        return "Knowing when to sell is an art. With Aviation, we built something great, found the right partner in Diageo, and made a deal that worked for everyone. But here's the thing - I didn't build it to sell it. I built it because I loved it. The exit was a bonus.";
      }
      return "Here's my philosophy: life's too short to be boring. Whether it's a movie, a gin company, or a mobile carrier - make it entertaining. People remember how you made them feel. So... what are we making fun today?";
    }
    
    // Default response
    return `That's a great question. Based on my experience in ${expert.specialty}, I'd say the key is to focus on ${expert.strengths[0]?.toLowerCase() || 'fundamentals'}. Let me think about this more specifically - what's the context?`;
  };

  // tRPC mutation for expert chat
  const chatMutation = trpc.expertEvolution.chat.useMutation({
    onSuccess: (data: { response: string; expertName: string; voiceStyle?: string }) => {
      const expertMessage: Message = {
        id: `expert-${Date.now()}`,
        role: 'expert',
        content: data.response,
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, expertMessage]);
      setIsTyping(false);
      
      // Store expert response in database
      storeConversationMutation.mutate({
        expertId,
        role: 'expert',
        content: data.response,
      });

      // Auto-generate voice if not muted
      if (!isMuted && expert) {
        setTimeout(() => {
          generateVoiceMutation.mutate({
            text: data.response,
            expertId: expert.id,
          });
        }, 500);
      }
    },
    onError: (error: unknown) => {
      console.error('Expert chat error:', error);
      // Fallback to local response on error
      if (expert) {
        const fallbackResponse = generateExpertResponse(expert, inputValue);
        const expertMessage: Message = {
          id: `expert-${Date.now()}`,
          role: 'expert',
          content: fallbackResponse,
          timestamp: new Date(),
          type: 'text'
        };
        setMessages(prev => [...prev, expertMessage]);
        
        // Store fallback response in database
        storeConversationMutation.mutate({
          expertId,
          role: 'expert',
          content: fallbackResponse,
        });
      }
      setIsTyping(false);
    }
  });

  // Send message
  const sendMessage = (content: string, type: 'text' | 'voice' = 'text', voiceDuration?: number) => {
    if (!content.trim() || !expert) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
      type,
      voiceDuration
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Store user message in database
    storeConversationMutation.mutate({
      expertId,
      role: 'user',
      content,
    });

    // Build conversation history for context
    const conversationHistory = messages.map(m => ({
      role: m.role === 'user' ? 'user' as const : 'assistant' as const,
      content: m.content
    }));

    // Call real AI backend
    chatMutation.mutate({
      expertId: expert.id,
      message: content,
      expertData: {
        name: expert.name,
        specialty: expert.specialty,
        bio: expert.bio,
        compositeOf: expert.compositeOf,
        strengths: expert.strengths,
        weaknesses: expert.weaknesses,
        thinkingStyle: expert.thinkingStyle,
      },
      conversationHistory,
    });
  };

  // Clear conversation history
  const clearHistory = () => {
    if (expert) {
      setMessages([]);
      stopAudio();
      // Show new greeting
      const greeting = getExpertGreeting(expert);
      setTimeout(() => {
        setMessages([{
          id: `greeting-${Date.now()}`,
          role: 'expert',
          content: greeting,
          timestamp: new Date(),
          type: 'text'
        }]);
        storeConversationMutation.mutate({
          expertId,
          role: 'expert',
          content: greeting,
        });
      }, 300);
    }
  };

  // Handle voice recording
  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    recordingInterval.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
    }
    // Simulate voice message
    if (recordingTime > 0) {
      sendMessage(`[Voice message - ${recordingTime}s]`, 'voice', recordingTime);
    }
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Start video call
  const startVideoCall = () => {
    setLocation(`/video-studio?expert=${expertId}`);
  };

  if (!expert) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Expert not found</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card/80 backdrop-blur-xl">
        <button
          onClick={onClose}
          className="p-2 hover:bg-secondary rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="relative">
          {expert.avatarUrl ? (
            <img alt="Expert avatar"
              src={expert.avatarUrl}
              alt={expert.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-primary/30"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-2xl border-2 border-primary/30">
              {expert.avatar}
            </div>
          )}
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{expert.name}</h3>
          <p className="text-xs text-muted-foreground truncate">{expert.specialty}</p>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={startVideoCall}
            className="rounded-full"
            title="Video Call"
          >
            <Video className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsMuted(!isMuted);
              if (!isMuted) stopAudio();
            }}
            className={`rounded-full ${isMuted ? 'text-red-500' : ''}`}
            title={isMuted ? "Unmute Voice" : "Mute Voice"}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={clearHistory}
            className="rounded-full"
            title="Clear History"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Expert Info Banner */}
      <div className="px-4 py-3 bg-gradient-to-r from-primary/10 to-transparent border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Inspired by:</span>
              <span className="font-medium">{expert.compositeOf.join(', ')}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{expert.bio}</p>
          </div>
          <div className="flex items-center gap-2">
            {!isMuted && (
              <div className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                <Volume2 className="w-3 h-3" />
                <span>Voice On</span>
              </div>
            )}
            {conversationHistory && conversationHistory.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">
                <History className="w-3 h-3" />
                <span>{conversationHistory.length} messages</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4 max-w-2xl mx-auto">
          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          ) : (
            <>
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {message.role === 'expert' && (
                    <div className="flex-shrink-0">
                      {expert.avatarUrl ? (
                        <img alt="Expert avatar"
                          src={expert.avatarUrl}
                          alt={expert.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                          {expert.avatar}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className={`max-w-[75%] ${message.role === 'user' ? 'text-right' : ''}`}>
                    <div
                      className={`inline-block px-4 py-2 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-secondary rounded-bl-md'
                      }`}
                    >
                      {message.type === 'voice' ? (
                        <div className="flex items-center gap-2">
                          <button className="p-1 hover:bg-white/10 rounded-full">
                            <Play className="w-4 h-4" />
                          </button>
                          <div className="w-24 h-1 bg-white/30 rounded-full">
                            <div className="w-1/3 h-full bg-white rounded-full" />
                          </div>
                          <span className="text-xs">{formatTime(message.voiceDuration || 0)}</span>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                    
                    {/* Voice controls for expert messages */}
                    {message.role === 'expert' && message.type === 'text' && (
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {!isMuted && (
                          <button
                            onClick={() => {
                              if (currentlyPlayingId === message.id) {
                                stopAudio();
                              } else if (message.audioUrl) {
                                playAudio(message.audioUrl, message.content);
                              } else {
                                generateVoice(message.id, message.content);
                              }
                            }}
                            className="p-1 hover:bg-secondary rounded-full transition-colors"
                            title={currentlyPlayingId === message.id ? "Stop" : "Play Voice"}
                            disabled={message.isGeneratingVoice}
                          >
                            {message.isGeneratingVoice ? (
                              <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                            ) : currentlyPlayingId === message.id ? (
                              <Pause className="w-3 h-3 text-primary" />
                            ) : (
                              <Volume2 className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                            )}
                          </button>
                        )}
                      </div>
                    )}
                    
                    {message.role === 'user' && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
          
          {isTyping && (
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                {expert.avatarUrl ? (
                  <img alt="Expert avatar"
                    src={expert.avatarUrl}
                    alt={expert.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    {expert.avatar}
                  </div>
                )}
              </div>
              <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-card/80">
        {isRecording ? (
          <div className="flex items-center gap-4 justify-center py-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">{formatTime(recordingTime)}</span>
            </div>
            <div className="flex-1 h-8 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-red-500/50 to-red-500 animate-pulse" style={{ width: '60%' }} />
            </div>
            <Button
              onClick={stopRecording}
              variant="destructive"
              size="sm"
              className="rounded-full"
            >
              <MicOff className="w-4 h-4 mr-1" />
              Stop
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full flex-shrink-0">
              <Paperclip className="w-5 h-5" />
            </Button>
            
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputValue)}
                placeholder={`Message ${expert.name}...`}
                className="w-full px-4 py-2 bg-secondary rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 pr-10"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <Smile className="w-5 h-5" />
              </button>
            </div>
            
            {inputValue.trim() ? (
              <Button
                onClick={() => sendMessage(inputValue)}
                size="icon"
                className="rounded-full flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </Button>
            ) : (
              <Button
                onClick={startRecording}
                variant="secondary"
                size="icon"
                className="rounded-full flex-shrink-0"
              >
                <Mic className="w-5 h-5" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
