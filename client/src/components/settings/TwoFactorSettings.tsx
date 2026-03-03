/**
 * Two-Factor Authentication Settings Component
 * Remediation Task 1.9 — 2FA for Admin Accounts
 *
 * Allows users to:
 *   1. Enable 2FA (setup → scan QR → verify token → save backup codes)
 *   2. View current 2FA status
 *   3. Disable 2FA (requires current TOTP token)
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";

type Step = "idle" | "setup" | "verify" | "backup" | "disable";

export function TwoFactorSettings() {
  const [step, setStep] = useState<Step>("idle");
  const [token, setToken] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [copiedBackup, setCopiedBackup] = useState(false);

  const { data: status, refetch: refetchStatus } =
    trpc.twoFactor.status.useQuery();

  const setupMutation = trpc.twoFactor.setup.useMutation({
    onSuccess: data => {
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setStep("verify");
      setError("");
    },
    onError: err => setError(err.message),
  });

  const verifyMutation = trpc.twoFactor.verify.useMutation({
    onSuccess: data => {
      setBackupCodes(data.backupCodes);
      setStep("backup");
      setError("");
      refetchStatus();
    },
    onError: err => setError(err.message),
  });

  const disableMutation = trpc.twoFactor.disable.useMutation({
    onSuccess: () => {
      setStep("idle");
      setToken("");
      setError("");
      refetchStatus();
    },
    onError: err => setError(err.message),
  });

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    setCopiedBackup(true);
    setTimeout(() => setCopiedBackup(false), 2000);
  };

  if (!status) {
    return <div className="animate-pulse h-24 bg-base-200 rounded-xl" />;
  }

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm">
      <div className="card-body gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-base-content">
              Two-Factor Authentication
            </h3>
            <p className="text-sm text-base-content/60">
              {status.enabled
                ? `Enabled · ${status.backupCodesRemaining} backup codes remaining`
                : "Add an extra layer of security to your account"}
            </p>
          </div>
          <div
            className={`badge badge-lg ${status.enabled ? "badge-success" : "badge-ghost"}`}
          >
            {status.enabled ? "Enabled" : "Disabled"}
          </div>
        </div>

        {/* ── Idle state ── */}
        {step === "idle" && (
          <div className="flex gap-2">
            {!status.enabled ? (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setStep("setup");
                  setupMutation.mutate();
                }}
                disabled={setupMutation.isPending}
              >
                {setupMutation.isPending ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : null}
                Enable 2FA
              </button>
            ) : (
              <button
                className="btn btn-error btn-sm btn-outline"
                onClick={() => setStep("disable")}
              >
                Disable 2FA
              </button>
            )}
          </div>
        )}

        {/* ── Setup / loading ── */}
        {step === "setup" && (
          <div className="flex items-center gap-2 text-sm text-base-content/60">
            <span className="loading loading-spinner loading-sm" />
            Generating your secret key…
          </div>
        )}

        {/* ── Scan QR code ── */}
        {step === "verify" && (
          <div className="space-y-4">
            <p className="text-sm text-base-content/70">
              Scan this QR code with your authenticator app (Google
              Authenticator, Authy, 1Password, etc.), then enter the 6-digit
              code below.
            </p>
            {qrCode && (
              <div className="flex justify-center">
                <img
                  src={qrCode}
                  alt="2FA QR Code"
                  className="w-48 h-48 rounded-lg border border-base-300"
                />
              </div>
            )}
            <details className="text-xs text-base-content/50">
              <summary className="cursor-pointer">
                Can't scan? Enter manually
              </summary>
              <code className="block mt-1 p-2 bg-base-200 rounded break-all">
                {secret}
              </code>
            </details>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                className="input input-bordered input-sm w-32 text-center tracking-widest font-mono"
                value={token}
                onChange={e =>
                  setToken(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
              />
              <button
                className="btn btn-primary btn-sm"
                onClick={() => verifyMutation.mutate({ token })}
                disabled={token.length !== 6 || verifyMutation.isPending}
              >
                {verifyMutation.isPending ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : null}
                Verify & Enable
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setStep("idle");
                  setToken("");
                  setError("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Backup codes ── */}
        {step === "backup" && (
          <div className="space-y-3">
            <div className="alert alert-success text-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              2FA enabled! Save your backup codes now — they won't be shown
              again.
            </div>
            <div className="grid grid-cols-2 gap-1 p-3 bg-base-200 rounded-lg font-mono text-sm">
              {backupCodes.map(code => (
                <span key={code} className="text-center">
                  {code}
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                className="btn btn-sm btn-outline"
                onClick={copyBackupCodes}
              >
                {copiedBackup ? "Copied!" : "Copy all codes"}
              </button>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => setStep("idle")}
              >
                I've saved my codes
              </button>
            </div>
          </div>
        )}

        {/* ── Disable 2FA ── */}
        {step === "disable" && (
          <div className="space-y-3">
            <p className="text-sm text-base-content/70">
              Enter your current 6-digit authenticator code to disable 2FA.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                className="input input-bordered input-sm w-32 text-center tracking-widest font-mono"
                value={token}
                onChange={e =>
                  setToken(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
              />
              <button
                className="btn btn-error btn-sm"
                onClick={() => disableMutation.mutate({ token })}
                disabled={token.length !== 6 || disableMutation.isPending}
              >
                {disableMutation.isPending ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : null}
                Confirm Disable
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setStep("idle");
                  setToken("");
                  setError("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="alert alert-error text-sm py-2">
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
