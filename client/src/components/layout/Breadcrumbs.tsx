import { useLocation, Link } from 'wouter';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

// Route to breadcrumb mapping
const ROUTE_LABELS: Record<string, string> = {
  '/dashboard': 'The Nexus',
  '/daily-brief': 'The Signal',
  '/ai-experts': 'AI-SMEs',
  '/digital-twin': 'Chief of Staff',
  '/workflow': 'Workflow',
  '/library': 'Library',
  '/vault': 'The Vault',
  '/evening-review': 'Evening Review',
  '/statistics': 'Statistics',
  '/persephone': 'Persephone Board',
};

export function Breadcrumbs({ items, className, showHome = true }: BreadcrumbsProps) {
  const [location] = useLocation();

  // Auto-generate breadcrumbs from current path if not provided
  const breadcrumbs: BreadcrumbItem[] = items || (() => {
    const segments = location.split('/').filter(Boolean);
    const result: BreadcrumbItem[] = [];
    
    let currentPath = '';
    for (const segment of segments) {
      currentPath += `/${segment}`;
      const label = ROUTE_LABELS[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      result.push({ label, path: currentPath });
    }
    
    return result;
  })();

  if (breadcrumbs.length === 0 && !showHome) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center gap-1.5 text-sm', className)}
    >
      {showHome && (
        <>
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="w-4 h-4" />
            <span className="sr-only md:not-sr-only">Home</span>
          </Link>
          {breadcrumbs.length > 0 && (
            <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
          )}
        </>
      )}

      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;

        return (
          <div key={item.path || index} className="flex items-center gap-1.5">
            {isLast ? (
              <span className="text-foreground font-medium" aria-current="page">
                {item.label}
              </span>
            ) : (
              <>
                <Link
                  href={item.path || '#'}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
              </>
            )}
          </div>
        );
      })}
    </nav>
  );
}

// Page header with breadcrumbs
export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  className,
}: {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-6', className)}>
      <Breadcrumbs items={breadcrumbs} className="mb-3" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
