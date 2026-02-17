import { useState } from 'react';
import { Play, Sparkles, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Tour Prompt and Demo Data Mode Indicator
 * Inspired by Amporah's onboarding prompts
 */

// Tour Prompt - "New to Cepho? Take a quick tour"
export function TourPrompt({ onStartTour, onSkip }: { onStartTour?: () => void; onSkip?: () => void }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleSkip = () => {
    setDismissed(true);
    onSkip?.();
  };

  return (
    <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/20 p-4">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
          <Play className="w-5 h-5 text-cyan-500" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-foreground">New to Cepho?</h4>
          <p className="text-sm text-muted-foreground">Take a quick tour to discover all features</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleSkip}>
            Skip
          </Button>
          <Button size="sm" onClick={onStartTour} className="bg-cyan-500 hover:bg-cyan-600">
            <Play className="w-4 h-4 mr-1" />
            Start Tour
          </Button>
        </div>
      </div>
    </div>
  );
}

// Demo Data Mode Indicator - "Viewing Demo Data - Sign in to see your real data"
export function DemoModeIndicator({ onSignIn }: { onSignIn?: () => void }) {
  return (
    <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/20 p-4">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-amber-500" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-foreground">Viewing Demo Data</h4>
          <p className="text-sm text-muted-foreground">Sign in to see your real agent activity and insights</p>
        </div>
        <Button variant="outline" size="sm" onClick={onSignIn}>
          Sign In
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// Combined component for dashboard
export function OnboardingPrompts({ 
  showTour = true, 
  showDemoMode = false,
  onStartTour,
  onSignIn 
}: { 
  showTour?: boolean;
  showDemoMode?: boolean;
  onStartTour?: () => void;
  onSignIn?: () => void;
}) {
  return (
    <div className="space-y-3">
      {showTour && <TourPrompt onStartTour={onStartTour} />}
      {showDemoMode && <DemoModeIndicator onSignIn={onSignIn} />}
    </div>
  );
}

// AI Learning Status - "Your AI is learning and adapting"
export function AILearningStatus() {
  return (
    <div className="text-center py-6">
      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center animate-pulse">
        <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </div>
      <p className="text-muted-foreground">Your AI is learning and adapting</p>
    </div>
  );
}

// Feature Cards - "One Brain, Many Minds" style
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-card/50 rounded-xl border border-border/50 p-6 text-center hover:border-primary/30 transition-all">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-100 to-teal-100 dark:from-cyan-900/30 dark:to-teal-900/30 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

// Feature Cards Grid
export function FeatureCardsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <FeatureCard
        icon={<svg className="w-8 h-8 text-cyan-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>}
        title="One Brain, Many Minds"
        description="Every user interaction feeds into a single, unified intelligence that grows exponentially smarter."
      />
      <FeatureCard
        icon={<svg className="w-8 h-8 text-teal-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>}
        title="Privacy-Preserved Learning"
        description="We learn patterns and preferences without exposing individual data - intelligence grows while privacy remains."
      />
      <FeatureCard
        icon={<svg className="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>}
        title="Contextual Expert Assembly"
        description="The right AI experts are assembled dynamically based on your specific needs and context."
      />
    </div>
  );
}
