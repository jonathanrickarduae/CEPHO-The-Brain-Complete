import { useState } from "react";
import { trpc } from "@/lib/trpc";
import BrainLayout from "@/components/BrainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Download, 
  Eye, 
  CheckCircle, 
  Clock, 
  XCircle,
  Search,
  Filter,
  Lightbulb,
  Rocket,
  FileSpreadsheet,
  MoreHorizontal,
  Trash2,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DocumentType = "all" | "innovation_brief" | "project_genesis" | "report" | "other";
type QAStatus = "all" | "approved" | "pending" | "rejected";

export default function DocumentLibrary() {
  const [activeType, setActiveType] = useState<DocumentType>("all");
  const [qaFilter, setQaFilter] = useState<QAStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const { data: documents, isLoading, refetch } = trpc.documentLibrary.list.useQuery({
    type: activeType,
    qaStatus: qaFilter,
    limit: 50,
    offset: 0,
  });

  const generatePDFMutation = trpc.documentLibrary.generatePDF.useMutation({
    onSuccess: (data) => {
      toast.success("Document generated successfully");
      if (data.markdownUrl) {
        window.open(data.markdownUrl, "_blank");
      }
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to generate PDF: ${error.message}`);
    },
  });

  const deleteMutation = trpc.documentLibrary.delete.useMutation({
    onSuccess: () => {
      toast.success("Document deleted");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  const updateQAMutation = trpc.documentLibrary.updateQAStatus.useMutation({
    onSuccess: () => {
      toast.success("QA status updated");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update QA status: ${error.message}`);
    },
  });

  const filteredDocuments = documents?.filter((doc) => {
    if (!searchQuery) return true;
    return (
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.documentId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }) || [];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "innovation_brief":
        return <Lightbulb className="h-4 w-4 text-amber-500" />;
      case "project_genesis":
        return <Rocket className="h-4 w-4 text-blue-500" />;
      case "report":
        return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getQABadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="bg-amber-600">
            <Clock className="h-3 w-3 mr-1" />
            Pending QA
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const getClassificationBadge = (classification: string) => {
    const colors: Record<string, string> = {
      public: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      internal: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      confidential: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
      restricted: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return (
      <Badge variant="outline" className={colors[classification] || ""}>
        {classification}
      </Badge>
    );
  };

  const handleGeneratePDF = (doc: any) => {
    generatePDFMutation.mutate({
      documentId: doc.documentId,
      type: doc.type,
    });
  };

  const handleDelete = (documentId: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      deleteMutation.mutate({ documentId });
    }
  };

  const handleApprove = (documentId: string) => {
    updateQAMutation.mutate({
      documentId,
      status: "approved",
      notes: "Approved by Chief of Staff",
    });
  };

  const handlePreview = (doc: any) => {
    setSelectedDocument(doc);
    setIsPreviewOpen(true);
  };

  return (
    <BrainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Document Library</h1>
            <p className="text-muted-foreground">
              All CEPHO generated documents with QA status tracking
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Documents</p>
                  <p className="text-2xl font-bold">{documents?.length || 0}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">QA Approved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {documents?.filter((d) => d.qaStatus === "approved").length || 0}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {documents?.filter((d) => d.qaStatus === "pending").length || 0}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Innovation Briefs</p>
                  <p className="text-2xl font-bold text-cyan-600">
                    {documents?.filter((d) => d.type === "innovation_brief").length || 0}
                  </p>
                </div>
                <Lightbulb className="h-8 w-8 text-cyan-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filter by:</span>
              </div>
              <Tabs value={activeType} onValueChange={(v) => setActiveType(v as DocumentType)}>
                <TabsList>
                  <TabsTrigger value="all">All Types</TabsTrigger>
                  <TabsTrigger value="innovation_brief">Innovation Briefs</TabsTrigger>
                  <TabsTrigger value="project_genesis">Project Genesis</TabsTrigger>
                  <TabsTrigger value="report">Reports</TabsTrigger>
                </TabsList>
              </Tabs>
              <Tabs value={qaFilter} onValueChange={(v) => setQaFilter(v as QAStatus)}>
                <TabsList>
                  <TabsTrigger value="all">All Status</TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
            <CardDescription>
              {filteredDocuments.length} document{filteredDocuments.length !== 1 ? "s" : ""} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No documents found</h3>
                <p className="text-muted-foreground">
                  Documents generated from Innovation Hub and Project Genesis will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-muted">
                        {getTypeIcon(doc.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{doc.title}</h4>
                          {getQABadge(doc.qaStatus)}
                          {getClassificationBadge(doc.classification)}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span>{doc.documentId}</span>
                          <span>•</span>
                          <span>{format(new Date(doc.createdAt), "MMM d, yyyy 'at' h:mm a")}</span>
                          {doc.qaApprover && (
                            <>
                              <span>•</span>
                              <span>Approved by {doc.qaApprover}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreview(doc)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {doc.markdownUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => doc.markdownUrl && window.open(doc.markdownUrl, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleGeneratePDF(doc)}
                        disabled={generatePDFMutation.isPending}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {doc.qaStatus === "pending" && (
                            <DropdownMenuItem onClick={() => handleApprove(doc.documentId)}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve (Chief of Staff)
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDelete(doc.documentId)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedDocument && getTypeIcon(selectedDocument.type)}
                {selectedDocument?.title}
              </DialogTitle>
              <DialogDescription>
                {selectedDocument?.documentId} • Created{" "}
                {selectedDocument && format(new Date(selectedDocument.createdAt), "PPP")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {selectedDocument && getQABadge(selectedDocument.qaStatus)}
                {selectedDocument && getClassificationBadge(selectedDocument.classification)}
              </div>
              {selectedDocument?.content && (
                <div className="prose dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                    {JSON.stringify(JSON.parse(selectedDocument.content), null, 2)}
                  </pre>
                </div>
              )}
              <div className="flex justify-end gap-2">
                {selectedDocument?.qaStatus === "pending" && (
                  <Button onClick={() => {
                    handleApprove(selectedDocument.documentId);
                    setIsPreviewOpen(false);
                  }}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Document
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    handleGeneratePDF(selectedDocument);
                    setIsPreviewOpen(false);
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Generate PDF
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </BrainLayout>
  );
}
