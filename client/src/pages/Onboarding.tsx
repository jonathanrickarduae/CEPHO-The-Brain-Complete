// @ts-nocheck
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Brain,
  Rocket,
  Target,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Mic,
  Zap,
} from "lucide-react";

const STEPS = [
  {
    id: 1,
    title: "Welcome to CEPHO.AI",
    subtitle: "Your Autonomous AI Chief of Staff",
    description:
      "CEPHO.AI is a fully autonomous executive intelligence platform. Before we begin, let's calibrate your Digital Twin so every agent understands exactly how you think, lead, and make decisions.",
    icon: Brain,
  },
  {
    id: 2,
    title: "Your Executive Profile",
    subtitle: "Tell us about your role",
    description: "This helps your AI Chief of Staff understand your context.",
    icon: Target,
    fields: [
      { key: "role", label: "Your Title / Role", placeholder: "e.g. CEO, Founder, Managing Director" },
      { key: "company", label: "Company / Organisation", placeholder: "e.g. Acme Corp" },
      { key: "industry", label: "Industry", placeholder: "e.g. Technology, Finance, Healthcare" },
      { key: "teamSize", label: "Team Size", placeholder: "e.g. 10, 50, 200+" },
    ],
  },
  {
    id: 3,
    title: "Your Leadership Style",
    subtitle: "Calibrate your Digital Twin",
    description: "Your Digital Twin learns how you think and make decisions. Answer these questions honestly.",
    icon: Brain,
    questions: [
      {
        key: "decisionStyle",
        question: "How do you prefer to make decisions?",
        options: ["Data-driven — I need the numbers", "Intuition-led — I trust my gut", "Collaborative — I consult my team", "Hybrid — depends on the situation"],
      },
      {
        key: "communicationStyle",
        question: "How do you prefer to communicate?",
        options: ["Direct and concise", "Detailed and thorough", "Visual and structured", "Conversational and informal"],
      },
      {
        key: "priorityFocus",
        question: "What is your primary focus right now?",
        options: ["Growth and revenue", "Operational efficiency", "Team and culture", "Innovation and product"],
      },
    ],
  },
  {
    id: 4,
    title: "Connect Your Tools",
    subtitle: "Integrate your existing workflow",
    description: "Connect your tools to give CEPHO.AI full context. You can skip this and connect later in Settings.",
    icon: Zap,
    integrations: [
      { key: "notion", label: "Notion", description: "Sync your notes and documents" },
      { key: "trello", label: "Trello", description: "Import your project boards" },
      { key: "todoist", label: "Todoist", description: "Sync your task lists" },
      { key: "zoom", label: "Zoom", description: "Meeting intelligence and summaries" },
    ],
  },
  {
    id: 5,
    title: "You're All Set",
    subtitle: "CEPHO.AI is ready",
    description:
      "Your Digital Twin has been calibrated and your AI Chief of Staff is ready to work. Your first morning briefing will arrive at 06:00 tomorrow.",
    icon: CheckCircle2,
  },
];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

  const calibrateMutation = trpc.digitalTwin.calibrate.useMutation({
    onError: () => {
      // Non-blocking — continue even if calibration fails
    },
  });

  const completeOnboardingMutation = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      setLocation("/nexus");
    },
    onError: () => {
      setLocation("/nexus");
    },
  });

  const step = STEPS[currentStep - 1];
  const totalSteps = STEPS.length;
  const isFirst = currentStep === 1;
  const isLast = currentStep === totalSteps;

  const handleNext = async () => {
    if (isLast) {
      // Submit Digital Twin calibration
      if (Object.keys(selectedAnswers).length > 0) {
        calibrateMutation.mutate({
          responses: Object.entries(selectedAnswers).map(([key, value]) => ({
            questionId: key,
            answer: value,
          })),
        });
      }
      // Mark onboarding complete
      completeOnboardingMutation.mutate({ onboardingComplete: true });
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (!isFirst) setCurrentStep(prev => prev - 1);
  };

  const handleSkip = () => {
    setLocation("/nexus");
  };

  const Icon = step.icon;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </span>
            <button
              onClick={handleSkip}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip setup
            </button>
          </div>
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Icon className="w-8 h-8 text-primary" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">{step.title}</h1>
            <p className="text-sm font-medium text-primary mb-3">{step.subtitle}</p>
            <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
          </div>

          {/* Step 2: Profile Fields */}
          {step.fields && (
            <div className="space-y-4 mb-8">
              {step.fields.map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    value={formData[field.key] ?? ""}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, [field.key]: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Step 3: Leadership Questions */}
          {step.questions && (
            <div className="space-y-6 mb-8">
              {step.questions.map(q => (
                <div key={q.key}>
                  <p className="text-sm font-medium text-foreground mb-3">{q.question}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map(option => (
                      <button
                        key={option}
                        onClick={() =>
                          setSelectedAnswers(prev => ({ ...prev, [q.key]: option }))
                        }
                        className={`px-4 py-3 rounded-xl border-2 text-sm text-left transition-all ${
                          selectedAnswers[q.key] === option
                            ? "border-primary bg-primary/20 text-foreground"
                            : "border-border bg-background text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 4: Integrations */}
          {step.integrations && (
            <div className="space-y-3 mb-8">
              {step.integrations.map(integration => (
                <div
                  key={integration.key}
                  className="flex items-center justify-between p-4 rounded-xl border border-border bg-background"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{integration.label}</p>
                    <p className="text-xs text-muted-foreground">{integration.description}</p>
                  </div>
                  <button
                    onClick={() => setLocation("/settings")}
                    className="text-xs text-primary hover:underline"
                  >
                    Connect
                  </button>
                </div>
              ))}
              <p className="text-xs text-muted-foreground text-center mt-2">
                You can connect integrations at any time in Settings.
              </p>
            </div>
          )}

          {/* Step 5: Final — show what's ready */}
          {currentStep === totalSteps && (
            <div className="space-y-3 mb-8">
              {[
                { icon: Brain, label: "Digital Twin calibrated" },
                { icon: Rocket, label: "AI Chief of Staff activated" },
                { icon: Mic, label: "Voice interface ready (Space bar)" },
                { icon: Target, label: "Morning briefing scheduled for 06:00" },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20">
                  <item.icon className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground">{item.label}</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto flex-shrink-0" />
                </div>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={isFirst}
              className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-0"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <button
              onClick={handleNext}
              disabled={completeOnboardingMutation.isPending}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {isLast ? "Enter CEPHO.AI" : "Continue"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
