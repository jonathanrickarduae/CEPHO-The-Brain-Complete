import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Upload, Loader2, FileText, Lock, File, Trash2, ExternalLink, Search } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import type { Document } from "../../../drizzle/schema";

const FILE_ICONS: Record<string, string> = {
  pdf: "📄",
  doc: "📝",
  docx: "📝",
  xls: "📊",
  xlsx: "📊",
  ppt: "📋",
  pptx: "📋",
  png: "🖼️",
  jpg: "🖼️",
  jpeg: "🖼️",
  txt: "📃",
  csv: "📊",
};

const PROJECT_OPTIONS = [
  { value: "1", label: "Celadon" },
  { value: "2", label: "Celanova" },
  { value: "3", label: "Perfect" },
  { value: "4", label: "Olmack" },
  { value: "5", label: "Boundless" },
  { value: "6", label: "Personal" },
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getExt(name: string): string {
  return name.split(".").pop()?.toLowerCase() ?? "file";
}

export default function DocumentLibraryPage() {
  const { data: docs = [], refetch, isLoading } = trpc.documents.getAll.useQuery({});
  const uploadDoc = trpc.documents.upload.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Document uploaded securely");
      setShowUpload(false);
      setUploadState({ name: "", projectId: "", isConfidential: false, tags: "", file: null });
    },
    onError: () => toast.error("Upload failed"),
  });
  const deleteDoc = trpc.documents.delete.useMutation({
    onSuccess: () => { refetch(); toast.success("Document deleted"); },
  });

  const [showUpload, setShowUpload] = useState(false);
  const [search, setSearch] = useState("");
  const [filterProject, setFilterProject] = useState("All");
  const [uploading, setUploading] = useState(false);
  const [uploadState, setUploadState] = useState<{
    name: string;
    projectId: string;
    isConfidential: boolean;
    tags: string;
    file: File | null;
  }>({ name: "", projectId: "", isConfidential: false, tags: "", file: null });
  const fileRef = useRef<HTMLInputElement>(null);

  const documents = docs as Document[];
  const filtered = documents.filter(d => {
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterProject !== "All" && String(d.projectId) !== filterProject) return false;
    return true;
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadState(p => ({ ...p, file, name: p.name || file.name }));
  };

  const handleUpload = async () => {
    if (!uploadState.file || !uploadState.name.trim()) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        uploadDoc.mutate({
          name: uploadState.name,
          fileType: uploadState.file!.type || "application/octet-stream",
          fileSize: uploadState.file!.size,
          fileBase64: base64,
          projectId: uploadState.projectId ? Number(uploadState.projectId) : undefined,
          isConfidential: uploadState.isConfidential,
          tags: uploadState.tags ? uploadState.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        });
      };
      reader.readAsDataURL(uploadState.file);
    } finally {
      setUploading(false);
    }
  };

  const confidentialCount = documents.filter(d => d.isConfidential).length;
  const totalSize = documents.reduce((sum, d) => sum + (d.fileSize ?? 0), 0);

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Document Library</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Secure storage across all companies — {documents.length} documents, {formatBytes(totalSize)}</p>
        </div>
        <Button onClick={() => setShowUpload(true)} className="bg-[oklch(0.78_0.18_195)] text-white hover:bg-[oklch(0.68_0.18_195)] gap-1.5">
          <Upload className="w-4 h-4" /> Upload Document
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-xs text-muted-foreground">Total Documents</p>
          <p className="text-2xl font-bold text-foreground">{documents.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4">
          <p className="text-xs text-muted-foreground">Storage Used</p>
          <p className="text-2xl font-bold text-foreground">{formatBytes(totalSize)}</p>
        </div>
        <div className={`rounded-xl border bg-white p-4 ${confidentialCount > 0 ? "border-[oklch(0.78_0.18_195)]" : "border-border"}`}>
          <p className="text-xs text-muted-foreground flex items-center gap-1"><Lock className="w-3 h-3" /> Confidential</p>
          <p className="text-2xl font-bold text-foreground">{confidentialCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents..." className="pl-8 h-9 text-sm" />
        </div>
        <Select value={filterProject} onValueChange={setFilterProject}>
          <SelectTrigger className="w-36 text-sm h-9"><SelectValue placeholder="Project" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Projects</SelectItem>
            {PROJECT_OPTIONS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Document list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-[oklch(0.78_0.18_195)]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">{search || filterProject !== "All" ? "No documents match your filters" : "No documents yet"}</p>
          <p className="text-xs text-muted-foreground">Upload your first document to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(doc => {
            const ext = getExt(doc.name);
            const icon = FILE_ICONS[ext] ?? "📎";
            const tags = (() => { try { return JSON.parse(doc.tags) as string[]; } catch { return []; } })();
            const project = PROJECT_OPTIONS.find(p => String(doc.projectId) === p.value);
            return (
              <div key={doc.id} className="rounded-xl border border-border bg-white p-4 flex items-center gap-4">
                <div className="text-2xl shrink-0 w-10 text-center">{icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                    {doc.isConfidential ? <Lock className="w-3 h-3 text-[oklch(0.78_0.18_195)] shrink-0" /> : null}
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {project && <Badge variant="outline" className="text-[10px] px-1.5 py-0">{project.label}</Badge>}
                    <span className="text-[11px] text-muted-foreground">{doc.fileSize ? formatBytes(doc.fileSize) : ext.toUpperCase()}</span>
                    <span className="text-[11px] text-muted-foreground">{format(new Date(doc.createdAt), "d MMM yyyy")}</span>
                    {tags.map((tag: string) => <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">{tag}</Badge>)}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {doc.storageUrl && (
                    <a href={doc.storageUrl} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </a>
                  )}
                  <Button size="sm" variant="outline" className="h-7 w-7 p-0 text-rose-500 border-rose-200 hover:bg-rose-50" onClick={() => deleteDoc.mutate({ id: doc.id })}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Lock className="w-4 h-4 text-[oklch(0.78_0.18_195)]" /> Upload Document</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            {/* File drop zone */}
            <div
              className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-[oklch(0.78_0.18_195)] transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              {uploadState.file ? (
                <div className="flex items-center justify-center gap-2">
                  <File className="w-5 h-5 text-[oklch(0.78_0.18_195)]" />
                  <span className="text-sm font-medium text-foreground">{uploadState.file.name}</span>
                  <span className="text-xs text-muted-foreground">({formatBytes(uploadState.file.size)})</span>
                </div>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Click to select a file</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, Word, Excel, PowerPoint, images</p>
                </>
              )}
              <input ref={fileRef} type="file" className="hidden" onChange={handleFileSelect} accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.txt,.csv" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Document Name *</Label>
              <Input value={uploadState.name} onChange={e => setUploadState(p => ({ ...p, name: e.target.value }))} placeholder="Document name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Project</Label>
                <Select value={uploadState.projectId} onValueChange={v => setUploadState(p => ({ ...p, projectId: v }))}>
                  <SelectTrigger className="text-sm h-9"><SelectValue placeholder="Select project" /></SelectTrigger>
                  <SelectContent>
                    {PROJECT_OPTIONS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Tags (comma separated)</Label>
                <Input value={uploadState.tags} onChange={e => setUploadState(p => ({ ...p, tags: e.target.value }))} placeholder="contract, NDA, Q2" className="text-sm" />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={uploadState.isConfidential} onChange={e => setUploadState(p => ({ ...p, isConfidential: e.target.checked }))} className="rounded" />
              <Lock className="w-3.5 h-3.5 text-[oklch(0.78_0.18_195)]" />
              <span className="text-sm text-foreground">Mark as confidential</span>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpload(false)}>Cancel</Button>
            <Button onClick={handleUpload} disabled={!uploadState.file || !uploadState.name.trim() || uploadDoc.isPending || uploading} className="bg-[oklch(0.78_0.18_195)] text-white hover:bg-[oklch(0.68_0.18_195)]">
              {uploadDoc.isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Uploading...</> : "Upload Securely"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
