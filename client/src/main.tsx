// p5-2: Sentry client-side error tracking — must be imported before everything else
import * as Sentry from "@sentry/react";
import { trpc } from "@/lib/trpc";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { UNAUTHED_ERR_MSG } from "@shared/const";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      retryDelay: 0,
      staleTime: 30000,
    },
  },
});

const redirectToLoginIfUnauthorized = (error: any) => {
  // P1-SEC-01: Redirect to login page on UNAUTHORIZED or FORBIDDEN errors
  if (
    error instanceof TRPCClientError &&
    (error.data?.code === "UNAUTHORIZED" || error.data?.code === "FORBIDDEN")
  ) {
    window.location.href = getLoginUrl();
  }
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
  }
});

// Cache CSRF token to avoid fetching it on every request
let cachedCsrfToken: string | null = null;
async function getCsrfToken(): Promise<string> {
  if (cachedCsrfToken) return cachedCsrfToken;
  try {
    const resp = await fetch("/api/csrf-token", { credentials: "include" });
    const data = await resp.json();
    cachedCsrfToken = data.csrfToken || "";
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
