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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { 
  LayoutDashboard, LogOut, PanelLeft, 
  BookOpen, BarChart3, Lock, Fingerprint, Activity, Brain, Sun, Users, Moon, Keyboard, Settings, TrendingUp, Info, Clock, Sparkles, Rocket, Inbox
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";
import { BottomTabBar, MoreMenuSheet } from "./BottomTabBar";
import { QuickActionsBar } from "./QuickActionsBar";
import { MoodCheckModal } from "./MoodCheckModal";
import { KeyboardShortcutsHelp, useKeyboardShortcutsHelp } from "./KeyboardShortcutsHelp";
import { useMoodCheck } from "@/hooks/useMoodCheck";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { OnboardingModal, useOnboarding } from "./Onboarding";
import { AccessibilitySettings, SkipLink } from "./AccessibilitySettings";
import { Accessibility, Command } from "lucide-react";
import { CommandPalette, useCommandPalette } from "./CommandPalette";
import { useGovernance, GovernanceModeIndicator } from "@/hooks/useGovernance";
import { ChangelogModal, useChangelog, WhatsNewButton } from "./ChangelogModal";
import { StatusPulse } from "./StatusPulse";

const menuItems = [
  { icon: LayoutDashboard, label: "Command Center", path: "/dashboard", status: 'active' as const },
  { icon: Inbox, label: "Inbox", path: "/inbox", status: 'warning' as const, count: 8 },
  { icon: Rocket, label: "Project Genesis", path: "/project-genesis", status: 'success' as const },
  { icon: Sun, label: "Daily Brief", path: "/daily-brief", status: 'warning' as const, count: 3 },
  { icon: Users, label: "AI Experts", path: "/ai-experts" },
  { icon: Clock, label: "Review Queue", path: "/review-queue", status: 'warning' as const, count: 5 },
  { icon: BookOpen, label: "Library", path: "/library" },
  { icon: BarChart3, label: "Statistics", path: "/statistics" },
  { icon: Fingerprint, label: "Digital Twin", path: "/digital-twin", status: 'success' as const },
  { icon: Activity, label: "Workflow", path: "/workflow", status: 'active' as const, count: 2 },
  { icon: Lock, label: "The Vault", path: "/vault" },
  { icon: Moon, label: "Evening Review", path: "/evening-review" },
  { icon: Settings, label: "Settings", path: "/settings" },
  { icon: Info, label: "About The Brain", path: "/about" },
  { icon: TrendingUp, label: "Commercialization", path: "/commercialization" },
];

const SIDEBAR_WIDTH_KEY = "brain-sidebar-width";
const DEFAULT_WIDTH = 260;
const MIN_WIDTH = 200;
const MAX_WIDTH = 400;

export default function BrainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-6">
            <Brain className="w-16 h-16 text-primary animate-pulse" />
            <h1 className="text-3xl font-display font-bold tracking-tight text-center text-white">
              Welcome to The Brain
            </h1>
            <p className="text-sm text-white/60 text-center max-w-sm">
              Your AI-powered command center. Sign in to access your personalized intelligence hub.
            </p>
          </div>
          <Button
            onClick={() => {
              window.location.href = getLoginUrl();
            }}
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(255,16,240,0.3)] hover:shadow-[0_0_30px_rgba(255,16,240,0.5)] transition-all"
          >
            Sign in to Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <BrainLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </BrainLayoutContent>
    </SidebarProvider>
  );
}

type BrainLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function BrainLayoutContent({
  children,
  setSidebarWidth,
}: BrainLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = menuItems.find(item => item.path === location);
  const isMobile = useIsMobile();
  
  // Mood check state (3x daily)
  const { shouldShowMoodCheck, currentPeriod, recordMoodCheck, dismissMoodCheck } = useMoodCheck();
  
  // Onboarding state
  const { shouldShowOnboarding, completeOnboarding } = useOnboarding();
  
  // Accessibility settings state
  const [showAccessibilitySettings, setShowAccessibilitySettings] = useState(false);
  
  // Mobile more menu state
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  
  // Keyboard shortcuts
  const keyboardHelp = useKeyboardShortcutsHelp();
  const commandPalette = useCommandPalette();
  
  // Changelog modal
  const changelog = useChangelog();
  useKeyboardShortcuts([
    { key: '?', shift: true, action: keyboardHelp.toggle, description: 'Show keyboard shortcuts' },
  ]);

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  // Handle voice input from quick actions
  const handleVoiceInput = (transcript: string) => {
    console.log('Voice input:', transcript);
    // TODO: Process voice input through Digital Twin
  };

  return (
    <>
      <div className="relative" ref={sidebarRef}>
          <Sidebar
            collapsible="icon"
            className="border-r border-sidebar-border bg-sidebar backdrop-blur-xl"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-16 justify-center border-b border-sidebar-border">
            <div className="flex items-center gap-3 px-2 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-sidebar-accent rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring shrink-0"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4 text-sidebar-foreground/60" />
              </button>
              {!isCollapsed ? (
                <div className="flex items-center gap-2 min-w-0">
                  <Brain className="w-6 h-6 text-primary" />
                      <span className="font-display font-bold tracking-tight truncate text-sidebar-foreground">
                    THE BRAIN
                  </span>
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0 bg-transparent">
            <SidebarMenu className="px-2 py-3">
              {menuItems.map(item => {
                const isActive = location === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setLocation(item.path)}
                      tooltip={item.label}
                      className={`h-11 transition-all font-normal rounded-xl mb-1 ${isActive ? 'bg-sidebar-primary/20 text-sidebar-primary border border-sidebar-primary/30' : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'}`}
                    >
                      <StatusPulse 
                        status={item.status || 'idle'} 
                        count={item.count}
                        showPulse={!!item.status}
                        size="sm"
                      >
                        <item.icon
                          className={`h-5 w-5 ${isActive ? "text-primary" : ""}`}
                        />
                      </StatusPulse>
                      <span className="font-medium">{item.label}</span>
                      {item.count && item.count > 0 && (
                        <span className="ml-auto text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                          {item.count}
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-3 border-t border-sidebar-border">
            {/* Keyboard shortcuts hint */}
            {!isCollapsed && (
              <div className="flex flex-col gap-1 mb-2">
                <button
                  onClick={keyboardHelp.open}
                  className="flex items-center gap-2 px-2 py-1.5 text-xs text-sidebar-foreground/50 hover:text-sidebar-foreground/70 transition-colors rounded-lg hover:bg-sidebar-accent"
                >
                  <Keyboard className="w-3.5 h-3.5" />
                  <span>Press <kbd className="px-1 py-0.5 bg-sidebar-accent rounded text-[10px]">?</kbd> for shortcuts</span>
                </button>
                <button
                  onClick={() => setShowAccessibilitySettings(true)}
                  className="flex items-center gap-2 px-2 py-1.5 text-xs text-sidebar-foreground/50 hover:text-sidebar-foreground/70 transition-colors rounded-lg hover:bg-sidebar-accent"
                >
                  <Accessibility className="w-3.5 h-3.5" />
                  <span>Accessibility settings</span>
                </button>
                <button
                  onClick={changelog.open}
                  className="relative flex items-center gap-2 px-2 py-1.5 text-xs text-sidebar-foreground/50 hover:text-sidebar-foreground/70 transition-colors rounded-lg hover:bg-sidebar-accent"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>What's New</span>
                  {changelog.hasNewUpdates && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                  )}
                </button>
                <div className="pt-2 border-t border-sidebar-border mt-2">
                  <GovernanceModeIndicator className="w-full justify-center" />
                </div>
              </div>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-sidebar-accent transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring">
                  <Avatar className="h-9 w-9 border border-primary/30 shrink-0">
                    <AvatarFallback className="text-xs font-bold bg-primary/20 text-primary">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium truncate leading-none text-sidebar-foreground">
                      {user?.name || "-"}
                    </p>
                    <p className="text-xs text-sidebar-foreground/50 truncate mt-1.5">
                      {user?.email || "-"}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-popover border-border">
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-500/10"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/40 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset className="bg-background">
        {isMobile && (
            <div className="flex border-b border-border h-14 items-center justify-between bg-background/95 px-2 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9 rounded-lg bg-white/5 text-white" />
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-primary" />
                <span className="tracking-tight text-white font-medium">
                  {activeMenuItem?.label ?? "The Brain"}
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* Main content with bottom padding for mobile nav */}
        <main className={`flex-1 ${isMobile ? 'pb-20' : ''}`}>{children}</main>
        
        {/* Mobile bottom tab bar */}
        {isMobile && (
          <>
            <BottomTabBar onMorePress={() => setShowMoreMenu(true)} />
            <MoreMenuSheet isOpen={showMoreMenu} onClose={() => setShowMoreMenu(false)} />
          </>
        )}
        
        {/* Quick Actions FAB - always visible */}
        <QuickActionsBar 
          onVoiceInput={handleVoiceInput}
          position={isMobile ? 'bottom-right' : 'bottom-right'}
          className={isMobile ? 'bottom-24' : ''}
        />
      </SidebarInset>
      
      {/* Mood Check Modal (3x daily) */}
      <MoodCheckModal
        isOpen={shouldShowMoodCheck}
        onClose={dismissMoodCheck}
        onSubmit={recordMoodCheck}
        period={currentPeriod}
      />
      
      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp
        isOpen={keyboardHelp.isOpen}
        onClose={keyboardHelp.close}
      />
      
      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={shouldShowOnboarding}
        onComplete={completeOnboarding}
        onSkip={completeOnboarding}
      />
      
      {/* Accessibility Settings */}
      <AccessibilitySettings
        isOpen={showAccessibilitySettings}
        onClose={() => setShowAccessibilitySettings(false)}
      />
      
      {/* Command Palette (Cmd+K) */}
      <CommandPalette
        isOpen={commandPalette.isOpen}
        onClose={commandPalette.close}
      />
      
      {/* Changelog / What's New Modal */}
      <ChangelogModal
        isOpen={changelog.isOpen}
        onClose={changelog.close}
      />
    </>
  );
}
