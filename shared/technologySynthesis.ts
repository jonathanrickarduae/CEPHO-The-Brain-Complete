/**
 * Technology Synthesis Framework
 * 
 * Core USP: The art of business is pulling 2-5 existing things together
 * that no one else is looking at to solve a problem.
 * 
 * Benefits over pure R&D:
 * - Lower cost (using existing tech)
 * - Faster to market (not building from scratch)
 * - Higher success rate (proven components)
 * - The innovation is in the COMBINATION, not the invention
 */

// =============================================================================
// TYPES
// =============================================================================

export interface Technology {
  id: string;
  name: string;
  category: TechnologyCategory;
  maturityLevel: MaturityLevel;
  description: string;
  capabilities: string[];
  limitations: string[];
  costRange: CostRange;
  timeToImplement: string;
  providers: string[];
  patents?: string[];
  openSource: boolean;
}

export type TechnologyCategory =
  | "hardware"
  | "software"
  | "ai_ml"
  | "iot"
  | "biotech"
  | "materials"
  | "energy"
  | "communications"
  | "sensors"
  | "robotics"
  | "blockchain"
  | "ar_vr"
  | "cloud"
  | "data";

export type MaturityLevel =
  | "emerging"      // Early stage, high risk
  | "developing"    // Growing adoption
  | "mature"        // Widely adopted
  | "declining";    // Being replaced

export type CostRange =
  | "low"           // < $10k
  | "medium"        // $10k - $100k
  | "high"          // $100k - $1M
  | "very_high";    // > $1M

export interface Problem {
  id: string;
  title: string;
  description: string;
  targetMarket: string;
  painPoints: string[];
  currentSolutions: string[];
  gaps: string[];
  marketSize?: string;
  urgency: "low" | "medium" | "high" | "critical";
}

export interface SynthesisOpportunity {
  id: string;
  title: string;
  description: string;
  
  // The combination
  technologies: Technology[];
  problem: Problem;
  
  // How they combine
  synthesisApproach: string;
  noveltyFactor: string; // What makes this combination unique
  
  // Feasibility
  technicalFeasibility: number; // 0-100
  marketFeasibility: number; // 0-100
  financialFeasibility: number; // 0-100
  overallScore: number; // 0-100
  
  // Implementation
  estimatedCost: CostRange;
  timeToMarket: string;
  keyRisks: string[];
  requiredPartnerships: string[];
  
  // Validation
  smeValidation?: SMEValidation;
  cosValidation?: COSValidation;
}

export interface SMEValidation {
  validatedBy: string[];
  validationDate: Date;
  technicalScore: number;
  marketScore: number;
  feasibilityScore: number;
  feedback: string[];
  recommendations: string[];
  approved: boolean;
}

export interface COSValidation {
  validationDate: Date;
  alignsWithUserThinking: boolean;
  alignsWithUserPriorities: boolean;
  qualityStandardsMet: boolean;
  feedback: string;
  approved: boolean;
}

// =============================================================================
// FRAMEWORK COMPONENTS
// =============================================================================

/**
 * Technology Scanner
 * Scans and catalogs existing technologies
 */
export interface TechnologyScanner {
  // Scan for technologies in a category
  scanCategory(category: TechnologyCategory): Promise<Technology[]>;
  
  // Search for technologies matching criteria
  searchTechnologies(query: string): Promise<Technology[]>;
  
  // Get emerging technologies
  getEmergingTechnologies(): Promise<Technology[]>;
  
  // Track technology trends
  getTechnologyTrends(): Promise<TechnologyTrend[]>;
}

export interface TechnologyTrend {
  technology: Technology;
  trendDirection: "rising" | "stable" | "declining";
  adoptionRate: number;
  investmentLevel: string;
  keyDevelopments: string[];
}

/**
 * Problem Mapper
 * Maps problems in target markets
 */
export interface ProblemMapper {
  // Identify problems in a market
  mapProblems(market: string): Promise<Problem[]>;
  
  // Find unsolved problems
  findUnsolvedProblems(): Promise<Problem[]>;
  
