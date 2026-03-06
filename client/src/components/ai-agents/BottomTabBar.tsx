import { useState } from "react";
import { useLocation } from "wouter";
import {
  LayoutDashboard,
  Sun,
  User,
  Rocket,
  Grid3X3,
  X,
  TrendingUp,
  Moon,
  Lock,
  Settings,
  AlertTriangle,
  Activity,
  Mail,
  Target,
  Bot,
  Workflow,
  Users,
  BarChart3,
  ClipboardList,
  Database,
  Zap,
  Video,
  Library,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

interface MoreItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  group: string;
}

// The 5 primary tabs always visible in the bottom bar
const PRIMARY_TABS: TabItem[] = [
  { id: "nexus", label: "Nexus", icon: LayoutDashboard, path: "/nexus" },
  { id: "signal", label: "Signal", icon: Sun, path: "/daily-brief" },
  { id: "cos", label: "Chief", icon: User, path: "/operations" },
  { id: "genesis", label: "Genesis", icon: Rocket, path: "/project-genesis" },
  { id: "more", label: "More", icon: Grid3X3, path: "" },
];

// All remaining navigation items shown in the More sheet
const MORE_ITEMS: MoreItem[] = [
  // Odyssey Engine
  { label: "Innovation Hub", icon: TrendingUp, path: "/innovation-hub", group: "Odyssey Engine" },
  { label: "Workflows", icon: Workflow, path: "/workflows", group: "Odyssey Engine" },
  { label: "War Room", icon: AlertTriangle, path: "/war-room", group: "Odyssey Engine" },
  { label: "Persephone", icon: Users, path: "/persephone", group: "Odyssey Engine" },
  // Chief of Staff
  { label: "AI Agents", icon: Bot, path: "/ai-agents", group: "Chief of Staff" },
  { label: "Agent Monitor", icon: Activity, path: "/ai-agents-monitoring", group: "Chief of Staff" },
  { label: "Victoria", icon: ClipboardList, path: "/victoria-tracker", group: "Chief of Staff" },
  { label: "AI-SMEs", icon: Users, path: "/ai-experts", group: "Chief of Staff" },
  { label: "Analytics", icon: BarChart3, path: "/analytics", group: "Chief of Staff" },
  { label: "KPIs & OKRs", icon: Target, path: "/kpis", group: "Chief of Staff" },
  // Intelligence
  { label: "Email Intel", icon: Mail, path: "/email-intelligence", group: "Intelligence" },
  { label: "Meetings", icon: Video, path: "/meeting-intelligence", group: "Intelligence" },
  { label: "Evening Review", icon: Moon, path: "/evening-review", group: "Intelligence" },
  // Resources
  { label: "Knowledge Base", icon: Database, path: "/knowledge-base", group: "Resources" },
  { label: "Documents", icon: Library, path: "/documents", group: "Resources" },
  { label: "Integrations", icon: Zap, path: "/integrations", group: "Resources" },
  // System
  { label: "Vault", icon: Lock, path: "/settings?tab=vault", group: "System" },
  { label: "Settings", icon: Settings, path: "/settings", group: "System" },
  { label: "Admin", icon: Shield, path: "/admin", group: "System" },
];

interface BottomTabBarProps {
  className?: string;
}

export function BottomTabBar({ className }: BottomTabBarProps) {
  const [location, setLocation] = useLocation();
  const [showMore, setShowMore] = useState(false);

  const isActive = (path: string) => {
    if (!path) return false;
    return location === path || location.startsWith(path + "/");
  };

  // Check if any "more" item is currently active (to highlight the More tab)
  const isMoreActive = MORE_ITEMS.some(item => isActive(item.path));

  const handleTabPress = (tab: TabItem) => {
    if (tab.id === "more") {
      setShowMore(prev => !prev);
    } else {
      setShowMore(false);
      setLocation(tab.path);
    }
  };

  const handleMoreItemPress = (path: string) => {
    setLocation(path);
    setShowMore(false);
  };

  // Group the more items by their group label
  const groups = MORE_ITEMS.reduce<Record<string, MoreItem[]>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  return (
    <>
      {/* More Sheet Overlay */}
      {showMore && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setShowMore(false)}
        />
      )}

      {/* More Sheet Panel */}
      {showMore && (
        <div
          className="fixed left-0 right-0 bottom-14 z-50 md:hidden rounded-t-2xl border-t border-white/10 bg-card/98 backdrop-blur-xl overflow-y-auto"
          style={{ maxHeight: "70vh" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-white/5">
            <span className="text-sm font-semibold text-foreground">All Sections</span>
            <button
              onClick={() => setShowMore(false)}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation groups */}
          <div className="px-4 py-3 space-y-4" style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}>
            {Object.entries(groups).map(([groupName, items]) => (
              <div key={groupName}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2 px-1">
                  {groupName}
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {items.map(item => {
                    const active = isActive(item.path);
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.path}
                        onClick={() => handleMoreItemPress(item.path)}
                        className={cn(
                          "flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl transition-all duration-150",
                          "min-h-[68px]",
                          active
                            ? "bg-primary/15 text-primary border border-primary/30"
                            : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                        )}
                      >
                        <Icon
                          className={cn(
                            "w-5 h-5 shrink-0",
                            active && "drop-shadow-[0_0_6px_var(--color-primary)]"
                          )}
                        />
                        <span className="text-[10px] font-medium text-center leading-tight">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fixed Bottom Tab Bar — 5 equal tabs, no horizontal scroll */}
      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 md:hidden",
          "bg-card/98 backdrop-blur-xl border-t border-white/10",
          className
        )}
        style={{
          height: "calc(56px + env(safe-area-inset-bottom, 0px))",
          paddingBottom: "env(safe-area-inset-bottom, 0)",
        }}
        aria-label="Primary navigation"
      >
        <div className="flex items-stretch h-14">
          {PRIMARY_TABS.map(tab => {
            const active =
              tab.id === "more"
                ? showMore || isMoreActive
                : isActive(tab.path);
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabPress(tab)}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-0.5 relative",
                  "transition-colors duration-150",
                  active ? "text-primary" : "text-muted-foreground"
                )}
                aria-label={tab.label}
                aria-current={active && tab.id !== "more" ? "page" : undefined}
                aria-expanded={tab.id === "more" ? showMore : undefined}
              >
                {/* Active indicator bar at top */}
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />
                )}

                <Icon
                  className={cn(
                    "w-5 h-5 shrink-0",
                    active && "drop-shadow-[0_0_8px_var(--color-primary)]"
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] font-semibold",
                    active ? "text-primary" : "text-muted-foreground/70"
                  )}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
