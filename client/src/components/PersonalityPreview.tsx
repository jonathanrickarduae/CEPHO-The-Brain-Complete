import { useState, useEffect } from 'react';
import { Brain, MessageSquare, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface PersonalitySettings {
  formality: number; // 0-100: casual to formal
  verbosity: number; // 0-100: concise to detailed
  creativity: number; // 0-100: conservative to creative
  proactivity: number; // 0-100: reactive to proactive
  tone: 'professional' | 'friendly' | 'direct' | 'supportive';
}

interface PersonalityPreviewProps {
  settings: PersonalitySettings;
  className?: string;
}

// Sample prompts to demonstrate personality differences
const SAMPLE_PROMPTS = [
  "What should I focus on today?",
  "Can you summarize this meeting?",
  "I'm feeling overwhelmed with tasks",
  "Draft an email to a client",
];

// Generate response based on personality settings
function generatePreviewResponse(prompt: string, settings: PersonalitySettings): string {
  const { formality, verbosity, creativity, proactivity, tone } = settings;
  
  // Response templates based on prompt and settings
  const responses: Record<string, Record<string, string>> = {
    "What should I focus on today?": {
      casual_concise: "Hey! Top 3 for today: 1) Celadon review 2) Team sync 3) Clear inbox. You've got this! 💪",
      casual_detailed: "Morning! So I've been looking at your calendar and task list. Here's what I think makes sense:\n\n1. **Celadon Review** (2 hrs) - This is time-sensitive\n2. **Team Sync** (30 min) - Quick wins to unblock others\n3. **Inbox Zero** (1 hr) - You've got 12 items waiting\n\nI've also noticed you haven't taken a break in a while. Maybe schedule a walk?",
      formal_concise: "Good morning. Priority items: 1) Celadon review 2) Team synchronization 3) Correspondence management.",
      formal_detailed: "Good morning. Based on my analysis of your schedule and pending obligations, I recommend the following prioritization:\n\n1. **Celadon Pharmaceuticals Review** - Deadline approaching; estimated 2 hours\n2. **Team Synchronization Meeting** - Several team members awaiting direction\n3. **Correspondence Management** - 12 items requiring attention\n\nShall I prepare briefing materials for any of these items?",
    },
    "Can you summarize this meeting?": {
      casual_concise: "Quick recap: 3 decisions made, 2 action items for you, follow-up next Tuesday. Want the details?",
      casual_detailed: "Here's what went down:\n\n**Decisions:**\n- Budget approved for Q2\n- New hire starts March 1st\n- Postponing the rebrand discussion\n\n**Your action items:**\n- Send revised timeline by Friday\n- Review Sarah's proposal\n\n**Next steps:** Follow-up meeting Tuesday 2pm. I can add it to your calendar!",
      formal_concise: "Meeting summary: Three decisions reached, two action items assigned to you, follow-up scheduled for Tuesday.",
      formal_detailed: "Meeting Summary\n\n**Key Decisions:**\n1. Q2 budget allocation approved\n2. New team member onboarding scheduled for March 1st\n3. Brand refresh discussion deferred to next quarter\n\n**Action Items Assigned:**\n- Submit revised project timeline by Friday COB\n- Complete review of Ms. Chen's proposal\n\n**Next Steps:** Follow-up meeting scheduled for Tuesday at 14:00. Please confirm your availability.",
    },
    "I'm feeling overwhelmed with tasks": {
      casual_concise: "I hear you. Let's tackle this together - what's the ONE thing that would make the biggest difference right now?",
      casual_detailed: "Hey, I totally get it - your plate is full right now. Here's what I'm seeing:\n\n📊 You have 23 active tasks across 4 projects\n⏰ 5 are due this week\n🔥 2 are marked urgent\n\nHere's my suggestion: Let's focus on just the urgent ones first. I can handle some of the routine stuff autonomously if you'd like. Also, when did you last take a proper break? Sometimes stepping away helps.\n\nWhat feels most pressing to you?",
      formal_concise: "I understand. Let me help prioritize - which item would have the greatest impact if completed first?",
      formal_detailed: "I acknowledge your current workload appears substantial. Allow me to provide context:\n\n**Current Status:**\n- 23 active tasks across 4 projects\n- 5 items due within this week\n- 2 items flagged as urgent priority\n\n**Recommended Approach:**\n1. Address urgent items first (estimated 3 hours)\n2. Delegate routine tasks where possible\n3. Consider rescheduling non-critical items\n\nI can autonomously handle several administrative tasks if you grant approval. Would you like me to prepare a detailed prioritization matrix?",
    },
    "Draft an email to a client": {
      casual_concise: "Sure! What's the main point you want to get across? I'll keep it friendly and to the point.",
      casual_detailed: "Happy to help! Before I draft, quick questions:\n\n1. What's the main message? (update, request, follow-up?)\n2. Any specific tone? (I'm thinking warm but professional)\n3. Anything to avoid mentioning?\n\nI'll pull in relevant context from your recent conversations with them. Usually takes me about 30 seconds to draft once I know the direction!",
      formal_concise: "Certainly. Please provide the key message and any specific requirements for the correspondence.",
      formal_detailed: "I would be pleased to assist with this correspondence. To ensure the communication meets your standards, please provide:\n\n1. **Primary objective** of the communication\n2. **Key points** to be conveyed\n3. **Tone preference** (I will default to professional)\n4. **Any sensitive topics** to navigate carefully\n\nI will incorporate relevant context from your previous interactions with this client and ensure consistency with your established communication style.",
    },
  };

  // Determine response style based on settings
  const formalityKey = formality > 50 ? 'formal' : 'casual';
  const verbosityKey = verbosity > 50 ? 'detailed' : 'concise';
  const styleKey = `${formalityKey}_${verbosityKey}`;
  
  const promptResponses = responses[prompt];
  if (promptResponses && promptResponses[styleKey]) {
    let response = promptResponses[styleKey];
    
    // Add proactive suggestions if proactivity is high
    if (proactivity > 70 && !response.includes('I can') && !response.includes('Would you like')) {
      response += '\n\nI can also proactively prepare related materials if you\'d like.';
    }
    
    return response;
  }
  
  return "I'm here to help! What would you like me to assist with?";
}

export function PersonalityPreview({ settings, className }: PersonalityPreviewProps) {
  const [currentPrompt, setCurrentPrompt] = useState(SAMPLE_PROMPTS[0]);
  const [response, setResponse] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Regenerate response when settings or prompt changes
  useEffect(() => {
    setIsTyping(true);
    const newResponse = generatePreviewResponse(currentPrompt, settings);
    
    // Simulate typing effect
    let index = 0;
    setResponse('');
    const interval = setInterval(() => {
      if (index < newResponse.length) {
        setResponse(prev => prev + newResponse[index]);
        index++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 15);

    return () => clearInterval(interval);
  }, [currentPrompt, settings]);

  const cyclePrompt = () => {
    const currentIndex = SAMPLE_PROMPTS.indexOf(currentPrompt);
    const nextIndex = (currentIndex + 1) % SAMPLE_PROMPTS.length;
    setCurrentPrompt(SAMPLE_PROMPTS[nextIndex]);
  };

  return (
    <div className={cn('bg-card/60 border border-border rounded-xl overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <span className="font-medium text-sm">Personality Preview</span>
        </div>
        <Button variant="ghost" size="sm" onClick={cyclePrompt} className="h-8">
          <RefreshCw className="w-4 h-4 mr-1" />
          Try Another
        </Button>
      </div>

      {/* Chat Preview */}
      <div className="p-4 space-y-4 min-h-[200px]">
        {/* User Message */}
        <div className="flex justify-end">
          <div className="bg-primary text-primary-foreground px-4 py-2 rounded-2xl rounded-br-md max-w-[80%]">
            <p className="text-sm">{currentPrompt}</p>
          </div>
        </div>

        {/* Twin Response */}
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="bg-secondary/50 px-4 py-3 rounded-2xl rounded-tl-md max-w-[85%]">
            <p className="text-sm whitespace-pre-wrap">{response}</p>
            {isTyping && (
              <span className="inline-block w-2 h-4 bg-primary/60 animate-pulse ml-1" />
            )}
          </div>
        </div>
      </div>

      {/* Settings Summary */}
      <div className="px-4 py-3 border-t border-border bg-secondary/20">
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2 py-1 rounded-full bg-primary/10 text-primary">
            {settings.formality > 50 ? 'Formal' : 'Casual'}
          </span>
          <span className="px-2 py-1 rounded-full bg-primary/10 text-primary">
            {settings.verbosity > 50 ? 'Detailed' : 'Concise'}
          </span>
          <span className="px-2 py-1 rounded-full bg-primary/10 text-primary">
            {settings.tone}
          </span>
          {settings.proactivity > 70 && (
            <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-400">
              Proactive
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Compact inline preview for settings page
export function PersonalityPreviewInline({ settings }: { settings: PersonalitySettings }) {
  const response = generatePreviewResponse("What should I focus on today?", settings);
  
  return (
    <div className="bg-secondary/30 rounded-lg p-3 border border-border">
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Sample response</span>
      </div>
      <p className="text-sm text-foreground line-clamp-3">{response}</p>
    </div>
  );
}