  // Analyze problem gaps
  analyzeGaps(problem: Problem): Promise<string[]>;
  
  // Prioritize problems by opportunity
  prioritizeProblems(problems: Problem[]): Promise<Problem[]>;
}

/**
 * Synthesis Engine
 * The core innovation engine that finds combinations
 */
export interface SynthesisEngine {
  // Find potential combinations for a problem
  findCombinations(problem: Problem): Promise<SynthesisOpportunity[]>;
  
  // Evaluate a specific combination
  evaluateCombination(
    technologies: Technology[],
    problem: Problem
  ): Promise<SynthesisOpportunity>;
  
  // Generate novel combinations
  generateNovelCombinations(
    technologies: Technology[],
    count: number
  ): Promise<SynthesisOpportunity[]>;
  
  // Score a synthesis opportunity
  scoreOpportunity(opportunity: SynthesisOpportunity): Promise<number>;
}

/**
 * Gap Identifier
 * Finds where no one is looking
 */
export interface GapIdentifier {
  // Find technology gaps
  findTechnologyGaps(): Promise<TechnologyGap[]>;
  
  // Find market gaps
  findMarketGaps(): Promise<MarketGap[]>;
  
  // Find combination gaps (unexplored combinations)
  findCombinationGaps(): Promise<CombinationGap[]>;
  
  // Analyze competitive blind spots
  analyzeBlindSpots(market: string): Promise<string[]>;
}

export interface TechnologyGap {
  description: string;
  relatedTechnologies: Technology[];
  potentialSolutions: string[];
  opportunityScore: number;
}

export interface MarketGap {
  market: string;
  gap: string;
  currentPlayers: string[];
  entryBarriers: string[];
  opportunityScore: number;
}

export interface CombinationGap {
  technologies: Technology[];
  whyUnexplored: string;
  potentialApplications: string[];
  opportunityScore: number;
}

// =============================================================================
// EXAMPLE: DEMENTIA GLASSES SYNTHESIS
// =============================================================================

export const DEMENTIA_GLASSES_EXAMPLE: SynthesisOpportunity = {
  id: "dementia-glasses-001",
  title: "Smart Safety Glasses for Dementia Care",
  description: "AR glasses that help dementia patients stay safe and remind them of names and faces",
  
  technologies: [
    {
      id: "ar-glasses",
      name: "AR Glasses",
      category: "ar_vr",
      maturityLevel: "developing",
      description: "Lightweight augmented reality glasses",
      capabilities: ["Display overlay", "Camera input", "Audio output"],
      limitations: ["Battery life", "Weight", "Cost"],
      costRange: "medium",
      timeToImplement: "6-12 months",
      providers: ["Meta", "Apple", "Google", "Vuzix"],
      openSource: false,
    },
    {
      id: "facial-recognition",
      name: "Facial Recognition AI",
      category: "ai_ml",
      maturityLevel: "mature",
      description: "AI-powered face detection and recognition",
      capabilities: ["Face detection", "Identity matching", "Emotion detection"],
      limitations: ["Privacy concerns", "Accuracy varies", "Lighting dependent"],
      costRange: "low",
      timeToImplement: "1-3 months",
      providers: ["AWS Rekognition", "Azure Face", "Google Cloud Vision"],
      openSource: true,
    },
    {
      id: "gps-tracking",
      name: "GPS Location Tracking",
      category: "iot",
      maturityLevel: "mature",
      description: "Real-time location tracking and geofencing",
      capabilities: ["Location tracking", "Geofencing", "Route history"],
      limitations: ["Indoor accuracy", "Battery drain"],
      costRange: "low",
      timeToImplement: "1 month",
      providers: ["Multiple"],
      openSource: true,
    },
    {
      id: "voice-assistant",
      name: "Voice Assistant / TTS",
      category: "ai_ml",
      maturityLevel: "mature",
      description: "Text-to-speech and voice interaction",
      capabilities: ["Speech synthesis", "Voice commands", "Contextual responses"],
      limitations: ["Accent handling", "Noise environments"],
      costRange: "low",
      timeToImplement: "1-2 months",
      providers: ["ElevenLabs", "AWS Polly", "Google TTS"],
      openSource: true,
    },
  ],
  
  problem: {
    id: "dementia-safety",
    title: "Dementia Patient Safety and Recognition",
    description: "Dementia patients struggle to recognize family members and can become lost or disoriented",
    targetMarket: "Healthcare / Elderly Care",
    painPoints: [
      "Patients forget names and faces of loved ones",
      "Patients wander and get lost",
      "Caregivers cannot monitor constantly",
      "Anxiety from not recognizing surroundings",
    ],
    currentSolutions: [
      "GPS trackers (wristbands)",
      "Photo albums",
      "Caregiver supervision",
    ],
    gaps: [
      "No real-time name prompting",
      "No integrated solution",
      "Stigmatizing devices",
    ],
    marketSize: "$50B+ elderly care market",
    urgency: "high",
  },
  
  synthesisApproach: "Combine AR glasses with facial recognition to display names when the patient looks at someone. Add GPS for safety tracking and voice prompts for gentle reminders. Package in a normal-looking glasses form factor to reduce stigma.",
  
  noveltyFactor: "No one has combined these four mature technologies specifically for dementia care in a glasses form factor. Current solutions are fragmented (separate tracker, separate photos, etc.)",
  
  technicalFeasibility: 75,
  marketFeasibility: 85,
  financialFeasibility: 70,
  overallScore: 77,
  
  estimatedCost: "medium",
  timeToMarket: "12-18 months",
  
  keyRisks: [
    "User acceptance (will patients wear them?)",
    "Battery life for all-day use",
    "Accuracy of facial recognition",
    "Regulatory approval for medical device",
  ],
  
  requiredPartnerships: [
    "AR glasses manufacturer",
    "Healthcare/elderly care providers",
    "Dementia research organizations",
    "Insurance companies",
  ],
};

