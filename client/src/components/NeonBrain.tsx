import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";

interface NeonBrainProps {
  mood?: number; // 0-100 (100% Optimization Scale)
  state?: "idle" | "thinking" | "processing";
  className?: string;
  size?: "sm" | "md" | "lg" | "xl"; // Size variants
}

// Generate random particles that persist across renders
function generateParticles(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    radius: Math.random() * 3 + 1.5,
    startX: 100,
    startY: 100,
    endX: 50 + Math.random() * 100,
    endY: 30 + Math.random() * 140,
    duration: 1.2 + Math.random() * 2,
    delay: Math.random() * 2,
  }));
}

// Generate neural connection paths
function generateConnections(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x1: 60 + Math.random() * 80,
    y1: 50 + Math.random() * 100,
    x2: 60 + Math.random() * 80,
    y2: 50 + Math.random() * 100,
    duration: 2 + Math.random() * 3,
    delay: Math.random() * 2,
  }));
}

export default function NeonBrain({ 
  mood = 75, // Default to 75 on 0-100 scale
  state = "idle", 
  className = "",
  size = "lg"
}: NeonBrainProps) {
  const [color, setColor] = useState("var(--color-primary)");
  
  // Memoize particles and connections so they don't regenerate on every render
  const particles = useMemo(() => generateParticles(25), []);
  const connections = useMemo(() => generateConnections(8), []);
  const orbitingNodes = useMemo(() => generateParticles(6), []);

  // Size classes
  const sizeClasses = {
    sm: "w-24 h-24",
    md: "w-40 h-40",
    lg: "w-56 h-56",
    xl: "w-72 h-72"
  };

  // Determine color based on mood (0-100 scale)
  useEffect(() => {
    if (mood >= 90) setColor("#10b981"); // Bright Emerald - Excellent
    else if (mood >= 75) setColor("#06b6d4"); // Bright Cyan - Good
    else if (mood >= 60) setColor("#a855f7"); // Bright Purple - Adequate
    else if (mood >= 40) setColor("#f59e0b"); // Bright Amber - Needs Work
    else setColor("#ef4444"); // Bright Red - Critical
  }, [mood]);

  // Animation speed based on state
  const pulseSpeed = state === "thinking" ? 0.8 : state === "processing" ? 1.2 : 2;
  const particleSpeed = state === "thinking" ? 0.6 : 1;

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      {/* Intense Outer Glow Layer 1 */}
      <motion.div
        className="absolute inset-[-20%] rounded-full blur-[60px]"
        style={{ backgroundColor: color }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: pulseSpeed * 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Intense Outer Glow Layer 2 - Offset timing */}
      <motion.div
        className="absolute inset-[-10%] rounded-full blur-[40px]"
        style={{ backgroundColor: color }}
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: pulseSpeed * 1.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />

      {/* Core Glow */}
      <motion.div
        className="absolute inset-[10%] rounded-full blur-[20px]"
        style={{ backgroundColor: color }}
        animate={{
          opacity: [0.6, 0.9, 0.6],
        }}
        transition={{
          duration: pulseSpeed,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Brain SVG Structure */}
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full relative z-10 overflow-visible"
        style={{ filter: `drop-shadow(0 0 25px ${color}) drop-shadow(0 0 50px ${color})` }}
      >
        <defs>
          <filter id="glow-intense" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          {/* Gradient for connections */}
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0" />
            <stop offset="50%" stopColor={color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Neural Connections - Always animating */}
        {connections.map((conn) => (
          <motion.line
            key={`conn-${conn.id}`}
            x1={conn.x1}
            y1={conn.y1}
            x2={conn.x2}
            y2={conn.y2}
            stroke="url(#connectionGradient)"
            strokeWidth="1.5"
            filter="url(#glow-soft)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: [0, 1, 1, 0],
              opacity: [0, 0.8, 0.8, 0],
            }}
            transition={{
              duration: conn.duration,
              repeat: Infinity,
              delay: conn.delay,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Left Hemisphere - Pulsing */}
        <motion.path
          d="M60,100 C60,60 90,40 100,40 C90,40 80,50 80,80 C80,110 60,130 60,100 Z"
          fill="none"
          stroke={color}
          strokeWidth="3.5"
          filter="url(#glow-intense)"
          animate={{
            strokeWidth: [3.5, 4, 3.5],
            opacity: [0.9, 1, 0.9],
          }}
          transition={{
            duration: pulseSpeed,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.path
          d="M60,100 C60,140 90,160 100,160 C90,160 80,150 80,120 C80,90 60,70 60,100 Z"
          fill="none"
          stroke={color}
          strokeWidth="3.5"
          filter="url(#glow-intense)"
          animate={{
            strokeWidth: [3.5, 4, 3.5],
            opacity: [0.9, 1, 0.9],
          }}
          transition={{
            duration: pulseSpeed,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.3,
          }}
        />

        {/* Right Hemisphere - Pulsing */}
        <motion.path
          d="M140,100 C140,60 110,40 100,40 C110,40 120,50 120,80 C120,110 140,130 140,100 Z"
          fill="none"
          stroke={color}
          strokeWidth="3.5"
          filter="url(#glow-intense)"
          animate={{
            strokeWidth: [3.5, 4, 3.5],
            opacity: [0.9, 1, 0.9],
          }}
          transition={{
            duration: pulseSpeed,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.15,
          }}
        />
        <motion.path
          d="M140,100 C140,140 110,160 100,160 C110,160 120,150 120,120 C120,90 140,70 140,100 Z"
          fill="none"
          stroke={color}
          strokeWidth="3.5"
          filter="url(#glow-intense)"
          animate={{
            strokeWidth: [3.5, 4, 3.5],
            opacity: [0.9, 1, 0.9],
          }}
          transition={{
            duration: pulseSpeed,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.45,
          }}
        />

        {/* Center Stem */}
        <motion.path
          d="M100,40 L100,160"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeDasharray="4 4"
          filter="url(#glow-soft)"
          animate={{
            strokeDashoffset: [0, -16],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            strokeDashoffset: {
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            },
            opacity: {
              duration: pulseSpeed,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        />

        {/* Neural Activity Particles - Always firing */}
        {particles.map((particle) => (
          <motion.circle
            key={`particle-${particle.id}`}
            r={particle.radius}
            fill="white"
            filter="url(#glow-intense)"
            initial={{ 
              cx: particle.startX, 
              cy: particle.startY, 
              opacity: 0,
              scale: 0
            }}
            animate={{
              cx: [particle.startX, particle.endX, particle.endX],
              cy: [particle.startY, particle.endY, particle.endY],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0]
            }}
            transition={{
              duration: particle.duration * particleSpeed,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeOut",
            }}
          />
        ))}

        {/* Orbiting Nodes - Constant motion */}
        {orbitingNodes.map((node, i) => (
          <motion.circle
            key={`orbit-${node.id}`}
            r={3}
            fill={color}
            filter="url(#glow-intense)"
            initial={{ 
              cx: 100 + 50 * Math.cos((i * Math.PI * 2) / 6),
              cy: 100 + 50 * Math.sin((i * Math.PI * 2) / 6),
            }}
            animate={{
              cx: [
                100 + 50 * Math.cos((i * Math.PI * 2) / 6),
                100 + 55 * Math.cos((i * Math.PI * 2) / 6 + Math.PI / 3),
                100 + 50 * Math.cos((i * Math.PI * 2) / 6 + Math.PI * 2 / 3),
                100 + 45 * Math.cos((i * Math.PI * 2) / 6 + Math.PI),
                100 + 50 * Math.cos((i * Math.PI * 2) / 6),
              ],
              cy: [
                100 + 50 * Math.sin((i * Math.PI * 2) / 6),
                100 + 55 * Math.sin((i * Math.PI * 2) / 6 + Math.PI / 3),
                100 + 50 * Math.sin((i * Math.PI * 2) / 6 + Math.PI * 2 / 3),
                100 + 45 * Math.sin((i * Math.PI * 2) / 6 + Math.PI),
                100 + 50 * Math.sin((i * Math.PI * 2) / 6),
              ],
              opacity: [0.6, 1, 0.8, 1, 0.6],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Central Core - Pulsing heart */}
        <motion.circle
          cx="100"
          cy="100"
          r="8"
          fill={color}
          filter="url(#glow-intense)"
          animate={{
            r: [8, 12, 8],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: pulseSpeed * 0.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.circle
          cx="100"
          cy="100"
          r="4"
          fill="white"
          filter="url(#glow-soft)"
          animate={{
            r: [4, 6, 4],
            opacity: [0.9, 1, 0.9],
          }}
          transition={{
            duration: pulseSpeed * 0.8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.1,
          }}
        />
      </svg>
    </div>
  );
}
