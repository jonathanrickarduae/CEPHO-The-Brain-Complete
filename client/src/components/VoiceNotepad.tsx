import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Play, Pause, Trash2, Tag, Calendar, CheckSquare, Lightbulb, Clock, Search, Filter, ChevronDown, MoreVertical, Brain, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { trpc } from '@/lib/trpc';

// Note categories
type NoteCategory = 'task' | 'idea' | 'reminder' | 'observation' | 'question' | 'follow_up';

interface VoiceNote {
  id: number;
  content: string;
  category: NoteCategory;
  createdAt: Date;
  audioUrl?: string;
  duration?: number;
  projectId?: number;
  projectName?: string;
  isActionItem: boolean;
  isProcessed: boolean;
  extractedTasks?: string[];
}

// Category config
const CATEGORIES: Record<NoteCategory, { label: string; icon: React.ReactNode; color: string }> = {
  task: { label: 'Task', icon: <CheckSquare className="w-3.5 h-3.5" />, color: 'text-blue-400 bg-blue-500/20' },
  idea: { label: 'Idea', icon: <Lightbulb className="w-3.5 h-3.5" />, color: 'text-yellow-400 bg-yellow-500/20' },
  reminder: { label: 'Reminder', icon: <Clock className="w-3.5 h-3.5" />, color: 'text-purple-400 bg-purple-500/20' },
  observation: { label: 'Observation', icon: <Brain className="w-3.5 h-3.5" />, color: 'text-green-400 bg-green-500/20' },
  question: { label: 'Question', icon: <Sparkles className="w-3.5 h-3.5" />, color: 'text-pink-400 bg-pink-500/20' },
  follow_up: { label: 'Follow Up', icon: <Calendar className="w-3.5 h-3.5" />, color: 'text-orange-400 bg-orange-500/20' },
};

// Hook for voice recording
function useVoiceRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
      
      timerRef.current = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const clearRecording = () => {
    setAudioBlob(null);
    setDuration(0);
  };

  return { isRecording, audioBlob, duration, startRecording, stopRecording, clearRecording };
}

