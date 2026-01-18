import { useState, createContext, useContext, useCallback } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  icon?: React.ReactNode;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise((resolve) => {
      setResolveRef(() => resolve);
    });
  }, []);

  const handleConfirm = () => {
    setIsOpen(false);
    resolveRef?.(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    resolveRef?.(false);
  };

  const typeStyles = {
    danger: {
      icon: <Trash2 className="w-6 h-6 text-red-400" />,
      iconBg: 'bg-red-500/10',
      button: 'bg-red-500 hover:bg-red-600 text-white',
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6 text-amber-400" />,
      iconBg: 'bg-amber-500/10',
      button: 'bg-amber-500 hover:bg-amber-600 text-white',
    },
    info: {
      icon: <AlertTriangle className="w-6 h-6 text-cyan-400" />,
      iconBg: 'bg-cyan-500/10',
      button: 'bg-cyan-500 hover:bg-cyan-600 text-white',
    },
  };

  const currentType = options?.type || 'danger';
  const styles = typeStyles[currentType];

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleCancel}
          />
          
          {/* Dialog */}
          <div className="relative bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
            {/* Close button */}
            <button
              onClick={handleCancel}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 text-foreground/70" />
            </button>
            
            <div className="p-6">
              {/* Icon */}
              <div className={cn('w-12 h-12 rounded-full flex items-center justify-center mb-4', styles.iconBg)}>
                {options?.icon || styles.icon}
              </div>
              
              {/* Content */}
              <h3 className="text-lg font-semibold text-white mb-2">
                {options?.title}
              </h3>
              <p className="text-foreground/70 text-sm mb-6">
                {options?.message}
              </p>
              
              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCancel}
                >
                  {options?.cancelText || 'Cancel'}
                </Button>
                <Button
                  className={cn('flex-1', styles.button)}
                  onClick={handleConfirm}
                >
                  {options?.confirmText || 'Confirm'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
