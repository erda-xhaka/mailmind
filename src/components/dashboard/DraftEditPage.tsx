import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Sparkles, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { callAI } from "@/lib/streamChat";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProofreadIssue {
  original: string;
  suggestion: string;
  explanation: string;
}

const DraftEditPage = () => {
  const { draftId } = useParams();
  const navigate = useNavigate();
  const [toEmail, setToEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [proofreading, setProofreading] = useState(false);
  const [issues, setIssues] = useState<ProofreadIssue[]>([]);
  const [correctedText, setCorrectedText] = useState("");
  const [showProofread, setShowProofread] = useState(false);

  useEffect(() => {
    const fetchDraft = async () => {
      const { data, error } = await supabase
        .from("ai_replies")
        .select("*")
        .eq("id", draftId!)
        .single();

      if (error || !data) {
        toast.error("Draft-i nuk u gjet");
        navigate("/dashboard/drafts");
        return;
      }

      setToEmail((data as any).to_email || "");
      setSubject((data as any).subject || "");
      setMessage(data.reply_text || "");
      setLoading(false);
    };
    fetchDraft();
  }, [draftId, navigate]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("ai_replies")
      .update({ reply_text: message, to_email: toEmail, subject } as any)
      .eq("id", draftId!);

    if (error) {
      toast.error("Dështoi ruajtja e ndryshimeve");
    } else {
      toast.success("Ndryshimet u ruajtën");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    const { error } = await supabase.from("ai_replies").delete().eq("id", draftId!);
    if (!error) {
      toast.success("Draft-i u fshi");
      navigate("/dashboard/drafts");
    }
  };

  const handleProofread = async () => {
    if (!message.trim()) return;
    setProofreading(true);
    setShowProofread(false);
    setIssues([]);
    try {
      const { result } = await callAI("proofread", { draftText: message });
      const parsed = JSON.parse(result);
      setIssues(parsed.issues || []);
      setCorrectedText(parsed.corrected_text || message);
      setShowProofread(true);
    } catch {
      toast.error("Korrigjimi dështoi. Provoni përsëri.");
    } finally {
      setProofreading(false);
    }
  };

  const applyCorrections = () => {
    setMessage(correctedText);
    setShowProofread(false);
    setIssues([]);
    toast.success("Të gjitha korrigjimet u aplikuan");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/drafts")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="font-heading text-2xl font-bold">Modifiko Draft-in</h1>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Jeni i sigurt që doni të fshini këtë draft?</AlertDialogTitle>
              <AlertDialogDescription>Ky veprim nuk mund të kthehet mbrapa.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Anulo</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Fshi</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="glass-card p-6 space-y-4">
        <div>
          <label className="text-sm text-muted-foreground">Për</label>
          <Input value={toEmail} onChange={(e) => setToEmail(e.target.value)} placeholder="marresi@shembull.com" className="mt-1 bg-muted/50 border-border/50" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Subjekti</label>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subjekti i emailit" className="mt-1 bg-muted/50 border-border/50" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Mesazhi</label>
          <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Shkruani mesazhin tuaj..." className="mt-1 min-h-[200px] bg-muted/50 border-border/50" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleProofread} disabled={proofreading || !message.trim()}>
            {proofreading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Korrigjo
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Ruaj Ndryshimet
          </Button>
        </div>
      </div>

      {showProofread && (
        <div className="glass-card p-6 mt-4">
          <h3 className="font-heading font-semibold text-lg mb-1">Rezultatet e Korrigjimit</h3>
          <p className="text-sm text-muted-foreground mb-4">Probleme të gjetura ({issues.length})</p>
          {issues.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary" /> Asnjë problem nuk u gjet. Draft-i juaj duket shkëlqyeshëm!
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {issues.map((issue, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <p className="text-sm font-medium">
                      <span className="line-through text-destructive/70">{issue.original}</span>
                      {" → "}
                      <span className="text-primary">{issue.suggestion}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{issue.explanation}</p>
                  </div>
                ))}
              </div>
              <Button className="mt-4" onClick={applyCorrections}>
                <CheckCircle2 className="h-4 w-4 mr-2" /> Apliko të Gjitha Korrigjimet
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DraftEditPage;
