import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import NeonBrain from "@/components/ai-agents/NeonBrain";

/**
 * Cepho Landing Page
 * Features animated transition between "Cepho" and "The Brain" 
 * to connect the Greek etymology with the English meaning
 */
export function CephoLandingPage() {
  const [showBrain, setShowBrain] = useState(false);

  // Alternate between Cepho and The Brain every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setShowBrain(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black overflow-hidden">
      {/* Background neural network effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-transparent to-transparent" />
      </div>
      
      <div className="flex flex-col items-center gap-6 p-8 max-w-xl w-full relative z-10">
        {/* Animated Brain Logo with Neural Nodes */}
        <NeonBrain size="xl" state="thinking" mood={85} />
        
        {/* Animated Brand Name Transition */}
        <div className="flex flex-col items-center gap-2 mt-4 min-h-[140px]">
          <AnimatePresence mode="wait">
            {showBrain ? (
              <motion.div
                key="brain"
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="flex flex-col items-center"
              >
                <h1 className="text-6xl md:text-7xl font-display font-bold tracking-tight text-center text-white">
                  The Brain
                </h1>
                <p className="text-sm text-white/40 mt-3 italic">
                  English
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="cepho"
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="flex flex-col items-center"
              >
                <h1 className="text-6xl md:text-7xl font-display font-bold tracking-tight text-center bg-gradient-to-r from-primary via-pink-400 to-primary bg-clip-text text-transparent">
                  Cepho
                </h1>
                <p className="text-sm text-white/40 mt-3 italic">
                  From the Greek for brain
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Main Tagline */}
        <motion.div 
          className="text-center space-y-4 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-xl text-white/80 font-medium">
            Get you operating at 100
          </p>
          <p className="text-sm text-white/50 max-w-md mx-auto leading-relaxed">
            Your AI-powered Chief of Staff. One interface to manage your life, 
            amplified by intelligence that learns from you and works alongside you.
          </p>
        </motion.div>
        
        {/* Sign In Button */}
        <Button
          onClick={() => {
            window.location.href = getLoginUrl();
          }}
          size="lg"
          className="w-full max-w-xs mt-6 bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(255,16,240,0.3)] hover:shadow-[0_0_30px_rgba(255,16,240,0.5)] transition-all text-base py-6"
        >
          Sign in to Continue
        </Button>


      </div>
    </div>
  );
}

export default CephoLandingPage;
