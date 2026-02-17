import { useState, useRef, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { 
  Send, X, ArrowLeft, Building2, Sparkles,
  Lightbulb, Target, FileText, ChevronRight, History, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { corporatePartners, type CorporatePartner } from "@/data/ai-experts.data";

interface Message {
  id: string;
  role: 'user' | 'partner';
  content: string;
  timestamp: Date;
  dbId?: number;
}

interface CorporatePartnerChatProps {
  partnerId: string;
  onClose: () => void;
}

export function CorporatePartnerChat({ partnerId, onClose }: CorporatePartnerChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const partner = corporatePartners.find(p => p.id === partnerId);

  // Load conversation history from database
  const { data: conversationHistory } = trpc.expertEvolution.getConversations.useQuery(
    { expertId: partnerId, limit: 50 },
    { enabled: !!partnerId }
  );

  // Store conversation mutation
  const storeConversationMutation = trpc.expertEvolution.storeConversation.useMutation();

  // Load history on mount
  useEffect(() => {
    if (conversationHistory && isLoadingHistory) {
      const loadedMessages: Message[] = conversationHistory.map((conv: { id: number; role: string; content: string; createdAt: Date }) => ({
        id: `db-${conv.id}`,
        role: conv.role === 'user' ? 'user' as const : 'partner' as const,
        content: conv.content,
        timestamp: new Date(conv.createdAt),
        dbId: conv.id,
      }));
      
      if (loadedMessages.length > 0) {
        setMessages(loadedMessages);
      }
      setIsLoadingHistory(false);
    }
  }, [conversationHistory, isLoadingHistory]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Generate partner response based on their methodology
  const generatePartnerResponse = (partner: CorporatePartner, userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Use partner's thinking framework and methodology
    const frameworks = partner.frameworks || [];
    const principles = partner.keyPrinciples || [];
    const tools = partner.signatureTools || [];
    
    // Context-aware responses based on partner
    if (partner.name === 'McKinsey & Company') {
      if (lowerMessage.includes('strategy') || lowerMessage.includes('problem')) {
        return `Let me structure this using our hypothesis-driven approach. First, we need to define the core issue precisely. I'd recommend we use an issue tree to decompose this into MECE components.\n\nBased on what you've shared, I see three key hypotheses we should test:\n1. Market positioning opportunity\n2. Operational efficiency gains\n3. Capability building requirements\n\nWhich of these resonates most with your current priorities?`;
      }
      if (lowerMessage.includes('framework') || lowerMessage.includes('how')) {
        return `At McKinsey, we approach this systematically. Let me walk you through our 7S Framework analysis:\n\n• **Strategy**: What's your winning aspiration?\n• **Structure**: How is the organization designed?\n• **Systems**: What processes drive performance?\n• **Shared Values**: What's the cultural foundation?\n• **Style**: How does leadership operate?\n• **Staff**: What talent do you have?\n• **Skills**: What capabilities are needed?\n\nThis gives us a holistic view. Where should we start?`;
      }
      return `That's an excellent question. Let me apply our structured problem-solving approach.\n\nFirst, I'd like to understand the full context - what's the ultimate outcome you're trying to achieve? Once we're clear on that, we can work backwards to identify the critical path.\n\nRemember: the 80/20 rule applies here. Let's find the vital few factors that will drive 80% of the impact.`;
    }
    
    if (partner.name === 'NASA') {
      if (lowerMessage.includes('risk') || lowerMessage.includes('fail')) {
        return `At NASA, we live by "Failure is not an option" - but learning from failure is essential. Let me walk you through our FMEA approach:\n\n**Failure Mode and Effects Analysis:**\n1. Identify all potential failure modes\n2. Assess severity (1-10)\n3. Assess probability (1-10)\n4. Assess detectability (1-10)\n5. Calculate Risk Priority Number (RPN)\n\nFor your situation, what are the top 3 things that could go wrong? Let's analyze each systematically.`;
      }
      if (lowerMessage.includes('innovation') || lowerMessage.includes('moonshot')) {
        return `Moonshot thinking is in our DNA. When Kennedy said we'd go to the moon, we had about 4% of the technology needed.\n\nHere's how we approach audacious goals:\n\n1. **Define the impossible clearly** - What exactly would success look like?\n2. **Work backwards** - What must be true for this to happen?\n3. **Identify technology gaps** - Use Technology Readiness Levels (TRL 1-9)\n4. **Build redundancy** - Every critical system needs a backup\n5. **Test like you fly** - Simulate real conditions\n\nWhat's your moonshot? Let's break it down.`;
      }
      return `Let me apply systems engineering thinking to this.\n\nAt NASA, we decompose every complex challenge into subsystems, define clear interfaces, and ensure each component can be tested independently.\n\nThink of your challenge as a mission. What's the:\n• **Mission objective** (primary success criteria)\n• **Mission constraints** (time, budget, resources)\n• **Critical path** (what must happen in sequence)\n• **Contingencies** (backup plans for key risks)\n\nLet's map this out together.`;
    }
    
    if (partner.name === 'BlackRock') {
      if (lowerMessage.includes('risk') || lowerMessage.includes('invest')) {
        return `At BlackRock, every decision starts with understanding risk. Let me apply our Aladdin-style analysis:\n\n**Risk Decomposition:**\n• **Market Risk**: How exposed are you to market movements?\n• **Credit Risk**: What's the counterparty exposure?\n• **Liquidity Risk**: Can you exit positions when needed?\n• **Operational Risk**: What could go wrong in execution?\n\nWe also think in terms of factors - what's really driving your returns? Is it growth, value, momentum, or quality factors?\n\nWhat's your current risk budget, and where do you want to deploy it?`;
      }
      return `Let me think about this through our investment lens.\n\nAt BlackRock, we believe:\n1. **Risk is the foundation of return** - understand it first\n2. **Diversification is the only free lunch** - don't concentrate unnecessarily\n3. **Long-term thinking beats short-term noise** - time horizon matters\n4. **Sustainability is alpha** - ESG factors drive long-term value\n\nFor your situation, what's your time horizon, and what risks are you willing to accept for potential returns?`;
      }
    
    if (partner.name === 'Tesla') {
      if (lowerMessage.includes('first principles') || lowerMessage.includes('assumption')) {
        return `First principles thinking is how we approach everything at Tesla. Here's the process:\n\n1. **Identify the problem** - What are you actually trying to solve?\n2. **List all assumptions** - What do people "know" to be true?\n3. **Question each assumption** - Is it actually true, or just conventional wisdom?\n4. **Rebuild from fundamentals** - What does physics/economics actually allow?\n\nFor example, when everyone said batteries were too expensive, we asked: "What are batteries made of? What's the commodity cost of those materials?" The answer showed 10x cost reduction was possible.\n\nWhat assumptions are you accepting that might not be true?`;
      }
      return `Let me challenge this with first principles thinking.\n\nAt Tesla, we don't accept "that's how it's always been done." We ask:\n• What are the fundamental truths here?\n• What constraints are real vs. assumed?\n• If physics allows it, how do we make it happen?\n\nSpeed of iteration is our competitive advantage. We'd rather try 10 things and have 3 work than spend months planning the "perfect" approach.\n\nWhat's the fastest experiment you could run to test your core assumption?`;
    }
    
    // Generic corporate partner response
    return `Based on ${partner.name}'s methodology of ${partner.methodology}, let me offer some structured thinking.\n\nOur approach emphasizes:\n${principles.slice(0, 3).map(p => `• ${p}`).join('\n')}\n\nFor your specific situation, I'd recommend we start by clearly defining the problem space, then systematically work through potential solutions using our ${frameworks[0] || 'proven frameworks'}.\n\nWhat aspect would you like to explore first?`;
  };

  // tRPC mutation for corporate partner chat
  const chatMutation = trpc.expertEvolution.chat.useMutation({
    onSuccess: (data: { response: string; expertName: string; voiceStyle?: string }) => {
      const partnerMessage: Message = {
        id: `partner-${Date.now()}`,
        role: 'partner',
        content: data.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, partnerMessage]);
      setIsTyping(false);
      
      // Store partner response in database
      storeConversationMutation.mutate({
        expertId: partnerId,
        role: 'expert',
        content: data.response,
      });
    },
    onError: (error: unknown) => {
      console.error('Partner chat error:', error);
      // Fallback to local response on error
      if (partner) {
        const fallbackResponse = generatePartnerResponse(partner, inputValue);
        const partnerMessage: Message = {
          id: `partner-${Date.now()}`,
          role: 'partner',
          content: fallbackResponse,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, partnerMessage]);
        
        // Store fallback response in database
        storeConversationMutation.mutate({
          expertId: partnerId,
          role: 'expert',
          content: fallbackResponse,
        });
      }
      setIsTyping(false);
    }
  });

  const sendMessage = () => {
    if (!inputValue.trim() || !partner) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageContent = inputValue;
    setInputValue('');
    setIsTyping(true);

    // Store user message in database
    storeConversationMutation.mutate({
      expertId: partnerId,
      role: 'user',
      content: messageContent,
    });

    // Build conversation history
    const conversationHistory = messages.map(m => ({
      role: m.role === 'user' ? 'user' as const : 'assistant' as const,
      content: m.content
    }));

    // Build system prompt from corporate partner data
    const systemPromptParts = [
      `You are a senior consultant from ${partner.name}, a leading firm in ${partner.industry}.`,
      `Your methodology: ${partner.methodology}`,
      partner.thinkingFramework ? `Your thinking framework: ${partner.thinkingFramework}` : '',
      partner.researchApproach ? `Your research approach: ${partner.researchApproach}` : '',
      partner.keyPrinciples ? `Your key principles: ${partner.keyPrinciples.join(', ')}` : '',
      partner.signatureTools ? `Your signature tools and frameworks: ${partner.signatureTools.join(', ')}` : '',
      `Your strengths: ${partner.strengths.join(', ')}`,
      `Frameworks you use: ${partner.frameworks.join(', ')}`,
      '',
      'Respond as a senior partner would - with authority, structure, and actionable insights.',
      'Use your firm\'s specific methodologies and frameworks in your responses.',
      'Be direct and provide concrete recommendations.'
    ].filter(Boolean).join('\n');

    // Call real AI backend with corporate partner persona
    chatMutation.mutate({
      expertId: partner.id,
      message: messageContent,
      expertData: {
        name: partner.name,
        specialty: partner.industry,
        bio: partner.methodology,
        compositeOf: partner.frameworks,
        strengths: partner.strengths,
        weaknesses: [],
        thinkingStyle: partner.thinkingFramework || partner.methodology,
      },
      conversationHistory,
    });
  };

  // Clear conversation history
  const clearHistory = () => {
    setMessages([]);
  };

  if (!partner) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Partner not found</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/80 backdrop-blur-xl p-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center text-2xl">
            {partner.logo}
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-foreground flex items-center gap-2">
              {partner.name}
              <Badge className="bg-blue-500/20 text-blue-400 border-0 text-xs">
                Corporate Partner
              </Badge>
            </h2>
            <p className="text-sm text-muted-foreground">{partner.industry}</p>
          </div>
          <div className="flex items-center gap-1">
            {conversationHistory && conversationHistory.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full mr-2">
                <History className="w-3 h-3" />
                <span>{conversationHistory.length}</span>
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={clearHistory} title="Clear History">
              <Trash2 className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {/* Partner Info Bar */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {partner.frameworks.slice(0, 4).map((framework, idx) => (
            <Badge key={idx} variant="outline" className="text-xs whitespace-nowrap">
              {framework}
            </Badge>
          ))}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-3xl mx-auto">
          {/* Loading indicator */}
          {isLoadingHistory && (
            <div className="flex items-center justify-center py-8">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {/* Welcome Message */}
          {!isLoadingHistory && messages.length === 0 && (
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl p-6 border border-blue-500/20">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-xl">
                  {partner.logo}
                </div>
                <div className="flex-1">
                  <p className="text-foreground mb-3">
                    Welcome. I'm a senior consultant from <span className="font-semibold text-blue-400">{partner.name}</span>. 
                    I bring expertise in {partner.industry.toLowerCase()} and can help you with:
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {partner.strengths.slice(0, 4).map((strength, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Target className="w-3 h-3 text-blue-400" />
                        {strength}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground italic">
                    "{partner.thinkingFramework?.split('.')[0] || partner.methodology}"
                  </p>
                </div>
              </div>
              
              {/* Suggested Questions */}
              <div className="mt-4 pt-4 border-t border-blue-500/20">
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" />
                  Try asking:
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    `How would ${partner.name} approach my strategy?`,
                    `What frameworks do you recommend?`,
                    `Help me structure this problem`
                  ].map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInputValue(suggestion);
                      }}
                      className="text-xs px-3 py-1.5 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border'
                }`}
              >
                {message.role === 'partner' && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{partner.logo}</span>
                    <span className="text-sm font-medium text-blue-400">{partner.name}</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-60 mt-2">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-card border border-border rounded-2xl p-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{partner.logo}</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border bg-card/80 backdrop-blur-xl p-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <Input
            placeholder={`Ask ${partner.name} anything...`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            className="flex-1 bg-secondary/50"
          />
          <Button 
            onClick={sendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CorporatePartnerChat;
