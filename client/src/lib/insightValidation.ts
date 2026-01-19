/**
 * Insight Validation Engine
 * 
 * Provides Chief of Staff QA validation, reference tracking, citation management,
 * and truth verification for all AI Expert outputs.
 */

// ============================================================================
// TYPES
// ============================================================================

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'speculative';
export type SourceType = 'primary' | 'secondary' | 'expert_opinion' | 'derived' | 'unverified';
export type VerificationStatus = 'verified' | 'pending' | 'challenged' | 'unverified' | 'rejected';

export interface Reference {
  id: string;
  projectId: string;
  title: string;
  type: 'financial_model' | 'contract' | 'quote' | 'research_paper' | 'legal_document' | 'data_source' | 'expert_statement' | 'other';
  sourceUrl?: string;
  documentId?: string; // Link to Library document
  excerpt?: string;
  dateAccessed: string;
  datePublished?: string;
  author?: string;
  organization?: string;
  verificationStatus: VerificationStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
}

export interface Citation {
  id: string;
  referenceId: string;
  insightId: string;
  pageNumber?: string;
  section?: string;
  quote?: string;
  excerpt?: string;
  confidence: ConfidenceLevel;
  sourceType: SourceType;
  createdAt: string;
}

export interface Insight {
  id: string;
  expertId: string;
  expertName: string;
  projectId: string;
  content: string;
  type: 'fact' | 'opinion' | 'recommendation' | 'analysis' | 'prediction';
  confidence: ConfidenceLevel;
  sourceType: SourceType;
  verificationStatus: VerificationStatus;
  citations: Citation[];
  challenges: Challenge[];
  createdAt: string;
  validatedAt?: string;
  validatedBy?: string; // 'digital_twin' | expert_id
}

export interface Challenge {
  id: string;
  insightId: string;
  challengerId: string; // 'digital_twin' or expert_id
  challengerName: string;
  question: string;
  response?: string;
  status: 'pending' | 'answered' | 'accepted' | 'rejected';
  createdAt: string;
  respondedAt?: string;
}

export interface ValidationResult {
  isValid: boolean;
  confidence: ConfidenceLevel;
  issues: ValidationIssue[];
  suggestions: string[];
  requiredReferences: string[];
}

export interface ValidationIssue {
  type: 'missing_source' | 'low_confidence' | 'unverified_claim' | 'potential_hallucination' | 'opinion_as_fact' | 'outdated_reference';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  location?: string;
}

// ============================================================================
// chief of staff QA CHALLENGE PROMPTS
// ============================================================================

export const QA_CHALLENGE_PROMPTS = {
  source_verification: [
    "What is your primary source for this statement?",
    "Can you provide a specific document or data point that supports this?",
    "Is this from a verified source or your interpretation?",
    "Where exactly did you find this information?",
  ],
  
  fact_vs_opinion: [
    "Is this a verifiable fact or your professional opinion?",
    "Would other experts in your field agree with this assessment?",
    "How would you classify this: fact, analysis, or speculation?",
    "Can this statement be independently verified?",
  ],
  
  confidence_check: [
    "On a scale of 1-10, how confident are you in this statement?",
    "What would change your assessment of this?",
    "Are there any caveats or conditions to this conclusion?",
    "What's the margin of error in this analysis?",
  ],
  
  hallucination_detection: [
    "Are you certain this is accurate, or could you be confabulating?",
    "Have you verified this against current data?",
    "Is this based on your training data or real-time information?",
    "Could you be mixing up similar but different concepts here?",
  ],
  
  cross_validation: [
    "Would [Expert Name] agree with this assessment?",
    "How does this compare to the standard industry view?",
    "Are there credible sources that contradict this?",
    "What's the opposing viewpoint on this matter?",
  ],
  
  specificity: [
    "Can you be more specific about the numbers/dates/details?",
    "What exactly do you mean by [term]?",
    "Can you break this down into verifiable components?",
    "What are the specific assumptions behind this?",
  ],
};

// ============================================================================
// TRUTH VERIFICATION SYSTEM PROMPTS
// ============================================================================

export const TRUTH_VERIFICATION_PROMPT = `
You are a rigorous fact-checker and validation assistant. Your role is to:

1. CLASSIFY every statement as:
   - FACT: Objectively verifiable, backed by data/documents
   - ANALYSIS: Logical conclusion from facts, requires reasoning chain
   - OPINION: Professional judgment, may vary between experts
   - SPECULATION: Forward-looking, uncertain, based on assumptions
   - UNKNOWN: Cannot be classified without more information

2. ASSIGN confidence levels:
   - HIGH: Multiple reliable sources, widely accepted
   - MEDIUM: Single reliable source or expert consensus
   - LOW: Limited sources, some uncertainty
   - SPECULATIVE: No direct sources, based on inference

3. IDENTIFY required references:
   - What documents would verify this?
   - What data sources should be cited?
   - What expert opinions should be cross-referenced?

4. FLAG potential issues:
   - Statements presented as facts without sources
   - Outdated information
   - Potential hallucinations or confabulations
   - Opinions presented as facts
   - Missing context or caveats

Always err on the side of caution. If uncertain, flag for human review.
`;

