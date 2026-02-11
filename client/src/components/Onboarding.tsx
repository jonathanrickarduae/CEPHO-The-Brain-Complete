import { useState, useEffect } from 'react';
import { 
  Sun, Users, FolderKanban, Fingerprint, Brain, 
  ChevronRight, ChevronLeft, X, Sparkles, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import NeonBrain from './NeonBrain';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  highlight?: string; // CSS selector to highlight
  useBrain?: boolean; // Use NeonBrain instead of icon
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 1,
    title: 'CEPHO',
    description: 'From the Greek for brain. Where intelligence begins. We are continuing the story of how thinking emerged in the universe.',
    icon: Brain,
    color: 'text-primary',
    useBrain: true,
  },
  {
    id: 2,
    title: 'The Signal',
    description: 'Every morning, your Chief of Staff prepares a personalized briefing with priorities, insights, and action items ready for your review.',
    icon: Sun,
    color: 'text-amber-400',
    highlight: '[data-tour="daily-brief"]',
  },
  {
    id: 3,
    title: 'AI-SMEs',
    description: 'Need help with a task? Access 273+ AI-SMEs across every domain - strategists, analysts, legal, finance, marketing - your Chief of Staff assembles the right team for each task.',
    icon: Users,
    color: 'text-cyan-400',
    highlight: '[data-tour="ai-experts"]',
  },
  {
    id: 4,
    title: 'Workflow',
    description: 'Monitor all your active projects, see what\'s blocked, and track deliverables. Your AI team updates progress in real-time.',
    icon: FolderKanban,
    color: 'text-green-400',
    highlight: '[data-tour="workflow"]',
  },
  {
    id: 5,
    title: 'Chief of Staff',
    description: 'The more you interact, the smarter your Chief of Staff becomes. It learns your preferences, communication style, and decision patterns.',
    icon: Fingerprint,
    color: 'text-purple-400',
    highlight: '[data-tour="digital-twin"]',
  },
  {
    id: 6,
    title: 'You\'re Ready!',
    description: 'Start by checking The Signal, or ask your Chief of Staff anything. Cepho is here to get you to 100 every day.',
    icon: Sparkles,
    color: 'text-primary',
    useBrain: true,
  },
];

const ONBOARDING_KEY = 'cepho-onboarding-completed';

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

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'Enter':
        case ' ':
          e.preventDefault();
          goToNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (!isFirstStep) goToPrev();
          break;
        case 'Escape':
          e.preventDefault();
          onSkip();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFirstStep, isLastStep]);

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
      {/* Backdrop with animated gradient */}
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        </div>
      </div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl">
          {/* Skip button - outside modal */}
          <button
            onClick={onSkip}
            className="absolute -top-12 right-0 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-white/5 z-10"
            aria-label="Skip onboarding"
          >
            Skip intro
          </button>

          {/* Main Card */}
          <div className="relative bg-black border border-white/10 rounded-3xl shadow-2xl shadow-primary/10 overflow-hidden backdrop-blur-xl">
            {/* Top glow line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            
            {/* Progress dots - top - positioned higher to avoid icon overlap */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {ONBOARDING_STEPS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsAnimating(true);
                    setTimeout(() => {
                      setCurrentStep(index);
                      setIsAnimating(false);
                    }, 150);
                  }}
                  className={cn(
                    'h-2 rounded-full transition-all duration-500',
                    index === currentStep
                      ? 'bg-primary w-8 shadow-[0_0_10px_rgba(255,16,240,0.5)]'
                      : index < currentStep
                      ? 'bg-primary/60 w-2 hover:bg-primary/80'
                      : 'bg-white/20 w-2 hover:bg-white/30'
                  )}
                />
              ))}
            </div>

            {/* Content - Fixed height container for consistent button position */}
            <div className={cn(
              'px-8 md:px-12 pt-14 pb-8 transition-all duration-200 flex flex-col min-h-[520px]',
              isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            )}>
              {/* Icon / Brain - Fixed height container */}
              <div className="flex justify-center mb-6 h-40 md:h-48 items-center">
                {step.useBrain ? (
                  <div className="relative w-32 h-32 md:w-36 md:h-36">
                    <NeonBrain 
                      size="lg" 
                      className="w-32 h-32 md:w-36 md:h-36" 
                      state="thinking" 
                    />
                    {/* Glow ring */}
                    <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl -z-10 animate-pulse" />
                  </div>
                ) : (
                  <div className={cn(
                    'relative w-24 h-24 md:w-28 md:h-28 rounded-3xl flex items-center justify-center',
                    'bg-gradient-to-br from-white/10 to-white/5 border border-white/10',
                    'shadow-2xl'
                  )}>
                    <Icon className={cn('w-12 h-12 md:w-14 md:h-14', step.color)} />
                    {/* Glow effect */}
                    <div className={cn(
                      'absolute inset-0 rounded-3xl blur-2xl -z-10 opacity-30',
                      step.color === 'text-amber-400' && 'bg-amber-400',
                      step.color === 'text-cyan-400' && 'bg-cyan-400',
                      step.color === 'text-green-400' && 'bg-green-400',
                      step.color === 'text-purple-400' && 'bg-purple-400',
                      step.color === 'text-primary' && 'bg-primary',
                    )} />
                  </div>
                )}
              </div>

              {/* Text - Fixed height for consistent layout */}
              <div className="text-center mb-6 flex-grow flex flex-col justify-center">
                <h2 className={cn(
                  'font-display font-bold mb-4 tracking-wider',
                  step.useBrain ? 'text-4xl md:text-5xl text-pink-500 drop-shadow-[0_0_25px_rgba(236,72,153,0.5)]' : 'text-3xl md:text-4xl text-foreground'
                )}>
                  {step.title}
                </h2>
                <p className="text-lg text-white/80 leading-relaxed max-w-md mx-auto">
                  {step.description}
                </p>
              </div>

              {/* Step indicator */}
              <p className="text-center text-sm text-white/50 mb-4 font-mono tracking-wider">
                {currentStep + 1} / {ONBOARDING_STEPS.length}
              </p>

              {/* Navigation - Fixed at bottom */}
              <div className="flex items-center justify-center gap-4 mt-auto">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={goToPrev}
                  disabled={isFirstStep}
                  className={cn(
                    'flex items-center gap-2 px-6 rounded-xl',
                    isFirstStep && 'invisible'
                  )}
                >
                  <ChevronLeft className="w-5 h-5" />
                  Back
                </Button>

                <Button
                  size="lg"
                  onClick={goToNext}
                  className={cn(
                    'flex items-center gap-2 px-8 py-6 rounded-xl text-lg font-bold tracking-wide',
                    'bg-primary hover:bg-primary/90 text-primary-foreground',
                    'shadow-[0_0_30px_rgba(255,16,240,0.4)] hover:shadow-[0_0_50px_rgba(255,16,240,0.6)]',
                    'transition-all duration-300'
                  )}
                >
                  {isLastStep ? (
                    <>
                      Enter Cepho
                      <Sparkles className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Bottom gradient line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-cyan-400 to-purple-400" />
          </div>
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
