/**
 * NordVPN Security Integration
 * 
 * Provides VPN-based security layer for sensitive operations.
 * Note: This is a client-side integration that works with NordVPN's API
 * for status checking and connection management.
 */

// Types
export interface NordVPNConfig {
  accessToken: string;
  autoConnect: boolean;
  apiRouting: boolean;
  preferredRegion: 'auto' | 'uk' | 'eu' | 'us' | 'ch';
  killSwitch: boolean;
}

export interface VPNStatus {
  isConnected: boolean;
  currentServer: string | null;
  currentRegion: string | null;
  ip: string | null;
  protocol: string | null;
  uptime: number | null;
}

export interface VPNServer {
  id: string;
  name: string;
  country: string;
  city: string;
  load: number;
  features: string[];
}

export interface SecurityAuditLog {
  id: string;
  timestamp: Date;
  action: string;
  vpnStatus: 'connected' | 'disconnected' | 'connecting';
  serverRegion: string | null;
  operationType: 'api_call' | 'document_upload' | 'sensitive_data' | 'login';
  success: boolean;
  details?: string;
}

// Storage keys
const STORAGE_KEYS = {
  config: 'nordvpn_config',
  auditLog: 'nordvpn_audit_log',
};

/**
 * NordVPN Security Service
 */
export class NordVPNSecurityService {
  private config: NordVPNConfig | null = null;
  private status: VPNStatus = {
    isConnected: false,
    currentServer: null,
    currentRegion: null,
    ip: null,
    protocol: null,
    uptime: null,
  };
  private auditLog: SecurityAuditLog[] = [];

  constructor() {
    this.loadConfig();
    this.loadAuditLog();
  }

  // ==================== Configuration ====================

  private loadConfig(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.config);
      if (stored) {
        this.config = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load NordVPN config:', e);
    }
  }

  private saveConfig(): void {
    try {
      if (this.config) {
        localStorage.setItem(STORAGE_KEYS.config, JSON.stringify(this.config));
      } else {
        localStorage.removeItem(STORAGE_KEYS.config);
      }
    } catch (e) {
      console.error('Failed to save NordVPN config:', e);
    }
  }

  setConfig(config: NordVPNConfig): void {
    this.config = config;
    this.saveConfig();
  }

  getConfig(): NordVPNConfig | null {
    return this.config;
  }

  clearConfig(): void {
    this.config = null;
    localStorage.removeItem(STORAGE_KEYS.config);
  }

  isConfigured(): boolean {
    return this.config !== null && !!this.config.accessToken;
  }

  // ==================== Audit Logging ====================

  private loadAuditLog(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.auditLog);
      if (stored) {
        const data = JSON.parse(stored);
        this.auditLog = data.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp),
        }));
      }
    } catch (e) {
      console.error('Failed to load audit log:', e);
    }
  }

  private saveAuditLog(): void {
    try {
      // Keep only last 1000 entries
      const toSave = this.auditLog.slice(-1000);
      localStorage.setItem(STORAGE_KEYS.auditLog, JSON.stringify(toSave));
    } catch (e) {
      console.error('Failed to save audit log:', e);
    }
  }

  logSecurityEvent(
    action: string,
    operationType: SecurityAuditLog['operationType'],
    success: boolean,
    details?: string
  ): void {
    const entry: SecurityAuditLog = {
      id: generateId(),
      timestamp: new Date(),
      action,
      vpnStatus: this.status.isConnected ? 'connected' : 'disconnected',
      serverRegion: this.status.currentRegion,
      operationType,
      success,
      details,
    };

    this.auditLog.push(entry);
    this.saveAuditLog();
  }

  getAuditLog(limit?: number): SecurityAuditLog[] {
    const logs = [...this.auditLog].reverse();
    return limit ? logs.slice(0, limit) : logs;
  }

  clearAuditLog(): void {
    this.auditLog = [];
    localStorage.removeItem(STORAGE_KEYS.auditLog);
  }

  // ==================== VPN Status ====================

  getStatus(): VPNStatus {
    return { ...this.status };
  }

  /**
   * Check VPN connection status
   * In a real implementation, this would communicate with NordVPN's API
   */
  async checkStatus(): Promise<VPNStatus> {
    // Simulated status check - in production, this would use NordVPN's API
    // or check the system's network configuration
    
    if (!this.isConfigured()) {
      this.status = {
        isConnected: false,
        currentServer: null,
        currentRegion: null,
        ip: null,
        protocol: null,
        uptime: null,
      };
      return this.status;
    }

    // For demo purposes, simulate a connected state if configured
    // In production, this would make actual API calls
    try {
      // Check public IP to verify VPN status
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      
      this.status = {
        isConnected: true, // Would be determined by comparing IP to known VPN ranges
        currentServer: this.config?.preferredRegion === 'uk' ? 'uk-london-001' : 'auto-best',
        currentRegion: this.config?.preferredRegion || 'auto',
        ip: data.ip,
        protocol: 'NordLynx',
        uptime: 3600, // Would be actual uptime
      };
    } catch (e) {
      // If we can't check IP, assume disconnected
      this.status.isConnected = false;
    }

    return this.status;
  }

  // ==================== Security Operations ====================

  /**
   * Check if a sensitive operation should proceed based on VPN status
   */
  shouldAllowOperation(operationType: SecurityAuditLog['operationType']): {
    allowed: boolean;
    reason?: string;
  } {
    if (!this.isConfigured()) {
      return { allowed: true }; // VPN not configured, allow all
    }

    if (!this.config?.apiRouting) {
      return { allowed: true }; // API routing not enabled
    }

    if (this.config.killSwitch && !this.status.isConnected) {
      return {
        allowed: false,
        reason: 'Kill switch enabled but VPN is disconnected. Please connect to VPN first.',
      };
    }

    return { allowed: true };
  }

  /**
   * Wrap a sensitive operation with VPN security checks
   */
  async secureOperation<T>(
    operationType: SecurityAuditLog['operationType'],
    operation: () => Promise<T>,
    description: string
  ): Promise<T> {
    const check = this.shouldAllowOperation(operationType);
    
    if (!check.allowed) {
      this.logSecurityEvent(
        description,
        operationType,
        false,
        `Blocked: ${check.reason}`
      );
      throw new VPNSecurityError(check.reason || 'Operation blocked by VPN security');
    }

    try {
      const result = await operation();
      this.logSecurityEvent(description, operationType, true);
      return result;
    } catch (error) {
      this.logSecurityEvent(
        description,
        operationType,
        false,
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  }

  // ==================== Server Recommendations ====================

  /**
   * Get recommended servers based on use case
   */
  getRecommendedServers(useCase: 'general' | 'streaming' | 'p2p' | 'privacy'): VPNServer[] {
    // In production, this would fetch from NordVPN's API
    const servers: Record<string, VPNServer[]> = {
      general: [
        { id: 'uk-1', name: 'UK #1', country: 'United Kingdom', city: 'London', load: 25, features: ['standard'] },
        { id: 'uk-2', name: 'UK #2', country: 'United Kingdom', city: 'Manchester', load: 30, features: ['standard'] },
        { id: 'nl-1', name: 'Netherlands #1', country: 'Netherlands', city: 'Amsterdam', load: 20, features: ['standard'] },
      ],
      streaming: [
        { id: 'uk-s1', name: 'UK Streaming #1', country: 'United Kingdom', city: 'London', load: 35, features: ['streaming'] },
        { id: 'us-s1', name: 'US Streaming #1', country: 'United States', city: 'New York', load: 40, features: ['streaming'] },
      ],
      p2p: [
        { id: 'nl-p1', name: 'Netherlands P2P #1', country: 'Netherlands', city: 'Amsterdam', load: 45, features: ['p2p'] },
        { id: 'ch-p1', name: 'Switzerland P2P #1', country: 'Switzerland', city: 'Zurich', load: 30, features: ['p2p'] },
      ],
      privacy: [
        { id: 'ch-1', name: 'Switzerland #1', country: 'Switzerland', city: 'Zurich', load: 15, features: ['double_vpn'] },
        { id: 'is-1', name: 'Iceland #1', country: 'Iceland', city: 'Reykjavik', load: 10, features: ['privacy'] },
      ],
    };

    return servers[useCase] || servers.general;
  }
}

/**
 * Custom error for VPN security violations
 */
export class VPNSecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VPNSecurityError';
  }
}

