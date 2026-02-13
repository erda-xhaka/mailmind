import { FileText, Download, Eye, File } from "lucide-react";
import { Button } from "@/components/ui/button";

const docs = [
  { id: 1, name: "Invoice #1089.pdf", from: "David Park", size: "245 KB", date: "Dec 15", type: "Invoice" },
  { id: 2, name: "Q4_Roadmap_v3.xlsx", from: "Sarah Chen", size: "1.2 MB", date: "Dec 14", type: "Spreadsheet" },
  { id: 3, name: "Contract_AcmeCorp.pdf", from: "Legal Team", size: "890 KB", date: "Dec 12", type: "Contract" },
  { id: 4, name: "Meeting_Notes_Dec10.docx", from: "Team", size: "56 KB", date: "Dec 10", type: "Notes" },
  { id: 5, name: "Design_Mockups.zip", from: "UI Team", size: "8.5 MB", date: "Dec 8", type: "Archive" },
];

const DocumentsPage = () => (
  <div>
    <div className="mb-6">
      <h1 className="font-heading text-2xl font-bold">Documents</h1>
      <p className="text-muted-foreground text-sm mt-1">Attachments extracted from your emails</p>
    </div>
    <div className="space-y-2">
      {docs.map((doc) => (
        <div key={doc.id} className="glass-card p-4 flex items-center gap-4 hover:border-primary/30 transition-all">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <File className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{doc.name}</p>
            <p className="text-xs text-muted-foreground">From {doc.from} · {doc.size} · {doc.date}</p>
          </div>
          <span className="category-badge bg-muted text-muted-foreground">{doc.type}</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default DocumentsPage;
