import DesktopLayout from "@/components/DesktopLayout";
import { Button } from "@/components/ui/button";
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
  ArrowRight
} from "lucide-react";
import { useState } from "react";

export default function Vault() {
  const [activeTab, setActiveTab] = useState<"connections" | "passwords">("connections");

  const connections = [
    { id: 1, name: "Outlook 365", status: "Connected", health: "100%", lastSync: "2 mins ago", icon: Mail, color: "text-blue-400" },
    { id: 2, name: "Microsoft Teams", status: "Connected", health: "100%", lastSync: "5 mins ago", icon: MessageSquare, color: "text-purple-400" },
    { id: 3, name: "Gamma App", status: "Optimization Needed", health: "85%", lastSync: "1 hour ago", icon: Zap, color: "text-amber-400", alert: "Consider switching to Pitch.com for better API integration." },
    { id: 4, name: "Manus Sound", status: "Connected", health: "100%", lastSync: "Just now", icon: Globe, color: "text-green-400" },
    { id: 5, name: "Salesforce", status: "Disconnected", health: "0%", lastSync: "Failed", icon: Globe, color: "text-red-400", alert: "API Token Expired. Re-authenticate now." },
  ];

  const passwords = [
    { id: 1, name: "AWS Root", strength: "Strong", lastUpdated: "2 weeks ago" },
    { id: 2, name: "Stripe Dashboard", strength: "Strong", lastUpdated: "1 month ago" },
    { id: 3, name: "Corporate Gmail", strength: "Medium", lastUpdated: "3 months ago" },
  ];

  return (
    <DesktopLayout>
      <div className="max-w-6xl mx-auto h-full flex flex-col">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="font-display font-bold text-3xl mb-2">The Vault</h1>
            <p className="text-muted-foreground">Secure Credentials & App Command Center</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={activeTab === "connections" ? "default" : "outline"}
              onClick={() => setActiveTab("connections")}
              className={activeTab === "connections" ? "bg-primary text-primary-foreground" : "border-white/10"}
            >
              <Globe className="w-4 h-4 mr-2" /> Connections
            </Button>
            <Button 
              variant={activeTab === "passwords" ? "default" : "outline"}
              onClick={() => setActiveTab("passwords")}
              className={activeTab === "passwords" ? "bg-primary text-primary-foreground" : "border-white/10"}
            >
              <Key className="w-4 h-4 mr-2" /> Credentials
            </Button>
          </div>
        </div>

        {activeTab === "connections" && (
          <div className="space-y-6">
            {/* Health Overview */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-6 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">System Healthy</h3>
                  <p className="text-xs text-muted-foreground">4/5 Integrations Active</p>
                </div>
              </div>
              <div className="p-6 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">1 Optimization</h3>
                  <p className="text-xs text-muted-foreground">App Stack Improvement</p>
                </div>
              </div>
              <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">1 Critical Alert</h3>
                  <p className="text-xs text-muted-foreground">Salesforce Disconnected</p>
                </div>
              </div>
            </div>

            {/* Connections List */}
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              <div className="p-4 border-b border-white/10 flex justify-between items-center">
                <h3 className="font-bold">Active Integrations</h3>
                <Button size="sm" variant="outline" className="border-white/10 hover:bg-white/5">
                  <Plus className="w-4 h-4 mr-2" /> Add Integration
                </Button>
              </div>
              <div className="divide-y divide-white/5">
                {connections.map((conn) => (
                  <div key={conn.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center ${conn.color}`}>
                        <conn.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm">{conn.name}</h4>
                          {conn.status === "Connected" && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                          {conn.status === "Disconnected" && <AlertTriangle className="w-3 h-3 text-red-500" />}
                          {conn.status === "Optimization Needed" && <Zap className="w-3 h-3 text-amber-500" />}
                        </div>
                        <p className="text-xs text-muted-foreground">Last synced: {conn.lastSync}</p>
                        {conn.alert && (
                          <p className={`text-xs mt-1 ${conn.status === "Disconnected" ? "text-red-400" : "text-amber-400"}`}>
                            {conn.alert}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Health</div>
                        <div className={`font-mono font-bold ${
                          conn.health === "100%" ? "text-green-500" : 
                          conn.health === "0%" ? "text-red-500" : "text-amber-500"
                        }`}>{conn.health}</div>
                      </div>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "passwords" && (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Lock className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-bold mb-2">Secure Vault Locked</h3>
              <p className="max-w-md mx-auto mb-6">
                Access to passwords and API keys requires biometric authentication. 
                All credentials are encrypted with AES-256.
              </p>
              <Button className="bg-primary hover:bg-primary/90">
                <Shield className="w-4 h-4 mr-2" /> Authenticate to View
              </Button>
            </div>
          </div>
        )}
      </div>
    </DesktopLayout>
  );
}
