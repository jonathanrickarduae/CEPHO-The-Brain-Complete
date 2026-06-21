import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Search, Star, ChevronRight, Users } from "lucide-react";
import { Streamdown } from "streamdown";
import { toast } from "sonner";

const DOMAINS = ["All", "Strategy", "Finance", "Legal", "Technology", "Marketing", "Operations", "Investment", "HR", "Healthcare"];

const SMES = [
  { id: "strategy-ceo", name: "CEO Strategist", title: "Scaling multi-entity businesses, capital allocation, board management", domain: "Strategy", expertise: ["Multi-entity", "Capital Allocation", "Board Management"], icon: "🎯" },
  { id: "strategy-vc", name: "Venture Capitalist", title: "Fundraising, term sheets, investor relations, Series A–C", domain: "Investment", expertise: ["Term Sheets", "Series A-C", "Investor Relations"], icon: "💰" },
  { id: "strategy-pe", name: "Private Equity Expert", title: "Buyouts, value creation, exit strategies, LBO modelling", domain: "Investment", expertise: ["Buyouts", "Exit Strategy", "LBO Modelling"], icon: "📊" },
  { id: "strategy-mna", name: "M&A Advisor", title: "Mergers, acquisitions, due diligence, deal structuring", domain: "Strategy", expertise: ["M&A", "Due Diligence", "Deal Structuring"], icon: "🤝" },
  { id: "strategy-turnaround", name: "Turnaround Specialist", title: "Business rescue, cash management, operational restructuring", domain: "Strategy", expertise: ["Business Rescue", "Cash Management", "Restructuring"], icon: "🔄" },
  { id: "finance-cfo", name: "CFO Advisor", title: "Financial modelling, cash flow, P&L management, board reporting", domain: "Finance", expertise: ["Financial Modelling", "Cash Flow", "P&L"], icon: "📈" },
  { id: "finance-tax", name: "Tax Strategist", title: "Corporate tax, R&D credits, international structures, HMRC", domain: "Finance", expertise: ["Corporate Tax", "R&D Credits", "HMRC"], icon: "🏛️" },
  { id: "finance-accountant", name: "Chartered Accountant", title: "Statutory accounts, audit, management accounts, IFRS", domain: "Finance", expertise: ["Statutory Accounts", "Audit", "IFRS"], icon: "📋" },
  { id: "finance-fundraise", name: "Fundraising Expert", title: "Debt financing, equity rounds, grant funding, EIS/SEIS", domain: "Finance", expertise: ["Equity Rounds", "EIS/SEIS", "Grant Funding"], icon: "🚀" },
  { id: "legal-commercial", name: "Commercial Lawyer", title: "Contracts, commercial agreements, supplier terms, disputes", domain: "Legal", expertise: ["Contracts", "Commercial Agreements", "Disputes"], icon: "⚖️" },
  { id: "legal-corporate", name: "Corporate Lawyer", title: "Company structure, shareholder agreements, board governance", domain: "Legal", expertise: ["Shareholder Agreements", "Board Governance", "Company Structure"], icon: "🏢" },
  { id: "legal-ip", name: "IP & Patent Lawyer", title: "Patents, trademarks, copyright, IP strategy and protection", domain: "Legal", expertise: ["Patents", "Trademarks", "IP Strategy"], icon: "🔒" },
  { id: "legal-employment", name: "Employment Lawyer", title: "Employment contracts, HR disputes, TUPE, redundancy", domain: "Legal", expertise: ["Employment Contracts", "TUPE", "Redundancy"], icon: "👥" },
  { id: "legal-data", name: "Data & Privacy Lawyer", title: "GDPR, data protection, privacy policies, ICO compliance", domain: "Legal", expertise: ["GDPR", "Data Protection", "ICO"], icon: "🛡️" },
  { id: "tech-cto", name: "CTO Advisor", title: "Tech strategy, architecture decisions, team building, scaling", domain: "Technology", expertise: ["Tech Strategy", "Architecture", "Scaling"], icon: "💻" },
  { id: "tech-ai", name: "AI/ML Expert", title: "AI strategy, LLM integration, ML pipelines, AI product development", domain: "Technology", expertise: ["AI Strategy", "LLM Integration", "ML Pipelines"], icon: "🤖" },
  { id: "tech-security", name: "Cybersecurity Expert", title: "Security architecture, penetration testing, ISO 27001, SOC 2", domain: "Technology", expertise: ["Security Architecture", "ISO 27001", "SOC 2"], icon: "🔐" },
  { id: "tech-product", name: "Product Director", title: "Product strategy, roadmap, user research, product-market fit", domain: "Technology", expertise: ["Product Strategy", "Roadmap", "PMF"], icon: "🎨" },
  { id: "mkt-growth", name: "Growth Expert", title: "Acquisition funnels, CAC/LTV, viral loops, growth experiments", domain: "Marketing", expertise: ["CAC/LTV", "Growth Loops", "Acquisition"], icon: "📣" },
  { id: "mkt-brand", name: "Brand Strategist", title: "Brand positioning, identity, narrative, competitive differentiation", domain: "Marketing", expertise: ["Brand Positioning", "Identity", "Differentiation"], icon: "✨" },
  { id: "mkt-digital", name: "Digital Marketing Expert", title: "SEO, paid media, content strategy, conversion optimisation", domain: "Marketing", expertise: ["SEO", "Paid Media", "CRO"], icon: "🌐" },
  { id: "mkt-b2b", name: "B2B Sales Expert", title: "Enterprise sales, pipeline management, sales process, CRM", domain: "Marketing", expertise: ["Enterprise Sales", "Pipeline", "CRM"], icon: "🤝" },
  { id: "ops-coo", name: "COO Advisor", title: "Operational excellence, process design, team structure, KPIs", domain: "Operations", expertise: ["Process Design", "KPIs", "Team Structure"], icon: "⚙️" },
  { id: "ops-supply", name: "Supply Chain Expert", title: "Procurement, logistics, supplier management, inventory", domain: "Operations", expertise: ["Procurement", "Logistics", "Inventory"], icon: "🔗" },
  { id: "ops-hr", name: "HR Director", title: "People strategy, culture, performance management, compensation", domain: "HR", expertise: ["People Strategy", "Culture", "Performance"], icon: "👤" },
  { id: "health-clinical", name: "Clinical Advisor", title: "Clinical governance, NHS pathways, healthcare regulation, CQC", domain: "Healthcare", expertise: ["Clinical Governance", "NHS", "CQC"], icon: "🏥" },
  { id: "health-digital", name: "Digital Health Expert", title: "HealthTech, DTAC, NHS procurement, clinical validation", domain: "Healthcare", expertise: ["HealthTech", "DTAC", "NHS Procurement"], icon: "💊" },
  { id: "re-commercial", name: "Commercial Property Expert", title: "Commercial leases, property investment, development finance", domain: "Operations", expertise: ["Commercial Leases", "Property Investment", "Development Finance"], icon: "🏗️" },
];

