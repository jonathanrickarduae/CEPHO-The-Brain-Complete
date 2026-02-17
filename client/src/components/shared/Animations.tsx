import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Check, Sparkles, Zap, Star, Trophy, Flame } from 'lucide-react';

// Confetti celebration effect
interface ConfettiProps {
  isActive: boolean;
  duration?: number;
  particleCount?: number;
}

export function Confetti({ isActive, duration = 3000, particleCount = 50 }: ConfettiProps) {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    delay: number;
    color: string;
    size: number;
  }>>([]);

  useEffect(() => {
    if (isActive) {
      const colors = ['#ff10f0', '#00d4ff', '#a855f7', '#10b981', '#f59e0b', '#ef4444'];
      const newParticles = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 500,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => setParticles([]), duration);
      return () => clearTimeout(timer);
    }
  }, [isActive, duration, particleCount]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-confetti"
          style={{
            left: `${particle.x}%`,
            top: '-20px',
            animationDelay: `${particle.delay}ms`,
            animationDuration: `${duration}ms`,
          }}
        >
          <div
            className="rounded-sm"
            style={{
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        </div>
      ))}
    </div>
  );
}

// Success checkmark animation
interface SuccessCheckProps {
  isVisible: boolean;
  size?: 'sm' | 'md' | 'lg';
  onComplete?: () => void;
}

export function SuccessCheck({ isVisible, size = 'md', onComplete }: SuccessCheckProps) {
  useEffect(() => {
    if (isVisible && onComplete) {
      const timer = setTimeout(onComplete, 1500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className={cn(
      'rounded-full bg-green-500 flex items-center justify-center',
      'animate-in zoom-in-0 duration-300',
      sizeClasses[size]
    )}>
      <Check className={cn(
        'text-white animate-in fade-in-0 duration-300 delay-150',
        size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8'
      )} />
    </div>
  );
}

// Pulse ring animation (for active/recording states)
interface PulseRingProps {
  isActive: boolean;
  color?: string;
  children: React.ReactNode;
  className?: string;
}

export function PulseRing({ isActive, color = 'bg-primary', children, className }: PulseRingProps) {
  return (
    <div className={cn('relative', className)}>
      {isActive && (
        <>
          <span className={cn(
            'absolute inset-0 rounded-full animate-ping opacity-75',
            color
          )} />
          <span className={cn(
            'absolute inset-0 rounded-full animate-pulse opacity-50',
            color
          )} />
        </>
      )}
      {children}
    </div>
  );
}

// Thinking/loading dots animation
export function ThinkingDots({ className }: { className?: string }) {
  return (
    <div className={cn('flex gap-1', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-primary rounded-full animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}

// Sparkle effect on hover/focus
interface SparkleProps {
  children: React.ReactNode;
  className?: string;
  sparkleOnHover?: boolean;
}

export function Sparkle({ children, className, sparkleOnHover = true }: SparkleProps) {
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const addSparkle = useCallback(() => {
    if (!sparkleOnHover) return;
    
    const newSparkle = {
      id: Date.now(),
      x: Math.random() * 100,
      y: Math.random() * 100,
    };
    setSparkles(prev => [...prev, newSparkle]);
    setTimeout(() => {
      setSparkles(prev => prev.filter(s => s.id !== newSparkle.id));
    }, 700);
  }, [sparkleOnHover]);

  return (
    <div 
      className={cn('relative', className)}
      onMouseEnter={addSparkle}
    >
      {children}
      {sparkles.map((sparkle) => (
        <Sparkles
          key={sparkle.id}
          className="absolute w-4 h-4 text-primary animate-sparkle pointer-events-none"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
          }}
        />
      ))}
    </div>
  );
}

// Number counter animation
interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function AnimatedCounter({ 
  value, 
  duration = 1000, 
  className,
  prefix = '',
  suffix = ''
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = displayValue;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (value - startValue) * eased);
      
      setDisplayValue(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <span className={className}>
      {prefix}{displayValue}{suffix}
    </span>
  );
}

// Progress bar with animation
interface AnimatedProgressProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  color?: string;
}

export function AnimatedProgress({ 
  value, 
  max = 100, 
  className,
  showLabel = false,
  color = 'bg-primary'
}: AnimatedProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={cn('space-y-1', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-1000 ease-out',
            color
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Milestone celebration
interface MilestoneCelebrationProps {
  isVisible: boolean;
  title: string;
  description?: string;
  icon?: 'trophy' | 'star' | 'flame' | 'zap';
  onClose: () => void;
}

export function MilestoneCelebration({
  isVisible,
  title,
  description,
  icon = 'trophy',
  onClose,
}: MilestoneCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowConfetti(true);
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const icons = {
    trophy: Trophy,
    star: Star,
    flame: Flame,
    zap: Zap,
  };
  const Icon = icons[icon];

  return (
    <>
      <Confetti isActive={showConfetti} />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <div className="relative bg-card border border-primary/30 rounded-2xl p-8 text-center max-w-sm animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/30 to-purple-500/30 flex items-center justify-center">
            <Icon className="w-10 h-10 text-primary animate-bounce" />
          </div>
          
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">
            {title}
          </h2>
          
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
          
          <button
            onClick={onClose}
            className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Awesome!
          </button>
        </div>
      </div>
    </>
  );
}

// Streak flame animation
interface StreakFlameProps {
  days: number;
  className?: string;
}

export function StreakFlame({ days, className }: StreakFlameProps) {
  const intensity = Math.min(days / 30, 1); // Max intensity at 30 days
  
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative">
        <Flame 
          className={cn(
            'w-6 h-6 transition-all',
            intensity > 0.7 ? 'text-orange-500 animate-pulse' :
            intensity > 0.3 ? 'text-amber-500' :
            'text-amber-400/60'
          )}
          style={{
            filter: intensity > 0.5 ? `drop-shadow(0 0 ${intensity * 10}px rgba(251, 146, 60, 0.5))` : 'none'
          }}
        />
        {intensity > 0.7 && (
          <Flame 
            className="absolute inset-0 w-6 h-6 text-red-500 animate-ping opacity-30"
          />
        )}
      </div>
      <span className="font-bold text-foreground">{days}</span>
      <span className="text-xs text-muted-foreground">day streak</span>
    </div>
  );
}
