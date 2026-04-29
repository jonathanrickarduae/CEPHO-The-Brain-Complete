// @ts-nocheck
import { PageShell } from "@/components/layout/PageShell";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Brain,
  Send,
  ChevronDown,
  Users,
  Layers,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";
import { cn } from "@/lib/utils";

const OPERATING_MODES = [
  "Life Optimiser",
  "Strategic Thinker",
  "Systems Architect",
  "Research Analyst",
  "Emotional Translator",
  "Simplifier",
  "Accountability Partner",
] as const;

const RESPONSE_LEVELS = ["Simple", "Practical", "Full"] as const;

const MODE_COLORS: Record<string, string> = {
  "Life Optimiser": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Strategic Thinker": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Systems Architect": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "Research Analyst": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Emotional Translator": "bg-pink-500/10 text-pink-400 border-pink-500/20",
  Simplifier: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "Accountability Partner":
    "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

const COUNCIL_AGENTS = [
  "ARIA",
  "ABEL",
  "LEX",
  "SAFI",
  "LUNA",
  "INDI",
  "ODIN",
] as const;
const COUNCIL_DESCRIPTIONS: Record<string, string> = {
  ARIA: "Research & Analysis",
  ABEL: "Protection & Risk",
  LEX: "Compliance & Honesty",
  SAFI: "Self-Healing",
  LUNA: "Empathy",
  INDI: "Practicality",
  ODIN: "Strategy",
};

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  operatingMode?: string;
  responseLevel?: string;
  councilData?: Record<string, string> | null;
  createdAt: string | Date;
};

