// InboxPage — multi-account email (coming soon)
// Design: Meridian Light

import { Inbox } from "lucide-react";

export default function InboxPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-6">
      <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
        <Inbox className="h-7 w-7 text-primary" />
      </div>
      <h2 className="text-xl font-bold text-foreground">Inbox</h2>
      <p className="text-muted-foreground text-sm max-w-xs">
        Multi-account email across all your businesses. Coming in the next build.
      </p>
    </div>
  );
}
