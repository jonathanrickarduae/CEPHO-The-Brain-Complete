import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, Bot, User, Zap } from "lucide-react";
import { Streamdown } from "streamdown";

interface Message {
  role: "user" | "assistant";
  content: string;
  ts: number;
}

const QUICK_ACTIONS = [
  "What needs my attention today?",
  "Summarise the status of all 6 companies",
  "What are the top 3 risks across my portfolio right now?",
  "Draft a priority list for this week",
  "Which project is most behind and why?",
];

export default function VictoriaChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | undefined>();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Keyboard-aware layout: listen to visualViewport resize on mobile
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => {
      // Scroll to bottom when keyboard opens/closes
      bottomRef.current?.scrollIntoView({ behavior: "instant" });
    };
    vv.addEventListener("resize", onResize);
    return () => vv.removeEventListener("resize", onResize);
  }, []);

  const chatMutation = trpc.victoria.chat.useMutation();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = text ?? input.trim();
    if (!msg || isLoading) return;

    setInput("");
    const userMsg: Message = { role: "user", content: msg, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const result = await chatMutation.mutateAsync({
        message: msg,
        context: "general",
        conversationId,
      });
      const assistantMsg: Message = {
        role: "assistant",
        content: result.response,
        ts: Date.now(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Unable to reach Victoria. Check your connection.", ts: Date.now() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem)] bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 flex items-center gap-3 bg-white">
        <div className="w-8 h-8 rounded-full bg-[oklch(0.78_0.18_195)] flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-foreground">Victoria</h1>
          <p className="text-xs text-muted-foreground">AI Chief of Staff · Direct mode</p>
        </div>
        <Badge variant="outline" className="ml-auto text-xs border-[oklch(0.78_0.18_195)] text-[oklch(0.78_0.18_195)]">
          Live AI
        </Badge>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
            <div className="w-12 h-12 rounded-full bg-[oklch(0.78_0.18_195/0.1)] flex items-center justify-center">
              <Zap className="w-6 h-6 text-[oklch(0.78_0.18_195)]" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Victoria is ready.</p>
              <p className="text-xs text-muted-foreground max-w-sm">
                Ask anything about your companies, projects, risks, or priorities.
                Every interaction is captured to The Vault.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action}
                  onClick={() => sendMessage(action)}
                  className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-[oklch(0.78_0.18_195)] hover:text-[oklch(0.78_0.18_195)] transition-colors text-muted-foreground"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === "user"
                ? "bg-[oklch(0.58_0.26_340)] text-white"
                : "bg-[oklch(0.78_0.18_195)] text-white"
            }`}>
              {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
            </div>
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
              msg.role === "user"
                ? "bg-[oklch(0.58_0.26_340)] text-white rounded-tr-sm"
                : "bg-gray-50 text-foreground rounded-tl-sm border border-border"
            }`}>
              {msg.role === "assistant" ? (
                <Streamdown>{msg.content}</Streamdown>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-[oklch(0.78_0.18_195)] flex items-center justify-center shrink-0">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-gray-50 border border-border rounded-2xl rounded-tl-sm px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-[oklch(0.78_0.18_195)]" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border px-6 py-4 bg-white">
        <div className="flex gap-3 items-end">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Victoria anything... (Enter to send, Shift+Enter for new line)"
            className="resize-none min-h-[44px] max-h-[120px] text-sm border-border focus-visible:ring-[oklch(0.78_0.18_195)]"
            rows={1}
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            size="sm"
            className="h-11 px-4 bg-[oklch(0.78_0.18_195)] hover:bg-[oklch(0.68_0.18_195)] text-white shrink-0"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          All conversations are captured to The Vault for continuous learning.
        </p>
      </div>
    </div>
  );
}
