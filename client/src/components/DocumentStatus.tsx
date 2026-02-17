import { Badge } from '@/components/ui/badge';
import { 
  FileEdit, 
  Eye, 
  CheckCircle2, 
  Archive,
  AlertCircle,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type DocumentStatusType = 'draft' | 'in_review' | 'approved' | 'needs_update' | 'superseded';

interface DocumentStatusProps {
  status: DocumentStatusType;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<DocumentStatusType, {
  label: string;
  icon: typeof FileEdit;
  className: string;
  description: string;
}> = {
  draft: {
    label: 'Draft',
    icon: FileEdit,
    className: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    description: 'Document is being worked on'
  },
  in_review: {
    label: 'In Review',
    icon: Eye,
    className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    description: 'Document is under review'
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle2,
    className: 'bg-green-500/20 text-green-400 border-green-500/30',
    description: 'Document has been approved'
  },
  needs_update: {
    label: 'Needs Update',
    icon: AlertCircle,
    className: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    description: 'Document requires updates'
  },
  superseded: {
    label: 'Superseded',
    icon: Archive,
    className: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    description: 'Document has been replaced by a newer version'
  }
};

export function DocumentStatus({ status, size = 'md', showIcon = true, className }: DocumentStatusProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(config.className, sizeClasses[size], 'font-medium', className)}
      title={config.description}
    >
      {showIcon && <Icon className={cn(iconSizes[size], 'mr-1.5')} />}
      {config.label}
    </Badge>
  );
}

// Status selector for changing document status
interface DocumentStatusSelectorProps {
  currentStatus: DocumentStatusType;
  onStatusChange: (status: DocumentStatusType) => void;
  disabled?: boolean;
}

export function DocumentStatusSelector({ currentStatus, onStatusChange, disabled }: DocumentStatusSelectorProps) {
  const statuses: DocumentStatusType[] = ['draft', 'in_review', 'approved', 'needs_update', 'superseded'];
  
  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map(status => {
        const config = statusConfig[status];
        const Icon = config.icon;
        const isSelected = status === currentStatus;
        
        return (
          <button
            key={status}
            onClick={() => onStatusChange(status)}
            disabled={disabled}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all',
              'text-sm font-medium',
              isSelected 
                ? config.className + ' ring-2 ring-offset-2 ring-offset-gray-900'
                : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Icon className="w-4 h-4" />
            {config.label}
          </button>
        );
      })}
    </div>
  );
}

// Workflow indicator showing document progression
interface DocumentWorkflowProps {
  currentStatus: DocumentStatusType;
  className?: string;
}

export function DocumentWorkflow({ currentStatus, className }: DocumentWorkflowProps) {
  const workflow: DocumentStatusType[] = ['draft', 'in_review', 'approved'];
  const currentIndex = workflow.indexOf(currentStatus);
  
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {workflow.map((status, index) => {
        const config = statusConfig[status];
        const Icon = config.icon;
        const isCompleted = index < currentIndex;
        const isCurrent = status === currentStatus;
        
        return (
          <div key={status} className="flex items-center">
            <div className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border',
              isCompleted && 'bg-green-500/20 border-green-500/30 text-green-400',
              isCurrent && config.className,
              !isCompleted && !isCurrent && 'bg-gray-800/50 border-gray-700 text-gray-500'
            )}>
              {isCompleted ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Icon className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">{config.label}</span>
            </div>
            {index < workflow.length - 1 && (
              <div className={cn(
                'w-8 h-0.5 mx-1',
                index < currentIndex ? 'bg-green-500' : 'bg-gray-700'
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default DocumentStatus;
