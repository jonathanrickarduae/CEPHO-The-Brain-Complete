import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  CheckCircle2, 
  Loader2, 
  Bell,
  ArrowRight,
  Pause,
  Play
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface NextItemReadyProps {
  itemName: string;
  estimatedMinutes: number;
  onReady?: () => void;
  onSkip?: () => void;
  autoStart?: boolean;
  showNotification?: boolean;
}

export function NextItemReady({ 
  itemName, 
  estimatedMinutes, 
  onReady, 
  onSkip,
  autoStart = true,
  showNotification = true
}: NextItemReadyProps) {
  const [timeRemaining, setTimeRemaining] = useState(estimatedMinutes * 60);
  const [isPaused, setIsPaused] = useState(!autoStart);
  const [isComplete, setIsComplete] = useState(false);

  const totalSeconds = estimatedMinutes * 60;
  const progress = ((totalSeconds - timeRemaining) / totalSeconds) * 100;

  useEffect(() => {
    if (isPaused || isComplete) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setIsComplete(true);
          if (showNotification) {
            toast.success(`${itemName} is ready for review!`, {
              action: {
                label: 'View',
                onClick: () => onReady?.()
              }
            });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, isComplete, itemName, showNotification, onReady]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isComplete) {
    return (
      <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
        <CheckCircle2 className="w-5 h-5 text-green-400" />
        <div className="flex-1">
          <p className="text-sm font-medium text-green-400">{itemName} is ready!</p>
          <p className="text-xs text-muted-foreground">Click to review</p>
        </div>
        <Button size="sm" onClick={onReady} className="bg-green-500 hover:bg-green-600">
          Review Now
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    );
  }

  return (
    <div className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg space-y-3">
      <div className="flex items-center gap-3">
        {isPaused ? (
          <Pause className="w-5 h-5 text-amber-400" />
        ) : (
          <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
        )}
        <div className="flex-1">
          <p className="text-sm font-medium text-white">Next: {itemName}</p>
          <p className="text-xs text-muted-foreground">
            {isPaused ? 'Paused' : 'Processing...'}
          </p>
        </div>
        <Badge variant="outline" className="font-mono">
          <Clock className="w-3 h-3 mr-1" />
          {formatTime(timeRemaining)}
        </Badge>
      </div>
      
      <Progress value={progress} className="h-1.5" />
      
      <div className="flex gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => setIsPaused(!isPaused)}
          className="flex-1"
        >
          {isPaused ? (
            <>
              <Play className="w-4 h-4 mr-1" />
              Resume
            </>
          ) : (
            <>
              <Pause className="w-4 h-4 mr-1" />
              Pause
            </>
          )}
        </Button>
        {onSkip && (
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={onSkip}
            className="text-muted-foreground"
          >
            Skip
          </Button>
        )}
      </div>
    </div>
  );
}

// Queue component for multiple items
interface QueueItem {
  id: string;
  name: string;
  estimatedMinutes: number;
  status: 'pending' | 'processing' | 'complete';
}

interface ReviewQueueProps {
  items: QueueItem[];
  onItemReady?: (item: QueueItem) => void;
}

export function ReviewQueue({ items, onItemReady }: ReviewQueueProps) {
  const [queue, setQueue] = useState(items);
  const currentItem = queue.find(i => i.status === 'processing');
  const pendingItems = queue.filter(i => i.status === 'pending');
  const completedItems = queue.filter(i => i.status === 'complete');

  const handleItemComplete = (itemId: string) => {
    setQueue(prev => {
      const updated = prev.map(item => 
        item.id === itemId ? { ...item, status: 'complete' as const } : item
      );
      
      // Start next pending item
      const nextPending = updated.find(i => i.status === 'pending');
      if (nextPending) {
        return updated.map(item =>
          item.id === nextPending.id ? { ...item, status: 'processing' as const } : item
        );
      }
      
      return updated;
    });
    
    const item = queue.find(i => i.id === itemId);
    if (item) onItemReady?.(item);
  };

  return (
    <div className="space-y-4">
      {/* Current Processing */}
      {currentItem && (
        <NextItemReady
          itemName={currentItem.name}
          estimatedMinutes={currentItem.estimatedMinutes}
          onReady={() => handleItemComplete(currentItem.id)}
        />
      )}

      {/* Queue Summary */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <Loader2 className="w-4 h-4 text-cyan-400" />
          <span className="text-muted-foreground">Processing: {currentItem ? 1 : 0}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4 text-amber-400" />
          <span className="text-muted-foreground">Pending: {pendingItems.length}</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          <span className="text-muted-foreground">Complete: {completedItems.length}</span>
        </div>
      </div>

      {/* Pending Items Preview */}
      {pendingItems.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Up Next</p>
          {pendingItems.slice(0, 3).map((item, index) => (
            <div 
              key={item.id}
              className="flex items-center gap-2 p-2 bg-gray-800/30 rounded-lg text-sm"
            >
              <span className="text-muted-foreground">{index + 1}.</span>
              <span className="text-white">{item.name}</span>
              <span className="text-xs text-muted-foreground ml-auto">~{item.estimatedMinutes} min</span>
            </div>
          ))}
          {pendingItems.length > 3 && (
            <p className="text-xs text-muted-foreground">+{pendingItems.length - 3} more items</p>
          )}
        </div>
      )}
    </div>
  );
}

export default NextItemReady;
