import { useState } from 'react';
import { TwinBreakApproval } from '@/components/shared/TwinBreakApproval';
import { Headphones, Coffee, Wind, Brain, Zap, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Performance Boost - Quick 15-min interventions
 * Business-focused: Get you from current level to peak performance
 */

interface BoostOption {
  id: string;
  icon: React.ElementType;
  label: string;
  duration: string;
}

const BOOST_OPTIONS: BoostOption[] = [
  { id: 'listen', icon: Headphones, label: 'Listen to this', duration: '15 min' },
  { id: 'walk', icon: Wind, label: 'Take a walk', duration: '15 min' },
  { id: 'coffee', icon: Coffee, label: 'Coffee break', duration: '15 min' },
  { id: 'breathe', icon: Brain, label: 'Clear your head', duration: '15 min' },
];

export function PerformanceBoost() {
  const [currentScore] = useState(6);
  const [selectedBoost, setSelectedBoost] = useState<string | null>(null);

  const [showTwinApproval, setShowTwinApproval] = useState(false);

  const handleBoost = (id: string) => {
    setSelectedBoost(id);
    setShowTwinApproval(true);
  };

  return (
    <div className="bg-card/50 rounded-xl border border-border/50 p-4">
      {/* Score Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <span className="text-xl font-bold text-white">{currentScore}</span>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">You're at</p>
            <p className="font-semibold text-foreground">
              {currentScore}/10 <span className="text-muted-foreground font-normal">→ get to 8</span>
            </p>
          </div>
        </div>
        <Zap className="w-5 h-5 text-amber-500" />
      </div>

      {/* Quick Boost Options */}
      <p className="text-sm text-muted-foreground mb-3">15 mins to boost:</p>
      <div className="grid grid-cols-2 gap-2">
        {BOOST_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedBoost === option.id;
          
          return (
            <Button
              key={option.id}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              className="h-auto py-3 flex flex-col items-center gap-1"
              onClick={() => handleBoost(option.id)}
            >
              {isSelected ? (
                <Check className="w-5 h-5" />
              ) : (
                <Icon className="w-5 h-5" />
              )}
              <span className="text-xs">{option.label}</span>
            </Button>
          );
        })}
      </div>

      {/* Twin Break Approval Modal */}
      {showTwinApproval && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <TwinBreakApproval
              onApprove={() => {
                setShowTwinApproval(false);
              }}
              onCancel={() => {
                setShowTwinApproval(false);
                setSelectedBoost(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Even simpler inline version
export function PerformanceBoostInline() {
  const [currentScore] = useState(6);

  return (
    <div className="flex items-center gap-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
      <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
        <span className="text-lg font-bold text-white">{currentScore}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">You're at {currentScore}/10</p>
        <p className="text-xs text-muted-foreground">15 min break suggested</p>
      </div>
      <Button size="sm" variant="outline" className="flex-shrink-0">
        <Headphones className="w-4 h-4 mr-1" />
        Boost
      </Button>
    </div>
  );
}
