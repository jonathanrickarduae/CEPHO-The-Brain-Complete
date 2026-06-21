import React, { useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import {
  Shield,
  ShieldCheck,
  ShieldOff,
  Key,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function TwoFactorSetupPage() {
  const [step, setStep] = useState<"status" | "setup" | "verify" | "backup">(
    "status"
  );
  const [verifyCode, setVerifyCode] = useState("");
  const [setupData, setSetupData] = useState<{
    secret: string;
    qrCode: string;
    backupCodes?: string[];
  } | null>(null);

  const { data: status, refetch } = trpc.twoFactor.status.useQuery();

  const setupMutation = trpc.twoFactor.setup.useMutation({
    onSuccess: data => {
      setSetupData(data);
      setStep("setup");
    },
    onError: () => toast.error("Failed to start 2FA setup"),
  });

  const verifyMutation = trpc.twoFactor.verify.useMutation({
    onSuccess: data => {
      if (data.backupCodes) {
        setSetupData(prev =>
          prev ? { ...prev, backupCodes: data.backupCodes } : null
        );
        setStep("backup");
      }
      toast.success("2FA enabled successfully");
      refetch();
    },
    onError: () => toast.error("Invalid code — please try again"),
  });

  const disableMutation = trpc.twoFactor.disable.useMutation({
    onSuccess: () => {
      toast.success("2FA disabled");
      setStep("status");
      refetch();
    },
    onError: () => toast.error("Failed to disable 2FA"),
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <PageShell
      title="Two-Factor Authentication"
      subtitle="Add an extra layer of security to your CEPHO account."
      icon={Shield}
    >
      <div className="max-w-lg mx-auto">
        {/* Status View */}
        {step === "status" && (
          <div className="p-6 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-4 mb-6">
              {status?.enabled ? (
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7 text-emerald-400" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <ShieldOff className="w-7 h-7 text-amber-400" />
                </div>
              )}
              <div>
                <h2 className="font-bold text-lg">
                  {status?.enabled ? "2FA is Enabled" : "2FA is Disabled"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {status?.enabled
                    ? "Your account is protected with two-factor authentication."
                    : "Enable 2FA to protect your account from unauthorised access."}
                </p>
              </div>
            </div>

            {status?.enabled ? (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400">
                  ✓ Authenticator app connected
                </div>
                {status.backupCodesRemaining !== undefined && (
                  <div className="p-3 rounded-lg bg-card border border-border text-sm text-muted-foreground">
                    <Key className="w-4 h-4 inline mr-2" />
                    {status.backupCodesRemaining} backup codes remaining
                  </div>
                )}
                <button
                  onClick={() => {
                    const code = prompt(
                      "Enter your current 2FA code to disable:"
                    );
                    if (code) disableMutation.mutate({ token: code });
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-all"
                >
                  Disable 2FA
                </button>
              </div>
            ) : (
              <button
                onClick={() => setupMutation.mutate()}
                disabled={setupMutation.isPending}
                className="w-full px-4 py-3 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 disabled:opacity-40 transition-all"
              >
                {setupMutation.isPending ? "Setting up..." : "Enable 2FA"}
              </button>
            )}
          </div>
        )}

        {/* Setup View — Show QR Code */}
        {step === "setup" && setupData && (
          <div className="p-6 rounded-xl border border-border bg-card space-y-5">
            <h2 className="font-bold text-lg">Scan QR Code</h2>
            <p className="text-sm text-muted-foreground">
              Open your authenticator app (Google Authenticator, Authy, etc.)
              and scan this QR code.
            </p>

            <div className="flex justify-center">
              <img
                src={setupData.qrCode}
                alt="2FA QR Code"
                className="w-48 h-48 rounded-lg border border-border"
              />
            </div>

            <div className="p-3 rounded-lg bg-muted/20 border border-border">
              <p className="text-xs text-muted-foreground mb-1">
                Or enter this code manually:
              </p>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono text-accent flex-1 break-all">
                  {setupData.secret}
                </code>
                <button
                  onClick={() => copyToClipboard(setupData.secret)}
                  className="p-1.5 rounded hover:bg-accent/10 text-muted-foreground hover:text-accent transition-all"
                  aria-label="Copy secret"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <button
              onClick={() => setStep("verify")}
              className="w-full px-4 py-3 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 transition-all"
            >
              I've scanned the code →
            </button>
          </div>
        )}

        {/* Verify View */}
        {step === "verify" && (
          <div className="p-6 rounded-xl border border-border bg-card space-y-5">
            <h2 className="font-bold text-lg">Verify Setup</h2>
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit code from your authenticator app to confirm
              setup.
            </p>

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={verifyCode}
              onChange={e => setVerifyCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="w-full text-center text-2xl font-mono tracking-widest bg-background border border-border rounded-lg p-4 focus:outline-none focus:border-accent/50"
              aria-label="Verification code"
            />

            <button
              onClick={() => verifyMutation.mutate({ token: verifyCode })}
              disabled={verifyCode.length !== 6 || verifyMutation.isPending}
              className="w-full px-4 py-3 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 disabled:opacity-40 transition-all"
            >
              {verifyMutation.isPending ? "Verifying..." : "Verify & Enable"}
            </button>
          </div>
        )}

        {/* Backup Codes View */}
        {step === "backup" && setupData?.backupCodes && (
          <div className="p-6 rounded-xl border border-emerald-500/30 bg-card space-y-5">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <h2 className="font-bold text-lg text-emerald-400">
                2FA Enabled!
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Save these backup codes in a secure place. Each can be used once
              if you lose access to your authenticator app.
            </p>

            <div className="grid grid-cols-2 gap-2">
              {setupData.backupCodes.map((code, i) => (
                <div
                  key={i}
                  className="p-2 rounded-lg bg-background border border-border text-center font-mono text-sm"
                >
                  {code}
                </div>
              ))}
            </div>

            <button
              onClick={() => copyToClipboard(setupData.backupCodes!.join("\n"))}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:border-accent/30 transition-all"
            >
              <Copy className="w-4 h-4" />
              Copy all backup codes
            </button>

            <button
              onClick={() => setStep("status")}
              className="w-full px-4 py-3 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 transition-all"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </PageShell>
  );
}
