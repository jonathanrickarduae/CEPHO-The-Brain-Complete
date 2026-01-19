import { useState, useMemo } from 'react';
import { 
  Calendar, Clock, Video, MessageSquare, 
  Plus, X, Bell, Check, ChevronLeft, ChevronRight,
  Users, Trash2, Edit2, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { allExperts, type AIExpert } from '@/data/aiExperts';
import { toast } from 'sonner';

interface ScheduledSession {
  id: string;
  expertId: string;
  type: 'chat' | 'video';
  date: Date;
  duration: number; // minutes
  topic: string;
  reminder: boolean;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export function ExpertScheduling() {
  const [sessions, setSessions] = useState<ScheduledSession[]>(() => {
    // Load from localStorage
    const saved = localStorage.getItem('expertSessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((s: any) => ({ ...s, date: new Date(s.date) }));
      } catch {
        return [];
      }
    }
    return [];
  });

  const [showScheduler, setShowScheduler] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<AIExpert | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [sessionType, setSessionType] = useState<'chat' | 'video'>('video');
  const [duration, setDuration] = useState(30);
  const [topic, setTopic] = useState('');
  const [reminder, setReminder] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Save sessions to localStorage
  const saveSessions = (newSessions: ScheduledSession[]) => {
    setSessions(newSessions);
    localStorage.setItem('expertSessions', JSON.stringify(newSessions));
  };

  // Get expert details
  const getExpert = (id: string) => allExperts.find(e => e.id === id);

  // Filter experts
  const filteredExperts = allExperts.filter(expert =>
    expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    expert.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Add padding for first week
    const startPadding = firstDay.getDay();
    for (let i = startPadding - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i));
    }

    // Add days of month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    // Add padding for last week
    const endPadding = 6 - lastDay.getDay();
    for (let i = 1; i <= endPadding; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  };

  const calendarDays = getDaysInMonth(currentMonth);

  // Get sessions for a specific date
  const getSessionsForDate = (date: Date) => {
    return sessions.filter(s => 
      s.date.toDateString() === date.toDateString() &&
      s.status !== 'cancelled'
    );
  };

  // Upcoming sessions
  const upcomingSessions = useMemo(() => {
    const now = new Date();
    return sessions
      .filter(s => s.date >= now && s.status === 'scheduled')
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5);
  }, [sessions]);

  // Schedule new session
  const scheduleSession = () => {
    if (!selectedExpert || !topic.trim()) {
      toast.error('Please select an expert and enter a topic');
      return;
    }

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const sessionDate = new Date(selectedDate);
    sessionDate.setHours(hours, minutes, 0, 0);

    if (sessionDate < new Date()) {
      toast.error('Cannot schedule sessions in the past');
      return;
    }

    const newSession: ScheduledSession = {
      id: `session-${Date.now()}`,
      expertId: selectedExpert.id,
      type: sessionType,
      date: sessionDate,
      duration,
      topic,
      reminder,
      status: 'scheduled'
    };

    saveSessions([...sessions, newSession]);
    toast.success(`Session scheduled with ${selectedExpert.name}`);
    
    // Reset form
    setShowScheduler(false);
    setSelectedExpert(null);
    setTopic('');
    setSearchQuery('');
  };

  // Cancel session
  const cancelSession = (sessionId: string) => {
    saveSessions(sessions.map(s => 
      s.id === sessionId ? { ...s, status: 'cancelled' as const } : s
    ));
    toast.success('Session cancelled');
  };

  // Time slots
  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
            <Calendar className="w-8 h-8 text-green-400" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold">Expert Scheduling</h2>
            <p className="text-muted-foreground">Book video calls and chat sessions with experts</p>
          </div>
        </div>
        <Button onClick={() => setShowScheduler(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Schedule Session
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="md:col-span-2 bg-card/60 border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {currentMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
              </CardTitle>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date())}
                >
                  Today
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, idx) => {
                const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                const isToday = date.toDateString() === new Date().toDateString();
                const isSelected = date.toDateString() === selectedDate.toDateString();
                const daySessions = getSessionsForDate(date);

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(date)}
                    className={`
                      relative p-2 min-h-[60px] rounded-lg text-sm transition-colors
                      ${isCurrentMonth ? 'hover:bg-secondary' : 'text-muted-foreground/50'}
                      ${isToday ? 'ring-2 ring-primary' : ''}
                      ${isSelected ? 'bg-primary/20' : ''}
                    `}
                  >
                    <span className={isToday ? 'font-bold text-primary' : ''}>
                      {date.getDate()}
                    </span>
                    {daySessions.length > 0 && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                        {daySessions.slice(0, 3).map((s, i) => (
                          <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${
                              s.type === 'video' ? 'bg-blue-500' : 'bg-green-500'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Sessions */}
        <Card className="bg-card/60 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="w-5 h-5 text-blue-500" />
              Upcoming Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingSessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No upcoming sessions</p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setShowScheduler(true)}
                  className="mt-2"
                >
                  Schedule your first session
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingSessions.map(session => {
                  const expert = getExpert(session.expertId);
                  if (!expert) return null;

                  return (
                    <div
                      key={session.id}
                      className="p-3 rounded-lg bg-secondary/50 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{expert.avatar}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{expert.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{session.topic}</div>
                        </div>
                        <Badge variant={session.type === 'video' ? 'default' : 'secondary'} className="text-xs">
                          {session.type === 'video' ? <Video className="w-3 h-3 mr-1" /> : <MessageSquare className="w-3 h-3 mr-1" />}
                          {session.type}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {session.date.toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' })}
                          {' • '}
                          {session.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span>{session.duration} min</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="default" className="flex-1 text-xs h-7">
                          Join
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs h-7"
                          onClick={() => cancelSession(session.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Selected Date Sessions */}
      {getSessionsForDate(selectedDate).length > 0 && (
        <Card className="bg-card/60 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Sessions on {selectedDate.toLocaleDateString('en-GB', { weekday: 'long', month: 'long', day: 'numeric' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {getSessionsForDate(selectedDate).map(session => {
                const expert = getExpert(session.expertId);
                if (!expert) return null;

                return (
                  <div
                    key={session.id}
                    className="p-4 rounded-lg border border-border bg-background"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-2xl">
                        {expert.avatar}
                      </div>
                      <div>
                        <div className="font-medium">{expert.name}</div>
                        <div className="text-sm text-muted-foreground">{expert.specialty}</div>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        {session.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        <span className="text-muted-foreground">({session.duration} min)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {session.type === 'video' ? (
                          <Video className="w-4 h-4 text-blue-500" />
                        ) : (
                          <MessageSquare className="w-4 h-4 text-green-500" />
                        )}
                        <span className="capitalize">{session.type} Session</span>
                      </div>
                      <div className="text-muted-foreground">{session.topic}</div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" className="flex-1">Join Session</Button>
                      <Button size="sm" variant="outline" onClick={() => cancelSession(session.id)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule Modal */}
      {showScheduler && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Schedule Expert Session</CardTitle>
                <button
                  onClick={() => setShowScheduler(false)}
                  className="p-1 hover:bg-secondary rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <ScrollArea className="flex-1">
              <CardContent className="space-y-4">
                {/* Expert Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Expert</label>
                  {selectedExpert ? (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <span className="text-2xl">{selectedExpert.avatar}</span>
                      <div className="flex-1">
                        <div className="font-medium">{selectedExpert.name}</div>
                        <div className="text-sm text-muted-foreground">{selectedExpert.specialty}</div>
                      </div>
                      <button
                        onClick={() => setSelectedExpert(null)}
                        className="p-1 hover:bg-secondary rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search experts..."
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 mb-2"
                      />
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {filteredExperts.slice(0, 10).map(expert => (
                          <button
                            key={expert.id}
                            onClick={() => {
                              setSelectedExpert(expert);
                              setSearchQuery('');
                            }}
                            className="w-full flex items-center gap-2 p-2 rounded hover:bg-secondary transition-colors text-left"
                          >
                            <span className="text-lg">{expert.avatar}</span>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{expert.name}</div>
                              <div className="text-xs text-muted-foreground truncate">{expert.specialty}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Session Type */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Session Type</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSessionType('video')}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                        sessionType === 'video'
                          ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                          : 'border-border hover:bg-secondary'
                      }`}
                    >
                      <Video className="w-5 h-5" />
                      Video Call
                    </button>
                    <button
                      onClick={() => setSessionType('chat')}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                        sessionType === 'chat'
                          ? 'bg-green-500/20 border-green-500/50 text-green-400'
                          : 'border-border hover:bg-secondary'
                      }`}
                    >
                      <MessageSquare className="w-5 h-5" />
                      Chat Session
                    </button>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Date</label>
                    <input
                      type="date"
                      value={selectedDate.toISOString().split('T')[0]}
                      onChange={(e) => setSelectedDate(new Date(e.target.value))}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Time</label>
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      {timeSlots.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Duration</label>
                  <div className="flex gap-2">
                    {[15, 30, 45, 60].map(mins => (
                      <button
                        key={mins}
                        onClick={() => setDuration(mins)}
                        className={`flex-1 py-2 rounded-lg border transition-colors ${
                          duration === mins
                            ? 'bg-primary/20 border-primary/50 text-primary'
                            : 'border-border hover:bg-secondary'
                        }`}
                      >
                        {mins} min
                      </button>
                    ))}
                  </div>
                </div>

                {/* Topic */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Topic / Agenda</label>
                  <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="What would you like to discuss?"
                    rows={3}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>

                {/* Reminder */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reminder}
                    onChange={(e) => setReminder(e.target.checked)}
                    className="w-4 h-4 rounded border-border"
                  />
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Send me a reminder 15 minutes before</span>
                </label>
              </CardContent>
            </ScrollArea>
            <div className="p-4 border-t border-border">
              <Button onClick={scheduleSession} className="w-full gap-2">
                <Check className="w-4 h-4" />
                Schedule Session
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
