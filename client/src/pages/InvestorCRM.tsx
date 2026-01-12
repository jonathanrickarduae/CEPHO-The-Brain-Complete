import { useState } from "react";
// BrainLayout is provided by App.tsx route wrapper
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, Plus, Search, Filter, Upload, Download, Mail, Phone, Linkedin, 
  Globe, Building2, DollarSign, TrendingUp, MessageSquare, Calendar,
  MoreVertical, Edit, Trash2, Eye, FileSpreadsheet
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/components/Toast";

// Investor types
const INVESTOR_TYPES = [
  { value: "angel", label: "Angel Investor", color: "bg-purple-500" },
  { value: "hnwi", label: "HNWI", color: "bg-blue-500" },
  { value: "family_office", label: "Family Office", color: "bg-emerald-500" },
  { value: "vc", label: "Venture Capital", color: "bg-orange-500" },
  { value: "pe", label: "Private Equity", color: "bg-red-500" },
  { value: "bank", label: "Bank", color: "bg-slate-500" },
  { value: "government", label: "Government", color: "bg-cyan-500" },
  { value: "strategic", label: "Strategic Partner", color: "bg-pink-500" },
];

const RELATIONSHIP_STATUSES = [
  { value: "cold", label: "Cold", color: "bg-slate-400" },
  { value: "warm", label: "Warm", color: "bg-yellow-500" },
  { value: "hot", label: "Hot", color: "bg-orange-500" },
  { value: "active", label: "Active", color: "bg-green-500" },
  { value: "invested", label: "Invested", color: "bg-emerald-600" },
  { value: "passed", label: "Passed", color: "bg-red-400" },
];

const SECTORS = [
  "Technology", "Fintech", "Healthcare", "Real Estate", "Consumer", 
  "Energy", "Manufacturing", "Media", "Education", "Agriculture"
];

const STAGES = [
  "Pre-seed", "Seed", "Series A", "Series B", "Series C+", "Growth", "Late Stage"
];

interface InvestorFormData {
  name: string;
  type: string;
  organization: string;
  ticketSizeMin: string;
  ticketSizeMax: string;
  currency: string;
  sectors: string[];
  stages: string[];
  email: string;
  phone: string;
  linkedin: string;
  website: string;
  relationshipStatus: string;
  notes: string;
}

const emptyFormData: InvestorFormData = {
  name: "",
  type: "angel",
  organization: "",
  ticketSizeMin: "",
  ticketSizeMax: "",
  currency: "GBP",
  sectors: [],
  stages: [],
  email: "",
  phone: "",
  linkedin: "",
  website: "",
  relationshipStatus: "cold",
  notes: "",
};

