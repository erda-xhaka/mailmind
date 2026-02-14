import { useState } from "react";
import { Zap, Archive, Star, Tag, Trash2, Clock, Reply, Forward, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const QuickActionsPage = () => {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleAction = async (actionKey: string) => {
    setLoadingAction(actionKey);
    try {
      switch (actionKey) {
        case "archive-read": {
          const { error } = await supabase
            .from("emails")
            .delete()
            .eq("is_read", true);
          if (error) throw error;
          toast.success("Read emails archived (deleted)");
          break;
        }
        case "star-important": {
          const { error } = await supabase
            .from("emails")
            .update({ is_starred: true })
            .eq("category", "important");
          if (error) throw error;
          toast.success("Important emails starred");
          break;
        }
        case "mark-all-read": {
          const { error } = await supabase
            .from("emails")
            .update({ is_read: true })
            .eq("is_read", false);
          if (error) throw error;
          toast.success("All emails marked as read");
          break;
        }
        case "clean-spam": {
          const { error } = await supabase
            .from("emails")
            .delete()
            .eq("category", "spam");
          if (error) throw error;
          toast.success("Spam emails cleaned");
          break;
        }
        case "unstar-all": {
          const { error } = await supabase
            .from("emails")
            .update({ is_starred: false })
            .eq("is_starred", true);
          if (error) throw error;
          toast.success("All emails unstarred");
          break;
        }
        default:
          toast.info("This action is coming soon");
      }
    } catch (err: any) {
      toast.error(err.message || "Action failed");
    } finally {
      setLoadingAction(null);
    }
  };

  const actions = [
    { key: "mark-all-read", icon: Reply, title: "Mark All Read", desc: "Mark all unread emails as read", color: "text-primary" },
    { key: "archive-read", icon: Archive, title: "Archive Read", desc: "Delete all read emails", color: "text-category-work" },
    { key: "star-important", icon: Star, title: "Star Important", desc: "Star emails categorized as important", color: "text-category-documents" },
    { key: "unstar-all", icon: Tag, title: "Unstar All", desc: "Remove stars from all emails", color: "text-category-personal" },
    { key: "clean-spam", icon: Trash2, title: "Clean Spam", desc: "Delete spam emails", color: "text-destructive" },
    { key: "coming-soon", icon: Forward, title: "Smart Forward", desc: "Coming soon", color: "text-category-meetings" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">Quick Actions</h1>
        <p className="text-muted-foreground text-sm mt-1">One-click email management</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {actions.map((a) => (
          <div
            key={a.key}
            onClick={() => !loadingAction && handleAction(a.key)}
            className="glass-card p-5 text-center cursor-pointer hover:border-primary/30 transition-all group"
          >
            <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/10 transition-colors">
              {loadingAction === a.key ? (
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              ) : (
                <a.icon className={`h-6 w-6 ${a.color}`} />
              )}
            </div>
            <h3 className="font-medium text-sm">{a.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{a.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickActionsPage;
