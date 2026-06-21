import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/useMobile";
import {
  LayoutDashboard,
  LogOut,
  Briefcase,
  Sun,
  Settings,
  Inbox,
  Calendar,
  Lightbulb,
  FlaskConical,
  BookOpen,
  Users,
  TrendingUp,
  Vault,
  CheckSquare,
  GitBranch,
  FolderLock,
  Bot,
  PanelLeft,
  Plus,
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { CephoLandingPage } from "./CephoLandingPage";
import AnimatedBrainLogo from "./AnimatedBrainLogo";

type MenuItem = {
  icon: any;
  label: string;
  path: string;
  mobileLabel?: string;
  count?: number;
};

type NavGroup = {
  label: string;
  items: MenuItem[];
};

// Full CEPHO navigation — grouped by function
const navGroups: NavGroup[] = [
  {
    label: "Command",
    items: [
      { icon: LayoutDashboard, label: "The Nexus", mobileLabel: "Nexus", path: "/dashboard" },
      { icon: Sun, label: "Signal", path: "/morning-signal" },
      { icon: Calendar, label: "Calendar", path: "/calendar" },
      { icon: Inbox, label: "Inbox", path: "/inbox" },
    ],
  },
  {
    label: "Projects",
    items: [
      { icon: Briefcase, label: "Projects", path: "/projects" },
      { icon: CheckSquare, label: "Tasks", path: "/tasks" },
      { icon: BookOpen, label: "Decisions", path: "/decisions" },
      { icon: GitBranch, label: "Project Genesis", mobileLabel: "Genesis", path: "/genesis" },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { icon: Bot, label: "Victoria AI", mobileLabel: "Victoria", path: "/victoria" },
      { icon: Users, label: "AI SME Workflow", mobileLabel: "SMEs", path: "/sme" },
      { icon: FlaskConical, label: "Innovation Hub", mobileLabel: "Innovation", path: "/innovation" },
      { icon: TrendingUp, label: "Financial Pulse", mobileLabel: "Finance", path: "/financial" },
    ],
  },
  {
    label: "Growth",
    items: [
      { icon: Vault, label: "The Vault", path: "/vault" },
      { icon: FolderLock, label: "Document Library", mobileLabel: "Docs", path: "/documents" },
    ],
  },
];

// Primary mobile bottom nav — 5 most important items
const mobileBottomNav: MenuItem[] = [
  { icon: LayoutDashboard, label: "Nexus", path: "/dashboard" },
  { icon: Sun, label: "Signal", path: "/morning-signal" },
  { icon: Briefcase, label: "Projects", path: "/projects" },
  { icon: Bot, label: "Victoria", path: "/victoria" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

// Flat list for active-path matching
const allMenuItems = navGroups.flatMap((g) => g.items);

const SIDEBAR_WIDTH_KEY = "cepho-sidebar-width";
const DEFAULT_WIDTH = 240;
const MIN_WIDTH = 180;
const MAX_WIDTH = 360;

export default function BrainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) return <DashboardLayoutSkeleton />;
  if (!user) return <CephoLandingPage />;

  return (
    <SidebarProvider style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}>
      <BrainLayoutContent setSidebarWidth={setSidebarWidth} sidebarWidth={sidebarWidth}>
        {children}
      </BrainLayoutContent>
    </SidebarProvider>
  );
}

