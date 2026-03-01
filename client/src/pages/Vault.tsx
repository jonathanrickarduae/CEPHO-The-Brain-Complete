import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * The Vault page has been merged into Settings → "The Vault" tab.
 * This component redirects users to the new location.
 */
export default function Vault() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocation("/settings?tab=vault");
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground text-sm">Redirecting to Settings → The Vault…</p>
    </div>
  );
}
