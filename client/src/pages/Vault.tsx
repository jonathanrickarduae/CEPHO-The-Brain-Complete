import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Plus, 
  Shield, 
  Globe, 
  Mail, 
  MessageSquare, 
  Zap,
  ShieldCheck,
  ShieldAlert,
  XCircle,
  Activity,
  FileText,
  Calendar,
  Clock,
  Bell
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";

export default function Vault() {
  // Integration health data
  const integrations = [
    { id: 1, name: "Outlook 365", status: "healthy", health: 100, lastSync: "2 mins ago", icon: Mail, color: "text-blue-400", category: "Communication" },
    { id: 2, name: "Microsoft Teams", status: "healthy", health: 100, lastSync: "5 mins ago", icon: MessageSquare, color: "text-purple-400", category: "Communication" },
    { id: 3, name: "Gamma App", status: "warning", health: 85, lastSync: "1 hour ago", icon: Zap, color: "text-amber-400", category: "Productivity", alert: "Consider switching to Pitch.com" },
    { id: 4, name: "Manus AI", status: "healthy", health: 100, lastSync: "Just now", icon: Globe, color: "text-green-400", category: "AI Tools" },
    { id: 5, name: "Microsoft Copilot", status: "healthy", health: 100, lastSync: "Just now", icon: Globe, color: "text-cyan-400", category: "AI Tools" },
    { id: 6, name: "Salesforce", status: "broken", health: 0, lastSync: "Failed", icon: Globe, color: "text-red-400", category: "CRM", alert: "API Token Expired" },
  ];

  // Contract renewals
  const contractRenewals = [
    { id: 1, name: "AWS Enterprise Agreement", vendor: "Amazon Web Services", renewalDate: "2026-02-15", value: "$45,000/yr", status: "upcoming", daysUntil: 29, autoRenew: true, category: "Infrastructure" },
    { id: 2, name: "Salesforce CRM License", vendor: "Salesforce", renewalDate: "2026-01-25", value: "$12,000/yr", status: "urgent", daysUntil: 8, autoRenew: false, category: "CRM" },
    { id: 3, name: "Microsoft 365 Business", vendor: "Microsoft", renewalDate: "2026-03-01", value: "$8,400/yr", status: "upcoming", daysUntil: 43, autoRenew: true, category: "Productivity" },
    { id: 4, name: "Slack Business+", vendor: "Slack", renewalDate: "2026-04-15", value: "$6,000/yr", status: "ok", daysUntil: 88, autoRenew: true, category: "Communication" },
    { id: 5, name: "Legal Retainer Agreement", vendor: "Henderson & Partners", renewalDate: "2026-01-31", value: "$25,000/yr", status: "urgent", daysUntil: 14, autoRenew: false, category: "Legal" },
  ];

  const urgentContracts = contractRenewals.filter(c => c.status === "urgent").length;
  const upcomingContracts = contractRenewals.filter(c => c.status === "upcoming").length;

  // Security threats
  const securityEvents = [
    { id: 1, type: "blocked", message: "Suspicious login blocked", location: "Unknown IP", time: "2 hours ago", severity: "high" },
    { id: 2, type: "blocked", message: "Brute force prevented", location: "Bot Network", time: "5 hours ago", severity: "high" },
    { id: 3, type: "warning", message: "Unusual API pattern", location: "Internal", time: "Yesterday", severity: "medium" },
  ];

  const healthyCount = integrations.filter(i => i.status === "healthy").length;
  const warningCount = integrations.filter(i => i.status === "warning").length;
  const brokenCount = integrations.filter(i => i.status === "broken").length;
  const blockedThreats = securityEvents.filter(e => e.type === "blocked").length;

  return (
      <div className="h-[calc(100vh-56px)] md:h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
        {/* Header */}
        <PageHeader 
          icon={Shield} 
          title="The Vault"
          subtitle="Security & Integrations"
          iconColor="text-slate-400"
        >
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span className="text-xs font-medium text-green-500">Secure</span>
            </div>
            <Badge variant="outline" className="border-red-500/50 text-red-400 bg-red-500/10 text-xs">
              {blockedThreats} blocked
            </Badge>
          </div>
        </PageHeader>

        {/* Main Content - Fixed height, no scroll */}
        <div className="flex-1 p-3 pt-2 md:p-6 flex flex-col gap-3 md:gap-4 overflow-hidden">
          {/* Quick Stats Row */}
          <div className="grid grid-cols-4 gap-2 md:gap-3 shrink-0">
            <Card className="bg-green-500/10 border-green-500/30">
              <CardContent className="p-3 md:p-4 flex items-center gap-2 md:gap-3">
                <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-green-500 shrink-0" />
                <div>
                  <div className="text-xl md:text-2xl font-bold text-green-500">{healthyCount}</div>
                  <div className="text-[10px] md:text-xs text-muted-foreground">Healthy</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardContent className="p-3 md:p-4 flex items-center gap-2 md:gap-3">
                <AlertTriangle className="w-6 h-6 md:w-8 md:h-8 text-amber-500 shrink-0" />
                <div>
                  <div className="text-xl md:text-2xl font-bold text-amber-500">{warningCount}</div>
                  <div className="text-[10px] md:text-xs text-muted-foreground">Warning</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-red-500/10 border-red-500/30">
              <CardContent className="p-3 md:p-4 flex items-center gap-2 md:gap-3">
                <XCircle className="w-6 h-6 md:w-8 md:h-8 text-red-500 shrink-0" />
                <div>
                  <div className="text-xl md:text-2xl font-bold text-red-500">{brokenCount}</div>
                  <div className="text-[10px] md:text-xs text-muted-foreground">Broken</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-purple-500/10 border-purple-500/30">
              <CardContent className="p-3 md:p-4 flex items-center gap-2 md:gap-3">
                <ShieldAlert className="w-6 h-6 md:w-8 md:h-8 text-purple-500 shrink-0" />
                <div>
                  <div className="text-xl md:text-2xl font-bold text-purple-500">{blockedThreats}</div>
                  <div className="text-[10px] md:text-xs text-muted-foreground">Blocked</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Two Column Layout */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
            {/* Integrations Panel */}
            <Card className="bg-white/5 border-white/10 flex flex-col min-h-0">
              <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-semibold">Integrations</h3>
                </div>
                <Button size="sm" variant="outline" className="gap-1 h-8">
                  <Plus className="w-3 h-3" /> Add
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {integrations.map((integration) => (
                  <div 
                    key={integration.id}
                    className={`p-3 rounded-xl border transition-all ${
                      integration.status === "healthy" ? "bg-white/5 border-white/10 hover:border-green-500/30" :
                      integration.status === "warning" ? "bg-amber-500/5 border-amber-500/30" :
                      "bg-red-500/5 border-red-500/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center ${integration.color}`}>
                          <integration.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{integration.name}</span>
                            {integration.status === "healthy" && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                            {integration.status === "warning" && <AlertTriangle className="w-3 h-3 text-amber-500" />}
                            {integration.status === "broken" && <XCircle className="w-3 h-3 text-red-500" />}
                          </div>
                          <span className="text-xs text-muted-foreground">{integration.lastSync}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 hidden sm:block">
                          <Progress value={integration.health} className="h-1.5" />
                        </div>
                        <span className={`text-xs font-medium ${
                          integration.health === 100 ? "text-green-500" :
                          integration.health > 50 ? "text-amber-500" : "text-red-500"
                        }`}>{integration.health}%</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <RefreshCw className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    {integration.alert && (
                      <p className={`text-xs mt-2 ${integration.status === "broken" ? "text-red-400" : "text-amber-400"}`}>
                        ⚠️ {integration.alert}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Contract Renewals Panel */}
            <Card className="bg-white/5 border-white/10 flex flex-col min-h-0">
              <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-fuchsia-500" />
                  <h3 className="font-semibold">Contract Renewals</h3>
                </div>
                <div className="flex items-center gap-2">
                  {urgentContracts > 0 && (
                    <Badge variant="destructive" className="text-[10px]">
                      {urgentContracts} urgent
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">{upcomingContracts} upcoming</Badge>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {contractRenewals
                  .sort((a, b) => a.daysUntil - b.daysUntil)
                  .map((contract) => (
                  <div 
                    key={contract.id}
                    className={`p-3 rounded-xl border ${
                      contract.status === "urgent" ? "bg-red-500/5 border-red-500/30" :
                      contract.status === "upcoming" ? "bg-amber-500/5 border-amber-500/30" :
                      "bg-white/5 border-white/10"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-1.5 rounded-lg ${
                          contract.status === "urgent" ? "bg-red-500/20 text-red-500" :
                          contract.status === "upcoming" ? "bg-amber-500/20 text-amber-500" :
                          "bg-green-500/20 text-green-500"
                        }`}>
                          {contract.status === "urgent" ? <Bell className="w-4 h-4" /> :
                           contract.status === "upcoming" ? <Clock className="w-4 h-4" /> :
                           <CheckCircle2 className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{contract.name}</p>
                          <p className="text-xs text-muted-foreground">{contract.vendor}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-fuchsia-400">{contract.value}</p>
                        <div className="flex items-center gap-1 justify-end mt-1">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <p className="text-[10px] text-muted-foreground">
                            {contract.daysUntil} days
                          </p>
                        </div>
                        {contract.autoRenew && (
                          <Badge variant="outline" className="text-[8px] mt-1 border-green-500/50 text-green-400">
                            Auto-renew
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Security Events Panel */}
            <Card className="bg-white/5 border-white/10 flex flex-col min-h-0">
              <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-green-500" />
                  <h3 className="font-semibold">Security Events</h3>
                </div>
                <Badge variant="outline" className="text-xs">Today</Badge>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {securityEvents.map((event) => (
                  <div 
                    key={event.id}
                    className={`p-3 rounded-xl border ${
                      event.severity === "high" ? "bg-red-500/5 border-red-500/30" :
                      event.severity === "medium" ? "bg-amber-500/5 border-amber-500/30" :
                      "bg-white/5 border-white/10"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-1.5 rounded-lg ${
                          event.type === "blocked" ? "bg-red-500/20 text-red-500" :
                          event.type === "warning" ? "bg-amber-500/20 text-amber-500" :
                          "bg-green-500/20 text-green-500"
                        }`}>
                          {event.type === "blocked" ? <ShieldAlert className="w-4 h-4" /> :
                           event.type === "warning" ? <AlertTriangle className="w-4 h-4" /> :
                           <CheckCircle2 className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{event.message}</p>
                          <p className="text-xs text-muted-foreground">{event.location}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge variant={event.severity === "high" ? "destructive" : "secondary"} className="text-[10px]">
                          {event.severity}
                        </Badge>
                        <p className="text-[10px] text-muted-foreground mt-1">{event.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Empty state for more events */}
                <div className="text-center py-6 text-muted-foreground">
                  <ShieldCheck className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">All systems secure</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
  );
}
