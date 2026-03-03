/**
 * Knowledge Base Page
 *
 * P2-9: PDF, Word, Excel upload → knowledge base
 * P2-10: URL scrape → knowledge base
 * P2-11: CSV import → knowledge base
 *
 * Allows users to ingest documents, URLs, and CSV files into their
 * personal knowledge base, which is then used for semantic search
 * and agent context injection.
 */

import React, { useRef, useState } from "react";
import { trpc } from "../lib/trpc";
import { PageShell } from "../components/layout/PageShell";
import { DashboardSkeleton } from "../components/shared/LoadingSkeleton";
import {
  Upload,
  Link,
  FileSpreadsheet,
  Trash2,
  CheckCircle,
  AlertCircle,
  FileText,
  Globe,
  Database,
  Loader2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type IngestTab = "document" | "url" | "csv";

interface ToastMessage {
  id: string;
  type: "success" | "error";
  text: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the data URL prefix (e.g. "data:application/pdf;base64,")
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getDocumentIcon(type: string) {
  switch (type) {
    case "pdf":
      return <FileText className="h-4 w-4 text-red-400" />;
    case "word":
      return <FileText className="h-4 w-4 text-blue-400" />;
    case "spreadsheet":
      return <FileSpreadsheet className="h-4 w-4 text-green-400" />;
    case "url":
      return <Globe className="h-4 w-4 text-purple-400" />;
    case "csv":
      return <FileSpreadsheet className="h-4 w-4 text-yellow-400" />;
    default:
      return <Database className="h-4 w-4 text-gray-400" />;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function KnowledgeBasePage() {
  const [activeTab, setActiveTab] = useState<IngestTab>("document");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [csvFilename, setCsvFilename] = useState("");
  const [csvContent, setCsvContent] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Queries ────────────────────────────────────────────────────────────────

  const {
    data: docsData,
    isLoading: docsLoading,
    refetch: refetchDocs,
  } = trpc.dataIngestion.listDocuments.useQuery({ limit: 100, offset: 0 });

  // ─── Mutations ──────────────────────────────────────────────────────────────

  const ingestDocMutation = trpc.dataIngestion.ingestDocument.useMutation({
    onSuccess: result => {
      addToast("success", `Ingested "${result.title}" — ${result.chunksStored} chunks stored`);
      void refetchDocs();
    },
    onError: err => addToast("error", err.message),
  });

  const ingestUrlMutation = trpc.dataIngestion.ingestUrl.useMutation({
    onSuccess: result => {
      addToast("success", `Ingested "${result.title}" — ${result.chunksStored} chunks stored`);
      setUrlInput("");
      void refetchDocs();
    },
    onError: err => addToast("error", err.message),
  });

  const ingestCsvMutation = trpc.dataIngestion.ingestCsv.useMutation({
    onSuccess: result => {
      addToast("success", `Ingested "${result.title}" — ${result.chunksStored} chunks stored`);
      setCsvContent("");
      setCsvFilename("");
      void refetchDocs();
    },
    onError: err => addToast("error", err.message),
  });

  const deleteDocMutation = trpc.dataIngestion.deleteDocument.useMutation({
    onSuccess: () => {
      addToast("success", "Document removed from knowledge base");
      void refetchDocs();
    },
    onError: err => addToast("error", err.message),
  });

  // ─── Helpers ────────────────────────────────────────────────────────────────

  function addToast(type: "success" | "error", text: string) {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, type, text }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64Content = await fileToBase64(file);
      ingestDocMutation.mutate({
        filename: file.name,
        mimeType: file.type,
        base64Content,
      });
    } catch {
      addToast("error", "Failed to read file");
    }
    // Reset input so same file can be re-uploaded
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleUrlIngest() {
    if (!urlInput.trim()) return;
    ingestUrlMutation.mutate({ url: urlInput.trim() });
  }

  function handleCsvIngest() {
    if (!csvContent.trim() || !csvFilename.trim()) return;
    ingestCsvMutation.mutate({ filename: csvFilename, csvContent });
  }

  async function handleCsvFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setCsvFilename(file.name);
    setCsvContent(text);
  }

  const isBusy =
    ingestDocMutation.isPending ||
    ingestUrlMutation.isPending ||
    ingestCsvMutation.isPending;

  if (docsLoading) {
    return (
      <PageShell title="Knowledge Base">
        <DashboardSkeleton />
      </PageShell>
    );
  }

  const documents = docsData?.documents ?? [];

  return (
    <PageShell title="Knowledge Base">
      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm shadow-lg ${
              t.type === "success"
                ? "bg-green-900/90 text-green-200"
                : "bg-red-900/90 text-red-200"
            }`}
          >
            {t.type === "success" ? (
              <CheckCircle className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            {t.text}
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Knowledge Base</h1>
          <p className="mt-1 text-sm text-gray-400">
            Upload documents, scrape URLs, or import CSV data. All content is
            embedded and stored for semantic search by your AI agents.
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Documents",
              value: documents.filter(d => ["pdf", "word"].includes(d.type)).length,
              icon: <FileText className="h-5 w-5 text-blue-400" />,
            },
            {
              label: "Web Pages",
              value: documents.filter(d => d.type === "url").length,
              icon: <Globe className="h-5 w-5 text-purple-400" />,
            },
            {
              label: "Data Files",
              value: documents.filter(d => ["csv", "spreadsheet"].includes(d.type)).length,
              icon: <FileSpreadsheet className="h-5 w-5 text-green-400" />,
            },
          ].map(stat => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <div className="flex items-center gap-3">
                {stat.icon}
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-gray-400">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Ingest panel */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Add to Knowledge Base</h2>

          {/* Tabs */}
          <div className="mb-6 flex gap-1 rounded-lg bg-white/5 p-1">
            {(
              [
                { id: "document", label: "Document", icon: <Upload className="h-4 w-4" /> },
                { id: "url", label: "URL", icon: <Link className="h-4 w-4" /> },
                { id: "csv", label: "CSV / Data", icon: <FileSpreadsheet className="h-4 w-4" /> },
              ] as { id: IngestTab; label: string; icon: React.ReactNode }[]
            ).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-purple-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Document upload */}
          {activeTab === "document" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                Upload a PDF, Word (.docx), or Excel (.xlsx) file. The content
                will be chunked and embedded for semantic search.
              </p>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 p-10 transition-colors hover:border-purple-500/50 hover:bg-purple-500/5"
              >
                {ingestDocMutation.isPending ? (
                  <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
                ) : (
                  <Upload className="h-8 w-8 text-gray-500" />
                )}
                <p className="mt-3 text-sm text-gray-400">
                  {ingestDocMutation.isPending
                    ? "Processing document…"
                    : "Click to upload or drag and drop"}
                </p>
                <p className="mt-1 text-xs text-gray-600">PDF, DOCX, XLSX up to 20MB</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          {/* URL ingestion */}
          {activeTab === "url" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                Enter a public URL to scrape. The page text will be extracted,
                chunked, and embedded for semantic search.
              </p>
              <div className="flex gap-3">
                <input
                  type="url"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleUrlIngest()}
                  placeholder="https://example.com/article"
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                />
                <button
                  onClick={handleUrlIngest}
                  disabled={!urlInput.trim() || ingestUrlMutation.isPending}
                  className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
                >
                  {ingestUrlMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Globe className="h-4 w-4" />
                  )}
                  Scrape
                </button>
              </div>
            </div>
          )}

          {/* CSV ingestion */}
          {activeTab === "csv" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                Upload a CSV file or paste CSV text. Each row will be converted
                to a text representation and embedded for semantic search.
              </p>
              <div className="flex gap-3">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-400 transition-colors hover:border-purple-500/50 hover:text-white">
                  <FileSpreadsheet className="h-4 w-4" />
                  Upload CSV file
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvFileUpload}
                    className="hidden"
                  />
                </label>
                {csvFilename && (
                  <span className="flex items-center gap-1 text-sm text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    {csvFilename}
                  </span>
                )}
              </div>
              {csvContent && (
                <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                  <p className="text-xs text-gray-500">
                    Preview (first 200 chars):
                  </p>
                  <p className="mt-1 font-mono text-xs text-gray-300">
                    {csvContent.slice(0, 200)}…
                  </p>
                </div>
              )}
              <button
                onClick={handleCsvIngest}
                disabled={!csvContent.trim() || !csvFilename.trim() || ingestCsvMutation.isPending}
                className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
              >
                {ingestCsvMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Database className="h-4 w-4" />
                )}
                Ingest CSV
              </button>
            </div>
          )}
        </div>

        {/* Ingested documents list */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Ingested Documents ({documents.length})
          </h2>

          {documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Database className="h-10 w-10 text-gray-600" />
              <p className="mt-3 text-sm text-gray-500">
                No documents ingested yet. Upload a file or scrape a URL to get
                started.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map(doc => (
                <div
                  key={doc.source}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    {getDocumentIcon(doc.type)}
                    <div>
                      <p className="text-sm font-medium text-white">
                        {doc.title || doc.source}
                      </p>
                      <p className="text-xs text-gray-500">
                        {doc.chunkCount} chunks ·{" "}
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      deleteDocMutation.mutate({ source: doc.source })
                    }
                    disabled={deleteDocMutation.isPending || isBusy}
                    className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                    title="Remove from knowledge base"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
