import { useEffect, useState } from 'react';

/**
 * NeonBrain Loading Indicator
 * Animated brain that shows during loading/thinking states
 */

interface NeonBrainLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  showMessage?: boolean;
  variant?: 'default' | 'thinking' | 'processing' | 'success' | 'error';
}

const SIZE_CONFIG = {
  sm: { container: 'w-8 h-8', text: 'text-xs' },
  md: { container: 'w-16 h-16', text: 'text-sm' },
  lg: { container: 'w-24 h-24', text: 'text-base' },
  xl: { container: 'w-32 h-32', text: 'text-lg' },
};

const VARIANT_MESSAGES = {
  default: 'Loading...',
  thinking: 'Thinking...',
  processing: 'Processing...',
  success: 'Complete!',
  error: 'Something went wrong',
};

const VARIANT_COLORS = {
  default: 'from-cyan-400 to-primary',
  thinking: 'from-purple-400 to-primary',
  processing: 'from-blue-400 to-cyan-400',
  success: 'from-green-400 to-emerald-400',
  error: 'from-red-400 to-rose-400',
};

export function NeonBrainLoader({ 
  size = 'md', 
  message,
  showMessage = true,
  variant = 'default'
}: NeonBrainLoaderProps) {
  const [dots, setDots] = useState('');
  const sizeConfig = SIZE_CONFIG[size];
  const displayMessage = message || VARIANT_MESSAGES[variant];
  const gradientColors = VARIANT_COLORS[variant];

  // Animated dots for loading message
  useEffect(() => {
    if (variant === 'success' || variant === 'error') return;
    
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 400);
    
    return () => clearInterval(interval);
  }, [variant]);

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Animated Brain */}
      <div className={`relative ${sizeConfig.container}`}>
        {/* Outer glow ring */}
        <div 
          className={`
            absolute inset-0 
            rounded-full 
            bg-gradient-to-r ${gradientColors}
            opacity-30 
            blur-xl
            animate-pulse
          `}
        />
        
        {/* Brain container */}
        <div 
          className={`
            relative ${sizeConfig.container}
            rounded-full
            bg-gradient-to-br from-background to-card
            border border-primary/30
            flex items-center justify-center
            overflow-hidden
          `}
        >
          {/* Animated particles */}
          <div className="absolute inset-0">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={`
                  absolute w-1.5 h-1.5 rounded-full
                  bg-gradient-to-r ${gradientColors}
                  animate-float
                `}
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: `${2 + Math.random()}s`,
                }}
              />
            ))}
          </div>
          
          {/* Central brain icon */}
          <svg 
            viewBox="0 0 24 24" 
            className={`
              w-1/2 h-1/2 
              text-primary
              ${variant !== 'success' && variant !== 'error' ? 'animate-pulse' : ''}
            `}
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
          
          {/* Rotating ring */}
          {variant !== 'success' && variant !== 'error' && (
            <div 
              className={`
                absolute inset-1
                rounded-full
                border-2 border-transparent
                border-t-primary/50
                animate-spin
              `}
              style={{ animationDuration: '1.5s' }}
            />
          )}
        </div>
        
        {/* Success checkmark overlay */}
        {variant === 'success' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-1/2 h-1/2 text-green-400 animate-scale-in" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        
        {/* Error X overlay */}
        {variant === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-1/2 h-1/2 text-red-400 animate-scale-in" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
      </div>
      
      {/* Loading message */}
      {showMessage && (
        <p className={`${sizeConfig.text} text-muted-foreground font-medium`}>
          {displayMessage}{variant !== 'success' && variant !== 'error' ? dots : ''}
        </p>
      )}
    </div>
  );
}

// Inline loader for buttons and small spaces
export function NeonBrainInline({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className="relative w-5 h-5">
        <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
        <div className="relative w-5 h-5 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-white/80 animate-pulse" />
        </div>
      </div>
      <span className="text-sm text-muted-foreground">Thinking...</span>
    </div>
  );
}

// Full page loader overlay
export function NeonBrainOverlay({ 
  message = 'Loading Cepho...',
  variant = 'default' as const
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <NeonBrainLoader size="xl" message={message} variant={variant} />
    </div>
  );
}

// Add custom animations to tailwind
const styles = `
@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.8;
  }
  50% {
    transform: translateY(-8px) scale(1.2);
    opacity: 1;
  }
}

@keyframes scale-in {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-float {
  animation: float 2s ease-in-out infinite;
}

.animate-scale-in {
  animation: scale-in 0.3s ease-out forwards;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
