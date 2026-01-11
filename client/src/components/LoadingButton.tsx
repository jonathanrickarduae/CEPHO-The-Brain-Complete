import { forwardRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ loading, loadingText, children, disabled, className, variant, size, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        disabled={disabled || loading}
        className={cn(
          'relative transition-all',
          loading && 'cursor-wait',
          className
        )}
        {...props}
      >
        {loading && (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        )}
        <span className={cn(loading && loadingText && 'opacity-0')}>
          {children}
        </span>
        {loading && loadingText && (
          <span className="absolute inset-0 flex items-center justify-center">
            {loadingText}
          </span>
        )}
      </Button>
    );
  }
);

LoadingButton.displayName = 'LoadingButton';

// Icon button with loading state
interface LoadingIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  icon: React.ReactNode;
  loadingIcon?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const LoadingIconButton = forwardRef<HTMLButtonElement, LoadingIconButtonProps>(
  ({ loading, icon, loadingIcon, disabled, className, variant, size, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        size={size || 'icon'}
        variant={variant}
        disabled={disabled || loading}
        className={cn(
          'relative transition-all',
          loading && 'cursor-wait',
          className
        )}
        {...props}
      >
        {loading ? (
          loadingIcon || <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          icon
        )}
      </Button>
    );
  }
);

LoadingIconButton.displayName = 'LoadingIconButton';

// Async button that handles loading state automatically
interface AsyncButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick: () => Promise<void>;
  loadingText?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function AsyncButton({ onClick, loadingText, children, variant, size, ...props }: AsyncButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onClick();
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoadingButton
      loading={loading}
      loadingText={loadingText}
      onClick={handleClick}
      variant={variant}
      size={size}
      {...props}
    >
      {children}
    </LoadingButton>
  );
}
