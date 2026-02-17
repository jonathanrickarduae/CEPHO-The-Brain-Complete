import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
// import NeonBrain from "./NeonBrain"; // Removed - causing display issues
import { 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Bell,
  Search,
  Library,
  FolderOpen,
  FileText,
  Clock
} from "lucide-react";
import { Button } from "./ui/button";

interface DesktopLayoutProps {
  children: ReactNode;
}

export default function DesktopLayout({ children }: DesktopLayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Library, label: "Library", path: "/library" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 border-r border-white/5 bg-black/20 backdrop-blur-xl flex flex-col z-20">
        <div className="p-6 flex items-center gap-3">
          <span className="font-display font-bold text-2xl tracking-wider neon-text">CEPHO</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group relative
                ${location === item.path 
                  ? "bg-primary/10 text-primary border border-primary/20" 
                  : "text-muted-foreground hover:text-white hover:bg-white/5"}
              `}>
                <item.icon className="w-5 h-5" />
                <span className="hidden lg:block font-medium">{item.label}</span>
                
                {location === item.path && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"
                  />
                )}
              </a>
            </Link>
          ))}

          {/* Library Quick Access (Visual Only) */}
          <div className="mt-8 px-4 hidden lg:block">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Recent Blueprints</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground hover:text-white cursor-pointer group">
                <FolderOpen className="w-4 h-4 group-hover:text-primary transition-colors" />
                <span className="truncate">Project Alpha Merger</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground hover:text-white cursor-pointer group">
                <FileText className="w-4 h-4 group-hover:text-cyan-400 transition-colors" />
                <span className="truncate">Mars Colony Legal...</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground hover:text-white cursor-pointer group">
                <Clock className="w-4 h-4 group-hover:text-orange-400 transition-colors" />
                <span className="truncate">Q3 Strategy Review</span>
              </div>
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-white">
            <LogOut className="w-5 h-5 lg:mr-2" />
            <span className="hidden lg:block">Disconnect</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Background Ambient Light */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
          <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px]"></div>
        </div>

        {/* Top Bar */}
        <header className="h-16 border-b border-white/5 bg-black/10 backdrop-blur-sm flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              System Online
            </span>
            <span className="text-white/20">|</span>
            <span>v2.4.0 (Neural Core)</span>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
              <Search className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></span>
            </Button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 border border-white/20"></div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8 z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
