import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import NeonBrain from "@/components/NeonBrain";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ArrowRight, Sun, Moon, Blend } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function Landing() {
  const [_, setLocation] = useLocation();
  const [step, setStep] = useState<"intro" | "mood">("intro");
  const [mood, setMood] = useState([5]);
  const { theme, setTheme } = useTheme();

  const handleStart = () => {
    setStep("mood");
  };

  const handleMoodSubmit = () => {
    // In a real app, we'd save the mood here
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
        {step === "intro" ? (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="z-10 flex flex-col items-center text-center max-w-2xl px-6"
          >
            <NeonBrain className="w-64 h-64 mb-8" state="idle" />
            
            <h1 className="font-display font-bold text-6xl md:text-8xl tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 mb-6 neon-text">
              THE BRAIN
            </h1>
            
            <p className="text-xl text-muted-foreground mb-12 font-light tracking-wide max-w-lg text-center">
              Your collective intelligence hub.<br />
              Optimized for speed, insight, and clarity.
            </p>

            <Button 
              onClick={handleStart}
              className="group relative px-8 py-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/50 rounded-full transition-all duration-500"
            >
              <span className="font-display font-bold text-lg tracking-widest mr-2 group-hover:text-primary transition-colors">ENTER SYSTEM</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 group-hover:text-primary transition-all" />
              
              {/* Button Glow */}
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[0_0_30px_rgba(255,16,240,0.3)]"></div>
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="mood"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="z-10 flex flex-col items-center text-center max-w-xl px-6 w-full"
          >
            <NeonBrain className="w-48 h-48 mb-8" mood={mood[0]} state="thinking" />
            
            <h2 className="font-display font-bold text-4xl mb-2">How are you feeling today?</h2>
            <p className="text-muted-foreground mb-12">Let's calibrate your cognitive state.</p>

            <div className="w-full max-w-md mb-12 relative">
              <div className="flex justify-between text-xs font-mono text-muted-foreground mb-4 uppercase tracking-widest">
                <span>Drained (1)</span>
                <span>Peak (10)</span>
              </div>
              
              <Slider
                value={mood}
                onValueChange={setMood}
                max={10}
                min={1}
                step={1}
                className="py-4"
              />
              
              <div className="mt-6 text-center">
                <span className="font-display font-bold text-6xl text-primary neon-text">
                  {mood[0]}
                </span>
              </div>
            </div>

            <Button 
              onClick={handleMoodSubmit}
              className="w-full max-w-xs py-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold tracking-widest rounded-lg shadow-[0_0_20px_rgba(255,16,240,0.4)] hover:shadow-[0_0_40px_rgba(255,16,240,0.6)] transition-all duration-300"
            >
              {mood[0] < 6 ? "LET'S GET YOU TO A 10" : "MAINTAIN MOMENTUM"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
