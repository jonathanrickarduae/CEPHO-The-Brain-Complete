import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, BookOpen } from "lucide-react";

interface TrainingModule {
  id: number;
  name: string;
  description: string;
  level: number;
  duration: string;
  completed: boolean;
  icon: any;
}

interface TrainingModalProps {
  module: TrainingModule | undefined;
  onComplete: () => void;
  onClose: () => void;
}

export function TrainingModal({ module, onComplete, onClose }: TrainingModalProps) {
  if (!module) return null;

  return (
    <Dialog open={!!module} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="h-5 w-5 text-primary" />
            {module.name}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-4 mt-2">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {module.duration}
            </span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
              Level {module.level}
            </span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6 space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <h3 className="font-medium mb-2">Module Overview</h3>
            <p className="text-sm text-muted-foreground">{module.description}</p>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium">Training Content</h3>
            <div className="bg-background rounded-lg p-4 border border-border space-y-3">
              <p className="text-sm">
                This training module covers essential concepts and practices for <strong>{module.name}</strong>.
              </p>
              <p className="text-sm text-muted-foreground">
                Complete this module to enhance your Chief of Staff's capabilities and improve assessment accuracy.
              </p>
              
              <div className="mt-4 p-3 bg-primary/5 rounded border border-primary/20">
                <p className="text-xs text-muted-foreground">
                  <strong>Note:</strong> Detailed training content, interactive exercises, and assessments will be available in the next update. 
                  For now, you can mark this module as complete to track your progress.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm mb-1">Completion Requirements</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Review all module content</li>
                  <li>• Understand key concepts and workflows</li>
                  <li>• Ready to apply knowledge in practice</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onComplete} className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Mark as Complete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
