import { useState } from 'react';
import {
  Shield, Lock, Eye, EyeOff, Download, Trash2, Clock,
  Database, Users, Key, FileText, AlertTriangle, Check,
  ChevronRight, Search, Filter, Calendar, Globe, Server,
  HardDrive, RefreshCw, Settings, Info
} from 'lucide-react';

interface DataCategory {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  size: string;
  accessLevel: 'private' | 'twin' | 'shared';
  encrypted: boolean;
  lastAccessed?: Date;
}

interface AuditLogEntry {
  id: string;
  timestamp: Date;
  action: 'view' | 'create' | 'update' | 'delete' | 'export' | 'share';
  actor: 'user' | 'digital-twin' | 'system' | 'integration';
  resource: string;
  resourceType: string;
  details?: string;
  ipAddress?: string;
}

interface RetentionPolicy {
  category: string;
  retentionDays: number;
  autoDelete: boolean;
}

export function DataGovernanceDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'audit' | 'access' | 'retention' | 'export'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Mock data categories
  const dataCategories: DataCategory[] = [
    { id: 'conversations', name: 'Conversations', description: 'Chief of Staff chat history', itemCount: 847, size: '12.4 MB', accessLevel: 'twin', encrypted: true, lastAccessed: new Date() },
    { id: 'documents', name: 'Documents', description: 'Uploaded files and PDFs', itemCount: 156, size: '234 MB', accessLevel: 'twin', encrypted: true, lastAccessed: new Date(Date.now() - 3600000) },
    { id: 'vault', name: 'Vault Items', description: 'Secure credentials and notes', itemCount: 43, size: '1.2 MB', accessLevel: 'private', encrypted: true },
    { id: 'training', name: 'Training Data', description: 'Chief of Staff learning data', itemCount: 2341, size: '45 MB', accessLevel: 'twin', encrypted: true },
    { id: 'integrations', name: 'Integration Data', description: 'Connected service data', itemCount: 12, size: '8.7 MB', accessLevel: 'twin', encrypted: true },
    { id: 'preferences', name: 'Preferences', description: 'Settings and configurations', itemCount: 1, size: '24 KB', accessLevel: 'private', encrypted: false },
  ];

  // Mock audit log
  const auditLog: AuditLogEntry[] = [
    { id: 'a1', timestamp: new Date(), action: 'view', actor: 'user', resource: 'Dashboard', resourceType: 'page', ipAddress: '192.168.1.1' },
    { id: 'a2', timestamp: new Date(Date.now() - 300000), action: 'create', actor: 'digital-twin', resource: 'Meeting summary', resourceType: 'document', details: 'Auto-generated from Zoom' },
    { id: 'a3', timestamp: new Date(Date.now() - 600000), action: 'update', actor: 'user', resource: 'Project A Project', resourceType: 'project' },
    { id: 'a4', timestamp: new Date(Date.now() - 3600000), action: 'export', actor: 'user', resource: 'Weekly Report', resourceType: 'document' },
    { id: 'a5', timestamp: new Date(Date.now() - 7200000), action: 'share', actor: 'user', resource: 'Brand Guidelines', resourceType: 'document', details: 'Shared with team@company.com' },
    { id: 'a6', timestamp: new Date(Date.now() - 86400000), action: 'delete', actor: 'system', resource: 'Expired session data', resourceType: 'system', details: 'Automatic cleanup' },
  ];

  const retentionPolicies: RetentionPolicy[] = [
    { category: 'Conversations', retentionDays: 365, autoDelete: false },
    { category: 'Documents', retentionDays: 0, autoDelete: false },
    { category: 'Audit Logs', retentionDays: 90, autoDelete: true },
    { category: 'Session Data', retentionDays: 30, autoDelete: true },
    { category: 'Training Data', retentionDays: 0, autoDelete: false },
  ];

  const accessLevelConfig = {
    private: { label: 'You Only', icon: Lock, color: 'text-red-400', bg: 'bg-red-500/10' },
    twin: { label: 'Chief of Staff', icon: Eye, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    shared: { label: 'Shared', icon: Users, color: 'text-green-400', bg: 'bg-green-500/10' },
  };

  const actionConfig = {
    view: { label: 'Viewed', color: 'text-foreground/70' },
    create: { label: 'Created', color: 'text-green-400' },
    update: { label: 'Updated', color: 'text-blue-400' },
    delete: { label: 'Deleted', color: 'text-red-400' },
    export: { label: 'Exported', color: 'text-purple-400' },
    share: { label: 'Shared', color: 'text-cyan-400' },
  };

  const actorConfig = {
    user: { label: 'You', icon: '👤' },
    'digital-twin': { label: 'Chief of Staff', icon: '🤖' },
    system: { label: 'System', icon: '⚙️' },
    integration: { label: 'Integration', icon: '🔗' },
  };

  const totalSize = dataCategories.reduce((sum, cat) => {
    const size = parseFloat(cat.size);
    const unit = cat.size.includes('MB') ? 1 : cat.size.includes('KB') ? 0.001 : 1000;
    return sum + (size * unit);
  }, 0);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Data Governance</h1>
            <p className="text-sm text-muted-foreground">Your data, your control, fully transparent</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Database className="w-4 h-4" />
              <span className="text-xs">Total Data</span>
            </div>
            <p className="text-xl font-bold text-foreground">{totalSize.toFixed(1)} MB</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Lock className="w-4 h-4 text-green-400" />
              <span className="text-xs">Encrypted</span>
            </div>
            <p className="text-xl font-bold text-green-400">100%</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Globe className="w-4 h-4" />
              <span className="text-xs">Data Region</span>
            </div>
            <p className="text-xl font-bold text-foreground">UK/EU</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">Last Backup</span>
            </div>
            <p className="text-xl font-bold text-foreground">2h ago</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {[
          { id: 'overview', label: 'Data Overview', icon: Database },
          { id: 'audit', label: 'Audit Trail', icon: Clock },
          { id: 'access', label: 'Access Control', icon: Key },
          { id: 'retention', label: 'Retention', icon: Calendar },
          { id: 'export', label: 'Export & Delete', icon: Download },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Your Data Categories</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search data..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {dataCategories.map(category => {
              const accessConfig = accessLevelConfig[category.accessLevel];
              const AccessIcon = accessConfig.icon;

              return (
                <div key={category.id} className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center">
                        <Database className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{category.name}</h3>
                          {category.encrypted && (
                            <span className="flex items-center gap-1 text-xs text-green-400">
                              <Lock className="w-3 h-3" />
                              Encrypted
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{category.itemCount} items</span>
                          <span>{category.size}</span>
                          {category.lastAccessed && (
                            <span>Last accessed {category.lastAccessed.toLocaleTimeString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${accessConfig.bg}`}>
                      <AccessIcon className={`w-3 h-3 ${accessConfig.color}`} />
                      <span className={`text-xs ${accessConfig.color}`}>{accessConfig.label}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Activity Log</h2>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 bg-gray-700 text-foreground rounded-lg hover:bg-gray-600 transition-colors text-sm flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
                <button className="px-3 py-1.5 bg-gray-700 text-foreground rounded-lg hover:bg-gray-600 transition-colors text-sm flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Time</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Action</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Actor</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Resource</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLog.map(entry => (
                    <tr key={entry.id} className="border-b border-border last:border-0 hover:bg-gray-800/30">
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {entry.timestamp.toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm ${actionConfig[entry.action].color}`}>
                          {actionConfig[entry.action].label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-foreground flex items-center gap-1">
                          <span>{actorConfig[entry.actor].icon}</span>
                          {actorConfig[entry.actor].label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <span className="text-sm text-foreground">{entry.resource}</span>
                          <span className="text-xs text-muted-foreground ml-2">({entry.resourceType})</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {entry.details || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'access' && (
          <div className="space-y-6">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-400 mb-1">Access Hierarchy</h3>
                  <p className="text-sm text-muted-foreground">
                    Your data has three access levels. <strong className="text-foreground">You Only</strong> data is never shared. 
                    <strong className="text-foreground"> Chief of Staff</strong> data helps your AI learn and act on your behalf. 
                    <strong className="text-foreground"> Shared</strong> data can be accessed by people you explicitly authorize.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {Object.entries(accessLevelConfig).map(([level, config]) => {
                const Icon = config.icon;
                const count = dataCategories.filter(c => c.accessLevel === level).length;
                
                return (
                  <div key={level} className={`${config.bg} border ${config.bg.replace('bg-', 'border-').replace('/10', '/30')} rounded-xl p-6`}>
                    <Icon className={`w-8 h-8 ${config.color} mb-3`} />
                    <h3 className="font-semibold text-foreground mb-1">{config.label}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {level === 'private' && 'Only you can access this data'}
                      {level === 'twin' && 'Your Chief of Staff can use this data'}
                      {level === 'shared' && 'Authorized users can access'}
                    </p>
                    <p className={`text-2xl font-bold ${config.color}`}>{count} categories</p>
                  </div>
                );
              })}
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4">Third-Party Access</h3>
              <p className="text-sm text-muted-foreground mb-4">
                No third parties have access to your data. Your data is never sold or shared without explicit consent.
              </p>
              <div className="flex items-center gap-2 text-green-400">
                <Check className="w-5 h-5" />
                <span className="font-medium">GDPR Compliant</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'retention' && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Category</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Retention Period</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Auto-Delete</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {retentionPolicies.map(policy => (
                    <tr key={policy.category} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 text-sm text-foreground">{policy.category}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {policy.retentionDays === 0 ? 'Forever' : `${policy.retentionDays} days`}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          policy.autoDelete 
                            ? 'bg-yellow-500/20 text-yellow-400' 
                            : 'bg-gray-500/20 text-foreground/70'
                        }`}>
                          {policy.autoDelete ? 'Enabled' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-sm text-primary hover:underline">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'export' && (
          <div className="space-y-6">
            {/* Export Section */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-2">Export Your Data</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Download a complete copy of all your data in a portable format. This includes conversations, 
                documents, training data, and settings.
              </p>
              <div className="flex items-center gap-4">
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export All Data (JSON)
                </button>
                <button className="px-4 py-2 bg-gray-700 text-foreground rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export as ZIP
                </button>
              </div>
            </div>

            {/* Delete Section */}
            <div className="bg-red-500/5 border border-red-500/30 rounded-xl p-6">
              <h3 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Delete Your Data
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Permanently delete specific data categories or your entire account. This action cannot be undone.
              </p>
              <div className="space-y-2">
                {dataCategories.map(category => (
                  <div key={category.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div>
                      <span className="text-sm text-foreground">{category.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">({category.itemCount} items)</span>
                    </div>
                    <button 
                      onClick={() => setShowDeleteConfirm(category.id)}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-red-500/20">
                <button className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors">
                  Delete Entire Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Confirm Deletion</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete this data? This action cannot be undone and all associated 
              information will be permanently removed.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
