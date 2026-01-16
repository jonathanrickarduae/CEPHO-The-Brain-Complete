import { useLocation } from 'wouter';
import { 
  LayoutDashboard, 
  Sun, 
  Users, 
  Fingerprint, 
  FolderKanban,
  MoreHorizontal 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

const TABS: TabItem[] = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'brief', label: 'Signal', icon: Sun, path: '/daily-brief' },
  { id: 'experts', label: 'AI SMEs', icon: Users, path: '/ai-experts' },
  { id: 'twin', label: 'Chief of Staff', icon: Fingerprint, path: '/digital-twin' },
  { id: 'more', label: 'More', icon: MoreHorizontal, path: '' },
];

interface BottomTabBarProps {
  onMorePress?: () => void;
  className?: string;
}

export function BottomTabBar({ onMorePress, className }: BottomTabBarProps) {
  const [location, setLocation] = useLocation();

  const isActive = (path: string) => {
    if (!path) return false;
    return location === path || location.startsWith(path + '/');
  };

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 md:hidden',
        'flex items-center justify-around',
        'h-16 bg-card/95 backdrop-blur-xl border-t border-white/10',
        className
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
    >
      {TABS.map((tab) => {
        const active = isActive(tab.path);
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.id === 'more') {
                onMorePress?.();
              } else {
                setLocation(tab.path);
              }
            }}
            className={cn(
              'flex flex-col items-center justify-center gap-1 py-2 px-3 min-w-[64px]',
              'transition-colors duration-200',
              active ? 'text-primary' : 'text-muted-foreground'
            )}
            aria-label={tab.label}
            aria-current={active ? 'page' : undefined}
          >
            <Icon className={cn('w-5 h-5', active && 'drop-shadow-[0_0_8px_var(--color-primary)]')} />
            <span className="text-[10px] font-medium">{tab.label}</span>
            {active && (
              <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
            )}
          </button>
        );
      })}
    </nav>
  );
}

// More menu sheet for additional navigation options
export function MoreMenuSheet({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [, setLocation] = useLocation();

  const moreItems = [
    { label: 'Workflow', path: '/workflow', icon: FolderKanban },
    { label: 'Library', path: '/library', icon: FolderKanban },
    { label: 'The Vault', path: '/vault', icon: FolderKanban },
    { label: 'Evening Review', path: '/evening-review', icon: Sun },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-16 left-0 right-0 z-50 bg-card border-t border-white/10 rounded-t-2xl p-4 md:hidden animate-in slide-in-from-bottom duration-200">
        <div className="w-12 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-4" />
        
        <div className="grid grid-cols-4 gap-4">
          {moreItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                setLocation(item.path);
                onClose();
              }}
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-secondary/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center">
                <item.icon className="w-6 h-6 text-muted-foreground" />
              </div>
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
