import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageBannerProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  iconColor?: string;
  iconBgColor?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageBanner({
  icon: Icon,
  title,
  subtitle,
  iconColor = 'text-primary',
  iconBgColor = 'bg-primary/20',
  children,
  className,
}: PageBannerProps) {
  return (
    <div className={cn(
      'border-b border-border bg-card/50 backdrop-blur-sm',
      className
    )}>
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg', iconBgColor)}>
            <Icon className={cn('w-6 h-6', iconColor)} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        
        {children && (
          <div className="flex items-center gap-4">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
