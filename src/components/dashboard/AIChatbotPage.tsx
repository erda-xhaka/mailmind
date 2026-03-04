import { useState, useRef, useEffect } from "react";
import { Bot, Send, User, Loader2, Mail, PenLine, Plus, Paperclip, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { streamChat, callAI } from "@/lib/streamChat";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import mammoth from "mammoth";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Message = { role: "user" | "assistant"; content: string; file?: UploadedFile };

interface UploadedFile {
  name: string;
  size: number;
  url: string;
  text: string;
  uploadedAt: string;
}

interface ParsedResult {
  summary?: string;
  sender: string;
  intent: string;
  key_dates: string[];
  action_items: string[];
  sentiment: string;
  priority: string;
}

const tones = ["Professional", "Friendly", "Concise", "Formal"];

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const AIChatbotPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Përshëndetje! Unë jam asistenti juaj MailMind AI. Mund t'ju ndihmoj të analizoni emaile, të gjeneroni përgjigje, të ngarkoni dokumente dhe të bëni pyetje. Si mund t'ju ndihmoj sot?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Email Parser state
  const [parserOpen, setParserOpen] = useState(false);
  const [parserText, setParserText] = useState("");
  const [parserLoading, setParserLoading] = useState(false);
  const [parsed, setParsed] = useState<ParsedResult | null>(null);

  // Reply Generator state
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyEmail, setReplyEmail] = useState("");
  const [replyTone, setReplyTone] = useState("Professional");
  const [replyResult, setReplyResult] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

  // Uploaded files context
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [viewingFile, setViewingFile] = useState<UploadedFile | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Build context with uploaded files
    const contextMessages = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
    if (uploadedFiles.length > 0) {
      const fileContext = uploadedFiles.map(f => `[Dokument: ${f.name}]\n${f.text}`).join("\n\n");
      contextMessages.unshift({ role: "user", content: `Konteksti i dokumenteve të ngarkuara:\n${fileContext}` });
    }

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length > 1 && prev[prev.length - 2]?.role === "user") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    await streamChat({
      messages: contextMessages,
      onDelta: upsertAssistant,
      onDone: () => setIsLoading(false),
      onError: (err) => {
        toast.error(err.message);
        setIsLoading(false);
      },
    });
  };

  // Email Parser
  const handleParse = async () => {
    if (!parserText.trim()) return;
    setParserLoading(true);
    setParsed(null);
    try {
      const { result } = await callAI("parse", { emailContent: parserText });
      const cleaned = result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const data = JSON.parse(cleaned);
      // Generate summary
      const { result: summaryResult } = await callAI("chat-single", {
        prompt: `Përmbledh këtë email në 2-3 fjali të shkurtra në shqip:\n\n${parserText}`,
      });
      data.summary = summaryResult || "";
      setParsed(data);
    } catch (err: any) {
      toast.error(err.message || "Gabim gjatë analizës");
    } finally {
      setParserLoading(false);
    }
  };

  // Reply Generator
  const generateReply = async () => {
    if (!replyEmail.trim()) return;
    setReplyLoading(true);
    setReplyResult("");
    try {
      const { result } = await callAI("reply", { emailContent: replyEmail, tone: replyTone });
      setReplyResult(result);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("ai_replies").insert({
          user_id: user.id,
          reply_text: result,
          subject: `Re: ${replyTone} reply`,
        } as any);
        toast.success("Draft u ruajt me sukses");
      }
    } catch (err: any) {
      toast.error(err.message || "Gabim gjatë gjenerimit");
    } finally {
      setReplyLoading(false);
    }
  };

  // File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Vetëm PDF, Word dhe TXT skedarë lejohen");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Skedari është shumë i madh (max 10MB)");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Duhet të jeni i kyçur"); return; }

      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("chat-documents")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("chat-documents")
        .getPublicUrl(filePath);

      // Extract text
      let text = "";
      if (file.type === "text/plain") {
        text = await file.text();
      } else if (
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.type === "application/msword"
      ) {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          text = result.value || `[Dokumenti Word "${file.name}" nuk kishte tekst të nxjerrshëm.]`;
        } catch {
          text = `[Gabim gjatë nxjerrjes së tekstit nga "${file.name}".]`;
        }
      } else {
        text = `[Dokument i ngarkuar: ${file.name} — Formati PDF. Përmbajtja nuk mund të ekstraktohet automatikisht në browser.]`;
      }

      const uploaded: UploadedFile = {
        name: file.name,
        size: file.size,
        url: urlData.publicUrl,
        text: text.slice(0, 8000),
        uploadedAt: new Date().toISOString(),
      };

      setUploadedFiles((prev) => [...prev, uploaded]);
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: `📎 Ngarkova dokumentin: **${file.name}**`,
          file: uploaded,
        },
        {
          role: "assistant",
          content: `Dokumenti "${file.name}" u ngarkua me sukses! Mund të më bëni pyetje rreth përmbajtjes së tij.`,
        },
      ]);
      toast.success("Dokumenti u ngarkua me sukses");
    } catch (err: any) {
      toast.error(err.message || "Gabim gjatë ngarkimit");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] -m-6">
      {/* Header */}
      <div className="p-6 border-b border-border/50">
        <h1 className="font-heading text-2xl font-bold">AI Assistant</h1>
        <p className="text-muted-foreground text-sm mt-1">Qendra juaj për të gjitha veprimet AI</p>
        {/* Quick Action Buttons */}
        <div className="flex gap-3 mt-4">
          <Button variant="outline" size="lg" className="gap-2 text-base px-6 py-3 h-auto" onClick={() => setParserOpen(true)}>
            <Mail className="h-5 w-5" /> 📧 Analizo Email
          </Button>
          <Button variant="outline" size="lg" className="gap-2 text-base px-6 py-3 h-auto" onClick={() => setReplyOpen(true)}>
            <PenLine className="h-5 w-5" /> ✍️ Gjenero Përgjigje
          </Button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role === "assistant" && (
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-primary" />
              </div>
            )}
            <div className={`max-w-lg rounded-xl px-4 py-3 text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground" : "glass-card"}`}>
              {msg.file && (
                <button
                  onClick={() => setViewingFile(msg.file!)}
                  className="flex items-center gap-2 mb-2 p-2 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors w-full text-left"
                >
                  <FileText className="h-5 w-5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium truncate text-xs">{msg.file.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatFileSize(msg.file.size)} • {new Date(msg.file.uploadedAt).toLocaleDateString("sq")}
                    </p>
                  </div>
                </button>
              )}
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
            {msg.role === "user" && (
              <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="glass-card rounded-xl px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border/50">
        <div className="flex gap-2 items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            className="hidden"
            onChange={handleFileUpload}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <Plus className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                <Paperclip className="h-4 w-4 mr-2" /> Upload Document
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Pyet rreth emaileve tuaja..."
            className="bg-muted/50 border-border/50"
            disabled={isLoading}
          />
          <Button onClick={handleSend} size="icon" disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {uploadedFiles.length > 0 && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {uploadedFiles.map((f, i) => (
              <button
                key={i}
                onClick={() => setViewingFile(f)}
                className="category-badge bg-primary/10 text-primary flex items-center gap-1 cursor-pointer hover:bg-primary/20 transition-colors"
              >
                <FileText className="h-3 w-3" /> {f.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Email Parser Modal */}
      <Dialog open={parserOpen} onOpenChange={setParserOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" /> Email Parser
            </DialogTitle>
            <DialogDescription>Ngjitni emailin për të nxjerrë informacione kyçe</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={parserText}
              onChange={(e) => { setParserText(e.target.value); setParsed(null); }}
              placeholder="Ngjitni përmbajtjen e emailit këtu..."
              className="min-h-[150px] bg-muted/50 border-border/50"
            />
            <Button onClick={handleParse} disabled={!parserText.trim() || parserLoading} className="w-full">
              {parserLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
              {parserLoading ? "Duke analizuar..." : "Parse Email"}
            </Button>
            {parsed && (
              <div className="space-y-3 glass-card p-4 rounded-lg">
                {parsed.summary && (
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-xs font-semibold text-primary mb-1">Përmbledhje</p>
                    <p className="text-sm">{parsed.summary}</p>
                  </div>
                )}
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2"><span className="text-muted-foreground w-28 shrink-0">Sender:</span><span>{parsed.sender}</span></div>
                  <div className="flex gap-2"><span className="text-muted-foreground w-28 shrink-0">Intent:</span><span className="text-primary">{parsed.intent}</span></div>
                  <div className="flex gap-2"><span className="text-muted-foreground w-28 shrink-0">Sentiment:</span><span>{parsed.sentiment}</span></div>
                  <div className="flex gap-2"><span className="text-muted-foreground w-28 shrink-0">Priority:</span>
                    <span className={`category-badge ${parsed.priority === "High" ? "bg-destructive/20 text-destructive" : parsed.priority === "Medium" ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"}`}>
                      {parsed.priority}
                    </span>
                  </div>
                  <div className="flex gap-2"><span className="text-muted-foreground w-28 shrink-0">Key Dates:</span>
                    <span>{parsed.key_dates?.length ? parsed.key_dates.join(", ") : "Asnjë"}</span>
                  </div>
                  <div className="flex gap-2 items-start"><span className="text-muted-foreground w-28 shrink-0">Action Items:</span>
                    <div>{parsed.action_items?.length ? (
                      <ul className="list-disc list-inside space-y-1">
                        {parsed.action_items.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                    ) : "Asnjë"}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Reply Generator Modal */}
      <Dialog open={replyOpen} onOpenChange={setReplyOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PenLine className="h-5 w-5 text-primary" /> Reply Generator
            </DialogTitle>
            <DialogDescription>Gjeneroni përgjigje me AI për emailet tuaja</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Email Origjinal</label>
              <Textarea
                value={replyEmail}
                onChange={(e) => { setReplyEmail(e.target.value); setReplyResult(""); }}
                placeholder="Ngjitni emailin që dëshironi t'i përgjigjeni..."
                className="mt-1 min-h-[120px] bg-muted/50 border-border/50"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Toni</label>
              <div className="flex gap-2 flex-wrap">
                {tones.map((t) => (
                  <button
                    key={t}
                    onClick={() => setReplyTone(t)}
                    className={`category-badge transition-all ${replyTone === t ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={generateReply} disabled={!replyEmail.trim() || replyLoading} className="w-full">
              {replyLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <PenLine className="h-4 w-4 mr-2" />}
              {replyLoading ? "Duke gjeneruar..." : "Gjenero Përgjigje"}
            </Button>
            {replyResult && (
              <div className="glass-card p-4 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-primary">Përgjigja ({replyTone})</p>
                  <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(replyResult); toast.success("U kopjua"); }}>
                    Kopjo
                  </Button>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 text-sm leading-relaxed whitespace-pre-wrap">
                  {replyResult}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* File Viewer Modal */}
      <Dialog open={!!viewingFile} onOpenChange={() => setViewingFile(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> {viewingFile?.name}
            </DialogTitle>
            <DialogDescription>
              {viewingFile && `${formatFileSize(viewingFile.size)} • ${new Date(viewingFile.uploadedAt).toLocaleDateString("sq")}`}
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 rounded-lg bg-muted/30 text-sm leading-relaxed whitespace-pre-wrap max-h-[50vh] overflow-y-auto">
            {viewingFile?.text}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIChatbotPage;
