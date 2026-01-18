import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Sparkles, 
  PartyPopper, 
  Zap,
  Trophy,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuccessCelebrationProps {
  show: boolean;
  title?: string;
  message?: string;
  type?: 'integration' | 'milestone' | 'achievement' | 'completion';
  onComplete?: () => void;
  duration?: number;
}

const celebrationConfig = {
  integration: {
    icon: Zap,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
    borderColor: 'border-cyan-500/50',
    confettiColors: ['#06B6D4', '#22D3EE', '#67E8F9']
  },
  milestone: {
    icon: Trophy,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/50',
    confettiColors: ['#F59E0B', '#FBBF24', '#FCD34D']
  },
  achievement: {
    icon: Star,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/50',
    confettiColors: ['#A855F7', '#C084FC', '#E879F9']
  },
  completion: {
    icon: CheckCircle2,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/50',
    confettiColors: ['#22C55E', '#4ADE80', '#86EFAC']
  }
};

export function SuccessCelebration({ 
  show, 
  title = 'Success!', 
  message = 'Great job!',
  type = 'completion',
  onComplete,
  duration = 3000
}: SuccessCelebrationProps) {
  const [visible, setVisible] = useState(false);
  const config = celebrationConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    if (show) {
      setVisible(true);
      
      // Trigger confetti
      const end = Date.now() + 1000;
      const colors = config.confettiColors;

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());

      // Auto-hide after duration
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onComplete, config.confettiColors]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className={cn(
              'p-8 rounded-2xl border-2 shadow-2xl pointer-events-auto',
              config.bgColor,
              config.borderColor
            )}
          >
            <div className="text-center space-y-4">
              {/* Animated Icon */}
              <motion.div
                animate={{ 
                  rotate: [0, -10, 10, -10, 10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 0.5, repeat: 2 }}
                className="inline-block"
              >
                <div className={cn(
                  'w-20 h-20 rounded-full flex items-center justify-center mx-auto',
                  config.bgColor
                )}>
                  <Icon className={cn('w-10 h-10', config.color)} />
                </div>
              </motion.div>

              {/* Sparkles */}
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="flex justify-center gap-2"
              >
                <Sparkles className={cn('w-5 h-5', config.color)} />
                <PartyPopper className={cn('w-5 h-5', config.color)} />
                <Sparkles className={cn('w-5 h-5', config.color)} />
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={cn('text-2xl font-bold', config.color)}
              >
                {title}
              </motion.h2>

              {/* Message */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-white/80"
              >
                {message}
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for triggering celebrations
export function useCelebration() {
  const [celebration, setCelebration] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'integration' | 'milestone' | 'achievement' | 'completion';
  }>({
    show: false,
    title: '',
    message: '',
    type: 'completion'
  });

  const celebrate = (
    title: string, 
    message: string, 
    type: 'integration' | 'milestone' | 'achievement' | 'completion' = 'completion'
  ) => {
    setCelebration({ show: true, title, message, type });
  };

  const reset = () => {
    setCelebration(prev => ({ ...prev, show: false }));
  };

  return { celebration, celebrate, reset };
}

// Pre-built celebration triggers
export const celebrations = {
  integrationConnected: (name: string) => ({
    title: 'Integration Connected!',
    message: `${name} is now connected to your workspace`,
    type: 'integration' as const
  }),
  milestoneReached: (milestone: string) => ({
    title: 'Milestone Reached!',
    message: milestone,
    type: 'milestone' as const
  }),
  taskCompleted: (task: string) => ({
    title: 'Task Complete!',
    message: task,
    type: 'completion' as const
  }),
  achievementUnlocked: (achievement: string) => ({
    title: 'Achievement Unlocked!',
    message: achievement,
    type: 'achievement' as const
  })
};

export default SuccessCelebration;
