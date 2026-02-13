import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Star, Paperclip, Clock, Brain, Reply, Trash2, Archive, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockEmails = [
  {
    id: 1, from: "Sarah Chen", email: "sarah@company.com", subject: "Q4 Product Roadmap Review",
    preview: "Hi team, I've attached the updated Q4 roadmap with the changes we discussed in yesterday's standup...",
    time: "10:32 AM", unread: true, starred: true, hasAttachment: true, category: "work",
    aiSummary: "Sarah shared the updated Q4 roadmap. Key changes: delayed feature X to Q1, prioritized bug fixes. Action needed: review by Friday."
  },
  {
    id: 2, from: "GitHub", email: "noreply@github.com", subject: "Pull request #342 merged",
    preview: "Your pull request 'Fix authentication flow' has been merged into main branch...",
    time: "9:15 AM", unread: true, starred: false, hasAttachment: false, category: "work",
    aiSummary: "PR #342 (auth flow fix) was merged. No conflicts. CI passed."
  },
  {
    id: 3, from: "David Park", email: "david@client.co", subject: "Invoice #1089 - December Services",
    preview: "Please find attached the invoice for December consulting services. Payment terms are NET 30...",
    time: "Yesterday", unread: false, starred: false, hasAttachment: true, category: "important",
    aiSummary: "Invoice for $12,500 (Dec consulting). Due in 30 days. Attached as PDF."
  },
  {
    id: 4, from: "Google Calendar", email: "calendar@google.com", subject: "Reminder: Team Sync @ 2:00 PM",
    preview: "You have an upcoming event: Team Sync Meeting. Join with Google Meet...",
    time: "Yesterday", unread: false, starred: false, hasAttachment: false, category: "meetings",
    aiSummary: "Team sync meeting today at 2 PM via Google Meet."
  },
  {
    id: 5, from: "Alex Morgan", email: "alex@personal.com", subject: "Weekend hiking trip plans",
    preview: "Hey! Are you still up for the hiking trip this weekend? I was thinking we could try the mountain trail...",
    time: "2 days ago", unread: false, starred: true, hasAttachment: false, category: "personal",
    aiSummary: "Alex is confirming weekend hiking plans. Suggesting mountain trail. Needs your reply."
  },
];

const categoryColors: Record<string, string> = {
  work: "bg-category-work/20 text-category-work",
  personal: "bg-category-personal/20 text-category-personal",
  important: "bg-category-important/20 text-category-important",
  meetings: "bg-category-meetings/20 text-category-meetings",
  documents: "bg-category-documents/20 text-category-documents",
};

const InboxPage = () => {
  const [selectedId, setSelectedId] = useState<number | null>(1);
  const selected = mockEmails.find((e) => e.id === selectedId);

  return (
    <div className="flex gap-0 -m-6 h-[calc(100vh-7rem)]">
      {/* Email List */}
      <div className="w-96 border-r border-border/50 flex flex-col shrink-0">
        <div className="p-4 border-b border-border/50">
          <h2 className="font-heading text-lg font-semibold">Inbox</h2>
          <p className="text-sm text-muted-foreground">{mockEmails.filter(e => e.unread).length} unread messages</p>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {mockEmails.map((email) => (
            <div
              key={email.id}
              onClick={() => setSelectedId(email.id)}
              className={`email-row ${email.unread ? "unread" : ""} ${selectedId === email.id ? "bg-muted/50" : ""}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium truncate ${email.unread ? "text-foreground" : "text-muted-foreground"}`}>
                    {email.from}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0 ml-2">{email.time}</span>
                </div>
                <div className="text-sm text-foreground truncate mt-0.5">{email.subject}</div>
                <div className="text-xs text-muted-foreground truncate mt-0.5">{email.preview}</div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`category-badge ${categoryColors[email.category] || ""}`}>
                    {email.category}
                  </span>
                  {email.hasAttachment && <Paperclip className="h-3 w-3 text-muted-foreground" />}
                  {email.starred && <Star className="h-3 w-3 text-category-documents fill-category-documents" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Email Detail */}
      <div className="flex-1 flex flex-col min-w-0">
        {selected ? (
          <>
            <div className="p-6 border-b border-border/50">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-heading text-xl font-semibold">{selected.subject}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{selected.from} &lt;{selected.email}&gt; · {selected.time}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon"><Reply className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon"><Archive className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>

            {/* AI Summary */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-6 mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">AI Summary</span>
              </div>
              <p className="text-sm text-muted-foreground">{selected.aiSummary}</p>
              <div className="flex gap-2 mt-3">
                <button className="ai-action-btn"><Reply className="h-3.5 w-3.5" /> Draft Reply</button>
                <button className="ai-action-btn"><Clock className="h-3.5 w-3.5" /> Remind Later</button>
              </div>
            </motion.div>

            {/* Email Body */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
              <div className="prose prose-invert prose-sm max-w-none">
                <p className="text-foreground/80 leading-relaxed">{selected.preview}</p>
                <p className="text-foreground/80 leading-relaxed mt-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Mail className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Select an email to read</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InboxPage;