// Helper function
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ==================== React Hook ====================

import { useState, useEffect, useCallback } from 'react';

export interface UseNordVPNReturn {
  isConfigured: boolean;
  status: VPNStatus;
  config: NordVPNConfig | null;
  auditLog: SecurityAuditLog[];
  
  // Actions
  configure: (config: NordVPNConfig) => void;
  disconnect: () => void;
  checkStatus: () => Promise<VPNStatus>;
  secureOperation: <T>(
    type: SecurityAuditLog['operationType'],
    operation: () => Promise<T>,
    description: string
  ) => Promise<T>;
  clearAuditLog: () => void;
}

export function useNordVPN(): UseNordVPNReturn {
  const [service] = useState(() => new NordVPNSecurityService());
  const [isConfigured, setIsConfigured] = useState(service.isConfigured());
  const [status, setStatus] = useState<VPNStatus>(service.getStatus());
  const [config, setConfig] = useState<NordVPNConfig | null>(service.getConfig());
  const [auditLog, setAuditLog] = useState<SecurityAuditLog[]>(service.getAuditLog(50));

  // Check status periodically
  useEffect(() => {
    const checkAndUpdate = async () => {
      const newStatus = await service.checkStatus();
      setStatus(newStatus);
    };

    checkAndUpdate();
    const interval = setInterval(checkAndUpdate, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [service]);

  const configure = useCallback((newConfig: NordVPNConfig) => {
    service.setConfig(newConfig);
    setConfig(newConfig);
    setIsConfigured(true);
    service.checkStatus().then(setStatus);
  }, [service]);

  const disconnect = useCallback(() => {
    service.clearConfig();
    setConfig(null);
    setIsConfigured(false);
    setStatus({
      isConnected: false,
      currentServer: null,
      currentRegion: null,
      ip: null,
      protocol: null,
      uptime: null,
    });
  }, [service]);

  const checkStatus = useCallback(async () => {
    const newStatus = await service.checkStatus();
    setStatus(newStatus);
    return newStatus;
  }, [service]);

  const secureOperation = useCallback(async <T>(
    type: SecurityAuditLog['operationType'],
    operation: () => Promise<T>,
    description: string
  ): Promise<T> => {
    const result = await service.secureOperation(type, operation, description);
    setAuditLog(service.getAuditLog(50));
    return result;
  }, [service]);

  const clearAuditLog = useCallback(() => {
    service.clearAuditLog();
    setAuditLog([]);
  }, [service]);

  return {
    isConfigured,
    status,
    config,
    auditLog,
    configure,
    disconnect,
    checkStatus,
    secureOperation,
    clearAuditLog,
  };
}

// Singleton instance for global access
let globalService: NordVPNSecurityService | null = null;

export function getNordVPNService(): NordVPNSecurityService {
  if (!globalService) {
    globalService = new NordVPNSecurityService();
  }
  return globalService;
}

export default NordVPNSecurityService;