function BrainLayoutContent({
  children,
  setSidebarWidth,
  sidebarWidth,
}: {
  children: React.ReactNode;
  setSidebarWidth: (w: number) => void;
  sidebarWidth: number;
}) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isCollapsed) setIsResizing(false);
  }, [isCollapsed]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const left = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const w = e.clientX - left;
      if (w >= MIN_WIDTH && w <= MAX_WIDTH) setSidebarWidth(w);
    };
    const onUp = () => setIsResizing(false);
    if (isResizing) {
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  const currentLabel = allMenuItems.find(
    (m) => m.path === location || (m.path === "/dashboard" && location === "/")
  )?.label ?? (location === "/settings" ? "Settings" : "");

  const isActive = (item: MenuItem) =>
    location === item.path ||
    (item.path === "/dashboard" && location === "/") ||
    (item.path === "/projects" && location.startsWith("/projects/"));

  // Mobile layout — completely different structure
  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen min-h-[100dvh] bg-background">
        {/* Black top banner — mobile */}
        <header className="h-14 flex items-center justify-between px-4 bg-black sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-2.5">
            <AnimatedBrainLogo size="xs" intensity="subtle" color="oklch(0.78 0.18 195)" />
            <span className="font-display font-bold text-white tracking-tight text-base">CEPHO</span>
            {currentLabel && (
              <span className="text-sm text-white/50">· {currentLabel}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Quick action — Victoria */}
            <button
              onClick={() => setLocation("/victoria")}
              className="h-11 w-11 flex items-center justify-center rounded-full bg-[oklch(0.78_0.18_195)]/20 border border-[oklch(0.78_0.18_195)]/30 active:scale-95 transition-transform"
              aria-label="Ask Victoria"
            >
              <Bot className="h-4 w-4 text-[oklch(0.78_0.18_195)]" />
            </button>
            {/* User avatar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-11 w-11 rounded-full border border-white/20 overflow-hidden active:scale-95 transition-transform focus:outline-none">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs font-bold bg-[oklch(0.78_0.18_195)]/20 text-[oklch(0.78_0.18_195)]">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setLocation("/settings")} className="cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content — scrollable, padded for bottom nav */}
        <main className="flex-1 overflow-y-auto pb-20">
          {children}
        </main>

        {/* Bottom navigation bar — iPhone style */}
        <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-border safe-area-bottom">
          <div className="flex items-center justify-around px-2 pt-2 pb-safe">
            {mobileBottomNav.map((item) => {
              const active = isActive(item) || (item.path === "/settings" && location === "/settings");
              return (
                <button
                  key={item.path}
                  onClick={() => setLocation(item.path)}
                  className="flex flex-col items-center gap-1 min-w-[56px] py-1 px-2 rounded-xl active:scale-95 transition-transform focus:outline-none"
                  aria-label={item.label}
                >
                  <div className={`h-6 w-6 flex items-center justify-center rounded-lg transition-colors ${
                    active ? "text-[oklch(0.78_0.18_195)]" : "text-muted-foreground"
                  }`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className={`text-[10px] font-medium leading-none transition-colors ${
                    active ? "text-[oklch(0.78_0.18_195)]" : "text-muted-foreground"
                  }`}>
                    {item.label}
                  </span>
                  {active && (
                    <div className="absolute -bottom-0 h-0.5 w-8 bg-[oklch(0.78_0.18_195)] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
          {/* iPhone home indicator safe area */}
          <div className="h-safe-area-inset-bottom bg-white/95" />
        </nav>

        {/* Floating action button — quick actions */}
        <MobileQuickActionFAB onNavigate={setLocation} />
      </div>
    );
  }

  // Desktop layout — sidebar
  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r border-sidebar-border bg-sidebar"
          disableTransition={isResizing}
        >
          {/* Header */}
          <SidebarHeader className="h-16 justify-center border-b border-sidebar-border bg-black">
            <div className="flex items-center gap-3 px-2 w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 shrink-0"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4 text-white/60" />
              </button>
              {!isCollapsed && (
                <div className="flex items-center gap-2 min-w-0">
                  <AnimatedBrainLogo size="xs" intensity="subtle" color="oklch(0.78 0.18 195)" />
                  <span className="font-display font-bold tracking-tight truncate text-white text-lg">
                    CEPHO
                  </span>
                </div>
              )}
            </div>
          </SidebarHeader>

          {/* Navigation — grouped */}
          <SidebarContent className="gap-0 bg-transparent overflow-y-auto">
            <SidebarMenu className="px-2 py-3 gap-0">
              {navGroups.map((group, gi) => (
                <div key={group.label} className={gi > 0 ? "mt-4" : ""}>
                  {!isCollapsed && (
                    <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/35 select-none">
                      {group.label}
                    </p>
                  )}
                  {isCollapsed && gi > 0 && (
                    <div className="mx-3 my-2 border-t border-sidebar-border/50" />
                  )}
                  <div className="gap-0.5 flex flex-col">
                    {group.items.map((item) => {
                      const active = isActive(item);
                      return (
                        <SidebarMenuItem key={item.path}>
                          <SidebarMenuButton
                            isActive={active}
                            onClick={() => setLocation(item.path)}
                            tooltip={item.label}
                            className={`h-10 transition-all font-normal rounded-xl ${
                              active
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
                            }`}
                          >
                            <item.icon
                              className={`h-4 w-4 shrink-0 ${
                                active ? "text-primary" : "text-sidebar-foreground/50"
                              }`}
                            />
                            <span className="text-sm">{item.label}</span>
                            {item.count !== undefined && item.count > 0 && (
                              <span className="ml-auto text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-semibold">
                                {item.count}
                              </span>
                            )}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Settings */}
              <div className="mt-4">
                {!isCollapsed && (
                  <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/35 select-none">
                    System
                  </p>
                )}
                {isCollapsed && <div className="mx-3 my-2 border-t border-sidebar-border/50" />}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={location === "/settings"}
                    onClick={() => setLocation("/settings")}
                    tooltip="Settings"
                    className={`h-10 transition-all font-normal rounded-xl ${
                      location === "/settings"
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
                    }`}
                  >
                    <Settings
                      className={`h-4 w-4 shrink-0 ${
                        location === "/settings" ? "text-primary" : "text-sidebar-foreground/50"
                      }`}
                    />
                    <span className="text-sm">Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </div>
            </SidebarMenu>

            {/* Victoria status */}
            {!isCollapsed && (
              <div className="mx-3 mt-3 mb-3 p-3 rounded-xl border border-primary/15 bg-gradient-to-br from-primary/5 to-[oklch(0.58_0.26_340)]/5">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse shrink-0" />
                  <span className="text-xs font-semibold text-primary">Victoria</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">AI Chief of Staff · Active</p>
              </div>
            )}
          </SidebarContent>

          {/* Footer */}
          <SidebarFooter className="p-3 border-t border-sidebar-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-sidebar-accent transition-colors w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring">
                  <Avatar className="h-8 w-8 border border-primary/20 shrink-0">
                    <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate leading-none text-sidebar-foreground">
                        {user?.name || "-"}
                      </p>
                      <p className="text-xs text-sidebar-foreground/45 truncate mt-1">
                        {user?.email || "-"}
                      </p>
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setLocation("/settings")} className="cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        {/* Resize handle */}
        {!isCollapsed && (
          <div
            className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors z-10"
            onMouseDown={() => setIsResizing(true)}
          />
        )}
      </div>

      <SidebarInset className="flex flex-col min-h-screen">
        {/* Black top banner — desktop */}
        <header className="h-14 flex items-center gap-3 px-4 bg-black sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <AnimatedBrainLogo size="xs" intensity="subtle" color="oklch(0.78 0.18 195)" />
            <span className="font-display font-bold text-white tracking-tight">CEPHO</span>
          </div>
          {currentLabel && (
            <span className="text-sm text-white/50">· {currentLabel}</span>
          )}
          {/* Desktop quick action */}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setLocation("/genesis")}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[oklch(0.78_0.18_195)]/15 border border-[oklch(0.78_0.18_195)]/25 text-[oklch(0.78_0.18_195)] text-xs font-medium hover:bg-[oklch(0.78_0.18_195)]/25 transition-colors active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              New Project
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </>
  );
}

// Mobile floating action button for quick actions
function MobileQuickActionFAB({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [open, setOpen] = useState(false);

  const actions = [
    { icon: Bot, label: "Ask Victoria", path: "/victoria", color: "oklch(0.78 0.18 195)" },
    { icon: GitBranch, label: "New Project", path: "/genesis", color: "oklch(0.58 0.26 340)" },
    { icon: CheckSquare, label: "Add Task", path: "/tasks", color: "oklch(0.65 0.18 145)" },
    { icon: BookOpen, label: "Log Decision", path: "/decisions", color: "oklch(0.70 0.15 55)" },
  ];

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Action items */}
      {open && (
        <div className="fixed bottom-24 right-4 z-50 flex flex-col-reverse gap-3">
          {actions.map((action, i) => (
            <button
              key={action.path}
              onClick={() => { onNavigate(action.path); setOpen(false); }}
              className="flex items-center gap-3 self-end active:scale-95 transition-all"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <span className="text-sm font-medium text-foreground bg-white rounded-lg px-3 py-1.5 shadow-md border border-border">
                {action.label}
              </span>
              <div
                className="h-11 w-11 rounded-full flex items-center justify-center shadow-lg border border-white/20"
                style={{ backgroundColor: action.color }}
              >
                <action.icon className="h-5 w-5 text-white" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-[84px] right-4 z-50 h-14 w-14 rounded-full bg-[oklch(0.78_0.18_195)] shadow-lg shadow-[oklch(0.78_0.18_195)]/30 flex items-center justify-center active:scale-95 transition-all border border-white/20"
        aria-label="Quick actions"
      >
        <Plus
          className={`h-6 w-6 text-white transition-transform duration-200 ${open ? "rotate-45" : ""}`}
        />
      </button>
    </>
  );
}
