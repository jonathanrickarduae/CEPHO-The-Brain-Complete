import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Mail, RefreshCw, Inbox, Clock, CheckCircle, AlertCircle, Archive, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const STATUS_CONFIG = {
  unread: { label: 'Unread', color: 'bg-cyan-500', icon: Mail },
  read: { label: 'Read', color: 'bg-gray-400', icon: CheckCircle },
  action_required: { label: 'Action Required', color: 'bg-red-500', icon: AlertCircle },
  processing: { label: 'Processing', color: 'bg-yellow-500', icon: Clock },
  processed: { label: 'Processed', color: 'bg-green-500', icon: CheckCircle },
  archived: { label: 'Archived', color: 'bg-gray-300', icon: Archive },
  deleted: { label: 'Deleted', color: 'bg-gray-200', icon: Archive },
} as const;

const PRIORITY_CLASS: Record<string, string> = {
  urgent: 'border-l-red-500',
  high: 'border-l-orange-400',
  medium: 'border-l-cyan-400',
  low: 'border-l-gray-300',
};

const SOURCE_LABELS: Record<string, string> = {
  email: 'Email', document: 'Document', voice_note: 'Voice Note',
  whatsapp: 'WhatsApp', slack: 'Slack', asana: 'Asana',
  calendar: 'Calendar', manual: 'Manual', webhook: 'Webhook',
};

type StatusFilter = 'all' | 'unread' | 'action_required' | 'archived';

export default function InboxPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [syncMessage, setSyncMessage] = useState('');
  const utils = trpc.useUtils();

  const { data: items = [], isLoading } = trpc.inbox.list.useQuery(
    statusFilter === 'all' ? undefined : { status: statusFilter },
    { refetchInterval: 30_000 }
  );

  const updateItem = trpc.inbox.update.useMutation({
    onSuccess: () => utils.inbox.list.invalidate(),
  });

  const syncGmail = trpc.inbox.syncGmail.useMutation({
    onSuccess: (result) => {
      setSyncMessage(result.message);
      utils.inbox.list.invalidate();
      toast.success(result.message);
    },
    onError: (err) => toast.error(`Sync failed: ${err.message}`),
  });

  const filtered = items.filter(item => {
    if (!search) return true;
    const q = search.toLowerCase();
    return item.title?.toLowerCase().includes(q) || item.sender?.toLowerCase().includes(q) || item.preview?.toLowerCase().includes(q);
  });

  const unreadCount = items.filter(i => i.status === 'unread').length;
  const actionCount = items.filter(i => i.status === 'action_required').length;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Inbox className="w-6 h-6 text-cyan-500" />
            Inbox
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {unreadCount > 0 && <span className="text-cyan-600 font-medium">{unreadCount} unread</span>}
            {unreadCount > 0 && actionCount > 0 && ' · '}
            {actionCount > 0 && <span className="text-red-500 font-medium">{actionCount} need action</span>}
            {unreadCount === 0 && actionCount === 0 && 'All caught up'}
          </p>
        </div>
        <Button onClick={() => syncGmail.mutate()} disabled={syncGmail.isPending} variant="outline" size="sm" className="gap-2">
          <RefreshCw className={cn('w-4 h-4', syncGmail.isPending && 'animate-spin')} />
          {syncGmail.isPending ? 'Syncing...' : 'Sync Gmail'}
        </Button>
      </div>

      {syncMessage && (
        <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-2">{syncMessage}</div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search inbox..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {(['all', 'unread', 'action_required', 'archived'] as StatusFilter[]).map(f => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={cn('px-3 py-1.5 rounded text-sm transition-colors', statusFilter === f ? 'bg-background text-foreground shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground')}>
              {f === 'action_required' ? 'Action Required' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-20 bg-muted/50 rounded-xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Inbox className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">{items.length === 0 ? 'No items yet — sync Gmail to get started' : 'No items match your filter'}</p>
          {items.length === 0 && (
            <Button onClick={() => syncGmail.mutate()} disabled={syncGmail.isPending} className="mt-4 gap-2" size="sm">
              <RefreshCw className={cn('w-4 h-4', syncGmail.isPending && 'animate-spin')} />
              Sync Gmail now
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => {
            const statusCfg = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.read;
            const priorityClass = PRIORITY_CLASS[item.priority ?? 'medium'] || PRIORITY_CLASS.medium;
            const StatusIcon = statusCfg.icon;
            return (
              <div key={item.id} className={cn('bg-card border border-border rounded-xl p-4 flex items-start gap-4 hover:shadow-sm transition-shadow border-l-4', priorityClass, item.status === 'unread' && 'bg-cyan-50/30')}>
                <div className="mt-1"><div className={cn('w-2.5 h-2.5 rounded-full', statusCfg.color)} /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className={cn('font-medium text-foreground truncate', item.status === 'unread' && 'font-semibold')}>{item.title}</p>
                      {item.sender && <p className="text-sm text-muted-foreground truncate">{item.sender}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-xs">{SOURCE_LABELS[item.source] || item.source}</Badge>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  {item.preview && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.preview}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {item.status === 'unread' && (
                    <button onClick={e => { e.stopPropagation(); updateItem.mutate({ id: item.id, status: 'read' }); }} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Mark as read">
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={e => { e.stopPropagation(); updateItem.mutate({ id: item.id, status: 'archived' }); }} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Archive">
                    <Archive className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
