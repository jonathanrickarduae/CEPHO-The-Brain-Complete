import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Brain, Clock, CheckCircle2, ArrowRight, X, Zap, Calendar, ListTodo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';

interface ReviewContext {
  pendingTasks: number;
  activeProjects: number;
  outstandingItems: number;
}

interface ChiefOfStaffNotificationProps {
  onClose?: () => void;
}

export function ChiefOfStaffNotification({ onClose }: ChiefOfStaffNotificationProps) {
  const [, setLocation] = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [autoStartCountdown, setAutoStartCountdown] = useState<number | null>(null);
  const [reviewContext, setReviewContext] = useState<ReviewContext | null>(null);

  // Fetch user settings for preferred review time
  const { data: userSettings } = trpc.settings.get.useQuery();
  
  // Fetch tasks to count pending items
  const { data: taskItems } = trpc.tasks.list.useQuery();
  
  // Fetch projects
  const { data: projects } = trpc.projects.list.useQuery();

  // Calculate review context
  useEffect(() => {
    if (taskItems && projects) {
      const pendingTasks = taskItems.filter(
        (item) => item.status !== 'completed' && item.status !== 'cancelled'
      ).length;
      
      const activeProjects = projects.filter(
        (p) => p.status === 'in_progress'
      ).length;
      
      const outstandingItems = taskItems.filter(
        (item) => item.status === 'blocked' || item.priority === 'high'
      ).length;

      setReviewContext({
        pendingTasks,
        activeProjects,
        outstandingItems,
      });
    }
  }, [taskItems, projects]);

  // Check if it's time to show the notification
  useEffect(() => {
    const checkTrigger = () => {
      if (isDismissed) return;
      
      const now = new Date();
      const currentHour = now.getHours();
      
      // Get user's preferred evening review time (default 7 PM / 19:00)
      const reviewTimeStr = userSettings?.eveningReviewTime || '19:00';
      const [reviewHour] = reviewTimeStr.split(':').map(Number);
      
      // Check if we're within the review window (review time to review time + 1 hour)
      const isInReviewWindow = currentHour >= reviewHour && currentHour < reviewHour + 1;
      
      // Only show if there are tasks to review
      const hasTasks = reviewContext && (reviewContext.pendingTasks > 0 || reviewContext.outstandingItems > 0);
      
      if (isInReviewWindow && hasTasks && !isVisible) {
        setIsVisible(true);
        // Set auto-start countdown (1 hour = 3600 seconds)
        setAutoStartCountdown(3600);
      }
    };

    // Check immediately
    checkTrigger();
    
    // Check every minute
    const interval = setInterval(checkTrigger, 60000);
    
    return () => clearInterval(interval);
  }, [userSettings, reviewContext, isDismissed, isVisible]);

  // Auto-start countdown
  useEffect(() => {
    if (autoStartCountdown === null || autoStartCountdown <= 0) return;

    const interval = setInterval(() => {
      setAutoStartCountdown(prev => {
        if (prev === null) return null;
        const newValue = prev - 1;
        if (newValue <= 0) {
          // Auto-start the evening review
          handleAutoStart();
          return null;
        }
        return newValue;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoStartCountdown]);

  const handleAccept = () => {
    setIsVisible(false);
    setAutoStartCountdown(null);
    onClose?.();
    setLocation('/evening-review');
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    onClose?.();
  };

  const handleDelegate = () => {
    setIsVisible(false);
    setAutoStartCountdown(null);
    onClose?.();
    setLocation('/evening-review?delegate=true');
  };

  const handleAutoStart = () => {
    setIsVisible(false);
    onClose?.();
    setLocation('/evening-review?autostart=true');
  };

  const formatCountdown = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatTime = (): string => {
    return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-2 border-indigo-400/50 shadow-2xl bg-gradient-to-br from-gray-900 to-gray-800">
        <CardContent className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Chief of Staff</h2>
                <p className="text-sm text-gray-400">Evening Review</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleDismiss}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Message */}
          <div className="space-y-3">
            <p className="text-gray-200">
              It's <span className="font-semibold text-indigo-400">{formatTime()}</span>. Ready to start your Evening Review?
            </p>
            
            {/* Context Stats */}
            {reviewContext && (
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-cyan-400 mb-1">
                    <ListTodo className="w-4 h-4" />
                  </div>
                  <div className="text-xl font-bold text-white">{reviewContext.pendingTasks}</div>
                  <div className="text-xs text-gray-400">Tasks</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-purple-400 mb-1">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="text-xl font-bold text-white">{reviewContext.activeProjects}</div>
                  <div className="text-xs text-gray-400">Projects</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="text-xl font-bold text-white">{reviewContext.outstandingItems}</div>
                  <div className="text-xs text-gray-400">Priority</div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button 
              onClick={handleAccept}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Yes, let's review
              <ArrowRight className="w-4 h-4" />
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleDelegate}
              className="w-full border-white/20 text-gray-300 hover:bg-white/5 gap-2"
            >
              <Brain className="w-4 h-4" />
              No, auto-process for me
            </Button>
          </div>

          {/* Auto-start warning */}
          {autoStartCountdown && (
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              <span>Auto-processing in {formatCountdown(autoStartCountdown)} if no action taken</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ChiefOfStaffNotification;
