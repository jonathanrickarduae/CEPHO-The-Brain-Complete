import { useState, useEffect } from 'react';
import { 
  Sun, Users, FolderKanban, Fingerprint, Brain, 
  ChevronRight, ChevronLeft, X, Sparkles, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  highlight?: string; // CSS selector to highlight
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 1,
    title: 'Welcome to The Brain',
    description: 'Your AI-powered command center that learns from you and works alongside you. Let me show you how it works.',
    icon: Brain,
    color: 'text-primary',
  },
  {
    id: 2,
    title: 'Start with Daily Brief',
    description: 'Every morning, your Digital Twin prepares a personalized briefing with priorities, insights, and action items ready for your review.',
    icon: Sun,
    color: 'text-amber-400',
    highlight: '[data-tour="daily-brief"]',
  },
  {
    id: 3,
    title: 'Deploy AI Experts',
    description: 'Need help with a task? Assemble a team of 287 AI experts - from strategists to analysts - who work together on your projects.',
    icon: Users,
    color: 'text-cyan-400',
    highlight: '[data-tour="ai-experts"]',
  },
  {
    id: 4,
    title: 'Track in Workflow',
    description: 'Monitor all your active projects, see what\'s blocked, and track deliverables. Your AI team updates progress in real-time.',
    icon: FolderKanban,
    color: 'text-green-400',
    highlight: '[data-tour="workflow"]',
  },
  {
    id: 5,
    title: 'Train Your Digital Twin',
    description: 'The more you interact, the smarter your Twin becomes. It learns your preferences, communication style, and decision patterns.',
    icon: Fingerprint,
    color: 'text-purple-400',
    highlight: '[data-tour="digital-twin"]',
  },
  {
    id: 6,
    title: 'You\'re Ready!',
    description: 'Start by checking your Daily Brief, or ask your Digital Twin anything. The Brain is here to get you to a 10 every day.',
    icon: Sparkles,
    color: 'text-primary',
  },
];

const ONBOARDING_KEY = 'brain-onboarding-completed';

export function useOnboarding() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    return localStorage.getItem(ONBOARDING_KEY) === 'true';
  });

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setHasCompletedOnboarding(true);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_KEY);
    setHasCompletedOnboarding(false);
  };

  return {
    hasCompletedOnboarding,
    completeOnboarding,
    resetOnboarding,
    shouldShowOnboarding: !hasCompletedOnboarding,
  };
}

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingModal({ isOpen, onComplete, onSkip }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const step = ONBOARDING_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  // Highlight element when step changes
  useEffect(() => {
    if (step.highlight) {
      const element = document.querySelector(step.highlight);
      if (element) {
        element.classList.add('onboarding-highlight');
        return () => element.classList.remove('onboarding-highlight');
      }
    }
  }, [step.highlight]);

  const goToNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const goToPrev = () => {
    if (!isFirstStep) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  if (!isOpen) return null;

  const Icon = step.icon;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          {/* Skip button */}
          <button
            onClick={onSkip}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50 z-10"
            aria-label="Skip onboarding"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Progress dots */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {ONBOARDING_STEPS.map((_, index) => (
              <div
                key={index}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  index === currentStep
                    ? 'bg-primary w-6'
                    : index < currentStep
                    ? 'bg-primary/60'
                    : 'bg-white/20'
                )}
              />
            ))}
          </div>

          {/* Content */}
          <div className={cn(
            'p-8 pt-14 transition-opacity duration-150',
            isAnimating ? 'opacity-0' : 'opacity-100'
          )}>
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className={cn(
                'w-20 h-20 rounded-2xl flex items-center justify-center',
                'bg-gradient-to-br from-white/10 to-white/5 border border-white/10',
                'animate-in zoom-in-50 duration-500'
              )}>
                <Icon className={cn('w-10 h-10', step.color)} />
              </div>
            </div>

            {/* Text */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-display font-bold text-foreground mb-3">
                {step.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>

            {/* Step indicator */}
            <p className="text-center text-xs text-muted-foreground mb-6">
              Step {currentStep + 1} of {ONBOARDING_STEPS.length}
            </p>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="ghost"
                onClick={goToPrev}
                disabled={isFirstStep}
                className={cn(
                  'flex items-center gap-2',
                  isFirstStep && 'invisible'
                )}
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>

              <Button
                onClick={goToNext}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 min-w-[120px]"
              >
                {isLastStep ? (
                  <>
                    Get Started
                    <Check className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Decorative gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-cyan-400 to-purple-400" />
        </div>
      </div>
    </>
  );
}

// Tooltip-style onboarding for specific features
interface FeatureTooltipProps {
  children: React.ReactNode;
  title: string;
  description: string;
  isVisible: boolean;
  onDismiss: () => void;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function FeatureTooltip({
  children,
  title,
  description,
  isVisible,
  onDismiss,
  position = 'bottom',
}: FeatureTooltipProps) {
  if (!isVisible) return <>{children}</>;

  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
  };

  return (
    <div className="relative">
      {children}
      <div className={cn(
        'absolute z-50 w-64 p-4 bg-card border border-primary/30 rounded-xl shadow-lg',
        'animate-in fade-in-0 zoom-in-95 duration-200',
        positionClasses[position]
      )}>
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
        <h4 className="font-bold text-foreground mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="mt-3">
          <Button size="sm" onClick={onDismiss} className="w-full">
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
}
