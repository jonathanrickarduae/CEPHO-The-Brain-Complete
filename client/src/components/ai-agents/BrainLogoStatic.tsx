/**
 * BrainLogoStatic — CSS-only brain icon for use in headers/nav.
 * Uses CSS animations instead of framer-motion to avoid GPU-intensive
 * JS-driven animation loops on mobile.
 */
interface BrainLogoStaticProps {
  className?: string;
  size?: "xs" | "sm" | "md";
  color?: string;
}

export default function BrainLogoStatic({
  className = "",
  size = "xs",
  color = "#00d4ff",
}: BrainLogoStaticProps) {
  const sizeMap = { xs: "w-7 h-7", sm: "w-10 h-10", md: "w-14 h-14" };

  return (
    <div className={`relative flex items-center justify-center ${sizeMap[size]} ${className}`}>
      <style>{`
        @keyframes brain-pulse {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; }
        }
        @keyframes neuron-fire {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.4); }
        }
        .brain-outline { animation: brain-pulse 4s ease-in-out infinite; }
        .neuron-a { animation: neuron-fire 3.2s ease-in-out infinite; }
        .neuron-b { animation: neuron-fire 4.1s ease-in-out infinite 0.8s; }
        .neuron-c { animation: neuron-fire 3.7s ease-in-out infinite 1.5s; }
        .neuron-d { animation: neuron-fire 5s ease-in-out infinite 0.3s; }
        .neuron-center { animation: neuron-fire 3s ease-in-out infinite 0.5s; }
      `}</style>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        style={{ willChange: "transform", transform: "translateZ(0)" }}
      >
        {/* Glow filter */}
        <defs>
          <filter id="static-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Brain outline */}
        <ellipse
          className="brain-outline"
          cx="50" cy="50" rx="34" ry="28"
          stroke={color} strokeWidth="1.2" strokeOpacity="0.6"
          fill="none"
        />
        {/* Dividing line */}
        <line
          x1="50" y1="24" x2="50" y2="76"
          stroke={color} strokeWidth="0.6" strokeOpacity="0.3"
          strokeDasharray="2 3"
        />
        {/* Connection lines */}
        <line x1="35" y1="40" x2="50" y2="50" stroke={color} strokeWidth="0.6" strokeOpacity="0.2" />
        <line x1="65" y1="40" x2="50" y2="50" stroke={color} strokeWidth="0.6" strokeOpacity="0.2" />
        <line x1="38" y1="60" x2="50" y2="50" stroke={color} strokeWidth="0.6" strokeOpacity="0.2" />
        <line x1="62" y1="60" x2="50" y2="50" stroke={color} strokeWidth="0.6" strokeOpacity="0.2" />

        {/* Neurons */}
        <circle className="neuron-a" cx="35" cy="40" r="2.5" fill={color} filter="url(#static-glow)" />
        <circle className="neuron-b" cx="65" cy="40" r="2.5" fill={color} filter="url(#static-glow)" />
        <circle className="neuron-c" cx="38" cy="60" r="2" fill={color} filter="url(#static-glow)" />
        <circle className="neuron-d" cx="62" cy="60" r="2" fill={color} filter="url(#static-glow)" />
        {/* Central consciousness point */}
        <circle className="neuron-center" cx="50" cy="50" r="3" fill={color} filter="url(#static-glow)" />
      </svg>
    </div>
  );
}
