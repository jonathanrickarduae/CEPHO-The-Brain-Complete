import { useState } from 'react';
import { 
  Calendar, Check, X, RefreshCw, 
  Settings, ChevronRight, ExternalLink,
  Clock, Users, Video
} from 'lucide-react';

interface CalendarAccount {
  id: string;
  email: string;
  provider: 'google' | 'microsoft' | 'apple';
  connected: boolean;
  lastSync?: Date;
  calendars: {
    id: string;
    name: string;
    color: string;
    enabled: boolean;
  }[];
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  calendar: string;
  attendees?: number;
  isVideoCall?: boolean;
}

export function CalendarIntegration() {
  const [accounts, setAccounts] = useState<CalendarAccount[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const connectGoogle = async () => {
    setConnecting('google');
    
    // In production, this would redirect to Google OAuth
    // For demo, we'll simulate the connection
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newAccount: CalendarAccount = {
      id: 'google-1',
      email: 'user@gmail.com',
      provider: 'google',
      connected: true,
      lastSync: new Date(),
      calendars: [
        { id: 'primary', name: 'Primary Calendar', color: '#4285f4', enabled: true },
        { id: 'work', name: 'Work', color: '#0f9d58', enabled: true },
        { id: 'personal', name: 'Personal', color: '#db4437', enabled: false },
      ],
    };
    
    setAccounts([...accounts, newAccount]);
    setConnecting(null);
  };

  const connectMicrosoft = async () => {
    setConnecting('microsoft');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newAccount: CalendarAccount = {
      id: 'microsoft-1',
      email: 'user@outlook.com',
      provider: 'microsoft',
      connected: true,
      lastSync: new Date(),
      calendars: [
        { id: 'calendar', name: 'Calendar', color: '#0078d4', enabled: true },
      ],
    };
    
    setAccounts([...accounts, newAccount]);
    setConnecting(null);
  };

  const disconnectAccount = (accountId: string) => {
    setAccounts(accounts.filter(a => a.id !== accountId));
  };

  const toggleCalendar = (accountId: string, calendarId: string) => {
    setAccounts(accounts.map(account => {
      if (account.id === accountId) {
        return {
          ...account,
          calendars: account.calendars.map(cal => 
            cal.id === calendarId ? { ...cal, enabled: !cal.enabled } : cal
          ),
        };
      }
      return account;
    }));
  };

  const syncNow = async () => {
    setSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setAccounts(accounts.map(a => ({ ...a, lastSync: new Date() })));
    setSyncing(false);
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'google':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        );
      case 'microsoft':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#f25022" d="M1 1h10v10H1z"/>
            <path fill="#00a4ef" d="M1 13h10v10H1z"/>
            <path fill="#7fba00" d="M13 1h10v10H13z"/>
            <path fill="#ffb900" d="M13 13h10v10H13z"/>
          </svg>
        );
      case 'apple':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
        );
      default:
        return <Calendar className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-cyan-400" />
          Calendar Integration
        </h3>
        {accounts.length > 0 && (
          <button
            onClick={syncNow}
            disabled={syncing}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-foreground/80 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Now'}
          </button>
        )}
      </div>

      {/* Connected Accounts */}
      {accounts.length > 0 && (
        <div className="space-y-4 mb-6">
          {accounts.map(account => (
            <div key={account.id} className="bg-gray-900 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getProviderIcon(account.provider)}
                  <div>
                    <div className="font-medium text-white">{account.email}</div>
                    <div className="text-xs text-foreground/60">
                      Last synced: {account.lastSync?.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => disconnectAccount(account.id)}
                  className="p-2 rounded-lg hover:bg-gray-800 text-foreground/70 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Calendars */}
              <div className="space-y-2">
                {account.calendars.map(calendar => (
                  <label
                    key={calendar.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={calendar.enabled}
                      onChange={() => toggleCalendar(account.id, calendar.id)}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-cyan-500 focus:ring-cyan-500"
                    />
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: calendar.color }}
                    />
                    <span className="text-sm text-foreground/80">{calendar.name}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Connect Buttons */}
      <div className="space-y-3">
        {!accounts.find(a => a.provider === 'google') && (
          <button
            onClick={connectGoogle}
            disabled={connecting === 'google'}
            className="w-full flex items-center justify-between p-4 bg-gray-900 hover:bg-gray-850 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              {getProviderIcon('google')}
              <span className="text-white">Connect Google Calendar</span>
            </div>
            {connecting === 'google' ? (
              <RefreshCw className="w-5 h-5 text-foreground/70 animate-spin" />
            ) : (
              <ChevronRight className="w-5 h-5 text-foreground/70" />
            )}
          </button>
        )}

        {!accounts.find(a => a.provider === 'microsoft') && (
          <button
            onClick={connectMicrosoft}
            disabled={connecting === 'microsoft'}
            className="w-full flex items-center justify-between p-4 bg-gray-900 hover:bg-gray-850 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              {getProviderIcon('microsoft')}
              <span className="text-white">Connect Outlook Calendar</span>
            </div>
            {connecting === 'microsoft' ? (
              <RefreshCw className="w-5 h-5 text-foreground/70 animate-spin" />
            ) : (
              <ChevronRight className="w-5 h-5 text-foreground/70" />
            )}
          </button>
        )}
      </div>

      {/* Info */}
      <p className="text-xs text-foreground/60 mt-4">
        Connect your calendars to enable smart scheduling, meeting prep, and automatic time blocking.
      </p>
    </div>
  );
}

// Upcoming events widget
export function UpcomingEvents() {
  const [events] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Team Standup',
      start: new Date(Date.now() + 30 * 60000),
      end: new Date(Date.now() + 45 * 60000),
      calendar: 'Work',
      attendees: 5,
      isVideoCall: true,
    },
    {
      id: '2',
      title: 'Product Review',
      start: new Date(Date.now() + 120 * 60000),
      end: new Date(Date.now() + 180 * 60000),
      calendar: 'Work',
      attendees: 8,
      isVideoCall: true,
    },
    {
      id: '3',
      title: 'Focus Time',
      start: new Date(Date.now() + 240 * 60000),
      end: new Date(Date.now() + 360 * 60000),
      calendar: 'Primary',
    },
  ]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTimeUntil = (date: Date) => {
    const diff = date.getTime() - Date.now();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `in ${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `in ${hours}h ${minutes % 60}m`;
  };

  return (
    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-400" />
          Upcoming
        </h3>
        <a href="#" className="text-sm text-cyan-400 hover:text-cyan-300">
          View all
        </a>
      </div>

      <div className="space-y-3">
        {events.map((event, index) => (
          <div
            key={event.id}
            className={`p-3 rounded-xl ${
              index === 0 ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-gray-900'
            }`}
          >
            <div className="flex items-start justify-between mb-1">
              <div className="font-medium text-white">{event.title}</div>
              <div className={`text-xs ${index === 0 ? 'text-cyan-400' : 'text-foreground/60'}`}>
                {getTimeUntil(event.start)}
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-foreground/70">
              <span>{formatTime(event.start)} - {formatTime(event.end)}</span>
              {event.attendees && (
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {event.attendees}
                </span>
              )}
              {event.isVideoCall && (
                <Video className="w-3 h-3 text-blue-400" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
