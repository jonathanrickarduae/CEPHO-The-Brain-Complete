import { useState } from 'react';
import { 
  AlertTriangle, Shield, Trash2, Lock, Smartphone,
  Monitor, Globe, CheckCircle2, XCircle, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Device {
  id: string;
  name: string;
  type: 'mobile' | 'desktop' | 'browser';
  lastActive: string;
  location: string;
  status: 'active' | 'inactive' | 'wiped';
  isCurrent: boolean;
}

// Mock data
const MOCK_DEVICES: Device[] = [
  {
    id: 'd1',
    name: 'MacBook Pro',
    type: 'desktop',
    lastActive: 'Now',
    location: 'London, UK',
    status: 'active',
    isCurrent: true
  },
  {
    id: 'd2',
    name: 'iPhone 15 Pro',
    type: 'mobile',
    lastActive: '2 hours ago',
    location: 'London, UK',
    status: 'active',
    isCurrent: false
  },
  {
    id: 'd3',
    name: 'Chrome on Windows',
    type: 'browser',
    lastActive: '3 days ago',
    location: 'Dubai, UAE',
    status: 'inactive',
    isCurrent: false
  }
];

export function RemoteWipe() {
  const [devices, setDevices] = useState<Device[]>(MOCK_DEVICES);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [wipeTarget, setWipeTarget] = useState<'all' | string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile': return Smartphone;
      case 'desktop': return Monitor;
      default: return Globe;
    }
  };

  const handleWipeDevice = async (deviceId: string) => {
    setWipeTarget(deviceId);
    setShowConfirm(true);
  };

  const handleWipeAll = () => {
    setWipeTarget('all');
    setShowConfirm(true);
  };

  const confirmWipe = async () => {
    if (confirmText !== 'WIPE') {
      toast.error('Please type WIPE to confirm');
      return;
    }

    setIsProcessing(true);
    
    // Simulate wipe process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (wipeTarget === 'all') {
      setDevices(prev => prev.map(d => ({ ...d, status: 'wiped' as const })));
      toast.success('All devices wiped successfully');
    } else {
      setDevices(prev => prev.map(d => 
        d.id === wipeTarget ? { ...d, status: 'wiped' as const } : d
      ));
      toast.success('Device wiped successfully');
    }
    
    setIsProcessing(false);
    setShowConfirm(false);
    setConfirmText('');
    setWipeTarget(null);
  };

  const handleRevokeSession = (deviceId: string) => {
    setDevices(prev => prev.map(d => 
      d.id === deviceId ? { ...d, status: 'inactive' as const } : d
    ));
    toast.success('Session revoked');
  };

  const activeDevices = devices.filter(d => d.status === 'active');

  return (
    <div className="space-y-4">
      {/* Warning Banner */}
      <Card className="bg-red-500/10 border-red-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-400">Emergency Security Controls</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Use these controls if you suspect unauthorized access or lose a device. 
                Remote wipe will permanently delete all local data and cached credentials.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kill Switch */}
      <Card className="bg-card/60 border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-foreground text-base">
            <Shield className="w-4 h-4 text-red-400" />
            Kill Switch
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Immediately revoke all sessions and wipe data from all devices. 
            You will need to re-authenticate on each device.
          </p>
          <Button 
            variant="destructive" 
            onClick={handleWipeAll}
            disabled={activeDevices.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Wipe All Devices ({activeDevices.length})
          </Button>
        </CardContent>
      </Card>

      {/* Device List */}
      <Card className="bg-card/60 border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-foreground text-base">
            <Monitor className="w-4 h-4 text-primary" />
            Connected Devices
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {devices.map((device) => {
            const DeviceIcon = getDeviceIcon(device.type);
            return (
              <div 
                key={device.id} 
                className={`p-3 rounded-lg border ${
                  device.status === 'wiped' 
                    ? 'bg-red-500/10 border-red-500/30' 
                    : 'bg-background/50 border-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      device.status === 'active' ? 'bg-green-500/20' :
                      device.status === 'wiped' ? 'bg-red-500/20' :
                      'bg-gray-500/20'
                    }`}>
                      <DeviceIcon className={`w-5 h-5 ${
                        device.status === 'active' ? 'text-green-400' :
                        device.status === 'wiped' ? 'text-red-400' :
                        'text-foreground/70'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{device.name}</span>
                        {device.isCurrent && (
                          <Badge variant="secondary" className="text-xs">
                            This device
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {device.location} • {device.lastActive}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={
                      device.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      device.status === 'wiped' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      'bg-gray-500/20 text-foreground/70 border-gray-500/30'
                    }>
                      {device.status === 'active' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                      {device.status === 'wiped' && <XCircle className="w-3 h-3 mr-1" />}
                      {device.status}
                    </Badge>
                    {device.status === 'active' && !device.isCurrent && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRevokeSession(device.id)}
                        >
                          <Lock className="w-3 h-3 mr-1" />
                          Revoke
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleWipeDevice(device.id)}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Wipe
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 bg-card border-red-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                Confirm Remote Wipe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This action will permanently delete all local data, cached credentials, 
                and offline content from {wipeTarget === 'all' ? 'all devices' : 'the selected device'}.
                This cannot be undone.
              </p>
              <div>
                <label className="text-sm text-foreground mb-1 block">
                  Type <strong>WIPE</strong> to confirm:
                </label>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="WIPE"
                  className="font-mono"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setShowConfirm(false);
                    setConfirmText('');
                    setWipeTarget(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1"
                  onClick={confirmWipe}
                  disabled={confirmText !== 'WIPE' || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Wiping...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Confirm Wipe
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default RemoteWipe;
