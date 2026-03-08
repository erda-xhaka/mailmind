import { useState, useEffect } from "react";
import { FileText, Loader2, Trash2, ExternalLink, Search, X, Eye, Download, Clock, HardDrive } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const FILE_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  pdf: { icon: "📕", label: "PDF", color: "bg-red-500/10 text-red-400 border-red-500/20" },
  word: { icon: "📘", label: "DOCX", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  text: { icon: "📝", label: "TXT", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  default: { icon: "📄", label: "Skedar", color: "bg-muted text-muted-foreground border-border" },
};

const getFileConfig = (fileType: string | null) => {
  if (!fileType) return FILE_CONFIG.default;
  if (fileType.includes("pdf")) return FILE_CONFIG.pdf;
  if (fileType.includes("word") || fileType.includes("document")) return FILE_CONFIG.word;
  if (fileType === "text/plain") return FILE_CONFIG.text;
  return FILE_CONFIG.default;
};

type FilterType = "all" | "pdf" | "word" | "text";

const DocumentsPage = () => {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewingDoc, setViewingDoc] = useState<Doc | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    const fetchDocs = async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Nuk u arrit të ngarkoheshin dokumentet");
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
      toast.success("Dokumenti u fshi me sukses");
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

  const formatRelativeDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Tani";
    if (diffMins < 60) return `${diffMins} min më parë`;
    if (diffHours < 24) return `${diffHours} orë më parë`;
    if (diffDays < 7) return `${diffDays} ditë më parë`;
    return formatDate(dateStr);
  };

  const matchesFilter = (doc: Doc) => {
    if (filter === "all") return true;
    const ft = doc.file_type || "";
    if (filter === "pdf") return ft.includes("pdf");
    if (filter === "word") return ft.includes("word") || ft.includes("document");
    if (filter === "text") return ft === "text/plain";
    return true;
  };

  const filtered = docs
    .filter((d) => !search || (d.name || "").toLowerCase().includes(search.toLowerCase()))
    .filter(matchesFilter);

  const totalSize = docs.reduce((sum, d) => sum + (d.file_size || 0), 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Duke ngarkuar dokumentet...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
          📁 Dokumentet
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Menaxhoni të gjitha dokumentet tuaja të ngarkuara
        </p>
      </div>

      {/* Stats Bar */}
      {docs.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="glass-card p-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-lg font-bold leading-none">{docs.length}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Dokumente</p>
            </div>
          </div>
          <div className="glass-card p-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <HardDrive className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-lg font-bold leading-none">{formatFileSize(totalSize)}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Hapësirë</p>
            </div>
          </div>
          <div className="glass-card p-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-lg font-bold leading-none truncate">{formatRelativeDate(docs[0]?.created_at)}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Më i fundit</p>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      {docs.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Kërko dokumente..."
              className="pl-10 bg-muted/50 border-border/50"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
              </button>
            )}
          </div>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)} className="shrink-0">
            <TabsList className="h-10">
              <TabsTrigger value="all" className="text-xs px-3">Të gjitha</TabsTrigger>
              <TabsTrigger value="pdf" className="text-xs px-3">📕 PDF</TabsTrigger>
              <TabsTrigger value="word" className="text-xs px-3">📘 DOCX</TabsTrigger>
              <TabsTrigger value="text" className="text-xs px-3">📝 TXT</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      {/* Empty State */}
      {docs.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="h-20 w-20 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center mx-auto mb-5">
            <FileText className="h-10 w-10 text-primary/30" />
          </div>
          <p className="text-foreground text-lg font-semibold mb-2">Nuk ka dokumente ende</p>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Ngarkoni dokumente përmes AI Chat-it për t'i ruajtur dhe menaxhuar këtu.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <Search className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground font-medium">Asnjë dokument nuk u gjet</p>
          <p className="text-muted-foreground/60 text-sm mt-1">Provoni të ndryshoni filtrat ose kërkimin.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((doc) => {
            const config = getFileConfig(doc.file_type);
            const hasContent = !!doc.extracted_text && doc.extracted_text.trim().length > 0;

            return (
              <div
                key={doc.id}
                className="glass-card p-4 flex items-center gap-4 hover:border-primary/30 transition-all cursor-pointer group"
                onClick={() => setViewingDoc(doc)}
              >
                <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-xl group-hover:scale-105 transition-transform">
                  {config.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{doc.name || "Pa titull"}</p>
                    {hasContent && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-primary/20 text-primary shrink-0">
                        Lexueshëm
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span>{formatRelativeDate(doc.created_at)}</span>
                    <span className="text-border">•</span>
                    <span>{formatFileSize(doc.file_size)}</span>
                    <span className="text-border">•</span>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 ${config.color}`}>
                      {config.label}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewingDoc(doc)}>
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  {doc.file_url && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-3.5 w-3.5" />
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
            );
          })}
        </div>
      )}

      {/* Document Viewer Modal */}
      <Dialog open={!!viewingDoc} onOpenChange={() => setViewingDoc(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-xl">{getFileConfig(viewingDoc?.file_type ?? null).icon}</span>
              <span className="truncate">{viewingDoc?.name || "Pa titull"}</span>
            </DialogTitle>
            <DialogDescription asChild>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={`text-xs ${getFileConfig(viewingDoc?.file_type ?? null).color}`}>
                  {getFileConfig(viewingDoc?.file_type ?? null).label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatFileSize(viewingDoc?.file_size ?? null)}
                </span>
                <span className="text-border">•</span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(viewingDoc?.created_at ?? null)}
                </span>
              </div>
            </DialogDescription>
          </DialogHeader>

          <DocumentContentViewer doc={viewingDoc} />

          {viewingDoc?.file_url && (
            <Button variant="outline" className="w-full gap-2" asChild>
              <a href={viewingDoc.file_url} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" /> Shkarko skedarin origjinal
              </a>
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

/** Separated content viewer for the modal — handles all states gracefully */
const DocumentContentViewer = ({ doc }: { doc: Doc | null }) => {
  if (!doc) return null;

  const text = doc.extracted_text?.trim();
  const hasContent = !!text && text.length > 0;
  const isPdf = doc.file_type?.includes("pdf");

  // If we have real extracted text content, show it nicely
  if (hasContent) {
    // Check if it's a placeholder message (not real content)
    const isPlaceholder = text.startsWith("[") && text.endsWith("]");

    if (isPlaceholder) {
      return (
        <div className="rounded-xl border border-border/50 bg-muted/20 p-6 text-center">
          <div className="h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center mx-auto mb-3">
            <FileText className="h-6 w-6 text-primary/40" />
          </div>
          {isPdf ? (
            <>
              <p className="text-sm font-medium text-foreground mb-1">Dokument PDF</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Përmbajtja e skedarëve PDF nuk mund të lexohet automatikisht ende. 
                Shkarkoni skedarin për ta parë.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-foreground mb-1">Përmbajtja në përpunim</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Ky dokument po përpunohet. Provoni përsëri pas disa minutash.
              </p>
            </>
          )}
          {doc.file_url && (
            <Button variant="ghost" size="sm" className="mt-3 gap-1.5 text-xs" asChild>
              <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3" /> Hap skedarin
              </a>
            </Button>
          )}
        </div>
      );
    }

    // Real content — show it
    return (
      <div className="rounded-xl border border-border/50 bg-muted/10 overflow-hidden">
        <div className="px-4 py-2 border-b border-border/30 bg-muted/20 flex items-center justify-between">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Përmbajtja</span>
          <span className="text-[11px] text-muted-foreground">{text.length.toLocaleString()} karaktere</span>
        </div>
        <div className="p-4 text-sm leading-relaxed whitespace-pre-wrap max-h-[50vh] overflow-y-auto font-mono text-[13px]">
          {text}
        </div>
      </div>
    );
  }

  // No content at all
  return (
    <div className="rounded-xl border border-border/50 bg-muted/20 p-6 text-center">
      <div className="h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center mx-auto mb-3">
        <FileText className="h-6 w-6 text-primary/40" />
      </div>
      {isPdf ? (
        <>
          <p className="text-sm font-medium text-foreground mb-1">Dokument PDF</p>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            Skedarët PDF duhet të shkarkohen për t'u lexuar. Klikoni butonin më poshtë.
          </p>
        </>
      ) : (
        <>
          <p className="text-sm font-medium text-foreground mb-1">Ende pa u përpunuar</p>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            Ky dokument nuk është përpunuar ende. Provoni ta ringarkoni ose shkarkoni skedarin origjinal.
          </p>
        </>
      )}
      {doc.file_url && (
        <Button variant="ghost" size="sm" className="mt-3 gap-1.5 text-xs" asChild>
          <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
            <Download className="h-3 w-3" /> Shkarko skedarin
          </a>
        </Button>
      )}
    </div>
  );
};

export default DocumentsPage;