export default function InvestorCRM() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedInvestor, setSelectedInvestor] = useState<any>(null);
  const [formData, setFormData] = useState<InvestorFormData>(emptyFormData);
  
  // Fetch investors
  const { data: investors = [], refetch } = trpc.investors.list.useQuery();
  
  // Mutations
  const createMutation = trpc.investors.create.useMutation({
    onSuccess: () => {
      toast({ title: "Investor added successfully" });
      setIsAddDialogOpen(false);
      setFormData(emptyFormData);
      refetch();
    },
    onError: (error: any) => {
      toast({ title: "Error adding investor", description: error.message, variant: "destructive" });
    }
  });
  
  const updateMutation = trpc.investors.update.useMutation({
    onSuccess: () => {
      toast({ title: "Investor updated successfully" });
      setIsEditDialogOpen(false);
      refetch();
    },
    onError: (error: any) => {
      toast({ title: "Error updating investor", description: error.message, variant: "destructive" });
    }
  });
  
  const deleteMutation = trpc.investors.delete.useMutation({
    onSuccess: () => {
      toast({ title: "Investor deleted" });
      refetch();
    },
    onError: (error: any) => {
      toast({ title: "Error deleting investor", description: error.message, variant: "destructive" });
    }
  });

  // Filter investors
  const filteredInvestors = investors.filter((inv: any) => {
    const matchesSearch = inv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.organization && inv.organization.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === "all" || inv.type === typeFilter;
    const matchesStatus = statusFilter === "all" || inv.relationshipStatus === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Stats
  const stats = {
    total: investors.length,
    hot: investors.filter((i: any) => i.relationshipStatus === "hot").length,
    active: investors.filter((i: any) => i.relationshipStatus === "active").length,
    invested: investors.filter((i: any) => i.relationshipStatus === "invested").length,
  };

  const handleSubmit = () => {
    createMutation.mutate({
      name: formData.name,
      type: formData.type as any,
      organization: formData.organization || undefined,
      ticketSizeMin: formData.ticketSizeMin ? parseInt(formData.ticketSizeMin) : undefined,
      ticketSizeMax: formData.ticketSizeMax ? parseInt(formData.ticketSizeMax) : undefined,
      currency: formData.currency || undefined,
      sectors: formData.sectors.length > 0 ? formData.sectors : undefined,
      stages: formData.stages.length > 0 ? formData.stages : undefined,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      linkedin: formData.linkedin || undefined,
      website: formData.website || undefined,
      relationshipStatus: formData.relationshipStatus as any || undefined,
      notes: formData.notes || undefined,
    });
  };

  const handleUpdate = () => {
    if (!selectedInvestor) return;
    updateMutation.mutate({
      id: selectedInvestor.id,
      name: formData.name,
      type: formData.type as any,
      organization: formData.organization || undefined,
      ticketSizeMin: formData.ticketSizeMin ? parseInt(formData.ticketSizeMin) : undefined,
      ticketSizeMax: formData.ticketSizeMax ? parseInt(formData.ticketSizeMax) : undefined,
      currency: formData.currency || undefined,
      sectors: formData.sectors.length > 0 ? formData.sectors : undefined,
      stages: formData.stages.length > 0 ? formData.stages : undefined,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      linkedin: formData.linkedin || undefined,
      website: formData.website || undefined,
      relationshipStatus: formData.relationshipStatus as any || undefined,
      notes: formData.notes || undefined,
    });
  };

  const openEditDialog = (investor: any) => {
    setSelectedInvestor(investor);
    setFormData({
      name: investor.name || "",
      type: investor.type || "angel",
      organization: investor.organization || "",
      ticketSizeMin: investor.ticketSizeMin?.toString() || "",
      ticketSizeMax: investor.ticketSizeMax?.toString() || "",
      currency: investor.currency || "GBP",
      sectors: investor.sectors || [],
      stages: investor.stages || [],
      email: investor.email || "",
      phone: investor.phone || "",
      linkedin: investor.linkedin || "",
      website: investor.website || "",
      relationshipStatus: investor.relationshipStatus || "cold",
      notes: investor.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (investor: any) => {
    setSelectedInvestor(investor);
    setIsViewDialogOpen(true);
  };

  const getTypeInfo = (type: string) => INVESTOR_TYPES.find(t => t.value === type) || INVESTOR_TYPES[0];
  const getStatusInfo = (status: string) => RELATIONSHIP_STATUSES.find(s => s.value === status) || RELATIONSHIP_STATUSES[0];

  const formatCurrency = (amount: number, currency: string = "GBP") => {
    const symbols: Record<string, string> = { GBP: "£", USD: "$", EUR: "€", AED: "د.إ" };
    const symbol = symbols[currency] || currency;
    if (amount >= 1000000) return `${symbol}${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${symbol}${(amount / 1000).toFixed(0)}K`;
    return `${symbol}${amount}`;
  };

  // CSV Import Handler
  const handleCSVImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      let imported = 0;
      let errors = 0;

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',').map(v => v.trim());
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => { row[h] = values[idx] || ""; });

        try {
          await createMutation.mutateAsync({
            name: row.name || `Investor ${i}`,
            type: (row.type as any) || "angel",
            organization: row.organization || undefined,
            email: row.email || undefined,
            phone: row.phone || undefined,
            linkedin: row.linkedin || undefined,
            ticketSizeMin: row.ticketsizemin ? parseInt(row.ticketsizemin) : undefined,
            ticketSizeMax: row.ticketsizemax ? parseInt(row.ticketsizemax) : undefined,
            relationshipStatus: (row.status as any) || "cold",
          });
          imported++;
        } catch {
          errors++;
        }
      }

      toast({
        title: "Import Complete",
        description: `Imported ${imported} investors. ${errors > 0 ? `${errors} errors.` : ""}`,
      });
      setIsImportDialogOpen(false);
      refetch();
    };
    reader.readAsText(file);
  };

  // Download CSV Template
  const downloadTemplate = () => {
    const template = "name,type,organization,email,phone,linkedin,ticketSizeMin,ticketSizeMax,status\nJohn Smith,angel,Angel Network,john@example.com,+44123456789,linkedin.com/in/john,10000,100000,warm\n";
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'investor_template.csv';
    a.click();
  };

  const InvestorForm = ({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) => (
    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Name *</Label>
          <Input 
            value={formData.name} 
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Investor name"
          />
        </div>
        <div className="space-y-2">
          <Label>Type *</Label>
          <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {INVESTOR_TYPES.map(t => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Organization</Label>
        <Input 
          value={formData.organization} 
          onChange={(e) => setFormData({...formData, organization: e.target.value})}
          placeholder="Company or fund name"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Min Ticket</Label>
          <Input 
            type="number"
            value={formData.ticketSizeMin} 
            onChange={(e) => setFormData({...formData, ticketSizeMin: e.target.value})}
            placeholder="10000"
          />
        </div>
        <div className="space-y-2">
          <Label>Max Ticket</Label>
          <Input 
            type="number"
            value={formData.ticketSizeMax} 
            onChange={(e) => setFormData({...formData, ticketSizeMax: e.target.value})}
            placeholder="100000"
          />
        </div>
        <div className="space-y-2">
          <Label>Currency</Label>
          <Select value={formData.currency} onValueChange={(v) => setFormData({...formData, currency: v})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="GBP">GBP (£)</SelectItem>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="EUR">EUR (€)</SelectItem>
              <SelectItem value="AED">AED (د.إ)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Email</Label>
          <Input 
            type="email"
            value={formData.email} 
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="investor@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input 
            value={formData.phone} 
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            placeholder="+44 123 456 7890"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>LinkedIn</Label>
          <Input 
            value={formData.linkedin} 
            onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
            placeholder="linkedin.com/in/username"
          />
        </div>
        <div className="space-y-2">
          <Label>Website</Label>
          <Input 
            value={formData.website} 
            onChange={(e) => setFormData({...formData, website: e.target.value})}
            placeholder="https://example.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Relationship Status</Label>
        <Select value={formData.relationshipStatus} onValueChange={(v) => setFormData({...formData, relationshipStatus: v})}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {RELATIONSHIP_STATUSES.map(s => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea 
          value={formData.notes} 
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          placeholder="Additional notes about this investor..."
          rows={3}
        />
      </div>

      <DialogFooter>
        <Button onClick={onSubmit} className="bg-fuchsia-600 hover:bg-fuchsia-700">
          {submitLabel}
        </Button>
      </DialogFooter>
    </div>
  );

  return (
    <>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Users className="h-8 w-8 text-fuchsia-400" />
              Investor CRM
            </h1>
            <p className="text-gray-400 mt-1">Manage your investor relationships and capital matching</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Import CSV
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import Investors from CSV</DialogTitle>
                  <DialogDescription>
                    Upload a CSV file with investor data. Download the template for the correct format.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Button variant="outline" onClick={downloadTemplate} className="w-full gap-2">
                    <Download className="h-4 w-4" />
                    Download CSV Template
                  </Button>
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                    <FileSpreadsheet className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <Label htmlFor="csv-upload" className="cursor-pointer">
                      <span className="text-fuchsia-400 hover:text-fuchsia-300">Click to upload</span>
                      <span className="text-gray-400"> or drag and drop</span>
                    </Label>
                    <Input 
                      id="csv-upload" 
                      type="file" 
                      accept=".csv" 
                      className="hidden" 
                      onChange={handleCSVImport}
                    />
                    <p className="text-sm text-gray-500 mt-2">CSV files only</p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-fuchsia-600 hover:bg-fuchsia-700 gap-2">
                  <Plus className="h-4 w-4" />
                  Add Investor
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Investor</DialogTitle>
                  <DialogDescription>
                    Add a new investor contact to your CRM
                  </DialogDescription>
                </DialogHeader>
                <InvestorForm onSubmit={handleSubmit} submitLabel="Add Investor" />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Investors</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-fuchsia-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Hot Leads</p>
                  <p className="text-2xl font-bold text-orange-400">{stats.hot}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Discussions</p>
                  <p className="text-2xl font-bold text-green-400">{stats.active}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Invested</p>
                  <p className="text-2xl font-bold text-emerald-400">{stats.invested}</p>
                </div>
                <DollarSign className="h-8 w-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search investors..." 
              className="pl-10 bg-gray-900/50 border-gray-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48 bg-gray-900/50 border-gray-700">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {INVESTOR_TYPES.map(t => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 bg-gray-900/50 border-gray-700">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {RELATIONSHIP_STATUSES.map(s => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Investor List */}
        <div className="grid gap-4">
          {filteredInvestors.length === 0 ? (
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-12 text-center">
                <Users className="h-16 w-16 mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No investors yet</h3>
                <p className="text-gray-400 mb-4">Start building your investor network by adding contacts</p>
                <Button onClick={() => setIsAddDialogOpen(true)} className="bg-fuchsia-600 hover:bg-fuchsia-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Investor
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredInvestors.map((investor: any) => {
              const typeInfo = getTypeInfo(investor.type);
              const statusInfo = getStatusInfo(investor.relationshipStatus);
              
              return (
                <Card key={investor.id} className="bg-gray-900/50 border-gray-800 hover:border-fuchsia-500/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full ${typeInfo.color} flex items-center justify-center text-white font-bold text-lg`}>
                          {investor.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-white">{investor.name}</h3>
                            <Badge variant="outline" className={`${typeInfo.color} text-white border-0 text-xs`}>
                              {typeInfo.label}
                            </Badge>
                            <Badge variant="outline" className={`${statusInfo.color} text-white border-0 text-xs`}>
                              {statusInfo.label}
                            </Badge>
                          </div>
                          {investor.organization && (
                            <p className="text-sm text-gray-400 flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {investor.organization}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        {(investor.ticketSizeMin || investor.ticketSizeMax) && (
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Ticket Size</p>
                            <p className="text-sm text-white">
                              {investor.ticketSizeMin && formatCurrency(investor.ticketSizeMin, investor.currency)}
                              {investor.ticketSizeMin && investor.ticketSizeMax && " - "}
                              {investor.ticketSizeMax && formatCurrency(investor.ticketSizeMax, investor.currency)}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          {investor.email && (
                            <Button variant="ghost" size="icon" asChild>
                              <a href={`mailto:${investor.email}`}><Mail className="h-4 w-4" /></a>
                            </Button>
                          )}
                          {investor.phone && (
                            <Button variant="ghost" size="icon" asChild>
                              <a href={`tel:${investor.phone}`}><Phone className="h-4 w-4" /></a>
                            </Button>
                          )}
                          {investor.linkedin && (
                            <Button variant="ghost" size="icon" asChild>
                              <a href={investor.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin className="h-4 w-4" /></a>
                            </Button>
                          )}
                          {investor.website && (
                            <Button variant="ghost" size="icon" asChild>
                              <a href={investor.website} target="_blank" rel="noopener noreferrer"><Globe className="h-4 w-4" /></a>
                            </Button>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openViewDialog(investor)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(investor)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-400 hover:text-red-300"
                            onClick={() => deleteMutation.mutate({ id: investor.id })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Investor</DialogTitle>
              <DialogDescription>
                Update investor information
              </DialogDescription>
            </DialogHeader>
            <InvestorForm onSubmit={handleUpdate} submitLabel="Save Changes" />
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedInvestor?.name}</DialogTitle>
              <DialogDescription>
                {selectedInvestor?.organization}
              </DialogDescription>
            </DialogHeader>
            {selectedInvestor && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Type</p>
                    <Badge className={`${getTypeInfo(selectedInvestor.type).color} text-white`}>
                      {getTypeInfo(selectedInvestor.type).label}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Status</p>
                    <Badge className={`${getStatusInfo(selectedInvestor.relationshipStatus).color} text-white`}>
                      {getStatusInfo(selectedInvestor.relationshipStatus).label}
                    </Badge>
                  </div>
                </div>
                
                {(selectedInvestor.ticketSizeMin || selectedInvestor.ticketSizeMax) && (
                  <div>
                    <p className="text-sm text-gray-400">Ticket Size</p>
                    <p className="text-white">
                      {selectedInvestor.ticketSizeMin && formatCurrency(selectedInvestor.ticketSizeMin, selectedInvestor.currency)}
                      {selectedInvestor.ticketSizeMin && selectedInvestor.ticketSizeMax && " - "}
                      {selectedInvestor.ticketSizeMax && formatCurrency(selectedInvestor.ticketSizeMax, selectedInvestor.currency)}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {selectedInvestor.email && (
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <a href={`mailto:${selectedInvestor.email}`} className="text-fuchsia-400 hover:underline">
                        {selectedInvestor.email}
                      </a>
                    </div>
                  )}
                  {selectedInvestor.phone && (
                    <div>
                      <p className="text-sm text-gray-400">Phone</p>
                      <a href={`tel:${selectedInvestor.phone}`} className="text-fuchsia-400 hover:underline">
                        {selectedInvestor.phone}
                      </a>
                    </div>
                  )}
                </div>

                {selectedInvestor.notes && (
                  <div>
                    <p className="text-sm text-gray-400">Notes</p>
                    <p className="text-white whitespace-pre-wrap">{selectedInvestor.notes}</p>
                  </div>
                )}

                <DialogFooter>
                  <Button variant="outline" onClick={() => openEditDialog(selectedInvestor)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
