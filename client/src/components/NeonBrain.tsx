import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface NeonBrainProps {
  mood?: number; // 1-10
  state?: "idle" | "thinking" | "processing";
  className?: string;
}

export default function NeonBrain({ mood = 5, state = "idle", className = "" }: NeonBrainProps) {
  const [color, setColor] = useState("var(--color-primary)");

  // Determine color based on mood
  useEffect(() => {
    if (mood >= 8) setColor("#10b981"); // Bright Emerald
    else if (mood >= 5) setColor("#06b6d4"); // Bright Cyan
    else if (mood >= 3) setColor("#a855f7"); // Bright Purple
    else setColor("#f59e0b"); // Bright Amber
  }, [mood]);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Intense Outer Glow Layer */}
      <motion.div
        className="absolute inset-0 rounded-full blur-[80px] opacity-60"
        style={{ backgroundColor: color }}
        animate={{
          scale: state === "thinking" ? [1, 1.3, 1] : [1, 1.15, 1],
          opacity: state === "thinking" ? [0.5, 0.8, 0.5] : [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: state === "thinking" ? 0.5 : 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Brain SVG Structure */}
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full relative z-10 overflow-visible"
        style={{ filter: `drop-shadow(0 0 20px ${color})` }}
      >
        <defs>
          <filter id="glow-intense" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Left Hemisphere - Thicker Stroke */}
        <motion.path
          d="M60,100 C60,60 90,40 100,40 C90,40 80,50 80,80 C80,110 60,130 60,100 Z"
          fill="none"
          stroke={color}
          strokeWidth="3"
          filter="url(#glow-intense)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        <motion.path
          d="M60,100 C60,140 90,160 100,160 C90,160 80,150 80,120 C80,90 60,70 60,100 Z"
          fill="none"
          stroke={color}
          strokeWidth="3"
          filter="url(#glow-intense)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
        />

        {/* Right Hemisphere - Thicker Stroke */}
        <motion.path
          d="M140,100 C140,60 110,40 100,40 C110,40 120,50 120,80 C120,110 140,130 140,100 Z"
          fill="none"
          stroke={color}
          strokeWidth="3"
          filter="url(#glow-intense)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        <motion.path
          d="M140,100 C140,140 110,160 100,160 C110,160 120,150 120,120 C120,90 140,70 140,100 Z"
          fill="none"
          stroke={color}
          strokeWidth="3"
          filter="url(#glow-intense)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
        />

        {/* Intense Neural Activity - More Dots, Faster Animation */}
        {[...Array(15)].map((_, i) => (
          <motion.circle
            key={i}
            r={Math.random() * 3 + 1}
            fill="white"
            filter="url(#glow-intense)"
            initial={{ 
              cx: 100, 
              cy: 100, 
              opacity: 0 
            }}
            animate={{
              cx: [100, 60 + Math.random() * 80],
              cy: [100, 40 + Math.random() * 120],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0]
            }}
            transition={{
              duration: 0.8 + Math.random() * 1.5, // Faster
              repeat: Infinity,
              repeatDelay: Math.random() * 0.5,
              ease: "easeOut",
            }}
          />
        ))}
      </svg>
    </div>
  );
}
