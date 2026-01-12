import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Plus, 
  Shield, 
  Key, 
  Globe, 
  Mail, 
  MessageSquare, 
  Zap,
  ShieldCheck,
  ShieldAlert,
  Eye,
  EyeOff,
  Fingerprint,
  TrendingUp,
  Sparkles,
  ExternalLink,
  Clock,
  XCircle,
  Activity
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { VaultSecurityGate, useVaultSecurity, SecurityBadges } from "@/components/VaultSecurityGate";
import { useGovernance, GovernanceModeIndicator } from "@/hooks/useGovernance";

export default function Vault() {
  const [activeTab, setActiveTab] = useState("integrations");
  const [showPasswords, setShowPasswords] = useState(false);
  const { mode } = useGovernance();
  
  // Vault security - requires 2FA on every access
  const {
    isVaultUnlocked,
    showSecurityGate,
    requestVaultAccess,
    handleVerified,
    handleCancel,
    lockVault,
  } = useVaultSecurity();

  // Show security gate on initial load if not unlocked
  useEffect(() => {
    if (!isVaultUnlocked) {
      requestVaultAccess();
    }
  }, []);

  // Integration health data with governance status
  const integrations = [
    { id: 1, name: "Outlook 365", status: "healthy", health: 100, lastSync: "2 mins ago", icon: Mail, color: "text-blue-400", category: "Communication", governedApproved: true, omniApproved: true, complianceLevel: "high" as const },
    { id: 2, name: "Microsoft Teams", status: "healthy", health: 100, lastSync: "5 mins ago", icon: MessageSquare, color: "text-purple-400", category: "Communication", governedApproved: true, omniApproved: true, complianceLevel: "high" as const },
    { id: 3, name: "Gamma App", status: "warning", health: 85, lastSync: "1 hour ago", icon: Zap, color: "text-amber-400", category: "Productivity", alert: "Consider switching to Pitch.com for better API integration.", governedApproved: false, omniApproved: true, complianceLevel: "low" as const },
    { id: 4, name: "Manus AI", status: "healthy", health: 100, lastSync: "Just now", icon: Globe, color: "text-green-400", category: "AI Tools", governedApproved: false, omniApproved: true, complianceLevel: "medium" as const },
    { id: 5, name: "Microsoft Copilot", status: "healthy", health: 100, lastSync: "Just now", icon: Globe, color: "text-cyan-400", category: "AI Tools", governedApproved: true, omniApproved: true, complianceLevel: "high" as const },
    { id: 6, name: "Salesforce", status: "broken", health: 0, lastSync: "Failed", icon: Globe, color: "text-red-400", category: "CRM", alert: "API Token Expired. Re-authenticate now.", governedApproved: true, omniApproved: true, complianceLevel: "high" as const },
    { id: 7, name: "Slack", status: "healthy", health: 98, lastSync: "10 mins ago", icon: MessageSquare, color: "text-pink-400", category: "Communication", governedApproved: true, omniApproved: true, complianceLevel: "high" as const },
    { id: 8, name: "OpenAI API", status: "healthy", health: 100, lastSync: "Just now", icon: Globe, color: "text-emerald-400", category: "AI Tools", governedApproved: false, omniApproved: true, complianceLevel: "low" as const },
    { id: 9, name: "ChatGPT", status: "healthy", health: 100, lastSync: "5 mins ago", icon: Globe, color: "text-teal-400", category: "AI Tools", governedApproved: false, omniApproved: true, complianceLevel: "low" as const },
  ];

  // Security threats and monitoring
  const securityEvents = [
    { id: 1, type: "blocked", message: "Suspicious login attempt blocked", location: "Unknown IP (Russia)", time: "2 hours ago", severity: "high" },
    { id: 2, type: "blocked", message: "Brute force attack prevented", location: "Bot Network", time: "5 hours ago", severity: "high" },
    { id: 3, type: "warning", message: "Unusual API access pattern detected", location: "Internal", time: "Yesterday", severity: "medium" },
    { id: 4, type: "info", message: "Security patch applied automatically", location: "System", time: "Yesterday", severity: "low" },
    { id: 5, type: "blocked", message: "Phishing email quarantined", location: "Email Gateway", time: "2 days ago", severity: "medium" },
  ];

  // AI App recommendations
  const appRecommendations = [
    { id: 1, current: "Gamma App", suggested: "Pitch.com", reason: "Better API integration, 40% faster sync", savings: "$50/mo", confidence: 92 },
    { id: 2, current: "Zoom", suggested: "Google Meet", reason: "Already have Google Workspace, consolidate tools", savings: "$15/mo", confidence: 78 },
    { id: 3, current: "Trello", suggested: "Linear", reason: "Better for engineering workflows, native GitHub integration", savings: "$0", confidence: 85 },
  ];

  // Credentials
  const credentials = [
    { id: 1, name: "AWS Root", type: "Cloud", strength: "strong", lastUpdated: "2 weeks ago", autoRotate: true },
    { id: 2, name: "Stripe Dashboard", type: "Payment", strength: "strong", lastUpdated: "1 month ago", autoRotate: true },
    { id: 3, name: "Corporate Gmail", type: "Email", strength: "medium", lastUpdated: "3 months ago", autoRotate: false, alert: "Consider updating - over 90 days old" },
    { id: 4, name: "GitHub Enterprise", type: "Dev", strength: "strong", lastUpdated: "1 week ago", autoRotate: true },
  ];

  const healthyCount = integrations.filter(i => i.status === "healthy").length;
  const warningCount = integrations.filter(i => i.status === "warning").length;
  const brokenCount = integrations.filter(i => i.status === "broken").length;
  const blockedThreats = securityEvents.filter(e => e.type === "blocked").length;

  return (
    <>
      {/* Security Gate Modal */}
      <VaultSecurityGate
        isOpen={showSecurityGate || !isVaultUnlocked}
        onVerified={handleVerified}
        onCancel={handleCancel}
        userEmail="user@example.com"
      />
      
      <div className="min-h-full bg-background text-foreground overflow-auto">
      {/* Header */}
      <div className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-500/20 to-zinc-500/20 border border-slate-500/30">
                <Shield className="w-6 h-6 md:w-8 md:h-8 text-slate-400" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-display font-bold">The Vault</h1>
                <p className="text-muted-foreground text-sm">Security The Nexus</p>
              </div>
            </div>
            
            {/* Security Status */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-green-500">All Systems Secure</span>
              </div>
              <Badge variant="outline" className="border-red-500/50 text-red-400 bg-red-500/10">
                {blockedThreats} threats blocked today
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-green-500/10 border-green-500/30">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-green-500">{healthyCount}</div>
                <div className="text-xs text-muted-foreground">Healthy</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-amber-500/10 border-amber-500/30">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
              <div>
                <div className="text-2xl font-bold text-amber-500">{warningCount}</div>
                <div className="text-xs text-muted-foreground">Needs Attention</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-red-500/10 border-red-500/30">
            <CardContent className="p-4 flex items-center gap-3">
              <XCircle className="w-8 h-8 text-red-500" />
              <div>
                <div className="text-2xl font-bold text-red-500">{brokenCount}</div>
                <div className="text-xs text-muted-foreground">Broken</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-purple-500/10 border-purple-500/30">
            <CardContent className="p-4 flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold text-purple-500">{blockedThreats}</div>
                <div className="text-xs text-muted-foreground">Threats Blocked</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-4 bg-card/60 mb-6">
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Globe className="w-4 h-4" /> Integrations
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Security
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> AI Suggestions
            </TabsTrigger>
            <TabsTrigger value="credentials" className="flex items-center gap-2">
              <Key className="w-4 h-4" /> Credentials
            </TabsTrigger>
          </TabsList>

          {/* Integrations Tab */}
          <TabsContent value="integrations">
            <Card className="bg-card/60 border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  Integration Health Dashboard
                </CardTitle>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" /> Add Integration
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {integrations.map((integration) => (
                    <div 
                      key={integration.id}
                      className={`p-4 rounded-xl border transition-all ${
                        integration.status === "healthy" ? "bg-secondary/30 border-border hover:border-green-500/30" :
                        integration.status === "warning" ? "bg-amber-500/5 border-amber-500/30" :
                        "bg-red-500/5 border-red-500/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center ${integration.color}`}>
                            <integration.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold">{integration.name}</h4>
                              <Badge variant="outline" className="text-xs">{integration.category}</Badge>
                              {integration.status === "healthy" && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                              {integration.status === "warning" && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                              {integration.status === "broken" && <XCircle className="w-4 h-4 text-red-500" />}
                            </div>
                            <p className="text-xs text-muted-foreground">Last sync: {integration.lastSync}</p>
                            {integration.alert && (
                              <p className={`text-xs mt-1 ${integration.status === "broken" ? "text-red-400" : "text-amber-400"}`}>
                                ⚠️ {integration.alert}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground mb-1">Health</div>
                            <div className="flex items-center gap-2">
                              <Progress value={integration.health} className="w-20 h-2" />
                              <span className={`text-sm font-bold ${
                                integration.health === 100 ? "text-green-500" :
                                integration.health > 50 ? "text-amber-500" : "text-red-500"
                              }`}>{integration.health}%</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon">
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card className="bg-card/60 border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-green-500" />
                  Security Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {securityEvents.map((event) => (
                      <div 
                        key={event.id}
                        className={`p-4 rounded-xl border ${
                          event.severity === "high" ? "bg-red-500/5 border-red-500/30" :
                          event.severity === "medium" ? "bg-amber-500/5 border-amber-500/30" :
                          "bg-secondary/30 border-border"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 p-1.5 rounded-lg ${
                              event.type === "blocked" ? "bg-red-500/20 text-red-500" :
                              event.type === "warning" ? "bg-amber-500/20 text-amber-500" :
                              "bg-green-500/20 text-green-500"
                            }`}>
                              {event.type === "blocked" ? <ShieldAlert className="w-4 h-4" /> :
                               event.type === "warning" ? <AlertTriangle className="w-4 h-4" /> :
                               <CheckCircle2 className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="font-medium">{event.message}</p>
                              <p className="text-xs text-muted-foreground">{event.location}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={event.severity === "high" ? "destructive" : "secondary"} className="text-xs">
                              {event.severity}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">{event.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Recommendations Tab */}
          <TabsContent value="recommendations">
            <Card className="bg-card/60 border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  AI App Recommendations
                  <Badge className="ml-2 bg-purple-500/20 text-purple-400 border-0">From Chief of Staff</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appRecommendations.map((rec) => (
                    <div key={rec.id} className="p-4 rounded-xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 border border-purple-500/20">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="px-3 py-1 rounded-lg bg-secondary/50 text-sm">{rec.current}</div>
                          <TrendingUp className="w-4 h-4 text-purple-400" />
                          <div className="px-3 py-1 rounded-lg bg-purple-500/20 text-purple-400 text-sm font-medium">{rec.suggested}</div>
                        </div>
                        <Badge className="bg-green-500/20 text-green-400 border-0">
                          {rec.confidence}% confidence
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{rec.reason}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-400">Potential savings: {rec.savings}</span>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Dismiss</Button>
                          <Button size="sm" className="bg-purple-500 hover:bg-purple-600">
                            <ExternalLink className="w-3 h-3 mr-2" /> Explore
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Credentials Tab */}
          <TabsContent value="credentials">
            <Card className="bg-card/60 border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-amber-400" />
                  Secure Credentials
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setShowPasswords(!showPasswords);
                    if (!showPasswords) {
                      toast.info("Biometric authentication simulated");
                    }
                  }}
                >
                  {showPasswords ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  {showPasswords ? "Hide" : "Reveal"}
                </Button>
              </CardHeader>
              <CardContent>
                {!showPasswords ? (
                  <div className="text-center py-12">
                    <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-bold mb-2">Vault Locked</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Authenticate to view credentials. All data encrypted with AES-256.
                    </p>
                    <Button onClick={() => setShowPasswords(true)}>
                      <Fingerprint className="w-4 h-4 mr-2" /> Authenticate
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {credentials.map((cred) => (
                      <div key={cred.id} className="p-4 rounded-xl bg-secondary/30 border border-border">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                              <Key className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold">{cred.name}</h4>
                                <Badge variant="outline" className="text-xs">{cred.type}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">Updated: {cred.lastUpdated}</p>
                              {cred.alert && (
                                <p className="text-xs text-amber-400 mt-1">⚠️ {cred.alert}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={
                              cred.strength === "strong" ? "bg-green-500/20 text-green-400 border-0" :
                              "bg-amber-500/20 text-amber-400 border-0"
                            }>
                              {cred.strength}
                            </Badge>
                            {cred.autoRotate && (
                              <Badge variant="outline" className="text-xs">
                                <RefreshCw className="w-3 h-3 mr-1" /> Auto-rotate
                              </Badge>
                            )}
                            <Button variant="ghost" size="sm">Edit</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </>
  );
}
