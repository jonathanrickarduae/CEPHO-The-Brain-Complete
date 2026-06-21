import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  User, Bot, Bell, Link2, Shield, Palette,
  Mail, Calendar, Github, CheckCircle, AlertCircle, Zap
} from "lucide-react";

type SettingsTab = "account" | "victoria" | "integrations" | "notifications" | "appearance" | "security";

const TABS: { id: SettingsTab; label: string; icon: any }[] = [
  { id: "account", label: "Account", icon: User },
  { id: "victoria", label: "Victoria AI", icon: Bot },
  { id: "integrations", label: "Integrations", icon: Link2 },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "security", label: "Security", icon: Shield },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");
  const [integrations, setIntegrations] = useState<Record<string, { connected: boolean; label: string; detail: string }>>({
    gmail: { connected: false, label: "Gmail", detail: "Read and send email across all accounts" },
    googleCalendar: { connected: false, label: "Google Calendar", detail: "Sync meetings and events" },
    outlook: { connected: false, label: "Outlook / Microsoft 365", detail: "Email and calendar from Microsoft accounts" },
    github: { connected: true, label: "GitHub", detail: "Connected to jonathanrickarduae" },
    notion: { connected: false, label: "Notion", detail: "Sync documents and notes" },
    slack: { connected: false, label: "Slack", detail: "Receive alerts and send messages" },
  });

  const [name, setName] = useState("Jonathan Rickard");
  const [email, setEmail] = useState("jonathan@cepho.ai");
  const [timezone, setTimezone] = useState("Europe/London");
  const [victoriaStyle, setVictoriaStyle] = useState("direct");
  const [victoriaContext, setVictoriaContext] = useState("I am a founder running 5 companies: Celadon (fintech), Celanova (hospitality), Perfect (SaaS), Olmack (property), and Boundless (education). I need concise, data-driven briefings with no filler.");
  const [victoriaAutobrief, setVictoriaAutobrief] = useState(true);
  const [victoriaApproval, setVictoriaApproval] = useState(true);
  const [victoriaSME, setVictoriaSME] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifUrgent, setNotifUrgent] = useState(true);
  const [notifDecisions, setNotifDecisions] = useState(false);
  const [notifVault, setNotifVault] = useState(true);
  const [notifSME, setNotifSME] = useState(false);

  const handleSave = (section: string) => toast.success(`${section} settings saved`);

  const toggleIntegration = (key: string) => {
    const current = integrations[key];
    if (!current) return;
    if (current.connected) {
      setIntegrations(p => ({ ...p, [key]: { ...current, connected: false } }));
      toast.success(`${current.label} disconnected`);
    } else {
      toast.info(`Connecting to ${current.label}...`);
      setIntegrations(p => ({ ...p, [key]: { ...current, connected: true } }));
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-full">
      {/* Sidebar */}
      <div className="w-full md:w-52 md:shrink-0 border-b md:border-b-0 md:border-r border-border bg-white p-4 md:space-y-1 flex md:flex-col flex-row gap-1 overflow-x-auto">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-3 hidden md:block">Settings</p>
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              title={tab.label}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors md:w-full ${
                activeTab === tab.id
                  ? "bg-[oklch(0.78_0.18_195)]/10 text-[oklch(0.58_0.18_195)] font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-gray-50"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 p-6 max-w-2xl">

        {activeTab === "account" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">Account</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Your profile and workspace settings</p>
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Full Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Email</Label>
                <Input value={email} onChange={e => setEmail(e.target.value)} type="email" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger className="text-sm h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Europe/London">Europe/London (GMT+1)</SelectItem>
                    <SelectItem value="Europe/Paris">Europe/Paris (GMT+2)</SelectItem>
                    <SelectItem value="America/New_York">America/New_York (GMT-4)</SelectItem>
                    <SelectItem value="America/Los_Angeles">America/Los_Angeles (GMT-7)</SelectItem>
                    <SelectItem value="Asia/Dubai">Asia/Dubai (GMT+4)</SelectItem>
                    <SelectItem value="Asia/Singapore">Asia/Singapore (GMT+8)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={() => handleSave("Account")} className="bg-[oklch(0.78_0.18_195)] text-white hover:bg-[oklch(0.68_0.18_195)]">Save Changes</Button>
          </div>
        )}

        {activeTab === "victoria" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">Victoria AI</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Configure how Victoria operates as your Chief of Staff</p>
            </div>
            <Separator />
            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label className="text-xs">Response Style</Label>
                <Select value={victoriaStyle} onValueChange={setVictoriaStyle}>
                  <SelectTrigger className="text-sm h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direct">Direct — concise, data-first, no filler</SelectItem>
                    <SelectItem value="detailed">Detailed — full context and reasoning</SelectItem>
                    <SelectItem value="executive">Executive — bullet-point summaries</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Context for Victoria</Label>
                <Textarea
                  value={victoriaContext}
                  onChange={e => setVictoriaContext(e.target.value)}
                  rows={4}
                  className="text-sm resize-none"
                  placeholder="Tell Victoria about your companies, priorities, and how you work..."
                />
                <p className="text-[11px] text-muted-foreground">Injected into every Victoria conversation so she always knows your situation.</p>
              </div>
              <Separator />
              <div className="space-y-4">
                <p className="text-sm font-medium text-foreground">Behaviour</p>
                {[
                  { label: "Morning auto-brief", desc: "Victoria generates your Signal briefing automatically each morning", value: victoriaAutobrief, set: setVictoriaAutobrief },
                  { label: "Require approval before sending", desc: "Victoria drafts emails and actions — you approve before anything is sent", value: victoriaApproval, set: setVictoriaApproval },
                  { label: "Auto-route to AI SMEs", desc: "Victoria escalates specialist questions to the right AI SME automatically", value: victoriaSME, set: setVictoriaSME },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch checked={item.value} onCheckedChange={item.set} />
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={() => handleSave("Victoria")} className="bg-[oklch(0.78_0.18_195)] text-white hover:bg-[oklch(0.68_0.18_195)]">Save Victoria Config</Button>
          </div>
        )}

        {activeTab === "integrations" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">Integrations</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Connect your tools so Victoria has full context</p>
            </div>
            <Separator />
            <div className="space-y-3">
              {Object.entries(integrations).map(([key, integration]) => (
                <div key={key} className="flex items-center justify-between p-4 rounded-xl border border-border bg-white">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                      {key === "gmail" || key === "outlook" ? <Mail className="w-4 h-4 text-gray-500" /> :
                       key === "googleCalendar" ? <Calendar className="w-4 h-4 text-blue-500" /> :
                       key === "github" ? <Github className="w-4 h-4 text-gray-700" /> :
                       <Link2 className="w-4 h-4 text-gray-500" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{integration.label}</p>
                      <p className="text-xs text-muted-foreground">{integration.detail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {integration.connected
                      ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                      : <AlertCircle className="w-4 h-4 text-muted-foreground" />}
                    <Button
                      size="sm"
                      variant={integration.connected ? "outline" : "default"}
                      className={`h-7 text-xs ${integration.connected ? "text-rose-600 border-rose-200 hover:bg-rose-50" : "bg-[oklch(0.78_0.18_195)] text-white hover:bg-[oklch(0.68_0.18_195)]"}`}
                      onClick={() => toggleIntegration(key)}
                    >
                      {integration.connected ? "Disconnect" : "Connect"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">Notifications</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Control when and how CEPHO alerts you</p>
            </div>
            <Separator />
            <div className="space-y-4">
              {[
                { label: "Email notifications", desc: "Receive a daily summary email from Victoria", value: notifEmail, set: setNotifEmail },
                { label: "Urgent alerts", desc: "Immediate notification for critical project issues", value: notifUrgent, set: setNotifUrgent },
                { label: "Decision reminders", desc: "Remind me to log decisions after key meetings", value: notifDecisions, set: setNotifDecisions },
                { label: "Vault learning updates", desc: "Notify when The Vault captures a significant new insight", value: notifVault, set: setNotifVault },
                { label: "AI SME responses", desc: "Notify when an AI SME completes a consultation", value: notifSME, set: setNotifSME },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch checked={item.value} onCheckedChange={item.set} />
                </div>
              ))}
            </div>
            <Button onClick={() => handleSave("Notifications")} className="bg-[oklch(0.78_0.18_195)] text-white hover:bg-[oklch(0.68_0.18_195)]">Save Preferences</Button>
          </div>
        )}

        {activeTab === "appearance" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">Appearance</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Customise how CEPHO looks</p>
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Theme</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl border-2 border-[oklch(0.78_0.18_195)] bg-white">
                    <div className="w-full h-8 rounded-lg bg-white border border-gray-200 mb-2" />
                    <p className="text-xs font-medium text-foreground">Light</p>
                    <p className="text-[10px] text-muted-foreground">Current theme</p>
                  </div>
                  <button className="p-4 rounded-xl border-2 border-border bg-gray-50 text-left opacity-60" onClick={() => toast.info("Dark theme coming soon")}>
                    <div className="w-full h-8 rounded-lg bg-gray-900 mb-2" />
                    <p className="text-xs font-medium text-foreground">Dark</p>
                    <p className="text-[10px] text-muted-foreground">Coming soon</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">Security</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Manage access and security settings</p>
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-emerald-800">Manus OAuth Active</p>
                  <p className="text-xs text-emerald-700 mt-0.5">Your account is secured via Manus OAuth. No password is stored.</p>
                </div>
              </div>
              <div className="p-4 rounded-xl border border-border bg-white">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-[oklch(0.78_0.18_195)]" />
                  <p className="text-sm font-medium text-foreground">Document Library Encryption</p>
                </div>
                <p className="text-xs text-muted-foreground">All documents are stored encrypted at rest in S3. Confidential documents are access-controlled to this account only.</p>
              </div>
              <div className="p-4 rounded-xl border border-border bg-white flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Session Management</p>
                  <p className="text-xs text-muted-foreground">Currently signed in on this device</p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Active</Badge>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
