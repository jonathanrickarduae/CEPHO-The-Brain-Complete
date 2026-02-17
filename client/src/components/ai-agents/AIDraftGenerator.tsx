import { useState, useCallback } from 'react';
import { Sparkles, Wand2, RefreshCw, Copy, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc';

interface AIDraftGeneratorProps {
  type: 'email' | 'message' | 'document' | 'task';
  context?: string;
  recipient?: string;
  onDraftGenerated?: (draft: string) => void;
  className?: string;
}

const TONE_OPTIONS = [
  { id: 'professional', label: 'Professional' },
  { id: 'friendly', label: 'Friendly' },
  { id: 'concise', label: 'Concise' },
  { id: 'detailed', label: 'Detailed' },
  { id: 'persuasive', label: 'Persuasive' },
];

const LENGTH_OPTIONS = [
  { id: 'short', label: 'Short', description: '1-2 sentences' },
  { id: 'medium', label: 'Medium', description: '1 paragraph' },
  { id: 'long', label: 'Long', description: 'Multiple paragraphs' },
];

export function AIDraftGenerator({ 
  type, 
  context, 
  recipient,
  onDraftGenerated,
  className 
}: AIDraftGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');
  const [draft, setDraft] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const chatMutation = trpc.chat.send.useMutation();

  const generateDraft = useCallback(async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const fullPrompt = `Generate a ${length} ${tone} ${type} draft.
${recipient ? `Recipient: ${recipient}` : ''}
${context ? `Context: ${context}` : ''}
Request: ${prompt}

Please write only the ${type} content, no explanations or meta-commentary.`;

      const result = await chatMutation.mutateAsync({ 
        message: fullPrompt,
        context: `draft_${type}`,
      });
      
      setDraft(result.message);
      onDraftGenerated?.(result.message);
    } catch (error) {
      console.error('Draft generation failed:', error);
      setDraft('Failed to generate draft. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, tone, length, type, recipient, context, chatMutation, onDraftGenerated]);

  const regenerate = useCallback(() => {
    generateDraft();
  }, [generateDraft]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [draft]);

  const typeLabels: Record<string, string> = {
    email: 'Email',
    message: 'Message',
    document: 'Document',
    task: 'Task Description',
  };

  return (
    <div className={cn('bg-card/60 border border-white/10 rounded-xl overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h3 className="font-medium text-foreground">AI {typeLabels[type]} Draft</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowOptions(!showOptions)}
          className="text-xs"
        >
          Options <ChevronDown className={cn('w-3 h-3 ml-1 transition-transform', showOptions && 'rotate-180')} />
        </Button>
      </div>

      {/* Options Panel */}
      {showOptions && (
        <div className="px-4 py-3 border-b border-white/10 bg-secondary/20 space-y-3">
          {/* Tone Selection */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Tone</label>
            <div className="flex flex-wrap gap-2">
              {TONE_OPTIONS.map(option => (
                <button
                  key={option.id}
                  onClick={() => setTone(option.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                    tone === option.id
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Length Selection */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Length</label>
            <div className="flex gap-2">
              {LENGTH_OPTIONS.map(option => (
                <button
                  key={option.id}
                  onClick={() => setLength(option.id)}
                  className={cn(
                    'flex-1 px-3 py-2 rounded-lg text-xs transition-colors',
                    length === option.id
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                  )}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-[10px] opacity-70">{option.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={`What would you like to say in this ${type}?`}
          className="w-full h-24 px-3 py-2 bg-secondary/30 border border-white/10 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm placeholder:text-muted-foreground"
        />
        
        <div className="flex items-center justify-between mt-3">
          <div className="text-xs text-muted-foreground">
            {tone} • {length}
          </div>
          <Button
            onClick={generateDraft}
            disabled={!prompt.trim() || isGenerating}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Draft
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Generated Draft */}
      {draft && (
        <div className="border-t border-white/10">
          <div className="flex items-center justify-between px-4 py-2 bg-secondary/20">
            <span className="text-xs text-muted-foreground">Generated Draft</span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={regenerate}
                disabled={isGenerating}
                className="text-xs"
              >
                <RefreshCw className={cn('w-3 h-3 mr-1', isGenerating && 'animate-spin')} />
                Regenerate
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="text-xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 mr-1 text-green-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>
          <div className="p-4">
            <div className="p-4 bg-secondary/30 rounded-lg border border-white/10">
              <p className="text-sm text-foreground whitespace-pre-wrap">{draft}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Quick draft button that opens a modal
export function QuickDraftButton({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [draftType, setDraftType] = useState<'email' | 'message' | 'document' | 'task'>('email');

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className={cn('gap-2', className)}
      >
        <Sparkles className="w-4 h-4" />
        AI Draft
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative w-full max-w-lg">
            {/* Type Selector */}
            <div className="flex gap-2 mb-2">
              {(['email', 'message', 'document', 'task'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setDraftType(t)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors',
                    draftType === t
                      ? 'bg-purple-500 text-white'
                      : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <AIDraftGenerator 
              type={draftType} 
              onDraftGenerated={() => {}}
            />
          </div>
        </div>
      )}
    </>
  );
}
