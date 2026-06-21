import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { TrendingUp, TrendingDown, AlertTriangle, Edit2, Loader2, PoundSterling } from "lucide-react";
import { toast } from "sonner";

const COMPANIES = [
  { slug: "celadon",   name: "Celadon",   colour: "border-l-emerald-500" },
  { slug: "celanova",  name: "Celanova",  colour: "border-l-violet-500" },
  { slug: "perfect",   name: "Perfect",   colour: "border-l-rose-500" },
  { slug: "olmack",    name: "Olmack",    colour: "border-l-amber-500" },
  { slug: "boundless", name: "Boundless", colour: "border-l-sky-500" },
  { slug: "personal",  name: "Personal",  colour: "border-l-gray-400" },
];

function fmt(n: number) {
  if (n >= 1_000_000) return `£${(n / 1_000_000).toFixed(1)}m`;
  if (n >= 1_000) return `£${(n / 1_000).toFixed(0)}k`;
  return `£${n}`;
}

function runwayMonths(cash: number, burn: number, revenue: number) {
  const net = burn - revenue;
  if (net <= 0) return Infinity;
  return Math.floor(cash / net);
}

function runwayLabel(months: number) {
  if (months === Infinity) return { label: "Profitable", colour: "text-emerald-600", icon: "up" as const };
  if (months >= 12) return { label: `${months}m runway`, colour: "text-emerald-600", icon: "up" as const };
  if (months >= 6)  return { label: `${months}m runway`, colour: "text-amber-600", icon: "warn" as const };
  return { label: `${months}m runway`, colour: "text-rose-600", icon: "down" as const };
}

interface EditState {
  cashGbp: string;
  burnMonthlyGbp: string;
  revenueMonthlyGbp: string;
  notes: string;
}

