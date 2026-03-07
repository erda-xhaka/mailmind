import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FileEdit, Sparkles, Loader2, Trash2, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, isYesterday, isToday, isThisWeek, isThisMonth, subMonths, isAfter } from "date-fns";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface Draft {
  id: string;
  reply_text: string | null;
  created_at: string | null;
  to_email: string | null;
  subject: string | null;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isToday(d)) return "Sot";
  if (isYesterday(d)) return "Dje";
  return format(d, "dd/MM/yyyy");
}

type DateFilter = "all" | "today" | "week" | "month" | "3months";

const DraftsPage = () => {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [recipientFilter, setRecipientFilter] = useState<string>("all");
  const navigate = useNavigate();

  const fetchDrafts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("ai_replies")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Dështoi ngarkimi i draft-eve");
      setLoading(false);
      return;
    }

    setDrafts(
      (data || []).map((d: any) => ({
        id: d.id, reply_text: d.reply_text, created_at: d.created_at,
        to_email: d.to_email, subject: d.subject,
      }))
    );
    setLoading(false);
  };

  useEffect(() => { fetchDrafts(); }, []);

  const createNewDraft = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("ai_replies")
      .insert({ user_id: user.id, reply_text: "", to_email: "", subject: "" } as any)
      .select()
      .single();

    if (error || !data) {
      toast.error("Dështoi krijimi i draft-it");
      return;
    }
    toast.success("Draft i ri u krijua");
    navigate(`/dashboard/drafts/${data.id}`);
  };

  const deleteDraft = async (id: string) => {
    const { error } = await supabase.from("ai_replies").delete().eq("id", id);
    if (!error) {
      setDrafts((prev) => prev.filter((d) => d.id !== id));
      toast.success("Draft-i u fshi");
    }
  };

  const uniqueRecipients = useMemo(() => {
    const recipients = drafts.map((d) => d.to_email).filter((email): email is string => !!email && email.trim() !== "");
    return [...new Set(recipients)].sort();
  }, [drafts]);

  const hasActiveFilters = dateFilter !== "all" || recipientFilter !== "all" || search.trim() !== "";

  const clearFilters = () => { setDateFilter("all"); setRecipientFilter("all"); setSearch(""); };

  const filtered = useMemo(() => {
    let result = drafts;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((d) =>
        (d.to_email || "").toLowerCase().includes(q) ||
        (d.subject || "").toLowerCase().includes(q) ||
        (d.reply_text || "").toLowerCase().includes(q)
      );
    }
    if (dateFilter !== "all") {
      result = result.filter((d) => {
        if (!d.created_at) return false;
        const date = new Date(d.created_at);
        switch (dateFilter) {
          case "today": return isToday(date);
          case "week": return isThisWeek(date, { weekStartsOn: 1 });
          case "month": return isThisMonth(date);
          case "3months": return isAfter(date, subMonths(new Date(), 3));
          default: return true;
        }
      });
    }
    if (recipientFilter !== "all") {
      result = result.filter((d) => d.to_email === recipientFilter);
    }
    return result;
  }, [drafts, search, dateFilter, recipientFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Draftet</h1>
          <p className="text-muted-foreground text-sm mt-1">Përgjigje dhe drafte email-esh të gjeneruara me AI</p>
        </div>
        <Button onClick={createNewDraft}>
          <Plus className="h-4 w-4 mr-2" /> Krijo Draft të Ri
        </Button>
      </div>

      {drafts.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Kërko drafte..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-muted/50 border-border/50" />
          </div>
          <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as DateFilter)}>
            <SelectTrigger className="w-[150px] bg-muted/50 border-border/50"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Të gjitha datat</SelectItem>
              <SelectItem value="today">Sot</SelectItem>
              <SelectItem value="week">Këtë javë</SelectItem>
              <SelectItem value="month">Këtë muaj</SelectItem>
              <SelectItem value="3months">3 muajt e fundit</SelectItem>
            </SelectContent>
          </Select>
          <Select value={recipientFilter} onValueChange={setRecipientFilter}>
            <SelectTrigger className="w-[180px] bg-muted/50 border-border/50">
              <SelectValue placeholder="Filtro sipas marrësit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Të gjithë marrësit</SelectItem>
              {uniqueRecipients.map((email) => (
                <SelectItem key={email} value={email}>{email}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4 mr-1" /> Pastro filtrat
            </Button>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <FileEdit className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground">
            {hasActiveFilters ? "Asnjë draft nuk përputhet me filtrat tuaja." : "Nuk ka drafte ende. Përdorni Gjeneruesin e Përgjigjeve për të krijuar përgjigje me AI."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((draft) => (
            <div
              key={draft.id}
              className="glass-card p-4 hover:border-primary/30 transition-all cursor-pointer"
              onClick={() => navigate(`/dashboard/drafts/${draft.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {draft.to_email && <span className="text-sm font-medium">Për: {draft.to_email}</span>}
                    <span className="category-badge bg-primary/10 text-primary">
                      <Sparkles className="inline h-3 w-3 mr-1" />Draft
                    </span>
                  </div>
                  {draft.subject && <div className="text-sm font-medium mt-1">Subjekti: {draft.subject}</div>}
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                    {draft.reply_text || "(Draft bosh)"}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(draft.created_at)}</span>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={(e) => e.stopPropagation()}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Jeni i sigurt që doni të fshini këtë draft?</AlertDialogTitle>
                        <AlertDialogDescription>Ky veprim nuk mund të kthehet mbrapa.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Anulo</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteDraft(draft.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Fshi
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
