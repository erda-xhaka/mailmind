import { useState, useEffect, useCallback } from "react";
import { Mail, Star, Reply, Trash2, Archive, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const categoryColors: Record<string, string> = {
  work: "bg-category-work/20 text-category-work",
  personal: "bg-category-personal/20 text-category-personal",
  important: "bg-category-important/20 text-category-important",
  meetings: "bg-category-meetings/20 text-category-meetings",
  documents: "bg-category-documents/20 text-category-documents",
  uncategorized: "bg-category-uncategorized/20 text-category-uncategorized",
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
        <span
          className={`category-badge ${
            categoryColors[email.category || "uncategorized"] ||
            categoryColors.uncategorized
          }`}
        >
          {email.category || "uncategorized"}
        </span>
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
}: {
  email: Email;
  onToggleStar: () => void;
  onDelete: () => void;
}) => (
  <>
    <div className="p-6 border-b border-border/50">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold">
            {email.subject || "(No subject)"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {email.from_email} · {formatTime(email.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onToggleStar}>
            <Star
              className={`h-4 w-4 ${
                email.is_starred
                  ? "fill-category-documents text-category-documents"
                  : ""
              }`}
            />
          </Button>
          <Button variant="ghost" size="icon">
            <Reply className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Archive className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
    <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
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
        toast.error(
          "Sync failed: " + (res.error.message || "Unknown error")
        );
        console.error(res.error);
      } else {
        const data = res.data;
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

  useEffect(() => {
    fetchEmails();
  }, []);

  useEffect(() => {
    const autoSync = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const hasGoogle =
        user?.app_metadata?.providers?.includes("google") ||
        user?.identities?.some((i) => i.provider === "google");
      if (hasGoogle) {
        await syncGmail();
      }
    };
    autoSync();
  }, []);

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

  const selected = emails.find((e) => e.id === selectedId);
  const unreadCount = emails.filter((e) => !e.is_read).length;

  return (
    <div className="flex gap-0 -m-6 h-[calc(100vh-7rem)]">
      {/* Email List */}
      <div className="w-96 border-r border-border/50 flex flex-col shrink-0 glass-card rounded-none border-t-0 border-b-0 border-l-0">
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-lg font-semibold">Inbox</h2>
            <p className="text-sm text-muted-foreground">
              {unreadCount} unread messages
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={syncing ? undefined : syncGmail}
            disabled={syncing}
            title="Sync Gmail"
          >
            <RefreshCw
              className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {loading && emails.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
              Loading emails...
            </div>
          ) : emails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm">
              <Mail className="h-8 w-8 mb-2 opacity-30" />
              <p>No emails yet</p>
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
                Sync Gmail
              </Button>
            </div>
          ) : (
            emails.map((email) => (
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

      {/* Email Detail */}
      <div className="flex-1 flex flex-col min-w-0">
        {selected ? (
          <EmailDetail
            email={selected}
            onToggleStar={() =>
              toggleStar(selected.id, !!selected.is_starred)
            }
            onDelete={() => deleteEmail(selected.id)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Mail className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>
                {emails.length === 0
                  ? "Your inbox is empty"
                  : "Select an email to read"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InboxPage;
