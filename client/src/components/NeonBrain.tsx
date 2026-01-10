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
    if (mood >= 8) setColor("var(--color-chart-4)"); // Green/Success
    else if (mood >= 5) setColor("var(--color-chart-2)"); // Cyan/Calm
    else if (mood >= 3) setColor("var(--color-chart-3)"); // Purple/Neutral
    else setColor("var(--color-chart-5)"); // Orange/Alert
  }, [mood]);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Outer Glow Layer */}
      <motion.div
        className="absolute inset-0 rounded-full blur-[60px] opacity-40"
        style={{ backgroundColor: color }}
        animate={{
          scale: state === "thinking" ? [1, 1.2, 1] : [1, 1.1, 1],
          opacity: state === "thinking" ? [0.4, 0.6, 0.4] : [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: state === "thinking" ? 0.5 : 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Brain SVG Structure */}
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full relative z-10 drop-shadow-[0_0_15px_rgba(255,16,240,0.5)]"
        style={{ filter: `drop-shadow(0 0 10px ${color})` }}
      >
        {/* Left Hemisphere */}
        <motion.path
          d="M60,100 C60,60 90,40 100,40 C90,40 80,50 80,80 C80,110 60,130 60,100 Z"
          fill="none"
          stroke={color}
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        <motion.path
          d="M60,100 C60,140 90,160 100,160 C90,160 80,150 80,120 C80,90 60,70 60,100 Z"
          fill="none"
          stroke={color}
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
        />

        {/* Right Hemisphere */}
        <motion.path
          d="M140,100 C140,60 110,40 100,40 C110,40 120,50 120,80 C120,110 140,130 140,100 Z"
          fill="none"
          stroke={color}
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        <motion.path
          d="M140,100 C140,140 110,160 100,160 C110,160 120,150 120,120 C120,90 140,70 140,100 Z"
          fill="none"
          stroke={color}
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
        />

        {/* Neural Connections (Animated Dots) */}
        {[...Array(8)].map((_, i) => (
          <motion.circle
            key={i}
            r="2"
            fill="white"
            initial={{ 
              cx: 100, 
              cy: 100, 
              opacity: 0 
            }}
            animate={{
              cx: [100, 60 + Math.random() * 80],
              cy: [100, 40 + Math.random() * 120],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1 + Math.random() * 2,
              repeat: Infinity,
              repeatDelay: Math.random(),
              ease: "easeOut",
            }}
          />
        ))}
      </svg>
    </div>
  );
}
