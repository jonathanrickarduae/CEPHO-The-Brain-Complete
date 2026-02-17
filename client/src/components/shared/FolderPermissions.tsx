import { useState } from 'react';
import { 
  Folder, Users, Lock, Eye, Edit2, Trash2, 
  Plus, Check, X, Shield, UserPlus, Settings,
  ChevronRight, FolderLock, Globe, UserCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

type PermissionLevel = 'owner' | 'admin' | 'editor' | 'viewer' | 'none';

interface FolderPermission {
  id: string;
  name: string;
  path: string;
  visibility: 'private' | 'team' | 'public';
  owner: string;
  permissions: {
    userId: string;
    userName: string;
    email: string;
    level: PermissionLevel;
    grantedAt: Date;
    grantedBy: string;
  }[];
  inheritFromParent: boolean;
  itemCount: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// Mock data
const MOCK_FOLDERS: FolderPermission[] = [
  {
    id: 'f1',
    name: 'Celadon Capital Acquisition',
    path: '/Projects/Celadon Capital',
    visibility: 'team',
    owner: 'Jonathan',
    permissions: [
      { userId: 'u1', userName: 'Jonathan', email: 'jonathan@company.com', level: 'owner', grantedAt: new Date(), grantedBy: 'System' },
      { userId: 'u2', userName: 'Sarah L.', email: 'sarah@company.com', level: 'editor', grantedAt: new Date(), grantedBy: 'Jonathan' },
      { userId: 'u3', userName: 'Marcus T.', email: 'marcus@company.com', level: 'viewer', grantedAt: new Date(), grantedBy: 'Jonathan' },
    ],
    inheritFromParent: false,
    itemCount: 24
  },
  {
    id: 'f2',
    name: 'Confidential Documents',
    path: '/Vault/Confidential',
    visibility: 'private',
    owner: 'Jonathan',
    permissions: [
      { userId: 'u1', userName: 'Jonathan', email: 'jonathan@company.com', level: 'owner', grantedAt: new Date(), grantedBy: 'System' },
    ],
    inheritFromParent: false,
    itemCount: 8
  },
  {
    id: 'f3',
    name: 'Team Resources',
    path: '/Shared/Team Resources',
    visibility: 'team',
    owner: 'Jonathan',
    permissions: [
      { userId: 'u1', userName: 'Jonathan', email: 'jonathan@company.com', level: 'owner', grantedAt: new Date(), grantedBy: 'System' },
      { userId: 'u2', userName: 'Sarah L.', email: 'sarah@company.com', level: 'admin', grantedAt: new Date(), grantedBy: 'Jonathan' },
      { userId: 'u4', userName: 'Dev Team', email: 'dev@company.com', level: 'editor', grantedAt: new Date(), grantedBy: 'Sarah L.' },
    ],
    inheritFromParent: true,
    itemCount: 156
  }
];

const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Jonathan', email: 'jonathan@company.com' },
  { id: 'u2', name: 'Sarah L.', email: 'sarah@company.com' },
  { id: 'u3', name: 'Marcus T.', email: 'marcus@company.com' },
  { id: 'u4', name: 'Dev Team', email: 'dev@company.com' },
  { id: 'u5', name: 'James K.', email: 'james@external.com' },
];

interface FolderPermissionsProps {
  folderId?: string;
}

export function FolderPermissions({ folderId }: FolderPermissionsProps) {
  const [selectedFolder, setSelectedFolder] = useState<FolderPermission | null>(
    folderId ? MOCK_FOLDERS.find(f => f.id === folderId) || null : null
  );
  const [showAddUser, setShowAddUser] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'private': return FolderLock;
      case 'team': return Users;
      case 'public': return Globe;
      default: return Folder;
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'private': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'team': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'public': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-foreground/70 border-gray-500/30';
    }
  };

  const getPermissionColor = (level: PermissionLevel) => {
    switch (level) {
      case 'owner': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'admin': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'editor': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'viewer': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-foreground/70 border-gray-500/30';
    }
  };

  const handleAddUser = (user: User, level: PermissionLevel) => {
    toast.success(`Added ${user.name} as ${level}`);
    setShowAddUser(false);
    setSearchEmail('');
  };

  const handleRemoveUser = (userId: string, userName: string) => {
    toast.success(`Removed ${userName} from folder`);
  };

  const handleChangePermission = (userId: string, newLevel: PermissionLevel) => {
    toast.success(`Updated permission to ${newLevel}`);
  };

  if (selectedFolder) {
    const VisibilityIcon = getVisibilityIcon(selectedFolder.visibility);
    
    return (
      <div className="space-y-4">
        {/* Folder Header */}
        <Card className="bg-card/60 border-border">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <VisibilityIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{selectedFolder.name}</h2>
                  <p className="text-sm text-muted-foreground">{selectedFolder.path}</p>
                </div>
              </div>
              <Badge variant="outline" className={getVisibilityColor(selectedFolder.visibility)}>
                {selectedFolder.visibility}
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <span>{selectedFolder.itemCount} items</span>
              <span>•</span>
              <span>Owner: {selectedFolder.owner}</span>
              {selectedFolder.inheritFromParent && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Inherits parent permissions
                  </span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Permissions List */}
        <Card className="bg-card/60 border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-foreground text-base">
                <Users className="w-4 h-4 text-primary" />
                People with Access ({selectedFolder.permissions.length})
              </CardTitle>
              <Button size="sm" onClick={() => setShowAddUser(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showAddUser && (
              <div className="mb-4 p-3 bg-background/50 rounded-lg border border-border">
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="Search by email..."
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="ghost" size="sm" onClick={() => setShowAddUser(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {MOCK_USERS.filter(u => 
                    !selectedFolder.permissions.find(p => p.userId === u.id) &&
                    (searchEmail === '' || u.email.toLowerCase().includes(searchEmail.toLowerCase()))
                  ).slice(0, 3).map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-2 rounded hover:bg-background/80">
                      <div>
                        <div className="font-medium text-foreground">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                      <div className="flex gap-1">
                        {(['viewer', 'editor', 'admin'] as PermissionLevel[]).map((level) => (
                          <Button
                            key={level}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => handleAddUser(user, level)}
                          >
                            {level}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              {selectedFolder.permissions.map((perm) => (
                <div 
                  key={perm.userId}
                  className="flex items-center justify-between p-3 rounded-lg bg-background/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                      {perm.userName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{perm.userName}</div>
                      <div className="text-xs text-muted-foreground">{perm.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getPermissionColor(perm.level)}>
                      {perm.level}
                    </Badge>
                    {perm.level !== 'owner' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveUser(perm.userId, perm.userName)}
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-400" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Permission Levels Legend */}
        <Card className="bg-card/60 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-foreground text-base">
              <Settings className="w-4 h-4 text-primary" />
              Permission Levels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2">
                <Badge variant="outline" className={getPermissionColor('owner')}>owner</Badge>
                <span className="text-muted-foreground">Full control, can delete folder</span>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="outline" className={getPermissionColor('admin')}>admin</Badge>
                <span className="text-muted-foreground">Manage permissions, edit all</span>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="outline" className={getPermissionColor('editor')}>editor</Badge>
                <span className="text-muted-foreground">Add, edit, delete files</span>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="outline" className={getPermissionColor('viewer')}>viewer</Badge>
                <span className="text-muted-foreground">View and download only</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button 
          variant="outline" 
          onClick={() => setSelectedFolder(null)}
          className="w-full"
        >
          Back to Folders
        </Button>
      </div>
    );
  }

  return (
    <Card className="bg-card/60 border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Lock className="w-5 h-5 text-primary" />
          Folder Permissions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {MOCK_FOLDERS.map((folder) => {
            const VisibilityIcon = getVisibilityIcon(folder.visibility);
            return (
              <div 
                key={folder.id}
                onClick={() => setSelectedFolder(folder)}
                className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/80 cursor-pointer transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <VisibilityIcon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground truncate">{folder.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{folder.path}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {folder.permissions.slice(0, 3).map((perm, i) => (
                      <div 
                        key={perm.userId}
                        className="w-6 h-6 rounded-full bg-primary/20 border-2 border-card flex items-center justify-center text-xs text-primary"
                      >
                        {perm.userName[0]}
                      </div>
                    ))}
                    {folder.permissions.length > 3 && (
                      <div className="w-6 h-6 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs text-muted-foreground">
                        +{folder.permissions.length - 3}
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default FolderPermissions;
