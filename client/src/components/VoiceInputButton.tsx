import { useState, useEffect } from 'react';
import { Mic, MicOff, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useVoiceInput, useVoiceWaveform } from '@/hooks/useVoiceInput';

interface VoiceInputButtonProps {
  onTranscript: (transcript: string) => void;
  onListeningChange?: (isListening: boolean) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'floating' | 'minimal';
  showWaveform?: boolean;
  continuous?: boolean;
  placeholder?: string;
}

export function VoiceInputButton({
  onTranscript,
  onListeningChange,
  className,
  size = 'md',
  variant = 'default',
  showWaveform = true,
  continuous = false,
  placeholder = 'Tap to speak...',
}: VoiceInputButtonProps) {
  const [showError, setShowError] = useState(false);

  const {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    error,
    confidence,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript,
  } = useVoiceInput({
    continuous,
    onResult: (text, isFinal) => {
      if (isFinal) {
        onTranscript(text);
      }
    },
    onError: () => {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    },
  });

  const { audioLevel, waveformData, startWaveform, stopWaveform } = useVoiceWaveform();

  // Sync waveform with listening state
  useEffect(() => {
    if (isListening && showWaveform) {
      startWaveform();
    } else {
      stopWaveform();
    }
  }, [isListening, showWaveform, startWaveform, stopWaveform]);

  // Notify parent of listening state changes
  useEffect(() => {
    onListeningChange?.(isListening);
  }, [isListening, onListeningChange]);

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  if (!isSupported) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn(sizeClasses[size], 'opacity-50 cursor-not-allowed', className)}
        disabled
        title="Voice input not supported in this browser"
      >
        <MicOff className={iconSizes[size]} />
      </Button>
    );
  }

  if (variant === 'floating') {
    return (
      <div className={cn('relative', className)}>
        {/* Waveform visualization */}
        {isListening && showWaveform && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-0.5 h-full">
              {waveformData.map((level, i) => (
                <div
                  key={i}
                  className="w-1 bg-primary rounded-full transition-all duration-75"
                  style={{
                    height: `${Math.max(4, level * 100)}%`,
                    opacity: 0.3 + level * 0.7,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Main button */}
        <button
          onClick={toggleListening}
          className={cn(
            'relative z-10 rounded-full flex items-center justify-center transition-all',
            sizeClasses[size],
            isListening
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-110'
              : 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:scale-105',
            showError && 'bg-destructive'
          )}
        >
          {isListening ? (
            <div className="relative">
              <Mic className={cn(iconSizes[size], 'animate-pulse')} />
              {/* Pulsing ring */}
              <div className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
            </div>
          ) : showError ? (
            <AlertCircle className={iconSizes[size]} />
          ) : (
            <Mic className={iconSizes[size]} />
          )}
        </button>

        {/* Transcript preview */}
        {isListening && (interimTranscript || transcript) && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-card/95 backdrop-blur-xl rounded-lg px-3 py-2 shadow-lg border border-white/10 max-w-xs">
            <p className="text-sm text-foreground">
              {interimTranscript || transcript}
            </p>
            {confidence > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Confidence: {Math.round(confidence * 100)}%
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <button
        onClick={toggleListening}
        className={cn(
          'p-2 rounded-lg transition-all',
          isListening
            ? 'text-red-500 bg-red-500/10'
            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
          className
        )}
        title={isListening ? 'Stop listening' : 'Start voice input'}
      >
        <Mic className={cn(iconSizes[size], isListening && 'animate-pulse')} />
      </button>
    );
  }

  // Default variant
  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      {/* Waveform */}
      {isListening && showWaveform && (
        <div className="flex items-end justify-center gap-1 h-8">
          {waveformData.slice(0, 10).map((level, i) => (
            <div
              key={i}
              className="w-1.5 bg-primary rounded-full transition-all duration-75"
              style={{
                height: `${Math.max(8, level * 100)}%`,
              }}
            />
          ))}
        </div>
      )}

      {/* Button */}
      <Button
        onClick={toggleListening}
        variant={isListening ? 'destructive' : 'default'}
        size={size === 'lg' ? 'lg' : 'default'}
        className={cn(
          'gap-2',
          isListening && 'animate-pulse'
        )}
      >
        <Mic className={iconSizes[size]} />
        {isListening ? 'Listening...' : placeholder}
      </Button>

      {/* Error message */}
      {showError && error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}

      {/* Transcript */}
      {(transcript || interimTranscript) && (
        <div className="text-sm text-muted-foreground max-w-xs text-center">
          <span className="text-foreground">{transcript}</span>
          {interimTranscript && (
            <span className="text-muted-foreground/60">{interimTranscript}</span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Voice input field - combines text input with voice
 */
interface VoiceInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function VoiceInputField({
  value,
  onChange,
  onSubmit,
  placeholder = 'Type or speak...',
  className,
  disabled,
}: VoiceInputFieldProps) {
  const [isListening, setIsListening] = useState(false);

  const handleTranscript = (transcript: string) => {
    onChange(value + (value ? ' ' : '') + transcript);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit?.(value);
    }
  };

  return (
    <div className={cn(
      'flex items-center gap-2 rounded-xl border border-white/10 bg-secondary/30 px-4 py-2',
      isListening && 'border-primary/50 bg-primary/5',
      className
    )}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled || isListening}
        className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
      
      <VoiceInputButton
        onTranscript={handleTranscript}
        onListeningChange={setIsListening}
        variant="minimal"
        size="sm"
        showWaveform={false}
      />
    </div>
  );
}
