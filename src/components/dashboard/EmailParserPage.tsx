import { MessageSquare, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { callAI } from "@/lib/streamChat";
import { toast } from "sonner";

interface ParsedResult {
  sender: string;
  intent: string;
  key_dates: string[];
  action_items: string[];
  sentiment: string;
  priority: string;
}

const EmailParserPage = () => {
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<ParsedResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleParse = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setParsed(null);
    try {
      const { result } = await callAI("parse", { emailContent: text });
      const cleaned = result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const data = JSON.parse(cleaned);
      setParsed(data);
    } catch (err: any) {
      toast.error(err.message || "Dështoi analiza e emailit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">Analizuesi i Emaileve</h1>
        <p className="text-muted-foreground text-sm mt-1">Ngjitni një email për të nxjerrë informacione kyçe me AI</p>
      </div>
      <div className="glass-card p-6 space-y-4">
        <Textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setParsed(null); }}
          placeholder="Ngjitni përmbajtjen e emailit këtu..."
          className="min-h-[200px] bg-muted/50 border-border/50"
        />
        <Button onClick={handleParse} disabled={!text.trim() || loading}>
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          {loading ? "Duke analizuar..." : "Analizo Emailin"}
        </Button>
      </div>
      {parsed && (
        <div className="glass-card p-6 mt-4 space-y-3">
          <h3 className="font-heading font-semibold flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" /> Informacione të Nxjerra
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex gap-2"><span className="text-muted-foreground w-28">Dërguesi:</span><span>{parsed.sender}</span></div>
            <div className="flex gap-2"><span className="text-muted-foreground w-28">Qëllimi:</span><span className="text-primary">{parsed.intent}</span></div>
            <div className="flex gap-2"><span className="text-muted-foreground w-28">Sentimenti:</span><span>{parsed.sentiment}</span></div>
            <div className="flex gap-2"><span className="text-muted-foreground w-28">Prioriteti:</span>
              <span className={`category-badge ${parsed.priority === "High" ? "bg-category-important/20 text-category-important" : parsed.priority === "Medium" ? "bg-category-documents/20 text-category-documents" : "bg-muted text-muted-foreground"}`}>
                {parsed.priority}
              </span>
            </div>
            <div className="flex gap-2"><span className="text-muted-foreground w-28">Data Kyçe:</span>
              <span>{parsed.key_dates?.length ? parsed.key_dates.join(", ") : "Asnjë e zbuluar"}</span>
            </div>
            <div className="flex gap-2 items-start"><span className="text-muted-foreground w-28 shrink-0">Veprime:</span>
              <div>{parsed.action_items?.length ? (
                <ul className="list-disc list-inside space-y-1">
                  {parsed.action_items.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              ) : "Asnjë e zbuluar"}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailParserPage;
