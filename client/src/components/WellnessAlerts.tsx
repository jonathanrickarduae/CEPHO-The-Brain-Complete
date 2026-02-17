import { useState } from 'react';
import { 
  AlertTriangle, Heart, Brain, Moon, Sun, Coffee,
  TrendingDown, TrendingUp, Activity, Clock, Zap,
  Shield, CheckCircle2, XCircle, Bell, BellOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface StressIndicator {
  id: string;
  name: string;
  value: number;
  threshold: number;
  trend: 'up' | 'down' | 'stable';
  status: 'healthy' | 'warning' | 'critical';
  description: string;
}

interface BurnoutAlert {
  id: string;
  type: 'workload' | 'sleep' | 'breaks' | 'overtime' | 'meetings';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  recommendation: string;
  timestamp: string;
  dismissed: boolean;
}

interface WellnessSettings {
  enableAlerts: boolean;
  workHoursLimit: number;
  breakReminders: boolean;
  sleepTracking: boolean;
  meetingLoadAlerts: boolean;
}

// Mock data
const MOCK_INDICATORS: StressIndicator[] = [
  {
    id: 's1',
    name: 'Work Hours This Week',
    value: 52,
    threshold: 45,
    trend: 'up',
    status: 'warning',
    description: '7 hours over recommended limit'
  },
  {
    id: 's2',
    name: 'Meeting Load',
    value: 65,
    threshold: 50,
    trend: 'up',
    status: 'warning',
    description: '65% of work time in meetings'
  },
  {
    id: 's3',
    name: 'Break Frequency',
    value: 3,
    threshold: 6,
    trend: 'down',
    status: 'critical',
    description: 'Only 3 breaks today vs recommended 6'
  },
  {
    id: 's4',
    name: 'Sleep Quality',
    value: 72,
    threshold: 75,
    trend: 'stable',
    status: 'healthy',
    description: 'Based on self-reported data'
  },
  {
    id: 's5',
    name: 'Focus Time',
    value: 4.2,
    threshold: 4,
    trend: 'up',
    status: 'healthy',
    description: '4.2 hours of deep work today'
  }
];

const MOCK_ALERTS: BurnoutAlert[] = [
  {
    id: 'a1',
    type: 'overtime',
    severity: 'high',
    title: 'Extended Work Hours Detected',
    description: 'You\'ve worked more than 10 hours for 3 consecutive days.',
    recommendation: 'Consider ending your workday earlier tomorrow. Schedule a recovery day this week.',
    timestamp: '2 hours ago',
    dismissed: false
  },
  {
    id: 'a2',
    type: 'meetings',
    severity: 'medium',
    title: 'Meeting Overload',
    description: 'You have 6 meetings scheduled tomorrow totaling 5.5 hours.',
    recommendation: 'Try to consolidate or reschedule 2 meetings. Block 2 hours for focused work.',
    timestamp: '4 hours ago',
    dismissed: false
  },
  {
    id: 'a3',
    type: 'breaks',
    severity: 'medium',
    title: 'Insufficient Breaks',
    description: 'You\'ve been working for 3 hours without a break.',
    recommendation: 'Take a 10-minute walk or stretch. Your productivity will improve.',
    timestamp: '30 minutes ago',
    dismissed: false
  }
];

export function WellnessAlerts() {
  const [indicators] = useState<StressIndicator[]>(MOCK_INDICATORS);
  const [alerts, setAlerts] = useState<BurnoutAlert[]>(MOCK_ALERTS);
  const [settings, setSettings] = useState<WellnessSettings>({
    enableAlerts: true,
    workHoursLimit: 45,
    breakReminders: true,
    sleepTracking: true,
    meetingLoadAlerts: true
  });
  const [showSettings, setShowSettings] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400 bg-green-500/20';
      case 'warning': return 'text-yellow-400 bg-yellow-500/20';
      case 'critical': return 'text-red-400 bg-red-500/20';
      default: return 'text-foreground/70 bg-gray-500/20';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'workload': return Clock;
      case 'sleep': return Moon;
      case 'breaks': return Coffee;
      case 'overtime': return AlertTriangle;
      case 'meetings': return Activity;
      default: return AlertTriangle;
    }
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, dismissed: true } : a
    ));
    toast.success('Alert dismissed');
  };

  const activeAlerts = alerts.filter(a => !a.dismissed);
  const overallScore = Math.round(
    indicators.filter(i => i.status === 'healthy').length / indicators.length * 100
  );

  return (
    <div className="space-y-4">
      {/* Overall Wellness Score */}
      <Card className="bg-card/60 border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                overallScore >= 80 ? 'bg-green-500/20' :
                overallScore >= 60 ? 'bg-yellow-500/20' :
                'bg-red-500/20'
              }`}>
                <Heart className={`w-6 h-6 ${
                  overallScore >= 80 ? 'text-green-400' :
                  overallScore >= 60 ? 'text-yellow-400' :
                  'text-red-400'
                }`} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Wellness Score</h2>
                <p className="text-sm text-muted-foreground">
                  {overallScore >= 80 ? 'You\'re doing great!' :
                   overallScore >= 60 ? 'Some areas need attention' :
                   'Take care of yourself'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${
                overallScore >= 80 ? 'text-green-400' :
                overallScore >= 60 ? 'text-yellow-400' :
                'text-red-400'
              }`}>{overallScore}%</div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowSettings(!showSettings)}
              >
                {settings.enableAlerts ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <Progress value={overallScore} className="h-2" />
        </CardContent>
      </Card>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="bg-card/60 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground">Alert Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Enable wellness alerts</span>
              <Switch 
                checked={settings.enableAlerts}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev, enableAlerts: checked
                }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Break reminders</span>
              <Switch 
                checked={settings.breakReminders}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev, breakReminders: checked
                }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Meeting load alerts</span>
              <Switch 
                checked={settings.meetingLoadAlerts}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev, meetingLoadAlerts: checked
                }))}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <Card className="bg-card/60 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-foreground text-base">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              Burnout Prevention Alerts ({activeAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeAlerts.map((alert) => {
              const AlertIcon = getAlertIcon(alert.type);
              return (
                <div 
                  key={alert.id}
                  className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertIcon className="w-4 h-4" />
                      <span className="font-medium text-foreground">{alert.title}</span>
                      <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => dismissAlert(alert.id)}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                  <div className="flex items-start gap-2 p-2 bg-primary/10 rounded text-sm">
                    <Zap className="w-4 h-4 text-primary mt-0.5" />
                    <span className="text-foreground">{alert.recommendation}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">{alert.timestamp}</div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Stress Indicators */}
      <Card className="bg-card/60 border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-foreground text-base">
            <Activity className="w-4 h-4 text-primary" />
            Stress Indicators
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {indicators.map((indicator) => (
            <div key={indicator.id} className="p-3 bg-background/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{indicator.name}</span>
                  {indicator.trend === 'up' && <TrendingUp className="w-3 h-3 text-red-400" />}
                  {indicator.trend === 'down' && <TrendingDown className="w-3 h-3 text-green-400" />}
                </div>
                <Badge variant="outline" className={getStatusColor(indicator.status)}>
                  {indicator.status === 'healthy' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                  {indicator.status === 'warning' && <AlertTriangle className="w-3 h-3 mr-1" />}
                  {indicator.status === 'critical' && <XCircle className="w-3 h-3 mr-1" />}
                  {indicator.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <Progress 
                  value={typeof indicator.value === 'number' && indicator.threshold > 0 
                    ? Math.min((indicator.value / indicator.threshold) * 100, 100) 
                    : 0
                  } 
                  className="flex-1 h-2" 
                />
                <span className="text-sm font-medium text-foreground min-w-[60px] text-right">
                  {indicator.value} / {indicator.threshold}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{indicator.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-card/60 border-border">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <Coffee className="w-4 h-4 mr-2" />
              Take a Break
            </Button>
            <Button variant="outline" size="sm">
              <Moon className="w-4 h-4 mr-2" />
              End Workday
            </Button>
            <Button variant="outline" size="sm">
              <Shield className="w-4 h-4 mr-2" />
              Block Focus Time
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default WellnessAlerts;
