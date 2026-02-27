// @ts-nocheck
import { Brain } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  icon?: LucideIcon;
  avatar?: string; // Avatar image URL
  title: string;
  subtitle?: string;
  iconColor?: string;
  children?: React.ReactNode;
}

export function PageHeader({ 
  icon: Icon, 
  avatar,
  title, 
  subtitle,
  iconColor = "text-primary",
  children 
}: PageHeaderProps) {
  return (
    <div className="bg-black text-white px-4 sm:px-6 py-3 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <span className="font-bold text-sm tracking-wide">CEPHO</span>
            <span className="text-white/40">|</span>
          </div>
          <div className="flex items-center gap-2">
            {avatar ? (
              <div className="relative">
                <img 
                  src={avatar} 
                  alt={title}
                  className="w-8 h-8 rounded-full object-cover border-2 border-primary/50"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-black" />
              </div>
            ) : Icon ? (
              <div className={`p-1.5 rounded-lg bg-white/10 ${iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            ) : null}
            <div>
              <h1 className="text-base font-semibold">{title}</h1>
              {subtitle && (
                <p className="text-xs text-white/60">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
        {children && (
          <div className="flex items-center gap-2">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

// Compact version for mobile
export function PageHeaderCompact({ 
  icon: Icon, 
  title,
  iconColor = "text-primary",
  children 
}: Omit<PageHeaderProps, 'subtitle'>) {
  return (
    <div className="bg-black text-white px-3 py-2 sticky top-0 z-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          <span className="font-bold text-xs tracking-wide">CEPHO</span>
          <span className="text-white/40 text-xs">|</span>
          <Icon className={`w-4 h-4 ${iconColor}`} />
          <span className="text-sm font-medium">{title}</span>
        </div>
        {children}
      </div>
    </div>
  );
}
