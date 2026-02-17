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
  ExternalLink,
  Mail,
  Send,
  Plus,
  X,
  History,
  FileDown,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type DocumentType = "all" | "innovation_brief" | "project_genesis" | "report" | "other";
type QAStatus = "all" | "approved" | "pending" | "rejected";

export default function DocumentLibrary() {
  const [activeType, setActiveType] = useState<DocumentType>("all");
  const [qaFilter, setQaFilter] = useState<QAStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Email dialog state
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState<Array<{ email: string; name: string }>>([]);
  const [newRecipientEmail, setNewRecipientEmail] = useState("");
  const [newRecipientName, setNewRecipientName] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailDocument, setEmailDocument] = useState<any>(null);
  
  // QA Approval dialog state
  const [isQADialogOpen, setIsQADialogOpen] = useState(false);
  const [qaDocument, setQaDocument] = useState<any>(null);
  const [qaAction, setQaAction] = useState<"approve" | "reject">("approve");
  const [qaNotes, setQaNotes] = useState("");
  
  // Email history dialog state
  const [isEmailHistoryOpen, setIsEmailHistoryOpen] = useState(false);
  const [emailHistoryDocument, setEmailHistoryDocument] = useState<any>(null);

  const { data: documents, isLoading, refetch } = trpc.documentLibrary.list.useQuery({
    type: activeType,
    qaStatus: qaFilter,
    limit: 50,
    offset: 0,
  });

  const generatePDFMutation = trpc.documentLibrary.generatePDF.useMutation({
    onSuccess: (data) => {
      toast.success("Document generated successfully");
      // Open the markdown URL for viewing/downloading
      if (data.markdownUrl) {
        // Create a download link
        const link = document.createElement('a');
        link.href = data.markdownUrl;
        link.download = `document.md`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to generate document: ${error.message}`);
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
      toast.success(qaAction === "approve" ? "Document approved" : "Document rejected");
      setIsQADialogOpen(false);
      setQaDocument(null);
      setQaNotes("");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update QA status: ${error.message}`);
    },
  });

  const sendEmailMutation = trpc.documentLibrary.sendEmail.useMutation({
    onSuccess: (data) => {
      toast.success(`Document sent to ${data.sent} recipient(s)`);
      setIsEmailDialogOpen(false);
      resetEmailForm();
    },
    onError: (error) => {
      toast.error(`Failed to send: ${error.message}`);
    },
  });

  const { data: emailHistory } = trpc.documentLibrary.getEmailHistory.useQuery(
    { documentId: emailHistoryDocument?.documentId || "" },
    { enabled: !!emailHistoryDocument?.documentId && isEmailHistoryOpen }
  );

  const resetEmailForm = () => {
    setEmailRecipients([]);
    setNewRecipientEmail("");
    setNewRecipientName("");
    setEmailSubject("");
    setEmailMessage("");
    setEmailDocument(null);
  };

  const handleOpenEmailDialog = (doc: any) => {
    setEmailDocument(doc);
    setEmailSubject(`Document Shared: ${doc.title}`);
    setIsEmailDialogOpen(true);
  };

  const handleAddRecipient = () => {
    if (newRecipientEmail && newRecipientEmail.includes("@")) {
      setEmailRecipients([...emailRecipients, { email: newRecipientEmail, name: newRecipientName }]);
      setNewRecipientEmail("");
      setNewRecipientName("");
    } else {
      toast.error("Please enter a valid email address");
    }
  };

  const handleRemoveRecipient = (index: number) => {
    setEmailRecipients(emailRecipients.filter((_, i) => i !== index));
  };

  const handleSendEmail = () => {
    if (emailRecipients.length === 0) {
      toast.error("Please add at least one recipient");
      return;
    }
    if (!emailDocument) return;

    sendEmailMutation.mutate({
      documentId: emailDocument.documentId,
      recipients: emailRecipients,
      subject: emailSubject || undefined,
      message: emailMessage || undefined,
      includeAsLink: true,
    });
  };

  const handleOpenQADialog = (doc: any, action: "approve" | "reject") => {
    setQaDocument(doc);
    setQaAction(action);
    setQaNotes("");
    setIsQADialogOpen(true);
  };

  const handleQASubmit = () => {
    if (!qaDocument) return;
    
    updateQAMutation.mutate({
      documentId: qaDocument.documentId,
      status: qaAction === "approve" ? "approved" : "rejected",
      notes: qaNotes || undefined,
    });
  };

  const handleOpenEmailHistory = (doc: any) => {
    setEmailHistoryDocument(doc);
    setIsEmailHistoryOpen(true);
  };

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
        return <FileText className="h-4 w-4 text-foreground/60" />;
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
          <Badge variant="secondary" className="bg-amber-600 text-white">
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

  const handlePreview = (doc: any) => {
    setSelectedDocument(doc);
    setIsPreviewOpen(true);
  };

  // Parse and render document content nicely
  const renderDocumentContent = (content: string) => {
    try {
      const parsed = JSON.parse(content);
      return (
        <div className="space-y-4">
          {parsed.description && (
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">Description</h4>
              <p className="text-sm">{parsed.description}</p>
            </div>
          )}
          {parsed.assessments && parsed.assessments.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">Assessments</h4>
              <div className="space-y-2">
                {parsed.assessments.map((a: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm capitalize">{a.type?.replace(/_/g, ' ')}</span>
                    <Badge variant={a.score >= 70 ? "default" : a.score >= 50 ? "secondary" : "destructive"}>
                      {Math.round(a.score)}/100
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
          {parsed.recommendation && (
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">Recommendation</h4>
              <Badge className={
                parsed.recommendation.decision === 'proceed' ? 'bg-green-600' :
                parsed.recommendation.decision === 'refine' ? 'bg-amber-600' :
                'bg-red-600'
              }>
                {parsed.recommendation.decision?.toUpperCase()}
              </Badge>
              {parsed.recommendation.rationale && (
                <p className="text-sm mt-2">{parsed.recommendation.rationale}</p>
              )}
            </div>
          )}
          {parsed.scenarios && parsed.scenarios.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">Investment Scenarios</h4>
              <div className="space-y-2">
                {parsed.scenarios.map((s: any, i: number) => (
                  <div key={i} className="p-2 bg-muted rounded">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{s.name}</span>
                      {s.isRecommended && <Badge variant="default" className="bg-green-600">Recommended</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Investment: £{s.amount?.toLocaleString()} | Risk: {s.riskLevel} | Timeline: {s.timeline}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    } catch {
      return <pre className="whitespace-pre-wrap text-sm">{content}</pre>;
    }
  };

  return (
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
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg border bg-card animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-muted w-10 h-10" />
                      <div className="space-y-2">
                        <div className="h-4 w-48 bg-muted rounded" />
                        <div className="h-3 w-32 bg-muted rounded" />
                      </div>
                    </div>
                    <div className="h-8 w-20 bg-muted rounded" />
                  </div>
                ))}
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-medium">{doc.title}</h4>
                          {getQABadge(doc.qaStatus)}
                          {getClassificationBadge(doc.classification)}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1 flex-wrap">
                          <span>{doc.documentId}</span>
                          <span>•</span>
                          <span>{format(new Date(doc.createdAt), "MMM d, yyyy 'at' h:mm a")}</span>
                          {doc.qaApprover && (
                            <>
                              <span>•</span>
                              <span className="text-green-600">Approved by {doc.qaApprover}</span>
                            </>
                          )}
                          {doc.qaNotes && (
                            <>
                              <span>•</span>
                              <span className="italic">"{doc.qaNotes}"</span>
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
                        title="Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleGeneratePDF(doc)}
                        disabled={generatePDFMutation.isPending}
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEmailDialog(doc)}
                        title="Send via Email"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {doc.qaStatus === "pending" && (
                            <>
                              <DropdownMenuItem onClick={() => handleOpenQADialog(doc, "approve")}>
                                <ThumbsUp className="h-4 w-4 mr-2 text-green-600" />
                                Approve Document
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOpenQADialog(doc, "reject")}>
                                <ThumbsDown className="h-4 w-4 mr-2 text-red-600" />
                                Reject Document
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          {doc.markdownUrl && (
                            <DropdownMenuItem onClick={() => doc.markdownUrl && window.open(doc.markdownUrl, "_blank")}>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Open in New Tab
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleOpenEmailHistory(doc)}>
                            <History className="h-4 w-4 mr-2" />
                            Email History
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
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
                <div className="bg-muted p-4 rounded-lg">
                  {renderDocumentContent(selectedDocument.content)}
                </div>
              )}
              <div className="flex justify-end gap-2">
                {selectedDocument?.qaStatus === "pending" && (
                  <>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setIsPreviewOpen(false);
                        handleOpenQADialog(selectedDocument, "reject");
                      }}
                    >
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button onClick={() => {
                      setIsPreviewOpen(false);
                      handleOpenQADialog(selectedDocument, "approve");
                    }}>
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    handleGeneratePDF(selectedDocument);
                  }}
                  disabled={generatePDFMutation.isPending}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* QA Approval Dialog */}
        <Dialog open={isQADialogOpen} onOpenChange={(open) => {
          setIsQADialogOpen(open);
          if (!open) {
            setQaDocument(null);
            setQaNotes("");
          }
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {qaAction === "approve" ? (
                  <ThumbsUp className="h-5 w-5 text-green-600" />
                ) : (
                  <ThumbsDown className="h-5 w-5 text-red-600" />
                )}
                {qaAction === "approve" ? "Approve Document" : "Reject Document"}
              </DialogTitle>
              <DialogDescription>
                {qaAction === "approve" 
                  ? "Confirm QA approval for this document. Once approved, it will be marked as Chief of Staff reviewed."
                  : "Reject this document and provide feedback for revision."
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {qaDocument && (
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    {getTypeIcon(qaDocument.type)}
                    <span className="font-medium">{qaDocument.title}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {qaDocument.documentId}
                  </div>
                </div>
              )}
              
              <div>
                <Label htmlFor="qa-notes">
                  {qaAction === "approve" ? "Approval Notes (optional)" : "Rejection Reason"}
                </Label>
                <Textarea
                  id="qa-notes"
                  value={qaNotes}
                  onChange={(e) => setQaNotes(e.target.value)}
                  placeholder={qaAction === "approve" 
                    ? "Add any notes about this approval..."
                    : "Explain why this document is being rejected and what needs to be fixed..."
                  }
                  className="mt-1"
                  rows={3}
                />
              </div>

              {qaAction === "reject" && !qaNotes && (
                <div className="flex items-center gap-2 text-amber-600 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Please provide a reason for rejection</span>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsQADialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleQASubmit}
                disabled={updateQAMutation.isPending || (qaAction === "reject" && !qaNotes)}
                variant={qaAction === "approve" ? "default" : "destructive"}
              >
                {updateQAMutation.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : qaAction === "approve" ? (
                  <CheckCircle className="h-4 w-4 mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                {qaAction === "approve" ? "Approve" : "Reject"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Email Dialog */}
        <Dialog open={isEmailDialogOpen} onOpenChange={(open) => {
          setIsEmailDialogOpen(open);
          if (!open) resetEmailForm();
        }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-cyan-500" />
                Send Document via Email
              </DialogTitle>
              <DialogDescription>
                Share "{emailDocument?.title}" with team members or external contacts.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Recipients List */}
              <div>
                <Label>Recipients</Label>
                {emailRecipients.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 mb-3">
                    {emailRecipients.map((recipient, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {recipient.name || recipient.email}
                        <button
                          onClick={() => handleRemoveRecipient(index)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    placeholder="Email address"
                    type="email"
                    value={newRecipientEmail}
                    onChange={(e) => setNewRecipientEmail(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddRecipient()}
                  />
                  <Input
                    placeholder="Name (optional)"
                    value={newRecipientName}
                    onChange={(e) => setNewRecipientName(e.target.value)}
                    className="w-32"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddRecipient()}
                  />
                  <Button variant="outline" size="icon" onClick={handleAddRecipient}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Subject */}
              <div>
                <Label htmlFor="email-subject">Subject</Label>
                <Input
                  id="email-subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Email subject"
                  className="mt-1"
                />
              </div>

              {/* Message */}
              <div>
                <Label htmlFor="email-message">Message (optional)</Label>
                <Textarea
                  id="email-message"
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Add a personal message..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              {/* Document Info */}
              {emailDocument && (
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    {getTypeIcon(emailDocument.type)}
                    <span className="font-medium">{emailDocument.title}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    {getQABadge(emailDocument.qaStatus)}
                    <span>•</span>
                    <span>{emailDocument.documentId}</span>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSendEmail}
                disabled={emailRecipients.length === 0 || sendEmailMutation.isPending}
              >
                {sendEmailMutation.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Email
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Email History Dialog */}
        <Dialog open={isEmailHistoryOpen} onOpenChange={(open) => {
          setIsEmailHistoryOpen(open);
          if (!open) setEmailHistoryDocument(null);
        }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-muted-foreground" />
                Email History
              </DialogTitle>
              <DialogDescription>
                Distribution history for "{emailHistoryDocument?.title}"
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {emailHistory && emailHistory.length > 0 ? (
                emailHistory.map((entry: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <div className="font-medium text-sm">
                        {entry.recipientName || entry.recipientEmail}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {entry.recipientEmail}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={entry.status === 'sent' ? 'default' : 'destructive'} className="text-xs">
                        {entry.status}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {format(new Date(entry.sentAt), "MMM d, yyyy h:mm a")}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No emails sent yet</p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEmailHistoryOpen(false)}>
                Close
              </Button>
              <Button onClick={() => {
                setIsEmailHistoryOpen(false);
                if (emailHistoryDocument) {
                  handleOpenEmailDialog(emailHistoryDocument);
                }
              }}>
                <Send className="h-4 w-4 mr-2" />
                Send New Email
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  );
}