export const EXPERT_VALIDATION_PROMPT = (expertName: string, specialty: string) => `
As ${expertName}, an expert in ${specialty}, you must now validate your previous statements:

For each insight you provided:
1. Explicitly state whether it is FACT, ANALYSIS, OPINION, or SPECULATION
2. Provide your confidence level (HIGH/MEDIUM/LOW/SPECULATIVE)
3. List any sources or references that support this
4. Acknowledge any limitations or caveats
5. Note if this requires verification from other experts

Be intellectually honest. It's better to acknowledge uncertainty than to overstate confidence.
`;

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

export function generateChallengeQuestions(insight: Insight): string[] {
  const questions: string[] = [];
  
  // Always ask source verification
  questions.push(QA_CHALLENGE_PROMPTS.source_verification[
    Math.floor(Math.random() * QA_CHALLENGE_PROMPTS.source_verification.length)
  ]);
  
  // Check fact vs opinion
  if (insight.type === 'fact' || insight.type === 'recommendation') {
    questions.push(QA_CHALLENGE_PROMPTS.fact_vs_opinion[
      Math.floor(Math.random() * QA_CHALLENGE_PROMPTS.fact_vs_opinion.length)
    ]);
  }
  
  // Check confidence
  if (insight.confidence === 'low' || insight.confidence === 'speculative') {
    questions.push(QA_CHALLENGE_PROMPTS.confidence_check[
      Math.floor(Math.random() * QA_CHALLENGE_PROMPTS.confidence_check.length)
    ]);
  }
  
  // Hallucination check for high-stakes content
  if (insight.type === 'fact' && insight.citations.length === 0) {
    questions.push(QA_CHALLENGE_PROMPTS.hallucination_detection[
      Math.floor(Math.random() * QA_CHALLENGE_PROMPTS.hallucination_detection.length)
    ]);
  }
  
  return questions;
}

export function validateInsight(insight: Insight): ValidationResult {
  const issues: ValidationIssue[] = [];
  const suggestions: string[] = [];
  const requiredReferences: string[] = [];
  
  // Check for missing citations on factual claims
  if (insight.type === 'fact' && insight.citations.length === 0) {
    issues.push({
      type: 'missing_source',
      severity: 'critical',
      message: 'Factual claim without supporting citation',
      location: insight.content.substring(0, 50),
    });
    requiredReferences.push('Primary source document for factual claim');
  }
  
  // Check for low confidence without acknowledgment
  if (insight.confidence === 'speculative' && insight.type !== 'prediction') {
    issues.push({
      type: 'low_confidence',
      severity: 'warning',
      message: 'Speculative content not marked as prediction',
    });
    suggestions.push('Consider reframing as a prediction or adding confidence caveats');
  }
  
  // Check for unverified claims
  if (insight.verificationStatus === 'unverified' && insight.confidence === 'high') {
    issues.push({
      type: 'unverified_claim',
      severity: 'warning',
      message: 'High confidence claim not yet verified',
    });
    suggestions.push('Submit for Chief of Staff verification before finalizing');
  }
  
  // Check for potential hallucination markers
  const halluccinationMarkers = [
    'I believe', 'I think', 'probably', 'might be', 'could be',
    'as far as I know', 'to my knowledge', 'I recall',
  ];
  
  const lowerContent = insight.content.toLowerCase();
  const hasHallucinationMarkers = halluccinationMarkers.some(m => lowerContent.includes(m));
  
  if (hasHallucinationMarkers && insight.type === 'fact') {
    issues.push({
      type: 'potential_hallucination',
      severity: 'warning',
      message: 'Uncertainty language detected in factual claim',
    });
    suggestions.push('Verify this statement or reclassify as opinion/analysis');
  }
  
  // Determine overall validity
  const criticalIssues = issues.filter(i => i.severity === 'critical');
  const isValid = criticalIssues.length === 0;
  
  // Determine effective confidence
  let effectiveConfidence = insight.confidence;
  if (issues.length > 2) {
    effectiveConfidence = 'low';
  } else if (issues.length > 0 && effectiveConfidence === 'high') {
    effectiveConfidence = 'medium';
  }
  
  return {
    isValid,
    confidence: effectiveConfidence,
    issues,
    suggestions,
    requiredReferences,
  };
}

