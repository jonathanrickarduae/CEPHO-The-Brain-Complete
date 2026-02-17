import { useState, useCallback, useEffect, useRef } from 'react';
import { trpc } from '@/lib/trpc';

export interface ChatMessage {
  id: number;
  from: 'user' | 'twin';
  message: string;
  time: string;
  isStreaming?: boolean;
}

export function useDigitalTwinChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const streamingRef = useRef<boolean>(false);
  
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
        id: Date.now() + index,
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

  // Simulate streaming effect for a message
  const streamMessage = useCallback((fullMessage: string, messageId: number) => {
    streamingRef.current = true;
    setStreamingText('');
    
    const words = fullMessage.split(' ');
    let currentIndex = 0;
    
    const streamInterval = setInterval(() => {
      if (!streamingRef.current || currentIndex >= words.length) {
        clearInterval(streamInterval);
        streamingRef.current = false;
        
        // Replace streaming message with final message
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, message: fullMessage, isStreaming: false }
            : msg
        ));
        setStreamingText('');
        setIsTyping(false);
        return;
      }
      
      // Add next word(s) - vary speed for natural feel
      const wordsToAdd = Math.random() > 0.7 ? 2 : 1;
      const newWords = words.slice(currentIndex, currentIndex + wordsToAdd).join(' ');
      currentIndex += wordsToAdd;
      
      setStreamingText(prev => prev + (prev ? ' ' : '') + newWords);
      
      // Update the message in state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, message: words.slice(0, currentIndex).join(' ') }
          : msg
      ));
    }, 30 + Math.random() * 40); // Variable speed: 30-70ms per word chunk
    
    return () => {
      clearInterval(streamInterval);
      streamingRef.current = false;
    };
  }, []);

  // Send message mutation
  const sendMutation = trpc.chat.send.useMutation({
    onMutate: async ({ message }) => {
      // Optimistically add user message
      const userMessage: ChatMessage = {
        id: Date.now(),
        from: 'user',
        message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, userMessage]);
      setIsTyping(true);
    },
    onSuccess: (data) => {
      // Add assistant response with streaming
      const twinMessageId = Date.now() + 1;
      const twinMessage: ChatMessage = {
        id: twinMessageId,
        from: 'twin',
        message: '', // Start empty for streaming
        time: new Date(data.timestamp).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        isStreaming: true,
      };
      setMessages(prev => [...prev, twinMessage]);
      
      // Start streaming the response
      streamMessage(data.message, twinMessageId);
    },
    onError: (error) => {
      console.error('Chat error:', error);
      setIsTyping(false);
      // Add error message
      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
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

  // Stop streaming
  const stopStreaming = useCallback(() => {
    streamingRef.current = false;
  }, []);

  // Add a welcome message if no history
  useEffect(() => {
    if (history && history.length === 0 && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: Date.now(),
        from: 'twin',
        message: "Good morning! I'm your Chief of Staff, ready to help you stay on top of everything.\n\nI can help you with:\n• **Email drafting** and inbox management\n• **Meeting preparation** and scheduling\n• **Task prioritization** and project updates\n• **Research** and analysis\n• **Daily briefings** and evening reviews\n\nWhat would you like to work on today?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([welcomeMessage]);
    }
  }, [history, messages.length]);

  return {
    messages,
    isTyping,
    streamingText,
    sendMessage,
    clearHistory,
    stopStreaming,
    isLoading: sendMutation.isPending,
    isClearingHistory: clearMutation.isPending,
    isStreaming: streamingRef.current,
  };
}
