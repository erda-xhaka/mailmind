import { useState, useEffect, useCallback } from "react";
import { Mail, Star, Trash2, Archive, RefreshCw, ArrowLeft, Tags, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Email {
  id: string;
  from_email: string | null;
  to_email: string | null;
  subject: string | null;
  snippet: string | null;
  body: string | null;
  is_read: boolean | null;
  is_starred: boolean | null;
  category: string | null;
  created_at: string | null;
}

const CATEGORIES = [
  { name: "Personale", color: "bg-blue-400/20 text-blue-400" },
  { name: "Punë", color: "bg-blue-700/20 text-blue-300" },
  { name: "Miqësore", color: "bg-emerald-500/20 text-emerald-400" },
  { name: "Të rëndësishme", color: "bg-amber-500/20 text-amber-400" },
  { name: "Urgjente", color: "bg-red-500/20 text-red-400" },
  { name: "Të tjera", color: "bg-muted text-muted-foreground" },
];

const getCategoryStyle = (category: string | null) => {
  const found = CATEGORIES.find((c) => c.name.toLowerCase() === category?.toLowerCase());
  return found?.color || "bg-muted text-muted-foreground";
};

const formatTime = (dateStr: string | null) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
};

const EmailListItem = ({
  email,
  isSelected,
  onSelect,
  onMarkRead,
}: {
  email: Email;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onMarkRead: (id: string) => void;
}) => (
  <div
    key={email.id}
    onClick={() => {
      onSelect(email.id);
      if (!email.is_read) onMarkRead(email.id);
    }}
    className={`email-row ${!email.is_read ? "unread" : ""} ${
      isSelected ? "bg-muted/50" : ""
    }`}
  >
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <span
          className={`text-sm font-medium truncate ${
            !email.is_read ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          {email.from_email || "Unknown"}
        </span>
        <span className="text-xs text-muted-foreground shrink-0 ml-2">
          {formatTime(email.created_at)}
        </span>
      </div>
      <div className="text-sm text-foreground truncate mt-0.5">
        {email.subject || "(No subject)"}
      </div>
      <div className="text-xs text-muted-foreground truncate mt-0.5">
        {email.snippet || ""}
      </div>
      <div className="flex items-center gap-2 mt-1.5">
        {email.category && email.category !== "uncategorized" && (
          <span className={`category-badge ${getCategoryStyle(email.category)}`}>
            {email.category}
          </span>
        )}
        {email.is_starred && (
          <Star className="h-3 w-3 text-category-documents fill-category-documents" />
        )}
      </div>
    </div>
  </div>
);

const EmailDetail = ({
  email,
  onToggleStar,
  onDelete,
  onBack,
}: {
  email: Email;
  onToggleStar: () => void;
  onDelete: () => void;
  onBack?: () => void;
}) => (
  <>
    <div className="p-4 md:p-6 border-b border-border/50">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2 min-w-0">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0 mt-0.5">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="min-w-0">
            <h2 className="font-heading text-lg md:text-xl font-semibold truncate">
              {email.subject || "(No subject)"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {email.from_email} · {formatTime(email.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" onClick={onToggleStar}>
            <Star
              className={`h-4 w-4 ${
                email.is_starred
                  ? "fill-category-documents text-category-documents"
                  : ""
              }`}
            />
          </Button>
          <Button variant="ghost" size="icon" className="hidden md:inline-flex">
            <Archive className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
    <div className="flex-1 overflow-y-auto scrollbar-thin p-4 md:p-6">
      <div className="prose prose-invert prose-sm max-w-none">
        <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
          {email.body || email.snippet || "No content"}
        </p>
      </div>
    </div>
  </>
);

const InboxPage = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [categorizing, setCategorizing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("emails")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load emails");
      console.error(error);
    } else {
      setEmails(data || []);
      if (data && data.length > 0 && !selectedId) {
        setSelectedId(data[0].id);
      }
    }
    setLoading(false);
  }, [selectedId]);

  const syncGmail = useCallback(async () => {
    setSyncing(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in first");
        return;
      }

      const res = await supabase.functions.invoke("sync-gmail", {
        body: {
          provider_token: session.provider_token,
          provider_refresh_token: session.provider_refresh_token,
        },
      });

      if (res.error) {
        const msg = (res.error.message || "").toLowerCase();
        if (
          msg.includes("reauth_required") ||
          msg.includes("invalid_grant") ||
          msg.includes("no gmail token") ||
          msg.includes("revoked") ||
          msg.includes("403")
        ) {
          toast.error("Lidhja me Gmail ka skaduar ose është revokuar. Hape Settings dhe kliko Connect Gmail për ri-autorizim.");
        } else {
          toast.error("Sync failed: " + (res.error.message || "Unknown error"));
        }
        console.error(res.error);
      } else {
        const data = res.data;
        if (data?.reauth_required || data?.connected === false) {
          toast.error("Gmail nuk është i lidhur. Shko te Settings dhe kliko Connect Gmail për ri-autorizim.");
          return;
        }

        if (data.synced > 0) {
          toast.success(`Synced ${data.synced} new emails`);
          await fetchEmails();
        } else {
          toast.info("No new emails to sync");
        }
      }
    } catch (err: any) {
      toast.error("Sync error: " + err.message);
    } finally {
      setSyncing(false);
    }
  }, [fetchEmails]);

  const categorizeEmails = useCallback(async () => {
    const uncategorized = emails.filter(
      (e) => !e.category || e.category === "uncategorized"
    );
    if (uncategorized.length === 0) {
      toast.info("Të gjitha emailet janë kategorizuar tashmë");
      return;
    }

    setCategorizing(true);
    try {
      const emailsToCateg = uncategorized.map((e) => ({
        id: e.id,
        from: e.from_email,
        subject: e.subject,
        body: (e.body || e.snippet || "").slice(0, 500),
      }));

      // Process in batches of 10
      const batchSize = 10;
      for (let i = 0; i < emailsToCateg.length; i += batchSize) {
        const batch = emailsToCateg.slice(i, i + batchSize);
        const res = await supabase.functions.invoke("ai-assistant", {
          body: { action: "categorize", emailsToCateg: batch },
        });

        if (res.error) {
          console.error("Categorize error:", res.error);
          continue;
        }

        let results: { id: string; category: string }[] = [];
        try {
          const raw = res.data?.result || "";
          const cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();
          results = JSON.parse(cleaned);
        } catch {
          console.error("Failed to parse categorize result");
          continue;
        }

        // Update each email in DB
        for (const r of results) {
          await supabase
            .from("emails")
            .update({ category: r.category })
            .eq("id", r.id);
        }

        // Update local state
        setEmails((prev) =>
          prev.map((e) => {
            const match = results.find((r) => r.id === e.id);
            return match ? { ...e, category: match.category } : e;
          })
        );
      }

      toast.success("Emailet u kategorizuan me sukses");
    } catch (err: any) {
      toast.error("Gabim gjatë kategorizimit: " + err.message);
    } finally {
      setCategorizing(false);
    }
  }, [emails]);

  useEffect(() => {
    fetchEmails();
  }, []);

  useEffect(() => {
    const autoSync = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const statusRes = await supabase.functions.invoke("sync-gmail", {
        body: {
          validate_only: true,
          provider_token: session?.provider_token,
          provider_refresh_token: session?.provider_refresh_token,
        },
      });

      if (!statusRes.error && statusRes.data?.connected) {
        await syncGmail();
      }
    };

    autoSync();
  }, [syncGmail]);

  const toggleStar = async (emailId: string, currentStarred: boolean) => {
    const { error } = await supabase
      .from("emails")
      .update({ is_starred: !currentStarred })
      .eq("id", emailId);
    if (!error) {
      setEmails((prev) =>
        prev.map((e) =>
          e.id === emailId ? { ...e, is_starred: !currentStarred } : e
        )
      );
    }
  };

  const markAsRead = async (emailId: string) => {
    await supabase.from("emails").update({ is_read: true }).eq("id", emailId);
    setEmails((prev) =>
      prev.map((e) => (e.id === emailId ? { ...e, is_read: true } : e))
    );
  };

  const deleteEmail = async (emailId: string) => {
    const { error } = await supabase.from("emails").delete().eq("id", emailId);
    if (!error) {
      setEmails((prev) => prev.filter((e) => e.id !== emailId));
      if (selectedId === emailId) setSelectedId(null);
      toast.success("Email deleted");
    }
  };

  const filteredEmails = activeFilter
    ? emails.filter((e) => e.category?.toLowerCase() === activeFilter.toLowerCase())
    : emails;

  const selected = filteredEmails.find((e) => e.id === selectedId) || (selectedId ? emails.find((e) => e.id === selectedId) : null);
  const unreadCount = emails.filter((e) => !e.is_read).length;

  const showDetailMobile = isMobile && selectedId && selected;

  return (
    <div className="flex gap-0 -m-3 md:-m-6 h-[calc(100vh-5rem)] md:h-[calc(100vh-7rem)]">
      {(!isMobile || !showDetailMobile) && (
        <div className="w-full md:w-96 border-r border-border/50 flex flex-col shrink-0 glass-card rounded-none border-t-0 border-b-0 border-l-0">
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-lg font-semibold">Inbox</h2>
                <p className="text-sm text-muted-foreground">
                  {unreadCount} mesazhe të palexuara
                </p>
              </div>
              <div className="flex items-center gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={categorizing}
                      className="text-xs"
                    >
                      {categorizing ? (
                        <RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" />
                      ) : (
                        <Tags className="h-3.5 w-3.5 mr-1" />
                      )}
                      Kategorizo
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={categorizeEmails} className="font-medium">
                      <Tags className="h-4 w-4 mr-2" />
                      Kategorizo të gjitha
                    </DropdownMenuItem>
                    <div className="h-px bg-border my-1" />
                    {CATEGORIES.map((cat) => (
                      <DropdownMenuItem
                        key={cat.name}
                        onClick={() => setActiveFilter(cat.name)}
                      >
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${cat.color.split(" ")[0]}`} />
                        {cat.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={syncing ? undefined : syncGmail}
                  disabled={syncing}
                  title="Sinkronizo Gmail"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
            </div>
            {activeFilter && (
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  Duke shfaqur: {activeFilter} ({filteredEmails.length} email-e)
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setActiveFilter(null)}
                >
                  <X className="h-3 w-3 mr-1" />
                  Pastro filtrin
                </Button>
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {loading && emails.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                Duke ngarkuar emailet...
              </div>
            ) : filteredEmails.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm">
                <Mail className="h-8 w-8 mb-2 opacity-30" />
                {activeFilter ? (
                  <p>Nuk ka emaile në kategorinë "{activeFilter}"</p>
                ) : (
                  <>
                    <p>Nuk ka emaile ende</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={syncGmail}
                      disabled={syncing}
                    >
                      <RefreshCw
                        className={`h-3 w-3 mr-1 ${syncing ? "animate-spin" : ""}`}
                      />
                      Sinkronizo Gmail
                    </Button>
                  </>
                )}
              </div>
            ) : (
              filteredEmails.map((email) => (
                <EmailListItem
                  key={email.id}
                  email={email}
                  isSelected={selectedId === email.id}
                  onSelect={setSelectedId}
                  onMarkRead={markAsRead}
                />
              ))
            )}
          </div>
        </div>
      )}

      {(!isMobile || showDetailMobile) && (
        <div className="flex-1 flex flex-col min-w-0">
          {selected ? (
            <EmailDetail
              email={selected}
              onToggleStar={() =>
                toggleStar(selected.id, !!selected.is_starred)
              }
              onDelete={() => deleteEmail(selected.id)}
              onBack={isMobile ? () => setSelectedId(null) : undefined}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Mail className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>
                  {emails.length === 0
                    ? "Inbox-i juaj është bosh"
                    : "Zgjidhni një email për ta lexuar"}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InboxPage;