// =============================================================================
// SME VALIDATION PROMPTS
// =============================================================================

export const SME_VALIDATION_PROMPTS = {
  innovation: `As the Innovation SME, evaluate this Technology Synthesis opportunity:

OPPORTUNITY: {{title}}
DESCRIPTION: {{description}}
TECHNOLOGIES COMBINED: {{technologies}}
PROBLEM SOLVED: {{problem}}
SYNTHESIS APPROACH: {{synthesisApproach}}
NOVELTY FACTOR: {{noveltyFactor}}

Evaluate:
1. Is this combination truly novel?
2. Are there similar solutions in the market?
3. What's the innovation score (0-100)?
4. What improvements would make this more innovative?`,

  technical: `As the Technical Architect SME, evaluate this Technology Synthesis opportunity:

OPPORTUNITY: {{title}}
TECHNOLOGIES: {{technologies}}
SYNTHESIS APPROACH: {{synthesisApproach}}

Evaluate:
1. Technical feasibility (0-100)
2. Integration challenges
3. Key technical risks
4. Recommended architecture approach
5. Time and cost estimates`,

  strategy: `As the Strategy SME, evaluate this Technology Synthesis opportunity:

OPPORTUNITY: {{title}}
PROBLEM: {{problem}}
TARGET MARKET: {{targetMarket}}
MARKET SIZE: {{marketSize}}

Evaluate:
1. Market positioning score (0-100)
2. Competitive landscape
3. Go-to-market strategy recommendations
4. Partnership opportunities
5. Revenue model suggestions`,

  cos: `As Chief of Staff, validate this Technology Synthesis opportunity against user standards:

OPPORTUNITY: {{title}}
DESCRIPTION: {{description}}
OVERALL SCORE: {{overallScore}}

Based on the user's known preferences and thinking patterns:
1. Does this align with how the user approaches opportunities?
2. Does it meet the user's quality standards?
3. Is the presentation format appropriate?
4. What would the user want to see differently?
5. Should this be presented to the user? (yes/no with reasoning)`,
};
