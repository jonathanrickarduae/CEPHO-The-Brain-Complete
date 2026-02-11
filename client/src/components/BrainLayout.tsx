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
  BookOpen, BarChart3, Lock, Briefcase, Activity, Brain, Sun, Users, Moon, Keyboard, Settings, TrendingUp, Info, Clock, Sparkles, Rocket, Inbox, Search, Video, Bell, Mic, Podcast, Heart, Globe, Library, Workflow, FileText, ChevronDown, ChevronRight
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";
import { BottomTabBar } from "./BottomTabBar";
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
import { GlobalSearch } from "./GlobalSearch";
import NeonBrain from "./NeonBrain";
import AnimatedBrainLogo from "./AnimatedBrainLogo";
import { NotificationBell } from "./NotificationCenter";
import { CephoLandingPage } from "./CephoLandingPage";
import { ThemeToggle } from "./ThemeToggle";

// Core navigation - streamlined for professional use (COS-centric view)
type MenuItem = {
  icon: any;
  label: string;
  path: string;
  count?: number;
  children?: MenuItem[];
};

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "The Nexus", path: "/dashboard" },
  { icon: Rocket, label: "Project Genesis", path: "/project-genesis" },
  { 
    icon: Sun, 
    label: "The Signal", 
    path: "/daily-brief", 
    count: 3,
    children: [
      { icon: Sparkles, label: "Morning Signal", path: "/morning-signal" },
      { icon: Moon, label: "Evening Review", path: "/evening-review" },
    ]
  },
  { 
    icon: Briefcase, 
    label: "Chief of Staff", 
    path: "/digital-twin",
    children: [
      { icon: Activity, label: "Development Pathway", path: "/development-pathway" },
      { icon: Brain, label: "COS Training", path: "/cos-training" },
    ]
  },
  { icon: Users, label: "AI-SMEs", path: "/ai-experts" },
  { 
    icon: TrendingUp, 
    label: "Innovation", 
    path: "/innovation-hub",
    children: [
      { icon: TrendingUp, label: "Innovation Hub", path: "/innovation-hub" },
      { icon: Workflow, label: "Workflow", path: "/workflow", count: 2 },
      { icon: Globe, label: "Commercialization", path: "/commercialization" },
    ]
  },
  { 
    icon: Library, 
    label: "Knowledge", 
    path: "/library",
    children: [
      { icon: Library, label: "Library", path: "/library" },
      { icon: FileText, label: "Documents", path: "/documents" },
      { icon: Lock, label: "Vault", path: "/vault" },
    ]
  },
  { 
    icon: BarChart3, 
    label: "Analytics", 
    path: "/statistics",
    children: [
      { icon: BarChart3, label: "Statistics", path: "/statistics" },
      { icon: Globe, label: "Central Hub", path: "/central-hub" },
      { icon: TrendingUp, label: "Operations", path: "/operations" },
    ]
  },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const SIDEBAR_WIDTH_KEY = "cepho-sidebar-width";
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
    return <CephoLandingPage />;
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
  
  // Keyboard shortcuts
  const keyboardHelp = useKeyboardShortcutsHelp();
  const commandPalette = useCommandPalette();
  
  // Changelog modal
  const changelog = useChangelog();
  
  // Global search state
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  
  // Collapsible navigation groups state - collapsed by default for clean look
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  
  const toggleGroup = (groupLabel: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupLabel) 
        ? prev.filter(g => g !== groupLabel)
        : [...prev, groupLabel]
    );
  };
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
    // Voice input is processed through the Chief of Staff interface
    // Navigate to COS page with the transcript as context
    if (transcript.trim()) {
      setLocation('/chief-of-staff?voice=' + encodeURIComponent(transcript));
    }
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
                  <AnimatedBrainLogo size="xs" intensity="subtle" color="var(--color-primary)" />
                      <span className="font-display font-bold tracking-tight truncate text-sidebar-foreground">
                    CEPHO
                  </span>
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0 bg-transparent">
            <SidebarMenu className="px-2 py-3">
              {menuItems.map(item => {
                const isActive = location === item.path;
                const hasChildren = item.children && item.children.length > 0;
                const isChildActive = hasChildren && item.children?.some(child => location === child.path);
                const isExpanded = expandedGroups.includes(item.label);
                
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive || isChildActive}
                      onClick={() => {
                        if (hasChildren) {
                          toggleGroup(item.label);
                        } else {
                          setLocation(item.path);
                        }
                      }}
                      tooltip={item.label}
                      className={`h-10 transition-all font-normal rounded-lg mb-0.5 ${isActive || isChildActive ? 'bg-primary/10 text-primary' : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'}`}
                    >
                      <item.icon
                        className={`h-4 w-4 ${isActive || isChildActive ? "text-primary" : "text-sidebar-foreground/50"}`}
                      />
                      <span className="text-sm">{item.label}</span>
                      {item.count && item.count > 0 && (
                        <span className="ml-auto text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-medium">
                          {item.count}
                        </span>
                      )}
                      {hasChildren && (
                        <span className="ml-auto">
                          <ChevronRight 
                            className={`h-3 w-3 text-sidebar-foreground/50 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} 
                          />
                        </span>
                      )}
                    </SidebarMenuButton>
                    {/* Render children if expanded - with smooth animation */}
                    {hasChildren && (
                      <div 
                        className={`ml-4 mt-0.5 space-y-0.5 overflow-hidden transition-all duration-200 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                      >
                        {item.children?.map(child => {
                          const isChildItemActive = location === child.path;
                          return (
                            <SidebarMenuButton
                              key={child.path}
                              isActive={isChildItemActive}
                              onClick={() => setLocation(child.path)}
                              tooltip={child.label}
                              className={`h-9 transition-all font-normal rounded-lg ${isChildItemActive ? 'bg-primary/10 text-primary' : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'}`}
                            >
                              <child.icon
                                className={`h-3.5 w-3.5 ${isChildItemActive ? "text-primary" : "text-sidebar-foreground/40"}`}
                              />
                              <span className="text-xs">{child.label}</span>
                            </SidebarMenuButton>
                          );
                        })}
                      </div>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-3 border-t border-sidebar-border">
            {/* Minimal footer - just user profile */}
            
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
            <div className="flex border-b border-border h-14 items-center justify-between bg-black px-2 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9 rounded-lg bg-white/5 text-white" />
              <div className="flex items-center gap-3">
                <AnimatedBrainLogo size="xs" intensity="subtle" color="var(--color-primary)" />
                <span className="tracking-tight text-white font-bold">
                  CEPHO | {activeMenuItem?.label ?? "The Nexus"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowGlobalSearch(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-foreground/70 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Search...</span>
              </button>
              <ThemeToggle />
              <NotificationBell />
            </div>
          </div>
        )}
        
        {/* Main content with bottom padding for mobile nav */}
        <main className={`flex-1 ${isMobile ? 'pb-20' : ''}`}>{children}</main>
        
        {/* Mobile bottom tab bar - horizontally scrollable */}
        {isMobile && <BottomTabBar />}
        
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
      
      {/* Global Search Modal */}
      <GlobalSearch
        isOpen={showGlobalSearch}
        onClose={() => setShowGlobalSearch(false)}
      />
    </>
  );
}
