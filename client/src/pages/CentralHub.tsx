import { useState } from 'react';
import {
  Mail, Calendar, FolderOpen, MessageSquare, Mic, PenTool,
  Settings, ChevronRight, RefreshCw, Plus, Search, Filter,
  Inbox, Send, Archive, Trash2, Star, Clock, CheckCircle2,
  Video, FileText, Image, MoreHorizontal, ExternalLink,
  Cloud, HardDrive, Database, Link2, Bell, Shield,
  Smartphone, Globe, Zap, ArrowUpRight, X, LayoutDashboard
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

// Integration status types
type IntegrationStatus = 'connected' | 'disconnected' | 'pending';

interface Integration {
  id: string;
  name: string;
  icon: string;
  category: 'email' | 'calendar' | 'storage' | 'messaging' | 'productivity';
  status: IntegrationStatus;
  description: string;
  lastSync?: string;
}

// Mock integrations data
const integrations: Integration[] = [
  // Email
  { id: 'gmail', name: 'Gmail', icon: '📧', category: 'email', status: 'disconnected', description: 'Google email and calendar' },
  { id: 'outlook', name: 'Outlook', icon: '📬', category: 'email', status: 'disconnected', description: 'Microsoft 365 email and calendar' },
  // Calendar
  { id: 'google-calendar', name: 'Google Calendar', icon: '📅', category: 'calendar', status: 'disconnected', description: 'Sync your Google Calendar events' },
  { id: 'outlook-calendar', name: 'Outlook Calendar', icon: '🗓️', category: 'calendar', status: 'disconnected', description: 'Sync your Microsoft calendar' },
  // Storage
  { id: 'dropbox', name: 'Dropbox', icon: '📦', category: 'storage', status: 'disconnected', description: 'Access your Dropbox files' },
  { id: 'google-drive', name: 'Google Drive', icon: '🗂️', category: 'storage', status: 'disconnected', description: 'Access your Google Drive files' },
  { id: 'onedrive', name: 'OneDrive', icon: '☁️', category: 'storage', status: 'disconnected', description: 'Access your Microsoft OneDrive files' },
  // Messaging
  { id: 'whatsapp', name: 'WhatsApp', icon: '💬', category: 'messaging', status: 'disconnected', description: 'View and send WhatsApp messages' },
  // Productivity
  { id: 'notta', name: 'Notta', icon: '🎙️', category: 'productivity', status: 'disconnected', description: 'AI meeting transcription' },
  { id: 'grammarly', name: 'Grammarly', icon: '✍️', category: 'productivity', status: 'disconnected', description: 'Writing assistant' },
];

// Mock email data
const mockEmails = [
  { id: '1', from: 'Sarah Chen', subject: 'Q4 Strategy Review - Action Items', preview: 'Hi team, following up on our strategy session...', time: '10:30 AM', unread: true, starred: true },
  { id: '2', from: 'Michael Torres', subject: 'Investment Proposal - Celadon', preview: 'Please find attached the updated investment memo...', time: '9:15 AM', unread: true, starred: false },
  { id: '3', from: 'LinkedIn', subject: 'New connection request', preview: 'John Smith wants to connect with you...', time: 'Yesterday', unread: false, starred: false },
  { id: '4', from: 'AWS', subject: 'Your monthly invoice is ready', preview: 'Your AWS invoice for December 2025...', time: 'Yesterday', unread: false, starred: false },
  { id: '5', from: 'Emma Wilson', subject: 'Re: Partnership Discussion', preview: 'Thanks for the call yesterday. I think we...', time: 'Jan 10', unread: false, starred: true },
];

// Mock calendar events
const mockEvents = [
  { id: '1', title: 'Team Standup', time: '9:00 AM - 9:30 AM', type: 'meeting', color: 'blue' },
  { id: '2', title: 'Investor Call - Series A', time: '11:00 AM - 12:00 PM', type: 'call', color: 'purple' },
  { id: '3', title: 'Product Review', time: '2:00 PM - 3:00 PM', type: 'meeting', color: 'green' },
  { id: '4', title: 'Q4 Planning Session', time: '4:00 PM - 5:30 PM', type: 'workshop', color: 'orange' },
];

// Mock files
const mockFiles = [
  { id: '1', name: 'Q4 Strategy Deck.pptx', source: 'Google Drive', size: '12.3 MB', modified: '2 hours ago', type: 'presentation' },
  { id: '2', name: 'Financial Model v3.xlsx', source: 'Dropbox', size: '2.1 MB', modified: 'Yesterday', type: 'spreadsheet' },
  { id: '3', name: 'Board Meeting Notes.pdf', source: 'OneDrive', size: '890 KB', modified: 'Jan 10', type: 'document' },
  { id: '4', name: 'Product Screenshots', source: 'Google Drive', size: '45 MB', modified: 'Jan 8', type: 'folder' },
];

// Mock messages
const mockMessages = [
  { id: '1', contact: 'Alex Kim', message: 'Meeting confirmed for tomorrow at 3pm', time: '11:45 AM', unread: true },
  { id: '2', contact: 'Team Chat', message: 'Sarah: Just pushed the latest updates', time: '10:30 AM', unread: true },
  { id: '3', contact: 'Mom', message: 'Call me when you get a chance', time: 'Yesterday', unread: false },
];

type TabType = 'overview' | 'email' | 'calendar' | 'files' | 'messages' | 'productivity' | 'settings';

export default function CentralHub() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

  const connectedCount = integrations.filter(i => i.status === 'connected').length;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Globe },
    { id: 'email', label: 'Email', icon: Mail, badge: 2 },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'files', label: 'Files', icon: FolderOpen },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: 3 },
    { id: 'productivity', label: 'Productivity', icon: Zap },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleConnect = (integration: Integration) => {
    setSelectedIntegration(integration);
    setShowIntegrationModal(true);
  };

  return (
    <div className="h-[calc(100vh-56px)] md:h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
      {/* Header */}
      <PageHeader 
        icon={LayoutDashboard} 
        title="Central Hub"
        subtitle="Your unified command center"
        iconColor="text-purple-400"
      >
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
            {connectedCount} of {integrations.length} connected
          </Badge>
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Sync All
          </Button>
        </div>
      </PageHeader>

      {/* Tabs */}
      <div className="shrink-0 border-b border-white/10 bg-white/5 px-4">
        <div className="max-w-7xl mx-auto flex gap-1 overflow-x-auto py-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20 text-purple-400 border border-purple-500/30'
                  : 'text-foreground/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.badge && (
                <span className="px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white/5 rounded-2xl border-2 border-white/10 hover:border-purple-500/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Mail className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">12</p>
                    <p className="text-xs text-muted-foreground">Unread emails</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border-2 border-white/10 hover:border-purple-500/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Calendar className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">4</p>
                    <p className="text-xs text-muted-foreground">Events today</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border-2 border-white/10 hover:border-purple-500/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">3</p>
                    <p className="text-xs text-muted-foreground">New messages</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border-2 border-white/10 hover:border-purple-500/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <FolderOpen className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">8</p>
                    <p className="text-xs text-muted-foreground">Recent files</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Integration Status */}
            <div className="bg-white/5 rounded-2xl border-2 border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Connected Services</h2>
                <Button variant="outline" size="sm" onClick={() => setActiveTab('settings')}>
                  Manage Integrations
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {integrations.slice(0, 10).map(integration => (
                  <button
                    key={integration.id}
                    onClick={() => handleConnect(integration)}
                    className={`p-3 rounded-lg border transition-all text-center ${
                      integration.status === 'connected'
                        ? 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50'
                        : 'bg-secondary/30 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <span className="text-2xl">{integration.icon}</span>
                    <p className="text-xs font-medium text-foreground mt-1">{integration.name}</p>
                    <p className={`text-xs mt-0.5 ${
                      integration.status === 'connected' ? 'text-emerald-400' : 'text-muted-foreground'
                    }`}>
                      {integration.status === 'connected' ? 'Connected' : 'Not connected'}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activity Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Emails */}
              <div className="bg-card/50 rounded-xl border border-white/10 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-400" />
                    Recent Emails
                  </h3>
                  <button 
                    onClick={() => setActiveTab('email')}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    View all →
                  </button>
                </div>
                <div className="space-y-2">
                  {mockEmails.slice(0, 3).map(email => (
                    <div key={email.id} className="p-2 rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${email.unread ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                          {email.from}
                        </span>
                        <span className="text-xs text-muted-foreground">{email.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{email.subject}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Today's Calendar */}
              <div className="bg-card/50 rounded-xl border border-white/10 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    Today's Schedule
                  </h3>
                  <button 
                    onClick={() => setActiveTab('calendar')}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    View all →
                  </button>
                </div>
                <div className="space-y-2">
                  {mockEvents.map(event => (
                    <div key={event.id} className="p-2 rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer flex items-center gap-3">
                      <div className={`w-1 h-8 rounded-full bg-${event.color}-500`} />
                      <div>
                        <p className="text-sm font-medium text-foreground">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{event.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Email Tab */}
        {activeTab === 'email' && (
          <div className="bg-card/50 rounded-xl border border-white/10">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="font-semibold text-foreground">Inbox</h2>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Inbox className="w-4 h-4" /> Inbox
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Star className="w-4 h-4" /> Starred
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Send className="w-4 h-4" /> Sent
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search emails..." className="pl-9 w-64" />
                </div>
                <Button size="sm" className="gap-1">
                  <Plus className="w-4 h-4" /> Compose
                </Button>
              </div>
            </div>
            <div className="divide-y divide-white/5">
              {mockEmails.map(email => (
                <div 
                  key={email.id} 
                  className={`p-4 hover:bg-secondary/30 transition-colors cursor-pointer ${
                    email.unread ? 'bg-blue-500/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex items-center gap-2">
                      <button className="text-muted-foreground hover:text-yellow-400">
                        <Star className={`w-4 h-4 ${email.starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`${email.unread ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                          {email.from}
                        </span>
                        <span className="text-xs text-muted-foreground">{email.time}</span>
                      </div>
                      <p className={`text-sm ${email.unread ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                        {email.subject}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-1">{email.preview}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {integrations.find(i => i.id === 'gmail')?.status === 'disconnected' && (
              <div className="p-8 text-center border-t border-white/10">
                <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-4">Connect your email accounts to see your inbox here</p>
                <Button onClick={() => setActiveTab('settings')}>
                  Connect Email
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className="bg-card/50 rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-foreground">Today - January 12, 2026</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Day</Button>
                <Button variant="outline" size="sm">Week</Button>
                <Button variant="outline" size="sm">Month</Button>
              </div>
            </div>
            <div className="space-y-3">
              {mockEvents.map(event => (
                <div 
                  key={event.id}
                  className="p-4 rounded-xl bg-secondary/30 border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-12 rounded-full ${
                      event.color === 'blue' ? 'bg-blue-500' :
                      event.color === 'purple' ? 'bg-purple-500' :
                      event.color === 'green' ? 'bg-green-500' :
                      'bg-orange-500'
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{event.title}</p>
                      <p className="text-sm text-muted-foreground">{event.time}</p>
                    </div>
                    <Badge variant="outline" className="capitalize">{event.type}</Badge>
                  </div>
                </div>
              ))}
            </div>
            {integrations.find(i => i.id === 'google-calendar')?.status === 'disconnected' && (
              <div className="p-8 text-center border-t border-white/10 mt-6">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-4">Connect your calendars to see all your events</p>
                <Button onClick={() => setActiveTab('settings')}>
                  Connect Calendar
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Files Tab */}
        {activeTab === 'files' && (
          <div className="bg-card/50 rounded-xl border border-white/10">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="font-semibold text-foreground">All Files</h2>
                <div className="flex gap-2">
                  <Badge variant="outline" className="gap-1">
                    <span className="text-lg">🗂️</span> Google Drive
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <span className="text-lg">📦</span> Dropbox
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <span className="text-lg">☁️</span> OneDrive
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search files..." className="pl-9 w-64" />
                </div>
              </div>
            </div>
            <div className="divide-y divide-white/5">
              {mockFiles.map(file => (
                <div key={file.id} className="p-4 hover:bg-secondary/30 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-secondary/50 rounded-lg">
                      {file.type === 'presentation' && <FileText className="w-5 h-5 text-orange-400" />}
                      {file.type === 'spreadsheet' && <FileText className="w-5 h-5 text-green-400" />}
                      {file.type === 'document' && <FileText className="w-5 h-5 text-blue-400" />}
                      {file.type === 'folder' && <FolderOpen className="w-5 h-5 text-yellow-400" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{file.source} • {file.size}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{file.modified}</span>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="bg-card/50 rounded-xl border border-white/10">
            <div className="p-4 border-b border-white/10">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <span className="text-xl">💬</span> WhatsApp Messages
              </h2>
            </div>
            <div className="divide-y divide-white/5">
              {mockMessages.map(msg => (
                <div 
                  key={msg.id}
                  className={`p-4 hover:bg-secondary/30 transition-colors cursor-pointer ${
                    msg.unread ? 'bg-emerald-500/5' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`${msg.unread ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                      {msg.contact}
                    </span>
                    <span className="text-xs text-muted-foreground">{msg.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{msg.message}</p>
                </div>
              ))}
            </div>
            {integrations.find(i => i.id === 'whatsapp')?.status === 'disconnected' && (
              <div className="p-8 text-center border-t border-white/10">
                <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-4">Connect WhatsApp to see your messages here</p>
                <Button onClick={() => setActiveTab('settings')}>
                  Connect WhatsApp
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Productivity Tab */}
        {activeTab === 'productivity' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Notta */}
            <div className="bg-white/5 rounded-2xl border-2 border-white/10 p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🎙️</span>
                <div>
                  <h3 className="font-semibold text-foreground">Notta</h3>
                  <p className="text-sm text-muted-foreground">AI Meeting Transcription</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Automatically transcribe your meetings and get AI-powered summaries, action items, and insights.
              </p>
              <Button onClick={() => setActiveTab('settings')} className="w-full">
                Connect Notta
              </Button>
            </div>

            {/* Grammarly */}
            <div className="bg-white/5 rounded-2xl border-2 border-white/10 p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">✍️</span>
                <div>
                  <h3 className="font-semibold text-foreground">Grammarly</h3>
                  <p className="text-sm text-muted-foreground">Writing Assistant</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Enhance your writing with AI-powered grammar, tone, and style suggestions across all your documents.
              </p>
              <Button onClick={() => setActiveTab('settings')} className="w-full">
                Connect Grammarly
              </Button>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white/5 rounded-2xl border-2 border-white/10 p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Integration Settings</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Connect your accounts to access all your communications and files in one place. 
                Your credentials are securely stored and encrypted.
              </p>

              {/* Email Integrations */}
              <div className="mb-8">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Email & Calendar</h3>
                <div className="space-y-3">
                  {integrations.filter(i => i.category === 'email' || i.category === 'calendar').map(integration => (
                    <div key={integration.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-white/10">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{integration.icon}</span>
                        <div>
                          <p className="font-medium text-foreground">{integration.name}</p>
                          <p className="text-xs text-muted-foreground">{integration.description}</p>
                        </div>
                      </div>
                      <Button 
                        variant={integration.status === 'connected' ? 'outline' : 'default'}
                        size="sm"
                        onClick={() => handleConnect(integration)}
                      >
                        {integration.status === 'connected' ? 'Manage' : 'Connect'}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Storage Integrations */}
              <div className="mb-8">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Cloud Storage</h3>
                <div className="space-y-3">
                  {integrations.filter(i => i.category === 'storage').map(integration => (
                    <div key={integration.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-white/10">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{integration.icon}</span>
                        <div>
                          <p className="font-medium text-foreground">{integration.name}</p>
                          <p className="text-xs text-muted-foreground">{integration.description}</p>
                        </div>
                      </div>
                      <Button 
                        variant={integration.status === 'connected' ? 'outline' : 'default'}
                        size="sm"
                        onClick={() => handleConnect(integration)}
                      >
                        {integration.status === 'connected' ? 'Manage' : 'Connect'}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Messaging Integrations */}
              <div className="mb-8">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Messaging</h3>
                <div className="space-y-3">
                  {integrations.filter(i => i.category === 'messaging').map(integration => (
                    <div key={integration.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-white/10">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{integration.icon}</span>
                        <div>
                          <p className="font-medium text-foreground">{integration.name}</p>
                          <p className="text-xs text-muted-foreground">{integration.description}</p>
                        </div>
                      </div>
                      <Button 
                        variant={integration.status === 'connected' ? 'outline' : 'default'}
                        size="sm"
                        onClick={() => handleConnect(integration)}
                      >
                        {integration.status === 'connected' ? 'Manage' : 'Connect'}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Productivity Integrations */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Productivity</h3>
                <div className="space-y-3">
                  {integrations.filter(i => i.category === 'productivity').map(integration => (
                    <div key={integration.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-white/10">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{integration.icon}</span>
                        <div>
                          <p className="font-medium text-foreground">{integration.name}</p>
                          <p className="text-xs text-muted-foreground">{integration.description}</p>
                        </div>
                      </div>
                      <Button 
                        variant={integration.status === 'connected' ? 'outline' : 'default'}
                        size="sm"
                        onClick={() => handleConnect(integration)}
                      >
                        {integration.status === 'connected' ? 'Manage' : 'Connect'}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Integration Modal */}
      {showIntegrationModal && selectedIntegration && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border-2 border-purple-500/30 rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedIntegration.icon}</span>
                <h3 className="text-lg font-semibold text-foreground">Connect {selectedIntegration.name}</h3>
              </div>
              <button 
                onClick={() => setShowIntegrationModal(false)}
                className="p-1 hover:bg-secondary/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              {selectedIntegration.description}. Click the button below to authorize access to your account.
            </p>
            <div className="space-y-3">
              <Button className="w-full gap-2">
                <ExternalLink className="w-4 h-4" />
                Connect with {selectedIntegration.name}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                <Shield className="w-3 h-3 inline mr-1" />
                Your credentials are securely encrypted
              </p>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
