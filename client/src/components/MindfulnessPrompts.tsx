import { useState, useEffect } from 'react';
import { 
  Brain, Heart, Wind, Sun, Moon, Sparkles,
  Play, Pause, RotateCcw, X, Volume2, VolumeX
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface MindfulnessExercise {
  id: string;
  name: string;
  description: string;
  duration: number; // seconds
  icon: React.ElementType;
  color: string;
  bgColor: string;
  steps: string[];
}

const EXERCISES: MindfulnessExercise[] = [
  {
    id: 'breathing',
    name: 'Box Breathing',
    description: 'A calming technique used by Navy SEALs',
    duration: 120,
    icon: Wind,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    steps: [
      'Breathe in for 4 seconds',
      'Hold for 4 seconds',
      'Breathe out for 4 seconds',
      'Hold for 4 seconds'
    ]
  },
  {
    id: 'gratitude',
    name: 'Gratitude Moment',
    description: 'Quick reflection on what you\'re thankful for',
    duration: 60,
    icon: Heart,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/20',
    steps: [
      'Close your eyes and relax',
      'Think of 3 things you\'re grateful for today',
      'Feel the warmth of appreciation',
      'Carry this feeling with you'
    ]
  },
  {
    id: 'focus',
    name: 'Focus Reset',
    description: 'Clear mental clutter and regain concentration',
    duration: 90,
    icon: Brain,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    steps: [
      'Close your eyes',
      'Take 3 deep breaths',
      'Visualize a calm, clear space',
      'Set your intention for the next task'
    ]
  },
  {
    id: 'energy',
    name: 'Energy Boost',
    description: 'Quick energizing exercise for afternoon slumps',
    duration: 45,
    icon: Sun,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    steps: [
      'Stand up and stretch',
      'Take 5 energizing breaths',
      'Roll your shoulders back',
      'Smile and feel refreshed'
    ]
  },
  {
    id: 'wind-down',
    name: 'Wind Down',
    description: 'Transition from work mode to rest',
    duration: 180,
    icon: Moon,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/20',
    steps: [
      'Acknowledge your accomplishments today',
      'Release any remaining tension',
      'Set tomorrow\'s top priority',
      'Give yourself permission to rest'
    ]
  }
];

interface MindfulnessPromptsProps {
  onClose?: () => void;
  compact?: boolean;
}

export function MindfulnessPrompts({ onClose, compact = false }: MindfulnessPromptsProps) {
  const [selectedExercise, setSelectedExercise] = useState<MindfulnessExercise | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsPlaying(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isPlaying, timeRemaining]);

  useEffect(() => {
    if (selectedExercise && isPlaying) {
      const stepDuration = selectedExercise.duration / selectedExercise.steps.length;
      const elapsed = selectedExercise.duration - timeRemaining;
      const newStep = Math.min(
        Math.floor(elapsed / stepDuration),
        selectedExercise.steps.length - 1
      );
      setCurrentStep(newStep);
    }
  }, [timeRemaining, selectedExercise, isPlaying]);

  const startExercise = (exercise: MindfulnessExercise) => {
    setSelectedExercise(exercise);
    setTimeRemaining(exercise.duration);
    setCurrentStep(0);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const resetExercise = () => {
    if (selectedExercise) {
      setTimeRemaining(selectedExercise.duration);
      setCurrentStep(0);
      setIsPlaying(false);
    }
  };

  const closeExercise = () => {
    setSelectedExercise(null);
    setIsPlaying(false);
    setTimeRemaining(0);
    setCurrentStep(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Active exercise view
  if (selectedExercise) {
    const progress = ((selectedExercise.duration - timeRemaining) / selectedExercise.duration) * 100;
    const ExerciseIcon = selectedExercise.icon;
    
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full ${selectedExercise.bgColor} flex items-center justify-center`}>
                <ExerciseIcon className={`w-6 h-6 ${selectedExercise.color}`} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{selectedExercise.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedExercise.description}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={closeExercise}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Timer */}
          <div className="text-center mb-6">
            <div className={`text-5xl font-bold ${selectedExercise.color} mb-2`}>
              {formatTime(timeRemaining)}
            </div>
            <Progress value={progress} className="h-2 mb-4" />
          </div>

          {/* Current Step */}
          <div className={`p-4 rounded-lg ${selectedExercise.bgColor} mb-6`}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className={`w-4 h-4 ${selectedExercise.color}`} />
              <span className="text-sm font-medium text-foreground">
                Step {currentStep + 1} of {selectedExercise.steps.length}
              </span>
            </div>
            <p className={`text-lg font-medium ${selectedExercise.color}`}>
              {selectedExercise.steps[currentStep]}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" size="icon" onClick={() => setIsMuted(!isMuted)}>
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <Button 
              size="lg" 
              className={`w-16 h-16 rounded-full ${selectedExercise.bgColor}`}
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className={`w-6 h-6 ${selectedExercise.color}`} />
              ) : (
                <Play className={`w-6 h-6 ${selectedExercise.color}`} />
              )}
            </Button>
            <Button variant="outline" size="icon" onClick={resetExercise}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Exercise selection view
  return (
    <Card className="bg-card/60 border-border">
      <CardContent className={compact ? 'p-3' : 'p-4'}>
        {!compact && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Mindfulness</h2>
                <p className="text-sm text-muted-foreground">Take a moment to reset</p>
              </div>
            </div>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}

        <div className={`grid ${compact ? 'grid-cols-2 gap-2' : 'grid-cols-1 gap-3'}`}>
          {EXERCISES.map((exercise) => {
            const ExerciseIcon = exercise.icon;
            return (
              <button
                key={exercise.id}
                onClick={() => startExercise(exercise)}
                className={`flex items-center gap-3 p-3 rounded-lg ${exercise.bgColor} border border-transparent hover:border-${exercise.color.replace('text-', '')} transition-all text-left`}
              >
                <div className={`w-10 h-10 rounded-full bg-background/50 flex items-center justify-center`}>
                  <ExerciseIcon className={`w-5 h-5 ${exercise.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground text-sm">{exercise.name}</h3>
                  {!compact && (
                    <p className="text-xs text-muted-foreground truncate">{exercise.description}</p>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {Math.floor(exercise.duration / 60)} min
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default MindfulnessPrompts;
