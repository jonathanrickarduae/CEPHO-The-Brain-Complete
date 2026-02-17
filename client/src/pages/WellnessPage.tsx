import BrainLayout from '@/components/ai-agents/BrainLayout';
import { PersonalWellnessDashboard } from '@/components/mood-tracking/PersonalWellness';

export default function WellnessPage() {
  return (
    
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <PersonalWellnessDashboard />
      </div>
    
  );
}
