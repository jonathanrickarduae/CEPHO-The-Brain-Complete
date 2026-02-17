import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, X, Loader2 } from 'lucide-react';

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

interface VoiceCommand {
  transcript: string;
  confidence: number;
  timestamp: Date;
}

export function VoiceInterface({ 
  onCommand,
  isEnabled = true 
}: { 
  onCommand?: (command: string) => void;
  isEnabled?: boolean;
}) {
  const [state, setState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [recentCommands, setRecentCommands] = useState<VoiceCommand[]>([]);
  const [isMuted, setIsMuted] = useState(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-GB';

      recognitionRef.current.onresult = (event: any) => {
        const result = event.results[event.results.length - 1];
        const text = result[0].transcript;
        setTranscript(text);

        if (result.isFinal) {
          handleCommand(text, result[0].confidence);
        }
      };

      recognitionRef.current.onend = () => {
        setState('idle');
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setState('idle');
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const handleCommand = (text: string, confidence: number) => {
    setState('processing');
    
    const command: VoiceCommand = {
      transcript: text,
      confidence,
      timestamp: new Date()
    };
    
    setRecentCommands(prev => [command, ...prev].slice(0, 5));
    
    // Process command
    setTimeout(() => {
      onCommand?.(text);
      setState('idle');
      setTranscript('');
    }, 500);
  };

  const startListening = () => {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.start();
      setState('listening');
      setTranscript('');
      setIsExpanded(true);
    } catch (error) {
      console.error('Failed to start recognition:', error);
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    
    recognitionRef.current.stop();
    setState('idle');
  };

  const toggleListening = () => {
    if (state === 'listening') {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isEnabled) return null;

  return (
    <>
      {/* Floating Voice Button */}
      <button
        onClick={toggleListening}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg transition-all z-40 flex items-center justify-center ${
          state === 'listening'
            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
            : state === 'processing'
            ? 'bg-yellow-500'
            : 'bg-primary hover:bg-primary/90'
        }`}
      >
        {state === 'listening' ? (
          <Mic className="w-6 h-6 text-white" />
        ) : state === 'processing' ? (
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        ) : (
          <Mic className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Expanded Voice Panel */}
      {isExpanded && (
        <div className="fixed bottom-24 right-6 w-80 bg-card border border-border rounded-2xl shadow-2xl z-40 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                state === 'listening' ? 'bg-red-500 animate-pulse' :
                state === 'processing' ? 'bg-yellow-500' :
                'bg-green-500'
              }`} />
              <span className="text-sm font-medium text-foreground">
                {state === 'listening' ? 'Listening...' :
                 state === 'processing' ? 'Processing...' :
                 'Voice Ready'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Transcript */}
          <div className="p-4">
            {state === 'listening' && (
              <div className="mb-4">
                <div className="flex justify-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-primary rounded-full animate-pulse"
                      style={{
                        height: `${Math.random() * 24 + 8}px`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    />
                  ))}
                </div>
                <p className="text-center text-foreground">
                  {transcript || 'Speak now...'}
                </p>
              </div>
            )}

            {/* Quick Commands */}
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-2">Quick commands</p>
              <div className="flex flex-wrap gap-1">
                {[
                  'Show dashboard',
                  'New task',
                  'Check calendar',
                  'Open inbox'
                ].map(cmd => (
                  <button
                    key={cmd}
                    onClick={() => handleCommand(cmd, 1)}
                    className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs text-foreground transition-colors"
                  >
                    {cmd}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Commands */}
            {recentCommands.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Recent</p>
                <div className="space-y-1">
                  {recentCommands.slice(0, 3).map((cmd, i) => (
                    <div
                      key={i}
                      className="px-2 py-1.5 bg-gray-800/50 rounded text-xs text-muted-foreground"
                    >
                      "{cmd.transcript}"
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-800/50 text-center">
            <p className="text-xs text-muted-foreground">
              Press and hold <kbd className="px-1 py-0.5 bg-gray-700 rounded text-[10px]">Space</kbd> to talk
            </p>
          </div>
        </div>
      )}
    </>
  );
}

// Hook for keyboard shortcut
export function useVoiceShortcut(onActivate: () => void) {
  useEffect(() => {
    let isHolding = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body && !isHolding) {
        isHolding = true;
        onActivate();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isHolding = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onActivate]);
}
