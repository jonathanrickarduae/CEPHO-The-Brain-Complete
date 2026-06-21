import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { ChevronLeft, ChevronRight, Check, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  text: string;
  type: "scale" | "boolean";
  section: string;
  scaleLabels?: { low: string; high: string };
}

const SECTIONS = [
  { id: 1, name: "Leadership & Vision", questions: 10 },
  { id: 2, name: "Risk & Decision Making", questions: 10 },
  { id: 3, name: "Team & Culture", questions: 10 },
  { id: 4, name: "Communication Style", questions: 10 },
  { id: 5, name: "Financial Philosophy", questions: 10 },
  { id: 6, name: "Business Operations", questions: 20 },
  { id: 7, name: "Innovation & Technology", questions: 20 },
  { id: 8, name: "Market & Competition", questions: 20 },
  { id: 9, name: "Personal Productivity", questions: 20 },
  { id: 10, name: "Strategic Thinking", questions: 20 },
];

// Sample questions for Section 6 (can be expanded)
const QUESTIONS: Question[] = [
  // Section 6: Business Operations
  { id: "A51", text: "I prefer to move fast and fix problems later rather than plan extensively", type: "scale", section: "Business Operations", scaleLabels: { low: "Plan extensively", high: "Move fast" } },
  { id: "A52", text: "I believe in measuring everything vs. trusting intuition for operations", type: "scale", section: "Business Operations", scaleLabels: { low: "Trust intuition", high: "Measure everything" } },
  { id: "A53", text: "I prefer standardized processes over flexible, situational approaches", type: "scale", section: "Business Operations", scaleLabels: { low: "Flexible", high: "Standardized" } },
  { id: "A54", text: "I am comfortable with technical debt if it means faster delivery", type: "scale", section: "Business Operations", scaleLabels: { low: "No debt", high: "Accept debt" } },
  { id: "A55", text: "I prioritize customer acquisition over customer retention", type: "scale", section: "Business Operations", scaleLabels: { low: "Retention", high: "Acquisition" } },
  { id: "A56", text: "I believe in outsourcing non-core functions vs. building in-house", type: "scale", section: "Business Operations", scaleLabels: { low: "In-house", high: "Outsource" } },
  { id: "A57", text: "I prefer to over-resource projects to ensure success vs. lean operations", type: "scale", section: "Business Operations", scaleLabels: { low: "Lean", high: "Over-resource" } },
  { id: "A58", text: "I am comfortable with ambiguity in project scope", type: "scale", section: "Business Operations", scaleLabels: { low: "Need clarity", high: "Comfortable" } },
  { id: "A59", text: "I prefer agile/iterative development over waterfall/planned approaches", type: "scale", section: "Business Operations", scaleLabels: { low: "Waterfall", high: "Agile" } },
  { id: "A60", text: "I believe in automation over manual processes, even for complex tasks", type: "scale", section: "Business Operations", scaleLabels: { low: "Manual OK", high: "Automate all" } },
  { id: "B51", text: "Do you have a formal project management methodology?", type: "boolean", section: "Business Operations" },
  { id: "B52", text: "Do you prefer fixed budgets over flexible spending?", type: "boolean", section: "Business Operations" },
  { id: "B53", text: "Do you require regular financial reporting?", type: "boolean", section: "Business Operations" },
  { id: "B54", text: "Do you believe in having backup plans for critical operations?", type: "boolean", section: "Business Operations" },
  { id: "B55", text: "Do you prefer to build MVPs over fully-featured products?", type: "boolean", section: "Business Operations" },
  { id: "B56", text: "Do you track KPIs religiously?", type: "boolean", section: "Business Operations" },
  { id: "B57", text: "Do you believe in post-mortems after project failures?", type: "boolean", section: "Business Operations" },
  { id: "B58", text: "Do you prefer in-house legal/finance over outsourced?", type: "boolean", section: "Business Operations" },
  { id: "B59", text: "Do you have a formal vendor evaluation process?", type: "boolean", section: "Business Operations" },
  { id: "B60", text: "Do you believe in continuous improvement (kaizen)?", type: "boolean", section: "Business Operations" },
  
  // Section 7: Innovation & Technology
  { id: "A61", text: "I am an early adopter of new technologies", type: "scale", section: "Innovation & Technology", scaleLabels: { low: "Late adopter", high: "Early adopter" } },
  { id: "A62", text: "I believe AI will fundamentally transform my industry within 5 years", type: "scale", section: "Innovation & Technology", scaleLabels: { low: "Skeptical", high: "Strong believer" } },
  { id: "A63", text: "I prefer proven technologies over cutting-edge but risky solutions", type: "scale", section: "Innovation & Technology", scaleLabels: { low: "Cutting-edge", high: "Proven" } },
  { id: "A64", text: "I invest in R&D even when ROI is uncertain", type: "scale", section: "Innovation & Technology", scaleLabels: { low: "Need clear ROI", high: "Invest anyway" } },
  { id: "A65", text: "I believe in building proprietary technology vs. off-the-shelf", type: "scale", section: "Innovation & Technology", scaleLabels: { low: "Off-the-shelf", high: "Proprietary" } },
  { id: "A66", text: "I am comfortable with technology I don't fully understand if experts vouch for it", type: "scale", section: "Innovation & Technology", scaleLabels: { low: "Must understand", high: "Trust experts" } },
  { id: "A67", text: "I prioritize user experience over technical sophistication", type: "scale", section: "Innovation & Technology", scaleLabels: { low: "Technical", high: "UX first" } },
  { id: "A68", text: "I believe in open-source contributions vs. keeping IP proprietary", type: "scale", section: "Innovation & Technology", scaleLabels: { low: "Keep proprietary", high: "Open source" } },
  { id: "A69", text: "I prefer cloud-native solutions over on-premise control", type: "scale", section: "Innovation & Technology", scaleLabels: { low: "On-premise", high: "Cloud-native" } },
  { id: "A70", text: "I believe in data-driven decisions over experience-based judgment", type: "scale", section: "Innovation & Technology", scaleLabels: { low: "Experience", high: "Data-driven" } },
  { id: "B61", text: "Do you personally use AI tools in your daily work?", type: "boolean", section: "Innovation & Technology" },
  { id: "B62", text: "Do you have a technology roadmap for your businesses?", type: "boolean", section: "Innovation & Technology" },
  { id: "B63", text: "Do you believe in 'build vs. buy' for technology? (Yes = Build)", type: "boolean", section: "Innovation & Technology" },
  { id: "B64", text: "Do you have dedicated innovation budgets?", type: "boolean", section: "Innovation & Technology" },
  { id: "B65", text: "Do you believe blockchain/Web3 will be significant?", type: "boolean", section: "Innovation & Technology" },
  { id: "B66", text: "Do you prefer mobile-first over desktop-first?", type: "boolean", section: "Innovation & Technology" },
  { id: "B67", text: "Do you believe in API-first architecture?", type: "boolean", section: "Innovation & Technology" },
  { id: "B68", text: "Do you have a cybersecurity strategy?", type: "boolean", section: "Innovation & Technology" },
  { id: "B69", text: "Do you believe in technical co-founders for tech businesses?", type: "boolean", section: "Innovation & Technology" },
  { id: "B70", text: "Do you prefer to understand technology deeply vs. delegate?", type: "boolean", section: "Innovation & Technology" },
];

