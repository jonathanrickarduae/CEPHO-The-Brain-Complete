import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, Zap, AlertTriangle, Trash2, Calendar } from "lucide-react";
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths,
  addWeeks, subWeeks, addDays, subDays, isToday, parseISO, areIntervalsOverlapping,
} from "date-fns";
import { toast } from "sonner";

const COMPANY_COLOURS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  celadon:   { bg: "bg-emerald-50",  text: "text-emerald-700",  border: "border-l-emerald-500",  dot: "bg-emerald-500" },
  celanova:  { bg: "bg-violet-50",   text: "text-violet-700",   border: "border-l-violet-500",   dot: "bg-violet-500" },
  perfect:   { bg: "bg-rose-50",     text: "text-rose-700",     border: "border-l-rose-500",     dot: "bg-rose-500" },
  olmack:    { bg: "bg-amber-50",    text: "text-amber-700",    border: "border-l-amber-500",    dot: "bg-amber-500" },
  boundless: { bg: "bg-sky-50",      text: "text-sky-700",      border: "border-l-sky-500",      dot: "bg-sky-500" },
  personal:  { bg: "bg-gray-50",     text: "text-gray-600",     border: "border-l-gray-400",     dot: "bg-gray-400" },
};
const COMPANIES = ["celadon", "celanova", "perfect", "olmack", "boundless", "personal"];
const getC = (slug: string) => COMPANY_COLOURS[slug] ?? COMPANY_COLOURS.personal;

type ViewMode = "month" | "week" | "day";

// ─── Conflict detection ───────────────────────────────────────────────────────
function detectConflicts(events: any[]): Set<number> {
  const conflicting = new Set<number>();
  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      const a = events[i];
      const b = events[j];
      if (!a.isAllDay && !b.isAllDay) {
        const overlap = areIntervalsOverlapping(
          { start: new Date(a.startTime), end: new Date(a.endTime) },
          { start: new Date(b.startTime), end: new Date(b.endTime) },
          { inclusive: false }
        );
        if (overlap) {
          conflicting.add(a.id);
          conflicting.add(b.id);
        }
      }
    }
  }
  return conflicting;
}

// ─── Time grid helpers ────────────────────────────────────────────────────────
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const GRID_START_HOUR = 6;
const GRID_END_HOUR = 22;
const VISIBLE_HOURS = Array.from({ length: GRID_END_HOUR - GRID_START_HOUR }, (_, i) => GRID_START_HOUR + i);
const HOUR_HEIGHT = 60; // px per hour

function getEventTopOffset(startTime: Date): number {
  const hours = startTime.getHours() + startTime.getMinutes() / 60;
  return Math.max(0, (hours - GRID_START_HOUR) * HOUR_HEIGHT);
}

