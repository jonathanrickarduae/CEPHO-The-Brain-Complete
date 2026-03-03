import React, { useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { Bell, BellOff, CheckCheck, Filter } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type NotificationType =
  | "task"
  | "project"
  | "agent"
  | "system"
  | "alert"
  | string;

function typeColor(type: NotificationType): string {
  const map: Record<string, string> = {
    task: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    project: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    agent: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    system: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    alert: "bg-red-500/20 text-red-400 border-red-500/30",
  };
  return map[type] ?? "bg-accent/20 text-accent border-accent/30";
}

export default function NotificationsCentrePage() {
  const [unreadOnly, setUnreadOnly] = useState(false);

  const { data: notifications, refetch } = trpc.notifications.list.useQuery({
    unreadOnly,
    limit: 100,
  });

  const markReadMutation = trpc.notifications.markRead.useMutation({
    onSuccess: () => refetch(),
  });

  const markAllReadMutation = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => {
      toast.success("All notifications marked as read");
      refetch();
    },
  });

  const unreadCount = notifications?.filter(n => !n.read).length ?? 0;

  return (
    <PageShell
      title="Notifications Centre"
      subtitle="Stay on top of every update, alert, and action across CEPHO."
      icon={Bell}
    >
      {/* Header Controls */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border">
            <Bell className="w-4 h-4 text-accent" />
            <span className="text-sm font-semibold">{unreadCount} unread</span>
          </div>
          <button
            onClick={() => setUnreadOnly(v => !v)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
              unreadOnly
                ? "bg-accent/20 border-accent/50 text-accent"
                : "bg-card border-border text-muted-foreground hover:border-accent/30"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            {unreadOnly ? "Showing unread" : "Show unread only"}
          </button>
        </div>
        <button
          onClick={() => markAllReadMutation.mutate()}
          disabled={unreadCount === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <CheckCheck className="w-4 h-4" />
          Mark all read
        </button>
      </div>

      {/* Notification List */}
      <div className="space-y-2">
        {!notifications || notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BellOff className="w-12 h-12 text-muted-foreground mb-4 opacity-40" />
            <p className="text-muted-foreground text-sm">
              {unreadOnly ? "No unread notifications" : "No notifications yet"}
            </p>
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer hover:border-accent/30 ${
                n.read
                  ? "bg-card border-border opacity-70"
                  : "bg-card border-accent/20 shadow-sm shadow-accent/5"
              }`}
              onClick={() => {
                if (!n.read) markReadMutation.mutate({ id: n.id });
                if (n.actionUrl) window.location.href = n.actionUrl;
              }}
              role="button"
              tabIndex={0}
              aria-label={`Notification: ${n.title}`}
              onKeyDown={e => {
                if (e.key === "Enter" || e.key === " ") {
                  if (!n.read) markReadMutation.mutate({ id: n.id });
                  if (n.actionUrl) window.location.href = n.actionUrl;
                }
              }}
            >
              {/* Unread dot */}
              <div className="mt-1.5 flex-shrink-0">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${n.read ? "bg-transparent border border-border" : "bg-accent animate-pulse"}`}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{n.title}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border font-medium ${typeColor(n.type)}`}
                    >
                      {n.type}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatDistanceToNow(new Date(n.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {n.message}
                </p>
                {n.actionLabel && n.actionUrl && (
                  <span className="inline-block mt-2 text-xs text-accent font-medium hover:underline">
                    {n.actionLabel} →
                  </span>
                )}
              </div>

              {/* Mark read button */}
              {!n.read && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    markReadMutation.mutate({ id: n.id });
                  }}
                  className="flex-shrink-0 p-1.5 rounded-lg hover:bg-accent/10 text-muted-foreground hover:text-accent transition-all"
                  title="Mark as read"
                  aria-label="Mark notification as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </PageShell>
  );
}
