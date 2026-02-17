import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Shield, Lock, Unlock, AlertTriangle, CheckCircle } from 'lucide-react';

// Governance mode types
export type GovernanceMode = 'omni' | 'governed';

// Feature availability based on governance mode
export interface FeatureAvailability {
  aiExperts: boolean;
  digitalTwin: boolean;
  externalLLMs: boolean;
  openSourceAI: boolean;
  microsoftCopilot: boolean;
  companyApprovedAI: boolean;
  voiceInput: boolean;
  autonomousAgents: boolean;
  trainingStudio: boolean;
  dataExport: boolean;
}

// Integration governance status
export interface IntegrationGovernance {
  id: string;
  name: string;
  omniApproved: boolean;
  governedApproved: boolean;
  requiresTerms: boolean;
  termsAccepted: boolean;
  complianceLevel: 'high' | 'medium' | 'low';
  dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
}

// Governance context type
interface GovernanceContextType {
  mode: GovernanceMode;
  setMode: (mode: GovernanceMode) => void;
  features: FeatureAvailability;
  isFeatureAvailable: (feature: keyof FeatureAvailability) => boolean;
  isIntegrationAvailable: (integration: IntegrationGovernance) => boolean;
  requiresTermsAcceptance: (integrationId: string) => boolean;
  acceptTerms: (integrationId: string) => void;
  pendingModeChange: GovernanceMode | null;
  requestModeChange: (newMode: GovernanceMode) => void;
  confirmModeChange: () => void;
  cancelModeChange: () => void;
  governanceInfo: {
    title: string;
    description: string;
    restrictions: string[];
  };
}

// Default feature availability by mode
const OMNI_FEATURES: FeatureAvailability = {
  aiExperts: true,
  digitalTwin: true,
  externalLLMs: true,
  openSourceAI: true,
  microsoftCopilot: true,
  companyApprovedAI: true,
  voiceInput: true,
  autonomousAgents: true,
  trainingStudio: true,
  dataExport: true,
};

const GOVERNED_FEATURES: FeatureAvailability = {
  aiExperts: false, // External AI experts blocked
  digitalTwin: true, // Limited to approved AI only
  externalLLMs: false, // No external LLMs
  openSourceAI: false, // No open source AI
  microsoftCopilot: true, // Microsoft Copilot allowed
  companyApprovedAI: true, // Company approved AI allowed
  voiceInput: true, // Voice input allowed (processed locally or via approved service)
  autonomousAgents: false, // No autonomous agents
  trainingStudio: false, // No external training
  dataExport: false, // Data export restricted
};

// Create context
const GovernanceContext = createContext<GovernanceContextType | undefined>(undefined);

// Audit log entry type
export interface GovernanceAuditEntry {
  id: string;
  timestamp: Date;
  action: 'mode_change' | 'terms_accepted' | 'feature_accessed' | 'integration_connected';
  fromMode?: GovernanceMode;
  toMode?: GovernanceMode;
  featureName?: string;
  integrationId?: string;
  userId?: string;
  userAgent?: string;
  ipAddress?: string;
}

