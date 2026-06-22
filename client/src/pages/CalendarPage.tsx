import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Plus, Calendar, Clock, MapPin, Zap, RefreshCw, AlertTriangle, Mail } from "lucide-react";
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths,
  addWeeks, subWeeks, isToday,
} from "date-fns";
import { toast } from "sonner";

const COMPANY_COLOURS: Record<string, { bg: string; text: string; border: string }> = {
  celadon:   { bg: "bg-emerald-50",  text: "text-emerald-700",  border: "border-l-emerald-500" },
  celanova:  { bg: "bg-violet-50",   text: "text-violet-700",   border: "border-l-violet-500" },
  perfect:   { bg: "bg-rose-50",     text: "text-rose-700",     border: "border-l-rose-500" },
  olmack:    { bg: "bg-amber-50",    text: "text-amber-700",    border: "border-l-amber-500" },
  boundless: { bg: "bg-sky-50",      text: "text-sky-700",      border: "border-l-sky-500" },
  personal:  { bg: "bg-gray-50",     text: "text-gray-600",     border: "border-l-gray-400" },
  outlook:   { bg: "bg-blue-50",     text: "text-blue-700",     border: "border-l-blue-500" },
};

const COMPANIES = ["celadon", "celanova", "perfect", "olmack", "boundless", "personal"];
type ViewMode = "month" | "week" | "day";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: "", startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    endTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    projectSlug: "personal", location: "", notes: "", isAllDay: false,
  });

  const startDate = format(startOfMonth(currentDate), "yyyy-MM-dd");
  const endDate = format(endOfMonth(currentDate), "yyyy-MM-dd");
  const todayDateStr = format(new Date(), "yyyy-MM-dd");

  const { data: events = [], refetch } = trpc.calendar.getEvents.useQuery({ startDate, endDate });
  const { data: conflicts = [] } = trpc.calendar.detectConflicts.useQuery({ date: todayDateStr });

  const syncOutlook = trpc.calendar.syncOutlook.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setLastSynced(new Date());
        refetch();
        toast.success(`Outlook synced — ${data.synced} event${data.synced !== 1 ? "s" : ""} imported`);
      } else {
        toast.error("Sync failed — check Outlook connection in Settings");
      }
    },
    onError: () => toast.error("Outlook sync failed"),
  });

  const createEvent = trpc.calendar.create.useMutation({
    onSuccess: () => { refetch(); setShowNewEvent(false); toast.success("Event created"); },
  });

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const getEventsForDay = (day: Date) =>
    events.filter(e => isSameDay(new Date(e.startTime), day));

  const navigate = (dir: 1 | -1) => {
    if (viewMode === "month") setCurrentDate(dir === 1 ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
    else setCurrentDate(dir === 1 ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
  };

  const getC = (slug: string, source?: string) => {
    if (source === "outlook") return COMPANY_COLOURS.outlook;
    return COMPANY_COLOURS[slug?.toLowerCase()] ?? COMPANY_COLOURS.personal;
  };

  const todayEvents = getEventsForDay(new Date()).sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  const handleCreate = () => {
    if (!newEvent.title.trim()) return;
    createEvent.mutate({
      title: newEvent.title,
      startTime: new Date(newEvent.startTime).toISOString(),
      endTime: new Date(newEvent.endTime).toISOString(),
      projectSlug: newEvent.projectSlug,
      location: newEvent.location,
      notes: newEvent.notes,
      isAllDay: newEvent.isAllDay,
    });
  };

  return (
    <div className="flex h-full min-h-screen bg-background">
      {/* Main calendar */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-white">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ChevronLeft className="w-4 h-4" /></Button>
            <h1 className="text-base font-semibold text-foreground min-w-[180px] text-center">
              {viewMode === "month" ? format(currentDate, "MMMM yyyy") :
               viewMode === "week" ? `${format(weekDays[0], "d MMM")} – ${format(weekDays[6], "d MMM yyyy")}` :
               format(currentDate, "EEEE, d MMMM yyyy")}
            </h1>
            <Button variant="ghost" size="icon" onClick={() => navigate(1)}><ChevronRight className="w-4 h-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="text-xs ml-1">Today</Button>
          </div>
          <div className="flex items-center gap-2">
            {/* Outlook Sync Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => syncOutlook.mutate()}
              disabled={syncOutlook.isPending}
              className="text-xs gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              {syncOutlook.isPending ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Mail className="w-3.5 h-3.5" />
              )}
              {syncOutlook.isPending ? "Syncing..." : "Sync Outlook"}
              {lastSynced && !syncOutlook.isPending && (
                <span className="text-[10px] text-muted-foreground ml-1">
                  {format(lastSynced, "HH:mm")}
                </span>
              )}
            </Button>
            <div className="flex rounded-lg border border-border overflow-hidden">
              {(["month", "week", "day"] as ViewMode[]).map(v => (
                <button key={v} onClick={() => setViewMode(v)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === v ? "bg-[oklch(0.78_0.18_195)] text-white" : "bg-white text-muted-foreground hover:bg-gray-50"}`}>
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
            <Button size="sm" onClick={() => setShowNewEvent(true)} className="bg-[oklch(0.78_0.18_195)] hover:bg-[oklch(0.68_0.18_195)] text-white">
              <Plus className="w-4 h-4 mr-1" /> New Event
            </Button>
          </div>
        </div>

        {/* Conflict Warning Banner */}
        {conflicts.length > 0 && (
          <div className="flex items-center gap-2 px-6 py-2 bg-amber-50 border-b border-amber-200 text-amber-800 text-xs">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>
              <strong>{conflicts.length} scheduling conflict{conflicts.length > 1 ? "s" : ""} today:</strong>{" "}
              {conflicts.slice(0, 2).map((c, i) => (
                <span key={i}>
                  {i > 0 && " · "}
                  {c.event1.title} &amp; {c.event2.title}
                </span>
              ))}
              {conflicts.length > 2 && ` +${conflicts.length - 2} more`}
            </span>
          </div>
        )}

        {/* Month View */}
        {viewMode === "month" && (
          <div className="flex-1 flex flex-col overflow-auto">
            <div className="grid grid-cols-7 border-b border-border bg-gray-50">
              {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
                <div key={d} className="px-3 py-2 text-xs font-medium text-muted-foreground text-center">{d}</div>
              ))}
            </div>
            <div className="flex-1 grid grid-cols-7" style={{ gridAutoRows: "minmax(90px, 1fr)" }}>
              {calendarDays.map((day, i) => {
                const dayEvents = getEventsForDay(day);
                const inMonth = isSameMonth(day, currentDate);
                const today = isToday(day);
                return (
                  <div key={i} className={`border-b border-r border-border p-1.5 ${!inMonth ? "bg-gray-50/50" : "bg-white"}`}>
                    <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${today ? "bg-[oklch(0.78_0.18_195)] text-white" : inMonth ? "text-foreground" : "text-muted-foreground"}`}>
                      {format(day, "d")}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 3).map(ev => {
                        const c = getC(ev.projectSlug ?? "", ev.source);
                        return (
                          <div key={ev.id} className={`text-xs px-1.5 py-0.5 rounded border-l-2 ${c.bg} ${c.text} ${c.border} truncate flex items-center gap-1`}>
                            {ev.source === "outlook" && <Mail className="w-2.5 h-2.5 shrink-0" />}
                            {ev.title}
                          </div>
                        );
                      })}
                      {dayEvents.length > 3 && <div className="text-xs text-muted-foreground px-1">+{dayEvents.length - 3}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Week View */}
        {viewMode === "week" && (
          <div className="flex-1 flex flex-col overflow-auto">
            <div className="grid grid-cols-7 border-b border-border bg-gray-50">
              {weekDays.map((day, i) => (
                <div key={i} className={`px-3 py-3 text-center border-r border-border last:border-r-0 ${isToday(day) ? "bg-[oklch(0.78_0.18_195/0.05)]" : ""}`}>
                  <div className="text-xs text-muted-foreground">{format(day, "EEE")}</div>
                  <div className={`text-lg font-semibold mt-0.5 w-9 h-9 flex items-center justify-center rounded-full mx-auto ${isToday(day) ? "bg-[oklch(0.78_0.18_195)] text-white" : "text-foreground"}`}>
                    {format(day, "d")}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex-1 grid grid-cols-7">
              {weekDays.map((day, i) => {
                const dayEvents = getEventsForDay(day).sort(
                  (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
                );
                return (
                  <div key={i} className={`border-r border-border last:border-r-0 p-2 space-y-1.5 min-h-[200px] ${isToday(day) ? "bg-[oklch(0.78_0.18_195/0.02)]" : "bg-white"}`}>
                    {dayEvents.map(ev => {
                      const c = getC(ev.projectSlug ?? "", ev.source);
                      return (
                        <div key={ev.id} className={`rounded-lg border-l-[3px] p-2 ${c.bg} ${c.border}`}>
                          <div className={`text-xs font-semibold leading-tight flex items-center gap-1 ${c.text}`}>
                            {ev.source === "outlook" && <Mail className="w-2.5 h-2.5 shrink-0" />}
                            {ev.title}
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            {format(new Date(ev.startTime), "HH:mm")} – {format(new Date(ev.endTime), "HH:mm")}
                          </div>
                          {ev.source === "outlook" && (
                            <Badge variant="outline" className="text-[9px] px-1 py-0 mt-0.5 border-blue-200 text-blue-600">Outlook</Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Day View */}
        {viewMode === "day" && (
          <div className="flex-1 overflow-auto p-6">
            <div className="space-y-3 max-w-2xl">
              {getEventsForDay(currentDate).length === 0 ? (
                <div className="text-center py-16">
                  <Calendar className="w-8 h-8 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No events on {format(currentDate, "d MMMM")}</p>
                </div>
              ) : (
                getEventsForDay(currentDate)
                  .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                  .map(ev => {
                    const c = getC(ev.projectSlug ?? "", ev.source);
                    return (
                      <div key={ev.id} className={`rounded-xl border-l-[3px] p-4 ${c.bg} ${c.border}`}>
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-semibold leading-tight flex items-center gap-1.5 ${c.text}`}>
                            {ev.source === "outlook" && <Mail className="w-3.5 h-3.5 shrink-0" />}
                            {ev.title}
                          </p>
                          <div className="flex items-center gap-1 shrink-0">
                            {ev.source === "outlook" && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-blue-200 text-blue-600">Outlook</Badge>
                            )}
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">{ev.projectSlug || "—"}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {format(new Date(ev.startTime), "HH:mm")} – {format(new Date(ev.endTime), "HH:mm")}
                        </div>
                        {ev.location && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />{ev.location}
                          </div>
                        )}
                        {ev.notes && (
                          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{ev.notes}</p>
                        )}
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right panel */}
      <div className="w-72 border-l border-border bg-white flex flex-col shrink-0">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Today's Agenda</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{format(new Date(), "EEEE, d MMMM")}</p>
        </div>

        {/* Conflict alert in right panel */}
        {conflicts.length > 0 && (
          <div className="mx-3 mt-3 rounded-lg bg-amber-50 border border-amber-200 p-2.5">
            <div className="flex items-center gap-1.5 text-amber-700 text-xs font-semibold mb-1">
              <AlertTriangle className="w-3 h-3" />
              {conflicts.length} Conflict{conflicts.length > 1 ? "s" : ""}
            </div>
            {conflicts.slice(0, 2).map((c, i) => (
              <p key={i} className="text-[10px] text-amber-600 leading-tight">
                {c.event1.title} overlaps with {c.event2.title}
              </p>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {todayEvents.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-muted-foreground/30" />
              <p className="text-xs text-muted-foreground">No meetings today</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 text-xs gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50"
                onClick={() => syncOutlook.mutate()}
                disabled={syncOutlook.isPending}
              >
                <RefreshCw className={`w-3 h-3 ${syncOutlook.isPending ? "animate-spin" : ""}`} />
                Sync Outlook
              </Button>
            </div>
          ) : (
            todayEvents.map(ev => {
              const c = getC(ev.projectSlug ?? "", ev.source);
              return (
                <div key={ev.id} className={`rounded-xl border-l-[3px] p-3 ${c.bg} ${c.border}`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold leading-tight flex items-center gap-1 ${c.text}`}>
                      {ev.source === "outlook" && <Mail className="w-3 h-3 shrink-0" />}
                      {ev.title}
                    </p>
                    {ev.source === "outlook" ? (
                      <Badge variant="outline" className="text-[10px] shrink-0 px-1.5 py-0 border-blue-200 text-blue-600">Outlook</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] shrink-0 px-1.5 py-0 capitalize">{ev.projectSlug}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {format(new Date(ev.startTime), "HH:mm")} – {format(new Date(ev.endTime), "HH:mm")}
                  </div>
                  {ev.location && (
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />{ev.location}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Company legend */}
        <div className="p-4 border-t border-border space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground mb-2">Legend</p>
          {COMPANIES.map(c => {
            const col = getC(c);
            return (
              <div key={c} className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-sm border-l-2 ${col.border} ${col.bg}`} />
                <span className="text-xs text-muted-foreground capitalize">{c}</span>
              </div>
            );
          })}
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm border-l-2 border-l-blue-500 bg-blue-50" />
            <span className="text-xs text-muted-foreground">Outlook</span>
          </div>
        </div>

        {/* Victoria pre-brief */}
        <div className="p-4 border-t border-border">
          <div className="rounded-xl border border-[oklch(0.78_0.18_195/0.3)] bg-[oklch(0.78_0.18_195/0.05)] p-3">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-3 h-3 text-[oklch(0.78_0.18_195)]" />
              <span className="text-xs font-semibold text-[oklch(0.78_0.18_195)]">Victoria · Pre-brief</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {todayEvents.length > 0
                ? `${todayEvents.length} meeting${todayEvents.length > 1 ? "s" : ""} today. First: ${todayEvents[0].title} at ${format(new Date(todayEvents[0].startTime), "HH:mm")}.${conflicts.length > 0 ? ` ⚠️ ${conflicts.length} conflict${conflicts.length > 1 ? "s" : ""} detected.` : ""}`
                : "No meetings scheduled today. Use the time for deep work."}
            </p>
          </div>
        </div>
      </div>

      {/* New Event Dialog */}
      <Dialog open={showNewEvent} onOpenChange={setShowNewEvent}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>New Event</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Title</Label>
              <Input value={newEvent.title} onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))} placeholder="Event title" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Start</Label>
                <Input type="datetime-local" value={newEvent.startTime} onChange={e => setNewEvent(p => ({ ...p, startTime: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">End</Label>
                <Input type="datetime-local" value={newEvent.endTime} onChange={e => setNewEvent(p => ({ ...p, endTime: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Company</Label>
              <Select value={newEvent.projectSlug} onValueChange={v => setNewEvent(p => ({ ...p, projectSlug: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COMPANIES.map(c => <SelectItem key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Location (optional)</Label>
              <Input value={newEvent.location} onChange={e => setNewEvent(p => ({ ...p, location: e.target.value }))} placeholder="Location or video link" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewEvent(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!newEvent.title.trim() || createEvent.isPending} className="bg-[oklch(0.78_0.18_195)] text-white hover:bg-[oklch(0.68_0.18_195)]">
              {createEvent.isPending ? "Creating..." : "Create Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
