import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Upload, FileAudio, Loader2, CheckCircle, Sparkles, Brain, Clock, Volume2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface TranscriptionResult {
  text: string;
  extractedFields: {
    projectName?: string;
    projectType?: string;
    targetAudience?: string;
    objectives?: string[];
    timeline?: string;
    budget?: string;
    constraints?: string[];
    successMetrics?: string[];
    stakeholders?: string[];
    industry?: string;
  };
  confidence: number;
}

interface VoiceNoteIntakeProps {
  onComplete: (result: TranscriptionResult) => void;
  onSkip: () => void;
}

export function VoiceNoteIntake({ onComplete, onSkip }: VoiceNoteIntakeProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setAudioBlob(file);
      setAudioUrl(URL.createObjectURL(file));
    }
  };

  // Process audio and extract fields
  const processAudio = async () => {
    if (!audioBlob) return;
    
    setIsProcessing(true);
    
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        
        // Simulate transcription and field extraction
        // In production, this would call the actual transcription API
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Mock result for demonstration
        const mockResult: TranscriptionResult = {
          text: "We want to create an award winning graduate program in the Middle East. The target audience is recent university graduates from GCC countries. We need this to be world class, comparable to top programs at McKinsey and Google. Timeline is 6 months to launch. Budget is flexible but we want maximum impact. Success metrics include graduate satisfaction scores above 90% and placement rates above 85%.",
          extractedFields: {
            projectName: "GCC Graduate Excellence Program",
            projectType: "Graduate Program",
            targetAudience: "Recent university graduates from GCC countries",
            objectives: [
              "Create award winning graduate program",
              "Achieve world class standards",
              "Match quality of McKinsey and Google programs"
            ],
            timeline: "6 months to launch",
            budget: "Flexible, maximum impact focus",
            constraints: [],
            successMetrics: [
              "Graduate satisfaction scores above 90%",
              "Placement rates above 85%"
            ],
            stakeholders: [],
            industry: "Learning & Development"
          },
          confidence: 0.92
        };
        
        setTranscriptionResult(mockResult);
        setIsProcessing(false);
      };
    } catch (error) {
      console.error('Error processing audio:', error);
      setIsProcessing(false);
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 flex items-center justify-center mx-auto mb-4">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Start with a Voice Note</h1>
          <p className="text-foreground/70 max-w-lg mx-auto">
            Describe your project idea in your own words. Our AI will transcribe it and pre-populate the project wizard for you.
          </p>
        </div>

        {/* Recording Section */}
        {!transcriptionResult && (
          <Card className="bg-white/5 border-white/10 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Mic className="w-5 h-5 text-fuchsia-400" />
                Record or Upload Voice Note
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Recording Button */}
              <div className="flex flex-col items-center gap-4">
                {!audioBlob ? (
                  <>
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${
                        isRecording 
                          ? 'bg-red-500 animate-pulse' 
                          : 'bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:scale-105'
                      }`}
                    >
                      {isRecording ? (
                        <MicOff className="w-12 h-12 text-white" />
                      ) : (
                        <Mic className="w-12 h-12 text-white" />
                      )}
                    </button>
                    
                    {isRecording && (
                      <div className="flex items-center gap-2 text-red-400">
                        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                        <span className="font-mono text-lg">{formatTime(recordingTime)}</span>
                      </div>
                    )}
                    
                    <p className="text-foreground/70 text-sm">
                      {isRecording ? 'Click to stop recording' : 'Click to start recording'}
                    </p>
                  </>
                ) : (
                  <div className="w-full space-y-4">
                    {/* Audio Player */}
                    <div className="bg-white/5 rounded-xl p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-fuchsia-500/20 flex items-center justify-center">
                          <Volume2 className="w-6 h-6 text-fuchsia-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">
                            {uploadedFile ? uploadedFile.name : 'Voice Recording'}
                          </p>
                          <p className="text-foreground/70 text-sm">
                            {uploadedFile ? `${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB` : formatTime(recordingTime)}
                          </p>
                        </div>
                        <audio src={audioUrl || undefined} controls className="h-10" />
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setAudioBlob(null);
                          setAudioUrl(null);
                          setUploadedFile(null);
                        }}
                        className="flex-1 border-white/20 text-foreground/80"
                      >
                        Record Again
                      </Button>
                      <Button
                        onClick={processAudio}
                        disabled={isProcessing}
                        className="flex-1 bg-gradient-to-r from-cyan-500 to-fuchsia-500"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Transcribe & Extract
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Divider */}
              {!audioBlob && (
                <>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-foreground/60 text-sm">or</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  {/* Upload Button */}
                  <div className="flex justify-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="border-white/20 text-foreground/80 hover:bg-white/5"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Audio File
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Transcription Result */}
        {transcriptionResult && (
          <Card className="bg-white/5 border-white/10 mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Transcription Complete
                </CardTitle>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  {Math.round(transcriptionResult.confidence * 100)}% Confidence
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Full Transcription */}
              <div>
                <h4 className="text-sm font-medium text-foreground/70 mb-2">Full Transcription</h4>
                <div className="bg-white/5 rounded-xl p-4 text-foreground/80">
                  {transcriptionResult.text}
                </div>
              </div>

              {/* Extracted Fields */}
              <div>
                <h4 className="text-sm font-medium text-foreground/70 mb-3">Extracted Project Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  {transcriptionResult.extractedFields.projectName && (
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-xs text-foreground/60 mb-1">Project Name</p>
                      <p className="text-white font-medium">{transcriptionResult.extractedFields.projectName}</p>
                    </div>
                  )}
                  {transcriptionResult.extractedFields.projectType && (
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-xs text-foreground/60 mb-1">Project Type</p>
                      <p className="text-white font-medium">{transcriptionResult.extractedFields.projectType}</p>
                    </div>
                  )}
                  {transcriptionResult.extractedFields.industry && (
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-xs text-foreground/60 mb-1">Industry</p>
                      <p className="text-white font-medium">{transcriptionResult.extractedFields.industry}</p>
                    </div>
                  )}
                  {transcriptionResult.extractedFields.timeline && (
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-xs text-foreground/60 mb-1">Timeline</p>
                      <p className="text-white font-medium">{transcriptionResult.extractedFields.timeline}</p>
                    </div>
                  )}
                </div>

                {transcriptionResult.extractedFields.objectives && transcriptionResult.extractedFields.objectives.length > 0 && (
                  <div className="mt-4 bg-white/5 rounded-xl p-4">
                    <p className="text-xs text-foreground/60 mb-2">Objectives</p>
                    <ul className="space-y-1">
                      {transcriptionResult.extractedFields.objectives.map((obj, i) => (
                        <li key={i} className="text-foreground/80 flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {transcriptionResult.extractedFields.successMetrics && transcriptionResult.extractedFields.successMetrics.length > 0 && (
                  <div className="mt-4 bg-white/5 rounded-xl p-4">
                    <p className="text-xs text-foreground/60 mb-2">Success Metrics</p>
                    <ul className="space-y-1">
                      {transcriptionResult.extractedFields.successMetrics.map((metric, i) => (
                        <li key={i} className="text-foreground/80 flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                          {metric}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setTranscriptionResult(null)}
                  className="flex-1 border-white/20 text-foreground/80"
                >
                  Re-record
                </Button>
                <Button
                  onClick={() => onComplete(transcriptionResult)}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-fuchsia-500"
                >
                  Continue to Wizard
                  <Sparkles className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Skip Option */}
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={onSkip}
            className="text-foreground/70 hover:text-white"
          >
            Skip and start with blank wizard
          </Button>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-white font-medium mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-fuchsia-400" />
            Tips for Better Results
          </h3>
          <ul className="space-y-2 text-foreground/70 text-sm">
            <li className="flex items-start gap-2">
              <Clock className="w-4 h-4 mt-0.5 text-cyan-400" />
              Aim for 2 to 5 minutes of clear explanation
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 text-green-400" />
              Mention your goals, timeline, and target audience
            </li>
            <li className="flex items-start gap-2">
              <Brain className="w-4 h-4 mt-0.5 text-fuchsia-400" />
              Include any constraints or success metrics
            </li>
            <li className="flex items-start gap-2">
              <FileAudio className="w-4 h-4 mt-0.5 text-yellow-400" />
              Speak naturally as if explaining to a colleague
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default VoiceNoteIntake;
