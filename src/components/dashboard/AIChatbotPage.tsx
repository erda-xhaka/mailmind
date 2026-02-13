import { useState } from "react";
import { Bot, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Message = { role: "ai" | "user"; content: string };

const initialMessages: Message[] = [
  { role: "ai", content: "Hi! I'm your MailMind AI assistant. I can help you search emails, draft replies, summarize threads, and manage your inbox. How can I help you today?" },
];

const AIChatbotPage = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { role: "user" as const, content: input },
      { role: "ai" as const, content: "I understand you're asking about: \"" + input + "\". In a fully connected version, I'd search your emails and provide intelligent responses. This is a demo preview of the AI chat interface." },
    ]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] -m-6">
      <div className="p-6 border-b border-border/50">
        <h1 className="font-heading text-2xl font-bold">AI Assistant</h1>
        <p className="text-muted-foreground text-sm mt-1">Ask me anything about your emails</p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role === "ai" && (
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-primary" />
              </div>
            )}
            <div className={`max-w-md rounded-xl px-4 py-3 text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground" : "glass-card"}`}>
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-border/50">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about your emails..."
            className="bg-muted/50 border-border/50"
          />
          <Button onClick={handleSend} size="icon"><Send className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
};

export default AIChatbotPage;
