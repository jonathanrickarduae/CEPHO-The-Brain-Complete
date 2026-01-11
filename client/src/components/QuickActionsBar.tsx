import { useState, useEffect } from 'react';
import { Mic, Camera, CheckCircle2, Bell, X, MicOff, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVoiceInput, useVoiceWaveform } from '@/hooks/useVoiceInput';
import { haptics } from '@/lib/haptics';

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
  const [showTranscript, setShowTranscript] = useState(false);

  // Real voice input using Web Speech API
  const {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceInput({
    continuous: false,
    onResult: (text, isFinal) => {
      if (isFinal && text.trim()) {
        onVoiceInput?.(text);
        setShowTranscript(true);
        setTimeout(() => {
          setShowTranscript(false);
          resetTranscript();
        }, 3000);
      }
    },
    onStart: () => {
      haptics.tap();
    },
    onEnd: () => {
      haptics.success();
    },
    onError: () => {
      haptics.error();
    },
  });

  // Waveform visualization
  const { waveformData, startWaveform, stopWaveform } = useVoiceWaveform();

  // Sync waveform with listening state
  useEffect(() => {
    if (isListening) {
      startWaveform();
    } else {
      stopWaveform();
    }
  }, [isListening, startWaveform, stopWaveform]);

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const actions = [
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
      {/* Transcript display */}
      {(showTranscript || isListening) && (transcript || interimTranscript) && (
        <div className="absolute bottom-full mb-3 right-0 bg-card/95 backdrop-blur-xl rounded-xl px-4 py-3 shadow-lg border border-white/10 max-w-xs animate-in fade-in slide-in-from-bottom-2">
          <p className="text-sm text-foreground">
            {transcript}
            {interimTranscript && (
              <span className="text-muted-foreground">{interimTranscript}</span>
            )}
          </p>
          {isListening && (
            <div className="flex items-center gap-1 mt-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs text-muted-foreground">Listening...</span>
            </div>
          )}
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="absolute bottom-full mb-3 right-0 bg-destructive/90 backdrop-blur-xl rounded-xl px-4 py-2 shadow-lg max-w-xs animate-in fade-in">
          <p className="text-sm text-white flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        </div>
      )}

      {/* Waveform visualization */}
      {isListening && (
        <div className="absolute bottom-full mb-16 right-0 flex items-end justify-center gap-1 h-12 px-4">
          {waveformData.slice(0, 12).map((level, i) => (
            <div
              key={i}
              className="w-1.5 bg-primary rounded-full transition-all duration-75"
              style={{
                height: `${Math.max(8, level * 100)}%`,
                opacity: 0.5 + level * 0.5,
              }}
            />
          ))}
        </div>
      )}

      {/* Expanded Actions */}
      {isExpanded && !isListening && (
        <div className="flex flex-col gap-2 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => {
                haptics.tap();
                action.onClick?.();
                setIsExpanded(false);
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
          if (!isSupported) {
            // Show not supported message
            return;
          }
          if (isListening) {
            stopListening();
          } else if (isExpanded) {
            handleVoiceToggle();
            setIsExpanded(false);
          } else {
            setIsExpanded(true);
          }
        }}
        disabled={!isSupported}
        className={cn(
          'flex items-center justify-center w-14 h-14 rounded-full text-white shadow-lg transition-all duration-200',
          isListening
            ? 'bg-red-500 shadow-red-500/50 scale-110'
            : isSupported
              ? 'bg-primary hover:bg-primary/90 hover:scale-110 shadow-primary/40'
              : 'bg-muted cursor-not-allowed',
          isExpanded && !isListening && 'ring-2 ring-white/30'
        )}
        title={!isSupported ? 'Voice input not supported in this browser' : undefined}
      >
        {isListening ? (
          <div className="relative">
            <Mic className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping" />
          </div>
        ) : !isSupported ? (
          <MicOff className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
      </button>

      {/* Recording indicator */}
      {isListening && (
        <div className="absolute -top-2 right-0 bg-red-500 text-white text-xs px-3 py-1 rounded-full animate-pulse shadow-lg">
          Tap to stop
        </div>
      )}
    </div>
  );
}

// Floating Mic Button for mobile - simplified version with real voice input
export function FloatingMicButton({
  onTranscript,
  className,
}: {
  onTranscript: (transcript: string) => void;
  className?: string;
}) {
  const {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceInput({
    continuous: false,
    onResult: (text, isFinal) => {
      if (isFinal && text.trim()) {
        onTranscript(text);
        setTimeout(resetTranscript, 1000);
      }
    },
  });

  const handlePress = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <>
      {/* Transcript bubble */}
      {isListening && (transcript || interimTranscript) && (
        <div className="fixed z-50 right-4 bottom-40 bg-card/95 backdrop-blur-xl rounded-xl px-4 py-3 shadow-lg border border-white/10 max-w-xs animate-in fade-in">
          <p className="text-sm text-foreground">
            {transcript}
            <span className="text-muted-foreground">{interimTranscript}</span>
          </p>
        </div>
      )}

      <button
        onClick={handlePress}
        className={cn(
          'fixed z-50 flex items-center justify-center w-16 h-16 rounded-full text-white shadow-lg transition-all duration-200',
          'right-4 bottom-20',
          isListening
            ? 'bg-red-500 scale-110 shadow-red-500/50'
            : 'bg-primary hover:bg-primary/90 hover:scale-110 shadow-primary/40',
          className
        )}
        aria-label={isListening ? 'Stop recording' : 'Start voice input'}
      >
        {isListening ? (
          <div className="relative">
            <Mic className="w-7 h-7 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping" />
          </div>
        ) : (
          <Mic className="w-7 h-7" />
        )}
      </button>
    </>
  );
}
