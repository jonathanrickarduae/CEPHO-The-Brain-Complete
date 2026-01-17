import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Calendar, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  ExternalLink,
  Clock,
  Loader2
} from "lucide-react";

// Google Calendar OAuth URL (would be configured in production)
const GOOGLE_OAUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const OUTLOOK_OAUTH_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";

export function CalendarSettings() {
  const [autoSync, setAutoSync] = useState(true);
  const [syncInterval, setSyncInterval] = useState(15);

  // Get integration status
  const { data: integrationStatus, refetch: refetchStatus } = trpc.calendar.getIntegrationStatus.useQuery();
  
  // Get today's calendar summary
  const { data: todaySummary } = trpc.calendar.getTodaySummary.useQuery();

  // Sync mutation
  const syncMutation = trpc.calendar.sync.useMutation({
    onSuccess: (data: { eventsAdded: number }) => {
      toast.success(`Synced ${data.eventsAdded} events from calendar`);
      refetchStatus();
    },
    onError: (error: { message: string }) => toast.error(error.message),
  });

  const handleGoogleConnect = () => {
    // In production, this would redirect to Google OAuth
    // For now, show a toast explaining the setup
    toast.info(
      "To connect Google Calendar, you'll need to set up OAuth credentials in the Google Cloud Console and configure the callback URL.",
      { duration: 5000 }
    );
    
    // Would redirect to:
    // const params = new URLSearchParams({
    //   client_id: process.env.GOOGLE_CLIENT_ID,
    //   redirect_uri: `${window.location.origin}/api/oauth/google/callback`,
    //   response_type: 'code',
    //   scope: 'https://www.googleapis.com/auth/calendar.readonly',
    //   access_type: 'offline',
    //   prompt: 'consent',
    // });
    // window.location.href = `${GOOGLE_OAUTH_URL}?${params}`;
  };

  const handleOutlookConnect = () => {
    // In production, this would redirect to Microsoft OAuth
    toast.info(
      "To connect Outlook Calendar, you'll need to register an app in Azure AD and configure the callback URL.",
      { duration: 5000 }
    );
  };

  const handleManualSync = () => {
    if (integrationStatus?.google.connected) {
      syncMutation.mutate({ provider: "google" });
    } else if (integrationStatus?.outlook.connected) {
      syncMutation.mutate({ provider: "outlook" });
    } else {
      toast.error("No calendar connected. Please connect a calendar first.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Connections */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-cyan-400" />
            Calendar Connections
          </CardTitle>
          <CardDescription>
            Connect your calendar to enable smart scheduling and conflict detection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Google Calendar */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/30">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-white">
                <svg className="h-6 w-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-foreground">Google Calendar</h4>
                <p className="text-sm text-muted-foreground">
                  {integrationStatus?.google.connected 
                    ? "Connected and syncing" 
                    : "Not connected"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {integrationStatus?.google.connected ? (
                <>
                  <Badge className="bg-green-500/20 text-green-400">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                  <Button variant="outline" size="sm" onClick={handleGoogleConnect}>
                    Reconnect
                  </Button>
                </>
              ) : (
                <Button onClick={handleGoogleConnect} className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Connect
                </Button>
              )}
            </div>
          </div>

          {/* Outlook Calendar */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/30">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-[#0078D4]">
                <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.88 12.04q0 .45-.11.87-.1.41-.33.74-.22.33-.58.52-.37.2-.87.2t-.85-.2q-.35-.21-.57-.55-.22-.33-.33-.75-.1-.42-.1-.86t.1-.87q.1-.43.34-.76.22-.34.59-.54.36-.2.87-.2t.86.2q.35.21.57.55.22.34.31.77.1.43.1.88zM24 12v9.38q0 .46-.33.8-.33.32-.8.32H7.13q-.46 0-.8-.33-.32-.33-.32-.8V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h6.5V2.55q0-.44.3-.75.3-.3.75-.3h12.9q.44 0 .75.3.3.3.3.75V12zm-6-8.25v3h3v-3zm0 4.5v3h3v-3zm0 4.5v1.83l3.05-1.83zm-5.25-9v3h3.75v-3zm0 4.5v3h3.75v-3zm0 4.5v2.03l2.41 1.5 1.34-.8v-2.73zM9 3.75V6h2l.13.01.12.04v-2.3zM5.98 15.98q.9 0 1.6-.3.7-.32 1.19-.86.48-.55.73-1.28.25-.74.25-1.61 0-.83-.25-1.55-.24-.71-.71-1.24t-1.15-.83q-.68-.3-1.55-.3-.92 0-1.64.3-.71.3-1.2.85-.5.54-.75 1.3-.25.74-.25 1.63 0 .85.26 1.56.26.72.74 1.23.48.52 1.17.81.69.3 1.56.3zM7.5 21h12.39L12 16.08V17q0 .41-.3.7-.29.3-.7.3H7.5zm15-.13v-7.24l-5.9 3.54Z"/>
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-foreground">Outlook Calendar</h4>
                <p className="text-sm text-muted-foreground">
                  {integrationStatus?.outlook.connected 
                    ? "Connected and syncing" 
                    : "Not connected"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {integrationStatus?.outlook.connected ? (
                <>
                  <Badge className="bg-green-500/20 text-green-400">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                  <Button variant="outline" size="sm" onClick={handleOutlookConnect}>
                    Reconnect
                  </Button>
                </>
              ) : (
                <Button onClick={handleOutlookConnect} className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Connect
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sync Settings */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-cyan-400" />
            Sync Settings
          </CardTitle>
          <CardDescription>
            Configure how often your calendar syncs with CEPHO
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-sync" className="text-foreground">Automatic Sync</Label>
              <p className="text-sm text-muted-foreground">
                Automatically sync calendar every {syncInterval} minutes
              </p>
            </div>
            <Switch 
              id="auto-sync" 
              checked={autoSync} 
              onCheckedChange={setAutoSync}
            />
          </div>

          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={handleManualSync}
              disabled={syncMutation.isPending}
              className="gap-2"
            >
              {syncMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Sync Now
            </Button>
            <span className="text-sm text-muted-foreground">
              Last synced: {todaySummary ? "Recently" : "Never"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Today's Schedule Summary */}
      {todaySummary && (
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-cyan-400" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-lg bg-card/30 border border-border">
                <p className="text-2xl font-bold text-foreground">{todaySummary.totalEvents}</p>
                <p className="text-sm text-muted-foreground">Total Events</p>
              </div>
              <div className="p-4 rounded-lg bg-card/30 border border-border">
                <p className="text-2xl font-bold text-foreground">{todaySummary.busyHours.toFixed(1)}h</p>
                <p className="text-sm text-muted-foreground">Busy Hours</p>
              </div>
              <div className="p-4 rounded-lg bg-card/30 border border-border">
                <p className="text-2xl font-bold text-foreground">{(8 - todaySummary.busyHours).toFixed(1)}h</p>
                <p className="text-sm text-muted-foreground">Free Hours</p>
              </div>
            </div>
            {todaySummary.nextEvent && (
              <div className="mt-4 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <p className="text-sm text-muted-foreground">Next Event</p>
                <p className="font-medium text-foreground">{todaySummary.nextEvent.title}</p>
                <p className="text-sm text-cyan-400">
                  {new Date(todaySummary.nextEvent.startTime).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
