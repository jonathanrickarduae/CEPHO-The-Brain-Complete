// @ts-nocheck
import { PageShell } from "@/components/layout/PageShell";
import { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Diff,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { Streamdown } from "streamdown";

const STATUS_STYLES = {
  pending_review: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  applied: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const STATUS_ICONS = {
  pending_review: AlertTriangle,
  approved: CheckCircle2,
  rejected: ThumbsDown,
  applied: CheckCircle2,
};

export default function Agent1ReflectionPage() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const [userNotes, setUserNotes] = useState("");

  const { data: reflections, refetch } =
    trpc.agent1.reflection.list.useQuery();

  const generateMutation = trpc.agent1.reflection.generate.useMutation({
    onMutate: () => setGenerating(true),
    onSuccess: () => {
      toast.success("Weekly reflection generated — review and approve below");
      setGenerating(false);
      refetch();
    },
    onError: (err) => {
      toast.error(err.message);
      setGenerating(false);
    },
  });

  const approveMutation = trpc.agent1.reflection.approve.useMutation({
    onSuccess: () => {
      toast.success("Patch approved and applied to your system prompt");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const rejectMutation = trpc.agent1.reflection.reject.useMutation({
    onSuccess: () => {
      toast.success("Patch rejected");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleGenerate = () => {
    generateMutation.mutate({ userNotes });
  };

  return (
    <PageShell
      icon={Sparkles}
      title="Reflection & Improvement"
      subtitle="Weekly self-improvement loop — review and approve every patch"
    >
      <div className="max-w-4xl mx-auto flex flex-col gap-4">
        {/* Generate Panel */}
        <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">Generate Weekly Reflection</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Agent1 will analyse your recent conversations, decisions, and
                training progress, then propose a system-prompt patch. You must
                review and approve before anything changes.
              </p>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={generating || generateMutation.isPending}
              size="sm"
              className="gap-1.5 bg-[var(--brain-magenta)] hover:bg-[var(--brain-magenta)]/80 text-white flex-shrink-0"
            >
              {generating ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              Generate
            </Button>
          </div>
          <Textarea
            value={userNotes}
            onChange={(e) => setUserNotes(e.target.value)}
            placeholder="Optional: Add context for this week's reflection — what went well, what was hard, what you want to focus on..."
            rows={3}
            className="text-sm resize-none"
          />
          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <AlertTriangle className="h-3 w-3 text-amber-400" />
            No changes are applied automatically. You review and approve every
            proposed patch.
          </p>
        </div>

        {/* Reflection History */}
        <div className="flex flex-col gap-3">
          {!reflections?.length && (
            <div className="text-center py-16 text-muted-foreground">
              <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No reflections yet</p>
              <p className="text-xs mt-1 opacity-70">
                Generate your first weekly reflection above
              </p>
            </div>
          )}

          {reflections?.map((r: any) => {
            const StatusIcon =
              STATUS_ICONS[r.status as keyof typeof STATUS_ICONS] ?? Clock;
            const isExpanded = expandedId === r.id;

            return (
              <div
                key={r.id}
                className="bg-card border border-border rounded-2xl overflow-hidden"
              >
                {/* Header */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : r.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold">
                        Week of{" "}
                        {new Date(r.weekStart).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] gap-1 border",
                          STATUS_STYLES[
                            r.status as keyof typeof STATUS_STYLES
                          ] ?? ""
                        )}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {r.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {r.summary ?? "Reflection generated"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {r.status === "pending_review" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 text-xs text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            approveMutation.mutate({ id: r.id });
                          }}
                          disabled={approveMutation.isPending}
                        >
                          <ThumbsUp className="h-3 w-3" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 text-xs text-red-400 border-red-500/30 hover:bg-red-500/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            rejectMutation.mutate({ id: r.id });
                          }}
                          disabled={rejectMutation.isPending}
                        >
                          <ThumbsDown className="h-3 w-3" />
                          Reject
                        </Button>
                      </>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Expanded */}
                {isExpanded && (
                  <div className="border-t border-border px-4 py-4 flex flex-col gap-4">
                    {/* Summary */}
                    {r.summary && (
                      <div>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          Summary
                        </p>
                        <Streamdown className="prose prose-sm dark:prose-invert max-w-none text-sm">
                          {r.summary}
                        </Streamdown>
                      </div>
                    )}

                    {/* Insights */}
                    {r.insights && (
                      <div>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Eye className="h-3 w-3" />
                          Insights
                        </p>
                        <Streamdown className="prose prose-sm dark:prose-invert max-w-none text-sm">
                          {r.insights}
                        </Streamdown>
                      </div>
                    )}

                    {/* Proposed Patch */}
                    {r.proposedPatch && (
                      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
                        <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Diff className="h-3 w-3" />
                          Proposed System Prompt Patch
                        </p>
                        <pre className="text-xs text-foreground/80 whitespace-pre-wrap font-mono bg-muted/30 rounded-lg p-3">
                          {r.proposedPatch}
                        </pre>
                        {r.status === "pending_review" && (
                          <p className="text-[11px] text-amber-400 mt-2 flex items-center gap-1.5">
                            <AlertTriangle className="h-3 w-3" />
                            This patch will only be applied after your explicit
                            approval above.
                          </p>
                        )}
                      </div>
                    )}

                    {/* Applied patch */}
                    {r.status === "applied" && r.appliedAt && (
                      <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Applied on{" "}
                        {new Date(r.appliedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}
