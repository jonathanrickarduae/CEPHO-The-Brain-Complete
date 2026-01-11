import { useState, ReactNode, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  icon?: ReactNode;
  badge?: string | number;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  onToggle?: (isOpen: boolean) => void;
}

export function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
  icon,
  badge,
  className = '',
  headerClassName = '',
  contentClassName = '',
  onToggle,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [height, setHeight] = useState<number | 'auto'>(defaultOpen ? 'auto' : 0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      if (isOpen) {
        const contentHeight = contentRef.current.scrollHeight;
        setHeight(contentHeight);
        // After animation, set to auto for dynamic content
        const timer = setTimeout(() => setHeight('auto'), 300);
        return () => clearTimeout(timer);
      } else {
        // First set to actual height, then animate to 0
        setHeight(contentRef.current.scrollHeight);
        requestAnimationFrame(() => {
          setHeight(0);
        });
      }
    }
  }, [isOpen]);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onToggle?.(newState);
  };

  return (
    <div className={`border border-border rounded-xl overflow-hidden ${className}`}>
      <button
        onClick={handleToggle}
        className={`w-full flex items-center justify-between p-4 bg-card hover:bg-card/80 transition-colors ${headerClassName}`}
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-primary">{icon}</span>}
          <span className="font-medium text-foreground">{title}</span>
          {badge !== undefined && (
            <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full">
              {badge}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ height }}
      >
        <div className={`p-4 border-t border-border ${contentClassName}`}>
          {children}
        </div>
      </div>
    </div>
  );
}

// Accordion - only one section open at a time
interface AccordionProps {
  sections: {
    id: string;
    title: string;
    icon?: ReactNode;
    badge?: string | number;
    content: ReactNode;
  }[];
  defaultOpenId?: string;
  className?: string;
}

export function Accordion({ sections, defaultOpenId, className = '' }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId || null);

  return (
    <div className={`space-y-2 ${className}`}>
      {sections.map((section) => (
        <CollapsibleSection
          key={section.id}
          title={section.title}
          icon={section.icon}
          badge={section.badge}
          defaultOpen={section.id === openId}
          onToggle={(isOpen) => {
            if (isOpen) {
              setOpenId(section.id);
            } else if (openId === section.id) {
              setOpenId(null);
            }
          }}
        >
          {section.content}
        </CollapsibleSection>
      ))}
    </div>
  );
}

// Expandable card with preview
interface ExpandableCardProps {
  title: string;
  preview: ReactNode;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function ExpandableCard({
  title,
  preview,
  children,
  icon,
  className = '',
}: ExpandableCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`bg-card border border-border rounded-xl overflow-hidden ${className}`}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {icon && <span className="text-primary">{icon}</span>}
            <h3 className="font-medium text-foreground">{title}</h3>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </button>
        </div>
        
        {/* Preview content */}
        <div className={isExpanded ? 'hidden' : 'block'}>
          {preview}
        </div>
        
        {/* Full content */}
        <div
          className={`transition-all duration-300 ${
            isExpanded ? 'opacity-100 max-h-[1000px]' : 'opacity-0 max-h-0 overflow-hidden'
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

// Collapsible sidebar section
interface SidebarSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function SidebarSection({
  title,
  children,
  defaultOpen = true,
  className = '',
}: SidebarSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={className}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
      >
        {title}
        <ChevronRight
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? 'rotate-90' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {children}
      </div>
    </div>
  );
}

// Details/Summary style collapsible
interface DetailsProps {
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function Details({
  summary,
  children,
  defaultOpen = false,
  className = '',
}: DetailsProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={className}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronRight
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? 'rotate-90' : ''
          }`}
        />
        {summary}
      </button>
      <div
        className={`ml-6 mt-2 overflow-hidden transition-all duration-200 ${
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {children}
      </div>
    </div>
  );
}
