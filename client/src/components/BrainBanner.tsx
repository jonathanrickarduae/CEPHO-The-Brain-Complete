import { motion } from "framer-motion";
import { useMemo } from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface BrainBannerProps {
  pageTitle?: string;
  subtitle?: string;
  compact?: boolean;
}

// Generate random particles that persist across renders
function generateParticles(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    radius: Math.random() * 2 + 1,
    startX: 50,
    startY: 50,
    endX: 20 + Math.random() * 60,
    endY: 15 + Math.random() * 70,
    duration: 1.5 + Math.random() * 2,
    delay: Math.random() * 2,
  }));
}

// Generate neural connection paths
function generateConnections(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x1: 30 + Math.random() * 40,
    y1: 25 + Math.random() * 50,
    x2: 30 + Math.random() * 40,
    y2: 25 + Math.random() * 50,
    duration: 2 + Math.random() * 3,
    delay: Math.random() * 2,
  }));
}

// Mini animated brain for the banner
function MiniBrain({ className = "" }: { className?: string }) {
  const particles = useMemo(() => generateParticles(15), []);
  const connections = useMemo(() => generateConnections(5), []);
  
  const color = "#06b6d4"; // Cyan for the brain
  const pulseSpeed = 1.2;
  const particleSpeed = 0.8;

  return (
    <div className={`relative ${className}`}>
      {/* Glow effect */}
      <motion.div
        className="absolute inset-[-30%] rounded-full blur-[20px]"
        style={{ backgroundColor: color }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: pulseSpeed * 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <svg
        viewBox="0 0 100 100"
        className="w-full h-full relative z-10"
        style={{ filter: `drop-shadow(0 0 15px ${color}) drop-shadow(0 0 30px ${color})` }}
      >
        <defs>
          <filter id="banner-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="bannerConnGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0" />
            <stop offset="50%" stopColor={color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Neural Connections */}
        {connections.map((conn: { id: number; x1: number; y1: number; x2: number; y2: number; duration: number; delay: number }) => (
          <motion.line
            key={`conn-${conn.id}`}
            x1={conn.x1}
            y1={conn.y1}
            x2={conn.x2}
            y2={conn.y2}
            stroke="url(#bannerConnGradient)"
            strokeWidth="1"
            filter="url(#banner-glow)"
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

        {/* Left Hemisphere */}
        <motion.path
          d="M30,50 C30,30 45,20 50,20 C45,20 40,25 40,40 C40,55 30,65 30,50 Z"
          fill="none"
          stroke={color}
          strokeWidth="2"
          filter="url(#banner-glow)"
          animate={{
            strokeWidth: [2, 2.5, 2],
            opacity: [0.9, 1, 0.9],
          }}
          transition={{
            duration: pulseSpeed,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.path
          d="M30,50 C30,70 45,80 50,80 C45,80 40,75 40,60 C40,45 30,35 30,50 Z"
          fill="none"
          stroke={color}
          strokeWidth="2"
          filter="url(#banner-glow)"
          animate={{
            strokeWidth: [2, 2.5, 2],
            opacity: [0.9, 1, 0.9],
          }}
          transition={{
            duration: pulseSpeed,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.3,
          }}
        />

        {/* Right Hemisphere */}
        <motion.path
          d="M70,50 C70,30 55,20 50,20 C55,20 60,25 60,40 C60,55 70,65 70,50 Z"
          fill="none"
          stroke={color}
          strokeWidth="2"
          filter="url(#banner-glow)"
          animate={{
            strokeWidth: [2, 2.5, 2],
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
          d="M70,50 C70,70 55,80 50,80 C55,80 60,75 60,60 C60,45 70,35 70,50 Z"
          fill="none"
          stroke={color}
          strokeWidth="2"
          filter="url(#banner-glow)"
          animate={{
            strokeWidth: [2, 2.5, 2],
            opacity: [0.9, 1, 0.9],
          }}
          transition={{
            duration: pulseSpeed,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.45,
          }}
        />

        {/* Center line */}
        <motion.path
          d="M50,20 L50,80"
          fill="none"
          stroke={color}
          strokeWidth="1"
          strokeDasharray="3 3"
          filter="url(#banner-glow)"
          animate={{
            strokeDashoffset: [0, -12],
            opacity: [0.4, 0.7, 0.4],
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

        {/* Neural Activity Particles */}
        {particles.map((particle: { id: number; radius: number; startX: number; startY: number; endX: number; endY: number; duration: number; delay: number }) => (
          <motion.circle
            key={`particle-${particle.id}`}
            r={particle.radius}
            fill="white"
            filter="url(#banner-glow)"
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
              scale: [0, 1.2, 0]
            }}
            transition={{
              duration: particle.duration * particleSpeed,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeOut",
            }}
          />
        ))}

        {/* Central Core */}
        <motion.circle
          cx="50"
          cy="50"
          r="4"
          fill={color}
          filter="url(#banner-glow)"
          animate={{
            r: [4, 6, 4],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: pulseSpeed * 0.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.circle
          cx="50"
          cy="50"
          r="2"
          fill="white"
          filter="url(#banner-glow)"
          animate={{
            r: [2, 3, 2],
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

export default function BrainBanner({ pageTitle, subtitle, compact = false }: BrainBannerProps) {
  const { theme } = useTheme();
  
  // Theme-aware background
  const bgClass = theme === 'light' 
    ? 'bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 border-b border-gray-200'
    : theme === 'mix'
    ? 'bg-gradient-to-r from-gray-900/80 via-gray-800/80 to-gray-900/80 border-b border-gray-700/50 backdrop-blur-sm'
    : 'bg-gradient-to-r from-gray-950 via-black to-gray-950 border-b border-gray-800/50';

  const height = compact ? 'h-16' : 'h-20';
  const brainSize = compact ? 'w-10 h-10' : 'w-14 h-14';
  const titleSize = compact ? 'text-xl' : 'text-2xl';
  
  // Display title - use pageTitle if provided, otherwise default to THE BRAIN
  const displayTitle = pageTitle ? `THE ${pageTitle.toUpperCase()}` : 'THE BRAIN';

  return (
    <div className={`${bgClass} ${height} flex items-center px-6 relative overflow-hidden`}>
      {/* Subtle background glow */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-16 top-1/2 -translate-y-1/2 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex items-center gap-4 relative z-10">
        {/* Animated Brain */}
        <MiniBrain className={brainSize} />
        
        {/* Page Title in Pink */}
        <h1 className={`font-display font-bold ${titleSize} tracking-wider text-pink-500 drop-shadow-[0_0_20px_rgba(236,72,153,0.5)]`}>
          {displayTitle}
        </h1>
      </div>
      
      {/* Subtitle on the right */}
      {subtitle && (
        <div className="ml-auto text-sm text-muted-foreground">
          {subtitle}
        </div>
      )}
    </div>
  );
}
