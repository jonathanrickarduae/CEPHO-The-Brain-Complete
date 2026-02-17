import { useState, useCallback, useRef, useEffect } from 'react';
import { haptics } from '@/lib/haptics';

// Types for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export interface VoiceInputState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  confidence: number;
}

export interface UseVoiceInputOptions {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export function useVoiceInput(options: UseVoiceInputOptions = {}) {
  const {
    continuous = false,
    interimResults = true,
    language = 'en-US',
    onResult,
    onError,
    onStart,
    onEnd,
  } = options;

  const [state, setState] = useState<VoiceInputState>({
    isListening: false,
    isSupported: false,
    transcript: '',
    interimTranscript: '',
    error: null,
    confidence: 0,
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isInitializedRef = useRef(false);

  // Check browser support and initialize
  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognitionAPI) {
      setState(prev => ({ ...prev, isSupported: true }));
      
      if (!isInitializedRef.current) {
        recognitionRef.current = new SpeechRecognitionAPI();
        recognitionRef.current.continuous = continuous;
        recognitionRef.current.interimResults = interimResults;
        recognitionRef.current.lang = language;
        isInitializedRef.current = true;
      }
    } else {
      setState(prev => ({ 
        ...prev, 
        isSupported: false,
        error: 'Speech recognition is not supported in this browser',
      }));
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [continuous, interimResults, language]);

  // Set up event handlers
  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    recognition.onstart = () => {
      haptics.tap();
      setState(prev => ({ 
        ...prev, 
        isListening: true, 
        error: null,
        transcript: '',
        interimTranscript: '',
      }));
      onStart?.();
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';
      let maxConfidence = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence;

        if (result.isFinal) {
          finalTranscript += transcript;
          maxConfidence = Math.max(maxConfidence, confidence);
        } else {
          interimTranscript += transcript;
        }
      }

      setState(prev => ({
        ...prev,
        transcript: prev.transcript + finalTranscript,
        interimTranscript,
        confidence: maxConfidence || prev.confidence,
      }));

      if (finalTranscript) {
        haptics.success();
        onResult?.(finalTranscript, true);
      } else if (interimTranscript) {
        onResult?.(interimTranscript, false);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      haptics.error();
      const errorMessage = getErrorMessage(event.error);
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        isListening: false,
      }));
      onError?.(errorMessage);
    };

    recognition.onend = () => {
      setState(prev => ({ ...prev, isListening: false }));
      onEnd?.();
    };
  }, [onStart, onResult, onError, onEnd]);

  const startListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition || state.isListening) return;

    setState(prev => ({ 
      ...prev, 
      error: null,
      transcript: '',
      interimTranscript: '',
    }));

    try {
      recognition.start();
    } catch (error) {
      // Recognition might already be running
      console.warn('Speech recognition start error:', error);
    }
  }, [state.isListening]);

  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition || !state.isListening) return;

    try {
      recognition.stop();
    } catch (error) {
      console.warn('Speech recognition stop error:', error);
    }
  }, [state.isListening]);

  const toggleListening = useCallback(() => {
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [state.isListening, startListening, stopListening]);

  const resetTranscript = useCallback(() => {
    setState(prev => ({
      ...prev,
      transcript: '',
      interimTranscript: '',
      confidence: 0,
    }));
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript,
  };
}

// Helper to get user-friendly error messages
function getErrorMessage(error: string): string {
  switch (error) {
    case 'no-speech':
      return 'No speech was detected. Please try again.';
    case 'audio-capture':
      return 'No microphone was found. Please check your device.';
    case 'not-allowed':
      return 'Microphone access was denied. Please allow microphone access.';
    case 'network':
      return 'Network error occurred. Please check your connection.';
    case 'aborted':
      return 'Speech recognition was aborted.';
    case 'language-not-supported':
      return 'The selected language is not supported.';
    case 'service-not-allowed':
      return 'Speech recognition service is not allowed.';
    default:
      return `Speech recognition error: ${error}`;
  }
}

/**
 * Hook for voice input with waveform visualization
 */
export function useVoiceWaveform() {
  const [audioLevel, setAudioLevel] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>(new Array(20).fill(0));
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startWaveform = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateWaveform = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Calculate average level
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(average / 255);

        // Create waveform visualization data
        const waveform = Array.from(dataArray.slice(0, 20)).map(v => v / 255);
        setWaveformData(waveform);

        animationRef.current = requestAnimationFrame(updateWaveform);
      };

      updateWaveform();
    } catch (error) {
      console.error('Failed to start waveform:', error);
    }
  }, []);

  const stopWaveform = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    analyserRef.current = null;
    setAudioLevel(0);
    setWaveformData(new Array(20).fill(0));
  }, []);

  useEffect(() => {
    return () => {
      stopWaveform();
    };
  }, [stopWaveform]);

  return {
    audioLevel,
    waveformData,
    startWaveform,
    stopWaveform,
  };
}
