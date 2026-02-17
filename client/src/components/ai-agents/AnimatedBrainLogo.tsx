import { motion } from "framer-motion";
import { useMemo } from "react";

interface AnimatedBrainLogoProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
  color?: string;
  intensity?: "subtle" | "gentle" | "active"; // How active the neurons are
}

// Generate neuron positions that form a brain-like shape
function generateNeurons(count: number) {
  const neurons: Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    delay: number;
    duration: number;
  }> = [];
  
  // Create neurons in a brain-like distribution
  for (let i = 0; i < count; i++) {
    // Distribute neurons in a brain shape (two hemispheres)
    const angle = (i / count) * Math.PI * 2;
    const isLeftHemisphere = i % 2 === 0;
    
    // Base position with some randomness
    const baseX = isLeftHemisphere 
      ? 35 + Math.random() * 25 
      : 55 + Math.random() * 25;
    const baseY = 25 + Math.random() * 50;
    
    // Add some organic variation
    const offsetX = Math.sin(angle * 3) * 8;
    const offsetY = Math.cos(angle * 2) * 8;
    
    neurons.push({
      id: i,
      x: baseX + offsetX,
      y: baseY + offsetY,
      size: 1.5 + Math.random() * 2,
      delay: Math.random() * 8, // Spread out the firing over 8 seconds
      duration: 4 + Math.random() * 4, // 4-8 second cycles
    });
  }
  
  return neurons;
}

// Generate subtle connection lines between neurons
function generateConnections(neurons: ReturnType<typeof generateNeurons>) {
  const connections: Array<{
    id: number;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    delay: number;
    duration: number;
  }> = [];
  
  // Connect nearby neurons
  for (let i = 0; i < neurons.length; i++) {
    for (let j = i + 1; j < neurons.length; j++) {
      const dist = Math.sqrt(
        Math.pow(neurons[i].x - neurons[j].x, 2) + 
        Math.pow(neurons[i].y - neurons[j].y, 2)
      );
      
      // Only connect neurons that are close enough
      if (dist < 20 && connections.length < 15) {
        connections.push({
          id: connections.length,
          x1: neurons[i].x,
          y1: neurons[i].y,
          x2: neurons[j].x,
          y2: neurons[j].y,
          delay: Math.random() * 10,
          duration: 6 + Math.random() * 6, // 6-12 second cycles
        });
      }
    }
  }
  
  return connections;
}

export default function AnimatedBrainLogo({ 
  className = "",
  size = "md",
  color = "#ec4899", // Clearer pink
  intensity = "active"
}: AnimatedBrainLogoProps) {
  // Memoize neurons and connections
  const neurons = useMemo(() => generateNeurons(20), []);
  const connections = useMemo(() => generateConnections(neurons), [neurons]);
  
  // Size classes
  const sizeClasses = {
    xs: "w-8 h-8",
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-24 h-24"
  };
  
  // Intensity settings
  const intensitySettings = {
    subtle: { 
      neuronOpacity: [0.2, 0.5, 0.2],
      connectionOpacity: [0, 0.15, 0],
      glowOpacity: 0.1
    },
    gentle: { 
      neuronOpacity: [0.3, 0.7, 0.3],
      connectionOpacity: [0, 0.25, 0],
      glowOpacity: 0.15
    },
    active: { 
      neuronOpacity: [0.4, 0.9, 0.4],
      connectionOpacity: [0, 0.4, 0],
      glowOpacity: 0.25
    }
  };
  
  const settings = intensitySettings[intensity];

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Subtle background glow */}
      <motion.div
        className="absolute inset-[-10%] rounded-full blur-xl"
        style={{ backgroundColor: color }}
        animate={{
          opacity: [settings.glowOpacity, settings.glowOpacity * 2, settings.glowOpacity],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full relative z-10"
        style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
      >
        <defs>
          <filter id="neuron-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          <linearGradient id="brain-connection-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0" />
            <stop offset="50%" stopColor={color} stopOpacity="0.6" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Brain outline - subtle and static */}
        <motion.ellipse
          cx="50"
          cy="50"
          rx="35"
          ry="30"
          fill="none"
          stroke={color}
          strokeWidth="1"
          strokeOpacity="0.2"
          animate={{
            strokeOpacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Center dividing line */}
        <motion.line
          x1="50"
          y1="22"
          x2="50"
          y2="78"
          stroke={color}
          strokeWidth="0.5"
          strokeOpacity="0.15"
          strokeDasharray="2 3"
          animate={{
            strokeOpacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Neural connections - subtle pulses traveling along them */}
        {connections.map((conn) => (
          <motion.line
            key={`conn-${conn.id}`}
            x1={conn.x1}
            y1={conn.y1}
            x2={conn.x2}
            y2={conn.y2}
            stroke="url(#brain-connection-gradient)"
            strokeWidth="0.8"
            initial={{ opacity: 0 }}
            animate={{
              opacity: settings.connectionOpacity,
            }}
            transition={{
              duration: conn.duration,
              repeat: Infinity,
              delay: conn.delay,
              ease: "easeInOut",
            }}
          />
        ))}
        
        {/* Neurons - gentle pulsing */}
        {neurons.map((neuron) => (
          <motion.circle
            key={`neuron-${neuron.id}`}
            cx={neuron.x}
            cy={neuron.y}
            r={neuron.size}
            fill={color}
            filter="url(#neuron-glow)"
            initial={{ opacity: 0.2 }}
            animate={{
              opacity: settings.neuronOpacity,
              r: [neuron.size, neuron.size * 1.3, neuron.size],
            }}
            transition={{
              duration: neuron.duration,
              repeat: Infinity,
              delay: neuron.delay,
              ease: "easeInOut",
            }}
          />
        ))}
        
        {/* Central "consciousness" point - very subtle pulse */}
        <motion.circle
          cx="50"
          cy="50"
          r="3"
          fill={color}
          filter="url(#neuron-glow)"
          animate={{
            opacity: [0.4, 0.7, 0.4],
            r: [3, 4, 3],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </svg>
    </div>
  );
}
