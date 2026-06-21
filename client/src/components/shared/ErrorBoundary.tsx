/**
 * ErrorBoundary — World-Class React Error Boundary
 *
 * Catches all unhandled React rendering errors, logs them centrally,
 * and presents a clear, branded recovery UI.
 *
 * Usage:
 *   <ErrorBoundary>                          — top-level, full-page fallback
 *   <ErrorBoundary fallback="inline">        — inline fallback for widgets
 *   <ErrorBoundary fallback="card">          — card fallback for panels
 *   <ErrorBoundary name="Dashboard">         — named boundary for better logs
 */

import { cn } from "@/lib/utils";
import { logger } from "@/utils/logger";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Component, ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type FallbackVariant = "page" | "inline" | "card";

interface Props {
  children: ReactNode;
  /** Name of the boundary — used in error logs for easier debugging */
  name?: string;
  /** How to render the fallback UI */
  fallback?: FallbackVariant;
  /** Optional custom fallback renderer */
  renderFallback?: (error: Error | null, reset: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: { componentStack: string } | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

class ErrorBoundary extends Component<Props, State> {
  private readonly log = logger.module(
    `ErrorBoundary${this.props.name ? `:${this.props.name}` : ""}`
  );

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }): void {
    this.setState({ errorInfo });
    // Log to server via the client logger (sends to /api/client-log in production)
    this.log.error("Unhandled render error caught by ErrorBoundary", error, {
      componentStack: errorInfo.componentStack,
      boundary: this.props.name ?? "unnamed",
    } as Record<string, unknown>);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleReload = (): void => {
    window.location.reload();
  };

  // ─── Fallback UIs ─────────────────────────────────────────────────────────

  private renderPageFallback(): ReactNode {
    const { error } = this.state;
    return (
      <div className="flex items-center justify-center min-h-screen p-8 bg-[#0f1117]">
        <div className="flex flex-col items-center w-full max-w-lg text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6">
            <AlertTriangle size={32} className="text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            An unexpected error occurred. The team has been notified. You can
            try again or reload the page.
          </p>
          {import.meta.env.DEV && error && (
            <div className="w-full p-4 rounded-xl bg-[#1a1d27] border border-white/5 overflow-auto mb-6 text-left">
              <p className="text-xs font-mono text-red-400 mb-1">
                {error.message}
              </p>
              <pre className="text-xs text-gray-500 whitespace-pre-wrap">
                {error.stack}
              </pre>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={this.handleReset}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium",
                "bg-white/5 text-white border border-white/10",
                "hover:bg-white/10 transition-colors"
              )}
            >
              Try Again
            </button>
            <button
              onClick={this.handleReload}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium",
                "bg-violet-600 text-white",
                "hover:bg-violet-500 transition-colors"
              )}
            >
              <RefreshCw size={14} />
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  private renderInlineFallback(): ReactNode {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
        <AlertTriangle size={18} className="text-red-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-red-300 font-medium">
            This section failed to load
          </p>
          {import.meta.env.DEV && this.state.error && (
            <p className="text-xs text-red-400/70 mt-0.5 truncate">
              {this.state.error.message}
            </p>
          )}
        </div>
        <button
          onClick={this.handleReset}
          className="text-xs text-red-400 hover:text-red-300 transition-colors flex-shrink-0"
        >
          Retry
        </button>
      </div>
    );
  }

  private renderCardFallback(): ReactNode {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-[#1a1d27] border border-white/5 text-center">
        <AlertTriangle size={24} className="text-red-400 mb-3" />
        <p className="text-sm text-gray-400 mb-4">
          This component encountered an error
        </p>
        <button
          onClick={this.handleReset}
          className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    // Custom fallback takes priority
    if (this.props.renderFallback) {
      return this.props.renderFallback(this.state.error, this.handleReset);
    }

    const variant = this.props.fallback ?? "page";
    switch (variant) {
      case "inline":
        return this.renderInlineFallback();
      case "card":
        return this.renderCardFallback();
      default:
        return this.renderPageFallback();
    }
  }
}

export default ErrorBoundary;
