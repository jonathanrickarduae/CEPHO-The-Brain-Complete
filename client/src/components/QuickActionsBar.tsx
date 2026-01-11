import { useState, useEffect } from 'react';
import { Mic, Camera, CheckCircle2, Bell, X, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuickActionsBarProps {
  onVoiceInput?: (transcript: string) => void;
  onCapture?: () => void;
  onComplete?: () => void;
  onReminder?: () => void;
  className?: string;
  position?: 'bottom-right' | 'bottom-center';
}

export function QuickActionsBar({
  onVoiceInput,
  onCapture,
  onComplete,
  onReminder,
  className,
  position = 'bottom-right',
}: QuickActionsBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');

  // Voice recording state
  const startRecording = async () => {
    setIsRecording(true);
    // Web Speech API implementation would go here
    // For now, simulate recording
    setTimeout(() => {
      setIsRecording(false);
      const mockTranscript = "Sample voice input captured";
      setTranscript(mockTranscript);
      onVoiceInput?.(mockTranscript);
    }, 2000);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const actions = [
    {
      id: 'voice',
      icon: isRecording ? MicOff : Mic,
      label: isRecording ? 'Stop' : 'Voice',
      color: isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90',
      onClick: isRecording ? stopRecording : startRecording,
    },
    {
      id: 'capture',
      icon: Camera,
      label: 'Capture',
      color: 'bg-cyan-500 hover:bg-cyan-600',
      onClick: onCapture,
    },
    {
      id: 'complete',
      icon: CheckCircle2,
      label: 'Complete',
      color: 'bg-green-500 hover:bg-green-600',
      onClick: onComplete,
    },
    {
      id: 'reminder',
      icon: Bell,
      label: 'Remind',
      color: 'bg-amber-500 hover:bg-amber-600',
      onClick: onReminder,
    },
  ];

  // Close expanded menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.quick-actions-container')) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isExpanded]);

  const positionClasses = {
    'bottom-right': 'right-4 bottom-20 md:bottom-6',
    'bottom-center': 'left-1/2 -translate-x-1/2 bottom-20 md:bottom-6',
  };

  return (
    <div
      className={cn(
        'quick-actions-container fixed z-50 flex flex-col items-end gap-2',
        positionClasses[position],
        className
      )}
    >
      {/* Expanded Actions */}
      {isExpanded && (
        <div className="flex flex-col gap-2 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {actions.slice(1).map((action) => (
            <button
              key={action.id}
              onClick={() => {
                action.onClick?.();
                if (action.id !== 'voice') setIsExpanded(false);
              }}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-medium shadow-lg transition-all duration-200 hover:scale-105',
                action.color
              )}
            >
              <action.icon className="w-4 h-4" />
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main FAB - Voice Button */}
      <button
        onClick={() => {
          if (isRecording) {
            stopRecording();
          } else if (isExpanded) {
            startRecording();
          } else {
            setIsExpanded(true);
          }
        }}
        className={cn(
          'flex items-center justify-center w-14 h-14 rounded-full text-white shadow-lg transition-all duration-200',
          isRecording
            ? 'bg-red-500 animate-pulse shadow-red-500/50'
            : 'bg-primary hover:bg-primary/90 hover:scale-110 shadow-primary/40',
          isExpanded && !isRecording && 'ring-2 ring-white/30'
        )}
      >
        {isRecording ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : isExpanded ? (
          <Mic className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
      </button>

      {/* Recording indicator */}
      {isRecording && (
        <div className="absolute -top-8 right-0 bg-red-500 text-white text-xs px-3 py-1 rounded-full animate-pulse">
          Recording...
        </div>
      )}
    </div>
  );
}

// Floating Mic Button for mobile - simplified version
export function FloatingMicButton({
  onPress,
  isRecording = false,
  className,
}: {
  onPress: () => void;
  isRecording?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onPress}
      className={cn(
        'fixed z-50 flex items-center justify-center w-16 h-16 rounded-full text-white shadow-lg transition-all duration-200',
        'right-4 bottom-20',
        isRecording
          ? 'bg-red-500 animate-pulse shadow-red-500/50'
          : 'bg-primary hover:bg-primary/90 hover:scale-110 shadow-primary/40',
        className
      )}
      aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
    >
      {isRecording ? (
        <div className="relative">
          <Mic className="w-7 h-7" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping" />
        </div>
      ) : (
        <Mic className="w-7 h-7" />
      )}
    </button>
  );
}
