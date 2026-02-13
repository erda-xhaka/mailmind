import { Zap, Archive, Star, Tag, Trash2, Clock, Reply, Forward } from "lucide-react";

const actions = [
  { icon: Reply, title: "Quick Reply", desc: "AI-generated one-click replies", color: "text-primary" },
  { icon: Archive, title: "Archive All Read", desc: "Move read emails to archive", color: "text-category-work" },
  { icon: Star, title: "Star Important", desc: "Auto-star based on AI priority", color: "text-category-documents" },
  { icon: Tag, title: "Auto Categorize", desc: "Sort inbox into categories", color: "text-category-personal" },
  { icon: Clock, title: "Snooze Emails", desc: "Remind me about emails later", color: "text-category-important" },
  { icon: Forward, title: "Smart Forward", desc: "Suggest who to forward to", color: "text-category-meetings" },
  { icon: Trash2, title: "Clean Spam", desc: "Remove detected spam emails", color: "text-destructive" },
  { icon: Zap, title: "Batch Process", desc: "Run all AI actions at once", color: "text-primary" },
];

const QuickActionsPage = () => (
  <div>
    <div className="mb-6">
      <h1 className="font-heading text-2xl font-bold">Quick Actions</h1>
      <p className="text-muted-foreground text-sm mt-1">One-click AI-powered email management</p>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((a) => (
        <div
          key={a.title}
          className="glass-card p-5 text-center cursor-pointer hover:border-primary/30 transition-all group"
        >
          <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/10 transition-colors">
            <a.icon className={`h-6 w-6 ${a.color}`} />
          </div>
          <h3 className="font-medium text-sm">{a.title}</h3>
          <p className="text-xs text-muted-foreground mt-1">{a.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

export default QuickActionsPage;
