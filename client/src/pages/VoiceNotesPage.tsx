import React, { useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { Mic, MicOff, Play, Pause, FileText, Plus, Clock, Tag } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const CATEGORIES = ["All", "Meeting", "Idea", "Task", "Personal", "Strategy"];

export default function VoiceNotesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  );
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [newContent, setNewContent] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const { data: notes, refetch } = trpc.voiceNotes.list.useQuery({
    category: selectedCategory,
    limit: 100,
  });

  const createMutation = trpc.voiceNotes.create.useMutation({
    onSuccess: () => {
      toast.success("Voice note created");
      setNewContent("");
      setShowCreate(false);
      refetch();
    },
    onError: () => toast.error("Failed to create voice note"),
  });

  const convertToTaskMutation = trpc.voiceNotes.convertToTask.useMutation({
    onSuccess: () => {
      toast.success("Converted to task successfully");
      refetch();
    },
    onError: () => toast.error("Failed to convert to task"),
  });

  return (
    <PageShell
      title="Voice Notes"
      subtitle="Capture ideas, meeting notes, and actions — then convert them into tasks."
      icon={Mic}
    >
      {/* Category Filter */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() =>
              setSelectedCategory(cat === "All" ? undefined : cat)
            }
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
              (cat === "All" && !selectedCategory) ||
              selectedCategory === cat
                ? "bg-accent text-white border-accent"
                : "bg-card text-muted-foreground border-border hover:border-accent/30"
            }`}
          >
            {cat}
          </button>
        ))}
        <button
          onClick={() => setShowCreate(v => !v)}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Note
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="mb-6 p-4 rounded-xl border border-accent/30 bg-card">
          <h3 className="font-semibold text-sm mb-3">New Voice Note</h3>
          <textarea
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            placeholder="Type your note content here..."
            className="w-full bg-background border border-border rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-accent/50 min-h-[100px]"
            aria-label="Voice note content"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={() =>
                createMutation.mutate({
                  content: newContent,
                  category: selectedCategory ?? "Personal",
                })
              }
              disabled={!newContent.trim() || createMutation.isPending}
              className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 disabled:opacity-40 transition-all"
            >
              {createMutation.isPending ? "Saving..." : "Save Note"}
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:border-accent/30 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Notes Grid */}
      {!notes || notes.notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <MicOff className="w-12 h-12 text-muted-foreground mb-4 opacity-40" />
          <p className="text-muted-foreground text-sm">No voice notes yet</p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-4 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-all"
          >
            Create your first note
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {notes.notes.map(note => (
            <div
              key={note.id}
              className="p-4 rounded-xl border border-border bg-card hover:border-accent/30 transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  {note.audioUrl ? (
                    <button
                      onClick={() =>
                        setPlayingId(playingId === note.id ? null : note.id)
                      }
                      className="p-2 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-all"
                      aria-label={playingId === note.id ? "Pause" : "Play"}
                    >
                      {playingId === note.id ? (
                        <Pause className="w-3.5 h-3.5" />
                      ) : (
                        <Play className="w-3.5 h-3.5" />
                      )}
                    </button>
                  ) : (
                    <div className="p-2 rounded-lg bg-muted/20">
                      <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                  )}
                  {note.category && (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 font-medium">
                      <Tag className="w-2.5 h-2.5" />
                      {note.category}
                    </span>
                  )}
                </div>
                {note.duration && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {Math.floor(note.duration / 60)}:
                    {String(note.duration % 60).padStart(2, "0")}
                  </span>
                )}
              </div>

              {/* Content */}
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4 mb-3">
                {note.content}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(note.createdAt), {
                    addSuffix: true,
                  })}
                </span>
                {!note.isProcessed && (
                  <button
                    onClick={() =>
                      convertToTaskMutation.mutate({ noteId: note.id, taskTitle: note.content.slice(0, 100) })
                    }
                    disabled={convertToTaskMutation.isPending}
                    className="text-xs px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all disabled:opacity-40"
                  >
                    → Convert to Task
                  </button>
                )}
                {note.isProcessed && (
                  <span className="text-xs px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    ✓ Task created
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