interface Message { role: "user" | "assistant"; content: string; }

export default function SMEPage() {
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("All");
  const [activeSme, setActiveSme] = useState<typeof SMES[0] | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const consult = trpc.sme.consult.useMutation({
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
      setIsThinking(false);
    },
    onError: () => {
      setIsThinking(false);
      toast.error("Consultation failed. Please try again.");
    },
  });

  const filtered = SMES.filter(s => {
    const matchDomain = domain === "All" || s.domain === domain;
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.title.toLowerCase().includes(search.toLowerCase());
    return matchDomain && matchSearch;
  });

  const openSme = (sme: typeof SMES[0]) => {
    setActiveSme(sme);
    setMessages([]);
    setInput("");
  };

  const sendMessage = () => {
    if (!input.trim() || !activeSme || isThinking) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsThinking(true);
    consult.mutate({
      smeName: activeSme.name,
      smeDomain: activeSme.domain,
      smeTitle: activeSme.title,
      message: userMsg,
      conversationHistory: messages.map(m => ({ role: m.role, content: m.content })),
    });
  };

  // Consultation view
  if (activeSme) {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)]">
        <div className="flex items-center gap-4 px-6 py-4 border-b border-border bg-background shrink-0">
          <button onClick={() => { setActiveSme(null); setMessages([]); }} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to experts
          </button>
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xl">{activeSme.icon}</span>
            <div>
              <p className="text-sm font-semibold text-foreground">{activeSme.name}</p>
              <p className="text-xs text-muted-foreground">{activeSme.title}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">{activeSme.domain}</Badge>
        </div>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-4 py-6 max-w-3xl mx-auto">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <span className="text-4xl">{activeSme.icon}</span>
                <p className="text-sm font-medium text-foreground mt-3">{activeSme.name}</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">{activeSme.title}</p>
                <div className="flex flex-wrap gap-1.5 justify-center mt-4">
                  {activeSme.expertise.map(e => <Badge key={e} variant="outline" className="text-xs">{e}</Badge>)}
                </div>
                <p className="text-xs text-muted-foreground mt-6">Ask your question to begin the consultation.</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                  msg.role === "user"
                    ? "bg-[oklch(0.78_0.18_195)] text-white"
                    : "bg-muted text-foreground border border-border"
                }`}>
                  {msg.role === "assistant" ? <Streamdown>{msg.content}</Streamdown> : <p>{msg.content}</p>}
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground border border-border">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {activeSme.name} is analysing...
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="px-6 py-4 border-t border-border bg-background shrink-0">
          <div className="flex gap-2 max-w-3xl mx-auto">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder={`Ask ${activeSme.name}...`}
              className="text-sm"
              disabled={isThinking}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isThinking}
              className="bg-[oklch(0.78_0.18_195)] text-white hover:bg-[oklch(0.68_0.18_195)] shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Directory view
  return (
    <div className="p-6 space-y-5 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">AI SME Network</h1>
          <p className="text-sm text-muted-foreground mt-0.5">250 world-class experts — instant consultation</p>
        </div>
        <Badge variant="outline" className="text-xs gap-1">
          <Users className="w-3 h-3" /> {SMES.length} experts shown
        </Badge>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9 text-sm" placeholder="Search experts or specialties..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {DOMAINS.map(d => (
            <Button key={d} size="sm" variant={domain === d ? "default" : "outline"} className={`text-xs h-8 ${domain === d ? "bg-[oklch(0.78_0.18_195)] text-white border-[oklch(0.78_0.18_195)]" : ""}`} onClick={() => setDomain(d)}>
              {d}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(sme => (
          <button key={sme.id} onClick={() => openSme(sme)} className="text-left rounded-xl border border-border bg-white p-4 hover:border-[oklch(0.78_0.18_195)] hover:shadow-sm transition-all duration-150 group">
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0">{sme.icon}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground group-hover:text-[oklch(0.45_0.18_195)] transition-colors">{sme.name}</p>
                <Badge variant="secondary" className="text-[10px] mt-1 mb-1.5">{sme.domain}</Badge>
                <p className="text-xs text-muted-foreground line-clamp-2">{sme.title}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {sme.expertise.slice(0, 2).map(e => <span key={e} className="text-[10px] px-1.5 py-0.5 rounded bg-accent text-muted-foreground">{e}</span>)}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> Live AI consultation
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">No experts match your search.</div>
      )}
    </div>
  );
}