// Voice Note Recorder Component
export function VoiceNoteRecorder({ onNoteAdded }: { onNoteAdded?: () => void }) {
  const { isRecording, audioBlob, duration, startRecording, stopRecording, clearRecording } = useVoiceRecording();
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory>('observation');

  const createNoteMutation = trpc.voiceNotes.create.useMutation({
    onSuccess: () => {
      clearRecording();
      setTranscription('');
      onNoteAdded?.();
    },
  });

  // Simulate transcription (in production, would use Whisper API or similar)
  useEffect(() => {
    if (audioBlob && !isRecording) {
      setIsTranscribing(true);
      // Simulate transcription delay
      setTimeout(() => {
        // In production, this would call a transcription API
        setTranscription('Voice note captured. Transcription would appear here after processing.');
        setIsTranscribing(false);
      }, 1500);
    }
  }, [audioBlob, isRecording]);

  const handleSave = () => {
    if (transcription) {
      createNoteMutation.mutate({
        content: transcription,
        category: selectedCategory,
        duration: duration,
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 border border-border rounded-xl bg-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-foreground flex items-center gap-2">
          <Mic className="w-4 h-4 text-primary" />
          Quick Voice Note
        </h3>
        {isRecording && (
          <span className="flex items-center gap-2 text-sm text-red-400">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            Recording {formatDuration(duration)}
          </span>
        )}
      </div>

      {/* Recording Controls */}
      <div className="flex items-center gap-3 mb-4">
        <Button
          size="lg"
          variant={isRecording ? 'destructive' : 'default'}
          className={`rounded-full w-14 h-14 ${isRecording ? 'animate-pulse' : ''}`}
          onClick={isRecording ? stopRecording : startRecording}
        >
          {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </Button>
        
        <div className="flex-1">
          {!audioBlob && !isRecording && (
            <p className="text-sm text-muted-foreground">
              Tap to record a voice note. It will be transcribed and added to your notepad.
            </p>
          )}
          {isRecording && (
            <p className="text-sm text-foreground">
              Recording... Tap again to stop.
            </p>
          )}
          {audioBlob && !isRecording && (
            <p className="text-sm text-green-400">
              Recording complete ({formatDuration(duration)})
            </p>
          )}
        </div>
      </div>

      {/* Transcription Preview */}
      {(isTranscribing || transcription) && (
        <div className="mb-4">
          <label className="text-sm text-muted-foreground mb-2 block">Transcription</label>
          {isTranscribing ? (
            <div className="p-3 border border-border rounded-lg bg-secondary/30">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Transcribing...
              </div>
            </div>
          ) : (
            <textarea
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
              className="w-full p-3 border border-border rounded-lg bg-secondary/30 text-foreground text-sm resize-none"
              rows={3}
            />
          )}
        </div>
      )}

      {/* Category Selection */}
      {transcription && (
        <div className="mb-4">
          <label className="text-sm text-muted-foreground mb-2 block">Category</label>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(CATEGORIES) as [NoteCategory, typeof CATEGORIES[NoteCategory]][]).map(([key, { label, icon, color }]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === key
                    ? color + ' ring-2 ring-primary/50'
                    : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Save Button */}
      {transcription && (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => { clearRecording(); setTranscription(''); }}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={createNoteMutation.isPending}>
            {createNoteMutation.isPending ? 'Saving...' : 'Save Note'}
          </Button>
        </div>
      )}
    </div>
  );
}

// Voice Notes List Component
export function VoiceNotesList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<NoteCategory | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const { data: notes, refetch, isLoading } = trpc.voiceNotes.list.useQuery({
    category: filterCategory === 'all' ? undefined : filterCategory,
    search: searchQuery || undefined,
  });

  const deleteNoteMutation = trpc.voiceNotes.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const convertToTaskMutation = trpc.voiceNotes.convertToTask.useMutation({
    onSuccess: () => refetch(),
  });

  const formatDate = (date: Date) => {
    const now = new Date();
    const noteDate = new Date(date);
    const diffDays = Math.floor((now.getTime() - noteDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return noteDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return noteDate.toLocaleDateString([], { weekday: 'long' });
    }
    return noteDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Group notes by date
  const groupedNotes = (notes ?? []).reduce((acc, note) => {
    const date = new Date(note.createdAt).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(note);
    return acc;
  }, {} as Record<string, typeof notes>);

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-secondary/30 text-foreground text-sm"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters ? 'bg-primary/10' : ''}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filter
          <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 p-3 border border-border rounded-lg bg-secondary/20">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filterCategory === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
            }`}
          >
            All Notes
          </button>
          {(Object.entries(CATEGORIES) as [NoteCategory, typeof CATEGORIES[NoteCategory]][]).map(([key, { label, icon, color }]) => (
            <button
              key={key}
              onClick={() => setFilterCategory(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filterCategory === key
                  ? color
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Notes List */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground mt-2">Loading notes...</p>
        </div>
      ) : Object.keys(groupedNotes).length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <Mic className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No voice notes yet</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Record your first note above</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedNotes).map(([date, dateNotes]) => (
            <div key={date}>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                {new Date(date).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
              </h4>
              <div className="space-y-2">
                {dateNotes?.map((note) => {
                  const category = CATEGORIES[note.category as NoteCategory] || CATEGORIES.observation;
                  return (
                    <div
                      key={note.id}
                      className="p-4 border border-border rounded-lg bg-card hover:bg-secondary/30 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${category.color}`}>
                              {category.icon}
                              {category.label}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(new Date(note.createdAt))}
                            </span>
                            {note.duration && (
                              <span className="text-xs text-muted-foreground">
                                • {Math.floor(note.duration / 60)}:{(note.duration % 60).toString().padStart(2, '0')}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-foreground">{note.content}</p>
                          {note.projectName && (
                            <p className="text-xs text-primary mt-2">
                              Linked to: {note.projectName}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {note.category !== 'task' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => convertToTaskMutation.mutate({ id: note.id })}
                              title="Convert to task"
                            >
                              <CheckSquare className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={() => deleteNoteMutation.mutate({ id: note.id })}
                            title="Delete note"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Full Voice Notepad Page Component
export function VoiceNotepad() {
  const { refetch } = trpc.voiceNotes.list.useQuery({});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Mic className="w-6 h-6 text-primary" />
            Voice Notepad
          </h2>
          <p className="text-muted-foreground mt-1">
            Capture thoughts throughout the day. Your Chief of Staff uses these for context.
          </p>
        </div>
      </div>

      <VoiceNoteRecorder onNoteAdded={() => refetch()} />
      <VoiceNotesList />
    </div>
  );
}

// Floating Voice Note Button (for Dashboard)
export function FloatingVoiceNoteButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        size="lg"
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full shadow-lg z-40"
        onClick={() => setIsOpen(true)}
      >
        <Mic className="w-6 h-6" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4">
          <div className="w-full max-w-lg bg-card rounded-t-2xl p-4 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Quick Voice Note</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                ✕
              </Button>
            </div>
            <VoiceNoteRecorder onNoteAdded={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
