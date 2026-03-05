// p5-2: Sentry client-side error tracking — must be imported before everything else
import * as Sentry from "@sentry/react";
import { trpc } from "@/lib/trpc";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { httpBatchLink } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import "./index.css";
import { checkAppVersion } from "./utils/cacheBuster";

// p5-2: Initialise Sentry client-side (production only, requires VITE_SENTRY_DSN)
if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN as string,
    environment: import.meta.env.MODE,
    // Sample 10% of transactions for performance monitoring
    tracesSampleRate: 0.1,
    // Capture 100% of sessions that had an error for replay
    replaysOnErrorSampleRate: 1.0,
    // Sample 5% of all sessions for replay
    replaysSessionSampleRate: 0.05,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    beforeSend(event) {
      // Strip sensitive tokens from request URLs before sending to Sentry
      if (event.request?.url) {
        event.request.url = event.request.url.replace(
          /token=[^&]+/,
          "token=REDACTED"
        );
      }
      return event;
    },
  });
}

// Check app version and force reload if changed
checkAppVersion();

// Register service worker for PWA support (production only)
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").then(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      registration => {},
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      error => {}
    );
  });
}

const handleAuthError = (error: unknown) => {
  const msg = error instanceof Error ? error.message : String(error);
  if (msg.includes("UNAUTHORIZED") || msg.includes("10001")) {
    toast.error(
      "Session not active — please refresh. If this persists, check server configuration.",
      { id: "auth-error", duration: 6000 }
    );
  }
};

const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleAuthError }),
  mutationCache: new MutationCache({ onError: handleAuthError }),
  defaultOptions: {
    queries: {
      retry: 0,
      retryDelay: 0,
      staleTime: 30000,
    },
  },
});

// Cache CSRF token with TTL — expires after 25 minutes to avoid stale tokens after server restart
let cachedCsrfToken: string | null = null;
let csrfTokenExpiry: number = 0;
async function getCsrfToken(forceRefresh = false): Promise<string> {
  if (!forceRefresh && cachedCsrfToken && Date.now() < csrfTokenExpiry) {
    return cachedCsrfToken;
  }
  try {
    const resp = await fetch("/api/csrf-token", { credentials: "include" });
    const data = await resp.json();
    cachedCsrfToken = data.csrfToken || "";
    csrfTokenExpiry = Date.now() + 25 * 60 * 1000; // 25 min TTL
    return cachedCsrfToken as string;
  } catch {
    return "";
  }
}

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      async headers() {
        // Get CSRF token and (optionally) Supabase session token
        const csrfToken = await getCsrfToken();
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
        let accessToken = "";
        // Only attempt Supabase auth if both URL and anon key are configured
        if (supabaseUrl && supabaseAnonKey) {
          try {
            const { createClient } = await import("@supabase/supabase-js");
            const supabase = createClient(supabaseUrl, supabaseAnonKey);
            const {
              data: { session },
            } = await supabase.auth.getSession();
            accessToken = session?.access_token || "";
          } catch {
            // Supabase not available — app uses PIN-gate auth instead
          }
        }
        return {
          authorization: accessToken ? `Bearer ${accessToken}` : "",
          "x-csrf-token": csrfToken,
        };
      },
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        }).then(async resp => {
          // On 403 CSRF error, clear cache and retry once with fresh token
          if (resp.status === 403) {
            cachedCsrfToken = null;
            csrfTokenExpiry = 0;
            const freshToken = await getCsrfToken(true);
            const newInit = {
              ...(init ?? {}),
              credentials: "include" as RequestCredentials,
              headers: {
                ...(init?.headers ?? {}),
                "x-csrf-token": freshToken,
              },
            };
            return globalThis.fetch(input, newInit);
          }
          return resp;
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
