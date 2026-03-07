import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, ChevronRight, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { callAI } from "@/lib/streamChat";
import { toast } from "sonner";

interface ThreadSummary {
  thread_title: string;
  email_count: number;
  summary: string;
  action_items: string[];
}

const SummariesPage = () => {
  const navigate = useNavigate();
  const [summaries, setSummaries] = useState<ThreadSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [emailCount, setEmailCount] = useState(0);

  const fetchAndSummarize = async () => {
    setLoading(true);
    try {
      const { data: emails, error } = await supabase
        .from("emails")
        .select("subject, snippet, from_email, created_at, thread_id")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setEmailCount(emails?.length || 0);

      if (!emails || emails.length === 0) {
        setSummaries([]);
        setLoading(false);
        return;
      }

      const threads: Record<string, typeof emails> = {};
      for (const e of emails) {
        const key = e.thread_id || e.subject || "Pa titull";
        if (!threads[key]) threads[key] = [];
        threads[key].push(e);
      }

      const threadList = Object.entries(threads).map(([key, msgs]) => ({
        thread_key: key,
        subject: msgs[0].subject || "Pa titull",
        email_count: msgs.length,
        messages: msgs.map((m) => ({
          from: m.from_email,
          snippet: m.snippet,
          date: m.created_at,
        })),
      }));

      const { result } = await callAI("summarize", { emails: threadList.slice(0, 10) });
      const cleaned = result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned);
      const list = Array.isArray(parsed) ? parsed : [parsed];
      setSummaries(list);
      sessionStorage.setItem("mailmind_summaries", JSON.stringify(list));
    } catch (err: any) {
      toast.error(err.message || "Dështoi gjenerimi i përmbledhjeve");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Përmbledhje Thread-esh</h1>
          <p className="text-muted-foreground text-sm mt-1">Përmbledhje me AI të bisedave tuaja email</p>
        </div>
        <Button onClick={fetchAndSummarize} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          {loading ? "Duke analizuar..." : "Gjenero Përmbledhje"}
        </Button>
      </div>

      {!loading && summaries.length === 0 && (
        <div className="glass-card p-8 text-center">
          <Brain className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground">
            {emailCount === 0
              ? "Nuk u gjetën emaile. Sinkronizoni Gmail-in së pari."
              : "Klikoni 'Gjenero Përmbledhje' për të analizuar thread-et e emaileve tuaja me AI."}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {summaries.map((s, i) => (
          <div
            key={i}
            className="glass-card p-5 hover:border-primary/30 transition-all cursor-pointer group"
            onClick={() => navigate(`/dashboard/summaries/${i}`)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-medium text-sm">{s.thread_title}</span>
                  <span className="text-xs text-muted-foreground">{s.email_count} emaile</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-2">{s.summary}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SummariesPage;
