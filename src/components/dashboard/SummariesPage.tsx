import { Brain, ChevronRight } from "lucide-react";

const summaries = [
  { id: 1, thread: "Q4 Product Roadmap", emails: 8, summary: "Team discussed delaying Feature X to Q1, prioritizing bug fixes. Sarah shared updated roadmap. Action: review by Friday.", date: "Today" },
  { id: 2, thread: "Client Onboarding - Acme Corp", emails: 12, summary: "Onboarding progressing. Legal review complete. Technical setup scheduled for next week. Waiting on API keys from client.", date: "Today" },
  { id: 3, thread: "Budget Approval Q1 2025", emails: 5, summary: "Finance approved the Q1 budget with minor adjustments. Marketing budget reduced by 10%. Engineering headcount approved.", date: "Yesterday" },
  { id: 4, thread: "Office Holiday Party Planning", emails: 15, summary: "Party set for Dec 20th. Venue booked at Grand Hall. Catering confirmed. 45 RSVPs received so far.", date: "Yesterday" },
];

const SummariesPage = () => (
  <div>
    <div className="mb-6">
      <h1 className="font-heading text-2xl font-bold">Thread Summaries</h1>
      <p className="text-muted-foreground text-sm mt-1">AI-powered summaries of your email conversations</p>
    </div>
    <div className="space-y-3">
      {summaries.map((s) => (
        <div key={s.id} className="glass-card p-5 hover:border-primary/30 transition-all cursor-pointer group">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary shrink-0" />
                <span className="font-medium text-sm">{s.thread}</span>
                <span className="text-xs text-muted-foreground">{s.emails} emails · {s.date}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{s.summary}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default SummariesPage;
