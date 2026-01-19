import { useState } from 'react';

/**
 * AI Expert Avatar System
 * Consistent avatar styling for all AI experts
 */

interface ExpertAvatarProps {
  name: string;
  emoji?: string;
  category?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  status?: 'online' | 'busy' | 'offline';
  className?: string;
}

// Category to gradient mapping
const CATEGORY_GRADIENTS: Record<string, string> = {
  'Business Strategy': 'from-blue-500 to-cyan-400',
  'Finance': 'from-emerald-500 to-teal-400',
  'Legal': 'from-purple-500 to-violet-400',
  'Technology': 'from-cyan-500 to-blue-400',
  'Marketing': 'from-pink-500 to-rose-400',
  'Operations': 'from-amber-500 to-orange-400',
  'Healthcare': 'from-red-500 to-pink-400',
  'Creative': 'from-fuchsia-500 to-purple-400',
  'Research': 'from-indigo-500 to-blue-400',
  'HR': 'from-green-500 to-emerald-400',
  'Sales': 'from-orange-500 to-amber-400',
  'Product': 'from-violet-500 to-indigo-400',
  'Data': 'from-sky-500 to-cyan-400',
  'Security': 'from-slate-500 to-gray-400',
  'default': 'from-primary to-purple-500',
};

// Size configurations
const SIZE_CONFIG = {
  sm: { container: 'w-8 h-8', text: 'text-sm', status: 'w-2 h-2' },
  md: { container: 'w-10 h-10', text: 'text-base', status: 'w-2.5 h-2.5' },
  lg: { container: 'w-12 h-12', text: 'text-lg', status: 'w-3 h-3' },
  xl: { container: 'w-16 h-16', text: 'text-2xl', status: 'w-4 h-4' },
};

// Status colors
const STATUS_COLORS = {
  online: 'bg-green-500',
  busy: 'bg-amber-500',
  offline: 'bg-gray-500',
};

export function ExpertAvatar({ 
  name, 
  emoji, 
  category = 'default',
  size = 'md',
  showStatus = false,
  status = 'online',
  className = ''
}: ExpertAvatarProps) {
  const [imageError, setImageError] = useState(false);
  
  const gradient = CATEGORY_GRADIENTS[category] || CATEGORY_GRADIENTS.default;
  const sizeConfig = SIZE_CONFIG[size];
  
  // Get initials from name
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={`relative inline-flex ${className}`}>
      <div 
        className={`
          ${sizeConfig.container}
          rounded-full
          bg-gradient-to-br ${gradient}
          flex items-center justify-center
          shadow-lg shadow-black/20
          ring-2 ring-white/10
          transition-transform duration-200
          hover:scale-105
        `}
      >
        {emoji && !imageError ? (
          <span className={sizeConfig.text}>{emoji}</span>
        ) : (
          <span className={`${sizeConfig.text} font-semibold text-white`}>
            {initials}
          </span>
        )}
      </div>
      
      {showStatus && (
        <div 
          className={`
            absolute -bottom-0.5 -right-0.5
            ${sizeConfig.status}
            ${STATUS_COLORS[status]}
            rounded-full
            ring-2 ring-background
          `}
        />
      )}
    </div>
  );
}

// Expert Card with Avatar
interface ExpertCardProps {
  name: string;
  emoji?: string;
  category: string;
  specialization: string;
  status?: 'online' | 'busy' | 'offline';
  onClick?: () => void;
}

export function ExpertCard({ 
  name, 
  emoji, 
  category, 
  specialization,
  status = 'online',
  onClick 
}: ExpertCardProps) {
  return (
    <button
      onClick={onClick}
      className="
        flex items-center gap-3 p-3
        bg-card/50 hover:bg-card/80
        border border-border/50 hover:border-primary/30
        rounded-xl
        transition-all duration-200
        hover:shadow-lg hover:shadow-primary/5
        hover:-translate-y-0.5
        text-left w-full
      "
    >
      <ExpertAvatar 
        name={name} 
        emoji={emoji} 
        category={category}
        size="lg"
        showStatus
        status={status}
      />
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-foreground truncate">{name}</h4>
        <p className="text-xs text-muted-foreground truncate">{specialization}</p>
        <span className="text-[10px] text-primary/70 uppercase tracking-wider">{category}</span>
      </div>
    </button>
  );
}

// Avatar Group for showing multiple experts
interface AvatarGroupProps {
  experts: Array<{ name: string; emoji?: string; category?: string }>;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function AvatarGroup({ experts, max = 4, size = 'md' }: AvatarGroupProps) {
  const displayed = experts.slice(0, max);
  const remaining = experts.length - max;
  
  const overlapClass = {
    sm: '-ml-2',
    md: '-ml-3',
    lg: '-ml-4',
  };

  return (
    <div className="flex items-center">
      {displayed.map((expert, index) => (
        <div 
          key={expert.name} 
          className={index > 0 ? overlapClass[size] : ''}
          style={{ zIndex: displayed.length - index }}
        >
          <ExpertAvatar 
            name={expert.name}
            emoji={expert.emoji}
            category={expert.category}
            size={size}
          />
        </div>
      ))}
      {remaining > 0 && (
        <div 
          className={`
            ${overlapClass[size]}
            ${SIZE_CONFIG[size].container}
            rounded-full
            bg-secondary
            flex items-center justify-center
            ring-2 ring-background
          `}
          style={{ zIndex: 0 }}
        >
          <span className="text-xs font-medium text-muted-foreground">
            +{remaining}
          </span>
        </div>
      )}
    </div>
  );
}
