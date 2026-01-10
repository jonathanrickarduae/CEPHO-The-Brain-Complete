import { Link, useLocation } from "wouter";
import { 
  Brain, 
  LayoutDashboard, 
  Activity, 
  Users, 
  Settings, 
  Command, 
  Search,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";

export default function DesktopLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  // Keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Trigger command palette (to be implemented)
        console.log("Command palette triggered");
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    { icon: Brain, label: "The Brain", path: "/" },
    { icon: Activity, label: "Wellbeing", path: "/wellbeing" },
    { icon: Users, label: "Leads", path: "/leads" },
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  ];

  return (
    <div className="min-h-screen flex bg-background text-foreground font-sans overflow-hidden selection:bg-primary/30">
      {/* Sidebar - Superhuman Style */}
      <aside className="w-64 border-r border-white/5 bg-sidebar flex flex-col z-20">
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-md group-hover:bg-primary/40 transition-all duration-500"></div>
              <Brain className="w-6 h-6 text-primary relative z-10" />
            </div>
            <span className="font-display font-bold text-xl tracking-wider text-foreground">THE BRAIN</span>
          </div>
        </div>

        <div className="p-4">
          <Button 
            variant="outline" 
            className="w-full justify-between bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/50 text-muted-foreground hover:text-primary transition-all group mb-6"
          >
            <span className="flex items-center gap-2"><Search className="w-4 h-4" /> Search...</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-white/10 bg-black px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 group-hover:text-primary">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <div className={`
                    flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all cursor-pointer
                    ${isActive 
                      ? "bg-primary/10 text-primary border-l-2 border-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5 border-l-2 border-transparent"}
                  `}>
                    <item.icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/5 cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-xs font-bold text-white">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">John Doe</p>
              <p className="text-xs text-muted-foreground truncate">john@company.com</p>
            </div>
            <Settings className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-background/50 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              <Zap className="w-3 h-3 text-primary animate-pulse" />
              <span className="text-xs font-medium text-primary tracking-wide">EDGE COMPUTE ACTIVE</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground font-mono">v2.0.1-beta</span>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 relative z-10">
          {children}
        </div>

        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] opacity-30"></div>
        </div>
      </main>
    </div>
  );
}