export default function Agent1ChatPage() {
  const [message, setMessage] = useState("");
  const [operatingMode, setOperatingMode] = useState<string>("Life Optimiser");
  const [responseLevel, setResponseLevel] = useState<string>("Practical");
  const [surfaceCouncil, setSurfaceCouncil] = useState(false);
  const [expandedCouncil, setExpandedCouncil] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load settings
  const { data: settings } = trpc.agent1.settings.get.useQuery();

  // Load history
  const { data: history, refetch: refetchHistory } =
    trpc.agent1.chat.history.useQuery({ limit: 50 });

  useEffect(() => {
    if (history) setLocalMessages(history as Message[]);
  }, [history]);

  useEffect(() => {
    if (settings) {
      setOperatingMode(settings.defaultOperatingMode ?? "Life Optimiser");
      setResponseLevel(settings.defaultResponseLevel ?? "Practical");
      setSurfaceCouncil(settings.showCouncilByDefault ?? false);
    }
  }, [settings]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [localMessages, scrollToBottom]);

  const sendMutation = trpc.agent1.chat.send.useMutation({
    onSuccess: data => {
      setLocalMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: data.content,
          operatingMode: data.operatingMode,
          responseLevel: data.responseLevel,
          councilData: data.council as Record<string, string> | null,
          createdAt: new Date().toISOString(),
        },
      ]);
      refetchHistory();
    },
    onError: err => {
      toast.error(err.message ?? "Failed to send message");
      setLocalMessages(prev => prev.slice(0, -1));
    },
  });

  const delegateMutation = trpc.agent1.orchestrate.delegate.useMutation({
    onSuccess: data => {
      setLocalMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: `**Delegated to ${data.delegatedTo.agentName}** \u2014 *${data.delegatedTo.reason}*\n\n${data.response}`,
          operatingMode: operatingMode,
          responseLevel: responseLevel,
          createdAt: new Date().toISOString(),
        },
      ]);
      toast.success(`Delegated to ${data.delegatedTo.agentName}`);
    },
    onError: err => toast.error(err.message ?? "Delegation failed"),
  });

  const handleDelegate = () => {
    if (!message.trim() || delegateMutation.isPending) return;
    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      content: `[Delegate to specialist] ${message.trim()}`,
      operatingMode,
      responseLevel,
      createdAt: new Date().toISOString(),
    };
    setLocalMessages(prev => [...prev, userMsg]);
    delegateMutation.mutate({ task: message.trim() });
    setMessage("");
  };

  const clearMutation = trpc.agent1.chat.clear.useMutation({
    onSuccess: () => {
      setLocalMessages([]);
      toast.success("Conversation cleared");
    },
  });

  const handleSend = () => {
    if (!message.trim() || sendMutation.isPending) return;

    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      content: message.trim(),
      operatingMode,
      responseLevel,
      createdAt: new Date().toISOString(),
    };

    setLocalMessages(prev => [...prev, userMsg]);
    setMessage("");

    sendMutation.mutate({
      message: message.trim(),
      operatingMode: operatingMode as any,
      responseLevel: responseLevel as any,
      surfaceCouncil,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyMessage = (id: number, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <PageShell
      icon={Brain}
      title="Agent1"
      subtitle="Your personal AI thinking partner"
    >
      <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto">
        {/* Controls Bar */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {/* Operating Mode */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "gap-1.5 border text-xs font-medium",
                  MODE_COLORS[operatingMode] ?? ""
                )}
              >
                <Layers className="h-3 w-3" />
                {operatingMode}
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              {OPERATING_MODES.map(mode => (
                <DropdownMenuItem
                  key={mode}
                  onClick={() => setOperatingMode(mode)}
                  className={cn(
                    "text-xs cursor-pointer",
                    operatingMode === mode && "font-semibold"
                  )}
                >
                  {mode}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Response Level */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <ChevronDown className="h-3 w-3 opacity-60" />
                {responseLevel}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {RESPONSE_LEVELS.map(level => (
                <DropdownMenuItem
                  key={level}
                  onClick={() => setResponseLevel(level)}
                  className={cn(
                    "text-xs cursor-pointer",
                    responseLevel === level && "font-semibold"
                  )}
                >
                  {level}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Council Toggle */}
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "gap-1.5 text-xs",
              surfaceCouncil &&
                "bg-violet-500/10 text-violet-400 border-violet-500/20"
            )}
            onClick={() => setSurfaceCouncil(!surfaceCouncil)}
          >
            <Users className="h-3 w-3" />
            Council {surfaceCouncil ? "On" : "Off"}
          </Button>

          {/* Delegate to Specialist Agent */}
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
            onClick={handleDelegate}
            disabled={!message.trim() || delegateMutation.isPending}
            title="Let Agent1 pick the best specialist agent for this task"
          >
            <Zap className="h-3 w-3" />
            {delegateMutation.isPending ? "Delegating..." : "Delegate"}
          </Button>

          <div className="flex-1" />

          {/* Clear */}
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-muted-foreground hover:text-destructive"
            onClick={() => clearMutation.mutate()}
            disabled={localMessages.length === 0}
          >
            <Trash2 className="h-3 w-3" />
            Clear
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4">
          {localMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 opacity-60">
              <Brain className="h-12 w-12 text-[var(--brain-magenta)]" />
              <div>
                <p className="font-semibold text-foreground">Agent1 is ready</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Select an operating mode and start the conversation
                </p>
              </div>
            </div>
          )}

          {localMessages.map((msg, idx) => (
            <div
              key={msg.id ?? idx}
              className={cn(
                "group flex gap-3",
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              {/* Avatar */}
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-1",
                  msg.role === "user"
                    ? "bg-[var(--brain-cyan)]/20 text-[var(--brain-cyan)]"
                    : "bg-[var(--brain-magenta)]/20 text-[var(--brain-magenta)]"
                )}
              >
                {msg.role === "user" ? "U" : "A1"}
              </div>

              {/* Bubble */}
              <div
                className={cn(
                  "max-w-[80%] flex flex-col gap-1",
                  msg.role === "user" ? "items-end" : "items-start"
                )}
              >
                {/* Mode badge for assistant */}
                {msg.role === "assistant" && msg.operatingMode && (
                  <div className="flex items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] px-1.5 py-0 border",
                        MODE_COLORS[msg.operatingMode] ?? ""
                      )}
                    >
                      {msg.operatingMode}
                    </Badge>
                    {msg.responseLevel && (
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 text-muted-foreground"
                      >
                        {msg.responseLevel}
                      </Badge>
                    )}
                  </div>
                )}

                <div
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm relative",
                    msg.role === "user"
                      ? "bg-[var(--brain-cyan)]/10 border border-[var(--brain-cyan)]/20 text-foreground"
                      : "bg-card border border-border text-foreground"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <Streamdown className="prose prose-sm dark:prose-invert max-w-none">
                      {msg.content}
                    </Streamdown>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}

                  {/* Copy button */}
                  <button
                    onClick={() => copyMessage(msg.id ?? idx, msg.content)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted"
                  >
                    {copiedId === (msg.id ?? idx) ? (
                      <Check className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <Copy className="h-3 w-3 text-muted-foreground" />
                    )}
                  </button>
                </div>

                {/* Council View */}
                {msg.role === "assistant" && msg.councilData && (
                  <div className="w-full">
                    <button
                      onClick={() =>
                        setExpandedCouncil(
                          expandedCouncil === (msg.id ?? idx)
                            ? null
                            : (msg.id ?? idx)
                        )
                      }
                      className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-violet-400 transition-colors mt-1"
                    >
                      <Users className="h-3 w-3" />
                      {expandedCouncil === (msg.id ?? idx)
                        ? "Hide council"
                        : "View council perspectives"}
                    </button>

                    {expandedCouncil === (msg.id ?? idx) && (
                      <div className="mt-2 grid grid-cols-1 gap-2">
                        {COUNCIL_AGENTS.map(agent => (
                          <div
                            key={agent}
                            className="bg-violet-500/5 border border-violet-500/15 rounded-xl px-3 py-2"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-bold text-violet-400">
                                {agent}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {COUNCIL_DESCRIPTIONS[agent]}
                              </span>
                            </div>
                            <p className="text-xs text-foreground/80">
                              {msg.councilData?.[agent] ?? "—"}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {sendMutation.isPending && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-[var(--brain-magenta)]/20 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-[10px] font-bold text-[var(--brain-magenta)]">
                  A1
                </span>
              </div>
              <div className="bg-card border border-border rounded-2xl px-4 py-3">
                <div className="flex gap-1 items-center h-5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--brain-magenta)] animate-bounce [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--brain-magenta)] animate-bounce [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--brain-magenta)] animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border border-border rounded-2xl bg-card p-3 flex gap-3 items-end shadow-lg">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message Agent1 in ${operatingMode} mode...`}
            className="flex-1 min-h-[52px] max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm p-0 placeholder:text-muted-foreground/50"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || sendMutation.isPending}
            size="icon"
            className="h-10 w-10 rounded-xl bg-[var(--brain-magenta)] hover:bg-[var(--brain-magenta)]/80 text-white flex-shrink-0"
          >
            {sendMutation.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
