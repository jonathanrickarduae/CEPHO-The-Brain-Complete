import { useState, useEffect, useRef } from 'react';
import { 
  Shield, Lock, Mail, Smartphone, Eye, EyeOff, 
  CheckCircle, AlertCircle, Loader2, Fingerprint,
  KeyRound, Clock, RefreshCw, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import NeonBrain from '@/components/ai-agents/NeonBrain';

interface VaultSecurityGateProps {
  isOpen: boolean;
  onVerified: () => void;
  onCancel: () => void;
  userEmail?: string;
}

type VerificationStep = 'initial' | 'code_sent' | 'verifying' | 'verified' | 'error';

export function VaultSecurityGate({ 
  isOpen, 
  onVerified, 
  onCancel,
  userEmail = 'user@example.com'
}: VaultSecurityGateProps) {
  const [step, setStep] = useState<VerificationStep>('initial');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [trustDevice, setTrustDevice] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Mask email for display
  const maskedEmail = userEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3');

  useEffect(() => {
    if (!isOpen) {
      setStep('initial');
      setCode(['', '', '', '', '', '']);
      setError(null);
      setCountdown(0);
    }
  }, [isOpen]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendCode = async () => {
    setStep('code_sent');
    setCountdown(60); // 60 second cooldown
    setError(null);
    
    // TODO: Call API to send verification code
    // For now, simulate sending
    
    // Focus first input
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError(null);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (value && index === 5 && newCode.every(d => d !== '')) {
      handleVerifyCode(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setCode(newCode);
      handleVerifyCode(pastedData);
    }
  };

  const handleVerifyCode = async (codeString: string) => {
    setStep('verifying');
    
    // TODO: Call API to verify code
    // For demo, accept any 6-digit code
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate verification (in production, this would be an API call)
    if (codeString.length === 6) {
      setStep('verified');
      setTimeout(() => {
        onVerified();
      }, 1000);
    } else {
      setStep('code_sent');
      setError('Invalid verification code. Please try again.');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResendCode = () => {
    if (countdown === 0) {
      handleSendCode();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
      </div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md">
          {/* Cancel button */}
          <button
            onClick={onCancel}
            className="absolute -top-12 right-0 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Main Card */}
          <div className="relative bg-gradient-to-b from-card/95 to-card/80 border border-white/10 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
            {/* Top security indicator */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-primary to-cyan-400" />

            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-primary/20 border border-cyan-500/30 flex items-center justify-center">
                    <Shield className="w-10 h-10 text-cyan-400" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-card border border-white/10 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-primary" />
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-display font-bold text-center text-foreground mb-2">
                Vault Security Check
              </h2>
              <p className="text-center text-muted-foreground mb-8">
                {step === 'initial' && 'Verify your identity to access sensitive data'}
                {step === 'code_sent' && `Enter the 6-digit code sent to ${maskedEmail}`}
                {step === 'verifying' && 'Verifying your code...'}
                {step === 'verified' && 'Identity verified!'}
                {step === 'error' && 'Verification failed'}
              </p>

              {/* Initial State - Send Code */}
              {step === 'initial' && (
                <div className="space-y-4">
                  <div className="p-4 bg-secondary/30 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3 mb-3">
                      <Mail className="w-5 h-5 text-cyan-400" />
                      <span className="text-sm text-muted-foreground">Email Verification</span>
                    </div>
                    <p className="text-sm text-foreground">
                      We'll send a verification code to <span className="font-mono text-cyan-400">{maskedEmail}</span>
                    </p>
                  </div>

                  <Button
                    onClick={handleSendCode}
                    className="w-full py-6 text-lg bg-cyan-500 hover:bg-cyan-600 text-white shadow-[0_0_30px_rgba(6,182,212,0.3)]"
                  >
                    <KeyRound className="w-5 h-5 mr-2" />
                    Send Verification Code
                  </Button>

                  {/* Security badges */}
                  <div className="flex items-center justify-center gap-4 pt-4">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Shield className="w-3 h-3" />
                      <span>256-bit encryption</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Lock className="w-3 h-3" />
                      <span>SOC2 compliant</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Code Entry */}
              {(step === 'code_sent' || step === 'verifying') && (
                <div className="space-y-6">
                  {/* Code inputs */}
                  <div className="flex justify-center gap-2" onPaste={handlePaste}>
                    {code.map((digit, index) => (
                      <input
                        key={index}
                        ref={el => { inputRefs.current[index] = el }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleCodeChange(index, e.target.value)}
                        onKeyDown={e => handleKeyDown(index, e)}
                        disabled={step === 'verifying'}
                        className={cn(
                          'w-12 h-14 text-center text-2xl font-mono font-bold rounded-xl',
                          'bg-secondary/50 border-2 transition-all duration-200',
                          'focus:outline-none focus:ring-2 focus:ring-cyan-500/50',
                          digit ? 'border-cyan-500/50 text-foreground' : 'border-white/10 text-muted-foreground',
                          error && 'border-red-500/50 shake',
                          step === 'verifying' && 'opacity-50'
                        )}
                      />
                    ))}
                  </div>

                  {/* Error message */}
                  {error && (
                    <div className="flex items-center justify-center gap-2 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Verifying indicator */}
                  {step === 'verifying' && (
                    <div className="flex items-center justify-center gap-2 text-cyan-400">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Verifying...</span>
                    </div>
                  )}

                  {/* Trust device option */}
                  {step === 'code_sent' && (
                    <label className="flex items-center justify-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={trustDevice}
                        onChange={e => setTrustDevice(e.target.checked)}
                        className="w-4 h-4 rounded border-white/20 bg-secondary text-cyan-500 focus:ring-cyan-500/50"
                      />
                      <span className="text-sm text-muted-foreground">
                        Trust this device for 24 hours
                      </span>
                    </label>
                  )}

                  {/* Resend code */}
                  {step === 'code_sent' && (
                    <div className="text-center">
                      {countdown > 0 ? (
                        <p className="text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 inline mr-1" />
                          Resend code in {countdown}s
                        </p>
                      ) : (
                        <button
                          onClick={handleResendCode}
                          className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-1 mx-auto"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Resend code
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Verified State */}
              {step === 'verified' && (
                <div className="text-center py-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <p className="text-green-400 font-medium">Access Granted</p>
                  <p className="text-sm text-muted-foreground mt-1">Redirecting to Vault...</p>
                </div>
              )}
            </div>

            {/* Bottom gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-primary to-cyan-400" />
          </div>

          {/* Security info */}
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Your data is protected with end-to-end encryption.
              <br />
              We never store your verification codes.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// Hook to manage Vault security state
export function useVaultSecurity() {
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [showSecurityGate, setShowSecurityGate] = useState(false);
  const [lastUnlockTime, setLastUnlockTime] = useState<Date | null>(null);

  // Session timeout (30 minutes)
  const SESSION_TIMEOUT = 30 * 60 * 1000;

  useEffect(() => {
    // Check if session has expired
    if (lastUnlockTime && isVaultUnlocked) {
      const checkExpiry = setInterval(() => {
        const elapsed = Date.now() - lastUnlockTime.getTime();
        if (elapsed > SESSION_TIMEOUT) {
          setIsVaultUnlocked(false);
          setLastUnlockTime(null);
        }
      }, 60000); // Check every minute

      return () => clearInterval(checkExpiry);
    }
  }, [lastUnlockTime, isVaultUnlocked]);

  const requestVaultAccess = () => {
    if (isVaultUnlocked) {
      // Session still valid
      return true;
    }
    setShowSecurityGate(true);
    return false;
  };

  const handleVerified = () => {
    setIsVaultUnlocked(true);
    setLastUnlockTime(new Date());
    setShowSecurityGate(false);
  };

  const handleCancel = () => {
    setShowSecurityGate(false);
  };

  const lockVault = () => {
    setIsVaultUnlocked(false);
    setLastUnlockTime(null);
  };

  return {
    isVaultUnlocked,
    showSecurityGate,
    requestVaultAccess,
    handleVerified,
    handleCancel,
    lockVault,
    sessionTimeRemaining: lastUnlockTime 
      ? Math.max(0, SESSION_TIMEOUT - (Date.now() - lastUnlockTime.getTime()))
      : 0,
  };
}

// Security trust indicators component
export function SecurityBadges({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
        <Shield className="w-3 h-3 text-cyan-400" />
        <span className="text-xs text-cyan-400 font-medium">Encrypted</span>
      </div>
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20">
        <CheckCircle className="w-3 h-3 text-green-400" />
        <span className="text-xs text-green-400 font-medium">2FA Protected</span>
      </div>
    </div>
  );
}
