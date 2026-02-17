import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import NeonBrain from '@/components/ai-agents/NeonBrain';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Sun, Moon, Blend } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

// Animated Cepho/Brain name transition
function CephoNameAnimation() {
  const [showBrain, setShowBrain] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowBrain(prev => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[80px] flex flex-col items-center">
      <AnimatePresence mode="wait">
        {showBrain ? (
          <motion.div
            key="brain"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center"
          >
            <h1 className="font-display font-bold text-5xl md:text-7xl tracking-wider text-pink-500 drop-shadow-[0_0_30px_rgba(236,72,153,0.6)]">
              The Brain
            </h1>
            <p className="text-sm text-muted-foreground mt-1 italic">English</p>
          </motion.div>
        ) : (
          <motion.div
            key="cepho"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center"
          >
            <h1 className="font-display font-bold text-5xl md:text-7xl tracking-wider bg-gradient-to-r from-primary via-pink-400 to-primary bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(236,72,153,0.6)]">
              Cepho
            </h1>
            <p className="text-sm text-muted-foreground mt-1 italic">From the Greek for brain</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Check if mood was already captured today for this time period
function shouldShowMoodCheck(): boolean {
  const now = new Date();
  const hour = now.getHours();
  const today = now.toDateString();
  
  // Determine current period
  let period: string;
  if (hour >= 5 && hour < 12) {
    period = 'morning';
  } else if (hour >= 12 && hour < 17) {
    period = 'afternoon';
  } else {
    period = 'evening';
  }
  
  const key = `mood_${today}_${period}`;
  return !localStorage.getItem(key);
}

function saveMoodCheck(mood: number): void {
  const now = new Date();
  const hour = now.getHours();
  const today = now.toDateString();
  
  let period: string;
  if (hour >= 5 && hour < 12) {
    period = 'morning';
  } else if (hour >= 12 && hour < 17) {
    period = 'afternoon';
  } else {
    period = 'evening';
  }
  
  const key = `mood_${today}_${period}`;
  localStorage.setItem(key, JSON.stringify({ mood, timestamp: now.toISOString() }));
}

export default function Landing() {
  const [_, setLocation] = useLocation();
  const [step, setStep] = useState<"splash" | "mood">("splash");
  const [mood, setMood] = useState([50]); // 0-100 scale (100% Optimization)
  const { theme, setTheme } = useTheme();
  const [needsMoodCheck, setNeedsMoodCheck] = useState(false);

  // Check on mount if we need mood check
  useEffect(() => {
    setNeedsMoodCheck(shouldShowMoodCheck());
  }, []);

  // Auto-advance from splash after brief delay
  // ALWAYS show mood check first for new users - this is the first interaction
  // The "Getting you to 100" philosophy starts from the very first moment - 100% Optimization
  useEffect(() => {
    const timer = setTimeout(() => {
      if (needsMoodCheck) {
        // Always show mood check first - it's the core USP
        setStep("mood");
      } else {
        // Skip straight to dashboard if mood already captured today
        setLocation("/dashboard");
      }
    }, 1500); // 1.5 second splash showing Cepho

    return () => clearTimeout(timer);
  }, [needsMoodCheck, setLocation]);

  const handleMoodSubmit = () => {
    saveMoodCheck(mood[0]);
    // After mood check, go to dashboard (onboarding will show there if needed)
    setLocation("/dashboard");
  };

  const handleSkip = () => {
    // Even if skipped, mark that we asked
    setLocation("/dashboard");
  };

  const themeOptions = [
    { id: "light" as const, label: "Light", icon: Sun },
    { id: "dark" as const, label: "Dark", icon: Moon },
    { id: "mix" as const, label: "Mix", icon: Blend },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>

      {/* Theme Selector - Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <div className="flex items-center gap-1 p-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isActive = theme === option.id;
            return (
              <button
                key={option.id}
                onClick={() => setTheme(option.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300
                  ${isActive 
                    ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(255,16,240,0.4)]" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium tracking-wide">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === "splash" ? (
          <motion.div
            key="splash"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="z-10 flex flex-col items-center text-center"
          >
            <NeonBrain size="xl" className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 mb-8" state="thinking" />
            
            <CephoNameAnimation />
            
            {/* Loading indicator */}
            <div className="mt-8 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="mood"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="z-10 flex flex-col items-center text-center max-w-xl px-6 w-full"
          >
            <NeonBrain size="lg" className="w-48 h-48 md:w-56 md:h-56 mb-6" mood={mood[0]} state="thinking" />
            
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-2">How are you feeling?</h2>
            <p className="text-muted-foreground mb-8 text-sm">Quick check-in to calibrate your day</p>

            <div className="w-full max-w-md mb-8 relative">
              <div className="flex justify-between text-xs font-mono text-muted-foreground mb-4 uppercase tracking-widest">
                <span>0</span>
                <span>100</span>
              </div>
              
              <Slider
                value={mood}
                onValueChange={setMood}
                max={100}
                min={0}
                step={5}
                className="py-4"
              />
              
              <div className="mt-4 text-center">
                <span className="font-display font-bold text-5xl text-primary neon-text">
                  {mood[0]}
                </span>
                <span className="block text-sm text-muted-foreground mt-1">
                  {mood[0] <= 30 ? "Let's work on that" : mood[0] <= 60 ? "Room to grow" : mood[0] <= 80 ? "Looking good" : "Peak state!"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-xs">
              <Button 
                onClick={handleMoodSubmit}
                className="w-full py-5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold tracking-widest rounded-xl shadow-[0_0_20px_rgba(255,16,240,0.4)] hover:shadow-[0_0_40px_rgba(255,16,240,0.6)] transition-all duration-300"
              >
                {mood[0] < 60 ? "LET'S GET YOU TO 100" : "LET'S GO"}
              </Button>
              
              <button 
                onClick={handleSkip}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip for now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
