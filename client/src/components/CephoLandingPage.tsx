// CephoLandingPage — shown when user is not authenticated
// Design: Meridian Light — white, electric cyan, neon pink

import AnimatedBrainLogo from "./AnimatedBrainLogo";

export function CephoLandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      {/* Brain logo */}
      <div className="mb-8">
        <AnimatedBrainLogo size="xl" intensity="active" color="oklch(0.78 0.18 195)" />
      </div>

      {/* Wordmark */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className="text-4xl font-bold tracking-tight text-foreground"
          style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.02em" }}
        >
          CEPHO
        </span>
        <span
          className="text-4xl font-bold"
          style={{ color: "oklch(0.78 0.18 195)" }}
        >
          .
        </span>
      </div>

      <p className="text-muted-foreground text-base mb-10 text-center max-w-xs">
        Your business. Fully attended.
      </p>

      {/* Sign in button */}
      <button
        className="px-8 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.97]"
        style={{ background: "oklch(0.78 0.18 195)" }}
        onClick={() => {
          // In production: trigger Manus OAuth
          window.location.reload();
        }}
      >
        Sign in
      </button>

      <p className="text-xs text-muted-foreground mt-6">
        CEPHO.ai · The Brain · v12
      </p>
    </div>
  );
}