export function createChallenge(
  insightId: string,
  challengerId: string,
  challengerName: string,
  question: string
): Challenge {
  return {
    id: `challenge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    insightId,
    challengerId,
    challengerName,
    question,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
}

export function createReference(
  projectId: string,
  data: Partial<Reference>
): Reference {
  return {
    id: `ref-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    projectId,
    title: data.title || 'Untitled Reference',
    type: data.type || 'other',
    sourceUrl: data.sourceUrl,
    documentId: data.documentId,
    excerpt: data.excerpt,
    dateAccessed: new Date().toISOString(),
    datePublished: data.datePublished,
    author: data.author,
    organization: data.organization,
    verificationStatus: 'pending',
    notes: data.notes,
  };
}

export function createCitation(
  referenceId: string,
  insightId: string,
  data: Partial<Citation>
): Citation {
  return {
    id: `cite-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    referenceId,
    insightId,
    pageNumber: data.pageNumber,
    section: data.section,
    quote: data.quote,
    excerpt: data.excerpt,
    confidence: data.confidence || 'medium',
    sourceType: data.sourceType || 'secondary',
    createdAt: new Date().toISOString(),
  };
}

// ============================================================================
// CITATION FORMATTING
// ============================================================================

export function formatCitationFootnote(citation: Citation, reference: Reference): string {
  const parts: string[] = [];
  
  if (reference.author) {
    parts.push(reference.author);
  }
  
  parts.push(`"${reference.title}"`);
  
  if (reference.organization) {
    parts.push(reference.organization);
  }
  
  if (reference.datePublished) {
    parts.push(new Date(reference.datePublished).getFullYear().toString());
  }
  
  if (citation.pageNumber) {
    parts.push(`p. ${citation.pageNumber}`);
  }
  
  if (citation.section) {
    parts.push(`§${citation.section}`);
  }
  
  return parts.join(', ');
}

export function formatCitationInline(citation: Citation, reference: Reference, index: number): string {
  if (reference.author) {
    const lastName = reference.author.split(' ').pop();
    const year = reference.datePublished 
      ? new Date(reference.datePublished).getFullYear() 
      : 'n.d.';
    return `(${lastName}, ${year})`;
  }
  return `[${index + 1}]`;
}

export function generateReferenceTable(references: Reference[]): string {
  let table = '## References\n\n';
  table += '| # | Title | Type | Source | Status |\n';
  table += '|---|-------|------|--------|--------|\n';
  
  references.forEach((ref, index) => {
    const statusEmoji = {
      verified: '✅',
      pending: '⏳',
      challenged: '⚠️',
      unverified: '❓',
      rejected: '❌',
    }[ref.verificationStatus];
    
    table += `| ${index + 1} | ${ref.title} | ${ref.type} | ${ref.organization || ref.author || 'Unknown'} | ${statusEmoji} ${ref.verificationStatus} |\n`;
  });
  
  return table;
}

// ============================================================================
// CONFIDENCE INDICATORS
// ============================================================================

export const CONFIDENCE_INDICATORS = {
  high: {
    label: 'High Confidence',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    icon: '✓✓',
    description: 'Multiple reliable sources, widely accepted',
  },
  medium: {
    label: 'Medium Confidence',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    icon: '✓',
    description: 'Single reliable source or expert consensus',
  },
  low: {
    label: 'Low Confidence',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    icon: '?',
    description: 'Limited sources, some uncertainty',
  },
  speculative: {
    label: 'Speculative',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    icon: '??',
    description: 'No direct sources, based on inference',
  },
};

export const SOURCE_TYPE_LABELS = {
  primary: { label: 'Primary Source', description: 'Original document, data, or firsthand account' },
  secondary: { label: 'Secondary Source', description: 'Analysis or interpretation of primary sources' },
  expert_opinion: { label: 'Expert Opinion', description: 'Professional judgment from qualified expert' },
  derived: { label: 'Derived', description: 'Conclusion drawn from multiple sources' },
  unverified: { label: 'Unverified', description: 'Source not yet validated' },
};

export const VERIFICATION_STATUS_LABELS = {
  verified: { label: 'Verified', color: 'text-green-500', icon: '✅' },
  pending: { label: 'Pending Review', color: 'text-yellow-500', icon: '⏳' },
  challenged: { label: 'Challenged', color: 'text-orange-500', icon: '⚠️' },
  unverified: { label: 'Unverified', color: 'text-gray-500', icon: '❓' },
  rejected: { label: 'Rejected', color: 'text-red-500', icon: '❌' },
};
