import { useState } from 'react';
import { 
  Settings as SettingsIcon, User, Calendar, Database, 
  Bell, Shield, Palette, CreditCard, Users,
  ChevronRight, Check, Search, Accessibility
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/layout/Breadcrumbs';
import { ThemeSelector, ThemeProvider } from '@/components/settings/ThemeToggle';
import { CalendarIntegration } from '@/components/integrations/CalendarIntegration';
import { TrainingDataPipeline } from '@/components/analytics/TrainingDataPipeline';
import { ReferralDashboard } from '@/components/ai-agents/WaitlistReferral';
import { AccessibilitySettingsPanel } from '@/components/settings/AccessibilitySettingsPanel';

import { IntegrationWizard } from '@/components/integrations/IntegrationWizard';
import { IntegrationsStatus } from '@/components/integrations/IntegrationsStatus';
import { IntegrationsStatusReal } from '@/components/integrations/IntegrationsStatusReal';
import { SubscriptionManager } from '@/components/shared/SubscriptionManager';
import { SignatureManager } from '@/components/shared/SignatureManager';
import { AIProviderSettings } from '@/components/ai-agents/AIRouter';
import { APICostCalculator } from '@/components/integrations/APICostCalculator';
import { SecureStorageDashboard } from '@/components/project-management/SecureStorageDashboard';
import { BrandKitManager } from '@/components/content/BrandKit';
import { DataGovernanceDashboard } from '@/components/project-management/DataGovernanceDashboard';
import { IntegrationsManager } from '@/components/IntegrationsManager';
import { Plug, Wallet, FileSignature, Cpu, HardDrive, Paintbrush, ShieldCheck } from 'lucide-react';

type SettingsTab = 'profile' | 'integrations' | 'ai-providers' | 'storage' | 'data-governance' | 'calendar' | 'notifications' | 'privacy' | 'appearance' | 'accessibility';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'integrations' as const, label: 'Integrations', icon: Plug },
    { id: 'ai-providers' as const, label: 'AI Providers', icon: Cpu },
    { id: 'storage' as const, label: 'Storage & Security', icon: HardDrive },
    { id: 'data-governance' as const, label: 'Data Governance', icon: ShieldCheck },
    { id: 'calendar' as const, label: 'Calendar', icon: Calendar },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'privacy' as const, label: 'Privacy', icon: Shield },
    { id: 'appearance' as const, label: 'Appearance', icon: Palette },
    { id: 'accessibility' as const, label: 'Accessibility', icon: Accessibility },
  ];

  const mockReferralStats = {
    totalReferrals: 12,
    pendingReferrals: 5,
    convertedReferrals: 7,
    creditsEarned: 850,
    referralCode: 'BRAIN-ABC123',
  };

  return (
    <div className="p-4 md:p-6 overflow-auto">
      <div className="max-w-6xl mx-auto">
        <PageHeader 
          title="Settings" 
          subtitle="Manage your account and preferences"
        />

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            {/* Settings Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search settings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-card border-border"
              />
            </div>
            <nav className="bg-card rounded-xl border border-border overflow-hidden">
              {tabs.filter(tab => 
                searchQuery === '' || 
                tab.label.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400'
                      : 'text-foreground/70 hover:bg-gray-700/50 hover:text-foreground/80'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              <>
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Profile Settings</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                      <span className="text-3xl">🧠</span>
                    </div>
                    <div>
                      <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">
                        Change Avatar
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm text-foreground/70 mb-2">Display Name</label>
                      <input
                        type="text"
                        defaultValue="User"
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-foreground/70 mb-2">Email</label>
                      <input
                        type="email"
                        defaultValue="user@example.com"
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-foreground/70 mb-2">Timezone</label>
                      <select className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500">
                        <option>UTC-8 (Pacific Time)</option>
                        <option>UTC-5 (Eastern Time)</option>
                        <option>UTC+0 (GMT)</option>
                        <option>UTC+1 (Central European)</option>
                      </select>
                    </div>
                  </div>

                  <button className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>


              </>
            )}

            {activeTab === 'integrations' && (
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <IntegrationsManager />
              </div>
            )}


            {activeTab === 'ai-providers' && (
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <AIProviderSettings />
              </div>
            )}

            {activeTab === 'storage' && (
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <SecureStorageDashboard />
              </div>
            )}

            {activeTab === 'data-governance' && (
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <DataGovernanceDashboard />
              </div>
            )}

            {activeTab === 'calendar' && <CalendarIntegration />}


            {activeTab === 'notifications' && (
              <div className="space-y-6">
                {/* Do Not Disturb */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Do Not Disturb</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-900 rounded-xl">
                      <div>
                        <div className="font-medium text-white">Enable Do Not Disturb</div>
                        <div className="text-sm text-foreground/60">Pause all notifications</div>
                      </div>
                      <button className="w-12 h-6 rounded-full transition-colors bg-gray-700">
                        <div className="w-5 h-5 rounded-full bg-white transition-transform translate-x-0.5" />
                      </button>
                    </div>
                    <div className="p-4 bg-gray-900 rounded-xl">
                      <div className="font-medium text-white mb-3">Schedule Quiet Hours</div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-foreground/70 block mb-1">Start Time</label>
                          <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white">
                            <option>10:00 PM</option>
                            <option>11:00 PM</option>
                            <option>12:00 AM</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm text-foreground/70 block mb-1">End Time</label>
                          <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white">
                            <option>6:00 AM</option>
                            <option>7:00 AM</option>
                            <option>8:00 AM</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email Digest Options */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Email Digest</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Daily Digest', description: 'Receive a summary email every morning', selected: true },
                      { label: 'Weekly Digest', description: 'Get a weekly roundup on Mondays', selected: false },
                      { label: 'Urgent Only', description: 'Only receive emails for critical alerts', selected: false },
                      { label: 'No Emails', description: 'Disable all email notifications', selected: false },
                    ].map((option, index) => (
                      <label key={index} className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-850 transition-colors">
                        <input
                          type="radio"
                          name="emailDigest"
                          defaultChecked={option.selected}
                          className="w-4 h-4 text-cyan-500 bg-gray-800 border-gray-600 focus:ring-cyan-500"
                        />
                        <div>
                          <div className="font-medium text-white">{option.label}</div>
                          <div className="text-sm text-foreground/60">{option.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Notification Preferences */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-6">Notification Preferences</h3>
                  
                  <div className="space-y-4">
                    {[
                      { label: 'The Signal Reminder', description: 'Get reminded to check your daily brief each morning', enabled: true },
                      { label: 'Mood Check Prompts', description: 'Receive prompts to log your mood 3x daily', enabled: true },
                      { label: 'Task Deadlines', description: 'Get notified before task deadlines', enabled: true },
                      { label: 'AI Insights', description: 'Receive insights from your Chief of Staff', enabled: false },
                      { label: 'Weekly Summary', description: 'Get a weekly productivity summary', enabled: true },
                      { label: 'Security Alerts', description: 'Get notified of security events in The Vault', enabled: true },
                      { label: 'Integration Status', description: 'Alerts when connected services have issues', enabled: true },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-900 rounded-xl">
                        <div>
                          <div className="font-medium text-white">{item.label}</div>
                          <div className="text-sm text-foreground/60">{item.description}</div>
                        </div>
                        <button
                          className={`w-12 h-6 rounded-full transition-colors ${
                            item.enabled ? 'bg-cyan-500' : 'bg-gray-700'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-white transition-transform ${
                              item.enabled ? 'translate-x-6' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Privacy Settings</h3>
                
                <div className="space-y-6">
                  <div className="p-4 bg-gray-900 rounded-xl">
                    <h4 className="font-medium text-white mb-2">Data Collection</h4>
                    <p className="text-sm text-foreground/70 mb-4">
                      Control what data your Chief of Staff can access and learn from.
                    </p>
                    <div className="space-y-3">
                      {[
                        { label: 'Learn from conversations', enabled: true },
                        { label: 'Analyze calendar patterns', enabled: true },
                        { label: 'Track mood over time', enabled: true },
                        { label: 'Share anonymized insights', enabled: false },
                      ].map((item, index) => (
                        <label key={index} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            defaultChecked={item.enabled}
                            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-cyan-500 focus:ring-cyan-500"
                          />
                          <span className="text-foreground/80">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-gray-900 rounded-xl">
                    <h4 className="font-medium text-white mb-2">Data Retention</h4>
                    <p className="text-sm text-foreground/70 mb-4">
                      Choose how long to keep your data.
                    </p>
                    <select className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500">
                      <option>Keep forever</option>
                      <option>1 year</option>
                      <option>6 months</option>
                      <option>3 months</option>
                    </select>
                  </div>

                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <h4 className="font-medium text-red-400 mb-2">Danger Zone</h4>
                    <p className="text-sm text-foreground/70 mb-4">
                      Permanently delete your account and all associated data.
                    </p>
                    <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Appearance</h3>
                
                <div className="space-y-8">
                  {/* Theme Selector Component */}
                  <ThemeProvider>
                    <ThemeSelector />
                  </ThemeProvider>

                  <div className="border-t border-gray-700 pt-6">
                    <label className="block text-sm font-medium text-foreground mb-3">Accent Color</label>
                    <div className="flex gap-3">
                      {[
                        { color: 'cyan', class: 'bg-cyan-500' },
                        { color: 'purple', class: 'bg-purple-500' },
                        { color: 'pink', class: 'bg-pink-500' },
                        { color: 'green', class: 'bg-green-500' },
                        { color: 'orange', class: 'bg-orange-500' },
                      ].map((item) => (
                        <button
                          key={item.color}
                          className={`w-10 h-10 rounded-full ${item.class} transition-transform hover:scale-110 ${
                            item.color === 'cyan' ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800' : ''
                          }`}
                          title={item.color.charAt(0).toUpperCase() + item.color.slice(1)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-700 pt-6">
                    <label className="block text-sm font-medium text-foreground mb-3">Font Size</label>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">A</span>
                      <input
                        type="range"
                        min="12"
                        max="20"
                        defaultValue="16"
                        className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-lg text-muted-foreground">A</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'accessibility' && <AccessibilitySettingsPanel />}
          </div>
        </div>
      </div>
    </div>
  );
}
