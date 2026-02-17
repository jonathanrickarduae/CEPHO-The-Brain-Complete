import { useState, useCallback, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceSettings {
  enabled: boolean;
  autoListen: boolean;
  speakResponses: boolean;
  wakeWord: string;
  language: string;
  voiceSpeed: number;
}

// Hook for voice interface
export function useVoiceInterface() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [settings, setSettings] = useState<VoiceSettings>(() => {
    const stored = localStorage.getItem('brain_voice_settings');
    return stored ? JSON.parse(stored) : {
      enabled: false,
      autoListen: false,
      speakResponses: true,
      wakeWord: 'Hey Brain',
      language: 'en-GB',
      voiceSpeed: 1.0
    };
  });

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    localStorage.setItem('brain_voice_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    // Initialize speech synthesis
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }

    // Initialize speech recognition
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = settings.language;

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const result = event.results[current];
        setTranscript(result[0].transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [settings.language]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && settings.enabled) {
      setTranscript('');
      setIsListening(true);
      recognitionRef.current.start();
    }
  }, [settings.enabled]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (synthRef.current && settings.speakResponses) {
      // Cancel any ongoing speech
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = settings.voiceSpeed;
      utterance.lang = settings.language;
      
      // Try to find a British English voice
      const voices = synthRef.current.getVoices();
      const britishVoice = voices.find(v => v.lang === 'en-GB');
      if (britishVoice) {
        utterance.voice = britishVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);

      synthRef.current.speak(utterance);
    }
  }, [settings.speakResponses, settings.voiceSpeed, settings.language]);

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const updateSettings = useCallback((updates: Partial<VoiceSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    isListening,
    isSpeaking,
    transcript,
    settings,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    updateSettings
  };
}

// Voice toggle component for Dashboard
export function VoiceInterfaceToggle() {
  const { 
    isListening, 
    isSpeaking, 
    settings, 
    startListening, 
    stopListening, 
    stopSpeaking,
    updateSettings 
  } = useVoiceInterface();
  const [showSettings, setShowSettings] = useState(false);

  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-lg text-foreground/60 text-sm">
        <MicOff className="w-4 h-4" />
        <span>Voice not supported</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg">
        {/* Main toggle */}
        <Button
          variant={settings.enabled ? "default" : "ghost"}
          size="sm"
          onClick={() => updateSettings({ enabled: !settings.enabled })}
          className={`${settings.enabled ? 'bg-fuchsia-600 hover:bg-fuchsia-700' : ''}`}
        >
          {settings.enabled ? (
            <Mic className="w-4 h-4 mr-2" />
          ) : (
            <MicOff className="w-4 h-4 mr-2" />
          )}
          Voice {settings.enabled ? 'On' : 'Off'}
        </Button>

        {settings.enabled && (
          <>
            {/* Listen button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={isListening ? stopListening : startListening}
              className={isListening ? 'animate-pulse bg-red-500/20 text-red-400' : ''}
            >
              <Mic className="w-4 h-4" />
            </Button>

            {/* Mute responses */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (isSpeaking) stopSpeaking();
                updateSettings({ speakResponses: !settings.speakResponses });
              }}
            >
              {settings.speakResponses ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </Button>

            {/* Settings */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings2 className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>

      {/* Settings panel */}
      {showSettings && settings.enabled && (
        <div className="absolute top-full left-0 mt-2 w-72 p-4 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50">
          <h4 className="text-sm font-medium text-white mb-3">Voice Settings</h4>
          
          <div className="space-y-4">
            {/* Language */}
            <div>
              <label className="text-xs text-foreground/70 block mb-1">Language</label>
              <select
                value={settings.language}
                onChange={(e) => updateSettings({ language: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white"
              >
                <option value="en-GB">English (UK)</option>
                <option value="en-US">English (US)</option>
                <option value="cy-GB">Welsh</option>
              </select>
            </div>

            {/* Voice speed */}
            <div>
              <label className="text-xs text-foreground/70 block mb-1">
                Voice Speed: {settings.voiceSpeed.toFixed(1)}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.voiceSpeed}
                onChange={(e) => updateSettings({ voiceSpeed: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Auto-listen */}
            <label className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoListen}
                onChange={(e) => updateSettings({ autoListen: e.target.checked })}
                className="rounded border-gray-600"
              />
              Auto-listen after response
            </label>
          </div>
        </div>
      )}

      {/* Listening indicator */}
      {isListening && (
        <div className="absolute -bottom-8 left-0 right-0 text-center">
          <span className="text-xs text-fuchsia-400 animate-pulse">Listening...</span>
        </div>
      )}
    </div>
  );
}
