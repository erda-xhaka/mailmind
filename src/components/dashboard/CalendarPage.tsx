import { useState, useEffect } from "react";
import { Calendar as CalIcon, Clock, Mail, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface EmailEvent {
  id: string;
  subject: string;
  from_email: string;
  created_at: string;
  category: string;
}

const categoryBarColors: Record<string, string> = {
  work: "bg-category-work",
  personal: "bg-category-personal",
  important: "bg-category-important",
  meetings: "bg-category-meetings",
  documents: "bg-category-documents",
  uncategorized: "bg-category-uncategorized",
};

const CalendarPage = () => {
  const [events, setEvents] = useState<EmailEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmails = async () => {
      const { data, error } = await supabase
        .from("emails")
        .select("id, subject, from_email, created_at, category")
        .order("created_at", { ascending: false })
        .limit(20);

      if (!error && data) {
        setEvents(data.map((e) => ({
          id: e.id,
          subject: e.subject || "(No subject)",
          from_email: e.from_email || "Unknown",
          created_at: e.created_at || "",
          category: e.category || "uncategorized",
        })));
      }
      setLoading(false);
    };
    fetchEmails();
  }, []);

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
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
        <h1 className="font-heading text-2xl font-bold">Calendar</h1>
        <p className="text-muted-foreground text-sm mt-1">Recent email timeline</p>
      </div>

      {events.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <CalIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground">No emails to display. Sync your Gmail first.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="glass-card p-5 hover:border-primary/30 transition-all flex items-center gap-4">
              <div className={`w-1 h-12 rounded-full ${categoryBarColors[event.category] || categoryBarColors.uncategorized}`} />
              <div className="flex-1">
                <h3 className="font-medium text-sm">{event.subject}</h3>
                <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatTime(event.created_at)}</span>
                  <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{event.from_email}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
