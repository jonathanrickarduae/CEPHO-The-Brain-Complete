import React, { useState } from 'react';

// Secure Cloud Storage Dashboard
// Shows storage usage, backup status, and security health

interface StorageTier {
  name: string;
  used: number; // GB
  total: number; // GB
  description: string;
  color: string;
}

interface BackupInfo {
  id: string;
  type: 'daily' | 'weekly' | 'monthly';
  timestamp: Date;
  size: number; // MB
  status: 'completed' | 'in_progress' | 'failed';
}

interface SecurityCheck {
  id: string;
  name: string;
  status: 'passed' | 'warning' | 'failed';
  description: string;
  lastChecked: Date;
}

interface AuditLogEntry {
  id: string;
  action: string;
  resource: string;
  user: string;
  timestamp: Date;
  ipAddress: string;
}

export function SecureStorageDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'backups' | 'security' | 'audit'>('overview');
  
  // Mock data
  const storageTiers: StorageTier[] = [
    { name: 'Hot Storage', used: 45.2, total: 100, description: 'Active projects, recent documents', color: 'bg-blue-500' },
    { name: 'Warm Storage', used: 128.5, total: 500, description: 'Older projects, archives', color: 'bg-amber-500' },
    { name: 'Cold Storage', used: 312.8, total: 2000, description: 'Backups, historical data', color: 'bg-gray-500' },
  ];
  
  const totalUsed = storageTiers.reduce((sum, tier) => sum + tier.used, 0);
  const totalAvailable = storageTiers.reduce((sum, tier) => sum + tier.total, 0);
  
  const backups: BackupInfo[] = [
    { id: '1', type: 'daily', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), size: 245, status: 'completed' },
    { id: '2', type: 'daily', timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000), size: 243, status: 'completed' },
    { id: '3', type: 'weekly', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), size: 1250, status: 'completed' },
    { id: '4', type: 'monthly', timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), size: 4800, status: 'completed' },
  ];
  
  const securityChecks: SecurityCheck[] = [
    { id: '1', name: 'Encryption at Rest', status: 'passed', description: 'AES-256 encryption enabled', lastChecked: new Date() },
    { id: '2', name: 'Encryption in Transit', status: 'passed', description: 'TLS 1.3 for all connections', lastChecked: new Date() },
    { id: '3', name: 'Multi-Factor Authentication', status: 'passed', description: 'MFA enabled for account', lastChecked: new Date() },
    { id: '4', name: 'Access Controls', status: 'passed', description: 'Role-based access configured', lastChecked: new Date() },
    { id: '5', name: 'Backup Verification', status: 'passed', description: 'Last backup verified successfully', lastChecked: new Date() },
    { id: '6', name: 'Intrusion Detection', status: 'passed', description: 'No anomalies detected', lastChecked: new Date() },
    { id: '7', name: 'Data Residency', status: 'passed', description: 'Data stored in UK/EU regions', lastChecked: new Date() },
    { id: '8', name: 'API Key Rotation', status: 'warning', description: 'Some keys older than 90 days', lastChecked: new Date() },
  ];
  
  const auditLog: AuditLogEntry[] = [
    { id: '1', action: 'File Upload', resource: 'WasteGen/pitch-deck.pdf', user: 'Jonathan', timestamp: new Date(Date.now() - 30 * 60 * 1000), ipAddress: '192.168.1.x' },
    { id: '2', action: 'Document View', resource: 'Sample Project/Final_Report.pdf', user: 'Jonathan', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), ipAddress: '192.168.1.x' },
    { id: '3', action: 'Backup Created', resource: 'System', user: 'System', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), ipAddress: 'Internal' },
    { id: '4', action: 'Settings Changed', resource: 'Security Settings', user: 'Jonathan', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), ipAddress: '192.168.1.x' },
    { id: '5', action: 'Login', resource: 'Account', user: 'Jonathan', timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), ipAddress: '192.168.1.x' },
  ];
  
  const securityScore = Math.round(
    (securityChecks.filter(c => c.status === 'passed').length / securityChecks.length) * 100
  );
  
  const formatBytes = (gb: number) => {
    if (gb < 1) return `${Math.round(gb * 1024)} MB`;
    return `${gb.toFixed(1)} GB`;
  };
  
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Secure Cloud Storage</h3>
        <p className="text-sm text-foreground/50">Storage usage, backups, and security status</p>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
        {(['overview', 'backups', 'security', 'audit'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-foreground/50 hover:text-gray-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Total Usage */}
          <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-blue-100 text-sm">Total Storage Used</p>
                <p className="text-3xl font-bold">{formatBytes(totalUsed)}</p>
              </div>
              <div className="text-right">
                <p className="text-blue-100 text-sm">Available</p>
                <p className="text-xl font-semibold">{formatBytes(totalAvailable)}</p>
              </div>
            </div>
            <div className="h-2 bg-blue-400/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${(totalUsed / totalAvailable) * 100}%` }}
              />
            </div>
            <p className="text-blue-100 text-xs mt-2">
              {Math.round((totalUsed / totalAvailable) * 100)}% used
            </p>
          </div>
          
          {/* Storage Tiers */}
          <div className="grid gap-4">
            {storageTiers.map(tier => (
              <div key={tier.name} className="p-4 bg-white border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${tier.color}`} />
                    <span className="font-medium text-gray-900">{tier.name}</span>
                  </div>
                  <span className="text-sm text-foreground/50">
                    {formatBytes(tier.used)} / {formatBytes(tier.total)}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${tier.color} rounded-full transition-all`}
                    style={{ width: `${(tier.used / tier.total) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-foreground/60 mt-2">{tier.description}</p>
              </div>
            ))}
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-600">{securityScore}%</p>
              <p className="text-sm text-green-700">Security Score</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-600">{backups.length}</p>
              <p className="text-sm text-blue-700">Recent Backups</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-purple-600">UK/EU</p>
              <p className="text-sm text-purple-700">Data Region</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Backups Tab */}
      {activeTab === 'backups' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground/50">Automatic backups are enabled</p>
            <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Create Backup Now
            </button>
          </div>
          
          <div className="space-y-2">
            {backups.map(backup => (
              <div key={backup.id} className="flex items-center justify-between p-4 bg-white border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    backup.type === 'daily' ? 'bg-blue-100 text-blue-600' :
                    backup.type === 'weekly' ? 'bg-purple-100 text-purple-600' :
                    'bg-amber-100 text-amber-600'
                  }`}>
                    {backup.type === 'daily' ? '📅' : backup.type === 'weekly' ? '📆' : '🗓️'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 capitalize">{backup.type} Backup</p>
                    <p className="text-sm text-foreground/60">{formatTime(backup.timestamp)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-foreground/50">{backup.size} MB</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    backup.status === 'completed' ? 'bg-green-100 text-green-700' :
                    backup.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {backup.status === 'completed' ? '✓ Complete' : 
                     backup.status === 'in_progress' ? 'In Progress' : 'Failed'}
                  </span>
                  <button className="text-sm text-blue-600 hover:text-blue-700">
                    Restore
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Backup Schedule</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-foreground/60">Daily</p>
                <p className="font-medium">Every day at 3:00 AM</p>
              </div>
              <div>
                <p className="text-foreground/60">Weekly</p>
                <p className="font-medium">Every Sunday at 3:00 AM</p>
              </div>
              <div>
                <p className="text-foreground/60">Monthly</p>
                <p className="font-medium">1st of each month</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-4">
          {/* Security Score */}
          <div className="p-4 bg-white border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-foreground/50">Security Health Score</p>
                <p className="text-3xl font-bold text-gray-900">{securityScore}%</p>
              </div>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                securityScore >= 90 ? 'bg-green-100 text-green-600' :
                securityScore >= 70 ? 'bg-amber-100 text-amber-600' :
                'bg-red-100 text-red-600'
              }`}>
                {securityScore >= 90 ? '🛡️' : securityScore >= 70 ? '⚠️' : '🚨'}
              </div>
            </div>
          </div>
          
          {/* Security Checks */}
          <div className="space-y-2">
            {securityChecks.map(check => (
              <div key={check.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                    check.status === 'passed' ? 'bg-green-100 text-green-600' :
                    check.status === 'warning' ? 'bg-amber-100 text-amber-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {check.status === 'passed' ? '✓' : check.status === 'warning' ? '!' : '✕'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{check.name}</p>
                    <p className="text-sm text-foreground/60">{check.description}</p>
                  </div>
                </div>
                <span className="text-xs text-foreground/70">
                  Checked {formatTime(check.lastChecked)}
                </span>
              </div>
            ))}
          </div>
          
          {/* Emergency Actions */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">Emergency Actions</h4>
            <div className="flex gap-3">
              <button className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">
                Remote Wipe
              </button>
              <button className="px-4 py-2 text-sm border border-red-300 text-red-700 rounded-lg hover:bg-red-100">
                Lock Account
              </button>
              <button className="px-4 py-2 text-sm border border-red-300 text-red-700 rounded-lg hover:bg-red-100">
                Revoke All Sessions
              </button>
            </div>
            <p className="text-xs text-red-600 mt-2">
              These actions are irreversible. Use only in case of security breach.
            </p>
          </div>
        </div>
      )}
      
      {/* Audit Tab */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground/50">Recent activity on your account</p>
            <button className="text-sm text-blue-600 hover:text-blue-700">
              Export Full Log
            </button>
          </div>
          
          <div className="space-y-2">
            {auditLog.map(entry => (
              <div key={entry.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">
                    {entry.action.includes('Upload') ? '📤' :
                     entry.action.includes('View') ? '👁️' :
                     entry.action.includes('Backup') ? '💾' :
                     entry.action.includes('Login') ? '🔑' : '⚙️'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{entry.action}</p>
                    <p className="text-sm text-foreground/60">{entry.resource}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-foreground/50">{entry.user}</p>
                  <p className="text-xs text-foreground/70">{formatTime(entry.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SecureStorageDashboard;
