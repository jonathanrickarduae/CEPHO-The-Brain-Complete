import { Link, useLocation } from "wouter";
import { Brain, Search, Plus, Settings, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 glass border-b border-white/10 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-md group-hover:bg-primary/40 transition-all duration-500"></div>
                <Brain className="w-8 h-8 text-primary relative z-10 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="font-display font-bold text-2xl tracking-wider text-foreground neon-text">CEPHO</span>
            </div>
          </Link>
        </div>

        <div className="flex-1 max-w-md mx-8 hidden md:block">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-sm group-hover:bg-primary/20 transition-all duration-300"></div>
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search your thoughts..." 
                className="pl-10 bg-black/20 border-white/10 rounded-full focus:ring-primary/50 focus:border-primary/50 transition-all duration-300"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 hover:text-primary transition-colors">
            <Share2 className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 hover:text-primary transition-colors">
            <Settings className="w-5 h-5" />
          </Button>
          <Button className="rounded-full bg-primary hover:bg-primary/80 text-primary-foreground shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:shadow-[0_0_25px_rgba(0,240,255,0.5)] transition-all duration-300 font-display font-bold tracking-wide">
            <Plus className="w-4 h-4 mr-2" /> NEW NODE
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pt-16 relative z-10">
        {children}
      </main>

      {/* Background Particles (CSS only for now, could be canvas later) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-secondary/5 rounded-full blur-[80px] animate-pulse delay-1000"></div>
      </div>
    </div>
  );
}
