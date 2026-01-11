import { useState, useCallback, useEffect } from 'react';
import { trpc } from '@/lib/trpc';

export interface ChatMessage {
  id: number;
  from: 'user' | 'twin';
  message: string;
  time: string;
  isLoading?: boolean;
}

export function useDigitalTwinChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const utils = trpc.useUtils();
  
  // Fetch conversation history on mount
  const { data: history } = trpc.chat.history.useQuery(
    { limit: 50 },
    { 
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );

  // Load history into messages
  useEffect(() => {
    if (history && history.length > 0) {
      const loadedMessages: ChatMessage[] = history.map((h, index) => ({
        id: index + 1,
        from: h.role === 'user' ? 'user' : 'twin',
        message: h.content,
        time: new Date(h.createdAt).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
      }));
      setMessages(loadedMessages);
    }
  }, [history]);

  // Send message mutation
  const sendMutation = trpc.chat.send.useMutation({
    onMutate: async ({ message }) => {
      // Optimistically add user message
      const userMessage: ChatMessage = {
        id: messages.length + 1,
        from: 'user',
        message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, userMessage]);
      setIsTyping(true);
    },
    onSuccess: (data) => {
      // Add assistant response
      const twinMessage: ChatMessage = {
        id: messages.length + 2,
        from: 'twin',
        message: data.message,
        time: new Date(data.timestamp).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
      };
      setMessages(prev => [...prev, twinMessage]);
      setIsTyping(false);
    },
    onError: (error) => {
      console.error('Chat error:', error);
      setIsTyping(false);
      // Add error message
      const errorMessage: ChatMessage = {
        id: messages.length + 2,
        from: 'twin',
        message: "I'm sorry, I encountered an error. Please try again.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    },
  });

  // Clear history mutation
  const clearMutation = trpc.chat.clear.useMutation({
    onSuccess: () => {
      setMessages([]);
      utils.chat.history.invalidate();
    },
  });

  const sendMessage = useCallback((message: string, context?: string) => {
    if (!message.trim()) return;
    sendMutation.mutate({ message, context });
  }, [sendMutation]);

  const clearHistory = useCallback(() => {
    clearMutation.mutate();
  }, [clearMutation]);

  // Add a welcome message if no history
  useEffect(() => {
    if (history && history.length === 0 && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 1,
        from: 'twin',
        message: "Good morning! I'm your Digital Twin, ready to help you stay on top of everything.\n\nI can help you with:\n• **Email drafting** and inbox management\n• **Meeting preparation** and scheduling\n• **Task prioritization** and project updates\n• **Research** and analysis\n• **Daily briefings** and evening reviews\n\nWhat would you like to work on today?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([welcomeMessage]);
    }
  }, [history, messages.length]);

  return {
    messages,
    isTyping,
    sendMessage,
    clearHistory,
    isLoading: sendMutation.isPending,
    isClearingHistory: clearMutation.isPending,
  };
}
