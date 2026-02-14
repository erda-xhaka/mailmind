import { Zap, Sparkles, Copy, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { callAI } from "@/lib/streamChat";
import { toast } from "sonner";

const tones = ["Professional", "Friendly", "Concise", "Formal"];

const ReplyGeneratorPage = () => {
  const [email, setEmail] = useState("");
  const [tone, setTone] = useState("Professional");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  const generateReply = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setReply("");
    try {
      const { result } = await callAI("reply", { emailContent: email, tone });
      setReply(result);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate reply");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(reply);
    toast.success("Reply copied to clipboard");
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">Reply Generator</h1>
        <p className="text-muted-foreground text-sm mt-1">AI-powered email reply drafting</p>
      </div>
      <div className="glass-card p-6 space-y-4">
        <div>
          <label className="text-sm text-muted-foreground">Original Email</label>
          <Textarea
            value={email}
            onChange={(e) => { setEmail(e.target.value); setReply(""); }}
            placeholder="Paste the email you want to reply to..."
            className="mt-1 min-h-[120px] bg-muted/50 border-border/50"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Tone</label>
          <div className="flex gap-2">
            {tones.map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`category-badge transition-all ${tone === t ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <Button onClick={generateReply} disabled={!email.trim() || loading}>
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          {loading ? "Generating..." : "Generate Reply"}
        </Button>
      </div>
      {reply && (
        <div className="glass-card p-6 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" /> Generated Reply ({tone})
            </h3>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={generateReply} disabled={loading}>
                <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? "animate-spin" : ""}`} /> Regenerate
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                <Copy className="h-3.5 w-3.5 mr-1" /> Copy
              </Button>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-muted/30 text-sm leading-relaxed whitespace-pre-wrap">
            {reply}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReplyGeneratorPage;