interface QuestionnaireProps {
  onComplete?: (responses: Record<string, number | boolean>) => void;
  initialResponses?: Record<string, number | boolean>;
}

export function DigitalTwinQuestionnaire({ onComplete, initialResponses = {} }: QuestionnaireProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, number | boolean>>(initialResponses);
  const [currentValue, setCurrentValue] = useState<number>(5);
  
  const currentQuestion = QUESTIONS[currentIndex];
  const progress = ((currentIndex + 1) / QUESTIONS.length) * 100;
  const totalAnswered = Object.keys(responses).length;
  const completionPercentage = Math.round((totalAnswered / 200) * 100);
  
  const handleScaleAnswer = (value: number) => {
    setCurrentValue(value);
  };
  
  const handleBooleanAnswer = (value: boolean) => {
    setResponses(prev => ({ ...prev, [currentQuestion.id]: value }));
    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentValue(5);
    }
  };
  
  const handleNext = () => {
    if (currentQuestion.type === "scale") {
      setResponses(prev => ({ ...prev, [currentQuestion.id]: currentValue }));
    }
    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentValue(responses[QUESTIONS[currentIndex + 1]?.id] as number || 5);
    } else {
      // Complete
      onComplete?.(responses);
    }
  };
  
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setCurrentValue(responses[QUESTIONS[currentIndex - 1]?.id] as number || 5);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Chief of Staff Questionnaire</h1>
            <p className="text-muted-foreground">Help your Chief of Staff think like you</p>
          </div>
        </div>
        
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Question {currentIndex + 1} of {QUESTIONS.length}</span>
            <span className="text-fuchsia-400">{completionPercentage}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>
      
      {/* Section indicator */}
      <div className="mb-4">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          {currentQuestion.section}
        </span>
      </div>
      
      {/* Question Card */}
      <Card className="mb-6 border-fuchsia-500/20">
        <CardHeader>
          <CardTitle className="text-lg font-medium leading-relaxed">
            {currentQuestion.text}
          </CardTitle>
          {currentQuestion.type === "scale" && currentQuestion.scaleLabels && (
            <CardDescription>
              Rate from 1 ({currentQuestion.scaleLabels.low}) to 10 ({currentQuestion.scaleLabels.high})
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {currentQuestion.type === "scale" ? (
            <div className="space-y-6">
              <Slider
                value={[currentValue]}
                onValueChange={(v) => handleScaleAnswer(v[0])}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{currentQuestion.scaleLabels?.low}</span>
                <span className="text-2xl font-bold text-fuchsia-400">{currentValue}</span>
                <span>{currentQuestion.scaleLabels?.high}</span>
              </div>
            </div>
          ) : (
            <div className="flex gap-4">
              <Button
                variant={responses[currentQuestion.id] === true ? "default" : "outline"}
                className={cn(
                  "flex-1 h-16 text-lg",
                  responses[currentQuestion.id] === true && "bg-fuchsia-600 hover:bg-fuchsia-700"
                )}
                onClick={() => handleBooleanAnswer(true)}
              >
                Yes
              </Button>
              <Button
                variant={responses[currentQuestion.id] === false ? "default" : "outline"}
                className={cn(
                  "flex-1 h-16 text-lg",
                  responses[currentQuestion.id] === false && "bg-fuchsia-600 hover:bg-fuchsia-700"
                )}
                onClick={() => handleBooleanAnswer(false)}
              >
                No
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        
        {currentQuestion.type === "scale" && (
          <Button
            onClick={handleNext}
            className="bg-fuchsia-600 hover:bg-fuchsia-700"
          >
            {currentIndex === QUESTIONS.length - 1 ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Complete
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        )}
      </div>
      
      {/* COS Understanding indicator */}
      <div className="mt-8 p-4 rounded-lg bg-gradient-to-r from-fuchsia-500/10 to-purple-500/10 border border-fuchsia-500/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">COS Understanding Level</p>
            <p className="text-xs text-muted-foreground">Based on questionnaire completion</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-fuchsia-400">{completionPercentage}/100</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DigitalTwinQuestionnaire;
