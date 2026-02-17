import { useState } from 'react';
import { Check, ChevronRight, Mic, Moon, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  carryForward: boolean;
}

interface EndOfDayWashUpProps {
  isOpen: boolean;
  onComplete: (rating: number, tomorrowPriorities: string[]) => void;
}

export function EndOfDayWashUp({ isOpen, onComplete }: EndOfDayWashUpProps) {
  const [step, setStep] = useState<'review' | 'tomorrow' | 'rating' | 'goodnight'>('review');
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Review investor deck', completed: true, carryForward: false },
    { id: '2', title: 'Call with legal team', completed: true, carryForward: false },
    { id: '3', title: 'Finalize Q1 projections', completed: false, carryForward: false },
    { id: '4', title: 'Send follow-up emails', completed: false, carryForward: false },
  ]);
  const [tomorrowPriorities, setTomorrowPriorities] = useState<string[]>([]);
  const [voiceInput, setVoiceInput] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const completedCount = tasks.filter(t => t.completed).length;
  const carryForwardCount = tasks.filter(t => t.carryForward).length;

  const toggleCarryForward = (id: string) => {
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, carryForward: !t.carryForward } : t
    ));
  };

  const handleNext = () => {
    if (step === 'review') setStep('tomorrow');
    else if (step === 'tomorrow') setStep('rating');
    else if (step === 'rating' && rating !== null) {
      setStep('goodnight');
      setTimeout(() => {
        onComplete(rating, tomorrowPriorities);
      }, 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Step: Review */}
        {step === 'review' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-6">
              <Moon className="w-10 h-10 text-purple-400 mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-white mb-1">End of Day</h2>
              <p className="text-foreground/70 text-sm">Quick review</p>
            </div>

            {/* Quick Stats */}
            <div className="flex justify-center gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">{completedCount}</div>
                <div className="text-xs text-foreground/60">Done</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">{tasks.length - completedCount}</div>
                <div className="text-xs text-foreground/60">Remaining</div>
              </div>
            </div>

            {/* Tasks - Swipe to carry forward */}
            <div className="space-y-2 mb-6 max-h-48 overflow-y-auto">
              {tasks.filter(t => !t.completed).map(task => (
                <button
                  key={task.id}
                  onClick={() => toggleCarryForward(task.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-lg transition-all",
                    task.carryForward 
                      ? "bg-purple-500/20 border border-purple-500/50" 
                      : "bg-white/5 border border-white/10"
                  )}
                >
                  <span className="text-white text-sm">{task.title}</span>
                  {task.carryForward ? (
                    <span className="text-xs text-purple-400 flex items-center gap-1">
                      Tomorrow <ArrowRight className="w-3 h-3" />
                    </span>
                  ) : (
                    <span className="text-xs text-foreground/60">Tap to carry forward</span>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={handleNext}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step: Tomorrow's Priorities */}
        {step === 'tomorrow' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-6">
              <Sparkles className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-white mb-1">Tomorrow</h2>
              <p className="text-foreground/70 text-sm">What should I prepare?</p>
            </div>

            {/* Voice Input */}
            <div className="mb-6">
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={cn(
                  "w-full p-4 rounded-xl border-2 border-dashed transition-all flex items-center justify-center gap-3",
                  isRecording 
                    ? "border-red-500 bg-red-500/10" 
                    : "border-white/20 bg-white/5 hover:border-white/40"
                )}
              >
                <Mic className={cn("w-5 h-5", isRecording ? "text-red-400 animate-pulse" : "text-foreground/70")} />
                <span className="text-foreground/80 text-sm">
                  {isRecording ? "Recording... tap to stop" : "Tap to speak tomorrow's focus"}
                </span>
              </button>
            </div>

            {/* Carried Forward Items */}
            {carryForwardCount > 0 && (
              <div className="mb-6 p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                <p className="text-xs text-purple-400 mb-2">Carrying forward:</p>
                <ul className="space-y-1">
                  {tasks.filter(t => t.carryForward).map(task => (
                    <li key={task.id} className="text-sm text-white flex items-center gap-2">
                      <ArrowRight className="w-3 h-3 text-purple-400" />
                      {task.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={handleNext}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step: Rating */}
        {step === 'rating' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">How was today?</h2>
              <p className="text-foreground/70 text-sm">Rate your day on the 100% Optimization Scale</p>
            </div>

            {/* 0-100 Rating Slider */}
            <div className="mb-8 px-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-foreground/70 text-sm">Score</span>
                <span className={cn(
                  "text-3xl font-bold",
                  (rating ?? 0) >= 90 ? "text-green-500" :
                  (rating ?? 0) >= 75 ? "text-lime-500" :
                  (rating ?? 0) >= 60 ? "text-yellow-500" :
                  (rating ?? 0) >= 40 ? "text-orange-500" : "text-red-500"
                )}>
                  {rating ?? 50}/100
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={rating ?? 50}
                onChange={(e) => setRating(parseInt(e.target.value))}
                className="w-full h-3 bg-white/10 rounded-full appearance-none cursor-pointer accent-pink-500"
                style={{
                  background: `linear-gradient(to right, 
                    ${(rating ?? 50) < 40 ? '#ef4444' : (rating ?? 50) < 60 ? '#f97316' : (rating ?? 50) < 75 ? '#eab308' : (rating ?? 50) < 90 ? '#84cc16' : '#22c55e'} 0%, 
                    ${(rating ?? 50) < 40 ? '#ef4444' : (rating ?? 50) < 60 ? '#f97316' : (rating ?? 50) < 75 ? '#eab308' : (rating ?? 50) < 90 ? '#84cc16' : '#22c55e'} ${rating ?? 50}%, 
                    rgba(255,255,255,0.1) ${rating ?? 50}%, 
                    rgba(255,255,255,0.1) 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-foreground/60 mt-2">
                <span>Critical</span>
                <span>Needs Work</span>
                <span>Adequate</span>
                <span>Good</span>
                <span>Excellent</span>
              </div>
            </div>

            {/* Quick Select Buttons */}
            <div className="flex justify-center gap-2 mb-8 flex-wrap">
              {[25, 50, 75, 90, 100].map(num => (
                <button
                  key={num}
                  onClick={() => setRating(num)}
                  className={cn(
                    "px-4 py-2 rounded-full font-bold text-sm transition-all",
                    rating === num
                      ? num < 40 
                        ? "bg-red-500 text-white scale-110" 
                        : num < 60 
                          ? "bg-orange-500 text-white scale-110"
                          : num < 75
                            ? "bg-yellow-500 text-black scale-110"
                            : "bg-green-500 text-white scale-110"
                      : "bg-white/10 text-foreground/70 hover:bg-white/20"
                  )}
                >
                  {num}
                </button>
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={rating === null}
              className={cn(
                "w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all",
                rating !== null
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
                  : "bg-white/10 text-foreground/60 cursor-not-allowed"
              )}
            >
              Done <Check className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step: Goodnight */}
        {step === 'goodnight' && (
          <div className="animate-in fade-in zoom-in duration-1000 text-center">
            <div className="mb-8">
              {/* Dimming Brain Animation */}
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-500/20 to-transparent rounded-full animate-pulse" />
                <div className="absolute inset-4 bg-gradient-to-b from-cyan-500/30 to-purple-500/30 rounded-full blur-xl animate-pulse" style={{ animationDelay: '0.5s' }} />
                <Moon className="w-16 h-16 text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-80" />
              </div>
              
              <h2 className="text-3xl font-bold text-white animate-in fade-in duration-1000" style={{ animationDelay: '0.5s' }}>
                Goodnight.
              </h2>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EndOfDayWashUp;
