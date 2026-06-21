/**
 * Analytics Hook (Remediation Task 6.1)
 *
 * Lightweight PostHog alternative — tracks page views and feature usage
 * without any external service. All data stays in the CEPHO database.
 *
 * Usage:
 *   const { track, trackPageView } = useAnalytics();
 *   track('button_clicked', { button: 'save' });
 *   trackPageView('/dashboard');
 */

import { useCallback, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

// Generate a session ID that persists for the browser session
function getSessionId(): string {
  const key = "cepho_session_id";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem(key, id);
  }
  return id;
}

type EventCategory =
  | "page_view"
  | "feature_use"
  | "ai_interaction"
  | "navigation"
  | "error"
  | "general";

interface TrackOptions {
  category?: EventCategory;
  properties?: Record<string, unknown>;
}

export function useAnalytics() {
  const trackMutation = trpc.analytics.track.useMutation();
  const sessionId = useRef(getSessionId());

  const track = useCallback(
    (eventName: string, options: TrackOptions = {}) => {
      trackMutation.mutate({
        eventName,
        eventCategory: options.category ?? "general",
        properties: options.properties,
        pagePath: window.location.pathname,
        sessionId: sessionId.current,
      });
    },
    [trackMutation]
  );

  const trackPageView = useCallback(
    (path: string) => {
      trackMutation.mutate({
        eventName: "page_view",
        eventCategory: "page_view",
        pagePath: path,
        sessionId: sessionId.current,
      });
    },
    [trackMutation]
  );

  const trackFeatureUse = useCallback(
    (featureName: string, properties?: Record<string, unknown>) => {
      trackMutation.mutate({
        eventName: `feature_used:${featureName}`,
        eventCategory: "feature_use",
        properties,
        pagePath: window.location.pathname,
        sessionId: sessionId.current,
      });
    },
    [trackMutation]
  );

  const trackAIInteraction = useCallback(
    (agentName: string, properties?: Record<string, unknown>) => {
      trackMutation.mutate({
        eventName: `ai_interaction:${agentName}`,
        eventCategory: "ai_interaction",
        properties,
        pagePath: window.location.pathname,
        sessionId: sessionId.current,
      });
    },
    [trackMutation]
  );

  return { track, trackPageView, trackFeatureUse, trackAIInteraction };
}

/**
 * Auto-tracks page views on route changes
 * Add this once in App.tsx or a layout component
 */
export function usePageViewTracking() {
  const [path] = useLocation();
  const { trackPageView } = useAnalytics();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (path !== lastPath.current) {
      lastPath.current = path;
      trackPageView(path);
    }
  }, [path, trackPageView]);
}
