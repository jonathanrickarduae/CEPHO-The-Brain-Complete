import { useState } from 'react';
import { 
  Eye, EyeOff, Clock, Shield, Zap, BarChart3,
  Settings, Play, Pause, AlertTriangle, CheckCircle2,
  Monitor, Smartphone, Globe, Lock, TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface AppUsage {
  name: string;
  icon: string;
  category: 'productivity' | 'communication' | 'entertainment' | 'other';
  timeToday: number; // minutes
  efficiency: number; // 0-100
  trend: 'up' | 'down' | 'stable';
  insights: string[];
}

interface PrivacySettings {
  excludedApps: string[];
  autoPauseOnSensitive: boolean;
  incognitoMode: boolean;
  workHoursOnly: boolean;
  workHoursStart: string;
  workHoursEnd: string;
}

// Mock data
const MOCK_APP_USAGE: AppUsage[] = [
  {
    name: 'VS Code',
    icon: '💻',
    category: 'productivity',
    timeToday: 185,
    efficiency: 92,
    trend: 'up',
    insights: ['Peak productivity: 9-11am', 'Consider using keyboard shortcuts more']
  },
  {
    name: 'Slack',
    icon: '💬',
    category: 'communication',
    timeToday: 78,
    efficiency: 65,
    trend: 'down',
    insights: ['High context-switching detected', 'Try batching message checks']
  },
  {
    name: 'Chrome',
    icon: '🌐',
    category: 'productivity',
    timeToday: 142,
    efficiency: 71,
    trend: 'stable',
    insights: ['Research sessions averaging 25 min', '15% time on non-work sites']
  },
  {
    name: 'Notion',
    icon: '📝',
    category: 'productivity',
    timeToday: 45,
    efficiency: 88,
    trend: 'up',
    insights: ['Great for documentation', 'Consider templates for faster creation']
  },
  {
    name: 'Zoom',
    icon: '📹',
    category: 'communication',
    timeToday: 95,
    efficiency: 78,
    trend: 'stable',
    insights: ['3 meetings today', 'Average meeting: 32 min']
  }
];

export function ActiveLearningMode() {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    excludedApps: ['1Password', 'Banking App'],
    autoPauseOnSensitive: true,
    incognitoMode: false,
    workHoursOnly: true,
    workHoursStart: '09:00',
    workHoursEnd: '18:00'
  });
  const [showSettings, setShowSettings] = useState(false);
  const [appUsage] = useState<AppUsage[]>(MOCK_APP_USAGE);

  const handleToggleActive = () => {
    setIsActive(!isActive);
    toast.success(isActive ? 'Active Learning paused' : 'Active Learning enabled');
  };

  const handleTogglePause = () => {
    setIsPaused(!isPaused);
    toast.info(isPaused ? 'Observation resumed' : 'Observation paused for 30 minutes');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'productivity': return 'bg-green-500/20 text-green-400';
      case 'communication': return 'bg-blue-500/20 text-blue-400';
      case 'entertainment': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-gray-500/20 text-foreground/70';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-green-400" />;
      case 'down': return <TrendingUp className="w-3 h-3 text-red-400 rotate-180" />;
      default: return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
    }
  };

  const totalProductiveTime = appUsage
    .filter(a => a.category === 'productivity')
    .reduce((sum, a) => sum + a.timeToday, 0);
  
  const avgEfficiency = Math.round(
    appUsage.reduce((sum, a) => sum + a.efficiency, 0) / appUsage.length
  );

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <Card className="bg-card/60 border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                isActive && !isPaused ? 'bg-green-500/20' : 'bg-gray-500/20'
              }`}>
                {isActive && !isPaused ? (
                  <Eye className="w-6 h-6 text-green-400" />
                ) : (
                  <EyeOff className="w-6 h-6 text-foreground/70" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Active Learning Mode</h2>
                <p className="text-sm text-muted-foreground">
                  {isActive && !isPaused ? 'Learning from your workflow' : 
                   isPaused ? 'Temporarily paused' : 'Not active'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isActive && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleTogglePause}
                >
                  {isPaused ? <Play className="w-4 h-4 mr-1" /> : <Pause className="w-4 h-4 mr-1" />}
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
              )}
              <Switch checked={isActive} onCheckedChange={handleToggleActive} />
            </div>
          </div>

          {isActive && (
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-background/50 rounded-lg">
                <div className="text-2xl font-bold text-foreground">{Math.round(totalProductiveTime / 60)}h {totalProductiveTime % 60}m</div>
                <div className="text-xs text-muted-foreground">Productive Time</div>
              </div>
              <div className="text-center p-3 bg-background/50 rounded-lg">
                <div className="text-2xl font-bold text-foreground">{avgEfficiency}%</div>
                <div className="text-xs text-muted-foreground">Avg Efficiency</div>
              </div>
              <div className="text-center p-3 bg-background/50 rounded-lg">
                <div className="text-2xl font-bold text-foreground">{appUsage.length}</div>
                <div className="text-xs text-muted-foreground">Apps Tracked</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Privacy Controls */}
      <Card className="bg-card/60 border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-foreground text-base">
              <Shield className="w-4 h-4 text-primary" />
              Privacy Controls
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)}>
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground">Auto-pause on sensitive apps</span>
            </div>
            <Switch 
              checked={privacySettings.autoPauseOnSensitive}
              onCheckedChange={(checked) => setPrivacySettings(prev => ({
                ...prev, autoPauseOnSensitive: checked
              }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground">Incognito mode</span>
            </div>
            <Switch 
              checked={privacySettings.incognitoMode}
              onCheckedChange={(checked) => setPrivacySettings(prev => ({
                ...prev, incognitoMode: checked
              }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground">Work hours only ({privacySettings.workHoursStart} - {privacySettings.workHoursEnd})</span>
            </div>
            <Switch 
              checked={privacySettings.workHoursOnly}
              onCheckedChange={(checked) => setPrivacySettings(prev => ({
                ...prev, workHoursOnly: checked
              }))}
            />
          </div>
          
          {privacySettings.excludedApps.length > 0 && (
            <div className="pt-2">
              <span className="text-xs text-muted-foreground">Excluded apps:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {privacySettings.excludedApps.map((app) => (
                  <Badge key={app} variant="secondary" className="text-xs">
                    {app}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* App Usage Analytics */}
      {isActive && (
        <Card className="bg-card/60 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-foreground text-base">
              <BarChart3 className="w-4 h-4 text-primary" />
              App Usage Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {appUsage.map((app) => (
              <div key={app.name} className="p-3 bg-background/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{app.icon}</span>
                    <div>
                      <span className="font-medium text-foreground">{app.name}</span>
                      <Badge variant="secondary" className={`ml-2 text-xs ${getCategoryColor(app.category)}`}>
                        {app.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(app.trend)}
                    <span className="text-sm text-muted-foreground">
                      {Math.floor(app.timeToday / 60)}h {app.timeToday % 60}m
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-muted-foreground">Efficiency:</span>
                  <Progress value={app.efficiency} className="flex-1 h-2" />
                  <span className={`text-xs font-medium ${
                    app.efficiency >= 80 ? 'text-green-400' :
                    app.efficiency >= 60 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>{app.efficiency}%</span>
                </div>
                {app.insights.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    <Zap className="w-3 h-3 inline mr-1 text-primary" />
                    {app.insights[0]}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Efficiency Insights */}
      {isActive && (
        <Card className="bg-card/60 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-foreground text-base">
              <Zap className="w-4 h-4 text-primary" />
              Efficiency Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-start gap-2 p-2 bg-yellow-500/10 rounded text-sm">
              <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
              <div>
                <span className="font-medium text-foreground">Context switching detected</span>
                <p className="text-muted-foreground">You switched between Slack and VS Code 12 times in the last hour. Consider batching communication.</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-2 bg-green-500/10 rounded text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5" />
              <div>
                <span className="font-medium text-foreground">Deep work session achieved</span>
                <p className="text-muted-foreground">45-minute uninterrupted coding session this morning. Your most productive time is 9-11am.</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-2 bg-blue-500/10 rounded text-sm">
              <TrendingUp className="w-4 h-4 text-blue-400 mt-0.5" />
              <div>
                <span className="font-medium text-foreground">Efficiency improving</span>
                <p className="text-muted-foreground">Your overall efficiency is up 8% compared to last week. Keep it up!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Desktop App Notice */}
      {!isActive && (
        <Card className="bg-card/60 border-border border-dashed">
          <CardContent className="p-4 text-center">
            <Monitor className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <h3 className="font-medium text-foreground mb-1">Desktop App Required</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Active Learning Mode requires the desktop app for screen observation.
              Install it to unlock workflow optimization features.
            </p>
            <Button variant="outline" size="sm">
              Download Desktop App
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ActiveLearningMode;
