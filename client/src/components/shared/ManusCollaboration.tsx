import { useState } from 'react';
import { 
  Users, MessageSquare, GitBranch, CheckCircle2, Clock, 
  Plus, Send, Paperclip, AtSign, Hash, MoreHorizontal,
  Eye, Edit3, Trash2, Pin, Bell, BellOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Manus-style Collaboration Component
 * For development pipeline collaboration features
 */

interface CollaboratorType {
  id: string;
  name: string;
  avatar: string;
  role: 'owner' | 'editor' | 'viewer';
  status: 'online' | 'away' | 'offline';
  lastSeen?: string;
}

interface CommentType {
  id: string;
  author: CollaboratorType;
  content: string;
  timestamp: Date;
  replies?: CommentType[];
  reactions?: { emoji: string; count: number; users: string[] }[];
  isPinned?: boolean;
  attachments?: { name: string; type: string; url: string }[];
}

interface ActivityType {
  id: string;
  user: CollaboratorType;
  action: string;
  target: string;
  timestamp: Date;
  details?: string;
}

// Sample data
const SAMPLE_COLLABORATORS: CollaboratorType[] = [
  { id: '1', name: 'You', avatar: '👤', role: 'owner', status: 'online' },
  { id: '2', name: 'Chief of Staff', avatar: '🤖', role: 'editor', status: 'online' },
  { id: '3', name: 'Legal Expert', avatar: '⚖️', role: 'viewer', status: 'away', lastSeen: '5m ago' },
  { id: '4', name: 'Financial Analyst', avatar: '📊', role: 'editor', status: 'offline', lastSeen: '2h ago' },
];

const SAMPLE_COMMENTS: CommentType[] = [
  {
    id: '1',
    author: SAMPLE_COLLABORATORS[1],
    content: 'I\'ve reviewed the financial projections. Revenue assumptions look solid but we should stress-test the Q3 numbers.',
    timestamp: new Date(Date.now() - 1800000),
    reactions: [{ emoji: '👍', count: 2, users: ['You', 'Legal Expert'] }],
    isPinned: true,
  },
  {
    id: '2',
    author: SAMPLE_COLLABORATORS[2],
    content: 'NDA draft is ready for review. Added the non-compete clause as discussed.',
    timestamp: new Date(Date.now() - 3600000),
    attachments: [{ name: 'NDA_v2.pdf', type: 'pdf', url: '#' }],
  },
];

const SAMPLE_ACTIVITY: ActivityType[] = [
  { id: '1', user: SAMPLE_COLLABORATORS[1], action: 'updated', target: 'Financial Model', timestamp: new Date(Date.now() - 300000), details: 'Added sensitivity analysis' },
  { id: '2', user: SAMPLE_COLLABORATORS[2], action: 'commented on', target: 'NDA Draft', timestamp: new Date(Date.now() - 900000) },
  { id: '3', user: SAMPLE_COLLABORATORS[3], action: 'approved', target: 'Due Diligence Checklist', timestamp: new Date(Date.now() - 1800000) },
  { id: '4', user: SAMPLE_COLLABORATORS[0], action: 'created', target: 'Project Genesis', timestamp: new Date(Date.now() - 7200000) },
];

// Collaborators Panel
export function CollaboratorsPanel({ projectId }: { projectId?: string }) {
  const [showInvite, setShowInvite] = useState(false);
  const collaborators = SAMPLE_COLLABORATORS;

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          Team ({collaborators.length})
        </h3>
        <Button size="sm" variant="ghost" onClick={() => setShowInvite(!showInvite)}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {showInvite && (
        <div className="mb-4 p-3 bg-secondary/30 rounded-lg border border-border">
          <input
            type="email"
            placeholder="Enter email to invite..."
            className="w-full bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground mb-2"
          />
          <div className="flex gap-2">
            <select className="flex-1 bg-secondary text-foreground text-xs rounded px-2 py-1 border border-border">
              <option value="viewer">Can view</option>
              <option value="editor">Can edit</option>
            </select>
            <Button size="sm">Invite</Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {collaborators.map((collab) => (
          <div key={collab.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="text-xl">{collab.avatar}</span>
                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card ${
                  collab.status === 'online' ? 'bg-green-500' :
                  collab.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
                }`} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{collab.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{collab.role}</p>
              </div>
            </div>
            {collab.lastSeen && (
              <span className="text-xs text-muted-foreground">{collab.lastSeen}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Comments Thread
export function CommentsThread({ entityId, entityType }: { entityId?: string; entityType?: string }) {
  const [newComment, setNewComment] = useState('');
  const [comments] = useState(SAMPLE_COMMENTS);

  const formatTime = (date: Date) => {
    const mins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString('en-GB');
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
        <MessageSquare className="w-4 h-4 text-primary" />
        Comments
      </h3>

      {/* Comments List */}
      <div className="space-y-4 mb-4 max-h-80 overflow-y-auto">
        {comments.map((comment) => (
          <div key={comment.id} className={`p-3 rounded-lg ${comment.isPinned ? 'bg-primary/5 border border-primary/20' : 'bg-secondary/30'}`}>
            {comment.isPinned && (
              <div className="flex items-center gap-1 text-xs text-primary mb-2">
                <Pin className="w-3 h-3" />
                Pinned
              </div>
            )}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <span className="text-lg">{comment.author.avatar}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{comment.author.name}</span>
                    <span className="text-xs text-muted-foreground">{formatTime(comment.timestamp)}</span>
                  </div>
                  <p className="text-sm text-foreground/90 mt-1">{comment.content}</p>
                  
                  {/* Attachments */}
                  {comment.attachments && comment.attachments.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {comment.attachments.map((att, i) => (
                        <a key={i} href={att.url} className="flex items-center gap-1 px-2 py-1 bg-secondary rounded text-xs text-foreground hover:bg-secondary/80">
                          <Paperclip className="w-3 h-3" />
                          {att.name}
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Reactions */}
                  {comment.reactions && comment.reactions.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {comment.reactions.map((reaction, i) => (
                        <button key={i} className="flex items-center gap-1 px-2 py-0.5 bg-secondary/50 rounded-full text-xs hover:bg-secondary">
                          {reaction.emoji} {reaction.count}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* New Comment Input */}
      <div className="flex items-center gap-2 p-2 bg-secondary/30 rounded-lg border border-border">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
        />
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <AtSign className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Paperclip className="w-4 h-4" />
          </Button>
          <Button size="sm" disabled={!newComment.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Activity Feed
export function ActivityFeed({ projectId }: { projectId?: string }) {
  const activities = SAMPLE_ACTIVITY;

  const formatTime = (date: Date) => {
    const mins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString('en-GB');
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return <Plus className="w-3 h-3" />;
      case 'updated': return <Edit3 className="w-3 h-3" />;
      case 'approved': return <CheckCircle2 className="w-3 h-3 text-green-500" />;
      case 'commented on': return <MessageSquare className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
        <GitBranch className="w-4 h-4 text-primary" />
        Activity
      </h3>

      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className="mt-1 p-1.5 bg-secondary/50 rounded-full">
              {getActionIcon(activity.action)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">
                <span className="font-medium">{activity.user.name}</span>
                {' '}{activity.action}{' '}
                <span className="text-primary">{activity.target}</span>
              </p>
              {activity.details && (
                <p className="text-xs text-muted-foreground mt-0.5">{activity.details}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">{formatTime(activity.timestamp)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Version Control Panel
export function VersionControlPanel({ documentId }: { documentId?: string }) {
  const versions = [
    { id: '1', version: 'v2.1', author: 'Chief of Staff', timestamp: new Date(Date.now() - 300000), changes: 'Added sensitivity analysis' },
    { id: '2', version: 'v2.0', author: 'You', timestamp: new Date(Date.now() - 3600000), changes: 'Major revision - updated projections' },
    { id: '3', version: 'v1.2', author: 'Financial Analyst', timestamp: new Date(Date.now() - 86400000), changes: 'Fixed formula errors' },
    { id: '4', version: 'v1.1', author: 'You', timestamp: new Date(Date.now() - 172800000), changes: 'Initial draft' },
  ];

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
        <GitBranch className="w-4 h-4 text-primary" />
        Version History
      </h3>

      <div className="space-y-2">
        {versions.map((v, i) => (
          <div key={v.id} className={`flex items-center justify-between p-2 rounded-lg ${i === 0 ? 'bg-primary/10 border border-primary/20' : 'hover:bg-secondary/30'} transition-colors`}>
            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 rounded text-xs font-mono ${i === 0 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                {v.version}
              </span>
              <div>
                <p className="text-sm text-foreground">{v.changes}</p>
                <p className="text-xs text-muted-foreground">{v.author}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {i === 0 && (
                <span className="text-xs text-green-500">Current</span>
              )}
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Eye className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Combined Collaboration Sidebar
export function CollaborationSidebar({ projectId }: { projectId?: string }) {
  const [activeTab, setActiveTab] = useState<'team' | 'comments' | 'activity' | 'versions'>('team');

  return (
    <div className="w-80 bg-card/50 border-l border-border h-full overflow-hidden flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-border">
        {[
          { id: 'team', icon: Users, label: 'Team' },
          { id: 'comments', icon: MessageSquare, label: 'Chat' },
          { id: 'activity', icon: Clock, label: 'Activity' },
          { id: 'versions', icon: GitBranch, label: 'Versions' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'team' && <CollaboratorsPanel projectId={projectId} />}
        {activeTab === 'comments' && <CommentsThread entityId={projectId} />}
        {activeTab === 'activity' && <ActivityFeed projectId={projectId} />}
        {activeTab === 'versions' && <VersionControlPanel documentId={projectId} />}
      </div>
    </div>
  );
}

export default CollaborationSidebar;
