import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { Mic, Send, X, ChevronUp, Sparkles, Camera, FileText, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileInputSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string, type?: 'task' | 'question' | 'note') => void;
  placeholder?: string;
}

export function MobileInputSheet({ 
  isOpen, 
  onClose, 
  onSubmit,
  placeholder = "What do you need?"
}: MobileInputSheetProps) {
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedType, setSelectedType] = useState<'task' | 'question' | 'note'>('task');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const dragControls = useDragControls();

  // Auto-focus input when sheet opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 150)}px`;
    }
  }, [inputValue]);

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onSubmit(inputValue.trim(), selectedType);
      setInputValue('');
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const quickActions = [
    { icon: FileText, label: 'Task', type: 'task' as const, color: 'text-cyan-400' },
    { icon: Sparkles, label: 'Ask AI', type: 'question' as const, color: 'text-purple-400' },
    { icon: Calendar, label: 'Note', type: 'note' as const, color: 'text-amber-400' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) {
                onClose();
              }
            }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border rounded-t-3xl shadow-2xl"
            style={{ maxHeight: '80vh' }}
          >
            {/* Drag Handle */}
            <div 
              className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Content */}
            <div className="px-4 pb-safe">
              {/* Quick Type Selector */}
              <div className="flex items-center gap-2 mb-4">
                {quickActions.map((action) => (
                  <button
                    key={action.type}
                    onClick={() => setSelectedType(action.type)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
                      selectedType === action.type
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                    )}
                  >
                    <action.icon className={cn('w-4 h-4', selectedType === action.type ? 'text-primary' : action.color)} />
                    {action.label}
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <div className="relative mb-4">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  rows={1}
                  className="w-full bg-secondary/50 border border-border rounded-2xl px-4 py-4 pr-24 text-foreground placeholder:text-muted-foreground/60 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-base"
                  style={{ minHeight: '56px' }}
                />
                
                {/* Action Buttons */}
                <div className="absolute right-2 bottom-2 flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleSubmit}
                    disabled={!inputValue.trim()}
                    className="h-10 w-10 rounded-full hover:bg-primary/20 disabled:opacity-30"
                  >
                    <Send className={cn('w-5 h-5', inputValue.trim() ? 'text-primary' : 'text-muted-foreground')} />
                  </Button>
                  <Button
                    size="icon"
                    onClick={() => setIsRecording(!isRecording)}
                    className={cn(
                      'h-10 w-10 rounded-full transition-all',
                      isRecording
                        ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                        : 'bg-primary hover:bg-primary/90'
                    )}
                  >
                    <Mic className="w-5 h-5 text-white" />
                  </Button>
                </div>
              </div>

              {/* Suggestions */}
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedType === 'task' && (
                  <>
                    <SuggestionChip onClick={() => setInputValue('Schedule a meeting with ')}>Schedule meeting</SuggestionChip>
                    <SuggestionChip onClick={() => setInputValue('Remind me to ')}>Set reminder</SuggestionChip>
                    <SuggestionChip onClick={() => setInputValue('Add to my todo: ')}>Add todo</SuggestionChip>
                  </>
                )}
                {selectedType === 'question' && (
                  <>
                    <SuggestionChip onClick={() => setInputValue('Help me think through ')}>Think through</SuggestionChip>
                    <SuggestionChip onClick={() => setInputValue('What should I prioritize ')}>Prioritize</SuggestionChip>
                    <SuggestionChip onClick={() => setInputValue('Analyze ')}>Analyze</SuggestionChip>
                  </>
                )}
                {selectedType === 'note' && (
                  <>
                    <SuggestionChip onClick={() => setInputValue('I learned that ')}>Learning</SuggestionChip>
                    <SuggestionChip onClick={() => setInputValue('Idea: ')}>Idea</SuggestionChip>
                    <SuggestionChip onClick={() => setInputValue('Note to self: ')}>Note to self</SuggestionChip>
                  </>
                )}
              </div>

              {/* Keyboard hint */}
              <p className="text-center text-xs text-muted-foreground/50 pb-4">
                Swipe down to close • Press Enter to send
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SuggestionChip({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full bg-secondary/50 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
    >
      {children}
    </button>
  );
}

// Compact input trigger for the top of Dashboard
interface QuickInputTriggerProps {
  onClick: () => void;
  className?: string;
}

export function QuickInputTrigger({ onClick, className }: QuickInputTriggerProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-4 bg-card/80 backdrop-blur-sm border border-border rounded-2xl',
        'hover:border-primary/30 hover:bg-card transition-all group',
        'shadow-lg shadow-black/10',
        className
      )}
    >
      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
        <Sparkles className="w-5 h-5 text-primary" />
      </div>
      <span className="flex-1 text-left text-muted-foreground/70 text-base">
        What do you need? Tap to capture...
      </span>
      <ChevronUp className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
    </button>
  );
}
