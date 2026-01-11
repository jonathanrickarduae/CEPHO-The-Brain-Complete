import BrainLayout from '@/components/BrainLayout';
import { AIPodcastHub } from '@/components/AIPodcastHub';

export default function PodcastPage() {
  return (
    <BrainLayout>
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <AIPodcastHub />
      </div>
    </BrainLayout>
  );
}
