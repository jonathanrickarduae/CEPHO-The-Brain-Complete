import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Building2, Mail, User } from 'lucide-react';

const PARTNERSHIP_TYPES = ['technology', 'distribution', 'strategic', 'integration', 'referral'] as const;
const PARTNERSHIP_STATUSES = ['prospect', 'contacted', 'negotiating', 'active', 'inactive', 'churned'] as const;
const PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;

const statusColors: Record<string, string> = {
  prospect: 'bg-gray-500/20 text-gray-400',
  contacted: 'bg-blue-500/20 text-blue-400',
  negotiating: 'bg-yellow-500/20 text-yellow-400',
  active: 'bg-green-500/20 text-green-400',
  inactive: 'bg-orange-500/20 text-orange-400',
  churned: 'bg-red-500/20 text-red-400',
};

const priorityColors: Record<string, string> = {
  low: 'border-gray-500',
  medium: 'border-blue-500',
  high: 'border-yellow-500',
  critical: 'border-red-500',
};

export function PartnershipPipeline() {
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const { data: partnerships, isLoading, refetch } = trpc.partnerships.list.useQuery(
    filterStatus ? { status: filterStatus as any } : undefined
  );

  const createMutation = trpc.partnerships.create.useMutation({
    onSuccess: () => {
      toast.success('Partnership added');
      setIsAddOpen(false);
      refetch();
    },
    onError: () => {
      toast.error('Failed to add partnership');
    },
  });

  const [newPartnership, setNewPartnership] = useState({
    name: '',
    type: 'strategic' as typeof PARTNERSHIP_TYPES[number],
    status: 'prospect' as typeof PARTNERSHIP_STATUSES[number],
    priority: 'medium' as typeof PRIORITIES[number],
    contactName: '',
    contactEmail: '',
    notes: '',
  });

  const handleCreate = () => {
    if (!newPartnership.name) {
      toast.error('Partnership name is required');
      return;
    }
    createMutation.mutate({
      ...newPartnership,
      contactName: newPartnership.contactName || undefined,
      contactEmail: newPartnership.contactEmail || undefined,
      notes: newPartnership.notes || undefined,
    });
  };

  // Group partnerships by status for pipeline view
  const pipelineStages = PARTNERSHIP_STATUSES.filter(s => s !== 'inactive' && s !== 'churned');
  const groupedPartnerships = pipelineStages.reduce((acc, status) => {
    acc[status] = partnerships?.filter(p => p.status === status) || [];
    return acc;
  }, {} as Record<string, typeof partnerships>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Partnership Pipeline</h2>
          <p className="text-sm text-muted-foreground">Track and manage strategic partnerships</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#E91E8C] hover:bg-[#E91E8C]/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Partnership
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Partnership</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Partnership Name *</Label>
                <Input
                  placeholder="Company or partner name"
                  value={newPartnership.name}
                  onChange={(e) => setNewPartnership({ ...newPartnership, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select
                    value={newPartnership.type}
                    onValueChange={(v) => setNewPartnership({ ...newPartnership, type: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PARTNERSHIP_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select
                    value={newPartnership.priority}
                    onValueChange={(v) => setNewPartnership({ ...newPartnership, priority: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Contact Name</Label>
                <Input
                  placeholder="Primary contact"
                  value={newPartnership.contactName}
                  onChange={(e) => setNewPartnership({ ...newPartnership, contactName: e.target.value })}
                />
              </div>
              <div>
                <Label>Contact Email</Label>
                <Input
                  type="email"
                  placeholder="email@company.com"
                  value={newPartnership.contactEmail}
                  onChange={(e) => setNewPartnership({ ...newPartnership, contactEmail: e.target.value })}
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  placeholder="Additional notes..."
                  value={newPartnership.notes}
                  onChange={(e) => setNewPartnership({ ...newPartnership, notes: e.target.value })}
                  rows={3}
                />
              </div>
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending}
                className="w-full bg-[#E91E8C] hover:bg-[#E91E8C]/90"
              >
                {createMutation.isPending ? 'Adding...' : 'Add Partnership'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={!filterStatus ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterStatus(undefined)}
        >
          All
        </Button>
        {PARTNERSHIP_STATUSES.map((status) => (
          <Button
            key={status}
            variant={filterStatus === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {/* Pipeline View */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading partnerships...</div>
      ) : !filterStatus ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {pipelineStages.map((stage) => (
            <div key={stage} className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge className={statusColors[stage]}>
                  {stage.charAt(0).toUpperCase() + stage.slice(1)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {groupedPartnerships[stage]?.length || 0}
                </span>
              </div>
              <div className="space-y-2 min-h-[200px] bg-muted/20 rounded-lg p-2">
                {groupedPartnerships[stage]?.map((p) => (
                  <PartnershipCard key={p.id} partnership={p} />
                ))}
                {(!groupedPartnerships[stage] || groupedPartnerships[stage]?.length === 0) && (
                  <div className="text-xs text-muted-foreground text-center py-8">
                    No partnerships
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {partnerships?.map((p) => (
            <PartnershipCard key={p.id} partnership={p} expanded />
          ))}
          {(!partnerships || partnerships.length === 0) && (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No partnerships found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface PartnershipCardProps {
  partnership: {
    id: number;
    name: string;
    type: string;
    status: string;
    priority: string | null;
    contactName: string | null;
    contactEmail: string | null;
    notes: string | null;
  };
  expanded?: boolean;
}

function PartnershipCard({ partnership, expanded = false }: PartnershipCardProps) {
  return (
    <Card className={`border-l-4 ${priorityColors[partnership.priority || 'medium']}`}>
      <CardContent className={expanded ? 'p-4' : 'p-3'}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium text-sm">{partnership.name}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {partnership.type}
          </Badge>
        </div>
        {expanded && (
          <div className="mt-3 space-y-2 text-sm">
            {partnership.contactName && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-3 h-3" />
                {partnership.contactName}
              </div>
            )}
            {partnership.contactEmail && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-3 h-3" />
                {partnership.contactEmail}
              </div>
            )}
            {partnership.notes && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {partnership.notes}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
