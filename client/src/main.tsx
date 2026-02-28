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
        console.log("[SW] Registered, scope:", registration.scope);
      },
      error => {
        console.warn("[SW] Registration failed:", error);
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

const redirectToLoginIfUnauthorized = (_error: unknown) => {
  // Authentication bypass - do not redirect to login
  return;
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
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
        // Get CSRF token and Supabase session token
        const csrfToken = await getCsrfToken();
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(
          import.meta.env.VITE_SUPABASE_URL || "",
          import.meta.env.VITE_SUPABASE_ANON_KEY || ""
        );
        const {
          data: { session },
        } = await supabase.auth.getSession();

        return {
          authorization: session?.access_token
            ? `Bearer ${session.access_token}`
            : "",
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
