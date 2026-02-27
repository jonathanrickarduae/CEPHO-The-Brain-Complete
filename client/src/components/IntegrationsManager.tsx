import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Settings,
  ExternalLink,
  Search,
  Cpu,
  Mail,
  MessageSquare,
  Calendar,
  FileText,
  Database,
  Shield,
  Globe,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Integration {
  id: string;
  name: string;
  category: string;
  icon: React.ReactNode;
  status: "active" | "inactive";
  description: string;
  documentationUrl?: string;
}

const INTEGRATIONS: Integration[] = [
  // AI Services
  {
    id: "openai",
    name: "OpenAI",
    category: "AI Services",
    icon: <Cpu className="w-4 h-4" />,
    status: "active",
    description: "GPT-4, GPT-3.5, DALL-E, Whisper APIs",
    documentationUrl: "https://platform.openai.com/docs",
  },
  {
    id: "claude",
    name: "Anthropic Claude",
    category: "AI Services",
    icon: <Sparkles className="w-4 h-4" />,
    status: "active",
    description: "Claude 3 Opus, Sonnet, Haiku",
    documentationUrl: "https://docs.anthropic.com",
  },
  {
    id: "gemini",
    name: "Google Gemini",
    category: "AI Services",
    icon: <Sparkles className="w-4 h-4" />,
    status: "active",
    description: "Gemini Pro, Gemini Ultra",
    documentationUrl: "https://ai.google.dev/docs",
  },
  {
    id: "perplexity",
    name: "Perplexity AI",
    category: "AI Services",
    icon: <Globe className="w-4 h-4" />,
    status: "inactive",
    description: "Real-time search and reasoning",
    documentationUrl: "https://docs.perplexity.ai",
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    category: "AI Services",
    icon: <MessageSquare className="w-4 h-4" />,
    status: "active",
    description: "Voice synthesis and cloning",
    documentationUrl: "https://elevenlabs.io/docs",
  },

  // Communication
  {
    id: "gmail",
    name: "Gmail API",
    category: "Communication",
    icon: <Mail className="w-4 h-4" />,
    status: "active",
    description: "Email management and automation",
    documentationUrl: "https://developers.google.com/gmail/api",
  },
  {
    id: "sendgrid",
    name: "SendGrid",
    category: "Communication",
    icon: <Mail className="w-4 h-4" />,
    status: "inactive",
    description: "Transactional email service",
    documentationUrl: "https://docs.sendgrid.com",
  },
  {
    id: "twilio",
    name: "Twilio",
    category: "Communication",
    icon: <MessageSquare className="w-4 h-4" />,
    status: "inactive",
    description: "SMS, voice, and messaging",
    documentationUrl: "https://www.twilio.com/docs",
  },
  {
    id: "slack",
    name: "Slack",
    category: "Communication",
    icon: <MessageSquare className="w-4 h-4" />,
    status: "active",
    description: "Team communication and bots",
    documentationUrl: "https://api.slack.com",
  },

  // Productivity
  {
    id: "notion",
    name: "Notion",
    category: "Productivity",
    icon: <FileText className="w-4 h-4" />,
    status: "active",
    description: "Database and content management",
    documentationUrl: "https://developers.notion.com",
  },
  {
    id: "airtable",
    name: "Airtable",
    category: "Productivity",
    icon: <Database className="w-4 h-4" />,
    status: "inactive",
    description: "Spreadsheet-database hybrid",
    documentationUrl: "https://airtable.com/developers",
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    category: "Productivity",
    icon: <Calendar className="w-4 h-4" />,
    status: "active",
    description: "Calendar integration and scheduling",
    documentationUrl: "https://developers.google.com/calendar",
  },
];

export function IntegrationsManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");

  const filteredIntegrations = INTEGRATIONS.filter(integration => {
    const matchesSearch =
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || integration.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const activeCount = INTEGRATIONS.filter(i => i.status === "active").length;
  const inactiveCount = INTEGRATIONS.filter(
    i => i.status === "inactive"
  ).length;

  const handleToggleStatus = (id: string) => {
    toast.info("Integration status toggled (demo mode)");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-foreground">Integrations</h3>
        <p className="text-sm text-muted-foreground">
          Manage your API keys and service connections
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterStatus === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("all")}
          >
            All ({INTEGRATIONS.length})
          </Button>
          <Button
            variant={filterStatus === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("active")}
            className={
              filterStatus === "active"
                ? "bg-emerald-600 hover:bg-emerald-700"
                : ""
            }
          >
            Active ({activeCount})
          </Button>
          <Button
            variant={filterStatus === "inactive" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("inactive")}
          >
            Inactive ({inactiveCount})
          </Button>
        </div>
      </div>

      {/* Integrations List */}
      <div className="space-y-2">
        {filteredIntegrations.map(integration => (
          <div
            key={integration.id}
            className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                {integration.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-foreground">
                    {integration.name}
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    {integration.category}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {integration.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {integration.status === "active" ? (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  <XCircle className="w-3 h-3 mr-1" />
                  Inactive
                </Badge>
              )}

              {integration.documentationUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    window.open(integration.documentationUrl, "_blank")
                  }
                  title="View documentation"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleStatus(integration.id)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Configure
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredIntegrations.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            No integrations match your search
          </p>
        </div>
      )}
    </div>
  );
}