// Provider component
export function GovernanceProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<GovernanceMode>('omni');
  const [acceptedTerms, setAcceptedTerms] = useState<Set<string>>(new Set());
  const [pendingModeChange, setPendingModeChange] = useState<GovernanceMode | null>(null);
  const [auditLog, setAuditLog] = useState<GovernanceAuditEntry[]>([]);

  // Add entry to audit log
  const addAuditEntry = (entry: Omit<GovernanceAuditEntry, 'id' | 'timestamp' | 'userAgent'>) => {
    const newEntry: GovernanceAuditEntry = {
      ...entry,
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    };
    
    setAuditLog(prev => {
      const updated = [newEntry, ...prev].slice(0, 100); // Keep last 100 entries
      localStorage.setItem('governance_audit_log', JSON.stringify(updated));
      return updated;
    });
    
    // In production, this would also send to server for compliance reporting
    console.log('[Governance Audit]', newEntry);
  };

  // Load saved mode and audit log from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('governance_mode') as GovernanceMode;
    if (savedMode === 'omni' || savedMode === 'governed') {
      setModeState(savedMode);
    }
    
    const savedTerms = localStorage.getItem('accepted_terms');
    if (savedTerms) {
      setAcceptedTerms(new Set(JSON.parse(savedTerms)));
    }
    
    const savedAuditLog = localStorage.getItem('governance_audit_log');
    if (savedAuditLog) {
      try {
        const parsed = JSON.parse(savedAuditLog);
        setAuditLog(parsed.map((e: GovernanceAuditEntry) => ({
          ...e,
          timestamp: new Date(e.timestamp)
        })));
      } catch (e) {
        console.error('Failed to parse audit log', e);
      }
    }
  }, []);

  // Get features based on current mode
  const features = mode === 'omni' ? OMNI_FEATURES : GOVERNED_FEATURES;

  // Check if a specific feature is available
  const isFeatureAvailable = (feature: keyof FeatureAvailability): boolean => {
    return features[feature];
  };

  // Check if an integration is available in current mode
  const isIntegrationAvailable = (integration: IntegrationGovernance): boolean => {
    if (mode === 'omni') {
      return integration.omniApproved;
    }
    return integration.governedApproved;
  };

  // Check if terms acceptance is required
  const requiresTermsAcceptance = (integrationId: string): boolean => {
    return mode === 'governed' && !acceptedTerms.has(integrationId);
  };

  // Accept terms for an integration with audit logging
  const acceptTerms = (integrationId: string) => {
    const newTerms = new Set(acceptedTerms);
    newTerms.add(integrationId);
    setAcceptedTerms(newTerms);
    localStorage.setItem('accepted_terms', JSON.stringify(Array.from(newTerms)));
    
    // Log terms acceptance for compliance
    addAuditEntry({
      action: 'terms_accepted',
      integrationId,
    });
  };

  // Set mode with persistence and audit logging
  const setMode = (newMode: GovernanceMode) => {
    const previousMode = mode;
    setModeState(newMode);
    localStorage.setItem('governance_mode', newMode);
    
    // Log the mode change for compliance
    addAuditEntry({
      action: 'mode_change',
      fromMode: previousMode,
      toMode: newMode,
    });
  };

  // Request mode change (requires confirmation)
  const requestModeChange = (newMode: GovernanceMode) => {
    setPendingModeChange(newMode);
  };

  // Confirm mode change
  const confirmModeChange = () => {
    if (pendingModeChange) {
      setMode(pendingModeChange);
      setPendingModeChange(null);
    }
  };

  // Cancel mode change
  const cancelModeChange = () => {
    setPendingModeChange(null);
  };

  // Governance info for display
  const governanceInfo = mode === 'omni' 
    ? {
        title: 'Omni Mode',
        description: 'Full access to all AI features and integrations. Use for personal projects or when working with non-sensitive data.',
        restrictions: [],
      }
    : {
        title: 'Governed Mode',
        description: 'Enterprise-compliant mode with restricted AI access. Only Microsoft Copilot and company-approved AI tools are available.',
        restrictions: [
          'External AI Experts are disabled',
          'Open-source AI models are blocked',
          'Autonomous agents are disabled',
          'Training Studio is restricted',
          'Data export requires approval',
        ],
      };

  return (
    <GovernanceContext.Provider
      value={{
        mode,
        setMode,
        features,
        isFeatureAvailable,
        isIntegrationAvailable,
        requiresTermsAcceptance,
        acceptTerms,
        pendingModeChange,
        requestModeChange,
        confirmModeChange,
        cancelModeChange,
        governanceInfo,
      }}
    >
      {children}
    </GovernanceContext.Provider>
  );
}

// Hook to use governance context
export function useGovernance() {
  const context = useContext(GovernanceContext);
  if (context === undefined) {
    throw new Error('useGovernance must be used within a GovernanceProvider');
  }
  return context;
}

