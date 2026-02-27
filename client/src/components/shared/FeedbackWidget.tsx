/**
 * FeedbackWidget — Global floating feedback button
 *
 * Appears on all pages as a floating action button.
 * Submits feedback via trpc.feedback.submit.
 */
import { useState } from "react";
import { MessageSquarePlus, X, Send, Star, ThumbsUp, ThumbsDown, Bug, Lightbulb } from "lucide-react";
import { trpc } from "../../lib/trpc";

type FeedbackType = "bug" | "feature" | "praise" | "general";

interface FeedbackState {
  type: FeedbackType;
  message: string;
  rating: number;
  submitted: boolean;
}

const FEEDBACK_TYPES: { value: FeedbackType; label: string; icon: typeof Bug }[] = [
  { value: "bug", label: "Bug Report", icon: Bug },
  { value: "feature", label: "Feature Request", icon: Lightbulb },
  { value: "praise", label: "Praise", icon: ThumbsUp },
  { value: "general", label: "General", icon: MessageSquarePlus },
];

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<FeedbackState>({
    type: "general",
    message: "",
    rating: 0,
    submitted: false,
  });

  const submitMutation = trpc.feedback.submit.useMutation({
    onSuccess: () => {
      setState((s) => ({ ...s, submitted: true }));
      setTimeout(() => {
        setIsOpen(false);
        setState({ type: "general", message: "", rating: 0, submitted: false });
      }, 2000);
    },
  });

  const handleSubmit = () => {
    if (!state.message.trim()) return;
    submitMutation.mutate({
      type: state.type,
      message: state.message,
      rating: state.rating || undefined,
      page: window.location.pathname,
    });
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
        aria-label="Send feedback"
      >
        <MessageSquarePlus className="w-4 h-4" />
        <span className="text-sm font-medium">Feedback</span>
      </button>

      {/* Feedback panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-80 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary/10 border-b border-border">
            <div className="flex items-center gap-2">
              <MessageSquarePlus className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Send Feedback</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {state.submitted ? (
            <div className="flex flex-col items-center gap-3 py-8 px-4">
              <ThumbsUp className="w-10 h-10 text-primary" />
              <p className="text-sm font-medium text-foreground">Thank you for your feedback!</p>
              <p className="text-xs text-muted-foreground text-center">
                Your input helps us improve CEPHO Brain.
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {/* Feedback type */}
              <div className="grid grid-cols-2 gap-2">
                {FEEDBACK_TYPES.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setState((s) => ({ ...s, type: value }))}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      state.type === value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Star rating */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Rating (optional)</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setState((s) => ({ ...s, rating: star }))}
                      className="transition-colors"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= state.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Your feedback</label>
                <textarea
                  value={state.message}
                  onChange={(e) => setState((s) => ({ ...s, message: e.target.value }))}
                  placeholder="Tell us what you think..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-muted border border-border rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!state.message.trim() || submitMutation.isPending}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {submitMutation.isPending ? "Sending..." : "Send Feedback"}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
