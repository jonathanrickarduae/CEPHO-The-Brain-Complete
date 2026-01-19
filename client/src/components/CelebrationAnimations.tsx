import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Trophy, Flame, Star, Award } from 'lucide-react';

// Confetti particle
interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  velocity: { x: number; y: number };
  rotationSpeed: number;
  opacity: number;
}

// Confetti component
interface ConfettiProps {
  duration?: number;
  particleCount?: number;
  spread?: number;
  origin?: { x: number; y: number };
  colors?: string[];
  onComplete?: () => void;
}

export function Confetti({
  duration = 3000,
  particleCount = 50,
  spread = 70,
  origin = { x: 0.5, y: 0.5 },
  colors = ['#ff10f0', '#00d4ff', '#ffd700', '#ff6b6b', '#4ecdc4', '#a855f7'],
  onComplete,
}: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    // Create initial particles
    const newParticles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.random() * spread - spread / 2) * (Math.PI / 180);
      const velocity = 8 + Math.random() * 8;
      
      newParticles.push({
        id: i,
        x: origin.x * window.innerWidth,
        y: origin.y * window.innerHeight,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 8 + Math.random() * 8,
        rotation: Math.random() * 360,
        velocity: {
          x: Math.sin(angle) * velocity,
          y: -Math.cos(angle) * velocity - Math.random() * 5,
        },
        rotationSpeed: (Math.random() - 0.5) * 20,
        opacity: 1,
      });
    }
    setParticles(newParticles);

    // Animation loop
    let animationFrame: number;
    let startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress >= 1) {
        setIsActive(false);
        onComplete?.();
        return;
      }

      setParticles(prev =>
        prev.map(p => ({
          ...p,
          x: p.x + p.velocity.x,
          y: p.y + p.velocity.y,
          velocity: {
            x: p.velocity.x * 0.99,
            y: p.velocity.y + 0.3, // gravity
          },
          rotation: p.rotation + p.rotationSpeed,
          opacity: 1 - progress,
        }))
      );

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [duration, particleCount, spread, origin, colors, onComplete]);

  if (!isActive) return null;

  return createPortal(
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            transform: `rotate(${p.rotation}deg)`,
            opacity: p.opacity,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
          }}
        />
      ))}
    </div>,
    document.body
  );
}

// Celebration context for global celebrations
interface CelebrationContextType {
  celebrate: (type: 'confetti' | 'fireworks' | 'sparkles', options?: any) => void;
  showAchievement: (achievement: { title: string; description: string; icon?: string }) => void;
}

const CelebrationContext = createContext<CelebrationContextType | undefined>(undefined);

export function CelebrationProvider({ children }: { children: ReactNode }) {
  const [activeConfetti, setActiveConfetti] = useState(false);
  const [achievement, setAchievement] = useState<{
    title: string;
    description: string;
    icon?: string;
  } | null>(null);

  const celebrate = useCallback((type: 'confetti' | 'fireworks' | 'sparkles', options?: any) => {
    if (type === 'confetti') {
      setActiveConfetti(true);
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([50, 50, 50]);
      }
    }
  }, []);

  const showAchievement = useCallback((ach: { title: string; description: string; icon?: string }) => {
    setAchievement(ach);
    celebrate('confetti');
    
    // Auto-hide after 5 seconds
    setTimeout(() => setAchievement(null), 5000);
  }, [celebrate]);

  return (
    <CelebrationContext.Provider value={{ celebrate, showAchievement }}>
      {children}
      {activeConfetti && (
        <Confetti onComplete={() => setActiveConfetti(false)} />
      )}
      {achievement && (
        <AchievementToast
          {...achievement}
          onClose={() => setAchievement(null)}
        />
      )}
    </CelebrationContext.Provider>
  );
}

export function useCelebration() {
  const context = useContext(CelebrationContext);
  if (!context) {
    throw new Error('useCelebration must be used within a CelebrationProvider');
  }
  return context;
}

// Achievement toast notification
interface AchievementToastProps {
  title: string;
  description: string;
  icon?: string;
  onClose: () => void;
}

function AchievementToast({ title, description, icon = 'trophy', onClose }: AchievementToastProps) {
  const getIcon = () => {
    switch (icon) {
      case 'streak': return <Flame className="w-7 h-7 text-white" />;
      case 'star': return <Star className="w-7 h-7 text-white" />;
      case 'award': return <Award className="w-7 h-7 text-white" />;
      default: return <Trophy className="w-7 h-7 text-white" />;
    }
  };
  return createPortal(
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9998] animate-in slide-in-from-top-4 duration-500">
      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-2xl p-4 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center animate-bounce">
            {getIcon()}
          </div>
          <div>
            <div className="text-xs text-yellow-400 uppercase tracking-wider mb-1">
              Achievement Unlocked!
            </div>
            <h3 className="font-bold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// Sparkle effect for buttons/elements
interface SparkleProps {
  children: ReactNode;
  active?: boolean;
  color?: string;
}

export function Sparkle({ children, active = false, color = '#ffd700' }: SparkleProps) {
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; size: number }[]>([]);

  useEffect(() => {
    if (!active) {
      setSparkles([]);
      return;
    }

    const interval = setInterval(() => {
      const newSparkle = {
        id: Date.now(),
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 4 + Math.random() * 8,
      };
      setSparkles(prev => [...prev.slice(-5), newSparkle]);
    }, 200);

    return () => clearInterval(interval);
  }, [active]);

  return (
    <div className="relative inline-block">
      {children}
      {sparkles.map(s => (
        <div
          key={s.id}
          className="absolute pointer-events-none animate-ping"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            backgroundColor: color,
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  );
}

// Success animation overlay
interface SuccessAnimationProps {
  show: boolean;
  message?: string;
  onComplete?: () => void;
}

export function SuccessAnimation({ show, message = 'Success!', onComplete }: SuccessAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!isVisible) return null;

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center z-[9997] pointer-events-none">
      <div className="animate-in zoom-in-50 duration-300">
        <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center mb-4 mx-auto">
          <svg
            className="w-12 h-12 text-white animate-in zoom-in duration-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p className="text-xl font-bold text-foreground text-center">{message}</p>
      </div>
    </div>,
    document.body
  );
}

// Level up animation
interface LevelUpProps {
  show: boolean;
  level: number;
  onComplete?: () => void;
}

export function LevelUpAnimation({ show, level, onComplete }: LevelUpProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 200]);
      }
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!isVisible) return null;

  return createPortal(
    <>
      <Confetti particleCount={100} />
      <div className="fixed inset-0 flex items-center justify-center z-[9996] pointer-events-none bg-black/50">
        <div className="animate-in zoom-in-50 duration-500 text-center">
          <div className="text-6xl mb-4 animate-bounce">⬆️</div>
          <h2 className="text-4xl font-bold text-foreground mb-2">Level Up!</h2>
          <div className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Level {level}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
