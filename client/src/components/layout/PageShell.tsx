/**
 * PageShell — Unified page layout component for CEPHO
 *
 * Enforces consistent:
 *  - Sticky page header with icon, title, subtitle, and action slot
 *  - Horizontal tab navigation (optional)
 *  - Content area with standard padding and max-width
 *  - No excessive vertical scrolling — content fits viewport
 *
 * Usage:
 *   <PageShell icon={Bot} title="AI Agents" subtitle="Monitor all agents">
 *     <content />
 *   </PageShell>
 */
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  icon?: LucideIcon;
  count?: number;
}

interface PageShellProps {
  /** Lucide icon for the page */
  icon?: LucideIcon;
  /** Avatar image URL (overrides icon) */
  avatar?: string;
  /** Page title */
  title: string;
  /** Optional subtitle / breadcrumb */
  subtitle?: string;
  /** Accent colour class for the icon background, e.g. "bg-pink-500/20 text-pink-400" */
  iconClass?: string;
  /** Right-side action buttons rendered in the header */
  actions?: React.ReactNode;
  /** Optional tab list */
  tabs?: Tab[];
  /** Currently active tab id */
  activeTab?: string;
  /** Tab change handler */
  onTabChange?: (id: string) => void;
  /** Page content */
  children: React.ReactNode;
  /** Extra className on the content wrapper */
  contentClassName?: string;
  /** If true, content fills available height (use for chat/split-pane layouts) */
  fillHeight?: boolean;
}

export function PageShell({
  icon: Icon,
  avatar,
  title,
  subtitle,
  iconClass = "bg-primary/15 text-primary",
  actions,
  tabs,
  activeTab,
  onTabChange,
  children,
  contentClassName,
  fillHeight = false,
}: PageShellProps) {
  const headingId = `page-title-${title.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div
      className={cn("flex flex-col", fillHeight ? "h-full" : "min-h-0")}
      role="region"
      aria-labelledby={headingId}
    >
      {/* ── Sticky header ─────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-4 sm:px-6 h-14">
          {/* Left: icon + title */}
          <div className="flex items-center gap-3 min-w-0">
            {avatar ? (
              <div className="relative shrink-0">
                <img
                  src={avatar}
                  alt={title}
                  className="w-8 h-8 rounded-full object-cover border-2 border-primary/40"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
              </div>
            ) : Icon ? (
              <div className={cn("shrink-0 p-1.5 rounded-lg", iconClass)} aria-hidden="true">
                <Icon className="w-4 h-4" />
              </div>
            ) : null}
            <div className="min-w-0">
              <h1
                id={headingId}
                className="text-sm sm:text-base font-semibold text-foreground truncate leading-tight"
              >
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-muted-foreground truncate leading-tight">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {/* Right: actions */}
          {actions && (
            <div className="flex items-center gap-2 shrink-0 ml-4">
              {actions}
            </div>
          )}
        </div>

             {/* ── Tab bar (optional) ────────────────────────────── */}
        {tabs && tabs.length > 0 && (
          <div
            role="tablist"
            aria-label={`${title} tabs`}
            className="flex overflow-x-auto scrollbar-none border-t border-border/50 px-4 sm:px-6"
          >
            {tabs.map(tab => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`tabpanel-${tab.id}`}
                  id={`tab-${tab.id}`}
                  onClick={() => onTabChange?.(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  )}
                >
                  {TabIcon && <TabIcon className="w-3.5 h-3.5 shrink-0" />}
                  {tab.label}
                  {tab.count !== undefined && (
                    <span
                      className={cn(
                        "ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold",
                        isActive
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Content area ──────────────────────────────────────────── */}
      <div
        className={cn(
          fillHeight ? "flex-1 overflow-hidden" : "overflow-y-auto",
          "p-4 sm:p-6",
          contentClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * PageGrid — Standard responsive content grid
 * Use inside PageShell for multi-column layouts.
 */
interface PageGridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  className?: string;
}
export function PageGrid({ children, cols = 2, className }: PageGridProps) {
  const colClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 lg:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4",
  }[cols];
  return (
    <div className={cn("grid gap-4", colClass, className)}>{children}</div>
  );
}

/**
 * PageSection — Titled section within a page
 */
interface PageSectionProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}
export function PageSection({
  title,
  description,
  actions,
  children,
  className,
}: PageSectionProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {(title || actions) && (
        <div className="flex items-start justify-between gap-4">
          <div>
            {title && (
              <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            )}
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 shrink-0">{actions}</div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
