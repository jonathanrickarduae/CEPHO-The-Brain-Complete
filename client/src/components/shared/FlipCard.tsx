import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  RotateCcw, Zap, Settings, Brain, Target, BookOpen,
  Lightbulb, Shield, TrendingUp, Users
} from 'lucide-react';
import { AIExpert, CorporatePartner } from '@/data/ai-experts.data';

interface FlipCardProps {
  expert?: AIExpert;
  corporate?: CorporatePartner;
  onStartProject?: () => void;
  onTweakApproach?: () => void;
}

export function FlipCard({ expert, corporate, onStartProject, onTweakApproach }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 85) return 'bg-green-500/20 border-green-500/30';
    if (score >= 70) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  if (expert) {
    return (
      <div 
        className="relative w-full h-[320px] cursor-pointer perspective-1000"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div 
          className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front of Card */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-4 backface-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="text-center h-full flex flex-col">
              <div className="text-5xl mb-3">{expert.avatar}</div>
              <h3 className="font-semibold text-white text-lg">{expert.name}</h3>
              <p className="text-xs text-foreground/70 mt-1 line-clamp-2">{expert.specialty}</p>
              <Badge variant="outline" className="mt-2 mx-auto text-xs">
                {expert.category}
              </Badge>
              
              <div className="mt-auto">
                <Badge 
                  variant="outline" 
                  className={`${getScoreBg(expert.performanceScore)} ${getScoreColor(expert.performanceScore)} border`}
                >
                  {expert.performanceScore}% Performance
                </Badge>
                <p className="text-xs text-foreground/60 mt-2 flex items-center justify-center gap-1">
                  <RotateCcw className="w-3 h-3" />
                  Click to flip
                </p>
              </div>
            </div>
          </div>

          {/* Back of Card */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 to-cyan-500/10 border border-fuchsia-500/30 rounded-xl p-4 backface-hidden rotate-y-180 overflow-y-auto"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                <span className="text-2xl">{expert.avatar}</span>
                <div>
                  <h4 className="font-semibold text-white text-sm">{expert.name}</h4>
                  <p className="text-[10px] text-foreground/70">{expert.specialty}</p>
                </div>
              </div>

              {/* Thinking Style */}
              <div>
                <div className="flex items-center gap-1 text-fuchsia-400 text-xs font-medium mb-1">
                  <Brain className="w-3 h-3" />
                  Thinking Style
                </div>
                <p className="text-[11px] text-foreground/80 italic">"{expert.thinkingStyle}"</p>
              </div>

              {/* Composite Influences */}
              <div>
                <div className="flex items-center gap-1 text-cyan-400 text-xs font-medium mb-1">
                  <Users className="w-3 h-3" />
                  Composite Of
                </div>
                <div className="flex flex-wrap gap-1">
                  {expert.compositeOf.map(inf => (
                    <Badge key={inf} className="text-[9px] bg-cyan-500/10 text-cyan-300 px-1.5 py-0">
                      {inf}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Strengths */}
              <div>
                <div className="flex items-center gap-1 text-green-400 text-xs font-medium mb-1">
                  <TrendingUp className="w-3 h-3" />
                  Strengths
                </div>
                <div className="flex flex-wrap gap-1">
                  {expert.strengths.slice(0, 3).map(s => (
                    <Badge key={s} className="text-[9px] bg-green-500/10 text-green-300 px-1.5 py-0">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Weaknesses */}
              <div>
                <div className="flex items-center gap-1 text-orange-400 text-xs font-medium mb-1">
                  <Shield className="w-3 h-3" />
                  Watch Out For
                </div>
                <div className="flex flex-wrap gap-1">
                  {expert.weaknesses.slice(0, 2).map(w => (
                    <Badge key={w} className="text-[9px] bg-orange-500/10 text-orange-300 px-1.5 py-0">
                      {w}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-white/10">
                <Button 
                  size="sm" 
                  className="flex-1 text-xs h-7 bg-gradient-to-r from-cyan-500 to-fuchsia-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartProject?.();
                  }}
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Start
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="flex-1 text-xs h-7 border-fuchsia-500/50 text-fuchsia-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTweakApproach?.();
                  }}
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Tweak
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (corporate) {
    return (
      <div 
        className="relative w-full h-[380px] cursor-pointer perspective-1000"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div 
          className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front of Card */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-5 backface-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="h-full flex flex-col">
              <div className="flex items-start gap-4">
                <div className="text-5xl">{corporate.logo}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white">{corporate.name}</h3>
                  <p className="text-sm text-foreground/70">{corporate.industry}</p>
                </div>
                <Badge 
                  variant="outline" 
                  className={`${getScoreBg(corporate.performanceScore)} ${getScoreColor(corporate.performanceScore)} border`}
                >
                  {corporate.performanceScore}%
                </Badge>
              </div>
              
              <p className="text-xs text-foreground/60 mt-3 line-clamp-2">{corporate.methodology}</p>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {corporate.strengths.slice(0, 4).map(s => (
                  <Badge key={s} variant="secondary" className="bg-white/5 text-foreground/80 text-xs">
                    {s}
                  </Badge>
                ))}
              </div>

              <div className="mt-auto pt-4">
                <p className="text-xs text-foreground/70">{corporate.projectsCompleted} projects completed</p>
                <p className="text-xs text-foreground/60 mt-2 flex items-center gap-1">
                  <RotateCcw className="w-3 h-3" />
                  Click to see research methodology
                </p>
              </div>
            </div>
          </div>

          {/* Back of Card - Research Methodology */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 to-cyan-500/10 border border-fuchsia-500/30 rounded-xl p-5 backface-hidden rotate-y-180 overflow-y-auto"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                <span className="text-3xl">{corporate.logo}</span>
                <div>
                  <h4 className="font-bold text-white">{corporate.name}</h4>
                  <p className="text-xs text-fuchsia-400">Research Methodology</p>
                </div>
              </div>

              {/* Thinking Framework */}
              <div>
                <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium mb-2">
                  <Brain className="w-4 h-4" />
                  How They Think
                </div>
                <p className="text-xs text-foreground/80">
                  {(corporate as any).thinkingFramework || corporate.methodology}
                </p>
              </div>

              {/* Research Approach */}
              <div>
                <div className="flex items-center gap-2 text-fuchsia-400 text-sm font-medium mb-2">
                  <BookOpen className="w-4 h-4" />
                  Research Approach
                </div>
                <p className="text-xs text-foreground/80">
                  {(corporate as any).researchApproach || 'Systematic analysis combining quantitative data with qualitative insights.'}
                </p>
              </div>

              {/* Key Principles */}
              <div>
                <div className="flex items-center gap-2 text-green-400 text-sm font-medium mb-2">
                  <Lightbulb className="w-4 h-4" />
                  Key Principles
                </div>
                <div className="flex flex-wrap gap-1">
                  {((corporate as any).keyPrinciples || corporate.strengths).slice(0, 4).map((p: string) => (
                    <Badge key={p} className="text-[10px] bg-green-500/10 text-green-300">
                      {p}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Signature Frameworks */}
              <div>
                <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium mb-2">
                  <Target className="w-4 h-4" />
                  Signature Frameworks
                </div>
                <div className="flex flex-wrap gap-1">
                  {corporate.frameworks.map(f => (
                    <Badge key={f} className="text-[10px] bg-yellow-500/10 text-yellow-300">
                      {f}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-white/10">
                <Button 
                  size="sm" 
                  className="flex-1 text-xs bg-gradient-to-r from-cyan-500 to-fuchsia-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartProject?.();
                  }}
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Start Project
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="flex-1 text-xs border-fuchsia-500/50 text-fuchsia-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTweakApproach?.();
                  }}
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Customize
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// CSS to add to your global styles or tailwind config
// .perspective-1000 { perspective: 1000px; }
// .transform-style-3d { transform-style: preserve-3d; }
// .backface-hidden { backface-visibility: hidden; }
// .rotate-y-180 { transform: rotateY(180deg); }
