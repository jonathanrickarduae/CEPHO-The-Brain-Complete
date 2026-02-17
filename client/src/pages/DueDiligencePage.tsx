import { DueDiligenceWizard } from '@/components/DueDiligenceWizard';

export default function DueDiligencePage() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-fuchsia-500 bg-clip-text text-transparent">
            Due Diligence
          </h1>
          <p className="text-foreground/70 mt-1">
            Comprehensive M&A analysis powered by AI-SMEs
          </p>
        </div>
        
        <DueDiligenceWizard />
      </div>
    </div>
  );
}
