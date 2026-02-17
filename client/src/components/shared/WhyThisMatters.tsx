import { ReactNode } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle, Lightbulb, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WhyThisMattersProps {
  children: ReactNode;
  explanation: string;
  impact?: 'high' | 'medium' | 'low';
  category?: 'integration' | 'feature' | 'metric' | 'general';
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const impactColors = {
  high: 'border-green-500/50 bg-green-500/10',
  medium: 'border-amber-500/50 bg-amber-500/10',
  low: 'border-gray-500/50 bg-gray-500/10'
};

const impactLabels = {
  high: 'High Impact',
  medium: 'Medium Impact',
  low: 'Nice to Have'
};

export function WhyThisMatters({ 
  children, 
  explanation, 
  impact = 'medium',
  category = 'general',
  side = 'top',
  className 
}: WhyThisMattersProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <span className={cn('inline-flex items-center gap-1 cursor-help', className)}>
            {children}
            <HelpCircle className="w-4 h-4 text-muted-foreground hover:text-white transition-colors" />
          </span>
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          className={cn(
            'max-w-xs p-3 border',
            impactColors[impact]
          )}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-medium text-amber-400">Why This Matters</span>
            </div>
            <p className="text-sm text-white">{explanation}</p>
            <div className="flex items-center gap-2 pt-1 border-t border-gray-700">
              <span className={cn(
                'text-xs px-2 py-0.5 rounded',
                impact === 'high' && 'bg-green-500/20 text-green-400',
                impact === 'medium' && 'bg-amber-500/20 text-amber-400',
                impact === 'low' && 'bg-gray-500/20 text-gray-400'
              )}>
                {impactLabels[impact]}
              </span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Pre-defined explanations for common integrations
export const integrationExplanations: Record<string, { explanation: string; impact: 'high' | 'medium' | 'low' }> = {
  calendar: {
    explanation: 'Calendar integration enables automatic meeting scheduling, availability checking, and ensures your Chief of Staff can manage your time effectively.',
    impact: 'high'
  },
  email: {
    explanation: 'Email integration allows the Chief of Staff to draft responses, prioritize messages, and keep you informed of important communications.',
    impact: 'high'
  },
  crm: {
    explanation: 'CRM integration provides context about your relationships, deal status, and customer interactions for better decision support.',
    impact: 'medium'
  },
  slack: {
    explanation: 'Slack integration enables real-time notifications, team coordination, and quick access to your Chief of Staff from your workspace.',
    impact: 'medium'
  },
  notion: {
    explanation: 'Notion integration syncs your knowledge base, project documentation, and notes for comprehensive context awareness.',
    impact: 'medium'
  },
  stripe: {
    explanation: 'Payment integration enables subscription management, revenue tracking, and financial insights for your business.',
    impact: 'high'
  },
  analytics: {
    explanation: 'Analytics integration provides data-driven insights about user behavior, product usage, and business metrics.',
    impact: 'medium'
  },
  github: {
    explanation: 'GitHub integration tracks development progress, code changes, and technical milestones for project oversight.',
    impact: 'low'
  }
};

// Wrapper component for integration items
interface IntegrationTooltipProps {
  children: ReactNode;
  integrationKey: keyof typeof integrationExplanations;
}

export function IntegrationTooltip({ children, integrationKey }: IntegrationTooltipProps) {
  const config = integrationExplanations[integrationKey];
  if (!config) return <>{children}</>;
  
  return (
    <WhyThisMatters 
      explanation={config.explanation} 
      impact={config.impact}
      category="integration"
    >
      {children}
    </WhyThisMatters>
  );
}

// Info badge variant
interface InfoBadgeProps {
  text: string;
  explanation: string;
  impact?: 'high' | 'medium' | 'low';
}

export function InfoBadge({ text, explanation, impact = 'medium' }: InfoBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800 rounded-md text-sm cursor-help">
            {text}
            <Info className="w-3 h-3 text-muted-foreground" />
          </span>
        </TooltipTrigger>
        <TooltipContent className={cn('max-w-xs p-3', impactColors[impact])}>
          <p className="text-sm">{explanation}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default WhyThisMatters;
