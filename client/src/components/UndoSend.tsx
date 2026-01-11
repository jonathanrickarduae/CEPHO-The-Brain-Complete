import { useState, useEffect, useCallback } from 'react';
import { X, Send, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface PendingMessage {
  id: string;
  type: 'email' | 'message' | 'notification';
  recipient: string;
  subject?: string;
  content: string;
  scheduledAt: Date;
  delaySeconds: number;
  status: 'pending' | 'sending' | 'sent' | 'cancelled';
}

interface UndoSendProps {
  message: PendingMessage;
  onCancel: (id: string) => void;
  onSent: (id: string) => void;
}

export function UndoSendToast({ message, onCancel, onSent }: UndoSendProps) {
  const [progress, setProgress] = useState(100);
  const [timeLeft, setTimeLeft] = useState(message.delaySeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onSent(message.id);
          return 0;
        }
        return prev - 1;
      });
      setProgress((prev) => {
        const decrement = 100 / message.delaySeconds;
        return Math.max(0, prev - decrement);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [message.id, message.delaySeconds, onSent]);

  const handleCancel = () => {
    onCancel(message.id);
    toast.success('Message cancelled');
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg shadow-lg min-w-[300px]">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Send className="w-4 h-4 text-primary" />
          <span className="font-medium text-foreground">Sending {message.type}...</span>
        </div>
        <div className="text-sm text-muted-foreground truncate">
          To: {message.recipient}
        </div>
        <Progress value={progress} className="h-1 mt-2" />
        <div className="text-xs text-muted-foreground mt-1">
          {timeLeft}s remaining
        </div>
      </div>
      <Button 
        variant="destructive" 
        size="sm" 
        onClick={handleCancel}
        className="shrink-0"
      >
        <X className="w-4 h-4 mr-1" />
        Undo
      </Button>
    </div>
  );
}

// Hook for managing undo send functionality
export function useUndoSend(defaultDelay: number = 5) {
  const [pendingMessages, setPendingMessages] = useState<PendingMessage[]>([]);
  const [sendDelay, setSendDelay] = useState(defaultDelay);

  const queueMessage = useCallback((
    type: PendingMessage['type'],
    recipient: string,
    content: string,
    subject?: string
  ): string => {
    const id = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const message: PendingMessage = {
      id,
      type,
      recipient,
      subject,
      content,
      scheduledAt: new Date(),
      delaySeconds: sendDelay,
      status: 'pending'
    };

    setPendingMessages(prev => [...prev, message]);
    return id;
  }, [sendDelay]);

  const cancelMessage = useCallback((id: string) => {
    setPendingMessages(prev => 
      prev.map(msg => 
        msg.id === id ? { ...msg, status: 'cancelled' as const } : msg
      ).filter(msg => msg.status !== 'cancelled')
    );
  }, []);

  const markSent = useCallback((id: string) => {
    setPendingMessages(prev => 
      prev.map(msg => 
        msg.id === id ? { ...msg, status: 'sent' as const } : msg
      ).filter(msg => msg.status !== 'sent')
    );
    toast.success('Message sent successfully');
  }, []);

  const cancelAll = useCallback(() => {
    setPendingMessages([]);
    toast.success('All pending messages cancelled');
  }, []);

  return {
    pendingMessages: pendingMessages.filter(m => m.status === 'pending'),
    queueMessage,
    cancelMessage,
    markSent,
    cancelAll,
    sendDelay,
    setSendDelay
  };
}

// Settings component for configuring undo send delay
interface UndoSendSettingsProps {
  delay: number;
  onDelayChange: (delay: number) => void;
}

export function UndoSendSettings({ delay, onDelayChange }: UndoSendSettingsProps) {
  const delayOptions = [
    { value: 0, label: 'Off' },
    { value: 5, label: '5 seconds' },
    { value: 10, label: '10 seconds' },
    { value: 20, label: '20 seconds' },
    { value: 30, label: '30 seconds' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-foreground">Undo Send</h4>
          <p className="text-sm text-muted-foreground">
            Set a delay before messages are sent, allowing you to cancel
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        {delayOptions.map((option) => (
          <Button
            key={option.value}
            variant={delay === option.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onDelayChange(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

// Pending messages queue display
interface PendingMessagesQueueProps {
  messages: PendingMessage[];
  onCancel: (id: string) => void;
  onSent: (id: string) => void;
}

export function PendingMessagesQueue({ messages, onCancel, onSent }: PendingMessagesQueueProps) {
  if (messages.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {messages.map((message) => (
        <UndoSendToast
          key={message.id}
          message={message}
          onCancel={onCancel}
          onSent={onSent}
        />
      ))}
    </div>
  );
}

export default UndoSendToast;
