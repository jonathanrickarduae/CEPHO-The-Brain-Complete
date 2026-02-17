import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Users, Send, Mic, MicOff, Plus, X, 
  MessageSquare, Brain, Sparkles, Clock,
  CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { allExperts, type AIExpert } from '@/data/ai-experts.data';
import { useFavorites } from '@/components/project-management/MyBoard';

interface Message {
  id: string;
  expertId: string;
  expertName: string;
  content: string;
  timestamp: Date;
  type: 'response' | 'thinking' | 'suggestion';
}

interface WarRoomSession {
  id: string;
  topic: string;
  experts: string[];
  messages: Message[];
  status: 'active' | 'completed';
  createdAt: Date;
}

export function WarRoom() {
  const [, setLocation] = useLocation();
  const { favorites } = useFavorites();
  const [selectedExperts, setSelectedExperts] = useState<string[]>([]);
  const [topic, setTopic] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [showExpertPicker, setShowExpertPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);

  // Get expert details
  const getExpert = (id: string) => allExperts.find(e => e.id === id);

  // Filter experts for picker
  const filteredExperts = allExperts.filter(expert => 
    !selectedExperts.includes(expert.id) &&
    (expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     expert.specialty.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Add expert to war room
  const addExpert = (expertId: string) => {
    if (!selectedExperts.includes(expertId)) {
      setSelectedExperts([...selectedExperts, expertId]);
    }
    setShowExpertPicker(false);
    setSearchQuery('');
  };

  // Remove expert from war room
  const removeExpert = (expertId: string) => {
    setSelectedExperts(selectedExperts.filter(id => id !== expertId));
  };

  // Start war room session
  const startSession = () => {
    if (selectedExperts.length < 2 || !topic.trim()) return;
    setSessionStarted(true);
    
    // Initial expert introductions
    simulateExpertResponses('introduce');
  };

  // Simulate expert responses (in production, this would call the AI API)
  const simulateExpertResponses = async (type: 'introduce' | 'discuss') => {
    setIsThinking(true);
    
    for (const expertId of selectedExperts) {
      const expert = getExpert(expertId);
      if (!expert) continue;

      // Simulate thinking delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));

      const content = type === 'introduce'
        ? `As ${expert.name}, specializing in ${expert.specialty}, I'm ready to contribute my perspective on "${topic}". ${expert.bio.split('.')[0]}.`
        : generateExpertResponse(expert, topic, userMessage);

      const message: Message = {
        id: `${Date.now()}-${expertId}`,
        expertId,
        expertName: expert.name,
        content,
        timestamp: new Date(),
        type: 'response'
      };

      setMessages(prev => [...prev, message]);
    }

    setIsThinking(false);
  };

  // Generate contextual expert response
  const generateExpertResponse = (expert: AIExpert, topic: string, prompt: string): string => {
    const responses = [
      `From my ${expert.specialty} perspective, I'd suggest we consider ${prompt.split(' ').slice(0, 5).join(' ')}... This aligns with ${expert.compositeOf[0]}'s approach to strategic thinking.`,
      `Building on what's been said, I see an opportunity here. My experience in ${expert.category} tells me we should focus on the fundamentals first.`,
      `Interesting point. Let me offer a contrarian view - what if we approached this from a ${expert.thinkingStyle.split(',')[0].toLowerCase()} angle?`,
      `I agree with the direction, but we need to consider the risks. In my field, we've seen similar situations where ${expert.weaknesses[0]?.toLowerCase() || 'overconfidence'} led to suboptimal outcomes.`,
      `This is exactly the kind of challenge where ${expert.strengths[0]?.toLowerCase() || 'analytical thinking'} becomes crucial. Here's my recommendation...`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Send message to war room
  const sendMessage = () => {
    if (!userMessage.trim() || isThinking) return;
    
    // Add user message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      expertId: 'user',
      expertName: 'You',
      content: userMessage,
      timestamp: new Date(),
      type: 'response'
    };
    setMessages(prev => [...prev, userMsg]);
    setUserMessage('');

    // Trigger expert responses
    simulateExpertResponses('discuss');
  };

  // Toggle voice recording
  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // In production, integrate with Web Speech API
  };

  return (
    <div className="h-full flex flex-col">
      {!sessionStarted ? (
        // Setup Phase
        <div className="flex-1 p-6 space-y-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 mb-4">
              <Users className="w-8 h-8 text-orange-400" />
            </div>
            <h2 className="text-2xl font-display font-bold">War Room</h2>
            <p className="text-muted-foreground mt-2">
              Assemble your expert team for collaborative problem-solving
            </p>
          </div>

          {/* Topic Input */}
          <Card className="bg-card/60 border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Mission Topic</CardTitle>
            </CardHeader>
            <CardContent>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="What challenge do you want your experts to tackle?"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </CardContent>
          </Card>

          {/* Selected Experts */}
          <Card className="bg-card/60 border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Expert Team ({selectedExperts.length})</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowExpertPicker(true)}
                  className="gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Expert
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {selectedExperts.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">
                  Add at least 2 experts to start a war room session
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedExperts.map(expertId => {
                    const expert = getExpert(expertId);
                    if (!expert) return null;
                    return (
                      <div
                        key={expertId}
                        className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg border border-primary/20"
                      >
                        <span className="text-lg">{expert.avatar}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{expert.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{expert.specialty}</div>
                        </div>
                        <button
                          onClick={() => removeExpert(expertId)}
                          className="p-1 hover:bg-destructive/20 rounded transition-colors"
                        >
                          <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Quick add from favorites */}
              {favorites.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">Quick add from My Board:</p>
                  <div className="flex flex-wrap gap-1">
                    {favorites.slice(0, 5).map(fav => {
                      const expert = getExpert(fav.id);
                      if (!expert || selectedExperts.includes(fav.id)) return null;
                      return (
                        <button
                          key={fav.id}
                          onClick={() => addExpert(fav.id)}
                          className="px-2 py-1 text-xs bg-secondary hover:bg-secondary/80 rounded transition-colors"
                        >
                          {expert.avatar} {expert.name.split(' ')[0]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Start Button */}
          <Button
            onClick={startSession}
            disabled={selectedExperts.length < 2 || !topic.trim()}
            className="w-full py-6 text-lg gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Start War Room Session
          </Button>
        </div>
      ) : (
        // Active Session
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border bg-card/80">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{topic}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {selectedExperts.slice(0, 3).map(id => {
                    const expert = getExpert(id);
                    return expert ? (
                      <span key={id} className="text-sm">{expert.avatar}</span>
                    ) : null;
                  })}
                  {selectedExperts.length > 3 && (
                    <span className="text-xs text-muted-foreground">+{selectedExperts.length - 3} more</span>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSessionStarted(false);
                  setMessages([]);
                }}
              >
                End Session
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map(message => {
                const expert = message.expertId !== 'user' ? getExpert(message.expertId) : null;
                const isUser = message.expertId === 'user';
                
                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                      isUser 
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary'
                    }`}>
                      {isUser ? '👤' : expert?.avatar || '🤖'}
                    </div>
                    <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : ''}`}>
                      <div className="text-sm font-medium mb-1">
                        {message.expertName}
                        {expert && (
                          <span className="text-xs text-muted-foreground ml-2">
                            {expert.specialty}
                          </span>
                        )}
                      </div>
                      <div className={`inline-block px-4 py-2 rounded-2xl ${
                        isUser 
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary'
                      }`}>
                        {message.content}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isThinking && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Experts are thinking...</span>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border bg-card/80">
            <div className="flex gap-2">
              <button
                onClick={toggleRecording}
                className={`p-3 rounded-full transition-colors ${
                  isRecording 
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <input
                type="text"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask your expert team..."
                className="flex-1 px-4 py-2 bg-background border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={isThinking}
              />
              <Button
                onClick={sendMessage}
                disabled={!userMessage.trim() || isThinking}
                className="rounded-full px-4"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Expert Picker Modal */}
      {showExpertPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-[80vh] flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Add Expert</CardTitle>
                <button
                  onClick={() => setShowExpertPicker(false)}
                  className="p-1 hover:bg-secondary rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search experts..."
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 mt-2"
                autoFocus
              />
            </CardHeader>
            <ScrollArea className="flex-1">
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {filteredExperts.slice(0, 20).map(expert => (
                    <button
                      key={expert.id}
                      onClick={() => addExpert(expert.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors text-left"
                    >
                      <span className="text-2xl">{expert.avatar}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{expert.name}</div>
                        <div className="text-sm text-muted-foreground truncate">{expert.specialty}</div>
                      </div>
                      <Plus className="w-4 h-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </ScrollArea>
          </Card>
        </div>
      )}
    </div>
  );
}

// Export useFavorites hook for external use
export { useFavorites };