export default function FinancialPage() {
  const { data: allFinancials = [], refetch, isLoading } = trpc.financial.getAll.useQuery();
  const upsert = trpc.financial.upsert.useMutation({
    onSuccess: () => { refetch(); toast.success("Saved"); setEditSlug(null); },
  });

  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>({ cashGbp: "", burnMonthlyGbp: "", revenueMonthlyGbp: "", notes: "" });

  const getF = (slug: string) => allFinancials.find(f => f.companySlug === slug);

  const openEdit = (slug: string) => {
    const f = getF(slug);
    setEditState({
      cashGbp: f ? String(f.cashGbp) : "0",
      burnMonthlyGbp: f ? String(f.burnMonthlyGbp) : "0",
      revenueMonthlyGbp: f ? String(f.revenueMonthlyGbp) : "0",
      notes: f?.notes ?? "",
    });
    setEditSlug(slug);
  };

  const handleSave = () => {
    if (!editSlug) return;
    const company = COMPANIES.find(c => c.slug === editSlug)!;
    upsert.mutate({
      companySlug: editSlug,
      companyName: company.name,
      cashGbp: parseInt(editState.cashGbp) || 0,
      burnMonthlyGbp: parseInt(editState.burnMonthlyGbp) || 0,
      revenueMonthlyGbp: parseInt(editState.revenueMonthlyGbp) || 0,
      notes: editState.notes,
    });
  };

  const totalCash = allFinancials.reduce((s, f) => s + f.cashGbp, 0);
  const totalBurn = allFinancials.reduce((s, f) => s + f.burnMonthlyGbp, 0);
  const totalRevenue = allFinancials.reduce((s, f) => s + f.revenueMonthlyGbp, 0);
  const netBurn = totalBurn - totalRevenue;
  const alerts = allFinancials.filter(f => {
    const r = runwayMonths(f.cashGbp, f.burnMonthlyGbp, f.revenueMonthlyGbp);
    return r !== Infinity && r < 6;
  }).length;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Financial Pulse</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Cash, burn, and runway across all companies</p>
        </div>
        {allFinancials.length > 0 && (
          <Badge variant="outline" className="text-xs">
            Updated {new Date(Math.max(...allFinancials.map(f => new Date(f.updatedAt).getTime()))).toLocaleDateString("en-GB")}
          </Badge>
        )}
      </div>

      {/* Portfolio summary */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="rounded-xl border border-border bg-white p-3 sm:p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Cash</p>
          <p className="text-lg sm:text-2xl font-bold text-foreground">{fmt(totalCash)}</p>
          <p className="text-xs text-muted-foreground mt-1">Across all companies</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 sm:p-4">
          <p className="text-xs text-muted-foreground mb-1">Net Monthly Burn</p>
          <p className={`text-lg sm:text-2xl font-bold ${netBurn > 0 ? "text-rose-600" : "text-emerald-600"}`}>
            {netBurn > 0 ? `-${fmt(netBurn)}` : `+${fmt(Math.abs(netBurn))}`}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {totalRevenue > 0 ? `${fmt(totalRevenue)} revenue vs ${fmt(totalBurn)} burn` : `${fmt(totalBurn)} total burn`}
          </p>
        </div>
        <div className={`rounded-xl border bg-white p-3 sm:p-4 ${alerts > 0 ? "border-rose-200 bg-rose-50" : "border-border"}`}>
          <p className={`text-xs mb-1 ${alerts > 0 ? "text-rose-600" : "text-muted-foreground"}`}>Alerts</p>
          <p className={`text-lg sm:text-2xl font-bold ${alerts > 0 ? "text-rose-600" : "text-foreground"}`}>{alerts}</p>
          <p className={`text-xs mt-1 ${alerts > 0 ? "text-rose-500" : "text-muted-foreground"}`}>
            {alerts > 0 ? "Under 6 months runway" : "All clear"}
          </p>
        </div>
      </div>

      {/* Company cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-[oklch(0.78_0.18_195)]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {COMPANIES.map(company => {
            const f = getF(company.slug);
            const cash = f?.cashGbp ?? 0;
            const burn = f?.burnMonthlyGbp ?? 0;
            const revenue = f?.revenueMonthlyGbp ?? 0;
            const runway = runwayMonths(cash, burn, revenue);
            const rl = runwayLabel(runway);

            return (
              <div key={company.slug} className={`rounded-xl border-l-4 border border-border bg-white p-4 active:bg-muted/20 transition-colors ${company.colour}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground">{company.name}</h3>
                  <div className="flex items-center gap-2">
                    {f && (
                      <span className={`text-xs font-medium flex items-center gap-1 ${rl.colour}`}>
                        {rl.icon === "up" && <TrendingUp className="w-3 h-3" />}
                        {rl.icon === "down" && <TrendingDown className="w-3 h-3" />}
                        {rl.icon === "warn" && <AlertTriangle className="w-3 h-3" />}
                        {rl.label}
                      </span>
                    )}
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(company.slug)}>
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {f ? (
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Cash</p>
                      <p className="text-base font-bold text-foreground">{fmt(cash)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Burn/mo</p>
                      <p className="text-base font-bold text-rose-600">{fmt(burn)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Revenue/mo</p>
                      <p className="text-base font-bold text-emerald-600">{fmt(revenue)}</p>
                    </div>
                    {f.notes && (
                      <p className="col-span-3 text-xs text-muted-foreground border-t border-border pt-2 mt-1">{f.notes}</p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-xs text-muted-foreground mb-2">No data entered yet</p>
                    <Button size="sm" variant="outline" onClick={() => openEdit(company.slug)} className="text-xs">
                      <Edit2 className="w-3 h-3 mr-1" /> Add data
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editSlug} onOpenChange={open => !open && setEditSlug(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{COMPANIES.find(c => c.slug === editSlug)?.name} — Financial Data</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1"><PoundSterling className="w-3 h-3" /> Cash in Bank (£)</Label>
              <Input type="number" value={editState.cashGbp} onChange={e => setEditState(p => ({ ...p, cashGbp: e.target.value }))} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Monthly Burn (£)</Label>
              <Input type="number" value={editState.burnMonthlyGbp} onChange={e => setEditState(p => ({ ...p, burnMonthlyGbp: e.target.value }))} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Monthly Revenue (£)</Label>
              <Input type="number" value={editState.revenueMonthlyGbp} onChange={e => setEditState(p => ({ ...p, revenueMonthlyGbp: e.target.value }))} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Notes (optional)</Label>
              <Input value={editState.notes} onChange={e => setEditState(p => ({ ...p, notes: e.target.value }))} placeholder="e.g. Awaiting Series A close" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSlug(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={upsert.isPending} className="bg-[oklch(0.78_0.18_195)] text-white hover:bg-[oklch(0.68_0.18_195)]">
              {upsert.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
