import { useState, useEffect } from "react";
import { FileText, File, Loader2, Trash2, ExternalLink, Search, FileType, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Doc {
  id: string;
  name: string | null;
  file_url: string | null;
  created_at: string | null;
  extracted_text: string | null;
  file_size: number | null;
  file_type: string | null;
}

const formatFileSize = (bytes: number | null) => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileIcon = (fileType: string | null) => {
  if (!fileType) return "📄";
  if (fileType.includes("pdf")) return "📕";
  if (fileType.includes("word") || fileType.includes("document")) return "📘";
  if (fileType === "text/plain") return "📝";
  return "📄";
};

const getFileLabel = (fileType: string | null) => {
  if (!fileType) return "File";
  if (fileType.includes("pdf")) return "PDF";
  if (fileType.includes("word") || fileType.includes("document")) return "DOCX";
  if (fileType === "text/plain") return "TXT";
  return "File";
};

const DocumentsPage = () => {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewingDoc, setViewingDoc] = useState<Doc | null>(null);

  useEffect(() => {
    const fetchDocs = async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to load documents");
      } else {
        setDocs((data as any) || []);
      }
      setLoading(false);
    };
    fetchDocs();
  }, []);

  const deleteDoc = async (id: string) => {
    const { error } = await supabase.from("documents").delete().eq("id", id);
    if (!error) {
      setDocs((prev) => prev.filter((d) => d.id !== id));
      toast.success("Dokumenti u fshi");
    } else {
      toast.error("Gabim gjatë fshirjes");
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("sq", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filtered = docs.filter((d) =>
    !search || (d.name || "").toLowerCase().includes(search.toLowerCase())
  );

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
        <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
          📁 Documents
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Të gjitha dokumentet tuaja të ngarkuara
        </p>
      </div>

      {docs.length > 0 && (
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Kërko dokumente..."
            className="pl-10 bg-muted/50 border-border/50"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      )}

      {docs.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground/20" />
          <p className="text-muted-foreground text-lg font-medium mb-2">Nuk ka dokumente ende</p>
          <p className="text-muted-foreground/70 text-sm">
            Ngarkoni dokumente në AI Chat për të filluar.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Search className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground">Asnjë dokument nuk përputhet me kërkimin tuaj.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className="glass-card p-4 flex items-center gap-4 hover:border-primary/30 transition-all cursor-pointer"
              onClick={() => setViewingDoc(doc)}
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-lg">
                {getFileIcon(doc.file_type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{doc.name || "Untitled"}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  <span>{formatDate(doc.created_at)}</span>
                  <span>{formatFileSize(doc.file_size)}</span>
                  <span className="category-badge bg-muted text-muted-foreground text-[10px] px-1.5 py-0.5">
                    {getFileLabel(doc.file_type)}
                  </span>
                </div>
              </div>
              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                {doc.file_url && (
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/70 hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Fshi dokumentin?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Jeni i sigurt që dëshironi të fshini "{doc.name}"? Ky veprim nuk mund të kthehet.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Anulo</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteDoc(doc.id)} className="bg-destructive text-destructive-foreground">
                        Fshi
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Viewer Modal */}
      <Dialog open={!!viewingDoc} onOpenChange={() => setViewingDoc(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-lg">{getFileIcon(viewingDoc?.file_type ?? null)}</span>
              {viewingDoc?.name}
            </DialogTitle>
            <DialogDescription>
              {viewingDoc && (
                <span className="flex items-center gap-2">
                  {formatFileSize(viewingDoc.file_size)} • {getFileLabel(viewingDoc.file_type)} • {formatDate(viewingDoc.created_at)}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 rounded-lg bg-muted/30 text-sm leading-relaxed whitespace-pre-wrap max-h-[50vh] overflow-y-auto">
            {viewingDoc?.extracted_text || (
              <p className="text-muted-foreground italic">
                Përmbajtja nuk është e disponueshme. Dokumenti mund të mos jetë përpunuar ende.
              </p>
            )}
          </div>
          {viewingDoc?.file_url && (
            <Button variant="outline" className="w-full gap-2" asChild>
              <a href={viewingDoc.file_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" /> Hap skedarin origjinal
              </a>
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentsPage;
