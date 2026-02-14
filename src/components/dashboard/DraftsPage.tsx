import { useState, useEffect } from "react";
import { FileEdit, Sparkles, Send, Pencil, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Draft {
  id: string;
  reply_text: string | null;
  created_at: string | null;
  email_id: string | null;
  email_subject?: string;
  email_from?: string;
}

const DraftsPage = () => {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrafts = async () => {
      const { data, error } = await supabase
        .from("ai_replies")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to load drafts");
        setLoading(false);
        return;
      }

      // Fetch associated email info
      const emailIds = (data || []).filter((d) => d.email_id).map((d) => d.email_id!);
      let emailMap: Record<string, { subject: string; from_email: string }> = {};
      if (emailIds.length > 0) {
        const { data: emails } = await supabase
          .from("emails")
          .select("id, subject, from_email")
          .in("id", emailIds);
        if (emails) {
          for (const e of emails) {
            emailMap[e.id] = { subject: e.subject || "(No subject)", from_email: e.from_email || "Unknown" };
          }
        }
      }

      setDrafts(
        (data || []).map((d) => ({
          ...d,
          email_subject: d.email_id ? emailMap[d.email_id]?.subject : undefined,
          email_from: d.email_id ? emailMap[d.email_id]?.from_email : undefined,
        }))
      );
      setLoading(false);
    };
    fetchDrafts();
  }, []);

  const deleteDraft = async (id: string) => {
    const { error } = await supabase.from("ai_replies").delete().eq("id", id);
    if (!error) {
      setDrafts((prev) => prev.filter((d) => d.id !== id));
      toast.success("Draft deleted");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">AI Drafts</h1>
        <p className="text-muted-foreground text-sm mt-1">AI-generated replies saved from your inbox</p>
      </div>

      {drafts.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <FileEdit className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground">No drafts yet. Use the Reply Generator to create AI-powered replies.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {drafts.map((draft) => (
            <div key={draft.id} className="glass-card p-5 hover:border-primary/30 transition-all">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {draft.email_from && <span className="text-sm font-medium">Re: {draft.email_from}</span>}
                    <span className="category-badge bg-primary/10 text-primary">
                      <Sparkles className="inline h-3 w-3 mr-1" />AI Draft
                    </span>
                  </div>
                  {draft.email_subject && (
                    <div className="text-sm font-medium mt-1">{draft.email_subject}</div>
                  )}
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{draft.reply_text}</p>
                </div>
                <div className="flex gap-2 shrink-0 ml-4">
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(draft.reply_text || "")}>
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Copy
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteDraft(draft.id)}>
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DraftsPage;
