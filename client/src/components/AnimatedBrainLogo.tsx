// AnimatedBrainLogo — SVG brain with pulsing cyan nodes
// Design: Meridian Light — electric cyan nodes, geometric precision

import { useEffect, useRef } from "react";

interface AnimatedBrainLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  intensity?: "subtle" | "normal" | "strong" | "active";
  color?: string;
  className?: string;
}

const sizeMap = {
  xs: 24,
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
};

export default function AnimatedBrainLogo({
  size = "md",
  intensity = "normal",
  color = "oklch(0.78 0.18 195)",
  className = "",
}: AnimatedBrainLogoProps) {
  const px = sizeMap[size];

  // Node positions (normalised 0-100 within a 100x100 viewBox)
  const nodes = [
    { cx: 50, cy: 20, r: 3.5, delay: 0 },
    { cx: 30, cy: 32, r: 2.5, delay: 0.3 },
    { cx: 70, cy: 32, r: 2.5, delay: 0.6 },
    { cx: 20, cy: 50, r: 3, delay: 0.9 },
    { cx: 50, cy: 45, r: 4, delay: 0.2 },
    { cx: 80, cy: 50, r: 3, delay: 1.1 },
    { cx: 35, cy: 62, r: 2.5, delay: 0.5 },
    { cx: 65, cy: 62, r: 2.5, delay: 0.8 },
    { cx: 25, cy: 72, r: 2, delay: 1.4 },
    { cx: 50, cy: 70, r: 3, delay: 0.4 },
    { cx: 75, cy: 72, r: 2, delay: 1.0 },
    { cx: 40, cy: 82, r: 2, delay: 0.7 },
    { cx: 60, cy: 82, r: 2, delay: 1.3 },
  ];

  // Edges between nodes (index pairs)
  const edges = [
    [0, 1], [0, 2], [1, 3], [2, 5],
    [1, 4], [2, 4], [3, 6], [5, 7],
    [4, 6], [4, 7], [3, 8], [6, 9],
    [7, 9], [5, 10], [8, 11], [9, 11],
    [9, 12], [10, 12], [4, 9],
  ];

  const opacityMap: Record<string, number> = {
    subtle: 0.6,
    normal: 0.85,
    strong: 1,
    active: 1,
  };

  const glowMap: Record<string, number> = {
    subtle: 2,
    normal: 4,
    strong: 6,
    active: 6,
  };

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="CEPHO brain logo"
    >
      <defs>
        <filter id={`glow-${size}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={glowMap[intensity]} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Edges */}
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a].cx}
          y1={nodes[a].cy}
          x2={nodes[b].cx}
          y2={nodes[b].cy}
          stroke={color}
          strokeWidth="0.8"
          strokeOpacity={opacityMap[intensity] * 0.35}
        />
      ))}

      {/* Nodes */}
      {nodes.map((node, i) => (
        <circle
          key={i}
          cx={node.cx}
          cy={node.cy}
          r={node.r}
          fill={color}
          filter={`url(#glow-${size})`}
          style={{
            animation: `brainPulse 2.4s ease-in-out ${node.delay}s infinite`,
            opacity: opacityMap[intensity],
          }}
        />
      ))}

      <style>{`
        @keyframes brainPulse {
          0%, 100% { opacity: ${opacityMap[intensity] * 0.5}; r: ${0.8}; }
          50% { opacity: ${opacityMap[intensity]}; }
        }
      `}</style>
    </svg>
  );
}