function getEventHeight(startTime: Date, endTime: Date): number {
  const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  return Math.max(HOUR_HEIGHT * 0.25, durationHours * HOUR_HEIGHT);
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    endTime: format(new Date(Date.now() + 3600000), "yyyy-MM-dd'T'HH:mm"),
    projectSlug: "personal",
    location: "",
    notes: "",
    isAllDay: false,
  });

  // Fetch events for the visible range
  const startDate = useMemo(() => {
    if (viewMode === "month") return format(startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 }), "yyyy-MM-dd");
    if (viewMode === "week") return format(startOfWeek(currentDate, { weekStartsOn: 1 }), "yyyy-MM-dd");
    return format(currentDate, "yyyy-MM-dd");
  }, [currentDate, viewMode]);

  const endDate = useMemo(() => {
    if (viewMode === "month") return format(endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 }), "yyyy-MM-dd");
    if (viewMode === "week") return format(endOfWeek(currentDate, { weekStartsOn: 1 }), "yyyy-MM-dd");
    return format(currentDate, "yyyy-MM-dd");
  }, [currentDate, viewMode]);

  const { data: events = [], refetch } = trpc.calendar.getEvents.useQuery({ startDate, endDate });
  const createEvent = trpc.calendar.create.useMutation({
    onSuccess: () => { refetch(); setShowNewEvent(false); toast.success("Event created"); resetForm(); },
  });
  const deleteEvent = trpc.calendar.delete?.useMutation?.({
    onSuccess: () => { refetch(); setSelectedEvent(null); toast.success("Event deleted"); },
  });

  const resetForm = () => setNewEvent({
    title: "",
    startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    endTime: format(new Date(Date.now() + 3600000), "yyyy-MM-dd'T'HH:mm"),
    projectSlug: "personal", location: "", notes: "", isAllDay: false,
  });

  const handleCreate = () => {
    if (!newEvent.title.trim()) return;
    createEvent.mutate({
      title: newEvent.title,
      startTime: new Date(newEvent.startTime).toISOString(),
      endTime: new Date(newEvent.endTime).toISOString(),
      projectSlug: newEvent.projectSlug,
      location: newEvent.location || undefined,
      notes: newEvent.notes || undefined,
      isAllDay: newEvent.isAllDay,
    });
  };

  // Navigation
  const navigate = (dir: 1 | -1) => {
    if (viewMode === "month") setCurrentDate(d => dir > 0 ? addMonths(d, 1) : subMonths(d, 1));
    else if (viewMode === "week") setCurrentDate(d => dir > 0 ? addWeeks(d, 1) : subWeeks(d, 1));
    else setCurrentDate(d => dir > 0 ? addDays(d, 1) : subDays(d, 1));
  };

  const goToToday = () => setCurrentDate(new Date());

  // Derived
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

  const todayEvents = useMemo(() =>
    (events as any[]).filter(e => isSameDay(new Date(e.startTime), currentDate))
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
    [events, currentDate]
  );

  const conflictIds = useMemo(() => detectConflicts(todayEvents), [todayEvents]);

  const getEventsForDay = (day: Date) =>
    (events as any[]).filter(e => isSameDay(new Date(e.startTime), day))
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const headerLabel = useMemo(() => {
    if (viewMode === "month") return format(currentDate, "MMMM yyyy");
    if (viewMode === "week") {
      const s = startOfWeek(currentDate, { weekStartsOn: 1 });
      const e = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(s, "d MMM")} – ${format(e, "d MMM yyyy")}`;
    }
    return format(currentDate, "EEEE, d MMMM yyyy");
  }, [currentDate, viewMode]);

  const currentHourOffset = useMemo(() => {
    const now = new Date();
    return (now.getHours() + now.getMinutes() / 60 - GRID_START_HOUR) * HOUR_HEIGHT;
  }, []);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* ── Header ── */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border shrink-0 bg-background">
        <div className="flex items-center gap-1">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded hover:bg-muted transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => navigate(1)} className="p-1.5 rounded hover:bg-muted transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <h2 className="text-sm font-semibold flex-1 truncate">{headerLabel}</h2>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={goToToday}>Today</Button>
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(["day", "week", "month"] as ViewMode[]).map(v => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className={`px-2.5 py-1 text-xs capitalize transition-colors ${viewMode === v ? "bg-foreground text-background" : "hover:bg-muted"}`}
              >
                {v}
              </button>
            ))}
          </div>
          <Button size="sm" className="h-7 gap-1 text-xs" onClick={() => setShowNewEvent(true)}>
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Event</span>
          </Button>
        </div>
      </div>

      {/* ── Conflict warning ── */}
      {viewMode === "day" && conflictIds.size > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-700 text-xs shrink-0">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>{conflictIds.size / 2} scheduling conflict{conflictIds.size > 2 ? "s" : ""} detected today</span>
        </div>
      )}

      {/* ── Month view ── */}
      {viewMode === "month" && (
        <div className="flex-1 overflow-y-auto p-2">
          <div className="grid grid-cols-7 mb-1">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
              <div key={d} className="text-center text-xs text-muted-foreground py-1 font-medium">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden">
            {calendarDays.map(day => {
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isSelected = isSameDay(day, currentDate);
              return (
                <div
                  key={day.toISOString()}
                  onClick={() => { setCurrentDate(day); setViewMode("day"); }}
                  className={`bg-background min-h-[72px] p-1.5 cursor-pointer hover:bg-muted/50 transition-colors ${!isCurrentMonth ? "opacity-40" : ""}`}
                >
                  <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium mb-1 ${isToday(day) ? "bg-foreground text-background" : isSelected ? "bg-muted" : ""}`}>
                    {format(day, "d")}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map(ev => {
                      const c = getC(ev.projectSlug);
                      return (
                        <div key={ev.id} className={`text-[10px] truncate px-1 py-0.5 rounded ${c.bg} ${c.text}`}>
                          {ev.isAllDay ? ev.title : `${format(new Date(ev.startTime), "HH:mm")} ${ev.title}`}
                        </div>
                      );
                    })}
                    {dayEvents.length > 3 && <div className="text-[10px] text-muted-foreground px-1">+{dayEvents.length - 3} more</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Week view ── */}
      {viewMode === "week" && (
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-7 border-b border-border sticky top-0 bg-background z-10">
            {weekDays.map(day => (
              <div
                key={day.toISOString()}
                onClick={() => { setCurrentDate(day); setViewMode("day"); }}
                className={`text-center py-2 cursor-pointer hover:bg-muted/50 transition-colors border-r border-border last:border-r-0 ${isSameDay(day, currentDate) ? "bg-muted/30" : ""}`}
              >
                <div className="text-xs text-muted-foreground">{format(day, "EEE")}</div>
                <div className={`text-sm font-semibold mx-auto w-7 h-7 flex items-center justify-center rounded-full ${isToday(day) ? "bg-foreground text-background" : ""}`}>
                  {format(day, "d")}
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {weekDays.map(day => {
              const dayEvents = getEventsForDay(day);
              return (
                <div key={day.toISOString()} className="border-r border-border last:border-r-0 min-h-[200px] p-1 space-y-1">
                  {dayEvents.map(ev => {
                    const c = getC(ev.projectSlug);
                    return (
                      <div key={ev.id} onClick={() => setSelectedEvent(ev)} className={`rounded border-l-2 p-1.5 cursor-pointer hover:opacity-80 transition-opacity ${c.bg} ${c.border}`}>
                        <p className={`text-[10px] font-medium truncate ${c.text}`}>{ev.title}</p>
                        {!ev.isAllDay && <p className="text-[10px] text-muted-foreground">{format(new Date(ev.startTime), "HH:mm")}</p>}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Day view (time grid) ── */}
      {viewMode === "day" && (
        <div className="flex-1 overflow-y-auto">
          {/* All-day events */}
          {todayEvents.filter(e => e.isAllDay).length > 0 && (
            <div className="border-b border-border p-2 space-y-1 bg-muted/20 shrink-0">
              <p className="text-xs text-muted-foreground px-1">All day</p>
              {todayEvents.filter(e => e.isAllDay).map(ev => {
                const c = getC(ev.projectSlug);
                return (
                  <div key={ev.id} onClick={() => setSelectedEvent(ev)} className={`rounded-lg border-l-2 px-2 py-1.5 cursor-pointer ${c.bg} ${c.border}`}>
                    <p className={`text-xs font-medium ${c.text}`}>{ev.title}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Time grid */}
          <div className="relative" style={{ height: `${VISIBLE_HOURS.length * HOUR_HEIGHT}px` }}>
            {/* Hour lines */}
            {VISIBLE_HOURS.map(hour => (
              <div key={hour} className="absolute w-full flex items-start" style={{ top: `${(hour - GRID_START_HOUR) * HOUR_HEIGHT}px` }}>
                <div className="w-12 shrink-0 text-right pr-2 text-xs text-muted-foreground -mt-2 select-none">
                  {hour === 0 ? "12am" : hour < 12 ? `${hour}am` : hour === 12 ? "12pm" : `${hour - 12}pm`}
                </div>
                <div className="flex-1 border-t border-border/50" />
              </div>
            ))}

            {/* Current time indicator */}
            {isToday(currentDate) && currentHourOffset >= 0 && currentHourOffset <= VISIBLE_HOURS.length * HOUR_HEIGHT && (
              <div className="absolute left-12 right-0 flex items-center z-20 pointer-events-none" style={{ top: `${currentHourOffset}px` }}>
                <div className="w-2 h-2 rounded-full bg-red-500 -ml-1" />
                <div className="flex-1 border-t-2 border-red-500" />
              </div>
            )}

            {/* Events */}
            <div className="absolute left-14 right-2 top-0">
              {todayEvents.filter(e => !e.isAllDay).map(ev => {
                const start = new Date(ev.startTime);
                const end = new Date(ev.endTime);
                const top = getEventTopOffset(start);
                const height = getEventHeight(start, end);
                const c = getC(ev.projectSlug);
                const isConflict = conflictIds.has(ev.id);
                return (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedEvent(ev)}
                    className={`absolute left-0 right-0 rounded-lg border-l-[3px] px-2 py-1 cursor-pointer hover:opacity-90 transition-opacity overflow-hidden ${c.bg} ${c.border} ${isConflict ? "ring-2 ring-amber-400 ring-offset-1" : ""}`}
                    style={{ top: `${top}px`, height: `${height}px`, minHeight: "24px" }}
                  >
                    <p className={`text-xs font-semibold leading-tight truncate ${c.text}`}>{ev.title}</p>
                    {height > 36 && (
                      <p className="text-[10px] text-muted-foreground">
                        {format(start, "HH:mm")} – {format(end, "HH:mm")}
                      </p>
                    )}
                    {height > 52 && ev.location && (
                      <p className="text-[10px] text-muted-foreground truncate">{ev.location}</p>
                    )}
                    {isConflict && <AlertTriangle className="absolute top-1 right-1 h-3 w-3 text-amber-500" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Victoria pre-brief */}
          <div className="p-4 border-t border-border mt-2">
            <div className="rounded-xl border border-[oklch(0.78_0.18_195/0.3)] bg-[oklch(0.78_0.18_195/0.05)] p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <Zap className="w-3 h-3 text-[oklch(0.78_0.18_195)]" />
                <span className="text-xs font-semibold text-[oklch(0.78_0.18_195)]">Victoria · Day brief</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {todayEvents.length > 0
                  ? `${todayEvents.length} event${todayEvents.length > 1 ? "s" : ""} today${conflictIds.size > 0 ? ` · ${conflictIds.size / 2} conflict${conflictIds.size > 2 ? "s" : ""} need attention` : ""}. First: ${todayEvents[0].title} at ${format(new Date(todayEvents[0].startTime), "HH:mm")}.`
                  : "No events today. Clear day for deep work."}
              </p>
            </div>
          </div>

          {/* Company legend */}
          <div className="px-4 pb-4">
            <div className="flex flex-wrap gap-3">
              {COMPANIES.map(c => {
                const col = getC(c);
                return (
                  <div key={c} className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                    <span className="text-xs text-muted-foreground capitalize">{c}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── New Event Dialog ── */}
      <Dialog open={showNewEvent} onOpenChange={setShowNewEvent}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>New Event</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div><Label className="text-xs">Title *</Label><Input value={newEvent.title} onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))} placeholder="Event title" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Start</Label><Input type="datetime-local" value={newEvent.startTime} onChange={e => setNewEvent(p => ({ ...p, startTime: e.target.value }))} /></div>
              <div><Label className="text-xs">End</Label><Input type="datetime-local" value={newEvent.endTime} onChange={e => setNewEvent(p => ({ ...p, endTime: e.target.value }))} /></div>
            </div>
            <div><Label className="text-xs">Company</Label>
              <Select value={newEvent.projectSlug} onValueChange={v => setNewEvent(p => ({ ...p, projectSlug: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{COMPANIES.map(c => <SelectItem key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Location</Label><Input value={newEvent.location} onChange={e => setNewEvent(p => ({ ...p, location: e.target.value }))} placeholder="Location or video link" /></div>
            <div><Label className="text-xs">Notes</Label><Textarea value={newEvent.notes} onChange={e => setNewEvent(p => ({ ...p, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewEvent(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!newEvent.title.trim() || createEvent.isPending}>
              {createEvent.isPending ? "Creating..." : "Create Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Event detail Dialog ── */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-md">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getC(selectedEvent.projectSlug).dot}`} />
                  {selectedEvent.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 shrink-0" />
                  {selectedEvent.isAllDay ? "All day" : `${format(new Date(selectedEvent.startTime), "HH:mm")} – ${format(new Date(selectedEvent.endTime), "HH:mm")}`}
                </div>
                {selectedEvent.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    {selectedEvent.location}
                  </div>
                )}
                {selectedEvent.notes && (
                  <p className="text-sm text-muted-foreground">{selectedEvent.notes}</p>
                )}
                <Badge variant="outline" className="capitalize">{selectedEvent.projectSlug}</Badge>
                {conflictIds.has(selectedEvent.id) && (
                  <div className="flex items-center gap-2 text-amber-600 text-xs bg-amber-50 rounded-lg p-2">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    This event overlaps with another event
                  </div>
                )}
              </div>
              <DialogFooter>
                {deleteEvent && (
                  <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 gap-1.5" onClick={() => deleteEvent.mutate({ id: selectedEvent.id })}>
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                )}
                <Button variant="outline" onClick={() => setSelectedEvent(null)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