// Governance mode indicator component
export function GovernanceModeIndicator({ className }: { className?: string }) {
  const { mode, requestModeChange } = useGovernance();
  
  return (
    <button
      onClick={() => requestModeChange(mode === 'omni' ? 'governed' : 'omni')}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
        mode === 'omni'
          ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
          : 'bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
      } ${className}`}
    >
      {mode === 'omni' ? (
        <>
          <Unlock className="w-3.5 h-3.5" />
          <span className="text-xs font-medium uppercase tracking-wide">Omni</span>
        </>
      ) : (
        <>
          <Lock className="w-3.5 h-3.5" />
          <span className="text-xs font-medium uppercase tracking-wide">Governed</span>
        </>
      )}
    </button>
  );
}

// Mode change confirmation modal
export function GovernanceModeChangeModal() {
  const { pendingModeChange, confirmModeChange, cancelModeChange, governanceInfo, mode } = useGovernance();
  
  if (!pendingModeChange) return null;
  
  const isGoingToGoverned = pendingModeChange === 'governed';
  
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" onClick={cancelModeChange} />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className={`p-6 ${isGoingToGoverned ? 'bg-amber-500/10' : 'bg-cyan-500/10'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isGoingToGoverned ? 'bg-amber-500/20' : 'bg-cyan-500/20'
              }`}>
                {isGoingToGoverned ? (
                  <Lock className="w-6 h-6 text-amber-400" />
                ) : (
                  <Unlock className="w-6 h-6 text-cyan-400" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold">
                  Switch to {isGoingToGoverned ? 'Governed' : 'Omni'} Mode?
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isGoingToGoverned 
                    ? 'Enterprise-compliant restrictions will apply'
                    : 'Full AI access will be enabled'
                  }
                </p>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {isGoingToGoverned ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-amber-500/5 rounded-lg border border-amber-500/20">
                  <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-400 mb-1">The following features will be restricted:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• External AI Experts (Manus, OpenAI, etc.)</li>
                      <li>• Open-source AI models</li>
                      <li>• Autonomous agent actions</li>
                      <li>• Training Studio uploads</li>
                      <li>• Unrestricted data export</li>
                    </ul>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-500/5 rounded-lg border border-green-500/20">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-green-400 mb-1">Available in Governed mode:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Microsoft Copilot</li>
                      <li>• Company-approved AI tools</li>
                      <li>• Chief of Staff (limited)</li>
                      <li>• Voice input</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-3 bg-cyan-500/5 rounded-lg border border-cyan-500/20">
                <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-cyan-400 mb-1">Full access will be restored:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• All AI Experts and external LLMs</li>
                    <li>• Autonomous agent capabilities</li>
                    <li>• Training Studio with all features</li>
                    <li>• Unrestricted data export</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-6 pt-0 flex gap-3">
            <button
              onClick={cancelModeChange}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border text-muted-foreground hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmModeChange}
              className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-colors ${
                isGoingToGoverned
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-cyan-500 hover:bg-cyan-600 text-white'
              }`}
            >
              Switch to {isGoingToGoverned ? 'Governed' : 'Omni'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Feature gate component - wraps features that may be restricted
interface FeatureGateProps {
  feature: keyof FeatureAvailability;
  children: ReactNode;
  fallback?: ReactNode;
  showOverlay?: boolean;
}

export function FeatureGate({ feature, children, fallback, showOverlay = true }: FeatureGateProps) {
  const { isFeatureAvailable, mode } = useGovernance();
  
  if (isFeatureAvailable(feature)) {
    return <>{children}</>;
  }
  
  if (fallback) {
    return <>{fallback}</>;
  }
  
  if (showOverlay) {
    return (
      <div className="relative">
        <div className="opacity-30 pointer-events-none blur-[1px]">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-xl">
          <div className="text-center p-4">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Lock className="w-6 h-6 text-amber-400" />
            </div>
            <p className="text-sm font-medium text-amber-400 mb-1">Governed Mode</p>
            <p className="text-xs text-muted-foreground">
              This feature is restricted in Governed mode
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return null;
}

// Restricted badge component
export function RestrictedBadge({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 border border-amber-500/30 text-amber-400 ${className}`}>
      <Lock className="w-3 h-3" />
      Governed
    </span>
  );
}
