/**
 * OpenClaw Chat Component
 * Conversational interface for CEPHO skills
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function OpenClawChat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    {
      role: "assistant",
      content: "👋 Hi! I'm CEPHO. I can help you with Project Genesis, AI-SME consultations, quality validation, and more. What would you like to do?",
    },
  ]);

  const chatMutation = trpc.openClaw.chat.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    },
  });

  const handleSend = () => {
    if (!message.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: message }]);

    // Send to OpenClaw
    chatMutation.mutate({ message });

    // Clear input
    setMessage("");
  };

  return (
    <div className="flex flex-col h-full bg-background border border-border rounded-lg">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">CEPHO Assistant</h3>
        <p className="text-sm text-muted-foreground">Powered by OpenClaw</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {chatMutation.isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted text-foreground rounded-lg p-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-foreground rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-foreground rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask me anything... (e.g., 'Start Project Genesis for TechCo')"
            className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || chatMutation.isLoading}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>

        {/* Quick Actions */}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => setMessage("Start Project Genesis for my startup")}
            className="px-3 py-1 text-sm bg-muted text-foreground rounded-md hover:bg-muted/80"
          >
            🚀 Start Project
          </button>
          <button
            onClick={() => setMessage("Get expert consultation on market analysis")}
            className="px-3 py-1 text-sm bg-muted text-foreground rounded-md hover:bg-muted/80"
          >
            🧠 Ask Expert
          </button>
          <button
            onClick={() => setMessage("Run quality gate validation")}
            className="px-3 py-1 text-sm bg-muted text-foreground rounded-md hover:bg-muted/80"
          >
            ✅ Quality Check
          </button>
          <button
            onClick={() => setMessage("Show my morning briefing")}
            className="px-3 py-1 text-sm bg-muted text-foreground rounded-md hover:bg-muted/80"
          >
            👤 Briefing
          </button>
        </div>
      </div>
    </div>
  );
}
