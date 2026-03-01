import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from "@shared/const";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";
import { checkAppVersion } from "./utils/cacheBuster";

// Check app version and force reload if changed
checkAppVersion();

// Register service worker for PWA support (production only)
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").then(
      registration => {
      },
      error => {
      }
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

const redirectToLoginIfUnauthorized = (error: unknown) => {
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
