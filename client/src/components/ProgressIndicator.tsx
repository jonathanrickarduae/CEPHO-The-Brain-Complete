import { useState, useEffect } from 'react';
import { Brain, Sparkles, TrendingUp, CheckCircle } from 'lucide-react';

interface ProgressIndicatorProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'gradient' | 'glow';
  animated?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = true,
  size = 'md',
  variant = 'default',
  animated = true,
}: ProgressIndicatorProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const variantClasses = {
    default: 'bg-primary',
    gradient: 'bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500',
    glow: 'bg-primary shadow-[0_0_10px_rgba(255,16,240,0.5)]',
  };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-sm text-muted-foreground">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-medium text-foreground">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-700 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`${sizeClasses[size]} rounded-full ${variantClasses[variant]} ${
            animated ? 'transition-all duration-500 ease-out' : ''
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Circular progress for Chief of Staff training
interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  icon?: React.ReactNode;
  showValue?: boolean;
}

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  label,
  icon,
  showValue = true,
}: CircularProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-700"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-500 ease-out"
          />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {icon || <Brain className="w-6 h-6 text-primary mb-1" />}
          {showValue && (
            <span className="text-lg font-bold text-foreground">{Math.round(percentage)}%</span>
          )}
        </div>
      </div>
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </div>
  );
}

// Chief of Staff Training Progress Card
interface TrainingProgressProps {
  hoursLogged: number;
  targetHours?: number;
  conversationsCount: number;
  feedbackCount: number;
  accuracyScore: number;
}

export function DigitalTwinTrainingProgress({
  hoursLogged,
  targetHours = 100,
  conversationsCount,
  feedbackCount,
  accuracyScore,
}: TrainingProgressProps) {
  const [animatedHours, setAnimatedHours] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedHours(hoursLogged), 100);
    return () => clearTimeout(timer);
  }, [hoursLogged]);

  const milestones = [
    { hours: 10, label: 'Beginner', level: 1 },
    { hours: 25, label: 'Learning', level: 2 },
    { hours: 50, label: 'Growing', level: 3 },
    { hours: 75, label: 'Advanced', level: 4 },
    { hours: 100, label: 'Expert', level: 5 },
  ];

  const currentMilestone = milestones.reduce((prev, curr) => 
    hoursLogged >= curr.hours ? curr : prev
  , milestones[0]);

  const nextMilestone = milestones.find(m => m.hours > hoursLogged) || milestones[milestones.length - 1];

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Chief of Staff Training</h3>
            <p className="text-sm text-muted-foreground">
              Level {currentMilestone.level} - {currentMilestone.label}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-foreground">{animatedHours}h</div>
          <div className="text-xs text-muted-foreground">of {targetHours}h goal</div>
        </div>
      </div>

      {/* Main progress bar */}
      <div className="mb-6">
        <ProgressBar
          value={hoursLogged}
          max={targetHours}
          variant="gradient"
          size="lg"
          showPercentage={false}
        />
        <div className="flex justify-between mt-2">
          {milestones.map((milestone, i) => (
            <div
              key={milestone.hours}
              className={`flex flex-col items-center ${
                hoursLogged >= milestone.hours ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <span className="text-sm font-medium">L{milestone.level}</span>
              <span className="text-xs">{milestone.hours}h</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-background rounded-lg p-3 text-center">
          <Sparkles className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-foreground">{conversationsCount}</div>
          <div className="text-xs text-muted-foreground">Conversations</div>
        </div>
        <div className="bg-background rounded-lg p-3 text-center">
          <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-foreground">{feedbackCount}</div>
          <div className="text-xs text-muted-foreground">Feedback Given</div>
        </div>
        <div className="bg-background rounded-lg p-3 text-center">
          <CheckCircle className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-foreground">{accuracyScore}%</div>
          <div className="text-xs text-muted-foreground">Accuracy</div>
        </div>
      </div>

      {/* Next milestone */}
      {hoursLogged < targetHours && (
        <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Next: Level {nextMilestone.level} - {nextMilestone.label}
            </span>
            <span className="text-sm font-medium text-primary">
              {nextMilestone.hours - hoursLogged}h to go
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Step progress indicator
interface StepProgressProps {
  steps: string[];
  currentStep: number;
  variant?: 'horizontal' | 'vertical';
}

export function StepProgress({ steps, currentStep, variant = 'horizontal' }: StepProgressProps) {
  if (variant === 'vertical') {
    return (
      <div className="flex flex-col gap-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  index < currentStep
                    ? 'bg-primary text-primary-foreground'
                    : index === currentStep
                    ? 'bg-primary/20 text-primary border-2 border-primary'
                    : 'bg-gray-700 text-foreground/70'
                }`}
              >
                {index < currentStep ? <CheckCircle className="w-5 h-5" /> : index + 1}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-0.5 h-8 mt-2 ${
                    index < currentStep ? 'bg-primary' : 'bg-gray-700'
                  }`}
                />
              )}
            </div>
            <div className="pt-1">
              <span
                className={`text-sm ${
                  index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {step}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                index < currentStep
                  ? 'bg-primary text-primary-foreground'
                  : index === currentStep
                  ? 'bg-primary/20 text-primary border-2 border-primary'
                  : 'bg-gray-700 text-foreground/70'
              }`}
            >
              {index < currentStep ? <CheckCircle className="w-4 h-4" /> : index + 1}
            </div>
            <span
              className={`text-xs mt-1 text-center max-w-[80px] ${
                index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              {step}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-2 ${
                index < currentStep ? 'bg-primary' : 'bg-gray-700'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
