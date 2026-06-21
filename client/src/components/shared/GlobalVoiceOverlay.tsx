/**
 * GlobalVoiceOverlay
 *
 * A large, confident voice input overlay that:
 * 1. Shows animated waveform bars while listening
 * 2. Displays live transcription as you speak
 * 3. Sends the transcript directly to Agent1 (trpc.agent1.chat.send)
 * 4. Confirms the action taken in a one-line toast
 *
 * Triggered by the floating mic button in BrainLayout.
 * Replaces the old ClawBot + QuickActionsBar voice flow.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, X, Send, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useVoiceInput } from "@/hooks/useVoiceInput";

interface GlobalVoiceOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const NUM_BARS = 20;

export function GlobalVoiceOverlay({ isOpen, onClose }: GlobalVoiceOverlayProps) {
  const [waveform, setWaveform] = useState<number[]>(Array(NUM_BARS).fill(0.1));
  const [status, setStatus] = useState<"idle" | "listening" | "sending" | "done">("idle");
  const [finalText, setFinalText] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const animFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const sendMutation = trpc.agent1.chat.send.useMutation({
    onSuccess: (data) => {
      const reply = data?.content ?? "";
      // Extract first sentence as confirmation
      const firstSentence = reply.split(/[.!?\n]/)[0]?.trim() ?? "Received.";
      setConfirmMessage(firstSentence);
      setStatus("done");
      // Auto-close after showing confirmation
      setTimeout(() => {
        onClose();
        setStatus("idle");
        setFinalText("");
        setConfirmMessage("");
      }, 3000);
    },
    onError: () => {
      toast.error("Could not reach Agent1. Please try again.");
      setStatus("idle");
    },
  });

  const {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceInput({
    continuous: true,
    interimResults: true,
    onResult: (text, isFinal) => {
      if (isFinal && text.trim()) {
        setFinalText(prev => (prev ? prev + " " + text : text));
      }
    },
  });

  // Animate waveform from microphone audio
  const animateWaveform = useCallback(() => {
    if (!analyserRef.current) return;
    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteFrequencyData(dataArray);
      const bars = Array.from({ length: NUM_BARS }, (_, i) => {
        const idx = Math.floor((i / NUM_BARS) * dataArray.length * 0.6);
        return Math.max(0.08, dataArray[idx] / 255);
      });
      setWaveform(bars);
      animFrameRef.current = requestAnimationFrame(tick);
    };
    animFrameRef.current = requestAnimationFrame(tick);
  }, []);

  const startAudioAnalysis = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;
      animateWaveform();
    } catch {
      // Fallback: animate random bars if mic access denied
      const tick = () => {
        setWaveform(Array.from({ length: NUM_BARS }, () => Math.random() * 0.7 + 0.1));
        animFrameRef.current = requestAnimationFrame(tick);
      };
      animFrameRef.current = requestAnimationFrame(tick);
    }
  }, [animateWaveform]);

  const stopAudioAnalysis = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    analyserRef.current = null;
    setWaveform(Array(NUM_BARS).fill(0.1));
  }, []);

  // Start listening when overlay opens
  useEffect(() => {
    if (isOpen && status === "idle") {
      setFinalText("");
      setConfirmMessage("");
      resetTranscript();
      setStatus("listening");
      startListening();
      startAudioAnalysis();
    }
    if (!isOpen) {
      stopListening();
      stopAudioAnalysis();
      setStatus("idle");
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
      stopAudioAnalysis();
    };
  }, [stopListening, stopAudioAnalysis]);

  const handleSend = useCallback(() => {
    const text = (finalText + " " + (transcript || "")).trim();
    if (!text) return;
    stopListening();
    stopAudioAnalysis();
    setStatus("sending");
    sendMutation.mutate({ message: text });
  }, [finalText, transcript, stopListening, stopAudioAnalysis, sendMutation]);

  const handleClose = useCallback(() => {
    stopListening();
    stopAudioAnalysis();
    resetTranscript();
    setFinalText("");
    setConfirmMessage("");
    setStatus("idle");
    onClose();
  }, [stopListening, stopAudioAnalysis, resetTranscript, onClose]);

  // Keyboard: Escape to close, Enter to send
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "Enter" && !e.shiftKey && status === "listening") handleSend();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, status, handleClose, handleSend]);

  if (!isOpen) return null;

  const displayText = finalText
    ? finalText + (interimTranscript ? " " + interimTranscript : "")
    : interimTranscript || transcript || "";

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Voice input to Agent1"
    >
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-6 right-6 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all"
        aria-label="Close voice input"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Status label */}
      <div className="mb-8 text-center">
        {status === "idle" && (
          <p className="text-white/50 text-sm font-medium tracking-widest uppercase">Ready</p>
        )}
        {status === "listening" && (
          <p className="text-primary text-sm font-semibold tracking-widest uppercase animate-pulse">
            Listening — speak now
          </p>
        )}
        {status === "sending" && (
          <p className="text-amber-400 text-sm font-semibold tracking-widest uppercase">
            Sending to Agent1...
          </p>
        )}
        {status === "done" && (
          <p className="text-emerald-400 text-sm font-semibold tracking-widest uppercase flex items-center gap-2 justify-center">
            <CheckCircle2 className="w-4 h-4" />
            Agent1 received
          </p>
        )}
      </div>

      {/* Waveform bars */}
      <div className="flex items-end justify-center gap-1 h-24 mb-8 px-4 w-full max-w-md">
        {waveform.map((level, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 rounded-full transition-all",
              status === "listening"
                ? "bg-primary"
                : status === "done"
                  ? "bg-emerald-400"
                  : "bg-white/20"
            )}
            style={{
              height: `${Math.max(8, level * 96)}px`,
              opacity: status === "listening" ? 0.5 + level * 0.5 : 0.3,
              boxShadow: status === "listening" && level > 0.5
                ? `0 0 ${level * 12}px var(--color-primary)`
                : "none",
            }}
          />
        ))}
      </div>

      {/* Live transcript */}
      <div
        className={cn(
          "w-full max-w-xl mx-4 min-h-[80px] rounded-2xl px-6 py-4 mb-8 transition-all",
          "bg-white/5 border border-white/10"
        )}
      >
        {status === "done" && confirmMessage ? (
          <p className="text-emerald-300 text-base leading-relaxed">
            {confirmMessage}
          </p>
        ) : displayText ? (
          <p className="text-white text-base leading-relaxed">
            {finalText && <span>{finalText} </span>}
            {interimTranscript && (
              <span className="text-white/50">{interimTranscript}</span>
            )}
            {!finalText && !interimTranscript && transcript && (
              <span className="text-white/50">{transcript}</span>
            )}
          </p>
        ) : (
          <p className="text-white/30 text-base italic">
            {isSupported
              ? "Start speaking — your words appear here in real time"
              : "Voice input is not supported in this browser"}
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-4">
        {/* Mic toggle */}
        <button
          onClick={() => {
            if (isListening) {
              stopListening();
              stopAudioAnalysis();
            } else {
              resetTranscript();
              startListening();
              startAudioAnalysis();
            }
          }}
          disabled={status === "sending" || status === "done" || !isSupported}
          className={cn(
            "flex items-center justify-center w-16 h-16 rounded-full transition-all duration-200",
            isListening
              ? "bg-red-500 shadow-lg shadow-red-500/40 scale-110"
              : "bg-white/10 hover:bg-white/20",
            (status === "sending" || status === "done") && "opacity-40 cursor-not-allowed"
          )}
          aria-label={isListening ? "Pause recording" : "Resume recording"}
        >
          {isListening ? (
            <Mic className="w-7 h-7 text-white animate-pulse" />
          ) : (
            <MicOff className="w-7 h-7 text-white/60" />
          )}
        </button>

        {/* Send to Agent1 */}
        <button
          onClick={handleSend}
          disabled={!displayText.trim() || status === "sending" || status === "done"}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-200",
            displayText.trim() && status === "listening"
              ? "bg-primary text-white shadow-lg shadow-primary/40 hover:bg-primary/90 hover:scale-105"
              : "bg-white/10 text-white/30 cursor-not-allowed"
          )}
          aria-label="Send to Agent1"
        >
          {status === "sending" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send to Agent1
            </>
          )}
        </button>
      </div>

      {/* Hint */}
      {status === "listening" && (
        <p className="mt-6 text-white/30 text-xs">
          Press Enter to send · Escape to cancel
        </p>
      )}
    </div>
  );
}
