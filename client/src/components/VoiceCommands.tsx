import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'wouter';
import { 
  Mic, MicOff, Volume2, VolumeX, Settings2, 
  CheckCircle2, AlertCircle, Loader2, Sparkles,
  Navigation, Brain, Calendar, FileText, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useVoiceInput } from '@/hooks/useVoiceInput';

interface VoiceCommand {
  patterns: string[];
  action: (transcript: string, params?: Record<string, string>) => void;
  description: string;
  category: 'navigation' | 'action' | 'query' | 'control';
}

interface VoiceCommandsProps {
  onCommand?: (command: string, result: string) => void;
  className?: string;
}

export function VoiceCommands({ onCommand, className }: VoiceCommandsProps) {
  const [, setLocation] = useLocation();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [isHandsFree, setIsHandsFree] = useState(false);
  const [wakeWordDetected, setWakeWordDetected] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const { 
    isListening: voiceIsListening, 
    transcript, 
    startListening, 
    stopListening,
    isSupported,
    error 
  } = useVoiceInput();

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Speak text aloud
  const speak = useCallback((text: string) => {
    if (!synthRef.current) return;
    
    // Cancel any ongoing speech
    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      // Resume listening in hands-free mode
      if (isHandsFree) {
        setTimeout(() => startListening(), 500);
      }
    };
    
    synthRef.current.speak(utterance);
  }, [isHandsFree, startListening]);

  // Define voice commands
  const commands: VoiceCommand[] = [
    // Navigation commands
    {
      patterns: ['go to dashboard', 'open dashboard', 'show dashboard'],
      action: () => { setLocation('/dashboard'); speak('Opening dashboard'); },
      description: 'Navigate to dashboard',
      category: 'navigation',
    },
    {
      patterns: ['go to daily brief', 'open daily brief', 'show my brief'],
      action: () => { setLocation('/daily-brief'); speak('Opening your daily brief'); },
      description: 'Navigate to daily brief',
      category: 'navigation',
    },
    {
      patterns: ['go to chief of staff', 'open chief of staff', 'talk to twin'],
      action: () => { setLocation('/digital-twin'); speak('Opening Chief of Staff'); },
      description: 'Navigate to Chief of Staff',
      category: 'navigation',
    },
    {
      patterns: ['go to experts', 'open ai experts', 'show experts'],
      action: () => { setLocation('/ai-experts'); speak('Opening AI Experts'); },
      description: 'Navigate to AI Experts',
      category: 'navigation',
    },
    {
      patterns: ['go to workflow', 'open workflow', 'show tasks'],
      action: () => { setLocation('/workflow'); speak('Opening workflow'); },
      description: 'Navigate to workflow',
      category: 'navigation',
    },
    {
      patterns: ['go to statistics', 'open statistics', 'show stats'],
      action: () => { setLocation('/statistics'); speak('Opening statistics'); },
      description: 'Navigate to statistics',
      category: 'navigation',
    },

    // Action commands
    {
      patterns: ['create task', 'new task', 'add task'],
      action: (transcript) => {
        const taskMatch = transcript.match(/(?:create|new|add) task (?:called |named |titled )?(.+)/i);
        const taskName = taskMatch?.[1] || 'New task';
        speak(`Creating task: ${taskName}`);
        setLocation('/workflow?action=new-task&name=' + encodeURIComponent(taskName));
      },
      description: 'Create a new task',
      category: 'action',
    },
    {
      patterns: ['draft email', 'write email', 'compose email'],
      action: (transcript) => {
        const toMatch = transcript.match(/(?:to|for) (.+)/i);
        const recipient = toMatch?.[1] || '';
        speak(`Opening email draft${recipient ? ` to ${recipient}` : ''}`);
        setLocation('/digital-twin?message=' + encodeURIComponent(`Help me draft an email${recipient ? ` to ${recipient}` : ''}`));
      },
      description: 'Draft an email',
      category: 'action',
    },
    {
      patterns: ['schedule meeting', 'book meeting', 'set up meeting'],
      action: (transcript) => {
        speak('Opening meeting scheduler');
        setLocation('/digital-twin?message=' + encodeURIComponent('Help me schedule a meeting'));
      },
      description: 'Schedule a meeting',
      category: 'action',
    },
    {
      patterns: ['start focus', 'focus mode', 'do not disturb'],
      action: () => {
        speak('Starting focus mode for 25 minutes');
        // Could integrate with actual focus mode
      },
      description: 'Start focus session',
      category: 'action',
    },

    // Query commands
    {
      patterns: ['what\'s on my schedule', 'what do i have today', 'my calendar'],
      action: () => {
        speak('Let me check your schedule');
        setLocation('/daily-brief');
      },
      description: 'Check schedule',
      category: 'query',
    },
    {
      patterns: ['how am i doing', 'my progress', 'productivity score'],
      action: () => {
        speak('Opening your statistics');
        setLocation('/statistics');
      },
      description: 'Check progress',
      category: 'query',
    },

    // Control commands
    {
      patterns: ['stop listening', 'stop', 'cancel'],
      action: () => {
        speak('Stopping');
        setIsListening(false);
        stopListening();
      },
      description: 'Stop voice commands',
      category: 'control',
    },
    {
      patterns: ['hands free mode', 'enable hands free', 'always listen'],
      action: () => {
        setIsHandsFree(true);
        speak('Hands-free mode enabled. Say "Hey Brain" to activate.');
      },
      description: 'Enable hands-free mode',
      category: 'control',
    },
    {
      patterns: ['disable hands free', 'stop hands free'],
      action: () => {
        setIsHandsFree(false);
        speak('Hands-free mode disabled');
      },
      description: 'Disable hands-free mode',
      category: 'control',
    },
  ];

  // Process transcript and match commands
  const processCommand = useCallback((text: string) => {
    const lowerText = text.toLowerCase().trim();
    
    // Check for wake word in hands-free mode
    if (isHandsFree && !wakeWordDetected) {
      if (lowerText.includes('hey brain') || lowerText.includes('okay brain')) {
        setWakeWordDetected(true);
        speak('Yes?');
        return;
      }
      return;
    }

    // Reset wake word after processing
    if (isHandsFree) {
      setWakeWordDetected(false);
    }

    // Find matching command
    for (const command of commands) {
      for (const pattern of command.patterns) {
        if (lowerText.includes(pattern)) {
          setLastCommand(text);
          command.action(text);
          setLastResult(`Executed: ${command.description}`);
          onCommand?.(text, command.description);
          return;
        }
      }
    }

    // No command matched - send to Chief of Staff
    setLastCommand(text);
    setLastResult('Sending to Chief of Staff...');
    speak('Let me help you with that');
    setLocation('/digital-twin?message=' + encodeURIComponent(text));
    onCommand?.(text, 'Sent to Chief of Staff');
  }, [commands, isHandsFree, wakeWordDetected, speak, setLocation, onCommand]);

  // Watch for transcript changes
  useEffect(() => {
    if (transcript && isListening) {
      processCommand(transcript);
    }
  }, [transcript, isListening, processCommand]);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
      setIsListening(false);
    } else {
      startListening();
      setIsListening(true);
    }
  }, [isListening, startListening, stopListening]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  }, []);

  if (!isSupported) {
    return (
      <div className={cn('p-4 bg-red-500/10 border border-red-500/20 rounded-lg', className)}>
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span>Voice commands not supported in this browser</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-card/60 border border-white/10 rounded-xl overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-r from-pink-500/10 to-rose-500/10">
        <div className="flex items-center gap-2">
          <Mic className="w-5 h-5 text-pink-400" />
          <h3 className="font-medium text-foreground">Voice Commands</h3>
        </div>
        <div className="flex items-center gap-2">
          {isHandsFree && (
            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs animate-pulse">
              Hands-Free
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsHandsFree(!isHandsFree)}
            className="text-xs"
          >
            <Settings2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Main Control */}
      <div className="p-6 flex flex-col items-center">
        {/* Mic Button */}
        <button
          onClick={toggleListening}
          className={cn(
            'w-24 h-24 rounded-full flex items-center justify-center transition-all',
            isListening
              ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/50 animate-pulse'
              : 'bg-secondary hover:bg-secondary/80 text-muted-foreground'
          )}
        >
          {isListening ? (
            <Mic className="w-10 h-10" />
          ) : (
            <MicOff className="w-10 h-10" />
          )}
        </button>

        {/* Status */}
        <div className="mt-4 text-center">
          {isListening ? (
            <div className="flex items-center gap-2 text-pink-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Listening...</span>
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">
              {isHandsFree ? 'Say "Hey Brain" to activate' : 'Click to speak'}
            </span>
          )}
        </div>

        {/* Transcript */}
        {transcript && (
          <div className="mt-4 p-3 bg-secondary/30 rounded-lg w-full max-w-sm">
            <div className="text-xs text-muted-foreground mb-1">You said:</div>
            <div className="text-sm text-foreground">{transcript}</div>
          </div>
        )}

        {/* Last Result */}
        {lastResult && (
          <div className="mt-2 flex items-center gap-2 text-xs text-green-400">
            <CheckCircle2 className="w-3 h-3" />
            {lastResult}
          </div>
        )}

        {/* Speaking Indicator */}
        {isSpeaking && (
          <div className="mt-4 flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-pink-400 animate-pulse" />
            <span className="text-sm text-muted-foreground">Speaking...</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={stopSpeaking}
              className="h-6 px-2"
            >
              <VolumeX className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Quick Commands */}
      <div className="px-4 pb-4">
        <div className="text-xs text-muted-foreground mb-2">Try saying:</div>
        <div className="flex flex-wrap gap-2">
          {[
            { text: 'Go to dashboard', icon: Navigation },
            { text: 'Ask my twin', icon: Brain },
            { text: 'Create task', icon: CheckCircle2 },
            { text: 'Draft email', icon: FileText },
          ].map(cmd => (
            <button
              key={cmd.text}
              onClick={() => processCommand(cmd.text)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/30 hover:bg-secondary/50 rounded-full text-xs text-muted-foreground transition-colors"
            >
              <cmd.icon className="w-3 h-3" />
              {cmd.text}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 pb-4">
          <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
            {error}
          </div>
        </div>
      )}
    </div>
  );
}

// Floating voice button for global access
export function FloatingVoiceButton() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isListening, startListening, stopListening, isSupported } = useVoiceInput();

  if (!isSupported) return null;

  return (
    <div className="fixed bottom-24 right-4 z-40">
      {isExpanded && (
        <div className="absolute bottom-16 right-0 w-80">
          <VoiceCommands className="shadow-xl" />
        </div>
      )}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all',
          isListening
            ? 'bg-pink-500 text-white animate-pulse'
            : 'bg-card border border-white/10 text-muted-foreground hover:text-foreground'
        )}
      >
        {isListening ? (
          <Mic className="w-6 h-6" />
        ) : (
          <MicOff className="w-6 h-6" />
        )}
      </button>
    </div>
  );
}
