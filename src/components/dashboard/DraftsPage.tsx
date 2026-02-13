import { FileEdit, Sparkles, Send, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

const drafts = [
  { id: 1, to: "Sarah Chen", subject: "Re: Q4 Product Roadmap Review", preview: "Thanks for sharing the updated roadmap, Sarah. I've reviewed the changes and have a few suggestions...", status: "ai-generated", confidence: 92 },
  { id: 2, to: "David Park", subject: "Re: Invoice #1089", preview: "Hi David, I've received the invoice and forwarded it to our finance team for processing...", status: "ai-generated", confidence: 88 },
  { id: 3, to: "Team", subject: "Weekly Update - Dec Week 3", preview: "Hi team, here's a quick summary of what we accomplished this week and our priorities for next week...", status: "draft", confidence: 0 },
];

const DraftsPage = () => (
  <div>
    <div className="mb-6">
      <h1 className="font-heading text-2xl font-bold">AI Drafts</h1>
      <p className="text-muted-foreground text-sm mt-1">AI-generated replies ready for your review</p>
    </div>
    <div className="space-y-3">
      {drafts.map((draft) => (
        <div key={draft.id} className="glass-card p-5 hover:border-primary/30 transition-all">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">To: {draft.to}</span>
                {draft.status === "ai-generated" && (
                  <span className="category-badge bg-primary/10 text-primary">
                    <Sparkles className="inline h-3 w-3 mr-1" />AI Draft · {draft.confidence}%
                  </span>
                )}
              </div>
              <div className="text-sm font-medium mt-1">{draft.subject}</div>
              <p className="text-sm text-muted-foreground mt-1 truncate">{draft.preview}</p>
            </div>
            <div className="flex gap-2 shrink-0 ml-4">
              <Button variant="ghost" size="sm"><Pencil className="h-3.5 w-3.5 mr-1" /> Edit</Button>
              <Button variant="default" size="sm"><Send className="h-3.5 w-3.5 mr-1" /> Send</Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default DraftsPage;
