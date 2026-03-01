import { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

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
    <div className="flex items-center justify-center h-full min-h-[200px]">
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Redirecting to Settings → The Vault…
      </div>
    </div>
  );
}
