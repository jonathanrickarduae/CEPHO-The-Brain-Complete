import { useState } from 'react';
import { Sun, CheckCircle, AlertCircle, Clock, ChevronRight, Shield, TrendingUp, Coffee } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BriefItem {
  id: string;
  title: string;
  type: 'review' | 'info' | 'action';
  priority: 'high' | 'medium' | 'low';
  source?: string;
}

interface MorningBriefProps {
  isOpen: boolean;
  onDismiss: () => void;
}

export function MorningBrief({ isOpen, onDismiss }: MorningBriefProps) {
  const [currentSection, setCurrentSection] = useState(0);
  
  const sections = [
    {
      title: 'Good morning',
      icon: Sun,
      color: 'text-yellow-400',
      content: (
        <div className="text-center py-8">
          <Sun className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-pulse" />
          <p className="text-foreground/70 text-sm">Here's what I prepared overnight</p>
        </div>
      )
    },
    {
      title: 'Ready for review',
      icon: CheckCircle,
      color: 'text-green-400',
      content: (
        <div className="space-y-3">
          <BriefCard 
            title="Q1 Financial Model - Final Draft"
            subtitle="Completed overnight"
            type="review"
          />
          <BriefCard 
            title="NDA for Celadon Partners"
            subtitle="Ready for your signature"
            type="review"
          />
          <BriefCard 
            title="Meeting notes summarized"
            subtitle="3 meetings from yesterday"
            type="info"
          />
        </div>
      )
    },
    {
      title: 'Today\'s priorities',
      icon: TrendingUp,
      color: 'text-cyan-400',
      content: (
        <div className="space-y-3">
          <BriefCard 
            title="Investor call at 10am"
            subtitle="Deck ready, talking points prepared"
            type="action"
            priority="high"
          />
          <BriefCard 
            title="Review legal documents"
            subtitle="Carried forward from yesterday"
            type="action"
            priority="medium"
          />
          <BriefCard 
            title="Team sync at 3pm"
            subtitle="Agenda prepared"
            type="action"
          />
        </div>
      )
    },
    {
      title: 'Security status',
      icon: Shield,
      color: 'text-purple-400',
      content: (
        <div className="text-center py-6">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-green-400" />
          </div>
          <p className="text-green-400 font-semibold mb-1">All Secure</p>
          <p className="text-foreground/60 text-xs">No threats detected overnight</p>
        </div>
      )
    }
  ];

  if (!isOpen) return null;

  const isLastSection = currentSection === sections.length - 1;
  const CurrentIcon = sections[currentSection].icon;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {sections.map((_, idx) => (
            <div 
              key={idx}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                idx === currentSection ? "bg-white w-6" : "bg-white/30"
              )}
            />
          ))}
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <CurrentIcon className={cn("w-10 h-10 mx-auto mb-3", sections[currentSection].color)} />
          <h2 className="text-2xl font-bold text-white">{sections[currentSection].title}</h2>
        </div>

        {/* Content */}
        <div className="min-h-[200px] mb-6">
          {sections[currentSection].content}
        </div>

        {/* Navigation */}
        <button
          onClick={() => {
            if (isLastSection) {
              onDismiss();
            } else {
              setCurrentSection(prev => prev + 1);
            }
          }}
          className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          {isLastSection ? (
            <>
              <Coffee className="w-4 h-4" />
              Let's go
            </>
          ) : (
            <>
              Next <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function BriefCard({ 
  title, 
  subtitle, 
  type, 
  priority 
}: { 
  title: string; 
  subtitle: string; 
  type: 'review' | 'info' | 'action';
  priority?: 'high' | 'medium' | 'low';
}) {
  return (
    <div className={cn(
      "p-3 rounded-lg border transition-all hover:scale-[1.02]",
      type === 'review' && "bg-green-500/10 border-green-500/30",
      type === 'info' && "bg-blue-500/10 border-blue-500/30",
      type === 'action' && "bg-purple-500/10 border-purple-500/30"
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white text-sm font-medium">{title}</p>
          <p className="text-foreground/60 text-xs mt-0.5">{subtitle}</p>
        </div>
        {priority === 'high' && (
          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
            Priority
          </span>
        )}
      </div>
    </div>
  );
}

export default MorningBrief;
