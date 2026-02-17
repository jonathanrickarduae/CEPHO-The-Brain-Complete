import { useState, useEffect } from 'react';
import { X, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector or element ID
  position: 'top' | 'bottom' | 'left' | 'right';
  highlight: boolean;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Cepho',
    description: 'Your AI Chief of Staff is ready to help. Let\'s take a quick tour of the key features.',
    target: 'body',
    position: 'bottom',
    highlight: false,
  },
  {
    id: 'voice-input',
    title: 'Voice Input',
    description: 'Click the microphone to record your thoughts. Cepho will transcribe and understand your needs.',
    target: '[data-tour="voice-input"]',
    position: 'bottom',
    highlight: true,
  },
  {
    id: 'daily-brief',
    title: 'Daily Brief',
    description: 'Start your day with a personalized briefing of priorities, schedule, and intelligence.',
    target: '[data-tour="daily-brief"]',
    position: 'bottom',
    highlight: true,
  },
  {
    id: 'ai-experts',
    title: 'AI Expert Team',
    description: 'Assemble a team of AI experts for complex projects. Each expert brings unique perspectives.',
    target: '[data-tour="ai-experts"]',
    position: 'bottom',
    highlight: true,
  },
  {
    id: 'chief-of-staff',
    title: 'Chief of Staff Config',
    description: 'Define your AI\'s responsibilities, boundaries, and autonomy levels. Train it to match your style.',
    target: '[data-tour="chief-of-staff"]',
    position: 'bottom',
    highlight: true,
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'You\'re ready to start. Dismiss this tour anytime by clicking the X button.',
    target: 'body',
    position: 'bottom',
    highlight: false,
  },
];

export function OnboardingOverlay() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // Check if user has seen onboarding
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('cepho_onboarding_complete');
    if (!hasSeenOnboarding) {
      // Show onboarding after a short delay
      setTimeout(() => setIsVisible(true), 500);
    }
  }, []);

  // Update target element position
  useEffect(() => {
    if (!isVisible) return;

    const step = ONBOARDING_STEPS[currentStep];
    if (step.target === 'body') {
      setTargetRect(null);
      return;
    }

    const element = document.querySelector(step.target);
    if (element) {
      setTargetRect(element.getBoundingClientRect());
    }
  }, [currentStep, isVisible]);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem('cepho_onboarding_complete', 'true');
  };

  if (!isVisible) return null;

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  return (
    <>
      {/* Overlay backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={handleSkip}
      />

      {/* Spotlight highlight */}
      {step.highlight && targetRect && (
        <div
          className="fixed z-40 rounded-lg border-2 border-primary/50 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)] pointer-events-none transition-all duration-300"
          style={{
            top: `${targetRect.top - 8}px`,
            left: `${targetRect.left - 8}px`,
            width: `${targetRect.width + 16}px`,
            height: `${targetRect.height + 16}px`,
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        className="fixed z-50 bg-card border border-border rounded-lg shadow-2xl p-6 max-w-sm animate-in fade-in slide-in-from-bottom-4 transition-all"
        style={{
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: targetRect ? 'auto' : '50%',
          top: targetRect ? `${targetRect.bottom + 20}px` : 'auto',
          maxWidth: '90vw',
        }}
      >
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-3 right-3 p-1 hover:bg-secondary rounded-md transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex gap-1">
            {ONBOARDING_STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx < currentStep + 1 ? 'bg-primary w-3' : 'bg-border w-2'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground ml-auto">
            {currentStep + 1} / {ONBOARDING_STEPS.length}
          </span>
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {step.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          {step.description}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSkip}
            className="text-xs"
          >
            Skip Tour
          </Button>
          <Button
            size="sm"
            onClick={handleNext}
            className="text-xs gap-2"
          >
            {isLastStep ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Get Started
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
    </>
  );
}
