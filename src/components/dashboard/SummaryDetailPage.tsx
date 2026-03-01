import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Brain, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const SummaryDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Summaries are stored in sessionStorage by SummariesPage
  const stored = sessionStorage.getItem("mailmind_summaries");
  const summaries = stored ? JSON.parse(stored) : [];
  const index = Number(id);
  const summary = summaries[index];

  if (!summary) {
    return (
      <div className="text-center py-16">
        <Brain className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
        <p className="text-muted-foreground mb-4">Përmbledhja nuk u gjet. Gjenero përmbledhjet së pari.</p>
        <Button variant="outline" onClick={() => navigate("/dashboard/summaries")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kthehu te Përmbledhjet
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Button
        variant="ghost"
        onClick={() => navigate("/dashboard/summaries")}
        className="mb-4 -ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Kthehu te Përmbledhjet
      </Button>

      <div className="glass-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <Brain className="h-5 w-5 text-primary shrink-0" />
          <h1 className="font-heading text-xl font-bold">{summary.thread_title}</h1>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4" />
          <span>{summary.email_count} email-e të përmbledhura</span>
        </div>

        <div>
          <h2 className="text-sm font-semibold mb-2">Përmbledhja</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{summary.summary}</p>
        </div>

        {summary.action_items?.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold mb-2 text-primary">Action Items</h2>
            <ul className="space-y-2">
              {summary.action_items.map((item: string, j: number) => (
                <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryDetailPage;
